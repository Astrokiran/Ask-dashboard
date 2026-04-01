import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    EditButton,
    DeleteButton,
    NumberField,
    FunctionField,
    useRecordContext,
    FilterList,
    FilterListItem,
    SearchInput,
} from 'react-admin';
import { Chip, Typography, Alert, Box } from '@mui/material';
import { Icon } from '@mui/material';

const TemplatePreview = () => {
    const record = useRecordContext();
    if (!record?.template_content) return <span>-</span>;

    // Truncate the template content for preview
    const content = String(record.template_content);
    const maxLength = 100;
    const truncated = content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content;

    return (
        <Typography
            variant="body2"
            sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                maxWidth: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
        >
            {truncated}
        </Typography>
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

const AnswerTemplateSidebar = () => (
    <Box sx={{ width: 250, order: -1, mr: 2, display: { xs: 'none', md: 'block' } }}>
        <FilterList label="Quick Filters" icon={<Icon>message</Icon>}>
            <FilterListItem
                label="Career Questions (ID: 1)"
                value={{ question_id: 1 }}
            />
            <FilterListItem
                label="Marriage Questions (ID: 5)"
                value={{ question_id: 5 }}
            />
            <FilterListItem
                label="Health Questions (ID: 8)"
                value={{ question_id: 8 }}
            />
            <FilterListItem
                label="Finance Questions (ID: 10)"
                value={{ question_id: 10 }}
            />
        </FilterList>
        <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Edit disabled:</strong> The API doesn't support getting a single template. You can only create or delete templates.
        </Alert>
    </Box>
);

export const AnswerTemplateList = () => (
    <List
        title="Answer Templates"
        perPage={25}
        sort={{ field: 'priority', order: 'DESC' }}
        filters={[<SearchInput source="question_id" alwaysOn />]}
        aside={<AnswerTemplateSidebar />}
    >
        <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Tip:</strong> Use the search box above and enter a Question ID (e.g., "1", "5", "12") to view templates for that question.
            <br />
            <strong>Note:</strong> Editing templates is not available due to API limitations. You can create new templates or delete existing ones.
        </Alert>
        <Datagrid
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-headerCell': { fontWeight: 'bold', backgroundColor: '#f5f5f5' },
                '& .RaDatagrid-row:hover': { backgroundColor: '#f9f9f9' },
            }}
            rowClick={false}
            empty={<Alert severity="info">Enter a Question ID in the search box above to view templates.</Alert>}
        >
            <TextField source="id" label="ID" />
            <TextField source="question_id" label="Question ID" />
            <TextField source="template_name" label="Template Name" />
            <NumberField source="priority" label="Priority" />
            <FunctionField
                label="Status"
                render={() => <ActiveField />}
            />
            <FunctionField
                label="Template Content"
                render={() => <TemplatePreview />}
            />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
