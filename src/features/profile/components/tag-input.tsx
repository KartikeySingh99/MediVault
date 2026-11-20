"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { inputClassName } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

/** Controlled list-of-strings input: type, press Enter (or Add), remove with ×. */
interface TagInputProps {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}

export function TagInput({ id, value, onChange, placeholder, disabled, invalid }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const item = draft.trim();
    if (!item) return;
    const exists = value.some((v) => v.toLowerCase() === item.toLowerCase());
    if (!exists) onChange([...value, item]);
    setDraft("");
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // don't submit the whole form
              addItem();
            }
          }}
          className={inputClassName(invalid)}
        />
        <Button
          variant="secondary"
          onClick={addItem}
          disabled={disabled || !draft.trim()}
          aria-label="Add entry"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((item, index) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-3 pr-1 text-sm text-primary"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={disabled}
                className="rounded-full p-1 hover:bg-primary/10"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
