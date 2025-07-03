// src/layout/MyLayout.tsx
import { Layout } from 'react-admin';
import { MyAppBar } from './MyAppBar';

export const MyLayout = (props: any) => (
    <Layout
        {...props}
        appBar={MyAppBar}
        sx={{
            // This is the critical fix.
            // It targets the main content area and makes it transparent.
            '& .RaLayout-content': {
                backgroundColor: 'transparent',
            },
        }}
    />
);