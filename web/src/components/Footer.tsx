import { Logo } from "./Logo";
import { FacebookIcon, TwitterIcon, LinkedInIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <Logo className="h-14 w-14 object-contain" alt="HapoPay logo" />
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-300">
              Empowering families with smarter student spending controls, safe QR payments, and real-time parent visibility.
            </p>
            <div className="flex items-center gap-3 text-slate-300">
              <a href="#" className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700">
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700">
                <LinkedInIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Product</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li><a href="#features" className="transition hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="transition hover:text-white">How it works</a></li>
              <li><a href="/login" className="transition hover:text-white">Parent sign in</a></li>
              <li><a href="/student-login" className="transition hover:text-white">Student login</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Company</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li><a href="#about" className="transition hover:text-white">About</a></li>
              <li><a href="#safety" className="transition hover:text-white">Safety</a></li>
              <li><a href="#features" className="transition hover:text-white">Careers</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Support</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li><a href="#" className="transition hover:text-white">Help center</a></li>
              <li><a href="#" className="transition hover:text-white">Contact support</a></li>
              <li><a href="#" className="transition hover:text-white">Privacy policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HapoPay. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="transition hover:text-white">Terms of service</a>
            <a href="#" className="transition hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
