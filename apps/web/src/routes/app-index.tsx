import { Navigate } from "react-router";

import { Spinner } from "@orvex/ui";

import { useAppEntryPath } from "@/hooks/use-app-entry";
import { useOrganizations } from "@/hooks/use-organizations";

export default function AppIndexRedirect() {
  const entryPath = useAppEntryPath();
  const { isLoading } = useOrganizations();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return <Navigate to={entryPath} replace />;
}
