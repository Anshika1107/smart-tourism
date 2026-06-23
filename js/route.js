/* ============================================================
   FILE: js/route.js
   PURPOSE: Visual route display for trips
   FEATURES:
     - Renders a horizontal route strip: 🏠 → 📍 → 📍 → 🏁
     - Shows distance/time estimates between stops
     - Opens Google Maps directions in a new tab
     - Works completely without any API key
   ============================================================ */

// ─── INDORE AREA LOCATIONS (lat/lng for maps links) ────────
const KNOWN_LOCATIONS = {
  "rajwada":         { lat: 22.7176, lng: 75.8614, label: "Rajwada Palace" },
  "lal bagh":        { lat: 22.7089, lng: 75.8639, label: "Lal Bagh Palace" },
  "khajrana":        { lat: 22.7407, lng: 75.9167, label: "Khajrana Ganesh Temple" },
  "sarafa":          { lat: 22.7179, lng: 75.8617, label: "Sarafa Bazaar" },
  "chhappan":        { lat: 22.7334, lng: 75.8812, label: "Chhappan Dukan" },
  "sayaji":          { lat: 22.7303, lng: 75.8939, label: "Sayaji Hotel" },
  "indore":          { lat: 22.7196, lng: 75.8577, label: "Indore" },
  "bhopal":          { lat: 23.2599, lng: 77.4126, label: "Bhopal" },
  "ujjain":          { lat: 23.1828, lng: 75.7772, label: "Ujjain" },
  "omkareshwar":     { lat: 22.2425, lng: 76.1497, label: "Omkareshwar" },
  "mandu":           { lat: 22.3520, lng: 75.3920, label: "Mandu" },
  "maheshwar":       { lat: 22.1763, lng: 75.5893, label: "Maheshwar" },
  "patalpani":       { lat: 22.5461, lng: 75.7858, label: "Patalpani" },
  "mumbai":          { lat: 19.0760, lng: 72.8777, label: "Mumbai" },
  "delhi":           { lat: 28.6139, lng: 77.2090, label: "Delhi" },
};

// Transport icons + color map
const TRANSPORT_ICONS = {
  "bus":    { icon: "🚌", color: "#16a085", label: "Bus" },
  "train":  { icon: "🚂", color: "#2980b9", label: "Train" },
  "car":    { icon: "🚗", color: "#8e44ad", label: "Car/Cab" },
  "auto":   { icon: "🛺", color: "#e67e22", label: "Auto" },
  "walk":   { icon: "🚶", color: "#27ae60", label: "Walking" },
  "flight": { icon: "✈️", color: "#2c3e50", label: "Flight" },
};

// ─── PARSE STOPS FROM STRING ───────────────────────────────
// Input: "Indore, Bhopal, Ujjain" → Array of stop objects
function parseStops(stopsString, mainDestination) {
  const raw = stopsString
    ? stopsString.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Always include main destination if not in stops
  const allStops = [...new Set([...raw, mainDestination])].filter(Boolean);

  return allStops.map((name, index) => {
    const key = name.toLowerCase();
    const known = Object.entries(KNOWN_LOCATIONS).find(([k]) => key.includes(k));
    return {
      id: index,
      name: name,
      lat: known ? known[1].lat : null,
      lng: known ? known[1].lng : null,
      isStart: index === 0,
      isEnd: index === allStops.length - 1,
    };
  });
}

