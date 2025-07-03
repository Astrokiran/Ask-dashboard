// src/components/admin/ui/CustomMultiSelectInput.tsx
import { useInput, Validator } from 'react-admin';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Label } from '../../ui/label';
import { useState } from 'react';

// The props interface for our component
interface CustomMultiSelectInputProps {
  source: string;
  label?: string;
  validate?: Validator | Validator[];
  // --- THIS IS THE FIX ---
  // Allow the 'id' to be a string OR a number
  choices: { id: string | number; name: string }[];
}

export const CustomMultiSelectInput = (props: CustomMultiSelectInputProps) => {
  const { field } = useInput(props);
  const { label, source, choices } = props;
  const [open, setOpen] = useState(false);

  // We convert all values to strings for consistent checking with the Set
  const selectedValues = new Set((field.value || []).map(String));

  return (
    <div className="w-full">
       <Label htmlFor={source}>
        <span className="capitalize">{label || source}</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 mt-1"
          >
            <div className="flex gap-1 flex-wrap">
              {field.value?.length > 0 ? (
                choices
                  .filter(choice => selectedValues.has(String(choice.id)))
                  .map(choice => <Badge variant="secondary" key={choice.id}>{choice.name}</Badge>)
              ) : (
                "Select..."
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {choices.map(choice => (
                  <CommandItem
                    key={choice.id}
                    onSelect={() => {
                      // We use the original id type (number) when updating the form
                      const newValues = new Set(field.value || []);
                      if (newValues.has(choice.id)) {
                        newValues.delete(choice.id);
                      } else {
                        newValues.add(choice.id);
                      }
                      field.onChange(Array.from(newValues));
                    }}
                  >
                    <Check className={`mr-2 h-4 w-4 ${selectedValues.has(String(choice.id)) ? 'opacity-100' : 'opacity-0'}`} />
                    {choice.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};