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
  ) {
    super(message);
    this.name = "OdinHttpError";
  }
}
