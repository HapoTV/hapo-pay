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
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Top Navigation */}
      <nav className="border-b border-[#202a40] bg-[#0b101c]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#293650] px-6 py-2 text-sm font-bold text-slate-200 transition hover:bg-[#121a2b]"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-[#713cff] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#824fff]"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Login Form Container */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-[#222d46] bg-[#080c15] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <h1 className="text-center text-2xl font-black tracking-tight text-white">
            Parent Login
          </h1>
          <p className="mt-2 text-center text-sm text-[#8190b0]">
            Welcome back! Sign in to your Hapo account
          </p>

          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                required
              />
            </div>

            {/* Password Field */}
            <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
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
                  className="h-4 w-4 rounded border-[#26334d] bg-[#121a2a] text-[#713cff] focus:ring-[#713cff]"
                />
                <span className="text-sm text-[#8190b0]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-semibold text-[#8d62ff] transition hover:text-[#aa8aff]"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#713cff] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#26334d]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#080c15] px-2 text-[#8190b0]">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="mt-6 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-[#182238]"
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
          <p className="mt-6 text-center text-sm text-[#8190b0]">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-semibold text-[#8d62ff] transition hover:text-[#aa8aff]"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
