/* =========================================================
   API: habla con Google Apps Script (en vivo) o con
   localStorage (modo local / demo sin internet)
   ========================================================= */
const API = (() => {
  const cfg = window.APAGON_CONFIG || {};
  const params = new URLSearchParams(location.search);
  // ?api=URL permite probar otra Web App sin editar config.js
  const url = (params.get('api') || cfg.scriptUrl || '').trim();
  const online = /^https:\/\/script\.google(usercontent)?\.com\//.test(url);
  const KEY = 'apagon_centrales_db_v1';
  let state = null, listeners = [], errListeners = [], timer = null, inflight = false;

  const local = {
    load() {
      try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
      return ApagonCore.emptyDb();
    },
    save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  };

  function emit() { listeners.forEach(f => { try { f(state); } catch (e) { console.error(e); } }); }
  function emitErr(e) { errListeners.forEach(f => f(e)); }

  async function refresh() {
    if (inflight) return state;
    inflight = true;
    try {
      if (online) {
        const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=state&t=' + Date.now(), { cache: 'no-store' });
        const j = await r.json();
        if (j && j.control) { state = j; emitErr(null); }
      } else {
        state = ApagonCore.publicState(local.load());
      }
      emit();
    } catch (e) { emitErr(e); }
    finally { inflight = false; }
    return state;
  }

  async function send(action, payload = {}) {
    let res;
    if (online) {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action }, payload))
      });
      res = await r.json();
    } else {
      const db = local.load();
      res = ApagonCore.apply(db, action, payload, cfg.teacherPin || '2026');
      if (res.ok) local.save(db);
    }
    if (!res || !res.ok) throw new Error((res && res.error) || 'error');
    inflight = false;
    await refresh();
    return res;
  }

  function start() {
    refresh();
    clearInterval(timer);
    timer = setInterval(refresh, online ? (cfg.pollMs || 4000) : 1500);
    if (!online) window.addEventListener('storage', e => { if (e.key === KEY) refresh(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }

  return {
    online, start, refresh, send,
    get state() { return state; },
    onState: f => listeners.push(f),
    onError: f => errListeners.push(f),
    exportLocal: () => local.load()
  };
})();
