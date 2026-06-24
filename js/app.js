// ===== SMART TOURISM INDORE - API CONNECTOR =====
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : '/api';
const getToken = () => localStorage.getItem('sts_token');
const setToken = (t) => localStorage.setItem('sts_token', t);
const setUser  = (u) => localStorage.setItem('sts_user', JSON.stringify(u));
const getUser  = () => JSON.parse(localStorage.getItem('sts_user') || 'null');
const clearAuth = () => { localStorage.removeItem('sts_token'); localStorage.removeItem('sts_user'); };

// ─── ROUTE PROTECTION ─────────────────────────────────────────
(function() {
  const path = window.location.pathname;
  const isLoginPage = path.includes('login.html') || path.includes('google-login.html') || path.includes('facebook-login.html');
  const token = getToken();
  const user = getUser();
  
  if (!isLoginPage) {
    if (!token || !user) {
      const loginUrl = path.includes('/pages/') ? 'login.html' : 'pages/login.html';
      window.location.href = loginUrl;
    }
  }
})();

async function apiCall(endpoint, method = 'GET', body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) { const token = getToken(); if (token) headers['Authorization'] = `Bearer ${token}`; }
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Error');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') { console.warn('Backend not running. Using offline mode.'); return null; }
    throw err;
  }
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: '🔔' };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]||'🔔'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); });

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
  const btn = e.target.querySelector('[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }
  try {
    let data = await apiCall('/auth/login', 'POST', { email, password });
    
    // Offline Simulation fallback for development
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!data && isLocal) {
      if (email === 'admin@smarttourism.in' && password === 'admin123') {
        data = {
          success: true,
          message: 'Offline Admin login successful! (Simulation)',
          token: 'offline-admin-token',
          user: { name: 'Admin User', email: 'admin@smarttourism.in', role: 'admin' }
        };
      } else if (password === 'password123') {
        data = {
          success: true,
          message: 'Offline Tourist login successful! (Simulation)',
          token: 'offline-tourist-token',
          user: { name: 'Demo Tourist', email: email, role: 'tourist' }
        };
      } else {
        throw new Error('Invalid email or password (Offline simulation). Try password123 or admin123.');
      }
    }

    if (data && data.success) { 
      setToken(data.token); 
      setUser(data.user); 
      showToast(data.message, 'success'); 
      setTimeout(() => { 
        const user = getUser();
        if (user && user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1200);
    } else {
      throw new Error('Server not responding. Please try again.');
    }
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Login'; }
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName')?.value;
  const email = document.getElementById('signupEmail')?.value;
  const password = document.getElementById('signupPassword')?.value;
  const confirm = document.getElementById('signupConfirm')?.value;
  const phone = document.getElementById('signupPhone')?.value;
  if (!name || !email || !password || !confirm) { showToast('Please fill in all fields', 'error'); return; }
  if (password !== confirm) { showToast('Passwords do not match!', 'error'); return; }
  if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
  const btn = e.target.querySelector('[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
  try {
    let data = await apiCall('/auth/signup', 'POST', { name, email, password, phone });
    
    // Offline Simulation fallback for development
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!data && isLocal) {
      data = {
        success: true,
        message: 'Offline registration successful! (Simulation)',
        token: 'offline-tourist-token',
        user: { name, email, role: 'tourist' }
      };
    }

    if (data && data.success) { 
      setToken(data.token); 
      setUser(data.user); 
      showToast(data.message, 'success'); 
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);
    } else {
      throw new Error('Server not responding. Please try again.');
    }
  } catch (err) {
    showToast(err.message || 'Signup failed', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '✨ Create Account'; }
  }
}

// Global OAuth Message Listener
window.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'OAUTH_CALLBACK') {
    const { provider, email, password } = event.data;
    await completeOAuthLogin(provider, email, password);
  }
});

function openOAuthPopup(url, title) {
  const w = 500;
  const h = 600;
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);
  return window.open(url, title, `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`);
}

function handleGoogleLogin() {
  showToast('Connecting to Google...', 'info');
  openOAuthPopup('google-login.html', 'Google Sign-In');
}

function handleFacebookLogin() {
  showToast('Connecting to Facebook...', 'info');
  openOAuthPopup('facebook-login.html', 'Facebook Log-In');
}

