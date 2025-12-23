import React, { useState } from 'react';
import {
    Create,
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
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Divider,
    Alert,
    Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    LocalOffer as OfferIcon,
    Percent as DiscountIcon,
    CardGiftcard as VoucherIcon,
    AttachMoney,
    Loyalty as ComboIcon,
} from '@mui/icons-material';

// Discount Offer Form Component
const DiscountOfferForm = () => {
    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Create a percentage discount offer applicable to specific consultant tiers and service types.
                </Typography>
            </Alert>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <DiscountIcon sx={{ mr: 1 }} />
                        Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="offer_name"
                                label="Offer Name"
                                validate={required()}
                                fullWidth
                                helperText="e.g., DIWALI_30"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="discount_percentage"
                                label="Discount Percentage"
                                validate={required()}
                                fullWidth
                                min={1}
                                max={100}
                                helperText="Percentage discount (1-100)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextInput
                                source="description"
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                                validate={required()}
                                helperText="Describe the discount offer for users"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Targeting Configuration
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SelectInput
                                source="service_type"
                                label="Service Type"
                                choices={[
                                    { id: 'CHAT', name: 'Chat' },
                                    { id: 'VOICE', name: 'Voice' },
                                    { id: 'VIDEO', name: 'Video' },
                                    { id: 'ALL', name: 'All Services' },
                                ]}
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SelectInput
                                source="all_consultant_applicable"
                                label="All Consultants Applicable"
                                choices={[
                                    { id: true, name: 'Yes - Apply to all consultants' },
                                    { id: false, name: 'No - Select specific consultants' },
                                ]}
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <CheckboxGroupInput
                                source="target_guide_tiers"
                                label="Target Guide Tiers"
                                choices={[
                                    { id: 'BASIC', name: 'Basic' },
                                    { id: 'STANDARD', name: 'Standard' },
                                    { id: 'PREMIUM', name: 'Premium' },
                                    { id: 'ELITE', name: 'Elite' },
                                ]}
                                fullWidth
                                helperText="Select multiple tiers if applicable"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextInput
                                source="applicable_consultants"
                                label="Applicable Consultants (Optional)"
                                fullWidth
                                helperText="Enter consultant IDs separated by commas (e.g., 101,102,103). Required only if 'All Consultants Applicable' is No."
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <CheckboxGroupInput
                                source="target_user_types"
                                label="Target User Types"
                                choices={[
                                    { id: 'ALL', name: 'All Users' },
                                    { id: 'FIRST_TIME', name: 'First Time Users' },
                                    { id: 'RETURNING', name: 'Returning Users' },
                                ]}
                                fullWidth
                                helperText="Select multiple user types if applicable"
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
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateInput
                                source="valid_to"
                                label="Valid To"
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <BooleanInput
                                source="is_active"
                                label="Activate Offer Immediately"
                                defaultValue={true}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

// Voucher Offer Form Component
const VoucherOfferForm = () => {
    const [selectedSubtype, setSelectedSubtype] = useState<string>('');

    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Create a voucher offer that provides free minutes or free credits to users.
                </Typography>
            </Alert>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <VoucherIcon sx={{ mr: 1 }} />
                        Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="offer_name"
                                label="Offer Name"
                                validate={required()}
                                fullWidth
                                helperText="e.g., FREE_FIVE_MINUTES_CONSULTATION"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SelectInput
                                source="voucher_subtype"
                                label="Voucher Type"
                                choices={[
                                    { id: 'FREE_MINUTES', name: 'Free Minutes' },
                                    { id: 'FREE_CREDIT', name: 'Free Credits' },
                                ]}
                                validate={required()}
                                fullWidth
                                helperText="Select the type of voucher benefit"
                                onChange={(e) => setSelectedSubtype(e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextInput
                                source="description"
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                                validate={required()}
                                helperText="Describe the voucher offer for users"
                            />
                        </Grid>

                        {/* Conditional fields based on voucher subtype */}
                        {selectedSubtype === 'FREE_MINUTES' && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="free_minutes"
                                    label="Free Minutes"
                                    validate={required()}
                                    min={1}
                                    fullWidth
                                    helperText="Number of free consultation minutes"
                                />
                            </Grid>
                        )}

                        {selectedSubtype === 'FREE_CREDIT' && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <NumberInput
                                    source="credit_amount"
                                    label="Free Credits"
                                    validate={required()}
                                    min={1}
                                    fullWidth
                                    helperText="Amount of free credits to provide"
                                />
                            </Grid>
                        )}

                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="per_user_limit"
                                label="Per User Limit"
                                min={1}
                                defaultValue={1}
                                fullWidth
                                helperText="How many times a user can claim this"
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
                                validate={required()}
                                min={1}
                                fullWidth
                                helperText="Minimum recharge required to claim"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="max_recharge_amount"
                                label="Maximum Recharge Amount"
                                min={1}
                                fullWidth
                                helperText="Maximum recharge amount for eligibility"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="total_limit"
                                label="Total Offer Limit"
                                min={1}
                                fullWidth
                                helperText="Total number of vouchers available"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="validity_duration_hours"
                                label="Validity Duration (Hours)"
                                min={1}
                                fullWidth
                                helperText="How long the voucher is valid after claiming"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <CheckboxGroupInput
                                source="voucher_service_types"
                                label="Applicable Service Types"
                                choices={[
                                    { id: 'CHAT', name: 'Chat' },
                                    { id: 'VOICE', name: 'Voice' },
                                    { id: 'VIDEO', name: 'Video' },
                                    { id: 'ALL', name: 'All Services' },
                                ]}
                                fullWidth
                                helperText="Services where voucher can be used"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <CheckboxGroupInput
                                source="target_user_types"
                                label="Target User Types"
                                choices={[
                                    { id: 'ALL', name: 'All Users' },
                                    { id: 'FIRST_TIME', name: 'First Time Users' },
                                    { id: 'RETURNING', name: 'Returning Users' },
                                ]}
                                fullWidth
                                helperText="Select multiple user types if applicable"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Call to Action
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="cta_text"
                                label="CTA Text"
                                fullWidth
                                helperText="Call-to-action button text"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="cta_url"
                                label="CTA URL"
                                fullWidth
                                helperText="URL for CTA button or banner image"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Distribution Settings
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SelectInput
                                source="distribution_type"
                                label="Distribution Type"
                                choices={[
                                    { id: 'AUTO', name: 'Automatic' },
                                    { id: 'MANUAL', name: 'Manual' },
                                    { id: 'CODE', name: 'Promo Code' },
                                ]}
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <BooleanInput
                                source="auto_distribution"
                                label="Enable Auto Distribution"
                                defaultValue={true}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SelectInput
                                source="all_consultant_applicable"
                                label="All Consultants Applicable"
                                choices={[
                                    { id: true, name: 'Yes - Apply to all consultants' },
                                    { id: false, name: 'No - Select specific consultants' },
                                ]}
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextInput
                                source="applicable_consultants"
                                label="Applicable Consultants (Optional)"
                                fullWidth
                                helperText="Enter consultant IDs separated by commas (e.g., 101,102,103). Required only if 'All Consultants Applicable' is No."
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
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateInput
                                source="valid_to"
                                label="Valid To"
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <BooleanInput
                                source="is_active"
                                label="Activate Offer Immediately"
                                defaultValue={true}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

// Cashback Offer Form Component
const CashbackOfferForm = () => {
    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Create a cashback offer that provides percentage-based refunds on recharges.
                </Typography>
            </Alert>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="offer_name"
                                label="Offer Name"
                                validate={required()}
                                fullWidth
                                helperText="e.g., Weekend Cashback Special"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="bonus_percentage"
                                label="Cashback Percentage"
                                validate={required()}
                                fullWidth
                                min={0.1}
                                max={100}
                                step={0.1}
                                helperText="Percentage cashback (e.g., 10.5 for 10.5%)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextInput
                                source="description"
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                                validate={required()}
                                helperText="Describe the cashback offer for users"
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
                                validate={required()}
                                min={1}
                                fullWidth
                                helperText="Minimum recharge required for cashback"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="max_recharge_amount"
                                label="Maximum Recharge Amount"
                                validate={required()}
                                min={1}
                                fullWidth
                                helperText="Maximum recharge amount eligible for cashback"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="usage_limit_per_user"
                                label="Usage Limit Per User"
                                min={1}
                                fullWidth
                                helperText="How many times a user can claim this cashback"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="bonus_fixed_amount"
                                label="Fixed Bonus Amount"
                                min={0}
                                fullWidth
                                helperText="Fixed bonus amount (0 for percentage-based cashback)"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Targeting Configuration
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <CheckboxGroupInput
                                source="target_user_types"
                                label="Target User Types"
                                choices={[
                                    { id: 'ALL', name: 'All Users' },
                                    { id: 'FIRST_TIME', name: 'First Time Users' },
                                    { id: 'REGULAR', name: 'Regular Users' },
                                    { id: 'RETURNING', name: 'Returning Users' },
                                ]}
                                fullWidth
                                helperText="Select multiple user types if applicable"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Call to Action
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="cta_text"
                                label="CTA Text"
                                fullWidth
                                helperText="Call-to-action button text"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="cta_url"
                                label="CTA URL"
                                fullWidth
                                helperText="URL for CTA button or banner image"
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
                                validate={required()}
                                fullWidth
                                helperText="Select start date and time for offer validity"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateInput
                                source="valid_to"
                                label="Valid To"
                                validate={required()}
                                fullWidth
                                helperText="Select end date and time for offer validity"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <BooleanInput
                                source="is_active"
                                label="Activate Offer Immediately"
                                defaultValue={true}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

// Combo Offer Form Component
const ComboOfferForm = () => {
    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Create a combo offer that provides both cashback and free minutes on recharge.
                </Typography>
            </Alert>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <ComboIcon sx={{ mr: 1 }} />
                        Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="offer_name"
                                label="Offer Name"
                                validate={required()}
                                fullWidth
                                helperText="e.g., Super Recharge Combo"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextInput
                                source="description"
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                                validate={required()}
                                helperText="Describe the combo offer for users"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Cashback Configuration
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="cashback_percentage"
                                label="Cashback Percentage"
                                validate={required()}
                                fullWidth
                                min={0.1}
                                max={100}
                                step={0.1}
                                helperText="Percentage cashback (e.g., 15 for 15%)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="max_cashback_amount"
                                label="Maximum Cashback Amount"
                                validate={required()}
                                fullWidth
                                min={1}
                                helperText="Maximum cashback amount that can be given"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="bonus_fixed_amount"
                                label="Fixed Bonus Amount"
                                min={0}
                                fullWidth
                                defaultValue={0}
                                helperText="Fixed bonus amount (0 for percentage-based cashback)"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Free Minutes Configuration
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="voucher_minutes"
                                label="Free Minutes"
                                validate={required()}
                                fullWidth
                                min={1}
                                helperText="Number of free minutes to provide"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SelectInput
                                source="voucher_service_type"
                                label="Voucher Service Type"
                                choices={[
                                    { id: 'CHAT', name: 'Chat' },
                                    { id: 'VOICE', name: 'Voice' },
                                    { id: 'VIDEO', name: 'Video' },
                                ]}
                                validate={required()}
                                fullWidth
                                helperText="Service type for free minutes"
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
                                validate={required()}
                                min={1}
                                fullWidth
                                helperText="Minimum recharge required for combo offer"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="max_recharge_amount"
                                label="Maximum Recharge Amount"
                                validate={required()}
                                min={1}
                                fullWidth
                                helperText="Maximum recharge amount eligible for combo"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <NumberInput
                                source="usage_limit_per_user"
                                label="Usage Limit Per User"
                                min={1}
                                fullWidth
                                helperText="How many times a user can claim this combo"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Targeting Configuration
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <CheckboxGroupInput
                                source="target_user_types"
                                label="Target User Types"
                                choices={[
                                    { id: 'ALL', name: 'All Users' },
                                    { id: 'FIRST_TIME', name: 'First Time Users' },
                                    { id: 'REGULAR', name: 'Regular Users' },
                                    { id: 'RETURNING', name: 'Returning Users' },
                                ]}
                                fullWidth
                                helperText="Select multiple user types if applicable"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Call to Action
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="cta_text"
                                label="CTA Text"
                                fullWidth
                                helperText="Call-to-action button text"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                                source="cta_url"
                                label="CTA URL"
                                fullWidth
                                helperText="URL for CTA button or banner image"
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
                                validate={required()}
                                fullWidth
                                helperText="Select start date and time for offer validity"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateInput
                                source="valid_to"
                                label="Valid To"
                                validate={required()}
                                fullWidth
                                helperText="Select end date and time for offer validity"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <BooleanInput
                                source="is_active"
                                label="Activate Offer Immediately"
                                defaultValue={true}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

// Main OfferCreate Component
export const OfferCreate = () => {
    const [offerType, setOfferType] = useState('discount');
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSubmit = async (values: any) => {
        try {
            // Helper function to ensure arrays are properly formatted
            const ensureArray = (value: any) => {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                if (typeof value === 'string') return [value];
                return [];
            };

            // Helper function to format dates to ISO 8601 with timezone
            const formatDateForAPI = (dateValue: any) => {
                if (!dateValue) return null;

                // If it's already a string with timezone, return as-is
                if (typeof dateValue === 'string' && dateValue.includes('Z')) {
                    return dateValue;
                }

                // If it's a Date object or can be converted to one
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    // Format to ISO 8601 with Z timezone
                    return date.toISOString();
                }

                return dateValue;
            };

            // Transform the form data to match API requirements
            const payload = {
                type: offerType,
                offer_data: offerType === 'discount' ? {
                    ...values,
                    target_guide_tiers: ensureArray(values.target_guide_tiers),
                    target_user_types: ensureArray(values.target_user_types),
                    time_constraints: values.time_constraints || {},
                    // Format dates to ensure proper ISO 8601 format with timezone
                    valid_from: formatDateForAPI(values.valid_from),
                    valid_to: formatDateForAPI(values.valid_to),
                    // Handle applicable_consultants for discount offers
                    applicable_consultants: values.all_consultant_applicable === false && values.applicable_consultants
                        ? values.applicable_consultants.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
                        : [],
                } : offerType === 'voucher' ? {
                    ...values,
                    voucher_service_types: ensureArray(values.voucher_service_types),
                    target_user_types: ensureArray(values.target_user_types),
                    time_constraints: values.time_constraints || {},
                    // Format dates to ensure proper ISO 8601 format with timezone
                    valid_from: formatDateForAPI(values.valid_from),
                    valid_to: formatDateForAPI(values.valid_to),
                    // Handle applicable_consultants for voucher offers too
                    applicable_consultants: values.all_consultant_applicable === false && values.applicable_consultants
                        ? values.applicable_consultants.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
                        : [],
                    // Ensure proper handling of voucher subtype specific fields
                    ...(values.voucher_subtype === 'FREE_MINUTES' && {
                        free_minutes: values.free_minutes || 0,
                        credit_amount: undefined
                    }),
                    ...(values.voucher_subtype === 'FREE_CREDIT' && {
                        credit_amount: values.credit_amount || 0,
                        free_minutes: undefined
                    }),
                } : offerType === 'cashback' ? {
                    // Cashback offers
                    ...values,
                    target_user_types: ensureArray(values.target_user_types),
                    time_constraints: values.time_constraints || {},
                    // Format dates to ensure proper ISO 8601 format with timezone
                    valid_from: formatDateForAPI(values.valid_from),
                    valid_to: formatDateForAPI(values.valid_to),
                    // Handle applicable_consultants for cashback offers
                    applicable_consultants: values.all_consultant_applicable === false && values.applicable_consultants
                        ? values.applicable_consultants.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
                        : [],
                } : {
                    // Combo offers
                    ...values,
                    target_user_types: ensureArray(values.target_user_types),
                    time_constraints: values.time_constraints || {},
                    // Format dates to ensure proper ISO 8601 format with timezone
                    valid_from: formatDateForAPI(values.valid_from),
                    valid_to: formatDateForAPI(values.valid_to),
                    // Handle applicable_consultants for combo offers
                    applicable_consultants: values.all_consultant_applicable === false && values.applicable_consultants
                        ? values.applicable_consultants.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
                        : [],
                }
            };

            await dataProvider.create('offers', { data: payload });
            notify('Offer created successfully!', { type: 'success' });
            redirect('list', 'offers');
        } catch (error: any) {
            notify(`Error creating offer: ${error.message}`, { type: 'error' });
        }
    };

    return (
        <Create>
            <SimpleForm onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <OfferIcon sx={{ mr: 2 }} />
                        Create New Offer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Choose the type of offer you want to create and fill in the required details.
                    </Typography>
                </Box>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                                Offer Type Selection
                            </FormLabel>
                            <RadioGroup
                                row
                                value={offerType}
                                onChange={(e) => setOfferType(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <FormControlLabel
                                    value="discount"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DiscountIcon sx={{ mr: 1 }} />
                                            <Typography fontWeight="medium">Discount Offer</Typography>
                                            <Chip
                                                label="Percentage discount on consultations"
                                                size="small"
                                                sx={{ ml: 2 }}
                                                color="primary"
                                            />
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="voucher"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <VoucherIcon sx={{ mr: 1 }} />
                                            <Typography fontWeight="medium">Voucher Offer</Typography>
                                            <Chip
                                                label="Free minutes or free credits"
                                                size="small"
                                                sx={{ ml: 2 }}
                                                color="secondary"
                                            />
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="cashback"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AttachMoney sx={{ mr: 1 }} />
                                            <Typography fontWeight="medium">Cashback Offer</Typography>
                                            <Chip
                                                label="Percentage refund on recharge"
                                                size="small"
                                                sx={{ ml: 2 }}
                                                color="success"
                                            />
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="combo"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ComboIcon sx={{ mr: 1 }} />
                                            <Typography fontWeight="medium">Combo Offer</Typography>
                                            <Chip
                                                label="Cashback + free minutes"
                                                size="small"
                                                sx={{ ml: 2 }}
                                                color="warning"
                                            />
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                <Divider sx={{ mb: 3 }} />

                {offerType === 'discount' ? <DiscountOfferForm /> : offerType === 'voucher' ? <VoucherOfferForm /> : offerType === 'cashback' ? <CashbackOfferForm /> : <ComboOfferForm />}
            </SimpleForm>
        </Create>
    );
};