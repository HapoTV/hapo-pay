import { useState } from "react";

export const DEMO_OTP_CODE = "123456";

interface DemoOtpChallengeProps {
  email: string;
  purpose: "email" | "login";
  onVerified: () => void;
}

export function DemoOtpChallenge({
  email,
  purpose,
  onVerified,
}: DemoOtpChallengeProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const isEmailVerification = purpose === "email";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim() !== DEMO_OTP_CODE) {
      setError("That code is incorrect. Enter the demo code shown below.");
      return;
    }

    setError("");
    onVerified();
  };

  return (
    <section className="mt-7" aria-labelledby="otp-heading">
      <h2 id="otp-heading" className="text-center text-xl font-black text-white">
        {isEmailVerification ? "Verify your email" : "Verify your login"}
      </h2>
      <p className="mt-2 text-center text-sm text-[#9aa8bf]">
        {isEmailVerification
          ? `Enter the verification code for ${email}.`
          : `Enter the one-time code for ${email} to finish signing in.`}
      </p>
      <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-center text-sm text-amber-200">
        Demo only: no email was sent. Use this demo code:{" "}
        <strong className="font-bold tracking-widest">{DEMO_OTP_CODE}</strong>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label htmlFor="demo-otp-code" className="block text-sm font-semibold uppercase tracking-wide text-[#8190b0]">
          One-time code
        </label>
        <input
          id="demo-otp-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          placeholder="6-digit code"
          className="w-full rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-4 text-center text-xl tracking-[0.5em] text-slate-100 placeholder:text-sm placeholder:tracking-normal placeholder:text-[#71809d] focus:border-[#713cff] focus:outline-none focus:ring-1 focus:ring-[#713cff]"
          required
        />
        <button
          type="submit"
          className="w-full rounded-2xl bg-[#713cff] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#713cff]/20 transition hover:bg-[#824fff]"
        >
          Verify code
        </button>
      </form>
    </section>
  );
}
