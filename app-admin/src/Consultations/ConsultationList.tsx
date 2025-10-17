// /consultations/ConsultationList.tsx
import {
    List,
    Datagrid,
    TextField,
    TextInput,
    SelectInput,
    FunctionField,
    TopToolbar,
    FilterButton,
    CreateButton,
    ExportButton,
    NumberField,
    DateField,
} from 'react-admin';
import { Chip } from '@mui/material';

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
    <TextInput key="id" label="Filter by Consultation ID" source="id" />,

    <TextInput key="guide_id" label="Filter by Guide ID" source="guide_id" />,
    <TextInput key="customer_id" label="Filter by Customer ID" source="customer_id" />,
];

// --- Custom Actions for the List Header (e.g., Create & Filter buttons) ---
const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

// --- Main Component ---
export const ConsultationList = () => (
    <List
      filters={consultationFilters}
      actions={<ListActions />}
      title="Consultations"
      perPage={25}
    >
        <Datagrid rowClick="show" bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { fontWeight: 'bold' } }}>
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

            <DateField source="requested_at" label="Requested At" showTime />
        </Datagrid>
    </List>
);

export default ConsultationList;