/* Rupesh Chikan Industries — prototype
   Hero reveal ported from the Spider-Man demo: trail of circles in an off-screen canvas,
   top image composited with source-in so the chikankari shows only inside the trail. */
(function () {
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const rupee = n => '₹' + n.toLocaleString('en-IN');

/* ---------------- data ---------------- */
const IMG = (id, w = 600, h = 750) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=faces,center&q=72&auto=format`;
const IMG_ZOOM = (id, w = 600, h = 750) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=focalpoint&fp-x=.5&fp-y=.42&fp-z=2.1&q=72&auto=format`;

// names, prices and MRPs for the first eight are RCI's own listings; the rest are sample styles
const PRODUCTS = [
  { id: 'noori',      n: 'Noori Flamingo Bridal Saree', cat: 'saree',      p: 15500, mrp: 35000, r: 4.9, rv: 128, img: '1617627143750-d86bc21e42bb', tags: ['best', 'gift'], badge: 'Bridal edit 💍' },
  { id: 'red-bridal', n: 'Red Bridal Suit Set',         cat: 'suit',       p: 4799,  mrp: 12000, r: 4.8, rv: 212, img: '1764928947261-f5687e0faa4a', tags: ['best', 'gift'], badge: 'Bestseller' },
  { id: 'ruhi',       n: 'Ruhi Mukaish Saree',          cat: 'saree',      p: 9500,  mrp: 25000, r: 4.9, rv: 96,  img: '1609748340041-f5d61e061ebc', tags: ['new', 'gift'],  badge: 'Mukaish ✨' },
  { id: 'mul',        n: 'Mul Chanderi Suit',           cat: 'unstitched', p: 3500,  mrp: 9500,  r: 4.7, rv: 154, img: '1667665970118-f55705003914', tags: ['best', 'new'] },
  { id: 'sharadha',   n: 'Sharadha Kurti',              cat: 'kurti',      p: 999,   mrp: 2500,  r: 4.8, rv: 430, img: '1745313452052-0e4e341f326c', tags: ['best', 'under'], badge: 'Viral 🔥' },
  { id: 'bhumi',      n: 'Bhumi Kurti',                 cat: 'kurti',      p: 999,   mrp: 2150,  r: 4.7, rv: 288, img: '1741847639057-b51a25d42892', tags: ['under', 'new'] },
  { id: 'palazzo',    n: 'Muslin Palazzo Co-ord',       cat: 'bottom',     p: 900,   mrp: 1500,  r: 4.6, rv: 198, img: '1762777777819-4d9aa5529368', tags: ['under', 'new'] },
  { id: 'bakhiya',    n: 'Bakhiya Pant Set',            cat: 'bottom',     p: 650,   mrp: 1500,  r: 4.7, rv: 341, img: '1768033976371-0e4ef195dfa2', tags: ['under', 'best'], badge: 'Only 5 left' },
  { id: 'zoya',       n: 'Zoya Wine Kurta Set',         cat: 'suit',       p: 2899,  mrp: 5500,  r: 4.9, rv: 176, img: '1708534419572-6e6614a53ca1', tags: ['best', 'gift'] },
  { id: 'aabha',      n: 'Aabha Ivory Anarkali',        cat: 'suit',       p: 3299,  mrp: 7000,  r: 4.8, rv: 84,  img: '1667665970124-2273c6ef3489', tags: ['new', 'gift'],  badge: 'Only 4 left' },
  { id: 'mehr',       n: 'Mehr Plum Long Kurti',        cat: 'kurti',      p: 1799,  mrp: 3800,  r: 4.8, rv: 132, img: '1708534246051-7f47b279e94b', tags: ['new'] },
  { id: 'gulabi',     n: 'Gulabi Chikan Kurta (Men)',   cat: 'kurti',      p: 1499,  mrp: 3000,  r: 4.7, rv: 64,  img: '1667665970121-c3504c519cda', tags: ['new', 'gift'],  badge: 'New: menswear' },
  { id: 'hari',       n: 'Hari Sharara Set',            cat: 'suit',       p: 3999,  mrp: 8500,  r: 4.8, rv: 91,  img: '1597983073750-16f5ded1321f', tags: ['gift'] },
  { id: 'gulnaar',    n: 'Gulnaar Printed Co-ord',      cat: 'suit',       p: 2499,  mrp: 4999,  r: 4.6, rv: 77,  img: '1767785829347-cc13bd969514', tags: ['new'] },
  { id: 'mehndi',     n: 'Mehndi Maroon Kurta',         cat: 'kurti',      p: 1599,  mrp: 3200,  r: 4.8, rv: 143, img: '1708534246055-d7b149acb731', tags: ['best'] },
  { id: 'rose',       n: 'Rose Mul Kurta Set',          cat: 'suit',       p: 2199,  mrp: 4400,  r: 4.7, rv: 58,  img: '1765529374927-052599af9c82', tags: ['gift'] },
];
const CAT_NAME = { suit: 'Suit set', saree: 'Saree', kurti: 'Kurti', bottom: 'Bottom wear', unstitched: 'Unstitched' };
const CHIPS = [['all', 'All'], ['best', 'Bestsellers'], ['new', 'New drops'], ['under', 'Under ₹999'], ['suit', 'Suit sets'], ['saree', 'Sarees'], ['kurti', 'Kurtis'], ['bottom', 'Bottoms'], ['unstitched', 'Unstitched']];

const VIBES = [
  { k: 'saree',      t: 'Shaadi szn',     s: 'Bridal sarees & mukaish',  img: '1617627143750-d86bc21e42bb' },
  { k: 'suit',       t: 'Festive fits',   s: 'Suit sets for every pooja', img: '1764928947261-f5687e0faa4a' },
  { k: 'kurti',      t: 'Office-core',    s: 'Kurtis that pass the meet', img: '1745313452052-0e4e341f326c' },
  { k: 'bottom',     t: 'College drip',   s: 'Co-ords, palazzos, pants',  img: '1762777777819-4d9aa5529368' },
  { k: 'unstitched', t: 'DIY tailor era', s: 'Unstitched suit fabric',    img: '1667665970118-f55705003914' },
];

const REELS = [
  { img: '1708534419572-6e6614a53ca1', who: 'aanya.wears', pid: 'zoya' },
  { img: '1597983073540-684a10b15ab1', who: 'meher.in.lko', pid: 'hari' },
  { img: '1667665970124-9d2606f4f7f7', who: 'kabir.fits',   pid: 'gulabi' },
  { img: '1765529374927-052599af9c82', who: 'riya.ootd',    pid: 'rose' },
  { img: '1708534246055-d7b149acb731', who: 'sana.styles',  pid: 'mehndi' },
  { img: '1667665970118-f55705003914', who: 'tanvi.diaries', pid: 'mul' },
];

const REVIEWS = [
  ['Wore the Zoya set to my cousin’s mehendi and got asked “where from?” six times.', 'Aanya', 'Delhi'],
  ['The fabric is so soft and the handwork is unreal up close. Feels expensive.', 'Priya', 'Pune'],
  ['Ordered to Toronto over WhatsApp. Smooth, fast, packed beautifully.', 'Simran', 'Toronto'],
  ['Bakhiya pant + white kurti = my entire summer personality.', 'Ishita', 'Bengaluru'],
  ['Exchange was easy when I needed a size up. Customer support actually replies.', 'Neha', 'Lucknow'],
  ['Mom and I matched in RCI for Diwali. 10/10 family photo.', 'Riya', 'Jaipur'],
  ['Prepaid code worked, free shipping, came in 4 days. No notes.', 'Kavya', 'Mumbai'],
  ['The mukaish catches light in every photo. Worth it.', 'Sana', 'Hyderabad'],
];

/* stitch drawings, 300×120 viewBox */
function stitchSVG(kind) {
  let s = '';
  if (kind === 'tepchi') {               // running stitch along a wave
    for (let i = 0; i < 13; i++) {
      const x1 = 12 + i * 22, x2 = x1 + 13;
      const y = x => 60 + Math.sin(x / 34) * 26;
      s += `<path class="sew" style="transition-delay:${i * 70}ms" d="M${x1} ${y(x1).toFixed(1)} L${x2} ${y(x2).toFixed(1)}"/>`;
    }
  } else if (kind === 'bakhiya') {        // shadow work herringbone
    let d = 'M14 34';
    for (let i = 1; i <= 13; i++) d += ` L${14 + i * 21} ${i % 2 ? 86 : 34} L${14 + i * 21 - 8} ${i % 2 ? 86 : 34}`;
    s = `<path class="sew" d="M10 30 Q150 0 290 30" opacity=".35"/><path class="sew" d="M10 90 Q150 120 290 90" opacity=".35"/><path class="sew" d="${d}"/>`;
  } else if (kind === 'phanda') {         // french knots in a flower
    let i = 0;
    for (let p = 0; p < 6; p++) for (let k = 1; k <= 3; k++) {
      const a = p * Math.PI / 3, r = k * 13;
      s += `<circle class="knot" style="transition-delay:${i++ * 35}ms" cx="${(150 + Math.cos(a) * r).toFixed(1)}" cy="${(60 + Math.sin(a) * r).toFixed(1)}" r="${5 - k}"/>`;
    }
    s += `<circle class="knot" cx="150" cy="60" r="6"/><path class="sew" d="M150 104 Q120 112 70 100 M150 104 Q180 112 230 100"/>`;
  } else if (kind === 'murri') {          // rice-grain knots on a vine
    s = `<path class="sew" d="M14 92 C80 20 150 110 286 30"/>`;
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 30, y = 92 - i * 7 + Math.sin(i) * 16;
      s += `<ellipse class="knot" style="transition-delay:${300 + i * 80}ms" cx="${x}" cy="${y.toFixed(1)}" rx="7" ry="3.4" transform="rotate(${-30 + i * 9} ${x} ${y.toFixed(1)})"/>`;
    }
  } else if (kind === 'jaali') {          // pulled-thread net
    for (let i = -4; i < 14; i++) {
      s += `<path class="sew" style="transition-delay:${(i + 4) * 40}ms" d="M${i * 24} 10 L${i * 24 + 100} 110"/>`;
      s += `<path class="sew" style="transition-delay:${(i + 4) * 40}ms" d="M${i * 24 + 100} 10 L${i * 24} 110"/>`;
    }
    s = `<clipPath id="jc"><rect x="20" y="10" width="260" height="100" rx="50"/></clipPath><g clip-path="url(#jc)">${s}</g><rect class="sew" x="20" y="10" width="260" height="100" rx="50"/>`;
  } else if (kind === 'mukaish') {        // metallic sparkles in a leaf
    s = `<path class="sew" d="M40 60 Q150 -10 260 60 Q150 130 40 60 Z"/><path class="sew" d="M40 60 L260 60"/>`;
    [[90, 45], [130, 72], [170, 42], [210, 70], [150, 55], [110, 62], [190, 55]].forEach(([x, y], i) => {
      s += `<path class="spark" style="transition-delay:${400 + i * 90}ms;animation-delay:${i * .17}s" d="M${x} ${y - 8} L${x + 2.4} ${y - 2.4} L${x + 8} ${y} L${x + 2.4} ${y + 2.4} L${x} ${y + 8} L${x - 2.4} ${y + 2.4} L${x - 8} ${y} L${x - 2.4} ${y - 2.4} Z"/>`;
    });
  }
  return `<svg viewBox="0 0 300 120" aria-hidden="true">${s}</svg>`;
}
const STITCHES = [
  ['tepchi',  'Tepchi',  'टेपची', 'A long running stitch: the outline of almost every chikan motif.'],
  ['bakhiya', 'Bakhiya', 'बखिया', 'Shadow work. Herringbone on the back, a soft glow on the front.'],
  ['phanda',  'Phanda',  'फंदा',  'Tiny French knots, packed into flowers and millet-sized buds.'],
  ['murri',   'Murri',   'मुर्री', 'Rice-grain knots. The trickiest stitch in the book.'],
  ['jaali',   'Jaali',   'जाली',  'Threads pulled apart (never cut) to make a see-through net.'],
  ['mukaish', 'Mukaish', 'मुकैश', 'Twisted metal wire that makes festive pieces sparkle.'],
];

const STEPS = [
  ['01', 'Chhapai', 'छपाई', 'Motifs are block-printed in washable neel onto muslin, georgette or chanderi.', '#bfeee3'],
  ['02', 'Kadhai', 'कढ़ाई', 'A karigar stitches over every printed line by hand. A bridal saree can take weeks.', '#ffb6c1'],
  ['03', 'Dhulai', 'धुलाई', 'Washed in the old dhobi ghats to lift the blue print, then sun-dried till the thread pops.', '#fff1c9'],
  ['04', 'Taiyaari', 'तैयारी', 'Cut, finished and checked thread by thread at our Chowk workshop.', '#f2b632'],
  ['05', 'Aapke ghar', 'आपके घर', 'Free shipping across India. Worldwide orders over WhatsApp.', '#ffffff'],
];

/* ---------------- marquees ---------------- */
function fillTrack(el, html, times = 2) { el.innerHTML = html.repeat(times); }
const offer = ['Free shipping across India', 'PREPAID10 = 10% off online payments', 'Worldwide orders on WhatsApp', 'Hand-embroidered in Chowk, Lucknow', 'Easy returns & exchanges']
  .map(t => `<span>${t} <i>✿</i></span>`).join('');
fillTrack($('#offerTrack'), offer, 4);
const tape = ['Tepchi', 'Bakhiya', 'Phanda', 'Murri', 'Jaali', 'Mukaish', 'Keel kangan', 'Ghaas patti', 'Hool', 'Rahet']
  .map(t => `<span>${t} <i>✦</i></span>`).join('');
fillTrack($('#tapeTrack'), tape, 4);

/* ---------------- nav ---------------- */
const nav = $('#nav');
function onNav() { nav.classList.toggle('solid', scrollY > 40); }
addEventListener('scroll', onNav, { passive: true }); onNav();

/* ---------------- jaali corners (Spider-Man web maths, stitched) ---------------- */
$$('.jaali').forEach(svg => {
  let g = '';
  const spokes = 6;
  for (let i = 0; i < spokes; i++) {
    const a = (i / (spokes - 1)) * Math.PI / 2;
    g += `<line class="draw" x1="0" y1="0" x2="${(300 * Math.cos(a)).toFixed(1)}" y2="${(300 * Math.sin(a)).toFixed(1)}"/>`;
  }
  for (let r = 60; r <= 300; r += 60) {
    const pts = [];
    for (let i = 0; i < spokes; i++) {
      const a = (i / (spokes - 1)) * Math.PI / 2;
      // scallop the rings so they read as lace, not web
      const rr = r - (i % 2 ? 8 : 0);
      pts.push(`${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`);
      g += `<circle cx="${(rr * Math.cos(a)).toFixed(1)}" cy="${(rr * Math.sin(a)).toFixed(1)}" r="${r === 300 ? 0 : 2.6}"/>`;
    }
    g += `<polyline class="draw" points="${pts.join(' ')}"/>`;
  }
  svg.innerHTML = g;
});

/* ---------------- Lucknow skyline at the foot of the hero ---------------- */
(function skyline() {
  const G = 122;                       // ground line in the 1440×140 viewBox
  let d = `M0 140 L0 ${G}`;
  const onion = (x, w, b) => {         // onion dome sitting on a drum of height b
    const top = G - b - w * 1.15;
    d += ` L${x} ${G} L${x} ${G - b} C${x - w * .12} ${G - b - w * .55} ${x + w * .38} ${top + w * .3} ${x + w / 2} ${top}` +
         ` C${x + w * .62} ${top + w * .3} ${x + w * 1.12} ${G - b - w * .55} ${x + w} ${G - b} L${x + w} ${G}`;
  };
  const minaret = (x, w, h) => { d += ` L${x} ${G} L${x} ${G - h} L${x + w / 2} ${G - h - w * 1.8} L${x + w} ${G - h} L${x + w} ${G}`; };
  const block = (x, w, h) => { d += ` L${x} ${G} L${x} ${G - h} L${x + w} ${G - h} L${x + w} ${G}`; };
  const gate = x => {                   // Rumi Darwaza: tall gate with a crown and a chhatri on top
    block(x, 40, 34); minaret(x + 40, 10, 62);
    d += ` L${x + 50} ${G} L${x + 50} ${G - 70} Q${x + 95} ${G - 112} ${x + 140} ${G - 70} L${x + 140} ${G}`;
    onion(x + 80, 30, 46);
    minaret(x + 140, 10, 62); block(x + 150, 40, 34);
  };
  minaret(30, 9, 40); onion(70, 46, 22); block(116, 70, 18); minaret(190, 8, 52);
  gate(240);
  block(440, 120, 26); onion(470, 60, 26); minaret(560, 9, 70); onion(600, 34, 14);
  block(650, 90, 16); minaret(745, 8, 46); onion(790, 80, 30); minaret(880, 8, 46);
  block(900, 80, 20); gate(990);
  minaret(1200, 9, 56); onion(1230, 52, 20); block(1290, 60, 22); onion(1360, 40, 16); minaret(1410, 8, 44);
  d += ` L1440 ${G} L1440 140 Z`;
  $('#skyPath').setAttribute('d', d);
})();

/* ---------------- hero canvas ---------------- */
(function hero() {
  const heroEl = $('.hero'), canvas = $('#heroCanvas'), ctx = canvas.getContext('2d'), hint = $('#hint');
  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  const TRAIL = 36;
  const EASE = 0.24;
  let R = 160, W = 0, H = 0;
  const mouse = { x: -9999, y: -9999 }, smooth = { x: -9999, y: -9999 };
  let trail = [], parts = [], lastMove = 0, t0 = performance.now(), visible = true, dash = 0;

  // bottom = plain muslin; top = the chikankari revealed
  const bottom = new Image(), top = new Image();
  bottom.src = 'https://images.unsplash.com/photo-1706192048397-71ce1148d24f?w=2000&q=75&auto=format';
  top.src = 'https://images.unsplash.com/photo-1673960507883-5d7a5351726f?w=2000&q=78&auto=format';

  const off = document.createElement('canvas'), offc = off.getContext('2d');
  // both photos are scaled, cropped and dyed once per resize, so each frame is just two blits
  const baseC = document.createElement('canvas'), baseX = baseC.getContext('2d');
  const topC = document.createElement('canvas'), topX = topC.getContext('2d');
  let ready = false;

  function cover(img, cw, ch) {
    const ir = img.width / img.height, cr = cw / ch;
    let w, h, x, y;
    if (ir > cr) { h = ch; w = ch * ir; x = (cw - w) / 2; y = 0; } else { w = cw; h = cw / ir; x = 0; y = (ch - h) / 2; }
    return [x, y, w, h];
  }
  function bake() {
    if (!bottom.complete || !top.complete || !bottom.naturalWidth || !top.naturalWidth) return;
    [baseC, topC].forEach(c => { c.width = W * DPR; c.height = H * DPR; });
    baseX.setTransform(DPR, 0, 0, DPR, 0, 0); topX.setTransform(DPR, 0, 0, DPR, 0, 0);
    const cb = cover(bottom, W, H);
    baseX.drawImage(bottom, cb[0], cb[1], cb[2], cb[3]);
    // dye the plain muslin in the RCI logo red so the white chikan pops when revealed
    baseX.globalCompositeOperation = 'multiply';
    baseX.fillStyle = '#d0141c'; baseX.fillRect(0, 0, W, H);
    baseX.globalCompositeOperation = 'source-over';
    baseX.fillStyle = 'rgba(110,6,16,0.22)'; baseX.fillRect(0, 0, W, H);
    const ct = cover(top, W, H);
    topX.drawImage(top, ct[0], ct[1], ct[2], ct[3]);
    topX.fillStyle = 'rgba(255,236,214,0.08)'; topX.fillRect(0, 0, W, H);
    ready = true;
  }
  function resize() {
    W = heroEl.offsetWidth; H = heroEl.offsetHeight;
    canvas.width = off.width = W * DPR; canvas.height = off.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); offc.setTransform(DPR, 0, 0, DPR, 0, 0);
    R = Math.max(110, Math.min(W, H) * 0.24);
    bake();
  }
  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

  function setPoint(cx, cy) {
    const r = heroEl.getBoundingClientRect();
    const nx = cx - r.left, ny = cy - r.top;
    const speed = Math.hypot(nx - mouse.x, ny - mouse.y);
    mouse.x = nx; mouse.y = ny; lastMove = performance.now();
    hint.style.opacity = 0;
    if (speed > 22 && speed < 400 && parts.length < 90) spawnPhanda(nx, ny);
  }
  heroEl.addEventListener('mousemove', e => setPoint(e.clientX, e.clientY));
  heroEl.addEventListener('touchmove', e => setPoint(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

  // phanda knots shed when the needle moves fast
  const COLORS = ['#ffc9cc', '#ffb000', '#ffffff', '#ffe3c2', '#ffd36b'];
  function spawnPhanda(x, y) {
    parts.push({ x, y, vx: (Math.random() - .5) * 2.4, vy: -Math.random() * 1.6, life: 1, s: 3 + Math.random() * 4,
      c: COLORS[(Math.random() * COLORS.length) | 0], rot: Math.random() * 6, star: false });
  }
  function spawnStar() {
    parts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, life: 1, s: 6 + Math.random() * 10, c: '#ffffff', rot: 0, star: true });
  }
  function drawPart(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.c;
    if (p.star) {
      const s = p.s * Math.sin(p.life * Math.PI);
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .25, -s * .25); ctx.lineTo(s, 0); ctx.lineTo(s * .25, s * .25);
      ctx.lineTo(0, s); ctx.lineTo(-s * .25, s * .25); ctx.lineTo(-s, 0); ctx.lineTo(-s * .25, -s * .25); ctx.closePath();
      ctx.fill();
    } else {
      for (let i = 0; i < 5; i++) { const a = i * 1.2566; ctx.beginPath(); ctx.arc(Math.cos(a) * p.s, Math.sin(a) * p.s, p.s * .55, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = '#7d1426'; ctx.beginPath(); ctx.arc(0, 0, p.s * .4, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }

  function frame(now) {
    if (!visible || !ready) return requestAnimationFrame(frame);
    // idle: trace a figure-8 so the effect shows on phones and screenshots
    if (now - lastMove > 2600) {
      const t = (now - t0) / 1600;
      mouse.x = W * (0.5 + 0.26 * Math.sin(t)); mouse.y = H * (0.5 + 0.2 * Math.sin(2 * t));
    }
    if (smooth.x < -9000) { smooth.x = mouse.x; smooth.y = mouse.y; }
    smooth.x += (mouse.x - smooth.x) * EASE; smooth.y += (mouse.y - smooth.y) * EASE;
    trail.unshift({ x: smooth.x, y: smooth.y }); if (trail.length > TRAIL) trail.length = TRAIL;

    ctx.drawImage(baseC, 0, 0, W, H);

    offc.globalCompositeOperation = 'source-over';
    offc.clearRect(0, 0, W, H);
    for (let i = 0; i < trail.length; i++) {
      const t = 1 - i / trail.length;
      offc.globalAlpha = t * t;
      offc.beginPath(); offc.arc(trail[i].x, trail[i].y, R * (0.25 + 0.75 * t), 0, 6.283); offc.fill();
    }
    offc.globalAlpha = 1;
    offc.globalCompositeOperation = 'source-in';
    offc.drawImage(topC, 0, 0, W, H);
    ctx.drawImage(off, 0, 0, W, H);

    // embroidery hoop around the needle
    const h = trail[0];
    if (h) {
      ctx.save();
      ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(196,148,98,.9)';
      ctx.beginPath(); ctx.arc(h.x, h.y, R * 1.02, 0, 6.283); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,80,45,.6)';
      ctx.beginPath(); ctx.arc(h.x, h.y, R * 1.02 + 5, 0, 6.283); ctx.stroke();
      ctx.fillStyle = '#9b6b3d'; ctx.fillRect(h.x - 7, h.y - R * 1.02 - 16, 14, 14);
      dash -= 0.6;
      ctx.setLineDash([9, 7]); ctx.lineDashOffset = dash; ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(233,28,36,.9)';
      ctx.beginPath(); ctx.arc(h.x, h.y, R * 0.9, 0, 6.283); ctx.stroke();
      ctx.restore();
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.star ? 0 : 0.05; p.rot += 0.03; p.life -= p.star ? 0.02 : 0.014;
      if (p.life <= 0) parts.splice(i, 1); else drawPart(p);
    }
    requestAnimationFrame(frame);
  }

  let loaded = 0;
  const go = () => { if (++loaded === 2) { bake(); requestAnimationFrame(frame); } };
  bottom.onload = go; top.onload = go;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(heroEl);

  // mukaish glint: the Spider-Man lightning, softened into a silver shimmer
  const glint = $('#glint');
  function shimmer() {
    if (visible && !REDUCED) {
      // transform + opacity only, so the sweep stays on the compositor
      glint.animate([{ opacity: 0, transform: 'translateX(-60%)' }, { opacity: .7, offset: .4 }, { opacity: 0, transform: 'translateX(60%)' }], { duration: 1300, easing: 'ease-in-out' });
      for (let i = 0; i < 9; i++) setTimeout(spawnStar, i * 90);
    }
    setTimeout(shimmer, 3800 + Math.random() * 2600);
  }
  setTimeout(shimmer, 1400);
})();

/* ---------------- letter hop ---------------- */
function splitLetters(el) {
  [...el.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(word); return; }
        const w = document.createElement('span'); w.style.whiteSpace = 'nowrap';
        [...word].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.append(s); });
        frag.append(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === 1) splitLetters(node);
  });
}
$$('.hop').forEach(splitLetters);

