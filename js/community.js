/* Community wall: seed posts from data/community.json; your posts + reactions live in localStorage (demo) */
(async () => {
  const feed = document.getElementById('feed'); if (!feed) return;
  const KEY_POSTS = 'twc.wall.posts', KEY_REACTS = 'twc.wall.reacts';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let data;
  try { data = await TWC.fetchJSON('/data/community.json'); } catch (e) { feed.innerHTML = '<p class="text-2">The wall is unavailable right now.</p>'; return; }
  let mine = load(KEY_POSTS, []), reacts = load(KEY_REACTS, {}), filter = 'all', type = 'win', page = 1; const PAGE = 4; const pagerEl = document.getElementById('feed-pager');
  /* Members-only gate: unlocked when a member session exists (real GymMaster login or demo preview) */
  const grid = document.getElementById('wall-grid'), teaser = document.getElementById('wall-teaser'), sessionNote = document.getElementById('wall-session');
  let locked = !TWC.session.get();
  const applyLock = () => {
    grid.hidden = locked; teaser.hidden = !locked;
    if (locked) { feed.innerHTML = ''; ['w-shoutout', 'w-challenge', 'w-hype'].forEach((id) => { document.getElementById(id).innerHTML = ''; }); }
    else { renderSidebar(); if (TWC.refreshCarousels) TWC.refreshCarousels(); }
    if (sessionNote) { const sess = TWC.session.get(); sessionNote.hidden = locked; sessionNote.innerHTML = sess ? (sess.demo ? 'Previewing as a member (demo). <button class="link-arrow" type="button" id="wall-signout" style="font-size:.66rem;margin-left:8px">Exit preview</button>' : 'Signed in through the member portal.') : ''; }
    const so = document.getElementById('wall-signout'); if (so) so.addEventListener('click', () => { TWC.session.clear(); try { sessionStorage.removeItem('twc.demoMember'); } catch (e) {} locked = true; applyLock(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  };
  const note = document.getElementById('wall-note'); if (note && data.demo) note.textContent = 'Sample posts. Anything you post or react to is saved in this browser only.';

  const all = () => [...mine, ...data.posts];
  const matches = (p) => filter === 'all' || (filter === 'wins' && p.type === 'win') || (filter === 'questions' && p.type === 'question') || (filter === 'shoutouts' && p.type === 'shoutout') || (filter === 'coaches' && p.role === 'coach');
  const reactBtn = (p, k) => { const on = !!((reacts[p.id] || {})[k]); const n = ((p.reactions || {})[k] || 0) + (on ? 1 : 0); return `<button class="react" type="button" aria-pressed="${on}" data-id="${p.id}" data-k="${k}" aria-label="${k} reaction"><svg><use href="#i-${k}"/></svg>${n}</button>`; };

  function render() {
    const full = all().filter(matches).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    const pages = Math.max(1, Math.ceil(full.length / PAGE)); page = Math.min(page, pages);
    if (locked) { feed.innerHTML = ''; pagerEl.innerHTML = ''; return; }
    const list = full.slice((page - 1) * PAGE, page * PAGE);
    feed.innerHTML = list.length ? list.map((p, i) => `<article class="post${p.pinned ? ' post--pinned' : ''}" style="animation-delay:${Math.min(i, 6) * 60}ms">
      <div class="post__head">
        <div class="post__who"><span class="avatar ${p.role === 'coach' ? 'avatar--black' : p.mine ? 'avatar--lime' : ''}" aria-hidden="true">${TWC.initials(p.author)}</span><b>${TWC.esc(p.author)}</b>${p.role === 'coach' ? '<span class="tag tag--coach">Coach</span>' : ''}${p.badge ? `<span class="tag tag--member">${TWC.esc(p.badge)}</span>` : ''}<span class="post__time">${p.pinned ? 'Pinned' : TWC.esc(p.time)}</span></div>
        <span class="tag tag--${p.type}">${p.type}</span>
      </div>
      <p class="post__body">${TWC.esc(p.body)}</p>
      <div class="post__foot"><div class="reacts">${reactBtn(p, 'fire')}${reactBtn(p, 'clap')}${reactBtn(p, 'muscle')}</div><span class="post__replies">${p.replies || 0} ${p.replies === 1 ? 'reply' : 'replies'}</span></div>
    </article>`).join('') : '<p class="text-2" style="padding:24px 4px">Nothing here yet — be the first to post.</p>';
    feed.querySelectorAll('.react').forEach((b) => b.addEventListener('click', () => { const r = reacts[b.dataset.id] = reacts[b.dataset.id] || {}; r[b.dataset.k] = !r[b.dataset.k]; save(KEY_REACTS, reacts); const on = !!r[b.dataset.k]; b.setAttribute('aria-pressed', String(on)); const n = ((all().find((x) => x.id === b.dataset.id) || {}).reactions || {})[b.dataset.k] || 0; b.lastChild.textContent = String(n + (on ? 1 : 0)); }));
    TWC.pager(pagerEl, { page, pages, onChange: (p) => { page = p; render(); document.getElementById('feed-filter').scrollIntoView({ block: 'start', behavior: 'smooth' }); } });
  }

  const ta = document.getElementById('post-text');
  const chips = Array.from(document.querySelectorAll('#composer .type-chips .chip'));
  chips.forEach((c) => c.addEventListener('click', () => { type = c.dataset.type; chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c))); }));
  document.getElementById('post-btn').addEventListener('click', () => {
    const body = ta.value.trim(); if (!body) { ta.focus(); return; }
    mine.unshift({ id: 'u' + Date.now(), author: 'You', role: 'member', mine: true, type, time: 'Just now', body, reactions: { fire: 0, clap: 0, muscle: 0 }, replies: 0 });
    save(KEY_POSTS, mine); ta.value = ''; filter = 'all'; page = 1;
    document.querySelectorAll('#feed-filter .tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.value === 'all')));
    render();
  });
  document.getElementById('feed-filter').addEventListener('tabchange', (e) => { filter = e.detail.value; page = 1; render(); });

  function renderSidebar() {
  const s = data.shoutout;
  document.getElementById('w-shoutout').innerHTML = `<p class="eyebrow">Shoutout of the week</p><div class="post__who"><span class="avatar avatar--lime avatar--lg" aria-hidden="true">${TWC.initials(s.name)}</span><div><b style="display:block;font-size:1.05rem">${TWC.esc(s.name)}</b><span class="small text-lime">${TWC.esc(s.meta)}</span></div></div><p style="color:rgba(255,255,255,.78)">“${TWC.esc(s.quote)}”</p><p class="caps text-lime" style="font-size:.66rem">— ${TWC.esc(s.by)}</p>`;
  const c = data.challenge; const pct = Math.min(100, Math.round(c.progress / c.target * 100));
  document.getElementById('w-challenge').innerHTML = `<p class="eyebrow">This week's challenge</p><h2 class="widget__title">${TWC.esc(c.title)}</h2><p class="small text-2">${TWC.esc(c.body)}</p><div class="progress" role="progressbar" aria-valuenow="${c.progress}" aria-valuemin="0" aria-valuemax="${c.target}" aria-label="${TWC.esc(c.title)} progress"><span style="width:${pct}%"></span></div><p class="small text-2"><b data-count="${c.progress}">${c.progress}</b> of ${c.target} ${TWC.esc(c.unit)} so far</p>`;
  document.getElementById('w-hype').innerHTML = `<p class="eyebrow">Top hype givers</p><ol class="hype">${data.hype.map((h, i) => `<li><i>${i + 1}</i><span class="avatar ${i === 0 ? 'avatar--lime' : i === 1 ? 'avatar--black' : 'avatar--outline'}" aria-hidden="true">${TWC.initials(h.name)}</span><b>${TWC.esc(h.name)}</b><span>${h.score}</span></li>`).join('')}</ol>`;
  }
  applyLock();
  render();
  if (TWC.observeCounts) TWC.observeCounts();
  if (TWC.refreshCarousels) TWC.refreshCarousels();
})();
