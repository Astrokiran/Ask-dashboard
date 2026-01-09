import React, { useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    FunctionField,
    ArrayField,
    SingleFieldList,
    ChipField,
    TopToolbar,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { CreateReconciliationVoucherDialog } from './components/CreateReconciliationVoucherDialog';

// Target user types display component
const TargetUserTypesField = ({ record }: { record?: any }) => {
    if (!record || !record.target_user_types) return null;

    return (
        <Box display="flex" flexWrap="wrap" gap={0.5}>
            {record.target_user_types.map((type: string, index: number) => (
                <ChipField
                    key={index}
                    record={{ name: type }}
                    source="name"
                    size="small"
                />
            ))}
        </Box>
    );
};

// Custom list actions with create button
const ListActions = () => {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <TopToolbar>
                <button
                    onClick={() => setDialogOpen(true)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#388e3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span>+</span>
                    Create Voucher
                </button>
            </TopToolbar>
            <CreateReconciliationVoucherDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />
        </>
    );
};

// Main list content component
const ReconciliationOffersListContent = (props: any) => {
    return (
        <Datagrid
            rowClick="show"
            bulkActionButtons={false}
            sx={{ '& .RaDatagrid-headerCell': { fontWeight: 'bold' } }}
            {...props}
        >
            <TextField source="offer_id" label="Offer ID" />
            <TextField source="offer_name" label="Offer Name" />
            <TextField source="offer_type" label="Offer Type" />
            <TextField source="offer_category" label="Offer Category" />
            <TextField source="voucher_subtype" label="Voucher Subtype" />
            <NumberField source="free_minutes" label="Free Minutes" />
            <FunctionField
                label="Target User Types"
                render={(record: any) => <TargetUserTypesField record={record} />}
            />
            <DateField source="valid_from" label="Valid From" showTime />
            <DateField source="valid_to" label="Valid To" showTime />
        </Datagrid>
    );
};

// Main list component
export const ReconciliationOffersList = (props: any) => {
    return (
        <List
            actions={<ListActions />}
            title="Reconciliation Offers"
            perPage={25}
            {...props}
        >
            <ReconciliationOffersListContent />
        </List>
    );
};
