/**
 * =============================================================
 * MEGHANA FOODS — CUSTOMER INTELLIGENCE DASHBOARD
 * script.js — Shared JS (cursor, scroll-reveal, data, charts)
 * =============================================================
 */

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let animFrameId;

if (cursorDot && cursorRing) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    animFrameId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  document.querySelectorAll('a, button, .btn, .card, .dish-card, .menu-tab, .wc-tab').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.transform  = 'translate(-50%, -50%) scale(1.8)';
      cursorRing.style.width  = '52px';
      cursorRing.style.height = '52px';
      cursorRing.style.borderColor = 'rgba(255,107,53,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.transform  = 'translate(-50%, -50%) scale(1)';
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'rgba(255,107,53,0.6)';
    });
  });
}

/* ============================================================
   2. NAVBAR — Scroll & Mobile Toggle
   ============================================================ */
const navbar    = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Mark active nav link
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.href === location.href ||
      link.getAttribute('href') === location.pathname.split('/').pop()) {
    link.classList.add('active');
  }
});

/* ============================================================
   3. SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => io.observe(el));
}

initScrollReveal();

/* ============================================================
   4. ANIMATED COUNTER
   ============================================================ */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isFloat
      ? (eased * target).toFixed(1)
      : Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 1800, suffix);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

initCounters();

/* ============================================================
   5. DUMMY DATA — Mimics CSV from Google Sheets
   ============================================================
   GOOGLE SHEETS CSV URL:
   Replace the SHEET_CSV_URL constant below with your published
   Google Sheets CSV link, e.g.:
   https://docs.google.com/spreadsheets/d/SHEET_ID/pub?output=csv
   Then uncomment the fetchReviewsFromSheet() call.
   ============================================================ */
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4EcDOZXtklGKtJ5HJYQDxpjLJRffVwZEFvqkMoyihYtaAK9tPWQ25X9uMunhKWEaO4oqe8DZMdV9A/pub?gid=341667772&single=true&output=csv';

