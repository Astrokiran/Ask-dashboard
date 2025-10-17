import {
  List,
  useListContext,
  TopToolbar,
  CreateButton,
  FilterButton,
  TextInput,
  SelectInput,
} from 'react-admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import QrCode from 'react-qr-code';

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
    </TopToolbar>
);

const statusChoices = [
    { id: 'pending_payment', name:'Pending Payment'},
    { id: 'payment_confirmed', name:'Payment Confirmed'},
    { id: 'rescheduled', name:'Rescheduled'},
    { id: 'delivered', name:'Delivered'},
    { id: 'feedback_delivered', name:'Feedback Delivered'},
    { id: 'failed_delivery', name:'Failed Delivery'},
    { id: 'cancelled', name:'Cancelled'}
];

const orderFilters = [
    <TextInput label="Search" source="q" alwaysOn/>,
    <SelectInput
      source='status'
      label='Status'
      choices={statusChoices}
      alwaysOn
    />,
];

const OrderListView = () => {
  const { data, isLoading } = useListContext();
  if (isLoading || !data) return null;

  return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Consultation Type</TableHead>
            <TableHead>Payment QR</TableHead>
            <TableHead>Active Consultations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>
                <div>{order.customer.name}</div>
                <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
              </TableCell>
              <TableCell>
                <Badge>{order.status}</Badge>
              </TableCell>
              <TableCell>{order.consultationType}</TableCell>
              <TableCell>
                <div style={{ padding: '8px', width: 'fit-content', borderRadius: '4px' }}>
                  <QrCode value={order.paymentUrl || 'no-url'} size={64} />
                </div>
              </TableCell>
              <TableCell>{order.activeConsultations}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const OrderList = () => (
  <List actions={<ListActions />} filters={orderFilters} title="Orders">
    <OrderListView />
  </List>
);