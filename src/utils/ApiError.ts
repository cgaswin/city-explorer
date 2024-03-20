export class ApiError extends Error {
  status: string;
  code: number;
  message!: string;
  stack!: string;
  constructor(code: number, message: string, stack?: string) {
    super(message);
    this.status = 'error';
    this.code = code;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
