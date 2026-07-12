// ==UserScript==
// @name         AO3 Helper minimal
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @author       You
// @description  Enhanced AO3 experience with modern UI and features
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @match        https://archiveofourown.org/*
// @connect      127.0.0.1
// @connect      localhost
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @noframes
// ==/UserScript==

(function(){"use strict";function e(e,t,n,r,i,a,o){try{var s=e[a](o),c=s.value}catch(e){n(e);return}s.done?t(c):Promise.resolve(c).then(r,i)}function t(t){return function(){var n=this,r=arguments;return new Promise(function(i,a){var o=t.apply(n,r);function s(t){e(o,i,a,s,c,`next`,t)}function c(t){e(o,i,a,s,c,`throw`,t)}s(void 0)})}}var n=e=>`ao3h:${e}`,r={key:n,get:function(){var e=t(function*(e,t=null){try{return yield GM_getValue(n(e),t)}catch{return t}});return function(t){return e.apply(this,arguments)}}(),set:function(){var e=t(function*(e,t){try{GM_setValue(n(e),t)}catch(e){console.error(`[AO3H] GM_setValue failed`,e)}return t});return function(t,n){return e.apply(this,arguments)}}(),del:function(){var e=t(function*(e){try{GM_deleteValue(n(e))}catch(e){console.error(`[AO3H] GM_deleteValue failed`,e)}});return function(t){return e.apply(this,arguments)}}(),lsGet:(e,t=null)=>{try{let r=localStorage.getItem(n(e));return r==null?t:JSON.parse(r)}catch{return t}},lsSet:(e,t)=>{try{localStorage.setItem(n(e),JSON.stringify(t))}catch(e){console.error(`[AO3H] ls set failed`,e)}return t},lsDel:e=>{try{localStorage.removeItem(n(e))}catch(e){console.error(`[AO3H] ls del failed`,e)}},lsGetRaw:(e,t=null)=>{try{let n=localStorage.getItem(e);return n==null?t:JSON.parse(n)}catch{return t}},lsSetRaw:(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch(e){console.error(`[AO3H] ls set failed`,e)}return t},lsDelRaw:e=>{try{localStorage.removeItem(e)}catch(e){console.error(`[AO3H] ls del failed`,e)}}},i=(()=>{let e=new Map;function t(t,n){e.has(t)||e.set(t,new Set),e.get(t).add(n)}function n(t,n){let r=e.get(t);r&&r.delete(n)}function r(t,n){let r=e.get(t);if(r)for(let e of r)try{e(n)}catch(e){console.error(`[AO3H] Bus handler`,e)}}function i(e,t,n=document){let i=e=>{r(t,e.detail||e.originalEvent?.detail||{})};if(typeof n==`string`){let t=window.jQuery===void 0?window.$j===void 0?null:window.$j:window.jQuery;t?t(document).on(e,n,i):document.addEventListener(e,i)}else n.addEventListener(e,i)}function a(e,r=5e3){return new Promise(i=>{let a=!1,o=t=>{a||(a=!0,n(e,o),i(t))};t(e,o),r>0&&setTimeout(()=>{a||(a=!0,n(e,o),i(null))},r)})}return{on:t,off:n,emit:r,bridge:i,once:a}})();function a(e){"@babel/helpers - typeof";return a=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},a(e)}function o(e,t){if(a(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(a(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function s(e){var t=o(e,`string`);return a(t)==`symbol`?t:t+``}function c(e,t,n){return(t=s(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?l(Object(n),!0).forEach(function(t){c(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var d=(()=>{let e=`flags`,n=null,i=new Map;function a(){return n||(n=r.lsGet(e,null),n)}function o(){return s.apply(this,arguments)}function s(){return s=t(function*(t={}){let i=yield r.get(e,{});n=Object.assign({},t,i),yield r.set(e,n),r.lsSet(e,n),console.log(`[AO3H] Flags initialized`,n)}),s.apply(this,arguments)}function c(){return n||a()||{}}function l(e,t=null){let n=c();return e in n?n[e]:t}function u(e,t){return d.apply(this,arguments)}function d(){return d=t(function*(t,n){let a=c();if(a[t]===n)return n;a[t]=n,yield r.set(e,a),r.lsSet(e,a);let o=i.get(t);if(o)for(let e of o)try{e(n)}catch(e){console.error(`[AO3H] flag watcher`,e)}return n}),d.apply(this,arguments)}function f(e,t){return i.has(e)||i.set(e,new Set),i.get(e).add(t),()=>i.get(e)?.delete(t)}function p(e,t=!1){return u(e,!l(e,t))}return{init:o,getAll:c,get:l,set:u,watch:f,toggle:p}})(),f=(()=>{let e=e=>`mod:${e}:settings`,n=new Map;return{define(a){return t(function*(t,a={}){n.set(t,u({},a));let o=yield r.get(e(t),null);if(!o||typeof o!=`object`){o=u({},a),yield r.set(e(t),o),r.lsSet(e(t),o);try{i.emit(`settings:changed`,{module:t,value:o})}catch{}return o}let s=!1;for(let[e,t]of Object.entries(a))e in o||(o[e]=t,s=!0);if(s){yield r.set(e(t),o),r.lsSet(e(t),o);try{i.emit(`settings:changed`,{module:t,value:o})}catch{}}return o}).apply(this,arguments)},get(i){return t(function*(){let t=yield r.get(e(i),null);return t&&typeof t==`object`?(r.lsSet(e(i),t),t):u({},n.get(i)||{})})()},set(n){var a=this;return t(function*(t,n={}){let o=yield a.get(t),s=Object.assign({},o,n);yield r.set(e(t),s),r.lsSet(e(t),s);try{i.emit(`settings:changed`,{module:t,value:s})}catch{}return s}).apply(this,arguments)},reset(a){return t(function*(){yield r.del(e(a)),r.lsDel(e(a));let t=n.get(a)||{};yield r.set(e(a),u({},t)),r.lsSet(e(a),u({},t));try{i.emit(`settings:changed`,{module:a,value:u({},t)})}catch{}return u({},t)})()},watch(e,t){let n=n=>{if(n&&n.module===e)try{t(n.value)}catch(e){console.error(e)}};return i.on(`settings:changed`,n),()=>i.off(`settings:changed`,n)}}})();function p(){return typeof unsafeWindow<`u`?unsafeWindow:window}function m(){let e=p();return e.jQuery!==void 0||e.$j!==void 0||e.$!==void 0&&e.$.fn&&e.$.fn.jquery}function h(){let e=p();return e.$j===void 0?e.jQuery===void 0?e.$!==void 0&&e.$.fn&&e.$.fn.jquery?e.$:null:e.jQuery:e.$j}function g(){let e=h();return e&&e.rails!==void 0}function _(){let e=p();return document.readyState===`complete`&&m()&&(e.__AO3H_CSRF_READY__||document.querySelector(`meta[name="csrf-token"]`))}var v={SILENT:0,ERROR:1,WARN:2,INFO:3,DEBUG:4},ee={level:v.INFO,debug:!1,productionMode:!1,prefix:`[AO3H]`,timestamp:!1,groupSimilar:!0},y=new class{constructor(e={}){this.config=u(u({},ee),e),this.lastMessage=null,this.repeatCount=0,this.timers=new Map}configure(e){this.config=u(u({},this.config),e)}getConfig(){return u({},this.config)}_formatMessage(e,t,n){let r=[];if(this.config.prefix&&r.push(this.config.prefix),this.config.timestamp){let e=new Date().toISOString().substr(11,12);r.push(`[${e}]`)}let i={error:`[X]`,warn:`[!]`,info:``,debug:`[D]`};return i[e]&&r.push(i[e]),t&&r.push(`[${t}]`),r.length>0?[r.join(` `),...n]:n}_shouldGroup(e){if(!this.config.groupSimilar)return!1;let t=Array.isArray(e)?e.join(` `):String(e);return this.lastMessage===t?(this.repeatCount++,!0):(this.repeatCount>0&&(console.log(`${this.config.prefix} (previous message repeated ${this.repeatCount} times)`),this.repeatCount=0),this.lastMessage=t,!1)}_log(e,t,n,r){if(this.config.productionMode&&t>v.WARN||t>this.config.level||e===`debug`&&!this.config.debug)return;let i=this._formatMessage(e,n,r);this._shouldGroup(i)||({error:console.error,warn:console.warn,info:console.log,debug:console.log}[e]||console.log).apply(console,i)}error(...e){this._log(`error`,v.ERROR,null,e)}warn(...e){this._log(`warn`,v.WARN,null,e)}info(...e){this._log(`info`,v.INFO,null,e)}debug(...e){this._log(`debug`,v.DEBUG,null,e)}context(e){return{error:(...t)=>this._log(`error`,v.ERROR,e,t),warn:(...t)=>this._log(`warn`,v.WARN,e,t),info:(...t)=>this._log(`info`,v.INFO,e,t),debug:(...t)=>this._log(`debug`,v.DEBUG,e,t),log:(...t)=>this._log(`info`,v.INFO,e,t),err:(...t)=>this._log(`error`,v.ERROR,e,t),dbg:(...t)=>this._log(`debug`,v.DEBUG,e,t)}}time(e){this.timers.set(e,performance.now())}timeEnd(e,t=null){if(!this.timers.has(e)){this.warn(`Timer not found:`,e);return}let n=this.timers.get(e),r=performance.now()-n;this.timers.delete(e),this._log(`info`,v.INFO,t,[`Timer ${e}:`,`${r.toFixed(2)}ms`])}log(e,...t){let n={error:v.ERROR,warn:v.WARN,info:v.INFO,debug:v.DEBUG}[e]||v.INFO;this._log(e,n,null,t)}guard(e,n=``,r=null){var i=this;return t(function*(...t){try{return yield e(...t)}catch(e){i._log(`error`,v.ERROR,r,[`Guard error`,n,e]);return}})}};try{let e=p().AO3H||{};e.env&&y.configure({debug:!!e.env.DEBUG,level:e.env.DEBUG?v.DEBUG:v.INFO})}catch{}function b(e=null){return e?y.context(e):{error:y.error.bind(y),warn:y.warn.bind(y),info:y.info.bind(y),debug:y.debug.bind(y),log:y.info.bind(y),err:y.error.bind(y),dbg:y.debug.bind(y)}}function x(e){y.configure(e)}function S({fallbackKey:e=`AO3H:fallback_username`,cachePrefix:t=null}={}){var n;let r=localStorage.getItem(e);if(r)return console.log(`[AO3H][user-detector] ✓ Using manual username:`,r),r;let i=document.querySelector(`a[href^="/users/"]`),a=i==null||(n=i.getAttribute(`href`))==null?void 0:n.match(/^\/users\/([^\/?#]+)/);if(a&&a[1])return console.log(`[AO3H][user-detector] ✓ Username detected from DOM:`,a[1]),a[1];if(t)for(let e=0;e<localStorage.length;e++){let n=localStorage.key(e);if(n!=null&&n.startsWith(t)){let e=n.match(RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}:([^:]+):`));if(e!=null&&e[1])return console.log(`[AO3H][user-detector] ✓ Username recovered from cache keys:`,e[1]),e[1]}}return console.warn(`[AO3H][user-detector] ⚠️ Could not detect username automatically`),console.info(`[AO3H][user-detector] → To set manually: localStorage.setItem('${e}', 'YourAO3Username')`),null}function te(){let e=S();return e?e.toLowerCase():`guest`}var C=te();if(typeof document<`u`&&C===`guest`){let e=()=>{let e=te();e!==`guest`&&e!==C&&(C=e,T!==void 0&&(T.id=e),console.log(`[AO3H] User re-detected after DOM ready:`,e))};document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,e):setTimeout(e,100)}function w(e){return`ao3h.${C}.${e}`}var T={id:C,key(e){return w(e)},get(e,n){return t(function*(){return r?r.get(w(e),n):n})()},set(e,n){return t(function*(){if(r)return r.set(w(e),n)})()},remove(e){return t(function*(){if(r)return r.del(w(e))})()},migrateFromGlobal(e){return t(function*(){if(!(!r||!e||typeof e!=`object`))for(let[t,n]of Object.entries(e)){let e=w(t);if((yield r.get(e))!=null)continue;let i=yield r.get(n);i!=null&&(yield r.set(e,i))}})()}};function ne(e){return e&&{get:function(){var e=t(function*(e,t){return T.get(e,t)});return function(t,n){return e.apply(this,arguments)}}(),set:function(){var e=t(function*(e,t){return T.set(e,t)});return function(t,n){return e.apply(this,arguments)}}(),del:function(){var e=t(function*(e){return T.remove(e)});return function(t){return e.apply(this,arguments)}}(),remove:function(){var e=t(function*(e){return T.remove(e)});return function(t){return e.apply(this,arguments)}}(),key:e.key,lsGet:e.lsGet,lsSet:e.lsSet,lsDel:e.lsDel,lsGetRaw:e.lsGetRaw,lsSetRaw:e.lsSetRaw,lsDelRaw:e.lsDelRaw}}var E={getItem(e){try{return localStorage.getItem(w(e))}catch(e){return console.error(`[UserStorage] getItem failed:`,e),null}},setItem(e,t){try{localStorage.setItem(w(e),t)}catch(e){console.error(`[UserStorage] setItem failed:`,e)}},removeItem(e){try{localStorage.removeItem(w(e))}catch(e){console.error(`[UserStorage] removeItem failed:`,e)}},hasItem(e){return this.getItem(e)!==null},getJSON(e,t=null){try{let n=this.getItem(e);return n===null?t:JSON.parse(n)}catch(e){return console.error(`[UserStorage] getJSON failed:`,e),t}},setJSON(e,t){try{this.setItem(e,JSON.stringify(t))}catch(e){console.error(`[UserStorage] setJSON failed:`,e)}}},D={href:()=>location.href,path:()=>location.pathname,isWork:()=>/^\/works\/\d+(?:\/chapters\/\d+)?$/.test(location.pathname),isWorkShow:()=>/^\/works\/\d+$/.test(location.pathname),isChapter:()=>/^\/works\/\d+\/chapters\/\d+$/.test(location.pathname),isTagWorks:()=>/^\/tags\/[^/]+\/works/.test(location.pathname),isSearch:()=>/^\/works$/.test(location.pathname)&&(new URLSearchParams(location.search).has(`work_search[query]`)||location.search.includes(`tag_id`)),isBookmarks:()=>/^\/users\/[^/]+\/bookmarks/.test(location.pathname),isListRoute:()=>D.isSearch()||D.isTagWorks()||D.isBookmarks()||/\/works$/.test(location.pathname)||/\/pseuds\/[^/]+\/works$/.test(location.pathname)};try{let e=typeof unsafeWindow<`u`?unsafeWindow:window;e.__AO3H_ROUTE_FLAGS__=e.__AO3H_ROUTE_FLAGS__||{};let t=location.pathname,n=/^\/users\/[^/]+\/kudos-history(?:\/|$)/.test(t);e.__AO3H_ROUTE_FLAGS__.isKudosHistory=!!n,n&&console.log(`[AO3H] Kudos History detected — core will init; modules should self-guard.`)}catch(e){console.warn(`[AO3H] route flag init failed:`,e)}var O=p(),re=`ao3h`,ie=`1.2.3`,ae=!1,oe=!1,k=b(`core`);function se(e){return ce.apply(this,arguments)}function ce(){return ce=t(function*(e,t=``){try{return yield e()}catch(e){k.error(`guard error`,t,e);try{i.emit(`error`,{label:t,error:e})}catch{}return}}),ce.apply(this,arguments)}function le(e){return String(e||``).trim().toLowerCase().replace(/[^a-z0-9]+/g,``)}var A=(()=>{let e=new Map;function n(e){return typeof e==`function`?e:e&&typeof e.dispose==`function`?()=>e.dispose():null}function r(e){return{canonical:`mod:${e}:enabled`,alt:`mod:${le(e)}:enabled`}}function a(e){var t;return!!d.get(e.enabledKey,!!((t=e.meta)!=null&&t.enabledByDefault))||!!d.get(e.enabledKeyAlt,!1)}function o(e){return s.apply(this,arguments)}function s(){return s=t(function*(r){var s;let c=e.get(r);if(!c||c._booted)return!1;if((s=c.meta)!=null&&s.parent){let t=e.get(c.meta.parent);if(!t||!t._booted)return!1}return yield se(t(function*(){k.info(`Boot ${r}`),k.info(`Boot ${r} - has init:`,!!c.init,`type:`,typeof c.init);let t=yield c.init?.call(c);k.info(`Boot ${r} - init returned:`,typeof t),c._dispose=n(t),c._booted=!0,i.emit(`module:started`,{name:r});for(let[t,n]of e)n.meta?.parent===r&&!n._booted&&a(n)&&(yield o(t));return!0}),`init:${r}`)}),s.apply(this,arguments)}function c(e){return l.apply(this,arguments)}function l(){return l=t(function*(n){let r=e.get(n);return!r||!r._booted?!1:yield se(t(function*(){for(let[t,r]of e)r.meta?.parent===n&&r._booted&&(yield c(t));k.info(`Stop ${n}`);try{var t;(t=r._dispose)==null||t.call(r)}catch(e){k.error(`dispose failed`,e)}return r._dispose=null,r._booted=!1,i.emit(`module:stopped`,{name:n}),!0}),`stop:${n}`)}),l.apply(this,arguments)}function f(e){return p.apply(this,arguments)}function p(){return p=t(function*(t){var n;let r=e.get(t);if(!r)return;if((n=r.meta)!=null&&n.parent){let n=e.get(r.meta.parent);if(!(n!=null&&n._booted)){r._booted&&(yield c(t));return}}let i=a(r);i&&!r._booted?yield o(t):!i&&r._booted&&(yield c(t))}),p.apply(this,arguments)}function m(t,n,i){let{canonical:a,alt:o}=r(t),s=e.get(t),c={meta:n||s?.meta||{},init:i||s?.init,enabledKey:a,enabledKeyAlt:o,_booted:!1,_dispose:null};e.set(t,c),d.watch(a,()=>{f(t)}),o!==a&&d.watch(o,()=>{f(t)});try{var l;if(typeof((l=O.AO3H)==null||(l=l.moduleLoader)==null?void 0:l.handleLateRegistration)==`function`)O.AO3H.moduleLoader.handleLateRegistration(t);else{var u;typeof((u=O.AO3H)==null||(u=u.menu)==null?void 0:u.rebuild)==`function`&&O.AO3H.menu.rebuild()}}catch(e){k.debug(`Late registration handler not available:`,e)}}function h(){return g.apply(this,arguments)}function g(){return g=t(function*(){for(let[n,r]of e){var t;(t=r.meta)!=null&&t.parent||a(r)&&(yield o(n))}}),g.apply(this,arguments)}function _(){return v.apply(this,arguments)}function v(){return v=t(function*(){for(let[t]of e)yield c(t)}),v.apply(this,arguments)}function ee(e,t){return y.apply(this,arguments)}function y(){return y=t(function*(t,n){let r=e.get(t);r&&(yield d.set(r.enabledKey,!!n),r.enabledKeyAlt!==r.enabledKey&&(yield d.set(r.enabledKeyAlt,!!n)))}),y.apply(this,arguments)}function b(e,t){return x.apply(this,arguments)}function x(){return x=t(function*(t,n){for(let[r,i]of e)if(i.enabledKey===t||i.enabledKeyAlt===t){yield ee(r,!!n);break}}),x.apply(this,arguments)}function S(){return Array.from(e.entries()).map(([e,t])=>u({name:e},t))}function te(t){return Array.from(e.entries()).filter(([e,n])=>n.meta?.parent===t).map(([e,t])=>u({name:e},t))}function C(e){return w.apply(this,arguments)}function w(){return w=t(function*(t){let n=e.get(t);if(n){try{let e=localStorage.getItem(`ao3h:mod:${t}:settings`);e&&(O.AO3H_Config=O.AO3H_Config||{},O.AO3H_Config[t]=O.AO3H_Config[t]||{},O.AO3H_Config[t].defaults=Object.assign(O.AO3H_Config[t].defaults||{},JSON.parse(e)))}catch(e){k.warn(`restartOne: failed to refresh config for`,t,e)}n._booted&&(yield c(t)),a(n)&&(yield o(t))}}),w.apply(this,arguments)}return{register:m,all:S,getChildren:te,bootAll:h,stopAll:_,setEnabled:ee,onFlagChanged:b,restartOne:C,_bootOne:o,_stopOne:c,_list:e}})(),j=null,M=null;function ue(){if(j&&document.contains(j))return{button:j,container:M};let e=document.querySelector(`li.${re}-root`);if(e)return M=e,j=e.querySelector(`.${re}-navlink`),{button:j,container:M};M=document.createElement(`li`),M.className=`dropdown ${re}-root`,M.setAttribute(`aria-haspopup`,`true`),M.tabIndex=0,j=document.createElement(`span`),j.className=`${re}-navlink`,j.textContent=`AO3 Helper`,j.setAttribute(`aria-hidden`,`true`),j.setAttribute(`aria-expanded`,`false`),j.style.pointerEvents=`auto`,M.appendChild(j);let t=document.querySelector(`ul.primary.navigation.actions`)||document.querySelector(`#header .primary.navigation ul`)||document.querySelector(`#header .navigation ul`);if(t)t.insertBefore(M,t.firstChild);else{let e=document.createElement(`div`);e.style.cssText=`position:fixed;right:14px;bottom:14px;z-index:999999;`,e.appendChild(M),(document.body||document.documentElement).appendChild(e)}return k.info(`Navigation button created`),{button:j,container:M}}function de(e){document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,e,{once:!0}):e()}var fe=ne(r),pe={env:{NS:re,VERSION:ie,DEBUG:ae,PRODUCTION_MODE:oe},get util(){return u(u({},window.AO3H_Common),{},{log:k,guard:se,onReady:de})},store:fe,user:T,routes:D,bus:i,flags:d,errorHandler:null,modules:A,settings:f,createNavigationButton:ue,ao3:{get waitForReady(){return window.AO3H_Common?.waitForAO3Ready},get getJQuery(){return window.AO3H_Common?.getJQuery},get liveQuery(){return window.AO3H_Common?.liveQuery},get hasRailsUJS(){return window.AO3H_Common?.hasRailsUJS},get validateForm(){return window.AO3H_Common?.validateForm},get showModal(){return window.AO3H_Common?.showModal},get hideModal(){return window.AO3H_Common?.hideModal}},menu:{addToggle:()=>{},addAction:()=>{},addSeparator:()=>{},rebuild:()=>{}}},N=O.AO3H?Object.assign(O.AO3H,pe):O.AO3H=pe;try{typeof window<`u`&&window!==O&&(window.AO3H=O.AO3H)}catch{}N.register||=function(e,n){let r=[];if(typeof e==`string`)r.push(u({id:e},n||{}));else if(e&&typeof e==`object`&&!n)if(e.id)r.push(e);else for(let[t,n]of Object.entries(e))n&&typeof n==`object`&&r.push(u({id:t},n));else return;for(let e of r){let n=e.id,r=typeof e.title==`string`&&e.title.trim()?e.title.trim():n;A.register(n,{title:r,enabledByDefault:!0},function(){var r=t(function*(){try{var t;(t=e.onFlagsUpdated)==null||t.call(e,{enabled:!0})}catch{}let r;try{r=yield e.init?.call(e,{enabled:!0})}catch(e){k.error(`legacy init failed`,n,e)}let i=typeof r==`function`?r:r&&typeof r.dispose==`function`?()=>r.dispose():typeof e.dispose==`function`?()=>e.dispose():null;return()=>{try{var t;(t=e.onFlagsUpdated)==null||t.call(e,{enabled:!1})}catch{}try{i?.()}catch(e){k.error(`legacy dispose failed`,n,e)}}});function i(){return r.apply(this,arguments)}return i}());let i=`mod:${n}:enabled`,a=`mod:${String(n).toLowerCase().replace(/[^a-z0-9]+/g,``)}:enabled`;d.watch(i,t=>{try{var n;(n=e.onFlagsUpdated)==null||n.call(e,{enabled:!!t})}catch{}}),a!==i&&d.watch(a,t=>{try{var n;(n=e.onFlagsUpdated)==null||n.call(e,{enabled:!!t})}catch{}})}};var me={"ui:showMenuButton":!1};(function(){var e=t(function*(){yield d.init(me),x({debug:ae,productionMode:oe}),k.info(`Core ready`,ie),k.info(`Per-user storage active for: ${T.id}`),i.emit(`core:ready`,{version:ie}),i.bridge&&(function(){var e=t(function*(){var e;let t=window.jQuery||window.$j||window.$;if((!t||!((e=t.fn)!=null&&e.jquery))&&(t=yield new Promise(e=>{let t=setInterval(()=>{var n;let r=window.jQuery||window.$j||(window.$&&(n=window.$.fn)!=null&&n.jquery?window.$:null);r&&(clearInterval(t),e(r))},100);setTimeout(()=>{clearInterval(t),e(null)},3e3)})),!t){k.debug(`jQuery not available, event bridging skipped (menu functionality unaffected)`);return}k.debug(`jQuery available, setting up event bridging`);try{t(document).on(`loadedCSRF`,()=>{i.emit(`ao3:csrf-ready`),O.__AO3H_CSRF_READY__=!0,k.info(`CSRF token ready`)})}catch(e){k.warn(`Failed to bridge CSRF event:`,e)}if(g()!==!1)try{t(document).on(`ajax:before`,e=>{i.emit(`ao3:ajax-before`,e.target)}),t(document).on(`ajax:success`,(e,t)=>{i.emit(`ao3:ajax-success`,{target:e.target,data:t})}),t(document).on(`ajax:error`,(e,t)=>{i.emit(`ao3:ajax-error`,{target:e.target,xhr:t})}),t(document).on(`ajax:complete`,(e,t)=>{i.emit(`ao3:ajax-complete`,{target:e.target,xhr:t})}),k.info(`Rails UJS events bridged`)}catch(e){k.warn(`Failed to bridge Rails UJS events:`,e)}});return function(){return e.apply(this,arguments)}})()().catch(e=>k.error(`Event bridging failed:`,e)),de(()=>{var e;(e=O.__AO3H_ROUTE_FLAGS__)!=null&&e.isKudosHistory||ue()})});function n(){return e.apply(this,arguments)}return n})()();var{register:he,bootAll:ge,stopAll:_e,setEnabled:ve,all:ye,getChildren:be,restartOne:xe}=A,Se=p();function Ce(){we()}function we(){let e=N,n=e.env?.NS||`ao3h`,r=b(`coordinator`);function i(){let e=document.getElementById(`${n}-ie-dialog`);if(!e){e=document.createElement(`dialog`),e.id=`${n}-ie-dialog`,e.innerHTML=`
        <form method="dialog" style="margin:0">
          <h3 id="${n}-ie-title">Hidden works</h3>
          <p id="${n}-ie-desc"></p>
          <div id="${n}-ie-row">
            <button type="button" id="${n}-ie-export">Export JSON</button>
            <button type="button" id="${n}-ie-import">Import JSON</button>
            <button type="button" id="${n}-ie-try" style="display:none">Try enable module</button>
          </div>
          <div id="${n}-ie-foot"><button id="${n}-ie-cancel">Close</button></div>
        </form>`,(document.body||document.documentElement).appendChild(e);let r=e=>document.getElementById(e),a=r(`${n}-ie-export`),o=r(`${n}-ie-import`),s=r(`${n}-ie-try`),c=r(`${n}-ie-cancel`);a?.addEventListener(`click`,()=>{if(typeof Se.ao3hExportHiddenWorks==`function`)try{Se.ao3hExportHiddenWorks()}finally{e.close()}}),o?.addEventListener(`click`,()=>{if(typeof Se.ao3hImportHiddenWorks==`function`)try{Se.ao3hImportHiddenWorks()}finally{e.close()}}),s?.addEventListener(`click`,t(function*(){try{let e=(A&&A.all?A.all():[]).find(e=>{var t;return/hidden/i.test((e==null||(t=e.meta)==null?void 0:t.title)||e?.name||``)});if(!e){alert(`No module matching "hidden" was found in AO3H.modules.`);return}yield A.setEnabled(e.name,!0),i(),alert(`Enabled: ${e.meta?.title||e.name}`)}catch(e){console.error(`[AO3H] enable hidden module failed`,e),alert(`Failed to enable module. See console for details.`)}})),c?.addEventListener(`click`,()=>e.close()),e.addEventListener(`click`,t=>{let n=e.getBoundingClientRect();t.clientX>=n.left&&t.clientX<=n.right&&t.clientY>=n.top&&t.clientY<=n.bottom||e.close()})}let r=typeof Se.ao3hExportHiddenWorks==`function`,a=typeof Se.ao3hImportHiddenWorks==`function`,o=document.getElementById(`${n}-ie-desc`);o.textContent=r||a?`Choose what you want to do with your hidden-works list.`:`The Hidden works module is not loaded on this page. Actions enable once the module loads.`;let s=document.getElementById(`${n}-ie-export`),c=document.getElementById(`${n}-ie-import`),l=document.getElementById(`${n}-ie-try`);return s&&(s.disabled=!r),c&&(c.disabled=!a),l&&(l.style.display=r||a?`none`:`inline-block`),!0}function a(){i();let e=document.getElementById(`${n}-ie-dialog`);try{e.showModal()}catch{e.setAttribute(`open`,``)}}function o(){return[{label:`Hidden tags…`,hint:``,handler:()=>{document.dispatchEvent(new CustomEvent(`${n}:open-hide-manager`))}},{label:`Hidden works…`,hint:`Import / Export`,handler:()=>{a()}},{label:`Text Replacer…`,hint:``,handler:()=>{document.dispatchEvent(new CustomEvent(`${n}:open-textreplacer-manager`))}}]}function s(){return o()}e.manage={openHiddenWorksDialog:a,getManageActions:s,ensureHiddenWorksDialog:i},Se.ao3hOpenHiddenWorksDialog=a;function c(){let n=new Map;document.addEventListener(`ao3h:settingsChanged`,function(i){let a=i.detail?.moduleId;a&&(clearTimeout(n.get(a)),n.set(a,setTimeout(t(function*(){n.delete(a);let t=e.modules;typeof t?.restartOne==`function`&&(r.info(`Live-update restart:`,a),yield t.restartOne(a))}),300)))}),r.info(`✅ Live settings-change listener active`)}c()}var Te=e=>document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,e,{once:!0}):e(),P=(e,t,n,r)=>e&&e.addEventListener(t,n,r),Ee=(e,t=200)=>{let n;return(...r)=>{clearTimeout(n),n=setTimeout(()=>e(...r),t)}};function De(e,t,n){let r=document.documentElement,i={childList:!0,subtree:!0},a;typeof e==`function`?a=e:(e&&(r=e),typeof t==`function`?a=t:(t&&(i=t),a=n)),typeof a!=`function`&&(console.warn(`[AO3H] observe(): missing callback`),a=()=>{});let o=new MutationObserver(a);return o.observe(r,i),o}var Oe=new Set,ke=new Map;function F(e,...t){let n=``,r=`block-${Oe.size}`;if(Array.isArray(e)&&Object.prototype.hasOwnProperty.call(e,`raw`)){let r=e,i=t;n=r.map((e,t)=>e+(t<i.length?i[t]:``)).join(``)}else n=String(e??``),typeof t[0]==`string`&&(r=t[0]);if(Oe.has(r))return()=>{};Oe.add(r);let i;try{i=GM_addStyle(n)}catch{i=document.createElement(`style`),i.textContent=n,(document.head||document.documentElement).appendChild(i)}let a=!1;return function(){if(!a){a=!0,Oe.delete(r);try{var e;i==null||(e=i.remove)==null||e.call(i)}catch{}}}}F.scoped=function(e,t,...n){return t===void 0?(t,...n)=>F._addScoped(e,t,...n):F._addScoped(e,t,...n)},F._addScoped=function(e,t,...n){let r=F(t,...n);return ke.has(e)||ke.set(e,new Set),ke.get(e).add(r),r},F.removeAll=function(e){let t=ke.get(e);if(t){for(let e of t)e();ke.delete(e)}};try{i.on(`module:stopped`,({name:e})=>F.removeAll(e))}catch{}F(`.ao3h-skipworks-entry .ao3h-module-list-entry-title a{color:#888}.ao3h-skipworks-note{color:#fff;background:#888}.ao3h-skipworks-note--truncated{cursor:pointer}.ao3h-skipworks-entry--note-open{align-items:flex-start}.ao3h-skipworks-entry--note-open .ao3h-module-list-entry-badge{white-space:normal;text-overflow:unset;max-width:260px;line-height:1.5;overflow:visible}.ao3h-skipworks-two-col{grid-template-columns:1fr 1fr;align-items:start;gap:16px;display:grid}.ao3h-skipworks-col{min-width:0}.ao3h-skipworks-preset-add-row{align-items:center;gap:6px;margin-bottom:8px;display:flex}.ao3h-skipworks-preset-input{flex:1;min-width:0}.ao3h-skipworks-presets{flex-wrap:wrap;align-items:center;gap:6px;min-height:28px;display:flex}.ao3h-skipworks-presets:empty:before{content:"No presets yet";color:#bbb;font-size:11px;font-style:italic}.ao3h-m5-hidebar{color:#1b2430;background:#f5f6f8;border:1px solid #d7dbe3;border-radius:8px;justify-content:space-between;align-items:center;gap:10px;margin:.5em 0;padding:6px 10px;font-size:11px;display:flex}.ao3h-m5-hidebar .left{align-items:center;gap:.5em;min-width:0;display:flex}.ao3h-m5-hidebar .label{opacity:.8}.ao3h-m5-hidebar .reason-text{white-space:normal;text-overflow:unset;overflow-wrap:anywhere;word-break:break-word;max-width:none;font-weight:600;overflow:visible}.ao3h-m5-hidebar .right{gap:6px;display:flex}.ao3h-m5-btn{cursor:pointer;background:#fff;border:1px solid #cfd6e2;border-radius:6px;padding:4px 8px}.ao3h-m5-btn:hover{background:#f1f5fb}.ao3h-m5-hide-btn{float:right;cursor:pointer;background:#fff;border:1px solid #cfd6e2;border-radius:6px;margin-top:-20px;margin-right:8px;padding-bottom:5px;font:12px/1.2 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif}.ao3h-m5-hide-btn:hover{background:#f1f5fb}.ao3h-m5-picker{z-index:99999;color:#0f172a;background:#fff;border:1px solid #cfd6e2;border-radius:12px;width:min(520px,92vw);padding:14px;font:14px/1.35 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif;display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 18px 48px rgba(0,0,0,.18)}.ao3h-m5-picker.ao3h-open{display:block}.ao3h-m5p-title{font-weight:700}.ao3h-m5p-chips{flex-wrap:wrap;gap:6px;margin:10px 0;display:flex}.ao3h-m5p-chip{cursor:pointer;background:#f8fafc;border:1px solid #c7cbd3;border-radius:999px;padding:4px 10px}.ao3h-m5p-chip:hover{background:#eef2f8}.ao3h-m5p-row{gap:8px;display:flex}.ao3h-m5p-input{border:1px solid #cfd6e2;border-radius:6px;flex:1;padding:6px 8px}.ao3h-m5p-add,.ao3h-m5p-cancel{cursor:pointer;background:#f6f8fb;border:1px solid #cfd6e2;border-radius:6px;padding:6px 10px}.ao3h-m5p-add:hover,.ao3h-m5p-cancel:hover{background:#eef2f8}.ao3h-m5p-hint{opacity:.7;margin-top:8px;font-size:12px}.ao3h-m5p-actions{justify-content:flex-end;gap:8px;margin-top:10px;display:flex}`,`ao3h-skipWorks`);var I=p(),L=`ao3h`,Ae=`skipWorks`,je=`[AO3H][${Ae}]`;function Me(e,t){try{let n=localStorage.getItem(`ao3h:mod:${Ae}:settings`);if(!n)return t;let r=JSON.parse(n);return e in r?r[e]:t}catch{return t}}var Ne=`ao3h-hiddenWorksDB-${S()}`,Pe=`works`,R;function Fe(){return new Promise((e,t)=>{let n=indexedDB.open(Ne,1);n.onupgradeneeded=e=>{let t=e.target.result;if(!t.objectStoreNames.contains(Pe)){let e=t.createObjectStore(Pe,{keyPath:`workId`});e.createIndex(`reason`,`reason`,{unique:!1}),e.createIndex(`isHidden`,`isHidden`,{unique:!1})}},n.onsuccess=t=>{R=t.target.result,R.onversionchange=()=>{try{R.close()}catch{}},e(R)},n.onerror=e=>t(e.target.error)})}function Ie(){return new Promise((e,t)=>{let n=R.transaction([Pe],`readonly`).objectStore(Pe).getAll();n.onsuccess=()=>e(n.result||[]),n.onerror=()=>t(Error(`getAll failed`))})}function Le(e){return new Promise((t,n)=>{let r=R.transaction([Pe],`readonly`).objectStore(Pe).get(e);r.onsuccess=()=>t(r.result||null),r.onerror=()=>n(Error(`get failed`))})}function Re(e){return new Promise((t,n)=>{let r=R.transaction([Pe],`readwrite`).objectStore(Pe).put(e);r.onsuccess=()=>t(!0),r.onerror=()=>n(Error(`put failed`))})}var z=new Set,ze=()=>`${L}:m5:tempShow:${location.pathname}`;function Be(){try{let e=sessionStorage.getItem(ze()),t=e?JSON.parse(e):[];return new Set(Array.isArray(t)?t:[])}catch{return new Set}}function Ve(){try{sessionStorage.setItem(ze(),JSON.stringify([...z]))}catch{}}function He(){z.clear();try{sessionStorage.removeItem(ze())}catch{}}function Ue(e,t){return(I.jQuery||I.$)(e,t)}function We(e){return(e.find(`.header .heading a[href*="/works/"]`).first().attr(`href`)||``).replace(/(#.*|\?.*)$/,``)||(e.find(`a[href*="/works/"]`).first().attr(`href`)||``).replace(/(#.*|\?.*)$/,``)}var Ge=[`crossover`,`sequel`,`bad summary`,`parent/dad`,`unfinished`,`growing up together`,`not sterek focused`,`1rst pov`,`established`,`always-a-girl`,`remember reading`,`implied`],Ke=`m5QuickTagsUser`;function qe(){try{let e=E.getJSON(Ke,null);if(Array.isArray(e)&&e.every(e=>typeof e==`string`))return e}catch{}return Ge}function Je(){return Ye.apply(this,arguments)}function Ye(){return Ye=t(function*(e=``){let t=document.getElementById(`${L}-m5-picker`);t||(t=document.createElement(`div`),t.id=`${L}-m5-picker`,t.className=`${L}-m5-picker`,t.innerHTML=`
      <div class="${L}-m5p-title">Choose a tag or write a note</div>
      <div class="${L}-m5p-chips"></div>
      <div class="${L}-m5p-row">
        <input type="text" class="${L}-m5p-input" placeholder="Write a note here…" />
        <button type="button" class="${L}-m5p-add">Add</button>
      </div>
      <div class="${L}-m5p-hint">Tip: click a tag to save immediately • Press Esc to cancel • Enter = Add</div>
      <div class="${L}-m5p-actions">
        <button type="button" class="${L}-m5p-cancel">Cancel</button>
      </div>
    `,document.body.appendChild(t));let n=t.querySelector(`.${L}-m5p-chips`);n.innerHTML=``;for(let e of qe()){let t=document.createElement(`span`);t.className=`${L}-m5p-chip`,t.textContent=e,t.addEventListener(`click`,()=>d(e)),n.appendChild(t)}let r=t.querySelector(`.${L}-m5p-input`),i=t.querySelector(`.${L}-m5p-add`),a=t.querySelector(`.${L}-m5p-cancel`);r.value=e||``;let o=()=>{let e=(r.value||``).trim();e&&d(e)},s=()=>d(null),c=e=>{e.key===`Escape`&&(e.preventDefault(),d(null)),e.key===`Enter`&&(e.preventDefault(),o())};i.onclick=o,a.onclick=s,t.classList.add(`${L}-open`),r.focus(),document.addEventListener(`keydown`,c,!0);let l,u=new Promise(e=>l=e);function d(e){t.classList.remove(`${L}-open`),document.removeEventListener(`keydown`,c,!0),l(e)}return u}),Ye.apply(this,arguments)}function Xe(e){if(e.find(`.${L}-m5-hide-btn`).length)return;let n=e.children(`.${L}-cut`),r=(n.length?n:e).find(`.header`).first();if(!r.length)return;let i=document.createElement(`button`);i.textContent=`Hide`,i.type=`button`,i.className=`${L}-m5-hide-btn`,r.append(i),i.addEventListener(`click`,function(){var n=t(function*(t){let n=We(e);if(n)try{let r=yield Le(n),i=t.shiftKey||t.altKey||t.ctrlKey||t.metaKey,a=e[0],o=!!e.find(`.${L}-m5-hidebar`).length,s=!!(r&&r.isHidden);if(s&&z.has(n)||s&&!o||i){z.delete(n),Ve();let e=r&&typeof r.reason==`string`?r.reason.trim():``;Ze(a,e),yield Re({workId:n,reason:e,isHidden:!0});return}let c=r&&typeof r.reason==`string`?r.reason:``,l=yield Je(c||``);if(l===null||(l=String(l).trim(),!l&&!c))return;z.delete(n),Ve(),Ze(a,l||c||``),yield Re({workId:n,reason:l||c||``,isHidden:!0})}catch(e){console.error(je,`hide click failed`,e)}});return function(e){return n.apply(this,arguments)}}())}function Ze(e,t){let n=Ue(e);if(n.find(`.${L}-m5-hidebar`).length)return;if(Me(`displayMode`,`block`)===`remove`){e.style.display=`none`,e.dataset.ao3hHidden=`1`;return}let r=document.createElement(`div`);r.className=`${L}-m5-hidebar`,r.innerHTML=`
    <div class="left">
      <span class="label">Hidden:</span>
      <span class="reason-text"></span>
    </div>
    <div class="right">
      <button type="button" class="${L}-m5-btn edit-reason">Edit</button>
      <button type="button" class="${L}-m5-btn show">Show</button>
      <button type="button" class="${L}-m5-btn unhide">Unhide</button>
    </div>
  `,r.querySelector(`.reason-text`).textContent=t||``;let i=Array.from(e.children);for(let e of i)e!==r&&(e.style.display=`none`);e.appendChild(r),n.find(`.${L}-m5-hide-btn`).hide()}function Qe(e){let t=Ue(e);if(e.dataset.ao3hHidden){e.style.display=``,delete e.dataset.ao3hHidden;return}let n=Array.from(e.children);for(let e of n)e.style.display=``;t.find(`.${L}-m5-hidebar`).remove(),t.find(`.${L}-m5-hide-btn`).show()}function $e(){return et.apply(this,arguments)}function et(){return et=t(function*(){try{R||(yield Fe());let e=yield Ie(),t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`ao3-hidden-works-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(n),alert(`Exported `+e.length+` hidden works.`)}catch(e){console.error(je,`export failed`,e),alert(`Export failed. See console for details.`)}}),et.apply(this,arguments)}function tt(e){return nt.apply(this,arguments)}function nt(){return nt=t(function*(e){try{let t=yield e.text(),n;try{n=JSON.parse(t)}catch{alert(`Import failed: invalid JSON file.`);return}if(!Array.isArray(n)){alert(`Import failed: JSON must be an array.`);return}R||(yield Fe());let r=0,i=0,a=0;for(let e of n){if(!e||typeof e!=`object`){a++;continue}let t=e.workId||e.id||e.href,n=e.reason??``;if(!t){a++;continue}let o={workId:t,reason:n,isHidden:e.isHidden??!0};(yield Le(t))?i++:r++,yield Re(o)}alert(`Import complete.\nCreated: ${r}\nUpdated: ${i}\nSkipped: ${a}`),confirm(`Reload now to apply hides on this page?`)&&location.reload()}catch(e){console.error(je,`import failed`,e),alert(`Import failed. See console for details.`)}}),nt.apply(this,arguments)}function rt(){let e=document.createElement(`input`);e.type=`file`,e.accept=`application/json`,e.addEventListener(`change`,()=>{e.files&&e.files[0]&&tt(e.files[0])},{once:!0}),e.click()}function it(e){try{var t;e==null||(t=e.preventDefault)==null||t.call(e)}catch{}$e()}function at(e){try{var t;e==null||(t=e.preventDefault)==null||t.call(e)}catch{}rt()}function ot(){document.dispatchEvent(new CustomEvent(`${L}:hidden-works-export`))}function st(){document.dispatchEvent(new CustomEvent(`${L}:hidden-works-import`))}function ct(){I.ao3hExportHiddenWorks=$e,I.ao3hImportHiddenWorks=rt,I.ao3hTriggerHiddenWorksExport=ot,I.ao3hTriggerHiddenWorksImport=st,document.addEventListener(`${L}:hidden-works-export`,it),document.addEventListener(`${L}:hidden-works-import`,at)}function lt(){document.removeEventListener(`${L}:hidden-works-export`,it),document.removeEventListener(`${L}:hidden-works-import`,at),I.ao3hExportHiddenWorks===$e&&delete I.ao3hExportHiddenWorks,I.ao3hImportHiddenWorks===rt&&delete I.ao3hImportHiddenWorks,I.ao3hTriggerHiddenWorksExport===ot&&delete I.ao3hTriggerHiddenWorksExport,I.ao3hTriggerHiddenWorksImport===st&&delete I.ao3hTriggerHiddenWorksImport}function ut(){return dt.apply(this,arguments)}function dt(){return dt=t(function*(){try{var e;let t=`ao3h-hiddenWorksDB`;if(!((yield(e=indexedDB).databases?.call(e))||[]).some(e=>e.name===t))return;let n=yield new Promise((e,n)=>{let r=indexedDB.open(t,1);r.onsuccess=t=>e(t.target.result),r.onerror=e=>n(e.target.error)}),r=yield new Promise((e,t)=>{let r=n.transaction([`works`],`readonly`).objectStore(`works`).getAll();r.onsuccess=()=>e(r.result||[]),r.onerror=()=>t(Error(`getAll failed`))});if(n.close(),r.length===0)return;R||(yield Fe());for(let e of r)(yield Le(e.workId))||(yield Re(e))}catch(e){console.warn(je,`Migration from shared DB failed:`,e)}}),dt.apply(this,arguments)}function ft(){return pt.apply(this,arguments)}function pt(){return pt=t(function*(){try{let e=localStorage.getItem(`ao3HiddenWorks`);if(!e)return;let t={};try{t=JSON.parse(e)}catch{console.warn(je,`legacy store invalid JSON; skipping migration`),localStorage.removeItem(`ao3HiddenWorks`);return}let n=Object.keys(t||{});if(!n.length)return;R||(yield Fe());for(let e of n){let n=t[e];(yield Le(e))||(yield Re({workId:e,reason:n,isHidden:!0}))}localStorage.removeItem(`ao3HiddenWorks`)}catch(e){console.warn(je,`legacy transfer skipped`,e)}}),pt.apply(this,arguments)}function mt(){return ht.apply(this,arguments)}function ht(){return ht=t(function*(){let e=I.jQuery||I.$;e(`ol.index li.blurb`).each((t,n)=>{Xe(e(n))});let t=yield Ie();e(`ol.index li.blurb`).each((n,r)=>{let i=We(e(r)),a=t.find(e=>e.workId===i);a&&a.isHidden&&(z.has(i)?Qe(r):Ze(r,a.reason||``))})}),ht.apply(this,arguments)}var gt=!1;function _t(){if(gt)return;let e=(I.jQuery||I.$)(document);e.on(`click.skipWorks`,`.${L}-m5-hidebar .show`,t(function*(){let e=(I.jQuery||I.$)(this).closest(`li`),t=e[0];if(!t)return;let n=We(e);n&&(Qe(t),z.add(n),Ve())})),e.on(`click.skipWorks`,`.${L}-m5-hidebar .unhide`,t(function*(){let e=(I.jQuery||I.$)(this).closest(`li`),t=e[0];if(!t)return;let n=We(e);if(n&&confirm(`Unhide this work permanently (until you hide it again)?`)){Qe(t),z.delete(n),Ve();try{let e=(yield Le(n))||{workId:n,reason:``};e.isHidden=!1,yield Re(e)}catch(e){console.error(je,`unhide failed`,e)}}})),e.on(`click.skipWorks`,`.${L}-m5-hidebar .edit-reason`,t(function*(){let e=(I.jQuery||I.$)(this).closest(`li`);if(!e[0])return;let t=We(e),n=(I.jQuery||I.$)(this).closest(`.${L}-m5-hidebar`).find(`.reason-text`),r=yield Je(n.text()||``);if(r===null)return;let i=String(r).trim();if(i){n.text(i);try{let e=(yield Le(t))||{workId:t};e.reason=i,e.isHidden=!0,yield Re(e)}catch(e){console.error(je,`edit failed`,e)}}})),gt=!0}var vt=null;function yt(){let e=document.querySelector(`ol.index`);e&&(vt=De(e,{childList:!0,subtree:!0},Ee(()=>{let e=I.jQuery||I.$;e(`ol.index li.blurb`).each((t,n)=>Xe(e(n)))},300)))}function bt(){return xt.apply(this,arguments)}function xt(){return xt=t(function*(){if(Me(`displayMode`,`block`)===`remove`)document.querySelectorAll(`.${L}-m5-hidebar`).forEach(e=>{let t=e.parentElement;if(!t)return;let n=e.querySelector(`.reason-text`)?.textContent||``;Qe(t),Ze(t,n)});else{let e=Array.from(document.querySelectorAll(`[data-ao3h-hidden]`));for(let t of e){let e=We(Ue(t));Qe(t);try{Ze(t,(e?yield Le(e):null)?.reason||``)}catch{Ze(t,``)}}}}),xt.apply(this,arguments)}function St(e){e.detail?.moduleId===Ae&&`displayMode`in(e.detail?.settings||{})&&bt()}function Ct(){return wt.apply(this,arguments)}function wt(){return wt=t(function*(){return!I.jQuery&&!I.$?(console.error(je,`jQuery not found on page`),()=>{}):(R||(yield Fe()),z=Be(),yield ft(),yield ut(),_t(),yield mt(),ct(),document.addEventListener(`ao3h:settingsChanged`,St),yt(),Tt)}),wt.apply(this,arguments)}he(Ae,{title:`Skip Works`,enabledByDefault:!0},Ct);function Tt(){if(He(),document.removeEventListener(`ao3h:settingsChanged`,St),lt(),(I.jQuery||I.$)&&(I.jQuery||I.$)(document).off(`.skipWorks`),gt=!1,vt&&=(vt.disconnect(),null),document.querySelectorAll(`.${L}-m5-hide-btn`).forEach(e=>e.remove()),document.querySelectorAll(`.${L}-m5-hidebar`).forEach(e=>{let t=e.parentElement;t&&Qe(t)}),document.querySelectorAll(`[data-ao3h-hidden]`).forEach(e=>Qe(e)),R){try{R.close()}catch{}R=null}}function Et(){let e=b(`module-loader`),n={"mod:SaveScroll:enabled":!0,"mod:CheckForKudos:enabled":!0,"mod:QuickMarkButton:enabled":!0};function r(){return a.apply(this,arguments)}function a(){return a=t(function*(){e.info(`Starting module initialization...`);try{yield o(),yield A.bootAll(),c();let t=A.all();i.emit(`modules:loaded`,{timestamp:Date.now(),modules:t.map(e=>({name:e.name,enabled:e._booted})),totalModules:t.length}),e.info(`All modules loaded successfully (${t.length} total)`)}catch(t){e.error(`Failed to load modules:`,t),i.emit(`modules:load-error`,{error:t})}}),a.apply(this,arguments)}function o(){return s.apply(this,arguments)}function s(){return s=t(function*(){e.info(`Initializing module flags...`);for(let[t,r]of Object.entries(n))try{d.get(t)??(yield d.set(t,r),e.debug(`Set default flag ${t} = ${r}`))}catch(n){e.warn(`Failed to set flag ${t}:`,n)}}),s.apply(this,arguments)}function c(){try{let t=A.all();e.info(`${t.length} modules registered:`),t.forEach(t=>{let n=t._booted?`✓ ACTIVE`:`✗ INACTIVE`;e.info(`  - ${t.name} [${n}] (${t.enabledKey})`)})}catch(t){e.warn(`Failed to log registered modules:`,t)}}function l(e){return u.apply(this,arguments)}function u(){return u=t(function*(t){e.info(`Reloading module ${t}...`);try{return yield A._stopOne(t),yield new Promise(e=>setTimeout(e,100)),yield A._bootOne(t),i.emit(`module:reloaded`,{name:t}),e.info(`Successfully reloaded ${t}`),!0}catch(n){return e.error(`Failed to reload ${t}:`,n),!1}}),u.apply(this,arguments)}function f(e){return p.apply(this,arguments)}function p(){return p=t(function*(t){e.info(`Enabling module ${t}...`);try{return yield A.setEnabled(t,!0),e.info(`Successfully enabled ${t}`),!0}catch(n){return e.error(`Failed to enable ${t}:`,n),!1}}),p.apply(this,arguments)}function m(e){return h.apply(this,arguments)}function h(){return h=t(function*(t){e.info(`Disabling module ${t}...`);try{return yield A.setEnabled(t,!1),e.info(`Successfully disabled ${t}`),!0}catch(n){return e.error(`Failed to disable ${t}:`,n),!1}}),h.apply(this,arguments)}function g(e){return _.apply(this,arguments)}function _(){return _=t(function*(t){e.info(`Handling late registration for ${t}`);try{let r=A._list.get(t);if(r){var n;let i=d.get(r.enabledKey,!!((n=r.meta)!=null&&n.enabledByDefault))||d.get(r.enabledKeyAlt,!1);e.info(`Module ${t} - shouldStart: ${i}, _booted: ${r._booted}, init exists: ${!!r.init}`),i&&!r._booted?(yield A._bootOne(t),e.info(`Late-registered module ${t} started successfully`)):r._booted?e.info(`Module ${t} already booted, skipping`):i||e.info(`Module ${t} should not start (flag disabled)`);try{typeof N.menu?.rebuild==`function`&&N.menu.rebuild()}catch(t){e.warn(`Failed to rebuild menu after late registration:`,t)}return!0}}catch(n){e.error(`Failed to handle late registration for ${t}:`,n)}return!1}),_.apply(this,arguments)}N.moduleLoader={load:r,reload:l,enable:f,disable:m,getStatus:()=>A.all().map(e=>({name:e.name,enabled:e._booted,flagKey:e.enabledKey})),initializeFlags:o,logModules:c,handleLateRegistration:g},i.on(`core:ready`,t(function*(){yield r(),setTimeout(()=>{e.info(`Waiting period complete, emitting final ready events...`),i.emit(`modules:ready`,{timestamp:Date.now()});try{let e=new CustomEvent(`AO3H:modules:ready`,{detail:{timestamp:Date.now()}});window.dispatchEvent(e)}catch(t){e.warn(`Failed to emit final modules:ready events:`,t)}},200)}));let v=()=>{try{let e=new CustomEvent(`AO3H:ready`,{detail:{moduleLoader:!0}});window.dispatchEvent(e)}catch(t){e.warn(`Failed to emit legacy AO3H:ready event:`,t)}};i.on(`core:ready`,()=>{setTimeout(v,50)}),N.env&&setTimeout(t(function*(){yield r(),v(),setTimeout(()=>{i.emit(`modules:ready`,{timestamp:Date.now()});try{let e=new CustomEvent(`AO3H:modules:ready`,{detail:{timestamp:Date.now()}});window.dispatchEvent(e)}catch(t){e.warn(`Failed to emit final ready events:`,t)}},200)}),10),e.info(`Initialized and ready`)}Et();function Dt(e,t){if(typeof e==`string`){let t=e.trim();if(t&&t.toLowerCase()!==`true`&&t.toLowerCase()!==`false`)return t.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `)}return kt(t)||At(t)}function Ot(e,t=[]){let n=t.find(t=>t.enabledKey===e||t.enabledKeyAlt===e);return n?n.name:null}function kt(e,t=[]){var n;let r=t.find(t=>t.enabledKey===e||t.enabledKeyAlt===e);return(r==null||(n=r.meta)==null?void 0:n.title)||r?.name||null}function At(e){let t=/mod:([^:]+):/.exec(e),n=(t?t[1]:String(e)).replace(/([a-z])([A-Z])/g,`$1 $2`).replace(/[\W_]+/g,` `).trim();return n.charAt(0).toUpperCase()+n.slice(1)}function jt(e,t,n,r){let i=document.createElement(`li`),a=document.createElement(`a`);return a.href=`#`,a.innerHTML=`<span class="${r}-label">${e}</span>${t?`<span class="${r}-kbd">${t}</span>`:``}`,a.addEventListener(`click`,e=>{e.preventDefault(),n?.()}),i.appendChild(a),i}function Mt(e){let t=document.createElement(`li`);return t.className=`${e}-divider`,t}var B=`ao3h`;console.log(`[AO3H][panel-config] ✅ Configuration loaded`);var V=[{id:`browse`,label:`Filter & Display`,match:/(hide|tags|filter|manager|skip|works|fic|engagement|work|length|display)/i,modules:[{id:`hideByTags`,title:`Hide By Tags`,desc:`Tag-based work filtering with groups, whitelist & keyword filter`},{id:`filterManager`,title:`Filter Manager`,desc:`Manage filter presets and work filters`},{id:`skipWorks`,title:`Skip Works`,desc:`Hide works with personal notes`},{id:`pageControls`,title:`Page Controls`,desc:`Works per page, jump to page, infinite scroll`},{id:`ficEngagement`,title:`Fic Engagement`,desc:`Engagement metrics and hidden gems`},{id:`workLength`,title:`Work Length`,desc:`Length badges and reading time estimate`},{id:`tagsDisplay`,title:`Tags Display`,desc:`Tag display, highlights, and warnings`}]},{id:`explore`,label:`Explore`,match:/(fic|peek|similar|surprise|trope|games|search|enhancer|pov|tracker)/i,modules:[{id:`ficPeek`,title:`Fic Peek`,desc:`Preview work content inline`},{id:`similarFics`,title:`Similar Fics`,desc:`Find similar works`},{id:`surpriseMe`,title:`Surprise Me`,desc:`Random work suggestions`},{id:`tropeGames`,title:`Trope Games`,desc:`Trope horoscope, bingo, and roulette`},{id:`searchEnhancer`,title:`Search Enhancer`,desc:`Enhanced search with autocomplete and sorting`},{id:`povTracker`,title:`POV Tracker`,desc:`Standalone point-of-view detection and display`}]},{id:`reading`,label:`Reading`,match:/(chapter|navigation|reading|tracker|text|speech|footnotes|formatter|collapse|notes|word|swap|fic|actions)/i,modules:[{id:`chapterNavigation`,title:`Chapter Navigation`,desc:`Enhanced chapter navigation`},{id:`readingTracker`,title:`Reading Tracker`,desc:`Unified reading lifecycle: seen, progress, completion`},{id:`textToSpeech`,title:`Text To Speech`,desc:`Text-to-speech for works`},{id:`instantFootnotes`,title:`Instant Footnotes`,desc:`Quick footnote access`},{id:`readingFormatter`,title:`Reading Formatter`,desc:`Text formatting and layout options`},{id:`collapseAuthorNotes`,title:`Collapse Author Notes`,desc:`Collapse author notes by default`},{id:`wordSwap`,title:`Word Swap`,desc:`Personal word replacement rules`}]},{id:`library`,label:`Library`,match:/(bookmark|vault|later|shelf|fic|appreciation|reading|dashboard|activity|panel|timeline|notification|center|fanfic|binge)/i,modules:[{id:`bookmarkVault`,title:`Bookmark Vault`,desc:`Manage bookmarks with notes and organization`},{id:`laterShelf`,title:`Later Shelf`,desc:`Manage marked for later list with reminders`},{id:`ficAppreciation`,title:`Fic Appreciation`,desc:`Kudos tracking and personal star ratings`},{id:`readingDashboard`,title:`Reading Dashboard`,desc:`Personal reading overview and insights`},{id:`activityPanel`,title:`Activity Panel`,desc:`Recent activity summary`},{id:`readingTimeline`,title:`Reading Timeline`,desc:`Calendar view of reading history`},{id:`notificationCenter`,title:`Notification Center`,desc:`Track updates on subscribed works`},{id:`fanficBingeMode`,title:`Fanfic Binge Mode`,desc:`Standalone binge-reading experience module`}]},{id:`navigate`,label:`Navigate & Interact`,match:/(main|navigation|keyboard|shortcuts|user|relationships|series|helper|comment|kit|fic|actions)/i,modules:[{id:`mainNavigation`,title:`Main Navigation`,desc:`Quick links and back-to-search button`},{id:`keyboardShortcuts`,title:`Keyboard Shortcuts`,desc:`Keyboard shortcuts for navigation and actions`},{id:`userRelationships`,title:`User Relationships`,desc:`Favorite authors and user blocking`},{id:`seriesHelper`,title:`Series Helper`,desc:`Series progress and navigation`},{id:`commentKit`,title:`Comment Kit`,desc:`Draft saving and thread navigation`},{id:`ficActions`,title:`Fic Actions`,desc:`Manage work action buttons`}]},{id:`appearance`,label:`Appearance & Tools`,match:/(visual|preferences|theme|builder|backup|sync|fic|downloader)/i,modules:[{id:`visualPreferences`,title:`Visual Preferences`,desc:`Stats visibility, density, date format`},{id:`themeBuilder`,title:`Theme Builder`,desc:`Custom visual themes for AO3`},{id:`backupAndSync`,title:`Backup & Sync`,desc:`Automatic backup and optional cloud sync`},{id:`ficDownloader`,title:`Fic Downloader`,desc:`Download works in multiple formats`}]}],Nt=V.flatMap(e=>e.modules.map(t=>u(u({},t),{},{tab:e.id,tabLabel:e.label})));V.map(e=>({label:e.label,include:e.modules.map(e=>e.id),match:e.match})),typeof window<`u`&&console.log(`[AO3H][tab-registry] ✅ ${V.length} tabs · ${Nt.length} modules registered`);function Pt(){let e=document.createElement(`div`);e.className=`${B}-panel-backdrop`;let t=document.createElement(`div`);t.className=`${B}-panel-box`,t.setAttribute(`role`,`dialog`),t.setAttribute(`aria-modal`,`true`),t.setAttribute(`aria-labelledby`,`${B}-panel-title`),V.length||console.warn(`[AO3H][panel-ui] tab-registry not loaded — tab buttons may be missing`);let n=(e,t,n)=>`<button class="${B}-tab-btn${n?` ${B}-tab-active`:``}" data-tab="${e}" role="tab" aria-selected="${n?`true`:`false`}" id="${B}-tab-btn-${e}">${t}</button>`;return t.innerHTML=`
    <div style="display: flex; flex-direction: column; height: 100%;">
      <!-- Header -->
      <div class="${B}-panel-header">
        <h1 class="${B}-panel-title" id="${B}-panel-title">AO3 Helper Settings</h1>
        <button class="${B}-panel-close" aria-label="Close panel">×</button>
      </div>

      <!-- Tabs (generated from tab-registry + About) -->
      <div class="${B}-panel-tabs-container">
        <div class="${B}-panel-tabs-row" role="tablist" aria-label="AO3 Helper sections">
          ${[...V.map((e,t)=>n(e.id,e.label,t===0)),n(`about`,`About`,!1)].join(`
          `)}
        </div>
      </div>

      <!-- Global Search + Bulk Actions -->
      <div class="${B}-global-search-wrapper">
        <div class="${B}-bulk-actions-buttons">
          <button class="ao3h-panel-action-btn" data-action="enable-all">Enable All</button>
          <button class="ao3h-panel-action-btn" data-action="disable-all">Disable All</button>
        </div>
        <input type="text" id="${B}-global-search" class="${B}-global-search-input" placeholder="🔍 Search all modules..." autocomplete="off">
      </div>

      <!-- Body -->
      <div class="${B}-panel-body">
        <div id="${B}-tab-container" role="tabpanel" tabindex="0">
          <p style="color: #999; padding: 20px; text-align: center;">Loading...</p>
        </div>
      </div>
    </div>
  `,{backdrop:e,box:t}}function Ft(){let e=document.querySelector(`.${B}-panel-backdrop`),t=document.querySelector(`.${B}-panel-box`);e&&e.remove(),t&&t.remove()}function It(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Lt({id:e,title:t,desc:n}){return`
        <div class="ao3h-module-container" data-module-id="${It(e)}">
            <div class="ao3h-module-row">
                <label class="ao3h-module-quick-toggle" onclick="event.stopPropagation()">
                    <input type="checkbox" class="ao3h-quick-enable-checkbox">
                </label>
                <div class="ao3h-module-info">
                    <div class="ao3h-module-name">${It(t)}</div>
                    <div class="ao3h-module-desc">${It(n)}</div>
                </div>
                <div class="ao3h-module-controls">
                    <button class="ao3h-config-btn">▼</button>
                </div>
            </div>
            <div class="ao3h-module-config-area" data-config-module="${It(e)}">
                <!-- Config loaded dynamically from AO3H_PanelConfigs -->
            </div>
        </div>`}function Rt(e){return`
<div class="ao3h-tab-content" data-tab="${It(e.id)}">
    <div class="ao3h-tab-count">${e.modules.length} modules</div>
    <div class="ao3h-modules-list">${e.modules.map(Lt).join(``)}
    </div>
</div>
`}function zt(){return`
<div class="ao3h-tab-content" data-tab="about">
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0 0 4px; font-size: 20px; color: #900;">AO3 Helper</h2>
            <p style="color: #999; margin: 0; font-size: 13px;">Version 1.0.0</p>
        </div>

        <div style="padding: 14px; background: #f9f9f9; border-radius: 8px; margin-bottom: 16px;">
            <p style="color: #555; line-height: 1.6; font-size: 13px; margin: 0;">AO3 Helper enhances your Archive of Our Own experience with ${Nt.length} modules across ${V.length} categories — covering reading, filtering, bookmarking, navigation, appearance, and more.</p>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
            <div style="flex: 1; padding: 12px; background: #fff5f5; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #900;">${Nt.length}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px;">Modules</div>
            </div>
            <div style="flex: 1; padding: 12px; background: #f5f5ff; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #336;">${V.length}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px;">Categories</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 10px; font-size: 14px; color: #333;">Quick Actions</h3>
            <button class="ao3h-config-save-btn" style="width: 100%; margin-bottom: 6px; cursor: pointer;" onclick="document.querySelectorAll('.ao3h-quick-enable-checkbox').forEach(c => { c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true})); })">✅ Enable All Modules</button>
            <button class="ao3h-config-save-btn" style="width: 100%; margin-bottom: 6px; cursor: pointer;" onclick="document.querySelectorAll('.ao3h-quick-enable-checkbox').forEach(c => { c.checked = false; c.dispatchEvent(new Event('change', {bubbles:true})); })">❌ Disable All Modules</button>
            <button class="ao3h-config-save-btn" style="width: 100%; background: #f0f0f0; color: #333; cursor: pointer;" onclick="if(confirm('Reset all settings to defaults?')) { localStorage.removeItem('ao3h-settings'); location.reload(); }">🔄 Reset to Defaults</button>
        </div>

        <div style="padding: 12px; background: #f9f9f9; border-radius: 8px; font-size: 12px; color: #888;">
            <div style="margin-bottom: 6px;"><strong style="color: #666;">Created by:</strong> ehly</div>
            <div style="margin-bottom: 6px;"><strong style="color: #666;">License:</strong> MIT</div>
            <div><strong style="color: #666;">Feedback:</strong> Report issues or suggest features on GitHub</div>
        </div>
    </div>
</div>
    `}var Bt=Object.fromEntries([...V.map(e=>[e.id,Rt(e)]),[`about`,zt()]]);console.log(`[AO3H][panel-tab-content] Tab content generated - ${V.length} tabs + About, ${Nt.length} modules`);var Vt=`_default`,Ht=`
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Status</label>
                    <div class="ao3h-setting-control">
                        <span style="color: #4caf50;">✓ Module configuration available</span>
                    </div>
                </div>
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Ut=`ficEngagement`,Wt=`

                <!-- ─── METRICS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Engagement Metrics</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="colorCodeMetrics">
                            Colour-code metrics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Green = high · Yellow = medium · Red = low engagement ratio</div>
                </div>
                </div><!-- /.ao3h-config-section: Engagement Metrics -->

                <!-- ─── INFO ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>
                <div class="ao3h-setting-description">
                    The following are always active:
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        <li>Kudos ratio · Kudos density · Save rate on all blurbs</li>
                        <li>Tooltip on hover → raw numbers</li>
                        <li>💎 Hidden Gem badge on underexposed works</li>
                        <li>Sorting by engagement via Search Enhancer</li>
                    </ul>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Gt=`filterManager`,Kt=`

                <!-- ─── PRESETS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Presets</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="starredPresetsFirst" checked>
                            Pin favourite presets to top
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Starred presets always appear first in the list</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="presetHoverPreview" checked>
                            Filter preview on hover
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows included / excluded / rating on hover</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="rememberLastPresetByFandom" checked>
                            Remember last preset per fandom
                        </label>
                    </div>
                    <div class="ao3h-setting-description">On a fandom page, the last preset used in that fandom is automatically pre-selected</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showExpandPreset" checked>
                            "Edit as chips" button on presets
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows an "Edit as chips" button next to Apply — applies the preset and lets you remove individual filters before launching the search</div>
                </div>
                </div><!-- /.ao3h-config-section: Presets -->

                <!-- ─── LANGUAGES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Languages</div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Shown languages</label>
                    <div class="ao3h-setting-control">
                        <div class="ao3h-picker-row">
                            <select class="ao3h-config-input ao3h-picker"
                                    id="ao3h-fm-lang-picker"
                                    data-picker-type="language">
                                <option value="">— Pick a language —</option>
                            </select>
                            <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green"
                                    data-action="add-language">+ Add</button>
                        </div>
                        <div class="ao3h-chip-container"
                             data-setting="selectedLanguages"
                             data-empty-text="All languages shown"></div>
                    </div>
                    <div class="ao3h-setting-description">Only works in these languages will appear in results. Leave empty to show all.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showLanguageBadge" id="ao3h-fm-badge">
                            Show language badge on works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visible only when multiple languages are selected</div>
                </div>

                <div class="ao3h-indent" id="ao3h-fm-badge-opts">
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="clickBadgeToFilter" checked>
                            Click badge to filter by language
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Clicking a language badge on a work adds it to your active filter</div>
                </div>
                </div>
                </div><!-- /.ao3h-config-section: Languages -->

                <!-- ─── ARCHIVE WARNINGS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Archive Warning Alerts</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="warnExcludedWarning" checked>
                            Warn when an archive warning is excluded
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Banner appears if one of the 6 official AO3 warnings is excluded</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="excludeWarningRemoveButton" checked>
                            "Remove exclusion" button in banner
                        </label>
                    </div>
                    <div class="ao3h-setting-description">One-click button in the warning banner to remove the exclusion immediately</div>
                </div>
                </div><!-- /.ao3h-config-section: Archive Warning Alerts -->

                <!-- ─── TAG BUNDLES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Bundles</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagBundlesEnabled" id="ao3h-fm-bundles">
                            Enable tag bundles
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A bundle = group of tags treated as equivalent. E.g. "Slow Burn" groups "Slow Burn", "Slowburn", "Pining"…</div>
                </div>

                <div id="ao3h-fm-bundles-opts" class="ao3h-indent">
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="useBuiltinTropeBundles" checked>
                                Use pre-built trope bundles
                            </label>
                        </div>
                        <div class="ao3h-setting-description">Enemies to Lovers, Slow Burn, Coffee Shop AU, etc.</div>
                    </div>
                    <div class="ao3h-config-row ao3h-config-row--end">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="create-bundle">+ Create bundle</button>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="manage-bundles">Manage bundles</button>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Tag Bundles -->

                <!-- ─── QUICK FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterOneshot" checked>
                            One-shot toggle
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a button to quickly show or hide single-chapter works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterCrossover" checked>
                            Crossover toggle
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a button to quickly show or hide crossover works</div>
                </div>
                </div><!-- /.ao3h-config-section: Quick Filters -->

                <!-- ─── HISTORY FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">History-Based Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideKudosed">
                            Hide already-kudosed works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works you've given kudos to are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideSubscribed">
                            Hide works I'm subscribed to
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works in your subscription list are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBookmarked">
                            Hide works in my bookmarks
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works you've bookmarked are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideMFL">
                            Hide works in my Later Shelf
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works saved to your Later Shelf are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideReadSeries">
                            Hide fully-read series
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Series where all chapters have been read are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showHiddenCount" checked>
                            Show count of hidden works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Displays a badge with the number of works filtered out on the current page</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="rememberFilters" checked>
                            Remember filter states between sessions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Your last active filters are restored when you return to AO3</div>
                </div>
                </div><!-- /.ao3h-config-section: History-Based Filters -->

                <!-- ─── DEFAULTS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Filter Defaults</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">One-shots</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="oneshotDefault" data-setting="oneshotDefault" value="all" checked> Show all</label>
                        <label><input type="radio" name="oneshotDefault" data-setting="oneshotDefault" value="oneshot"> One-shots only</label>
                        <label><input type="radio" name="oneshotDefault" data-setting="oneshotDefault" value="multi"> Multi-chapter only</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Crossovers</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="crossoverDefault" data-setting="crossoverDefault" value="all" checked> Show all</label>
                        <label><input type="radio" name="crossoverDefault" data-setting="crossoverDefault" value="no"> No crossovers</label>
                        <label><input type="radio" name="crossoverDefault" data-setting="crossoverDefault" value="only"> Crossovers only</label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Filter Defaults -->

                <!-- ─── IMPORT / EXPORT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Import / Export</div>
                <div class="ao3h-config-row" style="flex-wrap: wrap; gap: 6px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-presets">Import Presets</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-presets">Export Presets (JSON)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-bundles">Import Bundles</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-bundles">Export Bundles (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Import / Export -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,qt=typeof unsafeWindow<`u`?unsafeWindow:window;function Jt(e,t){try{let n=E||null;return(n?n.getJSON(e,null):JSON.parse(localStorage.getItem(`ao3h:${e}`)||`null`))??t}catch{return t}}function Yt(e,t){var n,r;try{let n=E||null;n?n.setJSON(e,t):localStorage.setItem(`ao3h:${e}`,JSON.stringify(t))}catch{}(n=qt.AO3H)==null||(n=n.user)==null||(r=n.set)==null||r.call(n,e,t)}var Xt=()=>Jt(`filterManager:presets`,[]),Zt=e=>Yt(`filterManager:presets`,e),Qt=()=>Jt(`filterManager:bundles`,[]),$t=e=>Yt(`filterManager:bundles`,e);function en(e,t){let n=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}function tn(e,t){let n=new Map(e.map(e=>[e.id,e]));for(let e of t)n.set(e.id,e);return[...n.values()]}var nn=[`English`,`Deutsch`,`Français`,`Español`,`Italiano`,`Português`,`Português Brasileiro`,`日本語`,`中文-普通话 Mandarin`,`中文-粵語 Cantonese`,`한국어`,`Русский`,`العربية`,`Polski`,`Nederlands`,`Svenska`,`Norsk`,`Suomi`,`Türkçe`,`Česky`,`Magyar`,`Română`];function rn(e){let t=e.querySelector(`#ao3h-fm-bundle-list`);t||(t=document.createElement(`div`),t.id=`ao3h-fm-bundle-list`,t.className=`ao3h-config-block`,t.style.marginTop=`8px`,e.querySelector(`#ao3h-fm-bundles-opts`)?.appendChild(t));let n=Qt();if(n.length===0){t.innerHTML=`<div class="ao3h-hbt-empty-msg">No custom bundles yet. Click "+ Create bundle" to add one.</div>`;return}t.innerHTML=``;for(let r of n){let n=document.createElement(`div`);n.className=`ao3h-config-row`,n.style.cssText=`align-items:flex-start;gap:6px;margin-bottom:4px;`,n.innerHTML=`<div style="flex:1;min-width:0;"><strong style="font-size:12px;">${an(r.name)}</strong><div style="font-size:11px;color:#555;word-break:break-word;margin-top:2px;">${an(r.tags.join(`, `))}</div></div><button class="ao3h-inline-btn ao3h-inline-btn--danger ao3h-fm-bundle-delete" data-bundle-id="${an(r.id)}" style="flex-shrink:0;">✕</button>`,n.querySelector(`.ao3h-fm-bundle-delete`).addEventListener(`click`,()=>{$t(Qt().filter(e=>e.id!==r.id)),rn(e)}),t.appendChild(n)}}function an(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function on(e){let t=e.querySelector(`#ao3h-fm-lang-picker`);if(t&&t.options.length<=1){var n;let e=document.querySelector(`select[name="work_search[language_id]"], #work_search_language_id`),r=e?[...e.options].filter(e=>e.value).map(e=>e.textContent.trim()):(n=window.ao3mock)!=null&&n.LANGUAGES?window.ao3mock.LANGUAGES.map(([,e])=>e):nn;for(let e of r){let n=document.createElement(`option`);n.value=e,n.textContent=e,t.appendChild(n)}}let r=e.querySelector(`[data-action="add-language"]`),i=e.querySelector(`.ao3h-chip-container[data-setting="selectedLanguages"]`);if(r&&i&&!r.dataset.wired){r.dataset.wired=`1`;let e=[];try{e=JSON.parse(i.dataset.value||`[]`)}catch{}function n(t,n){n&&!e.includes(t)&&e.push(t);let r=document.createElement(`span`);r.className=`ao3h-chip`,r.dataset.value=t,r.innerHTML=`${an(t)} <button type="button" title="Remove">×</button>`,r.querySelector(`button`).addEventListener(`click`,()=>{r.remove(),e=e.filter(e=>e!==t),i.dataset.value=JSON.stringify(e)}),i.appendChild(r)}e.length>0&&(i.innerHTML=``,e.forEach(e=>n(e,!1))),r.addEventListener(`click`,()=>{let r=t?.value;!r||e.includes(r)||(n(r,!0),i.dataset.value=JSON.stringify(e),t&&(t.selectedIndex=0))})}let a=e.querySelector(`#ao3h-fm-badge`),o=e.querySelector(`#ao3h-fm-badge-opts`);a&&o&&!a.dataset.wired&&(a.dataset.wired=`1`,o.style.display=a.checked?``:`none`,a.addEventListener(`change`,()=>{o.style.display=a.checked?``:`none`}));let s=e.querySelector(`#ao3h-fm-bundles`),c=e.querySelector(`#ao3h-fm-bundles-opts`);s&&c&&!s.dataset.wired&&(s.dataset.wired=`1`,c.style.display=s.checked?``:`none`,s.addEventListener(`change`,()=>{c.style.display=s.checked?``:`none`}));let l=e.querySelector(`[data-action="export-presets"]`);l&&!l.dataset.wired&&(l.dataset.wired=`1`,l.addEventListener(`click`,()=>{en({presets:Xt()},`ao3h-presets.json`)}));let u=e.querySelector(`[data-action="import-presets"]`);u&&!u.dataset.wired&&(u.dataset.wired=`1`,u.addEventListener(`click`,()=>{let e=document.createElement(`input`);e.type=`file`,e.accept=`.json,application/json`,e.addEventListener(`change`,()=>{let t=e.files?.[0];if(!t)return;let n=new FileReader;n.onload=e=>{try{let t=JSON.parse(e.target.result);Array.isArray(t.presets)&&(Zt(tn(Xt(),t.presets)),u.textContent=`✓ Imported`,setTimeout(()=>{u.textContent=`Import Presets`},1500))}catch(e){console.error(`[AO3H][filterManager-config] Import error`,e)}},n.readAsText(t)}),e.click()}));let d=e.querySelector(`[data-action="export-bundles"]`);d&&!d.dataset.wired&&(d.dataset.wired=`1`,d.addEventListener(`click`,()=>{en({bundles:Qt()},`ao3h-bundles.json`)}));let f=e.querySelector(`[data-action="import-bundles"]`);f&&!f.dataset.wired&&(f.dataset.wired=`1`,f.addEventListener(`click`,()=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`.json,application/json`,t.addEventListener(`change`,()=>{let n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=t=>{try{let n=JSON.parse(t.target.result);Array.isArray(n.bundles)&&($t(tn(Qt(),n.bundles)),rn(e),f.textContent=`✓ Imported`,setTimeout(()=>{f.textContent=`Import Bundles`},1500))}catch(e){console.error(`[AO3H][filterManager-config] Import error`,e)}},r.readAsText(n)}),t.click()}));let p=e.querySelector(`[data-action="create-bundle"]`);p&&!p.dataset.wired&&(p.dataset.wired=`1`,p.addEventListener(`click`,()=>{let t=window.prompt(`Bundle name (e.g. "Slow Burn"):`);if(!(t!=null&&t.trim()))return;let n=window.prompt(`Tags for "${t.trim()}" (comma-separated):`);if(!(n!=null&&n.trim()))return;let r=n.split(`,`).map(e=>e.trim()).filter(Boolean);if(r.length===0)return;let i=Date.now().toString(36)+Math.random().toString(36).slice(2,5),a=Qt();a.push({id:i,name:t.trim(),tags:r}),$t(a),rn(e)}));let m=e.querySelector(`[data-action="manage-bundles"]`);m&&!m.dataset.wired&&(m.dataset.wired=`1`,m.addEventListener(`click`,()=>{rn(e);let t=e.querySelector(`#ao3h-fm-bundle-list`);if(t){let e=t.style.display===`none`;t.style.display=e?``:`none`,m.textContent=e?`Hide bundles`:`Manage bundles`}}))}document.addEventListener(`ao3h:configOpen`,function(e){e.detail?.moduleId===`filterManager`&&on(e.target)});var sn=`hideByTags`,cn=`

                <div class="ao3h-config-section">

                <!-- ─── HIDDEN TAGS MANAGER ─── -->
                <div class="ao3h-config-section-title">🚫 Hidden Tags</div>

                <div class="ao3h-hbt-enables-row">
                    <label><input type="checkbox" data-setting="enabled" checked> Enable tag hiding</label>
                    <label><input type="checkbox" data-setting="quickAddIcon" checked> 🚫 Quick-add on hover</label>
                </div>

                <div id="ao3h-hideByTags-behavior" class="ao3h-hbt-behavior-row">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">When a work matches a blacklisted tag</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-hideMode" data-setting="hideMode" value="hide" checked> Hide completely</label>
                        <label><input type="radio" name="hideByTags-hideMode" data-setting="hideMode" value="dim"> Soft hide (25% opacity)</label>
                    </div>
                </div>
                </div>

                <div id="ao3h-hideByTags-section-body" class="ao3h-hbt-two-col">
                <div class="ao3h-hbt-col-form">
                <!-- Add a tag row -->
                <div class="ao3h-config-row">
                    <input type="text" id="ao3h-hideByTags-add-input"
                           class="ao3h-config-input ao3h-hbt-tag-input"
                           placeholder="Add a tag…"
                           autocomplete="off">
                    <select id="ao3h-hideByTags-add-group"
                            class="ao3h-config-input ao3h-hbt-group-select">
                        <option value="">— Group (optional) —</option>
                    </select>
                    <input type="text" id="ao3h-hideByTags-add-group-text"
                           class="ao3h-config-input ao3h-hbt-group-text"
                           placeholder="New group name…"
                           autocomplete="off">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-tag"
                            title="Add this tag to the list">
                        + Add
                    </button>
                </div>

                <!-- Quick add group row -->
                <div class="ao3h-config-row">
                    <input type="text" id="ao3h-hideByTags-new-group"
                           class="ao3h-config-input ao3h-hbt-newgroup-input"
                           placeholder="Create a new group…"
                           autocomplete="off">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="add-group"
                            title="Create an empty group">
                        + Group
                    </button>
                </div>

                <div id="ao3h-hideByTags-groups" class="ao3h-hbt-groups-panel"></div>
                </div><!-- /.ao3h-hbt-col-form -->

                <div class="ao3h-hbt-col-chips">
                <!-- Tag list — populated by renderList() from localStorage -->
                <div id="ao3h-hideByTags-list" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-hbt-col-chips -->

                </div><!-- /.ao3h-hbt-two-col: Hidden Tags -->

                <div id="ao3h-hideByTags-below" class="ao3h-hbt-below-actions">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-all" title="Import from JSON">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-all" title="Export as JSON">Export</button>
                </div>

                <div class="ao3h-config-section">
                <!-- ─── WHITELIST EXCEPTIONS ─── -->
                <div class="ao3h-config-section-title">🟢 Whitelist Exceptions</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="whitelistEnabled" checked>
                            Enable whitelist exceptions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">If a work has a whitelisted tag, it stays visible even if it also matches a blacklisted tag.</div>
                </div>

                <div class="ao3h-indent">
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showWhitelistBadge" checked>
                            Show a 🟢 badge on works kept visible by a whitelist exception
                        </label>
                    </div>
                </div>
                </div>

                <div id="ao3h-hideByTags-whitelist-behavior" class="ao3h-hbt-behavior-row">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">When a work matches both a blacklist and a whitelist tag</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-whitelistMode" data-setting="whitelistMode" value="show" checked> Show automatically</label>
                        <label><input type="radio" name="hideByTags-whitelistMode" data-setting="whitelistMode" value="fold-note"> Keep folded, add a 🟢 note to the fold banner</label>
                    </div>
                </div>
                </div><!-- /#ao3h-hideByTags-whitelist-behavior -->

                <div id="ao3h-hideByTags-whitelist-body" class="ao3h-hbt-two-col">
                <div class="ao3h-hbt-col-form">
                <!-- Whitelist tag manager -->
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-whitelist-add-input"
                               class="ao3h-config-input ao3h-hbt-tag-input"
                               placeholder="Add a whitelist tag…"
                               autocomplete="off">
                        <select id="ao3h-hideByTags-whitelist-add-group"
                                class="ao3h-config-input ao3h-hbt-group-select">
                            <option value="">— Group (optional) —</option>
                        </select>
                        <input type="text" id="ao3h-hideByTags-whitelist-add-group-text"
                               class="ao3h-config-input ao3h-hbt-group-text"
                               placeholder="New group name…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-whitelist-tag">
                            + Add
                        </button>
                    </div>
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-whitelist-new-group"
                               class="ao3h-config-input ao3h-hbt-newgroup-input"
                               placeholder="Create a new group…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="add-whitelist-group">
                            + Group
                        </button>
                    </div>
                <div id="ao3h-hideByTags-whitelist-groups" class="ao3h-hbt-groups-panel"></div>
                </div><!-- /.ao3h-hbt-col-form -->

                <div class="ao3h-hbt-col-chips">
                <div id="ao3h-hideByTags-whitelist-list" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-hbt-col-chips -->

                </div><!-- /.ao3h-hbt-two-col: Whitelist Exceptions -->

                <div id="ao3h-hideByTags-whitelist-below" class="ao3h-hbt-below-actions">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-whitelist" title="Import from JSON">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-whitelist" title="Export as JSON">Export</button>
                </div>

                <div class="ao3h-config-section">
                <!-- ─── NOPE WORDS ─── -->
                <div class="ao3h-config-section-title">⛔ NOPE Words</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="textFilterEnabled" checked>
                            Enable keyword text filter
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Applies to work summaries and author notes — not tags.</div>
                </div>

                <div id="ao3h-hideByTags-nope-behavior" class="ao3h-hbt-behavior-row">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">When a work matches a NOPE word</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-nopeHideMode" data-setting="nopeHideMode" value="hide" checked> Hide completely</label>
                        <label><input type="radio" name="hideByTags-nopeHideMode" data-setting="nopeHideMode" value="dim"> Soft hide (25% opacity)</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Scan for NOPE words in</label>
                    <div class="ao3h-setting-control ao3h-setting-control--checkboxes">
                        <label><input type="checkbox" data-setting="nopeTargetSummaries" checked> Summaries</label>
                        <label><input type="checkbox" data-setting="nopeTargetNotes" checked> Author notes</label>
                        <label><input type="checkbox" data-setting="nopeTargetTitles"> Titles</label>
                    </div>
                </div>
                </div><!-- /#ao3h-hideByTags-nope-behavior -->

                <div id="ao3h-hideByTags-nope-body" class="ao3h-hbt-two-col">
                <div class="ao3h-hbt-col-form">
                <!-- NOPE Words manager -->
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-nope-add-input"
                               class="ao3h-config-input ao3h-hbt-tag-input"
                               placeholder="Add a keyword…"
                               autocomplete="off">
                        <select id="ao3h-hideByTags-nope-add-group"
                                class="ao3h-config-input ao3h-hbt-group-select">
                            <option value="">— Group (optional) —</option>
                        </select>
                        <input type="text" id="ao3h-hideByTags-nope-add-group-text"
                               class="ao3h-config-input ao3h-hbt-group-text"
                               placeholder="New group name…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-nope-word">
                            + Add
                        </button>
                    </div>
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-nope-new-group"
                               class="ao3h-config-input ao3h-hbt-newgroup-input"
                               placeholder="Create a new group…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="add-nope-group">
                            + Group
                        </button>
                    </div>
                <div id="ao3h-hideByTags-nope-groups" class="ao3h-hbt-groups-panel"></div>
                </div><!-- /.ao3h-hbt-col-form -->

                <div class="ao3h-hbt-col-chips">
                <div id="ao3h-hideByTags-nope-list" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-hbt-col-chips -->

                </div><!-- /.ao3h-hbt-two-col: NOPE Words -->

                <div id="ao3h-hideByTags-nope-below" class="ao3h-hbt-below-actions">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-nope" title="Import from JSON">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-nope" title="Export as JSON">Export</button>
                </div>

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Data</div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-backup</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoBackup">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Data -->

                <!-- Footer: Save + Reset -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,ln=typeof unsafeWindow<`u`?unsafeWindow:window,un=()=>{var e;return((e=ln.AO3H)==null||(e=e.env)==null?void 0:e.NS)||`ao3h`},dn=()=>E||null;function H(e,t){try{let n=dn();return(n?n.getJSON(e,null):JSON.parse(localStorage.getItem(`${un()}:${e}`)||`null`))??t}catch{return t}}function fn(e,t){var n,r;try{let n=dn();n?n.setJSON(e,t):localStorage.setItem(`${un()}:${e}`,JSON.stringify(t))}catch{}(n=ln.AO3H)==null||(n=n.store)==null||(r=n.set)==null||r.call(n,e,t)}var pn=()=>H(`hideTags`,[]),mn=e=>fn(`hideTags`,[...new Set(e.map(e=>e.trim().toLowerCase()).filter(Boolean))]),hn=()=>H(`hideTagsGroups`,{}),gn=e=>fn(`hideTagsGroups`,e),_n=()=>H(`hideTagsEmptyGroups`,[]),vn=e=>fn(`hideTagsEmptyGroups`,[...new Set(e.map(e=>e.trim()).filter(Boolean))]),yn=()=>H(`hideTagsWhitelist`,[]),bn=e=>fn(`hideTagsWhitelist`,[...new Set(e.map(e=>e.trim().toLowerCase()).filter(Boolean))]),xn=()=>H(`hideTagsNope`,[]),Sn=e=>fn(`hideTagsNope`,[...new Set(e.map(e=>e.trim().toLowerCase()).filter(Boolean))]),Cn=()=>H(`hideTagsWhitelistGroups`,{}),wn=e=>fn(`hideTagsWhitelistGroups`,e),Tn=()=>H(`hideTagsWhitelistEmptyGroups`,[]),En=e=>fn(`hideTagsWhitelistEmptyGroups`,[...new Set(e.map(e=>e.trim()).filter(Boolean))]),Dn=()=>H(`hideTagsNopeGroups`,{}),On=e=>fn(`hideTagsNopeGroups`,e),kn=()=>H(`hideTagsNopeEmptyGroups`,[]),An=e=>fn(`hideTagsNopeEmptyGroups`,[...new Set(e.map(e=>e.trim()).filter(Boolean))]),jn=new Set,Mn=new Set,Nn=new Set;function Pn(e){let t=e.querySelector(`#ao3h-hideByTags-count`),n=e.querySelector(`#ao3h-hideByTags-whitelist-count`),r=e.querySelector(`#ao3h-hideByTags-nope-count`),i=pn().length,a=yn().length,o=xn().length;t&&(t.textContent=i>0?`${i} hidden`:``),n&&(n.textContent=a>0?`${a} exception${a===1?``:`s`}`:``),r&&(r.textContent=o>0?`${o} word${o===1?``:`s`}`:``)}function U(e){let t=e.querySelector(`#ao3h-hideByTags-list`);if(!t)return;let n=e.querySelector(`#ao3h-hideByTags-groups`),r=(e.querySelector(`#ao3h-hideByTags-search`)?.value||``).trim().toLowerCase(),i=pn(),a=hn(),o=_n();{let t=(e.querySelector(`#ao3h-hideByTags-add-group`)||{}).value||``;Hn(e,`ao3h-hideByTags-add-group`,[...new Set([...Object.values(a).map(e=>(e||``).trim()).filter(Boolean),...o.map(e=>(e||``).trim()).filter(Boolean)])].sort((e,t)=>e.localeCompare(t,void 0,{sensitivity:`base`})),t)}let s=r?i.filter(e=>e.includes(r)||(a[e]||``).toLowerCase().includes(r)):i,c=r?o.filter(e=>e.toLowerCase().includes(r)):o;if(s.length===0&&c.length===0){t.innerHTML=`
      <div class="ao3h-hbt-empty-msg">
        ${i.length===0&&o.length===0?`No hidden tags yet.<br>Hover over a tag on any work listing and click 🚫 to hide it.`:`No tags match your search.`}
      </div>`,n&&(n.innerHTML=``);return}let l=new Map;for(let e of s){let t=(a[e]||``).trim()||`(ungrouped)`;l.has(t)||l.set(t,[]),l.get(t).push(e)}for(let e of c)l.has(e)||l.set(e,[]);let u=[...l.entries()].sort((e,t)=>e[0]===`(ungrouped)`?-1:t[0]===`(ungrouped)`?1:e[0].localeCompare(t[0],void 0,{sensitivity:`base`}));for(let[,e]of u)e.sort((e,t)=>e.localeCompare(t,void 0,{sensitivity:`base`}));let d=u.filter(([e])=>e!==`(ungrouped)`).length,f=e.querySelector(`#ao3h-hideByTags-count`);if(t.innerHTML=``,n&&(n.innerHTML=``,d>0)){let e=document.createElement(`div`);e.className=`ao3h-hbt-groups-inner`,n.appendChild(e)}for(let[r,i]of u){let a=r===`(ungrouped)`,o=a||jn.has(r),s=document.createElement(`div`);if(s.className=a?`ao3h-hbt-group`:`ao3h-hbt-group ao3h-hbt-group--named`,s.setAttribute(`aria-expanded`,String(o)),!a){let t=document.createElement(`div`);t.className=`ao3h-hbt-group-header`,t.innerHTML=`
        <div class="ao3h-hbt-group-header-inner">
          <span class="ao3h-hbt-group-left">
            <span class="ao3h-hbt-chevron">▶</span>
            <span class="ao3h-hbt-group-label">${r}</span>
          </span>
          <button type="button" class="ao3h-hbt-group-delete ao3h-inline-btn ao3h-inline-btn--danger" title="Delete group">×</button>
        </div>`,t.addEventListener(`click`,e=>{if(e.target.closest(`.ao3h-hbt-group-delete`))return;let t=s.getAttribute(`aria-expanded`)===`true`;s.setAttribute(`aria-expanded`,String(!t)),t?jn.delete(r):jn.add(r)}),t.querySelector(`.ao3h-hbt-group-delete`).addEventListener(`click`,t=>{t.stopPropagation();let n=hn();for(let e of i)delete n[e];gn(n),vn(_n().filter(e=>e!==r)),jn.delete(r),U(e)}),s.appendChild(t)}let c=document.createElement(`div`);c.className=`ao3h-hbt-group-wrap`;let l=document.createElement(`div`);l.className=`ao3h-tag-chips`;for(let t of i)l.appendChild(zn(t,e));c.appendChild(l);let u=document.createElement(`div`);if(u.className=`ao3h-hbt-footer`,a)f||(f=document.createElement(`span`),f.id=`ao3h-hideByTags-count`),f.className=`ao3h-hbt-footer-text`,u.appendChild(f);else{let e=document.createElement(`span`);e.className=`ao3h-hbt-footer-text`,e.textContent=`${i.length} tag${i.length===1?``:`s`}`,u.appendChild(e)}if(a){let t=document.createElement(`button`);t.type=`button`,t.className=`ao3h-hbt-footer-clear`,t.title=`Clear all hidden tags`,t.textContent=`🗑️`,t.addEventListener(`click`,t=>{t.preventDefault(),confirm(`Clear all hidden tags?
This cannot be undone.`)&&(mn([]),gn({}),vn([]),U(e))}),u.appendChild(t)}a?(s.appendChild(c),s.appendChild(u)):(c.appendChild(u),s.appendChild(c));let d=n?.querySelector(`.ao3h-hbt-groups-inner`)??null;(!a&&d?d:t).appendChild(s)}if(n&&d>0){let t=document.createElement(`div`);t.className=`ao3h-hbt-footer`;let r=document.createElement(`span`);r.className=`ao3h-hbt-footer-text`,r.textContent=`${d} group${d===1?``:`s`}`,t.appendChild(r);let i=document.createElement(`button`);i.type=`button`,i.className=`ao3h-hbt-footer-clear`,i.title=`Delete all groups`,i.textContent=`🗑️`,i.addEventListener(`click`,t=>{t.preventDefault(),confirm(`Delete all groups?
Tags will be kept but ungrouped.`)&&(gn({}),vn([]),U(e))}),t.appendChild(i),n.appendChild(t)}Pn(e)}function Fn(e,t){let n=e.querySelector(`#${t.listId}`);if(!n)return;let r=t.groupsId?e.querySelector(`#`+t.groupsId):null,i=t.getItems(),a=t.getGroupsMap(),o=t.getEmptyGroups();if(t.groupSelectId){let n=e.querySelector(`#${t.groupSelectId}`),r=n&&n.value||``,i=[...new Set([...Object.values(a).map(e=>(e||``).trim()).filter(Boolean),...o.map(e=>(e||``).trim()).filter(Boolean)])].sort((e,t)=>e.localeCompare(t,void 0,{sensitivity:`base`}));Hn(e,t.groupSelectId,i,r)}if(i.length===0&&o.length===0){n.innerHTML=`<div class="ao3h-hbt-empty-msg">${t.emptyFreshMsg}</div>`,r&&(r.innerHTML=``);return}let s=new Map;for(let e of i){let t=(a[e]||``).trim()||`(ungrouped)`;s.has(t)||s.set(t,[]),s.get(t).push(e)}for(let e of o)s.has(e)||s.set(e,[]);let c=[...s.entries()].sort((e,t)=>e[0]===`(ungrouped)`?-1:t[0]===`(ungrouped)`?1:e[0].localeCompare(t[0],void 0,{sensitivity:`base`}));for(let[,e]of c)e.sort((e,t)=>e.localeCompare(t,void 0,{sensitivity:`base`}));let l=c.filter(([e])=>e!==`(ungrouped)`).length,u=t.countId?e.querySelector(`#`+t.countId):null;if(n.innerHTML=``,r&&(r.innerHTML=``,l>0)){let e=document.createElement(`div`);e.className=`ao3h-hbt-groups-inner`,r.appendChild(e)}for(let[i,a]of c){let o=i===`(ungrouped)`,s=o||t.expandedSet.has(i),c=document.createElement(`div`);if(c.className=o?`ao3h-hbt-group`:`ao3h-hbt-group ao3h-hbt-group--named`,c.setAttribute(`aria-expanded`,String(s)),!o){let n=document.createElement(`div`);n.className=`ao3h-hbt-group-header`,n.innerHTML=`
        <div class="ao3h-hbt-group-header-inner">
          <span class="ao3h-hbt-group-left">
            <span class="ao3h-hbt-chevron">▶</span>
            <span class="ao3h-hbt-group-label">${i}</span>
          </span>
          <button type="button" class="ao3h-hbt-group-delete ao3h-inline-btn ao3h-inline-btn--danger" title="Delete group">×</button>
        </div>`,n.addEventListener(`click`,e=>{if(e.target.closest(`.ao3h-hbt-group-delete`))return;let n=c.getAttribute(`aria-expanded`)===`true`;c.setAttribute(`aria-expanded`,String(!n)),n?t.expandedSet.delete(i):t.expandedSet.add(i)}),n.querySelector(`.ao3h-hbt-group-delete`).addEventListener(`click`,n=>{n.stopPropagation();let r=t.getGroupsMap();for(let e of a)delete r[e];t.saveGroupsMap(r),t.saveEmptyGroups(t.getEmptyGroups().filter(e=>e!==i)),t.expandedSet.delete(i),t.rerenderFn(e)}),c.appendChild(n)}let l=document.createElement(`div`);l.className=`ao3h-hbt-group-wrap`;let d=document.createElement(`div`);d.className=`ao3h-tag-chips`;for(let n of a)d.appendChild(t.makeChipFn(n,e));l.appendChild(d);let f=document.createElement(`div`);if(f.className=`ao3h-hbt-footer`,o&&t.countId)u||(u=document.createElement(`span`),u.id=t.countId),u.className=`ao3h-hbt-footer-text`,f.appendChild(u);else{let e=document.createElement(`span`);e.className=`ao3h-hbt-footer-text`,e.textContent=`${a.length} tag${a.length===1?``:`s`}`,f.appendChild(e)}if(o&&t.clearFn){let n=document.createElement(`button`);n.type=`button`,n.className=`ao3h-hbt-footer-clear`,n.title=`Clear all ${t.label}s`,n.textContent=`🗑️`,n.addEventListener(`click`,n=>{n.preventDefault(),confirm(t.clearMsg||`Clear all ${t.label}s?\nThis cannot be undone.`)&&(t.clearFn(),t.rerenderFn(e))}),f.appendChild(n)}o?(c.appendChild(l),c.appendChild(f)):(l.appendChild(f),c.appendChild(l));let p=r?.querySelector(`.ao3h-hbt-groups-inner`)??null;(!o&&p?p:n).appendChild(c)}if(r&&l>0){let n=document.createElement(`div`);n.className=`ao3h-hbt-footer`;let i=document.createElement(`span`);i.className=`ao3h-hbt-footer-text`,i.textContent=`${l} group${l===1?``:`s`}`,n.appendChild(i);let a=document.createElement(`button`);a.type=`button`,a.className=`ao3h-hbt-footer-clear`,a.title=`Delete all groups`,a.textContent=`🗑️`,a.addEventListener(`click`,n=>{n.preventDefault(),confirm(`Delete all groups?
Tags will be kept but ungrouped.`)&&(t.saveGroupsMap({}),t.saveEmptyGroups([]),t.rerenderFn(e))}),n.appendChild(a),r.appendChild(n)}}function In(e){Fn(e,{listId:`ao3h-hideByTags-whitelist-list`,groupsId:`ao3h-hideByTags-whitelist-groups`,groupSelectId:`ao3h-hideByTags-whitelist-add-group`,countId:`ao3h-hideByTags-whitelist-count`,getItems:yn,getGroupsMap:Cn,saveGroupsMap:wn,getEmptyGroups:Tn,saveEmptyGroups:En,expandedSet:Mn,emptyFreshMsg:`No whitelist exceptions yet.`,label:`exception`,clearFn:()=>{bn([]),wn({}),En([])},clearMsg:`Clear all whitelist exceptions?
This cannot be undone.`,makeChipFn:(e,t)=>Rn(e,t,{getItems:yn,saveItems:bn,getGroupsMap:Cn,saveGroupsMap:wn,getEmptyGroups:Tn,saveEmptyGroups:En,expandedSet:Mn,rerenderFn:In}),rerenderFn:In}),Pn(e)}function Ln(e){Fn(e,{listId:`ao3h-hideByTags-nope-list`,groupsId:`ao3h-hideByTags-nope-groups`,groupSelectId:`ao3h-hideByTags-nope-add-group`,countId:`ao3h-hideByTags-nope-count`,getItems:xn,getGroupsMap:Dn,saveGroupsMap:On,getEmptyGroups:kn,saveEmptyGroups:An,expandedSet:Nn,emptyFreshMsg:`No NOPE words yet.`,label:`word`,clearFn:()=>{Sn([]),On({}),An([])},clearMsg:`Clear all NOPE words?
This cannot be undone.`,makeChipFn:(e,t)=>Rn(e,t,{getItems:xn,saveItems:Sn,getGroupsMap:Dn,saveGroupsMap:On,getEmptyGroups:kn,saveEmptyGroups:An,expandedSet:Nn,rerenderFn:Ln}),rerenderFn:Ln}),Pn(e)}function Rn(e,t,n){let r=document.createElement(`span`);r.className=`ao3h-tag-chip`;let i=document.createElement(`span`);i.className=`ao3h-tag-chip-text`,i.textContent=e,i.title=e;let a=document.createElement(`button`);a.type=`button`,a.className=`ao3h-tag-chip-group`,a.title=`Change group`,a.textContent=`📁`,a.addEventListener(`click`,r=>{r.stopPropagation(),Bn(a,e,t,n)});let o=document.createElement(`button`);return o.type=`button`,o.className=`ao3h-tag-chip-remove`,o.title=`Remove`,o.textContent=`×`,o.addEventListener(`click`,r=>{r.stopPropagation(),n.saveItems(n.getItems().filter(t=>t!==e));let i=n.getGroupsMap();delete i[e],n.saveGroupsMap(i),n.rerenderFn(t)}),r.append(i,a,o),r}function zn(e,t){let n=document.createElement(`span`);n.className=`ao3h-tag-chip`;let r=document.createElement(`span`);r.className=`ao3h-tag-chip-text`,r.textContent=e,r.title=e;let i=document.createElement(`button`);i.type=`button`,i.className=`ao3h-tag-chip-group`,i.title=`Change group`,i.textContent=`📁`,i.addEventListener(`click`,n=>{n.stopPropagation(),Vn(i,e,t)});let a=document.createElement(`button`);return a.type=`button`,a.className=`ao3h-tag-chip-remove`,a.title=`Remove`,a.textContent=`×`,a.addEventListener(`click`,n=>{n.stopPropagation(),mn(pn().filter(t=>t!==e));let r=hn();delete r[e],gn(r),U(t)}),n.append(r,i,a),n}function Bn(e,t,n,r){document.querySelectorAll(`.ao3h-hbt-group-picker--floating`).forEach(e=>e.remove());let i=r.getGroupsMap(),a=(i[t]||``).trim(),o=r.getEmptyGroups(),s=[...new Set([...Object.values(i).map(e=>(e||``).trim()).filter(Boolean),...o.map(e=>(e||``).trim()).filter(Boolean)])].sort((e,t)=>e.localeCompare(t,void 0,{sensitivity:`base`})),c=document.createElement(`div`);c.className=`ao3h-hbt-group-picker ao3h-hbt-group-picker--floating`,c.innerHTML=`
    <div class="ao3h-hbt-gp-title">Move to group</div>
    <div class="ao3h-hbt-gp-hint">click to move instantly</div>
    <div class="ao3h-hbt-gp-list">
      ${s.map(e=>`<div class="ao3h-hbt-gp-item${e===a?` ao3h-hbt-gp-item--current`:``}" data-group="${e.replace(/"/g,`&quot;`)}">${e}</div>`).join(``)}
    </div>
    <div class="ao3h-hbt-gp-actions">
      <button class="ao3h-inline-btn ao3h-inline-btn--danger ao3h-hbt-gp-ungroup">✕ Ungroup</button>
      <div class="ao3h-hbt-gp-input-row">
        <input class="ao3h-hbt-gp-input" type="text" placeholder="Create new group…">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-hbt-gp-add">+</button>
      </div>
    </div>
    <button class="ao3h-inline-btn ao3h-hbt-gp-close">Close</button>`,document.body.appendChild(c);let l=e.getBoundingClientRect();Object.assign(c.style,{position:`fixed`,zIndex:`1000000`,left:`${l.left}px`,top:`${l.bottom+4}px`}),requestAnimationFrame(()=>{let e=c.getBoundingClientRect();e.right>window.innerWidth-8&&(c.style.left=`${window.innerWidth-e.width-8}px`),e.bottom>window.innerHeight-8&&(c.style.top=`${l.top-e.height-4}px`)});function u(){c.remove(),document.removeEventListener(`click`,d,!0)}function d(t){!c.contains(t.target)&&t.target!==e&&u()}setTimeout(()=>document.addEventListener(`click`,d,!0),0);function f(e){let i=r.getGroupsMap();e?i[t]=e:delete i[t],r.saveGroupsMap(i),e&&r.saveEmptyGroups(r.getEmptyGroups().filter(t=>t!==e)),u(),r.rerenderFn(n)}c.querySelectorAll(`.ao3h-hbt-gp-item`).forEach(e=>e.addEventListener(`click`,()=>f(e.dataset.group)));let p=c.querySelector(`.ao3h-hbt-gp-input`),m=c.querySelector(`.ao3h-hbt-gp-add`);function h(){let e=p.value.trim();e&&f(e)}m.addEventListener(`click`,h),p.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),h())}),c.querySelector(`.ao3h-hbt-gp-ungroup`).addEventListener(`click`,()=>f(``)),c.querySelector(`.ao3h-hbt-gp-close`).addEventListener(`click`,u),p.focus()}function Vn(e,t,n){document.querySelectorAll(`.ao3h-hbt-group-picker--floating`).forEach(e=>e.remove());let r=hn(),i=(r[t]||``).trim(),a=_n(),o=[...new Set([...Object.values(r).map(e=>(e||``).trim()).filter(Boolean),...a.map(e=>(e||``).trim()).filter(Boolean)])].sort((e,t)=>e.localeCompare(t,void 0,{sensitivity:`base`})),s=document.createElement(`div`);s.className=`ao3h-hbt-group-picker ao3h-hbt-group-picker--floating`,s.innerHTML=`
    <div class="ao3h-hbt-gp-title">Move to group</div>
    <div class="ao3h-hbt-gp-hint">click to move instantly</div>
    <div class="ao3h-hbt-gp-list">
      ${o.map(e=>`<div class="ao3h-hbt-gp-item${e===i?` ao3h-hbt-gp-item--current`:``}"
        data-group="${e.replace(/"/g,`&quot;`)}">${e}</div>`).join(``)}
    </div>
    <div class="ao3h-hbt-gp-actions">
      <button class="ao3h-inline-btn ao3h-inline-btn--danger ao3h-hbt-gp-ungroup">✕ Ungroup</button>
      <div class="ao3h-hbt-gp-input-row">
        <input class="ao3h-hbt-gp-input" type="text" placeholder="Create new group…">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-hbt-gp-add">+</button>
      </div>
    </div>
    <button class="ao3h-inline-btn ao3h-hbt-gp-close">Close</button>`,document.body.appendChild(s);let c=e.getBoundingClientRect();Object.assign(s.style,{position:`fixed`,zIndex:`1000000`,left:`${c.left}px`,top:`${c.bottom+4}px`}),requestAnimationFrame(()=>{let e=s.getBoundingClientRect();e.right>window.innerWidth-8&&(s.style.left=`${window.innerWidth-e.width-8}px`),e.bottom>window.innerHeight-8&&(s.style.top=`${c.top-e.height-4}px`)});function l(){s.remove(),document.removeEventListener(`click`,u,!0)}function u(t){!s.contains(t.target)&&t.target!==e&&l()}setTimeout(()=>document.addEventListener(`click`,u,!0),0);function d(e){let r=hn();e?r[t]=e:delete r[t],gn(r),e&&vn(_n().filter(t=>t!==e)),l(),U(n)}s.querySelectorAll(`.ao3h-hbt-gp-item`).forEach(e=>e.addEventListener(`click`,()=>d(e.dataset.group)));let f=s.querySelector(`.ao3h-hbt-gp-input`),p=s.querySelector(`.ao3h-hbt-gp-add`);function m(){let e=f.value.trim();e&&d(e)}p.addEventListener(`click`,m),f.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),m())}),s.querySelector(`.ao3h-hbt-gp-ungroup`).addEventListener(`click`,()=>d(``)),s.querySelector(`.ao3h-hbt-gp-close`).addEventListener(`click`,l),f.focus()}function Hn(e,t,n,r){let i=e.querySelector(`#${t}`);if(!i)return;i.style.display=`none`;let a=`${t}-custom`,o=e.querySelector(`#${a}`);if(!o){o=document.createElement(`div`),o.className=`ao3h-group-select`,o.id=a;let e=i.style;e.flex&&(o.style.flex=e.flex),e.minWidth&&(o.style.minWidth=e.minWidth);let t=document.createElement(`button`);t.type=`button`,t.className=`ao3h-group-select__trigger ao3h-config-input`;let n=document.createElement(`div`);n.className=`ao3h-group-select__panel`,n.hidden=!0,t.addEventListener(`click`,e=>{e.stopPropagation(),document.querySelectorAll(`.ao3h-group-select__panel`).forEach(e=>{e!==n&&(e.hidden=!0)}),n.hidden=!n.hidden}),o.appendChild(t),o.appendChild(n),i.insertAdjacentElement(`afterend`,o),o.dataset.outsideWired||(o.dataset.outsideWired=`1`,document.addEventListener(`click`,()=>{n.hidden=!0}))}let s=o.querySelector(`.ao3h-group-select__trigger`),c=o.querySelector(`.ao3h-group-select__panel`);function l(e){i.value=e,s.textContent=e===`__new__`?`+ New group`:e||`Group (optional)`,s.classList.toggle(`ao3h-group-select__trigger--active`,!!e),c.querySelectorAll(`.ao3h-group-select__option`).forEach(t=>t.classList.toggle(`ao3h-group-select__option--selected`,t.dataset.value===e)),i.dispatchEvent(new Event(`change`))}c.innerHTML=``;for(let e of[{value:``,label:`Group (optional)`},...n.map(e=>({value:e,label:e}))]){let t=document.createElement(`div`);t.className=`ao3h-group-select__option`+(e.value===r?` ao3h-group-select__option--selected`:``),t.textContent=e.label,t.dataset.value=e.value,t.addEventListener(`click`,()=>{l(e.value),c.hidden=!0}),c.appendChild(t)}let u=document.createElement(`div`);u.className=`ao3h-group-select__option ao3h-group-select__option--new`+(r===`__new__`?` ao3h-group-select__option--selected`:``),u.textContent=`+ New group`,u.dataset.value=`__new__`,u.addEventListener(`click`,()=>{l(`__new__`),c.hidden=!0}),c.appendChild(u),s.textContent=r===`__new__`?`+ New group`:r||`Group (optional)`,s.classList.toggle(`ao3h-group-select__trigger--active`,!!r)}var Un={_v:2,enabled:!0,quickAddIcon:!0,hideMode:`hide`,whitelistEnabled:!0,showWhitelistBadge:!0,whitelistMode:`show`,textFilterEnabled:!0,nopeHideMode:`hide`,nopeTargetSummaries:!0,nopeTargetNotes:!0,nopeTargetTitles:!1};function Wn(){try{let i=`${un()}:mod:hideByTags:settings`,a=localStorage.getItem(i),o=a?JSON.parse(a):null;if(!o||typeof o!=`object`){var e,t;localStorage.setItem(i,JSON.stringify(Un)),(e=ln.AO3H)==null||(e=e.store)==null||(t=e.set)==null||t.call(e,`mod:hideByTags:settings`,Un);return}if(!o._v||o._v<2){var n,r;o.whitelistEnabled===!1&&(o.whitelistEnabled=!0),o.textFilterEnabled===!1&&(o.textFilterEnabled=!0),o._v=2,localStorage.setItem(i,JSON.stringify(o)),(n=ln.AO3H)==null||(n=n.store)==null||(r=n.set)==null||r.call(n,`mod:hideByTags:settings`,o)}}catch{}}function Gn(e){Wn(),U(e);let t=(e.closest(`.ao3h-module-row`)||e.closest(`[data-module]`))?.querySelector(`input[type="checkbox"].ao3h-module-toggle, .ao3h-module-enable-toggle input`),n=e.querySelector(`[data-setting="enabled"]`),r=e.querySelector(`[data-setting="whitelistEnabled"]`),i=e.querySelector(`[data-setting="textFilterEnabled"]`),a=e.querySelector(`#ao3h-hideByTags-section-body`),o=e.querySelector(`#ao3h-hideByTags-below`),s=e.querySelector(`#ao3h-hideByTags-whitelist-body`),c=e.querySelector(`#ao3h-hideByTags-nope-body`),l=e.querySelector(`#ao3h-hideByTags-whitelist-behavior`),u=e.querySelector(`#ao3h-hideByTags-nope-behavior`),d=e.querySelector(`#ao3h-hideByTags-whitelist-below`),f=e.querySelector(`#ao3h-hideByTags-nope-below`);function p(e,t){e?.classList.toggle(`ao3h-section-disabled`,t)}function m(){let m=!(n!=null&&n.checked),h=!(r!=null&&r.checked),g=!(i!=null&&i.checked);if(p(a,m),p(o,m),p(e.querySelector(`[data-setting="quickAddIcon"]`)?.closest(`label`),m),p(e.querySelector(`[data-setting="showWhitelistBadge"]`)?.closest(`label`),h),p(s,h),p(l,h),p(d,h),p(c,g),p(u,g),p(f,g),t){let e=m&&h&&g;e&&t.checked?(t.checked=!1,t.dispatchEvent(new Event(`change`,{bubbles:!0}))):!e&&!t.checked&&(t.checked=!0,t.dispatchEvent(new Event(`change`,{bubbles:!0})))}}for(let e of[n,r,i])e&&!e.dataset.disableWired&&(e.dataset.disableWired=`1`,e.addEventListener(`change`,m));m();let h=e.querySelector(`#ao3h-hideByTags-search`);if(h&&!h.dataset.wired){h.dataset.wired=`1`;let t;h.addEventListener(`input`,()=>{clearTimeout(t),t=setTimeout(()=>U(e),150)})}let g=e.querySelector(`#ao3h-hideByTags-add-input`),_=e.querySelector(`#ao3h-hideByTags-add-group`),v=e.querySelector(`#ao3h-hideByTags-add-group-text`),ee=e.querySelector(`[data-action="add-tag"]`);function y(){let t=(g?.value||``).trim().toLowerCase(),n=_?.value===`__new__`?(v?.value||``).trim():(_?.value||``).trim();if(!t)return;let r=pn();if(r.includes(t)||(r.push(t),mn(r)),n){let e=hn();e[t]=n,gn(e),vn(_n().filter(e=>e!==n))}g&&(g.value=``),_?.value===`__new__`&&(v&&(v.value=``,v.style.display=`none`),_&&(_.value=``)),U(e)}_&&!_.dataset.wired&&(_.dataset.wired=`1`,_.addEventListener(`change`,()=>{if(!v)return;let e=_.value===`__new__`;v.style.display=e?`block`:`none`,e&&v.focus()})),v&&!v.dataset.wired&&(v.dataset.wired=`1`,v.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),y())})),g&&!g.dataset.wired&&(g.dataset.wired=`1`,g.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),y())})),ee&&!ee.dataset.wired&&(ee.dataset.wired=`1`,ee.addEventListener(`click`,e=>{e.preventDefault(),y()})),In(e),Ln(e);let b=e.querySelector(`#ao3h-hideByTags-whitelist-add-input`),x=e.querySelector(`#ao3h-hideByTags-whitelist-add-group`),S=e.querySelector(`#ao3h-hideByTags-whitelist-add-group-text`),te=e.querySelector(`[data-action="add-whitelist-tag"]`);function C(){let t=(b?.value||``).trim().toLowerCase(),n=x?.value===`__new__`?(S?.value||``).trim():(x?.value||``).trim();if(!t)return;let r=yn();if(r.includes(t)||(r.push(t),bn(r)),n){let e=Cn();e[t]=n,wn(e),En(Tn().filter(e=>e!==n))}b&&(b.value=``),x?.value===`__new__`&&(S&&(S.value=``,S.style.display=`none`),x&&(x.value=``)),In(e)}x&&!x.dataset.wired&&(x.dataset.wired=`1`,x.addEventListener(`change`,()=>{if(!S)return;let e=x.value===`__new__`;S.style.display=e?`block`:`none`,e&&S.focus()})),S&&!S.dataset.wired&&(S.dataset.wired=`1`,S.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),C())})),b&&!b.dataset.wired&&(b.dataset.wired=`1`,b.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),C())})),te&&!te.dataset.wired&&(te.dataset.wired=`1`,te.addEventListener(`click`,e=>{e.preventDefault(),C()}));let w=e.querySelector(`#ao3h-hideByTags-whitelist-new-group`),T=e.querySelector(`[data-action="add-whitelist-group"]`);function ne(){let t=(w?.value||``).trim();if(!t)return;let n=Tn();n.includes(t)||(n.push(t),En(n)),Mn.add(t),w&&(w.value=``),In(e)}w&&!w.dataset.wired&&(w.dataset.wired=`1`,w.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),ne())})),T&&!T.dataset.wired&&(T.dataset.wired=`1`,T.addEventListener(`click`,e=>{e.preventDefault(),ne()}));let E=e.querySelector(`#ao3h-hideByTags-nope-add-input`),D=e.querySelector(`#ao3h-hideByTags-nope-add-group`),O=e.querySelector(`#ao3h-hideByTags-nope-add-group-text`),re=e.querySelector(`[data-action="add-nope-word"]`);function ie(){let t=(E?.value||``).trim().toLowerCase(),n=D?.value===`__new__`?(O?.value||``).trim():(D?.value||``).trim();if(!t)return;let r=xn();if(r.includes(t)||(r.push(t),Sn(r)),n){let e=Dn();e[t]=n,On(e),An(kn().filter(e=>e!==n))}E&&(E.value=``),D?.value===`__new__`&&(O&&(O.value=``,O.style.display=`none`),D&&(D.value=``)),Ln(e)}D&&!D.dataset.wired&&(D.dataset.wired=`1`,D.addEventListener(`change`,()=>{if(!O)return;let e=D.value===`__new__`;O.style.display=e?`block`:`none`,e&&O.focus()})),O&&!O.dataset.wired&&(O.dataset.wired=`1`,O.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),ie())})),E&&!E.dataset.wired&&(E.dataset.wired=`1`,E.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),ie())})),re&&!re.dataset.wired&&(re.dataset.wired=`1`,re.addEventListener(`click`,e=>{e.preventDefault(),ie()}));let ae=e.querySelector(`#ao3h-hideByTags-nope-new-group`),oe=e.querySelector(`[data-action="add-nope-group"]`);function k(){let t=(ae?.value||``).trim();if(!t)return;let n=kn();n.includes(t)||(n.push(t),An(n)),Nn.add(t),ae&&(ae.value=``),Ln(e)}ae&&!ae.dataset.wired&&(ae.dataset.wired=`1`,ae.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),k())})),oe&&!oe.dataset.wired&&(oe.dataset.wired=`1`,oe.addEventListener(`click`,e=>{e.preventDefault(),k()}));function se(e,t){let n=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),r=document.createElement(`a`);r.href=URL.createObjectURL(n),r.download=t,r.click(),URL.revokeObjectURL(r.href)}function ce(e){let t=document.createElement(`input`);t.type=`file`,t.accept=`.json,application/json`,t.addEventListener(`change`,()=>{let n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=t=>{try{e(JSON.parse(t.target.result))}catch{alert(`Invalid JSON file.`)}},r.readAsText(n)}),t.click()}let le=e.querySelector(`[data-action="export-all"]`);le&&!le.dataset.wired&&(le.dataset.wired=`1`,le.addEventListener(`click`,e=>{e.preventDefault(),se({tags:pn(),groups:hn(),emptyGroups:_n()},`ao3h-hidden-tags.json`)}));let A=e.querySelector(`[data-action="import-all"]`);A&&!A.dataset.wired&&(A.dataset.wired=`1`,A.addEventListener(`click`,t=>{t.preventDefault(),ce(t=>{t.tags&&mn(t.tags),t.groups&&gn(t.groups),t.emptyGroups&&vn(t.emptyGroups),U(e)})}));let j=e.querySelector(`[data-action="export-whitelist"]`);j&&!j.dataset.wired&&(j.dataset.wired=`1`,j.addEventListener(`click`,e=>{e.preventDefault(),se({tags:yn(),groups:Cn(),emptyGroups:Tn()},`ao3h-whitelist.json`)}));let M=e.querySelector(`[data-action="import-whitelist"]`);M&&!M.dataset.wired&&(M.dataset.wired=`1`,M.addEventListener(`click`,t=>{t.preventDefault(),ce(t=>{Array.isArray(t)?bn(t):t!=null&&t.tags&&(bn(t.tags),t.groups&&wn(t.groups),t.emptyGroups&&En(t.emptyGroups)),In(e)})}));let ue=e.querySelector(`[data-action="export-nope"]`);ue&&!ue.dataset.wired&&(ue.dataset.wired=`1`,ue.addEventListener(`click`,e=>{e.preventDefault(),se({tags:xn(),groups:Dn(),emptyGroups:kn()},`ao3h-nope-words.json`)}));let de=e.querySelector(`[data-action="import-nope"]`);de&&!de.dataset.wired&&(de.dataset.wired=`1`,de.addEventListener(`click`,t=>{t.preventDefault(),ce(t=>{Array.isArray(t)?Sn(t):t!=null&&t.tags&&(Sn(t.tags),t.groups&&On(t.groups),t.emptyGroups&&An(t.emptyGroups)),Ln(e)})}));let fe=e.querySelector(`#ao3h-hideByTags-new-group`),pe=e.querySelector(`[data-action="add-group"]`);function N(){let t=(fe?.value||``).trim();if(!t)return;let n=_n();n.includes(t)||(n.push(t),vn(n)),jn.add(t),fe&&(fe.value=``),U(e)}fe&&!fe.dataset.wired&&(fe.dataset.wired=`1`,fe.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),N())})),pe&&!pe.dataset.wired&&(pe.dataset.wired=`1`,pe.addEventListener(`click`,e=>{e.preventDefault(),N()}))}document.addEventListener(`ao3h:configOpen`,e=>{e.detail?.moduleId===`hideByTags`&&Gn(e.target)});var Kn=`pageControls`,qn=`

                <!-- ─── JUMP TO PAGE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Jump To Page</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPlusMinus10Buttons" checked>
                            Show &plusmn;10 page buttons
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Add &ldquo;&minus;10&rdquo; and &ldquo;+10&rdquo; page jump buttons next to pagination</div>
                </div>

                <!-- ─── WORKS PER PAGE ─── -->
                </div><!-- /.ao3h-config-section: Jump To Page -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Works Per Page</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="worksPerPageEnabled" checked>
                            Enable works-per-page selector
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show a 20 / 50 / 100 density switcher above work listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default count</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="20"> 20 (AO3 default)</label>
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="50" checked> 50</label>
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="100"> 100</label>
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="200"> 200</label>
                    </div>
                </div>

                <!-- ─── INFINITE SCROLL ─── -->
                </div><!-- /.ao3h-config-section: Works Per Page -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Infinite Scroll</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="infiniteScrollEnabled">
                            Enable infinite scroll
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Jump-to-page controls are hidden when infinite scroll is active</div>
                </div>

                </div><!-- /.ao3h-config-section: Infinite Scroll -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Jn,Yn=`skipWorks`,Xn=`

                <!-- ─── DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Hidden Work Display</div>
                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Replace with</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="block" checked> Grey block (with note + options)</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="remove"> Remove completely</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Replace with -->
                <div class="ao3h-setting-description">Grey block shows the note + Show / Edit / Unhide buttons</div>
                </div><!-- /.ao3h-config-section: Hidden Work Display -->

                <!-- ─── QUICK NOTE PRESETS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Note Presets</div>
                <div class="ao3h-setting-description">Short labels offered as quick options when hiding a work. Click × to remove.</div>
                <div id="ao3h-skipWorks-presets-container" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-config-section: Quick Note Presets -->

                <!-- ─── LIST ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Skipped Works List</div>
                <div id="ao3h-skipWorks-list-container" class="ao3h-config-block"></div>
                <div class="ao3h-module-list-footer ao3h-config-block">
                    <span class="ao3h-module-list-count" id="ao3h-skipWorks-count"></span>
                </div>
                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-list">Import (JSON)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-list">Export (JSON)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-all">🗑️ Clear All</button>
                </div>
                </div><!-- /.ao3h-config-section: Skipped Works List -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Zn=((Jn=(typeof unsafeWindow<`u`?unsafeWindow:window).AO3H)==null||(Jn=Jn.env)==null?void 0:Jn.NS)||`ao3h`,Qn=E||null,$n=`m5QuickTagsUser`,er=`works`;function tr(){return S()||`guest`}var nr=null;function rr(){return new Promise((e,t)=>{if(nr){e(nr);return}let n=`ao3h-hiddenWorksDB-${tr()}`,r=indexedDB.open(n,1);r.onupgradeneeded=e=>{let t=e.target.result;if(!t.objectStoreNames.contains(er)){let e=t.createObjectStore(er,{keyPath:`workId`});e.createIndex(`reason`,`reason`,{unique:!1}),e.createIndex(`isHidden`,`isHidden`,{unique:!1})}},r.onsuccess=t=>{nr=t.target.result,e(nr)},r.onerror=e=>t(e.target.error)})}function ir(){return ar.apply(this,arguments)}function ar(){return ar=t(function*(){let e=yield rr();return new Promise((t,n)=>{let r=e.transaction(er,`readonly`).objectStore(er).getAll();r.onsuccess=()=>t(r.result||[]),r.onerror=e=>n(e.target.error)})}),ar.apply(this,arguments)}function or(e){return sr.apply(this,arguments)}function sr(){return sr=t(function*(e){let t=yield rr();return new Promise((n,r)=>{let i=t.transaction(er,`readonly`).objectStore(er).get(e);i.onsuccess=()=>n(i.result||null),i.onerror=e=>r(e.target.error)})}),sr.apply(this,arguments)}function cr(e){return lr.apply(this,arguments)}function lr(){return lr=t(function*(e){let t=yield rr();return new Promise((n,r)=>{let i=t.transaction(er,`readwrite`).objectStore(er).put(e);i.onsuccess=()=>n(),i.onerror=e=>r(e.target.error)})}),lr.apply(this,arguments)}function ur(){try{let e=Qn?Qn.getJSON($n,null):JSON.parse(localStorage.getItem(`${Zn}:${$n}`)||`null`);return Array.isArray(e)?e:[`Crossover`,`AU`,`Not my ship`,`Too long`,`Already read`]}catch{return[]}}function dr(e){try{Qn?Qn.setJSON($n,e):localStorage.setItem(`${Zn}:${$n}`,JSON.stringify(e))}catch{}}function fr(e){return pr.apply(this,arguments)}function pr(){return pr=t(function*(e){let n=e||document,r=n.querySelector(`#ao3h-skipWorks-list-container`)||document.getElementById(`ao3h-skipWorks-list-container`),i=n.querySelector(`#ao3h-skipWorks-count`)||document.getElementById(`ao3h-skipWorks-count`);if(!r)return;let a;try{a=yield ir()}catch(e){console.error(`[AO3H][skipWorks-config] Failed to load works list:`,e),r.innerHTML=`<p style="color:#c00;font-size:11px;padding:6px 0;margin:0;">⚠ Could not load skipped works list (${e?.message||e}).</p>`;return}let o=a.filter(e=>e.isHidden);if(i&&(i.textContent=`${o.length} work${o.length===1?``:`s`} skipped`),o.length===0){r.innerHTML=`<p style="color:#bbb;font-size:11px;font-style:italic;padding:6px 0;margin:0;">No works skipped yet.</p>`;return}let s=document.createElement(`div`);s.className=`ao3h-module-list ao3h-skipworks-list`;for(let e of o){let t=e.workId.replace(/^\/works\//,``).split(`/`)[0],n=document.createElement(`div`);n.className=`ao3h-module-list-entry ao3h-skipworks-entry`,n.dataset.workId=e.workId,n.innerHTML=`
      <div class="ao3h-module-list-entry-title">
        <a href="https://archiveofourown.org${e.workId}" target="_blank">Work #${t}</a>
      </div>
      ${e.reason?`<span class="ao3h-module-list-entry-badge ao3h-skipworks-note" data-full="${e.reason.replace(/"/g,`&quot;`)}">${e.reason}</span>`:``}
      <div class="ao3h-module-list-entry-actions">
        <button class="ao3h-inline-btn ao3h-inline-btn--danger" data-action="unhide">Unhide</button>
      </div>`,s.appendChild(n)}r.innerHTML=``,r.appendChild(s),requestAnimationFrame(()=>{r.querySelectorAll(`.ao3h-skipworks-note`).forEach(e=>{e.scrollWidth>e.offsetWidth&&e.classList.add(`ao3h-skipworks-note--truncated`)})}),r.addEventListener(`click`,e=>{let t=e.target.closest(`.ao3h-skipworks-note--truncated`);r.querySelectorAll(`.ao3h-skipworks-entry--note-open`).forEach(e=>e.classList.remove(`ao3h-skipworks-entry--note-open`)),t&&(e.stopPropagation(),t.closest(`.ao3h-skipworks-entry`).classList.add(`ao3h-skipworks-entry--note-open`))}),r.dataset.unhideWired||(r.dataset.unhideWired=`1`,r.addEventListener(`click`,function(){var e=t(function*(e){let t=e.target.closest(`[data-action="unhide"]`);if(!t)return;let n=t.closest(`.ao3h-skipworks-entry`).dataset.workId;if(!confirm(`Unhide this work permanently?`))return;let a=yield or(n);a&&(a.isHidden=!1,yield cr(a)),t.closest(`.ao3h-skipworks-entry`).remove();let o=r.querySelectorAll(`.ao3h-skipworks-entry`).length;i&&(i.textContent=`${o} work${o===1?``:`s`} skipped`),o===0&&(r.innerHTML=`<p style="color:#bbb;font-size:11px;font-style:italic;padding:6px 0;margin:0;">No works skipped yet.</p>`)});return function(t){return e.apply(this,arguments)}}()))}),pr.apply(this,arguments)}function mr(e){let t=e?e.querySelector(`#ao3h-skipWorks-presets-container`):document.getElementById(`ao3h-skipWorks-presets-container`);if(!t)return;function n(){let e=ur();t.innerHTML=`
      <div class="ao3h-skipworks-preset-add-row">
        <input type="text" class="ao3h-config-input ao3h-skipworks-preset-input" placeholder="Add a note preset…" maxlength="60">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-sw-preset-add">+ Add</button>
      </div>
      <div class="ao3h-skipworks-presets">
        ${e.map(e=>`<span class="ao3h-chip ao3h-chip--neutral ao3h-skipworks-preset-chip">${e}<button title="Remove" data-preset="${e.replace(/"/g,`&quot;`)}">×</button></span>`).join(``)}
      </div>`;let r=t.querySelector(`.ao3h-skipworks-preset-input`),i=t.querySelector(`.ao3h-sw-preset-add`),a=t.querySelector(`.ao3h-skipworks-presets`);function o(){let e=r.value.trim();if(!e)return;let t=ur();t.includes(e)||(t.push(e),dr(t)),r.value=``,n()}i.addEventListener(`click`,o),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),o())}),a.querySelectorAll(`button[data-preset]`).forEach(e=>{e.addEventListener(`click`,()=>{dr(ur().filter(t=>t!==e.dataset.preset)),n()})})}n()}function hr(e){let n=e.querySelector(`[data-action="clear-all"]`),r=e.querySelector(`[data-action="export-list"]`);n&&!n.dataset.swWired&&(n.dataset.swWired=`1`,n.addEventListener(`click`,function(){var n=t(function*(t){if(t.stopPropagation(),!confirm(`Clear all skipped works? This cannot be undone.`))return;let n=yield ir();for(let e of n)e.isHidden=!1,yield cr(e);yield fr(e),hr(e)});return function(e){return n.apply(this,arguments)}}())),r&&!r.dataset.swWired&&(r.dataset.swWired=`1`,r.addEventListener(`click`,function(){var e=t(function*(e){e.stopPropagation();let t=(yield ir()).filter(e=>e.isHidden),n=new Blob([JSON.stringify(t,null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`ao3h-skipped-works.json`,i.click(),setTimeout(()=>URL.revokeObjectURL(r),1e3)});return function(t){return e.apply(this,arguments)}}()));let i=e.querySelector(`[data-action="import-list"]`);i&&!i.dataset.swWired&&(i.dataset.swWired=`1`,i.addEventListener(`click`,n=>{n.stopPropagation();let r=document.createElement(`input`);r.type=`file`,r.accept=`application/json`,r.addEventListener(`change`,t(function*(){let t=r.files?.[0];if(t)try{let n=yield t.text(),r=JSON.parse(n);if(!Array.isArray(r))throw Error(`Not an array`);for(let e of r)e.workId&&(yield cr(e));yield fr(e),hr(e)}catch{alert(`Import failed: please select a valid JSON export file.`)}}),{once:!0}),r.click()}))}function gr(e){try{let t=localStorage.getItem(`ao3h:mod:skipWorks:settings`);if(!t)return;let n=JSON.parse(t);e.querySelectorAll(`[data-setting]`).forEach(e=>{let t=e.dataset.setting;t in n&&(e.type===`checkbox`?e.checked=!!n[t]:e.type===`radio`?e.checked=e.value===n[t]:e.value=n[t])})}catch{}}document.addEventListener(`ao3h:configOpen`,e=>{if(e.detail?.moduleId!==`skipWorks`)return;let t=e.detail?.configArea;t&&(gr(t),fr(t),mr(t),hr(t))});var _r=`tagsDisplay`,vr=`

                <!-- ─── TAG NOISE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoHideNoiseTags">
                            Auto-hide noise tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">~25 recognised filler expressions hidden automatically</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactMode">
                            Compact mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags + summaries collapsed, expand on hover</div>
                </div>

                <!-- ─── HIGHLIGHTING ─── -->
                </div><!-- /.ao3h-config-section: Tag Display -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Favourite Tag Highlighting</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightFavoriteTags" checked>
                            Highlight favourite tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Right-click any tag → "Highlight this tag" → choose style</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default highlight colour</label>
                    <div class="ao3h-setting-control ao3h-color-swatch-group">
                        <label class="ao3h-color-swatch-label" title="Yellow">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="0" checked>
                            <span class="ao3h-color-swatch" style="background:#fef9c3; border:2px solid #facc15;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Green">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="1">
                            <span class="ao3h-color-swatch" style="background:#dcfce7; border:2px solid #4ade80;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Blue">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="2">
                            <span class="ao3h-color-swatch" style="background:#dbeafe; border:2px solid #60a5fa;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Pink">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="3">
                            <span class="ao3h-color-swatch" style="background:#fce7f3; border:2px solid #f472b6;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Purple">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="4">
                            <span class="ao3h-color-swatch" style="background:#f3e8ff; border:2px solid #c084fc;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Orange">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="5">
                            <span class="ao3h-color-swatch" style="background:#fff7ed; border:2px solid #fb923c;"></span>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Colour used when you quick-highlight a tag (right-click to override per-tag)</div>
                </div>

                <!-- ─── ARCHIVE WARNING STYLE ─── -->
                </div><!-- /.ao3h-config-section: Favourite Tag Highlighting -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Archive Warning Style</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Display as</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="badge" checked> Badge</label>
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="text"> Text</label>
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="icon"> Icon</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactWarnings">
                            Compact archive warnings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Abbreviate warnings (e.g. &ldquo;MCD&rdquo; instead of full text)</div>
                </div>

                </div><!-- /.ao3h-config-section: Archive Warning Style -->

                <!-- ─── TAG LIMITS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Visibility</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max tags visible per work</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="0" checked> All</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="5"> 5</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="10"> 10</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="15"> 15</label>
                    </div>
                    <div class="ao3h-setting-description">Tags beyond the limit are hidden with a "+N more" link</div>
                </div>

                </div><!-- /.ao3h-config-section: Tag Visibility -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Data</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-backup</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoBackup">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Data -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,yr=`workLength`,br=`

    <!-- SECTION 1 -->
<div class="ao3h-config-section">
<div class="ao3h-config-section-title">
    Length Comparator
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showPageEquiv">
            Show page equivalent
        </label>
    </div>
    <div class="ao3h-setting-description">
        "~X pages" alongside the word count (275 words/page)
    </div>
</div>


<!-- SECTION 2 -->
</div><!-- /.ao3h-config-section: Length Comparator -->
<div class="ao3h-config-section">
<div class="ao3h-config-section-title">
    Reading Time Estimation
</div>

<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Reading speed</label>
    <div class="ao3h-setting-description">Used to compute reading time estimates.</div>
    <div class="ao3h-setting-control ao3h-radio-group">
        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="slow">
            Slow (150 wpm)
        </label>

        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="average" checked>
            Average (250 wpm)
        </label>

        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="fast">
            Fast (400 wpm)
        </label>

        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="custom">
            Custom:
            <input type="number"
                   class="ao3h-config-input"
                   data-setting="customWPM"
                   value="250"
                   min="50"
                   max="2000"
                   style="width:60px; margin-left:4px;"> wpm
        </label>
    </div>
</div>


<!-- BELOW -->
<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showEstimate" checked id="ao3h-wl-estimate">
            Show reading time estimate
        </label>
    </div>
    <div class="ao3h-setting-description">Master toggle — disabling this hides all time estimates.</div>
</div>

<div id="ao3h-wl-estimate-opts" class="ao3h-indent">
<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="estimateFicPage" checked>
            On fic pages
        </label>
    </div>
    <div class="ao3h-setting-description">
        ex: “3h15min read”
    </div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="estimatePerChapter" checked>
            Per chapter
        </label>
    </div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="estimateListings">
            On listings
        </label>
    </div>
    <div class="ao3h-setting-description">
        (results, bookmarks, etc)
    </div>
</div>
</div><!-- /#ao3h-wl-estimate-opts -->


<!-- SECTION 3 -->
</div><!-- /.ao3h-config-section: Reading Time Estimation -->
<div class="ao3h-config-section">
<div class="ao3h-config-section-title">
    Length Categories
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showLengthCategory" checked>
            Show length category label
        </label>
    </div>
    <div class="ao3h-setting-description">
        Displays a label next to word count: Short story / Novella / Novel
    </div>
</div>

<div class="ao3h-indent">
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Short story up to</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="thresholdShort" value="17500" min="1000" max="100000" style="width:80px;"> words
    </div>
</div>
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Novella up to</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="thresholdNovella" value="60000" min="1000" max="200000" style="width:80px;"> words
    </div>
    <div class="ao3h-setting-description">Above this threshold → Novel</div>
</div>
</div>

</div><!-- /.ao3h-config-section: Length Categories -->
<!-- FOOTER -->
<div class="ao3h-config-footer">
    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
    <button class="ao3h-config-save-btn">Save Settings</button>
</div>
`,xr=`chapterNavigation`,Sr=`

                <!-- ─── NAVIGATION ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Navigation</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="stickyNav">
                            Sticky navigation bar
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Previous/Next buttons always visible while reading</div>
                </div>
                </div><!-- /.ao3h-config-section: Navigation -->

                <!-- ─── QUICK NAVIGATION ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Navigation</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeButton" checked>
                            Resume button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adaptive label: "Start" / "Continue (Ch 5)" / "Continue (Ch 5) · 2 new"</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="lastChapterBtn" checked>
                            "Last chapter" button
                        </label>
                    </div>
                    <div class="ao3h-setting-description">e.g. "Last (Ch 47)"</div>
                </div>
                </div><!-- /.ao3h-config-section: Quick Navigation -->

                <!-- ─── WORD COUNT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Chapter Word Count</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterWordCount" checked>
                            Show current chapter word count
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Format: "X.XK words"</div>
                </div>
                </div><!-- /.ao3h-config-section: Chapter Word Count -->

                <!-- ─── AUTO SCROLL ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Auto Scroll</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoScrollShowControls" checked>
                            Show auto-scroll controls
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Display speed and play/pause controls while auto-scrolling</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default speed (px/s)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="autoScrollSpeed" value="50" min="5" max="500">
                    </div>
                    <div class="ao3h-setting-description">Pixels per second. Default: 50</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoScrollAutoAdvance">
                            Auto-advance to next chapter
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Automatically load the next chapter when scrolling reaches the end</div>
                </div>
                </div><!-- /.ao3h-config-section: Auto Scroll -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Cr=`collapseAuthorNotes`,wr=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Author Notes</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCollapseBeginning">
                            Auto-collapse beginning notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCollapseEnd">
                            Auto-collapse end notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoExpandWarnings" checked>
                            Always expand notes containing TW / CW / trigger warning / content warning
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Prevents safety information from being accidentally hidden</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCollectionBanners">
                            Hide collection banners
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides collection / gift / challenge banners</div>
                </div>
                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-apply filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoApply" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-save progress</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoSave" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Update interval (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="interval" value="30" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Tr=`instantFootnotes`,Er=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Trigger</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show footnote popup on</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="trigger">
                            <option value="hover">Hover</option>
                            <option value="click">Click</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Hover delay in (ms)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="delayIn" value="120" min="0" max="2000">
                    </div>
                    <div class="ao3h-setting-description">Delay before popup appears on hover</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Hover delay out (ms)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="delayOut" value="160" min="0" max="2000">
                    </div>
                    <div class="ao3h-setting-description">Delay before popup hides after cursor leaves</div>
                </div>
                </div><!-- /.ao3h-config-section: Trigger -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Popup</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max width (px)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="maxWidth" value="420" min="200" max="800">
                    </div>
                    <div class="ao3h-setting-description">Maximum width of the footnote popup</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Pin on click</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="pinOnClick" checked>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Clicking a footnote link pins the popup open (hover mode only)</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show &ldquo;Go to note&rdquo; link</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="showPermalink" checked>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show a link in the popup to scroll to the note in the text</div>
                </div>
                </div><!-- /.ao3h-config-section: Popup -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Dr=`readingFormatter`,Or=`

                <!-- ─── CLEANUP ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Text Cleanup</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCleanFormatting" checked>
                            Auto-clean formatting
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Double spaces, merged paragraphs, &lt;br&gt;&lt;br&gt; → real paragraphs</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="removeBoldExcessive">
                            Remove excessive bold
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Stylistic risk — author may intend the bold</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="convertSlashItalic">
                            Convert /text/ to italic
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Old fanfic italic convention</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="unifySceneBreaks" checked>
                            Unify scene separators
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Replaces ***, ---, ~~~ etc. with ✦ ✦ ✦</div>                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideEmbeddedImages">
                            Hide embedded images
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Text-only mode — hides &lt;img&gt; tags in work content</div>                </div>
                </div><!-- /.ao3h-config-section: Text Cleanup -->

                <!-- ─── DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Display</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sansSerifFont">
                            Sans-serif font
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Overrides the author's font choice</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="cleanReadingMode">
                            Clean reading mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Reduced margins, secondary elements hidden</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Text alignment</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-input" data-setting="textAlignment">
                            <option value="left">Left</option>
                            <option value="justify">Justified</option>
                            <option value="center">Center</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Paragraph spacing</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-setting-input" data-setting="paragraphSpacing" placeholder="e.g. 0.5em">
                    </div>
                    <div class="ao3h-setting-description">Extra margin between paragraphs (e.g. 0.5em, 1em)</div>
                </div>
                </div><!-- /.ao3h-config-section: Display -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,kr=`readingTracker`,Ar=`

                <!-- ─── SEEN WORKS MARKER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Seen Works Marker</div>

                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Display mode for seen works</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="mark" checked> Mark as seen (60% fade)</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="hide"> Hide from listings</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Display mode for seen works -->

                <!-- ─── EXCEPTIONS ─── -->
                </div><!-- /.ao3h-config-section: Seen Works Marker -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Exceptions — never mark as seen</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptBookmarks" checked>
                            Works in my bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptSubscribed" checked>
                            Works I'm subscribed to
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptMFL" checked>
                            Works in my Later Shelf
                        </label>
                    </div>
                </div>

                <!-- ─── HISTORY ─── -->
                </div><!-- /.ao3h-config-section: Exceptions — never mark as seen -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">History</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistory" checked>
                            Search in history
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="deleteEntry" checked>
                            Delete individual entries
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exportHistory" checked>
                            Export history (JSON)
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-ao3-history">⬇️ Import from AO3 History</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-history">🗑️ Clear History</button>
                </div>

                <!-- ─── READING PROGRESS ─── -->
                </div><!-- /.ao3h-config-section: History -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Reading Progress</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeToast" checked>
                            Resume toast on re-open
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterBadge" checked>
                            Clickable "Ch X/Y" badge on in-progress works
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeBanner" checked>
                            "📍 Resume at chapter X" banner on re-open
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="lastReadTime" checked>
                            Show last-read time in banner ("X days ago")
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="positionMarker" checked>
                            Last-read position marker line
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="floatingBadge" checked>
                            Floating progress badge while reading ("34%")
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-progress">✕ Clear reading progress for this work</button>
                </div>

                </div><!-- /.ao3h-config-section: Reading Progress -->

                <!-- ─── ADVANCED ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Advanced</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Seen works opacity</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="seenWorksOpacity"
                               min="0.2" max="1" step="0.1" value="0.6">
                        <span class="ao3h-range-value" data-for="seenWorksOpacity">60%</span>
                    </div>
                    <div class="ao3h-setting-description">Opacity when a work is marked as seen (lower = more faded)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyClearAll" checked>
                            Show "Clear all history" button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showClearProgressButton" checked>
                            Show "Clear progress" button per work
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Advanced -->

                <!-- ─── UPDATES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Updates</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="updatedBadge" checked>
                            &ldquo;Updated&rdquo; badge on recently-updated works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Highlights works with new chapters since your last visit</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="updatedOnlyMode">
                            Show only updated works in subscriptions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Filters your subscription inbox to show only works with new chapters</div>
                </div>

                </div><!-- /.ao3h-config-section: Updates -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-apply filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoApply" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-save progress</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoSave" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Update interval (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="interval" value="30" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,jr=`textToSpeech`,Mr=`

                <div class="ao3h-config-section">
                <!-- ─── SPEECH ENGINE ─── -->
                <div class="ao3h-config-section-title">Speech Engine</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Voice</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="voice" id="ao3h-tts-voice">
                            <option value="">System default…</option>
                        </select>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="preview-voice" title="Test voice">Preview</button>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Speech Engine -->

                <div class="ao3h-config-section">
                <!-- ─── PLAYBACK ─── -->
                <div class="ao3h-config-section-title">Playback</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Playback speed</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="playbackSpeed"
                               min="0.5" max="2" step="0.1" value="1">
                        <span class="ao3h-range-value" data-for="playbackSpeed">1×</span>
                    </div>
                    <div class="ao3h-setting-description">0.5× → 2×</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="stopOnPageChange" checked>
                            Stop on page change
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoNextChapter" checked>
                            Auto-read next chapter
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Playback -->

                <div class="ao3h-config-section">
                <!-- ─── VISUAL FEEDBACK ─── -->
                <div class="ao3h-config-section-title">Visual Feedback</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightSentence" checked>
                            Highlight current sentence
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoScroll" checked>
                            Auto-scroll to follow reading
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Visual Feedback -->

                <div class="ao3h-config-section">
                <!-- ─── CONTENT FILTERING ─── -->
                <div class="ao3h-config-section-title">Content Filtering</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="skipAuthorNotes" checked>
                            Skip author notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="skipSummary" checked>
                            Skip summary / preface
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Content Filtering -->

                <!-- ─── INTERFACE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Interface</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="floatingPanel" checked>
                            Floating playback panel
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Fixed-position panel that stays visible while scrolling</div>
                </div>
                </div><!-- /.ao3h-config-section: Interface -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Nr=`wordSwap`,Pr=`

                <div class="ao3h-config-section">
                <!-- ─── Y/N QUICK PRESET ─── -->
                <div class="ao3h-config-section-title">Y/N Quick Preset</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Your name (for reader-insert fics)</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="yourFirstName" placeholder="Your name…">
                    </div>
                    <div class="ao3h-setting-description">Creates a rule: Y/N → your name (case-sensitive, word boundary)</div>
                </div>
                </div><!-- /.ao3h-config-section: Y/N Quick Preset -->

                <div class="ao3h-config-section">
                <!-- ─── RULES ─── -->
                <div class="ao3h-config-section-title">Swap Rules</div>

                <div class="ao3h-setting-description">Each rule is a "find → replace" pair. Toggle or delete individual rules. Rules can be grouped by category / fandom. Rules are applied only inside work text (<code>#workskin .userstuff</code>).</div>

                <div id="ao3h-wordSwap-rules-container" class="ao3h-config-block">
                    <!-- Rendered by JS: rows of [original] → [replacement] + on/off toggle + × button -->
                </div>

                <div class="ao3h-config-row" style="margin-top: 6px;">
                    <input type="text" class="ao3h-config-input" id="ao3h-ws-new-from" placeholder="Find…" style="width: 90px;">
                    <span style="padding: 0 4px; color: #666;"> → </span>
                    <input type="text" class="ao3h-config-input" id="ao3h-ws-new-to" placeholder="Replace with…" style="width: 110px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-rule">+ Add rule</button>
                </div>

                <div class="ao3h-config-row" style="margin-top: 8px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-rules">Import Rules</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-rules">Export Rules (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Swap Rules -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Fr=`commentKit`,Ir=`

                <!-- ─── DRAFT MANAGEMENT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Draft Management</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="realtimeCounter" checked>
                            Live character / word counter
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showFloatingBox">
                            Floating comment box (stays visible while reading)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableAutoSave" checked>
                            Auto-save drafts (restored on reload)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enablePreview" checked>
                            Preview mode before posting
                        </label>
                    </div>
                </div>

                <!-- ─── COMPOSING ─── -->
                </div><!-- /.ao3h-config-section: Draft Management -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Composing</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showFormattingToolbar" checked>
                            Formatting toolbar (Bold / Italic / Link / Quote)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickTemplates">
                            Quick templates panel
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show customizable quick-comment template buttons</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="commentTemplates">
                            Comment templates
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Save reusable templates, insert from a "Manage templates" button</div>
                </div>

                <!-- ─── THREAD NAVIGATION ─── -->
                </div><!-- /.ao3h-config-section: Composing -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Thread Navigation</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="collapseExpandButtons" checked>
                            Collapse / expand buttons on each comment
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="unreadTracking">
                            Read / unread tracking ("NEW" badge)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightAuthorReplies">
                            Highlight author replies
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visually reinforces the author vs. reader distinction</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightRepliesToMe" checked>
                            Highlight replies to my comments
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="jumpToCommentsButton">
                            💬 "Jump to Comments" button
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Thread Navigation -->

                <!-- ─── COMMENT CONFIGURATION ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Comment Configuration</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterIndicator" checked>
                            Chapter badge on inbox comments
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows "Ch N" next to comments in your inbox so you know which chapter they're from</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="guestCommentsDefault">
                            Default "Allow guest comments" on new works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Auto-ticks the guest comment option when posting a new work</div>
                </div>

                </div><!-- /.ao3h-config-section: Comment Configuration -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Lr=`ficActions`,Rr=`

                <!-- ─── SUBSCRIBE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Subscribe</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="subscribeButtonBottom">
                            Subscribe button at bottom of page
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Duplicates the Subscribe button at the bottom of the page for easy access after reading</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="subscribeFromListings">
                            Quick subscribe from listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Add a 🔕 subscribe button to work blurbs in search results and listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSubscriptionStatus">
                            Show subscription status indicator
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show a 🔔 badge on blurbs for works you have subscribed to</div>
                </div>

                <!-- ─── HIDE BUTTONS ─── -->
                </div><!-- /.ao3h-config-section: Subscribe -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Hide Buttons</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideShare">
                            Hide &ldquo;Share&rdquo; button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBookmark">
                            Hide &ldquo;Bookmark&rdquo; button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideSubscribe">
                            Hide &ldquo;Subscribe&rdquo; button
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Hide Buttons -->

                <!-- ─── BUTTON ORDER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Button Order</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="buttonReordering" checked>
                            Enable button drag-and-drop reordering
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Drag buttons in the fic action bar to reorder them. Order is saved automatically.</div>
                </div>

                </div><!-- /.ao3h-config-section: Button Order -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,zr=`keyboardShortcuts`,Br=`

                <!-- ─── GLOBAL OPTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Global Options</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="customizationEnabled">
                            Enable shortcut remapping
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Enable customization of key bindings (coming soon).</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="allShortcutsDisabled">
                            Disable all shortcuts (emergency toggle)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Emergency kill switch — disables all keyboard shortcuts immediately.</div>
                </div>
                </div><!-- /.ao3h-config-section: Global Options -->

                <!-- ─── REFERENCE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Shortcut Bindings</div>
                <div class="ao3h-setting-description" style="margin-bottom: 8px;">Format: Ctrl+Key, Shift+Key, Ctrl+Shift+Key, or a single key. Leave empty to disable.</div>
                <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-top: 4px;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 1px solid var(--ao3h-border, #e5e7eb);">
                            <th style="padding: 3px 6px;">Action</th>
                            <th style="padding: 3px 6px;">Shortcut</th>
                            <th style="padding: 3px 6px;">Context</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 2px 6px;">Previous chapter</td><td style="padding: 2px 6px;"><input type="text" data-setting="prevChapter" value="Ctrl+ArrowLeft" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Next chapter</td><td style="padding: 2px 6px;"><input type="text" data-setting="nextChapter" value="Ctrl+ArrowRight" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Previous page</td><td style="padding: 2px 6px;"><input type="text" data-setting="prevPage" value="Shift+ArrowLeft" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Next page</td><td style="padding: 2px 6px;"><input type="text" data-setting="nextPage" value="Shift+ArrowRight" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Shortcut guide</td><td style="padding: 2px 6px;"><input type="text" data-setting="guide" value="?" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Everywhere</td></tr>
                        <tr><td style="padding: 2px 6px;">Surprise Me 🎲</td><td style="padding: 2px 6px;"><input type="text" data-setting="surpriseMe" value="Ctrl+Shift+R" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Subscribe</td><td style="padding: 2px 6px;"><input type="text" data-setting="subscribe" value="Ctrl+Shift+S" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Bookmark</td><td style="padding: 2px 6px;"><input type="text" data-setting="bookmark" value="Ctrl+Shift+B" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page / listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Mark for later</td><td style="padding: 2px 6px;"><input type="text" data-setting="markForLater" value="Ctrl+Shift+M" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page / listings</td></tr>
                    </tbody>
                </table>

                <div class="ao3h-config-row" style="margin-top: 10px; flex-wrap: wrap; gap: 6px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-shortcuts">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-shortcuts">Export (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Default Shortcuts -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Vr=`mainNavigation`,Hr=`

                <!-- ─── NAVBAR LINKS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Navbar Links</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="addNavLinks" checked>
                            Add Bookmarks / MFL / History to navbar
                        </label>
                    </div>
                    <div class="ao3h-setting-description">“History” opens AO3’s reading history at /users/[username]/readings.</div>
                </div>

                <!-- ─── QUICK LINKS ─── -->
                </div><!-- /.ao3h-config-section: Navbar Links -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Custom Quick Links</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickLinksEnabled">
                            Enable custom quick links
                        </label>
                    </div>
                    <div class="ao3h-setting-description">URL + label — up to 5 links. Free URL or fandom/pairing via autocomplete.</div>
                </div>

                ${[1,2,3,4,5].map(e=>`
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Link ${e}</label>
                    <div class="ao3h-setting-control" style="display:flex;gap:6px;flex-wrap:wrap;">
                        <input type="text" class="ao3h-config-input" data-setting="quickLink${e}Label" placeholder="Label" style="width:110px;">
                        <input type="url" class="ao3h-config-input" data-setting="quickLink${e}Url" placeholder="https://archiveofourown.org/..." style="min-width:230px;flex:1;">
                    </div>
                </div>`).join(``)}

                <!-- ─── MENU ACTIVATION ─── -->
                </div><!-- /.ao3h-config-section: Custom Quick Links -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Menu Activation</div>

                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Open menu</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="menuActivation" data-setting="menuActivation" value="hover" checked> On hover</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="menuActivation" data-setting="menuActivation" value="click"> On click only</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Open menu -->

                </div><!-- /.ao3h-config-section: Menu Activation -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Ur=`seriesHelper`,Wr=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Series Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="epicSeriesWarning">
                            "Epic Series" warning badge
                        </label>
                    </div>
                    <div class="ao3h-setting-description">“Epic Series” shown on series with 20+ works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="groupSeriesInSearch">
                            Group series works in search results
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Collapses works belonging to the same series</div>
                </div>

                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Behaviour</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable shortcuts</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableShortcuts" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable user filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableFilters" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Behaviour -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Gr=`userRelationships`,Kr=`

                <!-- ─── AUTHOR MANAGER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Author Manager</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="favoritesOnlyFilter">
                            Filter: favourite authors only
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-description">Favourite and hide controls are available beside authors on work listings.</div>

                <!-- ─── USER BLOCKER ─── -->
                </div><!-- /.ao3h-config-section: Author Manager -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">User Blocker</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPlaceholder" checked>
                            Show placeholder when content is hidden
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"[Hidden — Author blocked]" shown. Disable for silent removal.</div>
                </div>

                <div class="ao3h-indent">
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tempRevealHidden">
                            Temporarily reveal on click
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Click a placeholder to temporarily show the hidden work</div>
                </div>
                </div>

                <div class="ao3h-setting-description">Right-click a username to block it. The full list is available on profile and preferences pages.</div>

                </div><!-- /.ao3h-config-section: User Blocker -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,qr=`ficPeek`,Jr=`

                <!-- ─── TRIGGER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Trigger</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show preview on</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hoverMode" data-setting="hoverMode" value="hover" checked> Hover</label>
                        <label><input type="radio" name="hoverMode" data-setting="hoverMode" value="click"> Click</label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Hover delay (ms)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="hoverDelay" value="300" min="0" max="2000" step="50" style="width: 80px;">
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="spoilerFreeMode">
                            Spoiler-free mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides author notes and end-of-chapter notes from the preview</div>
                </div>

                </div><!-- /.ao3h-config-section: Trigger -->

                <!-- ─── EXCERPT LENGTH ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Excerpt Length</div>
                <div class="ao3h-setting-item ao3h-col1">
                    <label class="ao3h-setting-label">Excerpt length</label>
                    <div class="ao3h-setting-control ao3h-setting-control--radios">
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="paragraph" checked> First paragraph</label>
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="100words"> First 100 words</label>
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="250words"> First 250 words</label>
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="custom"> Custom word count</label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Custom word count</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="excerptCustomWords" value="150" min="10" max="1000" style="width: 80px;">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Excerpt Length -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analysis & Recommendations</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show detailed analysis</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="showDetails" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable recommendations</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableRecommendations" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max results</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="maxResults" value="10" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Analysis & Recommendations -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Yr=`povTracker`,Xr=`

                <!-- ─── BADGES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Badges</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBadgesOnBlurbs" checked>
                            Show POV badges on work blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Only shown for works that have already been analyzed</div>
                </div>
                <div class="ao3h-setting-item ao3h-indent">
                    <label class="ao3h-setting-label">Badge types to display</label>
                    <div class="ao3h-setting-control">
                        <label><input type="checkbox" data-setting="badgeFirst" checked> 1st person</label>
                        <label><input type="checkbox" data-setting="badgeSecond"> 2nd person</label>
                        <label><input type="checkbox" data-setting="badgeThird" checked> 3rd person</label>
                        <label><input type="checkbox" data-setting="badgeMixed"> Mixed</label>
                        <label><input type="checkbox" data-setting="badgeMulti"> Multi</label>
                        <label><input type="checkbox" data-setting="badgeUnknown"> Unknown</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Badges -->

                <!-- ─── FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enablePovFilters" checked>
                            Enable POV filters in listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds POV checkboxes to filter listings by narrative perspective</div>
                </div>
                </div><!-- /.ao3h-config-section: Filters -->

                <!-- ─── ANALYSIS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analysis</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoAnalyze" checked>
                            Auto-analyze on work page load
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showStats">
                            Show personal POV statistics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Summary of POV distribution across your reading history</div>
                </div>
                </div><!-- /.ao3h-config-section: Analysis -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Zr=`searchEnhancer`,Qr=`

                <!-- ─── TAG SUGGESTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Suggestions</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagSuggestions" checked>
                            Show related tag suggestions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags co-used with your current search tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyBasedSuggestions" checked>
                            Include suggestions from reading history
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="suggestionWorkCount" checked>
                            Show work count per suggestion
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"Slow Burn — 45K"</div>
                </div>
                </div><!-- /.ao3h-config-section: Tag Suggestions -->

                <!-- ─── AUTOCOMPLETE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Autocomplete & History</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistory" checked>
                            Search history (25 searches max)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagAutocomplete" checked>
                            Tag autocomplete (canonical AO3 tags)
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Autocomplete & History -->

                <!-- ─── SORTING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Result Sorting</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortByKudosRatio" checked>
                            Sort by kudos ratio
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortBySaveRate" checked>
                            Sort by save rate
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRatioInline" checked>
                            Show ratio next to stats
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Format: "12% eng." inline</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="groupSeriesInResults">
                            Group series in search results
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Default fandom sort</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="alpha" checked> Alphabetical</label>
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="popularity"> By size (most works first)</label>
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="history"> By reading history</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Result Sorting -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,$r=`similarFics`,ei=`

                <!-- ─── RESULTS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Results</div>
                <div class="ao3h-setting-item ao3h-col1">
                    <label class="ao3h-setting-label">Number of results</label>
                    <div class="ao3h-setting-control ao3h-setting-control--radios">
                        <label><input type="radio" name="numResults" data-setting="numResults" value="5"> 5</label>
                        <label><input type="radio" name="numResults" data-setting="numResults" value="10" checked> 10</label>
                        <label><input type="radio" name="numResults" data-setting="numResults" value="15"> 15</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Results -->

                <!-- ─── DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Display</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSimilarityScore" checked>
                            Show similarity score
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Displays a percentage match for each recommendation</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightCommonTags" checked>
                            Highlight common tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags shared with the current work are highlighted</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSummary" checked>
                            Show summary in panel
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Displays the work summary directly in the recommendations panel</div>
                </div>
                </div><!-- /.ao3h-config-section: Display -->

                <!-- ─── FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="includeWIP">
                            Include works in progress
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="openInNewTab">
                            Open recommendations in a new tab
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Filters -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,ti=`surpriseMe`,ni=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Options</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPreviewBeforeOpen">
                            Show preview before opening
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Title + summary + stats shown before opening the work</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="completedOnly">
                            Complete works only
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analysis & Recommendations</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show detailed analysis</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="showDetails" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable recommendations</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableRecommendations" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max results</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="maxResults" value="10" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Analysis & Recommendations -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,ri=`tropeGames`,ii=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Options</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showDailyTrope" checked>
                            Show daily trope banner on homepage
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Date-based daily trope, accessible from the AO3 Helper menu. Banner shown once per day.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="achievementsEnabled" checked>
                            Enable reading achievements
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Symbolic badges for reading habits (opt-in)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableBingo" checked>
                            Enable Trope Bingo card
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableRoulette" checked>
                            Enable Trope Roulette
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableStats" checked>
                            Enable Trope Statistics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Charts and counts of your most-read tropes</div>
                </div>

                </div><!-- /.ao3h-config-section: Options -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,ai=`activityPanel`,oi=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Optional Visualisation Features</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showTagCloud">
                            Show tag cloud
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visual view of your most-read tags (computed from full history)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="readingAchievements">
                            Enable reading achievements
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Milestone badges: 10K / 100K / 1M words read</div>
                </div>
                </div><!-- /.ao3h-config-section: Optional Visualisation Features -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>
                <div class="ao3h-setting-description">
                    Always visible:
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        <li>Works read · Kudos given · Bookmarks</li>
                        <li>Period selector: Today / 7d / 30d / Year / All</li>
                        <li>Export JSON + Refresh button</li>
                    </ul>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to _activityPanel.js
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Behaviour Settings</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Sort by</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="sortBy">
                            <option value="date-added">Date Added</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Behaviour Settings -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,si=`bookmarkVault`,ci=`

                <!-- ─── STATUS INDICATORS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Status Indicators</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPublicPrivateBadge" checked>
                            Badge ⭐/🔒 on blurbs
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showNoteIcon" checked>
                            Note icon 📝 if bookmark has notes
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tooltip shows the first 50–100 characters of the note</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showLastReadDate">
                            Show last-read date
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"Last read: X days ago" on bookmarked works</div>
                </div>

                <!-- ─── STATUS FILTER ─── -->
                </div><!-- /.ao3h-config-section: Status Indicators -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Bookmark Status Filter</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="bookmarkStatusFilterEnabled" id="ao3h-bv-statusFilter">
                            Enable status filter on listings
                        </label>
                    </div>
                </div>

                <div id="ao3h-bv-statusFilter-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Default view</label>
                        <div class="ao3h-setting-control ao3h-radio-group">
                            <label><input type="radio" name="statusFilterDefault" data-setting="bookmarkStatusFilterDefault" value="all" checked> All</label>
                            <label><input type="radio" name="statusFilterDefault" data-setting="bookmarkStatusFilterDefault" value="bookmarked"> Bookmarked only</label>
                            <label><input type="radio" name="statusFilterDefault" data-setting="bookmarkStatusFilterDefault" value="unbookmarked"> Not bookmarked</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="showStatusFilterCount">
                                Show counter
                            </label>
                        </div>
                    </div>
                </div>

                <!-- ─── NOTES ─── -->
                </div><!-- /.ao3h-config-section: Bookmark Status Filter -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Notes</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="inlineNoteEditing" checked>
                            Inline note editing
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Edit notes directly in listings and on work pages</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoFillBookmarkForm" checked>
                            Auto-fill bookmark form
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Pre-fills title, author, summary, work ID</div>
                </div>

                <!-- ─── ORGANISATION ─── -->
                </div><!-- /.ao3h-config-section: Notes -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Organisation</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="createCategories" checked>
                            Use bookmark categories/folders
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showCategoryLabels" checked>
                            Show category labels on bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="filterByCategory" checked>
                            Filter bookmarks by category
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideDeletedWorks">
                            Hide deleted/restricted works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Default: ⚠️ badge visible on unavailable works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="pinBookmarks">
                            Pin bookmarks to top of list
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="bulkSelection" checked>
                            Bulk selection
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Select multiple → delete, change visibility, assign category</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="privateByDefault">
                            Private bookmarks by default
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Organisation -->

                <!-- ─── QUICK ACTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Actions</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBackButton">
                            &ldquo;← Back to work&rdquo; button after bookmarking
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Returns you to the work page you bookmarked from</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showViewBookmarkLink" checked>
                            &ldquo;🔖 My Bookmark&rdquo; link on work pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Direct link to your bookmark on already-bookmarked works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoTagFandom">
                            Auto-tag bookmarks with fandom
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoTagRating">
                            Auto-tag bookmarks with rating
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showCompletionBadge" checked>
                            Completion badge on bookmark blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Colour-coded export-status badge (green &lt;30 days, orange ≥30 days)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showProgressRing">
                            Progress ring on bookmarked works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visual ring showing read-progress percentage</div>
                </div>

                </div><!-- /.ao3h-config-section: Quick Actions -->

                <!-- ─── ANALYTICS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analytics</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showAnalyticsDashboard">
                            Show bookmark analytics dashboard
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Top fandoms, tags, authors in your bookmarks</div>
                </div>

                </div><!-- /.ao3h-config-section: Analytics -->

                <!-- ─── ADVANCED ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Advanced</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="assignToCategories" checked>
                            Auto-assign bookmarks to categories
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Automatically assign new bookmarks to categories based on fandom/tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default sort order</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="defaultSort">
                            <option value="date" selected>Date added</option>
                            <option value="title">Title</option>
                            <option value="fandom">Fandom</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Advanced -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     Note: sortBy is already covered by defaultSort in Advanced section above.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Sync & Refresh</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Sync & Refresh -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,li=`fanficBingeMode`,ui=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Binge Session</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="continueReadingModal" checked>
                            &ldquo;Continue Reading?&rdquo; modal
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown at 95% scroll on the last chapter — suggests next fic, mark as read, bookmark</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Auto-advance delay (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="autoAdvanceDelay" value="0" min="0" max="60" style="width: 70px;">
                    </div>
                    <div class="ao3h-setting-description">Countdown before auto-advancing to the next work (0 = off). Automatically navigates to /works when it hits zero.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showHomepagePanel" checked>
                            &ldquo;Continue Reading&rdquo; panel on homepage
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Quick access to your most recently read works</div>
                </div>

                </div><!-- /.ao3h-config-section: Binge Session -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Discovery</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPostReadingSuggestions" checked>
                            Post-reading suggestions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Next in series · More by this author · More like this</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="queueEnabled">
                            Reading queue
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Build and manage a personal reading queue — add, reorder, remove works</div>
                </div>

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,di=`ficAppreciation`,fi=`

                <!-- ─── STATUS TRACKING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Status Tracking</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showManualCheckButton">
                            Manual &ldquo;Mark as read&rdquo; button on work pages
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="statusNotes">
                            Notes for reading status
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Attach a personal note to each status (Finished, Dropped, etc.)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideStatusFilter">
                            Hide status filter button on listings
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Status Tracking -->

                <!-- ─── COMPLETION TRACKER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Completion Tracker</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="completionNotes">
                            Completion notes
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Optional personal note when marking a work as finished</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="filterCompletedWorks" checked>
                            Filter finished works in listings
                        </label>
                    </div>
                </div>

                <!-- ─── KUDOS MANAGER ─── -->
                </div><!-- /.ao3h-config-section: Completion Tracker -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Kudos Manager</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickKudosButton">
                            Quick kudos button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Kudos a work without opening it</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="commentAssistOnRevisit">
                            Suggest a comment on re-visit
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Prompt only — never automatic</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideKudosedFilter">
                            Filter: hide already-kudosed works
                        </label>
                    </div>
                </div>

                <!-- ─── STAR RATINGS ─── -->
                </div><!-- /.ao3h-config-section: Kudos Manager -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Star Ratings</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRatingOnBlurbs">
                            Show my rating on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Star badge visible in search results and listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="ratingNotes">
                            Allow notes with ratings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Personal comment attached to each star rating</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Kudos icon</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="kudosIcon" value="♥" maxlength="4" style="width: 60px;">
                    </div>
                    <div class="ao3h-setting-description">Icon shown on the quick kudos button and blurb badge</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Tooltip date format</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="tooltipDateFormat">
                            <option value="relative" selected>Relative (e.g. &ldquo;3 days ago&rdquo;)</option>
                            <option value="short">Short (e.g. &ldquo;Jan 15&rdquo;)</option>
                            <option value="iso">ISO (YYYY-MM-DD)</option>
                        </select>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Star Ratings -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Sync & Refresh</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Sort by</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="sortBy">
                            <option value="date-added">Date Added</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Sync & Refresh -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,pi=`laterShelf`,mi=`

                <!-- ─── QUICK BUTTON ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Button</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickButton" checked>
                            Show 📌 button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown in all contexts, except works already bookmarked</div>
                </div>

                <!-- ─── REMINDERS ─── -->
                </div><!-- /.ao3h-config-section: Quick Button -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Work Reminders</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="remindersEnabled" id="ao3h-ls-reminders">
                            Enable work reminders
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Opt-in — in-browser notifications only. Set reminders per work from the MFL list.</div>
                </div>

                </div><!-- /.ao3h-config-section: Work Reminders -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Sync & Refresh</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Sort by</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="sortBy">
                            <option value="date-added">Date Added</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Sync & Refresh -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,hi=`notificationCenter`,gi=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Notifications</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="desktopNotifications">
                            Desktop notifications
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Browser permission required. Requires desktop notifications to be active.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="soundEffects">
                            Sound effects
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Active only when desktop notifications are enabled</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quietHoursEnabled" id="ao3h-nc-quiet">
                            Enable quiet hours
                        </label>
                    </div>
                </div>

                <div class="ao3h-indent" id="ao3h-nc-quiet-opts">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">From</label>
                    <div class="ao3h-setting-control">
                        <input type="time" data-setting="quietHoursStart" value="22:00" style="width: 90px;">
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">To</label>
                    <div class="ao3h-setting-control">
                        <input type="time" data-setting="quietHoursEnd" value="08:00" style="width: 90px;">
                    </div>
                </div>
                </div><!-- /#ao3h-nc-quiet-opts -->

                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Sync & Refresh</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Sort by</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="sortBy">
                            <option value="date-added">Date Added</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Sync & Refresh -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,_i=`readingDashboard`,vi=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Visible Widgets</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRecentWorks" checked>
                            Recent Works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Last fics you opened on AO3</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showWipTracker" checked>
                            Currently Reading / WIP Tracker
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Unfinished reads sorted by last activity</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showTopFandoms" checked>
                            Top Fandoms
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Your most-visited fandoms</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showTopTags" checked>
                            Top Tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Your most-read tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickLinks" checked>
                            Quick Links
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shortcuts to your AO3 pages</div>
                </div>
                </div><!-- /.ao3h-config-section: Visible Widgets -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Display Settings</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Recent works to display</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="recentWorksCount">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Top fandoms to display</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="topFandomsCount">
                            <option value="3">3</option>
                            <option value="6" selected>6</option>
                            <option value="10">10</option>
                        </select>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Display Settings -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,yi=`readingTimeline`,bi=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Appearance</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Heatmap colour</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="heatmapColor">
                            <option value="green" selected>Green (default)</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                            <option value="blue">Blue</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Color palette used for the activity heatmap</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Calendar range</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="calendarRange">
                            <option value="3">3 years</option>
                            <option value="5" selected>5 years (default)</option>
                            <option value="10">10 years</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">How many past years appear in the year selector</div>
                </div>
                </div><!-- /.ao3h-config-section: Appearance -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Default View</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Open timeline in</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="defaultView">
                            <option value="year" selected>Year heatmap</option>
                            <option value="month">Month detail</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Which view opens when you launch the timeline</div>
                </div>
                </div><!-- /.ao3h-config-section: Default View -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,xi=`backupAndSync`,Si=`

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Browser Sync</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="syncEnabled">
                            Sync via browser account
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Sync your AO3Helper data across devices using your browser's built-in sync (Chrome / Firefox). ~100 KB limit. Opt-in.</div>
                </div>
                </div><!-- /.ao3h-config-section -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableAutoBackup" checked>
                            Enable automatic backups
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Backup interval (minutes)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="backupInterval" value="15" min="1" max="60">
                    </div>
                    <div class="ao3h-setting-description">Default: every 15 minutes</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max backups kept</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="maxBackups" value="10" min="1" max="50">
                    </div>
                    <div class="ao3h-setting-description">Oldest backups deleted automatically when limit is reached</div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="backup-now">☁️ Backup Now</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-backup">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-backup">Export (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Ci=`ficDownloader`,wi=`

                <!-- ─── FORMAT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Default Download Format</div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Format</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="epub" checked> EPUB</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="mobi"> MOBI</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="azw3"> AZW3</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="pdf"> PDF</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="html"> HTML</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="txt"> TXT</label>
                    </div>
                </div>

                <!-- ─── KINDLE ─── -->
                </div><!-- /.ao3h-config-section: Default Download Format -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Send to Kindle</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sendToKindleEnabled" id="ao3h-dl-kindle">
                            Enable "Send to Kindle"
                        </label>
                    </div>
                </div>

                <div id="ao3h-dl-kindle-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Kindle email address</label>
                        <div class="ao3h-setting-control">
                            <input type="email" class="ao3h-config-input" data-setting="kindleEmail" placeholder="your-device@kindle.com">
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="autoKindleSend">
                                Auto-send on download
                            </label>
                        </div>
                    </div>
                </div>

                <!-- ─── BATCH DOWNLOAD ─── -->
                </div><!-- /.ao3h-config-section: Send to Kindle -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Batch Download</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Max works per batch</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="maxWorks" value="10" min="1" max="100" style="width: 80px;">
                    </div>
                    <div class="ao3h-setting-description">Maximum number of works downloaded in a single batch operation</div>
                </div>

                </div><!-- /.ao3h-config-section: Batch Download -->

                <!-- ─── AUTO-CACHE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Auto-Cache</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCacheMFL">
                            Auto-cache "Later Shelf" works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Silently downloads MFL works in the background for offline access</div>
                </div>

                </div><!-- /.ao3h-config-section: Auto-Cache -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Styling</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable custom styles</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="customStyles" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Styling -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Ti=`themeBuilder`,Ei=`

                <!-- ─── VISUAL THEME ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Visual Theme</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Accent colour</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="accentColor" value="#990000">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Background</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="bgColor" value="#ffffff">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Text colour</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="textColor" value="#333333">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Link colour</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="linkColor" value="#2a5298">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Header background</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="headerBg" value="#333333">
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Visual Theme -->

                <!-- ─── TYPOGRAPHY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Typography</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Base font size</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="fontSize" min="0.8" max="2.0" step="0.1" value="1.0">
                        <span class="ao3h-range-value" data-for="fontSize">1.0em</span>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Line height</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="lineHeight" min="1.2" max="2.4" step="0.1" value="1.5">
                        <span class="ao3h-range-value" data-for="lineHeight">1.6</span>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Typography -->

                <!-- ─── BUILDER MODE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Builder Mode</div>
                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Editor mode</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="editorMode" data-setting="mode" value="visual" checked> Visual builder (sliders + pickers)</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="editorMode" data-setting="mode" value="css"> CSS editor (full control)</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Editor mode -->
                </div><!-- /.ao3h-config-section: Builder Mode -->

                <!-- ─── IMPORT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Import a Theme</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="importEnabled" checked>
                            Import from
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-theme">Import theme (file or URL)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-theme">Export current theme</button>
                </div>
                </div><!-- /.ao3h-config-section: Import a Theme -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Styling</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable custom styles</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="customStyles" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Styling -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,Di=`visualPreferences`,Oi=`

                <!-- ─── ENGAGEMENT STATS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Engagement Stats</div>
                <div class="ao3h-setting-description">Hidden stats are revealed on hover.</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideWordCount">
                            Hide word count
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideKudosCount">
                            Hide kudos
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCommentsCount">
                            Hide comments
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBookmarksCount">
                            Hide bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideHits">
                            Hide hits
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Engagement Stats -->

                <!-- ─── DATES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Dates</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hidePublishedDate">
                            Hide published date
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideUpdatedDate">
                            Hide updated date
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCompletedDate">
                            Hide completed date
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideChapterDates">
                            Hide chapter dates
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Dates -->

                <!-- ─── LAYOUT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Layout</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="minimalHeader">
                            Minimal header
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides the AO3 banner, reduces header height</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideStatsOnChaptersList">
                            Hide stats on chapters list
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Word counts, comment counts, dates on the chapter list view</div>
                </div>

                </div><!-- /.ao3h-config-section: Layout -->

                <!-- ─── STATS DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Stats Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="statsAsIcons">
                            Show stats as icons
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Replace stat labels with emoji icons (📝 📖 💬 ❤️ 🔖 👁)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-label">Icons mode</div>
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="statsIconsMode" data-setting="statsIconsMode" value="icons"> Icons only</label>
                        <label><input type="radio" name="statsIconsMode" data-setting="statsIconsMode" value="icons-text"> Icons + text</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="relativeDates">
                            Show relative dates
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Display "4 years ago" instead of absolute dates (hover to see original)</div>
                </div>

                </div><!-- /.ao3h-config-section: Stats Display -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Styling</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable custom styles</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="customStyles" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Styling -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,ki={[Vt]:Ht,[Ut]:Wt,[Gt]:Kt,[sn]:cn,[Kn]:qn,[Yn]:Xn,[_r]:vr,[yr]:br,[xr]:Sr,[Cr]:wr,[Tr]:Er,[Dr]:Or,[kr]:Ar,[jr]:Mr,[Nr]:Pr,[Fr]:Ir,[Lr]:Rr,[zr]:Br,[Vr]:Hr,[Ur]:Wr,[Gr]:Kr,[qr]:Jr,[Yr]:Xr,[Zr]:Qr,[$r]:ei,[ti]:ni,[ri]:ii,[ai]:oi,[si]:ci,[li]:ui,[di]:fi,[pi]:mi,[hi]:gi,[_i]:vi,[yi]:bi,[xi]:Si,[Ci]:wi,[Ti]:Ei,[Di]:Oi};function Ai(e){return ki[e]||ki._default}function ji(){return Object.keys(ki).filter(e=>e!==`_default`&&typeof ki[e]==`string`)}var Mi={};typeof on==`function`&&(Mi[Gt]=on),typeof Gn==`function`&&(Mi[sn]=Gn);function Ni(e,t){let n=Mi[e];typeof n==`function`&&n(t)}console.log(`[AO3H][panel-configs] Panel configs index loaded - `+ji().length+` modules registered`);var Pi=typeof unsafeWindow<`u`?unsafeWindow:window,W={pendingSaves:0,dirty:!1,_savedTimer:null};function Fi(){return Nt?.length||0}function Ii(){var e,t,n,r;let i=window.AO3H?.flags||Pi.AO3H?.flags,a=((e=window.AO3H)==null||(e=e.modules)==null||(t=e.all)==null?void 0:t.call(e))||((n=Pi.AO3H)==null||(n=n.modules)==null||(r=n.all)==null?void 0:r.call(n))||[];return!i||typeof i.get!=`function`||!a.length?a.filter(e=>e?._booted).length:a.reduce((e,t)=>{var n;let r=t?.enabledKey||`mod:${t?.name}:enabled`,a=!!(!(t==null||(n=t.meta)==null)&&n.enabledByDefault);return e+ +!!i.get(r,a)},0)}function Li(){let e=document.getElementById(`ao3h-panel-footer-status`);e&&(e.innerHTML=`<strong>${Ii()}</strong> enabled · ${Fi()} modules total · ${W.dirty?`<span class="ao3h-footer-unsaved">Unsaved changes</span>`:`All changes saved`}`)}function Ri(){W.pendingSaves+=1,W.dirty=!0,clearTimeout(W._savedTimer),Li()}function zi(e){if(W.pendingSaves>0&&--W.pendingSaves,e===!1){W.dirty=!0,Li();return}clearTimeout(W._savedTimer),W._savedTimer=setTimeout(()=>{W.pendingSaves===0&&(W.dirty=!1),Li()},1500)}function Bi(){document.querySelectorAll(`[data-config-module]`).forEach(e=>{let t=e.dataset.configModule,n=Ai(t)||``;n&&(e.innerHTML=n,Ni(t,e))})}function Vi(e,t){e.addEventListener(`click`,Ft),t.querySelectorAll(`.${B}-panel-close, .ao3h-footer-close`).forEach(e=>{e.addEventListener(`click`,Ft)});let n=function(e){e.key===`Escape`&&(Ft(),document.removeEventListener(`keydown`,n))};document.addEventListener(`keydown`,n),console.log(`[AO3H][tab-system] ✅ Close handlers attached`)}function Hi(e,t){var n;let r=e.closest(`.${B}-panel-body`),i=r==null||(n=r.parentElement)==null?void 0:n.querySelector(`.${B}-bulk-actions`);i&&i.remove();let a=document.createElement(`div`);a.className=`${B}-bulk-actions`,a.innerHTML=`
      <div class="note-box ao3h-footer-status" id="ao3h-panel-footer-status" aria-live="polite"></div>
      <button class="ao3h-panel-action-btn ao3h-footer-save-close">Save &amp; Close</button>
    `,r!=null&&r.parentElement&&(r.parentElement.appendChild(a),a.querySelector(`.ao3h-footer-save-close`).addEventListener(`click`,qi)),Li(),(r?.closest(`.${B}-panel-box`))?.querySelectorAll(`.ao3h-bulk-actions-buttons .ao3h-panel-action-btn[data-action]`).forEach(t=>{let n=t.cloneNode(!0);t.replaceWith(n),n.addEventListener(`click`,function(){let t=this.getAttribute(`data-action`),n=e.querySelectorAll(`.ao3h-quick-enable-checkbox`),r=t===`enable-all`;n.forEach(e=>{e.checked=r,e.dispatchEvent(new Event(`change`,{bubbles:!0}))}),console.log(`[AO3H][tab-system] ${t}: ${n.length} modules`)})}),console.log(`[AO3H][tab-system] ✅ Bulk actions setup for tab:`,t)}function Ui(e){e.querySelectorAll(`.ao3h-picker-row`).forEach(e=>{let t=e.querySelector(`.ao3h-picker`),n=e.querySelector(`[data-action^="add"]`),r=e.parentElement.querySelector(`.ao3h-chip-container`);if(!t||!n||!r)return;let i=t.dataset.pickerType||`item`,a=[];try{let e=r.dataset.value;e&&(a=JSON.parse(e))}catch{}function o(){r.innerHTML=``,a.forEach(e=>{let n=t.querySelector(`option[value="${e}"]`);c(e,n?n.textContent:e,!1)}),s()}function s(){r.dataset.value=JSON.stringify(a),r.dispatchEvent(new CustomEvent(`chipsChanged`,{detail:{type:i,items:a},bubbles:!0}))}function c(e,t,n=!0){n&&!a.includes(e)&&a.push(e);let o=document.createElement(`span`);o.className=`ao3h-chip`,o.dataset.value=e,o.innerHTML=`${t} <button type="button" title="Remove ${t}" aria-label="Remove ${t}">×</button>`,o.querySelector(`button`).addEventListener(`click`,()=>{o.remove(),a=a.filter(t=>t!==e),s(),console.log(`[AO3H][chip-picker:${i}] Removed:`,e)}),r.appendChild(o)}function l(){let e=t.value;if(!e)return;let n=t.options[t.selectedIndex]?.text;if(a.includes(e)){console.log(`[AO3H][chip-picker:${i}] Already added:`,e);return}c(e,n,!0),s(),t.selectedIndex=0,console.log(`[AO3H][chip-picker:${i}] Added:`,e,`| Total:`,a.length)}n.addEventListener(`click`,l),t.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),l())}),o(),console.log(`[AO3H][tab-system] ✅ Chip picker setup (${i})`)})}function Wi(e){e.querySelectorAll(`.ao3h-config-reset-btn`).forEach(e=>{let t=null,n=e.textContent.trim(),r=e.dataset.fullReset===`true`;e.addEventListener(`click`,function(){if(this.classList.contains(`ao3h-reset-confirming`))if(clearTimeout(t),this.classList.remove(`ao3h-reset-confirming`),this.textContent=n,r){try{Object.keys(localStorage).filter(e=>e.startsWith(`ao3h`)).forEach(e=>localStorage.removeItem(e))}catch{}location.reload()}else{let e=this.closest(`.ao3h-module-config-area`);e&&e.querySelectorAll(`input, select, textarea`).forEach(e=>{e.type===`checkbox`||e.type===`radio`?e.checked=e.defaultChecked:e.tagName===`SELECT`?Array.from(e.options).forEach(e=>{e.selected=e.defaultSelected}):e.value=e.defaultValue,e.dispatchEvent(new Event(`change`,{bubbles:!0}))}),console.log(`[AO3H][tab-system] Module reset confirmed`)}else this.classList.add(`ao3h-reset-confirming`),this.textContent=r?`⚠ Reset everything?`:`⚠ Confirm reset?`,t=setTimeout(()=>{this.classList.remove(`ao3h-reset-confirming`),this.textContent=n},3e3)})})}function Gi(e){return Ki.apply(this,arguments)}function Ki(){return Ki=t(function*(e){let t=e.dataset.configModule;if(!t)return;let n=e.querySelectorAll(`[data-setting]`),r={},i=new Set;n.forEach(t=>{let n=t.dataset.setting;if(n)if(t.type===`checkbox`)r[n]=t.checked;else if(t.type===`radio`){if(!i.has(n)){i.add(n);let t=e.querySelector(`input[type="radio"][data-setting="${n}"]:checked`);t&&(r[n]=t.value)}}else r[n]=t.value});let a=window.AO3H?.settings||Pi.AO3H?.settings;if(a)yield a.set(t,r);else{let e=`ao3h:mod:${t}:settings`,n=JSON.parse(localStorage.getItem(e)||`{}`);localStorage.setItem(e,JSON.stringify(Object.assign({},n,r)))}document.dispatchEvent(new CustomEvent(`ao3h:settingsChanged`,{bubbles:!1,detail:{moduleId:t,settings:r}}))}),Ki.apply(this,arguments)}function qi(){return Ji.apply(this,arguments)}function Ji(){return Ji=t(function*(){let e=document.querySelectorAll(`.ao3h-module-config-area`);for(let t of e)try{yield Gi(t)}catch(e){console.error(`[AO3H][tab-system] Save failed for`,t.dataset.configModule,e)}W.dirty=!1,W.pendingSaves=0,Ft()}),Ji.apply(this,arguments)}function Yi(e){e.querySelectorAll(`[data-config-module]`).forEach(e=>{let t=e.dataset.configModule;if(t)try{let n=localStorage.getItem(`ao3h:mod:${t}:settings`);if(!n)return;let r=JSON.parse(n);e.querySelectorAll(`[data-setting]`).forEach(e=>{let t=e.dataset.setting;t in r&&(e.type===`checkbox`?e.checked=!!r[t]:e.type===`radio`?e.checked=e.value===r[t]:e.value=r[t])})}catch{}})}function Xi(e){e.querySelectorAll(`.ao3h-module-config-area`).forEach(e=>{e.dataset.autoSaveWired||(e.dataset.autoSaveWired=`1`,e.addEventListener(`change`,e=>{e.target.closest(`[data-setting]`)&&(W.dirty=!0,clearTimeout(W._savedTimer),Li())}))})}function Zi(e){e.querySelectorAll(`.ao3h-config-save-btn`).forEach(e=>{e.addEventListener(`click`,t(function*(){let e=this.closest(`.ao3h-module-config-area`);if(!e||!e.dataset.configModule)return;Ri();try{yield Gi(e),zi(!0)}catch(t){zi(!1),console.error(`[AO3H][tab-system] Save failed for`,e.dataset.configModule,t);return}let t=this.textContent;this.textContent=`✓ Saved`,this.classList.add(`ao3h-save-success`),setTimeout(()=>{this.textContent=t,this.classList.remove(`ao3h-save-success`)},1500)}))})}function Qi(e){e.querySelectorAll(`.ao3h-config-btn`).forEach(e=>{e.setAttribute(`aria-label`,`Module settings`),e.setAttribute(`aria-expanded`,`false`),e.addEventListener(`click`,function(e){e.stopPropagation();let t=this.closest(`.ao3h-module-container`),n=t.querySelector(`.ao3h-module-config-area`);if(n){let e=n.classList.contains(`ao3h-expanded`);if(n.classList.toggle(`ao3h-expanded`),this.textContent=e?`▼`:`▲`,this.setAttribute(`aria-expanded`,e?`false`:`true`),!e){let e=t.dataset.moduleId;Ni(e,n),n.dispatchEvent(new CustomEvent(`ao3h:configOpen`,{bubbles:!0,detail:{moduleId:e,configArea:n}})),setTimeout(()=>{typeof window.AO3H_wireHelpButtons==`function`&&window.AO3H_wireHelpButtons(n)},0),setTimeout(()=>{let e=document.querySelector(`#ao3h-tab-container`);if(!e)return;let n=t.getBoundingClientRect(),r=e.getBoundingClientRect(),i=n.top-r.top;Math.abs(i)>5&&e.scrollBy({top:i,behavior:`smooth`})},450)}console.log(`[AO3H][tab-system] Config toggled:`,e?`closed`:`opened`)}})})}function $i(e){e.querySelectorAll(`.ao3h-module-row`).forEach(e=>{let n=e.closest(`.ao3h-module-container`)?.dataset.moduleId,r=e.querySelector(`.ao3h-quick-enable-checkbox`);if(r&&n){var i,a,o,s;let c=((i=e.querySelector(`.ao3h-module-name`))==null||(i=i.textContent)==null?void 0:i.trim())||n;r.setAttribute(`aria-label`,`Enable ${c}`);let l=window.AO3H?.flags||Pi.AO3H?.flags,u=window.AO3H?.modules,d=u==null||(a=u.all)==null||(a=a.call(u))==null||(o=a.find)==null?void 0:o.call(a,e=>e.name===n),f=!!(!(d==null||(s=d.meta)==null)&&s.enabledByDefault);r.checked=l?!!l.get(`mod:${n}:enabled`,f):f,r.addEventListener(`change`,t(function*(){if(n){try{let e=Pi.AO3H?.modules||window.AO3H?.modules;e!=null&&e.setEnabled&&(yield e.setEnabled(n,this.checked)),Li()}catch(e){console.error(`[AO3H][tab-system] setEnabled failed for`,n,e)}document.dispatchEvent(new CustomEvent(`ao3h:flags-updated`,{detail:{key:`mod:${n}:enabled`,value:this.checked}})),console.log(`[AO3H][tab-system]`,n,this.checked?`enabled`:`disabled`)}})),document.addEventListener(`ao3h:flags-updated`,function(e){e.detail?.key===`mod:${n}:enabled`&&(r.checked=!!e.detail.value)})}e.addEventListener(`click`,function(e){if(e.target.closest(`.ao3h-module-quick-toggle`))return;let t=this.closest(`.ao3h-module-container`).querySelector(`.ao3h-config-btn`);t&&t.click()})})}function ea(e,t){console.log(`[AO3H][tab-system] 📥 Loading tab:`,e);let n=Bt[e];if(!n){t.innerHTML=`<p style="color: #d32f2f;">❌ Unknown tab: ${e}</p>`;return}t.style.transition=`opacity 0.2s ease-out`,t.style.opacity=`0`,setTimeout(()=>{t.innerHTML=n,t.scrollTop=0,Bi(),Yi(t),setTimeout(()=>{t.style.opacity=`1`,Qi(t),Wi(t),Zi(t),Xi(t),$i(t),Ui(t)},20),setTimeout(()=>{if(e!==`about`)Hi(t,e);else{let e=document.querySelector(`.${B}-bulk-actions`);e&&e.remove();let n=t.closest(`.${B}-panel-body`);if(n!=null&&n.parentElement){let e=document.createElement(`div`);e.className=`${B}-bulk-actions`,e.innerHTML=`
              <div class="note-box ao3h-footer-status" id="ao3h-panel-footer-status" aria-live="polite"></div>
              <button class="ao3h-panel-action-btn ao3h-footer-close">Close</button>
            `,n.parentElement.appendChild(e),Li()}ta(t)}},10)},200),typeof window.initializeTabInteractivity==`function`&&window.initializeTabInteractivity(),console.log(`[AO3H][tab-system] ✅ Tab content loaded:`,e)}function ta(e){var t,n;let r=e.querySelector(`#ao3h-pinned-module`),i=e.querySelector(`#ao3h-pin-save-btn`);if(!r||!i)return;let a=((t=window.AO3H)==null||(t=t.modules)==null||(n=t.all)==null?void 0:n.call(t))||[];for(let{name:e,meta:t}of a){let n=document.createElement(`option`);n.value=e,n.textContent=t?.title||e,r.appendChild(n)}let o=localStorage.getItem(`ao3h:pinnedModule`);o&&r.querySelector(`option[value="${o}"]`)&&(r.value=o),i.addEventListener(`click`,()=>{let e=r.value;e?localStorage.setItem(`ao3h:pinnedModule`,e):localStorage.removeItem(`ao3h:pinnedModule`);let t=i.textContent;i.textContent=`✓ Saved`,setTimeout(()=>{i.textContent=t},1500)})}function na(e){console.log(`[AO3H][tab-system] Setting up tab switching`);let t=e.querySelectorAll(`.${B}-tab-btn`),n=e.querySelector(`#${B}-tab-container`);t.forEach(e=>{e.addEventListener(`click`,function(){let e=this.getAttribute(`data-tab`);t.forEach(e=>{e.classList.remove(`${B}-tab-active`),e.setAttribute(`aria-selected`,`false`)}),this.classList.add(`${B}-tab-active`),this.setAttribute(`aria-selected`,`true`),n.setAttribute(`aria-labelledby`,`${B}-tab-btn-${e}`),ea(e,n),console.log(`[AO3H][tab-system] Switched to tab:`,e)})});let r=e.querySelector(`.ao3h-tab-btn.ao3h-tab-active`)||t[0],i=r?r.getAttribute(`data-tab`):`browse`;t.forEach(e=>e.setAttribute(`aria-selected`,e===r?`true`:`false`)),r&&n.setAttribute(`aria-labelledby`,`${B}-tab-btn-${i}`),console.log(`[AO3H][tab-system] Loading initial tab:`,i),ea(i,n)}function ra(e){let t=e.querySelector(`#${B}-tab-container`),n=e.querySelector(`#${B}-global-search`);if(!n||!t){console.warn(`[AO3H][global-search] Search input or tab container not found`);return}function r(){return Nt||[]}let i=e.querySelector(`.ao3h-tab-btn.ao3h-tab-active`)||e.querySelector(`.ao3h-tab-btn`),a=i?i.getAttribute(`data-tab`):`browse`;e.querySelectorAll(`.${B}-tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{a=e.getAttribute(`data-tab`),n.value=``})});let o;n.addEventListener(`input`,()=>{clearTimeout(o),o=setTimeout(()=>{let i=n.value.trim().toLowerCase(),o=r();if(!i){e.querySelectorAll(`.${B}-tab-btn`).forEach(e=>{e.classList.toggle(`${B}-tab-active`,e.getAttribute(`data-tab`)===a)}),ea(a,t);return}e.querySelectorAll(`.${B}-tab-btn`).forEach(e=>e.classList.remove(`${B}-tab-active`)),s(o.filter(e=>(e.title||``).toLowerCase().includes(i)||(e.desc||``).toLowerCase().includes(i)||(e.id||``).toLowerCase().includes(i)||(e.tabLabel||``).toLowerCase().includes(i)),i,t)},150)});function s(e,t,n){let r;r=e.length===0?`<p class="ao3h-search-no-results">No modules found for "<strong>${t}</strong>"</p>`:e.map(e=>`
        <div class="ao3h-module-container" data-module-id="${e.id}">
          <div class="ao3h-module-row">
            <label class="ao3h-module-quick-toggle" onclick="event.stopPropagation()">
              <input type="checkbox" class="ao3h-quick-enable-checkbox">
            </label>
            <div class="ao3h-module-info">
              <div class="ao3h-module-name">${e.title}</div>
              <div class="ao3h-module-desc">${e.desc}</div>
            </div>
            <div class="ao3h-module-controls">
              <span class="ao3h-search-tab-badge">${e.tabLabel}</span>
              <button class="ao3h-config-btn">▼</button>
            </div>
          </div>
          <div class="ao3h-module-config-area" data-config-module="${e.id}">
            <!-- Config loaded dynamically from AO3H_PanelConfigs -->
          </div>
        </div>`).join(`
`);let i=`<div class="ao3h-tab-content ao3h-search-results" data-tab="search-results">
  <div class="ao3h-modules-list">
    ${r}
  </div>
</div>`;n.style.transition=`opacity 0.15s ease-out`,n.style.opacity=`0`;let a=document.querySelector(`.${B}-bulk-actions`);a&&a.remove(),setTimeout(()=>{n.innerHTML=i,n.scrollTop=0,Bi(),Yi(n),setTimeout(()=>{n.style.opacity=`1`,Qi(n),Wi(n),Zi(n),Xi(n),$i(n),Ui(n)},20)},150)}console.log(`[AO3H][global-search] ✅ Global search setup complete`)}function ia(e){console.log(`[AO3H][panel-loader] 🎨 Opening panel for:`,e);let t=document.querySelector(`.${B}-panel-backdrop`);t&&t.remove();let{backdrop:n,box:r}=Pt();Vi(n,r),na(r),ra(r),document.body.append(n,r),e&&setTimeout(()=>{oa(e,r)},100),console.log(`[AO3H][panel-loader] ✅ Panel displayed`)}function aa(e){if(!Bt)return console.warn(`[AO3H][panel-loader] Tab content not available`),null;for(let[t,n]of Object.entries(Bt))if(n.includes(`data-module-id="${e}"`))return console.log(`[AO3H][panel-loader] Found module in tab:`,t),t;return console.warn(`[AO3H][panel-loader] Module not found in any tab:`,e),null}function oa(e,t){console.log(`[AO3H][panel-loader] 🔍 Navigating to module:`,e);let n=aa(e);if(!n){console.warn(`[AO3H][panel-loader] Cannot navigate - module not found in templates`);return}let r=t.querySelector(`.ao3h-tab-btn[data-tab="${n}"]`);r&&(console.log(`[AO3H][panel-loader] Switching to tab:`,n),r.click()),setTimeout(()=>{let n=t.querySelector(`[data-module-id="${e}"]`);if(!n){console.warn(`[AO3H][panel-loader] Module container not found after tab switch:`,e);return}n.scrollIntoView({behavior:`smooth`,block:`center`});let r=n.querySelector(`.ao3h-module-config-area`),i=n.querySelector(`.ao3h-config-btn`);r&&!r.classList.contains(`ao3h-expanded`)&&(r.classList.add(`ao3h-expanded`),i&&(i.textContent=`▲`),console.log(`[AO3H][panel-loader] ✅ Module config expanded`)),n.classList.add(`ao3h-highlight`),setTimeout(()=>{n.classList.remove(`ao3h-highlight`)},2e3),console.log(`[AO3H][panel-loader] ✅ Navigated to module:`,e)},200)}console.log(`[AO3H][panel-loader] ✅ Panel loader ready`);var sa=[{label:`Filter & Display`,include:[`hideByTags`,`filterManager`,`skipWorks`,`pageControls`,`ficEngagement`,`workLength`,`tagsDisplay`],match:/(hide|tags|filter|manager|skip|works|fic|engagement|work|length|display)/i},{label:`Explore`,include:[`ficPeek`,`similarFics`,`surpriseMe`,`tropeGames`,`searchEnhancer`,`povTracker`],match:/(fic|peek|similar|surprise|trope|games|search|enhancer|pov|tracker)/i},{label:`Reading`,include:[`chapterNavigation`,`readingTracker`,`textToSpeech`,`instantFootnotes`,`readingFormatter`,`collapseAuthorNotes`,`wordSwap`],match:/(chapter|navigation|reading|tracker|text|speech|footnotes|formatter|collapse|notes|word|swap|fic|actions)/i},{label:`Library`,include:[`bookmarkVault`,`laterShelf`,`ficAppreciation`,`readingDashboard`,`activityPanel`,`readingTimeline`,`notificationCenter`,`fanficBingeMode`],match:/(bookmark|vault|later|shelf|fic|appreciation|reading|dashboard|activity|panel|timeline|notification|center|fanfic|binge)/i},{label:`Navigate & Interact`,include:[`mainNavigation`,`keyboardShortcuts`,`userRelationships`,`seriesHelper`,`commentKit`,`ficActions`],match:/(main|navigation|keyboard|shortcuts|user|relationships|series|helper|comment|kit|fic|actions)/i},{label:`Appearance & Tools`,include:[`visualPreferences`,`themeBuilder`,`backupAndSync`,`ficDownloader`],match:/(visual|preferences|theme|builder|backup|sync|fic|downloader)/i}],ca=e=>String(e||``).toLowerCase(),la=Te,G=N.env&&N.env.NS||`ao3h`,ua=()=>sa,K={rootLI:`li.${G}-root`,navlink:`.${G}-navlink`,menuUL:`ul.${G}-menu`,topLevelA:`ul.${G}-menu > li > a`,submenuUL:`ul.${G}-submenu`},da=(()=>{let e=`${G}-submenu-state`;if(`${G}`,(()=>{try{let e=performance.getEntriesByType(`navigation`);return e.length>0?e[0].type===`reload`:performance.navigation?.type===1}catch{return!1}})())try{sessionStorage.removeItem(e)}catch{}let t=()=>{try{return new Map(Object.entries(JSON.parse(sessionStorage.getItem(e)||`{}`)))}catch{return new Map}},n=t=>{try{sessionStorage.setItem(e,JSON.stringify(Object.fromEntries(t)))}catch{}},r=t();return{get:e=>r.get(e),set:(e,t)=>{r.set(e,t),n(r)},has:e=>r.has(e),getState:()=>r}})();function fa(e){let t=document.createElement(`li`);t.className=`${G}-group-container`,t.setAttribute(`data-ao3h-submenu`,`1`),t.setAttribute(`data-group-label`,e);let n=document.createElement(`a`);n.href=`#`,n.innerHTML=`<span class="${G}-label">${e}</span><span class="${G}-caret">▾</span>`,n.setAttribute(`aria-haspopup`,`true`),n.setAttribute(`aria-expanded`,`false`);let r=document.createElement(`ul`);r.className=`menu dropdown-menu ${G}-submenu`,r.setAttribute(`role`,`menu`),r.setAttribute(`data-group-label`,e);let i=(t,i=!0)=>{r.classList.toggle(`open`,!!t),n.setAttribute(`aria-expanded`,String(!!t)),i&&da.set(e,!!t)};da.has(e)&&da.get(e)&&i(!0,!1);let a=e=>{let t=r.classList.contains(`open`);i(typeof e==`boolean`?e:!t)};return n.addEventListener(`click`,e=>{e.preventDefault(),a()}),n.addEventListener(`keydown`,e=>{if(e.key===`Enter`||e.key===` `||e.key===`ArrowDown`){var t;e.preventDefault(),i(!0),(t=r.querySelector(`a`))==null||t.focus()}e.key===`ArrowUp`&&(e.preventDefault(),i(!1))}),r.addEventListener(`keydown`,e=>{(e.key===`ArrowUp`||e.key===`Escape`)&&(e.preventDefault(),i(!1),n.focus())}),document.addEventListener(`pointerdown`,e=>{let n=document.querySelector(K.rootLI);if(!n)return;let r=n.contains(e.target);t.contains(e.target),r||i(!1,!1)}),t.append(n,r),t.__ao3hSetOpen=i,{li:t,ul:r,toggle:a,header:n,setOpen:i}}function pa(){let e=document.createElement(`li`);e.className=`${G}-group-container ${G}-manager-panel-btn`,e.setAttribute(`data-ao3h-manager-btn`,`1`);let t=document.createElement(`a`);return t.href=`#`,t.innerHTML=`<span class="${G}-icon-btn" aria-hidden="true"><span class="${G}-icon">⋯</span></span><span class="${G}-label">Manager Panel</span>`,t.setAttribute(`aria-haspopup`,`false`),t.setAttribute(`role`,`button`),t.title=`Open the AO3 Helper Manager Panel`,t.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),console.log(`[AO3H][menu-grouper] Manager Panel button clicked`),typeof ia==`function`?ia():console.warn(`[AO3H][menu-grouper] Manager panel not loaded yet`)}),e.appendChild(t),e}function ma(){console.log(`[AO3H][menu-grouper] Creating empty group structure...`);let e=document.querySelector(K.menuUL);if(!e){console.warn(`[AO3H][menu-grouper] Menu UL not found for empty groups`);return}e.style.visibility=`hidden`,e.querySelectorAll(`li[data-ao3h-submenu="1"]`).forEach(e=>{let t=e.previousElementSibling;t&&t.classList.contains(`${G}-divider`)&&t.getAttribute(`data-ao3h-submenu`)===`1`&&t.remove(),e.remove()}),e.querySelectorAll(`li[data-ao3h-manager-btn="1"]`).forEach(e=>{let t=e.previousElementSibling;t&&t.classList.contains(`${G}-divider`)&&t.getAttribute(`data-ao3h-manager-btn`)===`1`&&t.remove(),e.remove()});let t=ua();console.log(`[AO3H][menu-grouper] Creating ${t.length} empty groups:`,t.map(e=>e.label));for(let n of t){let{li:t,ul:r}=fa(n.label),i=document.createElement(`li`);i.className=`${G}-divider`,i.setAttribute(`data-ao3h-submenu`,`1`),e.appendChild(i),e.appendChild(t)}let n=document.createElement(`li`);n.className=`${G}-divider`,n.setAttribute(`data-ao3h-manager-btn`,`1`),e.appendChild(n);let r=pa();e.appendChild(r),console.log(`[AO3H][menu-grouper] Manager Panel button added to menu`);let i=Array.from(document.querySelectorAll(K.topLevelA)).filter(e=>e.matches(`[data-flag]`));console.log(`[AO3H][menu-grouper] Hiding ${i.length} toggles until population`),i.forEach(e=>{let t=e.closest(`li`);t&&(t.setAttribute(`data-ao3h-grouped-original`,`1`),_a(t).forEach(e=>e.setAttribute(`data-ao3h-grouped-original`,`1`)))}),e.style.visibility=``,console.log(`[AO3H][menu-grouper] Empty group structure created, all toggles hidden, menu revealed`)}var q=Object.fromEntries((V||[]).map(e=>[e.id,e.label]));q.reading&&(q.filters=q.reading),q.explore&&(q.analysis=q.explore,q.discover=q.explore),q.library&&(q.mystats=q.library),q.navigate&&(q.engage=q.navigate,q.navigation=q.navigate);function ha(e){var t,n;let r=ua(),i=e?.name||``,a=(e==null||(t=e.meta)==null?void 0:t.title)||i;if(!(e==null||(n=e.meta)==null)&&n.group){let t=q[e.meta.group];if(t)return console.log(`[AO3H][menu-grouper] Module "${i}" group key "${e.meta.group}" → label "${t}"`),t;let n=r.find(t=>ca(t.label).includes(ca(e.meta.group)));if(n)return n.label}for(let e of r)if(e.include&&e.include.map(ca).includes(ca(i)))return e.label;for(let e of r)if(e.match&&(e.match.test(a)||e.match.test(i)))return e.label;return null}var ga=e=>e&&e.matches(`[data-flag]`);function _a(e){let t=[],n=e.nextElementSibling;for(;n;){let e=n.querySelector(`:scope > a`);if(!e||ga(e)||n.classList.contains(`${G}-manage-tail`)||n.classList.contains(`${G}-manage-sep`))break;t.push(n),n=n.nextElementSibling}return t}function va(){var e;console.log(`[AO3H][menu-grouper] Populating groups with menu items...`);let t=document.querySelector(K.menuUL);if(!t){console.warn(`[AO3H][menu-grouper] Menu UL not found`);return}t.querySelectorAll(`.${G}-submenu`).forEach(e=>{e.innerHTML=``});let n=Array.from(document.querySelectorAll(K.topLevelA));if(console.log(`[AO3H][menu-grouper] Found ${n.length} top-level menu items`),!n.length)return;let r=(A==null||(e=A.all)==null?void 0:e.call(A))??[];console.log(`[AO3H][menu-grouper] Found ${r.length} registered modules:`,r.length>0?r.map(e=>e.name):`(none yet)`);let a=new Map;for(let e of r)e.enabledKey&&a.set(e.enabledKey,e),e.enabledKeyAlt&&e.enabledKeyAlt!==e.enabledKey&&a.set(e.enabledKeyAlt,e);console.log(`[AO3H][menu-grouper] Flag mappings:`,a.size>0?Array.from(a.keys()):`(none yet)`);let o=e=>{let n=t.querySelector(`li[data-ao3h-submenu="1"][data-group-label="${e}"]`);return n?n.querySelector(`.${G}-submenu`):null},s=n.filter(e=>e.matches(`[data-flag]`));console.log(`[AO3H][menu-grouper] Found ${s.length} toggle items with data-flag:`,s.length>0?s.map(e=>e.dataset.flag):`(none)`);let c=0;for(let e of s){let t=e.closest(`li`);if(!t)continue;let n=e.dataset.flag,r=a.get(n),i=null;if(r)i=ha(r),console.log(`[AO3H][menu-grouper] Module "${r.name}" (${n}) → Group: "${i}"`);else{let e=ua();for(let t of e){if(t.include&&t.include.some(e=>ca(e)===ca(n))){i=t.label;break}if(t.match&&t.match.test(n)){i=t.label;break}}console.log(`[AO3H][menu-grouper] Module not loaded yet for flag: ${n}, inferred group: "${i}"`)}if(!i){t.removeAttribute(`data-ao3h-grouped-original`),_a(t).forEach(e=>e.removeAttribute(`data-ao3h-grouped-original`));continue}let s=o(i);if(!s){console.warn(`[AO3H][menu-grouper] Group UL not found for: ${i}`),t.removeAttribute(`data-ao3h-grouped-original`),_a(t).forEach(e=>e.removeAttribute(`data-ao3h-grouped-original`));continue}let l=t.cloneNode(!0);s.appendChild(l);let u=_a(t);for(let e of u)s.appendChild(e.cloneNode(!0));c++}console.log(`[AO3H][menu-grouper] Populated ${c} modules into groups`);try{console.log(`[AO3H][menu-grouper] Signaling grouper ready state`),window.dispatchEvent(new CustomEvent(`AO3H:grouper:ready`)),window.dispatchEvent(new CustomEvent(`AO3H:menu:grouped`)),i!=null&&i.emit&&(i.emit(`grouper:ready`),i.emit(`menu:grouped`))}catch(e){console.warn(`[AO3H][menu-grouper] Failed to signal grouper ready:`,e)}}function ya(){let e=d;e&&document.querySelectorAll(`${K.submenuUL} a[data-flag]`).forEach(t=>{let n=!!e.get(t.dataset.flag,!1);t.setAttribute(`aria-checked`,String(n)),t.classList.remove(`${G}-on`,`${G}-off`),t.classList.add(n?`${G}-on`:`${G}-off`)})}function ba(){console.log(`[AO3H][menu-grouper] 🔄 Reapplying submenu state...`);let e=document.querySelectorAll(`li[data-ao3h-submenu="1"]`);console.log(`[AO3H][menu-grouper] Found`,e.length,`potential submenus to check`);let t=0;e.forEach(e=>{var n;let r=e.querySelector(`a[aria-haspopup="true"]`),i=e.querySelector(`.${G}-submenu`);if(!r||!i)return;let a=((n=r.querySelector(`.${G}-label`))==null||(n=n.textContent)==null?void 0:n.trim())||``;if(!a)return;t++;let o=i.classList.contains(`open`),s=!!da.get(a);console.log(`[AO3H][menu-grouper] Group`,a,`- currently:`,o,`, should be:`,s),o!==s&&(i.classList.toggle(`open`,s),r.setAttribute(`aria-expanded`,String(s)),console.log(`[AO3H][menu-grouper] ✓ Updated`,a,`to`,s))}),console.log(`[AO3H][menu-grouper] ✓ Reapply complete -`,t,`groups processed`)}var xa=!1,Sa=!1;function Ca(){var e;let t=document.querySelector(K.rootLI);if(!t||t.__ao3hOpenGroupOnce)return;let n=()=>{Sa||(Sa=!0,console.log(`[AO3H][menu-grouper] Populating groups...`),setTimeout(()=>{va(),ya(),ba()},0))},r=()=>{setTimeout(ba,0)};t.addEventListener(`mouseenter`,n,{passive:!0}),t.addEventListener(`focusin`,n),(e=t.querySelector(K.navlink))==null||e.addEventListener(`click`,n),t.addEventListener(`mouseenter`,r,{passive:!0}),t.addEventListener(`focusin`,r),t.__ao3hOpenGroupOnce=!0}function wa(){let e=N.menu;if(e&&typeof e.rebuild==`function`&&!e.__ao3hGroupPatch){console.log(`[AO3H][menu-grouper] Hooking menu rebuild function...`);let t=e.rebuild.bind(e);e.rebuild=function(){console.log(`[AO3H][menu-grouper] Menu rebuild triggered, recreating groups...`);let e=t();Sa=!1,ma();let n=document.querySelector(K.rootLI);return n&&n.classList.contains(`open`)&&setTimeout(()=>{console.log(`[AO3H][menu-grouper] Repopulating groups after menu rebuild...`),va(),ya(),ba()},0),e},e.__ao3hGroupPatch=!0}else e?e.__ao3hGroupPatch&&console.log(`[AO3H][menu-grouper] Menu rebuild already hooked`):console.warn(`[AO3H][menu-grouper] Menu API not available for hooking`)}function Ta(){document.addEventListener(`${G}:flags-updated`,()=>{setTimeout(ya,0)})}function Ea(){if(!document.querySelector(K.menuUL)){setTimeout(Ea,100);return}console.log(`[AO3H][menu-grouper] Menu found, initializing grouper...`),xa||=(ma(),!0),Ca(),wa(),Ta()}function Da(){let e=()=>{let e=document.querySelector(K.menuUL);return!!(e&&e.children.length>0)};if(e()){console.log(`[AO3H][menu-grouper] Menu already available, starting...`),setTimeout(Ea,50);return}console.log(`[AO3H][menu-grouper] Waiting for menu to be available...`);let t=!1,n=()=>{if(!t){if(!e()){console.log(`[AO3H][menu-grouper] Menu not ready yet, waiting more...`),setTimeout(()=>{t||n()},100);return}t=!0,console.log(`[AO3H][menu-grouper] Menu available, starting grouper...`),setTimeout(Ea,50)}};i!=null&&i.on&&i.on(`menu:ready`,n);try{window.addEventListener(`AO3H:menu:ready`,n)}catch(e){console.warn(`[AO3H][menu-grouper] Could not set up window event listeners:`,e)}let r=0,a=()=>{r++,!t&&(e()?(console.log(`[AO3H][menu-grouper] Menu found via polling after `+r*200+`ms, starting...`),n()):r<100?setTimeout(a,200):console.warn(`[AO3H][menu-grouper] Timeout waiting for menu after 20s (menu may not have been built)`))};setTimeout(a,200)}var Oa={sync:ya,rebuild:()=>{console.log(`[AO3H][menu-grouper] External rebuild requested`),Sa=!1,setTimeout(()=>{va(),ya(),ba()},10)}};function ka(){la(Da)}var J=N.env&&N.env.NS||`ao3h`,Aa=400,Y=!1,X=!1,ja=!1,Ma=0;console.log(`[AO3H][menu] Initial state - modulesReady:`,Y,`, grouperReady:`,X);var Na=e=>{var t;return Ot(e,(A==null||(t=A.all)==null?void 0:t.call(A))??[])},Pa=(e,t,n)=>jt(e,t,n,J),Fa=()=>Mt(J),Z,Q,$,Ia=[];function La(){let e=Z||document.querySelector(`li.${J}-root`);e&&e.querySelectorAll(`.${J}-submenu.open`).forEach(e=>{e.classList.remove(`open`);let t=e.previousElementSibling;t&&t.setAttribute(`aria-expanded`,`false`)})}var Ra=(e,t,n,r=null)=>{console.log(`[AO3H][menu] 🧪 itemToggle called with:`,{label:e,flagKey:t,current:n,moduleName:r}),console.log(`[AO3H][menu] 🧪 Creating fallback toggle with button`);let i=document.createElement(`li`),a=document.createElement(`a`);a.href=`#`,a.dataset.flag=t,a.setAttribute(`role`,`menuitemcheckbox`),a.setAttribute(`aria-checked`,String(!!n)),n&&a.classList.add(`${J}-on`),console.log(`[AO3H][menu] Creating icon button for module:`,r);let o;window.AO3H_IconButton&&typeof window.AO3H_IconButton.createSettingsButton==`function`?o=window.AO3H_IconButton.createSettingsButton(r||``,Dt(e,t)):(o=document.createElement(`button`),o.className=`${J}-icon-btn`,o.type=`button`,o.setAttribute(`aria-label`,`Settings for ${Dt(e,t)}`),o.dataset.moduleName=r||``,o.innerHTML=`<span class="${J}-icon" aria-hidden="true">⋯</span>`,o.onclick=function(e){e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation();let t=this.dataset.moduleName;return console.log(`[AO3H][menu] Opening panel for module:`,t),typeof ia==`function`?ia(t):console.warn(`[AO3H][menu] Panel opener not available`),!1});let s=document.createElement(`span`);s.className=`${J}-label`,s.textContent=Dt(e,t);let c=document.createElement(`span`);return c.className=`${J}-switch`,c.setAttribute(`aria-hidden`,`true`),a.appendChild(o),a.appendChild(s),a.appendChild(c),i.appendChild(a),console.log(`[AO3H][menu] Created module item with settings button:`,i),i};function za(){$.innerHTML=``;let e=localStorage.getItem(`ao3h:pinnedModule`);if(e){let t=(A&&A.all?A.all():[]).find(t=>t.name===e);if(t){let n=Pa(`⚡ ${Dt(t.meta?.title||e,null)}`,``,()=>{typeof ia==`function`?ia(e):console.warn(`[AO3H][menu] openAO3HPanel not available`)});n.classList.add(`${J}-quick-access`),$.appendChild(n),$.appendChild(Fa())}}let t=(A&&A.all?A.all():[]).filter(e=>{var t;return!((t=e.meta)!=null&&t.parent)});if(t.length)for(let{name:e,meta:n,enabledKey:r}of t){let t=Dt(n?.title||e,r),i=!!d.get(r,!!(n!=null&&n.enabledByDefault));$.appendChild(Ra(t,r,i,e))}else{let e=document.createElement(`li`);e.innerHTML=`<a><span class="${J}-label">No modules registered</span></a>`,$.appendChild(e)}$.appendChild(Fa());for(let e of Ia){if(e.type===`sep`){$.appendChild(Fa());continue}if(e.type===`toggle`){let t=!!d.get(e.flagKey,!!e.defaultOn);$.appendChild(Ra(Dt(e.label,e.flagKey),e.flagKey,t,e.moduleName));continue}}}var Ba=null;function Va(){Ba&&=(clearTimeout(Ba),null)}function Ha(){if(!Y){console.log(`[AO3H][menu] Menu blocked: modules not ready yet`);return}if(Ma>0){console.log(`[AO3H][menu] Menu blocked: modules still registering (`+Ma+` remaining)`);return}if(!X){console.log(`[AO3H][menu] Menu blocked: waiting for menu-grouper to finish organizing`);return}console.log(`[AO3H][menu] Opening menu (modules ready:`,Y,`, grouper ready:`,X,`)`),Va(),Z.classList.add(`open`),Q.setAttribute(`aria-expanded`,`true`),requestAnimationFrame(()=>{typeof window.updateScrollIndicators==`function`&&window.updateScrollIndicators()})}function Ua(e={}){let{defer:t=!1,delay:n=Aa}=e;if(t){Va(),Ba=setTimeout(()=>Ua({defer:!1}),n);return}Va(),La(),Z.classList.remove(`open`),Q.setAttribute(`aria-expanded`,`false`)}function Wa(){let e;if(typeof N.createNavigationButton==`function`?(e=N.createNavigationButton(),Z=e.container,Q=e.button):(Z=document.querySelector(`li.${J}-root`),Z&&(Q=Z.querySelector(`.${J}-navlink`))),!Z||!Q){console.warn(`[AO3H][menu] Navigation button not found or created, menu cannot be built`);return}if(Q.hasAttribute(`aria-expanded`)||Q.setAttribute(`aria-expanded`,`false`),$=Z.querySelector(`.${J}-menu`),$||($=document.createElement(`ul`),$.className=`menu dropdown-menu ${J}-menu`,$.setAttribute(`role`,`menu`),Z.appendChild($)),!Z.hasAttribute(`data-ao3h-menu-configured`)){P(Z,`mouseenter`,()=>{Ha(),Va()});let e=null;P(Z,`mouseleave`,()=>{e&&document.removeEventListener(`mousemove`,e),e=t=>{if(!Z.classList.contains(`open`)){document.removeEventListener(`mousemove`,e),e=null;return}let n=$.getBoundingClientRect(),r=t.clientX,i=t.clientY;r>=n.left-20&&r<=n.right+20&&i>=n.top-20&&i<=n.bottom+20||(Ua({defer:!0}),document.removeEventListener(`mousemove`,e),e=null)},document.addEventListener(`mousemove`,e),setTimeout(()=>{if(e){let t=new MouseEvent(`mousemove`);window.lastMouseX!==void 0&&window.lastMouseY!==void 0&&(Object.defineProperty(t,"clientX",{value:window.lastMouseX}),Object.defineProperty(t,"clientY",{value:window.lastMouseY})),e(t)}},100)}),P(document,`mousemove`,e=>{window.lastMouseX=e.clientX,window.lastMouseY=e.clientY}),P(Z,`focusin`,Ha),P(Z,`focusout`,e=>{Z.contains(e.relatedTarget)||Ua()}),Q&&!Q.hasAttribute(`data-ao3h-click-configured`)&&(P(Q,`click`,e=>{if(e.preventDefault(),console.log(`[AO3H][menu] Button clicked!`),!Y||!X){console.log(`[AO3H][menu] Click blocked: waiting for modules and grouper to be ready`);return}Z.classList.contains(`open`)?Ua():Ha()}),Q.setAttribute(`data-ao3h-click-configured`,`true`)),Z.setAttribute(`data-ao3h-menu-configured`,`true`)}P($,`keydown`,e=>{let t=Array.from($.querySelectorAll(`a`)),n=t.indexOf(document.activeElement);if(e.key===`ArrowDown`){var r;e.preventDefault(),(r=t[n+1]||t[0])==null||r.focus()}if(e.key===`ArrowUp`){var i;e.preventDefault(),(i=t[n-1]||t[t.length-1])==null||i.focus()}if(e.key===`Home`){var a;e.preventDefault(),(a=t[0])==null||a.focus()}if(e.key===`End`){var o;e.preventDefault(),(o=t[t.length-1])==null||o.focus()}}),P($,`click`,function(){var e=t(function*(e){let t=e.target.closest(`.${J}-icon-btn`);if(t){e.preventDefault(),e.stopPropagation(),console.log(`[AO3H][menu] ⚙️ Settings button clicked`);let n=t.dataset.moduleName;console.log(`[AO3H][menu] Opening panel for module:`,n),typeof ia==`function`?ia(n):console.error(`[AO3H][menu] ❌ openAO3HPanel function not available`);return}let n=e.target.closest(`.${J}-switch`);if(!n)return;let r=n.closest(`a[data-flag]`);if(!r)return;e.preventDefault();let i=r.dataset.flag,a=(A&&A.all?A.all():[]).find(e=>e.enabledKey===i||e.enabledKeyAlt===i),o=!d.get(i,!1);try{a?yield A.setEnabled(a.name,o):yield d.set(i,o)}catch(e){console.error(`[AO3H][menu] toggle failed`,i,e)}r.setAttribute(`aria-checked`,String(o)),r.classList.toggle(`${J}-on`,o);try{document.dispatchEvent(new CustomEvent(`${J}:flags-updated`,{detail:{key:i,value:o}}))}catch{}});return function(t){return e.apply(this,arguments)}}()),P(document,`click`,e=>{Z.contains(e.target)||Ua()}),P(document,`keydown`,e=>{e.key===`Escape`&&Ua()}),document.addEventListener(`ao3h:panel-closed`,()=>Ua()),window.updateScrollIndicators=()=>{if(!$)return;let e=$.scrollHeight>$.clientHeight,t=$.scrollTop>10,n=$.scrollTop+$.clientHeight>=$.scrollHeight-10;$.classList.toggle(`ao3h-has-scroll`,e&&!n),$.classList.toggle(`ao3h-scrolled-down`,t)},P($,`scroll`,window.updateScrollIndicators),new MutationObserver(window.updateScrollIndicators).observe($,{childList:!0,subtree:!0}),za(),(function(e){if(!e||e.__ao3hBottomGuard)return;let t=e=>e&&e.nodeType===1&&e.matches?.call(e,`li.${J}-manage-tail, li.${J}-manage-sep`),n=()=>e.querySelector(`li.${J}-manage-tail`),r=e.appendChild.bind(e),i=e.insertBefore.bind(e),a=e.append?.bind(e),o=e.replaceChildren?.bind(e);e.appendChild=function(e){let a=n();return a&&!t(e)?i(e,a):r(e)},a&&(e.append=function(...e){e.forEach(e=>{typeof e==`string`&&(e=document.createTextNode(e)),this.appendChild(e)})}),e.insertBefore=function(e,t){return t==null?this.appendChild(e):i(e,t)},o&&(e.replaceChildren=function(...e){o(...e);let t=this.querySelector(`li.${J}-manage-sep`),n=this.querySelector(`li.${J}-manage-tail`);t&&this.appendChild(t),n&&this.appendChild(n)}),e.__ao3hBottomGuard=!0})($)}function Ga(e,t,n){let r=!1,i=``;typeof t==`boolean`&&n===void 0?(r=t,i=null):(i=t==null?``:String(t),r=!!n);let a=Dt(i,e);Ia.push({type:`toggle`,flagKey:e,label:a,defaultOn:r,moduleName:Na(e)}),$&&za()}function Ka(e,t,n=``){Ia.push({type:`action`,label:e,handler:t,hint:n}),$&&za()}function qa(){Ia.push({type:`sep`}),$&&za()}function Ja(){$&&za()}N.menu={addToggle:Ga,addAction:Ka,addSeparator:qa,rebuild:Ja};function Ya(){let e=e=>{Ma++,console.log(`[AO3H][menu] Module loading:`,e.detail?.name,`(total registering:`,Ma+`)`)},t=e=>{Ma=Math.max(0,Ma-1),console.log(`[AO3H][menu] Module registered:`,e.detail?.name,`(remaining:`,Ma+`)`),Ma===0&&$&&console.log(`[AO3H][menu] All modules registered, menu ready for interaction`)},n=()=>{Y||(console.log(`[AO3H][menu] Modules are ready, enabling menu interactions`),Y=!0,$&&za())},r=()=>{X||ja||(console.log(`[AO3H][menu] Menu-grouper has finished organizing`),ja=!0,X=!0,console.log(`[AO3H][menu] Menu interactions enabled (grouper ready)`))};i&&typeof i.on==`function`&&(i.on(`modules:ready`,n),i.on(`modules:loaded`,n));try{window.addEventListener(`AO3H:modules:ready`,n),window.addEventListener(`AO3H:ready`,n),window.addEventListener(`AO3H:grouper:ready`,r),window.addEventListener(`AO3H:menu:grouped`,r),window.addEventListener(`AO3H:module:loading`,e),window.addEventListener(`AO3H:module:registered`,t)}catch(e){console.warn(`[AO3H][menu] Failed to setup window event listeners:`,e)}setTimeout(()=>{Y||(A&&A.all&&A.all().length>0?(console.log(`[AO3H][menu] Modules detected via fallback check, enabling menu`),n()):m()&&console.log(`[AO3H][menu] jQuery detected, assuming modules will load soon`)),X||(Oa?(console.log(`[AO3H][menu] Menu-grouper detected but not ready yet, waiting...`),setTimeout(()=>{!X&&!ja?(console.log(`[AO3H][menu] Timeout waiting for grouper, enabling menu anyway`),X=!0):ja&&!X&&console.log(`[AO3H][menu] Timeout reached but grouper already signaled, waiting for its delay to complete`)},3e3)):(console.log(`[AO3H][menu] No menu-grouper detected, allowing menu interaction`),r()))},2e3);try{if(N.moduleLoader&&typeof N.moduleLoader.getStatus==`function`){let e=N.moduleLoader.getStatus();e&&e.length>0&&(console.log(`[AO3H][menu] Module loader reports ready modules, enabling menu`),n())}_()&&A&&A.all&&A.all().length>0&&!Y&&(console.log(`[AO3H][menu] Page fully ready with modules, enabling menu immediately`),n())}catch(e){console.warn(`[AO3H][menu] Failed to check module loader status:`,e)}}function Xa(){Te(t(function*(){if(!/\/users\/[^/]+\/kudos-history(?:\/?\/|$)/.test(location.pathname))try{Ya();let t=window.AO3H_Common;if(t&&typeof t.waitForAO3Ready==`function`&&(console.log(`[AO3H][menu] Waiting for AO3 libraries (jQuery, CSRF)...`),(yield t.waitForAO3Ready({jquery:!1,csrf:!1,dom:!0,timeout:5e3})).timeout?console.warn(`[AO3H][menu] DOM not ready after 5s, building menu anyway`):console.log(`[AO3H][menu] DOM ready, building menu`)),N.DEBUG){let e=[];t&&(typeof t.hasJQuery==`function`&&e.push(`jQuery: ${t.hasJQuery()?`✓`:`✗`}`),typeof t.hasRailsUJS==`function`&&e.push(`Rails UJS: ${t.hasRailsUJS()?`✓`:`✗`}`),typeof t.hasTinyMCE==`function`&&e.push(`TinyMCE: ${t.hasTinyMCE()?`✓`:`✗`}`),typeof t.hasLiveValidation==`function`&&e.push(`LiveValidation: ${t.hasLiveValidation()?`✓`:`✗`}`)),e.push(`Modules ready: ${Y}`),e.push(`Grouper ready: ${X}`),console.log(`[AO3H][menu] Integration status: ${e.join(`, `)}`)}Wa(),document.addEventListener(`${J}:flags-updated`,()=>{if(!$)return;let e=e=>d.get?d.get(e,!1):!1;$.querySelectorAll(`a[data-flag]`).forEach(t=>{let n=!!e(t.dataset.flag);t.setAttribute(`aria-checked`,String(n)),t.classList.toggle(`${J}-on`,n)})});try{var e;(e=GM_registerMenuCommand)==null||e(`AO3 Helper — Open`,()=>{document.querySelector(`li.${J}-root`)?.dispatchEvent(new Event(`mouseenter`))})}catch{}}catch(e){console.error(`[AO3H][menu] build failed`,e)}}))}var Za=`ao3h`,Qa=`WelcomeGuide`,$a=`${Za}-welcome-seen`;he(Qa,{title:`Welcome Guide`,enabledByDefault:!0},function(){var e=t(function*(){if(localStorage.getItem($a))return()=>{};let e=document.createElement(`div`);return e.style.cssText=`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    z-index: 99999;
    max-width: 600px;
    text-align: center;
  `,e.innerHTML=`
    <h1 style="margin:0 0 20px 0; font-size:32px;">👋 Welcome to AO3 Helper!</h1>
    <p style="font-size:16px; line-height:1.6; margin-bottom:25px;">
      Enhance your AO3 experience with powerful tools for reading, bookmarking, and organizing fanfiction.
    </p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px;">
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>📚 Bookmark Manager</strong><br>
        <small>Organize your favorites</small>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>📊 Reading Stats</strong><br>
        <small>Track your progress</small>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>🎨 Custom Themes</strong><br>
        <small>Personalize appearance</small>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>⚡ Quick Actions</strong><br>
        <small>Keyboard shortcuts</small>
      </div>
    </div>
    <button style="background:white; color:#667eea; border:none; padding:12px 30px; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer;">
      Get Started
    </button>
    <p style="margin-top:15px; font-size:12px; opacity:0.8;">
      Open it anytime from the AO3 Helper menu → Manager Panel
    </p>
  `,e.querySelector(`button`).addEventListener(`click`,()=>{localStorage.setItem($a,`true`),e.remove()}),document.body.appendChild(e),()=>{e.remove()}});function n(){return e.apply(this,arguments)}return n}()),F(`:root{--ao3h-red:#900;--ao3h-red-dark:#700;--ao3h-red-light:#b22222;--ao3h-text:#2a2a2a;--ao3h-text-dark:#111;--ao3h-text-light:#666;--ao3h-text-muted:#888;--ao3h-bg:#fff;--ao3h-bg-soft:#f3efec;--ao3h-bg-panel:#ededed;--ao3h-bg-hover:#f8f8f8;--ao3h-bg-disabled:#f0f0f0;--ao3h-border:#bbb;--ao3h-border-light:#ddd;--ao3h-border-soft:#f3efec;--ao3h-success:#2d7d46;--ao3h-success-bg:#edf8f0;--ao3h-warning:#856404;--ao3h-warning-bg:#fff3cd;--ao3h-warning-border:#d6b656;--ao3h-error:#8b0000;--ao3h-error-bg:#fbeaea;--ao3h-error-border:#dca7a7;--ao3h-info:#0f4c81;--ao3h-info-bg:#eef6fd;--ao3h-info-border:#a8c7e6;--ao3h-font:"Lucida Grande", "Lucida Sans Unicode", Verdana, Helvetica, sans-serif, "GNU Unifont";--ao3h-heading-font:Georgia, serif;--ao3h-font-xs:.75rem;--ao3h-font-sm:.857rem;--ao3h-font-md:1rem;--ao3h-font-lg:1.143rem;--ao3h-font-xl:1.286rem;--ao3h-font-xxl:1.714rem;--ao3h-space-1:.25rem;--ao3h-space-2:.5rem;--ao3h-space-3:.75rem;--ao3h-space-4:1rem;--ao3h-space-5:1.5rem;--ao3h-space-6:2rem;--ao3h-radius-sm:4px;--ao3h-radius-md:6px;--ao3h-radius-lg:10px;--ao3h-shadow-sm:1px 1px 3px rgba(0,0,0,.15);--ao3h-shadow-md:0 3px 8px rgba(0,0,0,.18);--ao3h-shadow-inset:inset 1px 1px 3px rgba(0,0,0,.12);--ao3h-z-dropdown:9000;--ao3h-z-popover:9500;--ao3h-z-modal:10000;--ao3h-z-toast:11000;--ao3h-speed-fast:.12s;--ao3h-speed-normal:.2s;--ao3h-speed-slow:.3s;--ao3h-focus-outline:1px dotted var(--ao3h-red)}`,`ao3h-variables`),F(`.ao3h-root,.ao3h-root *{box-sizing:border-box}.ao3h-root{font-family:var(--ao3h-font);color:var(--ao3h-text)}.ao3h-title,.ao3h-heading{font-family:var(--ao3h-heading-font);color:var(--ao3h-red);font-weight:400}.ao3h-title{font-size:var(--ao3h-font-xxl)}.ao3h-heading{font-size:var(--ao3h-font-xl)}.ao3h-muted{color:var(--ao3h-text-light)}.ao3h-panel{background:var(--ao3h-bg-panel);border:1px solid var(--ao3h-border-light);border-radius:var(--ao3h-radius-sm);padding:var(--ao3h-space-4);box-shadow:var(--ao3h-shadow-inset)}.ao3h-card{background:var(--ao3h-bg);border:1px solid var(--ao3h-border-light);border-radius:var(--ao3h-radius-sm);padding:var(--ao3h-space-4);box-shadow:var(--ao3h-shadow-sm)}.ao3h-btn{padding:var(--ao3h-space-2) var(--ao3h-space-3);border:1px solid var(--ao3h-border);border-radius:var(--ao3h-radius-sm);background:var(--ao3h-bg-soft);color:var(--ao3h-text-dark);cursor:pointer;font-size:var(--ao3h-font-sm);transition:background var(--ao3h-speed-fast), border-color var(--ao3h-speed-fast);display:inline-block}.ao3h-btn:hover{border-color:var(--ao3h-red);color:var(--ao3h-red)}.ao3h-btn-primary{background:var(--ao3h-red);border-color:var(--ao3h-red-dark);color:#fff}.ao3h-btn-primary:hover{background:var(--ao3h-red-dark);color:#fff}.ao3h-input,.ao3h-select,.ao3h-textarea{width:100%;padding:var(--ao3h-space-2);border:1px solid var(--ao3h-border);border-radius:var(--ao3h-radius-sm);background:var(--ao3h-bg);color:var(--ao3h-text);box-shadow:var(--ao3h-shadow-inset);font-family:var(--ao3h-font)}.ao3h-input:focus,.ao3h-select:focus,.ao3h-textarea:focus{outline:var(--ao3h-focus-outline)}.ao3h-badge{border:1px solid var(--ao3h-border-light);border-radius:var(--ao3h-radius-sm);background:var(--ao3h-bg-soft);font-size:var(--ao3h-font-xs);padding:2px 8px;display:inline-block}.ao3h-toolbar{gap:var(--ao3h-space-2);padding:var(--ao3h-space-3);background:var(--ao3h-bg-panel);border:1px solid var(--ao3h-border-light);border-radius:var(--ao3h-radius-sm);flex-wrap:wrap;display:flex}.ao3h-dropdown{background:var(--ao3h-bg);border:1px solid var(--ao3h-border);border-radius:var(--ao3h-radius-sm);box-shadow:var(--ao3h-shadow-md);z-index:var(--ao3h-z-dropdown)}.ao3h-warning{background:var(--ao3h-warning-bg);border:1px solid var(--ao3h-warning-border);color:var(--ao3h-warning)}.ao3h-error{background:var(--ao3h-error-bg);border:1px solid var(--ao3h-error-border);color:var(--ao3h-error)}.ao3h-info{background:var(--ao3h-info-bg);border:1px solid var(--ao3h-info-border);color:var(--ao3h-info)}.ao3h-hidden{display:none!important}.ao3h-flex{display:flex}.ao3h-wrap{flex-wrap:wrap}.ao3h-center{text-align:center}.ao3h-right{text-align:right}`,`ao3h-style-base`),F(`#ao3h-ie-dialog::-ms-backdrop{background:rgba(2,6,23,.45)}#ao3h-ie-dialog::backdrop{background:rgba(2,6,23,.45)}#ao3h-ie-dialog{-webkit-backdrop-filter:blur(12px)saturate(130%);backdrop-filter:blur(12px)saturate(130%);width:360px;max-width:90vw;box-shadow:var(--ao3h-glass-shadow);color:var(--ao3h-fg);background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.35);border-radius:14px;padding:16px 16px 14px}#ao3h-ie-title{letter-spacing:.2px;margin:0 0 10px;font-size:16px;font-weight:800}#ao3h-ie-desc{color:var(--ao3h-fg-dim);margin:0 0 14px;font-size:13px}#ao3h-ie-row{gap:10px;margin-top:8px;display:flex}#ao3h-ie-row button{cursor:pointer;background:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.4);border-radius:10px;flex:1;padding:10px 12px;font-size:13px;transition:transform .12s,box-shadow .18s,background .18s}#ao3h-ie-row button:hover{background:rgba(255,255,255,.95);transform:translateY(-1px);box-shadow:0 10px 28px rgba(2,6,23,.12)}#ao3h-ie-row button[disabled]{opacity:.6;cursor:not-allowed;-webkit-filter:saturate(.6);filter:saturate(.6)}#ao3h-ie-foot{justify-content:flex-end;margin-top:10px;display:flex}#ao3h-ie-cancel{cursor:pointer;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.35);border-radius:10px;padding:6px 10px;font-size:12px}@media (prefers-color-scheme:dark){.ao3h-menu{box-shadow:0 0 0 1px rgba(0,0,0,.6),0 8px 20px rgba(0,0,0,.6),0 18px 40px rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.35)!important}.ao3h-menu a[data-flag]:hover,.ao3h-submenu>li>a:hover{background:rgba(255,255,255,.08)!important}#ao3h-ie-dialog{color:var(--ao3h-fg);background:rgba(16,21,38,.72)}}`,`ao3h-dialog`),F(`.ao3h-icon-btn{width:20px;height:20px;color:var(--ao3h-fg-subtle,rgba(68,68,68,.6));cursor:pointer;pointer-events:auto;background:0 0;border:none;border-radius:3px;flex-shrink:0;justify-content:center;align-items:center;margin:0 6px 0 0;padding:0;font-size:16px;line-height:1;transition:none;display:inline-flex;position:relative;top:0}.ao3h-icon-btn:hover,.ao3h-icon-btn:focus,.ao3h-icon-btn:active{color:var(--ao3h-fg-subtle,rgba(68,68,68,.6));box-shadow:none;background:0 0;border:none;outline:none;text-decoration:none;transform:none}.ao3h-icon-btn .ao3h-icon,.ao3h-icon-btn>span{font-size:inherit;line-height:inherit;pointer-events:none;margin:0;display:block}.ao3h-menu a[data-flag] .ao3h-icon-btn{visibility:visible;opacity:1}`,`ao3h-icon-button`),F(`.ao3h-menu-emphasis{text-underline-offset:2px;font-style:italic;text-decoration:underline;text-decoration-thickness:1px}:root{--ao3h-toggle-size:16px;--ao3h-toggle-bg:#fff;--ao3h-toggle-color:#333;--ao3h-toggle-opacity:.7;--ao3h-toggle-opacity-hover:.85;--ao3h-toggle-border:rgba(0,0,0,.08);--ao3h-toggle-font-size:10px;--ao3h-toggle-spacing:6px}[class*=ao3h-][class*=-toggle]{width:var(--ao3h-toggle-size);height:var(--ao3h-toggle-size);background:var(--ao3h-toggle-bg);color:var(--ao3h-toggle-color);opacity:var(--ao3h-toggle-opacity);box-shadow:0 0 0 1px var(--ao3h-toggle-border);cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;line-height:1;font-size:var(--ao3h-toggle-font-size);vertical-align:text-bottom;border:none;border-radius:999px;justify-content:center;align-items:center;padding:0;transition:opacity .15s,-webkit-filter .15s,filter .15s;display:inline-flex}[class*=ao3h-][class*=-toggle]:hover{opacity:var(--ao3h-toggle-opacity-hover);-webkit-filter:brightness(.98);filter:brightness(.98)}[class*=ao3h-][class*=-toggle]:focus{outline:2px solid var(--ao3h-accent,#c21);outline-offset:1px}[class*=ao3h-][class*=-toggle]:active{transform:scale(.95)}[class*=ao3h-][class*=-toggle] .chev{font-size:inherit;transition:opacity .2s}[class*=ao3h-][class*=-toggle-wrap]{float:right;margin-left:var(--ao3h-toggle-spacing);margin-bottom:2px;display:block}[class*=ao3h-][class*=-notes-group],[class*=ao3h-][class*=-section-group],[class*=ao3h-][class*=-collapsible-group]{clear:both}[class*=ao3h-][class*=-sr]{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;position:absolute!important}[class*=ao3h-][class*=-toggle-large]{--ao3h-toggle-size:20px;--ao3h-toggle-font-size:12px}[class*=ao3h-][class*=-toggle-small]{--ao3h-toggle-size:14px;--ao3h-toggle-font-size:9px}[class*=ao3h-][class*=-toggle-accent]{--ao3h-toggle-bg:var(--ao3h-accent,#c21);--ao3h-toggle-color:#fff}@media (prefers-color-scheme:dark){:root{--ao3h-toggle-bg:#2a2a2a;--ao3h-toggle-color:#e0e0e0;--ao3h-toggle-border:rgba(255,255,255,.15)}}.ao3h-dark-theme [class*=ao3h-][class*=-toggle],#main.dark [class*=ao3h-][class*=-toggle],.dark-mode [class*=ao3h-][class*=-toggle]{--ao3h-toggle-bg:#2a2a2a;--ao3h-toggle-color:#e0e0e0;--ao3h-toggle-border:rgba(255,255,255,.15)}@keyframes ao3h-toggle-appear{0%{opacity:0;transform:scale(.8)}to{opacity:var(--ao3h-toggle-opacity);transform:scale(1)}}[class*=ao3h-][class*=-toggle].ao3h-appear{animation:.2s ease-out ao3h-toggle-appear}[class*=ao3h-][class*=-toggle][aria-expanded]{transition:all .2s}@media (pointer:coarse){[class*=ao3h-][class*=-toggle]{--ao3h-toggle-size:18px;--ao3h-toggle-font-size:11px}}@media (prefers-reduced-motion:reduce){[class*=ao3h-][class*=-toggle],[class*=ao3h-][class*=-toggle] .chev,[class*=ao3h-][class*=-toggle][aria-expanded]{transition:none}[class*=ao3h-][class*=-toggle].ao3h-appear{animation:none}}@media (prefers-contrast:high){[class*=ao3h-][class*=-toggle]{--ao3h-toggle-border:rgba(0,0,0,.3);border:2px solid var(--ao3h-toggle-color)}}.ao3h-debug [class*=ao3h-][class*=-toggle]{outline-offset:2px;outline:2px dashed orange}.ao3h-debug [class*=ao3h-][class*=-toggle-wrap]{background:rgba(255,165,0,.1)}`,`ao3h-collapse-chevron`),F(`:root{--ao3h-switch-on:#0bbf6a;--ao3h-switch-off:rgba(15,23,42,.35)}.ao3h-switch{background:var(--ao3h-switch-off);cursor:pointer;border-radius:999px;flex:0 0 42px;width:42px;height:22px;margin-left:.5rem;transition:background .18s,transform .12s;position:relative;box-shadow:inset 0 0 0 1px rgba(2,6,23,.12)}.ao3h-switch:before{content:"";position:absolute;top:-8px;bottom:-8px;left:-8px;right:-8px}.ao3h-switch:hover{transform:scale(1.05);box-shadow:inset 0 0 0 1px rgba(2,6,23,.18),0 2px 4px rgba(2,6,23,.08)}.ao3h-switch:after{content:"";background:#fff;border-radius:50%;width:18px;height:18px;transition:left .18s;position:absolute;top:2px;left:2px;box-shadow:0 1px 2px rgba(2,6,23,.25)}a.ao3h-on .ao3h-switch,.ao3h-on .ao3h-switch{background:var(--ao3h-switch-on);box-shadow:inset 0 0 0 1px rgba(2,6,23,.1)}a.ao3h-on .ao3h-switch:hover,.ao3h-on .ao3h-switch:hover{box-shadow:inset 0 0 0 1px rgba(2,6,23,.15),0 2px 4px rgba(2,6,23,.08)}a.ao3h-on .ao3h-switch:after,.ao3h-on .ao3h-switch:after{left:22px}.ao3h-switch--compact,ul.ao3h-submenu a .ao3h-switch{border-radius:12px!important;flex:0 0 40px!important;width:40px!important;height:12px!important;box-shadow:inset 2px 2px rgba(0,0,0,.2)!important}.ao3h-switch--compact:after,ul.ao3h-submenu a .ao3h-switch:after{background:#ddd!important;border:1px solid rgba(0,0,0,.1)!important;border-radius:20px!important;width:14px!important;height:14px!important;top:-2px!important;left:-2px!important;box-shadow:inset 2px 2px rgba(255,255,255,.6),inset -1px -1px rgba(0,0,0,.1)!important}.ao3h-on .ao3h-switch--compact:after,ul.ao3h-submenu a.ao3h-on .ao3h-switch:after{left:calc(100% - 14px)!important}`,`ao3h-toggle-switch`),F(`:root{--ao3h-ink:#222;--ao3h-accent:#900;--ao3h-fg:#0b1220;--ao3h-fg-dim:#445069;--ao3h-glass-bg:rgba(255,255,255,.55);--ao3h-glass-stroke:rgba(255,255,255,.45);--ao3h-glass-shadow:0 12px 40px rgba(2,6,23,.22);--ao3h-item-bg:rgba(255,255,255,.75);--ao3h-item-hover:rgba(255,255,255,.54);--ao3h-module-bg:rgba(255,255,255,.45);--ao3h-module-hover:rgba(255,255,255,.65);--ao3h-module-fg:#2d3748;--ao3h-group-fg:#a12020;--ao3h-switch-on:#0bbf6a;--ao3h-switch-off:rgba(15,23,42,.35);--ao3h-radius-lg:16px;--ao3h-radius-md:12px;--ao3h-pad-y:.55em;--ao3h-pad-x:.9em;--ao3h-gap:.75rem;--ao3h-focus-ring:0 0 0 3px rgba(198,40,40,.25);--ao3h-loading-opacity:.6}.ao3h-hidden{display:none!important}dl.work.meta.group dd.tags{white-space:normal!important;overflow:visible!important}dl.work.meta.group dd.tags ul.tags,dl.work.meta.group dd.tags ul.tags.commas{white-space:normal!important;display:block!important;overflow:visible!important}dl.work.meta.group dd.tags ul.tags li{white-space:normal!important;display:inline!important}dl.work.meta.group dd.tags a.tag{white-space:normal!important;text-overflow:clip!important;max-width:none!important;display:inline!important;overflow:visible!important}ul.ao3h-menu,.ao3h-menu.dropdown-menu{max-width:280px;padding:.5rem;box-shadow:0 0 0 1px rgba(255,255,255,.35),0 6px 18px rgba(0,0,0,.25),0 18px 40px rgba(0,0,0,.15);color:var(--ao3h-fg)!important}.ao3h-root{position:relative}.ao3h-root:after{content:"";z-index:-1;pointer-events:none;position:absolute;top:0;bottom:-20px;left:-20px;right:-20px}.ao3h-root{transition:opacity .2s}.ao3h-root.ao3h-rebuilding{opacity:.7}.ao3h-menu.ao3h-refreshing{opacity:.95;transition:opacity .1s}@media (max-width:768px){ul.ao3h-menu,.ao3h-menu.dropdown-menu{max-width:calc(100vw - 16px);padding:.4rem}}#header li.dropdown.ao3h-root ul.ao3h-menu li,#header li.dropdown.ao3h-root ul.ao3h-menu li a,#header li.dropdown.ao3h-root ul.ao3h-menu ul.ao3h-submenu li,#header li.dropdown.ao3h-root ul.ao3h-menu ul.ao3h-submenu li a{position:static!important}.ao3h-menu a{justify-content:space-between;align-items:center;gap:var(--ao3h-gap);white-space:nowrap;background:var(--ao3h-item-bg);border-radius:var(--ao3h-radius-md);margin:6px 4px;padding:.5rem .75rem;font-size:13px;line-height:1.15;text-decoration:none;transition:background .18s,transform .12s,box-shadow .18s;display:flex;box-shadow:0 1px rgba(2,6,23,.05);height:auto!important;color:inherit!important;position:static!important}.ao3h-menu a:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(2,6,23,.1);background:var(--ao3h-item-hover)!important}.ao3h-menu a:focus{box-shadow:0 0 0 0 transparent, var(--ao3h-focus-ring);outline:none}.ao3h-label{flex:auto;min-width:0}.ao3h-kbd{color:var(--ao3h-fg-dim);margin-left:.75rem;font-size:12px}.ao3h-state{text-align:center;width:1.2em}.ao3h-menu>li>a{text-transform:uppercase;letter-spacing:.25px;border-radius:6px;margin:4px 6px 2px;padding:.35rem .5rem;color:var(--ao3h-group-fg)!important;box-shadow:none!important;background:0 0!important;font-size:12px!important;font-weight:800!important}.ao3h-menu>li.ao3h-manager-panel-btn>a{text-transform:uppercase;letter-spacing:.25px;cursor:pointer;border-radius:6px;margin:4px 6px 2px;padding:.35rem .5rem;color:var(--ao3h-group-fg)!important;box-shadow:none!important;background:0 0!important;border:none!important;font-size:12px!important;font-weight:800!important;transform:none!important}.ao3h-menu>li.ao3h-manager-panel-btn>a:hover,.ao3h-menu>li.ao3h-manager-panel-btn>a:active,.ao3h-menu>li.ao3h-manager-panel-btn>a:focus{box-shadow:none!important;background:0 0!important;transform:none!important}.ao3h-menu>li.ao3h-divider[data-ao3h-manager-btn="1"]{display:none!important}.ao3h-menu>li.ao3h-manager-panel-btn .ao3h-icon-btn{margin-right:6px}ul.ao3h-submenu .ao3h-module-item{align-items:center!important;gap:4px!important;margin:0!important;padding:0!important;display:flex!important}ul.ao3h-submenu a{justify-content:space-between!important;align-items:center!important;gap:var(--ao3h-gap,.75rem)!important;white-space:nowrap!important;background:var(--ao3h-module-bg)!important;color:var(--ao3h-module-fg)!important;padding:.35rem .75rem!important;line-height:1.2!important;display:flex!important}ul.ao3h-submenu a .ao3h-label{flex:auto!important;min-width:0!important;font-size:12px!important}ul.ao3h-submenu a:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(2,6,23,.08);background:var(--ao3h-module-hover)!important;color:var(--ao3h-fg)!important}ul.ao3h-submenu .ao3h-settings-btn{width:18px!important;height:auto!important;min-height:24px!important;margin-right:0!important;font-size:10px!important}ul.ao3h-menu>li[data-ao3h-grouped-original="1"],ul.ao3h-menu>li:not([data-ao3h-submenu="1"]):not([data-ao3h-manager-btn="1"]):not(.ao3h-divider){display:none!important}ul.ao3h-submenu{margin:0;padding:0;list-style:none;box-shadow:none!important;background:0 0!important;border:0!important;display:none!important;position:static!important;top:auto!important;left:auto!important;right:auto!important;transform:none!important}ul.ao3h-submenu.open{display:block!important}.ao3h-submenu.dropdown-menu{min-width:0!important;box-shadow:none!important;background:0 0!important;border:0!important;margin:0!important;padding:0!important;position:static!important;top:auto!important;left:auto!important;right:auto!important;transform:none!important}.ao3h-menu li{position:static}.ao3h-divider{display:none!important}.ao3h-caret{margin-left:8px;transition:transform .15s}.ao3h-submenu>li>a .ao3h-caret{color:inherit;opacity:.9}li>a[aria-expanded=true] .ao3h-caret{transform:rotate(180deg)}li>a[aria-expanded=true]{background:rgba(0,0,0,.05)!important}.ao3h-menu>li>a[aria-expanded=true]{color:#fff!important;background:rgba(153,0,0,.85)!important;box-shadow:0 2px 8px rgba(153,0,0,.2)!important}.ao3h-navlink{color:#fff;padding:var(--ao3h-pad-y) var(--ao3h-pad-x);border-radius:10px;text-decoration:none;transition:background-color .2s,transform .12s;display:inline-block}.ao3h-root:hover .ao3h-navlink,.ao3h-root.open .ao3h-navlink{background:rgba(255,255,255,.18);transform:translateY(-1px)}.ao3h-root:focus-within .ao3h-navlink{background:rgba(255,255,255,.18);transform:translateY(-1px)}#header .primary.navigation>li>a,#header .primary.navigation.actions>li>a{transition:background-color .2s,transform .12s,color .2s!important}#header .primary.navigation>li>a:focus-visible:not(.ao3h-navlink){color:#fff!important;background:rgba(255,255,255,.18)!important;outline:none!important;transform:translateY(-1px)!important}#header .primary.navigation.actions>li>a:focus-visible:not(.ao3h-navlink){color:#fff!important;background:rgba(255,255,255,.18)!important;outline:none!important;transform:translateY(-1px)!important}.ao3h-menu{overscroll-behavior:contain;scrollbar-width:auto;scrollbar-color:rgba(0,0,0,.3) rgba(0,0,0,.08);scroll-behavior:smooth;max-height:calc(100vh - 120px);position:relative;overflow-x:hidden;overflow-y:auto}.ao3h-menu::-webkit-scrollbar{background:0 0;width:14px}.ao3h-menu::-webkit-scrollbar-track{background:rgba(0,0,0,.08);border-radius:7px;margin:8px 0}.ao3h-menu::-webkit-scrollbar-thumb{background:rgba(0,0,0,.3) padding-box content-box;border:3px solid transparent;border-radius:7px;transition:background .2s}.ao3h-menu::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.5) padding-box content-box}.ao3h-menu:before{content:"";pointer-events:none;z-index:10;opacity:0;background:linear-gradient(rgba(255,255,255,.8) 0%,rgba(255,255,255,.4) 50%,transparent 100%);height:20px;transition:opacity .3s;position:-webkit-sticky;position:sticky;top:0;left:0;right:0}.ao3h-menu.ao3h-scrolled-down:before{opacity:1}.ao3h-menu:after{content:"";pointer-events:none;z-index:10;opacity:0;background:linear-gradient(transparent 0%,rgba(255,255,255,.4) 50%,rgba(255,255,255,.8) 100%);height:0;transition:opacity .3s,height .3s;position:-webkit-sticky;position:sticky;bottom:0;left:0;right:0}.ao3h-menu.ao3h-has-scroll:after{opacity:1;height:20px}#header .menu>li{margin:0!important}#ao3h-ie-dialog::-ms-backdrop{background:rgba(2,6,23,.45)}#ao3h-ie-dialog::backdrop{background:rgba(2,6,23,.45)}#ao3h-ie-dialog{-webkit-backdrop-filter:blur(12px)saturate(130%);backdrop-filter:blur(12px)saturate(130%);width:360px;max-width:90vw;box-shadow:var(--ao3h-glass-shadow);color:var(--ao3h-fg);background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.35);border-radius:14px;padding:16px 16px 14px}#ao3h-ie-title{letter-spacing:.2px;margin:0 0 10px;font-size:16px;font-weight:800}#ao3h-ie-desc{color:var(--ao3h-fg-dim);margin:0 0 14px;font-size:13px}#ao3h-ie-row{gap:10px;margin-top:8px;display:flex}#ao3h-ie-row button{cursor:pointer;background:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.4);border-radius:10px;flex:1;padding:10px 12px;font-size:13px;transition:transform .12s,box-shadow .18s,background .18s}#ao3h-ie-row button:hover{background:rgba(255,255,255,.95);transform:translateY(-1px);box-shadow:0 10px 28px rgba(2,6,23,.12)}#ao3h-ie-row button[disabled]{opacity:.6;cursor:not-allowed;-webkit-filter:saturate(.6);filter:saturate(.6)}#ao3h-ie-foot{justify-content:flex-end;margin-top:10px;display:flex}#ao3h-ie-cancel{cursor:pointer;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.35);border-radius:10px;padding:6px 10px;font-size:12px}.ao3h-navlink:focus{outline:2px solid var(--ao3h-accent,#c21);outline-offset:2px;z-index:1;position:relative}.ao3h-navlink:focus-visible{outline:2px solid var(--ao3h-accent,#c21);outline-offset:2px;z-index:1;position:relative}.ao3h-menu a:focus{outline:2px solid var(--ao3h-accent,#c21);outline-offset:-2px;z-index:1}.ao3h-menu a:focus-visible{outline:2px solid var(--ao3h-accent,#c21);outline-offset:-2px;z-index:1}.ao3h-menu>li>a:focus-visible{background:var(--ao3h-hover-bg);outline:2px solid var(--ao3h-accent,#c21);outline-offset:-2px}.ao3h-submenu li a:focus-visible{background:var(--ao3h-hover-bg)}@media (prefers-contrast:high){.ao3h-navlink:focus,.ao3h-menu a:focus{outline:3px solid}}@media (prefers-color-scheme:dark){.ao3h-navlink:focus,.ao3h-menu a:focus{outline-color:#ff5a5a}}:root:not(.keyboard-navigation) .ao3h-menu a:focus:not(:focus-visible){outline:none}.ao3h-menu [role=menuitem],.ao3h-menu [role=menuitemcheckbox]{position:relative}@media (pointer:coarse){.ao3h-menu a{align-items:center;min-height:44px;display:flex}}.ao3h-skip-link{z-index:999;background:var(--ao3h-accent);color:#fff;border-radius:4px;padding:8px;text-decoration:none;position:absolute;left:-9999px}.ao3h-skip-link:focus{top:10px;left:10px}.ao3h-sr-only{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;position:absolute!important}.ao3h-sr-only:focus{clip:auto;white-space:normal;width:auto;height:auto;overflow:visible;position:static!important}.ao3h-live-region{width:1px;height:1px;position:absolute;left:-10000px;overflow:hidden}@media (prefers-reduced-motion:reduce){.ao3h-menu,.ao3h-submenu,.ao3h-navlink,.ao3h-menu a,.ao3h-switch{transition:none!important;animation:none!important}}@media (prefers-color-scheme:dark){.ao3h-menu{scrollbar-color:rgba(255,255,255,.3) rgba(255,255,255,.08);box-shadow:0 0 0 1px rgba(0,0,0,.6),0 8px 20px rgba(0,0,0,.6),0 18px 40px rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.35)!important}.ao3h-menu::-webkit-scrollbar-track{background:rgba(255,255,255,.08)}.ao3h-menu::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3)}.ao3h-menu::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.5)}.ao3h-menu:before{background:linear-gradient(rgba(16,21,38,.9) 0%,rgba(16,21,38,.5) 50%,transparent 100%)}.ao3h-menu:after{background:linear-gradient(transparent 0%,rgba(16,21,38,.5) 50%,rgba(16,21,38,.9) 100%)}.ao3h-menu>li.ao3h-manager-panel-btn>a{background:rgba(255,255,255,.08)!important}.ao3h-menu>li.ao3h-manager-panel-btn>a:hover{background:rgba(255,255,255,.12)!important}.ao3h-menu>li.ao3h-manager-panel-btn>a:active{background:rgba(255,255,255,.16)!important}#ao3h-ie-dialog{color:var(--ao3h-fg);background:rgba(16,21,38,.72)}}`,`ao3h-menu`),F(`.ao3h-panel-box{--ao3h-accent:#900;--ao3h-accent-hover:#c00;--ao3h-accent-rgb:153, 0, 0;--ao3h-text-primary:#333;--ao3h-text-secondary:#555;--ao3h-text-muted:#666;--ao3h-text-faint:#767676;--ao3h-text-hint:#767676;--ao3h-border:#e8e8e8;--ao3h-border-medium:#e0e0e0;--ao3h-border-strong:#d0d0d0;--ao3h-border-input:#cfd6e4;--ao3h-bg-surface:#fafafa;--ao3h-bg-hover:#f9f9f9;--ao3h-bg-subtle:#f5f5f5;--ao3h-radius-sm:4px;--ao3h-radius-md:6px;--ao3h-radius-lg:8px;--ao3h-space-1:4px;--ao3h-space-2:8px;--ao3h-space-3:12px;--ao3h-space-4:16px;--ao3h-space-5:20px;--ao3h-space-6:24px;--ao3h-space-8:32px;--ao3h-size-xxs:.6875rem;--ao3h-size-xs:.75rem;--ao3h-size-sm:.8125rem;--ao3h-size-base:.9375rem;--ao3h-label-color:var(--ao3h-text-primary);--ao3h-label-size:.8125rem;--ao3h-label-weight:600;--ao3h-title-color:var(--ao3h-accent);--ao3h-title-size:.9375rem;--ao3h-description-color:var(--ao3h-text-faint);--ao3h-description-size:var(--ao3h-size-xs);--ao3h-control-color:var(--ao3h-text-secondary);--ao3h-control-size:var(--ao3h-label-size);--ao3h-control-gap:8px;--ao3h-checkbox-accent:var(--ao3h-accent)}.ao3h-panel-backdrop{z-index:999998;background:rgba(0,0,0,.35);position:fixed;top:0;bottom:0;left:0;right:0}.ao3h-panel-box{z-index:999999;background:#fff;border-radius:6px;flex-direction:column;width:800px;max-width:98vw;height:650px;max-height:95vh;padding:0;font-family:Lucida Grande,Lucida Sans Unicode,Verdana,Helvetica,sans-serif;display:flex;position:fixed;top:50%;left:50%;overflow:hidden;transform:translate(-50%,-50%);box-shadow:0 16px 40px rgba(2,15,35,.12)}.ao3h-panel-box *{box-sizing:border-box}.ao3h-panel-box :where(button){color:inherit;font-size:inherit;font-weight:inherit;height:auto;min-height:0;line-height:inherit;box-sizing:border-box;cursor:pointer;vertical-align:middle;background:0 0;border:none;border-radius:0;align-items:center;width:auto;padding:0;font-family:inherit;text-decoration:none;display:inline-flex}.ao3h-panel-body{background:#fff;flex-direction:column;flex:1;order:4;padding:0;display:flex;position:relative;overflow:hidden}#ao3h-tab-container{padding:var(--ao3h-space-5) var(--ao3h-space-6);scroll-behavior:smooth;flex:1;min-height:400px;transition:opacity .2s ease-out;overflow-y:auto}.ao3h-panel-header{padding:var(--ao3h-space-4) 28px;border-bottom:1px solid var(--ao3h-border);background:#900 url(https://archiveofourown.org/images/skins/textures/tiles/red-ao3.png);order:1;justify-content:space-between;align-items:center;display:flex;box-shadow:inset 0 -6px 10px rgba(0,0,0,.35),1px 1px 3px -1px rgba(0,0,0,.25),inset 0 -1px rgba(0,0,0,.85)}.ao3h-panel-title{color:rgba(255,255,255,.85);letter-spacing:-.3px;text-shadow:0 1px 2px rgba(0,0,0,.35);margin:0;font-family:Georgia,serif;font-size:1.125rem;font-weight:600}.ao3h-panel-close{color:rgba(255,255,255,.75);cursor:pointer;border-radius:var(--ao3h-radius-md);background:0 0;border:none;padding:4px 8px;font-size:1.1rem;line-height:1;transition:background .2s,color .2s}.ao3h-panel-tabs-container{background:var(--ao3h-bg-surface);border-bottom:2px solid var(--ao3h-border);padding:var(--ao3h-space-2);justify-content:center;gap:var(--ao3h-space-1);flex-wrap:wrap;order:3;display:flex}.ao3h-panel-tabs-row{justify-content:center;gap:6px;width:100%;margin-bottom:6px;display:flex}.ao3h-panel-tabs-row:last-child{margin-bottom:0}.ao3h-tab-btn{border-radius:var(--ao3h-radius-lg);color:var(--ao3h-text-muted);cursor:pointer;white-space:nowrap;text-align:center;background:0 0;border:none;border-bottom:3px solid transparent;border-radius:4px;flex:none;justify-content:center;align-items:center;min-width:-webkit-fit-content;min-width:-moz-fit-content;min-width:fit-content;min-height:34px;padding:6px 12px;font-size:.8125rem;font-weight:600;line-height:1.3;transition:background .2s,color .2s,border-color .2s,box-shadow .2s;display:flex}.ao3h-tab-btn:hover{color:var(--ao3h-text-primary);background:rgba(var(--ao3h-accent-rgb), .05);border-bottom-color:rgba(var(--ao3h-accent-rgb), .3)}.ao3h-tab-btn:focus-visible{box-shadow:0 0 0 2px rgba(var(--ao3h-accent-rgb), .3);outline:none}.ao3h-tab-btn.ao3h-tab-active{color:var(--ao3h-accent);box-shadow:none;background:0 0;border:none;border-bottom:3px solid #900;border-radius:0;font-weight:600}.ao3h-global-search-wrapper{border-bottom:1px solid var(--ao3h-border);align-items:center;gap:var(--ao3h-space-2);background:#fff;flex-shrink:0;order:2;padding:8px 20px;display:flex}.ao3h-global-search-wrapper .ao3h-global-search-input{flex:1}.ao3h-global-search-wrapper .ao3h-bulk-actions-buttons{flex-shrink:0;gap:6px;display:flex}.ao3h-global-search-input{box-sizing:border-box;border:1px solid var(--ao3h-border-strong);border-radius:var(--ao3h-radius-sm);width:100%;font-size:var(--ao3h-size-xs);padding:8px 14px;transition:border-color .2s}.ao3h-global-search-input:focus{border-color:var(--ao3h-accent);box-shadow:0 0 0 2px rgba(var(--ao3h-accent-rgb), .08);outline:none}.ao3h-search-no-results{color:var(--ao3h-text-hint);text-align:center;font-size:var(--ao3h-size-sm);padding:24px 20px}.ao3h-search-tab-badge{font-size:var(--ao3h-size-xxs);color:var(--ao3h-text-muted);white-space:nowrap;background:#f0f0f0;border:1px solid #ddd;border-radius:3px;flex-shrink:0;margin-right:4px;padding:2px 6px;display:inline-block}.ao3h-module-container{border-bottom:1px solid var(--ao3h-border);transition:background-color .3s}.ao3h-module-container:last-child{border-bottom:none}.ao3h-module-container:has(.ao3h-module-config-area.ao3h-expanded){padding-bottom:var(--ao3h-space-4)}.ao3h-module-container.ao3h-highlight{background-color:rgba(144,0,0,.08);animation:.5s ease-in-out ao3h-highlight-pulse}@keyframes ao3h-highlight-pulse{0%{background-color:rgba(144,0,0,.2)}to{background-color:rgba(144,0,0,.08)}}.ao3h-module-row{align-items:center;gap:var(--ao3h-space-4);border-radius:var(--ao3h-radius-sm);cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border:2px solid transparent;margin:0 -8px;padding:8px 10px;transition:background .2s,border-color .2s;display:flex}.ao3h-module-row:hover{background:var(--ao3h-bg-hover);border-color:transparent}.ao3h-module-container:has(.ao3h-module-config-area.ao3h-expanded) .ao3h-module-row{background:var(--ao3h-bg-hover);border-color:#900;border-radius:4px 4px 0 0}.ao3h-module-quick-toggle{cursor:pointer;justify-content:center;align-items:center;margin:0;padding:0;display:flex;position:relative}.ao3h-module-quick-toggle:before{content:"";position:absolute;top:-8px;bottom:-8px;left:-12px;right:-12px}.ao3h-quick-enable-checkbox{cursor:pointer;accent-color:var(--ao3h-accent);width:16px!important;height:16px!important;margin:0!important}.ao3h-module-info{flex:1}.ao3h-module-name{font-size:var(--ao3h-size-base);color:var(--ao3h-text-primary);text-transform:none;letter-spacing:normal;margin-bottom:4px;font-family:Georgia,serif;font-weight:500}.ao3h-module-desc{color:var(--ao3h-description-color);padding-left:8px;font-size:.75rem;line-height:1.4}.ao3h-module-controls{gap:var(--ao3h-space-3);align-items:center;display:flex}.ao3h-config-btn{border-radius:var(--ao3h-radius-sm);padding:var(--ao3h-space-1) var(--ao3h-space-2);font-size:var(--ao3h-size-xxs);cursor:pointer;color:var(--ao3h-text-muted);vertical-align:baseline;text-align:center;box-sizing:border-box;background:0 0;border:none;flex-shrink:0;justify-content:center;align-items:center;min-width:24px;height:24px;line-height:1;transition:none;display:inline-flex}.ao3h-config-btn:hover{color:var(--ao3h-text-muted);background:0 0;border-color:transparent}.ao3h-module-config-area{interpolate-size:allow-keywords;background:var(--ao3h-bg-surface);border:2px solid var(--ao3h-border-medium);border-radius:0 0 var(--ao3h-radius-sm) var(--ao3h-radius-sm);opacity:0;height:0;font-size:var(--ao3h-size-sm);border-top:none;margin:0 -8px;padding:0 16px;transition:height .4s cubic-bezier(.4,0,.2,1),padding .4s cubic-bezier(.4,0,.2,1),opacity .4s cubic-bezier(.4,0,.2,1);overflow:clip}.ao3h-module-config-area.ao3h-expanded{height:auto;padding:var(--ao3h-space-4);padding-top:var(--ao3h-space-6);opacity:1;column-gap:var(--ao3h-space-6);row-gap:var(--ao3h-space-2);grid-template-columns:1fr 1fr;align-items:start;transition:height .4s cubic-bezier(.4,0,.2,1),padding .4s cubic-bezier(.4,0,.2,1),opacity .5s ease-out .1s;display:grid;overflow:visible}.ao3h-settings-row{flex-flow:row;align-items:flex-start;gap:16px 32px;display:flex}.ao3h-settings-row .ao3h-setting-item{flex:1}.ao3h-module-config-area.ao3h-expanded>.ao3h-settings-row{display:contents}.ao3h-config-section{grid-column:1/-1;grid-template-columns:subgrid;row-gap:var(--ao3h-space-2);align-items:start;margin-bottom:0;display:grid}.ao3h-config-section:last-child{margin-bottom:0}.ao3h-config-section+.ao3h-config-section{padding-top:2px}.ao3h-setting-group{grid-column:1/-1;grid-template-columns:subgrid;border:1px solid var(--ao3h-border);border-radius:var(--ao3h-radius-md);padding:var(--ao3h-space-3) var(--ao3h-space-4);align-items:start;row-gap:5px;margin-bottom:8px;display:grid;box-shadow:inset 0 2px 6px rgba(0,0,0,.15)}.ao3h-setting-group:last-child{margin-bottom:0}.ao3h-setting-group>.ao3h-setting-label{margin-bottom:8px}.ao3h-setting-group>.ao3h-setting-item{margin-bottom:0}:-webkit-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>:-webkit-any(.ao3h-config-row,.ao3h-setting-description,.ao3h-setting-label,.ao3h-config-block,div[id]:not(.ao3h-setting-item)){grid-column:1/-1}:-moz-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>:-moz-any(.ao3h-config-row,.ao3h-setting-description,.ao3h-setting-label,.ao3h-config-block,div[id]:not(.ao3h-setting-item)){grid-column:1/-1}:is(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>:is(.ao3h-config-row,.ao3h-setting-description,.ao3h-setting-label,.ao3h-config-block,div[id]:not(.ao3h-setting-item)){grid-column:1/-1}:-webkit-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section)>:-webkit-any(.ao3h-config-section-title,.ao3h-config-footer){grid-column:1/-1}:-moz-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section)>:-moz-any(.ao3h-config-section-title,.ao3h-config-footer){grid-column:1/-1}:is(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section)>:is(.ao3h-config-section-title,.ao3h-config-footer){grid-column:1/-1}:-webkit-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section)>:-webkit-any(.ao3h-setting-item,.ao3h-setting-group,.ao3h-setting-label,.ao3h-setting-description){margin-bottom:0}:-moz-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section)>:-moz-any(.ao3h-setting-item,.ao3h-setting-group,.ao3h-setting-label,.ao3h-setting-description){margin-bottom:0}:is(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section)>:is(.ao3h-setting-item,.ao3h-setting-group,.ao3h-setting-label,.ao3h-setting-description){margin-bottom:0}.ao3h-config-section>div[id]:not(.ao3h-setting-item)>.ao3h-setting-item{margin-bottom:0}:where(.ao3h-module-config-area.ao3h-expanded>div[id]:not(.ao3h-setting-item),.ao3h-config-section>div[id]:not(.ao3h-setting-item)):has(>.ao3h-setting-item){column-gap:var(--ao3h-space-6);row-gap:var(--ao3h-space-2);grid-template-columns:1fr 1fr;align-items:start;display:grid}:-webkit-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>.ao3h-setting-item:has(.ao3h-setting-control--radios-stacked,.ao3h-setting-control--checkboxes,.ao3h-radio-group,input:not([type=checkbox]):not([type=radio]),select,.ao3h-setting-note){grid-column:1/-1}:-moz-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>.ao3h-setting-item:has(.ao3h-setting-control--radios-stacked,.ao3h-setting-control--checkboxes,.ao3h-radio-group,input:not([type=checkbox]):not([type=radio]),select,.ao3h-setting-note){grid-column:1/-1}:is(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>.ao3h-setting-item:has(.ao3h-setting-control--radios-stacked,.ao3h-setting-control--checkboxes,.ao3h-radio-group,input:not([type=checkbox]):not([type=radio]),select,.ao3h-setting-note){grid-column:1/-1}.ao3h-col1{grid-column:1!important}.ao3h-col2{grid-column:2!important}.ao3h-full{grid-column:1/-1!important}.ao3h-module-config-area label,.ao3h-module-config-area p{font-size:var(--ao3h-label-size)}.ao3h-setting-item{margin-bottom:14px}.ao3h-setting-item:last-child{margin-bottom:0}.ao3h-setting-description{font-size:var(--ao3h-description-size);color:var(--ao3h-description-color);margin-top:2px;margin-bottom:8px;line-height:1.5}.ao3h-setting-item:has(+.ao3h-setting-description){margin-bottom:2px}.ao3h-module-config-area.ao3h-expanded>.ao3h-setting-item+.ao3h-setting-description,.ao3h-config-section>.ao3h-setting-item+.ao3h-setting-description{margin-top:-4px}.ao3h-setting-label{font-size:var(--ao3h-label-size);font-weight:var(--ao3h-label-weight);color:var(--ao3h-label-color);margin-bottom:8px;display:block}.ao3h-setting-item>.ao3h-setting-label{margin-top:var(--ao3h-space-4);margin-bottom:var(--ao3h-space-4)}.ao3h-config-section>.ao3h-config-section-title+.ao3h-setting-item>.ao3h-setting-label{margin-top:0}.ao3h-module-config-area.ao3h-expanded>.ao3h-setting-item~.ao3h-setting-label,.ao3h-config-section>.ao3h-setting-item~.ao3h-setting-label,.ao3h-module-config-area.ao3h-expanded>.ao3h-setting-description~.ao3h-setting-label,.ao3h-config-section>.ao3h-setting-description~.ao3h-setting-label{margin-top:var(--ao3h-space-2)}.ao3h-setting-note{font-size:var(--ao3h-size-xxs);color:var(--ao3h-text-hint);margin-left:4px;font-weight:400}.ao3h-setting-control{align-items:center;gap:var(--ao3h-control-gap);font-size:var(--ao3h-control-size);color:var(--ao3h-control-color);margin-bottom:6px;display:flex}.ao3h-setting-control:last-child{margin-bottom:0}.ao3h-setting-control label{cursor:pointer;align-items:center;gap:8px;line-height:1;display:inline-flex}.ao3h-panel-box input[type=checkbox]{vertical-align:unset;accent-color:var(--ao3h-accent);flex-shrink:0;align-self:center;transform:translateY(-1px);width:14px!important;height:14px!important;box-shadow:none!important;-webkit-appearance:auto!important;-moz-appearance:auto!important;-ms-appearance:auto!important;appearance:auto!important;border:none!important;margin:0!important}.ao3h-panel-box input[type=radio]{vertical-align:unset;accent-color:var(--ao3h-accent);flex-shrink:0;align-self:center;transform:translateY(-1px);width:14px!important;height:14px!important;box-shadow:none!important;-webkit-appearance:auto!important;-moz-appearance:auto!important;-ms-appearance:auto!important;appearance:auto!important;border:none!important;margin:0!important}.ao3h-panel-box label:has(input[type=checkbox]){align-items:center;gap:8px;line-height:1;display:inline-flex}.ao3h-panel-box label:has(input[type=radio]){align-items:center;gap:8px;line-height:1;display:inline-flex}.ao3h-setting-control.ao3h-setting-control--checkboxes{flex-flow:wrap;align-items:center;gap:6px 16px;margin-bottom:0}.ao3h-setting-control.ao3h-setting-control--checkboxes-stacked,.ao3h-setting-control.ao3h-setting-control--radios-stacked{flex-direction:column;align-items:flex-start;gap:10px;margin-bottom:0}.ao3h-setting-control.ao3h-setting-control--radios,.ao3h-setting-control.ao3h-radio-group{flex-wrap:wrap;align-items:center;gap:6px 16px;margin-bottom:0}.ao3h-setting-control.ao3h-radios-cols{grid-template-columns:1fr 1fr;align-items:start;gap:6px 16px;display:grid}.ao3h-color-swatch-group{gap:var(--ao3h-space-2);flex-wrap:wrap;align-items:center;display:flex}.ao3h-color-swatch-label{cursor:pointer;display:flex;position:relative}.ao3h-color-swatch-label input[type=radio]{opacity:0;pointer-events:none;width:1px;height:1px;position:absolute}.ao3h-color-swatch{box-sizing:border-box;border:2px solid transparent;border-radius:50%;width:22px;height:22px;transition:transform .1s,border-color .1s;display:inline-block}.ao3h-color-swatch-label:hover .ao3h-color-swatch{border-color:var(--ao3h-text-faint);transform:scale(1.15)}.ao3h-color-swatch-label input[type=radio]:checked~.ao3h-color-swatch{border-color:var(--ao3h-text-primary);box-shadow:0 0 0 2px #fff, 0 0 0 4px var(--ao3h-text-primary)}.ao3h-setting-checkbox{cursor:pointer;accent-color:var(--ao3h-checkbox-accent);width:16px!important;height:16px!important}.ao3h-quick-access>a{font-weight:600;color:#2c5f8a!important}.ao3h-settings-section{padding-bottom:var(--ao3h-space-4);margin-bottom:var(--ao3h-space-4);border-bottom:1px solid var(--ao3h-border)}.ao3h-settings-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}.ao3h-setting-hint{font-size:var(--ao3h-size-xxs);color:var(--ao3h-text-faint);margin-top:4px;line-height:1.4}.ao3h-config-section>.ao3h-section-actions{order:99;grid-column:1/-1;justify-content:flex-start;margin-top:10px}.ao3h-config-section>.ao3h-config-row:has([data-action*=export],[data-action*=import]){order:99;grid-column:1/-1;justify-content:flex-start;margin-top:10px}.ao3h-config-section>.ao3h-config-section-title+.ao3h-config-row:has([data-action*=export],[data-action*=import]){margin-top:0}.ao3h-config-section>.ao3h-section-actions:has([data-action^=clear]){justify-content:flex-start}.ao3h-config-section>.ao3h-config-row:has([data-action*=export],[data-action*=import]):has([data-action^=clear]){justify-content:flex-start}.ao3h-module-config-area .ao3h-section-actions{margin-top:10px}[data-action^=clear]{margin-left:auto}.ao3h-config-section>.ao3h-config-row:has([data-action^=clear]):not(:has([data-action*=import],[data-action*=export])){order:99;grid-column:1/-1;justify-content:flex-end;margin-top:10px}.ao3h-config-section-title{font-size:var(--ao3h-title-size);color:var(--ao3h-title-color);padding:var(--ao3h-space-5) 0 4px 0;margin:var(--ao3h-space-4) 0 var(--ao3h-space-4);border-top:1px solid var(--ao3h-border-strong);align-items:baseline;font-family:Georgia,serif;font-weight:400;display:flex}.ao3h-config-section:first-child>.ao3h-config-section-title{border-top:none;margin-top:0;padding-top:4px}.ao3h-section-count{font-weight:400;font-size:var(--ao3h-size-xs);color:#bbb;margin-left:auto}.ao3h-section-actions{gap:var(--ao3h-space-1);justify-content:flex-start;align-items:start;display:flex}.ao3h-section-actions:has([data-action^=clear]){justify-content:flex-start}.ao3h-section-title-clear{font-size:var(--ao3h-size-xxs);opacity:.7;margin-bottom:2px;padding:2px 8px;transition:opacity .15s}.ao3h-section-title-clear:hover{opacity:1}.ao3h-section-disabled{opacity:.38;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-filter:grayscale(.25);filter:grayscale(.25)}.ao3h-config-input{font-size:var(--ao3h-size-xs);border:1px solid var(--ao3h-border-input);border-radius:var(--ao3h-radius-sm);box-sizing:border-box;background:#fff;padding:6px 10px;box-shadow:inset 0 1px 2px #ccc}.ao3h-setting-select{font-size:var(--ao3h-size-sm);padding:var(--ao3h-space-1) var(--ao3h-space-2);border:1px solid var(--ao3h-border-input);border-radius:var(--ao3h-radius-sm);background:#fff}.ao3h-select{border:1px solid var(--ao3h-border-strong);border-radius:var(--ao3h-radius-sm);font-size:var(--ao3h-size-xs);color:var(--ao3h-text-primary);cursor:pointer;background:#fff;min-width:140px;padding:6px 10px}.ao3h-select:focus{border-color:var(--ao3h-accent);outline:none}.ao3h-input{border:1px solid var(--ao3h-border-strong);border-radius:var(--ao3h-radius-sm);font-size:var(--ao3h-size-xs);color:var(--ao3h-text-primary);background:#fff;padding:6px 10px}.ao3h-input:focus{border-color:var(--ao3h-accent);outline:none}.ao3h-inline-btn{color:#444;height:28px;box-shadow:none;font-size:var(--ao3h-size-xs);cursor:pointer;white-space:nowrap;background:linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);border:1px solid #bbb;border-bottom-color:#aaa;border-radius:3px;flex-shrink:0;padding:0 10px}.ao3h-inline-btn:not(.ao3h-inline-btn--danger):hover{border-top-color:#999;border-left-color:#999;box-shadow:inset 2px 2px 2px #bbb}.ao3h-inline-btn--green{color:#2e7d32;background:linear-gradient(#f1f8e9 2%,#c8e6c9 95%,#a5d6a7 100%);padding:0 12px;font-weight:400}.ao3h-inline-btn--purple{color:var(--ao3h-text-primary);padding:0 12px;font-weight:400}.ao3h-inline-btn--danger{color:#c62828;background:#fff5f5;border-color:#e57373}.ao3h-group-select{position:relative}.ao3h-group-select__trigger{text-align:left;cursor:pointer;white-space:nowrap;text-overflow:ellipsis;color:#757575;width:100%;height:28px;padding-right:28px;position:relative;overflow:hidden}.ao3h-group-select__trigger:after{content:"▾";color:#666;pointer-events:none;font-size:13px;position:absolute;top:50%;right:10px;transform:translateY(-50%)}.ao3h-group-select__trigger--active{color:var(--ao3h-text-primary);font-weight:600}.ao3h-group-select__panel{border-radius:var(--ao3h-radius-sm);z-index:9999;background:#fff;border:1px solid #ccc;max-height:200px;position:absolute;top:calc(100% + 3px);left:0;right:0;overflow-y:auto;box-shadow:0 4px 10px rgba(0,0,0,.12)}.ao3h-group-select__option{cursor:pointer;font-size:var(--ao3h-size-xs);text-align:center;border-bottom:1px solid var(--ao3h-border);padding:6px 10px}.ao3h-group-select__option:last-child{border-bottom:none}.ao3h-group-select__option:hover{background:var(--ao3h-bg-subtle)}.ao3h-group-select__option--selected{color:var(--ao3h-text-primary);font-weight:700}.ao3h-group-select__option--new{color:#2d4f78;background:#edf2f9;border-top:2px solid #c2d4e8;border-bottom:none;font-weight:600}.ao3h-group-select__option--new:hover{background:#dde8f5}.ao3h-config-row{margin-top:var(--ao3h-space-2);flex-wrap:wrap;align-items:center;gap:6px;padding-top:8px;display:flex}.ao3h-config-row:first-child,.ao3h-config-block>.ao3h-config-row{margin-top:0;padding-top:0}.ao3h-config-row:last-child{margin-bottom:0}:-webkit-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>.ao3h-config-row{margin-top:0;margin-bottom:0;padding-top:0}:-moz-any(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>.ao3h-config-row{margin-top:0;margin-bottom:0;padding-top:0}:is(.ao3h-module-config-area.ao3h-expanded,.ao3h-config-section,.ao3h-setting-group)>.ao3h-config-row{margin-top:0;margin-bottom:0;padding-top:0}.ao3h-config-row>label{cursor:pointer;align-items:center;gap:5px;display:inline-flex}.ao3h-config-row--end{justify-content:flex-end;gap:var(--ao3h-space-1)}.ao3h-config-row--tight{margin-bottom:4px;padding-top:0}.ao3h-config-row:has(+.ao3h-config-row--tight){margin-bottom:2px}.ao3h-config-row--wide{gap:var(--ao3h-space-4)}.ao3h-label--bold{font-weight:600}.ao3h-label--secondary{font-size:var(--ao3h-size-xs);color:var(--ao3h-text-muted)}.ao3h-indent{padding-left:32px}.ao3h-config-row.ao3h-config-row--child{margin-top:0;padding-top:8px;padding-left:32px}.ao3h-config-section-title+.ao3h-config-row{margin-bottom:8px}.ao3h-config-block+.ao3h-config-row--end{margin-top:var(--ao3h-space-4)}.ao3h-setting-item+.ao3h-indent,.ao3h-config-block+.ao3h-indent{margin-top:-6px}.ao3h-setting-description+.ao3h-config-row{margin-top:6px}.ao3h-config-row+.ao3h-config-block{margin-top:12px}:has(>.ao3h-config-row:last-child)+.ao3h-config-block{margin-top:12px}.ao3h-config-section>div[id]:not(.ao3h-setting-item):not(:first-child),.ao3h-module-config-area.ao3h-expanded>div[id]:not(.ao3h-setting-item):not(:first-child){padding-top:10px}.ao3h-setting-item+.ao3h-config-row,.ao3h-setting-control+.ao3h-config-row{margin-top:var(--ao3h-space-2)}.ao3h-config-separator{background:var(--ao3h-border-medium);flex-shrink:0;width:1px;height:16px}.ao3h-config-divider{border:none;border-top:1px solid var(--ao3h-border);grid-column:1/-1}.ao3h-setting-description:last-child,.ao3h-config-block>.ao3h-setting-item:last-child{margin-bottom:0}.ao3h-config-chipbox{min-height:38px;padding:var(--ao3h-space-2);border:1px solid var(--ao3h-border-input);border-radius:var(--ao3h-radius-lg);background:#fff;flex-wrap:wrap;align-items:center;gap:5px;margin-bottom:8px;display:flex}.ao3h-checkbox-group{gap:var(--ao3h-space-3);flex-wrap:wrap}.ao3h-checkbox-label{font-size:var(--ao3h-size-xs);color:var(--ao3h-text-secondary);cursor:pointer;align-items:center;gap:6px;display:inline-flex}.ao3h-checkbox-label input[type=checkbox]{cursor:pointer}.ao3h-radio-label{font-size:var(--ao3h-size-xs);color:var(--ao3h-text-secondary);cursor:pointer;align-items:flex-start;gap:6px;line-height:1.4;display:flex}.ao3h-radio-label input[type=radio]{margin-top:2px}.ao3h-btn{border-radius:var(--ao3h-radius-sm);font-size:var(--ao3h-size-xs);cursor:pointer;white-space:nowrap;justify-content:center;align-items:center;height:28px;padding:6px 12px;font-weight:500;line-height:1;transition:all .2s;display:inline-flex}.ao3h-btn-primary{background:var(--ao3h-accent);color:#fff;border:none}.ao3h-btn-primary:hover{background:var(--ao3h-accent-hover)}.ao3h-btn-secondary{color:var(--ao3h-text-muted);border:1px solid var(--ao3h-border-strong);background:0 0}.ao3h-btn-secondary:hover{background:var(--ao3h-bg-subtle);color:var(--ao3h-text-primary);border-color:#bbb}.ao3h-config-footer{border-top:1px solid var(--ao3h-border-medium);justify-content:flex-end;align-items:center;gap:var(--ao3h-space-2);margin-top:6px;padding-top:8px;display:flex}.ao3h-config-save-btn{color:#900;font-size:var(--ao3h-size-xs);cursor:pointer;box-shadow:none;white-space:nowrap;box-sizing:border-box;background:linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);border:1px solid #bbb;border-bottom-color:#aaa;border-radius:.25em;justify-content:center;align-items:center;height:28px;padding:6px 12px;font-weight:600;line-height:1;display:inline-flex}.ao3h-config-save-btn:hover{color:#900;border-top-color:#999;border-left-color:#999;box-shadow:inset 2px 2px 2px #bbb}.ao3h-config-reset-btn{color:#444;font-size:var(--ao3h-size-xs);cursor:pointer;box-shadow:none;white-space:nowrap;box-sizing:border-box;background:linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);border:1px solid #bbb;border-bottom-color:#aaa;border-radius:.25em;justify-content:center;align-items:center;height:28px;margin-right:auto;padding:6px 12px;font-weight:400;line-height:1;display:inline-flex}.ao3h-config-reset-btn:hover{color:#900;border-top-color:#999;border-left-color:#999;box-shadow:inset 2px 2px 2px #bbb}.ao3h-config-reset-btn.ao3h-reset-confirming{color:#7d5a00;background:#fff3cd;border-color:#e6a817;font-weight:600;animation:.4s ao3h-reset-pulse}.ao3h-config-reset-btn.ao3h-reset-confirming:hover{color:#5a3e00;background:#ffe69c;border-color:#c87800}@keyframes ao3h-reset-pulse{0%{transform:scale(1)}40%{transform:scale(1.06)}to{transform:scale(1)}}.ao3h-panel-box .ao3h-bulk-actions{z-index:100;background:var(--ao3h-bg-surface);border-top:1px solid var(--ao3h-border);padding:var(--ao3h-space-2) var(--ao3h-space-6);gap:var(--ao3h-space-3);font-size:var(--ao3h-size-xs);border-radius:0;flex-shrink:0;order:5;justify-content:flex-end;align-items:center;margin:0;display:flex;position:relative;bottom:auto;left:0;right:0}.ao3h-bulk-actions .note-box strong{color:var(--ao3h-text-primary)!important}.ao3h-bulk-actions-buttons{align-items:center;gap:6px;display:none}.ao3h-panel-box .ao3h-panel-action-btn{font-size:var(--ao3h-size-xs);color:#444;box-shadow:none;cursor:pointer;white-space:nowrap;box-sizing:border-box;background:linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);border:1px solid #bbb;border-bottom-color:#aaa;border-radius:.25em;justify-content:center;align-items:center;height:28px;padding:6px 12px;font-weight:400;line-height:1;display:inline-flex}.ao3h-panel-box .ao3h-panel-action-btn:hover{color:#900;border-top-color:#999;border-left-color:#999;box-shadow:inset 2px 2px 2px #bbb}#ao3h-tab-container>.note-box{display:none!important}.ao3h-tab-count{text-align:right;font-size:var(--ao3h-size-xxs);color:var(--ao3h-text-hint);margin-top:-10px;margin-bottom:8px;padding:0 4px;font-weight:400}.ao3h-bulk-actions .note-box{font-size:var(--ao3h-size-xs)!important;color:var(--ao3h-text-muted)!important;background:0 0!important;border:none!important;border-radius:0!important;flex:1!important;margin:0 16px 0 0!important;padding:6px 10px!important;font-weight:500!important;display:block!important}.ao3h-footer-status{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.ao3h-footer-unsaved{color:#900;font-weight:600}.ao3h-picker-row{gap:var(--ao3h-space-2);align-items:center;display:flex}.ao3h-picker-row .ao3h-select{flex:1}.ao3h-picker-row .ao3h-btn{flex-shrink:0}.ao3h-chip-container{margin-top:var(--ao3h-space-2);border-radius:var(--ao3h-radius-sm);background:0 0;border:none;flex-wrap:wrap;align-items:center;gap:6px;min-height:28px;padding:6px;display:flex}.ao3h-picker-row+.ao3h-chip-container{margin-top:0;margin-left:4px}.ao3h-chip-container:empty:before{content:attr(data-empty-text);color:var(--ao3h-text-hint);font-style:italic;font-size:var(--ao3h-size-xxs)}.ao3h-chip-container:empty:not([data-empty-text]):before{content:"No items selected"}.ao3h-chip{background:var(--ao3h-accent);color:#fff;font-size:var(--ao3h-size-xxs);border-radius:12px;align-items:center;gap:2px;padding:2px 4px 2px 8px;display:inline-flex}.ao3h-chip button{color:rgba(255,255,255,.7);cursor:pointer;font-size:var(--ao3h-size-xs);background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;width:14px;height:14px;padding:0;line-height:1;display:flex}.ao3h-chip button:hover{color:#fff;background:rgba(255,255,255,.2)}.ao3h-chip--neutral{color:var(--ao3h-text-secondary);border:1px solid var(--ao3h-border-medium);background:#f0f0f0}.ao3h-chip--neutral button{color:#aaa}.ao3h-chip--neutral button:hover{color:var(--ao3h-text-primary);background:rgba(0,0,0,.08)}.ao3h-tag-chips{flex-wrap:wrap;gap:10px;display:flex}.ao3h-tag-chips-card{background:#fff;border:1px solid #e6e8ee;border-radius:10px;padding:10px 12px}.ao3h-tag-chips-card--empty{display:none}.ao3h-tag-chip{font-size:var(--ao3h-size-xxs);white-space:nowrap;background:#fff;border:1px solid #e6e8ee;border-radius:10px;align-items:center;gap:3px;max-width:160px;padding:4px 8px 4px 12px;transition:border-color .12s,background .12s;display:inline-flex}.ao3h-tag-chip>.ao3h-tag-chip-text{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.ao3h-tag-chip button{cursor:pointer;font-size:var(--ao3h-size-xs);border-radius:var(--ao3h-radius-sm);opacity:0;width:0;height:16px;color:var(--ao3h-text-faint);background:0 0;border:none;flex-shrink:0;justify-content:center;align-items:center;padding:0;line-height:1;transition:width .15s,opacity .12s;display:flex;overflow:hidden}.ao3h-tag-chip:hover button{opacity:1;width:16px}.ao3h-tag-chip button:hover{color:var(--ao3h-text-primary);background:rgba(0,0,0,.08)}.ao3h-tag-chip button.ao3h-tag-chip-remove{color:#900;opacity:.45;background:0 0;border:none;border-radius:3px;width:16px}.ao3h-tag-chip button.ao3h-tag-chip-remove:hover{opacity:1;background:0 0}.ao3h-module-list{gap:var(--ao3h-space-1);margin-top:var(--ao3h-space-2);scrollbar-width:thin;scrollbar-color:#ddd transparent;flex-direction:column;max-height:215px;display:flex;overflow-y:auto}.ao3h-module-list::-webkit-scrollbar{width:4px}.ao3h-module-list::-webkit-scrollbar-track{background:0 0}.ao3h-module-list::-webkit-scrollbar-thumb{background:#ddd;border-radius:1px}.ao3h-module-list::-webkit-scrollbar-thumb:hover{background:#bbb}.ao3h-module-list-entry{align-items:center;gap:var(--ao3h-space-2);border:1px solid var(--ao3h-border);font-size:var(--ao3h-size-xs);background:#fff;border-radius:5px;padding:6px 8px;display:flex;position:relative}.ao3h-module-list-entry:hover{border-color:var(--ao3h-border-strong);background:var(--ao3h-bg-surface)}.ao3h-module-list-entry-title{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.ao3h-module-list-entry-title a{color:var(--ao3h-accent);font-weight:500;font-size:var(--ao3h-size-sm);text-decoration:none}.ao3h-module-list-entry-title a:hover{text-decoration:underline}.ao3h-module-list-entry-meta{color:var(--ao3h-text-hint);font-size:var(--ao3h-size-xs);margin-left:4px}.ao3h-module-list-entry-badge{color:var(--ao3h-text-secondary);font-size:var(--ao3h-size-xs);white-space:nowrap;text-overflow:ellipsis;background:#f0f0f0;border-radius:10px;flex-shrink:1;max-width:180px;padding:4px 10px;transition:max-width .2s,white-space .1s;overflow:hidden}.ao3h-module-list-entry-actions{gap:var(--ao3h-space-1);flex-shrink:0;display:flex}.ao3h-module-list-footer{justify-content:space-between;align-items:flex-start;margin-top:-2px;display:flex}.ao3h-module-list-count{font-size:var(--ao3h-size-xs);color:var(--ao3h-text-hint);margin-top:-6px}.ao3h-setting-label--small{font-size:var(--ao3h-size-xs)}.ao3h-setting-label--large{font-size:var(--ao3h-size-sm)}.ao3h-setting-label--normal{font-weight:400}.ao3h-setting-label--muted{color:var(--ao3h-text-hint);font-weight:400}.ao3h-config-section-title--accent{color:var(--ao3h-accent)}.ao3h-config-section-title--no-border{border-top:none}.ao3h-config-section-title--compact{padding-bottom:1px}.ao3h-setting-item--indent{border-left:2px solid var(--ao3h-border);margin-left:2px;padding-left:14px}.ao3h-setting-item--compact{margin-bottom:4px}.ao3h-setting-description--warning{color:#7d5a00;padding:var(--ao3h-space-1) var(--ao3h-space-2);background:#fff8e1;border-left:3px solid #f5a623;border-radius:0 4px 4px 0;margin-top:4px}.ao3h-setting-description--info{color:#1565c0;padding:var(--ao3h-space-1) var(--ao3h-space-2);background:#e3f2fd;border-left:3px solid #2196f3;border-radius:0 4px 4px 0;margin-top:4px}.ao3h-setting-description--success{color:#2e7d32;padding:var(--ao3h-space-1) var(--ao3h-space-2);background:#e8f5e9;border-left:3px solid #4caf50;border-radius:0 4px 4px 0;margin-top:4px}.ao3h-setting-description--danger{color:#c62828;padding:var(--ao3h-space-1) var(--ao3h-space-2);background:#fff5f5;border-left:3px solid #e57373;border-radius:0 4px 4px 0;margin-top:4px}.ao3h-setting-control--column{flex-direction:column;align-items:flex-start;gap:6px}.ao3h-setting-checkbox--large{width:18px!important;height:18px!important}.ao3h-help-btn{border:1px solid var(--ao3h-border-strong);background:var(--ao3h-bg-subtle);color:#aaa;cursor:pointer;vertical-align:text-top;border-radius:50%;flex-shrink:0;justify-content:center;align-items:center;width:14px;height:14px;margin-left:5px;padding:0;font-size:.5625rem;font-weight:700;line-height:1;transition:background .15s,border-color .15s,color .15s;display:inline-flex;position:relative;top:-2px}.ao3h-help-btn:hover{border-color:var(--ao3h-accent);color:var(--ao3h-accent);background:#fff0f0}.ao3h-help-tooltip{z-index:1000001;border:1px solid var(--ao3h-border-medium);border-radius:var(--ao3h-radius-md);max-width:220px;font-size:var(--ao3h-size-xxs);color:var(--ao3h-text-secondary);background:#fff;padding:8px 10px;line-height:1.5;transition:opacity .4s;position:fixed;box-shadow:0 4px 16px rgba(0,0,0,.12)}.ao3h-help-tooltip--closing{opacity:0}.ao3h-setting-item[data-help-wired] .ao3h-setting-description,.ao3h-setting-label[data-help-wired]+.ao3h-setting-description{display:none}.ao3h-setting-item[data-help-wired]:has(+.ao3h-setting-description){margin-bottom:unset}.ao3h-panel-box{font-family:Lucida Grande,Lucida Sans Unicode,Verdana,Helvetica,sans-serif}.ao3h-panel-header{background:#900 url(https://archiveofourown.org/images/skins/textures/tiles/red-ao3.png);box-shadow:inset 0 -6px 10px rgba(0,0,0,.35),1px 1px 3px -1px rgba(0,0,0,.25),inset 0 -1px rgba(0,0,0,.85)}.ao3h-panel-title{color:rgba(255,255,255,.85);text-shadow:0 1px 2px rgba(0,0,0,.35);font-family:Georgia,serif;font-weight:600}.ao3h-panel-close{color:rgba(255,255,255,.75);background:0 0;padding:4px 8px;font-size:1.1rem}.ao3h-panel-close:hover{color:#fff;background:0 0}.ao3h-panel-tabs-row{gap:6px;margin-bottom:6px}.ao3h-tab-btn{border-radius:4px;font-size:.8125rem}.ao3h-tab-btn.ao3h-tab-active{color:#900;box-shadow:none;background:0 0;border:none;border-bottom:3px solid #900;border-radius:0}.ao3h-global-search-wrapper{background:#fff;padding:8px 20px}.ao3h-bulk-actions-buttons{display:none!important}.ao3h-module-row{padding:8px 10px}.ao3h-module-row:hover{border-color:transparent}.ao3h-module-row:hover .ao3h-module-name{color:#900}.ao3h-module-name{margin-bottom:8px;font-family:Georgia,serif;font-weight:500}.ao3h-module-desc{color:#767676;padding-left:8px;font-size:.75rem}.ao3h-tag-chip{color:#555;background:#fff;border:1px solid #e6e8ee;border-radius:10px}.ao3h-tag-chip:hover{background:#fff5f5;border-color:#900}.ao3h-panel-box input[type=checkbox]{accent-color:#900}.ao3h-panel-box input[type=radio]{accent-color:#900}.ao3h-setting-group{box-shadow:inset 0 2px 6px rgba(0,0,0,.15)}.ao3h-config-input,.ao3h-inline-btn{border-radius:3px}.ao3h-inline-btn:not(.ao3h-inline-btn--red):not(.ao3h-inline-btn--danger){color:#444;box-shadow:none;background-image:linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);border:1px solid #bbb;border-bottom-color:#aaa}.ao3h-inline-btn.ao3h-inline-btn--green{color:#2e7d32;background-image:linear-gradient(#f1f8e9 2%,#c8e6c9 95%,#a5d6a7 100%)}.ao3h-config-action-btn{font-weight:400}.ao3h-inline-btn:not(.ao3h-inline-btn--red):not(.ao3h-inline-btn--danger):hover{border-top-color:#999;border-left-color:#999;box-shadow:inset 2px 2px 2px #bbb}.ao3h-footer-close,.ao3h-config-save-btn,.ao3h-config-reset-btn{color:#444;box-shadow:none;background:#eee linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);border:1px solid #bbb;border-bottom-color:#aaa;border-radius:.25em}.ao3h-config-save-btn{color:#900;font-weight:600}.ao3h-footer-close:hover,.ao3h-config-save-btn:hover,.ao3h-config-reset-btn:hover{color:#900;border-top-color:#999;border-left-color:#999;box-shadow:inset 2px 2px 2px #bbb}.ao3h-footer-close:hover{color:#900}@media (max-width:700px){.ao3h-module-config-area.ao3h-expanded{grid-template-columns:1fr;column-gap:0}:where(.ao3h-module-config-area.ao3h-expanded>div[id]:not(.ao3h-setting-item),.ao3h-config-section>div[id]:not(.ao3h-setting-item)):has(>.ao3h-setting-item){grid-template-columns:1fr}.ao3h-setting-control.ao3h-radios-cols{grid-template-columns:1fr}}`,`ao3h-panel`),Ce(),Xa(),ka()})();