async function completeOAuthLogin(provider, email, password) {
  if (!email || !password) {
    showToast('Email and password are required', 'error');
    return;
  }
  const name = email.split('@')[0];
  const profile = {
    email: email,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    picture: provider === 'google' ? '🧭' : '📸'
  };

  try {
    const endpoint = provider === 'google' ? '/auth/google' : '/auth/facebook';
    const payload = provider === 'google' 
      ? { credential: 'google-btn-' + Date.now(), profile, password } 
      : { accessToken: 'facebook-btn-' + Date.now(), profile, password };

    const data = await apiCall(endpoint, 'POST', payload);
    
    if (data && data.success) {
      setToken(data.token);
      setUser(data.user);
      showToast(data.message, 'success');
      setTimeout(() => {
        const user = getUser();
        if (user && user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1200);
    } else {
      throw new Error(data?.message || `${provider} verification failed.`);
    }
  } catch (err) {
    showToast(err.message || `${provider} Login failed`, 'error');
  }
}

function loadUserInfo() {
  const user = getUser();
  const nameEl = document.querySelector('.sidebar-user .info .name');
  const roleEl = document.querySelector('.sidebar-user .info .role');
  const avatarEl = document.querySelector('.sidebar-user .avatar');
  if (user) {
    if (nameEl) nameEl.textContent = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Traveler';
    if (roleEl) roleEl.textContent = user.role === 'admin' ? '🛠 Admin' : '🗺 Tourist';
    if (avatarEl) avatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : '👤';
  }
}

function logout() {
  clearAuth();
  showToast('Logged out successfully', 'info');
  const isPagesFolder = window.location.pathname.includes('/pages/');
  const target = isPagesFolder ? '../index.html' : 'index.html';
  setTimeout(() => { window.location.href = target; }, 1000);
}

window.logout = logout;

function updateNavbar() {
  const user = getUser();
  const token = getToken();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const isPagesFolder = window.location.pathname.includes('/pages/');
  const prefix = isPagesFolder ? '' : 'pages/';

  if (user && token) {
    navActions.innerHTML = `
      <a href="${prefix}sos.html" class="btn btn-danger btn-sm">🚨 SOS</a>
      <a href="${prefix}dashboard.html" class="btn btn-outline btn-sm">Dashboard</a>
      <button onclick="logout()" class="btn btn-primary btn-sm" style="background:var(--saffron); border:none; color:white; font-weight:600; cursor:pointer;">Logout</button>
    `;
  } else {
    navActions.innerHTML = `
      <a href="${prefix}login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="${prefix}login.html#signup" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }
}

async function handleForgotPassword(e) {
  if (e) e.preventDefault();
  
  const { value: email } = await Swal.fire({
    title: 'Forgot Password',
    input: 'email',
    inputLabel: 'Enter your registered email address',
    inputPlaceholder: 'you@example.com',
    confirmButtonColor: '#0A4D5C',
    confirmButtonText: 'Verify Email',
    showCancelButton: true,
    cancelButtonColor: '#d33'
  });

  if (!email) return;

  Swal.showLoading();

  try {
    // Call forgot-password verify API
    let res = await apiCall('/auth/forgot-password', 'POST', { email });
    
    // Offline simulation logic
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!res && isLocal) {
      if (email === 'admin@smarttourism.in' || email === 'rahul@example.com' || email === 'dheeraj222@gmail.com') {
        res = { success: true, message: 'Account verified (Simulation).' };
      } else {
        throw new Error('Email not registered in offline simulation database. Try rahul@example.com or admin@smarttourism.in.');
      }
    }

    if (res && res.success) {
      Swal.close();
      const { value: newPassword } = await Swal.fire({
        title: 'Reset Password',
        input: 'password',
        inputLabel: `Enter new password for ${email}`,
        inputPlaceholder: 'At least 6 characters',
        confirmButtonColor: '#0A4D5C',
        confirmButtonText: 'Update Password',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        inputAttributes: {
          minlength: 6,
          autocapitalize: 'off',
          autocorrect: 'off'
        }
      });

      if (!newPassword) return;

      Swal.showLoading();
      
      let updateRes = await apiCall('/auth/reset-password', 'POST', { email, newPassword });
      
      if (!updateRes && isLocal) {
        updateRes = { success: true, message: 'Password updated successfully (Simulation).' };
      }

      if (updateRes && updateRes.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: updateRes.message,
          confirmButtonColor: '#0A4D5C'
        });
      } else {
        throw new Error(updateRes?.message || 'Failed to update password');
      }
    } else {
      throw new Error(res?.message || 'Failed to verify email');
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Verification failed',
      confirmButtonColor: '#0A4D5C'
    });
  }
}

window.handleForgotPassword = handleForgotPassword;

window.tripItems = [];

async function loadTrips() {
  const data = await apiCall('/trips', 'GET', null, true);
  window.tripItems = data ? data.trips : JSON.parse(localStorage.getItem('sts_trips') || '[]');
  renderTrips();
  const statEl = document.getElementById('statTrips');
  if (statEl) statEl.textContent = window.tripItems.length;
}

function renderTrips() {
  const container = document.getElementById('tripsContainer');
  if (!container) return;
  if (!window.tripItems.length) {
    container.innerHTML = `<div class="text-center" style="padding:48px;color:var(--muted)"><div style="font-size:48px;margin-bottom:12px">📋</div><p>No trips planned yet. Click "Create New Trip" to start!</p></div>`;
    return;
  }
  container.innerHTML = window.tripItems.map((t, i) => `
    <div class="card" style="margin-bottom:16px">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <h3>${t.name}</h3>
          <div style="display:flex;gap:8px">
            <span class="tag tag-saffron">${t.status||'planned'}</span>
            <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" onclick="deleteTrip('${t._id||i}',${!t._id})">🗑</button>
          </div>
        </div>
        <div class="flex gap-2 mt-2" style="flex-wrap:wrap">
          <span class="tag tag-teal">📅 ${t.date ? new Date(t.date).toLocaleDateString('en-IN') : t.date}</span>
          <span class="tag tag-saffron">📍 ${t.destination}</span>
          <span class="tag tag-gold">👥 ${t.people||1} people</span>
          ${t.budget ? `<span class="tag tag-teal">💰 ₹${t.budget}</span>` : ''}
        </div>
        ${t.notes ? `<p style="margin-top:10px;color:var(--muted);font-size:0.88rem">${t.notes}</p>` : ''}
      </div>
    </div>`).join('');
}

async function addTrip(e) {
  e.preventDefault();
  const name = document.getElementById('tripName')?.value;
  const date = document.getElementById('tripDate')?.value;
  const destination = document.getElementById('tripDest')?.value;
  const people = document.getElementById('tripPeople')?.value || 1;
  const budget = document.getElementById('tripBudget')?.value || 0;
  const notes = document.getElementById('tripNotes')?.value || '';
  const stops = document.getElementById('tripStops')?.value || '';
  const transport = document.getElementById('tripTransport')?.value || 'car';
  const status = document.getElementById('tripStatus')?.value || 'planned';

  if (!name || !date || !destination) { showToast('Please fill required fields', 'error'); return; }
  const btn = e.target.querySelector('[type=submit]');
  const origBtnText = btn ? btn.innerHTML : '💾 Save Trip';
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  try {
    const payload = { name, date, destination, people: parseInt(people), budget: parseFloat(budget) || 0, notes, stops, transport, status };
    const data = await apiCall('/trips', 'POST', payload, true);
    if (data && data.trip) { 
      window.tripItems.push(data.trip); 
    } else { 
      const saved = JSON.parse(localStorage.getItem('sts_trips') || '[]'); 
      saved.push(payload); 
      localStorage.setItem('sts_trips', JSON.stringify(saved)); 
      window.tripItems = saved; 
    }
    showToast('Trip saved! 🗺️', 'success');
    closeModal('tripModal'); 
    if (typeof renderTrips === 'function') {
      renderTrips();
    }
    e.target.reset();
  } catch (err) { 
    showToast(err.message || 'Failed to save trip', 'error'); 
  } finally { 
    if (btn) { btn.disabled = false; btn.innerHTML = origBtnText; } 
  }
}

async function deleteTrip(id, isIndex) {
  try {
    if (!isIndex) { await apiCall(`/trips/${id}`, 'DELETE', null, true); window.tripItems = window.tripItems.filter(t => t._id !== id); }
    else { const saved = JSON.parse(localStorage.getItem('sts_trips') || '[]'); saved.splice(parseInt(id), 1); localStorage.setItem('sts_trips', JSON.stringify(saved)); window.tripItems = saved; }
    showToast('Trip removed', 'info'); renderTrips();
  } catch (err) { showToast(err.message || 'Failed to delete', 'error'); }
}

async function loadListings(category, search) {
  const container = document.getElementById('listingsGrid');
  if (!container) return;
  
  const cat = category || 'all';
  const q = search || '';
  
  let url = `/listings?limit=20`;
  if (cat !== 'all') url += `&category=${cat}`;
  if (q) url += `&search=${encodeURIComponent(q)}`;
  
  const data = await apiCall(url);
  
  if (!data) {
    // Offline local filtering fallback
    const cards = container.querySelectorAll('.listing-card');
    if (cards.length > 0) {
      cards.forEach(card => {
        const catMatch = (cat === 'all' || card.dataset.category === cat);
        const text = card.textContent.toLowerCase();
        const searchMatch = (!q || text.includes(q.toLowerCase()));
        card.style.display = (catMatch && searchMatch) ? 'block' : 'none';
      });
    }
    return;
  }
  
  container.innerHTML = data.listings.map(l => {
    const isHotel = l.category === 'hotel';
    const price = parseInt(l.price_range?.replace(/[^0-9]/g, '')) || (isHotel ? 3000 : 0);
    
    // Map button action (focusing Leaflet map if coordinates are available)
    const hasCoords = (l.lat && l.lng);
    const mapAction = hasCoords
      ? `onclick="focusPlace([${l.lat}, ${l.lng}], '${l.name.replace(/'/g, "\\'")}')"`
      : `onclick="showToast('Map coordinates unavailable','info')"`;

    // Booking/itinerary action
    const primaryBtn = isHotel
      ? `<button class="btn btn-primary btn-sm" onclick="bookHotel('${l.name.replace(/'/g, "\\'")}', ${price})">Book Now</button>`
      : `<button class="btn btn-primary btn-sm" onclick="showToast('Added to itinerary!','success')">Add to Trip</button>`;

    return `
      <div class="card listing-card" data-category="${l.category}">
        <div class="card-img" style="background:linear-gradient(135deg,var(--deep-teal),var(--saffron));font-size:48px">${l.emoji||'🏢'}</div>
        <div class="card-body">
          <div class="flex items-center justify-between mb-1">
            <h3>${l.name}</h3>
            <span class="tag tag-teal">${l.category}</span>
          </div>
          <div class="rating mb-1">⭐ ${l.rating || '4.0'} <span style="color:var(--muted);font-weight:400">(${l.review_count || l.reviewCount || 0} reviews)</span></div>
          <p>${l.description}</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0">
            ${(l.price_range || l.priceRange) ? `<span class="tag tag-gold">${l.price_range || l.priceRange}</span>` : ''}
            ${(l.opening_hours || l.openingHours) ? `<span class="tag tag-teal">${l.opening_hours || l.openingHours}</span>` : ''}
          </div>
          <div style="font-size:0.82rem;color:var(--muted);margin-bottom:12px">📍 ${l.address}</div>
          <div style="display:flex;gap:8px">
            ${primaryBtn}
            <button class="btn btn-outline btn-sm" ${mapAction}>📍 Map</button>
          </div>
        </div>
      </div>`;
  }).join('') || '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:48px">No listings found</p>';
}

