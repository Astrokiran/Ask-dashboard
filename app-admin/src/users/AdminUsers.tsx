import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    BooleanField,
    DateField,
    EditButton,
    ShowButton,
    Create,
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    required,
    email,
    useRecordContext,
} from 'react-admin';
import { Grid, Box, Typography } from '@mui/material';

// A filter sidebar for the list view
const AdminUserFilters = [
    <TextInput source="name" label="Search by Name" alwaysOn />,
    <TextInput source="department" label="Filter by Department" />,
    <BooleanInput source="is_active" label="Is Active?" />,
];

// --- The LIST View ---
// Displays all the admin users in a table
export const AdminUserList = () => (
    <List filters={AdminUserFilters} title="Admin Users">
        <Datagrid rowClick="edit">
            <TextField source="name" />
            <EmailField source="email" />
            <TextField source="phone_number" label="Phone Number" />
            <TextField source="department" />
            <BooleanField source="is_active" label="Active" />
            <DateField source="created_at" label="Created On" showTime />
            <Box display="flex" justifyContent="flex-end" width="100%">
                <EditButton />
                <ShowButton />
            </Box>
        </Datagrid>
    </List>
);

// --- The CREATE View ---
// Form for creating a new admin user
export const AdminUserCreate = () => (
    // FIX: The `redirect` prop is moved from SimpleForm to Create
    <Create title="Create New Admin User" redirect="list">
        <SimpleForm>
            <Typography variant="h6" gutterBottom>User Details</Typography>
            <Box display="flex" width="100%">
                <Box flex={1} mr="1em">
                    <TextInput source="name" validate={required()} fullWidth />
                    <TextInput source="phone_number" label="Phone Number" validate={required()} fullWidth />
                </Box>
                <Box flex={1} ml="1em">
                    <TextInput source="email" type="email" validate={[required(), email()]} fullWidth />
                    <TextInput source="department" fullWidth />
                </Box>
            </Box>
            <TextInput source="notes" multiline resettable fullWidth />
        </SimpleForm>
    </Create>
);

// Custom title for the Edit page to show the admin's name
const AdminUserTitle = () => {
    const record = useRecordContext();
    return <span>Editing Admin: {record ? `"${record.name}"` : ''}</span>;
};

// --- The EDIT View ---
// Form for editing an existing admin user
export const AdminUserEdit = () => (
    <Edit title={<AdminUserTitle />}>
        <SimpleForm>
            {/* FIX: The Grid component usage is corrected. It seems your environment expects the props directly. */}
            <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Profile</Typography>
                    <TextInput source="id" disabled fullWidth />
                    <TextInput source="phone_number" label="Phone Number" disabled fullWidth />
                    <TextInput source="name" validate={required()} fullWidth />
                    <TextInput source="email" type="email" validate={[required(), email()]} fullWidth />
                    <TextInput source="department" fullWidth />
                    <TextInput source="notes" multiline resettable fullWidth />
                    <BooleanInput source="is_active" label="Is this user active?" />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Audit Trail</Typography>
                    <TextInput source="created_by_phone" label="Created By (Phone)" disabled fullWidth />
                    {/* FIX: Removed invalid 'disabled' and 'fullWidth' props from DateField */}
                    <DateField source="created_at" label="Created At" showTime />
                    <TextInput source="updated_by_phone" label="Last Updated By (Phone)" disabled fullWidth />
                    <DateField source="updated_at" label="Last Updated At" showTime />
                </Grid>
            </Grid>
        </SimpleForm>
    </Edit>
);