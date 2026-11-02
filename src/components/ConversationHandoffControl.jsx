import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Button } from './Button';

export function ConversationHandoffControl({ brandId, channel, customerId, refreshKey }) {
  const [handoff, setHandoff] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    api.getConversationHandoff(brandId, channel, customerId)
      .then(value => { if (active) { setHandoff(value); setError(''); } })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [brandId, channel, customerId, refreshKey, retry]);
  async function toggle() {
    setBusy(true); setError('');
    try { setHandoff(await api.setConversationHandoff(brandId, channel, customerId, !handoff.paused)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
    <Button disabled={!handoff || busy} onClick={toggle}>{busy ? 'Saving…' : handoff?.paused ? 'Resume AI' : 'Take over · Pause AI'}</Button>
    <span className="text-muted">{handoff?.paused ? 'AI paused for this conversation.' : 'Taking over pauses new AI replies.'} A reply already being sent may still arrive.</span>
    {handoff?.paused ? <span className="text-muted">Check Delivery review for messages waiting on your team. Resuming AI does not resend held replies.</span> : null}
    {error ? <Button disabled={busy} onClick={() => setRetry(value => value + 1)}>Refresh status</Button> : null}
    {error ? <span role="alert" className="text-rose-600 dark:text-rose-300">{error}</span> : null}
  </div>;
}