// columns: record_id, reviewer_name, review_date, star_rating,
//          review_text, branch, source_platform, sentiment_label
const DUMMY_REVIEWS = [
  // Positive — Jayanagar
  { record_id:1,  reviewer_name:'Arjun S.',      review_date:'2024-01-05', star_rating:5, review_text:'The Boneless Chicken Biryani is absolutely divine! Perfect spice levels, generous portions. Will come back every week!', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:2,  reviewer_name:'Priya M.',       review_date:'2024-01-10', star_rating:5, review_text:'Best biryani in Bangalore, hands down. The service is fast and the staff is very friendly.', branch:'Jayanagar',    source_platform:'Zomato',    sentiment_label:'Positive' },
  { record_id:3,  reviewer_name:'Ravi K.',        review_date:'2024-01-15', star_rating:4, review_text:'Great taste and value for money. The Paneer Biryani is a must try for vegetarians.', branch:'Jayanagar',    source_platform:'Swiggy',    sentiment_label:'Positive' },
  { record_id:4,  reviewer_name:'Sneha T.',       review_date:'2024-01-22', star_rating:5, review_text:'Amazing ambiance and even better food. Chicken 555 is to die for! Highly recommend.', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:5,  reviewer_name:'Mohit R.',       review_date:'2024-02-01', star_rating:5, review_text:'Consistently excellent food every single time. The biryani rice is perfectly cooked.', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Positive' },
  // Negative — Jayanagar
  { record_id:6,  reviewer_name:'Anjali V.',      review_date:'2024-02-05', star_rating:2, review_text:'The delivery was very late and the food was cold on arrival. Not happy with the packaging.', branch:'Jayanagar',    source_platform:'Swiggy',    sentiment_label:'Negative' },
  { record_id:7,  reviewer_name:'Deepak N.',      review_date:'2024-02-18', star_rating:1, review_text:'Wrong order delivered. Called customer service but got no response. Very disappointed.', branch:'Jayanagar',    source_platform:'Zomato',    sentiment_label:'Negative' },
  { record_id:8,  reviewer_name:'Kavya L.',       review_date:'2024-03-02', star_rating:2, review_text:'Portion size has reduced compared to before. Also the rice was undercooked. Poor quality lately.', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Negative' },
  // Neutral — Jayanagar
  { record_id:9,  reviewer_name:'Suresh B.',      review_date:'2024-03-10', star_rating:3, review_text:'Decent food, nothing extraordinary. The price is a bit high for what you get.', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Neutral'  },
  { record_id:10, reviewer_name:'Nita G.',        review_date:'2024-03-15', star_rating:3, review_text:'Average experience. Food was okay but service took a while. Would try again maybe.', branch:'Jayanagar',    source_platform:'Swiggy',    sentiment_label:'Neutral'  },
  // Positive — Koramangala
  { record_id:11, reviewer_name:'Rahul P.',       review_date:'2024-01-08', star_rating:5, review_text:'Koramangala branch is my go-to! The biryani is authentic and the portions are massive. Great value!', branch:'Koramangala',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:12, reviewer_name:'Meera S.',       review_date:'2024-01-20', star_rating:4, review_text:'Love the ambiance and the taste. Paneer dishes are excellent. Quick service too!', branch:'Koramangala',  source_platform:'Zomato',    sentiment_label:'Positive' },
  { record_id:13, reviewer_name:'Aditya J.',      review_date:'2024-02-03', star_rating:5, review_text:'Every time I order, it is a 5-star experience. The chicken gravy is outstanding!', branch:'Koramangala',  source_platform:'Swiggy',    sentiment_label:'Positive' },
  { record_id:14, reviewer_name:'Pooja R.',       review_date:'2024-02-12', star_rating:5, review_text:'Absolutely love this place! The staff is courteous and the food quality is top-notch!', branch:'Koramangala',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:15, reviewer_name:'Vikram H.',      review_date:'2024-02-28', star_rating:4, review_text:'Great food experience. Chicken 555 starter is a star dish. Definitely coming back!', branch:'Koramangala',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:16, reviewer_name:'Ananya C.',      review_date:'2024-03-08', star_rating:5, review_text:'The best biryani outside of Hyderabad. My family loved every dish. Huge fan!', branch:'Koramangala',  source_platform:'Google',    sentiment_label:'Positive' },
  // Negative — Koramangala
  { record_id:17, reviewer_name:'Rohit Y.',       review_date:'2024-01-25', star_rating:2, review_text:'Waited over an hour for delivery. Food quality was not up to the mark. Very slow service.', branch:'Koramangala',  source_platform:'Swiggy',    sentiment_label:'Negative' },
  { record_id:18, reviewer_name:'Divya K.',       review_date:'2024-03-05', star_rating:2, review_text:'Price increased but quality dropped. Not what it used to be. Sad decline.', branch:'Koramangala',  source_platform:'Zomato',    sentiment_label:'Negative' },
  // Neutral — Koramangala
  { record_id:19, reviewer_name:'Sunil M.',       review_date:'2024-03-20', star_rating:3, review_text:'Food was acceptable. Nothing special about the taste. Expected more for the price.', branch:'Koramangala',  source_platform:'Google',    sentiment_label:'Neutral'  },
  // Positive — Indiranagar
  { record_id:20, reviewer_name:'Kritika B.',     review_date:'2024-01-12', star_rating:5, review_text:'Indiranagar branch never disappoints! The Chicken Biryani is fragrant and delicious.', branch:'Indiranagar',  source_platform:'Zomato',    sentiment_label:'Positive' },
  { record_id:21, reviewer_name:'Ajay P.',        review_date:'2024-01-28', star_rating:4, review_text:'Really good food. The dum biryani technique is evident. Rice and meat ratio is perfect.', branch:'Indiranagar',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:22, reviewer_name:'Swati N.',       review_date:'2024-02-14', star_rating:5, review_text:'Celebrated my birthday here — wonderful experience! Staff was attentive and food was incredible!', branch:'Indiranagar',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:23, reviewer_name:'Kiran L.',       review_date:'2024-02-22', star_rating:5, review_text:'Perfect spice levels and portion size. The haleem is also fantastic. Very happy customer!', branch:'Indiranagar',  source_platform:'Swiggy',    sentiment_label:'Positive' },
  { record_id:24, reviewer_name:'Preethi S.',     review_date:'2024-03-11', star_rating:4, review_text:'Good quality and fast delivery. Would love a loyalty program though!', branch:'Indiranagar',  source_platform:'Zomato',    sentiment_label:'Positive' },
  // Negative — Indiranagar
  { record_id:25, reviewer_name:'Manohar R.',     review_date:'2024-01-30', star_rating:1, review_text:'Found a hair in the biryani. Completely ruined the experience. Hygiene standards need improvement.', branch:'Indiranagar',  source_platform:'Zomato',    sentiment_label:'Negative' },
  { record_id:26, reviewer_name:'Lavanya D.',     review_date:'2024-02-08', star_rating:2, review_text:'The delivery was late and customer service was rude when I complained. Very unprofessional.', branch:'Indiranagar',  source_platform:'Swiggy',    sentiment_label:'Negative' },
  { record_id:27, reviewer_name:'Rajan T.',       review_date:'2024-03-15', star_rating:2, review_text:'Overpriced for the quantity given. Competitor restaurants offer better value. Not impressed.', branch:'Indiranagar',  source_platform:'Google',    sentiment_label:'Negative' },
  // Neutral — Indiranagar
  { record_id:28, reviewer_name:'Uma V.',         review_date:'2024-02-19', star_rating:3, review_text:'Standard biryani, nothing exceptional. Service was fine. I expected more given the reputation.', branch:'Indiranagar',  source_platform:'Google',    sentiment_label:'Neutral'  },
  { record_id:29, reviewer_name:'Hari C.',        review_date:'2024-03-22', star_rating:3, review_text:'Decent place but a bit crowded during peak hours. Food is okay, service can improve.', branch:'Indiranagar',  source_platform:'Zomato',    sentiment_label:'Neutral'  },
  // More records to bulk up data
  { record_id:30, reviewer_name:'Bhanu P.',       review_date:'2024-04-01', star_rating:5, review_text:'Absolutely brilliant! The chef\'s special biryani is extraordinary. Best in town for sure!', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:31, reviewer_name:'Chandra S.',     review_date:'2024-04-05', star_rating:4, review_text:'Great biryani and friendly staff. The ambiance is clean and comfortable.', branch:'Koramangala',  source_platform:'Zomato',    sentiment_label:'Positive' },
  { record_id:32, reviewer_name:'Disha N.',       review_date:'2024-04-10', star_rating:5, review_text:'Came here with family and everyone loved the food. The veg options are equally good!', branch:'Indiranagar',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:33, reviewer_name:'Farhan A.',      review_date:'2024-04-15', star_rating:2, review_text:'Rotten chicken smell in the biryani. Completely inedible. Raised a complaint but no follow-up.', branch:'Koramangala',  source_platform:'Zomato',    sentiment_label:'Negative' },
  { record_id:34, reviewer_name:'Geetha R.',      review_date:'2024-04-20', star_rating:3, review_text:'Average food today. Usually better. Maybe an off day for the kitchen. I\'ll give it another shot.', branch:'Jayanagar',    source_platform:'Swiggy',    sentiment_label:'Neutral'  },
  { record_id:35, reviewer_name:'Harish V.',      review_date:'2024-05-02', star_rating:5, review_text:'Came for Eid special and was blown away by the Mutton Biryani. Absolutely outstanding!', branch:'Indiranagar',  source_platform:'Google',    sentiment_label:'Positive' },
  { record_id:36, reviewer_name:'Isha M.',        review_date:'2024-05-08', star_rating:4, review_text:'Fresh ingredients, perfectly cooked rice. Chicken 555 is incredibly crispy!', branch:'Koramangala',  source_platform:'Swiggy',    sentiment_label:'Positive' },
  { record_id:37, reviewer_name:'Jagdish K.',     review_date:'2024-05-14', star_rating:1, review_text:'Delivery never arrived, refund denied. Worst customer service experience ever. Never again.', branch:'Jayanagar',    source_platform:'Swiggy',    sentiment_label:'Negative' },
  { record_id:38, reviewer_name:'Kamala T.',      review_date:'2024-05-20', star_rating:5, review_text:'The haleem here is phenomenal. So much depth of flavor. This is authentic Hyderabadi cooking!', branch:'Indiranagar',  source_platform:'Zomato',    sentiment_label:'Positive' },
  { record_id:39, reviewer_name:'Lokesh B.',      review_date:'2024-05-25', star_rating:3, review_text:'Okay experience. Biryani could have more spice. Service was polite but slow.', branch:'Koramangala',  source_platform:'Google',    sentiment_label:'Neutral'  },
  { record_id:40, reviewer_name:'Manjula S.',     review_date:'2024-06-03', star_rating:5, review_text:'Perfect family restaurant. Kids loved the food and adults were very impressed. 10 out of 10!', branch:'Jayanagar',    source_platform:'Google',    sentiment_label:'Positive' },
];

/* ============================================================
   6. FETCH FROM GOOGLE SHEETS (async, production use)
   ============================================================ */
async function fetchReviewsFromSheet() {
  if (!SHEET_CSV_URL || SHEET_CSV_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
    console.warn('No Google Sheet URL configured, using dummy data.');
    return DUMMY_REVIEWS;
  }
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    const parsed = parseCSV(csv);
    console.log(`✅ Fetched ${parsed.length} reviews from Google Sheet`);
    return parsed.length ? parsed : DUMMY_REVIEWS;
  } catch (err) {
    console.warn('Could not fetch sheet data, using dummy data.', err);
    return DUMMY_REVIEWS;
  }
}

/**
 * Robust CSV parser that handles:
 * - Quoted fields containing commas: "Hello, world"
 * - Quoted fields containing newlines
 * - Doubled quotes inside quoted fields: "He said ""hello"""
 */
function parseCSV(csv) {
  const lines = splitCSVLines(csv);
  if (lines.length < 2) return [];

  const headers = splitCSVRow(lines[0]).map(h => h.trim());
  console.log('CSV headers:', headers);

  return lines.slice(1).map((line) => {
    const vals = splitCSVRow(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (vals[idx] || '').trim();
    });
    obj.star_rating = parseFloat(obj.star_rating) || 0;
    // Normalise dates to YYYY-MM-DD for filtering/charting
    obj.review_date_raw = obj.review_date || '';
    obj.review_date = normaliseDateString(obj.review_date || obj.collection_date || '');
    return obj;
  }).filter(r => r.reviewer_name); // skip empty rows
}

/** Split CSV text into lines, respecting quoted fields that span multiple lines */
function splitCSVLines(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++; // skip \r\n
      if (current.trim()) lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

/** Split a single CSV row into an array of field values */
function splitCSVRow(row) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (row[i + 1] === '"') {
          current += '"'; // escaped quote
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Normalise various date formats to YYYY-MM-DD.
 * Handles:
 *   - "Aug 23, 2025" or "Jun 19, 2025"
 *   - "2026-11-18" (already ISO)
 *   - "2 months ago", "11 months ago" (approximate from today)
 *   - Falls back to collection_date or today
 */
function normaliseDateString(raw) {
  if (!raw) return new Date().toISOString().slice(0, 10);

  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  // "X months/years/days ago" pattern
  const agoMatch = raw.match(/(\d+)\s+(day|month|year|week)s?\s+ago/i);
  if (agoMatch) {
    const n = parseInt(agoMatch[1]);
    const unit = agoMatch[2].toLowerCase();
    const d = new Date();
    if (unit === 'day')   d.setDate(d.getDate() - n);
    if (unit === 'week')  d.setDate(d.getDate() - n * 7);
    if (unit === 'month') d.setMonth(d.getMonth() - n);
    if (unit === 'year')  d.setFullYear(d.getFullYear() - n);
    return d.toISOString().slice(0, 10);
  }

  // "Mon DD, YYYY" pattern — e.g. "Aug 23, 2025"
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  // Fallback
  return new Date().toISOString().slice(0, 10);
}

/* ============================================================
   7. DATA HELPERS
   ============================================================ */
function filterReviews(reviews, { branch, sentiment, startDate, endDate }) {
  return reviews.filter(r => {
    if (branch    && branch    !== 'All' && r.branch          !== branch)    return false;
    if (sentiment && sentiment !== 'All' && r.sentiment_label !== sentiment) return false;
    if (startDate && r.review_date < startDate) return false;
    if (endDate   && r.review_date > endDate)   return false;
    return true;
  });
}

function calcKPIs(reviews) {
  if (!reviews.length) return { total:0, positivePct:0, negativePct:0, avgRating:0 };
  const pos  = reviews.filter(r => r.sentiment_label === 'Positive').length;
  const neg  = reviews.filter(r => r.sentiment_label === 'Negative').length;
  const avg  = reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length;
  return {
    total:       reviews.length,
    positivePct: Math.round(pos / reviews.length * 100),
    negativePct: Math.round(neg / reviews.length * 100),
    avgRating:   avg.toFixed(1),
  };
}

/* ============================================================
   8. CHART.JS DEFAULTS
   ============================================================ */
if (typeof Chart !== 'undefined') {
  Chart.defaults.color          = '#A0A0C0';
  Chart.defaults.borderColor    = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family    = 'Outfit';
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.padding  = 16;
  Chart.defaults.plugins.tooltip.padding        = 12;
  Chart.defaults.plugins.tooltip.cornerRadius   = 10;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10,10,20,0.95)';
  Chart.defaults.plugins.tooltip.titleColor      = '#F0F0F8';
  Chart.defaults.plugins.tooltip.bodyColor       = '#A0A0C0';
  Chart.defaults.plugins.tooltip.borderColor     = 'rgba(255,107,53,0.3)';
  Chart.defaults.plugins.tooltip.borderWidth     = 1;
}

/* ============================================================
   9. DASHBOARD PAGE LOGIC
   ============================================================ */
let allReviews = [...DUMMY_REVIEWS];
let charts = {};

async function initDashboard() {
  if (!document.getElementById('kpi-total')) return; // Not on dashboard page

  // 1. Fetch live data (or fallback to dummy)
  allReviews = await fetchReviewsFromSheet(); 

  // 2. Now build the charts with the real data
  buildCharts(allReviews);
  updateKPIs(allReviews);
  setupFilters();

  // Set min/max date defaults for date picker
  const dates = allReviews.map(r => r.review_date).sort();
  const startInp = document.getElementById('filter-start');
  const endInp   = document.getElementById('filter-end');
  if (startInp) startInp.value = dates[0] || '';
  if (endInp)   endInp.value   = dates[dates.length - 1] || '';
}

function setupFilters() {
  ['filter-branch', 'filter-sentiment', 'filter-start', 'filter-end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });

  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    document.getElementById('filter-branch').value    = 'All';
    document.getElementById('filter-sentiment').value = 'All';
    const dates = allReviews.map(r => r.review_date).sort();
    document.getElementById('filter-start').value = dates[0] || '';
    document.getElementById('filter-end').value   = dates[dates.length - 1] || '';
    applyFilters();
  });
}

function applyFilters() {
  const branch    = document.getElementById('filter-branch')?.value    || 'All';
  const sentiment = document.getElementById('filter-sentiment')?.value || 'All';
  const startDate = document.getElementById('filter-start')?.value     || '';
  const endDate   = document.getElementById('filter-end')?.value       || '';
  const filtered  = filterReviews(allReviews, { branch, sentiment, startDate, endDate });
  updateKPIs(filtered);
  updateCharts(filtered);
}

function updateKPIs(reviews) {
  const kpi = calcKPIs(reviews);
  const animate = (id, val, suffix='') => {
    const el = document.getElementById(id);
    if (!el) return;
    animateCounter(el, typeof val === 'string' ? parseFloat(val) : val, 700, suffix);
  };
  animate('kpi-total',       kpi.total,       '');
  animate('kpi-positive',    kpi.positivePct, '%');
  animate('kpi-negative',    kpi.negativePct, '%');
  animate('kpi-avg-rating',  parseFloat(kpi.avgRating), '');
}

/* ---- Build all charts (first load) ---- */
function buildCharts(reviews) {
  buildSentimentDoughnut(reviews);
  buildVolumeLineChart(reviews);
  buildBranchBarChart(reviews);
  buildAspectRadarChart(reviews);
}

/* ---- Update existing charts ---- */
function updateCharts(reviews) {
  updateSentimentDoughnut(reviews);
  updateVolumeLineChart(reviews);
  updateBranchBarChart(reviews);
  // Radar aspect data is derived indirectly — randomise slightly for demo
  updateAspectRadarChart(reviews);
}

/* -- Doughnut: Sentiment Split -- */
function buildSentimentDoughnut(reviews) {
  const ctx = document.getElementById('chart-sentiment')?.getContext('2d');
  if (!ctx) return;
  const data = getSentimentCounts(reviews);
  charts.sentiment = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [data.pos, data.neu, data.neg],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff',
        hoverOffset: 8,
      }]
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} (${Math.round(ctx.parsed / ctx.dataset.data.reduce((a,b)=>a+b,0)*100)}%)`
          }
        }
      }
    }
  });
}

function getSentimentCounts(reviews) {
  return {
    pos: reviews.filter(r => r.sentiment_label === 'Positive').length,
    neu: reviews.filter(r => r.sentiment_label === 'Neutral').length,
    neg: reviews.filter(r => r.sentiment_label === 'Negative').length,
  };
}

function updateSentimentDoughnut(reviews) {
  if (!charts.sentiment) return;
  const d = getSentimentCounts(reviews);
  charts.sentiment.data.datasets[0].data = [d.pos, d.neu, d.neg];
  charts.sentiment.update('active');
}

/* -- Line Chart: Review Volume over Time -- */
function buildVolumeLineChart(reviews) {
  const ctx = document.getElementById('chart-volume')?.getContext('2d');
  if (!ctx) return;
  const { labels, datasets } = getVolumeData(reviews);

  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(255,107,53,0.3)');
  gradient.addColorStop(1, 'rgba(255,107,53,0)');

  charts.volume = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Reviews',
        data: datasets.total,
        borderColor: '#FF6B35',
        backgroundColor: gradient,
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FF6B35',
      }, {
        label: 'Positive',
        data: datasets.positive,
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
      }, {
        label: 'Negative',
        data: datasets.negative,
        borderColor: '#EF4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#EF4444',
        borderDash: [5, 3],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { stepSize: 1 } }
      },
      plugins: { legend: { position: 'top' } }
    }
  });
}

function getVolumeData(reviews) {
  // Group by month
  const months = {};
  reviews.forEach(r => {
    const ym = r.review_date.slice(0, 7); // "YYYY-MM"
    if (!months[ym]) months[ym] = { total: 0, positive: 0, negative: 0, neutral: 0 };
    months[ym].total++;
    if (r.sentiment_label === 'Positive') months[ym].positive++;
    if (r.sentiment_label === 'Negative') months[ym].negative++;
    if (r.sentiment_label === 'Neutral')  months[ym].neutral++;
  });
  const sortedKeys = Object.keys(months).sort();
  const fmtLabel = k => {
    const [y, m] = k.split('-');
    return new Date(y, m-1, 1).toLocaleString('en', { month:'short', year:'2-digit' });
  };
  return {
    labels:   sortedKeys.map(fmtLabel),
    datasets: {
      total:    sortedKeys.map(k => months[k].total),
      positive: sortedKeys.map(k => months[k].positive),
      negative: sortedKeys.map(k => months[k].negative),
    }
  };
}

function updateVolumeLineChart(reviews) {
  if (!charts.volume) return;
  const { labels, datasets } = getVolumeData(reviews);
  charts.volume.data.labels = labels;
  charts.volume.data.datasets[0].data = datasets.total;
  charts.volume.data.datasets[1].data = datasets.positive;
  charts.volume.data.datasets[2].data = datasets.negative;
  charts.volume.update('active');
}

/* -- Bar Chart: Sentiment by Branch -- */
function buildBranchBarChart(reviews) {
  const ctx = document.getElementById('chart-branch')?.getContext('2d');
  if (!ctx) return;
  const data = getBranchData(reviews);

  charts.branch = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.branches,
      datasets: [{
        label: 'Positive',
        data: data.positive,
        backgroundColor: 'rgba(16,185,129,0.75)',
        borderRadius: 6,
        borderSkipped: false,
      }, {
        label: 'Neutral',
        data: data.neutral,
        backgroundColor: 'rgba(245,158,11,0.75)',
        borderRadius: 6,
        borderSkipped: false,
      }, {
        label: 'Negative',
        data: data.negative,
        backgroundColor: 'rgba(239,68,68,0.75)',
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { display: false }, stacked: false },
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } }
      },
      plugins: { legend: { position: 'top' } }
    }
  });
}

function getBranchData(reviews) {
  const branches = ['Jayanagar', 'Koramangala', 'Indiranagar'];
  return {
    branches,
    positive: branches.map(b => reviews.filter(r => r.branch === b && r.sentiment_label === 'Positive').length),
    neutral:  branches.map(b => reviews.filter(r => r.branch === b && r.sentiment_label === 'Neutral').length),
    negative: branches.map(b => reviews.filter(r => r.branch === b && r.sentiment_label === 'Negative').length),
  };
}

function updateBranchBarChart(reviews) {
  if (!charts.branch) return;
  const data = getBranchData(reviews);
  charts.branch.data.datasets[0].data = data.positive;
  charts.branch.data.datasets[1].data = data.neutral;
  charts.branch.data.datasets[2].data = data.negative;
  charts.branch.update('active');
}

/* -- Radar Chart: Aspect Performance -- */
function buildAspectRadarChart(reviews) {
  const ctx = document.getElementById('chart-aspects')?.getContext('2d');
  if (!ctx) return;
  const scores = deriveAspectScores(reviews);

  charts.aspects = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Taste', 'Service', 'Delivery', 'Price', 'Hygiene', 'Portions'],
      datasets: [{
        label: 'Performance Score',
        data: scores,
        backgroundColor: 'rgba(124,58,237,0.2)',
        borderColor: '#7C3AED',
        borderWidth: 2,
        pointBackgroundColor: '#7C3AED',
        pointHoverBackgroundColor: '#FF6B35',
        pointRadius: 5,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0, max: 5,
          ticks: { stepSize: 1, backdropColor: 'transparent', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          pointLabels: { font: { size: 11, weight: '600' }, color: '#A0A0C0' },
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function deriveAspectScores(reviews) {
  // Derive scores from sentiment ratios + ratings, with keyword hints
  const kw = {
    taste:    ['taste','flavor','spice','biryani','chicken','paneer','delicious','divine','cook'],
    service:  ['service','staff','waiter','attend','friendly','courteous','helpful','rude'],
    delivery: ['delivery','late','fast','quick','cold','arrive','order','package'],
    price:    ['price','value','money','worth','expensive','cheap','cost','overpriced'],
    hygiene:  ['hygiene','clean','hair','dirty','fresh','quality'],
    portions: ['portion','quantity','size','generous','small','big','amount'],
  };

  const positiveReviews = reviews.filter(r => r.sentiment_label === 'Positive');
  const total = reviews.length || 1;

  return Object.values(kw).map(words => {
    const posHits = positiveReviews.filter(r =>
      words.some(w => r.review_text.toLowerCase().includes(w))
    ).length;
    const allHits = reviews.filter(r =>
      words.some(w => r.review_text.toLowerCase().includes(w))
    ).length || 1;
    // Weighted score out of 5
    const baseRatio = posHits / allHits;
    const avgR = reviews.length
      ? reviews.reduce((s,r) => s + r.star_rating, 0) / reviews.length / 5
      : 0.7;
    return parseFloat(((baseRatio * 0.6 + avgR * 0.4) * 5).toFixed(2));
  });
}

function updateAspectRadarChart(reviews) {
  if (!charts.aspects) return;
  charts.aspects.data.datasets[0].data = deriveAspectScores(reviews);
  charts.aspects.update('active');
}

/* ============================================================
   10. TEXT MINING PAGE
   ============================================================ */

// Stop words to exclude from word cloud
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','it','its','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','this','that','these','those','i','we','you','he','she',
  'they','me','us','him','her','them','my','our','your','his','their','am',
  'not','no','nor','so','if','then','than','too','very','just','about',
  'also','here','there','when','where','what','which','who','whom','how',
  'all','each','every','both','few','more','most','other','some','such',
  'as','into','through','during','before','after','above','below','up',
  'out','off','over','under','again','once','why','because','while',
  'get','got','one','two','even','still','really','much','like','dont',
  'ive','im','its','well','dont','cant','wont','didnt','doesnt','isnt',
  'thing','things','time','good','bad','food','place','order','ordered',
  'go','going','went','come','back','make','made','take','took','give',
  'gave','say','said','know','think','see','want','need','use','find',
  'tell','ask','work','try','call','feel','become','leave','put','keep',
  'let','begin','show','hear','play','run','move','live','believe','happen',
  '','restaurant','meghana','meghanas','foods','biryani','biriyani','briyani',
  'chicken','rice','paneer','veg','non','best','ever','visit','visited',
]);

/**
 * Extract the most frequent words from reviews of a given sentiment.
 * Returns array of { word, weight, pos } objects.
 */
function extractWordCloudData(reviews, sentimentType) {
  const targetReviews = sentimentType === 'positive'
    ? reviews.filter(r => r.sentiment_label === 'Positive')
    : reviews.filter(r => r.sentiment_label === 'Negative');

  const freq = {};
  targetReviews.forEach(r => {
    const text = (r.review_text || '').toLowerCase().replace(/[^a-z\s]/g, ' ');
    text.split(/\s+/).forEach(word => {
      if (word.length >= 3 && !STOP_WORDS.has(word)) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word, count]) => ({
      word: word.charAt(0).toUpperCase() + word.slice(1),
      weight: count,
      pos: sentimentType === 'positive',
    }));
}

/**
 * Extract top bigrams (two-word phrases) from negative reviews.
 */
function extractNegBigrams(reviews) {
  const negReviews = reviews.filter(r => r.sentiment_label === 'Negative');
  const freq = {};

  negReviews.forEach(r => {
    const words = (r.review_text || '').toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + ' ' + words[i + 1];
      freq[bigram] = (freq[bigram] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, count }));
}

async function initMiningPage() {
  const wcContainer = document.getElementById('wordcloud-container');
  if (!wcContainer) return;

  // 1. Fetch live data (or fallback to dummy)
  allReviews = await fetchReviewsFromSheet();

  // 2. Update the sentiment summary from live data
  updateMiningSummary();

  renderWordCloud('positive');
  renderBigrams();
  renderReviewTable(allReviews);

  // Tab switching
  document.querySelectorAll('.wc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.wc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderWordCloud(tab.dataset.type);
    });
  });

  // Table search + filter
  const searchInput   = document.getElementById('review-search');
  const sentFilter    = document.getElementById('review-sent-filter');
  const branchFilter  = document.getElementById('review-branch-filter');

  function filterTable() {
    const q  = searchInput?.value.toLowerCase() || '';
    const s  = sentFilter?.value  || 'All';
    const b  = branchFilter?.value || 'All';
    const filtered = allReviews.filter(r =>
      (q ? r.review_text.toLowerCase().includes(q) || r.reviewer_name.toLowerCase().includes(q) : true) &&
      (s !== 'All' ? r.sentiment_label === s : true) &&
      (b !== 'All' ? r.branch === b : true)
    );
    renderReviewTable(filtered);
  }

  searchInput?.addEventListener('input', filterTable);
  sentFilter?.addEventListener('change', filterTable);
  branchFilter?.addEventListener('change', filterTable);
}

function renderWordCloud(type) {
  const container = document.getElementById('wordcloud-container');
  if (!container) return;
  container.innerHTML = '';

  const posColors = ['#FF6B35','#FF9A5C','#F59E0B','#FBBF24','#10B981','#34D399','#06B6D4'];
  const negColors = ['#EF4444','#F87171','#EC4899','#A855F7','#F97316','#FB923C'];

  // Dynamically extract words from live review data
  const words = extractWordCloudData(allReviews, type);
  const colors = type === 'positive' ? posColors : negColors;
  const maxWeight = words.length ? words[0].weight : 1;

  words.forEach((item, i) => {
    const span = document.createElement('span');
    span.className = 'word-cloud-word reveal';
    span.style.transitionDelay = (i * 0.04) + 's';
    // Scale font between 0.8rem and 2.2rem based on relative weight
    const size  = 0.8 + (item.weight / maxWeight) * 1.4;
    const color = colors[i % colors.length];
    span.style.fontSize   = size + 'rem';
    span.style.color      = color;
    span.style.background = hexToRgba(color, 0.1);
    span.style.border     = `1px solid ${hexToRgba(color, 0.25)}`;
    span.textContent = item.word;
    span.title = `Mentioned ${item.weight} times`;
    container.appendChild(span);
  });

  // Re-trigger scroll-reveal for new elements
  setTimeout(() => initScrollReveal(), 50);
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function renderBigrams() {
  const list = document.getElementById('bigrams-list');
  if (!list) return;

  // Dynamically extract bigrams from live review data
  const bigrams = extractNegBigrams(allReviews);
  if (!bigrams.length) {
    list.innerHTML = '<li style="padding:24px;color:var(--text-muted)">No negative phrases found.</li>';
    return;
  }

  const max = bigrams[0].count;
  list.innerHTML = bigrams.map((b, i) => `
    <li class="phrase-item reveal" style="transition-delay:${i*0.1}s">
      <div class="phrase-rank">${i+1}</div>
      <div>
        <div class="phrase-text">"${b.phrase}"</div>
        <div class="phrase-count">${b.count} mentions</div>
      </div>
      <div class="phrase-bar-track" style="margin-left:auto">
        <div class="phrase-bar-fill" style="width:${Math.round(b.count/max*100)}%"></div>
      </div>
    </li>
  `).join('');
  setTimeout(() => initScrollReveal(), 50);
}

/** Update the sentiment summary sidebar from live data */
function updateMiningSummary() {
  const kpi = calcKPIs(allReviews);
  const neuPct = 100 - kpi.positivePct - kpi.negativePct;

  // Update the percentage bars
  const bars = document.querySelectorAll('.mini-sent-bar-fill');
  const pcts = document.querySelectorAll('.mini-sent-bar-pct');
  if (bars.length >= 3) {
    bars[0].style.width = kpi.positivePct + '%';
    bars[1].style.width = neuPct + '%';
    bars[2].style.width = kpi.negativePct + '%';
  }
  if (pcts.length >= 3) {
    pcts[0].textContent = kpi.positivePct + '%';
    pcts[1].textContent = neuPct + '%';
    pcts[2].textContent = kpi.negativePct + '%';
  }

  // Update insight metrics
  const metrics = document.querySelectorAll('.insight-metric .im-value');
  if (metrics.length >= 4) {
    metrics[0].textContent = kpi.total;
    metrics[1].textContent = kpi.avgRating + '★';
    metrics[2].textContent = allReviews.filter(r => r.sentiment_label === 'Negative').length;
    // Best branch by positive ratio
    const branches = ['Jayanagar', 'Koramangala', 'Indiranagar'];
    let bestBranch = 'N/A';
    let bestRatio = -1;
    branches.forEach(b => {
      const br = allReviews.filter(r => r.branch === b);
      if (br.length) {
        const ratio = br.filter(r => r.sentiment_label === 'Positive').length / br.length;
        if (ratio > bestRatio) { bestRatio = ratio; bestBranch = b; }
      }
    });
    metrics[3].textContent = bestBranch;
  }

  // Update insight strip
  const bigrams = extractNegBigrams(allReviews);
  const insightStrip = document.querySelector('.insight-strip p');
  if (insightStrip && bigrams.length) {
    insightStrip.innerHTML = `<strong>Key Finding:</strong> "${bigrams[0].phrase}" is the most common complaint phrase, appearing in <strong>${bigrams[0].count}</strong> negative reviews. The dataset contains <strong>${kpi.total}</strong> reviews with a <strong>${kpi.positivePct}%</strong> positive rate.`;
  }
}

function renderReviewTable(reviews) {
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;

  if (!reviews.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">
      <i class="fa-solid fa-magnifying-glass" style="margin-right:8px;"></i>No reviews match your filters.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = reviews.slice(0, 25).map(r => `
    <tr>
      <td>${r.reviewer_name}</td>
      <td class="review-text-cell">${r.review_text}</td>
      <td>${renderStars(r.star_rating)}</td>
      <td>${r.branch}</td>
      <td><span class="tag tag-${r.sentiment_label.toLowerCase()}">${r.sentiment_label}</span></td>
      <td style="color:var(--text-muted)">${r.review_date}</td>
    </tr>
  `).join('');
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(empty)}</span> <span style="font-size:.8rem;color:var(--text-muted)">${rating}</span>`;
}

