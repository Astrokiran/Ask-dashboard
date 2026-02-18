import React, { useState, useRef, useCallback } from 'react';
import { Create, SimpleForm, TextInput, SelectInput, NumberInput, useNotify, useRedirect } from 'react-admin';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Card,
    CardContent,
    Stack,
    Alert,
    Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { httpClient } from '../dataProvider';

const AUTH_API_URL = process.env.REACT_APP_AUTH_URL;
// Fix: AUTH_API_URL includes /auth at the end, but superadmin routes are at /api/v1/superadmin
const API_ROOT_URL = AUTH_API_URL?.replace(/\/auth$/, '') || '';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

interface PresignResponse {
    file_upload_url: string;
    file_s3_key: string;
    file_cdn_url: string;
    thumbnail_upload_url?: string;
    thumbnail_s3_key?: string;
    thumbnail_cdn_url?: string;
    expires_in_seconds: number;
}

export const StoryCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    const [videoDuration, setVideoDuration] = useState<number | null>(null);

    // CTA link state
    const [ctaEnabled, setCtaEnabled] = useState(false);
    const [ctaButtonText, setCtaButtonText] = useState('');
    const [ctaActionType, setCtaActionType] = useState<'url' | 'screen'>('url');
    const [ctaUrl, setCtaUrl] = useState('');
    const [ctaScreen, setCtaScreen] = useState('');

    const mediaInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const handleMediaSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const acceptedTypes = mediaType === 'image' ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES;
        if (!acceptedTypes.includes(file.type)) {
            notify(`Please select a valid ${mediaType} file`, { type: 'error' });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            notify('File is too large. Maximum size is 500 MB.', { type: 'error' });
            return;
        }

        setMediaFile(file);

        if (mediaType === 'video') {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                setVideoDuration(Math.round(video.duration));
                window.URL.revokeObjectURL(video.src);
            };
            video.src = URL.createObjectURL(file);
        }
    }, [mediaType, notify]);

    const handleThumbnailSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            notify('Please select a valid image file for the thumbnail', { type: 'error' });
            return;
        }
        setThumbnailFile(file);
    }, [notify]);

    const uploadToS3 = (presignedUrl: string, file: File, contentType: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignedUrl, true);
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setUploadProgress(Math.round((event.loaded / event.total) * 100));
                }
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`Upload failed with status ${xhr.status}`));
            };
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.send(file);
        });
    };

    const handleSubmit = async (formData: any) => {
        if (!mediaFile) {
            notify('Please select a media file to upload', { type: 'error' });
            return;
        }
        if (!formData.title?.trim()) {
            notify('Please enter a title', { type: 'error' });
            return;
        }

        setUploading(true);

        try {
            // Step 1: Get presigned URLs
            setUploadStage('Getting upload URLs...');
            setUploadProgress(0);

            const presignPayload: any = {
                media_type: mediaType,
                file_name: mediaFile.name,
                mime_type: mediaFile.type,
            };
            if (thumbnailFile) {
                presignPayload.thumbnail_file_name = thumbnailFile.name;
                presignPayload.thumbnail_mime_type = thumbnailFile.type;
            }

            const { json: presignJson } = await httpClient(
                `${API_ROOT_URL}/superadmin/media/presign`,
                { method: 'POST', body: JSON.stringify(presignPayload) }
            );
            const presignData: PresignResponse = presignJson.data;

            // Step 2: Upload media file to S3
            setUploadStage(`Uploading ${mediaType}...`);
            await uploadToS3(presignData.file_upload_url, mediaFile, mediaFile.type);

            // Step 3: Upload thumbnail if provided
            if (thumbnailFile && presignData.thumbnail_upload_url) {
                setUploadStage('Uploading thumbnail...');
                setUploadProgress(0);
                await uploadToS3(presignData.thumbnail_upload_url, thumbnailFile, thumbnailFile.type);
            }

            // Step 4: Build metadata with CTA link
            const metadata: any = {};
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
            }

            // Step 5: Save metadata to backend
            setUploadStage('Saving story...');
            setUploadProgress(100);

            const createPayload: any = {
                title: formData.title.trim(),
                media_type: mediaType,
                file_s3_key: presignData.file_s3_key,
                file_url: presignData.file_cdn_url,
                mime_type: mediaFile.type,
                file_size_bytes: mediaFile.size,
                purpose: 'story',
                sort_order: formData.sort_order || 0,
                metadata,
            };

            if (mediaType === 'video' && videoDuration) {
                createPayload.duration_seconds = videoDuration;
            }

            if (thumbnailFile && presignData.thumbnail_s3_key && presignData.thumbnail_cdn_url) {
                createPayload.thumbnail_s3_key = presignData.thumbnail_s3_key;
                createPayload.thumbnail_url = presignData.thumbnail_cdn_url;
            }

            await httpClient(`${API_ROOT_URL}/superadmin/media`, {
                method: 'POST',
                body: JSON.stringify(createPayload),
            });

            notify('Story created successfully!', { type: 'success' });
            redirect('list', 'stories');
        } catch (error: any) {
            console.error('Upload failed:', error);
            notify(`Upload failed: ${error.message || 'Unknown error'}`, { type: 'error' });
        } finally {
            setUploading(false);
            setUploadStage('');
            setUploadProgress(0);
        }
    };

    return (
        <Create title="Create Story">
            <SimpleForm onSubmit={handleSubmit} toolbar={false}>
                <Box sx={{ maxWidth: 600, width: '100%' }}>
                    <TextInput source="title" label="Story Title" fullWidth required disabled={uploading} />

                    {/* Media type selector */}
                    <SelectInput
                        source="media_type_select"
                        label="Media Type"
                        choices={[
                            { id: 'image', name: 'Image' },
                            { id: 'video', name: 'Video' },
                        ]}
                        defaultValue="image"
                        onChange={(e) => {
                            setMediaType(e.target.value as 'image' | 'video');
                            setMediaFile(null);
                            setVideoDuration(null);
                        }}
                        disabled={uploading}
                        fullWidth
                    />

                    <NumberInput
                        source="sort_order"
                        label="Display Order"
                        defaultValue={0}
                        helperText="Lower numbers appear first"
                        disabled={uploading}
                        fullWidth
                    />

                    {/* Media file picker */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                {mediaType === 'image' ? 'Image' : 'Video'} File *
                            </Typography>
                            <input
                                ref={mediaInputRef}
                                type="file"
                                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                                style={{ display: 'none' }}
                                onChange={handleMediaSelect}
                                disabled={uploading}
                            />
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    variant="outlined"
                                    startIcon={mediaFile ? <CheckCircleIcon color="success" /> : <CloudUploadIcon />}
                                    onClick={() => mediaInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {mediaFile ? `Change ${mediaType}` : `Select ${mediaType}`}
                                </Button>
                                {mediaFile && (
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{mediaFile.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(mediaFile.size / (1024 * 1024)).toFixed(1)} MB
                                            {videoDuration && ` • ${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Thumbnail picker */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Thumbnail (shown in story ring)
                            </Typography>
                            <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleThumbnailSelect}
                                disabled={uploading}
                            />
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={thumbnailFile ? <CheckCircleIcon color="success" /> : <CloudUploadIcon />}
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {thumbnailFile ? 'Change Thumbnail' : 'Select Thumbnail'}
                                </Button>
                                {thumbnailFile && (
                                    <Typography variant="body2">{thumbnailFile.name}</Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* CTA Link Section (primarily for images) */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">CTA Link (Optional)</Typography>
                                <Button
                                    size="small"
                                    variant={ctaEnabled ? 'contained' : 'outlined'}
                                    onClick={() => setCtaEnabled(!ctaEnabled)}
                                    disabled={uploading}
                                >
                                    {ctaEnabled ? 'Enabled' : 'Enable'}
                                </Button>
                            </Stack>

                            {ctaEnabled && (
                                <Box sx={{ mt: 1 }}>
                                    <TextInput
                                        source="cta_button_text"
                                        label="Button Text"
                                        fullWidth
                                        disabled={uploading}
                                        onChange={(e) => setCtaButtonText(e.target.value)}
                                        helperText='e.g. "View Offer", "See Profile"'
                                    />
                                    <SelectInput
                                        source="cta_action_type"
                                        label="Action Type"
                                        choices={[
                                            { id: 'url', name: 'Open URL (WebView)' },
                                            { id: 'screen', name: 'Navigate to Screen' },
                                        ]}
                                        defaultValue="url"
                                        onChange={(e) => setCtaActionType(e.target.value as 'url' | 'screen')}
                                        disabled={uploading}
                                        fullWidth
                                    />
                                    {ctaActionType === 'url' ? (
                                        <TextInput
                                            source="cta_url"
                                            label="URL"
                                            fullWidth
                                            disabled={uploading}
                                            onChange={(e) => setCtaUrl(e.target.value)}
                                            helperText="Full URL including https://"
                                        />
                                    ) : (
                                        <TextInput
                                            source="cta_screen"
                                            label="Screen Name"
                                            fullWidth
                                            disabled={uploading}
                                            onChange={(e) => setCtaScreen(e.target.value)}
                                            helperText='e.g. "payment-details", "guide-profile"'
                                        />
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Divider sx={{ my: 2 }} />

                    {/* Upload progress */}
                    {uploading && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="info" sx={{ mb: 1 }}>{uploadStage}</Alert>
                            <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
                            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
                                {uploadProgress}%
                            </Typography>
                        </Box>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        disabled={uploading || !mediaFile}
                        startIcon={<CloudUploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Create Story'}
                    </Button>
                </Box>
            </SimpleForm>
        </Create>
    );
};
