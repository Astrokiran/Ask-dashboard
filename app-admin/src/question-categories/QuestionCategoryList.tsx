import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    BooleanField,
    FunctionField,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

const IconField = () => {
    const record = useRecordContext();
    if (!record?.icon) return <span>-</span>;
    return (
        <Chip
            label={record.icon}
            size="small"
            sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
        />
    );
};

const ActiveField = () => {
    const record = useRecordContext();
    const isActive = record?.is_active ?? true;
    return (
        <Chip
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'default'}
            size="small"
        />
    );
};

export const QuestionCategoryList = () => (
    <List
        title="Question Categories"
        perPage={25}
        sort={{ field: 'display_order', order: 'ASC' }}
    >
        <Datagrid
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-headerCell': { fontWeight: 'bold', backgroundColor: '#f5f5f5' },
                '& .RaDatagrid-row:hover': { backgroundColor: '#f9f9f9' },
            }}
        >
            <TextField source="id" label="ID" />
            <TextField source="display_name" label="Category Name" />
            <FunctionField label="Icon" render={() => <IconField />} />
            <TextField source="name" label="Internal Name" />
            <TextField source="description" label="Description" sx={{ maxWidth: 300 }} />
            <TextField source="display_order" label="Order" />
            <FunctionField label="Status" render={() => <ActiveField />} />
            <EditButton />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
