/*! @ryanmorr/avalon v1.0.0 | https://github.com/ryanmorr/avalon */
"use strict";var t=function(e,n,r,i){var s;n[0]=0;for(var o=1;o<n.length;o++){var l=n[o++],u=n[o]?(n[0]|=l?1:2,r[n[o++]]):n[++o];3===l?i[0]=u:4===l?i[1]=Object.assign(i[1]||{},u):5===l?(i[1]=i[1]||{})[n[++o]]=u:6===l?i[1][n[++o]]+=u+"":l?(s=e.apply(u,t(e,u,r,["",null])),i.push(s),u[0]?n[0]|=2:(n[o-2]=0,n[o]=s)):i.push(u)}return i},e=new Map;function n(n){var r=e.get(this);return r||(r=new Map,e.set(this,r)),(r=t(this,r.get(n)||(r.set(n,r=function(t){for(var e,n,r=1,i="",s="",o=[0],l=function(t){1===r&&(t||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?o.push(0,t,i):3===r&&(t||i)?(o.push(3,t,i),r=2):2===r&&"..."===i&&t?o.push(4,t,0):2===r&&i&&!t?o.push(5,0,!0,i):r>=5&&((i||!t&&5===r)&&(o.push(r,0,i,n),r=6),t&&(o.push(r,t,0,n),r=6)),i=""},u=0;u<t.length;u++){u&&(1===r&&l(),l(u));for(var c=0;c<t[u].length;c++)e=t[u][c],1===r?"<"===e?(l(),o=[o],r=3):i+=e:4===r?"--"===i&&">"===e?(r=1,i=""):i=e+i[0]:s?e===s?s="":i+=e:'"'===e||"'"===e?s=e:">"===e?(l(),r=1):r&&("="===e?(r=5,n=i,i=""):"/"===e&&(r<5||">"===t[u][c+1])?(l(),3===r&&(o=o[0]),r=o,(o=o[0]).push(2,0,r),r=0):" "===e||"\t"===e||"\n"===e||"\r"===e?(l(),r=2):i+=e),3===r&&"!--"===i&&(r=4,o=o[0])}return l(),o}(n)),r),arguments,[])).length>1?r:r[0]}
/*! @ryanmorr/carbon v0.2.3 | https://github.com/ryanmorr/carbon */const r=1,i=3;function s(...t){return Object.assign({},...t)}function o(t){return t.attributes&&t.attributes.key||null}function l(t){return null!=t&&"boolean"!=typeof t}function u(t,e){return t.nodeName===e.nodeName&&o(t)===o(e)}function c(t){if("string"==typeof t)return t;let e="";if(Array.isArray(t)&&t.length>0)for(let n,r=0,i=t.length;r<i;r++)""!==(n=c(t[r]))&&(e+=(e&&" ")+n);else for(const n in t)t[n]&&(e+=(e&&" ")+n);return e}function a(t,e,n){const r={};for(let i=e;i<=n;++i){const e=t[i],n=e&&o(e);null!=n&&(r[n]=i)}return r}function h(t,e,n,i=null){return{nodeType:r,node:i,nodeName:t,attributes:e,children:n}}function f(t,e=null){return{nodeType:i,node:e,text:t}}function d(t){const e=typeof t;return"boolean"===e?null:"string"===e||"number"===e?f(t):Array.isArray(t)?function(t){for(let e=0;e<t.length;){const n=t[e];Array.isArray(n)?n.length>0?(n.unshift(e,1),t.splice.apply(t,n),n.splice(0,2)):t.splice(e,1):e++}return t}(t).reduce(((t,e)=>(l(e)&&t.push(d(e)),t)),[]):t}function p(t,e){if(3===t.nodeType)return f(t.data,t);if(1===t.nodeType){if(e){const n=e.map((t=>t(null)));n&&n.forEach((e=>e&&e(t)))}return h(t.nodeName.toLowerCase(),Array.from(t.attributes).reduce(((e,n)=>{const r=n.name,i=n.value;return"style"!==r&&(e[r]=i),"key"===r&&t.removeAttribute("key"),e}),{}),Array.from(t.childNodes).map((t=>p(t,e))),t)}}const m=new Map;function g(t,e,n){let r;if(t.nodeType===i)r=document.createTextNode(t.text);else{let i;n&&(i=n.map((e=>e(t))));const s=t.nodeName;r=(e=e||"svg"===s)?document.createElementNS("http://www.w3.org/2000/svg",s):document.createElement(s);const o=t.attributes;Object.keys(o).forEach((t=>b(r,t,null,o[t],e))),t.children.forEach((t=>r.appendChild(g(t,e,n)))),i&&i.forEach((t=>t&&t(r)))}return t.node=r,r}function y(t,e,n){e.startsWith("--")?t.style.setProperty(e,null==n?"":n):t.style[e]=null==n?"":n}function b(t,e,n,r,i){if("key"!==e&&"children"!==e)if("style"===e)if("string"==typeof r)t.style.cssText=r;else{"string"==typeof n&&(t.style.cssText=n="");for(const e in s(r,n))y(t,e,null==r?"":r[e])}else if(!e.startsWith("on")||"function"!=typeof n&&"function"!=typeof r){if("function"!=typeof r){if(null==r||"class"!==e&&"className"!==e||(r=c(r)),i||"class"!==e||(e="className"),!i&&"width"!==e&&"height"!==e&&"href"!==e&&"list"!==e&&"form"!==e&&"tabIndex"!==e&&"download"!==e&&e in t)try{return void(t[e]=null==r?"":r)}catch(t){}null==r||!1===r&&-1==e.indexOf("-")?t.removeAttribute(e):t.setAttribute(e,r)}}else e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),r&&t.addEventListener(e,r),n&&t.removeEventListener(e,n)}function v(t,e,n,r,i){let s,l=0,c=e.length-1,h=e[0],f=e[c],d=0,p=n.length-1,m=n[0],y=n[p];for(;l<=c&&d<=p;)if(h)if(f)if(u(h,m))_(t,h,m,r,i),h=e[++l],m=n[++d];else if(u(f,y))_(t,f,y,r,i),f=e[--c],y=n[--p];else if(u(h,y))_(t,h,y,r,i),t.insertBefore(h.node,f.node.nextSibling),h=e[++l],y=n[--p];else if(u(f,m))_(t,f,m,r,i),t.insertBefore(f.node,h.node),f=e[--c],m=n[++d];else{s||(s=a(e,l,c));let u=o(m),f=u?s[u]:null;if(null==f)t.insertBefore(g(m,r,i),h.node),m=n[++d];else{let s=e[f];_(t,s,m,r,i),e[f]=void 0,t.insertBefore(s.node,h.node),m=n[++d]}}else f=e[--c];else h=e[++l];if(l>c){let e=n[p+1]?n[p+1].node:null;for(let s=d;s<=p;s++)t.insertBefore(g(n[s],r,i),e)}else if(d>p)for(let n=l;n<=c;n++){let r=e[n];r&&r.node&&t.removeChild(r.node)}return n}function _(t,e,n,r,o){if(e===n)return null==e?null:e.node;if(null==e)return t.appendChild(g(n,r,o));let l=e.node;if(null==n)return t.removeChild(l)&&null;if(e.nodeType===i&&n.nodeType===i)e.text!==n.text&&(l.data=n.text);else if(c=e,(u=n).nodeType!==c.nodeType||u.nodeType===i&&u.text!==c.text||u.nodeName!==c.nodeName){const e=g(n,r,o);t.replaceChild(e,l),l=e}else{r=r||"svg"===n.nodeName;const t=document.activeElement,i=e.attributes,u=n.attributes;for(const t in s(u,i))("value"===t||"selected"===t||"checked"===t?l[t]:i[t])!==u[t]&&b(l,t,i[t],u[t],r);v(l,e.children,n.children,r,o),t.focus()}var u,c;return n.node=l,l}function w(t,e,n){e=d(e);let r=m.get(t);r||(r=t.childNodes.length>0?Array.from(t.childNodes).map((t=>p(t,n))):null);const i=Array.isArray(r),s=Array.isArray(e);if(m.set(t,e),i||s){r=(i?r:[r]).filter(l);const o=v(t,r,e=(s?e:[e]).filter(l),null,n);return 0===o.length?null:1===o.length?o[0].node:o.map((t=>t.node))}return _(t,r,e,null,n)}
/*! @ryanmorr/schedule-render v3.0.2 | https://github.com/ryanmorr/schedule-render */let A,j;const E=[],O=5;function N(){return performance.now()}function x(){return E.length>0}function S(){j=N();do{x()&&E.shift()()}while(N()-j<O);A=null,x()&&(A=requestAnimationFrame(S))}const T=/\/$/;function P(t){return"true"===t||"false"!==t&&("undefined"===t?null:function(t){return!Number.isNaN(parseFloat(t))&&isFinite(t)}(t)?Number(t):t)}function k(t){if(!t||"object"!=typeof t)return!1;const e=Object.getPrototypeOf(t);return null===e||e===Object.getPrototypeOf({})}function C(t){return null==t||Object.isFrozen(t)||(Object.freeze(t),Array.isArray(t)?t.forEach((t=>C(t))):k(t)&&Object.getOwnPropertyNames(t).forEach((e=>C(t[e])))),t}function D(...t){return C(Object.assign(Object.create(null),...t))}function L(t){return"/"===t.charAt(0)}function B(t){return"/"===(t=t.trim())?t:t.replace(T,"")}function F(t,e,n){if(k(t))for(const e in t)n(e,t[e]);else n(t,e)}function M(t,e){if(t===e)return!0;if(null===t||null===e)return!1;const n=Object.prototype.toString.call(t);if(n!=Object.prototype.toString.call(e))return!1;switch(n){case"[object Date]":case"[object Number]":return+t==+e||+t!=+t&&+e!=+e;case"[object Function]":case"[object String]":case"[object Boolean]":return""+t==""+e;case"[object Array]":if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(!M(t[n],e[n]))return!1;return!0;case"[object Object]":{const n=Object.keys(t),r=Object.keys(e);return n.length==r.length&&n.every((n=>M(t[n],e[n])))}default:return!1}}class K{constructor(t={}){"title"in t?document.title=t.title:t.title=document.title,this._state=D(t),this._mutations=Object.create(null),this._actions=new Map,this._events=new Map,this._dispatchers=new Map,this._views=[],this._commit=this.commit.bind(this),this._dispatch=this.dispatch.bind(this),this._redirect=this.redirect.bind(this),this._navigate=this.navigate.bind(this),this._emit=this.emit.bind(this);const e=this._handleEvent.bind(this);document.documentElement.addEventListener("click",e,!1),document.documentElement.addEventListener("submit",e,!1),this.html=n.bind(((t,e,...n)=>(e=e||{},"function"==typeof t?(e.children=n,t(this.html,e,this._getEventDispatcher())):function(t,e,...n){return e&&!e.nodeType&&"function"!=typeof e.concat||(n=[].concat(e||[],...n),e={}),h(t,e||{},d(n))}(t,e,...n)))),this.on("mutation",((t,e,n)=>{e.title!==n.title&&(document.title=e.title),this._views.forEach((t=>t()))}))}use(t){return t(this,this.state())}state(){return this._state}path(){return B(window.location.pathname)}on(t,e){let n=this._events.get(t);return void 0===n&&(n=new Set,this._events.set(t,n)),n.add(e),()=>this._events.get(t).delete(e)}emit(t,...e){const n=this._events.get(t);void 0!==n&&n.size>0&&n.forEach((t=>t(...e)))}mutation(t,e){F(t,e,((t,e)=>{this._mutations[t]=e}))}commit(t,e=null){const n=this._mutations[t];if(n){const r=this.state(),i=n(r,e);return this._state=D(r,i),this.emit("mutation",t,this._state,r,i),i}return null}action(t,e){F(t,e,((t,e)=>{this._actions.set(t,e)}))}route(t,e){this._onPopState||(this._onPopState=this._handlePopState.bind(this),window.addEventListener("popstate",this._onPopState,!1)),F(t,e,((t,e)=>{this._actions.set(function(t){const e=[],n=t.split("/").map((t=>{if(!t)return t;const n=t.length,r=t.charCodeAt(0);if(42===r)return e.push("wildcard"),"/(.*)";if(58===r){const r=63===t.charCodeAt(n-1);return e.push(t.substring(1,r?n-1:n)),r?"(?:/([^/]+?))?":"/([^/]+?)"}return"/"+t})),r=new RegExp("^"+n.join("")+"/?$","i");return t=>{const n=r.exec(t);return n&&n[0]?n.slice(1).map(decodeURI).map(P).reduce(((t,n,r)=>(t[e[r]]=n,t)),{}):null}}(t),e)}))}dispatch(t=this.path(),e=null){const n=this._getDispatcher(t,e);return n?n():null}navigate(t){return this._modifyHistory(t,"navigate")}redirect(t){return this._modifyHistory(t,"redirect")}view(t,e){let n;const r=()=>n||(n=function(t){return new Promise((e=>{A||(A=requestAnimationFrame(S)),E.push((()=>e(t())))}))}((()=>{const r=e(this.html,this.state(),this._getEventDispatcher()),i=w(t,r);n=null,this.emit("render",i)})));this._views.push(r),r()}_modifyHistory(t,e="navigate"){if((t=B(t))===this.path())return;const n=this._getDispatcher(t);return n?(history["redirect"===e?"replaceState":"pushState"](null,"",t),this.emit("pathchange",t),n()):null}_getDispatcher(t,e=null,n=null){for(const[r,i]of this._actions){let s;if(L(t)&&"string"!=typeof r){const n=B(t);(e=r(n))&&(s="route",0===Object.keys(e).length&&(e=null))}else r===t&&(s="action");if(s)return()=>{const r={params:e,event:n,state:this.state(),commit:this._commit,dispatch:this._dispatch,navigate:this._navigate,redirect:this._redirect,emit:this._emit};"route"===s&&(r.path=t);const o=i.length<2?i(r):new Promise(((t,e)=>i(r,t,e)));return this.emit("dispatch",s,t,this.state(),e,n,o),o}}return null}_getEventDispatcher(){return(t,e=null)=>{for(const[n,r]of this._dispatchers)if(n[0]===t&&M(e,n[1]))return r;const n=n=>{const r=this._getDispatcher(t,e,n instanceof Event?n:null);return r?r():null};return this._dispatchers.set([t,e],n),n}}_handlePopState(){const t=this.path();this.dispatch(t),this.emit("pathchange",t)}_handleEvent(t){if(t.defaultPrevented)return;let e;if("submit"===t.type)e=t.target.getAttribute("action");else{if(t.button||t.ctrlKey||t.metaKey||t.altKey||t.shiftKey)return;const n=t.target.closest("a");if(!n)return;const r="object"==typeof n.href&&"SVGAnimatedString"===n.href.constructor.name;if("_blank"===n.getAttribute("target"))return;if("external"===n.getAttribute("rel"))return;if(n.hasAttribute("download"))return;if(!r&&!function(t){const e=new URL(t,window.location.toString()),n=window.location;return n.protocol===e.protocol&&n.hostname===e.hostname&&(n.port===e.port||""===n.port&&(80==e.port||443==e.port))}(n))return;if(e=r?n.href.baseVal:n.getAttribute("href"),e.indexOf("mailto:")>-1)return}if(!e)return;const n=L(e);if(n&&(e=B(e)),n&&e===this.path())return;const r=this._getDispatcher(e,null,t);r&&(t.preventDefault(),n&&(history.pushState(null,"",e),this.emit("pathchange",e)),r())}}module.exports=function(t){return new K(t)};
