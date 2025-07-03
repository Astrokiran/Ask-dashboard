import React from 'react';
import { AppBar, UserMenu, useLogout } from 'react-admin';
import { Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const MyUserMenu: React.FC = () => {
    const logout = useLogout();
    return <UserMenu><Button onClick={() => logout()} startIcon={<LogoutIcon />}>Logout</Button></UserMenu>;
};

export const MyAppBar: React.FC<any> = (props) => {
    return (
        <AppBar {...props} userMenu={<MyUserMenu />}>
            <Typography
                variant="h6"
                color="inherit"
                sx={{
                    flex: 1, // This allows the title to take up available space
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                }}
                id="react-admin-title"
            >
                Admin Dashboard
            </Typography>
        </AppBar>
    );
};

