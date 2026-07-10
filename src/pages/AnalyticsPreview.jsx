import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  MessageSquare,
  Radio,
  Timer
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import { api } from "../services/api";

function EmptyMetricValue() {
  return <span className="text-xl text-slate-500">No data yet</span>;
}

// Shared shell for every chart/list panel below — title in a Card, content
// (real chart/list, or a reused EmptyState) passed in as children. Replaces
// the old EmptyAnalyticsPanel, which baked the empty state directly into
// the panel instead of letting the panel show real content once available.
function AnalyticsPanel({ title, minHeight = "min-h-[320px]", children }) {
  return (
    <Card className={minHeight}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function formatPercent(rate) {
  return `${Math.round((rate || 0) * 100)}%`;
}

function formatMs(ms) {
  if (ms === null || ms === undefined) return "n/a";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function shortDate(isoDate) {
  const [, month, day] = isoDate.split("-");
  return `${month}/${day}`;
}

function RankedList({ items, labelKey, emptyDescription }) {
  if (!items.length) {
    return <EmptyState title="No questions yet" description={emptyDescription} />;
  }

  const maxCount = Math.max(...items.map((item) => item.count));

  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item[labelKey]}-${index}`} className="flex items-center gap-3">
          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink" title={item[labelKey]}>
              {item[labelKey]}
            </p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${Math.max(6, (item.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
          <span className="flex-none text-xs font-bold text-muted">{item.count}</span>
        </li>
      ))}
    </ol>
  );
}

export function AnalyticsPreview({ brandId, onBrandChange }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .getAnalytics(brandId)
      .then((result) => {
        if (active) setData(result);
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

  const hasData = Boolean(data?.totalConversations > 0);

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Support performance"
        description="Conversation analytics will appear here after the widget is installed and customers start using AI support."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      {loading ? <LoadingState label="Loading analytics" /> : null}
      {error && !loading ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={MessageSquare}
              label="Total conversations"
              value={hasData ? data.totalConversations : <EmptyMetricValue />}
              detail={hasData ? "Last 30 days" : "Install widget to start seeing conversations"}
              tone="blue"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Deflection rate"
              value={hasData ? formatPercent(data.deflectionRate.rate) : <EmptyMetricValue />}
              detail={hasData ? "Conversations without escalation" : "Install widget to start seeing conversations"}
              tone="green"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Escalation rate"
              value={hasData ? formatPercent(data.escalationRate.rate) : <EmptyMetricValue />}
              detail={hasData ? `${data.escalationRate.escalatedCount} of ${data.escalationRate.totalMessages} messages` : "Install widget to start seeing conversations"}
              tone="amber"
            />
            <MetricCard
              icon={Timer}
              label="Median response"
              value={hasData ? formatMs(data.responseTimeStats.medianMs) : <EmptyMetricValue />}
              detail={hasData ? `${data.responseTimeStats.sampleCount} samples` : "Install widget to start seeing conversations"}
            />
            <MetricCard
              icon={Bot}
              label="Failed answers"
              value={hasData ? data.failedAnswersCount : <EmptyMetricValue />}
              detail={hasData ? "Low-confidence or unresolved replies" : "Install widget to start seeing conversations"}
              tone="rose"
            />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <AnalyticsPanel title="Escalation trend" minHeight="min-h-[360px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.escalationTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={shortDate} />
                    <Bar dataKey="nonEscalatedCount" name="Handled" stackId="a" fill="#0f172a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="escalatedCount" name="Escalated" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No trend yet" description="Chart will appear once conversations start coming in" />
              )}
            </AnalyticsPanel>
            <AnalyticsPanel title="Top questions" minHeight="min-h-[360px]">
              {hasData ? (
                <RankedList
                  items={data.topQuestions}
                  labelKey="question"
                  emptyDescription="No questions yet"
                />
              ) : (
                <EmptyState title="No questions yet" />
              )}
            </AnalyticsPanel>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <AnalyticsPanel title="Top intents" minHeight="min-h-[340px] xl:col-span-2">
              {hasData && data.topIntents.length ? (
                <RankedList items={data.topIntents} labelKey="intent" />
              ) : (
                <EmptyState
                  title="No intents yet"
                  description="Intent analytics will appear once customers start chatting with the widget."
                />
              )}
            </AnalyticsPanel>
            <AnalyticsPanel title="Channel split" minHeight="min-h-[340px]">
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/55 p-8 text-center">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <Radio className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-ink">Not available yet</p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
                  Every conversation today comes through the website widget. Channel split will show real data once
                  WhatsApp (or another channel) launches alongside it.
                </p>
              </div>
            </AnalyticsPanel>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <AnalyticsPanel title="Top unresolved questions">
              {hasData ? (
                <RankedList
                  items={data.topUnresolvedQuestions}
                  labelKey="question"
                  emptyDescription="No unresolved questions yet"
                />
              ) : (
                <EmptyState title="No questions yet" />
              )}
            </AnalyticsPanel>
            <AnalyticsPanel title="Response time trend">
              {hasData && data.responseTimeStats.sampleCount > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.responseTimeStats.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => formatMs(value)} />
                    <Tooltip labelFormatter={shortDate} formatter={(value) => formatMs(value)} />
                    <Line
                      type="monotone"
                      dataKey="averageMs"
                      name="Avg response"
                      stroke="#0f172a"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#0f172a", strokeWidth: 0 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No trend yet" description="Chart will appear once conversations start coming in" />
              )}
            </AnalyticsPanel>
          </div>
        </>
      ) : null}
    </>
  );
}
