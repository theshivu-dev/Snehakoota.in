/* =========================================================
   SNEHAKOOTA — MINI-GAME RUNTIME REPAIR
   ---------------------------------------------------------
   Surgical repair for the duplicated game widget that entered
   index.html during the earlier game update.

   Scope: game launcher, confirm popup and game launch only.
   Does not alter page content, NAV, footer or game module logic.
   ========================================================= */

(function () {
  'use strict';

  function repairGameWidget() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('#sk-game-root'));
    if (!roots.length) return;

    /* Keep the first/original widget and remove duplicate copies. */
    var root = roots[0];
    roots.slice(1).forEach(function (duplicate) {
      duplicate.remove();
    });

    /* Restore the original Kannada launcher prompt. */
    var title = root.querySelector('.skg-confirm-title');
    var text = root.querySelector('.skg-confirm-text');
    var noButton = root.querySelector('#skgNo');
    var yesButton = root.querySelector('#skgYes');

    if (title) title.textContent = 'ಸ್ವಲ್ಪ ಆಟ ಆಡೋಣವಾ?';
    if (text) { text.textContent = ''; text.style.display = 'none'; }
    if (noButton) noButton.textContent = 'ಬೇಡ';
    if (yesButton) yesButton.textContent = 'ಹೌದು ▶';

    var launcher = root.querySelector('#skgLauncher');
    var confirmBox = root.querySelector('#skgConfirm');
    var veil = root.querySelector('#skgVeil');
    var panel = root.querySelector('#skgPanel');
    var closeButton = root.querySelector('#skgClose');
    var gameArea = root.querySelector('#skgGameArea');
    var panelTitle = root.querySelector('#skgPanelTitle');

    if (!launcher || !confirmBox || !veil || !panel || !closeButton || !gameArea) return;

    /* Clone controls to remove broken/duplicate listeners attached by
       duplicated inline widget code. */
    function clean(node) {
      var replacement = node.cloneNode(true);
      node.parentNode.replaceChild(replacement, node);
      return replacement;
    }

    launcher = clean(launcher);
    confirmBox = root.querySelector('#skgConfirm');
    veil = clean(root.querySelector('#skgVeil'));
    closeButton = clean(root.querySelector('#skgClose'));
    noButton = clean(root.querySelector('#skgNo'));
    yesButton = clean(root.querySelector('#skgYes'));
    panel = root.querySelector('#skgPanel');
    gameArea = root.querySelector('#skgGameArea');
    panelTitle = root.querySelector('#skgPanelTitle');

    var activeGame = null;

    function hideConfirm() {
      confirmBox.classList.remove('skg-show');
      veil.classList.remove('skg-show');
    }

    function stopGame() {
      if (activeGame && typeof activeGame.destroy === 'function') {
        activeGame.destroy();
      }
      activeGame = null;
    }

    function openPanel() {
      var games = window.SKG && window.SKG.games;
      var game = games && games.tileMerge;
      if (!game) return;

      panel.classList.add('skg-show');
      panel.setAttribute('aria-hidden', 'false');
      stopGame();
      activeGame = game;
      gameArea.innerHTML = '';
      if (panelTitle) panelTitle.textContent = game.title || 'ಆಟ';
      game.init(gameArea);
    }

    function closePanel() {
      panel.classList.remove('skg-show');
      panel.setAttribute('aria-hidden', 'true');
      stopGame();
    }

    launcher.addEventListener('click', function () {
      confirmBox.classList.add('skg-show');
      veil.classList.add('skg-show');
    });

    noButton.addEventListener('click', hideConfirm);

    yesButton.addEventListener('click', function () {
      hideConfirm();
      openPanel();
    });

    veil.addEventListener('click', function () {
      hideConfirm();
      closePanel();
    });

    closeButton.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        hideConfirm();
        closePanel();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', repairGameWidget);
  } else {
    repairGameWidget();
  }
})();
