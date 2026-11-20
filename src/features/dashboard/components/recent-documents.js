import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DOCUMENT_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const ACTION_LABEL = {
  [DOCUMENT_STATUS.REVIEW_REQUIRED]: "Review",
  [DOCUMENT_STATUS.FAILED]: "Retry",
};

export function RecentDocuments({ documents }) {
  return (
    <Card>
      <CardHeader
        title="Recent documents"
        description="Your latest uploads and their processing status"
        action={
          <Link href="/documents" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        }
      />

      {documents.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted">
                  {doc.category} · {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={doc.status} />
                <Link
                  href="/documents"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {ACTION_LABEL[doc.status] ?? "View"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
