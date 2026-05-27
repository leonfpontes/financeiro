"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchResult<T> {
  data: T[];
  loading: boolean;
  reload: () => void;
}

/**
 * Fetches a JSON array from a URL and exposes loading state and a reload function.
 * Expects the API to return { data: T[] } (the project standard ApiResponse shape).
 */
export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { setData(res.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [url]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, reload };
}
