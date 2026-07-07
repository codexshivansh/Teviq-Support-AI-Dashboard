import { AlertTriangle, BarChart3, Bot, CheckCircle2, MessageSquare, Timer } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";

function EmptyMetricValue() {
  return <span className="text-xl text-slate-500">No data yet</span>;
}

function EmptyAnalyticsPanel({ title, description, minHeight = "min-h-[320px]" }) {
  return (
    <Card className={minHeight}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/55 p-8 text-center">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <BarChart3 className="h-5 w-5" />
        </div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted">{description}</p>
      </div>
    </Card>
  );
}

export function AnalyticsPreview({ brandId, onBrandChange }) {
  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Support performance"
        description="Conversation analytics will appear here after the widget is installed and customers start using AI support."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={MessageSquare}
          label="Total conversations"
          value={<EmptyMetricValue />}
          detail="Install widget to start seeing conversations"
          tone="blue"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Deflection rate"
          value={<EmptyMetricValue />}
          detail="Install widget to start seeing conversations"
          tone="green"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Escalation rate"
          value={<EmptyMetricValue />}
          detail="Install widget to start seeing conversations"
          tone="amber"
        />
        <MetricCard
          icon={Timer}
          label="Median response"
          value={<EmptyMetricValue />}
          detail="Install widget to start seeing conversations"
        />
        <MetricCard
          icon={Bot}
          label="Failed answers"
          value={<EmptyMetricValue />}
          detail="Install widget to start seeing conversations"
          tone="rose"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <EmptyAnalyticsPanel
          title="Resolution trend"
          description="Chart will appear once conversations start coming in"
          minHeight="min-h-[360px]"
        />
        <EmptyAnalyticsPanel
          title="Top questions"
          description="No questions yet"
          minHeight="min-h-[360px]"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <EmptyAnalyticsPanel
          title="Top intents"
          description="Intent analytics will appear once customers start chatting with the widget."
          minHeight="min-h-[340px] xl:col-span-2"
        />
        <EmptyAnalyticsPanel
          title="Channel split"
          description="Channel data will appear once conversations start coming in."
          minHeight="min-h-[340px]"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <EmptyAnalyticsPanel
          title="Top unresolved questions"
          description="No questions yet"
        />
        <EmptyAnalyticsPanel
          title="Response time trend"
          description="Chart will appear once conversations start coming in"
        />
      </div>
    </>
  );
}
