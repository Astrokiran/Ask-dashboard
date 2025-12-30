import * as React from 'react';
import { useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    ChipField,
    EditButton,
    ShowButton,
    DeleteButton,
    TopToolbar,
    FilterButton,
    CreateButton,
    ExportButton,
    FilterForm,
    useListContext,
    useRecordContext,
    TextInput,
    SelectInput,
    usePermissions,
    FunctionField,
    useNotify,
    useRefresh,
    useDataProvider
} from 'react-admin';
import { Card, CardContent, Box, Typography, Paper, styled } from '@mui/material';
import { format } from 'date-fns';

// Custom styled components for better appearance
const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    variant: 'h6',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
}));

const StatusChip = styled(ChipField)(({ theme }) => ({
    '&.ra-field': {
        fontWeight: 'bold',
    },
}));

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
const OrderStatusField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    if (!record?.[source]) return <span>-</span>;

    const status = record[source];
    const statusKey = String(status).toUpperCase() as keyof typeof ORDER_STATUSES;
    const statusConfig = ORDER_STATUSES[statusKey] || { label: String(status), color: '#9E9E9E' };

    return (
        <Box
            sx={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: statusConfig?.color || '#9E9E9E',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem',
            }}
        >
            {statusConfig?.label || status}
        </Box>
    );
};

// Order Actions Component
const OrderActions = ({ record }: { record: any }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!record) return null;

    const handleAction = (action: string, data?: any) => {
        setIsLoading(true);
        dataProvider
            .custom('action', 'orders', {
                customerId: record.customer_id,
                orderId: record.id,
                action,
                data,
            })
            .then(() => {
                notify(`Order action '${action}' successful!`);
                refresh();
                setIsOpen(false);
            })
            .catch((error: any) => {
                notify(`Error: ${error.message || 'An error occurred'}`, { type: 'error' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            handleAction('cancel');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                </svg>
            </button>
            {isOpen && (
                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: 1,
                        width: 192,
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 3,
                        zIndex: 10,
                        border: 1,
                        borderColor: 'divider'
                    }}
                >
                    <Box>
                        <button
                            onClick={() => handleAction('confirm-rates')}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 16px',
                                fontSize: '0.875rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Confirm Rates
                        </button>
                        <button
                            onClick={() => handleAction('start')}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 16px',
                                fontSize: '0.875rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Start Order
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 16px',
                                fontSize: '0.875rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#d32f2f'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Cancel Order
                        </button>
                    </Box>
                </Box>
            )}
        </div>
    );
};

// Filters for the list
const ConsultationOrderFilters = [
    <TextInput source="customer_id" label="Customer ID" />,
    <SelectInput
        source="status"
        choices={Object.entries(ORDER_STATUSES).map(([key, value]) => ({
            id: key.toLowerCase(),
            name: value.label,
        }))}
    />,
    <TextInput source="service_type" label="Service Type" />,
];

// Custom List Actions
const ConsultationOrderListActions = () => {
    const { permissions } = usePermissions();
    const { data } = useListContext();

    return (
        <TopToolbar>
            <FilterButton />
            <CreateButton
                label="Create Consultation Order"
                resource="consultation-orders"
            />
            <ExportButton />
        </TopToolbar>
    );
};

// Statistics calculation function
const getOrderStats = (orders: any[]) => {
    if (orders.length === 0) {
        return {
            total: 0,
            completed: 0,
            cancelled: 0,
            pending: 0,
            completedPercentage: 0,
            cancelledPercentage: 0,
            totalRevenue: 0,
            completedRevenue: 0
        };
    }

    const completed = orders.filter(order => order.status?.toLowerCase() === 'completed').length;
    const cancelled = orders.filter(order => order.status?.toLowerCase() === 'cancelled').length;
    const pending = orders.filter(order =>
        order.status?.toLowerCase() !== 'completed' &&
        order.status?.toLowerCase() !== 'cancelled'
    ).length;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.final_amount || 0), 0);
    const completedRevenue = orders
        .filter(order => order.status?.toLowerCase() === 'completed')
        .reduce((sum, order) => sum + (order.final_amount || 0), 0);

    return {
        total: orders.length,
        completed,
        cancelled,
        pending,
        completedPercentage: orders.length > 0 ? parseFloat(((completed / orders.length) * 100).toFixed(1)) : 0,
        cancelledPercentage: orders.length > 0 ? parseFloat(((cancelled / orders.length) * 100).toFixed(1)) : 0,
        totalRevenue,
        completedRevenue
    };
};

