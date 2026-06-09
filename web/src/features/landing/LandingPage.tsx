import { useEffect, useState } from "react";

import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import PhoneMockup from "../../components/PhoneMockup";

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

// NavBar extracted to `web/src/components/NavBar.tsx`

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

        <NavBar />

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

          <PhoneMockup />
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

      <Footer />
    </main>
  );
}
