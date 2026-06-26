/* ═══════════════════════════════════════════════════════════════
   PELATA LUDICA — GALAXY PORTFOLIO
   main.js v3 — Animazioni semplici, galassia brand colors, lightbox
═══════════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────
// 0. UTILITY
// ─────────────────────────────────────────────
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp  = (a, b, t)   => a + (b - a) * t;
const rand  = (lo, hi)    => lo + Math.random() * (hi - lo);
const PI2   = Math.PI * 2;

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

// ─────────────────────────────────────────────
// 1. LOADER
// ─────────────────────────────────────────────
(function () {
  const loader  = $('loader');
  const fill    = $('loader-fill');
  const status  = $('loader-status');
  const msgs    = ['INIZIALIZZAZIONE SISTEMI…','CARICAMENTO GALASSIA…','COLLEGAMENTO MOTORI…','ROTTA CALCOLATA…','PRONTO AL DECOLLO'];
  let pct = 0, msgIdx = 0;

  const iv = setInterval(() => {
    pct += rand(8, 20);
    fill.style.width = Math.min(pct, 95) + '%';
    if (pct > (msgIdx+1)*19 && msgIdx < msgs.length-1) {
      msgIdx++;
      if (status) status.textContent = msgs[msgIdx];
    }
    if (pct >= 95) {
      clearInterval(iv);
      setTimeout(() => {
        fill.style.width = '100%';
        if (status) status.textContent = msgs[msgs.length-1];
        setTimeout(() => {
          loader.classList.add('hidden');
          document.documentElement.classList.remove('loading');
        }, 350);
      }, 280);
    }
  }, 80);
})();

// ─────────────────────────────────────────────
// 2. CUSTOM CURSOR
// ─────────────────────────────────────────────
(function () {
  const dot  = $('cursor-dot');
  const ring = $('cursor-ring');
  let mx = window.innerWidth/2, my = window.innerHeight/2, rx = mx, ry = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    rx = lerp(rx, mx, 0.22); ry = lerp(ry, my, 0.22);
    dot.style.left  = mx + 'px'; dot.style.top   = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    if (e.target.closest('button,a,[data-callout],.project-card')) document.body.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('button,a,[data-callout],.project-card')) document.body.classList.remove('hovering');
  });
})();

// ─────────────────────────────────────────────
// 3. GALAXY CANVAS — brand colors, niente linee guida
// ─────────────────────────────────────────────
(function () {
  const canvas = $('galaxy-canvas');
  const ctx    = canvas.getContext('2d');

  // SOLO colori primordiali brand — zero viola
  const BRAND = ['#E3131C','#2C2C6E','#EBC03F','#009640'];
  const CORE_COLORS = ['#E3131C','#EBC03F','#2C2C6E']; // nucleo: rosso/oro/blu

  let W, H, cx, cy;
  let phase = 'forming'; // forming → formed → warping → done
  let formT = 0, warpT  = 0;
  let armStars = [], bgStars = [];
  const N_ARMS = 4, N_PER_ARM = 280, N_BG = 160;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cx = W * 0.5; cy = H * 0.5;
    build();
  }
  window.addEventListener('resize', resize);

  function build() {
    armStars = [];
    for (let arm = 0; arm < N_ARMS; arm++) {
      const offset = (arm / N_ARMS) * PI2;
      const stars  = [];
      for (let i = 0; i < N_PER_ARM; i++) {
        const t   = i / N_PER_ARM;
        const ang = t * PI2 * 2.4 + offset;
        const r   = t * Math.min(W, H) * 0.43;
        const sp  = r * 0.13 + 5;
        const tx  = cx + Math.cos(ang) * r + rand(-sp, sp);
        const ty  = cy + Math.sin(ang) * r + rand(-sp, sp);
        const sa  = rand(0, PI2);
        const sd  = rand(Math.min(W,H)*0.55, Math.min(W,H)*0.98);
        // Colore: core bianco/oro, braccia brand colors
        let color;
        if (t < 0.10)      color = '#ffffff';
        else if (t < 0.28) color = CORE_COLORS[arm % CORE_COLORS.length];
        else               color = BRAND[arm % BRAND.length];
        stars.push({
          sx: cx + Math.cos(sa)*sd, sy: cy + Math.sin(sa)*sd,
          tx, ty, color,
          size:  rand(0.5, t < 0.18 ? 2.6 : 1.5),
          alpha: rand(0.5, 1),
          tw:    rand(0, PI2), twSpd: rand(0.012, 0.05)
        });
      }
      armStars.push(stars);
    }
    bgStars = [];
    for (let i = 0; i < N_BG; i++) {
      bgStars.push({ x:rand(0,W), y:rand(0,H), r:rand(0.3,1.2),
        a:rand(0.06,0.28), tw:rand(0,PI2), sp:rand(0.008,0.03) });
    }
  }

  function ss(x) { return x*x*(3-2*x); } // smoothstep

  function drawBg()   { ctx.fillStyle='rgba(5,5,8,1)'; ctx.fillRect(0,0,W,H); }

  function drawBgStars(e) {
    bgStars.forEach(s => {
      s.tw += s.sp;
      const a = s.a*(0.7+0.3*Math.sin(s.tw))*Math.min(e*2,1);
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,PI2);
      ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill();
    });
  }

  function drawArms(e) {
    armStars.forEach(arm => arm.forEach(s => {
      s.tw += s.twSpd;
      const px = lerp(s.sx, s.tx, e);
      const py = lerp(s.sy, s.ty, e);
      const al = s.alpha * e * (0.72 + 0.28*Math.sin(s.tw));
      const [r,g,b] = hexRgb(s.color);
      // Alone per le stelle grandi vicino al nucleo
      if (s.size > 1.8 && e > 0.6) {
        const grd = ctx.createRadialGradient(px,py,0,px,py,s.size*4);
        grd.addColorStop(0, `rgba(${r},${g},${b},${al*0.5})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(px,py,s.size*4,0,PI2);
        ctx.fillStyle=grd; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(px, py, s.size*(0.15+0.85*e), 0, PI2);
      ctx.fillStyle=`rgba(${r},${g},${b},${al})`; ctx.fill();
    }));
  }

  function drawCore(e) {
    // Core: rosso→oro→blu scuro (brand), niente viola
    const maxR = Math.min(W,H)*0.16*e;
    const grd  = ctx.createRadialGradient(cx,cy,0,cx,cy,maxR);
    grd.addColorStop(0,    `rgba(255,240,200,${0.92*e})`); // quasi bianco caldo
    grd.addColorStop(0.06, `rgba(227,19,28,${0.75*e})`);   // rosso brand
    grd.addColorStop(0.2,  `rgba(235,192,63,${0.4*e})`);   // oro brand
    grd.addColorStop(0.45, `rgba(44,44,110,${0.2*e})`);    // blu brand
    grd.addColorStop(1,    `rgba(0,0,0,0)`);
    ctx.fillStyle=grd;
    ctx.beginPath(); ctx.arc(cx,cy,maxR,0,PI2); ctx.fill();
  }

  function drawWarp() {
    // Warp forward: solo buio + poche linee rosse/dorate, NIENTE bianco/viola
    ctx.fillStyle=`rgba(5,5,8,${clamp(warpT*2,0,0.95)})`; ctx.fillRect(0,0,W,H);
    const numS = 50;
    for (let i=0;i<numS;i++) {
      const ang = (i/numS)*PI2;
      const len = warpT*Math.min(W,H)*(0.25+(i%5)*0.07);
      const col = BRAND[i%BRAND.length];
      const [r,g,b] = hexRgb(col);
      const a = clamp(warpT*0.6, 0, 0.6);
      const grd = ctx.createLinearGradient(cx,cy,cx+Math.cos(ang)*len,cy+Math.sin(ang)*len);
      grd.addColorStop(0,  `rgba(${r},${g},${b},${a})`);
      grd.addColorStop(1,  `rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(ang)*len, cy+Math.sin(ang)*len);
      ctx.strokeStyle=grd; ctx.lineWidth=0.6+warpT*1.8; ctx.stroke();
    }
  }

  function loop() {
    const e = ss(clamp(formT,0,1));
    drawBg(); drawBgStars(e); drawArms(e); drawCore(e);
    if (phase==='forming') { formT+=0.0045; if(formT>=1){formT=1;phase='formed';} }
    // Galaxy warp → poi salta a s-bio
    if (phase==='warping') {
      drawWarp(); warpT+=0.024;
      if(warpT>=1){ 
        phase='done'; 
        currentSection = 1;
        updateHUD(1);
        jumpToSection(1); 
      }
    }
    if (phase!=='done') {
      const t=Date.now()*0.001;
      $('coord-x').textContent='X: '+(4.2847+Math.sin(t)*0.0012).toFixed(4);
      $('coord-y').textContent='Y: '+(-1.9203+Math.cos(t*.8)*0.0009).toFixed(4);
      $('coord-z').textContent='Z: '+(0.7731+Math.sin(t*1.3)*0.0006).toFixed(4);
    }
    requestAnimationFrame(loop);
  }

  function triggerWarp() {
    if (phase==='formed'||phase==='forming') { formT=1; phase='warping'; warpT=0; }
  }

  resize(); loop();

  const btn=$('launch-btn');
  if(btn) btn.addEventListener('click', triggerWarp);

  let triggered=false;
  window.addEventListener('scroll', ()=>{
    if(!triggered && currentSection === 0 && window.scrollY>window.innerHeight*0.1 && phase!=='warping'&&phase!=='done') {
      triggered=true; triggerWarp();
    }
  },{passive:true});

  window._galaxyWarp = triggerWarp;
  window._resetGalaxyWarp = function() {
    phase = 'formed';
    formT = 1;
    warpT = 0;
    triggered = false;
  };
})();

// ─────────────────────────────────────────────
// 4. TRANSIZIONI NAV — particelle su sfondo semi-trasparente sfocato
//    Forward: particelle che escono dal centro verso fuori (viaggio)
//    Backward: particelle che entrano dall'esterno verso il centro
// ─────────────────────────────────────────────
const BRAND = ['#E3131C','#2C2C6E','#EBC03F','#009640'];

let _navOverlay = null;
function getNavOverlay() {
  if (!_navOverlay) {
    _navOverlay = document.createElement('div');
    _navOverlay.id = 'nav-overlay';
    _navOverlay.style.cssText = `
      position:fixed;inset:0;z-index:7000;
      pointer-events:none;opacity:0;
      background:rgba(8,9,10,0);
      backdrop-filter:blur(5px);
      -webkit-backdrop-filter:blur(5px);
      transition:opacity 0.18s ease;
    `;
    document.body.appendChild(_navOverlay);
  }
  return _navOverlay;
}

// Crea speed-lines su canvas overlay — effetto hyperspace
function runParticleTransition(goingBack, onMid) {
  const ov  = getNavOverlay();
  const cnv = document.createElement('canvas');
  cnv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  cnv.width  = window.innerWidth;
  cnv.height = window.innerHeight;
  ov.appendChild(cnv);
  const ctx = cnv.getContext('2d');
  const W = cnv.width, H = cnv.height;

  const TOTAL = 420; // ms — più veloce e pulito
  let start = null;

  // Speed-lines orizzontali
  const dir = goingBack ? -1 : 1;
  const N   = 26;
  const lines = Array.from({length: N}, (_, i) => {
    const col = BRAND[i % BRAND.length];
    const isWhite = Math.random() < 0.45;
    return {
      y:      rand(0, H),
      len:    rand(W * 0.12, W * 0.52),
      startX: goingBack ? rand(W * 0.2, W) : rand(-W * 0.5, W * 0.2),
      speed:  rand(W * 1.8, W * 4.2) * dir,
      h:      rand(0.4, 2.4),
      col:    isWhite ? 'rgba(240,240,255,' : `rgba(${hexRgb(col).join(',')},`,
      alpha:  rand(0.3, 0.7)
    };
  });

  function draw(now) {
    if (!start) start = now;
    const elapsed = now - start;
    const t     = clamp(elapsed / TOTAL, 0, 1);
    const phase = Math.sin(t * Math.PI);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = `rgba(5,5,8,${phase * 0.82})`;
    ctx.fillRect(0, 0, W, H);

    lines.forEach(l => {
      const x  = l.startX + l.speed * (elapsed / 1000);
      const x1 = goingBack ? x + l.len : x;
      const x2 = goingBack ? x         : x + l.len;
      const a  = l.alpha * phase;
      const grd = ctx.createLinearGradient(x1, 0, x2, 0);
      grd.addColorStop(0,    l.col + '0)');
      grd.addColorStop(0.25, l.col + (a * 0.6) + ')');
      grd.addColorStop(0.65, l.col + a + ')');
      grd.addColorStop(1,    l.col + '0)');
      ctx.beginPath();
      ctx.moveTo(x1, l.y);
      ctx.lineTo(x2, l.y);
      ctx.strokeStyle = grd;
      ctx.lineWidth   = l.h;
      ctx.stroke();
    });

    if (phase > 0.65) {
      const fa  = (phase - 0.65) / 0.35 * 0.2;
      const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W, H) * 0.4);
      grd.addColorStop(0, `rgba(235,192,63,${fa})`);
      grd.addColorStop(1, `rgba(235,192,63,0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    if (t >= 0.46 && !draw._mid) { draw._mid = true; onMid(); }

    if (elapsed < TOTAL) requestAnimationFrame(draw);
    else { cnv.remove(); ov.style.opacity = '0'; }
  }
  draw._mid = false;
  ov.style.opacity = '1';
  requestAnimationFrame(draw);
}

function transitionForward (onMid) { runParticleTransition(false, onMid); }
function transitionBackward(onMid) { runParticleTransition(true,  onMid); }



// ─────────────────────────────────────────────
// 5. SECTION NAVIGATION ENGINE
// ─────────────────────────────────────────────
const sections  = Array.from($$('.section'));
const hudDots   = Array.from($$('.hud-dot'));
let currentSection  = 0;
let isTransitioning = false;
const COOLDOWN = 700;

// Reset scroll position on load to prevent browser scroll restoration bugs
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Salta alla sezione con offset esatto — disabilita temporaneamente lo scroll-snap per evitare conflitti
function jumpToSection(idx) {
  const el = sections[idx];
  if (!el) return;
  // Calcola offset assoluto dalla cima del documento
  let top = 0;
  let node = el;
  while (node && node !== document.body) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  
  // Disabilita lo scroll snap sull'elemento root
  document.documentElement.style.scrollSnapType = 'none';
  window.scrollTo({ top, behavior: 'instant' });
  
  // Ripristina lo scroll snap dopo un brevissimo delay
  setTimeout(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory';
  }, 50);
}

function goToSection(idx, goingBack) {
  idx = clamp(idx, 0, sections.length-1);
  if (idx === currentSection || isTransitioning) return;
  isTransitioning = true;

  if (idx === 0 && window._resetGalaxyWarp) {
    window._resetGalaxyWarp();
  }

  const jump = () => {
    currentSection = idx;
    jumpToSection(idx);
    updateHUD(idx);
    setTimeout(() => { isTransitioning = false; }, COOLDOWN);
  };

  if (goingBack) transitionBackward(jump);
  else           transitionForward(jump);
}

function updateHUD(idx) {
  hudDots.forEach((d,i) => d.classList.toggle('active', i===idx));
  const h=$('scroll-hint');
  if(h){ idx>0 ? h.classList.add('hidden') : h.classList.remove('hidden'); }
}

hudDots.forEach((d,i) => d.addEventListener('click', ()=>goToSection(i, i<currentSection)));

let wheelAccum = 0;
window.addEventListener('wheel', e => {
  // Non navigare se un overlay wormhole o il lightbox progetto è aperto
  if (window._activeOverlay) return;
  if (document.body.classList.contains('lightbox-open') || document.documentElement.classList.contains('lightbox-open')) return;
  if (isTransitioning) {
    if (e.cancelable) e.preventDefault();
    return;
  }
  wheelAccum += e.deltaY;
  if (Math.abs(wheelAccum) > 80) {
    const dir = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    if (e.cancelable) e.preventDefault();
    goToSection(currentSection + dir, dir < 0);
  }
}, { passive: false });

let touchY0 = 0;
window.addEventListener('touchstart', e => {
  touchY0 = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', e => {
  if (isTransitioning) {
    if (e.cancelable) e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchend', e => {
  if (isTransitioning) return;
  if (window._activeOverlay) return;
  const dy = touchY0 - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 50) {
    const dir = dy > 0 ? 1 : -1;
    goToSection(currentSection + dir, dir < 0);
  }
}, { passive: true });

document.addEventListener('keydown', e => {
  const keys = ['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'];
  if (keys.includes(e.key)) {
    e.preventDefault();
  }
  if (isTransitioning) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { goToSection(currentSection + 1, false); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { goToSection(currentSection - 1, true); }
  if (e.key === 'Home') goToSection(0, true);
  if (e.key === 'End')  goToSection(sections.length - 1, false);
  if (e.key === 'Enter' && currentSection === 0) { window._galaxyWarp && window._galaxyWarp(); }
});

const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting&&e.intersectionRatio>0.55&&!isTransitioning){
      const idx=parseInt(e.target.dataset.index);
      currentSection=idx; updateHUD(idx);
      if(idx===0&&window._resetGalaxyWarp) window._resetGalaxyWarp();
    }
  });
},{threshold:0.55});
sections.forEach(s=>io.observe(s));

// ─────────────────────────────────────────────
// 6. BIO — callout SVG lines + ship tilt
// ─────────────────────────────────────────────
(function(){
  const wrap=document.querySelector('.bio-ship-wrap');
  if(!wrap) return;
  const cards=Array.from($$('.callout-card'));
  const ship=$('bio-ship');
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:15;overflow:visible;';
  wrap.insertBefore(svg,wrap.firstChild);

  const CMAP={c1:'#ffffff',c2:'#ebc13f',c3:'#275325',c5:'#2a2e6e',c6:'#e30613'};
  const CPMAP={c1:'cp-engine',c2:'cp-wing-r',c3:'cp-boost',c5:'cp-wing-l',c6:'cp-cockpit'};

  function drawLines(){
    svg.innerHTML='';
    const wR=wrap.getBoundingClientRect();
    cards.forEach(card=>{
      const id=card.id, ptEl=document.getElementById(CPMAP[id]);
      if(!ptEl) return;
      const pR=ptEl.getBoundingClientRect(), cR=card.getBoundingClientRect();
      const col=CMAP[id]||'#EBC03F';
      const px=pR.left+pR.width/2-wR.left, py=pR.top+pR.height/2-wR.top;
      const cCx=cR.left+cR.width/2-wR.left, ey=cR.top+cR.height/2-wR.top;
      const ex=px<cCx?cR.left-wR.left:cR.right-wR.left;
      const bendX=px<cCx?ex-15:ex+15;
      const path=document.createElementNS(NS,'path');
      path.setAttribute('d',`M${px},${py} L${bendX},${ey} L${ex},${ey}`);
      path.setAttribute('fill','none'); path.setAttribute('stroke',col);
      path.setAttribute('stroke-width','0.9'); path.setAttribute('stroke-opacity','0.5');
      path.setAttribute('stroke-dasharray','5 3');
      const dot=document.createElementNS(NS,'circle');
      dot.setAttribute('cx',px);dot.setAttribute('cy',py);dot.setAttribute('r','3');
      dot.setAttribute('fill',col);dot.setAttribute('opacity','0.85');
      svg.appendChild(path); svg.appendChild(dot);
    });
  }

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) cards.forEach((c,i)=>setTimeout(()=>{c.classList.add('visible');drawLines();},i*100+200));
    });
  },{threshold:0.25});
  const bioSec=$('s-bio'); if(bioSec) obs.observe(bioSec);
  window.addEventListener('resize',drawLines);

  if(ship){
    ship.addEventListener('mousemove',e=>{
      const r=ship.getBoundingClientRect();
      const rx=((e.clientX-r.left)/r.width-0.5)*14;
      const ry=((e.clientY-r.top)/r.height-0.5)*-14;
      const sv=ship.querySelector('svg');
      if(sv) sv.style.transform=`perspective(420px) rotateY(${rx}deg) rotateX(${ry}deg)`;
    });
    ship.addEventListener('mouseleave',()=>{const sv=ship.querySelector('svg');if(sv)sv.style.transform='';});
  }
})();

// ─────────────────────────────────────────────
// 7. PLANET STARFIELDS
// ─────────────────────────────────────────────
function makePlanetStarfield(canvasId, accentHex){
  const canvas=$(canvasId); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let W,H,stars=[];
  const [ar,ag,ab]=hexRgb(accentHex);
  function build(){
    W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; stars=[];
    for(let i=0;i<140;i++) stars.push({x:rand(0,W),y:rand(0,H),r:rand(0.3,1.2),a:rand(0.06,0.3),tw:rand(0,PI2),sp:rand(0.01,0.04)});
    for(let i=0;i<18;i++)  stars.push({x:rand(0,W),y:rand(0,H),r:rand(0.6,1.7),a:rand(0.12,0.45),tw:rand(0,PI2),sp:rand(0.008,0.03),acc:true});
  }
  build(); window.addEventListener('resize',build);
  function draw(){
    ctx.clearRect(0,0,W,H);
    stars.forEach(s=>{
      s.tw+=s.sp;
      const a=s.a*(0.7+0.3*Math.sin(s.tw));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,PI2);
      ctx.fillStyle=s.acc?`rgba(${ar},${ag},${ab},${a})`:`rgba(255,255,255,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
makePlanetStarfield('planet-a-canvas','#EBC03F');
makePlanetStarfield('planet-b-canvas','#009640');

// ─────────────────────────────────────────────
// 8. PLANET SCENE — SVG connettori
// ─────────────────────────────────────────────
function drawPlanetConnectors(sceneId, connId, accentHex){
  const scene=$(sceneId), svg=$(connId);
  if(!scene||!svg) return;
  const NS='http://www.w3.org/2000/svg';
  const [r,g,b]=hexRgb(accentHex);

  function draw(){
    svg.innerHTML='';
    const sR=scene.getBoundingClientRect();
    const planetEl=scene.querySelector('.planet-sphere');
    const cardL=scene.querySelector('.project-card--left');
    const cardR=scene.querySelector('.project-card--right');
    if(!planetEl||!cardL||!cardR) return;

    const pR=planetEl.getBoundingClientRect();
    const pcx=pR.left+pR.width/2-sR.left;
    const pcy=pR.top+pR.height/2-sR.top;

    function makePath(ax1,ay1,ax2,ay2,ax3,ay3,ax4,ay4){
      const path=document.createElementNS(NS,'path');
      path.setAttribute('d',`M${ax1},${ay1} L${ax2},${ay2} L${ax3},${ay3} L${ax4},${ay4}`);
      path.setAttribute('fill','none');
      path.setAttribute('stroke',`rgba(${r},${g},${b},0.45)`);
      path.setAttribute('stroke-width','1.2');
      path.setAttribute('stroke-dasharray','7 4');
      return path;
    }
    function makeDot(dx,dy){
      const dot=document.createElementNS(NS,'circle');
      dot.setAttribute('cx',dx); dot.setAttribute('cy',dy); dot.setAttribute('r','3.5');
      dot.setAttribute('fill',`rgba(${r},${g},${b},0.7)`);
      return dot;
    }

    // Card sinistra → pianeta
    const cLR=cardL.getBoundingClientRect();
    const lEx=cLR.right-sR.left, lEy=cLR.top+cLR.height/2-sR.top;
    const lPx=pR.left-sR.left, midL=(lEx+lPx)/2;
    svg.appendChild(makePath(lEx,lEy,midL,lEy,midL,pcy,lPx,pcy));
    svg.appendChild(makeDot(lEx,lEy));
    svg.appendChild(makeDot(lPx,pcy));

    // Pianeta → card destra
    const cRR=cardR.getBoundingClientRect();
    const rEx=cRR.left-sR.left, rEy=cRR.top+cRR.height/2-sR.top;
    const rPx=pR.right-sR.left, midR=(rEx+rPx)/2;
    svg.appendChild(makePath(rPx,pcy,midR,pcy,midR,rEy,rEx,rEy));
    svg.appendChild(makeDot(rPx,pcy));
    svg.appendChild(makeDot(rEx,rEy));
  }

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting) setTimeout(draw,250);});
  },{threshold:0.25});
  obs.observe(scene);
  window.addEventListener('resize',draw);
}
drawPlanetConnectors('scene-a','connectors-a','#EBC03F');
drawPlanetConnectors('scene-b','connectors-b','#009640');

// ─────────────────────────────────────────────
// 9. PROJECT CARDS — animate in
// ─────────────────────────────────────────────
(function(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) setTimeout(()=>e.target.classList.add('visible'),120); });
  },{threshold:0.12});
  $$('.project-card').forEach(c=>obs.observe(c));
})();

// ─────────────────────────────────────────────
// 10. LIGHTBOX — click su project-card apre modale
// ─────────────────────────────────────────────
(function(){
  // Crea overlay lightbox
  const lb=document.createElement('div');
  lb.id='lightbox';
  lb.innerHTML=`
    <div class="lb-backdrop"></div>
    <div class="lb-panel" role="dialog" aria-modal="true" aria-label="Dettaglio progetto">
      <button class="lb-close" aria-label="Chiudi">&times;</button>
      <div class="lb-img">
        <img src="" alt="Dettaglio Progetto" class="lb-real-img" style="display:none;" />
        <video src="" autoplay loop muted playsinline controls class="lb-real-video" style="display:none; width:100%; height:100%; object-fit:cover;"></video>
        <div class="lb-photo-placeholder">
          <span class="photo-label">FOTO</span>
        </div>
      </div>
      <div class="lb-content">
        <p class="lb-tag"></p>
        <h2 class="lb-title"></h2>
        <div class="lb-description"></div>
        <div class="lb-critique"></div>
      </div>
    </div>
  `;
  document.body.appendChild(lb);

  function openLightbox(card){
    const tag   = card.querySelector('.project-tag')?.textContent || '';
    const title = card.querySelector('.project-title')?.textContent || '';
    const isB   = card.classList.contains('project-card--b');
    
    const cardImg = card.querySelector('.project-img');
    const lbImg = lb.querySelector('.lb-real-img');
    const lbVideo = lb.querySelector('.lb-real-video');
    const lbPlaceholder = lb.querySelector('.lb-photo-placeholder');
    
    if (cardImg) {
      const isVideo = cardImg.tagName.toLowerCase() === 'video';
      if (isVideo) {
        lbVideo.src = cardImg.src;
        lbVideo.style.display = 'block';
        lbImg.src = '';
        lbImg.style.display = 'none';
      } else {
        lbImg.src = cardImg.src;
        lbImg.style.display = 'block';
        lbVideo.src = '';
        lbVideo.style.display = 'none';
      }
      lbPlaceholder.style.display = 'none';
    } else {
      lbImg.src = '';
      lbImg.style.display = 'none';
      lbVideo.src = '';
      lbVideo.style.display = 'none';
      lbPlaceholder.style.display = 'flex';
    }
    
    lb.querySelector('.lb-tag').textContent   = tag;
    lb.querySelector('.lb-title').textContent = title;
    lb.querySelector('.lb-tag').style.color   = isB ? '#009640' : '#E3131C';

    // Recupera descrizione e autocritica
    const desc = card.querySelector('.project-desc')?.textContent || '';
    const critique = card.querySelector('.project-critique')?.textContent || '';

    const descEl = lb.querySelector('.lb-description');
    const critiqueEl = lb.querySelector('.lb-critique');

    if (desc) {
      descEl.textContent = desc;
      descEl.style.display = 'block';
    } else {
      descEl.textContent = 'Descrizione in arrivo...';
      descEl.style.display = 'block';
    }

    if (critique) {
      critiqueEl.textContent = critique;
      critiqueEl.style.display = 'block';
    } else {
      critiqueEl.textContent = '';
      critiqueEl.style.display = 'none';
    }

    lb.classList.add('lb-open');
    document.documentElement.classList.add('lightbox-open');
    document.body.classList.add('lightbox-open');
    document.body.style.overflow='hidden';
  }
  function closeLightbox(){
    const lbVideo = lb.querySelector('.lb-real-video');
    if (lbVideo) lbVideo.src = '';
    lb.classList.remove('lb-open');
    document.documentElement.classList.remove('lightbox-open');
    document.body.classList.remove('lightbox-open');
    document.body.style.overflow='';
  }

  $$('.project-card').forEach(card=>{
    card.style.cursor='pointer';
    card.addEventListener('click', ()=>openLightbox(card));
  });
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // Blocca lo scroll della wheel dentro il lightbox (evita che cambi sezione)
  lb.addEventListener('wheel', e => {
    // Se non stiamo scrollando dentro la descrizione (lb-content), previeni lo scroll di default
    if (!e.target.closest('.lb-content')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, { passive: false });
  lb.addEventListener('touchmove', e => {
    if (!e.target.closest('.lb-content')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, { passive: false });
})();

// ─────────────────────────────────────────────
// 11. PLANET PARALLAX
// ─────────────────────────────────────────────
document.addEventListener('mousemove', e=>{
  const mx=(e.clientX/window.innerWidth-0.5)*16;
  const my=(e.clientY/window.innerHeight-0.5)*16;
  $$('.planet-sphere').forEach(s=>{
    s.style.transform=`rotate3d(${-my/16},${mx/16},0,${Math.sqrt(mx*mx+my*my)}deg)`;
  });
});

// ─────────────────────────────────────────────
// 12. WARP STARS — sezione contatti
// ─────────────────────────────────────────────
(function(){
  const canvas=$('warp-stars-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let W,H,stars=[];
  const BRAND=['#E3131C','#2C2C6E','#EBC03F','#009640'];
  function build(){
    W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; stars=[];
    for(let i=0;i<120;i++){
      const ang=rand(0,PI2),d=rand(2,Math.min(W,H)*0.05);
      stars.push({ang,x:W/2+Math.cos(ang)*d,y:H/2+Math.sin(ang)*d,
        speed:rand(2,7.5),len:rand(0,1),col:BRAND[Math.floor(rand(0,BRAND.length))],size:rand(0.4,1.3)});
    }
  }
  build(); window.addEventListener('resize',build);
  function draw(){
    ctx.fillStyle='rgba(4,4,8,0.13)'; ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{
      s.len+=s.speed*0.04;
      const x1=W/2+Math.cos(s.ang)*s.len, y1=H/2+Math.sin(s.ang)*s.len;
      const x2=W/2+Math.cos(s.ang)*(s.len+s.speed*1.5), y2=H/2+Math.sin(s.ang)*(s.len+s.speed*1.5);
      const [r,g,b]=hexRgb(s.col);
      const grd=ctx.createLinearGradient(x1,y1,x2,y2);
      grd.addColorStop(0,`rgba(${r},${g},${b},0)`);
      grd.addColorStop(1,`rgba(${r},${g},${b},0.75)`);
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
      ctx.strokeStyle=grd;ctx.lineWidth=s.size;ctx.stroke();
      if(x2<0||x2>W||y2<0||y2>H){const a=rand(0,PI2);s.ang=a;s.len=rand(2,Math.min(W,H)*0.04);s.speed=rand(2,7.5);}
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─────────────────────────────────────────────
// 13b. CONTACT LINKS — mailto apertura client mail
// ─────────────────────────────────────────────
(function () {
  // Funzione per copiare testo negli appunti (async per catturare errori sincroni)
  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        // Gara con un timeout di 150ms per evitare che l'API moderna si blocchi (es. in browser headless)
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 150))
        ]);
        return true;
      } catch (err) {
        console.warn('Modern clipboard API failed or timed out, trying fallback...', err);
      }
    }
    
    // Fallback con textarea
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(el);
    if (!success) {
      throw new Error('Fallback copy failed');
    }
    return true;
  }

  // Mostra toast personalizzato
  function showToast(message) {
    let toast = document.getElementById('contacts-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'contacts-toast';
      toast.className = 'contacts-toast';
      toast.innerHTML = `
        <span class="contacts-toast-icon">▶</span>
        <span class="contacts-toast-msg"></span>
      `;
      document.body.appendChild(toast);
    }
    toast.querySelector('.contacts-toast-msg').textContent = message;
    toast.classList.add('show');
    
    // Rimuovi dopo 3.5 secondi
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Gestione click sui link contatti
  document.querySelectorAll('a.chc-row').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('mailto:')) {
        // Previeni e stoppa immediatamente per evitare anomalie del browser
        e.preventDefault();
        e.stopPropagation();
        
        // Estrai l'indirizzo email
        const email = href.replace('mailto:', '').split('?')[0];
        
        // Copia negli appunti con gestione sicura degli errori
        copyToClipboard(email)
          .then(() => {
            showToast(`EMAIL COPIATA NEGLI APPUNTI: ${email}`);
          })
          .catch(err => {
            console.warn('Clipboard copy failed:', err);
            showToast(`APERTURA E-MAIL: ${email}`);
          });

        // Apri in una nuova scheda
        try {
          const newWindow = window.open(href, '_blank');
          if (newWindow) {
            setTimeout(() => {
              try {
                if (newWindow.location.href === 'about:blank' || newWindow.location.href.startsWith('mailto:')) {
                  newWindow.close();
                }
              } catch(err) {
                // Cross-origin atteso se ha aperto webmail (es. Gmail)
              }
            }, 1200);
          }
        } catch (openErr) {
          console.warn('Window open failed:', openErr);
        }
      }
    });
  });
})();

// ─────────────────────────────────────────────
// 14. BACK TO START
// ─────────────────────────────────────────────
const btsBtn=$('back-to-start');
if(btsBtn){
  btsBtn.addEventListener('click',()=>{
    if(isTransitioning) return;
    isTransitioning=true;
    if(window._resetGalaxyWarp) window._resetGalaxyWarp();
    transitionBackward(()=>{
      currentSection=0;
      jumpToSection(0);
      updateHUD(0);
      setTimeout(()=>{isTransitioning=false;},COOLDOWN);
    });
  });
}

// ─────────────────────────────────────────────
// 15. GLITCH TITLE
// ─────────────────────────────────────────────
(function(){
  const words=$$('.galaxy-title-word');
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!$%';
  function glitch(el){
    const orig=el.dataset.word; let iter=0;
    const iv=setInterval(()=>{
      el.textContent=orig.split('').map((ch,i)=>i<iter?orig[i]:chars[Math.floor(Math.random()*chars.length)]).join('');
      if(iter>=orig.length){el.textContent=orig;clearInterval(iv);}
      iter+=0.45;
    },38);
  }
  words.forEach(w=>w.addEventListener('mouseenter',()=>glitch(w)));
  function auto(){if(words.length){glitch(words[Math.floor(rand(0,words.length))]);} setTimeout(auto,rand(5000,10000));}
  setTimeout(auto,4000);
})();

// ─────────────────────────────────────────────
// 16. RESIZE — risincronizza scroll position
// ─────────────────────────────────────────────
window.addEventListener('resize', () => { jumpToSection(currentSection); });

// ─────────────────────────────────────────────
// 17. WORMHOLE OVERLAYS & CAROUSELS SYSTEM
// ─────────────────────────────────────────────
(function(){
  let activeOverlay = null;
  // Esponi globalmente per il wheel handler
  window._activeOverlay = null;
  let sliderIdeaIndex = 0;
  const sliderIdeaCount = 5;
  let sliderCertIndex = 0;
  const sliderCertCount = 6;

  function updateSlider(type) {
    if (type === 'idea') {
      const track = document.querySelector('#slider-idea-wrapper .slider-track');
      const indicator = $('indicator-idea');
      if (track) {
        track.style.transform = `translateX(-${sliderIdeaIndex * 100}%)`;
      }
      if (indicator) {
        indicator.textContent = `PAGINA ${sliderIdeaIndex + 1} / ${sliderIdeaCount}`;
      }
    } else if (type === 'certificati') {
      const track = document.querySelector('#slider-certificati-wrapper .slider-track');
      const indicator = $('indicator-certificati');
      if (track) {
        track.style.transform = `translateX(-${sliderCertIndex * 100}%)`;
      }
      if (indicator) {
        indicator.textContent = `ATTESTATO ${sliderCertIndex + 1} / ${sliderCertCount}`;
      }
    }
  }

  function slidePrev(type) {
    if (type === 'idea') {
      sliderIdeaIndex = (sliderIdeaIndex - 1 + sliderIdeaCount) % sliderIdeaCount;
    } else {
      sliderCertIndex = (sliderCertIndex - 1 + sliderCertCount) % sliderCertCount;
    }
    updateSlider(type);
  }

  function slideNext(type) {
    if (type === 'idea') {
      sliderIdeaIndex = (sliderIdeaIndex + 1) % sliderIdeaCount;
    } else {
      sliderCertIndex = (sliderCertIndex + 1) % sliderCertCount;
    }
    updateSlider(type);
  }

  function openOverlay(id) {
    const panel = $(id);
    if (!panel) return;
    
    // Reset index
    if (id === 'overlay-idea') {
      sliderIdeaIndex = 0;
      updateSlider('idea');
    } else {
      sliderCertIndex = 0;
      updateSlider('certificati');
    }
    
    panel.style.display = 'flex';
    setTimeout(() => {
      panel.classList.add('active');
      activeOverlay = id;
      window._activeOverlay = id;
      document.documentElement.classList.add('lightbox-open');
      document.body.classList.add('lightbox-open');
      document.body.style.overflow = 'hidden';
    }, 15);
  }

  function closeOverlay() {
    if (!activeOverlay) return;
    const panel = $(activeOverlay);
    if (!panel) return;
    
    panel.classList.remove('active');
    document.documentElement.classList.remove('lightbox-open');
    document.body.classList.remove('lightbox-open');
    document.body.style.overflow = '';
    window._activeOverlay = null;
    
    setTimeout(() => {
      panel.style.display = 'none';
      activeOverlay = null;
    }, 400);
  }

  function triggerOpenWarp(targetId) {
    if (isTransitioning) return;
    isTransitioning = true;
    transitionForward(() => {
      openOverlay(targetId);
      isTransitioning = false;
    });
  }

  function triggerCloseWarp() {
    if (isTransitioning || !activeOverlay) return;
    isTransitioning = true;
    transitionBackward(() => {
      closeOverlay();
      isTransitioning = false;
    });
  }

  // Bind wormholes click
  const whs = $$('.wormhole');
  whs.forEach(wh => {
    wh.addEventListener('click', e => {
      e.preventDefault();
      const targetHash = wh.getAttribute('href'); // e.g. "#overlay-idea"
      if (targetHash && targetHash.startsWith('#')) {
        triggerOpenWarp(targetHash.substring(1));
      }
    });
  });

  // Bind close buttons and backdrop clicks
  document.addEventListener('click', e => {
    if (e.target.closest('.overlay-close') || e.target.closest('.overlay-backdrop') || e.target.closest('.overlay-return-btn')) {
      e.preventDefault();
      triggerCloseWarp();
    }
  });

  // Bind slider arrow clicks
  const bindSliderNav = (panelId, type) => {
    const p = $(panelId);
    if (!p) return;
    const prevBtn = p.querySelector('.slider-nav--prev');
    const nextBtn = p.querySelector('.slider-nav--next');
    if (prevBtn) prevBtn.addEventListener('click', () => slidePrev(type));
    if (nextBtn) nextBtn.addEventListener('click', () => slideNext(type));
  };
  bindSliderNav('overlay-idea', 'idea');
  bindSliderNav('overlay-certificati', 'certificati');

  // Keyboard navigation and ESC key close support
  document.addEventListener('keydown', e => {
    if (!activeOverlay) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      triggerCloseWarp();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const type = (activeOverlay === 'overlay-idea') ? 'idea' : 'certificati';
      slidePrev(type);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const type = (activeOverlay === 'overlay-idea') ? 'idea' : 'certificati';
      slideNext(type);
    }
  });
})();

// ─────────────────────────────────────────────
// 18. AUTOMATIC NAVIGATION SYSTEM (AUTO PLAY)
// ─────────────────────────────────────────────
(function(){
  const toggleBtn = $('auto-nav-toggle');
  if (!toggleBtn) return;

  let isAutoNavEnabled = true;
  let autoNavIdleTime = 0;
  let autoNavPaused = false;

  // Toggle button click listener
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isAutoNavEnabled = !isAutoNavEnabled;
    autoNavIdleTime = 0;
    updateToggleUI();
  });

  function updateToggleUI() {
    const dot = toggleBtn.querySelector('.ant-dot');
    const txt = toggleBtn.querySelector('.ant-text');
    
    toggleBtn.classList.remove('paused', 'off');
    
    if (!isAutoNavEnabled) {
      toggleBtn.classList.add('off');
      if (txt) txt.textContent = 'AUTO NAV: OFF';
    } else if (autoNavPaused || document.body.classList.contains('lightbox-open')) {
      toggleBtn.classList.add('paused');
      if (txt) txt.textContent = 'AUTO NAV: PAUSE';
    } else {
      if (txt) txt.textContent = 'AUTO NAV: ON';
    }
  }

  // Reset idle timer on user activity
  const resetIdle = () => {
    autoNavIdleTime = 0;
  };

  const activities = ['mousemove', 'mousedown', 'wheel', 'keydown', 'touchstart'];
  activities.forEach(act => {
    window.addEventListener(act, resetIdle, { passive: true });
  });

  // Pause auto-navigation when hovering over interactive elements
  const interactiveSelectors = '.project-card, .callout-card, #hud-nav, .auto-nav-toggle, .wormhole, #lightbox, .launch-btn, .back-to-start';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      autoNavPaused = true;
      updateToggleUI();
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      autoNavPaused = false;
      updateToggleUI();
    }
  });

  // Main tick interval
  setInterval(() => {
    const isLightboxOpen = document.body.classList.contains('lightbox-open');
    updateToggleUI();

    if (!isAutoNavEnabled || autoNavPaused || isLightboxOpen || isTransitioning) {
      return;
    }

    autoNavIdleTime++;
    if (autoNavIdleTime >= 12) {
      autoNavIdleTime = 0;
      // Go to next section, cycle back to 0 at the end
      const nextSec = (currentSection + 1) % sections.length;
      
      goToSection(nextSec, nextSec < currentSection);
    }
  }, 1000);
})();
