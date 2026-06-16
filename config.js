/* =====================================================================
   Spisovka — konfigurace
   Jediné místo, kde se mění "živé" hodnoty. Žádná logika tady není.
   ===================================================================== */

window.SPISOVKA_CONFIG = {

  /* -------------------------------------------------------------------
     KAM SE ODESÍLAJÍ LEADY  ——  zvolena VARIANTA A: Google Sheet
     přes Google Apps Script Web App (návod v apps-script/Code.gs).
     Frontend posílá data POSTem (JSON) na tuto adresu.

     • null  → LOKÁLNÍ MOCK (odeslání se jen zaloguje do konzole) — pro test.
     • "..."  → URL nasazeného Apps Script Web Appu (.../exec).

     Změna cíle = změna jediné hodnoty níže. (Detaily v README.)
  ------------------------------------------------------------------- */
  FORM_ENDPOINT: null, // TODO: vlož sem URL Web Appu z apps-script/Code.gs (viz návod tamtéž)

  /* Cena — placeholder, před spuštěním potvrdit.
     Promítne se do všech prvků s atributem [data-config-price]. */
  PRICE: "10 000 Kč",

  /* Měřená konverzní událost (odeslání formuláře).
     Pushuje se do window.dataLayer, pokud existuje (GTM/GA4). */
  CONVERSION_EVENT: "lead_submit",
};
