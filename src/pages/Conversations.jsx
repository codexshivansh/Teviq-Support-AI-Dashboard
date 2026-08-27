import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Search, Send, X } from "lucide-react";
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

// Channel tabs — "all" maps to the existing unfiltered api.getConversations
// call, the other three map to api.getConversationsByChannel. Instagram
// isn't wired up on the backend yet (no data is ever tagged that channel),
// so its tab will honestly show an empty state rather than fake activity.
const channelTabs = [
  { id: "all", label: "All" },
  { id: "widget", label: "Website" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" }
];

const CHANNEL_LABELS = { widget: "Website", whatsapp: "WhatsApp", instagram: "Instagram" };
function channelLabel(channel) {
  return CHANNEL_LABELS[channel] || channel || "Unknown";
}

// Meta's real customer-service window is 24h; matches the backend's
// WHATSAPP_WINDOW_MS conservative 23h buffer in routes/whatsapp.routes.js
// so the dashboard's "window open/closed" indicator agrees with what the
// send endpoint will actually accept.
const WHATSAPP_WINDOW_MS = 23 * 60 * 60 * 1000;

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

// Same pill shape/pattern as StatusPill above — whatsapp gets the
// established "success" emerald tint (matches WidgetInstall.jsx's
// "connected" badge), widget/instagram share the neutral slate tone
// everything else in this file already uses for non-semantic labels
// (e.g. the intent pill a few lines below).
function ChannelBadge({ channel }) {
  const styles = {
    whatsapp: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[channel] || "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
      {channelLabel(channel)}
    </span>
  );
}

// Copied styling verbatim from KnowledgeBase.jsx's TabNavigation (same
// Card wrapper, same grid, same active/inactive classes) per the
// instruction to match the existing tab pattern exactly rather than invent
// a new one — only the icon column and tab list differ.
function ChannelTabs({ activeTab, onChange }) {
  return (
    <Card className="mb-5 p-1.5">
      <div className="grid gap-1 sm:grid-cols-4">
        {channelTabs.map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950" : "text-muted hover:bg-white/75 hover:text-ink dark:hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// null when not applicable (not a WhatsApp conversation). Uses the last
// *customer* message's timestamp, not overall conversation activity — an
// outbound-only manual send should never make a closed window look open.
function getWhatsAppWindowStatus(conversation) {
  if (!conversation || conversation.channel !== "whatsapp") return null;
  const lastCustomerMessage = [...(conversation.messages || [])].reverse().find((message) => message.role === "customer");
  if (!lastCustomerMessage?.timestamp) return { open: false };
  const elapsedMs = Date.now() - new Date(lastCustomerMessage.timestamp).getTime();
  return { open: elapsedMs < WHATSAPP_WINDOW_MS };
}

export function Conversations({ brandId, onBrandChange }) {
  const [status, setStatus] = useState("all");
  const [intent, setIntent] = useState("all");
  const [search, setSearch] = useState("");
  const [channelTab, setChannelTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [allConversations, setAllConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const fetchPromise =
      channelTab === "all" ? api.getConversations(brandId) : api.getConversationsByChannel(brandId, channelTab);
    fetchPromise
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
  }, [brandId, channelTab]);

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
  const whatsappWindow = useMemo(() => getWhatsAppWindowStatus(selected), [selected]);

  // Clear the reply box/error whenever the open conversation changes, so a
  // draft or a stale error from one customer never leaks into the next.
  useEffect(() => {
    setReplyText("");
    setSendError("");
  }, [selected?.id]);

  async function handleSendWhatsApp() {
    const textToSend = replyText.trim();
    if (!selected || !textToSend || sending) return;

    setSending(true);
    setSendError("");
    try {
      await api.sendWhatsAppMessage(brandId, selected.customerId, textToSend);
      const sentAt = new Date().toISOString();
      setReplyText("");
      setAllConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === selected.id
            ? {
                ...conversation,
                timestamp: sentAt,
                lastMessage: textToSend,
                messages: [...conversation.messages, { role: "assistant", text: textToSend, timestamp: sentAt }]
              }
            : conversation
        )
      );
    } catch (err) {
      setSendError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Conversations"
        description="Real customer chat history from the live widget, grouped into conversations (30-minute inactivity gap = new conversation)."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <ChannelTabs activeTab={channelTab} onChange={setChannelTab} />

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
        <div className="grid items-stretch gap-5 xl:h-[clamp(560px,calc(100dvh-300px),760px)] xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
          <Card className="h-[min(680px,calc(100dvh-180px))] min-h-[520px] overflow-hidden !p-0 xl:h-full xl:min-h-0">
            {conversations.length ? (
              <div
                className="teviq-scrollbar h-full divide-y divide-line/70 overflow-y-auto overscroll-contain"
                aria-label="Conversation list"
              >
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
                      <ChannelBadge channel={conversation.channel} />
                      <span>{formatTime(conversation.timestamp)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center p-5">
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

          <Card className="h-[min(680px,calc(100dvh-180px))] min-h-[520px] overflow-hidden !p-0 xl:h-full xl:min-h-0">
            {selected ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 p-5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{selected.customer}</p>
                      <div className="mt-1.5">
                        <ChannelBadge channel={selected.channel} />
                      </div>
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
                </div>

                <div
                  className="teviq-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain border-t border-line/60 px-5 pb-5 pt-4"
                  aria-label={`Conversation with ${selected.customer}`}
                >
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

                {selected.channel === "whatsapp" ? (
                  <div className="shrink-0 border-t border-line/60 p-4">
                    {whatsappWindow?.open ? (
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        Window open
                      </p>
                    ) : (
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                        Window closed — manual reply unavailable
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSendWhatsApp();
                          }
                        }}
                        disabled={!whatsappWindow?.open || sending}
                        placeholder="Type a WhatsApp reply..."
                        aria-label="WhatsApp reply message"
                        className="min-w-0 flex-1 rounded-2xl border border-line bg-white/75 px-3 py-2.5 text-sm text-ink outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5"
                      />
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        disabled={!whatsappWindow?.open || sending || !replyText.trim()}
                        aria-label="Send WhatsApp reply"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                    {sendError ? <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">{sendError}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex h-full items-center p-5">
                <EmptyState title="Select a conversation" description="Open a conversation from the list to inspect the transcript." />
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
