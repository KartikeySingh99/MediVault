import { Card } from "@/components/ui/card";

export function WelcomeSection({ firstName, profileCompletion }) {
  return (
    <Card className="flex flex-col gap-5 bg-gradient-to-br from-primary to-teal-800 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
        <p className="mt-1 max-w-lg text-sm text-teal-50">
          Your health records, organized and ready when you need them most.
        </p>
      </div>

      <div className="w-full sm:w-56">
        <div className="flex justify-between text-sm">
          <span className="text-teal-50">Profile completion</span>
          <span className="font-semibold">{profileCompletion}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuenow={profileCompletion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion"
        >
          <div className="h-full rounded-full bg-white" style={{ width: `${profileCompletion}%` }} />
        </div>
      </div>
    </Card>
  );
}
