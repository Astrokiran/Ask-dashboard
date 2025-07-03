// src/guides/GuideProfileForm.tsx
import { ImageInput, ImageField, required } from 'react-admin';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CustomTextInput } from '../components/admin/ui/CustomTextInput';
import { CustomMultiSelectInput } from '../components/admin/ui/CustomMultiSelectInput';

// This placeholder will be shown when no image is selected.
const ImagePlaceholder = () => (
    <div className="w-36 h-36 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-center p-4 text-xs text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <span>Click or drag to upload profile photo</span>
    </div>
);

// Define props to pass choices from the parent
interface GuideProfileFormProps {
    skillChoices: { id: number; name: string }[];
    languageChoices: { id: number; name: string }[];
}

export const GuideProfileForm = ({ skillChoices, languageChoices }: GuideProfileFormProps) => (
    <Card className="dark:bg-card dark:text-card-foreground">
        <CardHeader><CardTitle>Guide Profile</CardTitle></CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row items-start gap-10">
                <ImageInput source="profilePicture" label="" accept="image/*" placeholder={<ImagePlaceholder />}>
                    <ImageField
                        source="src"
                        title="title"
                        sx={{
                            '& .RaImageField-image': {
                                width: 144,
                                height: 144,
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }
                        }}
                    />
                </ImageInput>
                <div className="flex-grow w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomTextInput source="name" label="Full Name" validate={[required()]} fullWidth />
                        <CustomTextInput source="email" type="email" validate={[required()]} fullWidth />
                        <CustomTextInput source="phone" validate={[required()]} fullWidth />
                        <CustomTextInput source="experience" label="Years of Experience" type="number" validate={[required()]} fullWidth />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <CustomMultiSelectInput source="skills" choices={skillChoices} validate={[required()]} fullWidth />
                        <CustomMultiSelectInput source="languages" choices={languageChoices} validate={[required()]} fullWidth />
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);