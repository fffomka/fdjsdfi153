/**
 * AVIATOR SIGNAL — script.js
 * Shows only the CURRENT round multiplier from the API
 */

/* ============================================================
   TELEGRAM WEB APP
   ============================================================ */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

/* ============================================================
   CONFIG
   ============================================================ */
const CONFIG = {
  API_URL: 'https://api.mellwgameos.cc/api/get_games?game=aviator&user_id=1',
  LOADING_MESSAGES: ['SCANNING', 'ANALYZING', 'COMPUTING', 'DECODING', 'LOADING'],
  MIN_LOADING_MS: 2000,
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1500,
};

/* ============================================================
   DOM REFS
   ============================================================ */
const $btn         = document.getElementById('get-signal-btn');
const $btnText     = document.getElementById('btn-text');
const $btnHint     = document.getElementById('btn-hint');
const $stateIdle   = document.getElementById('state-idle');
const $stateLoad   = document.getElementById('state-loading');
const $stateResult = document.getElementById('state-result');
const $loadText    = document.getElementById('loading-text');
const $multiplier  = document.getElementById('multiplier-value');
const $circle      = document.getElementById('signal-circle');

/* ============================================================
   STATE
   ============================================================ */
let isLoading = false;

/* ============================================================
   PARTICLES
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const COLORS = [
    'rgba(232,25,44,0.55)', 'rgba(232,25,44,0.28)',
    'rgba(180,15,30,0.35)', 'rgba(255,60,70,0.20)',
    'rgba(255,255,255,0.06)',
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.1,
      life: Math.random(),
      decay: Math.random() * 0.003 + 0.001,
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < 55; i++) particles.push(mkParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(232,25,44,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    particles.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, (p.life * 0.8) + ')');
      ctx.fill();
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > W + 10) {
        particles[i] = mkParticle();
        particles[i].y = H + 5;
      }
    });
    requestAnimationFrame(draw);
  }

  resize(); init(); draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

/* ============================================================
   HELPERS
   ============================================================ */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showState(name) {
  [$stateIdle, $stateLoad, $stateResult].forEach(el => el?.classList.add('hidden'));
  const map = { idle: $stateIdle, loading: $stateLoad, result: $stateResult };
  map[name]?.classList.remove('hidden');
}

function startLoadingMessages() {
  const msgs = CONFIG.LOADING_MESSAGES;
  let i = 0;
  if ($loadText) $loadText.textContent = msgs[i];
  return setInterval(() => {
    i = (i + 1) % msgs.length;
    if ($loadText) $loadText.textContent = msgs[i];
  }, 550);
}

/* ============================================================
   API  — parse "Current: 14.2 | Next: 1.74"  → only current
   ============================================================ */
function parseSignal(data) {
  const m = data.match(/Current:\s*([\d.]+)/i);
  return m ? parseFloat(m[1]) : null;
}

async function fetchSignal(retries = CONFIG.MAX_RETRIES) {
  const res = await fetch(CONFIG.API_URL, { cache: 'no-store' });
  if (!res.ok) {
    if (retries > 0) { await sleep(CONFIG.RETRY_DELAY_MS); return fetchSignal(retries - 1); }
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json();
  if (!json.success || !json.data) throw new Error('Bad response');
  const current = parseSignal(json.data);
  if (current === null) throw new Error('Parse failed');
  return current;
}

/* ============================================================
   MAIN
   ============================================================ */
async function getSignal() {
  if (isLoading) return;
  isLoading = true;

  tg?.HapticFeedback?.impactOccurred('medium');

  $btn.disabled = true;
  $btnText.textContent = 'SEARCHING…';
  $circle.style.borderColor = 'rgba(232,25,44,0.15)';
  showState('loading');

  const interval = startLoadingMessages();

  try {
    const [current] = await Promise.all([fetchSignal(), sleep(CONFIG.MIN_LOADING_MS)]);
    clearInterval(interval);

    $multiplier.textContent = current.toFixed(2) + 'x';
    showState('result');

    tg?.HapticFeedback?.notificationOccurred('success');

    $btnText.textContent = 'REFRESH';
    $btnHint.textContent  = 'Signal received · tap to refresh';
    $btn.disabled = false;

  } catch (err) {
    clearInterval(interval);
    showState('idle');
    $btnText.textContent = 'RETRY';
    $btnHint.textContent  = 'Connection failed — tap to retry';
    $btn.disabled = false;
    tg?.HapticFeedback?.notificationOccurred('error');
    console.error('[AviatorSignal]', err.message);
  } finally {
    $circle.style.borderColor = '';
    isLoading = false;
  }
}

/* ---------- Footer ---------- */
document.querySelector('.footer-tg-card')?.addEventListener('click', () => {
  tg?.openTelegramLink?.('https://t.me/zaryxel') ||
    window.open('https://t.me/zaryxel', '_blank');
});
