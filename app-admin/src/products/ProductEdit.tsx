import React, { useState, useEffect } from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput, useNotify, useRedirect, useGetOne } from 'react-admin';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    InputAdornment,
} from '@mui/material';
import { httpClient } from '../dataProvider';

// Use the AUTH_URL environment variable for products API
const AUTH_API_URL = process.env.REACT_APP_AUTH_URL;
const API_ROOT_URL = AUTH_API_URL?.replace(/\/auth$/, '') || '';
const PRODUCTS_API_BASE = `${API_ROOT_URL}/api/v1/consultation`;

const stateChoices = [
    { id: 'active', name: 'Active' },
    { id: 'draft', name: 'Draft' },
    { id: 'archived', name: 'Archived' },
    { id: 'pending', name: 'Pending' },
];

const collectionChoices = [
    { id: 'bracelets', name: 'Bracelets' },
    { id: 'malas', name: 'Malas' },
    { id: 'rings', name: 'Rings' },
    { id: 'pendants', name: 'Pendants' },
    { id: 'yantras', name: 'Yantras' },
    { id: 'statues', name: 'Statues' },
    { id: 'books', name: 'Books' },
    { id: 'other', name: 'Other' },
];

// Custom Tags Input Component for Edit
const TagsInput = ({ initialValue, onChange }: { initialValue: string[], onChange: (tags: string[]) => void }) => {
    const [tags, setTags] = useState<string[]>(initialValue || []);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setTags(initialValue || []);
    }, [initialValue]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!tags.includes(inputValue.trim())) {
                const newTags = [...tags, inputValue.trim()];
                setTags(newTags);
                onChange(newTags);
            }
            setInputValue('');
        }
    };

    const handleDeleteTag = (tagToDelete: string) => {
        const newTags = tags.filter(tag => tag !== tagToDelete);
        setTags(newTags);
        onChange(newTags);
    };

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {tags.map((tag) => (
                    <Box
                        key={tag}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                        }}
                    >
                        {tag}
                        <Box
                            component="span"
                            onClick={() => handleDeleteTag(tag)}
                            sx={{
                                ml: 0.5,
                                cursor: 'pointer',
                                opacity: 0.7,
                                '&:hover': { opacity: 1 },
                            }}
                        >
                            ×
                        </Box>
                    </Box>
                ))}
            </Box>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type and press Enter to add tags"
                style={{
                    width: '100%',
                    padding: '8.5px 14px',
                    border: '1px solid #c4c4c4',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                Press Enter to add a tag
            </Typography>
        </Box>
    );
};

export const ProductEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const [tags, setTags] = useState<string[]>([]);

    const handleSubmit = async (formData: any) => {
        try {
            const payload: any = {
                name: formData.name,
                description: formData.description || '',
                short_description: formData.short_description || '',
                product_url: formData.product_url || '',
                product_image_url: formData.product_image_url || '',
                price: parseFloat(formData.price) || 0,
                collection: formData.collection || '',
                state: formData.state || 'draft',
            };

            // Only include compare_at_price if it's provided and greater than 0
            if (formData.compare_at_price && parseFloat(formData.compare_at_price) > 0) {
                payload.compare_at_price = parseFloat(formData.compare_at_price);
            }

            // Include tags if they exist
            if (tags && tags.length > 0) {
                payload.tags = tags;
            }

            await httpClient(`${PRODUCTS_API_BASE}/admin/products/${formData.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            notify('Product updated successfully!', { type: 'success' });
            redirect('list', 'products');
        } catch (error: any) {
            console.error('Update product failed:', error);
            notify(`Failed to update product: ${error.message || 'Unknown error'}`, { type: 'error' });
        }
    };

    return (
        <Edit title="Edit Product">
            <SimpleForm onSubmit={handleSubmit}>
                <Box sx={{ maxWidth: 800, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextInput
                                source="name"
                                label="Product Name"
                                fullWidth
                                required
                                helperText="Enter the full product name"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextInput
                                source="short_description"
                                label="Short Description"
                                fullWidth
                                multiline
                                rows={2}
                                helperText="Brief description for listings (recommended: 50-150 characters)"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextInput
                                source="description"
                                label="Full Description"
                                fullWidth
                                multiline
                                rows={4}
                                helperText="Detailed product description"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="product_url"
                                label="Product URL"
                                fullWidth
                                helperText="Link to the product page (e.g., https://shop.astrokiran.com/products/rudraksha-mala)"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="product_image_url"
                                label="Product Image URL"
                                fullWidth
                                helperText="URL to the product image"
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Pricing
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <NumberInput
                                source="price"
                                label="Price"
                                fullWidth
                                required
                                min={0}
                                step={0.01}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                helperText="Current selling price"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <NumberInput
                                source="compare_at_price"
                                label="Compare at Price"
                                fullWidth
                                min={0}
                                step={0.01}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                helperText="Original price (for showing discounts)"
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Organization
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <SelectInput
                                source="collection"
                                label="Collection"
                                choices={collectionChoices}
                                fullWidth
                                helperText="Product category/collection"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <SelectInput
                                source="state"
                                label="State"
                                choices={stateChoices}
                                fullWidth
                                helperText="Product visibility status"
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Tags
                    </Typography>

                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <ProductTagsLoader setTags={setTags} />
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                Add relevant tags for better searchability (e.g., rudraksha, meditation, spiritual)
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </SimpleForm>
        </Edit>
    );
};

// Component to load and display tags for the product
const ProductTagsLoader = ({ setTags }: { setTags: (tags: string[]) => void }) => {
    const { data, isLoading, error } = useGetOne('products', { id: window.location.pathname.split('/').pop() });

    if (isLoading) return <Typography>Loading tags...</Typography>;
    if (error) return <Typography color="error">Error loading tags</Typography>;

    const initialTags = data?.tags || [];

    return <TagsInput initialValue={initialTags} onChange={setTags} />;
};
