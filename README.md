# ⚡ APAGÓN EN USHUAIA · Centrales de generación

Juego por equipos para una clase de **80 minutos**. Los estudiantes usan el **celular** y el docente proyecta el **panel en la Smart TV**.
Contenidos: centrales de generación de energía eléctrica, **medios técnicos** de cada central, **procesos de transformación de la energía**, recursos renovables y no renovables, e impacto ambiental. Se integra con el proyecto *Energía en Acción*.

Destinatarios: 2.º año, Ciclo Básico, Educación Tecnológica (CIEU), estudiantes de 12 y 13 años · 6 equipos de hasta 6 integrantes (roles repetibles), uno por central asignada por sorteo. Cada estudiante entra con su nombre y suma puntos propios.

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
| 1 | 🪪 Registro | 5 | Cada estudiante elige su central, escribe su nombre y elige su rol. |
| 2 | 🚨 El apagón | 12 | 10 preguntas: de dónde sale la luz de Ushuaia, fuentes vs. tipos de energía, recursos de cada central. Responde cada uno. |
| 3 | 🛠️ Taller de montaje | 15 | Arrastran los medios técnicos en orden y eligen la transformación de cada uno. Al enviar ven sus errores. Si la cadena es correcta, su barrio de Ushuaia se ilumina en la TV. |
| 4 | 🕵️ Sabotaje | 10 | Escriben un dato verdadero y una trampa (con ayuda de Google o la IA). |
| 5 | 🔍 Inspección | 20 | Cada uno vota cuál es la trampa y qué conceptos lo ayudaron a descubrirla. |
| 6 | ⚖️ Consejo energético | 12 | 6 afirmaciones para debatir; cada uno vota De acuerdo / En desacuerdo / Depende. |
| 7 | 🏅 Certificado | 6 | Ticket de salida individual → certificado con su puntaje. |

Puntos: respuesta correcta suma, incorrecta no suma, sin responder resta (−5), y en el Consejo elegir "Depende" resta. Detalle completo en `GUIA_DOCENTE.md`.

## Puesta en marcha (una vez)
1. Hoja de cálculo nueva (ej.: *Apagón 2.º año*) → **Extensiones → Apps Script** → pegá todo `apps-script/Code.gs` (si ya tenías una versión anterior, reemplazala completa y hacé **Implementar → Gestionar implementaciones → Editar → Nueva versión**).
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
Todo el contenido (centrales, piezas, transformaciones, preguntas, afirmaciones del Consejo y puntajes) está en `js/data.js`.
