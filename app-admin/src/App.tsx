import React from 'react';
import { Admin, Resource, bwDarkTheme, bwLightTheme } from 'react-admin';
import { authProvider } from './auth/authProvider';
import { CustomLoginPage } from './auth/LoginPage';
import { MyLayout } from './layout/MyLayout';
import Dashboard from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';
import { AdminUserList, AdminUserCreate, AdminUserEdit } from './users/AdminUsers';

// You might want to use a more appropriate icon
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { KycPendingList } from './guides/KycPendingList';


// Import the resource objects
import guides from './guides';
import customers from './customers';
import consultations from './Consultations';

import {
    Users,
    LifeBuoy,
    ClipboardList,
    UserCircle,
    ShoppingCart,
} from 'lucide-react';
import { OrderList } from './orders/Orders';

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
            name="admin-users"
             list={AdminUserList}
            create={AdminUserCreate}
            edit={AdminUserEdit}
            icon={AdminPanelSettingsIcon}
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
            list={OrderList} 
            // create={OrderCreate} 
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