export const DOCUMENT_STATUS = {
  UPLOADING: "uploading",
  PROCESSING: "processing",
  REVIEW_REQUIRED: "review_required",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const DOCUMENT_STATUS_META = {
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
];
