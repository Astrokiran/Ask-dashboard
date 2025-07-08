import React from 'react';
import { Admin, Resource, bwDarkTheme, bwLightTheme } from 'react-admin';
import { authProvider } from './auth/authProvider';
import { CustomLoginPage } from './auth/LoginPage';
import { MyLayout } from './layout/MyLayout';
import Dashboard from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';
import { UserProfile } from './users/UserProfile';
import { KycPendingList } from './guides/KycPendingList';

// Import the resource objects
import guides from './guides';
import customers from './customers';
import orders from './orders';
import consultations from './Consultations';

import {
    Users,
    LifeBuoy,
    ClipboardList,
    UserCircle,
    ShoppingCart,
} from 'lucide-react';

const App: React.FC = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        theme={bwLightTheme}
        darkTheme={bwDarkTheme}
        loginPage={CustomLoginPage}
        dashboard={Dashboard}
        layout={MyLayout}
    >
        <Resource
            name="users"
            list={UserProfile}
            icon={UserCircle}
            options={{ label: 'My Profile' }}
        />
        {/* The "guides" resource now serves as the main entry */}
        <Resource
            name="guides"
            {...guides}
            icon={LifeBuoy}
        />
        <Resource
            name="customers"
            {...customers}
            icon={Users}
        />
        <Resource
            name="orders"
            {...orders}
            icon={ShoppingCart}
        />
        <Resource
            name="consultations"
            {...consultations}
            icon={ClipboardList}
        />
        <Resource
            name="pending-verifications"
            list={KycPendingList}
        />
    </Admin>
);

export default App;