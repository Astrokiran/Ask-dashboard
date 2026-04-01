import React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, BooleanInput } from 'react-admin';

const commonIconNames = [
    'briefcase', 'heart', 'star', 'home', 'car', 'health', 'education',
    'money', 'family', 'travel', 'career', 'love', 'business', 'child',
    'relationship', 'marriage', 'property', 'investment', 'fortune'
];

export const QuestionCategoryCreate = () => (
    <Create title="Create Question Category" redirect="list">
        <SimpleForm>
            <TextInput
                source="name"
                label="Internal Name"
                helperText="Unique identifier (e.g., 'life', 'career')"
                fullWidth
                required
            />
            <TextInput
                source="display_name"
                label="Display Name"
                helperText="User-friendly name shown in the app (e.g., 'Life & Business')"
                fullWidth
                required
            />
            <TextInput
                source="description"
                label="Description"
                helperText="Brief description of this category"
                multiline
                rows={3}
                fullWidth
            />
            <TextInput
                source="icon"
                label="Icon Name"
                helperText={`Lucide icon name. Common options: ${commonIconNames.join(', ')}`}
                fullWidth
                defaultValue="star"
            />
            <NumberInput
                source="display_order"
                label="Display Order"
                helperText="Lower numbers appear first"
                defaultValue={0}
                min={0}
            />
            <BooleanInput
                source="is_active"
                label="Is Active"
                defaultValue={true}
            />
        </SimpleForm>
    </Create>
);
