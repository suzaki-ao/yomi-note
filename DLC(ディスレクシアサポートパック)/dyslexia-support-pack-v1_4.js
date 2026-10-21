/* ============================================================================
   読みノート (Yomi-Note) 追加DLC
   ディスレクシア支援パック v1.4
   ----------------------------------------------------------------------------
   このスクリプトは index.html（アプリ本体）の </body> 直前、本体の
   <script>...</script> より「後」に以下のように読み込んでください。

     <script src="dyslexia-support-pack-v1_4.js"></script>
     </body>

   ▼ v1.4の変更（ピン止めを別のDLC「pin.js」に分離）
     ・ページのピン止め（📌）は、独立した追加コンテンツ「ピン止め拡張機能 pin.js」に
       移りました。このパックの中からはピン止めを取り除いたので、ディスレクシア支援
       パックを使わない人でも、他のDLCと組み合わせても、ピン止めを使えます。
       ピン止めを使いたいときは、🧩追加コンテンツの一覧から「ピン止め拡張機能」も
       追加してください（このパックと一緒に使えます）。
     ・pin.js（v1.0）では、ピン止めタブが画面右端に移動し、テキストボックスの
       自由な移動・サイズ変更・音声入力、ピン止め状態での読み上げ・輪投げツールが
       使えるようになりました。
     ・古い版（v1.3以前）のこのパックとpin.jsを同時に読み込んだ場合、pin.js側が
       古いピン止めを自動で無効化します。

   ▼ v1.3の修正（バージョン表記のずれ）
     ・画面上部のバッジ（「📖 ディスレクシア支援パック v●.●」）が、v1.1・v1.2でも
       「v1.0」のままになっていた不具合を修正した。バッジ・読み込み時の記録・
       本体への版の登録は、すべて下の PACK_VERSION 1か所から作るようにした
       （版を上げるときに直し忘れが起きない）。
     ・テストモード中は、読み行ガイド・プリセット以外の機能に影響しないことを確認した。

   ▼ v1.2で新規追加（大幅強化。これまでの研究で分かったことを反映）
     ・読み行ガイド（📏）
       　画面に帯状のガイドを出し、いま読んでいる行だけを目で追いやすくする
       　（帯の外はうっすら暗くなる）。マウス・指の位置に合わせて動く。
       　押すたびに なし→細め→ふつう→太め と切り替わる。
     ・読みやすさプリセット（📚）
       　大文字表示・文字間・読みやすい色・読み行ガイドを、1回の操作でまとめて
       　切り替える。「やさしい」「くっきり」「集中」の3種類。「なし」に戻すと、
       　プリセットを使う前の設定に自動で戻る。
     ・数式の読み上げ方（🧮）
       　OCRは数式・化学式を正しく読めない（研究で確認）ため、読み上げが
       　「えっくすいこーる びーぷらす…」のように意味不明になりがち。
       　数式・化学式らしい部分を「そのまま読む／『数式』と読む／とばす」から
       　選べる（初期は「『数式』と読む」）。日付（2026-10-02）や英文は対象外。
     ・不確かな箇所の確認（⚠）
       　このページのOCR結果から、数式・化学式らしい箇所や信頼度の低い箇所を
       　一覧にして、1件ずつ読み上げて確かめられる。誤読しやすい場所を先に
       　見つけて、数式パレットや手入力で直す手がかりにできる。
     ・バージョン情報の登録
       　本体アプリが「内蔵ライブラリのバージョン」と「実際に読み込まれた
       　バージョン」を照合できるよう、読み込み時に自分の版を本体へ知らせる。

   ▼ v1.1で新規追加
     ・読みやすい色（🎨／カラーオーバーレイ）
       　画面全体にクリーム・ペールブルー・ペールピンク・ペールグリーンの
       　いずれかの薄い色を重ね、白地に黒文字の強いコントラストをやわらげる。
       　ページの背景画像・文字の色そのものは変更しないので、いつでも
       　「なし」に戻せば元通り。押すたびに5色を順番に切り替える。
     ・文字間を広げる（↔️）
       　テキストボックスの文字間隔・行間を広げて表示し、文字が詰まって
       　見える感覚をやわらげる（大文字表示とは独立してON/OFFできる）。

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
      ・（ページのピン止め📌は、v1.4から別のDLC「ピン止め拡張機能 pin.js」に分離されました）
     ・大文字表示（🔠／v1.0で新規追加）
       　テキストボックスの文字や操作画面のボタン・見出しを、通常より大きく・
       　太く表示して見やすくする。もう一度押すと元の大きさに戻る。
       　（v1.0でUDフォント切り替えボタンは廃止。本体アプリが標準でUDフォント
       　「BIZ UDゴシック」を使うようになったため、切り替える必要が無くなった）
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
   v0.9の変更点：【ピン止め機能を超強化】これまで1ページしか固定できず、別のページを
   固定すると前のものが自動的に解除されていた不便を解消。複数のページを同時に固定でき、
   パネル上部に表示されるタブをクリックして切り替えられるようにした（タブの×で個別に
   固定解除も可能）。1ページだけ固定しているときは、これまで通りタブは表示されない。
   【OCR強化】部分OCR縦+／横+が使う高精度ブースト設定を本体側で強化（拡大率・目標
   サイズを引き上げ、カメラ撮影ページでは陰影ムラの補正も自動で有効化）。本体v4.2との
   組み合わせで効果が出る。
   v1.0の変更点（バージョン番号の付け方を整理し、v0.9の次はv1.0としました）：
   【機能廃止】UDフォント（Aa）の切り替えボタンを削除。本体アプリ v4.3 から標準で
   常時「BIZ UDゴシック」フォントを使うようになったため、このDLC側で個別に切り替える
   必要が無くなったための整理。
   【新機能】「🔠大文字表示」を追加。テキストボックスの文字や操作画面のボタン・見出しを
   通常より大きく・太く表示して見やすくする。もう一度押すと元に戻る。
   ============================================================================ */
