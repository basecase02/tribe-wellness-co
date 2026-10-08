/* TWC.gm — thin browser client for the GymMaster Member Portal API.
   All calls go through /api/gm (netlify/functions/gm.mjs) so the API key never reaches the browser.
   Every method resolves with the `result` payload or throws an Error with .code:
   NOT_CONFIGURED (no key on the server yet), API_ERROR (GymMaster returned an error), HTTP_xxx. */
window.TWC = window.TWC || {};
(function (TWC) {
  const BASE = ((document.querySelector('meta[name="twc-base"]') || {}).content || '').replace(/\/$/, '');
  TWC.base = BASE; TWC.url = (p) => (BASE && p && p.startsWith('/') ? BASE + p : p);
  const cfg = TWC.config = Object.assign({
    apiBase: BASE + '/api/gm',
    portalUrl: 'https://tribewellnessco.gymmasteronline.com/portal/',
    companyId: null,            // optional: GymMaster club id (GET v1/companies) for multi-club accounts
  }, TWC.config || {});

  let configured = null;        // null = unknown · true/false after the first call
  const enc = (o) => Object.entries(o || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');

  async function call(endpoint, { method = 'GET', params, body, json } = {}) {
    const q = enc(params);
    const url = `${cfg.apiBase}/${endpoint}${q ? '?' + q : ''}`;
    const init = { method, headers: { accept: 'application/json' } };
    if (method === 'POST' && json) { init.headers['content-type'] = 'application/json'; init.body = JSON.stringify(json); }
    else if (method === 'POST') { init.headers['content-type'] = 'application/x-www-form-urlencoded'; init.body = enc(body); }
    let res;
    try { res = await fetch(url, init); } catch (e) { const err = new Error('Network error'); err.code = 'NETWORK'; throw err; }
    let data = null; try { data = await res.json(); } catch (e) { /* non-JSON body */ }
    if (res.status === 501 || (data && data.configured === false)) { configured = false; const err = new Error('GymMaster API is not connected yet.'); err.code = 'NOT_CONFIGURED'; throw err; }
    if (!res.ok) { const err = new Error((data && data.error) || `Request failed (${res.status})`); err.code = 'HTTP_' + res.status; throw err; }
    if (data && data.error) { const err = new Error(data.error); err.code = 'API_ERROR'; throw err; }
    configured = true;
    return data || {};
  }

  const result = (p) => p.then((r) => (r.result === undefined ? r : r.result));
  const list = (p) => result(p).then((r) => (Array.isArray(r) ? r : []));

  TWC.gm = {
    call,
    async available() {
      if (configured !== null) return configured;
      try { await call('v1/version'); return true; } catch (e) { return configured === true; }
    },
    /* Club-level (no member token) */
    schedule: (week) => list(call('v1/booking/classes/schedule', { params: { week, companyid: cfg.companyId } })),
    memberships: () => list(call('v1/memberships')),
    promotions: () => list(call('v2/promotions')),
    settings: () => result(call('v1/settings')),
    companies: () => list(call('v1/companies')),
    prospect: (data) => call('v1/prospect/create', { method: 'POST', body: Object.assign({ companyid: cfg.companyId }, data) }),
    feedback: (email, message) => call('v1/email/feedback', { method: 'POST', body: { email, message } }),
    resetPassword: (email) => call('v1/email/resetpassword', { method: 'POST', body: { email } }),
    /* Member (token from login) */
    login: (email, password) => result(call('v1/login', { method: 'POST', body: { email, password } })),
    profile: (token) => result(call('v1/member/profile', { params: { token } })),
    updateProfile: (token, fields) => call('v1/member/profile', { method: 'POST', body: Object.assign({ token }, fields) }),
    memberMemberships: (token) => result(call('v1/member/memberships', { params: { token } })),
    balances: (token) => list(call('v1/member/membership/benefit/balances', { params: { token } })),
    outstanding: (token) => result(call('v1/member/outstandingbalance', { params: { token } })),
    bookings: (token) => list(call('v2/member/bookings', { params: { token } })),
    pastBookings: (token) => list(call('v2/member/bookings/past', { params: { token } })),
    visitsDaily: (token) => list(call('v2/member/visits/daily', { params: { token } })),
    visitsMonthly: (token) => list(call('v1/member/visits/monthly', { params: { token } })),
    classes: (token, week) => list(call('v2/booking/classes', { params: { token, week } })),
    book: (token, bookingparentid, seat) => call('v2/booking/classes', { method: 'POST', json: { token, bookings: [Object.assign({ bookingparentid: Number(bookingparentid) }, seat ? { seat: Number(seat) } : {})] } }),
    cancelBooking: (token, bookingid, waitlist) => call('v1/member/cancelbooking', { method: 'POST', body: { token, bookingid, waitlist: waitlist ? 1 : 0 } }),
  };

  /* Member session: token kept in sessionStorage only (cleared when the tab closes) */
  TWC.session = {
    get() { try { const s = JSON.parse(sessionStorage.getItem('twc.session') || 'null'); if (s && s.expiresAt > Date.now()) return s; } catch (e) {} return null; },
    set(r) { const s = { token: r.token, memberid: r.memberid, demo: !!r.demo, expiresAt: Date.now() + Math.max(60, (Number(r.expires) || 3600) - 60) * 1000 }; try { sessionStorage.setItem('twc.session', JSON.stringify(s)); } catch (e) {} return s; },
    clear() { try { sessionStorage.removeItem('twc.session'); } catch (e) {} },
  };

  try { if (TWC.session.get()) document.documentElement.classList.add('is-member'); } catch (e) {}
  TWC.fetchJSON = (url) => fetch(TWC.url(url), { headers: { accept: 'application/json' } }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  TWC.initials = (name) => String(name || '').trim().split(/\s+/).slice(0, 2).map((s) => s[0] || '').join('').toUpperCase();
  TWC.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
})(window.TWC);
