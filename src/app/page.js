import { redirect } from "next/navigation";

// Until auth and a landing page exist, send visitors straight to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
