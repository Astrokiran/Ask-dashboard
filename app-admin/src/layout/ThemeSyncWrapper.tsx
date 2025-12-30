import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

/**
 * ThemeSyncWrapper component
 *
 * Bridges React-Admin's Material-UI theme with shadcn/ui CSS variable theme.
 * When React-Admin's theme changes, this component adds/removes the 'dark' class
 * from the document root, enabling shadcn/ui components (Card, Table, Badge, etc.)
 * to properly respect the dark mode.
 */
export const ThemeSyncWrapper = ({ children }: { children: React.ReactNode }) => {
    const theme = useTheme();

    useEffect(() => {
        // Check if the current theme is dark
        const isDark = theme.palette.mode === 'dark';

        // Add or remove the 'dark' class from the document root
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        console.log('Theme sync:', isDark ? 'dark' : 'light');
    }, [theme]);

    return <>{children}</>;
};
