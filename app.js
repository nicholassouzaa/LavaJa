/* ==========================================================================
   LavaJá — app.js
   Vanilla JS SPA (no build step). Data persisted in localStorage.
   ========================================================================== */

/* ---------------------------- UTILITIES ---------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);
const brl = (n) => 'R$ ' + Number(n).toFixed(2).replace('.', ',');

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fmtDateHuman(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${pad(d)}/${pad(m)}/${y}`;
}
function toast(msg, type = '') {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------------------------- DATA LAYER ---------------------------- */
const DB_KEY = 'lavaja_db_v1';

function seedDB() {
  const carwashes = [
    {
      id: 'cw_autoclean', name: 'AutoClean', ownerId: 'admin_1',
      address: 'Rua das Palmeiras, 210 — Palhoça, SC', distanceKm: 1.2,
      rating: 4.8, reviewsCount: 126, emoji: '🚙',
      tags: ['Wi-Fi', 'Sala de espera', 'Cartão'],
      hours: '08:00 – 19:00',
      shuttleService: true, shuttleRadiusKm: 6, shuttleFee: 0,
      services: [
        { id: 's1', name: 'Lavagem Simples', desc: 'Lavagem externa completa + rodas', duration: 30, price: 35 },
        { id: 's2', name: 'Lavagem Completa', desc: 'Externa + interna + aspiração', duration: 90, price: 80 },
        { id: 's3', name: 'Higienização Interna', desc: 'Estofados, carpete e painel', duration: 100, price: 120 },
        { id: 's4', name: 'Polimento Técnico', desc: 'Remoção de riscos e brilho intenso', duration: 180, price: 200 },
      ],
    },
    {
      id: 'cw_brilhocar', name: 'Brilho Car', ownerId: null,
      address: 'Av. Central, 88 — Palhoça, SC', distanceKm: 1.8,
      rating: 4.6, reviewsCount: 98, emoji: '🚗',
      tags: ['Café', 'Cartão'],
      hours: '08:00 – 18:00',
      shuttleService: false, shuttleRadiusKm: 0, shuttleFee: 0,
      services: [
        { id: 's1', name: 'Lavagem Simples', desc: 'Lavagem externa rápida', duration: 25, price: 30 },
        { id: 's2', name: 'Lavagem Completa', desc: 'Externa + interna', duration: 80, price: 70 },
        { id: 's3', name: 'Vitrificação de Pintura', desc: 'Proteção de longa duração', duration: 240, price: 350 },
      ],
    },
    {
      id: 'cw_ecowash', name: 'EcoWash', ownerId: null,
      address: 'Rua Beira Mar, 455 — Palhoça, SC', distanceKm: 2.1,
      rating: 4.9, reviewsCount: 156, emoji: '🚘',
      tags: ['Eco Friendly', 'Água reutilizada'],
      hours: '07:30 – 19:30',
      shuttleService: true, shuttleRadiusKm: 4, shuttleFee: 12,
      services: [
        { id: 's1', name: 'Lavagem Simples', desc: 'Lavagem ecológica externa', duration: 30, price: 32 },
        { id: 's2', name: 'Lavagem Completa', desc: 'Externa + interna, produtos biodegradáveis', duration: 90, price: 85 },
        { id: 's3', name: 'Higienização Interna', desc: 'Estofados e carpete', duration: 100, price: 120 },
      ],
    },
  ];

  const users = [
    { id: 'admin_1', type: 'admin', name: 'AutoClean', email: 'admin@lavaja.com', password: 'admin123', phone: '(48) 99999-0001', carwashId: 'cw_autoclean' },
    { id: 'client_1', type: 'client', name: 'João Silva', email: 'cliente@lavaja.com', password: 'cliente123', phone: '(48) 99999-0002' },
  ];

  const vehicles = [
    { id: 'veh_1', userId: 'client_1', model: 'Honda Civic', plate: 'ABC-1234', year: 2020, color: 'Prata' },
    { id: 'veh_2', userId: 'client_1', model: 'Jeep Compass', plate: 'XYZ-5678', year: 2023, color: 'Preto' },
  ];

  const today = new Date();
  const iso0 = isoDate(today);

  const appointments = [
    { id: uid('appt'), userId: 'client_1', carwashId: 'cw_autoclean', serviceId: 's2', vehicleId: 'veh_1', date: iso0, time: '09:00', status: 'concluido', price: 80, clientName: 'João Silva', plate: 'ABC-1234' },
    { id: uid('appt'), userId: 'client_2', carwashId: 'cw_autoclean', serviceId: 's2', vehicleId: null, date: iso0, time: '10:30', status: 'em_andamento', price: 80, clientName: 'Pedro Almeida', plate: 'XYZ-5678' },
    { id: uid('appt'), userId: 'client_3', carwashId: 'cw_autoclean', serviceId: 's3', vehicleId: null, date: iso0, time: '13:00', status: 'confirmado', price: 120, clientName: 'Carlos Souza', plate: 'QWE-3456' },
    { id: uid('appt'), userId: 'client_4', carwashId: 'cw_autoclean', serviceId: 's2', vehicleId: null, date: iso0, time: '14:30', status: 'confirmado', price: 80, clientName: 'Maria Oliveira', plate: 'ASJ-7890' },
    { id: uid('appt'), userId: 'client_5', carwashId: 'cw_autoclean', serviceId: 's4', vehicleId: null, date: iso0, time: '16:00', status: 'confirmado', price: 200, clientName: 'Fernanda Lima', plate: 'RTY-1122' },
  ];

  const reviews = [
    { id: uid('rev'), carwashId: 'cw_autoclean', clientName: 'Juliana Martins', rating: 5, comment: 'Excelente serviço, muito atenciosos!', date: iso0 },
    { id: uid('rev'), carwashId: 'cw_autoclean', clientName: 'Roberto Santos', rating: 4, comment: 'Ótimo atendimento e qualidade.', date: iso0 },
  ];

  return { carwashes, users, vehicles, appointments, reviews };
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const fresh = seedDB();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}
function saveDB() { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }

let DB = loadDB();

/* ---------------------------- SESSION ---------------------------- */
let session = JSON.parse(localStorage.getItem('lavaja_session') || 'null');

function setSession(user) {
  session = user ? { id: user.id, type: user.type } : null;
  if (session) localStorage.setItem('lavaja_session', JSON.stringify(session));
  else localStorage.removeItem('lavaja_session');
  renderHeader();
}
function currentUser() {
  if (!session) return null;
  return DB.users.find(u => u.id === session.id) || null;
}

/* ---------------------------- ROUTER STATE ---------------------------- */
let route = { name: 'home', params: {} };
let bookingState = {}; // ephemeral state while booking

