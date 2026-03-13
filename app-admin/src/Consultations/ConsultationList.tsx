// /consultations/ConsultationList.tsx
import {
    List,
    Datagrid,
    TextField,
    TextInput,
    SelectInput,
    DateInput,
    FunctionField,
    TopToolbar,
    FilterButton,
    CreateButton,
    ExportButton,
    NumberField,
    DateField,
    useListContext,
    useDataProvider,
    RecordContextProvider,
} from 'react-admin';
import { Chip } from '@mui/material';
import { Box, Typography, Paper, Grid, styled } from '@mui/material';
import { useState, useEffect } from 'react';
import { WebRTCCallButton } from '../components/WebRTCCallButton';

// --- Reusable StatusField Component ---
// This component renders the colorful status chip.
const StatusField = ({ record }: { record?: any }) => {
    if (!record || !record.state) return null;
    const status = record.state;
    // Map API status values to colors and labels
    const statusStyles: { [key: string]: any } = {
        requested: { bgcolor: 'rgba(245, 124, 0, 0.1)', color: '#f57c00' },
        in_progress: { bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#0288d1' },
        completed: { bgcolor: 'rgba(56, 142, 60, 0.1)', color: '#388e3c' },
        cancelled: { bgcolor: 'rgba(109, 109, 109, 0.1)', color: '#6d6d6d' },
        failed: { bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' },
        customer_rejected: { bgcolor: 'rgba(220, 53, 69, 0.1)', color: '#e74c3c' },
        guide_rejected: { bgcolor: 'rgba(183, 28, 28, 0.1)', color: '#ef4444' },
        customer_join_timeout: { bgcolor: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' },
        request_expired: { bgcolor: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' },
    };
    return <Chip label={status} sx={{ ...statusStyles[status], fontWeight: 500, textTransform: 'capitalize' }} />;
};

// --- Filters for the Consultation List ---
// Each input's `source` prop maps directly to a query parameter in the API call.
const consultationFilters = [
    <TextInput key="q" label="Search by Name" source="q" alwaysOn />,
    <SelectInput key="status" source="status" label="Status" alwaysOn choices={[
        { id: 'requested', name: 'Requested' },
        { id: 'in_progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' },
        { id: 'cancelled', name: 'Cancelled' },
        { id: 'failed', name: 'Failed' },
        { id: 'customer_rejected', name: 'Customer Rejected' },
        { id: 'guide_rejected', name: 'Guide Rejected' },
        { id: 'customer_join_timeout', name: 'Customer Join Timeout' },
        { id: 'request_expired', name: 'Request Expired' },
    ]} />,
    <SelectInput key="mode" source="mode" label="Mode" choices={[
        { id: 'chat', name: 'Chat' },
        { id: 'call', name: 'Call' },
        { id: 'video', name: 'Video' },
    ]} />,
    <SelectInput key="category" source="category" label="Category" choices={[
        { id: 'astrology', name: 'Astrology' },
        { id: 'vastu', name: 'Vastu' },
        { id: 'numerology', name: 'Numerology' },
        { id: 'palmistry', name: 'Palmistry' },
        { id: 'tarot', name: 'Tarot' },
    ]} />,
    <SelectInput key="promotional" source="promotional" label="Promotional" choices={[
        { id: 'true', name: 'Promotional' },
        { id: 'false', name: 'Non-Promotional' },
    ]} />,
    <SelectInput key="free" source="free" label="Consultation Type" choices={[
        { id: 'true', name: 'Free' },
        { id: 'false', name: 'Paid' },
    ]} />,
    <TextInput key="id" label="Consultation ID (Exact)" source="id" placeholder="Enter consultation ID (e.g., 123)" />,
    <TextInput key="guide_id" label="Filter by Guide ID" source="guide_id" />,
    <TextInput key="customer_id" label="Filter by Customer ID" source="customer_id" />,
    <DateInput key="date_from" source="date_from" label="Start Date" />,
    <DateInput key="date_to" source="date_to" label="End Date" />,
];

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    variant: 'h6',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
}));

// --- Custom Actions for the List Header (e.g., Create & Filter buttons) ---
const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

// Component to fetch total count based on current filters
const TotalConsultationsCount = ({ currentFilters }: { currentFilters: any }) => {
    const dataProvider = useDataProvider();
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTotalCount = async () => {
            setLoading(true);

            // Small delay to ensure all filters are applied by React Admin
            setTimeout(async () => {
                try {
                    // Build filter parameters for total count API call
                    const filterParams: any = {};

                    console.log('Current filters received:', currentFilters);

                // Add query filter (search by name) if present
                if (currentFilters.q) {
                    filterParams.q = currentFilters.q;
                    console.log('Adding query filter:', currentFilters.q);
                }

                // Add status filter if selected
                if (currentFilters.status) {
                    filterParams.status = currentFilters.status;
                    console.log('Adding status filter:', currentFilters.status);
                }

                // Add date range filters if selected - these are critical!
                // Use the same parameter names that the dataProvider expects
                if (currentFilters.date_from) {
                    filterParams.date_from = currentFilters.date_from;
                    console.log('Adding date_from filter:', currentFilters.date_from);
                }
                if (currentFilters.date_to) {
                    filterParams.date_to = currentFilters.date_to;
                    console.log('Adding date_to filter:', currentFilters.date_to);
                }

                // Add other filters if present
                if (currentFilters.guide_id) {
                    filterParams.guide_id = currentFilters.guide_id;
                }
                if (currentFilters.customer_id) {
                    filterParams.customer_id = currentFilters.customer_id;
                }
                if (currentFilters.id) {
                    filterParams.consultation_id = currentFilters.id;
                }
                if (currentFilters.mode) {
                    // Map 'call' to 'voice' for API
                    filterParams.mode = currentFilters.mode === 'call' ? 'voice' : currentFilters.mode;
                }
                if (currentFilters.category) {
                    filterParams.category = currentFilters.category;
                }
                if (currentFilters.promotional !== undefined && currentFilters.promotional !== '') {
                    filterParams.promotional = currentFilters.promotional;
                }
                if (currentFilters.free !== undefined && currentFilters.free !== '') {
                    filterParams.free = currentFilters.free;
                }

                // Create a unique key for this filter combination to ensure proper re-fetch
                const filterKey = JSON.stringify(filterParams);
                console.log('Final filter parameters for total count API call:', filterParams);
                console.log('Filter key for debugging:', filterKey);

                // Make API call with minimal page size to get total count
                const response = await dataProvider.getList('consultations', {
                    pagination: { page: 1, perPage: 1 }, // Minimal data, just need total
                    sort: { field: 'id', order: 'DESC' },
                    filter: filterParams,
                });

                console.log('Total consultations count API response:', response);
                console.log('Total consultations count API result total:', response.total);
                setTotalCount(response.total ?? null);

              } catch (error) {
                console.error('Error fetching total consultations count:', error);
                setTotalCount(null);
            } finally {
                setLoading(false);
            }
            }, 200); // 200ms delay to allow React Admin to settle filters
        };

        fetchTotalCount();
    }, [JSON.stringify(currentFilters), dataProvider]); // Use stringified filters to ensure proper dependency

    return (
        <Box
            textAlign="center"
            p={2}
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="h4" fontWeight="bold" color="primary.main">
                {loading ? '...' : totalCount !== null ? totalCount.toLocaleString() : 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
                Total Consultations (All Filters Applied)
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
                {currentFilters.q && `Search: ${currentFilters.q}`}
                {currentFilters.status && ` | Status: ${currentFilters.status.toUpperCase()}`}
                {currentFilters.mode && ` | Mode: ${currentFilters.mode}`}
                {currentFilters.category && ` | Category: ${currentFilters.category}`}
                {currentFilters.promotional && ` | Promotional: ${currentFilters.promotional === 'true' ? 'Yes' : 'No'}`}
                {currentFilters.free && ` | Type: ${currentFilters.free === 'true' ? 'Free' : 'Paid'}`}
                {currentFilters.date_from && currentFilters.date_to && ` | Date: ${currentFilters.date_from} to ${currentFilters.date_to}`}
                {currentFilters.guide_id && ` | Guide ID: ${currentFilters.guide_id}`}
                {currentFilters.customer_id && ` | Customer ID: ${currentFilters.customer_id}`}
            </Typography>
        </Box>
    );
};

