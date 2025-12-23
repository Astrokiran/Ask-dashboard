import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    SelectInput,
    CheckboxGroupInput,
    DateInput,
    required,
    useNotify,
    useRedirect,
    useDataProvider,
} from 'react-admin';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
    Alert,
    Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Edit as EditIcon,
    LocalOffer as OfferIcon,
} from '@mui/icons-material';

// Target user types for edit
const TARGET_USER_TYPES = [
    { id: 'ALL', name: 'All Users' },
    { id: 'FIRST_TIME', name: 'First Time Users' },
    { id: 'RETURNING', name: 'Returning Users' },
    { id: 'REGULAR', name: 'Regular Users' },
];

// Service types for edit
const SERVICE_TYPES = [
    { id: 'CHAT', name: 'Chat' },
    { id: 'VOICE', name: 'Voice' },
    { id: 'VIDEO', name: 'Video' },
    { id: 'ALL', name: 'All Services' },
];

// Consultation modes
const CONSULTATION_MODES = [
    { id: 'CHAT', name: 'Chat' },
    { id: 'VOICE', name: 'Voice' },
    { id: 'VIDEO', name: 'Video' },
    { id: 'TEXT', name: 'Text' },
];

export const OfferEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSubmit = async (values: any) => {
        try {
            // Helper function to format dates to RFC3339 format
            const formatDateForAPI = (dateValue: any) => {
                if (!dateValue) return null;

                // If it's already a string with timezone, return as-is
                if (typeof dateValue === 'string' && dateValue.includes('T')) {
                    return dateValue;
                }

                // If it's a Date object or can be converted to one
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    // Format to RFC3339 format (ISO 8601)
                    return date.toISOString();
                }

                return dateValue;
            };

            // Extract offer_id from the record context
            const record = values;
            const offerId = record.offer_id || record.id;

            if (!offerId) {
                notify('Offer ID not found', { type: 'error' });
                return;
            }

            // Transform the form data to match API UpdateOfferRequest structure
            const payload = {
                offer_name: values.offer_name,
                bonus_percentage: values.bonus_percentage || values.bonus_percentage === 0 ? values.bonus_percentage.toString() : undefined,
                bonus_fixed_amount: values.bonus_fixed_amount || values.bonus_fixed_amount === 0 ? values.bonus_fixed_amount.toString() : undefined,
                min_recharge_amount: values.min_recharge_amount ? values.min_recharge_amount.toString() : undefined,
                max_recharge_amount: values.max_recharge_amount ? values.max_recharge_amount.toString() : undefined,
                target_user_type: Array.isArray(values.target_user_types) ? values.target_user_types[0] : (values.target_user_types || values.target_user_type),
                service_type: values.service_type,
                time_constraints: values.time_constraints ? JSON.stringify(values.time_constraints) : undefined,
                consultation_modes: values.consultation_modes || [],
                usage_limit_per_user: values.usage_limit_per_user || values.usage_limit_per_user === 0 ? parseInt(values.usage_limit_per_user) : undefined,
                valid_from: formatDateForAPI(values.valid_from),
                valid_to: formatDateForAPI(values.valid_to),
                is_active: values.is_active,
            };

            // Remove undefined fields
            Object.keys(payload).forEach(key => {
                if (payload[key as keyof typeof payload] === undefined) {
                    delete payload[key as keyof typeof payload];
                }
            });

            await dataProvider.update('offers', {
                id: offerId,
                data: payload,
                previousData: values,
            });

            notify('Offer updated successfully!', { type: 'success' });
            redirect('show', 'offers', offerId);
        } catch (error: any) {
            notify(`Error updating offer: ${error.message}`, { type: 'error' });
        }
    };

    return (
        <Edit>
            <SimpleForm onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <EditIcon sx={{ mr: 2 }} />
                        Edit Offer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Update the allowed fields for this offer. Note: Only the fields below can be modified.
                    </Typography>
                </Box>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <OfferIcon sx={{ mr: 1 }} />
                            Basic Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextInput
                                    source="offer_name"
                                    label="Offer Name"
                                    validate={required()}
                                    fullWidth
                                    helperText="e.g., WEEKEND_SPECIAL, FLASH_SALE"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextInput
                                    source="target_user_type"
                                    label="Target User Type"
                                    fullWidth
                                    helperText="Primary target user type"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Bonus Configuration
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="bonus_percentage"
                                    label="Bonus Percentage"
                                    fullWidth
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    helperText="Percentage bonus (e.g., 15.5 for 15.5%)"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="bonus_fixed_amount"
                                    label="Bonus Fixed Amount"
                                    fullWidth
                                    min={0}
                                    helperText="Fixed bonus amount (0 for percentage-based)"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Recharge Conditions
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="min_recharge_amount"
                                    label="Minimum Recharge Amount"
                                    fullWidth
                                    min={0}
                                    step={0.01}
                                    helperText="Minimum recharge amount required"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="max_recharge_amount"
                                    label="Maximum Recharge Amount"
                                    fullWidth
                                    min={0}
                                    step={0.01}
                                    helperText="Maximum recharge amount eligible"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Service Configuration
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <SelectInput
                                    source="service_type"
                                    label="Service Type"
                                    choices={SERVICE_TYPES}
                                    fullWidth
                                    helperText="Applicable service type"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="usage_limit_per_user"
                                    label="Usage Limit Per User"
                                    fullWidth
                                    min={0}
                                    helperText="How many times a user can claim this"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Consultation Modes
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <CheckboxGroupInput
                                    source="consultation_modes"
                                    label="Allowed Consultation Modes"
                                    choices={CONSULTATION_MODES}
                                    fullWidth
                                    helperText="Select multiple consultation modes if applicable"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Time Constraints (JSON)
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextInput
                                    source="time_constraints"
                                    label="Time Constraints"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    helperText="JSON format: {&quot;key&quot;: &quot;value&quot;}"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Validity Period
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <DateInput
                                    source="valid_from"
                                    label="Valid From"
                                    fullWidth
                                    helperText="Start date and time (RFC3339 format)"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <DateInput
                                    source="valid_to"
                                    label="Valid To"
                                    fullWidth
                                    helperText="End date and time (RFC3339 format)"
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <BooleanInput
                                    source="is_active"
                                    label="Offer Active"
                                    helperText="Toggle to activate/deactivate this offer"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Note:</strong> Only the fields shown above can be updated. Other offer properties cannot be modified after creation.
                    </Typography>
                </Alert>
            </SimpleForm>
        </Edit>
    );
};