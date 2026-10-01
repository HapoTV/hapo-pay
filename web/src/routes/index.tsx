import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/features/landing";
import { ParentLoginScreen, StudentLoginScreen, ParentSignupScreen, ForgotPasswordScreen } from "@/features/auth";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/authStore";

const ParentDashboard = lazy(() => import("@/features/parentdashboard/pages/Dashboard").then(({ ParentDashboard }) => ({ default: ParentDashboard })));
const StudentDashboard = lazy(() => import("@/features/studentdashboard/pages/Dashboard").then(({ StudentDashboard }) => ({ default: StudentDashboard })));

type AccountRole = "parent" | "student";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: AccountRole }) {
  const token = useAuthStore((state) => state.token);
  const authenticatedRole = useAuthStore((state) => state.role);

  if (!token || authenticatedRole !== role) {
    return <Navigate to={role === "parent" ? "/login" : "/student-login"} replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<ParentLoginScreen />} />
        <Route path="/signup" element={<ParentSignupScreen />} />
        <Route path="/student-login" element={<StudentLoginScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ForgotPasswordScreen />} />
        <Route
          path="/parent/*"
          element={
            <ThemeProvider storageKey="hapo-theme-parent">
              <ProtectedRoute role="parent">
                <Suspense fallback={<div className="min-h-screen bg-slate-50" role="status">Loading dashboard...</div>}>
                  <ParentDashboard />
                </Suspense>
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/student/*"
          element={
            <ThemeProvider storageKey="hapo-theme-student">
              <ProtectedRoute role="student">
                <Suspense fallback={<div className="min-h-screen bg-slate-50" role="status">Loading dashboard...</div>}>
                  <StudentDashboard />
                </Suspense>
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
