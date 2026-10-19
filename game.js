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
  var CLIENT_IDS = ['kirill', 'sofia', 'viktor', 'alina', 'mark', 'lera'];
  var ZONE_IDS = ['floor', 'window', 'soft', 'light', 'tech'];
  var STYLE_KEYS = ['scandi', 'loft', 'lux'];
  var ZONE_MAX = 6;
  var FEVER_MS = 15000;
  var inspireAt = 0;
  var ordersSig = '';
  var sheetSale = false;
  var styleZone = '';

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
    var rate = 8;
    try { rate = steadyIncome(); } catch (error) { rate = 8; }
    var rewardMoney = Math.max(Math.round(140 * Math.pow(1.62, tier)), Math.round(rate * 20));
    var rewardCrystals = 1 + Math.floor(tier / 2);
    if (index === 0) {
      return { type: 'merge', target: 4, progress: 0, rewardMoney: 160, rewardCrystals: 2 };
    }
    if (index % 3 === 1 && maxLevel < 15) {
      return {
        type: 'discover',
        target: Math.min(15, maxLevel + 1),
        progress: 0,
        rewardMoney: Math.max(rewardMoney, Math.round(rate * 40)),
        rewardCrystals: rewardCrystals + 1
      };
    }
    if (index % 3 === 2) {
      return {
        type: 'earn',
        target: Math.max(400, Math.round(rate * 75)),
        progress: 0,
        rewardMoney: Math.max(200, Math.round(rate * 25)),
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

  function blankZones() {
    return {
      floor: { style: 0, level: 0 },
      window: { style: 0, level: 0 },
      soft: { style: 0, level: 0 },
      light: { style: 0, level: 0 },
      tech: { style: 0, level: 0 }
    };
  }

  function playablePeak(source) {
    var grid = source.grid || [];
    var base = source.upgrades ? source.upgrades.base || 0 : 0;
    var spawn = Math.min(14, 1 + base);
    var counts = {};
    for (var i = 0; i < grid.length; i += 1) {
      var level = grid[i] || 0;
      if (!level || level >= 15) continue;
      counts[level] = (counts[level] || 0) + 1;
    }
    var paired = 0;
    var highest = 0;
    var keys = Object.keys(counts);
    for (var n = 0; n < keys.length; n += 1) {
      var lv = Number(keys[n]);
      if (lv > highest) highest = lv;
      if (counts[lv] >= 2 && lv > paired) paired = lv;
    }
    if (paired > 0) return Math.min(12, paired);
    if (highest > 1) return Math.min(12, highest - 1);
    return Math.max(1, Math.min(12, spawn));
  }

  function piecesOn(source) {
    var bag = [];
    var grid = source.grid || [];
    for (var i = 0; i < grid.length; i += 1) {
      if (grid[i] && grid[i] < 15) bag.push(grid[i]);
    }
    return bag;
  }

  function levelCounts(source) {
    var counts = {};
    var grid = source.grid || [];
    for (var i = 0; i < grid.length; i += 1) {
      var level = grid[i] || 0;
      if (!level || level >= 15) continue;
      counts[level] = (counts[level] || 0) + 1;
    }
    return counts;
  }

  function coversNeeds(needs, counts) {
    var left = {};
    var keys = Object.keys(counts);
    for (var i = 0; i < keys.length; i += 1) left[keys[i]] = counts[keys[i]];
    for (var n = 0; n < needs.length; n += 1) {
      var key = String(needs[n]);
      if (!left[key]) return false;
      left[key] -= 1;
    }
    return true;
  }

  function spendNeeds(counts, needs) {
    for (var n = 0; n < needs.length; n += 1) {
      var key = String(needs[n]);
      if (counts[key]) counts[key] -= 1;
    }
  }

  function orderRelevant(order, counts, spawn) {
    if (coversNeeds(order.needs, counts)) return true;
    for (var n = 0; n < order.needs.length; n += 1) {
      var level = order.needs[n];
      if (!counts[level] && level !== spawn) return false;
    }
    return true;
  }

  function rollOrder(source, exclude, reserved) {
    var counts = levelCounts(source);
    if (reserved && reserved.length) spendNeeds(counts, reserved);
    var bag = [];
    var keys = Object.keys(counts);
    for (var i = 0; i < keys.length; i += 1) {
      for (var n = 0; n < counts[keys[i]]; n += 1) bag.push(Number(keys[i]));
    }
    var spawn = Math.min(14, 1 + ((source.upgrades && source.upgrades.base) || 0));
    var a;
    var b;
    if (bag.length >= 2) {
      bag.sort(function (x, y) { return y - x; });
      var hero = Math.floor(Math.random() * Math.max(1, Math.ceil(bag.length / 3)));
      a = bag.splice(hero, 1)[0];
      b = bag[Math.floor(Math.random() * bag.length)];
    } else if (bag.length === 1) {
      a = bag[0];
      b = spawn;
    } else {
      a = spawn;
      b = spawn;
    }
    if (a > b) {
      var swap = a;
      a = b;
      b = swap;
    }
    var pool = [];
    var skip = exclude || [];
    for (var i = 0; i < CLIENT_IDS.length; i += 1) {
      if (skip.indexOf(CLIENT_IDS[i]) < 0) pool.push(CLIENT_IDS[i]);
    }
    if (!pool.length) pool = CLIENT_IDS.slice();
    source.orderSeq = (source.orderSeq || 0) + 1;
    return {
      uid: source.orderSeq,
      client: pool[Math.floor(Math.random() * pool.length)],
      why: Math.floor(Math.random() * 3),
      needs: [a, b],
      money: orderPayout(source, [a, b]),
      crystals: Math.max(1, Math.round((a + b) / 3)),
      prestige: orderPrestige([a, b]),
      missSince: 0
    };
  }

  function holdPieces(counts, needs, reserved) {
    for (var n = 0; n < needs.length; n += 1) {
      var key = String(needs[n]);
      if (!counts[key]) continue;
      counts[key] -= 1;
      reserved.push(needs[n]);
    }
  }

  function refreshStaleOrders() {
    if (!state.orders) return;
    var counts = levelCounts(state);
    var full = levelCounts(state);
    var spawn = Math.min(14, 1 + (state.upgrades.base || 0));
    var reserved = [];
    var changed = false;
    var now = Date.now();
    for (var i = 0; i < state.orders.length; i += 1) {
      var order = state.orders[i];
      if (!order) continue;
      if (orderRelevant(order, counts, spawn)) {
        holdPieces(counts, order.needs, reserved);
        if (order.missSince) order.missSince = 0;
        continue;
      }
      var missingFromBoard = !orderRelevant(order, full, spawn);
      if (missingFromBoard) {
        if (!order.missSince) {
          order.missSince = now;
          continue;
        }
        if (now - order.missSince < 4000) continue;
      }
      var exclude = [];
      for (var n = 0; n < state.orders.length; n += 1) {
        if (n !== i && state.orders[n]) exclude.push(state.orders[n].client);
      }
      var next = rollOrder(state, exclude, reserved);
      toast(i18n.t('design.left', { name: i18n.t('clients.' + order.client + '.name') }));
      state.orders[i] = next;
      holdPieces(counts, next.needs, reserved);
      changed = true;
    }
    if (changed) ordersSig = '';
  }

  function seedOrders(source) {
    source.orders = [];
    var exclude = [];
    var reserved = [];
    for (var i = 0; i < 2; i += 1) {
      var order = rollOrder(source, exclude, reserved);
      exclude.push(order.client);
      reserved = reserved.concat(order.needs);
      source.orders.push(order);
    }
  }

  function fresh() {
    var grid = [];
    for (var i = 0; i < CELLS; i += 1) grid.push(0);
    grid[0] = 1;
    grid[1] = 1;
    var next = {
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
      lang: 'ru',
      orderSeq: 0,
      orders: [],
      zones: blankZones(),
      inspiration: 0,
      feverLeftMs: 0,
      prestige: 0,
      event: null,
      eventIn: 48
    };
    seedOrders(next);
    next.contract = makeContract(next);
    return next;
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
    next.inspiration = clamp(raw.inspiration, 0, 1);
    next.feverLeftMs = clamp(raw.feverLeftMs, 0, FEVER_MS);
    next.prestige = clamp(raw.prestige, 0, 50);
    next.orderSeq = Math.floor(clamp(raw.orderSeq, 1, 1e9));
    next.eventIn = clamp(raw.eventIn == null ? 48 : raw.eventIn, 0, 60);
    next.zones = blankZones();
    ZONE_IDS.forEach(function (id) {
      var zone = raw.zones && raw.zones[id];
      if (!zone) return;
      next.zones[id] = {
        style: Math.floor(clamp(zone.style, 0, 3)),
        level: Math.floor(clamp(zone.level, 0, ZONE_MAX))
      };
    });
    next.orders = [];
    if (Array.isArray(raw.orders)) {
      raw.orders.forEach(function (order) {
        if (!order || CLIENT_IDS.indexOf(order.client) < 0) return;
        if (!Array.isArray(order.needs) || order.needs.length !== 2) return;
        next.orders.push({
          uid: Math.floor(clamp(order.uid, 1, 1e9)),
          client: order.client,
          needs: [
            Math.floor(clamp(order.needs[0], 1, 14)),
            Math.floor(clamp(order.needs[1], 1, 14))
          ],
          money: clamp(order.money, 1, MAX_MONEY),
          crystals: Math.floor(clamp(order.crystals, 0, 1000)),
          prestige: clamp(order.prestige, 0.01, 1),
          why: Math.floor(clamp(order.why || 0, 0, 2))
        });
      });
    }
    if (next.orders.length > 2) next.orders = next.orders.slice(0, 2);
    if (next.orders.length < 2) {
      var exclude = next.orders.map(function (order) { return order.client; });
      while (next.orders.length < 2) {
        var made = rollOrder(next, exclude);
        exclude.push(made.client);
        next.orders.push(made);
      }
    }
    if (raw.contract && (raw.contract.kind === 'discover' || raw.contract.kind === 'deliver')) {
      next.contract = {
        kind: raw.contract.kind,
        target: Math.floor(clamp(raw.contract.target, 1, raw.contract.kind === 'discover' ? 15 : 12)),
        progress: Math.floor(clamp(raw.contract.progress || 0, 0, 12))
      };
    }
    next.event = null;
    if (raw.event && (raw.event.kind === 'sale' || raw.event.kind === 'surge')) {
      var left = clamp(raw.event.left, 0, 15);
      if (left > 0) {
        next.event = {
          kind: raw.event.kind,
          left: left,
          taps: Math.floor(clamp(raw.event.taps, 0, 10))
        };
      }
    }
    return next;
  }

  function makeContract(source) {
    var max = discoveredMaxOf(source);
    var rent = source.upgrades ? source.upgrades.rent || 0 : 0;
    var tier = art.visualTier(max, rent);
    if (tier >= 6 || max >= 15) return { kind: 'deliver', target: 3, progress: 0 };
    return { kind: 'discover', target: Math.min(15, max + 1), progress: 0 };
  }

  function finishContract() {
    var before = art.visualTier(discoveredMax(), state.upgrades.rent);
    var finished = state.contract;
    state.contract = makeContract(state);
    var after = art.visualTier(discoveredMax(), state.upgrades.rent);
    if (juice) juice.shake(10);
    if (after > before) {
      toast(i18n.t('contract.opened', { room: i18n.t('rooms.' + after + '.name') }));
      return;
    }
    if (finished && finished.kind === 'deliver') {
      state.crystals = Math.min(MAX_CRYSTALS, state.crystals + 4);
      toast(i18n.t('contract.kept'));
      return;
    }
    toast(i18n.t('contract.step', { item: i18n.t('items.' + finished.target + '.name') }));
  }

  function settleContract() {
    if (!state.contract || !state.contract.kind) state.contract = makeContract(state);
    var job = state.contract;
    var done = job.kind === 'discover' ? discoveredMax() >= job.target : job.progress >= job.target;
    if (!done) return;
    finishContract();
  }

  function contractLine() {
    settleContract();
    var job = state.contract;
    if (job.kind === 'deliver') {
      return i18n.t('contract.deliver', { have: String(job.progress), need: String(job.target) });
    }
    var tier = art.visualTier(discoveredMax(), state.upgrades.rent);
    return i18n.t('contract.discover', {
      room: i18n.t('rooms.' + Math.min(6, tier + 1) + '.name'),
      item: i18n.t('items.' + job.target + '.name')
    });
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
    var fever = state.feverLeftMs > 0 ? 3 : 1;
    return (1 + 0.25 * state.upgrades.rent) * (1 + (state.prestige || 0)) * (state.boostLeftMs > 0 ? 2 : 1) * fever;
  }

  function orderPrestige(needs) {
    var pieces = itemIncome(needs[0]) + itemIncome(needs[1]);
    return Math.min(0.08, Math.max(0.01, pieces / 5000));
  }

  function orderPayout(source, needs) {
    var pieces = 0;
    for (var i = 0; i < needs.length; i += 1) pieces += itemIncome(needs[i]);
    return Math.min(MAX_MONEY, Math.max(10, Math.round(pieces * 8 + boardRate(source) * 12)));
  }

  function boardRate(source) {
    var sum = 0;
    var grid = source && source.grid ? source.grid : [];
    for (var i = 0; i < grid.length; i += 1) sum += itemIncome(grid[i]);
    var rent = source && source.upgrades ? source.upgrades.rent || 0 : 0;
    var prestige = source && source.prestige ? source.prestige : 0;
    return Math.max(8, sum * (1 + 0.25 * rent) * (1 + prestige));
  }

  function steadyIncome() {
    return boardRate(state);
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
    var price = Math.round(def.base * Math.pow(def.growth, level));
    if (state.event && state.event.kind === 'sale' && state.event.left > 0) price = Math.max(1, Math.round(price * 0.5));
    return price;
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
    var point;
    if (!cell) {
      var board = nodes.board ? nodes.board.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
      point = { x: board.left + board.width / 2, y: board.top + board.height / 2 };
    } else {
      var rect = cell.getBoundingClientRect();
      point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    var dock = document.querySelector('.dock');
    if (dock) {
      var limit = dock.getBoundingClientRect().top - 28;
      if (point.y > limit) point.y = limit;
    }
    return point;
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
    settleContract();
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
    chargeInspiration();
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

  function hardPaused() {
    if (!platform || !platform.pause || !platform.pause.active) return false;
    return platform.pause.has('ad') || platform.pause.has('hidden') || platform.pause.has('platform');
  }

  function spawnPiece() {
    if (qaDrive) {
      if (hardPaused()) return;
    } else if (platform && platform.pause && platform.pause.active) return;
    var fever = state.feverLeftMs > 0;
    if (!fever && state.energy < 1) {
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
    var level = Math.min(14, 1 + state.upgrades.base + (fever ? 1 : 0));
    if (!fever) state.energy -= 1;
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
      var pose = juice ? juice.pose(i) : { x: 1, y: 1 };
      ctx.save();
      ctx.translate(box.w / 2, box.h / 2);
      ctx.scale(pose.x, pose.y);
      ctx.translate(-box.w / 2, -box.h / 2);
      if (art.paintToken) art.paintToken(ctx, level, box.w, box.h, time + i * 0.17);
      else art.paintItem(ctx, level, box.w, time + i * 0.17);
      ctx.restore();
    }
  }

  function drawRoom(time) {
    var box = fitCanvas(nodes.room);
    if (!box) return;
    art.paintRoom(nodes.room.getContext('2d'), box.w, box.h, {
      maxLevel: discoveredMax(),
      rentLevel: state.upgrades.rent,
      zones: state.zones
    }, time);
  }

  function wantedMarks() {
    var used = {};
    var marks = {};
    if (!state.orders) return marks;
    state.orders.forEach(function (order) {
      for (var n = 0; n < order.needs.length; n += 1) {
        for (var i = 0; i < CELLS; i += 1) {
          if (used[i] || state.grid[i] !== order.needs[n]) continue;
          used[i] = true;
          marks[i] = true;
          break;
        }
      }
    });
    return marks;
  }

  function applyWanted() {
    var marks = wantedMarks();
    for (var i = 0; i < cells.length; i += 1) cells[i].classList.toggle('is-wanted', !!marks[i]);
  }

  function renderBoard() {
    var filled = 0;
    var marks = wantedMarks();
    for (var i = 0; i < cells.length; i += 1) {
      var level = state.grid[i];
      if (level) filled += 1;
      cells[i].classList.toggle('has-item', !!level);
      cells[i].classList.toggle('is-wanted', !!marks[i]);
      var badge = cells[i].querySelector('.cell-level');
      badge.textContent = level ? i18n.t('grid.rank', { n: String(level) }) : '';
      cells[i].setAttribute('aria-label', level
        ? i18n.t('items.' + level + '.name')
        : i18n.t('grid.cell', { n: String(i + 1) }));
    }
    nodes.gridCount.textContent = i18n.t('grid.count', { filled: String(filled), total: String(CELLS) });
    var tier = art.visualTier(discoveredMax(), state.upgrades.rent);
    nodes.roomName.textContent = i18n.t('rooms.' + tier + '.name');
    nodes.roomBlurb.textContent = i18n.t('rooms.' + tier + '.blurb');
    if (nodes.roomNext) nodes.roomNext.textContent = contractLine();
    considerStage(tier);
  }

  function liftFinishedQuest() {
    var quest = state.quest;
    if (!quest || quest.progress < quest.target) return;
    var rate = steadyIncome();
    var floor = Math.round(rate * 20);
    if (floor <= quest.rewardMoney) return;
    quest.rewardMoney = floor;
    if ((quest.rewardCrystals || 0) < 2) quest.rewardCrystals = 2;
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
    liftFinishedQuest();
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
    renderOrders();
    refreshStaleOrders();
    if (ordersSig === '') renderOrders();
    applyWanted();
    renderZonePins();
    renderInspire();
    renderEvent();
    if (state.quest && state.quest.type === 'earn' && state.quest.progress < state.quest.target) {
      var steady = steadyIncome();
      var nextTarget = Math.max(400, Math.round(steady * 75));
      var tooSmall = state.quest.target < steady * 20;
      var tooBig = state.quest.target > steady * 180;
      if (tooSmall || tooBig) {
        var ratio = state.quest.target > 0 ? state.quest.progress / state.quest.target : 0;
        state.quest.target = nextTarget;
        state.quest.progress = Math.min(nextTarget * 0.9, Math.round(ratio * nextTarget));
        state.quest.rewardMoney = Math.max(200, Math.round(steady * 25));
      }
    }
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
      button.classList.toggle('is-ready', !broke);
    }
  }

  var COIN_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="#e4b15a"/><circle cx="16" cy="16" r="8" fill="none" stroke="#8a5a22" stroke-width="2"/></svg>';
  var GEM_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L26 12 L16 29 L6 12Z" fill="#7fd0d8"/><path d="M16 3 L20 12 L16 29 L12 12Z" fill="#d9fbff"/></svg>';

  function setBuyFace(button, verb, price, pay) {
    button.textContent = '';
    var icon = document.createElement('span');
    icon.className = 'buy-icon';
    icon.innerHTML = pay === 'crystals' ? GEM_ICON : COIN_ICON;
    var label = document.createElement('span');
    label.className = 'buy-label';
    label.textContent = verb;
    button.appendChild(icon);
    button.appendChild(label);
    if (price) {
      var chip = document.createElement('span');
      chip.className = 'buy-price';
      chip.textContent = price;
      button.appendChild(chip);
    }
  }

  function chargeInspiration() {
    if (state.feverLeftMs > 0) return;
    var now = performance.now();
    if (now - inspireAt < 4500) state.inspiration = Math.min(1, state.inspiration + 0.24);
    else state.inspiration = Math.max(0.18, state.inspiration);
    inspireAt = now;
    if (state.inspiration >= 1) {
      state.inspiration = 1;
      state.feverLeftMs = FEVER_MS;
      audio.playNewLevelUnlock();
      toast(i18n.t('design.fever'));
      if (juice) juice.shake(12);
    }
  }

  function claimMap() {
    var used = {};
    var map = {};
    state.orders.forEach(function (order) {
      var found = [];
      for (var n = 0; n < order.needs.length; n += 1) {
        var hit = -1;
        for (var i = 0; i < CELLS; i += 1) {
          if (used[i]) continue;
          if (state.grid[i] === order.needs[n]) {
            hit = i;
            break;
          }
        }
        if (hit < 0) {
          found = null;
          break;
        }
        used[hit] = true;
        found.push(hit);
      }
      map[order.uid] = found;
    });
    return map;
  }

  function findOrderCells(needs) {
    var used = {};
    var found = [];
    for (var n = 0; n < needs.length; n += 1) {
      var hit = -1;
      for (var i = 0; i < CELLS; i += 1) {
        if (used[i]) continue;
        if (state.grid[i] === needs[n]) {
          hit = i;
          break;
        }
      }
      if (hit < 0) return null;
      used[hit] = true;
      found.push(hit);
    }
    return found;
  }

  function flyOrderPiece(index, card) {
    var cell = cells[index];
    if (!cell || !card) return;
    var from = cell.getBoundingClientRect();
    var to = card.getBoundingClientRect();
    var node = document.createElement('div');
    node.className = 'order-fly';
    var canvas = document.createElement('canvas');
    canvas.width = 112;
    canvas.height = 112;
    art.paintItem(canvas.getContext('2d'), state.grid[index], 112, animTime);
    node.appendChild(canvas);
    node.style.left = from.left + 'px';
    node.style.top = from.top + 'px';
    document.body.appendChild(node);
    requestAnimationFrame(function () {
      node.style.transform = 'translate(' + (to.left - from.left + to.width * 0.3) + 'px,' + (to.top - from.top) + 'px) scale(0.25)';
      node.style.opacity = '0.15';
    });
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 520);
  }

  function deliverOrder(uid, card) {
    var index = -1;
    for (var i = 0; i < state.orders.length; i += 1) if (state.orders[i].uid === uid) index = i;
    if (index < 0) return;
    var order = state.orders[index];
    order.money = orderPayout(state, order.needs);
    var spots = claimMap()[order.uid];
    if (!spots) return;
    if (state.contract && state.contract.kind === 'deliver') state.contract.progress += 1;
    spots.forEach(function (cellIndex) { flyOrderPiece(cellIndex, card); });
    spots.forEach(function (cellIndex) { state.grid[cellIndex] = 0; });
    state.money = Math.min(MAX_MONEY, state.money + order.money);
    state.crystals = Math.min(MAX_CRYSTALS, state.crystals + order.crystals);
    state.prestige = Math.min(50, state.prestige + orderPrestige(order.needs));
    audio.playCoin();
    audio.playUpgrade();
    var point = card.getBoundingClientRect();
    if (juice) {
      juice.burst(point.left + point.width / 2, point.top + 20, 'confetti');
      juice.floatText(point.left + point.width / 2, point.top, '+' + formatCompact(order.money) + ' 💰', 'gold');
    }
    toast(i18n.t('design.delivered', { name: i18n.t('clients.' + order.client + '.name') }));
    var exclude = [];
    var reserved = [];
    for (var n = 0; n < state.orders.length; n += 1) {
      if (!state.orders[n] || n === index) continue;
      exclude.push(state.orders[n].client);
      reserved = reserved.concat(state.orders[n].needs);
    }
    state.orders[index] = rollOrder(state, exclude, reserved);
    ordersSig = '';
    renderBoard();
    renderHud();
    save();
  }

  function orderViews() {
    var used = {};
    return state.orders.map(function (order) {
      var lines = order.needs.map(function (level) {
        var have = false;
        for (var i = 0; i < CELLS; i += 1) {
          if (used[i] || state.grid[i] !== level) continue;
          used[i] = true;
          have = true;
          break;
        }
        return { level: level, have: have };
      });
      return {
        order: order,
        lines: lines,
        ready: lines.every(function (line) { return line.have; })
      };
    });
  }

  function clientWhy(order) {
    var id = order.client.charAt(0).toUpperCase() + order.client.slice(1);
    var spoken = labelOr('design.why' + id + String(order.why || 0), '');
    if (spoken) return spoken;
    return i18n.t('design.wish' + id, {
      a: i18n.t('items.' + order.needs[0] + '.name'),
      b: i18n.t('items.' + order.needs[1] + '.name')
    });
  }

  function clientWhyPhone(order) {
    var id = order.client.charAt(0).toUpperCase() + order.client.slice(1);
    return labelOr('design.whyPhone' + id + String(order.why || 0), clientWhy(order));
  }

  function itemShort(level) {
    return labelOr('items.' + level + '.short', i18n.t('items.' + level + '.name'));
  }

  function needChip(line, twin) {
    var chip = document.createElement('div');
    chip.className = 'order-need' + (line.have ? ' is-have' : '');
    var icon = document.createElement('canvas');
    icon.width = 56;
    icon.height = 56;
    art.paintItem(icon.getContext('2d'), line.level, 56, animTime);
    var full = i18n.t('items.' + line.level + '.name');
    var name = document.createElement('b');
    name.className = 'order-need-name';
    name.textContent = (twin ? '2× ' : '') + full;
    var brief = document.createElement('b');
    brief.className = 'order-need-short';
    brief.textContent = (twin ? '2 ' : '') + itemShort(line.level);
    var mark = document.createElement('i');
    mark.className = 'order-need-mark';
    mark.textContent = i18n.t('grid.rank', { n: String(line.level) });
    var level = document.createElement('i');
    level.className = 'order-need-level';
    level.textContent = String(line.level);
    var copy = document.createElement('span');
    copy.className = 'order-need-copy';
    chip.title = full + ' · ' + mark.textContent;
    chip.appendChild(icon);
    copy.appendChild(name);
    copy.appendChild(brief);
    copy.appendChild(mark);
    copy.appendChild(level);
    chip.appendChild(copy);
    return chip;
  }

  function renderOrders() {
    if (!nodes.ordersList) return;
    if (nodes.ordersKicker) nodes.ordersKicker.textContent = labelOr('design.orders', i18n.lang === 'en' ? 'Orders' : 'Заказы');
    if (nodes.ordersPrestige) {
      nodes.ordersPrestige.textContent = i18n.t('design.prestige', {
        pct: String(Math.round((state.prestige || 0) * 100))
      });
    }
    var views = orderViews();
    var sig = [i18n.lang, Math.round((state.prestige || 0) * 100)];
    views.forEach(function (view) {
      var flags = view.lines.map(function (line) { return line.have ? 'y' : 'n'; }).join('');
      sig.push(view.order.uid + ':' + flags + ':' + (view.order.why || 0));
    });
    var nextSig = sig.join('|');
    if (nextSig === ordersSig) return;
    ordersSig = nextSig;
    nodes.ordersList.textContent = '';
    views.forEach(function (view) {
      var order = view.order;
      var money = orderPayout(state, order.needs);
      var card = document.createElement('article');
      card.className = 'order-card' + (view.ready ? ' is-ready' : '');
      var top = document.createElement('div');
      top.className = 'order-top';
      var heading = document.createElement('strong');
      heading.textContent = i18n.t('clients.' + order.client + '.name');
      var role = document.createElement('span');
      role.textContent = i18n.t('clients.' + order.client + '.role');
      top.appendChild(heading);
      top.appendChild(role);
      var why = document.createElement('p');
      why.className = 'order-why order-why-full';
      why.textContent = clientWhy(order);
      var whyPhone = document.createElement('p');
      whyPhone.className = 'order-why order-why-phone';
      whyPhone.textContent = clientWhyPhone(order);
      var row = document.createElement('div');
      row.className = 'order-row';
      var needs = document.createElement('div');
      needs.className = 'order-needs';
      if (order.needs[0] === order.needs[1]) {
        needs.appendChild(needChip({ level: order.needs[0], have: view.ready }, true));
      } else {
        view.lines.forEach(function (line) { needs.appendChild(needChip(line, false)); });
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'order-submit';
      button.disabled = !view.ready;
      var verb = document.createElement('b');
      verb.textContent = i18n.t(view.ready ? 'design.submit' : 'design.locked');
      var prize = document.createElement('small');
      prize.className = 'order-pay';
      prize.textContent = i18n.t('design.reward', {
        money: formatCompact(money),
        crystals: String(order.crystals),
        pct: String(Math.round(orderPrestige(order.needs) * 100))
      });
      var brief = document.createElement('small');
      brief.className = 'order-pay-short';
      brief.textContent = i18n.t('design.payShort', {
        money: formatCompact(money),
        crystals: String(order.crystals)
      });
      button.appendChild(verb);
      button.appendChild(prize);
      button.appendChild(brief);
      if (view.ready) button.addEventListener('click', function () { deliverOrder(order.uid, card); });
      row.appendChild(needs);
      row.appendChild(button);
      card.appendChild(top);
      card.appendChild(why);
      card.appendChild(whyPhone);
      card.appendChild(row);
      nodes.ordersList.appendChild(card);
    });
  }

  function zonePrice(zone) {
    var level = Math.min(zone.level, ZONE_MAX - 1);
    var price = Math.round(30 * Math.pow(1.7, level));
    if (state.event && state.event.kind === 'sale' && state.event.left > 0) price = Math.max(1, Math.round(price * 0.5));
    return price;
  }

  function labelOr(path, fallback) {
    var value = i18n.t(path);
    return !value || value === path ? fallback : value;
  }

  function renderZonePins() {
    var shortRu = { window: 'Окно', light: 'Свет', soft: 'Диван', tech: 'Техника', floor: 'Пол' };
    var shortEn = { window: 'Window', light: 'Light', soft: 'Sofa', tech: 'Tech', floor: 'Floor' };
    var short = i18n.lang === 'en' ? shortEn : shortRu;
    ZONE_IDS.forEach(function (id) {
      var pin = $('zone-' + id);
      if (!pin) return;
      var zone = state.zones[id];
      pin.querySelector('b').textContent = short[id];
      pin.querySelector('em').textContent = String(zone.level);
      pin.classList.toggle('is-on', zone.style > 0);
    });
  }

  function openStyle(id) {
    styleZone = id;
    if (openTab) closeSheet();
    nodes.styleTitle.textContent = i18n.t('design.styleTitle', { zone: i18n.t('design.' + id) });
    nodes.styleLead.textContent = i18n.t('design.styleLead');
    nodes.styleChoices.textContent = '';
    var zone = state.zones[id];
    var price = zonePrice(zone);
    var broke = state.money < price;
    STYLE_KEYS.forEach(function (key, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'style-choice' + (broke ? ' is-broke' : ' is-ready') + (zone.style === index + 1 ? ' is-on' : '');
      var name = document.createElement('strong');
      name.textContent = i18n.t('design.' + key);
      var cost = document.createElement('span');
      cost.textContent = i18n.t(zone.level >= ZONE_MAX ? 'design.styleMax' : 'design.stylePrice', {
        price: formatCompact(price)
      });
      button.appendChild(name);
      button.appendChild(cost);
      button.addEventListener('click', function () { applyStyle(id, index + 1, button); });
      nodes.styleChoices.appendChild(button);
    });
    nodes.styleModal.hidden = false;
  }

  function closeStyle() {
    styleZone = '';
    nodes.styleModal.hidden = true;
  }

  function applyStyle(id, style, button) {
    var zone = state.zones[id];
    var price = zonePrice(zone);
    if (state.money < price) {
      deny(button);
      toast(i18n.t('toast.brokeMoney'));
      return;
    }
    state.money -= price;
    zone.style = style;
    if (zone.level < ZONE_MAX) zone.level += 1;
    audio.playUpgrade();
    toast(i18n.t('design.zoneDone', { style: i18n.t('design.' + STYLE_KEYS[style - 1]) }));
    closeStyle();
    drawRoom(animTime);
    renderHud();
    if (openTab === 'upgrades') buildSheet();
    save();
  }

  function beginEvent() {
    var kind = Math.random() < 0.5 ? 'sale' : 'surge';
    state.event = { kind: kind, left: 15, taps: 0 };
    state.eventIn = 45 + Math.random() * 15;
    audio.playNewLevelUnlock();
    if (kind === 'sale' && openTab === 'upgrades') buildSheet();
    sheetSale = kind === 'sale';
  }

  function grantRareChest() {
    var level = Math.min(14, Math.max(2, discoveredMax() + 2));
    var holes = emptyIndexes();
    if (!holes.length) {
      var gold = Math.max(250, Math.round(incomePerSec() * 20));
      state.money = Math.min(MAX_MONEY, state.money + gold);
      toast(i18n.t('design.rareGold', { amount: formatCompact(gold) }));
      audio.playCoin();
      return;
    }
    var index = holes[Math.floor(Math.random() * holes.length)];
    state.grid[index] = level;
    noteDiscover(level, index);
    if (juice) juice.kick(index, 'spawn');
    popCell(index);
    toast(i18n.t('design.rareChest', { name: i18n.t('items.' + level + '.name') }));
    audio.playCoin();
    renderBoard();
  }

  function tapFuse() {
    if (!state.event || state.event.kind !== 'surge') return;
    state.event.taps += 1;
    audio.playSpawn();
    if (juice && nodes.fuse) {
      var box = nodes.fuse.getBoundingClientRect();
      juice.burst(box.left + box.width / 2, box.top + box.height / 2, 'spark');
    }
    if (state.event.taps >= 10) {
      grantRareChest();
      state.event = null;
      state.eventIn = 45 + Math.random() * 15;
    }
    renderHud();
    save();
  }

  function stepDesign(dt) {
    if (state.feverLeftMs > 0) {
      state.feverLeftMs = Math.max(0, state.feverLeftMs - dt * 1000);
      if (state.feverLeftMs === 0) state.inspiration = 0;
    } else if (performance.now() - inspireAt > 4500) {
      state.inspiration = Math.max(0, state.inspiration - dt * 0.1);
    }
    var wasSale = !!(state.event && state.event.kind === 'sale');
    if (state.event) {
      state.event.left -= dt;
      if (state.event.left <= 0) state.event = null;
    } else {
      state.eventIn -= dt;
      if (state.eventIn <= 0) beginEvent();
    }
    var sale = !!(state.event && state.event.kind === 'sale');
    if (sale !== wasSale && openTab === 'upgrades') buildSheet();
    sheetSale = sale;
  }

  function renderInspire() {
    if (!nodes.inspireFill) return;
    var fever = state.feverLeftMs > 0;
    nodes.inspire.classList.toggle('is-fever', fever);
    nodes.merge.classList.toggle('is-fever', fever);
    nodes.spawn.classList.toggle('is-fever', fever);
    nodes.inspireFill.style.width = (fever ? 100 : Math.round(state.inspiration * 100)) + '%';
    var feverName = labelOr('design.fever', i18n.lang === 'en' ? 'DESIGN OVERDRIVE' : 'ДИЗАЙН-ФОРСАЖ');
    var seconds = String(Math.ceil(state.feverLeftMs / 1000));
    var left = i18n.t('design.feverLeft', { sec: seconds });
    if (!left || left === 'design.feverLeft') left = seconds + (i18n.lang === 'en' ? 's' : ' с');
    nodes.inspireLabel.textContent = fever ? feverName + ' ' + left : labelOr('design.inspire', i18n.lang === 'en' ? 'Inspiration' : 'Вдохновение');
  }

  function renderEvent() {
    if (!nodes.eventBanner) return;
    var event = state.event;
    nodes.eventBanner.hidden = !event;
    if (nodes.fuse) nodes.fuse.hidden = !(event && event.kind === 'surge');
    if (!event) return;
    nodes.eventTitle.textContent = i18n.t(event.kind === 'sale' ? 'design.saleTitle' : 'design.surgeTitle');
    nodes.eventCopy.textContent = event.kind === 'sale'
      ? i18n.t('design.saleCopy')
      : i18n.t('design.surgeCopy', { have: String(event.taps) });
    nodes.eventTimer.textContent = i18n.t('design.eventLeft', { sec: String(Math.max(0, Math.ceil(event.left))) });
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
    if (maxed) setBuyFace(button, i18n.t('branch.maxed'), '', def.pay);
    else setBuyFace(button, i18n.t('branch.verb'), formatCompact(price), def.pay);
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
      setBuyFace(button, i18n.t('shop.verb'), formatCompact(def.cost), def.pay);
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
    nodes.overlay.hidden = false;
    nodes.overlay.inert = false;
    nodes.sheet.setAttribute('aria-hidden', 'false');
    buildSheet();
    requestAnimationFrame(function () { nodes.overlay.classList.add('is-open'); });
  }

  function closeSheet() {
    openTab = '';
    ['upgrades', 'shop', 'boosters'].forEach(function (name) {
      var button = $('tab-' + name);
      button.classList.remove('is-active');
      button.setAttribute('aria-selected', 'false');
    });
    nodes.overlay.classList.remove('is-open');
    nodes.sheet.setAttribute('aria-hidden', 'true');
    var finish = function () {
      if (openTab) return;
      nodes.overlay.hidden = true;
      nodes.overlay.inert = true;
    };
    nodes.overlay.addEventListener('transitionend', finish, { once: true });
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
    stepDesign(dt);
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

  var hintBucket = -1;
  var catNext = 0;
  var qaDrive = false;

  function winkPairs() {
    var groups = {};
    for (var i = 0; i < CELLS; i += 1) {
      var level = state.grid[i];
      if (!level || level >= 15) continue;
      if (!groups[level]) groups[level] = [];
      groups[level].push(i);
    }
    Object.keys(groups).forEach(function (key) {
      var list = groups[key];
      if (list.length < 2) return;
      for (var n = 0; n + 1 < list.length; n += 2) {
        var a = cells[list[n]].getBoundingClientRect();
        var b = cells[list[n + 1]].getBoundingClientRect();
        nudgeCell(cells[list[n]], Math.sign(b.left - a.left), Math.sign(b.top - a.top));
        nudgeCell(cells[list[n + 1]], Math.sign(a.left - b.left), Math.sign(a.top - b.top));
      }
    });
  }

  function nudgeCell(cell, dx, dy) {
    cell.style.setProperty('--hint-x', (dx * 5) + 'px');
    cell.style.setProperty('--hint-y', (dy * 4) + 'px');
    cell.classList.remove('is-hint');
    void cell.offsetWidth;
    cell.classList.add('is-hint');
  }

  function pokeCat(event) {
    if (!art.catRect || !nodes.room) return false;
    var rect = nodes.room.getBoundingClientRect();
    var hit = art.catRect(rect.width, rect.height);
    if (!hit) return false;
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    if (x < hit.x || y < hit.y || x > hit.x + hit.w || y > hit.y + hit.h) return false;
    if (juice) juice.floatText(event.clientX, event.clientY - 10, i18n.t('design.purr'), 'gold');
    audio.playSpawn();
    var now = performance.now();
    if (now < catNext) return true;
    catNext = now + 7000;
    var coins = Math.max(4, Math.round(incomePerSec() * 1.5));
    state.money = Math.min(MAX_MONEY, state.money + coins);
    if (state.quest.type === 'earn') state.quest.progress += coins;
    audio.playCoin();
    if (juice) juice.floatText(event.clientX, event.clientY - 28, '+' + formatCompact(coins) + ' 💰', 'gold');
    renderHud();
    save();
    return true;
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.25, Math.max(0, (now - frame.last) / 1000));
    frame.last = now;
    animTime += dt;
    var bucket = Math.floor(animTime / 3);
    if (bucket !== hintBucket) {
      hintBucket = bucket;
      if (bucket > 0) winkPairs();
    }
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
      roomNext: $('room-next'),
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
      overlay: $('sheet-overlay'),
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
      codex: $('btn-codex'),
      ordersList: $('orders-list'),
      ordersKicker: $('orders-kicker'),
      ordersPrestige: $('orders-prestige'),
      inspire: $('inspire'),
      inspireFill: $('inspire-fill'),
      inspireLabel: $('inspire-label'),
      eventBanner: $('event-banner'),
      eventTitle: $('event-title'),
      eventCopy: $('event-copy'),
      eventTimer: $('event-timer'),
      fuse: $('fuse-box'),
      styleModal: $('style-modal'),
      styleTitle: $('style-title'),
      styleLead: $('style-lead'),
      styleChoices: $('style-choices'),
      merge: document.querySelector('.merge')
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
      if (openTab) closeSheet();
      if (juice) juice.openCodex();
    });
    nodes.claim.addEventListener('click', function () {
      touched = true;
      claimQuest();
    });
    nodes.roomSection.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('.zone-pin, .fuse-box')) return;
      touched = true;
      if (openTab) {
        closeSheet();
        return;
      }
      if (!nodes.styleModal.hidden) {
        closeStyle();
        return;
      }
      if (pokeCat(event)) return;
      nodes.roomSection.classList.remove('is-tap');
      void nodes.roomSection.offsetWidth;
      nodes.roomSection.classList.add('is-tap');
      regen(1.15);
      audio.playSpawn();
      renderHud();
    });
    ZONE_IDS.forEach(function (id) {
      var pin = $('zone-' + id);
      pin.addEventListener('click', function (event) {
        event.stopPropagation();
        touched = true;
        openStyle(id);
      });
    });
    nodes.fuse.addEventListener('click', function (event) {
      event.stopPropagation();
      touched = true;
      tapFuse();
    });
    $('style-close').addEventListener('click', closeStyle);
    $('style-backdrop').addEventListener('click', closeStyle);
    $('tab-upgrades').addEventListener('click', function () { setTab('upgrades'); });
    $('tab-shop').addEventListener('click', function () { setTab('shop'); });
    $('tab-boosters').addEventListener('click', function () { setTab('boosters'); });
    $('sheet-close').addEventListener('click', closeSheet);
    $('sheet-backdrop').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!nodes.styleModal.hidden) closeStyle();
      else if (openTab) closeSheet();
      else if (juice) juice.closeCodex();
    });
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
      observer.observe(nodes.roomSection);
      observer.observe(nodes.grid);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) save();
    });
    window.addEventListener('pagehide', save);
    juice = window.AureliaJuice.mount({
      stage: document.getElementById('app'),
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

  function qaMerge() {
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
    if (first < 0) return false;
    return mergeAt(first, second);
  }

  function qaDeliver() {
    var map = claimMap();
    var cards = document.querySelectorAll('.order-card');
    for (var i = 0; i < state.orders.length; i += 1) {
      if (!map[state.orders[i].uid]) continue;
      deliverOrder(state.orders[i].uid, cards[i] || document.body);
      return true;
    }
    return false;
  }

  function qaBuy() {
    if (openTab !== 'upgrades') setTab('upgrades');
    var buttons = document.querySelectorAll('#sheet .buy');
    var bought = false;
    for (var i = 0; i < buttons.length; i += 1) {
      if (buttons[i].dataset.maxed === '1' || buttons[i].classList.contains('is-broke')) continue;
      buttons[i].click();
      bought = true;
      break;
    }
    if (openTab) closeSheet();
    return bought;
  }

  function qaLeap() {
    var peak = discoveredMax();
    if (peak < 15) {
      var spots = [];
      for (var i = 0; i < CELLS; i += 1) if (state.grid[i] === peak) spots.push(i);
      while (spots.length < 2) {
        var hole = -1;
        for (var h = 0; h < CELLS; h += 1) {
          if (!state.grid[h]) { hole = h; break; }
        }
        if (hole < 0) {
          for (var k = 0; k < CELLS; k += 1) {
            if (state.grid[k] && state.grid[k] < peak) {
              state.grid[k] = 0;
              hole = k;
              break;
            }
          }
        }
        if (hole < 0) break;
        state.grid[hole] = peak;
        spots.push(hole);
      }
      if (spots.length >= 2) mergeAt(spots[0], spots[1]);
    }
    var rent = null;
    for (var b = 0; b < BRANCHES.length; b += 1) if (BRANCHES[b].id === 'rent') rent = BRANCHES[b];
    if (rent && state.upgrades.rent < rent.max) {
      var price = priceOf(rent, state.upgrades.rent);
      if (state.money < price) state.money = price;
    }
    qaBuy();
    renderBoard();
    renderHud();
    drawRoom(animTime);
  }

  window.AureliaQAHooks = {
    hardPaused: hardPaused,
    snapshot: function () {
      return {
        grid: state.grid.slice(),
        money: state.money,
        crystals: state.crystals,
        energy: Math.floor(state.energy),
        max: discoveredMax(),
        tier: art.visualTier(discoveredMax(), state.upgrades.rent),
        orders: state.orders.length
      };
    },
    drive: function (fn) {
      if (hardPaused()) return false;
      qaDrive = true;
      var result = false;
      try { result = fn(); } finally { qaDrive = false; }
      return result;
    },
    spawn: function () {
      if (hardPaused()) return false;
      qaDrive = true;
      try {
        if (state.energy < 1) state.energy = Math.min(ENERGY_MAX, state.energy + 1);
        var before = state.grid.join(',');
        spawnPiece();
        return state.grid.join(',') !== before;
      } finally {
        qaDrive = false;
      }
    },
    merge: qaMerge,
    deliver: qaDeliver,
    buy: qaBuy,
    leap: qaLeap
  };
})();
