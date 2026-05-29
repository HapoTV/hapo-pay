import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentLoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual authentication logic
    console.log("Student sign in:", { email, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-rose-500 px-6 py-2 text-sm font-bold text-rose-500 transition hover:bg-rose-50"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Login Form Container */}
      <div className="flex items-center justify-center px-6 py-24 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {/* Header */}
          <h1 className="text-center text-2xl font-black tracking-tight text-slate-950">
            Student Login
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Use the credentials provided by your parent
          </p>

          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@hapo.com"
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

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-rose-500 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-rose-300/20 transition hover:bg-rose-600"
            >
              Sign In
            </button>
          </form>

          {/* Help Text */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Need help? Ask your parent to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
}
