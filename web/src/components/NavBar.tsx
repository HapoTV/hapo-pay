import { Logo } from "./Logo";

export default function NavBar() {
  return (
    <nav className="mx-auto mt-4 flex w-[min(99.8%,90rem)] items-center justify-between gap-2 rounded-[1.5rem] border border-slate-200 bg-white/95 px-8 py-2 shadow-md shadow-slate-200/10 backdrop-blur-md">
      <a href="/" className="flex items-center gap-3">
        <Logo className="h-14 w-14 object-contain" alt="HapoPay logo" />
      </a>
      <div className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-900 md:flex">
        <a href="/" className="transition hover:text-slate-700">HOME</a>
        <a href="#about" className="transition hover:text-slate-700">ABOUT US</a>
        <a href="#features" className="transition hover:text-slate-700">FEATURES</a>
        <a href="#how-it-works" className="transition hover:text-slate-700">HOW IT WORKS</a>
      </div>
      <div className="flex items-center gap-3">
        <a href="/login" className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-600">
          Parent Sign In
        </a>
        <a href="/student-login" className="hidden rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-200 sm:inline-flex">
          Student Login
        </a>
      </div>
    </nav>
  );
}
