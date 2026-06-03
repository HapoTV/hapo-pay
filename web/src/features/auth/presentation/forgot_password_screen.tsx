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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/login")}
            className="rounded-full border border-slate-300 px-6 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Back to Login
          </button>
        </div>
      </nav>

      {/* Reset Form Container */}
      <div className="flex items-center justify-center px-6 py-20 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {/* Header */}
          <h1 className="text-center text-2xl font-black tracking-tight text-slate-950">
            Reset Password
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            {step === "email"
              ? "Enter your email address to reset your password"
              : "Enter your new password"}
          </p>

          {/* Success Message */}
          {success && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
              Password reset successfully! Redirecting to login...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
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

              <button
                type="submit"
                className="w-full rounded-full bg-rose-500 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-rose-300/20 transition hover:bg-rose-600"
              >
                Send Reset Link
              </button>
            </form>
          )}

          {/* Password Reset Step */}
          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-rose-500 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-rose-300/20 transition hover:bg-rose-600"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-rose-500 transition hover:text-rose-600"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
