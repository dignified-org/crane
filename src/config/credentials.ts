export function shop() {
  // ignore SSR for now
  if (typeof window === 'undefined') {
    return;
  }

  // Attempt to determine the shop
  // 1. Query parameter
  // 2. Session storage
  // 3. Local storage
  const url = new URL(window.location.href);
  const s =
    url.searchParams.get('shop') ??
    window.sessionStorage.getItem('shop') ??
    window.localStorage.getItem('latest-shop');

  if (shop) {
    window.sessionStorage.setItem('shop', s);
    window.localStorage.setItem('latest-shop', s);
  }

  return s;
}

export function token() {
  const s = shop();

  if (!s) {
    return;
  }

  const slug = s.replace('.myshopify.com', '');

  // Attempt to determine the shop
  // 1. Query parameter
  // 2. Local storage
  const url = new URL(window.location.href);
  const t =
    url.searchParams.get('token') ??
    window.localStorage.getItem(`${slug}__token`);

  if (t) {
    window.localStorage.setItem(`${slug}__token`, t);
  }

  return t;
}
