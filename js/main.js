/* =====================================================================
   Spisovka — drobná vylepšení UI (vanilla JS, žádné knihovny)
   - Plynulý scroll na kotvy řeší CSS (scroll-behavior: smooth).
   - FAQ akordeon je nativní <details>/<summary> (přístupný i bez JS).
   ===================================================================== */
(function () {
  "use strict";

  var CONFIG = window.SPISOVKA_CONFIG || {};

  /* Promítnutí ceny z configu do všech [data-config-price].
     V HTML je výchozí hodnota jako fallback pro případ bez JS. */
  if (CONFIG.PRICE) {
    document.querySelectorAll("[data-config-price]").forEach(function (el) {
      el.textContent = CONFIG.PRICE;
    });
  }
})();
