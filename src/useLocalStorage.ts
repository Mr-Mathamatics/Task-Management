import { useCallback, useEffect, useState } from "react";

type Validator<T> = (value: unknown) => value is T;

/** Keeps React state in sync with localStorage while tolerating unavailable or corrupt storage. */
export function useLocalStorage<T>(key: string, fallback: T, isValid: Validator<T>) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return fallback;
      const parsed: unknown = JSON.parse(stored);
      return isValid(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be disabled or full; the app should remain usable in memory.
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(fallback), [fallback]);
  return [value, setValue, reset] as const;
}
