import {
    List,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    TextInput,
    SelectInput,
} from 'react-admin';
import { Chip } from '@mui/material';

const promoCodeFilters = [
    <TextInput key="code" source="code" label="Search by code" alwaysOn />,
    <SelectInput
        key="voucher_type"
        source="voucher_type"
        label="Type"
        choices={[
            { id: 'FREE_MINUTES', name: 'Free Minutes' },
            { id: 'FREE_CREDIT', name: 'Free Credit' },
        ]}
    />,
];

const StatusField = ({ record }: { record?: any }) => {
    if (!record) return null;
    const isActive = record.is_active;
    const now = new Date();
    const validTo = new Date(record.valid_to);
    const isExpired = validTo < now;

    if (!isActive) {
        return <Chip label="Inactive" size="small" color="default" />;
    }
    if (isExpired) {
        return <Chip label="Expired" size="small" color="warning" />;
    }
    return <Chip label="Active" size="small" color="success" />;
};

const RedemptionsField = ({ record }: { record?: any }) => {
    if (!record) return null;
    return (
        <span>
            {record.current_redemptions} / {record.max_redemptions}
        </span>
    );
};

const ValueField = ({ record }: { record?: any }) => {
    if (!record) return null;
    if (record.voucher_type === 'FREE_MINUTES' && record.free_minutes) {
        return <span>{record.free_minutes} min</span>;
    }
    if (record.voucher_type === 'FREE_CREDIT' && record.free_credit_amount) {
        return <span>₹{record.free_credit_amount}</span>;
    }
    return <span>-</span>;
};

export const PromoCodeList = () => (
    <List
        filters={promoCodeFilters}
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="code" label="Code" />
            <TextField source="offer_name" label="Offer" />
            <FunctionField
                label="Type"
                render={(record: any) => {
                    const type = record.voucher_type;
                    if (!type) return '-';
                    return (
                        <Chip
                            label={type === 'FREE_MINUTES' ? 'Free Minutes' : 'Free Credit'}
                            size="small"
                            color={type === 'FREE_MINUTES' ? 'info' : 'secondary'}
                            variant="outlined"
                        />
                    );
                }}
            />
            <FunctionField label="Value" render={(record: any) => <ValueField record={record} />} />
            <FunctionField
                label="Redemptions"
                render={(record: any) => <RedemptionsField record={record} />}
            />
            <FunctionField label="Status" render={(record: any) => <StatusField record={record} />} />
            <DateField source="valid_from" label="Valid From" showTime />
            <DateField source="valid_to" label="Valid To" showTime />
            <DateField source="created_at" label="Created" showTime />
        </Datagrid>
    </List>
);
