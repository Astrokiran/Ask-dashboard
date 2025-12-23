import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    DateField,
    NumberField,
    ChipField,
    useRecordContext,
    EditButton,
    DeleteButton,
    TopToolbar,
    useNotify,
    useRedirect,
} from 'react-admin';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Divider,
    Alert,
    Chip,
    Avatar,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    AttachMoney as MoneyIcon,
    LocalOffer as OfferIcon,
    LocalOffer as LocalOfferIcon,
    TrendingUp as TrendingUpIcon,
    AccessTime as TimeIcon,
    Launch as LaunchIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Custom actions for the Show view
const OfferShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton
            label="Delete Offer"
            confirmTitle="Delete Offer"
            confirmContent="Are you sure you want to delete this offer? This action cannot be undone."
            mutationMode="pessimistic"
            redirect="list"
        />
    </TopToolbar>
);

// Enhanced card component with better styling
const OfferDetailsCard = ({
    title,
    children,
    icon,
    gradient = false
}: {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    gradient?: boolean;
}) => (
    <Card
        sx={{
            mb: 3,
            background: gradient ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: gradient ? 'white' : 'inherit',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
            }
        }}
    >
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon && (
                    <Avatar sx={{
                        mr: 2,
                        bgcolor: gradient ? 'rgba(255,255,255,0.2)' : 'primary.main',
                        color: gradient ? 'white' : 'primary.contrastText'
                    }}>
                        {icon}
                    </Avatar>
                )}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: gradient ? 'white' : 'primary.main'
                    }}
                >
                    {title}
                </Typography>
            </Box>
            {children}
        </CardContent>
    </Card>
);

// Component for displaying target user types with enhanced styling
const TargetUserTypesDisplay = () => {
    const record = useRecordContext();
    if (!record?.target_user_types || !Array.isArray(record.target_user_types)) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">All Users</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {record.target_user_types.map((type: string, index: number) => (
                <Chip
                    key={index}
                    label={type.replace(/_/g, ' ')}
                    size="medium"
                    color="primary"
                    variant="outlined"
                    sx={{
                        fontWeight: 'medium',
                        '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white'
                        }
                    }}
                />
            ))}
        </Box>
    );
};

// Reusable info item component for better consistency
const InfoItem = ({ label, value, icon, color = 'text.primary' }: {
    label: string;
    value: string | number | null | undefined;
    icon?: React.ReactNode;
    color?: string;
}) => {
    const displayValue = value !== null && value !== undefined ? value : 'Not specified';

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                {icon && <Box sx={{ mr: 1, fontSize: 16 }}>{icon}</Box>}
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color }}>
                {displayValue}
            </Typography>
        </Box>
    );
};

// Component for displaying guide tiers with enhanced styling
const GuideTiersDisplay = () => {
    const record = useRecordContext();
    if (!record?.target_guide_tiers || !Array.isArray(record.target_guide_tiers)) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">All Guide Tiers</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {record.target_guide_tiers.map((tier: string, index: number) => (
                <Chip
                    key={index}
                    label={tier.charAt(0).toUpperCase() + tier.slice(1)}
                    size="medium"
                    color="secondary"
                    variant="filled"
                    sx={{
                        fontWeight: 'medium',
                        textTransform: 'capitalize',
                        '&:hover': {
                            backgroundColor: 'secondary.dark',
                        }
                    }}
                />
            ))}
        </Box>
    );
};

