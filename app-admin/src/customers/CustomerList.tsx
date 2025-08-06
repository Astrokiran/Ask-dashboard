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
    Link,
    RecordContextProvider,
} from 'react-admin';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { FormEvent, useState } from 'react';

const customerFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
];

const NewCustomerForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [areaCode, setAreaCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!areaCode || !phoneNumber) {
            alert('Area Code and Phone Number are required.');
            return;
        }
        onSave({ area_code: areaCode, phone_number: phoneNumber });
    };
    
    return (
       <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div>
                <label className="text-sm font-medium capitalize">Area Code *</label>
                <input value={areaCode} onChange={e => setAreaCode(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium capitalize">Phone Number (10 digits) *</label>
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <Button type="submit" disabled={saving} className="mt-4">
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>Add New Customer</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Customer</DialogTitle>
                    </DialogHeader>
                    <NewCustomerForm onSave={handleSave} saving={isLoading} />
                </DialogContent>
            </Dialog>
        </TopToolbar>
    );
};


const CustomerListView = () => {
    const { data, isLoading } = useListContext();
    if (isLoading) return <div>Loading...</div>;
    if (!data) return null;

    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(customer => (
                        <RecordContextProvider value={customer} key={customer.id}>
                            <TableRow>
                                <TableCell>
                                    <Link to={`/customers/${customer.id}/show`} className="text-blue-600 hover:underline">
                                        {`#${customer.id}`}
                                    </Link>
                                </TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>
                                    <DateField source="created_at" showTime />
                                </TableCell>
                            </TableRow>
                        </RecordContextProvider>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export const CustomerList = () => (
    <List actions={<ListActions />} filters={customerFilters} title="Customers" perPage={10}>
        <CustomerListView />
    </List>
);