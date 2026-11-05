import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { authApi, getApiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { getOrCreateFamilyInviteCode } from "../familyInviteCode";
import { DemoOtpChallenge } from "./DemoOtpChallenge";

type LoginRole = "parent" | "student";

export default function ParentLoginScreen({
  initialRole = "parent",
}: {
  initialRole?: LoginRole;
}) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [role, setRole] = useState<LoginRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<{
    role: LoginRole;
    tokens: { access: string; refresh: string };
  } | null>(null);

  const handleSocialSignIn = () => {
    setError("Google and Apple sign-in are not supported yet.");
  };

  const finishLogin = () => {
    if (!pendingLogin) return;
    setAuth(pendingLogin.tokens.access, pendingLogin.role, pendingLogin.tokens.refresh);
    if (pendingLogin.role === "parent") getOrCreateFamilyInviteCode();
    navigate(pendingLogin.role === "parent" ? "/parent" : "/student");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await authApi.login({ email: email.trim(), password });
      const { user, tokens } = data.data;
      if (user.role !== role) {
        setError(`This account is registered as a ${user.role}. Choose that account type to sign in.`);
        return;
      }

      setPendingLogin({ role, tokens });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to sign in. Check your details and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#070b14] text-slate-100">
      {/* Top Navigation */}
      <nav className="border-b border-[#202a40] bg-[#0b101c]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#293650] px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-[#121a2b]"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-[#713cff] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#824fff]"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Login Form Container */}
      <div className="flex min-h-[calc(100dvh-52px)] items-center justify-center px-4 py-3 lg:px-8">
        <div className="w-full max-w-md rounded-[1.5rem] border border-[#222d46] bg-[radial-gradient(ellipse_at_55%_0%,_#2a1d50_0%,_#17132b_40%,_#080c15_78%)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-6">
          <Logo className="mx-auto mb-3 h-9 w-32 object-contain" />
          <h1 className="mt-1 text-center text-xl font-black tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-center text-xs text-[#8190b0]">
            Sign in to your HapoPay account
          </p>

          {!pendingLogin ? (
          <>
          <div
            aria-label="Choose account type"
            className="mt-5 grid grid-cols-2 rounded-xl border border-[#26334d] bg-[#1c2638] p-1"
          >
            <button
              type="button"
              aria-pressed={role === "parent"}
              onClick={() => {
                setRole("parent");
                setError("");
              }}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                role === "parent"
                  ? "bg-[#101827] text-slate-100 shadow-sm"
                  : "text-[#9aa8bf] hover:text-slate-100"
              }`}
            >
              <UserRound aria-hidden="true" size={17} className="text-blue-500" />
              Parent
            </button>
            <button
              type="button"
              aria-pressed={role === "student"}
              onClick={() => {
                setRole("student");
                setError("");
              }}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                role === "student"
                  ? "bg-[#101827] text-slate-100 shadow-sm"
                  : "text-[#9aa8bf] hover:text-slate-100"
              }`}
            >
              <span aria-hidden="true" className="text-lg leading-none">🎒</span>
              Student
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-4 space-y-3">
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail aria-hidden="true" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190b0]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold text-[#8d62ff] transition hover:text-[#aa8aff]"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <LockKeyhole aria-hidden="true" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190b0]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-3 pl-11 pr-11 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8190b0] transition hover:text-slate-100 focus:outline-none focus-visible:text-slate-100"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#713cff] py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="space-y-3 pt-0.5">
              <div className="flex items-center gap-3 text-xs font-medium text-[#8190b0]">
                <span className="h-px flex-1 bg-[#202a40]" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-[#202a40]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSocialSignIn}
                  className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-[#192338]"
                >
                  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                    <path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.5H5.8v5.2A20 20 0 0 0 24 44Z" />
                    <path fill="#4CAF50" d="M12.6 27.4a12 12 0 0 1 0-6.8v-5.2H5.8a20 20 0 0 0 0 17.2l6.8-5.2Z" />
                    <path fill="#1976D2" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.4l6.8 5.2c1.6-4.9 6.1-8.5 11.4-8.5Z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleSocialSignIn}
                  className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-[#192338]"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M16.37 12.25c.02 2.14 1.88 2.85 1.9 2.86-.02.05-.3 1.03-.98 2.04-.59.87-1.2 1.74-2.17 1.76-.95.02-1.26-.57-2.35-.57-1.08 0-1.43.55-2.33.59-.94.04-1.65-.94-2.25-1.8-1.23-1.78-2.17-5.03-.91-7.23a3.48 3.48 0 0 1 2.93-1.78c.91-.02 1.77.62 2.33.62.55 0 1.59-.77 2.68-.66.46.02 1.76.18 2.59 1.4-.07.05-1.55.9-1.54 2.77ZM14.6 5.98c.49-.59.82-1.4.73-2.21-.71.03-1.57.47-2.08 1.05-.45.52-.85 1.34-.74 2.13.79.06 1.6-.4 2.1-.97Z" />
                  </svg>
                  Apple
                </button>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-4 text-center text-xs text-[#8190b0]">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-semibold text-[#8d62ff] transition hover:text-[#aa8aff]"
            >
              Sign up
            </button>
          </p>
          </>
          ) : (
            <DemoOtpChallenge
              email={email.trim()}
              purpose="login"
              onVerified={finishLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}