/* ---------------- state ---------------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('rci-' + k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('rci-' + k, JSON.stringify(v)); } catch (e) {} },
};
let bag = store.get('bag', {});
let wish = new Set(store.get('wish', []));
const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

/* ---------------- chips + grid ---------------- */
const chipsEl = $('#chips'), pill = $('#chipPill'), grid = $('#grid');
let filter = 'all';
CHIPS.forEach(([k, label]) => {
  const b = document.createElement('button');
  b.className = 'chip'; b.type = 'button'; b.dataset.k = k; b.textContent = label; b.setAttribute('role', 'tab');
  b.addEventListener('click', () => setFilter(k));
  chipsEl.append(b);
});
function movePill() {
  const on = $('.chip.on', chipsEl); if (!on) return;
  pill.style.width = on.offsetWidth + 'px'; pill.style.transform = `translateX(${on.offsetLeft}px)`;
}
function setFilter(k) {
  filter = k;
  $$('.chip', chipsEl).forEach(c => { const on = c.dataset.k === k; c.classList.toggle('on', on); c.setAttribute('aria-selected', on); });
  movePill();
  const on = $('.chip.on', chipsEl);
  if (on) chipsEl.scrollTo({ left: on.offsetLeft - 40, behavior: 'smooth' });
  renderGrid();
}
addEventListener('resize', movePill);

