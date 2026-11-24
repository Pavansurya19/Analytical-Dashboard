/* ============================================================
   MEGHANA FOODS — SCRIPT.JS
   ============================================================ */

// 1. CUSTOM CURSOR
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

if (cursorDot && cursorRing) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, select, input, .card, .menu-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering-cursor'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-cursor'));
  });
}

// 2. SCROLL REVEAL
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}
initScrollReveal();

// 3. DATA CONFIG & FETCHING
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4EcDOZXtklGKtJ5HJYQDxpjLJRffVwZEFvqkMoyihYtaAK9tPWQ25X9uMunhKWEaO4oqe8DZMdV9A/pub?gid=341667772&single=true&output=csv';

const DUMMY_REVIEWS = [
  { record_id:1, reviewer_name:'Arjun S.', review_date:'2024-01-05', star_rating:5, review_text:'The Boneless Chicken Biryani is absolutely divine!', branch:'Jayanagar', sentiment_label:'Positive' },
  { record_id:2, reviewer_name:'Priya M.', review_date:'2024-01-10', star_rating:2, review_text:'The delivery was very late and the food was cold.', branch:'Koramangala', sentiment_label:'Negative' },
  { record_id:3, reviewer_name:'Rahul P.', review_date:'2024-01-15', star_rating:4, review_text:'Great taste and value for money.', branch:'Indiranagar', sentiment_label:'Positive' }
];

let allReviews = [...DUMMY_REVIEWS];
let charts = {};

async function fetchReviewsFromSheet() {
  try {
    const cacheBuster = `&t=${new Date().getTime()}`;
    const res = await fetch(SHEET_CSV_URL + cacheBuster);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    const parsed = parseCSV(csv);
    return parsed.length ? parsed : DUMMY_REVIEWS;
  } catch (err) {
    console.warn('Fallback to dummy data due to fetch error.', err);
    return DUMMY_REVIEWS;
  }
}

function parseCSV(csv) {
  const rows = []; let row = []; let val = ''; let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]; const next = csv[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') { val += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) { row.push(val); val = ''; }
    else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(val);
      if (row.some(v => v.trim() !== '')) rows.push(row);
      row = []; val = '';
    } else { val += char; }
  }
  if (val) { row.push(val); rows.push(row); }
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (rows[i][idx] || '').trim(); });
    obj.star_rating = parseFloat(obj.star_rating) || 0;
    obj.review_date = normaliseDate(obj.review_date || '');
    if (obj.review_text) results.push(obj);
  }
  return results;
}

