import { useAuthStore } from "@/store/authStore";

export default function ParentDashboard() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Parent Dashboard</h1>
        <button
          onClick={clearAuth}
          className="text-sm text-gray-500 hover:text-danger transition"
        >
          Sign out
        </button>
      </header>
      <p className="text-gray-500">Welcome! Your family overview will appear here.</p>
    </div>
  );
}
