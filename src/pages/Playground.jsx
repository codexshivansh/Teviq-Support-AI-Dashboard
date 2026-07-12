import { useState } from "react";
import { Bot, Send, UserRound } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ErrorState } from "../components/States";
import { api } from "../services/api";

const examples = [
  "Track order UG-SH-7001",
  "Suggest earbuds for calls",
  "Do you support COD?",
  "Can I return my order?"
];

export function Playground({ brandId, onBrandChange }) {
  const [message, setMessage] = useState("Suggest earbuds for calls");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(nextMessage = message) {
    const clean = nextMessage.trim();
    if (!clean) return;

    setMessage(clean);
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const data = await api.chat({
        brandId,
        message: clean,
        customerId: `dashboard_${brandId}`
      });
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="AI test lab"
        title="AI Playground"
        description="Test customer questions against the live Support Brain using the selected demo brand."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <label className="text-sm font-semibold text-ink">Customer question</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            className="mt-3 w-full resize-none rounded-3xl border border-line bg-white/80 p-4 text-sm leading-6 text-ink outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
            placeholder="Ask about orders, returns, shipping, products..."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => submit(example)}
                disabled={loading}
                className="rounded-full border border-line bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-ink focus:outline-none focus:ring-4 focus:ring-slate-950/10 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>

          <Button className="mt-5 w-full" onClick={() => submit()} disabled={loading || !message.trim()}>
            <Send className="h-4 w-4" />
            {loading ? "Thinking" : "Send to Support Brain"}
          </Button>
        </Card>

        <Card className="min-h-[420px]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">AI response</p>
              <p className="text-xs text-muted">Live response from `/api/chat`</p>
            </div>
          </div>

          {error ? <div className="mt-5"><ErrorState message={error} /></div> : null}

          {!response && !error ? (
            <div className="mt-8 rounded-3xl border border-dashed border-line bg-white/55 p-8 text-center dark:bg-white/5">
              <UserRound className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-4 text-sm font-semibold text-ink">No response yet</p>
              <p className="mt-1 text-sm text-muted">Send a test message to preview the brand support answer.</p>
            </div>
          ) : null}

          {response ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-card">
                <p className="whitespace-pre-wrap text-sm leading-6">{response.reply}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Intent", response.intent],
                  ["Source", response.source],
                  ["Language", response.language],
                  ["Sentiment", response.sentiment],
                  ["Escalated", response.escalated ? "Yes" : "No"],
                  ["Warnings", response.warnings?.length ? response.warnings.join(", ") : "None"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-line bg-white/70 p-3 dark:bg-white/5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{value || "Not available"}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted">Knowledge confidence is internal today; it appears in backend logs/retrieval debug when available.</p>
            </div>
          ) : null}
        </Card>
      </div>
    </>
  );
}
