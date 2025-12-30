import React from 'react';
import { Admin, Resource, bwDarkTheme, bwLightTheme, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { authProvider } from './auth/authProvider';
import { CustomLoginPage } from './auth/LoginPage';
import { MyLayout } from './layout/MyLayout';
import { ThemeSyncWrapper } from './layout/ThemeSyncWrapper';
import Dashboard from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';
import { AdminUserList, AdminUserCreate, AdminUserEdit } from './users/AdminUsers';

// You might want to use a more appropriate icon
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { KycPendingList } from './guides/KycPendingList';
import { GuideBankAccountsPage } from './guides/GuideBankAccountPage';
import GuideEarnings from './guides/GuideEarnings';
import GuideOrders from './guides/GuideOrders'; 


// Import the resource objects
import guides from './guides';
import customers from './customers';
import consultations from './Consultations';
// import offers from './offers'; // Temporarily disabled

import {
    Users,
    LifeBuoy,
    ClipboardList,
    UserCircle,
    ShoppingCart,
    Gift,
} from 'lucide-react';
import { OrderList } from './orders/Orders';
import { PaymentOrderList } from './orders/PaymentOrders';
import PaymentOrderShow from './orders/PaymentOrderShow';
import { ConsultationOrderList } from './orders/ConsultationOrders';
import ConsultationOrderShow from './orders/ConsultationOrderShow';

// Debug environment variables at the root level
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('All REACT_APP vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('REACT_APP_AUTH_URL:', process.env.REACT_APP_AUTH_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=====================================');

const App: React.FC = () => (
    <ThemeSyncWrapper>
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
            name="consultations"
            {...consultations}
            icon={ClipboardList}
        />
        {/* <Resource
            name="offers"
            {...offers}
            icon={Gift}
        /> */} // Temporarily disabled
        <Resource
            name="pending-verifications"
            list={KycPendingList}
        />
        <Resource
            name="payment-orders"
            list={PaymentOrderList}
            show={PaymentOrderShow}
        />
        <Resource
            name="consultation-orders"
            list={ConsultationOrderList}
            show={ConsultationOrderShow}
        />
        <CustomRoutes>
            <Route path="/guides/:id/accounts" element={<GuideBankAccountsPage />} />
            <Route path="/guide-earnings/:id" element={<GuideEarnings />} />
            <Route path="/guide-earnings" element={<GuideEarnings />} />
            <Route path="/guide-orders/:id" element={<GuideOrders />} />
            <Route path="/guide-orders" element={<GuideOrders />} />
        </CustomRoutes>
    </Admin>
    </ThemeSyncWrapper>
);

export default App;