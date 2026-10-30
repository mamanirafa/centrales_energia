/* ARCHIVO GENERADO: pegá todo este contenido en Apps Script (Code.gs) */
/* =========================================================
   APAGÓN · Núcleo de datos compartido
   Este mismo código corre en el navegador (modo local) y en
   Google Apps Script (modo en vivo). build-gs.sh lo copia a Code.gs.
   ========================================================= */
var ApagonCore = (function () {
  var TEAM_IDS = ['termica', 'hidraulica', 'nuclear', 'eolica', 'solar', 'biomasa'];
  var ROLE_IDS = ['jefe', 'tecnico', 'investigador', 'inspector'];
  var PHASE_IDS = ['registro', 'apagon', 'taller', 'ficha', 'inspeccion', 'consejo', 'cierre'];
  var CONCEPT_IDS = ['medio', 'orden', 'energia', 'fuente', 'renovable', 'ambiente', 'cifra', 'contexto'];
  var MAX = 6;

  function emptyControl() {
    return { phase: 'registro', q: 0, qRev: [], target: '', revealed: [], dlg: 0, dRev: [], revTs: {},
             timer: { end: 0, left: 300, run: false }, updated: '' };
  }
  function emptyDb() {
    return { control: emptyControl(), members: [], answers: [], chains: [], facts: [], exits: [], bonus: [] };
  }
  function line(v, max) { return (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim().slice(0, max || 200); }
  function para(v, max) { return (v == null ? '' : String(v)).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, max || 1000); }
  function now() { return new Date().toISOString(); }
  function fail(m) { return { ok: false, error: m }; }
  function has(arr, v) { return arr.indexOf(v) >= 0; }
  function idx(list, match) { for (var i = 0; i < list.length; i++) if (match(list[i])) return i; return -1; }
  function upsert(list, match, obj) { var i = idx(list, match); if (i >= 0) { list[i] = obj; return i; } list.push(obj); return list.length - 1; }
  function id(v) { v = String(v || ''); return /^[a-z_]{1,24}$/.test(v) ? v : ''; }
  function sidOk(v) { return /^[a-z0-9]{6,16}$/.test(String(v || '')); }
  function num(v, lo, hi) { var n = parseInt(v, 10); if (isNaN(n)) n = lo; return Math.max(lo, Math.min(hi, n)); }
  function ok(changed, row, log) { var r = { ok: true, changed: changed }; if (row) r.row = row; if (log) r.log = log; return r; }

  function apply(db, action, p, pin) {
    p = p || {};
    var c = db.control;
    var teacherActions = ['setControl', 'reveal', 'unreveal', 'timer', 'bonus', 'kick', 'reset', 'saveScores'];
    var me = null;
    if (has(teacherActions, action)) {
      if (String(p.pin || '') !== String(pin)) return fail('pin');
    } else if (action !== 'join') {
      var mi = idx(db.members, function (m) { return m.s === p.sid; });
      if (mi < 0) return fail('nomember');
      me = db.members[mi];
    }

    switch (action) {
      case 'join': {
        if (!sidOk(p.sid)) return fail('sid');
        if (!has(TEAM_IDS, p.team)) return fail('team');
        var name = line(p.name, 60), role = has(ROLE_IDS, p.role) ? p.role : '';
        if (name.length < 3) return fail('name');
        if (!role) return fail('role');
        var others = db.members.filter(function (m) { return m.t === p.team && m.s !== p.sid; });
        if (others.length >= MAX) return fail('full');
        if (others.some(function (m) { return m.n.toLowerCase() === name.toLowerCase(); })) return fail('dupname');
        var prev = null; db.members.forEach(function (m) { if (m.s === p.sid) prev = m; });
        var rec = { s: p.sid, t: p.team, n: name, r: role, ts: prev ? prev.ts : now() };
        if (prev && prev.t !== p.team) {           // cambió de equipo: sus respuestas anteriores no cuentan
          rec.ts = now();
          db.answers = db.answers.filter(function (a) { return a.s !== p.sid; });
          db.members = db.members.filter(function (m) { return m.s !== p.sid; });
          db.members.push(rec);
          return ok(['members', 'answers'], null, { team: p.team, sid: p.sid, detail: 'Cambió a ' + p.team + ' · ' + role });
        }
        var r = upsert(db.members, function (m) { return m.s === p.sid; }, rec);
        return ok(['members'], { table: 'members', index: r }, { team: p.team, sid: p.sid, detail: name + ' · ' + role });
      }
      case 'answer': {
        var k = p.kind, key = String(p.key == null ? '' : p.key), a = { k: k, i: key, s: me.s, t: me.t, p: '', c: [], w: '', ts: now() };
        if (k === 'q') {
          if (c.phase !== 'apagon' || key !== String(c.q)) return fail('closed');
          if (has(c.qRev, Number(key))) return fail('locked');
          if (!has(['A', 'B', 'C', 'D'], p.pick)) return fail('pick');
        } else if (k === 'i') {
          if (c.phase !== 'inspeccion' || key !== c.target || !key) return fail('closed');
          if (key === me.t) return fail('own');
          if (has(c.revealed, key)) return fail('locked');
          if (p.pick !== 'A' && p.pick !== 'B') return fail('pick');
          a.c = (p.concepts || []).filter(function (x) { return has(CONCEPT_IDS, x); });
          a.w = para(p.why, 300);
        } else if (k === 'c') {
          if (c.phase !== 'consejo' || key !== String(c.dlg)) return fail('closed');
          if (has(c.dRev, Number(key))) return fail('locked');
          if (!has(['si', 'no', 'depende'], p.pick)) return fail('pick');
        } else return fail('kind');
        a.p = p.pick;
        var ai = upsert(db.answers, function (x) { return x.k === k && x.i === key && x.s === me.s; }, a);
        return ok(['answers'], { table: 'answers', index: ai }, { team: me.t, sid: me.s, detail: k + key + ' → ' + a.p + (a.c.length ? ' [' + a.c.join(', ') + ']' : '') + (a.w ? ' “' + a.w + '”' : '') });
      }
      case 'submitChain': {
        var hasTec = db.members.some(function (m) { return m.t === me.t && m.r === 'tecnico'; });
        if (hasTec && me.r !== 'tecnico') return fail('role_tecnico');
        var ch = (p.chain || []).slice(0, 8).map(function (x) { return { c: id(x && x.c), e: id(x && x.e) }; })
          .filter(function (x) { return x.c; });
        if (ch.length < 2) return fail('chain');
        if (ch.some(function (x) { return !x.e; })) return fail('energy');
        var old = null; db.chains.forEach(function (r) { if (r.t === me.t) old = r; });
        var cr = { t: me.t, first: old ? old.first : ch, last: ch, n: (old ? Number(old.n) || 0 : 0) + 1, ts: now() };
        var ci = upsert(db.chains, function (r) { return r.t === me.t; }, cr);
        return ok(['chains'], { table: 'chains', index: ci }, { team: me.t, sid: me.s, detail: 'Intento ' + cr.n + ': ' + ch.map(function (x) { return x.c + '(' + x.e + ')'; }).join(' → ') });
      }
      case 'submitFacts': {
        var hasInv = db.members.some(function (m) { return m.t === me.t && m.r === 'investigador'; });
        if (hasInv && me.r !== 'investigador') return fail('role_investigador');
        if (c.target === me.t || has(c.revealed, me.t)) return fail('locked');
        var items = (p.items || []).slice(0, 2).map(function (n) {
          return { t: me.t, slot: n.slot === 'B' ? 'B' : 'A', title: line(n.title, 160), text: para(n.text, 400), source: line(n.source, 300), isFake: n.isFake === true, ts: now() };
        });
        if (items.length !== 2 || items[0].slot === items[1].slot) return fail('items');
        if (items.filter(function (n) { return n.isFake; }).length !== 1) return fail('fake');
        if (items.some(function (n) { return !n.title || !n.text; })) return fail('empty');
        db.facts = db.facts.filter(function (n) { return n.t !== me.t; }).concat(items);
        return ok(['facts'], null, { team: me.t, sid: me.s, detail: items.map(function (n) { return n.slot + (n.isFake ? ' (TRAMPA)' : '') + ': ' + n.title; }).join(' | ') });
      }
      case 'exitTicket': {
        var e = { s: me.s, t: me.t, a1: para(p.a1, 400), a2: para(p.a2, 400), ts: now() };
        if (!e.a1 || !e.a2) return fail('empty');
        var ei = upsert(db.exits, function (y) { return y.s === me.s; }, e);
        return ok(['exits'], { table: 'exits', index: ei }, { team: me.t, sid: me.s, detail: 'Ticket de salida' });
      }
      case 'setControl': {
        if (p.phase != null) {
          if (!has(PHASE_IDS, p.phase)) return fail('phase');
          c.phase = p.phase;
          if (p.secs != null) c.timer = { end: 0, left: num(p.secs, 0, 7200), run: false };
        }
        if (p.target != null) { if (p.target !== '' && !has(TEAM_IDS, p.target)) return fail('target'); c.target = p.target; }
        if (p.q != null) c.q = num(p.q, 0, 49);
        if (p.dlg != null) c.dlg = num(p.dlg, 0, 49);
        c.updated = now();
        return ok(['control'], null, { detail: 'Control: ' + JSON.stringify({ phase: c.phase, q: c.q, target: c.target, dlg: c.dlg }) });
      }
      case 'reveal':
      case 'unreveal': {
        var kk = String(p.key || ''), on = action === 'reveal', m;
        if ((m = /^q(\d+)$/.exec(kk))) { var qn = Number(m[1]); c.qRev = c.qRev.filter(function (x) { return x !== qn; }); if (on) c.qRev.push(qn); }
        else if ((m = /^c(\d+)$/.exec(kk))) { var dn = Number(m[1]); c.dRev = c.dRev.filter(function (x) { return x !== dn; }); if (on) c.dRev.push(dn); }
        else if ((m = /^i:([a-z]+)$/.exec(kk)) && has(TEAM_IDS, m[1])) { var tt = m[1]; c.revealed = c.revealed.filter(function (x) { return x !== tt; }); if (on) c.revealed.push(tt); }
        else return fail('key');
        if (on) c.revTs[kk] = now(); else delete c.revTs[kk];
        c.updated = now();
        return ok(['control'], null, { detail: (on ? 'Reveló ' : 'Ocultó ') + kk });
      }
      case 'timer': {
        var ms = Date.now(), T = c.timer || { end: 0, left: 0, run: false };
        var left = T.run ? Math.max(0, (T.end - ms) / 1000) : Number(T.left) || 0;
        if (p.op === 'set') { left = num(p.secs, 0, 7200); T = { end: 0, left: left, run: false }; }
        else if (p.op === 'start') T = { end: ms + left * 1000, left: left, run: true };
        else if (p.op === 'pause') T = { end: 0, left: Math.round(left), run: false };
        else if (p.op === 'add') { left += num(p.secs, -600, 600); left = Math.max(0, left); T = T.run ? { end: ms + left * 1000, left: left, run: true } : { end: 0, left: left, run: false }; }
        else return fail('op');
        c.timer = T;
        return ok(['control']);
      }
      case 'bonus': {
        if (!has(TEAM_IDS, p.team)) return fail('team');
        var pts = num(p.points, -100, 100);
        if (!pts) return fail('points');
        db.bonus.push({ t: p.team, p: pts, reason: line(p.reason, 100), ts: now() });
        return ok(['bonus'], { table: 'bonus', index: db.bonus.length - 1 }, { team: p.team, detail: 'Bonus ' + pts });
      }
      case 'kick': {
        var who = db.members.filter(function (x) { return x.s === p.sid; })[0];
        if (!who) return fail('nomember');
        db.members = db.members.filter(function (x) { return x.s !== p.sid; });
        db.answers = db.answers.filter(function (x) { return x.s !== p.sid; });
        db.exits = db.exits.filter(function (x) { return x.s !== p.sid; });
        return ok(['members', 'answers', 'exits'], null, { team: who.t, detail: 'Docente quitó a ' + who.n });
      }
      case 'saveScores': return ok([], null, { detail: 'Guardó puntajes' });
      case 'reset': {
        var fresh = emptyDb();
        for (var kx in fresh) db[kx] = fresh[kx];
        return ok(['control', 'members', 'answers', 'chains', 'facts', 'exits', 'bonus'], null, { detail: 'Reinició la clase' });
      }
    }
    return fail('action');
  }

  /* Oculta lo secreto hasta que el docente lo revela en la TV */
  function publicState(db) {
    var s = JSON.parse(JSON.stringify(db));
    var c = s.control;
    s.facts.forEach(function (n) { if (!has(c.revealed || [], n.t)) delete n.isFake; delete n.ts; });
    s.answers.forEach(function (a) {
      var rev = a.k === 'q' ? has(c.qRev || [], Number(a.i)) : a.k === 'c' ? has(c.dRev || [], Number(a.i)) : has(c.revealed || [], a.i);
      if (!rev) { a.p = ''; a.c = []; a.w = ''; }
      delete a.ts;
    });
    s.exits = s.exits.map(function (e) { return { s: e.s, t: e.t }; });
    s.serverTime = now();
    s.serverMs = Date.now();
    return s;
  }

  return { apply: apply, publicState: publicState, emptyDb: emptyDb, emptyControl: emptyControl };
})();

