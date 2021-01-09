
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    var api = [
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
              "abs",
              "a"
            ],
            [
              "position: absolute"
            ]
          ],
          [
            [
              "relative",
              "rel",
              "r"
            ],
            [
              "position: relative"
            ]
          ],
          [
            [
              "fixed",
              "fix"
            ],
            [
              "position: fixed"
            ]
          ],
          [
            [
              "sticky",
              "stick"
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
              "inline-block",
              "ib"
            ],
            [
              "display: inline-block"
            ]
          ],
          [
            [
              "block",
              "bk"
            ],
            [
              "display: block"
            ]
          ],
          [
            [
              "flex",
              "fx"
            ],
            [
              "display: flex"
            ]
          ],
          [
            [
              "none",
              "hidden",
              "n"
            ],
            [
              "display: none"
            ]
          ],
          [
            [
              "column",
              "col",
              "flex-column",
              "fx-c"
            ],
            [
              "flex-direction: column"
            ]
          ],
          [
            [
              "row",
              "flex-row",
              "fx-r"
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
              "italic",
              "i"
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
              "invisible"
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
        "type": "h2",
        "id": "alignments"
      },
      {
        "type": "h3",
        "id": "items-self"
      },
      {
        "type": "table",
        "id": "items-self",
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
              "align-self-fxe",
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
              "align-self-fxs",
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
              "align-items-fxe",
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
              "align-items-fxs",
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
              "justify-self-fxe",
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
              "justify-self-fxs",
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
              "justify-items-fxe",
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
              "justify-items-fxs",
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
              "align-content-fxe",
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
              "align-content-fxs",
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
              "justify-content-fxe",
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
              "justify-content-fxs",
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
        "type": "h2",
        "id": "ems"
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
              "pt[n]em"
            ],
            [
              "padding-top: [n]em"
            ]
          ],
          [
            [
              "pr[n]em"
            ],
            [
              "padding-right: [n]em"
            ]
          ],
          [
            [
              "pl[n]em"
            ],
            [
              "padding-left: [n]em"
            ]
          ],
          [
            [
              "pb[n]em"
            ],
            [
              "padding-bottom: [n]em"
            ]
          ],
          [
            [
              "plr[n]em"
            ],
            [
              "padding-left: [n]em ",
              "padding-right: [n]em"
            ]
          ],
          [
            [
              "ptb[n]em"
            ],
            [
              "padding-top: [n]em ",
              "padding-bottom: [n]em"
            ]
          ],
          [
            [
              "p[n]em"
            ],
            [
              "padding: [n]em"
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
              "mt[n]em"
            ],
            [
              "margin-top: [n]em"
            ]
          ],
          [
            [
              "mr[n]em"
            ],
            [
              "margin-right: [n]em"
            ]
          ],
          [
            [
              "ml[n]em"
            ],
            [
              "margin-left: [n]em"
            ]
          ],
          [
            [
              "mb[n]em"
            ],
            [
              "margin-bottom: [n]em"
            ]
          ],
          [
            [
              "mlr[n]em"
            ],
            [
              "margin-left: [n]em ",
              "margin-right: [n]em"
            ]
          ],
          [
            [
              "mtb[n]em"
            ],
            [
              "margin-top: [n]em ",
              "margin-bottom: [n]em"
            ]
          ],
          [
            [
              "m[n]em"
            ],
            [
              "margin: [n]em"
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
              "bt[n]em"
            ],
            [
              "border-top-width: [n]em ",
              "border-top-style: solid"
            ]
          ],
          [
            [
              "br[n]em"
            ],
            [
              "border-right-width: [n]em ",
              "border-right-style: solid"
            ]
          ],
          [
            [
              "bl[n]em"
            ],
            [
              "border-left-width: [n]em ",
              "border-left-style: solid"
            ]
          ],
          [
            [
              "bb[n]em"
            ],
            [
              "border-bottom-width: [n]em ",
              "border-bottom-style: solid"
            ]
          ],
          [
            [
              "blr[n]em"
            ],
            [
              "border-left-width: [n]em ",
              "border-right-width: [n]em ",
              "border-right-style: solid ",
              "border-left-style: solid"
            ]
          ],
          [
            [
              "btb[n]em"
            ],
            [
              "border-top-width: [n]em ",
              "border-bottom-width: [n]em ",
              "border-top-style: solid ",
              "border-bottom-style: solid"
            ]
          ],
          [
            [
              "b[n]em"
            ],
            [
              "border: [n]em"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": ""
      },
      {
        "type": "table",
        "id": "",
        "data": [
          [
            [
              "t[n]em"
            ],
            [
              "top: [n]em"
            ]
          ],
          [
            [
              "r[n]em"
            ],
            [
              "right: [n]em"
            ]
          ],
          [
            [
              "l[n]em"
            ],
            [
              "left: [n]em"
            ]
          ],
          [
            [
              "b[n]em"
            ],
            [
              "bottom: [n]em"
            ]
          ],
          [
            [
              "lr[n]em"
            ],
            [
              "left: [n]em ",
              "right: [n]em"
            ]
          ],
          [
            [
              "tb[n]em"
            ],
            [
              "top: [n]em ",
              "bottom: [n]em"
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
              "w",
              "width"
            ],
            [
              "width: [n]em"
            ]
          ],
          [
            [
              "w",
              "width"
            ],
            [
              "width: [n]px"
            ]
          ],
          [
            [
              "w",
              "width"
            ],
            [
              "width: [n]%"
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
              "h",
              "height"
            ],
            [
              "height: [n]em"
            ]
          ],
          [
            [
              "h",
              "height"
            ],
            [
              "height: [n]px"
            ]
          ],
          [
            [
              "h",
              "height"
            ],
            [
              "height: [n]%"
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
              "basis",
              "flex",
              "fx"
            ],
            [
              "flex-basis: [n]em"
            ]
          ],
          [
            [
              "basis",
              "flex",
              "fx"
            ],
            [
              "flex-basis: [n]px"
            ]
          ],
          [
            [
              "basis",
              "flex",
              "fx"
            ],
            [
              "flex-basis: [n]%"
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
              "radius",
              "round"
            ],
            [
              "border-radius: [n]em"
            ]
          ],
          [
            [
              "radius",
              "round"
            ],
            [
              "border-radius: [n]px"
            ]
          ],
          [
            [
              "radius",
              "round"
            ],
            [
              "border-radius: [n]%"
            ]
          ]
        ]
      },
      {
        "type": "h3",
        "id": "background-position"
      },
      {
        "type": "table",
        "id": "background-position",
        "data": [
          [
            [
              "bgpos"
            ],
            [
              "background-position: [n1]% [n2]%"
            ]
          ]
        ]
      }
    ];

    /* src/Table.svelte generated by Svelte v3.31.0 */
    const file = "src/Table.svelte";

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
    			if (dirty & /*api, title*/ 1) {
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
    	let tr_id_value;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = space();
    			attr_dev(td0, "class", "p0-8");
    			add_location(td0, file, 12, 4, 203);
    			add_location(td1, file, 13, 4, 239);
    			attr_dev(tr, "id", tr_id_value = /*sect*/ ctx[1].id);
    			attr_dev(tr, "class", "filled bright");
    			add_location(tr, file, 11, 3, 158);
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
    	let t_value = /*rule*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "rule plain");
    			add_location(div, file, 29, 8, 548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
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
    	let t0_value = /*title*/ ctx[0](/*line*/ ctx[4][0]) + "";
    	let t0;
    	let a_title_value;
    	let t1;
    	let td1;
    	let t2;
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
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(span, file, 22, 8, 412);
    			attr_dev(a, "class", "class plain");
    			attr_dev(a, "title", a_title_value = /*title*/ ctx[0](/*line*/ ctx[4][0]));
    			add_location(a, file, 21, 7, 357);
    			add_location(td0, file, 20, 6, 345);
    			add_location(td1, file, 27, 6, 504);
    			attr_dev(tr, "class", "bb1-solid fade cptb1");
    			add_location(tr, file, 19, 5, 305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, span);
    			append_dev(span, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td1, null);
    			}

    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1 && t0_value !== (t0_value = /*title*/ ctx[0](/*line*/ ctx[4][0]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*title*/ 1 && a_title_value !== (a_title_value = /*title*/ ctx[0](/*line*/ ctx[4][0]))) {
    				attr_dev(a, "title", a_title_value);
    			}

    			if (dirty & /*api*/ 0) {
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

    // (8:1) {#each api as sect}
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
    		source: "(8:1) {#each api as sect}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let table;
    	let each_value = api;
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
    			add_location(table, file, 5, 0, 89);
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
    			if (dirty & /*api, title*/ 1) {
    				each_value = api;
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ api, title });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	let title;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(0, title = l => "." + l.join(", ."));
    	return [title];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Twelve.svelte generated by Svelte v3.31.0 */

    const file$1 = "src/Twelve.svelte";

    function create_fragment$1(ctx) {
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
    			add_location(div0, file$1, 1, 4, 25);
    			attr_dev(div1, "class", "col-6 b1-dashed h2em");
    			add_location(div1, file$1, 7, 6, 212);
    			attr_dev(div2, "class", "col-6 b1-dashed h4em");
    			add_location(div2, file$1, 8, 6, 259);
    			attr_dev(div3, "class", "twelve");
    			add_location(div3, file$1, 6, 5, 185);
    			attr_dev(div4, "class", "col-6 b1-solid color-c");
    			add_location(div4, file$1, 4, 4, 115);
    			attr_dev(div5, "class", "twelve");
    			add_location(div5, file$1, 0, 0, 0);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Twelve", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Twelve> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Twelve extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Twelve",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/GUI.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;
    const file$2 = "src/GUI.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (78:2) {#each Object.keys(guis) as k}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*k*/ ctx[1] + "";
    	let t0;
    	let t1;
    	let td1;
    	let pre;
    	let t2_value = /*guis*/ ctx[0][/*k*/ ctx[1]] + "";
    	let t2;
    	let t3;
    	let td2;
    	let div;
    	let raw_value = /*guis*/ ctx[0][/*k*/ ctx[1]] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			pre = element("pre");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			div = element("div");
    			t4 = space();
    			add_location(td0, file$2, 79, 4, 1569);
    			add_location(pre, file$2, 80, 8, 1590);
    			add_location(td1, file$2, 80, 4, 1586);
    			attr_dev(div, "class", "flex flex-column align-items-start");
    			add_location(div, file$2, 81, 8, 1624);
    			add_location(td2, file$2, 81, 4, 1620);
    			add_location(tr, file$2, 78, 3, 1560);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, pre);
    			append_dev(pre, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, div);
    			div.innerHTML = raw_value;
    			append_dev(tr, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(78:2) {#each Object.keys(guis) as k}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t3;
    	let td2;
    	let t5;
    	let tbody;
    	let each_value = Object.keys(/*guis*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "what";
    			t1 = space();
    			td1 = element("td");
    			td1.textContent = "code";
    			t3 = space();
    			td2 = element("td");
    			td2.textContent = "example";
    			t5 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(td0, file$2, 71, 3, 1446);
    			add_location(td1, file$2, 72, 3, 1463);
    			add_location(td2, file$2, 73, 3, 1480);
    			add_location(tr, file$2, 70, 2, 1438);
    			attr_dev(thead, "class", "bright");
    			add_location(thead, file$2, 69, 1, 1413);
    			add_location(tbody, file$2, 76, 1, 1516);
    			attr_dev(table, "class", "w100");
    			add_location(table, file$2, 68, 0, 1391);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(table, t5);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*guis, Object*/ 1) {
    				each_value = Object.keys(/*guis*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GUI", slots, []);

    	const guis = {
    		buttons: `
<button>button</button>
<button class="filled ok">filled button</button>
<button class="edged success">edged button</button>
`,
    		links: `
<a href="#" class="bb1-solid">underlined link</a>
<a href="#" class="bb1-solid color-a">color-a link</a>
<a href="#" class="bb1-solid color-b">color-b link</a>
<a href="#" class="bb1-solid color-c">color-c link</a>
<a href="#" class="bb1-solid color-d">color-d link</a>
<a href="#" class="bb1-solid color-e">color-e link</a>
<a href="#" class="bb1-solid color-f">color-f link</a>
`,
    		inputs: `
<input type="text" placeholder="text input" />
<input type="range" min=0 max=100 value=50 />
<textarea rows=4 placeholder="textarea"></textarea>
<div class="select">
	<select class="p1 pr2">
		<option>option a</option>
		<option>option b</option>
		<option>option c</option>
	</select>
</div>
<select class="arrow p1">
	<option>option a</option>
	<option>option b</option>
	<option>option c</option>
</select>

`,
    		fontsizes: `
<!-- uses golden ratio -->

<h1>h1</h1>
<div class="f6">.f6</div>

<h3>h3</h3>
<div class="f5">.f5</div>

<h3>h3</h3>
<div class="f4">.f4</div>

<h4>h4</h4>
<div class="f3">.f3</div>

<big>big</big> // aka .f3

<h5>h5</h5>
<div class="f2">.f2</div>

<h6>h6</h6>
<div class="f1">.f1</div>

<small>small</small> // aka .f1
`,
    		shapes: `
<div class="w8em h8em relative cross"></div>
`
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GUI> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ guis });
    	return [guis];
    }

    class GUI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GUI",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Flex.svelte generated by Svelte v3.31.0 */

    const file$3 = "src/Flex.svelte";

    function create_fragment$3(ctx) {
    	let div13;
    	let div4;
    	let div2;
    	let div0;
    	let t0;
    	let span0;
    	let t1;
    	let div1;
    	let t2;
    	let span1;
    	let t3;
    	let div3;
    	let t4;
    	let span2;
    	let t5;
    	let div11;
    	let div5;
    	let t6;
    	let span3;
    	let t7;
    	let div6;
    	let t8;
    	let span4;
    	let t9;
    	let div9;
    	let div7;
    	let t10;
    	let span5;
    	let t11;
    	let div8;
    	let t12;
    	let span6;
    	let t13;
    	let div10;
    	let t14;
    	let span7;
    	let t15;
    	let div12;

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			span0 = element("span");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			span2 = element("span");
    			t5 = space();
    			div11 = element("div");
    			div5 = element("div");
    			t6 = space();
    			span3 = element("span");
    			t7 = space();
    			div6 = element("div");
    			t8 = space();
    			span4 = element("span");
    			t9 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t10 = space();
    			span5 = element("span");
    			t11 = space();
    			div8 = element("div");
    			t12 = space();
    			span6 = element("span");
    			t13 = space();
    			div10 = element("div");
    			t14 = space();
    			span7 = element("span");
    			t15 = space();
    			div12 = element("div");
    			attr_dev(div0, "class", "grow b1-dotted cross");
    			add_location(div0, file$3, 5, 3, 145);
    			attr_dev(span0, "class", "spacer s4 cross error");
    			add_location(span0, file$3, 8, 3, 198);
    			attr_dev(div1, "class", "grow b1-dotted cross");
    			add_location(div1, file$3, 9, 3, 240);
    			attr_dev(div2, "class", "grow b1-dotted flex flex-row");
    			add_location(div2, file$3, 3, 2, 95);
    			attr_dev(span1, "class", "spacer s4 cross error");
    			add_location(span1, file$3, 13, 2, 301);
    			attr_dev(div3, "class", "grow b1-dotted cross");
    			add_location(div3, file$3, 14, 2, 342);
    			attr_dev(div4, "class", "flex b1-dashed grow w40 flex-column");
    			add_location(div4, file$3, 1, 1, 40);
    			attr_dev(span2, "class", "spacer s6 cross error");
    			add_location(span2, file$3, 18, 1, 399);
    			attr_dev(div5, "class", "grow b1-dotted cross");
    			add_location(div5, file$3, 20, 2, 487);
    			attr_dev(span3, "class", "spacer s4 cross error");
    			add_location(span3, file$3, 23, 2, 537);
    			attr_dev(div6, "class", "grow b1-dotted cross");
    			add_location(div6, file$3, 24, 2, 578);
    			attr_dev(span4, "class", "spacer s4 cross error");
    			add_location(span4, file$3, 27, 2, 628);
    			attr_dev(div7, "class", "cross grow");
    			add_location(div7, file$3, 29, 3, 718);
    			attr_dev(span5, "class", "spacer s4 cross error");
    			add_location(span5, file$3, 30, 3, 748);
    			attr_dev(div8, "class", "cross grow");
    			add_location(div8, file$3, 31, 3, 790);
    			attr_dev(div9, "class", "grow b1-dotted flex flex-column");
    			add_location(div9, file$3, 28, 2, 669);
    			attr_dev(span6, "class", "spacer s4 cross error");
    			add_location(span6, file$3, 33, 2, 828);
    			attr_dev(div10, "class", "grow b1-dotted cross");
    			add_location(div10, file$3, 34, 2, 869);
    			attr_dev(div11, "class", "flex flex-column b1-dashed grow");
    			add_location(div11, file$3, 19, 1, 439);
    			attr_dev(span7, "class", "spacer s8 cross error");
    			add_location(span7, file$3, 38, 1, 926);
    			attr_dev(div12, "class", "flex b1-dashed w20 cross");
    			add_location(div12, file$3, 39, 1, 966);
    			attr_dev(div13, "class", "flex flex-row w100 h80em");
    			add_location(div13, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, span0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div4, t2);
    			append_dev(div4, span1);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div13, t4);
    			append_dev(div13, span2);
    			append_dev(div13, t5);
    			append_dev(div13, div11);
    			append_dev(div11, div5);
    			append_dev(div11, t6);
    			append_dev(div11, span3);
    			append_dev(div11, t7);
    			append_dev(div11, div6);
    			append_dev(div11, t8);
    			append_dev(div11, span4);
    			append_dev(div11, t9);
    			append_dev(div11, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, span5);
    			append_dev(div9, t11);
    			append_dev(div9, div8);
    			append_dev(div11, t12);
    			append_dev(div11, span6);
    			append_dev(div11, t13);
    			append_dev(div11, div10);
    			append_dev(div13, t14);
    			append_dev(div13, span7);
    			append_dev(div13, t15);
    			append_dev(div13, div12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
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
    	validate_slots("Flex", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Flex> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Flex extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flex",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "src/App.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (31:6) {#each Object.keys( themes ) as t}
    function create_each_block_2$1(ctx) {
    	let option;
    	let t_value = /*t*/ ctx[10] + "";
    	let t;
    	let option_value_value;
    	let option_name_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*t*/ ctx[10];
    			option.value = option.__value;
    			attr_dev(option, "name", option_name_value = /*t*/ ctx[10]);
    			add_location(option, file$4, 31, 7, 931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(31:6) {#each Object.keys( themes ) as t}",
    		ctx
    	});

    	return block;
    }

    // (40:6) {#each themes[theme] as t}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*t*/ ctx[10] + "";
    	let t;
    	let option_value_value;
    	let option_name_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*t*/ ctx[10];
    			option.value = option.__value;
    			attr_dev(option, "name", option_name_value = /*t*/ ctx[10]);
    			add_location(option, file$4, 40, 7, 1212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1 && t_value !== (t_value = /*t*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*theme, Object, themes*/ 5 && option_value_value !== (option_value_value = /*t*/ ctx[10])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*theme, Object, themes*/ 5 && option_name_value !== (option_name_value = /*t*/ ctx[10])) {
    				attr_dev(option, "name", option_name_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(40:6) {#each themes[theme] as t}",
    		ctx
    	});

    	return block;
    }

    // (49:5) {#if !sect.data  }
    function create_if_block$1(ctx) {
    	let a;
    	let t_value = /*sect*/ ctx[7].id + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "#" + /*sect*/ ctx[7].id);
    			add_location(a, file$4, 49, 6, 1493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:5) {#if !sect.data  }",
    		ctx
    	});

    	return block;
    }

    // (48:4) {#each api as sect}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = !/*sect*/ ctx[7].data && create_if_block$1(ctx);

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
    			if (!/*sect*/ ctx[7].data) if_block.p(ctx, dirty);
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
    		source: "(48:4) {#each api as sect}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let div8;
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let select0;
    	let t2;
    	let div1;
    	let select1;
    	let t3;
    	let p;
    	let t5;
    	let t6;
    	let div7;
    	let table;
    	let t7;
    	let div4;
    	let twelve;
    	let t8;
    	let div5;
    	let gui;
    	let t9;
    	let div6;
    	let flex;
    	let main_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = Object.keys(/*themes*/ ctx[2]);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*themes*/ ctx[2][/*theme*/ ctx[0]];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = api;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	table = new Table({ $$inline: true });
    	twelve = new Twelve({ $$inline: true });
    	gui = new GUI({ $$inline: true });
    	flex = new Flex({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div8 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Crème de Sassis";
    			t1 = space();
    			div0 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			select1 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			p = element("p");
    			p.textContent = "Lightweight SASS mixins and boilerplate, and shorthand CSS utilities (a bit like Tailwind, but less of it). Designed to be grokkable.";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div7 = element("div");
    			create_component(table.$$.fragment);
    			t7 = space();
    			div4 = element("div");
    			create_component(twelve.$$.fragment);
    			t8 = space();
    			div5 = element("div");
    			create_component(gui.$$.fragment);
    			t9 = space();
    			div6 = element("div");
    			create_component(flex.$$.fragment);
    			attr_dev(h1, "class", "bright mr1");
    			add_location(h1, file$4, 27, 4, 674);
    			if (/*theme*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[3].call(select0));
    			add_location(select0, file$4, 29, 5, 748);
    			attr_dev(div0, "class", "select");
    			add_location(div0, file$4, 28, 4, 722);
    			if (/*permutation*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[5].call(select1));
    			add_location(select1, file$4, 36, 5, 1041);
    			attr_dev(div1, "class", "select");
    			add_location(div1, file$4, 35, 4, 1015);
    			add_location(p, file$4, 45, 4, 1297);
    			attr_dev(div2, "class", "flex column cptb0-4");
    			add_location(div2, file$4, 25, 3, 635);
    			attr_dev(div3, "class", "basis20pc");
    			add_location(div3, file$4, 24, 2, 608);
    			attr_dev(div4, "class", "mb4");
    			add_location(div4, file$4, 56, 3, 1607);
    			attr_dev(div5, "class", " mb4");
    			add_location(div5, file$4, 59, 3, 1653);
    			attr_dev(div6, "class", " mb4");
    			add_location(div6, file$4, 62, 3, 1697);
    			attr_dev(div7, "class", "grow");
    			add_location(div7, file$4, 54, 2, 1572);
    			attr_dev(div8, "class", "flex");
    			add_location(div8, file$4, 23, 1, 587);
    			attr_dev(main, "class", main_class_value = " " + /*theme*/ ctx[0] + " " + /*theme*/ ctx[0] + "-" + /*permutation*/ ctx[1]);
    			attr_dev(main, "id", "main");
    			add_location(main, file$4, 20, 0, 528);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div8);
    			append_dev(div8, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*theme*/ ctx[0]);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, select1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*permutation*/ ctx[1]);
    			append_dev(div2, t3);
    			append_dev(div2, p);
    			append_dev(div2, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			mount_component(table, div7, null);
    			append_dev(div7, t7);
    			append_dev(div7, div4);
    			mount_component(twelve, div4, null);
    			append_dev(div7, t8);
    			append_dev(div7, div5);
    			mount_component(gui, div5, null);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			mount_component(flex, div6, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[3]),
    					listen_dev(select0, "change", /*change_handler*/ ctx[4], false, false, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[5]),
    					listen_dev(select1, "change", /*change_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, themes*/ 4) {
    				each_value_2 = Object.keys(/*themes*/ ctx[2]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*theme, Object, themes*/ 5) {
    				select_option(select0, /*theme*/ ctx[0]);
    			}

    			if (dirty & /*themes, theme*/ 5) {
    				each_value_1 = /*themes*/ ctx[2][/*theme*/ ctx[0]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*permutation, themes, theme*/ 7) {
    				select_option(select1, /*permutation*/ ctx[1]);
    			}

    			if (dirty & /*api*/ 0) {
    				each_value = api;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*theme, permutation, Object, themes*/ 7 && main_class_value !== (main_class_value = " " + /*theme*/ ctx[0] + " " + /*theme*/ ctx[0] + "-" + /*permutation*/ ctx[1])) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			transition_in(twelve.$$.fragment, local);
    			transition_in(gui.$$.fragment, local);
    			transition_in(flex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			transition_out(twelve.$$.fragment, local);
    			transition_out(gui.$$.fragment, local);
    			transition_out(flex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(table);
    			destroy_component(twelve);
    			destroy_component(gui);
    			destroy_component(flex);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("App", slots, []);

    	const themes = {
    		"raw": ["none", "aqua", "fuscia", "dark"],
    		"terminal": ["light", "dark"],
    		"brainwash": ["creeper", "muzak"],
    		"skeueish": ["ives"]
    	};

    	let theme = window.localStorage.getItem("sassis-theme") || Object.keys(themes)[0];
    	let permutation = window.localStorage.getItem("sassis-permutation") || themes[theme][0];
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		theme = select_value(this);
    		$$invalidate(0, theme);
    		$$invalidate(2, themes);
    	}

    	const change_handler = e => {
    		window.localStorage.setItem("sassis-theme", theme);
    		$$invalidate(1, permutation = themes[theme][0]);
    	};

    	function select1_change_handler() {
    		permutation = select_value(this);
    		$$invalidate(1, permutation);
    		$$invalidate(2, themes);
    		$$invalidate(0, theme);
    	}

    	const change_handler_1 = e => window.localStorage.setItem("sassis-permutation", permutation);

    	$$self.$capture_state = () => ({
    		api,
    		Table,
    		Twelve,
    		GUI,
    		Flex,
    		themes,
    		theme,
    		permutation
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("permutation" in $$props) $$invalidate(1, permutation = $$props.permutation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		theme,
    		permutation,
    		themes,
    		select0_change_handler,
    		change_handler,
    		select1_change_handler,
    		change_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=docs.js.map
