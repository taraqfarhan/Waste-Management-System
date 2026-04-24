/* ═══════════════════════════════════════════════════════
   stations.js — Dynamic station rendering & live timers
   ═══════════════════════════════════════════════════════

   DATA SOURCE: /data/stations.json
   To add a station: add an object to the "stations" array.
   To edit a station: change its values in stations.json.
   No changes to this file are needed.
*/

/* ─── Load & Render ─────────────────────────────────── */

async function loadStations() {
  const res = await fetch('data/stations.json');
  if (!res.ok) throw new Error('Could not load stations.json');
  const { stations } = await res.json();
  return stations;
}

function renderCards(stations) {
  const grid = document.getElementById('stationsGrid');
  grid.innerHTML = '';

  stations.forEach((st, i) => {
    const card = document.createElement('div');
    card.className = 'sts-card';
    card.setAttribute('aria-label', `Open details for ${st.name}`);
    card.onclick = () => openModal(i);

    card.innerHTML = `
      <div class="sts-card-img-wrap">
        <img
          class="sts-card-img"
          src="${st.image}"
          alt="${st.name}"
          onerror="this.parentElement.innerHTML='<div class=\\'sts-card-img-placeholder\\'>🏭</div>'"
        >
      </div>
      <div class="sts-card-body">
        <div class="sts-card-name">${st.name}</div>
        <div class="sts-card-loc">📍 ${st.location}</div>
        <div class="sts-card-badge">Clearance: ${st.clearance_time}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderModals(stations) {
  const container = document.getElementById('modalsContainer');
  container.innerHTML = '';

  stations.forEach((st, i) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = `overlay-${i}`;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(i); };

    overlay.innerHTML = `
      <div class="popup" role="dialog" aria-modal="true" aria-label="${st.name}">
        <button class="close-btn" onclick="closeModal(${i})" aria-label="Close">✕</button>

        <img
          class="popup-img"
          src="/${st.image}"
          alt="${st.name}"
          onerror="this.style.display='none'"
        >

        <div class="popup-body">
          <div class="popup-name">${st.name}</div>
          <div class="popup-meta">📍 ${st.location}</div>
          <div class="popup-meta">🏷 ${st.ward || ''}  &nbsp;|&nbsp;  ⚖️ Capacity: ${st.capacity_tons || '–'} tons/day</div>
          <div class="popup-divider"></div>

          <div class="fill-wrap">
            <div class="fill-lbl">
              <span>Fill Level</span>
              <span id="pct-${i}">–</span>
            </div>
            <div class="fill-track">
              <div class="fill-fill" id="bar-${i}" style="width:0%"></div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Clearance Time</span>
              <span class="info-val" id="ft-${i}">${st.clearance_time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Time</span>
              <span class="info-val" id="ct-${i}">–</span>
            </div>
            <div class="info-row">
              <span class="info-label">Next Clearance In</span>
              <span class="info-val" id="nc-${i}">–</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-val" id="st-${i}">–</span>
            </div>
          </div>

          <button class="contact-btn" onclick="window.location='tel:${st.contact}'">
            📞 Contact Station
          </button>
        </div>
      </div>
    `;
    container.appendChild(overlay);
  });
}

/* ─── Modal Controls ────────────────────────────────── */

function openModal(i) {
  document.getElementById(`overlay-${i}`).classList.add('open');
}
function closeModal(i) {
  document.getElementById(`overlay-${i}`).classList.remove('open');
}

/* ─── Live Time & Status ────────────────────────────── */

/**
 * Parse "12:00 pm" or "01:30 am" into a Date object for today.
 */
function parseClearanceTime(timeStr) {
  const clean = timeStr.trim().toLowerCase();
  const [time, period] = clean.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'pm' && h !== 12) h += 12;
  if (period === 'am' && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d;
}

function formatTime(date) {
  let h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ap}`;
}

function msToHMS(ms) {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

function tickAll(stations) {
  const now = new Date();

  stations.forEach((st, i) => {
    const ctEl  = document.getElementById(`ct-${i}`);
    const ncEl  = document.getElementById(`nc-${i}`);
    const stEl  = document.getElementById(`st-${i}`);
    const barEl = document.getElementById(`bar-${i}`);
    const pctEl = document.getElementById(`pct-${i}`);
    if (!ctEl) return;   // modal not rendered yet

    // Current time
    ctEl.textContent = formatTime(now);

    // Clearance countdown
    let clrDate = parseClearanceTime(st.clearance_time);
    if (clrDate < now) clrDate.setDate(clrDate.getDate() + 1);  // next occurrence
    const diff = clrDate - now;
    ncEl.textContent = msToHMS(diff);

    // Fill level: 0% just after clearance → 100% just before next clearance
    const total = 24 * 3600000;
    const elapsed = total - diff;
    const fp = Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);

    pctEl.textContent = fp + '%';
    barEl.style.width = fp + '%';
    barEl.className = 'fill-fill' + (fp > 75 ? ' fill-high' : fp > 45 ? ' fill-mid' : '');

    const label = fp > 75 ? 'High — Needs Clearance' : fp > 45 ? 'Moderate' : 'Low — Recently Cleared';
    const cls   = fp > 75 ? 's-hi' : fp > 45 ? 's-mi' : 's-lo';
    stEl.innerHTML = `<span class="status-badge ${cls}">${fp}% — ${label}</span>`;
  });
}

/* ─── Init ──────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const stations = await loadStations();
    renderCards(stations);
    renderModals(stations);
    tickAll(stations);
    setInterval(() => tickAll(stations), 1000);
  } catch (err) {
    console.error('Failed to load stations:', err);
    document.getElementById('stationsGrid').innerHTML =
      '<p style="color:rgba(255,100,100,0.8);padding:20px">⚠ Could not load station data. Make sure stations.json is in the data/ folder.</p>';
  }
});
