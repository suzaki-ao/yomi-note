/* ============================================================================
   読みノート (Yomi-Note) 追加DLC
   ディスレクシア支援パック v0.1
   ----------------------------------------------------------------------------
   このスクリプトは index.html（アプリ本体）の </body> 直前、本体の
   <script>...</script> より「後」に以下のように読み込んでください。

     <script src="dyslexia-support-pack-v0.1.js"></script>
     </body>

   読み込むと、以下のとおり機能が入れ替わります。

   ▼ 使えなくなるツール（気が散る要因・誤操作しやすい機能を減らすため）
     ・カメラ ／ リンク ／ 画像 ／ 動画 ／ グラフ の挿入
     ・手動登録（範囲を指定してテキストを手打ちする機能）
     ・部分読上（すでに認識済みのテキストだけを範囲選択して読む機能）
     ・手書→文字（手書き文字をきれいな文字に変換する機能）

   ▼ 新しく使えるようになるツール
     ・部分OCR縦+ ／ 部分OCR横+
       　「部分OCR」に、向きの固定（縦書き固定 / 横書き固定）と
       　認識精度を優先する拡大設定をあらかじめ組み込んだクイックツール。
       　いちいち向きのプルダウンを操作しなくても、ボタン1つで
       　「絶対に縦書きとして／横書きとして、高精度で」読み取れる。
     ・区切り線（左右の分割）が横書きページでも効くように修正
       　これまでは「縦（左右分割）」の区切り線を引いても、横書きページの
       　文章の組み立てには反映されていなかった（内部的に未使用のまま
       　だった）。このパックでは、横書きページの認識結果の組み立て直しに
       　左右分割の区切り線もきちんと使うようにする（2段組みの問題用紙などで、
       　左右の文章が混ざって読み上げられてしまう問題を解消）。
     ・ページのピン止め（📌）
       　今見ているページを「固定表示」しておくと、以降ページを移動しても
       　固定したページが画面右側に、通常ページと同じくらいの大きさで
       　見開き表示され続ける（＝左：今見ているページ／右：固定したページ）。
       　固定側のテキストボックスはその場で文字を編集でき、認識済みブロックは
       　クリックで読み上げられる。
     ・UDフォント（Aa）
       　ディスレクシアに配慮して設計された書体「BIZ UDゴシック」に、
       　ノート全体の文字を切り替えられる。もう一度押すと元に戻る。
     ・ログ（📝）
       　このページで行った操作（ページ移動・OCR実行・内容の変更・固定表示など）
       　を時刻付きで記録し、あとから見返せる。テキストファイルとして
       　ダウンロードも可能。

   v0.1の変更点：ピン止め表示を左右見開き・編集可能に改善／UDフォント機能を追加
   ／ログ機能を追加。
   ============================================================================ */
