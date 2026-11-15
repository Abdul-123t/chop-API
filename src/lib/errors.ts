export interface ErrorDetail {
  path: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: ErrorDetail[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetail[]) {
    super(400, 'validation_error', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Please sign in again.') {
    super(401, 'unauthorized', message);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many attempts. Please wait a few minutes and try again.') {
    super(429, 'rate_limited', message);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor() {
    super(413, 'payload_too_large', 'Request is too large.');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service is temporarily unavailable. Please try again shortly.') {
    super(503, 'service_unavailable', message);
  }
}
