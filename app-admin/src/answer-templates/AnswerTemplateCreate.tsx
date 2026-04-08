import React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, BooleanInput, SelectInput } from 'react-admin';
import { Box, Typography, Alert } from '@mui/material';

export const AnswerTemplateCreate = () => (
    <Create title="Create Answer Template" redirect="list">
        <SimpleForm>
            <SelectInput
                source="question_id"
                label="Question"
                choices={[
                    { name: 'Career - What\'s happening in my career right now?', id: 1 },
                    { name: 'Career - When will I get a job promotion?', id: 2 },
                    { name: 'Career - Should I change my job or business?', id: 3 },
                    { name: 'Career - What are my career prospects based on my kundli?', id: 4 },
                    { name: 'Marriage - When will I get married?', id: 5 },
                    { name: 'Marriage - What does my kundli say about my married life?', id: 6 },
                    { name: 'Marriage - Will I have a love marriage or arranged marriage?', id: 7 },
                    { name: 'Health - What are the health concerns in my kundli?', id: 8 },
                    { name: 'Health - How will my health be in the coming year?', id: 9 },
                    { name: 'Finance - What does my kundli say about my wealth?', id: 10 },
                    { name: 'Finance - When will I see financial improvement in my life?', id: 11 },
                    { name: 'Education - Will I succeed in my upcoming exams?', id: 12 },
                    { name: 'Education - Should I pursue higher education abroad?', id: 13 },
                    { name: 'Family - What does my kundli say about having children?', id: 14 },
                    { name: 'Family - How can I improve my family relationships?', id: 15 },
                    { name: 'Life - What are my career prospects?', id: 21 },
                ]}
                optionText="name"
                optionValue="id"
                required
            />

            <TextInput
                source="template_name"
                label="Template Name"
                helperText="Unique identifier for this template (e.g., 'career_overview_default')"
                fullWidth
                required
            />

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Template Content (with Handlebars placeholders)
                </Typography>
                <Alert severity="info" sx={{ mb: 1 }}>
                    Use Handlebars syntax: {'{{lagna}}'}, {'{{current_dasha_lord}}'}, {'{{#if}}'}...{'{{/if}}'}, etc.
                </Alert>
                <TextInput
                    source="template_content"
                    label="Template Content"
                    helperText="Supports Handlebars templating with variables like lagna, current_dasha_lord, key_planets, etc."
                    multiline
                    rows={15}
                    fullWidth
                    required
                    sx={{
                        '& .MuiInputBase-input': {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                        },
                    }}
                />
            </Box>

            <NumberInput
                source="priority"
                label="Priority"
                helperText="Higher priority templates are matched first"
                defaultValue={10}
                min={0}
            />

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Conditions (JSON)
                </Typography>
                <Alert severity="info" sx={{ mb: 1 }}>
                    Enter conditions as JSON. Example: {'{ "dasha_favorable": true }'}
                </Alert>
                <TextInput
                    source="conditions"
                    label="Conditions"
                    helperText="JSON object specifying when this template should be used"
                    multiline
                    rows={5}
                    fullWidth
                    sx={{
                        '& .MuiInputBase-input': {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                        },
                    }}
                    parse={(value) => {
                        try {
                            return value ? JSON.parse(value) : {};
                        } catch (e) {
                            return value;
                        }
                    }}
                    format={(value) => {
                        return typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
                    }}
                />
            </Box>

            <BooleanInput
                source="is_active"
                label="Is Active"
                defaultValue={true}
            />
        </SimpleForm>
    </Create>
);
