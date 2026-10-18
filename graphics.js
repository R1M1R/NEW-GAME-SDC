(function () {
  'use strict';

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
  }

  function linear(ctx, x0, y0, x1, y1, stops) {
    var grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i += 1) grad.addColorStop(stops[i][0], stops[i][1]);
    return grad;
  }

  function radial(ctx, x, y, r0, r1, stops) {
    var grad = ctx.createRadialGradient(x, y, r0, x, y, r1);
    for (var i = 0; i < stops.length; i += 1) grad.addColorStop(stops[i][0], stops[i][1]);
    return grad;
  }

  function groundShadow(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(24, 14, 18, 0.2)';
    ellipse(ctx, 32, 57.4, 17, 4.2);
    ctx.fill();
    ctx.fillStyle = 'rgba(8, 6, 12, 0.22)';
    ellipse(ctx, 32, 56.6, 10, 2.4);
    ctx.fill();
    ctx.restore();
  }

  var NEON = [
    null,
    '#ffb703',
    '#4cc9f0',
    '#7df9ff',
    '#5dff9a',
    '#ff8fab',
    '#ffd166',
    '#c77dff',
    '#48cae4',
    '#f72585',
    '#d8f3ff',
    '#ff7b00',
    '#e8f4ff',
    '#48bfe3',
    '#00f5d4',
    '#ffe066'
  ];

  var HOT = { 3: 1, 8: 1, 9: 1, 11: 1, 13: 1, 14: 1, 15: 1 };
  var rawPool = {};
  var outPool = {};

  function poolCanvas(pool, size) {
    var canvas = pool[size];
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      pool[size] = canvas;
    }
    return canvas;
  }

  function paintTape(ctx) {
    groundShadow(ctx);
    ctx.fillStyle = linear(ctx, 8, 34, 40, 52, [[0, '#f3d98a'], [0.45, '#e2b34a'], [1, '#a87428']]);
    roundRect(ctx, 8, 30, 30, 18, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, 12, 33, 16, 4, 2);
    ctx.fill();
    ctx.strokeStyle = '#6d4a1c';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(14, 39);
    ctx.lineTo(32, 39);
    ctx.moveTo(14, 43);
    ctx.lineTo(28, 43);
    ctx.stroke();
    ctx.strokeStyle = '#f6efe4';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(36, 40);
    ctx.quadraticCurveTo(48, 28, 54, 18);
    ctx.stroke();
    ctx.fillStyle = '#d7d2c8';
    roundRect(ctx, 50, 12, 8, 8, 1);
    ctx.fill();
    ctx.save();
    ctx.translate(46, 22);
    ctx.rotate(-0.7);
    ctx.fillStyle = linear(ctx, 0, 0, 22, 4, [[0, '#f2a14a'], [0.7, '#e07a32'], [1, '#f6d7b0']]);
    roundRect(ctx, 0, 0, 22, 4, 1.5);
    ctx.fill();
    ctx.fillStyle = '#2b241c';
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(26, 2);
    ctx.lineTo(22, 4);
    ctx.fill();
    ctx.fillStyle = '#d85b73';
    ctx.fillRect(-2, 0, 3, 4);
    ctx.restore();
  }

  function paintRoller(ctx, time) {
    groundShadow(ctx);
    var drip = 2 + Math.sin(time * 3.2) * 1.4;
    ctx.strokeStyle = '#5c4636';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(18, 50);
    ctx.lineTo(18, 36);
    ctx.quadraticCurveTo(18, 24, 30, 22);
    ctx.stroke();
    ctx.fillStyle = '#6b5344';
    roundRect(ctx, 14, 48, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = linear(ctx, 28, 12, 58, 28, [[0, '#f4f7f8'], [0.35, '#d5dee6'], [1, '#8ea0b0']]);
    roundRect(ctx, 28, 12, 26, 16, 8);
    ctx.fill();
    ctx.fillStyle = linear(ctx, 30, 14, 50, 26, [[0, '#7eb8e8'], [0.5, '#3d7eae'], [1, '#245778']]);
    roundRect(ctx, 30, 15, 22, 10, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    roundRect(ctx, 34, 17, 8, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = '#3d7eae';
    ellipse(ctx, 40, 32 + drip, 2.2, 3.4 + drip * 0.3);
    ctx.fill();
  }

  function paintLamp(ctx, time) {
    var glow = 0.45 + Math.sin(time * 2.4) * 0.12;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, 34, 20, 1, 30, [[0, 'rgba(190, 245, 255, ' + (0.85 + glow * 0.2) + ')'], [0.45, 'rgba(80, 190, 255, 0.28)'], [1, 'rgba(80, 190, 255, 0)']]);
    ctx.beginPath();
    ctx.arc(34, 22, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    groundShadow(ctx);
    ctx.fillStyle = linear(ctx, 20, 50, 44, 56, [[0, '#d7dde4'], [1, '#8d98a6']]);
    ellipse(ctx, 32, 52, 14, 4);
    ctx.fill();
    ctx.strokeStyle = '#c5ced8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(32, 50);
    ctx.lineTo(32, 22);
    ctx.stroke();
    ctx.save();
    ctx.shadowColor = '#bff6ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = linear(ctx, 16, 10, 48, 28, [[0, '#ffffff'], [0.35, '#d7f4ff'], [1, '#6f90ac']]);
    roundRect(ctx, 16, 10, 32, 16, 6);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#e9f6ff';
    for (var i = 0; i < 5; i += 1) {
      var alpha = 0.45 + 0.4 * Math.abs(Math.sin(time * 3 + i));
      ctx.globalAlpha = alpha;
      ctx.fillRect(20 + i * 5, 15, 3, 6);
    }
    ctx.globalAlpha = 1;
  }

  function paintMonstera(ctx, time) {
    groundShadow(ctx);
    var sway = Math.sin(time * 1.6) * 2.2;
    ctx.fillStyle = linear(ctx, 20, 36, 44, 56, [[0, '#f4efe8'], [0.5, '#d7c3ae'], [1, '#a88870']]);
    ctx.beginPath();
    ctx.moveTo(20, 40);
    ctx.lineTo(24, 54);
    ctx.quadraticCurveTo(32, 58, 40, 54);
    ctx.lineTo(44, 40);
    ctx.quadraticCurveTo(32, 36, 20, 40);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, 24, 41, 8, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = '#1f7a45';
    function leaf(x, y, rot, s) {
      ctx.save();
      ctx.translate(x + sway * (y < 30 ? 1 : 0.4), y);
      ctx.rotate(rot + sway * 0.02);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(10, 4, 14, -8, 0, -16);
      ctx.bezierCurveTo(-14, -8, -10, 4, 0, 8);
      ctx.fill();
      ctx.fillStyle = '#174f30';
      ctx.fillRect(-1, -12, 2, 18);
      ctx.fillStyle = '#1f7a45';
      ctx.restore();
    }
    leaf(24, 30, -0.8, 1);
    leaf(40, 28, 0.7, 1.05);
    leaf(32, 20, 0.05, 1.15);
  }

  function paintBeanbag(ctx, time) {
    groundShadow(ctx);
    var squash = Math.sin(time * 1.8) * 1.2;
    ctx.fillStyle = linear(ctx, 10, 22, 54, 54, [[0, '#f2d2c4'], [0.45, '#d7927c'], [1, '#a85a52']]);
    ctx.beginPath();
    ctx.moveTo(12, 36 + squash);
    ctx.bezierCurveTo(8, 18, 22, 14, 32, 16);
    ctx.bezierCurveTo(46, 12, 58, 22, 54, 38);
    ctx.bezierCurveTo(52, 52, 40, 56, 32, 54);
    ctx.bezierCurveTo(18, 56, 10, 48, 12, 36 + squash);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 40, 36, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 34);
    ctx.quadraticCurveTo(32, 42, 48, 32);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ellipse(ctx, 26, 28, 7, 4);
    ctx.fill();
  }

  function paintTable(ctx) {
    groundShadow(ctx);
    ctx.strokeStyle = '#1c1a18';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(16, 48);
    ctx.lineTo(28, 32);
    ctx.moveTo(48, 48);
    ctx.lineTo(36, 32);
    ctx.moveTo(18, 40);
    ctx.lineTo(46, 40);
    ctx.stroke();
    ctx.fillStyle = linear(ctx, 8, 24, 56, 36, [[0, '#e7c49a'], [0.5, '#b98352'], [1, '#7a4e2c']]);
    roundRect(ctx, 8, 24, 48, 10, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, 12, 26, 18, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = '#f6efe4';
    ellipse(ctx, 40, 22, 5, 2.2);
    ctx.fill();
    ctx.fillStyle = '#6d8f9a';
    roundRect(ctx, 36, 16, 8, 5, 1);
    ctx.fill();
  }

  function paintSofa(ctx, time) {
    groundShadow(ctx);
    var sheen = 0.18 + Math.sin(time * 1.3) * 0.06;
    ctx.fillStyle = linear(ctx, 6, 20, 58, 52, [[0, '#8d3d55'], [0.5, '#6a2740'], [1, '#3d1828']]);
    roundRect(ctx, 6, 24, 52, 22, 8);
    ctx.fill();
    ctx.fillStyle = '#4a2032';
    roundRect(ctx, 4, 18, 10, 22, 4);
    ctx.fill();
    roundRect(ctx, 50, 18, 10, 22, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 220, 210, ' + sheen + ')';
    roundRect(ctx, 18, 28, 12, 8, 3);
    ctx.fill();
    roundRect(ctx, 34, 28, 12, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#2a1218';
    ctx.fillRect(12, 46, 6, 7);
    ctx.fillRect(46, 46, 6, 7);
  }

  function paintDesk(ctx, time) {
    groundShadow(ctx);
    ctx.fillStyle = '#6b5138';
    roundRect(ctx, 6, 36, 52, 8, 2);
    ctx.fill();
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(10, 44, 4, 10);
    ctx.fillRect(50, 44, 4, 10);
    function monitor(x, hue) {
      ctx.fillStyle = '#1b1e24';
      roundRect(ctx, x, 14, 22, 16, 2);
      ctx.fill();
      var shift = (time * 40 + hue) % 80;
      ctx.fillStyle = linear(ctx, x + 2, 16, x + 20, 28, [[0, '#16324a'], [0.5, '#3ec6c0'], [1, '#f2d48a']]);
      roundRect(ctx, x + 2, 16, 18, 12, 1);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 3 + (shift % 12), 18, 3, 8);
      ctx.fillStyle = '#2a3038';
      ctx.fillRect(x + 9, 30, 4, 6);
    }
    monitor(8, 0);
    monitor(34, 30);
    ctx.fillStyle = '#d9cbb8';
    roundRect(ctx, 22, 40, 20, 3, 1);
    ctx.fill();
  }

  function paintTheater(ctx, time) {
    groundShadow(ctx);
    var pulse = 0.45 + Math.sin(time * 1.7) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, 32, 26, 2, 34, [[0, 'rgba(180, 120, 255, ' + pulse + ')'], [0.5, 'rgba(255, 190, 90, 0.2)'], [1, 'rgba(120, 180, 255, 0)']]);
    ctx.beginPath();
    ctx.arc(32, 26, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#121418';
    roundRect(ctx, 6, 12, 52, 30, 3);
    ctx.fill();
    ctx.save();
    ctx.shadowColor = '#ff4fd8';
    ctx.shadowBlur = 8;
    ctx.fillStyle = linear(ctx, 8, 14, 56, 40, [
      [0, '#1a2744'],
      [0.35, '#7a3e78'],
      [0.7, '#e4b15a'],
      [1, '#16324a']
    ]);
    roundRect(ctx, 9, 15, 46, 24, 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(12 + (Math.sin(time * 1.2) * 8 + 8), 18, 10, 16);
    ctx.fillStyle = '#2a241c';
    roundRect(ctx, 16, 44, 32, 5, 2);
    ctx.fill();
    ctx.fillStyle = '#e4b15a';
    ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.2;
    ctx.fillRect(30, 46, 4, 2);
    ctx.globalAlpha = 1;
  }

  function paintIsland(ctx) {
    groundShadow(ctx);
    ctx.fillStyle = '#5c4634';
    roundRect(ctx, 8, 28, 48, 16, 3);
    ctx.fill();
    ctx.fillStyle = linear(ctx, 8, 18, 56, 32, [[0, '#f7f4ef'], [0.4, '#d9d3c8'], [0.7, '#b7b1a6'], [1, '#f4f1ea']]);
    roundRect(ctx, 6, 18, 52, 12, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 120, 120, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 22);
    ctx.quadraticCurveTo(28, 28, 40, 20);
    ctx.moveTo(22, 26);
    ctx.quadraticCurveTo(36, 18, 50, 26);
    ctx.stroke();
    ctx.fillStyle = '#3e6f86';
    ellipse(ctx, 16, 40, 5, 3);
    ctx.fill();
    ellipse(ctx, 48, 40, 5, 3);
    ctx.fill();
    ctx.fillStyle = '#d85b4a';
    ctx.beginPath();
    ctx.arc(30, 16, 3, 0, Math.PI * 2);
    ctx.arc(36, 15, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7dba4a';
    ctx.beginPath();
    ctx.arc(33, 13, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function paintFire(ctx, time) {
    groundShadow(ctx);
    ctx.fillStyle = '#1a1c20';
    roundRect(ctx, 6, 28, 52, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#2a241c';
    roundRect(ctx, 8, 26, 48, 6, 2);
    ctx.fill();
    var flames = [[16, 0.2], [26, 1.1], [32, 0.4], [40, 1.6], [48, 0.8]];
    for (var i = 0; i < flames.length; i += 1) {
      var h = 10 + Math.sin(time * 7 + flames[i][1] * 4) * 4;
      var x = flames[i][0];
      var grad = linear(ctx, x, 28, x, 28 - h, [[0, '#ffb703'], [0.5, '#fb8500'], [1, 'rgba(255, 80, 40, 0)']]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 3, 30);
      ctx.quadraticCurveTo(x, 28 - h, x + 3, 30);
      ctx.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, 32, 24, 1, 22, [[0, 'rgba(255, 170, 60, 0.7)'], [1, 'rgba(255, 80, 20, 0)']]);
    ctx.beginPath();
    ctx.arc(32, 24, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 170, 60, 0.28)';
    ellipse(ctx, 32, 40, 20, 6);
    ctx.fill();
  }

  function paintPiano(ctx) {
    groundShadow(ctx);
    ctx.fillStyle = linear(ctx, 8, 20, 40, 54, [[0, '#2a2e36'], [0.4, '#12141a'], [1, '#050608']]);
    ctx.beginPath();
    ctx.moveTo(10, 40);
    ctx.lineTo(18, 22);
    ctx.lineTo(46, 18);
    ctx.lineTo(54, 34);
    ctx.lineTo(48, 48);
    ctx.lineTo(14, 50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0c0e12';
    ctx.beginPath();
    ctx.moveTo(20, 24);
    ctx.lineTo(44, 21);
    ctx.lineTo(48, 30);
    ctx.lineTo(22, 33);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f6efe4';
    for (var i = 0; i < 8; i += 1) ctx.fillRect(22 + i * 3, 36, 2, 8);
    ctx.fillStyle = '#1a1c22';
    ctx.fillRect(23, 36, 1.2, 5);
    ctx.fillRect(29, 36, 1.2, 5);
    ctx.fillRect(35, 36, 1.2, 5);
    ctx.fillStyle = '#e4b15a';
    ctx.fillRect(30, 48, 3, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(16, 36);
    ctx.lineTo(28, 26);
    ctx.lineTo(30, 28);
    ctx.lineTo(18, 40);
    ctx.fill();
  }

  function paintJacuzzi(ctx, time) {
    groundShadow(ctx);
    ctx.fillStyle = '#6b5140';
    roundRect(ctx, 6, 44, 52, 8, 2);
    ctx.fill();
    ctx.fillStyle = linear(ctx, 10, 24, 54, 48, [[0, '#f4f1ea'], [1, '#c8c2b6']]);
    ellipse(ctx, 32, 34, 22, 14);
    ctx.fill();
    var water = linear(ctx, 14, 24, 50, 44, [[0, '#b7ecf4'], [0.5, '#3aa8c4'], [1, '#1d6d86']]);
    ctx.fillStyle = water;
    ellipse(ctx, 32, 33, 16, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 + Math.sin(time * 3) * 0.15) + ')';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(32, 32 + Math.sin(time * 2) * 0.6, 10, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(24, 30, 1.4, 0, Math.PI * 2);
    ctx.arc(34, 28 + Math.sin(time * 4), 1.8, 0, Math.PI * 2);
    ctx.arc(42, 33, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e4b15a';
    ctx.lineWidth = 1.5;
    ellipse(ctx, 32, 34, 22, 14);
    ctx.stroke();
  }

  function paintSmart(ctx, time) {
    groundShadow(ctx);
    ctx.fillStyle = linear(ctx, 10, 12, 54, 52, [[0, '#1c2830'], [1, '#10161c']]);
    roundRect(ctx, 10, 12, 44, 40, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(127, 208, 216, 0.7)';
    ctx.lineWidth = 1.3;
    var nodes = [[20, 24], [32, 18], [46, 26], [24, 38], [40, 40], [32, 30]];
    ctx.beginPath();
    ctx.moveTo(nodes[0][0], nodes[0][1]);
    ctx.lineTo(nodes[1][0], nodes[1][1]);
    ctx.lineTo(nodes[2][0], nodes[2][1]);
    ctx.moveTo(nodes[1][0], nodes[1][1]);
    ctx.lineTo(nodes[5][0], nodes[5][1]);
    ctx.lineTo(nodes[3][0], nodes[3][1]);
    ctx.moveTo(nodes[5][0], nodes[5][1]);
    ctx.lineTo(nodes[4][0], nodes[4][1]);
    ctx.stroke();
    for (var i = 0; i < nodes.length; i += 1) {
      var pulse = 0.55 + 0.45 * Math.abs(Math.sin(time * 2.5 + i));
      ctx.save();
      ctx.shadowColor = '#7dfff2';
      ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(210, 255, 250, ' + pulse + ')';
      ctx.beginPath();
      ctx.arc(nodes[i][0], nodes[i][1], 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#e4b15a';
    ctx.strokeRect(28, 34, 8, 6);
    ctx.beginPath();
    ctx.moveTo(28, 34);
    ctx.lineTo(32, 31);
    ctx.lineTo(36, 34);
    ctx.stroke();
  }

  function paintKey(ctx, time) {
    var glow = 0.55 + Math.sin(time * 2.2) * 0.2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, 28, 28, 1, 30, [[0, 'rgba(255, 230, 140, ' + glow + ')'], [0.5, 'rgba(255, 170, 40, 0.22)'], [1, 'rgba(255, 170, 40, 0)']]);
    ctx.beginPath();
    ctx.arc(30, 30, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    groundShadow(ctx);
    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate(-0.5 + Math.sin(time * 0.8) * 0.04);
    ctx.shadowColor = '#ffe08a';
    ctx.shadowBlur = 8;
    ctx.fillStyle = linear(ctx, -16, -10, 20, 10, [[0, '#fff6d2'], [0.4, '#f0c56a'], [1, '#8a5a22']]);
    ctx.beginPath();
    ctx.arc(-8, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#2a2118';
    ctx.beginPath();
    ctx.arc(-8, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = linear(ctx, 0, -3, 22, 3, [[0, '#f8e7b0'], [1, '#b8863b']]);
    roundRect(ctx, -2, -2.2, 24, 4.4, 1.5);
    ctx.fill();
    ctx.fillRect(12, -2.2, 3, 7);
    ctx.fillRect(17, -2.2, 3, 5);
    ctx.fillStyle = '#7fd0d8';
    ctx.beginPath();
    ctx.arc(-8, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (var i = 0; i < 4; i += 1) {
      var ang = time * 1.6 + i * 1.57;
      ctx.fillStyle = 'rgba(255, 244, 210, ' + (0.35 + 0.45 * Math.abs(Math.sin(time * 3 + i))) + ')';
      ctx.beginPath();
      ctx.arc(32 + Math.cos(ang) * 18, 30 + Math.sin(ang * 1.2) * 12, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var PAINTERS = [
    null,
    paintTape,
    paintRoller,
    paintLamp,
    paintMonstera,
    paintBeanbag,
    paintTable,
    paintSofa,
    paintDesk,
    paintTheater,
    paintIsland,
    paintFire,
    paintPiano,
    paintJacuzzi,
    paintSmart,
    paintKey
  ];

  function renderSprite(level, size, time) {
    var safe = Math.max(1, Math.min(15, level | 0));
    var s = Math.max(1, Math.round(size));
    var t = time || 0;
    var raw = poolCanvas(rawPool, s);
    var out = poolCanvas(outPool, s);
    var rctx = raw.getContext('2d');
    rctx.setTransform(1, 0, 0, 1, 0, 0);
    rctx.clearRect(0, 0, s, s);
    rctx.save();
    var breathe = 1 + Math.sin(t * 2.05 + safe * 0.7) * 0.028;
    var sway = Math.sin(t * 1.25 + safe) * 0.05;
    rctx.translate(s / 2, s * 0.54);
    rctx.rotate(sway * 0.12);
    rctx.scale(breathe, 2 - breathe);
    rctx.scale(s / 64, s / 64);
    rctx.translate(-32, -34);
    var painter = PAINTERS[safe];
    if (painter) painter(rctx, t);
    rctx.restore();

    var neon = NEON[safe];
    var hot = HOT[safe] ? 1 : 0;
    var octx = out.getContext('2d');
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, s, s);
    octx.save();
    octx.shadowColor = neon;
    octx.shadowBlur = s * (hot ? 0.18 : 0.08);
    octx.globalAlpha = hot ? 0.85 : 0.45;
    octx.drawImage(raw, 0, s * 0.01);
    octx.restore();
    octx.drawImage(raw, 0, 0);
    octx.save();
    octx.globalCompositeOperation = 'source-atop';
    octx.globalAlpha = 0.22;
    octx.drawImage(raw, -s * 0.01, -s * 0.016);
    var volume = octx.createLinearGradient(0, s * 0.05, s * 0.15, s * 0.92);
    volume.addColorStop(0, 'rgba(255,255,255,0.55)');
    volume.addColorStop(0.28, 'rgba(255,255,255,0.08)');
    volume.addColorStop(0.62, 'rgba(0,0,0,0)');
    volume.addColorStop(1, 'rgba(0,0,0,0.16)');
    octx.globalAlpha = 1;
    octx.fillStyle = volume;
    octx.fillRect(0, 0, s, s);
    octx.restore();
    octx.save();
    octx.globalCompositeOperation = 'destination-over';
    octx.globalAlpha = hot ? 0.55 : 0.28;
    octx.fillStyle = neon;
    octx.beginPath();
    octx.ellipse(s * 0.5, s * 0.86, s * 0.24, s * 0.045, 0, 0, Math.PI * 2);
    octx.fill();
    octx.restore();
    return out;
  }

  function paintItem(ctx, level, size, time) {
    var sprite = renderSprite(level, size, time);
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(sprite, 0, 0, size, size);
  }

  function visualTier(maxLevel, rentLevel) {
    var score = (maxLevel || 0) + Math.min(3, Math.floor((rentLevel || 0) / 4));
    if (score >= 15) return 6;
    if (score >= 12) return 5;
    if (score >= 9) return 4;
    if (score >= 6) return 3;
    if (score >= 4) return 2;
    if (score >= 2) return 1;
    return 0;
  }

  function quad(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  function mixHex(a, b, t) {
    var u = Math.max(0, Math.min(1, t));
    function ch(hex, i) { return parseInt(hex.substr(1 + i * 2, 2), 16); }
    function hex2(n) {
      var s = Math.round(n).toString(16);
      return s.length < 2 ? '0' + s : s;
    }
    var r = ch(a, 0) + (ch(b, 0) - ch(a, 0)) * u;
    var g = ch(a, 1) + (ch(b, 1) - ch(a, 1)) * u;
    var bl = ch(a, 2) + (ch(b, 2) - ch(a, 2)) * u;
    return '#' + hex2(r) + hex2(g) + hex2(bl);
  }

  function skyPhase(time) {
    var p = ((time || 0) % 42) / 42;
    var keys = [
      { at: 0, top: '#8ec8f0', bot: '#fff4d2', night: 0, sun: 0.72 },
      { at: 0.28, top: '#7eb6ea', bot: '#ffe7b0', night: 0, sun: 0.62 },
      { at: 0.4, top: '#ff8f73', bot: '#ffd0a0', night: 0.25, sun: 0.42 },
      { at: 0.5, top: '#3a2a55', bot: '#e07a62', night: 0.72, sun: 0.18 },
      { at: 0.62, top: '#0c1428', bot: '#1d3558', night: 1, sun: 0 },
      { at: 0.86, top: '#101828', bot: '#24385c', night: 0.92, sun: 0.04 },
      { at: 1, top: '#8ec8f0', bot: '#fff4d2', night: 0, sun: 0.72 }
    ];
    var i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].at) i += 1;
    var a = keys[i];
    var b = keys[i + 1];
    var t = (p - a.at) / Math.max(0.001, b.at - a.at);
    return {
      top: mixHex(a.top, b.top, t),
      bot: mixHex(a.bot, b.bot, t),
      night: a.night + (b.night - a.night) * t,
      sun: a.sun + (b.sun - a.sun) * t
    };
  }

  function zoneStyle(model, id) {
    var zone = model && model.zones && model.zones[id];
    if (!zone) return 0;
    return zone.style | 0;
  }

  function roomShell(w, h) {
    var x0 = w * 0.16;
    var x1 = w * 0.84;
    var y0 = h * 0.2;
    var y1 = h * 0.7;
    return {
      x0: x0, x1: x1, y0: y0, y1: y1,
      ceiling: [[0, 0], [w, 0], [x1, y0], [x0, y0]],
      left: [[0, 0], [x0, y0], [x0, y1], [0, h]],
      right: [[w, 0], [x1, y0], [x1, y1], [w, h]],
      back: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]],
      floor: [[x0, y1], [x1, y1], [w, h], [0, h]]
    };
  }

  function paintSky(ctx, x, y, w, h, sky, time) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = linear(ctx, x, y, x, y + h, [[0, sky.top], [1, sky.bot]]);
    ctx.fillRect(x, y, w, h);
    if (sky.sun > 0.05) {
      ctx.fillStyle = 'rgba(255, 244, 210, ' + sky.sun + ')';
      ctx.beginPath();
      ctx.arc(x + w * 0.72, y + h * (0.28 + (1 - sky.sun) * 0.35), Math.max(8, w * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
    if (sky.night < 0.55) {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      for (var c = 0; c < 4; c += 1) {
        var cx = x + ((time * 18 + c * 90) % (w + 80)) - 40;
        var cy = y + h * (0.18 + (c % 3) * 0.12);
        ellipse(ctx, cx, cy, 18 + c * 4, 8);
        ctx.fill();
      }
    }
    if (sky.night > 0.35) {
      ctx.globalAlpha = Math.min(1, (sky.night - 0.35) / 0.4);
      ctx.fillStyle = '#f6f3ea';
      for (var s = 0; s < 18; s += 1) {
        var sx = x + ((s * 47) % Math.max(8, w - 6));
        var sy = y + ((s * 29) % Math.max(8, h * 0.55));
        ctx.fillRect(sx, sy, s % 4 === 0 ? 2 : 1.2, s % 4 === 0 ? 2 : 1.2);
      }
      ctx.globalAlpha = 1;
    }
    var base = y + h * 0.78;
    var cursor = x - 6;
    var widths = [0.14, 0.1, 0.18, 0.12, 0.16, 0.11, 0.15];
    var heights = [0.34, 0.5, 0.28, 0.62, 0.4, 0.48, 0.32];
    for (var i = 0; i < widths.length; i += 1) {
      var bw = w * widths[i];
      var bh = h * heights[i];
      ctx.fillStyle = sky.night > 0.5 ? '#121a28' : 'rgba(70, 86, 102, 0.55)';
      ctx.fillRect(cursor, base - bh, bw - 2, bh);
      if (sky.night > 0.4) {
        ctx.globalAlpha = sky.night;
        for (var wy = base - bh + 6; wy < base - 8; wy += 9) {
          for (var wx = cursor + 4; wx < cursor + bw - 8; wx += 8) {
            if (((i * 3 + wx + wy) | 0) % 4 === 0) continue;
            var flick = 0.35 + 0.65 * Math.abs(Math.sin(time * 2 + wx * 0.04 + wy));
            ctx.fillStyle = 'rgba(255, 214, 140, ' + flick + ')';
            ctx.fillRect(wx, wy, 2.2, 2.2);
          }
        }
        ctx.globalAlpha = 1;
      }
      cursor += bw;
    }
    ctx.restore();
  }

  function paintFloorPlane(ctx, shell, style, tier) {
    var marble = style === 3 || (style === 0 && tier >= 6);
    var loft = style === 2 || (style === 0 && tier === 0);
    ctx.save();
    quad(ctx, shell.floor);
    ctx.clip();
    if (marble) {
      ctx.fillStyle = linear(ctx, 0, shell.y1, 0, shell.y1 + 80, [[0, '#f4efe8'], [1, '#c9c2b6']]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      for (var i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.moveTo(shell.x0 + i * 28, shell.y1);
        ctx.lineTo(i * 46, 2000);
        ctx.stroke();
      }
    } else if (loft) {
      ctx.fillStyle = linear(ctx, 0, shell.y1, 0, 2000, [[0, '#6a625c'], [1, '#3e3834']]);
      ctx.fill();
    } else {
      ctx.fillStyle = style === 1 ? '#e7d3b0' : '#c9955c';
      ctx.fill();
      ctx.strokeStyle = style === 1 ? 'rgba(120, 84, 48, 0.35)' : 'rgba(90, 52, 24, 0.4)';
      ctx.lineWidth = 1.2;
      for (var row = 0; row < 14; row += 1) {
        var y = shell.y1 + row * 10;
        var spread = row * 8;
        ctx.beginPath();
        ctx.moveTo(shell.x0 - spread, y);
        ctx.lineTo(shell.x1 + spread, y);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.strokeStyle = tier >= 5 ? '#e4b15a' : 'rgba(246, 239, 228, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, shell.floor[3][1] - 2);
    ctx.lineTo(shell.x0, shell.y1);
    ctx.lineTo(shell.x1, shell.y1);
    ctx.lineTo(shell.floor[2][0], shell.floor[2][1] - 2);
    ctx.stroke();
  }

  function drawRug(ctx, shell, style) {
    var y = shell.y1 + (shell.floor[3][1] - shell.y1) * 0.18;
    var h = (shell.floor[3][1] - shell.y1) * 0.62;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ellipse(ctx, shell.x0 + (shell.x1 - shell.x0) * 0.5 + 8, y + h * 0.72, (shell.x1 - shell.x0) * 0.34, h * 0.16);
    ctx.fill();
    var color = style === 3 ? '#6e2144' : style === 2 ? '#5a4034' : style === 1 ? '#d7c4a4' : '#8d3d4a';
    ctx.fillStyle = color;
    roundRect(ctx, shell.x0 + 18, y, shell.x1 - shell.x0 - 36, h, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 3;
    roundRect(ctx, shell.x0 + 26, y + 6, shell.x1 - shell.x0 - 52, h - 12, 14);
    ctx.stroke();
  }

  function drawSofa(ctx, shell, style, time) {
    var x = shell.x0 + 28;
    var y = shell.y1 - shell.y0 * 0.02;
    var w = (shell.x1 - shell.x0) * 0.46;
    var h = (shell.floor[3][1] - shell.y1) * 0.55;
    var cloth = style === 3 ? '#6e2148' : style === 2 ? '#5c4038' : style === 1 ? '#f2e4d6' : '#7a3048';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ellipse(ctx, x + w * 0.5, y + h * 0.92, w * 0.42, 8);
    ctx.fill();
    ctx.fillStyle = cloth;
    roundRect(ctx, x, y, w, h * 0.72, 16);
    ctx.fill();
    ctx.fillStyle = style === 1 ? '#fff8f2' : 'rgba(255,255,255,0.16)';
    roundRect(ctx, x + 8, y + 8, w * 0.28, h * 0.36, 8);
    ctx.fill();
    roundRect(ctx, x + w * 0.62, y + 10, w * 0.26, h * 0.34, 8);
    ctx.fill();
    var bob = Math.sin(time * 1.6) * 1.2;
    ctx.fillStyle = style === 3 ? '#f0d7a2' : '#efe8e2';
    ellipse(ctx, x + w * 0.56, y + h * 0.5 + bob, w * 0.16, h * 0.18);
    ctx.fill();
    ellipse(ctx, x + w * 0.72, y + h * 0.52, w * 0.07, h * 0.08);
    ctx.fill();
    ctx.fillStyle = '#2a2422';
    ellipse(ctx, x + w * 0.52, y + h * 0.46 + bob, 2.2, 1.6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px sans-serif';
    ctx.fillText('z', x + w * 0.78, y + h * 0.2 + Math.sin(time * 3) * 2);
  }

  function drawCoffee(ctx, shell) {
    var cx = (shell.x0 + shell.x1) * 0.62;
    var y = shell.y1 + 18;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ellipse(ctx, cx, y + 28, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#8a5a32';
    ctx.fillRect(cx - 4, y + 8, 8, 18);
    ctx.fillStyle = linear(ctx, cx - 36, y, cx + 36, y + 16, [[0, '#f3e0c4'], [1, '#a87440']]);
    roundRect(ctx, cx - 36, y, 72, 14, 6);
    ctx.fill();
  }

  function drawPlant(ctx, shell, time) {
    var x = shell.x1 - 8;
    var y = shell.y1 + 6;
    var sway = Math.sin(time * 1.4) * 3;
    ctx.fillStyle = '#d7c3ae';
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 8);
    ctx.lineTo(x - 8, y + 36);
    ctx.lineTo(x + 10, y + 34);
    ctx.lineTo(x + 4, y + 6);
    ctx.fill();
    ctx.fillStyle = '#1f7a45';
    function leaf(dx, dy, rot) {
      ctx.save();
      ctx.translate(x + dx + sway, y + dy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(16, 4, 18, -18, 0, -28);
      ctx.bezierCurveTo(-18, -18, -16, 4, 0, 10);
      ctx.fill();
      ctx.restore();
    }
    leaf(-20, -6, -0.5);
    leaf(6, -10, 0.4);
    leaf(-6, -24, 0.05);
  }

  function drawTorch(ctx, shell, style, time) {
    var x = shell.x0 + 36;
    var y = shell.y1 - 8;
    ctx.strokeStyle = '#d5dde6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 46);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = '#e8eef4';
    ellipse(ctx, x, y + 48, 16, 5);
    ctx.fill();
    var glow = style === 3 ? '120, 245, 230' : style === 2 ? '255, 150, 70' : '255, 214, 150';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, x, y - 6, 2, 42, [[0, 'rgba(' + glow + ',0.55)'], [1, 'rgba(' + glow + ',0)']]);
    ctx.beginPath();
    ctx.arc(x, y - 4, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#f7fbff';
    roundRect(ctx, x - 16, y - 18, 32, 16, 6);
    ctx.fill();
    var pulse = 0.45 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = 'rgba(' + glow + ',' + pulse + ')';
    ctx.fillRect(x - 10, y - 14, 20, 8);
  }

  function drawChandelier(ctx, shell, style, time) {
    var cx = (shell.x0 + shell.x1) / 2;
    var y = shell.y0 + 8;
    ctx.strokeStyle = style === 3 ? '#e4b15a' : '#d9cbb8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, shell.y0 - 10);
    ctx.lineTo(cx, y + 16);
    ctx.stroke();
    var glow = style === 3 ? '255, 210, 120' : '255, 226, 170';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, cx, y + 20, 4, 54, [[0, 'rgba(' + glow + ',0.42)'], [1, 'rgba(' + glow + ',0)']]);
    ctx.beginPath();
    ctx.arc(cx, y + 18, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = style === 3 ? '#f0d7a2' : '#f6efe4';
    for (var i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(cx + i * 16, y + 18 + Math.sin(time * 2 + i) * 1.2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFrames(ctx, shell, count) {
    var frames = [
      [shell.x0 + 16, shell.y0 + 18, 46, 34],
      [shell.x1 - 70, shell.y0 + 24, 40, 30]
    ];
    for (var i = 0; i < Math.min(count, frames.length); i += 1) {
      var f = frames[i];
      ctx.fillStyle = '#f6efe4';
      ctx.fillRect(f[0] - 3, f[1] - 3, f[2] + 6, f[3] + 6);
      ctx.fillStyle = i === 0 ? '#7eb6d8' : '#d4724b';
      ctx.fillRect(f[0], f[1], f[2], f[3]);
      ctx.strokeStyle = '#e4b15a';
      ctx.lineWidth = 2;
      ctx.strokeRect(f[0] - 3, f[1] - 3, f[2] + 6, f[3] + 6);
    }
  }

  function drawWorkstation(ctx, shell, style, time) {
    var x = shell.x1 - 78;
    var y = shell.y1 + 4;
    ctx.fillStyle = style === 2 ? '#2a241c' : '#d9cbb8';
    roundRect(ctx, x, y + 22, 70, 10, 3);
    ctx.fill();
    ctx.fillStyle = '#121418';
    roundRect(ctx, x + 8, y, 24, 20, 2);
    ctx.fill();
    roundRect(ctx, x + 36, y + 2, 22, 18, 2);
    ctx.fill();
    var shift = (time * 30) % 16;
    ctx.fillStyle = style === 3 ? '#3dfff0' : '#49b6e8';
    ctx.fillRect(x + 10 + (shift % 10), y + 4, 8, 12);
    ctx.fillStyle = '#e4b15a';
    ctx.fillRect(x + 40, y + 6, 12, 8);
  }

  function paintRoom(ctx, w, h, model, time) {
    if (w < 2 || h < 2) return;
    var maxLevel = model && model.maxLevel ? model.maxLevel : 0;
    var rentLevel = model && model.rentLevel ? model.rentLevel : 0;
    var tier = visualTier(maxLevel, rentLevel);
    var t = time || 0;
    var sky = skyPhase(t);
    var shell = roomShell(w, h);
    var floorStyle = zoneStyle(model, 'floor');
    var softStyle = zoneStyle(model, 'soft');
    var lightStyle = zoneStyle(model, 'light');
    var techStyle = zoneStyle(model, 'tech');
    var wall = tier === 0 ? '#8a837c' : tier >= 5 ? '#efe6da' : '#f7f1e8';
    if (floorStyle === 2) wall = '#c4b2a4';
    if (floorStyle === 3) wall = '#1c2430';
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = linear(ctx, 0, 0, 0, h, [[0, mixHex(wall, '#ffffff', 0.15)], [1, wall]]);
    ctx.fillRect(0, 0, w, h);
    quad(ctx, shell.ceiling);
    ctx.fillStyle = linear(ctx, 0, 0, 0, shell.y0, [[0, mixHex(wall, '#ffffff', 0.28)], [1, wall]]);
    ctx.fill();
    quad(ctx, shell.left);
    ctx.fillStyle = mixHex(wall, '#000000', 0.08);
    ctx.fill();
    quad(ctx, shell.right);
    ctx.fillStyle = mixHex(wall, '#000000', 0.16);
    ctx.fill();
    quad(ctx, shell.back);
    ctx.fillStyle = wall;
    ctx.fill();
    var win = {
      x: shell.x0 + (shell.x1 - shell.x0) * 0.18,
      y: shell.y0 + 12,
      w: (shell.x1 - shell.x0) * 0.64,
      h: (shell.y1 - shell.y0) * 0.62
    };
    paintSky(ctx, win.x, win.y, win.w, win.h, sky, t);
    ctx.strokeStyle = zoneStyle(model, 'window') === 3 ? '#e4b15a' : zoneStyle(model, 'window') === 2 ? '#1c1a18' : '#f6efe4';
    ctx.lineWidth = Math.max(4, w * 0.012);
    ctx.strokeRect(win.x, win.y, win.w, win.h);
    ctx.beginPath();
    ctx.moveTo(win.x + win.w / 2, win.y);
    ctx.lineTo(win.x + win.w / 2, win.y + win.h);
    ctx.moveTo(win.x, win.y + win.h * 0.46);
    ctx.lineTo(win.x + win.w, win.y + win.h * 0.46);
    ctx.stroke();
    paintFloorPlane(ctx, shell, floorStyle, tier);
    if (maxLevel >= 2) drawRug(ctx, shell, floorStyle);
    if (maxLevel >= 2) drawFrames(ctx, shell, maxLevel >= 6 ? 2 : 1);
    if (maxLevel >= 2) drawSofa(ctx, shell, softStyle, t);
    if (maxLevel >= 4) drawCoffee(ctx, shell);
    if (maxLevel >= 2) drawPlant(ctx, shell, t);
    if (maxLevel >= 2) drawTorch(ctx, shell, lightStyle, t);
    if (maxLevel >= 2) drawChandelier(ctx, shell, lightStyle || (tier >= 5 ? 3 : 1), t);
    if (maxLevel >= 8) drawWorkstation(ctx, shell, techStyle, t);
    if (tier === 0) {
      ctx.strokeStyle = 'rgba(40, 32, 28, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.16);
      ctx.lineTo(w * 0.12, h * 0.32);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 236, 210, ' + (0.05 + (1 - sky.night) * 0.08) + ')';
    ctx.fillRect(0, 0, w, h);
  }

  function catRect(w, h, maxLevel) {
    if ((maxLevel || 0) < 2) return null;
    var shell = roomShell(w, h);
    var sofaW = (shell.x1 - shell.x0) * 0.46;
    var x = shell.x0 + 28 + sofaW * 0.5;
    var y = shell.y1 - shell.y0 * 0.02;
    var sofaH = (h - shell.y1) * 0.55;
    return { x: x, y: y + sofaH * 0.36, w: sofaW * 0.28, h: sofaH * 0.28 };
  }

  function rarityColors(level) {
    if (level >= 13) return ['#5a3d12', '#e4b15a', '#fff6d4'];
    if (level >= 10) return ['#3a2468', '#b388ff', '#f3e8ff'];
    if (level >= 7) return ['#16345c', '#4c9bff', '#e5f1ff'];
    if (level >= 4) return ['#114233', '#3dcaa0', '#e7fff6'];
    return ['#3a3834', '#9a958c', '#f4f1ea'];
  }

  function paintToken(ctx, level, w, h, time) {
    var safe = Math.max(1, Math.min(15, level | 0));
    var colors = rarityColors(safe);
    var pad = Math.min(w, h) * 0.05;
    var radius = Math.min(w, h) * 0.18;
    roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, radius);
    ctx.fillStyle = linear(ctx, pad, pad, w, h, [[0, colors[2]], [0.45, colors[1]], [1, colors[0]]]);
    ctx.fill();
    ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.045);
    ctx.strokeStyle = colors[1];
    ctx.stroke();
    ctx.save();
    roundRect(ctx, pad, pad, w - pad * 2, h * 0.42, radius);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(pad, pad, w, h * 0.28);
    ctx.restore();
    var size = Math.round(Math.min(w, h) * 0.8);
    var sprite = renderSprite(safe, size, time || 0);
    ctx.drawImage(sprite, (w - size) / 2, (h - size) / 2, size, size);
  }

  window.AureliaArt = {
    ITEM_COUNT: 15,
    paintItem: paintItem,
    paintToken: paintToken,
    paintRoom: paintRoom,
    visualTier: visualTier,
    catRect: catRect
  };
})();
