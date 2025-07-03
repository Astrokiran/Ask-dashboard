import {
  List,
  useListContext,
  CreateButton,
  TopToolbar,
  ExportButton,
  DateField,
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
import { FC } from "react";

// Helper component to render status with appropriate colors
const StatusBadge: FC<{ status: string }> = ({ status }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  switch (status) {
    case "Completed":
      variant = "default";
      break;
    case "In Progress":
      variant = "secondary";
      break;
    case "Customer Canceled":
    case "Short Duration":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }

  const style = {
    Completed: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
    "In Progress": "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    "Customer Canceled": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    "Short Duration": "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  };

  return (
    <Badge variant={variant} className={style[status as keyof typeof style] || ''}>
      {status}
    </Badge>
  );
};


// Custom Datagrid View using shadcn/ui Table
const ConsultationDataGrid = () => {
  const { data, selectedIds, onToggleItem, isLoading } = useListContext();

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: '50px' }}>
            <Checkbox
              onCheckedChange={(checked) => {
                if (checked) {
                  onToggleItem(data.map((item) => item.id));
                } else {
                  onToggleItem([]);
                }
              }}
              checked={selectedIds.length > 0 && selectedIds.length === data.length}
              indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
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
          <TableRow 
            key={consultation.id} 
            className="cursor-pointer"
            onClick={() => onToggleItem(consultation.id)}
          >
            <TableCell>
              <Checkbox
                checked={selectedIds.includes(consultation.id)}
                onCheckedChange={() => onToggleItem(consultation.id)}
              />
            </TableCell>
            <TableCell className="font-medium">
              {consultation.id}
            </TableCell>
            <TableCell>{consultation.guide}</TableCell>
            <TableCell>
              <div>{consultation.customer.name}</div>
              <div className="text-muted-foreground text-sm">
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
        ))}
      </TableBody>
    </Table>
  );
};

// Actions for the List view with the FilterButton REMOVED
const ConsultationListActions = () => (
    <TopToolbar>
        {/* <FilterButton />  // REMOVED to prevent the error */}
        <CreateButton label="Create Consultation" />
        <ExportButton />
    </TopToolbar>
);

// The main List component export with the filters prop REMOVED
export const ConsultationList = () => (
  <List
    actions={<ConsultationListActions />}
    // filters prop REMOVED
    empty={false} 
    sort={{ field: 'createdAt', order: 'DESC' }}
  >
    <ConsultationDataGrid />
  </List>
);