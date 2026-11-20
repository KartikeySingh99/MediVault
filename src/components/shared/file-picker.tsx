"use client";

import { useState, type ChangeEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { FILE_INPUT_ACCEPT, formatFileSize, validateFile } from "@/lib/files";
import { cn } from "@/lib/utils";

/** Controlled File[] picker that checks real file type and size as files are chosen. */
interface FilePickerProps {
  id: string;
  value: File[];
  onChange: (files: File[]) => void;
  max?: number;
  invalid?: boolean;
}

export function FilePicker({ id, value, onChange, max = 3, invalid }: FilePickerProps) {
  const [rejected, setRejected] = useState("");

  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow picking the same file again after removing it

    const errors: string[] = [];
    const accepted: File[] = [];
    for (const file of picked) {
      const error = await validateFile(file);
      if (error) errors.push(error);
      else accepted.push(file);
    }
    if (value.length + accepted.length > max) errors.push(`You can add up to ${max} files.`);

    setRejected(errors.join(". "));
    onChange([...value, ...accepted].slice(0, max));
  }

  return (
    <div>
      {value.length < max && (
        <>
          <input
            id={id}
            type="file"
            multiple
            accept={FILE_INPUT_ACCEPT}
            onChange={handleSelect}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center text-sm transition-colors hover:border-primary hover:bg-primary-soft peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30",
              invalid ? "border-danger" : "border-border"
            )}
          >
            <Upload className="size-5 text-primary" aria-hidden="true" />
            <span className="font-medium text-primary">Choose files</span>
            <span className="text-xs text-muted">PDF, JPG or PNG · up to 10 MB each · max {max}</span>
          </label>
        </>
      )}

      {rejected && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {rejected}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm"
            >
              <FileText className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="rounded-full p-1 text-muted hover:bg-slate-100"
                aria-label={`Remove ${file.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