/* =========================================================
   APAGÓN EN USHUAIA · Backend en Google Apps Script
   ---------------------------------------------------------
   1. Creá una Hoja de cálculo de Google nueva (ej.: "Apagón 2.º año").
   2. Extensiones → Apps Script. Borrá todo y pegá ESTE archivo completo.
   3. Ejecutá la función setup (menú de arriba) y autorizá.
   4. Implementar → Nueva implementación → Tipo: Aplicación web
        · Ejecutar como: Yo
        · Quién tiene acceso: Cualquier usuario
   5. Copiá la URL que termina en /exec y pegala en js/config.js (scriptUrl).
   Pestañas: Estudiantes, Respuestas, Taller, Fichas, Salida, Bonus,
   Registro (todas las interacciones), Puntajes (desde la TV) y Control.
   ========================================================= */
var TEACHER_PIN = '2026';

var TABLES = {
  members: { sheet: 'Estudiantes', cols: [['s', 'ID'], ['t', 'Central'], ['n', 'Nombre y apellido'], ['r', 'Rol'], ['ts', 'Ingreso']] },
  answers: { sheet: 'Respuestas',  cols: [['k', 'Fase (q=apagón, i=inspección, c=consejo)'], ['i', 'Pregunta / central'], ['s', 'ID estudiante'], ['t', 'Central'], ['p', 'Respuesta'], ['c', 'Conceptos'], ['w', 'Justificación'], ['ts', 'Fecha']] },
  chains:  { sheet: 'Taller',      cols: [['t', 'Central'], ['first', 'Primer envío (puntúa)'], ['last', 'Último envío'], ['n', 'Intentos'], ['ts', 'Fecha']] },
  facts:   { sheet: 'Fichas',      cols: [['t', 'Central'], ['slot', 'Letra'], ['title', 'Afirmación'], ['text', 'Desarrollo'], ['source', 'Fuente'], ['isFake', 'Es trampa'], ['ts', 'Fecha']] },
  exits:   { sheet: 'Salida',      cols: [['s', 'ID estudiante'], ['t', 'Central'], ['a1', 'Pieza más importante'], ['a2', 'Central para Ushuaia'], ['ts', 'Fecha']] },
  bonus:   { sheet: 'Bonus',       cols: [['t', 'Central'], ['p', 'Puntos'], ['reason', 'Motivo'], ['ts', 'Fecha']] }
};
var BOOL = { isFake: 1 };
var LIST = { c: 1 };
var NUM = { n: 1, p: 1 };
var JSONF = { first: 1, last: 1 };
var NUMTABLE = { bonus: 1, chains: 1 };   // en estas tablas 'p'/'n' son números
var CACHE_PREFIX = 'apagon_v2_';

