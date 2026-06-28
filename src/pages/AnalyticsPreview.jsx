import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { AlertTriangle, Bot, CheckCircle2, MessageSquare, Timer } from "lucide-react";
import {
  analyticsSeries,
  channelSplit,
  commonIntents,
  responseTimeTrend,
  topQuestions,
  unresolvedQuestions
} from "../data/analytics";

const channelColors = ["#0f172a", "#14b8a6"];

export function AnalyticsPreview({ brandId, onBrandChange }) {
  return (
    <>
      <PageHeader
        eyebrow="Analytics preview"
        title="Support performance"
        description="Demo analytics shaped like the production reporting layer: deflection, escalations, response time and missed-answer review."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={MessageSquare} label="Total conversations" value="1,248" detail="Demo period" tone="blue" />
        <MetricCard icon={CheckCircle2} label="Deflection rate" value="74%" detail="Resolved without human" tone="green" />
        <MetricCard icon={AlertTriangle} label="Escalation rate" value="8.4%" detail="Human handoffs" tone="amber" />
        <MetricCard icon={Timer} label="Median response" value="1.8s" detail="Widget + AI response" />
        <MetricCard icon={Bot} label="Failed answers" value="12" detail="Review queue preview" tone="rose" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="min-h-[360px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Resolution trend</p>
              <p className="mt-1 text-xs text-muted">Resolved conversations vs escalations</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Healthy</span>
          </div>
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
                <Area type="monotone" dataKey="escalated" stroke="#f43f5e" fill="#ffe4e6" strokeWidth={2} />
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

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="min-h-[340px] xl:col-span-2">
          <p className="text-sm font-semibold text-ink">Top intents</p>
          <div className="mt-5 h-72">
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
          <p className="text-sm font-semibold text-ink">Channel split</p>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={4}>
                  {channelSplit.map((entry, index) => (
                    <Cell key={entry.name} fill={channelColors[index % channelColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {channelSplit.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: channelColors[index] }} />
                  {item.name}
                </span>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <p className="text-sm font-semibold text-ink">Top unresolved questions</p>
          <div className="mt-5 space-y-3">
            {unresolvedQuestions.map((question) => (
              <div key={question} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-sm font-medium text-amber-800">
                {question}
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-[320px]">
          <p className="text-sm font-semibold text-ink">Response time trend</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeTrend}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="seconds" stroke="#14b8a6" fill="#ccfbf1" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
