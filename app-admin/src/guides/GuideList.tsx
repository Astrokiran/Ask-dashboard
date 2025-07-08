import {
  List,
  useListContext,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  TextInput,
  Filter,
  SelectInput,
  ShowButton,
  
  BulkDeleteButton,
  BulkUpdateButton,
  BooleanField,
} from 'react-admin';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
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
                variant="default"
                onClick={() => navigate('/pending-verifications')}
            >
                KYC Pending Review
            </Button>
        </TopToolbar>
    );
};

const GuideListView = () => {
    const { data, isLoading, selectedIds, onToggleItem, onSelect } = useListContext();

    if (isLoading || !data) return null;

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            onSelect(data.map(record => record.id));
        } else {
            onSelect([]);
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedIds.length === data.length}
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Status</TableHead>

                        <TableHead>Skills</TableHead>
                        <TableHead>Total Consultations</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* The .map() function should return a <TableRow> with ONLY <TableCell> children */}
                    {data.map(guide => (
                        <TableRow key={guide.id} data-state={selectedIds.includes(guide.id) ? 'selected' : undefined}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.includes(guide.id)}
                                    onCheckedChange={() => onToggleItem(guide.id)}
                                />
                            </TableCell>
                            <TableCell>{guide.id}</TableCell>
                            <TableCell className="font-medium">
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link to={`/guides/${guide.id}/show`}>{guide.full_name}</Link>
                                </Button>
                            </TableCell>
                            <TableCell>{guide.phone_number}</TableCell>
                            <TableCell>
                            <Badge variant={guide.status === 'online' ? 'default' : 'secondary'}>
                                {guide.status}
                            </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {guide.skills?.map((skill: any) => <Badge key={skill.id || skill} variant="secondary">{skill.name || skill}</Badge>)}
                                </div>
                            </TableCell>

                            <TableCell>{guide.number_of_consultation}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export const GuideList = () => (
  <List actions={<ListActions />} filters={guideFilters} title="Guides">
    <GuideListView />
  </List>
);