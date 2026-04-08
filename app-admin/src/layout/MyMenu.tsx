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
    RefreshCw,
    Video,
    Film,
    Layers,
    ShoppingBag,
    MessageSquare,
    TrendingUp,
    Megaphone,
    Calendar,
    HelpCircle,
    FolderTree,
} from 'lucide-react';
import { Box, Collapse, ListItemIcon, ListItemText, Typography } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { BarChart3 } from 'lucide-react';

const SubMenu = ({
    handleToggle,
    isOpen,
    name,
    icon,
    children,
}: {
    handleToggle: () => void;
    isOpen: boolean;
    name: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}) => {
    const [sidebarIsOpen] = useSidebarState();

    return (
        <>
            <MenuItemLink
                onClick={handleToggle}
                to="#"
                leftIcon={icon}
                primaryText={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <span>{name}</span>
                        <ExpandMore
                            sx={{
                                transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </Box>
                }
            />

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box
                    component="div"
                    sx={{
                        paddingLeft: sidebarIsOpen ? 4 : 2, // Indent submenu items
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
    const [openReconciliationMenu, setOpenReconciliationMenu] = useState(false);
    const [openContentMenu, setOpenContentMenu] = useState(false);
    const [openNotificationsMenu, setOpenNotificationsMenu] = useState(false);
    const [openGuideStatsMenu, setOpenGuideStatsMenu] = useState(false);
    const [openPanchangMenu, setOpenPanchangMenu] = useState(false);
    const [openDailyAskMenu, setOpenDailyAskMenu] = useState(false);
    const [openCustomersMenu, setOpenCustomersMenu] = useState(false);

    const handleOrdersToggle = () => {
        setOpenOrdersMenu(!openOrdersMenu);
    };

    const handleGuidesToggle = () => {
        setOpenGuidesMenu(!openGuidesMenu);
    };

    const handleGuideFinancialsToggle = () => {
        setOpenGuideFinancialsMenu(!openGuideFinancialsMenu);
    };

    const handleReconciliationToggle = () => {
        setOpenReconciliationMenu(!openReconciliationMenu);
    };

    const handleContentToggle = () => {
        setOpenContentMenu(!openContentMenu);
    };

    const handleNotificationsToggle = () => {
        setOpenNotificationsMenu(!openNotificationsMenu);
    };

    const handleGuideStatsToggle = () => {
        setOpenGuideStatsMenu(!openGuideStatsMenu);
    };

    const handlePanchangToggle = () => {
        setOpenPanchangMenu(!openPanchangMenu);
    };

    const handleDailyAskToggle = () => {
        setOpenDailyAskMenu(!openDailyAskMenu);
    };
  
    const handleCustomersToggle = () => {
        setOpenCustomersMenu(!openCustomersMenu);
    };

    return (
        <Menu>
            <Menu.DashboardItem />
            <Menu.Item to="/admin-users" primaryText="Admin Users" leftIcon={<UserCircle />} />

            {/* Customers Submenu */}
            <SubMenu
                handleToggle={handleCustomersToggle}
                isOpen={openCustomersMenu}
                name="Customers"
                icon={<Users />}
            >
                <Menu.Item to="/customers" primaryText="All Customers" leftIcon={<Users />} />
                <Menu.Item to="/assistant-chat" primaryText="Chat Assistant" leftIcon={<MessageSquare />} />
            </SubMenu>

            <Menu.Item to="/mvu" primaryText="MVU Customers" leftIcon={<Wallet />} />
            <Menu.Item to="/consultations" primaryText="Consultations" leftIcon={<ClipboardList />} />
            <Menu.Item to="/offers" primaryText="Offers" leftIcon={<Gift />} />
            <Menu.Item to="/products" primaryText="Products" leftIcon={<ShoppingBag />} />

            {/* Notifications Submenu */}
            <SubMenu
                handleToggle={handleNotificationsToggle}
                isOpen={openNotificationsMenu}
                name="Notifications"
                icon={<FileText />}
            >
                <Menu.Item to="/notifications" primaryText="Bulk Notifications" leftIcon={<FileText />} />
                <Menu.Item to="/campaigns" primaryText="Campaigns" leftIcon={<Megaphone />} />
                <Menu.Item to="/whatsapp-settings" primaryText="WhatsApp Settings" leftIcon={<MessageSquare />} />
            </SubMenu>
            {/* Guide Stats Submenu */}
            <SubMenu
                handleToggle={handleGuideStatsToggle}
                isOpen={openGuideStatsMenu}
                name="Guide Stats"
                icon={<BarChart3 />}
            >
                <Menu.Item to="/guide-conversion-rates" primaryText="Conversion Rates" leftIcon={<TrendingUp />} />
                <Menu.Item to="/guide-performance-stats" primaryText="Performance Stats" leftIcon={<BarChart3 />} />
            </SubMenu>
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

            {/* Content Submenu (Videos & Stories) */}
            <SubMenu
                handleToggle={handleContentToggle}
                isOpen={openContentMenu}
                name="Content"
                icon={<Layers />}
            >
                <Menu.Item to="/videos" primaryText="Videos" leftIcon={<Video />} />
                <Menu.Item to="/stories" primaryText="Stories" leftIcon={<Film />} />
                <Menu.Item to="/panchang-videos" primaryText="Panchang Videos" leftIcon={<Calendar />} />
            </SubMenu>

            {/* Reconciliation Submenu */}
            <SubMenu
                handleToggle={handleReconciliationToggle}
                isOpen={openReconciliationMenu}
                name="Reconciliation"
                icon={<RefreshCw />}
            >
                <Menu.Item to="/refundable-consultations" primaryText="Refundable Consultations" leftIcon={<RefreshCw />} />
                <Menu.Item to="/reconciliation-offers" primaryText="Reconciliation Offers" leftIcon={<Gift />} />
            </SubMenu>

            {/* Panchang Submenu */}
            <SubMenu
                handleToggle={handlePanchangToggle}
                isOpen={openPanchangMenu}
                name="Panchang"
                icon={<Calendar />}
            >
                <Menu.Item to="/panchang-videos" primaryText="Panchang Videos" leftIcon={<Video />} />
            </SubMenu>

            {/* Daily Ask Questions Submenu */}
            <SubMenu
                handleToggle={handleDailyAskToggle}
                isOpen={openDailyAskMenu}
                name="Daily Ask Questions"
                icon={<HelpCircle />}
            >
                <Menu.Item to="/question-categories" primaryText="Categories" leftIcon={<FolderTree />} />
                <Menu.Item to="/questions" primaryText="Questions" leftIcon={<MessageSquare />} />
                <Menu.Item to="/answer-templates" primaryText="Answer Templates" leftIcon={<FileText />} />
            </SubMenu>
        </Menu>
    );
};