function filterListings(category) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }
  const search = document.getElementById('listingSearch')?.value || '';
  loadListings(category, search);
}

function searchListings() {
  const q = document.getElementById('listingSearch')?.value || '';
  const activeChip = document.querySelector('.filter-chip.active');
  let category = 'all';
  if (activeChip) {
    const text = activeChip.textContent.toLowerCase();
    if (text.includes('hotel')) category = 'hotel';
    else if (text.includes('restaurant')) category = 'restaurant';
    else if (text.includes('attraction')) category = 'attraction';
    else if (text.includes('shop')) category = 'shop';
    else if (text.includes('transport')) category = 'transport';
  }
  loadListings(category, q);
}

async function loadLostItems() {
  const container = document.getElementById('lostItemsGrid');
  if (!container) return;
  const data = await apiCall('/lost-found?type=lost');
  if (data) renderLFItems(container, data.items);
  else {
    const items = JSON.parse(localStorage.getItem('sts_lost') || '[]');
    renderLFItems(container, items.map(i => ({...i, itemName: i.item||i.itemName})));
  }
}

async function loadFoundItems() {
  const container = document.getElementById('foundItemsGrid');
  if (!container) return;
  const data = await apiCall('/lost-found?type=found');
  if (data) renderLFItems(container, data.items);
  else {
    const items = JSON.parse(localStorage.getItem('sts_found') || '[]');
    renderLFItems(container, items.map(i => ({...i, itemName: i.item||i.itemName})));
  }
}