function ss_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  ss = SpreadsheetApp.create('APAGÓN · Registro de clase');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function sheet_(name, headers) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#0b1f3a').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}
function tableSheet_(key) { var def = TABLES[key]; return sheet_(def.sheet, def.cols.map(function (c) { return c[1]; })); }

function readTable_(key) {
  var def = TABLES[key], sh = tableSheet_(key);
  var n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, def.cols.length).getValues().filter(function (r) { return String(r[0]) !== ''; }).map(function (r) {
    var o = {};
    def.cols.forEach(function (c, i) {
      var v = r[i], k = c[0];
      if (v instanceof Date) v = v.toISOString();
      if (BOOL[k]) v = (v === true || String(v).toUpperCase() === 'TRUE' || String(v).toUpperCase() === 'SÍ');
      else if (LIST[k]) v = String(v) ? String(v).split(/\s*,\s*/) : [];
      else if (JSONF[k]) { try { v = JSON.parse(String(v) || '[]'); } catch (e) { v = []; } }
      else if (NUM[k] && NUMTABLE[key]) v = Number(v) || 0;
      else v = String(v);
      o[k] = v;
    });
    return o;
  });
}

function cell_(v, k) {
  if (BOOL[k]) return v ? 'SÍ' : 'NO';
  if (LIST[k]) return (v || []).join(', ');
  if (JSONF[k]) return JSON.stringify(v || []);
  var s = v == null ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // evita fórmulas
  return s;
}
function rowOf_(key, o) { return TABLES[key].cols.map(function (c) { return cell_(o[c[0]], c[0]); }); }

