import { useState } from 'react';

/**
 * A custom React hook that provides state persistence in Local Storage.
 * It behaves identically to React's `useState` hook, but synchronizes
 * the value with the browser's `localStorage`.
 *
 * @template T
 * @param {string} key - The key under which the data is stored in Local Storage.
 * @param {T | (() => T)} initialValue - The initial value to use if no value is stored yet. Can be a value or an initializer function.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A stateful value and a function to update it.
 */
export default function useLocalStorage(key, initialValue) {
  // Read from localStorage on initialization
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        // If key exists, parse it; otherwise use the initial value
        if (item !== null) {
          try {
            return JSON.parse(item);
          } catch (parseError) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, parseError);
            // Fall back to initial value on parse error
          }
        }
      }
    } catch (e) {
      console.warn(`Local Storage is not accessible or available for reading key "${key}":`, e);
    }
    
    // Evaluate initialValue if it is a function, otherwise return it
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  /**
   * Sets the state value and synchronizes it with Local Storage.
   *
   * @param {T | ((val: T) => T)} value - The new value or an updater function.
   */
  const setValue = (value) => {
    try {
      // Determine the next state value (handle function updates)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state
      setStoredValue(valueToStore);
      
      // Update Local Storage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
