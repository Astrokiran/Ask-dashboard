// src/App.tsx
import React from 'react';
import { Admin, bwDarkTheme, bwLightTheme, Resource } from 'react-admin';
import { authProvider } from './auth/authProvider';
import { CustomLoginPage } from './auth/LoginPage';
import { MyLayout } from './layout/MyLayout';
import Dashboard from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';
import { UserProfile } from './users/UserProfile';
import consultations from './Consultations'; // Assuming this exports create, edit, etc.



// Import the resource objects
import guides from './guides';
import customers from './customers';
import orders from './orders';



import { 
    Users, 
    LifeBuoy, 
    ClipboardList, 
    UserCircle,
    ShoppingCart, // New Icon
} from 'lucide-react';
import { ConsultationList } from './Consultations/ConsultationList';

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
        <Resource 
            name="guides" 
            {...guides}
            icon={LifeBuoy}
        />
        {/* --- ADDED RESOURCES --- */}
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
            list={ConsultationList} // Correctly assign the component here
            icon={ClipboardList} 
        />
    </Admin>
);

export default App;