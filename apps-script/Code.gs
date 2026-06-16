/**
 * Spisovka — sběr leadů do Google Sheetu přes Google Apps Script Web App.
 *
 * Toto je VOLITELNÁ varianta napojení formuláře (varianta A v README).
 * Přijme JSON POST z landing page a zapíše řádek do tabulky.
 *
 * ─────────────────────────────────────────────────────────────────────
 * NASAZENÍ (cca 5 minut):
 *
 * 1. Vytvoř nový Google Sheet. Do prvního řádku dej hlavičky:
 *      timestamp | name | email | phone | school | schoolType | role | gdprConsent | source
 * 2. V tabulce: Rozšíření → Apps Script. Smaž obsah a vlož celý tento soubor.
 * 3. Nahoře v souboru nastav SHEET_ID (z URL tabulky:
 *      https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit ).
 *    Volitelně nastav SHEET_NAME (název listu, výchozí "List1").
 * 4. Nasadit → Nová verze nasazení → typ "Webová aplikace".
 *      - Spustit jako: Já
 *      - Kdo má přístup: Kdokoli  (aby web mohl posílat data)
 *    Zkopíruj vygenerovanou URL (…/exec).
 * 5. Tuto URL vlož do config.js → FORM_ENDPOINT.
 *
 * Pozn.: Apps Script Web App nevrací CORS hlavičky pro preflight, proto
 * frontend posílá "Content-Type: application/json" jako jednoduchý dotaz.
 * Pokud bys narazil na CORS, lze přepnout na text/plain a parsovat tělo zde.
 * ─────────────────────────────────────────────────────────────────────
 */

var SHEET_ID = "TODO-VLOZ-SHEET-ID";
var SHEET_NAME = "List1";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.school || "",
      data.schoolType || "",
      data.role || "",
      data.gdprConsent === true ? "ano" : "ne",
      data.source || "",
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Jednoduchý health-check v prohlížeči (GET na /exec)
function doGet() {
  return json({ ok: true, service: "spisovka-leads" });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