function renderLFItems(container, items) {
  if (!items || !items.length) { container.innerHTML = '<p style="color:var(--muted);padding:32px;text-align:center;grid-column:1/-1">No items reported yet</p>'; return; }
  container.innerHTML = items.map(it => {
    const name = it.itemName || it.item_name || it.item || 'Unknown Item';
    const cName = it.contactName || it.contact_name || '';
    const cPhone = it.contactPhone || it.contact_phone || it.contact || '';
    return `
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between mb-2">
          <h3>${it.type==='lost'?'🎒':'📦'} ${name}</h3>
          <span class="status-badge ${it.status==='resolved'?'status-found':'status-open'}">${it.status==='resolved'?'✅ Resolved':'🔍 Open'}</span>
        </div>
        ${it.description?`<p style="color:var(--muted);font-size:0.88rem;margin-bottom:10px">${it.description}</p>`:''}
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <span class="tag tag-teal">📍 ${it.location}</span>
          <span class="tag tag-gold">📅 ${it.date?new Date(it.date).toLocaleDateString('en-IN'):''}</span>
        </div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:0.85rem;color:var(--muted)">
          📞 ${cName ? cName + ': ' : ''}${cPhone}
        </div>
      </div>
    </div>`;
  }).join('');
}

async function submitLostItem(e) {
  e.preventDefault();
  const type = document.getElementById('lfType')?.value;
  const itemName = document.getElementById('lfItemName')?.value;
  const location = document.getElementById('lfLocation')?.value;
  const date = document.getElementById('lfDate')?.value;
  const contactPhone = document.getElementById('lfContact')?.value;
  const description = document.getElementById('lfDesc')?.value;
  if (!type || !itemName || !location || !date || !contactPhone) { showToast('Please fill required fields', 'error'); return; }
  const btn = e.target.querySelector('[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }
  try {
    const data = await apiCall('/lost-found', 'POST', { type, itemName, location, date, contactPhone, description });
    showToast(data ? data.message : `${type==='lost'?'Lost':'Found'} item reported! (Offline mode)`, 'success');
    if (!data) { const arr = JSON.parse(localStorage.getItem(`sts_${type}`) || '[]'); arr.push({ id: Date.now(), item: itemName, location, date, contactPhone, description, status: 'open' }); localStorage.setItem(`sts_${type}`, JSON.stringify(arr)); }
    closeModal('lfModal'); e.target.reset(); loadLostItems(); loadFoundItems();
  } catch (err) { showToast(err.message || 'Submission failed', 'error'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = '📤 Submit Report'; } }
}

let sosTriggered = false;
async function triggerSOS() {
  if (sosTriggered) return;
  sosTriggered = true;
  const btn = document.getElementById('sosBtn');
  if (btn) btn.innerHTML = `<span class="sos-icon">📡</span><span>SENDING...</span>`;
  showToast('🚨 Getting your location...', 'error');
  let locationData = { address: 'Indore, Madhya Pradesh' };
  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
    locationData = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` };
  } catch(err) { console.log('GPS unavailable'); }
  try {
    const user = getUser();
    const data = await apiCall('/sos', 'POST', { location: locationData, alertType: 'general', userName: user?.name||'Tourist', userPhone: user?.phone||'Unknown' });
    showToast(data ? '🚨 SOS Alert sent! Help is on the way.' : '🚨 SOS sent! Please also call 100 directly.', 'error');
    showToast(`📍 Location: ${locationData.address}`, 'info');
  } catch (err) { showToast('🚨 Call 100 (Police) or 108 (Ambulance) directly!', 'error'); }
  if (btn) btn.innerHTML = `<span class="sos-icon">✅</span><span>SENT!</span>`;
  const status = document.getElementById('sosStatus');
  if (status) status.classList.remove('hidden');
  setTimeout(() => { sosTriggered = false; if (btn) btn.innerHTML = `<span class="sos-icon">🆘</span><span>SOS</span>`; }, 10000);
}

async function callContact(name, num) { 
  showToast(`📞 Calling ${name}: ${num}`, 'info'); 
  let locationData = { address: 'Location unavailable' };
  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 }));
    locationData = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` };
  } catch(err) { console.log('GPS unavailable for call log'); }
  
  try {
    const user = getUser();
    await apiCall('/sos/call', 'POST', { 
      calledTo: name, 
      calledNumber: num, 
      location: locationData, 
      userName: user?.name || 'Tourist' 
    });
  } catch (err) {
    console.error('Failed to log call', err);
  }
  
  window.location.href = `tel:${num}`;
}

