import { FC, MouseEvent } from "react";
import {
  List,
  useListContext,
  CreateButton,
  TopToolbar,
  ExportButton,
  DateField,
  BulkDeleteButton,
  Filter,
  TextInput,
  SelectInput,
} from "react-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"; 
import { Checkbox } from "../components/ui/checkbox"; 
import { Badge } from "../components/ui/badge"; 

interface Consultation {
  id: string | number;
  guide: string;
  customer: {
    name: string;
    phone: string;
  };
  status: 'Completed' | 'In Progress' | 'Customer Canceled' | 'Short Duration';
  duration: number;
  conversationDuration: number;
  createdAt: string;
}

const consultationStatusChoices = [
    { id: 'Completed', name: 'Completed' },
    { id: 'In Progress', name: 'In Progress' },
    { id: 'Customer Canceled', name: 'Customer Canceled' },
    { id: 'Short Duration', name: 'Short Duration' },
];

const ConsultationFilter: FC = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <SelectInput
            source="status"
            label="Status"
            choices={consultationStatusChoices}
        />
    </Filter>
);


const statusStyles: Record<Consultation['status'], string> = {
  "Completed": "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30",
  "In Progress": "bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30",
  "Customer Canceled": "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30",
  "Short Duration": "bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30",
};

const StatusBadge: FC<{ status: Consultation['status'] }> = ({ status }) => (
  <Badge className={statusStyles[status] || ''}>
    {status}
  </Badge>
);

interface ConsultationListItemProps {
  consultation: Consultation;
  isSelected: boolean;
  onToggle: (id: Consultation['id']) => void;
}

const ConsultationListItem: FC<ConsultationListItemProps> = ({ consultation, isSelected, onToggle }) => {
  const handleCheckboxClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggle(consultation.id);
  };

  return (
    <TableRow
      key={consultation.id}
      className="cursor-pointer"
      onClick={() => onToggle(consultation.id)}
    >
      <TableCell onClick={handleCheckboxClick}>
        <Checkbox checked={isSelected} />
      </TableCell>
      <TableCell className="font-medium">{consultation.id}</TableCell>
      <TableCell>{consultation.guide}</TableCell>
      <TableCell>
        <div>{consultation.customer.name}</div>
        <div className="text-sm text-muted-foreground">
          {consultation.customer.phone}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={consultation.status} />
      </TableCell>
      <TableCell>{consultation.duration} mins</TableCell>
      <TableCell>{consultation.conversationDuration}s</TableCell>
      <TableCell>
        <DateField record={consultation} source="createdAt" showTime />
      </TableCell>
    </TableRow>
  );
};

const ConsultationDataGrid = () => {
  const { data, selectedIds, onToggleItem, onSelect, isLoading } = useListContext<Consultation>();

  if (isLoading) return <div>Loading...</div>;
  if (!data || data.length === 0) return <div>No consultations found.</div>;

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      onSelect(data.map(item => item.id));
    } else {
      onSelect([]);
    }
  };

  const isAllSelected = selectedIds.length === data.length && data.length > 0;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: '50px' }}>
            <Checkbox
              onCheckedChange={handleSelectAll}
              checked={isAllSelected}
              indeterminate={isSomeSelected}
            />
          </TableHead>
          <TableHead>Consultation ID</TableHead>
          <TableHead>Guide</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Conversation Duration</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((consultation) => (
          <ConsultationListItem
            key={consultation.id}
            consultation={consultation}
            isSelected={selectedIds.includes(consultation.id)}
            onToggle={onToggleItem}
          />
        ))}
      </TableBody>
    </Table>
  );
};


const ConsultationListActions = () => (
  <TopToolbar>
    <CreateButton label="Create Consultation" />
    <ExportButton />
  </TopToolbar>
);

const ConsultationBulkActionButtons = () => (
    <BulkDeleteButton />
);

export const ConsultationList = () => (
  <List
    actions={<ConsultationListActions />}
    bulkActionButtons={<ConsultationBulkActionButtons />}
    filters={<ConsultationFilter />}
    empty={false}
    sort={{ field: 'createdAt', order: 'DESC' }}
  >
    <ConsultationDataGrid />
  </List>
);