// Main Component
const ConsultationOrderListContent = (props: any) => {
    const { data, filterValues } = useListContext();

    // Filter out mock data
    const realData = data?.filter(item => !item.is_mock) || [];

    // Calculate statistics based on filtered data
    const stats = getOrderStats(realData);

    // Show message when no customer_id is provided or when only mock data exists
    if (!filterValues.customer_id || (data?.length === 1 && data[0].is_mock)) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="h6" color="textSecondary">
                    Enter a Customer ID to view consultation orders
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Use the filter above to search for orders by customer
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Datagrid
                data={realData}
                rowClick="show"
                bulkActionButtons={false}
                {...props}
            >
                <TextField
                    source="id"
                    label="Order ID"
                    sortable={false}
                />
                <TextField
                    source="consultant_id"
                    label="Consultant ID"
                    sortable={false}
                />
                <OrderStatusField source="status" />
                <TextField
                    source="service_type"
                    label="Service Type"
                    sortable={false}
                />
                <FunctionField
                    label="Final Amount"
                    render={(record) => {
                        if (!record?.final_amount && record?.final_amount !== 0) return 'N/A';
                        return new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        }).format(record.final_amount);
                    }}
                    sortable={false}
                />
                <DateField
                    source="created_at"
                    label="Created At"
                    showTime
                    sortable={false}
                />
                <OrderActions record={undefined} />
            </Datagrid>

            {/* Order Statistics Summary - Only show when there's real data */}
            {realData.length > 0 && (
                <Box mt={3}>
                    <StyledPaper>
                        <SectionTitle>Order Summary</SectionTitle>

                        <Box mb={3}>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                {/* Total Orders */}
                                <Box flex="1 1 200px" minWidth="200px">
                                    <Box
                                        textAlign="center"
                                        p={2}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" color="textPrimary">
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Total Orders
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Completed Orders */}
                                <Box flex="1 1 200px" minWidth="200px">
                                    <Box
                                        textAlign="center"
                                        p={2}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" color="success.main">
                                            {stats.completed}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Completed ({stats.completedPercentage}%)
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Cancelled Orders */}
                                <Box flex="1 1 200px" minWidth="200px">
                                    <Box
                                        textAlign="center"
                                        p={2}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" color="error.main">
                                            {stats.cancelled}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Cancelled ({stats.cancelledPercentage}%)
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Other Status Orders */}
                                <Box flex="1 1 200px" minWidth="200px">
                                    <Box
                                        textAlign="center"
                                        p={2}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                                            {stats.pending}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Other Status
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Revenue Summary */}
                        <Box mb={3}>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                <Box flex="1 1 300px" minWidth="300px">
                                    <Box
                                        textAlign="center"
                                        p={2}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                                            ₹{stats.totalRevenue.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Total Revenue (All Orders)
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box flex="1 1 300px" minWidth="300px">
                                    <Box
                                        textAlign="center"
                                        p={2}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight="bold" color="success.main">
                                            ₹{stats.completedRevenue.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Revenue from Completed Orders
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Visual Status Bar */}
                        {stats.total > 0 && (
                            <Box>
                                <Box
                                    sx={{
                                        width: '100%',
                                        backgroundColor: 'grey.200',
                                        borderRadius: 2,
                                        height: 32,
                                        overflow: 'hidden',
                                        display: 'flex'
                                    }}
                                >
                                    {stats.completed > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: 'success.main',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                width: `${stats.completedPercentage}%`
                                            }}
                                        >
                                            {stats.completedPercentage}%
                                        </Box>
                                    )}
                                    {stats.cancelled > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: 'error.main',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                width: `${stats.cancelledPercentage}%`
                                            }}
                                        >
                                            {stats.cancelledPercentage}%
                                        </Box>
                                    )}
                                    {stats.pending > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: 'warning.main',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                width: `${(100 - stats.completedPercentage - stats.cancelledPercentage).toFixed(1)}%`
                                            }}
                                        >
                                            {(100 - stats.completedPercentage - stats.cancelledPercentage).toFixed(1)}%
                                        </Box>
                                    )}
                                </Box>
                                <Box mt={1} display="flex" justifyContent="center" gap={2}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 12, height: 12, backgroundColor: 'success.main', borderRadius: 0.5 }} />
                                        <Typography variant="caption" color="textSecondary">Completed</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 12, height: 12, backgroundColor: 'error.main', borderRadius: 0.5 }} />
                                        <Typography variant="caption" color="textSecondary">Cancelled</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 12, height: 12, backgroundColor: 'warning.main', borderRadius: 0.5 }} />
                                        <Typography variant="caption" color="textSecondary">Other</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </StyledPaper>
                </Box>
            )}
        </Box>
    );
};

// Export the component with filters and actions
export const ConsultationOrderList = (props: any) => {
    return (
        <List
            {...props}
            filters={ConsultationOrderFilters}
            actions={<ConsultationOrderListActions />}
            title="Consultation Orders"
            perPage={25}
            empty={
                <Box p={2} textAlign="center">
                    <Typography variant="h6" color="textSecondary">
                        No consultation orders found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Please enter a Customer ID to view consultation orders for that customer
                    </Typography>
                </Box>
            }
        >
            <ConsultationOrderListContent />
        </List>
    );
};

export default ConsultationOrderList;