import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError } from '@/types/api';

export function successResponse<T>(data: T, message = 'Operation completed') {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return NextResponse.json(response, { status: 200 });
}

export function createdResponse<T>(data: T, message = 'Resource created') {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return NextResponse.json(response, { status: 201 });
}

export function errorResponse(message: string, error = 'server_error', status = 400) {
  const response: ApiError = {
    success: false,
    error,
    message
  };
  return NextResponse.json(response, { status });
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 'unauthorized', 401);
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 'forbidden', 403);
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 'not_found', 404);
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 'server_error', 500);
}
