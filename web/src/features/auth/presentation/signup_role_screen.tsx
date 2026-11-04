import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export default function SignupRoleScreen() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b14] px-4 py-8 text-slate-100">
      <section className="w-full max-w-md rounded-[2rem] border border-[#222d46] bg-[radial-gradient(ellipse_at_55%_0%,_#172b31_0%,_#101821_42%,_#080c15_82%)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-8">
        <Logo className="mx-auto h-14 w-40 object-contain" />
        <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-white">
          Create account
        </h1>
        <p className="mt-2 text-center text-sm text-[#9aa8bf]">
          Join HapoPay in seconds
        </p>

        <div aria-label="Signup progress" className="mt-8 flex items-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#713cff] text-sm font-bold text-white">1</span>
          <span className="mx-2 h-1 flex-1 rounded-full bg-[#202a40]" />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202a40] text-sm font-bold text-[#9aa8bf]">2</span>
          <span className="mx-2 h-1 flex-1 rounded-full bg-[#202a40]" />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202a40] text-sm font-bold text-[#9aa8bf]">3</span>
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-100">Who are you?</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate("/signup/parent")}
            className="flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-[#713cff] bg-[#1a1530] px-4 py-5 text-center transition hover:bg-[#211a3a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a78ff]"
          >
            <span aria-hidden="true" className="text-4xl">👪</span>
            <span className="mt-3 font-bold text-slate-100">Parent</span>
            <span className="mt-1 text-sm text-[#9aa8bf]">Manage &amp; monitor</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup/student")}
            className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-[#26334d] bg-[#121a2a] px-4 py-5 text-center transition hover:border-[#713cff] hover:bg-[#171e2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a78ff]"
          >
            <span aria-hidden="true" className="text-4xl">🎒</span>
            <span className="mt-3 font-bold text-slate-100">Student</span>
            <span className="mt-1 text-sm text-[#9aa8bf]">Spend &amp; earn</span>
          </button>
        </div>

        <p className="mt-7 text-center text-sm text-[#9aa8bf]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-[#9a78ff] hover:text-[#b19aff]"
          >
            Login
          </button>
        </p>
      </section>
    </main>
  );
}
