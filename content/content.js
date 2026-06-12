/**
 * YouTube Focus — content.js
 * © Shlemut Labs / מעבדות שלמות. All rights reserved.
 */

"use strict";

(function () {
  const ROOT = document.documentElement;

  const CLASS_MAP = {
    blockAds: "yt-focus-block-ads",
    hideSecondary: "yt-focus-hide-secondary",
    expandPlayer: "yt-focus-expand-player",
    hideChannelSuggestions: "yt-focus-hide-channel-suggestions",
    hideHomeFeed: "yt-focus-hide-home",
    hideShorts: "yt-focus-hide-shorts",
    hideEndScreen: "yt-focus-hide-endscreen",
    hideComments: "yt-focus-hide-comments",
    hideSearchAds: "yt-focus-hide-search-ads"
  };

  let settings = {};
  let observer = null;
  let debounceTimer = null;
  let autoplayHandled = false;
  let theaterHandled = false;
  let adVisible = false; // tracks ad transitions so we count each ad once

  // ---------- inline page-context ad blocker (runs synchronously, BEFORE YouTube parses its player response) ----------
  function injectPageScript() {
    try {
      const code = "(" + pageBlocker.toString() + ")();";
      const s = document.createElement("script");
      s.textContent = code;
      (document.head || document.documentElement).appendChild(s);
      s.remove();
    } catch (e) {}
  }

  // This function's source is stringified and injected into the page context.
  function pageBlocker() {
    "use strict";
    let on = true;
    window.addEventListener("message", function (e) {
      if (e.source !== window || !e.data || e.data.__ytFocus !== "config") return;
      on = !!e.data.blockAds;
    }, false);
    function clean(pr) {
      if (!pr || typeof pr !== "object") return pr;
      try {
        var had = (pr.adPlacements && pr.adPlacements.length) || (pr.playerAds && pr.playerAds.length) || (pr.adSlots && pr.adSlots.length);
        if (pr.adPlacements) pr.adPlacements = [];
        if (pr.playerAds) pr.playerAds = [];
        if (pr.adSlots) pr.adSlots = [];
        if (pr.playerConfig && pr.playerConfig.adConfig) pr.playerConfig.adConfig = {};
        if (had) window.postMessage({ __ytFocus: "adBlocked" }, "*");
      } catch (err) {}
      return pr;
    }
    const origParse = JSON.parse;
    JSON.parse = function () {
      const data = origParse.apply(this, arguments);
      if (on && data && (data.adPlacements || data.playerAds || data.adSlots)) return clean(data);
      return data;
    };
    // also intercept fetch responses that carry the player payload
    const origFetch = window.fetch;
    if (origFetch) {
      window.fetch = function () {
        return origFetch.apply(this, arguments).then(function (res) {
          try {
            const u = (res && res.url) || "";
            if (on && u.indexOf("/youtubei/v1/player") !== -1) {
              const clone = res.clone();
              return clone.json().then(function (j) {
                const cleaned = clean(j);
                return new Response(JSON.stringify(cleaned), {
                  status: res.status, statusText: res.statusText, headers: res.headers
                });
              }).catch(function () { return res; });
            }
          } catch (e) {}
          return res;
        });
      };
    }
  }

  function pushConfigToPage() {
    window.postMessage({
      __ytFocus: "config",
      blockAds: !!(settings.enabled && settings.blockAds) && !isWhitelistedChannel()
    }, "*");
  }

  // ---------- whitelist helpers ----------
  function getCurrentChannelId() {
    const link = document.querySelector(
      "ytd-watch-flexy ytd-video-owner-renderer a.yt-simple-endpoint, " +
      "ytd-video-owner-renderer #channel-name a"
    );
    if (!link) return null;
    const href = link.getAttribute("href") || "";
    const m = href.match(/\/(@[^/?#]+|channel\/[^/?#]+)/);
    return m ? m[1].toLowerCase() : null; // only canonical ids (no display-name fallback)
  }

  function isWhitelistedChannel() {
    if (!settings || !Array.isArray(settings.whitelist) || settings.whitelist.length === 0) return false;
    const id = getCurrentChannelId();
    if (!id) return false;
    return settings.whitelist.some((w) => String(w).toLowerCase() === id);
  }

  // ---------- apply CSS classes ----------
  function applyClasses() {
    ROOT.classList.toggle("yt-focus-anim", !!settings.smoothAnim);
    // language flag for localized CSS messages
    ROOT.classList.toggle("yt-focus-lang-en", settings.lang === "en");
    ROOT.classList.toggle("yt-focus-lang-he", settings.lang !== "en");
    if (!settings.enabled) {
      Object.values(CLASS_MAP).forEach((cls) => ROOT.classList.remove(cls));
      return;
    }
    const whitelisted = isWhitelistedChannel();
    for (const [key, cls] of Object.entries(CLASS_MAP)) {
      let on = !!settings[key];
      if (whitelisted && (key === "blockAds" || key === "hideSearchAds")) on = false;
      ROOT.classList.toggle(cls, on);
    }
  }

  // ---------- DOM-level ad skipping (backup) ----------
  function skipVideoAds() {
    if (!settings.enabled || !settings.blockAds) return;
    if (location.pathname !== "/watch") return;
    if (isWhitelistedChannel()) return;
    const player = document.querySelector(".html5-video-player");
    if (!player) return;
    const isAdShowing = player.classList.contains("ad-showing") ||
                        player.classList.contains("ad-interrupting");
    if (!isAdShowing) { adVisible = false; return; }

    // count once per ad appearance
    if (!adVisible) { adVisible = true; reportAd(); }

    const skipBtn = document.querySelector(
      ".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, " +
      ".ytp-ad-skip-button-container button, button.ytp-ad-skip-button-modern"
    );
    if (skipBtn) skipBtn.click();
    const video = player.querySelector("video.html5-main-video, video");
    if (video) {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        try { video.currentTime = video.duration; } catch (e) {}
      }
      try { video.playbackRate = 16; } catch (e) {}
      video.muted = true;
    }
    const overlayClose = document.querySelector(
      ".ytp-ad-overlay-close-button, .ytp-ad-overlay-close-container button"
    );
    if (overlayClose) overlayClose.click();
  }

  function reportAd() {
    try { chrome.runtime.sendMessage({ type: "AD_BLOCKED", count: 1 }); } catch (e) {}
  }

  // ---------- auto theater (once per navigation) ----------
  function applyAutoTheater() {
    if (!settings.enabled || !settings.autoTheater || theaterHandled) return;
    if (location.pathname !== "/watch") return;
    const flexy = document.querySelector("ytd-watch-flexy");
    if (!flexy) return;
    if (!flexy.hasAttribute("theater")) {
      const sizeBtn = document.querySelector(".ytp-size-button");
      if (sizeBtn) { sizeBtn.click(); theaterHandled = true; }
    } else {
      theaterHandled = true;
    }
  }

  // ---------- disable autoplay ----------
  function applyDisableAutoplay() {
    if (!settings.enabled || !settings.disableAutoplay) return;
    const toggle = document.querySelector(
      ".ytp-autonav-toggle-button[aria-checked='true'], " +
      "button.ytp-autonav-toggle-button[aria-checked='true']"
    );
    if (toggle) { toggle.click(); autoplayHandled = true; }
  }

  function tick() {
    applyClasses();
    skipVideoAds();
    applyAutoTheater();
    if (!autoplayHandled) applyDisableAutoplay();
  }

  function scheduleTick() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => { debounceTimer = null; tick(); }, 120);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => scheduleTick());
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ["class"]
    });
  }

  function onKeyDown(e) {
    if (e.altKey && e.code === "KeyF") {
      e.preventDefault();
      settings.enabled = !settings.enabled;
      chrome.storage.sync.set({ enabled: settings.enabled });
      applyClasses();
      pushConfigToPage();
    }
    if (e.altKey && e.code === "KeyS") {
      e.preventDefault();
      settings.hideSecondary = !settings.hideSecondary;
      settings.expandPlayer = settings.hideSecondary;
      chrome.storage.sync.set({ hideSecondary: settings.hideSecondary, expandPlayer: settings.expandPlayer });
      applyClasses();
    }
  }

  function reloadSettings(cb) {
    chrome.storage.sync.get(null, (s) => {
      settings = s || {};
      applyClasses();
      pushConfigToPage();
      if (cb) cb();
    });
  }

  function init() {
    injectPageScript(); // synchronous — installs hooks before YouTube parses player response
    reloadSettings(() => { startObserver(); tick(); });
    document.addEventListener("keydown", onKeyDown, true);

    const onNav = () => {
      autoplayHandled = false;
      theaterHandled = false;
      adVisible = false;
      pushConfigToPage();
      scheduleTick();
    };
    window.addEventListener("yt-navigate-finish", onNav);
    document.addEventListener("yt-navigate-finish", onNav);

    // relay "ad blocked" notifications from the injected page script to the counter
    window.addEventListener("message", (e) => {
      if (e.source === window && e.data && e.data.__ytFocus === "adBlocked") reportAd();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;
      for (const [k, v] of Object.entries(changes)) settings[k] = v.newValue;
      applyClasses();
      pushConfigToPage();
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || msg.type !== "SETTINGS_UPDATED" || !msg.settings) return;
      settings = { ...settings, ...msg.settings };
      applyClasses();
      pushConfigToPage();
      tick();
    });

    // ad-skip loop only on watch pages
    setInterval(() => {
      if (location.pathname === "/watch" && settings.enabled && settings.blockAds) skipVideoAds();
    }, 250);

    // self-healing: re-read settings from storage and re-apply every second.
    // Guarantees toggles ALWAYS take effect, even if a message/event was missed.
    setInterval(() => {
      chrome.storage.sync.get(null, (s) => {
        if (s) { settings = s; applyClasses(); pushConfigToPage(); }
      });
    }, 1000);
  }

  init();
})();
