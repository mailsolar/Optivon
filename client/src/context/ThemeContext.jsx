import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        console.warn('[useTheme] Context not available, returning fallback');
        return {
            theme: 'dark',
            toggleTheme: () => { }
        };
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Default to 'dark' if no preference, or check system preference
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('optivon-theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme class
        root.classList.remove('light', 'dark');

        // Add new theme class
        root.classList.add(theme);

        // Save preference
        localStorage.setItem('optivon-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

