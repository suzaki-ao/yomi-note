/* ============================================================================
   読みノート (Yomi-Note) 追加DLC
   ピン止め拡張機能 pin.js v1.0
   ----------------------------------------------------------------------------
   ▼ これは何？
     今見ているページを画面右側に「固定表示（ピン止め）」しておき、本体で別のページを
     見たり操作したりしながら、固定したページを見比べて使える機能です。
     これまでは「ディスレクシア支援パック」の中に入っていましたが、v1.0 から
     独立した追加コンテンツ（pin.js）になり、ディスレクシア支援パックを使わない
     人でも、他のDLCと組み合わせても使えるようになりました。

   ▼ 読み込み方
     index.html（アプリ本体）の </body> 直前、本体の <script> より「後」に:
       <script src="pin.js"></script>
     （本体の🧩追加コンテンツ一覧からも追加できます）

   ▼ v1.0 の主な機能（ピン止めの大型アップデート）
     ① ピン止めタブを画面の「右端」に移動
        　右端に細いタブ列を常に表示する（📌ボタン＋固定中ページのタブ）。左のツール列が
        　長くてボタンが見えなくなる問題を解消。パネルを閉じてもタブは残り、押すと再表示。
     ② テキストボックスの自由な移動・サイズ変更
        　上の「⠿」バーや枠の外側をドラッグして移動、8方向のつまみで自由にサイズ変更。
        　文字サイズ(A−/A＋)・色・太字・枠・塗りつぶし・縦横書きも変えられる。
     ③ テキストボックスへの音声入力（🎤）
        　本体の音声入力エンジンをそのまま使うので、本体と同じ仕組みで話した内容が入る。
     ④ ピン止め状態でのページ読み上げ
        　固定したページを、本体で別のページを見たまま読み上げられる。全文・停止・
        　前の文・次の文、読んでいる場所のハイライト、クリックした所から続けて読む。
     ⑤ ピン止め状態での輪投げツール（⭕）
        　固定ページの手書きを自由な形で囲んで「画像として切り取る」「数式に変換」。
        　切り取った画像は、固定側でもドラッグで移動・四隅で拡大縮小できる。
     ⑥ 固定側の元に戻す（↩）。手書き・切り取り・テキストボックスの操作を戻せる。
     ⑦ 他のDLCからも使える公開API： window.YomiPin
        　　YomiPin.pinCurrent() / pin(index) / unpin(index) / open(index) / getPinned()
        　　YomiPin.read() / stopRead()
        　　YomiPin.registerTool({id,label,title,onClick(ctx)})  … 固定パネルにボタンを追加
        　　document の 'yomi-pin-change' イベント … 固定ページの増減・切替を通知

   ▼ 注意
     ・ディスレクシア支援パック v1.3 以前の中にも古いピン止めがあります。pin.js は読み込み時に
       古い方のピン止めを無効化しますが、v1.4 以降のパックにはピン止めは入っていません。
     ・テストモード中は、本体の設定に従い、画像のブロック・輪投げのブロックを守ります。
   ============================================================================ */
