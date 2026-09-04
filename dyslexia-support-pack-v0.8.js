/* ============================================================================
   読みノート (Yomi-Note) 追加DLC
   ディスレクシア支援パック v0.8
   ----------------------------------------------------------------------------
   このスクリプトは index.html（アプリ本体）の </body> 直前、本体の
   <script>...</script> より「後」に以下のように読み込んでください。

     <script src="dyslexia-support-pack-v0.8.js"></script>
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
     ・ページのピン止め（📌／v0.6-v0.7で見やすさ・使いやすさを大幅改善）
       　今見ているページを「固定表示」しておくと、以降ページを移動しても
       　固定したページが画面右側にサイドパネルとして表示され続ける（上部バーの
       　真下から表示されるので、上部バーのボタン類が隠れることもない）。
       　パネルは通常ページのレイアウトとは完全に分離した「浮かぶ固定パネル」
       　なので、固定中でも今作業中の普通のページのツール・機能（OCR・数式・
       　画像挿入など）は今まで通りすべてそのまま使える。パネル左端をドラッグ
       　して幅を自由に変更でき、「◀縮小」でパネルを細く折りたたむこともできる。
       　固定側では選択・ペン・消しゴム・文字ツールが使え、画像やグラフ・数式・
       　リンクもそのまま表示される。テキストボックスはドラッグでの移動・つまみ
       　でのサイズ変更・🔊読み上げ・縦書き/横書き切替にも対応し、認識済みブロック
       　はクリックで読み上げられる。
     ・UDフォント（Aa）
       　ディスレクシアに配慮して設計された書体「BIZ UDゴシック」に、
       　ノート全体の文字を切り替えられる。もう一度押すと元に戻る。
     ・ログ（📝）
       　このページで行った操作（ページ移動・OCR実行・内容の変更・固定表示など）
       　を時刻付きで記録し、あとから見返せる。テキストファイルとして
       　ダウンロードも可能。
     ・ボタン読み上げ（🔊／v0.8で操作方法を改善）
       　アプリ内のほぼ全てのボタン（ツールバー・上部バー・ページ操作・
       　各種ダイアログ・DLC一覧・ピン止めパネルなど）を「押した瞬間」に、
       　そのボタンの名前や説明（title属性、なければ表示文字）を音声で
       　読み上げる。小さなバッジを別に狙って押す必要はなく、ボタンを普通に
       　押すだけでよい（読み上げはボタン本来のクリック動作を妨げないので、
       　押せば読み上げも動作も両方行われる）。コマンドパレットで
       　「/all command」等を実行したときに表示される、コマンドの構文・説明の
       　各行も同様に押すと読み上げられる。新しく追加されるダイアログやリスト
       　（DLC一覧・変更ログなど）にも自動で反映される。オン/オフはツールバーの
       　「🔊ボタン読み上げ」でいつでも切り替えられ、初期状態はオン。

   v0.1の変更点：ピン止め表示を左右見開き・編集可能に改善／UDフォント機能を追加
   ／ログ機能を追加。
   v0.2の変更点：ピン止め表示を「元のページと同じ解像度＋拡大縮小可能」に変更し、
   固定側にもペンでの手書き・テキストボックスの新規追加ができるように改善。
   v0.3の変更点：【不具合修正】固定表示が既定で原寸(100%)のまま開始していたため、
   パネル幅に収まらず「ほぼ真っ白で壊れて見える」状態になっていた問題を修正。
   固定した瞬間はパネル幅に収まる倍率で自動的に表示し、そこから－/＋/原寸で
   調整できるようにした。
   v0.4の変更点：【不具合修正】見開き表示時に中央寄せレイアウトを使っていたため、
   固定パネルの分だけ幅が足りないと、左側にあるはずの「今作業しているページ」の方が
   画面外に隠れてしまう不具合を修正。左詰め表示に変更し、常に横スクロール位置を
   先頭へ戻すことで、今のページが必ず画面内に見えるようにした。
   v0.5の変更点：【最強アップデート】アプリ内のほぼ全ボタン・コマンド構文の行に、
   個別に読み上げできる小さな🔊バッジを自動付与する「ボタン読み上げ」機能を新規追加
   （オン/オフ切替可能・初期オン）。ダイアログやDLC一覧など後から生成される要素にも
   自動追従する。
   v0.6の変更点：【ピン止め機能を大幅改善】これまでピン止めパネルを普通のページと
   横並びのflexレイアウトで表示していたため、幅が足りないと窮屈になり見づらく、
   パネル側の操作に気を取られると普通のページ側が扱いにくく感じられる状態だった。
   パネルを「普通のページのレイアウトには一切影響しない、画面右端に浮かぶ固定サイド
   パネル」に変更し、固定中でも今作業中の普通のページのツール・機能は完全に今まで
   通り使えるようにした。あわせて、パネル幅をドラッグで自由に変更できるようにし、
   「◀縮小」で細く折りたためるようにして見やすさを改善。固定側で使えるツールに
   「🧹消す（消しゴム）」を追加し、画像・グラフ・数式・リンクも固定表示にそのまま
   表示されるようにした（これまでは背景画像・手書き・OCR認識結果・テキストボックス
   のみ表示で、画像などが固定側からは見えなかった）。
   v0.7の変更点：【不具合修正】固定パネルがtop:0の全画面高さで表示されていたため、
   上部バー（🏠📖📜🧩・元に戻す・ページ送り・ズーム等）の右側が固定パネルの下に
   隠れて操作できなくなっていた問題を修正。上部バーの実際の高さを測り、その真下から
   パネルを表示するようにした。あわせて、固定パネル側のテキストボックスがこれまで
   削除しかできなかった問題を解消し、ドラッグでの移動・つまみでのサイズ変更・
   🔊読み上げ・縦書き/横書き切替を新たに追加。改行すると内容が壊れて見える不具合も、
   本体アプリ側とあわせて修正した（Enterキーを横取りしてプレーンな改行文字として
   挿入する方式に変更）。
   v0.8の変更点：【不具合修正】ボタン読み上げが、ボタンの右上に重ねた小さな🔊バッジを
   狙って押す方式だったため、誤って本体のボタンを押してしまうという声を受けて改善。
   バッジを廃止し、ボタンを「押した瞬間」に名前や説明を読み上げるようにした（本体の
   クリック動作は妨げないので、普通に押すだけで読み上げと動作の両方が行われる）。
   【新機能】読み上げに使う声を選べる「🗣️音声選択」を追加。端末にインストールされて
   いる声の一覧から選べ、設定はブラウザ内に保存され、アプリ内のあらゆる読み上げ処理
   （本体の文章読み上げ・テキストボックスの読み上げ・DLCの読み上げなど）にまとめて
   反映される。
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
      /* v0.6: ピン止めパネルを「その場に浮かぶ固定サイドパネル」に変更。
         #canvasArea自体のflexレイアウトには一切手を加えないため、今作業中の
         普通のページ側のツール・機能（ツールバー・OCR・数式・画像挿入など）は
         ピン止め中でも今まで通りすべてそのまま使える。 */
      '#dlcPinnedPane{position:fixed;top:0;right:0;height:100vh;background:#fff;',
      'border-left:1px solid #DAD3C4;box-shadow:-8px 0 20px rgba(0,0,0,.18);z-index:60;',
      'display:flex;flex-direction:column;padding:14px 14px 10px;box-sizing:border-box;}',
      '.dlc-pin-resize-handle{position:absolute;top:0;left:-6px;width:12px;height:100%;',
      'cursor:ew-resize;z-index:61;touch-action:none;}',
      '.dlc-pin-resize-handle::after{content:"";position:absolute;left:5px;top:50%;width:3px;',
      'height:44px;margin-top:-22px;border-radius:3px;background:#DAD3C4;}',
      '.dlc-pin-resize-handle:hover::after,.dlc-pin-resize-handle.dlc-dragging::after{background:#3E6E63;}',
      '.dlc-pin-collapsed{width:40px !important;padding:14px 6px !important;overflow:hidden;}',
      '.dlc-pin-collapsed .dlc-pin-toolbar,.dlc-pin-collapsed .dlc-pin-stage-wrap,',
      '.dlc-pin-collapsed .dlc-pin-hint,.dlc-pin-collapsed .dlc-pin-label-text{display:none !important;}',
      '.dlc-pin-content{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden;}',
      '.dlc-pin-label{font-size:12px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;',
      'justify-content:space-between;gap:10px;color:#22262E;}',
      '.dlc-pin-label button{font-size:11px;border:1px solid #ccc;background:#fff;border-radius:6px;',
      'padding:3px 9px;cursor:pointer;}',
      '.dlc-pin-label button:hover{background:#f3eee3;}',
      '.dlc-pin-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:8px;',
      'padding-bottom:8px;border-bottom:1px solid #eee2d0;}',
      '.dlc-pin-tool-btn{font-size:11.5px;border:1px solid #DAD3C4;background:#FBF8F2;border-radius:14px;',
      'padding:5px 11px;cursor:pointer;color:#5B6270;}',
      '.dlc-pin-tool-btn.active{background:#22262E;color:#fff;border-color:#22262E;}',
      '.dlc-pin-zoom-group{display:flex;align-items:center;gap:4px;margin-left:auto;font-size:11px;color:#5B6270;}',
      '.dlc-pin-zoom-group button{border:1px solid #DAD3C4;background:#fff;border-radius:6px;width:24px;height:24px;',
      'cursor:pointer;font-size:13px;line-height:1;}',
      '.dlc-pin-zoom-group button:last-child{width:auto;padding:0 8px;font-size:10.5px;}',
      '.dlc-pin-stage-wrap{flex:1;min-height:80px;overflow:auto;border:1px solid #eee2d0;',
      'background:#eee9dc;}',
      '.dlc-pin-sizer{position:relative;}',
      '.dlc-pin-stage{position:absolute;top:0;left:0;transform-origin:top left;background:#fff;',
      'box-shadow:0 2px 8px rgba(0,0,0,.18);overflow:hidden;border:1px solid #e8e2d4;}',
      '.dlc-pin-hint{font-size:10.5px;color:#5B6270;margin-top:8px;text-align:center;}',
      '.dlc-pin-bg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
      '.dlc-pin-ink-canvas{position:absolute;inset:0;width:100%;height:100%;}',
      '.dlc-pin-block{position:absolute;cursor:pointer;border-radius:2px;}',
      '.dlc-pin-block:hover{background:rgba(181,67,46,.20);outline:1px solid rgba(181,67,46,.55);}',
      '.dlc-pin-textbox-holder{position:absolute;}',
      '.dlc-pin-textbox{white-space:pre-wrap;line-height:1.3;cursor:text;box-sizing:border-box;',
      'outline:1px dashed transparent;border-radius:2px;padding:2px 3px;width:100%;height:100%;overflow:hidden;}',
      '.dlc-pin-textbox:hover,.dlc-pin-textbox:focus{outline-color:rgba(62,110,99,.5);background:rgba(62,110,99,.05);}',
      '.dlc-pin-textbox-drag{position:absolute;top:-9px;left:-9px;width:18px;height:18px;border-radius:50%;',
      'border:1px solid #DAD3C4;background:#fff;color:#5B6270;font-size:10px;line-height:1;cursor:move;',
      'display:none;align-items:center;justify-content:center;padding:0;touch-action:none;z-index:9;}',
      '.dlc-pin-textbox-resize{position:absolute;right:-7px;bottom:-7px;width:16px;height:16px;border-radius:50%;',
      'background:#3E6E63;border:2px solid #fff;display:none;cursor:nwse-resize;touch-action:none;z-index:9;}',
      '.dlc-pin-textbox-toolbar{position:absolute;top:-28px;left:-1px;display:none;gap:3px;background:#22262E;',
      'padding:3px 4px;border-radius:6px;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,.25);}',
      '.dlc-pin-textbox-toolbar button{border:none;background:rgba(255,255,255,.14);color:#fff;border-radius:4px;',
      'width:20px;height:20px;font-size:10px;display:flex;align-items:center;justify-content:center;',
      'cursor:pointer;padding:0;}',
      '.dlc-pin-textbox-toolbar button:hover{background:rgba(255,255,255,.28);}',
      '.dlc-pin-textbox-holder.dlc-pin-tb-active .dlc-pin-textbox-drag,',
      '.dlc-pin-textbox-holder.dlc-pin-tb-active .dlc-pin-textbox-resize,',
      '.dlc-pin-textbox-holder.dlc-pin-tb-active .dlc-pin-textbox-toolbar{display:flex;}',
      '.dlc-pin-empty{font-size:12px;color:#5B6270;text-align:center;padding:30px 10px;}',
      '.dlc-pin-media{position:absolute;pointer-events:none;}',
      '.dlc-pin-media img{width:100%;height:100%;display:block;object-fit:contain;}',
      '.dlc-pin-media.dlc-pin-media-link{pointer-events:auto;cursor:pointer;border:1px solid #DAD3C4;',
      'border-radius:6px;background:#FBF8F2;display:flex;align-items:center;gap:5px;padding:4px 8px;',
      'font-size:11px;color:#3E6E63;box-sizing:border-box;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}',
      '.dlc-pin-media.dlc-pin-media-video{pointer-events:none;display:flex;align-items:center;',
      'justify-content:center;background:#22262E;color:#fff;font-size:11px;border-radius:6px;text-align:center;}'
    ].join('');
    document.head.appendChild(style);

    var brand = document.querySelector('.brand-text h1');
    if (brand) brand.insertAdjacentHTML('beforeend', ' <span class="dlc-badge">📖 ディスレクシア支援パック v0.8</span>');

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
       4. ページのピン止め（固定表示・見開き表示・編集対応）
       ・固定側は元のページと同じ解像度（=拡大縮小可能なズーム機能つき）で表示。
       ・固定側にもペンでの手書き・テキストボックスの追加ができる
         （どちらも通常ページのデータ p.ink / p.textBoxes にそのまま書き込むので、
         あとで通常表示に切り替えたときもそのまま反映される）。
    ========================================================== */
    window.dlcPinnedPageIndex = null;
    window.dlcPinZoom = 1;
    var dlcPinTool = 'select'; // 'select' | 'pen' | 'text'

    /* 【不具合修正】以前は固定した瞬間に必ず原寸(100%)で表示していたため、
       ページの実際のサイズ（既定で1240×1754px）がパネルの表示幅（最大900px程度）を
       大きく超えてしまい、右にスクロールしないと何も見えない「真っ白で壊れている
       ように見える」状態になっていた。固定した瞬間は、パネルの横幅にきちんと
       収まる倍率を自動計算して使うようにする（そこから－/＋/原寸で自由に調整可能）。 */
    function computeDlcPinFitZoom(p){
      var targetWidth = Math.max(220, Math.min(560, (canvasArea ? canvasArea.clientWidth : 900) * 0.42));
      var z = targetWidth / p.width;
      return Math.max(0.2, Math.min(1, Math.round(z * 100) / 100));
    }

    var canvasArea = document.getElementById('canvasArea');
    var PIN_WIDTH_KEY = 'yomiDlcPinPanelWidth';
    function getPinPanelWidth(){
      var w = 440;
      try {
        var v = parseInt(localStorage.getItem(PIN_WIDTH_KEY), 10);
        if (!isNaN(v)) w = v;
      } catch(e){}
      var maxW = Math.max(300, Math.floor(window.innerWidth * 0.85));
      return Math.max(300, Math.min(maxW, w));
    }
    function setPinPanelWidth(w){
      var maxW = Math.max(300, Math.floor(window.innerWidth * 0.85));
      w = Math.max(300, Math.min(maxW, Math.round(w)));
      try { localStorage.setItem(PIN_WIDTH_KEY, String(w)); } catch(e){}
      return w;
    }
    /* v0.6: ピン止め中も普通のページ側の操作を一切妨げないよう、パネルは
       document.body直下に固定配置し、#canvasAreaのDOM構造・レイアウトには
       手を加えない。普通のページの分だけ画面が狭く見えないよう、パネル幅の
       分だけ canvasArea に右余白を付け、パネルと重ならないようにするのみ。 */
    var pinnedPane = document.createElement('div');
    pinnedPane.id = 'dlcPinnedPane';
    pinnedPane.style.display = 'none';
    document.body.appendChild(pinnedPane);

    var pinResizeHandle = document.createElement('div');
    pinResizeHandle.className = 'dlc-pin-resize-handle';
    pinResizeHandle.title = 'ドラッグしてパネルの幅を変更';
    pinnedPane.appendChild(pinResizeHandle);
    var pinContent = document.createElement('div');
    pinContent.className = 'dlc-pin-content';
    pinnedPane.appendChild(pinContent);
    (function(){
      var dragging = false, startX = 0, startW = 0;
      pinResizeHandle.addEventListener('pointerdown', function(e){
        dragging = true; startX = e.clientX; startW = pinnedPane.getBoundingClientRect().width;
        pinResizeHandle.classList.add('dlc-dragging');
        pinResizeHandle.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      pinResizeHandle.addEventListener('pointermove', function(e){
        if (!dragging) return;
        var w = setPinPanelWidth(startW - (e.clientX - startX));
        applyPinPanelWidth(w);
      });
      function endDrag(){ dragging = false; pinResizeHandle.classList.remove('dlc-dragging'); }
      pinResizeHandle.addEventListener('pointerup', endDrag);
      pinResizeHandle.addEventListener('pointercancel', endDrag);
    })();
    function dlcPinPanelTopOffset(){
      var topbarEl = document.getElementById('topbar');
      return topbarEl ? Math.ceil(topbarEl.getBoundingClientRect().bottom) : 0;
    }
    function applyPinPanelWidth(w){
      /* 【不具合修正】パネルがtop:0の固定表示だったため、上部バー（🏠📖📜🧩やズーム、
         元に戻す等）の右側のボタン類が固定パネルの下に隠れて押せなくなっていた。
         上部バーの実際の高さ（折り返しで高さが変わる場合も含む）を毎回測り、その
         下からパネルを開始するように修正。 */
      var topOffset = dlcPinPanelTopOffset();
      pinnedPane.style.top = topOffset + 'px';
      pinnedPane.style.height = 'calc(100vh - ' + topOffset + 'px)';
      if (window.dlcPinCollapsed){
        pinnedPane.classList.add('dlc-pin-collapsed');
        if (canvasArea) canvasArea.style.paddingRight = '52px';
        return;
      }
      pinnedPane.classList.remove('dlc-pin-collapsed');
      pinnedPane.style.width = w + 'px';
      if (canvasArea && window.dlcPinnedPageIndex !== null && window.dlcPinnedPageIndex !== undefined){
        canvasArea.style.paddingRight = (w + 28) + 'px';
      }
    }

    var pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.id = 'dlcPinToggleBtn';
    pinBtn.className = 'tool-btn';
    pinBtn.setAttribute('data-dlc-pin', '1');
    pinBtn.title = '今表示しているページを固定表示する（もう一度押すと解除）。固定中は画面右側にパネル表示され、幅はドラッグで変更でき、今作業中の普通のページ側のツールもそのまま使えます。';
    pinBtn.innerHTML = '<span class="glyph">📌</span>ピン止め';
    pinBtn.addEventListener('click', function(){
      if (window.dlcPinnedPageIndex === currentPageIndex){
        window.dlcPinnedPageIndex = null;
      } else {
        window.dlcPinnedPageIndex = currentPageIndex;
        var p0 = notestate.pages[currentPageIndex];
        window.dlcPinZoom = p0 ? computeDlcPinFitZoom(p0) : 1;
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

    /* 固定側の手書き用：メインページのペンと同じ「曲線スムージング」方式で描く。
       色・太さはメインのツールバーで選ばれている penColor / penWidth をそのまま使う。 */
    var dlcPinSmoothPts = [];
    var dlcPinDrawing = false;
    function dlcPinGetPoint(e, stage){
      var rect = stage.getBoundingClientRect();
      var z = window.dlcPinZoom || 1;
      return { x: (e.clientX - rect.left) / z, y: (e.clientY - rect.top) / z };
    }
    /* v0.7: テキストボックスの改行不具合対策。contentEditableのデフォルトのEnter挙動は
       ブラウザによって<div>や<br>が入り乱れ、textContentだけで読み取ると改行が消えたり
       内容が二重に見えることがあった。Enterキーを横取りして必ず素のテキストノードとして
       改行文字を挿入し、DOM構造をシンプルに保つことで、この種の不具合を避ける。
       それでもモバイルの日本語入力などで<div>/<br>が混ざった場合に備え、textContentでは
       なくDOMを歩いて改行を正しく復元するヘルパーも用意する。 */
    function dlcTextBoxPlainText(el){
      var text = '';
      el.childNodes.forEach(function(node){
        if (node.nodeType === 3){ text += node.nodeValue; }
        else if (node.nodeType === 1 && node.tagName === 'BR'){ text += '\n'; }
        else if (node.nodeType === 1 && (node.tagName === 'DIV' || node.tagName === 'P')){
          if (text.length && text.charAt(text.length - 1) !== '\n') text += '\n';
          text += dlcTextBoxPlainText(node);
        } else if (node.nodeType === 1){
          text += node.textContent || '';
        }
      });
      return text;
    }
    function dlcHandleTextBoxEnterKey(e){
      if (e.key !== 'Enter') return;
      e.preventDefault();
      try {
        document.execCommand('insertText', false, '\n');
      } catch(err){
        var sel = window.getSelection();
        if (sel && sel.rangeCount){
          var range = sel.getRangeAt(0);
          range.deleteContents();
          var nl = document.createTextNode('\n');
          range.insertNode(nl);
          range.setStartAfter(nl); range.setEndAfter(nl);
          sel.removeAllRanges(); sel.addRange(range);
        }
      }
    }
    function dlcPinMidPoint(a, b){ return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
    function dlcPinStrokeSegment(ctx, erase){
      var n = dlcPinSmoothPts.length;
      if (n < 3) return;
      var p0 = dlcPinSmoothPts[n-3], p1 = dlcPinSmoothPts[n-2], p2 = dlcPinSmoothPts[n-1];
      var start = dlcPinMidPoint(p0, p1), end = dlcPinMidPoint(p1, p2);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (erase){
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = ((typeof penWidth === 'number' && penWidth) ? penWidth : 3) * 4;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = (typeof penColor === 'string' && penColor) ? penColor : '#22262E';
        ctx.lineWidth = (typeof penWidth === 'number' && penWidth) ? penWidth : 3;
      }
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(p1.x, p1.y, end.x, end.y);
      ctx.stroke();
    }

    function renderPinnedPane(){
      if (!pinnedPane) return;
      var idx = window.dlcPinnedPageIndex;
      if (idx === null || idx === undefined || !notestate.pages[idx]){
        pinnedPane.style.display = 'none';
        if (canvasArea) canvasArea.style.paddingRight = '';
        return;
      }
      var p = notestate.pages[idx];
      pinnedPane.style.display = 'flex';
      /* v0.6: パネルは画面右端に固定表示（#canvasAreaの中には入れない）ので、
         普通のページ側のスクロール位置やレイアウトはピン止めの影響を受けない。
         パネルと重ならないよう、canvasAreaにパネル幅分の右余白だけを付ける。 */
      applyPinPanelWidth(getPinPanelWidth());

      var zoom = window.dlcPinZoom || 1;

      pinContent.innerHTML =
        '<div class="dlc-pin-label"><span class="dlc-pin-label-text">📌 ページ ' + (idx + 1) + ' を固定表示中</span>' +
        '<span>' +
          '<button id="dlcPinCollapseBtn" type="button" title="パネルを折りたたんで細くする（もう一度押すと戻る）">' + (window.dlcPinCollapsed ? '▶ 開く' : '◀ 縮小') + '</button> ' +
          '<button id="dlcUnpinBtn" type="button">✕ 解除</button>' +
        '</span></div>' +
        '<div class="dlc-pin-toolbar">' +
          '<button type="button" class="dlc-pin-tool-btn" data-tool="select" title="選択・読み上げ">👆 選択</button>' +
          '<button type="button" class="dlc-pin-tool-btn" data-tool="pen" title="ペンで書き込む">✏️ ペン</button>' +
          '<button type="button" class="dlc-pin-tool-btn" data-tool="erase" title="書き込みを消す">🧹 消す</button>' +
          '<button type="button" class="dlc-pin-tool-btn" data-tool="text" title="タップした場所にテキストボックスを追加">T 文字</button>' +
          '<span class="dlc-pin-zoom-group">' +
            '<button type="button" data-zoom="out" title="縮小">－</button>' +
            '<span id="dlcPinZoomLabel">' + Math.round(zoom * 100) + '%</span>' +
            '<button type="button" data-zoom="in" title="拡大">＋</button>' +
            '<button type="button" data-zoom="reset" title="元の大きさ(100%)に戻す">原寸</button>' +
          '</span>' +
        '</div>' +
        '<div class="dlc-pin-stage-wrap"><div class="dlc-pin-sizer" style="width:' + (p.width*zoom) + 'px;height:' + (p.height*zoom) + 'px;">' +
        '<div class="dlc-pin-stage" style="width:' + p.width + 'px;height:' + p.height + 'px;transform:scale(' + zoom + ');"></div>' +
        '</div></div>' +
        '<div class="dlc-pin-hint">「ペン」で手書き、「消す」でその部分の手書きを消去、「文字」でタップした場所にテキストボックスを追加できます。内容は通常表示にもそのまま反映されます。パネル左端をドラッグすると幅を変更できます。</div>';

      var stage = pinContent.querySelector('.dlc-pin-stage');

      if (!p.bgImage && (!p.ocrBlocks || !p.ocrBlocks.length) && (!p.textBoxes || !p.textBoxes.length) && (!p.mediaObjects || !p.mediaObjects.length)){
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
      var inkCanvas = document.createElement('canvas');
      inkCanvas.className = 'dlc-pin-ink-canvas';
      inkCanvas.width = p.width;
      inkCanvas.height = p.height;
      stage.appendChild(inkCanvas);
      var inkCtx = inkCanvas.getContext('2d');
      if (p.ink){
        var inkImg = new Image();
        inkImg.onload = function(){ inkCtx.drawImage(inkImg, 0, 0); };
        inkImg.src = p.ink;
      }
      inkCanvas.addEventListener('pointerdown', function(e){
        if (dlcPinTool !== 'pen' && dlcPinTool !== 'erase') return;
        inkCanvas.setPointerCapture(e.pointerId);
        var pt = dlcPinGetPoint(e, stage);
        dlcPinDrawing = true;
        dlcPinSmoothPts = [pt, pt, pt];
      });
      inkCanvas.addEventListener('pointermove', function(e){
        if (!dlcPinDrawing || (dlcPinTool !== 'pen' && dlcPinTool !== 'erase')) return;
        var erase = dlcPinTool === 'erase';
        var events = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
        events.forEach(function(ev){
          dlcPinSmoothPts.push(dlcPinGetPoint(ev, stage));
          dlcPinStrokeSegment(inkCtx, erase);
        });
      });
      inkCanvas.addEventListener('pointerup', function(){
        if (!dlcPinDrawing) return;
        dlcPinDrawing = false;
        if (dlcPinSmoothPts.length){
          dlcPinSmoothPts.push(dlcPinSmoothPts[dlcPinSmoothPts.length - 1]);
          dlcPinStrokeSegment(inkCtx, dlcPinTool === 'erase');
        }
        inkCtx.globalCompositeOperation = 'source-over';
        dlcPinSmoothPts = [];
        p.ink = inkCanvas.toDataURL('image/png');
        if (idx === currentPageIndex && typeof syncCurrentInk === 'function'){
          /* 今表示中のページと同じ場合、通常表示側のinkCanvasにも反映する */
          try {
            var mainCanvas = document.getElementById('inkCanvas');
            var mctx = mainCanvas.getContext('2d');
            var img2 = new Image();
            img2.onload = function(){ mctx.clearRect(0,0,mainCanvas.width,mainCanvas.height); mctx.drawImage(img2,0,0); };
            img2.src = p.ink;
          } catch(e){}
        }
        dlcLog('固定ページに手書き', 'ページ ' + (idx + 1));
      });
      /* 「文字」ツール中は、ステージをタップした場所に新しいテキストボックスを追加する */
      stage.addEventListener('pointerdown', function(e){
        if (dlcPinTool !== 'text') return;
        if (e.target.closest('.dlc-pin-textbox')) return;
        var pt = dlcPinGetPoint(e, stage);
        p.textBoxes = p.textBoxes || [];
        var tb = {
          id: 'tb_' + Date.now(), x: pt.x, y: pt.y,
          w: p.vertical ? 60 : 220, h: p.vertical ? 220 : 70,
          text: '', fontSize: 20, color: '#22262E', bold: false, border: false, vertical: p.vertical
        };
        p.textBoxes.push(tb);
        dlcLog('固定ページにテキストボックス追加', 'ページ ' + (idx + 1));
        renderPinnedPane();
        requestAnimationFrame(function(){
          var newBox = stage.parentNode ? pinnedPane.querySelector('[data-tb-id="' + tb.id + '"]') : null;
          if (newBox){ newBox.focus(); }
        });
      });

      (p.ocrBlocks || []).forEach(function(b){
        if (b.excludeFromReading) return;
        var box = document.createElement('div');
        box.className = 'dlc-pin-block';
        box.style.left = b.x + 'px'; box.style.top = b.y + 'px';
        box.style.width = b.w + 'px'; box.style.height = b.h + 'px';
        box.title = 'クリックで読み上げ：' + (b.text || '').slice(0, 40);
        box.addEventListener('click', function(){
          if (dlcPinTool !== 'select' || !('speechSynthesis' in window)) return;
          speechSynthesis.cancel();
          var utter = new SpeechSynthesisUtterance(b.text);
          utter.lang = 'ja-JP';
          utter.rate = (typeof ttsRate === 'number' ? ttsRate : 1);
          speechSynthesis.speak(utter);
        });
        stage.appendChild(box);
      });
      (p.textBoxes || []).forEach(function(tb){
        var holder = document.createElement('div');
        holder.className = 'dlc-pin-textbox-holder';
        holder.style.left = tb.x + 'px'; holder.style.top = tb.y + 'px';
        holder.style.width = tb.w + 'px'; holder.style.height = tb.h + 'px';

        var box = document.createElement('div');
        box.className = 'dlc-pin-textbox';
        box.dataset.tbId = tb.id;
        box.contentEditable = 'true';
        box.spellcheck = false;
        box.style.fontSize = Math.max(7, tb.fontSize || 20) + 'px';
        box.style.color = tb.color || '#22262E';
        box.style.fontWeight = tb.bold ? '700' : '400';
        /* v0.7: 縦書き設定に対応。本体と同様、実際に入力中（フォーカス中）だけ一時的に
           横書き表示にする（vertical-rl と contentEditable の相性問題を避けるため）。 */
        function applyPinTbWritingMode(editing){
          box.style.writingMode = (tb.vertical && !editing) ? 'vertical-rl' : 'horizontal-tb';
        }
        applyPinTbWritingMode(false);
        box.textContent = tb.text || '';
        box.addEventListener('keydown', dlcHandleTextBoxEnterKey);
        box.addEventListener('input', function(){
          tb.text = dlcTextBoxPlainText(box);
          if (idx === currentPageIndex && typeof renderTextBoxes === 'function') renderTextBoxes();
        });
        box.addEventListener('focus', function(){
          holder.classList.add('dlc-pin-tb-active');
          applyPinTbWritingMode(true);
        });
        box.addEventListener('blur', function(){
          holder.classList.remove('dlc-pin-tb-active');
          applyPinTbWritingMode(false);
          tb.text = dlcTextBoxPlainText(box);
        });
        box.addEventListener('pointerdown', function(e){ e.stopPropagation(); });

        var toolbar = document.createElement('div');
        toolbar.className = 'dlc-pin-textbox-toolbar';
        toolbar.innerHTML =
          '<button type="button" data-act="speak" title="このテキストを読み上げる">🔊</button>' +
          '<button type="button" data-act="vertical" title="縦書き/横書きを切り替える">' + (tb.vertical ? '縦' : '横') + '</button>' +
          '<button type="button" data-act="delete" title="このテキストボックスを削除">🗑</button>';
        toolbar.querySelector('[data-act="speak"]').addEventListener('click', function(e){
          e.stopPropagation();
          if (!('speechSynthesis' in window)) return;
          speechSynthesis.cancel();
          var utter = new SpeechSynthesisUtterance(tb.text || '');
          utter.lang = 'ja-JP';
          utter.rate = (typeof ttsRate === 'number' && ttsRate) ? ttsRate : 1;
          speechSynthesis.speak(utter);
        });
        toolbar.querySelector('[data-act="vertical"]').addEventListener('click', function(e){
          e.stopPropagation();
          tb.vertical = !tb.vertical;
          renderPinnedPane();
          if (idx === currentPageIndex && typeof renderTextBoxes === 'function') renderTextBoxes();
        });
        toolbar.querySelector('[data-act="delete"]').addEventListener('click', function(e){
          e.stopPropagation();
          p.textBoxes = (p.textBoxes || []).filter(function(t){ return t.id !== tb.id; });
          dlcLog('固定ページのテキストボックス削除', 'ページ ' + (idx + 1));
          renderPinnedPane();
          if (idx === currentPageIndex && typeof renderTextBoxes === 'function') renderTextBoxes();
        });

        var dragHandle = document.createElement('div');
        dragHandle.className = 'dlc-pin-textbox-drag';
        dragHandle.title = 'ドラッグして移動';
        dragHandle.textContent = '⠿';
        dragHandle.addEventListener('pointerdown', function(e){
          e.stopPropagation(); e.preventDefault();
          dragHandle.setPointerCapture(e.pointerId);
          var z = window.dlcPinZoom || 1;
          var startX = e.clientX, startY = e.clientY, origX = tb.x, origY = tb.y;
          function onMove(ev){
            tb.x = origX + (ev.clientX - startX) / z;
            tb.y = origY + (ev.clientY - startY) / z;
            holder.style.left = tb.x + 'px'; holder.style.top = tb.y + 'px';
          }
          function onUp(){
            dragHandle.removeEventListener('pointermove', onMove);
            dragHandle.removeEventListener('pointerup', onUp);
            if (idx === currentPageIndex && typeof renderTextBoxes === 'function') renderTextBoxes();
          }
          dragHandle.addEventListener('pointermove', onMove);
          dragHandle.addEventListener('pointerup', onUp);
        });

        var resizeHandle = document.createElement('div');
        resizeHandle.className = 'dlc-pin-textbox-resize';
        resizeHandle.title = 'ドラッグしてサイズ変更';
        resizeHandle.addEventListener('pointerdown', function(e){
          e.stopPropagation(); e.preventDefault();
          resizeHandle.setPointerCapture(e.pointerId);
          var z = window.dlcPinZoom || 1;
          var startX = e.clientX, startY = e.clientY, origW = tb.w, origH = tb.h;
          function onMove(ev){
            tb.w = Math.max(24, origW + (ev.clientX - startX) / z);
            tb.h = Math.max(24, origH + (ev.clientY - startY) / z);
            holder.style.width = tb.w + 'px'; holder.style.height = tb.h + 'px';
          }
          function onUp(){
            resizeHandle.removeEventListener('pointermove', onMove);
            resizeHandle.removeEventListener('pointerup', onUp);
            if (idx === currentPageIndex && typeof renderTextBoxes === 'function') renderTextBoxes();
          }
          resizeHandle.addEventListener('pointermove', onMove);
          resizeHandle.addEventListener('pointerup', onUp);
        });

        holder.appendChild(box);
        holder.appendChild(toolbar);
        holder.appendChild(dragHandle);
        holder.appendChild(resizeHandle);
        stage.appendChild(holder);
      });

      /* v0.6: 画像・グラフ・数式・リンクなど（本体の画像挿入等で追加したもの）も
         固定表示側にそのまま見えるようにする。動画は簡易プレースホルダー表示のみ
         （本体側で再生してご覧ください）。 */
      (p.mediaObjects || []).forEach(function(m){
        var mel = document.createElement('div');
        mel.className = 'dlc-pin-media';
        mel.style.left = m.x + 'px'; mel.style.top = m.y + 'px';
        mel.style.width = m.w + 'px'; mel.style.height = m.h + 'px';
        if (m.type === 'image' || m.type === 'chart' || m.type === 'formula'){
          var img = document.createElement('img');
          img.src = m.src; img.alt = m.type;
          mel.appendChild(img);
        } else if (m.type === 'link'){
          mel.classList.add('dlc-pin-media-link');
          mel.textContent = '🔗 ' + (m.label || m.url || 'リンク');
          mel.title = m.url || '';
          mel.addEventListener('click', function(){ if (m.url) window.open(m.url, '_blank', 'noopener,noreferrer'); });
        } else if (m.type === 'video'){
          mel.classList.add('dlc-pin-media-video');
          mel.textContent = '🎬 動画（本体表示でご覧ください）';
        } else {
          return;
        }
        stage.appendChild(mel);
      });

      var unpinBtn = document.getElementById('dlcUnpinBtn');
      if (unpinBtn){
        unpinBtn.addEventListener('click', function(){
          window.dlcPinnedPageIndex = null;
          renderPinnedPane();
          updatePinButtonUI();
        });
      }
      var collapseBtn = document.getElementById('dlcPinCollapseBtn');
      if (collapseBtn){
        collapseBtn.addEventListener('click', function(){
          window.dlcPinCollapsed = !window.dlcPinCollapsed;
          renderPinnedPane();
        });
      }
      pinnedPane.querySelectorAll('.dlc-pin-tool-btn').forEach(function(btn){
        btn.classList.toggle('active', btn.dataset.tool === dlcPinTool);
        btn.addEventListener('click', function(){
          dlcPinTool = btn.dataset.tool;
          pinnedPane.querySelectorAll('.dlc-pin-tool-btn').forEach(function(b){ b.classList.toggle('active', b === btn); });
          stage.style.cursor = dlcPinTool === 'pen' ? 'crosshair' : (dlcPinTool === 'erase' ? 'cell' : (dlcPinTool === 'text' ? 'copy' : 'default'));
        });
      });
      stage.style.cursor = dlcPinTool === 'pen' ? 'crosshair' : (dlcPinTool === 'erase' ? 'cell' : (dlcPinTool === 'text' ? 'copy' : 'default'));
      pinnedPane.querySelectorAll('[data-zoom]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var z = window.dlcPinZoom || 1;
          if (btn.dataset.zoom === 'in') z = Math.min(2.5, z + 0.1);
          else if (btn.dataset.zoom === 'out') z = Math.max(0.3, z - 0.1);
          else z = 1;
          window.dlcPinZoom = Math.round(z * 100) / 100;
          renderPinnedPane();
        });
      });
    }

    /* 画面サイズが変わったときはレイアウトのみ再確認（ズーム倍率は変えない） */
    window.addEventListener('resize', function(){ if (window.dlcPinnedPageIndex !== null) renderPinnedPane(); });

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
       5.5. 読み上げ音声の選択（v0.8で新規追加）
       端末・ブラウザにインストールされている音声合成の声（音声エンジン）を
       一覧表示し、好きな声を選べるようにする。選択はブラウザ内保存（設定は
       localStorageに保存）され、次回起動時にも引き継がれる。
       仕組み：speechSynthesis.speak を横取りし、呼び出される直前に選択中の
       voiceをutteranceにセットしてから本来のspeakを呼ぶ。これにより、本体の
       文章読み上げ・テキストボックスの読み上げ・本DLCの読み上げなど、
       アプリ内のあらゆる読み上げ処理に対して、追加の実装なしで一括して
       効果が及ぶ。
    ========================================================== */
    var VOICE_KEY = 'yomiDlcVoiceURI';
    function getSavedVoiceURI(){
      try { return localStorage.getItem(VOICE_KEY) || ''; } catch(e){ return ''; }
    }
    function setSavedVoiceURI(uri){
      try { localStorage.setItem(VOICE_KEY, uri || ''); } catch(e){}
    }
    function findSelectedVoice(){
      var uri = getSavedVoiceURI();
      if (!uri) return null;
      var list = speechSynthesis.getVoices() || [];
      for (var i = 0; i < list.length; i++){ if (list[i].voiceURI === uri) return list[i]; }
      return null;
    }
    if (!window._dlcSpeakPatched){
      window._dlcSpeakPatched = true;
      var _origSpeak = speechSynthesis.speak.bind(speechSynthesis);
      speechSynthesis.speak = function(utter){
        try {
          var v = findSelectedVoice();
          if (v) utter.voice = v;
        } catch(e){}
        return _origSpeak(utter);
      };
    }

    function openVoicePickerModal(){
      var list = speechSynthesis.getVoices() || [];
      if (!list.length){
        if (typeof flashToast === 'function') flashToast('音声の一覧を読み込み中です。もう一度お試しください');
        speechSynthesis.onvoiceschanged = function(){};
        return;
      }
      var jaList = list.filter(function(v){ return /^ja/i.test(v.lang); });
      var otherList = list.filter(function(v){ return !/^ja/i.test(v.lang); });
      var ordered = jaList.concat(otherList);
      var currentURI = getSavedVoiceURI();

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      var box = document.createElement('div');
      box.className = 'modal-box';
      box.style.width = '420px';
      box.style.maxHeight = '80vh';
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.innerHTML =
        '<h3>🗣️ 読み上げの声を選ぶ</h3>' +
        '<div style="font-size:12px;color:#5B6270;margin-bottom:10px;">端末に入っている声の一覧です。選ぶと自動的に保存され、次回起動時も同じ声が使われます。</div>' +
        '<select id="dlcVoiceSelect" style="width:100%;padding:8px;border-radius:8px;border:1px solid #DAD3C4;margin-bottom:10px;"></select>' +
        '<div style="display:flex;gap:8px;margin-bottom:6px;">' +
          '<button type="button" id="dlcVoicePreviewBtn" class="btn" style="flex:1;">🔊 試しに聞く</button>' +
        '</div>' +
        '<div class="manual-editor-actions"><button type="button" id="dlcVoiceCloseBtn">閉じる</button><button type="button" id="dlcVoiceSaveBtn">この声を使う</button></div>';
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      var sel = box.querySelector('#dlcVoiceSelect');
      var defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = '（既定の声：ブラウザにおまかせ）';
      sel.appendChild(defaultOpt);
      ordered.forEach(function(v){
        var opt = document.createElement('option');
        opt.value = v.voiceURI;
        opt.textContent = v.name + '（' + v.lang + '）' + (v.localService ? '' : ' ※通信が必要な場合あり');
        if (v.voiceURI === currentURI) opt.selected = true;
        sel.appendChild(opt);
      });

      function closeModal(){ overlay.remove(); }
      box.querySelector('#dlcVoiceCloseBtn').addEventListener('click', closeModal);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
      box.querySelector('#dlcVoicePreviewBtn').addEventListener('click', function(){
        var uri = sel.value;
        var v = uri ? ordered.concat(jaList, otherList).find(function(x){ return x.voiceURI === uri; }) : null;
        speechSynthesis.cancel();
        var utter = new SpeechSynthesisUtterance('こんにちは。これは音声のサンプルです。');
        utter.lang = 'ja-JP';
        if (v) utter.voice = v;
        utter.rate = (typeof ttsRate === 'number' && ttsRate) ? ttsRate : 1;
        speechSynthesis.speak(utter);
      });
      box.querySelector('#dlcVoiceSaveBtn').addEventListener('click', function(){
        setSavedVoiceURI(sel.value);
        if (typeof flashToast === 'function') flashToast('読み上げの声を保存しました');
        dlcLog('読み上げの声を変更', sel.options[sel.selectedIndex].textContent);
        closeModal();
      });
    }

    var voiceBtn = document.createElement('button');
    voiceBtn.type = 'button';
    voiceBtn.className = 'tool-btn';
    voiceBtn.id = 'dlcVoiceBtn';
    voiceBtn.title = '読み上げに使う声の種類を選べます。設定は保存され、次回起動時も引き継がれます。';
    voiceBtn.innerHTML = '<span class="glyph">🗣️</span>音声選択';
    voiceBtn.addEventListener('click', openVoicePickerModal);
    if (toolGrid) toolGrid.appendChild(voiceBtn);

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

    /* ==========================================================
       7. ボタン読み上げ（v0.5 新規／最強アップデート、v0.6でも継続提供）
       アプリ内のほぼ全てのボタン（ツールバー・上部バー・ページ操作・
       各種ダイアログ・DLC一覧・ピン止めパネルなど）と、コマンドパレットで
       「/all command」等を実行したときに表示される構文一覧の各行に、
       小さな🔊バッジを自動的に付与する。バッジを押すと、その要素の
       title属性（無ければ表示文字）を音声で読み上げる。バッジ自体への
       クリックはボタン本体のクリックには一切伝播しないので、誤操作の
       心配はない。MutationObserverで新しく追加される要素（ダイアログ・
       DLC一覧・変更ログなど）も自動検知して追従する。オン/オフ切替可能、
       初期状態はオン。
    ========================================================== */
    var DLC_SPEAK_KEY = 'yomiDlcBtnSpeakEnabled';
    var DLC_SPEAK_SELECTOR = 'button, a.cmd-help-link, .cmd-list-item';

    function isSpeakBadgesOn(){
      try {
        var v = localStorage.getItem(DLC_SPEAK_KEY);
        return v === null ? true : v === 'true'; // 初期状態はオン
      } catch(e){ return true; }
    }
    function setSpeakBadgesOn(on){
      try { localStorage.setItem(DLC_SPEAK_KEY, on ? 'true' : 'false'); } catch(e){}
    }

    function dlcSpeakLabel(text){
      if (!text || !text.trim()) return;
      if (!('speechSynthesis' in window)) return;
      try { speechSynthesis.cancel(); } catch(e){}
      var utter = new SpeechSynthesisUtterance(text.trim());
      utter.lang = 'ja-JP';
      try {
        var v = (typeof pickJaVoice === 'function') ? pickJaVoice() : null;
        if (v) utter.voice = v;
      } catch(e){}
      utter.rate = (typeof ttsRate === 'number' && ttsRate) ? ttsRate : 1;
      try { speechSynthesis.speak(utter); } catch(e){}
    }

    function dlcLabelForElement(el){
      var t = el.getAttribute && el.getAttribute('title');
      if (t && t.trim()) return t.trim();
      var aria = el.getAttribute && el.getAttribute('aria-label');
      if (aria && aria.trim()) return aria.trim();
      return (el.textContent || '').replace(/\s+/g, ' ').trim();
    }

    /* v0.8: 【不具合修正】これまでは各ボタンの右上に小さな🔊バッジを重ねて表示し、
       それを狙って押す方式だったが、バッジが小さく、誤って本体のボタンの方を
       押してしまうという声が多かった。バッジ自体を廃止し、代わりにボタンを
       「押した瞬間（pointerdown）」にそのボタンの名前を読み上げるようにした。
       読み上げはボタン本来のクリック動作を妨げない（preventDefault/stopPropagation
       をしない）ため、狙う場所は変わらず、押せば読み上げも動作も両方行われる。 */
    function dlcSpeakOnPress(e){
      dlcSpeakLabel(dlcLabelForElement(e.currentTarget));
    }

    function attachSpeakBadge(el){
      if (!el || el.dataset.dlcSpoken === '1') return;
      el.dataset.dlcSpoken = '1';
      el.addEventListener('pointerdown', dlcSpeakOnPress);
    }

    function scanAndAttachBadges(root){
      if (!isSpeakBadgesOn()) return;
      var scope = root || document;
      if (scope.querySelectorAll){
        scope.querySelectorAll(DLC_SPEAK_SELECTOR).forEach(function(el){ attachSpeakBadge(el); });
      }
      if (scope !== document && scope.matches && scope.matches(DLC_SPEAK_SELECTOR)) attachSpeakBadge(scope);
    }

    function removeAllSpeakBadges(){
      document.querySelectorAll('[data-dlc-spoken]').forEach(function(el){
        el.removeEventListener('pointerdown', dlcSpeakOnPress);
        delete el.dataset.dlcSpoken;
      });
    }

    var dlcSpeakScanTimer = null;
    var dlcSpeakObserver = new MutationObserver(function(){
      if (!isSpeakBadgesOn()) return;
      clearTimeout(dlcSpeakScanTimer);
      dlcSpeakScanTimer = setTimeout(function(){ scanAndAttachBadges(document); }, 150);
    });
    dlcSpeakObserver.observe(document.body, { childList: true, subtree: true });

    var speakToggleBtn = document.createElement('button');
    speakToggleBtn.type = 'button';
    speakToggleBtn.className = 'tool-btn';
    speakToggleBtn.id = 'dlcSpeakToggleBtn';
    speakToggleBtn.title = 'アプリ内のほぼ全てのボタンやコマンド構文の行を、押した瞬間に名前や説明を読み上げるようにします（バッジを狙う必要はなく、押せば通常どおりボタンも動作します）。もう一度押すとオフにできます（初期状態はオン）。';
    function refreshSpeakToggleUI(){
      var on = isSpeakBadgesOn();
      speakToggleBtn.innerHTML = '<span class="glyph">' + (on ? '🔊' : '🔇') + '</span>ボタン読み上げ';
      speakToggleBtn.classList.toggle('dlc-forced-active', on);
    }
    speakToggleBtn.addEventListener('click', function(){
      var next = !isSpeakBadgesOn();
      setSpeakBadgesOn(next);
      refreshSpeakToggleUI();
      if (next){ scanAndAttachBadges(document); }
      else { removeAllSpeakBadges(); }
      if (typeof flashToast === 'function') flashToast(next ? 'ボタン読み上げをオンにしました' : 'ボタン読み上げをオフにしました');
      dlcLog('ボタン読み上げ切替', next ? 'オンにした' : 'オフにした');
    });
    if (toolGrid) toolGrid.appendChild(speakToggleBtn);
    refreshSpeakToggleUI();

    if (isSpeakBadgesOn()) scanAndAttachBadges(document);

    dlcLog('ディスレクシア支援パックを有効化', 'v0.8');

    console.log('[読みノート] ディスレクシア支援パック v0.8 を有効化しました。');
  });
})();
