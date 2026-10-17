// Refresh without replacing the page with a loading screen or overlapping
// requests. Hidden tabs pause polling and catch up when brought forward.
export function startConversationPolling({ load, onData, onInitialError, onInitialComplete, getRevision = () => 0 }) {
  let active = true;
  let inFlight = false;
  let pending = false;
  let initial = true;

  async function refresh() {
    if (!active || (!initial && document.hidden)) return;
    if (inFlight) { pending = true; return; }
    inFlight = true;
    const revision = getRevision();
    try {
      const result = await load();
      if (active && revision === getRevision()) onData(result);
      else if (active) pending = true;
    } catch (error) {
      if (active && initial) onInitialError(error);
    } finally {
      inFlight = false;
      if (active && initial) { initial = false; onInitialComplete(); }
      if (active && pending) { pending = false; void refresh(); }
    }
  }

  const onVisible = () => { if (!document.hidden) void refresh(); };
  const interval = setInterval(onVisible, 15000);
  window.addEventListener("focus", onVisible);
  document.addEventListener("visibilitychange", onVisible);
  void refresh();
  return () => {
    active = false;
    clearInterval(interval);
    window.removeEventListener("focus", onVisible);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
