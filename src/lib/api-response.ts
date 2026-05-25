export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export function ok<T>(data: T) {
  return { data };
}

export function fail(
  code: string,
  message: string,
  _status = 400,
  details?: Record<string, string[]>
) {
  const error: ApiError = { code, message, ...(details && { details }) };
  return { error };
}
