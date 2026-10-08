/* Tribe Wellness Co — main.js: header, menu, reveal-on-scroll, ticker, video, lightbox, forms */
(() => {
  const d = document, w = window;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => Array.from(c.querySelectorAll(s));
  const reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header state */
  const header = $('.site-header');
  let lastY = w.scrollY, ticking = false;
  const onScroll = () => {
    if (!header) return;
    const y = w.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    // hide on scroll down (past the first screen), show on scroll up
    if (!d.body.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY + 4 && y > w.innerHeight * 0.6);
    if (y < lastY - 4 || y < 80) header.classList.remove('is-hidden');
    lastY = y; ticking = false;
  };
  w.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Overlay menu */
  const toggle = $('.menu-toggle'), menu = $('#menu');
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    d.body.classList.toggle('menu-open', open);
    if (open) { header.classList.add('is-scrolled'); header.classList.remove('is-hidden'); } else onScroll();
  };
  toggle && toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); const lb = $('#lightbox'); if (lb && lb.open) lb.close(); } });
  $$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* Desktop nav dropdown */
  $$('.nav__item--sub').forEach((item) => {
    const btn = $('.nav__sub-toggle', item);
    const set = (open) => { item.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', () => set(!item.classList.contains('is-open')));
    item.addEventListener('mouseleave', () => set(false));
    d.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  });

  /* Reveal on scroll */
  const io = ('IntersectionObserver' in w) && new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in'); io.unobserve(en.target);
      const track = en.target.closest('.carousel__track');            // reveal sibling cards together so swiping never animates them
      if (track) $$('.reveal', track).forEach((el) => { el.classList.add('is-in'); io.unobserve(el); });
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
  $$('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('is-in'));

  /* Ticker: duplicate track for a seamless loop */
  $$('.ticker__track').forEach((t) => { t.setAttribute('aria-hidden', 'true'); t.innerHTML += t.innerHTML; });

  /* Background videos: only play while visible */
  if ('IntersectionObserver' in w && !reduce) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }), { threshold: 0.15 });
    $$('video[data-autoplay]').forEach((v) => { v.muted = true; v.loop = true; v.playsInline = true; vio.observe(v); });
  }

  /* Lightbox */
  const lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('img', lb);
    $$('[data-lightbox]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      img.src = a.getAttribute('href');
      img.alt = a.dataset.alt || $('img', a)?.alt || '';
      lb.showModal();
    }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  /* Forms: AJAX submit to Netlify Forms, graceful fallback */
  $$('form[data-ajax]').forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button[type="submit"]', f);
    if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
    try {
      const r = await fetch(f.getAttribute('action') || '/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() });
      if (!r.ok) throw new Error(String(r.status));
      f.classList.add('is-sent');
      $('.form__success', f)?.focus?.();
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
      alert('Sorry — that didn\'t send. Please email info@tribewellnessco.com.au or call 0405 476 121.');
    }
  }));

  /* Smooth scroll for same-page anchors (offset handled by scroll-margin) */
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1); const el = id && d.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', '#' + id); }
  }));

  /* Dynamic year */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* Tabs (generic): [role=tablist] > button[role=tab][data-target] */
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      list.dispatchEvent(new CustomEvent('tabchange', { detail: { value: t.dataset.value, tab: t } }));
    }));
  });
})();

