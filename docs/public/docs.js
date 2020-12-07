
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

    /* src/Table.svelte generated by Svelte v3.31.0 */

    const file = "src/Table.svelte";

    function create_fragment(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let td0;
    	let td1;
    	let td2;
    	let tbody;
    	let tr1;
    	let td3;
    	let td4;
    	let td5;
    	let t6;
    	let tr2;
    	let td6;
    	let td7;
    	let td8;
    	let t10;
    	let tr3;
    	let td9;
    	let td10;
    	let td11;
    	let t14;
    	let tr4;
    	let td12;
    	let td13;
    	let td14;
    	let t18;
    	let tr5;
    	let td15;
    	let td16;
    	let td17;
    	let t22;
    	let tr6;
    	let td18;
    	let td19;
    	let td20;
    	let t26;
    	let tr7;
    	let td21;
    	let td22;
    	let td23;
    	let t30;
    	let tr8;
    	let td24;
    	let td25;
    	let td26;
    	let t34;
    	let tr9;
    	let td27;
    	let td28;
    	let td29;
    	let t38;
    	let tr10;
    	let td30;
    	let td31;
    	let td32;
    	let t42;
    	let tr11;
    	let td33;
    	let td34;
    	let td35;
    	let t46;
    	let tr12;
    	let td36;
    	let td37;
    	let td38;
    	let t50;
    	let tr13;
    	let td39;
    	let td40;
    	let td41;
    	let t54;
    	let tr14;
    	let td42;
    	let td43;
    	let td44;
    	let t58;
    	let tr15;
    	let td45;
    	let td46;
    	let td47;
    	let t62;
    	let tr16;
    	let td48;
    	let td49;
    	let td50;
    	let t66;
    	let tr17;
    	let td51;
    	let td52;
    	let td53;
    	let t70;
    	let tr18;
    	let td54;
    	let td55;
    	let td56;
    	let t74;
    	let tr19;
    	let td57;
    	let td58;
    	let td59;
    	let t78;
    	let tr20;
    	let td60;
    	let td61;
    	let td62;
    	let t82;
    	let tr21;
    	let td63;
    	let td64;
    	let td65;
    	let t86;
    	let tr22;
    	let td66;
    	let td67;
    	let td68;
    	let t90;
    	let tr23;
    	let td69;
    	let td70;
    	let td71;
    	let t94;
    	let tr24;
    	let td72;
    	let td73;
    	let td74;
    	let t98;
    	let tr25;
    	let td75;
    	let td76;
    	let td77;
    	let t102;
    	let tr26;
    	let td78;
    	let td79;
    	let td80;
    	let t106;
    	let tr27;
    	let td81;
    	let td82;
    	let td83;
    	let t110;
    	let tr28;
    	let td84;
    	let td85;
    	let td86;
    	let t114;
    	let tr29;
    	let td87;
    	let td88;
    	let td89;
    	let t118;
    	let tr30;
    	let td90;
    	let td91;
    	let td92;
    	let t122;
    	let tr31;
    	let td93;
    	let td94;
    	let td95;
    	let t126;
    	let tr32;
    	let td96;
    	let td97;
    	let t129;
    	let td98;
    	let t130;
    	let tr33;
    	let td99;
    	let td100;
    	let t133;
    	let td101;
    	let t134;
    	let tr34;
    	let td102;
    	let td103;
    	let t137;
    	let td104;
    	let t138;
    	let tr35;
    	let td105;
    	let td106;
    	let t141;
    	let td107;
    	let t142;
    	let tr36;
    	let td108;
    	let td109;
    	let t145;
    	let td110;
    	let t146;
    	let tr37;
    	let td111;
    	let td112;
    	let t149;
    	let td113;
    	let t150;
    	let tr38;
    	let td114;
    	let td115;
    	let td116;
    	let t154;
    	let tr39;
    	let td117;
    	let td118;
    	let t157;
    	let tr40;
    	let td119;
    	let td120;
    	let t160;
    	let tr41;
    	let td121;
    	let td122;
    	let t163;
    	let tr42;
    	let td123;
    	let td124;
    	let t166;
    	let tr43;
    	let td125;
    	let td126;
    	let t169;
    	let tr44;
    	let td127;
    	let t170;
    	let br0;
    	let t171;
    	let td128;
    	let t172;
    	let br1;
    	let t173;
    	let t174;
    	let tr45;
    	let td129;
    	let t175;
    	let br2;
    	let t176;
    	let td130;
    	let t177;
    	let br3;
    	let t178;
    	let t179;
    	let tr46;
    	let td131;
    	let td132;
    	let t182;
    	let tr47;
    	let td133;
    	let td134;
    	let t185;
    	let tr48;
    	let td135;
    	let td136;
    	let t188;
    	let tr49;
    	let td137;
    	let td138;
    	let t191;
    	let tr50;
    	let td139;
    	let td140;
    	let t194;
    	let tr51;
    	let td141;
    	let td142;
    	let t197;
    	let tr52;
    	let td143;
    	let t198;
    	let br4;
    	let t199;
    	let td144;
    	let t200;
    	let br5;
    	let t201;
    	let t202;
    	let tr53;
    	let td145;
    	let t203;
    	let br6;
    	let t204;
    	let td146;
    	let t205;
    	let br7;
    	let t206;
    	let t207;
    	let tr54;
    	let td147;
    	let td148;
    	let t210;
    	let tr55;
    	let td149;
    	let td150;
    	let t212;
    	let br8;
    	let t213;
    	let t214;
    	let tr56;
    	let td151;
    	let t215;
    	let br9;
    	let t216;
    	let td152;
    	let t217;
    	let br10;
    	let t218;
    	let br11;
    	let t219;
    	let t220;
    	let tr57;
    	let td153;
    	let t221;
    	let br12;
    	let t222;
    	let td154;
    	let t223;
    	let br13;
    	let t224;
    	let br14;
    	let t225;
    	let t226;
    	let tr58;
    	let td155;
    	let td156;
    	let t228;
    	let br15;
    	let t229;
    	let t230;
    	let tr59;
    	let td157;
    	let td158;
    	let t232;
    	let br16;
    	let t233;
    	let t234;
    	let tr60;
    	let td159;
    	let td160;
    	let t236;
    	let br17;
    	let t237;
    	let t238;
    	let tr61;
    	let td161;
    	let td162;
    	let t240;
    	let br18;
    	let t241;
    	let t242;
    	let tr62;
    	let td163;
    	let td164;
    	let t245;
    	let tr63;
    	let td165;
    	let td166;
    	let t248;
    	let tr64;
    	let td167;
    	let td168;
    	let t251;
    	let tr65;
    	let td169;
    	let td170;
    	let t254;
    	let tr66;
    	let td171;
    	let td172;
    	let t257;
    	let tr67;
    	let td173;
    	let td174;
    	let t260;
    	let tr68;
    	let td175;
    	let td176;
    	let t263;
    	let tr69;
    	let td177;
    	let td178;
    	let t266;
    	let tr70;
    	let td179;
    	let td180;
    	let t269;
    	let tr71;
    	let td181;
    	let td182;
    	let t272;
    	let tr72;
    	let td183;
    	let td184;
    	let t275;
    	let tr73;
    	let td185;
    	let td186;
    	let t278;
    	let tr74;
    	let td187;
    	let td188;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "class";
    			td1 = element("td");
    			td1.textContent = "rule";
    			td2 = element("td");
    			td2.textContent = "mixin";
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td3 = element("td");
    			td3.textContent = ".absolute";
    			td4 = element("td");
    			td4.textContent = "position: absolute";
    			td5 = element("td");
    			td5.textContent = "+absolute";
    			t6 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = ".relative";
    			td7 = element("td");
    			td7.textContent = "position: relative";
    			td8 = element("td");
    			td8.textContent = "+relative";
    			t10 = space();
    			tr3 = element("tr");
    			td9 = element("td");
    			td9.textContent = ".fixed";
    			td10 = element("td");
    			td10.textContent = "position: fixed";
    			td11 = element("td");
    			td11.textContent = "+fixed";
    			t14 = space();
    			tr4 = element("tr");
    			td12 = element("td");
    			td12.textContent = ".table";
    			td13 = element("td");
    			td13.textContent = "display: table";
    			td14 = element("td");
    			td14.textContent = "+table";
    			t18 = space();
    			tr5 = element("tr");
    			td15 = element("td");
    			td15.textContent = ".inline-block";
    			td16 = element("td");
    			td16.textContent = "display: inline-block";
    			td17 = element("td");
    			td17.textContent = "+inline-block";
    			t22 = space();
    			tr6 = element("tr");
    			td18 = element("td");
    			td18.textContent = ".block";
    			td19 = element("td");
    			td19.textContent = "display: block";
    			td20 = element("td");
    			td20.textContent = "+block";
    			t26 = space();
    			tr7 = element("tr");
    			td21 = element("td");
    			td21.textContent = ".flex";
    			td22 = element("td");
    			td22.textContent = "display: flex";
    			td23 = element("td");
    			td23.textContent = "+flex";
    			t30 = space();
    			tr8 = element("tr");
    			td24 = element("td");
    			td24.textContent = ".flex-column";
    			td25 = element("td");
    			td25.textContent = "flex-direction: column";
    			td26 = element("td");
    			td26.textContent = "+flex-column";
    			t34 = space();
    			tr9 = element("tr");
    			td27 = element("td");
    			td27.textContent = ".column";
    			td28 = element("td");
    			td28.textContent = "flex-direction: column";
    			td29 = element("td");
    			td29.textContent = "+column";
    			t38 = space();
    			tr10 = element("tr");
    			td30 = element("td");
    			td30.textContent = ".flex-row";
    			td31 = element("td");
    			td31.textContent = "flex-direction: row";
    			td32 = element("td");
    			td32.textContent = "+flex-row";
    			t42 = space();
    			tr11 = element("tr");
    			td33 = element("td");
    			td33.textContent = ".row";
    			td34 = element("td");
    			td34.textContent = "flex-direction: row";
    			td35 = element("td");
    			td35.textContent = "+row";
    			t46 = space();
    			tr12 = element("tr");
    			td36 = element("td");
    			td36.textContent = ".grow";
    			td37 = element("td");
    			td37.textContent = "flex-grow: 1";
    			td38 = element("td");
    			td38.textContent = "+grow";
    			t50 = space();
    			tr13 = element("tr");
    			td39 = element("td");
    			td39.textContent = ".no-grow";
    			td40 = element("td");
    			td40.textContent = "flex-grow: 0";
    			td41 = element("td");
    			td41.textContent = "+no-grow";
    			t54 = space();
    			tr14 = element("tr");
    			td42 = element("td");
    			td42.textContent = ".shrink";
    			td43 = element("td");
    			td43.textContent = "flex-shrink: 1";
    			td44 = element("td");
    			td44.textContent = "+shrink";
    			t58 = space();
    			tr15 = element("tr");
    			td45 = element("td");
    			td45.textContent = ".no-shrink";
    			td46 = element("td");
    			td46.textContent = "flex-shrink: 0";
    			td47 = element("td");
    			td47.textContent = "+no-shrink";
    			t62 = space();
    			tr16 = element("tr");
    			td48 = element("td");
    			td48.textContent = ".no-basis";
    			td49 = element("td");
    			td49.textContent = "flex-basis: 0";
    			td50 = element("td");
    			td50.textContent = "+no-basis";
    			t66 = space();
    			tr17 = element("tr");
    			td51 = element("td");
    			td51.textContent = ".wrap";
    			td52 = element("td");
    			td52.textContent = "flex-wrap: wrap";
    			td53 = element("td");
    			td53.textContent = "+wrap";
    			t70 = space();
    			tr18 = element("tr");
    			td54 = element("td");
    			td54.textContent = ".no-wrap";
    			td55 = element("td");
    			td55.textContent = "flex-wrap: nowrap";
    			td56 = element("td");
    			td56.textContent = "+no-wrap";
    			t74 = space();
    			tr19 = element("tr");
    			td57 = element("td");
    			td57.textContent = ".border-box";
    			td58 = element("td");
    			td58.textContent = "box-sizing: border-box";
    			td59 = element("td");
    			td59.textContent = "+border-box";
    			t78 = space();
    			tr20 = element("tr");
    			td60 = element("td");
    			td60.textContent = ".text-left";
    			td61 = element("td");
    			td61.textContent = "text-align: left";
    			td62 = element("td");
    			td62.textContent = "+text-left";
    			t82 = space();
    			tr21 = element("tr");
    			td63 = element("td");
    			td63.textContent = ".text-center";
    			td64 = element("td");
    			td64.textContent = "text-align: center";
    			td65 = element("td");
    			td65.textContent = "+text-center";
    			t86 = space();
    			tr22 = element("tr");
    			td66 = element("td");
    			td66.textContent = ".text-right";
    			td67 = element("td");
    			td67.textContent = "text-align: right";
    			td68 = element("td");
    			td68.textContent = "+text-right";
    			t90 = space();
    			tr23 = element("tr");
    			td69 = element("td");
    			td69.textContent = ".italic";
    			td70 = element("td");
    			td70.textContent = "font-style: italic";
    			td71 = element("td");
    			td71.textContent = "+italic";
    			t94 = space();
    			tr24 = element("tr");
    			td72 = element("td");
    			td72.textContent = ".bold";
    			td73 = element("td");
    			td73.textContent = "font-weight: bold";
    			td74 = element("td");
    			td74.textContent = "+bold";
    			t98 = space();
    			tr25 = element("tr");
    			td75 = element("td");
    			td75.textContent = ".bolder";
    			td76 = element("td");
    			td76.textContent = "font-weight: bold";
    			td77 = element("td");
    			td77.textContent = "+bolder";
    			t102 = space();
    			tr26 = element("tr");
    			td78 = element("td");
    			td78.textContent = ".normal";
    			td79 = element("td");
    			td79.textContent = "font-weight: normal";
    			td80 = element("td");
    			td80.textContent = "+normal";
    			t106 = space();
    			tr27 = element("tr");
    			td81 = element("td");
    			td81.textContent = ".light";
    			td82 = element("td");
    			td82.textContent = "font-weight: light";
    			td83 = element("td");
    			td83.textContent = "+light";
    			t110 = space();
    			tr28 = element("tr");
    			td84 = element("td");
    			td84.textContent = ".lighter";
    			td85 = element("td");
    			td85.textContent = "font-weight: lighter";
    			td86 = element("td");
    			td86.textContent = "+lighter";
    			t114 = space();
    			tr29 = element("tr");
    			td87 = element("td");
    			td87.textContent = ".visible";
    			td88 = element("td");
    			td88.textContent = "opacity: 1";
    			td89 = element("td");
    			td89.textContent = "+visible";
    			t118 = space();
    			tr30 = element("tr");
    			td90 = element("td");
    			td90.textContent = ".invisible";
    			td91 = element("td");
    			td91.textContent = "opacity: 0";
    			td92 = element("td");
    			td92.textContent = "+invisible";
    			t122 = space();
    			tr31 = element("tr");
    			td93 = element("td");
    			td93.textContent = ".no-bg";
    			td94 = element("td");
    			td94.textContent = "background: transparent";
    			td95 = element("td");
    			td95.textContent = "+no-bg";
    			t126 = space();
    			tr32 = element("tr");
    			td96 = element("td");
    			td96.textContent = ".align-items-[center|start|end|flex-start|flex-end|stretch]";
    			td97 = element("td");
    			td97.textContent = "align-items: [option]";
    			t129 = text("+align-items-[center|start|end|flex-start|flex-end|stretch]");
    			td98 = element("td");
    			t130 = space();
    			tr33 = element("tr");
    			td99 = element("td");
    			td99.textContent = ".align-self-[center|start|end|flex-start|flex-end|stretch]";
    			td100 = element("td");
    			td100.textContent = "align-self: [option]";
    			t133 = text("+align-self-[center|start|end|flex-start|flex-end|stretch]");
    			td101 = element("td");
    			t134 = space();
    			tr34 = element("tr");
    			td102 = element("td");
    			td102.textContent = ".align-content-[center|start|end|flex-start|flex-end|stretch]";
    			td103 = element("td");
    			td103.textContent = "align-content: [option]";
    			t137 = text("+align-content-[center|start|end|flex-start|flex-end|stretch]");
    			td104 = element("td");
    			t138 = space();
    			tr35 = element("tr");
    			td105 = element("td");
    			td105.textContent = ".justify-items-[between|evenly|around|center|start|end|stretch|flex-start|flex-end]";
    			td106 = element("td");
    			td106.textContent = "justify-items: [option]";
    			t141 = text("+justify-items-[between|evenly|around|center|start|end|stretch|flex-start|flex-end]");
    			td107 = element("td");
    			t142 = space();
    			tr36 = element("tr");
    			td108 = element("td");
    			td108.textContent = ".justify-self-[between|evenly|around|center|start|end|stretch|flex-start|flex-end]";
    			td109 = element("td");
    			td109.textContent = "justify-self: [option]";
    			t145 = text("+justify-self-[between|evenly|around|center|start|end|stretch|flex-start|flex-end]");
    			td110 = element("td");
    			t146 = space();
    			tr37 = element("tr");
    			td111 = element("td");
    			td111.textContent = ".justify-content-[between|evenly|around|center|start|end|stretch|flex-start|flex-end]";
    			td112 = element("td");
    			td112.textContent = "justify-content: [option]";
    			t149 = text("+justify-content-[between|evenly|around|center|start|end|stretch|flex-start|flex-end]");
    			td113 = element("td");
    			t150 = space();
    			tr38 = element("tr");
    			td114 = element("td");
    			td114.textContent = ".twelve-[0-80]";
    			td115 = element("td");
    			td115.textContent = "(.col) padding: 0 [spacing] 0 [spacing]";
    			td116 = element("td");
    			td116.textContent = "+twelve( $spacing: 0em )";
    			t154 = space();
    			tr39 = element("tr");
    			td117 = element("td");
    			td117.textContent = ".p[0-80]";
    			td118 = element("td");
    			td118.textContent = "padding: [0-80]em";
    			t157 = space();
    			tr40 = element("tr");
    			td119 = element("td");
    			td119.textContent = ".pt[0-80]";
    			td120 = element("td");
    			td120.textContent = "padding-top: [0-80]em";
    			t160 = space();
    			tr41 = element("tr");
    			td121 = element("td");
    			td121.textContent = ".pr[0-80]";
    			td122 = element("td");
    			td122.textContent = "padding-right: [0-80]em";
    			t163 = space();
    			tr42 = element("tr");
    			td123 = element("td");
    			td123.textContent = ".pb[0-80]";
    			td124 = element("td");
    			td124.textContent = "padding-bottom: [0-80]em";
    			t166 = space();
    			tr43 = element("tr");
    			td125 = element("td");
    			td125.textContent = ".pl[0-80]";
    			td126 = element("td");
    			td126.textContent = "padding-left: [0-80]em";
    			t169 = space();
    			tr44 = element("tr");
    			td127 = element("td");
    			t170 = text(".ptb[0-80]");
    			br0 = element("br");
    			t171 = text(".pbt[0-80]");
    			td128 = element("td");
    			t172 = text("padding-top: [0-80]em");
    			br1 = element("br");
    			t173 = text("padding-bottom: [0-80]em");
    			t174 = space();
    			tr45 = element("tr");
    			td129 = element("td");
    			t175 = text(".plr[0-80]");
    			br2 = element("br");
    			t176 = text(".prl[0-80]");
    			td130 = element("td");
    			t177 = text("padding-left: [0-80]em");
    			br3 = element("br");
    			t178 = text("padding-right: [0-80]em");
    			t179 = space();
    			tr46 = element("tr");
    			td131 = element("td");
    			td131.textContent = ".s[0-80]";
    			td132 = element("td");
    			td132.textContent = "flex-basis: [0-80]em";
    			t182 = space();
    			tr47 = element("tr");
    			td133 = element("td");
    			td133.textContent = ".m[0-80]";
    			td134 = element("td");
    			td134.textContent = "margin: [0-80]em";
    			t185 = space();
    			tr48 = element("tr");
    			td135 = element("td");
    			td135.textContent = ".mt[0-80]";
    			td136 = element("td");
    			td136.textContent = "margin-top: [0-80]em";
    			t188 = space();
    			tr49 = element("tr");
    			td137 = element("td");
    			td137.textContent = ".mr[0-80]";
    			td138 = element("td");
    			td138.textContent = "margin-right: [0-80]em";
    			t191 = space();
    			tr50 = element("tr");
    			td139 = element("td");
    			td139.textContent = ".mb[0-80]";
    			td140 = element("td");
    			td140.textContent = "margin-bottom: [0-80]em";
    			t194 = space();
    			tr51 = element("tr");
    			td141 = element("td");
    			td141.textContent = ".ml[0-80]";
    			td142 = element("td");
    			td142.textContent = "margin-left: [0-80]em";
    			t197 = space();
    			tr52 = element("tr");
    			td143 = element("td");
    			t198 = text(".mtb[0-80]");
    			br4 = element("br");
    			t199 = text(".mbt[0-80]");
    			td144 = element("td");
    			t200 = text("margin-top: [0-80]em");
    			br5 = element("br");
    			t201 = text("margin-bottom: [0-80]em");
    			t202 = space();
    			tr53 = element("tr");
    			td145 = element("td");
    			t203 = text(".mlr[0-80]");
    			br6 = element("br");
    			t204 = text(".mrl[0-80]");
    			td146 = element("td");
    			t205 = text("margin-left: [0-80]em");
    			br7 = element("br");
    			t206 = text("margin-right: [0-80]em");
    			t207 = space();
    			tr54 = element("tr");
    			td147 = element("td");
    			td147.textContent = ".s[0-80]";
    			td148 = element("td");
    			td148.textContent = "flex-basis: [0-80]em";
    			t210 = space();
    			tr55 = element("tr");
    			td149 = element("td");
    			td149.textContent = ".b[0-8]-[solid|dashed|dotted]";
    			td150 = element("td");
    			t212 = text("border-width: [0-8]px");
    			br8 = element("br");
    			t213 = text("border-style: [solid|dashed|dotted]");
    			t214 = space();
    			tr56 = element("tr");
    			td151 = element("td");
    			t215 = text(".btb[0-8]-[solid|dashed|dotted]");
    			br9 = element("br");
    			t216 = text(".bbt[0-8]-[solid|dashed|dotted]");
    			td152 = element("td");
    			t217 = text("border-top-width: [0-8]px");
    			br10 = element("br");
    			t218 = text("border-bottom-width: [0-8]px");
    			br11 = element("br");
    			t219 = text("border-style: [solid|dashed|dotted]");
    			t220 = space();
    			tr57 = element("tr");
    			td153 = element("td");
    			t221 = text(".blr[0-8]-[solid|dashed|dotted]");
    			br12 = element("br");
    			t222 = text(".brl[0-8]-[solid|dashed|dotted]");
    			td154 = element("td");
    			t223 = text("border-left-width: [0-8]px");
    			br13 = element("br");
    			t224 = text("border-right-width: [0-8]px");
    			br14 = element("br");
    			t225 = text("border-style: [solid|dashed|dotted]");
    			t226 = space();
    			tr58 = element("tr");
    			td155 = element("td");
    			td155.textContent = ".br[0-8]-[solid|dashed|dotted]";
    			td156 = element("td");
    			t228 = text("border-right-width: [0-8]px");
    			br15 = element("br");
    			t229 = text("border-style: [solid|dashed|dotted]");
    			t230 = space();
    			tr59 = element("tr");
    			td157 = element("td");
    			td157.textContent = ".bt[0-8]-[solid|dashed|dotted]";
    			td158 = element("td");
    			t232 = text("border-top-width: [0-8]px");
    			br16 = element("br");
    			t233 = text("border-style: [solid|dashed|dotted]");
    			t234 = space();
    			tr60 = element("tr");
    			td159 = element("td");
    			td159.textContent = ".bb[0-8]-[solid|dashed|dotted]";
    			td160 = element("td");
    			t236 = text("border-bottom-width: [0-8]px");
    			br17 = element("br");
    			t237 = text("border-style: [solid|dashed|dotted]");
    			t238 = space();
    			tr61 = element("tr");
    			td161 = element("td");
    			td161.textContent = ".bl[0-8]-[solid|dashed|dotted]";
    			td162 = element("td");
    			t240 = text("border-left-width: [0-8]px");
    			br18 = element("br");
    			t241 = text("border-style: [solid|dashed|dotted]");
    			t242 = space();
    			tr62 = element("tr");
    			td163 = element("td");
    			td163.textContent = ".t[0-100]";
    			td164 = element("td");
    			td164.textContent = "top: [0-100]%";
    			t245 = space();
    			tr63 = element("tr");
    			td165 = element("td");
    			td165.textContent = ".t[0-100]em";
    			td166 = element("td");
    			td166.textContent = "top: [0-100]em";
    			t248 = space();
    			tr64 = element("tr");
    			td167 = element("td");
    			td167.textContent = ".l[0-100]";
    			td168 = element("td");
    			td168.textContent = "left: [0-100]%";
    			t251 = space();
    			tr65 = element("tr");
    			td169 = element("td");
    			td169.textContent = ".l[0-100]em";
    			td170 = element("td");
    			td170.textContent = "left: [0-100]em";
    			t254 = space();
    			tr66 = element("tr");
    			td171 = element("td");
    			td171.textContent = ".b[0-100]";
    			td172 = element("td");
    			td172.textContent = "bottom: [0-100]%";
    			t257 = space();
    			tr67 = element("tr");
    			td173 = element("td");
    			td173.textContent = ".b[0-100]em";
    			td174 = element("td");
    			td174.textContent = "bottom: [0-100]em";
    			t260 = space();
    			tr68 = element("tr");
    			td175 = element("td");
    			td175.textContent = ".r[0-100]";
    			td176 = element("td");
    			td176.textContent = "right: [0-100]%";
    			t263 = space();
    			tr69 = element("tr");
    			td177 = element("td");
    			td177.textContent = ".r[0-100]em";
    			td178 = element("td");
    			td178.textContent = "right: [0-100]em";
    			t266 = space();
    			tr70 = element("tr");
    			td179 = element("td");
    			td179.textContent = ".w[0-100]";
    			td180 = element("td");
    			td180.textContent = "width: [0-100]%";
    			t269 = space();
    			tr71 = element("tr");
    			td181 = element("td");
    			td181.textContent = ".w[0-100]em";
    			td182 = element("td");
    			td182.textContent = "width: [0-100]em";
    			t272 = space();
    			tr72 = element("tr");
    			td183 = element("td");
    			td183.textContent = ".h[0-100]";
    			td184 = element("td");
    			td184.textContent = "height: [0-100]%";
    			t275 = space();
    			tr73 = element("tr");
    			td185 = element("td");
    			td185.textContent = ".h[0-100]em";
    			td186 = element("td");
    			td186.textContent = "height: [0-100]em";
    			t278 = space();
    			tr74 = element("tr");
    			td187 = element("td");
    			td187.textContent = ".o[0-100]";
    			td188 = element("td");
    			td188.textContent = "transform-origin: [0-100]% [0-100]%";
    			add_location(td0, file, 1, 26, 48);
    			add_location(td1, file, 1, 40, 62);
    			add_location(td2, file, 1, 53, 75);
    			add_location(tr0, file, 1, 22, 44);
    			attr_dev(thead, "class", "bright");
    			add_location(thead, file, 1, 0, 22);
    			add_location(td3, file, 2, 4, 114);
    			add_location(td4, file, 2, 22, 132);
    			add_location(td5, file, 2, 49, 159);
    			add_location(tr1, file, 2, 0, 110);
    			add_location(td6, file, 3, 4, 187);
    			add_location(td7, file, 3, 22, 205);
    			add_location(td8, file, 3, 49, 232);
    			add_location(tr2, file, 3, 0, 183);
    			add_location(td9, file, 4, 4, 260);
    			add_location(td10, file, 4, 19, 275);
    			add_location(td11, file, 4, 43, 299);
    			add_location(tr3, file, 4, 0, 256);
    			add_location(td12, file, 5, 4, 324);
    			add_location(td13, file, 5, 19, 339);
    			add_location(td14, file, 5, 42, 362);
    			add_location(tr4, file, 5, 0, 320);
    			add_location(td15, file, 6, 4, 387);
    			add_location(td16, file, 6, 26, 409);
    			add_location(td17, file, 6, 56, 439);
    			add_location(tr5, file, 6, 0, 383);
    			add_location(td18, file, 7, 4, 471);
    			add_location(td19, file, 7, 19, 486);
    			add_location(td20, file, 7, 42, 509);
    			add_location(tr6, file, 7, 0, 467);
    			add_location(td21, file, 8, 4, 534);
    			add_location(td22, file, 8, 18, 548);
    			add_location(td23, file, 8, 40, 570);
    			add_location(tr7, file, 8, 0, 530);
    			add_location(td24, file, 9, 4, 594);
    			add_location(td25, file, 9, 25, 615);
    			add_location(td26, file, 9, 56, 646);
    			add_location(tr8, file, 9, 0, 590);
    			add_location(td27, file, 10, 4, 677);
    			add_location(td28, file, 10, 20, 693);
    			add_location(td29, file, 10, 51, 724);
    			add_location(tr9, file, 10, 0, 673);
    			add_location(td30, file, 11, 4, 750);
    			add_location(td31, file, 11, 22, 768);
    			add_location(td32, file, 11, 50, 796);
    			add_location(tr10, file, 11, 0, 746);
    			add_location(td33, file, 12, 4, 824);
    			add_location(td34, file, 12, 17, 837);
    			add_location(td35, file, 12, 45, 865);
    			add_location(tr11, file, 12, 0, 820);
    			add_location(td36, file, 13, 4, 888);
    			add_location(td37, file, 13, 18, 902);
    			add_location(td38, file, 13, 39, 923);
    			add_location(tr12, file, 13, 0, 884);
    			add_location(td39, file, 14, 4, 947);
    			add_location(td40, file, 14, 21, 964);
    			add_location(td41, file, 14, 42, 985);
    			add_location(tr13, file, 14, 0, 943);
    			add_location(td42, file, 15, 4, 1012);
    			add_location(td43, file, 15, 20, 1028);
    			add_location(td44, file, 15, 43, 1051);
    			add_location(tr14, file, 15, 0, 1008);
    			add_location(td45, file, 16, 4, 1077);
    			add_location(td46, file, 16, 23, 1096);
    			add_location(td47, file, 16, 46, 1119);
    			add_location(tr15, file, 16, 0, 1073);
    			add_location(td48, file, 17, 4, 1148);
    			add_location(td49, file, 17, 22, 1166);
    			add_location(td50, file, 17, 44, 1188);
    			add_location(tr16, file, 17, 0, 1144);
    			add_location(td51, file, 18, 4, 1216);
    			add_location(td52, file, 18, 18, 1230);
    			add_location(td53, file, 18, 42, 1254);
    			add_location(tr17, file, 18, 0, 1212);
    			add_location(td54, file, 19, 4, 1278);
    			add_location(td55, file, 19, 21, 1295);
    			add_location(td56, file, 19, 47, 1321);
    			add_location(tr18, file, 19, 0, 1274);
    			add_location(td57, file, 20, 4, 1348);
    			add_location(td58, file, 20, 24, 1368);
    			add_location(td59, file, 20, 55, 1399);
    			add_location(tr19, file, 20, 0, 1344);
    			add_location(td60, file, 21, 4, 1429);
    			add_location(td61, file, 21, 23, 1448);
    			add_location(td62, file, 21, 48, 1473);
    			add_location(tr20, file, 21, 0, 1425);
    			add_location(td63, file, 22, 4, 1502);
    			add_location(td64, file, 22, 25, 1523);
    			add_location(td65, file, 22, 52, 1550);
    			add_location(tr21, file, 22, 0, 1498);
    			add_location(td66, file, 23, 4, 1581);
    			add_location(td67, file, 23, 24, 1601);
    			add_location(td68, file, 23, 50, 1627);
    			add_location(tr22, file, 23, 0, 1577);
    			add_location(td69, file, 24, 4, 1657);
    			add_location(td70, file, 24, 20, 1673);
    			add_location(td71, file, 24, 47, 1700);
    			add_location(tr23, file, 24, 0, 1653);
    			add_location(td72, file, 25, 4, 1726);
    			add_location(td73, file, 25, 18, 1740);
    			add_location(td74, file, 25, 44, 1766);
    			add_location(tr24, file, 25, 0, 1722);
    			add_location(td75, file, 26, 4, 1790);
    			add_location(td76, file, 26, 20, 1806);
    			add_location(td77, file, 26, 46, 1832);
    			add_location(tr25, file, 26, 0, 1786);
    			add_location(td78, file, 27, 4, 1858);
    			add_location(td79, file, 27, 20, 1874);
    			add_location(td80, file, 27, 48, 1902);
    			add_location(tr26, file, 27, 0, 1854);
    			add_location(td81, file, 28, 4, 1928);
    			add_location(td82, file, 28, 19, 1943);
    			add_location(td83, file, 28, 46, 1970);
    			add_location(tr27, file, 28, 0, 1924);
    			add_location(td84, file, 29, 4, 1995);
    			add_location(td85, file, 29, 21, 2012);
    			add_location(td86, file, 29, 50, 2041);
    			add_location(tr28, file, 29, 0, 1991);
    			add_location(td87, file, 30, 4, 2068);
    			add_location(td88, file, 30, 21, 2085);
    			add_location(td89, file, 30, 40, 2104);
    			add_location(tr29, file, 30, 0, 2064);
    			add_location(td90, file, 31, 4, 2131);
    			add_location(td91, file, 31, 23, 2150);
    			add_location(td92, file, 31, 42, 2169);
    			add_location(tr30, file, 31, 0, 2127);
    			add_location(td93, file, 32, 4, 2198);
    			add_location(td94, file, 32, 19, 2213);
    			add_location(td95, file, 32, 51, 2245);
    			add_location(tr31, file, 32, 0, 2194);
    			add_location(td96, file, 33, 4, 2270);
    			add_location(td97, file, 33, 72, 2338);
    			add_location(td98, file, 33, 161, 2427);
    			add_location(tr32, file, 33, 0, 2266);
    			add_location(td99, file, 34, 4, 2441);
    			add_location(td100, file, 34, 71, 2508);
    			add_location(td101, file, 34, 158, 2595);
    			add_location(tr33, file, 34, 0, 2437);
    			add_location(td102, file, 35, 4, 2609);
    			add_location(td103, file, 35, 74, 2679);
    			add_location(td104, file, 35, 167, 2772);
    			add_location(tr34, file, 35, 0, 2605);
    			add_location(td105, file, 36, 4, 2786);
    			add_location(td106, file, 36, 96, 2878);
    			add_location(td107, file, 36, 211, 2993);
    			add_location(tr35, file, 36, 0, 2782);
    			add_location(td108, file, 37, 4, 3007);
    			add_location(td109, file, 37, 95, 3098);
    			add_location(td110, file, 37, 208, 3211);
    			add_location(tr36, file, 37, 0, 3003);
    			add_location(td111, file, 38, 4, 3225);
    			add_location(td112, file, 38, 98, 3319);
    			add_location(td113, file, 38, 217, 3438);
    			add_location(tr37, file, 38, 0, 3221);
    			add_location(td114, file, 39, 4, 3452);
    			add_location(td115, file, 39, 27, 3475);
    			add_location(td116, file, 39, 75, 3523);
    			add_location(tr38, file, 39, 0, 3448);
    			add_location(td117, file, 40, 4, 3566);
    			add_location(td118, file, 40, 21, 3583);
    			add_location(tr39, file, 40, 0, 3562);
    			add_location(td119, file, 41, 4, 3619);
    			add_location(td120, file, 41, 22, 3637);
    			add_location(tr40, file, 41, 0, 3615);
    			add_location(td121, file, 42, 4, 3677);
    			add_location(td122, file, 42, 22, 3695);
    			add_location(tr41, file, 42, 0, 3673);
    			add_location(td123, file, 43, 4, 3737);
    			add_location(td124, file, 43, 22, 3755);
    			add_location(tr42, file, 43, 0, 3733);
    			add_location(td125, file, 44, 4, 3798);
    			add_location(td126, file, 44, 22, 3816);
    			add_location(tr43, file, 44, 0, 3794);
    			add_location(br0, file, 45, 18, 3871);
    			add_location(td127, file, 45, 4, 3857);
    			add_location(br1, file, 45, 64, 3917);
    			add_location(td128, file, 45, 39, 3892);
    			add_location(tr44, file, 45, 0, 3853);
    			add_location(br2, file, 46, 18, 3976);
    			add_location(td129, file, 46, 4, 3962);
    			add_location(br3, file, 46, 65, 4023);
    			add_location(td130, file, 46, 39, 3997);
    			add_location(tr45, file, 46, 0, 3958);
    			add_location(td131, file, 47, 4, 4067);
    			add_location(td132, file, 47, 21, 4084);
    			add_location(tr46, file, 47, 0, 4063);
    			add_location(td133, file, 48, 4, 4123);
    			add_location(td134, file, 48, 21, 4140);
    			add_location(tr47, file, 48, 0, 4119);
    			add_location(td135, file, 49, 4, 4175);
    			add_location(td136, file, 49, 22, 4193);
    			add_location(tr48, file, 49, 0, 4171);
    			add_location(td137, file, 50, 4, 4232);
    			add_location(td138, file, 50, 22, 4250);
    			add_location(tr49, file, 50, 0, 4228);
    			add_location(td139, file, 51, 4, 4291);
    			add_location(td140, file, 51, 22, 4309);
    			add_location(tr50, file, 51, 0, 4287);
    			add_location(td141, file, 52, 4, 4351);
    			add_location(td142, file, 52, 22, 4369);
    			add_location(tr51, file, 52, 0, 4347);
    			add_location(br4, file, 53, 18, 4423);
    			add_location(td143, file, 53, 4, 4409);
    			add_location(br5, file, 53, 63, 4468);
    			add_location(td144, file, 53, 39, 4444);
    			add_location(tr52, file, 53, 0, 4405);
    			add_location(br6, file, 54, 18, 4526);
    			add_location(td145, file, 54, 4, 4512);
    			add_location(br7, file, 54, 64, 4572);
    			add_location(td146, file, 54, 39, 4547);
    			add_location(tr53, file, 54, 0, 4508);
    			add_location(td147, file, 55, 4, 4615);
    			add_location(td148, file, 55, 21, 4632);
    			add_location(tr54, file, 55, 0, 4611);
    			add_location(td149, file, 56, 4, 4672);
    			add_location(br8, file, 56, 67, 4735);
    			add_location(td150, file, 56, 42, 4710);
    			add_location(tr55, file, 56, 0, 4668);
    			add_location(br9, file, 57, 39, 4826);
    			add_location(td151, file, 57, 4, 4791);
    			add_location(br10, file, 57, 110, 4897);
    			add_location(br11, file, 57, 144, 4931);
    			add_location(td152, file, 57, 81, 4868);
    			add_location(tr56, file, 57, 0, 4787);
    			add_location(br12, file, 58, 39, 5022);
    			add_location(td153, file, 58, 4, 4987);
    			add_location(br13, file, 58, 111, 5094);
    			add_location(br14, file, 58, 144, 5127);
    			add_location(td154, file, 58, 81, 5064);
    			add_location(tr57, file, 58, 0, 4983);
    			add_location(td155, file, 59, 4, 5183);
    			add_location(br15, file, 59, 74, 5253);
    			add_location(td156, file, 59, 43, 5222);
    			add_location(tr58, file, 59, 0, 5179);
    			add_location(td157, file, 60, 4, 5309);
    			add_location(br16, file, 60, 72, 5377);
    			add_location(td158, file, 60, 43, 5348);
    			add_location(tr59, file, 60, 0, 5305);
    			add_location(td159, file, 61, 4, 5433);
    			add_location(br17, file, 61, 75, 5504);
    			add_location(td160, file, 61, 43, 5472);
    			add_location(tr60, file, 61, 0, 5429);
    			add_location(td161, file, 62, 4, 5560);
    			add_location(br18, file, 62, 73, 5629);
    			add_location(td162, file, 62, 43, 5599);
    			add_location(tr61, file, 62, 0, 5556);
    			add_location(td163, file, 64, 4, 5688);
    			add_location(td164, file, 64, 22, 5706);
    			add_location(tr62, file, 64, 0, 5684);
    			add_location(td165, file, 65, 4, 5738);
    			add_location(td166, file, 65, 24, 5758);
    			add_location(tr63, file, 65, 0, 5734);
    			add_location(td167, file, 66, 4, 5791);
    			add_location(td168, file, 66, 22, 5809);
    			add_location(tr64, file, 66, 0, 5787);
    			add_location(td169, file, 67, 4, 5842);
    			add_location(td170, file, 67, 24, 5862);
    			add_location(tr65, file, 67, 0, 5838);
    			add_location(td171, file, 68, 4, 5896);
    			add_location(td172, file, 68, 22, 5914);
    			add_location(tr66, file, 68, 0, 5892);
    			add_location(td173, file, 69, 4, 5949);
    			add_location(td174, file, 69, 24, 5969);
    			add_location(tr67, file, 69, 0, 5945);
    			add_location(td175, file, 70, 4, 6005);
    			add_location(td176, file, 70, 22, 6023);
    			add_location(tr68, file, 70, 0, 6001);
    			add_location(td177, file, 71, 4, 6057);
    			add_location(td178, file, 71, 24, 6077);
    			add_location(tr69, file, 71, 0, 6053);
    			add_location(td179, file, 72, 4, 6112);
    			add_location(td180, file, 72, 22, 6130);
    			add_location(tr70, file, 72, 0, 6108);
    			add_location(td181, file, 73, 4, 6164);
    			add_location(td182, file, 73, 24, 6184);
    			add_location(tr71, file, 73, 0, 6160);
    			add_location(td183, file, 74, 4, 6219);
    			add_location(td184, file, 74, 22, 6237);
    			add_location(tr72, file, 74, 0, 6215);
    			add_location(td185, file, 75, 4, 6272);
    			add_location(td186, file, 75, 24, 6292);
    			add_location(tr73, file, 75, 0, 6268);
    			add_location(td187, file, 76, 4, 6328);
    			add_location(td188, file, 76, 22, 6346);
    			add_location(tr74, file, 76, 0, 6324);
    			add_location(tbody, file, 1, 80, 102);
    			attr_dev(table, "class", "w100");
    			add_location(table, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, td1);
    			append_dev(tr0, td2);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td3);
    			append_dev(tr1, td4);
    			append_dev(tr1, td5);
    			append_dev(tbody, t6);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, td7);
    			append_dev(tr2, td8);
    			append_dev(tbody, t10);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td9);
    			append_dev(tr3, td10);
    			append_dev(tr3, td11);
    			append_dev(tbody, t14);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td12);
    			append_dev(tr4, td13);
    			append_dev(tr4, td14);
    			append_dev(tbody, t18);
    			append_dev(tbody, tr5);
    			append_dev(tr5, td15);
    			append_dev(tr5, td16);
    			append_dev(tr5, td17);
    			append_dev(tbody, t22);
    			append_dev(tbody, tr6);
    			append_dev(tr6, td18);
    			append_dev(tr6, td19);
    			append_dev(tr6, td20);
    			append_dev(tbody, t26);
    			append_dev(tbody, tr7);
    			append_dev(tr7, td21);
    			append_dev(tr7, td22);
    			append_dev(tr7, td23);
    			append_dev(tbody, t30);
    			append_dev(tbody, tr8);
    			append_dev(tr8, td24);
    			append_dev(tr8, td25);
    			append_dev(tr8, td26);
    			append_dev(tbody, t34);
    			append_dev(tbody, tr9);
    			append_dev(tr9, td27);
    			append_dev(tr9, td28);
    			append_dev(tr9, td29);
    			append_dev(tbody, t38);
    			append_dev(tbody, tr10);
    			append_dev(tr10, td30);
    			append_dev(tr10, td31);
    			append_dev(tr10, td32);
    			append_dev(tbody, t42);
    			append_dev(tbody, tr11);
    			append_dev(tr11, td33);
    			append_dev(tr11, td34);
    			append_dev(tr11, td35);
    			append_dev(tbody, t46);
    			append_dev(tbody, tr12);
    			append_dev(tr12, td36);
    			append_dev(tr12, td37);
    			append_dev(tr12, td38);
    			append_dev(tbody, t50);
    			append_dev(tbody, tr13);
    			append_dev(tr13, td39);
    			append_dev(tr13, td40);
    			append_dev(tr13, td41);
    			append_dev(tbody, t54);
    			append_dev(tbody, tr14);
    			append_dev(tr14, td42);
    			append_dev(tr14, td43);
    			append_dev(tr14, td44);
    			append_dev(tbody, t58);
    			append_dev(tbody, tr15);
    			append_dev(tr15, td45);
    			append_dev(tr15, td46);
    			append_dev(tr15, td47);
    			append_dev(tbody, t62);
    			append_dev(tbody, tr16);
    			append_dev(tr16, td48);
    			append_dev(tr16, td49);
    			append_dev(tr16, td50);
    			append_dev(tbody, t66);
    			append_dev(tbody, tr17);
    			append_dev(tr17, td51);
    			append_dev(tr17, td52);
    			append_dev(tr17, td53);
    			append_dev(tbody, t70);
    			append_dev(tbody, tr18);
    			append_dev(tr18, td54);
    			append_dev(tr18, td55);
    			append_dev(tr18, td56);
    			append_dev(tbody, t74);
    			append_dev(tbody, tr19);
    			append_dev(tr19, td57);
    			append_dev(tr19, td58);
    			append_dev(tr19, td59);
    			append_dev(tbody, t78);
    			append_dev(tbody, tr20);
    			append_dev(tr20, td60);
    			append_dev(tr20, td61);
    			append_dev(tr20, td62);
    			append_dev(tbody, t82);
    			append_dev(tbody, tr21);
    			append_dev(tr21, td63);
    			append_dev(tr21, td64);
    			append_dev(tr21, td65);
    			append_dev(tbody, t86);
    			append_dev(tbody, tr22);
    			append_dev(tr22, td66);
    			append_dev(tr22, td67);
    			append_dev(tr22, td68);
    			append_dev(tbody, t90);
    			append_dev(tbody, tr23);
    			append_dev(tr23, td69);
    			append_dev(tr23, td70);
    			append_dev(tr23, td71);
    			append_dev(tbody, t94);
    			append_dev(tbody, tr24);
    			append_dev(tr24, td72);
    			append_dev(tr24, td73);
    			append_dev(tr24, td74);
    			append_dev(tbody, t98);
    			append_dev(tbody, tr25);
    			append_dev(tr25, td75);
    			append_dev(tr25, td76);
    			append_dev(tr25, td77);
    			append_dev(tbody, t102);
    			append_dev(tbody, tr26);
    			append_dev(tr26, td78);
    			append_dev(tr26, td79);
    			append_dev(tr26, td80);
    			append_dev(tbody, t106);
    			append_dev(tbody, tr27);
    			append_dev(tr27, td81);
    			append_dev(tr27, td82);
    			append_dev(tr27, td83);
    			append_dev(tbody, t110);
    			append_dev(tbody, tr28);
    			append_dev(tr28, td84);
    			append_dev(tr28, td85);
    			append_dev(tr28, td86);
    			append_dev(tbody, t114);
    			append_dev(tbody, tr29);
    			append_dev(tr29, td87);
    			append_dev(tr29, td88);
    			append_dev(tr29, td89);
    			append_dev(tbody, t118);
    			append_dev(tbody, tr30);
    			append_dev(tr30, td90);
    			append_dev(tr30, td91);
    			append_dev(tr30, td92);
    			append_dev(tbody, t122);
    			append_dev(tbody, tr31);
    			append_dev(tr31, td93);
    			append_dev(tr31, td94);
    			append_dev(tr31, td95);
    			append_dev(tbody, t126);
    			append_dev(tbody, tr32);
    			append_dev(tr32, td96);
    			append_dev(tr32, td97);
    			append_dev(tr32, t129);
    			append_dev(tr32, td98);
    			append_dev(tbody, t130);
    			append_dev(tbody, tr33);
    			append_dev(tr33, td99);
    			append_dev(tr33, td100);
    			append_dev(tr33, t133);
    			append_dev(tr33, td101);
    			append_dev(tbody, t134);
    			append_dev(tbody, tr34);
    			append_dev(tr34, td102);
    			append_dev(tr34, td103);
    			append_dev(tr34, t137);
    			append_dev(tr34, td104);
    			append_dev(tbody, t138);
    			append_dev(tbody, tr35);
    			append_dev(tr35, td105);
    			append_dev(tr35, td106);
    			append_dev(tr35, t141);
    			append_dev(tr35, td107);
    			append_dev(tbody, t142);
    			append_dev(tbody, tr36);
    			append_dev(tr36, td108);
    			append_dev(tr36, td109);
    			append_dev(tr36, t145);
    			append_dev(tr36, td110);
    			append_dev(tbody, t146);
    			append_dev(tbody, tr37);
    			append_dev(tr37, td111);
    			append_dev(tr37, td112);
    			append_dev(tr37, t149);
    			append_dev(tr37, td113);
    			append_dev(tbody, t150);
    			append_dev(tbody, tr38);
    			append_dev(tr38, td114);
    			append_dev(tr38, td115);
    			append_dev(tr38, td116);
    			append_dev(tbody, t154);
    			append_dev(tbody, tr39);
    			append_dev(tr39, td117);
    			append_dev(tr39, td118);
    			append_dev(tbody, t157);
    			append_dev(tbody, tr40);
    			append_dev(tr40, td119);
    			append_dev(tr40, td120);
    			append_dev(tbody, t160);
    			append_dev(tbody, tr41);
    			append_dev(tr41, td121);
    			append_dev(tr41, td122);
    			append_dev(tbody, t163);
    			append_dev(tbody, tr42);
    			append_dev(tr42, td123);
    			append_dev(tr42, td124);
    			append_dev(tbody, t166);
    			append_dev(tbody, tr43);
    			append_dev(tr43, td125);
    			append_dev(tr43, td126);
    			append_dev(tbody, t169);
    			append_dev(tbody, tr44);
    			append_dev(tr44, td127);
    			append_dev(td127, t170);
    			append_dev(td127, br0);
    			append_dev(td127, t171);
    			append_dev(tr44, td128);
    			append_dev(td128, t172);
    			append_dev(td128, br1);
    			append_dev(td128, t173);
    			append_dev(tbody, t174);
    			append_dev(tbody, tr45);
    			append_dev(tr45, td129);
    			append_dev(td129, t175);
    			append_dev(td129, br2);
    			append_dev(td129, t176);
    			append_dev(tr45, td130);
    			append_dev(td130, t177);
    			append_dev(td130, br3);
    			append_dev(td130, t178);
    			append_dev(tbody, t179);
    			append_dev(tbody, tr46);
    			append_dev(tr46, td131);
    			append_dev(tr46, td132);
    			append_dev(tbody, t182);
    			append_dev(tbody, tr47);
    			append_dev(tr47, td133);
    			append_dev(tr47, td134);
    			append_dev(tbody, t185);
    			append_dev(tbody, tr48);
    			append_dev(tr48, td135);
    			append_dev(tr48, td136);
    			append_dev(tbody, t188);
    			append_dev(tbody, tr49);
    			append_dev(tr49, td137);
    			append_dev(tr49, td138);
    			append_dev(tbody, t191);
    			append_dev(tbody, tr50);
    			append_dev(tr50, td139);
    			append_dev(tr50, td140);
    			append_dev(tbody, t194);
    			append_dev(tbody, tr51);
    			append_dev(tr51, td141);
    			append_dev(tr51, td142);
    			append_dev(tbody, t197);
    			append_dev(tbody, tr52);
    			append_dev(tr52, td143);
    			append_dev(td143, t198);
    			append_dev(td143, br4);
    			append_dev(td143, t199);
    			append_dev(tr52, td144);
    			append_dev(td144, t200);
    			append_dev(td144, br5);
    			append_dev(td144, t201);
    			append_dev(tbody, t202);
    			append_dev(tbody, tr53);
    			append_dev(tr53, td145);
    			append_dev(td145, t203);
    			append_dev(td145, br6);
    			append_dev(td145, t204);
    			append_dev(tr53, td146);
    			append_dev(td146, t205);
    			append_dev(td146, br7);
    			append_dev(td146, t206);
    			append_dev(tbody, t207);
    			append_dev(tbody, tr54);
    			append_dev(tr54, td147);
    			append_dev(tr54, td148);
    			append_dev(tbody, t210);
    			append_dev(tbody, tr55);
    			append_dev(tr55, td149);
    			append_dev(tr55, td150);
    			append_dev(td150, t212);
    			append_dev(td150, br8);
    			append_dev(td150, t213);
    			append_dev(tbody, t214);
    			append_dev(tbody, tr56);
    			append_dev(tr56, td151);
    			append_dev(td151, t215);
    			append_dev(td151, br9);
    			append_dev(td151, t216);
    			append_dev(tr56, td152);
    			append_dev(td152, t217);
    			append_dev(td152, br10);
    			append_dev(td152, t218);
    			append_dev(td152, br11);
    			append_dev(td152, t219);
    			append_dev(tbody, t220);
    			append_dev(tbody, tr57);
    			append_dev(tr57, td153);
    			append_dev(td153, t221);
    			append_dev(td153, br12);
    			append_dev(td153, t222);
    			append_dev(tr57, td154);
    			append_dev(td154, t223);
    			append_dev(td154, br13);
    			append_dev(td154, t224);
    			append_dev(td154, br14);
    			append_dev(td154, t225);
    			append_dev(tbody, t226);
    			append_dev(tbody, tr58);
    			append_dev(tr58, td155);
    			append_dev(tr58, td156);
    			append_dev(td156, t228);
    			append_dev(td156, br15);
    			append_dev(td156, t229);
    			append_dev(tbody, t230);
    			append_dev(tbody, tr59);
    			append_dev(tr59, td157);
    			append_dev(tr59, td158);
    			append_dev(td158, t232);
    			append_dev(td158, br16);
    			append_dev(td158, t233);
    			append_dev(tbody, t234);
    			append_dev(tbody, tr60);
    			append_dev(tr60, td159);
    			append_dev(tr60, td160);
    			append_dev(td160, t236);
    			append_dev(td160, br17);
    			append_dev(td160, t237);
    			append_dev(tbody, t238);
    			append_dev(tbody, tr61);
    			append_dev(tr61, td161);
    			append_dev(tr61, td162);
    			append_dev(td162, t240);
    			append_dev(td162, br18);
    			append_dev(td162, t241);
    			append_dev(tbody, t242);
    			append_dev(tbody, tr62);
    			append_dev(tr62, td163);
    			append_dev(tr62, td164);
    			append_dev(tbody, t245);
    			append_dev(tbody, tr63);
    			append_dev(tr63, td165);
    			append_dev(tr63, td166);
    			append_dev(tbody, t248);
    			append_dev(tbody, tr64);
    			append_dev(tr64, td167);
    			append_dev(tr64, td168);
    			append_dev(tbody, t251);
    			append_dev(tbody, tr65);
    			append_dev(tr65, td169);
    			append_dev(tr65, td170);
    			append_dev(tbody, t254);
    			append_dev(tbody, tr66);
    			append_dev(tr66, td171);
    			append_dev(tr66, td172);
    			append_dev(tbody, t257);
    			append_dev(tbody, tr67);
    			append_dev(tr67, td173);
    			append_dev(tr67, td174);
    			append_dev(tbody, t260);
    			append_dev(tbody, tr68);
    			append_dev(tr68, td175);
    			append_dev(tr68, td176);
    			append_dev(tbody, t263);
    			append_dev(tbody, tr69);
    			append_dev(tr69, td177);
    			append_dev(tr69, td178);
    			append_dev(tbody, t266);
    			append_dev(tbody, tr70);
    			append_dev(tr70, td179);
    			append_dev(tr70, td180);
    			append_dev(tbody, t269);
    			append_dev(tbody, tr71);
    			append_dev(tr71, td181);
    			append_dev(tr71, td182);
    			append_dev(tbody, t272);
    			append_dev(tbody, tr72);
    			append_dev(tr72, td183);
    			append_dev(tr72, td184);
    			append_dev(tbody, t275);
    			append_dev(tbody, tr73);
    			append_dev(tr73, td185);
    			append_dev(tr73, td186);
    			append_dev(tbody, t278);
    			append_dev(tbody, tr74);
    			append_dev(tr74, td187);
    			append_dev(tr74, td188);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
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

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	return [];
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

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (73:2) {#each Object.keys(guis) as k}
    function create_each_block(ctx) {
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
    			add_location(td0, file$2, 74, 4, 1437);
    			add_location(pre, file$2, 75, 8, 1458);
    			add_location(td1, file$2, 75, 4, 1454);
    			attr_dev(div, "class", "flex flex-column align-items-start");
    			add_location(div, file$2, 76, 8, 1492);
    			add_location(td2, file$2, 76, 4, 1488);
    			add_location(tr, file$2, 73, 3, 1428);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(73:2) {#each Object.keys(guis) as k}",
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
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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

    			add_location(td0, file$2, 66, 3, 1314);
    			add_location(td1, file$2, 67, 3, 1331);
    			add_location(td2, file$2, 68, 3, 1348);
    			add_location(tr, file$2, 65, 2, 1306);
    			attr_dev(thead, "class", "bright");
    			add_location(thead, file$2, 64, 1, 1281);
    			add_location(tbody, file$2, 71, 1, 1384);
    			attr_dev(table, "class", "w100");
    			add_location(table, file$2, 63, 0, 1259);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
	<select>
		<option>option a</option>
		<option>option b</option>
		<option>option c</option>
	</select>
</div>

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

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (31:4) {#each Object.keys( themes ) as t}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*t*/ ctx[7] + "";
    	let t;
    	let option_value_value;
    	let option_name_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*t*/ ctx[7];
    			option.value = option.__value;
    			attr_dev(option, "name", option_name_value = /*t*/ ctx[7]);
    			add_location(option, file$4, 31, 5, 994);
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(31:4) {#each Object.keys( themes ) as t}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#each themes[theme] as t}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*t*/ ctx[7] + "";
    	let t;
    	let option_value_value;
    	let option_name_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*t*/ ctx[7];
    			option.value = option.__value;
    			attr_dev(option, "name", option_name_value = /*t*/ ctx[7]);
    			add_location(option, file$4, 38, 5, 1247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1 && t_value !== (t_value = /*t*/ ctx[7] + "")) set_data_dev(t, t_value);

    			if (dirty & /*theme, Object, themes*/ 5 && option_value_value !== (option_value_value = /*t*/ ctx[7])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*theme, Object, themes*/ 5 && option_name_value !== (option_name_value = /*t*/ ctx[7])) {
    				attr_dev(option, "name", option_name_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:4) {#each themes[theme] as t}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let header;
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
    	let div2;
    	let table;
    	let t6;
    	let div3;
    	let twelve;
    	let t7;
    	let div4;
    	let gui;
    	let t8;
    	let div5;
    	let flex;
    	let main_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = Object.keys(/*themes*/ ctx[2]);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*themes*/ ctx[2][/*theme*/ ctx[0]];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	table = new Table({ $$inline: true });
    	twelve = new Twelve({ $$inline: true });
    	gui = new GUI({ $$inline: true });
    	flex = new Flex({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Crème de Sassis";
    			t1 = space();
    			div0 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			p = element("p");
    			p.textContent = "Lightweight SASS mixins and boilerplate, and shorthand CSS utilities (a bit like Tailwind, but less of it). Designed to be grokkable.";
    			t5 = space();
    			div2 = element("div");
    			create_component(table.$$.fragment);
    			t6 = space();
    			div3 = element("div");
    			create_component(twelve.$$.fragment);
    			t7 = space();
    			div4 = element("div");
    			create_component(gui.$$.fragment);
    			t8 = space();
    			div5 = element("div");
    			create_component(flex.$$.fragment);
    			attr_dev(h1, "class", "bright mr1");
    			add_location(h1, file$4, 27, 2, 745);
    			if (/*theme*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[3].call(select0));
    			add_location(select0, file$4, 29, 3, 815);
    			attr_dev(div0, "class", "select");
    			add_location(div0, file$4, 28, 2, 791);
    			if (/*permutation*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[5].call(select1));
    			add_location(select1, file$4, 36, 3, 1094);
    			attr_dev(div1, "class", "select");
    			add_location(div1, file$4, 35, 2, 1070);
    			attr_dev(header, "class", "flex flex-row align-items-center");
    			add_location(header, file$4, 26, 1, 693);
    			attr_dev(p, "class", "mb1");
    			add_location(p, file$4, 43, 1, 1333);
    			attr_dev(div2, "class", "mb4");
    			add_location(div2, file$4, 44, 1, 1487);
    			attr_dev(div3, "class", "mb4");
    			add_location(div3, file$4, 47, 1, 1526);
    			attr_dev(div4, "class", " mb4");
    			add_location(div4, file$4, 50, 1, 1566);
    			attr_dev(div5, "class", " mb4");
    			add_location(div5, file$4, 53, 1, 1604);
    			attr_dev(main, "class", main_class_value = "p1 " + /*theme*/ ctx[0] + " " + /*theme*/ ctx[0] + "-" + /*permutation*/ ctx[1]);
    			attr_dev(main, "id", "main");
    			add_location(main, file$4, 25, 0, 634);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, div0);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*theme*/ ctx[0]);
    			append_dev(header, t2);
    			append_dev(header, div1);
    			append_dev(div1, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*permutation*/ ctx[1]);
    			append_dev(main, t3);
    			append_dev(main, p);
    			append_dev(main, t5);
    			append_dev(main, div2);
    			mount_component(table, div2, null);
    			append_dev(main, t6);
    			append_dev(main, div3);
    			mount_component(twelve, div3, null);
    			append_dev(main, t7);
    			append_dev(main, div4);
    			mount_component(gui, div4, null);
    			append_dev(main, t8);
    			append_dev(main, div5);
    			mount_component(flex, div5, null);
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
    				each_value_1 = Object.keys(/*themes*/ ctx[2]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*theme, Object, themes*/ 5) {
    				select_option(select0, /*theme*/ ctx[0]);
    			}

    			if (dirty & /*themes, theme*/ 5) {
    				each_value = /*themes*/ ctx[2][/*theme*/ ctx[0]];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*permutation, themes, theme*/ 7) {
    				select_option(select1, /*permutation*/ ctx[1]);
    			}

    			if (!current || dirty & /*theme, permutation, Object, themes*/ 7 && main_class_value !== (main_class_value = "p1 " + /*theme*/ ctx[0] + " " + /*theme*/ ctx[0] + "-" + /*permutation*/ ctx[1])) {
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
