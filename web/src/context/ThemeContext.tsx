import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    storageKey?: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, storageKey = 'hapo-theme' }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(storageKey);

        return stored === 'light' || stored === 'dark'
            ? stored
            : 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem(storageKey, theme);
    }, [theme, storageKey]);

    const setTheme = (t: Theme) => setThemeState(t);
    const toggleTheme = () => setThemeState(t => (t === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}