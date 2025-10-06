// Stopwatch state
                let running = false;
                let startTime = 0;
                let elapsed = 0;
                let lapTimes = [];
                let animFrame;

                const timeEl = document.getElementById('time');
                const timeSubEl = document.getElementById('time-sub');
                const startPauseBtn = document.getElementById('startPauseBtn');
                const lapBtn = document.getElementById('lapBtn');
                const resetBtn = document.getElementById('resetBtn');
                const lapsEl = document.getElementById('laps');
                const clearLapsBtn = document.getElementById('clearLaps');
                const ringFg = document.getElementById('ring-fg');

                function formatTime(ms) {
                        const totalSec = Math.floor(ms / 1000);
                        const min = Math.floor(totalSec / 60);
                        const sec = totalSec % 60;
                        const milli = ms % 1000;
                        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(milli).padStart(3, '0')}`;
                }

                function formatSubTime(ms) {
                        const totalSec = Math.floor(ms / 1000);
                        const min = Math.floor(totalSec / 60);
                        const sec = totalSec % 60;
                        return `${String(min).padStart(2, '0')}m : ${String(sec).padStart(2, '0')}s`;
                }

                function updateDisplay() {
                        const current = running ? Date.now() - startTime + elapsed : elapsed;
                        timeEl.textContent = formatTime(current);
                        timeSubEl.textContent = formatSubTime(current);

                        // Update ring (60 second cycle)
                        const seconds = (current / 1000) % 60;
                        const offset = 603 - (seconds / 60) * 603;
                        ringFg.style.strokeDashoffset = offset;

                        if (running) {
                                animFrame = requestAnimationFrame(updateDisplay);
                        }
                }

                function toggleStartPause() {
                        running = !running;
                        if (running) {
                                startTime = Date.now();
                                document.body.classList.add('running');
                                startPauseBtn.querySelector('.icon').textContent = '⏸';
                                startPauseBtn.querySelector('.txt').textContent = 'Pause';
                                updateDisplay();
                        } else {
                                elapsed += Date.now() - startTime;
                                document.body.classList.remove('running');
                                startPauseBtn.querySelector('.icon').textContent = '▶';
                                startPauseBtn.querySelector('.txt').textContent = 'Resume';
                                cancelAnimationFrame(animFrame);
                                updateDisplay();
                        }
                }

                function recordLap() {
                        if (!running && elapsed === 0) return;

                        const current = running ? Date.now() - startTime + elapsed : elapsed;
                        const prevTotal = lapTimes.length > 0 ? lapTimes[lapTimes.length - 1].total : 0;
                        const split = current - prevTotal;

                        lapTimes.push({ split, total: current });
                        renderLaps();
                }

                function renderLaps() {
                        lapsEl.innerHTML = '';
                        lapTimes.forEach((lap, i) => {
                                const li = document.createElement('li');
                                li.innerHTML = `
                    <div class="idx">#${i + 1}</div>
                    <div>
                        <div class="meta">Split</div>
                        <div class="split">${formatTime(lap.split)}</div>
                    </div>
                    <div>
                        <div class="meta">Total</div>
                        <div class="total">${formatTime(lap.total)}</div>
                    </div>
                `;
                                lapsEl.appendChild(li);
                        });
                }

                function reset() {
                        running = false;
                        elapsed = 0;
                        startTime = 0;
                        document.body.classList.remove('running');
                        startPauseBtn.querySelector('.icon').textContent = '▶';
                        startPauseBtn.querySelector('.txt').textContent = 'Start';
                        cancelAnimationFrame(animFrame);
                        updateDisplay();
                }

                function clearLaps() {
                        lapTimes = [];
                        renderLaps();
                }

                // Event listeners
                startPauseBtn.addEventListener('click', toggleStartPause);
                lapBtn.addEventListener('click', recordLap);
                resetBtn.addEventListener('click', reset);
                clearLapsBtn.addEventListener('click', clearLaps);

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                        if (e.code === 'Space') {
                                e.preventDefault();
                                toggleStartPause();
                        } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                                e.preventDefault();
                                recordLap();
                        }
                });

                // Initialize display
                updateDisplay();