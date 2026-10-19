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

  function paintSky(ctx, x, y, w, h, sky, time, high) {
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
    var base = y + h * (high ? 0.96 : 0.78);
    var cursor = x - 6;
    var widths = [0.14, 0.1, 0.18, 0.12, 0.16, 0.11, 0.15];
    var heights = high ? [0.16, 0.24, 0.12, 0.3, 0.2, 0.22, 0.14] : [0.34, 0.5, 0.28, 0.62, 0.4, 0.48, 0.32];
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

  var PALETTE = {
    raw: { wall: '#aaa49c', wallSide: '#989289', ceil: '#bab4ab', trim: '#8c857c', floorA: '#8f8982', floorB: '#76706a', sofa: '#bdb6ac', sofaDark: '#968f85', accent: '#c9a46a', accent2: '#9aa3ab', wood: '#a07d58', rugA: '#d8d2c6', rugB: '#b9b2a6', glow: '255, 240, 214', screen: ['#30353c', '#4b525b'] },
    plain: { wall: '#e8dfd1', wallSide: '#d6cbbb', ceil: '#f2ece2', trim: '#f8f3ea', floorA: '#c9a477', floorB: '#b38c5f', sofa: '#8f8b87', sofaDark: '#6f6b67', accent: '#c86b4a', accent2: '#7d9aa8', wood: '#a87c50', rugA: '#b7a48c', rugB: '#97846e', glow: '255, 226, 170', screen: ['#1d3550', '#4f8fb8'] },
    sig: { wall: '#d8c5ad', wallSide: '#c3ae93', ceil: '#ebdecd', trim: '#f4e9d9', floorA: '#7c4b2c', floorB: '#5a341e', sofa: '#b65f38', sofaDark: '#874223', accent: '#d9a441', accent2: '#55705e', wood: '#6b3f24', rugA: '#d9c6a2', rugB: '#a88f66', glow: '255, 206, 140', screen: ['#24183a', '#d98a52'] },
    1: { wall: '#f6f2eb', wallSide: '#e8e2d8', ceil: '#fcfaf6', trim: '#ffffff', floorA: '#ead6b2', floorB: '#d6bb8f', sofa: '#dcd7cf', sofaDark: '#bcb6ab', accent: '#93ad94', accent2: '#e2b44c', wood: '#d4b17f', rugA: '#f3eee4', rugB: '#3a3a3a', glow: '255, 240, 210', screen: ['#cfd9d6', '#93ad94'] },
    2: { wall: '#9a4a33', wallSide: '#6e6a65', ceil: '#4f4c49', trim: '#1c1b1a', floorA: '#4b392b', floorB: '#30241b', sofa: '#9b5627', sofaDark: '#5f3013', accent: '#d97a2a', accent2: '#3e5d71', wood: '#5b3f28', rugA: '#8d3e2d', rugB: '#dcbb8c', glow: '255, 166, 76', screen: ['#141414', '#d97a2a'] },
    3: { wall: '#16213a', wallSide: '#0f172a', ceil: '#1b2744', trim: '#e2b356', floorA: '#f4efe7', floorB: '#17171c', sofa: '#1f6c56', sofaDark: '#0d3a2e', accent: '#e2b356', accent2: '#eaa8b6', wood: '#1c130e', rugA: '#6e1f3a', rugB: '#e2b356', glow: '255, 214, 140', screen: ['#2a0f3a', '#e2b356'] }
  };

  function lerp(a, b, t) { return a + (b - a) * t; }

  function hash(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function chosenStyle(model) {
    var ids = ['floor', 'window', 'soft', 'light', 'tech'];
    var tally = { 1: 0, 2: 0, 3: 0 };
    var first = 0;
    for (var i = 0; i < ids.length; i += 1) {
      var style = zoneStyle(model, ids[i]);
      if (style < 1 || style > 3) continue;
      tally[style] += 1;
      if (!first) first = style;
    }
    var best = first;
    for (var s = 1; s <= 3; s += 1) if (tally[s] > tally[best]) best = s;
    return best;
  }

  function styleKey(style, tier) {
    if (style >= 1 && style <= 3) return style;
    if (tier >= 4) return 'sig';
    if (tier >= 1) return 'plain';
    return 'raw';
  }

  function makeRoom(w, h) {
    var r = roomShell(w, h);
    r.w = w;
    r.h = h;
    r.bw = r.x1 - r.x0;
    r.bh = r.y1 - r.y0;
    r.fh = h - r.y1;
    r.u = Math.min(w, h) / 100;
    return r;
  }

  function backPt(R, u, t) { return [lerp(R.x0, R.x1, u), lerp(R.y0, R.y1, t)]; }
  function floorPt(R, u, v) { return [lerp(lerp(R.x0, R.x1, u), lerp(0, R.w, u), v), lerp(R.y1, R.h, v)]; }
  function leftPt(R, s, t) { return [s * R.x0, lerp(s * R.y0, R.h - s * (R.h - R.y1), t)]; }
  function rightPt(R, s, t) { return [R.w - s * (R.w - R.x1), lerp(s * R.y0, R.h - s * (R.h - R.y1), t)]; }
  function ceilPt(R, u, s) { return [lerp(lerp(0, R.w, u), lerp(R.x0, R.x1, u), s), s * R.y0]; }
  function patch(R, fn, a0, a1, b0, b1) { return [fn(R, a0, b0), fn(R, a1, b0), fn(R, a1, b1), fn(R, a0, b1)]; }

  function fillQuad(ctx, pts, style) {
    quad(ctx, pts);
    ctx.fillStyle = style;
    ctx.fill();
  }

  function strokeLine(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }

  function glowAt(ctx, x, y, r, rgb, alpha) {
    if (alpha <= 0.002 || r <= 1) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, x, y, 0, r, [[0, 'rgba(' + rgb + ',' + Math.min(1, alpha) + ')'], [0.45, 'rgba(' + rgb + ',' + Math.min(1, alpha * 0.35) + ')'], [1, 'rgba(' + rgb + ',0)']]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function paintBrick(ctx, R, P) {
    ctx.save();
    quad(ctx, R.back);
    ctx.clip();
    ctx.fillStyle = '#b9a690';
    ctx.fillRect(R.x0, R.y0, R.bw, R.bh);
    var rows = 18;
    var bh = R.bh / rows;
    var bw = bh * 2.7;
    var gap = Math.max(1, bh * 0.14);
    for (var r = 0; r < rows; r += 1) {
      var y = R.y0 + r * bh;
      var off = (r % 2) * bw * 0.5;
      var c = 0;
      for (var x = R.x0 - off; x < R.x1; x += bw) {
        var n = hash(r * 31 + c * 7);
        c += 1;
        ctx.fillStyle = mixHex(P.wall, n > 0.5 ? '#2a120a' : '#d9835f', 0.05 + n * 0.22);
        ctx.fillRect(x + gap * 0.5, y + gap * 0.5, bw - gap, bh - gap);
      }
    }
    ctx.fillStyle = linear(ctx, 0, R.y0, 0, R.y1, [[0, 'rgba(0,0,0,0.28)'], [0.45, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.32)']]);
    ctx.fillRect(R.x0, R.y0, R.bw, R.bh);
    ctx.restore();
    ctx.fillStyle = 'rgba(30, 28, 26, 0.35)';
    for (var s = 0; s < 4; s += 1) {
      for (var t = 0; t < 3; t += 1) {
        var lp = leftPt(R, 0.25 + s * 0.2, 0.22 + t * 0.26);
        var rp = rightPt(R, 0.25 + s * 0.2, 0.22 + t * 0.26);
        ellipse(ctx, lp[0], lp[1], R.u * 0.5, R.u * 0.5);
        ctx.fill();
        ellipse(ctx, rp[0], rp[1], R.u * 0.5, R.u * 0.5);
        ctx.fill();
      }
    }
    ctx.strokeStyle = 'rgba(20, 18, 16, 0.25)';
    ctx.lineWidth = Math.max(1, R.u * 0.2);
    for (var k = 1; k < 4; k += 1) {
      strokeLine(ctx, [leftPt(R, 0, k / 4), leftPt(R, 1, k / 4)]);
      strokeLine(ctx, [rightPt(R, 0, k / 4), rightPt(R, 1, k / 4)]);
    }
  }

  function goldPanel(ctx, pts, lw) {
    quad(ctx, pts);
    ctx.strokeStyle = 'rgba(226, 179, 86, 0.85)';
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  function paintBoiserie(ctx, R) {
    var lw = Math.max(1, R.u * 0.35);
    goldPanel(ctx, patch(R, backPt, 0.03, 0.22, 0.1, 0.5), lw);
    goldPanel(ctx, patch(R, backPt, 0.78, 0.97, 0.1, 0.5), lw);
    goldPanel(ctx, patch(R, backPt, 0.03, 0.22, 0.58, 0.92), lw);
    goldPanel(ctx, patch(R, backPt, 0.78, 0.97, 0.58, 0.92), lw);
    goldPanel(ctx, patch(R, leftPt, 0.2, 0.9, 0.12, 0.5), lw);
    goldPanel(ctx, patch(R, leftPt, 0.2, 0.9, 0.58, 0.9), lw);
    goldPanel(ctx, patch(R, rightPt, 0.2, 0.9, 0.12, 0.5), lw);
    goldPanel(ctx, patch(R, rightPt, 0.2, 0.9, 0.58, 0.9), lw);
    ctx.strokeStyle = 'rgba(226, 179, 86, 0.55)';
    ctx.lineWidth = lw * 0.8;
    strokeLine(ctx, [leftPt(R, 0, 0.54), leftPt(R, 1, 0.54), rightPt(R, 1, 0.54), rightPt(R, 0, 0.54)]);
    ctx.fillStyle = linear(ctx, R.x0, R.y0, R.x1, R.y1, [[0, 'rgba(255,255,255,0.04)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.2)']]);
    quad(ctx, R.back);
    ctx.fill();
  }

  function paintWainscot(ctx, R) {
    var panel = '#ebe5da';
    fillQuad(ctx, patch(R, backPt, 0, 1, 0.64, 1), panel);
    fillQuad(ctx, patch(R, leftPt, 0, 1, 0.64, 1), mixHex(panel, '#000000', 0.06));
    fillQuad(ctx, patch(R, rightPt, 0, 1, 0.64, 1), mixHex(panel, '#000000', 0.12));
    ctx.strokeStyle = 'rgba(150, 132, 108, 0.28)';
    ctx.lineWidth = Math.max(1, R.u * 0.18);
    ctx.beginPath();
    for (var i = 1; i < 30; i += 1) {
      var top = backPt(R, i / 30, 0.64);
      ctx.moveTo(top[0], top[1]);
      ctx.lineTo(top[0], R.y1);
    }
    for (var s = 1; s < 10; s += 1) {
      var a = leftPt(R, s / 10, 0.64);
      var b = leftPt(R, s / 10, 1);
      var c = rightPt(R, s / 10, 0.64);
      var d = rightPt(R, s / 10, 1);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.moveTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
    }
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, R.u * 0.6);
    strokeLine(ctx, [leftPt(R, 0, 0.64), leftPt(R, 1, 0.64), rightPt(R, 1, 0.64), rightPt(R, 0, 0.64)]);
  }

  function paintSlats(ctx, R, P) {
    var bands = [[0.0, 0.22], [0.8, 1.0]];
    for (var b = 0; b < bands.length; b += 1) {
      var n = 9;
      for (var i = 0; i < n; i += 1) {
        var u0 = lerp(bands[b][0], bands[b][1], i / n);
        var u1 = lerp(bands[b][0], bands[b][1], (i + 0.62) / n);
        fillQuad(ctx, patch(R, backPt, u0, u1, 0, 1), linear(ctx, 0, R.y0, 0, R.y1, [[0, mixHex(P.wood, '#ffffff', 0.12)], [1, mixHex(P.wood, '#000000', 0.2)]]));
      }
    }
  }

  function paintConcrete(ctx, R) {
    ctx.save();
    quad(ctx, R.back);
    ctx.clip();
    for (var i = 0; i < 26; i += 1) {
      var x = R.x0 + hash(i) * R.bw;
      var y = R.y0 + hash(i + 40) * R.bh;
      ctx.fillStyle = 'rgba(' + (hash(i + 9) > 0.5 ? '255,255,255' : '40,36,32') + ',' + (0.05 + hash(i + 3) * 0.07) + ')';
      ellipse(ctx, x, y, R.u * (2 + hash(i + 5) * 7), R.u * (1.5 + hash(i + 6) * 4));
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(40, 34, 30, 0.22)';
    ctx.lineWidth = Math.max(1, R.u * 0.25);
    for (var k = 1; k < 3; k += 1) strokeLine(ctx, [[R.x0, R.y0 + R.bh * k / 3], [R.x1, R.y0 + R.bh * k / 3]]);
    ctx.fillStyle = 'rgba(214, 180, 112, 0.35)';
    ctx.fillRect(R.x0 + R.bw * 0.08, R.y0 + R.bh * 0.2, R.bw * 0.1, R.bh * 0.12);
    ctx.restore();
    ctx.strokeStyle = 'rgba(40, 32, 28, 0.45)';
    ctx.lineWidth = Math.max(1, R.u * 0.35);
    strokeLine(ctx, [leftPt(R, 0.3, 0.12), leftPt(R, 0.42, 0.3), leftPt(R, 0.36, 0.42)]);
  }
  function paintCeiling(ctx, R, key, P, tier, time) {
    if (key === 2) {
      for (var i = 0; i < 6; i += 1) {
        var u = (i + 0.5) / 6;
        fillQuad(ctx, [ceilPt(R, u - 0.025, 0), ceilPt(R, u + 0.025, 0), ceilPt(R, u + 0.025, 1), ceilPt(R, u - 0.025, 1)], '#2a1d14');
      }
      fillQuad(ctx, [ceilPt(R, 0.7, 0), ceilPt(R, 0.8, 0), ceilPt(R, 0.8, 1), ceilPt(R, 0.7, 1)], linear(ctx, 0, 0, R.w * 0.1, 0, [[0, '#2b2c2e'], [0.5, '#6f7174'], [1, '#232425']]));
    } else if (key === 3) {
      var lw = Math.max(1, R.u * 0.3);
      for (var a = 0; a < 3; a += 1) {
        goldPanel(ctx, [ceilPt(R, 0.08 + a * 0.3, 0.2), ceilPt(R, 0.3 + a * 0.3, 0.2), ceilPt(R, 0.3 + a * 0.3, 0.8), ceilPt(R, 0.08 + a * 0.3, 0.8)], lw);
      }
    } else if (key === 'raw') {
      ctx.strokeStyle = 'rgba(40, 34, 30, 0.2)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      for (var k = 1; k < 5; k += 1) strokeLine(ctx, [ceilPt(R, k / 5, 0), ceilPt(R, k / 5, 1)]);
    }
    ctx.strokeStyle = key === 3 ? '#e2b356' : key === 2 ? '#1c1b1a' : P.trim;
    ctx.lineWidth = Math.max(2, R.u * (tier >= 4 ? 1.1 : 0.6));
    strokeLine(ctx, [[0, 0], [R.x0, R.y0], [R.x1, R.y0], [R.w, 0]]);
    if (tier >= 6 || key === 3) {
      var pulse = 0.55 + Math.sin(time * 1.3) * 0.1;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = linear(ctx, 0, R.y0, 0, R.y0 + R.bh * 0.18, [[0, 'rgba(' + P.glow + ',' + (0.4 * pulse) + ')'], [1, 'rgba(' + P.glow + ',0)']]);
      ctx.fillRect(R.x0, R.y0, R.bw, R.bh * 0.18);
      ctx.restore();
    }
  }

  function paintShell(ctx, R, key, tier, time) {
    var P = PALETTE[key];
    fillQuad(ctx, R.ceiling, linear(ctx, 0, 0, 0, R.y0, [[0, mixHex(P.ceil, '#000000', 0.14)], [1, P.ceil]]));
    fillQuad(ctx, R.left, linear(ctx, 0, 0, R.x0, 0, [[0, mixHex(P.wallSide, '#000000', 0.2)], [1, P.wallSide]]));
    fillQuad(ctx, R.right, linear(ctx, R.w, 0, R.x1, 0, [[0, mixHex(P.wallSide, '#000000', 0.3)], [1, mixHex(P.wallSide, '#000000', 0.08)]]));
    fillQuad(ctx, R.back, linear(ctx, 0, R.y0, 0, R.y1, [[0, mixHex(P.wall, '#ffffff', 0.06)], [1, mixHex(P.wall, '#000000', 0.1)]]));
    if (key === 2) paintBrick(ctx, R, P);
    else if (key === 3) paintBoiserie(ctx, R);
    else if (key === 1) paintWainscot(ctx, R);
    else if (key === 'sig') paintSlats(ctx, R, P);
    else if (key === 'raw') paintConcrete(ctx, R);
    paintCeiling(ctx, R, key, P, tier, time);
  }

  function floorRows(n) {
    var list = [];
    for (var i = 0; i <= n; i += 1) list.push(Math.pow(i / n, 1.5));
    return list;
  }

  function paintFloor(ctx, R, key, tier, sky) {
    var P = PALETTE[key];
    var rows;
    var i;
    var j;
    ctx.save();
    quad(ctx, R.floor);
    ctx.clip();
    ctx.fillStyle = linear(ctx, 0, R.y1, 0, R.h, [[0, mixHex(P.floorA, '#000000', 0.2)], [1, P.floorA]]);
    ctx.fillRect(0, R.y1, R.w, R.fh);
    if (key === 3) {
      rows = floorRows(7);
      for (j = 0; j < 7; j += 1) {
        for (i = 0; i < 9; i += 1) {
          var white = (i + j) % 2 === 0;
          var pts = patch(R, floorPt, i / 9, (i + 1) / 9, rows[j], rows[j + 1]);
          fillQuad(ctx, pts, white ? '#f3eee6' : '#16161b');
          if (white) {
            ctx.strokeStyle = 'rgba(140, 140, 150, 0.35)';
            ctx.lineWidth = Math.max(1, R.u * 0.15);
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            ctx.quadraticCurveTo((pts[1][0] + pts[3][0]) / 2, (pts[0][1] + pts[2][1]) / 2 + R.u, pts[2][0], pts[2][1]);
            ctx.stroke();
          }
        }
      }
      ctx.strokeStyle = 'rgba(226, 179, 86, 0.6)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      for (j = 1; j < 7; j += 1) strokeLine(ctx, [floorPt(R, 0, rows[j]), floorPt(R, 1, rows[j])]);
    } else if (key === 'raw') {
      for (i = 0; i < 40; i += 1) {
        var pt = floorPt(R, hash(i + 70), hash(i + 90));
        ctx.fillStyle = 'rgba(' + (hash(i) > 0.5 ? '255,255,255' : '30,28,26') + ',0.08)';
        ellipse(ctx, pt[0], pt[1], R.u * (1 + hash(i + 2) * 3), R.u * 0.6);
        ctx.fill();
      }
      fillQuad(ctx, patch(R, floorPt, 0.04, 0.62, 0.3, 0.98), 'rgba(226, 220, 206, 0.75)');
      ctx.strokeStyle = 'rgba(120, 110, 96, 0.35)';
      ctx.lineWidth = Math.max(1, R.u * 0.3);
      for (i = 1; i < 4; i += 1) strokeLine(ctx, [floorPt(R, 0.04 + i * 0.14, 0.3), floorPt(R, 0.08 + i * 0.13, 0.98)]);
      var splats = [[0.2, 0.55, '#6f9fc6'], [0.42, 0.75, '#e0b25a'], [0.3, 0.85, '#6f9fc6']];
      for (i = 0; i < splats.length; i += 1) {
        var sp = floorPt(R, splats[i][0], splats[i][1]);
        ctx.fillStyle = splats[i][2];
        ellipse(ctx, sp[0], sp[1], R.u * 1.6, R.u * 0.7);
        ctx.fill();
      }
    } else if (key === 'sig') {
      rows = floorRows(10);
      var d = 1 / 13;
      for (j = 0; j < 10; j += 1) {
        var dir = j % 2 ? 1 : -1;
        for (i = -1; i < 14; i += 1) {
          var u0 = i * d;
          fillQuad(ctx, [floorPt(R, u0, rows[j]), floorPt(R, u0 + d, rows[j]), floorPt(R, u0 + d + d * 0.5 * dir, rows[j + 1]), floorPt(R, u0 + d * 0.5 * dir, rows[j + 1])], mixHex(P.floorA, P.floorB, hash(i * 13 + j * 7)));
        }
      }
    } else {
      var cols = key === 1 ? 9 : key === 2 ? 7 : 11;
      for (i = 0; i < cols; i += 1) {
        var tone = mixHex(P.floorA, P.floorB, hash(i * 17 + 3) * 0.8);
        fillQuad(ctx, patch(R, floorPt, i / cols, (i + 1) / cols, 0, 1), linear(ctx, 0, R.y1, 0, R.h, [[0, mixHex(tone, '#000000', 0.18)], [1, tone]]));
      }
      ctx.strokeStyle = key === 1 ? 'rgba(140, 110, 70, 0.3)' : key === 2 ? 'rgba(10, 6, 4, 0.55)' : 'rgba(90, 60, 30, 0.35)';
      ctx.lineWidth = Math.max(1, R.u * 0.18);
      rows = floorRows(8);
      for (i = 0; i <= cols; i += 1) {
        strokeLine(ctx, [floorPt(R, i / cols, 0), floorPt(R, i / cols, 1)]);
        for (j = 1; j < 8; j += 1) {
          if ((i + j) % 3) continue;
          strokeLine(ctx, [floorPt(R, i / cols, rows[j]), floorPt(R, (i + 1) / cols, rows[j])]);
        }
      }
    }
    var gloss = key === 3 ? 0.32 : key === 2 ? 0.22 : key === 'sig' ? 0.18 : key === 1 ? 0.12 : 0.05;
    ctx.fillStyle = linear(ctx, 0, R.y1, 0, R.h, [[0, 'rgba(255,255,255,' + (gloss * (0.4 + sky.sun * 0.6)) + ')'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.12)']]);
    ctx.fillRect(0, R.y1, R.w, R.fh);
    ctx.restore();
    var base = key === 3 ? '#e2b356' : key === 2 ? '#1c1b1a' : P.trim;
    ctx.fillStyle = base;
    ctx.fillRect(R.x0, R.y1 - R.bh * 0.035, R.bw, R.bh * 0.035);
    fillQuad(ctx, patch(R, leftPt, 0, 1, 0.965, 1), mixHex(base, '#000000', 0.12));
    fillQuad(ctx, patch(R, rightPt, 0, 1, 0.965, 1), mixHex(base, '#000000', 0.2));
  }

  function windowGeom(R, key, tier) {
    var u0 = 0.27;
    var u1 = 0.73;
    var t0 = 0.1;
    var t1 = 0.72;
    if (key === 2) { u0 = 0.21; u1 = 0.79; t0 = 0.05; t1 = 0.79; }
    if (key === 3) { u0 = 0.29; u1 = 0.71; t0 = 0.04; t1 = 0.78; }
    if (tier >= 6) { u0 -= 0.04; u1 += 0.04; t0 = Math.max(0.03, t0 - 0.03); }
    var x = lerp(R.x0, R.x1, u0);
    var y = lerp(R.y0, R.y1, t0);
    var w = (u1 - u0) * R.bw;
    var h = (t1 - t0) * R.bh;
    return { x: x, y: y, w: w, h: h, arch: key === 3, archH: Math.min(w * 0.5, h * 0.42) };
  }

  function windowPath(ctx, W) {
    ctx.beginPath();
    if (W.arch) {
      ctx.moveTo(W.x, W.y + W.h);
      ctx.lineTo(W.x, W.y + W.archH);
      ctx.ellipse(W.x + W.w / 2, W.y + W.archH, W.w / 2, W.archH, 0, Math.PI, Math.PI * 2);
      ctx.lineTo(W.x + W.w, W.y + W.h);
      ctx.closePath();
    } else {
      ctx.rect(W.x, W.y, W.w, W.h);
    }
  }

  function paintWindow(ctx, R, W, key, tier, sky, time) {
    var lw = Math.max(2, R.u * 0.9);
    ctx.save();
    windowPath(ctx, W);
    ctx.clip();
    paintSky(ctx, W.x, W.y, W.w, W.h, sky, time, tier >= 5);
    ctx.fillStyle = linear(ctx, W.x, W.y, W.x + W.w, W.y + W.h, [[0, 'rgba(255,255,255,0)'], [0.42, 'rgba(255,255,255,0)'], [0.48, 'rgba(255,255,255,0.16)'], [0.56, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']]);
    ctx.fillRect(W.x, W.y, W.w, W.h);
    ctx.restore();
    var cols = 2;
    var rows = 2;
    var color = PALETTE[key].trim;
    var width = lw;
    if (key === 1) { color = '#ffffff'; width = lw * 1.7; }
    else if (key === 2) { color = '#161616'; cols = 4; rows = 4; width = lw * 0.8; }
    else if (key === 3) { color = '#e2b356'; cols = 3; rows = 1; width = lw * 1.2; }
    else if (key === 'sig') { color = '#1f1b18'; cols = 3; rows = 1; width = lw * 0.7; }
    else if (key === 'raw') { color = '#8d8478'; }
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (key === 2 ? 0.55 : 0.6);
    ctx.beginPath();
    for (var c = 1; c < cols; c += 1) {
      var x = W.x + W.w * c / cols;
      ctx.moveTo(x, W.arch ? W.y + W.archH * 0.3 : W.y);
      ctx.lineTo(x, W.y + W.h);
    }
    for (var r = 1; r < rows; r += 1) {
      var y = W.y + W.h * r / rows;
      ctx.moveTo(W.x, y);
      ctx.lineTo(W.x + W.w, y);
    }
    if (W.arch) {
      ctx.moveTo(W.x, W.y + W.archH);
      ctx.lineTo(W.x + W.w, W.y + W.archH);
    }
    ctx.stroke();
    ctx.lineWidth = width;
    windowPath(ctx, W);
    ctx.stroke();
    ctx.fillStyle = key === 3 ? '#e2b356' : key === 2 ? '#2a2a2a' : key === 'raw' ? '#9a9084' : '#fbf8f2';
    ctx.fillRect(W.x - width * 1.5, W.y + W.h, W.w + width * 3, Math.max(2, R.u * (key === 1 ? 1.4 : 0.9)));
    if (key === 'raw') {
      ctx.strokeStyle = 'rgba(233, 214, 160, 0.9)';
      ctx.lineWidth = Math.max(2, R.u * 0.9);
      ctx.beginPath();
      ctx.moveTo(W.x + W.w * 0.06, W.y + W.h * 0.08);
      ctx.lineTo(W.x + W.w * 0.44, W.y + W.h * 0.92);
      ctx.moveTo(W.x + W.w * 0.44, W.y + W.h * 0.08);
      ctx.lineTo(W.x + W.w * 0.06, W.y + W.h * 0.92);
      ctx.moveTo(W.x + W.w * 0.56, W.y + W.h * 0.08);
      ctx.lineTo(W.x + W.w * 0.94, W.y + W.h * 0.92);
      ctx.moveTo(W.x + W.w * 0.94, W.y + W.h * 0.08);
      ctx.lineTo(W.x + W.w * 0.56, W.y + W.h * 0.92);
      ctx.stroke();
    }
    if (key === 1) {
      var potX = W.x + W.w * 0.14;
      var sill = W.y + W.h;
      ctx.fillStyle = '#f2ede4';
      roundRect(ctx, potX - R.u * 1.4, sill - R.u * 2.6, R.u * 2.8, R.u * 2.6, R.u * 0.6);
      ctx.fill();
      ctx.fillStyle = '#7f9c7f';
      ellipse(ctx, potX, sill - R.u * 3.6, R.u * 2, R.u * 1.6);
      ctx.fill();
      ctx.fillStyle = '#e8d7b6';
      roundRect(ctx, W.x + W.w * 0.78, sill - R.u * 3.2, R.u * 1.6, R.u * 3.2, R.u * 0.4);
      ctx.fill();
    }
    if (key === 'sig') {
      ctx.fillStyle = linear(ctx, 0, W.y, 0, W.y + W.h * 0.26, [[0, '#e6d7bf'], [1, '#d3c0a2']]);
      ctx.fillRect(W.x + width * 0.4, W.y + width * 0.4, W.w - width * 0.8, W.h * 0.26);
      ctx.fillStyle = '#1f1b18';
      ctx.fillRect(W.x + W.w * 0.47, W.y + W.h * 0.26, W.w * 0.06, R.u * 0.6);
    }
  }
  function paintCurtains(ctx, R, W, key, tier, time) {
    if (key === 'raw') return;
    if (key === 2) {
      if (tier < 3) return;
      ctx.strokeStyle = '#3b3b3c';
      ctx.lineWidth = Math.max(2, R.u * 0.8);
      strokeLine(ctx, [[R.x0, R.y0 + R.bh * 0.03], [R.x1, R.y0 + R.bh * 0.03]]);
      strokeLine(ctx, [[W.x - R.u * 3, R.y0 + R.bh * 0.03], [W.x - R.u * 3, R.y1 - R.bh * 0.04]]);
      return;
    }
    if (key === 'plain' && tier < 3) return;
    var sway = Math.sin(time * 0.9) * R.u * 0.4;
    var top = W.y - R.bh * 0.06;
    var bottom = R.y1 - R.bh * 0.04;
    var cw = W.w * (key === 3 ? 0.2 : 0.15);
    var rod = key === 3 ? '#e2b356' : key === 1 ? '#d9c39b' : key === 'sig' ? '#c99a4a' : '#6b6560';
    var cloth = key === 1 ? 'rgba(250, 246, 238, 0.72)' : key === 'sig' ? '#e3d4bd' : '#b9c3c7';
    function panel(outer, dirn) {
      var inner = outer + cw * dirn;
      ctx.beginPath();
      ctx.moveTo(outer, top);
      ctx.lineTo(inner, top);
      if (key === 3) {
        var tieY = lerp(top, bottom, 0.62);
        ctx.quadraticCurveTo(inner - cw * 0.1 * dirn + sway, lerp(top, tieY, 0.6), outer + cw * 0.38 * dirn, tieY);
        ctx.quadraticCurveTo(outer + cw * 0.5 * dirn, lerp(tieY, bottom, 0.5), inner + cw * 0.1 * dirn, bottom);
      } else {
        ctx.quadraticCurveTo(inner + sway, lerp(top, bottom, 0.5), inner + cw * 0.08 * dirn + sway, bottom);
      }
      ctx.lineTo(outer, bottom);
      ctx.closePath();
      if (key === 3) {
        ctx.fillStyle = linear(ctx, Math.min(outer, inner), 0, Math.max(outer, inner), 0, [[0, '#3e0d20'], [0.25, '#8a2a4a'], [0.5, '#4d1229'], [0.75, '#922f52'], [1, '#3e0d20']]);
      } else {
        ctx.fillStyle = cloth;
      }
      ctx.fill();
      ctx.strokeStyle = key === 3 ? 'rgba(0,0,0,0.3)' : 'rgba(150, 130, 100, 0.22)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      for (var f = 1; f < 4; f += 1) {
        var fx = lerp(outer, inner, f / 4);
        strokeLine(ctx, [[fx, top], [fx + sway * 0.5, key === 3 ? lerp(top, bottom, 0.58) : bottom]]);
      }
      if (key === 3) {
        ctx.fillStyle = '#e2b356';
        ellipse(ctx, outer + cw * 0.38 * dirn, lerp(top, bottom, 0.62), R.u * 1.1, R.u * 0.7);
        ctx.fill();
      }
    }
    panel(W.x - cw * 0.55, 1);
    panel(W.x + W.w + cw * 0.55, -1);
    ctx.strokeStyle = rod;
    ctx.lineWidth = Math.max(2, R.u * 0.7);
    strokeLine(ctx, [[W.x - cw * 0.8, top], [W.x + W.w + cw * 0.8, top]]);
    if (key === 3) {
      ctx.fillStyle = linear(ctx, 0, top - R.u * 2, 0, top + R.u * 3, [[0, '#8a2a4a'], [1, '#4d1229']]);
      ctx.fillRect(W.x - cw * 0.8, top - R.u * 1.5, W.w + cw * 1.6, R.u * 4);
      ctx.fillStyle = '#e2b356';
      for (var g = 0; g < 24; g += 1) {
        var gx = W.x - cw * 0.8 + (W.w + cw * 1.6) * (g + 0.5) / 24;
        ctx.fillRect(gx - R.u * 0.2, top + R.u * 2.5, R.u * 0.4, R.u * 1.2);
      }
    }
  }

  function wallArt(ctx, R, s0, s1, t0, t1, key, seed) {
    var frame = key === 3 ? '#e2b356' : key === 2 ? '#141414' : key === 1 ? '#dcc095' : key === 'sig' ? '#3a2416' : '#f2ede4';
    fillQuad(ctx, patch(R, leftPt, s0, s1, t0, t1), frame);
    var ds = (s1 - s0) * 0.1;
    var dt = (t1 - t0) * 0.1;
    var colors = key === 3 ? ['#1a2c55', '#e9a6b4', '#e2b356'] : key === 2 ? ['#d9cfbf', '#1d1d1d', '#d97a2a'] : key === 1 ? ['#f4efe6', '#93ad94', '#e2b44c'] : key === 'sig' ? ['#e9d8bd', '#b65f38', '#55705e'] : ['#7eb6d8', '#d4724b', '#f2e3c8'];
    fillQuad(ctx, patch(R, leftPt, s0 + ds, s1 - ds, t0 + dt, t1 - dt), colors[0]);
    fillQuad(ctx, patch(R, leftPt, lerp(s0, s1, 0.3 + seed * 0.1), lerp(s0, s1, 0.7), lerp(t0, t1, 0.25), lerp(t0, t1, 0.62)), colors[1]);
    var dot = leftPt(R, lerp(s0, s1, 0.62), lerp(t0, t1, 0.7));
    ctx.fillStyle = colors[2];
    ellipse(ctx, dot[0], dot[1], R.u * 1.4, R.u * 1.8);
    ctx.fill();
  }

  function paintFireplace(ctx, R, key, time) {
    var surround = key === 3 ? '#f1ece4' : key === 2 ? '#2b2b2c' : key === 1 ? '#f4f0e8' : '#c9b8a2';
    fillQuad(ctx, patch(R, leftPt, 0.14, 0.44, 0.56, 0.97), surround);
    fillQuad(ctx, patch(R, leftPt, 0.12, 0.46, 0.53, 0.57), key === 3 ? '#e2b356' : mixHex(surround, '#000000', 0.2));
    var box = patch(R, leftPt, 0.2, 0.38, 0.68, 0.95);
    fillQuad(ctx, box, '#120c08');
    var c = leftPt(R, 0.29, 0.92);
    var span = Math.abs(box[1][0] - box[0][0]);
    for (var i = 0; i < 5; i += 1) {
      var fx = c[0] + (i - 2) * span * 0.16;
      var fh = R.u * (4 + Math.sin(time * 7 + i * 1.7) * 1.6);
      ctx.fillStyle = linear(ctx, fx, c[1], fx, c[1] - fh, [[0, '#ffcf5a'], [0.5, '#ff8a1f'], [1, 'rgba(255, 70, 20, 0)']]);
      ctx.beginPath();
      ctx.moveTo(fx - span * 0.08, c[1]);
      ctx.quadraticCurveTo(fx, c[1] - fh * 1.4, fx + span * 0.08, c[1]);
      ctx.fill();
    }
    glowAt(ctx, c[0], c[1] - R.u * 2, R.u * 22, '255, 150, 60', 0.4 + Math.sin(time * 5) * 0.06);
  }

  function paintRightWall(ctx, R, key, tier, time) {
    var P = PALETTE[key];
    if (tier >= 5) {
      fillQuad(ctx, patch(R, rightPt, 0.05, 0.27, 0.1, 0.86), key === 3 ? '#1c130e' : key === 2 ? '#1d1d1e' : P.wood);
      var books = ['#c86b4a', '#e2b356', '#55705e', '#f2ede4', '#3e5d71', '#8d3e2d', '#eaa8b6'];
      for (var row = 0; row < 4; row += 1) {
        var t0 = 0.14 + row * 0.18;
        for (var b = 0; b < 5; b += 1) {
          var s0 = 0.07 + b * 0.04;
          var tall = 0.11 + hash(row * 9 + b) * 0.04;
          fillQuad(ctx, patch(R, rightPt, s0, s0 + 0.03, t0 + 0.15 - tall, t0 + 0.15), books[(row * 3 + b) % books.length]);
        }
        fillQuad(ctx, patch(R, rightPt, 0.05, 0.27, t0 + 0.15, t0 + 0.17), key === 3 ? '#e2b356' : mixHex(P.wood, '#000000', 0.3));
      }
    }
    if (tier >= 3) {
      var top = key === 3 ? '#e2b356' : key === 2 ? '#2a1d14' : mixHex(P.wood, '#ffffff', 0.15);
      fillQuad(ctx, patch(R, rightPt, 0.36, 0.9, 0.66, 0.84), key === 3 ? '#121216' : key === 2 ? '#2c2c2d' : P.wood);
      fillQuad(ctx, patch(R, rightPt, 0.36, 0.9, 0.64, 0.66), top);
      ctx.strokeStyle = key === 3 ? 'rgba(226,179,86,0.8)' : 'rgba(0,0,0,0.25)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      for (var d = 1; d < 3; d += 1) strokeLine(ctx, [rightPt(R, lerp(0.36, 0.9, d / 3), 0.66), rightPt(R, lerp(0.36, 0.9, d / 3), 0.84)]);
    }
    if (tier >= 4) {
      fillQuad(ctx, patch(R, rightPt, 0.42, 0.84, 0.3, 0.56), '#0b0b0e');
      var screen = patch(R, rightPt, 0.44, 0.82, 0.32, 0.54);
      var shift = (Math.sin(time * 0.6) + 1) / 2;
      fillQuad(ctx, screen, linear(ctx, screen[0][0], screen[0][1], screen[2][0], screen[2][1], [[0, P.screen[0]], [shift * 0.8 + 0.1, P.screen[1]], [1, P.screen[0]]]));
      var mid = rightPt(R, 0.63, 0.43);
      glowAt(ctx, mid[0], mid[1], R.u * 16, '120, 170, 255', 0.12);
    }
  }

  function sofaGeom(R) {
    return {
      x: R.x0 + R.bw * 0.03,
      w: R.bw * 0.5,
      top: R.y1 - R.bh * 0.21,
      seat: R.y1 + R.fh * 0.05,
      bottom: R.y1 + R.fh * 0.36
    };
  }

  function drawRoomSofa(ctx, R, key, tier, sky, time) {
    var G = sofaGeom(R);
    var P = PALETTE[key];
    var x = G.x;
    var w = G.w;
    var hh = G.bottom - G.top;
    var arm = w * 0.1;
    var rad = key === 3 ? hh * 0.32 : key === 'sig' ? hh * 0.26 : key === 2 ? hh * 0.12 : hh * 0.16;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ellipse(ctx, x + w * 0.5, G.bottom + hh * 0.04, w * 0.52, hh * 0.1);
    ctx.fill();
    var legH = key === 'sig' ? 0 : hh * (key === 1 || key === 3 ? 0.16 : 0.08);
    var body = G.bottom - legH;
    if (legH > 0) {
      ctx.fillStyle = key === 3 ? '#e2b356' : key === 1 ? P.wood : '#1b1716';
      var legs = [x + arm * 0.6, x + w - arm * 0.6];
      for (var l = 0; l < legs.length; l += 1) {
        ctx.beginPath();
        ctx.moveTo(legs[l] - R.u * 0.8, body);
        ctx.lineTo(legs[l] + R.u * 0.8, body);
        ctx.lineTo(legs[l] + (l ? R.u * 0.8 : -R.u * 0.2), G.bottom);
        ctx.lineTo(legs[l] + (l ? R.u * 0.2 : -R.u * 0.8), G.bottom);
        ctx.fill();
      }
    }
    ctx.fillStyle = linear(ctx, 0, G.top, 0, body, [[0, mixHex(P.sofa, '#ffffff', 0.12)], [0.6, P.sofa], [1, P.sofaDark]]);
    roundRect(ctx, x + arm * 0.5, G.top, w - arm, body - G.top, rad);
    ctx.fill();
    ctx.fillStyle = linear(ctx, 0, G.seat, 0, body, [[0, mixHex(P.sofa, '#ffffff', 0.18)], [1, P.sofaDark]]);
    roundRect(ctx, x + arm * 0.8, G.seat - hh * 0.04, w - arm * 1.6, body - G.seat + hh * 0.04, rad * 0.6);
    ctx.fill();
    ctx.fillStyle = linear(ctx, x, 0, x + arm, 0, [[0, P.sofaDark], [1, P.sofa]]);
    if (key === 2) {
      roundRect(ctx, x, G.top + hh * 0.22, arm, body - G.top - hh * 0.22, rad);
      ctx.fill();
      roundRect(ctx, x + w - arm, G.top + hh * 0.22, arm, body - G.top - hh * 0.22, rad);
      ctx.fill();
      ctx.fillStyle = mixHex(P.sofa, '#ffffff', 0.15);
      ellipse(ctx, x + arm * 0.5, G.top + hh * 0.24, arm * 0.62, hh * 0.08);
      ctx.fill();
      ellipse(ctx, x + w - arm * 0.5, G.top + hh * 0.24, arm * 0.62, hh * 0.08);
      ctx.fill();
      ctx.fillStyle = 'rgba(40, 16, 4, 0.55)';
      for (var tr = 0; tr < 2; tr += 1) {
        for (var tc = 0; tc < 8; tc += 1) {
          ellipse(ctx, x + arm * 1.3 + (w - arm * 2.6) * (tc + (tr % 2) * 0.5) / 8, G.top + hh * (0.12 + tr * 0.14), R.u * 0.45, R.u * 0.45);
          ctx.fill();
        }
      }
    } else {
      roundRect(ctx, x, G.top + hh * 0.3, arm, body - G.top - hh * 0.3, rad * 0.7);
      ctx.fill();
      roundRect(ctx, x + w - arm, G.top + hh * 0.3, arm, body - G.top - hh * 0.3, rad * 0.7);
      ctx.fill();
    }
    if (key === 3) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.lineWidth = Math.max(1, R.u * 0.35);
      ctx.beginPath();
      for (var ch = 1; ch < 9; ch += 1) {
        var cx = x + arm * 0.5 + (w - arm) * ch / 9;
        ctx.moveTo(cx, G.top + hh * 0.06);
        ctx.lineTo(cx, G.seat - hh * 0.06);
      }
      ctx.stroke();
      ctx.fillStyle = '#e2b356';
      ctx.fillRect(x + arm * 0.5, body - R.u * 0.5, w - arm, R.u * 0.5);
    }
    if (key === 'sig') {
      ctx.fillStyle = 'rgba(255, 240, 225, 0.12)';
      for (var bd = 0; bd < 40; bd += 1) {
        ellipse(ctx, x + arm + hash(bd) * (w - arm * 2), G.top + hash(bd + 50) * (body - G.top), R.u * 0.35, R.u * 0.35);
        ctx.fill();
      }
    }
    var seams = key === 1 ? 3 : key === 'plain' || key === 'raw' ? 2 : 0;
    if (seams) {
      ctx.strokeStyle = 'rgba(0,0,0,0.16)';
      ctx.lineWidth = Math.max(1, R.u * 0.25);
      ctx.beginPath();
      for (var sm = 1; sm < seams; sm += 1) {
        var sx = x + arm * 0.8 + (w - arm * 1.6) * sm / seams;
        ctx.moveTo(sx, G.seat);
        ctx.lineTo(sx, body - hh * 0.05);
      }
      ctx.stroke();
    }
    if (key !== 'raw') {
      var pillows = key === 3 ? [P.accent2, '#e2b356'] : key === 2 ? ['#d8c8a8', P.accent2] : key === 1 ? [P.accent, P.accent2] : key === 'sig' ? [P.accent2, P.accent] : ['#c86b4a'];
      for (var p = 0; p < pillows.length; p += 1) {
        ctx.save();
        ctx.translate(x + arm * 1.1 + p * w * 0.17 + w * 0.07, G.seat - hh * 0.12);
        ctx.rotate(-0.12 + p * 0.18);
        ctx.fillStyle = pillows[p];
        roundRect(ctx, -w * 0.075, -hh * 0.14, w * 0.15, hh * 0.28, R.u * 1.2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        roundRect(ctx, -w * 0.06, -hh * 0.12, w * 0.07, hh * 0.08, R.u * 0.8);
        ctx.fill();
        ctx.restore();
      }
      if (key === 1 && tier >= 3) {
        ctx.fillStyle = '#f1e7d4';
        roundRect(ctx, x + w - arm * 1.4, G.top + hh * 0.26, arm * 1.2, hh * 0.6, R.u);
        ctx.fill();
        ctx.strokeStyle = 'rgba(160, 140, 110, 0.5)';
        ctx.lineWidth = Math.max(1, R.u * 0.3);
        ctx.beginPath();
        for (var kn = 1; kn < 5; kn += 1) {
          ctx.moveTo(x + w - arm * 1.4, G.top + hh * (0.26 + kn * 0.12));
          ctx.lineTo(x + w - arm * 0.2, G.top + hh * (0.26 + kn * 0.12));
        }
        ctx.stroke();
      }
    }
    var sheen = key === 3 ? 0.22 : key === 2 ? 0.26 : 0.08;
    ctx.fillStyle = linear(ctx, x, G.top, x + w, G.top, [[0, 'rgba(255,255,255,0)'], [0.35, 'rgba(255,255,255,' + sheen + ')'], [0.55, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']]);
    roundRect(ctx, x + arm * 0.5, G.top, w - arm, hh * 0.24, rad);
    ctx.fill();
    var bob = Math.sin(time * 1.6) * R.u * 0.3;
    var catX = x + w * 0.66;
    var catY = G.seat - hh * 0.02;
    ctx.fillStyle = key === 3 ? '#2a2422' : '#efe6dc';
    ellipse(ctx, catX, catY + bob, w * 0.09, hh * 0.13);
    ctx.fill();
    ellipse(ctx, catX + w * 0.08, catY - hh * 0.02 + bob, w * 0.04, hh * 0.09);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(catX + w * 0.055, catY - hh * 0.08 + bob);
    ctx.lineTo(catX + w * 0.065, catY - hh * 0.17 + bob);
    ctx.lineTo(catX + w * 0.085, catY - hh * 0.1 + bob);
    ctx.lineTo(catX + w * 0.105, catY - hh * 0.17 + bob);
    ctx.lineTo(catX + w * 0.115, catY - hh * 0.06 + bob);
    ctx.fill();
    if (sky.night > 0.5) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = Math.max(8, Math.round(R.u * 3)) + 'px sans-serif';
      ctx.fillText('z', catX + w * 0.13, catY - hh * 0.22 + Math.sin(time * 3) * R.u);
    }
    if (key === 'raw') {
      ctx.fillStyle = 'rgba(235, 240, 245, 0.55)';
      roundRect(ctx, x - R.u * 0.6, G.top - R.u * 0.6, w + R.u * 1.2, G.bottom - G.top + R.u * 0.6, rad);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = Math.max(1, R.u * 0.35);
      strokeLine(ctx, [[x + w * 0.1, G.top + hh * 0.1], [x + w * 0.35, G.bottom - hh * 0.1]]);
      strokeLine(ctx, [[x + w * 0.55, G.top + hh * 0.05], [x + w * 0.8, G.bottom - hh * 0.2]]);
      ctx.fillStyle = '#d9c57a';
      ctx.fillRect(x + w * 0.45, G.top, R.u * 1.2, G.bottom - G.top);
    }
  }
  function paintRug(ctx, R, key, tier) {
    if (tier < 2 || key === 'raw') return;
    var P = PALETTE[key];
    var outer = patch(R, floorPt, 0.12, 0.84, 0.16, 0.72);
    ctx.save();
    ctx.translate(R.u * 0.6, R.u * 0.6);
    fillQuad(ctx, outer, 'rgba(0,0,0,0.25)');
    ctx.restore();
    fillQuad(ctx, outer, P.rugA);
    if (key === 3) {
      fillQuad(ctx, patch(R, floorPt, 0.15, 0.81, 0.2, 0.67), P.rugB);
      fillQuad(ctx, patch(R, floorPt, 0.17, 0.79, 0.23, 0.64), '#5a1630');
      var c = floorPt(R, 0.48, 0.44);
      ctx.strokeStyle = '#e2b356';
      ctx.lineWidth = Math.max(1, R.u * 0.5);
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], R.bw * 0.14, R.fh * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], R.bw * 0.07, R.fh * 0.06, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (key === 2) {
      for (var s = 0; s < 6; s += 1) {
        var v0 = lerp(0.16, 0.72, s / 6);
        fillQuad(ctx, patch(R, floorPt, 0.12, 0.84, v0, v0 + 0.03), P.rugB);
      }
      for (var d = 0; d < 4; d += 1) {
        var m = floorPt(R, 0.22 + d * 0.18, 0.44);
        ctx.fillStyle = d % 2 ? '#dcbb8c' : '#2e4b5c';
        ctx.beginPath();
        ctx.moveTo(m[0], m[1] - R.fh * 0.08);
        ctx.lineTo(m[0] + R.bw * 0.05, m[1]);
        ctx.lineTo(m[0], m[1] + R.fh * 0.08);
        ctx.lineTo(m[0] - R.bw * 0.05, m[1]);
        ctx.fill();
      }
    } else if (key === 1) {
      ctx.save();
      quad(ctx, outer);
      ctx.clip();
      ctx.strokeStyle = P.rugB;
      ctx.lineWidth = Math.max(1, R.u * 0.25);
      ctx.beginPath();
      for (var k = -2; k <= 10; k += 1) {
        var a = floorPt(R, lerp(0.12, 0.84, k / 8), 0.16);
        var b = floorPt(R, lerp(0.12, 0.84, k / 8 + 0.25), 0.72);
        var e = floorPt(R, lerp(0.12, 0.84, k / 8 - 0.25), 0.72);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(e[0], e[1]);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      fillQuad(ctx, patch(R, floorPt, 0.15, 0.81, 0.21, 0.67), P.rugB);
      fillQuad(ctx, patch(R, floorPt, 0.17, 0.79, 0.24, 0.64), P.rugA);
    }
  }

  function paintCoffee(ctx, R, key, tier, time) {
    if (tier < 2 || key === 'raw') return;
    var P = PALETTE[key];
    var c = floorPt(R, 0.6, 0.6);
    var tw = R.bw * 0.3;
    var th = R.fh * 0.12;
    var lift = R.fh * 0.16;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ellipse(ctx, c[0], c[1] + lift * 0.1, tw * 0.55, th * 0.6);
    ctx.fill();
    if (key === 3) {
      ctx.fillStyle = '#e2b356';
      ctx.beginPath();
      ctx.moveTo(c[0] - tw * 0.08, c[1] - lift);
      ctx.lineTo(c[0] + tw * 0.08, c[1] - lift);
      ctx.lineTo(c[0] + tw * 0.18, c[1]);
      ctx.lineTo(c[0] - tw * 0.18, c[1]);
      ctx.fill();
      ctx.fillStyle = linear(ctx, c[0] - tw / 2, 0, c[0] + tw / 2, 0, [[0, '#f6f2ec'], [0.5, '#d9d4cc'], [1, '#f6f2ec']]);
      ellipse(ctx, c[0], c[1] - lift, tw / 2, th / 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,120,130,0.5)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      ctx.beginPath();
      ctx.moveTo(c[0] - tw * 0.3, c[1] - lift - th * 0.1);
      ctx.quadraticCurveTo(c[0], c[1] - lift + th * 0.3, c[0] + tw * 0.25, c[1] - lift - th * 0.2);
      ctx.stroke();
      ctx.strokeStyle = '#e2b356';
      ctx.lineWidth = Math.max(1, R.u * 0.4);
      ellipse(ctx, c[0], c[1] - lift, tw / 2, th / 2);
      ctx.stroke();
    } else if (key === 1) {
      ctx.strokeStyle = P.wood;
      ctx.lineWidth = Math.max(1.5, R.u * 0.6);
      ctx.beginPath();
      ctx.moveTo(c[0] - tw * 0.3, c[1]);
      ctx.lineTo(c[0] - tw * 0.2, c[1] - lift);
      ctx.moveTo(c[0] + tw * 0.3, c[1]);
      ctx.lineTo(c[0] + tw * 0.2, c[1] - lift);
      ctx.moveTo(c[0], c[1] + th * 0.2);
      ctx.lineTo(c[0], c[1] - lift);
      ctx.stroke();
      ctx.fillStyle = linear(ctx, 0, c[1] - lift - th, 0, c[1] - lift + th, [[0, '#f0dcb8'], [1, '#c9a678']]);
      ellipse(ctx, c[0], c[1] - lift, tw / 2, th / 2);
      ctx.fill();
    } else {
      var top = key === 2 ? '#6b4a30' : key === 'sig' ? '#5a341e' : '#a87c50';
      ctx.fillStyle = key === 2 ? '#141414' : mixHex(top, '#000000', 0.3);
      ctx.fillRect(c[0] - tw * 0.42, c[1] - lift, R.u * 0.8, lift);
      ctx.fillRect(c[0] + tw * 0.42 - R.u * 0.8, c[1] - lift, R.u * 0.8, lift);
      if (key === 2) ctx.fillRect(c[0] - tw * 0.42, c[1] - lift * 0.3, tw * 0.84, R.u * 0.6);
      ctx.fillStyle = linear(ctx, 0, c[1] - lift - th, 0, c[1] - lift + th * 0.6, [[0, mixHex(top, '#ffffff', 0.2)], [1, top]]);
      roundRect(ctx, c[0] - tw / 2, c[1] - lift - th * 0.5, tw, th * (key === 2 ? 0.9 : 0.7), R.u * 0.6);
      ctx.fill();
    }
    if (tier < 4) return;
    var deco = c[1] - lift - th * 0.3;
    if (key === 3) {
      ctx.fillStyle = '#e2b356';
      roundRect(ctx, c[0] - R.u * 1.2, deco - R.u * 4, R.u * 2.4, R.u * 4, R.u);
      ctx.fill();
      var flowers = ['#eaa8b6', '#f6e1e6', '#e07a8f'];
      for (var f = 0; f < 5; f += 1) {
        ctx.fillStyle = flowers[f % 3];
        ellipse(ctx, c[0] + (f - 2) * R.u * 1.1, deco - R.u * (5.6 - Math.abs(f - 2) * 0.5) + Math.sin(time * 2 + f) * R.u * 0.2, R.u * 1.1, R.u * 1.1);
        ctx.fill();
      }
    } else if (key === 2) {
      ctx.fillStyle = '#d9cfbf';
      ctx.fillRect(c[0] - tw * 0.3, deco - R.u * 1.2, tw * 0.22, R.u * 1.2);
      ctx.fillStyle = '#d97a2a';
      ctx.fillRect(c[0] - tw * 0.28, deco - R.u * 2.2, tw * 0.18, R.u);
      ctx.fillStyle = '#efe6d8';
      roundRect(ctx, c[0] + tw * 0.1, deco - R.u * 2.4, R.u * 2, R.u * 2.4, R.u * 0.4);
      ctx.fill();
    } else {
      ctx.fillStyle = key === 1 ? '#f4efe6' : '#2f2a26';
      roundRect(ctx, c[0] - R.u * 1.3, deco - R.u * 3.4, R.u * 2.6, R.u * 3.4, R.u);
      ctx.fill();
      ctx.strokeStyle = key === 1 ? '#7f6a52' : '#55705e';
      ctx.lineWidth = Math.max(1, R.u * 0.3);
      strokeLine(ctx, [[c[0], deco - R.u * 3.4], [c[0] - R.u * 2, deco - R.u * 7]]);
      strokeLine(ctx, [[c[0], deco - R.u * 3.4], [c[0] + R.u * 1.6, deco - R.u * 7.5]]);
      ctx.fillStyle = key === 1 ? '#e2b44c' : '#d9a441';
      ctx.beginPath();
      ctx.arc(c[0] + tw * 0.25, deco - R.u * 0.6, R.u * 0.9, 0, Math.PI * 2);
      ctx.fill();
      glowAt(ctx, c[0] + tw * 0.25, deco - R.u * 1.4, R.u * 5, '255, 200, 120', 0.35 + Math.sin(time * 6) * 0.08);
    }
  }

  function paintPlant(ctx, x, y, size, key, time, seed) {
    var sway = Math.sin(time * 1.3 + seed) * size * 0.04;
    var pot = key === 3 ? '#e2b356' : key === 2 ? '#8b8a87' : key === 1 ? '#f2ede4' : key === 'sig' ? '#b86a42' : '#c9b49a';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ellipse(ctx, x, y, size * 0.26, size * 0.05);
    ctx.fill();
    ctx.fillStyle = linear(ctx, x - size * 0.2, 0, x + size * 0.2, 0, [[0, mixHex(pot, '#000000', 0.2)], [0.4, mixHex(pot, '#ffffff', 0.2)], [1, mixHex(pot, '#000000', 0.25)]]);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y - size * 0.3);
    ctx.lineTo(x + size * 0.2, y - size * 0.3);
    ctx.lineTo(x + size * 0.15, y);
    ctx.lineTo(x - size * 0.15, y);
    ctx.fill();
    var green = key === 3 ? '#2f7a4f' : key === 2 ? '#1f6a3f' : key === 1 ? '#5f8f5a' : key === 'sig' ? '#7b8f5e' : '#4f8a4a';
    function leaf(dx, dy, rot, s) {
      ctx.save();
      ctx.translate(x + dx * size + sway * (1 - dy), y - size * 0.3 + dy * size);
      ctx.rotate(rot + sway * 0.02);
      ctx.scale(s * size / 40, s * size / 40);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      if (key === 3) {
        ctx.quadraticCurveTo(-6, -18, 0, -34);
        ctx.quadraticCurveTo(6, -18, 0, 0);
      } else {
        ctx.bezierCurveTo(12, -6, 12, -22, 0, -28);
        ctx.bezierCurveTo(-12, -22, -12, -6, 0, 0);
      }
      ctx.fill();
      ctx.restore();
    }
    var leaves = key === 3 ? 9 : 7;
    for (var i = 0; i < leaves; i += 1) {
      var ang = -1.15 + (2.3 * i) / (leaves - 1);
      ctx.fillStyle = i % 2 ? mixHex(green, '#000000', 0.22) : green;
      leaf(ang * 0.06, -0.04 - (i % 3) * 0.1, ang, 0.62 + (i % 3) * 0.12);
    }
    ctx.fillStyle = mixHex(green, '#ffffff', 0.18);
    leaf(0.02, -0.22, 0.15, 0.55);
  }

  function paintPendant(ctx, R, key, tier, time, lights, glow) {
    var sx = (R.x0 + R.x1) / 2 + R.bw * 0.1;
    var sy = R.y0 + R.bh * 0.14;
    var top = R.y0 * 0.5;
    var big = tier >= 5 ? 1.35 : 1;
    ctx.strokeStyle = key === 3 ? '#e2b356' : '#222222';
    ctx.lineWidth = Math.max(1, R.u * 0.25);
    if (key === 2) {
      var drops = [[-0.09, 0.9], [0, 1.15], [0.09, 0.8]];
      for (var d = 0; d < drops.length; d += 1) {
        var bx = sx + R.bw * drops[d][0];
        var by = sy * drops[d][1];
        ctx.strokeStyle = '#222222';
        strokeLine(ctx, [[bx, top], [bx, by]]);
        ctx.fillStyle = '#2b2b2c';
        ctx.fillRect(bx - R.u * 0.6, by - R.u * 0.4, R.u * 1.2, R.u * 1.2);
        ctx.fillStyle = 'rgba(255, 196, 110, 0.85)';
        ellipse(ctx, bx, by + R.u * 2.2, R.u * 1.4 * big, R.u * 1.9 * big);
        ctx.fill();
        ctx.strokeStyle = '#fff1c4';
        strokeLine(ctx, [[bx - R.u * 0.5, by + R.u * 2.6], [bx, by + R.u * 1.6], [bx + R.u * 0.5, by + R.u * 2.6]]);
        lights.push({ x: bx, y: by + R.u * 2.2, r: R.u * 22 * big, rgb: glow, a: 0.5 });
      }
      return;
    }
    strokeLine(ctx, [[sx, top], [sx, sy]]);
    var r = R.u * 4.5 * big;
    if (key === 'raw') {
      ctx.fillStyle = '#fff3cf';
      ellipse(ctx, sx, sy + R.u * 1.4, R.u * 1.2, R.u * 1.6);
      ctx.fill();
      lights.push({ x: sx, y: sy + R.u, r: R.u * 18, rgb: '230, 240, 255', a: 0.35 });
      return;
    }
    if (key === 3) {
      var swing = Math.sin(time * 1.2) * R.u * 0.3;
      ctx.lineWidth = Math.max(1, R.u * 0.45);
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.5, r * 1.6, r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (tier >= 5) {
        ctx.beginPath();
        ctx.ellipse(sx, sy + r * 1.2, r * 1.1, r * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (var c = 0; c < 9; c += 1) {
        var ang = (c / 9) * Math.PI * 2 + time * 0.2;
        var cx = sx + Math.cos(ang) * r * 1.6;
        var cy = sy + r * 0.5 + Math.sin(ang) * r * 0.35;
        var tw = 0.5 + 0.5 * Math.abs(Math.sin(time * 3 + c * 1.3));
        ctx.strokeStyle = 'rgba(220, 240, 255, 0.7)';
        ctx.lineWidth = Math.max(1, R.u * 0.2);
        strokeLine(ctx, [[cx, cy], [cx + swing, cy + r * 0.9]]);
        ctx.fillStyle = 'rgba(235, 248, 255, ' + (0.5 + tw * 0.5) + ')';
        ellipse(ctx, cx + swing, cy + r * 0.95, R.u * 0.55, R.u * 0.85);
        ctx.fill();
        ctx.fillStyle = '#fff4d0';
        ellipse(ctx, cx, cy - R.u * 0.6, R.u * 0.45, R.u * 0.8);
        ctx.fill();
      }
      lights.push({ x: sx, y: sy + r * 0.6, r: R.u * 40 * big, rgb: glow, a: 0.55 });
      return;
    }
    if (key === 1) {
      ctx.fillStyle = linear(ctx, sx - r * 1.2, 0, sx + r * 1.2, 0, [[0, '#a7804e'], [0.5, '#e2c38e'], [1, '#a7804e']]);
      ctx.beginPath();
      ctx.ellipse(sx, sy + r, r * 1.3, r, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(110, 80, 40, 0.5)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      for (var wv = 1; wv < 4; wv += 1) {
        ctx.beginPath();
        ctx.ellipse(sx, sy + r, r * 1.3 * (wv / 4), r * (wv / 4), 0, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
    } else if (key === 'sig') {
      ctx.fillStyle = 'rgba(255, 244, 222, 0.95)';
      ellipse(ctx, sx, sy + r, r * 1.3, r * 1.2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180, 150, 110, 0.35)';
      ctx.lineWidth = Math.max(1, R.u * 0.2);
      for (var rb = -2; rb <= 2; rb += 1) {
        ctx.beginPath();
        ctx.ellipse(sx, sy + r + rb * r * 0.35, r * 1.3 * Math.sqrt(1 - Math.pow(rb * 0.35 / 1.2, 2)), r * 0.12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#f4efe8';
      ctx.beginPath();
      ctx.moveTo(sx - R.u * 0.8, sy);
      ctx.lineTo(sx + R.u * 0.8, sy);
      ctx.lineTo(sx + r, sy + r * 0.9);
      ctx.lineTo(sx - r, sy + r * 0.9);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 240, 200, 0.95)';
    ellipse(ctx, sx, sy + r, r * 0.5, r * 0.18);
    ctx.fill();
    lights.push({ x: sx, y: sy + r, r: R.u * 30 * big, rgb: glow, a: 0.45 });
  }

  function paintFloorLamp(ctx, R, key, tier, lights, glow) {
    if (tier < 2 || key === 'raw') return;
    var base = floorPt(R, 0, 0.28);
    var x = base[0] + R.u * 4;
    var y = base[1];
    var tall = R.bh * 0.82;
    var head;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ellipse(ctx, x, y, R.u * 4, R.u * 1);
    ctx.fill();
    if (key === 3 || key === 'sig') {
      ctx.fillStyle = key === 3 ? '#f1ece4' : '#2f2a26';
      ellipse(ctx, x, y - R.u * 0.6, R.u * 3, R.u * 1.1);
      ctx.fill();
      ctx.strokeStyle = key === 3 ? '#e2b356' : '#c99a4a';
      ctx.lineWidth = Math.max(1.5, R.u * 0.6);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x, y - tall, x + R.bw * 0.2, y - tall * 0.78);
      ctx.stroke();
      head = { x: x + R.bw * 0.2, y: y - tall * 0.76 };
      ctx.fillStyle = key === 3 ? '#e2b356' : '#c99a4a';
      ctx.beginPath();
      ctx.ellipse(head.x, head.y, R.u * 3.4, R.u * 2.4, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (key === 2) {
      ctx.strokeStyle = '#1b1b1c';
      ctx.lineWidth = Math.max(1.5, R.u * 0.5);
      strokeLine(ctx, [[x - R.u * 3, y], [x, y - tall * 0.6], [x + R.u * 3, y]]);
      strokeLine(ctx, [[x, y], [x, y - tall * 0.6]]);
      head = { x: x + R.u * 2, y: y - tall * 0.66 };
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(0.5);
      ctx.fillStyle = '#1d1d1e';
      roundRect(ctx, -R.u * 2, -R.u * 1.8, R.u * 5, R.u * 3.6, R.u * 0.6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 200, 120, 0.9)';
      ellipse(ctx, R.u * 3, 0, R.u * 0.6, R.u * 1.6);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.strokeStyle = key === 1 ? PALETTE[1].wood : '#3a3634';
      ctx.lineWidth = Math.max(1.5, R.u * 0.5);
      if (key === 1) strokeLine(ctx, [[x - R.u * 3, y], [x, y - tall * 0.62], [x + R.u * 3, y]]);
      strokeLine(ctx, [[x, y], [x, y - tall * 0.62]]);
      head = { x: x, y: y - tall * 0.7 };
      ctx.fillStyle = key === 1 ? '#f6efe2' : '#efe6d6';
      ctx.beginPath();
      ctx.moveTo(head.x - R.u * 2.6, head.y - R.u * 2.6);
      ctx.lineTo(head.x + R.u * 2.6, head.y - R.u * 2.6);
      ctx.lineTo(head.x + R.u * 3.4, head.y + R.u * 2);
      ctx.lineTo(head.x - R.u * 3.4, head.y + R.u * 2);
      ctx.fill();
    }
    lights.push({ x: head.x, y: head.y + R.u * 2, r: R.u * 26, rgb: glow, a: 0.42 });
  }

  function paintSconces(ctx, R, key, tier, lights, glow) {
    if (tier < 5) return;
    var spots = [backPt(R, 0.12, 0.36), backPt(R, 0.9, 0.36)];
    for (var i = 0; i < spots.length; i += 1) {
      var p = spots[i];
      ctx.fillStyle = key === 3 ? '#e2b356' : key === 2 ? '#1d1d1e' : '#c99a4a';
      roundRect(ctx, p[0] - R.u * 0.6, p[1] - R.u * 2, R.u * 1.2, R.u * 3.6, R.u * 0.4);
      ctx.fill();
      ctx.fillStyle = key === 3 ? '#fff4d0' : '#ffe9c0';
      ellipse(ctx, p[0], p[1] - R.u * 2.6, R.u * 1.3, R.u * 1.6);
      ctx.fill();
      lights.push({ x: p[0], y: p[1] - R.u * 2.6, r: R.u * 14, rgb: glow, a: 0.5 });
    }
  }

  function paintClutter(ctx, R, tier) {
    if (tier > 1) return;
    function box(u, v, s, tilt) {
      var p = floorPt(R, u, v);
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.rotate(tilt);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ellipse(ctx, 0, 0, s * 0.7, s * 0.12);
      ctx.fill();
      ctx.fillStyle = linear(ctx, -s / 2, -s, s / 2, 0, [[0, '#d7ab72'], [1, '#a9773f']]);
      ctx.fillRect(-s / 2, -s * 0.8, s, s * 0.8);
      ctx.fillStyle = '#c99a5c';
      ctx.fillRect(-s / 2, -s * 0.95, s, s * 0.15);
      ctx.fillStyle = 'rgba(240, 225, 180, 0.8)';
      ctx.fillRect(-s * 0.08, -s * 0.95, s * 0.16, s * 0.95);
      ctx.restore();
    }
    if (tier === 0) {
      var l = backPt(R, 0.86, 1);
      ctx.strokeStyle = '#b9b2a6';
      ctx.lineWidth = Math.max(1.5, R.u * 0.6);
      ctx.beginPath();
      ctx.moveTo(l[0] - R.u * 3, l[1]);
      ctx.lineTo(l[0] - R.u, l[1] - R.bh * 0.65);
      ctx.moveTo(l[0] + R.u * 3, l[1]);
      ctx.lineTo(l[0] + R.u, l[1] - R.bh * 0.65);
      for (var k = 1; k < 6; k += 1) {
        var t = k / 6;
        ctx.moveTo(lerp(l[0] - R.u * 3, l[0] - R.u, t), l[1] - R.bh * 0.65 * t);
        ctx.lineTo(lerp(l[0] + R.u * 3, l[0] + R.u, t), l[1] - R.bh * 0.65 * t);
      }
      ctx.stroke();
      box(0.9, 0.42, R.u * 7, -0.04);
      box(0.8, 0.62, R.u * 6, 0.1);
    }
    box(0.88, 0.74, R.u * 10, 0.03);
    var b = floorPt(R, 0.1, 0.82);
    ctx.fillStyle = '#e8eef2';
    roundRect(ctx, b[0] - R.u * 2.4, b[1] - R.u * 4.4, R.u * 4.8, R.u * 4.4, R.u * 0.6);
    ctx.fill();
    ctx.fillStyle = '#6f9fc6';
    ctx.fillRect(b[0] - R.u * 2.4, b[1] - R.u * 4.4, R.u * 4.8, R.u * 1.2);
  }

  function paintSparkles(ctx, R, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 14; i += 1) {
      var x = R.x0 + hash(i + 200) * R.bw;
      var y = R.y0 + ((hash(i + 300) * R.bh * 1.4 + time * R.u * (1 + hash(i) * 2)) % (R.bh * 1.4));
      var a = 0.25 + 0.6 * Math.abs(Math.sin(time * 2 + i * 1.7));
      var s = R.u * (0.5 + hash(i + 7) * 0.7);
      ctx.fillStyle = 'rgba(255, 228, 160, ' + a + ')';
      ctx.beginPath();
      ctx.moveTo(x, y - s * 2);
      ctx.lineTo(x + s * 0.4, y);
      ctx.lineTo(x, y + s * 2);
      ctx.lineTo(x - s * 0.4, y);
      ctx.closePath();
      ctx.moveTo(x - s * 2, y);
      ctx.lineTo(x, y + s * 0.4);
      ctx.lineTo(x + s * 2, y);
      ctx.lineTo(x, y - s * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function paintRoom(ctx, w, h, model, time) {
    if (w < 2 || h < 2) return;
    var maxLevel = model && model.maxLevel ? model.maxLevel : 0;
    var rentLevel = model && model.rentLevel ? model.rentLevel : 0;
    var tier = visualTier(maxLevel, rentLevel);
    var t = time || 0;
    var sky = skyPhase(t);
    var R = makeRoom(w, h);
    var mood = chosenStyle(model);
    var wallKey = styleKey(mood, tier);
    var floorKey = styleKey(zoneStyle(model, 'floor') || mood, tier);
    var winKey = styleKey(zoneStyle(model, 'window') || mood, tier);
    var softKey = styleKey(zoneStyle(model, 'soft') || mood, tier);
    var lightKey = styleKey(zoneStyle(model, 'light') || mood, tier);
    var techKey = styleKey(zoneStyle(model, 'tech') || mood, tier);
    var glow = PALETTE[lightKey].glow;
    var lights = [];
    ctx.clearRect(0, 0, w, h);
    paintShell(ctx, R, wallKey, tier, t);
    var W = windowGeom(R, winKey, tier);
    paintWindow(ctx, R, W, winKey, tier, sky, t);
    paintFloor(ctx, R, floorKey, tier, sky);
    if (sky.sun > 0.05) {
      var u0 = (W.x - R.x0) / R.bw;
      var u1 = (W.x + W.w - R.x0) / R.bw;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      quad(ctx, [floorPt(R, u0, 0.02), floorPt(R, u1, 0.02), floorPt(R, u1 + 0.18, 0.9), floorPt(R, u0 + 0.18, 0.9)]);
      ctx.fillStyle = linear(ctx, 0, R.y1, 0, R.h, [[0, 'rgba(255, 236, 200,' + (sky.sun * (tier >= 4 ? 0.26 : 0.14)) + ')'], [1, 'rgba(255, 236, 200, 0)']]);
      ctx.fill();
      ctx.restore();
    }
    paintCurtains(ctx, R, W, winKey, tier, t);
    if (tier >= 3) wallArt(ctx, R, 0.5, 0.86, 0.18, 0.44, techKey, 0);
    if (tier >= 5) wallArt(ctx, R, 0.58, 0.8, 0.5, 0.62, techKey, 1);
    if (tier >= 6) paintFireplace(ctx, R, wallKey, t);
    paintRightWall(ctx, R, techKey, tier, t);
    paintSconces(ctx, R, lightKey, tier, lights, glow);
    paintClutter(ctx, R, tier);
    if (tier >= 1) {
      var bp = floorPt(R, 0.93, 0.1);
      paintPlant(ctx, bp[0], bp[1], R.bh * (tier >= 4 ? 0.46 : 0.34), techKey, t, 1);
    }
    paintRug(ctx, R, floorKey, tier);
    drawRoomSofa(ctx, R, softKey, tier, sky, t);
    paintFloorLamp(ctx, R, lightKey, tier, lights, glow);
    paintCoffee(ctx, R, techKey, tier, t);
    if (tier >= 5) {
      var fp = floorPt(R, 0.99, 0.8);
      paintPlant(ctx, fp[0] - R.u * 5, fp[1], R.bh * 0.52, techKey, t, 4);
    }
    paintPendant(ctx, R, tier >= 1 ? lightKey : 'raw', tier, t, lights, glow);
    var dusk = sky.night * (tier >= 4 ? 0.22 : 0.28);
    if (dusk > 0.01) {
      ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
        [0, 'rgba(8, 12, 28, ' + dusk + ')'],
        [0.38, 'rgba(8, 12, 28, ' + (dusk * 0.28) + ')'],
        [0.72, 'rgba(8, 12, 28, ' + (dusk * 0.06) + ')'],
        [1, 'rgba(8, 12, 28, 0)']
      ]);
      ctx.fillRect(0, 0, w, h);
    }
    var power = (tier >= 4 ? 0.34 : 0.22) + sky.night * 0.8;
    for (var i = 0; i < lights.length; i += 1) {
      var L = lights[i];
      glowAt(ctx, L.x, L.y, L.r, L.rgb, L.a * power * (0.92 + Math.sin(t * 2 + i) * 0.08));
    }
    if (sky.sun > 0.05) glowAt(ctx, W.x + W.w / 2, W.y + W.h * 0.6, Math.max(W.w, W.h) * 0.8, '255, 240, 214', sky.sun * 0.1);
    if (tier === 0) {
      ctx.fillStyle = 'rgba(60, 70, 82, 0.16)';
      ctx.fillRect(0, 0, w, h);
    }
    if (tier >= 4) {
      ctx.fillStyle = 'rgba(255, 196, 130, ' + (0.03 + (tier - 4) * 0.02) + ')';
      ctx.fillRect(0, 0, w, h);
    }
    if (tier >= 6) paintSparkles(ctx, R, t);
    ctx.fillStyle = radial(ctx, w / 2, h * 0.62, Math.min(w, h) * 0.55, Math.max(w, h) * 0.92, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,' + (tier >= 4 ? 0.16 : 0.1) + ')']]);
    ctx.fillRect(0, 0, w, h);
  }

  function catRect(w, h) {
    var R = makeRoom(w, h);
    var G = sofaGeom(R);
    var hh = G.bottom - G.top;
    return { x: G.x + G.w * 0.52, y: G.seat - hh * 0.3, w: G.w * 0.3, h: hh * 0.5 };
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
