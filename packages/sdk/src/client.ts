import {
  OdinHttpError,
  OdinNetworkError,
  OdinRateLimitError,
  OdinValidationError,
} from "./errors.js";
import {
  AgentResponseSchema,
  ErrorBodySchema,
  HealthResponseSchema,
} from "./schemas.js";
import type {
  AgentRequest,
  AgentResponse,
  ClientOptions,
  HealthResponse,
} from "./types.js";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_USER_AGENT = "odin-sdk/0.1.0";

export class OdinClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly timeoutMs: number;
  private readonly headers: Record<string, string>;

  constructor(options: ClientOptions) {
    if (!options.baseUrl) {
      throw new Error("OdinClient: baseUrl is required");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.headers = {
      "content-type": "application/json",
      "user-agent": options.userAgent ?? DEFAULT_USER_AGENT,
      ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
      ...(options.defaultHeaders ?? {}),
    };
  }

  async health(signal?: AbortSignal): Promise<HealthResponse> {
    const raw = await this.request("/api/health", { method: "GET", signal });
    const parsed = HealthResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new OdinValidationError(
        "health response failed validation",
        parsed.error.issues,
      );
    }
    return parsed.data;
  }

  async ask(request: AgentRequest): Promise<AgentResponse> {
    const { signal, ...payload } = request;
    const raw = await this.request("/api/agent", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
    const parsed = AgentResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new OdinValidationError(
        "agent response failed validation",
        parsed.error.issues,
      );
    }
    return parsed.data;
  }

  private async request(
    path: string,
    init: RequestInit & { signal?: AbortSignal },
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const composite = composeSignals(init.signal, controller.signal);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers: { ...this.headers, ...(init.headers as Record<string, string> | undefined) },
        signal: composite,
      });
    } catch (cause) {
      if ((cause as { name?: string })?.name === "AbortError") {
        throw new OdinNetworkError("request aborted or timed out", cause);
      }
      throw new OdinNetworkError("network error reaching odin", cause);
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    const data = text.length > 0 ? safeJson(text) : undefined;
    if (!response.ok) {
      throw toHttpError(response, data);
    }
    return data;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toHttpError(response: Response, data: unknown): OdinHttpError {
  const body = ErrorBodySchema.safeParse(data);
  const code = body.success ? body.data.error.code : undefined;
  const message = body.success
    ? body.data.error.message
    : `odin returned ${response.status}`;
  const details = body.success ? body.data.error.details : data;

  if (response.status === 429) {
    const retry = response.headers.get("retry-after");
    return new OdinRateLimitError(
      message,
      response.status,
      retry ? Number.parseInt(retry, 10) : undefined,
    );
  }
  return new OdinHttpError(message, response.status, code, details);
}

function composeSignals(
  external: AbortSignal | undefined,
  internal: AbortSignal,
): AbortSignal {
  if (!external) return internal;
  if (external.aborted) return external;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  external.addEventListener("abort", onAbort, { once: true });
  internal.addEventListener("abort", onAbort, { once: true });
  return controller.signal;
}
