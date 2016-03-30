var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    res.ends('<!doctype html><html><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><script type="text/javascript">window.NREUM||(NREUM={}),__nr_require=function(e,t,n){function r(n){if(!t[n]){var o=t[n]={exports:{}};e[n][0].call(o.exports,function(t){var o=e[n][1][t];return r(o||t)},o,o.exports)}return t[n].exports}if("function"==typeof __nr_require)return __nr_require;for(var o=0;o<n.length;o++)r(n[o]);return r}({1:[function(e,t,n){function r(e,t){return function(){o(e,[(new Date).getTime()].concat(a(arguments)),null,t)}}var o=e("handle"),i=e(2),a=e(3);"undefined"==typeof window.newrelic&&(newrelic=NREUM);var u=["setPageViewName","addPageAction","setCustomAttribute","finished","addToTrace","inlineHit"],c=["addPageAction"],f="api-";i(u,function(e,t){newrelic[t]=r(f+t,"api")}),i(c,function(e,t){newrelic[t]=r(f+t)}),t.exports=newrelic,newrelic.noticeError=function(e){"string"==typeof e&&(e=new Error(e)),o("err",[e,(new Date).getTime()])}},{}],2:[function(e,t,n){function r(e,t){var n=[],r="",i=0;for(r in e)o.call(e,r)&&(n[i]=t(r,e[r]),i+=1);return n}var o=Object.prototype.hasOwnProperty;t.exports=r},{}],3:[function(e,t,n){function r(e,t,n){t||(t=0),"undefined"==typeof n&&(n=e?e.length:0);for(var r=-1,o=n-t||0,i=Array(0>o?0:o);++r<o;)i[r]=e[t+r];return i}t.exports=r},{}],ee:[function(e,t,n){function r(){}function o(e){function t(e){return e&&e instanceof r?e:e?u(e,a,i):i()}function n(n,r,o){e&&e(n,r,o);for(var i=t(o),a=l(n),u=a.length,c=0;u>c;c++)a[c].apply(i,r);var s=f[g[n]];return s&&s.push([m,n,r,i]),i}function p(e,t){w[e]=l(e).concat(t)}function l(e){return w[e]||[]}function d(e){return s[e]=s[e]||o(n)}function v(e,t){c(e,function(e,n){t=t||"feature",g[n]=t,t in f||(f[t]=[])})}var w={},g={},m={on:p,emit:n,get:d,listeners:l,context:t,buffer:v};return m}function i(){return new r}var a="nr@context",u=e("gos"),c=e(2),f={},s={},p=t.exports=o();p.backlog=f},{}],gos:[function(e,t,n){function r(e,t,n){if(o.call(e,t))return e[t];var r=n();if(Object.defineProperty&&Object.keys)try{return Object.defineProperty(e,t,{value:r,writable:!0,enumerable:!1}),r}catch(i){}return e[t]=r,r}var o=Object.prototype.hasOwnProperty;t.exports=r},{}],handle:[function(e,t,n){function r(e,t,n,r){o.buffer([e],r),o.emit(e,t,n)}var o=e("ee").get("handle");t.exports=r,r.ee=o},{}],id:[function(e,t,n){function r(e){var t=typeof e;return!e||"object"!==t&&"function"!==t?-1:e===window?0:a(e,i,function(){return o++})}var o=1,i="nr@id",a=e("gos");t.exports=r},{}],loader:[function(e,t,n){function r(){if(!w++){var e=v.info=NREUM.info,t=s.getElementsByTagName("script")[0];if(e&&e.licenseKey&&e.applicationID&&t){c(l,function(t,n){e[t]||(e[t]=n)});var n="https"===p.split(":")[0]||e.sslForHttp;v.proto=n?"https://":"http://",u("mark",["onload",a()],null,"api");var r=s.createElement("script");r.src=v.proto+e.agent,t.parentNode.insertBefore(r,t)}}}function o(){"complete"===s.readyState&&i()}function i(){u("mark",["domContent",a()],null,"api")}function a(){return(new Date).getTime()}var u=e("handle"),c=e(2),f=window,s=f.document;NREUM.o={ST:setTimeout,XHR:f.XMLHttpRequest,REQ:f.Request,EV:f.Event,PR:f.Promise,MO:f.MutationObserver},e(1);var p=(""+location).split("?")[0],l={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",agent:"js-agent.newrelic.com/nr-892.min.js"},d=window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&!/CriOS/.test(navigator.userAgent),v=t.exports={offset:a(),origin:p,features:{},xhrWrappable:d};s.addEventListener?(s.addEventListener("DOMContentLoaded",i,!1),f.addEventListener("load",r,!1)):(s.attachEvent("onreadystatechange",o),f.attachEvent("onload",r)),u("mark",["firstbyte",a()],null,"api");var w=0},{}]},{},["loader"]);</script><script type="text/javascript">window.NREUM||(NREUM={});NREUM.info={"beacon":"bam.nr-data.net","queueTime":0,"licenseKey":"17af7e6d07","agent":"","transactionName":"NQdaYURWW0UFVhEIWgxNfkBYVEFfC1tKEVkXBRZDX0RAVwhcHwRHTBRRUEFED1EBQToXXBEXWVlfTVBE","applicationID":"10317296","errorBeacon":"bam.nr-data.net","applicationTime":9}</script> <title></title> <style type="text/css"> html{width: 100%; height: 100%; background-color: #000;}body{overflow: hidden;}ul{height: 100%; width: 100%; display: block; margin: 0 auto;}li{position: absolute; left: 50%; top: 50%; display: block; background: transparent; border: 10px solid #17f6fb; border-radius: 500px; transition: all 0.5s ease;}li:first-child{margin-left: -130px; margin-top: -130px; width: 240px; height: 240px; border-color: #e000c9; border-left-color: transparent; border-right-color: transparent; animation: spin 12s infinite linear; -webkit-animation: spin 12s infinite linear;}li:nth-child(2){margin-left: -120px; margin-top: -120px; width: 220px; height: 220px; border-color: #7500ad; border-top-color: transparent; border-right-color: transparent; animation: spin2 12s infinite linear; -webkit-animation: spin2 12s infinite linear;}li:nth-child(3){margin-left: -110px; margin-top: -110px; width: 200px; height: 200px; border-color: #0049d8; border-left-color: transparent; border-right-color: transparent; animation: spin3 4s infinite linear; -webkit-animation: spin3 4s infinite linear;}li:nth-child(4){margin-left: -80px; margin-top: -80px; width: 140px; height: 140px; border-color: #0089ed; border-left-color: transparent; border-top-color: transparent; animation: spin4 4s infinite linear; -webkit-animation: spin4 4s infinite linear;}li:nth-child(5){margin-left: -70px; margin-top: -70px; width: 120px; height: 120px; border-color: #00f2a9; border-left-color: transparent; border-right-color: transparent; animation: spin5 4s infinite linear; -webkit-animation: spin5 4s infinite linear;}li:nth-child(6){margin-left: -60px; margin-top: -60px; width: 100px; height: 100px; border-color: #009e2c; border-left-color: transparent; border-right-color: transparent; animation: spin6 4s infinite linear; -webkit-animation: spin6 4s infinite linear;}li:nth-child(7){margin-left: -40px; margin-top: -40px; width: 60px; height: 60px; border-color: #d4d800; border-left-color: transparent; border-right-color: transparent; border-top-color: transparent; animation: spin7 2s infinite linear; -webkit-animation: spin7 2s infinite linear;}li:nth-child(8){margin-left: -30px; margin-top: -30px; width: 40px; height: 40px; border-color: #c18b00; border-left-color: transparent; border-right-color: transparent; animation: spin8 2s infinite linear; -webkit-animation: spin8 2s infinite linear;}/* Animations */ @-webkit-keyframes spin{0%{-webkit-transform: rotate(0deg);}10%{-webkit-transform: rotate(-25deg);}20%{-webkit-transform: rotate(47deg);}30%{-webkit-transform: rotate(-125deg);}40%{-webkit-transform: rotate(-25deg);}50%{-webkit-transform: rotate(25deg);}60%{-webkit-transform: rotate(165deg);}70%{-webkit-transform: rotate(42deg);}80%{-webkit-transform: rotate(180deg);}90%{-webkit-transform: rotate(-300deg);}100%{-webkit-transform: rotate(360deg);}}@-webkit-keyframes spin2{0%{-webkit-transform: rotate(0deg);}100%{-webkit-transform: rotate(360deg);}}@-webkit-keyframes spin3{0%{-webkit-transform: rotate(0deg);}60%{-webkit-transform: rotate(165deg);}70%{-webkit-transform: rotate(42deg);}100%{-webkit-transform: rotate(360deg);}}@-webkit-keyframes spin4{0%{-webkit-transform: rotate(0deg);}100%{-webkit-transform: rotate(360deg);}}@-webkit-keyframes spin5{0%{-webkit-transform: rotate(0deg);}10%{-webkit-transform: rotate(-25deg);}20%{-webkit-transform: rotate(47deg);}30%{-webkit-transform: rotate(-125deg);}100%{-webkit-transform: rotate(360deg);}}@-webkit-keyframes spin6{0%{-webkit-transform: rotate(0deg);}80%{-webkit-transform: rotate(180deg);}90%{-webkit-transform: rotate(-300deg);}100%{-webkit-transform: rotate(360deg);}}@-webkit-keyframes spin7{0%{-webkit-transform: rotate(0deg);}100%{-webkit-transform: rotate(-360deg);}}@-webkit-keyframes spin8{0%{-webkit-transform: rotate(0deg);}100%{-webkit-transform: rotate(360deg);}}@keyframes spin{0%{transform: rotate(0deg);}10%{transform: rotate(-25deg);}20%{transform: rotate(47deg);}30%{transform: rotate(-125deg);}40%{transform: rotate(-25deg);}50%{transform: rotate(25deg);}60%{transform: rotate(165deg);}70%{transform: rotate(42deg);}80%{transform: rotate(180deg);}90%{transform: rotate(-300deg);}100%{transform: rotate(360deg);}}@keyframes spin2{0%{transform: rotate(0deg);}100%{transform: rotate(360deg);}}@keyframes spin3{0%{transform: rotate(0deg);}60%{transform: rotate(165deg);}70%{transform: rotate(42deg);}100%{transform: rotate(360deg);}}@keyframes spin4{0%{transform: rotate(0deg);}100%{transform: rotate(360deg);}}@keyframes spin5{0%{transform: rotate(0deg);}10%{transform: rotate(-25deg);}20%{transform: rotate(47deg);}30%{transform: rotate(-125deg);}100%{transform: rotate(360deg);}}@keyframes spin6{0%{transform: rotate(0deg);}80%{transform: rotate(180deg);}90%{transform: rotate(-300deg);}100%{transform: rotate(360deg);}}@keyframes spin7{0%{transform: rotate(0deg);}100%{transform: rotate(-360deg);}}@keyframes spin8{0%{transform: rotate(0deg);}100%{transform: rotate(360deg);}}</style></head><body> <ul> <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul></body></html>');
}