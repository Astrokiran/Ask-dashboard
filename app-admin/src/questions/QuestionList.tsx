import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

const CategoryField = () => {
    const record = useRecordContext();
    const category = record?.category;
    return (
        <Chip
            label={category || '-'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
        />
    );
};

export const QuestionList = () => (
    <List
        title="Questions"
        perPage={25}
        sort={{ field: 'id', order: 'ASC' }}
    >
        <Datagrid
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-headerCell': { fontWeight: 'bold', backgroundColor: '#f5f5f5' },
                '& .RaDatagrid-row:hover': { backgroundColor: '#f9f9f9' },
            }}
            rowClick="edit"
        >
            <TextField source="id" label="ID" />
            <CategoryField label="Category" />
            <TextField source="question_text" label="Question" sx={{ maxWidth: 400 }} />
            <TextField source="question_key" label="Key" />
            <EditButton />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
