/**
 * YouTube Focus — Service Worker (MV3)
 * Default settings, ad counter, storage, badge, and update checks.
 * © Shlemut Labs / מעבדות שלמות. All rights reserved.
 */

"use strict";

/* ============================================================
 *  UPDATE SOURCE
 *  Edit UPDATE_URL to point at your raw version.json on GitHub.
 *  Example (GitHub raw):
 *  https://raw.githubusercontent.com/USERNAME/yt-focus/main/version.json
 *  version.json format:
 *  { "version": "1.3.0", "download": "https://github.com/USERNAME/yt-focus/releases" }
 * ============================================================ */
const UPDATE_URL = "https://raw.githubusercontent.com/USERNAME/yt-focus/main/version.json";

const DEFAULT_SETTINGS = {
  enabled: true,
  profile: "study",
  blockAds: true,            // ALWAYS on by default — core feature
  hideSecondary: true,
  expandPlayer: true,
  hideChannelSuggestions: true,
  hideHomeFeed: true,
  hideShorts: true,
  hideEndScreen: true,
  hideComments: false,
  hideSearchAds: true,
  autoTheater: false,
  disableAutoplay: false,
  smoothAnim: true,
  whitelist: [],
  lang: null
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(null);
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  // Force core ad blocking on after every install/update.
  merged.blockAds = true;
  merged.enabled = true;
  await chrome.storage.sync.set(merged);
  const { adCount = 0 } = await chrome.storage.local.get("adCount");
  await chrome.storage.local.set({ adCount });
  updateBadge(adCount);
});

chrome.runtime.onStartup.addListener(async () => {
  const { adCount = 0 } = await chrome.storage.local.get("adCount");
  updateBadge(adCount);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case "AD_BLOCKED": {
      const inc = typeof msg.count === "number" ? msg.count : 1;
      chrome.storage.local.get("adCount").then(({ adCount = 0 }) => {
        const next = adCount + inc;
        chrome.storage.local.set({ adCount: next });
        updateBadge(next);
      });
      sendResponse({ ok: true });
      return true;
    }

    case "GET_SETTINGS": {
      Promise.all([chrome.storage.sync.get(null), chrome.storage.local.get("adCount")]).then(([sy, lo]) => sendResponse({ ...DEFAULT_SETTINGS, ...sy, adCount: lo.adCount || 0 }));
      return true;
    }

    case "RESET_COUNT": {
      chrome.storage.local.set({ adCount: 0 }).then(() => {
        updateBadge(0);
        sendResponse({ ok: true });
      });
      return true;
    }

    case "CHECK_UPDATE": {
      checkForUpdate().then(sendResponse);
      return true;
    }

    default:
      return false;
  }
});

// Fetches version.json and compares with the installed version.
async function checkForUpdate() {
  const current = chrome.runtime.getManifest().version;
  try {
    const res = await fetch(UPDATE_URL, { cache: "no-store" });
    if (!res.ok) return { ok: false, current, error: "fetch_failed" };
    const data = await res.json();
    const latest = String(data.version || "").trim();
    const download = data.download || "";
    const hasUpdate = latest && compareVersions(latest, current) > 0;
    return { ok: true, current, latest, download, hasUpdate };
  } catch (e) {
    return { ok: false, current, error: "network" };
  }
}

// Returns 1 if a>b, -1 if a<b, 0 if equal. Semantic version compare.
function compareVersions(a, b) {
  const pa = String(a).split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function updateBadge(count) {
  let text = "";
  if (count > 0) {
    text = count > 9999 ? "9k+" : count > 999 ? Math.floor(count / 1000) + "k" : String(count);
  }
  try {
    chrome.action.setBadgeBackgroundColor({ color: "#cc0000" });
    if (chrome.action.setBadgeTextColor) chrome.action.setBadgeTextColor({ color: "#ffffff" });
    chrome.action.setBadgeText({ text });
  } catch (e) {}
}