(function(){
  'use strict';
  /* 【v1.2】本体アプリが版を照合できるよう、読み込まれた版を登録する */
  var PACK_VERSION = '1.4';   /* 版表記は、必ずここから作る（バッジ・ログ・本体への登録） */
  window.YomiDlcLoaded = window.YomiDlcLoaded || {};
  window.YomiDlcLoaded.dyslexia = PACK_VERSION;

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
    ].join('');
    document.head.appendChild(style);

    var brand = document.querySelector('.brand-text h1');
    if (brand) brand.insertAdjacentHTML('beforeend', ' <span class="dlc-badge">📖 ディスレクシア支援パック v' + PACK_VERSION + '</span>');

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
       5. UDフォント切り替えツールについて
       【v1.0で削除】これまでこのDLCが提供していた「UDフォント（Aa）」の
       オン/オフ切り替えボタンは、本体アプリ v4.3 から常時「BIZ UDゴシック」を
       標準フォントとして使うようになったため、このDLC側の切り替えボタンは
       廃止した（本体が既にUDフォントなので、わざわざ切り替える必要が無い）。
    ========================================================== */

    /* ==========================================================
       6. 大文字表示（v1.0で新規追加）
       文字を通常より大きく・太く表示することで見やすくする機能。
       ノートのテキストボックスの文字、および操作画面のボタン・見出し類を
       対象に、フォントサイズを引き上げ、太字にする。ページの背景画像
       （PDF/写真そのもの）の文字の大きさは変わらないが、テキストボックスや
       画面の文字は大きくはっきり見えるようになる。
    ========================================================== */
    var bigTextStyle = document.createElement('style');
    bigTextStyle.textContent =
      "html.dlc-big-text body{font-size:113% !important;}" +
      "html.dlc-big-text .textbox{font-weight:700 !important;}" +
      "html.dlc-big-text button,html.dlc-big-text .tool-btn,html.dlc-big-text .btn," +
      "html.dlc-big-text .icon-btn{font-weight:700 !important;}" +
      "html.dlc-big-text .sidebar-section h3,html.dlc-big-text .panel-row,html.dlc-big-text label," +
      "html.dlc-big-text #sentencePreview{font-weight:700 !important;}";
    document.head.appendChild(bigTextStyle);

    var BIG_TEXT_KEY = 'yomiDlcBigTextEnabled';
    function applyBigTextState(){
      var on = false;
      try { on = localStorage.getItem(BIG_TEXT_KEY) === 'true'; } catch(e){}
      document.documentElement.classList.toggle('dlc-big-text', on);
      return on;
    }
    var bigTextBtn = document.createElement('button');
    bigTextBtn.type = 'button';
    bigTextBtn.className = 'tool-btn';
    bigTextBtn.id = 'dlcBigTextBtn';
    bigTextBtn.title = '画面の文字を通常より大きく・太く表示して見やすくします。もう一度押すと元に戻ります。';
    bigTextBtn.innerHTML = '<span class="glyph">🔠</span>大文字表示';
    bigTextBtn.addEventListener('click', function(){
      var wasOn = document.documentElement.classList.contains('dlc-big-text');
      var next = !wasOn;
      try { localStorage.setItem(BIG_TEXT_KEY, next ? 'true' : 'false'); } catch(e){}
      document.documentElement.classList.toggle('dlc-big-text', next);
      bigTextBtn.classList.toggle('dlc-forced-active', next);
      if (typeof flashToast === 'function') flashToast(next ? '大文字表示にしました' : '通常の文字の大きさに戻しました');
      dlcLog('大文字表示切替', next ? 'オンにした' : 'オフにした');
    });
    if (toolGrid) toolGrid.appendChild(bigTextBtn);
    bigTextBtn.classList.toggle('dlc-forced-active', applyBigTextState());

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

    /* ==========================================================
       7. 読みやすい色（カラーオーバーレイ）（v1.1で新規追加）
       ディスレクシアの読みにくさの一因とされる「白背景と黒文字のコントラストの
       強さ・文字のにじみ／揺れて見える感覚」を和らげるため、画面全体に薄い色を
       重ねる（Irlenカラーオーバーレイと同じ考え方）。クリーム・ペールブルー・
       ペールピンク・ペールグリーンの4色を順番に切り替えられ、設定は保存され
       次回起動時も引き継がれる。半透明のレイヤーを重ねるだけなので、ページの
       背景画像・文字自体の色や内容は一切変更しない。
    ========================================================== */
    var OVERLAY_KEY = 'yomiDlcOverlayColor';
    var OVERLAY_COLORS = [
      { key: 'none',   label: 'なし',       css: null },
      { key: 'cream',  label: 'クリーム',   css: 'rgba(255,244,196,.28)' },
      { key: 'blue',   label: 'ペールブルー', css: 'rgba(196,224,255,.26)' },
      { key: 'pink',   label: 'ペールピンク', css: 'rgba(255,214,224,.26)' },
      { key: 'green',  label: 'ペールグリーン', css: 'rgba(206,238,206,.26)' }
    ];
    var overlayEl = document.createElement('div');
    overlayEl.id = 'dlcColorOverlay';
    overlayEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9990;display:none;transition:background .15s;';
    document.body.appendChild(overlayEl);
    function getSavedOverlayKey(){
      try { return localStorage.getItem(OVERLAY_KEY) || 'none'; } catch(e){ return 'none'; }
    }
    function applyOverlay(key){
      var found = null;
      for (var i = 0; i < OVERLAY_COLORS.length; i++){ if (OVERLAY_COLORS[i].key === key) found = OVERLAY_COLORS[i]; }
      if (!found) found = OVERLAY_COLORS[0];
      if (found.css){ overlayEl.style.background = found.css; overlayEl.style.display = 'block'; }
      else { overlayEl.style.display = 'none'; }
      return found;
    }
    var overlayBtn = document.createElement('button');
    overlayBtn.type = 'button';
    overlayBtn.className = 'tool-btn';
    overlayBtn.id = 'dlcOverlayBtn';
    overlayBtn.title = '画面全体に薄い色を重ねて、白地に黒文字のコントラストをやわらげます。押すたびに色が切り替わります（なし→クリーム→ペールブルー→ペールピンク→ペールグリーン→なし）。';
    function refreshOverlayBtnLabel(currentFound){
      overlayBtn.innerHTML = '<span class="glyph">🎨</span>読みやすい色：' + currentFound.label;
      overlayBtn.classList.toggle('dlc-forced-active', currentFound.key !== 'none');
    }
    overlayBtn.addEventListener('click', function(){
      var curKey = getSavedOverlayKey();
      var idx = 0;
      for (var i = 0; i < OVERLAY_COLORS.length; i++){ if (OVERLAY_COLORS[i].key === curKey) idx = i; }
      var next = OVERLAY_COLORS[(idx + 1) % OVERLAY_COLORS.length];
      try { localStorage.setItem(OVERLAY_KEY, next.key); } catch(e){}
      applyOverlay(next.key);
      refreshOverlayBtnLabel(next);
      if (typeof flashToast === 'function') flashToast('読みやすい色：' + next.label);
      dlcLog('読みやすい色（カラーオーバーレイ）切替', next.label);
    });
    if (toolGrid) toolGrid.appendChild(overlayBtn);
    refreshOverlayBtnLabel(applyOverlay(getSavedOverlayKey()));

    /* ==========================================================
       8. 文字間・行間を広げる（v1.1で新規追加）
       文字同士が詰まって見えると読みにくいという、ディスレクシアでよく挙げられる
       感覚に対応するため、テキストボックス・固定パネル内の文字の文字間隔と
       行間を広げて表示する（大文字表示とは独立してON/OFFできる）。
    ========================================================== */
    var wideSpacingStyle = document.createElement('style');
    wideSpacingStyle.textContent =
      "html.dlc-wide-spacing .textbox{letter-spacing:.06em !important;word-spacing:.14em !important;line-height:1.9 !important;}";
    document.head.appendChild(wideSpacingStyle);
    var WIDE_SPACING_KEY = 'yomiDlcWideSpacing';
    function applyWideSpacingState(){
      var on = false;
      try { on = localStorage.getItem(WIDE_SPACING_KEY) === 'true'; } catch(e){}
      document.documentElement.classList.toggle('dlc-wide-spacing', on);
      return on;
    }
    var wideSpacingBtn = document.createElement('button');
    wideSpacingBtn.type = 'button';
    wideSpacingBtn.className = 'tool-btn';
    wideSpacingBtn.id = 'dlcWideSpacingBtn';
    wideSpacingBtn.title = 'テキストボックスの文字間隔・行間を広げて、文字が詰まって見えにくいのを和らげます。もう一度押すと元に戻ります。';
    wideSpacingBtn.innerHTML = '<span class="glyph">↔️</span>文字間を広げる';
    wideSpacingBtn.addEventListener('click', function(){
      var wasOn = document.documentElement.classList.contains('dlc-wide-spacing');
      var next = !wasOn;
      try { localStorage.setItem(WIDE_SPACING_KEY, next ? 'true' : 'false'); } catch(e){}
      document.documentElement.classList.toggle('dlc-wide-spacing', next);
      wideSpacingBtn.classList.toggle('dlc-forced-active', next);
      if (typeof flashToast === 'function') flashToast(next ? '文字間・行間を広げました' : '文字間・行間を元に戻しました');
      dlcLog('文字間を広げる切替', next ? 'オンにした' : 'オフにした');
    });
    if (toolGrid) toolGrid.appendChild(wideSpacingBtn);
    wideSpacingBtn.classList.toggle('dlc-forced-active', applyWideSpacingState());


    /* ==========================================================
       9. 読み行ガイド（v1.2で新規追加）
       読んでいる行だけを帯で示し、帯の外をうっすら暗くする。行を読み飛ばす・
       同じ行を繰り返し読んでしまうことの多い人向けの、定番の読書支援。
       帯はマウス／指の縦位置に合わせて動く（操作は妨げない）。
    ========================================================== */
    var RULER_KEY = 'yomiDlcRulerSize';
    var RULER_SIZES = [
      { key: 'off', label: 'なし',   h: 0  },
      { key: 's',   label: '細め',   h: 30 },
      { key: 'm',   label: 'ふつう', h: 48 },
      { key: 'l',   label: '太め',   h: 72 }
    ];
    var rulerEl = document.createElement('div');
    rulerEl.id = 'dlcReadingRuler';
    rulerEl.style.cssText = 'position:fixed;left:0;right:0;height:48px;top:40%;pointer-events:none;z-index:9985;display:none;' +
      'box-sizing:border-box;border-top:2px solid rgba(62,110,99,.75);border-bottom:2px solid rgba(62,110,99,.75);' +
      'box-shadow:0 0 0 100vmax rgba(34,38,46,.18);';
    document.body.appendChild(rulerEl);
    function findRuler(key){
      for (var i = 0; i < RULER_SIZES.length; i++){ if (RULER_SIZES[i].key === key) return RULER_SIZES[i]; }
      return RULER_SIZES[0];
    }
    function getSavedRulerKey(){
      try { return localStorage.getItem(RULER_KEY) || 'off'; } catch(e){ return 'off'; }
    }
    var rulerLastY = Math.round(window.innerHeight * 0.4);
    function placeRuler(){
      var cur = findRuler(getSavedRulerKey());
      if (!cur.h){ rulerEl.style.display = 'none'; return; }
      rulerEl.style.height = cur.h + 'px';
      rulerEl.style.top = Math.max(0, rulerLastY - cur.h / 2) + 'px';
      rulerEl.style.display = 'block';
    }
    document.addEventListener('pointermove', function(e){ rulerLastY = e.clientY; if (rulerEl.style.display !== 'none') placeRuler(); }, { passive: true });
    document.addEventListener('touchmove', function(e){
      if (e.touches && e.touches[0]){ rulerLastY = e.touches[0].clientY; if (rulerEl.style.display !== 'none') placeRuler(); }
    }, { passive: true });
    var rulerBtn = document.createElement('button');
    rulerBtn.type = 'button';
    rulerBtn.className = 'tool-btn';
    rulerBtn.id = 'dlcRulerBtn';
    rulerBtn.title = '読んでいる行だけを帯で示し、まわりをうっすら暗くします。押すたびに なし→細め→ふつう→太め と切り替わります。帯はマウス・指の位置に合わせて動きます。';
    function refreshRulerBtn(){
      var cur = findRuler(getSavedRulerKey());
      rulerBtn.innerHTML = '<span class="glyph">📏</span>読み行ガイド：' + cur.label;
      rulerBtn.classList.toggle('dlc-forced-active', cur.key !== 'off');
    }
    function setRulerKey(key){
      try { localStorage.setItem(RULER_KEY, key); } catch(e){}
      placeRuler(); refreshRulerBtn();
    }
    rulerBtn.addEventListener('click', function(){
      var curKey = getSavedRulerKey(), idx = 0;
      for (var i = 0; i < RULER_SIZES.length; i++){ if (RULER_SIZES[i].key === curKey) idx = i; }
      var next = RULER_SIZES[(idx + 1) % RULER_SIZES.length];
      setRulerKey(next.key);
      if (typeof flashToast === 'function') flashToast('読み行ガイド：' + next.label);
      dlcLog('読み行ガイド切替', next.label);
    });
    if (toolGrid) toolGrid.appendChild(rulerBtn);
    placeRuler(); refreshRulerBtn();

    /* ==========================================================
       10. 読みやすさプリセット（v1.2で新規追加）
       大文字表示・文字間・読みやすい色・読み行ガイドを、まとめて切り替える。
       最初にプリセットを選ぶ直前の設定を保存しておき、「なし」に戻すと
       その設定へ自動で戻る（手動で整えた設定を失わない）。
    ========================================================== */
    var PRESET_KEY = 'yomiDlcPreset';
    var PRESET_BACKUP_KEY = 'yomiDlcPresetBackup';
    var PRESETS = [
      { key: 'none',  label: 'なし' },
      { key: 'easy',  label: 'やさしい', big: true,  wide: true,  overlay: 'cream', ruler: 's'   },
      { key: 'sharp', label: 'くっきり', big: true,  wide: false, overlay: 'none',  ruler: 'off' },
      { key: 'focus', label: '集中',     big: false, wide: true,  overlay: 'blue',  ruler: 'm'   }
    ];
    function setBigState(on){
      try { localStorage.setItem(BIG_TEXT_KEY, on ? 'true' : 'false'); } catch(e){}
      document.documentElement.classList.toggle('dlc-big-text', !!on);
      bigTextBtn.classList.toggle('dlc-forced-active', !!on);
    }
    function setWideState(on){
      try { localStorage.setItem(WIDE_SPACING_KEY, on ? 'true' : 'false'); } catch(e){}
      document.documentElement.classList.toggle('dlc-wide-spacing', !!on);
      wideSpacingBtn.classList.toggle('dlc-forced-active', !!on);
    }
    function setOverlayState(key){
      try { localStorage.setItem(OVERLAY_KEY, key); } catch(e){}
      refreshOverlayBtnLabel(applyOverlay(key));
    }
    function currentLookState(){
      return {
        big: document.documentElement.classList.contains('dlc-big-text'),
        wide: document.documentElement.classList.contains('dlc-wide-spacing'),
        overlay: getSavedOverlayKey(),
        ruler: getSavedRulerKey()
      };
    }
    function applyLookState(s){
      setBigState(!!s.big); setWideState(!!s.wide); setOverlayState(s.overlay || 'none'); setRulerKey(s.ruler || 'off');
    }
    function getSavedPresetKey(){
      try { return localStorage.getItem(PRESET_KEY) || 'none'; } catch(e){ return 'none'; }
    }
    var presetBtn = document.createElement('button');
    presetBtn.type = 'button';
    presetBtn.className = 'tool-btn';
    presetBtn.id = 'dlcPresetBtn';
    presetBtn.title = '読みやすさの設定（大文字表示・文字間・読みやすい色・読み行ガイド）をまとめて切り替えます。押すたびに なし→やさしい→くっきり→集中 と切り替わり、「なし」に戻すと、プリセットを使う前の設定に戻ります。';
    function refreshPresetBtn(){
      var key = getSavedPresetKey(), label = 'なし';
      for (var i = 0; i < PRESETS.length; i++){ if (PRESETS[i].key === key) label = PRESETS[i].label; }
      presetBtn.innerHTML = '<span class="glyph">📚</span>読みやすさ：' + label;
      presetBtn.classList.toggle('dlc-forced-active', key !== 'none');
    }
    presetBtn.addEventListener('click', function(){
      var curKey = getSavedPresetKey(), idx = 0;
      for (var i = 0; i < PRESETS.length; i++){ if (PRESETS[i].key === curKey) idx = i; }
      var next = PRESETS[(idx + 1) % PRESETS.length];
      if (curKey === 'none' && next.key !== 'none'){
        try { localStorage.setItem(PRESET_BACKUP_KEY, JSON.stringify(currentLookState())); } catch(e){}
      }
      if (next.key === 'none'){
        var backup = null;
        try { backup = JSON.parse(localStorage.getItem(PRESET_BACKUP_KEY) || 'null'); } catch(e){}
        applyLookState(backup || { big: false, wide: false, overlay: 'none', ruler: 'off' });
      } else {
        applyLookState(next);
      }
      try { localStorage.setItem(PRESET_KEY, next.key); } catch(e){}
      refreshPresetBtn();
      if (typeof flashToast === 'function') flashToast('読みやすさ：' + next.label);
      dlcLog('読みやすさプリセット切替', next.label);
    });
    if (toolGrid) toolGrid.appendChild(presetBtn);
    refreshPresetBtn();

    /* ==========================================================
       11. 数式の読み上げ方（v1.2で新規追加）
       研究で、OCRが数式・化学式を原式とは大きく異なる文字列として読むことを
       確認した（例：x=(-b±√(b²-4ac))/2a が「x=(b+ェY(<2-4ac))/2a」に）。
       これをそのまま読み上げると意味不明になり、読む人を混乱させるため、
       数式・化学式らしい部分を「数式」と読み替える／とばす機能を用意した。
       【見分け方】=・⇌・√・±・^・²³ のいずれか、または（数字・添え字を伴う）→ を含む、または、+ × ÷ と
       英字（か括弧）を両方含む、数式向けの文字の連なりだけを対象にする。
       日付（2026-10-02）・英文・「Version 1.0」のような文字列は対象外。
       仕組み：speechSynthesis.speak をもう一段横取りし、読み上げ直前に
       文章を書き換える（本体・DLCのあらゆる読み上げに一括で効く）。
    ========================================================== */
    var FORMULA_MODE_KEY = 'yomiDlcFormulaSpeech';
    var FORMULA_MODES = [
      { key: 'say',  label: '「数式」と読む' },
      { key: 'skip', label: 'とばす' },
      { key: 'read', label: 'そのまま読む' }
    ];
    /* OCRは数式の記号を、小さなカタカナ（ェ・ォなど）・丸数字・ダッシュとして誤読することが多い（研究で確認）ため、それらも連なりの一部として扱う */
    var FORMULA_RUN_RE = /[A-Za-z0-9＋－+\-=×÷^_(){}\[\]\/*.,:<>~²³⁴⁻⁺₀-₉→⇌±√·°ェォャュョ\u2460-\u2473—– ]{4,}/g;
    function isFormulaRun(run){
      var t = run.replace(/^\s+|\s+$/g, '');
      if (t.length < 4) return false;
      if (!/[A-Za-z0-9]/.test(t)) return false;
      if (/^\d{1,4}([\-\/.:]\d{1,4}){1,2}$/.test(t)) return false;   /* 日付・時刻・小数・バージョン */
      /* 矢印は、文章中の「OCR → コピー」のような流れの説明にも使われるため、数字・添え字を伴う場合だけ数式扱いにする */
      var strong = /[=⇌√±^²³]/.test(t) || (/→/.test(t) && /[0-9₀-₉]/.test(t)) || /[A-Za-z0-9][<>][A-Za-z0-9]/.test(t);
      var arith = /[+＋×÷]/.test(t) && (/[A-Za-z]/.test(t) || /[()]/.test(t));
      return strong || arith;
    }
    /* text を解析し、{ changed, said: 「数式」に置き換えた文章, rest: 数式部分を取り除いた文章 } を返す */
    function dlcFormulaSpeechTransform(text){
      var said = String(text), rest = String(text), changed = false;
      said = said.replace(FORMULA_RUN_RE, function(m){
        if (isFormulaRun(m)){ changed = true; return '数式'; }
        return m;
      });
      rest = rest.replace(FORMULA_RUN_RE, function(m){ return isFormulaRun(m) ? '' : m; });
      if (changed) said = said.replace(/(数式[\s、。]*){2,}/g, '数式');
      return { changed: changed, said: said, rest: rest };
    }
    function getFormulaModeKey(){
      try { return localStorage.getItem(FORMULA_MODE_KEY) || 'say'; } catch(e){ return 'say'; }
    }
    if (!window._dlcFormulaSpeakPatched){
      window._dlcFormulaSpeakPatched = true;
      var _origSpeakF = speechSynthesis.speak.bind(speechSynthesis);
      speechSynthesis.speak = function(utter){
        try {
          var mode = getFormulaModeKey();
          if (mode !== 'read' && utter && !utter._dlcRaw && typeof utter.text === 'string'){
            var r = dlcFormulaSpeechTransform(utter.text);
            if (r.changed){
              if (mode === 'skip'){
                if (r.rest.replace(/[\s、。]/g, '')){ utter.text = r.rest; }
                else { utter.text = '、'; utter.volume = 0; utter.rate = 3; }   /* 無音で終わらせ、本体の読み上げの連鎖を切らない */
              } else { utter.text = r.said; }
            }
          }
        } catch(e){}
        return _origSpeakF(utter);
      };
    }
    var formulaBtn = document.createElement('button');
    formulaBtn.type = 'button';
    formulaBtn.className = 'tool-btn';
    formulaBtn.id = 'dlcFormulaSpeechBtn';
    formulaBtn.title = 'OCRは数式・化学式を正しく読めないため、数式らしい部分を「数式」と読むか、とばすか、そのまま読むかを選びます。押すたびに切り替わります。日付や英文は対象外です。';
    function refreshFormulaBtn(){
      var key = getFormulaModeKey(), label = '';
      for (var i = 0; i < FORMULA_MODES.length; i++){ if (FORMULA_MODES[i].key === key) label = FORMULA_MODES[i].label; }
      formulaBtn.innerHTML = '<span class="glyph">🧮</span>数式の読み上げ：' + label;
      formulaBtn.classList.toggle('dlc-forced-active', key !== 'read');
    }
    formulaBtn.addEventListener('click', function(){
      var curKey = getFormulaModeKey(), idx = 0;
      for (var i = 0; i < FORMULA_MODES.length; i++){ if (FORMULA_MODES[i].key === curKey) idx = i; }
      var next = FORMULA_MODES[(idx + 1) % FORMULA_MODES.length];
      try { localStorage.setItem(FORMULA_MODE_KEY, next.key); } catch(e){}
      refreshFormulaBtn();
      if (typeof flashToast === 'function') flashToast('数式の読み上げ：' + next.label);
      dlcLog('数式の読み上げ方を切替', next.label);
    });
    if (toolGrid) toolGrid.appendChild(formulaBtn);
    refreshFormulaBtn();

    /* ==========================================================
       12. 不確かな箇所の確認（v1.2で新規追加）
       このページのOCR結果のうち、数式・化学式らしいブロックと、OCR自身の
       信頼度が低いブロックを一覧にする。1件ずつ「そのまま」読み上げて、
       誤読していないかを耳でも確かめられる（この確認用の読み上げには
       数式の読み替えをかけない）。
    ========================================================== */
    var uncertainModal = null;
    function collectUncertainBlocks(){
      var page = notestate.pages[currentPageIndex], out = [];
      ((page && page.ocrBlocks) || []).forEach(function(b){
        if (b.source !== 'auto' || !b.text) return;
        var r = dlcFormulaSpeechTransform(b.text);
        var conf = (typeof b.confidence === 'number') ? b.confidence : null;
        var low = conf !== null && conf > 0 && conf < 60;
        if (r.changed || low) out.push({ text: b.text, formula: r.changed, low: low, conf: conf });
      });
      return out;
    }
    function openUncertainModal(){
      /* テストモード中は、OCR結果（＝問題の文章・答えにつながる情報）を一覧に出さない */
      try { if (typeof testModeOn !== 'undefined' && testModeOn){ if (typeof flashToast === 'function') flashToast('テストモード中は使えません'); return; } } catch(e){}
      if (!uncertainModal){
        uncertainModal = document.createElement('div');
        uncertainModal.className = 'modal-overlay hidden';
        uncertainModal.id = 'dlcUncertainModal';
        uncertainModal.innerHTML =
          '<div class="modal-box" style="width:520px;max-width:94vw;">' +
            '<h3>⚠ 不確かな箇所（このページ）</h3>' +
            '<p id="dlcUncertainNote" style="font-size:12px;margin:0 0 8px;color:#5B6270;"></p>' +
            '<div id="dlcUncertainList" style="max-height:340px;overflow-y:auto;font-size:12.5px;line-height:1.7;' +
            'background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:12px;"></div>' +
            '<div class="modal-actions"><button class="btn primary" id="dlcUncertainCloseBtn" type="button">閉じる</button></div>' +
          '</div>';
        document.body.appendChild(uncertainModal);
        uncertainModal.querySelector('#dlcUncertainCloseBtn').addEventListener('click', function(){ uncertainModal.classList.add('hidden'); });
      }
      var list = collectUncertainBlocks();
      var box = uncertainModal.querySelector('#dlcUncertainList');
      uncertainModal.querySelector('#dlcUncertainNote').textContent = list.length
        ? ('数式・化学式らしい箇所や、OCRの信頼度が低い箇所が ' + list.length + ' 件あります。読み間違いがないか確かめてください。')
        : 'このページには、数式らしい箇所や信頼度の低い箇所は見つかりませんでした（OCR未実施の場合も、ここには出ません）。';
      box.innerHTML = '';
      list.forEach(function(it){
        var row = document.createElement('div');
        row.style.cssText = 'border-bottom:1px dashed #DAD3C4;padding:6px 0;display:flex;gap:8px;align-items:flex-start;';
        var tag = (it.formula ? '【数式らしい】' : '') + (it.low ? '【信頼度 ' + Math.round(it.conf) + '%】' : '');
        var span = document.createElement('div');
        span.style.cssText = 'flex:1;min-width:0;word-break:break-all;';
        span.textContent = tag + ' ' + (it.text.length > 90 ? it.text.slice(0, 90) + '…' : it.text);
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'btn'; btn.style.cssText = 'font-size:11px;padding:3px 8px;flex-shrink:0;';
        btn.textContent = '🔊 そのまま読む';
        btn.addEventListener('click', function(){
          try {
            speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(it.text); u.lang = 'ja-JP'; u._dlcRaw = true;
            speechSynthesis.speak(u);
          } catch(e){}
        });
        row.appendChild(span); row.appendChild(btn); box.appendChild(row);
      });
      uncertainModal.classList.remove('hidden');
      dlcLog('不確かな箇所の確認を開いた', list.length + '件');
    }
    var uncertainBtn = document.createElement('button');
    uncertainBtn.type = 'button';
    uncertainBtn.className = 'tool-btn';
    uncertainBtn.id = 'dlcUncertainBtn';
    uncertainBtn.title = 'このページのOCR結果から、数式・化学式らしい箇所や信頼度の低い箇所を一覧にします。1件ずつそのまま読み上げて、誤読していないか確かめられます。';
    uncertainBtn.innerHTML = '<span class="glyph">⚠</span>不確かな箇所';
    uncertainBtn.addEventListener('click', openUncertainModal);
    if (toolGrid) toolGrid.appendChild(uncertainBtn);

    /* テスト・検証用に、判定関数を公開しておく（本体の研究コマンドや自動テストから使う） */
    window.YomiDlcTools = window.YomiDlcTools || {};
    window.YomiDlcTools.formulaSpeechTransform = dlcFormulaSpeechTransform;

    dlcLog('ディスレクシア支援パックを有効化', 'v' + PACK_VERSION);

    /* v1.4：ピン止めはpin.jsに分離した。まだ読み込まれていなければ、1度だけ案内する */
    setTimeout(function(){
      try {
        if (window.YomiPin) return;
        var KEY = 'yomiDlcPinMovedNotice';
        if (localStorage.getItem(KEY) === '1') return;
        localStorage.setItem(KEY, '1');
        if (typeof flashToast === 'function') flashToast('お知らせ：📌ピン止めは「ピン止め拡張機能（pin.js）」に分離されました。🧩追加コンテンツ一覧から追加できます。', 9000);
      } catch(e){}
    }, 2500);

    console.log('[読みノート] ディスレクシア支援パック v' + PACK_VERSION + ' を有効化しました。');
  });
})();
