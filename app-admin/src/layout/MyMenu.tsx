// src/layout/MyMenu.tsx
import * as React from 'react';
import { useState } from 'react';
import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import {
    Users,
    BookOpen,
    ClipboardList,
    UserCircle,
    ShoppingCart,
    FileText,
    Gift,
    Wallet,
    History,
} from 'lucide-react';
import { Box, Collapse, ListItemIcon, ListItemText, Typography } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';

const SubMenu = ({ handleToggle, isOpen, name, icon, children }) => {
    const [sidebarIsOpen] = useSidebarState();

    return (
        <>
            <MenuItemLink
                onClick={handleToggle}
                to="#" // This prevents navigation when clicking the main menu item
                primaryText={name}
                leftIcon={icon}
                rightIcon={<ExpandMore sx={{ transform: isOpen ? 'rotate(-180deg)' : 'none' }} />} // Arrow icon
            />
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box
                    component="div"
                    sx={{
                        paddingLeft: sidebarIsOpen ? 4 : 2, // Indent the submenu items
                    }}
                >
                    {children}
                </Box>
            </Collapse>
        </>
    );
};


export const MyMenu = () => {
    const [openOrdersMenu, setOpenOrdersMenu] = useState(false);
    const [openGuidesMenu, setOpenGuidesMenu] = useState(false);
    const [openGuideFinancialsMenu, setOpenGuideFinancialsMenu] = useState(false);

    const handleOrdersToggle = () => {
        setOpenOrdersMenu(!openOrdersMenu);
    };

    const handleGuidesToggle = () => {
        setOpenGuidesMenu(!openGuidesMenu);
    };

    const handleGuideFinancialsToggle = () => {
        setOpenGuideFinancialsMenu(!openGuideFinancialsMenu);
    };

    return (
        <Menu>
            <Menu.DashboardItem />
            <Menu.Item to="/admin-users" primaryText="Admin Users" leftIcon={<UserCircle />} />
            <Menu.Item to="/customers" primaryText="Customers" leftIcon={<Users />} />
            <Menu.Item to="/consultations" primaryText="Consultations" leftIcon={<ClipboardList />} />
            {/* <Menu.Item to="/offers" primaryText="Offers" leftIcon={<Gift />} /> */} 
            {/* Orders Submenu */}
            <SubMenu
                handleToggle={handleOrdersToggle}
                isOpen={openOrdersMenu}
                name="Orders"
                icon={<ShoppingCart />}
            >
                <Menu.Item to="/payment-orders" primaryText="Payment Orders" leftIcon={<ShoppingCart />} />
                <Menu.Item to="/consultation-orders" primaryText="Consultation Orders" leftIcon={<FileText />} />
            </SubMenu>

            {/* Guides Submenu */}
            <SubMenu
                handleToggle={handleGuidesToggle}
                isOpen={openGuidesMenu}
                name="Guides"
                icon={<BookOpen />}
            >
                <Menu.Item to="/guides" primaryText="All Guides" leftIcon={<BookOpen />} />
                <Menu.Item to="/pending-verifications" primaryText="Guide Onboardings" leftIcon={<FileText />} />
            </SubMenu>

            {/* Guide Financials Submenu */}
            <SubMenu
                handleToggle={handleGuideFinancialsToggle}
                isOpen={openGuideFinancialsMenu}
                name="Guide Financials"
                icon={<Wallet />}
            >
                <Menu.Item to="/guide-earnings" primaryText="Earnings & Wallet" leftIcon={<Wallet />} />
                <Menu.Item to="/guide-orders" primaryText="Completed Orders" leftIcon={<History />} />
            </SubMenu>
        </Menu>
    );
};