function writeTable_(key, rows) {
  var def = TABLES[key], sh = tableSheet_(key);
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, def.cols.length).clearContent();
  if (!rows.length) return;
  var rg = sh.getRange(2, 1, rows.length, def.cols.length);
  rg.setNumberFormat('@');
  rg.setValues(rows.map(function (o) { return rowOf_(key, o); }));
}
function writeRow_(key, index, o) {
  var rg = tableSheet_(key).getRange(index + 2, 1, 1, TABLES[key].cols.length);
  rg.setNumberFormat('@');
  rg.setValues([rowOf_(key, o)]);
}

function readControl_() {
  var sh = sheet_('Control', ['Clave', 'Valor']);
  var c = ApagonCore.emptyControl();
  var n = sh.getLastRow() - 1;
  if (n > 0) sh.getRange(2, 1, n, 2).getValues().forEach(function (r) { try { c[r[0]] = JSON.parse(r[1]); } catch (e) {} });
  return c;
}
function writeControl_(c) {
  var sh = sheet_('Control', ['Clave', 'Valor']);
  var keys = Object.keys(c);
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, 2).clearContent();
  var rg = sh.getRange(2, 1, keys.length, 2);
  rg.setNumberFormat('@');
  rg.setValues(keys.map(function (k) { return [k, JSON.stringify(c[k])]; }));
}