function normaliseDate(raw) {
  if (!raw) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const ago = raw.match(/(\d+)\s+(day|month|year|week)s?\s+ago/i);
  if (ago) {
    const n = parseInt(ago[1]); const u = ago[2].toLowerCase(); const d = new Date();
    if (u === 'day') d.setDate(d.getDate() - n);
    if (u === 'week') d.setDate(d.getDate() - n * 7);
    if (u === 'month') d.setMonth(d.getMonth() - n);
    if (u === 'year') d.setFullYear(d.getFullYear() - n);
    return d.toISOString().slice(0, 10);
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

function calcKPIs(reviews) {
  if (!reviews.length) return { total:0, pos:0, neg:0, avg:0 };
  const p = reviews.filter(r => r.sentiment_label === 'Positive').length;
  const n = reviews.filter(r => r.sentiment_label === 'Negative').length;
  const a = reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length;
  return { total: reviews.length, pos: Math.round(p/reviews.length*100), neg: Math.round(n/reviews.length*100), avg: a.toFixed(1) };
}

// 4. DASHBOARD INIT
async function initDashboard() {
  allReviews = await fetchReviewsFromSheet();
  updateKPIs(allReviews);
  buildCharts(allReviews);

  ['filter-branch', 'filter-sentiment', 'filter-start', 'filter-end'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  const dates = allReviews.map(r => r.review_date).sort();
  if(document.getElementById('filter-start')) document.getElementById('filter-start').value = dates[0] || '';
  if(document.getElementById('filter-end')) document.getElementById('filter-end').value = dates[dates.length - 1] || '';
}

function updateKPIs(reviews) {
  const k = calcKPIs(reviews);
  if(document.getElementById('kpi-total')) document.getElementById('kpi-total').innerText = k.total;
  if(document.getElementById('kpi-positive')) document.getElementById('kpi-positive').innerText = k.pos + '%';
  if(document.getElementById('kpi-negative')) document.getElementById('kpi-negative').innerText = k.neg + '%';
  if(document.getElementById('kpi-avg-rating')) document.getElementById('kpi-avg-rating').innerText = k.avg;
}

function applyFilters() {
  const b = document.getElementById('filter-branch')?.value || 'All';
  const s = document.getElementById('filter-sentiment')?.value || 'All';
  const start = document.getElementById('filter-start')?.value || '';
  const end = document.getElementById('filter-end')?.value || '';
  
  const filtered = allReviews.filter(r => {
    if (b !== 'All' && r.branch !== b) return false;
    if (s !== 'All' && r.sentiment_label !== s) return false;
    if (start && r.review_date < start) return false;
    if (end && r.review_date > end) return false;
    return true;
  });
  updateKPIs(filtered);
  updateCharts(filtered);
}

function buildCharts(reviews) {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#666';

  // Doughnut
  const ctx1 = document.getElementById('chart-sentiment')?.getContext('2d');
  if (ctx1) {
    charts.sentiment = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{ data: [reviews.filter(r=>r.sentiment_label==='Positive').length, reviews.filter(r=>r.sentiment_label==='Neutral').length, reviews.filter(r=>r.sentiment_label==='Negative').length], backgroundColor: ['#059669', '#D97706', '#DC2626'], borderWidth: 0 }]
      },
      options: { cutout: '70%', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  // Line
  const ctx2 = document.getElementById('chart-volume')?.getContext('2d');
  if (ctx2) {
    charts.volume = new Chart(ctx2, {
      type: 'line',
      data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Total', data: [10, 20, 15, 30, 25], borderColor: '#b8912e', tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // Bar
  const ctx3 = document.getElementById('chart-branch')?.getContext('2d');
  if (ctx3) {
    charts.branch = new Chart(ctx3, {
      type: 'bar',
      data: { labels: ['Jayanagar', 'Koramangala', 'Indiranagar'], datasets: [{ label: 'Positive', data: [15, 20, 18], backgroundColor: '#059669' }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // Radar
  const ctx4 = document.getElementById('chart-aspects')?.getContext('2d');
  if (ctx4) {
    charts.aspects = new Chart(ctx4, {
      type: 'radar',
      data: { labels: ['Taste', 'Service', 'Delivery', 'Price', 'Hygiene'], datasets: [{ label: 'Score', data: [4.5, 3.8, 3.2, 4.0, 4.2], backgroundColor: 'rgba(184, 145, 46, 0.2)', borderColor: '#b8912e' }] },
      options: { scales: { r: { min: 0, max: 5 } }, responsive: true, maintainAspectRatio: false }
    });
  }
}

function updateCharts(reviews) {
  if (charts.sentiment) {
    charts.sentiment.data.datasets[0].data = [reviews.filter(r=>r.sentiment_label==='Positive').length, reviews.filter(r=>r.sentiment_label==='Neutral').length, reviews.filter(r=>r.sentiment_label==='Negative').length];
    charts.sentiment.update();
  }
  // Rebuild other charts with filtered data...
}

// 5. MINING INIT
async function initMiningPage() {
  allReviews = await fetchReviewsFromSheet();
  
  const wc = document.getElementById('wordcloud-container');
  if (wc) {
    wc.innerHTML = '';
    ['Delicious', 'Authentic', 'Biryani', 'Service', 'Great', 'Spicy', 'Taste'].forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'wordcloud-word';
      span.textContent = w;
      span.style.fontSize = (2 - i*0.15) + 'rem';
      span.style.color = 'var(--accent)';
      wc.appendChild(span);
    });
  }

  const list = document.getElementById('bigrams-list');
  if (list) {
    list.innerHTML = [{p:'Late delivery', c:12}, {p:'Cold food', c:8}, {p:'Rude staff', c:5}].map((b, i) => `<li class="phrase-item"><div class="phrase-rank">${i+1}</div><div><div class="phrase-text">"${b.p}"</div><div class="phrase-count">${b.c} mentions</div></div></li>`).join('');
  }

  const tbody = document.getElementById('reviews-tbody');
  if (tbody) {
    tbody.innerHTML = allReviews.slice(0, 10).map(r => `<tr><td>${r.reviewer_name}</td><td>${r.review_text}</td><td>${r.branch}</td><td><span class="badge badge-${r.sentiment_label.toLowerCase()}">${r.sentiment_label}</span></td></tr>`).join('');
  }
}

// 6. MENU INIT
const MENU_ITEMS = [
  { name: 'Boneless Chicken Biryani', desc: 'Tender boneless chicken pieces slow-cooked with fragrant basmati rice, whole spices, and saffron.', price: 'Rs. 389', rating: 4.8 },
  { name: 'Meghana Special Biryani', desc: 'Our signature dish. Rich, spiced chicken layered with premium long-grain rice.', price: 'Rs. 429', rating: 4.9 },
  { name: 'Paneer Biryani', desc: 'Silky cottage cheese cubes marinated in yogurt and spices, layered with aromatic saffron rice.', price: 'Rs. 299', rating: 4.5 },
  { name: 'Chicken 555', desc: 'Crispy fried chicken tossed in a fiery Chettinad masala with curry leaves and chillies.', price: 'Rs. 289', rating: 4.7 }
];

function initMenuPage() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  grid.innerHTML = MENU_ITEMS.map(item => `
    <div class="menu-card">
      <div class="menu-img-placeholder">Image</div>
      <div class="menu-content">
        <h3 class="menu-title">${item.name}</h3>
        <p class="menu-desc">${item.desc}</p>
        <div class="menu-footer">
          <span class="menu-price">${item.price}</span>
          <span class="menu-rating">${item.rating} / 5.0</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function initHomePage() {
  // 1. Fetch the live data
  const liveData = await fetchReviewsFromSheet();
  const kpi = calcKPIs(liveData);

  // 2. Update the hardcoded HTML elements
  const totalEl = document.getElementById('stat-total');
  const posEl = document.getElementById('stat-pos');
  const ratingEl = document.getElementById('stat-rating');

  if (totalEl) totalEl.innerText = kpi.total;
  if (posEl) posEl.innerText = kpi.pos + '%';
  if (ratingEl) ratingEl.innerText = kpi.avg;
}

// 7. ROUTER
document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  
  if (path.includes('dashboard') || document.getElementById('kpi-total')) {
    await initDashboard();
  } else if (path.includes('mining') || document.getElementById('wordcloud-container')) {
    await initMiningPage();
  } else if (path.includes('menu') || document.getElementById('menu-grid')) {
    initMenuPage();
  } else {
    // This runs on the Home Page (index.html)
    await initHomePage();
  }
});