const heartSVG = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
function cardHTML(p, i) {
  const off = Math.round((1 - p.p / p.mrp) * 100);
  return `<article class="card reveal" style="--i:${i % 4}" data-id="${p.id}">
    <div class="media" data-cursor>
      <img src="${IMG(p.img)}" alt="${p.n}" loading="lazy">
      <img class="zoom" src="${IMG_ZOOM(p.img)}" alt="" loading="lazy">
      <div class="glare"></div>
      <span class="sale">${off}% off</span>
      <button class="quick" type="button" data-add="${p.id}">+ Quick add</button>
      <button class="heart ${wish.has(p.id) ? 'on' : ''}" type="button" aria-label="Wishlist ${p.n}" data-wish="${p.id}">${heartSVG}</button>
    </div>
    <div class="info">
      <div class="cat">${CAT_NAME[p.cat]}${p.badge ? `<span class="badge">· ${p.badge}</span>` : ''}</div>
      <h3>${p.n}</h3>
      <div class="price"><b>${rupee(p.p)}</b><s>${rupee(p.mrp)}</s></div>
      <div class="rating"><i>★</i> ${p.r} · ${p.rv} reviews</div>
    </div>
  </article>`;
}
function renderGrid() {
  const list = PRODUCTS.filter(p => filter === 'all' || p.tags.includes(filter) || p.cat === filter);
  grid.innerHTML = list.map(cardHTML).join('') || '<p class="sub">Nothing here yet. New pieces drop every week.</p>';
  $$('.card', grid).forEach(c => { revealObs.observe(c); bindTilt(c); });
  bindCursorTargets();
}

