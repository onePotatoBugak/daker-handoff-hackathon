'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(fetchFn: () => Promise<T>): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const fnRef = useRef(fetchFn);
  useEffect(() => {
    fnRef.current = fetchFn;
  }, [fetchFn]);

  const run = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    fnRef.current()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: Error) => setState({ data: null, loading: false, error }));
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, retry: run };
}