const phrasebook = [
  { english: 'Hello / Namaste', hindi: 'नमस्ते', transliteration: 'Namaste' },
  { english: 'Thank you', hindi: 'धन्यवाद', transliteration: 'Dhanyavaad' },
  { english: 'Where is...?', hindi: '... कहाँ है?', transliteration: '... kahaan hai?' },
  { english: 'How much?', hindi: 'कितना?', transliteration: 'Kitnaa?' },
  { english: 'Help me!', hindi: 'मेरी मदद करो!', transliteration: 'Meri madad karo!' },
  { english: 'I am lost', hindi: 'मैं खो गया हूँ', transliteration: 'Main kho gaya hoon' },
  { english: 'Call the police', hindi: 'पुलिस को बुलाओ', transliteration: 'Police ko bulao' },
  { english: 'Good morning', hindi: 'शुभ प्रभात', transliteration: 'Shubh Prabhat' },
  { english: 'Water please', hindi: 'पानी चाहिए', transliteration: 'Paani chahiye' },
  { english: 'Hospital', hindi: 'अस्पताल', transliteration: 'Aspataal' },
  { english: 'Food / Restaurant', hindi: 'खाना / रेस्टोरेंट', transliteration: 'Khaana / Restaurant' },
  { english: 'Bus / Auto', hindi: 'बस / ऑटो', transliteration: 'Bus / Auto' },
];