/* card tilt + glare */
function bindTilt(card) {
  if (!FINE || REDUCED) return;
  const m = $('.media', card);
  m.addEventListener('pointermove', e => {
    const r = m.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    m.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg'); m.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
    m.style.setProperty('--gx', x * 100 + '%'); m.style.setProperty('--gy', y * 100 + '%');
  });
  m.addEventListener('pointerleave', () => { m.style.setProperty('--rx', '0deg'); m.style.setProperty('--ry', '0deg'); });
}

/* ---------------- reveal ---------------- */
const revealObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObs.observe(el));

/* ---------------- wishlist + bag ---------------- */
const wishCount = $('#wishCount'), bagCount = $('#bagCount');
function burst(btn) {
  const cols = ['#e8336f', '#ff9ec4', '#d9f45a', '#5b2a6e', '#a8e6cf'];
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('i'); d.className = 'burst';
    d.style.background = cols[i % cols.length]; d.style.left = '16px'; d.style.top = '16px';
    btn.append(d);
    const a = i / 10 * Math.PI * 2;
    d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * 34}px,${Math.sin(a) * 34}px) scale(.3)`, opacity: 0 }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => d.remove();
  }
}
function toggleWish(id, btn) {
  if (wish.has(id)) wish.delete(id); else { wish.add(id); burst(btn); toast('Saved to wishlist ♡'); }
  store.set('wish', [...wish]);
  btn.classList.toggle('on', wish.has(id)); btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
  wishCount.textContent = wish.size;
}
function flyToBag(img) {
  if (!img || REDUCED) return;
  const r = img.getBoundingClientRect(), t = $('#bagBtn').getBoundingClientRect();
  const f = img.cloneNode(); f.className = 'fly';
  Object.assign(f.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  document.body.append(f);
  requestAnimationFrame(() => Object.assign(f.style, { left: t.left + 6 + 'px', top: t.top + 6 + 'px', width: '32px', height: '32px', opacity: .4, borderRadius: '50%' }));
  setTimeout(() => { f.remove(); const b = $('#bagBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }, 800);
}
function addToBag(id, img) {
  bag[id] = (bag[id] || 0) + 1; store.set('bag', bag);
  flyToBag(img); renderBag(); toast(`${byId[id].n} added to bag`);
}
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]'), w = e.target.closest('[data-wish]');
  if (add) { const card = add.closest('.card,.reel,.promo'); addToBag(add.dataset.add, card && $('img', card)); }
  if (w) toggleWish(w.dataset.wish, w);
});

const drawer = $('#drawer'), scrim = $('#scrim');
function openBag(on) { drawer.classList.toggle('on', on); scrim.classList.toggle('on', on); drawer.setAttribute('aria-hidden', !on); }
$('#bagBtn').addEventListener('click', () => openBag(true));
$('#closeBag').addEventListener('click', () => openBag(false));
scrim.addEventListener('click', () => openBag(false));
addEventListener('keydown', e => { if (e.key === 'Escape') openBag(false); });
$('#wishBtn').addEventListener('click', () => toast(wish.size ? `${wish.size} piece${wish.size > 1 ? 's' : ''} in your wishlist` : 'Tap ♡ on any piece to save it'));
$('#prepaid').addEventListener('change', renderBag);
$('#checkout').addEventListener('click', () => toast('Prototype: checkout connects to the payment gateway here'));

function renderBag() {
  const ids = Object.keys(bag).filter(id => bag[id] > 0 && byId[id]);
  const count = ids.reduce((s, id) => s + bag[id], 0);
  bagCount.textContent = count;
  const items = $('#bagItems');
  if (!ids.length) {
    items.innerHTML = `<div class="empty"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><circle cx="60" cy="60" r="36"/><path d="M40 62 Q60 40 80 62 M60 50 L60 80"/></svg><p>Your hoop's empty.<br>Go find something pretty.</p></div>`;
  } else {
    items.innerHTML = ids.map(id => { const p = byId[id]; return `<div class="line">
      <img src="${IMG(p.img, 140, 168)}" alt="">
      <div><h4>${p.n}</h4><div class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="Less">−</button><span>${bag[id]}</span><button type="button" data-q="${id}" data-d="1" aria-label="More">+</button></div></div>
      <b>${rupee(p.p * bag[id])}</b></div>`; }).join('');
  }
  const sub = ids.reduce((s, id) => s + byId[id].p * bag[id], 0);
  const disc = $('#prepaid').checked ? Math.round(sub * .1) : 0;
  $('#subtotal').textContent = rupee(sub);
  $('#discRow').hidden = !disc; $('#disc').textContent = '−' + rupee(disc);
  $('#total').textContent = rupee(sub - disc);
}
$('#bagItems').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  bag[b.dataset.q] = Math.max(0, (bag[b.dataset.q] || 0) + +b.dataset.d);
  if (!bag[b.dataset.q]) delete bag[b.dataset.q];
  store.set('bag', bag); renderBag();
});

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200);
}

