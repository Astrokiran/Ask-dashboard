import { 
    SimpleForm, 
    Toolbar, 
    SaveButton, 
    useNotify, 
    useCreate,
    TextInput,
    SelectInput,
    NumberInput,
    SelectArrayInput,
    required,
    email,
    DateInput,
} from 'react-admin';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { httpClient } from '../dataProvider';


const API_URL = 'https://devvm.astrokiran.com/auth/api/pixel-admin';

// Props definition for the form
interface GuideFormProps {
    onCreationSuccess: (data: any) => void;
}

export const GuideForm = ({ onCreationSuccess }: GuideFormProps) => {
    const notify = useNotify();
    const [create, { isLoading }] = useCreate();
    
    // State for dynamic choices
    const [languageChoices, setLanguageChoices] = useState([]);
    const [skillChoices, setSkillChoices] = useState([]);

    // Fetch choices on component mount
    useEffect(() => {
    const fetchChoices = async () => {
        try {
            // Destructure the `json` property from the httpClient response
            const { json: langResponse } = await httpClient(`${API_URL}/api/v1/guides/languages`);
            const { json: skillResponse } = await httpClient(`${API_URL}/api/v1/guides/skills`);

            // Access the 'data' key from each response object
            const langData = langResponse.data;
            const skillData = skillResponse.data;

            // Map the API response to the format needed
            setLanguageChoices(langData.map((lang: any) => ({ id: lang.title, name: lang.title })));
            setSkillChoices(skillData.map((skill: any) => ({ id: skill.title, name: skill.title })));
        } catch (error) {
            console.error('Error fetching choices:', error);
            notify('Could not load languages or skills', { type: 'error' });
        }
    };
    fetchChoices();
}, [notify]);
    const handleSave = (values: any) => {
        const apiPayload = {
            area_code: "+91", // Default area code
            phone_number: values.phone_number,
            full_name: values.full_name,
            email: values.email,
            date_of_birth: values.date_of_birth,
            gender: values.gender,
            years_of_experience: parseInt(values.years_of_experience, 10) || 0,
            specializations: values.skills, // `source` in the form is 'skills'
            languages: values.languages,
            address_line_1: values.address_line_1,
            city: values.city,
            state: values.state,
            country: values.country || "India",
            pincode: values.pincode,
        };

        create('guides', { data: apiPayload }, {
            onSuccess: (response) => {
                notify('Guide created successfully! Please upload KYC documents.', { type: 'success' });
                onCreationSuccess(response); // Pass response to parent
            },
            onError: (error: any) => {
                notify(`Error: ${error.body?.detail?.message || error.message || 'Guide creation failed'}`, { type: 'error' });
            },
        });
    };
    
    const genderChoices = [
        { id: 'male', name: 'Male' },
        { id: 'female', name: 'Female' },
        { id: 'other', name: 'Other' },
    ];

    return (
        <SimpleForm
            onSubmit={handleSave}
            toolbar={
                <Toolbar>
                    <SaveButton
                        label="Register and Proceed to KYC"
                        icon={<ArrowRight />}
                        disabled={isLoading}
                    />
                </Toolbar>
            }
        >
            <TextInput source="full_name" validate={[required()]} fullWidth />
            <TextInput source="email" validate={[required(), email()]} fullWidth />
            <TextInput source="phone_number" validate={[required()]} fullWidth />
            <DateInput source="date_of_birth" label="Date of Birth" validate={[required()]} fullWidth />
            <SelectInput source="gender" choices={genderChoices} validate={[required()]} />
            <NumberInput source="years_of_experience" validate={[required()]} />
            
            <SelectArrayInput source="languages" choices={languageChoices} validate={[required()]} fullWidth />
            <SelectArrayInput source="skills" label="Specializations" choices={skillChoices} validate={[required()]} fullWidth />
            
            <TextInput source="address_line_1" label="Address Line 1" validate={[required()]} fullWidth />
            <TextInput source="city" validate={[required()]} />
            <TextInput source="state" validate={[required()]} />
            <TextInput source="pincode" validate={[required()]} />
            <TextInput source="country" defaultValue="India" validate={[required()]} />
        </SimpleForm>
    );
};