function go(name, params = {}) {
  route = { name, params };
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

/* ---------------------------- HEADER ---------------------------- */
function renderHeader() {
  const guestBox = $('#headerActionsGuest');
  const userBox = $('#headerActionsUser');
  const user = currentUser();
  if (user) {
    guestBox.classList.add('hidden');
    userBox.classList.remove('hidden');
    $('#userChipName').textContent = user.name.split(' ')[0];
    $('#userAvatar').textContent = user.name.charAt(0).toUpperCase();
    $('#menuAdminLink').classList.toggle('hidden', user.type !== 'admin');
  } else {
    guestBox.classList.remove('hidden');
    userBox.classList.add('hidden');
    $('#userMenu').classList.add('hidden');
  }
}

/* ---------------------------- MODALS ---------------------------- */
function openModal(which) {
  $('#modalOverlay').classList.remove('hidden');
  $('#loginModal').classList.toggle('hidden', which !== 'login');
  $('#registerModal').classList.toggle('hidden', which !== 'register');
  $('#loginError').classList.add('hidden');
  $('#regError').classList.add('hidden');
  updateLoginHint();
}
function closeModal() { $('#modalOverlay').classList.add('hidden'); }

function updateLoginHint() {
  const role = $('#loginModal .tab-btn.active').dataset.role;
  $('#loginDemoHint').textContent = role === 'admin'
    ? 'Demo lavação: admin@lavaja.com / admin123'
    : 'Demo cliente: cliente@lavaja.com / cliente123';
}

/* ---------------------------- SEARCH / FILTER ---------------------------- */
let activeFilter = '';

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function filterCarwashes(query) {
  const q = normalize(query);
  if (!q) return DB.carwashes;
  if (q.includes('leva e traz') || q.includes('carona')) {
    return DB.carwashes.filter(cw => cw.shuttleService);
  }
  return DB.carwashes.filter(cw =>
    normalize(cw.name).includes(q) ||
    cw.tags.some(t => normalize(t).includes(q)) ||
    cw.services.some(s => normalize(s.name).includes(q))
  );
}
function washGridHTML(query) {
  const list = filterCarwashes(query);
  if (!list.length) {
    return `<div class="empty-state"><div class="ic">🔍</div><p>Nenhuma lavação encontrada para "${query}".</p></div>`;
  }
  return list.map(washCardHTML).join('');
}
function refreshHomeGrid() {
  const grid = $('#homeWashGrid');
  if (grid) grid.innerHTML = washGridHTML(activeFilter);
  const wrap = $('#washesGridWrap');
  if (wrap) wrap.innerHTML = washGridHTML(activeFilter);
}

/* ---------------------------- HOME VIEW ---------------------------- */
function washCardHTML(cw) {
  const mini = cw.services.slice(0, 2).map(s => `<span>${s.name} <b>${brl(s.price)}</b></span>`).join('');
  const shuttleBadge = cw.shuttleService ? `<div class="shuttle-flag">🚐 Leva e traz${cw.shuttleFee ? ' · ' + brl(cw.shuttleFee) : ' grátis'}</div>` : '';
  return `
  <div class="wash-card">
    <div class="wash-thumb">${cw.emoji}</div>
    <div class="wash-body">
      <div class="wash-title-row">
        <h3>${cw.name}</h3>
        <div class="wash-rating"><span class="star">★</span> ${cw.rating} (${cw.reviewsCount})</div>
      </div>
      <div class="wash-dist">📍 ${cw.distanceKm} km · Palhoça, SC</div>
      ${shuttleBadge}
      <div class="wash-services-mini">${mini}</div>
      <div class="wash-tags">${cw.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <button class="btn btn-primary btn-block" data-goto-wash="${cw.id}">Ver serviços</button>
    </div>
  </div>`;
}

function renderHome() {
  return `
  <section class="hero">
    <div class="hero-inner">
      <h1>Seu carro limpo,<br><span class="accent">sem perder tempo.</span></h1>
      <p>Encontre as melhores lavações perto de você e agende online em poucos cliques.</p>
      <div class="search-box">
        <div class="search-field">📍 <input id="searchLocation" value="Palhoça, SC" /></div>
        <div class="search-field2">🔎 <input id="searchQuery" placeholder="O que você procura?" value="${activeFilter}" /></div>
        <button class="btn btn-primary" id="searchBtn">Buscar</button>
      </div>
      <div class="chip-row">
        <div class="chip-card" data-filter="Lavagem Simples"><span class="ic">💧</span>Lavagem Simples</div>
        <div class="chip-card" data-filter="Lavagem Completa"><span class="ic">🚙</span>Lavagem Completa</div>
        <div class="chip-card" data-filter="Higienização Interna"><span class="ic">🧽</span>Higienização Interna</div>
        <div class="chip-card" data-filter="Polimento"><span class="ic">✨</span>Polimento</div>
        <div class="chip-card" data-filter="Vitrificação"><span class="ic">🛡️</span>Vitrificação</div>
        <div class="chip-card" data-filter="Leva e traz"><span class="ic">🚐</span>Leva e traz</div>
        <div class="chip-card" data-filter="">Mais Serviços</div>
      </div>
    </div>
  </section>

  <section class="section" id="services-anchor">
    <div class="section-head">
      <h2>Lavações próximas</h2>
      <a href="#" data-nav="washes">Ver todas</a>
    </div>
    <div class="wash-grid" id="homeWashGrid">
      ${washGridHTML(activeFilter)}
    </div>
  </section>

  <section class="section" id="how">
    <div class="section-head"><h2>Como funciona</h2></div>
    <div class="wash-grid">
      <div class="card"><h3>1. Encontre</h3><p style="color:var(--text-soft);margin-top:8px;font-size:14px;">Busque lavações perto de você e compare preços e avaliações.</p></div>
      <div class="card"><h3>2. Agende</h3><p style="color:var(--text-soft);margin-top:8px;font-size:14px;">Escolha o serviço, a data e o horário que preferir.</p></div>
      <div class="card"><h3>3. Aproveite</h3><p style="color:var(--text-soft);margin-top:8px;font-size:14px;">Leve seu carro e receba tudo prontinho. Depois é só avaliar!</p></div>
    </div>
  </section>
  `;
}

function renderWashesList() {
  const list = filterCarwashes(activeFilter);
  return `
  <div class="page-wrap wide">
    <div class="page-title">Lavações perto de você</div>
    <div class="page-sub" id="washesCountLabel">${list.length} lavações encontradas em Palhoça, SC</div>
    <div class="search-box" style="margin-bottom:26px;max-width:520px;box-shadow:var(--shadow-sm);border:1px solid var(--border);">
      <div class="search-field2">🔎 <input id="searchQueryWashes" placeholder="Buscar por lavação ou serviço" value="${activeFilter}" /></div>
      <button class="btn btn-primary" id="searchBtnWashes">Buscar</button>
    </div>
    <div class="wash-grid" id="washesGridWrap">${washGridHTML(activeFilter)}</div>
  </div>`;
}

/* ---------------------------- WASH DETAIL ---------------------------- */
function renderWashDetail(id) {
  const cw = DB.carwashes.find(c => c.id === id);
  if (!cw) return `<div class="page-wrap"><p>Lavação não encontrada.</p></div>`;
  const reviews = DB.reviews.filter(r => r.carwashId === id);
  return `
  <div class="page-wrap wide">
    <div class="breadcrumb"><a href="#" data-nav="home">Início</a> / ${cw.name}</div>

    <div class="wash-detail-hero">
      <div class="info">
        <h1>${cw.emoji} ${cw.name}</h1>
        <div class="meta">
          <span>★ ${cw.rating} (${cw.reviewsCount} avaliações)</span>
          <span>📍 ${cw.address}</span>
          <span>🕒 ${cw.hours}</span>
        </div>
        <div class="tags">${cw.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
      ${cw.shuttleService ? `
      <div class="shuttle-hero-box">
        <div class="shuttle-hero-title">🚐 Leva e traz</div>
        <div class="shuttle-hero-desc">Não fique esperando! Levamos você em casa ou no trabalho e buscamos quando o carro estiver pronto.</div>
        <div class="shuttle-hero-price">${cw.shuttleFee ? brl(cw.shuttleFee) + ' por trajeto' : 'Grátis'} · raio de ${cw.shuttleRadiusKm} km</div>
      </div>` : ''}
    </div>

    <div class="two-col">
      <div>
        <h3 style="margin-bottom:14px;">Serviços</h3>
        <div class="service-list">
          ${cw.services.map(s => `
            <div class="service-row" data-book-service="${s.id}">
              <div>
                <h4>${s.name}</h4>
                <div class="sub">${s.desc} · ⏱ ${s.duration >= 60 ? (s.duration / 60).toFixed(1).replace('.0', '') + 'h' : s.duration + ' min'}</div>
              </div>
              <div class="price">${brl(s.price)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div>
        <div class="panel">
          <h3>Avaliações recentes</h3>
          ${reviews.length ? reviews.map(r => `
            <div class="review-item">
              <div class="top"><span>${r.clientName}</span><span style="font-weight:400;color:var(--text-faint);font-size:12px;">${fmtDateHuman(r.date)}</span></div>
              <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              <p>${r.comment}</p>
            </div>`).join('') : '<p style="color:var(--text-faint);font-size:13.5px;">Ainda não há avaliações.</p>'}
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------- BOOKING FLOW ---------------------------- */
function requireAuthOrPrompt() {
  if (!currentUser()) {
    toast('Entre na sua conta para agendar', 'error');
    openModal('login');
    return false;
  }
  if (currentUser().type !== 'client') {
    toast('Entre com uma conta de cliente para agendar', 'error');
    return false;
  }
  return true;
}

function startBooking(carwashId, serviceId) {
  if (!requireAuthOrPrompt()) return;
  bookingState = { carwashId, serviceId, date: null, time: null, vehicleId: null, needsShuttle: false, shuttleAddress: '' };
  go('booking', { carwashId });
}

function renderBooking() {
  const cw = DB.carwashes.find(c => c.id === bookingState.carwashId);
  const service = cw.services.find(s => s.id === bookingState.serviceId);
  const myVehicles = DB.vehicles.filter(v => v.userId === currentUser().id);

  const today = new Date();
  if (bookingState.calMonth === undefined) bookingState.calMonth = today.getMonth();
  if (bookingState.calYear === undefined) bookingState.calYear = today.getFullYear();

  return `
  <div class="page-wrap wide">
    <div class="breadcrumb"><a href="#" data-nav="home">Início</a> / <a href="#" data-goto-wash="${cw.id}">${cw.name}</a> / Agendamento</div>
    <div class="page-title">Agendar em ${cw.name}</div>
    <div class="page-sub">${service.name} · ${brl(service.price)}</div>

    <div class="two-col">
      <div>
        <div class="card" style="margin-bottom:18px;">
          <h3>Escolha o veículo</h3>
          <div class="vehicle-pick" id="vehiclePick">
            ${myVehicles.length ? myVehicles.map(v => `
              <div class="vehicle-opt ${bookingState.vehicleId === v.id ? 'selected' : ''}" data-pick-vehicle="${v.id}">
                🚗 <div><b>${v.model}</b> · ${v.plate} <div style="font-size:12px;color:var(--text-faint);">${v.color} · ${v.year}</div></div>
              </div>`).join('') : '<p style="font-size:13.5px;color:var(--text-faint);">Você ainda não tem veículos cadastrados.</p>'}
            <button class="btn btn-ghost btn-sm" id="addVehicleInline" style="width:fit-content;margin-top:4px;">+ Adicionar veículo</button>
          </div>
        </div>

        ${cw.shuttleService ? shuttleCardHTML(cw) : ''}

        <div class="card">
          <h3>Data e horário</h3>
          <div id="calendarBox">${calendarHTML()}</div>
          <div id="timeGridBox">${timeSlotsHTML()}</div>
        </div>
      </div>

      <div class="card">
        <h3>Resumo do agendamento</h3>
        <div class="summary-line"><span>Lavação</span><b>${cw.name}</b></div>
        <div class="summary-line"><span>Serviço</span><b>${service.name}</b></div>
        <div class="summary-line"><span>Data</span><b id="sumDate">${bookingState.date ? fmtDateHuman(bookingState.date) : '—'}</b></div>
        <div class="summary-line"><span>Horário</span><b id="sumTime">${bookingState.time || '—'}</b></div>
        <div class="summary-line"><span>Veículo</span><b id="sumVehicle">${vehicleLabel(bookingState.vehicleId) || '—'}</b></div>
        ${cw.shuttleService ? `<div class="summary-line"><span>Leva e traz</span><b id="sumShuttle">${bookingState.needsShuttle ? '🚐 Solicitado' : 'Não'}</b></div>` : ''}
        <div class="summary-total"><span>Total</span><span>${brl(service.price + (bookingState.needsShuttle ? (cw.shuttleFee || 0) : 0))}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:18px;" id="confirmBookingBtn">Continuar</button>
      </div>
    </div>
  </div>`;
}

function shuttleCardHTML(cw) {
  const on = !!bookingState.needsShuttle;
  return `
  <div class="card shuttle-card" style="margin-bottom:18px;">
    <div class="shuttle-card-head">
      <div>
        <h3 style="margin-bottom:2px;">🚐 Leva e traz</h3>
        <p class="shuttle-card-sub">Vamos te levar em casa ou no trabalho enquanto o carro é lavado, e buscar você quando estiver pronto.</p>
      </div>
      <label class="switch">
        <input type="checkbox" id="shuttleToggle" ${on ? 'checked' : ''}>
        <span class="switch-track"><span class="switch-thumb"></span></span>
      </label>
    </div>
    ${on ? `
      <div class="shuttle-fields">
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-soft);margin-top:14px;">Endereço para buscar e devolver você
          <input type="text" id="shuttleAddress" placeholder="Rua, número, bairro" value="${bookingState.shuttleAddress || ''}" style="width:100%;margin-top:6px;padding:11px 12px;border:1.5px solid var(--border);border-radius:9px;font-size:14px;">
        </label>
        <p class="shuttle-note">${cw.shuttleFee ? `Taxa de ${brl(cw.shuttleFee)} por trajeto` : 'Serviço gratuito'} · válido em um raio de ${cw.shuttleRadiusKm} km da lavação.</p>
      </div>
    ` : ''}
  </div>`;
}

function vehicleLabel(vid) {
  if (!vid) return null;
  const v = DB.vehicles.find(v => v.id === vid);
  return v ? `${v.model} · ${v.plate}` : null;
}

function calendarHTML() {
  const y = bookingState.calYear, m = bookingState.calMonth;
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayISO = isoDate(new Date());

  let cells = '';
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(y, m, d);
    const iso = isoDate(dateObj);
    const disabled = iso < todayISO;
    const selected = bookingState.date === iso;
    cells += `<div class="cal-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}" ${disabled ? '' : `data-pick-date="${iso}"`}>${d}</div>`;
  }

  return `
    <div class="cal-header">
      <button data-cal-nav="-1">‹</button>
      <b>${MONTHS[m]} ${y}</b>
      <button data-cal-nav="1">›</button>
    </div>
    <div class="cal-grid">
      ${DOW.map(d => `<div class="dow">${d}</div>`).join('')}
      ${cells}
    </div>`;
}

function timeSlotsHTML() {
  if (!bookingState.date) return `<p style="font-size:13px;color:var(--text-faint);margin-top:14px;">Selecione uma data para ver os horários.</p>`;
  const allSlots = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];
  const cw = DB.carwashes.find(c => c.id === bookingState.carwashId);
  const taken = DB.appointments.filter(a => a.carwashId === cw.id && a.date === bookingState.date && a.status !== 'cancelado').map(a => a.time);
  return `
    <p style="font-size:13px;font-weight:700;color:var(--text-soft);margin-top:16px;">Horários disponíveis</p>
    <div class="time-grid">
      ${allSlots.map(t => {
    const busy = taken.includes(t);
    const sel = bookingState.time === t;
    return `<div class="time-slot ${sel ? 'selected' : ''} ${busy ? 'disabled' : ''}" style="${busy ? 'opacity:.35;cursor:not-allowed;' : ''}" ${busy ? '' : `data-pick-time="${t}"`}>${t}</div>`;
  }).join('')}
    </div>`;
}

