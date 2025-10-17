// Create a new file: GuideEdit.tsx

import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    required,
    email,
    Toolbar,
    SaveButton,
    DeleteButton,
} from 'react-admin';
import { Card, CardContent } from '../components/ui/card';

// Custom toolbar to remove the "Delete" button if you don't need it
const EditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

export const GuideEdit = () => (
    <Edit title="Edit Guide Profile">
        <SimpleForm toolbar={<EditToolbar />}>
            <Card className="p-4 w-full max-w-2xl">
                <CardContent className="space-y-4">
                    <TextInput source="id" disabled fullWidth />
                    <TextInput source="full_name" validate={[required()]} fullWidth />
                    <TextInput source="email" validate={[required(), email()]} fullWidth />
                    <TextInput source="phone_number" validate={[required()]} fullWidth />
                    <NumberInput source="years_of_experience" fullWidth />
                    <TextInput source="bio" multiline fullWidth />
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);