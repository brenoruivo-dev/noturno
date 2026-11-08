const STORAGE_KEY = 'enabledSites';

function siteKeyFromUrl(url) {
  try {
    if (!url) return null;
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    if (!hostname) return null;
    return hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

function normalizeMode(val) {
  if (val === 'medio') return 'medio';
  if (val === 'alto' || val === true || val === 'on') return 'alto';
  return null;
}

function changedKeys(oldValue, newValue) {
  const oldObj = (oldValue && typeof oldValue === 'object') ? oldValue : {};
  const newObj = (newValue && typeof newValue === 'object') ? newValue : {};
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  const changed = new Set();
  for (const key of keys) {
    if (normalizeMode(oldObj[key]) !== normalizeMode(newObj[key])) {
      changed.add(key);
    }
  }
  return changed;
}

async function getEnabledSites() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] ?? {};
}

async function refreshAction(tabId, url) {
  if (typeof tabId !== 'number') return;
  const key = siteKeyFromUrl(url);

  try {
    if (!key) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await chrome.action.setTitle({
        tabId,
        title: 'Modo noturno indisponível nesta página',
      });
      return;
    }

    const sites = await getEnabledSites();
    const mode = normalizeMode(sites[key]);

    if (mode === 'medio') {
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#f57c00' });
      if (chrome.action.setBadgeTextColor) {
        await chrome.action.setBadgeTextColor({ tabId, color: '#ffffff' });
      }
      await chrome.action.setBadgeText({ tabId, text: 'MED' });
      await chrome.action.setTitle({
        tabId,
        title: `Modo intermediário ativo em ${key} (Clique para Modo Alto)`,
      });
    } else if (mode === 'alto') {
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#2e7d32' });
      if (chrome.action.setBadgeTextColor) {
        await chrome.action.setBadgeTextColor({ tabId, color: '#ffffff' });
      }
      await chrome.action.setBadgeText({ tabId, text: 'ALTO' });
      await chrome.action.setTitle({
        tabId,
        title: `Modo alto ativo em ${key} (Clique para Desativar)`,
      });
    } else {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await chrome.action.setTitle({
        tabId,
        title: `Ativar modo intermediário em ${key}`,
      });
    }
  } catch {
    // Aba pode ter sido fechada ou descarregada
  }
}

async function applyToTab(tabId) {
  if (typeof tabId !== 'number') return;
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'sync' });
  } catch {
    try {
      // Injeta CSS e script em abas abertas antes da inicialização/recarga da extensão
      await chrome.scripting.insertCSS({ target: { tabId }, files: ['dark.css'] });
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    } catch {
      // Páginas restritas (chrome://, Web Store, etc.) ou aba fechada
    }
  }
}

async function toggleSite(tab) {
  const key = siteKeyFromUrl(tab?.url);
  if (!key || typeof tab.id !== 'number') return;
  const sites = await getEnabledSites();
  const currentMode = normalizeMode(sites[key]);

  if (!currentMode) {
    sites[key] = 'medio';
  } else if (currentMode === 'medio') {
    sites[key] = 'alto';
  } else {
    delete sites[key];
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: sites });
  await applyToTab(tab.id);
  await refreshAction(tab.id, tab.url);
}

chrome.action.onClicked.addListener((tab) => {
  toggleSite(tab).catch((err) => console.error('[modo-noturno]', err));
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await refreshAction(tabId, tab.url);
  } catch {
    // Aba fechada antes do get
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') return;
  refreshAction(tabId, tab.url).catch(() => {});
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return;
  const changed = changedKeys(changes[STORAGE_KEY].oldValue, changes[STORAGE_KEY].newValue);
  if (!changed.size) return;
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      const key = siteKeyFromUrl(tab.url);
      if (key && changed.has(key)) {
        await refreshAction(tab.id, tab.url);
        await applyToTab(tab.id);
      }
    }
  } catch (err) {
    console.error('[modo-noturno]', err);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (typeof tab.id === 'number') {
        refreshAction(tab.id, tab.url).catch(() => {});
      }
    }
  } catch (err) {
    console.error('[modo-noturno]', err);
  }
});
