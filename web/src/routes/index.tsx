import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/features/landing";
import { ParentLoginScreen, StudentLoginScreen, ParentSignupScreen } from "@/features/auth";
import { ParentDashboard } from "@/features/parentdashboard/pages/Dashboard";

// Placeholder routes - to be implemented with actual pages
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: Implement authentication check
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
        <Route
          path="/parent/*"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <div>Student Dashboard - To be implemented</div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
