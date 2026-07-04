/**
 * VOLT FIELD — dependency-free 3D particle lattice.
 *
 * A Three.js-style scene (point cloud + perspective camera projection +
 * slow Y-axis rotation) rendered to a 2D canvas, so the theme ships zero
 * external libraries. Points that project near each other are joined with
 * hairline "arc" segments, giving a live electrical-plexus backdrop. Scroll
 * position feeds the camera dolly for a subtle depth response.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('VoltField');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var FOV = 420;            // focal length of the virtual camera
  var DEPTH = 900;          // z-extent of the point cloud
  var COUNT = 90;           // particle count (kept light for mobile GPUs)
  var LINK_DIST = 130;      // max projected px distance to draw an arc
  var AMBER = '245, 158, 11';
  var TEAL = '34, 211, 238';

  var width = 0;
  var height = 0;
  var points = [];
  var angle = 0;
  var scrollDolly = 0;
  var rafId = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function seed() {
    points = [];
    for (var i = 0; i < COUNT; i++) {
      points.push({
        x: (Math.random() - 0.5) * width * 1.4,
        y: (Math.random() - 0.5) * height * 1.4,
        z: Math.random() * DEPTH,
        amber: Math.random() < 0.5
      });
    }
  }

  function project(p) {
    // rotate around the Y axis, then classic perspective divide
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var rx = p.x * cos - (p.z - DEPTH / 2) * sin;
    var rz = p.x * sin + (p.z - DEPTH / 2) * cos + DEPTH / 2;

    var z = ((rz + scrollDolly) % DEPTH + DEPTH) % DEPTH;
    var scale = FOV / (FOV + z);

    return {
      sx: width / 2 + rx * scale,
      sy: height / 2 + p.y * scale,
      scale: scale
    };
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    angle += 0.0012;
    scrollDolly = (window.scrollY || 0) * 0.15;

    var projected = [];
    for (var i = 0; i < points.length; i++) {
      var pr = project(points[i]);
      pr.amber = points[i].amber;
      projected.push(pr);

      var r = Math.max(0.4, 1.8 * pr.scale);
      ctx.beginPath();
      ctx.arc(pr.sx, pr.sy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + (pr.amber ? AMBER : TEAL) + ',' + (0.35 * pr.scale).toFixed(3) + ')';
      ctx.fill();
    }

    ctx.lineWidth = 0.5;
    for (var a = 0; a < projected.length; a++) {
      for (var b = a + 1; b < projected.length; b++) {
        var dx = projected[a].sx - projected[b].sx;
        var dy = projected[a].sy - projected[b].sy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          var alpha = (1 - dist / LINK_DIST) * 0.16 * Math.min(projected[a].scale, projected[b].scale);
          ctx.beginPath();
          ctx.moveTo(projected[a].sx, projected[a].sy);
          ctx.lineTo(projected[b].sx, projected[b].sy);
          ctx.strokeStyle = 'rgba(' + (projected[a].amber ? AMBER : TEAL) + ',' + alpha.toFixed(3) + ')';
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    resize();
    seed();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 150);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(frame);
    }
  });

  start();
})();