function renderBookingConfirm() {
  const cw = DB.carwashes.find(c => c.id === bookingState.carwashId);
  const service = cw.services.find(s => s.id === bookingState.serviceId);
  const shuttleOn = !!(cw.shuttleService && bookingState.needsShuttle);
  return `
  <div class="page-wrap" style="max-width:520px;">
    <div class="card">
      <div class="confirm-box">
        <div class="confirm-icon">✓</div>
        <h2>Agendamento confirmado!</h2>
        <p style="color:var(--text-soft);margin-top:6px;font-size:14px;">Seu agendamento foi realizado com sucesso.</p>
      </div>
      <hr style="border:none;border-top:1px solid var(--border);margin:20px 0;">
      <div class="summary-line"><span>Lavação</span><b>${cw.name}</b></div>
      <div class="summary-line"><span>Serviço</span><b>${service.name}</b></div>
      <div class="summary-line"><span>Data</span><b>${fmtDateHuman(bookingState.date)}</b></div>
      <div class="summary-line"><span>Horário</span><b>${bookingState.time}</b></div>
      <div class="summary-line"><span>Veículo</span><b>${vehicleLabel(bookingState.vehicleId) || '—'}</b></div>
      ${shuttleOn ? `<div class="summary-line"><span>Leva e traz</span><b>🚐 ${bookingState.shuttleAddress || 'Solicitado'}</b></div>` : ''}
      <div class="summary-total"><span>Valor</span><span>${brl(service.price + (shuttleOn ? (cw.shuttleFee || 0) : 0))}</span></div>
      ${shuttleOn ? `<div class="shuttle-confirm-note">🚐 A lavação vai te chamar por telefone/WhatsApp perto do horário para combinar a carona.</div>` : ''}
      <button class="btn btn-primary btn-block" style="margin-top:20px;" data-nav="client-appointments">Ver agendamentos</button>
      <button class="btn btn-ghost btn-block" style="margin-top:10px;" data-nav="home">Ir para início</button>
    </div>
  </div>`;
}

/* ---------------------------- CLIENT: APPOINTMENTS ---------------------------- */
function renderClientAppointments(tab = 'proximos') {
  const user = currentUser();
  const mine = DB.appointments.filter(a => a.userId === user.id);
  const upcoming = mine.filter(a => ['confirmado', 'pendente', 'em_andamento'].includes(a.status));
  const history = mine.filter(a => ['concluido', 'cancelado'].includes(a.status));
  const list = tab === 'proximos' ? upcoming : history;

  return `
  <div class="page-wrap">
    <div class="page-title">Meus agendamentos</div>
    <div class="appt-tabs">
      <button class="${tab === 'proximos' ? 'active' : ''}" data-appt-tab="proximos">Próximos</button>
      <button class="${tab === 'historico' ? 'active' : ''}" data-appt-tab="historico">Histórico</button>
    </div>
    ${list.length ? list.map(a => appointmentCardHTML(a, tab)).join('') : `
      <div class="empty-state"><div class="ic">🧽</div><p>${tab === 'proximos' ? 'Você ainda não tem agendamentos futuros.' : 'Nenhum histórico por aqui ainda.'}</p></div>
    `}
  </div>`;
}

