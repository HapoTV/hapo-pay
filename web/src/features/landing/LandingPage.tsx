import { useEffect, useState } from "react";

const features = [
  {
    title: "Parent controls",
    description: "Set allowances, limits, merchant rules, and emergency controls from one simple dashboard.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Student spending",
    description: "Give students a safe wallet experience with balances, requests, rewards, and spending feedback.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "QR payments",
    description: "Enable fast, secure, contactless payments with real-time transaction confirmations.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Financial growth",
    description: "Turn smart money habits into points, achievements, challenges, and visible progress.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7H6v10h7V7zM13 17H6a1 1 0 001 1h6a1 1 0 001-1zm0-10V7a1 1 0 00-1-1H7a1 1 0 00-1 1v10a1 1 0 001 1h5a1 1 0 001-1z" />
      </svg>
    ),
  },
];

const stats = [
  { value: 10, label: "Built-in platform features", animated: true },
  { value: "24/7", label: "Spending visibility" },
  { value: "QR", label: "Safe payment flow" },
  { value: "RLS", label: "Protected data access" },
];

const steps = [
  "Create a parent account and verify your profile.",
  "Add children with custom spending limits and allowance rules.",
  "Students spend safely using QR payments and request money when needed.",
  "Families track spending, earn rewards, and build better financial habits.",
];

const safetyItems = [
  "Role-based parent and student access",
  "Real-time transaction alerts",
  "Merchant and category restrictions",
  "Emergency account controls",
  "Encrypted financial activity",
  "Spending limits per child",
];

function HapoLogo() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-xs font-bold uppercase tracking-[0.18em] text-slate-900 shadow-md shadow-slate-900/6">
      Logo
    </span>
  );
}

