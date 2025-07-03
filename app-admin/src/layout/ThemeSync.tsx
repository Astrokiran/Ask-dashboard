// src/layout/ThemeSync.tsx
import { useTheme } from 'react-admin';
import { useEffect } from 'react';

export const ThemeSync = () => {
    const [mode] = useTheme();

    useEffect(() => {
        const root = window.document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [mode]);

    return null;
};