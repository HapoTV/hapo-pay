import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const countries = [
  { label: "ZA +27", value: "ZA" },
  { label: "US +1", value: "US" },
  { label: "UK +44", value: "UK" },
];

const currencies = [
  { label: "za South African Rand (R)", value: "ZAR" },
  { label: "us US Dollar ($)", value: "USD" },
];

const provinces = [
  "Select your province",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
];

export default function ParentSignupScreen() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [country, setCountry] = useState("ZA");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState(provinces[0]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && confirmPassword === password && agree) {
      // Create a mock token for local development
      const mockToken = btoa(`${email}:${password}`);
      setAuth(mockToken, "parent");
      navigate("/parent");
    } else if (password !== confirmPassword) {
      alert("Passwords do not match");
    } else if (!agree) {
      alert("Please agree to the terms");
    } else {
      alert("Please fill in all required fields");
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
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Phelo"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Surname</label>
                <input
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
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Mobile Number</label>
                <div className="mt-2 flex gap-3">
                  <select
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
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="123456789"
                    className="w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 text-slate-100 transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                >
                  {currencies.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-3 rounded-2xl bg-[#101726] px-4 py-3 text-sm text-[#8190b0]">
                  Currency auto-selected as ZAR based on your phone number. You can change this if needed.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 text-slate-100 transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                >
                  {provinces.map((option) => (
                    <option key={option} value={option} disabled={option === provinces[0]}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-3 text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 text-slate-100 transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                required
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
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
              className="mt-4 w-full rounded-2xl bg-[#713cff] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