/* ============================================================
   11. MENU PAGE
   ============================================================ */
const MENU_ITEMS = [
  {
    id: 'boneless-chicken-biryani',
    name: 'Boneless Chicken Biryani',
    category: 'Signature',
    emoji: '🍗',
    grad: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
    desc: 'Tender boneless chicken pieces slow-cooked with fragrant basmati rice, whole spices, and saffron. Our all-time bestseller.',
    price: '₹389',
    rating: 4.8,
    ratingCount: 320,
  },
  {
    id: 'paneer-biryani',
    name: 'Paneer Biryani',
    category: 'Vegetarian',
    emoji: '🧀',
    grad: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    desc: 'Silky cottage cheese cubes marinated in yogurt and spices, layered with aromatic saffron rice. Pure vegetarian delight.',
    price: '₹299',
    rating: 4.5,
    ratingCount: 180,
  },
  {
    id: 'chicken-555',
    name: 'Chicken 555',
    category: 'Starters',
    emoji: '🌶️',
    grad: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    desc: 'Crispy fried chicken tossed in a fiery Chettinad masala with curry leaves and chillies. A legendary starter.',
    price: '₹289',
    rating: 4.7,
    ratingCount: 215,
  },
  {
    id: 'mutton-biryani',
    name: 'Mutton Dum Biryani',
    category: 'Signature',
    emoji: '🥩',
    grad: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    desc: 'Premium mutton sealed and slow-cooked dum style with aged basmati, rose water, and caramelised onions.',
    price: '₹459',
    rating: 4.6,
    ratingCount: 145,
  },
  {
    id: 'chicken-haleem',
    name: 'Chicken Haleem',
    category: 'Specials',
    emoji: '🫕',
    grad: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    desc: 'A rich, slow-cooked stew of chicken, lentils, and broken wheat — deeply spiced and incredibly comforting.',
    price: '₹259',
    rating: 4.4,
    ratingCount: 98,
  },
  {
    id: 'veg-dum-biryani',
    name: 'Veg Dum Biryani',
    category: 'Vegetarian',
    emoji: '🥦',
    grad: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    desc: 'Seasonal vegetables and aromatic spices sealed inside a handi for the perfect dum cook. Light yet satisfying.',
    price: '₹259',
    rating: 4.3,
    ratingCount: 112,
  },
  {
    id: 'chicken-fry',
    name: 'Pepper Chicken Fry',
    category: 'Starters',
    emoji: '🫔',
    grad: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    desc: 'Juicy bone-in chicken tossed with freshly cracked pepper, coconut oil, and curry leaves. South Indian classic.',
    price: '₹319',
    rating: 4.6,
    ratingCount: 167,
  },
  {
    id: 'egg-biryani',
    name: 'Egg Biryani',
    category: 'Vegetarian',
    emoji: '🥚',
    grad: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    desc: 'Golden-fried masala eggs layered with fragrant rice and caramelised onions. Quick, satisfying, and flavorful.',
    price: '₹219',
    rating: 4.2,
    ratingCount: 88,
  },
];

