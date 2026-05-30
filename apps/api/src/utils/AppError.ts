import type { ErrorCode } from "../constants/http";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    isOperational = true,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
  }
}
