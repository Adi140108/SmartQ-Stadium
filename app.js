/* ═══════════════════════════════════════════════
   SmartQ Stadium – app.js
   Pure HTML/CSS/JS web app · No backend required
═══════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// 1. MOCK DATA
// ─────────────────────────────────────────────
const STALLS = [
  {
    id: 'food-a', name: 'Food Stall A', emoji: '🍔', category: 'food',
    queueLength: 24, maxQueue: 40, avgTime: 2.5,
    location: 'North Wing, Gate 1',
    items: ['Burgers', 'Fries', 'Hotdogs'],
  },
  {
    id: 'food-b', name: 'Food Stall B', emoji: '🌮', category: 'food',
    queueLength: 8, maxQueue: 40, avgTime: 2,
    location: 'East Wing, Gate 3',
    items: ['Tacos', 'Nachos', 'Wraps'],
  },
  {
    id: 'food-c', name: 'Snack Corner', emoji: '🍿', category: 'food',
    queueLength: 15, maxQueue: 40, avgTime: 1.5,
    location: 'South Wing, Gate 7',
    items: ['Popcorn', 'Chips', 'Candy'],
  },
  {
    id: 'beverage-a', name: 'Beverages Hub', emoji: '🥤', category: 'beverage',
    queueLength: 31, maxQueue: 40, avgTime: 1.8,
    location: 'West Wing, Gate 5',
    items: ['Soft Drinks', 'Water', 'Juice'],
  },
  {
    id: 'beverage-b', name: 'Coffee & Tea', emoji: '☕', category: 'beverage',
    queueLength: 6, maxQueue: 30, avgTime: 3,
    location: 'North Wing, Gate 2',
    items: ['Espresso', 'Cappuccino', 'Tea'],
  },
  {
    id: 'washroom-a', name: 'Washroom A', emoji: '🚻', category: 'facility',
    queueLength: 18, maxQueue: 25, avgTime: 1.2,
    location: 'Main Concourse',
    items: [],
  },
  {
    id: 'washroom-b', name: 'Washroom B', emoji: '🚻', category: 'facility',
    queueLength: 4, maxQueue: 25, avgTime: 1.2,
    location: 'East Concourse',
    items: [],
  },
  {
    id: 'merch', name: 'Merchandise', emoji: '👕', category: 'shop',
    queueLength: 12, maxQueue: 35, avgTime: 4,
    location: 'Main Entrance Hall',
    items: ['Jersey', 'Cap', 'Scarf'],
  },
];

// ─────────────────────────────────────────────
// 2. STATE
// ─────────────────────────────────────────────
let state = {
  stalls: JSON.parse(JSON.stringify(STALLS)), // live copy
  myTokens: [],          // { id, stallId, tokenNum, position, joinedAt }
  tokensIssued: 0,
  activityFeed: [],
};

// ─────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────
function getStatus(stall) {
  const ratio = stall.queueLength / stall.maxQueue;
  if (ratio < 0.35) return 'low';
  if (ratio < 0.65) return 'medium';
  return 'high';
}

function getWait(stall) {
  return (stall.queueLength * stall.avgTime).toFixed(1);
}

function getBestAlternative(currentStallId, category) {
  const similar = state.stalls.filter(s => s.id !== currentStallId && s.category === category);
  if (!similar.length) return null;
  return similar.reduce((best, s) => s.queueLength < best.queueLength ? s : best);
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function nowStr() {
  return formatTime(new Date());
}

// ─────────────────────────────────────────────
// 4. CLOCK
// ─────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('timeDisplay');
  if (el) el.textContent = formatTime(new Date());
}
setInterval(updateClock, 1000);
updateClock();

// ─────────────────────────────────────────────
// 5. TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
function showToast(icon, title, msg, type = 'info', duration = 4500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" onclick="dismissToast(this)">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

function dismissToast(btn) {
  const toast = btn.closest('.toast');
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove());
}

// ─────────────────────────────────────────────
// 6. ACTIVITY FEED
// ─────────────────────────────────────────────
function addActivity(icon, text) {
  state.activityFeed.unshift({ icon, text, time: nowStr() });
  if (state.activityFeed.length > 30) state.activityFeed.pop();
  renderActivityFeed();
}

function renderActivityFeed() {
  const el = document.getElementById('activityFeed');
  el.innerHTML = state.activityFeed.slice(0, 12).map(item => `
    <div class="feed-item">
      <div class="feed-icon">${item.icon}</div>
      <div>
        <div class="feed-text">${item.text}</div>
        <div class="feed-time">${item.time}</div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// 7. STATS BAR
// ─────────────────────────────────────────────
function updateStats() {
  const total = state.stalls.reduce((s, x) => s + x.queueLength, 0);
  const low   = state.stalls.filter(s => getStatus(s) === 'low').length;
  const avg   = (state.stalls.reduce((s, x) => s + parseFloat(getWait(x)), 0) / state.stalls.length).toFixed(1);
  document.getElementById('totalPeople').textContent    = total;
  document.getElementById('lowQueues').textContent      = low;
  document.getElementById('avgWait').textContent        = avg + ' min';
  document.getElementById('tokensIssuedStat').textContent = state.tokensIssued;
}

// ─────────────────────────────────────────────
// 8. SUGGESTION BANNER
// ─────────────────────────────────────────────
function updateSuggestionBanner() {
  const highStalls = state.stalls.filter(s => getStatus(s) === 'high');
  const banner = document.getElementById('suggestionBanner');
  const textEl = document.getElementById('suggestionText');

  if (!highStalls.length) {
    banner.classList.add('hidden');
    return;
  }

  const worst = highStalls.reduce((a, b) => a.queueLength > b.queueLength ? a : b);
  const alt   = getBestAlternative(worst.id, worst.category);

  if (alt) {
    const altWait = getWait(alt);
    textEl.textContent =
      `${worst.name} is very crowded (${worst.queueLength} people). Try ${alt.name} instead — only ${altWait} min wait!`;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

// ─────────────────────────────────────────────
// 9. STALL CARDS
// ─────────────────────────────────────────────
function renderStalls() {
  const grid = document.getElementById('stallsGrid');
  grid.innerHTML = state.stalls.map(stall => {
    const status  = getStatus(stall);
    const wait    = getWait(stall);
    const pct     = Math.min(100, Math.round(stall.queueLength / stall.maxQueue * 100));
    const myToken = state.myTokens.find(t => t.stallId === stall.id);
    const joined  = !!myToken;

    return `
      <div class="stall-card ${status}${joined ? ' joined-card' : ''}" id="card-${stall.id}">
        <div class="stall-top-bar"></div>
        <div class="stall-body">
          <div class="stall-head">
            <div>
              <div class="stall-name">${stall.emoji} ${stall.name}</div>
              <div style="font-size:.7rem;color:var(--muted);margin-top:.1rem">📍 ${stall.location}</div>
            </div>
            <span class="status-badge">${status.toUpperCase()}</span>
          </div>

          <div class="stall-stats">
            <div class="stall-stat">
              <div class="stall-stat-num">${stall.queueLength}</div>
              <div class="stall-stat-lbl">In Queue</div>
            </div>
            <div class="stall-stat">
              <div class="stall-stat-num">${wait} min</div>
              <div class="stall-stat-lbl">Est. Wait</div>
            </div>
          </div>

          <div class="queue-bar-wrap">
            <div class="queue-bar-bg">
              <div class="queue-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="queue-bar-label">
              <span>0</span><span>${pct}% capacity</span><span>${stall.maxQueue}</span>
            </div>
          </div>

          <div class="stall-footer">
            ${joined && myToken.position <= 1 ? `
              <button class="btn-done" onclick="markDone('${stall.id}')">✅ Done</button>
            ` : `
              <button class="btn-join${joined ? ' joined-btn' : ''}"
                onclick="joinQueue('${stall.id}')"
                ${joined ? 'disabled' : ''}>
                ${joined ? `✓ Token #${myToken.tokenNum}` : '+ Join Queue'}
              </button>
            `}
            ${status === 'high' && !(joined && myToken.position <= 1) ? `
              <button class="btn-suggest" onclick="showSuggestion('${stall.id}')">💡 Better?</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// 10. COMPARISON BARS (RIGHT PANEL)
// ─────────────────────────────────────────────
function renderComparison() {
  const maxQ  = Math.max(...state.stalls.map(s => s.queueLength), 1);
  const el    = document.getElementById('comparisonBars');
  const sorted = [...state.stalls].sort((a, b) => a.queueLength - b.queueLength);

  el.innerHTML = sorted.map(stall => {
    const status = getStatus(stall);
    const color  = status === 'low' ? 'var(--green)' : status === 'medium' ? 'var(--yellow)' : 'var(--red)';
    const pct    = Math.round(stall.queueLength / maxQ * 100);
    return `
      <div class="comp-item">
        <div class="comp-head">
          <span class="comp-stall">${stall.emoji} ${stall.name}</span>
          <span class="comp-num">${stall.queueLength} · ${getWait(stall)} min</span>
        </div>
        <div class="comp-bar-bg">
          <div class="comp-bar-fill" style="width:${pct}%; background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// 11. MY TOKENS (RIGHT PANEL)
// ─────────────────────────────────────────────
function renderMyTokens() {
  const el = document.getElementById('myTokensList');
  document.getElementById('tokenCountBadge').textContent = state.myTokens.length;

  if (!state.myTokens.length) {
    el.innerHTML = `<div class="empty-state">No tokens yet.<br/>Join a queue to get started!</div>`;
    return;
  }

  el.innerHTML = state.myTokens.map(token => {
    const stall = state.stalls.find(s => s.id === token.stallId);
    if (!stall) return '';
    const ahead = Math.max(0, token.position - 1);
    const totalWas = token.position;
    const progress = Math.min(100, Math.round((1 - ahead / totalWas) * 100));
    const isUrgent = ahead <= 3 && ahead > 0;
    const isReady  = ahead === 0;

    let cls = '';
    if (isUrgent) cls = 'urgent-token';
    if (isReady)  cls = 'ready-token';

    // Countdown for ready tokens
    let countdownHtml = '';
    if (isReady && token.readyAt) {
      const COOLDOWN_MS = 5 * 60 * 1000;
      const elapsed = Date.now() - token.readyAt;
      const remaining = Math.max(0, COOLDOWN_MS - elapsed);
      const remainMin = Math.floor(remaining / 60000);
      const remainSec = Math.floor((remaining % 60000) / 1000);
      countdownHtml = `<div class="token-cooldown">⏱️ Auto-expires in ${remainMin}:${remainSec.toString().padStart(2, '0')}</div>`;
    }

    return `
      <div class="token-card ${cls}">
        <div class="token-hdr">
          <span class="token-stall">${stall.emoji} ${stall.name}</span>
          <span class="token-num">#${token.tokenNum}</span>
        </div>
        <div class="token-meta">
          ${isReady
            ? `✅ Proceed to counter now!`
            : `${ahead} ${ahead === 1 ? 'person' : 'people'} ahead · ${(ahead * stall.avgTime).toFixed(1)} min left`
          }
        </div>
        <div class="token-progress">
          <div class="token-prog-bar">
            <div class="token-prog-fill" style="width:${progress}%"></div>
          </div>
        </div>
        ${isReady  ? `<div class="token-ready-tag">🟢 PLEASE PROCEED TO COUNTER</div>` : ''}
        ${isUrgent && !isReady ? `<div class="token-urgent-tag">🔴 YOUR TURN IS COMING SOON</div>` : ''}
        ${isReady ? `
          ${countdownHtml}
          <button class="btn-done-token" onclick="markDone('${token.stallId}')">✅ I'm Done</button>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// 12. MAP VIEW
// ─────────────────────────────────────────────
const MAP_LAYOUT = [
  // [stallId | 'field' | null, label-override]
  ['food-a',     null],
  ['field',      null],
  ['beverage-b', null],
  ['field',      null],
  ['merch',      null],
  ['washroom-a', null],
  ['food-c',     null],
  ['washroom-b', null],
  ['beverage-a', null],
  ['food-b',     null],
];

function renderMap() {
  const container = document.getElementById('mapContainer');
  const cells = MAP_LAYOUT.map(([id]) => {
    if (id === 'field') {
      return `<div class="map-zone field">
                <div class="map-emoji">⚽</div>
                <div>Playing Field</div>
              </div>`;
    }
    const stall = state.stalls.find(s => s.id === id);
    if (!stall) return `<div class="map-zone"></div>`;
    const status = getStatus(stall);
    return `
      <div class="map-zone stall-${status}" title="${stall.name}: ${stall.queueLength} people"
           onclick="scrollToStall('${id}')">
        <div class="map-emoji">${stall.emoji}</div>
        <div style="font-size:.58rem;margin-top:.15rem">${stall.name.replace('Stall ', '').replace('Food ', 'S').substring(0,8)}</div>
        <div style="font-size:.6rem;margin-top:.1rem;font-weight:800">${stall.queueLength}p</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="map-grid">${cells}</div>
    <div class="map-legend">
      <div class="map-legend-item"><div class="legend-dot" style="background:var(--green)"></div> Low</div>
      <div class="map-legend-item"><div class="legend-dot" style="background:var(--yellow)"></div> Medium</div>
      <div class="map-legend-item"><div class="legend-dot" style="background:var(--red)"></div> High</div>
      <div style="flex:1;text-align:right;font-size:.68rem;color:var(--muted)">Click a zone to scroll to stall</div>
    </div>
  `;
}

function scrollToStall(id) {
  const card = document.getElementById(`card-${id}`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─────────────────────────────────────────────
// 13. JOIN QUEUE
// ─────────────────────────────────────────────
function joinQueue(stallId) {
  const stall = state.stalls.find(s => s.id === stallId);
  if (!stall || state.myTokens.find(t => t.stallId === stallId)) return;

  state.tokensIssued++;
  const tokenNum = 100 + state.tokensIssued;
  const position = stall.queueLength + 1;

  const token = { id: `${stallId}-${Date.now()}`, stallId, tokenNum, position, joinedAt: new Date() };
  state.myTokens.push(token);

  // bump queue
  stall.queueLength = Math.min(stall.queueLength + 1, stall.maxQueue);

  const status = getStatus(stall);
  const alt    = getBestAlternative(stallId, stall.category);

  // Populate modal
  document.getElementById('modalTitle').textContent    = `Joined: ${stall.name}`;
  document.getElementById('modalToken').textContent    = `#${tokenNum}`;
  document.getElementById('modalPosition').textContent = `${position}`;
  document.getElementById('modalWait').textContent     = `${getWait(stall)} min`;

  const suggEl = document.getElementById('modalSuggestion');
  if (status === 'high' && alt) {
    suggEl.textContent = `💡 Tip: This queue is crowded. ${alt.name} has only ${getWait(alt)} min wait!`;
    suggEl.classList.remove('hidden');
  } else {
    suggEl.classList.add('hidden');
  }

  document.getElementById('joinModal').classList.remove('hidden');

  addActivity('🎫', `Token #${tokenNum} issued for ${stall.name}`);
  showToast('🎫', 'Token Issued!', `You are #${position} in line at ${stall.name}. Estimated wait: ${getWait(stall)} min.`, 'success');

  renderAll();
}

function closeModal() {
  document.getElementById('joinModal').classList.add('hidden');
}

// ─────────────────────────────────────────────
// 13b. MARK DONE (remove token, restore Join Queue)
// ─────────────────────────────────────────────
function markDone(stallId) {
  const tokenIdx = state.myTokens.findIndex(t => t.stallId === stallId);
  if (tokenIdx === -1) return;
  const token = state.myTokens[tokenIdx];
  const stall = state.stalls.find(s => s.id === stallId);

  // Remove token
  state.myTokens.splice(tokenIdx, 1);

  // Decrement queue
  if (stall) stall.queueLength = Math.max(0, stall.queueLength - 1);

  addActivity('✅', `Token #${token.tokenNum} completed at ${stall ? stall.name : stallId}`);
  showToast('✅', 'Done!', `You've finished at ${stall ? stall.emoji + ' ' + stall.name : stallId}. Join another queue anytime!`, 'success');

  renderAll();
}

// Click outside modal to close
document.getElementById('joinModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ─────────────────────────────────────────────
// 14. SMART SUGGESTION (button on card)
// ─────────────────────────────────────────────
function showSuggestion(stallId) {
  const stall = state.stalls.find(s => s.id === stallId);
  if (!stall) return;
  const alt = getBestAlternative(stallId, stall.category);
  if (alt) {
    showToast('💡', 'Smart Suggestion', `${stall.name} is crowded. Try ${alt.emoji} ${alt.name} — only ${getWait(alt)} min wait at ${alt.location}!`, 'info', 6000);
    addActivity('💡', `Smart suggestion: try ${alt.name} instead of ${stall.name}`);
  } else {
    showToast('ℹ️', 'No Alternative Found', `${stall.name} is the only option in this category right now.`, 'info');
  }
}

// ─────────────────────────────────────────────
// 15. LIVE SIMULATION
// ─────────────────────────────────────────────
let simTick = 0;

function simulationStep() {
  simTick++;

  state.stalls.forEach(stall => {
    // Random fluctuation: -2 to +1 per tick
    const delta = Math.floor(Math.random() * 4) - 2;
    stall.queueLength = Math.max(0, Math.min(stall.maxQueue, stall.queueLength + delta));

    // Occasional spike
    if (Math.random() < 0.04) {
      stall.queueLength = Math.min(stall.maxQueue, stall.queueLength + Math.floor(Math.random() * 5) + 3);
      addActivity('📈', `Queue spike at ${stall.name}: now ${stall.queueLength} people`);
    }
    // Occasional drain
    if (Math.random() < 0.04 && stall.queueLength > 5) {
      stall.queueLength = Math.max(0, stall.queueLength - Math.floor(Math.random() * 6) - 2);
      addActivity('📉', `Queue cleared at ${stall.name}: now ${stall.queueLength} people`);
    }
  });

  // Advance MY tokens
  state.myTokens.forEach(token => {
    const stall = state.stalls.find(s => s.id === token.stallId);
    if (!stall) return;
    const prevAhead = Math.max(0, token.position - 1);

    // Decrement position over time
    if (token.position > 1) {
      const advance = Math.ceil(Math.random() * 2);
      token.position = Math.max(1, token.position - advance);
    }

    const ahead = Math.max(0, token.position - 1);

    // Fire notifications at thresholds
    if (prevAhead > 5 && ahead <= 5) {
      showToast('⏰', 'Getting Close!', `${stall.emoji} ${stall.name}: You're #${token.position} — about 5 left!`, 'warning');
      addActivity('⏰', `Token #${token.tokenNum}: 5 people remaining at ${stall.name}`);
    }
    if (prevAhead > 3 && ahead <= 3 && ahead > 0) {
      showToast('🔔', 'Almost Your Turn!', `${stall.emoji} ${stall.name}: Only ${ahead} people ahead of you!`, 'warning', 6000);
      addActivity('🔔', `Token #${token.tokenNum}: URGENT — ${ahead} ahead at ${stall.name}`);
    }
    if (prevAhead > 0 && ahead === 0) {
      showToast('🎉', 'Your Turn!', `${stall.emoji} ${stall.name}: Please proceed to the counter NOW! Click "Done" when finished.`, 'urgent', 8000);
      addActivity('🎉', `Token #${token.tokenNum}: PROCEED TO COUNTER — ${stall.name}`);
    }

    // Mark token as ready if at position 1 (handles all cases)
    if (ahead === 0 && !token.readyAt) {
      token.readyAt = Date.now();
    }
  });

  // Auto-expire tokens that have been ready for 5+ minutes (cooldown)
  const COOLDOWN_MS = 5 * 60 * 1000;
  state.myTokens = state.myTokens.filter(token => {
    if (token.readyAt && (Date.now() - token.readyAt) >= COOLDOWN_MS) {
      const stall = state.stalls.find(s => s.id === token.stallId);
      if (stall) stall.queueLength = Math.max(0, stall.queueLength - 1);
      addActivity('⏰', `Token #${token.tokenNum} expired (cooldown) at ${stall ? stall.name : token.stallId}`);
      showToast('⏰', 'Token Expired', `Your token #${token.tokenNum} at ${stall ? stall.emoji + ' ' + stall.name : ''} expired after 5 min. Rejoin anytime!`, 'warning', 6000);
      return false;
    }
    return true;
  });

  // Occasional general activity
  if (simTick % 6 === 0) {
    const randStall = state.stalls[Math.floor(Math.random() * state.stalls.length)];
    const msgs = [
      `Capacity check: ${randStall.name} at ${Math.round(randStall.queueLength / randStall.maxQueue * 100)}%`,
      `Staff update: ${randStall.name} is ${getStatus(randStall)} crowd`,
      `${randStall.name} wait time updated: ${getWait(randStall)} min`,
    ];
    addActivity('📡', msgs[Math.floor(Math.random() * msgs.length)]);
  }

  renderAll();
}

// ─────────────────────────────────────────────
// 16. RENDER ALL
// ─────────────────────────────────────────────
function renderAll() {
  renderStalls();
  renderComparison();
  renderMyTokens();
  renderMap();
  updateStats();
  updateSuggestionBanner();
}

// ─────────────────────────────────────────────
// 17. BOOT
// ─────────────────────────────────────────────
renderAll();
addActivity('🏟️', 'SmartQ Stadium system initialized');
addActivity('🟢', 'Live queue monitoring active — all stalls online');
showToast('🏟️', 'Welcome to SmartQ!', 'Live queue data is now streaming. Join a queue to get your token.', 'success', 5000);

// Run simulation every 3 seconds
setInterval(simulationStep, 3000);
