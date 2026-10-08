/* Timetable: live GymMaster class schedule (v1/booking/classes/schedule) with the published timetable as fallback */
(async () => {
  const grid = document.getElementById('tt-grid'); if (!grid) return;
  const dayBar = document.getElementById('tt-daybar'), range = document.getElementById('tt-range'), status = document.getElementById('tt-status'), note = document.getElementById('tt-note');
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; return `${h % 12 || 12}:${String(m).padStart(2, '0')}${ap}`; };
  const iso = (d) => d.toISOString().slice(0, 10);
  const monday = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  let weekStart = monday(new Date());
  let fallback = null, live = null, selectedDay = (new Date().getDay() + 6) % 7;

  const typeOf = (name) => { const n = name.toLowerCase(); if (n.includes('semi')) return 'semi'; if (n.includes('60')) return 'over60'; if (n.includes('group')) return 'group'; return 'special'; };

  async function loadWeek() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(weekStart); end.setDate(end.getDate() + 6);
    range.textContent = `${weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
    let days = null;
    try {
      const rows = await TWC.gm.schedule(iso(weekStart));
      days = DAYS.map((d, i) => { const date = new Date(weekStart); date.setDate(date.getDate() + i); return { day: d, date, slots: [] }; });
      for (const r of rows) {
        const date = new Date(r.arrival + 'T00:00:00'); const idx = (date.getDay() + 6) % 7;
        if (!days[idx]) continue;
        days[idx].slots.push({ time: (r.starttime || '').slice(0, 5), name: r.name, type: typeOf(r.name || ''), staff: r.staffname, free: r.spacesfree, max: r.max_students, full: r.spacesfree === 0 });
      }
      days.forEach((d) => d.slots.sort((a, b) => a.time.localeCompare(b.time)));
      status.classList.add('is-live'); status.lastElementChild.textContent = 'Live from GymMaster';
      live = true;
    } catch (e) {
      if (!fallback) fallback = await TWC.fetchJSON('/data/timetable.json');
      days = fallback.week.map((d, i) => { const date = new Date(weekStart); date.setDate(date.getDate() + i); return { day: d.day, date, slots: d.slots.map((s) => ({ time: s.time, types: s.types, note: s.note })) }; });
      status.classList.remove('is-live'); status.lastElementChild.textContent = 'Standard timetable';
      live = false;
    }
    render(days, today);
  }

  function render(days, today) {
    const types = (fallback && fallback.types) || {};
    grid.innerHTML = days.map((d, i) => {
      const isToday = d.date.getTime() === today.getTime();
      const slots = d.slots.length ? d.slots.map((s) => {
        if (s.types) {                                   // published timetable: one card per time, tags per class type
          return `<div class="slot slot--compact ${types[s.types[0]] ? types[s.types[0]].class : ''}"><span class="slot__time">${fmtTime(s.time)}</span><span class="slot__tags">${s.types.map((t) => `<span class="slot__tag slot__tag--${t}">${TWC.esc((types[t] || {}).name || t)}</span>`).join('')}</span>${s.note ? `<span class="slot__meta">${TWC.esc(s.note)}</span>` : ''}</div>`;
        }
        return `<div class="slot slot--compact slot--${s.type} ${s.full ? 'slot--full' : ''}"><span class="slot__time">${fmtTime(s.time)}</span><span class="slot__name">${TWC.esc(s.name)}</span><span class="slot__meta">${s.staff ? TWC.esc(s.staff) + ' · ' : ''}${s.full ? 'Full — waitlist' : (s.free != null ? `${s.free} spaces` : '')}</span></div>`;
      }).join('') : '<p class="tt-empty">No classes scheduled.</p>';
      return `<div class="tt-day ${isToday ? 'is-today' : ''}" data-day="${i}" data-hidden="${i !== selectedDay}"><div class="tt-day__head"><span class="tt-day__name">${d.day}</span><span class="tt-day__date">${d.date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}${isToday ? ' · Today' : ''}</span></div>${slots}</div>`;
    }).join('');
    dayBar.innerHTML = days.map((d, i) => `<button type="button" role="tab" aria-pressed="${i === selectedDay}" data-day="${i}">${d.day.slice(0, 3)}<small>${d.date.getDate()}</small></button>`).join('');
    dayBar.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { selectedDay = Number(b.dataset.day); dayBar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); grid.querySelectorAll('.tt-day').forEach((x) => x.setAttribute('data-hidden', String(Number(x.dataset.day) !== selectedDay))); }));
    if (note && live === false && fallback) note.textContent = 'All sessions run for 45 minutes. Boxing runs on selected Sundays — check the portal for dates. Live availability appears here once the GymMaster connection is switched on.';
  }

  document.getElementById('tt-prev').addEventListener('click', () => { weekStart.setDate(weekStart.getDate() - 7); loadWeek(); });
  document.getElementById('tt-next').addEventListener('click', () => { weekStart.setDate(weekStart.getDate() + 7); loadWeek(); });
  loadWeek();
})();
