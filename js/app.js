/* =========================================================
   APAGÓN EN USHUAIA · App del estudiante (celular)
   ========================================================= */
(() => {
  const main = $('#main');
  let TEAM = store.get('team', null);
  if (TEAM && !teamById(TEAM)) TEAM = null;
  let VIEW = null, lastPhase = null, lastKey = '', live = null;

  const st = () => API.state || ApagonCore.publicState(ApagonCore.emptyDb());
  const ctrl = () => st().control;
  const unlocked = id => !API.online || phaseIdx(id) <= phaseIdx(ctrl().phase);
  const myTeam = () => teamById(TEAM);

  async function act(btn, msgEl, action, payload, okText) {
    if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = t('common.sending'); }
    try {
      await API.send(action, Object.assign({ team: TEAM }, payload));
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

  /* ---------------- Inicio: elegir equipo ---------------- */
  function renderHome() {
    const s = st();
    main.innerHTML = `
      <section class="hero">
        <h1>APA<span>GÓN</span></h1>
        <div class="sub">${t('app.subtitle')}</div>
        <p>${t('app.tagline')}</p>
      </section>
      <h2 style="margin-top:22px">${t('home.choose')}</h2>
      <div class="teams">${TEAMS.map(tm => {
        const n = teamMembers(s, tm.id).length;
        return `<button class="team" style="--tc:${tm.color}" data-team="${tm.id}">
          <span class="em">${tm.emoji}</span><b>${esc(tm.name)}</b>
          <span class="tp">${esc(tm.input)}</span>
          <div class="meta"><span class="chip">${tm.renewable ? '♻️ Renovable' : '⛔ No renovable'}</span>
          <span class="chip ${n ? 'acc' : ''}">${n ? t('home.registered', { n }) : t('home.slots', { n: tm.size })}</span></div>
        </button>`;
      }).join('')}</div>`;
    $$('[data-team]', main).forEach(b => b.onclick = () => {
      TEAM = b.dataset.team; store.set('team', TEAM); VIEW = null; render(true);
      window.scrollTo(0, 0);
    });
  }

  /* ---------------- Cabecera del equipo + fases ---------------- */
  function headHTML() {
    const tm = myTeam();
    return `<div class="teamhead" style="--tc:${tm.color}">
        <span class="em">${tm.emoji}</span>
        <div style="flex:1;min-width:0"><b>${esc(tm.name)}</b><div class="mut small">${esc(tm.input)}</div></div>
        <button class="linkbtn" id="changeTeam">${t('team.change')}</button>
      </div>
      <nav class="steps" id="steps"></nav>
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
    // Centrar la fase elegida SOLO en horizontal (nunca mover la página)
    const sel = $('.step.sel', el);
    if (sel) el.scrollLeft = sel.offsetLeft - (el.clientWidth - sel.offsetWidth) / 2;
  }

  /* ---------------- Fase 1: Registro ---------------- */
  function renderRegistro(el) {
    const tm = myTeam(), tr = TRAPS[tm.trap];
    const saved = teamMembers(st(), TEAM);
    let rows = store.get('reg_' + TEAM, null) || (saved.length ? saved.map(m => ({ name: m.name, role: m.role })) : Array.from({ length: tm.size }, () => ({ name: '', role: '' })));
    el.innerHTML = `
      <div class="card glow">
        <h2>${t('reg.title')}</h2><p class="mut">${t('reg.intro')}</p>
        <div id="rows"></div>
        <button class="btn ghost sm" id="addRow">${t('reg.add')}</button>
        <p class="mut small">${t('reg.three')}</p>
        <button class="btn block" id="saveReg">${t('reg.save')}</button>
        <div class="msg" id="regMsg"></div>
      </div>
      <div class="card alt">
        <div class="grid g2">
          <div><div class="mut small">${t('team.input')}</div><h3>${esc(tm.input)}</h3><div class="mut small">${tm.renewable ? '♻️ Recurso renovable' : '⛔ Recurso no renovable'}</div></div>
          <div><div class="mut small">${t('team.trap')}</div><h3>${tr.emoji} ${esc(tr.name)}</h3><div class="mut small">${esc(tr.desc)}</div></div>
        </div>
      </div>
      <div class="card"><h3>${t('reg.rolesTitle')}</h3>
        <div class="grid g2">${ROLES.map(r => `<div><b>${r.emoji} ${esc(r.name)}</b><div class="mut small">${esc(r.desc)}</div></div>`).join('')}</div>
      </div>`;
    const box = $('#rows', el);
    const draw = () => {
      box.innerHTML = rows.map((r, i) => `<div class="member">
          <input type="text" data-i="${i}" data-k="name" value="${esc(r.name)}" placeholder="${t('reg.name')}" autocomplete="off" maxlength="60">
          <select data-i="${i}" data-k="role"><option value="">${t('reg.choose')}</option>${ROLES.map(x => `<option value="${x.id}" ${x.id === r.role ? 'selected' : ''}>${x.emoji} ${esc(x.name)}</option>`).join('')}</select>
          <button class="btn sec sm" data-del="${i}" title="${t('reg.remove')}" ${rows.length <= 2 ? 'disabled' : ''}>✕</button>
        </div>`).join('');
      $('#addRow', el).disabled = rows.length >= 5;
      $$('[data-k]', box).forEach(inp => inp.oninput = inp.onchange = () => { rows[inp.dataset.i][inp.dataset.k] = inp.value; store.set('reg_' + TEAM, rows); });
      $$('[data-del]', box).forEach(b => b.onclick = () => { rows.splice(+b.dataset.del, 1); store.set('reg_' + TEAM, rows); draw(); });
    };
    draw();
    $('#addRow', el).onclick = () => { if (rows.length < 5) { rows.push({ name: '', role: '' }); draw(); } };
    $('#saveReg', el).onclick = e => {
      const ms = rows.filter(r => r.name.trim());
      act(e.currentTarget, $('#regMsg', el), 'registerTeam', { members: ms }, t('reg.done'));
    };
    return () => {
      const n = teamMembers(st(), TEAM).length, m = $('#regMsg', el);
      if (n && m && !m.textContent) { m.className = 'msg ok'; m.textContent = t('reg.done') + ` (${n})`; }
    };
  }

  /* ---------------- Fase 2: El apagón ---------------- */
  function renderApagon(el) {
    const c = ctrl();
    const my = store.get('hook_' + TEAM, null);
    let html = `<div class="card glow"><h2>${t('apagon.title')}</h2>${hookCard(c.hookRevealed, my)}`;
    if (c.hookRevealed) {
      const ok = my === HOOK.answer;
      html += `<div class="card ${ok ? 'glow' : 'warn'}" style="margin-bottom:0"><h3>${my ? (ok ? t('apagon.right', { p: POINTS.hook }) : t('apagon.wrong')) : ''}</h3><p>${esc(HOOK.reveal)}</p></div>`;
    } else {
      html += `<div class="msg" id="hookMsg"></div>`;
    }
    el.innerHTML = html + '</div>';
    if (!c.hookRevealed) $$('.opt', el).forEach(b => b.onclick = async () => {
      store.set('hook_' + TEAM, b.dataset.o);
      $$('.opt', el).forEach(x => x.classList.toggle('on', x === b));
      await act(null, $('#hookMsg', el), 'vote', { kind: 'apagon', pick: b.dataset.o }, t('apagon.voted', { v: b.dataset.o }));
    });
    return () => {
      const m = $('#hookMsg', el), mine = store.get('hook_' + TEAM, null);
      const sent = (st().votes || []).some(v => v.kind === 'apagon' && v.team === TEAM);
      if (m && mine && sent && !m.textContent) { m.className = 'msg ok'; m.textContent = t('apagon.voted', { v: mine }); }
    };
  }

  /* ---------------- Fase 3: Taller de montaje ---------------- */
  function poolFor(tm) {
    const ids = tm.chain.map(x => x[0]).concat(tm.decoys);
    let seed = tm.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return ids;
  }
  function renderTaller(el) {
    const tm = myTeam(), pool = poolFor(tm);
    const saved = teamChain(st(), TEAM);
    const d = store.get('chain_' + TEAM, null) || { chain: saved ? saved.chain.map(x => ({ c: x.c, e: x.e })) : [] };
    const persist = () => store.set('chain_' + TEAM, d);
    el.innerHTML = `
      <div class="card glow"><h2>${t('tal.title')}</h2><p>${t('tal.mission')}</p></div>
      <div class="card alt"><h3>${t('tal.pool')}</h3><div class="pool" id="pool"></div></div>
      <div class="card"><h3>${t('tal.chain')}</h3>
        <div class="srcrow">${t('tal.start')}: <b>${esc(tm.input)}</b></div>
        <div id="chain"></div>
        <div class="srcrow">${t('tal.end')}</div>
      </div>
      <button class="btn block big" id="sendChain">${t('tal.send')}</button>
      <div class="msg" id="chainMsg"></div>
      <div id="chainRes"></div>`;
    const draw = () => {
      const used = d.chain.map(x => x.c);
      $('#pool', el).innerHTML = pool.filter(id => !used.includes(id)).map(id => {
        const cp = COMPONENTS[id];
        return `<div class="piece"><button class="btn sec pc" data-add="${id}">${cp.emoji} ${esc(cp.name)}</button>
          <details><summary>${t('tal.info')}</summary><span class="mut small">${esc(cp.desc)}</span></details></div>`;
      }).join('') || '<span class="mut small">—</span>';
      $('#chain', el).innerHTML = d.chain.length ? d.chain.map((x, i) => {
        const cp = COMPONENTS[x.c];
        return `<div class="link"><div class="lhead"><span class="num">${i + 1}</span><b>${cp.emoji} ${esc(cp.name)}</b>
            <span class="lbtns"><button class="btn sec sm" data-up="${i}" ${i === 0 ? 'disabled' : ''}>▲</button><button class="btn sec sm" data-dn="${i}" ${i === d.chain.length - 1 ? 'disabled' : ''}>▼</button><button class="btn sec sm" data-rm="${i}">✕</button></span></div>
          <select data-e="${i}"><option value="">${t('tal.choose')}</option>${Object.entries(TRANSF).map(([k, v]) => `<option value="${k}" ${k === x.e ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>`;
      }).join('<div class="down">⬇</div>') : `<p class="mut small">${t('tal.empty')}</p>`;
      $$('[data-add]', el).forEach(b => b.onclick = () => { d.chain.push({ c: b.dataset.add, e: '' }); persist(); draw(); });
      $$('[data-rm]', el).forEach(b => b.onclick = () => { d.chain.splice(+b.dataset.rm, 1); persist(); draw(); });
      $$('[data-up]', el).forEach(b => b.onclick = () => { const i = +b.dataset.up; [d.chain[i - 1], d.chain[i]] = [d.chain[i], d.chain[i - 1]]; persist(); draw(); });
      $$('[data-dn]', el).forEach(b => b.onclick = () => { const i = +b.dataset.dn; [d.chain[i + 1], d.chain[i]] = [d.chain[i], d.chain[i + 1]]; persist(); draw(); });
      $$('[data-e]', el).forEach(s => s.onchange = () => { d.chain[+s.dataset.e].e = s.value; persist(); });
    };
    draw();
    $('#sendChain', el).onclick = e => {
      const m = $('#chainMsg', el);
      if (d.chain.length < 2) { m.className = 'msg err'; m.textContent = t('err.chain'); return; }
      if (d.chain.some(x => !x.e)) { m.className = 'msg err'; m.textContent = t('err.energy'); return; }
      act(e.currentTarget, m, 'submitChain', { chain: d.chain }, t('common.saved'));
    };
    let lastRes = '';
    return () => {
      const rec = teamChain(st(), TEAM), box = $('#chainRes', el);
      if (!box) return;
      let html = '';
      if (rec) {
        const r = evalChain(TEAM, rec.chain);
        html = `<div class="card ${r.perfect ? 'glow' : 'warn'}">
          <div class="mut small">${t('tal.attempt', { n: rec.attempts })}</div>
          <h3>${r.perfect ? t('tal.lit') : t('tal.notyet')}</h3>
          <p class="big-num">${t('tal.result', { pos: r.pos, en: r.en, n: r.n })}</p>
          ${chainDiagram(TEAM, rec.chain)}
          <div class="mut small" style="margin-top:8px">+${tallerPoints(TEAM, rec)} ${t('common.pts')}</div></div>`;
      }
      if (html !== lastRes) { lastRes = html; box.innerHTML = html; }
    };
  }

  /* ---------------- Fase 4: Sabotaje (ficha técnica) ---------------- */
  function renderFicha(el) {
    const tm = myTeam(), tr = TRAPS[tm.trap];
    const saved = teamFacts(st(), TEAM);
    let d = store.get('facts_' + TEAM, null);
    if (!d) d = { fake: null, items: [0, 1].map(i => Object.assign({ title: '', text: '', source: '' }, saved[i] ? { title: saved[i].title, text: saved[i].text, source: saved[i].source } : {})) };
    const q = encodeURIComponent(tm.name.toLowerCase() + ' ' + tm.ideas.split(',')[0] + ' dato curioso');
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
      <div id="editors"></div>
      <div class="card warn small">⚠️ ${t('fic.rules')}</div>
      <button class="btn block big" id="saveFacts">${t('fic.save')}</button>
      <div class="msg" id="factsMsg"></div>`;
    const box = $('#editors', el);
    const persist = () => store.set('facts_' + TEAM, d);
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
      const flip = Math.random() < 0.5;
      const items = d.items.map((n, i) => Object.assign({}, n, { slot: (i === 0) !== flip ? 'A' : 'B', isFake: i === d.fake }));
      act(e.currentTarget, msg, 'submitFacts', { items }, t('fic.done'));
    };
    return () => {
      const c = ctrl(), locked = c.target === TEAM || (c.revealed || []).includes(TEAM);
      const b = $('#saveFacts', el); if (b) b.disabled = locked;
      const m = $('#factsMsg', el);
      if (m && locked) { m.className = 'msg err'; m.textContent = t('err.locked'); }
      else if (m && !m.textContent && teamFacts(st(), TEAM).length === 2) { m.className = 'msg ok'; m.textContent = t('fic.done'); }
    };
  }

  /* ---------------- Fase 5: Inspección ---------------- */
  function renderInspeccion(el) {
    const s = st(), c = s.control, target = c.target, revealed = c.revealed || [];
    const rounds = inspectionRounds(s);
    const hist = rounds.length ? `<div class="card"><h3>${t('ins.history')}</h3><div class="row">${rounds.map(r => {
      const tm = teamById(r.target);
      const mark = r.target === TEAM ? `🕵️ ${r.fooled.length}` : (r.caught.includes(TEAM) ? '🛡️' : (r.fooled.includes(TEAM) ? '⚡' : '—'));
      return `<span class="chip">${tm.emoji} ${esc(tm.name)} · ${mark}</span>`;
    }).join('')}</div></div>` : '';

    if (!target) { el.innerHTML = `<div class="card glow"><h2>${t('ins.title')}</h2><p>${t('ins.wait')}</p></div>${hist}`; return; }
    const tm = teamById(target), facts = teamFacts(s, target), isRev = revealed.includes(target);
    const fakeSlot = (facts.find(n => n.isFake === true) || {}).slot;
    const cards = facts.length ? `<div class="pair">${facts.map(n => factCard(n, { kicker: tm.name, verdict: isRev ? (n.slot === fakeSlot ? 'fake' : 'real') : '' })).join('')}</div>` : `<p class="mut">${t('ins.noFacts')}</p>`;
    const head = `<div class="card glow"><div class="mut small">${t('ins.on')}</div><h2>${tm.emoji} ${esc(tm.name)}</h2><div class="mut small">${esc(tm.input)}</div></div>`;

    if (target === TEAM) {
      const r = rounds.find(x => x.target === TEAM);
      el.innerHTML = head + `<div class="card warn"><h3>${isRev && r ? t('ins.fooled', { n: r.fooled.length }) : t('ins.own')}</h3></div>` + cards + hist;
      return;
    }
    if (isRev) {
      const mine = (s.votes || []).find(v => v.kind === 'inspeccion' && v.team === TEAM && v.target === target);
      const ok = mine && mine.pick === fakeSlot;
      el.innerHTML = head + `<div class="card ${ok ? 'glow' : 'warn'}"><h3>${ok ? t('ins.right', { p: POINTS.detected }) : t('ins.wrong', { v: fakeSlot })}</h3></div>` + cards + hist;
      return;
    }
    const dk = 'vote_' + TEAM + '_' + target;
    const d = store.get(dk, { pick: '', clues: [], why: '' });
    el.innerHTML = head + cards + `
      <div class="card glow">
        <h3>${t('ins.which')}</h3>
        <div class="choice"><button class="btn big sec ${d.pick === 'A' ? 'on' : ''}" data-pick="A">🕵️ A</button><button class="btn big sec ${d.pick === 'B' ? 'on' : ''}" data-pick="B">🕵️ B</button></div>
        <label>${t('ins.clues')}</label>
        <div class="crit">${CLUES.map(cr => `<label class="${d.clues.includes(cr.id) ? 'on' : ''}"><input type="checkbox" value="${cr.id}" ${d.clues.includes(cr.id) ? 'checked' : ''}><span>${cr.emoji} ${esc(cr.name)}<small>${esc(cr.q)}</small></span></label>`).join('')}</div>
        <label>${t('ins.why')}</label><textarea id="why" maxlength="400">${esc(d.why)}</textarea>
        <button class="btn block big" id="sendVote" style="margin-top:12px">${t('ins.send')}</button>
        <div class="msg" id="voteMsg"></div>
      </div>` + hist;
    const save = () => store.set(dk, d);
    $$('[data-pick]', el).forEach(b => b.onclick = () => { d.pick = b.dataset.pick; save(); $$('[data-pick]', el).forEach(x => x.classList.toggle('on', x === b)); });
    $$('.crit input', el).forEach(cb => cb.onchange = () => { d.clues = $$('.crit input:checked', el).map(x => x.value); cb.parentElement.classList.toggle('on', cb.checked); save(); });
    $('#why', el).oninput = e => { d.why = e.target.value; save(); };
    $('#sendVote', el).onclick = e => {
      const m = $('#voteMsg', el);
      if (!d.pick) { m.className = 'msg err'; m.textContent = t('err.pick'); return; }
      act(e.currentTarget, m, 'vote', { kind: 'inspeccion', target, pick: d.pick, clues: d.clues, why: d.why }, t('ins.sent', { v: d.pick }));
    };
    return () => {
      const m = $('#voteMsg', el);
      const sent = (st().votes || []).some(v => v.kind === 'inspeccion' && v.team === TEAM && v.target === target);
      if (m && sent && !m.textContent && d.pick) { m.className = 'msg ok'; m.textContent = t('ins.sent', { v: d.pick }); }
    };
  }

  /* ---------------- Fase 6: Consejo energético ---------------- */
  function renderConsejo(el) {
    const c = ctrl(), i = Math.min(c.dilemma || 0, DILEMMAS.length - 1), dl = DILEMMAS[i];
    el.innerHTML = `<div class="card glow"><h2>${t('con.title')}</h2><p class="mut">${t('con.intro')}</p>
      <span class="chip acc">${t('tv.dilemma', { n: i + 1, m: DILEMMAS.length })} · ${esc(dl.tag)}</span>
      <p class="big-q" style="font-size:22px">${esc(dl.text)}</p>
      <div class="grid g3">${['si', 'no', 'depende'].map(s => `<button class="btn big sec" data-side="${s}">${{ si: '👍', no: '👎', depende: '🤔' }[s]} ${t('con.' + s)}</button>`).join('')}</div>
      <div class="msg" id="conMsg"></div></div>`;
    $$('[data-side]', el).forEach(b => b.onclick = () => act(null, $('#conMsg', el), 'dilemmaVote', { dilemma: i, side: b.dataset.side }, t('con.voted', { v: t('con.' + b.dataset.side) })));
    return () => {
      const mine = (st().dilemmas || []).find(x => x.team === TEAM && Number(x.dilemma) === i);
      $$('[data-side]', el).forEach(b => b.classList.toggle('on', !!mine && mine.side === b.dataset.side));
      const m = $('#conMsg', el); if (mine && m && !m.textContent) { m.className = 'msg ok'; m.textContent = t('con.voted', { v: t('con.' + mine.side) }); }
    };
  }

  /* ---------------- Fase 7: Cierre y certificado ---------------- */
  function renderCierre(el) {
    const s = st(), tm = myTeam(), members = teamMembers(s, TEAM);
    const sc = computeScores(s)[TEAM];
    if (!members.length) { el.innerHTML = `<div class="card warn">${t('cier.noMembers')}</div>`; return; }
    const d = store.get('exit_' + TEAM, { name: '', a1: '', a2: '' });
    el.innerHTML = `
      <div class="card"><h2>${t('cier.title')}</h2><h3>${t('cier.score')}</h3><div class="score" id="scoreBox">${scoreRows(sc)}</div></div>
      <div class="card glow">
        <label>${t('cier.who')}</label>
        <select id="who"><option value="">${t('cier.chooseName')}</option>${members.map(m => `<option ${m.name === d.name ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>
        <label>${t('cier.q1')}</label><textarea id="a1" maxlength="400">${esc(d.a1)}</textarea>
        <label>${t('cier.q2')}</label><textarea id="a2" maxlength="400">${esc(d.a2)}</textarea>
        <button class="btn block big" id="sendExit" style="margin-top:12px">${t('cier.send')}</button>
        <div class="msg" id="exitMsg"></div>
      </div>
      <div id="certBox" class="card hidden">
        <canvas id="certCanvas"></canvas>
        <div class="row" style="margin-top:12px"><button class="btn" id="dl">${t('cier.download')}</button><button class="btn sec" id="pr">${t('cier.print')}</button></div>
      </div>`;
    const sv = () => store.set('exit_' + TEAM, d);
    $('#who', el).onchange = e => { d.name = e.target.value; sv(); };
    $('#a1', el).oninput = e => { d.a1 = e.target.value; sv(); };
    $('#a2', el).oninput = e => { d.a2 = e.target.value; sv(); };
    const showCert = async () => {
      const m = members.find(x => x.name === d.name); if (!m) return;
      const date = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
      const box = $('#certBox', el); box.classList.remove('hidden');
      const cv = $('#certCanvas', el);
      await Cert.draw(cv, {
        name: m.name, role: (roleById(m.role) || {}).name || '', team: tm.name, emoji: tm.emoji, date,
        points: computeScores(st())[TEAM].total, code: Cert.code(m.name + '|' + TEAM + '|' + new Date().toDateString())
      });
      $('#dl', el).onclick = () => Cert.download(cv, m.name);
      $('#pr', el).onclick = () => Cert.print(cv);
      box.scrollIntoView({ behavior: 'smooth' });
    };
    $('#sendExit', el).onclick = async e => {
      const m = $('#exitMsg', el);
      if (!d.name || !d.a1.trim() || !d.a2.trim()) { m.className = 'msg err'; m.textContent = t('err.empty'); return; }
      if (await act(e.currentTarget, m, 'exitTicket', { name: d.name, a1: d.a1, a2: d.a2 })) showCert();
    };
    return () => { const b = $('#scoreBox', el); if (b) b.innerHTML = scoreRows(computeScores(st())[TEAM]); };
  }

  const RENDER = { registro: renderRegistro, apagon: renderApagon, taller: renderTaller, ficha: renderFicha, inspeccion: renderInspeccion, consejo: renderConsejo, cierre: renderCierre };

  /* Clave de re-render: cambia solo cuando cambia la estructura de la vista
     (así no se borra lo que el estudiante está escribiendo) */
  function viewKey() {
    const s = st(), c = s.control;
    if (!TEAM) return 'home|' + TEAMS.map(x => teamMembers(s, x.id).length).join(',');
    let k = TEAM + '|' + VIEW + '|' + unlocked(VIEW);
    if (VIEW === 'apagon') k += '|' + c.hookRevealed;
    if (VIEW === 'inspeccion') k += '|' + c.target + '|' + (c.revealed || []).join(',') + '|' + teamFacts(s, c.target).map(n => n.title).join('');
    if (VIEW === 'consejo') k += '|' + c.dilemma;
    if (VIEW === 'cierre') k += '|' + teamMembers(s, TEAM).map(m => m.name).join(',');
    return k;
  }

  function render(force) {
    const c = ctrl();
    if (TEAM) {
      if (lastPhase !== c.phase) { VIEW = c.phase; lastPhase = c.phase; }
      if (!VIEW) VIEW = c.phase;
    }
    const key = viewKey();
    if (!force && key === lastKey) { paintSteps(); if (live) live(); return; }
    lastKey = key; live = null;
    if (!TEAM) { renderHome(); return; }
    main.innerHTML = headHTML();
    $('#changeTeam').onclick = () => { TEAM = null; store.del('team'); render(true); };
    paintSteps();
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
