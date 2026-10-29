# ⚡ APAGÓN EN USHUAIA · Centrales de generación

Juego por equipos para una clase de **80 minutos**. Los estudiantes usan el **celular** y el docente proyecta el **panel en la Smart TV**.
Contenidos: centrales de generación de energía eléctrica, **medios técnicos** de cada central, **procesos de transformación de la energía**, recursos renovables y no renovables, e impacto ambiental. Se integra con el proyecto *Energía en Acción*.

Destinatarios: 2.º año, Ciclo Básico, Educación Tecnológica (CIEU), estudiantes de 12 y 13 años · 6 equipos de 2 a 5 integrantes, uno por central asignada por sorteo.

| Página | Para quién | Enlace |
|---|---|---|
| `index.html` | Estudiantes (celular) | `https://mamanirafa.github.io/centrales_energia/` |
| `tv.html` | Docente (Smart TV / compu) | `https://mamanirafa.github.io/centrales_energia/tv.html` |

## Centrales (equipos)
| Central | Cadena de medios técnicos | Sabotaje |
|---|---|---|
| 🔥 Térmica | Caldera → Turbina de vapor → Generador → Transformador | 🌍 Ambiente engañoso |
| 💧 Hidráulica | Represa → Tubería forzada → Turbina hidráulica → Generador → Transformador | 📍 Lugar equivocado |
| ☢️ Nuclear | Reactor → Intercambiador de calor → Turbina de vapor → Generador → Transformador | ⚡ Energía equivocada |
| 🌬️ Eólica | Aspas y rotor → Caja multiplicadora → Generador → Transformador | 🔢 Número exagerado |
| ☀️ Solar | Paneles solares → Inversor → Transformador | 🧩 Pieza intrusa |
| 🌱 Biomasa | Biodigestor → Gasómetro → Motor a biogás → Generador → Transformador | 🔄 Orden cambiado |

## Cómo se juega
| # | Fase | Min | Qué pasa |
|---|---|---|---|
| 1 | 🪪 Registro | 5 | Cada equipo elige su central (la del sorteo) y carga nombres y roles. |
| 2 | 🚨 El apagón | 6 | "Apagón total en Ushuaia". ¿De dónde sale la electricidad de la ciudad? (A-B-C-D). Respuesta: central térmica a gas. |
| 3 | 🛠️ Taller de montaje | 18 | Ordenan los medios técnicos de su central (hay 2 piezas intrusas) y eligen la transformación de energía de cada uno. Cada intento muestra cuántas piezas están bien. Si todo está bien, su barrio de Ushuaia se ilumina en la TV. |
| 4 | 🕵️ Sabotaje | 12 | Escriben 2 datos técnicos sobre su central: uno verdadero y una trampa. |
| 5 | 🔍 Inspección | 22 | La TV muestra A y B de cada central; los demás votan cuál es la trampa y justifican con pistas técnicas. |
| 6 | ⚖️ Consejo energético | 12 | 5 dilemas sobre la energía de Ushuaia; votan y argumentan. |
| 7 | 🏅 Certificado | 5 | Ticket de salida individual → certificado PNG/PDF con la insignia **Guardián/a de la Energía**. |

**Quién envía en cada fase:** Registro → Jefe/a de central · Apagón → Inspector/a · Taller → Técnico/a de montaje · Sabotaje → Investigador/a · Inspección → Inspector/a · Consejo → Jefe/a de central · Certificado → cada uno.

## Puesta en marcha (una vez)
1. Hoja de cálculo nueva (ej.: *Apagón 2.º año*) → **Extensiones → Apps Script** → pegá todo `apps-script/Code.gs`.
2. Ejecutá **`setup`** y autorizá. (Si Google muestra un error de autorización, esperá un rato y reintentá.)
3. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: *Yo* · Acceso: *Cualquier usuario* → copiá la URL `/exec`.
4. Pegala en `js/config.js` → `scriptUrl`. PIN docente por defecto: `2026`.

> Es una **hoja y un script nuevos**, distintos de los de INFODEMIA: así los datos quedan separados.
> Si `scriptUrl` queda vacío, la página funciona en **modo local (demo)** en un solo dispositivo: sirve para probarla antes de clase.

## Publicar en GitHub (desde la web)
1. Creá el repo **`centrales_energia`** (Public).
2. *uploading an existing file* → arrastrá **el contenido** de la carpeta → **Commit changes**.
3. **Settings → Pages → Deploy from a branch → main → /(root) → Save**.

## Editar contenidos
Todo el contenido (centrales, piezas, transformaciones, dilemas, puntajes) está en `js/data.js`.
