// Netlify Function (v2 API). Proxies the GymMaster Member Portal API so the club's API key never ships to the browser.
// Browser calls /api/gm/<endpoint> (mapped here by _redirects). The key comes from the GYMMASTER_API_KEY env var
// (Netlify → Site configuration → Environment variables). Docs: https://www.gymmaster.com/gymmaster-api/
const BASE = (process.env.GYMMASTER_BASE || 'https://tribewellnessco.gymmasteronline.com/portal/api/').replace(/\/?$/, '/');

// endpoint → seconds the response may be cached by the browser/CDN (0 = never; member-specific data)
const ALLOW = {
  'v1/version': 600, 'v1/settings': 600, 'v1/companies': 600,
  'v1/booking/classes/schedule': 300, 'v1/memberships': 120, 'v2/promotions': 600,
  'v1/login': 0, 'v1/member/profile': 0, 'v1/member/memberships': 0, 'v1/member/visits/monthly': 0,
  'v1/member/membership/benefit/balances': 0, 'v1/member/outstandingbalance': 0, 'v1/member/accounthistory': 0,
  'v1/member/cancelbooking': 0, 'v1/booking/classes/seats': 0, 'v1/workouts': 0,
  'v2/member/bookings': 0, 'v2/member/bookings/past': 0, 'v2/member/visits/daily': 0, 'v2/member/measurements': 0,
  'v2/booking/classes': 0, 'v1/prospect/create': 0, 'v1/email/feedback': 0, 'v1/email/resetpassword': 0,
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export default async (req) => {
  const key = process.env.GYMMASTER_API_KEY;
  const url = new URL(req.url);
  const endpoint = url.pathname.replace(/^.*?\/gm\/?/, '').replace(/\/+$/, '');
  if (!key) return json({ error: 'GymMaster API key is not configured on the server.', result: null, configured: false }, 200);
  if (!(endpoint in ALLOW)) return json({ error: `Endpoint not allowed: ${endpoint}`, result: null }, 403);
  if (!['GET', 'POST'].includes(req.method)) return json({ error: 'Method not allowed', result: null }, 405);

  const target = new URL(BASE + endpoint);
  url.searchParams.forEach((v, k) => { if (k !== 'api_key') target.searchParams.set(k, v); });
  target.searchParams.set('api_key', key);

  const init = { method: req.method, headers: { accept: 'application/json' } };
  if (req.method === 'POST') {
    const raw = await req.text();
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {                // e.g. v2/booking/classes expects a JSON body
      let obj = {}; try { obj = JSON.parse(raw || '{}'); } catch (e) { return json({ error: 'Invalid JSON body', result: null }, 400); }
      obj.api_key = key;
      init.body = JSON.stringify(obj);
      init.headers['content-type'] = 'application/json';
      return forward(target, init, endpoint);
    }
    const params = new URLSearchParams(raw);
    params.delete('api_key');
    if (endpoint === 'v1/prospect/create') {            // documented as multipart/form-data
      const fd = new FormData();
      params.forEach((v, k) => fd.append(k, v));
      fd.append('api_key', key);
      init.body = fd;
    } else {
      params.set('api_key', key);
      init.body = params.toString();
      init.headers['content-type'] = 'application/x-www-form-urlencoded';
    }
  }
  return forward(target, init, endpoint);
};

async function forward(target, init, endpoint) {
  try {
    const res = await fetch(target, init);
    const text = await res.text();
    const ttl = ALLOW[endpoint];
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': ttl ? `public, max-age=${ttl}` : 'no-store' },
    });
  } catch (e) {
    return json({ error: 'GymMaster is not reachable right now. Please try again shortly.', result: null }, 502);
  }
}
