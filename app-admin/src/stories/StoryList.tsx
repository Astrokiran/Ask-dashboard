import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    useRecordContext,
    TopToolbar,
    CreateButton,
    DeleteButton,
} from 'react-admin';
import { Box, Typography, Chip } from '@mui/material';

const ThumbnailField = () => {
    const record = useRecordContext();
    const url = record?.thumbnail_url || record?.file_url;
    if (!url) {
        return (
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" color="grey.500">—</Typography>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={url}
            alt={record?.title}
            sx={{
                width: 50,
                height: 50,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid',
                borderImage: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888) 1',
            }}
        />
    );
};

const StatusField = () => {
    const record = useRecordContext();
    if (!record?.status) return null;

    const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
        active: 'success',
        pending: 'warning',
        archived: 'error',
    };

    return <Chip label={record.status} color={colorMap[record.status] || 'default'} size="small" />;
};

const MediaTypeField = () => {
    const record = useRecordContext();
    if (!record?.media_type) return null;

    return (
        <Chip
            label={record.media_type}
            color={record.media_type === 'video' ? 'primary' : 'secondary'}
            size="small"
            variant="outlined"
        />
    );
};

const CTAField = () => {
    const record = useRecordContext();
    const link = record?.metadata?.link;
    if (!link) return <Typography variant="caption" color="text.secondary">—</Typography>;

    return (
        <Typography variant="caption">
            {link.button_text} → {link.action?.type === 'url' ? 'URL' : link.action?.screen}
        </Typography>
    );
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton label="Create Story" />
    </TopToolbar>
);

export const StoryList = () => (
    <List
        title="Stories"
        perPage={25}
        sort={{ field: 'sort_order', order: 'ASC' }}
        actions={<ListActions />}
    >
        <Datagrid
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-headerCell': {
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                },
            }}
        >
            <ThumbnailField />
            <TextField source="title" label="Title" sx={{ fontWeight: 'bold' }} />
            <MediaTypeField />
            <NumberField source="sort_order" label="Order" />
            <CTAField />
            <StatusField />
            <DateField source="created_at" label="Created" showTime />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
