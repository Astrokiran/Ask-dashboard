import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    useRecordContext,
    TopToolbar,
    CreateButton,
    EditButton,
    DeleteButton,
    TextInput,
    SelectInput,
} from 'react-admin';
import {
    Box,
    Typography,
    Chip,
    Card,
    CardMedia,
} from '@mui/material';
import { ShoppingBag } from 'lucide-react';

// Product image field
const ProductImageField = () => {
    const record = useRecordContext();
    if (!record?.product_image_url) {
        return (
            <Box
                sx={{
                    width: 60,
                    height: 60,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ShoppingBag size={24} color="#999" />
            </Box>
        );
    }

    return (
        <Card
            sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
            }}
        >
            <CardMedia
                component="img"
                image={record.product_image_url}
                alt={record.name}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </Card>
    );
};

// Price field with compare-at price
const PriceField = () => {
    const record = useRecordContext();
    if (!record?.price) return <span>-</span>;

    return (
        <Box>
            <Typography variant="body2" fontWeight="bold">
                ${record.price}
            </Typography>
            {record.compare_at_price && record.compare_at_price > record.price && (
                <Typography
                    variant="caption"
                    color="error"
                    sx={{ textDecoration: 'line-through' }}
                >
                    ${record.compare_at_price}
                </Typography>
            )}
        </Box>
    );
};

// Status chip with conditional color
const StateField = () => {
    const record = useRecordContext();
    if (!record?.state) return null;

    const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
        active: 'success',
        draft: 'default',
        archived: 'error',
        pending: 'warning',
    };

    return (
        <Chip
            label={record.state}
            color={colorMap[record.state] || 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
        />
    );
};

// Tags field
const TagsField = () => {
    const record = useRecordContext();
    const tags = record?.tags;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return <span>-</span>;
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.slice(0, 3).map((tag: string, index: number) => (
                <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                />
            ))}
            {tags.length > 3 && (
                <Chip
                    label={`+${tags.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                />
            )}
        </Box>
    );
};

// Short description field with truncation
const ShortDescriptionField = () => {
    const record = useRecordContext();
    const desc = record?.short_description;

    if (!desc) return <span>-</span>;

    return (
        <Typography
            variant="body2"
            sx={{
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >
            {desc}
        </Typography>
    );
};

// Filters for the list
const productFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput
        source="state"
        label="State"
        choices={[
            { id: 'active', name: 'Active' },
            { id: 'draft', name: 'Draft' },
            { id: 'archived', name: 'Archived' },
            { id: 'pending', name: 'Pending' },
        ]}
    />,
    <TextInput source="collection" label="Collection" />,
];

const ListActions = () => (
    <TopToolbar>
        <CreateButton label="Create Product" />
    </TopToolbar>
);

export const ProductList = () => (
    <List
        title="Products"
        perPage={20}
        sort={{ field: 'created_at', order: 'DESC' }}
        filters={productFilters}
        actions={<ListActions />}
    >
        <Datagrid
            bulkActionButtons={false}
            rowClick="edit"
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
            <ProductImageField />
            <TextField source="name" label="Product Name" sx={{ fontWeight: 'bold' }} />
            <ShortDescriptionField />
            <PriceField />
            <TextField source="collection" label="Collection" />
            <TagsField />
            <StateField />
            <DateField source="created_at" label="Created" showTime />
            <EditButton />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
