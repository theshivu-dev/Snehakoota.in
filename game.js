/* ===================================================================
   SNEHAKOOTA GAME MODULES
   -------------------------------------------------------------------
   Extracted from the original index.html <script>...</script> block.
   No game logic is intentionally changed by this extraction.

   This file expects the game HTML structure under #sk-game-root to be
   present in the page before this script executes.

   Each module is a self-contained object: { title, init(container), destroy() }.
   init() renders itself into whatever DOM node it's given and wires its
   own listeners; destroy() tears those down. Registered under
   window.SKG.games so the whole widget (styles + markup + this script)
   can be lifted onto another page as one block and still work — the
   launcher picks a random registered game with zero other changes.
   =================================================================== */
window.SKG = window.SKG || {};
SKG.games = {};

/* --- tile-merge — 2048-style word chain, story-chapter words --- */
SKG.games.tileMerge = (function(){
  "use strict";
  var WORDS = ['ಸ್ನೇಹ','ಬಳಗ','ನಂಟು','ಪಯಣ','ವಿಶ್ವಾಸ','ಒಗ್ಗಟ್ಟು','ಭರವಸೆ','ಸ್ನೇಹಕೂಟ'];
  var SIZE = 4;
  var board, gridEl, scoreEl, bestEl, feedbackEl, restartBtn;
  var score = 0, best = 0;
  var keyHandler, touchStartHandler, touchEndHandler, restartHandler, touchStartX = 0, touchStartY = 0;

  function emptyCells(){
    var cells = [];
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) if (!board[r][c]) cells.push([r, c]);
    return cells;
  }
  function spawn(){
    var cells = emptyCells();
    if (!cells.length) return;
    var cell = cells[Math.floor(Math.random() * cells.length)];
    board[cell[0]][cell[1]] = Math.random() < 0.85 ? 1 : 2;
  }
  function fontFor(word){
    var len = word.length;
    return len <= 3 ? '.8rem' : (len <= 5 ? '.68rem' : (len <= 7 ? '.58rem' : '.46rem'));
  }
  function render(){
    var html = '';
    for (var r = 0; r < SIZE; r++){
      for (var c = 0; c < SIZE; c++){
        var v = board[r][c];
        if (v){
          var word = WORDS[v - 1];
          html += '<div class="skg-tm-cell skg-tm-t' + v + '" style="font-size:' + fontFor(word) + '">' + word + '</div>';
        } else {
          html += '<div class="skg-tm-cell"></div>';
        }
      }
    }
    gridEl.innerHTML = html;
    scoreEl.textContent = score;
  }
  function slideRow(row){
    var arr = row.filter(function(v){ return v; });
    var merged = [], gained = 0;
    for (var i = 0; i < arr.length; i++){
      if (i < arr.length - 1 && arr[i] === arr[i + 1] && arr[i] < WORDS.length){
        var nv = arr[i] + 1;
        merged.push(nv);
        gained += nv;
        i++;
        if (nv === WORDS.length){
          feedbackEl.textContent = 'ಗೆದ್ದಿರಿ! 🎉 ' + WORDS[nv - 1];
          feedbackEl.className = 'skg-feedback';
        }
      } else {
        merged.push(arr[i]);
      }
    }
    while (merged.length < SIZE) merged.push(0);
    return { row: merged, gained: gained, moved: JSON.stringify(row) !== JSON.stringify(merged) };
  }
  function transpose(b){
    var nb = [];
    for (var c = 0; c < SIZE; c++){
      var row = [];
      for (var r = 0; r < SIZE; r++) row.push(b[r][c]);
      nb.push(row);
    }
    return nb;
  }
  function hasMoves(){
    for (var r = 0; r < SIZE; r++){
      for (var c = 0; c < SIZE; c++){
        var v = board[r][c];
        if (!v) return true;
        if (c < SIZE - 1 && board[r][c + 1] === v) return true;
        if (r < SIZE - 1 && board[r + 1][c] === v) return true;
      }
    }
    return false;
  }
  function restart(){
    score = 0;
    board = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    feedbackEl.textContent = '';
    feedbackEl.className = 'skg-feedback';
    restartBtn.style.display = 'none';
    spawn(); spawn();
    render();
  }
  function move(dir){
    var moved = false, gained = 0;
    var vertical = (dir === 'up' || dir === 'down');
    var reverseNeeded = (dir === 'right' || dir === 'down');
    var b = vertical ? transpose(board) : board.map(function(row){ return row.slice(); });

    var newBoard = [];
    for (var r = 0; r < SIZE; r++){
      var row = b[r].slice();
      if (reverseNeeded) row.reverse();
      var res = slideRow(row);
      if (reverseNeeded) res.row.reverse();
      newBoard.push(res.row);
      if (res.moved) moved = true;
      gained += res.gained;
    }
    board = vertical ? transpose(newBoard) : newBoard;

    if (moved){
      score += gained;
      if (score > best){
        best = score;
        bestEl.textContent = best;
        try { localStorage.setItem('skg_merge_best', String(best)); } catch(e){}
      }
      spawn();
      render();
      if (!emptyCells().length && !hasMoves()){
        feedbackEl.textContent = 'ಆಟ ಮುಗಿಯಿತು';
        feedbackEl.className = 'skg-feedback skg-miss';
        restartBtn.style.display = 'block';
      }
    }
  }

  return {
    title: '🔀 ಪದ ಸೇರಿಸಿ',
    init: function(container){
      try { best = parseInt(localStorage.getItem('skg_merge_best') || '0', 10) || 0; } catch(e){ best = 0; }
      score = 0;
      board = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

      container.innerHTML =
        '<div class="skg-scores">ಸ್ಕೋರ್ <b id="skgTmScore">0</b> &nbsp; ಬೆಸ್ಟ್ <b id="skgTmBest">' + best + '</b></div>' +
        '<div class="skg-tm-grid" id="skgTmGrid"></div>' +
        '<div class="skg-feedback" id="skgTmFeedback"></div>' +
        '<button class="skg-tm-restart" id="skgTmRestart" style="display:none;">ಮತ್ತೆ ಆಡಿ ↺</button>' +
        '<div class="skg-tm-hint">ಸ್ವೈಪ್ ಮಾಡಿ ಅಥವಾ ಬಾಣದ ಕೀ ಒತ್ತಿ</div>';

      gridEl = container.querySelector('#skgTmGrid');
      scoreEl = container.querySelector('#skgTmScore');
      bestEl = container.querySelector('#skgTmBest');
      feedbackEl = container.querySelector('#skgTmFeedback');
      restartBtn = container.querySelector('#skgTmRestart');

      spawn(); spawn();
      render();

      keyHandler = function(e){
        var map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
        if (map[e.key]){ e.preventDefault(); move(map[e.key]); }
      };
      document.addEventListener('keydown', keyHandler);

      touchStartHandler = function(e){
        var t = e.touches[0];
        touchStartX = t.clientX; touchStartY = t.clientY;
      };
      touchEndHandler = function(e){
        var t = e.changedTouches[0];
        var dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
        else move(dy > 0 ? 'down' : 'up');
      };
      gridEl.addEventListener('touchstart', touchStartHandler, { passive: true });
      gridEl.addEventListener('touchend', touchEndHandler, { passive: true });

      restartHandler = function(){ restart(); };
      restartBtn.addEventListener('click', restartHandler);
    },
    destroy: function(){
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      if (gridEl){
        if (touchStartHandler) gridEl.removeEventListener('touchstart', touchStartHandler);
        if (touchEndHandler) gridEl.removeEventListener('touchend', touchEndHandler);
      }
      if (restartBtn && restartHandler) restartBtn.removeEventListener('click', restartHandler);
      gridEl = scoreEl = bestEl = feedbackEl = restartBtn = null;
    }
  };
})();