(function(){
  'use strict';
  var PIN_VERSION = '1.0';
  window.YomiDlcLoaded = window.YomiDlcLoaded || {};
  window.YomiDlcLoaded.pin = PIN_VERSION;
  if (window.YomiPin && window.YomiPin.__loaded) return; /* 二重読み込み防止 */

  function whenAppReady(fn, tries){
    tries = tries || 0;
    if (typeof notestate !== 'undefined' && typeof window.setTool === 'function' && document.body){ fn(); return; }
    if (tries > 400) return;
    setTimeout(function(){ whenAppReady(fn, tries + 1); }, 50);
  }

  whenAppReady(function init(){

    /* ======================================================================
       0. 古いピン止め（ディスレクシア支援パック v1.3 以前に入っていたもの）を無効化
    ====================================================================== */
    function killLegacy(){
      ['dlcPinToggleBtn', 'dlcPinnedPane'].forEach(function(id){
        var el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    }
    killLegacy();
    try {
      var mo = new MutationObserver(killLegacy);
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function(){ mo.disconnect(); killLegacy(); }, 8000);
    } catch(e){}
    /* 古いコードがこれらを触っても何も起きない（固定なし）と見えるようにしておく */
    try {
      Object.defineProperty(window, 'dlcPinnedIndices', { configurable: true, get: function(){ return []; }, set: function(){} });
      Object.defineProperty(window, 'dlcPinnedPageIndex', { configurable: true, get: function(){ return null; }, set: function(){} });
    } catch(e){}

    /* ======================================================================
       1. 状態
    ====================================================================== */
    var EDGE_W = 30;
    var pins = [];              /* 固定中のページ（ページ配列のオブジェクトそのものを持つ） */
    var activeP = null;         /* パネルに表示中のページ */
    var zoom = 1;
    var zoomMap = new WeakMap();
    var tool = 'select';        /* select | pen | erase | lasso | text */
    var collapsed = false;
    var sel = null;             /* { kind:'tb'|'media', id } */
    var penColorPin = null, penWidthPin = null; /* null = 本体の値に従う */
    var pinInternal = false;    /* 固定側から本体を再描画している最中（無限ループ防止） */
    var needsRefresh = false;
    var undoMap = new WeakMap();
    var extraTools = [];
    var readToken = 0;
    var reading = null;         /* { token, page, queue, i, continuous } */
    var readContinuousClick = true;
    var pinVoiceId = null, ownRec = null;
    var PANEL_W_KEY = 'yomiPinPanelWidth';

    function curPage(){ try { return notestate.pages[currentPageIndex] || null; } catch(e){ return null; } }
    function pageIdx(p){ try { return notestate.pages.indexOf(p); } catch(e){ return -1; } }
    function toast(msg, ms){ if (typeof flashToast === 'function') flashToast(msg, ms); }
    function internal(fn){ var o = pinInternal; pinInternal = true; try { fn(); } finally { pinInternal = o; } }
    function isTest(){ try { return !!testModeOn; } catch(e){ return false; } }
    function testSetting(k){ try { return isTest() && !!testModeSettings[k]; } catch(e){ return false; } }
    function mainPenColor(){ try { return penColor || '#22262E'; } catch(e){ return '#22262E'; } }
    function mainPenWidth(){ try { return penWidth || 3; } catch(e){ return 3; } }
    function curPenColor(){ return penColorPin || mainPenColor(); }
    function curPenWidth(){ return penWidthPin || mainPenWidth(); }
    function emitChange(){
      try { document.dispatchEvent(new CustomEvent('yomi-pin-change', { detail: { pinned: getPinned(), active: activeP ? pageIdx(activeP) : null } })); } catch(e){}
    }
    function cleanPins(){
      pins = pins.filter(function(p){ return pageIdx(p) >= 0; });
      if (activeP && pins.indexOf(activeP) === -1) activeP = pins.length ? pins[0] : null;
      if (!activeP && pins.length) activeP = pins[0];
    }
    function getPinned(){ cleanPins(); return pins.map(pageIdx); }

    /* ======================================================================
       2. スタイル
    ====================================================================== */
    var css = document.createElement('style');
    css.id = 'ypinStyle';
    css.textContent = [
      '#ypinEdge{position:fixed;right:0;z-index:900;display:flex;flex-direction:column;align-items:stretch;gap:6px;width:' + EDGE_W + 'px;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;}',
      '#ypinEdge::-webkit-scrollbar{display:none;}',
      '#ypinEdge button{font-family:inherit;}',
      '.ypin-add{writing-mode:vertical-rl;letter-spacing:.12em;font-size:12px;font-weight:700;padding:10px 0;border:1px solid #22262E;border-right:none;',
      'border-radius:10px 0 0 10px;background:#fff;color:#22262E;cursor:pointer;box-shadow:-2px 2px 8px rgba(0,0,0,.18);min-height:92px;}',
      '.ypin-add.on{background:#B5432E;color:#fff;border-color:#B5432E;}',
      '.ypin-tab{position:relative;writing-mode:vertical-rl;font-size:12.5px;font-weight:700;padding:8px 0 28px;border:1px solid #B5432E;border-right:none;',
      'border-radius:10px 0 0 10px;background:#F6E3DC;color:#7A2A19;cursor:pointer;min-height:70px;box-shadow:-2px 2px 8px rgba(0,0,0,.14);}',
      '.ypin-tab.active{background:#B5432E;color:#fff;}',
      '.ypin-tab.reading::after{content:"🔊";position:absolute;top:2px;left:4px;writing-mode:horizontal-tb;font-size:11px;}',
      '.ypin-tab .ypin-tab-x{position:absolute;bottom:3px;left:3px;width:24px;height:20px;writing-mode:horizontal-tb;border:none;border-radius:6px;',
      'background:rgba(0,0,0,.14);color:inherit;font-size:12px;cursor:pointer;line-height:1;padding:0;}',
      '#ypinPane{position:fixed;right:' + EDGE_W + 'px;z-index:899;display:none;flex-direction:row;background:#F4EFE8;border-left:2px solid #B5432E;box-shadow:-4px 0 16px rgba(0,0,0,.16);box-sizing:border-box;color:#22262E;font-size:13px;}',
      '.ypin-resize{flex:0 0 8px;cursor:ew-resize;background:linear-gradient(90deg,rgba(181,67,46,.35),rgba(181,67,46,0));touch-action:none;}',
      '.ypin-resize:hover,.ypin-resize.drag{background:linear-gradient(90deg,rgba(181,67,46,.7),rgba(181,67,46,0));}',
      '.ypin-col{flex:1;min-width:0;display:flex;flex-direction:column;}',
      '.ypin-head{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 8px;background:#fff;border-bottom:1px solid #D9CFC2;font-weight:700;}',
      '.ypin-head button,.ypin-bar button,.ypin-insp button{font:inherit;font-size:12px;border:1px solid #CBBFB0;background:#fff;border-radius:7px;padding:4px 8px;cursor:pointer;color:#22262E;}',
      '.ypin-head button:hover,.ypin-bar button:hover,.ypin-insp button:hover{background:#F6E3DC;}',
      '.ypin-bar{display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding:5px 8px;border-bottom:1px solid #E4DBCF;}',
      '.ypin-bar button.active,.ypin-insp button.active{background:#22262E;color:#fff;border-color:#22262E;}',
      '.ypin-bar button:disabled{opacity:.4;cursor:default;}',
      '.ypin-bar label{display:inline-flex;align-items:center;gap:3px;font-size:11.5px;}',
      '.ypin-sw{width:20px;height:20px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #8a7f72;cursor:pointer;padding:0;}',
      '.ypin-sw.active{box-shadow:0 0 0 2px #22262E;}',
      '.ypin-sent{padding:4px 10px;font-size:12px;min-height:18px;background:#FFF8E1;border-bottom:1px solid #E4DBCF;color:#5b4a1a;word-break:break-all;}',
      '.ypin-insp{background:#EAF1FF;}',
      '.ypin-insp[hidden],.ypin-bar[hidden]{display:none;}',
      '.ypin-insp .grp{display:inline-flex;align-items:center;gap:3px;}',
      '.ypin-insp input[type=color]{width:30px;height:26px;padding:0;border:1px solid #CBBFB0;border-radius:6px;background:#fff;}',
      '.ypin-stage-wrap{flex:1;min-height:0;overflow:auto;background:#CFC8BE;padding:8px;position:relative;-webkit-overflow-scrolling:touch;}',
      '.ypin-sizer{position:relative;margin:0 auto;}',
      '.ypin-stage{position:absolute;left:0;top:0;transform-origin:0 0;background:#fff;box-shadow:0 1px 8px rgba(0,0,0,.3);--inv:1;user-select:none;-webkit-user-select:none;}',
      '.ypin-stage.t-pen,.ypin-stage.t-erase,.ypin-stage.t-lasso{touch-action:none;cursor:crosshair;}',
      '.ypin-stage.t-erase{cursor:cell;}',
      '.ypin-stage.t-text{cursor:copy;}',
      '.ypin-stage.t-pen .ypin-tbh,.ypin-stage.t-erase .ypin-tbh,.ypin-stage.t-lasso .ypin-tbh,',
      '.ypin-stage.t-pen .ypin-media,.ypin-stage.t-erase .ypin-media,.ypin-stage.t-lasso .ypin-media,',
      '.ypin-stage.t-pen .ypin-block,.ypin-stage.t-erase .ypin-block,.ypin-stage.t-lasso .ypin-block,.ypin-stage.t-text .ypin-block{pointer-events:none;}',
      '.ypin-bg{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;}',
      '.ypin-ink{position:absolute;left:0;top:0;}',
      '.ypin-empty{position:absolute;left:0;right:0;top:40%;text-align:center;color:#888;font-size:18px;pointer-events:none;}',
      '.ypin-block{position:absolute;cursor:pointer;border-radius:2px;}',
      '.ypin-stage.t-select .ypin-block:hover{background:rgba(255,213,79,.28);outline:1px solid rgba(181,67,46,.45);}',
      '.ypin-hl{position:absolute;pointer-events:none;background:rgba(255,196,0,.35);outline:2px solid #E6A100;border-radius:3px;display:none;z-index:6;}',
      '.ypin-media{position:absolute;z-index:2;}',
      '.ypin-media img{width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none;}',
      '.ypin-media.link{background:#E8F0FE;color:#1a4fb4;display:flex;align-items:center;justify-content:center;font-size:14px;border:1px solid #9bb7ef;cursor:pointer;overflow:hidden;}',
      '.ypin-media.lock{background:#EEE;color:#666;display:flex;align-items:center;justify-content:center;font-size:14px;border:1px dashed #999;text-align:center;}',
      '.ypin-media.sel,.ypin-tbh.sel{outline:calc(2px * var(--inv)) solid #2F6FEB;}',
      '.ypin-tbh{position:absolute;z-index:4;}',
      '.ypin-tbh.sel{z-index:5;}',
      '.ypin-tb{position:absolute;inset:0;box-sizing:border-box;padding:2px 4px;overflow:auto;white-space:pre-wrap;word-break:break-all;outline:none;line-height:1.45;border:1px solid transparent;border-radius:2px;user-select:text;-webkit-user-select:text;cursor:text;}',
      '.ypin-tbh:hover .ypin-tb{border-color:rgba(47,111,235,.45);}',
      '.ypin-mv,.ypin-me,.ypin-hd{position:absolute;display:none;touch-action:none;background:#2F6FEB;color:#fff;z-index:7;}',
      '.ypin-mv{left:0;right:0;top:calc(-22px * var(--inv));height:calc(22px * var(--inv));cursor:move;font-size:calc(13px * var(--inv));line-height:calc(22px * var(--inv));text-align:center;border-radius:calc(5px * var(--inv)) calc(5px * var(--inv)) 0 0;}',
      '.ypin-me{cursor:move;opacity:.55;}',
      '.ypin-me.l{left:calc(-9px * var(--inv));top:0;bottom:0;width:calc(9px * var(--inv));}',
      '.ypin-me.r{right:calc(-9px * var(--inv));top:0;bottom:0;width:calc(9px * var(--inv));}',
      '.ypin-me.b{left:0;right:0;bottom:calc(-9px * var(--inv));height:calc(9px * var(--inv));}',
      '.ypin-hd{width:calc(14px * var(--inv));height:calc(14px * var(--inv));background:#fff;border:calc(2px * var(--inv)) solid #2F6FEB;border-radius:50%;box-sizing:border-box;}',
      '.ypin-hd.nw{left:calc(-8px * var(--inv));top:calc(-8px * var(--inv));cursor:nwse-resize;}',
      '.ypin-hd.ne{right:calc(-8px * var(--inv));top:calc(-8px * var(--inv));cursor:nesw-resize;}',
      '.ypin-hd.sw{left:calc(-8px * var(--inv));bottom:calc(-8px * var(--inv));cursor:nesw-resize;}',
      '.ypin-hd.se{right:calc(-8px * var(--inv));bottom:calc(-8px * var(--inv));cursor:nwse-resize;}',
      '.ypin-hd.n{left:calc(50% - 7px * var(--inv));top:calc(-8px * var(--inv));cursor:ns-resize;}',
      '.ypin-hd.s{left:calc(50% - 7px * var(--inv));bottom:calc(-8px * var(--inv));cursor:ns-resize;}',
      '.ypin-hd.w{left:calc(-8px * var(--inv));top:calc(50% - 7px * var(--inv));cursor:ew-resize;}',
      '.ypin-hd.e{right:calc(-8px * var(--inv));top:calc(50% - 7px * var(--inv));cursor:ew-resize;}',
      '.ypin-tbh.sel .ypin-mv,.ypin-tbh.sel .ypin-me,.ypin-tbh.sel .ypin-hd,.ypin-media.sel .ypin-hd{display:block;}',
      '.ypin-tbh:hover .ypin-mv{display:block;opacity:.6;}',
      '.ypin-tbh.sel:hover .ypin-mv{opacity:1;}',
      '.ypin-lasso{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:8;}',
      '.ypin-lmenu{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);background:#fff;border:1px solid #B5432E;border-radius:10px;padding:8px;box-shadow:0 4px 18px rgba(0,0,0,.3);z-index:20;display:none;min-width:230px;}',
      '.ypin-lmenu .t{font-size:11.5px;color:#666;margin-bottom:6px;}',
      '.ypin-lmenu button{font:inherit;font-size:12.5px;padding:7px 10px;margin:2px;border:1px solid #CBBFB0;border-radius:8px;background:#fff;cursor:pointer;}',
      '.ypin-lmenu button.main{background:#B5432E;color:#fff;border-color:#B5432E;}',
      '.ypin-hint{padding:5px 10px;font-size:11px;color:#6b6258;border-top:1px solid #E4DBCF;background:#F9F5EE;line-height:1.5;}',
      '.mic-on{background:#D32F2F !important;color:#fff !important;border-color:#D32F2F !important;}',
      '@media (max-width:700px){#ypinPane{max-width:92vw;}}'
    ].join('\n');
    document.head.appendChild(css);

    /* ======================================================================
       3. DOM（右端タブ列＋パネル）
    ====================================================================== */
    var canvasArea = document.getElementById('canvasArea');
    var edge = document.createElement('div');
    edge.id = 'ypinEdge';
    document.body.appendChild(edge);

    var pane = document.createElement('div');
    pane.id = 'ypinPane';
    pane.innerHTML =
      '<div class="ypin-resize" title="ドラッグしてパネルの幅を変更"></div>' +
      '<div class="ypin-col">' +
        '<div class="ypin-head"><span id="ypinLabel">📌</span><span>' +
          '<button type="button" id="ypinCollapse" title="パネルをしまう（右端のタブを押すと再表示）">▶ しまう</button> ' +
          '<button type="button" id="ypinUnpin" title="このページの固定を解除">✕ 解除</button></span></div>' +
        '<div class="ypin-bar" id="ypinTools">' +
          '<button type="button" data-tool="select" title="選択・テキストボックスの編集・クリックで読み上げ">👆 選択</button>' +
          '<button type="button" data-tool="pen" title="ペンで書き込む">✏️ ペン</button>' +
          '<button type="button" data-tool="erase" title="書き込みを消す">🧹 消す</button>' +
          '<button type="button" data-tool="lasso" title="輪投げ：手書きを囲んで画像として切り取る／数式に変換">⭕ 輪投げ</button>' +
          '<button type="button" data-tool="text" title="タップした場所にテキストボックスを追加">T 文字</button>' +
          '<button type="button" id="ypinUndo" title="固定側の操作を1つ元に戻す">↩ 戻す</button>' +
        '</div>' +
        '<div class="ypin-bar" id="ypinPenBar" hidden></div>' +
        '<div class="ypin-bar" id="ypinRead">' +
          '<button type="button" id="ypinPlay" title="このページを最初から読み上げる">▶ 読み上げ</button>' +
          '<button type="button" id="ypinStop" title="読み上げを止める">■ 停止</button>' +
          '<button type="button" id="ypinPrev" title="前の文へ">⏮</button>' +
          '<button type="button" id="ypinNext" title="次の文へ">⏭</button>' +
          '<label title="選択ツールで文章ブロックをクリックしたとき、そこから最後まで続けて読む"><input type="checkbox" id="ypinCont" checked>クリックから続けて</label>' +
        '</div>' +
        '<div class="ypin-sent" id="ypinSent">読み上げ中の文がここに表示されます</div>' +
        '<div class="ypin-bar" id="ypinZoomBar">' +
          '<button type="button" data-zoom="out" title="縮小">－</button>' +
          '<span id="ypinZoomLabel" style="min-width:42px;text-align:center;">100%</span>' +
          '<button type="button" data-zoom="in" title="拡大">＋</button>' +
          '<button type="button" data-zoom="reset" title="原寸(100%)">原寸</button>' +
          '<button type="button" data-zoom="fit" title="パネルの幅に合わせる">幅合わせ</button>' +
        '</div>' +
        '<div class="ypin-bar" id="ypinExtra" hidden></div>' +
        '<div class="ypin-bar ypin-insp" id="ypinInsp" hidden>' +
          '<span id="ypinInspLabel" style="font-weight:700;font-size:12px;"></span>' +
          '<span class="grp" data-g="tb"><button type="button" data-i="fs-" title="文字を小さく">A−</button><span id="ypinFs" style="min-width:26px;text-align:center;">20</span><button type="button" data-i="fs+" title="文字を大きく">A＋</button></span>' +
          '<span class="grp" data-g="tb"><input type="color" id="ypinColor" title="文字の色"></span>' +
          '<span class="grp" data-g="tb"><button type="button" data-i="bold" title="太字"><b>B</b></button><button type="button" data-i="border" title="枠線">枠</button><button type="button" data-i="fill" title="背景の塗りつぶし">塗</button><button type="button" data-i="vert" title="縦書き／横書き">縦横</button></span>' +
          '<span class="grp" data-g="tb"><button type="button" data-i="mic" title="音声入力（話した内容がこのテキストボックスに入ります）">🎤</button><button type="button" data-i="speak" title="このテキストを読み上げる">🔊</button></span>' +
          '<span class="grp"><button type="button" data-i="del" title="削除">🗑 削除</button></span>' +
        '</div>' +
        '<div class="ypin-stage-wrap" id="ypinWrap"><div class="ypin-sizer" id="ypinSizer"><div class="ypin-stage t-select" id="ypinStage"></div></div></div>' +
        '<div class="ypin-hint" id="ypinHint"></div>' +
        '<div class="ypin-lmenu" id="ypinLMenu"></div>' +
      '</div>';
    document.body.appendChild(pane);

    var $ = function(id){ return document.getElementById(id); };
    var stage = $('ypinStage'), sizer = $('ypinSizer'), wrap = $('ypinWrap');
    var inkCanvas = null, inkCtx = null, hlEl = null, lassoSvg = null, lassoPoly = null;

    /* ======================================================================
       4. レイアウト（右端タブ列・パネル幅・本体への右余白）
    ====================================================================== */
    function topOffset(){
      var t = document.getElementById('topbar');
      return t ? Math.ceil(t.getBoundingClientRect().bottom) : 0;
    }
    function panelWidth(){
      var w = 440;
      try {
        var v = parseInt(localStorage.getItem(PANEL_W_KEY) || localStorage.getItem('yomiDlcPinPanelWidth'), 10);
        if (!isNaN(v)) w = v;
      } catch(e){}
      return clampW(w);
    }
    function clampW(w){
      var maxW = Math.max(300, Math.floor(window.innerWidth * 0.85) - EDGE_W);
      return Math.max(300, Math.min(maxW, Math.round(w)));
    }
    function paneOpen(){ return !!activeP && !collapsed; }
    function desiredPadding(){
      if (paneOpen()) return (panelWidth() + EDGE_W + 10) + 'px';
      if (pins.length) return (EDGE_W + 8) + 'px';
      return '';
    }
    function applyLayout(){
      var top = topOffset();
      edge.style.top = (top + 10) + 'px';
      edge.style.maxHeight = 'calc(100vh - ' + (top + 20) + 'px)';
      pane.style.top = top + 'px';
      pane.style.height = 'calc(100vh - ' + top + 'px)';
      pane.style.width = panelWidth() + 'px';
      pane.style.display = paneOpen() ? 'flex' : 'none';
      if (canvasArea) canvasArea.style.paddingRight = desiredPadding();
    }
    if (canvasArea){
      /* 古いコード等がパディングを書き換えても、こちらの値に戻す */
      try {
        new MutationObserver(function(){
          if (canvasArea.style.paddingRight !== desiredPadding()) canvasArea.style.paddingRight = desiredPadding();
        }).observe(canvasArea, { attributes: true, attributeFilter: ['style'] });
      } catch(e){}
    }
    window.addEventListener('resize', function(){ applyLayout(); });

    (function(){
      var h = pane.querySelector('.ypin-resize');
      var dragging = false, sx = 0, sw = 0;
      h.addEventListener('pointerdown', function(e){
        dragging = true; sx = e.clientX; sw = pane.getBoundingClientRect().width;
        h.classList.add('drag'); h.setPointerCapture(e.pointerId); e.preventDefault();
      });
      h.addEventListener('pointermove', function(e){
        if (!dragging) return;
        var w = clampW(sw - (e.clientX - sx));
        try { localStorage.setItem(PANEL_W_KEY, String(w)); } catch(err){}
        applyLayout();
      });
      function end(){ dragging = false; h.classList.remove('drag'); }
      h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
    })();

    /* ======================================================================
       5. 右端タブ列
    ====================================================================== */
    function renderEdge(){
      cleanPins();
      edge.innerHTML = '';
      var cur = curPage();
      var curPinned = !!cur && pins.indexOf(cur) !== -1;
      var add = document.createElement('button');
      add.type = 'button';
      add.className = 'ypin-add' + (curPinned ? ' on' : '');
      add.textContent = curPinned ? '📌 解除' : '📌 ピン止め';
      add.title = curPinned
        ? '今見ているページの固定表示を解除する'
        : '今見ているページを右端に固定表示する（複数ページOK。固定中も本体の操作はそのまま使えます）';
      add.addEventListener('click', function(){ pinCurrent(); });
      edge.appendChild(add);
      pins.forEach(function(p){
        var i = pageIdx(p);
        var tab = document.createElement('div');
        tab.className = 'ypin-tab' + (p === activeP && !collapsed ? ' active' : '') + (reading && reading.page === p ? ' reading' : '');
        tab.setAttribute('role', 'button');
        tab.tabIndex = 0;
        tab.title = 'ページ ' + (i + 1) + ' の固定表示を' + (p === activeP && !collapsed ? 'しまう' : '開く');
        tab.appendChild(document.createTextNode('P' + (i + 1)));
        var x = document.createElement('button');
        x.type = 'button'; x.className = 'ypin-tab-x'; x.textContent = '×'; x.title = 'このページの固定を解除';
        x.addEventListener('click', function(ev){ ev.stopPropagation(); unpinPage(p); });
        tab.appendChild(x);
        function go(){
          if (p === activeP && !collapsed){ collapsed = true; renderAll(); return; }
          setActive(p);
        }
        tab.addEventListener('click', go);
        tab.addEventListener('keydown', function(ev){ if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); go(); } });
        edge.appendChild(tab);
      });
    }

    /* ======================================================================
       6. 固定・解除・表示切替
    ====================================================================== */
    function pinPage(p){
      if (!p) return;
      if (pins.indexOf(p) === -1) pins.push(p);
      setActive(p);
    }
    function unpinPage(p){
      var i = pins.indexOf(p);
      if (i === -1) return;
      pins.splice(i, 1);
      if (reading && reading.page === p) stopRead();
      if (activeP === p){
        activeP = pins.length ? pins[Math.min(i, pins.length - 1)] : null;
        sel = null;
        zoom = activeP ? (zoomMap.get(activeP) || null) : zoom;
      }
      renderAll();
      emitChange();
    }
    function pinCurrent(){
      var p = curPage();
      if (!p) return;
      if (pins.indexOf(p) !== -1) unpinPage(p); else pinPage(p);
    }
    function setActive(p){
      activeP = p; collapsed = false; sel = null;
      zoom = zoomMap.get(p) || null;       /* null → 描画時に幅合わせ */
      renderAll();
      emitChange();
    }

    /* ======================================================================
       7. 描画（枠組み → ステージ）
    ====================================================================== */
    function fitZoom(p){
      var w = Math.max(200, wrap.clientWidth - 18);
      var z = w / p.width;
      return Math.max(0.2, Math.min(2.5, Math.round(z * 100) / 100));
    }
    function renderAll(){
      cleanPins();
      applyLayout();
      renderEdge();
      if (!paneOpen()) return;
      if (!zoom){ zoom = fitZoom(activeP); zoomMap.set(activeP, zoom); }
      updateChrome();
      renderStage();
    }
    function updateChrome(){
      if (!activeP) return;
      var i = pageIdx(activeP);
      $('ypinLabel').textContent = '📌 ページ ' + (i + 1) + ' を固定表示中' + (pins.length > 1 ? '（他' + (pins.length - 1) + '件）' : '');
      pane.querySelectorAll('#ypinTools [data-tool]').forEach(function(b){ b.classList.toggle('active', b.dataset.tool === tool); });
      $('ypinZoomLabel').textContent = Math.round((zoom || 1) * 100) + '%';
      $('ypinUndo').disabled = !(undoMap.get(activeP) || []).length;
      $('ypinCont').checked = readContinuousClick;
      var penBar = $('ypinPenBar');
      var showPen = (tool === 'pen' || tool === 'erase');
      penBar.hidden = !showPen;
      if (showPen) buildPenBar();
      $('ypinHint').textContent = hintText();
      renderExtra();
      updateInspector();
      updateReadUI();
    }
    function hintText(){
      if (tool === 'pen') return 'ペン：固定したページに直接書き込めます。書いた内容は本体の同じページにも反映されます。';
      if (tool === 'erase') return '消す：なぞった所の手書きを消します（背景の画像・文字は消えません）。';
      if (tool === 'lasso') return '輪投げ：手書きをぐるっと囲んで離すと、「画像として切り取る」か「数式に変換」を選べます。';
      if (tool === 'text') return '文字：ページの空いている所をタップするとテキストボックスができます。';
      return '選択：テキストボックスをタップして編集。上の「⠿」バーや枠の外側をドラッグで移動、白い丸でサイズ変更。文章のブロックをタップすると読み上げます。';
    }
    function buildPenBar(){
      var bar = $('ypinPenBar');
      var cols = ['#22262E', '#D32F2F', '#1565C0', '#2E7D32', '#EF6C00', '#6A1B9A'];
      var html = cols.map(function(c){
        return '<button type="button" class="ypin-sw' + (curPenColor().toLowerCase() === c.toLowerCase() ? ' active' : '') + '" data-c="' + c + '" style="background:' + c + '" title="' + c + '"></button>';
      }).join('');
      html += '<span style="margin-left:6px;">太さ</span><button type="button" data-w="-1">－</button><span style="min-width:22px;text-align:center;">' + curPenWidth() + '</span><button type="button" data-w="1">＋</button>';
      bar.innerHTML = html;
      bar.querySelectorAll('[data-c]').forEach(function(b){
        b.addEventListener('click', function(){ penColorPin = b.dataset.c; buildPenBar(); });
      });
      bar.querySelectorAll('[data-w]').forEach(function(b){
        b.addEventListener('click', function(){
          penWidthPin = Math.max(1, Math.min(30, curPenWidth() + parseInt(b.dataset.w, 10))); buildPenBar();
        });
      });
    }
    function renderExtra(){
      var bar = $('ypinExtra');
      bar.innerHTML = '';
      bar.hidden = !extraTools.length;
      extraTools.forEach(function(t){
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = t.label || t.id; b.title = t.title || '';
        b.addEventListener('click', function(){
          try { t.onClick({ page: activeP, pageIndex: pageIdx(activeP), stage: stage, refresh: renderStage }); } catch(e){ console.error(e); }
        });
        bar.appendChild(b);
      });
    }

    /* --- ステージ（ページ本体）の描画 --- */
    var tbMap = {};   /* id → { holder, el } */
    function renderStage(){
      var p = activeP;
      if (!p || !paneOpen()) return;
      needsRefresh = false;
      stage.innerHTML = '';
      tbMap = {};
      stage.className = 'ypin-stage t-' + tool;
      stage.style.width = p.width + 'px'; stage.style.height = p.height + 'px';
      stage.style.transform = 'scale(' + zoom + ')';
      stage.style.setProperty('--inv', String(1 / zoom));
      sizer.style.width = (p.width * zoom) + 'px'; sizer.style.height = (p.height * zoom) + 'px';
      $('ypinZoomLabel').textContent = Math.round(zoom * 100) + '%';

      var hasAny = p.bgImage || (p.ocrBlocks && p.ocrBlocks.length) || (p.textBoxes && p.textBoxes.length) || (p.mediaObjects && p.mediaObjects.length);
      if (!hasAny){
        var em = document.createElement('div'); em.className = 'ypin-empty'; em.textContent = 'このページにはまだ内容がありません';
        stage.appendChild(em);
      }
      if (p.bgImage){
        var bg = document.createElement('img'); bg.className = 'ypin-bg'; bg.src = p.bgImage; bg.draggable = false;
        stage.appendChild(bg);
      }
      inkCanvas = document.createElement('canvas');
      inkCanvas.className = 'ypin-ink'; inkCanvas.width = p.width; inkCanvas.height = p.height;
      stage.appendChild(inkCanvas);
      inkCtx = inkCanvas.getContext('2d');
      drawInkFromPage(p);

      (p.mediaObjects || []).forEach(function(m){ buildMedia(p, m); });
      (p.ocrBlocks || []).forEach(function(b){ if (!b.excludeFromReading) buildBlock(p, b); });
      (p.textBoxes || []).forEach(function(tb){ buildTb(p, tb); });

      hlEl = document.createElement('div'); hlEl.className = 'ypin-hl'; stage.appendChild(hlEl);
      lassoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      lassoSvg.setAttribute('class', 'ypin-lasso');
      lassoPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      lassoPoly.setAttribute('fill', 'rgba(181,67,46,0.12)'); lassoPoly.setAttribute('stroke', '#B5432E');
      lassoPoly.setAttribute('stroke-width', String(1.6 / zoom)); lassoPoly.setAttribute('stroke-dasharray', (6 / zoom) + ',' + (4 / zoom));
      lassoSvg.appendChild(lassoPoly); stage.appendChild(lassoSvg);

      applySelection();
      if (reading && reading.page === p && reading.queue[reading.i]) showHl(reading.queue[reading.i], false);
    }
    function drawInkFromPage(p){
      if (!inkCtx) return;
      inkCtx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
      if (!p.ink) return;
      var img = new Image(), target = inkCanvas;
      img.onload = function(){ if (inkCanvas === target){ inkCtx.clearRect(0, 0, target.width, target.height); inkCtx.drawImage(img, 0, 0); } };
      img.src = p.ink;
    }

    /* --- OCRブロック（クリックで読み上げ） --- */
    function buildBlock(p, b){
      var box = document.createElement('div');
      box.className = 'ypin-block';
      box.style.left = b.x + 'px'; box.style.top = b.y + 'px'; box.style.width = b.w + 'px'; box.style.height = b.h + 'px';
      box.title = 'クリックで読み上げ：' + (b.text || '').slice(0, 40);
      box.addEventListener('click', function(){
        if (tool !== 'select') return;
        clearSel();
        readFromBlock(b.id);
      });
      stage.appendChild(box);
    }

    /* --- 画像・数式・グラフ・リンク・動画 --- */
    function buildMedia(p, m){
      var el = document.createElement('div');
      el.className = 'ypin-media';
      el.dataset.id = m.id;
      el.style.left = m.x + 'px'; el.style.top = m.y + 'px'; el.style.width = m.w + 'px'; el.style.height = m.h + 'px';
      var imgLike = (m.type === 'image' || m.type === 'chart' || m.type === 'formula');
      if (m.type === 'image' && testSetting('blockImage')){
        el.classList.add('lock'); el.textContent = '🔒 テスト中は表示できません';
      } else if (imgLike){
        var img = document.createElement('img'); img.src = m.src; img.alt = m.type; img.draggable = false; el.appendChild(img);
        /* 移動・サイズ変更（選択ツール時） */
        el.addEventListener('pointerdown', function(e){
          if (tool !== 'select') return;
          e.stopPropagation();
          selectItem('media', m.id);
          startMediaMove(e, p, m, el);
        });
        ['nw', 'ne', 'sw', 'se'].forEach(function(d){
          var h = document.createElement('div'); h.className = 'ypin-hd ' + d;
          h.addEventListener('pointerdown', function(e){ selectItem('media', m.id); startResize(e, p, m, el, d, { lock: true, min: 16, media: true }); });
          el.appendChild(h);
        });
      } else if (m.type === 'link'){
        if (testModeOn_links()){ el.classList.add('lock'); el.textContent = '🔒 テスト中はリンクを開けません'; }
        else {
          el.classList.add('link'); el.textContent = '🔗 ' + (m.label || m.url || 'リンク'); el.title = m.url || '';
          el.addEventListener('click', function(){ if (tool === 'select' && m.url) window.open(m.url, '_blank', 'noopener,noreferrer'); });
        }
      } else if (m.type === 'video'){
        el.classList.add('lock'); el.textContent = '🎬 動画（本体表示でご覧ください）';
      } else { return; }
      stage.appendChild(el);
    }
    function testModeOn_links(){ return isTest(); }

    /* --- テキストボックス --- */
    function plainText(el){
      var text = '';
      el.childNodes.forEach(function(n){
        if (n.nodeType === 3) text += n.nodeValue;
        else if (n.nodeType === 1 && n.tagName === 'BR') text += '\n';
        else if (n.nodeType === 1 && (n.tagName === 'DIV' || n.tagName === 'P')){
          if (text.length && text.charAt(text.length - 1) !== '\n') text += '\n';
          text += plainText(n);
        } else if (n.nodeType === 1) text += n.textContent || '';
      });
      return text;
    }
    function onEnterKey(e){
      if (e.key !== 'Enter' || e.isComposing) return;
      e.preventDefault();
      try { document.execCommand('insertText', false, '\n'); }
      catch(err){
        var s = window.getSelection();
        if (s && s.rangeCount){
          var r = s.getRangeAt(0); r.deleteContents();
          var nl = document.createTextNode('\n'); r.insertNode(nl); r.setStartAfter(nl); r.setEndAfter(nl);
          s.removeAllRanges(); s.addRange(r);
        }
      }
    }
    function styleTb(el, tb, editing){
      el.style.fontSize = Math.max(7, tb.fontSize || 20) + 'px';
      el.style.color = tb.color || '#22262E';
      el.style.fontWeight = tb.bold ? '700' : '400';
      el.style.borderColor = tb.border ? (tb.color || '#22262E') : '';
      el.style.textAlign = tb.align || 'left';
      try { if (typeof TB_FONT_FAMILY_MAP !== 'undefined') el.style.fontFamily = TB_FONT_FAMILY_MAP[tb.fontFamily || 'sans'] || ''; } catch(e){}
      el.style.backgroundColor = tb.fill ? (tb.fillColor || '#fff59d') : 'transparent';
      /* 縦書き：入力中だけ横書きにする（縦書きと入力欄の相性問題を避ける） */
      el.style.writingMode = (tb.vertical && !editing) ? 'vertical-rl' : 'horizontal-tb';
    }
    function buildTb(p, tb){
      var holder = document.createElement('div');
      holder.className = 'ypin-tbh'; holder.dataset.id = tb.id;
      holder.style.left = tb.x + 'px'; holder.style.top = tb.y + 'px'; holder.style.width = tb.w + 'px'; holder.style.height = tb.h + 'px';
      var el = document.createElement('div');
      el.className = 'ypin-tb'; el.contentEditable = 'true'; el.spellcheck = false;
      el.textContent = tb.text || '';
      styleTb(el, tb, false);
      el.addEventListener('keydown', onEnterKey);
      el.addEventListener('input', function(){ tb.text = plainText(el); schedMainTb(p); });
      el.addEventListener('focus', function(){ styleTb(el, tb, true); selectItem('tb', tb.id); });
      el.addEventListener('blur', function(){ tb.text = plainText(el); styleTb(el, tb, false); syncMainTb(p); if (needsRefresh) setTimeout(function(){ if (!editingInStage()) renderStage(); }, 0); });
      el.addEventListener('pointerdown', function(e){ e.stopPropagation(); selectItem('tb', tb.id); });
      holder.appendChild(el);

      var mv = document.createElement('div'); mv.className = 'ypin-mv'; mv.textContent = '⠿ ドラッグで移動'; mv.title = 'ドラッグして移動';
      holder.appendChild(mv);
      ['l', 'r', 'b'].forEach(function(s){ var m = document.createElement('div'); m.className = 'ypin-me ' + s; m.title = 'ドラッグして移動'; holder.appendChild(m); });
      [mv].concat([].slice.call(holder.querySelectorAll('.ypin-me'))).forEach(function(h){
        h.addEventListener('pointerdown', function(e){ selectItem('tb', tb.id); startTbMove(e, p, tb, holder); });
      });
      ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(function(d){
        var h = document.createElement('div'); h.className = 'ypin-hd ' + d; h.title = 'ドラッグしてサイズ変更';
        h.addEventListener('pointerdown', function(e){ selectItem('tb', tb.id); startResize(e, p, tb, holder, d, { lock: false, min: 30, media: false }); });
        holder.appendChild(h);
      });
      stage.appendChild(holder);
      tbMap[tb.id] = { holder: holder, el: el };
    }

    /* --- 移動・サイズ変更（共通） --- */
    function gesture(e, onMove, onEnd){
      e.preventDefault(); e.stopPropagation();
      var h = e.currentTarget, sx = e.clientX, sy = e.clientY, pid = e.pointerId, started = false;
      try { h.setPointerCapture(pid); } catch(err){}
      function mv(ev){
        if (ev.pointerId !== pid) return;
        var dx = (ev.clientX - sx) / zoom, dy = (ev.clientY - sy) / zoom;
        if (!started && Math.abs(dx) + Math.abs(dy) < 2 / zoom) return;
        started = true; onMove(dx, dy, true);
      }
      function up(ev){
        if (ev.pointerId !== pid) return;
        h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
        if (started && onEnd) onEnd();
      }
      h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
      return function undoOnce(){ };
    }
    function clampPos(p, it){
      it.x = Math.max(-it.w + 20, Math.min(p.width - 20, it.x));
      it.y = Math.max(-it.h + 20, Math.min(p.height - 20, it.y));
    }
    function placeEl(holder, it){
      holder.style.left = it.x + 'px'; holder.style.top = it.y + 'px'; holder.style.width = it.w + 'px'; holder.style.height = it.h + 'px';
    }
    function afterGeom(p, media){ if (media) syncMainMedia(p); else syncMainTb(p); }
    function startTbMove(e, p, tb, holder){
      var ox = tb.x, oy = tb.y, pushed = false;
      gesture(e, function(dx, dy){
        if (!pushed){ pushPinUndo(p); pushed = true; }
        tb.x = ox + dx; tb.y = oy + dy; clampPos(p, tb); placeEl(holder, tb);
      }, function(){ afterGeom(p, false); });
    }
    function startMediaMove(e, p, m, el){
      var ox = m.x, oy = m.y, pushed = false;
      gesture(e, function(dx, dy){
        if (!pushed){ pushPinUndo(p); pushed = true; }
        m.x = ox + dx; m.y = oy + dy; clampPos(p, m); placeEl(el, m);
      }, function(){ afterGeom(p, true); });
    }
    function startResize(e, p, it, holder, dir, o){
      var ox = it.x, oy = it.y, ow = it.w, oh = it.h, ratio = ow / (oh || 1), pushed = false;
      gesture(e, function(dx, dy){
        if (!pushed){ pushPinUndo(p); pushed = true; }
        var x = ox, y = oy, w = ow, h = oh;
        if (dir.indexOf('e') !== -1) w = ow + dx;
        if (dir.indexOf('w') !== -1){ w = ow - dx; }
        if (dir.indexOf('s') !== -1) h = oh + dy;
        if (dir.indexOf('n') !== -1){ h = oh - dy; }
        if (o.lock){
          /* 縦横比を保つ：横の変化を基準にする */
          h = w / ratio;
        }
        w = Math.max(o.min, w); h = Math.max(o.min, h);
        if (dir.indexOf('w') !== -1) x = ox + (ow - w);
        if (dir.indexOf('n') !== -1) y = oy + (oh - h);
        it.x = x; it.y = y; it.w = w; it.h = h; placeEl(holder, it);
      }, function(){ afterGeom(p, o.media); });
    }

    /* ======================================================================
       8. 選択・インスペクター（文字サイズ・色など）
    ====================================================================== */
    function selectItem(kind, id){
      sel = { kind: kind, id: id };
      applySelection(); updateInspector();
    }
    function clearSel(){ sel = null; applySelection(); updateInspector(); }
    function applySelection(){
      stage.querySelectorAll('.sel').forEach(function(n){ n.classList.remove('sel'); });
      if (!sel) return;
      var q = sel.kind === 'tb' ? '.ypin-tbh[data-id="' + cssEsc(sel.id) + '"]' : '.ypin-media[data-id="' + cssEsc(sel.id) + '"]';
      var n = stage.querySelector(q);
      if (n) n.classList.add('sel'); else sel = null;
    }
    function cssEsc(s){ return String(s).replace(/["\\]/g, '\\$&'); }
    function selTb(){
      if (!sel || sel.kind !== 'tb' || !activeP) return null;
      return (activeP.textBoxes || []).filter(function(t){ return t.id === sel.id; })[0] || null;
    }
    function selMedia(){
      if (!sel || sel.kind !== 'media' || !activeP) return null;
      return (activeP.mediaObjects || []).filter(function(t){ return t.id === sel.id; })[0] || null;
    }
    function updateInspector(){
      var insp = $('ypinInsp');
      var tb = selTb(), m = selMedia();
      if (!tb && !m){ insp.hidden = true; return; }
      insp.hidden = false;
      insp.querySelectorAll('[data-g="tb"]').forEach(function(g){ g.style.display = tb ? '' : 'none'; });
      $('ypinInspLabel').textContent = tb ? 'テキストボックス' : '画像（ドラッグで移動・白い丸で拡大縮小）';
      if (tb){
        $('ypinFs').textContent = Math.round(tb.fontSize || 20);
        $('ypinColor').value = /^#[0-9a-f]{6}$/i.test(tb.color || '') ? tb.color : '#22262E';
        insp.querySelector('[data-i="bold"]').classList.toggle('active', !!tb.bold);
        insp.querySelector('[data-i="border"]').classList.toggle('active', !!tb.border);
        insp.querySelector('[data-i="fill"]').classList.toggle('active', !!tb.fill);
        insp.querySelector('[data-i="vert"]').classList.toggle('active', !!tb.vertical);
      }
      updateMic();
    }
    function refreshTbEl(tb){
      var r = tbMap[tb.id]; if (!r) return;
      var editing = document.activeElement === r.el;
      styleTb(r.el, tb, editing);
      placeEl(r.holder, tb);
    }
    $('ypinInsp').addEventListener('click', function(e){
      var b = e.target.closest('[data-i]'); if (!b || !activeP) return;
      var act = b.dataset.i, tb = selTb(), m = selMedia(), p = activeP;
      if (act === 'del'){
        pushPinUndo(p);
        if (tb){ p.textBoxes = p.textBoxes.filter(function(t){ return t.id !== tb.id; }); if (pinVoiceId === tb.id) stopMic(); sel = null; renderStage(); syncMainTb(p); }
        else if (m){ p.mediaObjects = p.mediaObjects.filter(function(t){ return t.id !== m.id; }); sel = null; renderStage(); syncMainMedia(p); }
        updateInspector(); updateChrome(); return;
      }
      if (!tb) return;
      if (act === 'mic'){ toggleMic(tb); return; }
      if (act === 'speak'){ speakOne(tb.text || ''); return; }
      pushPinUndo(p);
      if (act === 'fs-') tb.fontSize = Math.max(8, Math.round((tb.fontSize || 20) - 2));
      else if (act === 'fs+') tb.fontSize = Math.min(160, Math.round((tb.fontSize || 20) + 2));
      else if (act === 'bold') tb.bold = !tb.bold;
      else if (act === 'border') tb.border = !tb.border;
      else if (act === 'fill') tb.fill = !tb.fill;
      else if (act === 'vert'){
        tb.vertical = !tb.vertical;
        var w = tb.w; tb.w = tb.h; tb.h = w; /* 向きを変えたら枠も縦横入れ替える */
      }
      refreshTbEl(tb); updateInspector(); updateChrome(); syncMainTb(p);
    });
    $('ypinColor').addEventListener('input', function(e){
      var tb = selTb(); if (!tb) return;
      tb.color = e.target.value; refreshTbEl(tb); schedMainTb(activeP);
    });
    $('ypinColor').addEventListener('change', function(){ if (activeP) pushPinUndo(activeP); });

    /* ======================================================================
       9. 本体との同期
    ====================================================================== */
    var mainTbTimer = null;
    function schedMainTb(p){ clearTimeout(mainTbTimer); mainTbTimer = setTimeout(function(){ syncMainTb(p); }, 300); }
    function syncMainTb(p){ if (p === curPage() && typeof renderTextBoxes === 'function') internal(renderTextBoxes); }
    function syncMainMedia(p){ if (p === curPage() && typeof renderMediaObjects === 'function') internal(renderMediaObjects); }
    function syncMainInk(p){
      if (p !== curPage()) return;
      var c = document.getElementById('inkCanvas'); if (!c) return;
      var ctx = c.getContext('2d');
      if (!p.ink){ ctx.clearRect(0, 0, c.width, c.height); return; }
      var im = new Image();
      im.onload = function(){ ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(im, 0, 0); };
      im.src = p.ink;
    }
    function editingInStage(){ return !!document.activeElement && stage.contains(document.activeElement); }
    var stageTimer = 0;
    function scheduleStage(){
      if (stageTimer) return;
      stageTimer = requestAnimationFrame(function(){
        stageTimer = 0;
        if (!paneOpen()) return;
        if (editingInStage()){ needsRefresh = true; return; }
        renderStage();
      });
    }
    function onMainChanged(){
      if (pinInternal || !paneOpen()) return;
      if (activeP !== curPage()) return;
      scheduleStage();
    }
    function wrap_(name, maker){
      var orig = window[name];
      if (typeof orig !== 'function') return null;
      var w = maker(orig);
      try { window[name] = w; } catch(e){ return null; }
      return orig;
    }
    wrap_('renderTextBoxes', function(orig){ return function(){ var r = orig.apply(this, arguments); onMainChanged(); return r; }; });
    wrap_('renderMediaObjects', function(orig){ return function(){ var r = orig.apply(this, arguments); onMainChanged(); return r; }; });
    wrap_('syncCurrentInk', function(orig){ return function(){
      var r = orig.apply(this, arguments);
      if (!pinInternal && paneOpen() && activeP === curPage()) drawInkFromPage(activeP);
      return r;
    }; });
    wrap_('loadPage', function(orig){ return function(){
      var r = orig.apply(this, arguments);
      try { renderEdge(); if (paneOpen()) updateChrome(); } catch(e){}
      return r;
    }; });
    wrap_('runOcr', function(orig){ return async function(pageIndex){
      var r = await orig.apply(this, arguments);
      try { if (paneOpen() && notestate.pages[pageIndex] === activeP) renderStage(); } catch(e){}
      return r;
    }; });
    var _mainStop = wrap_('stopReading', function(orig){ return function(){ stopRead(); return orig.apply(this, arguments); }; });
    /* 固定ページの番号がずれたとき（ページ追加・削除・並べ替え）にタブ表示を更新する */
    var lastSig = '';
    setInterval(function(){
      var sig = pins.map(pageIdx).join(',') + '|' + pageIdx(activeP);
      if (sig !== lastSig){ lastSig = sig; var before = pins.length; cleanPins(); renderEdge(); if (paneOpen()) updateChrome(); applyLayout(); if (pins.length !== before) emitChange(); }
    }, 1000);

    /* ======================================================================
       10. 固定側の「元に戻す」
    ====================================================================== */
    function pushPinUndo(p){
      var st = undoMap.get(p) || [];
      st.push({
        ink: p.ink || null,
        media: (p.mediaObjects || []).map(function(m){ return Object.assign({}, m); }),
        tbs: (p.textBoxes || []).map(function(t){ return Object.assign({}, t); })
      });
      if (st.length > 20) st.shift();
      undoMap.set(p, st);
      if (p === activeP && paneOpen()) $('ypinUndo').disabled = false;
    }
    function pinUndo(){
      var p = activeP; if (!p) return;
      var st = undoMap.get(p) || [];
      var s = st.pop();
      if (!s){ toast('固定側で元に戻せる操作はありません'); return; }
      p.ink = s.ink; p.mediaObjects = s.media; p.textBoxes = s.tbs;
      sel = null;
      renderStage(); syncMainInk(p); syncMainMedia(p); syncMainTb(p); updateChrome();
    }
    $('ypinUndo').addEventListener('click', pinUndo);

    /* ======================================================================
       11. ペン・消しゴム・テキスト追加（ステージ全体のポインター処理）
    ====================================================================== */
    var smooth = [], drawing = false, strokePid = null, strokeErase = false;
    function getPt(e){
      var r = stage.getBoundingClientRect();
      return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
    }
    function mid(a, b){ return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
    function strokeSeg(erase){
      var n = smooth.length; if (n < 3) return;
      var p0 = smooth[n - 3], p1 = smooth[n - 2], p2 = smooth[n - 1];
      var s = mid(p0, p1), en = mid(p1, p2);
      inkCtx.lineCap = 'round'; inkCtx.lineJoin = 'round';
      if (erase){ inkCtx.globalCompositeOperation = 'destination-out'; inkCtx.strokeStyle = 'rgba(0,0,0,1)'; inkCtx.lineWidth = curPenWidth() * 4; }
      else { inkCtx.globalCompositeOperation = 'source-over'; inkCtx.strokeStyle = curPenColor(); inkCtx.lineWidth = curPenWidth(); }
      inkCtx.beginPath(); inkCtx.moveTo(s.x, s.y); inkCtx.quadraticCurveTo(p1.x, p1.y, en.x, en.y); inkCtx.stroke();
    }
    var lassoPts = null, lassoPid = null;
    stage.addEventListener('pointerdown', function(e){
      var p = activeP; if (!p) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var t = e.target;
      if (tool === 'pen' || tool === 'erase'){
        if (drawing) return;
        if (!inkCtx) return;
        pushPinUndo(p);
        strokePid = e.pointerId; strokeErase = (tool === 'erase'); drawing = true;
        try { stage.setPointerCapture(e.pointerId); } catch(err){}
        var pt = getPt(e); smooth = [pt, pt, pt];
        e.preventDefault(); return;
      }
      if (tool === 'lasso'){
        if (testSetting('blockLasso')){ toast('テストモード中は輪投げツールを使えません'); return; }
        hideLMenu();
        lassoPid = e.pointerId; lassoPts = [getPt(e)];
        try { stage.setPointerCapture(e.pointerId); } catch(err){}
        drawLasso(lassoPts); e.preventDefault(); return;
      }
      if (tool === 'text'){
        if (t.closest && t.closest('.ypin-tbh')) return;
        addTbAt(getPt(e)); e.preventDefault(); return;
      }
      /* 選択ツール：何もない所を押したら選択解除 */
      if (!(t.closest && (t.closest('.ypin-tbh') || t.closest('.ypin-media')))){
        clearSel();
        if (document.activeElement && stage.contains(document.activeElement)) document.activeElement.blur();
      }
    });
    stage.addEventListener('pointermove', function(e){
      if (drawing && e.pointerId === strokePid){
        var evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
        evs.forEach(function(ev){ smooth.push(getPt(ev)); strokeSeg(strokeErase); });
      } else if (lassoPts && e.pointerId === lassoPid){
        var evs2 = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
        evs2.forEach(function(ev){ lassoPts.push(getPt(ev)); });
        drawLasso(lassoPts);
      }
    });
    function endPointer(e){
      if (drawing && e.pointerId === strokePid){
        drawing = false;
        if (smooth.length){ smooth.push(smooth[smooth.length - 1]); strokeSeg(strokeErase); }
        inkCtx.globalCompositeOperation = 'source-over';
        smooth = [];
        var p = activeP;
        if (p){ p.ink = inkCanvas.toDataURL('image/png'); syncMainInk(p); updateChrome(); }
      } else if (lassoPts && e.pointerId === lassoPid){
        var pts = lassoPts; lassoPts = null; lassoPid = null;
        if (e.type === 'pointerup' && pts.length > 6) showLMenu(smoothLasso(pts)); else clearLassoPreview();
      }
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);

    function addTbAt(pt){
      var p = activeP; if (!p) return;
      pushPinUndo(p);
      p.textBoxes = p.textBoxes || [];
      var v = !!p.vertical;
      var tb = {
        id: 'tb_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        x: Math.max(0, Math.min(p.width - 60, pt.x)), y: Math.max(0, Math.min(p.height - 40, pt.y)),
        w: v ? 70 : 260, h: v ? 260 : 80,
        text: '', fontSize: 22, color: '#22262E', bold: false, border: false, vertical: v
      };
      p.textBoxes.push(tb);
      tool = 'select';
      sel = { kind: 'tb', id: tb.id };
      updateChrome(); renderStage(); syncMainTb(p);
      requestAnimationFrame(function(){ var r = tbMap[tb.id]; if (r) r.el.focus(); });
    }

    /* ======================================================================
       12. 輪投げツール（固定ページ用）
    ====================================================================== */
    function drawLasso(pts){
      if (!lassoPoly) return;
      lassoSvg.style.display = 'block';
      lassoPoly.setAttribute('points', pts.map(function(q){ return q.x + ',' + q.y; }).join(' '));
    }
    function clearLassoPreview(){ if (lassoSvg) lassoSvg.style.display = 'none'; }
    function smoothLasso(points){
      if (typeof smoothLassoPoints === 'function'){ try { return smoothLassoPoints(points); } catch(e){} }
      var pts = points;
      if (pts.length > 120){ var step = Math.ceil(pts.length / 120); pts = pts.filter(function(_, i){ return i % step === 0; }); }
      if (pts.length < 4) return pts;
      for (var it = 0; it < 2; it++){
        var next = [], n = pts.length;
        for (var i = 0; i < n; i++){
          var a = pts[i], b = pts[(i + 1) % n];
          next.push({ x: a.x * .75 + b.x * .25, y: a.y * .75 + b.y * .25 });
          next.push({ x: a.x * .25 + b.x * .75, y: a.y * .25 + b.y * .75 });
        }
        pts = next;
      }
      return pts;
    }
    function hideLMenu(){ $('ypinLMenu').style.display = 'none'; }
    function showLMenu(pts){
      var m = $('ypinLMenu');
      m.innerHTML = '<div class="t">囲んだ部分をどうしますか？</div>' +
        '<button type="button" class="main" data-a="image">✂️ 画像として切り取る</button>' +
        '<button type="button" data-a="formula">∑ 数式に変換</button>' +
        '<button type="button" data-a="cancel">やめる</button>';
      m.style.display = 'block';
      m.querySelector('[data-a="image"]').onclick = function(){ hideLMenu(); clearLassoPreview(); lassoCut(pts); };
      m.querySelector('[data-a="formula"]').onclick = function(){ hideLMenu(); lassoFormula(pts); };
      m.querySelector('[data-a="cancel"]').onclick = function(){ hideLMenu(); clearLassoPreview(); };
    }
    function bbox(p, pts){
      var xs = pts.map(function(q){ return q.x; }), ys = pts.map(function(q){ return q.y; });
      var minX = Math.max(0, Math.min.apply(null, xs)), minY = Math.max(0, Math.min.apply(null, ys));
      var maxX = Math.min(p.width, Math.max.apply(null, xs)), maxY = Math.min(p.height, Math.max.apply(null, ys));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    function lassoCut(pts){
      var p = activeP; if (!p || !inkCanvas) return;
      var r = bbox(p, pts);
      if (r.w < 8 || r.h < 8) return;
      pushPinUndo(p);
      var cut = document.createElement('canvas');
      cut.width = Math.round(r.w); cut.height = Math.round(r.h);
      var cc = cut.getContext('2d');
      cc.save(); cc.beginPath();
      pts.forEach(function(q, i){ var x = q.x - r.x, y = q.y - r.y; if (i === 0) cc.moveTo(x, y); else cc.lineTo(x, y); });
      cc.closePath(); cc.clip();
      cc.drawImage(inkCanvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      cc.restore();
      inkCtx.save(); inkCtx.globalCompositeOperation = 'destination-out'; inkCtx.beginPath();
      pts.forEach(function(q, i){ if (i === 0) inkCtx.moveTo(q.x, q.y); else inkCtx.lineTo(q.x, q.y); });
      inkCtx.closePath(); inkCtx.fill(); inkCtx.restore();
      p.ink = inkCanvas.toDataURL('image/png');
      var media = { id: 'media_' + Date.now(), type: 'image', x: r.x, y: r.y, w: r.w, h: r.h, src: cut.toDataURL('image/png') };
      p.mediaObjects = p.mediaObjects || []; p.mediaObjects.push(media);
      tool = 'select'; sel = { kind: 'media', id: media.id };
      updateChrome(); renderStage(); syncMainInk(p); syncMainMedia(p);
      toast('囲んだ部分を切り取りました。ドラッグで移動、四隅の丸で拡大縮小できます');
    }
    function cropMasked(r, pts){
      var cw = Math.max(1, Math.round(r.w)), ch = Math.max(1, Math.round(r.h));
      var c = document.createElement('canvas'); c.width = cw; c.height = ch;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
      ctx.save(); ctx.beginPath();
      pts.forEach(function(q, i){ var x = q.x - r.x, y = q.y - r.y; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.closePath(); ctx.clip();
      ctx.drawImage(inkCanvas, r.x, r.y, r.w, r.h, 0, 0, cw, ch);
      ctx.restore();
      return c.toDataURL('image/png');
    }
    async function lassoFormula(pts){
      var p = activeP; if (!p || !inkCanvas) return;
      var r = bbox(p, pts);
      if (r.w < 8 || r.h < 8){ clearLassoPreview(); return; }
      var idx = pageIdx(p);
      var isCur = (p === curPage());
      var canTarget = !!(window.YomiFeatures && window.YomiFeatures.formulaTargetPage);
      if (!isCur && !canTarget){
        clearLassoPreview();
        toast('別のページを固定表示しているときの数式変換には、本体 v6.4 以降が必要です。そのページを開いてから行ってください。', 6000);
        return;
      }
      if (typeof openFormulaEditor !== 'function'){ clearLassoPreview(); toast('数式エディタが見つかりません'); return; }
      var opts = { eraseLassoPoints: pts, pageIndex: idx, onCommitted: function(){ clearLassoPreview(); if (paneOpen()) { renderStage(); } } };
      if (typeof Tesseract === 'undefined' || typeof runOcrOnDataUrl !== 'function'){
        toast('OCRライブラリの読み込みに失敗しました。数式パレットに直接入力してください。');
        openFormulaEditor(r.x, r.y, null, opts); return;
      }
      toast('手書きの数式を認識中...（下書きとして数式欄に入ります）');
      try { if (typeof setOcrStatus === 'function') setOcrStatus('手書き数式を認識中...'); } catch(e){}
      try {
        var crop = cropMasked(r, pts);
        var mathOpts = { psm: '7', targetMin: 1000, maxScale: 8, whitelist: '0123456789+-*/=()xyzabcnπ^.,<>≤≥√∫∑' };
        var res = await runOcrOnDataUrl(crop, false, true, null, null, mathOpts);
        var raw = ((res && res.data && res.data.text) || '').trim();
        var guess = (typeof mathTextToLatexGuess === 'function') ? mathTextToLatexGuess(raw) : raw;
        try { if (typeof setOcrStatus === 'function') setOcrStatus(raw ? '手書き数式の認識が完了しました。内容を確認・修正してから「入れる」を押してください。' : '手書きをうまく認識できませんでした。ご自身で組み立ててください。'); } catch(e){}
        openFormulaEditor(r.x, r.y, guess ? { latex: guess } : null, opts);
      } catch(err){
        console.error(err);
        toast('数式への変換に失敗しました。数式パレットに直接入力してください。');
        openFormulaEditor(r.x, r.y, null, opts);
      }
    }

    /* ======================================================================
       13. 音声入力（テキストボックスへ）
       本体の音声入力エンジン（startVoiceInput 等）をそのまま使い、
       対象のテキストボックスを固定側のものに差し替える。
    ====================================================================== */
    function pinFindTb(id){
      for (var i = 0; i < pins.length; i++){
        var t = (pins[i].textBoxes || []).filter(function(x){ return x.id === id; })[0];
        if (t) return t;
      }
      return null;
    }
    var _vFind = window.voiceFindBox, _vEl = window.voiceBoxEl, _vCommit = window.voiceCommit, _vActive = window.voiceSetActive;
    if (typeof _vFind === 'function') window.voiceFindBox = function(id){ return (id && id === pinVoiceId && pinFindTb(id)) || _vFind.apply(this, arguments); };
    if (typeof _vEl === 'function') window.voiceBoxEl = function(id){ var r = (id && id === pinVoiceId && tbMap[id]) ? tbMap[id].el : null; return r || _vEl.apply(this, arguments); };
    if (typeof _vCommit === 'function') window.voiceCommit = function(text, id){
      var r = _vCommit.apply(this, arguments);
      if (id && id === pinVoiceId){ var tb = pinFindTb(id); if (tb && activeP){ syncMainTb(activeP); } }
      return r;
    };
    if (typeof _vActive === 'function') window.voiceSetActive = function(on){
      var r = _vActive.apply(this, arguments);
      try { updateMic(); } catch(e){}
      return r;
    };
    function micOn(){
      var tb = selTb();
      return !!(tb && ((window.voiceSession && pinVoiceId === tb.id) || ownRec));
    }
    function updateMic(){
      var b = pane.querySelector('[data-i="mic"]'); if (!b) return;
      var on = micOn();
      b.classList.toggle('mic-on', on);
      b.textContent = on ? '🎤 停止' : '🎤';
    }
    function stopMic(){
      if (ownRec){ try { ownRec.stop(); } catch(e){} ownRec = null; }
      if (window.voiceSession && typeof stopVoiceInput === 'function'){ try { stopVoiceInput('pin'); } catch(e){} }
      pinVoiceId = null; updateMic();
    }
    async function toggleMic(tb){
      if (micOn()){ stopMic(); toast('音声入力を停止しました', 1500); return; }
      if (window.voiceSession && typeof stopVoiceInput === 'function'){ try { stopVoiceInput('pin-switch'); } catch(e){} }
      pinVoiceId = tb.id;
      try {
        if (typeof startVoiceInput === 'function'){ await startVoiceInput(tb.id); }
        else { ownVoiceStart(tb); }
      } catch(e){
        console.error(e); pinVoiceId = null;
        toast('音声入力を開始できませんでした：' + (e && e.message ? e.message : e), 6000);
      }
      updateMic();
    }
    function ownVoiceStart(tb){
      var C = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!C){ pinVoiceId = null; toast('このブラウザは音声認識に対応していません（Chrome・Edge・Safariをお使いください）'); return; }
      var r = new C(); r.lang = 'ja-JP'; r.continuous = true; r.interimResults = false;
      r.onresult = function(ev){
        for (var i = ev.resultIndex; i < ev.results.length; i++){
          if (ev.results[i].isFinal){
            tb.text = (tb.text || '') + ev.results[i][0].transcript;
            var rec = tbMap[tb.id]; if (rec) rec.el.textContent = tb.text;
            schedMainTb(activeP);
          }
        }
      };
      r.onend = function(){ ownRec = null; pinVoiceId = null; updateMic(); };
      r.onerror = function(ev){ toast('音声入力エラー：' + (ev && ev.error ? ev.error : '')); };
      r.start(); ownRec = r;
    }

    /* ======================================================================
       14. ページ読み上げ（固定側）
    ====================================================================== */
    function buildQueue(p){
      if (typeof buildSentenceQueue === 'function'){ try { return buildSentenceQueue(p); } catch(e){ console.error(e); } }
      var items = (p.ocrBlocks || []).filter(function(b){ return !b.excludeFromReading && b.text; })
        .map(function(b){ return { text: b.text, blockId: b.id, x: b.x, y: b.y, w: b.w, h: b.h }; })
        .concat((p.textBoxes || []).filter(function(t){ return t.text && t.text.trim(); })
          .map(function(t){ return { text: t.text, blockId: t.id, x: t.x, y: t.y, w: t.w, h: t.h }; }));
      items.sort(function(a, b){ return p.vertical ? ((b.x - a.x) || (a.y - b.y)) : ((a.y - b.y) || (a.x - b.x)); });
      return items;
    }
    function showHl(item, scroll){
      if (!hlEl) return;
      hlEl.style.display = 'block';
      hlEl.style.left = item.x + 'px'; hlEl.style.top = item.y + 'px'; hlEl.style.width = item.w + 'px'; hlEl.style.height = item.h + 'px';
      if (scroll === false) return;
      var top = item.y * zoom, bottom = (item.y + item.h) * zoom, left = item.x * zoom, right = (item.x + item.w) * zoom;
      var vh = wrap.clientHeight, vw = wrap.clientWidth;
      if (top < wrap.scrollTop || bottom > wrap.scrollTop + vh) wrap.scrollTop = Math.max(0, top - vh / 3);
      if (left < wrap.scrollLeft || right > wrap.scrollLeft + vw) wrap.scrollLeft = Math.max(0, left - vw / 3);
    }
    function hideHl(){ if (hlEl) hlEl.style.display = 'none'; }
    function speakOne(text){
      if (!text || !('speechSynthesis' in window)) return;
      stopRead();
      if (_mainStop) { try { _mainStop(); } catch(e){} }
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = (typeof ttsRate === 'number' && ttsRate) ? ttsRate : 1;
      try { var v = (typeof pickJaVoice === 'function') ? pickJaVoice() : null; if (v) u.voice = v; } catch(e){}
      speechSynthesis.speak(u);
    }
    function speakItem(item, token, done){
      showHl(item, true);
      var clauses = (typeof splitClauses === 'function') ? splitClauses(item.text) : [item.text];
      var q = [];
      clauses.forEach(function(clause, ci){
        var last = ci === clauses.length - 1;
        var withP = clause + (last ? '' : '、');
        var segs = (typeof segmentByLanguage === 'function') ? segmentByLanguage(withP) : [{ text: withP, lang: 'ja' }];
        segs.forEach(function(sg, si){ q.push({ text: sg.text, lang: sg.lang, pause: (si === segs.length - 1 && !last) ? 90 : 0 }); });
      });
      if (!q.length){ done(); return; }
      var idx = 0;
      function next(){
        if (token !== readToken) return;
        if (idx >= q.length){ done(); return; }
        var sg = q[idx];
        var u = new SpeechSynthesisUtterance(sg.text);
        if (sg.lang === 'en'){ u.lang = 'en-US'; try { var ve = (typeof pickEnVoice === 'function') ? pickEnVoice() : null; if (ve) u.voice = ve; } catch(e){} }
        else { u.lang = 'ja-JP'; try { var vj = (typeof pickJaVoice === 'function') ? pickJaVoice() : null; if (vj) u.voice = vj; } catch(e){} }
        u.rate = (typeof ttsRate === 'number' && ttsRate) ? ttsRate : 1;
        u.onend = function(){ if (token !== readToken) return; idx++; if (sg.pause) setTimeout(next, sg.pause); else next(); };
        u.onerror = function(ev){
          if (token !== readToken) return;
          /* 他の読み上げに割り込まれた（本体の読み上げ開始など）場合は、こちらは止める */
          if (ev && (ev.error === 'canceled' || ev.error === 'interrupted')){ stopRead(true); return; }
          idx++; next();
        };
        speechSynthesis.speak(u);
      }
      next();
    }
    function playAt(i){
      if (!reading) return;
      if (i < 0) i = 0;
      if (i >= reading.queue.length){
        stopRead(true);
        toast('読み上げが終わりました');
        return;
      }
      reading.i = i;
      var token = reading.token;
      updateReadUI();
      speakItem(reading.queue[i], token, function(){
        if (!reading || reading.token !== token) return;
        if (reading.continuous) playAt(i + 1); else stopRead(true);
      });
    }
    function startRead(startIdx, continuous){
      var p = activeP; if (!p) return;
      if (!('speechSynthesis' in window)){ toast('このブラウザは読み上げに対応していません'); return; }
      var q = buildQueue(p);
      if (!q.length){ toast('読み上げるテキストがありません（先にOCR認識を実行してください）'); return; }
      if (_mainStop){ try { _mainStop(); } catch(e){} }
      readToken++;
      speechSynthesis.cancel();
      reading = { token: readToken, page: p, queue: q, i: startIdx, continuous: continuous };
      renderEdge();
      var t = readToken;
      setTimeout(function(){ if (reading && reading.token === t) playAt(startIdx); }, 40);
    }
    function readFromBlock(blockId){
      var p = activeP; if (!p) return;
      var q = buildQueue(p);
      var i = -1;
      for (var k = 0; k < q.length; k++){ if (q[k].blockId === blockId){ i = k; break; } }
      if (i < 0){ toast('このブロックは読み上げ対象ではありません'); return; }
      if (!readContinuousClick){
        /* このブロックの文だけを読む */
        var only = q.filter(function(x){ return x.blockId === blockId; });
        if (_mainStop){ try { _mainStop(); } catch(e){} }
        readToken++; speechSynthesis.cancel();
        reading = { token: readToken, page: p, queue: only, i: 0, continuous: true };
        renderEdge();
        var t2 = readToken;
        setTimeout(function(){ if (reading && reading.token === t2) playAt(0); }, 40);
        return;
      }
      startRead(i, true);
    }
    function stopRead(noCancel){
      /* noCancel=true：他の読み上げ（本体など）に割り込まれたとき。相手の音声を止めないよう cancel しない */
      readToken++;
      var had = !!reading;
      reading = null;
      if (!noCancel){ try { speechSynthesis.cancel(); } catch(e){} }
      hideHl();
      if (had){ try { renderEdge(); updateReadUI(); } catch(e){} }
    }
    function stepRead(d){
      if (!reading){
        if (d > 0){ startRead(0, false); }
        return;
      }
      readToken++; reading.token = readToken;
      try { speechSynthesis.cancel(); } catch(e){}
      var t = readToken, ni = Math.max(0, Math.min(reading.queue.length - 1, reading.i + d));
      setTimeout(function(){ if (reading && reading.token === t) playAt(ni); }, 40);
    }
    function updateReadUI(){
      if (!paneOpen()) return;
      var on = !!reading;
      $('ypinStop').disabled = !on;
      $('ypinPrev').disabled = !on; $('ypinNext').disabled = false;
      $('ypinPlay').classList.toggle('active', on);
      var s = $('ypinSent');
      if (on && reading.queue[reading.i]) s.textContent = '🔊 ' + reading.queue[reading.i].text + '（' + (reading.i + 1) + '/' + reading.queue.length + '）';
      else s.textContent = '読み上げ中の文がここに表示されます（速さは上部バーの速度で変わります）';
    }
    $('ypinPlay').addEventListener('click', function(){ startRead(0, true); });
    $('ypinStop').addEventListener('click', function(){ stopRead(); });
    $('ypinPrev').addEventListener('click', function(){ stepRead(-1); });
    $('ypinNext').addEventListener('click', function(){ stepRead(1); });
    $('ypinCont').addEventListener('change', function(e){ readContinuousClick = !!e.target.checked; });

    /* ======================================================================
       15. ツールバー・ズーム・パネル操作
    ====================================================================== */
    $('ypinTools').addEventListener('click', function(e){
      var b = e.target.closest('[data-tool]'); if (!b) return;
      tool = b.dataset.tool;
      if (tool === 'lasso' && testSetting('blockLasso')){ toast('テストモード中は輪投げツールを使えません'); tool = 'select'; }
      hideLMenu(); clearLassoPreview();
      if (tool !== 'select' && tool !== 'text') clearSel();
      stage.className = 'ypin-stage t-' + tool;
      updateChrome();
    });
    $('ypinZoomBar').addEventListener('click', function(e){
      var b = e.target.closest('[data-zoom]'); if (!b || !activeP) return;
      var z = zoom || 1, a = b.dataset.zoom;
      if (a === 'in') z = Math.min(2.5, z + 0.1);
      else if (a === 'out') z = Math.max(0.2, z - 0.1);
      else if (a === 'reset') z = 1;
      else z = fitZoom(activeP);
      setZoom(z);
    });
    function setZoom(z){
      zoom = Math.round(z * 100) / 100; zoomMap.set(activeP, zoom);
      renderStage();
    }
    wrap.addEventListener('wheel', function(e){
      if (!e.ctrlKey || !activeP) return;
      e.preventDefault();
      setZoom(Math.max(0.2, Math.min(2.5, (zoom || 1) + (e.deltaY < 0 ? 0.1 : -0.1))));
    }, { passive: false });
    $('ypinCollapse').addEventListener('click', function(){ collapsed = true; renderAll(); });
    $('ypinUnpin').addEventListener('click', function(){ if (activeP) unpinPage(activeP); });
    pane.addEventListener('keydown', function(e){
      if (e.key === 'Escape'){ hideLMenu(); clearLassoPreview(); if (!editingInStage()) clearSel(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel && !editingInStage() && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))){
        e.preventDefault();
        var b = pane.querySelector('#ypinInsp [data-i="del"]'); if (b) b.click();
      }
    });

    /* ======================================================================
       16. 公開API（他のDLCからも使えるように）
    ====================================================================== */
    window.YomiPin = {
      __loaded: true,
      version: PIN_VERSION,
      pinCurrent: function(){ var p = curPage(); if (p && pins.indexOf(p) === -1) pinPage(p); },
      togglePinCurrent: pinCurrent,
      pin: function(i){ var p = notestate.pages[i]; if (p) pinPage(p); },
      unpin: function(i){ var p = notestate.pages[i]; if (p) unpinPage(p); },
      open: function(i){ var p = notestate.pages[i]; if (p && pins.indexOf(p) !== -1) setActive(p); },
      close: function(){ collapsed = true; renderAll(); },
      getPinned: getPinned,
      getActive: function(){ return activeP ? pageIdx(activeP) : null; },
      read: function(){ startRead(0, true); },
      stopRead: function(){ stopRead(); },
      registerTool: function(t){
        if (!t || !t.id) return;
        extraTools = extraTools.filter(function(x){ return x.id !== t.id; });
        extraTools.push(t);
        if (paneOpen()) renderExtra();
      },
      refresh: function(){ renderAll(); }
    };

    /* 初期表示 */
    renderAll();
    console.log('[読みノート] ピン止め拡張機能 pin.js v' + PIN_VERSION + ' を有効化しました。');
  });
})();
