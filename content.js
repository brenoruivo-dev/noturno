const STORAGE_KEY = 'enabledSites';
const CACHE_KEY = '__site_dark_mode__';

function siteKeyFromHostname(hostname) {
  if (!hostname) return '';
  return hostname.replace(/^www\./i, '').toLowerCase();
}

function normalizeMode(val) {
  if (val === 'medio') return 'medio';
  if (val === 'alto' || val === true || val === 'on') return 'alto';
  return null;
}

function getCachedMode() {
  try {
    return normalizeMode(sessionStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

function setCachedMode(mode) {
  try {
    if (mode) {
      sessionStorage.setItem(CACHE_KEY, mode);
    } else {
      sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // sessionStorage pode estar bloqueado em iframes ou contextos restritos
  }
}

function applyMode(mode) {
  const root = document.documentElement;
  if (!root) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyMode(mode), { once: true });
    }
    return;
  }
  const norm = normalizeMode(mode);
  if (norm) {
    root.dataset.siteDarkMode = norm;
  } else {
    delete root.dataset.siteDarkMode;
  }
}

// Aplicação síncrona imediata no document_start para evitar tela branca (FOUC)
const initialCached = getCachedMode();
if (initialCached) {
  applyMode(initialCached);
}

async function sync() {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const sites = data[STORAGE_KEY] ?? {};
    const rawVal = sites[siteKeyFromHostname(location.hostname)];
    const mode = normalizeMode(rawVal);
    setCachedMode(mode);
    applyMode(mode);
  } catch (err) {
    // Silencia erros normais de abas antigas cujo contexto foi invalidado após atualização
    if (!err?.message?.includes('Extension context invalidated')) {
      console.error('[modo-noturno]', err);
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'sync') return;
  sync()
    .then(() => sendResponse({ ok: true }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return;
  sync();
});

sync();
