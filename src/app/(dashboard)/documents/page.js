import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Medical Documents" };

export default function Page() {
  return (
    <>
      <PageHeader title="Medical Documents" description="Upload, organize and search your medical records." />
      <ComingSoon day={6}>Secure upload, previews, filters and AI-assisted extraction.</ComingSoon>
    </>
  );
}
