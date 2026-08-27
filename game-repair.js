/* SNEHAKOOTA — surgical mini-game repair
   Restores the single tile-merge module expected by the existing launcher.
   No page/NAV/footer behaviour is changed. */
(function(){
  'use strict';
  window.SKG = window.SKG || {};
  SKG.games = SKG.games || {};

  SKG.games.tileMerge = (function(){
    var WORDS=['ಸ್ನೇಹ','ಬಳಗ','ನಂಟು','ಪಯಣ','ವಿಶ್ವಾಸ','ಒಗ್ಗಟ್ಟು','ಭರವಸೆ','ಸ್ನೇಹಕೂಟ'];
    var SIZE=4, board, gridEl, scoreEl, bestEl, feedbackEl, restartBtn;
    var score=0,best=0,keyHandler,touchStartHandler,touchEndHandler,restartHandler,touchStartX=0,touchStartY=0;

    function emptyCells(){var cells=[];for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++)if(!board[r][c])cells.push([r,c]);return cells;}
    function spawn(){var cells=emptyCells();if(!cells.length)return;var cell=cells[Math.floor(Math.random()*cells.length)];board[cell[0]][cell[1]]=Math.random()<.85?1:2;}
    function fontFor(word){var len=word.length;return len<=3?'.8rem':(len<=5?'.68rem':(len<=7?'.58rem':'.46rem'));}
    function render(){var html='';for(var r=0;r<SIZE;r++){for(var c=0;c<SIZE;c++){var v=board[r][c];if(v){var word=WORDS[v-1];html+='<div class="skg-tm-cell skg-tm-t'+v+'" style="font-size:'+fontFor(word)+'">'+word+'</div>';}else html+='<div class="skg-tm-cell"></div>';}}gridEl.innerHTML=html;scoreEl.textContent=score;}
    function slideRow(row){var arr=row.filter(function(v){return v;});var merged=[],gained=0;for(var i=0;i<arr.length;i++){if(i<arr.length-1&&arr[i]===arr[i+1]&&arr[i]<WORDS.length){var nv=arr[i]+1;merged.push(nv);gained+=nv;i++;if(nv===WORDS.length){feedbackEl.textContent='ಗೆದ್ದಿರಿ! 🎉 '+WORDS[nv-1];feedbackEl.className='skg-feedback';}}else merged.push(arr[i]);}while(merged.length<SIZE)merged.push(0);return{row:merged,gained:gained,moved:JSON.stringify(row)!==JSON.stringify(merged)};}
    function transpose(b){var nb=[];for(var c=0;c<SIZE;c++){var row=[];for(var r=0;r<SIZE;r++)row.push(b[r][c]);nb.push(row);}return nb;}
    function hasMoves(){for(var r=0;r<SIZE;r++){for(var c=0;c<SIZE;c++){var v=board[r][c];if(!v)return true;if(c<SIZE-1&&board[r][c+1]===v)return true;if(r<SIZE-1&&board[r+1][c]===v)return true;}}return false;}
    function restart(){score=0;board=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];feedbackEl.textContent='';feedbackEl.className='skg-feedback';restartBtn.style.display='none';spawn();spawn();render();}
    function move(dir){var moved=false,gained=0,vertical=dir==='up'||dir==='down',reverseNeeded=dir==='right'||dir==='down',b=vertical?transpose(board):board.map(function(row){return row.slice();}),newBoard=[];for(var r=0;r<SIZE;r++){var row=b[r].slice();if(reverseNeeded)row.reverse();var res=slideRow(row);if(reverseNeeded)res.row.reverse();newBoard.push(res.row);if(res.moved)moved=true;gained+=res.gained;}board=vertical?transpose(newBoard):newBoard;if(moved){score+=gained;if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('skg_merge_best',String(best));}catch(e){}}spawn();render();if(!emptyCells().length&&!hasMoves()){feedbackEl.textContent='ಆಟ ಮುಗಿಯಿತು';feedbackEl.className='skg-feedback skg-miss';restartBtn.style.display='block';}}}

    return {
      title:'🔀 ಪದ ಸೇರಿಸಿ',
      init:function(container){
        try{best=parseInt(localStorage.getItem('skg_merge_best')||'0',10)||0;}catch(e){best=0;}
        score=0;board=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        container.innerHTML='<div class="skg-scores">ಸ್ಕೋರ್ <b id="skgTmScore">0</b> &nbsp; ಬೆಸ್ಟ್ <b id="skgTmBest">'+best+'</b></div><div class="skg-tm-grid" id="skgTmGrid"></div><div class="skg-feedback" id="skgTmFeedback"></div><button class="skg-tm-restart" id="skgTmRestart" style="display:none;">ಮತ್ತೆ ಆಡಿ ↺</button><div class="skg-tm-hint">ಸ್ವೈಪ್ ಮಾಡಿ ಅಥವಾ ಬಾಣದ ಕೀ ಒತ್ತಿ</div>';
        gridEl=container.querySelector('#skgTmGrid');scoreEl=container.querySelector('#skgTmScore');bestEl=container.querySelector('#skgTmBest');feedbackEl=container.querySelector('#skgTmFeedback');restartBtn=container.querySelector('#skgTmRestart');spawn();spawn();render();
        keyHandler=function(e){var map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(map[e.key]){e.preventDefault();move(map[e.key]);}};document.addEventListener('keydown',keyHandler);
        touchStartHandler=function(e){var t=e.touches[0];touchStartX=t.clientX;touchStartY=t.clientY;};
        touchEndHandler=function(e){var t=e.changedTouches[0],dx=t.clientX-touchStartX,dy=t.clientY-touchStartY;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;if(Math.abs(dx)>Math.abs(dy))move(dx>0?'right':'left');else move(dy>0?'down':'up');};
        gridEl.addEventListener('touchstart',touchStartHandler,{passive:true});gridEl.addEventListener('touchend',touchEndHandler,{passive:true});restartHandler=function(){restart();};restartBtn.addEventListener('click',restartHandler);
      },
      destroy:function(){if(keyHandler)document.removeEventListener('keydown',keyHandler);if(gridEl){if(touchStartHandler)gridEl.removeEventListener('touchstart',touchStartHandler);if(touchEndHandler)gridEl.removeEventListener('touchend',touchEndHandler);}if(restartBtn&&restartHandler)restartBtn.removeEventListener('click',restartHandler);gridEl=scoreEl=bestEl=feedbackEl=restartBtn=null;}
    };
  })();

  /* The existing Index launcher is already wired to SKG.games.tileMerge.
     Only restore its Kannada-facing text here. */
  function restoreKannada(){
    var title=document.querySelector('.skg-confirm-title');
    var text=document.querySelector('.skg-confirm-text');
    var noBtn=document.getElementById('skgNo');
    var yesBtn=document.getElementById('skgYes');
    if(title) title.textContent='ಸ್ವಲ್ಪ ಆಟ ಆಡೋಣವಾ?';
    if(text){text.textContent='';text.style.display='none';}
    if(noBtn) noBtn.textContent='ಬೇಡ';
    if(yesBtn) yesBtn.textContent='ಹೌದು ▶';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreKannada);else restoreKannada();
})();