(function(){
  'use strict';

  function whenAppReady(fn){
    /* 本体側の各種グローバル関数・変数（setTool, notestate, buildOcrBlocksFromWords 等）が
       定義済みであることを確認してから初期化する。通常はこのスクリプトを本体の
       <script>の後に置くだけで即座に条件を満たすが、念のため待機処理を入れておく。 */
    if (typeof notestate !== 'undefined' && typeof window.setTool === 'function'){
      fn();
    } else {
      setTimeout(function(){ whenAppReady(fn); }, 50);
    }
  }

  whenAppReady(function(){

    /* ==========================================================
       0. スタイル
    ========================================================== */
    var style = document.createElement('style');
    style.textContent = [
      '.dlc-badge{display:inline-flex;align-items:center;gap:4px;background:#3E6E63;color:#fff;',
      'font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:6px;vertical-align:middle;}',
      '.tool-btn.dlc-forced-active{outline:2px solid #B5432E;outline-offset:-2px;background:#EFD9CF;}',
      '.tool-btn[data-dlc-pin]{}',
      '#canvasArea.dlc-pinned-active{justify-content:center;gap:22px;align-items:flex-start;}',
      '#dlcPinnedPane{position:sticky;top:16px;align-self:flex-start;background:#fff;border:1px solid #DAD3C4;',
      'border-radius:10px;padding:10px;box-shadow:0 4px 14px rgba(0,0,0,.15);max-height:calc(100vh - 120px);',
      'overflow:auto;flex-shrink:0;}',
      '.dlc-pin-label{font-size:12px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;',
      'justify-content:space-between;gap:10px;color:#22262E;}',
      '.dlc-pin-label button{font-size:11px;border:1px solid #ccc;background:#fff;border-radius:6px;',
      'padding:3px 9px;cursor:pointer;}',
      '.dlc-pin-label button:hover{background:#f3eee3;}',
      '.dlc-pin-stage{position:relative;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.18);overflow:hidden;',
      'border:1px solid #e8e2d4;}',
      '.dlc-pin-hint{font-size:10.5px;color:#5B6270;margin-top:8px;text-align:center;}',
      '.dlc-pin-bg,.dlc-pin-ink{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
      '.dlc-pin-block{position:absolute;cursor:pointer;border-radius:2px;}',
      '.dlc-pin-block:hover{background:rgba(181,67,46,.20);outline:1px solid rgba(181,67,46,.55);}',
      '.dlc-pin-textbox{position:absolute;white-space:pre-wrap;line-height:1.3;cursor:text;',
      'outline:1px dashed transparent;border-radius:2px;}',
      '.dlc-pin-textbox:hover,.dlc-pin-textbox:focus{outline-color:rgba(62,110,99,.5);background:rgba(62,110,99,.05);}',
      '.dlc-pin-empty{font-size:12px;color:#5B6270;text-align:center;padding:30px 10px;}'
    ].join('');
    document.head.appendChild(style);

    var brand = document.querySelector('.brand-text h1');
    if (brand) brand.insertAdjacentHTML('beforeend', ' <span class="dlc-badge">📖 ディスレクシア支援パック v0.1</span>');

    /* ==========================================================
       1. 気が散りやすい／誤操作しやすいツールを非表示化
    ========================================================== */
    var DISABLED_BTN_IDS = ['openCameraBtn', 'insertLinkBtn', 'insertImageBtn', 'insertVideoBtn', 'insertChartBtn'];
    var DISABLED_TOOL_NAMES = ['manual-add', 'read-select', 'ink-to-text'];

    function hideDisabledFeatures(){
      DISABLED_BTN_IDS.forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      DISABLED_TOOL_NAMES.forEach(function(t){
        document.querySelectorAll('.tool-btn[data-tool="' + t + '"]').forEach(function(el){
          el.style.display = 'none';
        });
      });
    }
    hideDisabledFeatures();

    /* コマンドパレット経由の /camera も塞ぐ（ボタンを隠すだけだとコマンドから
       起動できてしまうため） */
    var _origExecuteCommand = window.executeCommand;
    if (typeof _origExecuteCommand === 'function'){
      window.executeCommand = async function(raw){
        var trimmed = (raw || '').trim();
        if (/^\/camera\b/i.test(trimmed)){
          if (typeof window.cmdLog === 'function'){
            window.cmdLog('ディスレクシア支援パックが有効なため、カメラ機能は無効化されています。', 'cmd-error');
          }
          return;
        }
        return _origExecuteCommand(raw);
      };
    }

    /* ==========================================================
       2. 部分OCR縦+ ／ 部分OCR横+ （向き固定＋高精度クイックツール）
       既存の「部分OCR」ツール（data-tool="ocr-select"）をそのまま利用しつつ、
       起動前に「向き強制フラグ」と「精度ブーストフラグ」をセットしておき、
       ocrSelectionAndRead() 側でそれを見て挙動を変える。
    ========================================================== */
    window.dlcForcedOrientation = null; // 'vertical' | 'horizontal' | null
    window.dlcBoost = false;

    var toolGrid = document.getElementById('toolGrid');
    var baseOcrBtn = toolGrid ? toolGrid.querySelector('.tool-btn[data-tool="ocr-select"]') : null;

    function makeForcedOcrButton(id, label, glyph, orientation, title){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tool-btn';
      btn.id = id;
      btn.title = title;
      btn.innerHTML = '<span class="glyph">' + glyph + '</span>' + label;
      btn.addEventListener('click', function(){
        var alreadyActive = (currentTool === 'ocr-select') && (window.dlcForcedOrientation === orientation);
        if (alreadyActive){
          /* もう一度押すと解除して通常ツールに戻す */
          window.dlcForcedOrientation = null;
          window.dlcBoost = false;
          window.setTool('select');
        } else {
          window.setTool('ocr-select');
          window.dlcForcedOrientation = orientation;
          window.dlcBoost = true;
        }
        updateForcedOcrButtonsUI();
      });
      return btn;
    }
    var vertPlusBtn = makeForcedOcrButton(
      'dlcOcrVertPlusBtn', '部分OCR縦+', '🔎', 'vertical',
      '範囲をドラッグして縦書き固定・高精度でOCR＋読み上げ（ディスレクシア支援パック）'
    );
    var horizPlusBtn = makeForcedOcrButton(
      'dlcOcrHorizPlusBtn', '部分OCR横+', '🔎', 'horizontal',
      '範囲をドラッグして横書き固定・高精度でOCR＋読み上げ（ディスレクシア支援パック）'
    );
    if (baseOcrBtn && baseOcrBtn.parentNode){
      baseOcrBtn.parentNode.insertBefore(vertPlusBtn, baseOcrBtn.nextSibling);
      baseOcrBtn.parentNode.insertBefore(horizPlusBtn, vertPlusBtn.nextSibling);
    }

    function updateForcedOcrButtonsUI(){
      var active = currentTool === 'ocr-select' && window.dlcForcedOrientation;
      vertPlusBtn.classList.toggle('dlc-forced-active', active === 'vertical');
      horizPlusBtn.classList.toggle('dlc-forced-active', active === 'horizontal');
    }

    /* ツールグリッド内の「他の」ツールボタン（部分OCR縦+/横+以外）が押されたら、
       強制向き設定を解除する。イベント委任なので後から追加されたボタンにも効く。 */
    if (toolGrid){
      toolGrid.addEventListener('click', function(e){
        var btn = e.target.closest('.tool-btn');
        if (!btn) return;
        if (btn.id === 'dlcOcrVertPlusBtn' || btn.id === 'dlcOcrHorizPlusBtn') return;
        window.dlcForcedOrientation = null;
        window.dlcBoost = false;
        updateForcedOcrButtonsUI();
      });
    }

    /* ocrSelectionAndRead() をラップして、強制向き・ブースト設定を反映する。
       中身を丸ごと差し替えるのではなく、向き判定用のDOM値を一時的に差し替えてから
       元の実装を呼び、終わったら戻す方式にすることで、元関数の他のロジック
       （読み上げキューの構築や右パネルへの反映など）をそのまま安全に再利用する。 */
    var _origOcrSelectionAndRead = window.ocrSelectionAndRead;
    if (typeof _origOcrSelectionAndRead === 'function'){
      window.ocrSelectionAndRead = async function(rect){
        var orientSelect = document.getElementById('partialOcrOrientation');
        var prevOrientValue = orientSelect ? orientSelect.value : null;
        var prevBoost = ocrPrecisionBoost;
        try {
          if (window.dlcForcedOrientation && orientSelect){
            orientSelect.value = window.dlcForcedOrientation;
          }
          if (window.dlcBoost){
            ocrPrecisionBoost = true;
          }
          await _origOcrSelectionAndRead(rect);
        } finally {
          if (orientSelect && prevOrientValue !== null) orientSelect.value = prevOrientValue;
          ocrPrecisionBoost = prevBoost;
        }
      };
    }

    /* ==========================================================
       3. 区切り線：左右分割（縦の区切り線）を横書きページでも反映する
       本体の buildOcrBlocksFromWords() は、横書きページの組み立て時に
       水平方向の区切り線（上下分割 / hDiv）しか使っておらず、垂直方向の
       区切り線（左右分割 / vDiv）は計算されるだけで実際には使われていなかった。
       ここでは横書きページのときだけ、先にvDivで左→右の領域に分けてから
       各領域ごとに行を組み立てるよう差し替える（縦書きページの挙動は
       本体のロジックのまま変更しない）。
    ========================================================== */
    var _origBuildOcrBlocksFromWords = window.buildOcrBlocksFromWords;
    if (typeof _origBuildOcrBlocksFromWords === 'function' &&
        typeof window.clusterWordsPerp === 'function' &&
        typeof window.splitByGapAlong === 'function' &&
        typeof window.median === 'function'){
      window.buildOcrBlocksFromWords = function(data, scale, vertical, dividers){
        if (vertical){
          /* 縦書きページは本体の挙動をそのまま使う（今回のDLCの対象外） */
          return _origBuildOcrBlocksFromWords(data, scale, vertical, dividers);
        }
        var s = scale || 1;
        if (!data.words || !data.words.length) return null;
        var words = data.words.filter(function(w){ return w.text && w.text.trim() && w.bbox; }).map(function(w){
          return {
            text: w.text.trim(),
            x: w.bbox.x0 / s, y: w.bbox.y0 / s,
            w: Math.max(2, (w.bbox.x1 - w.bbox.x0) / s), h: Math.max(2, (w.bbox.y1 - w.bbox.y0) / s),
            confidence: w.confidence || 0
          };
        });
        if (!words.length) return [];
        var hDiv = (dividers && dividers.horizontal) || [];
        var vDiv = ((dividers && dividers.vertical) || []).slice().sort(function(a,b){ return a - b; });
        var blocks = [];

        function regionsFromVDiv(ws){
          if (!vDiv.length) return [ws];
          var bounds = [-Infinity].concat(vDiv, [Infinity]);
          var regions = [];
          for (var i = 0; i < bounds.length - 1; i++){
            var lo = bounds[i], hi = bounds[i+1];
            var inRegion = ws.filter(function(w){
              var cx = w.x + w.w / 2;
              return cx >= lo && cx < hi;
            });
            if (inRegion.length) regions.push(inRegion);
          }
          return regions.length ? regions : [ws];
        }

        var regions = regionsFromVDiv(words); // vDivが昇順ソート済みなので、自然に左→右の順になる
        regions.forEach(function(regionWords, ri){
          var rows = window.clusterWordsPerp(regionWords, false);
          var lines = rows.map(function(r){
            var x0 = Math.min.apply(null, r.words.map(function(w){ return w.x; }));
            var x1 = Math.max.apply(null, r.words.map(function(w){ return w.x + w.w; }));
            return {
              x: x0, y: r.y0, w: x1 - x0, h: r.y1 - r.y0,
              text: r.words.map(function(w){ return w.text; }).join(' '),
              confidence: window.median(r.words.map(function(w){ return w.confidence; })) || 0
            };
          }).sort(function(a,b){ return a.y - b.y; });
          var segs = window.splitByGapAlong(lines, 'y', 'h', hDiv);
          segs.forEach(function(seg, si){
            var x0 = Math.min.apply(null, seg.map(function(l){ return l.x; }));
            var x1 = Math.max.apply(null, seg.map(function(l){ return l.x + l.w; }));
            var y0 = Math.min.apply(null, seg.map(function(l){ return l.y; }));
            var y1 = Math.max.apply(null, seg.map(function(l){ return l.y + l.h; }));
            blocks.push({
              id: 'ocr_' + Date.now() + '_' + ri + '_' + si,
              text: seg.map(function(l){ return l.text; }).join(' '),
              x: x0, y: y0, w: x1 - x0, h: y1 - y0,
              source: 'auto', confidence: window.median(seg.map(function(l){ return l.confidence; })) || 0
            });
          });
        });
        return blocks;
      };
    }

    /* ==========================================================
       4. ページのピン止め（固定表示・二つ並び表示）
    ========================================================== */
    window.dlcPinnedPageIndex = null;

    var canvasArea = document.getElementById('canvasArea');
    var pinnedPane = document.createElement('div');
    pinnedPane.id = 'dlcPinnedPane';
    pinnedPane.style.display = 'none';
    /* 【修正】固定ページは「右側」に、通常ページと同じくらいの大きさで、
       見開き（教科書の左右2ページ）のように並べて表示する。
       以前は左側にサムネイル程度の小さいサイズで表示していたため、
       ユーザーが想定していた「二画面で編集できるような見開き」感が
       出ていなかった。canvasArea の最後に追加することで通常ページ（左）→
       固定ページ（右）の順になる。 */
    if (canvasArea) canvasArea.appendChild(pinnedPane);

    var pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.id = 'dlcPinToggleBtn';
    pinBtn.className = 'tool-btn';
    pinBtn.setAttribute('data-dlc-pin', '1');
    pinBtn.title = '今表示しているページを固定表示する（もう一度押すと解除）。固定中は右側に見開き表示され続け、左側で通常どおり別のページに移動できます。固定側のテキストボックスはそのまま文字を編集できます。';
    pinBtn.innerHTML = '<span class="glyph">📌</span>ピン止め';
    pinBtn.addEventListener('click', function(){
      if (window.dlcPinnedPageIndex === currentPageIndex){
        window.dlcPinnedPageIndex = null;
      } else {
        window.dlcPinnedPageIndex = currentPageIndex;
      }
      renderPinnedPane();
      updatePinButtonUI();
    });
    if (toolGrid) toolGrid.appendChild(pinBtn);

    function updatePinButtonUI(){
      pinBtn.classList.toggle('dlc-forced-active', window.dlcPinnedPageIndex === currentPageIndex && window.dlcPinnedPageIndex !== null);
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, function(c){
        return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
      });
    }

    function renderPinnedPane(){
      if (!pinnedPane) return;
      var idx = window.dlcPinnedPageIndex;
      if (idx === null || idx === undefined || !notestate.pages[idx]){
        pinnedPane.style.display = 'none';
        if (canvasArea) canvasArea.classList.remove('dlc-pinned-active');
        return;
      }
      var p = notestate.pages[idx];
      pinnedPane.style.display = '';
      if (canvasArea) canvasArea.classList.add('dlc-pinned-active');

      /* 見開き表示：本物のページ（左）と同じくらいの大きさで並べたいので、
         画面の空きスペースに応じて幅を決める（小さすぎるサムネイルにしない）。 */
      var available = canvasArea ? canvasArea.clientWidth : 900;
      var paneWidth = Math.max(260, Math.min(560, available * 0.42));
      var scale = paneWidth / p.width;
      var stageH = p.height * scale;

      pinnedPane.innerHTML =
        '<div class="dlc-pin-label">📌 ページ ' + (idx + 1) + ' を固定表示中（見開き右側）' +
        '<button id="dlcUnpinBtn" type="button">✕ 解除</button></div>' +
        '<div class="dlc-pin-stage" style="width:' + paneWidth + 'px;height:' + stageH + 'px;"></div>' +
        '<div class="dlc-pin-hint">テキストボックスの文字はここでも編集できます</div>';

      var stage = pinnedPane.querySelector('.dlc-pin-stage');

      if (!p.bgImage && (!p.ocrBlocks || !p.ocrBlocks.length) && (!p.textBoxes || !p.textBoxes.length)){
        var empty = document.createElement('div');
        empty.className = 'dlc-pin-empty';
        empty.textContent = 'このページにはまだ内容がありません';
        stage.appendChild(empty);
      }
      if (p.bgImage){
        var img = document.createElement('img');
        img.className = 'dlc-pin-bg';
        img.src = p.bgImage;
        stage.appendChild(img);
      }
      if (p.ink){
        var inkImg = document.createElement('img');
        inkImg.className = 'dlc-pin-ink';
        inkImg.src = p.ink;
        stage.appendChild(inkImg);
      }
      (p.ocrBlocks || []).forEach(function(b){
        if (b.excludeFromReading) return;
        var box = document.createElement('div');
        box.className = 'dlc-pin-block';
        box.style.left = (b.x * scale) + 'px';
        box.style.top = (b.y * scale) + 'px';
        box.style.width = (b.w * scale) + 'px';
        box.style.height = (b.h * scale) + 'px';
        box.title = 'クリックで読み上げ：' + (b.text || '').slice(0, 40);
        box.addEventListener('click', function(){
          if (!('speechSynthesis' in window)) return;
          speechSynthesis.cancel();
          var utter = new SpeechSynthesisUtterance(b.text);
          utter.lang = 'ja-JP';
          utter.rate = (typeof ttsRate === 'number' ? ttsRate : 1);
          speechSynthesis.speak(utter);
        });
        stage.appendChild(box);
      });
      /* 【改善】固定側のテキストボックスは編集可能（contenteditable）にし、
         入力内容をそのままページデータ（p.textBoxes）へ書き戻す。
         「二つとも編集できる見開き」というイメージに近づけるための対応。
         手書き（ペン）はページごとに1枚のinkCanvasに焼き込む仕組みのため、
         固定側での手書き編集には対応していない（読み上げ・文字編集のみ）。 */
      (p.textBoxes || []).forEach(function(tb){
        var box = document.createElement('div');
        box.className = 'dlc-pin-textbox';
        box.contentEditable = 'true';
        box.spellcheck = false;
        box.style.left = (tb.x * scale) + 'px';
        box.style.top = (tb.y * scale) + 'px';
        box.style.width = (tb.w * scale) + 'px';
        box.style.height = (tb.h * scale) + 'px';
        box.style.fontSize = Math.max(7, (tb.fontSize || 20) * scale) + 'px';
        box.style.color = tb.color || '#22262E';
        box.style.fontWeight = tb.bold ? '700' : '400';
        box.textContent = tb.text || '';
        box.addEventListener('input', function(){
          tb.text = box.textContent;
          /* 今まさに表示中のページと同じ場合は、通常表示側にもすぐ反映する */
          if (idx === currentPageIndex && typeof renderTextBoxes === 'function') renderTextBoxes();
        });
        box.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
        stage.appendChild(box);
      });

      var unpinBtn = document.getElementById('dlcUnpinBtn');
      if (unpinBtn){
        unpinBtn.addEventListener('click', function(){
          window.dlcPinnedPageIndex = null;
          renderPinnedPane();
          updatePinButtonUI();
        });
      }
    }

    /* 画面サイズが変わったとき（ウィンドウリサイズ等）も見開きの比率を保つ */
    window.addEventListener('resize', function(){ renderPinnedPane(); });

    /* ページ切り替え・OCR実行のたびにピン止めペインの表示状態／内容を更新する */
    var _origLoadPage = window.loadPage;
    if (typeof _origLoadPage === 'function'){
      window.loadPage = function(idx){
        var r = _origLoadPage(idx);
        updatePinButtonUI();
        renderPinnedPane();
        return r;
      };
    }
    var _origRunOcr = window.runOcr;
    if (typeof _origRunOcr === 'function'){
      window.runOcr = async function(pageIndex){
        var r = await _origRunOcr(pageIndex);
        if (window.dlcPinnedPageIndex === pageIndex) renderPinnedPane();
        return r;
      };
    }

    updatePinButtonUI();
    renderPinnedPane();

    /* ==========================================================
       5. UDフォント（ディスレクシアに配慮したフォント）への切り替え
       モリサワ「BIZ UDゴシック／BIZ UD明朝」は、UDフォントシリーズのうち
       オープンソース化されGoogleフォントとして無料で使える書体。
       文字の形の判別しやすさ・読みやすさに配慮して設計されている。
    ========================================================== */
    var udFontLink = document.createElement('link');
    udFontLink.rel = 'stylesheet';
    udFontLink.href = 'https://fonts.googleapis.com/css2?family=BIZ+UDGothic:wght@400;700&family=BIZ+UDPGothic:wght@400;700&display=swap';
    document.head.appendChild(udFontLink);

    var udFontStyle = document.createElement('style');
    udFontStyle.textContent =
      "html.dlc-ud-font body, html.dlc-ud-font button, html.dlc-ud-font input, html.dlc-ud-font textarea, " +
      "html.dlc-ud-font .textbox, html.dlc-ud-font h1, html.dlc-ud-font h2, html.dlc-ud-font h3 { " +
      "font-family:'BIZ UDGothic','BIZ UDPGothic','Yu Gothic UI',sans-serif !important; }";
    document.head.appendChild(udFontStyle);

    var UD_FONT_KEY = 'yomiDlcUdFontEnabled';
    function applyUdFontState(){
      var on = false;
      try { on = localStorage.getItem(UD_FONT_KEY) === 'true'; } catch(e){}
      document.documentElement.classList.toggle('dlc-ud-font', on);
      return on;
    }
    var udFontBtn = document.createElement('button');
    udFontBtn.type = 'button';
    udFontBtn.className = 'tool-btn';
    udFontBtn.id = 'dlcUdFontBtn';
    udFontBtn.title = 'ディスレクシアに配慮したUDフォント（BIZ UDゴシック）に切り替えます。もう一度押すと元のフォントに戻ります。';
    udFontBtn.innerHTML = '<span class="glyph">Aa</span>UDフォント';
    udFontBtn.addEventListener('click', function(){
      var wasOn = document.documentElement.classList.contains('dlc-ud-font');
      var next = !wasOn;
      try { localStorage.setItem(UD_FONT_KEY, next ? 'true' : 'false'); } catch(e){}
      document.documentElement.classList.toggle('dlc-ud-font', next);
      udFontBtn.classList.toggle('dlc-forced-active', next);
      if (typeof flashToast === 'function') flashToast(next ? 'UDフォントに切り替えました' : '通常のフォントに戻しました');
      dlcLog('UDフォント切替', next ? 'オンにした' : 'オフにした');
    });
    if (toolGrid) toolGrid.appendChild(udFontBtn);
    udFontBtn.classList.toggle('dlc-forced-active', applyUdFontState());

    /* ==========================================================
       6. ログ機能：このページで行った操作を時刻付きで記録するツール
       ページ移動・OCR実行・ページ内容の変化（テキストボックスや画像・数式の
       追加編集など）・ピン止め操作などを検知し、あとから見返せるようにする。
    ========================================================== */
    window.dlcChangeLog = window.dlcChangeLog || [];
    function dlcLog(action, detail){
      window.dlcChangeLog.push({ time: new Date(), pageIndex: currentPageIndex, action: action, detail: detail || '' });
      if (window.dlcChangeLog.length > 500) window.dlcChangeLog.shift();
      refreshDlcLogPanelIfOpen();
    }

    var _origLoadPage2 = window.loadPage;
    if (typeof _origLoadPage2 === 'function'){
      window.loadPage = function(idx){
        var r = _origLoadPage2(idx);
        dlcLog('ページ移動', 'ページ ' + (idx + 1) + ' を表示');
        return r;
      };
    }
    var _origRunOcr2 = window.runOcr;
    if (typeof _origRunOcr2 === 'function'){
      window.runOcr = async function(pageIndex){
        dlcLog('OCR実行', 'ページ ' + (pageIndex + 1) + ' のOCRを開始');
        var r = await _origRunOcr2(pageIndex);
        dlcLog('OCR完了', 'ページ ' + (pageIndex + 1) + ' のOCRが完了');
        return r;
      };
    }

    var dlcPageMutationTimer = null;
    var dlcPageObserver = new MutationObserver(function(){
      clearTimeout(dlcPageMutationTimer);
      dlcPageMutationTimer = setTimeout(function(){
        var page = notestate.pages[currentPageIndex];
        if (!page) return;
        dlcLog('ページ内容の変更', 'テキストボックス' + (page.textBoxes || []).length + '個／画像・数式等' + (page.mediaObjects || []).length + '個');
      }, 800);
    });
    var dlcPageElForObserve = document.getElementById('pageEl');
    if (dlcPageElForObserve) dlcPageObserver.observe(dlcPageElForObserve, { childList: true, subtree: true });

    pinBtn.addEventListener('click', function(){
      if (dlcPinnedPageIndex === currentPageIndex) dlcLog('ページを固定表示', 'ページ ' + (currentPageIndex + 1));
      else dlcLog('固定表示を解除', '');
    });
    vertPlusBtn.addEventListener('click', function(){ dlcLog('部分OCR縦+を使用', ''); });
    horizPlusBtn.addEventListener('click', function(){ dlcLog('部分OCR横+を使用', ''); });

    var dlcLogBtn = document.createElement('button');
    dlcLogBtn.type = 'button';
    dlcLogBtn.className = 'tool-btn';
    dlcLogBtn.id = 'dlcLogBtn';
    dlcLogBtn.title = 'このページで行った操作の変更ログを表示します。';
    dlcLogBtn.innerHTML = '<span class="glyph">📝</span>ログ';
    dlcLogBtn.addEventListener('click', openDlcLogModal);
    if (toolGrid) toolGrid.appendChild(dlcLogBtn);

    var dlcLogModal = null;
    function ensureDlcLogModal(){
      if (dlcLogModal) return dlcLogModal;
      dlcLogModal = document.createElement('div');
      dlcLogModal.className = 'modal-overlay hidden';
      dlcLogModal.id = 'dlcLogModal';
      dlcLogModal.innerHTML =
        '<div class="modal-box" style="width:460px;max-width:92vw;">' +
          '<h3>📝 変更ログ（このページ）</h3>' +
          '<div id="dlcLogList" style="max-height:320px;overflow-y:auto;font-size:12px;line-height:1.7;' +
          'background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:12px;"></div>' +
          '<div class="modal-actions">' +
            '<button class="btn" id="dlcLogClearBtn" type="button">クリア</button>' +
            '<button class="btn" id="dlcLogDownloadBtn" type="button">⬇ ダウンロード</button>' +
            '<button class="btn primary" id="dlcLogCloseBtn" type="button">閉じる</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(dlcLogModal);
      dlcLogModal.querySelector('#dlcLogCloseBtn').addEventListener('click', function(){ dlcLogModal.classList.add('hidden'); });
      dlcLogModal.querySelector('#dlcLogClearBtn').addEventListener('click', function(){
        window.dlcChangeLog = window.dlcChangeLog.filter(function(e){ return e.pageIndex !== currentPageIndex; });
        renderDlcLogList();
      });
      dlcLogModal.querySelector('#dlcLogDownloadBtn').addEventListener('click', function(){
        var page = currentPageIndex;
        var lines = window.dlcChangeLog.filter(function(e){ return e.pageIndex === page; }).map(function(e){
          return e.time.toLocaleString('ja-JP') + '\t' + e.action + '\t' + e.detail;
        });
        if (!lines.length){ if (typeof flashToast === 'function') flashToast('このページにはまだログがありません'); return; }
        var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'page' + (page + 1) + '_change_log.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
      return dlcLogModal;
    }
    function refreshDlcLogPanelIfOpen(){
      if (!dlcLogModal || dlcLogModal.classList.contains('hidden')) return;
      renderDlcLogList();
    }
    function renderDlcLogList(){
      var list = document.getElementById('dlcLogList');
      if (!list) return;
      var entries = window.dlcChangeLog.filter(function(e){ return e.pageIndex === currentPageIndex; });
      if (!entries.length){
        list.innerHTML = '<div style="color:var(--ink-soft);">このページにはまだログがありません</div>';
        return;
      }
      list.innerHTML = entries.slice().reverse().map(function(e){
        return '<div style="margin-bottom:6px;"><b>' + e.time.toLocaleTimeString('ja-JP') + '</b>　' +
          escapeHtml(e.action) + (e.detail ? '　―　' + escapeHtml(e.detail) : '') + '</div>';
      }).join('');
    }
    function openDlcLogModal(){
      ensureDlcLogModal();
      renderDlcLogList();
      dlcLogModal.classList.remove('hidden');
    }

    dlcLog('ディスレクシア支援パックを有効化', 'v0.1');

    console.log('[読みノート] ディスレクシア支援パック v0.1 を有効化しました。');
  });
})();
