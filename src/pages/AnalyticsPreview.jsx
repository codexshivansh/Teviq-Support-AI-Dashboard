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

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function trialDraft(trial) {
  return {
    enabled: trial?.enabled || false,
    startsAt: localDateTime(trial?.starts_at),
    endsAt: localDateTime(trial?.ends_at),
    maxCallsPerDay: trial?.max_calls_per_day || 10,
    maxTokensPerDay: trial?.max_tokens_per_day || 30000
  };
}

function AiTrialPanel({ brandId, isTeviqAdmin }) {
  const [usage, setUsage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setUsage(null);
    setDraft(null);
    setEditing(false);
    setError("");
    api.getAiTrialUsage(brandId).then((result) => {
      if (!active) return;
      setUsage(result);
      setDraft(trialDraft(result.trial));
    }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [brandId]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await api.saveAiTrialLimit(brandId, {
        enabled: draft.enabled,
        startsAt: new Date(draft.startsAt).toISOString(),
        endsAt: new Date(draft.endsAt).toISOString(),
        maxCallsPerDay: Number(draft.maxCallsPerDay),
        maxTokensPerDay: Number(draft.maxTokensPerDay)
      });
      setUsage(await api.getAiTrialUsage(brandId));
      setDraft(trialDraft(result.trial));
      setEditing(false);
    } catch (err) {
      setError(err.message || "Could not save trial limits.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">AI trial usage</h2>
          <p className="mt-1 text-sm text-muted">Website, WhatsApp and Instagram · resets at midnight India time · retries count as calls</p>
        </div>
        {usage?.meteringEnabled && isTeviqAdmin && !editing ? (
          <button type="button" onClick={() => setEditing(true)} className="rounded-xl border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink hover:bg-white dark:bg-white/5 dark:hover:bg-white/10">
            Configure trial
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p> : null}
      {!usage && !error ? <p className="mt-3 text-sm text-muted">Loading usage…</p> : null}
      {usage && !usage.meteringEnabled ? (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Setup pending. Usage tracking and client trial limits are not active yet.
        </p>
      ) : null}
      {usage ? (
        <>
          {usage.meteringEnabled ? <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <p className="rounded-2xl border border-line bg-white/70 p-4 text-sm text-muted dark:bg-white/5">AI calls today<br /><strong className="mt-1 block text-xl text-ink">{usage.calls}{usage.trial?.enabled ? ` / ${usage.trial.max_calls_per_day}` : ""}</strong></p>
            <p className="rounded-2xl border border-line bg-white/70 p-4 text-sm text-muted dark:bg-white/5">Tokens today<br /><strong className="mt-1 block text-xl text-ink">{usage.tokens.toLocaleString()}{usage.trial?.enabled ? ` / ${usage.trial.max_tokens_per_day.toLocaleString()}` : ""}</strong></p>
            <p className="rounded-2xl border border-line bg-white/70 p-4 text-sm text-muted dark:bg-white/5">Estimated Groq cost today<br /><strong className="mt-1 block text-xl text-ink">{usage.hasUnknownUsage ? "At least " : ""}${usage.estimatedUsd.toFixed(4)}</strong></p>
          </div> : null}
          {usage.meteringEnabled ? <p className="mt-2 text-xs text-muted">Pricing is an estimate; check the Groq invoice for actual billing. Unknown usage is reserved against the token cap.</p> : null}
          {usage.meteringEnabled && isTeviqAdmin && draft && editing ? (
            <form onSubmit={save} className="mt-5 grid gap-4 border-t border-line pt-5 md:grid-cols-2">
              <label className="text-sm font-medium text-ink">Trial starts (local time)<input required type="datetime-local" value={draft.startsAt} onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })} className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 dark:bg-white/5 dark:[color-scheme:dark]" /></label>
              <label className="text-sm font-medium text-ink">Trial ends (local time)<input required type="datetime-local" value={draft.endsAt} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 dark:bg-white/5 dark:[color-scheme:dark]" /></label>
              <label className="text-sm font-medium text-ink">Max AI calls per day<input required type="number" min="1" max="1000" value={draft.maxCallsPerDay} onChange={(event) => setDraft({ ...draft, maxCallsPerDay: event.target.value })} className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 dark:bg-white/5" /></label>
              <label className="text-sm font-medium text-ink">Max tokens per day<input required type="number" min="1" max="100000" value={draft.maxTokensPerDay} onChange={(event) => setDraft({ ...draft, maxTokensPerDay: event.target.value })} className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 dark:bg-white/5" /></label>
              <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} /> Activate this client trial</label>
              <p className="text-xs text-muted md:col-span-2">Editing this form uses no AI tokens. Saving will update settings only; it will not call Groq.</p>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">{saving ? "Saving…" : "Save trial settings"}</button>
                <button type="button" disabled={saving} onClick={() => { setDraft(trialDraft(usage.trial)); setError(""); setEditing(false); }} className="rounded-xl border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50 dark:bg-white/5">Discard changes</button>
              </div>
            </form>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

export function AnalyticsPreview({ brandId, onBrandChange, isTeviqAdmin }) {
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

  useEffect(() => {
    let active = true;

    function refreshAnalytics() {
      api
        .getAnalytics(brandId)
        .then((result) => {
          if (active) setData(result);
        })
        .catch(() => {
          // Preserve the last successful analytics snapshot when a background
          // refresh fails; initial-load errors are handled above.
        });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") refreshAnalytics();
    }

    window.addEventListener("focus", refreshAnalytics);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshAnalytics);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

      <AiTrialPanel brandId={brandId} isTeviqAdmin={isTeviqAdmin} />

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
              detail={hasData ? `${data.escalationRate.escalatedCount} of ${data.escalationRate.totalConversations} conversations` : "Install widget to start seeing conversations"}
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
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/55 p-8 text-center dark:bg-white/5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
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
