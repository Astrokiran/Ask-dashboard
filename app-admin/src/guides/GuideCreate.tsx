import { Create, useRedirect } from 'react-admin';
import { GuideForm } from './GuideForm';

export const GuideCreate = () => {
    const redirect = useRedirect();

    const handleSuccess = (data: any) => {
        redirect(`/guides/${data.id}`);
    };

    return (
        <Create title="Create a New Guide" mutationOptions={{ onSuccess: handleSuccess }}>
            <GuideForm />
        </Create>
    );
};