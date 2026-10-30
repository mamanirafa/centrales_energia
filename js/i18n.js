/* =========================================================
   Textos de la interfaz (solo español)
   ========================================================= */
const I18N = {
  es: {
    'app.subtitle': 'Centrales de generación',
    'app.tagline': 'Ushuaia se quedó sin luz. Cada equipo tiene una central eléctrica: armen sus piezas, descubran cómo cambia la energía en cada paso y vuelvan a encender la ciudad.',
    'mode.local': 'Modo local (demo)', 'mode.online': 'En vivo', 'mode.offline': 'Sin conexión, reintentando…',
    'phase.locked': '🔒 Tu profe todavía no abrió esta fase.',
    'common.saved': '¡Guardado!', 'common.sending': 'Enviando…', 'common.pts': 'pts', 'common.copy': '📋 Copiar', 'common.copied': '¡Copiado!',
    'who.todos': '👥 En esta fase responde cada uno desde su celu.',
    'who.tecnico': '🛠️ En esta fase envía el/la Técnico/a de montaje. El resto ayuda a armar.',
    'who.investigador': '📚 En esta fase envía el/la Investigador/a. El resto ayuda a buscar y escribir.',
    'who.notYou': 'Lo envía {role} de tu equipo. Vos podés practicar y ayudar desde acá.',

    'err.nomember': 'No estás registrado/a. Volvé a ingresar a tu equipo.', 'err.name': 'Escribí tu nombre y apellido.',
    'err.role': 'Elegí un rol.', 'err.full': 'Ese equipo ya tiene 6 integrantes.', 'err.dupname': 'Ya hay alguien con ese nombre en el equipo.',
    'err.locked': 'Ya no se puede cambiar: el resultado ya se mostró.', 'err.closed': 'Esa pregunta ya no está abierta. Mirá la TV.',
    'err.own': 'No podés votar la ficha de tu propia central.', 'err.fake': 'Marquen cuál de los dos datos es la TRAMPA.',
    'err.empty': 'Completá los campos obligatorios.', 'err.items': 'Faltan datos.', 'err.pin': 'PIN incorrecto.',
    'err.network': 'Sin conexión. Lo escrito queda guardado en este celu: probá de nuevo.', 'err.generic': 'No se pudo guardar. Probá de nuevo.',
    'err.pick': 'Elegí una opción.', 'err.chain': 'Arrastrá al menos 2 piezas a la cadena.', 'err.energy': 'Cada pieza necesita su transformación de energía.',
    'err.role_tecnico': 'En tu equipo envía el/la Técnico/a de montaje.', 'err.role_investigador': 'En tu equipo envía el/la Investigador/a.',
    'err.server': 'El servidor está ocupado. Esperá unos segundos y probá de nuevo.',

    'join.choose': '1. Elegí la central que le tocó a tu equipo', 'join.slots': '{n} de {m} lugares',
    'join.title': '2. ¿Quién sos?', 'join.name': 'Nombre y apellido', 'join.role': 'Tu rol en el equipo',
    'join.roleHint': 'Los roles se pueden repetir: en un equipo puede haber dos técnicos/as, por ejemplo.',
    'join.go': 'Entrar al equipo', 'join.back': '← Elegir otra central', 'join.full': 'Completo',
    'join.already': '¿Ya te registraste desde otro celu? Elegí tu nombre:', 'join.pickName': 'Soy…',
    'me.points': 'Mis puntos', 'me.time': 'Tiempo', 'me.change': 'Cambiar',

    'reg.title': '🪪 Tu equipo', 'reg.ok': '✅ ¡Ya estás en la {team}!', 'reg.members': 'Integrantes ({n} de {m})',
    'reg.rolesTitle': 'Los roles', 'reg.input': 'Recurso de tu central', 'reg.trap': 'Tu equipo va a sabotear con…',
    'reg.edit': 'Cambiar mi nombre o rol', 'reg.save': 'Guardar cambios', 'reg.howScore': '¿Cómo se suman puntos?',
    'reg.rules': '✅ Respuesta correcta: suma · ❌ Incorrecta: no suma · ⏳ Sin responder: resta {miss}',

    'apagon.title': '🚨 El apagón', 'apagon.q': 'Pregunta {n} de {m}',
    'apagon.sent': 'Respuesta enviada: {v}. Podés cambiarla hasta que tu profe muestre el resultado.',
    'apagon.wait': 'Mirá la TV: tu profe va a abrir la primera pregunta.',
    'res.right': '✅ ¡Correcto! +{p} pts', 'res.wrong': '❌ Incorrecto. La respuesta era {v}.', 'res.none': '⏳ No respondiste: {p} pts',
    'res.mine': 'Tu respuesta: {v}', 'res.history': 'Tus resultados',

    'tal.title': '🛠️ Taller de montaje',
    'tal.mission': 'Arrastrá las piezas (medios técnicos) de tu central y ordenalas desde el recurso hasta la red. ¡Ojo! Hay 2 piezas intrusas que no son de tu central.',
    'tal.pool': 'Piezas disponibles', 'tal.poolHint': 'Arrastrá una pieza hacia abajo (o tocá ＋).',
    'tal.chain': 'Tu cadena (arrastrá para ordenar)', 'tal.drop': 'Soltá las piezas acá', 'tal.firstBuild': 'Primero armá la cadena: acá vas a elegir la transformación de cada pieza.',
    'tal.start': 'Recurso', 'tal.end': '🗼 Torres de transmisión → Red de Ushuaia',
    'tal.energyTitle': '⚡ ¿Qué transformación de energía hace cada pieza?', 'tal.choose': 'Elegí la transformación…',
    'tal.send': '⚡ Probar encendido', 'tal.confirm': '¿Enviar la cadena? El PRIMER envío del equipo es el que da puntos a todos.',
    'tal.attempt': 'Intento {n}', 'tal.firstScore': 'Puntos del 1.er envío para cada integrante: +{p}',
    'tal.result': '{pos} de {n} piezas en su lugar · {en} de {n} transformaciones correctas',
    'tal.lit': '💡 ¡Central encendida! Tu barrio de Ushuaia ya tiene luz.',
    'tal.notyet': '🔧 Todavía no enciende. Mirá los errores, corregí y probá otra vez para encender tu barrio (ya no suma puntos).',
    'tal.errors': 'Revisá tus errores', 'tal.okPiece': 'Bien ubicada', 'tal.intruder': 'Pieza intrusa: no es de tu central',
    'tal.badPos': 'Va en el lugar {n}', 'tal.badE': 'La transformación correcta es: {e}', 'tal.okE': 'Transformación correcta',
    'tal.missing': 'Te faltó: {list}', 'tal.info': 'ℹ️ ¿Qué hace?', 'tal.add': '＋', 'tal.remove': 'Quitar',

    'fic.title': '🕵️ Sabotaje',
    'fic.mission': 'Escriban 2 datos sobre su central: uno VERDADERO (búsquenlo en el material o en internet) y una TRAMPA (falso, pero que parezca cierto). Los otros equipos tienen que descubrir cuál es la trampa.',
    'fic.tip': 'Truco: el dato verdadero conviene que sorprenda; la trampa, que suene muy técnica.',
    'fic.howTrap': 'Cómo armar su trampa', 'fic.searchTitle': 'Buscar el dato verdadero',
    'fic.searchTip': 'Busquen un dato sorprendente pero real en fuentes confiables ({sources}).', 'fic.openSearch': 'Buscar en Google', 'fic.ideas': 'Ideas',
    'fic.aiTitle': '🤖 Pedile ayuda a la IA', 'fic.aiTip': 'Copien este pedido, péguenlo en la IA y mejoren lo que responda. Siempre revisen que la trampa sea sobre su central.',
    'fic.aiPrompt': 'Sos un profe de Tecnología. Estamos jugando en clase a descubrir datos falsos. Ayudame a escribir un dato FALSO pero creíble sobre la {team}, usando esta técnica: {trap} ({desc}). Escribí una afirmación de una sola frase y después desarrollala en 2 o 3 oraciones simples, para chicos de 12 y 13 años. No uses nombres de personas reales.',
    'fic.item': 'Dato {n}', 'fic.headline': 'Afirmación (1 frase)', 'fic.body': 'Desarrollá tu afirmación (máx. 400 caracteres)', 'fic.source': 'Fuente o enlace',
    'fic.isFake': '🕵️ Esta es la TRAMPA',
    'fic.rules': 'Reglas: la trampa tiene que ser sobre su central y no puede ofender a nadie. Las trampas quedan en el aula.',
    'fic.save': 'Enviar ficha técnica', 'fic.confirm': '¿Enviar la ficha? Se puede corregir hasta que tu profe la muestre en la TV.',
    'fic.done': '✅ Ficha recibida: los datos se mostrarán mezclados como A y B.',

    'ins.title': '🔍 Inspección', 'ins.wait': 'Mirá la TV: tu profe va a mostrar la ficha de cada central.',
    'ins.own': '🎤 ¡Es su turno! El/la Jefe/a de central lee los dos datos. No se delaten.',
    'ins.on': 'En pantalla', 'ins.which': '¿Cuál es la TRAMPA?', 'ins.concepts': '¿Qué conceptos te ayudaron a descubrirla? (marcá al menos 1)',
    'ins.why': 'Explicá en una frase por qué es falsa', 'ins.send': 'Enviar mi respuesta', 'ins.sent': 'Respuesta enviada: {v}. Podés cambiarla hasta la revelación.',
    'ins.right': '🛡️ ¡Descubriste la trampa! +{p} pts', 'ins.wrong': '⚡ Caíste en la trampa: era la {v}.',
    'ins.fooled': 'Su trampa engañó a {n} estudiante(s): +{p} pts para cada integrante.', 'ins.noFacts': 'Esta central todavía no cargó su ficha.',
    'ins.source': 'Fuente', 'ins.history': 'Rondas reveladas', 'ins.trapWas': 'La trampa usó: {trap}',

    'con.title': '⚖️ Consejo energético de Ushuaia', 'con.intro': 'Debatan en equipo, pero cada uno vota desde su celu. Elegir “Depende” resta puntos: ¡animate a decidir!',
    'con.si': 'De acuerdo', 'con.no': 'En desacuerdo', 'con.depende': 'Depende', 'con.voted': 'Tu voto: {v}. Podés cambiarlo hasta la revelación.',
    'con.depRes': '🤔 Elegiste “Depende”: {p} pts. La respuesta era “{v}”.', 'con.n': 'Afirmación {n} de {m}',

    'cier.title': '🏅 Cierre y certificado', 'cier.score': 'Tus puntos', 'cier.team': 'Promedio de tu equipo',
    'cier.q1': '¿Qué pieza de tu central te pareció la más importante? ¿Qué transformación de energía hace?',
    'cier.q2': 'Si pudieras elegir, ¿qué central pondrías en Ushuaia? ¿Por qué?',
    'cier.send': 'Enviar y obtener mi certificado', 'cier.download': '⬇️ Descargar PNG', 'cier.print': '🖨️ Imprimir / PDF',

    'sc.quiz': 'El apagón', 'sc.taller': 'Taller', 'sc.ins': 'Inspección', 'sc.fooled': 'Sabotaje',
    'sc.council': 'Consejo', 'sc.bonus': 'Bonus', 'sc.total': 'Total', 'sc.misses': 'Sin responder',

    'cert.heading': 'CERTIFICADO DE FINALIZACIÓN', 'cert.certifies': 'Se certifica que',
    'cert.body': 'completó la misión APAGÓN EN USHUAIA como {role} de la {team}. Reconoció los medios técnicos de una central eléctrica y cómo se transforma la energía en cada paso hasta llegar a nuestras casas.',
    'cert.badge': 'GUARDIÁN/A DE LA ENERGÍA', 'cert.badgeSub': 'Insignia', 'cert.course': 'Educación Tecnológica · 2.º año · Ciclo Básico',
    'cert.units': 'CIEU Ushuaia · Proyecto Tecnológico Integrador «Energía en Acción»', 'cert.date': 'Fecha', 'cert.points': 'Puntaje', 'cert.code': 'Código',

    'tv.title': 'Panel docente', 'tv.pin': 'PIN docente', 'tv.enter': 'Entrar', 'tv.view': 'Solo ver',
    'tv.join': 'Entrá desde tu celu', 'tv.start': '▶ Iniciar', 'tv.pause': '⏸ Pausa', 'tv.reveal': '👁 Mostrar resultado', 'tv.hide': 'Ocultar',
    'tv.answered': '{n} de {m} estudiantes respondieron', 'tv.next': 'Siguiente ▶', 'tv.prev': '◀ Anterior', 'tv.scoreboard': 'Ranking (promedio)',
    'tv.chooseTeam': 'Elegí qué central mostrar', 'tv.factsOk': 'Ficha lista', 'tv.factsNo': 'Sin ficha',
    'tv.reset': 'Reiniciar clase', 'tv.resetConfirm': 'Esto borra TODOS los datos de la clase. ¿Seguro?', 'tv.export': 'Exportar CSV',
    'tv.save': '💾 Guardar puntajes en la hoja', 'tv.saved': 'Puntajes guardados en la hoja “Puntajes”.',
    'tv.podium': 'Podio final', 'tv.topStudents': 'Mejores puntajes', 'tv.getCert': 'Completen el ticket de salida y descarguen su certificado desde el celu.',
    'tv.waitingTeams': 'Esperando integrantes…', 'tv.lockedHint': 'Ingresá el PIN para controlar la clase.', 'tv.bonusHint': '+/− da bonus a todo el equipo',
    'tv.exits': 'Tickets de salida', 'tv.city': 'Ushuaia se enciende', 'tv.litCount': '{n} de {m} centrales encendidas', 'tv.noChain': 'Sin envíos',
    'tv.solution': 'Cadena correcta', 'tv.showSol': '👁 Mostrar soluciones', 'tv.hideSol': 'Ocultar soluciones',
    'tv.sabotage': 'Estudiantes engañados por cada trampa', 'tv.concepts': 'Conceptos más usados', 'tv.kick': 'Quitar a {n} de la clase?',
    'tv.fake': '🕵️ TRAMPA', 'tv.real': '✅ VERDADERO', 'tv.firstPts': '1.er envío: +{p} pts c/u'
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
