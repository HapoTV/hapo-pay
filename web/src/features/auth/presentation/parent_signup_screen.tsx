import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const countries = [
  { label: "ZA +27", value: "ZA" },
  { label: "US +1", value: "US" },
  { label: "UK +44", value: "UK" },
];

export default function ParentSignupScreen() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [country, setCountry] = useState("ZA");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setIsSubmitting(true);
    try {
      setAuth("demo-parent-token", "parent");
      navigate("/parent");
    } catch {
      setError("Unable to create your account. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <nav className="border-b border-[#202a40] bg-[#0b101c]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#293650] px-6 py-2 text-sm font-bold text-slate-200 transition hover:bg-[#121a2b]"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-[#713cff] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#824fff]"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-2xl rounded-[2rem] border border-[#222d46] bg-[#080c15] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-8">
          <h1 className="text-center text-2xl font-black tracking-tight text-white">
            Create your parent account
          </h1>
          <p className="mt-2 text-center text-sm text-[#8190b0]">
            Create your Hapo account to manage your family's finances
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-first-name" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">First Name</label>
                <input
                  id="signup-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Phelo"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-surname" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Surname</label>
                <input
                  id="signup-surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Madala"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-[0.75fr_1.25fr]">
              <div>
                <label htmlFor="signup-mobile" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Mobile Number</label>
                <div className="mt-2 flex gap-3">
                  <select
                    aria-label="Country calling code"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-12 rounded-2xl border border-[#26334d] bg-[#121a2a] px-3 text-slate-100 transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  >
                    {countries.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="signup-mobile"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="123456789"
                    className="w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>

            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-password" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm text-[#8190b0]">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#26334d] bg-[#121a2a] text-[#713cff] focus:ring-[#713cff]"
                required
              />
              <span>
                I agree to the{' '}
                <a
                  href="/docs/HapoPay_Terms___Conditions_.docx.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#8d62ff] underline"
                >
                  Terms & Conditions
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-2xl bg-[#713cff] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