/* ---------- Caché: la base completa vive en CacheService para responder rápido ---------- */
function cacheGet_() {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get(CACHE_PREFIX + 'n') || 0);
  if (!n) return null;
  var keys = []; for (var i = 0; i < n; i++) keys.push(CACHE_PREFIX + i);
  var got = cache.getAll(keys), s = '';
  for (var j = 0; j < n; j++) { if (got[keys[j]] == null) return null; s += got[keys[j]]; }
  try { return JSON.parse(s); } catch (e) { return null; }
}
function cachePut_(db) {
  var s = JSON.stringify(db), size = 90000, obj = {}, n = Math.ceil(s.length / size) || 1;
  for (var i = 0; i < n; i++) obj[CACHE_PREFIX + i] = s.substr(i * size, size);
  obj[CACHE_PREFIX + 'n'] = String(n);
  try { CacheService.getScriptCache().putAll(obj, 21600); } catch (e) {}
}
function loadDbFromSheets_() {
  var db = { control: readControl_() };
  Object.keys(TABLES).forEach(function (k) { db[k] = readTable_(k); });
  return db;
}
function loadDb_() { var db = cacheGet_(); if (!db) { db = loadDbFromSheets_(); cachePut_(db); } return db; }

/* ---------- Registro de interacciones ---------- */
function log_(db, action, p, res) {
  try {
    var sh = sheet_('Registro', ['Fecha', 'Acción', 'Central', 'Estudiante', 'Detalle']);
    var L = res.log || {}, name = '';
    var sid = L.sid || p.sid;
    if (sid) db.members.forEach(function (m) { if (m.s === sid) name = m.n; });
    sh.appendRow([new Date(), action, L.team || p.team || '', name, String(L.detail || '').slice(0, 500)]);
  } catch (e) {}
}