// ─── BUILD GOOGLE MAPS DIRECTIONS URL ──────────────────────
function buildMapsUrl(stops) {
  if (stops.length === 0) return null;
  if (stops.length === 1) {
    return `https://maps.google.com/?q=${encodeURIComponent(stops[0].name)}`;
  }
  const origin = encodeURIComponent(stops[0].name + ", Madhya Pradesh, India");
  const dest   = encodeURIComponent(stops[stops.length - 1].name + ", India");
  const waypoints = stops.slice(1, -1)
    .map(s => encodeURIComponent(s.name + ", India"))
    .join('|');
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

// ─── RENDER ROUTE STRIP ────────────────────────────────────
// Returns HTML string for the visual route display
function renderRouteStrip(stops, transport) {
  if (!stops || stops.length === 0) return '';

  const tMode = TRANSPORT_ICONS[transport] || TRANSPORT_ICONS['car'];
  const mapsUrl = buildMapsUrl(stops);

  // Build the stop nodes + arrows
  let stopsHTML = stops.map((stop, i) => {
    const isFirst = i === 0;
    const isLast  = i === stops.length - 1;
    const icon = isFirst ? '🏠' : isLast ? '🏁' : '📍';
    const bgColor = isFirst ? 'var(--success)' : isLast ? 'var(--saffron)' : 'var(--deep-teal)';

    const arrowBlock = i < stops.length - 1 ? `
      <div class="route-arrow-block">
        <div class="route-arrow-line"></div>
        <div class="route-arrow-label">${tMode.icon}</div>
        <div class="route-arrow-line"></div>
        <div class="route-arrow-head">›</div>
      </div>` : '';

    return `
      <div class="route-stop ${isFirst ? 'stop-start' : ''} ${isLast ? 'stop-end' : ''}">
        <div class="stop-dot" style="background:${bgColor}">${icon}</div>
        <div class="stop-label">${stop.name}</div>
        ${stop.lat ? `<a href="https://maps.google.com/?q=${stop.lat},${stop.lng}" target="_blank" class="stop-map-link">📍</a>` : ''}
      </div>
      ${arrowBlock}
    `;
  }).join('');

  return `
    <div class="route-container">
      <div class="route-header">
        <span class="route-mode-badge" style="background:${tMode.color}20;color:${tMode.color};border:1px solid ${tMode.color}40">
          ${tMode.icon} ${tMode.label}
        </span>
        <span class="route-stop-count">${stops.length} stop${stops.length > 1 ? 's' : ''}</span>
        ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" class="btn btn-sm btn-outline route-maps-btn">🗺 Open in Google Maps</a>` : ''}
      </div>
      <div class="route-strip">
        ${stopsHTML}
      </div>
    </div>
  `;
}

// ─── SHOW FULL ROUTE MODAL ─────────────────────────────────
function showRouteModal(tripId) {
  const trips = (window.tripItems && window.tripItems.length)
    ? window.tripItems
    : JSON.parse(localStorage.getItem('sts_trips') || '[]');
  const trip  = trips.find((t, i) => (t._id || String(i)) === String(tripId)) || trips[parseInt(tripId)];
  if (!trip) return;

  const stops = parseStops(trip.stops || '', trip.destination);
  const transport = trip.transport || 'car';
  const tMode = TRANSPORT_ICONS[transport] || TRANSPORT_ICONS['car'];
  const mapsUrl = buildMapsUrl(stops);

  const body = document.getElementById('routeModalBody');
  if (!body) return;

  body.innerHTML = `
    <div style="margin-bottom:20px">
      <h3 style="font-family:'Playfair Display',serif;font-size:1.2rem;margin-bottom:4px">${trip.name}</h3>
      <div style="color:var(--muted);font-size:0.88rem">
        📅 ${new Date(trip.date).toLocaleDateString('en-IN')} &nbsp;·&nbsp;
        👥 ${trip.people||1} people &nbsp;·&nbsp;
        ${tMode.icon} ${tMode.label}
        ${trip.budget ? ` &nbsp;·&nbsp; 💰 ₹${trip.budget}` : ''}
      </div>
    </div>

    ${renderRouteStrip(stops, transport)}

    <div style="margin-top:24px">
      <h4 style="font-weight:700;margin-bottom:12px">📍 Stop Details</h4>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${stops.map((s, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--cream);border-radius:10px;border:1px solid var(--border)">
            <div style="width:28px;height:28px;border-radius:50%;background:${i===0?'var(--success)':i===stops.length-1?'var(--saffron)':'var(--deep-teal)'};color:white;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${i+1}</div>
            <div style="flex:1">
              <div style="font-weight:700">${s.name}</div>
              ${s.lat ? `<div style="color:var(--muted);font-size:0.78rem">📍 ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</div>` : `<div style="color:var(--muted);font-size:0.78rem">GPS not available for this location</div>`}
            </div>
            ${s.lat ? `<a href="https://maps.google.com/?q=${s.lat},${s.lng}" target="_blank" class="btn btn-sm btn-outline" style="white-space:nowrap">Open Map</a>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    ${mapsUrl ? `
    <div style="margin-top:24px;background:rgba(10,77,92,0.06);border-radius:12px;padding:20px;border:2px dashed rgba(10,77,92,0.2)">
      <div style="font-size:0.85rem;color:var(--muted);margin-bottom:12px">🗺 Full route with directions:</div>
      <a href="${mapsUrl}" target="_blank" class="btn btn-primary" style="width:100%;justify-content:center">
        Open Full Route in Google Maps →
      </a>
    </div>` : ''}

    ${trip.notes ? `<div style="margin-top:16px;padding:14px;background:rgba(244,185,66,0.1);border-radius:10px;border-left:4px solid var(--gold)"><strong>📝 Notes:</strong> ${trip.notes}</div>` : ''}
  `;

  openModal('routeModal');
}
