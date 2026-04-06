class ApiError extends Error {
  statusCode: number;
  errors: any[];
  success: boolean;
  data: null;

  constructor(
    message: string = "Something went wrong",
    statusCode: number,
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  static badRequest(message = "Bad Request", errors?: any[]) {
    return new ApiError(message, 400, errors);
  }
  
  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(message, 404);
  }

  static conflict(message = "Conflict", errors?: any[]) {
    return new ApiError(message, 409, errors);
  }

  static validationError(
    message = "Validation failed",
    errors?: any[]
  ) {
    return new ApiError(message, 422, errors);
  }

  static internalError(message = "Internal server error") {
    return new ApiError(message, 500);
  }
}

export { ApiError };
