// Utility function
function Util () {};

/* class manipulation functions */
Util.hasClass = function(el, className) {
	return el.classList.contains(className);
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	el.classList.add(classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	el.classList.remove(classList[0]);	
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* DOM manipulation */
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length;

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* Animate height of an element */
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* Smooth Scroll */
Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* Move Focus */
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* Misc */

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* Animation curves */
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
/*
 * anime.js v3.1.0
 * (c) 2019 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):n.anime=e()}(this,function(){"use strict";var n={update:null,begin:null,loopBegin:null,changeBegin:null,change:null,changeComplete:null,loopComplete:null,complete:null,loop:1,direction:"normal",autoplay:!0,timelineOffset:0},e={duration:1e3,delay:0,endDelay:0,easing:"easeOutElastic(1, .5)",round:0},r=["translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skew","skewX","skewY","perspective"],t={CSS:{},springs:{}};function a(n,e,r){return Math.min(Math.max(n,e),r)}function o(n,e){return n.indexOf(e)>-1}function u(n,e){return n.apply(null,e)}var i={arr:function(n){return Array.isArray(n)},obj:function(n){return o(Object.prototype.toString.call(n),"Object")},pth:function(n){return i.obj(n)&&n.hasOwnProperty("totalLength")},svg:function(n){return n instanceof SVGElement},inp:function(n){return n instanceof HTMLInputElement},dom:function(n){return n.nodeType||i.svg(n)},str:function(n){return"string"==typeof n},fnc:function(n){return"function"==typeof n},und:function(n){return void 0===n},hex:function(n){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(n)},rgb:function(n){return/^rgb/.test(n)},hsl:function(n){return/^hsl/.test(n)},col:function(n){return i.hex(n)||i.rgb(n)||i.hsl(n)},key:function(r){return!n.hasOwnProperty(r)&&!e.hasOwnProperty(r)&&"targets"!==r&&"keyframes"!==r}};function c(n){var e=/\(([^)]+)\)/.exec(n);return e?e[1].split(",").map(function(n){return parseFloat(n)}):[]}function s(n,e){var r=c(n),o=a(i.und(r[0])?1:r[0],.1,100),u=a(i.und(r[1])?100:r[1],.1,100),s=a(i.und(r[2])?10:r[2],.1,100),f=a(i.und(r[3])?0:r[3],.1,100),l=Math.sqrt(u/o),d=s/(2*Math.sqrt(u*o)),p=d<1?l*Math.sqrt(1-d*d):0,h=1,v=d<1?(d*l-f)/p:-f+l;function g(n){var r=e?e*n/1e3:n;return r=d<1?Math.exp(-r*d*l)*(h*Math.cos(p*r)+v*Math.sin(p*r)):(h+v*r)*Math.exp(-r*l),0===n||1===n?n:1-r}return e?g:function(){var e=t.springs[n];if(e)return e;for(var r=0,a=0;;)if(1===g(r+=1/6)){if(++a>=16)break}else a=0;var o=r*(1/6)*1e3;return t.springs[n]=o,o}}function f(n){return void 0===n&&(n=10),function(e){return Math.round(e*n)*(1/n)}}var l,d,p=function(){var n=11,e=1/(n-1);function r(n,e){return 1-3*e+3*n}function t(n,e){return 3*e-6*n}function a(n){return 3*n}function o(n,e,o){return((r(e,o)*n+t(e,o))*n+a(e))*n}function u(n,e,o){return 3*r(e,o)*n*n+2*t(e,o)*n+a(e)}return function(r,t,a,i){if(0<=r&&r<=1&&0<=a&&a<=1){var c=new Float32Array(n);if(r!==t||a!==i)for(var s=0;s<n;++s)c[s]=o(s*e,r,a);return function(n){return r===t&&a===i?n:0===n||1===n?n:o(f(n),t,i)}}function f(t){for(var i=0,s=1,f=n-1;s!==f&&c[s]<=t;++s)i+=e;var l=i+(t-c[--s])/(c[s+1]-c[s])*e,d=u(l,r,a);return d>=.001?function(n,e,r,t){for(var a=0;a<4;++a){var i=u(e,r,t);if(0===i)return e;e-=(o(e,r,t)-n)/i}return e}(t,l,r,a):0===d?l:function(n,e,r,t,a){for(var u,i,c=0;(u=o(i=e+(r-e)/2,t,a)-n)>0?r=i:e=i,Math.abs(u)>1e-7&&++c<10;);return i}(t,i,i+e,r,a)}}}(),h=(l={linear:function(){return function(n){return n}}},d={Sine:function(){return function(n){return 1-Math.cos(n*Math.PI/2)}},Circ:function(){return function(n){return 1-Math.sqrt(1-n*n)}},Back:function(){return function(n){return n*n*(3*n-2)}},Bounce:function(){return function(n){for(var e,r=4;n<((e=Math.pow(2,--r))-1)/11;);return 1/Math.pow(4,3-r)-7.5625*Math.pow((3*e-2)/22-n,2)}},Elastic:function(n,e){void 0===n&&(n=1),void 0===e&&(e=.5);var r=a(n,1,10),t=a(e,.1,2);return function(n){return 0===n||1===n?n:-r*Math.pow(2,10*(n-1))*Math.sin((n-1-t/(2*Math.PI)*Math.asin(1/r))*(2*Math.PI)/t)}}},["Quad","Cubic","Quart","Quint","Expo"].forEach(function(n,e){d[n]=function(){return function(n){return Math.pow(n,e+2)}}}),Object.keys(d).forEach(function(n){var e=d[n];l["easeIn"+n]=e,l["easeOut"+n]=function(n,r){return function(t){return 1-e(n,r)(1-t)}},l["easeInOut"+n]=function(n,r){return function(t){return t<.5?e(n,r)(2*t)/2:1-e(n,r)(-2*t+2)/2}}}),l);function v(n,e){if(i.fnc(n))return n;var r=n.split("(")[0],t=h[r],a=c(n);switch(r){case"spring":return s(n,e);case"cubicBezier":return u(p,a);case"steps":return u(f,a);default:return u(t,a)}}function g(n){try{return document.querySelectorAll(n)}catch(n){return}}function m(n,e){for(var r=n.length,t=arguments.length>=2?arguments[1]:void 0,a=[],o=0;o<r;o++)if(o in n){var u=n[o];e.call(t,u,o,n)&&a.push(u)}return a}function y(n){return n.reduce(function(n,e){return n.concat(i.arr(e)?y(e):e)},[])}function b(n){return i.arr(n)?n:(i.str(n)&&(n=g(n)||n),n instanceof NodeList||n instanceof HTMLCollection?[].slice.call(n):[n])}function M(n,e){return n.some(function(n){return n===e})}function x(n){var e={};for(var r in n)e[r]=n[r];return e}function w(n,e){var r=x(n);for(var t in n)r[t]=e.hasOwnProperty(t)?e[t]:n[t];return r}function k(n,e){var r=x(n);for(var t in e)r[t]=i.und(n[t])?e[t]:n[t];return r}function O(n){return i.rgb(n)?(r=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(e=n))?"rgba("+r[1]+",1)":e:i.hex(n)?(t=n.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(n,e,r,t){return e+e+r+r+t+t}),a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t),"rgba("+parseInt(a[1],16)+","+parseInt(a[2],16)+","+parseInt(a[3],16)+",1)"):i.hsl(n)?function(n){var e,r,t,a=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(n)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(n),o=parseInt(a[1],10)/360,u=parseInt(a[2],10)/100,i=parseInt(a[3],10)/100,c=a[4]||1;function s(n,e,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?n+6*(e-n)*r:r<.5?e:r<2/3?n+(e-n)*(2/3-r)*6:n}if(0==u)e=r=t=i;else{var f=i<.5?i*(1+u):i+u-i*u,l=2*i-f;e=s(l,f,o+1/3),r=s(l,f,o),t=s(l,f,o-1/3)}return"rgba("+255*e+","+255*r+","+255*t+","+c+")"}(n):void 0;var e,r,t,a}function C(n){var e=/[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(n);if(e)return e[1]}function B(n,e){return i.fnc(n)?n(e.target,e.id,e.total):n}function P(n,e){return n.getAttribute(e)}function I(n,e,r){if(M([r,"deg","rad","turn"],C(e)))return e;var a=t.CSS[e+r];if(!i.und(a))return a;var o=document.createElement(n.tagName),u=n.parentNode&&n.parentNode!==document?n.parentNode:document.body;u.appendChild(o),o.style.position="absolute",o.style.width=100+r;var c=100/o.offsetWidth;u.removeChild(o);var s=c*parseFloat(e);return t.CSS[e+r]=s,s}function T(n,e,r){if(e in n.style){var t=e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),a=n.style[e]||getComputedStyle(n).getPropertyValue(t)||"0";return r?I(n,a,r):a}}function D(n,e){return i.dom(n)&&!i.inp(n)&&(P(n,e)||i.svg(n)&&n[e])?"attribute":i.dom(n)&&M(r,e)?"transform":i.dom(n)&&"transform"!==e&&T(n,e)?"css":null!=n[e]?"object":void 0}function E(n){if(i.dom(n)){for(var e,r=n.style.transform||"",t=/(\w+)\(([^)]*)\)/g,a=new Map;e=t.exec(r);)a.set(e[1],e[2]);return a}}function F(n,e,r,t){var a,u=o(e,"scale")?1:0+(o(a=e,"translate")||"perspective"===a?"px":o(a,"rotate")||o(a,"skew")?"deg":void 0),i=E(n).get(e)||u;return r&&(r.transforms.list.set(e,i),r.transforms.last=e),t?I(n,i,t):i}function N(n,e,r,t){switch(D(n,e)){case"transform":return F(n,e,t,r);case"css":return T(n,e,r);case"attribute":return P(n,e);default:return n[e]||0}}function A(n,e){var r=/^(\*=|\+=|-=)/.exec(n);if(!r)return n;var t=C(n)||0,a=parseFloat(e),o=parseFloat(n.replace(r[0],""));switch(r[0][0]){case"+":return a+o+t;case"-":return a-o+t;case"*":return a*o+t}}function L(n,e){if(i.col(n))return O(n);if(/\s/g.test(n))return n;var r=C(n),t=r?n.substr(0,n.length-r.length):n;return e?t+e:t}function j(n,e){return Math.sqrt(Math.pow(e.x-n.x,2)+Math.pow(e.y-n.y,2))}function S(n){for(var e,r=n.points,t=0,a=0;a<r.numberOfItems;a++){var o=r.getItem(a);a>0&&(t+=j(e,o)),e=o}return t}function q(n){if(n.getTotalLength)return n.getTotalLength();switch(n.tagName.toLowerCase()){case"circle":return o=n,2*Math.PI*P(o,"r");case"rect":return 2*P(a=n,"width")+2*P(a,"height");case"line":return j({x:P(t=n,"x1"),y:P(t,"y1")},{x:P(t,"x2"),y:P(t,"y2")});case"polyline":return S(n);case"polygon":return r=(e=n).points,S(e)+j(r.getItem(r.numberOfItems-1),r.getItem(0))}var e,r,t,a,o}function $(n,e){var r=e||{},t=r.el||function(n){for(var e=n.parentNode;i.svg(e)&&i.svg(e.parentNode);)e=e.parentNode;return e}(n),a=t.getBoundingClientRect(),o=P(t,"viewBox"),u=a.width,c=a.height,s=r.viewBox||(o?o.split(" "):[0,0,u,c]);return{el:t,viewBox:s,x:s[0]/1,y:s[1]/1,w:u/s[2],h:c/s[3]}}function X(n,e){function r(r){void 0===r&&(r=0);var t=e+r>=1?e+r:0;return n.el.getPointAtLength(t)}var t=$(n.el,n.svg),a=r(),o=r(-1),u=r(1);switch(n.property){case"x":return(a.x-t.x)*t.w;case"y":return(a.y-t.y)*t.h;case"angle":return 180*Math.atan2(u.y-o.y,u.x-o.x)/Math.PI}}function Y(n,e){var r=/[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,t=L(i.pth(n)?n.totalLength:n,e)+"";return{original:t,numbers:t.match(r)?t.match(r).map(Number):[0],strings:i.str(n)||e?t.split(r):[]}}function Z(n){return m(n?y(i.arr(n)?n.map(b):b(n)):[],function(n,e,r){return r.indexOf(n)===e})}function Q(n){var e=Z(n);return e.map(function(n,r){return{target:n,id:r,total:e.length,transforms:{list:E(n)}}})}function V(n,e){var r=x(e);if(/^spring/.test(r.easing)&&(r.duration=s(r.easing)),i.arr(n)){var t=n.length;2===t&&!i.obj(n[0])?n={value:n}:i.fnc(e.duration)||(r.duration=e.duration/t)}var a=i.arr(n)?n:[n];return a.map(function(n,r){var t=i.obj(n)&&!i.pth(n)?n:{value:n};return i.und(t.delay)&&(t.delay=r?0:e.delay),i.und(t.endDelay)&&(t.endDelay=r===a.length-1?e.endDelay:0),t}).map(function(n){return k(n,r)})}function z(n,e){var r=[],t=e.keyframes;for(var a in t&&(e=k(function(n){for(var e=m(y(n.map(function(n){return Object.keys(n)})),function(n){return i.key(n)}).reduce(function(n,e){return n.indexOf(e)<0&&n.push(e),n},[]),r={},t=function(t){var a=e[t];r[a]=n.map(function(n){var e={};for(var r in n)i.key(r)?r==a&&(e.value=n[r]):e[r]=n[r];return e})},a=0;a<e.length;a++)t(a);return r}(t),e)),e)i.key(a)&&r.push({name:a,tweens:V(e[a],n)});return r}function H(n,e){var r;return n.tweens.map(function(t){var a=function(n,e){var r={};for(var t in n){var a=B(n[t],e);i.arr(a)&&1===(a=a.map(function(n){return B(n,e)})).length&&(a=a[0]),r[t]=a}return r.duration=parseFloat(r.duration),r.delay=parseFloat(r.delay),r}(t,e),o=a.value,u=i.arr(o)?o[1]:o,c=C(u),s=N(e.target,n.name,c,e),f=r?r.to.original:s,l=i.arr(o)?o[0]:f,d=C(l)||C(s),p=c||d;return i.und(u)&&(u=f),a.from=Y(l,p),a.to=Y(A(u,l),p),a.start=r?r.end:0,a.end=a.start+a.delay+a.duration+a.endDelay,a.easing=v(a.easing,a.duration),a.isPath=i.pth(o),a.isColor=i.col(a.from.original),a.isColor&&(a.round=1),r=a,a})}var G={css:function(n,e,r){return n.style[e]=r},attribute:function(n,e,r){return n.setAttribute(e,r)},object:function(n,e,r){return n[e]=r},transform:function(n,e,r,t,a){if(t.list.set(e,r),e===t.last||a){var o="";t.list.forEach(function(n,e){o+=e+"("+n+") "}),n.style.transform=o}}};function R(n,e){Q(n).forEach(function(n){for(var r in e){var t=B(e[r],n),a=n.target,o=C(t),u=N(a,r,o,n),i=A(L(t,o||C(u)),u),c=D(a,r);G[c](a,r,i,n.transforms,!0)}})}function W(n,e){return m(y(n.map(function(n){return e.map(function(e){return function(n,e){var r=D(n.target,e.name);if(r){var t=H(e,n),a=t[t.length-1];return{type:r,property:e.name,animatable:n,tweens:t,duration:a.end,delay:t[0].delay,endDelay:a.endDelay}}}(n,e)})})),function(n){return!i.und(n)})}function J(n,e){var r=n.length,t=function(n){return n.timelineOffset?n.timelineOffset:0},a={};return a.duration=r?Math.max.apply(Math,n.map(function(n){return t(n)+n.duration})):e.duration,a.delay=r?Math.min.apply(Math,n.map(function(n){return t(n)+n.delay})):e.delay,a.endDelay=r?a.duration-Math.max.apply(Math,n.map(function(n){return t(n)+n.duration-n.endDelay})):e.endDelay,a}var K=0;var U,_=[],nn=[],en=function(){function n(){U=requestAnimationFrame(e)}function e(e){var r=_.length;if(r){for(var t=0;t<r;){var a=_[t];if(a.paused){var o=_.indexOf(a);o>-1&&(_.splice(o,1),r=_.length)}else a.tick(e);t++}n()}else U=cancelAnimationFrame(U)}return n}();function rn(r){void 0===r&&(r={});var t,o=0,u=0,i=0,c=0,s=null;function f(n){var e=window.Promise&&new Promise(function(n){return s=n});return n.finished=e,e}var l,d,p,h,v,g,y,b,M=(d=w(n,l=r),p=w(e,l),h=z(p,l),v=Q(l.targets),g=W(v,h),y=J(g,p),b=K,K++,k(d,{id:b,children:[],animatables:v,animations:g,duration:y.duration,delay:y.delay,endDelay:y.endDelay}));f(M);function x(){var n=M.direction;"alternate"!==n&&(M.direction="normal"!==n?"normal":"reverse"),M.reversed=!M.reversed,t.forEach(function(n){return n.reversed=M.reversed})}function O(n){return M.reversed?M.duration-n:n}function C(){o=0,u=O(M.currentTime)*(1/rn.speed)}function B(n,e){e&&e.seek(n-e.timelineOffset)}function P(n){for(var e=0,r=M.animations,t=r.length;e<t;){var o=r[e],u=o.animatable,i=o.tweens,c=i.length-1,s=i[c];c&&(s=m(i,function(e){return n<e.end})[0]||s);for(var f=a(n-s.start-s.delay,0,s.duration)/s.duration,l=isNaN(f)?1:s.easing(f),d=s.to.strings,p=s.round,h=[],v=s.to.numbers.length,g=void 0,y=0;y<v;y++){var b=void 0,x=s.to.numbers[y],w=s.from.numbers[y]||0;b=s.isPath?X(s.value,l*x):w+l*(x-w),p&&(s.isColor&&y>2||(b=Math.round(b*p)/p)),h.push(b)}var k=d.length;if(k){g=d[0];for(var O=0;O<k;O++){d[O];var C=d[O+1],B=h[O];isNaN(B)||(g+=C?B+C:B+" ")}}else g=h[0];G[o.type](u.target,o.property,g,u.transforms),o.currentValue=g,e++}}function I(n){M[n]&&!M.passThrough&&M[n](M)}function T(n){var e=M.duration,r=M.delay,l=e-M.endDelay,d=O(n);M.progress=a(d/e*100,0,100),M.reversePlayback=d<M.currentTime,t&&function(n){if(M.reversePlayback)for(var e=c;e--;)B(n,t[e]);else for(var r=0;r<c;r++)B(n,t[r])}(d),!M.began&&M.currentTime>0&&(M.began=!0,I("begin")),!M.loopBegan&&M.currentTime>0&&(M.loopBegan=!0,I("loopBegin")),d<=r&&0!==M.currentTime&&P(0),(d>=l&&M.currentTime!==e||!e)&&P(e),d>r&&d<l?(M.changeBegan||(M.changeBegan=!0,M.changeCompleted=!1,I("changeBegin")),I("change"),P(d)):M.changeBegan&&(M.changeCompleted=!0,M.changeBegan=!1,I("changeComplete")),M.currentTime=a(d,0,e),M.began&&I("update"),n>=e&&(u=0,M.remaining&&!0!==M.remaining&&M.remaining--,M.remaining?(o=i,I("loopComplete"),M.loopBegan=!1,"alternate"===M.direction&&x()):(M.paused=!0,M.completed||(M.completed=!0,I("loopComplete"),I("complete"),!M.passThrough&&"Promise"in window&&(s(),f(M)))))}return M.reset=function(){var n=M.direction;M.passThrough=!1,M.currentTime=0,M.progress=0,M.paused=!0,M.began=!1,M.loopBegan=!1,M.changeBegan=!1,M.completed=!1,M.changeCompleted=!1,M.reversePlayback=!1,M.reversed="reverse"===n,M.remaining=M.loop,t=M.children;for(var e=c=t.length;e--;)M.children[e].reset();(M.reversed&&!0!==M.loop||"alternate"===n&&1===M.loop)&&M.remaining++,P(M.reversed?M.duration:0)},M.set=function(n,e){return R(n,e),M},M.tick=function(n){i=n,o||(o=i),T((i+(u-o))*rn.speed)},M.seek=function(n){T(O(n))},M.pause=function(){M.paused=!0,C()},M.play=function(){M.paused&&(M.completed&&M.reset(),M.paused=!1,_.push(M),C(),U||en())},M.reverse=function(){x(),C()},M.restart=function(){M.reset(),M.play()},M.reset(),M.autoplay&&M.play(),M}function tn(n,e){for(var r=e.length;r--;)M(n,e[r].animatable.target)&&e.splice(r,1)}return"undefined"!=typeof document&&document.addEventListener("visibilitychange",function(){document.hidden?(_.forEach(function(n){return n.pause()}),nn=_.slice(0),rn.running=_=[]):nn.forEach(function(n){return n.play()})}),rn.version="3.1.0",rn.speed=1,rn.running=_,rn.remove=function(n){for(var e=Z(n),r=_.length;r--;){var t=_[r],a=t.animations,o=t.children;tn(e,a);for(var u=o.length;u--;){var i=o[u],c=i.animations;tn(e,c),c.length||i.children.length||o.splice(u,1)}a.length||o.length||t.pause()}},rn.get=N,rn.set=R,rn.convertPx=I,rn.path=function(n,e){var r=i.str(n)?g(n)[0]:n,t=e||100;return function(n){return{property:n,el:r,svg:$(r),totalLength:q(r)*(t/100)}}},rn.setDashoffset=function(n){var e=q(n);return n.setAttribute("stroke-dasharray",e),e},rn.stagger=function(n,e){void 0===e&&(e={});var r=e.direction||"normal",t=e.easing?v(e.easing):null,a=e.grid,o=e.axis,u=e.from||0,c="first"===u,s="center"===u,f="last"===u,l=i.arr(n),d=l?parseFloat(n[0]):parseFloat(n),p=l?parseFloat(n[1]):0,h=C(l?n[1]:n)||0,g=e.start||0+(l?d:0),m=[],y=0;return function(n,e,i){if(c&&(u=0),s&&(u=(i-1)/2),f&&(u=i-1),!m.length){for(var v=0;v<i;v++){if(a){var b=s?(a[0]-1)/2:u%a[0],M=s?(a[1]-1)/2:Math.floor(u/a[0]),x=b-v%a[0],w=M-Math.floor(v/a[0]),k=Math.sqrt(x*x+w*w);"x"===o&&(k=-x),"y"===o&&(k=-w),m.push(k)}else m.push(Math.abs(u-v));y=Math.max.apply(Math,m)}t&&(m=m.map(function(n){return t(n/y)*y})),"reverse"===r&&(m=m.map(function(n){return o?n<0?-1*n:-n:Math.abs(y-n)}))}return g+(l?(p-d)/y:d)*(Math.round(100*m[e])/100)+h}},rn.timeline=function(n){void 0===n&&(n={});var r=rn(n);return r.duration=0,r.add=function(t,a){var o=_.indexOf(r),u=r.children;function c(n){n.passThrough=!0}o>-1&&_.splice(o,1);for(var s=0;s<u.length;s++)c(u[s]);var f=k(t,w(e,n));f.targets=f.targets||n.targets;var l=r.duration;f.autoplay=!1,f.direction=r.direction,f.timelineOffset=i.und(a)?l:A(a,l),c(r),r.seek(f.timelineOffset);var d=rn(f);c(d),u.push(d);var p=J(u,n);return r.delay=p.delay,r.endDelay=p.endDelay,r.duration=p.duration,r.seek(0),r.reset(),r.autoplay&&r.play(),r},r},rn.easing=v,rn.penner=h,rn.random=function(n,e){return Math.floor(Math.random()*(e-n+1))+n},rn});
// File#: _1_animated-headline
// Usage: codyhouse.co/license
(function() {
  var TextAnim = function(element) {
    this.element = element;
    this.wordsWrapper = this.element.getElementsByClassName(' js-text-anim__wrapper');
    this.words = this.element.getElementsByClassName('js-text-anim__word');
    this.selectedWord = 0;
    // interval between two animations
    this.loopInterval = parseFloat(getComputedStyle(this.element).getPropertyValue('--text-anim-pause'))*1000 || 1000;
    // duration of single animation (e.g., time for a single word to rotate)
    this.transitionDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--text-anim-duration'))*1000 || 1000;
    // keep animating after first loop was completed
    this.loop = (this.element.getAttribute('data-loop') && this.element.getAttribute('data-loop') == 'off') ? false : true;
    this.wordInClass = 'text-anim__word--in';
    this.wordOutClass = 'text-anim__word--out';
    // check for specific animations
    this.isClipAnim = Util.hasClass(this.element, 'text-anim--clip');
    if(this.isClipAnim) {
      this.animBorderWidth = parseInt(getComputedStyle(this.element).getPropertyValue('--text-anim-border-width')) || 2;
      this.animPulseClass = 'text-anim__wrapper--pulse';
    }
    initTextAnim(this);
  };

  function initTextAnim(element) {
    // make sure there's a word with the wordInClass
    setSelectedWord(element);
    // if clip animation -> add pulse class
    if(element.isClipAnim) {
      Util.addClass(element.wordsWrapper[0], element.animPulseClass);
    }
    // init loop
    loopWords(element);
  };

  function setSelectedWord(element) {
    var selectedWord = element.element.getElementsByClassName(element.wordInClass);
    if(selectedWord.length == 0) {
      Util.addClass(element.words[0], element.wordInClass);
    } else {
      element.selectedWord = Util.getIndexInArray(element.words, selectedWord[0]);
    }
  };

  function loopWords(element) {
    // stop animation after first loop was completed
    if(!element.loop && element.selectedWord == element.words.length - 1) {
      return;
    }
    var newWordIndex = getNewWordIndex(element);
    setTimeout(function() {
      if(element.isClipAnim) { // clip animation only
        switchClipWords(element, newWordIndex);
      } else {
        switchWords(element, newWordIndex);
      }
    }, element.loopInterval);
  };

  function switchWords(element, newWordIndex) {
    // switch words
    Util.removeClass(element.words[element.selectedWord], element.wordInClass);
    Util.addClass(element.words[element.selectedWord], element.wordOutClass);
    Util.addClass(element.words[newWordIndex], element.wordInClass);
    // reset loop
    resetLoop(element, newWordIndex);
  };

  function resetLoop(element, newIndex) {
    setTimeout(function() { 
      // set new selected word
      Util.removeClass(element.words[element.selectedWord], element.wordOutClass);
      element.selectedWord = newIndex;
      loopWords(element); // restart loop
    }, element.transitionDuration);
  };

  function switchClipWords(element, newWordIndex) {
    // clip animation only
    var startWidth =  element.words[element.selectedWord].offsetWidth,
      endWidth = element.words[newWordIndex].offsetWidth;
    
    // remove pulsing animation
    Util.removeClass(element.wordsWrapper[0], element.animPulseClass);
    // close word
    animateWidth(startWidth, element.animBorderWidth, element.wordsWrapper[0], element.transitionDuration, function() {
      // switch words
      Util.removeClass(element.words[element.selectedWord], element.wordInClass);
      Util.addClass(element.words[newWordIndex], element.wordInClass);
      element.selectedWord = newWordIndex;

      // open word
      animateWidth(element.animBorderWidth, endWidth, element.wordsWrapper[0], element.transitionDuration, function() {
        // add pulsing class
        Util.addClass(element.wordsWrapper[0], element.animPulseClass);
        loopWords(element);
      });
    });
  };

  function getNewWordIndex(element) {
    // get index of new word to be shown
    var index = element.selectedWord + 1;
    if(index >= element.words.length) index = 0;
    return index;
  };

  function animateWidth(start, to, element, duration, cb) {
    // animate width of a word for the clip animation
    var currentTime = null;

    var animateProperty = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      
      var val = Math.easeInOutQuart(progress, start, to - start, duration);
      element.style.width = val+"px";
      if(progress < duration) {
          window.requestAnimationFrame(animateProperty);
      } else {
        cb();
      }
    };
  
    //set the width of the element before starting animation -> fix bug on Safari
    element.style.width = start+"px";
    window.requestAnimationFrame(animateProperty);
  };

  // init TextAnim objects
  var textAnim = document.getElementsByClassName('js-text-anim'),
    reducedMotion = Util.osHasReducedMotion();
  if( textAnim ) {
    if(reducedMotion) return;
    for( var i = 0; i < textAnim.length; i++) {
      (function(i){ new TextAnim(textAnim[i]);})(i);
    }
  }
}());
// File#: _1_lazy-load
// Usage: codyhouse.co/license
(function() {
  var LazyLoad = function(elements) {
    this.elements = elements;
    initLazyLoad(this);
  };

  function initLazyLoad(asset) {
    if(lazySupported) setAssetsSrc(asset);
    else if(intersectionObsSupported) observeAssets(asset);
    else scrollAsset(asset);
  };

  function setAssetsSrc(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      if(asset.elements[i].getAttribute('data-bg') || asset.elements[i].tagName.toLowerCase() == 'picture') { // this could be an element with a bg image or a <source> element inside a <picture>
        observeSingleAsset(asset.elements[i]);
      } else {
        setSingleAssetSrc(asset.elements[i]);
      } 
    }
  };

  function setSingleAssetSrc(img) {
    if(img.tagName.toLowerCase() == 'picture') {
      setPictureSrc(img);
    } else {
      setSrcSrcset(img);
      var bg = img.getAttribute('data-bg');
      if(bg) img.style.backgroundImage = bg;
      if(!lazySupported || bg) img.removeAttribute("loading");
    }
  };

  function setPictureSrc(picture) {
    var pictureChildren = picture.children;
    for(var i = 0; i < pictureChildren.length; i++) setSrcSrcset(pictureChildren[i]);
    picture.removeAttribute("loading");
  };

  function setSrcSrcset(img) {
    var src = img.getAttribute('data-src');
    if(src) img.src = src;
    var srcset = img.getAttribute('data-srcset');
    if(srcset) img.srcset = srcset;
  };

  function observeAssets(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      observeSingleAsset(asset.elements[i]);
    }
  };

  function observeSingleAsset(img) {
    if( !img.getAttribute('data-src') && !img.getAttribute('data-srcset') && !img.getAttribute('data-bg') && img.tagName.toLowerCase() != 'picture') return; // using the native lazyload with no need js lazy-loading

    var threshold = img.getAttribute('data-threshold') || '200px';
    var config = {rootMargin: threshold};
    var observer = new IntersectionObserver(observerLoadContent.bind(img), config);
    observer.observe(img);
  };

  function observerLoadContent(entries, observer) { 
    if(entries[0].isIntersecting) {
      setSingleAssetSrc(this);
      observer.unobserve(this);
    }
  };

  function scrollAsset(asset) {
    asset.elements = Array.prototype.slice.call(asset.elements);
    asset.listening = false;
    asset.scrollListener = eventLazyLoad.bind(asset);
    document.addEventListener("scroll", asset.scrollListener);
    asset.resizeListener = eventLazyLoad.bind(asset);
    document.addEventListener("resize", asset.resizeListener);
    eventLazyLoad.bind(asset)(); // trigger before starting scrolling/resizing
  };

  function eventLazyLoad() {
    var self = this;
    if(self.listening) return;
    self.listening = true;
    setTimeout(function() {
      for(var i = 0; i < self.elements.length; i++) {
        if ((self.elements[i].getBoundingClientRect().top <= window.innerHeight && self.elements[i].getBoundingClientRect().bottom >= 0) && getComputedStyle(self.elements[i]).display !== "none") {
          setSingleAssetSrc(self.elements[i]);

          self.elements = self.elements.filter(function(image) {
            return image.hasAttribute("loading");
          });

          if (self.elements.length === 0) {
            if(self.scrollListener) document.removeEventListener("scroll", self.scrollListener);
            if(self.resizeListener) window.removeEventListener("resize", self.resizeListener);
          }
        }
      }
      self.listening = false;
    }, 200);
  };

  window.LazyLoad = LazyLoad;

  var lazyLoads = document.querySelectorAll('[loading="lazy"]'),
    lazySupported = 'loading' in HTMLImageElement.prototype,
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  if( lazyLoads.length > 0 ) {
    new LazyLoad(lazyLoads);
  };
  
}());
// File#: _1_masonry
// Usage: codyhouse.co/license

(function() {
  var Masonry = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-masonry__list')[0];
    this.items = this.element.getElementsByClassName('js-masonry__item');
    this.activeColumns = 0;
    this.colStartWidth = 0; // col min-width (defined in CSS using --masonry-col-auto-size variable)
    this.colWidth = 0; // effective column width
    this.colGap = 0;
    // store col heights and items
    this.colHeights = [];
    this.colItems = [];
    // flex full support
    this.flexSupported = checkFlexSupported(this.items[0]);
    getGridLayout(this); // get initial grid params
    setGridLayout(this); // set grid params (width of elements)
    initMasonryLayout(this); // init gallery layout
  };

  function checkFlexSupported(item) {
    var itemStyle = window.getComputedStyle(item);
    return itemStyle.getPropertyValue('flex-basis') != 'auto';
  };

  function getGridLayout(grid) { // this is used to get initial grid details (width/grid gap)
    var itemStyle = window.getComputedStyle(grid.items[0]);
    if( grid.colStartWidth == 0) {
      grid.colStartWidth = parseFloat(itemStyle.getPropertyValue('width'));
    }
    grid.colGap = parseFloat(itemStyle.getPropertyValue('margin-right'));
  };

  function setGridLayout(grid) { // set width of items in the grid
    var containerWidth = parseFloat(window.getComputedStyle(grid.element).getPropertyValue('width'));
    grid.activeColumns = parseInt((containerWidth + grid.colGap)/(grid.colStartWidth+grid.colGap));
    if(grid.activeColumns == 0) grid.activeColumns = 1;
    grid.colWidth = parseFloat((containerWidth - (grid.activeColumns - 1)*grid.colGap)/grid.activeColumns);
    for(var i = 0; i < grid.items.length; i++) {
      grid.items[i].style.width = grid.colWidth+'px'; // reset items width
    }
  };

  function initMasonryLayout(grid) {
    if(grid.flexSupported) {
      checkImgLoaded(grid); // reset layout when images are loaded
    } else {
      Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
    }

    grid.element.addEventListener('masonry-resize', function(){ // window has been resized -> reset masonry layout
      getGridLayout(grid);
      setGridLayout(grid);
      if(grid.flexSupported) layItems(grid); 
    });

    grid.element.addEventListener('masonry-reset', function(event){ // reset layout (e.g., new items added to the gallery)
      if(grid.flexSupported) checkImgLoaded(grid); 
    });
  };

  function layItems(grid) {
    Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
    grid.colHeights = [];
    grid.colItems = [];

    // grid layout has already been set -> update container height and order of items
    for(var j = 0; j < grid.activeColumns; j++) {
      grid.colHeights.push(0); // reset col heights
      grid.colItems[j] = []; // reset items order
    }
    
    for(var i = 0; i < grid.items.length; i++) {
      var minHeight = Math.min.apply( Math, grid.colHeights ),
        index = grid.colHeights.indexOf(minHeight);
      if(grid.colItems[index]) grid.colItems[index].push(i);
      grid.items[i].style.flexBasis = 0; // reset flex basis before getting height
      var itemHeight = grid.items[i].getBoundingClientRect().height || grid.items[i].offsetHeight || 1;
      grid.colHeights[index] = grid.colHeights[index] + grid.colGap + itemHeight;
    }

    // reset height of container
    var masonryHeight = Math.max.apply( Math, grid.colHeights ) + 5;
    grid.list.style.cssText = 'height: '+ masonryHeight + 'px;';

    // go through elements and set flex order
    var order = 0;
    for(var i = 0; i < grid.colItems.length; i++) {
      for(var j = 0; j < grid.colItems[i].length; j++) {
        grid.items[grid.colItems[i][j]].style.order = order;
        order = order + 1;
      }
      // change flex-basis of last element of each column, so that next element shifts to next col
      var lastItemCol = grid.items[grid.colItems[i][grid.colItems[i].length - 1]];
      lastItemCol.style.flexBasis = masonryHeight - grid.colHeights[i] + lastItemCol.getBoundingClientRect().height - 5 + 'px';
    }

    // emit custom event when grid has been reset
    grid.element.dispatchEvent(new CustomEvent('masonry-laid'));
  };

  function checkImgLoaded(grid) {
    var imgs = grid.list.getElementsByTagName('img');

    function countLoaded() {
      var setTimeoutOn = false;
      for(var i = 0; i < imgs.length; i++) {
        if(!imgs[i].complete) {
          setTimeoutOn = true;
          break;
        } else if (typeof imgs[i].naturalHeight !== "undefined" && imgs[i].naturalHeight == 0) {
          setTimeoutOn = true;
          break;
        }
      }

      if(!setTimeoutOn) {
        layItems(grid);
      } else {
        setTimeout(function(){
          countLoaded();
        }, 100);
      }
    };

    if(imgs.length == 0) {
      layItems(grid); // no need to wait -> no img available
    } else {
      countLoaded();
    }
  };

  //initialize the Masonry objects
  var masonries = document.getElementsByClassName('js-masonry'), 
    flexSupported = Util.cssSupports('flex-basis', 'auto'),
    masonriesArray = [];

  if( masonries.length > 0) {
    for( var i = 0; i < masonries.length; i++) {
      if(!flexSupported) {
        Util.addClass(masonries[i], 'masonry--loaded'); // reveal gallery
      } else {
        (function(i){masonriesArray.push(new Masonry(masonries[i]));})(i); // init Masonry Layout
      }
    }

    if(!flexSupported) return;

    // listen to window resize -> reorganize items in gallery
    var resizingId = false,
      customEvent = new CustomEvent('masonry-resize');
      
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < masonriesArray.length; i++) {
        (function(i){masonriesArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  };
}());
// File#: _1_menu
// Usage: codyhouse.co/license
(function() {
  var Menu = function(element) {
    this.element = element;
    this.elementId = this.element.getAttribute('id');
    this.menuItems = this.element.getElementsByClassName('js-menu__content');
    this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
    this.selectedTrigger = false;
    this.menuIsOpen = false;
    this.initMenu();
    this.initMenuEvents();
  };	

  Menu.prototype.initMenu = function() {
    // init aria-labels
    for(var i = 0; i < this.trigger.length; i++) {
      Util.setAttributes(this.trigger[i], {'aria-expanded': 'false', 'aria-haspopup': 'true'});
    }
    // init tabindex
    for(var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].setAttribute('tabindex', '0');
    }
  };

  Menu.prototype.initMenuEvents = function() {
    var self = this;
    for(var i = 0; i < this.trigger.length; i++) {(function(i){
      self.trigger[i].addEventListener('click', function(event){
        event.preventDefault();
        // if the menu had been previously opened by another trigger element -> close it first and reopen in the right position
        if(Util.hasClass(self.element, 'menu--is-visible') && self.selectedTrigger !=  self.trigger[i]) {
          self.toggleMenu(false, false); // close menu
        }
        // toggle menu
        self.selectedTrigger = self.trigger[i];
        self.toggleMenu(!Util.hasClass(self.element, 'menu--is-visible'), true);
      });
    })(i);}
    
    // keyboard events
    this.element.addEventListener('keydown', function(event) {
      // use up/down arrow to navigate list of menu items
      if( !Util.hasClass(event.target, 'js-menu__content') ) return;
      if( (event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown') ) {
        self.navigateItems(event, 'next');
      } else if( (event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup') ) {
        self.navigateItems(event, 'prev');
      }
    });
  };

  Menu.prototype.toggleMenu = function(bool, moveFocus) {
    var self = this;
    // toggle menu visibility
    Util.toggleClass(this.element, 'menu--is-visible', bool);
    this.menuIsOpen = bool;
    if(bool) {
      this.selectedTrigger.setAttribute('aria-expanded', 'true');
      Util.moveFocus(this.menuItems[0]);
      this.element.addEventListener("transitionend", function(event) {Util.moveFocus(self.menuItems[0]);}, {once: true});
      // position the menu element
      this.positionMenu();
      // add class to menu trigger
      Util.addClass(this.selectedTrigger, 'menu-control--active');
    } else if(this.selectedTrigger) {
      this.selectedTrigger.setAttribute('aria-expanded', 'false');
      if(moveFocus) Util.moveFocus(this.selectedTrigger);
      // remove class from menu trigger
      Util.removeClass(this.selectedTrigger, 'menu-control--active');
      this.selectedTrigger = false;
    }
  };

  Menu.prototype.positionMenu = function(event, direction) {
    var selectedTriggerPosition = this.selectedTrigger.getBoundingClientRect(),
      menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
      // menuOnTop = window.innerHeight < selectedTriggerPosition.bottom + this.element.offsetHeight;
      
    var left = selectedTriggerPosition.left,
      right = (window.innerWidth - selectedTriggerPosition.right),
      isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth);

    var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
      vertical = menuOnTop
        ? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
        : 'top: '+selectedTriggerPosition.bottom+'px;';
    // check right position is correct -> otherwise set left to 0
    if( isRight && (right + this.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - this.element.offsetWidth)/2)+'px;';
    var maxHeight = menuOnTop ? selectedTriggerPosition.top - 20 : window.innerHeight - selectedTriggerPosition.bottom - 20;
    this.element.setAttribute('style', horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
  };

  Menu.prototype.navigateItems = function(event, direction) {
    event.preventDefault();
    var index = Util.getIndexInArray(this.menuItems, event.target),
      nextIndex = direction == 'next' ? index + 1 : index - 1;
    if(nextIndex < 0) nextIndex = this.menuItems.length - 1;
    if(nextIndex > this.menuItems.length - 1) nextIndex = 0;
    Util.moveFocus(this.menuItems[nextIndex]);
  };

  Menu.prototype.checkMenuFocus = function() {
    var menuParent = document.activeElement.closest('.js-menu');
    if (!menuParent || !this.element.contains(menuParent)) this.toggleMenu(false, false);
  };

  Menu.prototype.checkMenuClick = function(target) {
    if( !this.element.contains(target) && !target.closest('[aria-controls="'+this.elementId+'"]')) this.toggleMenu(false);
  };

  window.Menu = Menu;

  //initialize the Menu objects
  var menus = document.getElementsByClassName('js-menu');
  if( menus.length > 0 ) {
    var menusArray = [];
    var scrollingContainers = [];
    for( var i = 0; i < menus.length; i++) {
      (function(i){
        menusArray.push(new Menu(menus[i]));
        var scrollableElement = menus[i].getAttribute('data-scrollable-element');
        if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
      })(i);
    }

    // listen for key events
    window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) {
        //close menu if focus is outside menu element
        menusArray.forEach(function(element){
          element.checkMenuFocus();
        });
      } else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        // close menu on 'Esc'
        menusArray.forEach(function(element){
          element.toggleMenu(false, false);
        });
      } 
    });
    // close menu when clicking outside it
    window.addEventListener('click', function(event){
      menusArray.forEach(function(element){
        element.checkMenuClick(event.target);
      });
    });
    // on resize -> close all menu elements
    window.addEventListener('resize', function(event){
      menusArray.forEach(function(element){
        element.toggleMenu(false, false);
      });
    });
    // on scroll -> close all menu elements
    window.addEventListener('scroll', function(event){
      menusArray.forEach(function(element){
        if(element.menuIsOpen) element.toggleMenu(false, false);
      });
    });
    // take into account additinal scrollable containers
    for(var j = 0; j < scrollingContainers.length; j++) {
      var scrollingContainer = document.querySelector(scrollingContainers[j]);
      if(scrollingContainer) {
        scrollingContainer.addEventListener('scroll', function(event){
          menusArray.forEach(function(element){
            if(element.menuIsOpen) element.toggleMenu(false, false);
          });
        });
      }
    }
  }
}());
// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
  var Modal = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.moveFocusEl = null; // focus will be moved to this element when modal is open
    this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
    this.selectedTrigger = null;
    this.showClass = "modal--is-visible";
    this.initModal();
  };

  Modal.prototype.initModal = function() {
    var self = this;
    //open modal when clicking on trigger buttons
    if ( this.triggers ) {
      for(var i = 0; i < this.triggers.length; i++) {
        this.triggers[i].addEventListener('click', function(event) {
          event.preventDefault();
          if(Util.hasClass(self.element, self.showClass)) {
            self.closeModal();
            return;
          }
          self.selectedTrigger = event.target;
          self.showModal();
          self.initModalEvents();
        });
      }
    }

    // listen to the openModal event -> open modal without a trigger button
    this.element.addEventListener('openModal', function(event){
      if(event.detail) self.selectedTrigger = event.detail;
      self.showModal();
      self.initModalEvents();
    });

    // listen to the closeModal event -> close modal without a trigger button
    this.element.addEventListener('closeModal', function(event){
      if(event.detail) self.selectedTrigger = event.detail;
      self.closeModal();
    });

    // if modal is open by default -> initialise modal events
    if(Util.hasClass(this.element, this.showClass)) this.initModalEvents();
  };

  Modal.prototype.showModal = function() {
    var self = this;
    Util.addClass(this.element, this.showClass);
    this.getFocusableElements();
    if(this.moveFocusEl) {
      this.moveFocusEl.focus();
      // wait for the end of transitions before moving focus
      this.element.addEventListener("transitionend", function cb(event) {
        self.moveFocusEl.focus();
        self.element.removeEventListener("transitionend", cb);
      });
    }
    this.emitModalEvents('modalIsOpen');
  };

  Modal.prototype.closeModal = function() {
    if(!Util.hasClass(this.element, this.showClass)) return;
    Util.removeClass(this.element, this.showClass);
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.moveFocusEl = null;
    if(this.selectedTrigger) this.selectedTrigger.focus();
    //remove listeners
    this.cancelModalEvents();
    this.emitModalEvents('modalIsClose');
  };

  Modal.prototype.initModalEvents = function() {
    //add event listeners
    this.element.addEventListener('keydown', this);
    this.element.addEventListener('click', this);
  };

  Modal.prototype.cancelModalEvents = function() {
    //remove event listeners
    this.element.removeEventListener('keydown', this);
    this.element.removeEventListener('click', this);
  };

  Modal.prototype.handleEvent = function (event) {
    switch(event.type) {
      case 'click': {
        this.initClick(event);
      }
      case 'keydown': {
        this.initKeyDown(event);
      }
    }
  };

  Modal.prototype.initKeyDown = function(event) {
    if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
      //trap focus inside modal
      this.trapFocus(event);
    } else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
      event.preventDefault();
      this.closeModal(); // close modal when pressing Enter on close button
    }	
  };

  Modal.prototype.initClick = function(event) {
    //close modal when clicking on close button or modal bg layer 
    if( !event.target.closest('.js-modal__close') && !Util.hasClass(event.target, 'js-modal') ) return;
    event.preventDefault();
    this.closeModal();
  };

  Modal.prototype.trapFocus = function(event) {
    if( this.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of modal
      event.preventDefault();
      this.lastFocusable.focus();
    }
    if( this.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of modal
      event.preventDefault();
      this.firstFocusable.focus();
    }
  }

  Modal.prototype.getFocusableElements = function() {
    //get all focusable elements inside the modal
    var allFocusable = this.element.querySelectorAll(focusableElString);
    this.getFirstVisible(allFocusable);
    this.getLastVisible(allFocusable);
    this.getFirstFocusable();
  };

  Modal.prototype.getFirstVisible = function(elements) {
    //get first visible focusable element inside the modal
    for(var i = 0; i < elements.length; i++) {
      if( isVisible(elements[i]) ) {
        this.firstFocusable = elements[i];
        break;
      }
    }
  };

  Modal.prototype.getLastVisible = function(elements) {
    //get last visible focusable element inside the modal
    for(var i = elements.length - 1; i >= 0; i--) {
      if( isVisible(elements[i]) ) {
        this.lastFocusable = elements[i];
        break;
      }
    }
  };

  Modal.prototype.getFirstFocusable = function() {
    if(!this.modalFocus || !Element.prototype.matches) {
      this.moveFocusEl = this.firstFocusable;
      return;
    }
    var containerIsFocusable = this.modalFocus.matches(focusableElString);
    if(containerIsFocusable) {
      this.moveFocusEl = this.modalFocus;
    } else {
      this.moveFocusEl = false;
      var elements = this.modalFocus.querySelectorAll(focusableElString);
      for(var i = 0; i < elements.length; i++) {
        if( isVisible(elements[i]) ) {
          this.moveFocusEl = elements[i];
          break;
        }
      }
      if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
    }
  };

  Modal.prototype.emitModalEvents = function(eventName) {
    var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
    this.element.dispatchEvent(event);
  };

  function isVisible(element) {
    return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
  };

  //initialize the Modal objects
  var modals = document.getElementsByClassName('js-modal');
  // generic focusable elements string selector
  var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
  if( modals.length > 0 ) {
    var modalArrays = [];
    for( var i = 0; i < modals.length; i++) {
      (function(i){modalArrays.push(new Modal(modals[i]));})(i);
    }

    window.addEventListener('keydown', function(event){ //close modal window on esc
      if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
        for( var i = 0; i < modalArrays.length; i++) {
          (function(i){modalArrays[i].closeModal();})(i);
        };
      }
    });
  }
}());
// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function() {
  var fxElements = document.getElementsByClassName('reveal-fx');
  var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  if(fxElements.length > 0) {
    // deactivate effect if Reduced Motion is enabled
    if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
      fxRemoveClasses();
      return;
    }
    //on small devices, do not animate elements -> reveal all
    if( fxDisabled(fxElements[0]) ) {
      fxRevealAll();
      return;
    }

    var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)
    
    var viewportHeight = window.innerHeight,
      fxChecking = false,
      fxRevealedItems = [],
      fxElementDelays = fxGetDelays(), //elements animation delay
      fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta) 
    
    
    // add event listeners
    window.addEventListener('load', fxReveal);
    window.addEventListener('resize', fxResize);
    window.addEventListener('restartAll', fxRestart);

    // observe reveal elements
    var observer = [];
    initObserver();

    function initObserver() {
      for(var i = 0; i < fxElements.length; i++) {
        observer[i] = new IntersectionObserver(
          function(entries, observer) { 
            if(entries[0].isIntersecting) {
              fxRevealItemObserver(entries[0].target);
              observer.unobserve(entries[0].target);
            }
          }, 
          {rootMargin: "0px 0px -"+fxElementDeltas[i]+"px 0px"}
        );
  
        observer[i].observe(fxElements[i]);
      }
    };

    function fxRevealAll() { // reveal all elements - small devices
      for(var i = 0; i < fxElements.length; i++) {
        Util.addClass(fxElements[i], 'reveal-fx--is-visible');
      }
    };

    function fxResize() { // on resize - check new window height and reveal visible elements
      if(fxChecking) return;
      fxChecking = true;
      (!window.requestAnimationFrame) ? setTimeout(function(){fxReset();}, 250) : window.requestAnimationFrame(fxReset);
    };

    function fxReset() {
      viewportHeight = window.innerHeight;
      fxReveal();
    };

    function fxReveal() { // reveal visible elements
      for(var i = 0; i < fxElements.length; i++) {(function(i){
        if(fxRevealedItems.indexOf(i) != -1 ) return; //element has already been revelead
        if(fxElementIsVisible(fxElements[i], i)) {
          fxRevealItem(i);
          fxRevealedItems.push(i);
        }})(i); 
      }
      fxResetEvents(); 
      fxChecking = false;
    };

    function fxRevealItem(index) {
      if(fxElementDelays[index] && fxElementDelays[index] != 0) {
        // wait before revealing element if a delay was added
        setTimeout(function(){
          Util.addClass(fxElements[index], 'reveal-fx--is-visible');
        }, fxElementDelays[index]);
      } else {
        Util.addClass(fxElements[index], 'reveal-fx--is-visible');
      }
    };

    function fxRevealItemObserver(item) {
      var index = Util.getIndexInArray(fxElements, item);
      if(fxRevealedItems.indexOf(index) != -1 ) return; //element has already been revelead
      fxRevealItem(index);
      fxRevealedItems.push(index);
      fxResetEvents(); 
      fxChecking = false;
    };

    function fxGetDelays() { // get anmation delays
      var delays = [];
      for(var i = 0; i < fxElements.length; i++) {
        delays.push( fxElements[i].getAttribute('data-reveal-fx-delay') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delay')) : 0);
      }
      return delays;
    };

    function fxGetDeltas() { // get reveal delta
      var deltas = [];
      for(var i = 0; i < fxElements.length; i++) {
        deltas.push( fxElements[i].getAttribute('data-reveal-fx-delta') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delta')) : fxRevealDelta);
      }
      return deltas;
    };

    function fxDisabled(element) { // check if elements need to be animated - no animation on small devices
      return !(window.getComputedStyle(element, '::before').getPropertyValue('content').replace(/'|"/g, "") == 'reveal-fx');
    };

    function fxElementIsVisible(element, i) { // element is inside viewport
      return (fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i]);
    };

    function fxGetElementPosition(element) { // get top position of element
      return element.getBoundingClientRect().top;
    };

    function fxResetEvents() { 
      if(fxElements.length > fxRevealedItems.length) return;
      // remove event listeners if all elements have been revealed
      window.removeEventListener('load', fxReveal);
      window.removeEventListener('resize', fxResize);
    };

    function fxRemoveClasses() {
      // Reduced Motion on or Intersection Observer not supported
      while(fxElements[0]) {
        // remove all classes starting with 'reveal-fx--'
        var classes = fxElements[0].getAttribute('class').split(" ").filter(function(c) {
          return c.lastIndexOf('reveal-fx--', 0) !== 0;
        });
        fxElements[0].setAttribute('class', classes.join(" ").trim());
        Util.removeClass(fxElements[0], 'reveal-fx');
      }
    };

    function fxRestart() {
      // restart the reveal effect -> hide all elements and re-init the observer
      if (Util.osHasReducedMotion() || !intersectionObserverSupported || fxDisabled(fxElements[0])) {
        return;
      }
      // check if we need to add the event listensers back
      if(fxElements.length <= fxRevealedItems.length) {
        window.addEventListener('load', fxReveal);
        window.addEventListener('resize', fxResize);
      }
      // remove observer and reset the observer array
      for(var i = 0; i < observer.length; i++) {
        if(observer[i]) observer[i].disconnect();
      }
      observer = [];
      // remove visible class
      for(var i = 0; i < fxElements.length; i++) {
        Util.removeClass(fxElements[i], 'reveal-fx--is-visible');
      }
      // reset fxRevealedItems array
      fxRevealedItems = [];
      // restart observer
      initObserver();
    };
  }
}());
// File#: _1_scrolling-animations
// Usage: codyhouse.co/license
(function() {
  var ScrollFx = function(element) {
    this.element = element;
    this.options = [];
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    this.scrollingFx = [];
    this.animating = [];
    this.deltaScrolling = [];
    this.observer = [];
    initScrollFx(this);
    // ToDo - option to pass two selectors to target the element start and stop animation scrolling values -> to be used for sticky/fixed elements
  };

  function initScrollFx(element) {
    // do not animate if reduced motion is on
    if(Util.osHasReducedMotion()) return;
    // get animation params
    var animation = element.element.getAttribute('data-scroll-fx');
    if(animation) {
      element.options.push(extractAnimation(animation));
    } else {
      getAnimations(element, 1);
    }
    // set Intersection Observer
    initObserver(element);
    // update params on resize
    initResize(element);
  };

  function initObserver(element) {
    for(var i = 0; i < element.options.length; i++) {
      (function(i){
        element.scrollingFx[i] = false;
        element.deltaScrolling[i] = getDeltaScrolling(element, i);
        element.animating[i] = false;

        element.observer[i] = new IntersectionObserver(
          function(entries, observer) { 
            scrollFxCallback(element, i, entries, observer);
          },
          {rootMargin: (element.options[i][5] -100)+"% 0px "+(0 - element.options[i][4])+"% 0px"}
        );
    
        element.observer[i].observe(element.element);

        // set initial value
        animateScrollFx.bind(element, i)();
      })(i);
    }
  };

  function scrollFxCallback(element, index, entries, observer) {
		if(entries[0].isIntersecting) {
      if(element.scrollingFx[index]) return; // listener for scroll event already added
      // reset delta
      resetDeltaBeforeAnim(element, index);
      triggerAnimateScrollFx(element, index);
    } else {
      if(!element.scrollingFx[index]) return; // listener for scroll event already removed
      window.removeEventListener('scroll', element.scrollingFx[index]);
      element.scrollingFx[index] = false;
    }
  };

  function triggerAnimateScrollFx(element, index) {
    element.scrollingFx[index] = animateScrollFx.bind(element, index);
    window.addEventListener('scroll', element.scrollingFx[index]);
  };

  function animateScrollFx(index) {
    // if window scroll is outside the proper range -> return
    if(window.scrollY < this.deltaScrolling[index][0]) {
      setCSSProperty(this, index, this.options[index][1]);
      return;
    }
    if(window.scrollY > this.deltaScrolling[index][1]) {
      setCSSProperty(this, index, this.options[index][2]);
      return;
    }
    if(this.animating[index]) return;
    this.animating[index] = true;
    window.requestAnimationFrame(updatePropertyScroll.bind(this, index));
  };

  function updatePropertyScroll(index) { // get value
    // check if this is a theme value or a css property
    if(isNaN(this.options[index][1])) {
      // this is a theme value to update
      (window.scrollY >= this.deltaScrolling[index][1]) 
        ? setCSSProperty(this, index, this.options[index][2])
        : setCSSProperty(this, index, this.options[index][1]);
    } else {
      // this is a CSS property
      var value = this.options[index][1] + (this.options[index][2] - this.options[index][1])*(window.scrollY - this.deltaScrolling[index][0])/(this.deltaScrolling[index][1] - this.deltaScrolling[index][0]);
      // update css property
      setCSSProperty(this, index, value);
    }
    
    this.animating[index] = false;
  };

  function setCSSProperty(element, index, value) {
    if(isNaN(value)) {
      // this is a theme value that needs to be updated
      setThemeValue(element, value);
      return;
    }
    if(element.options[index][0] == '--scroll-fx-skew' || element.options[index][0] == '--scroll-fx-scale') {
      // set 2 different CSS properties for the transformation on both x and y axis
      element.element.style.setProperty(element.options[index][0]+'-x', value+element.options[index][3]);
      element.element.style.setProperty(element.options[index][0]+'-y', value+element.options[index][3]);
    } else {
      // set single CSS property
      element.element.style.setProperty(element.options[index][0], value+element.options[index][3]);
    }
  };

  function setThemeValue(element, value) {
    // if value is different from the theme in use -> update it
    if(element.element.getAttribute('data-theme') != value) {
      Util.addClass(element.element, 'scroll-fx--theme-transition');
      element.element.offsetWidth;
      element.element.setAttribute('data-theme', value);
      element.element.addEventListener('transitionend', function cb(){
        element.element.removeEventListener('transitionend', cb);
        Util.removeClass(element.element, 'scroll-fx--theme-transition');
      });
    }
  };

  function getAnimations(element, index) {
    var option = element.element.getAttribute('data-scroll-fx-'+index);
    if(option) {
      // multiple animations for the same element - iterate through them
      element.options.push(extractAnimation(option));
      getAnimations(element, index+1);
    } 
    return;
  };

  function extractAnimation(option) {
    var array = option.split(',').map(function(item) {
      return item.trim();
    });
    var propertyOptions = getPropertyValues(array[1], array[2]);
    var animation = [getPropertyLabel(array[0]), propertyOptions[0], propertyOptions[1], propertyOptions[2], parseInt(array[3]), parseInt(array[4])];
    return animation;
  };

  function getPropertyLabel(property) {
    var propertyCss = '--scroll-fx-';
    for(var i = 0; i < property.length; i++) {
      propertyCss = (property[i] == property[i].toUpperCase())
        ? propertyCss + '-'+property[i].toLowerCase()
        : propertyCss +property[i];
    }
    if(propertyCss == '--scroll-fx-rotate') {
      propertyCss = '--scroll-fx-rotate-z';
    } else if(propertyCss == '--scroll-fx-translate') {
      propertyCss = '--scroll-fx-translate-x';
    }
    return propertyCss;
  };

  function getPropertyValues(val1, val2) {
    var nbVal1 = parseFloat(val1), 
      nbVal2 = parseFloat(val2),
      unit = val1.replace(nbVal1, '');
    if(isNaN(nbVal1)) {
      // property is a theme value
      nbVal1 = val1;
      nbVal2 = val2;
      unit = '';
    }
    return [nbVal1, nbVal2, unit];
  };

  function getDeltaScrolling(element, index) {
    // this retrieve the max and min scroll value that should trigger the animation
    var topDelta = window.scrollY - (element.windowHeight - (element.windowHeight + element.boundingRect.height)*element.options[index][4]/100) + element.boundingRect.top,
      bottomDelta = window.scrollY - (element.windowHeight - (element.windowHeight + element.boundingRect.height)*element.options[index][5]/100) + element.boundingRect.top;
    return [topDelta, bottomDelta];
  };

  function initResize(element) {
    var resizingId = false;
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(resetResize.bind(element), 500);
    });
    // emit custom event -> elements have been initialized
    var event = new CustomEvent('scrollFxReady');
		element.element.dispatchEvent(event);
  };

  function resetResize() {
    // on resize -> make sure to update all scrolling delta values
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    for(var i = 0; i < this.deltaScrolling.length; i++) {
      this.deltaScrolling[i] = getDeltaScrolling(this, i);
      animateScrollFx.bind(this, i)();
    }
    // emit custom event -> elements have been resized
    var event = new CustomEvent('scrollFxResized');
		this.element.dispatchEvent(event);
  };

  function resetDeltaBeforeAnim(element, index) {
    element.boundingRect = element.element.getBoundingClientRect();
    element.windowHeight = window.innerHeight;
    element.deltaScrolling[index] = getDeltaScrolling(element, index);
  };

  window.ScrollFx = ScrollFx;

  var scrollFx = document.getElementsByClassName('js-scroll-fx');
  for(var i = 0; i < scrollFx.length; i++) {
    (function(i){new ScrollFx(scrollFx[i]);})(i);
  }
}());
// File#: _1_stacking-cards
// Usage: codyhouse.co/license
(function() {
  var StackCards = function(element) {
    this.element = element;
    this.items = this.element.getElementsByClassName('js-stack-cards__item');
    this.scrollingFn = false;
    this.scrolling = false;
    initStackCardsEffect(this); 
    initStackCardsResize(this); 
  };

  function initStackCardsEffect(element) { // use Intersection Observer to trigger animation
    setStackCards(element); // store cards CSS properties
    var observer = new IntersectionObserver(stackCardsCallback.bind(element), { threshold: [0, 1] });
    observer.observe(element.element);
  };

  function initStackCardsResize(element) { // detect resize to reset gallery
    element.element.addEventListener('resize-stack-cards', function(){
      setStackCards(element);
      animateStackCards.bind(element);
    });
  };
  
  function stackCardsCallback(entries) { // Intersection Observer callback
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      stackCardsInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      this.scrollingFn = false;
    }
  };
  
  function stackCardsInitEvent(element) {
    element.scrollingFn = stackCardsScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function stackCardsScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateStackCards.bind(this));
  };

  function setStackCards(element) {
    // store wrapper properties
    element.marginY = getComputedStyle(element.element).getPropertyValue('--stack-cards-gap');
    getIntegerFromProperty(element); // convert element.marginY to integer (px value)
    element.elementHeight = element.element.offsetHeight;

    // store card properties
    var cardStyle = getComputedStyle(element.items[0]);
    element.cardTop = Math.floor(parseFloat(cardStyle.getPropertyValue('top')));
    element.cardHeight = Math.floor(parseFloat(cardStyle.getPropertyValue('height')));

    // store window property
    element.windowHeight = window.innerHeight;

    // reset margin + translate values
    if(isNaN(element.marginY)) {
      element.element.style.paddingBottom = '0px';
    } else {
      element.element.style.paddingBottom = (element.marginY*(element.items.length - 1))+'px';
    }

    for(var i = 0; i < element.items.length; i++) {
      if(isNaN(element.marginY)) {
        element.items[i].style.transform = 'none;';
      } else {
        element.items[i].style.transform = 'translateY('+element.marginY*i+'px)';
      }
    }
  };

  function getIntegerFromProperty(element) {
    var node = document.createElement('div');
    node.setAttribute('style', 'opacity:0; visbility: hidden;position: absolute; height:'+element.marginY);
    element.element.appendChild(node);
    element.marginY = parseInt(getComputedStyle(node).getPropertyValue('height'));
    element.element.removeChild(node);
  };

  function animateStackCards() {
    if(isNaN(this.marginY)) { // --stack-cards-gap not defined - do not trigger the effect
      this.scrolling = false;
      return; 
    }

    var top = this.element.getBoundingClientRect().top;

    if( this.cardTop - top + this.element.windowHeight - this.elementHeight - this.cardHeight + this.marginY + this.marginY*this.items.length > 0) { 
      this.scrolling = false;
      return;
    }

    for(var i = 0; i < this.items.length; i++) { // use only scale
      var scrolling = this.cardTop - top - i*(this.cardHeight+this.marginY);
      if(scrolling > 0) {  
        var scaling = i == this.items.length - 1 ? 1 : (this.cardHeight - scrolling*0.05)/this.cardHeight;
        this.items[i].style.transform = 'translateY('+this.marginY*i+'px) scale('+scaling+')';
      } else {
        this.items[i].style.transform = 'translateY('+this.marginY*i+'px)';
      }
    }

    this.scrolling = false;
  };

  // initialize StackCards object
  var stackCards = document.getElementsByClassName('js-stack-cards'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
    
  if(stackCards.length > 0 && intersectionObserverSupported && !reducedMotion) { 
    var stackCardsArray = [];
    for(var i = 0; i < stackCards.length; i++) {
      (function(i){
        stackCardsArray.push(new StackCards(stackCards[i]));
      })(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('resize-stack-cards');
    
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < stackCardsArray.length; i++) {
        (function(i){stackCardsArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  }
}());
// File#: _1_sticky-hero
// Usage: codyhouse.co/license
(function() {
  var StickyBackground = function(element) {
    this.element = element;
    this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
    this.nextElement = this.element.nextElementSibling;
    this.scrollingTreshold = 0;
    this.nextTreshold = 0;
    initStickyEffect(this);
  };

  function initStickyEffect(element) {
    var observer = new IntersectionObserver(stickyCallback.bind(element), { threshold: [0, 0.1, 1] });
    observer.observe(element.scrollingElement);
    if(element.nextElement) observer.observe(element.nextElement);
  };

  function stickyCallback(entries, observer) {
    var threshold = entries[0].intersectionRatio.toFixed(1);
    (entries[0].target ==  this.scrollingElement)
      ? this.scrollingTreshold = threshold
      : this.nextTreshold = threshold;

    Util.toggleClass(this.element, 'sticky-hero--media-is-fixed', (this.nextTreshold > 0 || this.scrollingTreshold > 0));
  };


  var stickyBackground = document.getElementsByClassName('js-sticky-hero'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  if(stickyBackground.length > 0 && intersectionObserverSupported) { // if IntersectionObserver is not supported, animations won't be triggeres
    for(var i = 0; i < stickyBackground.length; i++) {
      (function(i){ // if animations are enabled -> init the StickyBackground object
        if( Util.hasClass(stickyBackground[i], 'sticky-hero--overlay-layer') || Util.hasClass(stickyBackground[i], 'sticky-hero--scale')) new StickyBackground(stickyBackground[i]);
      })(i);
    }
  }
}());
// File#: _1_swipe-content
(function() {
  var SwipeContent = function(element) {
    this.element = element;
    this.delta = [false, false];
    this.dragging = false;
    this.intervalId = false;
    initSwipeContent(this);
  };

  function initSwipeContent(content) {
    content.element.addEventListener('mousedown', handleEvent.bind(content));
    content.element.addEventListener('touchstart', handleEvent.bind(content));
  };

  function initDragging(content) {
    //add event listeners
    content.element.addEventListener('mousemove', handleEvent.bind(content));
    content.element.addEventListener('touchmove', handleEvent.bind(content));
    content.element.addEventListener('mouseup', handleEvent.bind(content));
    content.element.addEventListener('mouseleave', handleEvent.bind(content));
    content.element.addEventListener('touchend', handleEvent.bind(content));
  };

  function cancelDragging(content) {
    //remove event listeners
    if(content.intervalId) {
      (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
      content.intervalId = false;
    }
    content.element.removeEventListener('mousemove', handleEvent.bind(content));
    content.element.removeEventListener('touchmove', handleEvent.bind(content));
    content.element.removeEventListener('mouseup', handleEvent.bind(content));
    content.element.removeEventListener('mouseleave', handleEvent.bind(content));
    content.element.removeEventListener('touchend', handleEvent.bind(content));
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'mousedown':
      case 'touchstart':
        startDrag(this, event);
        break;
      case 'mousemove':
      case 'touchmove':
        drag(this, event);
        break;
      case 'mouseup':
      case 'mouseleave':
      case 'touchend':
        endDrag(this, event);
        break;
    }
  };

  function startDrag(content, event) {
    content.dragging = true;
    // listen to drag movements
    initDragging(content);
    content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
    // emit drag start event
    emitSwipeEvents(content, 'dragStart', content.delta, event.target);
  };

  function endDrag(content, event) {
    cancelDragging(content);
    // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
    var dx = parseInt(unify(event).clientX), 
      dy = parseInt(unify(event).clientY);
    
    // check if there was a left/right swipe
    if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
      var s = getSign(dx - content.delta[0]);
      
      if(Math.abs(dx - content.delta[0]) > 30) {
        (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
      }
      
      content.delta[0] = false;
    }
    // check if there was a top/bottom swipe
    if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
    	var y = getSign(dy - content.delta[1]);

    	if(Math.abs(dy - content.delta[1]) > 30) {
      	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
      }

      content.delta[1] = false;
    }
    // emit drag end event
    emitSwipeEvents(content, 'dragEnd', [dx, dy]);
    content.dragging = false;
  };

  function drag(content, event) {
    if(!content.dragging) return;
    // emit dragging event with coordinates
    (!window.requestAnimationFrame) 
      ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
      : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
  };

  function emitDrag(event) {
    emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
  };

  function unify(event) { 
    // unify mouse and touch events
    return event.changedTouches ? event.changedTouches[0] : event; 
  };

  function emitSwipeEvents(content, eventName, detail, el) {
    var trigger = false;
    if(el) trigger = el;
    // emit event with coordinates
    var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
    content.element.dispatchEvent(event);
  };

  function getSign(x) {
    if(!Math.sign) {
      return ((x > 0) - (x < 0)) || +x;
    } else {
      return Math.sign(x);
    }
  };

  window.SwipeContent = SwipeContent;
  
  //initialize the SwipeContent objects
  var swipe = document.getElementsByClassName('js-swipe-content');
  if( swipe.length > 0 ) {
    for( var i = 0; i < swipe.length; i++) {
      (function(i){new SwipeContent(swipe[i]);})(i);
    }
  }
}());
// File#: _1_vertical-timeline
// Usage: codyhouse.co/license
(function() {
  var VTimeline = function(element) {
    this.element = element;
    this.sections = this.element.getElementsByClassName('js-v-timeline__section');
    this.animate = this.element.getAttribute('data-animation') && this.element.getAttribute('data-animation') == 'on' ? true : false;
    this.animationClass = 'v-timeline__section--animate';
    this.animationDelta = '-150px';
    initVTimeline(this);
  };

  function initVTimeline(element) {
    if(!element.animate) return;
    for(var i = 0; i < element.sections.length; i++) {
      var observer = new IntersectionObserver(vTimelineCallback.bind(element, i),
      {rootMargin: "0px 0px "+element.animationDelta+" 0px"});
      observer.observe(element.sections[i]);
    }
  };

  function vTimelineCallback(index, entries, observer) {
    if(entries[0].isIntersecting) {
      Util.addClass(this.sections[index], this.animationClass);
      observer.unobserve(this.sections[index]);
    } 
  };

  //initialize the VTimeline objects
  var timelines = document.querySelectorAll('.js-v-timeline'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
  if( timelines.length > 0) {
    for( var i = 0; i < timelines.length; i++) {
      if(intersectionObserverSupported && !reducedMotion) (function(i){new VTimeline(timelines[i]);})(i);
      else timelines[i].removeAttribute('data-animation');
    }
  }
}());
// File#: _2_image-zoom
// Usage: codyhouse.co/license

(function() {
  var ImageZoom = function(element, index) {
    this.element = element;
    this.lightBoxId = 'img-zoom-lightbox--'+index;
    this.imgPreview = this.element.getElementsByClassName('js-image-zoom__preview')[0];
    
    initImageZoomHtml(this); // init markup
    
    this.lightbox = document.getElementById(this.lightBoxId);
    this.imgEnlg = this.lightbox.getElementsByClassName('js-image-zoom__fw')[0];
    this.input = this.element.getElementsByClassName('js-image-zoom__input')[0];
    this.animate = this.element.getAttribute('data-morph') != 'off';
    
    initImageZoomEvents(this); //init events
  };

  function initImageZoomHtml(imageZoom) {
    // get zoomed image url
    var url = imageZoom.element.getAttribute('data-img');
    if(!url) url = imageZoom.imgPreview.getAttribute('src');

    var lightBox = document.createElement('div');
    Util.setAttributes(lightBox, {class: 'image-zoom__lightbox js-image-zoom__lightbox', id: imageZoom.lightBoxId, 'aria-hidden': 'true'});
    lightBox.innerHTML = '<img src="'+url+'" class="js-image-zoom__fw"></img>';
    document.body.appendChild(lightBox);
    
    var keyboardInput = '<input aria-hidden="true" type="checkbox" class="image-zoom__input js-image-zoom__input"></input>';
    imageZoom.element.insertAdjacentHTML('afterbegin', keyboardInput);
  };

  function initImageZoomEvents(imageZoom) {
    // toggle lightbox on click
    imageZoom.imgPreview.addEventListener('click', function(event){
      toggleFullWidth(imageZoom, true);
      imageZoom.input.checked = true;
    });
    imageZoom.lightbox.addEventListener('click', function(event){
      toggleFullWidth(imageZoom, false);
      imageZoom.input.checked = false;
    });
    // detect swipe down to close lightbox
    new SwipeContent(imageZoom.lightbox);
    imageZoom.lightbox.addEventListener('swipeDown', function(event){
      toggleFullWidth(imageZoom, false);
      imageZoom.input.checked = false;
    });
    // keyboard accessibility
    imageZoom.input.addEventListener('change', function(event){
      toggleFullWidth(imageZoom, imageZoom.input.checked);
    });
    imageZoom.input.addEventListener('keydown', function(event){
      if( (event.keyCode && event.keyCode == 13) || (event.key && event.key.toLowerCase() == 'enter') ) {
        imageZoom.input.checked = !imageZoom.input.checked;
        toggleFullWidth(imageZoom, imageZoom.input.checked);
      }
    });
  };

  function toggleFullWidth(imageZoom, bool) {
    if(animationSupported && imageZoom.animate) { // start expanding animation
      window.requestAnimationFrame(function(){
        animateZoomImage(imageZoom, bool);
      });
    } else { // show lightbox without animation
      Util.toggleClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible', bool);
    }
  };

  function animateZoomImage(imageZoom, bool) {
    // get img preview position and dimension for the morphing effect
    var rect = imageZoom.imgPreview.getBoundingClientRect(),
      finalWidth = imageZoom.lightbox.getBoundingClientRect().width;
    var init = (bool) ? [rect.top, rect.left, rect.width] : [0, 0, finalWidth],
      final = (bool) ? [-rect.top, -rect.left, parseFloat(finalWidth/rect.width)] : [rect.top + imageZoom.lightbox.scrollTop, rect.left, parseFloat(rect.width/finalWidth)];
    
    if(bool) {
      imageZoom.imgEnlg.setAttribute('style', 'top: '+init[0]+'px; left:'+init[1]+'px; width:'+init[2]+'px;');
    }
    
    // show modal
    Util.removeClass(imageZoom.lightbox, 'image-zoom__lightbox--no-transition');
    Util.addClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible');

    imageZoom.imgEnlg.addEventListener('transitionend', function cb(event){ // reset elements once animation is over
      if(!bool) Util.removeClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible');
      Util.addClass(imageZoom.lightbox, 'image-zoom__lightbox--no-transition');
      imageZoom.imgEnlg.removeAttribute('style');
      imageZoom.imgEnlg.removeEventListener('transitionend', cb);
    });
    
    // animate image and bg
    imageZoom.imgEnlg.style.transform = 'translateX('+final[1]+'px) translateY('+final[0]+'px) scale('+final[2]+')';
    Util.toggleClass(imageZoom.lightbox, 'image-zoom__lightbox--animate-bg', bool);
  };

  // init ImageZoom object
  var imageZoom = document.getElementsByClassName('js-image-zoom'),
    animationSupported = window.requestAnimationFrame && !Util.osHasReducedMotion();
  if( imageZoom.length > 0 ) {
    var imageZoomArray = [];
    for( var i = 0; i < imageZoom.length; i++) {
      imageZoomArray.push(new ImageZoom(imageZoom[i], i));
    }

    // close Zoom Image lightbox on Esc
    window.addEventListener('keydown', function(event){
      if((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'esc')) {
        for( var i = 0; i < imageZoomArray.length; i++) {
          imageZoomArray[i].input.checked = false;
          if(Util.hasClass(imageZoomArray[i].lightbox, 'image-zoom__lightbox--is-visible')) toggleFullWidth(imageZoomArray[i], false);
        }
      }
    });
  }
}());
// File#: _2_init-prj-content
// Usage: codyhouse.co/license
(function() {
  var slidingPanels = document.getElementsByClassName('js-s-panels');
	if( slidingPanels.length > 0 ) {
		for( var i = 0; i < slidingPanels.length; i++) {(function(i){
      slidingPanels[i].addEventListener('slidingPanelOpen', function(){
        // trigger resize to restart masonry/reveal effects
        window.dispatchEvent(new Event('resize'));
      });
    })(i);}
	}
}());
// File#: _2_menu-bar
// Usage: codyhouse.co/license
(function() {
  var MenuBar = function(element) {
    this.element = element;
    this.items = Util.getChildrenByClassName(this.element, 'menu-bar__item');
    this.mobHideItems = this.element.getElementsByClassName('menu-bar__item--hide');
    this.moreItemsTrigger = this.element.getElementsByClassName('js-menu-bar__trigger');
    initMenuBar(this);
  };

  function initMenuBar(menu) {
    setMenuTabIndex(menu); // set correct tabindexes for menu item
    initMenuBarMarkup(menu); // create additional markup
    checkMenuLayout(menu); // set menu layout
    Util.addClass(menu.element, 'menu-bar--loaded'); // reveal menu

    // custom event emitted when window is resized
    menu.element.addEventListener('update-menu-bar', function(event){
      checkMenuLayout(menu);
      if(menu.menuInstance) menu.menuInstance.toggleMenu(false, false); // close dropdown
    });

    // keyboard events 
    // open dropdown when pressing Enter on trigger element
    if(menu.moreItemsTrigger.length > 0) {
      menu.moreItemsTrigger[0].addEventListener('keydown', function(event) {
        if( (event.keyCode && event.keyCode == 13) || (event.key && event.key.toLowerCase() == 'enter') ) {
          if(!menu.menuInstance) return;
          menu.menuInstance.selectedTrigger = menu.moreItemsTrigger[0];
          menu.menuInstance.toggleMenu(!Util.hasClass(menu.subMenu, 'menu--is-visible'), true);
        }
      });

      // close dropdown on esc
      menu.subMenu.addEventListener('keydown', function(event) {
        if((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) { // close submenu on esc
          if(menu.menuInstance) menu.menuInstance.toggleMenu(false, true);
        }
      });
    }
    
    // navigate menu items using left/right arrows
    menu.element.addEventListener('keydown', function(event) {
      if( (event.keyCode && event.keyCode == 39) || (event.key && event.key.toLowerCase() == 'arrowright') ) {
        navigateItems(menu.items, event, 'next');
      } else if( (event.keyCode && event.keyCode == 37) || (event.key && event.key.toLowerCase() == 'arrowleft') ) {
        navigateItems(menu.items, event, 'prev');
      }
    });
  };

  function setMenuTabIndex(menu) { // set tabindexes for the menu items to allow keyboard navigation
    var nextItem = false;
    for(var i = 0; i < menu.items.length; i++ ) {
      if(i == 0 || nextItem) menu.items[i].setAttribute('tabindex', '0');
      else menu.items[i].setAttribute('tabindex', '-1');
      if(i == 0 && menu.moreItemsTrigger.length > 0) nextItem = true;
      else nextItem = false;
    }
  };

  function initMenuBarMarkup(menu) {
    if(menu.mobHideItems.length == 0 ) { // no items to hide on mobile - remove trigger
      if(menu.moreItemsTrigger.length > 0) menu.element.removeChild(menu.moreItemsTrigger[0]);
      return;
    }

    if(menu.moreItemsTrigger.length == 0) return;

    // create the markup for the Menu element
    var content = '';
    menu.menuControlId = 'submenu-bar-'+Date.now();
    for(var i = 0; i < menu.mobHideItems.length; i++) {
      var item = menu.mobHideItems[i].cloneNode(true),
        svg = item.getElementsByTagName('svg')[0],
        label = item.getElementsByClassName('menu-bar__label')[0];

      svg.setAttribute('class', 'icon menu__icon');
      content = content + '<li role="menuitem"><span class="menu__content js-menu__content">'+svg.outerHTML+'<span>'+label.innerHTML+'</span></span></li>';
    }

    Util.setAttributes(menu.moreItemsTrigger[0], {'role': 'button', 'aria-expanded': 'false', 'aria-controls': menu.menuControlId, 'aria-haspopup': 'true'});

    var subMenu = document.createElement('menu'),
      customClass = menu.element.getAttribute('data-menu-class');
    Util.setAttributes(subMenu, {'id': menu.menuControlId, 'class': 'menu js-menu '+customClass});
    subMenu.innerHTML = content;
    document.body.appendChild(subMenu);

    menu.subMenu = subMenu;
    menu.subItems = subMenu.getElementsByTagName('li');

    menu.menuInstance = new Menu(menu.subMenu); // this will handle the dropdown behaviour
  };

  function checkMenuLayout(menu) { // switch from compressed to expanded layout and viceversa
    var layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(menu.element, 'menu-bar--collapsed', layout == 'collapsed');
  };

  function navigateItems(list, event, direction, prevIndex) { // keyboard navigation among menu items
    event.preventDefault();
    var index = (typeof prevIndex !== 'undefined') ? prevIndex : Util.getIndexInArray(list, event.target),
      nextIndex = direction == 'next' ? index + 1 : index - 1;
    if(nextIndex < 0) nextIndex = list.length - 1;
    if(nextIndex > list.length - 1) nextIndex = 0;
    // check if element is visible before moving focus
    (list[nextIndex].offsetParent === null) ? navigateItems(list, event, direction, nextIndex) : Util.moveFocus(list[nextIndex]);
  };

  function checkMenuClick(menu, target) { // close dropdown when clicking outside the menu element
    if(menu.menuInstance && !menu.moreItemsTrigger[0].contains(target) && !menu.subMenu.contains(target)) menu.menuInstance.toggleMenu(false, false);
  };

  // init MenuBars objects
  var menuBars = document.getElementsByClassName('js-menu-bar');
  if( menuBars.length > 0 ) {
    var j = 0,
      menuBarArray = [];
    for( var i = 0; i < menuBars.length; i++) {
      var beforeContent = getComputedStyle(menuBars[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        (function(i){menuBarArray.push(new MenuBar(menuBars[i]));})(i);
        j = j + 1;
      }
    }
    
    if(j > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-menu-bar');
      // update Menu Bar layout on resize  
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 150);
      });

      // close menu when clicking outside it
      window.addEventListener('click', function(event){
        menuBarArray.forEach(function(element){
          checkMenuClick(element, event.target);
        });
      });

      function doneResizing() {
        for( var i = 0; i < menuBars.length; i++) {
          (function(i){menuBars[i].dispatchEvent(customEvent)})(i);
        };
      };
    }
  }
}());
// File#: _2_morphing-image-modal
// Usage: codyhouse.co/license
(function() {
  var MorphImgModal = function(opts) {
    this.options = Util.extend(MorphImgModal.defaults, opts);
    this.element = this.options.element;
    this.modalId = this.element.getAttribute('id');
    this.triggers = document.querySelectorAll('[aria-controls="'+this.modalId+'"]');
    this.selectedImg = false;
    // store morph elements
    this.morphBg = document.getElementsByClassName('js-morph-img-bg');
    this.morphImg = document.getElementsByClassName('js-morph-img-clone');
    // store modal content
    this.modalContent = this.element.getElementsByClassName('js-morph-img-modal__content');
    this.modalImg = this.element.getElementsByClassName('js-morph-img-modal__img');
    this.modalInfo = this.element.getElementsByClassName('js-morph-img-modal__info');
    // store close btn element
    this.modalCloseBtn = document.getElementsByClassName('js-morph-img-close-btn');
    // animation duration
    this.animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--morph-img-modal-transition-duration'))*1000 || 300;
    // morphing animation should run
    this.animating = false;
    this.reset = false;
    initMorphModal(this);
  };

  function initMorphModal(element) {
    if(element.morphImg.length < 1) return;
    element.morphEl = element.morphImg[0].getElementsByTagName('image');
    element.morphRect  = element.morphImg[0].getElementsByTagName('rect');
    initMorphModalMarkup(element);
    initMorphModalEvents(element);
  };

  function initMorphModalMarkup(element) {
    // append the clip path + <image> elements to use to morph the image
    element.morphImg[0].innerHTML = '<svg><defs><clipPath id="'+element.modalId+'-clip"><rect/></clipPath></defs><image height="100%" width="100%" clip-path="url(#'+element.modalId+'-clip)"></image></svg>';
  };

  function initMorphModalEvents(element) {
    // morph modal was open
    element.element.addEventListener('modalIsOpen', function(event){
      var target = event.detail.closest('[aria-controls="'+element.modalId+'"]');
      setModalImg(element, target);
      setModalContent(element, target);
      toggleModalCloseBtn(element, true);
    });

    // morph modal was closed
    element.element.addEventListener('modalIsClose', function(event){
      element.reset = false;
      element.animating = true;
      Util.addClass(element.modalContent[0], 'opacity-0');
      animateImg(element, false, function() {
        if(element.reset) return; // user opened a new modal before the animation was complete - no need to reset the modal
        element.selectedImg = false;
        resetMorphModal(element, false);
        element.animating = false;
      });
      toggleModalCloseBtn(element, false);
    });

    // close modal clicking on close btn
    if(element.modalCloseBtn.length > 0) {
      element.modalCloseBtn[0].addEventListener('click', function(event) {
        element.element.click();
      });
    }
  };

  function setModalImg(element, target) {
    if(!target) return;
    element.selectedImg = (target.tagName.toLowerCase() == 'img') ? target : target.querySelector('img');
    var src = element.selectedImg.getAttribute('data-modal-src') || element.selectedImg.getAttribute('src');
    // update url modal image + morph
    if(element.modalImg.length > 0) element.modalImg[0].setAttribute('src', src);
    Util.setAttributes(element.morphEl[0], {'xlink:href': src, 'href': src});
    element.reset = false;
    element.animating = true;  
    // wait for image to be loaded, then animate
    loadImage(element, src, function() {
      animateImg(element, true, function() {
        if(element.reset) return; // user closed the modal before the animation was complete - no need to reset the modal
        resetMorphModal(element, true);
        element.animating = false;
      });
    });
  };

  function loadImage(element, src, cb) {
    var image = new Image();
    var loaded = false;
    image.onload = function () {
      if(loaded) return;
      cb();
    }
    image.src = src;
    if(image.complete) {
      loaded = true;
      cb();
    }
  };

  function setModalContent(element, target) {
    // load the modal info details - using the searchData custom function the user defines
    if(element.modalInfo.length < 1) return;
    element.options.searchData(target, function(data){
      element.modalInfo[0].innerHTML = data;
    });
  };

  function toggleModalCloseBtn(element, bool) {
    if(element.modalCloseBtn.length > 0) {
      Util.toggleClass(element.modalCloseBtn[0], 'morph-img-close-btn--is-visible', bool);
    }
  };

  function animateImg(element, isOpening, cb) {
    Util.removeClass(element.morphImg[0], 'is-hidden');

    var galleryImgRect = element.selectedImg.getBoundingClientRect(),
      modalImgRect = element.modalImg[0].getBoundingClientRect();

    runClipAnimation(element, galleryImgRect, modalImgRect, isOpening, cb);
  };

  function runClipAnimation(element, startRect, endRect, isOpening, cb) {
    // retrieve all animation params
    // main element animation (<div>)
    var elInitHeight = startRect.height,
      elIntWidth = startRect.width,
      elInitTop = startRect.top,
      elInitLeft = startRect.left;
    
    var elScale = Math.max(endRect.height/startRect.height, endRect.width/startRect.width);

    var elTranslateX = endRect.left - startRect.left + (endRect.width - startRect.width*elScale)*0.5,
      elTranslateY = endRect.top - startRect.top + (endRect.height - startRect.height*elScale)*0.5;

    // clip <rect> animation
    var rectScaleX = endRect.width/(startRect.width*elScale),
      rectScaleY = endRect.height/(startRect.height*elScale);

    element.morphImg[0].style = 'height:'+elInitHeight+'px; width:'+elIntWidth+'px; top:'+elInitTop+'px; left:'+elInitLeft+'px;';

    element.morphRect[0].setAttribute('transform', 'scale('+1+','+1+')');

    // init morph bg
    element.morphBg[0].style.height = startRect.height + 'px';
    element.morphBg[0].style.width = startRect.width + 'px';
    element.morphBg[0].style.top = startRect.top + 'px';
    element.morphBg[0].style.left = startRect.left + 'px';

    Util.removeClass(element.morphBg[0], 'is-hidden');
    
    animateRectScale(element, elInitHeight, elIntWidth, elScale, elTranslateX, elTranslateY, rectScaleX, rectScaleY, isOpening, cb);
  };

  function animateRectScale(element, height, width, elScale, elTranslateX, elTranslateY, rectScaleX, rectScaleY, isOpening, cb) {
    var isMobile = getComputedStyle(element.element, ':before').getPropertyValue('content').replace(/\'|"/g, '') == 'mobile';

    var currentTime = null,
      duration =  element.animationDuration;

    var startRect = element.selectedImg.getBoundingClientRect(),
      endRect = element.modalContent[0].getBoundingClientRect();
    
    var scaleX = endRect.width/startRect.width,
      scaleY = endRect.height/startRect.height;
  
    var translateX = endRect.left - startRect.left,
      translateY = endRect.top - startRect.top;

    var animateScale = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      
      // main element values
      if(isOpening) {
        var elScalePr = Math.easeOutQuart(progress, 1, elScale - 1, duration),
        elTransXPr = Math.easeOutQuart(progress, 0, elTranslateX, duration),
        elTransYPr = Math.easeOutQuart(progress, 0, elTranslateY, duration);
      } else {
        var elScalePr = Math.easeOutQuart(progress, elScale, 1 - elScale, duration),
        elTransXPr = Math.easeOutQuart(progress, elTranslateX, - elTranslateX, duration),
        elTransYPr = Math.easeOutQuart(progress, elTranslateY, - elTranslateY, duration);
      }
      
      // rect values
      if(isOpening) {
        var rectScaleXPr = Math.easeOutQuart(progress, 1, rectScaleX - 1, duration),
          rectScaleYPr = Math.easeOutQuart(progress, 1, rectScaleY - 1, duration);
      } else {
        var rectScaleXPr = Math.easeOutQuart(progress, rectScaleX,  1 - rectScaleX, duration),
          rectScaleYPr = Math.easeOutQuart(progress, rectScaleY, 1 - rectScaleY, duration);
      }

      element.morphImg[0].style.transform = 'translateX('+elTransXPr+'px) translateY('+elTransYPr+'px) scale('+elScalePr+')';

      element.morphRect[0].setAttribute('transform', 'translate('+(width/2)*(1 - rectScaleXPr)+' '+(height/2)*(1 - rectScaleYPr)+') scale('+rectScaleXPr+','+rectScaleYPr+')');

      if(isOpening) {
        var valScaleX = Math.easeOutQuart(progress, 1, (scaleX - 1), duration),
          valScaleY = isMobile ? Math.easeOutQuart(progress, 1, (scaleY - 1), duration): rectScaleYPr*elScalePr,
          valTransX = Math.easeOutQuart(progress, 0, translateX, duration),
          valTransY = isMobile ? Math.easeOutQuart(progress, 0, translateY, duration) : elTransYPr + (elScalePr*height - rectScaleYPr*elScalePr*height)/2;
      } else {
        var valScaleX = Math.easeOutQuart(progress, scaleX, 1 - scaleX, duration),
          valScaleY = isMobile ? Math.easeOutQuart(progress, scaleY, 1 - scaleY, duration) : rectScaleYPr*elScalePr,
          valTransX = Math.easeOutQuart(progress, translateX, - translateX, duration),
          valTransY = isMobile ? Math.easeOutQuart(progress, translateY, - translateY, duration) : elTransYPr + (elScalePr*height - rectScaleYPr*elScalePr*height)/2;
      }

      // morph bg
      element.morphBg[0].style.transform = 'translateX('+valTransX+'px) translateY('+valTransY+'px) scale('+valScaleX+','+valScaleY+')';

      if(progress < duration) {
        window.requestAnimationFrame(animateScale);
      } else if(cb) {
        cb();
      }
    };
    
    window.requestAnimationFrame(animateScale);
  };
  
  function resetMorphModal(element, isOpening) {
    // reset modal at the end of an opening/closing animation
    Util.toggleClass(element.modalContent[0], 'opacity-0', !isOpening);
    Util.toggleClass(element.modalInfo[0], 'opacity-0', !isOpening);
    Util.addClass(element.morphBg[0], 'is-hidden');
    Util.addClass(element.morphImg[0], 'is-hidden');
    if(!isOpening) {
      element.modalImg[0].removeAttribute('src');
      element.modalInfo[0].innerHTML = '';
      element.morphEl[0].removeAttribute('xlink:href');
      element.morphEl[0].removeAttribute('href');
      element.morphBg[0].removeAttribute('style');
      element.morphImg[0].removeAttribute('style');
    }
  };

  window.MorphImgModal = MorphImgModal;

  MorphImgModal.defaults = {
    element : '',
    searchData: false, // function used to return results
  };
}());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
  var Slideshow = function(opts) {
    this.options = slideshowAssignOptions(Slideshow.defaults , opts);
    this.element = this.options.element;
    this.items = this.element.getElementsByClassName('js-slideshow__item');
    this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
    this.selectedSlide = 0;
    this.autoplayId = false;
    this.autoplayPaused = false;
    this.navigation = false;
    this.navCurrentLabel = false;
    this.ariaLive = false;
    this.moveFocus = false;
    this.animating = false;
    this.supportAnimation = Util.cssSupports('transition');
    this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
    this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
    this.animatingClass = 'slideshow--is-animating';
    initSlideshow(this);
    initSlideshowEvents(this);
    initAnimationEndEvents(this);
  };

  Slideshow.prototype.showNext = function() {
    showNewItem(this, this.selectedSlide + 1, 'next');
  };

  Slideshow.prototype.showPrev = function() {
    showNewItem(this, this.selectedSlide - 1, 'prev');
  };

  Slideshow.prototype.showItem = function(index) {
    showNewItem(this, index, false);
  };

  Slideshow.prototype.startAutoplay = function() {
    var self = this;
    if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
      self.autoplayId = setInterval(function(){
        self.showNext();
      }, self.options.autoplayInterval);
    }
  };

  Slideshow.prototype.pauseAutoplay = function() {
    var self = this;
    if(this.options.autoplay) {
      clearInterval(self.autoplayId);
      self.autoplayId = false;
    }
  };

  function slideshowAssignOptions(defaults, opts) {
    // initialize the object options
    var mergeOpts = {};
    mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
    mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
    mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
    mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
    mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
    return mergeOpts;
  };

  function initSlideshow(slideshow) { // basic slideshow settings
    // if no slide has been selected -> select the first one
    if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
    slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
    // create an element that will be used to announce the new visible slide to SR
    var srLiveArea = document.createElement('div');
    Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
    slideshow.element.appendChild(srLiveArea);
    slideshow.ariaLive = srLiveArea;
  };

  function initSlideshowEvents(slideshow) {
    // if slideshow navigation is on -> create navigation HTML and add event listeners
    if(slideshow.options.navigation) {
      // check if navigation has already been included
      if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
        var navigation = document.createElement('ol'),
          navChildren = '';

        var navClasses = 'slideshow__navigation js-slideshow__navigation';
        if(slideshow.items.length <= 1) {
          navClasses = navClasses + ' is-hidden';
        } 
        
        navigation.setAttribute('class', navClasses);
        for(var i = 0; i < slideshow.items.length; i++) {
          var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
            navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
          navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
        }
        navigation.innerHTML = navChildren;
        slideshow.element.appendChild(navigation);
      }
      
      slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
      slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

      var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

      dotsNavigation.addEventListener('click', function(event){
        navigateSlide(slideshow, event, true);
      });
      dotsNavigation.addEventListener('keyup', function(event){
        navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
      });
    }
    // slideshow arrow controls
    if(slideshow.controls.length > 0) {
      // hide controls if one item available
      if(slideshow.items.length <= 1) {
        Util.addClass(slideshow.controls[0], 'is-hidden');
        Util.addClass(slideshow.controls[1], 'is-hidden');
      }
      slideshow.controls[0].addEventListener('click', function(event){
        event.preventDefault();
        slideshow.showPrev();
        updateAriaLive(slideshow);
      });
      slideshow.controls[1].addEventListener('click', function(event){
        event.preventDefault();
        slideshow.showNext();
        updateAriaLive(slideshow);
      });
    }
    // swipe events
    if(slideshow.options.swipe) {
      //init swipe
      new SwipeContent(slideshow.element);
      slideshow.element.addEventListener('swipeLeft', function(event){
        slideshow.showNext();
      });
      slideshow.element.addEventListener('swipeRight', function(event){
        slideshow.showPrev();
      });
    }
    // autoplay
    if(slideshow.options.autoplay) {
      slideshow.startAutoplay();
      // pause autoplay if user is interacting with the slideshow
      slideshow.element.addEventListener('mouseenter', function(event){
        slideshow.pauseAutoplay();
        slideshow.autoplayPaused = true;
      });
      slideshow.element.addEventListener('focusin', function(event){
        slideshow.pauseAutoplay();
        slideshow.autoplayPaused = true;
      });
      slideshow.element.addEventListener('mouseleave', function(event){
        slideshow.autoplayPaused = false;
        slideshow.startAutoplay();
      });
      slideshow.element.addEventListener('focusout', function(event){
        slideshow.autoplayPaused = false;
        slideshow.startAutoplay();
      });
    }
    // detect if external buttons control the slideshow
    var slideshowId = slideshow.element.getAttribute('id');
    if(slideshowId) {
      var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
      for(var i = 0; i < externalControls.length; i++) {
        (function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
      }
    }
    // custom event to trigger selection of a new slide element
    slideshow.element.addEventListener('selectNewItem', function(event){
      // check if slide is already selected
      if(event.detail) {
        if(event.detail - 1 == slideshow.selectedSlide) return;
        showNewItem(slideshow, event.detail - 1, false);
      }
    });
  };

  function navigateSlide(slideshow, event, keyNav) { 
    // user has interacted with the slideshow navigation -> update visible slide
    var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
    if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
      slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
      slideshow.moveFocus = true;
      updateAriaLive(slideshow);
    }
  };

  function initAnimationEndEvents(slideshow) {
    // remove animation classes at the end of a slide transition
    for( var i = 0; i < slideshow.items.length; i++) {
      (function(i){
        slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
        slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
      })(i);
    }
  };

  function resetAnimationEnd(slideshow, item) {
    setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
      if(Util.hasClass(item,'slideshow__item--selected')) {
        if(slideshow.moveFocus) Util.moveFocus(item);
        emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
        slideshow.moveFocus = false;
      }
      Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
      item.removeAttribute('aria-hidden');
      slideshow.animating = false;
      Util.removeClass(slideshow.element, slideshow.animatingClass); 
    }, 100);
  };

  function showNewItem(slideshow, index, bool) {
    if(slideshow.items.length <= 1) return;
    if(slideshow.animating && slideshow.supportAnimation) return;
    slideshow.animating = true;
    Util.addClass(slideshow.element, slideshow.animatingClass); 
    if(index < 0) index = slideshow.items.length - 1;
    else if(index >= slideshow.items.length) index = 0;
    // skip slideshow item if it is hidden
    if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
      slideshow.animating = false;
      index = bool == 'next' ? index + 1 : index - 1;
      showNewItem(slideshow, index, bool);
      return;
    }
    // index of new slide is equal to index of slide selected item
    if(index == slideshow.selectedSlide) {
      slideshow.animating = false;
      return;
    }
    var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
    var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
    // transition between slides
    if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
    Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
    slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
    if(slideshow.animationOff) {
      Util.addClass(slideshow.items[index], 'slideshow__item--selected');
    } else {
      Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
    }
    // reset slider navigation appearance
    resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
    slideshow.selectedSlide = index;
    // reset autoplay
    slideshow.pauseAutoplay();
    slideshow.startAutoplay();
    // reset controls/navigation color themes
    resetSlideshowTheme(slideshow, index);
    // emit event
    emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
    if(slideshow.animationOff) {
      slideshow.animating = false;
      Util.removeClass(slideshow.element, slideshow.animatingClass);
    }
  };

  function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
    var className = '';
    if(bool) {
      className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
    } else {
      className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
    }
    return className;
  };

  function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
    var className = '';
    if(bool) {
      className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
    } else {
      className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
    }
    return className;
  };

  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
    if(slideshow.navigation) {
      Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
      Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
      slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
      slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
    }
  };

  function resetSlideshowTheme(slideshow, newIndex) {
    var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
    if(dataTheme) {
      if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
      if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
    } else {
      if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
      if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
    }
  };

  function emitSlideshowEvent(slideshow, eventName, detail) {
    var event = new CustomEvent(eventName, {detail: detail});
    slideshow.element.dispatchEvent(event);
  };

  function updateAriaLive(slideshow) {
    slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
  };

  function externalControlSlide(slideshow, button) { // control slideshow using external element
    button.addEventListener('click', function(event){
      var index = button.getAttribute('data-index');
      if(!index || index == slideshow.selectedSlide + 1) return;
      event.preventDefault();
      showNewItem(slideshow, index - 1, false);
    });
  };

  Slideshow.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    swipe: false
  };

  window.Slideshow = Slideshow;
  
  //initialize the Slideshow objects
  var slideshows = document.getElementsByClassName('js-slideshow');
  if( slideshows.length > 0 ) {
    for( var i = 0; i < slideshows.length; i++) {
      (function(i){
        var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
          autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
          autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
          swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
        new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
      })(i);
    }
  }
}());
// File#: _3_lightbox
// Usage: codyhouse.co/license

(function() {
  var Lightbox = function(element) {
    this.element = element;
    this.id = this.element.getAttribute('id');
    this.slideshow = this.element.getElementsByClassName('js-lightbox__body')[0];
    this.slides = this.slideshow.getElementsByClassName('js-slideshow__item');
    this.thumbWrapper = this.element.getElementsByClassName('js-lightbox_thumb-list');
    lazyLoadLightbox(this);
    initSlideshow(this);
    initThumbPreview(this);
    initThumbEvents(this);
  }

  function lazyLoadLightbox(modal) {
    // add no-transition class to lightbox - used to select the first visible slide
    Util.addClass(modal.element, 'lightbox--no-transition');
    //load first slide media when modal is open
    modal.element.addEventListener('modalIsOpen', function(event){
      setSelectedItem(modal, event);
      var selectedSlide = modal.slideshow.getElementsByClassName('slideshow__item--selected');
      modal.selectedSlide = Util.getIndexInArray(modal.slides, selectedSlide[0]);
      if(selectedSlide.length > 0) {
        if(modal.slideshowObj) modal.slideshowObj.selectedSlide = modal.selectedSlide;
        lazyLoadSlide(modal);
        resetVideos(modal, false);
        resetIframes(modal, false);
        updateThumb(modal);
      }
      Util.removeClass(modal.element, 'lightbox--no-transition');
    });
    modal.element.addEventListener('modalIsClose', function(event){ // add no-transition class
      Util.addClass(modal.element, 'lightbox--no-transition');
    });
    // lazyload media of selected slide/prev slide/next slide
    modal.slideshow.addEventListener('newItemSelected', function(event){
      // 'newItemSelected' is emitted by the Slideshow object when a new slide is selected
      var prevSelected = modal.selectedSlide;
      modal.selectedSlide = event.detail;
      lazyLoadSlide(modal);
      resetVideos(modal, prevSelected); // pause video of previous visible slide and start new video (if present)
      resetIframes(modal, prevSelected);
      updateThumb(modal);
    });
  };

  function lazyLoadSlide(modal) {
    setSlideMedia(modal, modal.selectedSlide);
    setSlideMedia(modal, modal.selectedSlide + 1);
    setSlideMedia(modal, modal.selectedSlide - 1);
  };

  function setSlideMedia(modal, index) {
    if(index < 0) index = modal.slides.length - 1;
    if(index > modal.slides.length - 1) index = 0;
    setSlideImgs(modal, index);
    setSlidesVideos(modal, index, 'video');
    setSlidesVideos(modal, index, 'iframe');
  };

  function setSlideImgs(modal, index) {
    var imgs = modal.slides[index].querySelectorAll('img[data-src]');
    for(var i = 0; i < imgs.length; i++) {
      imgs[i].src = imgs[i].getAttribute('data-src');
    }
  };

  function setSlidesVideos(modal, index, type) {
    var videos = modal.slides[index].querySelectorAll(type+'[data-src]');
    for(var i = 0; i < videos.length; i++) {
      videos[0].src = videos[0].getAttribute('data-src');
      videos[0].removeAttribute('data-src');
    }
  };

  function initSlideshow(modal) { 
    if(modal.slides.length <= 1) {
      hideSlideshowElements(modal);
      return;
    } 
    var swipe = (modal.slideshow.getAttribute('data-swipe') && modal.slideshow.getAttribute('data-swipe') == 'on') ? true : false;
    modal.slideshowObj = new Slideshow({element: modal.slideshow, navigation: false, autoplay : false, swipe : swipe});
  };

  function hideSlideshowElements(modal) { // hide slideshow controls if gallery is composed by one item only
    var slideshowNav = modal.element.getElementsByClassName('js-slideshow__control');
    if(slideshowNav.length > 0) {
      for(var i = 0; i < slideshowNav.length; i++) Util.addClass(slideshowNav[i], 'is-hidden');
    }
    var slideshowThumbs = modal.element.getElementsByClassName('js-lightbox_footer');
    if(slideshowThumbs.length > 0) Util.addClass(slideshowThumbs[0], 'is-hidden');
  };

  function resetVideos(modal, index) {
    if(index) {
      var actualVideo = modal.slides[index].getElementsByTagName('video');
      if(actualVideo.length > 0 ) actualVideo[0].pause();
    }
    var newVideo = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(newVideo.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newVideo[0]);
      newVideo[0].play();
    }
  };

  function resetIframes(modal, index) {
    if(index) {
      var actualIframe = modal.slides[index].getElementsByTagName('iframe');
      if(actualIframe.length > 0 ) {
        actualIframe[0].setAttribute('data-src', actualIframe[0].src);
        actualIframe[0].removeAttribute('src');
      }
    }
    var newIframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(newIframe.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newIframe[0]);
    }
  };

  function resizeLightbox(modal) { // executed when window has been resized
    if(!modal.selectedSlide) return; // modal not active
    var video = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(video.length > 0 ) setVideoWidth(modal, modal.selectedSlide, video[0]);
    var iframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(iframe.length > 0 ) setVideoWidth(modal, modal.selectedSlide, iframe[0]);
  };

  function setVideoWidth(modal, index, video) {
    var videoContainer = modal.slides[index].getElementsByClassName('js-lightbox__media-outer');
    if(videoContainer.length == 0 ) return;
    var videoWrapper = videoContainer[0].getElementsByClassName('js-lightbox__media-inner');
    var maxWidth = (video.offsetWidth/video.offsetHeight)*videoContainer[0].offsetHeight;
    if(maxWidth < modal.slides[index].offsetWidth) {
      videoWrapper[0].style.width = maxWidth+'px';
      videoWrapper[0].style.paddingBottom = videoContainer[0].offsetHeight+'px';
    } else {
      videoWrapper[0].removeAttribute('style')
    }
  };

  function initThumbPreview(modal) {
    if(modal.thumbWrapper.length < 1) return;
    var content = '';
    for(var i = 0; i < modal.slides.length; i++) {
      var activeClass = Util.hasClass(modal.slides[i], 'slideshow__item--selected') ? ' lightbox__thumb--active': '';
      content = content + '<li class="lightbox__thumb js-lightbox__thumb'+activeClass+'"><img src="'+modal.slides[i].querySelector('[data-thumb]').getAttribute('data-thumb')+'">'+'</li>';
    }
    modal.thumbWrapper[0].innerHTML = content;
  };

  function initThumbEvents(modal) {
    if(modal.thumbWrapper.length < 1) return;
    modal.thumbSlides = modal.thumbWrapper[0].getElementsByClassName('js-lightbox__thumb');
    modal.thumbWrapper[0].addEventListener('click', function(event){
      var selectedThumb = event.target.closest('.js-lightbox__thumb');
      if(!selectedThumb || Util.hasClass(selectedThumb, 'lightbox__thumb--active')) return;
      modal.slideshowObj.showItem(Util.getIndexInArray(modal.thumbSlides, selectedThumb));
    });
  };

  function updateThumb(modal) {
    if(modal.thumbWrapper.length < 1) return;
    // update selected thumb classes
    var selectedThumb = modal.thumbWrapper[0].getElementsByClassName('lightbox__thumb--active');
    if(selectedThumb.length > 0) Util.removeClass(selectedThumb[0], 'lightbox__thumb--active');
    Util.addClass(modal.thumbSlides[modal.selectedSlide], 'lightbox__thumb--active');
    // update thumb list position (if selected thumb is outside viewport)
    var offsetThumb = modal.thumbSlides[modal.selectedSlide].getBoundingClientRect(),
      offsetThumbList = modal.thumbWrapper[0].getBoundingClientRect();
    if(offsetThumb.left < offsetThumbList.left) {
      modal.thumbWrapper[0].scrollTo(modal.thumbSlides[modal.selectedSlide].offsetLeft - offsetThumbList.left, 0);
    } else if(offsetThumb.right > offsetThumbList.right) {
      modal.thumbWrapper[0].scrollTo( (offsetThumb.right - offsetThumbList.right) + modal.thumbWrapper[0].scrollLeft, 0);
    }
  };

  function keyboardNavigateLightbox(modal, direction) {
    if(!Util.hasClass(modal.element, 'modal--is-visible')) return;
    if(!document.activeElement.closest('.js-lightbox__body') && document.activeElement.closest('.js-modal')) return
    (direction == 'next') ? modal.slideshowObj.showNext() : modal.slideshowObj.showPrev();
  };

  function setSelectedItem(modal, event) {
    // if a specific slide was selected -> make sure to show that item first
    var selectedItemId = false;
    if(event.detail) {
      var elTarget = event.detail.closest('[aria-controls="'+modal.id+'"]');
      if(elTarget) selectedItemId = elTarget.getAttribute('data-lightbox-item');
    } 
    if(!selectedItemId || !modal.slideshowObj) return;
    var selectedItem = document.getElementById(selectedItemId);
    if(!selectedItem) return;
    var lastSelected = modal.slideshow.getElementsByClassName('slideshow__item--selected');
    if(lastSelected.length > 0 ) Util.removeClass(lastSelected[0], 'slideshow__item--selected');
    Util.addClass(selectedItem, 'slideshow__item--selected');
  };

  window.Lightbox = Lightbox;

  // init Lightbox objects
  var lightBoxes = document.getElementsByClassName('js-lightbox');
  if( lightBoxes.length > 0 ) {
    var lightBoxArray = [];
    for( var i = 0; i < lightBoxes.length; i++) {
      (function(i){ lightBoxArray.push(new Lightbox(lightBoxes[i]));})(i);
      
      // resize video/iframe
      var resizingId = false;
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){resizeLightbox(lightBoxArray[i]);})(i);
        };
      };

      // Lightbox gallery navigation with keyboard
      window.addEventListener('keydown', function(event){
        if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
          updateLightbox('next');
        } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
          updateLightbox('prev');
        }
      });

      function updateLightbox(direction) {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){keyboardNavigateLightbox(lightBoxArray[i], direction);})(i);
        };
      };
    }
  }
}());
(function() {
  var morphModal = document.getElementsByClassName('js-morph-img-modal');
  if(morphModal.length > 0) {
    var searchValues = [
      {id: 1, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 1</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'},
      {id: 2, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 2</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'},
      {id: 3, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 3</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'},
      {id: 4, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 4</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'},
      {id: 5, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 5</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'},
      {id: 6, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 6</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'},
      {id: 7, content: '<div class="text-component padding-md padding-lg@lg"><h1>Photo 7</h1><p class="color-contrast-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis consequatur iusto maxime, facere saepe sunt quod optio praesentium. Sequi, placeat! Ratione soluta et necessitatibus dolorem.</p><p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora vitae quidem corrupti eos fuga quaerat beatae ducimus earum?</p></div>'}
    ];

    new MorphImgModal({
      element: morphModal[0],
      searchData: function(trigger, cb) {
        var imageId = trigger.getAttribute('data-morph-img') || 1;
        var data = searchValues.filter(function(item){
          return item['id'] == imageId;
        });
        cb(data[0]['content']);
      }
    });
  }
}());