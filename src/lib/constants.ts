export const DOCUMENT_STATUS = {
  UPLOADING: "uploading",
  PROCESSING: "processing",
  REVIEW_REQUIRED: "review_required",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

/** "uploading" | "processing" | "review_required" | "completed" | "failed" */
export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export const DOCUMENT_STATUS_META: Record<DocumentStatus, { label: string; tone: StatusTone }> = {
  [DOCUMENT_STATUS.UPLOADING]: { label: "Uploading", tone: "neutral" },
  [DOCUMENT_STATUS.PROCESSING]: { label: "Processing", tone: "info" },
  [DOCUMENT_STATUS.REVIEW_REQUIRED]: { label: "Review required", tone: "warning" },
  [DOCUMENT_STATUS.COMPLETED]: { label: "Completed", tone: "success" },
  [DOCUMENT_STATUS.FAILED]: { label: "Failed", tone: "danger" },
};

export const DOCUMENT_CATEGORIES = [
  "Medical Report",
  "Blood Test",
  "Prescription",
  "Discharge Summary",
  "Supplement",
  "Other",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
