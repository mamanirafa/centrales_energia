/* =========================================================
   APAGÓN EN USHUAIA · Centrales de generación — Contenidos
   Editá este archivo para cambiar centrales, piezas, preguntas o puntajes.
   ========================================================= */

/* who: 'todos' = responde cada estudiante · 'tecnico'/'investigador' = envía ese rol por el equipo */
const PHASES = [
  { id: 'registro',   icon: '🪪', min: 5,  name: 'Registro',           who: 'todos' },
  { id: 'apagon',     icon: '🚨', min: 12, name: 'El apagón',          who: 'todos' },
  { id: 'taller',     icon: '🛠️', min: 15, name: 'Taller de montaje',  who: 'tecnico' },
  { id: 'ficha',      icon: '🕵️', min: 10, name: 'Sabotaje',           who: 'investigador' },
  { id: 'inspeccion', icon: '🔍', min: 20, name: 'Inspección',         who: 'todos' },
  { id: 'consejo',    icon: '⚖️', min: 12, name: 'Consejo energético', who: 'todos' },
  { id: 'cierre',     icon: '🏅', min: 6,  name: 'Certificado',        who: 'todos' }
];

const MAX_MEMBERS = 6;

/* Medios técnicos (piezas que se arman en el taller) */
const COMPONENTS = {
  caldera:            { emoji: '🔥', name: 'Caldera', desc: 'Quema el combustible. Con ese calor, el agua hierve y se convierte en vapor.' },
  turbina_vapor:      { emoji: '🌀', name: 'Turbina de vapor', desc: 'El vapor sale con fuerza, empuja sus paletas y la hace girar.' },
  generador:          { emoji: '⚡', name: 'Generador', desc: 'Tiene imanes y bobinas de cobre. Cuando su eje gira, produce electricidad.' },
  transformador:      { emoji: '🔌', name: 'Transformador', desc: 'Sube la tensión de la electricidad para que pueda viajar lejos por las torres de transmisión.' },
  represa:            { emoji: '🧱', name: 'Represa y embalse', desc: 'Un muro gigante que frena el río y junta mucha agua en altura.' },
  tuberia:            { emoji: '🚰', name: 'Tubería forzada', desc: 'Un caño grande por donde el agua baja y toma mucha velocidad.' },
  turbina_hidraulica: { emoji: '💧', name: 'Turbina hidráulica', desc: 'El agua que baja choca contra sus paletas y la hace girar.' },
  reactor:            { emoji: '☢️', name: 'Reactor nuclear', desc: 'Adentro, los átomos de uranio se parten (fisión) y producen muchísimo calor.' },
  gen_vapor:          { emoji: '♨️', name: 'Intercambiador de calor', desc: 'El agua muy caliente del reactor calienta otra agua y la convierte en vapor, sin mezclarse.' },
  rotor:              { emoji: '🌬️', name: 'Aspas (palas) y rotor', desc: 'El viento empuja las aspas y las hace girar.' },
  multiplicadora:     { emoji: '⚙️', name: 'Caja multiplicadora', desc: 'Engranajes que hacen que el eje gire mucho más rápido.' },
  paneles:            { emoji: '☀️', name: 'Paneles solares', desc: 'Sus celdas de silicio transforman la luz del sol en electricidad (corriente continua).' },
  baterias:           { emoji: '🔋', name: 'Baterías', desc: 'Guardan electricidad para usarla más tarde.' },
  inversor:           { emoji: '🔁', name: 'Inversor', desc: 'Cambia la corriente continua por corriente alterna, la que usamos en casa.' },
  biodigestor:        { emoji: '🛢️', name: 'Biodigestor', desc: 'Tanque cerrado donde la basura orgánica se descompone, sin aire, y produce biogás.' },
  gasometro:          { emoji: '🎈', name: 'Gasómetro', desc: 'Depósito donde se junta y se guarda el biogás.' },
  motor:              { emoji: '🔧', name: 'Motor a biogás', desc: 'Quema el biogás y con eso hace girar un eje.' }
};

