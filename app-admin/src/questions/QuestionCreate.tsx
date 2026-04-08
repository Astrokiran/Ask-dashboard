import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput } from 'react-admin';

export const QuestionCreate = () => (
    <Create title="Create Question" redirect="list">
        <SimpleForm>
            <SelectInput
                source="category"
                label="Category"
                choices={[
                    { name: 'career', id: 'career' },
                    { name: 'marriage', id: 'marriage' },
                    { name: 'health', id: 'health' },
                    { name: 'finance', id: 'finance' },
                    { name: 'education', id: 'education' },
                    { name: 'family', id: 'family' },
                    { name: 'life', id: 'life' },
                ]}
                optionText="name"
                optionValue="id"
                validate={[() => undefined]}
                required
            />

            <TextInput
                source="question_text"
                label="Question Text"
                helperText="The actual question shown to users (e.g., 'What are my career prospects based on my kundli?')"
                multiline
                rows={3}
                fullWidth
                required
            />

            <TextInput
                source="question_key"
                label="Question Key"
                helperText="Unique identifier for this question (e.g., 'career_prospects_kundli')"
                fullWidth
                required
            />
        </SimpleForm>
    </Create>
);
