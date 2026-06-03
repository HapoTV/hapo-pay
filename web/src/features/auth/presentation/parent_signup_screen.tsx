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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-slate-300 px-6 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-rose-500 px-6 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-16 lg:px-8">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h1 className="text-center text-2xl font-black tracking-tight text-slate-950">
            Parent Register
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Create your Hapo account to manage your family's finances
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-900">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Phelo"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Surname</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Madala"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-[0.75fr_1.25fr]">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Mobile Number</label>
                <div className="mt-2 flex gap-3">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-slate-900 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {currencies.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  Currency auto-selected as ZAR based on your phone number. You can change this if needed.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-slate-900 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                <label className="block text-sm font-semibold text-slate-900">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-slate-900 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                required
              />
              <span>
                I agree to the <span className="font-semibold text-rose-500">Terms & Conditions</span>
              </span>
            </label>

            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-rose-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-300/20 transition hover:bg-rose-600"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
