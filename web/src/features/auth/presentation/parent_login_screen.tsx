import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function ParentLoginScreen() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Create a mock token for local development
      const mockToken = btoa(`${email}:${password}`);
      setAuth(mockToken, "parent");
      navigate("/parent");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-slate-300 px-6 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-rose-500 px-6 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Login Form Container */}
      <div className="flex items-center justify-center px-6 py-20 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {/* Header */}
          <h1 className="text-center text-2xl font-black tracking-tight text-slate-950">
            Parent Login
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Welcome back! Sign in to your Hapo account
          </p>

          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-semibold text-rose-500 transition hover:text-rose-600"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-rose-500 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-rose-300/20 transition hover:bg-rose-600"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="mt-6 w-full rounded-lg border border-slate-300 bg-white py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </div>
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-semibold text-rose-500 transition hover:text-rose-600"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
