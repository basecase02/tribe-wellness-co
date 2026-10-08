/* Leaderboard: podium + table from data/leaderboard.json (swap for a GymMaster-fed endpoint later) */
(async () => {
  const podium = document.getElementById('lb-podium'); if (!podium) return;
  const rows = document.getElementById('lb-rows'), note = document.getElementById('lb-note'), foot = document.getElementById('lb-foot'), pager = document.getElementById('lb-pager');
  /* Members-only: visitors see the explainer, no member data is fetched or rendered */
  const teaser = document.getElementById('lb-teaser'), members = document.getElementById('lb-members'), sessionNote = document.getElementById('lb-session');
  let data = null, locked = !TWC.session.get();
  const applyLock = () => {
    teaser.hidden = !locked; members.hidden = locked;
    if (locked) { podium.innerHTML = ''; rows.innerHTML = ''; if (pager) pager.innerHTML = ''; foot.textContent = ''; }
    const sess = TWC.session.get(); sessionNote.hidden = locked;
    sessionNote.innerHTML = sess ? (sess.demo ? 'Previewing as a member (demo). <button class="link-arrow" type="button" id="lb-signout" style="font-size:.66rem;margin-left:8px">Exit preview</button>' : 'Signed in through the member portal.') : '';
    const so = document.getElementById('lb-signout'); if (so) so.addEventListener('click', () => { TWC.session.clear(); try { sessionStorage.removeItem('twc.demoMember'); } catch (e) {} locked = true; applyLock(); });
  };
  async function load() {
    if (locked) return;
    if (!data) { try { data = await TWC.fetchJSON('/data/leaderboard.json'); } catch (e) { podium.innerHTML = '<p class="text-2">The leaderboard is taking a breather. Check back soon.</p>'; return; } }
    if (note) note.textContent = data.demo ? 'Sample data — names and points are placeholders until the board is connected to GymMaster check-ins.' : `Updated ${data.updated}`;
    render();
  }

  let period = 'week', cat = 'overall', page = 1; const PAGE = 6;
  const me = Number(sessionStorage.getItem('twc.demoMember') || 0);
  const LABEL = { overall: 'pts', consistency: 'check-ins', goals: 'goals', improved: 'pts gained' };
  const delta = (m) => (period === 'all' ? m.month.delta : m[period].delta);
  const metric = (m) => { const s = m[period]; return cat === 'overall' ? s.points : cat === 'consistency' ? s.checkins : cat === 'goals' ? s.goals : delta(m); };
  const sorted = () => data.members.map((m) => ({ m, v: metric(m), s: m[period] })).sort((a, b) => b.v - a.v || b.s.points - a.s.points || b.s.streak - a.s.streak);
  const trend = (d) => d > 0 ? `<span class="trend trend--up"><svg><use href="#i-up"/></svg>+${d}</span>` : d < 0 ? `<span class="trend trend--down"><svg><use href="#i-down"/></svg>${d}</span>` : `<span class="trend trend--flat"><svg><use href="#i-minus"/></svg>0</span>`;
  const youTag = (m) => (m.id === me ? ' <span class="chip chip--lime" style="font-size:.55rem;padding:.35em .6em;vertical-align:middle">You</span>' : '');

  function render() {
    if (locked || !data) return;
    const list = sorted(); const top = list.slice(0, 3); const maxPts = list[0] ? list[0].s.points : 1;
    const av = ['avatar--white', 'avatar--black', 'avatar--lime'];
    podium.innerHTML = top.map(({ m, v, s }, i) => `<article class="podium__card podium__card--${i + 1}${m.id === me ? ' is-me' : ''}">
      <span class="podium__rank" aria-label="Rank ${i + 1}">${i + 1}</span>
      <span class="avatar avatar--xl ${av[i]}" aria-hidden="true">${TWC.initials(m.name)}</span>
      <h3 class="podium__name">${TWC.esc(m.name)}</h3>
      <p class="podium__meta">${TWC.esc(m.plan)} · since ${m.since}${m.id === me ? ' · <b>You</b>' : ''}</p>
      <div class="podium__points"><b data-count="${v}">${cat === 'improved' && v > 0 ? '+' : ''}${v}</b><span>${LABEL[cat]}</span></div>
      <div class="podium__chips"><span class="streak"><svg><use href="#i-fire"/></svg>${s.streak} wk streak</span><span class="chip ${i === 0 ? 'chip--lime' : 'chip--soft'}">${s.points} pts</span></div>
    </article>`).join('');
    const all = list.slice(3); const pages = Math.max(1, Math.ceil(all.length / PAGE)); page = Math.min(page, pages);
    const rest = all.slice((page - 1) * PAGE, page * PAGE);
    rows.innerHTML = rest.map(({ m, s }, i) => `<tr${m.id === me ? ' class="is-me"' : ''}>
      <td class="board__rank">${(page - 1) * PAGE + i + 4}</td>
      <td><div class="board__member"><span class="avatar" aria-hidden="true">${TWC.initials(m.name)}</span><div><b>${TWC.esc(m.name)}${youTag(m)}</b><span>${TWC.esc(m.plan)} · since ${m.since}</span></div></div></td>
      <td><span class="streak"><svg><use href="#i-fire"/></svg>${s.streak}</span></td>
      <td class="hide-sm">${s.checkins}</td>
      <td class="hide-sm">${s.goals}</td>
      <td class="num-right"><span class="board__points">${s.points}</span><span class="board__bar"><span style="width:${Math.round(s.points / maxPts * 100)}%"></span></span></td>
      <td class="hide-sm">${trend(delta(m))}</td>
    </tr>`).join('');
    TWC.pager(pager, { page, pages, onChange: (p) => { page = p; render(); document.getElementById('board').scrollIntoView({ block: 'start', behavior: 'smooth' }); }, info: `${all.length} more members` });
    if (TWC.observeCounts) TWC.observeCounts(podium);
    if (TWC.refreshCarousels) TWC.refreshCarousels();
    const resets = period === 'week' ? 'resets every Monday' : period === 'month' ? 'resets on the 1st' : 'counting since day one';
    foot.textContent = `${list.length} members ranked by ${cat === 'improved' ? 'points gained vs last ' + (period === 'week' ? 'week' : 'month') : LABEL[cat]} · ${resets}`;
  }
  document.getElementById('lb-period').addEventListener('tabchange', (e) => { period = e.detail.value; page = 1; render(); });
  document.getElementById('lb-cat').addEventListener('tabchange', (e) => { cat = e.detail.value; page = 1; render(); });
  applyLock();
  await load();
})();
