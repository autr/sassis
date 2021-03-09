
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function set_store_value(store, ret, value = ret) {
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
            callbacks.slice().forEach(fn => fn(event));
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
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 18603623,
            "size": 794835,
            "blocks": 1560,
            "atimeMs": 1615318760276.8237,
            "mtimeMs": 1615318766673.2747,
            "ctimeMs": 1615318766673.2747,
            "birthtimeMs": 1611856684362.6074,
            "atime": "2021-03-09T19:39:20.277Z",
            "mtime": "2021-03-09T19:39:26.673Z",
            "ctime": "2021-03-09T19:39:26.673Z",
            "birthtime": "2021-01-28T17:58:04.363Z"
          },
          "min": {
            "path": "dist/shorthand.min.css",
            "basename": "shorthand.min.css",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 18603624,
            "size": 616848,
            "blocks": 1208,
            "atimeMs": 1615318766712.1167,
            "mtimeMs": 1615318766674.195,
            "ctimeMs": 1615318766674.195,
            "birthtimeMs": 1611856684366.754,
            "atime": "2021-03-09T19:39:26.712Z",
            "mtime": "2021-03-09T19:39:26.674Z",
            "ctime": "2021-03-09T19:39:26.674Z",
            "birthtime": "2021-01-28T17:58:04.367Z"
          },
          "gz": {
            "path": "dist/shorthand.min.css.gz",
            "basename": "shorthand.min.css.gz",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 18603625,
            "size": 91235,
            "blocks": 256,
            "atimeMs": 1615318758930.5535,
            "mtimeMs": 1615318766711.5554,
            "ctimeMs": 1615318766711.5554,
            "birthtimeMs": 1611856684372.2363,
            "atime": "2021-03-09T19:39:18.931Z",
            "mtime": "2021-03-09T19:39:26.712Z",
            "ctime": "2021-03-09T19:39:26.712Z",
            "birthtime": "2021-01-28T17:58:04.372Z"
          }
        },
        "layout": {
          "full": {
            "path": "dist/layout.css",
            "basename": "layout.css",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 17206072,
            "size": 3902,
            "blocks": 8,
            "atimeMs": 1615318760226.147,
            "mtimeMs": 1615318767030.6982,
            "ctimeMs": 1615318767030.6982,
            "birthtimeMs": 1611332391824.218,
            "atime": "2021-03-09T19:39:20.226Z",
            "mtime": "2021-03-09T19:39:27.031Z",
            "ctime": "2021-03-09T19:39:27.031Z",
            "birthtime": "2021-01-22T16:19:51.824Z"
          },
          "min": {
            "path": "dist/layout.min.css",
            "basename": "layout.min.css",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 17206073,
            "size": 2960,
            "blocks": 8,
            "atimeMs": 1615318767034.4143,
            "mtimeMs": 1615318767030.953,
            "ctimeMs": 1615318767030.953,
            "birthtimeMs": 1611332391824.479,
            "atime": "2021-03-09T19:39:27.034Z",
            "mtime": "2021-03-09T19:39:27.031Z",
            "ctime": "2021-03-09T19:39:27.031Z",
            "birthtime": "2021-01-22T16:19:51.824Z"
          },
          "gz": {
            "path": "dist/layout.min.css.gz",
            "basename": "layout.min.css.gz",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 17206461,
            "size": 488,
            "blocks": 8,
            "atimeMs": 1615318759060.6748,
            "mtimeMs": 1615318767033.957,
            "ctimeMs": 1615318767033.957,
            "birthtimeMs": 1611332453898.8462,
            "atime": "2021-03-09T19:39:19.061Z",
            "mtime": "2021-03-09T19:39:27.034Z",
            "ctime": "2021-03-09T19:39:27.034Z",
            "birthtime": "2021-01-22T16:20:53.899Z"
          }
        },
        "all": {
          "full": {
            "path": "dist/all.css",
            "basename": "all.css",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 18603618,
            "size": 1000979,
            "blocks": 1960,
            "atimeMs": 1615318762929.6826,
            "mtimeMs": 1615318768984.8552,
            "ctimeMs": 1615318768984.8552,
            "birthtimeMs": 1611856684347.5044,
            "atime": "2021-03-09T19:39:22.930Z",
            "mtime": "2021-03-09T19:39:28.985Z",
            "ctime": "2021-03-09T19:39:28.985Z",
            "birthtime": "2021-01-28T17:58:04.348Z"
          },
          "min": {
            "path": "dist/all.min.css",
            "basename": "all.min.css",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 18603619,
            "size": 753308,
            "blocks": 1472,
            "atimeMs": 1615318768994.7908,
            "mtimeMs": 1615318768986.5466,
            "ctimeMs": 1615318768986.5466,
            "birthtimeMs": 1611856684353.253,
            "atime": "2021-03-09T19:39:28.995Z",
            "mtime": "2021-03-09T19:39:28.987Z",
            "ctime": "2021-03-09T19:39:28.987Z",
            "birthtime": "2021-01-28T17:58:04.353Z"
          },
          "gz": {
            "path": "dist/all.min.css.gz",
            "basename": "all.min.css.gz",
            "dev": 16777220,
            "mode": 33188,
            "nlink": 1,
            "uid": 501,
            "gid": 20,
            "rdev": 0,
            "blksize": 4096,
            "ino": 18603620,
            "size": 103456,
            "blocks": 256,
            "atimeMs": 1615318760987.636,
            "mtimeMs": 1615318769022.7131,
            "ctimeMs": 1615318769022.7131,
            "birthtimeMs": 1611856684359.9097,
            "atime": "2021-03-09T19:39:20.988Z",
            "mtime": "2021-03-09T19:39:29.023Z",
            "ctime": "2021-03-09T19:39:29.023Z",
            "birthtime": "2021-01-28T17:58:04.360Z"
          }
        }
      },
      "package": {
        "name": "sassis",
        "version": "1.0.3",
        "scripts": {
          "build": "rollup -c",
          "dev": "rollup -c -w & nodemon src/sassis.js",
          "start": "sirv dist"
        },
        "devDependencies": {
          "@rollup/plugin-alias": "^3.1.1",
          "@rollup/plugin-commonjs": "^16.0.0",
          "@rollup/plugin-node-resolve": "^10.0.0",
          "clean-css": "^4.2.3",
          "codejar": "^3.2.3",
          "gzipper": "^4.3.0",
          "markdown": "^0.5.0",
          "node-sass": "^5.0.0",
          "nodemon": "^2.0.7",
          "postcss": "^7.0.35",
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
        },
        "dependencies": {}
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

    const root = writable( `<style></style>` );

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i][0];
    	child_ctx[6] = list[i][1];
    	return child_ctx;
    }

    // (28:6) {#if v.$$href != '#/' && v.$$href.indexOf(':') == -1}
    function create_if_block(ctx) {
    	let div;
    	let t0_value = /*k*/ ctx[5].substring(1) + "";
    	let t0;
    	let t1;
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
    			attr_dev(div, "class", "p0-4 bright pointer");
    			toggle_class(div, "alert", /*k*/ ctx[5] == "/intro");
    			toggle_class(div, "mt1", /*k*/ ctx[5] == "/search");
    			toggle_class(div, "info", /*k*/ ctx[5] == "/search" || /*k*/ ctx[5] == "/download");
    			toggle_class(div, "filled", /*$active*/ ctx[3].$$href.indexOf(/*v*/ ctx[6].$$href) != -1);
    			toggle_class(div, "bright", /*$active*/ ctx[3].$$href.indexOf(/*v*/ ctx[6].$$href) != -1);
    			add_location(div, file, 28, 7, 887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$routes*/ 4 && t0_value !== (t0_value = /*k*/ ctx[5].substring(1) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "alert", /*k*/ ctx[5] == "/intro");
    			}

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "mt1", /*k*/ ctx[5] == "/search");
    			}

    			if (dirty & /*Object, $routes*/ 4) {
    				toggle_class(div, "info", /*k*/ ctx[5] == "/search" || /*k*/ ctx[5] == "/download");
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:6) {#if v.$$href != '#/' && v.$$href.indexOf(':') == -1}",
    		ctx
    	});

    	return block;
    }

    // (27:5) {#each Object.entries($routes) as [k,v]}
    function create_each_block(ctx) {
    	let show_if = /*v*/ ctx[6].$$href != "#/" && /*v*/ ctx[6].$$href.indexOf(":") == -1;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block(ctx);

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
    			if (dirty & /*$routes*/ 4) show_if = /*v*/ ctx[6].$$href != "#/" && /*v*/ ctx[6].$$href.indexOf(":") == -1;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:5) {#each Object.entries($routes) as [k,v]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let html_tag;
    	let t0;
    	let div7;
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let t2;
    	let t3_value = infos.package.version + "";
    	let t3;
    	let t4;
    	let span;
    	let t5;
    	let t6;
    	let div6;
    	let div5;
    	let router;
    	let current;
    	let each_value = Object.entries(/*$routes*/ ctx[2]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	router = new Router({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t2 = text("v");
    			t3 = text(t3_value);
    			t4 = space();
    			span = element("span");
    			t5 = text(/*date*/ ctx[1]);
    			t6 = space();
    			div6 = element("div");
    			div5 = element("div");
    			create_component(router.$$.fragment);
    			html_tag = new HtmlTag(t0);
    			attr_dev(div0, "class", "flex column");
    			add_location(div0, file, 25, 4, 748);
    			attr_dev(span, "class", "fade");
    			add_location(span, file, 42, 50, 1381);
    			attr_dev(div1, "class", "bright");
    			add_location(div1, file, 42, 5, 1336);
    			add_location(div2, file, 41, 4, 1325);
    			attr_dev(div3, "class", "flex column p1 maxw15em grow justify-content-between");
    			add_location(div3, file, 24, 3, 677);
    			attr_dev(div4, "class", "flex basis20em grow justify-content-flex-end overflow-auto");
    			add_location(div4, file, 23, 2, 601);
    			attr_dev(div5, "class", "flex maxw60em grow");
    			add_location(div5, file, 48, 3, 1504);
    			attr_dev(div6, "class", "flex basis60em overflow-auto grow");
    			add_location(div6, file, 47, 2, 1453);
    			attr_dev(div7, "class", "margin-auto align-self-center w100vw flex justify-content-center h100vh overflow-hidden");
    			add_location(div7, file, 22, 1, 497);
    			add_location(main, file, 19, 0, 473);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			html_tag.m(/*$root*/ ctx[0], main);
    			append_dev(main, t0);
    			append_dev(main, div7);
    			append_dev(div7, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, span);
    			append_dev(span, t5);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			mount_component(router, div5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$root*/ 1) html_tag.p(/*$root*/ ctx[0]);

    			if (dirty & /*Object, $routes, $active, window*/ 12) {
    				each_value = Object.entries(/*$routes*/ ctx[2]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*date*/ 2) set_data_dev(t5, /*date*/ ctx[1]);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let date;
    	let $root;
    	let $routes;
    	let $active;
    	validate_store(root, "root");
    	component_subscribe($$self, root, $$value => $$invalidate(0, $root = $$value));
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, $$value => $$invalidate(2, $routes = $$value));
    	validate_store(active, "active");
    	component_subscribe($$self, active, $$value => $$invalidate(3, $active = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(async () => {
    		const res = await fetch(`/defaults.css`);
    		const text = await res.text();
    		set_store_value(root, $root = "<style>" + text + "</style >", $root);
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
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
    		$root,
    		date,
    		$routes,
    		$active
    	});

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(1, date = $$props.date);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(1, date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + (new Date().getFullYear() - 2000));
    	return [$root, date, $routes, $active, click_handler];
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
              "inline"
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
          ],
          [
            [
              "margin-auto"
            ],
            [
              "margin: 0 auto"
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
              "align-self-baseline",
              "a-s-b"
            ],
            [
              "align-self: baseline"
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
              "align-items-baseline",
              "a-i-b"
            ],
            [
              "align-items: baseline"
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
              "justify-self-baseline",
              "j-s-b"
            ],
            [
              "justify-self: baseline"
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
          ],
          [
            [
              "justify-items-baseline",
              "j-i-b"
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

    /* src/components/ShorthandTable.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/components/ShorthandTable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
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
    			add_location(div, file$1, 47, 1, 1357);
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
    			if (dirty & /*name, id, filtered, $params, html, className*/ 63) {
    				each_value_1 = /*section*/ ctx[13].data;
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
    		source: "(61:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#if !section.data  }
    function create_if_block$1(ctx) {
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
    			add_location(span, file$1, 56, 5, 1629);
    			attr_dev(td, "colspan", "3");
    			attr_dev(td, "class", "text-center pb3");
    			toggle_class(td, "pt3", /*ii*/ ctx[15] > 0);
    			add_location(td, file$1, 55, 4, 1568);
    			attr_dev(tr, "id", tr_id_value = /*section*/ ctx[13].id);
    			attr_dev(tr, "class", "bb1-solid");
    			toggle_class(tr, "bt1-solid", /*ii*/ ctx[15] > 0);
    			add_location(tr, file$1, 54, 3, 1502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, span);
    			append_dev(span, t0);
    			append_dev(tr, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filtered*/ 16 && t0_value !== (t0_value = /*section*/ ctx[13].id + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*filtered*/ 16 && tr_id_value !== (tr_id_value = /*section*/ ctx[13].id)) {
    				attr_dev(tr, "id", tr_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(53:2) {#if !section.data  }",
    		ctx
    	});

    	return block;
    }

    // (87:7) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let raw_value = /*className*/ ctx[2](/*operator*/ ctx[16], /*section*/ ctx[13]) + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$1, 87, 8, 2427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*className, filtered*/ 20 && raw_value !== (raw_value = /*className*/ ctx[2](/*operator*/ ctx[16], /*section*/ ctx[13]) + "")) span.innerHTML = raw_value;		},
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
    	let t_value = /*operator*/ ctx[16][0].join("\n") + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "newlines");
    			add_location(span, file$1, 85, 8, 2347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filtered*/ 16 && t_value !== (t_value = /*operator*/ ctx[16][0].join("\n") + "")) set_data_dev(t, t_value);
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
    			add_location(div, file$1, 92, 8, 2580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*html, filtered*/ 18 && raw_value !== (raw_value = /*html*/ ctx[1](/*rule*/ ctx[19]) + "")) div.innerHTML = raw_value;		},
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
    function create_each_block_1(ctx) {
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
    			add_location(td0, file$1, 83, 6, 2291);
    			attr_dev(td1, "class", "bright pl1 ");
    			add_location(td1, file$1, 90, 6, 2512);
    			attr_dev(tr, "id", tr_id_value = `/${/*name*/ ctx[0]}/${/*id*/ ctx[3](/*operator*/ ctx[16])}`);
    			attr_dev(tr, "class", "cptb1");
    			toggle_class(tr, "b2-solid", /*$params*/ ctx[5].id == /*id*/ ctx[3](/*operator*/ ctx[16]));
    			toggle_class(tr, "bt1-solid", /*i*/ ctx[18] > 0);
    			add_location(tr, file$1, 63, 5, 1763);
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

    			if (dirty & /*html, filtered*/ 18) {
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

    			if (dirty & /*name, id, filtered*/ 25 && tr_id_value !== (tr_id_value = `/${/*name*/ ctx[0]}/${/*id*/ ctx[3](/*operator*/ ctx[16])}`)) {
    				attr_dev(tr, "id", tr_id_value);
    			}

    			if (dirty & /*$params, id, filtered*/ 56) {
    				toggle_class(tr, "b2-solid", /*$params*/ ctx[5].id == /*id*/ ctx[3](/*operator*/ ctx[16]));
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
    		id: create_each_block_1.name,
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
    		if (!/*section*/ ctx[13].data) return create_if_block$1;
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

    function create_fragment$2(ctx) {
    	let t;
    	let table;
    	let if_block = /*filtered*/ ctx[4].length == 1 && /*filtered*/ ctx[4][0].data.length == 0 && create_if_block_2(ctx);
    	let each_value = /*filtered*/ ctx[4];
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
    			add_location(table, file$1, 49, 0, 1413);
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
    			if (/*filtered*/ ctx[4].length == 1 && /*filtered*/ ctx[4][0].data.length == 0) {
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
    				each_value = /*filtered*/ ctx[4];
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let className;
    	let id;
    	let sanitise;
    	let html;
    	let isSearching;
    	let all;
    	let _filtered;
    	let filtered;
    	let $params;
    	validate_store(params, "params");
    	component_subscribe($$self, params, $$value => $$invalidate(5, $params = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ShorthandTable", slots, []);
    	let { name = "shorthand" } = $$props;
    	let { filters = [] } = $$props;
    	let { items } = $$props;

    	function onClick(operator) {
    		window.location = `#${id(operator)}`;
    	}

    	const writable_props = ["name", "filters", "items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ShorthandTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("filters" in $$props) $$invalidate(6, filters = $$props.filters);
    		if ("items" in $$props) $$invalidate(7, items = $$props.items);
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
    		className,
    		html,
    		id,
    		sanitise,
    		isSearching,
    		all,
    		_filtered,
    		filtered,
    		$params
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("filters" in $$props) $$invalidate(6, filters = $$props.filters);
    		if ("items" in $$props) $$invalidate(7, items = $$props.items);
    		if ("className" in $$props) $$invalidate(2, className = $$props.className);
    		if ("html" in $$props) $$invalidate(1, html = $$props.html);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("sanitise" in $$props) $$invalidate(8, sanitise = $$props.sanitise);
    		if ("isSearching" in $$props) $$invalidate(9, isSearching = $$props.isSearching);
    		if ("all" in $$props) $$invalidate(10, all = $$props.all);
    		if ("_filtered" in $$props) $$invalidate(11, _filtered = $$props._filtered);
    		if ("filtered" in $$props) $$invalidate(4, filtered = $$props.filtered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*html*/ 2) {
    			 $$invalidate(2, className = (operator, section) => {
    				let o = html(operator[0].map(s => s[0] == "+" ? s : "." + s).join(`, <br />`));
    				if (section.mixins == ".") return o.replaceAll(".", "<span class=\"info\">[.|+]</span>");
    				return o;
    			});
    		}

    		if ($$self.$$.dirty & /*sanitise*/ 256) {
    			 $$invalidate(3, id = operator => `${sanitise(operator[0][0])}`);
    		}

    		if ($$self.$$.dirty & /*items*/ 128) {
    			 $$invalidate(9, isSearching = items != undefined);
    		}

    		if ($$self.$$.dirty & /*isSearching, items*/ 640) {
    			 $$invalidate(10, all = isSearching ? items : data.concat(fields));
    		}

    		if ($$self.$$.dirty & /*filters, all*/ 1088) {
    			 $$invalidate(11, _filtered = () => {
    				if (!filters || filters?.length == 0) return all;
    				return all.filter(d => filters.indexOf(d.id) != -1);
    			});
    		}

    		if ($$self.$$.dirty & /*_filtered*/ 2048) {
    			 $$invalidate(4, filtered = _filtered());
    		}
    	};

    	 $$invalidate(1, html = rule => {
    		rule = rule.replaceAll("{alert}", "<span class=\"alert\">");
    		rule = rule.replaceAll("{info}", "<span class=\"info\">");
    		rule = rule.replaceAll("{succ}", "<span class=\"success\">");
    		rule = rule.replaceAll("{end}", "</span>");
    		return rule;
    	});

    	 $$invalidate(8, sanitise = lines => {
    		return lines.replaceAll(/[.+,~|()<>$]/g, "").replaceAll(/[\ [\]]/g, "-").replaceAll(/{alert}|{info}|{end}|{succ}/gi, "").replaceAll("--", "-");
    	});

    	return [
    		name,
    		html,
    		className,
    		id,
    		filtered,
    		$params,
    		filters,
    		items,
    		sanitise,
    		isSearching,
    		all,
    		_filtered
    	];
    }

    class ShorthandTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0, filters: 6, items: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShorthandTable",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[7] === undefined && !("items" in props)) {
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

    /* src/views/Layouts.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/views/Layouts.svelte";

    function create_fragment$3(ctx) {
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
    				filters: ["z-index", "layout", "alignments", "spacer", "flex-basis", "example"],
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
    			add_location(div0, file$2, 9, 2, 206);
    			attr_dev(div1, "class", "spacer");
    			add_location(div1, file$2, 10, 2, 262);
    			attr_dev(div2, "class", "cross p1 success b1-solid y-stretch");
    			add_location(div2, file$2, 11, 2, 287);
    			attr_dev(div3, "class", "spacer");
    			add_location(div3, file$2, 12, 2, 345);
    			attr_dev(div4, "class", "cross p1 alert b1-solid y-flex-end");
    			add_location(div4, file$2, 13, 2, 370);
    			attr_dev(div5, "class", "b1-solid mtb1 cross error minh10em flex row-center-center cs0-8");
    			add_location(div5, file$2, 7, 1, 125);
    			attr_dev(div6, "class", "p1 grow b1-solid minw50pc");
    			add_location(div6, file$2, 18, 2, 496);
    			attr_dev(div7, "class", "p1 grow b1-solid");
    			add_location(div7, file$2, 19, 2, 544);
    			attr_dev(div8, "class", "p1 grow b1-solid");
    			add_location(div8, file$2, 20, 2, 583);
    			attr_dev(div9, "class", "flex row-center-stretch minh10em auto-space");
    			add_location(div9, file$2, 16, 1, 435);
    			attr_dev(div10, "class", "grow b1-dotted cross");
    			add_location(div10, file$2, 31, 4, 892);
    			attr_dev(span0, "class", "spacer s4 cross error");
    			add_location(span0, file$2, 34, 4, 948);
    			attr_dev(div11, "class", "grow b1-dotted cross");
    			add_location(div11, file$2, 35, 4, 991);
    			attr_dev(div12, "class", "grow b1-dotted flex flex-row");
    			add_location(div12, file$2, 29, 3, 840);
    			attr_dev(span1, "class", "spacer s4 cross error");
    			add_location(span1, file$2, 39, 3, 1056);
    			attr_dev(div13, "class", "grow b1-dotted cross");
    			add_location(div13, file$2, 40, 3, 1098);
    			attr_dev(div14, "class", "flex b1-dashed grow w40 flex-column");
    			add_location(div14, file$2, 27, 2, 783);
    			attr_dev(span2, "class", "spacer s6 cross error");
    			add_location(span2, file$2, 44, 2, 1159);
    			attr_dev(div15, "class", "grow b1-dotted cross");
    			add_location(div15, file$2, 46, 3, 1249);
    			attr_dev(span3, "class", "spacer s4 cross error");
    			add_location(span3, file$2, 49, 3, 1302);
    			attr_dev(div16, "class", "grow b1-dotted cross");
    			add_location(div16, file$2, 50, 3, 1344);
    			attr_dev(span4, "class", "spacer s4 cross error");
    			add_location(span4, file$2, 53, 3, 1397);
    			attr_dev(div17, "class", "cross grow");
    			add_location(div17, file$2, 55, 4, 1489);
    			attr_dev(span5, "class", "spacer s4 cross error");
    			add_location(span5, file$2, 56, 4, 1520);
    			attr_dev(div18, "class", "cross grow");
    			add_location(div18, file$2, 57, 4, 1563);
    			attr_dev(div19, "class", "grow b1-dotted flex flex-column");
    			add_location(div19, file$2, 54, 3, 1439);
    			attr_dev(span6, "class", "spacer s4 cross error");
    			add_location(span6, file$2, 59, 3, 1603);
    			attr_dev(div20, "class", "grow b1-dotted cross");
    			add_location(div20, file$2, 60, 3, 1645);
    			attr_dev(div21, "class", "flex flex-column b1-dashed grow");
    			add_location(div21, file$2, 45, 2, 1200);
    			attr_dev(span7, "class", "spacer s8 cross error");
    			add_location(span7, file$2, 64, 2, 1706);
    			attr_dev(div22, "class", "flex b1-dashed w20 cross");
    			add_location(div22, file$2, 65, 2, 1747);
    			attr_dev(div23, "class", "flex flex-row grow");
    			add_location(div23, file$2, 26, 1, 748);
    			attr_dev(div24, "class", "flex flex-column grow");
    			add_location(div24, file$2, 6, 0, 88);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layouts", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layouts> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
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
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: { filters: ["form-fields"], name: "basic" },
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
    	validate_slots("FormFields", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FormFields> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
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

    /* src/views/Type.svelte generated by Svelte v3.31.2 */

    function create_fragment$5(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: ["font-size", "font-family"],
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Type", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Type> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Type extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Type",
    			options,
    			id: create_fragment$5.name
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
    var Prism = (function (_self){

    // Private helper vars
    var lang = /\blang(?:uage)?-([\w-]+)\b/i;
    var uniqueId = 0;


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

    			var clone, id;
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
    			while (element && !lang.test(element.className)) {
    				element = element.parentElement;
    			}
    			if (element) {
    				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
    			}
    			return 'none';
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

    				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
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
    			_.languages.DFS(_.languages, function(key, value) {
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

    					var property = o[i],
    					    propertyType = _.util.type(property);

    					if (propertyType === 'Object' && !visited[objId(property)]) {
    						visited[objId(property)] = true;
    						DFS(property, callback, null, visited);
    					}
    					else if (propertyType === 'Array' && !visited[objId(property)]) {
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
    	highlightAll: function(async, callback) {
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
    	highlightAllUnder: function(container, async, callback) {
    		var env = {
    			callback: callback,
    			container: container,
    			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
    		};

    		_.hooks.run('before-highlightall', env);

    		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

    		_.hooks.run('before-all-elements-highlight', env);

    		for (var i = 0, element; element = env.elements[i++];) {
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
    	highlightElement: function(element, async, callback) {
    		// Find language
    		var language = _.util.getLanguage(element);
    		var grammar = _.languages[language];

    		// Set language on the element, if not present
    		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

    		// Set language on the parent, for styling
    		var parent = element.parentElement;
    		if (parent && parent.nodeName.toLowerCase() === 'pre') {
    			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
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

    			worker.onmessage = function(evt) {
    				insertHighlightedCode(evt.data);
    			};

    			worker.postMessage(JSON.stringify({
    				language: env.language,
    				code: env.code,
    				immediateClose: true
    			}));
    		}
    		else {
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
    	tokenize: function(text, grammar) {
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

    			for (var i=0, callback; callback = callbacks[i++];) {
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

    			var patternObj = patterns[j],
    				inside = patternObj.inside,
    				lookbehind = !!patternObj.lookbehind,
    				greedy = !!patternObj.greedy,
    				alias = patternObj.alias;

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
    					if (!match) {
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

    				var from = match.index,
    					matchStr = match[0],
    					before = str.slice(0, from),
    					after = str.slice(from + matchStr.length);

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
    					matchGrammar(text, tokenList, grammar, currentNode.prev, pos, {
    						cause: token + ',' + j,
    						reach: reach
    					});
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
    			var message = JSON.parse(evt.data),
    				lang = message.language,
    				code = message.code,
    				immediateClose = message.immediateClose;

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

    })(_self);

    if ( module.exports) {
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
    	'comment': /<!--[\s\S]*?-->/,
    	'prolog': /<\?[\s\S]+?\?>/,
    	'doctype': {
    		// https://www.w3.org/TR/xml/#NT-doctypedecl
    		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    		greedy: true,
    		inside: {
    			'internal-subset': {
    				pattern: /(\[)[\s\S]+(?=\]>$)/,
    				lookbehind: true,
    				greedy: true,
    				inside: null // see below
    			},
    			'string': {
    				pattern: /"[^"]*"|'[^']*'/,
    				greedy: true
    			},
    			'punctuation': /^<!|>$|[[\]]/,
    			'doctype-tag': /^DOCTYPE/,
    			'name': /[^\s<>'"]+/
    		}
    	},
    	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
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

    	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

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
    		'selector': RegExp('[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
    		'string': {
    			pattern: string,
    			greedy: true
    		},
    		'property': /(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
    		'important': /!important\b/i,
    		'function': /[-a-z0-9]+(?=\()/i,
    		'punctuation': /[(){};:,]/
    	};

    	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

    	var markup = Prism.languages.markup;
    	if (markup) {
    		markup.tag.addInlined('style', 'css');

    		Prism.languages.insertBefore('inside', 'attr-value', {
    			'style-attr': {
    				pattern: /(^|["'\s])style\s*=\s*(?:"[^"]*"|'[^']*')/i,
    				lookbehind: true,
    				inside: {
    					'attr-value': {
    						pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
    						inside: {
    							'style': {
    								pattern: /(["'])[\s\S]+(?=["']$)/,
    								lookbehind: true,
    								alias: 'language-css',
    								inside: Prism.languages.css
    							},
    							'punctuation': [
    								{
    									pattern: /^=/,
    									alias: 'attr-equals'
    								},
    								/"|'/
    							]
    						}
    					},
    					'attr-name': /^style/i
    				}
    			}
    		}, markup.tag);
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
    		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
    		lookbehind: true,
    		inside: {
    			'punctuation': /[.\\]/
    		}
    	},
    	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
    	'boolean': /\b(?:true|false)\b/,
    	'function': /\w+(?=\()/,
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
    			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:prototype|constructor))/,
    			lookbehind: true
    		}
    	],
    	'keyword': [
    		{
    			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
    			lookbehind: true
    		},
    		{
    			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
    			lookbehind: true
    		},
    	],
    	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
    	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
    });

    Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

    Prism.languages.insertBefore('javascript', 'keyword', {
    	'regex': {
    		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
    		lookbehind: true,
    		greedy: true,
    		inside: {
    			'regex-source': {
    				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
    				lookbehind: true,
    				alias: 'language-regex',
    				inside: Prism.languages.regex
    			},
    			'regex-flags': /[a-z]+$/,
    			'regex-delimiter': /^\/|\/$/
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
    			pattern: /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
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
    	'template-string': {
    		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
    		greedy: true,
    		inside: {
    			'template-punctuation': {
    				pattern: /^`|`$/,
    				alias: 'string'
    			},
    			'interpolation': {
    				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
    				lookbehind: true,
    				inside: {
    					'interpolation-punctuation': {
    						pattern: /^\${|}$/,
    						alias: 'punctuation'
    					},
    					rest: Prism.languages.javascript
    				}
    			},
    			'string': /[\s\S]+/
    		}
    	}
    });

    if (Prism.languages.markup) {
    	Prism.languages.markup.tag.addInlined('script', 'javascript');
    }

    Prism.languages.js = Prism.languages.javascript;


    /* **********************************************
         Begin prism-file-highlight.js
    ********************************************** */

    (function () {
    	if (typeof self === 'undefined' || !self.Prism || !self.document) {
    		return;
    	}

    	// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
    	if (!Element.prototype.matches) {
    		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    	}

    	var Prism = window.Prism;

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

    	var lang = /\blang(?:uage)?-([\w-]+)\b/i;

    	/**
    	 * Sets the Prism `language-xxxx` or `lang-xxxx` class to the given language.
    	 *
    	 * @param {HTMLElement} element
    	 * @param {string} language
    	 * @returns {void}
    	 */
    	function setLanguageClass(element, language) {
    		var className = element.className;
    		className = className.replace(lang, ' ') + ' language-' + language;
    		element.className = className.replace(/\s+/g, ' ').trim();
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
    			setLanguageClass(code, language);
    			setLanguageClass(pre, language);

    			// preload the language
    			var autoloader = Prism.plugins.autoloader;
    			if (autoloader) {
    				autoloader.loadLanguages(language);
    			}

    			// load file
    			var xhr = new XMLHttpRequest();
    			xhr.open('GET', src, true);
    			xhr.onreadystatechange = function () {
    				if (xhr.readyState == 4) {
    					if (xhr.status < 400 && xhr.responseText) {
    						// mark as loaded
    						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

    						// highlight code
    						code.textContent = xhr.responseText;
    						Prism.highlightElement(code);

    					} else {
    						// mark as failed
    						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

    						if (xhr.status >= 400) {
    							code.textContent = FAILURE_MESSAGE(xhr.status, xhr.statusText);
    						} else {
    							code.textContent = FAILURE_EMPTY_MESSAGE;
    						}
    					}
    				}
    			};
    			xhr.send(null);
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

    			for (var i = 0, element; element = elements[i++];) {
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

    })();
    });

    function withLineNumbers(highlight, options = {}) {
        const opts = Object.assign({ class: "linenumbers", wrapClass: "wrapper", width: "35px", backgroundColor: "rgba(128, 128, 128, 0.15)", color: "" }, options);
        let lineNumbers;
        return function (editor) {
            highlight(editor);
            if (!lineNumbers) {
                lineNumbers = init$1(editor, opts);
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
    function init$1(editor, opts) {
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

    /* src/components/CodeEditor.svelte generated by Svelte v3.31.2 */
    const file$3 = "src/components/CodeEditor.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(pre, file$3, 0, 0, 0);
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
    		id: create_fragment$6.name,
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
    		const e = new CustomEvent("change", { detail: neuCode });
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

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = ["lang","code","autofocus","loc","style"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CodeEditor", slots, []);
    	let { lang = "" } = $$props;
    	let { code = "" } = $$props;
    	let { autofocus = false } = $$props;
    	let { loc = false } = $$props;
    	let { style } = $$props;

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("lang" in $$new_props) $$invalidate(0, lang = $$new_props.lang);
    		if ("code" in $$new_props) $$invalidate(1, code = $$new_props.code);
    		if ("autofocus" in $$new_props) $$invalidate(2, autofocus = $$new_props.autofocus);
    		if ("loc" in $$new_props) $$invalidate(3, loc = $$new_props.loc);
    		if ("style" in $$new_props) $$invalidate(4, style = $$new_props.style);
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
    		if ("lang" in $$props) $$invalidate(0, lang = $$new_props.lang);
    		if ("code" in $$props) $$invalidate(1, code = $$new_props.code);
    		if ("autofocus" in $$props) $$invalidate(2, autofocus = $$new_props.autofocus);
    		if ("loc" in $$props) $$invalidate(3, loc = $$new_props.loc);
    		if ("style" in $$props) $$invalidate(4, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lang, code, autofocus, loc, style, $$restProps, change_handler];
    }

    class CodeEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
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
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[4] === undefined && !("style" in props)) {
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

    /* src/views/Variables.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/views/Variables.svelte";

    function create_fragment$7(ctx) {
    	let div0;
    	let codeeditor;
    	let updating_code;
    	let t0;
    	let div55;
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
    	let input22;
    	let t81;
    	let input23;
    	let t82;
    	let div34;
    	let input24;
    	let t83;
    	let input25;
    	let t84;
    	let div35;
    	let input26;
    	let t85;
    	let input27;
    	let t86;
    	let div37;
    	let button0;
    	let t88;
    	let div36;
    	let t90;
    	let div38;
    	let button1;
    	let t92;
    	let button2;
    	let t94;
    	let div39;
    	let button3;
    	let t96;
    	let button4;
    	let t98;
    	let div40;
    	let button5;
    	let t100;
    	let button6;
    	let t102;
    	let div43;
    	let div41;
    	let t104;
    	let div42;
    	let t106;
    	let div48;
    	let div44;
    	let t108;
    	let div45;
    	let t110;
    	let div46;
    	let t112;
    	let div47;
    	let t114;
    	let div54;
    	let div49;
    	let t116;
    	let div50;
    	let t118;
    	let div51;
    	let t120;
    	let div52;
    	let t122;
    	let div53;
    	let t124;
    	let textarea;
    	let current;

    	function codeeditor_code_binding(value) {
    		/*codeeditor_code_binding*/ ctx[3].call(null, value);
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
    	binding_callbacks.push(() => bind(codeeditor, "code", codeeditor_code_binding));
    	codeeditor.$on("change", /*onCode*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(codeeditor.$$.fragment);
    			t0 = space();
    			div55 = element("div");
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
    			input22 = element("input");
    			t81 = space();
    			input23 = element("input");
    			t82 = space();
    			div34 = element("div");
    			input24 = element("input");
    			t83 = space();
    			input25 = element("input");
    			t84 = space();
    			div35 = element("div");
    			input26 = element("input");
    			t85 = space();
    			input27 = element("input");
    			t86 = space();
    			div37 = element("div");
    			button0 = element("button");
    			button0.textContent = "button";
    			t88 = space();
    			div36 = element("div");
    			div36.textContent = "clickable";
    			t90 = space();
    			div38 = element("div");
    			button1 = element("button");
    			button1.textContent = "success";
    			t92 = space();
    			button2 = element("button");
    			button2.textContent = "info";
    			t94 = space();
    			div39 = element("div");
    			button3 = element("button");
    			button3.textContent = "error";
    			t96 = space();
    			button4 = element("button");
    			button4.textContent = "alert";
    			t98 = space();
    			div40 = element("div");
    			button5 = element("button");
    			button5.textContent = "rounded";
    			t100 = space();
    			button6 = element("button");
    			button6.textContent = "filled";
    			t102 = space();
    			div43 = element("div");
    			div41 = element("div");
    			div41.textContent = "pop";
    			t104 = space();
    			div42 = element("div");
    			div42.textContent = "sink";
    			t106 = space();
    			div48 = element("div");
    			div44 = element("div");
    			div44.textContent = "border";
    			t108 = space();
    			div45 = element("div");
    			div45.textContent = "solid";
    			t110 = space();
    			div46 = element("div");
    			div46.textContent = "dashed";
    			t112 = space();
    			div47 = element("div");
    			div47.textContent = "dotted";
    			t114 = space();
    			div54 = element("div");
    			div49 = element("div");
    			div49.textContent = "a";
    			t116 = space();
    			div50 = element("div");
    			div50.textContent = "b";
    			t118 = space();
    			div51 = element("div");
    			div51.textContent = "c";
    			t120 = space();
    			div52 = element("div");
    			div52.textContent = "d";
    			t122 = space();
    			div53 = element("div");
    			div53.textContent = "e";
    			t124 = space();
    			textarea = element("textarea");
    			attr_dev(div0, "class", "ptb1 pr1 flex h100vh overflow-auto minw32em");
    			add_location(div0, file$4, 13, 0, 260);
    			attr_dev(input0, "type", "color");
    			input0.value = "#ff0000";
    			add_location(input0, file$4, 26, 3, 596);
    			attr_dev(label0, "class", "color grow mr1");
    			add_location(label0, file$4, 25, 2, 562);
    			attr_dev(input1, "type", "color");
    			input1.value = "#ff00ff";
    			add_location(input1, file$4, 29, 3, 681);
    			attr_dev(label1, "class", "color grow mr1");
    			add_location(label1, file$4, 28, 2, 647);
    			attr_dev(input2, "type", "color");
    			input2.value = "#0000ff";
    			add_location(input2, file$4, 32, 3, 766);
    			attr_dev(label2, "class", "color grow mr1");
    			add_location(label2, file$4, 31, 2, 732);
    			attr_dev(input3, "type", "color");
    			input3.value = "#00ffff";
    			add_location(input3, file$4, 35, 3, 851);
    			attr_dev(label3, "class", "color grow mr1");
    			add_location(label3, file$4, 34, 2, 817);
    			attr_dev(input4, "type", "color");
    			input4.value = "#00ff00";
    			add_location(input4, file$4, 38, 3, 936);
    			attr_dev(label4, "class", "color grow mr1");
    			add_location(label4, file$4, 37, 2, 902);
    			attr_dev(input5, "type", "color");
    			input5.value = "#ffff00";
    			add_location(input5, file$4, 41, 3, 1017);
    			attr_dev(label5, "class", "color grow");
    			add_location(label5, file$4, 40, 2, 987);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$4, 24, 1, 541);
    			attr_dev(div2, "class", "b1-solid plr0-8 h1");
    			add_location(div2, file$4, 46, 3, 1138);
    			attr_dev(div3, "class", "b1-solid plr0-8 h2");
    			add_location(div3, file$4, 47, 3, 1182);
    			attr_dev(div4, "class", "b1-solid plr0-8 h3");
    			add_location(div4, file$4, 48, 3, 1226);
    			attr_dev(div5, "class", "b1-solid plr0-8 h4");
    			add_location(div5, file$4, 49, 3, 1270);
    			attr_dev(div6, "class", "b1-solid plr0-8 h5");
    			add_location(div6, file$4, 50, 3, 1314);
    			attr_dev(div7, "class", "b1-solid plr0-8 h6");
    			add_location(div7, file$4, 51, 3, 1358);
    			attr_dev(div8, "class", "align-items-baseline rel");
    			add_location(div8, file$4, 45, 2, 1096);
    			attr_dev(div9, "class", "b1-solid plr0-8 f0");
    			add_location(div9, file$4, 54, 3, 1463);
    			attr_dev(div10, "class", "b1-solid plr0-8 f1");
    			add_location(div10, file$4, 55, 3, 1507);
    			attr_dev(div11, "class", "b1-solid plr0-8 f2");
    			add_location(div11, file$4, 56, 3, 1551);
    			attr_dev(div12, "class", "b1-solid plr0-8 f3");
    			add_location(div12, file$4, 57, 3, 1595);
    			attr_dev(div13, "class", "b1-solid plr0-8 f4");
    			add_location(div13, file$4, 58, 3, 1639);
    			attr_dev(div14, "class", "b1-solid plr0-8 f5");
    			add_location(div14, file$4, 59, 3, 1683);
    			attr_dev(div15, "class", "justify-content-flex-end text-right");
    			add_location(div15, file$4, 53, 2, 1410);
    			attr_dev(div16, "class", "flex align-items-center justify-content-center pop grow");
    			add_location(div16, file$4, 62, 3, 1773);
    			attr_dev(div17, "class", "mt1 flex align-items-center justify-content-center  align-content-center sink grow");
    			add_location(div17, file$4, 63, 3, 1855);
    			attr_dev(div18, "class", "flex grow pl1 column");
    			add_location(div18, file$4, 61, 2, 1735);
    			attr_dev(div19, "class", "flex align-items-center justify-content-center  align-content-center bg-a grow");
    			add_location(div19, file$4, 66, 3, 2011);
    			attr_dev(div20, "class", "mt1 flex align-items-center justify-content-center  align-content-center bg-b grow");
    			add_location(div20, file$4, 67, 3, 2117);
    			attr_dev(div21, "class", "mt1 flex align-items-center justify-content-center  align-content-center bg-c grow");
    			add_location(div21, file$4, 68, 3, 2227);
    			attr_dev(div22, "class", "mt1 flex align-items-center justify-content-center  align-content-center bg-d grow");
    			add_location(div22, file$4, 69, 3, 2337);
    			attr_dev(div23, "class", "mt1 flex align-items-center justify-content-center  align-content-center bg-e grow");
    			add_location(div23, file$4, 70, 3, 2447);
    			attr_dev(div24, "class", "flex grow pl1 column");
    			add_location(div24, file$4, 65, 2, 1973);
    			attr_dev(div25, "class", "flex");
    			add_location(div25, file$4, 44, 1, 1075);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "grow");
    			attr_dev(input6, "placeholder", "text");
    			add_location(input6, file$4, 75, 2, 2594);
    			attr_dev(input7, "class", "grow ml1");
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "placeholder", "number");
    			add_location(input7, file$4, 76, 2, 2650);
    			attr_dev(div26, "class", "flex");
    			add_location(div26, file$4, 74, 1, 2573);
    			attr_dev(input8, "type", "checkbox");
    			input8.checked = true;
    			add_location(input8, file$4, 82, 3, 2772);
    			add_location(span0, file$4, 83, 3, 2809);
    			attr_dev(label6, "class", "checkbox");
    			add_location(label6, file$4, 81, 2, 2744);
    			attr_dev(input9, "type", "checkbox");
    			input9.checked = true;
    			add_location(input9, file$4, 87, 3, 2868);
    			add_location(span1, file$4, 88, 3, 2905);
    			attr_dev(label7, "class", "radio");
    			add_location(label7, file$4, 86, 2, 2843);
    			attr_dev(div27, "class", "flex");
    			add_location(div27, file$4, 80, 1, 2723);
    			attr_dev(input10, "type", "radio");
    			input10.checked = true;
    			attr_dev(input10, "name", "checkradios");
    			input10.value = "a";
    			add_location(input10, file$4, 95, 3, 2996);
    			add_location(span2, file$4, 96, 3, 3059);
    			attr_dev(label8, "class", "checkbox");
    			add_location(label8, file$4, 94, 2, 2968);
    			attr_dev(input11, "type", "radio");
    			attr_dev(input11, "name", "checkradios");
    			input11.value = "b";
    			add_location(input11, file$4, 100, 3, 3120);
    			add_location(span3, file$4, 101, 3, 3175);
    			attr_dev(label9, "class", "checkbox");
    			add_location(label9, file$4, 99, 2, 3092);
    			attr_dev(input12, "type", "radio");
    			attr_dev(input12, "name", "checkradios");
    			input12.value = "c";
    			add_location(input12, file$4, 105, 3, 3236);
    			add_location(span4, file$4, 106, 3, 3291);
    			attr_dev(label10, "class", "checkbox");
    			add_location(label10, file$4, 104, 2, 3208);
    			attr_dev(div28, "class", "flex");
    			add_location(div28, file$4, 93, 1, 2947);
    			attr_dev(input13, "type", "radio");
    			input13.checked = true;
    			attr_dev(input13, "name", "radioradios");
    			input13.value = "a";
    			add_location(input13, file$4, 112, 3, 3377);
    			add_location(span5, file$4, 113, 3, 3440);
    			attr_dev(label11, "class", "radio");
    			add_location(label11, file$4, 111, 2, 3352);
    			attr_dev(input14, "type", "radio");
    			attr_dev(input14, "name", "radioradios");
    			input14.value = "b";
    			add_location(input14, file$4, 117, 3, 3498);
    			add_location(span6, file$4, 118, 3, 3553);
    			attr_dev(label12, "class", "radio");
    			add_location(label12, file$4, 116, 2, 3473);
    			attr_dev(input15, "type", "radio");
    			attr_dev(input15, "name", "radioradios");
    			input15.value = "c";
    			add_location(input15, file$4, 122, 3, 3611);
    			add_location(span7, file$4, 123, 3, 3666);
    			attr_dev(label13, "class", "radio");
    			add_location(label13, file$4, 121, 2, 3586);
    			attr_dev(div29, "class", "flex");
    			add_location(div29, file$4, 110, 1, 3331);
    			option0.__value = "option a ";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 129, 3, 3741);
    			option1.__value = "option b ";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 130, 3, 3771);
    			option2.__value = "option c ";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 131, 3, 3801);
    			add_location(select, file$4, 128, 2, 3729);
    			attr_dev(div30, "class", "select");
    			add_location(div30, file$4, 127, 1, 3706);
    			attr_dev(input16, "class", "grow mr1");
    			attr_dev(input16, "type", "range");
    			input16.value = "50";
    			attr_dev(input16, "min", "0");
    			attr_dev(input16, "max", "100");
    			add_location(input16, file$4, 136, 2, 3871);
    			attr_dev(input17, "class", "grow round radius1em");
    			attr_dev(input17, "type", "range");
    			input17.value = "50";
    			attr_dev(input17, "min", "0");
    			attr_dev(input17, "max", "100");
    			add_location(input17, file$4, 137, 2, 3936);
    			attr_dev(div31, "class", "flex");
    			add_location(div31, file$4, 135, 1, 3850);
    			attr_dev(input18, "class", "grow mr1 h10px radius10px");
    			attr_dev(input18, "type", "range");
    			input18.value = "50";
    			attr_dev(input18, "min", "0");
    			attr_dev(input18, "max", "100");
    			add_location(input18, file$4, 140, 2, 4060);
    			attr_dev(input19, "class", "grow round h0em radius1em");
    			attr_dev(input19, "type", "range");
    			input19.value = "50";
    			attr_dev(input19, "min", "0");
    			attr_dev(input19, "max", "100");
    			add_location(input19, file$4, 141, 2, 4142);
    			attr_dev(div32, "class", "flex align-items-center");
    			add_location(div32, file$4, 139, 1, 4020);
    			attr_dev(input20, "class", "grow radius1em success");
    			attr_dev(input20, "type", "range");
    			input20.value = "50";
    			attr_dev(input20, "min", "0");
    			attr_dev(input20, "max", "100");
    			add_location(input20, file$4, 144, 2, 4271);
    			attr_dev(input21, "class", "grow ml1 radius1em info");
    			attr_dev(input21, "type", "range");
    			input21.value = "50";
    			attr_dev(input21, "min", "0");
    			attr_dev(input21, "max", "100");
    			add_location(input21, file$4, 145, 2, 4350);
    			attr_dev(input22, "class", "grow ml1 radius1em alert");
    			attr_dev(input22, "type", "range");
    			input22.value = "50";
    			attr_dev(input22, "min", "0");
    			attr_dev(input22, "max", "100");
    			add_location(input22, file$4, 146, 2, 4430);
    			attr_dev(input23, "class", "grow ml1 radius1em error");
    			attr_dev(input23, "type", "range");
    			input23.value = "50";
    			attr_dev(input23, "min", "0");
    			attr_dev(input23, "max", "100");
    			add_location(input23, file$4, 147, 2, 4511);
    			attr_dev(div33, "class", "flex align-items-center");
    			add_location(div33, file$4, 143, 1, 4231);
    			attr_dev(input24, "class", "grow start mr1");
    			attr_dev(input24, "type", "range");
    			input24.value = "50";
    			attr_dev(input24, "min", "0");
    			attr_dev(input24, "max", "100");
    			add_location(input24, file$4, 150, 2, 4620);
    			attr_dev(input25, "class", "grow start radius1em");
    			attr_dev(input25, "type", "range");
    			input25.value = "50";
    			attr_dev(input25, "min", "0");
    			attr_dev(input25, "max", "100");
    			add_location(input25, file$4, 151, 2, 4691);
    			attr_dev(div34, "class", "flex");
    			add_location(div34, file$4, 149, 1, 4599);
    			attr_dev(input26, "class", "grow end mr1");
    			attr_dev(input26, "type", "range");
    			input26.value = "50";
    			attr_dev(input26, "min", "0");
    			attr_dev(input26, "max", "100");
    			add_location(input26, file$4, 154, 2, 4796);
    			attr_dev(input27, "class", "grow end radius1em");
    			attr_dev(input27, "type", "range");
    			input27.value = "50";
    			attr_dev(input27, "min", "0");
    			attr_dev(input27, "max", "100");
    			add_location(input27, file$4, 155, 2, 4865);
    			attr_dev(div35, "class", "flex");
    			add_location(div35, file$4, 153, 1, 4775);
    			attr_dev(button0, "class", "grow mr1 radius2em-right");
    			add_location(button0, file$4, 160, 2, 4970);
    			attr_dev(div36, "class", "flex b3-solid clickable grow justify-content-center align-items-center");
    			add_location(div36, file$4, 161, 2, 5029);
    			attr_dev(div37, "class", "flex");
    			add_location(div37, file$4, 159, 1, 4949);
    			attr_dev(button1, "class", "success mr1 grow radius10px");
    			add_location(button1, file$4, 164, 2, 5159);
    			attr_dev(button2, "class", "info grow radius100pc");
    			add_location(button2, file$4, 165, 2, 5222);
    			attr_dev(div38, "class", "flex");
    			add_location(div38, file$4, 163, 1, 5138);
    			attr_dev(button3, "class", "error mr1 grow");
    			add_location(button3, file$4, 168, 2, 5304);
    			attr_dev(button4, "class", "alert grow");
    			add_location(button4, file$4, 169, 2, 5352);
    			attr_dev(div39, "class", "flex");
    			add_location(div39, file$4, 167, 1, 5283);
    			attr_dev(button5, "class", "grow mr1 radius2em");
    			add_location(button5, file$4, 172, 2, 5424);
    			attr_dev(button6, "class", "filled grow radius2em");
    			add_location(button6, file$4, 173, 2, 5478);
    			attr_dev(div40, "class", "flex");
    			add_location(div40, file$4, 171, 1, 5403);
    			attr_dev(div41, "class", "p2 flex justify-content-center pop grow");
    			add_location(div41, file$4, 176, 2, 5562);
    			attr_dev(div42, "class", "p2 flex justify-content-center sink grow");
    			add_location(div42, file$4, 177, 2, 5627);
    			attr_dev(div43, "class", "flex");
    			add_location(div43, file$4, 175, 1, 5541);
    			attr_dev(div44, "class", "p1 grow bright");
    			add_location(div44, file$4, 180, 2, 5731);
    			attr_dev(div45, "class", "p1 grow bl1-solid");
    			add_location(div45, file$4, 181, 2, 5774);
    			attr_dev(div46, "class", "p1 grow bl1-dashed");
    			add_location(div46, file$4, 182, 2, 5819);
    			attr_dev(div47, "class", "p1 grow bl1-dotted");
    			add_location(div47, file$4, 183, 2, 5866);
    			attr_dev(div48, "class", "flex b1-solid");
    			add_location(div48, file$4, 179, 1, 5701);
    			attr_dev(div49, "class", "p0-6 text-center grow color-a filled radius2em-left");
    			add_location(div49, file$4, 186, 2, 5941);
    			attr_dev(div50, "class", "p0-6 text-center grow color-b filled");
    			add_location(div50, file$4, 187, 2, 6016);
    			attr_dev(div51, "class", "p0-6 text-center grow color-c filled");
    			add_location(div51, file$4, 188, 2, 6076);
    			attr_dev(div52, "class", "p0-6 text-center grow color-d filled");
    			add_location(div52, file$4, 189, 2, 6136);
    			attr_dev(div53, "class", "p0-6 text-center grow color-e filled radius2em-right");
    			add_location(div53, file$4, 190, 2, 6196);
    			attr_dev(div54, "class", "flex");
    			add_location(div54, file$4, 185, 1, 5920);
    			attr_dev(textarea, "rows", 4);
    			textarea.value = "textarea";
    			add_location(textarea, file$4, 193, 1, 6280);
    			attr_dev(div55, "class", "ptb1 pr1 flex column cmb1 h100vh overflow-auto");
    			add_location(div55, file$4, 23, 0, 479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(codeeditor, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div55, anchor);
    			append_dev(div55, div1);
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
    			append_dev(div55, t6);
    			append_dev(div55, div25);
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
    			append_dev(div55, t44);
    			append_dev(div55, div26);
    			append_dev(div26, input6);
    			append_dev(div26, t45);
    			append_dev(div26, input7);
    			append_dev(div55, t46);
    			append_dev(div55, div27);
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
    			append_dev(div55, t52);
    			append_dev(div55, div28);
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
    			append_dev(div55, t61);
    			append_dev(div55, div29);
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
    			append_dev(div55, t70);
    			append_dev(div55, div30);
    			append_dev(div30, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(div55, t74);
    			append_dev(div55, div31);
    			append_dev(div31, input16);
    			append_dev(div31, t75);
    			append_dev(div31, input17);
    			append_dev(div55, t76);
    			append_dev(div55, div32);
    			append_dev(div32, input18);
    			append_dev(div32, t77);
    			append_dev(div32, input19);
    			append_dev(div55, t78);
    			append_dev(div55, div33);
    			append_dev(div33, input20);
    			append_dev(div33, t79);
    			append_dev(div33, input21);
    			append_dev(div33, t80);
    			append_dev(div33, input22);
    			append_dev(div33, t81);
    			append_dev(div33, input23);
    			append_dev(div55, t82);
    			append_dev(div55, div34);
    			append_dev(div34, input24);
    			append_dev(div34, t83);
    			append_dev(div34, input25);
    			append_dev(div55, t84);
    			append_dev(div55, div35);
    			append_dev(div35, input26);
    			append_dev(div35, t85);
    			append_dev(div35, input27);
    			append_dev(div55, t86);
    			append_dev(div55, div37);
    			append_dev(div37, button0);
    			append_dev(div37, t88);
    			append_dev(div37, div36);
    			append_dev(div55, t90);
    			append_dev(div55, div38);
    			append_dev(div38, button1);
    			append_dev(div38, t92);
    			append_dev(div38, button2);
    			append_dev(div55, t94);
    			append_dev(div55, div39);
    			append_dev(div39, button3);
    			append_dev(div39, t96);
    			append_dev(div39, button4);
    			append_dev(div55, t98);
    			append_dev(div55, div40);
    			append_dev(div40, button5);
    			append_dev(div40, t100);
    			append_dev(div40, button6);
    			append_dev(div55, t102);
    			append_dev(div55, div43);
    			append_dev(div43, div41);
    			append_dev(div43, t104);
    			append_dev(div43, div42);
    			append_dev(div55, t106);
    			append_dev(div55, div48);
    			append_dev(div48, div44);
    			append_dev(div48, t108);
    			append_dev(div48, div45);
    			append_dev(div48, t110);
    			append_dev(div48, div46);
    			append_dev(div48, t112);
    			append_dev(div48, div47);
    			append_dev(div55, t114);
    			append_dev(div55, div54);
    			append_dev(div54, div49);
    			append_dev(div54, t116);
    			append_dev(div54, div50);
    			append_dev(div54, t118);
    			append_dev(div54, div51);
    			append_dev(div54, t120);
    			append_dev(div54, div52);
    			append_dev(div54, t122);
    			append_dev(div54, div53);
    			append_dev(div55, t124);
    			append_dev(div55, textarea);
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
    			if (detaching) detach_dev(div55);
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
    	validate_slots("Variables", slots, []);

    	function onCode(e) {
    		set_store_value(root, $root = e.detail, $root);
    	}

    	let radios;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Variables> was created with unknown prop '${key}'`);
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
    		if ("radios" in $$props) radios = $$props.radios;
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

    	return [$root, height, onCode, codeeditor_code_binding];
    }

    class Variables extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Variables",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var intro = `<h1>SASSIS</h1>

<p>TODO / WIP</p>`;

    /* src/views/Introduction.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/views/Introduction.svelte";

    function create_fragment$8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "p1");
    			add_location(div, file$5, 12, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = intro;
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	let height;
    	let $root;
    	validate_store(root, "root");
    	component_subscribe($$self, root, $$value => $$invalidate(0, $root = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Introduction", slots, []);

    	function onCode(e) {
    		set_store_value(root, $root = e.detail, $root);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Introduction> was created with unknown prop '${key}'`);
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
    		if ("height" in $$props) height = $$props.height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$root*/ 1) {
    			 height = `min-height: calc( ${$root.split("\n").length} * var(--line-height) )`;
    		}
    	};

    	return [$root];
    }

    class Introduction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Introduction",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/views/Basic.svelte generated by Svelte v3.31.2 */

    function create_fragment$9(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: ["basic", "items", "content"],
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Basic", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Basic> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Basic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Basic",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/views/Spacing.svelte generated by Svelte v3.31.2 */

    function create_fragment$a(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: ["position", "padding", "margin", "border", "translate"],
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spacing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spacing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Spacing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spacing",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/views/Sizing.svelte generated by Svelte v3.31.2 */

    function create_fragment$b(ctx) {
    	let shorthandtable;
    	let current;

    	shorthandtable = new ShorthandTable({
    			props: {
    				filters: [
    					"width",
    					"height",
    					"min-width",
    					"min-height",
    					"max-width",
    					"max-height",
    					"border-radius"
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sizing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sizing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ShorthandTable });
    	return [];
    }

    class Sizing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sizing",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/views/Search.svelte generated by Svelte v3.31.2 */
    const file$6 = "src/views/Search.svelte";

    function create_fragment$c(ctx) {
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
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "search terms");
    			add_location(input, file$6, 42, 1, 1062);
    			attr_dev(div, "class", "flex column ptb1 grow");
    			add_location(div, file$6, 41, 0, 1025);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let _items;
    	let items;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Search", slots, []);
    	let search;
    	let concated = data.concat(fields);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
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
    		if ("search" in $$props) $$invalidate(0, search = $$props.search);
    		if ("concated" in $$props) concated = $$props.concated;
    		if ("_items" in $$props) $$invalidate(2, _items = $$props._items);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*search*/ 1) {
    			 $$invalidate(2, _items = () => {
    				let out = {
    					type: "table",
    					id: "search-results",
    					data: []
    				};

    				if (!search) return [out];
    				const parts = search.split(" ");

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
    									matches += ("." + str).indexOf(s) != -1 ? 1 : 0;
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/views/Download.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1$1 } = globals;
    const file$7 = "src/views/Download.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[1] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[4] = list[i][1];
    	return child_ctx;
    }

    // (13:4) {#each Object.entries(file) as [name, o]}
    function create_each_block_1$1(ctx) {
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
    			add_location(span, file$7, 20, 19, 524);
    			attr_dev(a, "href", /*o*/ ctx[4].basename);
    			attr_dev(a, "class", "basis0 mb1 grow button");
    			attr_dev(a, "target", "_blank");
    			toggle_class(a, "alert", /*name*/ ctx[0] == "full");
    			toggle_class(a, "info", /*name*/ ctx[0] == "min");
    			toggle_class(a, "success", /*name*/ ctx[0] == "gz");
    			add_location(a, file$7, 13, 5, 312);
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
    				toggle_class(a, "alert", /*name*/ ctx[0] == "full");
    			}

    			if (dirty & /*Object, infos*/ 0) {
    				toggle_class(a, "info", /*name*/ ctx[0] == "min");
    			}

    			if (dirty & /*Object, infos*/ 0) {
    				toggle_class(a, "success", /*name*/ ctx[0] == "gz");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(13:4) {#each Object.entries(file) as [name, o]}",
    		ctx
    	});

    	return block;
    }

    // (7:1) {#each Object.entries(infos.downloads) as [name, file]}
    function create_each_block$2(ctx) {
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
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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
    			add_location(div0, file$7, 9, 4, 189);
    			attr_dev(div1, "class", "basis40pc");
    			add_location(div1, file$7, 8, 3, 161);
    			attr_dev(div2, "class", "flex mb1 grow flex-column");
    			add_location(div2, file$7, 11, 3, 221);
    			attr_dev(div3, "class", "flex mb2");
    			add_location(div3, file$7, 7, 2, 135);
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
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(7:1) {#each Object.entries(infos.downloads) as [name, file]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let each_value = Object.entries(infos.downloads);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "p1 grow");
    			add_location(div, file$7, 5, 0, 54);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Download", slots, []);
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Download> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ infos });
    	return [];
    }

    class Download extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Download",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });


    routes.set({
    	'/': Introduction,
    	'/intro': Introduction,
    	'/basic': Basic,
    	'/basic/:id': Basic,
    	'/sizing': Sizing,
    	'/sizing/:id': Sizing,
    	'/spacing': Spacing,
    	'/spacing/:id': Spacing,
    	'/layouts': Layouts,
    	'/layouts/:id': Layouts,
    	'/fields': FormFields,
    	'/fields/:id': FormFields,
    	'/type': Type,
    	'/type/:id': Type,
    	'/variables': Variables,
    	'/search': Search,
    	'/download': Download
    });

    return app;

}());
//# sourceMappingURL=index.js.map
