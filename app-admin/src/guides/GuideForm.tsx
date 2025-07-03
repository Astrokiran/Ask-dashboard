// src/guides/GuideForm.tsx
import { useEffect, useState } from 'react';
import { SimpleForm, Toolbar, SaveButton } from 'react-admin';
import { ArrowRight } from 'lucide-react';
import { httpClient } from '../dataProvider';
import { GuideProfileForm } from './GuideProfileForm'; // 👈 Import
import { GuideAddressForm } from './GuideAddressForm'; // 👈 Import

const API_URL = 'https://appdev.astrokiran.com';

const CustomToolbar = () => (
    <Toolbar>
        <SaveButton
            label="Register & Continue"
            icon={<ArrowRight className="ml-2 h-4 w-12" />}
            alwaysEnable
        />
    </Toolbar>
);

export const GuideForm = () => {
    const [skillChoices, setSkillChoices] = useState<{id: number, name: string}[]>([]);
    const [languageChoices, setLanguageChoices] = useState<{id: number, name: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChoices = async () => {
            try {
                const [skillsResponse, languagesResponse] = await Promise.all([
                    httpClient(`${API_URL}/auth/v1/guide/skills`),
                    httpClient(`${API_URL}/auth/v1/guide/languages`)
                ]);

                const skills = (skillsResponse.json.data.skills || []).map((item: any) => ({ id: item.id, name: item.title }));
                const languages = (languagesResponse.json.data.languages || []).map((item: any) => ({ id: item.id, name: item.title }));

                setSkillChoices(skills);
                setLanguageChoices(languages);
            } catch (error) {
                console.error("Failed to fetch choices:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChoices();
    }, []);

    if (isLoading) {
        return <div>Loading form options...</div>;
    }

    return (
        <SimpleForm toolbar={<CustomToolbar />}>
            <div className="flex flex-col gap-8 w-full">
                {/* 👇 Render the smaller, focused components */}
                <GuideProfileForm skillChoices={skillChoices} languageChoices={languageChoices} />
                <GuideAddressForm />
            </div>
        </SimpleForm>
    );
};