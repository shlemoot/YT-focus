/**
 * YouTube Focus — popup.js
 * © Shlemut Labs / מעבדות שלמות. All rights reserved.
 */

"use strict";

const TOGGLE_IDS = [
  "enabled", "blockAds", "hideSearchAds", "hideSecondary", "expandPlayer",
  "hideHomeFeed", "hideChannelSuggestions", "hideShorts", "hideEndScreen",
  "hideComments", "autoTheater", "disableAutoplay", "smoothAnim"
];

const PROFILES = {
  study: {
    blockAds: true, hideSearchAds: true, hideSecondary: true, expandPlayer: true,
    hideHomeFeed: true, hideChannelSuggestions: true, hideShorts: true,
    hideEndScreen: true, hideComments: true, autoTheater: false,
    disableAutoplay: true, smoothAnim: true
  },
  normal: {
    blockAds: true, hideSearchAds: true, hideSecondary: false, expandPlayer: false,
    hideHomeFeed: false, hideChannelSuggestions: false, hideShorts: false,
    hideEndScreen: false, hideComments: false, autoTheater: false,
    disableAutoplay: false, smoothAnim: true
  }
};

let state = {};
let lang = "he";
let dict = I18N.he;

document.addEventListener("DOMContentLoaded", init);

function init() {
  chrome.storage.sync.get(null, (s) => {
    state = s || {};
    chrome.storage.local.get("adCount", (lo) => {
      state.adCount = lo.adCount || 0;
      lang = state.lang || detectLang();
      dict = applyLang(lang);
      renderAll();
      bindEvents();
      detectChannelWhitelist();
    });
  });
  // live counter (stored in local now)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.adCount) {
      document.getElementById("adCount").textContent = formatCount(changes.adCount.newValue || 0);
    }
  });
  // also poll every second while popup is open, for a true live feel
  setInterval(() => {
    chrome.storage.local.get("adCount", (lo) => {
      const el = document.getElementById("adCount");
      if (el) el.textContent = formatCount(lo.adCount || 0);
    });
  }, 1000);
}

function renderAll() {
  TOGGLE_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!state[id];
  });
  document.getElementById("adCount").textContent = formatCount(state.adCount || 0);
  updateMasterLabel();
  updateProfileButtons();
}

function updateMasterLabel() {
  const label = document.getElementById("masterLabel");
  label.textContent = state.enabled ? dict.focusOn : dict.focusOff;
}

function updateProfileButtons() {
  document.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.classList.toggle("active", state.profile === btn.dataset.profile);
  });
}

function bindEvents() {
  TOGGLE_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => {
      state[id] = el.checked;
      const toSave = { [id]: el.checked };
      // Turning on any feature also turns the master switch on, so it takes effect immediately.
      if (id !== "enabled" && el.checked && !state.enabled) {
        state.enabled = true;
        toSave.enabled = true;
        const m = document.getElementById("enabled");
        if (m) m.checked = true;
        updateMasterLabel();
      }
      chrome.storage.sync.set(toSave);
      pushToActiveTab();
      if (id === "enabled") updateMasterLabel();
    });
  });
  document.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyProfile(btn.dataset.profile));
  });
  document.getElementById("resetCount").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "RESET_COUNT" }, () => {
      state.adCount = 0;
      document.getElementById("adCount").textContent = "0";
    });
  });
  document.getElementById("allowChannelBtn").addEventListener("click", toggleWhitelist);
  document.getElementById("langToggle").addEventListener("click", switchLang);
  document.getElementById("updateBtn").addEventListener("click", checkUpdate);
}

function switchLang() {
  lang = lang === "he" ? "en" : "he";
  state.lang = lang;
  chrome.storage.sync.set({ lang: lang });
  dict = applyLang(lang);
  renderAll();
  // refresh dynamic whitelist text in the new language
  refreshWhitelistUI(document.getElementById("allowChannelBtn"), document.getElementById("wlStatus"));
}

function applyProfile(name) {
  const preset = PROFILES[name];
  if (!preset) return;
  state = { ...state, ...preset, profile: name, enabled: true };
  chrome.storage.sync.set({ ...preset, profile: name, enabled: true });
  pushToActiveTab();
  renderAll();
}

function pushToActiveTab() {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.id || !tab.url || !tab.url.includes("youtube.com")) return;
      chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_UPDATED", settings: state }, () => {
        void chrome.runtime.lastError;
      });
    });
  } catch (e) {}
}

let currentChannel = null;

function detectChannelWhitelist() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const btn = document.getElementById("allowChannelBtn");
    const status = document.getElementById("wlStatus");
    if (!tab || !tab.url || !tab.url.includes("youtube.com/watch")) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      status.textContent = dict.wlOpenVideo;
      return;
    }
    if (chrome.scripting && chrome.scripting.executeScript) {
      chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractChannel }, (res) => {
        if (chrome.runtime.lastError || !res || !res[0]) { fallbackNoChannel(btn, status); return; }
        currentChannel = res[0].result;
        refreshWhitelistUI(btn, status);
      });
    } else {
      fallbackNoChannel(btn, status);
    }
  });
}

function extractChannel() {
  const link = document.querySelector(
    "ytd-watch-flexy ytd-video-owner-renderer a.yt-simple-endpoint, " +
    "ytd-video-owner-renderer #channel-name a"
  );
  if (!link) return null;
  const href = link.getAttribute("href") || "";
  const m = href.match(/\/(@[^/?#]+|channel\/[^/?#]+)/);
  return m ? m[1].toLowerCase() : (link.textContent || "").trim().toLowerCase();
}

function fallbackNoChannel(btn, status) {
  btn.disabled = true;
  btn.style.opacity = "0.5";
  status.textContent = dict.wlNoChannel;
}

function refreshWhitelistUI(btn, status) {
  if (!currentChannel) { fallbackNoChannel(btn, status); return; }
  btn.disabled = false;
  btn.style.opacity = "1";
  const wl = Array.isArray(state.whitelist) ? state.whitelist : [];
  const isIn = wl.includes(currentChannel);
  btn.classList.toggle("active", isIn);
  btn.textContent = isIn ? dict.wlAllowed : dict.wlAllow;
  status.textContent = dict.wlChannelPrefix + currentChannel;
}

function toggleWhitelist() {
  if (!currentChannel) return;
  let wl = Array.isArray(state.whitelist) ? [...state.whitelist] : [];
  const idx = wl.indexOf(currentChannel);
  if (idx >= 0) wl.splice(idx, 1); else wl.push(currentChannel);
  state.whitelist = wl;
  chrome.storage.sync.set({ whitelist: wl }, () => {
    pushToActiveTab();
    refreshWhitelistUI(document.getElementById("allowChannelBtn"), document.getElementById("wlStatus"));
  });
}

function checkUpdate() {
  const status = document.getElementById("updateStatus");
  const btn = document.getElementById("updateBtn");
  status.textContent = dict.checking;
  chrome.runtime.sendMessage({ type: "CHECK_UPDATE" }, (resp) => {
    if (!resp || !resp.ok) { status.textContent = dict.updateError; return; }
    if (resp.hasUpdate) {
      status.textContent = dict.updateAvailable + " (v" + resp.latest + ")";
      btn.classList.add("has-update");
      if (resp.download) {
        btn.onclick = () => chrome.tabs.create({ url: resp.download });
      }
    } else {
      status.textContent = dict.upToDate + " (v" + resp.current + ")";
    }
  });
}

function formatCount(n) {
  return Number(n || 0).toLocaleString(lang === "he" ? "he-IL" : "en-US");
}
