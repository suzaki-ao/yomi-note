/* ============================================================================
   読みノート (Yomi-Note) 追加DLC 第2弾
   プログラミング追加パック v0.1
   ----------------------------------------------------------------------------
   このスクリプトは index.html（アプリ本体）の 🧩ボタン、または
   コマンドパレット（@2モード）の /import dlc から取り込んでください。
   取り込み・オン/オフの操作方法は本体側の仕組み（複数DLC管理）に準じます。

   ▼ 何が変わるか
     このDLCを有効にすると、ノート機能の代わりにプログラミング画面に切り替わり
     ます（画面右下の🧑‍💻ボタン、またはいつでも「📓 ノートに戻る」ボタンで一時的
     にノート画面へ戻れます。
     ノート機能そのものを壊すわけではなく、上に重ねて全画面表示します）。

   ▼ 対応言語
     HTML / CSS / JavaScript ／ Python ／ C言語系（.c, .cpp, .h）
     ・HTML/CSS/JSは組み合わせてその場でプレビュー実行できます。
     ・Pythonはブラウザ内実行エンジン(Pyodide)を初回実行時に読み込んで実行します
       （初回はインターネット接続が必要です）。
     ・C言語系は v0.0 時点では編集・保存のみに対応（実行は今後のバージョンで検討）。

   ▼ 主な機能
     ・ファイルエクスプローラ（ファイルの新規作成・名前変更・削除）
     ・タブ切り替え、行番号つきエディタ
     ・▶実行（プレビュー／コンソール出力）
     ・🧩ツールパレット（スクラッチ風のブロックボタンでコード片を挿入。
       　言語ごとに用意されており、直感的にコードの部品を組み立てられます）
     ・コマンドバー（/new, /open, /run, /files など。詳しくは /help）
     ・「DLCとしてエクスポート」：作った作品を、そのまま読みノートに取り込める
       　新しい .js（DLC）ファイルとして書き出せます。これにより、ユーザー自身が
       　このパックの上で作った作品を、次の追加コンテンツとして配布・共有できます。

   v0.0：初回リリース。
   v0.1の変更点：プレビューに全画面表示ボタンを追加。🧩ツールパレットをカテゴリ別に
   整理し、各言語のスニペット数を大幅に増加（HTML/CSS/JS/Python/Cそれぞれ4〜5
   カテゴリ×十数個）。ボタンには短い説明文もあわせて表示し、わかりやすさを改善。
   ============================================================================ */
