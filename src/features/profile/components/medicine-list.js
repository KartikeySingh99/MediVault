"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/form-field";

/** Editable rows of { name, dosage } for medications or supplements. */
export function MedicineList({ name, label, control, register, errors, emptyText }) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">{label}</h3>
        <Button variant="ghost" onClick={() => append({ name: "", dosage: "" })}>
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => {
            const rowErrors = errors?.[name]?.[index];
            const nameId = `${name}-${index}-name`;
            const dosageId = `${name}-${index}-dosage`;
            return (
              <li key={field.id} className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label htmlFor={nameId} className="sr-only">Name</label>
                    <input
                      id={nameId}
                      placeholder="Name"
                      aria-invalid={Boolean(rowErrors?.name) || undefined}
                      className={inputClassName(rowErrors?.name)}
                      {...register(`${name}.${index}.name`)}
                    />
                    {rowErrors?.name && (
                      <p role="alert" className="mt-1 text-xs text-danger">{rowErrors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={dosageId} className="sr-only">Dosage</label>
                    <input
                      id={dosageId}
                      placeholder="Dosage, e.g. 50 mcg once daily"
                      className={inputClassName(rowErrors?.dosage)}
                      {...register(`${name}.${index}.dosage`)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="px-3"
                  aria-label={`Remove ${label.toLowerCase()} row ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
