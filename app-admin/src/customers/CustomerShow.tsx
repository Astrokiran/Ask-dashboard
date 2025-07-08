// src/customers/CustomerShow.tsx

import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    useRecordContext,
    useNotify,
} from 'react-admin';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '../components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { FormEvent, useState } from 'react';

// --- DUMMY DATA ---
const dummyTransactions = [
    { id: 1, date: '2025-07-07T10:00:00Z', type: 'Credit', amount: 500.00, description: 'Initial wallet load' },
    { id: 2, date: '2025-07-06T15:30:00Z', type: 'Debit', amount: -150.00, description: 'Consultation with Guide A' },
    { id: 3, date: '2025-07-05T11:00:00Z', type: 'Credit', amount: 200.00, description: 'Promotional bonus' },
    { id: 4, date: '2025-07-04T09:45:00Z', type: 'Debit', amount: -50.00, description: 'Service fee' },
];

const calculateBalance = () => {
    return dummyTransactions.reduce((acc, t) => acc + t.amount, 0);
};

// --- Sub-components for the Show Page ---

// Component to add balance via a dialog
const AddBalanceForm = ({ onSave, saving }: { onSave: (data: { amount: number, notes: string }) => void, saving: boolean }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        onSave({ amount: numAmount, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div>
                <label className="text-sm font-medium">Amount (₹) *</label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g., 500"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Notes / Reason</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g., Manual recharge by admin"
                />
            </div>
            <Button type="submit" disabled={saving} className="mt-4">
                {saving ? 'Adding...' : 'Add Balance'}
            </Button>
        </form>
    );
};

// Wallet details card
const WalletCard = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!record) return null;

    const handleAddBalance = (data: { amount: number, notes: string }) => {
        setSaving(true);
        // In a real app, you would call an API here.
        // For now, we just simulate it.
        setTimeout(() => {
            console.log(`Adding ${data.amount} for customer ${record.id}. Notes: ${data.notes}`);
            notify('Balance added successfully (simulation)', { type: 'success' });
            setSaving(false);
            setOpen(false);
            // You might want to refresh the view here as well.
        }, 1000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">
                    ₹{calculateBalance().toFixed(2)}
                </p>
            </CardContent>
            <CardFooter>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Balance</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Balance to Wallet</DialogTitle>
                        </DialogHeader>
                        <AddBalanceForm onSave={handleAddBalance} saving={saving} />
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
};

// Transaction history table
const TransactionHistory = () => (
    <Card>
        <CardHeader>
            <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dummyTransactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <DateField record={tx} source="date" showTime />
                            </TableCell>
                            <TableCell>
                                <span className={tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                                    {tx.type}
                                </span>
                            </TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell className="text-right font-medium">
                                {tx.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

// Main Show Component
export const CustomerShow = () => (
    <Show>
        {/* Using a custom layout instead of SimpleShowLayout for more control */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Customer Details & Wallet */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
                    <CardContent>
                        <SimpleShowLayout record={useRecordContext()}>
                            <TextField source="name" label="Full Name" />
                            <TextField source="phone" label="Phone Number" />
                            <DateField source="createdAt" label="Customer Since" showTime />
                        </SimpleShowLayout>
                    </CardContent>
                </Card>
                <WalletCard />
            </div>

            {/* Right Column: Transaction History */}
            <div className="lg:col-span-2">
                <TransactionHistory />
            </div>
        </div>
    </Show>
);