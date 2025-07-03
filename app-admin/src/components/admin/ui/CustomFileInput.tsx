// src/components/admin/ui/CustomFileInput.tsx
import { FileInput, FileInputProps, Labeled } from 'react-admin';
import { Button } from '../../ui/button'; // Corrected import path
import { Upload } from 'lucide-react';

export const CustomFileInput = (props: FileInputProps) => (
  <Labeled label={props.label}>
    <FileInput {...props}>
      <Button asChild variant="outline">
        <span>
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </span>
      </Button>
    </FileInput>
  </Labeled>
);