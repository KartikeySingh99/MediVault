// Synthetic demo data only. Replace with API responses once Supabase is wired up (Day 3+).
import { DOCUMENT_STATUS, type DocumentCategory, type DocumentStatus } from "@/lib/constants";

export interface DashboardStats {
  totalDocuments: number;
  currentMedications: number;
  profileCompletion: number;
  recentUploads: number;
}

export interface RecentDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedAt: string;
  status: DocumentStatus;
}

export const mockUser = {
  firstName: "Rahul",
  profileCompletion: 68,
};

export const mockStats: DashboardStats = {
  totalDocuments: 14,
  currentMedications: 3,
  profileCompletion: 68,
  recentUploads: 4,
};

export const mockRecentDocuments: RecentDocument[] = [
  {
    id: "doc_1",
    name: "Thyroid Profile - City Lab",
    category: "Blood Test",
    uploadedAt: "2026-11-18",
    status: DOCUMENT_STATUS.REVIEW_REQUIRED,
  },
  {
    id: "doc_2",
    name: "Prescription - Dr. Sharma",
    category: "Prescription",
    uploadedAt: "2026-11-15",
    status: DOCUMENT_STATUS.COMPLETED,
  },
  {
    id: "doc_3",
    name: "Chest X-Ray Report",
    category: "Medical Report",
    uploadedAt: "2026-11-12",
    status: DOCUMENT_STATUS.PROCESSING,
  },
  {
    id: "doc_4",
    name: "Discharge Summary - City Hospital",
    category: "Discharge Summary",
    uploadedAt: "2026-10-30",
    status: DOCUMENT_STATUS.FAILED,
  },
];
