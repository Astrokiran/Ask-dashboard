import React, { useState, useEffect } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    NumberInput,
    useRecordContext,
    useNotify,
    useRedirect,
    SaveButton,
    Toolbar
} from 'react-admin';
import { Box, Card, CardContent, Typography, Stack, Button, Divider } from '@mui/material';

const StoryEditToolbar = (props: any) => (
    <Toolbar {...props} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <SaveButton />
    </Toolbar>
);

const StoryEditForm = () => {
    const record = useRecordContext();
    const notify = useNotify();

    // Internal state for CTA handling
    const [ctaEnabled, setCtaEnabled] = useState(false);
    const [ctaButtonText, setCtaButtonText] = useState('');
    const [ctaActionType, setCtaActionType] = useState<'url' | 'screen'>('url');
    const [ctaUrl, setCtaUrl] = useState('');
    const [ctaScreen, setCtaScreen] = useState('');

    useEffect(() => {
        if (record && record.metadata && record.metadata.link) {
            setCtaEnabled(true);
            const link = record.metadata.link;
            setCtaButtonText(link.button_text || '');
            if (link.action) {
                setCtaActionType(link.action.type || 'url');
                setCtaUrl(link.action.url || '');
                setCtaScreen(link.action.screen || '');
            }
        } else {
            setCtaEnabled(false);
            setCtaButtonText('');
            setCtaActionType('url');
            setCtaUrl('');
            setCtaScreen('');
        }
    }, [record]);

    const transformData = (data: any) => {
        // Prepare metadata payload
        const metadata: any = { ...data.metadata };

        if (ctaEnabled && ctaButtonText.trim()) {
            const action: any = { type: ctaActionType };
            if (ctaActionType === 'url') {
                action.url = ctaUrl;
            } else {
                action.screen = ctaScreen;
            }
            metadata.link = {
                button_text: ctaButtonText.trim(),
                action,
            };
        } else {
            // If CTA is disabled or empty, remove it
            if (metadata && metadata.link) {
                delete metadata.link;
            }
        }

        return {
            ...data,
            title: data.title?.trim(),
            metadata
        };
    };

    if (!record) return null;

    return (
        <SimpleForm toolbar={<StoryEditToolbar />}>
            <Box sx={{ maxWidth: 600, width: '100%' }}>
                {/* Media Preview (Read-only) */}
                <Card variant="outlined" sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        component={record.media_type === 'video' ? 'video' : 'img'}
                        src={record.thumbnail_url || record.file_url}
                        controls={record.media_type === 'video'}
                        sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: '8px',
                            backgroundColor: '#f5f5f5'
                        }}
                    />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{record.media_type === 'video' ? 'Video Story' : 'Image Story'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Media cannot be changed after creation.
                            To change media, orchestrate a new story.
                        </Typography>
                    </Box>
                </Card>

                <TextInput source="title" label="Story Title" fullWidth required />

                <SelectInput
                    source="status"
                    label="Status"
                    choices={[
                        { id: 'active', name: 'Active' },
                        { id: 'pending', name: 'Pending' },
                        { id: 'archived', name: 'Archived' },
                    ]}
                    fullWidth
                    required
                />

                <NumberInput
                    source="sort_order"
                    label="Display Order"
                    helperText="Lower numbers appear first"
                    fullWidth
                />

                {/* CTA Link Section */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="subtitle2">CTA Link (Optional)</Typography>
                            <Button
                                size="small"
                                variant={ctaEnabled ? 'contained' : 'outlined'}
                                onClick={() => setCtaEnabled(!ctaEnabled)}
                            >
                                {ctaEnabled ? 'Enabled' : 'Enable'}
                            </Button>
                        </Stack>

                        {ctaEnabled && (
                            <Box sx={{ mt: 1 }}>
                                <TextInput
                                    source="metadata.link.button_text"
                                    label="Button Text"
                                    fullWidth
                                    value={ctaButtonText}
                                    onChange={(e) => setCtaButtonText(e.target.value)}
                                    helperText='e.g. "View Offer", "See Profile"'
                                />
                                <SelectInput
                                    source="metadata.link.action.type"
                                    label="Action Type"
                                    choices={[
                                        { id: 'url', name: 'Open URL (WebView)' },
                                        { id: 'screen', name: 'Navigate to Screen' },
                                    ]}
                                    value={ctaActionType}
                                    onChange={(e) => setCtaActionType(e.target.value as 'url' | 'screen')}
                                    fullWidth
                                />
                                {ctaActionType === 'url' ? (
                                    <TextInput
                                        source="metadata.link.action.url"
                                        label="URL"
                                        fullWidth
                                        value={ctaUrl}
                                        onChange={(e) => setCtaUrl(e.target.value)}
                                        helperText="Full URL including https://"
                                    />
                                ) : (
                                    <TextInput
                                        source="metadata.link.action.screen"
                                        label="Screen Name"
                                        fullWidth
                                        value={ctaScreen}
                                        onChange={(e) => setCtaScreen(e.target.value)}
                                        helperText='e.g. "payment-details", "guide-profile"'
                                    />
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </SimpleForm>
    );
};

export const StoryEdit = () => {
    // We can't reuse component's internal state in transform easily, so we handle it there by keeping states
    return (
        <Edit title="Edit Story" mutationMode="pessimistic" transform={(data) => {
            // Re-apply the basic transform logic without using React state
            const metadata: any = { ...data.metadata };

            // In react-admin, SimpleForm bound inputs update the 'data' object.
            // So if button_text exists in metadata.link.button_text, we keep it
            if (data.metadata?.link?.button_text?.trim()) {
                const action: any = { type: data.metadata.link.action?.type || 'url' };
                if (action.type === 'url') {
                    action.url = data.metadata.link.action?.url || '';
                } else {
                    action.screen = data.metadata.link.action?.screen || '';
                }
                metadata.link = {
                    button_text: data.metadata.link.button_text.trim(),
                    action
                };
            } else {
                if (metadata.link) {
                    delete metadata.link;
                }
            }
            return {
                ...data,
                title: data.title?.trim(),
                metadata
            };
        }}>
            <StoryEditForm />
        </Edit>
    );
};