/* Transformaciones de energía (se elige una por pieza) */
const TRANSF = {
  qt:  'Química → Térmica (al quemarse, da calor)',
  nt:  'Nuclear → Térmica (el uranio se parte y da calor)',
  tt:  'Térmica → Térmica (el calor pasa al agua y se forma vapor)',
  tm:  'Térmica → Mecánica (el vapor hace girar)',
  pot: 'Guarda energía potencial (agua en altura)',
  pc:  'Potencial → Cinética (el agua cae y toma velocidad)',
  cm:  'Cinética → Mecánica (el agua o el viento hacen girar)',
  mm:  'Mecánica → Mecánica (gira más rápido)',
  me:  'Mecánica → Eléctrica (el giro produce electricidad)',
  up:  'Eléctrica → Eléctrica (sube la tensión para viajar lejos)',
  re:  'Lumínica → Eléctrica (la luz se vuelve electricidad)',
  ca:  'Eléctrica → Eléctrica (de continua a alterna)',
  bq:  'Química → Química (la basura orgánica forma biogás)',
  aq:  'Guarda energía química (junta el biogás)',
  qm:  'Química → Mecánica (el motor quema biogás y gira)'
};

/* Tipos de sabotaje: cómo arma cada equipo su dato TRAMPA */
const TRAPS = {
  orden:    { emoji: '🔄', name: 'Orden cambiado', desc: 'Cambien de lugar dos pasos del proceso.',
              ej: 'Ejemplo: “En la central de biomasa, primero se quema el biogás y después se guarda la basura en el biodigestor”.' },
  energia:  { emoji: '⚡', name: 'Energía equivocada', desc: 'Digan que una pieza transforma una energía que no le corresponde.',
              ej: 'Ejemplo: “En la central nuclear, el reactor transforma la energía nuclear directamente en eléctrica”.' },
  intrusa:  { emoji: '🧩', name: 'Pieza intrusa', desc: 'Agreguen una pieza que es de otra central.',
              ej: 'Ejemplo: “Los paneles solares tienen un generador que gira para producir electricidad”.' },
  cifra:    { emoji: '🔢', name: 'Número exagerado', desc: 'Exageren un número: tamaño, cantidad de casas, velocidad.',
              ej: 'Ejemplo: “Un solo aerogenerador alcanza para darle luz a toda la provincia”.' },
  ambiente: { emoji: '🌍', name: 'Ambiente engañoso', desc: 'Digan que no contamina o que es renovable cuando no lo es (o al revés).',
              ej: 'Ejemplo: “Las centrales térmicas no largan humo ni gases al aire”.' },
  contexto: { emoji: '📍', name: 'Lugar equivocado', desc: 'Usen un dato real de otro lugar como si fuera de Ushuaia.',
              ej: 'Ejemplo: “Ushuaia recibe su electricidad de la represa de El Chocón, en Neuquén”.' }
};

