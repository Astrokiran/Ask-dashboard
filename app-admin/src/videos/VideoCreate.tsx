import React, { useState, useRef, useCallback } from 'react';
import { Create, SimpleForm, TextInput, useNotify, useRedirect } from 'react-admin';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Card,
    CardContent,
    Stack,
    Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { httpClient } from '../dataProvider';

const AUTH_API_URL = process.env.REACT_APP_AUTH_URL;
// Fix: AUTH_API_URL includes /auth at the end, but superadmin routes are at /api/v1/superadmin
// We need to strip the /auth suffix to get the API root
const API_ROOT_URL = AUTH_API_URL?.replace(/\/auth$/, '') || '';

// Accepted video MIME types
const ACCEPTED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
];

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

export const VideoCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    const [videoDuration, setVideoDuration] = useState<number | null>(null);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Handle video file selection
    const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
            notify('Please select a valid video file (MP4, WebM, MOV, AVI)', { type: 'error' });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            notify('File is too large. Maximum size is 500 MB.', { type: 'error' });
            return;
        }

        setVideoFile(file);

        // Extract video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            setVideoDuration(Math.round(video.duration));
            window.URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
    }, [notify]);

    // Handle thumbnail selection
    const handleThumbnailSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            notify('Please select a valid image file for the thumbnail', { type: 'error' });
            return;
        }

        setThumbnailFile(file);
    }, [notify]);

    // Upload file directly to S3 using presigned URL via XMLHttpRequest for progress
    const uploadToS3 = (presignedUrl: string, file: File, contentType: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignedUrl, true);
            xhr.setRequestHeader('Content-Type', contentType);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.send(file);
        });
    };

    // Main upload handler
    const handleSubmit = async (formData: any) => {
        if (!videoFile) {
            notify('Please select a video file to upload', { type: 'error' });
            return;
        }

        if (!formData.title?.trim()) {
            notify('Please enter a title', { type: 'error' });
            return;
        }

        setUploading(true);

        try {
            // Step 1: Get presigned URLs from the backend
            setUploadStage('Getting upload URLs...');
            setUploadProgress(0);

            const presignPayload: any = {
                media_type: 'video',
                file_name: videoFile.name,
                mime_type: videoFile.type,
            };

            if (thumbnailFile) {
                presignPayload.thumbnail_file_name = thumbnailFile.name;
                presignPayload.thumbnail_mime_type = thumbnailFile.type;
            }

            const { json: presignJson } = await httpClient(
                `${API_ROOT_URL}/superadmin/media/presign`,
                {
                    method: 'POST',
                    body: JSON.stringify(presignPayload),
                }
            );

            const presignData: PresignResponse = presignJson.data;

            // Step 2: Upload video file to S3
            setUploadStage('Uploading video...');
            await uploadToS3(presignData.file_upload_url, videoFile, videoFile.type);

            // Step 3: Upload thumbnail if provided
            if (thumbnailFile && presignData.thumbnail_upload_url) {
                setUploadStage('Uploading thumbnail...');
                setUploadProgress(0);
                await uploadToS3(presignData.thumbnail_upload_url, thumbnailFile, thumbnailFile.type);
            }

            // Step 4: Save metadata to the backend
            setUploadStage('Saving media record...');
            setUploadProgress(100);

            const createPayload: any = {
                title: formData.title.trim(),
                media_type: 'video',
                file_s3_key: presignData.file_s3_key,
                file_url: presignData.file_cdn_url,
                mime_type: videoFile.type,
                file_size_bytes: videoFile.size,
                duration_seconds: videoDuration,
            };

            if (thumbnailFile && presignData.thumbnail_s3_key && presignData.thumbnail_cdn_url) {
                createPayload.thumbnail_s3_key = presignData.thumbnail_s3_key;
                createPayload.thumbnail_url = presignData.thumbnail_cdn_url;
            }

            await httpClient(`${API_ROOT_URL}/superadmin/media`, {
                method: 'POST',
                body: JSON.stringify(createPayload),
            });

            notify('Video uploaded successfully!', { type: 'success' });
            redirect('list', 'videos');
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
        <Create title="Upload Video">
            <SimpleForm onSubmit={handleSubmit} toolbar={false}>
                <Box sx={{ maxWidth: 600, width: '100%' }}>
                    <TextInput
                        source="title"
                        label="Video Title"
                        fullWidth
                        required
                        disabled={uploading}
                    />

                    {/* Video file picker */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Video File *
                            </Typography>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                style={{ display: 'none' }}
                                onChange={handleVideoSelect}
                                disabled={uploading}
                            />
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    variant="outlined"
                                    startIcon={videoFile ? <CheckCircleIcon color="success" /> : <CloudUploadIcon />}
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {videoFile ? 'Change Video' : 'Select Video'}
                                </Button>
                                {videoFile && (
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {videoFile.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                                            {videoDuration && ` • ${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Accepted: MP4, WebM, MOV, AVI. Max 500 MB.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Thumbnail picker */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Thumbnail (Optional)
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
                                    <Typography variant="body2">
                                        {thumbnailFile.name}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Upload progress */}
                    {uploading && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="info" sx={{ mb: 1 }}>
                                {uploadStage}
                            </Alert>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
                                {uploadProgress}%
                            </Typography>
                        </Box>
                    )}

                    {/* Submit button */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        disabled={uploading || !videoFile}
                        startIcon={<CloudUploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Upload Video'}
                    </Button>
                </Box>
            </SimpleForm>
        </Create>
    );
};
