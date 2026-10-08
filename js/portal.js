/* Member portal: Tribe's UI on top of the GymMaster Member Portal API (login, bookings, visits, membership).
   Falls back to a demo dashboard while the API key isn't configured. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const login = $('#login'), dash = $('#dashboard'); if (!login || !dash) return;
  const gm = TWC.gm, S = TWC.session, esc = TWC.esc;
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const iso = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
  const monday = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const fmtTime = (t) => { if (!t) return ''; const [h, m] = String(t).split(':').map(Number); if (isNaN(h)) return t; return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`; };
  const fmtDate = (s, opts) => { const d = new Date(String(s).length === 10 ? s + 'T00:00:00' : s); return isNaN(d) ? s : d.toLocaleDateString('en-AU', opts || { weekday: 'short', day: 'numeric', month: 'short' }); };
  let session = null, demo = false, state = {}, bkWeek = monday(new Date()), bkDay = (new Date().getDay() + 6) % 7, timetable = null;

  /* ---------- demo data (deterministic) ---------- */
  let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  async function demoData() {
    seed = 7;
    if (!timetable) timetable = await TWC.fetchJSON('/data/timetable.json');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daily = [];
    for (let i = 83; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); const dow = d.getDay(); const p = dow === 0 ? 0 : [1, 2, 4, 6].includes(dow) ? .82 : .28; const v = rnd() < p ? 1 : 0; daily.push({ date: iso(d), visits: v, bookings: v }); }
    const monthly = []; for (let i = 5; i >= 0; i--) { const d = new Date(today.getFullYear(), today.getMonth() - i, 1); monthly.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, visits: i === 0 ? daily.filter((x) => x.date.startsWith(iso(d).slice(0, 7))).reduce((a, b) => a + b.visits, 0) : 14 + Math.round(rnd() * 7) }); }
    const classesFor = (weekStart) => { const out = []; timetable.week.forEach((day, di) => { const date = new Date(weekStart); date.setDate(date.getDate() + di); day.slots.forEach((s) => s.types.forEach((t) => { const name = timetable.types[t].name; const free = Math.round(rnd() * 5); out.push({ id: Number(`${iso(date).replace(/-/g, '')}${s.time.replace(':', '')}${t.length}`), classname: name, arrival: iso(date), starttime: s.time + ':00', dayofweek: DAYS[di], staffname: t === 'over60' ? 'Rosely' : t === 'semi' ? 'Jermaine' : 'Shiv', max_students: t === 'semi' ? 4 : 10, spacesfree: free, already_booked_id: null, bookable: true, location: 'Jolimont' }); })); }); return out; };
    const upcoming = []; const base = new Date(today); for (let i = 1; upcoming.length < 3 && i < 10; i++) { const d = new Date(base); d.setDate(d.getDate() + i); const slots = timetable.week[(d.getDay() + 6) % 7].slots; if (!slots.length) continue; const s = slots[upcoming.length % slots.length]; upcoming.push({ id: 9000 + i, day: iso(d), starttime: s.time + ':00', bookingname: timetable.types[s.types[0]].name, staffname: 'Jermaine', location: 'Jolimont' }); }
    const past = daily.filter((x) => x.visits).slice(-6).reverse().map((x, i) => ({ id: 8000 + i, day: x.date, starttime: ['05:30:00', '06:15:00', '17:30:00'][i % 3], bookingname: ['Small Group Training', 'Semi-Private Training', 'Small Group Training'][i % 3], staffname: ['Shiv', 'Jermaine', 'Rosely'][i % 3] }));
    return {
      profile: { id: 1, firstname: 'Zoe', surname: 'Mitchell', email: 'zoe.mitchell@example.com', phonecell: '0400 000 000', dob: '1991-04-12', joindate: '2019-03-02', totalvisits: 402, totalclasses: 230 },
      memberships: [{ name: 'Gym Membership · 12 months', startdate: '2026-03-02', enddate: '2027-03-01', status: 'Active', price: '$15.00 / week' }, { name: 'Small Group Training add-on', startdate: '2026-07-01', enddate: '2026-12-31', status: 'Active', price: '$50.00 / week' }],
      bookings: upcoming, past, daily, monthly,
      balances: [{ benefitname: 'Small group classes', balance: 'Unlimited' }, { benefitname: 'InBody scans', balance: 2 }],
      outstanding: { owingamount: '$0.00' },
      classesFor,
    };
  }

  /* ---------- live data ---------- */
  async function loadLive(token) {
    const want = { profile: gm.profile(token), memberships: gm.memberMemberships(token), bookings: gm.bookings(token), past: gm.pastBookings(token), daily: gm.visitsDaily(token), monthly: gm.visitsMonthly(token), balances: gm.balances(token), outstanding: gm.outstanding(token) };
    const keys = Object.keys(want); const res = await Promise.allSettled(Object.values(want));
    const out = {}; const errors = [];
    res.forEach((r, i) => { if (r.status === 'fulfilled') out[keys[i]] = r.value; else errors.push(r.reason); });
    if (!out.profile) throw (errors[0] || new Error('Could not load your profile'));
    out.memberships = Array.isArray(out.memberships) ? out.memberships : (out.memberships ? [out.memberships] : []);
    out.classesFor = async (weekStart) => gm.classes(token, iso(weekStart));
    return out;
  }

  /* ---------- rendering ---------- */
  const name = (p) => [p.firstname, p.surname].filter(Boolean).join(' ') || p.email || 'Member';
  const visitsThisMonth = () => { const ym = iso(new Date()).slice(0, 7); return (state.daily || []).filter((d) => String(d.date).startsWith(ym)).reduce((a, d) => a + (Number(d.visits) || 0), 0); };
  const weekStreak = () => { const byWeek = {}; (state.daily || []).forEach((d) => { if (Number(d.visits) > 0) byWeek[iso(monday(new Date(d.date + 'T00:00:00')))] = true; }); let n = 0; const w = monday(new Date()); if (!byWeek[iso(w)]) w.setDate(w.getDate() - 7); while (byWeek[iso(w)]) { n++; w.setDate(w.getDate() - 7); } return n; };
  const bookingName = (b) => b.bookingname || b.classname || b.name || 'Session';
  const bookingDay = (b) => b.day || b.arrival || b.date || '';
  const bookingTime = (b) => b.start_str || fmtTime(b.starttime);
  const rowsHTML = (list, empty, action) => list.length ? list.map((b) => `<div class="row"><span class="row__when">${fmtDate(bookingDay(b), { day: 'numeric', month: 'short' })}<small>${fmtDate(bookingDay(b), { weekday: 'long' })} · ${bookingTime(b)}</small></span><span class="row__what"><b>${esc(bookingName(b))}</b><span>${esc([b.staffname, b.location].filter(Boolean).join(' · '))}</span></span>${action ? action(b) : '<span></span>'}</div>`).join('') : `<p class="row__empty">${empty}</p>`;

  function renderAll() {
    const p = state.profile || {};
    $('#d-avatar').textContent = TWC.initials(name(p));
    $('#d-name').textContent = name(p);
    $('#d-plan').textContent = state.memberships && state.memberships.length ? (state.memberships[0].name || state.memberships[0].membershipname || 'Member') : 'Member';
    $('#d-mode').hidden = !demo;
    const next = (state.bookings || [])[0];
    $('#d-tiles').innerHTML = `
      <div class="tile-stat tile-stat--lime"><b data-count="${visitsThisMonth()}">${visitsThisMonth()}</b><span>Visits this month</span></div>
      <div class="tile-stat"><b data-count="${weekStreak()}">${weekStreak()}</b><span>Week streak</span></div>
      <div class="tile-stat"><b>${next ? fmtDate(bookingDay(next), { day: 'numeric', month: 'short' }) : '—'}</b><span>${next ? 'Next: ' + esc(bookingName(next)) + ' · ' + bookingTime(next) : 'No upcoming booking'}</span></div>
      <div class="tile-stat"><b data-count="${p.totalvisits != null ? p.totalvisits : (state.daily || []).reduce((a, d) => a + (Number(d.visits) || 0), 0)}">${p.totalvisits != null ? p.totalvisits : (state.daily || []).reduce((a, d) => a + (Number(d.visits) || 0), 0)}</b><span>Total visits</span></div>`;
    if (TWC.observeCounts) TWC.observeCounts($('#d-tiles'));
    $('#d-upcoming').innerHTML = rowsHTML((state.bookings || []).slice(0, 4), 'No upcoming bookings — grab a spot in a class.');
    const PAGE = 5; state.pg = state.pg || { bookings: 1, past: 1 };
    const paged = (key, list) => { const pages = Math.max(1, Math.ceil(list.length / PAGE)); state.pg[key] = Math.min(state.pg[key], pages); TWC.pager($('#pg-' + key), { page: state.pg[key], pages, onChange: (p) => { state.pg[key] = p; renderAll(); } }); return list.slice((state.pg[key] - 1) * PAGE, state.pg[key] * PAGE); };
    $('#d-bookings').innerHTML = rowsHTML(paged('bookings', state.bookings || []), 'No upcoming bookings.', (b) => `<button class="btn btn--outline btn--sm" type="button" data-cancel="${b.id}" data-waitlist="${b.waitlist ? 1 : 0}">Cancel</button>`);
    $('#d-past').innerHTML = rowsHTML(paged('past', state.past || []), 'No past sessions yet.');
    $$('[data-cancel]').forEach((b) => b.addEventListener('click', () => cancelBooking(b.dataset.cancel, b.dataset.waitlist === '1')));
    // stats
    const monthly = (state.monthly || []).slice(-6); const max = Math.max(1, ...monthly.map((m) => Number(m.visits) || 0));
    $('#d-bars').innerHTML = monthly.map((m, i) => { const d = new Date(String(m.month).slice(0, 7) + '-01T00:00:00'); return `<div class="${i === monthly.length - 1 ? 'is-now' : ''}" style="height:${Math.max(4, Math.round((Number(m.visits) || 0) / max * 100))}%"><b>${m.visits}</b><span>${isNaN(d) ? esc(m.month) : d.toLocaleDateString('en-AU', { month: 'short' })}</span></div>`; }).join('') || '<p class="row__empty">No visit history yet.</p>';
    $('#d-visits-total').textContent = `${monthly.reduce((a, m) => a + (Number(m.visits) || 0), 0)} visits in the last ${monthly.length} months`;
    const map = {}; (state.daily || []).forEach((d) => { map[String(d.date).slice(0, 10)] = Number(d.visits) || 0; });
    const start = monday(new Date()); start.setDate(start.getDate() - 77); const cells = [];
    for (let i = 0; i < 84; i++) { const d = new Date(start); d.setDate(d.getDate() + i); const v = map[iso(d)] || 0; cells.push(`<i class="${v >= 2 ? 'l3' : v === 1 ? 'l2' : ''}" title="${iso(d)}: ${v} visit${v === 1 ? '' : 's'}"></i>`); }
    $('#d-heat').innerHTML = cells.join('');
    $('#d-heat-note').textContent = `${Object.values(map).filter(Boolean).length} training days on record · ${weekStreak()} week streak`;
    // account
    $('#d-profile').innerHTML = [['Name', name(p)], ['Email', p.email], ['Mobile', p.phonecell], ['Date of birth', p.dob ? fmtDate(p.dob, { day: 'numeric', month: 'long', year: 'numeric' }) : ''], ['Member since', p.joindate ? fmtDate(p.joindate, { month: 'long', year: 'numeric' }) : ''], ['Classes attended', p.totalclasses]].filter(([, v]) => v != null && v !== '').map(([k, v]) => `<div class="info-list__item"><span class="info-list__label">${k}</span><span class="info-list__value">${esc(v)}</span></div>`).join('');
    $('#d-memberships').innerHTML = (state.memberships || []).length ? state.memberships.map((m) => `<div class="row" style="grid-template-columns:minmax(0,1fr) auto"><span class="row__what"><b>${esc(m.name || m.membershipname || 'Membership')}</b><span>${[m.startdate ? 'From ' + fmtDate(m.startdate, { day: 'numeric', month: 'short', year: 'numeric' }) : '', m.enddate ? 'to ' + fmtDate(m.enddate, { day: 'numeric', month: 'short', year: 'numeric' }) : '', m.price].filter(Boolean).join(' ')}</span></span><span class="chip ${/active|current/i.test(m.status || 'active') ? 'chip--lime' : 'chip--outline'}">${esc(m.status || 'Active')}</span></div>`).join('') : '<p class="row__empty">No memberships found.</p>';
    const bal = state.balances || []; const owing = state.outstanding && (state.outstanding.owingamount || state.outstanding.total || state.outstanding.amount);
    $('#d-balance').innerHTML = [['Outstanding balance', owing != null ? owing : '$0.00'], ...bal.map((b) => [b.benefitname || 'Benefit', b.balance])].map(([k, v]) => `<div class="info-list__item"><span class="info-list__label">${esc(k)}</span><span class="info-list__value">${esc(v)}</span></div>`).join('');
  }

  async function renderBook() {
    const list = $('#bk-list'), bar = $('#bk-daybar'), range = $('#bk-range');
    const end = new Date(bkWeek); end.setDate(end.getDate() + 6);
    range.textContent = `${bkWeek.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
    list.innerHTML = '<p class="row__empty">Loading classes…</p>';
    let classes = [];
    try { classes = await state.classesFor(bkWeek); } catch (e) { list.innerHTML = `<p class="alert">${esc(e.message)}</p>`; return; }
    const days = DAYS.map((d, i) => { const date = new Date(bkWeek); date.setDate(date.getDate() + i); return { d, date, items: classes.filter((c) => { const a = new Date(String(c.arrival || c.day).slice(0, 10) + 'T00:00:00'); return (a.getDay() + 6) % 7 === i; }).sort((a, b) => String(a.starttime).localeCompare(String(b.starttime))) }; });
    bar.innerHTML = days.map((x, i) => `<button type="button" role="tab" aria-pressed="${i === bkDay}" data-day="${i}">${x.d.slice(0, 3)}<small>${x.date.getDate()}${x.items.length ? ' · ' + x.items.length : ''}</small></button>`).join('');
    $$('button', bar).forEach((b) => b.addEventListener('click', () => { bkDay = Number(b.dataset.day); renderBook(); }));
    const todays = days[bkDay].items;
    list.innerHTML = todays.length ? todays.map((c) => { const booked = !!c.already_booked_id; const full = Number(c.spacesfree) === 0; return `<div class="class-card${booked ? ' class-card--booked' : ''}"><span class="class-card__time">${c.start_str || fmtTime(c.starttime)}<small>${c.end_str ? 'to ' + c.end_str : '45 min'}</small></span><span><span class="class-card__name">${esc(c.classname || c.bookingname || c.name)}</span><br><span class="class-card__meta">${esc([c.staffname, c.location].filter(Boolean).join(' · '))}${c.spacesfree != null ? ` · ${full ? 'Full' : c.spacesfree + ' spaces'}` : ''}${c.max_students ? ` of ${c.max_students}` : ''}</span></span>${booked ? `<button class="btn btn--outline btn--sm" type="button" data-cancel-class="${c.already_booked_id}">Cancel</button>` : `<button class="btn ${full ? 'btn--outline' : 'btn--black'} btn--sm" type="button" data-book="${c.id}" ${c.bookable === false ? 'disabled' : ''}>${full ? 'Waitlist' : 'Book'}</button>`}</div>`; }).join('') : '<p class="row__empty">No classes on this day.</p>';
    $$('[data-book]', list).forEach((b) => b.addEventListener('click', () => bookClass(b.dataset.book, b)));
    $$('[data-cancel-class]', list).forEach((b) => b.addEventListener('click', () => cancelBooking(b.dataset.cancelClass, false)));
  }

  /* ---------- actions ---------- */
  const err = (msg) => { const el = $('#d-error'); el.textContent = msg; el.hidden = !msg; };
  async function bookClass(id, btn) {
    err('');
    if (demo) { const cls = (await state.classesFor(bkWeek)).find((c) => String(c.id) === String(id)); const day = new Date(String(cls.arrival) + 'T00:00:00'); state.bookings.push({ id: Number(id), day: iso(day), starttime: cls.starttime, bookingname: cls.classname, staffname: cls.staffname, location: cls.location }); state.bookings.sort((a, b) => (a.day + a.starttime).localeCompare(b.day + b.starttime)); state._booked = state._booked || {}; state._booked[id] = true; const orig = state.classesFor; if (!state._wrapped) { state.classesFor = async (w) => (await orig(w)).map((c) => (state._booked[c.id] ? Object.assign({}, c, { already_booked_id: c.id }) : c)); state._wrapped = true; } renderAll(); renderBook(); return; }
    btn.disabled = true; btn.textContent = 'Booking…';
    try { await gm.book(session.token, id); state.bookings = await gm.bookings(session.token); renderAll(); renderBook(); } catch (e) { err(e.message); btn.disabled = false; btn.textContent = 'Book'; }
  }
  async function cancelBooking(id, waitlist) {
    err('');
    if (!confirm('Cancel this booking?')) return;
    if (demo) { state.bookings = state.bookings.filter((b) => String(b.id) !== String(id)); if (state._booked) delete state._booked[id]; renderAll(); if (!$('#panel-book').hidden) renderBook(); return; }
    try { await gm.cancelBooking(session.token, id, waitlist); state.bookings = await gm.bookings(session.token); renderAll(); if (!$('#panel-book').hidden) renderBook(); } catch (e) { err(e.message); }
  }
  function showPanel(v) { $$('[data-panel]').forEach((p) => { p.hidden = p.id !== 'panel-' + v; }); $$('#d-tabs .tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.value === v))); if (v === 'book') renderBook(); }
  const nextUrl = () => { const n = new URLSearchParams(location.search).get('next'); return n && /^\/[a-z0-9\-\/]*$/i.test(n) ? n : null; };
  function showDash() { const n = nextUrl(); if (n) { location.href = n; return; } login.hidden = true; dash.hidden = false; renderAll(); showPanel('overview'); window.scrollTo({ top: 0 }); }
  function showLogin(msg) { dash.hidden = true; login.hidden = false; const e = $('#login-error'); e.textContent = msg || ''; e.hidden = !msg; }
  async function startDemo() { demo = true; S.set({ token: 'demo', memberid: 1, expires: 3600, demo: true }); try { sessionStorage.setItem('twc.demoMember', '1'); } catch (e) {} session = S.get(); state = await demoData(); showDash(); }

  $('#d-tabs').addEventListener('tabchange', (e) => showPanel(e.detail.value));
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => showPanel(b.dataset.goto)));
  $('#bk-prev').addEventListener('click', () => { bkWeek.setDate(bkWeek.getDate() - 7); renderBook(); });
  $('#bk-next').addEventListener('click', () => { bkWeek.setDate(bkWeek.getDate() + 7); renderBook(); });
  $('#logout-btn').addEventListener('click', () => { S.clear(); try { sessionStorage.removeItem('twc.demoMember'); } catch (e) {} session = null; demo = false; state = {}; showLogin(); });
  $('#demo-btn').addEventListener('click', startDemo);
  $('#forgot-btn').addEventListener('click', async () => {
    const email = $('#login-email').value.trim() || prompt('Enter the email address on your membership:'); if (!email) return;
    try { await gm.resetPassword(email); showLogin(''); alert('If that email is on file, a password reset link is on its way.'); }
    catch (e) { if (e.code === 'NOT_CONFIGURED') window.open('https://tribewellnessco.gymmasteronline.com/portal/', '_blank'); else showLogin(e.message); }
  });
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email').value.trim(), pass = $('#login-pass').value; const btn = $('#login-btn');
    if (!email || !pass) { showLogin('Enter your email and password.'); return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      const r = await gm.login(email, pass);
      if (!r || !r.token) throw new Error('Login failed — check your details and try again.');
      session = S.set(r); demo = false; state = await loadLive(session.token); showDash();
    } catch (ex) {
      if (ex.code === 'NOT_CONFIGURED') { $('#login-demo').hidden = false; showLogin(''); }
      else showLogin(ex.message || 'Login failed. Check your email and password.');
    } finally { btn.disabled = false; btn.innerHTML = 'Sign in <svg class="btn__arrow"><use href="#i-arrow"/></svg>'; }
  });

  /* ---------- boot ---------- */
  (async () => {
    if (nextUrl() === '/community') { const pn = $('#portal-next'); if (pn) pn.hidden = false; }
    if (new URLSearchParams(location.search).get('demo') === '1') { await startDemo(); return; }
    session = S.get();
    if (session && session.demo) { demo = true; state = await demoData(); showDash(); return; }
    if (session && session.token) { try { state = await loadLive(session.token); showDash(); return; } catch (e) { S.clear(); session = null; } }
    const ok = await gm.available();
    if (!ok) $('#login-demo').hidden = false;
  })();
})();
