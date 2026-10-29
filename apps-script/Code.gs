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

/* =========================================================
   APAGÓN EN USHUAIA · Backend en Google Apps Script
   ---------------------------------------------------------
   1. Creá una Hoja de cálculo de Google nueva (ej.: "Apagón 2.º año").
   2. Extensiones → Apps Script. Borrá todo y pegá ESTE archivo completo.
   3. Cambiá TEACHER_PIN si querés (y el mismo PIN en js/config.js).
   4. Implementar → Nueva implementación → Tipo: Aplicación web
        · Ejecutar como: Yo
        · Quién tiene acceso: Cualquier usuario
   5. Copiá la URL que termina en /exec y pegala en js/config.js (scriptUrl).
   Cada pestaña de la hoja guarda un registro: Integrantes, Taller,
   Fichas, Votos, Dilemas, Salida, Bonus y Control.
   ========================================================= */
var TEACHER_PIN = '2026';

var TABLES = {
  members:  { sheet: 'Integrantes', cols: [['team', 'Central'], ['name', 'Nombre y apellido'], ['role', 'Rol'], ['ts', 'Fecha']] },
  chains:   { sheet: 'Taller',      cols: [['team', 'Central'], ['chain', 'Cadena armada'], ['attempts', 'Intentos'], ['ts', 'Fecha']] },
  facts:    { sheet: 'Fichas',      cols: [['team', 'Central'], ['slot', 'Letra'], ['title', 'Afirmación'], ['text', 'Explicación'], ['source', 'Fuente'], ['isFake', 'Es trampa'], ['ts', 'Fecha']] },
  votes:    { sheet: 'Votos',       cols: [['kind', 'Tipo'], ['team', 'Central que vota'], ['target', 'Objetivo'], ['pick', 'Elección'], ['clues', 'Pistas'], ['why', 'Justificación'], ['ts', 'Fecha']] },
  dilemmas: { sheet: 'Dilemas',     cols: [['team', 'Central'], ['dilemma', 'Dilema (0-4)'], ['side', 'Postura'], ['ts', 'Fecha']] },
  exits:    { sheet: 'Salida',      cols: [['team', 'Central'], ['name', 'Estudiante'], ['a1', 'Medio técnico más importante'], ['a2', 'Central para Ushuaia'], ['ts', 'Fecha']] },
  bonus:    { sheet: 'Bonus',       cols: [['team', 'Central'], ['points', 'Puntos'], ['reason', 'Motivo'], ['ts', 'Fecha']] }
};
var BOOL = { isFake: 1 };
var LIST = { clues: 1 };
var NUM = { dilemma: 1, points: 1, attempts: 1 };
var JSONF = { chain: 1 };
var CACHE_KEY = 'apagon_centrales_state_v1';

/* Funciona pegado en una Hoja (script vinculado) o como proyecto
   independiente en script.google.com: en ese caso crea la hoja sola. */
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

function readTable_(key) {
  var def = TABLES[key];
  var sh = sheet_(def.sheet, def.cols.map(function (c) { return c[1]; }));
  var n = sh.getLastRow() - 1;
  if (n < 1) return [];
  var vals = sh.getRange(2, 1, n, def.cols.length).getValues();
  return vals.filter(function (r) { return String(r[0]) !== ''; }).map(function (r) {
    var o = {};
    def.cols.forEach(function (c, i) {
      var v = r[i], k = c[0];
      if (v instanceof Date) v = v.toISOString();
      if (BOOL[k]) v = (v === true || String(v).toUpperCase() === 'TRUE' || String(v).toUpperCase() === 'SÍ');
      else if (LIST[k]) v = String(v) ? String(v).split(/\s*,\s*/) : [];
      else if (JSONF[k]) { try { v = JSON.parse(String(v) || '[]'); } catch (e) { v = []; } }
      else if (NUM[k]) v = Number(v) || 0;
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

function writeTable_(key, rows) {
  var def = TABLES[key];
  var sh = sheet_(def.sheet, def.cols.map(function (c) { return c[1]; }));
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, def.cols.length).clearContent();
  if (!rows.length) return;
  var data = rows.map(function (o) { return def.cols.map(function (c) { return cell_(o[c[0]], c[0]); }); });
  var rg = sh.getRange(2, 1, data.length, def.cols.length);
  rg.setNumberFormat('@');
  rg.setValues(data);
}

function readControl_() {
  var sh = sheet_('Control', ['Clave', 'Valor']);
  var c = ApagonCore.emptyDb().control;
  var n = sh.getLastRow() - 1;
  if (n > 0) sh.getRange(2, 1, n, 2).getValues().forEach(function (r) {
    try { c[r[0]] = JSON.parse(r[1]); } catch (e) {}
  });
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

function loadDb_() {
  var db = { control: readControl_() };
  Object.keys(TABLES).forEach(function (k) { db[k] = readTable_(k); });
  return db;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function stateJson_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(CACHE_KEY);
  if (hit) return hit;
  var s = JSON.stringify(ApagonCore.publicState(loadDb_()));
  try { cache.put(CACHE_KEY, s, 5); } catch (e) {}
  return s;
}

function doGet(e) {
  return ContentService.createTextOutput(stateJson_()).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var db = loadDb_();
    var res = ApagonCore.apply(db, p.action, p, TEACHER_PIN);
    if (res.ok) {
      res.changed.forEach(function (k) { if (k === 'control') writeControl_(db.control); else writeTable_(k, db[k]); });
      SpreadsheetApp.flush();
      var s = JSON.stringify(ApagonCore.publicState(db));
      try { CacheService.getScriptCache().put(CACHE_KEY, s, 5); } catch (e2) {}
    }
    return json_(res);
  } catch (err) {
    return json_({ ok: false, error: 'server', detail: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e3) {}
  }
}

/* Ejecutá esta función una vez desde el editor para crear todas las pestañas. */
function setup() {
  writeControl_(ApagonCore.emptyDb().control);
  Object.keys(TABLES).forEach(function (k) { readTable_(k); });
  var hoja1 = ss_().getSheetByName('Hoja 1') || ss_().getSheetByName('Sheet1');
  if (hoja1 && ss_().getSheets().length > 1 && hoja1.getLastRow() === 0) ss_().deleteSheet(hoja1);
  Logger.log('Hoja de registro: ' + ss_().getUrl());
}
