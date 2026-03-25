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
import { BulkNotificationPage } from './notifications/BulkNotificationPage';
import { WhatsAppSettingsPage } from './notifications/WhatsAppSettingsPage';
import { CampaignsPage } from './notifications/CampaignsPage';
import { CampaignDetailPage } from './notifications/CampaignDetailPage';
import { GuideConversionRates } from './guides/GuideConversionRates';
import { GuidePerformanceStats } from './guides/GuidePerformanceStats';


// Import the resource objects
import guides from './guides';
import customers from './customers';
import mvu from './mvu';
import consultations from './Consultations';
import offers from './offers';
import videos from './videos';
import stories from './stories';
import products from './products';
import reconciliation, { reconciliationOffers } from './reconciliation';

import {
    Users,
    LifeBuoy,
    ClipboardList,
    UserCircle,
    ShoppingCart,
    Gift,
    RefreshCw,
    Video,
    BookOpen,
    ShoppingBag,
    Wallet,
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
                name="mvu"
                {...mvu}
                icon={Wallet}
            />
            <Resource
                name="consultations"
                {...consultations}
                icon={ClipboardList}
            />
            <Resource
                name="offers"
                {...offers}
                icon={Gift}
            />
            <Resource
                name="refundable-consultations"
                {...reconciliation}
                icon={RefreshCw}
            />
            <Resource
                name="reconciliation-offers"
                {...reconciliationOffers}
                icon={Gift}
            />
            <Resource
                name="videos"
                {...videos}
                icon={Video}
            />
            <Resource
                name="stories"
                {...stories}
                icon={BookOpen}
            />
            <Resource
                name="products"
                {...products}
                icon={ShoppingBag}
            />
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
                <Route path="/notifications" element={<BulkNotificationPage />} />
                <Route path="/whatsapp-settings" element={<WhatsAppSettingsPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="/guide-conversion-rates" element={<GuideConversionRates />} />
                <Route path="/guide-performance-stats" element={<GuidePerformanceStats />} />
            </CustomRoutes>
        </Admin>
    </ThemeSyncWrapper>
);

export default App;