/* ---------------- stitches ---------------- */
$('#stitchGrid').innerHTML = STITCHES.map(([k, name, hi, txt], i) => `
  <button class="stitch reveal" type="button" style="transition-delay:${i * 60}ms">
    <span class="num">0${i + 1}</span>${stitchSVG(k)}
    <div><h3>${name}<span>${hi}</span></h3><p>${txt}</p></div>
  </button>`).join('');
$$('.stitch svg .sew').forEach(p => { const L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 400); p.style.setProperty('--len', L); });
$$('.stitch').forEach(s => { revealObs.observe(s); s.addEventListener('click', () => s.classList.toggle('active')); });
// on touch screens, sew each card as it scrolls into view
if (!FINE) {
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('active'), 300); so.unobserve(e.target); } }), { threshold: .6 });
  $$('.stitch').forEach(s => so.observe(s));
}

/* ---------------- process: pinned horizontal scroll ---------------- */
const proc = $('#process'), track = $('#procTrack'), bar = $('#procBar');
const motif = [
  '<svg class="spin" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80"/><circle cx="100" cy="100" r="50"/><path d="M100 20 V180 M20 100 H180 M43 43 L157 157 M157 43 L43 157"/></svg>',
  '<svg viewBox="0 0 200 200"><path d="M20 160 C60 40 140 40 180 160"/><path d="M100 20 L100 180"/><circle cx="100" cy="60" r="10"/></svg>',
  '<svg class="spin" viewBox="0 0 200 200"><path d="M100 30 Q150 100 100 170 Q50 100 100 30 Z"/><path d="M30 100 Q100 50 170 100 Q100 150 30 100 Z"/></svg>',
  '<svg viewBox="0 0 200 200"><rect x="40" y="40" width="120" height="120" rx="20"/><path d="M40 80 H160 M40 120 H160 M80 40 V160 M120 40 V160"/></svg>',
  '<svg class="spin" viewBox="0 0 200 200"><circle cx="100" cy="100" r="70"/><path d="M100 30 L115 85 L170 100 L115 115 L100 170 L85 115 L30 100 L85 85 Z"/></svg>',
];
track.innerHTML = STEPS.map(([n, t, hi, txt, c], i) => `<div class="step" style="background:${c}">${motif[i]}<span class="n">${n}</span><div><small>${hi}</small><h3>${t}</h3><p>${txt}</p></div></div>`).join('');
let maxX = 0;
function sizeProcess() {
  maxX = Math.max(0, track.scrollWidth - innerWidth);
  proc.style.height = (innerHeight + maxX * 1.1) + 'px';
  onProcess();
}
function onProcess() {
  const r = proc.getBoundingClientRect();
  const total = proc.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
  track.style.transform = `translateX(${-p * maxX}px)`;
  bar.style.width = p * 100 + '%';
}
addEventListener('scroll', onProcess, { passive: true });
addEventListener('resize', sizeProcess);
sizeProcess();

