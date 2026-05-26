import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Placeholder routes - to be implemented with actual pages
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: Implement authentication check
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div>Login Page - To be implemented</div>} />
        <Route
          path="/parent/*"
          element={
            <ProtectedRoute>
              <div>Parent Dashboard - To be implemented</div>
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
