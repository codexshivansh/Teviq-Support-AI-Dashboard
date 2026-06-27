import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bot, Clock3, Database, MessageSquare, ShoppingBag } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";
import { analyticsSeries } from "../data/analytics";

export function Home({ brandId, onBrandChange }) {
  const [knowledge, setKnowledge] = useState(null);
  const [shopify, setShopify] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.getKnowledgeDocuments(brandId), api.getShopifyStatus(brandId)])
      .then(([knowledgeData, shopifyData]) => {
        if (!active) return;
        setKnowledge(knowledgeData);
        setShopify(shopifyData);
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

  const totals = useMemo(() => {
    const resolvedAverage = Math.round(
      analyticsSeries.reduce((sum, item) => sum + item.resolved, 0) / analyticsSeries.length
    );
    const escalationTotal = analyticsSeries.reduce((sum, item) => sum + item.escalated, 0);

    return {
      totalChats: 1248,
      resolutionRate: `${resolvedAverage}%`,
      escalations: escalationTotal,
      avgResponse: "1.8s"
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Support intelligence dashboard"
        description="A demo control room for support automation, knowledge, Shopify-style catalog data and AI testing."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      {loading ? <LoadingState label="Loading dashboard signals" /> : null}
      {error && !loading ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard icon={MessageSquare} label="Total chats" value={totals.totalChats.toLocaleString()} detail="+18% vs last week" tone="blue" />
          <MetricCard icon={Bot} label="Resolution rate" value={totals.resolutionRate} detail="Demo analytics preview" tone="green" />
          <MetricCard icon={AlertTriangle} label="Escalations" value={totals.escalations} detail="Human handoffs this week" tone="amber" />
          <MetricCard icon={Database} label="Knowledge docs" value={knowledge?.stats?.documentCount || 0} detail={`${knowledge?.stats?.chunkCount || 0} indexed chunks`} />
          <MetricCard icon={ShoppingBag} label="Shopify status" value={shopify?.status === "connected" ? "Connected" : "Not ready"} detail={`${shopify?.productCount || 0} products synced`} tone="green" />
          <MetricCard icon={Clock3} label="Avg response time" value={totals.avgResponse} detail="Widget response latency preview" />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Demo readiness</p>
              <p className="mt-1 text-sm text-muted">What a brand owner can test today.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live demo</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Knowledge uploads", "AI playground", "Shopify catalog"].map((item) => (
              <div key={item} className="rounded-2xl border border-line bg-white/70 p-4">
                <p className="text-sm font-semibold text-ink">{item}</p>
                <p className="mt-2 text-xs leading-5 text-muted">Ready for client walkthroughs.</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink">Next recommended demo flow</p>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><span className="font-semibold text-ink">1.</span> Upload a policy document in Knowledge Base.</li>
            <li className="flex gap-3"><span className="font-semibold text-ink">2.</span> Ask the AI Playground a product or policy question.</li>
            <li className="flex gap-3"><span className="font-semibold text-ink">3.</span> Show Shopify products and simulated sync status.</li>
          </ol>
        </Card>
      </div>
    </>
  );
}
