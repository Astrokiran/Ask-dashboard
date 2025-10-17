// src/layout/MyLayout.tsx
import { Layout } from 'react-admin';
import { MyAppBar } from './MyAppBar';
import { MyMenu } from './MyMenu'; // Import the new menu

export const MyLayout = (props: any) => <Layout {...props} appBar={MyAppBar} menu={MyMenu} />;