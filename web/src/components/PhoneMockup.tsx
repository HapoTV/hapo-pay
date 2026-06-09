import primaryLogoUrl from "../assets/hapo-pay-logo.svg";
import QrGrid from "./QrGrid";

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto flex w-full max-w-md justify-center lg:max-w-lg">
      <div className="absolute -right-4 top-20 z-20 hidden w-32 rounded-3xl border border-slate-200 bg-slate-100/95 p-2 shadow-2xl backdrop-blur-xl sm:block lg:-right-8">
        <p className="text-[0.5rem] font-semibold uppercase tracking-[0.15em] text-slate-500">Scan to pay</p>
        <p className="mt-1 text-xs font-black text-slate-950"><span className="text-rose-500/80">QR</span> Ready</p>
      </div>
      <div className="absolute -right-4 top-20 z-20 hidden w-32 translate-y-24 rounded-3xl border border-slate-200 bg-slate-100/90 p-2 shadow-2xl backdrop-blur-xl sm:block lg:-right-8">
        <p className="text-[0.65rem] text-slate-500">Payment status</p>
        <p className="mt-1 text-xs font-bold text-slate-950">Protected</p>
      </div>
      <div className="absolute -right-4 top-20 z-20 hidden w-32 translate-y-48 rounded-3xl border border-slate-200 bg-slate-100/90 p-2 shadow-2xl backdrop-blur-xl sm:block lg:-right-8">
        <p className="text-[0.65rem] text-slate-500">Learning games</p>
        <p className="mt-1 text-xs font-bold text-slate-950">Play <span className="text-rose-500/80">&</span> earn</p>
      </div>
      <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-primary/30 via-success/15 to-warning/20 blur-3xl" />
      <div className="relative w-[180px] rounded-[1.5rem] border-[5px] border-slate-600 bg-slate-800/90 p-1 shadow-sm shadow-primary/20 ring-1 ring-white/8 sm:w-[220px]">
        <div className="absolute left-1/2 top-0 z-20 h-4 w-20 -translate-x-1/2 rounded-b-3xl bg-slate-600" />
        <div className="relative min-h-[280px] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_50%_12%,_rgba(255,255,255,0.18),_transparent_30%),linear-gradient(160deg,_#323f4a_0%,_#243244_42%,_#125c88_100%)] px-2 py-5">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.12),_transparent_35%,_rgba(40,167,69,0.18))]" />
          <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-between text-center">
            <div className="pt-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/10 shadow-sm">
                <img src={primaryLogoUrl} alt="HapoPay logo" className="h-12 w-12 object-contain" />
              </div>
              <div className="mt-3 h-6" />
            </div>

            <div className="w-full rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-900">Scan QR</p>
              <QrGrid />
              <p className="mt-4 text-sm font-semibold text-slate-900">Tap or scan to pay safely</p>
              <p className="mt-1 text-xs text-slate-500">Parent limits and alerts stay active.</p>
            </div>

            <div className="h-1.5 w-28 rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
