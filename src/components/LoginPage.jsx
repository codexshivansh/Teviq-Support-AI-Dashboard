import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useTeviqAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { authError, clerkConfigured, isDemoLoginEnabled, startDemoSession } = useTeviqAuth();
  const loginBenefits = [
    "Brand-isolated workspaces",
    "Google and email login",
    "Persistent secure sessions",
    isDemoLoginEnabled ? "Demo mode for presentations" : "Protected production dashboard"
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(99,102,241,0.2),transparent_26%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-100">
            <Sparkles className="h-3.5 w-3.5" />
            Teviq Admin
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Sign in to manage your AI support workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Control knowledge, conversations, Shopify demo sync, analytics and widget installation from one premium dashboard.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            {loginBenefits.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/7 px-3 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>

          {isDemoLoginEnabled ? (
            <button
              type="button"
              onClick={startDemoSession}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-300/25 bg-teal-300/12 px-5 py-3 text-sm font-bold text-teal-50 shadow-sm transition hover:bg-teal-300/18 focus:outline-none focus:ring-4 focus:ring-teal-300/15"
            >
              Demo Login: Urban Demo
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="mx-auto w-full max-w-md rounded-[32px] border border-white/12 bg-white p-2 shadow-2xl"
        >
          <div className="rounded-[26px] border border-slate-100 bg-white p-4">
            {clerkConfigured ? (
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    cardBox: "shadow-none border-0 w-full",
                    card: "shadow-none border-0 w-full",
                    headerTitle: "text-slate-950",
                    headerSubtitle: "text-slate-500",
                    socialButtonsBlockButton: "rounded-xl border-slate-200",
                    formFieldInput: "rounded-xl border-slate-200 focus:border-slate-950 focus:ring-slate-950/10",
                    formButtonPrimary: "bg-slate-950 hover:bg-slate-800 text-white rounded-xl",
                    footerActionLink: "text-slate-950 font-semibold"
                  }
                }}
              />
            ) : (
              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-slate-950">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Clerk not configured</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Add <code className="rounded bg-white px-1.5 py-0.5">VITE_CLERK_PUBLISHABLE_KEY</code> to enable Google and email login.
                </p>
              </div>
            )}
            {authError ? <p className="mt-4 text-sm font-semibold text-rose-600">{authError}</p> : null}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
