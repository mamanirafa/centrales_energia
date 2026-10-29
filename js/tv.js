/* =========================================================
   APAGÓN EN USHUAIA · Panel docente (para proyectar en la Smart TV)
   ========================================================= */
(() => {
  const stage = $('#stage'), side = $('#side'), nav = $('#nav');
  let PIN = (() => { try { return sessionStorage.getItem('apagon_pin') || ''; } catch (e) { return ''; } })();
  let lastStage = '', lastSide = '', lastPhase = null, showSol = false;
  const st = () => API.state || ApagonCore.publicState(ApagonCore.emptyDb());

  const studentUrl = (() => {
    const u = new URL('index.html', location.href);
    const api = new URLSearchParams(location.search).get('api');
    if (api) u.searchParams.set('api', api);
    return u.href.replace(/index\.html(\?|$)/, '$1');
  })();

  /* ---------- PIN ---------- */
  const modal = $('#pinModal');
  function askPin() { modal.classList.remove('hidden'); $('#pinInput').value = PIN; setTimeout(() => $('#pinInput').focus(), 50); }
  $('#pinOk').onclick = () => { PIN = $('#pinInput').value.trim(); try { sessionStorage.setItem('apagon_pin', PIN); } catch (e) {} modal.classList.add('hidden'); paint(true); };
  $('#pinInput').onkeydown = e => { if (e.key === 'Enter') $('#pinOk').click(); };
  $('#pinView').onclick = () => { modal.classList.add('hidden'); };
  $('#lockBtn').onclick = askPin;

  async function teacher(action, payload) {
    try { await API.send(action, Object.assign({ pin: PIN }, payload || {})); }
    catch (e) { toast(errText(e), true); if (e.message === 'pin') askPin(); }
  }

  /* ---------- Temporizador ---------- */
  const T = { left: 0, running: false, last: 0 };
  function setTimer(min) { T.left = min * 60; T.running = false; paintTimer(); }
  function paintTimer() {
    const s = Math.max(0, Math.round(T.left));
    $('#timer').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    $('#timer').classList.toggle('end', s === 0 && T.running);
    $('#tStart').textContent = T.running ? t('tv.pause') : t('tv.start');
  }
  setInterval(() => { const n = Date.now(); if (T.running) { T.left = Math.max(0, T.left - (n - T.last) / 1000); paintTimer(); } T.last = n; }, 250);
  $('#tStart').onclick = () => { T.running = !T.running; T.last = Date.now(); paintTimer(); };
  $('#tReset').onclick = () => setTimer((PHASES.find(p => p.id === st().control.phase) || PHASES[0]).min);
  $('#tPlus').onclick = () => { T.left += 60; paintTimer(); };

  /* ---------- Navegación de fases ---------- */
  function paintNav() {
    const cur = st().control.phase;
    const html = PHASES.map((p, i) => `<button class="step ${p.id === cur ? 'sel' : ''}" data-ph="${p.id}">${p.icon} ${i + 1}. ${esc(p.name)} <span class="mut small" style="margin-left:auto">${p.min}′</span></button>`).join('') +
      `<div style="flex:1"></div>
       <button class="btn sec sm" id="exportCsv">⬇️ ${t('tv.export')}</button>
       <button class="btn sec sm" id="exportJson">⬇️ JSON</button>
       <button class="btn bad sm" id="resetAll">⟲ ${t('tv.reset')}</button>`;
    if (nav.dataset.html === html) return;
    nav.dataset.html = html; nav.innerHTML = html;
    $$('[data-ph]', nav).forEach(b => b.onclick = () => teacher('setControl', { phase: b.dataset.ph }));
    $('#resetAll').onclick = () => { if (confirm(t('tv.resetConfirm'))) teacher('reset'); };
    $('#exportCsv').onclick = exportCsv;
    $('#exportJson').onclick = () => downloadFile('apagon-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(API.online ? st() : API.exportLocal(), null, 2), 'application/json');
  }

  /* ---------- Lateral: QR + ranking ---------- */
  function sideHTML() {
    const s = st(), sc = computeScores(s);
    const order = TEAMS.slice().sort((a, b) => sc[b.id].total - sc[a.id].total);
    return `${s.control.phase !== 'registro' ? `<div class="card" style="text-align:center"><div class="mut small">${t('tv.join')}</div><div class="qr" id="qrSmall"></div><div class="url">${esc(studentUrl)}</div></div>` : ''}
      <div class="card"><h3>🏆 ${t('tv.scoreboard')}</h3><div class="rank">${order.map((tm, i) => `
        <div class="r" style="--tc:${tm.color}"><span>${['🥇', '🥈', '🥉'][i] || i + 1}</span><span>${tm.emoji} ${esc(tm.name.replace(/^Central (de )?/, ''))}</span><b>${sc[tm.id].total}</b>
        <span class="bx"><button class="btn sec sm" data-bonus="${tm.id}" data-p="-10">−</button><button class="btn sec sm" data-bonus="${tm.id}" data-p="10">+</button></span></div>`).join('')}</div>
        <div class="mut small" style="margin-top:8px">${t('tv.bonusHint')}</div></div>`;
  }

  function makeQR(id, size) {
    const el = document.getElementById(id);
    if (!el || el.dataset.done === studentUrl + size) return;
    el.innerHTML = ''; el.dataset.done = studentUrl + size;
    if (window.QRCode) new QRCode(el, { text: studentUrl, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
    else el.textContent = '📱';
  }

  const litTeams = s => TEAMS.filter(tm => isLit(s, tm.id)).map(tm => tm.id);

  /* ---------- Escenario por fase ---------- */
  function stRegistro(s) {
    return `<h1>${t('reg.title')}</h1>
      <div class="grid" style="grid-template-columns:auto 1fr;gap:24px;align-items:start">
        <div class="card glow" style="text-align:center;margin:0"><h3>${t('tv.join')}</h3><div class="qr" id="qrBig"></div><div class="url" style="max-width:300px;margin-top:8px">${esc(studentUrl)}</div></div>
        <div class="teams">${TEAMS.map(tm => {
          const ms = teamMembers(s, tm.id);
          return `<div class="team" style="--tc:${tm.color};cursor:default"><span class="em">${tm.emoji}</span><b>${esc(tm.name)}</b><span class="tp">${esc(tm.input)}</span>
            <ul class="member-list">${ms.length ? ms.map(m => `<li>${(roleById(m.role) || {}).emoji || ''} <b>${esc(m.name)}</b></li>`).join('') : `<li>${t('tv.waitingTeams')}</li>`}</ul></div>`;
        }).join('')}</div>
      </div>`;
  }

  function stApagon(s) {
    const c = s.control, votes = (s.votes || []).filter(v => v.kind === 'apagon');
    const tally = c.hookRevealed ? `<div class="bars" style="margin-top:12px">${Object.keys(HOOK.options).map(k => {
      const list = votes.filter(v => v.pick === k);
      return `<div class="bar" style="grid-template-columns:40px 1fr 90px"><b>${k}</b><div class="tr"><div class="fl" style="width:${(list.length / TEAMS.length) * 100}%;${k === HOOK.answer ? '' : 'background:var(--bad)'}"></div></div><span>${list.map(v => teamById(v.team).emoji).join('') || '0'}</span></div>`;
    }).join('')}</div>` : '';
    return `<div class="row" style="justify-content:space-between"><h1>${t('apagon.title')}</h1>
        <div class="row">${c.hookRevealed ? `<button class="btn sec" data-unreveal="hook">${t('tv.hide')}</button>` : `<button class="btn big" data-reveal="hook">${t('tv.reveal')}</button>`}</div></div>
      <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:20px;align-items:start">
        <div>${hookCard(c.hookRevealed, null)}</div>
        <div><div class="card"><p class="timer">${t('tv.votes', { n: votes.length, m: TEAMS.length })}</p>
          <div class="dots">${TEAMS.map(tm => { const v = votes.find(x => x.team === tm.id); return `<div class="dot ${v ? (c.hookRevealed ? (v.pick === HOOK.answer ? 'ok' : 'inf') : 'ok') : ''}">${tm.emoji}</div>`; }).join('')}</div>${tally}</div>
          ${c.hookRevealed ? `<div class="card warn"><p style="margin:0">${esc(HOOK.reveal)}</p></div>` : ''}
        </div>
      </div>`;
  }

  function stTaller(s) {
    const lit = litTeams(s);
    return `<div class="row" style="justify-content:space-between"><h1>${t('tal.title')}</h1>
        <button class="btn sec" id="solBtn">${showSol ? t('tv.hideSol') : t('tv.showSol')}</button></div>
      <div class="card glow" style="padding:10px">${cityArt(lit)}<p class="timer" style="text-align:center;margin:8px 0 0">💡 ${t('tv.litCount', { n: lit.length, m: TEAMS.length })}</p></div>
      <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${TEAMS.map(tm => {
        const rec = teamChain(s, tm.id), r = rec ? evalChain(tm.id, rec.chain) : null;
        return `<div class="card" style="margin:0;border-left:6px solid ${tm.color}">
          <div class="row" style="justify-content:space-between"><b>${tm.emoji} ${esc(tm.name)}</b>
          <span class="chip ${r && r.perfect ? 'acc' : ''}">${r ? (r.perfect ? '💡 ' : '🔧 ') + t('tal.attempt', { n: rec.attempts }) : t('tv.noChain')}</span></div>
          ${r ? `<div class="mut small" style="margin-top:6px">${t('tal.result', { pos: r.pos, en: r.en, n: r.n })}</div>` : ''}
          ${showSol ? `<div class="mut small" style="margin-top:8px">${t('tv.solution')}:</div>${chainDiagram(tm.id, tm.chain.map(([c, e]) => ({ c, e })))}` : ''}
        </div>`;
      }).join('')}</div>`;
  }

  function stFicha(s) {
    return `<h1>${t('fic.title')}</h1><p class="big-q" style="font-size:24px">${t('fic.mission')}</p>
      <p class="chip acc" style="font-size:18px">💡 ${t('fic.tip')}</p>
      <div class="teams" style="margin-top:16px">${TEAMS.map(tm => {
        const tr = TRAPS[tm.trap], ok = teamFacts(s, tm.id).length === 2;
        return `<div class="team" style="--tc:${tm.color};cursor:default"><span class="em">${tm.emoji}</span><b>${esc(tm.name)}</b>
          <div class="meta"><span class="chip">${tr.emoji} ${esc(tr.name)}</span>
          <span class="chip ${ok ? 'acc' : ''}">${ok ? '✅ ' + t('tv.factsOk') : '⏳ ' + t('tv.factsNo')}</span></div>
          <div class="mut small" style="margin-top:8px">${esc(tr.desc)}</div></div>`;
      }).join('')}</div>`;
  }

  function stInspeccion(s) {
    const c = s.control, target = c.target, revealed = c.revealed || [], rounds = inspectionRounds(s);
    const picker = `<div class="row" style="margin-bottom:12px"><span class="mut">${t('tv.chooseTeam')}:</span>${TEAMS.map(tm => {
      const ok = teamFacts(s, tm.id).length === 2, rev = revealed.includes(tm.id);
      return `<button class="btn ${tm.id === target ? '' : 'sec'} sm" data-target="${tm.id}" ${ok ? '' : 'disabled'}>${tm.emoji} ${esc(tm.name.replace(/^Central (de )?/, ''))} ${rev ? '✔' : ''}</button>`;
    }).join('')}</div>`;
    const bottom = `<div class="card" style="margin-top:14px"><h3>🕵️ ${t('tv.sabotage')}</h3><div class="bars">${TEAMS.map(tm => {
        const r = rounds.find(x => x.target === tm.id);
        return `<div class="bar" style="grid-template-columns:190px 1fr 40px"><span>${tm.emoji} ${esc(tm.name.replace(/^Central (de )?/, ''))}</span><div class="tr"><div class="fl" style="width:${r ? (r.fooled.length / (TEAMS.length - 1)) * 100 : 0}%;background:var(--bad)"></div></div><b>${r ? r.fooled.length : '–'}</b></div>`;
      }).join('')}</div></div>`;
    if (!target) return `<h1>${t('ins.title')}</h1>${picker}<p class="big-q">${t('ins.wait')}</p>${bottom}`;
    const tm = teamById(target), facts = teamFacts(s, target), isRev = revealed.includes(target);
    const fake = facts.find(n => n.isFake === true), fakeSlot = fake ? fake.slot : null;
    const votes = (s.votes || []).filter(v => v.kind === 'inspeccion' && v.target === target);
    const dots = TEAMS.filter(x => x.id !== target).map(x => {
      const v = votes.find(y => y.team === x.id);
      const cls = !v ? '' : (fakeSlot == null ? 'ok' : (v.pick === fakeSlot ? 'ok' : 'inf'));
      return `<div class="dot ${cls}" title="${esc(x.name)}">${x.emoji}</div>`;
    }).join('');
    let detail = '';
    if (isRev) {
      const tr = TRAPS[tm.trap];
      detail = `<div class="grid g2" style="margin-top:14px">
        <div class="card" style="margin:0"><h3>🔍 ${t('tv.clues')}</h3>${votes.map(v => {
          const vt = teamById(v.team), ok = v.pick === fakeSlot;
          return `<div style="margin-bottom:10px"><b>${vt.emoji} ${esc(vt.name)}</b> → ${esc(v.pick)} ${ok ? '🛡️' : '⚡'}
            <div class="row" style="gap:4px;margin-top:4px">${(v.clues || []).map(id => { const cr = CLUES.find(x => x.id === id); return cr ? `<span class="chip small">${cr.emoji} ${esc(cr.name)}</span>` : ''; }).join('')}</div>
            ${v.why ? `<div class="mut small">“${esc(v.why)}”</div>` : ''}</div>`;
        }).join('') || '—'}</div>
        <div class="card warn" style="margin:0"><h3>${tr.emoji} ${esc(tr.name)}</h3><p>${esc(tr.desc)}</p>
          <div class="mut small" style="margin-top:8px">${t('tv.solution')}:</div>${chainDiagram(tm.id, tm.chain.map(([c, e]) => ({ c, e })))}</div>
      </div>`;
    }
    return `<div class="row" style="justify-content:space-between"><h1>${tm.emoji} ${esc(tm.name)}</h1>
        <div class="row"><span class="timer">${t('tv.votes', { n: votes.length, m: TEAMS.length - 1 })}</span>
        ${isRev ? `<button class="btn sec" data-unreveal="${target}">${t('tv.hide')}</button>` : `<button class="btn big" data-reveal="${target}">${t('tv.reveal')}</button>`}</div></div>
      ${picker}
      <div class="pair">${facts.map(n => factCard(n, { kicker: tm.name, verdict: isRev ? (n.slot === fakeSlot ? 'fake' : 'real') : '', showSource: isRev })).join('')}</div>
      <div class="dots" style="margin-top:14px">${dots}</div>
      ${detail}${bottom}`;
  }

  function stConsejo(s) {
    const c = s.control, i = Math.min(c.dilemma || 0, DILEMMAS.length - 1), dl = DILEMMAS[i];
    const vs = (s.dilemmas || []).filter(d => Number(d.dilemma) === i);
    const sides = ['si', 'no', 'depende'];
    return `<div class="row" style="justify-content:space-between"><h1>${t('con.title')}</h1>
        <div class="row"><button class="btn sec" data-dil="${i - 1}" ${i === 0 ? 'disabled' : ''}>${t('tv.prev')}</button>
        <span class="chip acc">${t('tv.dilemma', { n: i + 1, m: DILEMMAS.length })}</span>
        <button class="btn sec" data-dil="${i + 1}" ${i >= DILEMMAS.length - 1 ? 'disabled' : ''}>${t('tv.next')}</button></div></div>
      <div class="card glow"><span class="chip">${esc(dl.tag)}</span><p class="big-q">${esc(dl.text)}</p></div>
      <div class="card"><div class="bars">${sides.map(sd => {
        const list = vs.filter(v => v.side === sd);
        return `<div class="bar"><span>${{ si: '👍', no: '👎', depende: '🤔' }[sd]} ${t('con.' + sd)}</span><div class="tr"><div class="fl" style="width:${(list.length / TEAMS.length) * 100}%"></div></div><b>${list.map(v => teamById(v.team).emoji).join('') || '0'}</b></div>`;
      }).join('')}</div></div>`;
  }

  function stCierre(s) {
    const sc = computeScores(s);
    const order = TEAMS.slice().sort((a, b) => sc[b.id].total - sc[a.id].total);
    const pod = [order[1], order[0], order[2]];
    const hts = [170, 230, 130];
    const nStudents = (s.members || []).length, nExit = (s.exits || []).length;
    return `<h1>🏅 ${t('tv.podium')}</h1>
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:16px;margin:24px 0">${pod.map((tm, k) => tm ? `
        <div style="text-align:center;width:200px"><div style="font-size:54px">${tm.emoji}</div><b style="font-size:20px">${esc(tm.name)}</b>
          <div style="height:${hts[k]}px;margin-top:8px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,${tm.color},rgba(255,255,255,.05));display:grid;place-items:center;font-size:38px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">${['🥈', '🥇', '🥉'][k]}<span style="font-size:22px">${sc[tm.id].total}</span></div></div>` : '').join('')}</div>
      <div class="card glow" style="text-align:center"><p class="big-q" style="font-size:24px">${t('tv.getCert')}</p><p class="timer">${t('tv.exits')}: ${nExit} / ${nStudents}</p></div>`;
  }

  const STAGE = { registro: stRegistro, apagon: stApagon, taller: stTaller, ficha: stFicha, inspeccion: stInspeccion, consejo: stConsejo, cierre: stCierre };

  function paint(force) {
    const s = st(), ph = s.control.phase;
    if (ph !== lastPhase) { setTimer((PHASES.find(p => p.id === ph) || PHASES[0]).min); lastPhase = ph; force = true; }
    paintNav();
    const html = STAGE[ph](s);
    if (force || html !== lastStage) {
      lastStage = html; stage.innerHTML = html;
      makeQR('qrBig', 260);
      $$('[data-reveal]', stage).forEach(b => b.onclick = () => teacher('reveal', { target: b.dataset.reveal }));
      $$('[data-unreveal]', stage).forEach(b => b.onclick = () => teacher('unreveal', { target: b.dataset.unreveal }));
      $$('[data-target]', stage).forEach(b => b.onclick = () => teacher('setControl', { target: b.dataset.target }));
      $$('[data-dil]', stage).forEach(b => b.onclick = () => teacher('setControl', { dilemma: +b.dataset.dil }));
      const sb = $('#solBtn', stage); if (sb) sb.onclick = () => { showSol = !showSol; paint(true); };
    }
    const sh = sideHTML();
    if (force || sh !== lastSide) {
      lastSide = sh; side.innerHTML = sh;
      makeQR('qrSmall', 150);
      $$('[data-bonus]', side).forEach(b => b.onclick = () => teacher('bonus', { team: b.dataset.bonus, points: +b.dataset.p, reason: 'TV' }));
    }
  }

  /* ---------- Exportar ---------- */
  function downloadFile(name, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  function exportCsv() {
    const s = API.online ? st() : ApagonCore.publicState(API.exportLocal());
    const sc = computeScores(s);
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = [['Central', 'Estudiante', 'Rol', 'Puntaje equipo', 'Ticket: medio técnico', 'Ticket: central para Ushuaia'].map(q).join(',')];
    (s.members || []).forEach(m => {
      const ex = (s.exits || []).find(e => e.team === m.team && e.name === m.name) || {};
      rows.push([teamById(m.team).name, m.name, (roleById(m.role) || {}).name, sc[m.team].total, ex.a1, ex.a2].map(q).join(','));
    });
    downloadFile('apagon-estudiantes-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + rows.join('\n'), 'text/csv');
  }

  applyI18n();
  modeBadge($('#mode'));
  API.onState(() => paint(false));
  API.start();
  paint(true);
  paintTimer();
  if (!PIN) askPin();
})();