/* ---------- UX pass: announcement, carousels, FAQ, tactile feedback, count-ups, mobile CTA, pager ---------- */
window.TWC = window.TWC || {};
(() => {
  const d = document, w = window;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => Array.from(c.querySelectorAll(s));
  const reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches || d.documentElement.classList.contains('no-motion');

  /* Signed-in members: lean navigation, no promotional links, no session bar */
  const sess = w.TWC && TWC.session && TWC.session.get();
  if (sess) {
    const here = location.pathname.replace(/\/$/, '') || '/';
    const links = [['Timetable', '/timetable'], ['Leaderboard', '/leaderboard'], ['Community wall', '/community'], ['Partners', '/partners'], ['Account', '/portal']];
    const cur = (h) => (h === here ? ' aria-current="page"' : '');
    const list = $('.nav__list');
    if (list) list.innerHTML = links.map(([l, h]) => `<li class="nav__item"><a class="nav__link" href="${TWC.url(h)}"${cur(h)}>${l}</a></li>`).join('') + '<li class="nav__item"><button type="button" class="nav__link nav__signout" id="nav-signout">Sign out</button></li>';
    $$('.header__cta').forEach((a) => { a.textContent = sess.demo ? 'Demo member' : 'My account'; a.href = TWC.url('/portal'); });
    const menu = $('.menu__links');
    if (menu) menu.innerHTML = `<div class="menu__group"><p class="menu__label">${sess.demo ? 'Demo member' : 'Member'}</p>${links.map(([l, h], i) => `<a href="${TWC.url(h)}" style="--i:${i}"${cur(h)}><span>${l}</span><svg aria-hidden="true"><use href="#i-arrow-ne"/></svg></a>`).join('')}<a href="#" style="--i:5" id="menu-signout"><span>Sign out</span><svg aria-hidden="true"><use href="#i-arrow-ne"/></svg></a></div>`;
    const cta = $('.menu__cta'); if (cta) cta.innerHTML = `<a class="btn btn--lime btn--lg btn--block" href="${TWC.url('/timetable')}">Book a class <svg class="btn__arrow"><use href="#i-arrow"/></svg></a>`;
    const out = (e) => { e.preventDefault(); TWC.session.clear(); try { sessionStorage.removeItem('twc.demoMember'); } catch (err) {} location.href = TWC.url('/'); };
    $('#nav-signout')?.addEventListener('click', out); $('#menu-signout')?.addEventListener('click', out);
  }

  /* Announcement bar */
  const announce = $('#announce');
  if (announce) $('.announce__close', announce).addEventListener('click', () => { d.documentElement.classList.add('announce-off'); try { sessionStorage.setItem('twc.announce', 'off'); } catch (e) {} });

  /* Carousel: scroll-snap track + arrows + dots. data-carousel="mobile" (default) activates below 900px, "all" always. */
  const mq = w.matchMedia('(max-width: 899px)');
  const carousels = $$('.carousel').map((el) => {
    const track = $('.carousel__track', el); if (!track) return null;
    const nav = d.createElement('div'); nav.className = 'carousel__nav';
    nav.innerHTML = '<div class="carousel__dots" aria-hidden="true"></div><span class="carousel__count sr-only" aria-live="polite"></span><div class="carousel__btns"><button class="carousel__btn" type="button" data-dir="-1" aria-label="Previous"><svg><use href="#i-chev-l"/></svg></button><button class="carousel__btn" type="button" data-dir="1" aria-label="Next"><svg><use href="#i-chev-r"/></svg></button></div>';
    el.appendChild(nav);
    const dots = $('.carousel__dots', nav), count = $('.carousel__count', nav), prev = $('[data-dir="-1"]', nav), next = $('[data-dir="1"]', nav);
    const items = () => Array.from(track.children);
    const step = () => { const it = items(); if (it.length < 2) return track.clientWidth; return it[1].offsetLeft - it[0].offsetLeft; };
    const index = () => Math.round(track.scrollLeft / Math.max(1, step()));
    const perView = () => Math.max(1, Math.round(track.clientWidth / Math.max(1, step())));
    const pages = () => Math.max(1, items().length - perView() + 1);
    const update = () => {
      const i = Math.min(index(), pages() - 1), n = pages();
      const overflow = track.scrollWidth > track.clientWidth + 4;
      nav.classList.toggle('is-idle', !overflow);
      dots.innerHTML = Array.from({ length: n }, (_, k) => `<span class="carousel__dot${k === i ? ' is-active' : ''}"></span>`).join('');
      count.textContent = `${i + 1} / ${n}`;
      prev.disabled = i <= 0; next.disabled = i >= n - 1;
    };
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    let raf; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    track.setAttribute('tabindex', '0'); track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    const apply = () => { const active = el.dataset.carousel === 'all' || mq.matches; el.classList.toggle('is-active', active); if (active) update(); };
    return { apply, update };
  }).filter(Boolean);
  const applyAll = () => carousels.forEach((c) => c.apply());
  applyAll(); mq.addEventListener('change', applyAll); w.addEventListener('resize', () => carousels.forEach((c) => c.update()), { passive: true });
  w.addEventListener('load', applyAll);
  TWC.refreshCarousels = applyAll;

  /* FAQ: animate <details> open/close */
  $$('details.faq__item').forEach((det) => {
    const summary = $('summary', det), body = summary.nextElementSibling;
    let anim = null;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (anim) anim.cancel();
      if (reduce || !det.animate) { det.open = !det.open; return; }
      const sh = summary.getBoundingClientRect().height;
      det.style.overflow = 'hidden';
      if (det.open) {
        const h = det.getBoundingClientRect().height;
        anim = det.animate([{ height: h + 'px' }, { height: sh + 'px' }], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
        anim.onfinish = () => { det.open = false; det.style.overflow = ''; anim = null; };
      } else {
        det.open = true;
        const h = det.getBoundingClientRect().height;
        anim = det.animate([{ height: sh + 'px' }, { height: h + 'px' }], { duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)' });
        if (body) body.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 60, fill: 'both', easing: 'ease-out' });
        anim.onfinish = () => { det.style.overflow = ''; anim = null; };
      }
    });
  });

  /* Ripple + icon pop on press */
  const rippleTargets = '.btn, .tab, .react, .carousel__btn, .pager button, .day-bar button, .type-chips .chip, .tile, .plan, .card, .podium__card, .icon-btn';
  d.addEventListener('pointerdown', (e) => {
    if (reduce) return;
    const el = e.target.closest(rippleTargets); if (!el || el.disabled) return;
    el.classList.add('has-ripple');
    const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 1.1;
    const span = d.createElement('span'); span.className = 'ripple';
    span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.appendChild(span); span.addEventListener('animationend', () => span.remove());
    if (el.classList.contains('react')) { el.classList.remove('is-popping'); void el.offsetWidth; el.classList.add('is-popping'); }
  }, { passive: true });

  /* Pointer tilt on tiles (desktop only, subtle) */
  if (w.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    $$('.tile, .person .media, .podium__card').forEach((el) => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.classList.add('is-tilting'); el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => { el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
  }

  /* Count-up numbers: <b data-count="270">270</b> (keeps any non-digit prefix/suffix) */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count); if (isNaN(target) || el.dataset.counted) return;
    el.dataset.counted = '1';
    if (reduce) return;
    const text = el.textContent, m = text.match(/^([^\d]*)([\d,.]+)(.*)$/); const pre = m ? m[1] : '', post = m ? m[3] : '';
    const dec = (String(target).split('.')[1] || '').length; const start = performance.now(), dur = 900;
    const tick = (t) => { const p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = pre + (target * e).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + post; if (p < 1) requestAnimationFrame(tick); else el.textContent = text; };
    requestAnimationFrame(tick);
  };
  const cio = ('IntersectionObserver' in w) && new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } }), { threshold: .4 });
  TWC.observeCounts = (root = d) => $$('[data-count]', root).forEach((el) => cio ? cio.observe(el) : countUp(el));
  TWC.observeCounts();

  /* Mobile sticky CTA (hidden until the hero is passed, and on sign-up pages) */
  const cta = $('#mobile-cta');
  if (cta && !d.body.classList.contains('no-mobile-cta')) {
    d.documentElement.classList.add('has-mobile-cta');
    const check = () => cta.classList.toggle('is-visible', w.scrollY > w.innerHeight * .7 && !d.body.classList.contains('menu-open'));
    w.addEventListener('scroll', check, { passive: true }); check();
  }

  /* Pager: TWC.pager(el, { page, pages, onChange, info }) */
  TWC.pager = (el, { page, pages, onChange, info }) => {
    if (!el) return;
    if (pages <= 1) { el.innerHTML = ''; return; }
    const win = []; const lo = Math.max(1, Math.min(page - 2, pages - 4)), hi = Math.min(pages, lo + 4);
    for (let i = lo; i <= hi; i++) win.push(i);
    el.innerHTML = `<button type="button" data-page="${page - 1}" aria-label="Previous page" ${page <= 1 ? 'disabled' : ''}><svg><use href="#i-chev-l"/></svg></button>${lo > 1 ? '<button type="button" data-page="1">1</button><span class="pager__info">…</span>' : ''}${win.map((i) => `<button type="button" data-page="${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`).join('')}${hi < pages ? `<span class="pager__info">…</span><button type="button" data-page="${pages}">${pages}</button>` : ''}<button type="button" data-page="${page + 1}" aria-label="Next page" ${page >= pages ? 'disabled' : ''}><svg><use href="#i-chev-r"/></svg></button>${info ? `<span class="pager__info">${info}</span>` : ''}`;
    $$('button[data-page]', el).forEach((b) => b.addEventListener('click', () => onChange(Number(b.dataset.page))));
  };

  /* Read more for clamped text */
  $$('.clamp').forEach((el) => {
    requestAnimationFrame(() => {
      if (el.scrollHeight <= el.clientHeight + 2) { el.classList.add('clamp--fits'); return; }
      const b = d.createElement('button'); b.type = 'button'; b.className = 'clamp__more'; b.textContent = 'Read more';
      b.addEventListener('click', () => { const open = el.classList.toggle('is-open'); b.textContent = open ? 'Read less' : 'Read more'; });
      el.insertAdjacentElement('afterend', b);
    });
  });
})();
