import { NextResponse } from "next/server";

/**
 * A custom error class for API-related errors.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Handles errors within API routes, returning a standardized JSON response.
   * @param error - The error object caught.
   * @param defaultMessage - A fallback message for unexpected errors.
   * @returns A NextResponse object.
   */
  static serverError(error: any, defaultMessage = "An internal server error occurred") {
    console.error("API Server Error:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: defaultMessage }, { status: 500 });
  }
}