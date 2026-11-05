import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, getApiErrorMessage } from "@/api/client";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { DemoOtpChallenge } from "./DemoOtpChallenge";

export default function StudentLoginScreen() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingTokens, setPendingTokens] = useState<{ access: string; refresh: string } | null>(null);

  const finishLogin = () => {
    if (!pendingTokens) return;
    setAuth(pendingTokens.access, "student", pendingTokens.refresh);
    navigate("/student");
  };
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await authApi.login({ email: email.trim(), password });
      const { user, tokens } = data.data;
      if (user.role !== "student") {
        setError("This account is registered as a parent. Choose Parent to sign in.");
        return;
      }

      setPendingTokens(tokens);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to sign in. Check your details and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Top Navigation */}
      <nav className="border-b border-[#202a40] bg-[#0b101c]">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#293650] px-6 py-2 text-sm font-bold text-slate-200 transition hover:bg-[#121a2b]"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Login Form Container */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-[#222d46] bg-[radial-gradient(ellipse_at_55%_0%,_#2a1d50_0%,_#17132b_40%,_#080c15_78%)] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <Logo className="mx-auto mb-5 h-12 w-40 object-contain" />
          {/* Header */}
          <h1 className="text-center text-2xl font-black tracking-tight text-white">
            Student Login
          </h1>
          <p className="mt-2 text-center text-sm text-[#8190b0]">
            Use the credentials provided by your parent
          </p>

          {pendingTokens ? (
            <DemoOtpChallenge
              email={email.trim()}
              purpose="login"
              onVerified={finishLogin}
            />
          ) : (
          <>
          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            {/* Email Field */}
            <div>
              <label htmlFor="student-email" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                Email
              </label>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@hapo.com"
                className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="student-password" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                Password
              </label>
              <input
                id="student-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                required
              />
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

          {/* Help Text */}
          <p className="mt-8 text-center text-sm text-[#8190b0]">
            Need help? Ask your parent to reset your password.
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
