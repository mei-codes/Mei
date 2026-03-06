export interface ClientOptions {
  baseUrl: string;
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  userAgent?: string;
}

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentRequest {
  prompt: string;
  messages?: AgentMessage[];
  model?: string;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface AgentResponse {
  ok: true;
  createdAt: string;
  title: string;
  answer: string;
}

export interface HealthResponse {
  ok: boolean;
  name: string;
  version: string;
  runtime: string;
  provider: string;
  protected: boolean;
}
