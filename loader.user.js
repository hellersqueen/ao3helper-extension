// ==UserScript==
// @name         1 - AO3 Helper (Loader GitHub)
// @namespace    ao3h
// @version      1.0.0
// @description  Charge AO3 Helper depuis le dépôt GitHub (hellersqueen/ao3helper).
// @author       You
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @match        https://archiveofourown.org/*
// @run-at       document-start
// @noframes
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/hellersqueen/ao3helper/main/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/hellersqueen/ao3helper/main/loader.user.js
// @require      https://raw.githubusercontent.com/hellersqueen/ao3helper/main/dist/ao3-helper-tampermonkey.user.js
// ==/UserScript==

(function () {
  'use strict';
  // Rien d'autre ici : le build tout-en-un chargé via @require contient déjà
  // tous les modules inline (aucun fetch à l'exécution, donc pas de résolution
  // SystemJS fragile dans le sandbox Tampermonkey).
})();
