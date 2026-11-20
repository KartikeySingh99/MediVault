import { PageHeader } from "@/components/shared/page-header";
import { IdInsuranceView } from "@/features/id-insurance/components/id-insurance-view";

export const metadata = { title: "ID & Insurance" };

export default function IdInsurancePage() {
  return (
    <>
      <PageHeader
        title="ID & Insurance"
        description="Identity and insurance documents hospitals ask for, in one place."
      />
      <IdInsuranceView />
    </>
  );
}
