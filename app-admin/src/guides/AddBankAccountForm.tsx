// src/guides/AddBankAccountForm.tsx

import { useState } from 'react';
import { useNotify } from 'react-admin';
import { httpClient } from '../dataProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import { CircularProgress } from '@mui/material';

const API_URL = 'http://localhost:8082/api/v1';

interface AddBankAccountFormProps {
    guideId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddBankAccountForm = ({ guideId, isOpen, onClose, onSuccess }: AddBankAccountFormProps) => {
    const [formData, setFormData] = useState({
        account_holder_name: '',
        account_number: '',
        bank_name: '',
        ifsc_code: '',
    });
    const [loading, setLoading] = useState(false);
    const notify = useNotify();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.account_holder_name || !formData.account_number || !formData.bank_name || !formData.ifsc_code) {
            notify('All fields are required.', { type: 'warning' });
            setLoading(false);
            return;
        }

        try {
            await httpClient(`${API_URL}/guides/${guideId}/accounts`, {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            notify('Bank account added successfully!', { type: 'success' });
            onSuccess(); // This will trigger the data refresh on the parent page
            onClose(); // This will close the dialog
        } catch (error: any) {
            const errorMessage = error.body?.message || error.message || 'An unknown error occurred.';
            notify(`Error: ${errorMessage}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Bank Account</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new bank account. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account_holder_name" className="text-right">Holder Name</Label>
                            <Input id="account_holder_name" name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account_number" className="text-right">Account No.</Label>
                            <Input id="account_number" name="account_number" value={formData.account_number} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bank_name" className="text-right">Bank Name</Label>
                            <Input id="bank_name" name="bank_name" value={formData.bank_name} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ifsc_code" className="text-right">IFSC Code</Label>
                            <Input id="ifsc_code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};