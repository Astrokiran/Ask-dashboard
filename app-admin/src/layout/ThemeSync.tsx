// src/layout/mytheme.ts
import { defaultTheme } from 'react-admin';

export const myTheme = {
    ...defaultTheme,
    components: {
        ...defaultTheme.components,
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    // add a border to the left of the active menu item
                    '&.RaMenuItemLink-active': {
                        borderLeft: '3px solid #4f3cc9',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                // Add a bottom border to the app bar
                root: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.04), 0px 1px 10px 0px rgba(0,0,0,0.08)',
                },
            },
        },
    },
};