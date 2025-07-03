// src/theme.ts
import { defaultTheme } from 'react-admin';
import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

export const lightTheme = defaultTheme;

export const darkTheme = createTheme(
    deepmerge(defaultTheme, {
        palette: {
            mode: 'dark',
            text: {
                primary: '#fff', // Use light text in dark mode
                secondary: 'rgba(255, 255, 255, 0.7)',
            },
            background: {
                default: 'hsl(222.2, 84%, 4.9%)', // Match shadcn's background
            },
        },
    })
);