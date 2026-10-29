/* =========================================================
   APAGÓN · Núcleo de datos compartido
   Este mismo código corre en el navegador (modo local) y en
   Google Apps Script (modo en vivo). build-gs.sh lo copia a Code.gs.
   ========================================================= */
var ApagonCore = (function () {
  var TEAM_IDS = ['termica', 'hidraulica', 'nuclear', 'eolica', 'solar', 'biomasa'];
  var ROLE_IDS = ['jefe', 'tecnico', 'investigador', 'inspector'];
  var PHASE_IDS = ['registro', 'apagon', 'taller', 'ficha', 'inspeccion', 'consejo', 'cierre'];
  var CLUE_IDS = ['medio', 'orden', 'energia', 'renovable', 'ambiente', 'cifra', 'contexto'];

  function emptyDb() {
    return {
      control: { phase: 'registro', target: '', revealed: [], dilemma: 0, hookRevealed: false, updated: '' },
      members: [], chains: [], facts: [], votes: [], dilemmas: [], exits: [], bonus: []
    };
  }
  function line(v, max) { return (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim().slice(0, max || 200); }
  function para(v, max) { return (v == null ? '' : String(v)).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, max || 1000); }
  function now() { return new Date().toISOString(); }
  function fail(m) { return { ok: false, error: m }; }
  function has(arr, v) { return arr.indexOf(v) >= 0; }
  function upsert(list, match, obj) {
    for (var i = 0; i < list.length; i++) { if (match(list[i])) { list[i] = obj; return; } }
    list.push(obj);
  }
  function id(v) { v = String(v || ''); return /^[a-z_]{1,24}$/.test(v) ? v : ''; }

  function apply(db, action, p, pin) {
    p = p || {};
    var c = db.control;
    var teacherActions = ['setControl', 'reveal', 'unreveal', 'bonus', 'reset'];
    if (has(teacherActions, action)) {
      if (String(p.pin || '') !== String(pin)) return fail('pin');
    } else if (!has(TEAM_IDS, p.team)) {
      return fail('team');
    }
    var team = p.team;

    switch (action) {
      case 'registerTeam': {
        var ms = (p.members || []).map(function (m) {
          return { team: team, name: line(m.name, 60), role: has(ROLE_IDS, m.role) ? m.role : '', ts: now() };
        }).filter(function (m) { return m.name.length >= 3; });
        if (ms.length < 2 || ms.length > 5) return fail('members');
        if (ms.some(function (m) { return !m.role; })) return fail('role');
        db.members = db.members.filter(function (m) { return m.team !== team; }).concat(ms);
        return { ok: true, changed: ['members'] };
      }
      case 'submitChain': {
        var ch = (p.chain || []).slice(0, 8).map(function (x) { return { c: id(x && x.c), e: id(x && x.e) }; })
          .filter(function (x) { return x.c; });
        if (ch.length < 2) return fail('chain');
        if (ch.some(function (x) { return !x.e; })) return fail('energy');
        var prev = null;
        db.chains.forEach(function (r) { if (r.team === team) prev = r; });
        var rec = { team: team, chain: ch, attempts: (prev ? Number(prev.attempts) || 0 : 0) + 1, ts: now() };
        upsert(db.chains, function (r) { return r.team === team; }, rec);
        return { ok: true, changed: ['chains'] };
      }
      case 'submitFacts': {
        if (c.target === team || has(c.revealed, team)) return fail('locked');
        var items = (p.items || []).slice(0, 2).map(function (n) {
          return {
            team: team, slot: n.slot === 'B' ? 'B' : 'A',
            title: line(n.title, 160), text: para(n.text, 400), source: line(n.source, 300),
            isFake: n.isFake === true, ts: now()
          };
        });
        if (items.length !== 2 || items[0].slot === items[1].slot) return fail('items');
        if (items.filter(function (n) { return n.isFake; }).length !== 1) return fail('fake');
        if (items.some(function (n) { return !n.title || !n.text; })) return fail('empty');
        db.facts = db.facts.filter(function (n) { return n.team !== team; }).concat(items);
        return { ok: true, changed: ['facts'] };
      }
      case 'vote': {
        var kind = p.kind === 'apagon' ? 'apagon' : 'inspeccion';
        var v = { kind: kind, team: team, target: '', pick: '', clues: [], why: '', ts: now() };
        if (kind === 'apagon') {
          if (c.hookRevealed) return fail('locked');
          if (!has(['A', 'B', 'C', 'D'], p.pick)) return fail('pick');
          v.target = 'hook'; v.pick = p.pick;
        } else {
          if (!has(TEAM_IDS, p.target) || p.target === team) return fail('target');
          if (has(c.revealed, p.target)) return fail('locked');
          if (p.pick !== 'A' && p.pick !== 'B') return fail('pick');
          v.target = p.target; v.pick = p.pick;
          v.clues = (p.clues || []).filter(function (x) { return has(CLUE_IDS, x); });
          v.why = para(p.why, 400);
        }
        upsert(db.votes, function (x) { return x.kind === v.kind && x.team === team && x.target === v.target; }, v);
        return { ok: true, changed: ['votes'] };
      }
      case 'dilemmaVote': {
        var d = { team: team, dilemma: Math.max(0, Math.min(9, parseInt(p.dilemma, 10) || 0)),
                  side: has(['si', 'no', 'depende'], p.side) ? p.side : 'depende', ts: now() };
        upsert(db.dilemmas, function (y) { return y.team === team && Number(y.dilemma) === d.dilemma; }, d);
        return { ok: true, changed: ['dilemmas'] };
      }
      case 'exitTicket': {
        var e = { team: team, name: line(p.name, 60), a1: para(p.a1, 400), a2: para(p.a2, 400), ts: now() };
        if (!e.name || !e.a1 || !e.a2) return fail('empty');
        upsert(db.exits, function (y) { return y.team === team && y.name === e.name; }, e);
        return { ok: true, changed: ['exits'] };
      }
      case 'setControl': {
        if (p.phase != null) { if (!has(PHASE_IDS, p.phase)) return fail('phase'); c.phase = p.phase; }
        if (p.target != null) { if (p.target !== '' && !has(TEAM_IDS, p.target)) return fail('target'); c.target = p.target; }
        if (p.dilemma != null) c.dilemma = Math.max(0, Math.min(9, parseInt(p.dilemma, 10) || 0));
        c.updated = now();
        return { ok: true, changed: ['control'] };
      }
      case 'reveal': {
        if (p.target === 'hook') c.hookRevealed = true;
        else if (has(TEAM_IDS, p.target) && !has(c.revealed, p.target)) c.revealed.push(p.target);
        c.updated = now();
        return { ok: true, changed: ['control'] };
      }
      case 'unreveal': {
        if (p.target === 'hook') c.hookRevealed = false;
        else c.revealed = c.revealed.filter(function (t) { return t !== p.target; });
        c.updated = now();
        return { ok: true, changed: ['control'] };
      }
      case 'bonus': {
        if (!has(TEAM_IDS, p.team)) return fail('team');
        var pts = Math.max(-200, Math.min(200, parseInt(p.points, 10) || 0));
        if (!pts) return fail('points');
        db.bonus.push({ team: p.team, points: pts, reason: line(p.reason, 100), ts: now() });
        return { ok: true, changed: ['bonus'] };
      }
      case 'reset': {
        var fresh = emptyDb();
        for (var k in fresh) db[k] = fresh[k];
        return { ok: true, changed: ['control', 'members', 'chains', 'facts', 'votes', 'dilemmas', 'exits', 'bonus'] };
      }
    }
    return fail('action');
  }

  /* Oculta lo secreto hasta que el docente lo revela en la TV */
  function publicState(db) {
    var s = JSON.parse(JSON.stringify(db));
    var rev = s.control.revealed || [];
    s.facts.forEach(function (n) { if (!has(rev, n.team)) delete n.isFake; });
    s.votes.forEach(function (v) {
      var hidden = v.kind === 'apagon' ? !s.control.hookRevealed : !has(rev, v.target);
      if (hidden) { delete v.pick; delete v.clues; delete v.why; }
    });
    s.serverTime = now();
    return s;
  }

  return { apply: apply, publicState: publicState, emptyDb: emptyDb };
})();
