(function () {
  'use strict';

  var AD_PREVIEW_MS = 2000;

  function resolveLang(code) {
    var value = String(code || '').toLowerCase();
    if (value.indexOf('ru') === 0 || value.indexOf('be') === 0) return 'ru';
    return 'en';
  }

  function isLocalHost() {
    var host = location.hostname;
    return location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '';
  }

  function $(id) {
    return document.getElementById(id);
  }

  function PauseGate() {
    this.reasons = new Set();
    this._handlers = new Set();
  }

  Object.defineProperty(PauseGate.prototype, 'active', {
    get: function () { return this.reasons.size > 0; }
  });

  PauseGate.prototype.has = function (reason) {
    return this.reasons.has(reason);
  };

  PauseGate.prototype.onChange = function (fn) {
    this._handlers.add(fn);
    var self = this;
    return function () { self._handlers.delete(fn); };
  };

  PauseGate.prototype._emit = function (paused) {
    this._handlers.forEach(function (fn) { fn(paused); });
  };

  PauseGate.prototype.hold = function (reason) {
    var was = this.active;
    this.reasons.add(reason);
    if (!was && this.active) this._emit(true);
  };

  PauseGate.prototype.release = function (reason) {
    if (!this.reasons.has(reason)) return;
    var was = this.active;
    this.reasons.delete(reason);
    if (was && !this.active) this._emit(false);
  };

  function buildRing() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 112 112');
    function circle(className) {
      var node = document.createElementNS(ns, 'circle');
      node.setAttribute('class', className);
      node.setAttribute('cx', '56');
      node.setAttribute('cy', '56');
      node.setAttribute('r', '46');
      return node;
    }
    svg.appendChild(circle('ad-ring-bg'));
    var fg = circle('ad-ring');
    svg.appendChild(fg);
    return { svg: svg, circle: fg };
  }

  function MockYandexSDK() {
    var self = this;
    this.environment = {
      app: { id: 'local.mock' },
      i18n: { lang: resolveLang(navigator.language), tld: 'ru' },
      browser: { lang: navigator.language || 'ru' },
      payload: null
    };
    var mobile = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    this.deviceInfo = {
      type: mobile ? 'mobile' : 'desktop',
      isMobile: function () { return mobile; },
      isDesktop: function () { return !mobile; },
      isTablet: function () { return false; },
      isTV: function () { return false; }
    };
    this.loadingReady = false;
    this.gameplay = false;
    this._events = {};
    this._showing = false;
    this._pause = null;
    this.features = {
      LoadingAPI: {
        ready: function () { self.loadingReady = true; }
      },
      GameplayAPI: {
        start: function () { self.gameplay = true; },
        stop: function () { self.gameplay = false; }
      }
    };
    this.adv = {
      showFullscreenAdv: function (options) {
        self._present('fullscreen', (options && options.callbacks) || {});
      },
      showRewardedVideo: function (options) {
        self._present('rewarded', (options && options.callbacks) || {});
      }
    };
  }

  MockYandexSDK.prototype.getPlayer = function () {
    return Promise.resolve({
      getUniqueID: function () { return 'local-player'; },
      getName: function () { return 'Guest'; },
      getMode: function () { return 'lite'; },
      getData: function () {
        try {
          var raw = localStorage.getItem('aurelia.cloud.v2');
          return Promise.resolve(raw ? JSON.parse(raw) : {});
        } catch (error) {
          void error;
          return Promise.resolve({});
        }
      },
      setData: function (data) {
        try { localStorage.setItem('aurelia.cloud.v2', JSON.stringify(data)); } catch (error) { void error; }
        return Promise.resolve();
      }
    });
  };

  MockYandexSDK.prototype.bindPause = function (pause) {
    this._pause = pause;
  };

  MockYandexSDK.prototype.on = function (event, callback) {
    if (!this._events[event]) this._events[event] = new Set();
    this._events[event].add(callback);
  };

  MockYandexSDK.prototype.off = function (event, callback) {
    if (this._events[event]) this._events[event].delete(callback);
  };

  MockYandexSDK.prototype._emit = function (event) {
    var set = this._events[event];
    if (!set) return;
    set.forEach(function (callback) {
      try { callback(); } catch (error) { void error; }
    });
  };

  MockYandexSDK.prototype._openModal = function (kind) {
    var root = $('ad-root') || document.body;
    var i18n = window.AureliaI18n;
    var modal = document.createElement('div');
    modal.className = 'ad-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    var card = document.createElement('div');
    card.className = 'ad-card' + (kind === 'rewarded' ? ' is-reward' : '');
    card.tabIndex = -1;
    var kicker = document.createElement('p');
    kicker.className = 'ad-kicker';
    kicker.textContent = 'AURELIA';
    var title = document.createElement('h2');
    title.className = 'ad-title';
    title.id = 'ad-title';
    title.textContent = i18n.t(kind === 'rewarded' ? 'ad.rewardedTitle' : 'ad.fullscreenTitle');
    var copy = document.createElement('p');
    copy.className = 'ad-copy';
    copy.textContent = i18n.t(kind === 'rewarded' ? 'ad.rewardedText' : 'ad.fullscreenText');
    var timer = document.createElement('div');
    timer.className = 'ad-timer';
    var ring = buildRing();
    var seconds = document.createElement('div');
    seconds.className = 'ad-seconds';
    timer.appendChild(ring.svg);
    timer.appendChild(seconds);
    var status = document.createElement('p');
    status.className = 'ad-status';
    status.textContent = i18n.t('ad.paused');
    var note = document.createElement('p');
    note.className = 'ad-note';
    note.textContent = i18n.t('ad.mockNote');
    card.appendChild(kicker);
    card.appendChild(title);
    card.appendChild(copy);
    card.appendChild(timer);
    card.appendChild(status);
    card.appendChild(note);
    modal.appendChild(card);
    modal.setAttribute('aria-labelledby', 'ad-title');
    root.appendChild(modal);
    var previous = document.activeElement;
    card.focus();
    var circumference = 2 * Math.PI * 46;
    ring.circle.style.strokeDasharray = String(circumference);
    ring.circle.style.strokeDashoffset = '0';
    return {
      render: function (left, total) {
        var sec = Math.max(1, Math.ceil(left / 1000));
        seconds.textContent = i18n.t('ad.countdown', { sec: String(sec) });
        ring.circle.style.strokeDashoffset = String(circumference * (1 - (left / total)));
      },
      close: function () {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        if (previous && previous.focus && document.contains(previous)) {
          try { previous.focus(); } catch (error) { void error; }
        }
      }
    };
  };

  MockYandexSDK.prototype._countdown = function (ui, total) {
    var self = this;
    return new Promise(function (resolve) {
      var elapsed = 0;
      var last = performance.now();
      function frame(now) {
        var dt = now - last;
        last = now;
        var visible = document.visibilityState === 'visible';
        if (visible) elapsed += Math.min(80, Math.max(0, dt));
        var left = Math.max(0, total - elapsed);
        ui.render(left, total);
        if (left <= 0) resolve();
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  };

  MockYandexSDK.prototype._present = function (kind, callbacks) {
    var self = this;
    if (this._showing) {
      if (callbacks.onError) callbacks.onError({ message: 'busy' });
      if (callbacks.onClose) callbacks.onClose(false);
      return;
    }
    this._showing = true;
    var ui = this._openModal(kind);
    if (callbacks.onOpen) callbacks.onOpen();
    this._emit('game_api_pause');
    this._countdown(ui, AD_PREVIEW_MS).then(function () {
      try {
        if (kind === 'rewarded' && callbacks.onRewarded) callbacks.onRewarded();
      } catch (error) { void error; }
      try {
        if (callbacks.onClose) callbacks.onClose(true);
      } catch (error) { void error; }
      ui.close();
      self._showing = false;
      self._emit('game_api_resume');
    });
  };

  function Platform(ysdk, mode) {
    this.ysdk = ysdk;
    this.mode = mode;
    this.pause = new PauseGate();
    this.adLocked = false;
    this.readySignaled = false;
    this._gameplay = false;
    var lang = navigator.language;
    if (ysdk && ysdk.environment && ysdk.environment.i18n && ysdk.environment.i18n.lang) {
      lang = ysdk.environment.i18n.lang;
    }
    this.language = resolveLang(lang);
  }

  Platform.prototype._enterAd = function () {
    this.pause.hold('ad');
    document.body.classList.add('is-ad');
  };

  Platform.prototype._exitAd = function () {
    this.pause.release('ad');
    document.body.classList.remove('is-ad');
    if (!document.hidden) this.pause.release('blur');
  };

  Platform.prototype.lockButtons = function (locked) {
    var nodes = document.querySelectorAll('[data-ad-button]');
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].classList.toggle('is-disabled', !!locked);
      if (locked) nodes[i].setAttribute('aria-disabled', 'true');
      else nodes[i].removeAttribute('aria-disabled');
    }
  };

  Platform.prototype._show = function (methodName, hooks, rewardedSlot) {
    var self = this;
    if (this.adLocked) {
      return Promise.resolve({ status: 'locked', wasShown: false, rewarded: false });
    }
    var adv = this.ysdk && this.ysdk.adv;
    if (!adv || typeof adv[methodName] !== 'function') {
      return Promise.resolve({ status: 'error', wasShown: false, rewarded: false });
    }
    this.adLocked = true;
    this.lockButtons(true);
    return new Promise(function (resolve) {
      var settled = false;
      var rewarded = false;
      var watchdog = setTimeout(function () { finish('error'); }, 180000);
      function finish(status) {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        self._exitAd();
        self.adLocked = false;
        self.lockButtons(false);
        resolve({ status: status, wasShown: status === 'shown', rewarded: rewarded });
      }
      try {
        adv[methodName]({
          callbacks: {
            onOpen: function () {
              self._enterAd();
              if (hooks && hooks.onOpen) hooks.onOpen();
            },
            onRewarded: function () {
              if (!rewardedSlot || rewarded) return;
              rewarded = true;
              if (hooks && hooks.onRewarded) hooks.onRewarded();
            },
            onClose: function (wasShown) {
              if (hooks && hooks.onClose) hooks.onClose(wasShown);
              finish(wasShown ? 'shown' : 'closed');
            },
            onError: function (error) {
              if (hooks && hooks.onError) hooks.onError(error);
              finish('error');
            }
          }
        });
      } catch (error) {
        void error;
        finish('error');
      }
    });
  };

  Platform.prototype.showFullscreenAdv = function (hooks) {
    return this._show('showFullscreenAdv', hooks, false);
  };

  Platform.prototype.showRewardedVideo = function (hooks) {
    return this._show('showRewardedVideo', hooks, true);
  };

  Platform.prototype.signalReady = function () {
    if (this.readySignaled) return;
    this.readySignaled = true;
    var loading = this.ysdk && this.ysdk.features && this.ysdk.features.LoadingAPI;
    try {
      if (loading && typeof loading.ready === 'function') loading.ready();
    } catch (error) { void error; }
    if (!this.pause.active) this.markGameplayStarted();
  };

  Platform.prototype.markGameplayStarted = function () {
    if (this._gameplay || !this.readySignaled || this.pause.active) return;
    this._gameplay = true;
    var api = this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI;
    try { if (api && typeof api.start === 'function') api.start(); } catch (error) { void error; }
  };

  Platform.prototype.markGameplayStopped = function () {
    if (!this._gameplay) return;
    this._gameplay = false;
    var api = this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI;
    try { if (api && typeof api.stop === 'function') api.stop(); } catch (error) { void error; }
  };

  function bindFocus(pause) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause.hold('hidden');
      else pause.release('hidden');
    }, true);
    window.addEventListener('pagehide', function () { pause.hold('hidden'); }, true);
    window.addEventListener('pageshow', function () {
      if (!document.hidden) pause.release('hidden');
    }, true);
    window.addEventListener('blur', function () { pause.hold('blur'); }, true);
    window.addEventListener('focus', function () { pause.release('blur'); }, true);
    window.addEventListener('pointerdown', function () {
      if (!document.hidden) pause.release('blur');
    }, true);
    if (document.hidden) pause.hold('hidden');
    if (!document.hasFocus()) pause.hold('blur');
  }

  function attachPlatformEvents(platform) {
    var ysdk = platform.ysdk;
    if (ysdk && typeof ysdk.on === 'function') {
      ysdk.on('game_api_pause', function () { platform.pause.hold('platform'); });
      ysdk.on('game_api_resume', function () {
        platform.pause.release('platform');
        if (!document.hidden) platform.pause.release('blur');
      });
    }
    if (ysdk && typeof ysdk.bindPause === 'function') ysdk.bindPause(platform.pause);
    bindFocus(platform.pause);
  }

  function waitForYandex(maxMs) {
    return new Promise(function (resolve) {
      var script = $('yandex-sdk');
      var failed = false;
      var start = performance.now();
      if (script) script.addEventListener('error', function () { failed = true; });
      (function poll() {
        if (window.YaGames && typeof window.YaGames.init === 'function') {
          resolve(true);
          return;
        }
        if (failed || performance.now() - start >= maxMs) {
          resolve(false);
          return;
        }
        setTimeout(poll, 40);
      })();
    });
  }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { reject(new Error('sdk-timeout')); }, ms);
      promise.then(function (value) {
        clearTimeout(timer);
        resolve(value);
      }, function (error) {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async function createPlatform() {
    var local = isLocalHost();
    var ysdk = null;
    var mode = 'mock';
    if (local) {
      var previewLang = resolveLang(navigator.language);
      var sdkReady = await waitForYandex(800);
      if (sdkReady) {
        try {
          var realSdk = await withTimeout(window.YaGames.init(), 2000);
          if (realSdk && realSdk.environment && realSdk.environment.i18n && realSdk.environment.i18n.lang) {
            previewLang = resolveLang(realSdk.environment.i18n.lang);
          }
        } catch (error) {
          void error;
        }
      }
      ysdk = new MockYandexSDK();
      ysdk.environment.i18n.lang = previewLang;
      mode = 'mock';
    } else {
      var present = await waitForYandex(5000);
      if (present) {
        try {
          ysdk = await withTimeout(window.YaGames.init(), 10000);
          mode = 'yandex';
        } catch (error) {
          void error;
          ysdk = null;
          mode = 'unavailable';
        }
      } else {
        ysdk = null;
        mode = 'unavailable';
      }
    }
    var platform = new Platform(ysdk, mode);
    attachPlatformEvents(platform);
    return platform;
  }

  function installInputGuards() {
    var block = function (event) { event.preventDefault(); };
    document.addEventListener('contextmenu', block, true);
    document.addEventListener('dragstart', block, true);
    document.addEventListener('selectstart', block, true);
    document.addEventListener('gesturestart', block, true);
    document.addEventListener('touchmove', function (event) {
      if (event.touches && event.touches.length > 1) event.preventDefault();
    }, { capture: true, passive: false });
    window.addEventListener('keydown', function (event) {
      var scrollKeys = [' ', 'PageUp', 'PageDown', 'Home', 'End'];
      if (scrollKeys.indexOf(event.key) !== -1 && event.target === document.body) event.preventDefault();
    });
  }

  async function boot() {
    installInputGuards();
    var i18n = window.AureliaI18n;
    var audio = window.AureliaAudio.create();
    audio.installUnlock();
    var platform = await createPlatform();
    document.documentElement.dataset.sdk = platform.mode;
    i18n.setLang(platform.language);
    var game = null;
    platform.pause.onChange(function (paused) {
      document.body.classList.toggle('is-paused', paused);
      if (paused) {
        audio.hardPause();
        if (game) game.suspend();
        platform.markGameplayStopped();
        if (game) game.persist();
      } else {
        audio.hardResume();
        if (platform.readySignaled && game) {
          game.resume();
          platform.markGameplayStarted();
        }
      }
    });
    if (platform.pause.active) {
      document.body.classList.add('is-paused');
      audio.hardPause();
    }
    window.Aurelia = {
      i18n: i18n,
      audio: audio,
      platform: platform,
      art: window.AureliaArt
    };
    if (window.AureliaGame && typeof window.AureliaGame.start === 'function') {
      game = window.AureliaGame.start(window.Aurelia);
    }
    if (platform.pause.active) {
      if (game) game.suspend();
    } else if (game) {
      game.resume();
    }
    platform.signalReady();
    document.documentElement.dataset.ready = '1';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); }, { once: true });
  } else {
    boot();
  }
})();
