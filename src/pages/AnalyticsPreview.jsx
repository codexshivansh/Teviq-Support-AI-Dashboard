import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { AlertTriangle, Bot, CheckCircle2 } from "lucide-react";
import { analyticsSeries, commonIntents, topQuestions } from "../data/analytics";

export function AnalyticsPreview({ brandId, onBrandChange }) {
  return (
    <>
      <PageHeader
        eyebrow="Analytics preview"
        title="Support performance"
        description="Demo analytics using static data for now. Production will connect to real chat logs, CSAT and resolution events."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={CheckCircle2} label="Resolution rate" value="91%" detail="7-day demo average" tone="green" />
        <MetricCard icon={AlertTriangle} label="Escalations" value="38" detail="Human handoffs" tone="amber" />
        <MetricCard icon={Bot} label="Failed answers" value="12" detail="Placeholder for review queue" tone="rose" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="min-h-[360px]">
          <p className="text-sm font-semibold text-ink">Resolution trend</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsSeries}>
                <defs>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="resolved" stroke="#0f172a" fill="url(#resolvedGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink">Top questions</p>
          <div className="mt-5 space-y-3">
            {topQuestions.map((question, index) => (
              <div key={question} className="flex items-center gap-3 rounded-2xl border border-line bg-white/65 p-3">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                  {index + 1}
                </span>
                <p className="text-sm font-medium text-slate-700">{question}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="min-h-[320px]">
          <p className="text-sm font-semibold text-ink">Common intents</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commonIntents}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink">Failed answers placeholder</p>
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-white/55 p-6">
            <p className="text-sm leading-6 text-muted">
              In production this becomes the learning queue: missed questions, weak retrieval matches, low-confidence answers and suggested FAQ additions.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