function appointmentCardHTML(a, tab) {
  const cw = DB.carwashes.find(c => c.id === a.carwashId);
  const service = cw.services.find(s => s.id === a.serviceId);
  const v = DB.vehicles.find(v => v.id === a.vehicleId);
  return `
  <div class="appt-card">
    <div class="left">
      <h4>${cw.name}</h4>
      <div class="meta">
        ${service.name}<br>
        📅 ${fmtDateHuman(a.date)} · 🕒 ${a.time}<br>
        ${v ? `🚗 ${v.model} · ${v.plate}` : ''}
        ${a.needsShuttle ? `<br>🚐 Leva e traz${a.shuttleAddress ? ' · ' + a.shuttleAddress : ''}` : ''}
      </div>
    </div>
    <div class="right">
      <span class="status-badge ${a.status}">${statusLabel(a.status)}</span>
      <div class="appt-actions">
        ${tab === 'proximos' ? `<button class="btn btn-danger-outline btn-sm" data-cancel-appt="${a.id}">Cancelar</button>` : ''}
        ${tab === 'historico' && a.status === 'concluido' && !a.reviewed ? `<button class="btn btn-primary btn-sm" data-rate-appt="${a.id}">Avaliar</button>` : ''}
      </div>
    </div>
  </div>`;
}
function statusLabel(s) {
  return { confirmado: 'Confirmado', pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado' }[s] || s;
}

/* ---------------------------- CLIENT: VEHICLES ---------------------------- */
function renderClientVehicles() {
  const user = currentUser();
  const mine = DB.vehicles.filter(v => v.userId === user.id);
  return `
  <div class="page-wrap">
    <div class="page-title">Meus veículos</div>
    <div class="vehicle-grid">
      ${mine.map(v => `
        <div class="vehicle-card">
          <div class="top">
            <div>🚗<h4 style="margin-top:6px;">${v.model}</h4><span style="font-size:12.5px;color:var(--text-soft);">${v.color} · ${v.year}</span></div>
            <button class="btn btn-ghost btn-sm" data-del-vehicle="${v.id}">✕</button>
          </div>
          <span class="plate">${v.plate}</span>
        </div>`).join('')}
      <div class="add-vehicle-card" id="addVehicleCard">
        <span style="font-size:26px;">+</span> Adicionar veículo
      </div>
    </div>
  </div>`;
}

/* ---------------------------- CLIENT: PROFILE ---------------------------- */
function renderClientProfile() {
  const u = currentUser();
  return `
  <div class="page-wrap" style="max-width:560px;">
    <div class="page-title">Meu perfil</div>
    <div class="card">
      <form id="profileForm">
        <label>Nome completo<input type="text" id="pfName" value="${u.name}" required></label>
        <label>E-mail<input type="email" id="pfEmail" value="${u.email}" required></label>
        <label>Telefone<input type="tel" id="pfPhone" value="${u.phone || ''}" required></label>
        <button class="btn btn-primary" style="margin-top:20px;">Salvar alterações</button>
      </form>
    </div>
  </div>`;
}

/* ---------------------------- ADMIN ---------------------------- */
const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'agenda', label: 'Agenda', icon: '📅' },
  { id: 'services', label: 'Serviços', icon: '🧽' },
  { id: 'clients', label: 'Clientes', icon: '👥' },
  { id: 'carwashes', label: 'Lavações', icon: '🚗' },
  { id: 'add-carwash', label: 'Adicionar lavação', icon: '➕' }
];

function adminShell(activeTab, innerHTML) {
  const u = currentUser();
  const cw = DB.carwashes.find(c => c.id === u.carwashId);
  return `
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="brand">💧 LavaJá</div>
      <div class="eyebrow">Painel da lavação</div>
      ${ADMIN_TABS.map(t => `<button class="admin-nav-item ${activeTab === t.id ? 'active' : ''}" data-admin-tab="${t.id}">${t.icon} ${t.label}</button>`).join('')}
      <div class="admin-profile-box">
        <span class="avatar">${cw.name.charAt(0)}</span>
        <div class="who"><b>${cw.name}</b><span>Administrador</span></div>
      </div>
    </aside>
    <div class="admin-content">${innerHTML}</div>
  </div>`;
}

