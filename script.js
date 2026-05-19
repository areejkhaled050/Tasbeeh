/* ===== STATE ===== */
const state = {
  currentDhikr: 'subhanallah',
  counters: {
    subhanallah: 0, alhamdulillah: 0, allahuakbar: 0,
    lailaha: 0, lahawla: 0, astaghfir: 0, salawat: 0
  },
  labels: {
    subhanallah: 'سبحان الله', alhamdulillah: 'الحمد لله', allahuakbar: 'الله أكبر',
    lailaha: 'لا إله إلا الله', lahawla: 'لا حول ولا قوة إلا بالله',
    astaghfir: 'أستغفر الله', salawat: 'اللهم صلِّ على النبي'
  },
  soundEnabled: true,
  targetPerRound: 33,
};

/* ===== AUDIO ===== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
}
function playClickSound() {
  if (!state.soundEnabled) return;
  ensureAudioCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.12);
}
function playMilestoneSound() {
  if (!state.soundEnabled) return;
  ensureAudioCtx();
  [0, 0.12, 0.24].forEach((delay, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime([523, 659, 784][i], audioCtx.currentTime + delay);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.3);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + 0.3);
  });
}

/* ===== PARTICLES ===== */
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 6 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = Math.random() * 8 + 6 + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    container.appendChild(p);
  }
}

/* ===== NAVIGATION ===== */
function showTasbeeh() {
  document.getElementById('landing').classList.remove('active');
  document.getElementById('tasbeeh').classList.add('active');
}
function showLanding() {
  document.getElementById('tasbeeh').classList.remove('active');
  document.getElementById('landing').classList.add('active');
}

/* ===== DHIKR SELECTION ===== */
function selectDhikr(btn) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.currentDhikr = btn.dataset.dhikr;
  updateDisplay();
}

/* ===== COUNTER ===== */
function incrementCounter() {
  state.counters[state.currentDhikr]++;
  playClickSound();
  animateBump();
  createRipple();
  vibrate();
  updateDisplay();
  checkMilestone();
}

function resetCounter() {
  state.counters[state.currentDhikr] = 0;
  updateDisplay();
}

function resetOne(key) {
  state.counters[key] = 0;
  updateDisplay();
}

function resetAll() {
  Object.keys(state.counters).forEach(k => state.counters[k] = 0);
  updateDisplay();
}

function updateDisplay() {
  const count = state.counters[state.currentDhikr];
  document.getElementById('counterDisplay').textContent = count;
  document.getElementById('currentDhikr').textContent = state.labels[state.currentDhikr];

  // Progress ring
  const circumference = 2 * Math.PI * 120; // r=120
  const progress = (count % state.targetPerRound) / state.targetPerRound;
  const offset = circumference * (1 - progress);
  document.getElementById('progressRing').style.strokeDashoffset = offset;

  // Total
  const total = Object.values(state.counters).reduce((a, b) => a + b, 0);
  document.getElementById('totalCount').textContent = total;

  // Summary — update all counters
  Object.keys(state.counters).forEach(key => {
    const el = document.getElementById('count-' + key);
    if (el) el.textContent = state.counters[key];
  });
}

/* ===== ANIMATIONS ===== */
function animateBump() {
  const el = document.getElementById('counterDisplay');
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 150);
}

function createRipple() {
  const btn = document.getElementById('tasbeehBtn');
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  const size = btn.offsetWidth;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = '0px';
  ripple.style.top = '0px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(30);
}

/* ===== MILESTONE ===== */
function checkMilestone() {
  const count = state.counters[state.currentDhikr];
  if (count > 0 && count % state.targetPerRound === 0) {
    showMilestone(count);
  }
}

function showMilestone(count) {
  playMilestoneSound();
  const flash = document.createElement('div');
  flash.className = 'milestone-flash';
  flash.innerHTML = `
    <div class="milestone-content">
      <div class="milestone-number">${count}</div>
      <div class="milestone-text">ماشاء الله — ${state.labels[state.currentDhikr]}</div>
    </div>`;
  document.body.appendChild(flash);
  requestAnimationFrame(() => flash.classList.add('show'));
  setTimeout(() => {
    flash.classList.remove('show');
    setTimeout(() => flash.remove(), 400);
  }, 1500);
}

/* ===== SOUND TOGGLE ===== */
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  document.getElementById('soundOn').style.display = state.soundEnabled ? 'block' : 'none';
  document.getElementById('soundOff').style.display = state.soundEnabled ? 'none' : 'block';
}

/* ===== KEYBOARD SUPPORT ===== */
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('tasbeeh').classList.contains('active')) return;
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    incrementCounter();
  }
});

/* ===== INIT ===== */
createParticles();
updateDisplay();
