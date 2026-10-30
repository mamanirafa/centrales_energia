
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
