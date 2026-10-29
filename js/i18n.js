/* =========================================================
   Textos de la interfaz (solo español)
   ========================================================= */
const I18N = {
  es: {
    'app.subtitle': 'Centrales de generación',
    'app.tagline': 'Ushuaia se quedó sin luz. Cada equipo tiene una central eléctrica: armen sus piezas, descubran cómo cambia la energía en cada paso y vuelvan a encender la ciudad.',
    'mode.local': 'Modo local (demo)', 'mode.online': 'En vivo', 'mode.offline': 'Sin conexión, reintentando…',
    'home.choose': 'Elegí la central que le tocó a tu equipo', 'home.slots': 'hasta {n} integrantes', 'home.registered': '{n} registrados',
    'team.change': 'Cambiar equipo', 'team.input': 'Recurso', 'team.trap': 'Su sabotaje',
    'phase.locked': '🔒 Tu profe todavía no abrió esta fase.',
    'common.saved': '¡Guardado!', 'common.sending': 'Enviando…', 'common.pts': 'pts',
    'err.members': 'Carguen entre 2 y 5 integrantes con nombre y apellido.', 'err.role': 'Cada integrante necesita un rol.',
    'err.locked': 'Ya no se puede modificar: está en pantalla o ya se reveló.', 'err.fake': 'Marquen cuál de los dos datos es la TRAMPA.',
    'err.empty': 'Completen los campos obligatorios.', 'err.items': 'Faltan datos.', 'err.pin': 'PIN incorrecto.',
    'err.network': 'Sin conexión. Lo escrito queda guardado en este celu: prueben de nuevo.', 'err.generic': 'No se pudo guardar. Intenten de nuevo.',
    'err.target': 'Elegí otro equipo.', 'err.pick': 'Elijan una opción.',
    'err.chain': 'Agreguen al menos 2 piezas a la cadena.', 'err.energy': 'Cada pieza necesita su transformación de energía.',

    'reg.title': '🪪 Registro del equipo', 'reg.intro': 'Escriban el nombre completo de cada integrante y su rol (de 2 a 5 por equipo).',
    'reg.name': 'Nombre y apellido', 'reg.choose': 'Elegí un rol…', 'reg.add': '+ Agregar integrante', 'reg.remove': 'Quitar',
    'reg.save': 'Registrar equipo', 'reg.done': '✅ Equipo registrado', 'reg.rolesTitle': 'Los roles de la central',
    'reg.three': 'Si son 5, dos personas comparten un rol. Si son 3 (o 2), alguien cubre dos roles: elijan el principal.',

    'apagon.title': '🚨 Alerta en la TV', 'apagon.voted': 'Respuesta registrada: {v}. Esperen la revelación…',
    'apagon.right': '💡 ¡Correcto! +{p} pts', 'apagon.wrong': '🔦 No era esa… ¡A casi todo el mundo le pasa!',

    'tal.title': '🛠️ Taller de montaje',
    'tal.mission': 'Misión: armen en orden las piezas (medios técnicos) de su central, desde el recurso hasta la red. En cada pieza elijan cómo se transforma la energía. ¡Ojo! Hay 2 piezas intrusas que no son de su central.',
    'tal.pool': 'Piezas disponibles (tocá para agregar)', 'tal.chain': 'Su cadena', 'tal.empty': 'Todavía no agregaron piezas.',
    'tal.choose': 'Transformación de energía…', 'tal.start': 'Recurso', 'tal.end': '🗼 Torres de transmisión → Red de Ushuaia',
    'tal.send': '⚡ Probar encendido', 'tal.attempt': 'Intento {n}',
    'tal.result': '{pos} de {n} piezas en su lugar · {en} de {n} transformaciones correctas',
    'tal.lit': '💡 ¡Central encendida! Su barrio de Ushuaia ya tiene luz.',
    'tal.notyet': '🔧 Todavía no enciende. Revisen y prueben otra vez (cada intento de más da un poco menos de puntos).',
    'tal.info': 'ℹ️ ¿Qué hace?',

    'fic.title': '🕵️ Sabotaje',
    'fic.mission': 'Escriban 2 datos sobre su central: uno VERDADERO (búsquenlo en el material de lectura o en internet) y una TRAMPA (falso, pero que parezca cierto). Los otros equipos tienen que descubrir cuál es la trampa.',
    'fic.tip': 'Truco: el dato verdadero conviene que sorprenda; la trampa, que suene muy técnica.',
    'fic.howTrap': 'Cómo fabricar su trampa', 'fic.searchTitle': 'Buscar el dato verdadero',
    'fic.searchTip': 'Busquen un dato sorprendente pero real en fuentes confiables ({sources}).', 'fic.openSearch': 'Buscar en Google', 'fic.ideas': 'Ideas',
    'fic.item': 'Dato {n}', 'fic.headline': 'Afirmación (1 frase)', 'fic.body': 'Explicación (máx. 400 caracteres)', 'fic.source': 'Fuente o enlace',
    'fic.isFake': '🕵️ Esta es la TRAMPA',
    'fic.rules': 'Reglas: la trampa tiene que ser sobre su central y no puede ofender a nadie. Las trampas quedan en el aula.',
    'fic.save': 'Enviar ficha técnica', 'fic.done': '✅ Ficha recibida: los datos se mostrarán mezclados como A y B.',

    'ins.title': '🔍 Inspección', 'ins.wait': 'Atentos a la TV: tu profe va a mostrar la ficha de cada central.',
    'ins.own': '🎤 ¡Es su turno! El/la Jefe/a de central lee los dos datos. No se delaten.',
    'ins.on': 'En pantalla', 'ins.which': '¿Cuál es la TRAMPA?', 'ins.clues': '¿Qué pista los ayudó a descubrirla? (marquen al menos 1)',
    'ins.why': 'Expliquen en una frase por qué', 'ins.send': 'Enviar diagnóstico', 'ins.sent': 'Diagnóstico enviado: {v}. Pueden cambiarlo hasta la revelación.',
    'ins.right': '🛡️ ¡Inspección exitosa! Detectaron la trampa. +{p} pts', 'ins.wrong': '⚡ Cortocircuito: la trampa era la {v}.',
    'ins.fooled': 'Su trampa engañó a {n} equipo(s).', 'ins.noFacts': 'Esta central todavía no cargó su ficha.',
    'ins.source': 'Fuente', 'ins.history': 'Rondas reveladas',

    'con.title': '⚖️ Consejo energético de Ushuaia', 'con.intro': 'Debatan en equipo, voten y prepárense para defender su postura en voz alta.',
    'con.si': 'De acuerdo', 'con.no': 'En desacuerdo', 'con.depende': 'Depende', 'con.voted': 'Postura del equipo: {v}',

    'cier.title': '🏅 Cierre y certificado', 'cier.score': 'Puntaje del equipo', 'cier.who': '¿Quién sos?', 'cier.chooseName': 'Elegí tu nombre…',
    'cier.q1': '¿Qué pieza de tu central te pareció la más importante? ¿Qué transformación de energía hace?',
    'cier.q2': 'Si pudieras elegir, ¿qué central pondrías en Ushuaia? ¿Por qué?',
    'cier.send': 'Enviar y obtener mi certificado', 'cier.download': '⬇️ Descargar PNG', 'cier.print': '🖨️ Imprimir / PDF',
    'cier.noMembers': 'Primero registren al equipo en la fase 1.',

    'sc.hook': 'Apagón', 'sc.taller': 'Taller', 'sc.detected': 'Detecciones', 'sc.justified': 'Justificaciones',
    'sc.fooled': 'Sabotajes', 'sc.dilemmas': 'Consejo', 'sc.bonus': 'Bonus', 'sc.total': 'Total',

    'cert.heading': 'CERTIFICADO DE FINALIZACIÓN', 'cert.certifies': 'Se certifica que',
    'cert.body': 'completó la misión APAGÓN EN USHUAIA como {role} de la {team}. Reconoció los medios técnicos de una central eléctrica y cómo se transforma la energía en cada paso hasta llegar a nuestras casas.',
    'cert.badge': 'GUARDIÁN/A DE LA ENERGÍA', 'cert.badgeSub': 'Insignia', 'cert.course': 'Educación Tecnológica · 2.º año · Ciclo Básico',
    'cert.units': 'CIEU Ushuaia · Proyecto Tecnológico Integrador «Energía en Acción»', 'cert.date': 'Fecha', 'cert.points': 'Puntaje del equipo', 'cert.code': 'Código',

    'tv.title': 'Panel docente', 'tv.pin': 'PIN docente', 'tv.enter': 'Entrar', 'tv.view': 'Solo ver',
    'tv.join': 'Entrá desde tu celu', 'tv.start': '▶ Iniciar', 'tv.pause': '⏸ Pausa', 'tv.reveal': '👁 Revelar', 'tv.hide': 'Ocultar',
    'tv.votes': '{n} de {m} equipos respondieron', 'tv.next': 'Siguiente ▶', 'tv.prev': '◀ Anterior', 'tv.scoreboard': 'Ranking',
    'tv.chooseTeam': 'Elegí qué central mostrar', 'tv.factsOk': 'Ficha lista', 'tv.factsNo': 'Sin ficha',
    'tv.reset': 'Reiniciar clase', 'tv.resetConfirm': 'Esto borra TODOS los datos de la clase. ¿Seguro?', 'tv.export': 'Exportar CSV',
    'tv.podium': 'Podio final', 'tv.getCert': 'Completen el ticket de salida y descarguen su certificado desde el celu.',
    'tv.dilemma': 'Dilema {n} de {m}', 'tv.fake': '🕵️ TRAMPA', 'tv.real': '✅ VERDADERO', 'tv.waitingTeams': 'Esperando equipos…',
    'tv.lockedHint': 'Ingresá el PIN para controlar la clase.', 'tv.bonusHint': 'Tocá +/− para dar bonus', 'tv.exits': 'Tickets de salida',
    'tv.city': 'Ushuaia se enciende', 'tv.litCount': '{n} de {m} centrales encendidas', 'tv.noChain': 'Sin intentos',
    'tv.solution': 'Cadena correcta', 'tv.showSol': '👁 Mostrar soluciones', 'tv.hideSol': 'Ocultar soluciones',
    'tv.sabotage': 'Sabotajes que engañaron', 'tv.clues': 'Pistas usadas'
  }
};

let LANG = 'es';
function t(key, vars) {
  let s = I18N.es[key] || key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, v) => (vars[v] != null ? vars[v] : m));
  return s;
}
function L(o) { return o == null ? '' : (typeof o === 'string' ? o : (o.es || '')); }
function applyI18n(root) {
  (root || document).querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.documentElement.lang = 'es';
}
