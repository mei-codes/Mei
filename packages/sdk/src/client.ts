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

export class OdinClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly headers: Record<string, string>;

  constructor(options: ClientOptions) {
    if (!options.baseUrl) {
      throw new Error("OdinClient: baseUrl is required");
    }
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.headers = {
      "content-type": "application/json",
      ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
      ...(options.defaultHeaders ?? {}),
    };
  }

  async health(): Promise<HealthResponse> {
    const raw = await this.request("/api/health", { method: "GET" });
    const parsed = HealthResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new OdinValidationError("health response invalid", parsed.error.issues);
    }
    return parsed.data;
  }

  async ask(request: AgentRequest): Promise<AgentResponse> {
    const raw = await this.request("/api/agent", {
      method: "POST",
      body: JSON.stringify(request),
    });
    const parsed = AgentResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new OdinValidationError("agent response invalid", parsed.error.issues);
    }
    return parsed.data;
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers: { ...this.headers, ...(init.headers as Record<string, string> | undefined) },
      });
    } catch (cause) {
      throw new OdinNetworkError("network error reaching odin", cause);
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
