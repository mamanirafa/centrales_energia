/* =========================================================
   Insignia "Guardián/a de la Energía" y certificado (canvas → PNG)
   Sin firma del docente.
   ========================================================= */
const Cert = (() => {

  function drawBolt(ctx, x, y, r, color) {
    ctx.save(); ctx.fillStyle = color;
    const p = [[0.15, -1], [-0.55, 0.12], [-0.05, 0.12], [-0.2, 1], [0.55, -0.18], [0.05, -0.18], [0.3, -1]];
    ctx.beginPath(); p.forEach(([a, b], i) => i ? ctx.lineTo(x + a * r, y + b * r) : ctx.moveTo(x + a * r, y + b * r)); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function fitText(ctx, text, maxW, size, weight, family) {
    let s = size;
    do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 10);
    return s + 2;
  }

  /* Insignia circular con lupa, virus y cinta */
  function drawBadge(ctx, cx, cy, R, label) {
    ctx.save();
    // halo
    const halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.25);
    halo.addColorStop(0, 'rgba(250,204,21,.35)'); halo.addColorStop(1, 'rgba(250,204,21,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
    // dientes del sello
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (Math.PI * 2 * i) / 48, rr = i % 2 ? R : R * 0.94;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, '#facc15'); g.addColorStop(1, '#fb923c');
    ctx.fillStyle = g; ctx.fill();
    // disco interior
    const g2 = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
    g2.addColorStop(0, '#12355c'); g2.addColorStop(1, '#07111f');
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, R * 0.84, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = R * 0.015;
    ctx.setLineDash([R * 0.04, R * 0.04]); ctx.beginPath(); ctx.arc(cx, cy, R * 0.77, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // texto superior
    ctx.fillStyle = '#facc15'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${R * 0.11}px 'JetBrains Mono', monospace`;
    ctx.fillText('APAGÓN', cx, cy - R * 0.58);
    // lamparita encendida con rayo
    const lx = cx, ly = cy - R * 0.08, lr = R * 0.3;
    const glow = ctx.createRadialGradient(lx, ly, lr * 0.2, lx, ly, lr * 1.6);
    glow.addColorStop(0, 'rgba(250,204,21,.55)'); glow.addColorStop(1, 'rgba(250,204,21,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(lx, ly, lr * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(lx - lr * 0.45, ly + lr * 0.9, lr * 0.9, lr * 0.45);
    ctx.fillStyle = '#64748b'; ctx.fillRect(lx - lr * 0.35, ly + lr * 1.35, lr * 0.7, lr * 0.18);
    drawBolt(ctx, lx, ly, lr * 0.7, '#f97316');
    // cinta
    const rw = R * 1.9, rh = R * 0.36, ry = cy + R * 0.58;
    ctx.fillStyle = '#c2410c';
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath();
      ctx.moveTo(cx + s * rw * 0.42, ry - rh * 0.3); ctx.lineTo(cx + s * rw * 0.58, ry - rh * 0.3);
      ctx.lineTo(cx + s * rw * 0.52, ry + rh * 0.2); ctx.lineTo(cx + s * rw * 0.58, ry + rh * 0.7);
      ctx.lineTo(cx + s * rw * 0.42, ry + rh * 0.7); ctx.closePath(); ctx.fill();
    });
    const rg = ctx.createLinearGradient(cx - rw / 2, 0, cx + rw / 2, 0);
    rg.addColorStop(0, '#fb923c'); rg.addColorStop(.5, '#facc15'); rg.addColorStop(1, '#fb923c');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.roundRect(cx - rw * 0.46, ry - rh / 2, rw * 0.92, rh, rh * 0.18); ctx.fill();
    ctx.fillStyle = '#04120b';
    fitText(ctx, label, rw * 0.84, R * 0.17, 800, "'Space Grotesk', sans-serif");
    ctx.fillText(label, cx, ry + 1);
    ctx.restore();
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(' '), lines = []; let cur = '';
    words.forEach(w => { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; });
    if (cur) lines.push(cur);
    return lines;
  }

  function code(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 'AGN-' + (h >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7);
  }

  async function draw(canvas, d) {
    try { await document.fonts.ready; } catch (e) {}
    const W = 2000, H = 1414; canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const navy = '#0b1f3a', teal = '#0f8a77', gray = '#5b6b7f';
    // fondo
    ctx.fillStyle = '#fbf8f1'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.rect(80, 80, W - 160, H - 160); ctx.clip();
    ctx.fillStyle = 'rgba(15,138,119,.05)';
    for (let i = 0; i < 26; i++) { const x = (i * 263) % W, y = (i * 389) % H; ctx.beginPath(); ctx.arc(x, y, 40 + (i % 5) * 18, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = navy; ctx.lineWidth = 22; ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = teal; ctx.lineWidth = 3; ctx.strokeRect(78, 78, W - 156, H - 156);
    // banda lateral
    const bx = 1440;
    const band = ctx.createLinearGradient(bx, 0, W, H);
    band.addColorStop(0, '#0b1f3a'); band.addColorStop(1, '#0d3b52');
    ctx.fillStyle = band; ctx.fillRect(bx, 81, W - 81 - bx, H - 162);
    drawBadge(ctx, bx + (W - 81 - bx) / 2, 560, 215, t('cert.badge'));
    ctx.textAlign = 'center'; ctx.fillStyle = '#fde68a';
    ctx.font = "600 30px 'JetBrains Mono', monospace";
    ctx.fillText(t('cert.badgeSub').toUpperCase(), bx + (W - 81 - bx) / 2, 900);
    ctx.fillStyle = '#ffffff'; fitText(ctx, t('cert.badge'), W - 81 - bx - 60, 40, 700, "'Space Grotesk', sans-serif");
    ctx.fillText(t('cert.badge'), bx + (W - 81 - bx) / 2, 950);
    ctx.fillStyle = '#9fb3c8'; ctx.font = "500 26px 'JetBrains Mono', monospace";
    ctx.fillText(d.code, bx + (W - 81 - bx) / 2, 1010);

    // contenido
    const cx = 760, maxW = 1160;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = teal; ctx.font = "700 30px 'JetBrains Mono', monospace";
    ctx.fillText('APAGÓN EN USHUAIA · ' + t('app.subtitle').toUpperCase(), cx, 200);
    ctx.fillStyle = navy; fitText(ctx, t('cert.heading'), maxW, 74, 700, "'Space Grotesk', sans-serif");
    ctx.fillText(t('cert.heading'), cx, 300);
    ctx.fillStyle = gray; ctx.font = "italic 38px Georgia, serif";
    ctx.fillText(t('cert.certifies'), cx, 400);
    ctx.fillStyle = navy; fitText(ctx, d.name, maxW, 104, 700, "Georgia, 'Times New Roman', serif");
    ctx.fillText(d.name, cx, 530);
    ctx.strokeStyle = teal; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 420, 568); ctx.lineTo(cx + 420, 568); ctx.stroke();
    ctx.fillStyle = '#25364d'; ctx.font = "400 36px 'Space Grotesk', sans-serif";
    wrap(ctx, t('cert.body', { role: d.role, team: d.team }), maxW).forEach((ln, i) => ctx.fillText(ln, cx, 650 + i * 54));

    // pie
    const cols = [[t('cert.date'), d.date], [t('cert.points'), d.points + ' ' + t('common.pts')], [t('cert.code'), d.code]];
    cols.forEach(([k, v], i) => {
      const x = cx - 400 + i * 400;
      ctx.fillStyle = gray; ctx.font = "600 24px 'JetBrains Mono', monospace"; ctx.fillText(k.toUpperCase(), x, 1010);
      ctx.fillStyle = navy; ctx.font = "700 36px 'Space Grotesk', sans-serif"; ctx.fillText(v, x, 1060);
    });
    ctx.strokeStyle = 'rgba(11,31,58,.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 560, 1130); ctx.lineTo(cx + 560, 1130); ctx.stroke();
    ctx.fillStyle = navy; ctx.font = "600 28px 'Space Grotesk', sans-serif"; ctx.fillText(t('cert.course'), cx, 1190);
    ctx.fillStyle = gray; ctx.font = "400 24px 'Space Grotesk', sans-serif"; ctx.fillText(t('cert.units'), cx, 1236);
  }

  function download(canvas, name) {
    const a = document.createElement('a');
    a.download = 'certificado-apagon-' + name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-') + '.png';
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
  }

  function print(canvas) {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Certificado</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0}img{width:100%;display:block}</style></head><body><img src="${canvas.toDataURL('image/png')}" onload="setTimeout(()=>print(),300)"></body></html>`);
    w.document.close();
  }

  return { draw, drawBadge, download, print, code };
})();
