/*!
 * AOCRv02 ― 頂点（線の端・交点・曲がり角）にもとづく、独自のOCR本体エンジン（試作）  v0.1
 * ------------------------------------------------------------------
 * 文字を細線（骨格）に直し、その「頂点」を見つけて、あらかじめ作った見本と照らし合わせて読みます。
 * Tesseract などの外部OCRには依存しません（単体のJavaScript）。
 *   ブラウザ：<script src="AOCRv02.js"></script> → window.AOCR2
 *   Node.js ：const AOCR2 = require('./AOCRv02.js')
 *
 *   const eng = AOCR2.create({ fonts: ['Noto Sans CJK JP', 'Yu Gothic'] });
 *   eng.buildTemplates();                       // 見本を作る（ひらがな・カタカナ・漢字）
 *   const c = eng.recognizeGlyph(canvas);       // 1文字
 *   const r = await eng.recognize(image);       // 1行〜複数行
 *
 * 試作です。読める範囲：日本語の活字（ひらがな・カタカナ・漢字）。英数字・手書きは未対応。
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) define([], factory);
  else if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AOCR2 = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var VERSION = '0.1', NAME = 'AOCRv02', S = 64;                  // S：正規化した文字の大きさ（ピクセル）

  /* ---------- 文字集合 ---------- */
  var HIRA = 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろわゐゑをんー';
  var KATA = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヰヱヲンヴ';
  function kanjiLevel1(n) {                                          // JIS第一水準の漢字（Nodeのみ。ブラウザでは opts.kanji で文字列を渡す）
    var out = '';
    try {
      var dec = new TextDecoder('shift_jis');
      for (var hi = 0x88; hi <= 0x9f && out.length < n; hi++) for (var lo = 0x40; lo <= 0xfc && out.length < n; lo++) {
        if (lo === 0x7f) continue; var ch = dec.decode(new Uint8Array([hi, lo]));
        if (ch.length === 1 && /[\u4e00-\u9fff]/.test(ch)) out += ch;
      }
    } catch (e) { }
    return out;
  }
  function scriptOf(ch) { return HIRA.indexOf(ch) >= 0 ? 'hira' : (KATA.indexOf(ch) >= 0 ? 'kata' : 'kanji'); }

  /* ---------- 画像の道具 ---------- */
  function makeCanvas(w, h, o) {
    if (o && o.createCanvas) return o.createCanvas(w, h);
    if (typeof document !== 'undefined') { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    throw new Error('AOCR2: canvasを作れません（opts.createCanvas を渡してください）');
  }
  function grayOf(canvas) {
    var w = canvas.width, h = canvas.height, d = canvas.getContext('2d').getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
    for (var i = 0, j = 0; i < g.length; i++, j += 4) { var a = d[j + 3] / 255; g[i] = (0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]) * a + 255 * (1 - a); }
    return { w: w, h: h, g: g };
  }
  function otsu(g) {
    var hist = new Float64Array(256), n = g.length, i; for (i = 0; i < n; i++) hist[Math.max(0, Math.min(255, g[i] | 0))]++;
    var sum = 0; for (i = 0; i < 256; i++) sum += i * hist[i];
    var sB = 0, wB = 0, best = 0, thr = 128;
    for (i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; var wF = n - wB; if (!wF) break; sB += i * hist[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; thr = i; } }
    return thr;
  }
  function resizeBin(bin, w, h, tw, th) {                           // 2値画像を面積平均で拡大縮小し、0.5で2値に戻す
    var out = new Uint8Array(tw * th), sx = w / tw, sy = h / th;
    for (var y = 0; y < th; y++) {
      var y0 = Math.floor(y * sy), y1 = Math.max(y0 + 1, Math.min(h, Math.ceil((y + 1) * sy)));
      for (var x = 0; x < tw; x++) {
        var x0 = Math.floor(x * sx), x1 = Math.max(x0 + 1, Math.min(w, Math.ceil((x + 1) * sx))), t = 0, n = 0;
        for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) { t += bin[yy * w + xx]; n++; }
        out[y * tw + x] = (t / n) >= 0.5 ? 1 : 0;
      }
    }
    return out;
  }
  function bboxOf(bin, w, h) {
    var x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (bin[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : { x0: x0, y0: y0, x1: x1 + 1, y1: y1 + 1 };
  }

  /* ---------- 細線化（Zhang-Suen） ---------- */
  function thin(bin, w, h) {
    var a = Uint8Array.from(bin), changed = true, del = [], x, y, i;
    function P(x, y) { return (x < 0 || y < 0 || x >= w || y >= h) ? 0 : a[y * w + x]; }
    while (changed) {
      changed = false;
      for (var step = 0; step < 2; step++) {
        del.length = 0;
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
          if (!a[y * w + x]) continue;
          var p2 = P(x, y - 1), p3 = P(x + 1, y - 1), p4 = P(x + 1, y), p5 = P(x + 1, y + 1), p6 = P(x, y + 1), p7 = P(x - 1, y + 1), p8 = P(x - 1, y), p9 = P(x - 1, y - 1);
          var B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
          var A = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2); if (A !== 1) continue;
          if (step === 0) { if (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) continue; } else { if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue; }
          del.push(y * w + x);
        }
        for (i = 0; i < del.length; i++) a[del[i]] = 0;
        if (del.length) changed = true;
      }
    }
    return a;
  }
  var NB = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  function nbCount(a, w, h, x, y) { var n = 0; for (var k = 0; k < 8; k++) { var xx = x + NB[k][0], yy = y + NB[k][1]; if (xx >= 0 && yy >= 0 && xx < w && yy < h && a[yy * w + xx]) n++; } return n; }
  function smallComponentsMask(sk, w, h, limit) {                  // 小さな独立部品（濁点・点など）の画素に印をつける
    var lab = new Int32Array(w * h).fill(-1), keep = new Uint8Array(w * h), i, k, n = 0, comps = 0;
    for (i = 0; i < w * h; i++) {
      if (!sk[i] || lab[i] >= 0) continue; var st = [i], members = [i]; lab[i] = n;
      while (st.length) { var c = st.pop(), cx = c % w, cy = (c - cx) / w; for (k = 0; k < 8; k++) { var xx = cx + NB[k][0], yy = cy + NB[k][1]; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var j = yy * w + xx; if (sk[j] && lab[j] < 0) { lab[j] = n; st.push(j); members.push(j); } } }
      if (members.length <= limit) members.forEach(function (m) { keep[m] = 1; }); n++; comps++;
    }
    return { keep: keep, comps: comps };
  }
  function pruneSpurs(sk, w, h, k) {                                 // 短い枝（ひげ）を取り除き、本物の枝の先だけを元に戻す
    var a = Uint8Array.from(sk), i, x, y, it, small = smallComponentsMask(sk, w, h, k * 3).keep;
    for (it = 0; it < k; it++) { var rm = []; for (y = 0; y < h; y++) for (x = 0; x < w; x++) if (a[y * w + x] && !small[y * w + x] && nbCount(a, w, h, x, y) <= 1) rm.push(y * w + x); if (!rm.length) break; rm.forEach(function (p) { a[p] = 0; }); }
    var front = []; for (y = 0; y < h; y++) for (x = 0; x < w; x++) if (a[y * w + x] && nbCount(a, w, h, x, y) <= 1) front.push([x, y]);
    for (it = 0; it < k; it++) {
      var nf = [];
      front.forEach(function (p) { for (var q = 0; q < 8; q++) { var xx = p[0] + NB[q][0], yy = p[1] + NB[q][1]; if (xx >= 0 && yy >= 0 && xx < w && yy < h && sk[yy * w + xx] && !a[yy * w + xx]) { a[yy * w + xx] = 1; nf.push([xx, yy]); } } });
      front = nf; if (!front.length) break;
    }
    return a;
  }

  /* ---------- 頂点の検知 ---------- */
  function rdp(pts, eps) {                                           // Ramer–Douglas–Peucker（折れ線の簡略化）
    if (pts.length < 3) return pts.slice();
    var a = pts[0], b = pts[pts.length - 1], dmax = 0, idx = 0, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    for (var i = 1; i < pts.length - 1; i++) { var d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L; if (d > dmax) { dmax = d; idx = i; } }
    if (dmax > eps) { var l = rdp(pts.slice(0, idx + 1), eps), r = rdp(pts.slice(idx), eps); return l.slice(0, -1).concat(r); }
    return [a, b];
  }
  function extractGraph(sk, w, h, opt) {
    var pix = [], idx = new Int32Array(w * h).fill(-1), x, y, i, k;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) if (sk[y * w + x]) { idx[y * w + x] = pix.length; pix.push([x, y]); }
    var RING = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    var deg = pix.map(function (p) {                               // 枝の数（周りを一周して、画素→背景→画素の切り替わる回数）。斜めの階段で交点を数えすぎないため
      var n = nbCount(sk, w, h, p[0], p[1]); if (n <= 1) return n;
      var t = 0; for (var q = 0; q < 8; q++) { var x1 = p[0] + RING[q][0], y1 = p[1] + RING[q][1], x2 = p[0] + RING[(q + 1) % 8][0], y2 = p[1] + RING[(q + 1) % 8][1];
        var v1 = (x1 >= 0 && y1 >= 0 && x1 < w && y1 < h) ? sk[y1 * w + x1] : 0, v2 = (x2 >= 0 && y2 >= 0 && x2 < w && y2 < h) ? sk[y2 * w + x2] : 0; if (!v1 && v2) t++; }
      return t;
    });
    // 交点：次数3以上の画素を連結でまとめて1つにする
    var jlab = new Int32Array(pix.length).fill(-1), nj = 0, jc = [];
    for (i = 0; i < pix.length; i++) {
      if (deg[i] < 3 || jlab[i] >= 0) continue;
      var st = [i], sx = 0, sy = 0, n = 0; jlab[i] = nj;
      while (st.length) { var c = st.pop(); sx += pix[c][0]; sy += pix[c][1]; n++; for (k = 0; k < 8; k++) { var xx = pix[c][0] + NB[k][0], yy = pix[c][1] + NB[k][1]; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var j = idx[yy * w + xx]; if (j >= 0 && deg[j] >= 3 && jlab[j] < 0) { jlab[j] = nj; st.push(j); } } }
      jc.push([sx / n, sy / n]); nj++;
    }
    var E = [], J = jc.map(function (c) { return [c[0], c[1]]; }), C = [], edges = [];
    for (i = 0; i < pix.length; i++) if (deg[i] === 1) E.push([pix[i][0], pix[i][1]]);
    // 経路をたどって、折れ線の曲がり角と辺を求める
    var seen = new Uint8Array(pix.length);
    function walk(start) {
      var path = [pix[start]], prev = -1, cur = start; seen[start] = 1;
      while (true) {
        var next = -1;
        for (k = 0; k < 8; k++) { var xx = pix[cur][0] + NB[k][0], yy = pix[cur][1] + NB[k][1]; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var j = idx[yy * w + xx]; if (j < 0 || j === prev || j === cur) continue; if (!seen[j] || (deg[j] >= 3 && j !== prev)) { next = j; if (!seen[j]) break; } }
        if (next < 0) break;
        path.push(pix[next]); if (deg[next] >= 3 || deg[next] === 1) { seen[next] = seen[next] || 1; break; }
        seen[next] = 1; prev = cur; cur = next;
      }
      return path;
    }
    var starts = []; for (i = 0; i < pix.length; i++) if (deg[i] === 1) starts.push(i);
    for (i = 0; i < pix.length; i++) if (deg[i] >= 3) for (k = 0; k < 8; k++) { var xx = pix[i][0] + NB[k][0], yy = pix[i][1] + NB[k][1]; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var j = idx[yy * w + xx]; if (j >= 0 && deg[j] === 2 && !seen[j]) starts.push(j); }
    // 輪だけの部品（端点も交点もない）も拾う
    var comp = new Int32Array(pix.length).fill(-1), nc = 0;
    for (i = 0; i < pix.length; i++) {
      if (comp[i] >= 0) continue; var st2 = [i], has = false; comp[i] = nc;
      while (st2.length) { var c2 = st2.pop(); if (deg[c2] !== 2) has = true; for (k = 0; k < 8; k++) { var x2 = pix[c2][0] + NB[k][0], y2 = pix[c2][1] + NB[k][1]; if (x2 < 0 || y2 < 0 || x2 >= w || y2 >= h) continue; var j2 = idx[y2 * w + x2]; if (j2 >= 0 && comp[j2] < 0) { comp[j2] = nc; st2.push(j2); } } }
      if (!has) starts.push(i); nc++;
    }
    var eps = opt.eps;
    starts.forEach(function (s) {
      if (seen[s] && deg[s] !== 1) return; if (deg[s] === 1 && seen[s]) return;
      var path = walk(s); if (path.length < 3) { if (path.length === 2) edges.push({ a: path[0], b: path[1], len: 1 }); return; }
      var simp = rdp(path, eps);
      for (var q = 1; q < simp.length - 1; q++) {
        var p0 = simp[q - 1], p1 = simp[q], p2 = simp[q + 1], v1x = p1[0] - p0[0], v1y = p1[1] - p0[1], v2x = p2[0] - p1[0], v2y = p2[1] - p1[1];
        var l1 = Math.sqrt(v1x * v1x + v1y * v1y), l2 = Math.sqrt(v2x * v2x + v2y * v2y); if (l1 < 3 || l2 < 3) continue;
        var cos = (v1x * v2x + v1y * v2y) / (l1 * l2); if (cos < Math.cos(opt.turnDeg * Math.PI / 180)) C.push([p1[0], p1[1]]);
      }
      for (var q2 = 0; q2 < simp.length - 1; q2++) edges.push({ a: simp[q2], b: simp[q2 + 1], len: Math.hypot(simp[q2 + 1][0] - simp[q2][0], simp[q2 + 1][1] - simp[q2][1]) });
    });
    return { E: E, J: J, C: C, edges: edges };
  }
  function holesOf(bin, w, h) {                                      // 輪の数（背景のうち、外とつながっていない部分の数）
    var lab = new Int32Array(w * h).fill(-1), n = 0, holes = 0, i, st, k;
    for (i = 0; i < w * h; i++) {
      if (bin[i] || lab[i] >= 0) continue; st = [i]; lab[i] = n; var border = false;
      while (st.length) { var c = st.pop(), cx = c % w, cy = (c - cx) / w; if (cx === 0 || cy === 0 || cx === w - 1 || cy === h - 1) border = true; for (k = 1; k < 8; k += 2) { var kk = [1, 3, 4, 6][(k - 1) >> 1]; var xx = cx + NB[kk][0], yy = cy + NB[kk][1]; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var j = yy * w + xx; if (!bin[j] && lab[j] < 0) { lab[j] = n; st.push(j); } } }
      if (!border) holes++; n++;
    }
    return holes;
  }

  /* ---------- 1文字の特徴 ---------- */
  function featuresOfBin(bin, w, h, opt) {
    opt = opt || {};
    var bb = bboxOf(bin, w, h); if (!bb) return null;
    var bw = bb.x1 - bb.x0, bh = bb.y1 - bb.y0, sc = (S - 8) / Math.max(bw, bh), tw = Math.max(3, Math.round(bw * sc)), th = Math.max(3, Math.round(bh * sc));
    var crop = new Uint8Array(bw * bh); for (var y = 0; y < bh; y++) for (var x = 0; x < bw; x++) crop[y * bw + x] = bin[(y + bb.y0) * w + x + bb.x0];
    var rs = resizeBin(crop, bw, bh, tw, th), W = tw + 8, H = th + 8, pad = new Uint8Array(W * H);
    for (y = 0; y < th; y++) for (x = 0; x < tw; x++) pad[(y + 4) * W + x + 4] = rs[y * tw + x];
    var holes = holesOf(pad, W, H), sk = thin(pad, W, H), spur = Math.round(S * 0.07);
    sk = pruneSpurs(sk, W, H, spur);
    var g = extractGraph(sk, W, H, { eps: S * 0.045, turnDeg: opt.turnDeg || 38 });
    var nx = function (p) { return [(p[0] - 4) / Math.max(1, tw - 1), (p[1] - 4) / Math.max(1, th - 1)]; };
    var ncomp = smallComponentsMask(sk, W, H, 0).comps;
    var f = { ncomp: ncomp, E: g.E.map(nx), J: g.J.map(nx), C: g.C.map(nx), holes: holes, aspect: bw / bh,
      edges: g.edges.map(function (e) { var a = nx(e.a), b = nx(e.b); return { mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2, th: Math.atan2(b[1] - a[1], b[0] - a[0]), len: e.len / S }; }) };
    return f;
  }
  function dedupe(list, r) {                                         // 近すぎる頂点を1つにまとめる
    var out = []; list.forEach(function (p) { for (var i = 0; i < out.length; i++) if (Math.hypot(out[i][0] - p[0], out[i][1] - p[1]) < r) return; out.push(p); }); return out;
  }
  function setDist(A, B) {
    if (!A.length && !B.length) return 0; if (!A.length || !B.length) return 0.45;
    var s = 0, i, j, m;
    for (i = 0; i < A.length; i++) { m = 9; for (j = 0; j < B.length; j++) { var d = Math.hypot(A[i][0] - B[j][0], A[i][1] - B[j][1]); if (d < m) m = d; } s += m; }
    for (j = 0; j < B.length; j++) { m = 9; for (i = 0; i < A.length; i++) { var d2 = Math.hypot(A[i][0] - B[j][0], A[i][1] - B[j][1]); if (d2 < m) m = d2; } s += m; }
    return s / (A.length + B.length);
  }
  function edgeDist(A, B) {                                          // 辺の（位置・向き）のずれ。向きは 180° 反転を同一視
    if (!A.length && !B.length) return 0; if (!A.length || !B.length) return 0.6;
    function d(a, b) { var dt = Math.abs(a.th - b.th) % Math.PI; if (dt > Math.PI / 2) dt = Math.PI - dt; return Math.hypot(a.mx - b.mx, a.my - b.my) + 0.25 * dt; }
    var s = 0, w = 0, i, j, m;
    for (i = 0; i < A.length; i++) { m = 9; for (j = 0; j < B.length; j++) { var v = d(A[i], B[j]); if (v < m) m = v; } s += m * (0.3 + A[i].len); w += 0.3 + A[i].len; }
    for (j = 0; j < B.length; j++) { m = 9; for (i = 0; i < A.length; i++) { var v2 = d(A[i], B[j]); if (v2 < m) m = v2; } s += m * (0.3 + B[j].len); w += 0.3 + B[j].len; }
    return s / w;
  }
  function distance(a, b, mode) {
    var d = 0;
    d += 1.0 * setDist(a.E, b.E) + 1.0 * setDist(a.J, b.J) + 0.8 * setDist(a.C, b.C);
    d += 0.07 * (Math.abs(a.E.length - b.E.length) + Math.abs(a.J.length - b.J.length) + 0.6 * Math.abs(a.C.length - b.C.length));
    d += 0.35 * Math.abs(a.holes - b.holes) + 0.3 * Math.abs((a.ncomp || 1) - (b.ncomp || 1));
    d += 0.25 * Math.abs(Math.log(a.aspect / b.aspect));
    if (mode !== 'vertex') d += 1.2 * edgeDist(a.edges, b.edges);
    return d;
  }
  function tidy(f) { f.E = dedupe(f.E, 0.03); f.C = dedupe(f.C, 0.05); f.J = dedupe(f.J, 0.05); return f; }

  /* ---------- エンジン ---------- */
  function create(options) {
    options = options || {};
    var fonts = options.fonts || ['Noto Sans CJK JP', 'Noto Serif CJK JP', 'sans-serif'], templates = [], co = { createCanvas: options.createCanvas };
    var mode = options.mode || 'full';

    function glyphToBin(canvas) {
      var G = grayOf(canvas), thr = otsu(G.g), dark = 0, n = G.g.length, bin = new Uint8Array(n), i;
      for (i = 0; i < n; i++) if (G.g[i] < thr) dark++;
      var inv = dark > n / 2;                                       // 暗い画素が過半なら、白文字とみなして反転
      for (i = 0; i < n; i++) bin[i] = (G.g[i] < thr) !== inv ? 1 : 0;
      return { bin: bin, w: G.w, h: G.h };
    }
    function featuresOfCanvas(canvas) {
      var b = glyphToBin(canvas), f = featuresOfBin(b.bin, b.w, b.h, options); return f ? tidy(f) : null;
    }
    function renderChar(ch, font, size, weight) {
      var W = Math.round(size * 1.6), c = makeCanvas(W, W, co), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, W); x.fillStyle = '#000'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = (weight || 'normal') + ' ' + size + 'px "' + font + '"'; x.fillText(ch, W / 2, W / 2 + size * 0.04); return c;
    }
    function buildTemplates(o) {
      o = o || {}; templates = [];
      var kanjiStr = o.kanji != null ? o.kanji : kanjiLevel1(o.kanjiCount != null ? o.kanjiCount : 1000);
      var set = (o.hira !== false ? HIRA : '') + (o.kata !== false ? KATA : '') + kanjiStr, seenCh = {};
      Array.from(set).forEach(function (ch) {
        if (seenCh[ch]) return; seenCh[ch] = 1;
        fonts.forEach(function (fn) { var f = featuresOfCanvas(renderChar(ch, fn, o.size || 120, o.weight)); if (f) templates.push({ ch: ch, script: scriptOf(ch), font: fn, f: f }); });
      });
      return templates.length;
    }
    function recognizeFeatures(f, k) {
      var best = {}, i;
      for (i = 0; i < templates.length; i++) { var t = templates[i], d = distance(f, t.f, mode); if (best[t.ch] === undefined || d < best[t.ch].d) best[t.ch] = { ch: t.ch, script: t.script, d: d }; }
      var arr = Object.keys(best).map(function (c) { return best[c]; }).sort(function (a, b) { return a.d - b.d; }).slice(0, k || 5);
      var script = {}; arr.slice(0, 3).forEach(function (a, ix) { script[a.script] = (script[a.script] || 0) + (3 - ix); });
      var sc = Object.keys(script).sort(function (a, b) { return script[b] - script[a]; })[0];
      return { candidates: arr, script: sc, ch: arr[0] ? arr[0].ch : '', distance: arr[0] ? arr[0].d : 9 };
    }
    function recognizeGlyph(canvas, k) {
      var f = featuresOfCanvas(canvas); if (!f) return null;
      var r = recognizeFeatures(f, k); r.features = { E: f.E.length, J: f.J.length, C: f.C.length, holes: f.holes }; r.vertices = f; return r;
    }

    /* ----- 行の読み取り ----- */
    async function toCanvas(src) {
      if (src && typeof src.getContext === 'function') return src;
      if (options.loadImage) { var im = await options.loadImage(src); var c = makeCanvas(im.width, im.height, co), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0); return c; }
      throw new Error('AOCR2: 画像を読み込めません');
    }
    function components(bin, w, h) {
      var lab = new Int32Array(w * h).fill(-1), comps = [], i, k;
      for (i = 0; i < w * h; i++) {
        if (!bin[i] || lab[i] >= 0) continue; var st = [i], x0 = w, y0 = h, x1 = 0, y1 = 0, n = 0; lab[i] = comps.length;
        while (st.length) { var c = st.pop(), cx = c % w, cy = (c - cx) / w; n++; if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy; for (k = 0; k < 8; k++) { var xx = cx + NB[k][0], yy = cy + NB[k][1]; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var j = yy * w + xx; if (bin[j] && lab[j] < 0) { lab[j] = comps.length; st.push(j); } } }
        comps.push({ x0: x0, y0: y0, x1: x1 + 1, y1: y1 + 1, n: n });
      }
      return comps.filter(function (c) { return c.n >= 4; });
    }
    async function recognize(image, opts) {
      opts = opts || {}; var canvas = await toCanvas(image), b = glyphToBin(canvas), w = b.w, h = b.h, bin = b.bin;
      // 行：横方向の投影で分ける
      var rows = new Float32Array(h), y, x; for (y = 0; y < h; y++) { var s = 0; for (x = 0; x < w; x++) s += bin[y * w + x]; rows[y] = s; }
      var bands = [], inb = false, st = 0; for (y = 0; y <= h; y++) { var on = y < h && rows[y] > 0; if (on && !inb) { st = y; inb = true; } if (!on && inb) { bands.push([st, y]); inb = false; } }
      var hs = bands.map(function (q) { return q[1] - q[0]; }).sort(function (a, c) { return a - c; }), med = hs.length ? hs[hs.length >> 1] : 0;
      bands = bands.filter(function (q) { return q[1] - q[0] >= med * 0.45; });
      var lines = [];
      for (var bi = 0; bi < bands.length; bi++) {
        var y0 = bands[bi][0], y1 = bands[bi][1], lh = y1 - y0, sub = bin.subarray(y0 * w, y1 * w), comps = components(sub, w, lh).sort(function (p, q) { return p.x0 - q.x0; });
        var cell = Math.max(lh, med), groups = [], cur = null;
        comps.forEach(function (c) {                                // 文字幅（行の高さ）以内に収まる部品を、1文字にまとめる
          if (cur && (Math.max(cur.x1, c.x1) - cur.x0) <= cell * 1.08 && c.x0 - cur.x1 <= cell * 0.28) { cur.x1 = Math.max(cur.x1, c.x1); cur.y0 = Math.min(cur.y0, c.y0); cur.y1 = Math.max(cur.y1, c.y1); }
          else { cur = { x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1 }; groups.push(cur); }
        });
        var chars = groups.map(function (g) {
          var gw = g.x1 - g.x0, gh = g.y1 - g.y0, cb = new Uint8Array(gw * gh);
          for (var yy = 0; yy < gh; yy++) for (var xx = 0; xx < gw; xx++) cb[yy * gw + xx] = sub[(yy + g.y0) * w + xx + g.x0];
          var small = gw < cell * 0.45 && gh < cell * 0.45;         // 、。・などの小さな記号
          if (small) return { ch: gw > gh * 2.2 ? 'ー' : '、', conf: 0.2, bbox: { x0: g.x0, y0: g.y0 + y0, x1: g.x1, y1: g.y1 + y0 }, symbol: true };
          var f = featuresOfBin(cb, gw, gh, options); if (!f) return null; tidy(f);
          var r = recognizeFeatures(f, 3);
          return { ch: r.ch, script: r.script, candidates: r.candidates, conf: Math.max(0, 1 - r.distance), distance: r.distance, bbox: { x0: g.x0, y0: g.y0 + y0, x1: g.x1, y1: g.y1 + y0 } };
        }).filter(Boolean);
        lines.push({ text: chars.map(function (c) { return c.ch; }).join(''), chars: chars, bbox: { x0: chars.length ? chars[0].bbox.x0 : 0, y0: y0, x1: chars.length ? chars[chars.length - 1].bbox.x1 : 0, y1: y1 } });
      }
      return { engine: NAME, version: VERSION, text: lines.map(function (l) { return l.text; }).join('\n'), lines: lines };
    }
    return { buildTemplates: buildTemplates, recognizeGlyph: recognizeGlyph, recognize: recognize, featuresOfCanvas: featuresOfCanvas, renderChar: renderChar,
      get templates() { return templates; }, setMode: function (m) { mode = m; }, version: VERSION, name: NAME };
  }
  return { name: NAME, version: VERSION, create: create, scriptOf: scriptOf, charsets: { HIRA: HIRA, KATA: KATA, kanjiLevel1: kanjiLevel1 } };
});
