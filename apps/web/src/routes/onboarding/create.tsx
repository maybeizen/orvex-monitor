import { Navigate } from "react-router";

export default function OnboardingCreatePage() {
  return <Navigate to="/app/onboarding?create=1" replace />;
}
