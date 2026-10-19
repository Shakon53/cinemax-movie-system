const API_BASE = window.CINEMAX_API_BASE || '/api';

const api = {
  async get(path) {
    if (window.CINEMAX_BACKEND !== 'dotnet') return supabaseApi.get(path);
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'same-origin' });
    if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.message || (res.status === 401 ? 'Войдите в аккаунт.' : res.status === 403 ? 'Недостаточно прав.' : 'Ошибка ' + res.status)); }
    return res.status === 204 ? null : res.json();
  },
  async getWithHeaders(path) {
    if (window.CINEMAX_BACKEND !== 'dotnet') return supabaseApi.getWithHeaders(path);
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'same-origin' });
    if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.message || (res.status === 401 ? 'Войдите в аккаунт.' : res.status === 403 ? 'Недостаточно прав.' : 'Ошибка ' + res.status)); }
    const data = await res.json();
    const total = res.headers.get('X-Total-Count');
    return { data, total: parseInt(total || '0') };
  },
  async post(path, body) {
    if (window.CINEMAX_BACKEND !== 'dotnet') return supabaseApi.post(path, body);
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.message || (res.status === 401 ? 'Войдите в аккаунт.' : res.status === 403 ? 'Недостаточно прав.' : 'Ошибка ' + res.status)); }
    return res.status === 204 ? null : res.json();
  },
  async put(path, body) {
    if (window.CINEMAX_BACKEND !== 'dotnet') return supabaseApi.put(path, body);
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.message || (res.status === 401 ? 'Войдите в аккаунт.' : res.status === 403 ? 'Недостаточно прав.' : 'Ошибка ' + res.status)); }
    return res.status === 204 ? null : res.json();
  },
  async delete(path) {
    if (window.CINEMAX_BACKEND !== 'dotnet') return supabaseApi.delete(path);
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.message || (res.status === 401 ? 'Войдите в аккаунт.' : res.status === 403 ? 'Недостаточно прав.' : 'Ошибка ' + res.status)); }
  }
};

function showToast(msg, type = 'success') {
  const tc = document.getElementById('toastContainer');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = `toast-item ${type}`;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatMoney(n) {
  if (!n) return 'N/A';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
  return '$' + n.toLocaleString();
}

function formatDate(d) {
  if (!d) return '';
  const locale = (typeof currentLang !== 'undefined')
    ? (currentLang === 'ru' ? 'ru-RU' : currentLang === 'kz' ? 'kk-KZ' : 'en-US')
    : 'en-US';
  return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ratingStars(r) {
  const full = Math.round(r / 2);
  return Array.from({length: 5}, (_, i) =>
    `<i class="bi bi-star${i < full ? '-fill' : ''}" style="color:${i < full ? '#f5c518' : '#555'}; font-size:12px;"></i>`
  ).join('');
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function safeUrl(value) { if (/^\/assets\/posters\/[a-z0-9-]+\.(?:svg|jpg)$/.test(String(value))) return value; try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
function youtubeVideoId(value) {
  const input = String(value || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:') return '';
    let id = '';
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    if (['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)) {
      id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1] || '';
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch { return ''; }
}
function renderReviewText(review) {
  const content = '<p class="review-text">' + escapeHtml(review.commentText) + '</p>';
  return review.containsSpoilers ? '<details class="spoiler-review"><summary><i class="bi bi-eye-slash me-1"></i>Содержит спойлеры — показать отзыв</summary>' + content + '</details>' : content;
}
