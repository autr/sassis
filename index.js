
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35732/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var urlPattern = createCommonjsModule(function (module, exports) {
    // Generated by CoffeeScript 1.10.0
    var slice = [].slice;

    (function(root, factory) {
      if ( exports !== null) {
        return module.exports = factory();
      } else {
        return root.UrlPattern = factory();
      }
    })(commonjsGlobal, function() {
      var P, UrlPattern, astNodeContainsSegmentsForProvidedParams, astNodeToNames, astNodeToRegexString, baseAstNodeToRegexString, concatMap, defaultOptions, escapeForRegex, getParam, keysAndValuesToObject, newParser, regexGroupCount, stringConcatMap, stringify;
      escapeForRegex = function(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      };
      concatMap = function(array, f) {
        var i, length, results;
        results = [];
        i = -1;
        length = array.length;
        while (++i < length) {
          results = results.concat(f(array[i]));
        }
        return results;
      };
      stringConcatMap = function(array, f) {
        var i, length, result;
        result = '';
        i = -1;
        length = array.length;
        while (++i < length) {
          result += f(array[i]);
        }
        return result;
      };
      regexGroupCount = function(regex) {
        return (new RegExp(regex.toString() + '|')).exec('').length - 1;
      };
      keysAndValuesToObject = function(keys, values) {
        var i, key, length, object, value;
        object = {};
        i = -1;
        length = keys.length;
        while (++i < length) {
          key = keys[i];
          value = values[i];
          if (value == null) {
            continue;
          }
          if (object[key] != null) {
            if (!Array.isArray(object[key])) {
              object[key] = [object[key]];
            }
            object[key].push(value);
          } else {
            object[key] = value;
          }
        }
        return object;
      };
      P = {};
      P.Result = function(value, rest) {
        this.value = value;
        this.rest = rest;
      };
      P.Tagged = function(tag, value) {
        this.tag = tag;
        this.value = value;
      };
      P.tag = function(tag, parser) {
        return function(input) {
          var result, tagged;
          result = parser(input);
          if (result == null) {
            return;
          }
          tagged = new P.Tagged(tag, result.value);
          return new P.Result(tagged, result.rest);
        };
      };
      P.regex = function(regex) {
        return function(input) {
          var matches, result;
          matches = regex.exec(input);
          if (matches == null) {
            return;
          }
          result = matches[0];
          return new P.Result(result, input.slice(result.length));
        };
      };
      P.sequence = function() {
        var parsers;
        parsers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return function(input) {
          var i, length, parser, rest, result, values;
          i = -1;
          length = parsers.length;
          values = [];
          rest = input;
          while (++i < length) {
            parser = parsers[i];
            result = parser(rest);
            if (result == null) {
              return;
            }
            values.push(result.value);
            rest = result.rest;
          }
          return new P.Result(values, rest);
        };
      };
      P.pick = function() {
        var indexes, parsers;
        indexes = arguments[0], parsers = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return function(input) {
          var array, result;
          result = P.sequence.apply(P, parsers)(input);
          if (result == null) {
            return;
          }
          array = result.value;
          result.value = array[indexes];
          return result;
        };
      };
      P.string = function(string) {
        var length;
        length = string.length;
        return function(input) {
          if (input.slice(0, length) === string) {
            return new P.Result(string, input.slice(length));
          }
        };
      };
      P.lazy = function(fn) {
        var cached;
        cached = null;
        return function(input) {
          if (cached == null) {
            cached = fn();
          }
          return cached(input);
        };
      };
      P.baseMany = function(parser, end, stringResult, atLeastOneResultRequired, input) {
        var endResult, parserResult, rest, results;
        rest = input;
        results = stringResult ? '' : [];
        while (true) {
          if (end != null) {
            endResult = end(rest);
            if (endResult != null) {
              break;
            }
          }
          parserResult = parser(rest);
          if (parserResult == null) {
            break;
          }
          if (stringResult) {
            results += parserResult.value;
          } else {
            results.push(parserResult.value);
          }
          rest = parserResult.rest;
        }
        if (atLeastOneResultRequired && results.length === 0) {
          return;
        }
        return new P.Result(results, rest);
      };
      P.many1 = function(parser) {
        return function(input) {
          return P.baseMany(parser, null, false, true, input);
        };
      };
      P.concatMany1Till = function(parser, end) {
        return function(input) {
          return P.baseMany(parser, end, true, true, input);
        };
      };
      P.firstChoice = function() {
        var parsers;
        parsers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return function(input) {
          var i, length, parser, result;
          i = -1;
          length = parsers.length;
          while (++i < length) {
            parser = parsers[i];
            result = parser(input);
            if (result != null) {
              return result;
            }
          }
        };
      };
      newParser = function(options) {
        var U;
        U = {};
        U.wildcard = P.tag('wildcard', P.string(options.wildcardChar));
        U.optional = P.tag('optional', P.pick(1, P.string(options.optionalSegmentStartChar), P.lazy(function() {
          return U.pattern;
        }), P.string(options.optionalSegmentEndChar)));
        U.name = P.regex(new RegExp("^[" + options.segmentNameCharset + "]+"));
        U.named = P.tag('named', P.pick(1, P.string(options.segmentNameStartChar), P.lazy(function() {
          return U.name;
        })));
        U.escapedChar = P.pick(1, P.string(options.escapeChar), P.regex(/^./));
        U["static"] = P.tag('static', P.concatMany1Till(P.firstChoice(P.lazy(function() {
          return U.escapedChar;
        }), P.regex(/^./)), P.firstChoice(P.string(options.segmentNameStartChar), P.string(options.optionalSegmentStartChar), P.string(options.optionalSegmentEndChar), U.wildcard)));
        U.token = P.lazy(function() {
          return P.firstChoice(U.wildcard, U.optional, U.named, U["static"]);
        });
        U.pattern = P.many1(P.lazy(function() {
          return U.token;
        }));
        return U;
      };
      defaultOptions = {
        escapeChar: '\\',
        segmentNameStartChar: ':',
        segmentValueCharset: 'a-zA-Z0-9-_~ %',
        segmentNameCharset: 'a-zA-Z0-9',
        optionalSegmentStartChar: '(',
        optionalSegmentEndChar: ')',
        wildcardChar: '*'
      };
      baseAstNodeToRegexString = function(astNode, segmentValueCharset) {
        if (Array.isArray(astNode)) {
          return stringConcatMap(astNode, function(node) {
            return baseAstNodeToRegexString(node, segmentValueCharset);
          });
        }
        switch (astNode.tag) {
          case 'wildcard':
            return '(.*?)';
          case 'named':
            return "([" + segmentValueCharset + "]+)";
          case 'static':
            return escapeForRegex(astNode.value);
          case 'optional':
            return '(?:' + baseAstNodeToRegexString(astNode.value, segmentValueCharset) + ')?';
        }
      };
      astNodeToRegexString = function(astNode, segmentValueCharset) {
        if (segmentValueCharset == null) {
          segmentValueCharset = defaultOptions.segmentValueCharset;
        }
        return '^' + baseAstNodeToRegexString(astNode, segmentValueCharset) + '$';
      };
      astNodeToNames = function(astNode) {
        if (Array.isArray(astNode)) {
          return concatMap(astNode, astNodeToNames);
        }
        switch (astNode.tag) {
          case 'wildcard':
            return ['_'];
          case 'named':
            return [astNode.value];
          case 'static':
            return [];
          case 'optional':
            return astNodeToNames(astNode.value);
        }
      };
      getParam = function(params, key, nextIndexes, sideEffects) {
        var index, maxIndex, result, value;
        if (sideEffects == null) {
          sideEffects = false;
        }
        value = params[key];
        if (value == null) {
          if (sideEffects) {
            throw new Error("no values provided for key `" + key + "`");
          } else {
            return;
          }
        }
        index = nextIndexes[key] || 0;
        maxIndex = Array.isArray(value) ? value.length - 1 : 0;
        if (index > maxIndex) {
          if (sideEffects) {
            throw new Error("too few values provided for key `" + key + "`");
          } else {
            return;
          }
        }
        result = Array.isArray(value) ? value[index] : value;
        if (sideEffects) {
          nextIndexes[key] = index + 1;
        }
        return result;
      };
      astNodeContainsSegmentsForProvidedParams = function(astNode, params, nextIndexes) {
        var i, length;
        if (Array.isArray(astNode)) {
          i = -1;
          length = astNode.length;
          while (++i < length) {
            if (astNodeContainsSegmentsForProvidedParams(astNode[i], params, nextIndexes)) {
              return true;
            }
          }
          return false;
        }
        switch (astNode.tag) {
          case 'wildcard':
            return getParam(params, '_', nextIndexes, false) != null;
          case 'named':
            return getParam(params, astNode.value, nextIndexes, false) != null;
          case 'static':
            return false;
          case 'optional':
            return astNodeContainsSegmentsForProvidedParams(astNode.value, params, nextIndexes);
        }
      };
      stringify = function(astNode, params, nextIndexes) {
        if (Array.isArray(astNode)) {
          return stringConcatMap(astNode, function(node) {
            return stringify(node, params, nextIndexes);
          });
        }
        switch (astNode.tag) {
          case 'wildcard':
            return getParam(params, '_', nextIndexes, true);
          case 'named':
            return getParam(params, astNode.value, nextIndexes, true);
          case 'static':
            return astNode.value;
          case 'optional':
            if (astNodeContainsSegmentsForProvidedParams(astNode.value, params, nextIndexes)) {
              return stringify(astNode.value, params, nextIndexes);
            } else {
              return '';
            }
        }
      };
      UrlPattern = function(arg1, arg2) {
        var groupCount, options, parsed, parser, withoutWhitespace;
        if (arg1 instanceof UrlPattern) {
          this.isRegex = arg1.isRegex;
          this.regex = arg1.regex;
          this.ast = arg1.ast;
          this.names = arg1.names;
          return;
        }
        this.isRegex = arg1 instanceof RegExp;
        if (!(('string' === typeof arg1) || this.isRegex)) {
          throw new TypeError('argument must be a regex or a string');
        }
        if (this.isRegex) {
          this.regex = arg1;
          if (arg2 != null) {
            if (!Array.isArray(arg2)) {
              throw new Error('if first argument is a regex the second argument may be an array of group names but you provided something else');
            }
            groupCount = regexGroupCount(this.regex);
            if (arg2.length !== groupCount) {
              throw new Error("regex contains " + groupCount + " groups but array of group names contains " + arg2.length);
            }
            this.names = arg2;
          }
          return;
        }
        if (arg1 === '') {
          throw new Error('argument must not be the empty string');
        }
        withoutWhitespace = arg1.replace(/\s+/g, '');
        if (withoutWhitespace !== arg1) {
          throw new Error('argument must not contain whitespace');
        }
        options = {
          escapeChar: (arg2 != null ? arg2.escapeChar : void 0) || defaultOptions.escapeChar,
          segmentNameStartChar: (arg2 != null ? arg2.segmentNameStartChar : void 0) || defaultOptions.segmentNameStartChar,
          segmentNameCharset: (arg2 != null ? arg2.segmentNameCharset : void 0) || defaultOptions.segmentNameCharset,
          segmentValueCharset: (arg2 != null ? arg2.segmentValueCharset : void 0) || defaultOptions.segmentValueCharset,
          optionalSegmentStartChar: (arg2 != null ? arg2.optionalSegmentStartChar : void 0) || defaultOptions.optionalSegmentStartChar,
          optionalSegmentEndChar: (arg2 != null ? arg2.optionalSegmentEndChar : void 0) || defaultOptions.optionalSegmentEndChar,
          wildcardChar: (arg2 != null ? arg2.wildcardChar : void 0) || defaultOptions.wildcardChar
        };
        parser = newParser(options);
        parsed = parser.pattern(arg1);
        if (parsed == null) {
          throw new Error("couldn't parse pattern");
        }
        if (parsed.rest !== '') {
          throw new Error("could only partially parse pattern");
        }
        this.ast = parsed.value;
        this.regex = new RegExp(astNodeToRegexString(this.ast, options.segmentValueCharset));
        this.names = astNodeToNames(this.ast);
      };
      UrlPattern.prototype.match = function(url) {
        var groups, match;
        match = this.regex.exec(url);
        if (match == null) {
          return null;
        }
        groups = match.slice(1);
        if (this.names) {
          return keysAndValuesToObject(this.names, groups);
        } else {
          return groups;
        }
      };
      UrlPattern.prototype.stringify = function(params) {
        if (params == null) {
          params = {};
        }
        if (this.isRegex) {
          throw new Error("can't stringify patterns generated from a regex");
        }
        if (params !== Object(params)) {
          throw new Error("argument must be an object or undefined");
        }
        return stringify(this.ast, params, {});
      };
      UrlPattern.escapeForRegex = escapeForRegex;
      UrlPattern.concatMap = concatMap;
      UrlPattern.stringConcatMap = stringConcatMap;
      UrlPattern.regexGroupCount = regexGroupCount;
      UrlPattern.keysAndValuesToObject = keysAndValuesToObject;
      UrlPattern.P = P;
      UrlPattern.newParser = newParser;
      UrlPattern.defaultOptions = defaultOptions;
      UrlPattern.astNodeToRegexString = astNodeToRegexString;
      UrlPattern.astNodeToNames = astNodeToNames;
      UrlPattern.getParam = getParam;
      UrlPattern.astNodeContainsSegmentsForProvidedParams = astNodeContainsSegmentsForProvidedParams;
      UrlPattern.stringify = stringify;
      return UrlPattern;
    });
    });

    function defineProp (obj, prop, value) {
      Object.defineProperty(obj, prop, { value });
    }

    // Parse schema into routes
    function parse (schema = {}, notRoot, pathname, href = '#') {
      // Convert schema to options object. Schema can be:
      // + function: Svelte component
      // + string: redirect path
      // + object: options
      if (notRoot) {
        let type = typeof schema;
        schema = type === 'function' ? { $$component: schema }
          : type === 'string' ? { $$redirect: schema }
          : (type !== 'object' || schema === null) ? {} : schema;

        let c = schema.$$component;
        if (typeof c !== 'function' && c !== undefined && c !== null)
          throw new Error('Invalid Svelte component')
      }

      // Any properties not starting with $$ will be treated as routes,
      // the rest will be kept as route data. Custom data is also kept,
      // but will be replaced with internal data if duplicating names.
      let route = {};
      for (let i in schema) {
        if (/^\$\$/.test(i))
          defineProp(route, i, schema[i]);
        else
          route[i] = parse(schema[i], true, i, href + i);
      }

      // Define internal data
      if (notRoot) {
        defineProp(route, '$$href', href); // full path including #
        defineProp(route, '$$pathname', pathname); // scoped path
        defineProp(route, '$$pattern', new urlPattern(href));
        defineProp(route, '$$stringify', v => route.$$pattern.stringify(v));
      }

      return Object.freeze(route)
    }

    // Routes store must be set before creating any Svelte components.
    // It can only be set once. A parsed version is created after with
    // helpful internal data
    let schema = writable();
    let routes = derived(schema, $ => parse($));
    routes.set = v => {
      schema.set(v);
      delete routes.set;
    };

    let regex = /(#?[^?]*)?(\?.*)?/;

    function parse$1 () {
      let match = regex.exec(window.location.hash);
      let pathname = match[1] || '#/';
      let querystring = match[2];
      return { pathname, querystring }
    }

    let path = readable(parse$1(), set => {
      let update = () => set(parse$1());
      window.addEventListener('hashchange', update);
      return () => window.removeEventListener('hashchange', update)
    });

    let pathname = derived(path, $ => $.pathname); // current pathname without query
    let querystring = derived(path, $ => $.querystring);
    let query = derived(querystring, $ => {
      return Array.from(new URLSearchParams($))
        .reduce((a, [i, e]) => { a[i] = e; return a }, {})
    });

    // Search for matching route
    function parse$2 (active, pathname, notRoot, matches = []) {
      if (notRoot) {
        let params = active.$$pattern.match(pathname);
        if (params) {
          return !active.$$redirect
            ? { active, params, matches }
            // redirect
            : tick().then(() => {
              history.replaceState(null, null, '#' + active.$$redirect);
              window.dispatchEvent(new Event('hashchange'));
            })
        }
      }

      for (let e of Object.values(active)) {
        let result = parse$2(e, pathname, true, [...matches, e]);
        if (result) return result
      }
    }

    let match = derived([routes, pathname], ([$r, $p]) => parse$2($r, $p) || {});
    let active = derived(match, $ => $.active || {}); // current active route
    let params = derived(match, $ => $.params || {});
    let matches = derived(match, $ => $.matches || []); // parents of active route and itself
    let components = derived(matches, $ => $.map(e => e.$$component).filter(e => e));// components to use in <Router/>

    /* node_modules/svelte-hash-router/src/components/Router.svelte generated by Svelte v3.31.2 */

    function create_fragment(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*$$props*/ ctx[2]];
    	var switch_value = /*$components*/ ctx[0][/*i*/ ctx[1]];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*$$props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*$$props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*$components*/ ctx[0][/*i*/ ctx[1]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let level = 0;

    function instance($$self, $$props, $$invalidate) {
    	let $components;
    	validate_store(components, "components");
    	component_subscribe($$self, components, $$value => $$invalidate(0, $components = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let i = level++;
    	onDestroy(() => level--);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		level,
    		onDestroy,
    		components,
    		i,
    		$components
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("i" in $$props) $$invalidate(1, i = $$new_props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$components, i, $$props];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const root = writable( `<style>

:root {

	--field-padding: 1em 0.6em;
	--button-padding: 1em 3em;
	--icon-padding: 3em;

	--font: monospace;
	--font-monospace: monospace;
	--font-serif: serif;
	--font-sans-serif: sans-serif;
	--font-cursive: cursive;
	--font-slab: sans-serif;
	--font-grotesque: sans-serif;

	--font-size: 13px;
	--line-height: 1.61803398875em; /* golden ratio */

	--bg: hsl( 200, 10%, 10% );
	--bg-pop: hsl( 200, 10%, 15% );
	--bg-sink: hsl( 200, 10%, 5% );

	--color: hsl( 200, 10%, 80% );
	--color-bright: hsl( 200, 10%, 95% );
	--color-fade: hsl( 200, 10%, 50% );

	--color-success: hsl( 150, 95%, 70% );
	--color-info: hsl( 200, 95%, 70% );
	--color-error: hsl( 340, 95%, 70% );
	--color-alert: hsl( 50, 95%, 70% );

	--bg-a: hsl( 200, 10%, 10% );
	--bg-b: hsl( 200, 10%, 12% );
	--bg-c: hsl( 200, 10%, 8% );
	--bg-d: hsl( 200, 10%, 8% );
	--bg-e: hsl( 200, 10%, 8% );

	--color-a: hsl( 200, 10%, 80% );
	--color-b: hsl( 200, 10%, 80% );
	--color-c: hsl( 200, 10%, 80% );
	--color-d: hsl( 200, 10%, 80% );
	--color-e: hsl( 200, 10%, 80% );
}

</style>` );

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file = "src/App.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t1;
    	let html_tag;
    	let t2;
    	let router;
    	let current;
    	router = new Router({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "SASSIS";
    			t1 = space();
    			t2 = space();
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "flex column cmb1 p1");
    			add_location(div0, file, 10, 1, 197);
    			html_tag = new HtmlTag(t2);
    			attr_dev(div1, "class", "flex justify-content-center h100vh overflow-hidden");
    			add_location(div1, file, 9, 0, 131);
    			add_location(main, file, 7, 0, 123);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			html_tag.m(/*$root*/ ctx[0], div1);
    			append_dev(div1, t2);
    			mount_component(router, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$root*/ 1) html_tag.p(/*$root*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $root;
    	validate_store(root, "root");
    	component_subscribe($$self, root, $$value => $$invalidate(0, $root = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, root, $root });
    	return [$root];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var data = [
      {
        "type": "h2",
        "id": "basic"
      },
      {
        "type": "table",
        "id": "basic",
        "data": [
          [
            [
              "absolute",
              "abs"
            ],
            [
              "position: absolute"
            ]
          ],
          [
            [
              "relative",
              "rel"
            ],
            [
              "position: relative"
            ]
          ],
          [
            [
              "fixed"
            ],
            [
              "position: fixed"
            ]
          ],
          [
            [
              "sticky"
            ],
            [
              "position: sticky"
            ]
          ],
          [
            [
              "table"
            ],
            [
              "display: table"
            ]
          ],
          [
            [
              "inline-block"
            ],
            [
              "display: inline-block"
            ]
          ],
          [
            [
              "block"
            ],
            [
              "display: block"
            ]
          ],
          [
            [
              "flex"
            ],
            [
              "display: flex"
            ]
          ],
          [
            [
              "none"
            ],
            [
              "display: none"
            ]
          ],
          [
            [
              "column",
              "col",
              "flex-column"
            ],
            [
              "flex-direction: column"
            ]
          ],
          [
            [
              "row",
              "flex-row"
            ],
            [
              "flex-direction: row"
            ]
          ],
          [
            [
              "grow"
            ],
            [
              "flex-grow: 1"
            ]
          ],
          [
            [
              "no-grow"
            ],
            [
              "flex-grow: 0"
            ]
          ],
          [
            [
              "shrink"
            ],
            [
              "flex-shrink: 1"
            ]
          ],
          [
            [
              "no-shrink"
            ],
            [
              "flex-shrink: 0"
            ]
          ],
          [
            [
              "no-basis"
            ],
            [
              "flex-basis: 0"
            ]
          ],
          [
            [
              "wrap"
            ],
            [
              "flex-wrap: wrap"
            ]
          ],
          [
            [
              "no-wrap"
            ],
            [
              "flex-wrap: nowrap"
            ]
          ],
          [
            [
              "border-box"
            ],
            [
              "box-sizing: border-box"
            ]
          ],
          [
            [
              "wrap"
            ],
            [
              "flex-wrap: wrap"
            ]
          ],
          [
            [
              "no-wrap"
            ],
            [
              "flex-wrap: nowrap"
            ]
          ],
          [
            [
              "italic"
            ],
            [
              "font-style: italic"
            ]
          ],
          [
            [
              "bold",
              "strong"
            ],
            [
              "font-weight: bold"
            ]
          ],
          [
            [
              "bolder",
              "stronger"
            ],
            [
              "font-weight: bold"
            ]
          ],
          [
            [
              "normal"
            ],
            [
              "font-weight: normal"
            ]
          ],
          [
            [
              "light"
            ],
            [
              "font-weight: light"
            ]
          ],
          [
            [
              "lighter"
            ],
            [
              "font-weight: lighter"
            ]
          ],
          [
            [
              "text-left"
            ],
            [
              "text-align: left"
            ]
          ],
          [
            [
              "text-center"
            ],
            [
              "text-align: center"
            ]
          ],
          [
            [
              "text-right"
            ],
            [
              "text-align: right"
            ]
          ],
          [
            [
              "pointer"
            ],
            [
              "cursor: pointer"
            ]
          ],
          [
            [
              "visible"
            ],
            [
              "opacity: 1"
            ]
          ],
          [
            [
              "invisible",
              "hidden"
            ],
            [
              "opacity: 0"
            ]
          ],
          [
            [
              "no-bg"
            ],
            [
              "background: transparent"
            ]
          ],
          [
            [
              "overflow-hidden"
            ],
            [
              "overflow: hidden"
            ]
          ],
          [
            [
              "overflow-auto"
            ],
            [
              "overflow: auto"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "align items / self"
      },
      {
        "type": "table",
        "id": "align items / self",
        "data": [
          [
            [
              "align-self-center",
              "a-s-c"
            ],
            [
              "align-self: center"
            ]
          ],
          [
            [
              "align-self-end",
              "a-s-e"
            ],
            [
              "align-self: end"
            ]
          ],
          [
            [
              "align-self-flex-end",
              "a-s-fe"
            ],
            [
              "align-self: flex-end"
            ]
          ],
          [
            [
              "align-self-start",
              "a-s-s"
            ],
            [
              "align-self: start"
            ]
          ],
          [
            [
              "align-self-flex-start",
              "a-s-fs"
            ],
            [
              "align-self: flex-start"
            ]
          ],
          [
            [
              "align-self-stretch",
              "a-s-str"
            ],
            [
              "align-self: stretch"
            ]
          ],
          [
            [
              "align-items-center",
              "a-i-c"
            ],
            [
              "align-items: center"
            ]
          ],
          [
            [
              "align-items-end",
              "a-i-e"
            ],
            [
              "align-items: end"
            ]
          ],
          [
            [
              "align-items-flex-end",
              "a-i-fe"
            ],
            [
              "align-items: flex-end"
            ]
          ],
          [
            [
              "align-items-start",
              "a-i-s"
            ],
            [
              "align-items: start"
            ]
          ],
          [
            [
              "align-items-flex-start",
              "a-i-fs"
            ],
            [
              "align-items: flex-start"
            ]
          ],
          [
            [
              "align-items-stretch",
              "a-i-str"
            ],
            [
              "align-items: stretch"
            ]
          ],
          [
            [
              "justify-self-center",
              "j-s-c"
            ],
            [
              "justify-self: center"
            ]
          ],
          [
            [
              "justify-self-end",
              "j-s-e"
            ],
            [
              "justify-self: end"
            ]
          ],
          [
            [
              "justify-self-flex-end",
              "j-s-fe"
            ],
            [
              "justify-self: flex-end"
            ]
          ],
          [
            [
              "justify-self-start",
              "j-s-s"
            ],
            [
              "justify-self: start"
            ]
          ],
          [
            [
              "justify-self-flex-start",
              "j-s-fs"
            ],
            [
              "justify-self: flex-start"
            ]
          ],
          [
            [
              "justify-self-stretch",
              "j-s-str"
            ],
            [
              "justify-self: stretch"
            ]
          ],
          [
            [
              "justify-items-center",
              "j-i-c"
            ],
            [
              "justify-items: center"
            ]
          ],
          [
            [
              "justify-items-end",
              "j-i-e"
            ],
            [
              "justify-items: end"
            ]
          ],
          [
            [
              "justify-items-flex-end",
              "j-i-fe"
            ],
            [
              "justify-items: flex-end"
            ]
          ],
          [
            [
              "justify-items-start",
              "j-i-s"
            ],
            [
              "justify-items: start"
            ]
          ],
          [
            [
              "justify-items-flex-start",
              "j-i-fs"
            ],
            [
              "justify-items: flex-start"
            ]
          ],
          [
            [
              "justify-items-stretch",
              "j-i-str"
            ],
            [
              "justify-items: stretch"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "align content"
      },
      {
        "type": "table",
        "id": "align content",
        "data": [
          [
            [
              "align-content-space-between",
              "align-content-between",
              "a-c-b"
            ],
            [
              "align-content: space-between"
            ]
          ],
          [
            [
              "align-content-space-evenly",
              "align-content-evenly",
              "a-c-e"
            ],
            [
              "align-content: space-evenly"
            ]
          ],
          [
            [
              "align-content-space-around",
              "align-content-around",
              "a-c-a"
            ],
            [
              "align-content: space-around"
            ]
          ],
          [
            [
              "align-content-left",
              "a-c-l"
            ],
            [
              "align-content: left"
            ]
          ],
          [
            [
              "align-content-right",
              "a-c-r"
            ],
            [
              "align-content: right"
            ]
          ],
          [
            [
              "align-content-center",
              "a-c-c"
            ],
            [
              "align-content: center"
            ]
          ],
          [
            [
              "align-content-end",
              "a-c-e"
            ],
            [
              "align-content: end"
            ]
          ],
          [
            [
              "align-content-flex-end",
              "a-c-fe"
            ],
            [
              "align-content: flex-end"
            ]
          ],
          [
            [
              "align-content-start",
              "a-c-s"
            ],
            [
              "align-content: start"
            ]
          ],
          [
            [
              "align-content-flex-start",
              "a-c-fs"
            ],
            [
              "align-content: flex-start"
            ]
          ],
          [
            [
              "align-content-stretch",
              "a-c-str"
            ],
            [
              "align-content: stretch"
            ]
          ],
          [
            [
              "justify-content-space-between",
              "justify-content-between",
              "j-c-b"
            ],
            [
              "justify-content: space-between"
            ]
          ],
          [
            [
              "justify-content-space-evenly",
              "justify-content-evenly",
              "j-c-e"
            ],
            [
              "justify-content: space-evenly"
            ]
          ],
          [
            [
              "justify-content-space-around",
              "justify-content-around",
              "j-c-a"
            ],
            [
              "justify-content: space-around"
            ]
          ],
          [
            [
              "justify-content-left",
              "j-c-l"
            ],
            [
              "justify-content: left"
            ]
          ],
          [
            [
              "justify-content-right",
              "j-c-r"
            ],
            [
              "justify-content: right"
            ]
          ],
          [
            [
              "justify-content-center",
              "j-c-c"
            ],
            [
              "justify-content: center"
            ]
          ],
          [
            [
              "justify-content-end",
              "j-c-e"
            ],
            [
              "justify-content: end"
            ]
          ],
          [
            [
              "justify-content-flex-end",
              "j-c-fe"
            ],
            [
              "justify-content: flex-end"
            ]
          ],
          [
            [
              "justify-content-start",
              "j-c-s"
            ],
            [
              "justify-content: start"
            ]
          ],
          [
            [
              "justify-content-flex-start",
              "j-c-fs"
            ],
            [
              "justify-content: flex-start"
            ]
          ],
          [
            [
              "justify-content-stretch",
              "j-c-str"
            ],
            [
              "justify-content: stretch"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "padding"
      },
      {
        "type": "table",
        "id": "padding",
        "data": [
          [
            [
              "pt<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding-top: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "pr<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding-right: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "pl<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding-left: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "pb<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding-bottom: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "plr<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding-left: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> ",
              "padding-right: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "ptb<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding-top: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> ",
              "padding-bottom: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "p<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "padding: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> "
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "margin"
      },
      {
        "type": "table",
        "id": "margin",
        "data": [
          [
            [
              "mt<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin-top: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "mr<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin-right: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "ml<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin-left: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "mb<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin-bottom: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "mlr<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin-left: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> ",
              "margin-right: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "mtb<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin-top: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> ",
              "margin-bottom: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "m<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "margin: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> "
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "border"
      },
      {
        "type": "table",
        "id": "border",
        "data": [
          [
            [
              "bt<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border-top-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-top-style: <span>[solid|dashed|dotted]</span>"
            ]
          ],
          [
            [
              "br<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border-right-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-right-style: <span>[solid|dashed|dotted]</span>"
            ]
          ],
          [
            [
              "bl<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border-left-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-left-style: <span>[solid|dashed|dotted]</span>"
            ]
          ],
          [
            [
              "bb<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border-bottom-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-bottom-style: <span>[solid|dashed|dotted]</span>"
            ]
          ],
          [
            [
              "blr<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border-left-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-right-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-right-style: <span>[solid|dashed|dotted]</span> ",
              "border-left-style: <span>[solid|dashed|dotted]</span>"
            ]
          ],
          [
            [
              "btb<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border-top-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-bottom-width: <span>[0-100(0)]</span><span class=\"second\">px</span> ",
              "border-top-style: <span>[solid|dashed|dotted]</span> ",
              "border-bottom-style: <span>[solid|dashed|dotted]</span>"
            ]
          ],
          [
            [
              "b<span>[0-100(0)]</span>-<span class=\"second\">[solid|dashed|dotted]</span>"
            ],
            [
              "border: <span>[0-100(0)]</span><span class=\"second\">px</span> <span>[solid|dashed|dotted]</span>"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "positions"
      },
      {
        "type": "table",
        "id": "",
        "data": [
          [
            [
              "t<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "top: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "r<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "right: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "l<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "left: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "b<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "bottom: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "lr<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "left: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> ",
              "right: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ],
          [
            [
              "tb<span>[0-100(0)]</span><span class=\"second\">[~|px|pc]</span>"
            ],
            [
              "top: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span> ",
              "bottom: <span>[0-100(0)]</span><span class=\"second\">[em|px|pc]</span>"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "width"
      },
      {
        "type": "table",
        "id": "width",
        "data": [
          [
            [
              "w<span>[0-100]</span>em"
            ],
            [
              "width: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "w<span>[0-1000]</span>px"
            ],
            [
              "width: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "w<span>[0-100]</span>pc"
            ],
            [
              "width: <span>[0-100]</span>%"
            ]
          ],
          [
            [
              "w<span>[0-100]</span>vw"
            ],
            [
              "width: <span>[0-100]</span>vw"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "height"
      },
      {
        "type": "table",
        "id": "height",
        "data": [
          [
            [
              "h<span>[0-100]</span>em"
            ],
            [
              "height: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "h<span>[0-1000]</span>px"
            ],
            [
              "height: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "h<span>[0-100]</span>pc"
            ],
            [
              "height: <span>[0-100]</span>%"
            ]
          ],
          [
            [
              "h<span>[0-100]</span>vh"
            ],
            [
              "height: <span>[0-100]</span>vh"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "min-width"
      },
      {
        "type": "table",
        "id": "min-width",
        "data": [
          [
            [
              "minw<span>[0-100]</span>em"
            ],
            [
              "min-width: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "minw<span>[0-1000]</span>px"
            ],
            [
              "min-width: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "minw<span>[0-100]</span>pc"
            ],
            [
              "min-width: <span>[0-100]</span>%"
            ]
          ],
          [
            [
              "minw<span>[0-100]</span>vw"
            ],
            [
              "min-width: <span>[0-100]</span>vw"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "min-height"
      },
      {
        "type": "table",
        "id": "min-height",
        "data": [
          [
            [
              "minh<span>[0-100]</span>em"
            ],
            [
              "min-height: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "minh<span>[0-1000]</span>px"
            ],
            [
              "min-height: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "minh<span>[0-100]</span>pc"
            ],
            [
              "min-height: <span>[0-100]</span>%"
            ]
          ],
          [
            [
              "minh<span>[0-100]</span>vh"
            ],
            [
              "min-height: <span>[0-100]</span>vh"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "max-width"
      },
      {
        "type": "table",
        "id": "max-width",
        "data": [
          [
            [
              "maxw<span>[0-100]</span>em"
            ],
            [
              "max-width: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "maxw<span>[0-1000]</span>px"
            ],
            [
              "max-width: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "maxw<span>[0-100]</span>pc"
            ],
            [
              "max-width: <span>[0-100]</span>%"
            ]
          ],
          [
            [
              "maxw<span>[0-100]</span>vw"
            ],
            [
              "max-width: <span>[0-100]</span>vw"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "max-height"
      },
      {
        "type": "table",
        "id": "max-height",
        "data": [
          [
            [
              "maxh<span>[0-100]</span>em"
            ],
            [
              "max-height: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "maxh<span>[0-1000]</span>px"
            ],
            [
              "max-height: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "maxh<span>[0-100]</span>pc"
            ],
            [
              "max-height: <span>[0-100]</span>%"
            ]
          ],
          [
            [
              "maxh<span>[0-100]</span>vh"
            ],
            [
              "max-height: <span>[0-100]</span>vh"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "flex-basis"
      },
      {
        "type": "table",
        "id": "flex-basis",
        "data": [
          [
            [
              "basis<span>[0-100]</span>em"
            ],
            [
              "flex-basis: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "basis<span>[0-1000]</span>px"
            ],
            [
              "flex-basis: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "basis<span>[0-100]</span>pc"
            ],
            [
              "flex-basis: <span>[0-100]</span>%"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "border-radius"
      },
      {
        "type": "table",
        "id": "border-radius",
        "data": [
          [
            [
              "radius<span>[0-100]</span>em"
            ],
            [
              "border-radius: <span>[0-100]</span>em"
            ]
          ],
          [
            [
              "radius<span>[0-1000]</span>px"
            ],
            [
              "border-radius: <span>[0-1000]</span>px"
            ]
          ],
          [
            [
              "radius<span>[0-100]</span>pc"
            ],
            [
              "border-radius: <span>[0-100]</span>%"
            ]
          ]
        ]
      }
    ];

    /* src/views/Shorthand.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/views/Shorthand.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (17:2) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*sect*/ ctx[1].data;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, title*/ 1) {
    				each_value_1 = /*sect*/ ctx[1].data;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(17:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#if !sect.data  }
    function create_if_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*sect*/ ctx[1].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = space();
    			attr_dev(td0, "class", "p0-8");
    			add_location(td0, file$1, 12, 4, 207);
    			add_location(td1, file$1, 13, 4, 243);
    			attr_dev(tr, "id", /*sect*/ ctx[1].id);
    			attr_dev(tr, "class", "filled bright");
    			add_location(tr, file$1, 11, 3, 162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(tr, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:2) {#if !sect.data  }",
    		ctx
    	});

    	return block;
    }

    // (29:7) {#each line[1] as rule}
    function create_each_block_2(ctx) {
    	let div;
    	let raw_value = /*rule*/ ctx[7] + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "rule plain");
    			add_location(div, file$1, 29, 8, 548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(29:7) {#each line[1] as rule}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#each sect.data as line}
    function create_each_block_1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let span;
    	let raw_value = /*title*/ ctx[0](/*line*/ ctx[4][0]) + "";
    	let a_title_value;
    	let t0;
    	let td1;
    	let t1;
    	let each_value_2 = /*line*/ ctx[4][1];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			span = element("span");
    			t0 = space();
    			td1 = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			add_location(span, file$1, 22, 8, 406);
    			attr_dev(a, "class", "class plain");
    			attr_dev(a, "title", a_title_value = /*title*/ ctx[0](/*line*/ ctx[4][0]));
    			add_location(a, file$1, 21, 7, 351);
    			add_location(td0, file$1, 20, 6, 339);
    			add_location(td1, file$1, 27, 6, 504);
    			attr_dev(tr, "class", "fade cptb1");
    			add_location(tr, file$1, 19, 5, 309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, span);
    			span.innerHTML = raw_value;
    			append_dev(tr, t0);
    			append_dev(tr, td1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td1, null);
    			}

    			append_dev(tr, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1 && raw_value !== (raw_value = /*title*/ ctx[0](/*line*/ ctx[4][0]) + "")) span.innerHTML = raw_value;
    			if (dirty & /*title*/ 1 && a_title_value !== (a_title_value = /*title*/ ctx[0](/*line*/ ctx[4][0]))) {
    				attr_dev(a, "title", a_title_value);
    			}

    			if (dirty & /*data*/ 0) {
    				each_value_2 = /*line*/ ctx[4][1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(19:4) {#each sect.data as line}",
    		ctx
    	});

    	return block;
    }

    // (8:1) {#each data as sect}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (!/*sect*/ ctx[1].data) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:1) {#each data as sect}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let table;
    	let each_value = data;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "grow");
    			add_location(table, file$1, 5, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data, title*/ 1) {
    				each_value = data;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let title;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shorthand", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Shorthand> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data, title });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(0, title = l => "." + l.join(", ."));
    	return [title];
    }

    class Shorthand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shorthand",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/views/Layouts.svelte generated by Svelte v3.31.2 */

    const file$2 = "src/views/Layouts.svelte";

    function create_fragment$3(ctx) {
    	let div5;
    	let div0;
    	let t1;
    	let div4;
    	let t2;
    	let div3;
    	let div1;
    	let t3;
    	let div2;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = "col-6 b1-solid color-a h8em";
    			t1 = space();
    			div4 = element("div");
    			t2 = text("col-6 b1-solid color-a\n    \t");
    			div3 = element("div");
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "col-6 b1-solid color-d h8em");
    			add_location(div0, file$2, 1, 4, 25);
    			attr_dev(div1, "class", "col-6 b1-dashed h2em");
    			add_location(div1, file$2, 7, 6, 212);
    			attr_dev(div2, "class", "col-6 b1-dashed h4em");
    			add_location(div2, file$2, 8, 6, 259);
    			attr_dev(div3, "class", "twelve");
    			add_location(div3, file$2, 6, 5, 185);
    			attr_dev(div4, "class", "col-6 b1-solid color-c");
    			add_location(div4, file$2, 4, 4, 115);
    			attr_dev(div5, "class", "twelve");
    			add_location(div5, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layouts", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layouts> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Layouts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layouts",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/views/FormFields.svelte generated by Svelte v3.31.2 */

    function create_fragment$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("FORMFIELDS");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FormFields", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FormFields> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class FormFields extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormFields",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/views/Texts.svelte generated by Svelte v3.31.2 */

    function create_fragment$5(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Texts", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Texts> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Texts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Texts",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/views/Colours.svelte generated by Svelte v3.31.2 */

    function create_fragment$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("COLOURS");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Colours", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Colours> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Colours extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Colours",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/views/Introduction.svelte generated by Svelte v3.31.2 */
    const file$3 = "src/views/Introduction.svelte";

    function create_fragment$7(ctx) {
    	let div0;
    	let textarea;
    	let t0;
    	let div5;
    	let input0;
    	let t1;
    	let label;
    	let input1;
    	let t2;
    	let t3;
    	let div1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t7;
    	let button0;
    	let t9;
    	let button1;
    	let t11;
    	let button2;
    	let t13;
    	let button3;
    	let t15;
    	let button4;
    	let t17;
    	let button5;
    	let t19;
    	let div4;
    	let div2;
    	let t21;
    	let div3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			textarea = element("textarea");
    			t0 = space();
    			div5 = element("div");
    			input0 = element("input");
    			t1 = space();
    			label = element("label");
    			input1 = element("input");
    			t2 = text("\n\t\t\tcheckbox");
    			t3 = space();
    			div1 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "option a ";
    			option1 = element("option");
    			option1.textContent = "option b ";
    			option2 = element("option");
    			option2.textContent = "option c";
    			t7 = space();
    			button0 = element("button");
    			button0.textContent = "button";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "success";
    			t11 = space();
    			button2 = element("button");
    			button2.textContent = "info";
    			t13 = space();
    			button3 = element("button");
    			button3.textContent = "error";
    			t15 = space();
    			button4 = element("button");
    			button4.textContent = "alert";
    			t17 = space();
    			button5 = element("button");
    			button5.textContent = "filled";
    			t19 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div2.textContent = "pop";
    			t21 = space();
    			div3 = element("div");
    			div3.textContent = "sink";
    			attr_dev(textarea, "class", "b0-solid p0 minw40em");
    			attr_dev(textarea, "style", /*height*/ ctx[1]);
    			add_location(textarea, file$3, 9, 2, 192);
    			attr_dev(div0, "class", "basis0 h100vh overflow-auto p1");
    			add_location(div0, file$3, 8, 1, 145);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter some text");
    			add_location(input0, file$3, 15, 2, 375);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$3, 17, 3, 457);
    			attr_dev(label, "class", "checkbox");
    			add_location(label, file$3, 16, 2, 429);
    			option0.__value = "option a ";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 22, 4, 545);
    			option1.__value = "option b ";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 23, 4, 576);
    			option2.__value = "option c ";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 24, 4, 607);
    			add_location(select, file$3, 21, 3, 532);
    			attr_dev(div1, "class", "select");
    			add_location(div1, file$3, 20, 2, 508);
    			add_location(button0, file$3, 27, 2, 658);
    			attr_dev(button1, "class", "success");
    			add_location(button1, file$3, 28, 2, 684);
    			attr_dev(button2, "class", "info");
    			add_location(button2, file$3, 29, 2, 727);
    			attr_dev(button3, "class", "error");
    			add_location(button3, file$3, 30, 2, 764);
    			attr_dev(button4, "class", "alert");
    			add_location(button4, file$3, 31, 2, 803);
    			attr_dev(button5, "class", "filled");
    			add_location(button5, file$3, 32, 2, 842);
    			attr_dev(div2, "class", "p2 pop grow");
    			add_location(div2, file$3, 34, 3, 905);
    			attr_dev(div3, "class", "p2 sink grow");
    			add_location(div3, file$3, 35, 3, 943);
    			attr_dev(div4, "class", "flex");
    			add_location(div4, file$3, 33, 2, 883);
    			attr_dev(div5, "class", "flex column p1 cmr1 monospace grow cmb1 maxw40em overflow-auto h100vh");
    			add_location(div5, file$3, 14, 1, 289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*$root*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, input0);
    			append_dev(div5, t1);
    			append_dev(div5, label);
    			append_dev(label, input1);
    			append_dev(label, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div1);
    			append_dev(div1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(div5, t7);
    			append_dev(div5, button0);
    			append_dev(div5, t9);
    			append_dev(div5, button1);
    			append_dev(div5, t11);
    			append_dev(div5, button2);
    			append_dev(div5, t13);
    			append_dev(div5, button3);
    			append_dev(div5, t15);
    			append_dev(div5, button4);
    			append_dev(div5, t17);
    			append_dev(div5, button5);
    			append_dev(div5, t19);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div4, t21);
    			append_dev(div4, div3);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*height*/ 2) {
    				attr_dev(textarea, "style", /*height*/ ctx[1]);
    			}

    			if (dirty & /*$root*/ 1) {
    				set_input_value(textarea, /*$root*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let height;
    	let $root;
    	validate_store(root, "root");
    	component_subscribe($$self, root, $$value => $$invalidate(0, $root = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Introduction", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Introduction> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		$root = this.value;
    		root.set($root);
    	}

    	$$self.$capture_state = () => ({ root, height, $root });

    	$$self.$inject_state = $$props => {
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$root*/ 1) {
    			 $$invalidate(1, height = `min-height: calc( ${$root.split("\n").length} * var(--line-height) )`);
    		}
    	};

    	return [$root, height, textarea_input_handler];
    }

    class Introduction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Introduction",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });


    routes.set({
    	'/': Introduction,
    	'/Shorthand': Shorthand,
    	'/Layouts': Layouts,
    	'/FormFields': FormFields,
    	'/Texts': Texts,
    	'/Colours': Colours
    });

    return app;

}());
//# sourceMappingURL=index.js.map