let selectedSentiment = '';
let selectedStars     = 0;
let activeMenuTab     = 'All';

function initMenuPage() {
  if (!document.getElementById('menu-grid')) return;
  renderMenuGrid('All');
  setupMenuTabs();
  setupReviewForm();
}

function setupMenuTabs() {
  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeMenuTab = tab.dataset.category;
      renderMenuGrid(activeMenuTab);
    });
  });
}

function renderMenuGrid(category) {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  const items = category === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === category);

  grid.innerHTML = items.map((item, idx) => `
    <div class="dish-card card reveal" style="transition-delay:${idx * 0.07}s" id="dish-${item.id}">
      <div class="dish-img-placeholder" style="background:${item.grad}">
        <span style="position:relative;z-index:1">${item.emoji}</span>
      </div>
      <div class="dish-body">
        <div class="dish-category">${item.category}</div>
        <div class="dish-name">${item.name}</div>
        <div class="dish-desc">${item.desc}</div>
        <div class="dish-footer">
          <div class="dish-price">${item.price}</div>
          <div class="dish-rating">
            <span class="star-score">★ ${item.rating}</span>
            <span class="review-count">(${item.ratingCount})</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(() => initScrollReveal(), 60);
}

function setupReviewForm() {
  // Sentiment buttons
  document.querySelectorAll('.sentiment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sentiment-btn').forEach(b => b.classList.remove('selected-pos','selected-neg'));
      selectedSentiment = btn.dataset.value;
      btn.classList.add(selectedSentiment === 'Positive' ? 'selected-pos' : 'selected-neg');
    });
  });

  // Star rating input
  const stars = document.querySelectorAll('.star-rating-input .star');
  stars.forEach((star, idx) => {
    star.addEventListener('click', () => {
      selectedStars = idx + 1;
      stars.forEach((s, i) => s.classList.toggle('active', i <= idx));
    });
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => s.classList.toggle('active', i <= idx));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach((s, i) => s.classList.toggle('active', i < selectedStars));
    });
  });

  // Form submit
  const form = document.getElementById('public-review-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name:      document.getElementById('reviewer-name')?.value,
      dish:      document.getElementById('dish-select')?.value,
      sentiment: selectedSentiment,
      stars:     selectedStars,
      comment:   document.getElementById('review-comment')?.value,
      timestamp: new Date().toISOString(),
    };

    console.log('📋 Review Submission Data:', formData);
    /*
      PRODUCTION NOTE:
      In production, POST this data to:
       - A Google Form endpoint:
         fetch('https://docs.google.com/forms/d/e/FORM_ID/formResponse', { method:'POST', body: formEncoded })
       - Or a backend REST API:
         fetch('/api/reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formData) })
    */

    showToast('🎉 Thank you! Your review has been submitted.');
    form.reset();
    document.querySelectorAll('.sentiment-btn').forEach(b => b.classList.remove('selected-pos','selected-neg'));
    document.querySelectorAll('.star-rating-input .star').forEach(s => s.classList.remove('active'));
    selectedSentiment = '';
    selectedStars     = 0;
  });
}

/* ============================================================
   12. TOAST NOTIFICATION
   ============================================================ */
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span id="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById('toast-msg').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ============================================================
   13. INIT — Page Detection + Live Data Fetch
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const page = location.pathname.split('/').pop() || 'index.html';

  // ---- Fetch live data from Google Sheet ----
  try {
    const liveData = await fetchReviewsFromSheet();
    if (liveData && liveData.length > 0 && liveData !== DUMMY_REVIEWS) {
      allReviews = liveData;
      console.log(`📊 Using ${allReviews.length} live reviews from Google Sheet`);
    } else {
      console.log(`📊 Using ${allReviews.length} dummy reviews`);
    }
  } catch (e) {
    console.warn('Live data fetch failed, using dummy data.', e);
  }

  // ---- Update homepage counter targets from live data ----
  const kpi = calcKPIs(allReviews);
  const elTotal = document.querySelector('[data-count][id="stat-reviews"] .stat-value, #stat-reviews .stat-value');
  document.querySelectorAll('[data-count]').forEach(el => {
    const label = (el.closest('.stat-card')?.querySelector('.stat-label')?.textContent || '').toLowerCase();
    if (label.includes('total'))    { el.dataset.count = kpi.total; }
    if (label.includes('positive')) { el.dataset.count = kpi.positivePct; }
    if (label.includes('average') || label.includes('avg') || label.includes('rating')) { el.dataset.count = kpi.avgRating; }
  });
  // Re-trigger counters
  initCounters();

  // ---- Initialize page-specific features ----
  if (page === 'dashboard.html' || document.getElementById('kpi-total')) {
    if (typeof Chart !== 'undefined') {
      initDashboard();
    } else {
      window.addEventListener('load', initDashboard);
    }
  }

  if (page === 'mining.html' || document.getElementById('wordcloud-container')) {
    initMiningPage();
  }

  if (page === 'menu.html' || document.getElementById('menu-grid')) {
    initMenuPage();
  }
});
