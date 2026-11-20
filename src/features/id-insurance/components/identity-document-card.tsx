import { IdCard, Lock, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { identityTitle, maskedNumber } from "../utils";
import type { IdentityDocument } from "../schema";
import { StoredFilePreview } from "./stored-file-preview";

interface IdentityDocumentCardProps {
  doc: IdentityDocument;
  onDelete: (doc: IdentityDocument) => void;
}

export function IdentityDocumentCard({ doc, onDelete }: IdentityDocumentCardProps) {
  const title = identityTitle(doc);
  const masked = maskedNumber(doc);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <IdCard className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          {masked && <p className="font-mono text-sm tracking-wide text-muted">{masked}</p>}
        </div>
        <Button
          variant="ghost"
          className="px-2 hover:text-danger"
          onClick={() => onDelete(doc)}
          aria-label={`Delete ${title}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {doc.files.map((file) => (
          <StoredFilePreview key={file.id} file={file} />
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Lock className="size-3.5" aria-hidden="true" /> Private · never sent to AI
      </p>
    </Card>
  );
}
