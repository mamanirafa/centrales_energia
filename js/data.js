/* =========================================================
   APAGÓN EN USHUAIA · Centrales de generación — Contenidos
   Editá este archivo para cambiar centrales, piezas, dilemas o puntajes.
   ========================================================= */

const PHASES = [
  { id: 'registro',   icon: '🪪', min: 5,  name: 'Registro' },
  { id: 'apagon',     icon: '🚨', min: 6,  name: 'El apagón' },
  { id: 'taller',     icon: '🛠️', min: 18, name: 'Taller de montaje' },
  { id: 'ficha',      icon: '🕵️', min: 12, name: 'Sabotaje' },
  { id: 'inspeccion', icon: '🔍', min: 22, name: 'Inspección' },
  { id: 'consejo',    icon: '⚖️', min: 12, name: 'Consejo energético' },
  { id: 'cierre',     icon: '🏅', min: 5,  name: 'Certificado' }
];

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
  { id: 'termica', emoji: '🔥', color: '#fb923c', size: 5, trap: 'ambiente', renewable: false,
    name: 'Central Térmica', input: '⛽ Gas natural (o carbón, o petróleo)',
    chain: [['caldera', 'qt'], ['turbina_vapor', 'tm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['tuberia', 'paneles'],
    ideas: 'cómo funciona una central térmica, combustibles fósiles, contaminación, central de Ushuaia' },
  { id: 'hidraulica', emoji: '💧', color: '#38bdf8', size: 5, trap: 'contexto', renewable: true,
    name: 'Central Hidráulica', input: '🏞️ Agua de un río',
    chain: [['represa', 'pot'], ['tuberia', 'pc'], ['turbina_hidraulica', 'cm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['caldera', 'multiplicadora'],
    ideas: 'represas de Argentina, El Chocón, Yacyretá, cómo funciona una represa' },
  { id: 'nuclear', emoji: '☢️', color: '#a3e635', size: 5, trap: 'energia', renewable: false,
    name: 'Central Nuclear', input: '🪨 Uranio',
    chain: [['reactor', 'nt'], ['gen_vapor', 'tt'], ['turbina_vapor', 'tm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['represa', 'inversor'],
    ideas: 'Atucha, central nuclear Embalse, CAREM, cómo funciona una central nuclear, residuos' },
  { id: 'eolica', emoji: '🌬️', color: '#5eead4', size: 5, trap: 'cifra', renewable: true,
    name: 'Central Eólica', input: '💨 Viento',
    chain: [['rotor', 'cm'], ['multiplicadora', 'mm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['turbina_hidraulica', 'baterias'],
    ideas: 'parques eólicos de la Patagonia, partes de un aerogenerador, viento en Tierra del Fuego' },
  { id: 'solar', emoji: '☀️', color: '#facc15', size: 5, trap: 'intrusa', renewable: true,
    name: 'Central Solar', input: '🌞 Luz del sol',
    chain: [['paneles', 're'], ['inversor', 'ca'], ['transformador', 'up']],
    decoys: ['generador', 'rotor'],
    ideas: 'Parque Solar Cauchari (Jujuy), cómo funciona un panel solar, horas de sol en Ushuaia' },
  { id: 'biomasa', emoji: '🌱', color: '#c084fc', size: 5, trap: 'orden', renewable: true,
    name: 'Central de Biomasa', input: '🍂 Basura orgánica (restos de comida, estiércol)',
    chain: [['biodigestor', 'bq'], ['gasometro', 'aq'], ['motor', 'qm'], ['generador', 'me'], ['transformador', 'up']],
    decoys: ['reactor', 'paneles'],
    ideas: 'qué es un biodigestor, biogás, INTA biodigestores, residuos orgánicos' }
];

const ROLES = [
  { id: 'jefe', emoji: '🎤', name: 'Jefe/a de central', desc: 'Organiza al equipo y habla en voz alta frente a la clase.' },
  { id: 'tecnico', emoji: '🛠️', name: 'Técnico/a de montaje', desc: 'Arma la cadena de piezas en el taller y la envía.' },
  { id: 'investigador', emoji: '📚', name: 'Investigador/a', desc: 'Busca datos en el material de lectura o en internet y carga la ficha.' },
  { id: 'inspector', emoji: '🔍', name: 'Inspector/a', desc: 'Descubre las trampas de las otras centrales y envía la respuesta.' }
];

/* Pistas para justificar la inspección */
const CLUES = [
  { id: 'medio',     emoji: '⚙️', name: 'Pieza', q: '¿Esa pieza es de esta central?' },
  { id: 'orden',     emoji: '🔄', name: 'Orden', q: '¿Los pasos están en orden?' },
  { id: 'energia',   emoji: '⚡', name: 'Energía', q: '¿Esa pieza transforma esa energía?' },
  { id: 'renovable', emoji: '♻️', name: 'Renovable o no', q: '¿El recurso se acaba o se renueva?' },
  { id: 'ambiente',  emoji: '🌍', name: 'Ambiente', q: '¿Contamina o no?' },
  { id: 'cifra',     emoji: '🔢', name: 'Número', q: '¿El número es creíble?' },
  { id: 'contexto',  emoji: '📍', name: 'Lugar', q: '¿Es de Ushuaia o de otro lugar?' }
];

const SOURCES = ['material de lectura de clase', 'Carpeta técnica', 'Educ.ar', 'Secretaría de Energía', 'INTA', 'Gobierno de Tierra del Fuego'];

/* Gancho inicial: el apagón */
const HOOK = {
  kicker: 'ÚLTIMO MOMENTO · Ushuaia',
  title: 'Apagón total: Ushuaia quedó a oscuras',
  text: 'A las 17:42 se cortó la luz en toda la ciudad. Los semáforos se apagaron, el puerto se detuvo y los negocios cerraron. Para volver a encender Ushuaia, primero hay que saber de dónde viene su electricidad.',
  question: '¿De dónde sale la electricidad que llega a tu casa en Ushuaia?',
  options: {
    A: 'Llega por cables desde las represas del norte del país',
    B: 'De una central térmica de la ciudad que quema gas',
    C: 'De un parque eólico en el Canal Beagle',
    D: 'De paneles solares en los techos de la ciudad'
  },
  answer: 'B',
  reveal: 'Respuesta B. Tierra del Fuego no está conectada a la red eléctrica del resto del país. Ushuaia fabrica su propia electricidad en una central térmica que quema gas natural. Si esa central se detiene, la ciudad se apaga. (Tranquilos: este apagón es un simulacro.) Hoy cada equipo tiene una central para volver a encender Ushuaia.'
};

/* Dilemas del Consejo energético */
const DILEMMAS = [
  { tag: 'Térmica o eólica',
    text: 'Ushuaia hace casi toda su electricidad quemando gas. ¿Habría que cambiarla por molinos de viento, aunque el viento no sople todos los días?' },
  { tag: 'Hidráulica',
    text: 'Quieren hacer una represa en un río cerca de Ushuaia. Daría energía limpia, pero inundaría una parte del bosque. ¿Están de acuerdo?' },
  { tag: 'Nuclear',
    text: 'Ofrecen poner una central nuclear chica en Tierra del Fuego. No larga humo, pero deja residuos peligrosos que hay que guardar por muchísimos años. ¿La aceptarían?' },
  { tag: 'Biomasa',
    text: 'El municipio quiere un biodigestor que use la basura orgánica de la ciudad. Para que funcione, todas las familias tienen que separar la basura. ¿Están de acuerdo?' },
  { tag: 'Solar',
    text: 'En invierno, en Ushuaia hay muy pocas horas de sol. ¿Conviene igual poner paneles solares en los techos de las escuelas?' }
];

/* Puntaje */
const POINTS = { hook: 20, piece: 20, energy: 10, lit: 100, litStep: 20, litMin: 20, detected: 60, justified: 20, fooled: 60, dilemma: 10 };

function teamById(id) { return TEAMS.find(t => t.id === id); }
function roleById(id) { return ROLES.find(r => r.id === id); }
function teamChain(st, team) { return ((st && st.chains) || []).find(c => c.team === team) || null; }

/* Evalúa la cadena armada por un equipo */
function evalChain(team, chain) {
  const tm = teamById(team), sol = tm.chain, want = {};
  sol.forEach(([c, e]) => want[c] = e);
  chain = chain || [];
  let pos = 0, en = 0;
  chain.forEach((x, i) => {
    if (sol[i] && sol[i][0] === x.c) pos++;
    if (want[x.c] && want[x.c] === x.e) en++;
  });
  const perfect = chain.length === sol.length && pos === sol.length && en === sol.length;
  return { pos, en, n: sol.length, len: chain.length, perfect };
}

function tallerPoints(team, rec) {
  if (!rec) return 0;
  const r = evalChain(team, rec.chain);
  let p = r.pos * POINTS.piece + r.en * POINTS.energy;
  if (r.perfect) p += Math.max(POINTS.litMin, POINTS.lit - POINTS.litStep * (Math.max(1, rec.attempts) - 1));
  return p;
}

function isLit(st, team) { const r = teamChain(st, team); return !!r && evalChain(team, r.chain).perfect; }

function computeScores(st) {
  const out = {};
  TEAMS.forEach(t => out[t.id] = { total: 0, hook: 0, taller: 0, detected: 0, justified: 0, fooled: 0, dilemmas: 0, bonus: 0 });
  if (!st) return out;
  const c = st.control || {};
  const revealed = c.revealed || [];
  const fakeSlot = {};
  (st.facts || []).forEach(n => { if (n.isFake === true) fakeSlot[n.team] = n.slot; });
  (st.votes || []).forEach(v => {
    if (!out[v.team]) return;
    if (v.kind === 'apagon' && c.hookRevealed && v.pick === HOOK.answer) out[v.team].hook += POINTS.hook;
    if (v.kind === 'inspeccion' && revealed.indexOf(v.target) >= 0 && fakeSlot[v.target] && v.team !== v.target) {
      if (v.pick === fakeSlot[v.target]) {
        out[v.team].detected += POINTS.detected;
        if ((v.clues || []).length >= 1 && (v.why || '').length >= 15) out[v.team].justified += POINTS.justified;
      } else if (out[v.target]) {
        out[v.target].fooled += POINTS.fooled;
      }
    }
  });
  (st.chains || []).forEach(r => { if (out[r.team]) out[r.team].taller = tallerPoints(r.team, r); });
  (st.dilemmas || []).forEach(d => { if (out[d.team]) out[d.team].dilemmas += POINTS.dilemma; });
  (st.bonus || []).forEach(b => { if (out[b.team]) out[b.team].bonus += Number(b.points) || 0; });
  Object.values(out).forEach(o => o.total = o.hook + o.taller + o.detected + o.justified + o.fooled + o.dilemmas + o.bonus);
  return out;
}

/* Rondas de inspección reveladas: quién detectó y quién cayó en la trampa */
function inspectionRounds(st) {
  if (!st) return [];
  const c = st.control || {};
  const fakeSlot = {};
  (st.facts || []).forEach(n => { if (n.isFake === true) fakeSlot[n.team] = n.slot; });
  return (c.revealed || []).map(target => {
    const votes = (st.votes || []).filter(v => v.kind === 'inspeccion' && v.target === target && v.team !== target);
    const fooled = votes.filter(v => v.pick !== fakeSlot[target]).map(v => v.team);
    const caught = votes.filter(v => v.pick === fakeSlot[target]).map(v => v.team);
    return { target, fooled, caught, fake: fakeSlot[target] };
  });
}
