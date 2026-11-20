import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Emergency Center" };

export default function Page() {
  return (
    <>
      <PageHeader title="Emergency Center" description="Your emergency health card and contacts." />
      <ComingSoon day={11}>Emergency card, contacts with one-tap calling, and secure sharing.</ComingSoon>
    </>
  );
}
