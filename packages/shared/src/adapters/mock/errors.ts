import type { ApiErrorCode } from "../../contracts/common";

/** Thrown by mock handlers; the adapter turns it into the backend's error envelope. */
export class MockHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    readonly headers?: Record<string, string>
  ) {
    super(message);
    this.name = "MockHttpError";
  }
}

export const errorBody = (code: ApiErrorCode, message: string, details?: Record<string, unknown>) => ({
  error: details ? { code, message, details } : { code, message },
});
