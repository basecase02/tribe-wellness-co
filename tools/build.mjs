#!/usr/bin/env node
// Zero-dependency static site generator for Tribe Wellness Co.
// Edit src/partials/*.html and src/pages/*.html, then run:  node tools/build.mjs
// Output: one static HTML file per page at the project root + sitemap.xml (no build step needed to deploy).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// BASE_PATH=/sub-path  → prefixes root-relative URLs (for GitHub project pages). OUT_DIR → write pages elsewhere (default: project root).
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const OUT = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : ROOT;
const rebase = (html) => BASE ? html.replace(/(href|src|action|poster)="\/(?!\/)/g, `$1="${BASE}/`).replace(/srcset="([^"]+)"/g, (m, v) => `srcset="${v.replace(/(^|,\s*)\//g, `$1${BASE}/`)}"`) : html;
export const SITE = {
  url: 'https://www.tribewellnessco.com.au',
  name: 'Tribe Wellness Co',
  phone: '0405 476 121',
  phoneIntl: '+61405476121',
  email: 'info@tribewellnessco.com.au',
  address: '25 Bishop Street, Jolimont WA 6014',
  portal: 'https://tribewellnessco.gymmasteronline.com/portal/',
};
export const NAV = [
  ['About', '/about'], ['Our Team', '/team'], ['Timetable', '/timetable'], ['Memberships', '/memberships'],
  ['28 Day Kickstarter', '/kickstarter'], ['Partners', '/partners'],
  ['Members', [['Leaderboard', '/leaderboard', 'Members only: who is showing up'], ['Community wall', '/community', 'Members only: wins and shoutouts'], ['Member portal', '/portal', 'Bookings, visits and membership']]],
  ['Contact', '/contact'],
];

export const MENU = [
  ['Explore', [['About', '/about'], ['Our Team', '/team'], ['Timetable', '/timetable'], ['Memberships', '/memberships'], ['28 Day Kickstarter', '/kickstarter'], ['Partners', '/partners'], ['Contact', '/contact']]],
  ['Members', [['Leaderboard', '/leaderboard'], ['Community wall', '/community'], ['Member portal', '/portal']]],
];

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const tpl = (s, v) => s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => (v[k] ?? ''));
const partial = n => read(`src/partials/${n}.html`);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const jsonld = (meta, canonical) => {
  const blocks = [];
  if (meta.crumbs) blocks.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
    ...meta.crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 2, name: c, item: canonical })),
  ] });
  for (const b of meta.jsonld ?? []) blocks.push(Object.assign({ '@context': 'https://schema.org' }, b));
  return blocks.map(b => `\n<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('');
};

const pages = [];
const files = fs.readdirSync(path.join(ROOT, 'src/pages')).filter(f => f.endsWith('.html')).sort();
for (const file of files) {
  const src = read(`src/pages/${file}`);
  const m = src.match(/^\s*<!--\s*meta\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`No <!-- meta {...} --> block in ${file}`);
  const meta = JSON.parse(m[1]);
  const body = src.slice(m[0].length).trim();
  const pathName = meta.path ?? '/' + file.replace(/\.html$/, '');
  const out = meta.file ?? (pathName === '/' ? 'index.html' : pathName.slice(1) + '.html');
  const canonical = SITE.url + (pathName === '/' ? '/' : pathName);
  const vars = {
    ...SITE,
    title: esc(meta.title),
    description: esc(meta.description),
    canonical,
    og_image: SITE.url + (meta.og ?? '/assets/img/og/og-home.jpg'),
    og_type: meta.ogType ?? 'website',
    robots: meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    body_class: meta.bodyClass ?? '',
    preload: meta.preload ? `<link rel="preload" as="image" href="${meta.preload}" fetchpriority="high">` : '',
    extra_head: (meta.head ?? '') + jsonld(meta, canonical),
    scripts: (meta.scripts ?? []).map(s => `<script src="${s}" defer></script>`).join('\n'),
    nav_links: NAV.map(([l, h]) => Array.isArray(h)
      ? `<li class="nav__item nav__item--sub"><button type="button" class="nav__link nav__sub-toggle" aria-expanded="false" aria-haspopup="true"${h.some(([, u]) => u === pathName) ? ' aria-current="page"' : ''}>${l} <svg aria-hidden="true"><use href="#i-chev-r"/></svg></button><div class="nav__sub">${h.map(([sl, su, sd]) => `<a href="${su}"${su === pathName ? ' aria-current="page"' : ''}><b>${sl}</b><small>${sd}</small></a>`).join('')}</div></li>`
      : `<li class="nav__item"><a class="nav__link" href="${h}"${h === pathName ? ' aria-current="page"' : ''}>${l}</a></li>`).join(''),
    menu_links: MENU.map(([label, links], g) => `<div class="menu__group"><p class="menu__label">${label}</p>${links.map(([l, h], i) => `<a href="${h}" style="--i:${g * 7 + i}"${h === pathName ? ' aria-current="page"' : ''}><span>${l}</span><svg aria-hidden="true"><use href="#i-arrow-ne"/></svg></a>`).join('')}</div>`).join(''),
    year: String(new Date().getFullYear()),
  };
  let html = [tpl(partial('head'), vars), tpl(partial('header'), vars), body, tpl(partial('footer'), vars)].join('\n');
  html = rebase(html).replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta name="twc-base" content="${BASE}">`);
  fs.mkdirSync(path.dirname(path.join(OUT, out)), { recursive: true });
  fs.writeFileSync(path.join(OUT, out), html + '\n');
  if (!meta.noindex) pages.push({ loc: canonical, priority: meta.priority ?? '0.7', changefreq: meta.changefreq ?? 'monthly' });
  console.log(`✓ ${out}`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
console.log(`✓ sitemap.xml (${pages.length} urls)`);
