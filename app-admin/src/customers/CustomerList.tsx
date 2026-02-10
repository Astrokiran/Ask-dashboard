import {
    List,
    useListContext,
    TopToolbar,
    FilterButton,
    TextInput,
    DateField,
    useNotify,
    useRefresh,
    useCreate,
    Datagrid,
    TextField,
    useRecordContext,
} from 'react-admin';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    TextField as MuiTextField,
} from '@mui/material';
import { FormEvent, useState } from 'react';

const customerFilters = [
    <TextInput
        label="Customer ID"
        source="customer_id"
        placeholder="Enter exact customer ID (e.g., 185)"
    />,
    <TextInput
        label="Phone Number"
        source="phone_number"
        placeholder="Enter phone number (e.g., 9929999992)"
    />,
    <TextInput
        label="Profile Name"
        source="profile_name"
        placeholder="Enter profile name"
    />,
];

const NewCustomerForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [areaCode, setAreaCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [source, setSource] = useState('admin-dashboard');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!areaCode || !phoneNumber) {
            alert('Area Code and Phone Number are required.');
            return;
        }
        onSave({ area_code: areaCode, phone_number: phoneNumber, source: source });
    };

    return (
       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                    Area Code *
                </label>
                <MuiTextField
                    value={areaCode}
                    onChange={e => setAreaCode(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                />
            </div>
            <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                    Phone Number (10 digits) *
                </label>
                <MuiTextField
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                />
            </div>
            <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                    Source *
                </label>
                <MuiTextField
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    helperText="The source where this customer was created from"
                />
            </div>
            <Button type="submit" disabled={saving} variant="contained" sx={{ mt: 1 }}>
                {saving ? 'Saving...' : 'Save Customer'}
            </Button>
        </form>
    );
}

const ListActions = () => {
    const [open, setOpen] = useState(false);
    const [create, { isLoading }] = useCreate();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleSave = (data: any) => {
        create('customers', { data }, {
            onSuccess: () => {
                notify('Customer created successfully');
                setOpen(false);
                refresh();
            },
            onError: (error: unknown) => {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                notify(`Error: ${message}`, { type: 'error' });
            }
        });
    };

    return (
        <TopToolbar>
            <FilterButton />
            <Button variant="contained" onClick={() => setOpen(true)}>
                Add New Customer
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm">
                <DialogTitle>Create a New Customer</DialogTitle>
                <DialogContent>
                    <NewCustomerForm onSave={handleSave} saving={isLoading} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </TopToolbar>
    );
};


const CustomerListView = () => {
    const { data, isLoading } = useListContext();
    if (isLoading) return <div>Loading...</div>;
    if (!data) return null;

    return (
        <Datagrid
            rowClick="show"
            sx={{
                '& .RaDatagrid-headerCell': {
                    fontWeight: 'bold',
                },
            }}
        >
            <TextField source="id" label="Customer ID" />
            <TextField source="name" label="Name" />
            <TextField source="phone" label="Phone Number" />
            <DateField source="created_at" showTime label="Created At" />
        </Datagrid>
    );
};

export const CustomerList = () => (
    <List
        actions={<ListActions />}
        filters={customerFilters}
        title="Customers"
        perPage={25}
    >
        <CustomerListView />
    </List>
);