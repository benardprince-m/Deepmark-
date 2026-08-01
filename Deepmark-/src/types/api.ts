export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface AuthTokens {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
