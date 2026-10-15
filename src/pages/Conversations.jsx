import { useEffect, useMemo, useState } from "react";
import { Bot, ChevronDown, Globe2, Inbox, Instagram, Loader2, MessageCircle, Search, Send, UserRound, X } from "lucide-react";
import { Card } from "../components/Card";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";
import { formatPhone, getInitials } from "../lib/formatPhone";

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
  { id: "all", label: "All", icon: Inbox },
  { id: "widget", label: "Website", icon: Globe2 },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "instagram", label: "Instagram", icon: Instagram }
];

const CHANNEL_LABELS = { widget: "Website", whatsapp: "WhatsApp", instagram: "Instagram" };
function channelLabel(channel) {
  return CHANNEL_LABELS[channel] || channel || "Unknown";
}

function intentLabel(intent) {
  return (intent || "Unknown").replace(/_/g, " ");
}

function customerLabel(conversation) {
  return formatPhone(conversation.customer || conversation.customerId);
}

function customerInitials(conversation) {
  const customer = conversation.customer || "";
  const isPhoneNumber = /^91\d{10}$/.test(customer.replace(/\D/g, ""));
  return getInitials(isPhoneNumber ? "" : customer, conversation.customerId);
}

function messageSender(message) {
  if (!message) return null;
  if (message?.role === "customer") return "customer";
  return message?.source === "human_agent" ? "human_agent" : "teviq_brain";
}

// Meta's real customer-service window is 24h; matches the backend's
// WHATSAPP_WINDOW_MS conservative 23h buffer in routes/whatsapp.routes.js
// so the dashboard's "window open/closed" indicator agrees with what the
// send endpoint will actually accept.
const WHATSAPP_WINDOW_MS = 23 * 60 * 60 * 1000;

function formatMessageTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatConversationTime(value) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return formatMessageTime(value);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === today.getFullYear() ? {} : { year: "numeric" })
  }).format(date);
}

function getMessageDayKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatMessageDay(value) {
  const date = new Date(value);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round((startOfToday - startOfMessageDay) / (24 * 60 * 60 * 1000));

  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getMessageGroupPosition(messages, index) {
  const sender = messageSender(messages[index]);
  const day = getMessageDayKey(messages[index]?.timestamp);
  return {
    isFirstInGroup: messageSender(messages[index - 1]) !== sender || getMessageDayKey(messages[index - 1]?.timestamp) !== day,
    isLastInGroup: messageSender(messages[index + 1]) !== sender || getMessageDayKey(messages[index + 1]?.timestamp) !== day
  };
}

function StatusPill({ status }) {
  const styles = {
    open: "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    escalated: "bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20"
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${styles[status] || "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

function ChannelBadge({ channel }) {
  const Icon = channelTabs.find((item) => item.id === channel)?.icon || MessageCircle;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {channelLabel(channel)}
    </span>
  );
}

function ChannelTabs({ activeTab, onChange }) {
  return (
    <div className="teviq-scrollbar mb-5 flex w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5 sm:w-fit">
      {channelTabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              active ? "bg-white text-slate-950 shadow-[0_1px_4px_rgba(15,23,42,0.12)] dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// The send endpoint checks the customer's latest inbound message across
// sessions, so the dashboard must do the same. Outbound replies cannot
// reopen the WhatsApp customer-service window.
function getWhatsAppWindowStatus(conversation, conversations, now) {
  if (!conversation || conversation.channel !== "whatsapp") return null;
  const lastCustomerMessageAt = conversations
    .filter((item) => item.channel === "whatsapp" && item.customerId === conversation.customerId)
    .flatMap((item) => item.messages || [])
    .filter((message) => message.role === "customer" && message.timestamp)
    .reduce((latest, message) => {
      const timestamp = new Date(message.timestamp).getTime();
      return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest;
    }, 0);
  if (!lastCustomerMessageAt) return { open: false };
  const elapsedMs = now - lastCustomerMessageAt;
  return { open: elapsedMs < WHATSAPP_WINDOW_MS };
}

export function Conversations({ brandId, onBrandChange }) {
  const [status, setStatus] = useState("all");
  const [intent, setIntent] = useState("all");
  const [search, setSearch] = useState("");
  const [channelTab, setChannelTab] = useState("all");
  const [selectedId, setSelectedId] = useState(undefined);
  const [allConversations, setAllConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  const selected = selectedId === null ? null : conversations.find((conversation) => conversation.id === selectedId) || conversations[0] || null;
  const whatsappWindow = useMemo(() => getWhatsAppWindowStatus(selected, allConversations, now), [selected, allConversations, now]);

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
                messages: [...conversation.messages, { role: "assistant", text: textToSend, timestamp: sentAt, source: "human_agent" }]
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
    <div className="xl:flex xl:h-full xl:min-h-0 xl:flex-col">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Customer support</p>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[32px]">Conversations</h1>
            <p className="mt-1 text-sm text-muted">A clear view of every customer conversation.</p>
        </div>
        <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          {allConversations.length} {allConversations.length === 1 ? "conversation" : "conversations"}
        </span>
      </div>

      <ChannelTabs activeTab={channelTab} onChange={setChannelTab} />

      {loading ? <LoadingState label="Loading conversations" /> : null}
      {error && !loading ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <div className="grid items-stretch gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(320px,0.42fr)_minmax(0,1fr)]">
          <Card className="flex h-[min(680px,calc(100dvh-180px))] min-h-[500px] flex-col overflow-hidden !rounded-[26px] !border-slate-200/80 !bg-white/90 !p-0 !shadow-[0_10px_40px_rgba(15,23,42,0.06)] dark:!border-white/10 dark:!bg-slate-900/90 xl:h-full xl:min-h-0">
            <div className="shrink-0 border-b border-slate-200/70 px-4 pb-3 pt-4 dark:border-white/10 sm:px-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-ink">Inbox</h2>
                  <p className="text-xs text-muted">{conversations.length} in this view</p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                  <Inbox className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-indigo-400/40">
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations"
                  aria-label="Search conversations"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="mt-2.5 flex gap-2">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Filter by status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-7 text-xs font-medium capitalize text-slate-600 outline-none focus:border-indigo-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                    {statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                </label>
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Filter by intent</span>
                  <select value={intent} onChange={(event) => setIntent(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-7 text-xs font-medium text-slate-600 outline-none focus:border-indigo-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                    {intents.map((item) => <option key={item} value={item}>{item === "all" ? "All intents" : intentLabel(item)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                </label>
              </div>
            </div>
            {conversations.length ? (
              <div
                className="teviq-scrollbar min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain dark:divide-white/5"
                aria-label="Conversation list"
              >
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    aria-current={selected?.id === conversation.id ? "true" : undefined}
                    className={`block w-full border-l-[3px] px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-5 ${
                      selected?.id === conversation.id ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-400/10" : "border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-bold ${selected?.id === conversation.id ? "bg-indigo-600 text-white shadow-[0_3px_8px_rgba(79,70,229,0.25)]" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"}`}>
                        {customerInitials(conversation)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{customerLabel(conversation)}</p>
                          {conversation.timestamp ? <time className="shrink-0 text-[10px] font-medium text-slate-400" dateTime={conversation.timestamp}>{formatConversationTime(conversation.timestamp)}</time> : null}
                        </div>
                        <p className="mt-0.5 truncate text-xs leading-5 text-slate-500 dark:text-slate-400">{conversation.lastMessage || "No messages yet"}</p>
                        <div className="mt-2 flex min-w-0 items-center gap-2.5">
                          <ChannelBadge channel={conversation.channel} />
                          <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                          <span className="truncate text-[11px] font-medium capitalize text-slate-400 dark:text-slate-500">{intentLabel(conversation.intent)}</span>
                          {conversation.status === "escalated" ? <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-rose-500" title="Escalated" aria-label="Escalated" /> : null}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center p-5">
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

          <Card className="h-[min(680px,calc(100dvh-180px))] min-h-[500px] overflow-hidden !rounded-[26px] !border-slate-200/80 !bg-white/90 !p-0 !shadow-[0_10px_40px_rgba(15,23,42,0.06)] dark:!border-white/10 dark:!bg-slate-900/90 xl:h-full xl:min-h-0">
            {selected ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 border-b border-slate-200/70 bg-white/60 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.02] sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-xs font-bold text-white shadow-[0_3px_8px_rgba(79,70,229,0.25)]">
                        {customerInitials(selected)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold tracking-tight text-ink">{customerLabel(selected)}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <ChannelBadge channel={selected.channel} />
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                          <span>{selected.messages.length} {selected.messages.length === 1 ? "message" : "messages"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {selected.channel === "whatsapp" ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${whatsappWindow?.open ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20" : "bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          Window {whatsappWindow?.open ? "open" : "closed"}
                        </span>
                      ) : <StatusPill status={selected.status} />}
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-white/10 dark:hover:text-white"
                        onClick={() => setSelectedId(null)}
                        aria-label="Close selected conversation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-500 dark:bg-white/10 dark:text-slate-400">{intentLabel(selected.intent)}</span>
                    {selected.channel === "whatsapp" && selected.status === "escalated" ? <StatusPill status="escalated" /> : null}
                    {selected.customerId && customerLabel(selected) !== formatPhone(selected.customerId) ? <span className="truncate text-[11px] text-slate-400">{formatPhone(selected.customerId)}</span> : null}
                  </div>
                </div>

                <div
                  className="teviq-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/70 px-4 pb-6 pt-5 dark:bg-slate-950/45 sm:px-6"
                  aria-label={`Conversation with ${customerLabel(selected)}`}
                >
                  {selected.messages.map((message, index) => {
                    const messageDay = getMessageDayKey(message.timestamp);
                    const previousMessageDay = getMessageDayKey(selected.messages[index - 1]?.timestamp);
                    const showDateSeparator = Boolean(messageDay && messageDay !== previousMessageDay);
                    const { isFirstInGroup, isLastInGroup } = getMessageGroupPosition(selected.messages, index);
                    const isCustomerMessage = message.role === "customer";
                    const messageSpacing = index === 0 ? "" : showDateSeparator || isFirstInGroup ? "mt-3" : "mt-0.5";
                    const bubbleCornerClasses = isCustomerMessage
                      ? isLastInGroup
                        ? "rounded-bl-sm"
                        : isFirstInGroup
                          ? "rounded-bl-lg"
                          : "rounded-tl-lg rounded-bl-lg"
                      : isLastInGroup
                        ? "rounded-br-sm"
                        : isFirstInGroup
                          ? "rounded-br-lg"
                          : "rounded-tr-lg rounded-br-lg";

                    return (
                      <div key={`${message.role}-${index}`} className={messageSpacing}>
                        {showDateSeparator ? (
                          <p className="mx-auto mb-4 w-fit rounded-full border border-slate-200/70 bg-white/85 px-3 py-1 text-[11px] font-medium text-slate-400 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-400">
                            {formatMessageDay(message.timestamp)}
                          </p>
                        ) : null}
                        <div
                          className={`w-fit max-w-[82%] rounded-[20px] px-3.5 py-2.5 text-[13px] leading-[1.55] shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:max-w-[76%] ${bubbleCornerClasses} ${
                            isCustomerMessage
                              ? "mr-auto border border-slate-200/80 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                              : "ml-auto bg-indigo-600 text-white shadow-[0_2px_7px_rgba(79,70,229,0.15)]"
                          }`}
                        >
                          <p className="flow-root whitespace-pre-wrap break-words">
                            {message.text}
                            {message.timestamp ? (
                              <span className={`float-right ml-2 mt-1 select-none whitespace-nowrap text-[10px] leading-4 opacity-70 ${isCustomerMessage ? "text-slate-400" : "text-indigo-100"}`} title={!isCustomerMessage ? message.source === "human_agent" ? "Human reply" : "Teviq Brain reply" : undefined}>
                                {!isCustomerMessage ? message.source === "human_agent" ? <UserRound className="mr-1 inline-block h-3 w-3 align-[-2px]" aria-label="Human reply" /> : <Bot className="mr-1 inline-block h-3 w-3 align-[-2px]" aria-label="Teviq Brain reply" /> : null}
                                {formatMessageTime(message.timestamp)}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selected.channel === "whatsapp" ? (
                  <div className="shrink-0 border-t border-slate-200/70 bg-white/80 px-4 pb-4 pt-3 dark:border-white/10 dark:bg-slate-900/90 sm:px-5">
                    {whatsappWindow?.open ? (
                      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        Reply window open
                      </p>
                    ) : (
                      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                        Window closed — manual reply unavailable
                      </p>
                    )}
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 pl-3.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-indigo-400/40">
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
                        className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-ink outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        disabled={!whatsappWindow?.open || sending || !replyText.trim()}
                        aria-label="Send WhatsApp reply"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-[0_2px_6px_rgba(79,70,229,0.2)] transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
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
    </div>
  );
}
