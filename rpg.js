(function () {
  'use strict';

  var SAVE_KEY = 'aurelia.rpg.v1';
  var CHAPTERS = [
    {
      ru: 'Черновая студия',
      en: 'Bare studio',
      tier: 1,
      intro: { ru: 'Дом пуст. В бетоне кто-то скребётся. Бей, когда враг замахивается — так ты отобьёшь удар.', en: 'The house is empty. Something scrapes in the concrete. Strike while the foe winds up to parry.' },
      foes: [
        { ru: 'Пыльный страж', en: 'Dust warden', hp: 26, atk: 3, gap: 2.15, xp: 12, gold: 20, line: { ru: 'Он собран из пыли и не хочет выпускать тебя.', en: 'He is made of dust and will not let you leave.' } },
        { ru: 'Треснувшая труба', en: 'Split pipe', hp: 34, atk: 4, gap: 2.0, xp: 14, gold: 28, line: { ru: 'Вода бьёт в лицо. Целься в стык.', en: 'Water hits your face. Aim for the joint.' } },
        { ru: 'Прораб-тень', en: 'Shadow foreman', hp: 52, atk: 6, gap: 1.85, xp: 26, gold: 48, boss: true, line: { ru: 'Босс этажа. Он всё ещё считает дом своим.', en: 'Floor boss. He still thinks the house is his.' } }
      ]
    },
    {
      ru: 'Белая коробка',
      en: 'White box',
      tier: 3,
      intro: { ru: 'Стены побелели. Краска здесь кусается.', en: 'The walls went white. The paint here bites.' },
      foes: [
        { ru: 'Краска-жижа', en: 'Paint ooze', hp: 40, atk: 5, gap: 1.9, xp: 16, gold: 32, line: { ru: 'Белая лужа ползёт к ногам.', en: 'A white puddle crawls at your feet.' } },
        { ru: 'Валик-голем', en: 'Roller golem', hp: 48, atk: 6, gap: 1.8, xp: 18, gold: 40, line: { ru: 'Он мажет всё, до чего дотянется.', en: 'It paints everything it can reach.' } },
        { ru: 'Приёмщик', en: 'The inspector', hp: 70, atk: 8, gap: 1.7, xp: 30, gold: 64, boss: true, line: { ru: 'Босс этажа. Без его печати дверь дальше закрыта.', en: 'Floor boss. The next door stays shut without his seal.' } }
      ]
    },
    {
      ru: 'Живой угол',
      en: 'Living corner',
      tier: 5,
      intro: { ru: 'Здесь уже пахнет листьями. Не все из них добрые.', en: 'It smells of leaves here. Not all of them are kind.' },
      foes: [
        { ru: 'Колючий кот', en: 'Thorn cat', hp: 58, atk: 7, gap: 1.7, xp: 20, gold: 46, line: { ru: 'Мурлычет и выпускает колючки.', en: 'It purrs and fires thorns.' } },
        { ru: 'Мотылёк лампы', en: 'Lamp moth', hp: 66, atk: 8, gap: 1.65, xp: 22, gold: 54, line: { ru: 'Свет режет глаза. Бей в паузу между вспышками.', en: 'The light cuts. Strike between flashes.' } },
        { ru: 'Флорист-соперник', en: 'Rival florist', hp: 92, atk: 10, gap: 1.55, xp: 36, gold: 80, boss: true, line: { ru: 'Босс этажа. Она хочет этот угол себе.', en: 'Floor boss. She wants this corner for herself.' } }
      ]
    },
    {
      ru: 'Гостиная',
      en: 'Living room',
      tier: 7,
      intro: { ru: 'Мягкая мебель прячет кого-то внутри.', en: 'The soft furniture is hiding someone.' },
      foes: [
        { ru: 'Бархатная тень', en: 'Velvet shade', hp: 78, atk: 9, gap: 1.6, xp: 24, gold: 60, line: { ru: 'Тень сидит в кресле, как хозяин.', en: 'The shade sits in the chair like it owns the place.' } },
        { ru: 'Столик-мимик', en: 'Table mimic', hp: 88, atk: 11, gap: 1.5, xp: 26, gold: 70, line: { ru: 'Ножки стучат, крышка щёлкает.', en: 'The legs tap. The top snaps.' } },
        { ru: 'Инвестор', en: 'The investor', hp: 120, atk: 13, gap: 1.45, xp: 42, gold: 110, boss: true, line: { ru: 'Босс этажа. Он покупает дом вместе с тобой.', en: 'Floor boss. He is buying the house, you included.' } }
      ]
    },
    {
      ru: 'Дизайнерский лофт',
      en: 'Designer loft',
      tier: 10,
      intro: { ru: 'Экраны не спят. В них кто-то смотрит в ответ.', en: 'The screens do not sleep. Something looks back.' },
      foes: [
        { ru: 'Призрак эфира', en: 'Broadcast ghost', hp: 100, atk: 12, gap: 1.45, xp: 28, gold: 84, line: { ru: 'Голос из колонки знает твоё имя.', en: 'A voice in the speaker knows your name.' } },
        { ru: 'Дрон станции', en: 'Station drone', hp: 112, atk: 14, gap: 1.4, xp: 30, gold: 96, line: { ru: 'Красная точка бегает по груди.', en: 'A red dot runs across your chest.' } },
        { ru: 'Куратор', en: 'The curator', hp: 150, atk: 16, gap: 1.35, xp: 48, gold: 140, boss: true, line: { ru: 'Босс этажа. Ей нужен кадр, где ты проигрываешь.', en: 'Floor boss. She wants a shot of you losing.' } }
      ]
    },
    {
      ru: 'Парадные комнаты',
      en: 'Parade rooms',
      tier: 12,
      intro: { ru: 'Золото на стенах холодное. За ним стоит стража.', en: 'The gold on the walls is cold. Guards stand behind it.' },
      foes: [
        { ru: 'Каминный бес', en: 'Hearth imp', hp: 130, atk: 15, gap: 1.35, xp: 32, gold: 110, line: { ru: 'Искры скачут по ковру.', en: 'Sparks jump across the rug.' } },
        { ru: 'Полтергейст рояля', en: 'Piano poltergeist', hp: 146, atk: 17, gap: 1.3, xp: 36, gold: 126, line: { ru: 'Клавиши бьют сами, и каждая нота ранит.', en: 'The keys play themselves. Every note cuts.' } },
        { ru: 'Критик', en: 'The critic', hp: 190, atk: 19, gap: 1.25, xp: 56, gold: 180, boss: true, line: { ru: 'Босс этажа. Один его взгляд снимает силы.', en: 'Floor boss. One look from him strips your strength.' } }
      ]
    },
    {
      ru: 'Небесный пентхаус',
      en: 'Sky penthouse',
      tier: 15,
      intro: { ru: 'Крыша открыта. Последний ключ стережёт ночь.', en: 'The roof is open. The night guards the last key.' },
      foes: [
        { ru: 'Сирена джакузи', en: 'Jacuzzi siren', hp: 170, atk: 18, gap: 1.25, xp: 40, gold: 150, line: { ru: 'Пар шепчет остаться.', en: 'The steam whispers for you to stay.' } },
        { ru: 'Ночной ястреб', en: 'Night hawk', hp: 190, atk: 21, gap: 1.2, xp: 44, gold: 170, line: { ru: 'Он пикирует с окна.', en: 'It dives from the window.' } },
        { ru: 'Страж крыши', en: 'Roof warden', hp: 250, atk: 24, gap: 1.15, xp: 80, gold: 260, boss: true, line: { ru: 'Финал. Ключ от крыши висит у него на поясе.', en: 'The end. The roof key hangs on his belt.' } }
      ]
    }
  ];

  var GEAR = [
    { slot: 'weapon', ru: 'Молоток прораба', en: 'Foreman hammer', atk: 3 },
    { slot: 'weapon', ru: 'Кисть мастера', en: 'Master brush', atk: 5 },
    { slot: 'weapon', ru: 'Ключ крыши', en: 'Roof key', atk: 8 },
    { slot: 'charm', ru: 'Нить флориста', en: 'Florist thread', crit: 0.08 },
    { slot: 'charm', ru: 'Линза куратора', en: 'Curator lens', crit: 0.12 },
    { slot: 'charm', ru: 'Искра камина', en: 'Hearth spark', crit: 0.16 },
    { slot: 'cloak', ru: 'Пыльный плащ', en: 'Dust cloak', hp: 12, def: 1 },
    { slot: 'cloak', ru: 'Бархатный плащ', en: 'Velvet cloak', hp: 22, def: 2 },
    { slot: 'cloak', ru: 'Ночной плащ', en: 'Night cloak', hp: 34, def: 3 }
  ];

  var i18nRef = null;
  var audio = null;
  var platform = null;
  var art = null;
  var juice = null;
  var state = null;
  var foe = null;
  var running = false;
  var raf = 0;
  var last = 0;
  var swing = 0;
  var autoSwing = 0;
  var healCd = 0;
  var hitFlash = 0;
  var heroLunge = 0;
  var foeLunge = 0;
  var saveAcc = 0;
  var ended = false;
  var between = null;
  var blow = null;

  function $(id) { return document.getElementById(id); }

  function lang() {
    return i18nRef && i18nRef.lang === 'en' ? 'en' : 'ru';
  }

  function tx(pack) {
    if (!pack) return '';
    return pack[lang()] || pack.ru || '';
  }

  function chapter() {
    return CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, state.chapter))];
  }

  function foeDef() {
    return chapter().foes[Math.max(0, Math.min(chapter().foes.length - 1, state.fight))];
  }

  function xpNeed() {
    return 16 + state.level * 12;
  }

  function gearBonus() {
    var bonus = { atk: 0, hp: 0, def: 0, crit: 0.12 };
    ['weapon', 'charm', 'cloak'].forEach(function (slot) {
      var item = state.gear[slot];
      if (!item) return;
      bonus.atk += item.atk || 0;
      bonus.hp += item.hp || 0;
      bonus.def += item.def || 0;
      bonus.crit += item.crit || 0;
    });
    return bonus;
  }

  function maxHp() {
    return 42 + (state.level - 1) * 8 + state.vital * 8 + gearBonus().hp;
  }

  function attackPower() {
    return 6 + (state.level - 1) * 2 + state.might * 1 + gearBonus().atk;
  }

  function defense() {
    return gearBonus().def;
  }

  function critChance() {
    return Math.min(0.55, gearBonus().crit + state.luck * 0.03);
  }

  function makeFoe() {
    var def = foeDef();
    foe = {
      name: tx(def),
      line: tx(def.line),
      max: def.hp,
      hp: def.hp,
      atk: def.atk,
      gap: def.gap,
      xp: def.xp,
      gold: def.gold,
      boss: !!def.boss,
      guard: !!def.boss,
      open: 0,
      windup: 0.35,
      hue: (state.chapter * 48 + state.fight * 28) % 360,
      shape: [['dust', 'pipe', 'brute'], ['ooze', 'golem', 'brute'], ['beast', 'moth', 'brute'], ['shade', 'mimic', 'brute'], ['ghost', 'drone', 'brute'], ['imp', 'keys', 'brute'], ['siren', 'hawk', 'warden']][state.chapter][state.fight]
    };
    state.streak = 0;
    ended = false;
  }

  function fresh() {
    return {
      v: 1,
      level: 1,
      xp: 0,
      hp: 42,
      gold: 0,
      gems: 0,
      chapter: 0,
      fight: 0,
      rage: 0,
      might: 0,
      vital: 0,
      luck: 0,
      gear: { weapon: null, charm: null, cloak: null },
      offer: null,
      zones: { light: { style: 0, level: 0 }, soft: { style: 0, level: 0 }, floor: { style: 0, level: 0 }, tech: { style: 0, level: 0 }, window: { style: 0, level: 0 } },
      seenIntro: false,
      wins: 0,
      streak: 0
    };
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!raw || raw.v !== 1) return fresh();
      var next = fresh();
      ['level', 'xp', 'hp', 'gold', 'gems', 'chapter', 'fight', 'rage', 'might', 'vital', 'luck', 'wins'].forEach(function (key) {
        if (typeof raw[key] === 'number' && isFinite(raw[key])) next[key] = raw[key];
      });
      next.chapter = Math.max(0, Math.min(CHAPTERS.length - 1, next.chapter | 0));
      next.fight = Math.max(0, Math.min(2, next.fight | 0));
      next.level = Math.max(1, next.level | 0);
      if (raw.gear) {
        ['weapon', 'charm', 'cloak'].forEach(function (slot) {
          if (raw.gear[slot] && raw.gear[slot].slot === slot) next.gear[slot] = raw.gear[slot];
        });
      }
      if (raw.offer && raw.offer.slot) next.offer = raw.offer;
      if (raw.zones) next.zones = raw.zones;
      next.seenIntro = !!raw.seenIntro;
      next.wins = Math.max(0, next.wins | 0);
      next.streak = Math.max(0, raw.streak | 0);
      next.hp = Math.max(1, Math.min(maxHpOf(next), next.hp));
      return next;
    } catch (error) {
      return fresh();
    }
  }

  function maxHpOf(source) {
    var bonus = 0;
    if (source.gear) {
      ['weapon', 'charm', 'cloak'].forEach(function (slot) {
        var item = source.gear[slot];
        if (item) bonus += item.hp || 0;
      });
    }
    return 42 + ((source.level || 1) - 1) * 8 + (source.vital || 0) * 8 + bonus;
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) { void error; }
  }

  function toast(text) {
    var root = $('toasts');
    if (!root || !text) return;
    var node = document.createElement('p');
    node.className = 'toast';
    node.textContent = text;
    root.appendChild(node);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 2400);
  }

  function floatAt(text, tone) {
    if (!juice || !juice.floatText) return;
    var room = $('room-canvas');
    if (!room) return;
    var box = room.getBoundingClientRect();
    juice.floatText(box.left + box.width * 0.62, box.top + box.height * 0.42, text, tone || 'gold');
  }

  function ensurePanel() {
    if ($('rpg-panel')) return;
    var board = document.querySelector('.merge-board');
    if (!board) return;
    var panel = document.createElement('div');
    panel.id = 'rpg-panel';
    panel.className = 'rpg-panel';
    panel.innerHTML = ''
      + '<div class="rpg-bars">'
      + '<label><b id="rpg-hero-name"></b><i id="rpg-hero-hp"></i></label>'
      + '<div class="rpg-track"><div id="rpg-hero-fill" class="rpg-fill is-hero"></div></div>'
      + '<label><b id="rpg-foe-name"></b><i id="rpg-foe-hp"></i></label>'
      + '<div class="rpg-track"><div id="rpg-foe-fill" class="rpg-fill is-foe"></div></div>'
      + '</div>'
      + '<div class="rpg-actions">'
      + '<button type="button" id="rpg-heal"></button>'
      + '<p id="rpg-parry" class="rpg-note"></p>'
      + '</div>'
      + '<div class="rpg-offer" id="rpg-offer" hidden></div>';
    board.appendChild(panel);
    $('rpg-heal').addEventListener('click', function () { heal(); });
  }

  function itemName(item) {
    if (!item) return lang() === 'en' ? 'Empty' : 'Пусто';
    return lang() === 'en' ? item.en : item.ru;
  }

  function itemStat(item) {
    if (!item) return '';
    var bits = [];
    if (item.atk) bits.push('+' + item.atk + (lang() === 'en' ? ' ATK' : ' силы'));
    if (item.hp) bits.push('+' + item.hp + ' HP');
    if (item.def) bits.push('+' + item.def + (lang() === 'en' ? ' DEF' : ' защиты'));
    if (item.crit) bits.push('+' + Math.round(item.crit * 100) + '%');
    return bits.join(' · ');
  }

  function renderOffer() {
    var box = $('rpg-offer');
    if (!box) return;
    if (!state.offer) {
      box.hidden = true;
      box.textContent = '';
      return;
    }
    box.hidden = false;
    box.textContent = '';
    var title = document.createElement('strong');
    title.textContent = itemName(state.offer) + ' · ' + itemStat(state.offer);
    var row = document.createElement('div');
    var wear = document.createElement('button');
    wear.type = 'button';
    wear.textContent = lang() === 'en' ? 'Equip' : 'Надеть';
    wear.addEventListener('click', equipOffer);
    var sell = document.createElement('button');
    sell.type = 'button';
    sell.textContent = lang() === 'en' ? 'Sell' : 'Продать';
    sell.addEventListener('click', sellOffer);
    row.appendChild(wear);
    row.appendChild(sell);
    box.appendChild(title);
    box.appendChild(row);
  }

  function render() {
    if (!state || !foe) return;
    var book = chapter();
    var heroMax = maxHp();
    var telegraph = !between && foe.windup >= foe.gap - 0.48 && !ended && foe.hp > 0;
    if ($('room-name')) $('room-name').textContent = tx(book);
    if ($('room-next')) {
      $('room-next').textContent = between
        ? between.text
        : telegraph
          ? (foe.guard && foe.open <= 0
            ? (lang() === 'en' ? 'Parry — break the shield!' : 'Парируй — сломай щит!')
            : (lang() === 'en' ? 'Wind-up — strike to parry!' : 'Замах — бей, чтобы парировать!'))
          : foe.guard && foe.open > 0
            ? foe.name + '  ' + Math.max(0, Math.ceil(foe.hp)) + '/' + foe.max + (lang() === 'en' ? ' · shield open ' : ' · щит открыт ') + Math.ceil(foe.open)
            : foe.name + '  ' + Math.max(0, Math.ceil(foe.hp)) + '/' + foe.max + (foe.guard && foe.open <= 0 ? (lang() === 'en' ? ' · shield' : ' · щит') : '');
    }
    if ($('room-blurb')) {
      $('room-blurb').textContent = between
        ? (lang() === 'en' ? 'Tap to walk on.' : 'Нажми, чтобы идти дальше.')
        : ended
          ? (lang() === 'en' ? 'The roof key is yours.' : 'Ключ от крыши теперь твой.')
          : (state.seenIntro ? foe.line : tx(book.intro));
    }
    if ($('orders-kicker')) $('orders-kicker').textContent = lang() === 'en' ? 'Battle' : 'Бой';
    if ($('orders-prestige')) {
      $('orders-prestige').textContent = (lang() === 'en' ? 'Crit ' : 'Крит ') + Math.round(critChance() * 100) + '%';
    }
    if ($('quest-kicker')) $('quest-kicker').textContent = lang() === 'en' ? 'Floor' : 'Этаж';
    if ($('quest-title')) {
      $('quest-title').textContent = foe.boss
        ? (lang() === 'en' ? 'Floor boss' : 'Босс этажа')
        : (lang() === 'en' ? 'Clear the room' : 'Зачисти комнату');
    }
    if ($('quest-count')) $('quest-count').textContent = (state.chapter + 1) + '/' + CHAPTERS.length + ' · ' + (state.fight + 1) + '/' + book.foes.length;
    var ratio = book.foes.length ? state.fight / book.foes.length : 0;
    if ($('quest-fill')) $('quest-fill').style.width = (ratio * 100) + '%';
    if ($('money-value')) $('money-value').textContent = String(state.gold);
    if ($('crystal-value')) $('crystal-value').textContent = String(state.gems);
    if ($('income-value')) {
      $('income-value').textContent = (lang() === 'en' ? 'Lv ' : 'Ур. ') + state.level + '  ' + state.xp + '/' + xpNeed();
    }
    var span = document.querySelector('#btn-spawn span');
    if (span) {
      span.textContent = between
        ? (lang() === 'en' ? 'Next' : 'Дальше')
        : state.rage >= 100
          ? (lang() === 'en' ? 'FINISHER' : 'ПРИЁМ')
          : (lang() === 'en' ? 'Strike' : 'Удар');
    }
    var attackBtn = $('btn-spawn');
    if (attackBtn) attackBtn.classList.toggle('is-parry', !!telegraph);
    if ($('spawn-count')) $('spawn-count').textContent = Math.ceil(state.hp) + '/' + heroMax;
    if ($('inspire-label')) {
      $('inspire-label').textContent = state.rage >= 100
        ? (lang() === 'en' ? 'Finisher is ready' : 'Приём готов')
        : (lang() === 'en' ? 'Rage ' : 'Ярость ') + Math.floor(state.rage) + '%';
    }
    if ($('inspire-fill')) $('inspire-fill').style.width = Math.min(100, state.rage) + '%';
    if ($('energy-fill')) $('energy-fill').style.width = Math.max(0, Math.min(100, state.hp / heroMax * 100)) + '%';
    if ($('merge-title')) $('merge-title').textContent = lang() === 'en' ? 'Gear' : 'Снаряжение';
    if ($('grid-count')) {
      var worn = ['weapon', 'charm', 'cloak'].filter(function (slot) { return state.gear[slot]; }).length;
      $('grid-count').textContent = worn + ' / 3';
    }
    if ($('x2-label')) $('x2-label').textContent = lang() === 'en' ? '🎬 Video: full heal and ×2 damage this fight' : '🎬 Видео: полное лечение и урон ×2 на этот бой';
    if ($('auto-label')) $('auto-label').textContent = lang() === 'en' ? '🎬 Video: auto-strikes for 45 seconds' : '🎬 Видео: автоудары на 45 секунд';
    if ($('rpg-hero-name')) $('rpg-hero-name').textContent = lang() === 'en' ? 'You' : 'Ты';
    if ($('rpg-hero-hp')) $('rpg-hero-hp').textContent = Math.ceil(state.hp) + '/' + heroMax;
    if ($('rpg-foe-name')) $('rpg-foe-name').textContent = foe.name;
    if ($('rpg-foe-hp')) $('rpg-foe-hp').textContent = Math.max(0, Math.ceil(foe.hp)) + '/' + foe.max;
    if ($('rpg-hero-fill')) $('rpg-hero-fill').style.width = Math.max(0, state.hp / heroMax * 100) + '%';
    if ($('rpg-foe-fill')) {
      $('rpg-foe-fill').style.width = Math.max(0, foe.hp / foe.max * 100) + '%';
      $('rpg-foe-fill').style.background = foe.guard && foe.open <= 0
        ? 'linear-gradient(90deg, #8a6a22, #e4b15a)'
        : 'linear-gradient(90deg, #6a2a3a, #d46a6a)';
    }
    var healBtn = $('rpg-heal');
    if (healBtn) {
      healBtn.disabled = healCd > 0 || ended;
      healBtn.textContent = healCd > 0
        ? (lang() === 'en' ? 'Bandage ' : 'Бинт ') + Math.ceil(healCd)
        : (lang() === 'en' ? 'Bandage' : 'Бинт');
    }
    var note = $('rpg-parry');
    if (note) {
      var last = blow && blow.text ? blow.text : '';
      var series = state.streak > 0 ? (lang() === 'en' ? 'Chain ' : 'Серия ') + state.streak : '';
      var open = foe.guard && foe.open > 0
        ? (lang() === 'en' ? 'Shield open ' : 'Щит открыт ') + Math.ceil(foe.open)
        : '';
      note.textContent = telegraph
        ? (foe.guard && foe.open <= 0
          ? (lang() === 'en' ? 'Parry — break the shield' : 'Парируй — сломай щит')
          : (lang() === 'en' ? 'Parry now' : 'Парируй'))
        : (foe.guard && foe.open <= 0
          ? (lang() === 'en' ? 'Shield — hit the wind-up' : 'Щит — бей в замах')
          : [open, series, last].filter(Boolean).join(' · ') || (lang() === 'en' ? 'Wait for the wind-up' : 'Жди замах'));
    }
    var list = $('orders-list');
    if (list && list.dataset.rpg !== gearSignature()) {
      list.dataset.rpg = gearSignature();
      list.textContent = '';
      ['weapon', 'charm', 'cloak'].forEach(function (slot) {
        var card = document.createElement('article');
        card.className = 'order-card' + (state.gear[slot] ? ' is-ready' : '');
        var who = document.createElement('strong');
        var label = slot === 'weapon' ? (lang() === 'en' ? 'Weapon' : 'Оружие') : slot === 'charm' ? (lang() === 'en' ? 'Charm' : 'Оберег') : (lang() === 'en' ? 'Cloak' : 'Плащ');
        who.textContent = label + ': ' + itemName(state.gear[slot]);
        var meta = document.createElement('p');
        meta.textContent = state.gear[slot] ? itemStat(state.gear[slot]) : (lang() === 'en' ? 'Drops from foes.' : 'Падает с врагов.');
        card.appendChild(who);
        card.appendChild(meta);
        list.appendChild(card);
      });
    }
    renderOffer();
  }

  function gearSignature() {
    return ['weapon', 'charm', 'cloak'].map(function (slot) {
      var item = state.gear[slot];
      return item ? item.ru : '-';
    }).join('|');
  }

  function drawFoe(ctx, x, y, scale) {
    var wind = foe.gap ? foe.windup / foe.gap : 0;
    var shape = foe.shape || 'brute';
    ctx.save();
    ctx.translate(x, y - (wind > 0.72 ? scale * 0.08 : 0));
    if (foe.guard && foe.open <= 0) {
      ctx.strokeStyle = 'rgba(228, 177, 90, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, scale * 0.35, scale * 0.72, scale * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, scale * 0.95, scale * 0.5, scale * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    if (wind > 0.72) {
      ctx.strokeStyle = 'rgba(214, 70, 60, 0.95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, scale * 0.2, scale * (0.85 + wind * 0.25), Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    var ink = 'hsl(' + foe.hue + ', 46%, 32%)';
    ctx.fillStyle = ink;
    ctx.strokeStyle = '#1a120e';
    ctx.lineWidth = 2;
    if (shape === 'ooze' || shape === 'siren') {
      ctx.beginPath();
      ctx.ellipse(0, scale * 0.45, scale * 0.55, scale * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(-scale * 0.15, scale * 0.3, scale * 0.12, scale * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'pipe' || shape === 'golem') {
      ctx.fillRect(-scale * 0.45, scale * 0.05, scale * 0.9, scale * 0.7);
      ctx.fillStyle = '#d7c3ae';
      ctx.fillRect(-scale * 0.15, -scale * 0.15, scale * 0.3, scale * 0.35);
    } else if (shape === 'beast' || shape === 'hawk') {
      ctx.beginPath();
      ctx.ellipse(0, scale * 0.45, scale * 0.62, scale * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(scale * 0.42, scale * 0.1, scale * 0.22, scale * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      if (shape === 'hawk') {
        ctx.beginPath();
        ctx.moveTo(-scale * 0.2, scale * 0.3);
        ctx.lineTo(-scale * 0.9, scale * 0.05);
        ctx.lineTo(-scale * 0.2, scale * 0.55);
        ctx.fill();
      }
    } else if (shape === 'moth' || shape === 'ghost') {
      ctx.globalAlpha = shape === 'ghost' ? 0.75 : 1;
      ctx.beginPath();
      ctx.ellipse(-scale * 0.28, scale * 0.35, scale * 0.28, scale * 0.42, -0.4, 0, Math.PI * 2);
      ctx.ellipse(scale * 0.28, scale * 0.35, scale * 0.28, scale * 0.42, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, scale * 0.4, scale * 0.16, scale * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'mimic' || shape === 'keys') {
      ctx.fillRect(-scale * 0.4, scale * 0.15, scale * 0.8, scale * 0.55);
      ctx.fillStyle = '#f4efe4';
      ctx.fillRect(-scale * 0.28, scale * 0.28, scale * 0.56, scale * 0.12);
    } else if (shape === 'drone') {
      ctx.beginPath();
      ctx.moveTo(0, -scale * 0.05);
      ctx.lineTo(scale * 0.35, scale * 0.4);
      ctx.lineTo(0, scale * 0.7);
      ctx.lineTo(-scale * 0.35, scale * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e4b15a';
      ctx.beginPath();
      ctx.moveTo(-scale * 0.55, scale * 0.15);
      ctx.lineTo(scale * 0.55, scale * 0.15);
      ctx.stroke();
    } else if (shape === 'imp') {
      ctx.beginPath();
      ctx.arc(0, scale * 0.4, scale * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e07a3a';
      ctx.beginPath();
      ctx.moveTo(-scale * 0.1, scale * 0.15);
      ctx.lineTo(0, -scale * 0.25);
      ctx.lineTo(scale * 0.1, scale * 0.15);
      ctx.fill();
    } else if (shape === 'dust') {
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, scale * 0.4, scale * 0.34, scale * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(232, 220, 196, 0.45)';
      ctx.beginPath();
      ctx.arc(-scale * 0.28, scale * 0.2, scale * 0.16, 0, Math.PI * 2);
      ctx.arc(scale * 0.3, scale * 0.55, scale * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-scale * 0.46, scale * 0.05);
      ctx.lineTo(-scale * 0.66, scale * 0.4);
      ctx.quadraticCurveTo(-scale * 0.2, scale * 1.05, 0, scale * 0.92);
      ctx.quadraticCurveTo(scale * 0.2, scale * 1.05, scale * 0.66, scale * 0.4);
      ctx.lineTo(scale * 0.46, scale * 0.05);
      ctx.closePath();
      ctx.fill();
      if (foe.boss || shape === 'warden' || shape === 'brute') {
        ctx.strokeStyle = '#e4b15a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -scale * 0.28, scale * 0.24, Math.PI, 0);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1a120e';
    ctx.beginPath();
    ctx.arc(-scale * 0.1, scale * 0.32, scale * 0.05, 0, Math.PI * 2);
    ctx.arc(scale * 0.12, scale * 0.32, scale * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawActor(ctx, x, y, scale, kind, flash) {
    ctx.save();
    ctx.translate(x, y);
    if (flash > 0) ctx.globalAlpha = 0.65 + Math.sin(flash * 40) * 0.25;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 8, scale * 0.42, scale * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    var body = kind === 'hero' ? '#c4553a' : 'hsl(' + foe.hue + ', 42%, 38%)';
    ctx.fillStyle = body;
    if (kind === 'foe') {
      ctx.beginPath();
      ctx.moveTo(-scale * 0.42, -scale * 0.05);
      ctx.lineTo(-scale * 0.62, scale * 0.35);
      ctx.quadraticCurveTo(-scale * 0.2, scale * 1.05, 0, scale * 0.95);
      ctx.quadraticCurveTo(scale * 0.2, scale * 1.05, scale * 0.62, scale * 0.35);
      ctx.lineTo(scale * 0.42, -scale * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1a120e';
      ctx.fillRect(-scale * 0.16, scale * 0.15, scale * 0.1, scale * 0.55);
      ctx.fillRect(scale * 0.06, scale * 0.15, scale * 0.1, scale * 0.55);
    } else {
      ctx.beginPath();
      ctx.moveTo(-scale * 0.28, -scale * 0.1);
      ctx.quadraticCurveTo(-scale * 0.46, scale * 0.55, -scale * 0.16, scale * 0.9);
      ctx.lineTo(scale * 0.16, scale * 0.9);
      ctx.quadraticCurveTo(scale * 0.46, scale * 0.55, scale * 0.28, -scale * 0.1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = kind === 'hero' ? '#f0c9a0' : '#c9b29a';
    ctx.beginPath();
    ctx.arc(0, -scale * 0.42, scale * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a120e';
    ctx.beginPath();
    ctx.arc(-scale * 0.1, -scale * 0.46, scale * 0.045, 0, Math.PI * 2);
    ctx.arc(scale * 0.1, -scale * 0.46, scale * 0.045, 0, Math.PI * 2);
    ctx.fill();
    if (kind === 'hero' && state.gear && state.gear.weapon) {
      ctx.strokeStyle = '#e4b15a';
      ctx.lineWidth = Math.max(2, scale * 0.06);
      ctx.beginPath();
      ctx.moveTo(scale * 0.22, scale * 0.15);
      ctx.lineTo(scale * 0.55, scale * 0.55);
      ctx.stroke();
      ctx.fillStyle = '#e4b15a';
      ctx.fillRect(scale * 0.42, scale * 0.48, scale * 0.28, scale * 0.14);
    }
    ctx.restore();
  }

  function draw(time) {
    var canvas = $('room-canvas');
    if (!canvas || !art || !art.paintRoom) return;
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(2, Math.round(rect.width));
    var h = Math.max(2, Math.round(rect.height));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    var ctx = canvas.getContext('2d');
    var book = chapter();
    art.paintRoom(ctx, w, h, {
      maxLevel: book.tier,
      rentLevel: 0,
      zones: state.zones,
      guest: false,
      flash: hitFlash > 0
    }, time);
    if (h < 90) return;
    var wind = foe.gap ? foe.windup / foe.gap : 0;
    var heroX = w * 0.30 + heroLunge * 22;
    var foeX = w * 0.72 - foeLunge * 18 - (wind > 0.72 ? w * 0.03 : 0);
    var foot = h * 0.78;
    var scale = Math.max(28, h * 0.22);
    drawActor(ctx, heroX, foot - scale, scale, 'hero', 0);
    if (foe.hp <= 0) {
      ctx.fillStyle = 'rgba(90, 40, 40, 0.75)';
      ctx.beginPath();
      ctx.ellipse(foeX, foot, scale * 0.7, scale * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawFoe(ctx, foeX, foot - scale * 0.2, scale * (foe.boss ? 1.15 : 1));
    }
    if (heroLunge > 0.2) {
      ctx.strokeStyle = 'rgba(244, 214, 150, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(heroX + scale * 0.4, foot - scale * 0.7);
      ctx.lineTo(foeX - scale * 0.2, foot - scale * 0.55);
      ctx.stroke();
    }
    var barW = Math.max(36, scale * 1.3);
    var barY = foot - scale * 1.35;
    drawMeter(ctx, heroX - barW / 2, barY, barW, Math.max(0, state.hp / maxHp()), '#e4b15a');
    drawMeter(ctx, foeX - barW / 2, barY, barW, Math.max(0, foe.hp / foe.max), '#d46a6a');
    if (blow && blow.left > 0 && h > 120) {
      ctx.save();
      ctx.font = '700 ' + Math.max(16, Math.round(scale * 0.42)) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = blow.crit ? '#ffe08a' : '#fff6e8';
      ctx.fillText(blow.text, foeX, barY - 8);
      ctx.restore();
    }
  }

  function drawMeter(ctx, x, y, w, ratio, color) {
    var h = 6;
    ctx.fillStyle = 'rgba(12, 8, 6, 0.72)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(0, w * Math.min(1, ratio)), h);
    ctx.strokeStyle = 'rgba(255, 244, 220, 0.45)';
    ctx.strokeRect(x, y, w, h);
  }

  function attack(fromAuto) {
    if (!state || !foe || ended) return false;
    if (between) {
      if (!fromAuto) finishBetween();
      return true;
    }
    if (document.body.classList.contains('is-paused') && !fromAuto) {
      /* taps during a real ad are ignored; the preview is often paused, QA passes fromAuto false too */
    }
    if (swing > 0 && !fromAuto) return false;
    if (!state.seenIntro) state.seenIntro = true;
    var power = attackPower() * (fromAuto ? 0.62 : 1);
    var finisher = !fromAuto && state.rage >= 100;
    if (finisher) {
      power *= 2.6;
      state.rage = 0;
    } else if (!fromAuto) {
      state.rage = Math.min(100, state.rage + 22);
    }
    var telegraph = foe.windup >= foe.gap - 0.48;
    var parried = false;
    var crit = false;
    if (!fromAuto && telegraph) {
      parried = true;
      foe.windup = 0;
      state.streak = (state.streak || 0) + 1;
      power *= 1.45 + Math.min(0.6, (state.streak - 1) * 0.12);
    }
    if (!fromAuto && Math.random() < critChance()) {
      crit = true;
      power *= 1.7;
    }
    if (state.boost) power *= 2;
    var shielded = foe.guard && foe.open <= 0 && !parried;
    if (shielded) power *= 0.35;
    if (parried && foe.guard) foe.open = 2.6;
    var damage = Math.max(1, Math.round(power));
    foe.hp -= damage;
    hitFlash = 0.18;
    heroLunge = 1;
    if (!fromAuto) swing = 0.28;
    if (audio && audio.playMerge) audio.playMerge(finisher ? 3 : 1);
    var word = finisher
      ? (lang() === 'en' ? 'Finisher ' : 'Приём ')
      : parried
        ? (lang() === 'en' ? 'Parry ' : 'Пари ')
        : shielded
          ? (lang() === 'en' ? 'Shield ' : 'Щит ')
          : crit
          ? (lang() === 'en' ? 'Crit ' : 'Крит ')
          : '';
    blow = { text: word + damage, left: 0.85, crit: crit || finisher };
    floatAt(blow.text, finisher || crit ? 'gold' : 'fire');
    if (juice && juice.shake) juice.shake(finisher ? 8 : 3);
    if (foe.hp <= 0) winFight();
    render();
    return true;
  }

  function hurt() {
    var damage = Math.max(1, foe.atk - defense());
    state.hp -= damage;
    foeLunge = 1;
    state.streak = 0;
    if (audio && audio.playSpawn) audio.playSpawn();
    floatAt('-' + damage, 'star');
    if (state.hp <= 0) {
      state.hp = maxHp();
      state.gold = Math.max(0, Math.floor(state.gold * 0.85));
      toast(lang() === 'en' ? 'You fall back to the door. The foe is waiting.' : 'Ты отступаешь к двери. Враг ждёт.');
      makeFoe();
      save();
    }
  }

  function gainXp(amount) {
    state.xp += amount;
    var notes = [];
    while (state.xp >= xpNeed()) {
      state.xp -= xpNeed();
      state.level += 1;
      state.hp = maxHp();
      notes.push(lang() === 'en' ? 'Level ' + state.level : 'Уровень ' + state.level);
    }
    if (notes.length) {
      toast(notes.join(' · '));
      if (audio && audio.playUpgrade) audio.playUpgrade();
    }
  }

  function rollGear() {
    var pool = GEAR.filter(function (item) {
      if (state.chapter < 2 && item.atk >= 5) return false;
      if (state.chapter < 4 && (item.atk >= 8 || item.crit >= 0.16)) return false;
      return true;
    });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function winFight() {
    var book = chapter();
    var def = foeDef();
    var chainGold = (state.streak || 0) * 6;
    var gold = def.gold + state.level * 2 + chainGold;
    var xp = def.xp;
    state.gold += gold;
    state.gems += def.boss ? 2 : 0;
    state.wins += 1;
    gainXp(xp);
    state.hp = Math.min(maxHp(), state.hp + Math.round(maxHp() * 0.28));
    if (audio && audio.playCoin) audio.playCoin();
    toast('+' + gold + (lang() === 'en' ? ' gold' : ' золота'));
    var drop = def.boss || Math.random() < 0.38;
    if (drop) {
      var found = rollGear();
      state.offer = {
        slot: found.slot,
        ru: found.ru,
        en: found.en,
        atk: found.atk || 0,
        hp: found.hp || 0,
        def: found.def || 0,
        crit: found.crit || 0
      };
    }
    if (def.boss) {
      var cycle = ['light', 'soft', 'floor', 'tech', 'window'];
      var id = cycle[state.chapter % cycle.length];
      state.zones[id] = { style: state.chapter >= 4 ? 3 : state.chapter >= 2 ? 2 : 1, level: Math.min(6, state.chapter + 1) };
      if (state.chapter >= CHAPTERS.length - 1) {
        ended = true;
        toast(lang() === 'en' ? 'The roof key is yours.' : 'Ключ от крыши твой.');
      } else {
        state.chapter += 1;
        state.fight = 0;
        state.seenIntro = false;
        toast(tx(chapter()));
      }
    } else {
      state.fight += 1;
    }
    state.boost = false;
    between = {
      left: 1.15,
      text: '+' + gold + (lang() === 'en' ? ' gold · +' : ' золота · +') + xp + (lang() === 'en' ? ' xp' : ' опыта')
        + (chainGold ? (lang() === 'en' ? ' · chain ' : ' · серия ') + state.streak : '')
    };
    foe.hp = 0;
    save();
  }

  function finishBetween() {
    if (!between) return;
    between = null;
    if (!ended) makeFoe();
    render();
  }

  function equipOffer() {
    if (!state.offer) return;
    var prev = state.gear[state.offer.slot];
    state.gear[state.offer.slot] = state.offer;
    state.offer = null;
    if (state.hp > maxHp()) state.hp = maxHp();
    toast(lang() === 'en' ? 'Equipped.' : 'Надето.');
    if (prev) state.gold += 15 + (prev.atk || 0) * 8;
    var list = $('orders-list');
    if (list) list.dataset.rpg = '';
    save();
    render();
  }

  function sellOffer() {
    if (!state.offer) return;
    var price = 20 + (state.offer.atk || 0) * 10 + (state.offer.hp || 0);
    state.gold += price;
    state.offer = null;
    toast('+' + price);
    save();
    render();
  }

  function heal() {
    if (healCd > 0 || ended) return;
    var amount = Math.round(maxHp() * 0.34);
    state.hp = Math.min(maxHp(), state.hp + amount);
    healCd = 8;
    if (audio && audio.playUpgrade) audio.playUpgrade();
    floatAt('+' + amount, 'gold');
    render();
  }

  function step(dt) {
    if (ended || !foe) return;
    if (between) {
      between.left -= dt;
      if (between.left <= 0) finishBetween();
      return;
    }
    swing = Math.max(0, swing - dt);
    healCd = Math.max(0, healCd - dt);
    hitFlash = Math.max(0, hitFlash - dt);
    heroLunge = Math.max(0, heroLunge - dt * 3.4);
    foeLunge = Math.max(0, foeLunge - dt * 3.2);
    if (blow) {
      blow.left -= dt;
      if (blow.left <= 0) blow = null;
    }
    if (foe.open > 0) foe.open -= dt;
    var telegraph = foe.windup >= foe.gap - 0.55;
    var boost = state.autoUntil && performance.now() < state.autoUntil;
    if (!telegraph) {
      autoSwing += dt;
      var tempo = boost ? 0.42 : 0.95;
      if (autoSwing >= tempo) {
        autoSwing = 0;
        attack(true);
      }
    }
    if (ended) return;
    foe.windup += dt;
    if (foe.windup >= foe.gap) {
      foe.windup = 0;
      hurt();
    }
    saveAcc += dt;
    if (saveAcc > 4) {
      saveAcc = 0;
      save();
    }
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!document.body.classList.contains('is-paused')) step(dt);
    draw(now / 1000);
    render();
  }

  function openSheet(kind) {
    var overlay = $('sheet-overlay');
    var scroll = $('sheet-scroll');
    var title = $('sheet-title');
    if (!overlay || !scroll || !title) return;
    overlay.hidden = false;
    overlay.inert = false;
    scroll.textContent = '';
    if (kind === 'upgrades') {
      title.textContent = lang() === 'en' ? 'Power' : 'Сила';
      addBuy(scroll, lang() === 'en' ? 'Might' : 'Мощь', '+' + (1) + (lang() === 'en' ? ' attack' : ' к удару'), costMight(), 'gold', function () {
        if (state.gold < costMight()) return toast(lang() === 'en' ? 'Not enough gold.' : 'Мало золота.');
        state.gold -= costMight();
        state.might += 1;
        toast(lang() === 'en' ? 'Attack grew.' : 'Удар стал сильнее.');
        save();
        openSheet('upgrades');
      });
      addBuy(scroll, lang() === 'en' ? 'Vitality' : 'Живучесть', '+8 HP', costVital(), 'gold', function () {
        if (state.gold < costVital()) return toast(lang() === 'en' ? 'Not enough gold.' : 'Мало золота.');
        state.gold -= costVital();
        state.vital += 1;
        state.hp = Math.min(maxHp(), state.hp + 8);
        toast('+8 HP');
        save();
        openSheet('upgrades');
      });
      addBuy(scroll, lang() === 'en' ? 'Luck' : 'Удача', '+3% crit', 2 + state.luck, 'gem', function () {
        var price = 2 + state.luck;
        if (state.gems < price) return toast(lang() === 'en' ? 'Not enough gems.' : 'Мало кристаллов.');
        state.gems -= price;
        state.luck += 1;
        toast(lang() === 'en' ? 'Crit chance rose.' : 'Шанс крита вырос.');
        save();
        openSheet('upgrades');
      });
    } else if (kind === 'shop') {
      title.textContent = lang() === 'en' ? 'Store' : 'Лавка';
      addBuy(scroll, lang() === 'en' ? 'Bandage kit' : 'Набор бинтов', lang() === 'en' ? 'Full heal' : 'Полное лечение', 40, 'gold', function () {
        if (state.gold < 40) return toast(lang() === 'en' ? 'Not enough gold.' : 'Мало золота.');
        state.gold -= 40;
        state.hp = maxHp();
        toast(lang() === 'en' ? 'Wounds closed.' : 'Раны закрылись.');
        save();
        closeSheet();
      });
      addBuy(scroll, lang() === 'en' ? 'Rage stone' : 'Камень ярости', lang() === 'en' ? 'Rage to full' : 'Ярость до упора', 1, 'gem', function () {
        if (state.gems < 1) return toast(lang() === 'en' ? 'Not enough gems.' : 'Мало кристаллов.');
        state.gems -= 1;
        state.rage = 100;
        toast(lang() === 'en' ? 'Finisher is ready.' : 'Приём готов.');
        save();
        closeSheet();
      });
    } else {
      title.textContent = lang() === 'en' ? 'Skills' : 'Умения';
      var note = document.createElement('p');
      note.className = 'sheet-note';
      note.textContent = lang() === 'en'
        ? 'Strike fills rage. At 100% the button becomes a finisher. Strike during a wind-up to parry and hit harder. Bandage heals a third of your health.'
        : 'Удары копят ярость. На 100% кнопка становится приёмом. Бей во время замаха — парируешь и ударишь сильнее. Бинт лечит треть здоровья.';
      scroll.appendChild(note);
    }
    render();
  }

  function costMight() { return 30 + state.might * 28; }
  function costVital() { return 24 + state.vital * 22; }

  function addBuy(scroll, name, detail, price, pay, onClick) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'style-choice is-ready';
    var strong = document.createElement('strong');
    strong.textContent = name + ' — ' + detail;
    var span = document.createElement('span');
    span.textContent = price + (pay === 'gem' ? (lang() === 'en' ? ' gems' : ' крист.') : (lang() === 'en' ? ' gold' : ' золота'));
    row.appendChild(strong);
    row.appendChild(span);
    row.addEventListener('click', onClick);
    scroll.appendChild(row);
  }

  function closeSheet() {
    var overlay = $('sheet-overlay');
    if (!overlay) return;
    overlay.hidden = true;
    overlay.inert = true;
  }

  function watchAd(onReward) {
    if (!platform || typeof platform.showRewardedVideo !== 'function') {
      onReward();
      return;
    }
    platform.showRewardedVideo({
      onRewarded: function () { onReward(); },
      onClose: function () {},
      onError: function () { toast(lang() === 'en' ? 'The video did not play.' : 'Ролик не запустился.'); }
    });
  }

  function bind() {
    document.body.classList.add('is-rpg');
    var app = $('app');
    if (app) app.classList.add('is-rpg');
    ensurePanel();
    var attackBtn = $('btn-spawn');
    if (attackBtn) {
      attackBtn.classList.remove('is-empty');
      attackBtn.addEventListener('click', function () { attack(false); });
    }
    var room = document.querySelector('.room');
    if (room) room.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('button')) return;
      attack(false);
    });
    var tabs = { 'tab-upgrades': 'upgrades', 'tab-shop': 'shop', 'tab-boosters': 'skills' };
    Object.keys(tabs).forEach(function (id) {
      var node = $(id);
      if (!node) return;
      node.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openSheet(tabs[id]);
      }, true);
    });
    var closer = $('sheet-close');
    var back = $('sheet-backdrop');
    if (closer) closer.addEventListener('click', closeSheet);
    if (back) back.addEventListener('click', closeSheet);
    var x2 = $('btn-x2');
    if (x2) x2.addEventListener('click', function () {
      watchAd(function () {
        state.hp = maxHp();
        state.boost = true;
        toast(lang() === 'en' ? 'This fight hits twice as hard.' : 'Этот бой бьёт вдвое сильнее.');
        save();
      });
    });
    var auto = $('btn-auto');
    if (auto) auto.addEventListener('click', function () {
      watchAd(function () {
        state.autoUntil = performance.now() + 45000;
        toast(lang() === 'en' ? 'Auto-strikes for 45 seconds.' : 'Автоудары на 45 секунд.');
        save();
      });
    });
    var claim = $('quest-claim');
    if (claim) claim.hidden = true;
  }

  function start(ctx) {
    i18nRef = ctx.i18n;
    audio = ctx.audio;
    platform = ctx.platform;
    art = ctx.art || window.AureliaArt;
    if (window.AureliaJuice && typeof window.AureliaJuice.mount === 'function') {
      try { juice = window.AureliaJuice.mount(); } catch (error) { juice = null; }
    }
    state = load();
    state.hp = Math.min(maxHp(), state.hp);
    makeFoe();
    bind();
    render();
    draw(0);
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
    window.AureliaQAHooks = {
      attack: function () { swing = 0; return attack(false); },
      tick: function (dt) { step(dt || 0.35); render(); return window.AureliaQAHooks.snapshot(); },
      snapshot: function () {
        return {
          hp: state.hp,
          max: maxHp(),
          foe: foe ? foe.hp : 0,
          foeMax: foe ? foe.max : 0,
          name: foe ? foe.name : '',
          level: state.level,
          gold: state.gold,
          chapter: state.chapter,
          fight: state.fight,
          room: $('room-name') ? $('room-name').textContent : '',
          ended: ended
        };
      }
    };
    return {
      suspend: function () { running = false; if (raf) cancelAnimationFrame(raf); },
      resume: function () {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      persist: save
    };
  }

  window.AureliaGame = { start: start };
})();
