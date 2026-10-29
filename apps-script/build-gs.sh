#!/bin/sh
# Regenera Code.gs a partir de js/core.js + wrapper.gs.js (una sola fuente de verdad)
cd "$(dirname "$0")"
{
  echo "/* ARCHIVO GENERADO: pegá todo este contenido en Apps Script (Code.gs) */"
  cat ../js/core.js
  cat wrapper.gs.js
} > Code.gs
echo "Code.gs actualizado"
