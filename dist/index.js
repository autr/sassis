
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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

    var infos = {
      "downloads": {
        "shorthand": {
          "full": {
            "path": "dist/shorthand.css",
            "basename": "shorthand.css",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117776,
            "size": 736745,
            "blocks": 1440,
            "atimeMs": 1663891709955.6306,
            "mtimeMs": 1663891752761.4553,
            "ctimeMs": 1663891752761.4553,
            "birthtimeMs": 1644862202614.4878,
            "atime": "2022-09-23T00:08:29.956Z",
            "mtime": "2022-09-23T00:09:12.761Z",
            "ctime": "2022-09-23T00:09:12.761Z",
            "birthtime": "2022-02-14T18:10:02.614Z"
          },
          "min": {
            "path": "dist/shorthand.min.css",
            "basename": "shorthand.min.css",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117777,
            "size": 553858,
            "blocks": 1088,
            "atimeMs": 1663891752785.532,
            "mtimeMs": 1663891752762.1091,
            "ctimeMs": 1663891752762.1091,
            "birthtimeMs": 1644862202615.064,
            "atime": "2022-09-23T00:09:12.786Z",
            "mtime": "2022-09-23T00:09:12.762Z",
            "ctime": "2022-09-23T00:09:12.762Z",
            "birthtime": "2022-02-14T18:10:02.615Z"
          },
          "gz": {
            "path": "dist/shorthand.min.css.gz",
            "basename": "shorthand.min.css.gz",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117778,
            "size": 94329,
            "blocks": 256,
            "atimeMs": 1663891520770.9392,
            "mtimeMs": 1663891752784.7898,
            "ctimeMs": 1663891752784.7898,
            "birthtimeMs": 1644862202615.4795,
            "atime": "2022-09-23T00:05:20.771Z",
            "mtime": "2022-09-23T00:09:12.785Z",
            "ctime": "2022-09-23T00:09:12.785Z",
            "birthtime": "2022-02-14T18:10:02.615Z"
          }
        },
        "layout": {
          "full": {
            "path": "dist/layout.css",
            "basename": "layout.css",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117772,
            "size": 11595,
            "blocks": 24,
            "atimeMs": 1663891711056.2559,
            "mtimeMs": 1663891752893.114,
            "ctimeMs": 1663891752893.114,
            "birthtimeMs": 1644862202614.2297,
            "atime": "2022-09-23T00:08:31.056Z",
            "mtime": "2022-09-23T00:09:12.893Z",
            "ctime": "2022-09-23T00:09:12.893Z",
            "birthtime": "2022-02-14T18:10:02.614Z"
          },
          "min": {
            "path": "dist/layout.min.css",
            "basename": "layout.min.css",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117773,
            "size": 8696,
            "blocks": 24,
            "atimeMs": 1663891752894.8228,
            "mtimeMs": 1663891752893.2898,
            "ctimeMs": 1663891752893.2898,
            "birthtimeMs": 1644862202614.3035,
            "atime": "2022-09-23T00:09:12.895Z",
            "mtime": "2022-09-23T00:09:12.893Z",
            "ctime": "2022-09-23T00:09:12.893Z",
            "birthtime": "2022-02-14T18:10:02.614Z"
          },
          "gz": {
            "path": "dist/layout.min.css.gz",
            "basename": "layout.min.css.gz",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117774,
            "size": 1148,
            "blocks": 8,
            "atimeMs": 1663891708905.155,
            "mtimeMs": 1663891752894.703,
            "ctimeMs": 1663891752894.703,
            "birthtimeMs": 1644862202614.3738,
            "atime": "2022-09-23T00:08:28.905Z",
            "mtime": "2022-09-23T00:09:12.895Z",
            "ctime": "2022-09-23T00:09:12.895Z",
            "birthtime": "2022-02-14T18:10:02.614Z"
          }
        },
        "all": {
          "full": {
            "path": "dist/all.css",
            "basename": "all.css",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117759,
            "size": 1074495,
            "blocks": 2104,
            "atimeMs": 1663891711055.9697,
            "mtimeMs": 1663891753548.1868,
            "ctimeMs": 1663891753548.1868,
            "birthtimeMs": 1644862202606.3157,
            "atime": "2022-09-23T00:08:31.056Z",
            "mtime": "2022-09-23T00:09:13.548Z",
            "ctime": "2022-09-23T00:09:13.548Z",
            "birthtime": "2022-02-14T18:10:02.606Z"
          },
          "min": {
            "path": "dist/all.min.css",
            "basename": "all.min.css",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117760,
            "size": 870714,
            "blocks": 1704,
            "atimeMs": 1663891753576.3984,
            "mtimeMs": 1663891753549.1663,
            "ctimeMs": 1663891753549.1663,
            "birthtimeMs": 1644862202609.2708,
            "atime": "2022-09-23T00:09:13.576Z",
            "mtime": "2022-09-23T00:09:13.549Z",
            "ctime": "2022-09-23T00:09:13.549Z",
            "birthtime": "2022-02-14T18:10:02.609Z"
          },
          "gz": {
            "path": "dist/all.min.css.gz",
            "basename": "all.min.css.gz",
            "dev": 16777230,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 3117761,
            "size": 120627,
            "blocks": 256,
            "atimeMs": 1663891709608.8418,
            "mtimeMs": 1663891753576.1902,
            "ctimeMs": 1663891753576.1902,
            "birthtimeMs": 1644862202611.5713,
            "atime": "2022-09-23T00:08:29.609Z",
            "mtime": "2022-09-23T00:09:13.576Z",
            "ctime": "2022-09-23T00:09:13.576Z",
            "birthtime": "2022-02-14T18:10:02.612Z"
          }
        }
      },
      "package": {
        "name": "sassis",
        "version": "1.3.0",
        "scripts": {
          "build": "rollup -c",
          "svelte": "PORT=3002 rollup -c -w",
          "dev": "PORT=3002 rollup -c -w & nodemon src/sassis.js",
          "start": "sirv dist"
        },
        "devDependencies": {
          "@rollup/plugin-alias": "^3.1.1",
          "@rollup/plugin-commonjs": "^16.0.0",
          "@rollup/plugin-node-resolve": "^10.0.0",
          "clean-css": "^4.2.3",
          "codejar": "^3.2.3",
          "gzipper": "^4.3.0",
          "hotkeys-js": "^3.9.4",
          "markdown": "^0.5.0",
          "node-sass": "^7.0.1",
          "nodemon": "^2.0.7",
          "postcss": "^7.0.35",
          "prismjs": "^1.28.0",
          "rollup": "^2.3.4",
          "rollup-plugin-css-only": "^3.0.0",
          "rollup-plugin-livereload": "^2.0.0",
          "rollup-plugin-svelte": "^7.0.0",
          "rollup-plugin-terser": "^7.0.0",
          "sirv-cli": "^1.0.0",
          "supervisor": "^0.12.0",
          "svelte": "^3.0.0",
          "svelte-code-editor": "^1.0.1",
          "svelte-hash-router": "^1.0.1",
          "svelte-preprocess": "^4.6.1",
          "svelte-preprocess-css-global": "^0.0.1"
        }
      }
    };

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
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
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
      if (exports !== null) {
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
    function parse$2 (schema = {}, notRoot, pathname, href = '#') {
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
          route[i] = parse$2(schema[i], true, i, href + i);
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
    let routes = derived(schema, $ => parse$2($));
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
    derived(querystring, $ => {
      return Array.from(new URLSearchParams($))
        .reduce((a, [i, e]) => { a[i] = e; return a }, {})
    });

    // Search for matching route
    function parse (active, pathname, notRoot, matches = []) {
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
        let result = parse(e, pathname, true, [...matches, e]);
        if (result) return result
      }
    }

    let match = derived([routes, pathname], ([$r, $p]) => parse($r, $p) || {});
    let active = derived(match, $ => $.active || {}); // current active route
    let params = derived(match, $ => $.params || {});
    let matches = derived(match, $ => $.matches || []); // parents of active route and itself
    let components = derived(matches, $ => $.map(e => e.$$component).filter(e => e));// components to use in <Router/>

    /* node_modules/.pnpm/svelte-hash-router@1.0.1_svelte@3.46.4/node_modules/svelte-hash-router/src/components/Router.svelte generated by Svelte v3.46.4 */

    function create_fragment$d(ctx) {
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let level = 0;

    function instance$d($$self, $$props, $$invalidate) {
    	let $components;
    	validate_store(components, 'components');
    	component_subscribe($$self, components, $$value => $$invalidate(0, $components = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
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
    		if ('i' in $$props) $$invalidate(1, i = $$new_props.i);
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
    		init$1(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const root = writable( `<style></style>` );

    /**! 
     * hotkeys-js v3.9.4 
     * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies. 
     * 
     * Copyright (c) 2022 kenny wong <wowohoo@qq.com> 
     * http://jaywcjlove.github.io/hotkeys 
     * Licensed under the MIT license 
     */

    var isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false; // 绑定事件

    function addEvent(object, event, method, useCapture) {
      if (object.addEventListener) {
        object.addEventListener(event, method, useCapture);
      } else if (object.attachEvent) {
        object.attachEvent("on".concat(event), function () {
          method(window.event);
        });
      }
    } // 修饰键转换成对应的键码


    function getMods(modifier, key) {
      var mods = key.slice(0, key.length - 1);

      for (var i = 0; i < mods.length; i++) {
        mods[i] = modifier[mods[i].toLowerCase()];
      }

      return mods;
    } // 处理传的key字符串转换成数组


    function getKeys(key) {
      if (typeof key !== 'string') key = '';
      key = key.replace(/\s/g, ''); // 匹配任何空白字符,包括空格、制表符、换页符等等

      var keys = key.split(','); // 同时设置多个快捷键，以','分割

      var index = keys.lastIndexOf(''); // 快捷键可能包含','，需特殊处理

      for (; index >= 0;) {
        keys[index - 1] += ',';
        keys.splice(index, 1);
        index = keys.lastIndexOf('');
      }

      return keys;
    } // 比较修饰键的数组


    function compareArray(a1, a2) {
      var arr1 = a1.length >= a2.length ? a1 : a2;
      var arr2 = a1.length >= a2.length ? a2 : a1;
      var isIndex = true;

      for (var i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
      }

      return isIndex;
    }

    var _keyMap = {
      backspace: 8,
      tab: 9,
      clear: 12,
      enter: 13,
      return: 13,
      esc: 27,
      escape: 27,
      space: 32,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      del: 46,
      delete: 46,
      ins: 45,
      insert: 45,
      home: 36,
      end: 35,
      pageup: 33,
      pagedown: 34,
      capslock: 20,
      num_0: 96,
      num_1: 97,
      num_2: 98,
      num_3: 99,
      num_4: 100,
      num_5: 101,
      num_6: 102,
      num_7: 103,
      num_8: 104,
      num_9: 105,
      num_multiply: 106,
      num_add: 107,
      num_enter: 108,
      num_subtract: 109,
      num_decimal: 110,
      num_divide: 111,
      '⇪': 20,
      ',': 188,
      '.': 190,
      '/': 191,
      '`': 192,
      '-': isff ? 173 : 189,
      '=': isff ? 61 : 187,
      ';': isff ? 59 : 186,
      '\'': 222,
      '[': 219,
      ']': 221,
      '\\': 220
    }; // Modifier Keys

    var _modifier = {
      // shiftKey
      '⇧': 16,
      shift: 16,
      // altKey
      '⌥': 18,
      alt: 18,
      option: 18,
      // ctrlKey
      '⌃': 17,
      ctrl: 17,
      control: 17,
      // metaKey
      '⌘': 91,
      cmd: 91,
      command: 91
    };
    var modifierMap = {
      16: 'shiftKey',
      18: 'altKey',
      17: 'ctrlKey',
      91: 'metaKey',
      shiftKey: 16,
      ctrlKey: 17,
      altKey: 18,
      metaKey: 91
    };
    var _mods = {
      16: false,
      18: false,
      17: false,
      91: false
    };
    var _handlers = {}; // F1~F12 special key

    for (var k = 1; k < 20; k++) {
      _keyMap["f".concat(k)] = 111 + k;
    }

    var _downKeys = []; // 记录摁下的绑定键

    var winListendFocus = false; // window是否已经监听了focus事件

    var _scope = 'all'; // 默认热键范围

    var elementHasBindEvent = []; // 已绑定事件的节点记录
    // 返回键码

    var code = function code(x) {
      return _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
    }; // 设置获取当前范围（默认为'所有'）


    function setScope(scope) {
      _scope = scope || 'all';
    } // 获取当前范围


    function getScope() {
      return _scope || 'all';
    } // 获取摁下绑定键的键值


    function getPressedKeyCodes() {
      return _downKeys.slice(0);
    } // 表单控件控件判断 返回 Boolean
    // hotkey is effective only when filter return true


    function filter(event) {
      var target = event.target || event.srcElement;
      var tagName = target.tagName;
      var flag = true; // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>

      if (target.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly) {
        flag = false;
      }

      return flag;
    } // 判断摁下的键是否为某个键，返回true或者false


    function isPressed(keyCode) {
      if (typeof keyCode === 'string') {
        keyCode = code(keyCode); // 转换成键码
      }

      return _downKeys.indexOf(keyCode) !== -1;
    } // 循环删除handlers中的所有 scope(范围)


    function deleteScope(scope, newScope) {
      var handlers;
      var i; // 没有指定scope，获取scope

      if (!scope) scope = getScope();

      for (var key in _handlers) {
        if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
          handlers = _handlers[key];

          for (i = 0; i < handlers.length;) {
            if (handlers[i].scope === scope) handlers.splice(i, 1);else i++;
          }
        }
      } // 如果scope被删除，将scope重置为all


      if (getScope() === scope) setScope(newScope || 'all');
    } // 清除修饰键


    function clearModifier(event) {
      var key = event.keyCode || event.which || event.charCode;

      var i = _downKeys.indexOf(key); // 从列表中清除按压过的键


      if (i >= 0) {
        _downKeys.splice(i, 1);
      } // 特殊处理 cmmand 键，在 cmmand 组合快捷键 keyup 只执行一次的问题


      if (event.key && event.key.toLowerCase() === 'meta') {
        _downKeys.splice(0, _downKeys.length);
      } // 修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除


      if (key === 93 || key === 224) key = 91;

      if (key in _mods) {
        _mods[key] = false; // 将修饰键重置为false

        for (var k in _modifier) {
          if (_modifier[k] === key) hotkeys[k] = false;
        }
      }
    }

    function unbind(keysInfo) {
      // unbind(), unbind all keys
      if (typeof keysInfo === 'undefined') {
        Object.keys(_handlers).forEach(function (key) {
          return delete _handlers[key];
        });
      } else if (Array.isArray(keysInfo)) {
        // support like : unbind([{key: 'ctrl+a', scope: 's1'}, {key: 'ctrl-a', scope: 's2', splitKey: '-'}])
        keysInfo.forEach(function (info) {
          if (info.key) eachUnbind(info);
        });
      } else if (typeof keysInfo === 'object') {
        // support like unbind({key: 'ctrl+a, ctrl+b', scope:'abc'})
        if (keysInfo.key) eachUnbind(keysInfo);
      } else if (typeof keysInfo === 'string') {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        // support old method
        // eslint-disable-line
        var scope = args[0],
            method = args[1];

        if (typeof scope === 'function') {
          method = scope;
          scope = '';
        }

        eachUnbind({
          key: keysInfo,
          scope: scope,
          method: method,
          splitKey: '+'
        });
      }
    } // 解除绑定某个范围的快捷键


    var eachUnbind = function eachUnbind(_ref) {
      var key = _ref.key,
          scope = _ref.scope,
          method = _ref.method,
          _ref$splitKey = _ref.splitKey,
          splitKey = _ref$splitKey === void 0 ? '+' : _ref$splitKey;
      var multipleKeys = getKeys(key);
      multipleKeys.forEach(function (originKey) {
        var unbindKeys = originKey.split(splitKey);
        var len = unbindKeys.length;
        var lastKey = unbindKeys[len - 1];
        var keyCode = lastKey === '*' ? '*' : code(lastKey);
        if (!_handlers[keyCode]) return; // 判断是否传入范围，没有就获取范围

        if (!scope) scope = getScope();
        var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
        _handlers[keyCode] = _handlers[keyCode].filter(function (record) {
          // 通过函数判断，是否解除绑定，函数相等直接返回
          var isMatchingMethod = method ? record.method === method : true;
          return !(isMatchingMethod && record.scope === scope && compareArray(record.mods, mods));
        });
      });
    }; // 对监听对应快捷键的回调函数进行处理


    function eventHandler(event, handler, scope, element) {
      if (handler.element !== element) {
        return;
      }

      var modifiersMatch; // 看它是否在当前范围

      if (handler.scope === scope || handler.scope === 'all') {
        // 检查是否匹配修饰符（如果有返回true）
        modifiersMatch = handler.mods.length > 0;

        for (var y in _mods) {
          if (Object.prototype.hasOwnProperty.call(_mods, y)) {
            if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
              modifiersMatch = false;
            }
          }
        } // 调用处理程序，如果是修饰键不做处理


        if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === '*') {
          if (handler.method(event, handler) === false) {
            if (event.preventDefault) event.preventDefault();else event.returnValue = false;
            if (event.stopPropagation) event.stopPropagation();
            if (event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    } // 处理keydown事件


    function dispatch(event, element) {
      var asterisk = _handlers['*'];
      var key = event.keyCode || event.which || event.charCode; // 表单控件过滤 默认表单控件不触发快捷键

      if (!hotkeys.filter.call(this, event)) return; // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
      // Webkit左右 command 键值不一样

      if (key === 93 || key === 224) key = 91;
      /**
       * Collect bound keys
       * If an Input Method Editor is processing key input and the event is keydown, return 229.
       * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
       * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
       */

      if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);
      /**
       * Jest test cases are required.
       * ===============================
       */

      ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(function (keyName) {
        var keyNum = modifierMap[keyName];

        if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
          _downKeys.push(keyNum);
        } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
          _downKeys.splice(_downKeys.indexOf(keyNum), 1);
        } else if (keyName === 'metaKey' && event[keyName] && _downKeys.length === 3) {
          /**
           * Fix if Command is pressed:
           * ===============================
           */
          if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
            _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
          }
        }
      });
      /**
       * -------------------------------
       */

      if (key in _mods) {
        _mods[key] = true; // 将特殊字符的key注册到 hotkeys 上

        for (var k in _modifier) {
          if (_modifier[k] === key) hotkeys[k] = true;
        }

        if (!asterisk) return;
      } // 将 modifierMap 里面的修饰键绑定到 event 中


      for (var e in _mods) {
        if (Object.prototype.hasOwnProperty.call(_mods, e)) {
          _mods[e] = event[modifierMap[e]];
        }
      }
      /**
       * https://github.com/jaywcjlove/hotkeys/pull/129
       * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
       * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
       * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
       */


      if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState('AltGraph')) {
        if (_downKeys.indexOf(17) === -1) {
          _downKeys.push(17);
        }

        if (_downKeys.indexOf(18) === -1) {
          _downKeys.push(18);
        }

        _mods[17] = true;
        _mods[18] = true;
      } // 获取范围 默认为 `all`


      var scope = getScope(); // 对任何快捷键都需要做的处理

      if (asterisk) {
        for (var i = 0; i < asterisk.length; i++) {
          if (asterisk[i].scope === scope && (event.type === 'keydown' && asterisk[i].keydown || event.type === 'keyup' && asterisk[i].keyup)) {
            eventHandler(event, asterisk[i], scope, element);
          }
        }
      } // key 不在 _handlers 中返回


      if (!(key in _handlers)) return;

      for (var _i = 0; _i < _handlers[key].length; _i++) {
        if (event.type === 'keydown' && _handlers[key][_i].keydown || event.type === 'keyup' && _handlers[key][_i].keyup) {
          if (_handlers[key][_i].key) {
            var record = _handlers[key][_i];
            var splitKey = record.splitKey;
            var keyShortcut = record.key.split(splitKey);
            var _downKeysCurrent = []; // 记录当前按键键值

            for (var a = 0; a < keyShortcut.length; a++) {
              _downKeysCurrent.push(code(keyShortcut[a]));
            }

            if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
              // 找到处理内容
              eventHandler(event, record, scope, element);
            }
          }
        }
      }
    } // 判断 element 是否已经绑定事件


    function isElementBind(element) {
      return elementHasBindEvent.indexOf(element) > -1;
    }

    function hotkeys(key, option, method) {
      _downKeys = [];
      var keys = getKeys(key); // 需要处理的快捷键列表

      var mods = [];
      var scope = 'all'; // scope默认为all，所有范围都有效

      var element = document; // 快捷键事件绑定节点

      var i = 0;
      var keyup = false;
      var keydown = true;
      var splitKey = '+';
      var capture = false; // 对为设定范围的判断

      if (method === undefined && typeof option === 'function') {
        method = option;
      }

      if (Object.prototype.toString.call(option) === '[object Object]') {
        if (option.scope) scope = option.scope; // eslint-disable-line

        if (option.element) element = option.element; // eslint-disable-line

        if (option.keyup) keyup = option.keyup; // eslint-disable-line

        if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line

        if (option.capture !== undefined) capture = option.capture; // eslint-disable-line

        if (typeof option.splitKey === 'string') splitKey = option.splitKey; // eslint-disable-line
      }

      if (typeof option === 'string') scope = option; // 对于每个快捷键进行处理

      for (; i < keys.length; i++) {
        key = keys[i].split(splitKey); // 按键列表

        mods = []; // 如果是组合快捷键取得组合快捷键

        if (key.length > 1) mods = getMods(_modifier, key); // 将非修饰键转化为键码

        key = key[key.length - 1];
        key = key === '*' ? '*' : code(key); // *表示匹配所有快捷键
        // 判断key是否在_handlers中，不在就赋一个空数组

        if (!(key in _handlers)) _handlers[key] = [];

        _handlers[key].push({
          keyup: keyup,
          keydown: keydown,
          scope: scope,
          mods: mods,
          shortcut: keys[i],
          method: method,
          key: keys[i],
          splitKey: splitKey,
          element: element
        });
      } // 在全局document上设置快捷键


      if (typeof element !== 'undefined' && !isElementBind(element) && window) {
        elementHasBindEvent.push(element);
        addEvent(element, 'keydown', function (e) {
          dispatch(e, element);
        }, capture);

        if (!winListendFocus) {
          winListendFocus = true;
          addEvent(window, 'focus', function () {
            _downKeys = [];
          }, capture);
        }

        addEvent(element, 'keyup', function (e) {
          dispatch(e, element);
          clearModifier(e);
        }, capture);
      }
    }

    function trigger(shortcut) {
      var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';
      Object.keys(_handlers).forEach(function (key) {
        var data = _handlers[key].find(function (item) {
          return item.scope === scope && item.shortcut === shortcut;
        });

        if (data && data.method) {
          data.method();
        }
      });
    }

    var _api = {
      setScope: setScope,
      getScope: getScope,
      deleteScope: deleteScope,
      getPressedKeyCodes: getPressedKeyCodes,
      isPressed: isPressed,
      filter: filter,
      trigger: trigger,
      unbind: unbind,
      keyMap: _keyMap,
      modifier: _modifier,
      modifierMap: modifierMap
    };

    for (var a in _api) {
      if (Object.prototype.hasOwnProperty.call(_api, a)) {
        hotkeys[a] = _api[a];
      }
    }

    if (typeof window !== 'undefined') {
      var _hotkeys = window.hotkeys;

      hotkeys.noConflict = function (deep) {
        if (deep && window.hotkeys === hotkeys) {
          window.hotkeys = _hotkeys;
        }

        return hotkeys;
      };

      window.hotkeys = hotkeys;
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1$1 } = globals;
    const file$7 = "src/App.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i][0];
    	child_ctx[6] = list[i][1];
    	return child_ctx;
    }

    // (37:7) {#if v.$$href != '#/' && v.$$href.indexOf(':') == -1}
    function create_if_block$1(ctx) {
    	let div;
    	let t0_value = /*k*/ ctx[5].substring(1) + "";
    	let t0;
    	let t1;
    	let t2_value = (/*k*/ ctx[5] == '/search' ? '(cmd/ctrl+f)' : '') + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*v*/ ctx[6], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div, "class", "p0-4 bright pointer");
    			toggle_class(div, "alert", /*k*/ ctx[5] == '/intro');
    			toggle_class(div, "mt1", /*k*/ ctx[5] == '/search');
    			toggle_class(div, "info", /*k*/ ctx[5] == '/search' || /*k*/ ctx[5] == '/download');
    			toggle_class(div, "error", /*k*/ ctx[5] == '/variables');
    			toggle_class(div, "filled", /*$active*/ ctx[3].$$href.indexOf(/*v*/ ctx[6].$$href) != -1);
    			toggle_class(div, "bright", /*$active*/ ctx[3].$$href.indexOf(/*v*/ ctx[6].$$href) != -1);
    			add_location(div, file$7, 37, 8, 1235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$routes*/ 4 && t0_value !== (t0_value = /*k*/ ctx[5].substring(1) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$routes*/ 4 && t2_value !== (t2_value = (/*k*/ ctx[5] == '/search' ? '(cmd/ctrl+f)' : '') + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "alert", /*k*/ ctx[5] == '/intro');
    			}

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "mt1", /*k*/ ctx[5] == '/search');
    			}

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "info", /*k*/ ctx[5] == '/search' || /*k*/ ctx[5] == '/download');
    			}

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "error", /*k*/ ctx[5] == '/variables');
    			}

    			if (dirty & /*$active, Object, $routes*/ 12) {
    				toggle_class(div, "filled", /*$active*/ ctx[3].$$href.indexOf(/*v*/ ctx[6].$$href) != -1);
    			}

    			if (dirty & /*$active, Object, $routes*/ 12) {
    				toggle_class(div, "bright", /*$active*/ ctx[3].$$href.indexOf(/*v*/ ctx[6].$$href) != -1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(37:7) {#if v.$$href != '#/' && v.$$href.indexOf(':') == -1}",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#each Object.entries($routes) as [k,v]}
    function create_each_block$2(ctx) {
    	let show_if = /*v*/ ctx[6].$$href != '#/' && /*v*/ ctx[6].$$href.indexOf(':') == -1;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$routes*/ 4) show_if = /*v*/ ctx[6].$$href != '#/' && /*v*/ ctx[6].$$href.indexOf(':') == -1;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(36:6) {#each Object.entries($routes) as [k,v]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let html_tag;
    	let t0;
    	let div8;
    	let div7;
    	let div4;
    	let div3;
    	let div0;
    	let a0;
    	let t2;
    	let t3;
    	let div2;
    	let div1;
    	let t4;
    	let t5_value = infos.package.version + "";
    	let t5;
    	let t6;
    	let span;
    	let t7;
    	let t8;
    	let a1;
    	let t10;
    	let div6;
    	let div5;
    	let router;
    	let current;
    	let each_value = Object.entries(/*$routes*/ ctx[2]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	router = new Router({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			html_tag = new HtmlTag();
    			t0 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "SASSIS";
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t4 = text("v");
    			t5 = text(t5_value);
    			t6 = space();
    			span = element("span");
    			t7 = text(/*date*/ ctx[0]);
    			t8 = space();
    			a1 = element("a");
    			a1.textContent = "autr.tv";
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");
    			create_component(router.$$.fragment);
    			html_tag.a = t0;
    			attr_dev(a0, "href", "#/intro");
    			attr_dev(a0, "class", "unclickable bright f5 pb0");
    			add_location(a0, file$7, 34, 6, 1056);
    			attr_dev(div0, "class", "flex column");
    			add_location(div0, file$7, 33, 5, 1024);
    			attr_dev(span, "class", "fade");
    			add_location(span, file$7, 55, 7, 1842);
    			attr_dev(a1, "href", "https://autr.tv");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$7, 56, 7, 1882);
    			attr_dev(div1, "class", "bright");
    			add_location(div1, file$7, 53, 6, 1781);
    			add_location(div2, file$7, 51, 5, 1768);
    			attr_dev(div3, "class", "flex column p1 grow justify-content-between");
    			add_location(div3, file$7, 32, 4, 961);
    			attr_dev(div4, "class", "flex basis20em justify-content-flex-end overflow-auto h100vh");
    			add_location(div4, file$7, 31, 3, 882);
    			attr_dev(div5, "class", "flex maxw60em grow pt1");
    			add_location(div5, file$7, 63, 4, 2045);
    			attr_dev(div6, "class", "basis40em flex overflow-auto grow h100vh");
    			add_location(div6, file$7, 62, 3, 1986);
    			attr_dev(div7, "class", "overflow-hidden flex row-center-flex-start grow");
    			add_location(div7, file$7, 30, 2, 817);
    			attr_dev(div8, "class", "flex w100vw h100vh overflow-hidden row-center-flex-start");
    			add_location(div8, file$7, 29, 1, 744);
    			attr_dev(main, "class", "sassis");
    			add_location(main, file$7, 26, 0, 705);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			html_tag.m(/*$root*/ ctx[1], main);
    			append_dev(main, t0);
    			append_dev(main, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, span);
    			append_dev(span, t7);
    			append_dev(div1, t8);
    			append_dev(div1, a1);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			mount_component(router, div5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$root*/ 2) html_tag.p(/*$root*/ ctx[1]);

    			if (dirty & /*Object, $routes, $active, window*/ 12) {
    				each_value = Object.entries(/*$routes*/ ctx[2]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*date*/ 1) set_data_dev(t7, /*date*/ ctx[0]);
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
    			destroy_each(each_blocks, detaching);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let date;
    	let $root;
    	let $routes;
    	let $active;
    	validate_store(root, 'root');
    	component_subscribe($$self, root, $$value => $$invalidate(1, $root = $$value));
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, $$value => $$invalidate(2, $routes = $$value));
    	validate_store(active, 'active');
    	component_subscribe($$self, active, $$value => $$invalidate(3, $active = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	onMount(async () => {
    		const res = await fetch(`defaults.css`);
    		const text = await res.text();
    		set_store_value(root, $root = '<style>' + text + '</style >', $root);

    		hotkeys('ctrl+f,cmd+f', function (event, handler) {
    			event.preventDefault();
    			window.location.hash = '#/search';

    			setTimeout(
    				e => {
    					document.getElementById('search').focus();
    				},
    				10
    			);
    		});
    	});

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (v, e) => window.location = v.$$href;

    	$$self.$capture_state = () => ({
    		onMount,
    		infos,
    		Router,
    		routes,
    		params,
    		active,
    		root,
    		hotkeys,
    		date,
    		$root,
    		$routes,
    		$active
    	});

    	$$self.$inject_state = $$props => {
    		if ('date' in $$props) $$invalidate(0, date = $$props.date);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + (new Date().getFullYear() - 2000));
    	return [date, $root, $routes, $active, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
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
              "inline",
              "i"
            ],
            [
              "display: inline"
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
            ],
            false,
            true
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
              "row-reverse",
              "flex-row-reverse"
            ],
            [
              "flex-direction: row-reverse"
            ]
          ],
          [
            [
              "column-reverse",
              "flex-column-reverse"
            ],
            [
              "flex-direction: column-reverse"
            ]
          ],
          [
            [
              "grow"
            ],
            [
              "flex-grow: 1"
            ],
            false,
            true
          ],
          [
            [
              "no-grow",
              "nogrow"
            ],
            [
              "flex-grow: 0"
            ]
          ],
          [
            [
              "cgrow > *",
              "c-grow > *"
            ],
            [
              "flex-grow: 1"
            ],
            false,
            true,
            true
          ],
          [
            [
              "cnogrow > *",
              "cno-grow > *",
              "c-no-grow > *"
            ],
            [
              "flex-grow: 0"
            ],
            false,
            true,
            true
          ],
          [
            [
              "shrink"
            ],
            [
              "flex-shrink: 1"
            ],
            false,
            true
          ],
          [
            [
              "no-shrink"
            ],
            [
              "flex-shrink: 0"
            ],
            false,
            true
          ],
          [
            [
              "no-basis"
            ],
            [
              "flex-basis: 0"
            ],
            false,
            true
          ],
          [
            [
              "wrap"
            ],
            [
              "flex-wrap: wrap"
            ],
            false,
            true
          ],
          [
            [
              "nowrap",
              "no-wrap"
            ],
            [
              "flex-wrap: nowrap"
            ],
            false,
            true,
            true
          ],
          [
            [
              "auto-space > *"
            ],
            [
              "margin-left: var(--column-spacing)",
              "&:first-child",
              "\tmargin-left: 0"
            ],
            false,
            true,
            true
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
              "capitalize"
            ],
            [
              "text-transform: capitalize"
            ]
          ],
          [
            [
              "uppercase"
            ],
            [
              "text-transform: uppercase"
            ]
          ],
          [
            [
              "lowercase"
            ],
            [
              "text-transform: lowercase"
            ]
          ],
          [
            [
              "underline"
            ],
            [
              "text-decoration: underline"
            ]
          ],
          [
            [
              "strike-through",
              "line-through",
              "cross-out"
            ],
            [
              "text-decoration: line-through"
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
              "grab"
            ],
            [
              "cursor: grab"
            ]
          ],
          [
            [
              "grabbing"
            ],
            [
              "cursor: grabbing"
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
          ],
          [
            [
              "margin-auto"
            ],
            [
              "margin: auto auto"
            ]
          ],
          [
            [
              "whitespace-normal"
            ],
            [
              "white-space: normal"
            ]
          ],
          [
            [
              "whitespace-pre",
              "newlines"
            ],
            [
              "white-space: pre"
            ]
          ],
          [
            [
              "whitespace-nowrap"
            ],
            [
              "white-space: nowrap"
            ]
          ],
          [
            [
              "whitespace-prewrap"
            ],
            [
              "white-space: pre-wrap"
            ]
          ],
          [
            [
              "fill"
            ],
            [
              "position: absolute",
              "width: 100%",
              "height: 100%",
              "top: 0",
              "left: 0"
            ]
          ],
          [
            [
              "no-webkit"
            ],
            [
              "-webkit-appearance: none"
            ]
          ],
          [
            [
              "user-select-none"
            ],
            [
              "user-select: none"
            ]
          ]
        ],
        "mixins": "."
      },
      {
        "type": "h2",
        "id": "layout"
      },
      {
        "type": "table",
        "id": "layout",
        "data": [
          [
            [
              "flex"
            ],
            [
              "display: flex"
            ],
            false,
            true
          ],
          [
            [
              "grow"
            ],
            [
              "flex-grow: 1"
            ],
            false,
            true
          ],
          [
            [
              "cgrow > *",
              "c-grow > *"
            ],
            [
              "flex-grow: 1"
            ],
            false,
            true,
            true
          ],
          [
            [
              "cnogrow > *",
              "cno-grow > *",
              "c-no-grow > *"
            ],
            [
              "flex-grow: 0"
            ],
            false,
            true,
            true
          ],
          [
            [
              "shrink"
            ],
            [
              "flex-shrink: 1"
            ],
            false,
            true
          ],
          [
            [
              "no-shrink"
            ],
            [
              "flex-shrink: 0"
            ],
            false,
            true
          ],
          [
            [
              "no-basis"
            ],
            [
              "flex-basis: 0"
            ],
            false,
            true
          ],
          [
            [
              "wrap"
            ],
            [
              "flex-wrap: wrap"
            ],
            false,
            true
          ],
          [
            [
              "nowrap",
              "no-wrap"
            ],
            [
              "flex-wrap: nowrap"
            ],
            false,
            true,
            true
          ],
          [
            [
              "auto-space > *"
            ],
            [
              "margin-left: var(--column-spacing)",
              "&:first-child",
              "\tmargin-left: 0"
            ],
            false,
            true,
            true
          ]
        ]
      },
      {
        "type": "h2",
        "id": "alignments"
      },
      {
        "type": "table",
        "id": "alignments",
        "data": [
          [
            [
              "row-{alert}[content]{end}-{alert}[items]{end}",
              "+row({info}$x, $y{end})"
            ],
            [
              "justify-content: {alert}[content]{end}",
              "align-items: {alert}[items]{end}",
              "flex-direction: row"
            ]
          ],
          [
            [
              "row-x-{alert}[content]{end}",
              "+row-x({info}$val{end})"
            ],
            [
              "justify-content: {alert}[content]{end}"
            ]
          ],
          [
            [
              "row-y-{alert}[items]{end}",
              "+row-y({info}$val{end})"
            ],
            [
              "align-items: {alert}[items]{end}"
            ]
          ],
          [
            [
              "row > .y-{alert}[items]{end}"
            ],
            [
              "align-self: {alert}[items]{end}"
            ]
          ],
          [
            [
              "column-{alert}[items]{end}-{alert}[content]{end}",
              "+column({info}$x, $y{end})"
            ],
            [
              "align-items: {alert}[items]{end}",
              "justify-content: {alert}[content]{end}",
              "flex-direction: column"
            ]
          ],
          [
            [
              "column-x-{alert}[items]{end}",
              "+column-x({info}$val{end})"
            ],
            [
              "align-items: {alert}[items]{end}"
            ]
          ],
          [
            [
              "column > .x-{alert}[items]{end}"
            ],
            [
              "align-self: {alert}[items]{end}"
            ]
          ],
          [
            [
              "column-y-{alert}[content]{end}",
              "+column-y({info}$val{end})"
            ],
            [
              "justify-content: {alert}[content]{end}"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "items"
      },
      {
        "type": "table",
        "id": "items",
        "data": [
          [
            [
              "align-self-center"
            ],
            [
              "align-self: center"
            ]
          ],
          [
            [
              "align-self-end"
            ],
            [
              "align-self: end"
            ]
          ],
          [
            [
              "align-self-flex-end"
            ],
            [
              "align-self: flex-end"
            ]
          ],
          [
            [
              "align-self-start"
            ],
            [
              "align-self: start"
            ]
          ],
          [
            [
              "align-self-flex-start"
            ],
            [
              "align-self: flex-start"
            ]
          ],
          [
            [
              "align-self-stretch"
            ],
            [
              "align-self: stretch"
            ]
          ],
          [
            [
              "align-self-baseline"
            ],
            [
              "align-self: baseline"
            ]
          ],
          [
            [
              "align-items-center"
            ],
            [
              "align-items: center"
            ]
          ],
          [
            [
              "align-items-end"
            ],
            [
              "align-items: end"
            ]
          ],
          [
            [
              "align-items-flex-end"
            ],
            [
              "align-items: flex-end"
            ]
          ],
          [
            [
              "align-items-start"
            ],
            [
              "align-items: start"
            ]
          ],
          [
            [
              "align-items-flex-start"
            ],
            [
              "align-items: flex-start"
            ]
          ],
          [
            [
              "align-items-stretch"
            ],
            [
              "align-items: stretch"
            ]
          ],
          [
            [
              "align-items-baseline"
            ],
            [
              "align-items: baseline"
            ]
          ],
          [
            [
              "justify-self-center"
            ],
            [
              "justify-self: center"
            ]
          ],
          [
            [
              "justify-self-end"
            ],
            [
              "justify-self: end"
            ]
          ],
          [
            [
              "justify-self-flex-end"
            ],
            [
              "justify-self: flex-end"
            ]
          ],
          [
            [
              "justify-self-start"
            ],
            [
              "justify-self: start"
            ]
          ],
          [
            [
              "justify-self-flex-start"
            ],
            [
              "justify-self: flex-start"
            ]
          ],
          [
            [
              "justify-self-stretch"
            ],
            [
              "justify-self: stretch"
            ]
          ],
          [
            [
              "justify-self-baseline"
            ],
            [
              "justify-self: baseline"
            ]
          ],
          [
            [
              "justify-items-center"
            ],
            [
              "justify-items: center"
            ]
          ],
          [
            [
              "justify-items-end"
            ],
            [
              "justify-items: end"
            ]
          ],
          [
            [
              "justify-items-flex-end"
            ],
            [
              "justify-items: flex-end"
            ]
          ],
          [
            [
              "justify-items-start"
            ],
            [
              "justify-items: start"
            ]
          ],
          [
            [
              "justify-items-flex-start"
            ],
            [
              "justify-items: flex-start"
            ]
          ],
          [
            [
              "justify-items-stretch"
            ],
            [
              "justify-items: stretch"
            ]
          ],
          [
            [
              "justify-items-baseline"
            ],
            [
              "justify-items: baseline"
            ]
          ]
        ],
        "mixins": "."
      },
      {
        "type": "h3",
        "id": "content"
      },
      {
        "type": "table",
        "id": "content",
        "data": [
          [
            [
              "align-content-space-between"
            ],
            [
              "align-content: space-between"
            ]
          ],
          [
            [
              "align-content-space-evenly"
            ],
            [
              "align-content: space-evenly"
            ]
          ],
          [
            [
              "align-content-space-around"
            ],
            [
              "align-content: space-around"
            ]
          ],
          [
            [
              "align-content-left"
            ],
            [
              "align-content: left"
            ]
          ],
          [
            [
              "align-content-right"
            ],
            [
              "align-content: right"
            ]
          ],
          [
            [
              "align-content-center"
            ],
            [
              "align-content: center"
            ]
          ],
          [
            [
              "align-content-end"
            ],
            [
              "align-content: end"
            ]
          ],
          [
            [
              "align-content-flex-end"
            ],
            [
              "align-content: flex-end"
            ]
          ],
          [
            [
              "align-content-start"
            ],
            [
              "align-content: start"
            ]
          ],
          [
            [
              "align-content-flex-start"
            ],
            [
              "align-content: flex-start"
            ]
          ],
          [
            [
              "align-content-stretch"
            ],
            [
              "align-content: stretch"
            ]
          ],
          [
            [
              "justify-content-space-between"
            ],
            [
              "justify-content: space-between"
            ]
          ],
          [
            [
              "justify-content-space-evenly"
            ],
            [
              "justify-content: space-evenly"
            ]
          ],
          [
            [
              "justify-content-space-around"
            ],
            [
              "justify-content: space-around"
            ]
          ],
          [
            [
              "justify-content-left"
            ],
            [
              "justify-content: left"
            ]
          ],
          [
            [
              "justify-content-right"
            ],
            [
              "justify-content: right"
            ]
          ],
          [
            [
              "justify-content-center"
            ],
            [
              "justify-content: center"
            ]
          ],
          [
            [
              "justify-content-end"
            ],
            [
              "justify-content: end"
            ]
          ],
          [
            [
              "justify-content-flex-end"
            ],
            [
              "justify-content: flex-end"
            ]
          ],
          [
            [
              "justify-content-start"
            ],
            [
              "justify-content: start"
            ]
          ],
          [
            [
              "justify-content-flex-start"
            ],
            [
              "justify-content: flex-start"
            ]
          ],
          [
            [
              "justify-content-stretch"
            ],
            [
              "justify-content: stretch"
            ]
          ]
        ],
        "mixins": "."
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
              "pt{alert}[num]{end}{info}[~|px|pc]{end}",
              "+pt({alert}$val{end})"
            ],
            [
              "padding-top: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "pr{alert}[num]{end}{info}[~|px|pc]{end}",
              "+pr({alert}$val{end})"
            ],
            [
              "padding-right: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "pl{alert}[num]{end}{info}[~|px|pc]{end}",
              "+pl({alert}$val{end})"
            ],
            [
              "padding-left: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "pb{alert}[num]{end}{info}[~|px|pc]{end}",
              "+pb({alert}$val{end})"
            ],
            [
              "padding-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "plr{alert}[num]{end}{info}[~|px|pc]{end}",
              "+plr({alert}$val{end})"
            ],
            [
              "padding-left: {alert}[num]{end}{info}[em|px|pc]{end} ",
              "padding-right: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "ptb{alert}[num]{end}{info}[~|px|pc]{end}",
              "+ptb({alert}$val{end})"
            ],
            [
              "padding-top: {alert}[num]{end}{info}[em|px|pc]{end} ",
              "padding-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "p{alert}[num]{end}{info}[~|px|pc]{end}",
              "+p({alert}$val{end})"
            ],
            [
              "padding: {alert}[num]{end}{info}[em|px|pc]{end} "
            ]
          ],
          [
            [
              "cp{succ}[rule]{end}",
              "+cp{succ}[rule]{end}"
            ],
            [
              "> *",
              "{succ}[rule]{end}"
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
              "mt{alert}[num]{end}{info}[~|px|pc]{end}",
              "+mt({alert}$val{end})"
            ],
            [
              "margin-top: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "mr{alert}[num]{end}{info}[~|px|pc]{end}",
              "+mr({alert}$val{end})"
            ],
            [
              "margin-right: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "ml{alert}[num]{end}{info}[~|px|pc]{end}",
              "+ml({alert}$val{end})"
            ],
            [
              "margin-left: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "mb{alert}[num]{end}{info}[~|px|pc]{end}",
              "+mb({alert}$val{end})"
            ],
            [
              "margin-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "mlr{alert}[num]{end}{info}[~|px|pc]{end}",
              "+mlr({alert}$val{end})"
            ],
            [
              "margin-left: {alert}[num]{end}{info}[em|px|pc]{end} ",
              "margin-right: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "mtb{alert}[num]{end}{info}[~|px|pc]{end}",
              "+mtb({alert}$val{end})"
            ],
            [
              "margin-top: {alert}[num]{end}{info}[em|px|pc]{end} ",
              "margin-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "m{alert}[num]{end}{info}[~|px|pc]{end}",
              "+m({alert}$val{end})"
            ],
            [
              "margin: {alert}[num]{end}{info}[em|px|pc]{end} "
            ]
          ],
          [
            [
              "cm{succ}[rule]{end}",
              "+cm{succ}[rule]{end}"
            ],
            [
              "> *",
              "{succ}[rule]{end}"
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
              "bt{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+bt({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border-top-width: {alert}[0-10]{end}px ",
              "border-top-style: {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "br{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+br({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border-right-width: {alert}[0-10]{end}px ",
              "border-right-style: {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "bl{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+bl({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border-left-width: {alert}[0-10]{end}px ",
              "border-left-style: {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "bb{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+bb({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border-bottom-width: {alert}[0-10]{end}px ",
              "border-bottom-style: {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "blr{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+blr({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border-left-width: {alert}[0-10]{end}px ",
              "border-right-width: {alert}[0-10]{end}px ",
              "border-right-style: {info}[solid|dashed|dotted]{end} ",
              "border-left-style: {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "btb{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+btb({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border-top-width: {alert}[0-10]{end}px ",
              "border-bottom-width: {alert}[0-10]{end}px ",
              "border-top-style: {info}[solid|dashed|dotted]{end} ",
              "border-bottom-style: {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "b{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
              "+b({alert}$val{end}, {info}$type{end})"
            ],
            [
              "border: {alert}[0-10]{end}px {info}[solid|dashed|dotted]{end}"
            ]
          ],
          [
            [
              "cb{succ}[rule]{end}",
              "+cb{succ}[rule]{end}"
            ],
            [
              "> *",
              "{succ}[rule]{end}"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "spacer"
      },
      {
        "type": "table",
        "id": "flex-basis",
        "data": [
          [
            [
              "s{alert}[num]{end}{info}[~|px|pc]{end}",
              "+s({alert}$val{end})"
            ],
            [
              "flex-basis: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "cs{succ}[rule]{end}",
              "+cs{succ}[rule]{end}"
            ],
            [
              "> .spacer",
              "{succ}[rule]{end}"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "position"
      },
      {
        "type": "table",
        "id": "position",
        "data": [
          [
            [
              "t{alert}[num]{end}{info}[~|px|pc]{end}",
              "+t({alert}$val{end})"
            ],
            [
              "top: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "r{alert}[num]{end}{info}[~|px|pc]{end}",
              "+r({alert}$val{end})"
            ],
            [
              "right: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "l{alert}[num]{end}{info}[~|px|pc]{end}",
              "+l({alert}$val{end})"
            ],
            [
              "left: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "b{alert}[num]{end}{info}[~|px|pc]{end}",
              "+b({alert}$val{end})"
            ],
            [
              "bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "lr{alert}[num]{end}{info}[~|px|pc]{end}",
              "+lr({alert}$val{end})"
            ],
            [
              "left: {alert}[num]{end}{info}[em|px|pc]{end} ",
              "right: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "tb{alert}[num]{end}{info}[~|px|pc]{end}",
              "+tb({alert}$val{end})"
            ],
            [
              "top: {alert}[num]{end}{info}[em|px|pc]{end} ",
              "bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
            ]
          ],
          [
            [
              "c{succ}[rule]{end}",
              "+c{succ}[rule]{end}"
            ],
            [
              "> *",
              "{succ}[rule]{end}"
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
              "w{alert}[0-100]{end}em",
              "+w({info}$val{end})"
            ],
            [
              "width: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "w{alert}[0-1000]{end}px",
              "+w({info}$val{end})"
            ],
            [
              "width: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "w{alert}[0-100]{end}pc",
              "+w({info}$val{end})"
            ],
            [
              "width: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "w{alert}[0-100]{end}vw",
              "+w({info}$val{end})"
            ],
            [
              "width: {alert}[0-100]{end}vw"
            ]
          ],
          [
            [
              "w-auto",
              "+w-auto"
            ],
            [
              "width: auto"
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
              "h{alert}[0-100]{end}em",
              "+h({info}$val{end})"
            ],
            [
              "height: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "h{alert}[0-1000]{end}px",
              "+h({info}$val{end})"
            ],
            [
              "height: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "h{alert}[0-100]{end}pc",
              "+h({info}$val{end})"
            ],
            [
              "height: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "h{alert}[0-100]{end}vh",
              "+h({info}$val{end})"
            ],
            [
              "height: {alert}[0-100]{end}vh"
            ]
          ],
          [
            [
              "h-auto",
              "+h-auto"
            ],
            [
              "height: auto"
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
              "minw{alert}[0-100]{end}em",
              "+minw({info}$val{end})"
            ],
            [
              "min-width: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "minw{alert}[0-1000]{end}px",
              "+minw({info}$val{end})"
            ],
            [
              "min-width: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "minw{alert}[0-100]{end}pc",
              "+minw({info}$val{end})"
            ],
            [
              "min-width: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "minw{alert}[0-100]{end}vw",
              "+minw({info}$val{end})"
            ],
            [
              "min-width: {alert}[0-100]{end}vw"
            ]
          ],
          [
            [
              "minw-auto",
              "+minw-auto"
            ],
            [
              "min-width: auto"
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
              "minh{alert}[0-100]{end}em",
              "+minh({info}$val{end})"
            ],
            [
              "min-height: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "minh{alert}[0-1000]{end}px",
              "+minh({info}$val{end})"
            ],
            [
              "min-height: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "minh{alert}[0-100]{end}pc",
              "+minh({info}$val{end})"
            ],
            [
              "min-height: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "minh{alert}[0-100]{end}vh",
              "+minh({info}$val{end})"
            ],
            [
              "min-height: {alert}[0-100]{end}vh"
            ]
          ],
          [
            [
              "minh-auto",
              "+minh-auto"
            ],
            [
              "min-height: auto"
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
              "maxw{alert}[0-100]{end}em",
              "+maxw({info}$val{end})"
            ],
            [
              "max-width: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "maxw{alert}[0-1000]{end}px",
              "+maxw({info}$val{end})"
            ],
            [
              "max-width: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "maxw{alert}[0-100]{end}pc",
              "+maxw({info}$val{end})"
            ],
            [
              "max-width: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "maxw{alert}[0-100]{end}vw",
              "+maxw({info}$val{end})"
            ],
            [
              "max-width: {alert}[0-100]{end}vw"
            ]
          ],
          [
            [
              "maxw-auto",
              "+maxw-auto"
            ],
            [
              "max-width: auto"
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
              "maxh{alert}[0-100]{end}em",
              "+maxh({info}$val{end})"
            ],
            [
              "max-height: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "maxh{alert}[0-1000]{end}px",
              "+maxh({info}$val{end})"
            ],
            [
              "max-height: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "maxh{alert}[0-100]{end}pc",
              "+maxh({info}$val{end})"
            ],
            [
              "max-height: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "maxh{alert}[0-100]{end}vh",
              "+maxh({info}$val{end})"
            ],
            [
              "max-height: {alert}[0-100]{end}vh"
            ]
          ],
          [
            [
              "maxh-auto",
              "+maxh-auto"
            ],
            [
              "max-height: auto"
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
              "basis{alert}[0-100]{end}em",
              "+basis({info}$val{end})"
            ],
            [
              "flex-basis: {alert}[0-100]{end}em"
            ]
          ],
          [
            [
              "basis{alert}[0-1000]{end}px",
              "+basis({info}$val{end})"
            ],
            [
              "flex-basis: {alert}[0-1000]{end}px"
            ]
          ],
          [
            [
              "basis{alert}[0-100]{end}pc",
              "+basis({info}$val{end})"
            ],
            [
              "flex-basis: {alert}[0-100]{end}%"
            ]
          ],
          [
            [
              "basis-auto",
              "+basis-auto"
            ],
            [
              "flex-basis: auto"
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
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}",
              "+radius($val)"
            ],
            [
              "border-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-top",
              "+radius-top($val)"
            ],
            [
              "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-bottom",
              "+radius-bottom($val)"
            ],
            [
              "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-left",
              "+radius-left($val)"
            ],
            [
              "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-right",
              "+radius-right($val)"
            ],
            [
              "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-top",
              "+radius-top($val)"
            ],
            [
              "border-top-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
              "border-top-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-bottom",
              "+radius-bottom($val)"
            ],
            [
              "border-bottom-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
              "border-bottom-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-left",
              "+radius-left($val)"
            ],
            [
              "border-top-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
              "border-bottom-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-right",
              "+radius-right($val)"
            ],
            [
              "border-top-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
              "border-bottom-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-top",
              "+radius-top($val)"
            ],
            [
              "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-bottom",
              "+radius-bottom($val)"
            ],
            [
              "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-left",
              "+radius-left($val)"
            ],
            [
              "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-right",
              "+radius-right($val)"
            ],
            [
              "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
              "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
            ]
          ],
          [
            [
              "radius-auto",
              "+radius-auto"
            ],
            [
              "border-radius: auto"
            ]
          ]
        ]
      },
      {
        "type": "h2",
        "id": "transform"
      },
      {
        "type": "table",
        "id": "transform",
        "data": [
          [
            [
              "translate{alert}00{end}"
            ],
            [
              "transform: translate( {alert}0%, 0%{end})"
            ]
          ],
          [
            [
              "origin{alert}00{end}"
            ],
            [
              "transform-origin: {alert}0% 0%{end}"
            ]
          ],
          [
            [
              "translate{alert}0-50{end}"
            ],
            [
              "transform: translate( {alert}0%, -50%{end})"
            ]
          ],
          [
            [
              "origin{alert}0-50{end}"
            ],
            [
              "transform-origin: {alert}0% -50%{end}"
            ]
          ],
          [
            [
              "translate{alert}050{end}"
            ],
            [
              "transform: translate( {alert}0%, 50%{end})"
            ]
          ],
          [
            [
              "origin{alert}050{end}"
            ],
            [
              "transform-origin: {alert}0% 50%{end}"
            ]
          ],
          [
            [
              "translate{alert}0100{end}"
            ],
            [
              "transform: translate( {alert}0%, 100%{end})"
            ]
          ],
          [
            [
              "origin{alert}0100{end}"
            ],
            [
              "transform-origin: {alert}0% 100%{end}"
            ]
          ],
          [
            [
              "translate{alert}0-100{end}"
            ],
            [
              "transform: translate( {alert}0%, -100%{end})"
            ]
          ],
          [
            [
              "origin{alert}0-100{end}"
            ],
            [
              "transform-origin: {alert}0% -100%{end}"
            ]
          ],
          [
            [
              "translate{alert}-500{end}"
            ],
            [
              "transform: translate( {alert}-50%, 0%{end})"
            ]
          ],
          [
            [
              "origin{alert}-500{end}"
            ],
            [
              "transform-origin: {alert}-50% 0%{end}"
            ]
          ],
          [
            [
              "translate{alert}-50-50{end}"
            ],
            [
              "transform: translate( {alert}-50%, -50%{end})"
            ]
          ],
          [
            [
              "origin{alert}-50-50{end}"
            ],
            [
              "transform-origin: {alert}-50% -50%{end}"
            ]
          ],
          [
            [
              "translate{alert}-5050{end}"
            ],
            [
              "transform: translate( {alert}-50%, 50%{end})"
            ]
          ],
          [
            [
              "origin{alert}-5050{end}"
            ],
            [
              "transform-origin: {alert}-50% 50%{end}"
            ]
          ],
          [
            [
              "translate{alert}-50100{end}"
            ],
            [
              "transform: translate( {alert}-50%, 100%{end})"
            ]
          ],
          [
            [
              "origin{alert}-50100{end}"
            ],
            [
              "transform-origin: {alert}-50% 100%{end}"
            ]
          ],
          [
            [
              "translate{alert}-50-100{end}"
            ],
            [
              "transform: translate( {alert}-50%, -100%{end})"
            ]
          ],
          [
            [
              "origin{alert}-50-100{end}"
            ],
            [
              "transform-origin: {alert}-50% -100%{end}"
            ]
          ],
          [
            [
              "translate{alert}500{end}"
            ],
            [
              "transform: translate( {alert}50%, 0%{end})"
            ]
          ],
          [
            [
              "origin{alert}500{end}"
            ],
            [
              "transform-origin: {alert}50% 0%{end}"
            ]
          ],
          [
            [
              "translate{alert}50-50{end}"
            ],
            [
              "transform: translate( {alert}50%, -50%{end})"
            ]
          ],
          [
            [
              "origin{alert}50-50{end}"
            ],
            [
              "transform-origin: {alert}50% -50%{end}"
            ]
          ],
          [
            [
              "translate{alert}5050{end}"
            ],
            [
              "transform: translate( {alert}50%, 50%{end})"
            ]
          ],
          [
            [
              "origin{alert}5050{end}"
            ],
            [
              "transform-origin: {alert}50% 50%{end}"
            ]
          ],
          [
            [
              "translate{alert}50100{end}"
            ],
            [
              "transform: translate( {alert}50%, 100%{end})"
            ]
          ],
          [
            [
              "origin{alert}50100{end}"
            ],
            [
              "transform-origin: {alert}50% 100%{end}"
            ]
          ],
          [
            [
              "translate{alert}50-100{end}"
            ],
            [
              "transform: translate( {alert}50%, -100%{end})"
            ]
          ],
          [
            [
              "origin{alert}50-100{end}"
            ],
            [
              "transform-origin: {alert}50% -100%{end}"
            ]
          ],
          [
            [
              "translate{alert}1000{end}"
            ],
            [
              "transform: translate( {alert}100%, 0%{end})"
            ]
          ],
          [
            [
              "origin{alert}1000{end}"
            ],
            [
              "transform-origin: {alert}100% 0%{end}"
            ]
          ],
          [
            [
              "translate{alert}100-50{end}"
            ],
            [
              "transform: translate( {alert}100%, -50%{end})"
            ]
          ],
          [
            [
              "origin{alert}100-50{end}"
            ],
            [
              "transform-origin: {alert}100% -50%{end}"
            ]
          ],
          [
            [
              "translate{alert}10050{end}"
            ],
            [
              "transform: translate( {alert}100%, 50%{end})"
            ]
          ],
          [
            [
              "origin{alert}10050{end}"
            ],
            [
              "transform-origin: {alert}100% 50%{end}"
            ]
          ],
          [
            [
              "translate{alert}100100{end}"
            ],
            [
              "transform: translate( {alert}100%, 100%{end})"
            ]
          ],
          [
            [
              "origin{alert}100100{end}"
            ],
            [
              "transform-origin: {alert}100% 100%{end}"
            ]
          ],
          [
            [
              "translate{alert}100-100{end}"
            ],
            [
              "transform: translate( {alert}100%, -100%{end})"
            ]
          ],
          [
            [
              "origin{alert}100-100{end}"
            ],
            [
              "transform-origin: {alert}100% -100%{end}"
            ]
          ],
          [
            [
              "translate{alert}-1000{end}"
            ],
            [
              "transform: translate( {alert}-100%, 0%{end})"
            ]
          ],
          [
            [
              "origin{alert}-1000{end}"
            ],
            [
              "transform-origin: {alert}-100% 0%{end}"
            ]
          ],
          [
            [
              "translate{alert}-100-50{end}"
            ],
            [
              "transform: translate( {alert}-100%, -50%{end})"
            ]
          ],
          [
            [
              "origin{alert}-100-50{end}"
            ],
            [
              "transform-origin: {alert}-100% -50%{end}"
            ]
          ],
          [
            [
              "translate{alert}-10050{end}"
            ],
            [
              "transform: translate( {alert}-100%, 50%{end})"
            ]
          ],
          [
            [
              "origin{alert}-10050{end}"
            ],
            [
              "transform-origin: {alert}-100% 50%{end}"
            ]
          ],
          [
            [
              "translate{alert}-100100{end}"
            ],
            [
              "transform: translate( {alert}-100%, 100%{end})"
            ]
          ],
          [
            [
              "origin{alert}-100100{end}"
            ],
            [
              "transform-origin: {alert}-100% 100%{end}"
            ]
          ],
          [
            [
              "translate{alert}-100-100{end}"
            ],
            [
              "transform: translate( {alert}-100%, -100%{end})"
            ]
          ],
          [
            [
              "origin{alert}-100-100{end}"
            ],
            [
              "transform-origin: {alert}-100% -100%{end}"
            ]
          ]
        ]
      },
      {
        "type": "h2",
        "id": "cursors"
      },
      {
        "type": "h2",
        "id": "cursors",
        "data": [
          [
            [
              "cursor-{alert}auto{end}"
            ],
            [
              "cursor: {alert}auto{end}"
            ]
          ],
          [
            [
              "cursor-{alert}inherit{end}"
            ],
            [
              "cursor: {alert}inherit{end}"
            ]
          ],
          [
            [
              "cursor-{alert}crosshair{end}"
            ],
            [
              "cursor: {alert}crosshair{end}"
            ]
          ],
          [
            [
              "cursor-{alert}default{end}"
            ],
            [
              "cursor: {alert}default{end}"
            ]
          ],
          [
            [
              "cursor-{alert}help{end}"
            ],
            [
              "cursor: {alert}help{end}"
            ]
          ],
          [
            [
              "cursor-{alert}move{end}"
            ],
            [
              "cursor: {alert}move{end}"
            ]
          ],
          [
            [
              "cursor-{alert}pointer{end}"
            ],
            [
              "cursor: {alert}pointer{end}"
            ]
          ],
          [
            [
              "cursor-{alert}progress{end}"
            ],
            [
              "cursor: {alert}progress{end}"
            ]
          ],
          [
            [
              "cursor-{alert}text{end}"
            ],
            [
              "cursor: {alert}text{end}"
            ]
          ],
          [
            [
              "cursor-{alert}wait{end}"
            ],
            [
              "cursor: {alert}wait{end}"
            ]
          ],
          [
            [
              "cursor-{alert}e-resize{end}"
            ],
            [
              "cursor: {alert}e-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}ne-resize{end}"
            ],
            [
              "cursor: {alert}ne-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}nw-resize{end}"
            ],
            [
              "cursor: {alert}nw-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}n-resize{end}"
            ],
            [
              "cursor: {alert}n-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}se-resize{end}"
            ],
            [
              "cursor: {alert}se-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}sw-resize{end}"
            ],
            [
              "cursor: {alert}sw-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}s-resize{end}"
            ],
            [
              "cursor: {alert}s-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}w-resize{end}"
            ],
            [
              "cursor: {alert}w-resize{end}"
            ]
          ],
          [
            [
              "cursor-{alert}grab{end}"
            ],
            [
              "cursor: {alert}grab{end}"
            ]
          ],
          [
            [
              "cursor-{alert}grabbing{end}"
            ],
            [
              "cursor: {alert}grabbing{end}"
            ]
          ],
          [
            [
              "cursor-{alert}zoom-in{end}"
            ],
            [
              "cursor: {alert}zoom-in{end}"
            ]
          ],
          [
            [
              "cursor-{alert}zoom-out{end}"
            ],
            [
              "cursor: {alert}zoom-out{end}"
            ]
          ]
        ]
      },
      {
        "type": "h2",
        "id": "font-size"
      },
      {
        "type": "table",
        "id": "font-size",
        "data": [
          [
            [
              "f0, h6, .h6",
              "+f0"
            ],
            [
              "font-size: {alert}0.785714rem{end}"
            ]
          ],
          [
            [
              "f1, h5, .h5",
              "+f1"
            ],
            [
              "font-size: {alert}1rem{end}"
            ]
          ],
          [
            [
              "f2, h4, .h4",
              "+f2"
            ],
            [
              "font-size: {alert}1.2857rem{end}"
            ]
          ],
          [
            [
              "f3, h3, .h3",
              "+f3"
            ],
            [
              "font-size: {alert}1.64285rem{end}"
            ]
          ],
          [
            [
              "f4, h2, .h2",
              "+f4"
            ],
            [
              "font-size: {alert}2.071428rem{end}"
            ]
          ],
          [
            [
              "f5, h1, .h1",
              "+f5"
            ],
            [
              "font-size: {alert}2.642857rem{end}"
            ]
          ]
        ]
      },
      {
        "type": "h2",
        "id": "z-index"
      },
      {
        "type": "table",
        "id": "z-index",
        "data": [
          [
            [
              "z-index{alert}0-99{end}",
              "+z-index( {alert}$z{end} )"
            ],
            [
              "z-index: {alert}0-99{end}"
            ]
          ]
        ]
      },
      {
        "type": "h2",
        "id": "opacity"
      },
      {
        "type": "table",
        "id": "opacity",
        "data": [
          [
            [
              "opacity{alert}0-99{end}",
              "+opacity( {alert}$z{end} )"
            ],
            [
              "opacity: {alert}0-99{end}"
            ]
          ]
        ]
      },
      {
        "type": "h2",
        "id": "font-family"
      },
      {
        "type": "table",
        "id": "font-family",
        "data": [
          [
            [
              "monospace",
              "+monospace"
            ],
            [
              "font-family: {info}var(--font-monospace){end}"
            ]
          ],
          [
            [
              "serif",
              "+serif"
            ],
            [
              "font-family: {info}var(--font-serif){end}"
            ]
          ],
          [
            [
              "sans-serif",
              "+sans-serif"
            ],
            [
              "font-family: {info}var(--font-sans-serif){end}"
            ]
          ],
          [
            [
              "cursive",
              "+cursive"
            ],
            [
              "font-family: {info}var(--font-cursive){end}"
            ]
          ],
          [
            [
              "slab",
              "+slab"
            ],
            [
              "font-family: {info}var(--font-slab){end}"
            ]
          ],
          [
            [
              "grotesque",
              "+grotesque"
            ],
            [
              "font-family: {info}var(--font-grotesque){end}"
            ]
          ]
        ]
      }
    ];

    var fields = [

    	{
    		"type": "h2",
    		"id": "form-fields"
    	},
    	{
    		"type": "h2",
    		"id": "example"
    	},
    	{
    		"type": "table",
    		"id": "form-fields",
    		"raw": true,
    		"data": [
    			[
    				[
    					'button',
    					'.button'
    				],
    				[`
					<button >button</button>
				`]
    			],
    			[
    				[
    					'input[type=text]'
    				],
    				[`<input type="text" placeholder="text" />`]
    			],
    			[
    				[
    					'input[type=number]'
    				],
    				[`<input type="number" placeholder="number" />`]
    			],
    			[
    				[
    					'input[type=range]'
    				],
    				[`<input type="range" class="mr1" placeholder="range" />`]
    			],
    			[
    				[
    					'textarea'
    				],
    				[`<textarea placeholder="textarea" />`]
    			],
    			[
    				[
    					'.select >',
    					'select'
    				],
    				[`
				<div class="select"><select><option>a</option><option>b</option><option>c</option></select>
				`]
    			],
    			[
    				[
    					'.dropdown >',
    					'div'
    				],
    				[`
				<div class="dropdown" tabindex="0">dropdown <div class="r0pc t100pc">hello world</div></div>
				`]
    			],
    			[
    				[
    					'.color >',
    					'input[type=color]'
    				],
    				[`<div class="color w4em"><input type="color" value="#ffffff" /></div>`]
    			],
    			[
    				[
    					'.checkbox >',
    					'input[type=checkbox]',
    					'span'
    				],
    				[`<label class="checkbox"><input type="checkbox" /><span /></label>`]
    			],
    			[
    				[
    					'.radio >',
    					'input[type=radio]',
    					'span'
    				],
    				[`<div class="flex"><label class="radio"><input checked type="radio" name="radio" value="1" /><span /></label><label class="radio"><input type="radio" name="radio" value="2" /><span /></label><label class="radio"><input type="radio" name="radio" value="3" /><span /></label></div>`]
    			],
    			[
    				[
    					'.clickable'
    				],
    				[`<div class="clickable">clickable</div>`]
    			]
    		]
    	}
    ];

    /* src/components/ShorthandTable.svelte generated by Svelte v3.46.4 */
    const file$6 = "src/components/ShorthandTable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (47:0) {#if filtered.length == 1 && filtered[0].data.length == 0}
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "nothing to show";
    			attr_dev(div, "class", "p1 text-center");
    			add_location(div, file$6, 47, 1, 1357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(47:0) {#if filtered.length == 1 && filtered[0].data.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*section*/ ctx[13].data;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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
    			if (dirty & /*name, id, filtered, $params, html, className*/ 63) {
    				each_value_1 = /*section*/ ctx[13].data;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		source: "(61:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#if !section.data  }
    function create_if_block(ctx) {
    	let tr;
    	let td;
    	let span;
    	let t0_value = /*section*/ ctx[13].id + "";
    	let t0;
    	let t1;
    	let tr_id_value;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "filled p0-4 plr2 bright");
    			add_location(span, file$6, 56, 5, 1629);
    			attr_dev(td, "colspan", "3");
    			attr_dev(td, "class", "text-center pb3");
    			toggle_class(td, "pt3", /*ii*/ ctx[15] > 0);
    			add_location(td, file$6, 55, 4, 1568);
    			attr_dev(tr, "id", tr_id_value = /*section*/ ctx[13].id);
    			attr_dev(tr, "class", "bb1-solid");
    			toggle_class(tr, "bt1-solid", /*ii*/ ctx[15] > 0);
    			add_location(tr, file$6, 54, 3, 1502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, span);
    			append_dev(span, t0);
    			append_dev(tr, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filtered*/ 8 && t0_value !== (t0_value = /*section*/ ctx[13].id + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*filtered*/ 8 && tr_id_value !== (tr_id_value = /*section*/ ctx[13].id)) {
    				attr_dev(tr, "id", tr_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(53:2) {#if !section.data  }",
    		ctx
    	});

    	return block;
    }

    // (87:7) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let raw_value = /*className*/ ctx[4](/*operator*/ ctx[16], /*section*/ ctx[13]) + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$6, 87, 8, 2427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*className, filtered*/ 24 && raw_value !== (raw_value = /*className*/ ctx[4](/*operator*/ ctx[16], /*section*/ ctx[13]) + "")) span.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(87:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:7) {#if section.raw}
    function create_if_block_1(ctx) {
    	let span;
    	let t_value = /*operator*/ ctx[16][0].join('\n') + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "newlines");
    			add_location(span, file$6, 85, 8, 2347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filtered*/ 8 && t_value !== (t_value = /*operator*/ ctx[16][0].join('\n') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(85:7) {#if section.raw}",
    		ctx
    	});

    	return block;
    }

    // (92:7) {#each operator[1] as rule}
    function create_each_block_2(ctx) {
    	let div;
    	let raw_value = /*html*/ ctx[1](/*rule*/ ctx[19]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "rule");
    			add_location(div, file$6, 92, 8, 2580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*html, filtered*/ 10 && raw_value !== (raw_value = /*html*/ ctx[1](/*rule*/ ctx[19]) + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(92:7) {#each operator[1] as rule}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#each section.data as operator, i}
    function create_each_block_1$1(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1;
    	let tr_id_value;

    	function select_block_type_1(ctx, dirty) {
    		if (/*section*/ ctx[13].raw) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_2 = /*operator*/ ctx[16][1];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			if_block.c();
    			t0 = space();
    			td1 = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(td0, "class", "br1-solid");
    			add_location(td0, file$6, 83, 6, 2291);
    			attr_dev(td1, "class", "bright pl1 ");
    			add_location(td1, file$6, 90, 6, 2512);
    			attr_dev(tr, "id", tr_id_value = `/${/*name*/ ctx[0]}/${/*id*/ ctx[2](/*operator*/ ctx[16])}`);
    			attr_dev(tr, "class", "cptb1");
    			toggle_class(tr, "b2-solid", /*$params*/ ctx[5].id == /*id*/ ctx[2](/*operator*/ ctx[16]));
    			toggle_class(tr, "bt1-solid", /*i*/ ctx[18] > 0);
    			add_location(tr, file$6, 63, 5, 1763);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			if_block.m(td0, null);
    			append_dev(tr, t0);
    			append_dev(tr, td1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td1, null);
    			}

    			append_dev(tr, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td0, null);
    				}
    			}

    			if (dirty & /*html, filtered*/ 10) {
    				each_value_2 = /*operator*/ ctx[16][1];
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

    			if (dirty & /*name, id, filtered*/ 13 && tr_id_value !== (tr_id_value = `/${/*name*/ ctx[0]}/${/*id*/ ctx[2](/*operator*/ ctx[16])}`)) {
    				attr_dev(tr, "id", tr_id_value);
    			}

    			if (dirty & /*$params, id, filtered*/ 44) {
    				toggle_class(tr, "b2-solid", /*$params*/ ctx[5].id == /*id*/ ctx[2](/*operator*/ ctx[16]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(63:4) {#each section.data as operator, i}",
    		ctx
    	});

    	return block;
    }

    // (51:1) {#each filtered as section, ii}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (!/*section*/ ctx[13].data) return create_if_block;
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
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(51:1) {#each filtered as section, ii}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t;
    	let table;
    	let if_block = /*filtered*/ ctx[3].length == 1 && /*filtered*/ ctx[3][0].data.length == 0 && create_if_block_2(ctx);
    	let each_value = /*filtered*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "w100pc mt1");
    			add_location(table, file$6, 49, 0, 1413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*filtered*/ ctx[3].length == 1 && /*filtered*/ ctx[3][0].data.length == 0) {
    				if (if_block) ; else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*filtered, name, id, $params, html, className*/ 63) {
    				each_value = /*filtered*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let className;
    	let id;
    	let sanitise;
    	let html;
    	let isSearching;
    	let all;
    	let _filtered;
    	let filtered;
    	let $params;
    	validate_store(params, 'params');
    	component_subscribe($$self, params, $$value => $$invalidate(5, $params = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ShorthandTable', slots, []);
    	let { name = 'shorthand' } = $$props;
    	let { filters = [] } = $$props;
    	let { items } = $$props;

    	function onClick(operator) {
    		window.location = `#${id(operator)}`;
    	}

    	const writable_props = ['name', 'filters', 'items'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ShorthandTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('filters' in $$props) $$invalidate(6, filters = $$props.filters);
    		if ('items' in $$props) $$invalidate(7, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		data,
    		fields,
    		active,
    		params,
    		name,
    		filters,
    		items,
    		onClick,
    		id,
    		_filtered,
    		filtered,
    		all,
    		isSearching,
    		html,
    		sanitise,
    		className,
    		$params
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('filters' in $$props) $$invalidate(6, filters = $$props.filters);
    		if ('items' in $$props) $$invalidate(7, items = $$props.items);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('_filtered' in $$props) $$invalidate(8, _filtered = $$props._filtered);
    		if ('filtered' in $$props) $$invalidate(3, filtered = $$props.filtered);
    		if ('all' in $$props) $$invalidate(9, all = $$props.all);
    		if ('isSearching' in $$props) $$invalidate(10, isSearching = $$props.isSearching);
    		if ('html' in $$props) $$invalidate(1, html = $$props.html);
    		if ('sanitise' in $$props) $$invalidate(11, sanitise = $$props.sanitise);
    		if ('className' in $$props) $$invalidate(4, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*html*/ 2) {
    			$$invalidate(4, className = (operator, section) => {
    				let o = html(operator[0].map(s => s[0] == '+' ? s : '.' + s).join(`, <br />`));
    				if (section.mixins == '.') return o.replaceAll('.', '<span class="info">[.|+]</span>');
    				return o;
    			});
    		}

    		if ($$self.$$.dirty & /*sanitise*/ 2048) {
    			$$invalidate(2, id = operator => `${sanitise(operator[0][0])}`);
    		}

    		if ($$self.$$.dirty & /*items*/ 128) {
    			$$invalidate(10, isSearching = items != undefined);
    		}

    		if ($$self.$$.dirty & /*isSearching, items*/ 1152) {
    			$$invalidate(9, all = isSearching ? items : data.concat(fields));
    		}

    		if ($$self.$$.dirty & /*filters, all*/ 576) {
    			$$invalidate(8, _filtered = () => {
    				if (!filters || filters?.length == 0) return all;
    				return all.filter(d => filters.indexOf(d.id) != -1);
    			});
    		}

    		if ($$self.$$.dirty & /*_filtered*/ 256) {
    			$$invalidate(3, filtered = _filtered());
    		}
    	};

    	$$invalidate(1, html = rule => {
    		rule = rule.replaceAll('{alert}', '<span class="alert">');
    		rule = rule.replaceAll('{info}', '<span class="info">');
    		rule = rule.replaceAll('{succ}', '<span class="success">');
    		rule = rule.replaceAll('{end}', '</span>');
    		return rule;
    	});

    	$$invalidate(11, sanitise = lines => {
    		return lines.replaceAll(/[.+,~|()<>$]/g, '').replaceAll(/[\ [\]]/g, '-').replaceAll(/{alert}|{info}|{end}|{succ}/gi, '').replaceAll('--', '-');
    	});

    	return [
    		name,
    		html,
    		id,
    		filtered,
    		className,
    		$params,
    		filters,
    		items,
    		_filtered,
    		all,
    		isSearching,
    		sanitise
    	];
    }

    class ShorthandTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$b, create_fragment$b, safe_not_equal, { name: 0, filters: 6, items: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShorthandTable",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[7] === undefined && !('items' in props)) {
    			console.warn("<ShorthandTable> was created without expected prop 'items'");
    		}
    	}

    	get name() {
    		throw new Error("<ShorthandTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ShorthandTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filters() {
    		throw new Error("<ShorthandTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filters(value) {
    		throw new Error("<ShorthandTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<ShorthandTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<ShorthandTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Layouts.svelte generated by Svelte v3.46.4 */
    const file$5 = "src/views/Layouts.svelte";

    function create_fragment$a(ctx) {
    	let div24;
    	let div5;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div9;
    	let div6;
    	let t5;
    	let div7;
    	let t6;
    	let div8;
    	let t7;
    	let shorthandtable;
    	let t8;
    	let div23;
    	let div14;
    	let div12;
    	let div10;
    	let t9;
    	let span0;
    	let t10;
    	let div11;
    	let t11;
    	let span1;
    	let t12;
    	let div13;
    	let t13;
    	let span2;
    	let t14;
    	let div21;
    	let div15;
    	let t15;
    	let span3;
    	let t16;
    	let div16;
    	let t17;
    	let span4;
    	let t18;
    	let div19;
    	let div17;
    	let t19;
    	let span5;
    	let t20;
    	let div18;
    	let t21;
    	let span6;
    	let t22;
    	let div20;
    	let t23;
    	let span7;
    	let t24;
    	let div22;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: [
    					'z-index',
    					'layout',
    					'alignments',
    					'spacer',
    					'flex-basis',
    					'example',
    					'transform'
    				],
    				name: "layouts"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div24 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div9 = element("div");
    			div6 = element("div");
    			t5 = space();
    			div7 = element("div");
    			t6 = space();
    			div8 = element("div");
    			t7 = space();
    			create_component(shorthandtable.$$.fragment);
    			t8 = space();
    			div23 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			t9 = space();
    			span0 = element("span");
    			t10 = space();
    			div11 = element("div");
    			t11 = space();
    			span1 = element("span");
    			t12 = space();
    			div13 = element("div");
    			t13 = space();
    			span2 = element("span");
    			t14 = space();
    			div21 = element("div");
    			div15 = element("div");
    			t15 = space();
    			span3 = element("span");
    			t16 = space();
    			div16 = element("div");
    			t17 = space();
    			span4 = element("span");
    			t18 = space();
    			div19 = element("div");
    			div17 = element("div");
    			t19 = space();
    			span5 = element("span");
    			t20 = space();
    			div18 = element("div");
    			t21 = space();
    			span6 = element("span");
    			t22 = space();
    			div20 = element("div");
    			t23 = space();
    			span7 = element("span");
    			t24 = space();
    			div22 = element("div");
    			attr_dev(div0, "class", "cross ok p1 b1-solid y-flex-start");
    			add_location(div0, file$5, 9, 2, 206);
    			attr_dev(div1, "class", "spacer");
    			add_location(div1, file$5, 10, 2, 262);
    			attr_dev(div2, "class", "cross p1 success b1-solid y-stretch");
    			add_location(div2, file$5, 11, 2, 287);
    			attr_dev(div3, "class", "spacer");
    			add_location(div3, file$5, 12, 2, 345);
    			attr_dev(div4, "class", "cross p1 alert b1-solid y-flex-end");
    			add_location(div4, file$5, 13, 2, 370);
    			attr_dev(div5, "class", "b1-solid mtb1 cross error minh10em flex row-center-center cs0-8");
    			add_location(div5, file$5, 7, 1, 125);
    			attr_dev(div6, "class", "p1 grow b1-solid minw50pc");
    			add_location(div6, file$5, 18, 2, 496);
    			attr_dev(div7, "class", "p1 grow b1-solid");
    			add_location(div7, file$5, 19, 2, 544);
    			attr_dev(div8, "class", "p1 grow b1-solid");
    			add_location(div8, file$5, 20, 2, 583);
    			attr_dev(div9, "class", "flex row-center-stretch minh10em auto-space");
    			add_location(div9, file$5, 16, 1, 435);
    			attr_dev(div10, "class", "grow b1-dotted cross");
    			add_location(div10, file$5, 31, 4, 905);
    			attr_dev(span0, "class", "spacer s4 cross error");
    			add_location(span0, file$5, 34, 4, 961);
    			attr_dev(div11, "class", "grow b1-dotted cross");
    			add_location(div11, file$5, 35, 4, 1004);
    			attr_dev(div12, "class", "grow b1-dotted flex flex-row");
    			add_location(div12, file$5, 29, 3, 853);
    			attr_dev(span1, "class", "spacer s4 cross error");
    			add_location(span1, file$5, 39, 3, 1069);
    			attr_dev(div13, "class", "grow b1-dotted cross");
    			add_location(div13, file$5, 40, 3, 1111);
    			attr_dev(div14, "class", "flex b1-dashed grow w40 flex-column");
    			add_location(div14, file$5, 27, 2, 796);
    			attr_dev(span2, "class", "spacer s6 cross error");
    			add_location(span2, file$5, 44, 2, 1172);
    			attr_dev(div15, "class", "grow b1-dotted cross");
    			add_location(div15, file$5, 46, 3, 1262);
    			attr_dev(span3, "class", "spacer s4 cross error");
    			add_location(span3, file$5, 49, 3, 1315);
    			attr_dev(div16, "class", "grow b1-dotted cross");
    			add_location(div16, file$5, 50, 3, 1357);
    			attr_dev(span4, "class", "spacer s4 cross error");
    			add_location(span4, file$5, 53, 3, 1410);
    			attr_dev(div17, "class", "cross grow");
    			add_location(div17, file$5, 55, 4, 1502);
    			attr_dev(span5, "class", "spacer s4 cross error");
    			add_location(span5, file$5, 56, 4, 1533);
    			attr_dev(div18, "class", "cross grow");
    			add_location(div18, file$5, 57, 4, 1576);
    			attr_dev(div19, "class", "grow b1-dotted flex flex-column");
    			add_location(div19, file$5, 54, 3, 1452);
    			attr_dev(span6, "class", "spacer s4 cross error");
    			add_location(span6, file$5, 59, 3, 1616);
    			attr_dev(div20, "class", "grow b1-dotted cross");
    			add_location(div20, file$5, 60, 3, 1658);
    			attr_dev(div21, "class", "flex flex-column b1-dashed grow");
    			add_location(div21, file$5, 45, 2, 1213);
    			attr_dev(span7, "class", "spacer s8 cross error");
    			add_location(span7, file$5, 64, 2, 1719);
    			attr_dev(div22, "class", "flex b1-dashed w20 cross");
    			add_location(div22, file$5, 65, 2, 1760);
    			attr_dev(div23, "class", "flex flex-row grow");
    			add_location(div23, file$5, 26, 1, 761);
    			attr_dev(div24, "class", "flex flex-column grow");
    			add_location(div24, file$5, 6, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div24, anchor);
    			append_dev(div24, div5);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			append_dev(div5, t1);
    			append_dev(div5, div2);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div24, t4);
    			append_dev(div24, div9);
    			append_dev(div9, div6);
    			append_dev(div9, t5);
    			append_dev(div9, div7);
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div24, t7);
    			mount_component(shorthandtable, div24, null);
    			append_dev(div24, t8);
    			append_dev(div24, div23);
    			append_dev(div23, div14);
    			append_dev(div14, div12);
    			append_dev(div12, div10);
    			append_dev(div12, t9);
    			append_dev(div12, span0);
    			append_dev(div12, t10);
    			append_dev(div12, div11);
    			append_dev(div14, t11);
    			append_dev(div14, span1);
    			append_dev(div14, t12);
    			append_dev(div14, div13);
    			append_dev(div23, t13);
    			append_dev(div23, span2);
    			append_dev(div23, t14);
    			append_dev(div23, div21);
    			append_dev(div21, div15);
    			append_dev(div21, t15);
    			append_dev(div21, span3);
    			append_dev(div21, t16);
    			append_dev(div21, div16);
    			append_dev(div21, t17);
    			append_dev(div21, span4);
    			append_dev(div21, t18);
    			append_dev(div21, div19);
    			append_dev(div19, div17);
    			append_dev(div19, t19);
    			append_dev(div19, span5);
    			append_dev(div19, t20);
    			append_dev(div19, div18);
    			append_dev(div21, t21);
    			append_dev(div21, span6);
    			append_dev(div21, t22);
    			append_dev(div21, div20);
    			append_dev(div23, t23);
    			append_dev(div23, span7);
    			append_dev(div23, t24);
    			append_dev(div23, div22);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div24);
    			destroy_component(shorthandtable);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Layouts', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Layouts> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Layouts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layouts",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/views/FormFields.svelte generated by Svelte v3.46.4 */

    function create_fragment$9(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: { filters: ['form-fields'], name: "basic" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(shorthandtable.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(shorthandtable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shorthandtable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormFields', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FormFields> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class FormFields extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormFields",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/views/Type.svelte generated by Svelte v3.46.4 */

    function create_fragment$8(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: ['font-size', 'font-family'],
    				name: "type"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(shorthandtable.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(shorthandtable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shorthandtable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Type', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Type> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Type extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Type",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var prism = createCommonjsModule(function (module) {
    /* **********************************************
         Begin prism-core.js
    ********************************************** */

    /// <reference lib="WebWorker"/>

    var _self = (typeof window !== 'undefined')
    	? window   // if in browser
    	: (
    		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
    			? self // if in worker
    			: {}   // if in node js
    	);

    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var Prism = (function (_self) {

    	// Private helper vars
    	var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
    	var uniqueId = 0;

    	// The grammar object for plaintext
    	var plainTextGrammar = {};


    	var _ = {
    		/**
    		 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
    		 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
    		 * additional languages or plugins yourself.
    		 *
    		 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
    		 *
    		 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
    		 * empty Prism object into the global scope before loading the Prism script like this:
    		 *
    		 * ```js
    		 * window.Prism = window.Prism || {};
    		 * Prism.manual = true;
    		 * // add a new <script> to load Prism's script
    		 * ```
    		 *
    		 * @default false
    		 * @type {boolean}
    		 * @memberof Prism
    		 * @public
    		 */
    		manual: _self.Prism && _self.Prism.manual,
    		/**
    		 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
    		 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
    		 * own worker, you don't want it to do this.
    		 *
    		 * By setting this value to `true`, Prism will not add its own listeners to the worker.
    		 *
    		 * You obviously have to change this value before Prism executes. To do this, you can add an
    		 * empty Prism object into the global scope before loading the Prism script like this:
    		 *
    		 * ```js
    		 * window.Prism = window.Prism || {};
    		 * Prism.disableWorkerMessageHandler = true;
    		 * // Load Prism's script
    		 * ```
    		 *
    		 * @default false
    		 * @type {boolean}
    		 * @memberof Prism
    		 * @public
    		 */
    		disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

    		/**
    		 * A namespace for utility methods.
    		 *
    		 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
    		 * change or disappear at any time.
    		 *
    		 * @namespace
    		 * @memberof Prism
    		 */
    		util: {
    			encode: function encode(tokens) {
    				if (tokens instanceof Token) {
    					return new Token(tokens.type, encode(tokens.content), tokens.alias);
    				} else if (Array.isArray(tokens)) {
    					return tokens.map(encode);
    				} else {
    					return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
    				}
    			},

    			/**
    			 * Returns the name of the type of the given value.
    			 *
    			 * @param {any} o
    			 * @returns {string}
    			 * @example
    			 * type(null)      === 'Null'
    			 * type(undefined) === 'Undefined'
    			 * type(123)       === 'Number'
    			 * type('foo')     === 'String'
    			 * type(true)      === 'Boolean'
    			 * type([1, 2])    === 'Array'
    			 * type({})        === 'Object'
    			 * type(String)    === 'Function'
    			 * type(/abc+/)    === 'RegExp'
    			 */
    			type: function (o) {
    				return Object.prototype.toString.call(o).slice(8, -1);
    			},

    			/**
    			 * Returns a unique number for the given object. Later calls will still return the same number.
    			 *
    			 * @param {Object} obj
    			 * @returns {number}
    			 */
    			objId: function (obj) {
    				if (!obj['__id']) {
    					Object.defineProperty(obj, '__id', { value: ++uniqueId });
    				}
    				return obj['__id'];
    			},

    			/**
    			 * Creates a deep clone of the given object.
    			 *
    			 * The main intended use of this function is to clone language definitions.
    			 *
    			 * @param {T} o
    			 * @param {Record<number, any>} [visited]
    			 * @returns {T}
    			 * @template T
    			 */
    			clone: function deepClone(o, visited) {
    				visited = visited || {};

    				var clone; var id;
    				switch (_.util.type(o)) {
    					case 'Object':
    						id = _.util.objId(o);
    						if (visited[id]) {
    							return visited[id];
    						}
    						clone = /** @type {Record<string, any>} */ ({});
    						visited[id] = clone;

    						for (var key in o) {
    							if (o.hasOwnProperty(key)) {
    								clone[key] = deepClone(o[key], visited);
    							}
    						}

    						return /** @type {any} */ (clone);

    					case 'Array':
    						id = _.util.objId(o);
    						if (visited[id]) {
    							return visited[id];
    						}
    						clone = [];
    						visited[id] = clone;

    						(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
    							clone[i] = deepClone(v, visited);
    						});

    						return /** @type {any} */ (clone);

    					default:
    						return o;
    				}
    			},

    			/**
    			 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
    			 *
    			 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
    			 *
    			 * @param {Element} element
    			 * @returns {string}
    			 */
    			getLanguage: function (element) {
    				while (element) {
    					var m = lang.exec(element.className);
    					if (m) {
    						return m[1].toLowerCase();
    					}
    					element = element.parentElement;
    				}
    				return 'none';
    			},

    			/**
    			 * Sets the Prism `language-xxxx` class of the given element.
    			 *
    			 * @param {Element} element
    			 * @param {string} language
    			 * @returns {void}
    			 */
    			setLanguage: function (element, language) {
    				// remove all `language-xxxx` classes
    				// (this might leave behind a leading space)
    				element.className = element.className.replace(RegExp(lang, 'gi'), '');

    				// add the new `language-xxxx` class
    				// (using `classList` will automatically clean up spaces for us)
    				element.classList.add('language-' + language);
    			},

    			/**
    			 * Returns the script element that is currently executing.
    			 *
    			 * This does __not__ work for line script element.
    			 *
    			 * @returns {HTMLScriptElement | null}
    			 */
    			currentScript: function () {
    				if (typeof document === 'undefined') {
    					return null;
    				}
    				if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
    					return /** @type {any} */ (document.currentScript);
    				}

    				// IE11 workaround
    				// we'll get the src of the current script by parsing IE11's error stack trace
    				// this will not work for inline scripts

    				try {
    					throw new Error();
    				} catch (err) {
    					// Get file src url from stack. Specifically works with the format of stack traces in IE.
    					// A stack will look like this:
    					//
    					// Error
    					//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
    					//    at Global code (http://localhost/components/prism-core.js:606:1)

    					var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
    					if (src) {
    						var scripts = document.getElementsByTagName('script');
    						for (var i in scripts) {
    							if (scripts[i].src == src) {
    								return scripts[i];
    							}
    						}
    					}
    					return null;
    				}
    			},

    			/**
    			 * Returns whether a given class is active for `element`.
    			 *
    			 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
    			 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
    			 * given class is just the given class with a `no-` prefix.
    			 *
    			 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
    			 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
    			 * ancestors have the given class or the negated version of it, then the default activation will be returned.
    			 *
    			 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
    			 * version of it, the class is considered active.
    			 *
    			 * @param {Element} element
    			 * @param {string} className
    			 * @param {boolean} [defaultActivation=false]
    			 * @returns {boolean}
    			 */
    			isActive: function (element, className, defaultActivation) {
    				var no = 'no-' + className;

    				while (element) {
    					var classList = element.classList;
    					if (classList.contains(className)) {
    						return true;
    					}
    					if (classList.contains(no)) {
    						return false;
    					}
    					element = element.parentElement;
    				}
    				return !!defaultActivation;
    			}
    		},

    		/**
    		 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
    		 *
    		 * @namespace
    		 * @memberof Prism
    		 * @public
    		 */
    		languages: {
    			/**
    			 * The grammar for plain, unformatted text.
    			 */
    			plain: plainTextGrammar,
    			plaintext: plainTextGrammar,
    			text: plainTextGrammar,
    			txt: plainTextGrammar,

    			/**
    			 * Creates a deep copy of the language with the given id and appends the given tokens.
    			 *
    			 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
    			 * will be overwritten at its original position.
    			 *
    			 * ## Best practices
    			 *
    			 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
    			 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
    			 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
    			 *
    			 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
    			 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
    			 *
    			 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
    			 * @param {Grammar} redef The new tokens to append.
    			 * @returns {Grammar} The new language created.
    			 * @public
    			 * @example
    			 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
    			 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
    			 *     // at its original position
    			 *     'comment': { ... },
    			 *     // CSS doesn't have a 'color' token, so this token will be appended
    			 *     'color': /\b(?:red|green|blue)\b/
    			 * });
    			 */
    			extend: function (id, redef) {
    				var lang = _.util.clone(_.languages[id]);

    				for (var key in redef) {
    					lang[key] = redef[key];
    				}

    				return lang;
    			},

    			/**
    			 * Inserts tokens _before_ another token in a language definition or any other grammar.
    			 *
    			 * ## Usage
    			 *
    			 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
    			 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
    			 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
    			 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
    			 * this:
    			 *
    			 * ```js
    			 * Prism.languages.markup.style = {
    			 *     // token
    			 * };
    			 * ```
    			 *
    			 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
    			 * before existing tokens. For the CSS example above, you would use it like this:
    			 *
    			 * ```js
    			 * Prism.languages.insertBefore('markup', 'cdata', {
    			 *     'style': {
    			 *         // token
    			 *     }
    			 * });
    			 * ```
    			 *
    			 * ## Special cases
    			 *
    			 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
    			 * will be ignored.
    			 *
    			 * This behavior can be used to insert tokens after `before`:
    			 *
    			 * ```js
    			 * Prism.languages.insertBefore('markup', 'comment', {
    			 *     'comment': Prism.languages.markup.comment,
    			 *     // tokens after 'comment'
    			 * });
    			 * ```
    			 *
    			 * ## Limitations
    			 *
    			 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
    			 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
    			 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
    			 * deleting properties which is necessary to insert at arbitrary positions.
    			 *
    			 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
    			 * Instead, it will create a new object and replace all references to the target object with the new one. This
    			 * can be done without temporarily deleting properties, so the iteration order is well-defined.
    			 *
    			 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
    			 * you hold the target object in a variable, then the value of the variable will not change.
    			 *
    			 * ```js
    			 * var oldMarkup = Prism.languages.markup;
    			 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
    			 *
    			 * assert(oldMarkup !== Prism.languages.markup);
    			 * assert(newMarkup === Prism.languages.markup);
    			 * ```
    			 *
    			 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
    			 * object to be modified.
    			 * @param {string} before The key to insert before.
    			 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
    			 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
    			 * object to be modified.
    			 *
    			 * Defaults to `Prism.languages`.
    			 * @returns {Grammar} The new grammar object.
    			 * @public
    			 */
    			insertBefore: function (inside, before, insert, root) {
    				root = root || /** @type {any} */ (_.languages);
    				var grammar = root[inside];
    				/** @type {Grammar} */
    				var ret = {};

    				for (var token in grammar) {
    					if (grammar.hasOwnProperty(token)) {

    						if (token == before) {
    							for (var newToken in insert) {
    								if (insert.hasOwnProperty(newToken)) {
    									ret[newToken] = insert[newToken];
    								}
    							}
    						}

    						// Do not insert token which also occur in insert. See #1525
    						if (!insert.hasOwnProperty(token)) {
    							ret[token] = grammar[token];
    						}
    					}
    				}

    				var old = root[inside];
    				root[inside] = ret;

    				// Update references in other language definitions
    				_.languages.DFS(_.languages, function (key, value) {
    					if (value === old && key != inside) {
    						this[key] = ret;
    					}
    				});

    				return ret;
    			},

    			// Traverse a language definition with Depth First Search
    			DFS: function DFS(o, callback, type, visited) {
    				visited = visited || {};

    				var objId = _.util.objId;

    				for (var i in o) {
    					if (o.hasOwnProperty(i)) {
    						callback.call(o, i, o[i], type || i);

    						var property = o[i];
    						var propertyType = _.util.type(property);

    						if (propertyType === 'Object' && !visited[objId(property)]) {
    							visited[objId(property)] = true;
    							DFS(property, callback, null, visited);
    						} else if (propertyType === 'Array' && !visited[objId(property)]) {
    							visited[objId(property)] = true;
    							DFS(property, callback, i, visited);
    						}
    					}
    				}
    			}
    		},

    		plugins: {},

    		/**
    		 * This is the most high-level function in Prism’s API.
    		 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
    		 * each one of them.
    		 *
    		 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
    		 *
    		 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
    		 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
    		 * @memberof Prism
    		 * @public
    		 */
    		highlightAll: function (async, callback) {
    			_.highlightAllUnder(document, async, callback);
    		},

    		/**
    		 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
    		 * {@link Prism.highlightElement} on each one of them.
    		 *
    		 * The following hooks will be run:
    		 * 1. `before-highlightall`
    		 * 2. `before-all-elements-highlight`
    		 * 3. All hooks of {@link Prism.highlightElement} for each element.
    		 *
    		 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
    		 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
    		 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
    		 * @memberof Prism
    		 * @public
    		 */
    		highlightAllUnder: function (container, async, callback) {
    			var env = {
    				callback: callback,
    				container: container,
    				selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
    			};

    			_.hooks.run('before-highlightall', env);

    			env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

    			_.hooks.run('before-all-elements-highlight', env);

    			for (var i = 0, element; (element = env.elements[i++]);) {
    				_.highlightElement(element, async === true, env.callback);
    			}
    		},

    		/**
    		 * Highlights the code inside a single element.
    		 *
    		 * The following hooks will be run:
    		 * 1. `before-sanity-check`
    		 * 2. `before-highlight`
    		 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
    		 * 4. `before-insert`
    		 * 5. `after-highlight`
    		 * 6. `complete`
    		 *
    		 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
    		 * the element's language.
    		 *
    		 * @param {Element} element The element containing the code.
    		 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
    		 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
    		 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
    		 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
    		 *
    		 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
    		 * asynchronous highlighting to work. You can build your own bundle on the
    		 * [Download page](https://prismjs.com/download.html).
    		 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
    		 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
    		 * @memberof Prism
    		 * @public
    		 */
    		highlightElement: function (element, async, callback) {
    			// Find language
    			var language = _.util.getLanguage(element);
    			var grammar = _.languages[language];

    			// Set language on the element, if not present
    			_.util.setLanguage(element, language);

    			// Set language on the parent, for styling
    			var parent = element.parentElement;
    			if (parent && parent.nodeName.toLowerCase() === 'pre') {
    				_.util.setLanguage(parent, language);
    			}

    			var code = element.textContent;

    			var env = {
    				element: element,
    				language: language,
    				grammar: grammar,
    				code: code
    			};

    			function insertHighlightedCode(highlightedCode) {
    				env.highlightedCode = highlightedCode;

    				_.hooks.run('before-insert', env);

    				env.element.innerHTML = env.highlightedCode;

    				_.hooks.run('after-highlight', env);
    				_.hooks.run('complete', env);
    				callback && callback.call(env.element);
    			}

    			_.hooks.run('before-sanity-check', env);

    			// plugins may change/add the parent/element
    			parent = env.element.parentElement;
    			if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
    				parent.setAttribute('tabindex', '0');
    			}

    			if (!env.code) {
    				_.hooks.run('complete', env);
    				callback && callback.call(env.element);
    				return;
    			}

    			_.hooks.run('before-highlight', env);

    			if (!env.grammar) {
    				insertHighlightedCode(_.util.encode(env.code));
    				return;
    			}

    			if (async && _self.Worker) {
    				var worker = new Worker(_.filename);

    				worker.onmessage = function (evt) {
    					insertHighlightedCode(evt.data);
    				};

    				worker.postMessage(JSON.stringify({
    					language: env.language,
    					code: env.code,
    					immediateClose: true
    				}));
    			} else {
    				insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
    			}
    		},

    		/**
    		 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
    		 * and the language definitions to use, and returns a string with the HTML produced.
    		 *
    		 * The following hooks will be run:
    		 * 1. `before-tokenize`
    		 * 2. `after-tokenize`
    		 * 3. `wrap`: On each {@link Token}.
    		 *
    		 * @param {string} text A string with the code to be highlighted.
    		 * @param {Grammar} grammar An object containing the tokens to use.
    		 *
    		 * Usually a language definition like `Prism.languages.markup`.
    		 * @param {string} language The name of the language definition passed to `grammar`.
    		 * @returns {string} The highlighted HTML.
    		 * @memberof Prism
    		 * @public
    		 * @example
    		 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
    		 */
    		highlight: function (text, grammar, language) {
    			var env = {
    				code: text,
    				grammar: grammar,
    				language: language
    			};
    			_.hooks.run('before-tokenize', env);
    			if (!env.grammar) {
    				throw new Error('The language "' + env.language + '" has no grammar.');
    			}
    			env.tokens = _.tokenize(env.code, env.grammar);
    			_.hooks.run('after-tokenize', env);
    			return Token.stringify(_.util.encode(env.tokens), env.language);
    		},

    		/**
    		 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
    		 * and the language definitions to use, and returns an array with the tokenized code.
    		 *
    		 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
    		 *
    		 * This method could be useful in other contexts as well, as a very crude parser.
    		 *
    		 * @param {string} text A string with the code to be highlighted.
    		 * @param {Grammar} grammar An object containing the tokens to use.
    		 *
    		 * Usually a language definition like `Prism.languages.markup`.
    		 * @returns {TokenStream} An array of strings and tokens, a token stream.
    		 * @memberof Prism
    		 * @public
    		 * @example
    		 * let code = `var foo = 0;`;
    		 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
    		 * tokens.forEach(token => {
    		 *     if (token instanceof Prism.Token && token.type === 'number') {
    		 *         console.log(`Found numeric literal: ${token.content}`);
    		 *     }
    		 * });
    		 */
    		tokenize: function (text, grammar) {
    			var rest = grammar.rest;
    			if (rest) {
    				for (var token in rest) {
    					grammar[token] = rest[token];
    				}

    				delete grammar.rest;
    			}

    			var tokenList = new LinkedList();
    			addAfter(tokenList, tokenList.head, text);

    			matchGrammar(text, tokenList, grammar, tokenList.head, 0);

    			return toArray(tokenList);
    		},

    		/**
    		 * @namespace
    		 * @memberof Prism
    		 * @public
    		 */
    		hooks: {
    			all: {},

    			/**
    			 * Adds the given callback to the list of callbacks for the given hook.
    			 *
    			 * The callback will be invoked when the hook it is registered for is run.
    			 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
    			 *
    			 * One callback function can be registered to multiple hooks and the same hook multiple times.
    			 *
    			 * @param {string} name The name of the hook.
    			 * @param {HookCallback} callback The callback function which is given environment variables.
    			 * @public
    			 */
    			add: function (name, callback) {
    				var hooks = _.hooks.all;

    				hooks[name] = hooks[name] || [];

    				hooks[name].push(callback);
    			},

    			/**
    			 * Runs a hook invoking all registered callbacks with the given environment variables.
    			 *
    			 * Callbacks will be invoked synchronously and in the order in which they were registered.
    			 *
    			 * @param {string} name The name of the hook.
    			 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
    			 * @public
    			 */
    			run: function (name, env) {
    				var callbacks = _.hooks.all[name];

    				if (!callbacks || !callbacks.length) {
    					return;
    				}

    				for (var i = 0, callback; (callback = callbacks[i++]);) {
    					callback(env);
    				}
    			}
    		},

    		Token: Token
    	};
    	_self.Prism = _;


    	// Typescript note:
    	// The following can be used to import the Token type in JSDoc:
    	//
    	//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

    	/**
    	 * Creates a new token.
    	 *
    	 * @param {string} type See {@link Token#type type}
    	 * @param {string | TokenStream} content See {@link Token#content content}
    	 * @param {string|string[]} [alias] The alias(es) of the token.
    	 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
    	 * @class
    	 * @global
    	 * @public
    	 */
    	function Token(type, content, alias, matchedStr) {
    		/**
    		 * The type of the token.
    		 *
    		 * This is usually the key of a pattern in a {@link Grammar}.
    		 *
    		 * @type {string}
    		 * @see GrammarToken
    		 * @public
    		 */
    		this.type = type;
    		/**
    		 * The strings or tokens contained by this token.
    		 *
    		 * This will be a token stream if the pattern matched also defined an `inside` grammar.
    		 *
    		 * @type {string | TokenStream}
    		 * @public
    		 */
    		this.content = content;
    		/**
    		 * The alias(es) of the token.
    		 *
    		 * @type {string|string[]}
    		 * @see GrammarToken
    		 * @public
    		 */
    		this.alias = alias;
    		// Copy of the full string this token was created from
    		this.length = (matchedStr || '').length | 0;
    	}

    	/**
    	 * A token stream is an array of strings and {@link Token Token} objects.
    	 *
    	 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
    	 * them.
    	 *
    	 * 1. No adjacent strings.
    	 * 2. No empty strings.
    	 *
    	 *    The only exception here is the token stream that only contains the empty string and nothing else.
    	 *
    	 * @typedef {Array<string | Token>} TokenStream
    	 * @global
    	 * @public
    	 */

    	/**
    	 * Converts the given token or token stream to an HTML representation.
    	 *
    	 * The following hooks will be run:
    	 * 1. `wrap`: On each {@link Token}.
    	 *
    	 * @param {string | Token | TokenStream} o The token or token stream to be converted.
    	 * @param {string} language The name of current language.
    	 * @returns {string} The HTML representation of the token or token stream.
    	 * @memberof Token
    	 * @static
    	 */
    	Token.stringify = function stringify(o, language) {
    		if (typeof o == 'string') {
    			return o;
    		}
    		if (Array.isArray(o)) {
    			var s = '';
    			o.forEach(function (e) {
    				s += stringify(e, language);
    			});
    			return s;
    		}

    		var env = {
    			type: o.type,
    			content: stringify(o.content, language),
    			tag: 'span',
    			classes: ['token', o.type],
    			attributes: {},
    			language: language
    		};

    		var aliases = o.alias;
    		if (aliases) {
    			if (Array.isArray(aliases)) {
    				Array.prototype.push.apply(env.classes, aliases);
    			} else {
    				env.classes.push(aliases);
    			}
    		}

    		_.hooks.run('wrap', env);

    		var attributes = '';
    		for (var name in env.attributes) {
    			attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
    		}

    		return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
    	};

    	/**
    	 * @param {RegExp} pattern
    	 * @param {number} pos
    	 * @param {string} text
    	 * @param {boolean} lookbehind
    	 * @returns {RegExpExecArray | null}
    	 */
    	function matchPattern(pattern, pos, text, lookbehind) {
    		pattern.lastIndex = pos;
    		var match = pattern.exec(text);
    		if (match && lookbehind && match[1]) {
    			// change the match to remove the text matched by the Prism lookbehind group
    			var lookbehindLength = match[1].length;
    			match.index += lookbehindLength;
    			match[0] = match[0].slice(lookbehindLength);
    		}
    		return match;
    	}

    	/**
    	 * @param {string} text
    	 * @param {LinkedList<string | Token>} tokenList
    	 * @param {any} grammar
    	 * @param {LinkedListNode<string | Token>} startNode
    	 * @param {number} startPos
    	 * @param {RematchOptions} [rematch]
    	 * @returns {void}
    	 * @private
    	 *
    	 * @typedef RematchOptions
    	 * @property {string} cause
    	 * @property {number} reach
    	 */
    	function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
    		for (var token in grammar) {
    			if (!grammar.hasOwnProperty(token) || !grammar[token]) {
    				continue;
    			}

    			var patterns = grammar[token];
    			patterns = Array.isArray(patterns) ? patterns : [patterns];

    			for (var j = 0; j < patterns.length; ++j) {
    				if (rematch && rematch.cause == token + ',' + j) {
    					return;
    				}

    				var patternObj = patterns[j];
    				var inside = patternObj.inside;
    				var lookbehind = !!patternObj.lookbehind;
    				var greedy = !!patternObj.greedy;
    				var alias = patternObj.alias;

    				if (greedy && !patternObj.pattern.global) {
    					// Without the global flag, lastIndex won't work
    					var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
    					patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
    				}

    				/** @type {RegExp} */
    				var pattern = patternObj.pattern || patternObj;

    				for ( // iterate the token list and keep track of the current token/string position
    					var currentNode = startNode.next, pos = startPos;
    					currentNode !== tokenList.tail;
    					pos += currentNode.value.length, currentNode = currentNode.next
    				) {

    					if (rematch && pos >= rematch.reach) {
    						break;
    					}

    					var str = currentNode.value;

    					if (tokenList.length > text.length) {
    						// Something went terribly wrong, ABORT, ABORT!
    						return;
    					}

    					if (str instanceof Token) {
    						continue;
    					}

    					var removeCount = 1; // this is the to parameter of removeBetween
    					var match;

    					if (greedy) {
    						match = matchPattern(pattern, pos, text, lookbehind);
    						if (!match || match.index >= text.length) {
    							break;
    						}

    						var from = match.index;
    						var to = match.index + match[0].length;
    						var p = pos;

    						// find the node that contains the match
    						p += currentNode.value.length;
    						while (from >= p) {
    							currentNode = currentNode.next;
    							p += currentNode.value.length;
    						}
    						// adjust pos (and p)
    						p -= currentNode.value.length;
    						pos = p;

    						// the current node is a Token, then the match starts inside another Token, which is invalid
    						if (currentNode.value instanceof Token) {
    							continue;
    						}

    						// find the last node which is affected by this match
    						for (
    							var k = currentNode;
    							k !== tokenList.tail && (p < to || typeof k.value === 'string');
    							k = k.next
    						) {
    							removeCount++;
    							p += k.value.length;
    						}
    						removeCount--;

    						// replace with the new match
    						str = text.slice(pos, p);
    						match.index -= pos;
    					} else {
    						match = matchPattern(pattern, 0, str, lookbehind);
    						if (!match) {
    							continue;
    						}
    					}

    					// eslint-disable-next-line no-redeclare
    					var from = match.index;
    					var matchStr = match[0];
    					var before = str.slice(0, from);
    					var after = str.slice(from + matchStr.length);

    					var reach = pos + str.length;
    					if (rematch && reach > rematch.reach) {
    						rematch.reach = reach;
    					}

    					var removeFrom = currentNode.prev;

    					if (before) {
    						removeFrom = addAfter(tokenList, removeFrom, before);
    						pos += before.length;
    					}

    					removeRange(tokenList, removeFrom, removeCount);

    					var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
    					currentNode = addAfter(tokenList, removeFrom, wrapped);

    					if (after) {
    						addAfter(tokenList, currentNode, after);
    					}

    					if (removeCount > 1) {
    						// at least one Token object was removed, so we have to do some rematching
    						// this can only happen if the current pattern is greedy

    						/** @type {RematchOptions} */
    						var nestedRematch = {
    							cause: token + ',' + j,
    							reach: reach
    						};
    						matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

    						// the reach might have been extended because of the rematching
    						if (rematch && nestedRematch.reach > rematch.reach) {
    							rematch.reach = nestedRematch.reach;
    						}
    					}
    				}
    			}
    		}
    	}

    	/**
    	 * @typedef LinkedListNode
    	 * @property {T} value
    	 * @property {LinkedListNode<T> | null} prev The previous node.
    	 * @property {LinkedListNode<T> | null} next The next node.
    	 * @template T
    	 * @private
    	 */

    	/**
    	 * @template T
    	 * @private
    	 */
    	function LinkedList() {
    		/** @type {LinkedListNode<T>} */
    		var head = { value: null, prev: null, next: null };
    		/** @type {LinkedListNode<T>} */
    		var tail = { value: null, prev: head, next: null };
    		head.next = tail;

    		/** @type {LinkedListNode<T>} */
    		this.head = head;
    		/** @type {LinkedListNode<T>} */
    		this.tail = tail;
    		this.length = 0;
    	}

    	/**
    	 * Adds a new node with the given value to the list.
    	 *
    	 * @param {LinkedList<T>} list
    	 * @param {LinkedListNode<T>} node
    	 * @param {T} value
    	 * @returns {LinkedListNode<T>} The added node.
    	 * @template T
    	 */
    	function addAfter(list, node, value) {
    		// assumes that node != list.tail && values.length >= 0
    		var next = node.next;

    		var newNode = { value: value, prev: node, next: next };
    		node.next = newNode;
    		next.prev = newNode;
    		list.length++;

    		return newNode;
    	}
    	/**
    	 * Removes `count` nodes after the given node. The given node will not be removed.
    	 *
    	 * @param {LinkedList<T>} list
    	 * @param {LinkedListNode<T>} node
    	 * @param {number} count
    	 * @template T
    	 */
    	function removeRange(list, node, count) {
    		var next = node.next;
    		for (var i = 0; i < count && next !== list.tail; i++) {
    			next = next.next;
    		}
    		node.next = next;
    		next.prev = node;
    		list.length -= i;
    	}
    	/**
    	 * @param {LinkedList<T>} list
    	 * @returns {T[]}
    	 * @template T
    	 */
    	function toArray(list) {
    		var array = [];
    		var node = list.head.next;
    		while (node !== list.tail) {
    			array.push(node.value);
    			node = node.next;
    		}
    		return array;
    	}


    	if (!_self.document) {
    		if (!_self.addEventListener) {
    			// in Node.js
    			return _;
    		}

    		if (!_.disableWorkerMessageHandler) {
    			// In worker
    			_self.addEventListener('message', function (evt) {
    				var message = JSON.parse(evt.data);
    				var lang = message.language;
    				var code = message.code;
    				var immediateClose = message.immediateClose;

    				_self.postMessage(_.highlight(code, _.languages[lang], lang));
    				if (immediateClose) {
    					_self.close();
    				}
    			}, false);
    		}

    		return _;
    	}

    	// Get current script and highlight
    	var script = _.util.currentScript();

    	if (script) {
    		_.filename = script.src;

    		if (script.hasAttribute('data-manual')) {
    			_.manual = true;
    		}
    	}

    	function highlightAutomaticallyCallback() {
    		if (!_.manual) {
    			_.highlightAll();
    		}
    	}

    	if (!_.manual) {
    		// If the document state is "loading", then we'll use DOMContentLoaded.
    		// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
    		// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
    		// might take longer one animation frame to execute which can create a race condition where only some plugins have
    		// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
    		// See https://github.com/PrismJS/prism/issues/2102
    		var readyState = document.readyState;
    		if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
    			document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
    		} else {
    			if (window.requestAnimationFrame) {
    				window.requestAnimationFrame(highlightAutomaticallyCallback);
    			} else {
    				window.setTimeout(highlightAutomaticallyCallback, 16);
    			}
    		}
    	}

    	return _;

    }(_self));

    if (module.exports) {
    	module.exports = Prism;
    }

    // hack for components to work correctly in node.js
    if (typeof commonjsGlobal !== 'undefined') {
    	commonjsGlobal.Prism = Prism;
    }

    // some additional documentation/types

    /**
     * The expansion of a simple `RegExp` literal to support additional properties.
     *
     * @typedef GrammarToken
     * @property {RegExp} pattern The regular expression of the token.
     * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
     * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
     * @property {boolean} [greedy=false] Whether the token is greedy.
     * @property {string|string[]} [alias] An optional alias or list of aliases.
     * @property {Grammar} [inside] The nested grammar of this token.
     *
     * The `inside` grammar will be used to tokenize the text value of each token of this kind.
     *
     * This can be used to make nested and even recursive language definitions.
     *
     * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
     * each another.
     * @global
     * @public
     */

    /**
     * @typedef Grammar
     * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
     * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
     * @global
     * @public
     */

    /**
     * A function which will invoked after an element was successfully highlighted.
     *
     * @callback HighlightCallback
     * @param {Element} element The element successfully highlighted.
     * @returns {void}
     * @global
     * @public
     */

    /**
     * @callback HookCallback
     * @param {Object<string, any>} env The environment variables of the hook.
     * @returns {void}
     * @global
     * @public
     */


    /* **********************************************
         Begin prism-markup.js
    ********************************************** */

    Prism.languages.markup = {
    	'comment': {
    		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
    		greedy: true
    	},
    	'prolog': {
    		pattern: /<\?[\s\S]+?\?>/,
    		greedy: true
    	},
    	'doctype': {
    		// https://www.w3.org/TR/xml/#NT-doctypedecl
    		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    		greedy: true,
    		inside: {
    			'internal-subset': {
    				pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
    				lookbehind: true,
    				greedy: true,
    				inside: null // see below
    			},
    			'string': {
    				pattern: /"[^"]*"|'[^']*'/,
    				greedy: true
    			},
    			'punctuation': /^<!|>$|[[\]]/,
    			'doctype-tag': /^DOCTYPE/i,
    			'name': /[^\s<>'"]+/
    		}
    	},
    	'cdata': {
    		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    		greedy: true
    	},
    	'tag': {
    		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    		greedy: true,
    		inside: {
    			'tag': {
    				pattern: /^<\/?[^\s>\/]+/,
    				inside: {
    					'punctuation': /^<\/?/,
    					'namespace': /^[^\s>\/:]+:/
    				}
    			},
    			'special-attr': [],
    			'attr-value': {
    				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
    				inside: {
    					'punctuation': [
    						{
    							pattern: /^=/,
    							alias: 'attr-equals'
    						},
    						/"|'/
    					]
    				}
    			},
    			'punctuation': /\/?>/,
    			'attr-name': {
    				pattern: /[^\s>\/]+/,
    				inside: {
    					'namespace': /^[^\s>\/:]+:/
    				}
    			}

    		}
    	},
    	'entity': [
    		{
    			pattern: /&[\da-z]{1,8};/i,
    			alias: 'named-entity'
    		},
    		/&#x?[\da-f]{1,8};/i
    	]
    };

    Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
    	Prism.languages.markup['entity'];
    Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

    // Plugin to make entity title show the real entity, idea by Roman Komarov
    Prism.hooks.add('wrap', function (env) {

    	if (env.type === 'entity') {
    		env.attributes['title'] = env.content.replace(/&amp;/, '&');
    	}
    });

    Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
    	/**
    	 * Adds an inlined language to markup.
    	 *
    	 * An example of an inlined language is CSS with `<style>` tags.
    	 *
    	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
    	 * case insensitive.
    	 * @param {string} lang The language key.
    	 * @example
    	 * addInlined('style', 'css');
    	 */
    	value: function addInlined(tagName, lang) {
    		var includedCdataInside = {};
    		includedCdataInside['language-' + lang] = {
    			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
    			lookbehind: true,
    			inside: Prism.languages[lang]
    		};
    		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

    		var inside = {
    			'included-cdata': {
    				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    				inside: includedCdataInside
    			}
    		};
    		inside['language-' + lang] = {
    			pattern: /[\s\S]+/,
    			inside: Prism.languages[lang]
    		};

    		var def = {};
    		def[tagName] = {
    			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
    			lookbehind: true,
    			greedy: true,
    			inside: inside
    		};

    		Prism.languages.insertBefore('markup', 'cdata', def);
    	}
    });
    Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
    	/**
    	 * Adds an pattern to highlight languages embedded in HTML attributes.
    	 *
    	 * An example of an inlined language is CSS with `style` attributes.
    	 *
    	 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
    	 * case insensitive.
    	 * @param {string} lang The language key.
    	 * @example
    	 * addAttribute('style', 'css');
    	 */
    	value: function (attrName, lang) {
    		Prism.languages.markup.tag.inside['special-attr'].push({
    			pattern: RegExp(
    				/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
    				'i'
    			),
    			lookbehind: true,
    			inside: {
    				'attr-name': /^[^\s=]+/,
    				'attr-value': {
    					pattern: /=[\s\S]+/,
    					inside: {
    						'value': {
    							pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
    							lookbehind: true,
    							alias: [lang, 'language-' + lang],
    							inside: Prism.languages[lang]
    						},
    						'punctuation': [
    							{
    								pattern: /^=/,
    								alias: 'attr-equals'
    							},
    							/"|'/
    						]
    					}
    				}
    			}
    		});
    	}
    });

    Prism.languages.html = Prism.languages.markup;
    Prism.languages.mathml = Prism.languages.markup;
    Prism.languages.svg = Prism.languages.markup;

    Prism.languages.xml = Prism.languages.extend('markup', {});
    Prism.languages.ssml = Prism.languages.xml;
    Prism.languages.atom = Prism.languages.xml;
    Prism.languages.rss = Prism.languages.xml;


    /* **********************************************
         Begin prism-css.js
    ********************************************** */

    (function (Prism) {

    	var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

    	Prism.languages.css = {
    		'comment': /\/\*[\s\S]*?\*\//,
    		'atrule': {
    			pattern: /@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/,
    			inside: {
    				'rule': /^@[\w-]+/,
    				'selector-function-argument': {
    					pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
    					lookbehind: true,
    					alias: 'selector'
    				},
    				'keyword': {
    					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
    					lookbehind: true
    				}
    				// See rest below
    			}
    		},
    		'url': {
    			// https://drafts.csswg.org/css-values-3/#urls
    			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
    			greedy: true,
    			inside: {
    				'function': /^url/i,
    				'punctuation': /^\(|\)$/,
    				'string': {
    					pattern: RegExp('^' + string.source + '$'),
    					alias: 'url'
    				}
    			}
    		},
    		'selector': {
    			pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
    			lookbehind: true
    		},
    		'string': {
    			pattern: string,
    			greedy: true
    		},
    		'property': {
    			pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
    			lookbehind: true
    		},
    		'important': /!important\b/i,
    		'function': {
    			pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
    			lookbehind: true
    		},
    		'punctuation': /[(){};:,]/
    	};

    	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

    	var markup = Prism.languages.markup;
    	if (markup) {
    		markup.tag.addInlined('style', 'css');
    		markup.tag.addAttribute('style', 'css');
    	}

    }(Prism));


    /* **********************************************
         Begin prism-clike.js
    ********************************************** */

    Prism.languages.clike = {
    	'comment': [
    		{
    			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
    			lookbehind: true,
    			greedy: true
    		},
    		{
    			pattern: /(^|[^\\:])\/\/.*/,
    			lookbehind: true,
    			greedy: true
    		}
    	],
    	'string': {
    		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    		greedy: true
    	},
    	'class-name': {
    		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
    		lookbehind: true,
    		inside: {
    			'punctuation': /[.\\]/
    		}
    	},
    	'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
    	'boolean': /\b(?:false|true)\b/,
    	'function': /\b\w+(?=\()/,
    	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
    	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    	'punctuation': /[{}[\];(),.:]/
    };


    /* **********************************************
         Begin prism-javascript.js
    ********************************************** */

    Prism.languages.javascript = Prism.languages.extend('clike', {
    	'class-name': [
    		Prism.languages.clike['class-name'],
    		{
    			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
    			lookbehind: true
    		}
    	],
    	'keyword': [
    		{
    			pattern: /((?:^|\})\s*)catch\b/,
    			lookbehind: true
    		},
    		{
    			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
    			lookbehind: true
    		},
    	],
    	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    	'number': {
    		pattern: RegExp(
    			/(^|[^\w$])/.source +
    			'(?:' +
    			(
    				// constant
    				/NaN|Infinity/.source +
    				'|' +
    				// binary integer
    				/0[bB][01]+(?:_[01]+)*n?/.source +
    				'|' +
    				// octal integer
    				/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
    				'|' +
    				// hexadecimal integer
    				/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
    				'|' +
    				// decimal bigint
    				/\d+(?:_\d+)*n/.source +
    				'|' +
    				// decimal number (integer or float) but no bigint
    				/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
    			) +
    			')' +
    			/(?![\w$])/.source
    		),
    		lookbehind: true
    	},
    	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
    });

    Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

    Prism.languages.insertBefore('javascript', 'keyword', {
    	'regex': {
    		pattern: RegExp(
    			// lookbehind
    			// eslint-disable-next-line regexp/no-dupe-characters-character-class
    			/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
    			// Regex pattern:
    			// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
    			// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
    			// with the only syntax, so we have to define 2 different regex patterns.
    			/\//.source +
    			'(?:' +
    			/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
    			'|' +
    			// `v` flag syntax. This supports 3 levels of nested character classes.
    			/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
    			')' +
    			// lookahead
    			/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
    		),
    		lookbehind: true,
    		greedy: true,
    		inside: {
    			'regex-source': {
    				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
    				lookbehind: true,
    				alias: 'language-regex',
    				inside: Prism.languages.regex
    			},
    			'regex-delimiter': /^\/|\/$/,
    			'regex-flags': /^[a-z]+$/,
    		}
    	},
    	// This must be declared before keyword because we use "function" inside the look-forward
    	'function-variable': {
    		pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
    		alias: 'function'
    	},
    	'parameter': [
    		{
    			pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		}
    	],
    	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
    });

    Prism.languages.insertBefore('javascript', 'string', {
    	'hashbang': {
    		pattern: /^#!.*/,
    		greedy: true,
    		alias: 'comment'
    	},
    	'template-string': {
    		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
    		greedy: true,
    		inside: {
    			'template-punctuation': {
    				pattern: /^`|`$/,
    				alias: 'string'
    			},
    			'interpolation': {
    				pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
    				lookbehind: true,
    				inside: {
    					'interpolation-punctuation': {
    						pattern: /^\$\{|\}$/,
    						alias: 'punctuation'
    					},
    					rest: Prism.languages.javascript
    				}
    			},
    			'string': /[\s\S]+/
    		}
    	},
    	'string-property': {
    		pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
    		lookbehind: true,
    		greedy: true,
    		alias: 'property'
    	}
    });

    Prism.languages.insertBefore('javascript', 'operator', {
    	'literal-property': {
    		pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
    		lookbehind: true,
    		alias: 'property'
    	},
    });

    if (Prism.languages.markup) {
    	Prism.languages.markup.tag.addInlined('script', 'javascript');

    	// add attribute support for all DOM events.
    	// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
    	Prism.languages.markup.tag.addAttribute(
    		/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
    		'javascript'
    	);
    }

    Prism.languages.js = Prism.languages.javascript;


    /* **********************************************
         Begin prism-file-highlight.js
    ********************************************** */

    (function () {

    	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
    		return;
    	}

    	// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
    	if (!Element.prototype.matches) {
    		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    	}

    	var LOADING_MESSAGE = 'Loading…';
    	var FAILURE_MESSAGE = function (status, message) {
    		return '✖ Error ' + status + ' while fetching file: ' + message;
    	};
    	var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

    	var EXTENSIONS = {
    		'js': 'javascript',
    		'py': 'python',
    		'rb': 'ruby',
    		'ps1': 'powershell',
    		'psm1': 'powershell',
    		'sh': 'bash',
    		'bat': 'batch',
    		'h': 'c',
    		'tex': 'latex'
    	};

    	var STATUS_ATTR = 'data-src-status';
    	var STATUS_LOADING = 'loading';
    	var STATUS_LOADED = 'loaded';
    	var STATUS_FAILED = 'failed';

    	var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
    		+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

    	/**
    	 * Loads the given file.
    	 *
    	 * @param {string} src The URL or path of the source file to load.
    	 * @param {(result: string) => void} success
    	 * @param {(reason: string) => void} error
    	 */
    	function loadFile(src, success, error) {
    		var xhr = new XMLHttpRequest();
    		xhr.open('GET', src, true);
    		xhr.onreadystatechange = function () {
    			if (xhr.readyState == 4) {
    				if (xhr.status < 400 && xhr.responseText) {
    					success(xhr.responseText);
    				} else {
    					if (xhr.status >= 400) {
    						error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
    					} else {
    						error(FAILURE_EMPTY_MESSAGE);
    					}
    				}
    			}
    		};
    		xhr.send(null);
    	}

    	/**
    	 * Parses the given range.
    	 *
    	 * This returns a range with inclusive ends.
    	 *
    	 * @param {string | null | undefined} range
    	 * @returns {[number, number | undefined] | undefined}
    	 */
    	function parseRange(range) {
    		var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
    		if (m) {
    			var start = Number(m[1]);
    			var comma = m[2];
    			var end = m[3];

    			if (!comma) {
    				return [start, start];
    			}
    			if (!end) {
    				return [start, undefined];
    			}
    			return [start, Number(end)];
    		}
    		return undefined;
    	}

    	Prism.hooks.add('before-highlightall', function (env) {
    		env.selector += ', ' + SELECTOR;
    	});

    	Prism.hooks.add('before-sanity-check', function (env) {
    		var pre = /** @type {HTMLPreElement} */ (env.element);
    		if (pre.matches(SELECTOR)) {
    			env.code = ''; // fast-path the whole thing and go to complete

    			pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

    			// add code element with loading message
    			var code = pre.appendChild(document.createElement('CODE'));
    			code.textContent = LOADING_MESSAGE;

    			var src = pre.getAttribute('data-src');

    			var language = env.language;
    			if (language === 'none') {
    				// the language might be 'none' because there is no language set;
    				// in this case, we want to use the extension as the language
    				var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
    				language = EXTENSIONS[extension] || extension;
    			}

    			// set language classes
    			Prism.util.setLanguage(code, language);
    			Prism.util.setLanguage(pre, language);

    			// preload the language
    			var autoloader = Prism.plugins.autoloader;
    			if (autoloader) {
    				autoloader.loadLanguages(language);
    			}

    			// load file
    			loadFile(
    				src,
    				function (text) {
    					// mark as loaded
    					pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

    					// handle data-range
    					var range = parseRange(pre.getAttribute('data-range'));
    					if (range) {
    						var lines = text.split(/\r\n?|\n/g);

    						// the range is one-based and inclusive on both ends
    						var start = range[0];
    						var end = range[1] == null ? lines.length : range[1];

    						if (start < 0) { start += lines.length; }
    						start = Math.max(0, Math.min(start - 1, lines.length));
    						if (end < 0) { end += lines.length; }
    						end = Math.max(0, Math.min(end, lines.length));

    						text = lines.slice(start, end).join('\n');

    						// add data-start for line numbers
    						if (!pre.hasAttribute('data-start')) {
    							pre.setAttribute('data-start', String(start + 1));
    						}
    					}

    					// highlight code
    					code.textContent = text;
    					Prism.highlightElement(code);
    				},
    				function (error) {
    					// mark as failed
    					pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

    					code.textContent = error;
    				}
    			);
    		}
    	});

    	Prism.plugins.fileHighlight = {
    		/**
    		 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
    		 *
    		 * Note: Elements which are already loaded or currently loading will not be touched by this method.
    		 *
    		 * @param {ParentNode} [container=document]
    		 */
    		highlight: function highlight(container) {
    			var elements = (container || document).querySelectorAll(SELECTOR);

    			for (var i = 0, element; (element = elements[i++]);) {
    				Prism.highlightElement(element);
    			}
    		}
    	};

    	var logged = false;
    	/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
    	Prism.fileHighlight = function () {
    		if (!logged) {
    			console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
    			logged = true;
    		}
    		Prism.plugins.fileHighlight.highlight.apply(this, arguments);
    	};

    }());
    });

    function withLineNumbers(highlight, options = {}) {
        const opts = Object.assign({ class: "linenumbers", wrapClass: "wrapper", width: "35px", backgroundColor: "rgba(128, 128, 128, 0.15)", color: "" }, options);
        let lineNumbers;
        return function (editor) {
            highlight(editor);
            if (!lineNumbers) {
                lineNumbers = init(editor, opts);
                editor.addEventListener("scroll", () => lineNumbers.style.top = `-${editor.scrollTop}px`);
            }
            const code = editor.textContent || "";
            const linesCount = code.replace(/\n+$/, "\n").split("\n").length + 1;
            let text = "";
            for (let i = 1; i < linesCount; i++) {
                text += `${i}\n`;
            }
            lineNumbers.innerText = text;
        };
    }
    function init(editor, opts) {
        const css = getComputedStyle(editor);
        const wrap = document.createElement("div");
        wrap.className = opts.wrapClass;
        wrap.style.position = "relative";
        const gutter = document.createElement("div");
        gutter.className = opts.class;
        wrap.appendChild(gutter);
        // Add own styles
        gutter.style.position = "absolute";
        gutter.style.top = "0px";
        gutter.style.left = "0px";
        gutter.style.bottom = "0px";
        gutter.style.width = opts.width;
        gutter.style.overflow = "hidden";
        // Copy editor styles
        gutter.style.paddingTop = css.paddingTop;
        gutter.style.paddingLeft = css.paddingLeft;
        // Add line numbers
        const lineNumbers = document.createElement("div");
        lineNumbers.style.position = "relative";
        lineNumbers.style.top = "0px";
        gutter.appendChild(lineNumbers);
        // Tweak editor styles
        editor.style.paddingLeft = `calc(${opts.width} + ${gutter.style.paddingLeft})`;
        editor.style.whiteSpace = "pre";
        // Swap editor with a wrap
        editor.parentNode.insertBefore(wrap, editor);
        wrap.appendChild(editor);
        return lineNumbers;
    }

    function CodeJar(editor, highlight, opt = {}) {
        const options = Object.assign({ tab: "\t", indentOn: /{$/, spellcheck: false, addClosing: true }, opt);
        let listeners = [];
        let history = [];
        let at = -1;
        let focus = false;
        let callback;
        let prev; // code content prior keydown event
        let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
        editor.setAttribute("contentEditable", isFirefox ? "true" : "plaintext-only");
        editor.setAttribute("spellcheck", options.spellcheck ? "true" : "false");
        editor.style.outline = "none";
        editor.style.overflowWrap = "break-word";
        editor.style.overflowY = "auto";
        editor.style.resize = "vertical";
        editor.style.whiteSpace = "pre-wrap";
        highlight(editor);
        const debounceHighlight = debounce(() => {
            const pos = save();
            highlight(editor);
            restore(pos);
        }, 30);
        let recording = false;
        const shouldRecord = (event) => {
            return !isUndo(event) && !isRedo(event)
                && event.key !== "Meta"
                && event.key !== "Control"
                && event.key !== "Alt"
                && !event.key.startsWith("Arrow");
        };
        const debounceRecordHistory = debounce((event) => {
            if (shouldRecord(event)) {
                recordHistory();
                recording = false;
            }
        }, 300);
        const on = (type, fn) => {
            listeners.push([type, fn]);
            editor.addEventListener(type, fn);
        };
        on("keydown", event => {
            if (event.defaultPrevented)
                return;
            prev = toString();
            handleNewLine(event);
            handleTabCharacters(event);
            if (options.addClosing)
                handleSelfClosingCharacters(event);
            handleUndoRedo(event);
            if (shouldRecord(event) && !recording) {
                recordHistory();
                recording = true;
            }
        });
        on("keyup", event => {
            if (event.defaultPrevented)
                return;
            if (event.isComposing)
                return;
            if (prev !== toString())
                debounceHighlight();
            debounceRecordHistory(event);
            if (callback)
                callback(toString());
        });
        on("focus", _event => {
            focus = true;
        });
        on("blur", _event => {
            focus = false;
        });
        on("paste", event => {
            recordHistory();
            handlePaste(event);
            recordHistory();
            if (callback)
                callback(toString());
        });
        function save() {
            const s = window.getSelection();
            const pos = { start: 0, end: 0, dir: undefined };
            visit(editor, el => {
                if (el === s.anchorNode && el === s.focusNode) {
                    pos.start += s.anchorOffset;
                    pos.end += s.focusOffset;
                    pos.dir = s.anchorOffset <= s.focusOffset ? "->" : "<-";
                    return "stop";
                }
                if (el === s.anchorNode) {
                    pos.start += s.anchorOffset;
                    if (!pos.dir) {
                        pos.dir = "->";
                    }
                    else {
                        return "stop";
                    }
                }
                else if (el === s.focusNode) {
                    pos.end += s.focusOffset;
                    if (!pos.dir) {
                        pos.dir = "<-";
                    }
                    else {
                        return "stop";
                    }
                }
                if (el.nodeType === Node.TEXT_NODE) {
                    if (pos.dir != "->")
                        pos.start += el.nodeValue.length;
                    if (pos.dir != "<-")
                        pos.end += el.nodeValue.length;
                }
            });
            return pos;
        }
        function restore(pos) {
            const s = window.getSelection();
            let startNode, startOffset = 0;
            let endNode, endOffset = 0;
            if (!pos.dir)
                pos.dir = "->";
            if (pos.start < 0)
                pos.start = 0;
            if (pos.end < 0)
                pos.end = 0;
            // Flip start and end if the direction reversed
            if (pos.dir == "<-") {
                const { start, end } = pos;
                pos.start = end;
                pos.end = start;
            }
            let current = 0;
            visit(editor, el => {
                if (el.nodeType !== Node.TEXT_NODE)
                    return;
                const len = (el.nodeValue || "").length;
                if (current + len >= pos.start) {
                    if (!startNode) {
                        startNode = el;
                        startOffset = pos.start - current;
                    }
                    if (current + len >= pos.end) {
                        endNode = el;
                        endOffset = pos.end - current;
                        return "stop";
                    }
                }
                current += len;
            });
            // If everything deleted place cursor at editor
            if (!startNode)
                startNode = editor;
            if (!endNode)
                endNode = editor;
            // Flip back the selection
            if (pos.dir == "<-") {
                [startNode, startOffset, endNode, endOffset] = [endNode, endOffset, startNode, startOffset];
            }
            s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
        }
        function beforeCursor() {
            const s = window.getSelection();
            const r0 = s.getRangeAt(0);
            const r = document.createRange();
            r.selectNodeContents(editor);
            r.setEnd(r0.startContainer, r0.startOffset);
            return r.toString();
        }
        function afterCursor() {
            const s = window.getSelection();
            const r0 = s.getRangeAt(0);
            const r = document.createRange();
            r.selectNodeContents(editor);
            r.setStart(r0.endContainer, r0.endOffset);
            return r.toString();
        }
        function handleNewLine(event) {
            if (event.key === "Enter") {
                const before = beforeCursor();
                const after = afterCursor();
                let [padding] = findPadding(before);
                let newLinePadding = padding;
                // If last symbol is "{" ident new line
                // Allow user defines indent rule
                if (options.indentOn.test(before)) {
                    newLinePadding += options.tab;
                }
                if (isFirefox) {
                    preventDefault(event);
                    insert("\n" + newLinePadding);
                }
                else {
                    // Normal browsers
                    if (newLinePadding.length > 0) {
                        preventDefault(event);
                        insert("\n" + newLinePadding);
                    }
                }
                // Place adjacent "}" on next line
                if (newLinePadding !== padding && after[0] === "}") {
                    const pos = save();
                    insert("\n" + padding);
                    restore(pos);
                }
            }
        }
        function handleSelfClosingCharacters(event) {
            const open = `([{'"`;
            const close = `)]}'"`;
            const codeAfter = afterCursor();
            if (close.includes(event.key) && codeAfter.substr(0, 1) === event.key) {
                const pos = save();
                preventDefault(event);
                pos.start = ++pos.end;
                restore(pos);
            }
            else if (open.includes(event.key)) {
                const pos = save();
                preventDefault(event);
                const text = event.key + close[open.indexOf(event.key)];
                insert(text);
                pos.start = ++pos.end;
                restore(pos);
            }
        }
        function handleTabCharacters(event) {
            if (event.key === "Tab") {
                preventDefault(event);
                if (event.shiftKey) {
                    const before = beforeCursor();
                    let [padding, start,] = findPadding(before);
                    if (padding.length > 0) {
                        const pos = save();
                        // Remove full length tab or just remaining padding
                        const len = Math.min(options.tab.length, padding.length);
                        restore({ start, end: start + len });
                        document.execCommand("delete");
                        pos.start -= len;
                        pos.end -= len;
                        restore(pos);
                    }
                }
                else {
                    insert(options.tab);
                }
            }
        }
        function handleUndoRedo(event) {
            if (isUndo(event)) {
                preventDefault(event);
                at--;
                const record = history[at];
                if (record) {
                    editor.innerHTML = record.html;
                    restore(record.pos);
                }
                if (at < 0)
                    at = 0;
            }
            if (isRedo(event)) {
                preventDefault(event);
                at++;
                const record = history[at];
                if (record) {
                    editor.innerHTML = record.html;
                    restore(record.pos);
                }
                if (at >= history.length)
                    at--;
            }
        }
        function recordHistory() {
            if (!focus)
                return;
            const html = editor.innerHTML;
            const pos = save();
            const lastRecord = history[at];
            if (lastRecord) {
                if (lastRecord.html === html
                    && lastRecord.pos.start === pos.start
                    && lastRecord.pos.end === pos.end)
                    return;
            }
            at++;
            history[at] = { html, pos };
            history.splice(at + 1);
            const maxHistory = 300;
            if (at > maxHistory) {
                at = maxHistory;
                history.splice(0, 1);
            }
        }
        function handlePaste(event) {
            preventDefault(event);
            const text = (event.originalEvent || event).clipboardData.getData("text/plain");
            const pos = save();
            insert(text);
            highlight(editor);
            restore({ start: pos.start + text.length, end: pos.start + text.length });
        }
        function visit(editor, visitor) {
            const queue = [];
            if (editor.firstChild)
                queue.push(editor.firstChild);
            let el = queue.pop();
            while (el) {
                if (visitor(el) === "stop")
                    break;
                if (el.nextSibling)
                    queue.push(el.nextSibling);
                if (el.firstChild)
                    queue.push(el.firstChild);
                el = queue.pop();
            }
        }
        function isCtrl(event) {
            return event.metaKey || event.ctrlKey;
        }
        function isUndo(event) {
            return isCtrl(event) && !event.shiftKey && event.key === "z";
        }
        function isRedo(event) {
            return isCtrl(event) && event.shiftKey && event.key === "z";
        }
        function insert(text) {
            text = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
            document.execCommand("insertHTML", false, text);
        }
        function debounce(cb, wait) {
            let timeout = 0;
            return (...args) => {
                clearTimeout(timeout);
                timeout = window.setTimeout(() => cb(...args), wait);
            };
        }
        function findPadding(text) {
            // Find beginning of previous line.
            let i = text.length - 1;
            while (i >= 0 && text[i] !== "\n")
                i--;
            i++;
            // Find padding of the line.
            let j = i;
            while (j < text.length && /[ \t]/.test(text[j]))
                j++;
            return [text.substring(i, j) || "", i, j];
        }
        function toString() {
            return editor.textContent || "";
        }
        function preventDefault(event) {
            event.preventDefault();
        }
        return {
            updateOptions(options) {
                options = Object.assign(Object.assign({}, options), options);
            },
            updateCode(code) {
                editor.textContent = code;
                highlight(editor);
            },
            onUpdate(cb) {
                callback = cb;
            },
            toString,
            destroy() {
                for (let [type, fn] of listeners) {
                    editor.removeEventListener(type, fn);
                }
            },
        };
    }

    /* src/components/CodeEditor.svelte generated by Svelte v3.46.4 */
    const file$4 = "src/components/CodeEditor.svelte";

    function create_fragment$7(ctx) {
    	let pre;
    	let pre_class_value;
    	let codedit_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			attr_dev(pre, "class", pre_class_value = "language-" + /*lang*/ ctx[0] + " grow");
    			attr_dev(pre, "style", /*style*/ ctx[4]);
    			add_location(pre, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(codedit_action = codedit.call(null, pre, {
    						code: /*code*/ ctx[1],
    						autofocus: /*autofocus*/ ctx[2],
    						loc: /*loc*/ ctx[3],
    						.../*$$restProps*/ ctx[5]
    					})),
    					listen_dev(pre, "change", /*change_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lang*/ 1 && pre_class_value !== (pre_class_value = "language-" + /*lang*/ ctx[0] + " grow")) {
    				attr_dev(pre, "class", pre_class_value);
    			}

    			if (dirty & /*style*/ 16) {
    				attr_dev(pre, "style", /*style*/ ctx[4]);
    			}

    			if (codedit_action && is_function(codedit_action.update) && dirty & /*code, autofocus, loc, $$restProps*/ 46) codedit_action.update.call(null, {
    				code: /*code*/ ctx[1],
    				autofocus: /*autofocus*/ ctx[2],
    				loc: /*loc*/ ctx[3],
    				.../*$$restProps*/ ctx[5]
    			});
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    			mounted = false;
    			run_all(dispose);
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

    function codedit(node, { code, autofocus = false, loc = false, ...options }) {
    	const highlight = loc
    	? withLineNumbers(prism.highlightElement)
    	: prism.highlightElement;

    	const editor = CodeJar(node, highlight, options);

    	editor.onUpdate(neuCode => {
    		const e = new CustomEvent('change', { detail: neuCode });
    		node.dispatchEvent(e);
    	});

    	function update({ code, autofocus = false, loc = false, ...options }) {
    		editor.updateOptions(options);

    		if (editor.toString() !== code) {
    			editor.updateCode(code);
    		}
    	}

    	update({ code, autofocus, loc, ...options });
    	autofocus && node.focus();

    	return {
    		update,
    		destroy() {
    			editor.destroy();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const omit_props_names = ["lang","code","autofocus","loc","style"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CodeEditor', slots, []);
    	let { lang = '' } = $$props;
    	let { code = '' } = $$props;
    	let { autofocus = false } = $$props;
    	let { loc = false } = $$props;
    	let { style } = $$props;

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('lang' in $$new_props) $$invalidate(0, lang = $$new_props.lang);
    		if ('code' in $$new_props) $$invalidate(1, code = $$new_props.code);
    		if ('autofocus' in $$new_props) $$invalidate(2, autofocus = $$new_props.autofocus);
    		if ('loc' in $$new_props) $$invalidate(3, loc = $$new_props.loc);
    		if ('style' in $$new_props) $$invalidate(4, style = $$new_props.style);
    	};

    	$$self.$capture_state = () => ({
    		CodeJar,
    		withLineNumbers,
    		Prism: prism,
    		codedit,
    		lang,
    		code,
    		autofocus,
    		loc,
    		style
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('lang' in $$props) $$invalidate(0, lang = $$new_props.lang);
    		if ('code' in $$props) $$invalidate(1, code = $$new_props.code);
    		if ('autofocus' in $$props) $$invalidate(2, autofocus = $$new_props.autofocus);
    		if ('loc' in $$props) $$invalidate(3, loc = $$new_props.loc);
    		if ('style' in $$props) $$invalidate(4, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lang, code, autofocus, loc, style, $$restProps, change_handler];
    }

    class CodeEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			lang: 0,
    			code: 1,
    			autofocus: 2,
    			loc: 3,
    			style: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CodeEditor",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[4] === undefined && !('style' in props)) {
    			console.warn("<CodeEditor> was created without expected prop 'style'");
    		}
    	}

    	get lang() {
    		throw new Error("<CodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<CodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get code() {
    		throw new Error("<CodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set code(value) {
    		throw new Error("<CodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autofocus() {
    		throw new Error("<CodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autofocus(value) {
    		throw new Error("<CodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loc() {
    		throw new Error("<CodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loc(value) {
    		throw new Error("<CodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Variables.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/views/Variables.svelte";

    function create_fragment$6(ctx) {
    	let div0;
    	let codeeditor;
    	let updating_code;
    	let t0;
    	let div56;
    	let div1;
    	let label0;
    	let input0;
    	let t1;
    	let label1;
    	let input1;
    	let t2;
    	let label2;
    	let input2;
    	let t3;
    	let label3;
    	let input3;
    	let t4;
    	let label4;
    	let input4;
    	let t5;
    	let label5;
    	let input5;
    	let t6;
    	let div25;
    	let div8;
    	let div2;
    	let t8;
    	let div3;
    	let t10;
    	let div4;
    	let t12;
    	let div5;
    	let t14;
    	let div6;
    	let t16;
    	let div7;
    	let t18;
    	let div15;
    	let div9;
    	let t20;
    	let div10;
    	let t22;
    	let div11;
    	let t24;
    	let div12;
    	let t26;
    	let div13;
    	let t28;
    	let div14;
    	let t30;
    	let div18;
    	let div16;
    	let t32;
    	let div17;
    	let t34;
    	let div24;
    	let div19;
    	let t36;
    	let div20;
    	let t38;
    	let div21;
    	let t40;
    	let div22;
    	let t42;
    	let div23;
    	let t44;
    	let div26;
    	let input6;
    	let t45;
    	let input7;
    	let t46;
    	let div27;
    	let label6;
    	let input8;
    	let t47;
    	let span0;
    	let t48;
    	let t49;
    	let label7;
    	let input9;
    	let t50;
    	let span1;
    	let t51;
    	let t52;
    	let div28;
    	let label8;
    	let input10;
    	let t53;
    	let span2;
    	let t54;
    	let t55;
    	let label9;
    	let input11;
    	let t56;
    	let span3;
    	let t57;
    	let t58;
    	let label10;
    	let input12;
    	let t59;
    	let span4;
    	let t60;
    	let t61;
    	let div29;
    	let label11;
    	let input13;
    	let t62;
    	let span5;
    	let t63;
    	let t64;
    	let label12;
    	let input14;
    	let t65;
    	let span6;
    	let t66;
    	let t67;
    	let label13;
    	let input15;
    	let t68;
    	let span7;
    	let t69;
    	let t70;
    	let div30;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t74;
    	let div31;
    	let input16;
    	let t75;
    	let input17;
    	let t76;
    	let div32;
    	let input18;
    	let t77;
    	let input19;
    	let t78;
    	let div33;
    	let input20;
    	let t79;
    	let input21;
    	let t80;
    	let div34;
    	let input22;
    	let t81;
    	let input23;
    	let t82;
    	let div35;
    	let input24;
    	let t83;
    	let input25;
    	let t84;
    	let div36;
    	let input26;
    	let t85;
    	let input27;
    	let t86;
    	let div38;
    	let button0;
    	let t88;
    	let div37;
    	let t90;
    	let div39;
    	let button1;
    	let t92;
    	let button2;
    	let t94;
    	let div40;
    	let button3;
    	let t96;
    	let button4;
    	let t98;
    	let div41;
    	let button5;
    	let t100;
    	let button6;
    	let t102;
    	let div44;
    	let div42;
    	let t104;
    	let div43;
    	let t106;
    	let div49;
    	let div45;
    	let t108;
    	let div46;
    	let t110;
    	let div47;
    	let t112;
    	let div48;
    	let t114;
    	let div55;
    	let div50;
    	let t116;
    	let div51;
    	let t118;
    	let div52;
    	let t120;
    	let div53;
    	let t122;
    	let div54;
    	let t124;
    	let textarea;
    	let current;

    	function codeeditor_code_binding(value) {
    		/*codeeditor_code_binding*/ ctx[3](value);
    	}

    	let codeeditor_props = {
    		loc: true,
    		style: /*height*/ ctx[1],
    		autofocus: false,
    		lang: "javascript"
    	};

    	if (/*$root*/ ctx[0] !== void 0) {
    		codeeditor_props.code = /*$root*/ ctx[0];
    	}

    	codeeditor = new CodeEditor({ props: codeeditor_props, $$inline: true });
    	binding_callbacks.push(() => bind(codeeditor, 'code', codeeditor_code_binding));
    	codeeditor.$on("change", /*onCode*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(codeeditor.$$.fragment);
    			t0 = space();
    			div56 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t2 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t3 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t4 = space();
    			label4 = element("label");
    			input4 = element("input");
    			t5 = space();
    			label5 = element("label");
    			input5 = element("input");
    			t6 = space();
    			div25 = element("div");
    			div8 = element("div");
    			div2 = element("div");
    			div2.textContent = "h1";
    			t8 = space();
    			div3 = element("div");
    			div3.textContent = "h2";
    			t10 = space();
    			div4 = element("div");
    			div4.textContent = "h3";
    			t12 = space();
    			div5 = element("div");
    			div5.textContent = "h4";
    			t14 = space();
    			div6 = element("div");
    			div6.textContent = "h5";
    			t16 = space();
    			div7 = element("div");
    			div7.textContent = "h6";
    			t18 = space();
    			div15 = element("div");
    			div9 = element("div");
    			div9.textContent = "f0";
    			t20 = space();
    			div10 = element("div");
    			div10.textContent = "f1";
    			t22 = space();
    			div11 = element("div");
    			div11.textContent = "f2";
    			t24 = space();
    			div12 = element("div");
    			div12.textContent = "f3";
    			t26 = space();
    			div13 = element("div");
    			div13.textContent = "f4";
    			t28 = space();
    			div14 = element("div");
    			div14.textContent = "f5";
    			t30 = space();
    			div18 = element("div");
    			div16 = element("div");
    			div16.textContent = "pop";
    			t32 = space();
    			div17 = element("div");
    			div17.textContent = "sink";
    			t34 = space();
    			div24 = element("div");
    			div19 = element("div");
    			div19.textContent = "bg-a";
    			t36 = space();
    			div20 = element("div");
    			div20.textContent = "bg-b";
    			t38 = space();
    			div21 = element("div");
    			div21.textContent = "bg-c";
    			t40 = space();
    			div22 = element("div");
    			div22.textContent = "bg-d";
    			t42 = space();
    			div23 = element("div");
    			div23.textContent = "bg-e";
    			t44 = space();
    			div26 = element("div");
    			input6 = element("input");
    			t45 = space();
    			input7 = element("input");
    			t46 = space();
    			div27 = element("div");
    			label6 = element("label");
    			input8 = element("input");
    			t47 = space();
    			span0 = element("span");
    			t48 = text("\n\t\t\tcheckbox");
    			t49 = space();
    			label7 = element("label");
    			input9 = element("input");
    			t50 = space();
    			span1 = element("span");
    			t51 = text("\n\t\t\tcheckbox");
    			t52 = space();
    			div28 = element("div");
    			label8 = element("label");
    			input10 = element("input");
    			t53 = space();
    			span2 = element("span");
    			t54 = text("\n\t\t\tradio a");
    			t55 = space();
    			label9 = element("label");
    			input11 = element("input");
    			t56 = space();
    			span3 = element("span");
    			t57 = text("\n\t\t\tradio b");
    			t58 = space();
    			label10 = element("label");
    			input12 = element("input");
    			t59 = space();
    			span4 = element("span");
    			t60 = text("\n\t\t\tradio c");
    			t61 = space();
    			div29 = element("div");
    			label11 = element("label");
    			input13 = element("input");
    			t62 = space();
    			span5 = element("span");
    			t63 = text("\n\t\t\tradio a");
    			t64 = space();
    			label12 = element("label");
    			input14 = element("input");
    			t65 = space();
    			span6 = element("span");
    			t66 = text("\n\t\t\tradio b");
    			t67 = space();
    			label13 = element("label");
    			input15 = element("input");
    			t68 = space();
    			span7 = element("span");
    			t69 = text("\n\t\t\tradio c");
    			t70 = space();
    			div30 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "option a ";
    			option1 = element("option");
    			option1.textContent = "option b ";
    			option2 = element("option");
    			option2.textContent = "option c";
    			t74 = space();
    			div31 = element("div");
    			input16 = element("input");
    			t75 = space();
    			input17 = element("input");
    			t76 = space();
    			div32 = element("div");
    			input18 = element("input");
    			t77 = space();
    			input19 = element("input");
    			t78 = space();
    			div33 = element("div");
    			input20 = element("input");
    			t79 = space();
    			input21 = element("input");
    			t80 = space();
    			div34 = element("div");
    			input22 = element("input");
    			t81 = space();
    			input23 = element("input");
    			t82 = space();
    			div35 = element("div");
    			input24 = element("input");
    			t83 = space();
    			input25 = element("input");
    			t84 = space();
    			div36 = element("div");
    			input26 = element("input");
    			t85 = space();
    			input27 = element("input");
    			t86 = space();
    			div38 = element("div");
    			button0 = element("button");
    			button0.textContent = "button";
    			t88 = space();
    			div37 = element("div");
    			div37.textContent = "clickable";
    			t90 = space();
    			div39 = element("div");
    			button1 = element("button");
    			button1.textContent = "success";
    			t92 = space();
    			button2 = element("button");
    			button2.textContent = "info";
    			t94 = space();
    			div40 = element("div");
    			button3 = element("button");
    			button3.textContent = "error";
    			t96 = space();
    			button4 = element("button");
    			button4.textContent = "alert";
    			t98 = space();
    			div41 = element("div");
    			button5 = element("button");
    			button5.textContent = "rounded";
    			t100 = space();
    			button6 = element("button");
    			button6.textContent = "filled";
    			t102 = space();
    			div44 = element("div");
    			div42 = element("div");
    			div42.textContent = "pop";
    			t104 = space();
    			div43 = element("div");
    			div43.textContent = "sink";
    			t106 = space();
    			div49 = element("div");
    			div45 = element("div");
    			div45.textContent = "border";
    			t108 = space();
    			div46 = element("div");
    			div46.textContent = "solid";
    			t110 = space();
    			div47 = element("div");
    			div47.textContent = "dashed";
    			t112 = space();
    			div48 = element("div");
    			div48.textContent = "dotted";
    			t114 = space();
    			div55 = element("div");
    			div50 = element("div");
    			div50.textContent = "a";
    			t116 = space();
    			div51 = element("div");
    			div51.textContent = "b";
    			t118 = space();
    			div52 = element("div");
    			div52.textContent = "c";
    			t120 = space();
    			div53 = element("div");
    			div53.textContent = "d";
    			t122 = space();
    			div54 = element("div");
    			div54.textContent = "e";
    			t124 = space();
    			textarea = element("textarea");
    			attr_dev(div0, "class", "ptb1 pr1 flex minw32em");
    			add_location(div0, file$3, 13, 0, 260);
    			attr_dev(input0, "type", "color");
    			input0.value = "#ff0000";
    			add_location(input0, file$3, 26, 3, 556);
    			attr_dev(label0, "class", "color grow mr1");
    			add_location(label0, file$3, 25, 2, 522);
    			attr_dev(input1, "type", "color");
    			input1.value = "#ff00ff";
    			add_location(input1, file$3, 29, 3, 641);
    			attr_dev(label1, "class", "color grow mr1");
    			add_location(label1, file$3, 28, 2, 607);
    			attr_dev(input2, "type", "color");
    			input2.value = "#0000ff";
    			add_location(input2, file$3, 32, 3, 726);
    			attr_dev(label2, "class", "color grow mr1");
    			add_location(label2, file$3, 31, 2, 692);
    			attr_dev(input3, "type", "color");
    			input3.value = "#00ffff";
    			add_location(input3, file$3, 35, 3, 811);
    			attr_dev(label3, "class", "color grow mr1");
    			add_location(label3, file$3, 34, 2, 777);
    			attr_dev(input4, "type", "color");
    			input4.value = "#00ff00";
    			add_location(input4, file$3, 38, 3, 896);
    			attr_dev(label4, "class", "color grow mr1");
    			add_location(label4, file$3, 37, 2, 862);
    			attr_dev(input5, "type", "color");
    			input5.value = "#ffff00";
    			add_location(input5, file$3, 41, 3, 977);
    			attr_dev(label5, "class", "color grow");
    			add_location(label5, file$3, 40, 2, 947);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$3, 24, 1, 501);
    			attr_dev(div2, "class", "b1-solid plr0-8 h1");
    			add_location(div2, file$3, 46, 3, 1098);
    			attr_dev(div3, "class", "b1-solid plr0-8 h2");
    			add_location(div3, file$3, 47, 3, 1142);
    			attr_dev(div4, "class", "b1-solid plr0-8 h3");
    			add_location(div4, file$3, 48, 3, 1186);
    			attr_dev(div5, "class", "b1-solid plr0-8 h4");
    			add_location(div5, file$3, 49, 3, 1230);
    			attr_dev(div6, "class", "b1-solid plr0-8 h5");
    			add_location(div6, file$3, 50, 3, 1274);
    			attr_dev(div7, "class", "b1-solid plr0-8 h6");
    			add_location(div7, file$3, 51, 3, 1318);
    			attr_dev(div8, "class", "align-items-baseline rel");
    			add_location(div8, file$3, 45, 2, 1056);
    			attr_dev(div9, "class", "b1-solid plr0-8 f0");
    			add_location(div9, file$3, 54, 3, 1423);
    			attr_dev(div10, "class", "b1-solid plr0-8 f1");
    			add_location(div10, file$3, 55, 3, 1467);
    			attr_dev(div11, "class", "b1-solid plr0-8 f2");
    			add_location(div11, file$3, 56, 3, 1511);
    			attr_dev(div12, "class", "b1-solid plr0-8 f3");
    			add_location(div12, file$3, 57, 3, 1555);
    			attr_dev(div13, "class", "b1-solid plr0-8 f4");
    			add_location(div13, file$3, 58, 3, 1599);
    			attr_dev(div14, "class", "b1-solid plr0-8 f5");
    			add_location(div14, file$3, 59, 3, 1643);
    			attr_dev(div15, "class", "justify-content-flex-end text-right");
    			add_location(div15, file$3, 53, 2, 1370);
    			attr_dev(div16, "class", "flex align-items-center justify-content-center pop grow");
    			add_location(div16, file$3, 62, 3, 1733);
    			attr_dev(div17, "class", "mt1 flex align-items-center justify-content-center align-content-center sink grow");
    			add_location(div17, file$3, 63, 3, 1815);
    			attr_dev(div18, "class", "flex grow pl1 column");
    			add_location(div18, file$3, 61, 2, 1695);
    			attr_dev(div19, "class", "flex align-items-center justify-content-center align-content-center bg-a grow");
    			add_location(div19, file$3, 66, 3, 1971);
    			attr_dev(div20, "class", "mt1 flex align-items-center justify-content-center align-content-center bg-b grow");
    			add_location(div20, file$3, 67, 3, 2077);
    			attr_dev(div21, "class", "mt1 flex align-items-center justify-content-center align-content-center bg-c grow");
    			add_location(div21, file$3, 68, 3, 2187);
    			attr_dev(div22, "class", "mt1 flex align-items-center justify-content-center align-content-center bg-d grow");
    			add_location(div22, file$3, 69, 3, 2297);
    			attr_dev(div23, "class", "mt1 flex align-items-center justify-content-center align-content-center bg-e grow");
    			add_location(div23, file$3, 70, 3, 2407);
    			attr_dev(div24, "class", "flex grow pl1 column");
    			add_location(div24, file$3, 65, 2, 1933);
    			attr_dev(div25, "class", "flex");
    			add_location(div25, file$3, 44, 1, 1035);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "grow");
    			attr_dev(input6, "placeholder", "text");
    			add_location(input6, file$3, 75, 2, 2559);
    			attr_dev(input7, "class", "grow mt1");
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "placeholder", "number");
    			add_location(input7, file$3, 76, 2, 2615);
    			attr_dev(div26, "class", "flex wrap");
    			add_location(div26, file$3, 74, 1, 2533);
    			attr_dev(input8, "type", "checkbox");
    			input8.checked = true;
    			add_location(input8, file$3, 82, 3, 2737);
    			add_location(span0, file$3, 83, 3, 2774);
    			attr_dev(label6, "class", "checkbox");
    			add_location(label6, file$3, 81, 2, 2709);
    			attr_dev(input9, "type", "checkbox");
    			input9.checked = true;
    			add_location(input9, file$3, 87, 3, 2833);
    			add_location(span1, file$3, 88, 3, 2870);
    			attr_dev(label7, "class", "radio");
    			add_location(label7, file$3, 86, 2, 2808);
    			attr_dev(div27, "class", "flex");
    			add_location(div27, file$3, 80, 1, 2688);
    			attr_dev(input10, "type", "radio");
    			input10.checked = true;
    			attr_dev(input10, "name", "checkradios");
    			input10.value = "a";
    			add_location(input10, file$3, 95, 3, 2961);
    			add_location(span2, file$3, 96, 3, 3024);
    			attr_dev(label8, "class", "checkbox");
    			add_location(label8, file$3, 94, 2, 2933);
    			attr_dev(input11, "type", "radio");
    			attr_dev(input11, "name", "checkradios");
    			input11.value = "b";
    			add_location(input11, file$3, 100, 3, 3085);
    			add_location(span3, file$3, 101, 3, 3140);
    			attr_dev(label9, "class", "checkbox");
    			add_location(label9, file$3, 99, 2, 3057);
    			attr_dev(input12, "type", "radio");
    			attr_dev(input12, "name", "checkradios");
    			input12.value = "c";
    			add_location(input12, file$3, 105, 3, 3201);
    			add_location(span4, file$3, 106, 3, 3256);
    			attr_dev(label10, "class", "checkbox");
    			add_location(label10, file$3, 104, 2, 3173);
    			attr_dev(div28, "class", "flex");
    			add_location(div28, file$3, 93, 1, 2912);
    			attr_dev(input13, "type", "radio");
    			input13.checked = true;
    			attr_dev(input13, "name", "radioradios");
    			input13.value = "a";
    			add_location(input13, file$3, 112, 3, 3342);
    			add_location(span5, file$3, 113, 3, 3405);
    			attr_dev(label11, "class", "radio");
    			add_location(label11, file$3, 111, 2, 3317);
    			attr_dev(input14, "type", "radio");
    			attr_dev(input14, "name", "radioradios");
    			input14.value = "b";
    			add_location(input14, file$3, 117, 3, 3463);
    			add_location(span6, file$3, 118, 3, 3518);
    			attr_dev(label12, "class", "radio");
    			add_location(label12, file$3, 116, 2, 3438);
    			attr_dev(input15, "type", "radio");
    			attr_dev(input15, "name", "radioradios");
    			input15.value = "c";
    			add_location(input15, file$3, 122, 3, 3576);
    			add_location(span7, file$3, 123, 3, 3631);
    			attr_dev(label13, "class", "radio");
    			add_location(label13, file$3, 121, 2, 3551);
    			attr_dev(div29, "class", "flex");
    			add_location(div29, file$3, 110, 1, 3296);
    			option0.__value = "option a ";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 129, 3, 3706);
    			option1.__value = "option b ";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 130, 3, 3736);
    			option2.__value = "option c ";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 131, 3, 3766);
    			add_location(select, file$3, 128, 2, 3694);
    			attr_dev(div30, "class", "select");
    			add_location(div30, file$3, 127, 1, 3671);
    			attr_dev(input16, "class", "grow mr1");
    			attr_dev(input16, "type", "range");
    			input16.value = "50";
    			attr_dev(input16, "min", "0");
    			attr_dev(input16, "max", "100");
    			add_location(input16, file$3, 136, 2, 3836);
    			attr_dev(input17, "class", "grow round radius1em");
    			attr_dev(input17, "type", "range");
    			input17.value = "50";
    			attr_dev(input17, "min", "0");
    			attr_dev(input17, "max", "100");
    			add_location(input17, file$3, 137, 2, 3901);
    			attr_dev(div31, "class", "flex");
    			add_location(div31, file$3, 135, 1, 3815);
    			attr_dev(input18, "class", "grow mr1 h10px radius10px");
    			attr_dev(input18, "type", "range");
    			input18.value = "50";
    			attr_dev(input18, "min", "0");
    			attr_dev(input18, "max", "100");
    			add_location(input18, file$3, 140, 2, 4025);
    			attr_dev(input19, "class", "grow round h0em radius1em");
    			attr_dev(input19, "type", "range");
    			input19.value = "50";
    			attr_dev(input19, "min", "0");
    			attr_dev(input19, "max", "100");
    			add_location(input19, file$3, 141, 2, 4107);
    			attr_dev(div32, "class", "flex align-items-center");
    			add_location(div32, file$3, 139, 1, 3985);
    			attr_dev(input20, "class", "grow radius1em success");
    			attr_dev(input20, "type", "range");
    			input20.value = "50";
    			attr_dev(input20, "min", "0");
    			attr_dev(input20, "max", "100");
    			add_location(input20, file$3, 144, 2, 4236);
    			attr_dev(input21, "class", "grow ml1 radius1em info");
    			attr_dev(input21, "type", "range");
    			input21.value = "50";
    			attr_dev(input21, "min", "0");
    			attr_dev(input21, "max", "100");
    			add_location(input21, file$3, 145, 2, 4315);
    			attr_dev(div33, "class", "flex align-items-center");
    			add_location(div33, file$3, 143, 1, 4196);
    			attr_dev(input22, "class", "grow radius1em alert");
    			attr_dev(input22, "type", "range");
    			input22.value = "50";
    			attr_dev(input22, "min", "0");
    			attr_dev(input22, "max", "100");
    			add_location(input22, file$3, 148, 2, 4442);
    			attr_dev(input23, "class", "grow ml1 radius1em error");
    			attr_dev(input23, "type", "range");
    			input23.value = "50";
    			attr_dev(input23, "min", "0");
    			attr_dev(input23, "max", "100");
    			add_location(input23, file$3, 149, 2, 4519);
    			attr_dev(div34, "class", "flex align-items-center");
    			add_location(div34, file$3, 147, 1, 4402);
    			attr_dev(input24, "class", "grow start mr1");
    			attr_dev(input24, "type", "range");
    			input24.value = "50";
    			attr_dev(input24, "min", "0");
    			attr_dev(input24, "max", "100");
    			add_location(input24, file$3, 152, 2, 4628);
    			attr_dev(input25, "class", "grow start radius1em");
    			attr_dev(input25, "type", "range");
    			input25.value = "50";
    			attr_dev(input25, "min", "0");
    			attr_dev(input25, "max", "100");
    			add_location(input25, file$3, 153, 2, 4699);
    			attr_dev(div35, "class", "flex");
    			add_location(div35, file$3, 151, 1, 4607);
    			attr_dev(input26, "class", "grow end mr1");
    			attr_dev(input26, "type", "range");
    			input26.value = "50";
    			attr_dev(input26, "min", "0");
    			attr_dev(input26, "max", "100");
    			add_location(input26, file$3, 156, 2, 4804);
    			attr_dev(input27, "class", "grow end radius1em");
    			attr_dev(input27, "type", "range");
    			input27.value = "50";
    			attr_dev(input27, "min", "0");
    			attr_dev(input27, "max", "100");
    			add_location(input27, file$3, 157, 2, 4873);
    			attr_dev(div36, "class", "flex");
    			add_location(div36, file$3, 155, 1, 4783);
    			attr_dev(button0, "class", "grow mr1 radius2em-right");
    			add_location(button0, file$3, 162, 2, 4978);
    			attr_dev(div37, "class", "flex b3-solid clickable grow justify-content-center align-items-center");
    			add_location(div37, file$3, 163, 2, 5037);
    			attr_dev(div38, "class", "flex");
    			add_location(div38, file$3, 161, 1, 4957);
    			attr_dev(button1, "class", "success mr1 grow radius10px");
    			add_location(button1, file$3, 166, 2, 5167);
    			attr_dev(button2, "class", "info grow radius100pc");
    			add_location(button2, file$3, 167, 2, 5230);
    			attr_dev(div39, "class", "flex");
    			add_location(div39, file$3, 165, 1, 5146);
    			attr_dev(button3, "class", "error mr1 grow");
    			add_location(button3, file$3, 170, 2, 5312);
    			attr_dev(button4, "class", "alert grow");
    			add_location(button4, file$3, 171, 2, 5360);
    			attr_dev(div40, "class", "flex");
    			add_location(div40, file$3, 169, 1, 5291);
    			attr_dev(button5, "class", "grow mr1 radius2em");
    			add_location(button5, file$3, 174, 2, 5432);
    			attr_dev(button6, "class", "filled grow radius2em");
    			add_location(button6, file$3, 175, 2, 5486);
    			attr_dev(div41, "class", "flex");
    			add_location(div41, file$3, 173, 1, 5411);
    			attr_dev(div42, "class", "p2 flex justify-content-center pop grow");
    			add_location(div42, file$3, 178, 2, 5570);
    			attr_dev(div43, "class", "p2 flex justify-content-center sink grow");
    			add_location(div43, file$3, 179, 2, 5635);
    			attr_dev(div44, "class", "flex");
    			add_location(div44, file$3, 177, 1, 5549);
    			attr_dev(div45, "class", "p1 grow bright");
    			add_location(div45, file$3, 182, 2, 5739);
    			attr_dev(div46, "class", "p1 grow bl1-solid");
    			add_location(div46, file$3, 183, 2, 5782);
    			attr_dev(div47, "class", "p1 grow bl1-dashed");
    			add_location(div47, file$3, 184, 2, 5827);
    			attr_dev(div48, "class", "p1 grow bl1-dotted");
    			add_location(div48, file$3, 185, 2, 5874);
    			attr_dev(div49, "class", "flex b1-solid");
    			add_location(div49, file$3, 181, 1, 5709);
    			attr_dev(div50, "class", "p0-6 text-center grow color-a filled radius2em-left");
    			add_location(div50, file$3, 188, 2, 5949);
    			attr_dev(div51, "class", "p0-6 text-center grow color-b filled");
    			add_location(div51, file$3, 189, 2, 6024);
    			attr_dev(div52, "class", "p0-6 text-center grow color-c filled");
    			add_location(div52, file$3, 190, 2, 6084);
    			attr_dev(div53, "class", "p0-6 text-center grow color-d filled");
    			add_location(div53, file$3, 191, 2, 6144);
    			attr_dev(div54, "class", "p0-6 text-center grow color-e filled radius2em-right");
    			add_location(div54, file$3, 192, 2, 6204);
    			attr_dev(div55, "class", "flex");
    			add_location(div55, file$3, 187, 1, 5928);
    			attr_dev(textarea, "rows", 4);
    			textarea.value = "textarea";
    			add_location(textarea, file$3, 195, 1, 6288);
    			attr_dev(div56, "class", "ptb1 pr1 flex column cmb1 ");
    			add_location(div56, file$3, 23, 0, 459);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(codeeditor, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div56, anchor);
    			append_dev(div56, div1);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			append_dev(div1, t1);
    			append_dev(div1, label1);
    			append_dev(label1, input1);
    			append_dev(div1, t2);
    			append_dev(div1, label2);
    			append_dev(label2, input2);
    			append_dev(div1, t3);
    			append_dev(div1, label3);
    			append_dev(label3, input3);
    			append_dev(div1, t4);
    			append_dev(div1, label4);
    			append_dev(label4, input4);
    			append_dev(div1, t5);
    			append_dev(div1, label5);
    			append_dev(label5, input5);
    			append_dev(div56, t6);
    			append_dev(div56, div25);
    			append_dev(div25, div8);
    			append_dev(div8, div2);
    			append_dev(div8, t8);
    			append_dev(div8, div3);
    			append_dev(div8, t10);
    			append_dev(div8, div4);
    			append_dev(div8, t12);
    			append_dev(div8, div5);
    			append_dev(div8, t14);
    			append_dev(div8, div6);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div25, t18);
    			append_dev(div25, div15);
    			append_dev(div15, div9);
    			append_dev(div15, t20);
    			append_dev(div15, div10);
    			append_dev(div15, t22);
    			append_dev(div15, div11);
    			append_dev(div15, t24);
    			append_dev(div15, div12);
    			append_dev(div15, t26);
    			append_dev(div15, div13);
    			append_dev(div15, t28);
    			append_dev(div15, div14);
    			append_dev(div25, t30);
    			append_dev(div25, div18);
    			append_dev(div18, div16);
    			append_dev(div18, t32);
    			append_dev(div18, div17);
    			append_dev(div25, t34);
    			append_dev(div25, div24);
    			append_dev(div24, div19);
    			append_dev(div24, t36);
    			append_dev(div24, div20);
    			append_dev(div24, t38);
    			append_dev(div24, div21);
    			append_dev(div24, t40);
    			append_dev(div24, div22);
    			append_dev(div24, t42);
    			append_dev(div24, div23);
    			append_dev(div56, t44);
    			append_dev(div56, div26);
    			append_dev(div26, input6);
    			append_dev(div26, t45);
    			append_dev(div26, input7);
    			append_dev(div56, t46);
    			append_dev(div56, div27);
    			append_dev(div27, label6);
    			append_dev(label6, input8);
    			append_dev(label6, t47);
    			append_dev(label6, span0);
    			append_dev(label6, t48);
    			append_dev(div27, t49);
    			append_dev(div27, label7);
    			append_dev(label7, input9);
    			append_dev(label7, t50);
    			append_dev(label7, span1);
    			append_dev(label7, t51);
    			append_dev(div56, t52);
    			append_dev(div56, div28);
    			append_dev(div28, label8);
    			append_dev(label8, input10);
    			append_dev(label8, t53);
    			append_dev(label8, span2);
    			append_dev(label8, t54);
    			append_dev(div28, t55);
    			append_dev(div28, label9);
    			append_dev(label9, input11);
    			append_dev(label9, t56);
    			append_dev(label9, span3);
    			append_dev(label9, t57);
    			append_dev(div28, t58);
    			append_dev(div28, label10);
    			append_dev(label10, input12);
    			append_dev(label10, t59);
    			append_dev(label10, span4);
    			append_dev(label10, t60);
    			append_dev(div56, t61);
    			append_dev(div56, div29);
    			append_dev(div29, label11);
    			append_dev(label11, input13);
    			append_dev(label11, t62);
    			append_dev(label11, span5);
    			append_dev(label11, t63);
    			append_dev(div29, t64);
    			append_dev(div29, label12);
    			append_dev(label12, input14);
    			append_dev(label12, t65);
    			append_dev(label12, span6);
    			append_dev(label12, t66);
    			append_dev(div29, t67);
    			append_dev(div29, label13);
    			append_dev(label13, input15);
    			append_dev(label13, t68);
    			append_dev(label13, span7);
    			append_dev(label13, t69);
    			append_dev(div56, t70);
    			append_dev(div56, div30);
    			append_dev(div30, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(div56, t74);
    			append_dev(div56, div31);
    			append_dev(div31, input16);
    			append_dev(div31, t75);
    			append_dev(div31, input17);
    			append_dev(div56, t76);
    			append_dev(div56, div32);
    			append_dev(div32, input18);
    			append_dev(div32, t77);
    			append_dev(div32, input19);
    			append_dev(div56, t78);
    			append_dev(div56, div33);
    			append_dev(div33, input20);
    			append_dev(div33, t79);
    			append_dev(div33, input21);
    			append_dev(div56, t80);
    			append_dev(div56, div34);
    			append_dev(div34, input22);
    			append_dev(div34, t81);
    			append_dev(div34, input23);
    			append_dev(div56, t82);
    			append_dev(div56, div35);
    			append_dev(div35, input24);
    			append_dev(div35, t83);
    			append_dev(div35, input25);
    			append_dev(div56, t84);
    			append_dev(div56, div36);
    			append_dev(div36, input26);
    			append_dev(div36, t85);
    			append_dev(div36, input27);
    			append_dev(div56, t86);
    			append_dev(div56, div38);
    			append_dev(div38, button0);
    			append_dev(div38, t88);
    			append_dev(div38, div37);
    			append_dev(div56, t90);
    			append_dev(div56, div39);
    			append_dev(div39, button1);
    			append_dev(div39, t92);
    			append_dev(div39, button2);
    			append_dev(div56, t94);
    			append_dev(div56, div40);
    			append_dev(div40, button3);
    			append_dev(div40, t96);
    			append_dev(div40, button4);
    			append_dev(div56, t98);
    			append_dev(div56, div41);
    			append_dev(div41, button5);
    			append_dev(div41, t100);
    			append_dev(div41, button6);
    			append_dev(div56, t102);
    			append_dev(div56, div44);
    			append_dev(div44, div42);
    			append_dev(div44, t104);
    			append_dev(div44, div43);
    			append_dev(div56, t106);
    			append_dev(div56, div49);
    			append_dev(div49, div45);
    			append_dev(div49, t108);
    			append_dev(div49, div46);
    			append_dev(div49, t110);
    			append_dev(div49, div47);
    			append_dev(div49, t112);
    			append_dev(div49, div48);
    			append_dev(div56, t114);
    			append_dev(div56, div55);
    			append_dev(div55, div50);
    			append_dev(div55, t116);
    			append_dev(div55, div51);
    			append_dev(div55, t118);
    			append_dev(div55, div52);
    			append_dev(div55, t120);
    			append_dev(div55, div53);
    			append_dev(div55, t122);
    			append_dev(div55, div54);
    			append_dev(div56, t124);
    			append_dev(div56, textarea);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const codeeditor_changes = {};
    			if (dirty & /*height*/ 2) codeeditor_changes.style = /*height*/ ctx[1];

    			if (!updating_code && dirty & /*$root*/ 1) {
    				updating_code = true;
    				codeeditor_changes.code = /*$root*/ ctx[0];
    				add_flush_callback(() => updating_code = false);
    			}

    			codeeditor.$set(codeeditor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(codeeditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(codeeditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(codeeditor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div56);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let height;
    	let $root;
    	validate_store(root, 'root');
    	component_subscribe($$self, root, $$value => $$invalidate(0, $root = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Variables', slots, []);

    	function onCode(e) {
    		set_store_value(root, $root = e.detail, $root);
    	}

    	let radios;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Variables> was created with unknown prop '${key}'`);
    	});

    	function codeeditor_code_binding(value) {
    		$root = value;
    		root.set($root);
    	}

    	$$self.$capture_state = () => ({
    		root,
    		CodeEditor,
    		onCode,
    		radios,
    		height,
    		$root
    	});

    	$$self.$inject_state = $$props => {
    		if ('radios' in $$props) radios = $$props.radios;
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$root*/ 1) {
    			$$invalidate(1, height = `min-height: calc( ${$root.split('\n').length} * var(--line-height) )`);
    		}
    	};

    	return [$root, height, onCode, codeeditor_code_binding];
    }

    class Variables extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Variables",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    var intro = `<p>SASSIS is a SASS / CSS library for shorthand frontend styling.</p>

<p><a href="https://autr.github.io/sassis">website documentation</a> / <a href="https://github.com/autr/sassis">github repository</a></p>`;

    /* src/views/Introduction.svelte generated by Svelte v3.46.4 */
    const file$2 = "src/views/Introduction.svelte";

    function create_fragment$5(ctx) {
    	let div6;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t6;
    	let div4;
    	let a0;
    	let t8;
    	let a1;
    	let t10;
    	let a2;
    	let t12;
    	let a3;
    	let t14;
    	let div5;
    	let t15;
    	let a4;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "SASSIS is a SASS / CSS library and boilerplate for shorthand frontend styling.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "It can be loaded as a single minified CSS file, or included as SASS mixins.";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Use Cmd/Ctrl+F to search through available mixins and classes.";
    			t5 = space();
    			div3 = element("div");
    			t6 = space();
    			div4 = element("div");
    			a0 = element("a");
    			a0.textContent = "github";
    			t8 = space();
    			a1 = element("a");
    			a1.textContent = "layouts";
    			t10 = space();
    			a2 = element("a");
    			a2.textContent = "variables";
    			t12 = space();
    			a3 = element("a");
    			a3.textContent = "download";
    			t14 = space();
    			div5 = element("div");
    			t15 = text("Created by ");
    			a4 = element("a");
    			a4.textContent = "G.Sinnott";
    			add_location(div0, file$2, 13, 1, 299);
    			add_location(div1, file$2, 14, 1, 390);
    			add_location(div2, file$2, 15, 1, 478);
    			attr_dev(div3, "class", "mtb1 w1em h1em tick");
    			add_location(div3, file$2, 17, 1, 554);
    			attr_dev(a0, "class", "alert button");
    			attr_dev(a0, "href", "https://github.com/autr/sassis");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$2, 19, 2, 612);
    			attr_dev(a1, "class", "bright button");
    			attr_dev(a1, "href", "#/layouts");
    			add_location(a1, file$2, 20, 2, 703);
    			attr_dev(a2, "class", "error button");
    			attr_dev(a2, "href", "#/variables");
    			add_location(a2, file$2, 21, 2, 759);
    			attr_dev(a3, "class", "info button");
    			attr_dev(a3, "href", "#/download");
    			add_location(a3, file$2, 22, 2, 818);
    			attr_dev(div4, "class", "ptb2");
    			add_location(div4, file$2, 18, 1, 591);
    			attr_dev(a4, "href", "https://autr.tv");
    			attr_dev(a4, "class", "bb1-solid");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$2, 24, 17, 897);
    			add_location(div5, file$2, 24, 1, 881);
    			attr_dev(div6, "class", "p1");
    			add_location(div6, file$2, 12, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div3);
    			append_dev(div6, t6);
    			append_dev(div6, div4);
    			append_dev(div4, a0);
    			append_dev(div4, t8);
    			append_dev(div4, a1);
    			append_dev(div4, t10);
    			append_dev(div4, a2);
    			append_dev(div4, t12);
    			append_dev(div4, a3);
    			append_dev(div6, t14);
    			append_dev(div6, div5);
    			append_dev(div5, t15);
    			append_dev(div5, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    		}
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

    function instance$5($$self, $$props, $$invalidate) {
    	let height;
    	let $root;
    	validate_store(root, 'root');
    	component_subscribe($$self, root, $$value => $$invalidate(0, $root = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Introduction', slots, []);

    	function onCode(e) {
    		set_store_value(root, $root = e.detail, $root);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Introduction> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		root,
    		CodeEditor,
    		readme: intro,
    		onCode,
    		height,
    		$root
    	});

    	$$self.$inject_state = $$props => {
    		if ('height' in $$props) height = $$props.height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$root*/ 1) {
    			height = `min-height: calc( ${$root.split('\n').length} * var(--line-height) )`;
    		}
    	};

    	return [$root];
    }

    class Introduction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Introduction",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/views/Basic.svelte generated by Svelte v3.46.4 */

    function create_fragment$4(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: ['basic', 'items', 'content', 'opacity'],
    				name: "basic"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(shorthandtable.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(shorthandtable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shorthandtable, detaching);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Basic', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Basic> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Basic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Basic",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/views/Spacing.svelte generated by Svelte v3.46.4 */

    function create_fragment$3(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: ['position', 'padding', 'margin', 'border', 'translate'],
    				name: "spacing"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(shorthandtable.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(shorthandtable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shorthandtable, detaching);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Spacing', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Spacing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Spacing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spacing",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/views/Sizing.svelte generated by Svelte v3.46.4 */

    function create_fragment$2(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: [
    					'width',
    					'height',
    					'min-width',
    					'min-height',
    					'max-width',
    					'max-height',
    					'border-radius'
    				],
    				name: "sizing"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(shorthandtable.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(shorthandtable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shorthandtable, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sizing', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sizing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Sizing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sizing",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/views/Search.svelte generated by Svelte v3.46.4 */
    const file$1 = "src/views/Search.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let input;
    	let t;
    	let shorthandtable;
    	let current;
    	let mounted;
    	let dispose;

    	shorthandtable = new ShorthandTable({
    			props: { items: /*items*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			create_component(shorthandtable.$$.fragment);
    			attr_dev(input, "id", "search");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "search terms");
    			add_location(input, file$1, 42, 1, 1062);
    			attr_dev(div, "class", "flex column ptb1 grow");
    			add_location(div, file$1, 41, 0, 1025);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*search*/ ctx[0]);
    			append_dev(div, t);
    			mount_component(shorthandtable, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*search*/ 1 && input.value !== /*search*/ ctx[0]) {
    				set_input_value(input, /*search*/ ctx[0]);
    			}

    			const shorthandtable_changes = {};
    			if (dirty & /*items*/ 2) shorthandtable_changes.items = /*items*/ ctx[1];
    			shorthandtable.$set(shorthandtable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shorthandtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shorthandtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(shorthandtable);
    			mounted = false;
    			dispose();
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
    	let _items;
    	let items;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search', slots, []);
    	let search;
    	let concated = data.concat(fields);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		search = this.value;
    		$$invalidate(0, search);
    	}

    	$$self.$capture_state = () => ({
    		ShorthandTable,
    		search,
    		data,
    		fields,
    		concated,
    		_items,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ('search' in $$props) $$invalidate(0, search = $$props.search);
    		if ('concated' in $$props) concated = $$props.concated;
    		if ('_items' in $$props) $$invalidate(2, _items = $$props._items);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*search*/ 1) {
    			$$invalidate(2, _items = () => {
    				let out = {
    					type: 'table',
    					id: 'search-results',
    					data: []
    				};

    				if (!search) return [out];
    				const parts = search.split(' ');

    				data.concat(fields).forEach(item => {
    					if (!item.data) return;
    					if (search.length < 2) return;

    					for (let i = 0; i < item.data.length; i++) {
    						let matches = 0;

    						for (let ii = 0; ii < item.data[i].length; ii++) {
    							for (let iii = 0; iii < item.data[i][ii].length; iii++) {
    								const str = item.data[i][ii][iii];

    								parts.forEach(s => {
    									matches += str.indexOf(s) != -1 ? 1 : 0;
    									matches += ('.' + str).indexOf(s) != -1 ? 1 : 0;
    								});
    							}
    						}

    						item.data[i].sort = matches;
    						if (matches > 0) out.data.push(item.data[i]);
    					}
    				});

    				out.data.sort((a, b) => b.sort - a.sort);
    				return [out];
    			});
    		}

    		if ($$self.$$.dirty & /*_items*/ 4) {
    			$$invalidate(1, items = _items());
    		}
    	};

    	return [search, items, _items, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/views/Download.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1 } = globals;
    const file = "src/views/Download.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[1] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[4] = list[i][1];
    	return child_ctx;
    }

    // (13:4) {#each Object.entries(file) as [name, o]}
    function create_each_block_1(ctx) {
    	let a;
    	let t0_value = /*o*/ ctx[4].basename + "";
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = parseInt(/*o*/ ctx[4].size / 1000) + "";
    	let t3;
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text("kb)");
    			t5 = space();
    			attr_dev(span, "class", "fade");
    			add_location(span, file, 20, 19, 524);
    			attr_dev(a, "href", /*o*/ ctx[4].basename);
    			attr_dev(a, "class", "basis0 mb1 grow button");
    			attr_dev(a, "target", "_blank");
    			toggle_class(a, "alert", /*name*/ ctx[0] == 'full');
    			toggle_class(a, "info", /*name*/ ctx[0] == 'min');
    			toggle_class(a, "success", /*name*/ ctx[0] == 'gz');
    			add_location(a, file, 13, 5, 312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(a, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, infos*/ 0) {
    				toggle_class(a, "alert", /*name*/ ctx[0] == 'full');
    			}

    			if (dirty & /*Object, infos*/ 0) {
    				toggle_class(a, "info", /*name*/ ctx[0] == 'min');
    			}

    			if (dirty & /*Object, infos*/ 0) {
    				toggle_class(a, "success", /*name*/ ctx[0] == 'gz');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(13:4) {#each Object.entries(file) as [name, o]}",
    		ctx
    	});

    	return block;
    }

    // (7:1) {#each Object.entries(infos.downloads) as [name, file]}
    function create_each_block(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t0_value = /*name*/ ctx[0] + "";
    	let t0;
    	let t1;
    	let div2;
    	let t2;
    	let each_value_1 = Object.entries(/*file*/ ctx[1]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(div0, file, 9, 4, 189);
    			attr_dev(div1, "class", "basis40pc");
    			add_location(div1, file, 8, 3, 161);
    			attr_dev(div2, "class", "flex mb1 grow flex-column");
    			add_location(div2, file, 11, 3, 221);
    			attr_dev(div3, "class", "flex mb2");
    			add_location(div3, file, 7, 2, 135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div3, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, infos, parseInt*/ 0) {
    				each_value_1 = Object.entries(/*file*/ ctx[1]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:1) {#each Object.entries(infos.downloads) as [name, file]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = Object.entries(infos.downloads);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "p1 grow");
    			add_location(div, file, 5, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, infos, parseInt*/ 0) {
    				each_value = Object.entries(infos.downloads);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Download', slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Download> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ infos });
    	return [];
    }

    class Download extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Download",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });


    routes.set({
    	'/': Introduction,
    	'/intro': Introduction,
    	'/themes+colours': Variables,
    	'/basic-utils': Basic,
    	'/basic-utils/:id': Basic,
    	'/dimensions': Sizing,
    	'/dimensions/:id': Sizing,
    	'/margin+padding': Spacing,
    	'/margin+padding/:id': Spacing,
    	'/layouts': Layouts,
    	'/layouts/:id': Layouts,
    	'/user-interface': FormFields,
    	'/user-interface/:id': FormFields,
    	'/fonts': Type,
    	'/fonts/:id': Type,
    	'/search': Search,
    	'/download': Download
    });

    return app;

})();
//# sourceMappingURL=index.js.map
