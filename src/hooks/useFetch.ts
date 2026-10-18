"use client";
import {useState, useEffect, useCallback, useRef, useMemo} from "react";
import type {VelocityConfig, VelocityResponse} from "velocity-http";

type VelocityMethod =
  | ((url: string, config?: VelocityConfig) => Promise<VelocityResponse<any>>)
  | ((
      url: string,
      data?: any,
      config?: VelocityConfig,
    ) => Promise<VelocityResponse<any>>);

interface FetchPayloadType<T, R> {
  client: VelocityMethod;
  url: string;
  options?: VelocityConfig;
  body?: T;
  manual?: boolean;
  dontCall?: boolean;
  onSuccess?: (data: R) => void;
}

export const useFetch = <R = unknown, T = unknown>({
  client,
  url,
  options,
  body,
  manual = false,
  dontCall = false,
  onSuccess,
}: FetchPayloadType<T, R>) => {
  const [data, setData] = useState<R | null>(null);
  const [loading, setLoading] = useState<boolean>(!manual && !dontCall);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const optionsKey = useMemo(() => JSON.stringify(options), [options]);
  const bodyKey = useMemo(() => JSON.stringify(body), [body]);
  const onSuccessRef = useRef(onSuccess);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const fetchData = useCallback(
    async (overrides?: VelocityConfig) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const finalConfig = {
          ...options,
          ...overrides,
          signal: controller.signal,
        };
        let response;

        if (body !== undefined) {
          response = await (client as (...args: unknown[]) => Promise<VelocityResponse<any>>)(url, body, finalConfig);
        } else {
          response = await (client as (...args: unknown[]) => Promise<VelocityResponse<any>>)(url, finalConfig);
        }
        
        if(!response.data?.success){
          setError(response.data?.message);
        }
        
        if (!controller.signal.aborted) {
          const result = response?.data ?? null;
          setData(result as R);
          if (response.data?.success && onSuccessRef.current) {
            onSuccessRef.current(result as R);
          }
        }
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (
          errorObj.name !== "AbortError" &&
          errorObj.name !== "CancelError" &&
          !controller.signal.aborted
        ) {
          const msg = errorObj.message || "Something went wrong";
          setError(msg);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [client, url, optionsKey, bodyKey],
  );

  useEffect(() => {
     
    if (!manual && !dontCall) fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData, manual, dontCall]);

  return {data, loading, error, refetch: fetchData};
};