/* ---------------- vibes ---------------- */
$('#vibeGrid').innerHTML = VIBES.map(v => `
  <button class="vibe reveal" type="button" data-vibe="${v.k}" data-cursor>
    <img class="bw" src="${IMG(v.img, 500, 740)}" alt="" loading="lazy">
    <img class="col" src="${IMG(v.img, 500, 740)}" alt="" loading="lazy">
    <span><b>${v.t}</b><small>${v.s}</small></span><i class="arrow">→</i>
  </button>`).join('');
$$('.vibe').forEach(v => {
  revealObs.observe(v);
  v.addEventListener('pointerenter', e => { const r = v.getBoundingClientRect(); v.style.setProperty('--cx', (e.clientX - r.left) + 'px'); v.style.setProperty('--cy', (e.clientY - r.top) + 'px'); });
  v.addEventListener('click', () => { setFilter(v.dataset.vibe); $('#drop').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); });
});

/* ---------------- promo parallax ---------------- */
const promoImg = $('#promoImg');
promoImg.src = IMG('1617627143750-d86bc21e42bb', 900, 1100);
addEventListener('scroll', () => {
  const r = promoImg.parentElement.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
  promoImg.style.transform = `translateY(${(-7 + p * 12).toFixed(2)}%)`;
}, { passive: true });

