import React, { useEffect, useState } from 'react';
import { useNotify, Identifier } from 'react-admin';
import { Box, CircularProgress } from '@mui/material';
import { httpClient } from '../dataProvider';

const API_URL = 'https://devazstg.astrokiran.com/auth/api/pixel-admin';

const KycDocumentSection = ({ guideId }: { guideId: Identifier }) => {
    const notify = useNotify();
    const [documents, setDocuments] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!guideId) return;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const { json } = await httpClient(`${API_URL}/api/v1/admin/guides/${guideId}/kyc-documents`);
                const processedDocs: any = {};
                (json.data.documents || []).forEach((doc: any) => {
                    if (!processedDocs[doc.document_type]) processedDocs[doc.document_type] = {};
                    if (!processedDocs[doc.document_type].front) {
                        processedDocs[doc.document_type].front = { src: doc.s3_bucket_url };
                    } else {
                        processedDocs[doc.document_type].back = { src: doc.s3_bucket_url };
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

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }
};

export default KycDocumentSection;