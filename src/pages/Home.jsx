import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  Clock3,
  Code2,
  Database,
  MessageSquare,
  Rocket,
  ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";
import { getBrand } from "../data/brands";

const setupCopy = {
  knowledge: {
    title: "Upload Knowledge",
    detail: "Add policies, FAQs and support docs so the AI answers with brand context.",
    page: "knowledge",
    icon: Database
  },
  shopify: {
    title: "Connect Shopify",
    detail: "Review the demo catalog and order sync layer for this workspace.",
    page: "shopify",
    icon: ShoppingBag
  },
  playground: {
    title: "Test AI in Playground",
    detail: "Ask order, return and product questions before showing the widget live.",
    page: "playground",
    icon: Bot
  },
  install: {
    title: "Install Widget",
    detail: "Copy the production script and share it with the storefront team.",
    page: "widget-install",
    icon: Code2
  },
  live: {
    title: "AI Live",
    detail: "Go live when knowledge, commerce data, testing and install are ready.",
    page: "widget-install",
    icon: Rocket
  }
};

function getLocalSetupFlags(brandId) {
  try {
    const raw = localStorage.getItem(`teviq:onboarding:${brandId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalSetupFlags(brandId, flags) {
  try {
    localStorage.setItem(`teviq:onboarding:${brandId}`, JSON.stringify(flags));
  } catch {
    // Demo-only setup progress should never block the dashboard.
  }
}

function SetupStepCard({ step, index, completed, onOpen, brandColor }) {
  const Icon = step.icon;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.04 }}
      className="group flex h-full flex-col rounded-3xl border border-line/80 bg-white/72 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-card focus:outline-none focus:ring-2 focus:ring-slate-950/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow-sm"
          style={{ background: completed ? "#059669" : brandColor }}
        >
          {completed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {completed ? "Done" : `Step ${index + 1}`}
        </span>
      </div>
      <div className="mt-4 flex-1">
        <p className="text-sm font-semibold text-ink">{step.title}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{step.detail}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{completed ? "Completed" : "Open setup"}</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

function EmptyMetricValue() {
  return <span className="text-xl text-slate-500">No data yet</span>;
}

function formatMs(ms) {
  if (ms === null || ms === undefined) return "n/a";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatPercent(rate) {
  return `${Math.round((rate || 0) * 100)}%`;
}

export function Home({ brandId, onBrandChange, onNavigate }) {
  const [knowledge, setKnowledge] = useState(null);
  const [shopify, setShopify] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [localSetup, setLocalSetup] = useState(() => getLocalSetupFlags(brandId));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.getKnowledgeDocuments(brandId), api.getShopifyStatus(brandId), api.getAnalytics(brandId)])
      .then(([knowledgeData, shopifyData, analyticsData]) => {
        if (!active) return;
        setKnowledge(knowledgeData);
        setShopify(shopifyData);
        setAnalytics(analyticsData);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [brandId]);

  useEffect(() => {
    setLocalSetup(getLocalSetupFlags(brandId));
  }, [brandId]);

  const brand = getBrand(brandId);
  const setupSteps = useMemo(() => {
    const hasKnowledge = (knowledge?.stats?.documentCount || 0) > 0;
    const hasShopify = shopify?.status === "connected";
    const hasPlayground = Boolean(localSetup.playground);
    const hasInstall = Boolean(localSetup.install);
    const isLive = hasKnowledge && hasShopify && hasPlayground && hasInstall;

    return [
      { id: "knowledge", completed: hasKnowledge, ...setupCopy.knowledge },
      { id: "shopify", completed: hasShopify, ...setupCopy.shopify },
      { id: "playground", completed: hasPlayground, ...setupCopy.playground },
      { id: "install", completed: hasInstall, ...setupCopy.install },
      { id: "live", completed: isLive, ...setupCopy.live }
    ];
  }, [knowledge, localSetup, shopify]);

  const completedSteps = setupSteps.filter((step) => step.completed).length;
  const progress = Math.round((completedSteps / setupSteps.length) * 100);

  function openSetupStep(step) {
    const nextSetup = { ...localSetup };
    if (step.id === "playground") nextSetup.playground = true;
    if (step.id === "install") nextSetup.install = true;
    if (step.id === "live" && completedSteps >= 4) nextSetup.live = true;
    setLocalSetup(nextSetup);
    saveLocalSetupFlags(brandId, nextSetup);
    onNavigate?.(step.page);
  }

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Launch your AI support workspace"
        description="A guided setup hub for getting brand knowledge, commerce data, AI testing and widget installation ready for launch."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      {loading ? <LoadingState label="Loading dashboard signals" /> : null}
      {error && !loading ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        (() => {
          const hasChats = Boolean(analytics?.totalConversations > 0);
          return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                icon={MessageSquare}
                label="Total chats"
                value={hasChats ? analytics.totalConversations : <EmptyMetricValue />}
                detail={hasChats ? "Last 30 days" : "Install widget to start seeing conversations"}
                tone="blue"
              />
              <MetricCard
                icon={Bot}
                label="Resolution rate"
                value={hasChats ? formatPercent(analytics.deflectionRate?.rate) : <EmptyMetricValue />}
                detail={hasChats ? "Handled without escalation" : "Install widget to start seeing conversations"}
                tone="green"
              />
              <MetricCard
                icon={AlertTriangle}
                label="Escalations"
                value={hasChats ? analytics.escalationRate?.escalatedCount ?? 0 : <EmptyMetricValue />}
                detail={hasChats ? `${formatPercent(analytics.escalationRate?.rate)} of messages` : "Install widget to start seeing conversations"}
                tone="amber"
              />
              <MetricCard icon={Database} label="Knowledge docs" value={knowledge?.stats?.documentCount || 0} detail={`${knowledge?.stats?.chunkCount || 0} indexed chunks`} />
              <MetricCard icon={ShoppingBag} label="Shopify status" value={shopify?.status === "connected" ? "Connected" : "Not ready"} detail={`${shopify?.productCount || 0} products synced`} tone="green" />
              <MetricCard
                icon={Clock3}
                label="Avg response time"
                value={hasChats && analytics.responseTimeStats?.sampleCount > 0 ? formatMs(analytics.responseTimeStats.medianMs) : <EmptyMetricValue />}
                detail={hasChats && analytics.responseTimeStats?.sampleCount > 0 ? `${analytics.responseTimeStats.sampleCount} samples (median)` : "Install widget to start seeing conversations"}
              />
            </div>
          );
        })()
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Setup Progress</p>
              <p className="mt-1 text-sm text-muted">
                Complete these steps to make {brand.name} ready for a client demo or first launch.
              </p>
            </div>
            <span className="w-fit rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">
              {completedSteps}/{setupSteps.length} complete
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {setupSteps.map((step, index) => (
              <SetupStepCard
                key={step.id}
                step={step}
                index={index}
                completed={step.completed}
                brandColor={brand.themeColor}
                onOpen={() => openSetupStep(step)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">First-time user flow</p>
              <p className="mt-1 text-xs text-muted">Current workspace: {brand.name}</p>
            </div>
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl text-white"
              style={{ background: brand.themeColor }}
            >
              <Rocket className="h-5 w-5" />
            </span>
          </div>
          <ol className="mt-5 space-y-4">
            {setupSteps.map((step, index) => (
              <li key={step.id} className="flex gap-3 text-sm text-slate-600">
                <span
                  className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-black ${
                    step.completed ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {step.completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span>
                  <span className="font-semibold text-ink">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => openSetupStep(setupSteps.find((step) => !step.completed) || setupSteps[4])}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/15"
          >
            Continue setup
            <ArrowRight className="h-4 w-4" />
          </button>
        </Card>
      </div>
    </>
  );
}
