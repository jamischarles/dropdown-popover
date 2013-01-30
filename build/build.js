

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("rvagg-traversty/./traversty.js", Function("exports, require, module",
"/***************************************************************\n  * Traversty: A DOM collection management and traversal utility\n  * (c) Rod Vagg (@rvagg) 2012\n  * https://github.com/rvagg/traversty\n  * License: MIT\n  */\n\n(function (name, context, definition) {\n  if (typeof module != 'undefined' && module.exports) module.exports = definition()\n  else if (typeof define == 'function' && define.amd) define(definition)\n  else context[name] = definition()\n})('traversty', this, function () {\n\n  var context = this\n    , old = context.traversty\n    , doc = window.document\n    , html = doc.documentElement\n    , toString = Object.prototype.toString\n    , Ap = Array.prototype\n    , slice = Ap.slice\n      // feature test to find native matchesSelector()\n    , matchesSelector = (function (el, pfx, name, i, ms) {\n        while (i < pfx.length)\n          if (el[ms = pfx[i++] + name])\n            return ms\n      }(html, [ 'msM', 'webkitM', 'mozM', 'oM', 'm' ], 'atchesSelector', 0))\n\n    , Kfalse = function () { return false }\n\n    , isNumber = function (o) {\n        return toString.call(o) === '[object Number]'\n      }\n\n    , isString = function (o) {\n        return toString.call(o) === '[object String]'\n      }\n\n    , isFunction = function (o) {\n        return toString.call(o) === '[object Function]'\n      }\n\n    , isUndefined = function (o) {\n        return o === void 0\n      }\n\n    , isElement = function (o) {\n        return o && o.nodeType === 1\n      }\n\n      // figure out which argument, if any, is our 'index'\n    , getIndex = function (selector, index) {\n        return isUndefined(selector) && !isNumber(index) ? 0 :\n          isNumber(selector) ? selector : isNumber(index) ? index : null\n      }\n\n      // figure out which argument, if any, is our 'selector'\n    , getSelector = function (selector) {\n        return isString(selector) ? selector : '*'\n      }\n\n    , nativeSelectorFind = function (selector, el) {\n        return slice.call(el.querySelectorAll(selector), 0)\n      }\n\n    , nativeSelectorMatches = function (selector, el) {\n        return selector === '*' || el[matchesSelector](selector)\n      }\n\n    , selectorFind = nativeSelectorFind\n\n    , selectorMatches = nativeSelectorMatches\n\n      // used in the case where our selector engine does out-of-order element returns for\n      // grouped selectors, e.g. '.class, tag', we need our elements in document-order\n      // so we do it ourselves if need be\n    , createUnorderedEngineSelectorFind = function(engineSelect, selectorMatches) {\n        return function (selector, el) {\n          if (/,/.test(selector)) {\n            var ret = [], i = -1, els = el.getElementsByTagName('*')\n            while (++i < els.length)\n              if (isElement(els[i]) && selectorMatches(selector, els[i]))\n                ret.push(els[i])\n            return ret\n          }\n          return engineSelect(selector, el)\n        }\n      }\n\n      // is 'element' underneath 'container' somewhere\n    , isAncestor = 'compareDocumentPosition' in html\n        ? function (element, container) {\n            return (container.compareDocumentPosition(element) & 16) == 16\n          }\n        : 'contains' in html\n          ? function (element, container) {\n              container = container.nodeType === 9 || container == window ? html : container\n              return container !== element && container.contains(element)\n            }\n          : function (element, container) { // old smelly browser\n              while (element = element.parentNode)\n                if (element === container)\n                  return 1\n              return 0\n            }\n\n      // return an array containing only unique elements\n    , unique = function (ar) {\n        var a = [], i = -1, j, has\n        while (++i < ar.length) {\n          j = -1\n          has = false\n          while (++j < a.length) {\n            if (a[j] === ar[i]) {\n              has = true\n              break\n            }\n          }\n          if (!has)\n            a.push(ar[i])\n        }\n        return a\n      }\n\n      // for each element of 'els' execute 'fn' to get an array of elements to collect\n    , collect = function (els, fn) {\n        var ret = [], res, i = 0, j, l = els.length, l2\n        while (i < l) {\n          j = 0\n          l2 = (res = fn(els[i], i++)).length\n          while (j < l2)\n            ret.push(res[j++])\n        }\n        return ret\n      }\n\n     // generic DOM navigator to move multiple elements around the DOM\n   , move = function (els, method, selector, index, filterFn) {\n        index = getIndex(selector, index)\n        selector = getSelector(selector)\n        return collect(els\n          , function (el, elind) {\n              var i = index || 0, ret = []\n              if (!filterFn)\n                el = el[method]\n              while (el && (index === null || i >= 0)) {\n                // ignore non-elements, only consider selector-matching elements\n                // handle both the index and no-index (selector-only) cases\n                if (isElement(el)\n                    && (!filterFn || filterFn === true || filterFn(el, elind))\n                    && selectorMatches(selector, el)\n                    && (index === null || i-- === 0)) {\n                  // this concat vs push is to make sure we add elements to the result array\n                  // in reverse order when doing a previous(selector) and up(selector)\n                  index === null && method !== 'nextSibling' ? ret = [el].concat(ret) : ret.push(el)\n                }\n                el = el[method]\n              }\n              return ret\n            }\n        )\n      }\n\n      // given an index & length, return a 'fixed' index, fixes non-numbers & neative indexes\n    , eqIndex = function (length, index, def) {\n        if (index < 0)\n          index = length + index\n        if (index < 0 || index >= length)\n          return null\n        return !index && index !== 0 ? def : index\n      }\n\n      // collect elements of an array that match a filter function\n    , filter = function (els, fn) {\n        var arr = [], i = 0, l = els.length\n        for (; i < l; i++)\n          if (fn(els[i], i))\n            arr.push(els[i])\n        return arr\n      }\n\n      // create a filter function, for use by filter(), is() & not()\n      // allows the argument to be an element, a function or a selector\n    , filterFn = function (slfn) {\n        var to\n        return isElement(slfn)\n          ? function (el) { return el === slfn }\n          : (to = typeof slfn) == 'function'\n            ? function (el, i) { return slfn.call(el, i) }\n            : to == 'string' && slfn.length\n              ? function (el) { return selectorMatches(slfn, el) }\n              : Kfalse\n      }\n\n      // fn = !fn\n    , inv = function (fn) {\n        return function () {\n          return !fn.apply(this, arguments)\n        }\n      }\n\n    , traversty = (function () {\n        function T(els) {\n          this.length = 0\n          if (els) {\n            els = unique(!els.nodeType && !isUndefined(els.length) ? els : [ els ])\n            var i = this.length = els.length\n            while (i--)\n              this[i] = els[i]\n          }\n        }\n\n        T.prototype = {\n            down: function (selector, index) {\n              index = getIndex(selector, index)\n              selector = getSelector(selector)\n              return traversty(collect(this\n                , function (el) {\n                    var f = selectorFind(selector, el)\n                    return index === null ? f : ([ f[index] ] || [])\n                  }\n                ))\n            }\n\n          , up: function (selector, index) {\n              return traversty(move(this, 'parentNode', selector, index))\n            }\n\n          , parents: function () {\n              return T.prototype.up.apply(this, arguments.length ? arguments : [ '*' ])\n            }\n\n          , closest: function (selector, index) {\n              if (isNumber(selector)) {\n                index = selector\n                selector = '*'\n              } else if (!isString(selector)) {\n                return traversty([])\n              } else if (!isNumber(index)) {\n                index = 0\n              }\n              return traversty(move(this, 'parentNode', selector, index, true))\n            }\n\n          , previous: function (selector, index) {\n              return traversty(move(this, 'previousSibling', selector, index))\n            }\n\n          , next: function (selector, index) {\n              return traversty(move(this, 'nextSibling', selector, index))\n            }\n\n          , siblings: function (selector, index) {\n              var self = this\n                , arr = slice.call(this, 0)\n                , i = 0, l = arr.length\n\n              for (; i < l; i++) {\n                arr[i] = arr[i].parentNode.firstChild\n                while (!isElement(arr[i]))\n                  arr[i] = arr[i].nextSibling\n              }\n\n              if (isUndefined(selector))\n                selector = '*'\n\n              return traversty(move(arr, 'nextSibling', selector || '*', index\n                    , function (el, i) { return el !== self[i] } // filter\n                  ))\n            }\n\n          , children: function (selector, index) {\n              return traversty(move(T.prototype.down.call(this), 'nextSibling', selector || '*', index, true))\n            }\n\n          , first: function () {\n              return T.prototype.eq.call(this, 0)\n            }\n\n          , last: function () {\n              return T.prototype.eq.call(this, -1)\n            }\n\n          , eq: function (index) {\n              return traversty(this.get(index))\n            }\n\n          , get: function (index) {\n              return this[eqIndex(this.length, index, 0)]\n            }\n\n            // a crazy man wrote this, don't try to understand it, see the tests\n          , slice: function (start, end) {\n              var e = end, l = this.length, arr = []\n              start = eqIndex(l, Math.max(-this.length, start), 0)\n              e = eqIndex(end < 0 ? l : l + 1, end, l)\n              end = e === null || e > l ? end < 0 ? 0 : l : e\n              while (start !== null && start < end)\n                arr.push(this[start++])\n              return traversty(arr)\n            }\n\n          , filter: function (slfn) {\n              return traversty(filter(this, filterFn(slfn)))\n            }\n\n          , not: function (slfn) {\n              return traversty(filter(this, inv(filterFn(slfn))))\n            }\n\n            // similar to filter() but cares about descendent elements\n          , has: function (slel) {\n              return traversty(filter(\n                  this\n                , isElement(slel)\n                    ? function (el) { return isAncestor(slel, el) }\n                    : typeof slel == 'string' && slel.length\n                      ? function (el) { return selectorFind(slel, el).length } //TODO: performance\n                      : Kfalse\n              ))\n            }\n\n            // same as filter() but return a boolean so quick-return after first successful find\n          , is: function (slfn) {\n              var i = 0, l = this.length\n                , fn = filterFn(slfn)\n              for (; i < l; i++)\n                if (fn(this[i], i))\n                  return true\n              return false\n            }\n\n          , toArray: function () { return Ap.slice.call(this) }\n\n          , size: function () { return this.length }\n\n          , each: function (fn, ctx) {\n              var i = 0, l = this.length\n              for (; i < l; i++)\n                fn.call(ctx || this[i], this[i], i, this)\n              return this\n            }\n\n            // quack like a duck (Array)\n          , push: Ap.push\n          , sort: Ap.sort\n          , splice: Ap.splice\n        }\n\n        T.prototype.prev = T.prototype.previous\n\n        function t(els) {\n          return new T(isString(els) ? selectorFind(els, doc) : els)\n        }\n\n        // extend traversty functionality with custom methods\n        t.aug = function (methods) {\n          var key, method\n          for (key in methods) {\n            method = methods[key]\n            if (typeof method == 'function')\n              T.prototype[key] = method\n          }\n        }\n\n\n        t.setSelectorEngine = function (s) {\n          // feature testing the selector engine like a boss\n          var ss, r, a, _selectorMatches, _selectorFind\n            , e = doc.createElement('p')\n            , select = s.select || s.sel || s\n\n          e.innerHTML = '<a/><i/><b/>'\n          a = e.firstChild\n          try {\n            // YO! I HEARD YOU LIKED NESTED TERNARY OPERATORS SO I COOKED SOME UP FOR YOU!\n            // (one day I might loop this...)\n\n            // check to see how we do a matchesSelector\n            _selectorMatches = isFunction(s.matching)\n              ? function (selector, el) { return s.matching([el], selector).length > 0 }\n              : isFunction(s.is)\n                ? function (selector, el) { return s.is(el, selector) }\n                : isFunction(s.matchesSelector)\n                  ? function (selector, el) { return s.matchesSelector(el, selector) }\n                  : isFunction(s.match)\n                    ? function (selector, el) { return s.match(el, selector) }\n                    : isFunction(s.matches)\n                      ? function (selector, el) { return s.matches(el, selector) }\n                      : null\n\n            if (!_selectorMatches) {\n              // perhaps it's an selector(x).is(y) type selector?\n              ss = s('a', e)\n              _selectorMatches = isFunction(ss._is)\n                ? function (selector, el) { return s(el)._is(selector) } // original .is(), replaced by Ender bridge\n                : isFunction(ss.matching)\n                  ? function (selector, el) { return s(el).matching(selector).length > 0 }\n                  : isFunction(ss.is) && !ss.is.__ignore\n                    ? function (selector, el) { return s(el).is(selector) }\n                      : isFunction(ss.matchesSelector)\n                        ? function (selector, el) { return s(el).matchesSelector(selector) }\n                        : isFunction(ss.match)\n                          ? function (selector, el) { return s(el).match(selector) }\n                          : isFunction(ss.matches)\n                            ? function (selector, el) { return s(el).matches(selector) }\n                            : null\n            }\n\n            if (!_selectorMatches)\n                throw new Error('Traversty: couldn\\'t find selector engine\\'s `matchesSelector`')\n\n            // verify that we have a working `matchesSelector`\n            if (_selectorMatches('x,y', e) || !_selectorMatches('a,p', e))\n                throw new Error('Traversty: couldn\\'t make selector engine\\'s `matchesSelector` work')\n\n            // basic select\n            if ((r = select('b,a', e)).length !== 2)\n              throw new Error('Traversty: don\\'t know how to use this selector engine')\n\n            // check to see if the selector engine has given us the results in document-order\n            // and if not, work around it\n            _selectorFind = r[0] === a ? select : createUnorderedEngineSelectorFind(select, _selectorMatches)\n\n            // have we done enough to get a working `selectorFind`?\n            if ((r = _selectorFind('b,a', e)).length !== 2 || r[0] !== a)\n              throw new Error('Traversty: couldn\\'t make selector engine work')\n\n            selectorMatches = _selectorMatches\n            selectorFind = _selectorFind\n          } catch (ex) {\n            throw isString(ex)\n              ? ex\n              : new Error('Traversty: error while figuring out how the selector engine works: ' + (ex.message || ex))\n          } finally {\n            e = null\n          }\n\n          return t\n        }\n\n        t.noConflict = function () {\n          context.traversty = old\n          return this\n        }\n\n        return t\n      }())\n \n  return traversty\n});//@ sourceURL=rvagg-traversty/./traversty.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-stack/index.js", Function("exports, require, module",
"\n/**\n * Expose `stack()`.\n */\n\nmodule.exports = stack;\n\n/**\n * Return the stack.\n *\n * @return {Array}\n * @api public\n */\n\nfunction stack() {\n  var orig = Error.prepareStackTrace;\n  Error.prepareStackTrace = function(_, stack){ return stack; };\n  var err = new Error;\n  Error.captureStackTrace(err, arguments.callee);\n  var stack = err.stack;\n  Error.prepareStackTrace = orig;\n  return stack;\n}//@ sourceURL=component-stack/index.js"
));
require.register("component-assert/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar stack = require('stack');\n\n/**\n * Load contents of `script`.\n *\n * @param {String} script\n * @return {String}\n * @api private\n */\n\nfunction getScript(script) {\n  var xhr = new XMLHttpRequest;\n  xhr.open('GET', script, false);\n  xhr.send(null);\n  return xhr.responseText;\n}\n\n/**\n * Assert `expr` with optional failure `msg`.\n *\n * @param {Mixed} expr\n * @param {String} [msg]\n * @api public\n */\n\nmodule.exports = function(expr, msg){\n  if (expr) return;\n  if (!msg) {\n    if (Error.captureStackTrace) {\n      var callsite = stack()[1];\n      var fn = callsite.fun.toString();\n      var file = callsite.getFileName();\n      var line = callsite.getLineNumber() - 1;\n      var col = callsite.getColumnNumber() - 1;\n      var src = getScript(file);\n      line = src.split('\\n')[line].slice(col);\n      expr = line.match(/assert\\((.*)\\)/)[1].trim();\n      msg = expr;\n    } else {\n      msg = 'assertion failed';\n    }\n  }\n\n  throw new Error(msg);\n};//@ sourceURL=component-assert/index.js"
));
require.register("dropdown-popover/index.js", Function("exports, require, module",
"\n//TODO: To make this global you have to bring out two things:\n/*\n  - genericise dom names\n  - genericise via config obj\n\n*/\n\n\n//UI requirements:\n/*\n  - trigger click opens/closes dd menu\n  - esc closes menu\n  - clicking outside of menu closes menu\n  - clicking inside dd doesn't close it\n*/\n \n/*\n * Module dependencies\n * \n */ \nvar events = require(\"event\");\nvar trav = require('traversty');\n\n//CONSTANTS\nvar DD_TRIGGER_QUERY = \".utility-trigger\";\nvar DD_TARGET_QUERY = \".utility-menu\";\n\nmodule.exports = function(cfg){\n  DD_TRIGGER_QUERY = cfg.dd_trigger || DD_TRIGGER_QUERY;\n  DD_TARGET_QUERY = cfg.dd_target || DD_TRIGGER_QUERY;\n\n\n  // var zest = require(\"header-footer/deps/zest\");\n \n  //only one menu will be visible at a time. Node.\n  var _visible_menu; \n \n  //Q: ask Nic about these... Are these clean enough?\n  //on every utility trigger, hit the sibling 'utility-menu' \n \n  var dd_triggers = trav(DD_TRIGGER_QUERY);\n  var dd_menus = trav(DD_TARGET_QUERY); //needed to stop evt bubbling\n \n  // Q: what about just using evt delegation? Can we d`o that easily natively?\n \n  //add Click Listeners\n  dd_triggers.each(function(el){\n    events.bind(el, 'click', toggleMenu);\n  })\n \n  //add listener to ignore click on the dropdown menus\n  dd_menus.each(function(el){\n    events.bind(el, 'click', function(e){\n      e.stopPropagation();\n    });\n  })\n \n  //add universal hide on the body\n  events.bind(document.body, 'click', function(e){\n    hideMenu(_visible_menu);\n  });\n \n  //add escape keystroke to close menu\n  events.bind(document, 'keyup', function(e){\n    if (e.keyCode == 27) {\n      hideMenu(_visible_menu);\n    }\n \n  });\n \n   \n \n  function toggleMenu(e){\n    e.stopPropagation();\n    var trigger = e.target;\n     \n    trav(trigger).siblings(\".utility-menu\").each(function(el){\n      //if visible, hide, else show\n      if (el.className.match(\"visible\")){\n        hideMenu(el);\n      }else {\n        showMenu(el);\n      }\n       \n    });\n  }\n \n  function showMenu(el){\n    hideMenu(_visible_menu);\n    el.className += \" visible\"; //TODO: consider adding a component for class toggling\n    _visible_menu = el;\n  }\n \n  function hideMenu(el){\n    if (!el) { return};\n    el.className = el.className.replace(\"visible\", \"\"); //remove className\n  }\n}\n\n\n\n \n \n \n\n \n\n \n//@ sourceURL=dropdown-popover/index.js"
));
require.alias("rvagg-traversty/./traversty.js", "dropdown-popover/deps/traversty/./traversty.js");
require.alias("rvagg-traversty/./traversty.js", "dropdown-popover/deps/traversty/index.js");

require.alias("component-event/index.js", "dropdown-popover/deps/event/index.js");

require.alias("component-assert/index.js", "dropdown-popover/deps/assert/index.js");
require.alias("component-stack/index.js", "component-assert/deps/stack/index.js");