function renderPhrasebook() {
  const c = document.getElementById('phrasebook');
  if (!c) return;
  c.innerHTML = phrasebook.map(p => `
    <div class="card" style="cursor:pointer" onclick="copyPhrase('${p.transliteration}')">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <div style="font-weight:700;margin-bottom:4px">${p.english}</div>
            <div style="font-size:1.3rem;color:var(--deep-teal);margin-bottom:4px">${p.hindi}</div>
            <div style="color:var(--muted);font-size:0.85rem;font-style:italic">${p.transliteration}</div>
          </div>
          <div style="font-size:24px">🔊</div>
        </div>
      </div>
    </div>`).join('');
}

function copyPhrase(text) { if (navigator.clipboard) navigator.clipboard.writeText(text); showToast(`Copied: "${text}"`, 'success'); }

const demoTranslations = {
  'hello': { hi: 'नमस्ते (Namaste)', fr: 'Bonjour', es: 'Hola', de: 'Hallo', ja: 'こんにちは' },
  'thank you': { hi: 'धन्यवाद (Dhanyavaad)', fr: 'Merci', es: 'Gracias', de: 'Danke', ja: 'ありがとう' },
  'where': { hi: 'कहाँ (Kahaan)', fr: 'Où', es: 'Dónde', de: 'Wo', ja: 'どこ' },
  'help': { hi: 'मदद (Madad)', fr: 'Aide', es: 'Ayuda', de: 'Hilfe', ja: 'ヘルプ' },
  'water': { hi: 'पानी (Paani)', fr: 'Eau', es: 'Agua', de: 'Wasser', ja: '水' },
  'food': { hi: 'खाना (Khaana)', fr: 'Nourriture', es: 'Comida', de: 'Essen', ja: '食べ物' },
  'hospital': { hi: 'अस्पताल (Aspataal)', fr: 'Hôpital', es: 'Hospital', de: 'Krankenhaus', ja: '病院' },
};