/* ===================================================================
   WIDGET WIRING — launcher / confirm bubble / panel shell.
   -------------------------------------------------------------------
   Same launcher + confirm bubble as before; "ಹೌದು" now opens the
   panel directly with the tile-merge game (the only game left).
   =================================================================== */
(function(){
  "use strict";
  var launcher = document.getElementById('skgLauncher');
  var veil = document.getElementById('skgVeil');
  var confirmBox = document.getElementById('skgConfirm');
  var yesBtn = document.getElementById('skgYes');
  var noBtn = document.getElementById('skgNo');
  var panel = document.getElementById('skgPanel');
  var panelTitle = document.getElementById('skgPanelTitle');
  var gameArea = document.getElementById('skgGameArea');
  var closeBtn = document.getElementById('skgClose');

  var activeGame = null;

  function showVeil(){ veil.classList.add('skg-show'); }
  function hideVeil(){ veil.classList.remove('skg-show'); }

  function openConfirm(){
    launcher.classList.remove('skg-pulsing');
    confirmBox.classList.add('skg-show');
    showVeil();
  }
  function closeConfirm(){
    confirmBox.classList.remove('skg-show');
    hideVeil();
  }
  launcher.addEventListener('click', openConfirm);
  noBtn.addEventListener('click', closeConfirm);
  veil.addEventListener('click', function(){
    closeConfirm();
    stopGame();
  });

  yesBtn.addEventListener('click', function(){
    confirmBox.classList.remove('skg-show');
    hideVeil();
    openPanel();
  });

  function openPanel(){
    panel.classList.add('skg-show');
    stopGame();
    activeGame = SKG.games.tileMerge;
    panelTitle.textContent = activeGame.title;
    gameArea.innerHTML = '';
    activeGame.init(gameArea);
  }
  closeBtn.addEventListener('click', function(){
    panel.classList.remove('skg-show');
    stopGame();
  });

  function stopGame(){
    if (activeGame){ activeGame.destroy(); activeGame = null; }
  }
})();
