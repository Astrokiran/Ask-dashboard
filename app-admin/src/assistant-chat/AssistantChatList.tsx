import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
    TextInput,
    SelectInput,
    DateInput,
    useRecordContext,
    FunctionField,
} from 'react-admin';
import { Chip } from '@mui/material';

const SenderTypeField = () => {
    const record = useRecordContext();
    const senderType = record?.sender_type;
    if (!senderType) return <span>-</span>;

    const isGuide = senderType === 'guide';
    return (
        <Chip
            label={isGuide ? 'Guide' : 'Customer'}
            size="small"
            color={isGuide ? 'primary' : 'secondary'}
            sx={{ textTransform: 'capitalize' }}
        />
    );
};

const ContentField = () => {
    const record = useRecordContext();
    const content = record?.content;
    const maxLength = 80;

    if (!content) return <span>-</span>;

    const truncated = content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content;

    return (
        <span
            title={content}
            style={{
                display: 'block',
                maxWidth: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >
            {truncated}
        </span>
    );
};

const HasAttachmentField = () => {
    const record = useRecordContext();
    const hasAttachment = record?.attachments && record.attachments.length > 0;

    if (!hasAttachment) {
        return <span>-</span>;
    }

    return (
        <Chip
            label={`${record.attachments.length} file${record.attachments.length > 1 ? 's' : ''}`}
            size="small"
            color="info"
        />
    );
};

// Filters for the Chat Assistant List
const assistantChatFilters = [
    <TextInput key="guide_id" label="Guide ID" source="guide_id" alwaysOn={false} placeholder="Enter guide ID" />,
    <TextInput key="customer_id" label="Customer ID" source="customer_id" alwaysOn={false} placeholder="Enter customer ID" />,
    <SelectInput
        key="sender_type"
        source="sender_type"
        label="Sender Type"
        alwaysOn={false}
        choices={[
            { id: 'guide', name: 'Guide' },
            { id: 'customer', name: 'Customer' },
            { id: 'system', name: 'System' },
        ]}
    />,
    <DateInput key="start_date" source="start_date" label="Start Date" />,
    <DateInput key="end_date" source="end_date" label="End Date" />,
    <SelectInput
        key="is_read"
        source="is_read"
        label="Read Status"
        alwaysOn={false}
        choices={[
            { id: 'true', name: 'Read' },
            { id: 'false', name: 'Unread' },
        ]}
    />,
];

export const AssistantChatList = () => (
    <List
        title="Chat Assistant Messages"
        perPage={50}
        sort={{ field: 'created_at', order: 'DESC' }}
        filters={assistantChatFilters}
    >
        <Datagrid
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-headerCell': { fontWeight: 'bold', backgroundColor: '#f5f5f5' },
                '& .RaDatagrid-row:hover': { backgroundColor: '#f9f9f9' },
            }}
            rowClick={false}
        >
            <TextField source="message_id" label="Message ID" />
            <TextField source="guide_name" label="Guide Name" />
            <TextField source="customer_name" label="Customer Name" />
            <FunctionField label="Sender" render={() => <SenderTypeField />} />
            <FunctionField label="Message" render={() => <ContentField />} />
            <BooleanField source="is_read" label="Read" />
            <FunctionField label="Attachments" render={() => <HasAttachmentField />} />
            <DateField source="created_at" label="Date" showTime />
        </Datagrid>
    </List>
);
