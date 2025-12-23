import React, { useEffect, useState } from 'react';
import { useNotify, Identifier } from 'react-admin';
import { Box, Typography } from '@mui/material';
import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

const KycDocumentSection = ({ guideId }: { guideId: Identifier }) => {
    const notify = useNotify();
    const [documents, setDocuments] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!guideId) {
            setLoading(false);
            return;
        }

        const fetchDocs = async () => {
            setLoading(true);
            try {
                const { json } = await httpClient(
                    `${API_URL}/api/v1/admin/guides/${guideId}/kyc-documents`
                );

                const processedDocs: any = {};
                (json.data?.documents || []).forEach((doc: any) => {
                    if (!processedDocs[doc.document_type]) {
                        processedDocs[doc.document_type] = {};
                    }

                    if (!processedDocs[doc.document_type].front) {
                        processedDocs[doc.document_type].front = {
                            src: doc.s3_bucket_url,
                        };
                    } else {
                        processedDocs[doc.document_type].back = {
                            src: doc.s3_bucket_url,
                        };
                    }
                });

                setDocuments(processedDocs);
            } catch (error: any) {
                notify(`Error fetching KYC: ${error.message}`, { type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [guideId, notify]);

    // ✅ ALWAYS return JSX or null
    if (loading) {
        return null; // or <CircularProgress />
    }

    if (!guideId) {
        return null;
    }

    return (
        <>
            {Object.keys(documents).length === 0 ? (
                <Typography>No KYC documents found.</Typography>
            ) : (
                Object.entries(documents).map(([type, files]: any) => (
                    <Box key={type} mb={2}>
                        <Typography variant="subtitle1">{type}</Typography>
                        {files.front && <img src={files.front.src} alt="front" />}
                        {files.back && <img src={files.back.src} alt="back" />}
                    </Box>
                ))
            )}
        </>
    );
};


export default KycDocumentSection;