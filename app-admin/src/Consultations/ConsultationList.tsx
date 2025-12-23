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
} from 'react-admin';
import { Chip } from '@mui/material';
import { Box, Typography, Paper, Grid, styled } from '@mui/material';
import { useState, useEffect } from 'react';

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
        // Add any other states from your API here
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
        <Box textAlign="center" p={2} className="bg-white rounded border">
            <Typography variant="h4" fontWeight="bold" color="primary.main">
                {loading ? '...' : totalCount !== null ? totalCount.toLocaleString() : 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
                Total Consultations (All Filters Applied)
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
                {currentFilters.q && `Search: ${currentFilters.q}`}
                {currentFilters.status && ` | Status: ${currentFilters.status.toUpperCase()}`}
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