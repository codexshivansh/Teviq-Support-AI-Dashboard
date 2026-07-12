import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

// "resolved" deliberately isn't a filter option here — chat_logs has no
// explicit resolution signal (see backend/services/conversations.service.js
// and chatAnalytics.service.js's getEscalationTrend comment), so a
// conversation is only ever real "open" or "escalated", never a fabricated
// "resolved".
const statuses = ["all", "open", "escalated"];
const intents = ["all", "order_tracking", "return_exchange", "payment_cod", "product_recommendation", "human_support", "complaint"];

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function StatusPill({ status }) {
  const styles = {
    open: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    escalated: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] || "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
      {status}
    </span>
  );
}

export function Conversations({ brandId, onBrandChange }) {
  const [status, setStatus] = useState("all");
  const [intent, setIntent] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [allConversations, setAllConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .getConversations(brandId)
      .then((result) => {
        if (active) setAllConversations(result?.conversations || []);
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

  const conversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allConversations
      .filter((conversation) => status === "all" || conversation.status === status)
      .filter((conversation) => intent === "all" || conversation.intent === intent)
      .filter((conversation) => {
        if (!query) return true;
        return [conversation.customer, conversation.customerId, conversation.lastMessage, conversation.intent]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [allConversations, status, intent, search]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) || conversations[0] || null;

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Conversations"
        description="Real customer chat history from the live widget, grouped into conversations (30-minute inactivity gap = new conversation)."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/75 px-3 py-2.5 dark:bg-white/5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, message or intent"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
            />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-line bg-white/75 px-3 py-2.5 text-sm font-semibold text-ink outline-none dark:bg-white/5">
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={intent} onChange={(event) => setIntent(event.target.value)} className="rounded-2xl border border-line bg-white/75 px-3 py-2.5 text-sm font-semibold text-ink outline-none dark:bg-white/5">
            {intents.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <LoadingState label="Loading conversations" /> : null}
      {error && !loading ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
          <Card className="overflow-hidden p-0">
            {conversations.length ? (
              <div className="divide-y divide-line/70">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={`block w-full p-4 text-left transition hover:bg-white/75 dark:hover:bg-white/5 ${
                      selected?.id === conversation.id ? "bg-white/85 dark:bg-white/10" : "bg-white/35 dark:bg-transparent"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{conversation.customer}</p>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">{conversation.lastMessage}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {conversation.intent}
                        </span>
                        <StatusPill status={conversation.status} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {conversation.channel} · {formatTime(conversation.timestamp)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  title={allConversations.length ? "No conversations match" : "No conversations yet"}
                  description={
                    allConversations.length
                      ? "Try another status, intent or search term."
                      : "Conversations will appear here once customers start chatting with the installed widget."
                  }
                />
              </div>
            )}
          </Card>

          <Card className="min-h-[520px]">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{selected.customer}</p>
                    <p className="mt-1 text-xs text-muted">{selected.channel}</p>
                  </div>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-2xl border border-line bg-white text-slate-500 dark:bg-white/5 dark:text-slate-300"
                    onClick={() => setSelectedId(null)}
                    aria-label="Clear selected conversation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill status={selected.status} />
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{selected.intent}</span>
                </div>

                <div className="mt-6 space-y-3">
                  {selected.messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-3xl p-4 text-sm leading-6 ${
                        message.role === "customer"
                          ? "ml-8 bg-slate-950 text-white dark:bg-slate-800"
                          : "mr-8 border border-line bg-white/75 text-slate-700 dark:bg-white/5 dark:text-slate-300"
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="Select a conversation" description="Open a conversation from the list to inspect the transcript." />
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
