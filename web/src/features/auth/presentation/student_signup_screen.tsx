import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { authApi, getApiErrorMessage } from "@/api/client";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { DemoOtpChallenge } from "./DemoOtpChallenge";

export default function StudentSignupScreen() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [step, setStep] = useState<"details" | "family">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [familyInviteCode, setFamilyInviteCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a letter", met: /[A-Za-z]/.test(password) },
  ];

  const handleDetailsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!passwordRequirements.every((requirement) => requirement.met)) {
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
    setStep("family");
  };

  const handleInviteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!familyInviteCode.trim()) {
      setError("Enter the family invite code from your parent.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.register({
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        full_name: name.trim(),
        role: "student",
      });
      clearAuth();
      setComplete(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to finish signup. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#070b14] px-4 py-3 text-slate-100">
      <section className="w-full max-w-2xl rounded-[1.5rem] border border-[#222d46] bg-[radial-gradient(ellipse_at_55%_0%,_#172b31_0%,_#101821_42%,_#080c15_82%)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-5">
        <button
          type="button"
          onClick={() => (step === "family" ? setStep("details") : navigate("/signup"))}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9aa8bf] transition hover:text-white"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          {step === "family" ? "Back" : "Choose another role"}
        </button>
        <Logo className="mx-auto mt-1 h-10 w-32 object-contain" />

        {complete && !emailVerified ? (
          <DemoOtpChallenge
            email={email}
            purpose="email"
            onVerified={() => setEmailVerified(true)}
          />
        ) : complete ? (
          <div className="mt-4 text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto h-10 w-10 text-emerald-400" />
            <h1 className="mt-3 text-xl font-black text-white">You&apos;re all set!</h1>
            <p className="mt-2 text-xs leading-5 text-[#a0aec0]">
              Your student account has been created. The family code is demo-only and has not linked the account yet. Sign in with your registered email and password.
            </p>
            <button
              type="button"
              onClick={() => navigate("/student-login")}
              className="mt-4 w-full rounded-xl bg-[#713cff] py-3 text-sm font-bold text-white transition hover:bg-[#824fff]"
            >
              Continue to login
            </button>
          </div>
        ) : step === "details" ? (
          <>
            <h1 className="mt-2 text-center text-xl font-black text-white">Create student account</h1>
            <p className="mt-1 text-center text-xs text-[#9aa8bf]">Join your family on HapoPay</p>
            <div aria-label="Signup progress" className="mt-4 flex items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#713cff] text-xs font-bold">1</span>
              <span className="mx-2 h-1 flex-1 rounded-full bg-[#713cff]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#713cff] text-xs font-bold">2</span>
              <span className="mx-2 h-1 flex-1 rounded-full bg-[#202a40]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202a40] text-xs font-bold text-[#9aa8bf]">3</span>
            </div>

            <form onSubmit={handleDetailsSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200 sm:col-span-2">{error}</p>}
              <div>
                <label htmlFor="student-signup-name" className="block text-xs font-semibold uppercase tracking-wide text-[#9aa8bf]">Full name</label>
                <div className="relative mt-1.5">
                  <UserRound aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190b0]" />
                  <input id="student-signup-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ama Mensah" autoComplete="name" className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-[#71809d] focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]" required />
                </div>
              </div>
              <div>
                <label htmlFor="student-signup-email" className="block text-xs font-semibold uppercase tracking-wide text-[#9aa8bf]">Email</label>
                <div className="relative mt-1.5">
                  <Mail aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190b0]" />
                  <input id="student-signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-[#71809d] focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]" required />
                </div>
              </div>
              <div>
                <label htmlFor="student-signup-password" className="block text-xs font-semibold uppercase tracking-wide text-[#9aa8bf]">Password</label>
                <div className="relative mt-1.5">
                  <LockKeyhole aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190b0]" />
                  <input id="student-signup-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-[#71809d] focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]" required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8190b0] transition hover:text-slate-100 focus:outline-none focus-visible:text-slate-100">
                    {showPassword ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="student-signup-confirm-password" className="block text-xs font-semibold uppercase tracking-wide text-[#9aa8bf]">Confirm Password</label>
                <div className="relative mt-1.5">
                  <LockKeyhole aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190b0]" />
                  <input id="student-signup-confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter password" autoComplete="new-password" minLength={8} className="w-full rounded-xl border border-[#26334d] bg-[#121a2a] py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-[#71809d] focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]" required />
                  <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8190b0] transition hover:text-slate-100 focus:outline-none focus-visible:text-slate-100">
                    {showConfirmPassword ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
                  </button>
                </div>
              </div>
              <ul aria-label="Password requirements" className="grid gap-2 rounded-xl bg-[#1e293b] p-3 text-xs font-medium text-[#a0aec0] sm:col-span-2 sm:grid-cols-3">
                {passwordRequirements.map(({ label, met }) => (
                  <li key={label} className="flex items-center gap-2">
                    {met ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white" aria-hidden="true">✓</span>
                    ) : (
                      <Circle aria-hidden="true" className="h-4 w-4 shrink-0 fill-[#172033] text-[#172033]" />
                    )}
                    <span className={met ? "text-slate-100" : ""}>{label}</span>
                  </li>
                ))}
              </ul>
              <label className="flex items-start gap-2 text-xs text-[#9aa8bf] sm:col-span-2">
                <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#26334d] bg-[#121a2a] text-[#713cff] focus:ring-[#713cff]" />
                <span>
                  I agree to the{" "}
                  <a href="/docs/HapoPay_Terms___Conditions_.docx.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#9a78ff] underline">Terms &amp; Conditions</a>
                </span>
              </label>
              <button type="submit" className="w-full rounded-xl bg-[#713cff] py-3 text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff] sm:col-span-2">
                Continue
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-center text-xl font-black text-white">Link to your family</h1>
            <p className="mt-1 text-center text-xs text-[#9aa8bf]">Ask your parent for their family invite code</p>
            <div aria-label="Signup progress" className="mt-4 flex items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#713cff] text-xs font-bold">1</span>
              <span className="mx-2 h-1 flex-1 rounded-full bg-[#713cff]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#713cff] text-xs font-bold">2</span>
              <span className="mx-2 h-1 flex-1 rounded-full bg-[#713cff]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#713cff] text-xs font-bold">3</span>
            </div>
            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3">
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
              <div>
                <label htmlFor="student-family-invite" className="block text-xs font-semibold uppercase tracking-wide text-[#9aa8bf]">Family invite code</label>
                <input id="student-family-invite" value={familyInviteCode} onChange={(event) => setFamilyInviteCode(event.target.value.trim())} placeholder="HAPOFAM-..." autoComplete="off" className="mt-1.5 w-full rounded-xl border border-[#26334d] bg-[#121a2a] px-3 py-3 text-sm font-semibold tracking-wider text-slate-100 placeholder:font-normal placeholder:tracking-normal placeholder:text-[#71809d] focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]" required />
                <p className="mt-2 text-xs leading-5 text-[#9aa8bf]">Family code validation and account pairing will be added when the backend API is available.</p>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[#713cff] py-3 text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? "Creating account..." : "Finish Sign Up"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
