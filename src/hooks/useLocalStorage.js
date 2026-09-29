import { useState, useEffect } from 'react';

/**
 * Hook to persist and synchronize state with localStorage.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing localStorage key "${key}":`, e);
    }
  }, [key, value]);

  return [value, setValue];
}
