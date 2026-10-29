/* Utilidades compartidas por el celular y la TV */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('apagon_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('apagon_' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('apagon_' + k); } catch (e) {} }
};

let toastTimer;
function toast(msg, isErr) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.className = 'toast', 2600);
}
function errText(e) {
  const k = 'err.' + (e && e.message);
  return I18N.es[k] ? t(k) : (e instanceof TypeError ? t('err.network') : t('err.generic'));
}

function phaseIdx(id) { return PHASES.findIndex(p => p.id === id); }
function teamMembers(st, team) { return ((st && st.members) || []).filter(m => m.team === team); }
function teamFacts(st, team) { return ((st && st.facts) || []).filter(n => n.team === team).sort((a, b) => a.slot.localeCompare(b.slot)); }
function linkify(src) {
  const s = esc(src);
  return /^https?:\/\//i.test(src) ? `<a href="${s}" target="_blank" rel="noopener">${s}</a>` : s;
}

/* Tarjeta de dato técnico (estilo ficha) */
function factCard(n, opts = {}) {
  const stamp = opts.verdict ? `<div class="stamp ${opts.verdict === 'real' ? 'real' : ''}">${opts.verdict === 'real' ? t('tv.real') : t('tv.fake')}</div>` : '';
  const src = n.source && opts.showSource !== false ? `<div class="src">${t('ins.source')}: ${linkify(n.source)}</div>` : '';
  return `<article class="news ${opts.verdict || ''}">
    <div class="slot">${esc(n.slot)}</div>
    <div class="kicker">${esc(opts.kicker || '')}</div>
    <h4>${esc(n.title)}</h4><p>${esc(n.text)}</p>${src}${stamp}
  </article>`;
}

/* Ushuaia de noche: 6 barrios, cada uno se ilumina con la central de un equipo */
function cityArt(lit, opts = {}) {
  lit = lit || [];
  const W = 600, H = 250, groups = TEAMS.length, gw = 560 / groups;
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let bld = '';
  TEAMS.forEach((tm, g) => {
    const on = lit.includes(tm.id);
    const x0 = 20 + g * gw;
    for (let k = 0; k < 3; k++) {
      const w = 18 + Math.floor(rnd() * 14), h = 34 + Math.floor(rnd() * 46);
      const x = x0 + 6 + k * (gw / 3), y = 196 - h;
      bld += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${on ? '#1e293b' : '#0b1220'}" stroke="${on ? tm.color : '#1f2a3d'}" stroke-width="1"/>`;
      for (let wy = y + 6; wy < 190; wy += 10) for (let wx = x + 4; wx < x + w - 4; wx += 7) {
        const r = rnd(), lightOn = on && r > 0.18;
        bld += `<rect x="${wx}" y="${wy}" width="3.5" height="5" fill="${lightOn ? '#fde68a' : '#121a2a'}"${lightOn ? ' class="win"' : ''}/>`;
      }
    }
    bld += `<text x="${x0 + gw / 2}" y="${opts.labels === false ? -10 : 242}" text-anchor="middle" font-size="18" opacity="${on ? 1 : .35}">${tm.emoji}</text>`;
  });
  const anyLit = lit.length > 0;
  return `<svg viewBox="0 0 ${W} ${H}" class="city" role="img" aria-label="Ushuaia de noche">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${anyLit ? '#0b1f3a' : '#03060c'}"/><stop offset="1" stop-color="${anyLit ? '#173a5e' : '#070d18'}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${[[60, 30], [140, 18], [260, 40], [380, 22], [470, 34], [540, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#fff" opacity=".7"/>`).join('')}
    <polygon points="0,140 70,80 120,110 190,52 250,100 310,64 360,98 430,46 500,96 560,70 600,100 600,200 0,200" fill="#18263b"/>
    <polygon points="190,52 176,66 186,64 196,70 204,62" fill="#e2e8f0" opacity=".8"/><polygon points="430,46 416,62 428,58 440,66 446,58" fill="#e2e8f0" opacity=".8"/>
    ${bld}
    <rect x="0" y="196" width="${W}" height="54" fill="#06142a"/>
    <text x="12" y="214" font-size="11" fill="#5b7aa0" font-family="monospace">CANAL BEAGLE</text>
  </svg>`;
}

function hookCard(revealed, pick) {
  const opts = Object.entries(HOOK.options).map(([k, v]) => {
    const cls = revealed ? (k === HOOK.answer ? 'right' : (k === pick ? 'wrongp' : '')) : (k === pick ? 'on' : '');
    return `<div class="opt ${cls}" data-o="${k}"><b>${k}</b><span>${esc(v)}</span></div>`;
  }).join('');
  return `<article class="news ${revealed ? 'real' : ''}">
    <div class="kicker">${esc(HOOK.kicker)}</div>
    <h4 style="margin-right:0">${esc(HOOK.title)}</h4>${cityArt(revealed ? ['termica'] : [], { labels: false })}<p>${esc(HOOK.text)}</p>
  </article>
  <h3 style="margin:16px 0 8px">${esc(HOOK.question)}</h3><div class="opts">${opts}</div>`;
}

/* Cadena de medios técnicos (diagrama de bloques) */
function chainDiagram(team, chain, opts = {}) {
  const tm = teamById(team);
  const sol = tm.chain, want = {}; sol.forEach(([c, e]) => want[c] = e);
  const blocks = (chain || []).map((x, i) => {
    const comp = COMPONENTS[x.c] || { emoji: '❓', name: x.c };
    const mark = opts.mark ? ((sol[i] && sol[i][0] === x.c && want[x.c] === x.e) ? 'ok' : 'bad') : '';
    return `<div class="blk ${mark}"><span class="be">${comp.emoji}</span><b>${esc(comp.name)}</b>${x.e ? `<small>${esc(TRANSF[x.e] || '')}</small>` : ''}</div>`;
  });
  return `<div class="diagram"><div class="blk src"><span class="be">${esc(tm.input.split(' ')[0])}</span><b>${esc(tm.input.replace(/^\S+\s/, ''))}</b></div>${blocks.map(b => '<span class="arr">➜</span>' + b).join('')}<span class="arr">➜</span><div class="blk src"><span class="be">🏙️</span><b>Red</b></div></div>`;
}

function scoreRows(s) {
  return ['hook', 'taller', 'detected', 'justified', 'fooled', 'dilemmas', 'bonus']
    .map(k => `<div><span>${t('sc.' + k)}</span><b>${s[k]}</b></div>`).join('') +
    `<div class="tot"><span>${t('sc.total')}</span><span>${s.total} ${t('common.pts')}</span></div>`;
}

function modeBadge(el) {
  if (!el) return;
  const paint = err => {
    el.className = 'mode ' + (err ? 'off' : (API.online ? 'live' : ''));
    el.textContent = err ? t('mode.offline') : (API.online ? '● ' + t('mode.online') : t('mode.local'));
  };
  paint(null);
  API.onError(paint);
}
