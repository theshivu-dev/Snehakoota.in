/* =========================================================
   SNEHAKOOTA — HOME PAGE
   ---------------------------------------------------------
   Home-specific JavaScript boundary.

   The road artwork uses one conceptual SVG system, but its
   visible composition is responsive. Desktop keeps the wide
   gateway view; mobile narrows the SVG viewBox around the
   convergence hub so the connection remains intentionally
   visible instead of being cropped like a desktop canvas.
   ========================================================= */
(function(){
  "use strict";

  const paths = document.querySelector(".paths");

  if (!paths) return;

  const mobileQuery = window.matchMedia("(max-width: 700px)");
  const desktopViewBox = "0 0 1200 800";

  /*
     Mobile composition:
     - focuses on the existing convergence hub and mainline
     - preserves the same underlying road paths
     - keeps the hub/mainline inside the narrow phone viewport
       without changing desktop geometry
  */
  const mobileViewBox = "300 0 1000 1200";

  function applyRoadComposition(event){
    const isMobile = event ? event.matches : mobileQuery.matches;

    paths.setAttribute(
      "viewBox",
      isMobile ? mobileViewBox : desktopViewBox
    );
    paths.setAttribute("preserveAspectRatio", "xMidYMid slice");
  }

  applyRoadComposition();

  if (typeof mobileQuery.addEventListener === "function"){
    mobileQuery.addEventListener("change", applyRoadComposition);
  } else {
    mobileQuery.addListener(applyRoadComposition);
  }
})();