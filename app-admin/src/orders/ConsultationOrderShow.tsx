import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    FunctionField,
    BooleanField,
    NumberField,
    TopToolbar,
    EditButton,
    useRecordContext,
    ReferenceField,
    Labeled,
    useShowController,
} from 'react-admin';
import { Card, CardContent, Box, Typography, Grid, Paper, styled } from '@mui/material';

// Order status configurations
const ORDER_STATUSES = {
    PENDING_PAYMENT: { label: 'Pending Payment', color: '#FFA500' },
    PAYMENT_CONFIRMED: { label: 'Payment Confirmed', color: '#4CAF50' },
    RESCHEDULED: { label: 'Rescheduled', color: '#2196F3' },
    DELIVERED: { label: 'Delivered', color: '#4CAF50' },
    FEEDBACK_DELIVERED: { label: 'Feedback Delivered', color: '#9C27B0' },
    FAILED_DELIVERY: { label: 'Failed Delivery', color: '#F44336' },
    CANCELLED: { label: 'Cancelled', color: '#F44336' },
    COMPLETED: { label: 'Completed', color: '#4CAF50' },
};

// Custom Status Field Component
const OrderStatusField = ({ source }) => {
    const record = useRecordContext();
    if (!record?.status) return null;

    const statusConfig = ORDER_STATUSES[record.status.toUpperCase()];
    const statusColor = statusConfig?.color || 'default';
    const statusLabel = statusConfig?.label || record.status;

    return (
        <Box
            sx={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: statusColor,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem',
            }}
        >
            {statusLabel}
        </Box>
    );
};

// Custom Actions Component
const ConsultationOrderShowActions = () => (
    <TopToolbar>
        <EditButton />
    </TopToolbar>
);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    variant: 'h6',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
}));

// Currency formatter component
const CurrencyField = ({ source, label }) => {
    const record = useRecordContext();
    const value = record?.[source];

    if (value === null || value === undefined) {
        return <Typography variant="body2"><strong>{label}:</strong> N/A</Typography>;
    }

    return (
        <Typography variant="body2">
            <strong>{label}:</strong> {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(value)}
        </Typography>
    );
};

// Duration formatter component
const DurationField = ({ source, label }) => {
    const record = useRecordContext();
    const minutes = record?.[source];

    if (minutes === null || minutes === undefined) {
        return <Typography variant="body2"><strong>{label}:</strong> N/A</Typography>;
    }

    return (
        <Typography variant="body2">
            <strong>{label}:</strong> {minutes} minute{minutes !== 1 ? 's' : ''}
        </Typography>
    );
};

const ConsultationOrderShow = () => {
    const { record, isLoading } = useShowController();

    if (isLoading || !record) {
        return <div>Loading...</div>;
    }

    return (
        <Show actions={<ConsultationOrderShowActions />}>
            <SimpleShowLayout>
                <Grid container spacing={3}>
                    {/* Order Information */}
                    <Grid item xs={12} md={6}>
                        <StyledPaper>
                            <SectionTitle variant="h6">Order Information</SectionTitle>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Typography variant="body2">
                                    <strong>Order ID:</strong> {record?.id}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>User ID:</strong> {record?.user_id}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Consultant ID:</strong> {record?.consultant_id}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Service Type:</strong> {record?.service_type}
                                </Typography>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Status:</strong>
                                    </Typography>
                                    <OrderStatusField source="status" />
                                </Box>
                                <Typography variant="body2">
                                    <strong>Created At:</strong> {record?.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Completed At:</strong> {record?.completed_at ? new Date(record.completed_at).toLocaleString() : 'N/A'}
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    {/* Financial Information */}
                    <Grid item xs={12} md={6}>
                        <StyledPaper>
                            <SectionTitle variant="h6">Financial Information</SectionTitle>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Typography variant="body2">
                                    <strong>Price Per Minute:</strong> ₹{record?.price_per_minute || 'N/A'}
                                </Typography>
                                <CurrencyField source="total_mrp" label="Total MRP" />
                                <CurrencyField source="discount" label="Discount" />
                                <CurrencyField source="final_amount" label="Final Amount" />
                                <Typography variant="body2">
                                    <strong>Consultant Share (%):</strong> {record?.consultant_share_percent || 'N/A'}%
                                </Typography>
                                <CurrencyField source="consultant_share" label="Consultant Share" />
                                <Typography variant="body2">
                                    <strong>Consultant Paid:</strong> {record?.consultant_paid ? 'Yes' : 'No'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Consultant Payment Date:</strong> {record?.consultant_payment_date ? new Date(record.consultant_payment_date).toLocaleString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Payout ID:</strong> {record?.payout_id || 'N/A'}
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    {/* Duration Information */}
                    <Grid item xs={12} md={6}>
                        <StyledPaper>
                            <SectionTitle variant="h6">Duration Information</SectionTitle>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <DurationField source="minutes_ordered" label="Minutes Ordered" />
                                <Typography variant="body2">
                                    <strong>Seconds Ordered:</strong> {record?.seconds_ordered ?? 'N/A'}
                                </Typography>
                                <DurationField source="max_duration_minutes" label="Max Duration (Minutes)" />
                                <Typography variant="body2">
                                    <strong>Max Duration (Seconds):</strong> {record?.max_duration_seconds ?? 'N/A'}
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );
};

export default ConsultationOrderShow;