(function(){
  'use strict';

  function whenAppReady(fn){
    if (typeof notestate !== 'undefined' && typeof window.setTool === 'function'){
      fn();
    } else {
      setTimeout(function(){ whenAppReady(fn); }, 50);
    }
  }

  whenAppReady(function(){

    if (window.__progDlcLoaded) return; /* 二重読み込み防止 */
    window.__progDlcLoaded = true;

    var esc = (typeof window.escapeHtmlApp === 'function') ? window.escapeHtmlApp : function(s){
      return String(s).replace(/[&<>"']/g, function(c){
        return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
      });
    };
    var toast = (typeof window.flashToast === 'function') ? window.flashToast : function(m){ console.log(m); };

    /* ==========================================================
       0. データ管理（localStorage）
    ========================================================== */
    var STORE_KEY = 'yomiProgPackProject';

    function defaultProject(){
      return {
        activeName: 'index.html',
        files: [
          { name:'index.html', content:
            '<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>マイ作品</title>\n</head>\n<body>\n  <h1>ようこそ！</h1>\n  <p>ここから自由にHTML・CSS・JavaScriptを書いてみよう。</p>\n  <button onclick="sayHello()">クリックしてね</button>\n</body>\n</html>\n' },
          { name:'style.css', content:
            'body{\n  font-family: sans-serif;\n  background: #fdf6ec;\n  color: #22262e;\n  text-align: center;\n  padding: 40px;\n}\nbutton{\n  font-size: 16px;\n  padding: 8px 16px;\n  border-radius: 8px;\n  border: none;\n  background: #3E6E63;\n  color: #fff;\n  cursor: pointer;\n}\n' },
          { name:'script.js', content:
            'function sayHello(){\n  alert("こんにちは！");\n}\n' },
          { name:'main.py', content:
            '# ここにPythonのコードを書いて、上の▶実行ボタンを押してみよう\nfor i in range(5):\n    print("カウント:", i)\n' },
          { name:'main.c', content:
            '#include <stdio.h>\n\nint main(void){\n    printf("Hello, Yomi-Note!\\n");\n    return 0;\n}\n' }
        ]
      };
    }

    function loadProject(){
      try {
        var raw = localStorage.getItem(STORE_KEY);
        if (raw) return JSON.parse(raw);
      } catch(e){ console.error(e); }
      var p = defaultProject();
      saveProject(p);
      return p;
    }
    function saveProject(p){
      try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
      catch(e){ console.error(e); }
    }

    var project = loadProject();
    var openTabs = [project.activeName];

    function getFile(name){
      for (var i=0;i<project.files.length;i++){ if (project.files[i].name === name) return project.files[i]; }
      return null;
    }
    function extOf(name){
      var m = /\.([a-zA-Z0-9]+)$/.exec(name || '');
      return m ? m[1].toLowerCase() : '';
    }
    function langOf(name){
      var e = extOf(name);
      if (e === 'html' || e === 'htm') return 'html';
      if (e === 'css') return 'css';
      if (e === 'js') return 'js';
      if (e === 'py') return 'python';
      if (e === 'c' || e === 'cpp' || e === 'cc' || e === 'h' || e === 'hpp') return 'c';
      return 'text';
    }
    var LANG_LABEL = { html:'HTML', css:'CSS', js:'JavaScript', python:'Python', c:'C言語系', text:'テキスト' };

    /* ==========================================================
       1. スタイル
    ========================================================== */
    var style = document.createElement('style');
    style.textContent = [
      '#progDlcRoot{position:fixed;inset:0;z-index:99999;background:#1e1e1e;color:#d4d4d4;',
      'font-family:Consolas,"Courier New",monospace;display:flex;flex-direction:column;}',
      '#progDlcTopbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:#323233;',
      'border-bottom:1px solid #000;flex-wrap:wrap;flex-shrink:0;}',
      '#progDlcTopbar .pd-title{font-weight:700;color:#fff;font-family:"Noto Sans JP",sans-serif;font-size:13px;margin-right:8px;}',
      '.pd-btn{background:#3c3c3c;color:#e8e8e8;border:1px solid #555;border-radius:4px;',
      'padding:5px 10px;font-size:12px;cursor:pointer;font-family:"Noto Sans JP",sans-serif;}',
      '.pd-btn:hover{background:#4a4a4a;}',
      '.pd-btn.pd-primary{background:#0e639c;border-color:#0e639c;color:#fff;}',
      '.pd-btn.pd-primary:hover{background:#1177bb;}',
      '.pd-btn.pd-danger{background:#5a1d1d;border-color:#7a2a2a;color:#fff;}',
      '#progDlcBody{flex:1;display:flex;min-height:0;}',
      '#progDlcSidebar{width:190px;flex-shrink:0;background:#252526;border-right:1px solid #000;',
      'overflow-y:auto;padding:8px 0;}',
      '.pd-sidehead{font-size:11px;color:#8a8a8a;padding:4px 12px;text-transform:uppercase;letter-spacing:.05em;}',
      '.pd-file{display:flex;align-items:center;justify-content:space-between;padding:5px 12px;',
      'font-size:12.5px;cursor:pointer;color:#cfcfcf;font-family:"Noto Sans JP",sans-serif;}',
      '.pd-file:hover{background:#2a2d2e;}',
      '.pd-file.active{background:#37373d;color:#fff;}',
      '.pd-file .pd-file-del{opacity:0;color:#e07a7a;font-size:11px;padding:0 4px;}',
      '.pd-file:hover .pd-file-del{opacity:1;}',
      '#progDlcNewFileRow{display:flex;gap:4px;padding:8px 10px;}',
      '#progDlcNewFileRow input{flex:1;min-width:0;background:#3c3c3c;border:1px solid #555;color:#eee;',
      'border-radius:4px;padding:4px 6px;font-size:12px;font-family:"Noto Sans JP",sans-serif;}',
      '#progDlcMain{flex:1;display:flex;flex-direction:column;min-width:0;}',
      '#progDlcTabs{display:flex;background:#252526;border-bottom:1px solid #000;overflow-x:auto;flex-shrink:0;}',
      '.pd-tab{display:flex;align-items:center;gap:6px;padding:7px 12px;font-size:12px;color:#969696;',
      'border-right:1px solid #1e1e1e;cursor:pointer;white-space:nowrap;font-family:"Noto Sans JP",sans-serif;}',
      '.pd-tab.active{background:#1e1e1e;color:#fff;border-top:2px solid #0e639c;}',
      '.pd-tab .pd-tab-x{opacity:.6;font-size:11px;}',
      '.pd-tab .pd-tab-x:hover{opacity:1;color:#e07a7a;}',
      '#progDlcEditorWrap{flex:1;display:flex;min-height:0;background:#1e1e1e;}',
      '#progDlcGutter{width:44px;flex-shrink:0;background:#1e1e1e;color:#6e6e6e;font-size:13px;',
      'text-align:right;padding:10px 6px 10px 0;line-height:20px;overflow:hidden;user-select:none;white-space:pre;}',
      '#progDlcEditor{flex:1;resize:none;border:none;outline:none;background:#1e1e1e;color:#d4d4d4;',
      'font-family:Consolas,"Courier New",monospace;font-size:13px;line-height:20px;padding:10px 12px;tab-size:2;}',
      '#progDlcBottom{height:230px;flex-shrink:0;border-top:1px solid #000;display:flex;flex-direction:column;background:#181818;}',
      '#progDlcBottomTabs{display:flex;align-items:center;background:#252526;flex-shrink:0;}',
      '.pd-bt{padding:6px 14px;font-size:12px;color:#969696;cursor:pointer;font-family:"Noto Sans JP",sans-serif;}',
      '.pd-bt.active{color:#fff;border-bottom:2px solid #0e639c;}',
      '#progDlcBottomBody{flex:1;min-height:0;position:relative;}',
      '#progDlcPreview{width:100%;height:100%;border:none;background:#fff;display:none;}',
      '#progDlcConsole{width:100%;height:100%;overflow-y:auto;padding:8px 12px;font-size:12.5px;',
      'color:#d4d4d4;white-space:pre-wrap;display:none;box-sizing:border-box;}',
      '#progDlcConsole .pd-err{color:#f14c4c;}',
      '#progDlcConsole .pd-ok{color:#89d185;}',
      '#progDlcTools{width:100%;height:100%;overflow-y:auto;padding:10px 12px;display:none;box-sizing:border-box;}',
      '.pd-tool-grid{display:flex;flex-wrap:wrap;gap:8px;}',
      '.pd-tool-btn{background:#2d2d30;border:1px solid #454545;color:#e8e8e8;border-radius:8px;',
      'padding:8px 12px;font-size:12.5px;cursor:pointer;font-family:"Noto Sans JP",sans-serif;text-align:left;',
      'width:200px;box-sizing:border-box;}',
      '.pd-tool-btn:hover{background:#3a3a3d;border-color:#0e639c;}',
      '.pd-tool-btn .pd-tool-label{display:block;font-weight:700;}',
      '.pd-tool-btn .pd-tool-code{display:block;color:#8a8a8a;font-size:11px;margin-top:3px;white-space:normal;line-height:1.4;}',
      '#progDlcCmdRow{display:none;align-items:center;gap:6px;padding:6px 10px;background:#252526;',
      'border-top:1px solid #000;flex-shrink:0;}',
      '#progDlcCmdRow input{flex:1;background:#3c3c3c;border:1px solid #555;color:#eee;border-radius:4px;',
      'padding:6px 8px;font-size:12.5px;font-family:Consolas,"Courier New",monospace;}',
      '#progDlcReentryBtn{position:fixed;right:18px;bottom:18px;z-index:9998;background:#0e639c;color:#fff;',
      'border:none;border-radius:24px;padding:10px 16px;font-size:13px;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.3);',
      'cursor:pointer;font-family:"Noto Sans JP",sans-serif;}',
      '#progDlcHelpModal{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);display:none;',
      'align-items:center;justify-content:center;}',
      '#progDlcHelpModal .pd-help-box{background:#252526;color:#e8e8e8;border-radius:10px;max-width:560px;',
      'width:92%;max-height:80vh;overflow-y:auto;padding:20px 24px;font-family:"Noto Sans JP",sans-serif;font-size:13px;}',
      '#progDlcHelpModal h3{margin-top:0;color:#fff;}',
      '#progDlcHelpModal code{background:#3c3c3c;padding:1px 6px;border-radius:4px;}'
    ].join('');
    document.head.appendChild(style);

    /* ==========================================================
       2. UI構築
    ========================================================== */
    var root = document.createElement('div');
    root.id = 'progDlcRoot';
    root.innerHTML =
      '<div id="progDlcTopbar">' +
        '<span class="pd-title">🧑‍💻 プログラミング追加パック v0.1</span>' +
        '<button class="pd-btn pd-primary" id="pdRunBtn">▶ 実行</button>' +
        '<button class="pd-btn" id="pdToolBtn">🧩 ツール</button>' +
        '<button class="pd-btn" id="pdCmdBtn">&gt;_ コマンド</button>' +
        '<button class="pd-btn" id="pdExportBtn">📦 DLCとしてエクスポート</button>' +
        '<button class="pd-btn" id="pdHelpBtn">❔ 使い方</button>' +
        '<span style="flex:1;"></span>' +
        '<button class="pd-btn" id="pdExitBtn">📓 ノートに戻る</button>' +
      '</div>' +
      '<div id="progDlcBody">' +
        '<div id="progDlcSidebar">' +
          '<div class="pd-sidehead">ファイル</div>' +
          '<div id="progDlcFileList"></div>' +
          '<div id="progDlcNewFileRow">' +
            '<input type="text" id="pdNewFileName" placeholder="例: game.js">' +
            '<button class="pd-btn" id="pdNewFileBtn">＋</button>' +
          '</div>' +
        '</div>' +
        '<div id="progDlcMain">' +
          '<div id="progDlcTabs"></div>' +
          '<div id="progDlcEditorWrap">' +
            '<div id="progDlcGutter">1</div>' +
            '<textarea id="progDlcEditor" spellcheck="false"></textarea>' +
          '</div>' +
          '<div id="progDlcBottom">' +
            '<div id="progDlcBottomTabs">' +
              '<div class="pd-bt active" data-bt="preview">▶ プレビュー</div>' +
              '<div class="pd-bt" data-bt="console">🖥 コンソール</div>' +
              '<span style="flex:1;"></span>' +
              '<button class="pd-btn" id="pdFullscreenBtn" style="margin:3px 8px;">⛶ 全画面</button>' +
            '</div>' +
            '<div id="progDlcBottomBody">' +
              '<iframe id="progDlcPreview" sandbox="allow-scripts allow-modals" allowfullscreen></iframe>' +
              '<div id="progDlcConsole"></div>' +
              '<div id="progDlcTools"></div>' +
            '</div>' +
          '</div>' +
          '<div id="progDlcCmdRow">' +
            '<span style="color:#8a8a8a;">&gt;</span>' +
            '<input type="text" id="pdCmdInput" placeholder="/help でコマンド一覧を表示">' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    var els = {
      fileList: document.getElementById('progDlcFileList'),
      tabs: document.getElementById('progDlcTabs'),
      editor: document.getElementById('progDlcEditor'),
      gutter: document.getElementById('progDlcGutter'),
      preview: document.getElementById('progDlcPreview'),
      consoleEl: document.getElementById('progDlcConsole'),
      tools: document.getElementById('progDlcTools'),
      cmdRow: document.getElementById('progDlcCmdRow'),
      cmdInput: document.getElementById('pdCmdInput')
    };

    /* ---------- ファイル一覧・タブ描画 ---------- */
    function renderFileList(){
      els.fileList.innerHTML = '';
      project.files.forEach(function(f){
        var row = document.createElement('div');
        row.className = 'pd-file' + (f.name === project.activeName ? ' active' : '');
        row.innerHTML = '<span>' + iconFor(f.name) + ' ' + esc(f.name) + '</span><span class="pd-file-del" data-del="' + esc(f.name) + '">✕</span>';
        row.addEventListener('click', function(e){
          if (e.target.dataset && e.target.dataset.del){ deleteFile(e.target.dataset.del); return; }
          openFile(f.name);
        });
        els.fileList.appendChild(row);
      });
    }
    function iconFor(name){
      var l = langOf(name);
      return { html:'🌐', css:'🎨', js:'📜', python:'🐍', c:'🔧', text:'📄' }[l] || '📄';
    }
    function renderTabs(){
      els.tabs.innerHTML = '';
      openTabs.forEach(function(name){
        if (!getFile(name)) return;
        var tab = document.createElement('div');
        tab.className = 'pd-tab' + (name === project.activeName ? ' active' : '');
        tab.innerHTML = '<span>' + iconFor(name) + ' ' + esc(name) + '</span><span class="pd-tab-x" data-close="' + esc(name) + '">✕</span>';
        tab.addEventListener('click', function(e){
          if (e.target.dataset && e.target.dataset.close){ closeTab(e.target.dataset.close); return; }
          openFile(name);
        });
        els.tabs.appendChild(tab);
      });
    }
    function closeTab(name){
      openTabs = openTabs.filter(function(n){ return n !== name; });
      if (project.activeName === name){
        var next = openTabs[openTabs.length - 1] || (project.files[0] && project.files[0].name);
        if (next) openFile(next);
      }
      renderTabs();
    }

    /* ---------- エディタ ---------- */
    function updateGutter(){
      var lines = els.editor.value.split('\n').length;
      var out = '';
      for (var i=1;i<=lines;i++) out += i + '\n';
      els.gutter.textContent = out;
    }
    els.editor.addEventListener('scroll', function(){ els.gutter.scrollTop = els.editor.scrollTop; });
    var saveTimer = null;
    els.editor.addEventListener('input', function(){
      updateGutter();
      var f = getFile(project.activeName);
      if (f) f.content = els.editor.value;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function(){ saveProject(project); }, 300);
    });

    function openFile(name){
      var f = getFile(name);
      if (!f) return;
      var cur = getFile(project.activeName);
      if (cur) cur.content = els.editor.value;
      project.activeName = name;
      if (openTabs.indexOf(name) === -1) openTabs.push(name);
      els.editor.value = f.content;
      updateGutter();
      renderFileList();
      renderTabs();
      renderTools();
      saveProject(project);
    }

    function createFile(name, content){
      if (!name) return;
      if (!/\.[a-zA-Z0-9]+$/.test(name)) name = name + '.txt';
      if (getFile(name)){ log('「' + name + '」はすでに存在します', true); return; }
      project.files.push({ name: name, content: content != null ? content : starterFor(name) });
      saveProject(project);
      openFile(name);
      toast('ファイル「' + name + '」を作成しました');
    }
    function starterFor(name){
      var l = langOf(name);
      if (l === 'html') return '<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>新しいページ</title>\n</head>\n<body>\n\n</body>\n</html>\n';
      if (l === 'css') return '/* ここにスタイルを書こう */\n';
      if (l === 'js') return '// ここにJavaScriptを書こう\n';
      if (l === 'python') return '# ここにPythonのコードを書こう\nprint("Hello!")\n';
      if (l === 'c') return '#include <stdio.h>\n\nint main(void){\n    printf("Hello!\\n");\n    return 0;\n}\n';
      return '';
    }
    function deleteFile(name){
      if (project.files.length <= 1){ log('最後の1ファイルは削除できません', true); return; }
      if (!window.confirm('「' + name + '」を削除します。よろしいですか？')) return;
      project.files = project.files.filter(function(f){ return f.name !== name; });
      openTabs = openTabs.filter(function(n){ return n !== name; });
      if (project.activeName === name){ project.activeName = project.files[0].name; }
      saveProject(project);
      els.editor.value = getFile(project.activeName).content;
      updateGutter();
      renderFileList(); renderTabs(); renderTools();
    }
    document.getElementById('pdNewFileBtn').addEventListener('click', function(){
      var input = document.getElementById('pdNewFileName');
      createFile(input.value.trim());
      input.value = '';
    });
    document.getElementById('pdNewFileName').addEventListener('keydown', function(e){
      if (e.key === 'Enter'){ document.getElementById('pdNewFileBtn').click(); }
    });

    /* ==========================================================
       3. コンソール／プレビュー
    ========================================================== */
    function log(text, isError){
      var line = document.createElement('div');
      if (isError) line.className = 'pd-err';
      line.textContent = text;
      els.consoleEl.appendChild(line);
      els.consoleEl.scrollTop = els.consoleEl.scrollHeight;
    }
    function clearConsole(){ els.consoleEl.innerHTML = ''; }

    var bottomTabs = document.querySelectorAll('.pd-bt');
    function showBottom(which){
      bottomTabs.forEach(function(t){ t.classList.toggle('active', t.dataset.bt === which); });
      els.preview.style.display = which === 'preview' ? 'block' : 'none';
      els.consoleEl.style.display = which === 'console' ? 'block' : 'none';
      if (which !== 'tools') els.tools.style.display = 'none';
    }
    bottomTabs.forEach(function(t){ t.addEventListener('click', function(){ showBottom(t.dataset.bt); }); });
    showBottom('preview');

    document.getElementById('pdFullscreenBtn').addEventListener('click', function(){
      showBottom('preview');
      var target = els.preview;
      var req = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
      if (req){
        req.call(target).catch(function(){ toast('この環境では全画面表示に対応していません'); });
      } else {
        toast('この環境では全画面表示に対応していません');
      }
    });

    function buildCombinedHtml(){
      var htmlFile = project.files.filter(function(f){ return langOf(f.name) === 'html'; })[0];
      var cssAll = project.files.filter(function(f){ return langOf(f.name) === 'css'; }).map(function(f){ return f.content; }).join('\n');
      var jsAll = project.files.filter(function(f){ return langOf(f.name) === 'js'; }).map(function(f){ return f.content; }).join('\n');
      var base = htmlFile ? htmlFile.content : '<!DOCTYPE html><html><head></head><body></body></html>';
      var styleTag = '<style>\n' + cssAll + '\n</style>';
      var scriptTag = '<script>\n' + jsAll + '\n<' + '/script>';
      if (/<\/head>/i.test(base)) base = base.replace(/<\/head>/i, styleTag + '</head>');
      else base = styleTag + base;
      if (/<\/body>/i.test(base)) base = base.replace(/<\/body>/i, scriptTag + '</body>');
      else base = base + scriptTag;
      return base;
    }

    var pyodideReady = null;
    function ensurePyodide(){
      if (pyodideReady) return pyodideReady;
      log('Python実行環境を読み込んでいます…（初回のみ）');
      pyodideReady = new Promise(function(resolve, reject){
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        s.onload = function(){
          window.loadPyodide().then(function(pyo){
            pyo.setStdout({ batched: function(s){ log(s); } });
            pyo.setStderr({ batched: function(s){ log(s, true); } });
            resolve(pyo);
          }).catch(reject);
        };
        s.onerror = function(){ reject(new Error('Pyodideの読み込みに失敗しました（通信環境をご確認ください）')); };
        document.head.appendChild(s);
      });
      return pyodideReady;
    }

    function runProject(){
      var f = getFile(project.activeName);
      if (!f) return;
      var lang = langOf(f.name);
      if (lang === 'html' || lang === 'css' || lang === 'js'){
        showBottom('preview');
        els.preview.setAttribute('srcdoc', buildCombinedHtml());
        toast('プレビューを更新しました');
      } else if (lang === 'python'){
        showBottom('console');
        log('--- ' + f.name + ' を実行 ---', false);
        ensurePyodide().then(function(pyo){
          return pyo.runPythonAsync(f.content);
        }).catch(function(err){
          log(String(err && err.message ? err.message : err), true);
        });
      } else if (lang === 'c'){
        showBottom('console');
        log('C言語系のブラウザ内実行は、このパック(v0.1)では未対応です。編集・保存のみご利用いただけます。今後のバージョンで対応を検討しています。', true);
      } else {
        showBottom('console');
        log('このファイル形式は実行に対応していません。');
      }
    }
    document.getElementById('pdRunBtn').addEventListener('click', runProject);

    /* ==========================================================
       4. ツールパレット（スクラッチ風ブロックボタン）
    ========================================================== */
    /* 各項目は [ラベル, 挿入するコード, 説明文] の組。カテゴリごとにグループ化して
       表示することで、スクラッチのパレットのように「探しやすく・意味がわかりやすい」
       ことを目指している。 */
    var SNIPPETS = {
      html: [
        { cat:'🔤 文字・見出し', items:[
          ['見出し(大)', '<h1>見出し</h1>\n', '一番大きな見出しを作る'],
          ['見出し(中)', '<h2>見出し</h2>\n', 'やや小さめの見出しを作る'],
          ['段落', '<p>ここに文章を書く</p>\n', '文章のかたまりを作る'],
          ['太字', '<strong>大事な文字</strong>\n', '文字を太くして目立たせる'],
          ['改行', '<br>\n', '文章の途中で改行する'],
          ['箇条書き', '<ul>\n  <li>1つめ</li>\n  <li>2つめ</li>\n</ul>\n', '・つきのリストを作る'],
          ['番号リスト', '<ol>\n  <li>1つめ</li>\n  <li>2つめ</li>\n</ol>\n', '番号つきのリストを作る']
        ]},
        { cat:'🖼️ 画像・メディア', items:[
          ['画像', '<img src="画像のURL" alt="説明" width="200">\n', '画像を表示する'],
          ['リンク', '<a href="URL">リンクの文字</a>\n', 'クリックすると別ページに飛ぶ文字を作る'],
          ['動画(YouTube)', '<iframe width="320" height="180" src="https://www.youtube.com/embed/動画ID"></iframe>\n', 'YouTube動画を埋め込む'],
          ['音声再生', '<audio src="音声のURL" controls></audio>\n', '音声プレーヤーを表示する']
        ]},
        { cat:'🖱️ 入力・操作', items:[
          ['ボタン', '<button onclick="関数名()">ボタン</button>\n', '押すと関数を実行するボタンを作る'],
          ['テキスト入力欄', '<input type="text" id="myInput" placeholder="入力してね">\n', '1行の文字を入力できる欄を作る'],
          ['チェックボックス', '<input type="checkbox" id="myCheck"> <label for="myCheck">ラベル</label>\n', 'オン/オフを選べるチェックボックスを作る'],
          ['選択メニュー', '<select id="mySelect">\n  <option>選択肢1</option>\n  <option>選択肢2</option>\n</select>\n', 'プルダウンで選べるメニューを作る']
        ]},
        { cat:'📐 レイアウト', items:[
          ['div枠', '<div id="myBox">\n\n</div>\n', 'まとまりを作る箱（枠）'],
          ['横並びの枠', '<div style="display:flex; gap:10px;">\n  \n</div>\n', '中身を横に並べる箱'],
          ['表(テーブル)', '<table border="1">\n  <tr><th>見出し1</th><th>見出し2</th></tr>\n  <tr><td>データ1</td><td>データ2</td></tr>\n</table>\n', '表を作る'],
          ['区切り線', '<hr>\n', '横に1本、区切りの線を引く']
        ]}
      ],
      css: [
        { cat:'🎨 色・見た目', items:[
          ['文字色', 'color: red;\n', '文字の色を変える'],
          ['背景色', 'background: #FFEECC;\n', '背景の色を変える'],
          ['枠線', 'border: 2px solid #333;\n', '枠線をつける'],
          ['角丸', 'border-radius: 12px;\n', '角を丸くする'],
          ['影をつける', 'box-shadow: 0 4px 10px rgba(0,0,0,.2);\n', 'ふんわりした影をつける']
        ]},
        { cat:'🔤 文字', items:[
          ['文字サイズ', 'font-size: 20px;\n', '文字の大きさを変える'],
          ['太字にする', 'font-weight: bold;\n', '文字を太くする'],
          ['文字を中央寄せ', 'text-align: center;\n', '文字を真ん中に寄せる'],
          ['フォントを変える', 'font-family: "Noto Sans JP", sans-serif;\n', '文字の書体を変える']
        ]},
        { cat:'📏 余白・サイズ', items:[
          ['内側の余白', 'padding: 10px;\n', '枠の内側にすき間をあける'],
          ['外側の余白', 'margin: 10px;\n', '枠の外側にすき間をあける'],
          ['幅を決める', 'width: 200px;\n', '横幅を指定する'],
          ['高さを決める', 'height: 100px;\n', '高さを指定する']
        ]},
        { cat:'📐 レイアウト', items:[
          ['横並びにする', 'display: flex;\n', '中身を横に並べる'],
          ['中央に寄せる', 'display: flex;\njustify-content: center;\nalign-items: center;\n', '中身を上下左右まん中に寄せる'],
          ['均等に並べる', 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 10px;\n', '3列に均等に並べる']
        ]},
        { cat:'✨ 動き', items:[
          ['ホバーで変化', ':hover {\n  opacity: 0.8;\n}\n', 'マウスを乗せたときに見た目を変える（セレクタの後ろに続けて書く）'],
          ['ゆっくり変化', 'transition: all 0.3s;\n', '見た目の変化をなめらかにする']
        ]}
      ],
      js: [
        { cat:'🔤 表示・出力', items:[
          ['画面に表示', 'console.log("メッセージ");\n', 'コンソールに文字を表示する（確認用）'],
          ['ポップアップ', 'alert("メッセージ");\n', '画面にお知らせを表示する'],
          ['確認ダイアログ', 'if (confirm("よろしいですか？")) {\n  \n}\n', 'はい/いいえを聞く'],
          ['入力を聞く', 'let 答え = prompt("入力してください");\n', 'ユーザーに文字を入力してもらう']
        ]},
        { cat:'❓ 条件・くり返し', items:[
          ['もし〜なら', 'if (条件) {\n  \n}\n', '条件が正しいときだけ実行する'],
          ['もし〜でなければ', 'if (条件) {\n  \n} else {\n  \n}\n', '条件によって2つに分ける'],
          ['くり返す(回数)', 'for (let i = 0; i < 10; i++) {\n  \n}\n', '決まった回数くり返す'],
          ['条件でくり返す', 'while (条件) {\n  \n}\n', '条件が正しい間くり返す']
        ]},
        { cat:'📦 変数・データ', items:[
          ['変数を作る', 'let 変数名 = 0;\n', 'あとから変えられる値を作る'],
          ['変わらない値', 'const 名前 = "値";\n', 'あとから変えられない値を作る'],
          ['配列を作る', 'let リスト = [1, 2, 3];\n', '複数の値をまとめて持つ'],
          ['配列に追加', 'リスト.push(値);\n', '配列に新しい値を追加する'],
          ['まとまり(オブジェクト)', 'let 人 = { name: "たろう", age: 10 };\n', '名前つきのデータをまとめる']
        ]},
        { cat:'🧩 関数', items:[
          ['関数を作る', 'function 関数名() {\n  \n}\n', 'ひとまとまりの処理に名前をつける'],
          ['値を返す関数', 'function 関数名(引数) {\n  return 引数 * 2;\n}\n', '計算結果を返す関数を作る'],
          ['矢印関数', 'const 関数名 = () => {\n  \n};\n', '短く書ける関数の書き方']
        ]},
        { cat:'🖱️ 操作・イベント', items:[
          ['ボタンを押したら', 'document.getElementById("id名").addEventListener("click", function(){\n  \n});\n', 'ボタンが押されたときの処理を書く'],
          ['要素を取得する', 'let el = document.getElementById("id名");\n', '画面の部品をつかまえる'],
          ['文字を書き換える', 'el.textContent = "新しい文字";\n', '画面の文字を書き換える'],
          ['色を変える', 'el.style.color = "blue";\n', '画面の部品の色を変える']
        ]}
      ],
      python: [
        { cat:'🔤 表示・出力', items:[
          ['表示する', 'print("メッセージ")\n', '画面に文字を表示する'],
          ['入力を受け取る', '答え = input("入力してください：")\n', 'キーボードから文字を受け取る'],
          ['まとめて表示', 'name = "たろう"\nprint(f"こんにちは、{name}さん")\n', '変数を混ぜて表示する(f文字列)']
        ]},
        { cat:'❓ 条件・くり返し', items:[
          ['もし〜なら', 'if 条件:\n    \n', '条件が正しいときだけ実行する'],
          ['もし〜でなければ', 'if 条件:\n    \nelse:\n    \n', '条件によって2つに分ける'],
          ['くり返す(回数)', 'for i in range(10):\n    \n', '決まった回数くり返す'],
          ['条件でくり返す', 'while 条件:\n    \n', '条件が正しい間くり返す']
        ]},
        { cat:'📦 変数・データ', items:[
          ['変数を作る', '変数名 = 0\n', 'あとから変えられる値を作る'],
          ['リストを作る', 'リスト = [1, 2, 3]\n', '複数の値をまとめて持つ'],
          ['リストに追加', 'リスト.append(値)\n', 'リストに新しい値を追加する'],
          ['辞書(dict)を作る', '人 = {"name": "たろう", "age": 10}\n', '名前つきのデータをまとめる']
        ]},
        { cat:'🧩 関数', items:[
          ['関数を作る', 'def 関数名():\n    \n', 'ひとまとまりの処理に名前をつける'],
          ['値を返す関数', 'def 関数名(引数):\n    return 引数 * 2\n', '計算結果を返す関数を作る']
        ]},
        { cat:'🛠️ 便利機能', items:[
          ['ランダムな数', 'import random\n数 = random.randint(1, 6)\n', 'サイコロのようなランダムな数を作る'],
          ['数える(range)', 'for i in range(len(リスト)):\n    \n', 'リストの要素数ぶんくり返す']
        ]}
      ],
      c: [
        { cat:'🏁 基本', items:[
          ['ヘッダーを読み込む', '#include <stdio.h>\n', '入出力の機能を使えるようにする'],
          ['main関数', 'int main(void) {\n    \n    return 0;\n}\n', 'プログラムの開始地点を作る'],
          ['画面に表示', 'printf("メッセージ\\n");\n', '画面に文字を表示する'],
          ['入力を受け取る', 'int 変数名;\nscanf("%d", &変数名);\n', 'キーボードから数値を受け取る']
        ]},
        { cat:'❓ 条件・くり返し', items:[
          ['もし〜なら', 'if (条件) {\n    \n}\n', '条件が正しいときだけ実行する'],
          ['もし〜でなければ', 'if (条件) {\n    \n} else {\n    \n}\n', '条件によって2つに分ける'],
          ['くり返す(回数)', 'for (int i = 0; i < 10; i++) {\n    \n}\n', '決まった回数くり返す'],
          ['条件でくり返す', 'while (条件) {\n    \n}\n', '条件が正しい間くり返す']
        ]},
        { cat:'📦 変数・配列', items:[
          ['整数の変数', 'int 変数名 = 0;\n', '整数を入れる箱を作る'],
          ['配列を作る', 'int 配列名[5] = {1, 2, 3, 4, 5};\n', '複数の値をまとめて持つ'],
          ['文字列を作る', 'char 文字列名[100] = "こんにちは";\n', '文字の並びを入れる箱を作る']
        ]},
        { cat:'🧩 関数', items:[
          ['戻り値のある関数', 'int 関数名(int 引数) {\n    return 引数 * 2;\n}\n', '計算結果を返す関数を作る'],
          ['戻り値のない関数', 'void 関数名(void) {\n    \n}\n', '値を返さない処理をまとめる']
        ]}
      ],
      text: []
    };
    function renderTools(){
      var lang = langOf(project.activeName);
      var cats = SNIPPETS[lang] || [];
      els.tools.innerHTML = '';
      if (!cats.length){
        els.tools.innerHTML = '<div style="color:#8a8a8a;font-family:\'Noto Sans JP\',sans-serif;font-size:12.5px;">このファイル形式向けのツールはまだありません。</div>';
        return;
      }
      cats.forEach(function(cat){
        var head = document.createElement('div');
        head.textContent = cat.cat;
        head.style.cssText = 'color:#9cdcfe;font-family:"Noto Sans JP",sans-serif;font-size:12.5px;font-weight:700;margin:10px 0 6px;';
        els.tools.appendChild(head);
        var grid = document.createElement('div');
        grid.className = 'pd-tool-grid';
        cat.items.forEach(function(item){
          var btn = document.createElement('button');
          btn.className = 'pd-tool-btn';
          btn.title = item[1];
          btn.innerHTML = '<span class="pd-tool-label">' + esc(item[0]) + '</span><span class="pd-tool-code">' + esc(item[2] || '') + '</span>';
          btn.addEventListener('click', function(){ insertAtCursor(item[1]); });
          grid.appendChild(btn);
        });
        els.tools.appendChild(grid);
      });
    }
    function insertAtCursor(text){
      var el = els.editor;
      var start = el.selectionStart, end = el.selectionEnd;
      el.value = el.value.slice(0, start) + text + el.value.slice(end);
      el.selectionStart = el.selectionEnd = start + text.length;
      el.dispatchEvent(new Event('input'));
      el.focus();
    }
    document.getElementById('pdToolBtn').addEventListener('click', function(){
      var showing = els.tools.style.display === 'block';
      if (showing){ els.tools.style.display = 'none'; showBottom('preview'); }
      else {
        els.preview.style.display = 'none'; els.consoleEl.style.display = 'none';
        els.tools.style.display = 'block';
        bottomTabs.forEach(function(t){ t.classList.remove('active'); });
      }
    });

    /* ==========================================================
       5. コマンドバー
    ========================================================== */
    var HELP_TEXT = [
      '/new ファイル名 ― 新しいファイルを作る（例: /new game.js）',
      '/open ファイル名 ― 既存のファイルを開く',
      '/rename 旧名 新名 ― ファイル名を変える',
      '/delete ファイル名 ― ファイルを削除する',
      '/files ― ファイル一覧を表示する',
      '/run ― 実行する（アクティブなファイルに応じてプレビューまたは実行）',
      '/tool ― ツールパレットの表示/非表示を切り替える',
      '/export dlc ― 今の作品を新しいDLC（.jsファイル）として書き出す',
      '/clear ― コンソールを消す',
      '/help ― このコマンド一覧を表示する',
      '/exit ― 一時的にノート画面へ戻る'
    ];
    function handleCommand(raw){
      var input = (raw || '').trim();
      if (!input) return;
      log('> ' + input);
      var m;
      if (/^\/help$/i.test(input)){ HELP_TEXT.forEach(function(t){ log(t); }); return; }
      if (/^\/files$/i.test(input)){ project.files.forEach(function(f){ log((f.name === project.activeName ? '* ' : '  ') + f.name + '  [' + LANG_LABEL[langOf(f.name)] + ']'); }); return; }
      if (/^\/run$/i.test(input)){ runProject(); return; }
      if (/^\/clear$/i.test(input)){ clearConsole(); return; }
      if (/^\/tool$/i.test(input)){ document.getElementById('pdToolBtn').click(); return; }
      if (/^\/export\s+dlc$/i.test(input)){ exportAsDlc(); return; }
      if (/^\/exit$/i.test(input)){ exitToNote(); return; }
      if ((m = /^\/new\s+(\S+)$/i.exec(input))){ createFile(m[1]); return; }
      if ((m = /^\/open\s+(\S+)$/i.exec(input))){ if (getFile(m[1])) openFile(m[1]); else log('「' + m[1] + '」は見つかりません', true); return; }
      if ((m = /^\/delete\s+(\S+)$/i.exec(input))){ deleteFile(m[1]); return; }
      if ((m = /^\/rename\s+(\S+)\s+(\S+)$/i.exec(input))){
        var f = getFile(m[1]);
        if (!f){ log('「' + m[1] + '」は見つかりません', true); return; }
        if (getFile(m[2])){ log('「' + m[2] + '」はすでに存在します', true); return; }
        f.name = m[2];
        if (project.activeName === m[1]) project.activeName = m[2];
        openTabs = openTabs.map(function(n){ return n === m[1] ? m[2] : n; });
        saveProject(project); renderFileList(); renderTabs();
        log('「' + m[1] + '」を「' + m[2] + '」に変更しました', false);
        return;
      }
      log('わからないコマンドです（/help で一覧を表示できます）', true);
    }
    document.getElementById('pdCmdBtn').addEventListener('click', function(){
      var visible = els.cmdRow.style.display === 'flex';
      els.cmdRow.style.display = visible ? 'none' : 'flex';
      if (!visible){ showBottom('console'); els.cmdInput.focus(); }
    });
    els.cmdInput.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){ handleCommand(els.cmdInput.value); els.cmdInput.value = ''; }
    });

    /* ==========================================================
       6. DLCとしてエクスポート
    ========================================================== */
    function exportAsDlc(){
      var cur = getFile(project.activeName);
      if (cur) cur.content = els.editor.value;
      var htmlFile = project.files.filter(function(f){ return langOf(f.name) === 'html'; })[0];
      var hasWeb = !!htmlFile;
      var combined = hasWeb ? buildCombinedHtml() : '';
      var pyFiles = project.files.filter(function(f){ return langOf(f.name) === 'python'; });
      var fileNames = project.files.map(function(f){ return f.name; }).join(', ');
      var dateStr = new Date().toISOString().slice(0,10);

      var lines = [];
      lines.push('/* ============================================================================');
      lines.push('   読みノート (Yomi-Note) 追加DLC');
      lines.push('   プログラミング追加パックで作成した作品（' + dateStr + ' エクスポート）');
      lines.push('   含まれるファイル: ' + fileNames);
      lines.push('   ----------------------------------------------------------------------------');
      lines.push('   この.jsファイルは、読みノートの🧩ボタン（または /import dlc）から取り込める');
      lines.push('   DLCファイルです。有効にすると、画面右上に「🧩マイ作品」ボタンが追加され、');
      lines.push('   クリックすると作った作品をその場で見る／実行できます。');
      lines.push('   自由に中身を書き換えて、自分だけのDLCとして育てていくこともできます。');
      lines.push('   ============================================================================ */');
      lines.push('(function(){');
      lines.push('  "use strict";');
      lines.push('  function whenAppReady(fn){');
      lines.push('    if (typeof notestate !== "undefined" && typeof window.setTool === "function"){ fn(); }');
      lines.push('    else { setTimeout(function(){ whenAppReady(fn); }, 50); }');
      lines.push('  }');
      lines.push('  whenAppReady(function(){');
      lines.push('    var HTML_SRC = ' + JSON.stringify(combined) + ';');
      lines.push('    var PY_FILES = ' + JSON.stringify(pyFiles) + ';');
      lines.push('    var btn = document.createElement("button");');
      lines.push('    btn.textContent = "🧩 マイ作品";');
      lines.push('    btn.className = "icon-btn";');
      lines.push('    btn.title = "プログラミング追加パックで作った作品を開く";');
      lines.push('    btn.style.cssText = "position:fixed;top:10px;right:10px;z-index:9997;";');
      lines.push('    document.body.appendChild(btn);');
      lines.push('    var modal = document.createElement("div");');
      lines.push('    modal.style.cssText = "position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;";');
      lines.push('    modal.innerHTML = "<div style=\\"background:#fff;border-radius:10px;width:min(92vw,900px);height:min(85vh,700px);display:flex;flex-direction:column;overflow:hidden;\\">" +');
      lines.push('      "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#22262E;color:#fff;\\">" +');
      lines.push('      "<span>🧩 マイ作品</span><button id=\\"myWorkClose\\" style=\\"background:none;border:none;color:#fff;font-size:16px;cursor:pointer;\\">✕</button></div>" +');
      lines.push('      "<iframe id=\\"myWorkFrame\\" sandbox=\\"allow-scripts allow-modals\\" style=\\"flex:1;border:none;\\"></iframe>" +');
      lines.push('      (PY_FILES.length ? "<div id=\\"myWorkPyOut\\" style=\\"max-height:160px;overflow:auto;background:#1e1e1e;color:#d4d4d4;font-family:monospace;font-size:12px;padding:8px 12px;white-space:pre-wrap;\\"></div>" : "") +');
      lines.push('      "</div>";');
      lines.push('    document.body.appendChild(modal);');
      lines.push('    btn.addEventListener("click", function(){');
      lines.push('      modal.style.display = "flex";');
      lines.push('      var frame = document.getElementById("myWorkFrame");');
      lines.push('      if (HTML_SRC) frame.setAttribute("srcdoc", HTML_SRC);');
      lines.push('      if (PY_FILES.length){');
      lines.push('        var out = document.getElementById("myWorkPyOut");');
      lines.push('        out.textContent = "Python実行環境を読み込み中…";');
      lines.push('        var s = document.createElement("script");');
      lines.push('        s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";');
      lines.push('        s.onload = function(){');
      lines.push('          window.loadPyodide().then(function(pyo){');
      lines.push('            out.textContent = "";');
      lines.push('            pyo.setStdout({ batched: function(t){ out.textContent += t + "\\n"; } });');
      lines.push('            pyo.setStderr({ batched: function(t){ out.textContent += t + "\\n"; } });');
      lines.push('            PY_FILES.forEach(function(f){ pyo.runPythonAsync(f.content).catch(function(e){ out.textContent += String(e) + "\\n"; }); });');
      lines.push('          });');
      lines.push('        };');
      lines.push('        document.head.appendChild(s);');
      lines.push('      }');
      lines.push('    });');
      lines.push('    document.getElementById("myWorkClose") && modal.addEventListener("click", function(e){');
      lines.push('      if (e.target.id === "myWorkClose" || e.target === modal) modal.style.display = "none";');
      lines.push('    });');
      lines.push('  });');
      lines.push('})();');
      var jsSrc = lines.join('\n');

      var blob = new Blob([jsSrc], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'my-work-dlc-' + dateStr + '.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      log('DLCファイルとして書き出しました（my-work-dlc-' + dateStr + '.js）。読みノートの🧩ボタンから取り込めます。', false);
      toast('DLCとして書き出しました');
    }
    document.getElementById('pdExportBtn').addEventListener('click', exportAsDlc);

    /* ==========================================================
       7. ヘルプモーダル
    ========================================================== */
    var helpModal = document.createElement('div');
    helpModal.id = 'progDlcHelpModal';
    helpModal.innerHTML =
      '<div class="pd-help-box">' +
        '<h3>🧑‍💻 プログラミング追加パックの使い方</h3>' +
        '<p>左のファイル一覧からファイルを選んで編集し、上の「▶ 実行」を押すとHTML/CSS/JSはプレビュー、Python/はコンソールに結果が表示されます。</p>' +
        '<p>「🧩 ツール」でブロックのようなボタンからコードの部品を挿入できます（カテゴリごとに整理されています）。プレビュー画面右上の「⛶ 全画面」でプレビューを大きく表示できます。「&gt;_ コマンド」でキーボード操作もできます（<code>/help</code>で一覧）。</p>' +
        '<p>作った作品は「📦 DLCとしてエクスポート」から新しい.jsファイルとして書き出せます。書き出したファイルは、読みノートの🧩ボタンから他のDLCと同じように取り込めます。</p>' +
        '<p>「📓 ノートに戻る」でいつでも通常のノート画面に戻れます（右下の🧑‍💻ボタンでまた戻ってこられます）。</p>' +
        '<div style="text-align:right;margin-top:14px;"><button class="pd-btn pd-primary" id="pdHelpCloseBtn">閉じる</button></div>' +
      '</div>';
    document.body.appendChild(helpModal);
    document.getElementById('pdHelpBtn').addEventListener('click', function(){ helpModal.style.display = 'flex'; });
    helpModal.addEventListener('click', function(e){ if (e.target === helpModal) helpModal.style.display = 'none'; });
    document.getElementById('pdHelpCloseBtn').addEventListener('click', function(){ helpModal.style.display = 'none'; });

    /* ==========================================================
       8. ノート画面との行き来
    ========================================================== */
    var appEl = document.getElementById('app');
    var reentryBtn = null;
    function exitToNote(){
      root.style.display = 'none';
      helpModal.style.display = 'none';
      if (appEl) appEl.style.display = '';
      if (!reentryBtn){
        reentryBtn = document.createElement('button');
        reentryBtn.id = 'progDlcReentryBtn';
        reentryBtn.textContent = '🧑‍💻 コードに戻る';
        reentryBtn.addEventListener('click', enterCode);
        document.body.appendChild(reentryBtn);
      }
      reentryBtn.style.display = 'block';
      toast('ノート画面に戻りました');
    }
    function enterCode(){
      root.style.display = 'flex';
      if (appEl) appEl.style.display = 'none';
      if (reentryBtn) reentryBtn.style.display = 'none';
    }
    document.getElementById('pdExitBtn').addEventListener('click', exitToNote);

    /* ==========================================================
       9. 初期化
    ========================================================== */
    if (appEl) appEl.style.display = 'none';
    els.editor.value = getFile(project.activeName).content;
    updateGutter();
    renderFileList();
    renderTabs();
    renderTools();
    toast('🧑‍💻 プログラミング追加パック v0.1 が有効になりました');
  });
})();
