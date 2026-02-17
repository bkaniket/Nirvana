"use client";

import { useState, useCallback } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ?? "";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: BodyInit | null;
  headers?: HeadersInit;
};

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T = any>(
      endpoint: string,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Unauthorized");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: options.method || "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
          body: options.body || null,
        });

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { request, loading, error };
}