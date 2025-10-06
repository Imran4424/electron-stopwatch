const timeEl = document.getElementById('time');
const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsEl = document.getElementById('laps');
const alwaysOnTopEl = document.getElementById('alwaysOnTop');

// Stopwatch state
let running = false;
let startHighRes = 0;      // performance.now() at last start
let carriedMs = 0;         // accumulated ms when paused
let rafId = null;
let laps = [];

const formatTime = (ms) => {
  const totalMs = Math.max(0, Math.round(ms));
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis  = totalMs % 1000;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(millis).padStart(3,'0')}`;
};

function render() {
  const elapsed = running ? carriedMs + (performance.now() - startHighRes) : carriedMs;
  timeEl.textContent = formatTime(elapsed);
}

function tick() {
  render();
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  startHighRes = performance.now();
  startPauseBtn.textContent = 'Pause';
  if (!rafId) tick();
  persist();
}

function pause() {
  if (!running) return;
  running = false;
  carriedMs += performance.now() - startHighRes;
  startPauseBtn.textContent = 'Resume';
  cancelAnimationFrame(rafId);
  rafId = null;
  render();
  persist();
}

function reset() {
  running = false;
  startHighRes = 0;
  carriedMs = 0;
  laps = [];
  startPauseBtn.textContent = 'Start';
  cancelAnimationFrame(rafId);
  rafId = null;
  render();
  renderLaps();
  persist();
}

function lap() {
  const elapsed = running ? carriedMs + (performance.now() - startHighRes) : carriedMs;
  const last = laps.length ? laps[laps.length - 1].elapsed : 0;
  const split = elapsed - last;
  laps.push({ index: laps.length + 1, elapsed, split });
  renderLaps();
  persist();
}

function renderLaps() {
  lapsEl.innerHTML = '';
  for (const l of laps.slice().reverse()) {
    const li = document.createElement('li');
    li.textContent = `#${l.index}  Split: ${formatTime(l.split)}   Total: ${formatTime(l.elapsed)}`;
    lapsEl.appendChild(li);
  }
}

// Controls
startPauseBtn.addEventListener('click', () => (running ? pause() : start()));
lapBtn.addEventListener('click', () => lap());
resetBtn.addEventListener('click', () => reset());

// Keyboard shortcuts (when window focused)
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); running ? pause() : start(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); lap(); }
});

// Menu/tray hotkeys from main
window.stopwatchAPI.onToggle(() => (running ? pause() : start()));
window.stopwatchAPI.onLap(() => lap());

// Persist minimal UI state to main (in-memory for demo)
async function restore() {
  const st = await window.stopwatchAPI.getPersist();
  if (st) {
    laps = st.laps ?? [];
    carriedMs = st.elapsedMs ?? 0;
    running = false; // always start paused on restore
    render();
    renderLaps();
  }
}
function persist() {
  const elapsed = running ? carriedMs + (performance.now() - startHighRes) : carriedMs;
  window.stopwatchAPI.setPersist({ laps, elapsedMs: elapsed, running: false });
}

// Always-on-top checkbox (toggled via menu in main; here we mirror preference)
alwaysOnTopEl.addEventListener('change', () => {
  // We can't call BrowserWindow APIs here securely; a simple approach is to use the menu checkbox in main.
  // This checkbox is just a visual hint; you can wire this via another IPC if desired.
});

restore();
render();
