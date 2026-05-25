export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = { data: T } | { error: ApiError };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED";
