(function(){var __webpack_modules__={150:function(__unused_webpack_module,__webpack_exports__,__webpack_require__){"use strict";var _ckeconfig_css__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(778),_ckeconfig_css__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_ckeconfig_css__WEBPACK_IMPORTED_MODULE_0__),jquery__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(311),jquery__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_unsupportedIterableToArray(e,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArrayLimit(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,o,i,a,s=[],u=!0,c=!1;try{if(i=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;u=!1}else for(;!(u=(n=i.call(r)).done)&&(s.push(n.value),s.length!==t);u=!0);}catch(e){c=!0,o=e}finally{try{if(!u&&null!=r.return&&(a=r.return(),Object(a)!==a))return}finally{if(c)throw o}}return s}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _createForOfIteratorHelper(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,s=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return a=e.done,e},e:function(e){s=!0,i=e},f:function(){try{a||null==r.return||r.return()}finally{if(s)throw i}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}__webpack_exports__.Z=Garnish.Base.extend({jsonSchemaUri:null,language:null,$container:null,$jsonContainer:null,$jsContainer:null,jsonEditor:null,jsEditor:null,defaults:null,init:function init(id,jsonSchemaUri){var _this=this;this.jsonSchemaUri=jsonSchemaUri,this.$container=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#".concat(id)),this.$jsonContainer=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#".concat(id,"-json-container")),this.$jsContainer=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#".concat(id,"-js-container")),this.jsonEditor=window.monacoEditorInstances["".concat(id,"-json")],this.jsEditor=window.monacoEditorInstances["".concat(id,"-js")];var $languagePicker=this.$container.children(".btngroup");this.$jsonContainer.hasClass("hidden")?this.language="js":this.language="json",this.defaults={},new Craft.Listbox($languagePicker,{onChange:function(e){switch(_this.language=e.data("language"),_this.language){case"json":_this.$jsonContainer.removeClass("hidden"),_this.$jsContainer.addClass("hidden");var t=_this.js2json(_this.jsEditor.getModel().getValue());_this.jsonEditor.getModel().setValue(t||"{\n  \n}"),_this.jsEditor.getModel().setValue("");break;case"js":_this.$jsonContainer.addClass("hidden"),_this.$jsContainer.removeClass("hidden");var r=_this.json2js(_this.jsonEditor.getModel().getValue());_this.jsEditor.getModel().setValue(r||"return {\n  \n}"),_this.jsonEditor.getModel().setValue("")}}}),this.jsonEditor.onDidPaste((function(ev){var pastedContent=_this.jsonEditor.getModel().getValueInRange(ev.range),config;try{eval("config = {".concat(pastedContent,"}"))}catch(e){return}var json=JSON.stringify(config,null,2),trimmed=Craft.trim(json.substring(1,json.length-1));trimmed&&_this.jsonEditor.executeEdits("",[{range:ev.range,text:trimmed}])}))},getConfig:function(){var e;if("json"===this.language)e=Craft.trim(this.jsonEditor.getModel().getValue())||"{}";else{var t=Craft.trim(this.jsEditor.getModel().getValue());if(!1===(e=t?this.js2json(t):"{}"))return!1}try{var r=JSON.parse(e);return!!jquery__WEBPACK_IMPORTED_MODULE_1___default().isPlainObject(r)&&r}catch(e){return!1}},setConfig:function(e){var t=this.config2json(e);if("json"===this.language)this.jsonEditor.getModel().setValue(t);else{var r=this.json2js(t);this.jsEditor.getModel().setValue(r||"return {\n  \n}")}},addSetting:function(e){var t=this.getConfig();t&&void 0===t[e]&&(void 0===this.defaults[e]&&(this.populateDefault(e),void 0===this.defaults[e])||(t[e]=this.defaults[e],this.setConfig(t)))},removeSetting:function(e){var t=this.getConfig();t&&void 0!==t[e]&&(this.defaults[e]=t[e],delete t[e],this.setConfig(t))},populateDefault:function(e){var t,r=this;try{t=window.monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas.find((function(e){return e.uri===r.jsonSchemaUri})).schema}catch(e){return void console.warn("Couldn’t get config options JSON schema.",e)}if(t.$defs&&t.$defs.EditorConfig&&t.$defs.EditorConfig.properties){if(t.$defs.EditorConfig.properties[e]){var n=t.$defs.EditorConfig.properties[e];if(n.default)this.defaults[e]=n.default;else if(n.$ref){var o=n.$ref.match(/^#\/\$defs\/(\w+)/);if(o){var i=o[1];t.$defs[i]&&t.$defs[i].default&&(this.defaults[e]=t.$defs[i].default)}}}}else console.warn("Config options JSON schema is missing $defs.EditorConfig.properties")},config2json:function(e){var t=JSON.stringify(e,null,2);return"{}"===t&&(t="{\n  \n}"),t},js2json:function js2json(js){var m=(js||"").match(/return\s*(\{[\w\W]*})/),config;if(!m)return!1;try{eval("config = ".concat(m[1],";"))}catch(e){return!1}return this.config2json(config)},json2js:function(e){var t;try{t=JSON.parse(e)}catch(e){return!1}if(!jquery__WEBPACK_IMPORTED_MODULE_1___default().isPlainObject(t))return!1;var r=this.jsify(t,"");return"{\n}"===r&&(r="{\n  \n}"),"return ".concat(r)},jsify:function(e,t){var r;if(jquery__WEBPACK_IMPORTED_MODULE_1___default().isArray(e)){r="[\n";var n,o=_createForOfIteratorHelper(e);try{for(o.s();!(n=o.n()).done;){var i=n.value;r+="".concat(t,"  ").concat(this.jsify(i,t+"  "),",\n")}}catch(e){o.e(e)}finally{o.f()}r+="".concat(t,"]")}else if(jquery__WEBPACK_IMPORTED_MODULE_1___default().isPlainObject(e)){r="{\n";for(var a=0,s=Object.entries(e);a<s.length;a++){var u=_slicedToArray(s[a],2),c=u[0],l=u[1];r+="".concat(t,"  ").concat(c,": ").concat(this.jsify(l,t+"  "),",\n")}r+="".concat(t,"}")}else r="string"!=typeof e||e.match(/[\r\n']/)?JSON.stringify(e):"'".concat(e,"'");return r}})},880:function(){},778:function(e,t,r){var n=r(880);n.__esModule&&(n=n.default),"string"==typeof n&&(n=[[e.id,n,""]]),n.locals&&(e.exports=n.locals),(0,r(673).Z)("4690113c",n,!0,{})},673:function(e,t,r){"use strict";function n(e,t){for(var r=[],n={},o=0;o<t.length;o++){var i=t[o],a=i[0],s={id:e+":"+o,css:i[1],media:i[2],sourceMap:i[3]};n[a]?n[a].parts.push(s):r.push(n[a]={id:a,parts:[s]})}return r}r.d(t,{Z:function(){return p}});var o="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!o)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var i={},a=o&&(document.head||document.getElementsByTagName("head")[0]),s=null,u=0,c=!1,l=function(){},d=null,f="data-vue-ssr-id",_="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function p(e,t,r,o){c=r,d=o||{};var a=n(e,t);return h(a),function(t){for(var r=[],o=0;o<a.length;o++){var s=a[o];(u=i[s.id]).refs--,r.push(u)}for(t?h(a=n(e,t)):a=[],o=0;o<r.length;o++){var u;if(0===(u=r[o]).refs){for(var c=0;c<u.parts.length;c++)u.parts[c]();delete i[u.id]}}}}function h(e){for(var t=0;t<e.length;t++){var r=e[t],n=i[r.id];if(n){n.refs++;for(var o=0;o<n.parts.length;o++)n.parts[o](r.parts[o]);for(;o<r.parts.length;o++)n.parts.push(m(r.parts[o]));n.parts.length>r.parts.length&&(n.parts.length=r.parts.length)}else{var a=[];for(o=0;o<r.parts.length;o++)a.push(m(r.parts[o]));i[r.id]={id:r.id,refs:1,parts:a}}}}function g(){var e=document.createElement("style");return e.type="text/css",a.appendChild(e),e}function m(e){var t,r,n=document.querySelector("style["+f+'~="'+e.id+'"]');if(n){if(c)return l;n.parentNode.removeChild(n)}if(_){var o=u++;n=s||(s=g()),t=b.bind(null,n,o,!1),r=b.bind(null,n,o,!0)}else n=g(),t=j.bind(null,n),r=function(){n.parentNode.removeChild(n)};return t(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;t(e=n)}else r()}}var v,y=(v=[],function(e,t){return v[e]=t,v.filter(Boolean).join("\n")});function b(e,t,r,n){var o=r?"":n.css;if(e.styleSheet)e.styleSheet.cssText=y(t,o);else{var i=document.createTextNode(o),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(i,a[t]):e.appendChild(i)}}function j(e,t){var r=t.css,n=t.media,o=t.sourceMap;if(n&&e.setAttribute("media",n),d.ssrId&&e.setAttribute(f,t.id),o&&(r+="\n/*# sourceURL="+o.sources[0]+" */",r+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */"),e.styleSheet)e.styleSheet.cssText=r;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(r))}}},311:function(e){"use strict";e.exports=jQuery}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var r=__webpack_module_cache__[e]={id:e,exports:{}};return __webpack_modules__[e](r,r.exports,__webpack_require__),r.exports}__webpack_require__.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(t,{a:t}),t},__webpack_require__.d=function(e,t){for(var r in t)__webpack_require__.o(t,r)&&!__webpack_require__.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};var __webpack_exports__={};!function(){"use strict";__webpack_require__(778);var e=__webpack_require__(311),t=__webpack_require__.n(e);function r(e){return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(e)}function n(e){return function(e){if(Array.isArray(e))return a(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||i(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=i(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,s=!0,u=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return s=e.done,e},e:function(e){u=!0,a=e},f:function(){try{s||null==r.return||r.return()}finally{if(u)throw a}}}}function i(e,t){if(e){if("string"==typeof e)return a(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?a(e,t):void 0}}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function s(e,t,n){return(t=function(e){var t=function(e,t){if("object"!==r(e)||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var o=n.call(e,"string");if("object"!==r(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"===r(t)?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var u=Garnish.Base.extend({$sourceContainer:null,$targetContainer:null,$input:null,value:null,components:null,drag:null,$items:null,draggingSourceItem:null,draggingSeparator:null,$insertion:null,showingInsertion:!1,closestItem:null,init:function(e,r){var i=this;this.$sourceContainer=t()("#".concat(e," .ckeditor-tb--source .ck-toolbar__items")),this.$targetContainer=t()("#".concat(e," .ckeditor-tb--target .ck-toolbar__items")),this.$input=t()("#".concat(e," input")),this.value=JSON.parse(this.$input.val());var a=document.createElement("DIV"),u=document.createElement("DIV");a.appendChild(u),CKEditor5.craftcms.create(u,{linkOptions:[{elementType:"craft\\elements\\Asset"}]}).then((function(e){var a=e.ui.componentFactory,u=Array.from(a.names());i.components={};for(var c=0,l=u;c<l.length;c++){var d=l[c];i.components[d]=a.create(d)}for(var f=CKEditor5.craftcms.toolbarItems,_=function(e){var t=f[e];if(t.length>1){var r=i.value.findIndex((function(e){return t.some((function(t){return t.button===e}))}));if(-1!==r)for(var o=0;o<t.length;o++)if(i.value[r+o]!==t[o].button){f.splice.apply(f,[e,1].concat(n(t.map((function(e){return[e]}))))),e+=t.length-1;break}}p=e},p=0;p<f.length;p++)_(p);i.drag=new Garnish.DragDrop({dropTargets:i.$targetContainer,helper:function(e){var r=t()('<div class="offset-drag-helper ck ck-reset_all ck-editor ck-rounded-corners"/>'),n=t()('<div class="ck ck-toolbar"/>').appendTo(r);return e.appendTo(n),r},moveHelperToCursor:!0,onDragStart:function(){Garnish.$bod.addClass("dragging");var e=i.drag.$draggee;if(i.draggingSourceItem=t().contains(i.$sourceContainer[0],e[0]),i.draggingSeparator=e.hasClass("ckeditor-tb--separator"),i.$insertion=t()('<div class="ckeditor-tb--insertion"/>').css({width:e.outerWidth()}),i.draggingSourceItem)if(i.draggingSeparator)e.css("visibility","");else{var r="ltr"===Craft.orientation?"margin-right":"margin-left",n=-1*e.outerWidth();e.stop().velocity(s({},r,n),200,(function(){e.addClass("hidden")}))}else e.addClass("hidden"),i.$insertion.insertBefore(e),i.showingInsertion=!0;i.setMidpoints()},onDrag:function(){i.checkForNewClosestItem()},onDragStop:function(){Garnish.$bod.removeClass("dragging");var e=i.drag.$draggee;if(i.checkForNewClosestItem(),i.showingInsertion)if(i.draggingSourceItem){var a;if(i.draggingSeparator)a=i.renderSeparator();else{var u=e.data("componentNames");a=i.renderComponentGroup(u);var c,l=o(u);try{var d=function(){var e=c.value,t=f.flat().find((function(t){return t.button===e}));t&&t.configOption&&r.addSetting(t.configOption)};for(l.s();!(c=l.n()).done;)d()}catch(e){l.e(e)}finally{l.f()}}a.data("sourceItem",e[0]),a.css("visibility","hidden"),i.$insertion.replaceWith(a),i.drag.$draggee=a}else i.$insertion.replaceWith(e),e.removeClass("hidden");else{if(!i.draggingSourceItem){var _=t()(e.data("sourceItem"));if(e.remove(),i.drag.$draggee=e=_,!i.draggingSeparator){var p,h=o(_.data("componentNames"));try{var g=function(){var e=p.value,t=f.flat().find((function(t){return t.button===e}));t&&t.configOption&&r.removeSetting(t.configOption)};for(h.s();!(p=h.n()).done;)g()}catch(e){h.e(e)}finally{h.f()}}}if(!i.draggingSeparator){e.removeClass("hidden");var m="ltr"===Craft.orientation?"margin-right":"margin-left",v=e.css(m);e.css(m,"");var y=e.css(m);e.css(m,v),e.stop().velocity(s({},m,y),200,(function(){e.css(m,"")}))}}i.drag.returnHelpersToDraggees(),i.$items=i.$targetContainer.children(),i.value=[];var b,j=o(i.$items.toArray());try{for(j.s();!(b=j.n()).done;){var C,w=b.value,E=t()(w);E.hasClass("ckeditor-tb--separator")?i.value.push("|"):(C=i.value).push.apply(C,n(E.data("componentNames")))}}catch(e){j.e(e)}finally{j.f()}i.$input.val(JSON.stringify(i.value))}});var h,g={},m=o(f);try{for(m.s();!(h=m.n()).done;){var v=h.value,y=i.renderComponentGroup(v);y&&(y.appendTo(i.$sourceContainer),g[v.map((function(e){return e.button})).join(",")]=y[0],i.value.includes(v[0].button)&&y.addClass("hidden"))}}catch(e){m.e(e)}finally{m.f()}g["|"]=i.renderSeparator().appendTo(i.$sourceContainer)[0],i.$items=t()();for(var b=function(e){var t,r,n=i.value[e];if("|"===n)t=i.renderSeparator().appendTo(i.$targetContainer),r="|";else{var o=f.find((function(e){return e.some((function(e){return e.button===n}))}));if(!o)return j=e,"continue";if(!(t=i.renderComponentGroup(o)))return j=e,"continue";t.appendTo(i.$targetContainer),r=o.map((function(e){return e.button})).join(","),e+=o.length-1}t.data("sourceItem",g[r]),i.$items=i.$items.add(t),j=e},j=0;j<i.value.length;j++)b(j)}))},renderSeparator:function(){var e=t()('<div class="ckeditor-tb--item ckeditor-tb--separator" data-cke-tooltip-text="Separator"><span class="ck ck-toolbar__separator"/></div>');return this.drag.addItems(e),e},renderComponentGroup:function(e){var r,n=[],i=[],a=o(e=e.map((function(e){return"string"==typeof e?e:e.button})));try{for(a.s();!(r=a.n()).done;){var s=r.value,u=void 0;try{u=this.renderComponent(s)}catch(e){console.warn(e);continue}n.push(u);var c=(u.is("[data-cke-tooltip-text]")?u:u.find("[data-cke-tooltip-text]")).attr("data-cke-tooltip-text");i.push(c?c.replace(/ \(.*\)$/,""):"".concat(s[0].toUpperCase()).concat(s.slice(1)))}}catch(e){a.e(e)}finally{a.f()}if(!n.length)return!1;var l=t()('<div class="ckeditor-tb--item"/>').append(n);return l.attr("data-cke-tooltip-text",i.join(", ")),l.data("componentNames",e),this.drag.addItems(l),l},renderComponent:function(e){var r=this.components[e];if(!r)throw"Missing component: ".concat(e);r.isRendered||r.render();var n=t()(r.element.outerHTML);return n.data("componentName",e),n},getClosestItem:function(){var e=this;if(!Garnish.hitTest(this.drag.mouseX,this.drag.mouseY,this.$targetContainer))return!1;if(!this.$items.length)return null;var r=this.$items.toArray();this.showingInsertion&&r.push(this.$insertion[0]);var o=r.map((function(r){var n=t().data(r,"midpoint");return Garnish.getDist(n.left,n.top,e.drag.mouseX,e.drag.mouseY)})),i=Math.min.apply(Math,n(o));return r[o.indexOf(i)]},checkForNewClosestItem:function(){var e=this.getClosestItem();!1!==e?e!==this.$insertion[0]&&(e?this.drag.mouseX<t().data(e,"midpoint").left?this.$insertion.insertBefore(e):this.$insertion.insertAfter(e):this.$insertion.appendTo(this.$targetContainer),this.showingInsertion=!0,this.setMidpoints()):this.showingInsertion&&(this.$insertion.remove(),this.showingInsertion=!1)},setMidpoints:function(){var e=this.$items.toArray();this.showingInsertion&&e.push(this.$insertion[0]);var r,n=o(e);try{for(n.s();!(r=n.n()).done;){var i=r.value,a=t()(i),s=a.offset(),u=s.left+a.outerWidth()/2,c=s.top+a.outerHeight()/2;a.data("midpoint",{left:u,top:c})}}catch(e){n.e(e)}finally{n.f()}}}),c=__webpack_require__(150);window.CKEditor5.craftcms.ToolbarBuilder=u,window.CKEditor5.craftcms.ConfigOptions=c.Z}()})();
//# sourceMappingURL=ckeconfig.js.map