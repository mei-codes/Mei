export class OdinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OdinError";
  }
}

export class OdinNetworkError extends OdinError {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "OdinNetworkError";
  }
}

export class OdinHttpError extends OdinError {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "OdinHttpError";
  }
}

export class OdinRateLimitError extends OdinHttpError {
  constructor(
    message: string,
    status: number,
    public retryAfterSeconds?: number,
  ) {
    super(message, status, "rate_limited");
    this.name = "OdinRateLimitError";
  }
}

export class OdinValidationError extends OdinError {
  constructor(message: string, public issues: unknown) {
    super(message);
    this.name = "OdinValidationError";
  }
}
