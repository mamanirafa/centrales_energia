/* =========================================================
   APAGÓN EN USHUAIA · Panel docente (para proyectar en la Smart TV)
   ========================================================= */
(() => {
  const stage = $('#stage'), side = $('#side'), nav = $('#nav');
  let PIN = (() => { try { return sessionStorage.getItem('apagon_pin') || ''; } catch (e) { return ''; } })();
  let lastStage = '', lastSide = '', showSol = false;
  const st = () => API.state || ApagonCore.publicState(ApagonCore.emptyDb());
  const shortName = tm => tm.name.replace(/^Central (de )?/, '');

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
    try { await API.send(action, Object.assign({ pin: PIN }, payload || {})); return true; }
    catch (e) { toast(errText(e), true); if (e.message === 'pin') askPin(); return false; }
  }

  /* ---------- Temporizador (compartido con los celulares) ---------- */
  function paintTimer() {
    const s = API.timeLeft(), T = (st().control || {}).timer || {};
    $('#timer').textContent = s == null ? '--:--' : fmtTime(s);
    $('#timer').classList.toggle('end', s === 0 && !!T.run);
    $('#tStart').textContent = T.run ? t('tv.pause') : t('tv.start');
  }
  setInterval(paintTimer, 300);
  $('#tStart').onclick = () => teacher('timer', { op: (st().control.timer || {}).run ? 'pause' : 'start' });
  $('#tReset').onclick = () => teacher('timer', { op: 'set', secs: ((PHASES.find(p => p.id === st().control.phase) || PHASES[0]).min) * 60 });
  $('#tPlus').onclick = () => teacher('timer', { op: 'add', secs: 60 });

  /* ---------- Navegación de fases ---------- */
  function paintNav() {
    const cur = st().control.phase;
    const html = PHASES.map((p, i) => `<button class="step ${p.id === cur ? 'sel' : ''}" data-ph="${p.id}">${p.icon} ${i + 1}. ${esc(p.name)} <span class="mut small" style="margin-left:auto">${p.min}′</span></button>`).join('') +
      `<div style="flex:1"></div>
       ${API.online ? `<button class="btn sec sm" id="saveSheet">${t('tv.save')}</button>` : ''}
       <button class="btn sec sm" id="exportCsv">⬇️ ${t('tv.export')}</button>
       <button class="btn sec sm" id="exportJson">⬇️ JSON</button>
       <button class="btn bad sm" id="resetAll">⟲ ${t('tv.reset')}</button>`;
    if (nav.dataset.html === html) return;
    nav.dataset.html = html; nav.innerHTML = html;
    $$('[data-ph]', nav).forEach(b => b.onclick = () => {
      const p = PHASES.find(x => x.id === b.dataset.ph);
      teacher('setControl', { phase: p.id, secs: p.min * 60 });
    });
    $('#resetAll').onclick = () => { if (confirm(t('tv.resetConfirm'))) teacher('reset'); };
    $('#exportCsv').onclick = exportCsv;
    const ss = $('#saveSheet'); if (ss) ss.onclick = async () => { if (await teacher('saveScores', { rows: scoreRowsForSheet() })) toast(t('tv.saved')); };
    $('#exportJson').onclick = () => downloadFile('apagon-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(API.online ? st() : API.exportLocal(), null, 2), 'application/json');
  }

  /* ---------- Lateral: QR + ranking por equipos ---------- */
  function sideHTML() {
    const s = st(), sc = computeScores(s).teams;
    const order = TEAMS.slice().sort((a, b) => sc[b.id].avg - sc[a.id].avg);
    return `${s.control.phase !== 'registro' ? `<div class="card" style="text-align:center"><div class="mut small">${t('tv.join')}</div><div class="qr" id="qrSmall"></div><div class="url">${esc(studentUrl)}</div></div>` : ''}
      <div class="card"><h3>🏆 ${t('tv.scoreboard')}</h3><div class="rank">${order.map((tm, i) => `
        <div class="r" style="--tc:${tm.color}"><span>${['🥇', '🥈', '🥉'][i] || i + 1}</span><span>${tm.emoji} ${esc(shortName(tm))} <small class="mut">(${sc[tm.id].n})</small></span><b>${sc[tm.id].avg}</b>
        <span class="bx"><button class="btn sec sm" data-bonus="${tm.id}" data-p="-5">−</button><button class="btn sec sm" data-bonus="${tm.id}" data-p="5">+</button></span></div>`).join('')}</div>
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
  const counter = (n, m) => `<span class="timer small-t">${t('tv.answered', { n, m })}</span>`;
  const bar = (label, n, total, color, extra) => `<div class="bar"><span>${label}</span><div class="tr"><div class="fl" style="width:${total ? n / total * 100 : 0}%;${color ? 'background:' + color : ''}"></div></div><b>${n}${extra || ''}</b></div>`;

  /* ---------- Escenario por fase ---------- */
  function stRegistro(s) {
    return `<h1>🪪 Registro</h1>
      <div class="grid" style="grid-template-columns:auto 1fr;gap:24px;align-items:start">
        <div class="card glow" style="text-align:center;margin:0"><h3>${t('tv.join')}</h3><div class="qr" id="qrBig"></div><div class="url" style="max-width:300px;margin-top:8px">${esc(studentUrl)}</div>
          <p class="timer" style="margin:12px 0 0">👥 ${(s.members || []).length}</p></div>
        <div class="teams">${TEAMS.map(tm => {
          const ms = teamMembers(s, tm.id);
          return `<div class="team" style="--tc:${tm.color};cursor:default"><span class="em">${tm.emoji}</span><b>${esc(tm.name)} <small class="mut">${ms.length}/${MAX_MEMBERS}</small></b><span class="tp">${esc(tm.input)}</span>
            <ul class="member-list">${ms.length ? ms.map(m => `<li>${roleById(m.r).emoji} <b>${esc(m.n)}</b> <button class="kick" data-kick="${esc(m.s)}" data-name="${esc(m.n)}" title="Quitar">✕</button></li>`).join('') : `<li>${t('tv.waitingTeams')}</li>`}</ul></div>`;
        }).join('')}</div>
      </div>`;
  }

  function stApagon(s) {
    const c = s.control, qi = c.q || 0, rev = (c.qRev || []).includes(qi), q = QUIZ[qi];
    const ans = (s.answers || []).filter(a => a.k === 'q' && a.i === String(qi));
    const counts = {}; ans.forEach(a => { if (a.p) counts[a.p] = (counts[a.p] || 0) + 1; });
    const total = (s.members || []).length;
    const missing = rev ? (s.members || []).filter(m => !ans.some(a => a.s === m.s)).map(m => m.n) : [];
    return `<div class="row" style="justify-content:space-between"><h1>🚨 El apagón</h1>
        <div class="row"><button class="btn sec" data-q="${qi - 1}" ${qi === 0 ? 'disabled' : ''}>${t('tv.prev')}</button>
        <button class="btn sec" data-q="${qi + 1}" ${qi >= QUIZ.length - 1 ? 'disabled' : ''}>${t('tv.next')}</button>
        ${rev ? `<button class="btn sec" data-unreveal="q${qi}">${t('tv.hide')}</button>` : `<button class="btn big" data-reveal="q${qi}">${t('tv.reveal')}</button>`}</div></div>
      <div class="grid" style="grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:20px;align-items:start">
        <div class="card glow" style="margin:0">${quizCard(qi, { revealed: rev, counts })}</div>
        <div><div class="card" style="margin-top:0">${counter(ans.length, total)}
          <div class="dots" style="margin-top:12px">${TEAMS.map(tm => { const ms = teamMembers(s, tm.id); const n = ms.filter(m => ans.some(a => a.s === m.s)).length; return `<div class="dot ${ms.length && n === ms.length ? 'ok' : ''}" title="${esc(tm.name)}">${tm.emoji}<small>${n}/${ms.length}</small></div>`; }).join('')}</div></div>
          ${rev && missing.length ? `<div class="card warn"><b>⏳ Sin responder (${POINTS.miss}):</b><div class="small">${missing.map(esc).join(', ')}</div></div>` : ''}
          <div class="card"><div class="qdots">${QUIZ.map((x, i) => `<button class="qd ${i === qi ? 'cur' : ''} ${(c.qRev || []).includes(i) ? 'done' : ''}" data-q="${i}">${i + 1}</button>`).join('')}</div></div>
        </div>
      </div>`;
  }

  function stTaller(s) {
    const lit = litTeams(s);
    return `<div class="row" style="justify-content:space-between"><h1>🛠️ Taller de montaje</h1>
        <button class="btn sec" id="solBtn">${showSol ? t('tv.hideSol') : t('tv.showSol')}</button></div>
      <div class="card glow" style="padding:10px">${cityArt(lit)}<p class="timer" style="text-align:center;margin:8px 0 0">💡 ${t('tv.litCount', { n: lit.length, m: TEAMS.length })}</p></div>
      <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${TEAMS.map(tm => {
        const rec = teamChain(s, tm.id), r = rec ? evalChain(tm.id, rec.last) : null;
        return `<div class="card" style="margin:0;border-left:6px solid ${tm.color}">
          <div class="row" style="justify-content:space-between"><b>${tm.emoji} ${esc(tm.name)}</b>
          <span class="chip ${r && r.perfect ? 'acc' : ''}">${r ? (r.perfect ? '💡 ' : '🔧 ') + t('tal.attempt', { n: rec.n }) : t('tv.noChain')}</span></div>
          ${r ? `<div class="mut small" style="margin-top:6px">${t('tal.result', { pos: r.pos, en: r.en, n: r.n })}<br>${t('tv.firstPts', { p: tallerPoints(tm.id, rec) })}</div>` : ''}
          ${showSol ? `<div class="mut small" style="margin-top:8px">${t('tv.solution')}:</div>${chainDiagram(tm.id, tm.chain.map(([c, e]) => ({ c, e })))}` : ''}
        </div>`;
      }).join('')}</div>`;
  }

  function stFicha(s) {
    return `<h1>🕵️ Sabotaje</h1><p class="big-q" style="font-size:24px">${t('fic.mission')}</p>
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
      return `<button class="btn ${tm.id === target ? '' : 'sec'} sm" data-target="${tm.id}" ${ok ? '' : 'disabled'}>${tm.emoji} ${esc(shortName(tm))} ${rev ? '✔' : ''}</button>`;
    }).join('')}</div>`;
    const maxV = Math.max(1, ...rounds.map(r => r.total));
    const bottom = rounds.length ? `<div class="card" style="margin-top:14px"><h3>🕵️ ${t('tv.sabotage')}</h3><div class="bars">${rounds.map(r => {
        const tm = teamById(r.target); return bar(`${tm.emoji} ${esc(shortName(tm))}`, r.fooled, maxV, 'var(--bad)', ` / ${r.total}`);
      }).join('')}</div></div>` : '';
    if (!target) return `<h1>🔍 Inspección</h1>${picker}<p class="big-q">${t('ins.wait')}</p>${bottom}`;
    const tm = teamById(target), facts = teamFacts(s, target), isRev = revealed.includes(target);
    const fake = facts.find(n => n.isFake === true), fakeSlot = fake ? fake.slot : null;
    const ans = (s.answers || []).filter(a => a.k === 'i' && a.i === target);
    const voters = (s.members || []).filter(m => m.t !== target);
    let detail = '';
    if (isRev) {
      const tr = TRAPS[tm.trap];
      const cc = {}; ans.forEach(a => (a.c || []).forEach(x => cc[x] = (cc[x] || 0) + 1));
      const topC = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const cA = ans.filter(a => a.p === 'A').length, cB = ans.filter(a => a.p === 'B').length;
      const missing = voters.filter(m => !ans.some(a => a.s === m.s)).map(m => m.n);
      detail = `<div class="grid g2" style="margin-top:14px">
        <div class="card" style="margin:0"><h3>📊 Votos</h3><div class="bars">${bar('A ' + (fakeSlot === 'A' ? '🕵️' : '✅'), cA, ans.length || 1, fakeSlot === 'A' ? 'var(--good)' : 'var(--bad)')}${bar('B ' + (fakeSlot === 'B' ? '🕵️' : '✅'), cB, ans.length || 1, fakeSlot === 'B' ? 'var(--good)' : 'var(--bad)')}</div>
          ${topC.length ? `<h3 style="margin-top:14px">🔎 ${t('tv.concepts')}</h3><div class="row" style="gap:6px">${topC.map(([id, n]) => { const cr = CONCEPTS.find(x => x.id === id); return cr ? `<span class="chip">${cr.emoji} ${esc(cr.name)} · ${n}</span>` : ''; }).join('')}</div>` : ''}
          ${missing.length ? `<div class="small mut" style="margin-top:10px">⏳ Sin responder: ${missing.map(esc).join(', ')}</div>` : ''}</div>
        <div class="card warn" style="margin:0"><h3>${tr.emoji} ${esc(tr.name)}</h3><p>${esc(tr.desc)}</p>
          <div class="mut small" style="margin-top:8px">${t('tv.solution')}:</div>${chainDiagram(tm.id, tm.chain.map(([cc2, e]) => ({ c: cc2, e })))}</div>
      </div>`;
    }
    return `<div class="row" style="justify-content:space-between"><h1>${tm.emoji} ${esc(tm.name)}</h1>
        <div class="row">${counter(ans.length, voters.length)}
        ${isRev ? `<button class="btn sec" data-unreveal="i:${target}">${t('tv.hide')}</button>` : `<button class="btn big" data-reveal="i:${target}">${t('tv.reveal')}</button>`}</div></div>
      ${picker}
      <div class="pair">${facts.map(n => factCard(n, { kicker: tm.name, verdict: isRev ? (n.slot === fakeSlot ? 'fake' : 'real') : '', showSource: isRev })).join('')}</div>
      ${detail}${bottom}`;
  }

  function stConsejo(s) {
    const c = s.control, i = Math.min(c.dlg || 0, COUNCIL.length - 1), dl = COUNCIL[i], rev = (c.dRev || []).includes(i);
    const ans = (s.answers || []).filter(a => a.k === 'c' && a.i === String(i));
    const total = (s.members || []).length;
    return `<div class="row" style="justify-content:space-between"><h1>⚖️ Consejo energético</h1>
        <div class="row"><button class="btn sec" data-dil="${i - 1}" ${i === 0 ? 'disabled' : ''}>${t('tv.prev')}</button>
        <span class="chip acc">${t('con.n', { n: i + 1, m: COUNCIL.length })}</span>
        <button class="btn sec" data-dil="${i + 1}" ${i >= COUNCIL.length - 1 ? 'disabled' : ''}>${t('tv.next')}</button>
        ${rev ? `<button class="btn sec" data-unreveal="c${i}">${t('tv.hide')}</button>` : `<button class="btn big" data-reveal="c${i}">${t('tv.reveal')}</button>`}</div></div>
      <div class="card glow"><span class="chip">${esc(dl.tag)}</span><p class="big-q">${esc(dl.text)}</p></div>
      <div class="card">${counter(ans.length, total)}
        ${rev ? `<div class="bars" style="margin-top:12px">${['si', 'no', 'depende'].map(sd => bar(`${{ si: '👍', no: '👎', depende: '🤔' }[sd]} ${t('con.' + sd)} ${sd === dl.ans ? '✅' : ''}`, ans.filter(a => a.p === sd).length, ans.length || 1, sd === dl.ans ? 'var(--good)' : (sd === 'depende' ? 'var(--warn)' : 'var(--bad)'))).join('')}</div>
          <div class="why" style="font-size:20px">💡 ${esc(dl.why)}</div>` : ''}</div>`;
  }

  function stCierre(s) {
    const sc = computeScores(s);
    const order = TEAMS.slice().sort((a, b) => sc.teams[b.id].avg - sc.teams[a.id].avg);
    const pod = [order[1], order[0], order[2]];
    const hts = [170, 230, 130];
    const top = Object.values(sc.students).sort((a, b) => b.total - a.total).slice(0, 5);
    const nStudents = (s.members || []).length, nExit = (s.exits || []).length;
    return `<h1>🏅 ${t('tv.podium')}</h1>
      <div class="grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:end">
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:16px;margin:24px 0">${pod.map((tm, k) => tm ? `
        <div style="text-align:center;width:190px"><div style="font-size:54px">${tm.emoji}</div><b style="font-size:20px">${esc(tm.name)}</b>
          <div style="height:${hts[k]}px;margin-top:8px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,${tm.color},rgba(255,255,255,.05));display:grid;place-items:center;font-size:38px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">${['🥈', '🥇', '🥉'][k]}<span style="font-size:22px">${sc.teams[tm.id].avg}</span></div></div>` : '').join('')}</div>
      <div class="card"><h3>⭐ ${t('tv.topStudents')}</h3><div class="rank">${top.map((x, i) => { const tm = teamById(x.team); return `<div class="r" style="--tc:${tm.color};grid-template-columns:30px 1fr auto"><span>${i + 1}</span><span>${tm.emoji} ${esc(x.name)}</span><b>${x.total}</b></div>`; }).join('')}</div></div>
      </div>
      <div class="card glow" style="text-align:center"><p class="big-q" style="font-size:24px">${t('tv.getCert')}</p><p class="timer">${t('tv.exits')}: ${nExit} / ${nStudents}</p></div>`;
  }

  const STAGE = { registro: stRegistro, apagon: stApagon, taller: stTaller, ficha: stFicha, inspeccion: stInspeccion, consejo: stConsejo, cierre: stCierre };

  function paint(force) {
    const s = st(), ph = s.control.phase;
    paintNav();
    const html = STAGE[ph](s);
    if (force || html !== lastStage) {
      lastStage = html; stage.innerHTML = html;
      makeQR('qrBig', 260);
      $$('[data-reveal]', stage).forEach(b => b.onclick = () => teacher('reveal', { key: b.dataset.reveal }));
      $$('[data-unreveal]', stage).forEach(b => b.onclick = () => teacher('unreveal', { key: b.dataset.unreveal }));
      $$('[data-target]', stage).forEach(b => b.onclick = () => teacher('setControl', { target: b.dataset.target }));
      $$('[data-dil]', stage).forEach(b => b.onclick = () => teacher('setControl', { dlg: +b.dataset.dil }));
      $$('[data-q]', stage).forEach(b => b.onclick = () => teacher('setControl', { q: +b.dataset.q }));
      $$('[data-kick]', stage).forEach(b => b.onclick = () => { if (confirm(t('tv.kick', { n: b.dataset.name }))) teacher('kick', { sid: b.dataset.kick }); });
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
  function scoreRowsForSheet() {
    const s = st(), sc = computeScores(s).students, exits = API.online ? [] : (API.exportLocal().exits || []);
    return (s.members || []).slice().sort((a, b) => a.t.localeCompare(b.t) || a.n.localeCompare(b.n)).map(m => {
      const x = sc[m.s] || {}, ex = exits.find(e => e.s === m.s) || {};
      return [teamById(m.t).name, m.n, roleById(m.r).name, x.quiz, x.taller, x.ins, x.fooled, x.council, x.bonus, x.misses, x.total, ex.a1 || '', ex.a2 || '', m.s];
    });
  }
  function exportCsv() {
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const head = ['Central', 'Estudiante', 'Rol', 'El apagón', 'Taller', 'Inspección', 'Sabotaje', 'Consejo', 'Bonus', 'Sin responder', 'TOTAL', 'Ticket: pieza', 'Ticket: central'];
    const rows = [head.map(q).join(',')].concat(scoreRowsForSheet().map(r => r.slice(0, 13).map(q).join(',')));
    downloadFile('apagon-puntajes-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + rows.join('\n'), 'text/csv');
  }

  applyI18n();
  modeBadge($('#mode'));
  API.onState(() => paint(false));
  API.start();
  paint(true);
  if (!PIN) askPin();
})();
