// src/customers/CustomerList.tsx
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
    <TextInput label="Search by Name or Phone" source="q" alwaysOn />,
];

// Reusable Customer Form for the Dialog
const NewCustomerForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [altPhone, setAltPhone] = useState('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!name || !phone) {
            alert('Name and Phone Number are required.');
            return;
        }
        onSave({ name, phone, altPhone });
    };
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div>
              <label className="text-sm font-medium capitalize">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium capitalize">Phone Number *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium capitalize">Alternative Number</label>
              <input value={altPhone} onChange={e => setAltPhone(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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
  if (isLoading || !data) return null;

  return (
    // --- THIS IS THE FIX ---
    // Changed 'bg-white' to 'bg-card' and added 'text-card-foreground'
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(customer => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>
                <DateField record={customer} source="createdAt" showTime />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const CustomerList = () => (
  <List actions={<ListActions />} filters={customerFilters} title="Customers">
    <CustomerListView />
  </List>
);