function getStorage(name: string, storage) {
  try {
    return JSON.parse(storage.getItem(name));
  } catch (e) {
    return null;
  }
}

function setStorage(name: string, value: string, storage) {
  try {
    const v = JSON.stringify(value);
    storage.setItem(name, v);
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

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
    url.searchParams.get('shop') ?? getStorage('shop', window.sessionStorage);

  if (shop) {
    setStorage('shop', s, window.sessionStorage);
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
