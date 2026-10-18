(function () {
  'use strict';

  var COLS = 5;
  var ROWS = 4;
  var CELLS = COLS * ROWS;
  var ENERGY_MAX = 15;
  var ENERGY_BASE = 4;
  var SAVE_KEY = 'aurelia.save.v2';
  var OFFLINE_CAP = 8 * 3600;
  var OFFLINE_RATE = 0.6;
  var OFFLINE_MIN = 60;
  var MAX_MONEY = 9.99e12;
  var MAX_CRYSTALS = 1e9;
  var REWARD_CRYSTALS = 20;
  var RUSH_MS = 5 * 60 * 1000;
  var PURSE_SECONDS = 90;

  var BRANCHES = [
    { id: 'base', pay: 'money', base: 120, growth: 2.35, max: 8 },
    { id: 'supply', pay: 'money', base: 90, growth: 1.8, max: 16 },
    { id: 'luck', pay: 'crystals', base: 8, growth: 1.75, max: 10 },
    { id: 'rent', pay: 'money', base: 250, growth: 1.72, max: 24 },
    { id: 'magnet', pay: 'crystals', base: 12, growth: 1.82, max: 10 }
  ];

  var PACKS = [
    { id: 'pouch', pay: 'crystals', cost: 4, money: 350, crystals: 0 },
    { id: 'safe', pay: 'crystals', cost: 12, money: 1400, crystals: 0 },
    { id: 'chip', pay: 'money', cost: 900, money: 0, crystals: 6 },
    { id: 'casket', pay: 'money', cost: 6000, money: 0, crystals: 40 }
  ];

  var i18n = null;
  var audio = null;
  var platform = null;
  var art = null;
  var state = null;
  var nodes = {};
  var cells = [];
  var openTab = '';
  var running = false;
  var raf = 0;
  var saveAcc = 0;
  var hudAcc = 0;
  var animTime = 0;
  var lastDraw = -1;
  var combo = 0;
  var comboAt = 0;
  var drag = null;
  var ghost = null;
  var offlineOpen = false;
  var playerPromise = null;
  var touched = false;
  var juice = null;
  var warningLeft = 0;
  var shownTier = -1;
  var tierReady = false;
  var droneAcc = 0;
  var droneFlying = false;
  var droneT = 0;
  var energyDismissed = false;
  var autoMergeAcc = 0;
  var X2_MS = 120000;
  var AUTO_MS = 60000;
  var DRONE_EVERY = 50;
  var DRONE_FLIGHT = 6.4;

  function $(id) { return document.getElementById(id); }

  function clamp(value, min, max) {
    var n = Number(value);
    if (!isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function discoveredMax() {
    var max = 0;
    for (var level = 1; level <= 15; level += 1) {
      if (state.discovered[level] || state.discovered[String(level)]) max = level;
    }
    return max;
  }

  function rollQuest(index, maxLevel) {
    var tier = Math.floor(index / 3) + 1;
    var rewardMoney = Math.round(140 * Math.pow(1.62, tier));
    var rewardCrystals = 1 + Math.floor(tier / 2);
    if (index === 0) {
      return { type: 'merge', target: 4, progress: 0, rewardMoney: 160, rewardCrystals: 2 };
    }
    if (index % 3 === 1 && maxLevel < 15) {
      return {
        type: 'discover',
        target: Math.min(15, maxLevel + 1),
        progress: 0,
        rewardMoney: rewardMoney,
        rewardCrystals: rewardCrystals + 1
      };
    }
    if (index % 3 === 2) {
      return {
        type: 'earn',
        target: Math.round(700 * Math.pow(1.8, tier)),
        progress: 0,
        rewardMoney: Math.round(rewardMoney * 1.4),
        rewardCrystals: rewardCrystals
      };
    }
    return {
      type: 'merge',
      target: 5 + tier * 4,
      progress: 0,
      rewardMoney: rewardMoney,
      rewardCrystals: rewardCrystals
    };
  }

  function fresh() {
    var grid = [];
    for (var i = 0; i < CELLS; i += 1) grid.push(0);
    grid[0] = 1;
    grid[1] = 1;
    return {
      v: 2,
      money: 0,
      crystals: 0,
      grid: grid,
      energy: ENERGY_MAX,
      energyAcc: 0,
      upgrades: { base: 0, supply: 0, luck: 0, rent: 0, magnet: 0 },
      discovered: { 1: true },
      quest: rollQuest(0, 1),
      questIndex: 0,
      boostLeftMs: 0,
      autoMergeLeftMs: 0,
      lastInterstitialAt: 0,
      magnetAcc: 0,
      pendingOffline: 0,
      codexPaid: {},
      lastSeen: Date.now(),
      savedAt: Date.now(),
      muted: false,
      langChosen: false,
      lang: 'ru'
    };
  }

  function sanitize(raw) {
    var next = fresh();
    if (!raw || raw.v !== 2) return next;
    next.money = clamp(raw.money, 0, MAX_MONEY);
    next.crystals = clamp(raw.crystals, 0, MAX_CRYSTALS);
    next.energy = clamp(raw.energy, 0, ENERGY_MAX);
    next.energyAcc = clamp(raw.energyAcc, 0, 30);
    next.boostLeftMs = clamp(raw.boostLeftMs, 0, 30 * 60 * 1000);
    next.autoMergeLeftMs = clamp(raw.autoMergeLeftMs, 0, 180000);
    next.lastInterstitialAt = clamp(raw.lastInterstitialAt, 0, Date.now() + 1000);
    next.magnetAcc = clamp(raw.magnetAcc, 0, 60);
    next.pendingOffline = clamp(raw.pendingOffline, 0, MAX_MONEY);
    next.lastSeen = clamp(raw.lastSeen, 0, Date.now() + 1000);
    next.savedAt = clamp(raw.savedAt, 0, Date.now() + 1000);
    next.questIndex = Math.floor(clamp(raw.questIndex, 0, 100000));
    next.muted = !!raw.muted;
    next.langChosen = !!raw.langChosen;
    next.lang = raw.lang === 'en' ? 'en' : 'ru';
    BRANCHES.forEach(function (def) {
      next.upgrades[def.id] = Math.floor(clamp(raw.upgrades && raw.upgrades[def.id], 0, def.max));
    });
    if (Array.isArray(raw.grid) && raw.grid.length === CELLS) {
      for (var i = 0; i < CELLS; i += 1) next.grid[i] = Math.floor(clamp(raw.grid[i], 0, 15));
    }
    next.discovered = { 1: true };
    next.codexPaid = {};
    if (raw.discovered && typeof raw.discovered === 'object') {
      for (var level = 1; level <= 15; level += 1) {
        if (raw.discovered[level] || raw.discovered[String(level)]) next.discovered[level] = true;
      }
    }
    if (raw.codexPaid && typeof raw.codexPaid === 'object') {
      for (var paid = 1; paid <= 15; paid += 1) {
        if (raw.codexPaid[paid] || raw.codexPaid[String(paid)]) next.codexPaid[paid] = true;
      }
    }
    for (var c = 0; c < CELLS; c += 1) if (next.grid[c]) next.discovered[next.grid[c]] = true;
    if (raw.quest && raw.quest.type && isFinite(raw.quest.target)) {
      next.quest = {
        type: raw.quest.type === 'discover' || raw.quest.type === 'earn' ? raw.quest.type : 'merge',
        target: Math.max(1, Number(raw.quest.target)),
        progress: Math.max(0, Number(raw.quest.progress) || 0),
        rewardMoney: Math.max(0, Number(raw.quest.rewardMoney) || 0),
        rewardCrystals: Math.max(0, Number(raw.quest.rewardCrystals) || 0)
      };
    } else {
      next.quest = rollQuest(next.questIndex, discoveredMaxOf(next));
    }
    return next;
  }

  function discoveredMaxOf(source) {
    var max = 0;
    for (var level = 1; level <= 15; level += 1) {
      if (source.discovered[level] || source.discovered[String(level)]) max = level;
    }
    return max;
  }

  function itemIncome(level) {
    if (!level) return 0;
    return Math.max(1, Math.round(Math.pow(1.9, level - 1)));
  }

  function rentMultiplier() {
    return (1 + 0.25 * state.upgrades.rent) * (state.boostLeftMs > 0 ? 2 : 1);
  }

  function incomePerSec() {
    var sum = 0;
    for (var i = 0; i < CELLS; i += 1) sum += itemIncome(state.grid[i]);
    return sum * rentMultiplier();
  }

  function energyInterval() {
    return Math.max(0.85, ENERGY_BASE / (1 + state.upgrades.supply * 0.18));
  }

  function luckRates() {
    var n = state.upgrades.luck;
    return {
      double: Math.min(0.48, n * 0.06),
      triple: Math.min(0.2, Math.max(0, n - 2) * 0.03)
    };
  }

  function magnetEvery() {
    if (!state.upgrades.magnet) return 0;
    return Math.max(4, 18 - state.upgrades.magnet * 1.4);
  }

  function priceOf(def, level) {
    return Math.round(def.base * Math.pow(def.growth, level));
  }

  function formatCompact(value) {
    var n = Math.floor(Math.max(0, Number(value) || 0));
    var locale = i18n.lang === 'ru' ? 'ru-RU' : 'en-US';
    if (n < 10000) return new Intl.NumberFormat(locale).format(n);
    var units = i18n.lang === 'ru' ? ['', ' тыс.', ' млн', ' млрд', ' трлн'] : ['', 'K', 'M', 'B', 'T'];
    var unit = 0;
    var scaled = n;
    while (scaled >= 1000 && unit < units.length - 1) {
      scaled /= 1000;
      unit += 1;
    }
    var digits = scaled >= 100 ? 0 : (scaled >= 10 ? 1 : 2);
    return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(scaled) + units[unit];
  }

  function formatIncome(value) {
    var locale = i18n.lang === 'ru' ? 'ru-RU' : 'en-US';
    var body = value < 100
      ? new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
      : formatCompact(value);
    return body + i18n.t('currency.perSec');
  }

  function formatSeconds(value) {
    var locale = i18n.lang === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.NumberFormat(locale, { maximumFractionDigits: value >= 10 ? 0 : 1 }).format(value);
  }

  function formatClock(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    return minutes + ':' + String(seconds).padStart(2, '0');
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return fresh();
      return sanitize(JSON.parse(raw));
    } catch (error) {
      void error;
      return fresh();
    }
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(state));
  }

  function player() {
    if (!playerPromise) {
      var ysdk = platform && platform.ysdk;
      if (!ysdk || typeof ysdk.getPlayer !== 'function') playerPromise = Promise.resolve(null);
      else playerPromise = ysdk.getPlayer().catch(function () { return null; });
    }
    return playerPromise;
  }

  function saveCloud() {
    player().then(function (profile) {
      if (!profile || typeof profile.setData !== 'function') return null;
      return profile.setData(snapshot());
    }).catch(function () { return null; });
  }

  function save() {
    state.savedAt = Date.now();
    state.lastSeen = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) { void error; }
    saveCloud();
  }

  function loadCloud() {
    return player().then(function (profile) {
      if (!profile || typeof profile.getData !== 'function') return null;
      return profile.getData();
    }).then(function (data) {
      if (!data) return null;
      if (data.v === 2) return sanitize(data);
      if (data.data && data.data.v === 2) return sanitize(data.data);
      return null;
    }).catch(function () { return null; });
  }

  function captureOffline() {
    var elapsed = Math.max(0, (Date.now() - (state.lastSeen || Date.now())) / 1000);
    if (elapsed >= OFFLINE_MIN) {
      var gain = Math.floor(incomePerSec() * Math.min(OFFLINE_CAP, elapsed) * OFFLINE_RATE);
      if (gain > 0) state.pendingOffline = (state.pendingOffline || 0) + gain;
    }
    if (state.boostLeftMs > 0) state.boostLeftMs = Math.max(0, state.boostLeftMs - elapsed * 1000);
    if (state.autoMergeLeftMs > 0) state.autoMergeLeftMs = Math.max(0, state.autoMergeLeftMs - elapsed * 1000);
    state.lastSeen = Date.now();
  }

  function toast(text) {
    var host = nodes.toasts;
    if (!host) return;
    var node = document.createElement('div');
    node.className = 'toast';
    node.textContent = text;
    host.appendChild(node);
    while (host.children.length > 3) host.removeChild(host.firstChild);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 1700);
  }

  function deny(button) {
    if (!button) return;
    button.classList.remove('is-deny');
    void button.offsetWidth;
    button.classList.add('is-deny');
  }

  function filledCount() {
    var count = 0;
    for (var i = 0; i < CELLS; i += 1) if (state.grid[i]) count += 1;
    return count;
  }

  function emptyIndexes() {
    var list = [];
    for (var i = 0; i < CELLS; i += 1) if (!state.grid[i]) list.push(i);
    return list;
  }

  function questRatio() {
    if (!state.quest) return 0;
    if (state.quest.type === 'discover') return state.quest.progress >= 1 ? 1 : 0;
    if (!state.quest.target) return 0;
    return Math.max(0, Math.min(1, state.quest.progress / state.quest.target));
  }

  function questReady() {
    return questRatio() >= 1;
  }

  function questTitle() {
    var quest = state.quest;
    if (quest.type === 'discover') return i18n.t('play.questDiscover', { target: String(quest.target) });
    if (quest.type === 'earn') return i18n.t('play.questEarn', { target: formatCompact(quest.target) });
    return i18n.t('play.questMerge', { target: formatCompact(quest.target) });
  }

  function questCount() {
    if (state.quest.type === 'discover') return (state.quest.progress >= 1 ? '1' : '0') + ' / 1';
    var current = Math.min(state.quest.progress, state.quest.target);
    return i18n.t('quest.progress', {
      current: formatCompact(current),
      target: formatCompact(state.quest.target)
    });
  }

  function cellPoint(index) {
    var cell = cells[index];
    if (!cell) {
      var board = nodes.board ? nodes.board.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
      return { x: board.left + board.width / 2, y: board.top + board.height / 2 };
    }
    var rect = cell.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function codexInfo(level) {
    var open = !!(state.discovered[level] || state.discovered[String(level)]);
    return {
      open: open,
      name: i18n.t('items.' + level + '.name'),
      reward: state.codexPaid && state.codexPaid[level] ? level * 2 : 0
    };
  }

  function noteDiscover(level, index) {
    if (level < 1 || level > 15 || state.discovered[level]) return;
    state.discovered[level] = true;
    state.codexPaid[level] = true;
    var reward = level * 2;
    state.crystals = Math.min(MAX_CRYSTALS, state.crystals + reward);
    if (state.quest.type === 'discover' && level >= state.quest.target) state.quest.progress = 1;
    audio.playNewLevelUnlock();
    toast(i18n.t('play.discovered', { name: i18n.t('items.' + level + '.name') }));
    if (!juice) return;
    var point = cellPoint(index);
    juice.burst(point.x, point.y, 'confetti');
    juice.floatText(point.x, point.y - 8, i18n.t('monetize.newLevel'), 'star');
    juice.floatText(point.x, point.y + 16, '+' + reward + ' 💎', 'crystal');
    juice.shake(14);
    juice.kick(index, 'merge');
    juice.refreshCodex();
  }

  function noteMerge(index, level) {
    var now = performance.now();
    combo = now - comboAt < 2200 ? combo + 1 : 1;
    comboAt = now;
    audio.playMerge(combo);
    if (state.quest.type === 'merge') state.quest.progress += 1;
    if (!juice) return;
    var point = cellPoint(index);
    var payout = Math.round(itemIncome(level) * rentMultiplier());
    juice.burst(point.x, point.y, combo >= 3 ? 'star' : 'spark');
    juice.floatText(point.x, point.y, '+' + formatCompact(payout) + ' 💰', 'gold');
    if (combo >= 2) juice.floatText(point.x, point.y - 20, i18n.t('monetize.combo', { n: String(combo) }), 'fire');
    if (combo >= 3) juice.shake(5 + combo * 1.4);
    juice.kick(index, 'merge');
  }

  function mergeAt(source, target) {
    if (source === target || source < 0 || target < 0) return false;
    var from = state.grid[source];
    var onto = state.grid[target];
    if (!from) return false;
    if (!onto) {
      state.grid[target] = from;
      state.grid[source] = 0;
      audio.playSpawn();
      if (juice) juice.kick(target, 'spawn');
    } else if (from === onto && from < 15) {
      state.grid[target] = from + 1;
      state.grid[source] = 0;
      noteMerge(target, from + 1);
      noteDiscover(from + 1, target);
      popCell(target);
    } else if (from === onto) {
      toast(i18n.t('play.maxItem'));
      return false;
    } else {
      state.grid[source] = onto;
      state.grid[target] = from;
      audio.playSpawn();
    }
    renderBoard();
    renderHud();
    save();
    return true;
  }

  function popCell(index) {
    var cell = cells[index];
    if (!cell) return;
    cell.classList.remove('is-pop');
    void cell.offsetWidth;
    cell.classList.add('is-pop');
  }

  function pulseCell(index) {
    var cell = cells[index];
    if (!cell) return;
    cell.classList.remove('is-pulse');
    void cell.offsetWidth;
    cell.classList.add('is-pulse');
    flyCoin(index);
    if (juice && state.grid[index]) {
      var point = cellPoint(index);
      var payout = Math.round(itemIncome(state.grid[index]) * rentMultiplier());
      if (payout > 0) juice.floatText(point.x, point.y, '+' + formatCompact(payout) + ' 💰', 'gold');
    }
  }

  function flyCoin(index) {
    var cell = cells[index];
    if (!cell || !nodes.board) return;
    var from = cell.getBoundingClientRect();
    var board = nodes.board.getBoundingClientRect();
    var coin = document.createElement('i');
    coin.className = 'fly-coin';
    coin.style.left = (from.left - board.left + from.width / 2) + 'px';
    coin.style.top = (from.top - board.top + from.height * 0.32) + 'px';
    nodes.board.appendChild(coin);
    setTimeout(function () {
      if (coin.parentNode) coin.parentNode.removeChild(coin);
    }, 720);
  }

  function spawnCount() {
    var rates = luckRates();
    var roll = Math.random();
    if (roll < rates.triple) return 3;
    if (roll < rates.triple + rates.double) return 2;
    return 1;
  }

  function spawnPiece() {
    if (platform && platform.pause && platform.pause.active) return;
    if (state.energy < 1) {
      deny(nodes.spawn);
      toast(i18n.t('play.noEnergy'));
      syncEnergyOffer();
      return;
    }
    var holes = emptyIndexes();
    if (!holes.length) {
      deny(nodes.spawn);
      toast(i18n.t('play.boardFull'));
      return;
    }
    var count = Math.min(spawnCount(), holes.length);
    var level = Math.min(14, 1 + state.upgrades.base);
    state.energy -= 1;
    for (var i = 0; i < count; i += 1) {
      var pick = holes.splice(Math.floor(Math.random() * holes.length), 1)[0];
      state.grid[pick] = level;
      noteDiscover(level, pick);
      if (juice) juice.kick(pick, 'spawn');
      popCell(pick);
    }
    audio.playSpawn();
    if (count > 1) audio.playMerge(count);
    renderBoard();
    renderHud();
    syncEnergyOffer();
    save();
  }

  function regen(seconds) {
    if (seconds <= 0 || state.energy >= ENERGY_MAX) return;
    state.energyAcc += seconds;
    var interval = energyInterval();
    while (state.energy < ENERGY_MAX && state.energyAcc >= interval) {
      state.energy += 1;
      state.energyAcc -= interval;
    }
    if (state.energy >= ENERGY_MAX) state.energyAcc = 0;
  }

  function autoMerge() {
    var best = 99;
    var first = -1;
    var second = -1;
    for (var i = 0; i < CELLS; i += 1) {
      var level = state.grid[i];
      if (!level || level >= 15 || level > best) continue;
      for (var j = i + 1; j < CELLS; j += 1) {
        if (state.grid[j] === level) {
          best = level;
          first = i;
          second = j;
          break;
        }
      }
    }
    if (first >= 0) mergeAt(first, second);
  }

  function claimQuest() {
    if (!questReady()) return;
    var reward = state.quest;
    state.money = Math.min(MAX_MONEY, state.money + reward.rewardMoney);
    state.crystals = Math.min(MAX_CRYSTALS, state.crystals + reward.rewardCrystals);
    audio.playCoin();
    toast(reward.rewardCrystals
      ? i18n.t('play.claimGems', { money: formatCompact(reward.rewardMoney), crystals: String(reward.rewardCrystals) })
      : i18n.t('play.claim', { money: formatCompact(reward.rewardMoney) }));
    state.questIndex += 1;
    state.quest = rollQuest(state.questIndex, discoveredMax());
    if (state.quest.type === 'discover' && state.discovered[state.quest.target]) state.quest.progress = 1;
    renderHud();
    if (openTab) buildSheet();
    save();
  }

  function fitCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (w < 2 || h < 2) return null;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w: w, h: h };
  }

  function drawBoard(time) {
    for (var i = 0; i < cells.length; i += 1) {
      var canvas = cells[i].querySelector('canvas');
      var box = fitCanvas(canvas);
      if (!box) continue;
      var level = state.grid[i];
      var ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, box.w, box.h);
      if (!level) continue;
      var size = Math.min(box.w, box.h);
      var pose = juice ? juice.pose(i) : { x: 1, y: 1 };
      ctx.save();
      ctx.translate(box.w / 2, box.h / 2);
      ctx.scale(pose.x, pose.y);
      ctx.translate(-size / 2, -size / 2);
      art.paintItem(ctx, level, size, time + i * 0.17);
      ctx.restore();
    }
  }

  function drawRoom(time) {
    var box = fitCanvas(nodes.room);
    if (!box) return;
    art.paintRoom(nodes.room.getContext('2d'), box.w, box.h, {
      maxLevel: discoveredMax(),
      rentLevel: state.upgrades.rent
    }, time);
  }

  function renderBoard() {
    var filled = 0;
    for (var i = 0; i < cells.length; i += 1) {
      var level = state.grid[i];
      if (level) filled += 1;
      cells[i].classList.toggle('has-item', !!level);
      var badge = cells[i].querySelector('.cell-level');
      badge.textContent = level ? String(level) : '';
      cells[i].setAttribute('aria-label', level
        ? i18n.t('items.' + level + '.name')
        : i18n.t('grid.cell', { n: String(i + 1) }));
    }
    nodes.gridCount.textContent = i18n.t('grid.count', { filled: String(filled), total: String(CELLS) });
    var tier = art.visualTier(discoveredMax(), state.upgrades.rent);
    nodes.roomName.textContent = i18n.t('rooms.' + tier + '.name');
    nodes.roomBlurb.textContent = i18n.t('rooms.' + tier + '.blurb');
    considerStage(tier);
  }

  function renderHud() {
    var income = incomePerSec();
    nodes.money.textContent = formatCompact(state.money);
    nodes.crystals.textContent = formatCompact(state.crystals);
    nodes.income.textContent = formatIncome(income);
    nodes.incomePill.classList.toggle('is-boosted', state.boostLeftMs > 0);
    nodes.spawnCount.textContent = i18n.t('play.energy', {
      current: String(Math.floor(state.energy)),
      max: String(ENERGY_MAX)
    });
    var interval = energyInterval();
    var charge = state.energy >= ENERGY_MAX ? 1 : state.energyAcc / interval;
    nodes.energyFill.style.width = Math.max(0, Math.min(100, charge * 100)) + '%';
    nodes.spawn.classList.toggle('is-empty', state.energy < 1);
    nodes.kicker.textContent = i18n.t('quest.kicker');
    nodes.questTitle.textContent = questTitle();
    nodes.questCount.textContent = questCount();
    var ratio = questRatio();
    nodes.questFill.style.width = (ratio * 100).toFixed(1) + '%';
    nodes.questTrack.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    nodes.questTrack.setAttribute('aria-valuetext', questTitle());
    var ready = questReady();
    nodes.claim.hidden = !ready;
    if (ready) {
      nodes.claim.textContent = state.quest.rewardCrystals
        ? i18n.t('play.claimGems', {
          money: formatCompact(state.quest.rewardMoney),
          crystals: String(state.quest.rewardCrystals)
        })
        : i18n.t('play.claim', { money: formatCompact(state.quest.rewardMoney) });
    }
    renderAffordance();
    renderOffers();
    var rush = $('rush-timer');
    if (rush) {
      rush.textContent = state.boostLeftMs > 0
        ? i18n.t('boost.rush.active', { time: formatClock(state.boostLeftMs) })
        : '';
    }
  }

  function branchNow(def) {
    var level = state.upgrades[def.id];
    if (def.id === 'base') return i18n.t('branch.baseNow', { level: String(1 + level) });
    if (def.id === 'supply') return i18n.t('branch.supplyNow', { seconds: formatSeconds(energyInterval()) });
    if (def.id === 'luck') {
      var rates = luckRates();
      return i18n.t('branch.luckNow', {
        double: String(Math.round(rates.double * 100)),
        triple: String(Math.round(rates.triple * 100))
      });
    }
    if (def.id === 'rent') {
      var locale = i18n.lang === 'ru' ? 'ru-RU' : 'en-US';
      var mult = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(1 + 0.25 * level);
      return i18n.t('branch.rentNow', { mult: mult });
    }
    if (!level) return i18n.t('branch.magnetOff');
    return i18n.t('branch.magnetNow', { seconds: formatSeconds(magnetEvery()) });
  }

  function renderAffordance() {
    var buttons = document.querySelectorAll('[data-pay]');
    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      var cost = Number(button.dataset.cost);
      var broke = button.dataset.maxed === '1' || (button.dataset.pay === 'crystals' ? state.crystals < cost : state.money < cost);
      button.classList.toggle('is-broke', broke);
    }
  }

  function makeCard(title, desc) {
    var card = document.createElement('article');
    card.className = 'card';
    var top = document.createElement('div');
    top.className = 'card-top';
    var heading = document.createElement('h3');
    heading.className = 'card-title';
    heading.textContent = title;
    var level = document.createElement('span');
    level.className = 'card-level';
    top.appendChild(heading);
    top.appendChild(level);
    var text = document.createElement('p');
    text.className = 'card-desc';
    text.textContent = desc;
    var now = document.createElement('p');
    now.className = 'card-effect';
    card.appendChild(top);
    card.appendChild(text);
    card.appendChild(now);
    return card;
  }

  function fillBranch(card, def) {
    var level = state.upgrades[def.id];
    var maxed = level >= def.max;
    var price = maxed ? 0 : priceOf(def, level);
    card.querySelector('.card-level').textContent = i18n.t('branch.level', { level: String(level), max: String(def.max) });
    card.querySelector('.card-effect').textContent = branchNow(def);
    var button = card.querySelector('.buy');
    button.dataset.pay = def.pay;
    button.dataset.cost = String(price);
    button.dataset.maxed = maxed ? '1' : '0';
    if (maxed) button.textContent = i18n.t('branch.maxed');
    else if (def.pay === 'crystals') button.textContent = i18n.t('branch.buyGems', { price: formatCompact(price) });
    else button.textContent = i18n.t('branch.buy', { price: formatCompact(price) });
  }

  function buyBranch(def, button) {
    var level = state.upgrades[def.id];
    if (level >= def.max) return;
    var price = priceOf(def, level);
    if (def.pay === 'crystals' ? state.crystals < price : state.money < price) {
      deny(button);
      toast(i18n.t(def.pay === 'crystals' ? 'toast.brokeCrystals' : 'toast.brokeMoney'));
      return;
    }
    if (def.pay === 'crystals') state.crystals -= price;
    else state.money -= price;
    state.upgrades[def.id] = level + 1;
    audio.playUpgrade();
    fillBranch(button.closest('.card'), def);
    renderBoard();
    renderHud();
    save();
  }

  function buyPack(def, button) {
    if (def.pay === 'crystals' ? state.crystals < def.cost : state.money < def.cost) {
      deny(button);
      toast(i18n.t(def.pay === 'crystals' ? 'toast.brokeCrystals' : 'toast.brokeMoney'));
      return;
    }
    if (def.pay === 'crystals') state.crystals -= def.cost;
    else state.money -= def.cost;
    if (def.money) state.money = Math.min(MAX_MONEY, state.money + def.money);
    if (def.crystals) state.crystals = Math.min(MAX_CRYSTALS, state.crystals + def.crystals);
    audio.playCoin();
    toast(i18n.t('toast.bought', { name: i18n.t('pack.' + def.id + '.name') }));
    renderHud();
    save();
  }

  function whenResumed(fn) {
    if (!platform || !platform.pause.active) {
      fn();
      return;
    }
    var off = platform.pause.onChange(function (paused) {
      if (!paused) {
        off();
        fn();
      }
    });
  }

  function watchAd(kind) {
    if (!platform) return;
    if (platform.adLocked) {
      toast(i18n.t('toast.adLocked'));
      return;
    }
    var granted = false;
    var gained = 0;
    var request = kind === 'break'
      ? platform.showFullscreenAdv()
      : platform.showRewardedVideo({
        onRewarded: function () {
          granted = true;
          if (kind === 'gems') state.crystals = Math.min(MAX_CRYSTALS, state.crystals + REWARD_CRYSTALS);
          if (kind === 'x2') state.boostLeftMs = Math.min(6 * 60 * 1000, state.boostLeftMs + X2_MS);
          if (kind === 'auto') state.autoMergeLeftMs = Math.min(180000, state.autoMergeLeftMs + AUTO_MS);
          if (kind === 'energy') grantEnergyBundle();
          if (kind === 'drone') dropDroneReward();
          if (kind === 'rush') state.boostLeftMs = Math.min(30 * 60 * 1000, state.boostLeftMs + RUSH_MS);
          if (kind === 'purse') {
            gained = Math.max(100, Math.round(incomePerSec() * PURSE_SECONDS));
            state.money = Math.min(MAX_MONEY, state.money + gained);
            if (state.quest.type === 'earn') state.quest.progress += gained;
          }
          save();
        }
      });
    request.then(function (result) {
      if (result.status === 'locked') toast(i18n.t('toast.adLocked'));
      else if (result.status === 'error') toast(i18n.t('toast.adFailed'));
      else if (granted) {
        whenResumed(function () {
          if (kind === 'rush' || kind === 'x2' || kind === 'auto') audio.playMerge(2);
          else audio.playCoin();
          if (kind === 'gems') toast(i18n.t('toast.rewardCrystals', { amount: String(REWARD_CRYSTALS) }));
          if (kind === 'rush' || kind === 'x2') toast(i18n.t('toast.rush'));
          if (kind === 'auto') toast(i18n.t('monetize.autoActive', { time: formatClock(state.autoMergeLeftMs) }));
          if (kind === 'purse') toast(i18n.t('toast.rewardMoney', { amount: formatCompact(gained) }));
          renderBoard();
          renderHud();
        });
      } else if (kind === 'break' && result.wasShown) {
        whenResumed(function () { toast(i18n.t('toast.break')); });
      }
    });
  }

  function buildUpgrades(host) {
    var stack = document.createElement('div');
    stack.className = 'stack';
    BRANCHES.forEach(function (def) {
      var card = makeCard(i18n.t('branch.' + def.id + '.name'), i18n.t('branch.' + def.id + '.desc'));
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'buy';
      button.addEventListener('click', function () { buyBranch(def, button); });
      card.appendChild(button);
      fillBranch(card, def);
      stack.appendChild(card);
    });
    host.appendChild(stack);
  }

  function buildShop(host) {
    var label = document.createElement('p');
    label.className = 'section-label';
    label.textContent = i18n.t('shop.packs');
    host.appendChild(label);
    var stack = document.createElement('div');
    stack.className = 'stack';
    PACKS.forEach(function (def) {
      var card = makeCard(i18n.t('pack.' + def.id + '.name'), i18n.t('pack.' + def.id + '.desc'));
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'buy';
      button.dataset.pay = def.pay;
      button.dataset.cost = String(def.cost);
      button.dataset.maxed = '0';
      button.textContent = i18n.t(def.pay === 'crystals' ? 'shop.payCrystals' : 'shop.payMoney', {
        price: formatCompact(def.cost)
      });
      button.addEventListener('click', function () { buyPack(def, button); });
      card.appendChild(button);
      stack.appendChild(card);
    });
    host.appendChild(stack);
    var albumLabel = document.createElement('p');
    albumLabel.className = 'section-label';
    var openCount = discoveredMax() === 0 ? 0 : Object.keys(state.discovered).length;
    albumLabel.textContent = i18n.t('album.title') + ' · ' + i18n.t('album.progress', { open: String(openCount), total: '15' });
    host.appendChild(albumLabel);
    var hint = document.createElement('p');
    hint.className = 'sheet-note';
    hint.textContent = i18n.t('album.hint');
    host.appendChild(hint);
    var album = document.createElement('div');
    album.className = 'album';
    for (var level = 1; level <= 15; level += 1) {
      var unlocked = !!state.discovered[level];
      var card = document.createElement(unlocked ? 'button' : 'div');
      card.className = 'album-card' + (unlocked ? '' : ' is-locked');
      if (unlocked) card.type = 'button';
      var canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      if (unlocked) art.paintItem(canvas.getContext('2d'), level, 128, animTime);
      else {
        canvas.getContext('2d').clearRect(0, 0, 128, 128);
        var sealed = canvas.getContext('2d');
        sealed.fillStyle = '#3a322b';
        sealed.fillRect(24, 28, 80, 72);
        sealed.strokeStyle = '#e4b15a';
        sealed.strokeRect(24, 28, 80, 72);
      }
      var name = document.createElement('strong');
      name.textContent = unlocked ? i18n.t('items.' + level + '.name') : i18n.t('album.locked');
      card.appendChild(canvas);
      card.appendChild(name);
      if (unlocked) {
        (function (itemLevel) {
          card.addEventListener('click', function () {
            audio.playSpawn();
            toast(i18n.t('items.' + itemLevel + '.desc'));
          });
        })(level);
      }
      album.appendChild(card);
    }
    host.appendChild(album);
  }

  function buildBoosters(host) {
    var specs = [
      { kind: 'gems', title: 'boost.gems.title', desc: 'boost.gems.desc', label: i18n.t('boost.gems.button', { amount: String(REWARD_CRYSTALS) }) },
      { kind: 'rush', title: 'boost.rush.title', desc: 'boost.rush.desc', label: i18n.t('boost.rush.button', { minutes: '5' }), timer: true },
      { kind: 'purse', title: 'boost.purse.title', desc: 'boost.purse.desc', label: i18n.t('boost.purse.button', { seconds: String(PURSE_SECONDS) }) },
      { kind: 'break', title: 'boost.break.title', desc: 'boost.break.desc', label: i18n.t('boost.break.button'), quiet: true }
    ];
    var stack = document.createElement('div');
    stack.className = 'stack';
    specs.forEach(function (spec) {
      var card = makeCard(i18n.t(spec.title), i18n.t(spec.desc));
      if (spec.timer) {
        var timer = document.createElement('p');
        timer.id = 'rush-timer';
        timer.className = 'card-effect';
        timer.textContent = state.boostLeftMs > 0 ? i18n.t('boost.rush.active', { time: formatClock(state.boostLeftMs) }) : '';
        card.appendChild(timer);
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = spec.quiet ? 'buy buy-quiet' : 'buy';
      button.setAttribute('data-ad-button', spec.kind);
      button.textContent = spec.label;
      button.addEventListener('click', function () { watchAd(spec.kind); });
      card.appendChild(button);
      stack.appendChild(card);
    });
    host.appendChild(stack);
  }

  function buildSheet() {
    var scroll = nodes.sheetScroll.scrollTop;
    nodes.sheetScroll.textContent = '';
    nodes.sheetTitle.textContent = i18n.t('sheet.' + openTab);
    var note = document.createElement('p');
    note.className = 'sheet-note';
    note.textContent = openTab === 'boosters' ? i18n.t('boost.optional') : questTitle();
    nodes.sheetScroll.appendChild(note);
    if (openTab === 'upgrades') buildUpgrades(nodes.sheetScroll);
    if (openTab === 'shop') buildShop(nodes.sheetScroll);
    if (openTab === 'boosters') buildBoosters(nodes.sheetScroll);
    renderAffordance();
    if (platform && platform.adLocked) platform.lockButtons(true);
    nodes.sheetScroll.scrollTop = scroll;
  }

  function setTab(tab) {
    if (openTab === tab) {
      closeSheet();
      return;
    }
    openTab = tab;
    ['upgrades', 'shop', 'boosters'].forEach(function (name) {
      var button = $('tab-' + name);
      var active = name === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    nodes.sheet.hidden = false;
    nodes.sheet.inert = false;
    nodes.sheet.setAttribute('aria-hidden', 'false');
    buildSheet();
    requestAnimationFrame(function () { nodes.sheet.classList.add('is-open'); });
  }

  function closeSheet() {
    openTab = '';
    ['upgrades', 'shop', 'boosters'].forEach(function (name) {
      var button = $('tab-' + name);
      button.classList.remove('is-active');
      button.setAttribute('aria-selected', 'false');
    });
    nodes.sheet.classList.remove('is-open');
    nodes.sheet.setAttribute('aria-hidden', 'true');
    var finish = function () {
      if (openTab) return;
      nodes.sheet.hidden = true;
      nodes.sheet.inert = true;
    };
    nodes.sheet.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 340);
  }

  function cellAt(x, y) {
    var best = -1;
    var bestDist = Infinity;
    for (var i = 0; i < cells.length; i += 1) {
      var rect = cells[i].getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dist = Math.hypot(x - cx, y - cy);
      var limit = Math.max(rect.width, rect.height) * 0.68;
      if (dist < limit && dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    return best;
  }

  function clearMarks() {
    for (var i = 0; i < cells.length; i += 1) {
      cells[i].classList.remove('is-match', 'is-snap', 'is-dragging');
    }
  }

  function markDrag(index) {
    clearMarks();
    var level = state.grid[index];
    cells[index].classList.add('is-dragging');
    for (var i = 0; i < CELLS; i += 1) {
      if (i !== index && state.grid[i] === level) cells[i].classList.add('is-match');
    }
  }

  function markSnap(index) {
    for (var i = 0; i < cells.length; i += 1) cells[i].classList.toggle('is-snap', i === index);
  }

  function ensureGhost() {
    if (ghost) return ghost;
    ghost = document.createElement('canvas');
    ghost.className = 'drag-ghost';
    ghost.width = 160;
    ghost.height = 160;
    ghost.hidden = true;
    document.body.appendChild(ghost);
    return ghost;
  }

  function showGhost(level, x, y) {
    var node = ensureGhost();
    node.hidden = false;
    art.paintItem(node.getContext('2d'), level, 160, animTime);
    var pose = juice ? juice.ghostPose() : { x: 1, y: 1 };
    node.style.transform = 'scale(' + pose.x.toFixed(3) + ',' + pose.y.toFixed(3) + ')';
    node.style.left = x + 'px';
    node.style.top = y + 'px';
  }

  function hideGhost() {
    if (ghost) ghost.hidden = true;
  }

  function endDrag() {
    clearMarks();
    hideGhost();
    if (juice) juice.dragEnd();
    drag = null;
  }

  function pointerDown(event) {
    if (offlineOpen || warningLeft > 0) return;
    if (event.button !== undefined && event.button !== 0) return;
    var cell = event.target.closest ? event.target.closest('.cell') : null;
    if (!cell || !nodes.grid.contains(cell)) return;
    var index = Number(cell.dataset.index);
    if (!state.grid[index]) return;
    touched = true;
    drag = {
      pointerId: event.pointerId,
      index: index,
      originX: event.clientX,
      originY: event.clientY,
      active: false
    };
    if (nodes.grid.setPointerCapture) {
      try { nodes.grid.setPointerCapture(event.pointerId); } catch (error) { void error; }
    }
  }

  function pointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    var dx = event.clientX - drag.originX;
    var dy = event.clientY - drag.originY;
    if (!drag.active && dx * dx + dy * dy < 36) return;
    if (!drag.active) {
      drag.active = true;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      markDrag(drag.index);
      if (juice) juice.kick(drag.index, 'drag');
      showGhost(state.grid[drag.index], event.clientX, event.clientY);
    }
    event.preventDefault();
    var speed = 0;
    if (drag.lastX != null) speed = Math.hypot(event.clientX - drag.lastX, event.clientY - drag.lastY);
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    if (juice) juice.dragSpeed(speed);
    showGhost(state.grid[drag.index], event.clientX, event.clientY);
    markSnap(cellAt(event.clientX, event.clientY));
  }

  function pointerUp(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    var from = drag.index;
    var active = drag.active;
    var x = event.clientX;
    var y = event.clientY;
    endDrag();
    if (!active) return;
    var target = cellAt(x, y);
    if (target >= 0) mergeAt(from, target);
  }

  function currentPeak() {
    var peak = Math.min(14, 1 + state.upgrades.base);
    for (var i = 0; i < CELLS; i += 1) if (state.grid[i] > peak) peak = state.grid[i];
    return peak;
  }

  function placeLevel(level, mode) {
    var holes = emptyIndexes();
    if (!holes.length) return -1;
    var pick = holes[Math.floor(Math.random() * holes.length)];
    var safe = Math.max(1, Math.min(15, level));
    state.grid[pick] = safe;
    noteDiscover(safe, pick);
    if (juice) juice.kick(pick, mode || 'spawn');
    return pick;
  }

  function grantEnergyBundle() {
    state.energy = ENERGY_MAX;
    state.energyAcc = 0;
    energyDismissed = false;
    var rare = Math.min(15, Math.max(3, currentPeak() + 2));
    var placed = 0;
    for (var i = 0; i < 3; i += 1) {
      if (placeLevel(rare, 'spawn') >= 0) placed += 1;
    }
    if (placed < 3) {
      var gold = (3 - placed) * itemIncome(rare) * 20;
      state.money = Math.min(MAX_MONEY, state.money + gold);
    }
    if (nodes.energyOffer) nodes.energyOffer.hidden = true;
  }

  function dropDroneReward() {
    var point = cellPoint(0);
    if (nodes.board) {
      var board = nodes.board.getBoundingClientRect();
      point = { x: board.left + board.width / 2, y: board.top + 24 };
    }
    if (Math.random() < 0.6 && emptyIndexes().length) {
      var level = Math.min(15, currentPeak() + 2);
      var index = placeLevel(level, 'merge');
      if (index >= 0 && juice) {
        var at = cellPoint(index);
        juice.burst(at.x, at.y, 'confetti');
        juice.floatText(at.x, at.y, i18n.t('monetize.chestItem', { name: i18n.t('items.' + level + '.name') }), 'star');
        juice.shake(10);
      }
      return;
    }
    var gold = Math.max(250, Math.round(incomePerSec() * 45));
    state.money = Math.min(MAX_MONEY, state.money + gold);
    if (state.quest.type === 'earn') state.quest.progress += gold;
    if (juice) {
      juice.burst(point.x, point.y, 'star');
      juice.floatText(point.x, point.y, i18n.t('monetize.chestGold', { amount: formatCompact(gold) }), 'gold');
      juice.shake(8);
    }
    audio.playCoin();
  }

  function syncEnergyOffer() {
    if (!nodes.energyOffer) return;
    if (state.energy > 0) {
      energyDismissed = false;
      nodes.energyOffer.hidden = true;
      return;
    }
    if (energyDismissed || warningLeft > 0 || offlineOpen) return;
    nodes.energyOffer.hidden = false;
    nodes.energyAd.textContent = i18n.t('monetize.energyOffer');
    nodes.energyDismiss.textContent = i18n.t('monetize.later');
  }

  function renderOffers() {
    if (!nodes.x2Label) return;
    nodes.x2Label.textContent = state.boostLeftMs > 0
      ? i18n.t('monetize.x2active', { time: formatClock(state.boostLeftMs) })
      : i18n.t('monetize.x2');
    nodes.x2Fill.style.width = Math.max(0, Math.min(100, state.boostLeftMs / X2_MS * 100)) + '%';
    nodes.autoLabel.textContent = state.autoMergeLeftMs > 0
      ? i18n.t('monetize.autoActive', { time: formatClock(state.autoMergeLeftMs) })
      : i18n.t('monetize.auto');
    nodes.autoFill.style.width = Math.max(0, Math.min(100, state.autoMergeLeftMs / AUTO_MS * 100)) + '%';
    if (nodes.codex) nodes.codex.textContent = i18n.t('monetize.codex');
    syncEnergyOffer();
  }

  function considerStage(tier) {
    if (!tierReady) {
      shownTier = tier;
      tierReady = true;
      return;
    }
    if (tier <= shownTier) {
      shownTier = tier;
      return;
    }
    shownTier = tier;
    if (juice) juice.shake(12);
    var now = Date.now();
    if (now - (state.lastInterstitialAt || 0) < 180000) return;
    if (!platform || platform.adLocked || (platform.pause && platform.pause.active) || warningLeft > 0 || offlineOpen) return;
    state.lastInterstitialAt = now;
    warningLeft = 2;
    if (droneFlying && nodes.drone) {
      droneFlying = false;
      nodes.drone.hidden = true;
    }
    nodes.warning.hidden = false;
    nodes.warning.textContent = i18n.t('monetize.stageWarning', { sec: '2' });
  }

  function stepWarning(dt) {
    if (warningLeft <= 0) return;
    if (platform && platform.pause && platform.pause.active) return;
    warningLeft -= dt;
    var sec = String(Math.max(1, Math.ceil(warningLeft)));
    if (nodes.warning) nodes.warning.textContent = i18n.t('monetize.stageWarning', { sec: sec });
    if (warningLeft > 0) return;
    warningLeft = 0;
    if (nodes.warning) nodes.warning.hidden = true;
    if (platform) platform.showFullscreenAdv();
  }

  function stepDrone(dt) {
    if (!nodes.drone || warningLeft > 0 || offlineOpen) return;
    if (!droneFlying) {
      droneAcc += dt;
      if (droneAcc >= DRONE_EVERY) {
        droneAcc = 0;
        droneFlying = true;
        droneT = 0;
        nodes.drone.hidden = false;
        nodes.drone.textContent = i18n.t('monetize.drone');
      }
      return;
    }
    droneT += dt;
    var progress = droneT / DRONE_FLIGHT;
    if (progress >= 1) {
      droneFlying = false;
      nodes.drone.hidden = true;
      return;
    }
    nodes.drone.style.left = (-30 + progress * 130) + '%';
  }

  function simulate(dt) {
    if (platform && platform.pause && platform.pause.active) return;
    stepDrone(dt);
    if (state.autoMergeLeftMs > 0 && !drag) {
      state.autoMergeLeftMs = Math.max(0, state.autoMergeLeftMs - dt * 1000);
      autoMergeAcc += dt;
      if (autoMergeAcc >= 1.2) {
        autoMergeAcc = 0;
        autoMerge();
      }
    }
    var earned = incomePerSec() * dt;
    state.money = Math.min(MAX_MONEY, state.money + earned);
    if (state.quest.type === 'earn') state.quest.progress += earned;
    if (state.boostLeftMs > 0) state.boostLeftMs = Math.max(0, state.boostLeftMs - dt * 1000);
    regen(dt);
    var every = magnetEvery();
    if (every && !drag) {
      state.magnetAcc += dt;
      if (state.magnetAcc >= every) {
        state.magnetAcc = 0;
        autoMerge();
      }
    }
    for (var i = 0; i < CELLS; i += 1) {
      if (!state.grid[i]) continue;
      state.pulseAcc[i] += dt;
      if (state.pulseAcc[i] >= 1) {
        state.pulseAcc[i] -= 1;
        pulseCell(i);
      }
    }
    hudAcc += dt;
    saveAcc += dt;
    if (hudAcc >= 0.2) {
      hudAcc = 0;
      renderHud();
    }
    if (saveAcc >= 5) {
      saveAcc = 0;
      save();
    }
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.25, Math.max(0, (now - frame.last) / 1000));
    frame.last = now;
    animTime += dt;
    if (warningLeft > 0) stepWarning(dt);
    else simulate(dt);
    if (juice) juice.step(dt);
    if (animTime - lastDraw >= 0.05) {
      lastDraw = animTime;
      drawRoom(animTime);
      drawBoard(animTime);
    }
    raf = requestAnimationFrame(frame);
  }
  frame.last = 0;

  function resume() {
    if (running) return;
    running = true;
    frame.last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function suspend() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function renderSound() {
    var muted = audio.userMuted;
    nodes.sound.setAttribute('aria-pressed', muted ? 'false' : 'true');
    nodes.sound.setAttribute('aria-label', i18n.t(muted ? 'nav.soundOff' : 'nav.soundOn'));
    nodes.sound.classList.toggle('is-muted', muted);
    nodes.soundOn.hidden = muted;
    nodes.soundOff.hidden = !muted;
  }

  function showOffline(amount) {
    if (amount <= 0 || offlineOpen) return;
    offlineOpen = true;
    var root = nodes.offline;
    root.textContent = '';
    var modal = document.createElement('div');
    modal.className = 'return-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    var card = document.createElement('div');
    card.className = 'return-card';
    var kicker = document.createElement('p');
    kicker.className = 'ad-kicker';
    kicker.textContent = 'AURELIA';
    var title = document.createElement('h2');
    title.className = 'return-title';
    title.textContent = i18n.t('play.offlineTitle');
    var copy = document.createElement('p');
    copy.className = 'return-copy';
    copy.textContent = i18n.t('play.offlineBody', { amount: formatCompact(amount) });
    var claim = document.createElement('button');
    claim.type = 'button';
    claim.className = 'buy';
    claim.textContent = i18n.t('play.offlineClaim');
    var double = document.createElement('button');
    double.type = 'button';
    double.className = 'buy buy-quiet';
    double.setAttribute('data-ad-button', 'offline');
    double.textContent = i18n.t('play.offlineDouble');
    function grant(mult) {
      if (!offlineOpen) return;
      var gain = Math.floor((state.pendingOffline || 0) * mult);
      state.pendingOffline = 0;
      state.money = Math.min(MAX_MONEY, state.money + gain);
      if (state.quest.type === 'earn') state.quest.progress += gain;
      offlineOpen = false;
      root.textContent = '';
      audio.playCoin();
      toast(i18n.t('toast.rewardMoney', { amount: formatCompact(gain) }));
      renderHud();
      save();
    }
    claim.addEventListener('click', function () { grant(1); });
    double.addEventListener('click', function () {
      if (!platform || platform.adLocked) {
        toast(i18n.t('toast.adLocked'));
        return;
      }
      var doubled = false;
      platform.showRewardedVideo({
        onRewarded: function () {
          doubled = true;
          grant(2);
        }
      }).then(function (result) {
        if (!doubled) {
          if (result.status === 'error' || result.status === 'locked') toast(i18n.t(result.status === 'locked' ? 'toast.adLocked' : 'toast.adFailed'));
          grant(1);
        }
      });
    });
    card.appendChild(kicker);
    card.appendChild(title);
    card.appendChild(copy);
    card.appendChild(claim);
    card.appendChild(double);
    modal.appendChild(card);
    root.appendChild(modal);
  }

  function bind() {
    nodes = {
      money: $('money-value'),
      crystals: $('crystal-value'),
      income: $('income-value'),
      incomePill: $('pill-income'),
      kicker: $('quest-kicker'),
      questTitle: $('quest-title'),
      questCount: $('quest-count'),
      questTrack: $('quest-track'),
      questFill: $('quest-fill'),
      claim: $('quest-claim'),
      room: $('room-canvas'),
      roomName: $('room-name'),
      roomBlurb: $('room-blurb'),
      roomSection: document.querySelector('.room'),
      grid: $('merge-grid'),
      gridCount: $('grid-count'),
      board: document.querySelector('.merge-board'),
      spawn: $('btn-spawn'),
      spawnCount: $('spawn-count'),
      energyFill: $('energy-fill'),
      sound: $('btn-sound'),
      soundOn: $('icon-sound-on'),
      soundOff: $('icon-sound-off'),
      lang: $('btn-lang'),
      langCode: $('lang-code'),
      sheet: $('sheet'),
      sheetTitle: $('sheet-title'),
      sheetScroll: $('sheet-scroll'),
      toasts: $('toasts'),
      offline: $('offline-root'),
      x2: $('btn-x2'),
      x2Label: $('x2-label'),
      x2Fill: $('x2-fill'),
      auto: $('btn-auto'),
      autoLabel: $('auto-label'),
      autoFill: $('auto-fill'),
      energyOffer: $('energy-offer'),
      energyAd: $('btn-energy-ad'),
      energyDismiss: $('btn-energy-dismiss'),
      drone: $('drone'),
      warning: $('stage-warning'),
      codex: $('btn-codex')
    };
    nodes.grid.textContent = '';
    cells = [];
    state.pulseAcc = [];
    for (var i = 0; i < CELLS; i += 1) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.index = String(i);
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-rowindex', String(Math.floor(i / COLS) + 1));
      cell.setAttribute('aria-colindex', String((i % COLS) + 1));
      var canvas = document.createElement('canvas');
      var badge = document.createElement('em');
      badge.className = 'cell-level';
      cell.appendChild(canvas);
      cell.appendChild(badge);
      nodes.grid.appendChild(cell);
      cells.push(cell);
      state.pulseAcc.push(i / CELLS);
    }
    nodes.grid.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove, { passive: false });
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('pointercancel', pointerUp);
    nodes.spawn.addEventListener('click', function () {
      touched = true;
      spawnPiece();
    });
    nodes.x2.addEventListener('click', function () { watchAd('x2'); });
    nodes.auto.addEventListener('click', function () { watchAd('auto'); });
    nodes.energyAd.addEventListener('click', function () { watchAd('energy'); });
    nodes.energyDismiss.addEventListener('click', function () {
      energyDismissed = true;
      nodes.energyOffer.hidden = true;
    });
    nodes.drone.addEventListener('click', function () {
      if (!droneFlying || (platform && platform.adLocked)) return;
      droneFlying = false;
      nodes.drone.hidden = true;
      watchAd('drone');
    });
    nodes.codex.addEventListener('click', function () {
      if (juice) juice.openCodex();
    });
    nodes.claim.addEventListener('click', function () {
      touched = true;
      claimQuest();
    });
    nodes.roomSection.addEventListener('click', function () {
      touched = true;
      if (openTab) {
        closeSheet();
        return;
      }
      nodes.roomSection.classList.remove('is-tap');
      void nodes.roomSection.offsetWidth;
      nodes.roomSection.classList.add('is-tap');
      regen(1.15);
      audio.playSpawn();
      renderHud();
    });
    $('tab-upgrades').addEventListener('click', function () { setTab('upgrades'); });
    $('tab-shop').addEventListener('click', function () { setTab('shop'); });
    $('tab-boosters').addEventListener('click', function () { setTab('boosters'); });
    $('sheet-close').addEventListener('click', closeSheet);
    nodes.sound.addEventListener('click', function () {
      audio.toggleMuted();
      state.muted = audio.userMuted;
      renderSound();
      if (!audio.userMuted) audio.playSpawn();
      save();
    });
    nodes.lang.addEventListener('click', function () {
      state.langChosen = true;
      state.lang = i18n.toggle();
      nodes.langCode.textContent = state.lang === 'ru' ? 'RU' : 'EN';
      audio.playSpawn();
      save();
    });
    i18n.onChange(function () {
      nodes.langCode.textContent = i18n.lang === 'ru' ? 'RU' : 'EN';
      renderSound();
      renderBoard();
      renderHud();
      if (openTab) buildSheet();
      if (juice) juice.refreshCodex();
    });
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(function () {
        drawRoom(animTime);
        drawBoard(animTime);
      });
      observer.observe(nodes.room.parentElement);
      observer.observe(nodes.grid);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) save();
    });
    window.addEventListener('pagehide', save);
    juice = window.AureliaJuice.mount({
      stage: document.querySelector('.stage'),
      app: document.getElementById('app'),
      cells: CELLS,
      i18n: i18n,
      art: art,
      codexInfo: codexInfo
    });
    for (var kicked = 0; kicked < CELLS; kicked += 1) {
      if (state.grid[kicked]) juice.kick(kicked, 'spawn');
    }
  }

  function applyPresentation() {
    if (state.langChosen) i18n.setLang(state.lang);
    audio.setMuted(!!state.muted);
    nodes.langCode.textContent = i18n.lang === 'ru' ? 'RU' : 'EN';
    renderSound();
    renderBoard();
    renderHud();
    requestAnimationFrame(function () {
      drawRoom(animTime);
      drawBoard(animTime);
    });
    if (state.pendingOffline > 0) showOffline(state.pendingOffline);
  }

  function start(ctx) {
    i18n = ctx.i18n;
    audio = ctx.audio;
    platform = ctx.platform;
    art = window.AureliaArt;
    state = loadLocal();
    captureOffline();
    bind();
    applyPresentation();
    save();
    loadCloud().then(function (cloud) {
      if (!cloud || touched || cloud.savedAt <= state.savedAt) return;
      var pending = state.pendingOffline;
      state = cloud;
      if (!state.pulseAcc) {
        state.pulseAcc = [];
        for (var i = 0; i < CELLS; i += 1) state.pulseAcc.push(i / CELLS);
      }
      if (!state.codexPaid) state.codexPaid = {};
      tierReady = false;
      captureOffline();
      if (pending && !state.pendingOffline) state.pendingOffline = pending;
      applyPresentation();
      save();
    });
    return {
      suspend: suspend,
      resume: resume,
      persist: save
    };
  }

  window.AureliaGame = { start: start };
})();
