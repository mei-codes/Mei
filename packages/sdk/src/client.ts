import { OdinHttpError, OdinNetworkError } from "./errors.js";
import { HealthResponseSchema } from "./schemas.js";
import type { ClientOptions, HealthResponse } from "./types.js";

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
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/api/health`, {
        headers: this.headers,
      });
    } catch (err) {
      throw new OdinNetworkError("failed to reach odin", err);
    }
    if (!res.ok) {
      throw new OdinHttpError(`health ${res.status}`, res.status);
    }
    return HealthResponseSchema.parse(await res.json());
  }
}
