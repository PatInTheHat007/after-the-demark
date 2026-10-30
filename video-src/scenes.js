// After the Demark — promo video scenes. Pure canvas drawing, driven by time t (seconds).
// Visual style matches the website: light cards, navy + teal, room-speed tiles, the demarc diagram.
const W = 1920, H = 1080;
const F = 'Avenir Next';
const C = {
  navy: '#0E2433', navy2: '#173A50', teal: '#12A594', tealB: '#4FD1BF', tealSoft: '#E3F5F2',
  ink: '#1B2A33', muted: '#5D6E78', line: '#DCE3E7', soft: '#F5F8F9', white: '#FFFFFF',
  red: '#D64545', redSoft: '#FBE9E9', green: '#2E9D5B', greenSoft: '#E4F4EA', amber: '#D98A12', amberSoft: '#FCF1DE',
  slate: '#8FB3C4', mist: '#B7CDD8',
};

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eio = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const appear = (t, a, d = 0.6) => eout(prog(t, a, a + d));

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fillRR(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  rr(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function text(ctx, s, x, y, { size = 40, weight = 600, color = C.ink, align = 'left', base = 'middle', alpha = 1, spacing = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px "${F}"`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  if (spacing) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(ctx, s, size, weight = 600, spacing = 0) {
  ctx.save(); ctx.font = `${weight} ${size}px "${F}"`; if (spacing) ctx.letterSpacing = `${spacing}px`;
  const w = ctx.measureText(s).width; ctx.restore(); return w;
}
function circle(ctx, x, y, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function line(ctx, x1, y1, x2, y2, color, lw = 3, dash) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.stroke(); ctx.restore();
}
function glow(ctx, x, y, r, color, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function check(ctx, x, y, s, color, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  const p1 = [x - s * 0.35, y], p2 = [x - s * 0.1, y + s * 0.25], p3 = [x + s * 0.4, y - s * 0.3];
  const k1 = clamp(k * 2), k2 = clamp(k * 2 - 1);
  ctx.moveTo(...p1); ctx.lineTo(lerp(p1[0], p2[0], k1), lerp(p1[1], p2[1], k1));
  if (k2 > 0) ctx.lineTo(lerp(p2[0], p3[0], k2), lerp(p2[1], p3[1], k2));
  ctx.stroke(); ctx.restore();
}
function checkBadge(ctx, x, y, r, k, fill = C.teal) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = back(clamp(k)); ctx.scale(s, s);
  circle(ctx, 0, 0, r, fill); check(ctx, 0, 0, r * 1.1, '#fff', clamp(k * 1.5 - 0.3));
  ctx.restore();
}
function spinner(ctx, x, y, r, t, color, lw = 6) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, t * 6, t * 6 + Math.PI * 1.4);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
}
// Slide-up-and-fade entrance for a group of drawing calls.
function enter(ctx, k, fn, dy = 40) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k); ctx.translate(0, (1 - k) * dy); fn(); ctx.restore();
}
// White card with a soft shadow, like the site's cards.
function card(ctx, x, y, w, h, { r = 26, fill = C.white, border = '#E3E9EC', shadow = 0.10 } = {}) {
  ctx.save();
  ctx.shadowColor = `rgba(14,36,51,${shadow})`; ctx.shadowBlur = 60; ctx.shadowOffsetY = 22;
  fillRR(ctx, x, y, w, h, r, fill);
  ctx.restore();
  if (border) fillRR(ctx, x, y, w, h, r, null, border, 1.5);
}
function pill(ctx, s, cx, cy, { size = 26, bg = C.tealSoft, color = C.teal, weight = 700, padX = 22, h = null, spacing = 0, dot = null } = {}) {
  const tw = measure(ctx, s, size, weight, spacing) + (dot ? size * 0.9 : 0);
  const ph = h || size * 1.9, pw = tw + padX * 2;
  fillRR(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph / 2, bg);
  let tx = cx - tw / 2;
  if (dot) { circle(ctx, tx + size * 0.3, cy, size * 0.27, dot); tx += size * 0.9; }
  text(ctx, s, tx, cy + 1, { size, weight, color, spacing });
  return pw;
}
function eyebrow(ctx, s, x, y, alpha = 1, color = C.teal) {
  text(ctx, s, x, y, { size: 24, weight: 700, color, spacing: 6, alpha });
}

// ---------- backgrounds ----------
function bgLight(ctx, t) {
  ctx.fillStyle = C.soft; ctx.fillRect(0, 0, W, H);
  const off = (t * 6) % 48;
  ctx.fillStyle = 'rgba(14,36,51,0.07)';
  for (let y = -48 + off; y < H; y += 48) for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.arc(x + 24, y, 2.2, 0, Math.PI * 2); ctx.fill(); }
  glow(ctx, W * 0.82, H * 0.1, 700, 'rgba(79,209,191,0.35)', 0.35);
}
function bgNavy(ctx, t, gx = W * 0.5, gy = H * 0.45) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1;
  const off = (t * 8) % 80;
  for (let x = -80 + off; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
  glow(ctx, gx, gy, 900, 'rgba(18,165,148,0.55)', 0.28);
}

// ---------- brand ----------
function logo(ctx, x, y, s, k = 1) {
  // matches the site's header mark: ISP line, demarc bar, three branches to devices
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 34, s / 34); ctx.lineCap = 'round';
  const a = prog(k, 0, 0.25), b = prog(k, 0.2, 0.45), c = prog(k, 0.4, 0.75), d = prog(k, 0.65, 1);
  if (a > 0) line(ctx, 2, 17, 2 + 11 * eio(a), 17, C.slate, 2.4);
  if (b > 0) line(ctx, 14, 17 - 11 * eio(b), 14, 17 + 11 * eio(b), C.tealB, 3);
  if (c > 0) {
    const e = eio(c);
    line(ctx, 15, 17, 15 + 9 * e, 17 - 10 * e, '#ffffff', 2);
    line(ctx, 15, 17, 15 + 11 * e, 17, '#ffffff', 2);
    line(ctx, 15, 17, 15 + 9 * e, 17 + 10 * e, '#ffffff', 2);
  }
  if (d > 0) [[25, 7], [28, 17], [25, 27]].forEach(([cx, cy]) => circle(ctx, cx, cy, 3 * eout(d), '#ffffff'));
  ctx.restore();
}
function wordmark(ctx, x, y, size, alpha = 1) {
  const a = 'After the ', b = 'Demark';
  const wa = measure(ctx, a, size, 500), wb = measure(ctx, b, size, 800);
  const sx = x - (wa + wb) / 2;
  text(ctx, a, sx, y, { size, weight: 500, color: '#fff', alpha });
  text(ctx, b, sx + wa, y, { size, weight: 800, color: C.tealB, alpha });
}

// ---------- icons ----------
function iconBulb(ctx, x, y, s, color, on) {
  if (on) glow(ctx, x, y - s * 0.1, s * 1.4, 'rgba(79,209,191,0.6)', 0.5);
  circle(ctx, x, y - s * 0.12, s * 0.42, null, color, s * 0.1);
  fillRR(ctx, x - s * 0.2, y + s * 0.34, s * 0.4, s * 0.22, s * 0.06, color);
}
function iconLock(ctx, x, y, s, color) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.28, Math.PI, 0); ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.stroke(); ctx.restore();
  fillRR(ctx, x - s * 0.42, y - s * 0.1, s * 0.84, s * 0.62, s * 0.1, color);
}
function iconCam(ctx, x, y, s, color) {
  fillRR(ctx, x - s * 0.5, y - s * 0.32, s * 0.75, s * 0.64, s * 0.12, color);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x + s * 0.3, y); ctx.lineTo(x + s * 0.55, y - s * 0.22); ctx.lineTo(x + s * 0.55, y + s * 0.22); ctx.closePath();
  ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function iconDrop(ctx, x, y, s, color) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(x, y - s * 0.5);
  ctx.bezierCurveTo(x + s * 0.45, y, x + s * 0.4, y + s * 0.45, x, y + s * 0.45);
  ctx.bezierCurveTo(x - s * 0.4, y + s * 0.45, x - s * 0.45, y, x, y - s * 0.5);
  ctx.fillStyle = color; ctx.fill(); ctx.restore();
}

// ---------- scenes ----------
function sceneInstall(ctx, t) {
  bgLight(ctx, t);
  eyebrow(ctx, 'INSTALL DAY', 160, 200, appear(t, 0.4));
  enter(ctx, appear(t, 0.6), () => text(ctx, 'You’re connected.', 156, 290, { size: 92, weight: 700, color: C.navy }));
  enter(ctx, appear(t, 1.2), () => text(ctx, '500 Mbps, delivered to one box.', 160, 375, { size: 40, weight: 500, color: C.muted }));

  // cable into the modem (clicks at 2.4–3.4)
  const ck = eio(prog(t, 1.8, 2.4));
  if (ck > 0) {
    ctx.save(); ctx.strokeStyle = C.navy2; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1260, 1100); ctx.lineTo(1260, lerp(1100, 660, ck)); ctx.stroke(); ctx.restore();
  }
  // modem
  enter(ctx, appear(t, 1.0), () => {
    card(ctx, 1120, 240, 280, 420, { r: 34 });
    for (let i = 0; i < 5; i++) line(ctx, 1180, 290 + i * 18, 1340, 290 + i * 18, '#E3E9EC', 6);
    const leds = [4.0, 4.6, 4.9, 5.1], labels = ['PWR', 'DS', 'US', 'ON'];
    labels.forEach((l, i) => {
      const on = prog(t, leds[i], leds[i] + 0.15), ly = 430 + i * 52;
      if (on > 0) glow(ctx, 1185, ly, 26, 'rgba(46,157,91,0.8)', 0.5 * on);
      circle(ctx, 1185, ly, 10, on > 0 ? C.green : '#CBD5DB');
      text(ctx, l, 1215, ly + 1, { size: 26, weight: 700, color: C.muted });
    });
  });
  // status card
  enter(ctx, appear(t, 3.6), () => {
    card(ctx, 1450, 280, 340, 330);
    text(ctx, 'Connection', 1490, 335, { size: 32, weight: 700, color: C.navy });
    [['Signal', 4.6], ['Online', 4.9], ['500 Mbps plan', 5.1]].forEach(([l, at], i) => {
      const y = 415 + i * 66;
      text(ctx, l, 1490, y, { size: 30, weight: 500, color: C.ink });
      checkBadge(ctx, 1745, y, 18, prog(t, at, at + 0.35), C.green);
    });
  });
  // technician's bubble
  const bk = appear(t, 5.0, 0.5) * (1 - prog(t, 8.5, 8.9));
  enter(ctx, bk, () => {
    card(ctx, 160, 480, 720, 180, { r: 30 });
    ctx.save(); ctx.beginPath(); ctx.moveTo(260, 655); ctx.lineTo(300, 715); ctx.lineTo(330, 655); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    circle(ctx, 250, 570, 46, C.tealSoft);
    text(ctx, 'ISP', 250, 572, { size: 26, weight: 800, color: C.teal, align: 'center' });
    text(ctx, 'Okay… you’re connected.', 325, 540, { size: 40, weight: 700, color: C.navy });
    text(ctx, 'All done here!', 325, 600, { size: 40, weight: 700, color: C.teal });
  }, 30);
  // he leaves (thud at 10.25)
  enter(ctx, appear(t, 8.9, 0.5), () => pill(ctx, 'Technician has left', W / 2, 800, { size: 30, bg: C.navy, color: '#fff', weight: 600, padX: 30, h: 70, dot: C.slate }), 20);
  const dim = prog(t, 9.9, 10.5);
  if (dim > 0) { ctx.fillStyle = `rgba(14,36,51,${0.45 * dim})`; ctx.fillRect(0, 0, W, H); }
}

function sceneDemarc(ctx, t) {
  bgNavy(ctx, t, 1300, 520);
  const y0 = 520, bx = 760;
  // ISP line in from the left
  const lk = eio(prog(t, 10.5, 11.3));
  if (lk > 0) {
    const g = ctx.createLinearGradient(0, 0, bx, 0); g.addColorStop(0, 'rgba(143,179,196,0)'); g.addColorStop(1, 'rgba(143,179,196,0.95)');
    ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(bx * lk, y0); ctx.stroke(); ctx.restore();
  }
  // the home network after the box, left on its own (dim, with question marks)
  const nk = eio(prog(t, 10.9, 12.3));
  const nodes = [[1180, 300], [1180, 520], [1180, 740]];
  const leaves = [[1440, 230], [1460, 360], [1480, 460], [1500, 580], [1460, 680], [1440, 780]];
  if (nk > 0) {
    ctx.save(); ctx.globalAlpha *= 0.55 * nk;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    nodes.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(bx + 12, y0); ctx.bezierCurveTo(bx + 200, y0, x - 200, y, x, y); ctx.stroke(); });
    leaves.forEach(([x, y], i) => { const [nx, ny] = nodes[Math.floor(i / 2)]; line(ctx, nx, ny, x, y, '#fff', 3); });
    nodes.forEach(([x, y]) => circle(ctx, x, y, 16, '#fff'));
    leaves.forEach(([x, y], i) => {
      circle(ctx, x, y, 22, C.navy, C.slate, 3);
      text(ctx, '?', x, y + 2, { size: 26, weight: 800, color: C.slate, align: 'center', alpha: prog(t, 11.6 + i * 0.12, 12.0 + i * 0.12) });
    });
    ctx.restore();
  }
  enter(ctx, appear(t, 11.0), () => {
    eyebrow(ctx, 'YOUR HOME NETWORK', 1180, 130, 1, C.tealB);
    text(ctx, 'Coverage, speed, security:', 1180, 862, { size: 40, weight: 600, color: '#fff' });
    text(ctx, 'all on you.', 1180, 912, { size: 40, weight: 700, color: C.tealB });
  });
  // the demarc (whoosh at 13.4)
  const dk = eio(prog(t, 13.3, 14.0));
  if (dk > 0) {
    glow(ctx, bx, y0, 260 * dk + 1, 'rgba(79,209,191,0.8)', 0.35);
    fillRR(ctx, bx - 8, y0 - 230 * dk, 16, 460 * dk, 8, C.tealB);
  }
  enter(ctx, appear(t, 13.8), () => {
    eyebrow(ctx, 'YOUR ISP', 160, 400, 1, C.slate);
    text(ctx, 'Responsible', 160, 465, { size: 54, weight: 700, color: '#fff' });
    text(ctx, 'up to here →', 160, 530, { size: 54, weight: 700, color: '#fff' });
  });
  const pk = back(prog(t, 15.0, 15.5));
  if (pk > 0) { ctx.save(); ctx.translate(bx, 810); ctx.scale(pk, pk); pill(ctx, 'THE DEMARC', 0, 0, { size: 30, bg: C.tealB, color: C.navy, weight: 800, spacing: 6, padX: 34, h: 76 }); ctx.restore(); }
}

function sceneProblem(ctx, t) {
  bgLight(ctx, t);
  enter(ctx, appear(t, 17.5), () => {
    eyebrow(ctx, 'WHAT YOU PAY FOR', 160, 220);
    const n = Math.round(500 * eout(prog(t, 17.8, 19.0)));
    text(ctx, String(n), 150, 360, { size: 210, weight: 800, color: C.navy });
    text(ctx, 'Mbps', 160 + measure(ctx, String(n), 210, 800) + 10, 400, { size: 64, weight: 600, color: C.muted });
  });
  enter(ctx, appear(t, 19.3), () => {
    text(ctx, 'What you actually get,', 160, 540, { size: 42, weight: 600, color: C.ink });
    text(ctx, 'room by room →', 160, 595, { size: 42, weight: 600, color: C.teal });
  });
  const x0 = 880, y0 = 140, tw = 420, th = 330, g = 30;
  const tiles = [
    ['Living room', 18.6, 'good', 470], ['Bedroom', 19.7, 'bad', 40],
    ['Office', 21.4, 'call', null], ['Cameras', 23.6, 'cam', null],
  ];
  tiles.forEach(([name, at, kind, val], i) => {
    const x = x0 + (i % 2) * (tw + g), y = y0 + Math.floor(i / 2) * (th + g);
    enter(ctx, appear(t, at), () => {
      const bad = kind !== 'good';
      card(ctx, x, y, tw, th, { fill: bad ? C.redSoft : C.white, border: bad ? '#F3C9C9' : '#E3E9EC', shadow: 0.08 });
      text(ctx, name, x + 34, y + 52, { size: 32, weight: 700, color: C.navy });
      if (kind === 'good' || kind === 'bad') {
        const kk = eout(prog(t, at, at + 0.9)), shown = Math.round(val * kk);
        text(ctx, String(shown), x + 32, y + 170, { size: 110, weight: 800, color: bad ? C.red : C.green });
        text(ctx, 'Mbps', x + 44 + measure(ctx, String(shown), 110, 800), y + 190, { size: 34, weight: 600, color: C.muted });
        fillRR(ctx, x + 34, y + 262, tw - 68, 16, 8, bad ? '#F3C9C9' : '#D7EEDF');
        fillRR(ctx, x + 34, y + 262, Math.max(16, (tw - 68) * (val / 500) * kk), 16, 8, bad ? C.red : C.green);
      } else if (kind === 'call') {
        fillRR(ctx, x + 34, y + 90, tw - 68, 150, 16, C.navy);
        circle(ctx, x + 120, y + 165, 34, C.navy2);
        circle(ctx, x + 120, y + 152, 14, C.slate); fillRR(ctx, x + 96, y + 170, 48, 26, 13, C.slate);
        spinner(ctx, x + 290, y + 165, 30, t, C.tealB, 7);
        pill(ctx, 'Reconnecting…', x + tw / 2, y + 285, { size: 24, bg: C.red, color: '#fff', padX: 18, h: 46 });
      } else {
        iconCam(ctx, x + tw / 2, y + 160, 120, '#C9A9A9');
        line(ctx, x + tw / 2 - 75, y + 95, x + tw / 2 + 75, y + 225, C.red, 10);
        pill(ctx, 'OFFLINE', x + tw / 2, y + 285, { size: 24, bg: C.red, color: '#fff', padX: 22, h: 46, spacing: 3 });
      }
    });
  });
}

function sceneUpsell(ctx, t) {
  bgLight(ctx, t);
  // the bill
  enter(ctx, appear(t, 26.8), () => {
    card(ctx, 160, 150, 760, 660);
    text(ctx, 'Monthly bill', 210, 225, { size: 44, weight: 700, color: C.navy });
    text(ctx, 'Your internet provider', 210, 280, { size: 28, weight: 500, color: C.muted });
    const rows = [['Internet · 500 Mbps', '$70.00', 27.0, false], ['Wi-Fi extender rental', '+$15.00', 27.9, true], ['Managed Wi-Fi add-on', '+$10.00', 28.9, true]];
    rows.forEach(([l, v, at, add], i) => {
      const y = 375 + i * 95;
      enter(ctx, appear(t, at, 0.45), () => {
        if (add) fillRR(ctx, 190, y - 38, 700, 76, 14, C.redSoft);
        text(ctx, l, 214, y, { size: 32, weight: 600, color: C.ink });
        if (add) pill(ctx, 'NEW', 214 + measure(ctx, l, 32, 600) + 56, y, { size: 18, bg: C.red, color: '#fff', padX: 12, h: 32, spacing: 2 });
        text(ctx, v, 870, y, { size: 32, weight: 700, color: add ? C.red : C.ink, align: 'right' });
      }, 20);
    });
    line(ctx, 210, 680, 870, 680, C.line, 2);
    const total = 70 + 15 * eout(prog(t, 27.9, 28.4)) + 10 * eout(prog(t, 28.9, 29.4));
    text(ctx, 'Total', 214, 740, { size: 36, weight: 700, color: C.navy });
    text(ctx, `$${total.toFixed(2)}/mo`, 870, 740, { size: 40, weight: 800, color: total > 71 ? C.red : C.navy, align: 'right' });
  });
  // who's on the network?
  enter(ctx, appear(t, 29.8), () => {
    card(ctx, 1000, 150, 760, 660);
    text(ctx, 'Connected devices', 1050, 225, { size: 44, weight: 700, color: C.navy });
    text(ctx, 'Who’s on your network?', 1050, 280, { size: 28, weight: 500, color: C.muted });
    const devs = [['Jordan’s iPhone', true], ['Living room TV', true], ['Unknown device', false], ['ESP_3F21A', false], ['Unknown device', false]];
    devs.forEach(([n, ok], i) => {
      const y = 365 + i * 76;
      enter(ctx, appear(t, 30.2 + i * 0.32, 0.4), () => {
        circle(ctx, 1068, y, 9, ok ? C.green : C.amber);
        text(ctx, n, 1095, y, { size: 30, weight: ok ? 500 : 700, color: ok ? C.ink : C.navy });
        if (!ok) { circle(ctx, 1700, y, 22, C.amberSoft); text(ctx, '?', 1700, y + 2, { size: 28, weight: 800, color: C.amber, align: 'center' }); }
        if (i < devs.length - 1) line(ctx, 1050, y + 38, 1710, y + 38, '#EEF2F4', 2);
      }, 16);
    });
    text(ctx, '+ 31 more', 1050, 760, { size: 26, weight: 600, color: C.muted, alpha: prog(t, 32.0, 32.4) });
  });
}

function sceneReveal(ctx, t) {
  bgNavy(ctx, t);
  const ly = H / 2;
  const lk = eio(prog(t, 33.0, 34.4));
  if (lk > 0 && t < 35.4) {
    const a = 1 - prog(t, 34.9, 35.4);
    ctx.save(); ctx.globalAlpha *= a;
    line(ctx, 0, ly + 40, W * lk, ly + 40, C.tealB, 5);
    ctx.restore();
    glow(ctx, W * lk, ly + 40, 140, 'rgba(79,209,191,0.9)', 0.6 * a);
  }
  text(ctx, 'That’s where we come in.', W / 2, ly - 30, { size: 64, weight: 700, color: '#fff', align: 'center', alpha: prog(t, 33.2, 33.7) * (1 - prog(t, 34.6, 35.0)) });
  const k = prog(t, 34.9, 36.3);
  if (k > 0) {
    logo(ctx, W / 2 - 100, ly - 270, 200, k);
    const wa = prog(t, 35.9, 36.6);
    ctx.save(); ctx.translate(0, lerp(24, 0, eout(wa)));
    wordmark(ctx, W / 2, ly + 40, 110, wa);
    ctx.restore();
    text(ctx, 'We start where your ISP stops.', W / 2, ly + 150, { size: 44, weight: 500, color: C.mist, align: 'center', alpha: prog(t, 36.8, 37.4) });
    const pk = appear(t, 37.2);
    if (pk > 0) { ctx.save(); ctx.globalAlpha *= pk; pill(ctx, 'HOME NETWORKS & AUTOMATION', W / 2, ly + 240, { size: 22, bg: 'rgba(79,209,191,0.14)', color: C.tealB, spacing: 6, padX: 28, h: 56 }); ctx.restore(); }
  }
}

function sceneFix(ctx, t) {
  bgLight(ctx, t);
  // assessment card
  enter(ctx, appear(t, 38.6), () => {
    card(ctx, 140, 130, 720, 720);
    eyebrow(ctx, 'HOME NETWORK ASSESSMENT', 190, 195);
    text(ctx, 'From the demarc forward', 190, 255, { size: 42, weight: 700, color: C.navy });
    // score ring
    const sk = eout(prog(t, 38.9, 40.6)), score = Math.round(58 * sk);
    ctx.save(); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(290, 410, 80, 0, Math.PI * 2); ctx.strokeStyle = '#E8EDF0'; ctx.lineWidth = 20; ctx.stroke();
    if (sk > 0) { ctx.beginPath(); ctx.arc(290, 410, 80, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.58 * sk); ctx.strokeStyle = C.amber; ctx.stroke(); }
    ctx.restore();
    text(ctx, String(score), 290, 414, { size: 60, weight: 800, color: C.navy, align: 'center' });
    text(ctx, 'Overall score', 410, 390, { size: 28, weight: 600, color: C.muted });
    text(ctx, 'Needs attention', 410, 435, { size: 36, weight: 700, color: C.amber, alpha: prog(t, 40.3, 40.7) });
    [['Wi-Fi coverage', 39.4], ['Security', 39.9], ['Wiring', 40.4], ['Every device', 40.9]].forEach(([l, at], i) => {
      const y = 560 + i * 58;
      enter(ctx, appear(t, at - 0.2, 0.4), () => {
        text(ctx, l, 190, y, { size: 30, weight: 600, color: C.ink });
        text(ctx, 'Tested', 760, y, { size: 24, weight: 600, color: C.muted, align: 'right', alpha: prog(t, at, at + 0.3) });
        checkBadge(ctx, 800, y, 16, prog(t, at, at + 0.35), C.teal);
      }, 14);
    });
    enter(ctx, appear(t, 41.4, 0.5), () => {
      fillRR(ctx, 180, 770, 640, 56, 14, C.redSoft);
      circle(ctx, 210, 798, 8, C.red);
      text(ctx, 'Found: one router can’t reach the bedrooms', 232, 799, { size: 25, weight: 700, color: C.red });
    }, 14);
  });
  // a network you own (whoosh at 42.8)
  const cx = 1370, gw = eio(prog(t, 43.2, 43.9));
  enter(ctx, appear(t, 43.0), () => {
    eyebrow(ctx, 'A NETWORK YOU OWN', 1000, 170);
    const aps = [[1060, 470], [1370, 470], [1680, 470]];
    ctx.save(); ctx.globalAlpha *= gw;
    line(ctx, cx, 270, cx, 340, C.navy2, 5);
    aps.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(cx, 380); ctx.bezierCurveTo(cx, 430, x, 400, x, y - 46); ctx.strokeStyle = C.navy2; ctx.lineWidth = 5; ctx.stroke(); });
    ctx.restore();
    card(ctx, cx - 140, 215, 280, 64, { r: 32, fill: C.navy, border: null, shadow: 0.2 });
    text(ctx, 'Gateway', cx, 248, { size: 28, weight: 700, color: '#fff', align: 'center' });
    fillRR(ctx, cx - 110, 340, 220, 44, 22, C.navy2);
    text(ctx, 'PoE switch', cx, 363, { size: 22, weight: 700, color: C.mist, align: 'center' });
    aps.forEach(([x, y], i) => {
      const ak = back(prog(t, 43.7 + i * 0.25, 44.2 + i * 0.25));
      if (ak <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(ak, ak);
      const pulse = (t * 0.8 + i * 0.3) % 1;
      circle(ctx, 0, 0, 46 + pulse * 70, null, `rgba(18,165,148,${0.35 * (1 - pulse)})`, 3);
      circle(ctx, 0, 0, 46, C.white, C.line, 2);
      circle(ctx, 0, 0, 12, C.teal);
      ctx.restore();
    });
  });
  // strong in every room
  const rooms = [['Living room', '460'], ['Bedroom', '410'], ['Office', '430'], ['Cameras', 'Stable']];
  rooms.forEach(([n, v], i) => {
    const x = 960 + i * 205, y = 600;
    enter(ctx, appear(t, 45.3 + i * 0.22, 0.45), () => {
      fillRR(ctx, x, y, 190, 150, 18, C.greenSoft, '#BFE3CC', 1.5);
      text(ctx, n, x + 20, y + 40, { size: 24, weight: 600, color: C.ink });
      text(ctx, v, x + 18, y + 98, { size: v === 'Stable' ? 40 : 52, weight: 800, color: C.green });
      if (v !== 'Stable') text(ctx, 'Mbps', x + 22 + measure(ctx, v, 52, 800), y + 110, { size: 20, weight: 600, color: C.muted });
    }, 30);
  });
  const nk = back(prog(t, 46.4, 46.9));
  if (nk > 0) { ctx.save(); ctx.translate(1370, 830); ctx.scale(nk, nk); pill(ctx, 'You own it  ·  $0/mo rental fees', 0, 0, { size: 28, bg: C.teal, color: '#fff', padX: 32, h: 66 }); ctx.restore(); }
}

function sceneAutomation(ctx, t) {
  bgNavy(ctx, t, 1500, 300);
  eyebrow(ctx, 'SMART HOME', 160, 200, appear(t, 47.6), C.tealB);
  enter(ctx, appear(t, 47.8), () => text(ctx, 'Runs locally.', 156, 290, { size: 92, weight: 700, color: '#fff' }));
  enter(ctx, appear(t, 48.6), () => text(ctx, 'Keeps working when the internet doesn’t.', 160, 375, { size: 40, weight: 500, color: C.mist }));
  // internet status (goes down at 53.9)
  const off = t >= 53.9;
  const shake = off ? Math.sin((t - 53.9) * 60) * 10 * (1 - prog(t, 53.9, 54.4)) : 0;
  enter(ctx, appear(t, 48.4), () => {
    ctx.save(); ctx.translate(shake, 0);
    pill(ctx, off ? 'Internet · Offline' : 'Internet · Online', 1580, 215, { size: 28, bg: off ? 'rgba(214,69,69,0.18)' : 'rgba(46,157,91,0.18)', color: off ? '#FF8A8A' : '#7BE0A2', weight: 700, padX: 28, h: 66, dot: off ? C.red : C.green });
    ctx.restore();
  });
  const tiles = [
    ['Lights', 'On · 60%', 51.0, (x, y) => iconBulb(ctx, x, y, 60, C.tealB, true)],
    ['Front door', 'Locked', 51.7, (x, y) => iconLock(ctx, x, y, 60, C.tealB)],
    ['Cameras', 'Recording', 52.4, (x, y) => iconCam(ctx, x, y, 64, C.tealB)],
    ['Leak sensor', 'Dry', 53.1, (x, y) => iconDrop(ctx, x, y, 60, C.tealB)],
  ];
  tiles.forEach(([n, s, at, icon], i) => {
    const x = 160 + i * 410, y = 470;
    enter(ctx, appear(t, at, 0.5), () => {
      fillRR(ctx, x, y, 375, 300, 28, C.navy2, 'rgba(255,255,255,0.08)', 1.5);
      icon(x + 70, y + 80);
      circle(ctx, x + 330, y + 50, 9, C.green);
      text(ctx, n, x + 40, y + 190, { size: 36, weight: 700, color: '#fff' });
      text(ctx, s, x + 40, y + 245, { size: 30, weight: 600, color: C.tealB });
    }, 50);
  });
  const bk = back(prog(t, 54.6, 55.1));
  if (bk > 0) {
    ctx.save(); ctx.translate(W / 2, 850); ctx.scale(bk, bk);
    const pw = pill(ctx, '      Everything still works, running locally', 0, 0, { size: 30, bg: C.tealB, color: C.navy, weight: 700, padX: 36, h: 76 });
    checkBadge(ctx, -pw / 2 + 54, 0, 17, 1, C.navy);
    ctx.restore();
  }
}

function reportPage(ctx, x, y, w, h, rot, k, kind) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k); ctx.translate(x, y + (1 - k) * 80); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(14,36,51,0.18)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  fillRR(ctx, -w / 2, -h / 2, w, h, 14, kind === 'cover' ? C.navy : '#fff');
  ctx.restore();
  if (kind === 'cover') {
    logo(ctx, -w / 2 + 34, -h / 2 + 34, 44);
    text(ctx, 'AFTER THE DEMARK', -w / 2 + 88, -h / 2 + 57, { size: 16, weight: 700, color: '#fff', spacing: 3 });
    fillRR(ctx, -w / 2 + 34, -h / 2 + 150, 8, 100, 4, C.tealB);
    text(ctx, 'Home Network', -w / 2 + 34, 30, { size: 40, weight: 700, color: '#fff' });
    text(ctx, 'Assessment', -w / 2 + 34, 80, { size: 40, weight: 700, color: '#fff' });
    ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.clip();
    ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, h / 2 - 110, w, 110); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(w / 2 - 70, h / 2 - 55, 30, 0, Math.PI * 2); ctx.strokeStyle = '#E8EDF0'; ctx.lineWidth = 9; ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2 - 70, h / 2 - 55, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.58); ctx.strokeStyle = C.amber; ctx.stroke(); ctx.restore();
    text(ctx, 'Prepared for you', -w / 2 + 34, h / 2 - 55, { size: 22, weight: 600, color: C.navy });
  } else {
    fillRR(ctx, -w / 2 + 30, -h / 2 + 34, w - 60, 12, 6, C.navy);
    const cols = [C.red, C.red, C.amber, C.green];
    cols.forEach((c, i) => {
      const bx = -w / 2 + 30 + i * ((w - 60) / 4);
      fillRR(ctx, bx + 4, -h / 2 + 80, (w - 60) / 4 - 8, 90, 10, null, C.line, 2);
      fillRR(ctx, bx + 16, -h / 2 + 140, (w - 60) / 4 - 32, 8, 4, c);
    });
    for (let i = 0; i < 7; i++) fillRR(ctx, -w / 2 + 30, -h / 2 + 210 + i * 34, (w - 60) * (i % 3 === 2 ? 0.6 : 0.95), 10, 5, '#E3E9EC');
  }
  ctx.restore();
}
function sceneOffer(ctx, t) {
  bgLight(ctx, t);
  enter(ctx, appear(t, 57.6), () => {
    card(ctx, 160, 140, 760, 720);
    eyebrow(ctx, 'START HERE', 210, 205);
    text(ctx, 'Home Network Assessment', 210, 265, { size: 46, weight: 700, color: C.navy });
    text(ctx, '$249', 204, 375, { size: 120, weight: 800, color: C.navy });
    const label = 'Credited toward any work within 60 days';
    pill(ctx, label, 210 + (measure(ctx, label, 24, 700) + 48) / 2, 470, { size: 24, padX: 24, h: 54 });
    [['On-site, about 2 hours', 58.6], ['Every room tested', 59.3], ['Security & device review', 60.3], ['Written report you keep', 61.2], ['Zero pressure to buy', 62.6]].forEach(([l, at], i) => {
      const y = 560 + i * 58;
      enter(ctx, appear(t, at, 0.4), () => {
        checkBadge(ctx, 226, y, 16, prog(t, at, at + 0.35), C.teal);
        text(ctx, l, 262, y, { size: 32, weight: 600, color: C.ink });
      }, 14);
    });
  });
  reportPage(ctx, 1460, 520, 380, 500, 0.12, appear(t, 60.8, 0.7), 'page');
  reportPage(ctx, 1380, 500, 380, 500, 0.04, appear(t, 61.1, 0.7), 'page');
  reportPage(ctx, 1300, 490, 380, 500, -0.06, appear(t, 61.4, 0.7), 'cover');
}

function sceneEnd(ctx, t) {
  bgNavy(ctx, t);
  const a1 = prog(t, 64.9, 65.4) * (1 - prog(t, 66.4, 66.8));
  const a2 = prog(t, 65.9, 66.3) * (1 - prog(t, 66.4, 66.8));
  text(ctx, 'Your ISP is done.', W / 2, H / 2 - 55, { size: 80, weight: 600, color: C.mist, align: 'center', alpha: a1 });
  text(ctx, 'We’re just getting started.', W / 2, H / 2 + 55, { size: 80, weight: 800, color: C.tealB, align: 'center', alpha: a2 });
  const e = prog(t, 66.7, 67.6);
  if (e > 0) {
    logo(ctx, W / 2 - 70, 150, 140, prog(t, 66.7, 67.9));
    ctx.save(); ctx.globalAlpha *= e;
    wordmark(ctx, W / 2, 380, 92, 1);
    text(ctx, 'We start where your ISP stops.', W / 2, 470, { size: 38, weight: 500, color: C.mist, align: 'center' });
    const b = back(prog(t, 67.6, 68.1));
    ctx.save(); ctx.translate(W / 2, 610); ctx.scale(b, b);
    const pulse = 1 + 0.02 * Math.sin(t * 4) * prog(t, 68.5, 69);
    ctx.scale(pulse, pulse);
    glow(ctx, 0, 0, 280, 'rgba(79,209,191,0.8)', 0.3);
    fillRR(ctx, -310, -56, 620, 112, 56, C.tealB);
    text(ctx, 'Book an Assessment', 0, 3, { size: 48, weight: 800, color: C.navy, align: 'center' });
    ctx.restore();
    text(ctx, 'Call or text  (607) 857-3355', W / 2, 765, { size: 48, weight: 700, color: '#fff', align: 'center', alpha: prog(t, 68.0, 68.5) });
    text(ctx, 'Elmira · Corning · Horseheads · the Southern Tier', W / 2, 840, { size: 30, weight: 500, color: C.slate, align: 'center', alpha: prog(t, 68.4, 68.9) });
    ctx.restore();
  }
}

// ---------- timeline ----------
const DURATION = 73;
const SCENES = [
  [0, 10.6, sceneInstall], [10.4, 17.6, sceneDemarc], [17.4, 26.9, sceneProblem], [26.6, 33.1, sceneUpsell],
  [32.8, 38.8, sceneReveal], [38.5, 47.7, sceneFix], [47.4, 57.7, sceneAutomation], [57.4, 64.8, sceneOffer], [64.5, DURATION, sceneEnd],
];
const XF = 0.4; // crossfade seconds

// captions: [start, end, text]; long lines get split across these timings
const CAPS = [
  [5.0, 8.3, '“Okay… you’re connected. All done here!”'],
  [10.8, 13.0, 'And just like that… you’re on your own.'],
  [13.4, 17.3, 'Your internet provider’s job ends at that box. It’s called the demarc.'],
  [17.8, 21.4, 'You’re paying for 500 megabits. But the bedroom gets forty.'],
  [21.4, 23.6, 'The office buffers through every video call.'],
  [23.6, 26.5, 'And the cameras drop out right when you need them.'],
  [27.0, 30.0, 'Their answer? Rent another box. Add another monthly bill.'],
  [30.0, 32.9, 'And you still can’t see what’s on your network.'],
  [33.4, 34.6, 'That’s where we come in.'],
  [34.9, 38.2, 'After the Demark. We start where your ISP stops.'],
  [38.8, 41.2, 'We test your home from the demarc forward,'],
  [41.2, 43.4, 'find what’s really slowing you down,'],
  [43.4, 45.3, 'and design a network you own.'],
  [45.3, 47.4, 'Strong in every room. No rental fees.'],
  [47.9, 51.0, 'And with a solid foundation, your smart home runs locally.'],
  [51.0, 53.9, 'Lights, locks, cameras, and leak alerts'],
  [53.9, 57.3, 'that keep working, even when the internet goes down.'],
  [57.8, 61.0, 'Start with an on-site assessment.'],
  [61.0, 62.7, 'You get clear results and a written report,'],
  [62.7, 64.4, 'with zero pressure to buy anything.'],
  [64.9, 67.8, 'Your ISP is done. We’re just getting started.'],
];
function wrap(ctx, s, size, maxW) {
  const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (measure(ctx, n, size, 600) > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur); return lines;
}
function captions(ctx, t) {
  for (const [a, b, s] of CAPS) {
    if (t < a || t > b) continue;
    // skip where the same words are already on screen as a headline
    if ((a === 33.4) || (a === 34.9) || (a === 64.9) || (a === 5.0)) continue;
    // fade within the line's own window so back-to-back lines never overlap
    const al = prog(t, a, a + 0.15) * (1 - prog(t, b - 0.15, b));
    const size = 34, lines = wrap(ctx, s, size, 1500);
    const lw = Math.max(...lines.map(l => measure(ctx, l, size, 600)));
    const bh = lines.length * 46 + 28, by = H - 44 - bh;
    ctx.save(); ctx.globalAlpha = al;
    fillRR(ctx, W / 2 - lw / 2 - 36, by, lw + 72, bh, Math.min(bh / 2, 28), 'rgba(14,36,51,0.88)');
    lines.forEach((l, i) => text(ctx, l, W / 2, by + 14 + 23 + i * 46, { size, weight: 600, color: '#fff', align: 'center' }));
    ctx.restore();
  }
}

function render(ctx, t) {
  ctx.save();
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  for (const [a, b, fn] of SCENES) {
    if (t < a || t > b) continue;
    const alpha = prog(t, a, a + XF) * (b === DURATION ? 1 : 1 - prog(t, b - XF, b));
    ctx.save(); ctx.globalAlpha = a === 0 ? (1 - prog(t, b - XF, b)) : alpha;
    fn(ctx, t);
    ctx.restore();
  }
  captions(ctx, t);
  // fade in/out
  const f = Math.min(prog(t, 0, 0.6), 1 - prog(t, DURATION - 0.8, DURATION));
  if (f < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - f})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

module.exports = { render, W, H, DURATION };
