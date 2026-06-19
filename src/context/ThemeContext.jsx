import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * Context to manage the application's global theme (Dark vs Light mode).
 * @type {React.Context}
 */
export const ThemeContext = createContext(undefined);

/**
 * Provider component that wraps the app and provides theme state.
 * It also automatically applies the 'dark' CSS class to the HTML document element.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('startup-crm-theme', false);

  // Apply or remove the 'dark' class on the document root whenever the state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Toggles the current theme between light and dark mode.
   * @returns {void}
   */
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to securely consume the ThemeContext.
 * 
 * @throws {Error} If called outside of a ThemeProvider
 * @returns {{ isDarkMode: boolean, toggleTheme: function }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
