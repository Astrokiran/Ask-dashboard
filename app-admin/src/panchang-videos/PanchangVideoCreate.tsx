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
    TextField as MuiTextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { httpClient } from '../dataProvider';

const AUTH_API_URL = process.env.REACT_APP_AUTH_URL;
const API_ROOT_URL = AUTH_API_URL?.replace(/\/auth$/, '') || '';

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB for panchang videos

interface PresignResponse {
    file_upload_url: string;
    file_s3_key: string;
    file_cdn_url: string;
    thumbnail_upload_url?: string;
    thumbnail_s3_key?: string;
    thumbnail_cdn_url?: string;
    expires_in_seconds: number;
}

export const PanchangVideoCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [targetDate, setTargetDate] = useState('');

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
            notify('Please select a valid video file (MP4, WebM, MOV)', { type: 'error' });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            notify('File is too large. Maximum size is 5 MB for panchang videos.', { type: 'error' });
            return;
        }

        setVideoFile(file);

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            setVideoDuration(Math.round(video.duration));
            window.URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
    }, [notify]);

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

    const handleSubmit = async (formData: any) => {
        if (!thumbnailFile) {
            notify('Thumbnail image is required', { type: 'error' });
            return;
        }

        if (!targetDate) {
            notify('Please select a target date', { type: 'error' });
            return;
        }

        if (!formData.title?.trim()) {
            notify('Please enter a title', { type: 'error' });
            return;
        }

        const hasVideo = !!videoFile;

        setUploading(true);

        try {
            // Step 1: Get presigned URLs
            // With video: presign video as primary file + thumbnail separately
            // Image only: presign thumbnail as the primary file
            setUploadStage('Getting upload URLs...');
            setUploadProgress(0);

            const primaryFile = hasVideo ? videoFile! : thumbnailFile;
            const presignBody: Record<string, string> = {
                media_type: hasVideo ? 'video' : 'image',
                file_name: primaryFile.name,
                mime_type: primaryFile.type,
            };
            if (hasVideo) {
                presignBody.thumbnail_file_name = thumbnailFile.name;
                presignBody.thumbnail_mime_type = thumbnailFile.type;
            }

            const { json: presignJson } = await httpClient(
                `${API_ROOT_URL}/superadmin/media/presign`,
                {
                    method: 'POST',
                    body: JSON.stringify(presignBody),
                }
            );

            const presignData: PresignResponse = presignJson.data;

            // Step 2: Upload primary file to S3
            setUploadStage(hasVideo ? 'Uploading video...' : 'Uploading image...');
            await uploadToS3(presignData.file_upload_url, primaryFile, primaryFile.type);

            // Step 3: Upload thumbnail to S3 (only when video is present)
            if (hasVideo && presignData.thumbnail_upload_url) {
                setUploadStage('Uploading thumbnail...');
                setUploadProgress(0);
                await uploadToS3(presignData.thumbnail_upload_url, thumbnailFile, thumbnailFile.type);
            }

            // Step 4: Save metadata
            setUploadStage('Saving panchang content...');
            setUploadProgress(100);

            const metadata: Record<string, unknown> = {
                title: formData.title.trim(),
                media_type: hasVideo ? 'video' : 'image',
                purpose: 'panchang_video',
                target_date: targetDate,
                file_s3_key: presignData.file_s3_key,
                file_url: presignData.file_cdn_url,
                mime_type: primaryFile.type,
                file_size_bytes: primaryFile.size,
            };

            if (hasVideo) {
                metadata.duration_seconds = videoDuration;
                metadata.thumbnail_s3_key = presignData.thumbnail_s3_key;
                metadata.thumbnail_url = presignData.thumbnail_cdn_url;
            } else {
                // Image-only: use the same image as thumbnail
                metadata.thumbnail_s3_key = presignData.file_s3_key;
                metadata.thumbnail_url = presignData.file_cdn_url;
            }

            await httpClient(`${API_ROOT_URL}/superadmin/media`, {
                method: 'POST',
                body: JSON.stringify(metadata),
            });

            notify('Panchang content uploaded successfully!', { type: 'success' });
            redirect('list', 'panchang-videos');
        } catch (error: any) {
            const errorMsg = error?.body?.error || error?.message || 'Unknown error';
            notify(`Upload failed: ${errorMsg}`, { type: 'error' });
        } finally {
            setUploading(false);
            setUploadStage('');
            setUploadProgress(0);
        }
    };

    return (
        <Create title="Upload Panchang Video">
            <SimpleForm onSubmit={handleSubmit} toolbar={false}>
                <Box sx={{ maxWidth: 600, width: '100%' }}>
                    <TextInput
                        source="title"
                        label="Video Title"
                        fullWidth
                        required
                        disabled={uploading}
                        helperText="e.g., Panchang Highlights - March 23, 2026"
                    />

                    {/* Target date picker */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Target Date *
                            </Typography>
                            <MuiTextField
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                disabled={uploading}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText="The date this video will be shown on the home screen"
                            />
                        </CardContent>
                    </Card>

                    {/* Video file picker */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Video File (optional)
                            </Typography>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
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
                                            {videoDuration != null && ` \u2022 ${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                MP4/WebM/MOV. Max 5 MB. Recommended: 15-30 seconds, 720p, H.264.
                            </Typography>
                            {videoDuration != null && (videoDuration < 10 || videoDuration > 45) && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    Video is {videoDuration}s. Recommended duration is 15-30 seconds.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Thumbnail picker (required) */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Thumbnail *
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
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Required. Shown as the panchang image, or as thumbnail when video is present.
                            </Typography>
                        </CardContent>
                    </Card>

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
                        disabled={uploading || !thumbnailFile || !targetDate}
                        startIcon={<CloudUploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Upload Panchang Video'}
                    </Button>
                </Box>
            </SimpleForm>
        </Create>
    );
};
