import { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router";

import { OnboardingLayout } from "@/components/layout/OnboardingLayout";
import { AppHubLayout } from "@/components/layout/AppHubLayout";
import { OrgRouteGuard } from "@/components/layout/OrgRouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";

import LandingPage from "./routes/landing";
import LoginPage from "./routes/auth/login";
import SignupPage from "./routes/auth/signup";
import ForgotPasswordPage from "./routes/auth/forgot-password";
import TwoFactorPage from "./routes/auth/two-factor";
import AuthCallbackPage from "./routes/auth/callback";
import AppIndexRedirect from "./routes/app-index";
import OrganizationsPage from "./routes/organizations/index";
import DashboardPage from "./routes/index";
import MonitorsPage from "./routes/monitors/index";
import MonitorDetailPage from "./routes/monitors/[id]";
import IncidentsPage from "./routes/incidents/index";
import SettingsPage from "./routes/settings/index";
import OnboardingWelcomePage from "./routes/onboarding/index";
import OnboardingCreatePage from "./routes/onboarding/create";
import { AccountLayout } from "./components/account/AccountLayout";
import AccountIndexPage from "./routes/account/index";
import AccountGeneralPage from "./routes/account/general";
import AccountSecurityPage from "./routes/account/security";
import AccountDangerPage from "./routes/account/danger";
import ConfirmEmailPage from "./routes/confirm-email/index";
import VerifyEmailPage from "./routes/verify-email/index";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/confirm-email", element: <ConfirmEmailPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/2fa", element: <TwoFactorPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  {
    path: "/app",
    children: [
      { index: true, element: <AppIndexRedirect /> },
      {
        element: <AppHubLayout />,
        children: [
          { path: "organizations", element: <OrganizationsPage /> },
          {
            path: "account",
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountIndexPage /> },
              { path: "general", element: <AccountGeneralPage /> },
              { path: "security", element: <AccountSecurityPage /> },
              { path: "danger", element: <AccountDangerPage /> },
            ],
          },
        ],
      },
      { path: "verify-email", element: <VerifyEmailPage /> },
      {
        element: <OnboardingLayout />,
        children: [
          { path: "onboarding", element: <OnboardingWelcomePage /> },
          { path: "onboarding/create", element: <OnboardingCreatePage /> },
        ],
      },
      {
        path: "org/:slug",
        element: <OrgRouteGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "monitors", element: <MonitorsPage /> },
              { path: "monitors/:id", element: <MonitorDetailPage /> },
              { path: "incidents", element: <IncidentsPage /> },
              { path: "settings", element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function App() {
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
