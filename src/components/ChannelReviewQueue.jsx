import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Button } from './Button';

export function ChannelReviewQueue({ brandId, isTeviqAdmin }) {
  const [queue, setQueue] = useState({ items: [], nextCursor: null });
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [revision, setRevision] = useState(0);
  const [manualReply, setManualReply] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let alive = true;
    let loading = false;
    async function refresh() {
      if (loading || document.hidden) return;
      loading = true;
      try {
        const data = await api.getChannelReviewQueue(brandId, cursor);
        if (alive) { setQueue(data); setError(''); }
      } catch (err) { if (alive) setError(err.message || 'Could not load delivery review.'); }
      finally { loading = false; }
    }
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => { alive = false; clearInterval(timer); };
  }, [brandId, cursor, revision]);

  async function act(action) {
    if (!selected || busy) return;
    const confirmation = action === 'retry_reply'
      ? 'Send the saved reply again? Only continue if you checked the provider records and confirmed it was not delivered.'
      : 'Mark this event handled? This sends no message and allows later queued messages in this conversation to continue.';
    if (!window.confirm(confirmation)) return;
    setBusy(true);
    try {
      await api.reviewChannelMessage(brandId, selected.id, { action, reason, confirmedNotDelivered: confirmed });
      setSelected(null); setReason(''); setConfirmed(false); setRevision(value => value + 1);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function sendManualReply() {
    if (!selected || !manualReply.trim() || busy) return;
    setBusy(true); setError('');
    try {
      if (selected.channel === 'whatsapp') await api.sendWhatsAppMessage(brandId, selected.customer_id, manualReply.trim());
      else await api.sendInstagramMessage(brandId, selected.customer_id, manualReply.trim());
      setSent(true); setManualReply('');
    } catch (err) { setError(`${err.message} Check the provider conversation before retrying if delivery is uncertain.`); }
    finally { setBusy(false); }
  }

  return <details className="mb-5 shrink-0 rounded-2xl border border-line bg-white/70 p-4 text-ink dark:bg-white/5">
    <summary className="cursor-pointer text-sm font-semibold">Delivery review {queue.items.length ? `(${queue.items.length}${queue.nextCursor ? '+' : ''})` : ''}{error ? ' — unavailable' : ''}</summary>
    <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
      <p className="text-xs text-muted">These messages need a person to check the outcome. Later messages in the same conversation wait here. Reviewing this panel does not use AI tokens.</p>
      {error ? <p role="alert" className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      {!queue.items.length && !error ? <p className="text-sm text-muted">No messages awaiting delivery review on this page.</p> : null}
      {queue.items.map(item => <div key={item.id} className="rounded-xl border border-line p-3">
        <p className="text-xs text-muted">{item.channel} · {item.customer_id}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{item.message}</p>
        <Button className="mt-2" disabled={busy} onClick={() => { setSelected(item); setReason(''); setConfirmed(false); setManualReply(''); setSent(false); }}>Review</Button>
      </div>)}
      {selected ? <div className="space-y-3 rounded-xl border border-line p-3">
        <p className="text-sm font-semibold">Review message {selected.id}</p>
        {selected.reply ? <p className="whitespace-pre-wrap break-words text-sm">Saved reply: {selected.reply}</p> : <p className="text-sm text-muted">No saved reply. Check the conversation and any business actions before handling it manually.</p>}
        <label className="block text-sm">Manual reply<textarea className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-ink dark:bg-slate-900" value={manualReply} onChange={e => setManualReply(e.target.value)} maxLength={1000} disabled={busy} /></label>
        <Button disabled={busy || !manualReply.trim() || sent} onClick={sendManualReply}>Send manual reply · Pause AI</Button>
        {sent ? <p role="status" className="text-sm text-muted">The provider accepted the manual reply. Add your review note and mark this event handled.</p> : null}
        <label className="block text-sm">Review note<textarea className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-ink dark:bg-slate-900" value={reason} onChange={e => setReason(e.target.value)} maxLength={1000} disabled={busy} placeholder="What did you check, and how was this handled?" /></label>
        {isTeviqAdmin && selected.reply ? <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy} />I checked provider records and confirmed the saved reply was not delivered.</label> : null}
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || reason.trim().length < 10} onClick={() => act('resolve')}>Mark handled</Button>
          {isTeviqAdmin && selected.reply ? <Button disabled={busy || !confirmed || reason.trim().length < 10} onClick={() => act('retry_reply')}>Resend saved reply</Button> : null}
          <Button disabled={busy} onClick={() => setSelected(null)}>Cancel</Button>
        </div>
      </div> : null}
      <div className="flex gap-2">
        {cursor ? <Button disabled={busy} onClick={() => { setCursor(null); setSelected(null); }}>Newest</Button> : null}
        {queue.nextCursor ? <Button disabled={busy} onClick={() => { setCursor(queue.nextCursor); setSelected(null); }}>Older messages</Button> : null}
      </div>
    </div>
  </details>;
}