function renderAdminDashboard() {
  const u = currentUser();
  const cw = DB.carwashes.find(c => c.id === u.carwashId);
  const todayISO = isoDate(new Date());
  const todays = DB.appointments.filter(a => a.carwashId === cw.id && a.date === todayISO).sort((a, b) => a.time.localeCompare(b.time));
  const revenueToday = todays.reduce((sum, a) => sum + a.price, 0);
  const serviceCounts = {};
  DB.appointments.filter(a => a.carwashId === cw.id).forEach(a => { serviceCounts[a.serviceId] = (serviceCounts[a.serviceId] || 0) + 1; });
  const maxCount = Math.max(1, ...Object.values(serviceCounts));
  const reviews = DB.reviews.filter(r => r.carwashId === cw.id);

  const inner = `
    <div class="admin-top">
      <h1>Dashboard</h1>
      <div style="font-size:13px;color:var(--text-soft);">Hoje, ${fmtDateHuman(todayISO)}</div>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="label">Agendamentos hoje</div><div class="value">${todays.length}</div><div class="delta">+20% vs ontem</div></div>
      <div class="stat-card"><div class="label">Faturamento hoje</div><div class="value">${brl(revenueToday)}</div><div class="delta">+15% vs ontem</div></div>
      <div class="stat-card"><div class="label">Avaliação média</div><div class="value">★ ${cw.rating}</div><div class="delta" style="color:var(--text-faint);">${cw.reviewsCount} avaliações</div></div>
      <div class="stat-card"><div class="label">Clientes ativos</div><div class="value">${DB.users.filter(x => x.type === 'client').length + 5}</div><div class="delta">+8% vs mês passado</div></div>
      ${cw.shuttleService ? `<div class="stat-card"><div class="label">🚐 Caronas hoje</div><div class="value">${todays.filter(a => a.needsShuttle).length}</div><div class="delta" style="color:var(--text-faint);">Leva e traz ativo</div></div>` : ''}
    </div>

    <div class="admin-grid">
      <div>
        <div class="panel">
          <h3>Agendamentos de hoje <a href="#" data-admin-tab="agenda">Ver agenda completa</a></h3>
          ${todays.length ? todays.map(a => {
    const s = cw.services.find(s => s.id === a.serviceId);
    return `<div class="today-row">
              <span class="time-chip">${a.time}</span>
              <div class="info"><b>${a.clientName} ${a.needsShuttle ? '🚐' : ''}</b><span>${s.name} · ${a.plate}</span></div>
              <span class="status-badge ${a.status === 'em_andamento' ? 'pendente' : a.status}">${statusLabel(a.status)}</span>
            </div>`;
  }).join('') : '<p style="font-size:13.5px;color:var(--text-faint);">Nenhum agendamento hoje.</p>'}
        </div>
      </div>
      <div>
        <div class="panel">
          <h3>Serviços mais agendados</h3>
          <div class="bar-list">
            ${Object.entries(serviceCounts).map(([sid, count]) => {
    const s = cw.services.find(s => s.id === sid);
    if (!s) return '';
    return `<div class="bar-item"><div class="top"><span>${s.name}</span><span>${count}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(count / maxCount) * 100}%"></div></div></div>`;
  }).join('')}
          </div>
        </div>
        <div class="panel">
          <h3>Avaliações recentes <a href="#" data-admin-tab="clients">Ver todas</a></h3>
          ${reviews.map(r => `
            <div class="review-item">
              <div class="top"><span>${r.clientName}</span><span style="font-weight:400;color:var(--text-faint);font-size:12px;">${fmtDateHuman(r.date)}</span></div>
              <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              <p>${r.comment}</p>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
  return adminShell('dashboard', inner);
}

function renderAdminAgenda() {
  const u = currentUser();
  const cw = DB.carwashes.find(c => c.id === u.carwashId);
  const all = DB.appointments.filter(a => a.carwashId === cw.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const inner = `
    <div class="admin-top"><h1>Agenda</h1></div>
    <div class="panel">
      <table class="admin-table">
        <thead><tr><th>Data</th><th>Horário</th><th>Cliente</th><th>Serviço</th><th>Placa</th>${cw.shuttleService ? '<th>Leva e traz</th>' : ''}<th>Status</th><th>Valor</th></tr></thead>
        <tbody>
          ${all.map(a => {
    const s = cw.services.find(s => s.id === a.serviceId);
    return `<tr>
              <td>${fmtDateHuman(a.date)}</td><td>${a.time}</td><td>${a.clientName}</td><td>${s.name}</td><td>${a.plate}</td>
              ${cw.shuttleService ? `<td>${a.needsShuttle ? `🚐 ${a.shuttleAddress || 'Solicitado'}` : '—'}</td>` : ''}
              <td><span class="status-badge ${a.status === 'em_andamento' ? 'pendente' : a.status}">${statusLabel(a.status)}</span></td>
              <td>${brl(a.price)}</td>
            </tr>`;
  }).join('')}
        </tbody>
      </table>
    </div>
  `;
  return adminShell('agenda', inner);
}

function renderAdminServices() {
  const u = currentUser();
  const cw = DB.carwashes.find(c => c.id === u.carwashId);
  const inner = `
    <div class="admin-top">
      <h1>Serviços</h1>
      <button class="btn btn-primary btn-sm" id="addServiceBtn">+ Novo serviço</button>
    </div>

    <div class="panel shuttle-admin-panel">
      <h3>🚐 Serviço de leva e traz <span style="font-weight:400;color:var(--text-faint);font-size:12px;">(diferencial da sua lavação)</span></h3>
      <p style="font-size:13.5px;color:var(--text-soft);margin-bottom:14px;">Ative para levar o cliente em casa ou no trabalho enquanto o carro é lavado, e buscá-lo quando terminar. Aparece como selo de destaque na busca.</p>
      <div class="shuttle-card-head" style="margin-bottom:${cw.shuttleService ? '14px' : '0'};">
        <b style="font-size:14px;">${cw.shuttleService ? 'Ativado' : 'Desativado'}</b>
        <label class="switch">
          <input type="checkbox" id="toggleShuttleService" ${cw.shuttleService ? 'checked' : ''}>
          <span class="switch-track"><span class="switch-thumb"></span></span>
        </label>
      </div>
      ${cw.shuttleService ? `
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <label style="font-size:13px;font-weight:600;color:var(--text-soft);">Taxa por trajeto (R$, 0 = grátis)
            <input type="number" min="0" step="1" id="shuttleFeeInput" value="${cw.shuttleFee || 0}" style="display:block;margin-top:6px;padding:9px 11px;border:1.5px solid var(--border);border-radius:8px;width:160px;">
          </label>
          <label style="font-size:13px;font-weight:600;color:var(--text-soft);">Raio de atendimento (km)
            <input type="number" min="1" step="1" id="shuttleRadiusInput" value="${cw.shuttleRadiusKm || 5}" style="display:block;margin-top:6px;padding:9px 11px;border:1.5px solid var(--border);border-radius:8px;width:160px;">
          </label>
        </div>
      ` : ''}
    </div>

    <div class="panel">
      <table class="admin-table">
        <thead><tr><th>Serviço</th><th>Descrição</th><th>Duração</th><th>Preço</th><th></th></tr></thead>
        <tbody>
          ${cw.services.map(s => `
            <tr>
              <td><b>${s.name}</b></td><td>${s.desc}</td>
              <td>${s.duration >= 60 ? (s.duration / 60) + 'h' : s.duration + ' min'}</td>
              <td>${brl(s.price)}</td>
              <td><button class="btn btn-ghost btn-sm" data-del-service="${s.id}">Remover</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
  return adminShell('services', inner);
}

function renderAdminClients() {
  const u = currentUser();
  const cw = DB.carwashes.find(c => c.id === u.carwashId);
  const byPlate = {};
  DB.appointments.filter(a => a.carwashId === cw.id).forEach(a => {
    if (!byPlate[a.clientName]) byPlate[a.clientName] = { name: a.clientName, plate: a.plate, count: 0, total: 0 };
    byPlate[a.clientName].count++; byPlate[a.clientName].total += a.price;
  });
  const rows = Object.values(byPlate);
  const inner = `
    <div class="admin-top"><h1>Clientes</h1></div>
    <div class="panel">
      <table class="admin-table">
        <thead><tr><th>Cliente</th><th>Placa</th><th>Agendamentos</th><th>Total gasto</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td>${r.name}</td><td>${r.plate}</td><td>${r.count}</td><td>${brl(r.total)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `;
  return adminShell('clients', inner);
}
function renderAdminCarwashes() {
  const inner = `
    <div class="admin-top">
      <div>
        <h1>Lavações</h1>
        <p style="font-size:13.5px;color:var(--text-soft);margin-top:5px;">
          Gerencie as lavações cadastradas na plataforma.
        </p>
      </div>

      <button class="btn btn-primary btn-sm" data-admin-tab="add-carwash">
        + Nova lavação
      </button>
    </div>

    <div class="panel">
      <h3>
        Lavações cadastradas
        <span style="font-weight:400;color:var(--text-faint);font-size:12px;">
          ${DB.carwashes.length} cadastrada(s)
        </span>
      </h3>

      <div class="carwash-admin-list">

        ${DB.carwashes.length ? DB.carwashes.map(cw => `
          <div class="carwash-admin-item">

            <div class="carwash-admin-info">

              <div class="carwash-admin-icon">
                ${cw.emoji || '🚗'}
              </div>

              <div>
                <div class="carwash-admin-name">
                  ${cw.name}
                </div>

                <div class="carwash-admin-meta">
                  ${cw.address || 'Endereço não informado'}
                </div>

                <div class="carwash-admin-meta">
                  ${cw.phone || 'Telefone não informado'}
                </div>

                <div class="carwash-admin-tags">
                  <span class="tag">
                    ★ ${cw.rating || 0}
                  </span>

                  <span class="tag">
                    ${(cw.services || []).length} serviços
                  </span>

                  ${cw.shuttleService ? `
                    <span class="tag">
                      🚐 Leva e traz
                    </span>
                  ` : ''}
                </div>
              </div>

            </div>

            <div class="carwash-admin-actions">

              <button
                class="btn btn-ghost btn-sm"
                data-edit-carwash="${cw.id}">
                ✏️ Editar
              </button>

              <button
                class="btn btn-primary btn-sm"
                data-manage-services="${cw.id}">
                🧽 Serviços
              </button>

            </div>

          </div>
        `).join('') : `
          <div class="empty-state">
            <div class="ic">🚗</div>
            <p>Nenhuma lavação cadastrada.</p>
          </div>
        `}

      </div>
    </div>
  `;

  return adminShell('carwashes', inner);
}
function renderAdminEditCarwash(id) {
  const cw = DB.carwashes.find(c => c.id === id);

  if (!cw) {
    return adminShell('carwashes', `
      <div class="empty-state">
        <div class="ic">❌</div>
        <p>Lavação não encontrada.</p>
      </div>
    `);
  }

  const inner = `
    <div class="admin-top">
      <div>
        <h1>Editar lavação</h1>
        <p style="font-size:13.5px;color:var(--text-soft);margin-top:5px;">
          Altere as informações da lavação.
        </p>
      </div>

      <button class="btn btn-ghost btn-sm" data-admin-tab="carwashes">
        ← Voltar
      </button>
    </div>

    <div class="panel" style="max-width:700px;">

      <h3>Informações da lavação</h3>

      <form id="editCarwashForm" data-carwash-id="${cw.id}">

        <label>
          Nome da lavação
          <input
            type="text"
            id="editCwName"
            value="${cw.name || ''}"
            required>
        </label>

        <label>
          Nome do responsável
          <input
            type="text"
            id="editCwOwner"
            value="${cw.owner || ''}"
            required>
        </label>

        <label>
          E-mail
          <input
            type="email"
            id="editCwEmail"
            value="${cw.email || ''}"
            required>
        </label>

        <label>
          Telefone
          <input
            type="tel"
            id="editCwPhone"
            value="${cw.phone || ''}"
            required>
        </label>

        <label>
          Endereço
          <input
            type="text"
            id="editCwAddress"
            value="${cw.address || ''}"
            required>
        </label>

        <label>
          Horário de funcionamento
          <input
            type="text"
            id="editCwHours"
            value="${cw.hours || '08:00 – 18:00'}"
            required>
        </label>

        <label>
          Emoji / ícone
          <input
            type="text"
            id="editCwEmoji"
            value="${cw.emoji || '🚗'}"
            maxlength="2">
        </label>

        <button
          type="submit"
          class="btn btn-primary btn-block">
          Salvar alterações
        </button>

      </form>

    </div>
  `;

  return adminShell('carwashes', inner);
}
function renderAdminManageServices(id) {
  const cw = DB.carwashes.find(c => c.id === id);

  if (!cw) {
    return adminShell('carwashes', `
      <div class="empty-state">
        <div class="ic">❌</div>
        <p>Lavação não encontrada.</p>
      </div>
    `);
  }

  if (!cw.services) {
    cw.services = [];
  }

  const inner = `
    <div class="admin-top">

      <div>
        <h1>Serviços</h1>
        <p style="font-size:13.5px;color:var(--text-soft);margin-top:5px;">
          ${cw.name}
        </p>
      </div>

      <button class="btn btn-ghost btn-sm" data-admin-tab="carwashes">
        ← Voltar
      </button>

    </div>

    <div class="panel">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
        <h3 style="margin:0;">
          Serviços da lavação
        </h3>

        <button
          class="btn btn-primary btn-sm"
          id="addCarwashServiceBtn">
          + Novo serviço
        </button>
      </div>

      ${cw.services.length ? `

        <table class="admin-table">

          <thead>
            <tr>
              <th>Serviço</th>
              <th>Descrição</th>
              <th>Duração</th>
              <th>Preço</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            ${cw.services.map(s => `
              <tr>

                <td>
                  <b>${s.name}</b>
                </td>

                <td>
                  ${s.desc || '—'}
                </td>

                <td>
                  ${s.duration >= 60
      ? (s.duration / 60) + 'h'
      : s.duration + ' min'}
                </td>

                <td>
                  ${brl(s.price)}
                </td>

                <td style="white-space:nowrap;">

                  <button
                    class="btn btn-ghost btn-sm"
                    data-edit-service="${s.id}"
                    data-carwash-id="${cw.id}">
                    ✏️
                  </button>

                  <button
                    class="btn btn-danger-outline btn-sm"
                    data-delete-service="${s.id}"
                    data-carwash-id="${cw.id}">
                    🗑️
                  </button>

                </td>

              </tr>
            `).join('')}

          </tbody>

        </table>

      ` : `

        <div class="empty-state">
          <div class="ic">🧽</div>
          <p>Esta lavação ainda não possui serviços.</p>

          <button
            class="btn btn-primary btn-sm"
            id="addCarwashServiceBtn">
            + Adicionar primeiro serviço
          </button>
        </div>

      `}

    </div>
  `;

  return adminShell('carwashes', inner);
}
function renderCarwashServiceModal(carwashId, serviceId = null) {

  const cw = DB.carwashes.find(c => c.id === carwashId);

  if (!cw) return '';

  const service = serviceId
    ? cw.services.find(s => s.id === serviceId)
    : null;

  return `
    <div class="modal-overlay" id="serviceModal">

      <div class="modal">

        <button
          class="modal-close"
          id="closeServiceModal">
          ✕
        </button>

        <h2>
          ${service ? 'Editar serviço' : 'Novo serviço'}
        </h2>

        <p class="modal-sub">
          ${cw.name}
        </p>

        <form id="carwashServiceForm"
              data-carwash-id="${carwashId}"
              data-service-id="${serviceId || ''}">

          <label>
            Nome do serviço

            <input
              type="text"
              id="serviceName"
              value="${service?.name || ''}"
              placeholder="Ex: Lavagem completa"
              required>
          </label>

          <label>
            Descrição

            <textarea
              id="serviceDesc"
              rows="3"
              placeholder="Descreva o serviço..."
              required>${service?.desc || ''}</textarea>
          </label>

          <label>
            Duração

            <input
              type="number"
              id="serviceDuration"
              min="5"
              step="5"
              value="${service?.duration || 60}"
              placeholder="60"
              required>
          </label>

          <label>
            Preço

            <input
              type="number"
              id="servicePrice"
              min="0"
              step="0.01"
              value="${service?.price || ''}"
              placeholder="50.00"
              required>
          </label>

          <button
            type="submit"
            class="btn btn-primary btn-block">
            ${service ? 'Salvar alterações' : 'Adicionar serviço'}
          </button>

        </form>

      </div>

    </div>
  `;
}
function renderAdminAddCarwash() {
  const inner = `
    <div class="admin-top">
      <h1>Adicionar lavação</h1>
    </div>

    <div class="panel" style="max-width:700px;">
      <h3>Nova lavação</h3>
      <p style="font-size:13.5px;color:var(--text-soft);margin:8px 0 20px;">
        Cadastre uma nova lavação parceira na plataforma.
      </p>

      <form id="addCarwashForm">

        <label>
          Nome da lavação
          <input type="text" id="newCwName"
                 placeholder="Ex: Brilho Car"
                 required>
        </label>

        <label>
          Nome do responsável
          <input type="text" id="newCwOwner"
                 placeholder="Nome do responsável"
                 required>
        </label>

        <label>
          E-mail de acesso
          <input type="email" id="newCwEmail"
                 placeholder="contato@lavacao.com"
                 required>
        </label>

        <label>
          Senha
          <input type="password" id="newCwPassword"
                 placeholder="Senha para acessar o painel"
                 required>
        </label>

        <label>
          Telefone
          <input type="tel" id="newCwPhone"
                 placeholder="(48) 99999-9999"
                 required>
        </label>

        <label>
          Endereço
          <input type="text" id="newCwAddress"
                 placeholder="Rua, número — Palhoça, SC"
                 required>
        </label>

        <label>
          Horário de funcionamento
          <input type="text" id="newCwHours"
                 value="08:00 – 18:00"
                 required>
        </label>

        <label>
          Emoji/ícone
          <input type="text" id="newCwEmoji"
                 value="🚗"
                 maxlength="2">
        </label>

        <button type="submit"
                class="btn btn-primary"
                style="margin-top:20px;">
          + Cadastrar lavação
        </button>

      </form>
    </div>
  `;

  return adminShell('add-carwash', inner);
}

/* ---------------------------- MASTER RENDER ---------------------------- */
function renderProtectedGuard(requiredType) {
  const u = currentUser();
  if (!u) { openModal('login'); return false; }
  if (requiredType && u.type !== requiredType) { toast('Acesso não permitido para este tipo de conta', 'error'); return false; }
  return true;
}

function render() {
  const app = $('#app');
  $('#siteFooter').classList.toggle('hidden', route.name.startsWith('admin'));

  switch (route.name) {
    case 'home': app.innerHTML = renderHome(); break;
    case 'washes': app.innerHTML = renderWashesList(); break;
    case 'wash-detail': app.innerHTML = renderWashDetail(route.params.id); break;
    case 'booking':
      if (!renderProtectedGuard('client')) { go('home'); return; }
      app.innerHTML = renderBooking(); break;
    case 'booking-confirm':
      if (!renderProtectedGuard('client')) { go('home'); return; }
      app.innerHTML = renderBookingConfirm(); break;
    case 'client-appointments':
      if (!renderProtectedGuard('client')) { go('home'); return; }
      app.innerHTML = renderClientAppointments(route.params.tab || 'proximos'); break;
    case 'client-vehicles':
      if (!renderProtectedGuard('client')) { go('home'); return; }
      app.innerHTML = renderClientVehicles(); break;
    case 'client-profile':
      if (!renderProtectedGuard('client')) { go('home'); return; }
      app.innerHTML = renderClientProfile(); break;
    case 'admin-dashboard':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminDashboard(); break;
    case 'admin-agenda':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminAgenda(); break;
    case 'admin-services':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminServices(); break;
    case 'admin-clients':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminClients(); break;
    case 'admin-carwashes':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminCarwashes(); break;
    case 'admin-edit-carwash':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminEditCarwash(route.params.id); break;
    case 'admin-manage-services':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminManageServices(route.params.id); break;
    case 'admin-add-carwash':
      if (!renderProtectedGuard('admin')) { go('home'); return; }
      app.innerHTML = renderAdminAddCarwash(); break;
    default: app.innerHTML = renderHome();
  }
  renderHeader();
}

/* ---------------------------- EVENT DELEGATION ---------------------------- */
document.addEventListener('click', (e) => {
  // Generic nav
  const navEl = e.target.closest('[data-nav]');
  if (navEl) {
    e.preventDefault();
    const name = navEl.dataset.nav;
    if (name === 'services-anchor') {
      if (route.name !== 'home') go('home');
      setTimeout(() => document.getElementById('services-anchor')?.scrollIntoView({ behavior: 'smooth' }), 60);
      return;
    }
    if (name === 'how') {
      if (route.name !== 'home') go('home');
      setTimeout(() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }), 60);
      return;
    }
    $('#userMenu').classList.add('hidden');
    go(name);
    return;
  }

  // Modal open/close
  const openEl = e.target.closest('[data-open]');
  if (openEl) {
    e.preventDefault();
    const which = openEl.dataset.open;
    if (which === 'usermenu') { $('#userMenu').classList.toggle('hidden'); return; }
    openModal(which);
    return;
  }
  if (e.target.closest('[data-close]') || e.target.id === 'modalOverlay') { closeModal(); return; }
  if (e.target.closest('.modal')) { /* prevent overlay close when clicking inside */ }

  // Close user menu on outside click
  if (!e.target.closest('#userChip') && !e.target.closest('#userMenu')) {
    $('#userMenu')?.classList.add('hidden');
  }

  // Logout
  if (e.target.id === 'logoutBtn') { setSession(null); go('home'); toast('Você saiu da sua conta'); return; }

  // Tab switches inside modals
  const tabBtn = e.target.closest('.tab-btn');
  if (tabBtn) {
    const parent = tabBtn.closest('.tab-switch');
    $$('.tab-btn', parent).forEach(b => b.classList.remove('active'));
    tabBtn.classList.add('active');
    if (parent.closest('#loginModal')) updateLoginHint();
    if (parent.closest('#registerModal')) {
      const isAdmin = tabBtn.dataset.role === 'admin';
      $('#regBizLabel').classList.toggle('hidden', !isAdmin);
      $('#regBizName').required = isAdmin;
    }
    return;
  }

  // Go to wash detail
  const gotoWash = e.target.closest('[data-goto-wash]');
  if (gotoWash) { e.preventDefault(); go('wash-detail', { id: gotoWash.dataset.gotoWash }); return; }

  // Filter chip on home
  const chip = e.target.closest('.chip-card');
  if (chip) {
    activeFilter = chip.dataset.filter || '';
    refreshHomeGrid();
    const input = $('#searchQuery'); if (input) input.value = activeFilter;
    document.getElementById('services-anchor')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Search buttons
  if (e.target.id === 'searchBtn') {
    activeFilter = $('#searchQuery').value.trim();
    refreshHomeGrid();
    document.getElementById('services-anchor')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (e.target.id === 'searchBtnWashes') {
    activeFilter = $('#searchQueryWashes').value.trim();
    go('washes');
    return;
  }

  // Notification bell (demo)
  if (e.target.id === 'notifBtn') {
    toast('Você não tem novas notificações no momento.');
    return;
  }

  // Book a specific service
  const bookService = e.target.closest('[data-book-service]');
  if (bookService) { startBooking(route.params.id, bookService.dataset.bookService); return; }

  // Calendar navigation
  const calNav = e.target.closest('[data-cal-nav]');
  if (calNav) {
    let m = bookingState.calMonth + Number(calNav.dataset.calNav);
    let y = bookingState.calYear;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    bookingState.calMonth = m; bookingState.calYear = y;
    $('#calendarBox').innerHTML = calendarHTML();
    return;
  }
  // Pick date
  const pickDate = e.target.closest('[data-pick-date]');
  if (pickDate) {
    bookingState.date = pickDate.dataset.pickDate;
    bookingState.time = null;
    $('#calendarBox').innerHTML = calendarHTML();
    $('#timeGridBox').innerHTML = timeSlotsHTML();
    $('#sumDate').textContent = fmtDateHuman(bookingState.date);
    $('#sumTime').textContent = '—';
    return;
  }
  // Pick time
  const pickTime = e.target.closest('[data-pick-time]');
  if (pickTime) {
    bookingState.time = pickTime.dataset.pickTime;
    $('#timeGridBox').innerHTML = timeSlotsHTML();
    $('#sumTime').textContent = bookingState.time;
    return;
  }
  // Pick vehicle
  const pickVehicle = e.target.closest('[data-pick-vehicle]');
  if (pickVehicle) {
    bookingState.vehicleId = pickVehicle.dataset.pickVehicle;
    $('#app').innerHTML = renderBooking();
    return;
  }  // Add vehicle inline (from booking) or from vehicles page
  if (e.target.id === 'addVehicleInline' || e.target.closest('#addVehicleCard')) {
    const model = prompt('Modelo do veículo (ex: Honda Civic):');
    if (!model) return;
    const plate = prompt('Placa (ex: ABC-1234):');
    if (!plate) return;
    const year = prompt('Ano:', '2022') || '2022';
    const color = prompt('Cor:', 'Prata') || 'Prata';
    const v = { id: uid('veh'), userId: currentUser().id, model, plate: plate.toUpperCase(), year: Number(year), color };
    DB.vehicles.push(v); saveDB();
    toast('Veículo adicionado!', 'success');
    if (route.name === 'booking') { bookingState.vehicleId = v.id; $('#app').innerHTML = renderBooking(); }
    else render();
    return;
  }
  // Delete vehicle
  const delVeh = e.target.closest('[data-del-vehicle]');
  if (delVeh) {
    DB.vehicles = DB.vehicles.filter(v => v.id !== delVeh.dataset.delVehicle);
    saveDB(); render(); toast('Veículo removido');
    return;
  }
  // Confirm booking
  if (e.target.id === 'confirmBookingBtn') {
    if (!bookingState.date || !bookingState.time) { toast('Selecione data e horário', 'error'); return; }
    const chosenVehicle = DB.vehicles.find(v => v.id === bookingState.vehicleId);
    const cwBooked = DB.carwashes.find(c => c.id === bookingState.carwashId);
    const serviceBooked = cwBooked.services.find(s => s.id === bookingState.serviceId);
    const shuttleOn = !!(cwBooked.shuttleService && bookingState.needsShuttle);
    const appt = {
      id: uid('appt'), userId: currentUser().id, carwashId: bookingState.carwashId, serviceId: bookingState.serviceId,
      vehicleId: bookingState.vehicleId || null, date: bookingState.date, time: bookingState.time, status: 'confirmado',
      price: serviceBooked.price + (shuttleOn ? (cwBooked.shuttleFee || 0) : 0),
      clientName: currentUser().name, plate: chosenVehicle ? chosenVehicle.plate : '—',
      needsShuttle: shuttleOn, shuttleAddress: shuttleOn ? (bookingState.shuttleAddress || '') : '',
      shuttleStatus: shuttleOn ? 'solicitado' : null,
    };
    DB.appointments.push(appt); saveDB();
    go('booking-confirm');
    return;
  }
  // Appointment tabs
  const apptTab = e.target.closest('[data-appt-tab]');
  if (apptTab) { go('client-appointments', { tab: apptTab.dataset.apptTab }); return; }

  // Cancel appointment
  const cancelAppt = e.target.closest('[data-cancel-appt]');
  if (cancelAppt) {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      const a = DB.appointments.find(a => a.id === cancelAppt.dataset.cancelAppt);
      a.status = 'cancelado'; saveDB(); render(); toast('Agendamento cancelado');
    }
    return;
  }
  // Rate appointment
  const rateAppt = e.target.closest('[data-rate-appt]');
  if (rateAppt) { openRatingPrompt(rateAppt.dataset.rateAppt); return; }

  // Admin tabs
  const adminTab = e.target.closest('[data-admin-tab]');
  if (adminTab) { go('admin-' + adminTab.dataset.adminTab); return; }
  // Editar lavação
  const editCarwash = e.target.closest('[data-edit-carwash]');
  if (editCarwash) {
    const id = editCarwash.dataset.editCarwash;
    go('admin-edit-carwash', { id });
    return;
  }
  // Editar serviços
  const manageServices = e.target.closest('[data-manage-services]');
  if (manageServices) {
    const id = manageServices.dataset.manageServices;
    go('admin-manage-services', { id });
    return;
  }
  if (e.target.closest('#addCarwashServiceBtn')) {
    const button = e.target.closest('#addCarwashServiceBtn');
    const panel = button.closest('.admin-shell');
    const currentCarwashId =
      route.params.id;
    document.body.insertAdjacentHTML(
      'beforeend',
      renderCarwashServiceModal(currentCarwashId));
    return;
  }
  // Delete service (admin)
  const delService = e.target.closest('[data-del-service]');
  if (delService) {
    const u = currentUser();
    const cw = DB.carwashes.find(c => c.id === u.carwashId);
    cw.services = cw.services.filter(s => s.id !== delService.dataset.delService);
    saveDB(); render(); toast('Serviço removido');
    return;
  }
  // Add service (admin)
  if (e.target.id === 'addServiceBtn') {
    const name = prompt('Nome do serviço:');
    if (!name) return;
    const price = Number(prompt('Preço (ex: 50):', '50')) || 0;
    const duration = Number(prompt('Duração em minutos (ex: 60):', '60')) || 60;
    const desc = prompt('Descrição curta:', '') || '';
    const u = currentUser();
    const cw = DB.carwashes.find(c => c.id === u.carwashId);
    cw.services.push({ id: uid('svc'), name, desc, duration, price });
    saveDB(); render(); toast('Serviço adicionado!', 'success');
    return;
  }
});

function openRatingPrompt(apptId) {
  const rating = prompt('Sua nota para o serviço (1 a 5):', '5');
  if (!rating) return;
  const comment = prompt('Deixe um comentário (opcional):', '') || '';
  const a = DB.appointments.find(a => a.id === apptId);
  a.reviewed = true;
  DB.reviews.push({ id: uid('rev'), carwashId: a.carwashId, clientName: currentUser().name, rating: Math.max(1, Math.min(5, Number(rating) || 5)), comment, date: isoDate(new Date()) });
  saveDB(); render(); toast('Obrigado pela sua avaliação!', 'success');
}

/* ---------------------------- CHANGE / INPUT (shuttle toggle & address) ---------------------------- */
document.addEventListener('change', (e) => {
  if (e.target.id === 'shuttleToggle') {
    bookingState.needsShuttle = e.target.checked;
    if (!bookingState.needsShuttle) bookingState.shuttleAddress = '';
    $('#app').innerHTML = renderBooking();
  }
  if (e.target.id === 'toggleShuttleService') {
    const u = currentUser();
    const cw = DB.carwashes.find(c => c.id === u.carwashId);
    cw.shuttleService = e.target.checked;
    if (cw.shuttleService && !cw.shuttleRadiusKm) cw.shuttleRadiusKm = 5;
    saveDB(); render();
    toast(cw.shuttleService ? 'Leva e traz ativado! Agora aparece na busca dos clientes.' : 'Leva e traz desativado.', 'success');
  }
  if (e.target.id === 'shuttleFeeInput') {
    const u = currentUser();
    const cw = DB.carwashes.find(c => c.id === u.carwashId);
    cw.shuttleFee = Math.max(0, Number(e.target.value) || 0);
    saveDB();
  }
  if (e.target.id === 'shuttleRadiusInput') {
    const u = currentUser();
    const cw = DB.carwashes.find(c => c.id === u.carwashId);
    cw.shuttleRadiusKm = Math.max(1, Number(e.target.value) || 1);
    saveDB();
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'shuttleAddress') {
    bookingState.shuttleAddress = e.target.value;
    const sum = $('#sumShuttle');
    if (sum) sum.textContent = bookingState.shuttleAddress ? '🚐 ' + bookingState.shuttleAddress : '🚐 Solicitado';
  }
});

/* ---------------------------- FORMS ---------------------------- */
document.addEventListener('submit', (e) => {
  if (e.target.id === 'loginForm') {
    e.preventDefault();
    const role = $('#loginModal .tab-btn.active').dataset.role;
    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const user = DB.users.find(u => u.email.toLowerCase() === email && u.password === password && u.type === role);
    if (!user) {
      $('#loginError').textContent = 'E-mail, senha ou tipo de conta incorretos.';
      $('#loginError').classList.remove('hidden');
      return;
    }
    setSession(user);
    closeModal();
    toast(`Bem-vindo(a), ${user.name.split(' ')[0]}!`, 'success');
    go(role === 'admin' ? 'admin-dashboard' : 'home');
  }

  if (e.target.id === 'registerForm') {
    e.preventDefault();
    const role = $('#registerModal .tab-btn.active').dataset.role;
    const name = $('#regName').value.trim();
    const email = $('#regEmail').value.trim().toLowerCase();
    const phone = $('#regPhone').value.trim();
    const password = $('#regPassword').value;
    const bizName = $('#regBizName').value.trim();

    if (DB.users.some(u => u.email.toLowerCase() === email)) {
      $('#regError').textContent = 'Já existe uma conta com este e-mail.';
      $('#regError').classList.remove('hidden');
      return;
    }
    if (role === 'admin' && !bizName) {
      $('#regError').textContent = 'Informe o nome da sua lavação.';
      $('#regError').classList.remove('hidden');
      return;
    }

    const newUser = { id: uid('user'), type: role, name, email, phone, password };

    if (role === 'admin') {
      const cwId = uid('cw');
      DB.carwashes.push({
        id: cwId, name: bizName, ownerId: newUser.id, address: 'Endereço a definir — Palhoça, SC',
        distanceKm: 0.5, rating: 5.0, reviewsCount: 0, emoji: '🚗', tags: ['Novo parceiro'], hours: '08:00 – 18:00',
        shuttleService: false, shuttleRadiusKm: 5, shuttleFee: 0,
        services: [{ id: 's1', name: 'Lavagem Simples', desc: 'Lavagem externa completa', duration: 30, price: 35 }],
      });
      newUser.carwashId = cwId;
    }

    DB.users.push(newUser);
    saveDB();
    setSession(newUser);
    closeModal();
    toast(`Conta criada! Bem-vindo(a), ${name.split(' ')[0]}.`, 'success');
    go(role === 'admin' ? 'admin-dashboard' : 'home');
  }

  if (e.target.id === 'profileForm') {
    e.preventDefault();
    const u = currentUser();
    u.name = $('#pfName').value.trim();
    u.email = $('#pfEmail').value.trim();
    u.phone = $('#pfPhone').value.trim();
    saveDB(); renderHeader();
    toast('Perfil atualizado!', 'success');
  }
  if (e.target.id === 'addCarwashForm') {
    e.preventDefault();

    const name = $('#newCwName').value.trim();
    const ownerName = $('#newCwOwner').value.trim();
    const email = $('#newCwEmail').value.trim().toLowerCase();
    const password = $('#newCwPassword').value;
    const phone = $('#newCwPhone').value.trim();
    const address = $('#newCwAddress').value.trim();
    const hours = $('#newCwHours').value.trim();
    const emoji = $('#newCwEmoji').value.trim() || '🚗';

    // Verifica se o e-mail já existe
    if (DB.users.some(u => u.email.toLowerCase() === email)) {
      toast('Já existe uma conta com este e-mail.', 'error');
      return;
    }

    const userId = uid('user');
    const cwId = uid('cw');

    // Cria a nova lavação
    DB.carwashes.push({
      id: cwId,
      name: name,
      ownerId: userId,
      address: address,
      distanceKm: 0.5,
      rating: 5.0,
      reviewsCount: 0,
      emoji: emoji,
      tags: ['Novo parceiro'],
      hours: hours,
      shuttleService: false,
      shuttleRadiusKm: 5,
      shuttleFee: 0,

      services: [
        {
          id: uid('svc'),
          name: 'Lavagem Simples',
          desc: 'Lavagem externa completa',
          duration: 30,
          price: 35
        }
      ]
    });

    // Cria o usuário administrador da lavação
    DB.users.push({
      id: userId,
      type: 'admin',
      name: ownerName,
      email: email,
      password: password,
      phone: phone,
      carwashId: cwId
    });

    saveDB();

    toast('Lavação cadastrada com sucesso!', 'success');

    // Volta para o dashboard
    go('admin-dashboard');

    return;
  }
  const serviceForm = e.target.closest('#carwashServiceForm');

  if (serviceForm) {

    e.preventDefault();

    const carwashId = serviceForm.dataset.carwashId;
    const serviceId = serviceForm.dataset.serviceId;

    const cw = DB.carwashes.find(c => c.id === carwashId);

    if (!cw) return;

    if (!cw.services) {
      cw.services = [];
    }

    const serviceData = {
      id: serviceId || 'service-' + Date.now(),
      name: $('#serviceName').value.trim(),
      desc: $('#serviceDesc').value.trim(),
      duration: Number($('#serviceDuration').value),
      price: Number($('#servicePrice').value)
    };

    if (serviceId) {

      const index = cw.services.findIndex(
        s => s.id === serviceId
      );

      if (index !== -1) {
        cw.services[index] = serviceData;
      }

    } else {

      cw.services.push(serviceData);

    }

    saveDB();

    $('#serviceModal')?.remove();

    render();

    return;
  }
});

/* ---------------------------- HAMBURGER (mobile) ---------------------------- */
$('#hamburgerBtn')?.addEventListener('click', () => {
  const nav = $('#mainNav');
  const isOpen = nav.classList.toggle('mobile-open');
  nav.style.display = isOpen ? 'flex' : '';
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    const nav = $('#mainNav');
    nav.classList.remove('mobile-open');
    nav.style.display = '';
  }
});
$('#mainNav')?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    const nav = $('#mainNav');
    nav.classList.remove('mobile-open');
    nav.style.display = '';
  }
});

/* ---------------------------- ENTER-TO-SEARCH ---------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (e.target.id === 'searchQuery') { $('#searchBtn')?.click(); }
    if (e.target.id === 'searchQueryWashes') { $('#searchBtnWashes')?.click(); }
  }
  if (e.key === 'Escape') {
    if (!$('#modalOverlay').classList.contains('hidden')) closeModal();
    $('#userMenu')?.classList.add('hidden');
  }
});

/* ---------------------------- INIT ---------------------------- */
render();
