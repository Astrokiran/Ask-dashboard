import {
  List,
  useListContext,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  TextInput,
  SelectInput,
  Datagrid,
  TextField,
  NumberField,
  FunctionField,
  BulkUpdateButton,
  BulkDeleteButton,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const statusChoices = [
    { id: 'true', name: 'Online' },
    { id: 'false', name: 'Offline' },
];

const guideFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
    <SelectInput
      source="online"
      label="Status"
      choices={statusChoices}
      alwaysOn
    />,
];

const ListActions = () => {
    const { selectedIds } = useListContext();
    const navigate = useNavigate();
    const isBulkActionsVisible = selectedIds && selectedIds.length > 0;

    return (
        <TopToolbar>
            {isBulkActionsVisible ? (
                <div className="flex gap-2">
                    <BulkUpdateButton data={{ verificationStatus: 'verified' }} label="Verify Selected"/>
                    <BulkDeleteButton mutationMode="pessimistic" />
                </div>
            ) : (
                <>
                    <FilterButton />
                    <CreateButton />
                    <ExportButton />
                </>
            )}
            <Button
                variant="contained"
                onClick={() => navigate('/pending-verifications')}
            >
                KYC Pending Review
            </Button>
        </TopToolbar>
    );
};

// Status field component that respects theme
const StatusField = ({ record }: { record?: any }) => {
    if (!record) return null;
    const isOnline = record.status === 'online';
    return (
        <Chip
            label={record.status}
            sx={{
                bgcolor: isOnline ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                color: isOnline ? '#4caf50' : '#9e9e9e',
                fontWeight: 500,
                textTransform: 'capitalize',
            }}
        />
    );
};

export const GuideList = () => (
  <List
    actions={<ListActions />}
    filters={guideFilters}
    title="Guides"
  >
    <Datagrid
      rowClick="show"
      bulkActionButtons={false}
      sx={{
        '& .RaDatagrid-headerCell': {
          fontWeight: 'bold',
        },
      }}
    >
      <TextField source="id" label="ID" />
      <FunctionField
        source="profile_picture_url"
        label="Profile"
        render={(record: any) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {record?.profile_picture_url ? (
              <img
                src={record.profile_picture_url}
                alt={record.full_name}
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
            ) : (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {record?.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        )}
      />
      <TextField source="full_name" label="Name" />
      <TextField source="tier" label="Tier" />
      <FunctionField
        label="Status"
        render={(record: any) => <StatusField record={record} />}
      />
      <FunctionField
        source="skills"
        label="Skills"
        render={(record: any) => (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {record?.skills?.map((skill: any, index: number) => (
              <Chip
                key={skill.id || skill || index}
                label={skill.name || skill}
                size="small"
                sx={{ bgcolor: 'action.selected', fontSize: '0.75rem' }}
              />
            ))}
          </div>
        )}
      />
      <NumberField
        source="guide_stats.total_number_of_completed_consultations"
        label="Total Consultations"
        sortable={false}
      />
      <FunctionField
        label="Rating"
        render={(record: any) => (
          <span style={{ color: '#ff9800', fontWeight: 600 }}>
            {record?.guide_stats?.rating || record?.rating || 'N/A'}
          </span>
        )}
      />
    </Datagrid>
  </List>
);