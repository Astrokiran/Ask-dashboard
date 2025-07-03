// src/components/admin/ui/CustomTextInput.tsx
import { useInput, Validator } from 'react-admin';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

export const CustomTextInput = (props: {
  source: string;
  label?: string;
  multiline?: boolean;
  type?: string;
  validate?: Validator | Validator[];
}) => {
  // --- THIS IS THE CORRECT LOCATION FOR THE HOOK ---
  const { field, fieldState } = useInput(props); 
  
  const { source, label, multiline = false, type = 'text' } = props;

  return (
    <div className="w-full">
      <Label htmlFor={source}>
        <span className="capitalize">{label || source}</span>
      </Label>
      {multiline ? (
        <Textarea id={source} {...field} className="mt-1" />
      ) : (
        <Input id={source} type={type} {...field} className="mt-1" />
      )}
      {fieldState.error && <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>}
    </div>
  );
};