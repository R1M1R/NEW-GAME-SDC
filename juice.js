(function () {
  'use strict';

  function cubic(a, b, c, d, t) {
    var u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  }

  function starPath(ctx, radius) {
    ctx.beginPath();
    for (var i = 0; i < 8; i += 1) {
      var angle = i * Math.PI / 4 - Math.PI / 2;
      var r = i % 2 === 0 ? radius : radius * 0.42;
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function mount(options) {
    var stage = options.stage;
    var app = options.app;
    var cellCount = options.cells || 20;
    var i18n = options.i18n;
    var art = options.art;
    var codexInfo = options.codexInfo;
    var springs = [];
    var particles = [];
    var floaters = [];
    var shakeMag = 0;
    var ghost = { x: 1, y: 1, vx: 0, vy: 0 };
    var codexOpen = false;

    for (var i = 0; i < cellCount; i += 1) {
      springs.push({ x: 1, y: 1, vx: 0, vy: 0 });
    }

    var canvas = document.createElement('canvas');
    canvas.className = 'juice-canvas';
    var ctx = canvas.getContext('2d');
    var floatLayer = document.createElement('div');
    floatLayer.className = 'float-layer';
    document.body.appendChild(canvas);
    document.body.appendChild(floatLayer);

    var codex = document.createElement('section');
    codex.className = 'codex';
    codex.hidden = true;
    codex.setAttribute('role', 'dialog');
    codex.setAttribute('aria-modal', 'true');
    var backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'overlay-backdrop';
    var panel = document.createElement('div');
    panel.className = 'codex-panel';
    var codexBar = document.createElement('div');
    codexBar.className = 'sheet-bar';
    var codexTitle = document.createElement('h2');
    codexTitle.className = 'sheet-title';
    var codexClose = document.createElement('button');
    codexClose.type = 'button';
    codexClose.className = 'sheet-close';
    codexClose.textContent = '×';
    var codexScroll = document.createElement('div');
    codexScroll.className = 'codex-scroll';
    codexBar.appendChild(codexTitle);
    codexBar.appendChild(codexClose);
    panel.appendChild(codexBar);
    panel.appendChild(codexScroll);
    codex.appendChild(backdrop);
    codex.appendChild(panel);
    app.appendChild(codex);
    codexClose.addEventListener('click', function () { closeCodex(); });
    backdrop.addEventListener('click', function () { closeCodex(); });

    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = Math.max(1, window.innerWidth);
      var h = Math.max(1, window.innerHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function stepSpring(s, dt) {
      var stiffness = 230;
      var damping = 13;
      var ax = (1 - s.x) * stiffness - s.vx * damping;
      var ay = (1 - s.y) * stiffness - s.vy * damping;
      s.vx += ax * dt;
      s.vy += ay * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.x = Math.max(0.25, Math.min(1.85, s.x));
      s.y = Math.max(0.25, Math.min(1.85, s.y));
    }

    function step(dt) {
      var safe = Math.max(0, Math.min(0.05, dt || 0));
      for (var i = 0; i < springs.length; i += 1) stepSpring(springs[i], safe);
      stepSpring(ghost, safe);
      for (var p = particles.length - 1; p >= 0; p -= 1) {
        var part = particles[p];
        part.vy += part.g * safe;
        part.x += part.vx * safe;
        part.y += part.vy * safe;
        part.rot += part.vr * safe;
        part.life -= safe;
        if (part.life <= 0) particles.splice(p, 1);
      }
      for (var f = floaters.length - 1; f >= 0; f -= 1) {
        var floater = floaters[f];
        floater.age += safe;
        var t = Math.min(1, floater.age / floater.life);
        var x = cubic(floater.x0, floater.x1, floater.x2, floater.x3, t);
        var y = cubic(floater.y0, floater.y1, floater.y2, floater.y3, t);
        var limit = dockLimit();
        if (y > limit) y = limit;
        var fade = t < 0.72 ? 1 : Math.max(0, 1 - (t - 0.72) / 0.28);
        floater.node.style.left = x + 'px';
        floater.node.style.top = y + 'px';
        floater.node.style.opacity = String(fade);
        floater.node.style.transform = 'translate(-50%, -50%) scale(' + (1 + (1 - t) * 0.12) + ')';
        if (t >= 1) {
          if (floater.node.parentNode) floater.node.parentNode.removeChild(floater.node);
          floaters.splice(f, 1);
        }
      }
      shakeMag *= Math.exp(-3.2 * safe);
      if (stage) {
        if (shakeMag > 0.25) {
          var sx = (Math.random() - 0.5) * shakeMag;
          var sy = (Math.random() - 0.5) * shakeMag;
          stage.style.transform = 'translate(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px)';
        } else if (stage.style.transform) {
          stage.style.transform = '';
          shakeMag = 0;
        }
      }
      drawParticles();
    }

    function drawParticles() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i += 1) {
        var part = particles[i];
        var alpha = Math.max(0, part.life / part.max);
        ctx.save();
        ctx.translate(part.x, part.y);
        ctx.rotate(part.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = part.color;
        if (part.shape === 'star') {
          starPath(ctx, part.size);
          ctx.fill();
        } else if (part.shape === 'confetti') {
          ctx.fillRect(-part.size * 0.7, -part.size * 0.35, part.size * 1.4, part.size * 0.7);
        } else {
          ctx.strokeStyle = part.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-part.size, 0);
          ctx.lineTo(part.size, part.size * 0.3);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    function burst(x, y, kind) {
      var shape = kind === 'confetti' || kind === 'star' ? kind : 'spark';
      var colors = shape === 'confetti'
        ? ['#e4b15a', '#f6efe4', '#7fd0d8', '#d4724b', '#8eae86', '#f2d48a']
        : ['#ffe7a3', '#e4b15a', '#fff6d8', '#7fd0d8', '#f6efe4'];
      for (var i = 0; i < 25; i += 1) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 90 + Math.random() * 240;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 70,
          g: 520,
          life: 0.5 + Math.random() * 0.4,
          max: 0.9,
          size: 3 + Math.random() * 4.5,
          color: colors[i % colors.length],
          shape: shape,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 10
        });
      }
      if (particles.length > 250) particles.splice(0, particles.length - 250);
    }

    function dockLimit() {
      var dock = document.querySelector('.dock');
      if (!dock) return window.innerHeight - 16;
      return dock.getBoundingClientRect().top - 36;
    }

    function floatText(x, y, text, tone) {
      if (!text) return;
      var node = document.createElement('div');
      node.className = 'float-text float-' + (tone || 'gold');
      node.textContent = text;
      floatLayer.appendChild(node);
      var drift = Math.random() * 70 - 35;
      var y0 = Math.min(y, dockLimit());
      floaters.push({
        node: node,
        age: 0,
        life: 0.95,
        x0: x,
        y0: y0,
        x1: x + drift * 0.3,
        y1: y0 - 28,
        x2: x + drift,
        y2: y0 - 62,
        x3: x + drift * 0.6,
        y3: y0 - 96
      });
      if (floaters.length > 16) {
        var old = floaters.shift();
        if (old.node.parentNode) old.node.parentNode.removeChild(old.node);
      }
    }

    function kick(index, mode) {
      var spring = springs[index];
      if (!spring) return;
      if (mode === 'merge') {
        spring.x = 1.42;
        spring.y = 0.62;
        spring.vx = 0;
        spring.vy = 0;
      } else if (mode === 'drag') {
        spring.x = 1.18;
        spring.y = 0.84;
      } else {
        spring.x = 0.42;
        spring.y = 1.38;
        spring.vx = 0;
        spring.vy = -2;
      }
    }

    function pose(index) {
      var spring = springs[index];
      if (!spring) return { x: 1, y: 1 };
      return { x: spring.x, y: spring.y };
    }

    function dragSpeed(speed) {
      var stretch = Math.min(0.28, speed / 28);
      ghost.x = 1 + stretch;
      ghost.y = 1 / (1 + stretch * 0.85);
    }

    function dragEnd() {
      ghost.x = 1.12;
      ghost.y = 0.9;
    }

    function ghostPose() {
      return { x: ghost.x, y: ghost.y };
    }

    function shake(power) {
      shakeMag = Math.max(shakeMag, power || 0);
    }

    function renderCodex() {
      codexTitle.textContent = i18n.t('monetize.codexTitle');
      codexClose.setAttribute('aria-label', i18n.t('monetize.codexClose'));
      codexScroll.textContent = '';
      var grid = document.createElement('div');
      grid.className = 'codex-grid';
      for (var level = 1; level <= 15; level += 1) {
        var info = codexInfo(level);
        var card = document.createElement('article');
        card.className = 'album-card' + (info.open ? '' : ' is-locked');
        var icon = document.createElement('canvas');
        icon.width = 128;
        icon.height = 128;
        if (info.open) art.paintItem(icon.getContext('2d'), level, 128, 0);
        else {
          var g = icon.getContext('2d');
          g.fillStyle = '#3a322b';
          g.fillRect(24, 28, 80, 72);
          g.strokeStyle = '#e4b15a';
          g.strokeRect(24, 28, 80, 72);
        }
        var name = document.createElement('strong');
        name.textContent = info.open ? info.name : i18n.t('album.locked');
        card.appendChild(icon);
        card.appendChild(name);
        if (info.open) {
          var reward = document.createElement('p');
          reward.textContent = info.reward > 0
            ? i18n.t('monetize.codexReward', { amount: String(info.reward) })
            : i18n.t('monetize.codexKept');
          card.appendChild(reward);
        }
        grid.appendChild(card);
      }
      codexScroll.appendChild(grid);
    }

    function openCodex() {
      renderCodex();
      codex.hidden = false;
      codexOpen = true;
      requestAnimationFrame(function () { codex.classList.add('is-open'); });
    }

    function closeCodex() {
      codex.classList.remove('is-open');
      codexOpen = false;
      setTimeout(function () {
        if (!codexOpen) codex.hidden = true;
      }, 300);
    }

    resize();
    window.addEventListener('resize', resize);

    return {
      step: step,
      burst: burst,
      floatText: floatText,
      kick: kick,
      pose: pose,
      dragSpeed: dragSpeed,
      dragEnd: dragEnd,
      ghostPose: ghostPose,
      shake: shake,
      openCodex: openCodex,
      closeCodex: closeCodex,
      refreshCodex: function () { if (codexOpen) renderCodex(); }
    };
  }

  window.AureliaJuice = { mount: mount };
})();
