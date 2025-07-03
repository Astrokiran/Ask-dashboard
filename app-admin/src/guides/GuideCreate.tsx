// src/guides/GuideCreate.tsx
import { Create } from 'react-admin';
import { GuideForm } from './GuideForm';

export const GuideCreate = () => (
  <Create title="Create a New Guide">
    <GuideForm />
  </Create>
);