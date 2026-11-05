import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Circle, Copy, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/Logo";
import { authApi, getApiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { createFamilyInviteCode, saveFamilyInviteCode } from "../familyInviteCode";
import { DemoOtpChallenge } from "./DemoOtpChallenge";

const countries = [
  { label: "ZA +27", value: "ZA" },
  { label: "US +1", value: "US" },
  { label: "UK +44", value: "UK" },
];

export default function ParentSignupScreen() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [confirmation, setConfirmation] = useState<{
    name: string;
    email: string;
    familyInviteCode: string;
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [country, setCountry] = useState("ZA");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a letter", met: /[A-Za-z]/.test(password) },
  ];
  const isPasswordValid = passwordRequirements.every((requirement) => requirement.met);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please meet all password requirements.");
      return;
    }
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
      const fullName = `${firstName.trim()} ${surname.trim()}`.trim();
      const dialCode = countries.find((option) => option.value === country)?.label.split(" ")[1] ?? "";
      const enteredPhone = phone.trim().replace(/[\s()-]/g, "");
      const phoneNumber = enteredPhone.startsWith("+")
        ? enteredPhone
        : `${dialCode}${enteredPhone.replace(/^0/, "")}`;
      await authApi.register({
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        full_name: fullName,
        role: "parent",
        phone_number: phoneNumber,
      });
      clearAuth();
      const familyInviteCode = createFamilyInviteCode();
      saveFamilyInviteCode(familyInviteCode);
      setConfirmation({ name: fullName, email: email.trim(), familyInviteCode });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyFamilyInviteCode = async () => {
    if (!confirmation?.familyInviteCode) return;

    try {
      await navigator.clipboard.writeText(confirmation.familyInviteCode);
      setCopyStatus("Family invite code copied.");
    } catch {
      setCopyStatus("Copy failed. Select and copy the code manually.");
    }
  };

  return (
    <div className="min-h-dvh bg-[#070b14] text-slate-100">
      <nav className="border-b border-[#202a40] bg-[#0b101c]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#293650] px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-[#121a2b]"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-[#713cff] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#824fff]"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100dvh-48px)] items-center justify-center px-4 py-1.5 lg:px-8">
        <div className="w-full max-w-3xl rounded-[1.5rem] border border-[#222d46] bg-[radial-gradient(ellipse_at_55%_0%,_#2a1d50_0%,_#17132b_40%,_#080c15_78%)] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-5">
          <Logo className="mx-auto mb-2 h-8 w-28 object-contain" />
          <div aria-label="Signup progress" className="mb-3 flex items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#713cff] text-xs font-bold text-white">1</span>
            <span className="mx-2 h-1 flex-1 rounded-full bg-[#713cff]" />
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${confirmation ? "bg-[#713cff] text-white" : "bg-[#202a40] text-[#9aa8bf]"}`}>2</span>
            <span className={`mx-2 h-1 flex-1 rounded-full ${confirmation ? "bg-[#713cff]" : "bg-[#202a40]"}`} />
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${confirmation ? "bg-[#713cff] text-white" : "bg-[#202a40] text-[#9aa8bf]"}`}>3</span>
          </div>
          {confirmation && !emailVerified ? (
            <DemoOtpChallenge
              email={confirmation.email}
              purpose="email"
              onVerified={() => setEmailVerified(true)}
            />
          ) : confirmation ? (
            <section aria-labelledby="family-setup-heading">
              <h1 id="family-setup-heading" className="text-xl font-black tracking-tight text-white">
                Set up your family
              </h1>

              <div className="mt-4 rounded-2xl border border-[#26334d] bg-[#121a2a] p-4">
                <p className="text-xs font-semibold text-[#a0aec0]">Your family invite code</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="select-all break-all text-lg font-bold tracking-wider text-[#8d62ff] sm:text-xl">
                    {confirmation.familyInviteCode || "Unavailable"}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyFamilyInviteCode()}
                    disabled={!confirmation.familyInviteCode}
                    aria-label="Copy family invite code"
                    className="shrink-0 rounded-lg p-2 text-[#a0aec0] transition hover:bg-[#202a40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#713cff] disabled:opacity-50"
                  >
                    {copyStatus === "Family invite code copied." ? (
                      <Check aria-hidden="true" className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Copy aria-hidden="true" className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#a0aec0]">This is a demo code for now. Real code generation and account pairing will be connected through a backend API later.</p>
                {copyStatus && <p role="status" className="mt-2 text-sm text-[#a0aec0]">{copyStatus}</p>}
              </div>

              <div className="mt-4 space-y-3 rounded-2xl bg-[#1e293b] p-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-[#a0aec0]">Account summary</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#a0aec0]">Name</dt>
                    <dd className="text-right font-semibold text-slate-100">{confirmation.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#a0aec0]">Email</dt>
                    <dd className="break-all text-right font-semibold text-slate-100">{confirmation.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#a0aec0]">Role</dt>
                    <dd className="font-semibold text-slate-100">Parent</dd>
                  </div>
                </dl>
              </div>

              <p className="mt-3 text-center text-xs text-[#a0aec0]">
                By signing up you agree to HapoPay&apos;s{" "}
                <a
                  href="/docs/HapoPay_Terms___Conditions_.docx.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#8d62ff] underline"
                >
                  Terms &amp; Privacy Policy
                </a>
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#713cff] py-3 text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
              >
                Continue to login
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </section>
          ) : (
            <>
          <h1 className="text-center text-xl font-black tracking-tight text-white">
            Create your parent account
          </h1>
          <p className="mt-1 text-center text-xs text-[#8190b0]">
            Create your HapoPay account to manage your family&apos;s finances
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            <div className="grid gap-3 min-[360px]:grid-cols-2">
              <div>
                <label htmlFor="signup-first-name" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">First Name</label>
                <input
                  id="signup-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Phelo"
                  className="mt-1.5 w-full rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-2.5 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-surname" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">Surname</label>
                <input
                  id="signup-surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Madala"
                  className="mt-1.5 w-full rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-2.5 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-mobile" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">Mobile Number</label>
                <div className="mt-1.5 flex gap-2">
                  <select
                    aria-label="Country calling code"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 rounded-xl border border-[#26334d] bg-[#121a2a] px-2 text-xs text-slate-100 transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
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
                    className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-2.5 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-2.5 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 min-[360px]:grid-cols-2">
              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">Password</label>
                <div className="relative mt-1.5">
                  <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8190b0]" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8190b0] transition hover:text-slate-100 focus:outline-none focus-visible:text-slate-100"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-semibold uppercase tracking-wide text-[#8190b0]">Confirm Password</label>
                <div className="relative mt-1.5">
                  <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8190b0]" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength={8}
                    className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-[#71809d] transition focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8190b0] transition hover:text-slate-100 focus:outline-none focus-visible:text-slate-100"
                  >
                    {showConfirmPassword ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
                  </button>
                </div>
              </div>

              <ul
                aria-label="Password requirements"
                className="grid gap-2 rounded-xl bg-[#1e293b] p-3 text-xs font-medium text-[#a0aec0] min-[360px]:col-span-2 min-[360px]:grid-cols-3 sm:col-span-2"
              >
                {passwordRequirements.map(({ label, met }) => (
                  <li key={label} className="flex items-center gap-2">
                    {met ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white" aria-hidden="true">
                        ✓
                      </span>
                    ) : (
                      <Circle aria-hidden="true" className="h-4 w-4 shrink-0 fill-[#172033] text-[#172033]" />
                    )}
                    <span className={met ? "text-slate-100" : ""}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <label className="mt-1 flex items-start gap-2 text-xs text-[#8190b0]">
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
              className="mt-1 w-full rounded-xl bg-[#713cff] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
