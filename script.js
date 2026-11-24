/* ============================================================
   MEGHANA FOODS — SCRIPT.JS (Enhanced & Dynamic)
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

// 3. DATA & FETCHING
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4EcDOZXtklGKtJ5HJYQDxpjLJRffVwZEFvqkMoyihYtaAK9tPWQ25X9uMunhKWEaO4oqe8DZMdV9A/pub?gid=341667772&single=true&output=csv';

let allReviews = [];
let charts = {};

async function fetchReviewsFromSheet() {
  try {
    const cacheBuster = `&t=${new Date().getTime()}`;
    const res = await fetch(SHEET_CSV_URL + cacheBuster);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    const parsed = parseCSV(csv);
    return parsed.length ? parsed : [];
  } catch (err) {
    console.error('Failed to fetch data:', err);
    return [];
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
    if (!obj.sentiment_label) obj.sentiment_label = getSentimentFromText(obj.review_text);
    if (obj.review_text) results.push(obj);
  }
  return results;
}

function getSentimentFromText(text) {
    if (!text) return 'Neutral';
    const t = text.toLowerCase();
    const posWords = ['great', 'good', 'love', 'best', 'delicious', 'amazing', 'awesome', 'friendly', 'perfect', 'tasty', 'worth'];
    const negWords = ['bad', 'worst', 'hate', 'rude', 'stale', 'cold', 'late', 'overpriced', 'disappointed', 'terrible', 'awful'];
    let score = 0;
    posWords.forEach(w => { if (t.includes(w)) score++; });
    negWords.forEach(w => { if (t.includes(w)) score--; });
    if (score > 0) return 'Positive';
    if (score < 0) return 'Negative';
    return 'Neutral';
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

// 4. DASHBOARD
async function initDashboard() {
  allReviews = await fetchReviewsFromSheet();
  updateKPIs(allReviews);
  buildCharts(allReviews);

  ['filter-branch', 'filter-sentiment', 'filter-start', 'filter-end'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  const dates = allReviews.map(r => r.review_date).sort();
  if (dates.length > 0) {
      document.getElementById('filter-start').value = dates[0];
      document.getElementById('filter-end').value = dates[dates.length - 1];
      document.getElementById('slider-label-min').innerText = dates[0];
      document.getElementById('slider-label-max').innerText = dates[dates.length - 1];
  }
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

function updateKPIs(reviews) {
  const k = calcKPIs(reviews);
  if(document.getElementById('kpi-total')) document.getElementById('kpi-total').innerText = k.total;
  if(document.getElementById('kpi-positive')) document.getElementById('kpi-positive').innerText = k.pos + '%';
  if(document.getElementById('kpi-negative')) document.getElementById('kpi-negative').innerText = k.neg + '%';
  if(document.getElementById('kpi-avg-rating')) document.getElementById('kpi-avg-rating').innerText = k.avg;
}

// 5. CHART RENDERING
function buildCharts(reviews) {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#666';

  const ctx1 = document.getElementById('chart-sentiment')?.getContext('2d');
  if (ctx1) {
    charts.sentiment = new Chart(ctx1, {
      type: 'doughnut',
      data: { labels: ['Positive', 'Neutral', 'Negative'], datasets: [{ data: [0,0,0], backgroundColor: ['#059669', '#D97706', '#DC2626'], borderWidth: 0 }] },
      options: { cutout: '70%', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    updateSentimentChart(reviews);
  }

  const ctx2 = document.getElementById('chart-volume')?.getContext('2d');
  if (ctx2) {
    charts.volume = new Chart(ctx2, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Total Reviews', data: [], borderColor: '#b8912e', tension: 0.4, fill: true, backgroundColor: 'rgba(184,145,46,0.05)' }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
    updateVolumeChart(reviews);
  }

  const ctx3 = document.getElementById('chart-branch')?.getContext('2d');
  if (ctx3) {
    charts.branch = new Chart(ctx3, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Total Reviews', data: [], backgroundColor: '#b8912e', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
    updateBranchChart(reviews);
  }

  const ctx4 = document.getElementById('chart-aspects')?.getContext('2d');
  if (ctx4) {
    charts.aspects = new Chart(ctx4, {
      type: 'radar',
      data: { labels: ['Taste', 'Service', 'Delivery', 'Price', 'Hygiene'], datasets: [{ label: 'Score', data: [0,0,0,0,0], backgroundColor: 'rgba(184, 145, 46, 0.2)', borderColor: '#b8912e' }] },
      options: { scales: { r: { min: 0, max: 5 } }, responsive: true, maintainAspectRatio: false }
    });
    updateAspectChart(reviews);
  }
}

function updateCharts(reviews) {
  updateSentimentChart(reviews);
  updateVolumeChart(reviews);
  updateBranchChart(reviews);
  updateAspectChart(reviews);
}

function updateSentimentChart(reviews) {
  if (!charts.sentiment) return;
  const pos = reviews.filter(r=>r.sentiment_label==='Positive').length;
  const neu = reviews.filter(r=>r.sentiment_label==='Neutral').length;
  const neg = reviews.filter(r=>r.sentiment_label==='Negative').length;
  charts.sentiment.data.datasets[0].data = [pos, neu, neg];
  charts.sentiment.update();
}

function updateVolumeChart(reviews) {
  if (!charts.volume) return;
  const monthCounts = {};
  reviews.forEach(r => { const ym = r.review_date.slice(0, 7); monthCounts[ym] = (monthCounts[ym] || 0) + 1; });
  const labels = Object.keys(monthCounts).sort();
  charts.volume.data.labels = labels;
  charts.volume.data.datasets[0].data = labels.map(l => monthCounts[l]);
  charts.volume.update();
}

function updateBranchChart(reviews) {
  if (!charts.branch) return;
  const branchCounts = { 'Jayanagar': 0, 'Koramangala': 0, 'Indiranagar': 0 };
  reviews.forEach(r => { if (branchCounts[r.branch] !== undefined) branchCounts[r.branch]++; });
  const labels = ['Jayanagar', 'Koramangala', 'Indiranagar'];
  charts.branch.data.labels = labels;
  charts.branch.data.datasets[0].data = labels.map(l => branchCounts[l]);
  charts.branch.update();
}

function updateAspectChart(reviews) {
  if (!charts.aspects) return;
  const keywords = {
    taste: ['taste','flavor','spice','biryani','chicken','paneer','delicious','divine','cook'],
    service: ['service','staff','waiter','attend','friendly','courteous','helpful','rude'],
    delivery: ['delivery','late','fast','quick','cold','arrive','order','package'],
    price: ['price','value','money','worth','expensive','cheap','cost','overpriced'],
    hygiene: ['hygiene','clean','hair','dirty','fresh','quality']
  };
  const scores = Object.values(keywords).map(words => {
    let totalHits = 0, positiveHits = 0;
    reviews.forEach(r => {
      const text = r.review_text.toLowerCase();
      if (words.some(w => text.includes(w))) {
        totalHits++;
        if (r.sentiment_label === 'Positive') positiveHits++;
      }
    });
    return totalHits > 0 ? (positiveHits / totalHits) * 5 : 0;
  });
  charts.aspects.data.datasets[0].data = scores;
  charts.aspects.update();
}

// 6. TEXT MINING
async function initMiningPage() {
  allReviews = await fetchReviewsFromSheet();
  renderWordCloud();
  renderBigrams();
  renderTable(allReviews);

  document.getElementById('table-search')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allReviews.filter(r => r.review_text.toLowerCase().includes(query) || r.reviewer_name.toLowerCase().includes(query));
      renderTable(filtered);
  });
}

function renderWordCloud() {
  const wc = document.getElementById('wordcloud-container');
  if (!wc) return;
  wc.innerHTML = '';
  const posText = allReviews.filter(r => r.sentiment_label === 'Positive').map(r => r.review_text).join(' ').toLowerCase();
  const words = posText.replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const counts = {};
  words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  const topWords = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 15);
  
  topWords.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'wordcloud-word';
    span.textContent = w[0].charAt(0).toUpperCase() + w[0].slice(1);
    span.style.fontSize = (2.5 - i*0.15) + 'rem';
    span.style.color = 'var(--accent)';
    wc.appendChild(span);
  });
}

function renderBigrams() {
  const list = document.getElementById('bigrams-list');
  if (!list) return;
  const negText = allReviews.filter(r => r.sentiment_label === 'Negative').map(r => r.review_text).join(' ').toLowerCase();
  const words = negText.replace(/[^a-z\s]/g, '').split(/\s+/);
  const bigrams = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bg = words[i] + ' ' + words[i+1];
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const topBg = Object.entries(bigrams).sort((a,b) => b[1]-a[1]).slice(0, 5);
  list.innerHTML = topBg.map((b, i) => `<li class="phrase-item"><div class="phrase-rank">${i+1}</div><div><div class="phrase-text">"${b[0]}"</div><div class="phrase-count">${b[1]} mentions</div></div></li>`).join('');
}

function renderTable(data) {
  const tbody = document.getElementById('reviews-tbody');
  if (tbody) {
    tbody.innerHTML = data.slice(0, 15).map(r => `<tr><td>${r.reviewer_name}</td><td>${r.review_text}</td><td>${r.branch}</td><td><span class="badge badge-${r.sentiment_label.toLowerCase()}">${r.sentiment_label}</span></td></tr>`).join('');
  }
}

// 7. MENU & HOME
const MENU_ITEMS = [
  { name: 'Boneless Chicken Biryani', desc: 'Tender boneless chicken pieces slow-cooked with fragrant basmati rice, whole spices, and saffron.', price: 'Rs. 389' },
  { name: 'Meghana Special Biryani', desc: 'Our signature dish. Rich, spiced chicken layered with premium long-grain rice.', price: 'Rs. 429' },
  { name: 'Paneer Biryani', desc: 'Silky cottage cheese cubes marinated in yogurt and spices, layered with aromatic saffron rice.', price: 'Rs. 299' },
  { name: 'Chicken 555', desc: 'Crispy fried chicken tossed in a fiery Chettinad masala with curry leaves and chillies.', price: 'Rs. 289' }
];

async function initMenuPage() {
  allReviews = await fetchReviewsFromSheet();
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  // Calculate dynamic ratings by finding reviews that mention the dish
  const menuWithRatings = MENU_ITEMS.map(item => {
    const dishName = item.name.toLowerCase().replace('biryani', '').trim(); 
    const reviewsForDish = allReviews.filter(r => r.review_text.toLowerCase().includes(dishName));
    
    let avgRating = "No Reviews";
    if (reviewsForDish.length > 0) {
        const sum = reviewsForDish.reduce((acc, r) => acc + r.star_rating, 0);
        avgRating = (sum / reviewsForDish.length).toFixed(1);
    }
    return { ...item, rating: avgRating };
  });

  grid.innerHTML = menuWithRatings.map(item => `
    <div class="menu-card">
      <div class="menu-img-placeholder">Image</div>
      <div class="menu-content">
        <h3 class="menu-title">${item.name}</h3>
        <p class="menu-desc">${item.desc}</p>
        <div class="menu-footer">
          <span class="menu-price">${item.price}</span>
          <span class="menu-rating">${item.rating === 'No Reviews' ? 'New' : '★ ' + item.rating}</span>
        </div>
      </div>
    </div>
  `).join('');

  setupReviewForm();
}

function setupReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Gather form data (In a real app, you'd POST this to a backend or Google Form)
    const formData = {
      name: document.getElementById('reviewer-name').value,
      dish: document.getElementById('dish-select').value,
      branch: document.getElementById('branch-select').value,
      sentiment: document.getElementById('sentiment-select').value,
      text: document.getElementById('review-text').value,
      date: new Date().toISOString().slice(0, 10)
    };

    console.log('New Review Submitted:', formData);
    
    // Simulate successful submission
    form.reset();
    alert('Thank you! Your review has been submitted successfully.');
  });
}

async function initHomePage() {
  const liveData = await fetchReviewsFromSheet();
  const kpi = calcKPIs(liveData);
  if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = kpi.total;
  if (document.getElementById('stat-pos')) document.getElementById('stat-pos').innerText = kpi.pos + '%';
  if (document.getElementById('stat-rating')) document.getElementById('stat-rating').innerText = kpi.avg;
}

// 8. ROUTER & PDF EXPORT
document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  if (path.includes('dashboard')) await initDashboard();
  else if (path.includes('mining')) await initMiningPage();
  else if (path.includes('menu')) await initMenuPage();
  else await initHomePage();
});

function exportDashboardPDF() {
    const element = document.querySelector('.container');
    const opt = {
      margin:       0.5,
      filename:     'Meghana_Analytics_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}