const CineMaxFavorites = (() => {
  let ids = [], signedIn = false, ready;
  const pending = new Set();
  const guestKey = 'cinemax_guest_favs';
  function guestIds() {
    try { return JSON.parse(localStorage.getItem(guestKey) || '[]').filter(Number.isInteger); }
    catch { return []; }
  }
  async function load() {
    if (window.CINEMAX_BACKEND !== 'dotnet' && await supabaseApi.hasSession()) {
      signedIn = true;
      ids = await api.get('/favorites');
    } else { signedIn = false; ids = guestIds(); }
    return ids.slice();
  }
  async function initialize() {
    if (!ready) ready = load().catch(error => { ready = undefined; throw error; });
    await ready;
    return ids.slice();
  }
  async function toggle(id) {
    id = Number(id);
    if (!Number.isInteger(id) || id < 1) throw new Error('Некорректный фильм.');
    await initialize();
    if (pending.has(id)) return ids.includes(id);
    pending.add(id);
    try {
      const exists = ids.includes(id);
      if (signedIn) {
        if (exists) await api.delete('/favorites/' + id);
        else await api.post('/favorites', { movieID: id });
      }
      ids = exists ? ids.filter(x => x !== id) : [...ids, id];
      if (!signedIn) localStorage.setItem(guestKey, JSON.stringify(ids));
      return !exists;
    } finally { pending.delete(id); }
  }
  async function clear() {
    await initialize();
    if (signedIn) await api.delete('/favorites');
    else localStorage.removeItem(guestKey);
    ids = [];
  }
  return { initialize, list: () => ids.slice(), toggle, clear };
})();
