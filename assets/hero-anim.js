/* ============================================================
   PREAMBLE DESIGN — Hero architectural assembly
   A calm, cinematic loop that builds a luxury residence in
   warm axonometric linework, the way the studio works:

     1 floor plan draws itself
     2 exterior walls rise from the plan
     3 ceiling planes appear (coffered)
     4 mouldings & architectural trims snap into place
     5 stone surfaces & millwork panels glide in
     6 custom furniture assembles, component by component
     7 lighting & styling complete the room
     8 the camera settles on the finished interior

   Architectural — not abstract. Subtle 3D depth, layered
   parallax, premium quint easing, a slow push-in with a
   gentle drift, and a warm "lights-on" reveal. Seamless loop.
   Material accents (oak / fabric / brass) warm the furniture
   and lighting; the shell stays neutral linework.
   Colours follow CSS vars. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const stage = document.getElementById("hero-stage");
  if (!stage) return;

  /* ---------- material accents (warm stone / oak / soft brass) ---------- */
  const OAK = "#9c7a52";
  const FABRIC = "#8f8166";
  const BRASS = "#c79a5e";
  const THROW = "#ab9573";
  const PAGE = "#efe9da";
  const ART1 = "#a8694f"; // muted clay wash, framed artwork
  const ART2 = "#7c8268"; // muted sage wash, framed artwork

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "175 108 470 404");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("class", "hero-svg");
  stage.insertBefore(svg, stage.firstChild);

  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML =
    '<radialGradient id="heroGlow" cx="50%" cy="36%" r="62%">' +
    '<stop offset="0%" stop-color="#e6c08c" stop-opacity="1"/>' +
    '<stop offset="50%" stop-color="#cda979" stop-opacity="0.4"/>' +
    '<stop offset="100%" stop-color="#cda979" stop-opacity="0"/>' +
    "</radialGradient>" +
    '<radialGradient id="heroPool" cx="50%" cy="50%" r="50%">' +
    '<stop offset="0%" stop-color="#c79a5e" stop-opacity="0.9"/>' +
    '<stop offset="66%" stop-color="#c79a5e" stop-opacity="0.18"/>' +
    '<stop offset="100%" stop-color="#c79a5e" stop-opacity="0"/>' +
    "</radialGradient>";
  svg.appendChild(defs);

  /* ---------- camera + parallax layers ---------- */
  const cam = document.createElementNS(NS, "g");
  cam.style.transformBox = "view-box";
  cam.style.transformOrigin = "410px 320px";
  svg.appendChild(cam);
  const layerBack = document.createElementNS(NS, "g");
  const layerMid = document.createElementNS(NS, "g");
  const layerFore = document.createElementNS(NS, "g");
  cam.appendChild(layerBack);
  cam.appendChild(layerMid);
  cam.appendChild(layerFore);
  let LAYER = layerMid;

  /* ---------- axonometric projection ---------- */
  const OX = 410, OY = 248;
  const UX = 0.866, UY = 0.5, VX = -0.866, VY = 0.5;
  function iso(x, y, z) {
    return [OX + x * UX + y * VX, OY + x * UY + y * VY - z];
  }
  const P = (pt) => pt[0].toFixed(1) + "," + pt[1].toFixed(1);
  const line = (a, b) => "M" + P(a) + " L" + P(b);
  const poly = (pts, close) => "M" + pts.map(P).join(" L") + (close ? " Z" : "");

  /* ---------- element factory + timeline registry ---------- */
  const anims = [];
  function el(tag) { return document.createElementNS(NS, tag); }

  function stroke(d, cls, start, end, maxOp, out) {
    const p = el("path");
    p.setAttribute("d", d);
    p.setAttribute("class", "hs-ln " + (cls || ""));
    p.style.opacity = 0;
    LAYER.appendChild(p);
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    const a = { el: p, type: "draw", start, end, len, maxOp: maxOp ?? 0.6 };
    if (out) { a.outStart = out[0]; a.outEnd = out[1]; }
    anims.push(a);
    return p;
  }
  function fill(d, cls, start, end, maxOp, dy, out) {
    const p = el("path");
    p.setAttribute("d", d);
    p.setAttribute("class", "hs-fl " + (cls || ""));
    p.style.opacity = 0;
    LAYER.appendChild(p);
    const a = { el: p, type: "float", start, end, maxOp, dx: 0, dy: dy || 0 };
    if (out) { a.outStart = out[0]; a.outEnd = out[1]; }
    anims.push(a);
    return p;
  }

  /* an iso volume that assembles into place (top + 2 faces + crisp wireframe).
     fop scales face shading; dy = travel distance for the float-in. */
  function vol(x, y, z, sx, sy, sz, start, end, dy, fop, color) {
    const g = el("g");
    g.style.opacity = 0;
    const c = (a, b, h) => iso(x + a, y + b, z + h);
    const f = fop ?? 1;
    [
      { d: poly([c(0,0,sz), c(sx,0,sz), c(sx,sy,sz), c(0,sy,sz)], true), op: (color ? 0.85 : 0.20) * f },
      { d: poly([c(sx,0,0), c(sx,sy,0), c(sx,sy,sz), c(sx,0,sz)], true), op: (color ? 0.62 : 0.13) * f },
      { d: poly([c(0,sy,0), c(sx,sy,0), c(sx,sy,sz), c(0,sy,sz)], true), op: (color ? 0.46 : 0.09) * f },
    ].forEach((face) => {
      const p = el("path");
      p.setAttribute("d", face.d);
      p.setAttribute("class", "hs-face");
      p.style.setProperty("--op", face.op.toFixed(3));
      if (color) p.style.fill = color;
      g.appendChild(p);
    });
    const o = el("path");
    o.setAttribute("d",
      poly([c(0,0,sz), c(sx,0,sz), c(sx,sy,sz), c(0,sy,sz)], true) + " " +
      line(c(sx,0,sz), c(sx,0,0)) + " " + line(c(sx,sy,sz), c(sx,sy,0)) + " " + line(c(0,sy,sz), c(0,sy,0)));
    o.setAttribute("class", "hs-ln");
    o.style.opacity = 0.5;
    g.appendChild(o);
    LAYER.appendChild(g);
    anims.push({ el: g, type: "float", start, end, maxOp: 1, dx: 0, dy: dy ?? 30 });
    return g;
  }
  // thin vertical leg
  function leg(x, y, w, h, start, end, color) { return vol(x, y, 0, w, w, h, start, end, 10, 0.7, color); }
  function group(start, end, dy) {
    const g = el("g"); g.style.opacity = 0; LAYER.appendChild(g);
    anims.push({ el: g, type: "float", start, end, maxOp: 1, dx: 0, dy: dy ?? 16 });
    return g;
  }
  function raw(parent, d, op, soft) {
    const p = el("path"); p.setAttribute("d", d);
    p.setAttribute("class", "hs-ln" + (soft ? " soft" : ""));
    p.style.opacity = op; parent.appendChild(p); return p;
  }

  /* ============ FURNITURE — composed from components ============ */
  // Sofa against the left wall (x≈0), facing into the room
  function sofa(t) {
    vol(14, 38, 4, 48, 126, 12, t, t + 0.09, 26, 0.85, OAK);             // plinth (oak base)
    [42, 84, 126].forEach((yy, i) =>
      vol(18, yy, 16, 40, 38, 13, t + 0.05 + i * 0.018, t + 0.13 + i * 0.018, -20, 1, FABRIC)); // seat cushions drop in
    [42, 84, 126].forEach((yy, i) =>
      vol(14, yy, 16, 12, 38, 40, t + 0.08 + i * 0.018, t + 0.16 + i * 0.018, 22, 1, FABRIC));  // back cushions
    vol(14, 30, 4, 48, 8, 42, t + 0.12, t + 0.20, 20, 0.8, FABRIC);    // arm (front)
    vol(14, 164, 4, 48, 8, 42, t + 0.12, t + 0.20, 20, 0.8, FABRIC);   // arm (back)
  }
  // Console / stone sideboard against the right wall (y≈0)
  function consoleUnit(t) {
    vol(118, 8, 16, 80, 24, 42, t, t + 0.10, 24, 1, OAK);              // body (raised)
    [[120,10],[191,10],[120,27],[191,27]].forEach(([lx, ly]) => leg(lx, ly, 5, 16, t + 0.05, t + 0.13, BRASS));
    // drawer divisions + handles on the front face (y = 32, facing viewer)
    [145, 171].forEach((x) => stroke(line(iso(x,32,18), iso(x,32,56)), "fine", t + 0.10, t + 0.18, 0.4));
    [131, 158, 184].forEach((x) => stroke(line(iso(x-6,32,46), iso(x+6,32,46)), "fine", t + 0.13, t + 0.20, 0.42));
  }
  // Coffee table, centre
  function coffeeTable(t) {
    vol(84, 80, 23, 56, 54, 5, t, t + 0.09, 18, 1, OAK);               // top slab
    [[88,84],[133,84],[88,128],[133,128]].forEach(([lx, ly]) => leg(lx, ly, 6, 23, t + 0.04, t + 0.12, OAK));
  }
  // Chandelier, centred over the room (brass rod + ring + radiating arms)
  function chandelier(t) {
    const cx = 110, cy = 110, topZ = 160, ringZ = 122, dropZ = 110;
    const N = 8, R = 24;
    const g = group(t, t + 0.18, -64); // slow, deliberate lowering from the ceiling
    raw(g, line(iso(cx, cy, topZ), iso(cx, cy, ringZ)), 0.55, true).style.stroke = BRASS;
    const ringPts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      ringPts.push(iso(cx + Math.cos(a) * R, cy + Math.sin(a) * R, ringZ));
    }
    const ring = raw(g, poly(ringPts, true), 0.55);
    ring.style.fill = "none"; ring.style.stroke = BRASS;
    ringPts.forEach((p, i) => {
      raw(g, line(iso(cx, cy, ringZ), p), 0.42).style.stroke = BRASS;
      const a = (i / N) * Math.PI * 2;
      const drop = iso(cx + Math.cos(a) * R, cy + Math.sin(a) * R, dropZ);
      raw(g, line(p, drop), 0.4).style.stroke = BRASS;
      const bulb = el("ellipse");
      bulb.setAttribute("cx", drop[0]); bulb.setAttribute("cy", drop[1]);
      bulb.setAttribute("rx", 2.6); bulb.setAttribute("ry", 1.7);
      bulb.setAttribute("class", "hs-ln");
      bulb.style.opacity = 0.55; bulb.style.fill = BRASS; bulb.style.fillOpacity = 0.55; bulb.style.stroke = BRASS;
      g.appendChild(bulb);
    });
    const centre = el("ellipse");
    const cpt = iso(cx, cy, ringZ - 4);
    centre.setAttribute("cx", cpt[0]); centre.setAttribute("cy", cpt[1]);
    centre.setAttribute("rx", 4.5); centre.setAttribute("ry", 2.8);
    centre.setAttribute("class", "hs-ln");
    centre.style.opacity = 0.55; centre.style.fill = BRASS; centre.style.fillOpacity = 0.6; centre.style.stroke = BRASS;
    g.appendChild(centre);
  }
  // A throw draped over the front sofa arm — a small "lived-in" touch
  function throwBlanket(t) {
    const z0 = 46; // arm top
    const top = fill(poly([iso(10,27,z0+1), iso(66,27,z0+1), iso(66,41,z0+1), iso(10,41,z0+1)], true), "", t, t + 0.09, 0.88, 18);
    top.style.fill = THROW; top.style.stroke = "none";
    const flap = fill(poly([iso(62,30,z0), iso(62,38,z0), iso(62,38,16), iso(62,30,16)], true), "", t + 0.02, t + 0.11, 0.82, 14);
    flap.style.fill = THROW; flap.style.stroke = "none";
    stroke(line(iso(18,29,z0+1), iso(58,29,z0+1)), "fine", t + 0.05, t + 0.14, 0.3);
    stroke(line(iso(62,32,z0-3), iso(62,32,20)), "fine", t + 0.05, t + 0.14, 0.26);
  }
  // An open book left face-up on the coffee table
  function openBook(t) {
    const z = 28.4, cx = 100, cy = 118;
    const pl = fill(poly([iso(cx-14,cy-9,z), iso(cx,cy-7,z), iso(cx,cy+9,z), iso(cx-14,cy+7,z)], true), "", t, t + 0.08, 0.88, 10);
    pl.style.fill = PAGE; pl.style.stroke = "none";
    const pr = fill(poly([iso(cx,cy-7,z), iso(cx+14,cy-9,z), iso(cx+14,cy+7,z), iso(cx,cy+9,z)], true), "", t + 0.015, t + 0.095, 0.88, 10);
    pr.style.fill = PAGE; pr.style.stroke = "none";
    stroke(line(iso(cx,cy-7,z), iso(cx,cy+9,z)), "fine", t + 0.04, t + 0.12, 0.4);
    [3, 6].forEach((o, i) =>
      stroke(line(iso(cx-11,cy-9+o,z), iso(cx-3,cy-8+o,z)), "fine", t + 0.06 + i*0.01, t + 0.14 + i*0.01, 0.2));
  }
  // Lounge chair, front-right
  function chair(t) {
    vol(150, 118, 4, 40, 40, 12, t, t + 0.09, 22, 0.85, OAK);          // plinth
    vol(154, 122, 16, 32, 32, 13, t + 0.05, t + 0.13, -18, 1, FABRIC); // seat cushion
    vol(150, 150, 16, 40, 8, 40, t + 0.08, t + 0.16, 20, 1, FABRIC);   // back
    vol(150, 118, 16, 6, 40, 26, t + 0.10, t + 0.18, 18, 0.8, FABRIC); // arm
    vol(184, 118, 16, 6, 40, 26, t + 0.10, t + 0.18, 18, 0.8, FABRIC); // arm
  }

  /* ---------- wall panelling (architectural moulding) ---------- */
  function panelsRight(t) {   // y = 0 plane
    [[16,66],[85,135],[154,204]].forEach(([x1, x2], i) => {
      stroke(poly([iso(x1,0,28),iso(x2,0,28),iso(x2,0,132),iso(x1,0,132)], true), "fine", t + i*0.02, t + 0.10 + i*0.02, 0.32);
      stroke(poly([iso(x1+6,0,34),iso(x2-6,0,34),iso(x2-6,0,126),iso(x1+6,0,126)], true), "fine", t + 0.04 + i*0.02, t + 0.14 + i*0.02, 0.21);
    });
  }
  function panelsLeft(t) {    // x = 0 plane
    [[18,80],[96,158]].forEach(([y1, y2], i) => {
      stroke(poly([iso(0,y1,28),iso(0,y2,28),iso(0,y2,132),iso(0,y1,132)], true), "fine", t + i*0.02, t + 0.10 + i*0.02, 0.32);
      stroke(poly([iso(0,y1+6,34),iso(0,y2-6,34),iso(0,y2-6,126),iso(0,y1+6,126)], true), "fine", t + 0.04 + i*0.02, t + 0.14 + i*0.02, 0.21);
    });
  }
  function coffers(t) {       // ceiling z = 160
    const z = 160;
    [73, 147].forEach((x, i) => stroke(line(iso(x,0,z), iso(x,220,z)), "soft", t + i*0.015, t + 0.12, 0.19));
    [73, 147].forEach((y, i) => stroke(line(iso(0,y,z), iso(220,y,z)), "soft", t + i*0.015, t + 0.12, 0.19));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x1 = 10 + i*73, y1 = 10 + j*73;
      stroke(poly([iso(x1,y1,z),iso(x1+53,y1,z),iso(x1+53,y1+53,z),iso(x1,y1+53,z)], true),
        "fine", t + 0.04 + (i+j)*0.008, t + 0.14 + (i+j)*0.008, 0.13);
    }
  }

  /* ============ BUILD — back to front ============ */
  const B = iso(0,0,0), R = iso(220,0,0), F = iso(220,220,0), L = iso(0,220,0);
  const Bt = iso(0,0,160), Rt = iso(220,0,160), Lt = iso(0,220,160), Ft = iso(220,220,160);

  /* ---- BACK : floor plan, light, structure, ceiling, trim ---- */
  LAYER = layerBack;
  // 1 · floor plan
  fill(poly([B,R,F,L], true), "fl-floor", 0.00, 0.09, 0.07);
  stroke(poly([B,R,F,L], true), "", 0.00, 0.11, 0.58);
  [55,110,165].forEach((y,i)=>stroke(line(iso(0,y,0), iso(220,y,0)), "soft", 0.02+i*0.012, 0.14+i*0.012, 0.34, [0.50,0.70]));
  [55,110,165].forEach((x,i)=>stroke(line(iso(x,0,0), iso(x,220,0)), "soft", 0.04+i*0.012, 0.16+i*0.012, 0.34, [0.50,0.70]));
  // plank floor hint (drawn faint, lingers)
  [28,56,84,112,140,168,196].forEach((x,i)=>stroke(line(iso(x,0,0.5), iso(x,220,0.5)), "fine", 0.40+i*0.008, 0.50+i*0.008, 0.12));
  // warm floor light-pool (reveal)
  (function(){
    const ctr = iso(112,116,0);
    const e = el("ellipse");
    e.setAttribute("cx", ctr[0]); e.setAttribute("cy", ctr[1]);
    e.setAttribute("rx", 172); e.setAttribute("ry", 88);
    e.setAttribute("fill", "url(#heroPool)");
    e.style.mixBlendMode = "multiply"; e.style.opacity = 0;
    layerBack.appendChild(e);
    anims.push({ el: e, type: "float", start: 0.72, end: 0.88, maxOp: 0.40, dx: 0, dy: 0 });
  })();
  fill(poly([iso(70,30,0),iso(178,30,0),iso(178,178,0),iso(70,178,0)], true), "fl-rug", 0.50, 0.62, 0.16);
  // 2 · walls rise
  fill(poly([B,R,Rt,Bt], true), "fl-wall", 0.11, 0.25, 0.09, -30);
  fill(poly([B,L,Lt,Bt], true), "fl-wall", 0.11, 0.25, 0.09, -30);
  stroke(line(B,Bt), "", 0.11, 0.22, 0.6);
  stroke(line(R,Rt), "", 0.13, 0.24, 0.6);
  stroke(line(L,Lt), "", 0.13, 0.24, 0.6);
  stroke(line(Bt,Rt), "", 0.20, 0.30, 0.5);
  stroke(line(Bt,Lt), "", 0.20, 0.30, 0.5);
  // 3 · ceiling planes + coffers
  fill(poly([Bt,Rt,Ft,Lt], true), "fl-ceil", 0.24, 0.34, 0.06, -12);
  coffers(0.25);
  // 4 · mouldings & trim — cornice + skirting + wall panels
  stroke(line(Bt,Rt) + " " + line(Bt,Lt), "fine", 0.31, 0.40, 0.6);
  stroke(line(iso(0,0,10),iso(220,0,10)) + " " + line(iso(0,0,10),iso(0,220,10)), "fine", 0.33, 0.42, 0.5);
  panelsRight(0.34);
  panelsLeft(0.34);

  /* ---- MID : stone & millwork, artwork, sofa, table ---- */
  LAYER = layerMid;
  // 5 · stone surfaces & millwork — tall millwork on left wall + console
  [22,80,138].forEach((y,i)=>{
    stroke(poly([iso(0,y,12),iso(0,y+44,12),iso(0,y+44,150),iso(0,y,150)], true), "fine", 0.41+i*0.02, 0.52+i*0.02, 0.4);
  });
  consoleUnit(0.43);
  // framed artwork on the right wall (linework + a subtle painted wash)
  stroke(poly([iso(112,0,62),iso(180,0,62),iso(180,0,128),iso(112,0,128)], true), "", 0.47, 0.57, 0.5);
  (function(){
    const top = fill(poly([iso(118,0,68),iso(174,0,68),iso(174,0,96),iso(118,0,96)], true), "", 0.50, 0.60, 0.30, 6);
    top.style.fill = ART1; top.style.stroke = "none";
    const bottom = fill(poly([iso(118,0,96),iso(174,0,96),iso(174,0,122),iso(118,0,122)], true), "", 0.52, 0.62, 0.24, 6);
    bottom.style.fill = ART2; bottom.style.stroke = "none";
  })();
  stroke(poly([iso(118,0,68),iso(174,0,68),iso(174,0,122),iso(118,0,122)], true), "fine", 0.50, 0.60, 0.3);
  // 6 · custom furniture, component by component
  sofa(0.52);
  coffeeTable(0.60);

  /* ---- FORE : chair, lighting, styling, glow ---- */
  LAYER = layerFore;
  chair(0.62);
  // chandelier, centred over the room
  chandelier(0.66);
  // warm brass glow blooming under the chandelier as it settles — the "lights on" beat
  (function(){
    const ctr = iso(110, 110, 60);
    const e = el("ellipse");
    e.setAttribute("cx", ctr[0]); e.setAttribute("cy", ctr[1]);
    e.setAttribute("rx", 70); e.setAttribute("ry", 40);
    e.setAttribute("fill", "url(#heroPool)");
    e.style.mixBlendMode = "multiply"; e.style.opacity = 0;
    layerFore.appendChild(e);
    anims.push({ el: e, type: "float", start: 0.74, end: 0.86, maxOp: 0.34, dx: 0, dy: 0 });
  })();
  // floor lamp (front-left corner)
  const lamp = group(0.70, 0.79, 24);
  (function(){
    raw(lamp, line(iso(40,188,0), iso(40,188,150)), 0.6).style.stroke = BRASS;
    const h = raw(lamp, poly([iso(30,188,150),iso(40,178,150),iso(50,188,150),iso(40,198,150)],true), 0.6);
    h.style.fill = BRASS; h.style.fillOpacity = 0.55; h.style.stroke = BRASS;
  })();
  // styling — vases on the coffee table
  const vases = group(0.72, 0.80, 14);
  [[104,100,28,7,18],[118,112,28,5,13]].forEach(([x,y,z,r,ht])=>{
    raw(vases, line(iso(x,y,z), iso(x,y,z+ht)), 0.6);
    const e = el("ellipse"); const t = iso(x,y,z+ht);
    e.setAttribute("cx", t[0]); e.setAttribute("cy", t[1]); e.setAttribute("rx", r); e.setAttribute("ry", r*0.5);
    e.setAttribute("class","hs-ln"); e.style.opacity = 0.6; e.style.fill = "var(--stone)"; e.style.fillOpacity = 0.14;
    vases.appendChild(e);
  });
  // stack of books on console
  const books = group(0.71, 0.79, 12);
  raw(books, poly([iso(170,14,42),iso(190,14,42),iso(190,26,42),iso(170,26,42)],true), 0.5).style.fill="none";
  const bookTop = raw(books, poly([iso(170,14,42),iso(190,14,42),iso(190,14,48),iso(170,14,48)],true), 0.5);
  bookTop.style.fill = FABRIC; bookTop.style.fillOpacity = 0.5;
  // human touch — a throw left on the sofa, a book left open mid-read
  throwBlanket(0.74);
  openBook(0.76);
  // 8 · warm glow wash for the reveal
  const glow = el("rect");
  glow.setAttribute("x", 150); glow.setAttribute("y", 95);
  glow.setAttribute("width", 520); glow.setAttribute("height", 430);
  glow.setAttribute("fill", "url(#heroGlow)");
  glow.style.mixBlendMode = "multiply"; glow.style.opacity = 0;
  layerFore.appendChild(glow);
  anims.push({ el: glow, type: "float", start: 0.72, end: 0.88, maxOp: 0.32, dx: 0, dy: 0 });

  /* ---------- phase caption ---------- */
  const labels = [
    [0.00, "Floor plan"], [0.11, "Structure"], [0.24, "Ceiling"],
    [0.31, "Mouldings & trim"], [0.41, "Stone & millwork"],
    [0.52, "Custom furniture"], [0.66, "Lighting & styling"], [0.80, "Every detail considered"],
  ];
  const capEl = document.getElementById("hero-cap-label");
  const numEl = document.getElementById("hero-cap-num");
  let capIdx = -1;

  /* ---------- timeline + premium easing ---------- */
  const T = 8200;
  const quint = (t) => (t < 0.5 ? 16*t*t*t*t*t : 1 - Math.pow(-2*t + 2, 5) / 2);
  const outQuart = (t) => 1 - Math.pow(1 - t, 4);
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function camera(p) {
    let settle = quint(Math.min(p, 0.86) / 0.86);
    if (p > 0.92) settle *= 1 - (p - 0.92) / 0.08;
    const cs = 1 + 0.078 * settle;
    const ctx = -7 + 13 * settle;          // gentle drift across
    const cty = 9 - 17 * settle;           // settle upward
    cam.style.transform = `translate(${ctx.toFixed(2)}px,${cty.toFixed(2)}px) scale(${cs.toFixed(4)})`;
    layerBack.style.transform = `translate(${(2.5*settle).toFixed(2)}px,${(-3*settle).toFixed(2)}px)`;
    layerMid.style.transform  = `translate(${(-1*settle).toFixed(2)}px,${(-9*settle).toFixed(2)}px)`;
    layerFore.style.transform = `translate(${(-5*settle).toFixed(2)}px,${(-20*settle).toFixed(2)}px)`;
  }

  function apply(p) {
    camera(p);
    const gfade = 1 - smooth((p - 0.93) / 0.07);
    for (const a of anims) {
      let g = gfade;
      if (a.outStart != null && p > a.outStart)
        g *= 1 - smooth((p - a.outStart) / (a.outEnd - a.outStart));
      const lt = Math.max(0, Math.min(1, (p - a.start) / (a.end - a.start)));
      if (a.type === "draw") {
        a.el.style.strokeDashoffset = (a.len * (1 - quint(lt))).toFixed(1);
        a.el.style.opacity = (a.maxOp * smooth(lt * 3) * g).toFixed(3);
      } else {
        const e = outQuart(lt);
        a.el.style.opacity = (a.maxOp * smooth(lt * 1.7) * g).toFixed(3);
        a.el.style.transform = `translateY(${(a.dy * (1 - e)).toFixed(1)}px)`;
      }
    }
    let idx = 0;
    for (let i = 0; i < labels.length; i++) if (p >= labels[i][0]) idx = i;
    if (idx !== capIdx) {
      capIdx = idx;
      if (capEl) {
        capEl.style.opacity = 0;
        setTimeout(() => { capEl.textContent = labels[idx][1]; capEl.style.opacity = 1; }, 180);
      }
      if (numEl) numEl.textContent = String(idx + 1).padStart(2, "0") + " / 08";
    }
  }

  if (reduce) { apply(0.86); return; }
  let paused = false;
  window.__heroFreeze = (p) => { paused = true; apply(p); };
  window.__heroPlay = () => { paused = false; };
  function frame(now) {
    if (!paused) apply((now % T) / T);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
