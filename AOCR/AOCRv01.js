/*!
 * AOCRv01  ― 読みノート発の独自OCRエンジン  v0.1
 * ------------------------------------------------------------------
 * どのアプリでも使える、単体のJavaScriptです（読みノートに依存しません）。
 *   ブラウザ：<script src="AOCRv01.js"></script> → window.AOCR
 *   Node.js ：const AOCR = require('./AOCRv01.js')
 *   ES module / AMD からも読み込めます（UMD）。
 *
 * 使い方（最小）
 *   const engine = AOCR.create({ lang: 'jpn+eng' });
 *   const r = await engine.recognize(canvasOrImageOrBlobOrDataURL, { mode: 'balanced' });
 *   console.log(r.text, r.confidence, r.words);
 *   await engine.dispose();
 *
 * 認識そのものは Tesseract.js（別途読み込み）を使い、その前後を AOCR が受け持ちます。
 * ここで Tesseract.js を内蔵はしません。window.Tesseract があれば自動で使い、
 * 無ければ CDN から読み込みます。Node では opts.tesseract に require('tesseract.js') を渡します。
 *
 * 詳細な設計の説明は、公開していません。
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) define([], factory);
  else if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AOCR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var VERSION = '0.1';
  var NAME = 'AOCRv01';

  /* ================= 基本の道具 ================= */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function median(a) { if (!a.length) return 0; var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function mean(a) { if (!a.length) return 0; var t = 0; for (var i = 0; i < a.length; i++) t += a[i]; return t / a.length; }
  function now() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }

  function makeCanvas(w, h, o) {
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    if (o && o.createCanvas) return o.createCanvas(w, h);
    if (typeof document !== 'undefined') { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    throw new Error('AOCR: canvasを作れません（Nodeでは opts.createCanvas を渡してください）');
  }
  function isCanvasLike(x) { return x && typeof x.getContext === 'function' && x.width > 0; }

  async function loadImageSource(src, o) {
    if (o && o.loadImage) return o.loadImage(src);
    if (typeof Image !== 'undefined') {
      return new Promise(function (res, rej) {
        var img = new Image(); img.onload = function () { res(img); }; img.onerror = function () { rej(new Error('AOCR: 画像を読み込めません')); };
        if (typeof Blob !== 'undefined' && src instanceof Blob) img.src = URL.createObjectURL(src); else img.src = src;
      });
    }
    throw new Error('AOCR: 画像を読み込めません（Nodeでは opts.loadImage を渡してください）');
  }

  async function toCanvas(src, o) {
    if (isCanvasLike(src)) return src;
    if (src && src.data && src.width && src.height && typeof src.data.length === 'number' && !src.getContext) { // ImageData
      var c0 = makeCanvas(src.width, src.height, o); var x0 = c0.getContext('2d');
      if (typeof ImageData !== 'undefined' && src instanceof ImageData) x0.putImageData(src, 0, 0);
      else { var id = x0.createImageData(src.width, src.height); id.data.set(src.data); x0.putImageData(id, 0, 0); }
      return c0;
    }
    var img = (typeof ImageBitmap !== 'undefined' && src instanceof ImageBitmap) ? src : await loadImageSource(src, o);
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    var c = makeCanvas(w, h, o); var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0);
    return c;
  }

  function getGray(canvas) {
    var w = canvas.width, h = canvas.height, d = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    var g = new Uint8ClampedArray(w * h);
    for (var i = 0, j = 0; i < g.length; i++, j += 4) {
      var a = d[j + 3] / 255;                                   // 透明部分は白として扱う
      var v = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
      g[i] = v * a + 255 * (1 - a);
    }
    return { w: w, h: h, g: g };
  }
  function grayToCanvas(G, o) {
    var c = makeCanvas(G.w, G.h, o), ctx = c.getContext('2d'), id = ctx.createImageData(G.w, G.h), d = id.data;
    for (var i = 0, j = 0; i < G.g.length; i++, j += 4) { d[j] = d[j + 1] = d[j + 2] = G.g[i]; d[j + 3] = 255; }
    ctx.putImageData(id, 0, 0); return c;
  }
  function resizeCanvas(src, w, h, o) {
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    var c = makeCanvas(w, h, o), ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (e) { }
    ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h); return c;
  }
  function resizeGray(G, w, h) {                                // 面積平均（縮小）／双一次（拡大）
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    var out = new Float32Array(w * h), sx = G.w / w, sy = G.h / h;
    if (sx >= 1 && sy >= 1) {
      for (var y = 0; y < h; y++) {
        var y0 = Math.floor(y * sy), y1 = Math.max(y0 + 1, Math.min(G.h, Math.floor((y + 1) * sy)));
        for (var x = 0; x < w; x++) {
          var x0 = Math.floor(x * sx), x1 = Math.max(x0 + 1, Math.min(G.w, Math.floor((x + 1) * sx))), t = 0, n = 0;
          for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) { t += G.g[yy * G.w + xx]; n++; }
          out[y * w + x] = t / n;
        }
      }
    } else {
      for (var y2 = 0; y2 < h; y2++) {
        var fy = clamp((y2 + 0.5) * sy - 0.5, 0, G.h - 1), iy = Math.floor(fy), ty = fy - iy, iy2 = Math.min(G.h - 1, iy + 1);
        for (var x2 = 0; x2 < w; x2++) {
          var fx = clamp((x2 + 0.5) * sx - 0.5, 0, G.w - 1), ix = Math.floor(fx), tx = fx - ix, ix2 = Math.min(G.w - 1, ix + 1);
          var a = G.g[iy * G.w + ix] * (1 - tx) + G.g[iy * G.w + ix2] * tx, b = G.g[iy2 * G.w + ix] * (1 - tx) + G.g[iy2 * G.w + ix2] * tx;
          out[y2 * w + x2] = a * (1 - ty) + b * ty;
        }
      }
    }
    return { w: w, h: h, g: out };
  }
  function percentile(g, p, step) {
    var hist = new Uint32Array(256), n = 0; step = step || 1;
    for (var i = 0; i < g.length; i += step) { hist[g[i] | 0]++; n++; }
    var t = n * p / 100, c = 0; for (var v = 0; v < 256; v++) { c += hist[v]; if (c >= t) return v; }
    return 255;
  }

  /* ================= 画像の診断 ================= */
  function analyze(canvas) {
    var G0 = getGray(canvas), long = Math.max(G0.w, G0.h), f = Math.min(1, 800 / long);
    var G = f < 1 ? resizeGray(G0, G0.w * f, G0.h * f) : G0;
    var w = G.w, h = G.h, g = G.g;
    var p5 = percentile(g, 5), p50 = percentile(g, 50), p95 = percentile(g, 95);
    var darkBg = p50 < 110;
    // 紙の明るさのムラ：8×8マスごとの明るい側(上位20%)を比べる
    var gx = 8, gy = 8, vals = [];
    for (var by = 0; by < gy; by++) for (var bx = 0; bx < gx; bx++) {
      var xs = Math.floor(bx * w / gx), xe = Math.floor((bx + 1) * w / gx), ys = Math.floor(by * h / gy), ye = Math.floor((by + 1) * h / gy), arr = [];
      for (var y = ys; y < ye; y += 2) for (var x = xs; x < xe; x += 2) arr.push(g[y * w + x]);
      arr.sort(function (a, b) { return a - b; }); vals.push(arr.length ? arr[Math.floor(arr.length * 0.8)] : 255);
    }
    var vmin = Math.min.apply(null, vals), vmax = Math.max.apply(null, vals);
    var unevenness = darkBg ? 0 : (vmax - vmin) / 255;
    // ノイズ：紙の部分（明るい画素）の、隣との差の平均
    var diffs = 0, cnt = 0, thr = p95 - 25;
    for (var yy = 1; yy < h - 1; yy += 2) for (var xx = 1; xx < w - 1; xx += 2) {
      var v = g[yy * w + xx]; if (v < thr) continue;
      diffs += Math.abs(v - g[yy * w + xx + 1]) + Math.abs(v - g[(yy + 1) * w + xx]); cnt += 2;
    }
    var noise = cnt ? diffs / cnt : 0;
    // 文字の量：暗い画素の割合
    var dark = 0, tot = 0, tcut = (p5 + p95) / 2;
    for (var i = 0; i < g.length; i += 3) { tot++; if (g[i] < tcut) dark++; }
    // 鮮明さ：暗い画素の周りの勾配の強さ
    var gs = 0, gn = 0;
    for (var y3 = 1; y3 < h - 1; y3 += 2) for (var x3 = 1; x3 < w - 1; x3 += 2) {
      var gxv = Math.abs(g[y3 * w + x3 + 1] - g[y3 * w + x3 - 1]), gyv = Math.abs(g[(y3 + 1) * w + x3] - g[(y3 - 1) * w + x3]);
      var m = gxv + gyv; if (m > 40) { gs += m; gn++; }
    }
    return { width: G0.w, height: G0.h, contrast: (p95 - p5) / 255, unevenness: unevenness, noise: noise, textDensity: tot ? dark / tot : 0,
      sharpness: gn ? gs / gn / 255 : 0, darkBackground: darkBg, paper: p95 };
  }

  /* ================= 前処理 ================= */
  function stretchGray(G) {                                       // パーセンタイル伸長（従来方式と同じ考え方）
    var lo = percentile(G.g, 1, 3), hi = percentile(G.g, 99, 3); if (hi - lo < 20) { lo = 0; hi = 255; }
    var out = new Uint8ClampedArray(G.g.length), k = 255 / (hi - lo);
    for (var i = 0; i < out.length; i++) out[i] = (G.g[i] - lo) * k;
    return { w: G.w, h: G.h, g: out };
  }
  function invertGray(G) { var o = new Uint8ClampedArray(G.g.length); for (var i = 0; i < o.length; i++) o[i] = 255 - G.g[i]; return { w: G.w, h: G.h, g: o }; }
  function maxFilter(src, w, h, r) {
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, k, m;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { m = 0; for (k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) if (src[y * w + k] > m) m = src[y * w + k]; tmp[y * w + x] = m; }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { m = 0; for (k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) if (tmp[k * w + x] > m) m = tmp[k * w + x]; out[y * w + x] = m; }
    return out;
  }
  function boxBlur(src, w, h, r) {
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, k, t, n;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { t = 0; n = 0; for (k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) { t += src[y * w + k]; n++; } tmp[y * w + x] = t / n; }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { t = 0; n = 0; for (k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { t += tmp[k * w + x]; n++; } out[y * w + x] = t / n; }
    return out;
  }
  function shadingCorrect(G) {                                    // 紙の明るさのムラを平らにする
    var f = Math.max(1, Math.round(Math.max(G.w, G.h) / 160)), sw = Math.max(8, Math.round(G.w / f)), sh = Math.max(8, Math.round(G.h / f));
    var S = resizeGray(G, sw, sh), bg = boxBlur(maxFilter(S.g, sw, sh, 3), sw, sh, 3);
    var out = new Uint8ClampedArray(G.w * G.h);
    for (var y = 0; y < G.h; y++) {
      var fy = clamp((y + 0.5) / G.h * sh - 0.5, 0, sh - 1), iy = Math.floor(fy), ty = fy - iy, iy2 = Math.min(sh - 1, iy + 1);
      for (var x = 0; x < G.w; x++) {
        var fx = clamp((x + 0.5) / G.w * sw - 0.5, 0, sw - 1), ix = Math.floor(fx), tx = fx - ix, ix2 = Math.min(sw - 1, ix + 1);
        var b = (bg[iy * sw + ix] * (1 - tx) + bg[iy * sw + ix2] * tx) * (1 - ty) + (bg[iy2 * sw + ix] * (1 - tx) + bg[iy2 * sw + ix2] * tx) * ty;
        out[y * G.w + x] = clamp(G.g[y * G.w + x] * 255 / Math.max(40, b), 0, 255);
      }
    }
    return { w: G.w, h: G.h, g: out };
  }
  function sauvola(G, win, k) {                                   // 局所しきい値（積分画像）
    var w = G.w, h = G.h, r = win >> 1, I = new Float64Array((w + 1) * (h + 1)), I2 = new Float64Array((w + 1) * (h + 1)), x, y;
    for (y = 0; y < h; y++) { var rs = 0, rs2 = 0; for (x = 0; x < w; x++) { var v = G.g[y * w + x]; rs += v; rs2 += v * v; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + rs; I2[(y + 1) * (w + 1) + x + 1] = I2[y * (w + 1) + x + 1] + rs2; } }
    var out = new Uint8ClampedArray(w * h);
    for (y = 0; y < h; y++) {
      var y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
      for (x = 0; x < w; x++) {
        var x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), n = (x1 - x0) * (y1 - y0);
        var s = I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0];
        var s2 = I2[y1 * (w + 1) + x1] - I2[y0 * (w + 1) + x1] - I2[y1 * (w + 1) + x0] + I2[y0 * (w + 1) + x0];
        var m = s / n, sd = Math.sqrt(Math.max(0, s2 / n - m * m)), t = m * (1 + k * (sd / 128 - 1));
        out[y * w + x] = G.g[y * w + x] > t ? 255 : 0;
      }
    }
    return { w: w, h: h, g: out };
  }
  function estimateSkew(G) {                                      // 水平方向の投影の鋭さで、傾きを推定（度）
    var f = Math.min(1, 640 / Math.max(G.w, G.h)), S = f < 1 ? resizeGray(G, G.w * f, G.h * f) : { w: G.w, h: G.h, g: G.g };
    var cut = percentile(S.g, 20), pts = [];
    for (var y = 0; y < S.h; y++) for (var x = 0; x < S.w; x++) if (S.g[y * S.w + x] <= cut) pts.push(x, y);
    if (pts.length < 400) return { angle: 0, gain: 0 };
    var cx = S.w / 2, cy = S.h / 2;
    function score(deg) {
      var rad = deg * Math.PI / 180, s = Math.sin(rad), c = Math.cos(rad), bins = new Float32Array(S.h * 2), i, yy;
      for (i = 0; i < pts.length; i += 2) { yy = Math.round((pts[i + 1] - cy) * c - (pts[i] - cx) * s + S.h); if (yy >= 0 && yy < bins.length) bins[yy]++; }
      var m = 0, v = 0; for (i = 0; i < bins.length; i++) m += bins[i]; m /= bins.length;
      for (i = 0; i < bins.length; i++) v += (bins[i] - m) * (bins[i] - m); return v;
    }
    var best = 0, bs = score(0), zero = bs, a;
    for (a = -5; a <= 5.001; a += 0.5) { var sc = score(a); if (sc > bs) { bs = sc; best = a; } }
    var c2 = best; for (a = c2 - 0.5; a <= c2 + 0.501; a += 0.1) { var s2 = score(a); if (s2 > bs) { bs = s2; best = a; } }
    return { angle: best, gain: zero > 0 ? bs / zero - 1 : 0 };
  }
  function rotateCanvas(canvas, deg, o) {
    var rad = deg * Math.PI / 180, w = canvas.width, h = canvas.height, c = makeCanvas(w, h, o), ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.translate(w / 2, h / 2); ctx.rotate(rad); ctx.drawImage(canvas, -w / 2, -h / 2); return c;
  }

  /* ================= 日本語の文章の整え ================= */
  var CJK = '\\u3000-\\u303f\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uff00-\\uffef';
  var RE_CJK_SP = new RegExp('([' + CJK + '])[ \\t\\u00a0]+(?=[' + CJK + '])', 'g');
  var RE_CJK_ASCII = new RegExp('([' + CJK + '])[ \\t\\u00a0]+(?=[A-Za-z0-9(\\[{=+\\-])', 'g');
  var RE_ASCII_CJK = new RegExp('([A-Za-z0-9)\\]}=+\\-.])[ \\t\\u00a0]+(?=[' + CJK + '])', 'g');
  function isCJKchar(ch) { return !!ch && new RegExp('[' + CJK + ']').test(ch); }
  function cleanText(s, o) {
    o = o || {}; if (!s) return '';
    var t = String(s).replace(/\r/g, '');
    if (o.cjkSpaces !== false) { t = t.replace(RE_CJK_SP, '$1').replace(RE_CJK_ASCII, '$1').replace(RE_ASCII_CJK, '$1'); }
    if (o.digitFix !== false) {                                    // 数字に挟まれた O/o/l/I は 0/1 の読み間違いとみなす
      t = t.replace(/(\d)[Oo](?=\d)/g, '$10').replace(/(\d)[lI](?=\d)/g, '$11');
    }
    if (o.science !== false) {                                    // 理科・数学のプリントで多い読み間違いの補正（記号の形が似ているもの）
      t = t.replace(/(\d)[ \t]*["'\u2019\u201d*%\u00ba\u02da][ \t]*C(?![A-Za-z])/g, '$1\u2103');   // 20"C 20*C 20%C → 20℃
      t = t.replace(/(^|[^A-Za-z])H20(?![0-9])/g, '$1H2O').replace(/(^|[^A-Za-z])C02(?![0-9])/g, '$1CO2');
      t = t.replace(/(\+[ \t]*)02(?![0-9])/g, '$1O2');
    }
    t = t.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    return t.trim();
  }
  function joinWords(words) {
    var out = '';
    for (var i = 0; i < words.length; i++) {
      var tx = words[i].text; if (!tx) continue;
      if (out) { var a = out.charAt(out.length - 1), b = tx.charAt(0); out += (isCJKchar(a) || isCJKchar(b)) ? '' : ' '; }
      out += tx;
    }
    return out;
  }
  function symbolDensity(t) { if (!t) return 0; var m = t.match(/[^A-Za-z\u3040-\u30ff\u3400-\u9fff\s]/g); return m ? m.length / t.length : 0; }

  /* ================= Tesseract の取り扱い ================= */
  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = res; s.onerror = function () { rej(new Error('load fail ' + src)); }; document.head.appendChild(s); });
  }
  async function ensureTesseract(o) {
    if (o && o.tesseract) return o.tesseract;
    var g = (typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : {}));
    if (g.Tesseract) return g.Tesseract;
    if (typeof document === 'undefined') throw new Error('AOCR: Tesseract.js が見つかりません（opts.tesseract に渡してください）');
    var urls = ['https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js'];
    for (var i = 0; i < urls.length; i++) { try { await loadScript(urls[i]); if (g.Tesseract) return g.Tesseract; } catch (e) { } }
    throw new Error('AOCR: Tesseract.js を読み込めませんでした');
  }
  function toRecognizable(canvas) {
    if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) return canvas;
    if (canvas.toBuffer) return canvas.toBuffer('image/png');
    if (canvas.toDataURL) return canvas.toDataURL('image/png');
    throw new Error('AOCR: canvasを認識に渡せる形にできません');
  }
  function extractWords(data) {
    var ws = data.words;
    if (!ws || !ws.length) {
      ws = [];
      (data.blocks || []).forEach(function (b) { (b.paragraphs || []).forEach(function (p) { (p.lines || []).forEach(function (l) { (l.words || []).forEach(function (w) { ws.push(w); }); }); }); });
    }
    return ws.filter(function (w) { return w && w.text && String(w.text).trim() && w.bbox; }).map(function (w) {
      return { text: String(w.text).trim(), conf: w.confidence == null ? 0 : w.confidence, bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 } };
    });
  }

  /* ================= 結果の統合（単語ごとの投票） ================= */
  function normText(t) { return String(t).replace(/\s+/g, '').normalize ? String(t).replace(/\s+/g, '').normalize('NFKC').toLowerCase() : String(t).replace(/\s+/g, '').toLowerCase(); }
  function center(b) { return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; }
  function inside(pt, b, pad) { return pt[0] >= b.x0 - pad && pt[0] <= b.x1 + pad && pt[1] >= b.y0 - pad && pt[1] <= b.y1 + pad; }
  function iou(a, b) {
    var x0 = Math.max(a.x0, b.x0), y0 = Math.max(a.y0, b.y0), x1 = Math.min(a.x1, b.x1), y1 = Math.min(a.y1, b.y1);
    var i = Math.max(0, x1 - x0) * Math.max(0, y1 - y0), u = (a.x1 - a.x0) * (a.y1 - a.y0) + (b.x1 - b.x0) * (b.y1 - b.y0) - i; return u > 0 ? i / u : 0;
  }
  function fuse(base, others, opt) {
    var used = others.map(function (p) { return new Array(p.words.length).fill(false); });
    var out = [], replaced = 0, agreed = 0, total = base.words.length;
    base.words.forEach(function (b) {
      var cands = [{ t: b.text, c: b.conf, w: 0, src: base.name }];
      var h = b.bbox.y1 - b.bbox.y0, pad = Math.max(1, h * 0.1);
      others.forEach(function (p, pi) {
        var group = [];
        p.words.forEach(function (o, oi) { if (!used[pi][oi] && inside(center(o.bbox), b.bbox, pad)) group.push([o, oi]); });
        if (!group.length) return;
        group.sort(function (a, c) { return a[0].bbox.x0 - c[0].bbox.x0; });
        var gx0 = group[0][0].bbox.x0, gx1 = group[group.length - 1][0].bbox.x1, wb = b.bbox.x1 - b.bbox.x0, wg = gx1 - gx0;
        if (wg < wb * 0.5 || wg > wb * 1.8) return;                // 範囲がずれすぎるものは別物とみなす
        group.forEach(function (g) { used[pi][g[1]] = true; });
        cands.push({ t: group.map(function (g) { return g[0].text; }).join(''), c: mean(group.map(function (g) { return g[0].conf; })), w: p.weight || 0, src: p.name });
      });
      var votes = {};
      cands.forEach(function (c) { var k = normText(c.t); votes[k] = (votes[k] || 0) + 1; });
      var best = null, bestScore = -1e9;
      cands.forEach(function (c) {
        var s = c.c - c.w + (opt.agreeBonus || 8) * (votes[normText(c.t)] - 1);
        if (s > bestScore) { bestScore = s; best = c; }
      });
      var baseScore = cands[0].c + (opt.agreeBonus || 8) * (votes[normText(cands[0].t)] - 1);
      if (cands.length > 1 && votes[normText(cands[0].t)] === cands.length) agreed++;
      if (best !== cands[0] && bestScore > baseScore + (opt.switchMargin || 6) && normText(best.t) !== normText(cands[0].t)) {
        out.push({ text: best.t, conf: Math.min(100, best.c + (votes[normText(best.t)] - 1) * 4), bbox: b.bbox, source: 'vote:' + best.src, was: b.text });
        replaced++;
      } else {
        out.push({ text: b.text, conf: Math.min(100, b.conf + (votes[normText(b.text)] - 1) * 4), bbox: b.bbox, source: 'base' });
      }
    });
    var added = 0;
    others.forEach(function (p, pi) {                              // 基準で見落とされていた文字を、他の方式から拾う
      p.words.forEach(function (o, oi) {
        if (used[pi][oi] || o.conf < (opt.recoverConf || 75)) return;
        var c = center(o.bbox), clash = false;
        for (var i = 0; i < out.length; i++) if (inside(c, out[i].bbox, 1) || iou(o.bbox, out[i].bbox) > 0.1) { clash = true; break; }
        if (clash) return;
        out.push({ text: o.text, conf: o.conf - 5, bbox: o.bbox, source: 'recovered:' + p.name }); added++;
      });
    });
    return { words: out, replaced: replaced, recovered: added, agreeRate: total ? agreed / total : 1 };
  }

  /* ================= 行の組み立て ================= */
  function buildLines(words, vertical) {
    if (!words.length) return [];
    var hs = words.map(function (w) { return vertical ? (w.bbox.x1 - w.bbox.x0) : (w.bbox.y1 - w.bbox.y0); }), mh = median(hs) || 10;
    var key = vertical ? function (w) { return -((w.bbox.x0 + w.bbox.x1) / 2); } : function (w) { return (w.bbox.y0 + w.bbox.y1) / 2; };
    var along = vertical ? function (w) { return w.bbox.y0; } : function (w) { return w.bbox.x0; };
    var s = words.slice().sort(function (a, b) { return key(a) - key(b); }), lines = [], cur = null;
    s.forEach(function (w) {
      if (!cur || Math.abs(key(w) - cur.k) > mh * 0.6) { cur = { k: key(w), words: [] }; lines.push(cur); }
      cur.words.push(w); cur.k = mean(cur.words.map(key));
    });
    return lines.sort(function (a, b) { return a.k - b.k; }).map(function (l) {
      l.words.sort(function (a, b) { return along(a) - along(b); });
      var x0 = Math.min.apply(null, l.words.map(function (w) { return w.bbox.x0; })), y0 = Math.min.apply(null, l.words.map(function (w) { return w.bbox.y0; }));
      var x1 = Math.max.apply(null, l.words.map(function (w) { return w.bbox.x1; })), y1 = Math.max.apply(null, l.words.map(function (w) { return w.bbox.y1; }));
      return { text: joinWords(l.words), bbox: { x0: x0, y0: y0, x1: x1, y1: y1 }, conf: mean(l.words.map(function (w) { return w.conf; })), words: l.words };
    });
  }

  /* ================= エンジン本体 ================= */
  function create(options) {
    options = options || {};
    var lang = options.lang || 'jpn+eng', worker = null, ownWorker = false, T = null;

    async function getWorker(o) {
      if (o && o.worker) return o.worker;
      if (worker) return worker;
      T = await ensureTesseract(options);
      worker = await T.createWorker(lang, 1, options.workerOptions || {});
      ownWorker = true; return worker;
    }
    async function pass(w, canvas, psm, extra) {
      var params = { tessedit_pageseg_mode: String(psm), preserve_interword_spaces: '1', tessedit_char_whitelist: (extra && extra.whitelist) || '' };
      await w.setParameters(params);
      var res = await w.recognize(toRecognizable(canvas));
      return res.data;
    }

    async function recognize(image, opts) {
      opts = Object.assign({ mode: 'balanced', vertical: false, assumePreprocessed: false, keepGeometry: false, deskew: 'auto', rereadBelow: 60, maxReread: null, onProgress: null }, opts || {});
      var t0 = now(), timing = {}, decisions = [], co = { createCanvas: options.createCanvas, loadImage: options.loadImage };
      var progress = function (p, m) { if (opts.onProgress) try { opts.onProgress(p, m); } catch (e) { } };
      var mode = opts.mode === 'fast' || opts.mode === 'accurate' ? opts.mode : 'balanced';
      var maxReread = opts.maxReread != null ? opts.maxReread : (mode === 'accurate' ? 40 : 0);
      var w = await getWorker(opts);

      /* 1) 画像を用意して診断する */
      var src = await toCanvas(image, co), features = analyze(src), base;
      var geom = { rotationDeg: 0, scale: 1 };
      if (opts.assumePreprocessed) {
        base = src; decisions.push('前処理済みの画像として扱った（拡大・補正はしない）');
      } else {
        var G = getGray(src);
        if (features.darkBackground) { G = invertGray(G); decisions.push('暗い背景を検知したため、白黒を反転した'); }
        var rotated = false;
        if (opts.deskew !== false && !opts.keepGeometry) {
          var sk = estimateSkew(G);
          if (Math.abs(sk.angle) >= 0.4 && sk.gain > 0.03) { var gc = grayToCanvas(G, co); gc = rotateCanvas(gc, -sk.angle, co); G = getGray(gc); geom.rotationDeg = -sk.angle; rotated = true; decisions.push('傾きを ' + sk.angle.toFixed(1) + '° と推定し、補正した'); }
        }
        G = stretchGray(G);
        var long = Math.max(G.w, G.h), target = 2000, s = 1;
        if (long < target) s = Math.min(3, target / long); else if (long > 2600) s = 2600 / long;
        if (Math.abs(s - 1) > 0.02) { var R = resizeGray(G, G.w * s, G.h * s); G = { w: R.w, h: R.h, g: Uint8ClampedArray.from(R.g, function (v) { return v; }) }; }
        geom.scale = s; base = grayToCanvas(G, co);
        decisions.push('拡大率 ' + s.toFixed(2) + '・パーセンタイル伸長');
      }
      timing.prepare = now() - t0; progress(10, '前処理');

      /* 2) 認識の方式を、画像の特徴から選ぶ */
      var vp = opts.vertical ? 5 : 3;
      var defs = {
        base:   { name: 'base',   psm: vp, scale: 1,   weight: 0, make: function () { return base; } },
        sparse: { name: 'sparse', psm: 11, scale: 1,   weight: 2, make: function () { return base; } },
        hires:  { name: 'hires',  psm: vp, scale: 1.3, weight: 0, make: function () { return resizeCanvas(base, base.width * 1.3, base.height * 1.3, co); } },
        shade:  { name: 'shade',  psm: vp, scale: 1,   weight: 5, make: function () { return grayToCanvas(stretchGray(shadingCorrect(getGray(base))), co); } },
        binar:  { name: 'binar',  psm: vp, scale: 1,   weight: 6, make: function () { return grayToCanvas(sauvola(getGray(base), 31, 0.2), co); } },
        shbin:  { name: 'shbin',  psm: vp, scale: 1,   weight: 6, make: function () { return grayToCanvas(sauvola(shadingCorrect(getGray(base)), 31, 0.2), co); } }
      };
      /* 方式の選び方：紙の明るさのムラが大きい画像では、陰影補正をかけた画像を「主」にする。
         そうでなければ、従来どおりの前処理（base）を主にする。 */
      var uneven = features.unevenness >= (opts.unevenThreshold != null ? opts.unevenThreshold : 0.10);
      var primaryName = uneven ? 'shade' : 'base';
      var plan = [defs[primaryName]];
      if (opts.passNames) { plan = opts.passNames.map(function (n) { return defs[n]; }); primaryName = plan[0].name; }
      else if (mode === 'accurate') {
        ['base', 'shade', 'hires', 'sparse'].forEach(function (n) { if (n !== primaryName) plan.push(defs[n]); });
        if (features.noise > 6 || features.sharpness < 0.28) plan.push(defs.shbin);
      }
      decisions.push(uneven ? '紙の明るさにムラ(' + features.unevenness.toFixed(2) + ')があるため、陰影補正をかけた画像を主にした' : '紙の明るさは均一(' + features.unevenness.toFixed(2) + ')のため、陰影補正は主にしない');
      var passes = [];
      for (var i = 0; i < plan.length; i++) {
        var p = plan[i], tp = now(), cv = p.make(), data = await pass(w, cv, p.psm), ws = extractWords(data);
        ws.forEach(function (x) { var k = 1 / p.scale; x.bbox = { x0: x.bbox.x0 * k, y0: x.bbox.y0 * k, x1: x.bbox.x1 * k, y1: x.bbox.y1 * k }; });
        passes.push({ name: p.name, psm: p.psm, weight: p.weight, words: ws, confidence: mean(ws.map(function (x) { return x.conf; })), ms: Math.round(now() - tp) });
        progress(10 + 60 * (i + 1) / plan.length, p.name);
      }
      timing.recognize = now() - t0 - timing.prepare;

      /* 3) 方式を選ぶ：主の方式より、平均の自信度が 3 ポイント以上高い方式があれば、それに切り替える */
      var sel = 0, margin = opts.switchMargin != null ? opts.switchMargin : 3;
      for (var pi = 1; pi < passes.length; pi++) { if (passes[pi].confidence - passes[pi].weight * 0.3 >= passes[sel].confidence + margin && passes[pi].confidence > passes[sel].confidence) sel = pi; }
      var fused;
      if (opts.vote === true && passes.length > 1) {                 // 単語ごとの投票（実験用・既定ではオフ）
        var others = passes.filter(function (x, ix) { return ix !== sel; });
        fused = fuse(passes[sel], others, {});
      } else {
        fused = { words: passes[sel].words.map(function (x) { return { text: x.text, conf: x.conf, bbox: x.bbox, source: passes[sel].name }; }), replaced: 0, recovered: 0, agreeRate: 1 };
      }
      if (sel !== 0) decisions.push('方式「' + passes[sel].name + '」の自信度が高かったため、主の方式から切り替えた');
      var words = fused.words;

      /* 4) 自信のない単語だけを、切り出して拡大し、もう一度読む */
      var reread = { tried: 0, improved: 0 };
      if (maxReread > 0) {
        var tr = now(), cand = words.map(function (x, idx) { return { x: x, idx: idx }; }).filter(function (o) {
          var tx = o.x.text; return o.x.conf < opts.rereadBelow && tx.length <= 24 && symbolDensity(tx) < 0.5;   // 数式らしい（記号だらけ）ものは対象外
        }).sort(function (a, b) { return a.x.conf - b.x.conf; }).slice(0, maxReread);
        for (var q = 0; q < cand.length; q++) {
          var wd = cand[q].x, bb = wd.bbox, bh = Math.max(4, bb.y1 - bb.y0), padv = Math.max(4, bh * 0.3);
          var x0 = clamp(Math.floor(bb.x0 - padv), 0, base.width - 1), y0 = clamp(Math.floor(bb.y0 - padv), 0, base.height - 1);
          var x1 = clamp(Math.ceil(bb.x1 + padv), x0 + 1, base.width), y1 = clamp(Math.ceil(bb.y1 + padv), y0 + 1, base.height);
          var sc = clamp(56 / bh, 1.5, 4), cw = Math.round((x1 - x0) * sc), ch = Math.round((y1 - y0) * sc), margin = 14;
          var cv2 = makeCanvas(cw + margin * 2, ch + margin * 2, co), cx = cv2.getContext('2d');
          cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv2.width, cv2.height);
          try { cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; } catch (e) { }
          cx.drawImage(base, x0, y0, x1 - x0, y1 - y0, margin, margin, cw, ch);
          var d2 = null; try { d2 = await pass(w, cv2, opts.vertical ? 5 : 7); } catch (e) { continue; }
          reread.tried++;
          var nw = extractWords(d2); if (!nw.length) continue;
          var nt = nw.map(function (z) { return z.text; }).join(''), nc = mean(nw.map(function (z) { return z.conf; }));
          var lenOk = nt.length >= Math.max(1, wd.text.length * 0.5) && nt.length <= wd.text.length * 2 + 1;
          if (lenOk && nc >= Math.max(opts.rereadMinConf || 85, wd.conf + 25) && normText(nt) !== normText(wd.text)) { words[cand[q].idx] = { text: nt, conf: nc, bbox: wd.bbox, source: 'reread', was: wd.text }; reread.improved++; }
          if (q % 5 === 0) progress(70 + 25 * q / cand.length, 'reread');
        }
        timing.reread = now() - tr;
      }

      /* 5) 行にまとめ、日本語の文章として整える */
      if (geom.rotationDeg && !opts.keepGeometry) {              // 傾きを直した場合、座標を元の画像側へ戻す
        var rad = -geom.rotationDeg * Math.PI / 180, cs = Math.cos(rad), sn = Math.sin(rad), cxm = base.width / 2, cym = base.height / 2;
        words.forEach(function (x) {
          var pts = [[x.bbox.x0, x.bbox.y0], [x.bbox.x1, x.bbox.y0], [x.bbox.x0, x.bbox.y1], [x.bbox.x1, x.bbox.y1]].map(function (pt) { var dx = pt[0] - cxm, dy = pt[1] - cym; return [dx * cs - dy * sn + cxm, dx * sn + dy * cs + cym]; });
          x.bbox = { x0: Math.min.apply(null, pts.map(function (z) { return z[0]; })), y0: Math.min.apply(null, pts.map(function (z) { return z[1]; })), x1: Math.max.apply(null, pts.map(function (z) { return z[0]; })), y1: Math.max.apply(null, pts.map(function (z) { return z[1]; })) };
        });
      }
      words.forEach(function (x) { x.text = cleanText(x.text, { cjkSpaces: false, science: opts.science }); });
      words = words.filter(function (x) { return x.text; });
      var lines = buildLines(words, opts.vertical), text = lines.map(function (l) { return cleanText(l.text, { science: opts.science }); }).join('\n');
      var confs = words.map(function (x) { return x.conf; });
      progress(100, 'done');
      return {
        engine: NAME, version: VERSION, mode: mode, text: text, lines: lines, words: words,
        confidence: mean(confs), lowConfidenceWords: confs.filter(function (c) { return c < 60; }).length,
        scale: geom.scale, features: features, decisions: decisions,
        passes: passes.map(function (p) { return { name: p.name, psm: p.psm, words: p.words.length, confidence: Math.round(p.confidence * 10) / 10, ms: p.ms }; }),
        selected: passes[sel].name, fusion: { replaced: fused.replaced, recovered: fused.recovered }, reread: reread,
        timing: { totalMs: Math.round(now() - t0) }
      };
    }
    async function dispose() { if (worker && ownWorker) { try { await worker.terminate(); } catch (e) { } } worker = null; }
    return { recognize: recognize, dispose: dispose, version: VERSION, name: NAME };
  }

  return {
    name: NAME, version: VERSION, create: create, analyze: analyze, cleanText: cleanText,
    _internal: { stretchGray: stretchGray, shadingCorrect: shadingCorrect, sauvola: sauvola, estimateSkew: estimateSkew, fuse: fuse, buildLines: buildLines, normText: normText, getGray: getGray, grayToCanvas: grayToCanvas, resizeGray: resizeGray }
  };
});
