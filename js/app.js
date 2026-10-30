/* =========================================================
   APAGÓN EN USHUAIA · App del estudiante (celular)
   Cada estudiante entra con su nombre: responde y suma puntos individuales.
   ========================================================= */
(() => {
  const main = $('#main');
  let SID = store.get('sid', null);
  if (!SID) { SID = newSid(); store.set('sid', SID); }
  let JOIN_TEAM = null, SWITCH = false, VIEW = null, lastPhase = null, lastKey = '', live = null;

  const st = () => API.state || ApagonCore.publicState(ApagonCore.emptyDb());
  const ctrl = () => st().control;
  const ME = () => memberBySid(st(), SID);
  const TEAM = () => (ME() || {}).t;
  const myTeam = () => teamById(TEAM());
  const unlocked = id => phaseIdx(id) <= phaseIdx(ctrl().phase);
  const myScore = () => computeScores(st()).students[SID] || { total: 0 };

  async function act(btn, msgEl, action, payload, okText) {
    if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = t('common.sending'); }
    try {
      await API.send(action, Object.assign({ sid: SID }, payload));
      if (msgEl) { msgEl.className = 'msg ok'; msgEl.textContent = okText || t('common.saved'); }
      toast(okText || t('common.saved'));
      return true;
    } catch (e) {
      if (msgEl) { msgEl.className = 'msg err'; msgEl.textContent = errText(e); }
      toast(errText(e), true);
      return false;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
    }
  }

  /* ¿Quién envía en esta fase? (si el equipo no tiene ese rol, puede cualquiera) */
  function canSend(role) {
    const me = ME(); if (!me) return false;
    const has = teamMembers(st(), me.t).some(m => m.r === role);
    return !has || me.r === role;
  }
  function whoBanner(phaseId) {
    const ph = PHASES.find(p => p.id === phaseId);
    if (!ph || phaseId === 'registro') return '';
    let extra = '';
    if (ph.who !== 'todos' && !canSend(ph.who)) extra = `<div class="small" style="margin-top:4px">${t('who.notYou', { role: roleById(ph.who).name })}</div>`;
    return `<div class="who ${ph.who === 'todos' ? '' : 'team'}">${t('who.' + ph.who)}${extra}</div>`;
  }

  /* ---------------- Ingreso: elegir central + nombre ---------------- */
  function renderJoin() {
    const s = st();
    if (!JOIN_TEAM) {
      main.innerHTML = `
        <section class="hero">
          <h1>APA<span>GÓN</span></h1>
          <div class="sub">${t('app.subtitle')}</div>
          <p>${t('app.tagline')}</p>
        </section>
        <h2 style="margin-top:22px">${t('join.choose')}</h2>
        <div class="teams">${TEAMS.map(tm => {
          const n = teamMembers(s, tm.id).length, full = n >= MAX_MEMBERS;
          return `<button class="team" style="--tc:${tm.color}" data-team="${tm.id}" ${full ? 'disabled' : ''}>
            <span class="em">${tm.emoji}</span><b>${esc(tm.name)}</b>
            <span class="tp">${esc(tm.input)}</span>
            <div class="meta"><span class="chip ${n ? 'acc' : ''}">👥 ${full ? t('join.full') : t('join.slots', { n, m: MAX_MEMBERS })}</span></div>
          </button>`;
        }).join('')}</div>`;
      $$('[data-team]', main).forEach(b => b.onclick = () => { JOIN_TEAM = b.dataset.team; render(true); window.scrollTo(0, 0); });
      if (SWITCH && ME()) { main.insertAdjacentHTML('beforeend', `<button class="btn ghost block" id="cancelSw" style="margin-top:14px">✕ Cancelar</button>`); $('#cancelSw').onclick = () => { SWITCH = false; render(true); }; }
      return;
    }
    const tm = teamById(JOIN_TEAM), ms = teamMembers(s, JOIN_TEAM);
    const d = store.get('join', { name: '', role: '' });
    main.innerHTML = `
      <div class="teamhead" style="--tc:${tm.color};margin-top:8px"><span class="em">${tm.emoji}</span>
        <div style="flex:1"><b>${esc(tm.name)}</b><div class="mut small">${esc(tm.input)}</div></div>
        <button class="linkbtn" id="back">${t('join.back')}</button></div>
      <div class="card glow">
        <h2>${t('join.title')}</h2>
        <label>${t('join.name')} *</label><input type="text" id="jName" maxlength="60" autocomplete="off" value="${esc(d.name)}">
        <label>${t('join.role')} *</label>
        <div class="roles">${ROLES.map(r => `<label class="rolec ${d.role === r.id ? 'on' : ''}"><input type="radio" name="role" value="${r.id}" ${d.role === r.id ? 'checked' : ''}><b>${r.emoji} ${esc(r.name)}</b><small>${esc(r.desc)}</small></label>`).join('')}</div>
        <p class="mut small">${t('join.roleHint')}</p>
        <button class="btn block big" id="jGo">${t('join.go')}</button>
        <div class="msg" id="jMsg"></div>
      </div>
      ${ms.length ? `<div class="card"><p class="small mut" style="margin-top:0">${t('join.already')}</p>
        <select id="jPick"><option value="">${t('join.pickName')}</option>${ms.map(m => `<option value="${esc(m.s)}">${esc(m.n)}</option>`).join('')}</select></div>` : ''}`;
    $('#back').onclick = () => { JOIN_TEAM = null; render(true); };
    if (SWITCH && ME()) main.insertAdjacentHTML('beforeend', `<button class="btn ghost block" id="cancelSw">✕ Cancelar</button>`);
    const cs = $('#cancelSw'); if (cs) cs.onclick = () => { SWITCH = false; JOIN_TEAM = null; render(true); };
    $('#jName').oninput = e => { d.name = e.target.value; store.set('join', d); };
    $$('input[name=role]', main).forEach(r => r.onchange = () => { d.role = r.value; store.set('join', d); $$('.rolec', main).forEach(x => x.classList.toggle('on', x.contains(r) && r.checked)); });
    $('#jGo').onclick = async e => {
      const m = $('#jMsg');
      if (d.name.trim().length < 3) { m.className = 'msg err'; m.textContent = t('err.name'); return; }
      if (!d.role) { m.className = 'msg err'; m.textContent = t('err.role'); return; }
      if (await act(e.currentTarget, m, 'join', { team: JOIN_TEAM, name: d.name, role: d.role }, t('reg.ok', { team: tm.name }))) { JOIN_TEAM = null; SWITCH = false; render(true); window.scrollTo(0, 0); }
    };
    const pick = $('#jPick');
    if (pick) pick.onchange = () => { if (pick.value) { SID = pick.value; store.set('sid', SID); JOIN_TEAM = null; SWITCH = false; render(true); } };
  }

  /* ---------------- Barra del estudiante + fases ---------------- */
  function headHTML() {
    const me = ME(), tm = myTeam(), r = roleById(me.r);
    return `<div class="mebar" style="--tc:${tm.color}">
        <span class="em">${tm.emoji}</span>
        <div class="who1"><b>${esc(me.n)}</b><small>${esc(tm.name)} · ${r.emoji} ${esc(r.name)}</small></div>
        <div class="stat"><small>${t('me.points')}</small><b id="mePts">${myScore().total}</b></div>
        <div class="stat"><small>${t('me.time')}</small><b id="meTime">--:--</b></div>
      </div>
      <nav class="steps" id="steps"></nav>
      <div id="who"></div>
      <div id="phase"></div>`;
  }
  function paintSteps() {
    const el = $('#steps'); if (!el) return;
    const cur = ctrl().phase;
    const html = PHASES.map(p => `<button class="step ${p.id === VIEW ? 'sel' : ''} ${p.id === cur ? 'cur' : ''} ${unlocked(p.id) ? '' : 'lock'}" data-ph="${p.id}">${p.icon} ${esc(p.name)}</button>`).join('');
    if (el.dataset.html === html) return;          // sin cambios: no tocar nada
    el.dataset.html = html;
    el.innerHTML = html;
    $$('[data-ph]', el).forEach(b => b.onclick = () => { VIEW = b.dataset.ph; render(true); });
    const sel = $('.step.sel', el);
    if (sel) el.scrollLeft = sel.offsetLeft - (el.clientWidth - sel.offsetWidth) / 2;   // solo horizontal
  }
  function paintBar() {
    const tEl = $('#meTime'), pEl = $('#mePts');
    if (tEl) { const s = API.timeLeft(); tEl.textContent = s == null ? '--:--' : fmtTime(s); tEl.classList.toggle('end', s === 0); tEl.classList.toggle('low', s > 0 && s <= 60); }
    if (pEl) { const p = String(myScore().total); if (pEl.textContent !== p) { pEl.textContent = p; pEl.classList.remove('pop'); void pEl.offsetWidth; pEl.classList.add('pop'); } }
  }
  setInterval(paintBar, 500);

  function resultLine(ok, none, pts, wrongText) {
    if (none) return `<div class="res miss">${t('res.none', { p: POINTS.miss })}</div>`;
    return ok ? `<div class="res ok">${t('res.right', { p: pts })}</div>` : `<div class="res bad">${wrongText}</div>`;
  }

  /* ---------------- Fase 1: Registro ---------------- */
  function renderRegistro(el) {
    const me = ME(), tm = myTeam(), tr = TRAPS[tm.trap];
    el.innerHTML = `
      <div class="card glow"><h2>${t('reg.ok', { team: esc(tm.name) })}</h2>
        <h3>${t('reg.members', { n: '<span id="nMem"></span>', m: MAX_MEMBERS })}</h3><ul class="member-list" id="mList"></ul></div>
      <div class="card alt"><div class="grid g2">
        <div><div class="mut small">${t('reg.input')}</div><h3>${esc(tm.input)}</h3><div class="mut small">${tm.renewable ? '♻️ Recurso renovable' : '⛔ Recurso no renovable'}</div></div>
        <div><div class="mut small">${t('reg.trap')}</div><h3>${tr.emoji} ${esc(tr.name)}</h3><div class="mut small">${esc(tr.desc)}</div></div>
      </div></div>
      <div class="card"><h3>${t('reg.howScore')}</h3><p class="small">${t('reg.rules', { miss: POINTS.miss })}</p>
        <h3>${t('reg.rolesTitle')}</h3><div class="grid g2">${ROLES.map(r => `<div><b>${r.emoji} ${esc(r.name)}</b><div class="mut small">${esc(r.desc)}</div></div>`).join('')}</div></div>
      <details class="card"><summary><b>${t('reg.edit')}</b></summary>
        <label>${t('join.name')}</label><input type="text" id="eName" maxlength="60" value="${esc(me.n)}">
        <label>${t('join.role')}</label><select id="eRole">${ROLES.map(r => `<option value="${r.id}" ${r.id === me.r ? 'selected' : ''}>${r.emoji} ${esc(r.name)}</option>`).join('')}</select>
        <div class="row" style="margin-top:12px"><button class="btn" id="eSave">${t('reg.save')}</button><button class="btn sec" id="eTeam">${t('join.back')}</button></div>
        <div class="msg" id="eMsg"></div></details>`;
    $('#eSave', el).onclick = e => act(e.currentTarget, $('#eMsg', el), 'join', { team: me.t, name: $('#eName', el).value, role: $('#eRole', el).value });
    $('#eTeam', el).onclick = () => { store.set('join', { name: me.n, role: me.r }); JOIN_TEAM = null; SWITCH = true; render(true); window.scrollTo(0, 0); };
    let last = '';
    return () => {
      const ms = teamMembers(st(), TEAM());
      const html = ms.map(m => `<li>${roleById(m.r).emoji} <b>${esc(m.n)}</b> · ${esc(roleById(m.r).name)}${m.s === SID ? ' (vos)' : ''}</li>`).join('');
      if (html !== last) { last = html; $('#mList', el).innerHTML = html; $('#nMem', el).textContent = ms.length; }
    };
  }

  /* ---------------- Fase 2: El apagón (preguntas) ---------------- */
  function renderApagon(el) {
    const s = st(), c = s.control, qi = c.q || 0, rev = (c.qRev || []).includes(qi);
    const mine = findAnswer(s, 'q', qi, SID);
    const localPick = store.get('ans_q' + qi, '');
    const pick = rev ? (mine ? mine.p : '') : (mine ? localPick : '');
    let res = '';
    if (rev) {
      const q = QUIZ[qi];
      res = resultLine(mine && mine.p === q.ans, !mine, POINTS.quiz, t('res.wrong', { v: q.ans }));
    }
    const hist = historyQuiz(s);
    el.innerHTML = `<div class="card glow">${quizCard(qi, { revealed: rev, pick, result: res })}<div class="msg" id="qMsg"></div></div>${hist}`;
    if (!rev) $$('.opt', el).forEach(b => b.onclick = async () => {
      store.set('ans_q' + qi, b.dataset.o);
      $$('.opt', el).forEach(x => x.classList.toggle('on', x === b));
      await act(null, $('#qMsg', el), 'answer', { kind: 'q', key: qi, pick: b.dataset.o }, t('apagon.sent', { v: b.dataset.o }));
    });
    return () => {
      const m = $('#qMsg', el);
      if (m && !rev && !m.textContent && findAnswer(st(), 'q', qi, SID) && localPick) { m.className = 'msg ok'; m.textContent = t('apagon.sent', { v: localPick }); }
    };
  }
  function historyQuiz(s) {
    const rev = (s.control.qRev || []).slice().sort((a, b) => a - b);
    if (!rev.length) return '';
    return `<div class="card"><h3>${t('res.history')}</h3><div class="hist">${rev.map(qi => {
      const q = QUIZ[qi], a = findAnswer(s, 'q', qi, SID);
      const mark = !a ? `⏳ ${POINTS.miss}` : (a.p === q.ans ? `✅ +${POINTS.quiz}` : `❌ 0`);
      return `<details><summary><span>${qi + 1}. ${esc(q.q)}</span><b>${mark}</b></summary>
        <div class="small">${a ? t('res.mine', { v: a.p + ') ' + esc(q.opts[a.p] || '') }) + '<br>' : ''}✔ ${q.ans}) ${esc(q.opts[q.ans])}<br><span class="mut">${esc(q.why)}</span></div></details>`;
    }).join('')}</div></div>`;
  }

  /* ---------------- Fase 3: Taller de montaje (arrastrar y soltar) ---------------- */
  function poolFor(tm) {
    const ids = tm.chain.map(x => x[0]).concat(tm.decoys);
    let seed = tm.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return ids;
  }
  function renderTaller(el) {
    const tm = myTeam(), pool = poolFor(tm), TEAMID = TEAM();
    const saved = teamChain(st(), TEAMID);
    const d = store.get('chain_' + TEAMID, null) || { chain: saved ? saved.last.map(x => ({ c: x.c, e: x.e })) : [] };
    const persist = () => store.set('chain_' + TEAMID, d);
    const sender = canSend('tecnico');
    el.innerHTML = `
      <div class="card glow"><h2>${t('tal.title')}</h2><p>${t('tal.mission')}</p></div>
      <div class="card alt"><h3>${t('tal.pool')}</h3><p class="mut small" style="margin-top:0">${t('tal.poolHint')}</p><ul class="dz pool" id="pool"></ul></div>
      <div class="card"><h3>${t('tal.chain')}</h3>
        <div class="srcrow">${t('tal.start')}: <b>${esc(tm.input)}</b></div>
        <ul class="dz chainz" id="chain" data-empty="${t('tal.drop')}"></ul>
        <div class="srcrow">${t('tal.end')}</div>
      </div>
      <div class="card"><h3>${t('tal.energyTitle')}</h3><div id="etable"></div></div>
      <button class="btn block big" id="sendChain" ${sender ? '' : 'disabled'}>${t('tal.send')}</button>
      <div class="msg" id="chainMsg"></div>
      <div id="chainRes"></div>`;
    const poolEl = $('#pool', el), chainEl = $('#chain', el), etable = $('#etable', el);
    const pieceHTML = (id, inChain) => {
      const cp = COMPONENTS[id];
      return `<li class="piece" data-id="${id}"><span class="grip">⋮⋮</span><span class="pn">${cp.emoji} ${esc(cp.name)}</span>
        <button class="mini" data-info="${id}" title="${t('tal.info')}">ℹ️</button>
        ${inChain ? `<button class="mini" data-rm="${id}" title="${t('tal.remove')}">✕</button>` : `<button class="mini add" data-add="${id}">${t('tal.add')}</button>`}</li>`;
    };
    const drawLists = () => {
      const used = d.chain.map(x => x.c);
      poolEl.innerHTML = pool.filter(id => !used.includes(id)).map(id => pieceHTML(id, false)).join('');
      chainEl.innerHTML = d.chain.map(x => pieceHTML(x.c, true)).join('');
      drawTable();
    };
    const drawTable = () => {
      etable.innerHTML = d.chain.length ? d.chain.map((x, i) => {
        const cp = COMPONENTS[x.c];
        return `<div class="erow"><div class="ename"><span class="num">${i + 1}</span>${cp.emoji} ${esc(cp.name)}</div>
          <select data-e="${x.c}"><option value="">${t('tal.choose')}</option>${Object.entries(TRANSF).map(([k, v]) => `<option value="${k}" ${k === x.e ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>`;
      }).join('') : `<p class="mut small">${t('tal.firstBuild')}</p>`;
      $$('[data-e]', etable).forEach(s => s.onchange = () => { const x = d.chain.find(y => y.c === s.dataset.e); if (x) { x.e = s.value; persist(); } });
    };
    const syncFromDom = () => {
      const prev = {}; d.chain.forEach(x => prev[x.c] = x.e);
      d.chain = $$('.piece', chainEl).map(li => ({ c: li.dataset.id, e: prev[li.dataset.id] || '' }));
      persist(); drawLists();
    };
    el.addEventListener('click', e => {
      const add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]'), info = e.target.closest('[data-info]');
      if (info) { const cp = COMPONENTS[info.dataset.info]; toast(cp.emoji + ' ' + cp.name + ': ' + cp.desc); }
      if (add) { d.chain.push({ c: add.dataset.add, e: '' }); persist(); drawLists(); }
      if (rm) { d.chain = d.chain.filter(x => x.c !== rm.dataset.rm); persist(); drawLists(); }
    });
    if (window.Sortable) {
      const opts = { group: 'piezas', animation: 150, forceFallback: true, fallbackTolerance: 4, delayOnTouchOnly: true, delay: 120,
                     filter: 'button', preventOnFilter: false, ghostClass: 'ghost', chosenClass: 'chosen', onSort: () => setTimeout(syncFromDom, 0) };
      Sortable.create(poolEl, Object.assign({}, opts, { sort: false }));
      Sortable.create(chainEl, opts);
    }
    drawLists();
    $('#sendChain', el).onclick = e => {
      const m = $('#chainMsg', el);
      if (d.chain.length < 2) { m.className = 'msg err'; m.textContent = t('err.chain'); return; }
      if (d.chain.some(x => !x.e)) { m.className = 'msg err'; m.textContent = t('err.energy'); return; }
      if (!teamChain(st(), TEAMID) && !confirm(t('tal.confirm'))) return;
      act(e.currentTarget, m, 'submitChain', { chain: d.chain }, t('common.saved'));
    };
    let lastRes = '', seenN = saved ? saved.n : 0;
    return () => {
      const rec = teamChain(st(), TEAMID), box = $('#chainRes', el);
      if (!box) return;
      if (rec && rec.n !== seenN) {          // el equipo envió: los demás celulares muestran esa cadena
        seenN = rec.n;
        if (!sender) { d.chain = rec.last.map(x => ({ c: x.c, e: x.e })); persist(); drawLists(); }
      }
      let html = '';
      if (rec) {
        const r = evalChain(TEAMID, rec.last);
        const errs = r.rows.map((x, i) => {
          const cp = COMPONENTS[x.c];
          const lines = [];
          if (x.intruder) lines.push(`<span class="bad">✗ ${t('tal.intruder')}</span>`);
          else {
            lines.push(x.posOk ? `<span class="good">✓ ${t('tal.okPiece')}</span>` : `<span class="bad">✗ ${t('tal.badPos', { n: x.rightPos + 1 })}</span>`);
            lines.push(x.enOk ? `<span class="good">✓ ${t('tal.okE')}</span>` : `<span class="bad">✗ ${t('tal.badE', { e: esc(TRANSF[x.rightE]) })}</span>`);
          }
          return `<div class="errrow ${x.intruder || !x.posOk || !x.enOk ? 'no' : 'yes'}"><b>${i + 1}. ${cp.emoji} ${esc(cp.name)}</b><div class="small">${lines.join('<br>')}</div></div>`;
        }).join('');
        const miss = r.missing.length ? `<div class="errrow no"><b class="bad">${t('tal.missing', { list: r.missing.map(id => COMPONENTS[id].emoji + ' ' + COMPONENTS[id].name).join(', ') })}</b></div>` : '';
        html = `<div class="card ${r.perfect ? 'glow' : 'warn'}">
          <div class="row" style="justify-content:space-between"><span class="chip">${t('tal.attempt', { n: rec.n })}</span><span class="chip acc">${t('tal.firstScore', { p: tallerPoints(TEAMID, rec) })}</span></div>
          <h3 style="margin-top:10px">${r.perfect ? t('tal.lit') : t('tal.notyet')}</h3>
          <p class="big-num">${t('tal.result', { pos: r.pos, en: r.en, n: r.n })}</p>
          ${r.perfect ? '' : `<h3>${t('tal.errors')}</h3>${errs}${miss}`}</div>`;
      }
      if (html !== lastRes) { lastRes = html; box.innerHTML = html; }
    };
  }

  /* ---------------- Fase 4: Sabotaje (ficha técnica) ---------------- */
  function renderFicha(el) {
    const tm = myTeam(), tr = TRAPS[tm.trap], TEAMID = TEAM();
    const saved = teamFacts(st(), TEAMID);
    let d = store.get('facts_' + TEAMID, null);
    if (!d) d = { fake: null, items: [0, 1].map(i => Object.assign({ title: '', text: '', source: '' }, saved[i] ? { title: saved[i].title, text: saved[i].text, source: saved[i].source } : {})) };
    const q = encodeURIComponent(tm.name.toLowerCase() + ' ' + tm.ideas.split(',')[0]);
    const prompt = t('fic.aiPrompt', { team: tm.name, trap: tr.name, desc: tr.desc.toLowerCase() });
    const sender = canSend('investigador');
    el.innerHTML = `
      <div class="card glow"><h2>${t('fic.title')}</h2><p>${t('fic.mission')}</p><p class="chip acc">💡 ${t('fic.tip')}</p></div>
      <div class="grid g2">
        <div class="card alt" style="margin:0"><h3>${t('fic.howTrap')}: ${tr.emoji} ${esc(tr.name)}</h3><p>${esc(tr.desc)}</p><p class="mut small">${esc(tr.ej)}</p></div>
        <div class="card alt" style="margin:0"><h3>📚 ${t('fic.searchTitle')}</h3>
          <p class="mut small">${t('fic.searchTip', { sources: SOURCES.join(', ') })}</p>
          <p class="small">${t('fic.ideas')}: ${esc(tm.ideas)}</p>
          <a class="btn sec sm" href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">${t('fic.openSearch')} ↗</a>
        </div>
      </div>
      <div class="card alt"><h3>${t('fic.aiTitle')}</h3><p class="mut small">${t('fic.aiTip')}</p>
        <div class="prompt">${esc(prompt)}</div>
        <div class="row" style="margin-top:10px"><button class="btn sm" id="copyAI">${t('common.copy')}</button>
          <a class="btn sec sm" href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini ↗</a>
          <a class="btn sec sm" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT ↗</a>
          <a class="btn sec sm" href="https://copilot.microsoft.com/" target="_blank" rel="noopener">Copilot ↗</a></div></div>
      <div id="editors"></div>
      <div class="card warn small">⚠️ ${t('fic.rules')}</div>
      <button class="btn block big" id="saveFacts" ${sender ? '' : 'disabled'}>${t('fic.save')}</button>
      <div class="msg" id="factsMsg"></div>`;
    $('#copyAI', el).onclick = async () => { try { await navigator.clipboard.writeText(prompt); } catch (e) { const ta = document.createElement('textarea'); ta.value = prompt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } toast(t('common.copied')); };
    const box = $('#editors', el);
    const persist = () => store.set('facts_' + TEAMID, d);
    const draw = () => {
      box.innerHTML = d.items.map((n, i) => `<div class="card ${d.fake === i ? 'warn' : ''}">
        <div class="row" style="justify-content:space-between"><h3 style="margin:0">${t('fic.item', { n: i + 1 })}</h3>
          <label class="radio ${d.fake === i ? 'on' : ''}"><input type="radio" name="fake" data-fake="${i}" ${d.fake === i ? 'checked' : ''}> ${t('fic.isFake')}</label></div>
        <label>${t('fic.headline')} *</label><input type="text" data-i="${i}" data-k="title" maxlength="160" value="${esc(n.title)}">
        <label>${t('fic.body')} *</label><textarea data-i="${i}" data-k="text" maxlength="400">${esc(n.text)}</textarea>
        <label>${t('fic.source')}${d.fake === i ? '' : ' *'}</label><input type="text" data-i="${i}" data-k="source" maxlength="300" value="${esc(n.source)}">
      </div>`).join('');
      $$('[data-k]', box).forEach(inp => inp.oninput = inp.onchange = () => { d.items[inp.dataset.i][inp.dataset.k] = inp.value; persist(); });
      $$('[data-fake]', box).forEach(r => r.onchange = () => { d.fake = +r.dataset.fake; persist(); draw(); });
    };
    draw();
    $('#saveFacts', el).onclick = e => {
      const msg = $('#factsMsg', el);
      if (d.fake == null) { msg.className = 'msg err'; msg.textContent = t('err.fake'); return; }
      const real = d.items[1 - d.fake];
      if (d.items.some(n => !n.title.trim() || !n.text.trim()) || !real.source.trim()) { msg.className = 'msg err'; msg.textContent = t('err.empty'); return; }
      if (!confirm(t('fic.confirm'))) return;
      const flip = Math.random() < 0.5;
      const items = d.items.map((n, i) => Object.assign({}, n, { slot: (i === 0) !== flip ? 'A' : 'B', isFake: i === d.fake }));
      act(e.currentTarget, msg, 'submitFacts', { items }, t('fic.done'));
    };
    return () => {
      const c = ctrl(), locked = c.target === TEAMID || (c.revealed || []).includes(TEAMID);
      const b = $('#saveFacts', el); if (b) b.disabled = locked || !sender;
      const m = $('#factsMsg', el);
      if (m && locked) { m.className = 'msg err'; m.textContent = t('err.locked'); }
      else if (m && !m.textContent && teamFacts(st(), TEAMID).length === 2) { m.className = 'msg ok'; m.textContent = t('fic.done'); }
    };
  }

  /* ---------------- Fase 5: Inspección (vota cada uno) ---------------- */
  function renderInspeccion(el) {
    const s = st(), c = s.control, target = c.target, revealed = c.revealed || [], TEAMID = TEAM();
    const hist = historyIns(s);
    if (!target) { el.innerHTML = `<div class="card glow"><h2>${t('ins.title')}</h2><p>${t('ins.wait')}</p></div>${hist}`; return; }
    const tm = teamById(target), facts = teamFacts(s, target), isRev = revealed.includes(target);
    const fakeSlot = (facts.find(n => n.isFake === true) || {}).slot;
    const cards = facts.length ? `<div class="pair">${facts.map(n => factCard(n, { kicker: tm.name, verdict: isRev ? (n.slot === fakeSlot ? 'fake' : 'real') : '', showSource: isRev })).join('')}</div>` : `<p class="mut">${t('ins.noFacts')}</p>`;
    const head = `<div class="card glow"><div class="mut small">${t('ins.on')}</div><h2>${tm.emoji} ${esc(tm.name)}</h2><div class="mut small">${esc(tm.input)}</div></div>`;
    const trapInfo = isRev ? `<div class="why">🕵️ ${t('ins.trapWas', { trap: TRAPS[tm.trap].emoji + ' ' + TRAPS[tm.trap].name })} — ${esc(TRAPS[tm.trap].desc)}</div>` : '';

    if (target === TEAMID) {
      const r = inspectionRounds(s).find(x => x.target === TEAMID);
      el.innerHTML = head + `<div class="card warn"><h3>${isRev && r ? t('ins.fooled', { n: r.fooled, p: r.fooled * POINTS.fooled }) : t('ins.own')}</h3></div>` + cards + trapInfo + hist;
      return;
    }
    if (isRev) {
      const mine = findAnswer(s, 'i', target, SID);
      const okk = mine && mine.p === fakeSlot;
      const pts = okk ? POINTS.detected + ((mine.c || []).length >= 1 && (mine.w || '').trim().length >= 10 ? POINTS.concept : 0) : 0;
      el.innerHTML = head + `<div class="card ${okk ? 'glow' : 'warn'}">${!mine ? resultLine(false, true) : okk ? `<div class="res ok">${t('ins.right', { p: pts })}</div>` : `<div class="res bad">${t('ins.wrong', { v: fakeSlot })}</div>`}
        ${mine ? `<div class="small mut">${t('res.mine', { v: mine.p })}</div>` : ''}</div>` + cards + trapInfo + hist;
      return;
    }
    const dk = 'ins_' + target;
    const d = store.get(dk, { pick: '', concepts: [], why: '' });
    el.innerHTML = head + cards + `
      <div class="card glow">
        <h3>${t('ins.which')}</h3>
        <div class="choice"><button class="btn big sec ${d.pick === 'A' ? 'on' : ''}" data-pick="A">🕵️ A</button><button class="btn big sec ${d.pick === 'B' ? 'on' : ''}" data-pick="B">🕵️ B</button></div>
        <label>${t('ins.concepts')}</label>
        <div class="crit">${CONCEPTS.map(cr => `<label class="${d.concepts.includes(cr.id) ? 'on' : ''}"><input type="checkbox" value="${cr.id}" ${d.concepts.includes(cr.id) ? 'checked' : ''}><span>${cr.emoji} ${esc(cr.name)}<small>${esc(cr.q)}</small></span></label>`).join('')}</div>
        <label>${t('ins.why')}</label><textarea id="why" maxlength="300">${esc(d.why)}</textarea>
        <button class="btn block big" id="sendVote" style="margin-top:12px">${t('ins.send')}</button>
        <div class="msg" id="voteMsg"></div>
      </div>` + hist;
    const save = () => store.set(dk, d);
    $$('[data-pick]', el).forEach(b => b.onclick = () => { d.pick = b.dataset.pick; save(); $$('[data-pick]', el).forEach(x => x.classList.toggle('on', x === b)); });
    $$('.crit input', el).forEach(cb => cb.onchange = () => { d.concepts = $$('.crit input:checked', el).map(x => x.value); cb.parentElement.classList.toggle('on', cb.checked); save(); });
    $('#why', el).oninput = e => { d.why = e.target.value; save(); };
    $('#sendVote', el).onclick = e => {
      const m = $('#voteMsg', el);
      if (!d.pick) { m.className = 'msg err'; m.textContent = t('err.pick'); return; }
      act(e.currentTarget, m, 'answer', { kind: 'i', key: target, pick: d.pick, concepts: d.concepts, why: d.why }, t('ins.sent', { v: d.pick }));
    };
    return () => {
      const m = $('#voteMsg', el);
      if (m && !m.textContent && d.pick && findAnswer(st(), 'i', target, SID)) { m.className = 'msg ok'; m.textContent = t('ins.sent', { v: d.pick }); }
    };
  }
  function historyIns(s) {
    const rounds = inspectionRounds(s);
    if (!rounds.length) return '';
    return `<div class="card"><h3>${t('ins.history')}</h3><div class="hist">${rounds.map(r => {
      const tm = teamById(r.target);
      let mark;
      if (r.target === TEAM()) mark = `🕵️ +${r.fooled * POINTS.fooled}`;
      else { const a = findAnswer(s, 'i', r.target, SID); mark = !a ? `⏳ ${POINTS.miss}` : a.p === r.fake ? '🛡️ ✅' : '⚡ ❌'; }
      return `<div class="hrow"><span>${tm.emoji} ${esc(tm.name)}</span><b>${mark}</b></div>`;
    }).join('')}</div></div>`;
  }

  /* ---------------- Fase 6: Consejo energético (vota cada uno) ---------------- */
  function renderConsejo(el) {
    const s = st(), c = s.control, i = Math.min(c.dlg || 0, COUNCIL.length - 1), dl = COUNCIL[i];
    const rev = (c.dRev || []).includes(i), mine = findAnswer(s, 'c', i, SID);
    const localPick = store.get('ans_c' + i, '');
    const pick = rev ? (mine ? mine.p : '') : (mine ? localPick : '');
    let res = '';
    if (rev) {
      if (!mine) res = resultLine(false, true);
      else if (mine.p === 'depende') res = `<div class="res miss">${t('con.depRes', { p: POINTS.depends, v: t('con.' + dl.ans) })}</div>`;
      else res = resultLine(mine.p === dl.ans, false, POINTS.council, t('res.wrong', { v: t('con.' + dl.ans) }));
    }
    el.innerHTML = `<div class="card glow"><h2>${t('con.title')}</h2><p class="mut">${t('con.intro')}</p>
      <div class="qhead"><span class="chip acc">${t('con.n', { n: i + 1, m: COUNCIL.length })}</span><span class="chip">${esc(dl.tag)}</span></div>
      <p class="big-q" style="font-size:21px">${esc(dl.text)}</p>
      <div class="grid g3">${['si', 'no', 'depende'].map(sd => {
        const cls = rev ? (sd === dl.ans ? 'right' : (sd === pick ? 'wrongp' : '')) : (sd === pick ? 'on' : '');
        return `<button class="btn big sec vote ${cls}" data-side="${sd}" ${rev ? 'disabled' : ''}>${{ si: '👍', no: '👎', depende: '🤔' }[sd]} ${t('con.' + sd)}</button>`;
      }).join('')}</div>
      ${res}${rev ? `<div class="why">💡 ${esc(dl.why)}</div>` : ''}
      <div class="msg" id="conMsg"></div></div>${historyCon(s)}`;
    if (!rev) $$('[data-side]', el).forEach(b => b.onclick = async () => {
      store.set('ans_c' + i, b.dataset.side);
      $$('[data-side]', el).forEach(x => x.classList.toggle('on', x === b));
      await act(null, $('#conMsg', el), 'answer', { kind: 'c', key: i, pick: b.dataset.side }, t('con.voted', { v: t('con.' + b.dataset.side) }));
    });
    return () => {
      const m = $('#conMsg', el);
      if (m && !rev && !m.textContent && localPick && findAnswer(st(), 'c', i, SID)) { m.className = 'msg ok'; m.textContent = t('con.voted', { v: t('con.' + localPick) }); }
    };
  }
  function historyCon(s) {
    const rev = (s.control.dRev || []).slice().sort((a, b) => a - b);
    if (!rev.length) return '';
    return `<div class="card"><h3>${t('res.history')}</h3><div class="hist">${rev.map(di => {
      const d = COUNCIL[di], a = findAnswer(s, 'c', di, SID);
      const mark = !a ? `⏳ ${POINTS.miss}` : a.p === 'depende' ? `🤔 ${POINTS.depends}` : a.p === d.ans ? `✅ +${POINTS.council}` : '❌ 0';
      return `<details><summary><span>${di + 1}. ${esc(d.text)}</span><b>${mark}</b></summary><div class="small">✔ ${t('con.' + d.ans)}<br><span class="mut">${esc(d.why)}</span></div></details>`;
    }).join('')}</div></div>`;
  }

  /* ---------------- Fase 7: Cierre y certificado ---------------- */
  function renderCierre(el) {
    const s = st(), me = ME(), tm = myTeam();
    const sc = computeScores(s);
    const done = (s.exits || []).some(e => e.s === SID);
    const d = store.get('exit_' + SID, { a1: '', a2: '' });
    el.innerHTML = `
      <div class="card"><h2>${t('cier.title')}</h2>
        <div class="grid g2"><div><h3>${t('cier.score')}</h3><div class="score" id="scoreBox">${scoreRows(sc.students[SID] || {})}</div></div>
        <div><h3>${t('cier.team')}</h3><div class="bigavg" id="teamAvg">${tm.emoji} ${sc.teams[tm.id].avg} ${t('common.pts')}</div></div></div></div>
      <div class="card glow">
        <label>${t('cier.q1')}</label><textarea id="a1" maxlength="400">${esc(d.a1)}</textarea>
        <label>${t('cier.q2')}</label><textarea id="a2" maxlength="400">${esc(d.a2)}</textarea>
        <button class="btn block big" id="sendExit" style="margin-top:12px">${t('cier.send')}</button>
        <div class="msg" id="exitMsg"></div>
      </div>
      <div id="certBox" class="card hidden">
        <canvas id="certCanvas"></canvas>
        <div class="row" style="margin-top:12px"><button class="btn" id="dl">${t('cier.download')}</button><button class="btn sec" id="pr">${t('cier.print')}</button></div>
      </div>`;
    const sv = () => store.set('exit_' + SID, d);
    $('#a1', el).oninput = e => { d.a1 = e.target.value; sv(); };
    $('#a2', el).oninput = e => { d.a2 = e.target.value; sv(); };
    const showCert = async () => {
      const date = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
      const box = $('#certBox', el); box.classList.remove('hidden');
      const cv = $('#certCanvas', el);
      await Cert.draw(cv, {
        name: me.n, role: roleById(me.r).name, team: tm.name, date,
        points: (computeScores(st()).students[SID] || {}).total || 0, code: Cert.code(me.n + '|' + me.t + '|' + SID)
      });
      $('#dl', el).onclick = () => Cert.download(cv, me.n);
      $('#pr', el).onclick = () => Cert.print(cv);
      box.scrollIntoView({ behavior: 'smooth' });
    };
    $('#sendExit', el).onclick = async e => {
      const m = $('#exitMsg', el);
      if (!d.a1.trim() || !d.a2.trim()) { m.className = 'msg err'; m.textContent = t('err.empty'); return; }
      if (await act(e.currentTarget, m, 'exitTicket', { a1: d.a1, a2: d.a2 })) showCert();
    };
    if (done) setTimeout(showCert, 50);
    return () => {
      const s2 = computeScores(st());
      const b = $('#scoreBox', el); if (b) b.innerHTML = scoreRows(s2.students[SID] || {});
      const a = $('#teamAvg', el); if (a) a.textContent = `${tm.emoji} ${s2.teams[tm.id].avg} ${t('common.pts')}`;
    };
  }

  const RENDER = { registro: renderRegistro, apagon: renderApagon, taller: renderTaller, ficha: renderFicha, inspeccion: renderInspeccion, consejo: renderConsejo, cierre: renderCierre };

  /* Clave de re-render: cambia solo cuando cambia la estructura de la vista
     (así no se borra lo que el estudiante está escribiendo ni se mueve la pantalla) */
  function viewKey() {
    const s = st(), c = s.control, me = ME();
    if (!me || SWITCH) return 'join|' + SWITCH + '|' + JOIN_TEAM + '|' + TEAMS.map(x => teamMembers(s, x.id).length).join(',') + '|' + (JOIN_TEAM ? teamMembers(s, JOIN_TEAM).map(m => m.s).join(',') : '');
    let k = SID + '|' + me.t + '|' + me.n + '|' + me.r + '|' + VIEW + '|' + unlocked(VIEW);
    if (VIEW === 'apagon') k += '|' + c.q + '|' + (c.qRev || []).join(',');
    if (VIEW === 'taller' || VIEW === 'ficha') k += '|' + canSend(VIEW === 'taller' ? 'tecnico' : 'investigador');
    if (VIEW === 'inspeccion') k += '|' + c.target + '|' + (c.revealed || []).join(',') + '|' + teamFacts(s, c.target).map(n => n.title).join('');
    if (VIEW === 'consejo') k += '|' + c.dlg + '|' + (c.dRev || []).join(',');
    return k;
  }

  function render(force) {
    if (!API.state) { main.innerHTML = '<p class="mut" style="text-align:center;margin-top:60px">⚡ Conectando…</p>'; return; }
    const c = ctrl(), me = ME();
    if (me) {
      if (lastPhase !== c.phase) { VIEW = c.phase; lastPhase = c.phase; }
      if (!VIEW) VIEW = c.phase;
    }
    const key = viewKey();
    if (!force && key === lastKey) { paintSteps(); if (live) live(); return; }
    lastKey = key; live = null;
    if (!me || SWITCH) { renderJoin(); return; }
    main.innerHTML = headHTML();
    paintSteps(); paintBar();
    $('#who').innerHTML = whoBanner(VIEW);
    const ph = $('#phase');
    if (!unlocked(VIEW)) { ph.innerHTML = `<div class="card warn"><h3>${t('phase.locked')}</h3></div>`; return; }
    live = RENDER[VIEW](ph) || null;
    if (live) live();
  }

  applyI18n();
  modeBadge($('#mode'));
  API.onState(() => render(false));
  API.start();
  render(true);
})();
