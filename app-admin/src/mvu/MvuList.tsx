import React, { useState, useEffect, useCallback } from 'react';
import {
    List,
    TopToolbar,
    FilterButton,
    NumberInput,
    SelectInput,
    DateField,
    Datagrid,
    TextField,
    NumberField,
    FunctionField,
    useTranslate,
} from 'react-admin';
import { Box, Chip, Typography, Pagination } from '@mui/material';
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

// Helper function to get days since consultation for sorting
const getDaysForSorting = (record: any): number => {
    if (!record.last_consultation) return Infinity; // No consultation goes to the end
    const referenceDate = record.last_consultation.completed_at || record.last_consultation.created_at;
    const consultationDate = new Date(referenceDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - consultationDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const MvuListView = ({ filterValues, onFilterChange }: { filterValues: any; onFilterChange: (values: any) => void }) => {
    const [allData, setAllData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const perPage = 25;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const token = localStorage.getItem('access_token');

            // Fetch all MVU customers with a high limit
            let allUsers: any[] = [];
            let currentPage = 1;
            let hasMore = true;
            const fetchLimit = 100; // Fetch 100 records per request

            while (hasMore) {
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: fetchLimit.toString(),
                });

                if (filterValues?.min_real_cash !== undefined && filterValues.min_real_cash !== '') {
                    queryParams.append('min_real_cash', filterValues.min_real_cash.toString());
                }

                const url = `${API_URL}/api/v1/customers/mvu?${queryParams.toString()}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const json = await response.json();
                const users = json.users || [];

                const transformedUsers = users.map((user: any) => ({
                    id: user.user_id,
                    user_id: user.user_id,
                    phone_number: user.phone_number,
                    email: user.email,
                    name: user.name,
                    real_cash: user.real_cash,
                    virtual_cash: user.virtual_cash,
                    cumulative_sum: user.cumulative_sum,
                    recharge_count: user.recharge_count,
                    created_at: user.created_at,
                    last_login: user.last_login,
                    last_consultation: user.last_consultation,
                }));

                allUsers = [...allUsers, ...transformedUsers];

                // Check if there's more data
                const pagination = json.pagination || {};
                hasMore = allUsers.length < (pagination.total_items || 0);
                currentPage++;
            }

            // Sort all records by days since last consultation in ascending order
            allUsers.sort((a, b) => {
                const daysA = getDaysForSorting(a);
                const daysB = getDaysForSorting(b);
                return daysA - daysB;
            });

            setAllData(allUsers);
        } catch (error) {
            console.error('Error fetching MVU data:', error);
        } finally {
            setLoading(false);
        }
    }, [filterValues?.min_real_cash]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Client-side filter for days since consultation
    const filteredData = React.useMemo(() => {
        const daysFilter = filterValues?.days_since_consultation;
        if (!daysFilter || daysFilter === 'all') return allData;

        const [minDays, maxDays] = daysFilter.split('-').map(Number);

        return allData.filter((record: any) => {
            if (!record.last_consultation) return false;
            const days = getDaysForSorting(record);
            return days >= minDays && days <= maxDays;
        });
    }, [allData, filterValues?.days_since_consultation]);

    // Client-side pagination
    const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset page when filter changes
    useEffect(() => {
        setPage(1);
    }, [filterValues]);

    if (loading) return <div>Loading MVU Customers...</div>;

    const totalPages = Math.ceil(filteredData.length / perPage);

    return (
        <>
            <Datagrid
                data={paginatedData}
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
                    {filteredData.length === allData.length
                        ? `Total MVU Customers: ${allData.length}`
                        : `Showing ${filteredData.length} of ${allData.length} MVU Customers (filtered)`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {page} of {totalPages}
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            </Box>
        </>
    );
};

export const MvuList = () => {
    const [filterValues, setFilterValues] = useState<any>({ days_since_consultation: 'all', min_real_cash: 50 });

    const handleFilterChange = useCallback((newValues: any) => {
        setFilterValues((prev: any) => ({ ...prev, ...newValues }));
    }, []);

    return (
        <List
            actions={<TopToolbar><FilterButton /></TopToolbar>}
            filters={mvuFilters}
            filterDefaultValues={filterValues}
            title="MVU Customers"
            perPage={25}
            pagination={false}
            resource="mvu"
            filter={filterValues}
        >
            <MvuListView filterValues={filterValues} onFilterChange={handleFilterChange} />
        </List>
    );
};
