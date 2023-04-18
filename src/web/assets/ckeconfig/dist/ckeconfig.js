(function(){var __webpack_modules__={150:function(__unused_webpack_module,__webpack_exports__,__webpack_require__){"use strict";var _ckeconfig_css__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(778),_ckeconfig_css__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_ckeconfig_css__WEBPACK_IMPORTED_MODULE_0__),jquery__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(311),jquery__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_unsupportedIterableToArray(e,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArrayLimit(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,o,i,a,s=[],c=!0,u=!1;try{if(i=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;c=!1}else for(;!(c=(n=i.call(r)).done)&&(s.push(n.value),s.length!==t);c=!0);}catch(e){u=!0,o=e}finally{try{if(!c&&null!=r.return&&(a=r.return(),Object(a)!==a))return}finally{if(u)throw o}}return s}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _createForOfIteratorHelper(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,s=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return a=e.done,e},e:function(e){s=!0,i=e},f:function(){try{a||null==r.return||r.return()}finally{if(s)throw i}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}__webpack_exports__.Z=Garnish.Base.extend({$container:null,$jsonContainer:null,$jsContainer:null,jsonEditor:null,jsEditor:null,init:function init(id){var _this=this;this.$container=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#".concat(id)),this.$jsonContainer=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#".concat(id,"-json-container")),this.$jsContainer=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#".concat(id,"-js-container")),this.jsonEditor=window.monacoEditorInstances["".concat(id,"-json")],this.jsEditor=window.monacoEditorInstances["".concat(id,"-js")];var $languagePicker=this.$container.children(".btngroup");new Craft.Listbox($languagePicker,{onChange:function(e){switch(e.data("language")){case"json":_this.$jsonContainer.removeClass("hidden"),_this.$jsContainer.addClass("hidden");var t=_this.js2json(_this.jsEditor.getModel().getValue());_this.jsonEditor.getModel().setValue(t||"{\n  \n}"),_this.jsEditor.getModel().setValue("");break;case"js":_this.$jsonContainer.addClass("hidden"),_this.$jsContainer.removeClass("hidden");var r=_this.json2js(_this.jsonEditor.getModel().getValue());_this.jsEditor.getModel().setValue(r||"return {\n  \n}"),_this.jsonEditor.getModel().setValue("")}}}),this.jsonEditor.onDidPaste((function(ev){var pastedContent=_this.jsonEditor.getModel().getValueInRange(ev.range),config;try{eval("config = {".concat(pastedContent,"}"))}catch(e){return}var json=JSON.stringify(config,null,2),trimmed=Craft.trim(json.substring(1,json.length-1));trimmed&&_this.jsonEditor.executeEdits("",[{range:ev.range,text:trimmed}])}))},js2json:function js2json(js){var m=(js||"").match(/return\s*(\{[\w\W]*})/),config;if(!m)return!1;try{eval("config = ".concat(m[1],";"))}catch(e){return!1}var json=JSON.stringify(config,null,2);return"{}"===json&&(json="{\n  \n}"),json},json2js:function(e){var t;try{t=JSON.parse(e)}catch(e){return!1}if(!jquery__WEBPACK_IMPORTED_MODULE_1___default().isPlainObject(t))return!1;var r=this.jsify(t,"");return"{\n}"===r&&(r="{\n  \n}"),"return ".concat(r)},jsify:function(e,t){var r;if(jquery__WEBPACK_IMPORTED_MODULE_1___default().isArray(e)){r="[\n";var n,o=_createForOfIteratorHelper(e);try{for(o.s();!(n=o.n()).done;){var i=n.value;r+="".concat(t,"  ").concat(this.jsify(i,t+"  "),",\n")}}catch(e){o.e(e)}finally{o.f()}r+="".concat(t,"]")}else if(jquery__WEBPACK_IMPORTED_MODULE_1___default().isPlainObject(e)){r="{\n";for(var a=0,s=Object.entries(e);a<s.length;a++){var c=_slicedToArray(s[a],2),u=c[0],l=c[1];r+="".concat(t,"  ").concat(u,": ").concat(this.jsify(l,t+"  "),",\n")}r+="".concat(t,"}")}else r="string"!=typeof e||e.match(/[\r\n']/)?JSON.stringify(e):"'".concat(e,"'");return r}})},880:function(){},778:function(e,t,r){var n=r(880);n.__esModule&&(n=n.default),"string"==typeof n&&(n=[[e.id,n,""]]),n.locals&&(e.exports=n.locals),(0,r(673).Z)("4690113c",n,!0,{})},673:function(e,t,r){"use strict";function n(e,t){for(var r=[],n={},o=0;o<t.length;o++){var i=t[o],a=i[0],s={id:e+":"+o,css:i[1],media:i[2],sourceMap:i[3]};n[a]?n[a].parts.push(s):r.push(n[a]={id:a,parts:[s]})}return r}r.d(t,{Z:function(){return p}});var o="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!o)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var i={},a=o&&(document.head||document.getElementsByTagName("head")[0]),s=null,c=0,u=!1,l=function(){},d=null,f="data-vue-ssr-id",_="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function p(e,t,r,o){u=r,d=o||{};var a=n(e,t);return h(a),function(t){for(var r=[],o=0;o<a.length;o++){var s=a[o];(c=i[s.id]).refs--,r.push(c)}for(t?h(a=n(e,t)):a=[],o=0;o<r.length;o++){var c;if(0===(c=r[o]).refs){for(var u=0;u<c.parts.length;u++)c.parts[u]();delete i[c.id]}}}}function h(e){for(var t=0;t<e.length;t++){var r=e[t],n=i[r.id];if(n){n.refs++;for(var o=0;o<n.parts.length;o++)n.parts[o](r.parts[o]);for(;o<r.parts.length;o++)n.parts.push(m(r.parts[o]));n.parts.length>r.parts.length&&(n.parts.length=r.parts.length)}else{var a=[];for(o=0;o<r.parts.length;o++)a.push(m(r.parts[o]));i[r.id]={id:r.id,refs:1,parts:a}}}}function g(){var e=document.createElement("style");return e.type="text/css",a.appendChild(e),e}function m(e){var t,r,n=document.querySelector("style["+f+'~="'+e.id+'"]');if(n){if(u)return l;n.parentNode.removeChild(n)}if(_){var o=c++;n=s||(s=g()),t=b.bind(null,n,o,!1),r=b.bind(null,n,o,!0)}else n=g(),t=C.bind(null,n),r=function(){n.parentNode.removeChild(n)};return t(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;t(e=n)}else r()}}var v,y=(v=[],function(e,t){return v[e]=t,v.filter(Boolean).join("\n")});function b(e,t,r,n){var o=r?"":n.css;if(e.styleSheet)e.styleSheet.cssText=y(t,o);else{var i=document.createTextNode(o),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(i,a[t]):e.appendChild(i)}}function C(e,t){var r=t.css,n=t.media,o=t.sourceMap;if(n&&e.setAttribute("media",n),d.ssrId&&e.setAttribute(f,t.id),o&&(r+="\n/*# sourceURL="+o.sources[0]+" */",r+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */"),e.styleSheet)e.styleSheet.cssText=r;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(r))}}},311:function(e){"use strict";e.exports=jQuery}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var r=__webpack_module_cache__[e]={id:e,exports:{}};return __webpack_modules__[e](r,r.exports,__webpack_require__),r.exports}__webpack_require__.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(t,{a:t}),t},__webpack_require__.d=function(e,t){for(var r in t)__webpack_require__.o(t,r)&&!__webpack_require__.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};var __webpack_exports__={};!function(){"use strict";__webpack_require__(778);var e=__webpack_require__(311),t=__webpack_require__.n(e);function r(e){return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(e)}function n(e){return function(e){if(Array.isArray(e))return a(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||i(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=i(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,s=!0,c=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return s=e.done,e},e:function(e){c=!0,a=e},f:function(){try{s||null==r.return||r.return()}finally{if(c)throw a}}}}function i(e,t){if(e){if("string"==typeof e)return a(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?a(e,t):void 0}}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function s(e,t,n){return(t=function(e){var t=function(e,t){if("object"!==r(e)||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var o=n.call(e,"string");if("object"!==r(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"===r(t)?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var c=Garnish.Base.extend({$sourceContainer:null,$targetContainer:null,$input:null,value:null,components:null,drag:null,$items:null,draggingSourceItem:null,draggingSeparator:null,$insertion:null,showingInsertion:!1,closestItem:null,init:function(e){var r=this;this.$sourceContainer=t()("#".concat(e," .ckeditor-tb--source .ck-toolbar__items")),this.$targetContainer=t()("#".concat(e," .ckeditor-tb--target .ck-toolbar__items")),this.$input=t()("#".concat(e," input")),this.value=JSON.parse(this.$input.val());var i=document.createElement("DIV"),a=document.createElement("DIV");i.appendChild(a),Ckeditor.create(a,{linkOptions:[{elementType:"craft\\elements\\Asset"}]}).then((function(e){var i=e.ui.componentFactory,a=Array.from(i.names());r.components={};for(var c=0,u=a;c<u.length;c++){var l=u[c];r.components[l]=i.create(l)}for(var d=["heading","style","alignment","bold","italic","underline","strikethrough","subscript","superscript","code","link","fontSize","fontFamily","fontColor","fontBackgroundColor","insertImage","mediaEmbed","htmlEmbed","blockQuote","insertTable","codeBlock","bulletedList","numberedList","todoList",["outdent","indent"],"horizontalLine","pageBreak","selectAll","findAndReplace",["undo","redo"],"sourceEditing"],f=function(e){"string"==typeof d[e]&&(d[e]=[d[e]]);var t=d[e];if(t.length>1){var o=r.value.findIndex((function(e){return t.includes(e)}));if(-1!==o)for(var i=0;i<t.length;i++)if(r.value[o+i]!==t[i]){d.splice.apply(d,[e,1].concat(n(t.map((function(e){return[e]}))))),e+=t.length-1;break}}_=e},_=0;_<d.length;_++)f(_);r.drag=new Garnish.DragDrop({dropTargets:r.$targetContainer,helper:function(e){var r=t()('<div class="offset-drag-helper ck ck-reset_all ck-editor ck-rounded-corners"/>'),n=t()('<div class="ck ck-toolbar"/>').appendTo(r);return e.appendTo(n),r},moveHelperToCursor:!0,onDragStart:function(){Garnish.$bod.addClass("dragging");var e=r.drag.$draggee;if(r.draggingSourceItem=t().contains(r.$sourceContainer[0],e[0]),r.draggingSeparator=e.hasClass("ckeditor-tb--separator"),r.$insertion=t()('<div class="ckeditor-tb--insertion"/>').css({width:e.outerWidth()}),r.draggingSourceItem)if(r.draggingSeparator)e.css("visibility","");else{var n="ltr"===Craft.orientation?"margin-right":"margin-left",o=-1*e.outerWidth();e.stop().velocity(s({},n,o),200,(function(){e.addClass("hidden")}))}else e.addClass("hidden"),r.$insertion.insertBefore(e),r.showingInsertion=!0;r.setMidpoints()},onDrag:function(){r.checkForNewClosestItem()},onDragStop:function(){Garnish.$bod.removeClass("dragging");var e=r.drag.$draggee;if(r.checkForNewClosestItem(),r.showingInsertion){var i;r.draggingSourceItem?((i=r.draggingSeparator?r.renderSeparator():r.renderComponentGroup(e.data("componentNames"))).data("sourceItem",e[0]),i.css("visibility","hidden"),r.$insertion.replaceWith(i),r.drag.$draggee=i):(r.$insertion.replaceWith(e),e.removeClass("hidden"))}else{if(!r.draggingSourceItem){var a=t()(e.data("sourceItem"));e.remove(),r.drag.$draggee=e=a}if(!r.draggingSeparator){e.removeClass("hidden");var c="ltr"===Craft.orientation?"margin-right":"margin-left",u=e.css(c);e.css(c,"");var l=e.css(c);e.css(c,u),e.stop().velocity(s({},c,l),200,(function(){e.css(c,"")}))}}r.drag.returnHelpersToDraggees(),r.$items=r.$targetContainer.children(),r.value=[];var d,f=o(r.$items.toArray());try{for(f.s();!(d=f.n()).done;){var _,p=d.value,h=t()(p);h.hasClass("ckeditor-tb--separator")?r.value.push("|"):(_=r.value).push.apply(_,n(h.data("componentNames")))}}catch(e){f.e(e)}finally{f.f()}r.$input.val(JSON.stringify(r.value))}});for(var p={},h=0,g=d;h<g.length;h++){var m=g[h],v=r.renderComponentGroup(m).appendTo(r.$sourceContainer);p[m.join(",")]=v[0],r.value.includes(m[0])&&v.addClass("hidden")}p["|"]=r.renderSeparator().appendTo(r.$sourceContainer)[0],r.$items=t()();for(var y=function(e){var t,n,o=r.value[e];if("|"===o)t=r.renderSeparator().appendTo(r.$targetContainer),n="|";else{var i=d.find((function(e){return e.includes(o)}));if(!i)return b=e,"continue";t=r.renderComponentGroup(i).appendTo(r.$targetContainer),n=i.join(","),e+=i.length-1}t.data("sourceItem",p[n]),r.$items=r.$items.add(t),b=e},b=0;b<r.value.length;b++)y(b)}))},renderSeparator:function(){var e=t()('<div class="ckeditor-tb--item ckeditor-tb--separator" data-cke-tooltip-text="Separator"><span class="ck ck-toolbar__separator"/></div>');return this.drag.addItems(e),e},renderComponentGroup:function(e){var r,n=[],i=t()('<div class="ckeditor-tb--item"/>'),a=o(e);try{for(a.s();!(r=a.n()).done;){var s=r.value,c=this.renderComponent(s).appendTo(i),u=(c.is("[data-cke-tooltip-text]")?c:c.find("[data-cke-tooltip-text]")).attr("data-cke-tooltip-text");n.push(u?u.replace(/ \(.*\)$/,""):"".concat(s[0].toUpperCase()).concat(s.slice(1)))}}catch(e){a.e(e)}finally{a.f()}return i.attr("data-cke-tooltip-text",n.join(", ")),i.data("componentNames",e),this.drag.addItems(i),i},renderComponent:function(e){var r=this.components[e];if(!r)throw"Missing component ".concat(e);r.isRendered||r.render();var n=t()(r.element.outerHTML);return n.data("componentName",e),n},getClosestItem:function(){var e=this;if(!Garnish.hitTest(this.drag.mouseX,this.drag.mouseY,this.$targetContainer))return!1;if(!this.$items.length)return null;var r=this.$items.toArray();this.showingInsertion&&r.push(this.$insertion[0]);var o=r.map((function(r){var n=t().data(r,"midpoint");return Garnish.getDist(n.left,n.top,e.drag.mouseX,e.drag.mouseY)})),i=Math.min.apply(Math,n(o));return r[o.indexOf(i)]},checkForNewClosestItem:function(){var e=this.getClosestItem();!1!==e?e!==this.$insertion[0]&&(e?this.drag.mouseX<t().data(e,"midpoint").left?this.$insertion.insertBefore(e):this.$insertion.insertAfter(e):this.$insertion.appendTo(this.$targetContainer),this.showingInsertion=!0,this.setMidpoints()):this.showingInsertion&&(this.$insertion.remove(),this.showingInsertion=!1)},setMidpoints:function(){var e=this.$items.toArray();this.showingInsertion&&e.push(this.$insertion[0]);var r,n=o(e);try{for(n.s();!(r=n.n()).done;){var i=r.value,a=t()(i),s=a.offset(),c=s.left+a.outerWidth()/2,u=s.top+a.outerHeight()/2;a.data("midpoint",{left:c,top:u})}}catch(e){n.e(e)}finally{n.f()}}}),u=__webpack_require__(150);window.Ckeditor.ToolbarBuilder=c,window.Ckeditor.ConfigOptions=u.Z}()})();
//# sourceMappingURL=ckeconfig.js.map