import React from 'react';
import {
    List,
    useListContext,
    useListController,
    TopToolbar,
    FilterButton,
    NumberInput,
    SelectInput,
    DateField,
    Datagrid,
    TextField,
    NumberField,
    FunctionField,
    Pagination,
    PaginationActions,
    useTranslate,
} from 'react-admin';
import { Box, Chip, Button, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const mvuFilters = [
    <NumberInput
        label="Min Real Cash"
        source="min_real_cash"
        defaultValue={50}
        min={0}
        step={1}
    />,
    <SelectInput
        label="Days Since Last Consultation"
        source="days_since_consultation"
        choices={[
            { id: 'all', name: 'All' },
            { id: '0-3', name: '0-3 days' },
            { id: '0-6', name: '0-6 days' },
            { id: '0-10', name: '0-10 days' },
        ]}
        alwaysOn
    />,
];

// Calculate days since last consultation
const getDaysSinceConsultation = (consultation: any): { days: number; text: string; color: any; actionText?: string } => {
    if (!consultation) return { days: -1, text: 'No consultation', color: 'default' as const };

    // Use completed_at if available, otherwise use created_at
    const referenceDate = consultation.completed_at || consultation.created_at;
    const consultationDate = new Date(referenceDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - consultationDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Determine message, color, and CTA based on days
    if (diffDays <= 7) {
        return {
            days: diffDays,
            text: `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`,
            color: 'success' as const,
        };
    } else if (diffDays <= 30) {
        return {
            days: diffDays,
            text: `${diffDays} days ago`,
            color: 'info' as const,
            actionText: 'Re-engage',
        };
    } else if (diffDays <= 60) {
        return {
            days: diffDays,
            text: `${diffDays} days ago`,
            color: 'warning' as const,
            actionText: 'Follow up needed',
        };
    } else {
        return {
            days: diffDays,
            text: `${diffDays} days ago`,
            color: 'error' as const,
            actionText: 'Re-activate user',
        };
    }
};

const MvuListView = () => {
    const { data, isLoading, total, filterValues } = useListContext();
    if (isLoading) return <div>Loading...</div>;
    if (!data) return null;

    // Client-side filter for days since consultation
    const filteredData = React.useMemo(() => {
        const daysFilter = filterValues?.days_since_consultation;
        if (!daysFilter || daysFilter === 'all') return data;

        const [minDays, maxDays] = daysFilter.split('-').map(Number);

        return data.filter((record: any) => {
            if (!record.last_consultation) return false;

            const referenceDate = record.last_consultation.completed_at || record.last_consultation.created_at;
            const consultationDate = new Date(referenceDate);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - consultationDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return diffDays >= minDays && diffDays <= maxDays;
        });
    }, [data, filterValues?.days_since_consultation]);

    return (
        <>
            <Datagrid
                data={filteredData}
                bulkActionButtons={false}
                sx={{
                    '& .RaDatagrid-headerCell': {
                        fontWeight: 'bold',
                    },
                }}
            >
                <FunctionField
                    label="User ID"
                    render={(record: any) => (
                        <Link
                            to={`/customers/${record.user_id}/show`}
                            style={{
                                color: '#1976d2',
                                textDecoration: 'none',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            {record.user_id}
                        </Link>
                    )}
                />
                <TextField source="name" label="Name" />
                <TextField source="phone_number" label="Phone Number" />
                <NumberField source="real_cash" label="Real Cash" options={{ style: 'currency', currency: 'INR' }} />
                <NumberField source="virtual_cash" label="Virtual Cash" options={{ style: 'currency', currency: 'INR' }} />
                <NumberField source="cumulative_sum" label="Cumulative Sum" options={{ style: 'currency', currency: 'INR' }} />
                <FunctionField
                    label="Last Consultation"
                    render={(record: any) => record.last_consultation ? (
                        <Box sx={{ fontSize: '0.875rem' }}>
                            <Box sx={{ fontWeight: 500 }}>{record.last_consultation.guide_name}</Box>
                            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {record.last_consultation.mode} • {record.last_consultation.category}
                            </Box>
                            <Chip
                                label={record.last_consultation.state}
                                size="small"
                                color={
                                    record.last_consultation.state === 'completed' ? 'success' :
                                    record.last_consultation.state === 'guide_rejected' ? 'error' :
                                    record.last_consultation.state === 'request_expired' ? 'default' : 'default'
                                }
                                sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                            />
                        </Box>
                    ) : '-'}
                />
                <FunctionField
                    label="Days Since Last Consultation"
                    render={(record: any) => {
                        if (!record.last_consultation) return <span>-</span>;
                        const { days, text, color, actionText } = getDaysSinceConsultation(record.last_consultation);
                        return (
                            <Box>
                                <Chip
                                    label={text}
                                    size="small"
                                    color={color}
                                    sx={{ height: 24, fontWeight: 500 }}
                                />
                                {actionText && (
                                    <Box sx={{ mt: 0.5, fontSize: '0.7rem', color: `${color}.main`, fontWeight: 500 }}>
                                        {actionText}
                                    </Box>
                                )}
                            </Box>
                        );
                    }}
                />
                <DateField source="created_at" showTime label="Created At" />
            </Datagrid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {filteredData.length === data.length
                        ? `Total MVU Customers: ${total}`
                        : `Showing ${filteredData.length} of ${total} MVU Customers`}
                </Typography>
                <Pagination />
            </Box>
        </>
    );
};

export const MvuList = () => (
    <List
        actions={<TopToolbar><FilterButton /></TopToolbar>}
        filters={mvuFilters}
        title="MVU Customers"
        perPage={25}
        pagination={false}
    >
        <MvuListView />
    </List>
);