export default function LandingPage() {
  const [featureCount, setFeatureCount] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFeatureCount((prev) => (prev >= 10 ? 0 : prev + 1));
    }, 150);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <section className="relative isolate px-0 pt-1 lg:px-0">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(15,23,42,0.04),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_48%,_#e2e8f0_100%)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-100/70 blur-3xl" />

        <nav className="mx-auto mt-4 flex w-[min(99.8%,90rem)] items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white/95 px-8 py-2 shadow-md shadow-slate-200/10 backdrop-blur-md">
          <a href="/" className="flex items-center gap-3">
            <HapoLogo />
            <span className="text-base font-black tracking-tight text-slate-900">HapoPay</span>
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

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_0_5px_rgba(248,113,113,0.12)]" />
              Smart student spending platform
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Empowering student spending. Shaping financial futures.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              A smart financial platform that enables parents/guardians to manage student spending conveniently. Students can make payments using QR codes, while parents maintain complete control with real-time monitoring and smart spending limits.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/login" className="rounded-full bg-rose-500 px-8 py-4 text-center text-base font-bold text-white shadow-xl shadow-rose-300/20 transition hover:bg-rose-600">
                Start with HapoPay
              </a>
              <a href="#features" className="rounded-full border border-slate-300 bg-white px-8 py-4 text-center text-base font-bold text-slate-900 transition hover:bg-slate-100">
                Explore features
              </a>
            </div>
          </div>

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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-dashed border-slate-400 bg-slate-950/10 shadow-sm">
                      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-slate-500">Logo</span>
                    </div>
                    <div className="mt-3 h-6" />
                    <p className="mt-1 text-sm font-semibold text-slate-500">HapoPay</p>
                  </div>

                  <div className="w-full rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-lg">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-900">Scan QR</p>
                    <div className="mx-auto mt-3 grid h-28 w-28 grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-2 shadow">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span
                          key={index}
                          className={`rounded-[3px] ${
                            [0, 1, 3, 4, 5, 8, 10, 12, 13, 16, 18, 20, 21, 23, 24].includes(index)
                              ? "bg-slate-950"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-900">Tap or scan to pay safely</p>
                    <p className="mt-1 text-xs text-slate-500">Parent limits and alerts stay active.</p>
                  </div>

                  <div className="h-1.5 w-28 rounded-full bg-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-100/70 px-6 py-8 lg:px-8 -mt-4">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-lg font-semibold text-slate-950">
                {stat.animated ? (featureCount === 10 ? "10+" : featureCount) : stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-semibold uppercase tracking-[0.3em] text-success">About us</p>
              <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">We help families build confident young money managers.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-700">
              HapoPay is a parent-child money management platform designed to make student spending safer, smarter, and more educational through real-time controls, QR payments, rewards, and guided financial habits.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-semibold uppercase tracking-[0.3em] text-primary">Core features</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Everything families need for safer student money management.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="group rounded-[2rem] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:bg-slate-50">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 ring-1 ring-slate-200">{feature.icon}</div>
                  <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="px-6 pb-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 lg:grid-cols-2">
          <div>
            <p className="font-semibold uppercase tracking-[0.3em] text-slate-900">Safety first</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Bank-level thinking for everyday student spending.</h2>
            <p className="mt-5 text-base text-slate-700">
              HapoPay is designed around parental visibility, student independence, and strong controls that make digital money safer for young users.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {safetyItems.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 text-xs font-medium text-slate-900">
                <span className="mr-2 text-slate-900">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-semibold uppercase tracking-[0.3em] text-warning">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">From setup to smart spending in four simple steps.</h2>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-3xl border border-slate-200 bg-slate-100 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-700 text-slate-100 font-semibold">{index + 1}</div>
                  <p className="self-center text-sm text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-slate-100 p-8 text-center shadow-2xl shadow-slate-300/20 md:p-14">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Ready to build better money habits?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-700">
            Start with a safer student wallet experience built for parents, students, schools, and future financial confidence.
          </p>
          <a href="/login" className="mt-8 inline-flex rounded-full bg-rose-500 px-7 py-3 text-base font-semibold text-white transition hover:bg-rose-600">
            Continue to sign in
          </a>
        </div>
      </section>

      <footer className="bg-slate-800 text-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-4">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-sm font-black text-white">Logo</span>
                <span className="text-lg font-semibold tracking-tight text-white">HapoPay</span>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-300">
                Empowering families with smarter student spending controls, safe QR payments, and real-time parent visibility.
              </p>
              <div className="flex items-center gap-3 text-slate-300">
                <a href="#" className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.62 9.87v-6.99H7.9v-2.88h2.48V9.41c0-2.45 1.45-3.8 3.67-3.8 1.06 0 2.17.19 2.17.19v2.39h-1.22c-1.2 0-1.57.75-1.57 1.52v1.82h2.68l-.43 2.88h-2.25v6.99A10 10 0 0022 12z"/></svg>
                </a>
                <a href="#" className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 19c7.18 0 11.1-5.94 11.1-11.1v-.51A7.94 7.94 0 0022 4.58a7.93 7.93 0 01-2.28.63A3.99 3.99 0 0021.44 3a7.96 7.96 0 01-2.52.96A3.97 3.97 0 0015.5 3c-2.2 0-4 1.8-4 4 0 .31.03.61.1.9A11.3 11.3 0 013 4.94a4 4 0 00-.54 2.02c0 1.4.71 2.64 1.8 3.36a4 4 0 01-1.82-.5v.05c0 1.9 1.35 3.48 3.14 3.84a3.98 3.98 0 01-1.81.07 4.01 4.01 0 003.74 2.78A7.97 7.97 0 012 17.54a11.3 11.3 0 006.1 1.79"/></svg>
                </a>
                <a href="#" className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zm-5 19h-2v-6h2v6zm-1-7.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4zM18 19h-2v-3c0-.83-.67-1.5-1.5-1.5S13 15.17 13 16v3h-2v-6h2v.52c.3-.36.76-.52 1.24-.52 1.17 0 2.26.96 2.26 2.4V19z"/></svg>
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
    </main>
  );
}
