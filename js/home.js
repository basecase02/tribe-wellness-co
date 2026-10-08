/* Home page: "This week's leaders" mini board + a featured wall post (from data/*.json, or GymMaster later) */
(async () => {
  const board = document.getElementById('home-board'), memberBox = document.getElementById('home-community-member'), teaserBox = document.getElementById('home-community-teaser');
  const note = document.getElementById('home-board-note');
  const signedIn = !!TWC.session.get();
  if (memberBox && teaserBox) { memberBox.hidden = !signedIn; teaserBox.hidden = signedIn; }
  if (board && signedIn) {
    try {
      const data = await TWC.fetchJSON('/data/leaderboard.json');
      const rows = data.members.map((m) => ({ m, pts: m.week.points })).sort((a, b) => b.pts - a.pts).slice(0, 5);
      board.innerHTML = rows.map(({ m, pts }, i) => `<li class="mini-board__row">
        <span class="mini-board__rank">${i + 1}</span>
        <span class="avatar ${i === 0 ? 'avatar--black' : 'avatar--ink'}" aria-hidden="true">${TWC.initials(m.name)}</span>
        <span class="mini-board__name"><b>${TWC.esc(m.name)}</b><span>${TWC.esc(m.plan)} · ${m.week.checkins} check-ins · ${m.week.streak} wk streak</span></span>
        <span class="mini-board__pts"><span data-count="${pts}">${pts}</span><small>pts</small></span></li>`).join('');
      if (TWC.observeCounts) TWC.observeCounts(board);
      if (note) note.textContent = data.demo ? 'Preview · sample data' : `Updated ${data.updated}`;
    } catch (e) { board.innerHTML = '<li class="text-2 small">Leaderboard is taking a breather. Check back soon.</li>'; }
  }
  const postEl = document.getElementById('home-post');
  if (postEl && signedIn) {
    try {
      const c = await TWC.fetchJSON('/data/community.json');
      const p = c.posts.find((x) => x.type === 'win') || c.posts[0];
      const r = p.reactions || {};
      postEl.innerHTML = `<div class="post__head"><div class="post__who"><span class="avatar avatar--lime" aria-hidden="true">${TWC.initials(p.author)}</span><b>${TWC.esc(p.author)}</b>${p.badge ? `<span class="tag tag--member">${TWC.esc(p.badge)}</span>` : ''}<span class="post__time">${TWC.esc(p.time)}</span></div><span class="tag tag--${p.type}">${p.type}</span></div>
        <p class="post__body">${TWC.esc(p.body)}</p>
        <div class="post__foot"><div class="reacts"><span class="react"><svg><use href="#i-fire"/></svg>${r.fire || 0}</span><span class="react"><svg><use href="#i-clap"/></svg>${r.clap || 0}</span><span class="react"><svg><use href="#i-muscle"/></svg>${r.muscle || 0}</span></div><a class="post__replies" href="/community">${p.replies || 0} replies →</a></div>`;
      postEl.hidden = false;
    } catch (e) { /* leave hidden */ }
  }
})();
