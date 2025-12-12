"use client";

import * as React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch {
      // ignore
    }
  }, [key]);

  const setStoredValue = React.useCallback(
    (val: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const nextValue = typeof val === "function" ? (val as (prev: T) => T)(prev) : val;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // ignore write errors
        }
        return nextValue;
      });
    },
    [key]
  );

  return [value, setStoredValue] as const;
}