/* ---------------- reels ---------------- */
$('#reelRow').innerHTML = REELS.map(r => { const p = byId[r.pid]; return `
  <div class="reel reveal" data-cursor>
    <img src="${IMG(r.img, 400, 710)}" alt="${p.n} styled by @${r.who}" loading="lazy">
    <div class="bar"><i></i></div><span class="who">@${r.who}</span>
    <div class="tag"><div><b>${p.n}</b><small>${rupee(p.p)}</small></div><button type="button" data-add="${p.id}" aria-label="Add ${p.n}">+</button></div>
  </div>`; }).join('');
$$('.reel').forEach(r => revealObs.observe(r));

/* ---------------- reviews ---------------- */
const reviewHTML = REVIEWS.map(([q, n, c]) => `<div class="review"><div class="stars">★★★★★</div><p>“${q}”</p><b>${n}</b> <small>· ${c}</small></div>`).join('');
fillTrack($('#reviewTrack'), reviewHTML, 2);

/* ---------------- count-up stats ---------------- */
const countObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  countObs.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = REDUCED ? 0 : 1600;
  (function tick(now) {
    const p = dur ? Math.min(1, (now - t0) / dur) : 1;
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}), { threshold: .6 });
$$('[data-count]').forEach(el => countObs.observe(el));