async function translateText() {
  const rawInput = document.getElementById('translateInput')?.value?.trim();
  const input = rawInput?.toLowerCase();
  const lang = document.getElementById('targetLang')?.value;
  const output = document.getElementById('translateOutput');
  const box = document.getElementById('translateResultBox');
  if (!rawInput || !output) return;
  if (!lang) { showToast('Please select a target language', 'error'); return; }
  
  output.textContent = 'Translating...';
  if (box) box.classList.remove('hidden');

  let result = demoTranslations[input]?.[lang];
  if (result) {
    output.textContent = result;
    return;
  }

  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawInput)}&langpair=en|${lang}`);
    const data = await response.json();
    if (data && data.responseData && data.responseData.translatedText) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.responseData.translatedText;
      output.textContent = tempDiv.textContent;
    } else {
      throw new Error('Translation API error');
    }
  } catch (err) {
    console.error('Translation error:', err);
    output.textContent = `[Offline translation. Failed to translate "${rawInput}"]`;
    showToast('Translation service error. Try offline words.', 'error');
  }
}

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .sidebar-nav a').forEach(a => {
    if (a.getAttribute('href') && path.endsWith(a.getAttribute('href'))) a.classList.add('active');
  });
}

function initHamburger() {
  const ham = document.getElementById('hamburger');
  if (ham) ham.addEventListener('click', () => { document.querySelector('.nav-links')?.classList.toggle('mobile-open'); });
}

function initChatbot() {
  if (document.getElementById('chatBubble')) return;

  const bubble = document.createElement('div');
  bubble.className = 'chatbot-bubble';
  bubble.id = 'chatBubble';
  bubble.innerHTML = '💬';
  document.body.appendChild(bubble);

  const container = document.createElement('div');
  container.className = 'chatbot-container';
  container.id = 'chatContainer';
  container.innerHTML = `
    <div class="chatbot-header">
      <h3>🗺️ Indore Assistant</h3>
      <button class="close-btn" id="chatCloseBtn">✕</button>
    </div>
    <div class="chatbot-messages" id="chatMessages">
      <div class="chat-msg bot">Hello! I am the Smart Tourism Indore Assistant. How can I help you today?</div>
    </div>
    <div class="chat-chips">
      <span class="chat-chip" data-query="hotels">🏨 Hotels</span>
      <span class="chat-chip" data-query="attractions">🏛️ Attractions</span>
      <span class="chat-chip" data-query="SOS">🚨 SOS</span>
    </div>
    <div class="chatbot-input-area">
      <input type="text" id="chatInput" placeholder="Ask a question...">
      <button id="chatSendBtn">➔</button>
    </div>
  `;
  document.body.appendChild(container);

  const toggle = () => container.classList.toggle('open');
  bubble.addEventListener('click', toggle);
  document.getElementById('chatCloseBtn').addEventListener('click', toggle);

  const sendBtn = document.getElementById('chatSendBtn');
  const input = document.getElementById('chatInput');

  const handleSend = async () => {
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    const messagesDiv = document.getElementById('chatMessages');

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-msg user';
    userMsgDiv.textContent = msg;
    messagesDiv.appendChild(userMsgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'chatTyping';
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      
      document.getElementById('chatTyping')?.remove();

      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'chat-msg bot';
      botMsgDiv.textContent = data.success ? data.reply : "I'm having trouble connecting to my brain right now. Please try again later!";
      messagesDiv.appendChild(botMsgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (err) {
      document.getElementById('chatTyping')?.remove();
      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'chat-msg bot';
      botMsgDiv.textContent = "Offline simulation: For full replies, please make sure the backend server is running on port 5000! You can also check our safety/explore pages.";
      messagesDiv.appendChild(botMsgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  };

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  container.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.query;
      handleSend();
    });
  });
}

const initApp = () => {
  initHamburger(); loadUserInfo(); updateNavbar(); setActiveNav(); renderPhrasebook();
  loadTrips(); loadLostItems(); loadFoundItems();
  initChatbot();
  if (window.location.pathname.includes('explore')) loadListings('all', '');
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
  document.getElementById('tripForm')?.addEventListener('submit', addTrip);
  document.getElementById('lfForm')?.addEventListener('submit', submitLostItem);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
