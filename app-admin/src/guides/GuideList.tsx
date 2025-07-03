import {
  List,
  useListContext,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  TextInput,
  SelectInput,
  ShowButton,
  BulkDeleteButton,
  BulkUpdateButton,
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

const statusChoices = [
    { id: 'online', name: 'Online' },
    { id: 'offline', name: 'Offline' },
    { id: 'busy', name: 'Busy' },
];

const guideFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
    <SelectInput
      source="status"
      label="Status"
      choices={statusChoices}
      alwaysOn
    />,
];

const ListActions = () => {
    const { selectedIds } = useListContext();
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

  const isAllSelected = data && selectedIds.length === data.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected || isSomeSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Phone</TableHead> {/* 1. Add the Phone header */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                  <Link to={`/guides/${guide.id}/show`}>{guide.name}</Link>
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {guide.skills?.map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={guide.status === 'online' ? 'default' : 'secondary'}>
                  {guide.status}
                </Badge>
              </TableCell>
              <TableCell>{guide.phone}</TableCell> {/* 2. Add the Phone data cell */}
              <TableCell className="text-right">
                <ShowButton record={guide}>
                    <Button variant="outline" size="sm">View Profile</Button>
                </ShowButton>
              </TableCell>
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