// Component for displaying bonus information
const BonusDisplay = () => {
    const record = useRecordContext();

    return (
        <Grid container spacing={2}>
            {record?.bonus_percentage && record.bonus_percentage !== '0' && (
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                        Percentage Bonus
                    </Typography>
                    <Typography variant="h6" color="success.main">
                        {record.bonus_percentage}% discount
                    </Typography>
                </Grid>
            )}
            {record?.bonus_fixed_amount && record.bonus_fixed_amount !== '0' && (
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                        Fixed Bonus
                    </Typography>
                    <Typography variant="h6" color="success.main">
                        {record.bonus_fixed_amount} free minutes
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
};

// Component for displaying recharge limits
const RechargeLimitsDisplay = () => {
    const record = useRecordContext();

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                    Minimum Recharge
                </Typography>
                <Typography variant="h6">
                    {record?.min_recharge_amount || 0}
                    {record?.min_recharge_amount && ' ₹'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                    Maximum Recharge
                </Typography>
                <Typography variant="h6">
                    {record?.max_recharge_amount === '50000' ? 'No Limit' : record?.max_recharge_amount || 0}
                    {record?.max_recharge_amount !== '50000' && record?.max_recharge_amount && ' ₹'}
                </Typography>
            </Grid>
        </Grid>
    );
};

// Component for displaying time constraints
const TimeConstraintsDisplay = () => {
    const record = useRecordContext();

    const parseTimeConstraints = () => {
        if (!record?.time_constraints || record.time_constraints === '{}') {
            return null;
        }

        try {
            return JSON.parse(record.time_constraints);
        } catch {
            return null;
        }
    };

    const constraints = parseTimeConstraints();

    if (!constraints) {
        return <Typography variant="body2">No specific time constraints</Typography>;
    }

    return (
        <Box>
            {Object.entries(constraints).map(([key, value]: [string, any]) => (
                <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                    <strong>{key.replace(/_/g, ' ')}:</strong> {JSON.stringify(value)}
                </Typography>
            ))}
        </Box>
    );
};

// Component for displaying trigger conditions
const TriggerConditionsDisplay = () => {
    const record = useRecordContext();

    const parseTriggerConditions = () => {
        if (!record?.trigger_conditions) {
            return null;
        }

        try {
            return JSON.parse(record.trigger_conditions);
        } catch {
            return null;
        }
    };

    const conditions = parseTriggerConditions();

    if (!conditions) {
        return <Typography variant="body2">No specific trigger conditions</Typography>;
    }

    return (
        <Box>
            {Object.entries(conditions).map(([key, value]: [string, any]) => (
                <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                    <strong>{key.replace(/_/g, ' ')}:</strong> {JSON.stringify(value)}
                </Typography>
            ))}
        </Box>
    );
};

// Component for displaying CTA (Call to Action)
const CTADisplay = () => {
    const record = useRecordContext();

    if (!record?.cta_text && !record?.cta_url) {
        return <Typography variant="body2">No CTA configured</Typography>;
    }

    return (
        <Grid container spacing={2}>
            {record?.cta_text && (
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                        CTA Text
                    </Typography>
                    <Typography variant="body1">
                        {record.cta_text}
                    </Typography>
                </Grid>
            )}
            {record?.cta_url && (
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                        CTA URL
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {record.cta_url}
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
};

// Main Show Component
export const OfferShow = () => {
    const record = useRecordContext();
    return (
        <Show actions={<OfferShowActions />}>
            <Box sx={{ p: 2, '& .MuiTypography-root': { fontSize: '1.05rem' } }}>
                <OfferDetailsCard
                    title="Basic Information"
                    icon={<InfoIcon />}
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <InfoItem
                                label="Offer Name"
                                value={<TextField source="offer_name" />}
                                icon={<OfferIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Offer Type"
                                value={
                                    <Chip
                                        label={<TextField source="offer_type" />}
                                        color="primary"
                                        size="small"
                                    />
                                }
                                icon={<InfoIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Offer Category"
                                value={
                                    <Chip
                                        label={<TextField source="offer_category" />}
                                        color="secondary"
                                        size="small"
                                    />
                                }
                                icon={<LocalOfferIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Status"
                                value={
                                    <Chip
                                        label={
                                            <BooleanField
                                                source="is_active"
                                                valueLabelTrue="Active"
                                                valueLabelFalse="Inactive"
                                            />
                                        }
                                        color={record?.is_active ? "success" : "error"}
                                        size="small"
                                    />
                                }
                                icon={<InfoIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Trigger Type"
                                value={<TextField source="trigger_type" />}
                                icon={<TrendingUpIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Voucher Subtype"
                                value={<TextField source="voucher_subtype" />}
                                icon={<LocalOfferIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Usage Limit Per User"
                                value={
                                    <NumberField
                                        source="usage_limit_per_user"
                                        transform={(value) => value === 0 ? 'Unlimited' : value}
                                    />
                                }
                                icon={<PersonIcon />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    Description
                                </Typography>
                                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                    <TextField source="description" />
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </OfferDetailsCard>

                <OfferDetailsCard title="Bonus & Benefits">
                    <BonusDisplay />
                </OfferDetailsCard>

                <OfferDetailsCard title="Recharge Limits">
                    <RechargeLimitsDisplay />
                </OfferDetailsCard>

                <OfferDetailsCard title="Targeting">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Target User Types
                            </Typography>
                            <TargetUserTypesDisplay />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Target Guide Tiers
                            </Typography>
                            <GuideTiersDisplay />
                        </Grid>
                    </Grid>
                </OfferDetailsCard>

                <OfferDetailsCard
                    title="Time Constraints"
                    icon={<ScheduleIcon />}
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Valid From"
                                value={<DateField source="valid_from" showTime />}
                                icon={<ScheduleIcon />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoItem
                                label="Valid To"
                                value={<DateField source="valid_to" showTime />}
                                icon={<ScheduleIcon />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Custom Time Constraints
                                </Typography>
                                <TimeConstraintsDisplay />
                            </Box>
                        </Grid>
                    </Grid>
                </OfferDetailsCard>

                <OfferDetailsCard title="Trigger Conditions">
                    <TriggerConditionsDisplay />
                </OfferDetailsCard>

                <OfferDetailsCard title="Call to Action">
                    <CTADisplay />
                </OfferDetailsCard>

                <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                        <TimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Timestamps
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <InfoItem
                                label="Created At"
                                value={<DateField source="created_at" showTime />}
                                icon={<ScheduleIcon />}
                                color="success.main"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <InfoItem
                                label="Updated At"
                                value={<DateField source="updated_at" showTime />}
                                icon={<ScheduleIcon />}
                                color="info.main"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <InfoItem
                                label="Created By"
                                value={<NumberField source="created_by" />}
                                icon={<PersonIcon />}
                                color="text.secondary"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <InfoItem
                                label="Deleted At"
                                value={<DateField source="DeletedAt" showTime />}
                                icon={<ScheduleIcon />}
                                color="error.main"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Show>
    );
};