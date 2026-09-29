import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    // TODO: Send verification code to email
    console.log("Verification code sent to:", email);
    setStep("reset");
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // TODO: Call API to reset password
    console.log("Password reset for:", email);
    setSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Top Navigation */}
      <nav className="border-b border-[#202a40] bg-[#0b101c]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/login")}
            className="rounded-full border border-[#293650] px-6 py-2 text-sm font-bold text-slate-200 transition hover:bg-[#121a2b]"
          >
            Back to Login
          </button>
        </div>
      </nav>

      {/* Reset Form Container */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-[#222d46] bg-[#080c15] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <h1 className="text-center text-2xl font-black tracking-tight text-white">
            Reset Password
          </h1>
          <p className="mt-2 text-center text-sm text-[#8190b0]">
            {step === "email"
              ? "Enter your email address to reset your password"
              : "Enter your new password"}
          </p>

          {/* Success Message */}
          {success && (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center text-sm font-semibold text-emerald-300">
              Password reset successfully! Redirecting to login...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
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

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#713cff] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
              >
                Send Reset Link
              </button>
            </form>
          )}

          {/* Password Reset Step */}
          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
                <p className="mt-1 text-xs text-[#71809d]">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#713cff] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <p className="mt-6 text-center text-sm text-[#8190b0]">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-[#8d62ff] transition hover:text-[#aa8aff]"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
