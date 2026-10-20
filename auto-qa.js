(function () {
  'use strict';

  var root = document.createElement('div');
  root.className = 'qa-root';
  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'qa-toggle';
  toggle.textContent = '🤖 QA';
  var panel = document.createElement('section');
  panel.className = 'qa-panel';
  panel.hidden = true;
  panel.innerHTML = ''
    + '<h2>Авто-аудит Аурелии</h2>'
    + '<p id="qa-status">Панель закрыта. F9 открывает аудит. Бот жмёт поставку, слияния, заказы и прокачку.</p>'
    + '<div class="qa-actions">'
    + '<button type="button" id="qa-audit">Проверить 20 клеток</button>'
    + '<button type="button" id="qa-bot" class="is-hot">🚀 Авто-Бот x20</button>'
    + '<button type="button" id="qa-stop">Остановить бота</button>'
    + '</div>'
    + '<div class="qa-log" id="qa-log"></div>';
  root.appendChild(panel);
  root.appendChild(toggle);
  document.body.appendChild(root);
  if (!/[?&]qa=1(?:&|$)/.test(location.search)) root.hidden = true;

  function placeQA() {
    var room = document.querySelector('.room');
    if (!room) return;
    var box = room.getBoundingClientRect();
    var height = toggle.getBoundingClientRect().height || 36;
    var top = box.top + 8;
    if (top + height > box.bottom - 8) top = Math.max(box.top + 8, box.bottom - height - 8);
    var rightGap = Math.max(8, window.innerWidth - box.right + 8);
    root.style.top = Math.round(top) + 'px';
    root.style.right = Math.round(rightGap) + 'px';
    root.style.left = 'auto';
    root.style.bottom = 'auto';
  }

  placeQA();
  window.addEventListener('resize', placeQA);
  window.addEventListener('load', placeQA);
  requestAnimationFrame(function () {
    placeQA();
    requestAnimationFrame(placeQA);
  });

  var logNode = panel.querySelector('#qa-log');
  var statusNode = panel.querySelector('#qa-status');
  var botTimer = 0;
  var leapTimer = 0;
  var botStopAt = 0;
  var botSteps = 0;

  function log(line) {
    logNode.textContent = line + '\n' + logNode.textContent;
    if (logNode.textContent.length > 2400) logNode.textContent = logNode.textContent.slice(0, 2400);
  }

  function fitValue() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--fit');
    var value = parseFloat(raw);
    return isFinite(value) && value > 0 ? value : 1;
  }

  function setFit(value) {
    document.documentElement.style.setProperty('--fit', String(Math.round(value * 100) / 100));
  }

  function measure() {
    var cells = document.querySelectorAll('#merge-grid .cell');
    var dock = document.querySelector('.dock');
    var app = document.getElementById('app');
    if (!dock || !app || cells.length !== 20) {
      return { ok: false, cells: cells.length, overlap: 0, visible: 0, reason: 'сетка ещё не собрана' };
    }
    var dockBox = dock.getBoundingClientRect();
    var appBox = app.getBoundingClientRect();
    var visible = 0;
    var overlap = 0;
    var narrow = 0;
    for (var i = 0; i < cells.length; i += 1) {
      var box = cells[i].getBoundingClientRect();
      if (box.width < 12 || box.height < 12) narrow += 1;
      if (box.bottom > dockBox.top + 0.5) overlap = Math.max(overlap, box.bottom - dockBox.top);
      var inside = box.top >= appBox.top - 1 && box.bottom <= dockBox.top + 0.5 && box.left >= appBox.left - 1 && box.right <= appBox.right + 1;
      if (inside && box.width >= 12 && box.height >= 12) visible += 1;
    }
    return {
      ok: visible === 20 && overlap <= 0.5,
      cells: cells.length,
      visible: visible,
      overlap: Math.round(overlap),
      narrow: narrow
    };
  }

  function audit(attempt) {
    var report = measure();
    var step = attempt || 0;
    if (!report.ok && report.overlap > 0 && step < 6) {
      var next = Math.max(0.62, fitValue() - 0.06);
      setFit(next);
      log('Перекрытие ' + report.overlap + 'px. Масштаб --fit = ' + next);
      requestAnimationFrame(function () { audit(step + 1); });
      return;
    }
    if (report.ok) {
      statusNode.textContent = 'Сетка 5×4 цела: все 20 клеток выше нижней панели.';
      log('OK · видно ' + report.visible + '/20 · --fit ' + fitValue());
    } else {
      statusNode.textContent = 'Видно ' + report.visible + '/20. Перекрытие ' + report.overlap + 'px.';
      log('FAIL · видно ' + report.visible + '/20 · перекрытие ' + report.overlap + 'px');
    }
  }

  function hooks() {
    return window.AureliaQAHooks || null;
  }

  function stopBot() {
    if (botTimer) clearInterval(botTimer);
    if (leapTimer) clearInterval(leapTimer);
    botTimer = 0;
    leapTimer = 0;
    if (botSteps) log('Бот остановлен. Шагов: ' + botSteps);
    statusNode.textContent = 'Бот остановлен.';
  }

  function botTick() {
    var api = hooks();
    if (!api) return;
    if (api.hardPaused()) {
      stopBot();
      log('Бот встал: реклама или скрытая вкладка.');
      return;
    }
    if (performance.now() >= botStopAt) {
      var snap = api.snapshot();
      stopBot();
      log('Минута вышла. Уровень ' + snap.max + ', этап ' + snap.tier + ', деньги ' + Math.round(snap.money));
      return;
    }
    api.drive(function () {
      if (!api.deliver()) {
        if (!api.merge()) api.spawn();
      }
      if (botSteps % 8 === 0) api.buy();
    });
    botSteps += 1;
    if (botSteps % 20 === 0) {
      var live = api.snapshot();
      statusNode.textContent = 'Бот · ' + botSteps + ' шагов · предмет ' + live.max + ' · этап ' + live.tier;
    }
  }

  function startBot() {
    var api = hooks();
    if (!api) {
      log('Игра ещё запускается.');
      return;
    }
    stopBot();
    botSteps = 0;
    botStopAt = performance.now() + 60000;
    statusNode.textContent = 'Авто-бот x20 на 60 секунд.';
    log('Старт. 20 действий в секунду.');
    botTimer = setInterval(botTick, 50);
    leapTimer = setInterval(function () {
      if (!hooks() || hooks().hardPaused()) return;
      hooks().leap();
    }, 1000);
  }

  toggle.addEventListener('click', function () {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) audit(0);
  });
  panel.querySelector('#qa-audit').addEventListener('click', function () { audit(0); });
  panel.querySelector('#qa-bot').addEventListener('click', startBot);
  panel.querySelector('#qa-stop').addEventListener('click', stopBot);
  window.addEventListener('keydown', function (event) {
    if (event.key !== 'F9') return;
    if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;
    event.preventDefault();
    panel.hidden = !panel.hidden;
    if (!panel.hidden) audit(0);
  });
  window.addEventListener('resize', function () {
    if (!panel.hidden) audit(0);
  });
})();
