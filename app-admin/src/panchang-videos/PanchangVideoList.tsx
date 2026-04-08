import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    useRecordContext,
    TopToolbar,
    CreateButton,
    DeleteButton,
} from 'react-admin';
import { Box, Typography, Chip } from '@mui/material';

const ThumbnailField = () => {
    const record = useRecordContext();
    if (!record?.thumbnail_url) {
        return (
            <Box
                sx={{
                    width: 80, height: 45,
                    backgroundColor: '#1a1a2e', borderRadius: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <Typography variant="caption" color="grey.500">No thumb</Typography>
            </Box>
        );
    }
    return (
        <Box
            component="img"
            src={record.thumbnail_url}
            alt={record.title}
            sx={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 1 }}
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

const TargetDateField = () => {
    const record = useRecordContext();
    if (!record?.target_date) return <span>-</span>;
    // target_date comes as "YYYY-MM-DD" or ISO string
    const dateStr = typeof record.target_date === 'string'
        ? record.target_date.substring(0, 10)
        : '-';
    return <Typography variant="body2" fontWeight="bold">{dateStr}</Typography>;
};

const DurationField = () => {
    const record = useRecordContext();
    if (!record?.duration_seconds) return <span>-</span>;
    const mins = Math.floor(record.duration_seconds / 60);
    const secs = record.duration_seconds % 60;
    return <Typography variant="body2">{mins}:{secs.toString().padStart(2, '0')}</Typography>;
};

const FileSizeField = () => {
    const record = useRecordContext();
    if (!record?.file_size_bytes) return <span>-</span>;
    const mb = (record.file_size_bytes / (1024 * 1024)).toFixed(1);
    return <Typography variant="body2">{mb} MB</Typography>;
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton label="Upload Panchang Video" />
    </TopToolbar>
);

export const PanchangVideoList = () => (
    <List
        title="Panchang Videos"
        perPage={25}
        sort={{ field: 'created_at', order: 'DESC' }}
        actions={<ListActions />}
        filter={{ purpose: 'panchang_video' }}
    >
        <Datagrid
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-headerCell': { fontWeight: 'bold', backgroundColor: '#f5f5f5' },
                '& .RaDatagrid-row:hover': { backgroundColor: '#f9f9f9' },
            }}
        >
            <ThumbnailField />
            <TargetDateField />
            <TextField source="title" label="Title" sx={{ fontWeight: 'bold' }} />
            <DurationField />
            <FileSizeField />
            <StatusField />
            <DateField source="created_at" label="Uploaded" showTime />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
