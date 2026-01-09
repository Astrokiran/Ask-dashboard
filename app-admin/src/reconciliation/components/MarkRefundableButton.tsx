import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from '@mui/material';
import { useDataProvider, useNotify, useRefresh } from 'react-admin';

interface MarkRefundableButtonProps {
    consultationId: number;
    alreadyRefundable?: boolean;
}

export const MarkRefundableButton: React.FC<MarkRefundableButtonProps> = ({
    consultationId,
    alreadyRefundable = false,
}) => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    // Get admin user ID from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const adminUserId = user?.id;

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setReason('');
        setError('');
        setOpen(false);
    };

    const handleSubmit = async () => {
        if (!adminUserId) {
            setError('Admin user ID not found. Please log in again.');
            return;
        }

        if (!reason.trim()) {
            setError('Please provide a reason for marking this consultation as refundable.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await dataProvider.custom('markRefundable', 'consultations', {
                consultationId,
                adminUserId,
                reason: reason.trim(),
            });

            notify('Consultation marked as refundable successfully', { type: 'success' });
            refresh();
            handleClose();
        } catch (err: any) {
            console.error('Error marking consultation as refundable:', err);
            setError(err.message || 'Failed to mark consultation as refundable');
            notify('Failed to mark consultation as refundable', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                color={alreadyRefundable ? "success" : "primary"}
                onClick={handleOpen}
                size="small"
            >
                {alreadyRefundable ? 'Already Refundable' : 'Mark Refundable'}
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Mark Consultation #{consultationId} as Refundable
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Reason"
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Customer complaint - guide unresponsive"
                        required
                        helperText="Please explain why this consultation should be marked as refundable"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Mark as Refundable'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
