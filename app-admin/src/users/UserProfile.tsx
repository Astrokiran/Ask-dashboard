import React from 'react';
import { List, Datagrid, TextField, FunctionField } from 'react-admin';
import { Chip } from '@mui/material';

// A custom component to render the status with a colored chip
const StatusField = (props: { record?: any }) => {
    const { record } = props;
    if (!record) return null;
    return (
        <Chip 
            label={record.status} 
            color={record.status === 'Verified' ? 'success' : 'error'} 
            size="small" 
        />
    );
};

export const UserProfile = () => (
    <List 
        title="User Profile" 
        resource="users" 
        actions={false} // We don't need actions like 'Create' on this page
        pagination={false} // No pagination needed for a single item
    >
        <Datagrid bulkActionButtons={false}>
            <TextField source="email" label="Logged-in Email" />
            <FunctionField label="Access Status" render={(record: any) => <StatusField record={record} />} />
        </Datagrid>
    </List>
);