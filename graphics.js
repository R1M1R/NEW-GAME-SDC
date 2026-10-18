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

  var ROOM_LOOKS = [
    { wall: ['#8e877f', '#5e5852'], floor: '#6a4e3a', plank: '#4e3828', sky: ['#8aa0ad', '#d5e0e6'], frame: '#5c5148', win: [0.33, 0.1, 0.34, 0.28], floorY: 0.66, crack: true, concrete: true },
    { wall: ['#efe6d8', '#d9cbb8'], floor: '#e0c194', plank: '#c49a62', sky: ['#8eb7d8', '#f3ddb0'], frame: '#f6efe4', win: [0.28, 0.08, 0.44, 0.34], floorY: 0.64 },
    { wall: ['#f0d2ae', '#e2b488'], floor: '#c98a52', plank: '#a86e38', sky: ['#7eafd4', '#ffd59a'], frame: '#f6e2c4', win: [0.24, 0.08, 0.5, 0.36], floorY: 0.63, rug: '#9a4038' },
    { wall: ['#ead4be', '#d2b497'], floor: '#b98356', plank: '#8d623c', sky: ['#89b4d2', '#f6d7a8'], frame: '#f3e6d2', win: [0.18, 0.07, 0.58, 0.38], floorY: 0.62, rug: '#6e3144', curtain: '#c4564a' },
    { wall: ['#d9c2aa', '#b99678'], floor: '#8a5538', plank: '#643c28', sky: ['#6a9cbc', '#f0c48a'], frame: '#f0d7a2', win: [0.08, 0.08, 0.46, 0.34], floorY: 0.62, brick: true, curtain: '#6e8f86' },
    { wall: ['#e7d3c0', '#c9ae92'], floor: '#d2ae78', plank: '#b08a52', sky: ['#24344a', '#c98a62'], frame: '#f6efe4', win: [0.12, 0.06, 0.58, 0.4], floorY: 0.6, night: true, curtain: '#8a5a6a' },
    { wall: ['#14343c', '#0c2228'], floor: '#d9d3c7', sky: ['#07141c', '#1b4a58'], frame: '#f0d7a2', win: [0.06, 0.04, 0.88, 0.52], floorY: 0.58, night: true, marble: true }
  ];

  function decorFor(maxLevel) {
    var list = [];
    if (maxLevel >= 4) list.push({ level: 4, x: 0.06, foot: 0.93, s: 0.32 });
    if (maxLevel >= 7) list.push({ level: 7, x: 0.22, foot: 0.9, s: 0.4 });
    if (maxLevel >= 3) list.push({ level: 3, x: 0.74, foot: 0.9, s: 0.34 });
    if (maxLevel >= 12 && maxLevel < 15) list.push({ level: 12, x: 0.02, foot: 0.92, s: 0.36 });
    if (maxLevel >= 13) list.push({ level: 13, x: 0.6, foot: 0.97, s: 0.34 });
    if (maxLevel >= 11 && maxLevel < 14) list.push({ level: 11, x: 0.34, foot: 0.95, s: 0.36 });
    if (maxLevel >= 15) list.push({ level: 15, x: 0.4, foot: 0.78, s: 0.26 });
    var hero = Math.max(1, maxLevel);
    var crowded = false;
    for (var i = 0; i < list.length; i += 1) if (list[i].level === hero) crowded = true;
    if (!crowded) list.push({ level: hero, x: hero >= 8 ? 0.4 : 0.12, foot: 0.94, s: hero >= 9 ? 0.42 : 0.36 });
    return list;
  }

  function paintCracks(ctx, w, h) {
    ctx.strokeStyle = 'rgba(40, 32, 28, 0.38)';
    ctx.lineWidth = Math.max(1.5, w * 0.004);
    ctx.beginPath();
    ctx.moveTo(w * 0.16, h * 0.12);
    ctx.lineTo(w * 0.2, h * 0.24);
    ctx.lineTo(w * 0.14, h * 0.34);
    ctx.moveTo(w * 0.78, h * 0.16);
    ctx.lineTo(w * 0.74, h * 0.28);
    ctx.stroke();
  }

  function paintSkyline(ctx, x, y, w, h, time, night) {
    var base = y + h * 0.74;
    var widths = [0.12, 0.16, 0.1, 0.18, 0.13, 0.15];
    var heights = [0.26, 0.48, 0.2, 0.6, 0.34, 0.42];
    var cursor = x + w * 0.03;
    for (var i = 0; i < widths.length; i += 1) {
      var bw = w * widths[i];
      var bh = h * heights[i];
      ctx.fillStyle = night ? '#10242c' : 'rgba(64, 78, 90, 0.4)';
      ctx.fillRect(cursor, base - bh, Math.max(2, bw - 2), bh);
      if (night) {
        for (var wy = base - bh + 6; wy < base - 6; wy += 8) {
          for (var wx = cursor + 3; wx < cursor + bw - 6; wx += 7) {
            if (((i + wx + wy) | 0) % 3 === 0) continue;
            var flicker = 0.35 + 0.65 * Math.abs(Math.sin(time * 2.2 + wx * 0.05 + wy));
            ctx.fillStyle = 'rgba(244, 214, 140, ' + flicker + ')';
            ctx.fillRect(wx, wy, 2, 2);
          }
        }
      }
      cursor += bw;
    }
  }

  function paintWindow(ctx, x, y, w, h, look, tier, time) {
    ctx.fillStyle = linear(ctx, x, y, x, y + h, [[0, look.sky[0]], [1, look.sky[1]]]);
    ctx.fillRect(x, y, w, h);
    if (!look.night) {
      ctx.fillStyle = radial(ctx, x + w * 0.72, y + h * 0.28, 2, w * 0.32, [[0, 'rgba(255,244,210,0.95)'], [1, 'rgba(255,244,210,0)']]);
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = '#f6efe4';
      ctx.beginPath();
      ctx.arc(x + w * 0.8, y + h * 0.2, Math.max(3, w * 0.03), 0, Math.PI * 2);
      ctx.fill();
    }
    if (tier >= 4) paintSkyline(ctx, x, y, w, h, time, !!look.night);
    ctx.strokeStyle = look.frame;
    ctx.lineWidth = Math.max(3, w * 0.03);
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h * 0.46);
    ctx.lineTo(x + w, y + h * 0.46);
    ctx.stroke();
    if (look.curtain) {
      ctx.fillStyle = look.curtain;
      ctx.globalAlpha = 0.92;
      ctx.fillRect(x - w * 0.04, y, w * 0.12, h * 0.92);
      ctx.fillRect(x + w * 0.92, y, w * 0.12, h * 0.92);
      ctx.globalAlpha = 1;
    }
  }

  function paintFloor(ctx, w, h, y, look) {
    if (look.marble) {
      ctx.fillStyle = linear(ctx, 0, y, w, h, [[0, '#efeae2'], [1, '#c9c3b8']]);
      ctx.fillRect(0, y, w, h - y);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      var size = Math.max(16, w * 0.07);
      for (var yy = y; yy < h; yy += size) {
        for (var xx = 0; xx < w; xx += size) ctx.strokeRect(xx, yy, size, size);
      }
      return;
    }
    if (look.concrete) {
      ctx.fillStyle = linear(ctx, 0, y, 0, h, [[0, '#7a6a5c'], [1, '#4e4036']]);
      ctx.fillRect(0, y, w, h - y);
      ctx.strokeStyle = 'rgba(30, 24, 20, 0.25)';
      ctx.strokeRect(w * 0.08, y + 8, w * 0.35, (h - y) * 0.45);
      return;
    }
    ctx.fillStyle = look.floor;
    ctx.fillRect(0, y, w, h - y);
    ctx.strokeStyle = look.plank;
    ctx.lineWidth = Math.max(1, h * 0.004);
    var plank = Math.max(8, (h - y) / 7);
    for (var py = y; py < h; py += plank) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    }
  }

  function paintRoom(ctx, w, h, model, time) {
    if (w < 2 || h < 2) return;
    var maxLevel = model && model.maxLevel ? model.maxLevel : 0;
    var rentLevel = model && model.rentLevel ? model.rentLevel : 0;
    var tier = visualTier(maxLevel, rentLevel);
    var look = ROOM_LOOKS[tier];
    var t = time || 0;
    var floorY = h * look.floorY;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = linear(ctx, 0, 0, 0, floorY, [[0, look.wall[0]], [1, look.wall[1]]]);
    ctx.fillRect(0, 0, w, floorY + 1);
    if (look.brick) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(w * 0.58, 0, w * 0.42, floorY);
      ctx.clip();
      ctx.fillStyle = '#8d5344';
      ctx.fillRect(w * 0.58, 0, w * 0.42, floorY);
      ctx.strokeStyle = 'rgba(60, 24, 18, 0.35)';
      ctx.lineWidth = 2;
      var bh = Math.max(10, floorY * 0.07);
      var bw = Math.max(22, w * 0.08);
      var row = 0;
      for (var yy = 0; yy < floorY; yy += bh) {
        for (var xx = w * 0.5 - (row % 2) * bw / 2; xx < w; xx += bw) ctx.strokeRect(xx, yy, bw, bh);
        row += 1;
      }
      ctx.restore();
    }
    if (look.crack) paintCracks(ctx, w, h);
    if (tier === 0) {
      ctx.strokeStyle = '#5c6568';
      ctx.lineWidth = Math.max(4, w * 0.012);
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.08);
      ctx.lineTo(w * 0.1, floorY * 0.7);
      ctx.stroke();
    }
    var win = look.win;
    paintWindow(ctx, w * win[0], h * win[1], w * win[2], h * win[3], look, tier, t);
    paintFloor(ctx, w, h, floorY, look);
    ctx.fillStyle = tier >= 6 ? '#e4b15a' : 'rgba(80, 60, 40, 0.45)';
    ctx.fillRect(0, floorY - h * 0.012, w, h * 0.016);
    if (look.rug) {
      ctx.fillStyle = look.rug;
      roundRect(ctx, w * 0.18, floorY + (h - floorY) * 0.22, w * 0.64, (h - floorY) * 0.55, 14);
      ctx.fill();
    }
    if (tier < 6) {
      ctx.fillStyle = 'rgba(255, 214, 150, 0.1)';
      ctx.beginPath();
      ctx.moveTo(w * (win[0] + win[2] * 0.5), h * (win[1] + win[3]));
      ctx.lineTo(w * 0.12, h);
      ctx.lineTo(w * 0.88, h);
      ctx.fill();
    }
    var warmth = Math.min(1, rentLevel / 8);
    if (warmth > 0) {
      ctx.fillStyle = 'rgba(255, 196, 120, ' + (warmth * 0.14) + ')';
      ctx.fillRect(0, 0, w, h);
    }
    var unit = Math.min(w, h);
    var decor = decorFor(maxLevel);
    for (var i = 0; i < decor.length; i += 1) {
      var piece = decor[i];
      var size = unit * piece.s;
      var x = w * piece.x;
      var y = h * piece.foot - size;
      var sprite = renderSprite(piece.level, size, t + i);
      ctx.drawImage(sprite, x, y, size, size);
    }
    var vignette = radial(ctx, w / 2, h * 0.45, w * 0.2, w * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.28)']]);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  window.AureliaArt = {
    ITEM_COUNT: 15,
    paintItem: paintItem,
    paintRoom: paintRoom,
    visualTier: visualTier
  };
})();
