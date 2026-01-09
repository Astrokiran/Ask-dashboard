import React, { useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    FunctionField,
    SelectInput,
    FilterButton,
    TopToolbar,
    useListContext,
    useRefresh,
} from 'react-admin';
import { Chip, Box, Typography } from '@mui/material';
import { RefundDialog } from './components/RefundDialog';

// Status field component
const RefundStatusField = ({ record }: { record?: any }) => {
    if (!record) return null;

    if (record.is_refunded) {
        return (
            <Chip
                label="Refunded"
                sx={{
                    bgcolor: 'rgba(2, 136, 209, 0.1)',
                    color: '#0288d1',
                    fontWeight: 500,
                }}
            />
        );
    }

    if (record.is_refundable) {
        return (
            <Chip
                label="Refundable"
                sx={{
                    bgcolor: 'rgba(56, 142, 60, 0.1)',
                    color: '#388e3c',
                    fontWeight: 500,
                }}
            />
        );
    }

    return (
        <Chip
            label="Not Refundable"
            sx={{
                bgcolor: 'rgba(109, 109, 109, 0.1)',
                color: '#6d6d6d',
                fontWeight: 500,
            }}
        />
    );
};

// Action buttons component
const RefundActions = ({ record }: { record?: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const refresh = useRefresh();

    if (!record || !record.is_refundable || record.is_refunded) return null;

    return (
        <>
            <RefundDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    refresh();
                }}
                consultationId={record.id}
                customerId={record.customer_id}
            />
            <button
                onClick={() => setDialogOpen(true)}
                style={{
                    padding: '6px 16px',
                    backgroundColor: '#388e3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                Process Refund
            </button>
        </>
    );
};

// Filters for the list
const consultationFilters = [
    <SelectInput
        key="is_refunded"
        source="is_refunded"
        label="Refund Status"
        alwaysOn
        choices={[
            { id: 'all', name: 'All' },
            { id: 'true', name: 'Refunded Only' },
            { id: 'false', name: 'Pending Refund' },
        ]}
    />,
];

// Custom list actions
const ListActions = () => (
    <TopToolbar>
        <FilterButton />
    </TopToolbar>
);

// Main list content component
const RefundableConsultationsListContent = (props: any) => {
    const { filterValues } = useListContext();

    return (
        <Datagrid
            bulkActionButtons={false}
            sx={{ '& .RaDatagrid-headerCell': { fontWeight: 'bold' } }}
            {...props}
        >
            <NumberField source="id" label="ID" />
            <NumberField source="order_id" label="Order ID" />
            <NumberField source="customer_id" label="Customer" />
            <NumberField source="guide_id" label="Guide" />
            <TextField source="consultation_mode" label="Mode" />
            <FunctionField
                label="Duration"
                render={(record: any) => {
                    const seconds = record.duration_seconds || 0;
                    const minutes = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    return seconds > 0 ? `${minutes}m ${secs}s` : '0s';
                }}
            />
            <FunctionField
                label="Status"
                render={(record: any) => <RefundStatusField record={record} />}
            />
            <DateField source="completed_at" label="Completed" showTime />
            <FunctionField
                label="Actions"
                render={(record: any) => <RefundActions record={record} />}
            />
        </Datagrid>
    );
};

// Main list component
export const RefundableConsultationsList = (props: any) => {
    // Transform filter values before passing to dataProvider
    const transformFilters = (filterValues: any) => {
        const transformed: any = {};

        if (filterValues.is_refunded && filterValues.is_refunded !== 'all') {
            transformed.is_refunded = filterValues.is_refunded === 'true';
        }

        return transformed;
    };

    return (
        <List
            filters={consultationFilters}
            actions={<ListActions />}
            title="Refundable Consultations"
            perPage={20}
            filter={transformFilters}
            {...props}
        >
            <RefundableConsultationsListContent />
        </List>
    );
};