// --- Main Component Content ---
const ConsultationListContent = (props: any) => {
    const { filterValues } = useListContext();

    return (
        <Box>
            <Datagrid rowClick="show" bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { fontWeight: 'bold' } }} {...props}>
                {/* The `source` prop must match a key in the API response objects */}
                <TextField source="id" label="Consultation ID" />
                <TextField source="customer_name" label="Customer Name" />
                <TextField source="guide_name" label="Guide Name" />
                <NumberField source="guide_id" label="Guide ID" />

                {/* Use FunctionField to render our custom StatusField component */}
                <FunctionField
                    label="Status"
                    render={(record: any) => <StatusField record={record} />}
                />
                <TextField source='mode' label='Mode' />

                {/* WebRTC Call Button */}
                <FunctionField
                    label="Call"
                    render={(record: any) => {
                        // Try to get customer phone from different possible fields
                        const phoneNumber = record.customer_phone || record.phone || record.customer_phone_number;
                        if (!phoneNumber) {
                            return <span style={{ color: '#999', fontSize: '12px' }}>No phone</span>;
                        }
                        return (
                            <WebRTCCallButton
                                phoneNumber={phoneNumber}
                                customerName={record.customer_name}
                                consultationId={record.id}
                                label="📞 Call"
                            />
                        );
                    }}
                />

                <DateField source="requested_at" label="Requested At" showTime />
            </Datagrid>

            {/* Total Consultations Count */}
            <Box mt={3}>
                <StyledPaper>
                    <SectionTitle>Total Consultations (All Filters Applied)</SectionTitle>
                    <Box display="flex" justifyContent="center" p={2}>
                        <TotalConsultationsCount currentFilters={filterValues || {}} />
                    </Box>
                </StyledPaper>
            </Box>
        </Box>
    );
};

// --- Main Component ---
export const ConsultationList = (props: any) => (
    <List
      filters={consultationFilters}
      actions={<ListActions />}
      title="Consultations"
      perPage={25}
      {...props}
    >
        <ConsultationListContent />
    </List>
);