/* 6 centrales → 6 equipos (se asignan por sorteo) */
const TEAMS = [
  { id: 'termica', emoji: '🔥', color: '#fb923c', size: 6, trap: 'ambiente', renewable: false,
    name: 'Central Térmica', input: '⛽ Gas natural (o carbón, o petróleo)',
    chain: [['caldera', 'qt'], ['turbina_vapor', 'tm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['tuberia', 'paneles'],
    ideas: 'cómo funciona una central térmica, combustibles fósiles, contaminación, central de Ushuaia' },
  { id: 'hidraulica', emoji: '💧', color: '#38bdf8', size: 6, trap: 'contexto', renewable: true,
    name: 'Central Hidráulica', input: '🏞️ Agua de un río',
    chain: [['represa', 'pot'], ['tuberia', 'pc'], ['turbina_hidraulica', 'cm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['caldera', 'multiplicadora'],
    ideas: 'represas de Argentina, El Chocón, Yacyretá, cómo funciona una represa' },
  { id: 'nuclear', emoji: '☢️', color: '#a3e635', size: 6, trap: 'energia', renewable: false,
    name: 'Central Nuclear', input: '🪨 Uranio',
    chain: [['reactor', 'nt'], ['gen_vapor', 'tt'], ['turbina_vapor', 'tm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['represa', 'inversor'],
    ideas: 'Atucha, central nuclear Embalse, CAREM, cómo funciona una central nuclear, residuos' },
  { id: 'eolica', emoji: '🌬️', color: '#5eead4', size: 6, trap: 'cifra', renewable: true,
    name: 'Central Eólica', input: '💨 Viento',
    chain: [['rotor', 'cm'], ['multiplicadora', 'mm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['turbina_hidraulica', 'baterias'],
    ideas: 'parques eólicos de la Patagonia, partes de un aerogenerador, viento en Tierra del Fuego' },
  { id: 'solar', emoji: '☀️', color: '#facc15', size: 6, trap: 'intrusa', renewable: true,
    name: 'Central Solar', input: '🌞 Luz del sol',
    chain: [['paneles', 're'], ['inversor', 'ca'], ['transformador', 'up']],
    decoys: ['generador', 'rotor'],
    ideas: 'Parque Solar Cauchari (Jujuy), cómo funciona un panel solar, horas de sol en Ushuaia' },
  { id: 'biomasa', emoji: '🌱', color: '#c084fc', size: 6, trap: 'orden', renewable: true,
    name: 'Central de Biomasa', input: '🍂 Basura orgánica (restos de comida, estiércol)',
    chain: [['biodigestor', 'bq'], ['gasometro', 'aq'], ['motor', 'qm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['reactor', 'paneles'],
    ideas: 'qué es un biodigestor, biogás, INTA biodigestores, residuos orgánicos' }
];

/* Roles: se pueden repetir dentro del equipo (hasta 6 integrantes) */
const ROLES = [
  { id: 'jefe', emoji: '🎤', name: 'Jefe/a de central', desc: 'Organiza al equipo y lee en voz alta la ficha en la Inspección.' },
  { id: 'tecnico', emoji: '🛠️', name: 'Técnico/a de montaje', desc: 'Envía la cadena de piezas del equipo en el Taller.' },
  { id: 'investigador', emoji: '📚', name: 'Investigador/a', desc: 'Busca datos y envía la ficha del Sabotaje.' },
  { id: 'inspector', emoji: '🔍', name: 'Inspector/a', desc: 'Guía al equipo para descubrir las trampas de las otras centrales.' }
];

/* Conceptos para justificar la inspección */
const CONCEPTS = [
  { id: 'medio',     emoji: '⚙️', name: 'Medio técnico', q: '¿Esa pieza es de esta central?' },
  { id: 'orden',     emoji: '🔄', name: 'Orden del proceso', q: '¿Los pasos están en orden?' },
  { id: 'energia',   emoji: '⚡', name: 'Transformación de energía', q: '¿Esa pieza transforma esa energía?' },
  { id: 'fuente',    emoji: '🌞', name: 'Fuente o recurso', q: '¿Ese es el recurso que usa la central?' },
  { id: 'renovable', emoji: '♻️', name: 'Renovable o no renovable', q: '¿El recurso se acaba o se renueva?' },
  { id: 'ambiente',  emoji: '🌍', name: 'Impacto ambiental', q: '¿Contamina o no?' },
  { id: 'cifra',     emoji: '🔢', name: 'Números y medidas', q: '¿El número es creíble?' },
  { id: 'contexto',  emoji: '📍', name: 'Lugar', q: '¿Es de Ushuaia o de otro lugar?' }
];

const SOURCES = ['material de lectura de clase', 'Carpeta técnica', 'Educ.ar', 'Secretaría de Energía', 'INTA', 'Gobierno de Tierra del Fuego'];

/* Fase 2 · El apagón: preguntas (se responden de a una, cada estudiante) */
const QUIZ = [
  { tag: 'Ushuaia', story: true,
    q: '¿De dónde sale la electricidad que llega a tu casa en Ushuaia?',
    opts: { A: 'Llega por cables desde las represas del norte del país', B: 'De una central térmica de la ciudad que quema gas', C: 'De un parque eólico en el Canal Beagle', D: 'De paneles solares en los techos de la ciudad' },
    ans: 'B', why: 'Tierra del Fuego no está conectada a la red eléctrica del resto del país. Ushuaia fabrica su propia electricidad en una central térmica que quema gas natural. Si esa central se detiene, la ciudad se apaga.' },
  { tag: 'Fuente o tipo',
    q: '¿Cuál de estas es una FUENTE de energía (un recurso de la naturaleza)?',
    opts: { A: 'La energía cinética', B: 'El viento', C: 'La energía térmica', D: 'La energía eléctrica' },
    ans: 'B', why: 'La fuente es el recurso de donde sacamos la energía: el viento, el sol, el agua, el gas. Cinética, térmica y eléctrica son TIPOS (formas) de energía.' },
  { tag: 'Fuente o tipo',
    q: '¿Cuál de estas es un TIPO (forma) de energía?',
    opts: { A: 'El sol', B: 'El petróleo', C: 'La energía lumínica', D: 'El uranio' },
    ans: 'C', why: 'La energía lumínica es una forma de energía (la luz). El sol, el petróleo y el uranio son fuentes: recursos que tienen energía guardada.' },
  { tag: 'Tipos de energía',
    q: 'El viento es aire en movimiento. ¿Qué tipo de energía tiene?',
    opts: { A: 'Química', B: 'Cinética', C: 'Nuclear', D: 'Lumínica' },
    ans: 'B', why: 'Todo lo que se mueve tiene energía cinética. Las aspas del aerogenerador la aprovechan para girar.' },
  { tag: 'Tipos de energía',
    q: 'El gas natural y el biogás tienen energía guardada que se libera al quemarlos. ¿Qué tipo de energía es?',
    opts: { A: 'Química', B: 'Potencial', C: 'Lumínica', D: 'Eléctrica' },
    ans: 'A', why: 'Los combustibles guardan energía química. Al quemarlos, se transforma en energía térmica (calor).' },
  { tag: 'Recursos',
    q: '¿Qué recurso usa una central hidráulica?',
    opts: { A: 'Agua de un río acumulada en altura', B: 'Gas natural', C: 'Uranio', D: 'Basura orgánica' },
    ans: 'A', why: 'La represa junta el agua del río en altura (energía potencial). Al bajar, el agua mueve la turbina.' },
  { tag: 'Recursos',
    q: '¿Qué recurso usa una central nuclear?',
    opts: { A: 'Carbón', B: 'Uranio', C: 'Viento', D: 'Biogás' },
    ans: 'B', why: 'En el reactor, los átomos de uranio se parten (fisión) y liberan muchísimo calor.' },
  { tag: 'Recursos',
    q: '¿Qué recurso usa una central de biomasa con biodigestor?',
    opts: { A: 'Luz del sol', B: 'Restos de comida y estiércol', C: 'Petróleo', D: 'Agua de mar' },
    ans: 'B', why: 'En el biodigestor, la basura orgánica se descompone sin aire y produce biogás, que después se quema.' },
  { tag: 'Renovables',
    q: '¿Cuál de estos recursos es NO renovable?',
    opts: { A: 'El viento', B: 'El sol', C: 'El gas natural', D: 'El agua de un río' },
    ans: 'C', why: 'El gas natural tardó millones de años en formarse y se acaba. El viento, el sol y el agua de los ríos se renuevan.' },
  { tag: 'Medios técnicos',
    q: 'Casi todas las centrales tienen una pieza que transforma la energía mecánica (el giro) en eléctrica. ¿Cuál es?',
    opts: { A: 'El transformador', B: 'El generador', C: 'La caldera', D: 'El inversor' },
    ans: 'B', why: 'El generador tiene imanes y bobinas: cuando su eje gira, produce electricidad. La central solar es la excepción: no tiene nada que gire.' }
];

/* Fase 6 · Consejo energético: afirmaciones para debatir y votar (tienen respuesta correcta) */
const COUNCIL = [
  { tag: 'Eólica', text: 'Si Ushuaia cambiara toda su central térmica por molinos de viento, nunca más tendría cortes de luz.',
    ans: 'no', why: 'El viento no sopla siempre con la misma fuerza. Haría falta otra central de respaldo o una forma de guardar la energía.' },
  { tag: 'Hidráulica', text: 'Una represa usa un recurso renovable, pero igual puede dañar el ambiente.',
    ans: 'si', why: 'El agua se renueva, pero el embalse inunda bosques y cambia la vida del río y de los animales.' },
  { tag: 'Nuclear', text: 'Una central nuclear no larga humo, pero sus residuos son peligrosos durante muchísimos años.',
    ans: 'si', why: 'No emite gases al quemar, porque no quema nada. Pero los residuos radiactivos hay que guardarlos con mucho cuidado por siglos.' },
  { tag: 'Biomasa', text: 'Un biodigestor sirve para producir energía y, además, ayuda a reducir la basura orgánica.',
    ans: 'si', why: 'Aprovecha restos de comida y estiércol que irían a la basura y los convierte en biogás. También deja un abono para la tierra.' },
  { tag: 'Solar', text: 'En Ushuaia no sirve poner paneles solares porque en invierno hay pocas horas de sol.',
    ans: 'no', why: 'En invierno hay poco sol, pero en verano hay días muy largos. Los paneles se pueden combinar con otras centrales.' },
  { tag: 'Térmica', text: 'La central térmica a gas es renovable porque el gas sale de la naturaleza.',
    ans: 'no', why: 'Que salga de la naturaleza no lo hace renovable: el gas tarda millones de años en formarse y se acaba.' }
];

/* Puntaje individual */
const POINTS = {
  quiz: 10,        // respuesta correcta en El apagón
  miss: -5,        // pregunta sin responder (apagón, inspección, consejo)
  piece: 10,       // taller: pieza en su lugar (1.er envío, para cada integrante)
  energy: 5,       // taller: transformación correcta (1.er envío)
  perfect: 30,     // taller: cadena perfecta al 1.er envío
  detected: 20,    // inspección: descubrió la trampa
  concept: 5,      // inspección: además marcó conceptos y explicó
  fooled: 3,       // sabotaje: por cada estudiante engañado (para cada integrante del equipo)
  council: 10,     // consejo: postura correcta
  depends: -5      // consejo: eligió "Depende"
};

function teamById(id) { return TEAMS.find(t => t.id === id); }
function roleById(id) { return ROLES.find(r => r.id === id); }
function teamChain(st, team) { return ((st && st.chains) || []).find(c => c.t === team) || null; }
function memberBySid(st, sid) { return ((st && st.members) || []).find(m => m.s === sid) || null; }

/* Evalúa una cadena y explica cada error */
function evalChain(team, chain) {
  const tm = teamById(team), sol = tm.chain, want = {};
  sol.forEach(([c, e]) => want[c] = e);
  chain = chain || [];
  let pos = 0, en = 0;
  const rows = chain.map((x, i) => {
    const intruder = !want[x.c];
    const posOk = !!sol[i] && sol[i][0] === x.c;
    const enOk = !intruder && want[x.c] === x.e;
    if (posOk) pos++;
    if (enOk) en++;
    return { c: x.c, e: x.e, intruder, posOk, enOk, rightE: want[x.c] || '', rightPos: sol.findIndex(s => s[0] === x.c) };
  });
  const used = chain.map(x => x.c);
  const missing = sol.filter(([c]) => !used.includes(c)).map(([c]) => c);
  const perfect = chain.length === sol.length && pos === sol.length && en === sol.length;
  return { pos, en, n: sol.length, rows, missing, perfect };
}

function tallerPoints(team, rec) {
  if (!rec || !rec.first) return 0;
  const r = evalChain(team, rec.first);
  return r.pos * POINTS.piece + r.en * POINTS.energy + (r.perfect ? POINTS.perfect : 0);
}
function isLit(st, team) { const r = teamChain(st, team); return !!r && evalChain(team, r.last).perfect; }

function findAnswer(st, k, i, sid) { return ((st && st.answers) || []).find(a => a.k === k && a.i === String(i) && a.s === sid) || null; }

/* Puntaje de cada estudiante y promedio por equipo */
function computeScores(st) {
  const S = {}, T = {};
  TEAMS.forEach(t => T[t.id] = { sum: 0, n: 0, avg: 0, lit: false });
  if (!st) return { students: S, teams: T };
  const c = st.control || {}, revTs = c.revTs || {};
  const members = st.members || [];
  members.forEach(m => S[m.s] = { sid: m.s, name: m.n, team: m.t, role: m.r, quiz: 0, taller: 0, ins: 0, fooled: 0, council: 0, bonus: 0, total: 0, misses: 0 });
  const before = (m, key) => !revTs[key] || m.ts <= revTs[key];

  (c.qRev || []).forEach(qi => {
    const q = QUIZ[qi]; if (!q) return;
    members.forEach(m => {
      if (!before(m, 'q' + qi)) return;
      const a = findAnswer(st, 'q', qi, m.s);
      if (!a) { S[m.s].quiz += POINTS.miss; S[m.s].misses++; }
      else if (a.p === q.ans) S[m.s].quiz += POINTS.quiz;
    });
  });

  const fakeSlot = {};
  (st.facts || []).forEach(n => { if (n.isFake === true) fakeSlot[n.t] = n.slot; });
  (c.revealed || []).forEach(target => {
    if (!fakeSlot[target]) return;
    let fooled = 0;
    members.forEach(m => {
      if (m.t === target || !before(m, 'i:' + target)) return;
      const a = findAnswer(st, 'i', target, m.s);
      if (!a) { S[m.s].ins += POINTS.miss; S[m.s].misses++; }
      else if (a.p === fakeSlot[target]) S[m.s].ins += POINTS.detected + ((a.c || []).length >= 1 && (a.w || '').trim().length >= 10 ? POINTS.concept : 0);
      else fooled++;
    });
    members.forEach(m => { if (m.t === target) S[m.s].fooled += fooled * POINTS.fooled; });
  });

  (c.dRev || []).forEach(di => {
    const d = COUNCIL[di]; if (!d) return;
    members.forEach(m => {
      if (!before(m, 'c' + di)) return;
      const a = findAnswer(st, 'c', di, m.s);
      if (!a) { S[m.s].council += POINTS.miss; S[m.s].misses++; }
      else if (a.p === 'depende') S[m.s].council += POINTS.depends;
      else if (a.p === d.ans) S[m.s].council += POINTS.council;
    });
  });

  (st.chains || []).forEach(r => { const p = tallerPoints(r.t, r); members.forEach(m => { if (m.t === r.t) S[m.s].taller = p; }); });
  (st.bonus || []).forEach(b => members.forEach(m => { if (m.t === b.t) S[m.s].bonus += Number(b.p) || 0; }));

  Object.values(S).forEach(s => {
    s.total = s.quiz + s.taller + s.ins + s.fooled + s.council + s.bonus;
    if (T[s.team]) { T[s.team].sum += s.total; T[s.team].n++; }
  });
  Object.keys(T).forEach(k => { T[k].avg = T[k].n ? Math.round(T[k].sum / T[k].n) : 0; T[k].lit = isLit(st, k); });
  return { students: S, teams: T };
}

/* Rondas de inspección reveladas */
function inspectionRounds(st) {
  if (!st) return [];
  const c = st.control || {};
  const fakeSlot = {};
  (st.facts || []).forEach(n => { if (n.isFake === true) fakeSlot[n.t] = n.slot; });
  return (c.revealed || []).map(target => {
    const ans = (st.answers || []).filter(a => a.k === 'i' && a.i === target);
    return { target, fake: fakeSlot[target], fooled: ans.filter(a => a.p !== fakeSlot[target]).length, caught: ans.filter(a => a.p === fakeSlot[target]).length, total: ans.length };
  });
}
