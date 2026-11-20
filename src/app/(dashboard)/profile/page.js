import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const metadata = { title: "My Health Profile" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="My Health Profile"
        description="Keep your essential health information up to date. It powers your emergency card."
      />
      <ProfileForm />
    </>
  );
}
