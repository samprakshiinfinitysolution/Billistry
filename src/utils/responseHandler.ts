import { NextResponse } from "next/server";
import type { ApiResponse, ApiError } from "@/types/api";

export const handleSuccess = <T = unknown>(
  data: T = null as T,
  message = "Success",
  statusCode = 200
): NextResponse<ApiResponse<T>> =>
  NextResponse.json(
    { success: true, message, data },
    { status: statusCode }
  );

export const handleError = (
  error: unknown,
  message = "Something went wrong",
  statusCode = 500
): NextResponse<ApiError> =>
  NextResponse.json(
    {
      success: false,
      message,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Unknown error"
          : String(error) || "Unknown error",
    },
    { status: statusCode }
  );

// Validation error handler
export const handleValidationError = (
  errors: string[],
  message = "Validation failed",
  statusCode = 400
): NextResponse<ApiError> =>
  NextResponse.json(
    {
      success: false,
      message,
      error: errors.join(", "),
    },
    { status: statusCode }
  );