/* ---------------- copy code ---------------- */
$('#copyCode').addEventListener('click', () => {
  const done = () => toast('PREPAID10 copied. 10% off when you pay online');
  try { navigator.clipboard.writeText('PREPAID10').then(done, done); } catch (e) { done(); }
});

/* ---------------- magnetic buttons ---------------- */
if (FINE && !REDUCED) $$('.magnetic').forEach(b => {
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; });
});

/* ---------------- needle cursor with a tepchi thread ---------------- */
const cursor = $('#cursor');
function bindCursorTargets() {
  if (!FINE) return;
  $$('[data-cursor]').forEach(el => {
    if (el._c) return; el._c = 1;
    el.addEventListener('pointerenter', () => cursor.classList.add('big'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('big'));
  });
}
if (FINE && !REDUCED) {
  document.body.classList.add('has-cursor');
  const tc = $('#thread'), tx = tc.getContext('2d');
  const DPR = Math.min(devicePixelRatio || 1, 1.25);
  let pts = [], m = { x: innerWidth / 2, y: innerHeight / 2 }, off = 0;
  const size = () => { tc.width = innerWidth * DPR; tc.height = innerHeight * DPR; tx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { m.x = e.clientX; m.y = e.clientY; cursor.style.transform = `translate(${m.x}px,${m.y}px)`; });
  (function loop() {
    const last = pts[0] || m;
    pts.unshift({ x: last.x + (m.x - last.x) * .35, y: last.y + (m.y - last.y) * .35 });
    if (pts.length > 26) pts.pop();
    tx.clearRect(0, 0, innerWidth, innerHeight);
    if (pts.length > 2) {
      off -= .8;
      tx.setLineDash([7, 6]); tx.lineDashOffset = off; tx.lineCap = 'round'; tx.lineWidth = 2.2; tx.strokeStyle = 'rgba(215,38,46,.8)';
      tx.beginPath(); tx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; tx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my); }
      tx.stroke();
    }
    requestAnimationFrame(loop);
  })();
}

/* ---------------- boot ---------------- */
setFilter('all');
renderBag();
wishCount.textContent = wish.size;
if (document.fonts) document.fonts.ready.then(() => { movePill(); sizeProcess(); });
})();
