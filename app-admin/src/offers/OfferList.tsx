import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    TextInput,
    useRecordContext,
} from 'react-admin';
import {
    Box,
    Typography,
    Chip,
} from '@mui/material';

// Custom field for displaying target user types
const TargetUserTypesField = () => {
    const record = useRecordContext();
    if (!record?.target_user_types || !Array.isArray(record.target_user_types)) {
        return <Typography variant="body2">-</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {record.target_user_types.map((type: string, index: number) => (
                <Chip
                    key={index}
                    label={type.replace(/_/g, ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ))}
        </Box>
    );
};

// Custom field for displaying offer type with color coding
const OfferTypeField = () => {
    const record = useRecordContext();
    const getColor = (type: string) => {
        switch (type) {
            case 'WALLET_RECHARGE':
                return 'success';
            case 'CONSULTANT_PRICING':
                return 'warning';
            case 'COMBO_OFFER':
                return 'info';
            default:
                return 'default';
        }
    };

    if (!record?.offer_type) {
        return <Typography variant="body2">-</Typography>;
    }

    return (
        <Chip
            label={record.offer_type.replace(/_/g, ' ')}
            color={getColor(record.offer_type)}
            size="small"
        />
    );
};

// Custom field for displaying offer category
const OfferCategoryField = () => {
    const record = useRecordContext();
    const getColor = (category: string) => {
        switch (category) {
            case 'FREE_MINUTES':
                return 'success';
            case 'PERCENTAGE_DISCOUNT':
                return 'warning';
            case 'FIXED_AMOUNT':
                return 'info';
            case 'COMBO':
                return 'secondary';
            default:
                return 'default';
        }
    };

    if (!record?.offer_category) {
        return <Typography variant="body2">-</Typography>;
    }

    return (
        <Chip
            label={record.offer_category.replace(/_/g, ' ')}
            color={getColor(record.offer_category)}
            size="small"
            variant="outlined"
        />
    );
};

// Custom field for displaying active status
const ActiveStatusField = ({ source }: { source: string }) => {
    const record = useRecordContext();

    if (!record) {
        return <Typography variant="body2">-</Typography>;
    }

    const value = record[source];
    if (value === undefined || value === null) {
        return <Typography variant="body2">-</Typography>;
    }

    const isActive = Boolean(value);

    return (
        <Chip
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant={isActive ? 'filled' : 'outlined'}
        />
    );
};

// Custom field for bonus amounts
const BonusField = () => {
    const record = useRecordContext();

    if (record?.bonus_percentage && record.bonus_percentage !== '0') {
        return (
            <Typography variant="body2" color="success.main">
                {record.bonus_percentage}% off
            </Typography>
        );
    }

    if (record?.bonus_fixed_amount && record.bonus_fixed_amount !== '0') {
        return (
            <Typography variant="body2" color="success.main">
                {record.bonus_fixed_amount} free minutes
            </Typography>
        );
    }

    return <span>-</span>;
};

// Filters for the offers list
const offerFilters = [
    <TextInput source="offer_name" label="Search by Offer Name" alwaysOn />,
    <TextInput source="offer_type" label="Offer Type" />,
    <TextInput source="offer_category" label="Offer Category" />,
];

// Main Offers List Component
export const OfferList = () => (
    <List
        filters={offerFilters}
        title="Offers"
        perPage={25}
        sort={{ field: 'created_at', order: 'DESC' }}
    >
        <Datagrid
            rowClick="show"
            sx={{
                '& .RaDatagrid-headerCell': {
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                },
                '& .RaDatagrid-row:hover': {
                    backgroundColor: '#f9f9f9',
                },
            }}
        >
            <TextField
                source="offer_name"
                label="Offer Name"
                sx={{ fontWeight: 'bold' }}
            />
            <OfferTypeField />
            <OfferCategoryField />
            <BonusField />
            <TargetUserTypesField />
            <ActiveStatusField source="is_active" />
        </Datagrid>
    </List>
);
