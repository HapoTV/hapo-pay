import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function ParentLoginScreen() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      setAuth("demo-parent-token", "parent");
      navigate("/parent");
    } catch {
      setError("Unable to sign in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
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
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            {/* Email Field */}
            <div>
                <label htmlFor="parent-email" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                Email Address
              </label>
              <input
                id="parent-email"
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
                <label htmlFor="parent-password" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                Password
              </label>
              <input
                id="parent-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                required
              />
            </div>

            <div className="flex justify-end">
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
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#713cff] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

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