function savePuntajes_(rows, db) {
  var ex = {}; (db.exits || []).forEach(function (e) { ex[e.s] = e; });
  var head = ['Central', 'Estudiante', 'Rol', 'El apagón', 'Taller', 'Inspección', 'Sabotaje', 'Consejo', 'Bonus', 'Sin responder', 'TOTAL', 'Ticket: pieza', 'Ticket: central'];
  var sh = sheet_('Puntajes', head);
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, head.length).clearContent();
  var data = (rows || []).slice(0, 200).map(function (r) {
    r = (r || []).slice();
    var e = ex[r[13]]; if (e) { r[11] = e.a1; r[12] = e.a2; }
    var x = r.slice(0, head.length).map(function (v) { var s = v == null ? '' : v; if (typeof s === 'string' && /^[=+\-@]/.test(s)) s = "'" + s; return s; });
    while (x.length < head.length) x.push('');
    return x;
  });
  if (data.length) sh.getRange(2, 1, data.length, head.length).setValues(data);
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(CACHE_PREFIX + 'pub');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  var s = JSON.stringify(ApagonCore.publicState(loadDb_()));
  try { if (s.length < 95000) cache.put(CACHE_PREFIX + 'pub', s, 2); } catch (e2) {}
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var db = loadDb_();
    var res = ApagonCore.apply(db, p.action, p, TEACHER_PIN);
    if (res.ok) {
      res.changed.forEach(function (k) {
        if (k === 'control') writeControl_(db.control);
        else if (res.row && res.row.table === k) writeRow_(k, res.row.index, db[k][res.row.index]);
        else writeTable_(k, db[k]);
      });
      if (p.action === 'saveScores') savePuntajes_(p.rows, db);
      cachePut_(db);
      CacheService.getScriptCache().remove(CACHE_PREFIX + 'pub');
      if (p.action !== 'timer') log_(db, p.action, p, res);
    }
    delete res.log; delete res.row;
    return json_(res);
  } catch (err) {
    return json_({ ok: false, error: 'server', detail: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e3) {}
  }
}

/* Ejecutá esta función una vez desde el editor para crear todas las pestañas. */
function setup() {
  writeControl_(ApagonCore.emptyControl());
  Object.keys(TABLES).forEach(function (k) { readTable_(k); });
  sheet_('Registro', ['Fecha', 'Acción', 'Central', 'Estudiante', 'Detalle']);
  var hoja1 = ss_().getSheetByName('Hoja 1') || ss_().getSheetByName('Sheet1');
  if (hoja1 && ss_().getSheets().length > 1 && hoja1.getLastRow() === 0) ss_().deleteSheet(hoja1);
  cachePut_(loadDbFromSheets_());
  Logger.log('Hoja de registro: ' + ss_().getUrl());
}

/* Si editás la hoja a mano, ejecutá esto para que la app relea los datos. */
function limpiarCache() { cachePut_(loadDbFromSheets_()); CacheService.getScriptCache().remove(CACHE_PREFIX + 'pub'); }
