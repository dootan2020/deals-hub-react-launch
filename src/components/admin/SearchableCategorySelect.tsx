
import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchableCategorySelectProps {
  categories: Array<{ id: string; name: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableCategorySelect({
  categories = [],
  value = '',
  onValueChange,
  placeholder = "Select a category",
  disabled = false
}: SearchableCategorySelectProps) {
  const [open, setOpen] = useState(false);
  
  // Ensure we have a valid array to work with, even if categories is undefined
  const safeCategories = Array.isArray(categories) 
    ? categories.filter(category => category && typeof category === 'object') 
    : [];
  
  // Find the selected category with proper null checks
  const selectedCategory = safeCategories.find(
    (category) => category && category.id === value
  );

  // Create a defensive CommandItem renderer to avoid issues
  const renderCommandItem = (category: { id: string; name: string }) => {
    if (!category || !category.id || !category.name) return null;
    
    return (
      <CommandItem
        key={category.id}
        value={category.name}
        onSelect={() => {
          onValueChange(category.id);
          setOpen(false);
        }}
      >
        {category.name}
        <Check
          className={cn(
            "ml-auto h-4 w-4",
            value === category.id ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    );
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {value && selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {safeCategories.map(renderCommandItem)}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
