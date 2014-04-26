/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('oop', function (Y, NAME) {

/**
Adds object inheritance and manipulation utilities to the YUI instance. This
module is required by most YUI components.

@module oop
**/

var L            = Y.Lang,
    A            = Y.Array,
    OP           = Object.prototype,
    CLONE_MARKER = '_~yuim~_',

    hasOwn   = OP.hasOwnProperty,
    toString = OP.toString;

/**
Calls the specified _action_ method on _o_ if it exists. Otherwise, if _o_ is an
array, calls the _action_ method on `Y.Array`, or if _o_ is an object, calls the
_action_ method on `Y.Object`.

If _o_ is an array-like object, it will be coerced to an array.

This is intended to be used with array/object iteration methods that share
signatures, such as `each()`, `some()`, etc.

@method dispatch
@param {Object} o Array or object to dispatch to.
@param {Function} f Iteration callback.
    @param {Mixed} f.value Value being iterated.
    @param {Mixed} f.key Current object key or array index.
    @param {Mixed} f.object Object or array being iterated.
@param {Object} c `this` object to bind the iteration callback to.
@param {Boolean} proto If `true`, prototype properties of objects will be
    iterated.
@param {String} action Function name to be dispatched on _o_. For example:
    'some', 'each', etc.
@private
@return {Mixed} Returns the value returned by the chosen iteration action, which
    varies.
**/
function dispatch(o, f, c, proto, action) {
    if (o && o[action] && o !== Y) {
        return o[action].call(o, f, c);
    } else {
        switch (A.test(o)) {
            case 1:
                return A[action](o, f, c);
            case 2:
                return A[action](Y.Array(o, 0, true), f, c);
            default:
                return Y.Object[action](o, f, c, proto);
        }
    }
}

/**
Augments the _receiver_ with prototype properties from the _supplier_. The
receiver may be a constructor function or an object. The supplier must be a
constructor function.

If the _receiver_ is an object, then the _supplier_ constructor will be called
immediately after _receiver_ is augmented, with _receiver_ as the `this` object.

If the _receiver_ is a constructor function, then all prototype methods of
_supplier_ that are copied to _receiver_ will be sequestered, and the
_supplier_ constructor will not be called immediately. The first time any
sequestered method is called on the _receiver_'s prototype, all sequestered
methods will be immediately copied to the _receiver_'s prototype, the
_supplier_'s constructor will be executed, and finally the newly unsequestered
method that was called will be executed.

This sequestering logic sounds like a bunch of complicated voodoo, but it makes
it cheap to perform frequent augmentation by ensuring that suppliers'
constructors are only called if a supplied method is actually used. If none of
the supplied methods is ever used, then there's no need to take the performance
hit of calling the _supplier_'s constructor.

@method augment
@param {Function|Object} receiver Object or function to be augmented.
@param {Function} supplier Function that supplies the prototype properties with
  which to augment the _receiver_.
@param {Boolean} [overwrite=false] If `true`, properties already on the receiver
  will be overwritten if found on the supplier's prototype.
@param {String[]} [whitelist] An array of property names. If specified,
  only the whitelisted prototype properties will be applied to the receiver, and
  all others will be ignored.
@param {Array|any} [args] Argument or array of arguments to pass to the
  supplier's constructor when initializing.
@return {Function} Augmented object.
@for YUI
**/
Y.augment = function (receiver, supplier, overwrite, whitelist, args) {
    var rProto    = receiver.prototype,
        sequester = rProto && supplier,
        sProto    = supplier.prototype,
        to        = rProto || receiver,

        copy,
        newPrototype,
        replacements,
        sequestered,
        unsequester;

    args = args ? Y.Array(args) : [];

    if (sequester) {
        newPrototype = {};
        replacements = {};
        sequestered  = {};

        copy = function (value, key) {
            if (overwrite || !(key in rProto)) {
                if (toString.call(value) === '[object Function]') {
                    sequestered[key] = value;

                    newPrototype[key] = replacements[key] = function () {
                        return unsequester(this, value, arguments);
                    };
                } else {
                    newPrototype[key] = value;
                }
            }
        };

        unsequester = function (instance, fn, fnArgs) {
            // Unsequester all sequestered functions.
            for (var key in sequestered) {
                if (hasOwn.call(sequestered, key)
                        && instance[key] === replacements[key]) {

                    instance[key] = sequestered[key];
                }
            }

            // Execute the supplier constructor.
            supplier.apply(instance, args);

            // Finally, execute the original sequestered function.
            return fn.apply(instance, fnArgs);
        };

        if (whitelist) {
            Y.Array.each(whitelist, function (name) {
                if (name in sProto) {
                    copy(sProto[name], name);
                }
            });
        } else {
            Y.Object.each(sProto, copy, null, true);
        }
    }

    Y.mix(to, newPrototype || sProto, overwrite, whitelist);

    if (!sequester) {
        supplier.apply(to, args);
    }

    return receiver;
};

/**
 * Copies object properties from the supplier to the receiver. If the target has
 * the property, and the property is an object, the target object will be
 * augmented with the supplier's value.
 *
 * @method aggregate
 * @param {Object} receiver Object to receive the augmentation.
 * @param {Object} supplier Object that supplies the properties with which to
 *     augment the receiver.
 * @param {Boolean} [overwrite=false] If `true`, properties already on the receiver
 *     will be overwritten if found on the supplier.
 * @param {String[]} [whitelist] Whitelist. If supplied, only properties in this
 *     list will be applied to the receiver.
 * @return {Object} Augmented object.
 */
Y.aggregate = function(r, s, ov, wl) {
    return Y.mix(r, s, ov, wl, 0, true);
};

/**
 * Utility to set up the prototype, constructor and superclass properties to
 * support an inheritance strategy that can chain constructors and methods.
 * Static members will not be inherited.
 *
 * @method extend
 * @param {function} r   the object to modify.
 * @param {function} s the object to inherit.
 * @param {object} px prototype properties to add/override.
 * @param {object} sx static properties to add/override.
 * @return {object} the extended object.
 */
Y.extend = function(r, s, px, sx) {
    if (!s || !r) {
        Y.error('extend failed, verify dependencies');
    }

    var sp = s.prototype, rp = Y.Object(sp);
    r.prototype = rp;

    rp.constructor = r;
    r.superclass = sp;

    // assign constructor property
    if (s != Object && sp.constructor == OP.constructor) {
        sp.constructor = s;
    }

    // add prototype overrides
    if (px) {
        Y.mix(rp, px, true);
    }

    // add object overrides
    if (sx) {
        Y.mix(r, sx, true);
    }

    return r;
};

/**
 * Executes the supplied function for each item in
 * a collection.  Supports arrays, objects, and
 * NodeLists
 * @method each
 * @param {object} o the object to iterate.
 * @param {function} f the function to execute.  This function
 * receives the value, key, and object as parameters.
 * @param {object} c the execution context for the function.
 * @param {boolean} proto if true, prototype properties are
 * iterated on objects.
 * @return {YUI} the YUI instance.
 */
Y.each = function(o, f, c, proto) {
    return dispatch(o, f, c, proto, 'each');
};

/**
 * Executes the supplied function for each item in
 * a collection.  The operation stops if the function
 * returns true. Supports arrays, objects, and
 * NodeLists.
 * @method some
 * @param {object} o the object to iterate.
 * @param {function} f the function to execute.  This function
 * receives the value, key, and object as parameters.
 * @param {object} c the execution context for the function.
 * @param {boolean} proto if true, prototype properties are
 * iterated on objects.
 * @return {boolean} true if the function ever returns true,
 * false otherwise.
 */
Y.some = function(o, f, c, proto) {
    return dispatch(o, f, c, proto, 'some');
};

/**
Deep object/array copy. Function clones are actually wrappers around the
original function. Array-like objects are treated as arrays. Primitives are
returned untouched. Optionally, a function can be provided to handle other data
types, filter keys, validate values, etc.

**Note:** Cloning a non-trivial object is a reasonably heavy operation, due to
the need to recursively iterate down non-primitive properties. Clone should be
used only when a deep clone down to leaf level properties is explicitly
required. This method will also

In many cases (for example, when trying to isolate objects used as hashes for
configuration properties), a shallow copy, using `Y.merge()` is normally
sufficient. If more than one level of isolation is required, `Y.merge()` can be
used selectively at each level which needs to be isolated from the original
without going all the way to leaf properties.

@method clone
@param {object} o what to clone.
@param {boolean} safe if true, objects will not have prototype items from the
    source. If false, they will. In this case, the original is initially
    protected, but the clone is not completely immune from changes to the source
    object prototype. Also, cloned prototype items that are deleted from the
    clone will result in the value of the source prototype being exposed. If
    operating on a non-safe clone, items should be nulled out rather than
    deleted.
@param {function} f optional function to apply to each item in a collection; it
    will be executed prior to applying the value to the new object.
    Return false to prevent the copy.
@param {object} c optional execution context for f.
@param {object} owner Owner object passed when clone is iterating an object.
    Used to set up context for cloned functions.
@param {object} cloned hash of previously cloned objects to avoid multiple
    clones.
@return {Array|Object} the cloned object.
**/
Y.clone = function(o, safe, f, c, owner, cloned) {
    var o2, marked, stamp;

    // Does not attempt to clone:
    //
    // * Non-typeof-object values, "primitive" values don't need cloning.
    //
    // * YUI instances, cloning complex object like YUI instances is not
    //   advised, this is like cloning the world.
    //
    // * DOM nodes (#2528250), common host objects like DOM nodes cannot be
    //   "subclassed" in Firefox and old versions of IE. Trying to use
    //   `Object.create()` or `Y.extend()` on a DOM node will throw an error in
    //   these browsers.
    //
    // Instad, the passed-in `o` will be return as-is when it matches one of the
    // above criteria.
    if (!L.isObject(o) ||
            Y.instanceOf(o, YUI) ||
            (o.addEventListener || o.attachEvent)) {

        return o;
    }

    marked = cloned || {};

    switch (L.type(o)) {
        case 'date':
            return new Date(o);
        case 'regexp':
            // if we do this we need to set the flags too
            // return new RegExp(o.source);
            return o;
        case 'function':
            // o2 = Y.bind(o, owner);
            // break;
            return o;
        case 'array':
            o2 = [];
            break;
        default:

            // #2528250 only one clone of a given object should be created.
            if (o[CLONE_MARKER]) {
                return marked[o[CLONE_MARKER]];
            }

            stamp = Y.guid();

            o2 = (safe) ? {} : Y.Object(o);

            o[CLONE_MARKER] = stamp;
            marked[stamp] = o;
    }

    Y.each(o, function(v, k) {
        if ((k || k === 0) && (!f || (f.call(c || this, v, k, this, o) !== false))) {
            if (k !== CLONE_MARKER) {
                if (k == 'prototype') {
                    // skip the prototype
                // } else if (o[k] === o) {
                //     this[k] = this;
                } else {
                    this[k] =
                        Y.clone(v, safe, f, c, owner || o, marked);
                }
            }
        }
    }, o2);

    if (!cloned) {
        Y.Object.each(marked, function(v, k) {
            if (v[CLONE_MARKER]) {
                try {
                    delete v[CLONE_MARKER];
                } catch (e) {
                    v[CLONE_MARKER] = null;
                }
            }
        }, this);
        marked = null;
    }

    return o2;
};

/**
 * Returns a function that will execute the supplied function in the
 * supplied object's context, optionally adding any additional
 * supplied parameters to the beginning of the arguments collection the
 * supplied to the function.
 *
 * @method bind
 * @param {Function|String} f the function to bind, or a function name
 * to execute on the context object.
 * @param {object} c the execution context.
 * @param {any} args* 0..n arguments to include before the arguments the
 * function is executed with.
 * @return {function} the wrapped function.
 */
Y.bind = function(f, c) {
    var xargs = arguments.length > 2 ?
            Y.Array(arguments, 2, true) : null;
    return function() {
        var fn = L.isString(f) ? c[f] : f,
            args = (xargs) ?
                xargs.concat(Y.Array(arguments, 0, true)) : arguments;
        return fn.apply(c || fn, args);
    };
};

/**
 * Returns a function that will execute the supplied function in the
 * supplied object's context, optionally adding any additional
 * supplied parameters to the end of the arguments the function
 * is executed with.
 *
 * @method rbind
 * @param {Function|String} f the function to bind, or a function name
 * to execute on the context object.
 * @param {object} c the execution context.
 * @param {any} args* 0..n arguments to append to the end of
 * arguments collection supplied to the function.
 * @return {function} the wrapped function.
 */
Y.rbind = function(f, c) {
    var xargs = arguments.length > 2 ? Y.Array(arguments, 2, true) : null;
    return function() {
        var fn = L.isString(f) ? c[f] : f,
            args = (xargs) ?
                Y.Array(arguments, 0, true).concat(xargs) : arguments;
        return fn.apply(c || fn, args);
    };
};


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('attribute-core', function (Y, NAME) {

    /**
     * The State class maintains state for a collection of named items, with
     * a varying number of properties defined.
     *
     * It avoids the need to create a separate class for the item, and separate instances
     * of these classes for each item, by storing the state in a 2 level hash table,
     * improving performance when the number of items is likely to be large.
     *
     * @constructor
     * @class State
     */
    Y.State = function() {
        /**
         * Hash of attributes
         * @property data
         */
        this.data = {};
    };

    Y.State.prototype = {

        /**
         * Adds a property to an item.
         *
         * @method add
         * @param name {String} The name of the item.
         * @param key {String} The name of the property.
         * @param val {Any} The value of the property.
         */
        add: function(name, key, val) {
            var item = this.data[name];

            if (!item) {
                item = this.data[name] = {};
            }

            item[key] = val;
        },

        /**
         * Adds multiple properties to an item.
         *
         * @method addAll
         * @param name {String} The name of the item.
         * @param obj {Object} A hash of property/value pairs.
         */
        addAll: function(name, obj) {
            var item = this.data[name],
                key;

            if (!item) {
                item = this.data[name] = {};
            }

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    item[key] = obj[key];
                }
            }
        },

        /**
         * Removes a property from an item.
         *
         * @method remove
         * @param name {String} The name of the item.
         * @param key {String} The property to remove.
         */
        remove: function(name, key) {
            var item = this.data[name];

            if (item) {
                delete item[key];
            }
        },

        /**
         * Removes multiple properties from an item, or removes the item completely.
         *
         * @method removeAll
         * @param name {String} The name of the item.
         * @param obj {Object|Array} Collection of properties to delete. If not provided, the entire item is removed.
         */
        removeAll: function(name, obj) {
            var data;

            if (!obj) {
                data = this.data;

                if (name in data) {
                    delete data[name];
                }
            } else {
                Y.each(obj, function(value, key) {
                    this.remove(name, typeof key === 'string' ? key : value);
                }, this);
            }
        },

        /**
         * For a given item, returns the value of the property requested, or undefined if not found.
         *
         * @method get
         * @param name {String} The name of the item
         * @param key {String} Optional. The property value to retrieve.
         * @return {Any} The value of the supplied property.
         */
        get: function(name, key) {
            var item = this.data[name];

            if (item) {
                return item[key];
            }
        },

        /**
         * For the given item, returns an object with all of the
         * item's property/value pairs. By default the object returned
         * is a shallow copy of the stored data, but passing in true
         * as the second parameter will return a reference to the stored
         * data.
         *
         * @method getAll
         * @param name {String} The name of the item
         * @param reference {boolean} true, if you want a reference to the stored
         * object
         * @return {Object} An object with property/value pairs for the item.
         */
        getAll : function(name, reference) {
            var item = this.data[name],
                key, obj;

            if (reference) {
                obj = item;
            } else if (item) {
                obj = {};

                for (key in item) {
                    if (item.hasOwnProperty(key)) {
                        obj[key] = item[key];
                    }
                }
            }

            return obj;
        }
    };
    /*For log lines*/
    /*jshint maxlen:200*/

    /**
     * The attribute module provides an augmentable Attribute implementation, which
     * adds configurable attributes and attribute change events to the class being
     * augmented. It also provides a State class, which is used internally by Attribute,
     * but can also be used independently to provide a name/property/value data structure to
     * store state.
     *
     * @module attribute
     */

    /**
     * The attribute-core submodule provides the lightest level of attribute handling support
     * without Attribute change events, or lesser used methods such as reset(), modifyAttrs(),
     * and removeAttr().
     *
     * @module attribute
     * @submodule attribute-core
     */
    var O = Y.Object,
        Lang = Y.Lang,

        DOT = ".",

        // Externally configurable props
        GETTER = "getter",
        SETTER = "setter",
        READ_ONLY = "readOnly",
        WRITE_ONCE = "writeOnce",
        INIT_ONLY = "initOnly",
        VALIDATOR = "validator",
        VALUE = "value",
        VALUE_FN = "valueFn",
        LAZY_ADD = "lazyAdd",

        // Used for internal state management
        ADDED = "added",
        BYPASS_PROXY = "_bypassProxy",
        INIT_VALUE = "initValue",
        LAZY = "lazy",

        INVALID_VALUE;

    /**
     * <p>
     * AttributeCore provides the lightest level of configurable attribute support. It is designed to be
     * augmented on to a host class, and provides the host with the ability to configure
     * attributes to store and retrieve state, <strong>but without support for attribute change events</strong>.
     * </p>
     * <p>For example, attributes added to the host can be configured:</p>
     * <ul>
     *     <li>As read only.</li>
     *     <li>As write once.</li>
     *     <li>With a setter function, which can be used to manipulate
     *     values passed to Attribute's <a href="#method_set">set</a> method, before they are stored.</li>
     *     <li>With a getter function, which can be used to manipulate stored values,
     *     before they are returned by Attribute's <a href="#method_get">get</a> method.</li>
     *     <li>With a validator function, to validate values before they are stored.</li>
     * </ul>
     *
     * <p>See the <a href="#method_addAttr">addAttr</a> method, for the complete set of configuration
     * options available for attributes.</p>
     *
     * <p>Object/Classes based on AttributeCore can augment <a href="AttributeObservable.html">AttributeObservable</a>
     * (with true for overwrite) and <a href="AttributeExtras.html">AttributeExtras</a> to add attribute event and
     * additional, less commonly used attribute methods, such as `modifyAttr`, `removeAttr` and `reset`.</p>
     *
     * @class AttributeCore
     * @param attrs {Object} The attributes to add during construction (passed through to <a href="#method_addAttrs">addAttrs</a>).
     *        These can also be defined on the constructor being augmented with Attribute by defining the ATTRS property on the constructor.
     * @param values {Object} The initial attribute values to apply (passed through to <a href="#method_addAttrs">addAttrs</a>).
     *        These are not merged/cloned. The caller is responsible for isolating user provided values if required.
     * @param lazy {boolean} Whether or not to add attributes lazily (passed through to <a href="#method_addAttrs">addAttrs</a>).
     */
    function AttributeCore(attrs, values, lazy) {
        // HACK: Fix #2531929
        // Complete hack, to make sure the first clone of a node value in IE doesn't doesn't hurt state - maintains 3.4.1 behavior.
        // Too late in the release cycle to do anything about the core problem.
        // The root issue is that cloning a Y.Node instance results in an object which barfs in IE, when you access it's properties (since 3.3.0).
        this._yuievt = null;

        this._initAttrHost(attrs, values, lazy);
    }

    /**
     * <p>The value to return from an attribute setter in order to prevent the set from going through.</p>
     *
     * <p>You can return this value from your setter if you wish to combine validator and setter
     * functionality into a single setter function, which either returns the massaged value to be stored or
     * AttributeCore.INVALID_VALUE to prevent invalid values from being stored.</p>
     *
     * @property INVALID_VALUE
     * @type Object
     * @static
     * @final
     */
    AttributeCore.INVALID_VALUE = {};
    INVALID_VALUE = AttributeCore.INVALID_VALUE;

    /**
     * The list of properties which can be configured for
     * each attribute (e.g. setter, getter, writeOnce etc.).
     *
     * This property is used internally as a whitelist for faster
     * Y.mix operations.
     *
     * @property _ATTR_CFG
     * @type Array
     * @static
     * @protected
     */
    AttributeCore._ATTR_CFG = [SETTER, GETTER, VALIDATOR, VALUE, VALUE_FN, WRITE_ONCE, READ_ONLY, LAZY_ADD, BYPASS_PROXY];

    /**
     * Utility method to protect an attribute configuration hash, by merging the
     * entire object and the individual attr config objects.
     *
     * @method protectAttrs
     * @static
     * @param {Object} attrs A hash of attribute to configuration object pairs.
     * @return {Object} A protected version of the `attrs` argument.
     */
    AttributeCore.protectAttrs = function (attrs) {
        if (attrs) {
            attrs = Y.merge(attrs);
            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    attrs[attr] = Y.merge(attrs[attr]);
                }
            }
        }

        return attrs;
    };

    AttributeCore.prototype = {

        /**
         * Constructor logic for attributes. Initializes the host state, and sets up the inital attributes passed to the
         * constructor.
         *
         * @method _initAttrHost
         * @param attrs {Object} The attributes to add during construction (passed through to <a href="#method_addAttrs">addAttrs</a>).
         *        These can also be defined on the constructor being augmented with Attribute by defining the ATTRS property on the constructor.
         * @param values {Object} The initial attribute values to apply (passed through to <a href="#method_addAttrs">addAttrs</a>).
         *        These are not merged/cloned. The caller is responsible for isolating user provided values if required.
         * @param lazy {boolean} Whether or not to add attributes lazily (passed through to <a href="#method_addAttrs">addAttrs</a>).
         * @private
         */
        _initAttrHost : function(attrs, values, lazy) {
            this._state = new Y.State();
            this._initAttrs(attrs, values, lazy);
        },

        /**
         * <p>
         * Adds an attribute with the provided configuration to the host object.
         * </p>
         * <p>
         * The config argument object supports the following properties:
         * </p>
         *
         * <dl>
         *    <dt>value &#60;Any&#62;</dt>
         *    <dd>The initial value to set on the attribute</dd>
         *
         *    <dt>valueFn &#60;Function | String&#62;</dt>
         *    <dd>
         *    <p>A function, which will return the initial value to set on the attribute. This is useful
         *    for cases where the attribute configuration is defined statically, but needs to
         *    reference the host instance ("this") to obtain an initial value. If both the value and valueFn properties are defined,
         *    the value returned by the valueFn has precedence over the value property, unless it returns undefined, in which
         *    case the value property is used.</p>
         *
         *    <p>valueFn can also be set to a string, representing the name of the instance method to be used to retrieve the value.</p>
         *    </dd>
         *
         *    <dt>readOnly &#60;boolean&#62;</dt>
         *    <dd>Whether or not the attribute is read only. Attributes having readOnly set to true
         *        cannot be modified by invoking the set method.</dd>
         *
         *    <dt>writeOnce &#60;boolean&#62; or &#60;string&#62;</dt>
         *    <dd>
         *        Whether or not the attribute is "write once". Attributes having writeOnce set to true,
         *        can only have their values set once, be it through the default configuration,
         *        constructor configuration arguments, or by invoking set.
         *        <p>The writeOnce attribute can also be set to the string "initOnly",
         *         in which case the attribute can only be set during initialization
         *        (when used with Base, this means it can only be set during construction)</p>
         *    </dd>
         *
         *    <dt>setter &#60;Function | String&#62;</dt>
         *    <dd>
         *    <p>The setter function used to massage or normalize the value passed to the set method for the attribute.
         *    The value returned by the setter will be the final stored value. Returning
         *    <a href="#property_Attribute.INVALID_VALUE">Attribute.INVALID_VALUE</a>, from the setter will prevent
         *    the value from being stored.
         *    </p>
         *
         *    <p>setter can also be set to a string, representing the name of the instance method to be used as the setter function.</p>
         *    </dd>
         *
         *    <dt>getter &#60;Function | String&#62;</dt>
         *    <dd>
         *    <p>
         *    The getter function used to massage or normalize the value returned by the get method for the attribute.
         *    The value returned by the getter function is the value which will be returned to the user when they
         *    invoke get.
         *    </p>
         *
         *    <p>getter can also be set to a string, representing the name of the instance method to be used as the getter function.</p>
         *    </dd>
         *
         *    <dt>validator &#60;Function | String&#62;</dt>
         *    <dd>
         *    <p>
         *    The validator function invoked prior to setting the stored value. Returning
         *    false from the validator function will prevent the value from being stored.
         *    </p>
         *
         *    <p>validator can also be set to a string, representing the name of the instance method to be used as the validator function.</p>
         *    </dd>
         *
         *    <dt>lazyAdd &#60;boolean&#62;</dt>
         *    <dd>Whether or not to delay initialization of the attribute until the first call to get/set it.
         *    This flag can be used to over-ride lazy initialization on a per attribute basis, when adding multiple attributes through
         *    the <a href="#method_addAttrs">addAttrs</a> method.</dd>
         *
         * </dl>
         *
         * <p>The setter, getter and validator are invoked with the value and name passed in as the first and second arguments, and with
         * the context ("this") set to the host object.</p>
         *
         * <p>Configuration properties outside of the list mentioned above are considered private properties used internally by attribute,
         * and are not intended for public use.</p>
         *
         * @method addAttr
         *
         * @param {String} name The name of the attribute.
         * @param {Object} config An object with attribute configuration property/value pairs, specifying the configuration for the attribute.
         *
         * <p>
         * <strong>NOTE:</strong> The configuration object is modified when adding an attribute, so if you need
         * to protect the original values, you will need to merge the object.
         * </p>
         *
         * @param {boolean} lazy (optional) Whether or not to add this attribute lazily (on the first call to get/set).
         *
         * @return {Object} A reference to the host object.
         *
         * @chainable
         */
        addAttr : function(name, config, lazy) {


            var host = this, // help compression
                state = host._state,
                data = state.data,
                value,
                added,
                hasValue;

            config = config || {};

            if (LAZY_ADD in config) {
                lazy = config[LAZY_ADD];
            }

            added = state.get(name, ADDED);

            if (lazy && !added) {
                state.data[name] = {
                    lazy : config,
                    added : true
                };
            } else {


                if (!added || config.isLazyAdd) {

                    hasValue = (VALUE in config);


                    if (hasValue) {

                        // We'll go through set, don't want to set value in config directly

                        // PERF TODO: VALIDATE: See if setting this to undefined is sufficient. We use to delete before.
                        // In certain code paths/use cases, undefined may not be the same as not present.
                        // If not, we can set it to some known fixed value (like INVALID_VALUE, say INITIALIZING_VALUE) for performance,
                        // to avoid a delete which seems to help a lot.

                        value = config.value;
                        config.value = undefined;
                    }

                    config.added = true;
                    config.initializing = true;

                    data[name] = config;

                    if (hasValue) {
                        // Go through set, so that raw values get normalized/validated
                        host.set(name, value);
                    }

                    config.initializing = false;
                }
            }

            return host;
        },

        /**
         * Checks if the given attribute has been added to the host
         *
         * @method attrAdded
         * @param {String} name The name of the attribute to check.
         * @return {boolean} true if an attribute with the given name has been added, false if it hasn't.
         *         This method will return true for lazily added attributes.
         */
        attrAdded: function(name) {
            return !!(this._state.get(name, ADDED));
        },

        /**
         * Returns the current value of the attribute. If the attribute
         * has been configured with a 'getter' function, this method will delegate
         * to the 'getter' to obtain the value of the attribute.
         *
         * @method get
         *
         * @param {String} name The name of the attribute. If the value of the attribute is an Object,
         * dot notation can be used to obtain the value of a property of the object (e.g. <code>get("x.y.z")</code>)
         *
         * @return {Any} The value of the attribute
         */
        get : function(name) {
            return this._getAttr(name);
        },

        /**
         * Checks whether or not the attribute is one which has been
         * added lazily and still requires initialization.
         *
         * @method _isLazyAttr
         * @private
         * @param {String} name The name of the attribute
         * @return {boolean} true if it's a lazily added attribute, false otherwise.
         */
        _isLazyAttr: function(name) {
            return this._state.get(name, LAZY);
        },

        /**
         * Finishes initializing an attribute which has been lazily added.
         *
         * @method _addLazyAttr
         * @private
         * @param {Object} name The name of the attribute
         * @param {Object} [lazyCfg] Optional config hash for the attribute. This is added for performance
         * along the critical path, where the calling method has already obtained lazy config from state.
         */
        _addLazyAttr: function(name, lazyCfg) {
            var state = this._state;

            lazyCfg = lazyCfg || state.get(name, LAZY);

            if (lazyCfg) {

                // PERF TODO: For App's id override, otherwise wouldn't be
                // needed. It expects to find it in the cfg for it's
                // addAttr override. Would like to remove, once App override is
                // removed.
                state.data[name].lazy = undefined;

                lazyCfg.isLazyAdd = true;

                this.addAttr(name, lazyCfg);
            }
        },

        /**
         * Sets the value of an attribute.
         *
         * @method set
         * @chainable
         *
         * @param {String} name The name of the attribute. If the
         * current value of the attribute is an Object, dot notation can be used
         * to set the value of a property within the object (e.g. <code>set("x.y.z", 5)</code>).
         * @param {Any} value The value to set the attribute to.
         * @param {Object} [opts] Optional data providing the circumstances for the change.
         * @return {Object} A reference to the host object.
         */
        set : function(name, val, opts) {
            return this._setAttr(name, val, opts);
        },

        /**
         * Allows setting of readOnly/writeOnce attributes. See <a href="#method_set">set</a> for argument details.
         *
         * @method _set
         * @protected
         * @chainable
         *
         * @param {String} name The name of the attribute.
         * @param {Any} val The value to set the attribute to.
         * @param {Object} [opts] Optional data providing the circumstances for the change.
         * @return {Object} A reference to the host object.
         */
        _set : function(name, val, opts) {
            return this._setAttr(name, val, opts, true);
        },

        /**
         * Provides the common implementation for the public set and protected _set methods.
         *
         * See <a href="#method_set">set</a> for argument details.
         *
         * @method _setAttr
         * @protected
         * @chainable
         *
         * @param {String} name The name of the attribute.
         * @param {Any} value The value to set the attribute to.
         * @param {Object} [opts] Optional data providing the circumstances for the change.
         * @param {boolean} force If true, allows the caller to set values for
         * readOnly or writeOnce attributes which have already been set.
         *
         * @return {Object} A reference to the host object.
         */
        _setAttr : function(name, val, opts, force)  {
            var allowSet = true,
                state = this._state,
                stateProxy = this._stateProxy,
                tCfgs = this._tCfgs,
                cfg,
                initialSet,
                strPath,
                path,
                currVal,
                writeOnce,
                initializing;

            if (name.indexOf(DOT) !== -1) {
                strPath = name;

                path = name.split(DOT);
                name = path.shift();
            }

            // On Demand - Should be rare - handles out of order valueFn, setter, getter references
            if (tCfgs && tCfgs[name]) {
                this._addOutOfOrder(name, tCfgs[name]);
            }

            cfg = state.data[name] || {};

            if (cfg.lazy) {
                cfg = cfg.lazy;
                this._addLazyAttr(name, cfg);
            }

            initialSet = (cfg.value === undefined);

            if (stateProxy && name in stateProxy && !cfg._bypassProxy) {
                // TODO: Value is always set for proxy. Can we do any better? Maybe take a snapshot as the initial value for the first call to set?
                initialSet = false;
            }

            writeOnce = cfg.writeOnce;
            initializing = cfg.initializing;

            if (!initialSet && !force) {

                if (writeOnce) {
                    allowSet = false;
                }

                if (cfg.readOnly) {
                    allowSet = false;
                }
            }

            if (!initializing && !force && writeOnce === INIT_ONLY) {
                allowSet = false;
            }

            if (allowSet) {
                // Don't need currVal if initialSet (might fail in custom getter if it always expects a non-undefined/non-null value)
                if (!initialSet) {
                    currVal =  this.get(name);
                }

                if (path) {
                   val = O.setValue(Y.clone(currVal), path, val);

                   if (val === undefined) {
                       allowSet = false;
                   }
                }

                if (allowSet) {
                    if (!this._fireAttrChange || initializing) {
                        this._setAttrVal(name, strPath, currVal, val, opts, cfg);
                    } else {
                        // HACK - no real reason core needs to know about _fireAttrChange, but
                        // it adds fn hops if we want to break it out. Not sure it's worth it for this critical path
                        this._fireAttrChange(name, strPath, currVal, val, opts, cfg);
                    }
                }
            }

            return this;
        },

        /**
         * Utility method used by get/set to add attributes
         * encountered out of order when calling addAttrs().
         *
         * For example, if:
         *
         *     this.addAttrs({
         *          foo: {
         *              setter: function() {
         *                 // make sure this bar is available when foo is added
         *                 this.get("bar");
         *              }
         *          },
         *          bar: {
         *              value: ...
         *          }
         *     });
         *
         * @method _addOutOfOrder
         * @private
         * @param name {String} attribute name
         * @param cfg {Object} attribute configuration
         */
        _addOutOfOrder : function(name, cfg) {

            var attrs = {};
            attrs[name] = cfg;

            delete this._tCfgs[name];

            // TODO: The original code went through addAttrs, so
            // sticking with it for this pass. Seems like we could
            // just jump straight to _addAttr() and get some perf
            // improvement.
            this._addAttrs(attrs, this._tVals);
        },

        /**
         * Provides the common implementation for the public get method,
         * allowing Attribute hosts to over-ride either method.
         *
         * See <a href="#method_get">get</a> for argument details.
         *
         * @method _getAttr
         * @protected
         * @chainable
         *
         * @param {String} name The name of the attribute.
         * @return {Any} The value of the attribute.
         */
        _getAttr : function(name) {
            var fullName = name,
                tCfgs = this._tCfgs,
                path,
                getter,
                val,
                attrCfg;

            if (name.indexOf(DOT) !== -1) {
                path = name.split(DOT);
                name = path.shift();
            }

            // On Demand - Should be rare - handles out of
            // order valueFn, setter, getter references
            if (tCfgs && tCfgs[name]) {
                this._addOutOfOrder(name, tCfgs[name]);
            }

            attrCfg = this._state.data[name] || {};

            // Lazy Init
            if (attrCfg.lazy) {
                attrCfg = attrCfg.lazy;
                this._addLazyAttr(name, attrCfg);
            }

            val = this._getStateVal(name, attrCfg);

            getter = attrCfg.getter;

            if (getter && !getter.call) {
                getter = this[getter];
            }

            val = (getter) ? getter.call(this, val, fullName) : val;
            val = (path) ? O.getValue(val, path) : val;

            return val;
        },

        /**
         * Gets the stored value for the attribute, from either the
         * internal state object, or the state proxy if it exits
         *
         * @method _getStateVal
         * @private
         * @param {String} name The name of the attribute
         * @param {Object} [cfg] Optional config hash for the attribute. This is added for performance along the critical path,
         * where the calling method has already obtained the config from state.
         *
         * @return {Any} The stored value of the attribute
         */
        _getStateVal : function(name, cfg) {
            var stateProxy = this._stateProxy;

            if (!cfg) {
                cfg = this._state.getAll(name) || {};
            }

            return (stateProxy && (name in stateProxy) && !(cfg._bypassProxy)) ? stateProxy[name] : cfg.value;
        },

        /**
         * Sets the stored value for the attribute, in either the
         * internal state object, or the state proxy if it exits
         *
         * @method _setStateVal
         * @private
         * @param {String} name The name of the attribute
         * @param {Any} value The value of the attribute
         */
        _setStateVal : function(name, value) {
            var stateProxy = this._stateProxy;
            if (stateProxy && (name in stateProxy) && !this._state.get(name, BYPASS_PROXY)) {
                stateProxy[name] = value;
            } else {
                this._state.add(name, VALUE, value);
            }
        },

        /**
         * Updates the stored value of the attribute in the privately held State object,
         * if validation and setter passes.
         *
         * @method _setAttrVal
         * @private
         * @param {String} attrName The attribute name.
         * @param {String} subAttrName The sub-attribute name, if setting a sub-attribute property ("x.y.z").
         * @param {Any} prevVal The currently stored value of the attribute.
         * @param {Any} newVal The value which is going to be stored.
         * @param {Object} [opts] Optional data providing the circumstances for the change.
         * @param {Object} [attrCfg] Optional config hash for the attribute. This is added for performance along the critical path,
         * where the calling method has already obtained the config from state.
         *
         * @return {Boolean} true if the new attribute value was stored, false if not.
         */
        _setAttrVal : function(attrName, subAttrName, prevVal, newVal, opts, attrCfg) {

            var host = this,
                allowSet = true,
                cfg = attrCfg || this._state.data[attrName] || {},
                validator = cfg.validator,
                setter = cfg.setter,
                initializing = cfg.initializing,
                prevRawVal = this._getStateVal(attrName, cfg),
                name = subAttrName || attrName,
                retVal,
                valid;

            if (validator) {
                if (!validator.call) {
                    // Assume string - trying to keep critical path tight, so avoiding Lang check
                    validator = this[validator];
                }
                if (validator) {
                    valid = validator.call(host, newVal, name, opts);

                    if (!valid && initializing) {
                        newVal = cfg.defaultValue;
                        valid = true; // Assume it's valid, for perf.
                    }
                }
            }

            if (!validator || valid) {
                if (setter) {
                    if (!setter.call) {
                        // Assume string - trying to keep critical path tight, so avoiding Lang check
                        setter = this[setter];
                    }
                    if (setter) {
                        retVal = setter.call(host, newVal, name, opts);

                        if (retVal === INVALID_VALUE) {
                            if (initializing) {
                                newVal = cfg.defaultValue;
                            } else {
                                allowSet = false;
                            }
                        } else if (retVal !== undefined){
                            newVal = retVal;
                        }
                    }
                }

                if (allowSet) {
                    if(!subAttrName && (newVal === prevRawVal) && !Lang.isObject(newVal)) {
                        allowSet = false;
                    } else {
                        // Store value
                        if (!(INIT_VALUE in cfg)) {
                            cfg.initValue = newVal;
                        }
                        host._setStateVal(attrName, newVal);
                    }
                }

            } else {
                allowSet = false;
            }

            return allowSet;
        },

        /**
         * Sets multiple attribute values.
         *
         * @method setAttrs
         * @param {Object} attrs  An object with attributes name/value pairs.
         * @param {Object} [opts] Optional data providing the circumstances for the change.
         * @return {Object} A reference to the host object.
         * @chainable
         */
        setAttrs : function(attrs, opts) {
            return this._setAttrs(attrs, opts);
        },

        /**
         * Implementation behind the public setAttrs method, to set multiple attribute values.
         *
         * @method _setAttrs
         * @protected
         * @param {Object} attrs  An object with attributes name/value pairs.
         * @param {Object} [opts] Optional data providing the circumstances for the change
         * @return {Object} A reference to the host object.
         * @chainable
         */
        _setAttrs : function(attrs, opts) {
            var attr;
            for (attr in attrs) {
                if ( attrs.hasOwnProperty(attr) ) {
                    this.set(attr, attrs[attr], opts);
                }
            }
            return this;
        },

        /**
         * Gets multiple attribute values.
         *
         * @method getAttrs
         * @param {String[]|Boolean} attrs Optional. An array of attribute names. If omitted, all attribute values are
         * returned. If set to true, all attributes modified from their initial values are returned.
         * @return {Object} An object with attribute name/value pairs.
         */
        getAttrs : function(attrs) {
            return this._getAttrs(attrs);
        },

        /**
         * Implementation behind the public getAttrs method, to get multiple attribute values.
         *
         * @method _getAttrs
         * @protected
         * @param {String[]|Boolean} attrs Optional. An array of attribute names. If omitted, all attribute values are
         * returned. If set to true, all attributes modified from their initial values are returned.
         * @return {Object} An object with attribute name/value pairs.
         */
        _getAttrs : function(attrs) {
            var obj = {},
                attr, i, len,
                modifiedOnly = (attrs === true);

            // TODO - figure out how to get all "added"
            if (!attrs || modifiedOnly) {
                attrs = O.keys(this._state.data);
            }

            for (i = 0, len = attrs.length; i < len; i++) {
                attr = attrs[i];

                if (!modifiedOnly || this._getStateVal(attr) != this._state.get(attr, INIT_VALUE)) {
                    // Go through get, to honor cloning/normalization
                    obj[attr] = this.get(attr);
                }
            }

            return obj;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         *
         * <p>
         * <strong>NOTE:</strong> This method does not isolate the configuration object by merging/cloning.
         * The caller is responsible for merging/cloning the configuration object if required.
         * </p>
         *
         * @method addAttrs
         * @chainable
         *
         * @param {Object} cfgs An object with attribute name/configuration pairs.
         * @param {Object} values An object with attribute name/value pairs, defining the initial values to apply.
         * Values defined in the cfgs argument will be over-written by values in this argument unless defined as read only.
         * @param {boolean} lazy Whether or not to delay the intialization of these attributes until the first call to get/set.
         * Individual attributes can over-ride this behavior by defining a lazyAdd configuration property in their configuration.
         * See <a href="#method_addAttr">addAttr</a>.
         *
         * @return {Object} A reference to the host object.
         */
        addAttrs : function(cfgs, values, lazy) {
            if (cfgs) {
                this._tCfgs = cfgs;
                this._tVals = (values) ? this._normAttrVals(values) : null;
                this._addAttrs(cfgs, this._tVals, lazy);
                this._tCfgs = this._tVals = null;
            }

            return this;
        },

        /**
         * Implementation behind the public addAttrs method.
         *
         * This method is invoked directly by get if it encounters a scenario
         * in which an attribute's valueFn attempts to obtain the
         * value an attribute in the same group of attributes, which has not yet
         * been added (on demand initialization).
         *
         * @method _addAttrs
         * @private
         * @param {Object} cfgs An object with attribute name/configuration pairs.
         * @param {Object} values An object with attribute name/value pairs, defining the initial values to apply.
         * Values defined in the cfgs argument will be over-written by values in this argument unless defined as read only.
         * @param {boolean} lazy Whether or not to delay the intialization of these attributes until the first call to get/set.
         * Individual attributes can over-ride this behavior by defining a lazyAdd configuration property in their configuration.
         * See <a href="#method_addAttr">addAttr</a>.
         */
        _addAttrs : function(cfgs, values, lazy) {
            var tCfgs = this._tCfgs,
                tVals = this._tVals,
                attr,
                attrCfg,
                value;

            for (attr in cfgs) {
                if (cfgs.hasOwnProperty(attr)) {

                    // Not Merging. Caller is responsible for isolating configs
                    attrCfg = cfgs[attr];
                    attrCfg.defaultValue = attrCfg.value;

                    // Handle simple, complex and user values, accounting for read-only
                    value = this._getAttrInitVal(attr, attrCfg, tVals);

                    if (value !== undefined) {
                        attrCfg.value = value;
                    }

                    if (tCfgs[attr]) {
                        tCfgs[attr] = undefined;
                    }

                    this.addAttr(attr, attrCfg, lazy);
                }
            }
        },

        /**
         * Utility method to protect an attribute configuration
         * hash, by merging the entire object and the individual
         * attr config objects.
         *
         * @method _protectAttrs
         * @protected
         * @param {Object} attrs A hash of attribute to configuration object pairs.
         * @return {Object} A protected version of the attrs argument.
         * @deprecated Use `AttributeCore.protectAttrs()` or
         *   `Attribute.protectAttrs()` which are the same static utility method.
         */
        _protectAttrs : AttributeCore.protectAttrs,

        /**
         * Utility method to normalize attribute values. The base implementation
         * simply merges the hash to protect the original.
         *
         * @method _normAttrVals
         * @param {Object} valueHash An object with attribute name/value pairs
         *
         * @return {Object} An object literal with 2 properties - "simple" and "complex",
         * containing simple and complex attribute values respectively keyed
         * by the top level attribute name, or null, if valueHash is falsey.
         *
         * @private
         */
        _normAttrVals : function(valueHash) {
            var vals,
                subvals,
                path,
                attr,
                v, k;

            if (!valueHash) {
                return null;
            }

            vals = {};

            for (k in valueHash) {
                if (valueHash.hasOwnProperty(k)) {
                    if (k.indexOf(DOT) !== -1) {
                        path = k.split(DOT);
                        attr = path.shift();

                        subvals = subvals || {};

                        v = subvals[attr] = subvals[attr] || [];
                        v[v.length] = {
                            path : path,
                            value: valueHash[k]
                        };
                    } else {
                        vals[k] = valueHash[k];
                    }
                }
            }

            return { simple:vals, complex:subvals };
        },

        /**
         * Returns the initial value of the given attribute from
         * either the default configuration provided, or the
         * over-ridden value if it exists in the set of initValues
         * provided and the attribute is not read-only.
         *
         * @param {String} attr The name of the attribute
         * @param {Object} cfg The attribute configuration object
         * @param {Object} initValues The object with simple and complex attribute name/value pairs returned from _normAttrVals
         *
         * @return {Any} The initial value of the attribute.
         *
         * @method _getAttrInitVal
         * @private
         */
        _getAttrInitVal : function(attr, cfg, initValues) {
            var val = cfg.value,
                valFn = cfg.valueFn,
                tmpVal,
                initValSet = false,
                readOnly = cfg.readOnly,
                simple,
                complex,
                i,
                l,
                path,
                subval,
                subvals;

            if (!readOnly && initValues) {
                // Simple Attributes
                simple = initValues.simple;
                if (simple && simple.hasOwnProperty(attr)) {
                    val = simple[attr];
                    initValSet = true;
                }
            }

            if (valFn && !initValSet) {
                if (!valFn.call) {
                    valFn = this[valFn];
                }
                if (valFn) {
                    tmpVal = valFn.call(this, attr);
                    val = tmpVal;
                }
            }

            if (!readOnly && initValues) {

                // Complex Attributes (complex values applied, after simple, in case both are set)
                complex = initValues.complex;

                if (complex && complex.hasOwnProperty(attr) && (val !== undefined) && (val !== null)) {
                    subvals = complex[attr];
                    for (i = 0, l = subvals.length; i < l; ++i) {
                        path = subvals[i].path;
                        subval = subvals[i].value;
                        O.setValue(val, path, subval);
                    }
                }
            }

            return val;
        },

        /**
         * Utility method to set up initial attributes defined during construction,
         * either through the constructor.ATTRS property, or explicitly passed in.
         *
         * @method _initAttrs
         * @protected
         * @param attrs {Object} The attributes to add during construction (passed through to <a href="#method_addAttrs">addAttrs</a>).
         *        These can also be defined on the constructor being augmented with Attribute by defining the ATTRS property on the constructor.
         * @param values {Object} The initial attribute values to apply (passed through to <a href="#method_addAttrs">addAttrs</a>).
         *        These are not merged/cloned. The caller is responsible for isolating user provided values if required.
         * @param lazy {boolean} Whether or not to add attributes lazily (passed through to <a href="#method_addAttrs">addAttrs</a>).
         */
        _initAttrs : function(attrs, values, lazy) {
            // ATTRS support for Node, which is not Base based
            attrs = attrs || this.constructor.ATTRS;

            var Base = Y.Base,
                BaseCore = Y.BaseCore,
                baseInst = (Base && Y.instanceOf(this, Base)),
                baseCoreInst = (!baseInst && BaseCore && Y.instanceOf(this, BaseCore));

            if (attrs && !baseInst && !baseCoreInst) {
                this.addAttrs(Y.AttributeCore.protectAttrs(attrs), values, lazy);
            }
        }
    };

    Y.AttributeCore = AttributeCore;


}, '3.16.0', {"requires": ["oop"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('event-custom-base', function (Y, NAME) {

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 */

Y.Env.evt = {
    handles: {},
    plugins: {}
};

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 * @submodule event-custom-base
 */

/**
 * Allows for the insertion of methods that are executed before or after
 * a specified method
 * @class Do
 * @static
 */

var DO_BEFORE = 0,
    DO_AFTER = 1,

DO = {

    /**
     * Cache of objects touched by the utility
     * @property objs
     * @static
     * @deprecated Since 3.6.0. The `_yuiaop` property on the AOP'd object
     * replaces the role of this property, but is considered to be private, and
     * is only mentioned to provide a migration path.
     *
     * If you have a use case which warrants migration to the _yuiaop property,
     * please file a ticket to let us know what it's used for and we can see if
     * we need to expose hooks for that functionality more formally.
     */
    objs: null,

    /**
     * <p>Execute the supplied method before the specified function.  Wrapping
     * function may optionally return an instance of the following classes to
     * further alter runtime behavior:</p>
     * <dl>
     *     <dt></code>Y.Do.Halt(message, returnValue)</code></dt>
     *         <dd>Immediatly stop execution and return
     *         <code>returnValue</code>.  No other wrapping functions will be
     *         executed.</dd>
     *     <dt></code>Y.Do.AlterArgs(message, newArgArray)</code></dt>
     *         <dd>Replace the arguments that the original function will be
     *         called with.</dd>
     *     <dt></code>Y.Do.Prevent(message)</code></dt>
     *         <dd>Don't execute the wrapped function.  Other before phase
     *         wrappers will be executed.</dd>
     * </dl>
     *
     * @method before
     * @param fn {Function} the function to execute
     * @param obj the object hosting the method to displace
     * @param sFn {string} the name of the method to displace
     * @param c The execution context for fn
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {EventHandle} handle for the subscription
     * @static
     */
    before: function(fn, obj, sFn, c) {
        var f = fn, a;
        if (c) {
            a = [fn, c].concat(Y.Array(arguments, 4, true));
            f = Y.rbind.apply(Y, a);
        }

        return this._inject(DO_BEFORE, f, obj, sFn);
    },

    /**
     * <p>Execute the supplied method after the specified function.  Wrapping
     * function may optionally return an instance of the following classes to
     * further alter runtime behavior:</p>
     * <dl>
     *     <dt></code>Y.Do.Halt(message, returnValue)</code></dt>
     *         <dd>Immediatly stop execution and return
     *         <code>returnValue</code>.  No other wrapping functions will be
     *         executed.</dd>
     *     <dt></code>Y.Do.AlterReturn(message, returnValue)</code></dt>
     *         <dd>Return <code>returnValue</code> instead of the wrapped
     *         method's original return value.  This can be further altered by
     *         other after phase wrappers.</dd>
     * </dl>
     *
     * <p>The static properties <code>Y.Do.originalRetVal</code> and
     * <code>Y.Do.currentRetVal</code> will be populated for reference.</p>
     *
     * @method after
     * @param fn {Function} the function to execute
     * @param obj the object hosting the method to displace
     * @param sFn {string} the name of the method to displace
     * @param c The execution context for fn
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * @return {EventHandle} handle for the subscription
     * @static
     */
    after: function(fn, obj, sFn, c) {
        var f = fn, a;
        if (c) {
            a = [fn, c].concat(Y.Array(arguments, 4, true));
            f = Y.rbind.apply(Y, a);
        }

        return this._inject(DO_AFTER, f, obj, sFn);
    },

    /**
     * Execute the supplied method before or after the specified function.
     * Used by <code>before</code> and <code>after</code>.
     *
     * @method _inject
     * @param when {string} before or after
     * @param fn {Function} the function to execute
     * @param obj the object hosting the method to displace
     * @param sFn {string} the name of the method to displace
     * @param c The execution context for fn
     * @return {EventHandle} handle for the subscription
     * @private
     * @static
     */
    _inject: function(when, fn, obj, sFn) {
        // object id
        var id = Y.stamp(obj), o, sid;

        if (!obj._yuiaop) {
            // create a map entry for the obj if it doesn't exist, to hold overridden methods
            obj._yuiaop = {};
        }

        o = obj._yuiaop;

        if (!o[sFn]) {
            // create a map entry for the method if it doesn't exist
            o[sFn] = new Y.Do.Method(obj, sFn);

            // re-route the method to our wrapper
            obj[sFn] = function() {
                return o[sFn].exec.apply(o[sFn], arguments);
            };
        }

        // subscriber id
        sid = id + Y.stamp(fn) + sFn;

        // register the callback
        o[sFn].register(sid, fn, when);

        return new Y.EventHandle(o[sFn], sid);
    },

    /**
     * Detach a before or after subscription.
     *
     * @method detach
     * @param handle {EventHandle} the subscription handle
     * @static
     */
    detach: function(handle) {
        if (handle.detach) {
            handle.detach();
        }
    }
};

Y.Do = DO;

//////////////////////////////////////////////////////////////////////////

/**
 * Contains the return value from the wrapped method, accessible
 * by 'after' event listeners.
 *
 * @property originalRetVal
 * @static
 * @since 3.2.0
 */

/**
 * Contains the current state of the return value, consumable by
 * 'after' event listeners, and updated if an after subscriber
 * changes the return value generated by the wrapped function.
 *
 * @property currentRetVal
 * @static
 * @since 3.2.0
 */

//////////////////////////////////////////////////////////////////////////

/**
 * Wrapper for a displaced method with aop enabled
 * @class Do.Method
 * @constructor
 * @param obj The object to operate on
 * @param sFn The name of the method to displace
 */
DO.Method = function(obj, sFn) {
    this.obj = obj;
    this.methodName = sFn;
    this.method = obj[sFn];
    this.before = {};
    this.after = {};
};

/**
 * Register a aop subscriber
 * @method register
 * @param sid {string} the subscriber id
 * @param fn {Function} the function to execute
 * @param when {string} when to execute the function
 */
DO.Method.prototype.register = function (sid, fn, when) {
    if (when) {
        this.after[sid] = fn;
    } else {
        this.before[sid] = fn;
    }
};

/**
 * Unregister a aop subscriber
 * @method delete
 * @param sid {string} the subscriber id
 * @param fn {Function} the function to execute
 * @param when {string} when to execute the function
 */
DO.Method.prototype._delete = function (sid) {
    delete this.before[sid];
    delete this.after[sid];
};

/**
 * <p>Execute the wrapped method.  All arguments are passed into the wrapping
 * functions.  If any of the before wrappers return an instance of
 * <code>Y.Do.Halt</code> or <code>Y.Do.Prevent</code>, neither the wrapped
 * function nor any after phase subscribers will be executed.</p>
 *
 * <p>The return value will be the return value of the wrapped function or one
 * provided by a wrapper function via an instance of <code>Y.Do.Halt</code> or
 * <code>Y.Do.AlterReturn</code>.
 *
 * @method exec
 * @param arg* {any} Arguments are passed to the wrapping and wrapped functions
 * @return {any} Return value of wrapped function unless overwritten (see above)
 */
DO.Method.prototype.exec = function () {

    var args = Y.Array(arguments, 0, true),
        i, ret, newRet,
        bf = this.before,
        af = this.after,
        prevented = false;

    // execute before
    for (i in bf) {
        if (bf.hasOwnProperty(i)) {
            ret = bf[i].apply(this.obj, args);
            if (ret) {
                switch (ret.constructor) {
                    case DO.Halt:
                        return ret.retVal;
                    case DO.AlterArgs:
                        args = ret.newArgs;
                        break;
                    case DO.Prevent:
                        prevented = true;
                        break;
                    default:
                }
            }
        }
    }

    // execute method
    if (!prevented) {
        ret = this.method.apply(this.obj, args);
    }

    DO.originalRetVal = ret;
    DO.currentRetVal = ret;

    // execute after methods.
    for (i in af) {
        if (af.hasOwnProperty(i)) {
            newRet = af[i].apply(this.obj, args);
            // Stop processing if a Halt object is returned
            if (newRet && newRet.constructor === DO.Halt) {
                return newRet.retVal;
            // Check for a new return value
            } else if (newRet && newRet.constructor === DO.AlterReturn) {
                ret = newRet.newRetVal;
                // Update the static retval state
                DO.currentRetVal = ret;
            }
        }
    }

    return ret;
};

//////////////////////////////////////////////////////////////////////////

/**
 * Return an AlterArgs object when you want to change the arguments that
 * were passed into the function.  Useful for Do.before subscribers.  An
 * example would be a service that scrubs out illegal characters prior to
 * executing the core business logic.
 * @class Do.AlterArgs
 * @constructor
 * @param msg {String} (optional) Explanation of the altered return value
 * @param newArgs {Array} Call parameters to be used for the original method
 *                        instead of the arguments originally passed in.
 */
DO.AlterArgs = function(msg, newArgs) {
    this.msg = msg;
    this.newArgs = newArgs;
};

/**
 * Return an AlterReturn object when you want to change the result returned
 * from the core method to the caller.  Useful for Do.after subscribers.
 * @class Do.AlterReturn
 * @constructor
 * @param msg {String} (optional) Explanation of the altered return value
 * @param newRetVal {any} Return value passed to code that invoked the wrapped
 *                      function.
 */
DO.AlterReturn = function(msg, newRetVal) {
    this.msg = msg;
    this.newRetVal = newRetVal;
};

/**
 * Return a Halt object when you want to terminate the execution
 * of all subsequent subscribers as well as the wrapped method
 * if it has not exectued yet.  Useful for Do.before subscribers.
 * @class Do.Halt
 * @constructor
 * @param msg {String} (optional) Explanation of why the termination was done
 * @param retVal {any} Return value passed to code that invoked the wrapped
 *                      function.
 */
DO.Halt = function(msg, retVal) {
    this.msg = msg;
    this.retVal = retVal;
};

/**
 * Return a Prevent object when you want to prevent the wrapped function
 * from executing, but want the remaining listeners to execute.  Useful
 * for Do.before subscribers.
 * @class Do.Prevent
 * @constructor
 * @param msg {String} (optional) Explanation of why the termination was done
 */
DO.Prevent = function(msg) {
    this.msg = msg;
};

/**
 * Return an Error object when you want to terminate the execution
 * of all subsequent method calls.
 * @class Do.Error
 * @constructor
 * @param msg {String} (optional) Explanation of the altered return value
 * @param retVal {any} Return value passed to code that invoked the wrapped
 *                      function.
 * @deprecated use Y.Do.Halt or Y.Do.Prevent
 */
DO.Error = DO.Halt;


//////////////////////////////////////////////////////////////////////////

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 * @submodule event-custom-base
 */


// var onsubscribeType = "_event:onsub",
var YArray = Y.Array,

    AFTER = 'after',
    CONFIGS = [
        'broadcast',
        'monitored',
        'bubbles',
        'context',
        'contextFn',
        'currentTarget',
        'defaultFn',
        'defaultTargetOnly',
        'details',
        'emitFacade',
        'fireOnce',
        'async',
        'host',
        'preventable',
        'preventedFn',
        'queuable',
        'silent',
        'stoppedFn',
        'target',
        'type'
    ],

    CONFIGS_HASH = YArray.hash(CONFIGS),

    nativeSlice = Array.prototype.slice,

    YUI3_SIGNATURE = 9,
    YUI_LOG = 'yui:log',

    mixConfigs = function(r, s, ov) {
        var p;

        for (p in s) {
            if (CONFIGS_HASH[p] && (ov || !(p in r))) {
                r[p] = s[p];
            }
        }

        return r;
    };

/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String} type The type of event, which is passed to the callback
 * when the event fires.
 * @param {object} defaults configuration object.
 * @class CustomEvent
 * @constructor
 */

 /**
 * The type of event, returned to subscribers when the event fires
 * @property type
 * @type string
 */

/**
 * By default all custom events are logged in the debug build, set silent
 * to true to disable debug outpu for this event.
 * @property silent
 * @type boolean
 */

Y.CustomEvent = function(type, defaults) {

    this._kds = Y.CustomEvent.keepDeprecatedSubs;

    this.id = Y.guid();

    this.type = type;
    this.silent = this.logSystem = (type === YUI_LOG);

    if (this._kds) {
        /**
         * The subscribers to this event
         * @property subscribers
         * @type Subscriber {}
         * @deprecated
         */

        /**
         * 'After' subscribers
         * @property afters
         * @type Subscriber {}
         * @deprecated
         */
        this.subscribers = {};
        this.afters = {};
    }

    if (defaults) {
        mixConfigs(this, defaults, true);
    }
};

/**
 * Static flag to enable population of the <a href="#property_subscribers">`subscribers`</a>
 * and  <a href="#property_subscribers">`afters`</a> properties held on a `CustomEvent` instance.
 *
 * These properties were changed to private properties (`_subscribers` and `_afters`), and
 * converted from objects to arrays for performance reasons.
 *
 * Setting this property to true will populate the deprecated `subscribers` and `afters`
 * properties for people who may be using them (which is expected to be rare). There will
 * be a performance hit, compared to the new array based implementation.
 *
 * If you are using these deprecated properties for a use case which the public API
 * does not support, please file an enhancement request, and we can provide an alternate
 * public implementation which doesn't have the performance cost required to maintiain the
 * properties as objects.
 *
 * @property keepDeprecatedSubs
 * @static
 * @for CustomEvent
 * @type boolean
 * @default false
 * @deprecated
 */
Y.CustomEvent.keepDeprecatedSubs = false;

Y.CustomEvent.mixConfigs = mixConfigs;

Y.CustomEvent.prototype = {

    constructor: Y.CustomEvent,

    /**
     * Monitor when an event is attached or detached.
     *
     * @property monitored
     * @type boolean
     */

    /**
     * If 0, this event does not broadcast.  If 1, the YUI instance is notified
     * every time this event fires.  If 2, the YUI instance and the YUI global
     * (if event is enabled on the global) are notified every time this event
     * fires.
     * @property broadcast
     * @type int
     */

    /**
     * Specifies whether this event should be queued when the host is actively
     * processing an event.  This will effect exectution order of the callbacks
     * for the various events.
     * @property queuable
     * @type boolean
     * @default false
     */

    /**
     * This event has fired if true
     *
     * @property fired
     * @type boolean
     * @default false;
     */

    /**
     * An array containing the arguments the custom event
     * was last fired with.
     * @property firedWith
     * @type Array
     */

    /**
     * This event should only fire one time if true, and if
     * it has fired, any new subscribers should be notified
     * immediately.
     *
     * @property fireOnce
     * @type boolean
     * @default false;
     */

    /**
     * fireOnce listeners will fire syncronously unless async
     * is set to true
     * @property async
     * @type boolean
     * @default false
     */

    /**
     * Flag for stopPropagation that is modified during fire()
     * 1 means to stop propagation to bubble targets.  2 means
     * to also stop additional subscribers on this target.
     * @property stopped
     * @type int
     */

    /**
     * Flag for preventDefault that is modified during fire().
     * if it is not 0, the default behavior for this event
     * @property prevented
     * @type int
     */

    /**
     * Specifies the host for this custom event.  This is used
     * to enable event bubbling
     * @property host
     * @type EventTarget
     */

    /**
     * The default function to execute after event listeners
     * have fire, but only if the default action was not
     * prevented.
     * @property defaultFn
     * @type Function
     */

    /**
     * Flag for the default function to execute only if the
     * firing event is the current target. This happens only
     * when using custom event delegation and setting the
     * flag to `true` mimics the behavior of event delegation
     * in the DOM.
     *
     * @property defaultTargetOnly
     * @type Boolean
     * @default false
     */

    /**
     * The function to execute if a subscriber calls
     * stopPropagation or stopImmediatePropagation
     * @property stoppedFn
     * @type Function
     */

    /**
     * The function to execute if a subscriber calls
     * preventDefault
     * @property preventedFn
     * @type Function
     */

    /**
     * The subscribers to this event
     * @property _subscribers
     * @type Subscriber []
     * @private
     */

    /**
     * 'After' subscribers
     * @property _afters
     * @type Subscriber []
     * @private
     */

    /**
     * If set to true, the custom event will deliver an EventFacade object
     * that is similar to a DOM event object.
     * @property emitFacade
     * @type boolean
     * @default false
     */

    /**
     * Supports multiple options for listener signatures in order to
     * port YUI 2 apps.
     * @property signature
     * @type int
     * @default 9
     */
    signature : YUI3_SIGNATURE,

    /**
     * The context the the event will fire from by default.  Defaults to the YUI
     * instance.
     * @property context
     * @type object
     */
    context : Y,

    /**
     * Specifies whether or not this event's default function
     * can be cancelled by a subscriber by executing preventDefault()
     * on the event facade
     * @property preventable
     * @type boolean
     * @default true
     */
    preventable : true,

    /**
     * Specifies whether or not a subscriber can stop the event propagation
     * via stopPropagation(), stopImmediatePropagation(), or halt()
     *
     * Events can only bubble if emitFacade is true.
     *
     * @property bubbles
     * @type boolean
     * @default true
     */
    bubbles : true,

    /**
     * Returns the number of subscribers for this event as the sum of the on()
     * subscribers and after() subscribers.
     *
     * @method hasSubs
     * @return Number
     */
    hasSubs: function(when) {
        var s = 0,
            a = 0,
            subs = this._subscribers,
            afters = this._afters,
            sib = this.sibling;

        if (subs) {
            s = subs.length;
        }

        if (afters) {
            a = afters.length;
        }

        if (sib) {
            subs = sib._subscribers;
            afters = sib._afters;

            if (subs) {
                s += subs.length;
            }

            if (afters) {
                a += afters.length;
            }
        }

        if (when) {
            return (when === 'after') ? a : s;
        }

        return (s + a);
    },

    /**
     * Monitor the event state for the subscribed event.  The first parameter
     * is what should be monitored, the rest are the normal parameters when
     * subscribing to an event.
     * @method monitor
     * @param what {string} what to monitor ('detach', 'attach', 'publish').
     * @return {EventHandle} return value from the monitor event subscription.
     */
    monitor: function(what) {
        this.monitored = true;
        var type = this.id + '|' + this.type + '_' + what,
            args = nativeSlice.call(arguments, 0);
        args[0] = type;
        return this.host.on.apply(this.host, args);
    },

    /**
     * Get all of the subscribers to this event and any sibling event
     * @method getSubs
     * @return {Array} first item is the on subscribers, second the after.
     */
    getSubs: function() {

        var sibling = this.sibling,
            subs = this._subscribers,
            afters = this._afters,
            siblingSubs,
            siblingAfters;

        if (sibling) {
            siblingSubs = sibling._subscribers;
            siblingAfters = sibling._afters;
        }

        if (siblingSubs) {
            if (subs) {
                subs = subs.concat(siblingSubs);
            } else {
                subs = siblingSubs.concat();
            }
        } else {
            if (subs) {
                subs = subs.concat();
            } else {
                subs = [];
            }
        }

        if (siblingAfters) {
            if (afters) {
                afters = afters.concat(siblingAfters);
            } else {
                afters = siblingAfters.concat();
            }
        } else {
            if (afters) {
                afters = afters.concat();
            } else {
                afters = [];
            }
        }

        return [subs, afters];
    },

    /**
     * Apply configuration properties.  Only applies the CONFIG whitelist
     * @method applyConfig
     * @param o hash of properties to apply.
     * @param force {boolean} if true, properties that exist on the event
     * will be overwritten.
     */
    applyConfig: function(o, force) {
        mixConfigs(this, o, force);
    },

    /**
     * Create the Subscription for subscribing function, context, and bound
     * arguments.  If this is a fireOnce event, the subscriber is immediately
     * notified.
     *
     * @method _on
     * @param fn {Function} Subscription callback
     * @param [context] {Object} Override `this` in the callback
     * @param [args] {Array} bound arguments that will be passed to the callback after the arguments generated by fire()
     * @param [when] {String} "after" to slot into after subscribers
     * @return {EventHandle}
     * @protected
     */
    _on: function(fn, context, args, when) {


        var s = new Y.Subscriber(fn, context, args, when),
            firedWith;

        if (this.fireOnce && this.fired) {

            firedWith = this.firedWith;

            // It's a little ugly for this to know about facades,
            // but given the current breakup, not much choice without
            // moving a whole lot of stuff around.
            if (this.emitFacade && this._addFacadeToArgs) {
                this._addFacadeToArgs(firedWith);
            }

            if (this.async) {
                setTimeout(Y.bind(this._notify, this, s, firedWith), 0);
            } else {
                this._notify(s, firedWith);
            }
        }

        if (when === AFTER) {
            if (!this._afters) {
                this._afters = [];
            }
            this._afters.push(s);
        } else {
            if (!this._subscribers) {
                this._subscribers = [];
            }
            this._subscribers.push(s);
        }

        if (this._kds) {
            if (when === AFTER) {
                this.afters[s.id] = s;
            } else {
                this.subscribers[s.id] = s;
            }
        }

        return new Y.EventHandle(this, s);
    },

    /**
     * Listen for this event
     * @method subscribe
     * @param {Function} fn The function to execute.
     * @return {EventHandle} Unsubscribe handle.
     * @deprecated use on.
     */
    subscribe: function(fn, context) {
        var a = (arguments.length > 2) ? nativeSlice.call(arguments, 2) : null;
        return this._on(fn, context, a, true);
    },

    /**
     * Listen for this event
     * @method on
     * @param {Function} fn The function to execute.
     * @param {object} context optional execution context.
     * @param {mixed} arg* 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {EventHandle} An object with a detach method to detch the handler(s).
     */
    on: function(fn, context) {
        var a = (arguments.length > 2) ? nativeSlice.call(arguments, 2) : null;

        if (this.monitored && this.host) {
            this.host._monitor('attach', this, {
                args: arguments
            });
        }
        return this._on(fn, context, a, true);
    },

    /**
     * Listen for this event after the normal subscribers have been notified and
     * the default behavior has been applied.  If a normal subscriber prevents the
     * default behavior, it also prevents after listeners from firing.
     * @method after
     * @param {Function} fn The function to execute.
     * @param {object} context optional execution context.
     * @param {mixed} arg* 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {EventHandle} handle Unsubscribe handle.
     */
    after: function(fn, context) {
        var a = (arguments.length > 2) ? nativeSlice.call(arguments, 2) : null;
        return this._on(fn, context, a, AFTER);
    },

    /**
     * Detach listeners.
     * @method detach
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed.
     * @param {Object}   context The context object passed to subscribe.
     * @return {Number} returns the number of subscribers unsubscribed.
     */
    detach: function(fn, context) {
        // unsubscribe handle
        if (fn && fn.detach) {
            return fn.detach();
        }

        var i, s,
            found = 0,
            subs = this._subscribers,
            afters = this._afters;

        if (subs) {
            for (i = subs.length; i >= 0; i--) {
                s = subs[i];
                if (s && (!fn || fn === s.fn)) {
                    this._delete(s, subs, i);
                    found++;
                }
            }
        }

        if (afters) {
            for (i = afters.length; i >= 0; i--) {
                s = afters[i];
                if (s && (!fn || fn === s.fn)) {
                    this._delete(s, afters, i);
                    found++;
                }
            }
        }

        return found;
    },

    /**
     * Detach listeners.
     * @method unsubscribe
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed.
     * @param {Object}   context The context object passed to subscribe.
     * @return {int|undefined} returns the number of subscribers unsubscribed.
     * @deprecated use detach.
     */
    unsubscribe: function() {
        return this.detach.apply(this, arguments);
    },

    /**
     * Notify a single subscriber
     * @method _notify
     * @param {Subscriber} s the subscriber.
     * @param {Array} args the arguments array to apply to the listener.
     * @protected
     */
    _notify: function(s, args, ef) {


        var ret;

        ret = s.notify(args, this);

        if (false === ret || this.stopped > 1) {
            return false;
        }

        return true;
    },

    /**
     * Logger abstraction to centralize the application of the silent flag
     * @method log
     * @param {string} msg message to log.
     * @param {string} cat log category.
     */
    log: function(msg, cat) {
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the context specified when the event was created, and with the
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe()
     *       method</li>
     *   </ul>
     * @method fire
     * @param {Object*} arguments an arbitrary set of parameters to pass to
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false,
     *                   true otherwise.
     *
     */
    fire: function() {

        // push is the fastest way to go from arguments to arrays
        // for most browsers currently
        // http://jsperf.com/push-vs-concat-vs-slice/2

        var args = [];
        args.push.apply(args, arguments);

        return this._fire(args);
    },

    /**
     * Private internal implementation for `fire`, which is can be used directly by
     * `EventTarget` and other event module classes which have already converted from
     * an `arguments` list to an array, to avoid the repeated overhead.
     *
     * @method _fire
     * @private
     * @param {Array} args The array of arguments passed to be passed to handlers.
     * @return {boolean} false if one of the subscribers returned false, true otherwise.
     */
    _fire: function(args) {

        if (this.fireOnce && this.fired) {
            return true;
        } else {

            // this doesn't happen if the event isn't published
            // this.host._monitor('fire', this.type, args);

            this.fired = true;

            if (this.fireOnce) {
                this.firedWith = args;
            }

            if (this.emitFacade) {
                return this.fireComplex(args);
            } else {
                return this.fireSimple(args);
            }
        }
    },

    /**
     * Set up for notifying subscribers of non-emitFacade events.
     *
     * @method fireSimple
     * @param args {Array} Arguments passed to fire()
     * @return Boolean false if a subscriber returned false
     * @protected
     */
    fireSimple: function(args) {
        this.stopped = 0;
        this.prevented = 0;
        if (this.hasSubs()) {
            var subs = this.getSubs();
            this._procSubs(subs[0], args);
            this._procSubs(subs[1], args);
        }
        if (this.broadcast) {
            this._broadcast(args);
        }
        return this.stopped ? false : true;
    },

    // Requires the event-custom-complex module for full funcitonality.
    fireComplex: function(args) {
        args[0] = args[0] || {};
        return this.fireSimple(args);
    },

    /**
     * Notifies a list of subscribers.
     *
     * @method _procSubs
     * @param subs {Array} List of subscribers
     * @param args {Array} Arguments passed to fire()
     * @param ef {}
     * @return Boolean false if a subscriber returns false or stops the event
     *              propagation via e.stopPropagation(),
     *              e.stopImmediatePropagation(), or e.halt()
     * @private
     */
    _procSubs: function(subs, args, ef) {
        var s, i, l;

        for (i = 0, l = subs.length; i < l; i++) {
            s = subs[i];
            if (s && s.fn) {
                if (false === this._notify(s, args, ef)) {
                    this.stopped = 2;
                }
                if (this.stopped === 2) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Notifies the YUI instance if the event is configured with broadcast = 1,
     * and both the YUI instance and Y.Global if configured with broadcast = 2.
     *
     * @method _broadcast
     * @param args {Array} Arguments sent to fire()
     * @private
     */
    _broadcast: function(args) {
        if (!this.stopped && this.broadcast) {

            var a = args.concat();
            a.unshift(this.type);

            if (this.host !== Y) {
                Y.fire.apply(Y, a);
            }

            if (this.broadcast === 2) {
                Y.Global.fire.apply(Y.Global, a);
            }
        }
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     * @return {Number} The number of listeners unsubscribed.
     * @deprecated use detachAll.
     */
    unsubscribeAll: function() {
        return this.detachAll.apply(this, arguments);
    },

    /**
     * Removes all listeners
     * @method detachAll
     * @return {Number} The number of listeners unsubscribed.
     */
    detachAll: function() {
        return this.detach();
    },

    /**
     * Deletes the subscriber from the internal store of on() and after()
     * subscribers.
     *
     * @method _delete
     * @param s subscriber object.
     * @param subs (optional) on or after subscriber array
     * @param index (optional) The index found.
     * @private
     */
    _delete: function(s, subs, i) {
        var when = s._when;

        if (!subs) {
            subs = (when === AFTER) ? this._afters : this._subscribers;
        }

        if (subs) {
            i = YArray.indexOf(subs, s, 0);

            if (s && subs[i] === s) {
                subs.splice(i, 1);
            }
        }

        if (this._kds) {
            if (when === AFTER) {
                delete this.afters[s.id];
            } else {
                delete this.subscribers[s.id];
            }
        }

        if (this.monitored && this.host) {
            this.host._monitor('detach', this, {
                ce: this,
                sub: s
            });
        }

        if (s) {
            s.deleted = true;
        }
    }
};
/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The wrapped function to execute.
 * @param {Object}   context  The value of the keyword 'this' in the listener.
 * @param {Array} args*       0..n additional arguments to supply the listener.
 *
 * @class Subscriber
 * @constructor
 */
Y.Subscriber = function(fn, context, args, when) {

    /**
     * The callback that will be execute when the event fires
     * This is wrapped by Y.rbind if obj was supplied.
     * @property fn
     * @type Function
     */
    this.fn = fn;

    /**
     * Optional 'this' keyword for the listener
     * @property context
     * @type Object
     */
    this.context = context;

    /**
     * Unique subscriber id
     * @property id
     * @type String
     */
    this.id = Y.guid();

    /**
     * Additional arguments to propagate to the subscriber
     * @property args
     * @type Array
     */
    this.args = args;

    this._when = when;

    /**
     * Custom events for a given fire transaction.
     * @property events
     * @type {EventTarget}
     */
    // this.events = null;

    /**
     * This listener only reacts to the event once
     * @property once
     */
    // this.once = false;

};

Y.Subscriber.prototype = {
    constructor: Y.Subscriber,

    _notify: function(c, args, ce) {
        if (this.deleted && !this.postponed) {
            if (this.postponed) {
                delete this.fn;
                delete this.context;
            } else {
                delete this.postponed;
                return null;
            }
        }
        var a = this.args, ret;
        switch (ce.signature) {
            case 0:
                ret = this.fn.call(c, ce.type, args, c);
                break;
            case 1:
                ret = this.fn.call(c, args[0] || null, c);
                break;
            default:
                if (a || args) {
                    args = args || [];
                    a = (a) ? args.concat(a) : args;
                    ret = this.fn.apply(c, a);
                } else {
                    ret = this.fn.call(c);
                }
        }

        if (this.once) {
            ce._delete(this);
        }

        return ret;
    },

    /**
     * Executes the subscriber.
     * @method notify
     * @param args {Array} Arguments array for the subscriber.
     * @param ce {CustomEvent} The custom event that sent the notification.
     */
    notify: function(args, ce) {
        var c = this.context,
            ret = true;

        if (!c) {
            c = (ce.contextFn) ? ce.contextFn() : ce.context;
        }

        // only catch errors if we will not re-throw them.
        if (Y.config && Y.config.throwFail) {
            ret = this._notify(c, args, ce);
        } else {
            try {
                ret = this._notify(c, args, ce);
            } catch (e) {
                Y.error(this + ' failed: ' + e.message, e);
            }
        }

        return ret;
    },

    /**
     * Returns true if the fn and obj match this objects properties.
     * Used by the unsubscribe method to match the right subscriber.
     *
     * @method contains
     * @param {Function} fn the function to execute.
     * @param {Object} context optional 'this' keyword for the listener.
     * @return {boolean} true if the supplied arguments match this
     *                   subscriber's signature.
     */
    contains: function(fn, context) {
        if (context) {
            return ((this.fn === fn) && this.context === context);
        } else {
            return (this.fn === fn);
        }
    },

    valueOf : function() {
        return this.id;
    }

};
/**
 * Return value from all subscribe operations
 * @class EventHandle
 * @constructor
 * @param {CustomEvent} evt the custom event.
 * @param {Subscriber} sub the subscriber.
 */
Y.EventHandle = function(evt, sub) {

    /**
     * The custom event
     *
     * @property evt
     * @type CustomEvent
     */
    this.evt = evt;

    /**
     * The subscriber object
     *
     * @property sub
     * @type Subscriber
     */
    this.sub = sub;
};

Y.EventHandle.prototype = {
    batch: function(f, c) {
        f.call(c || this, this);
        if (Y.Lang.isArray(this.evt)) {
            Y.Array.each(this.evt, function(h) {
                h.batch.call(c || h, f);
            });
        }
    },

    /**
     * Detaches this subscriber
     * @method detach
     * @return {Number} the number of detached listeners
     */
    detach: function() {
        var evt = this.evt, detached = 0, i;
        if (evt) {
            if (Y.Lang.isArray(evt)) {
                for (i = 0; i < evt.length; i++) {
                    detached += evt[i].detach();
                }
            } else {
                evt._delete(this.sub);
                detached = 1;
            }

        }

        return detached;
    },

    /**
     * Monitor the event state for the subscribed event.  The first parameter
     * is what should be monitored, the rest are the normal parameters when
     * subscribing to an event.
     * @method monitor
     * @param what {string} what to monitor ('attach', 'detach', 'publish').
     * @return {EventHandle} return value from the monitor event subscription.
     */
    monitor: function(what) {
        return this.evt.monitor.apply(this.evt, arguments);
    }
};

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 * @submodule event-custom-base
 */

/**
 * EventTarget provides the implementation for any object to
 * publish, subscribe and fire to custom events, and also
 * alows other EventTargets to target the object with events
 * sourced from the other object.
 * EventTarget is designed to be used with Y.augment to wrap
 * EventCustom in an interface that allows events to be listened to
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 * @class EventTarget
 * @param opts a configuration object
 * @config emitFacade {boolean} if true, all events will emit event
 * facade payloads by default (default false)
 * @config prefix {String} the prefix to apply to non-prefixed event names
 */

var L = Y.Lang,
    PREFIX_DELIMITER = ':',
    CATEGORY_DELIMITER = '|',
    AFTER_PREFIX = '~AFTER~',
    WILD_TYPE_RE = /(.*?)(:)(.*?)/,

    _wildType = Y.cached(function(type) {
        return type.replace(WILD_TYPE_RE, "*$2$3");
    }),

    /**
     * If the instance has a prefix attribute and the
     * event type is not prefixed, the instance prefix is
     * applied to the supplied type.
     * @method _getType
     * @private
     */
    _getType = function(type, pre) {

        if (!pre || !type || type.indexOf(PREFIX_DELIMITER) > -1) {
            return type;
        }

        return pre + PREFIX_DELIMITER + type;
    },

    /**
     * Returns an array with the detach key (if provided),
     * and the prefixed event name from _getType
     * Y.on('detachcategory| menu:click', fn)
     * @method _parseType
     * @private
     */
    _parseType = Y.cached(function(type, pre) {

        var t = type, detachcategory, after, i;

        if (!L.isString(t)) {
            return t;
        }

        i = t.indexOf(AFTER_PREFIX);

        if (i > -1) {
            after = true;
            t = t.substr(AFTER_PREFIX.length);
        }

        i = t.indexOf(CATEGORY_DELIMITER);

        if (i > -1) {
            detachcategory = t.substr(0, (i));
            t = t.substr(i+1);
            if (t === '*') {
                t = null;
            }
        }

        // detach category, full type with instance prefix, is this an after listener, short type
        return [detachcategory, (pre) ? _getType(t, pre) : t, after, t];
    }),

    ET = function(opts) {

        var etState = this._yuievt,
            etConfig;

        if (!etState) {
            etState = this._yuievt = {
                events: {},    // PERF: Not much point instantiating lazily. We're bound to have events
                targets: null, // PERF: Instantiate lazily, if user actually adds target,
                config: {
                    host: this,
                    context: this
                },
                chain: Y.config.chain
            };
        }

        etConfig = etState.config;

        if (opts) {
            mixConfigs(etConfig, opts, true);

            if (opts.chain !== undefined) {
                etState.chain = opts.chain;
            }

            if (opts.prefix) {
                etConfig.prefix = opts.prefix;
            }
        }
    };

ET.prototype = {

    constructor: ET,

    /**
     * Listen to a custom event hosted by this object one time.
     * This is the equivalent to <code>on</code> except the
     * listener is immediatelly detached when it is executed.
     * @method once
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] Override `this` object in callback
     * @param {Any} [arg*] 0..n additional arguments to supply to the subscriber
     * @return {EventHandle} A subscription handle capable of detaching the
     *                       subscription
     */
    once: function() {
        var handle = this.on.apply(this, arguments);
        handle.batch(function(hand) {
            if (hand.sub) {
                hand.sub.once = true;
            }
        });
        return handle;
    },

    /**
     * Listen to a custom event hosted by this object one time.
     * This is the equivalent to <code>after</code> except the
     * listener is immediatelly detached when it is executed.
     * @method onceAfter
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] Override `this` object in callback
     * @param {Any} [arg*] 0..n additional arguments to supply to the subscriber
     * @return {EventHandle} A subscription handle capable of detaching that
     *                       subscription
     */
    onceAfter: function() {
        var handle = this.after.apply(this, arguments);
        handle.batch(function(hand) {
            if (hand.sub) {
                hand.sub.once = true;
            }
        });
        return handle;
    },

    /**
     * Takes the type parameter passed to 'on' and parses out the
     * various pieces that could be included in the type.  If the
     * event type is passed without a prefix, it will be expanded
     * to include the prefix one is supplied or the event target
     * is configured with a default prefix.
     * @method parseType
     * @param {String} type the type
     * @param {String} [pre] The prefix. Defaults to this._yuievt.config.prefix
     * @since 3.3.0
     * @return {Array} an array containing:
     *  * the detach category, if supplied,
     *  * the prefixed event type,
     *  * whether or not this is an after listener,
     *  * the supplied event type
     */
    parseType: function(type, pre) {
        return _parseType(type, pre || this._yuievt.config.prefix);
    },

    /**
     * Subscribe a callback function to a custom event fired by this object or
     * from an object that bubbles its events to this object.
     *
     * Callback functions for events published with `emitFacade = true` will
     * receive an `EventFacade` as the first argument (typically named "e").
     * These callbacks can then call `e.preventDefault()` to disable the
     * behavior published to that event's `defaultFn`.  See the `EventFacade`
     * API for all available properties and methods. Subscribers to
     * non-`emitFacade` events will receive the arguments passed to `fire()`
     * after the event name.
     *
     * To subscribe to multiple events at once, pass an object as the first
     * argument, where the key:value pairs correspond to the eventName:callback,
     * or pass an array of event names as the first argument to subscribe to
     * all listed events with the same callback.
     *
     * Returning `false` from a callback is supported as an alternative to
     * calling `e.preventDefault(); e.stopPropagation();`.  However, it is
     * recommended to use the event methods whenever possible.
     *
     * @method on
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] Override `this` object in callback
     * @param {Any} [arg*] 0..n additional arguments to supply to the subscriber
     * @return {EventHandle} A subscription handle capable of detaching that
     *                       subscription
     */
    on: function(type, fn, context) {

        var yuievt = this._yuievt,
            parts = _parseType(type, yuievt.config.prefix), f, c, args, ret, ce,
            detachcategory, handle, store = Y.Env.evt.handles, after, adapt, shorttype,
            Node = Y.Node, n, domevent, isArr;

        // full name, args, detachcategory, after
        this._monitor('attach', parts[1], {
            args: arguments,
            category: parts[0],
            after: parts[2]
        });

        if (L.isObject(type)) {

            if (L.isFunction(type)) {
                return Y.Do.before.apply(Y.Do, arguments);
            }

            f = fn;
            c = context;
            args = nativeSlice.call(arguments, 0);
            ret = [];

            if (L.isArray(type)) {
                isArr = true;
            }

            after = type._after;
            delete type._after;

            Y.each(type, function(v, k) {

                if (L.isObject(v)) {
                    f = v.fn || ((L.isFunction(v)) ? v : f);
                    c = v.context || c;
                }

                var nv = (after) ? AFTER_PREFIX : '';

                args[0] = nv + ((isArr) ? v : k);
                args[1] = f;
                args[2] = c;

                ret.push(this.on.apply(this, args));

            }, this);

            return (yuievt.chain) ? this : new Y.EventHandle(ret);
        }

        detachcategory = parts[0];
        after = parts[2];
        shorttype = parts[3];

        // extra redirection so we catch adaptor events too.  take a look at this.
        if (Node && Y.instanceOf(this, Node) && (shorttype in Node.DOM_EVENTS)) {
            args = nativeSlice.call(arguments, 0);
            args.splice(2, 0, Node.getDOMNode(this));
            return Y.on.apply(Y, args);
        }

        type = parts[1];

        if (Y.instanceOf(this, YUI)) {

            adapt = Y.Env.evt.plugins[type];
            args  = nativeSlice.call(arguments, 0);
            args[0] = shorttype;

            if (Node) {
                n = args[2];

                if (Y.instanceOf(n, Y.NodeList)) {
                    n = Y.NodeList.getDOMNodes(n);
                } else if (Y.instanceOf(n, Node)) {
                    n = Node.getDOMNode(n);
                }

                domevent = (shorttype in Node.DOM_EVENTS);

                // Captures both DOM events and event plugins.
                if (domevent) {
                    args[2] = n;
                }
            }

            // check for the existance of an event adaptor
            if (adapt) {
                handle = adapt.on.apply(Y, args);
            } else if ((!type) || domevent) {
                handle = Y.Event._attach(args);
            }

        }

        if (!handle) {
            ce = yuievt.events[type] || this.publish(type);
            handle = ce._on(fn, context, (arguments.length > 3) ? nativeSlice.call(arguments, 3) : null, (after) ? 'after' : true);

            // TODO: More robust regex, accounting for category
            if (type.indexOf("*:") !== -1) {
                this._hasSiblings = true;
            }
        }

        if (detachcategory) {
            store[detachcategory] = store[detachcategory] || {};
            store[detachcategory][type] = store[detachcategory][type] || [];
            store[detachcategory][type].push(handle);
        }

        return (yuievt.chain) ? this : handle;

    },

    /**
     * subscribe to an event
     * @method subscribe
     * @deprecated use on
     */
    subscribe: function() {
        return this.on.apply(this, arguments);
    },

    /**
     * Detach one or more listeners the from the specified event
     * @method detach
     * @param type {string|Object}   Either the handle to the subscriber or the
     *                        type of event.  If the type
     *                        is not specified, it will attempt to remove
     *                        the listener from all hosted events.
     * @param fn   {Function} The subscribed function to unsubscribe, if not
     *                          supplied, all subscribers will be removed.
     * @param context  {Object}   The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {EventTarget} the host
     */
    detach: function(type, fn, context) {

        var evts = this._yuievt.events,
            i,
            Node = Y.Node,
            isNode = Node && (Y.instanceOf(this, Node));

        // detachAll disabled on the Y instance.
        if (!type && (this !== Y)) {
            for (i in evts) {
                if (evts.hasOwnProperty(i)) {
                    evts[i].detach(fn, context);
                }
            }
            if (isNode) {
                Y.Event.purgeElement(Node.getDOMNode(this));
            }

            return this;
        }

        var parts = _parseType(type, this._yuievt.config.prefix),
        detachcategory = L.isArray(parts) ? parts[0] : null,
        shorttype = (parts) ? parts[3] : null,
        adapt, store = Y.Env.evt.handles, detachhost, cat, args,
        ce,

        keyDetacher = function(lcat, ltype, host) {
            var handles = lcat[ltype], ce, i;
            if (handles) {
                for (i = handles.length - 1; i >= 0; --i) {
                    ce = handles[i].evt;
                    if (ce.host === host || ce.el === host) {
                        handles[i].detach();
                    }
                }
            }
        };

        if (detachcategory) {

            cat = store[detachcategory];
            type = parts[1];
            detachhost = (isNode) ? Y.Node.getDOMNode(this) : this;

            if (cat) {
                if (type) {
                    keyDetacher(cat, type, detachhost);
                } else {
                    for (i in cat) {
                        if (cat.hasOwnProperty(i)) {
                            keyDetacher(cat, i, detachhost);
                        }
                    }
                }

                return this;
            }

        // If this is an event handle, use it to detach
        } else if (L.isObject(type) && type.detach) {
            type.detach();
            return this;
        // extra redirection so we catch adaptor events too.  take a look at this.
        } else if (isNode && ((!shorttype) || (shorttype in Node.DOM_EVENTS))) {
            args = nativeSlice.call(arguments, 0);
            args[2] = Node.getDOMNode(this);
            Y.detach.apply(Y, args);
            return this;
        }

        adapt = Y.Env.evt.plugins[shorttype];

        // The YUI instance handles DOM events and adaptors
        if (Y.instanceOf(this, YUI)) {
            args = nativeSlice.call(arguments, 0);
            // use the adaptor specific detach code if
            if (adapt && adapt.detach) {
                adapt.detach.apply(Y, args);
                return this;
            // DOM event fork
            } else if (!type || (!adapt && Node && (type in Node.DOM_EVENTS))) {
                args[0] = type;
                Y.Event.detach.apply(Y.Event, args);
                return this;
            }
        }

        // ce = evts[type];
        ce = evts[parts[1]];
        if (ce) {
            ce.detach(fn, context);
        }

        return this;
    },

    /**
     * detach a listener
     * @method unsubscribe
     * @deprecated use detach
     */
    unsubscribe: function() {
        return this.detach.apply(this, arguments);
    },

    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method detachAll
     * @param type {String}   The type, or name of the event
     */
    detachAll: function(type) {
        return this.detach(type);
    },

    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method unsubscribeAll
     * @param type {String}   The type, or name of the event
     * @deprecated use detachAll
     */
    unsubscribeAll: function() {
        return this.detachAll.apply(this, arguments);
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned.
     *
     * @method publish
     *
     * @param type {String} the type, or name of the event
     * @param opts {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *   'broadcast': whether or not the YUI instance and YUI global are notified when the event is fired (false)
     *    </li>
     *    <li>
     *   'bubbles': whether or not this event bubbles (true)
     *              Events can only bubble if emitFacade is true.
     *    </li>
     *    <li>
     *   'context': the default execution context for the listeners (this)
     *    </li>
     *    <li>
     *   'defaultFn': the default function to execute when this event fires if preventDefault was not called
     *    </li>
     *    <li>
     *   'emitFacade': whether or not this event emits a facade (false)
     *    </li>
     *    <li>
     *   'prefix': the prefix for this targets events, e.g., 'menu' in 'menu:click'
     *    </li>
     *    <li>
     *   'fireOnce': if an event is configured to fire once, new subscribers after
     *   the fire will be notified immediately.
     *    </li>
     *    <li>
     *   'async': fireOnce event listeners will fire synchronously if the event has already
     *    fired unless async is true.
     *    </li>
     *    <li>
     *   'preventable': whether or not preventDefault() has an effect (true)
     *    </li>
     *    <li>
     *   'preventedFn': a function that is executed when preventDefault is called
     *    </li>
     *    <li>
     *   'queuable': whether or not this event can be queued during bubbling (false)
     *    </li>
     *    <li>
     *   'silent': if silent is true, debug messages are not provided for this event.
     *    </li>
     *    <li>
     *   'stoppedFn': a function that is executed when stopPropagation is called
     *    </li>
     *
     *    <li>
     *   'monitored': specifies whether or not this event should send notifications about
     *   when the event has been attached, detached, or published.
     *    </li>
     *    <li>
     *   'type': the event type (valid option if not provided as the first parameter to publish)
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    publish: function(type, opts) {

        var ret,
            etState = this._yuievt,
            etConfig = etState.config,
            pre = etConfig.prefix;

        if (typeof type === "string")  {
            if (pre) {
                type = _getType(type, pre);
            }
            ret = this._publish(type, etConfig, opts);
        } else {
            ret = {};

            Y.each(type, function(v, k) {
                if (pre) {
                    k = _getType(k, pre);
                }
                ret[k] = this._publish(k, etConfig, v || opts);
            }, this);

        }

        return ret;
    },

    /**
     * Returns the fully qualified type, given a short type string.
     * That is, returns "foo:bar" when given "bar" if "foo" is the configured prefix.
     *
     * NOTE: This method, unlike _getType, does no checking of the value passed in, and
     * is designed to be used with the low level _publish() method, for critical path
     * implementations which need to fast-track publish for performance reasons.
     *
     * @method _getFullType
     * @private
     * @param {String} type The short type to prefix
     * @return {String} The prefixed type, if a prefix is set, otherwise the type passed in
     */
    _getFullType : function(type) {

        var pre = this._yuievt.config.prefix;

        if (pre) {
            return pre + PREFIX_DELIMITER + type;
        } else {
            return type;
        }
    },

    /**
     * The low level event publish implementation. It expects all the massaging to have been done
     * outside of this method. e.g. the `type` to `fullType` conversion. It's designed to be a fast
     * path publish, which can be used by critical code paths to improve performance.
     *
     * @method _publish
     * @private
     * @param {String} fullType The prefixed type of the event to publish.
     * @param {Object} etOpts The EventTarget specific configuration to mix into the published event.
     * @param {Object} ceOpts The publish specific configuration to mix into the published event.
     * @return {CustomEvent} The published event. If called without `etOpts` or `ceOpts`, this will
     * be the default `CustomEvent` instance, and can be configured independently.
     */
    _publish : function(fullType, etOpts, ceOpts) {

        var ce,
            etState = this._yuievt,
            etConfig = etState.config,
            host = etConfig.host,
            context = etConfig.context,
            events = etState.events;

        ce = events[fullType];

        // PERF: Hate to pull the check out of monitor, but trying to keep critical path tight.
        if ((etConfig.monitored && !ce) || (ce && ce.monitored)) {
            this._monitor('publish', fullType, {
                args: arguments
            });
        }

        if (!ce) {
            // Publish event
            ce = events[fullType] = new Y.CustomEvent(fullType, etOpts);

            if (!etOpts) {
                ce.host = host;
                ce.context = context;
            }
        }

        if (ceOpts) {
            mixConfigs(ce, ceOpts, true);
        }

        return ce;
    },

    /**
     * This is the entry point for the event monitoring system.
     * You can monitor 'attach', 'detach', 'fire', and 'publish'.
     * When configured, these events generate an event.  click ->
     * click_attach, click_detach, click_publish -- these can
     * be subscribed to like other events to monitor the event
     * system.  Inividual published events can have monitoring
     * turned on or off (publish can't be turned off before it
     * it published) by setting the events 'monitor' config.
     *
     * @method _monitor
     * @param what {String} 'attach', 'detach', 'fire', or 'publish'
     * @param eventType {String|CustomEvent} The prefixed name of the event being monitored, or the CustomEvent object.
     * @param o {Object} Information about the event interaction, such as
     *                  fire() args, subscription category, publish config
     * @private
     */
    _monitor: function(what, eventType, o) {
        var monitorevt, ce, type;

        if (eventType) {
            if (typeof eventType === "string") {
                type = eventType;
                ce = this.getEvent(eventType, true);
            } else {
                ce = eventType;
                type = eventType.type;
            }

            if ((this._yuievt.config.monitored && (!ce || ce.monitored)) || (ce && ce.monitored)) {
                monitorevt = type + '_' + what;
                o.monitored = what;
                this.fire.call(this, monitorevt, o);
            }
        }
    },

    /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the context specified when the event was created, and with the
     * following parameters.
     *
     * The first argument is the event type, and any additional arguments are
     * passed to the listeners as parameters.  If the first of these is an
     * object literal, and the event is configured to emit an event facade,
     * that object is mixed into the event facade and the facade is provided
     * in place of the original object.
     *
     * If the custom event object hasn't been created, then the event hasn't
     * been published and it has no subscribers.  For performance sake, we
     * immediate exit in this case.  This means the event won't bubble, so
     * if the intention is that a bubble target be notified, the event must
     * be published on this object first.
     *
     * @method fire
     * @param type {String|Object} The type of the event, or an object that contains
     * a 'type' property.
     * @param arguments {Object*} an arbitrary set of parameters to pass to
     * the handler.  If the first of these is an object literal and the event is
     * configured to emit an event facade, the event facade will replace that
     * parameter after the properties the object literal contains are copied to
     * the event facade.
     * @return {Boolean} True if the whole lifecycle of the event went through,
     * false if at any point the event propagation was halted.
     */
    fire: function(type) {

        var typeIncluded = (typeof type === "string"),
            argCount = arguments.length,
            t = type,
            yuievt = this._yuievt,
            etConfig = yuievt.config,
            pre = etConfig.prefix,
            ret,
            ce,
            ce2,
            args;

        if (typeIncluded && argCount <= 3) {

            // PERF: Try to avoid slice/iteration for the common signatures

            // Most common
            if (argCount === 2) {
                args = [arguments[1]]; // fire("foo", {})
            } else if (argCount === 3) {
                args = [arguments[1], arguments[2]]; // fire("foo", {}, opts)
            } else {
                args = []; // fire("foo")
            }

        } else {
            args = nativeSlice.call(arguments, ((typeIncluded) ? 1 : 0));
        }

        if (!typeIncluded) {
            t = (type && type.type);
        }

        if (pre) {
            t = _getType(t, pre);
        }

        ce = yuievt.events[t];

        if (this._hasSiblings) {
            ce2 = this.getSibling(t, ce);

            if (ce2 && !ce) {
                ce = this.publish(t);
            }
        }

        // PERF: trying to avoid function call, since this is a critical path
        if ((etConfig.monitored && (!ce || ce.monitored)) || (ce && ce.monitored)) {
            this._monitor('fire', (ce || t), {
                args: args
            });
        }

        // this event has not been published or subscribed to
        if (!ce) {
            if (yuievt.hasTargets) {
                return this.bubble({ type: t }, args, this);
            }

            // otherwise there is nothing to be done
            ret = true;
        } else {

            if (ce2) {
                ce.sibling = ce2;
            }

            ret = ce._fire(args);
        }

        return (yuievt.chain) ? this : ret;
    },

    getSibling: function(type, ce) {
        var ce2;

        // delegate to *:type events if there are subscribers
        if (type.indexOf(PREFIX_DELIMITER) > -1) {
            type = _wildType(type);
            ce2 = this.getEvent(type, true);
            if (ce2) {
                ce2.applyConfig(ce);
                ce2.bubbles = false;
                ce2.broadcast = 0;
            }
        }

        return ce2;
    },

    /**
     * Returns the custom event of the provided type has been created, a
     * falsy value otherwise
     * @method getEvent
     * @param type {String} the type, or name of the event
     * @param prefixed {String} if true, the type is prefixed already
     * @return {CustomEvent} the custom event or null
     */
    getEvent: function(type, prefixed) {
        var pre, e;

        if (!prefixed) {
            pre = this._yuievt.config.prefix;
            type = (pre) ? _getType(type, pre) : type;
        }
        e = this._yuievt.events;
        return e[type] || null;
    },

    /**
     * Subscribe to a custom event hosted by this object.  The
     * supplied callback will execute after any listeners add
     * via the subscribe method, and after the default function,
     * if configured for the event, has executed.
     *
     * @method after
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] Override `this` object in callback
     * @param {Any} [arg*] 0..n additional arguments to supply to the subscriber
     * @return {EventHandle} A subscription handle capable of detaching the
     *                       subscription
     */
    after: function(type, fn) {

        var a = nativeSlice.call(arguments, 0);

        switch (L.type(type)) {
            case 'function':
                return Y.Do.after.apply(Y.Do, arguments);
            case 'array':
            //     YArray.each(a[0], function(v) {
            //         v = AFTER_PREFIX + v;
            //     });
            //     break;
            case 'object':
                a[0]._after = true;
                break;
            default:
                a[0] = AFTER_PREFIX + type;
        }

        return this.on.apply(this, a);

    },

    /**
     * Executes the callback before a DOM event, custom event
     * or method.  If the first argument is a function, it
     * is assumed the target is a method.  For DOM and custom
     * events, this is an alias for Y.on.
     *
     * For DOM and custom events:
     * type, callback, context, 0-n arguments
     *
     * For methods:
     * callback, object (method host), methodName, context, 0-n arguments
     *
     * @method before
     * @return detach handle
     */
    before: function() {
        return this.on.apply(this, arguments);
    }

};

Y.EventTarget = ET;

// make Y an event target
Y.mix(Y, ET.prototype);
ET.call(Y, { bubbles: false });

YUI.Env.globalEvents = YUI.Env.globalEvents || new ET();

/**
 * Hosts YUI page level events.  This is where events bubble to
 * when the broadcast config is set to 2.  This property is
 * only available if the custom event module is loaded.
 * @property Global
 * @type EventTarget
 * @for YUI
 */
Y.Global = YUI.Env.globalEvents;

// @TODO implement a global namespace function on Y.Global?

/**
`Y.on()` can do many things:

<ul>
    <li>Subscribe to custom events `publish`ed and `fire`d from Y</li>
    <li>Subscribe to custom events `publish`ed with `broadcast` 1 or 2 and
        `fire`d from any object in the YUI instance sandbox</li>
    <li>Subscribe to DOM events</li>
    <li>Subscribe to the execution of a method on any object, effectively
    treating that method as an event</li>
</ul>

For custom event subscriptions, pass the custom event name as the first argument
and callback as the second. The `this` object in the callback will be `Y` unless
an override is passed as the third argument.

    Y.on('io:complete', function () {
        Y.MyApp.updateStatus('Transaction complete');
    });

To subscribe to DOM events, pass the name of a DOM event as the first argument
and a CSS selector string as the third argument after the callback function.
Alternately, the third argument can be a `Node`, `NodeList`, `HTMLElement`,
array, or simply omitted (the default is the `window` object).

    Y.on('click', function (e) {
        e.preventDefault();

        // proceed with ajax form submission
        var url = this.get('action');
        ...
    }, '#my-form');

The `this` object in DOM event callbacks will be the `Node` targeted by the CSS
selector or other identifier.

`on()` subscribers for DOM events or custom events `publish`ed with a
`defaultFn` can prevent the default behavior with `e.preventDefault()` from the
event object passed as the first parameter to the subscription callback.

To subscribe to the execution of an object method, pass arguments corresponding to the call signature for
<a href="../classes/Do.html#methods_before">`Y.Do.before(...)`</a>.

NOTE: The formal parameter list below is for events, not for function
injection.  See `Y.Do.before` for that signature.

@method on
@param {String} type DOM or custom event name
@param {Function} fn The callback to execute in response to the event
@param {Object} [context] Override `this` object in callback
@param {Any} [arg*] 0..n additional arguments to supply to the subscriber
@return {EventHandle} A subscription handle capable of detaching the
                      subscription
@see Do.before
@for YUI
**/

/**
Listen for an event one time.  Equivalent to `on()`, except that
the listener is immediately detached when executed.

See the <a href="#methods_on">`on()` method</a> for additional subscription
options.

@see on
@method once
@param {String} type DOM or custom event name
@param {Function} fn The callback to execute in response to the event
@param {Object} [context] Override `this` object in callback
@param {Any} [arg*] 0..n additional arguments to supply to the subscriber
@return {EventHandle} A subscription handle capable of detaching the
                      subscription
@for YUI
**/

/**
Listen for an event one time.  Equivalent to `once()`, except, like `after()`,
the subscription callback executes after all `on()` subscribers and the event's
`defaultFn` (if configured) have executed.  Like `after()` if any `on()` phase
subscriber calls `e.preventDefault()`, neither the `defaultFn` nor the `after()`
subscribers will execute.

The listener is immediately detached when executed.

See the <a href="#methods_on">`on()` method</a> for additional subscription
options.

@see once
@method onceAfter
@param {String} type The custom event name
@param {Function} fn The callback to execute in response to the event
@param {Object} [context] Override `this` object in callback
@param {Any} [arg*] 0..n additional arguments to supply to the subscriber
@return {EventHandle} A subscription handle capable of detaching the
                      subscription
@for YUI
**/

/**
Like `on()`, this method creates a subscription to a custom event or to the
execution of a method on an object.

For events, `after()` subscribers are executed after the event's
`defaultFn` unless `e.preventDefault()` was called from an `on()` subscriber.

See the <a href="#methods_on">`on()` method</a> for additional subscription
options.

NOTE: The subscription signature shown is for events, not for function
injection.  See <a href="../classes/Do.html#methods_after">`Y.Do.after`</a>
for that signature.

@see on
@see Do.after
@method after
@param {String} type The custom event name
@param {Function} fn The callback to execute in response to the event
@param {Object} [context] Override `this` object in callback
@param {Any} [args*] 0..n additional arguments to supply to the subscriber
@return {EventHandle} A subscription handle capable of detaching the
                      subscription
@for YUI
**/


}, '3.16.0', {"requires": ["oop"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('event-custom-complex', function (Y, NAME) {


/**
 * Adds event facades, preventable default behavior, and bubbling.
 * events.
 * @module event-custom
 * @submodule event-custom-complex
 */

var FACADE,
    FACADE_KEYS,
    YObject = Y.Object,
    key,
    EMPTY = {},
    CEProto = Y.CustomEvent.prototype,
    ETProto = Y.EventTarget.prototype,

    mixFacadeProps = function(facade, payload) {
        var p;

        for (p in payload) {
            if (!(FACADE_KEYS.hasOwnProperty(p))) {
                facade[p] = payload[p];
            }
        }
    };

/**
 * Wraps and protects a custom event for use when emitFacade is set to true.
 * Requires the event-custom-complex module
 * @class EventFacade
 * @param e {Event} the custom event
 * @param currentTarget {HTMLElement} the element the listener was attached to
 */

Y.EventFacade = function(e, currentTarget) {

    if (!e) {
        e = EMPTY;
    }

    this._event = e;

    /**
     * The arguments passed to fire
     * @property details
     * @type Array
     */
    this.details = e.details;

    /**
     * The event type, this can be overridden by the fire() payload
     * @property type
     * @type string
     */
    this.type = e.type;

    /**
     * The real event type
     * @property _type
     * @type string
     * @private
     */
    this._type = e.type;

    //////////////////////////////////////////////////////

    /**
     * Node reference for the targeted eventtarget
     * @property target
     * @type Node
     */
    this.target = e.target;

    /**
     * Node reference for the element that the listener was attached to.
     * @property currentTarget
     * @type Node
     */
    this.currentTarget = currentTarget;

    /**
     * Node reference to the relatedTarget
     * @property relatedTarget
     * @type Node
     */
    this.relatedTarget = e.relatedTarget;

};

Y.mix(Y.EventFacade.prototype, {

    /**
     * Stops the propagation to the next bubble target
     * @method stopPropagation
     */
    stopPropagation: function() {
        this._event.stopPropagation();
        this.stopped = 1;
    },

    /**
     * Stops the propagation to the next bubble target and
     * prevents any additional listeners from being exectued
     * on the current target.
     * @method stopImmediatePropagation
     */
    stopImmediatePropagation: function() {
        this._event.stopImmediatePropagation();
        this.stopped = 2;
    },

    /**
     * Prevents the event's default behavior
     * @method preventDefault
     */
    preventDefault: function() {
        this._event.preventDefault();
        this.prevented = 1;
    },

    /**
     * Stops the event propagation and prevents the default
     * event behavior.
     * @method halt
     * @param immediate {boolean} if true additional listeners
     * on the current target will not be executed
     */
    halt: function(immediate) {
        this._event.halt(immediate);
        this.prevented = 1;
        this.stopped = (immediate) ? 2 : 1;
    }

});

CEProto.fireComplex = function(args) {

    var es,
        ef,
        q,
        queue,
        ce,
        ret = true,
        events,
        subs,
        ons,
        afters,
        afterQueue,
        postponed,
        prevented,
        preventedFn,
        defaultFn,
        self = this,
        host = self.host || self,
        next,
        oldbubble,
        stack = self.stack,
        yuievt = host._yuievt,
        hasPotentialSubscribers;

    if (stack) {

        // queue this event if the current item in the queue bubbles
        if (self.queuable && self.type !== stack.next.type) {

            if (!stack.queue) {
                stack.queue = [];
            }
            stack.queue.push([self, args]);

            return true;
        }
    }

    hasPotentialSubscribers = self.hasSubs() || yuievt.hasTargets || self.broadcast;

    self.target = self.target || host;
    self.currentTarget = host;

    self.details = args.concat();

    if (hasPotentialSubscribers) {

        es = stack || {

           id: self.id, // id of the first event in the stack
           next: self,
           silent: self.silent,
           stopped: 0,
           prevented: 0,
           bubbling: null,
           type: self.type,
           // defaultFnQueue: new Y.Queue(),
           defaultTargetOnly: self.defaultTargetOnly

        };

        subs = self.getSubs();
        ons = subs[0];
        afters = subs[1];

        self.stopped = (self.type !== es.type) ? 0 : es.stopped;
        self.prevented = (self.type !== es.type) ? 0 : es.prevented;

        if (self.stoppedFn) {
            // PERF TODO: Can we replace with callback, like preventedFn. Look into history
            events = new Y.EventTarget({
                fireOnce: true,
                context: host
            });
            self.events = events;
            events.on('stopped', self.stoppedFn);
        }


        self._facade = null; // kill facade to eliminate stale properties

        ef = self._createFacade(args);

        if (ons) {
            self._procSubs(ons, args, ef);
        }

        // bubble if this is hosted in an event target and propagation has not been stopped
        if (self.bubbles && host.bubble && !self.stopped) {
            oldbubble = es.bubbling;

            es.bubbling = self.type;

            if (es.type !== self.type) {
                es.stopped = 0;
                es.prevented = 0;
            }

            ret = host.bubble(self, args, null, es);

            self.stopped = Math.max(self.stopped, es.stopped);
            self.prevented = Math.max(self.prevented, es.prevented);

            es.bubbling = oldbubble;
        }

        prevented = self.prevented;

        if (prevented) {
            preventedFn = self.preventedFn;
            if (preventedFn) {
                preventedFn.apply(host, args);
            }
        } else {
            defaultFn = self.defaultFn;

            if (defaultFn && ((!self.defaultTargetOnly && !es.defaultTargetOnly) || host === ef.target)) {
                defaultFn.apply(host, args);
            }
        }

        // broadcast listeners are fired as discreet events on the
        // YUI instance and potentially the YUI global.
        if (self.broadcast) {
            self._broadcast(args);
        }

        if (afters && !self.prevented && self.stopped < 2) {

            // Queue the after
            afterQueue = es.afterQueue;

            if (es.id === self.id || self.type !== yuievt.bubbling) {

                self._procSubs(afters, args, ef);

                if (afterQueue) {
                    while ((next = afterQueue.last())) {
                        next();
                    }
                }
            } else {
                postponed = afters;

                if (es.execDefaultCnt) {
                    postponed = Y.merge(postponed);

                    Y.each(postponed, function(s) {
                        s.postponed = true;
                    });
                }

                if (!afterQueue) {
                    es.afterQueue = new Y.Queue();
                }

                es.afterQueue.add(function() {
                    self._procSubs(postponed, args, ef);
                });
            }

        }

        self.target = null;

        if (es.id === self.id) {

            queue = es.queue;

            if (queue) {
                while (queue.length) {
                    q = queue.pop();
                    ce = q[0];
                    // set up stack to allow the next item to be processed
                    es.next = ce;
                    ce._fire(q[1]);
                }
            }

            self.stack = null;
        }

        ret = !(self.stopped);

        if (self.type !== yuievt.bubbling) {
            es.stopped = 0;
            es.prevented = 0;
            self.stopped = 0;
            self.prevented = 0;
        }

    } else {
        defaultFn = self.defaultFn;

        if(defaultFn) {
            ef = self._createFacade(args);

            if ((!self.defaultTargetOnly) || (host === ef.target)) {
                defaultFn.apply(host, args);
            }
        }
    }

    // Kill the cached facade to free up memory.
    // Otherwise we have the facade from the last fire, sitting around forever.
    self._facade = null;

    return ret;
};

/**
 * @method _hasPotentialSubscribers
 * @for CustomEvent
 * @private
 * @return {boolean} Whether the event has potential subscribers or not
 */
CEProto._hasPotentialSubscribers = function() {
    return this.hasSubs() || this.host._yuievt.hasTargets || this.broadcast;
};

/**
 * Internal utility method to create a new facade instance and
 * insert it into the fire argument list, accounting for any payload
 * merging which needs to happen.
 *
 * This used to be called `_getFacade`, but the name seemed inappropriate
 * when it was used without a need for the return value.
 *
 * @method _createFacade
 * @private
 * @param fireArgs {Array} The arguments passed to "fire", which need to be
 * shifted (and potentially merged) when the facade is added.
 * @return {EventFacade} The event facade created.
 */

// TODO: Remove (private) _getFacade alias, once synthetic.js is updated.
CEProto._createFacade = CEProto._getFacade = function(fireArgs) {

    var userArgs = this.details,
        firstArg = userArgs && userArgs[0],
        firstArgIsObj = (firstArg && (typeof firstArg === "object")),
        ef = this._facade;

    if (!ef) {
        ef = new Y.EventFacade(this, this.currentTarget);
    }

    if (firstArgIsObj) {
        // protect the event facade properties
        mixFacadeProps(ef, firstArg);

        // Allow the event type to be faked http://yuilibrary.com/projects/yui3/ticket/2528376
        if (firstArg.type) {
            ef.type = firstArg.type;
        }

        if (fireArgs) {
            fireArgs[0] = ef;
        }
    } else {
        if (fireArgs) {
            fireArgs.unshift(ef);
        }
    }

    // update the details field with the arguments
    ef.details = this.details;

    // use the original target when the event bubbled to this target
    ef.target = this.originalTarget || this.target;

    ef.currentTarget = this.currentTarget;
    ef.stopped = 0;
    ef.prevented = 0;

    this._facade = ef;

    return this._facade;
};

/**
 * Utility method to manipulate the args array passed in, to add the event facade,
 * if it's not already the first arg.
 *
 * @method _addFacadeToArgs
 * @private
 * @param {Array} The arguments to manipulate
 */
CEProto._addFacadeToArgs = function(args) {
    var e = args[0];

    // Trying not to use instanceof, just to avoid potential cross Y edge case issues.
    if (!(e && e.halt && e.stopImmediatePropagation && e.stopPropagation && e._event)) {
        this._createFacade(args);
    }
};

/**
 * Stop propagation to bubble targets
 * @for CustomEvent
 * @method stopPropagation
 */
CEProto.stopPropagation = function() {
    this.stopped = 1;
    if (this.stack) {
        this.stack.stopped = 1;
    }
    if (this.events) {
        this.events.fire('stopped', this);
    }
};

/**
 * Stops propagation to bubble targets, and prevents any remaining
 * subscribers on the current target from executing.
 * @method stopImmediatePropagation
 */
CEProto.stopImmediatePropagation = function() {
    this.stopped = 2;
    if (this.stack) {
        this.stack.stopped = 2;
    }
    if (this.events) {
        this.events.fire('stopped', this);
    }
};

/**
 * Prevents the execution of this event's defaultFn
 * @method preventDefault
 */
CEProto.preventDefault = function() {
    if (this.preventable) {
        this.prevented = 1;
        if (this.stack) {
            this.stack.prevented = 1;
        }
    }
};

/**
 * Stops the event propagation and prevents the default
 * event behavior.
 * @method halt
 * @param immediate {boolean} if true additional listeners
 * on the current target will not be executed
 */
CEProto.halt = function(immediate) {
    if (immediate) {
        this.stopImmediatePropagation();
    } else {
        this.stopPropagation();
    }
    this.preventDefault();
};

/**
 * Registers another EventTarget as a bubble target.  Bubble order
 * is determined by the order registered.  Multiple targets can
 * be specified.
 *
 * Events can only bubble if emitFacade is true.
 *
 * Included in the event-custom-complex submodule.
 *
 * @method addTarget
 * @chainable
 * @param o {EventTarget} the target to add
 * @for EventTarget
 */
ETProto.addTarget = function(o) {
    var etState = this._yuievt;

    if (!etState.targets) {
        etState.targets = {};
    }

    etState.targets[Y.stamp(o)] = o;
    etState.hasTargets = true;

    return this;
};

/**
 * Returns an array of bubble targets for this object.
 * @method getTargets
 * @return EventTarget[]
 */
ETProto.getTargets = function() {
    var targets = this._yuievt.targets;
    return targets ? YObject.values(targets) : [];
};

/**
 * Removes a bubble target
 * @method removeTarget
 * @chainable
 * @param o {EventTarget} the target to remove
 * @for EventTarget
 */
ETProto.removeTarget = function(o) {
    var targets = this._yuievt.targets;

    if (targets) {
        delete targets[Y.stamp(o, true)];

        if (YObject.size(targets) === 0) {
            this._yuievt.hasTargets = false;
        }
    }

    return this;
};

/**
 * Propagate an event.  Requires the event-custom-complex module.
 * @method bubble
 * @param evt {CustomEvent} the custom event to propagate
 * @return {boolean} the aggregated return value from Event.Custom.fire
 * @for EventTarget
 */
ETProto.bubble = function(evt, args, target, es) {

    var targs = this._yuievt.targets,
        ret = true,
        t,
        ce,
        i,
        bc,
        ce2,
        type = evt && evt.type,
        originalTarget = target || (evt && evt.target) || this,
        oldbubble;

    if (!evt || ((!evt.stopped) && targs)) {

        for (i in targs) {
            if (targs.hasOwnProperty(i)) {

                t = targs[i];

                ce = t._yuievt.events[type];

                if (t._hasSiblings) {
                    ce2 = t.getSibling(type, ce);
                }

                if (ce2 && !ce) {
                    ce = t.publish(type);
                }

                oldbubble = t._yuievt.bubbling;
                t._yuievt.bubbling = type;

                // if this event was not published on the bubble target,
                // continue propagating the event.
                if (!ce) {
                    if (t._yuievt.hasTargets) {
                        t.bubble(evt, args, originalTarget, es);
                    }
                } else {

                    if (ce2) {
                        ce.sibling = ce2;
                    }

                    // set the original target to that the target payload on the facade is correct.
                    ce.target = originalTarget;
                    ce.originalTarget = originalTarget;
                    ce.currentTarget = t;
                    bc = ce.broadcast;
                    ce.broadcast = false;

                    // default publish may not have emitFacade true -- that
                    // shouldn't be what the implementer meant to do
                    ce.emitFacade = true;

                    ce.stack = es;

                    // TODO: See what's getting in the way of changing this to use
                    // the more performant ce._fire(args || evt.details || []).

                    // Something in Widget Parent/Child tests is not happy if we
                    // change it - maybe evt.details related?
                    ret = ret && ce.fire.apply(ce, args || evt.details || []);

                    ce.broadcast = bc;
                    ce.originalTarget = null;

                    // stopPropagation() was called
                    if (ce.stopped) {
                        break;
                    }
                }

                t._yuievt.bubbling = oldbubble;
            }
        }
    }

    return ret;
};

/**
 * @method _hasPotentialSubscribers
 * @for EventTarget
 * @private
 * @param {String} fullType The fully prefixed type name
 * @return {boolean} Whether the event has potential subscribers or not
 */
ETProto._hasPotentialSubscribers = function(fullType) {

    var etState = this._yuievt,
        e = etState.events[fullType];

    if (e) {
        return e.hasSubs() || etState.hasTargets  || e.broadcast;
    } else {
        return false;
    }
};

FACADE = new Y.EventFacade();
FACADE_KEYS = {};

// Flatten whitelist
for (key in FACADE) {
    FACADE_KEYS[key] = true;
}


}, '3.16.0', {"requires": ["event-custom-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('attribute-observable', function (Y, NAME) {

    /*For log lines*/
    /*jshint maxlen:200*/


    /**
     * The attribute module provides an augmentable Attribute implementation, which
     * adds configurable attributes and attribute change events to the class being
     * augmented. It also provides a State class, which is used internally by Attribute,
     * but can also be used independently to provide a name/property/value data structure to
     * store state.
     *
     * @module attribute
     */

    /**
     * The `attribute-observable` submodule provides augmentable attribute change event support
     * for AttributeCore based implementations.
     *
     * @module attribute
     * @submodule attribute-observable
     */
    var EventTarget = Y.EventTarget,

        CHANGE = "Change",
        BROADCAST = "broadcast";

    /**
     * Provides an augmentable implementation of attribute change events for
     * AttributeCore.
     *
     * @class AttributeObservable
     * @extensionfor AttributeCore
     * @uses EventTarget
     */
    function AttributeObservable() {
        // Perf tweak - avoid creating event literals if not required.
        this._ATTR_E_FACADE = {};

        EventTarget.call(this, {emitFacade:true});
    }

    AttributeObservable._ATTR_CFG = [BROADCAST];

    AttributeObservable.prototype = {

        /**
         * Sets the value of an attribute.
         *
         * @method set
         * @chainable
         *
         * @param {String} name The name of the attribute. If the
         * current value of the attribute is an Object, dot notation can be used
         * to set the value of a property within the object (e.g. <code>set("x.y.z", 5)</code>).
         *
         * @param {Any} value The value to set the attribute to.
         *
         * @param {Object} opts (Optional) Optional event data to be mixed into
         * the event facade passed to subscribers of the attribute's change event. This
         * can be used as a flexible way to identify the source of a call to set, allowing
         * the developer to distinguish between set called internally by the host, vs.
         * set called externally by the application developer.
         *
         * @return {Object} A reference to the host object.
         */
        set : function(name, val, opts) {
            return this._setAttr(name, val, opts);
        },

        /**
         * Allows setting of readOnly/writeOnce attributes. See <a href="#method_set">set</a> for argument details.
         *
         * @method _set
         * @protected
         * @chainable
         *
         * @param {String} name The name of the attribute.
         * @param {Any} val The value to set the attribute to.
         * @param {Object} opts (Optional) Optional event data to be mixed into
         * the event facade passed to subscribers of the attribute's change event.
         * @return {Object} A reference to the host object.
         */
        _set : function(name, val, opts) {
            return this._setAttr(name, val, opts, true);
        },

        /**
         * Sets multiple attribute values.
         *
         * @method setAttrs
         * @param {Object} attrs  An object with attributes name/value pairs.
         * @param {Object} opts  Properties to mix into the event payload. These are shared and mixed into each set
         * @return {Object} A reference to the host object.
         * @chainable
         */
        setAttrs : function(attrs, opts) {
            return this._setAttrs(attrs, opts);
        },

        /**
         * Implementation behind the public setAttrs method, to set multiple attribute values.
         *
         * @method _setAttrs
         * @protected
         * @param {Object} attrs  An object with attributes name/value pairs.
         * @param {Object} opts  Properties to mix into the event payload. These are shared and mixed into each set
         * @return {Object} A reference to the host object.
         * @chainable
         */
        _setAttrs : function(attrs, opts) {
            var attr;
            for (attr in attrs) {
                if ( attrs.hasOwnProperty(attr) ) {
                    this.set(attr, attrs[attr], opts);
                }
            }
            return this;
        },

        /**
         * Utility method to help setup the event payload and fire the attribute change event.
         *
         * @method _fireAttrChange
         * @private
         * @param {String} attrName The name of the attribute
         * @param {String} subAttrName The full path of the property being changed,
         * if this is a sub-attribute value being change. Otherwise null.
         * @param {Any} currVal The current value of the attribute
         * @param {Any} newVal The new value of the attribute
         * @param {Object} opts Any additional event data to mix into the attribute change event's event facade.
         * @param {Object} [cfg] The attribute config stored in State, if already available.
         */
        _fireAttrChange : function(attrName, subAttrName, currVal, newVal, opts, cfg) {
            var host = this,
                eventName = this._getFullType(attrName + CHANGE),
                state = host._state,
                facade,
                broadcast,
                e;

            if (!cfg) {
                cfg = state.data[attrName] || {};
            }

            if (!cfg.published) {

                // PERF: Using lower level _publish() for
                // critical path performance
                e = host._publish(eventName);

                e.emitFacade = true;
                e.defaultTargetOnly = true;
                e.defaultFn = host._defAttrChangeFn;

                broadcast = cfg.broadcast;
                if (broadcast !== undefined) {
                    e.broadcast = broadcast;
                }

                cfg.published = true;
            }

            if (opts) {
                facade = Y.merge(opts);
                facade._attrOpts = opts;
            } else {
                facade = host._ATTR_E_FACADE;
            }

            // Not using the single object signature for fire({type:..., newVal:...}), since
            // we don't want to override type. Changed to the fire(type, {newVal:...}) signature.

            facade.attrName = attrName;
            facade.subAttrName = subAttrName;
            facade.prevVal = currVal;
            facade.newVal = newVal;

            if (host._hasPotentialSubscribers(eventName)) {
                host.fire(eventName, facade);
            } else {
                this._setAttrVal(attrName, subAttrName, currVal, newVal, opts, cfg);
            }
        },

        /**
         * Default function for attribute change events.
         *
         * @private
         * @method _defAttrChangeFn
         * @param {EventFacade} e The event object for attribute change events.
         * @param {boolean} eventFastPath Whether or not we're using this as a fast path in the case of no listeners or not
         */
        _defAttrChangeFn : function(e, eventFastPath) {

            var opts = e._attrOpts;
            if (opts) {
                delete e._attrOpts;
            }

            if (!this._setAttrVal(e.attrName, e.subAttrName, e.prevVal, e.newVal, opts)) {


                if (!eventFastPath) {
                    // Prevent "after" listeners from being invoked since nothing changed.
                    e.stopImmediatePropagation();
                }

            } else {
                if (!eventFastPath) {
                    e.newVal = this.get(e.attrName);
                }
            }
        }
    };

    // Basic prototype augment - no lazy constructor invocation.
    Y.mix(AttributeObservable, EventTarget, false, null, 1);

    Y.AttributeObservable = AttributeObservable;

    /**
    The `AttributeEvents` class extension was deprecated in YUI 3.8.0 and is now
    an alias for the `AttributeObservable` class extension. Use that class
    extnesion instead. This alias will be removed in a future version of YUI.

    @class AttributeEvents
    @uses EventTarget
    @deprecated Use `AttributeObservable` instead.
    @see AttributeObservable
    **/
    Y.AttributeEvents = AttributeObservable;


}, '3.16.0', {"requires": ["event-custom"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('attribute-extras', function (Y, NAME) {

    /**
     * The attribute module provides an augmentable Attribute implementation, which
     * adds configurable attributes and attribute change events to the class being
     * augmented. It also provides a State class, which is used internally by Attribute,
     * but can also be used independently to provide a name/property/value data structure to
     * store state.
     *
     * @module attribute
     */

    /**
     * The attribute-extras submodule provides less commonly used attribute methods, and can
     * be augmented/mixed into an implemention which used attribute-core.
     *
     * @module attribute
     * @submodule attribute-extras
     */
    var BROADCAST = "broadcast",
        PUBLISHED = "published",
        INIT_VALUE = "initValue",

        MODIFIABLE = {
            readOnly:1,
            writeOnce:1,
            getter:1,
            broadcast:1
        };

    /**
     * A augmentable implementation for AttributeCore, providing less frequently used
     * methods for Attribute management such as modifyAttrs(), removeAttr and reset()
     *
     * @class AttributeExtras
     * @extensionfor AttributeCore
     */
    function AttributeExtras() {}

    AttributeExtras.prototype = {

        /**
         * Updates the configuration of an attribute which has already been added.
         * <p>
         * The properties which can be modified through this interface are limited
         * to the following subset of attributes, which can be safely modified
         * after a value has already been set on the attribute: readOnly, writeOnce,
         * broadcast and getter.
         * </p>
         * @method modifyAttr
         * @param {String} name The name of the attribute whose configuration is to be updated.
         * @param {Object} config An object with configuration property/value pairs, specifying the configuration properties to modify.
         */
        modifyAttr: function(name, config) {
            var host = this, // help compression
                prop, state;

            if (host.attrAdded(name)) {

                if (host._isLazyAttr(name)) {
                    host._addLazyAttr(name);
                }

                state = host._state;
                for (prop in config) {
                    if (MODIFIABLE[prop] && config.hasOwnProperty(prop)) {
                        state.add(name, prop, config[prop]);

                        // If we reconfigured broadcast, need to republish
                        if (prop === BROADCAST) {
                            state.remove(name, PUBLISHED);
                        }
                    }
                }
            }
            /*jshint maxlen:200*/
            /*jshint maxlen:150 */
        },

        /**
         * Removes an attribute from the host object
         *
         * @method removeAttr
         * @param {String} name The name of the attribute to be removed.
         */
        removeAttr: function(name) {
            this._state.removeAll(name);
        },

        /**
         * Resets the attribute (or all attributes) to its initial value, as long as
         * the attribute is not readOnly, or writeOnce.
         *
         * @method reset
         * @param {String} name Optional. The name of the attribute to reset.  If omitted, all attributes are reset.
         * @return {Object} A reference to the host object.
         * @chainable
         */
        reset : function(name) {
            var host = this;  // help compression

            if (name) {
                if (host._isLazyAttr(name)) {
                    host._addLazyAttr(name);
                }
                host.set(name, host._state.get(name, INIT_VALUE));
            } else {
                Y.Object.each(host._state.data, function(v, n) {
                    host.reset(n);
                });
            }
            return host;
        },

        /**
         * Returns an object with the configuration properties (and value)
         * for the given attribute. If attrName is not provided, returns the
         * configuration properties for all attributes.
         *
         * @method _getAttrCfg
         * @protected
         * @param {String} name Optional. The attribute name. If not provided, the method will return the configuration for all attributes.
         * @return {Object} The configuration properties for the given attribute, or all attributes.
         */
        _getAttrCfg : function(name) {
            var o,
                state = this._state;

            if (name) {
                o = state.getAll(name) || {};
            } else {
                o = {};
                Y.each(state.data, function(v, n) {
                    o[n] = state.getAll(n);
                });
            }

            return o;
        }
    };

    Y.AttributeExtras = AttributeExtras;


}, '3.16.0', {"requires": ["oop"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('attribute-base', function (Y, NAME) {

    /**
     * The attribute module provides an augmentable Attribute implementation, which
     * adds configurable attributes and attribute change events to the class being
     * augmented. It also provides a State class, which is used internally by Attribute,
     * but can also be used independently to provide a name/property/value data structure to
     * store state.
     *
     * @module attribute
     */

    /**
     * The attribute-base submodule provides core attribute handling support, with everything
     * aside from complex attribute handling in the provider's constructor.
     *
     * @module attribute
     * @submodule attribute-base
     */

    /**
     * <p>
     * Attribute provides configurable attribute support along with attribute change events. It is designed to be
     * augmented on to a host class, and provides the host with the ability to configure attributes to store and retrieve state,
     * along with attribute change events.
     * </p>
     * <p>For example, attributes added to the host can be configured:</p>
     * <ul>
     *     <li>As read only.</li>
     *     <li>As write once.</li>
     *     <li>With a setter function, which can be used to manipulate
     *     values passed to Attribute's <a href="#method_set">set</a> method, before they are stored.</li>
     *     <li>With a getter function, which can be used to manipulate stored values,
     *     before they are returned by Attribute's <a href="#method_get">get</a> method.</li>
     *     <li>With a validator function, to validate values before they are stored.</li>
     * </ul>
     *
     * <p>See the <a href="#method_addAttr">addAttr</a> method, for the complete set of configuration
     * options available for attributes.</p>
     *
     * <p><strong>NOTE:</strong> Most implementations will be better off extending the <a href="Base.html">Base</a> class,
     * instead of augmenting Attribute directly. Base augments Attribute and will handle the initial configuration
     * of attributes for derived classes, accounting for values passed into the constructor.</p>
     *
     * @class Attribute
     * @param attrs {Object} The attributes to add during construction (passed through to <a href="#method_addAttrs">addAttrs</a>).
     *        These can also be defined on the constructor being augmented with Attribute by defining the ATTRS property on the constructor.
     * @param values {Object} The initial attribute values to apply (passed through to <a href="#method_addAttrs">addAttrs</a>).
     *        These are not merged/cloned. The caller is responsible for isolating user provided values if required.
     * @param lazy {boolean} Whether or not to add attributes lazily (passed through to <a href="#method_addAttrs">addAttrs</a>).
     * @uses AttributeCore
     * @uses AttributeObservable
     * @uses EventTarget
     * @uses AttributeExtras
     */
    function Attribute() {
        Y.AttributeCore.apply(this, arguments);
        Y.AttributeObservable.apply(this, arguments);
        Y.AttributeExtras.apply(this, arguments);
    }

    Y.mix(Attribute, Y.AttributeCore, false, null, 1);
    Y.mix(Attribute, Y.AttributeExtras, false, null, 1);

    // Needs to be `true`, to overwrite methods from AttributeCore
    Y.mix(Attribute, Y.AttributeObservable, true, null, 1);

    /**
     * <p>The value to return from an attribute setter in order to prevent the set from going through.</p>
     *
     * <p>You can return this value from your setter if you wish to combine validator and setter
     * functionality into a single setter function, which either returns the massaged value to be stored or
     * AttributeCore.INVALID_VALUE to prevent invalid values from being stored.</p>
     *
     * @property INVALID_VALUE
     * @type Object
     * @static
     * @final
     */
    Attribute.INVALID_VALUE = Y.AttributeCore.INVALID_VALUE;

    /**
     * The list of properties which can be configured for
     * each attribute (e.g. setter, getter, writeOnce etc.).
     *
     * This property is used internally as a whitelist for faster
     * Y.mix operations.
     *
     * @property _ATTR_CFG
     * @type Array
     * @static
     * @protected
     */
    Attribute._ATTR_CFG = Y.AttributeCore._ATTR_CFG.concat(Y.AttributeObservable._ATTR_CFG);

    /**
     * Utility method to protect an attribute configuration hash, by merging the
     * entire object and the individual attr config objects.
     *
     * @method protectAttrs
     * @static
     * @param {Object} attrs A hash of attribute to configuration object pairs.
     * @return {Object} A protected version of the `attrs` argument.
     */
    Attribute.protectAttrs = Y.AttributeCore.protectAttrs;

    Y.Attribute = Attribute;


}, '3.16.0', {"requires": ["attribute-core", "attribute-observable", "attribute-extras"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('base-core', function (Y, NAME) {

    /**
     * The base module provides the Base class, which objects requiring attribute and custom event support can extend.
     * The module also provides two ways to reuse code - It augments Base with the Plugin.Host interface which provides
     * plugin support and also provides the BaseCore.build method which provides a way to build custom classes using extensions.
     *
     * @module base
     */

    /**
     * <p>The base-core module provides the BaseCore class, the lightest version of Base,
     * which provides Base's basic lifecycle management and ATTRS construction support,
     * but doesn't fire init/destroy or attribute change events.</p>
     *
     * <p>It mixes in AttributeCore, which is the lightest version of Attribute</p>
     *
     * @module base
     * @submodule base-core
     */
    var O = Y.Object,
        L = Y.Lang,
        DOT = ".",
        INITIALIZED = "initialized",
        DESTROYED = "destroyed",
        INITIALIZER = "initializer",
        VALUE = "value",
        OBJECT_CONSTRUCTOR = Object.prototype.constructor,
        DEEP = "deep",
        SHALLOW = "shallow",
        DESTRUCTOR = "destructor",

        AttributeCore = Y.AttributeCore,

        _wlmix = function(r, s, wlhash) {
            var p;
            for (p in s) {
                if(wlhash[p]) {
                    r[p] = s[p];
                }
            }
            return r;
        };

    /**
     * The BaseCore class, is the lightest version of Base, and provides Base's
     * basic lifecycle management and ATTRS construction support, but doesn't
     * fire init/destroy or attribute change events.
     *
     * BaseCore also handles the chaining of initializer and destructor methods across
     * the hierarchy as part of object construction and destruction. Additionally, attributes
     * configured through the static <a href="#property_BaseCore.ATTRS">ATTRS</a>
     * property for each class in the hierarchy will be initialized by BaseCore.
     *
     * Classes which require attribute support, but don't intend to use/expose attribute
     * change events can extend BaseCore instead of Base for optimal kweight and
     * runtime performance.
     *
     * **3.11.0 BACK COMPAT NOTE FOR COMPONENT DEVELOPERS**
     *
     * Prior to version 3.11.0, ATTRS would get added a class at a time. That is:
     *
     * <pre>
     *    for each (class in the hierarchy) {
     *       Call the class Extension constructors.
     *
     *       Add the class ATTRS.
     *
     *       Call the class initializer
     *       Call the class Extension initializers.
     *    }
     * </pre>
     *
     * As of 3.11.0, ATTRS from all classes in the hierarchy are added in one `addAttrs` call
     * before **any** initializers are called. That is, the flow becomes:
     *
     * <pre>
     *    for each (class in the hierarchy) {
     *       Call the class Extension constructors.
     *    }
     *
     *    Add ATTRS for all classes
     *
     *    for each (class in the hierarchy) {
     *       Call the class initializer.
     *       Call the class Extension initializers.
     *    }
     * </pre>
     *
     * Adding all ATTRS at once fixes subtle edge-case issues with subclass ATTRS overriding
     * superclass `setter`, `getter` or `valueFn` definitions and being unable to get/set attributes
     * defined by the subclass. It also leaves us with a cleaner order of operation flow moving
     * forward.
     *
     * However, it may require component developers to upgrade their components, for the following
     * scenarios:
     *
     * 1. It impacts components which may have `setter`, `getter` or `valueFn` code which
     * expects a superclass' initializer to have run.
     *
     * This is expected to be rare, but to support it, Base now supports a `_preAddAttrs()`, method
     * hook (same signature as `addAttrs`). Components can implement this method on their prototype
     * for edge cases which do require finer control over the order in which attributes are added
     * (see widget-htmlparser for example).
     *
     * 2. Extension developers may need to move code from Extension constructors to `initializer`s
     *
     * Older extensions, which were written before `initializer` support was added, had a lot of
     * initialization code in their constructors. For example, code which acccessed superclass
     * attributes. With the new flow this code would not be able to see attributes. The recommendation
     * is to move this initialization code to an `initializer` on the Extension, which was the
     * recommendation for anything created after `initializer` support for Extensions was added.
     *
     * @class BaseCore
     * @constructor
     * @uses AttributeCore
     * @param {Object} cfg Object with configuration property name/value pairs.
     * The object can be used to provide initial values for the objects published
     * attributes.
     */
    function BaseCore(cfg) {
        if (!this._BaseInvoked) {
            this._BaseInvoked = true;

            this._initBase(cfg);
        }
    }

    /**
     * The list of properties which can be configured for each attribute
     * (e.g. setter, getter, writeOnce, readOnly etc.)
     *
     * @property _ATTR_CFG
     * @type Array
     * @static
     * @private
     */
    BaseCore._ATTR_CFG = AttributeCore._ATTR_CFG.concat("cloneDefaultValue");

    /**
     * The array of non-attribute configuration properties supported by this class.
     *
     * For example `BaseCore` defines a "plugins" configuration property which
     * should not be set up as an attribute. This property is primarily required so
     * that when <a href="#property__allowAdHocAttrs">`_allowAdHocAttrs`</a> is enabled by a class,
     * non-attribute configuration properties don't get added as ad-hoc attributes.
     *
     * @property _NON_ATTRS_CFG
     * @type Array
     * @static
     * @private
     */
    BaseCore._NON_ATTRS_CFG = ["plugins"];

    /**
     * This property controls whether or not instances of this class should
     * allow users to add ad-hoc attributes through the constructor configuration
     * hash.
     *
     * AdHoc attributes are attributes which are not defined by the class, and are
     * not handled by the MyClass._NON_ATTRS_CFG
     *
     * @property _allowAdHocAttrs
     * @type boolean
     * @default undefined (false)
     * @protected
     */

    /**
     * The string to be used to identify instances of this class.
     *
     * Classes extending BaseCore, should define their own
     * static NAME property, which should be camelCase by
     * convention (e.g. MyClass.NAME = "myClass";).
     *
     * @property NAME
     * @type String
     * @static
     */
    BaseCore.NAME = "baseCore";

    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration. In addition to the configuration properties listed by
     * AttributeCore's <a href="AttributeCore.html#method_addAttr">addAttr</a> method,
     * the attribute can also be configured with a "cloneDefaultValue" property, which
     * defines how the statically defined value field should be protected
     * ("shallow", "deep" and false are supported values).
     *
     * By default if the value is an object literal or an array it will be "shallow"
     * cloned, to protect the default value.
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    BaseCore.ATTRS = {
        /**
         * Flag indicating whether or not this object
         * has been through the init lifecycle phase.
         *
         * @attribute initialized
         * @readonly
         * @default false
         * @type boolean
         */
        initialized: {
            readOnly:true,
            value:false
        },

        /**
         * Flag indicating whether or not this object
         * has been through the destroy lifecycle phase.
         *
         * @attribute destroyed
         * @readonly
         * @default false
         * @type boolean
         */
        destroyed: {
            readOnly:true,
            value:false
        }
    };

    /**
    Provides a way to safely modify a `Y.BaseCore` subclass' static `ATTRS`
    after the class has been defined or created.

    BaseCore-based classes cache information about the class hierarchy in order
    to efficiently create instances. This cache includes includes the aggregated
    `ATTRS` configs. If the static `ATTRS` configs need to be modified after the
    class has been defined or create, then use this method which will make sure
    to clear any cached data before making any modifications.

    @method modifyAttrs
    @param {Function} [ctor] The constructor function whose `ATTRS` should be
        modified. If a `ctor` function is not specified, then `this` is assumed
        to be the constructor which hosts the `ATTRS`.
    @param {Object} configs The collection of `ATTRS` configs to mix with the
        existing attribute configurations.
    @static
    @since 3.10.0
    **/
    BaseCore.modifyAttrs = function (ctor, configs) {
        // When called without a constructor, assume `this` is the constructor.
        if (typeof ctor !== 'function') {
            configs = ctor;
            ctor    = this;
        }

        var attrs, attr, name;

        // Eagerly create the `ATTRS` object if it doesn't already exist.
        attrs = ctor.ATTRS || (ctor.ATTRS = {});

        if (configs) {
            // Clear cache because it has ATTRS aggregation data which is about
            // to be modified.
            ctor._CACHED_CLASS_DATA = null;

            for (name in configs) {
                if (configs.hasOwnProperty(name)) {
                    attr = attrs[name] || (attrs[name] = {});
                    Y.mix(attr, configs[name], true);
                }
            }
        }
    };

    BaseCore.prototype = {

        /**
         * Internal construction logic for BaseCore.
         *
         * @method _initBase
         * @param {Object} config The constructor configuration object
         * @private
         */
        _initBase : function(config) {

            Y.stamp(this);

            this._initAttribute(config);

            // If Plugin.Host has been augmented [ through base-pluginhost ], setup it's
            // initial state, but don't initialize Plugins yet. That's done after initialization.
            var PluginHost = Y.Plugin && Y.Plugin.Host;
            if (this._initPlugins && PluginHost) {
                PluginHost.call(this);
            }

            if (this._lazyAddAttrs !== false) { this._lazyAddAttrs = true; }

            /**
             * The string used to identify the class of this object.
             *
             * @deprecated Use this.constructor.NAME
             * @property name
             * @type String
             */
            this.name = this.constructor.NAME;

            this.init.apply(this, arguments);
        },

        /**
         * Initializes AttributeCore
         *
         * @method _initAttribute
         * @private
         */
        _initAttribute: function() {
            AttributeCore.call(this);
        },

        /**
         * Init lifecycle method, invoked during construction. Sets up attributes
         * and invokes initializers for the class hierarchy.
         *
         * @method init
         * @chainable
         * @param {Object} cfg Object with configuration property name/value pairs
         * @return {BaseCore} A reference to this object
         */
        init: function(cfg) {

            this._baseInit(cfg);

            return this;
        },

        /**
         * Internal initialization implementation for BaseCore
         *
         * @method _baseInit
         * @private
         */
        _baseInit: function(cfg) {
            this._initHierarchy(cfg);

            if (this._initPlugins) {
                // Need to initPlugins manually, to handle constructor parsing, static Plug parsing
                this._initPlugins(cfg);
            }
            this._set(INITIALIZED, true);
        },

        /**
         * Destroy lifecycle method. Invokes destructors for the class hierarchy.
         *
         * @method destroy
         * @return {BaseCore} A reference to this object
         * @chainable
         */
        destroy: function() {
            this._baseDestroy();
            return this;
        },

        /**
         * Internal destroy implementation for BaseCore
         *
         * @method _baseDestroy
         * @private
         */
        _baseDestroy : function() {
            if (this._destroyPlugins) {
                this._destroyPlugins();
            }
            this._destroyHierarchy();
            this._set(DESTROYED, true);
        },

        /**
         * Returns the class hierarchy for this object, with BaseCore being the last class in the array.
         *
         * @method _getClasses
         * @protected
         * @return {Function[]} An array of classes (constructor functions), making up the class hierarchy for this object.
         * This value is cached the first time the method, or _getAttrCfgs, is invoked. Subsequent invocations return the
         * cached value.
         */
        _getClasses : function() {
            if (!this._classes) {
                this._initHierarchyData();
            }
            return this._classes;
        },

        /**
         * Returns an aggregated set of attribute configurations, by traversing
         * the class hierarchy.
         *
         * @method _getAttrCfgs
         * @protected
         * @return {Object} The hash of attribute configurations, aggregated across classes in the hierarchy
         * This value is cached the first time the method, or _getClasses, is invoked. Subsequent invocations return
         * the cached value.
         */
        _getAttrCfgs : function() {
            if (!this._attrs) {
                this._initHierarchyData();
            }
            return this._attrs;
        },

        /**
         * A helper method used to isolate the attrs config for this instance to pass to `addAttrs`,
         * from the static cached ATTRS for the class.
         *
         * @method _getInstanceAttrCfgs
         * @private
         *
         * @param {Object} allCfgs The set of all attribute configurations for this instance.
         * Attributes will be removed from this set, if they belong to the filtered class, so
         * that by the time all classes are processed, allCfgs will be empty.
         *
         * @return {Object} The set of attributes to be added for this instance, suitable
         * for passing through to `addAttrs`.
         */
        _getInstanceAttrCfgs : function(allCfgs) {

            var cfgs = {},
                cfg,
                val,
                subAttr,
                subAttrs,
                subAttrPath,
                attr,
                attrCfg,
                allSubAttrs = allCfgs._subAttrs,
                attrCfgProperties = this._attrCfgHash();

            for (attr in allCfgs) {

                if (allCfgs.hasOwnProperty(attr) && attr !== "_subAttrs") {

                    attrCfg = allCfgs[attr];

                    // Need to isolate from allCfgs, because we're going to set values etc.
                    cfg = cfgs[attr] = _wlmix({}, attrCfg, attrCfgProperties);

                    val = cfg.value;

                    if (val && (typeof val === "object")) {
                        this._cloneDefaultValue(attr, cfg);
                    }

                    if (allSubAttrs && allSubAttrs.hasOwnProperty(attr)) {
                        subAttrs = allCfgs._subAttrs[attr];

                        for (subAttrPath in subAttrs) {
                            subAttr = subAttrs[subAttrPath];

                            if (subAttr.path) {
                                O.setValue(cfg.value, subAttr.path, subAttr.value);
                            }
                        }
                    }
                }
            }

            return cfgs;
        },

        /**
         * @method _filterAdHocAttrs
         * @private
         *
         * @param {Object} allAttrs The set of all attribute configurations for this instance.
         * Attributes will be removed from this set, if they belong to the filtered class, so
         * that by the time all classes are processed, allCfgs will be empty.
         * @param {Object} userVals The config object passed in by the user, from which adhoc attrs are to be filtered.
         * @return {Object} The set of adhoc attributes passed in, in the form
         * of an object with attribute name/configuration pairs.
         */
        _filterAdHocAttrs : function(allAttrs, userVals) {
            var adHocs,
                nonAttrs = this._nonAttrs,
                attr;

            if (userVals) {
                adHocs = {};
                for (attr in userVals) {
                    if (!allAttrs[attr] && !nonAttrs[attr] && userVals.hasOwnProperty(attr)) {
                        adHocs[attr] = {
                            value:userVals[attr]
                        };
                    }
                }
            }

            return adHocs;
        },

        /**
         * A helper method used by _getClasses and _getAttrCfgs, which determines both
         * the array of classes and aggregate set of attribute configurations
         * across the class hierarchy for the instance.
         *
         * @method _initHierarchyData
         * @private
         */
        _initHierarchyData : function() {

            var ctor = this.constructor,
                cachedClassData = ctor._CACHED_CLASS_DATA,
                c,
                i,
                l,
                attrCfg,
                attrCfgHash,
                needsAttrCfgHash = !ctor._ATTR_CFG_HASH,
                nonAttrsCfg,
                nonAttrs = {},
                classes = [],
                attrs = [];

            // Start with `this` instance's constructor.
            c = ctor;

            if (!cachedClassData) {

                while (c) {
                    // Add to classes
                    classes[classes.length] = c;

                    // Add to attributes
                    if (c.ATTRS) {
                        attrs[attrs.length] = c.ATTRS;
                    }

                    // Aggregate ATTR cfg whitelist.
                    if (needsAttrCfgHash) {
                        attrCfg     = c._ATTR_CFG;
                        attrCfgHash = attrCfgHash || {};

                        if (attrCfg) {
                            for (i = 0, l = attrCfg.length; i < l; i += 1) {
                                attrCfgHash[attrCfg[i]] = true;
                            }
                        }
                    }

                    // Commenting out the if. We always aggregate, since we don't
                    // know if we'll be needing this on the instance or not.
                    // if (this._allowAdHocAttrs) {
                        nonAttrsCfg = c._NON_ATTRS_CFG;
                        if (nonAttrsCfg) {
                            for (i = 0, l = nonAttrsCfg.length; i < l; i++) {
                                nonAttrs[nonAttrsCfg[i]] = true;
                            }
                        }
                    //}

                    c = c.superclass ? c.superclass.constructor : null;
                }

                // Cache computed `_ATTR_CFG_HASH` on the constructor.
                if (needsAttrCfgHash) {
                    ctor._ATTR_CFG_HASH = attrCfgHash;
                }

                cachedClassData = ctor._CACHED_CLASS_DATA = {
                    classes : classes,
                    nonAttrs : nonAttrs,
                    attrs : this._aggregateAttrs(attrs)
                };

            }

            this._classes = cachedClassData.classes;
            this._attrs = cachedClassData.attrs;
            this._nonAttrs = cachedClassData.nonAttrs;
        },

        /**
         * Utility method to define the attribute hash used to filter/whitelist property mixes for
         * this class for iteration performance reasons.
         *
         * @method _attrCfgHash
         * @private
         */
        _attrCfgHash: function() {
            return this.constructor._ATTR_CFG_HASH;
        },

        /**
         * This method assumes that the value has already been checked to be an object.
         * Since it's on a critical path, we don't want to re-do the check.
         *
         * @method _cloneDefaultValue
         * @param {Object} cfg
         * @private
         */
        _cloneDefaultValue : function(attr, cfg) {

            var val = cfg.value,
                clone = cfg.cloneDefaultValue;

            if (clone === DEEP || clone === true) {
                cfg.value = Y.clone(val);
            } else if (clone === SHALLOW) {
                cfg.value = Y.merge(val);
            } else if ((clone === undefined && (OBJECT_CONSTRUCTOR === val.constructor || L.isArray(val)))) {
                cfg.value = Y.clone(val);
            }
            // else if (clone === false), don't clone the static default value.
            // It's intended to be used by reference.
        },

        /**
         * A helper method, used by _initHierarchyData to aggregate
         * attribute configuration across the instances class hierarchy.
         *
         * The method will protect the attribute configuration value to protect the statically defined
         * default value in ATTRS if required (if the value is an object literal, array or the
         * attribute configuration has cloneDefaultValue set to shallow or deep).
         *
         * @method _aggregateAttrs
         * @private
         * @param {Array} allAttrs An array of ATTRS definitions across classes in the hierarchy
         * (subclass first, Base last)
         * @return {Object} The aggregate set of ATTRS definitions for the instance
         */
        _aggregateAttrs : function(allAttrs) {

            var attr,
                attrs,
                subAttrsHash,
                cfg,
                path,
                i,
                cfgPropsHash = this._attrCfgHash(),
                aggAttr,
                aggAttrs = {};

            if (allAttrs) {
                for (i = allAttrs.length-1; i >= 0; --i) {

                    attrs = allAttrs[i];

                    for (attr in attrs) {
                        if (attrs.hasOwnProperty(attr)) {

                            // PERF TODO: Do we need to merge here, since we're merging later in getInstanceAttrCfgs
                            // Should we move this down to only merge if we hit the path or valueFn ifs below?
                            cfg = _wlmix({}, attrs[attr], cfgPropsHash);

                            path = null;
                            if (attr.indexOf(DOT) !== -1) {
                                path = attr.split(DOT);
                                attr = path.shift();
                            }

                            aggAttr = aggAttrs[attr];

                            if (path && aggAttr && aggAttr.value) {

                                subAttrsHash = aggAttrs._subAttrs;

                                if (!subAttrsHash) {
                                    subAttrsHash = aggAttrs._subAttrs = {};
                                }

                                if (!subAttrsHash[attr]) {
                                    subAttrsHash[attr] = {};
                                }

                                subAttrsHash[attr][path.join(DOT)] = {
                                    value: cfg.value,
                                    path : path
                                };

                            } else if (!path) {

                                if (!aggAttr) {
                                    aggAttrs[attr] = cfg;
                                } else {
                                    if (aggAttr.valueFn && VALUE in cfg) {
                                        aggAttr.valueFn = null;
                                    }

                                    // Mix into existing config.
                                    _wlmix(aggAttr, cfg, cfgPropsHash);
                                }
                            }
                        }
                    }
                }
            }

            return aggAttrs;
        },

        /**
         * Initializes the class hierarchy for the instance, which includes
         * initializing attributes for each class defined in the class's
         * static <a href="#property_BaseCore.ATTRS">ATTRS</a> property and
         * invoking the initializer method on the prototype of each class in the hierarchy.
         *
         * @method _initHierarchy
         * @param {Object} userVals Object with configuration property name/value pairs
         * @private
         */
        _initHierarchy : function(userVals) {

            var lazy = this._lazyAddAttrs,
                constr,
                constrProto,
                i,
                l,
                ci,
                ei,
                el,
                ext,
                extProto,
                exts,
                instanceAttrs,
                initializers = [],
                classes = this._getClasses(),
                attrCfgs = this._getAttrCfgs(),
                cl = classes.length - 1;

            // Constructors
            for (ci = cl; ci >= 0; ci--) {

                constr = classes[ci];
                constrProto = constr.prototype;
                exts = constr._yuibuild && constr._yuibuild.exts;

                // Using INITIALIZER in hasOwnProperty check, for performance reasons (helps IE6 avoid GC thresholds when
                // referencing string literals). Not using it in apply, again, for performance "." is faster.

                if (constrProto.hasOwnProperty(INITIALIZER)) {
                    // Store initializer while we're here and looping
                    initializers[initializers.length] = constrProto.initializer;
                }

                if (exts) {
                    for (ei = 0, el = exts.length; ei < el; ei++) {

                        ext = exts[ei];

                        // Ext Constructor
                        ext.apply(this, arguments);

                        extProto = ext.prototype;
                        if (extProto.hasOwnProperty(INITIALIZER)) {
                            // Store initializer while we're here and looping
                            initializers[initializers.length] = extProto.initializer;
                        }
                    }
                }
            }

            // ATTRS
            instanceAttrs = this._getInstanceAttrCfgs(attrCfgs);

            if (this._preAddAttrs) {
                this._preAddAttrs(instanceAttrs, userVals, lazy);
            }

            if (this._allowAdHocAttrs) {
                this.addAttrs(this._filterAdHocAttrs(attrCfgs, userVals), userVals, lazy);
            }

            this.addAttrs(instanceAttrs, userVals, lazy);

            // Initializers
            for (i = 0, l = initializers.length; i < l; i++) {
                initializers[i].apply(this, arguments);
            }
        },

        /**
         * Destroys the class hierarchy for this instance by invoking
         * the destructor method on the prototype of each class in the hierarchy.
         *
         * @method _destroyHierarchy
         * @private
         */
        _destroyHierarchy : function() {
            var constr,
                constrProto,
                ci, cl, ei, el, exts, extProto,
                classes = this._getClasses();

            for (ci = 0, cl = classes.length; ci < cl; ci++) {
                constr = classes[ci];
                constrProto = constr.prototype;
                exts = constr._yuibuild && constr._yuibuild.exts;

                if (exts) {
                    for (ei = 0, el = exts.length; ei < el; ei++) {
                        extProto = exts[ei].prototype;
                        if (extProto.hasOwnProperty(DESTRUCTOR)) {
                            extProto.destructor.apply(this, arguments);
                        }
                    }
                }

                if (constrProto.hasOwnProperty(DESTRUCTOR)) {
                    constrProto.destructor.apply(this, arguments);
                }
            }
        },

        /**
         * Default toString implementation. Provides the constructor NAME
         * and the instance guid, if set.
         *
         * @method toString
         * @return {String} String representation for this object
         */
        toString: function() {
            return this.name + "[" + Y.stamp(this, true) + "]";
        }
    };

    // Straightup augment, no wrapper functions
    Y.mix(BaseCore, AttributeCore, false, null, 1);

    // Fix constructor
    BaseCore.prototype.constructor = BaseCore;

    Y.BaseCore = BaseCore;


}, '3.16.0', {"requires": ["attribute-core"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('base-observable', function (Y, NAME) {

    /**
    The `base-observable` submodule adds observability to Base's lifecycle and
    attributes, and also make it an `EventTarget`.

    @module base
    @submodule base-observable
    **/
    var L = Y.Lang,

        DESTROY = "destroy",
        INIT = "init",

        BUBBLETARGETS = "bubbleTargets",
        _BUBBLETARGETS = "_bubbleTargets",

        AttributeObservable = Y.AttributeObservable,
        BaseCore            = Y.BaseCore;

    /**
    Provides an augmentable implementation of lifecycle and attribute events for
    `BaseCore`.

    @class BaseObservable
    @extensionfor BaseCore
    @uses AttributeObservable
    @uses EventTarget
    @since 3.8.0
    **/
    function BaseObservable() {}

    BaseObservable._ATTR_CFG      = AttributeObservable._ATTR_CFG.concat();
    BaseObservable._NON_ATTRS_CFG = ["on", "after", "bubbleTargets"];

    BaseObservable.prototype = {

        /**
         * Initializes Attribute
         *
         * @method _initAttribute
         * @private
         */
        _initAttribute: function() {
            BaseCore.prototype._initAttribute.apply(this, arguments);
            AttributeObservable.call(this);

            this._eventPrefix = this.constructor.EVENT_PREFIX || this.constructor.NAME;
            this._yuievt.config.prefix = this._eventPrefix;
        },

        /**
         * Init lifecycle method, invoked during construction.
         * Fires the init event prior to setting up attributes and
         * invoking initializers for the class hierarchy.
         *
         * @method init
         * @chainable
         * @param {Object} config Object with configuration property name/value pairs
         * @return {Base} A reference to this object
         */
        init: function(config) {

            /**
             * <p>
             * Lifecycle event for the init phase, fired prior to initialization.
             * Invoking the preventDefault() method on the event object provided
             * to subscribers will prevent initialization from occuring.
             * </p>
             * <p>
             * Subscribers to the "after" momemt of this event, will be notified
             * after initialization of the object is complete (and therefore
             * cannot prevent initialization).
             * </p>
             *
             * @event init
             * @preventable _defInitFn
             * @param {EventFacade} e Event object, with a cfg property which
             * refers to the configuration object passed to the constructor.
             */

            // PERF: Using lower level _publish() for
            // critical path performance

            var type = this._getFullType(INIT),
                e = this._publish(type);

            e.emitFacade = true;
            e.fireOnce = true;
            e.defaultTargetOnly = true;
            e.defaultFn = this._defInitFn;

            this._preInitEventCfg(config);

            if (e._hasPotentialSubscribers()) {
                this.fire(type, {cfg: config});
            } else {

                this._baseInit(config);

                // HACK. Major hack actually. But really fast for no-listeners.
                // Since it's fireOnce, subscribers may come along later, so since we're
                // bypassing the event stack the first time, we need to tell the published
                // event that it's been "fired". Could extract it into a CE method?
                e.fired = true;
                e.firedWith = [{cfg:config}];
            }

            return this;
        },

        /**
         * Handles the special on, after and target properties which allow the user to
         * easily configure on and after listeners as well as bubble targets during
         * construction, prior to init.
         *
         * @private
         * @method _preInitEventCfg
         * @param {Object} config The user configuration object
         */
        _preInitEventCfg : function(config) {
            if (config) {
                if (config.on) {
                    this.on(config.on);
                }
                if (config.after) {
                    this.after(config.after);
                }
            }

            var i, l, target,
                userTargets = (config && BUBBLETARGETS in config);

            if (userTargets || _BUBBLETARGETS in this) {
                target = userTargets ? (config && config.bubbleTargets) : this._bubbleTargets;

                if (L.isArray(target)) {
                    for (i = 0, l = target.length; i < l; i++) {
                        this.addTarget(target[i]);
                    }
                } else if (target) {
                    this.addTarget(target);
                }
            }
        },

        /**
         * <p>
         * Destroy lifecycle method. Fires the destroy
         * event, prior to invoking destructors for the
         * class hierarchy.
         * </p>
         * <p>
         * Subscribers to the destroy
         * event can invoke preventDefault on the event object, to prevent destruction
         * from proceeding.
         * </p>
         * @method destroy
         * @return {Base} A reference to this object
         * @chainable
         */
        destroy: function() {

            /**
             * <p>
             * Lifecycle event for the destroy phase,
             * fired prior to destruction. Invoking the preventDefault
             * method on the event object provided to subscribers will
             * prevent destruction from proceeding.
             * </p>
             * <p>
             * Subscribers to the "after" moment of this event, will be notified
             * after destruction is complete (and as a result cannot prevent
             * destruction).
             * </p>
             * @event destroy
             * @preventable _defDestroyFn
             * @param {EventFacade} e Event object
             */
            this.publish(DESTROY, {
                fireOnce:true,
                defaultTargetOnly:true,
                defaultFn: this._defDestroyFn
            });
            this.fire(DESTROY);

            this.detachAll();
            return this;
        },

        /**
         * Default init event handler
         *
         * @method _defInitFn
         * @param {EventFacade} e Event object, with a cfg property which
         * refers to the configuration object passed to the constructor.
         * @protected
         */
        _defInitFn : function(e) {
            this._baseInit(e.cfg);
        },

        /**
         * Default destroy event handler
         *
         * @method _defDestroyFn
         * @param {EventFacade} e Event object
         * @protected
         */
        _defDestroyFn : function(e) {
            this._baseDestroy(e.cfg);
        }
    };

    Y.mix(BaseObservable, AttributeObservable, false, null, 1);

    Y.BaseObservable = BaseObservable;


}, '3.16.0', {"requires": ["attribute-observable", "base-core"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('base-base', function (Y, NAME) {

    /**
     * The base module provides the Base class, which objects requiring attribute and custom event support can extend.
     * The module also provides two ways to reuse code - It augments Base with the Plugin.Host interface which provides
     * plugin support and also provides the BaseCore.build method which provides a way to build custom classes using extensions.
     *
     * @module base
     */

    /**
     * The base-base submodule provides the Base class without the Plugin support, provided by Plugin.Host,
     * and without the extension support provided by BaseCore.build.
     *
     * @module base
     * @submodule base-base
     */

    var AttributeCore   = Y.AttributeCore,
        AttributeExtras = Y.AttributeExtras,
        BaseCore        = Y.BaseCore,
        BaseObservable  = Y.BaseObservable;

    /**
     * <p>
     * A base class which objects requiring attributes and custom event support can
     * extend. Base also handles the chaining of initializer and destructor methods across
     * the hierarchy as part of object construction and destruction. Additionally, attributes configured
     * through the static <a href="#property_ATTRS">ATTRS</a> property for each class
     * in the hierarchy will be initialized by Base.
     * </p>
     *
     * <p>
     * **NOTE:** Prior to version 3.11.0, ATTRS would get added a class at a time. That is,
     * Base would loop through each class in the hierarchy, and add the class' ATTRS, and
     * then call it's initializer, and move on to the subclass' ATTRS and initializer. As of
     * 3.11.0, ATTRS from all classes in the hierarchy are added in one `addAttrs` call before
     * any initializers are called. This fixes subtle edge-case issues with subclass ATTRS overriding
     * superclass `setter`, `getter` or `valueFn` definitions and being unable to get/set attributes
     * defined by the subclass. This order of operation change may impact `setter`, `getter` or `valueFn`
     * code which expects a superclass' initializer to have run. This is expected to be rare, but to support
     * it, Base supports a `_preAddAttrs()`, method hook (same signature as `addAttrs`). Components can
     * implement this method on their prototype for edge cases which do require finer control over
     * the order in which attributes are added (see widget-htmlparser).
     * </p>
     *
     * <p>
     * The static <a href="#property_NAME">NAME</a> property of each class extending
     * from Base will be used as the identifier for the class, and is used by Base to prefix
     * all events fired by instances of that class.
     * </p>
     *
     * @class Base
     * @constructor
     * @uses BaseCore
     * @uses BaseObservable
     * @uses AttributeCore
     * @uses AttributeObservable
     * @uses AttributeExtras
     * @uses EventTarget
     *
     * @param {Object} config Object with configuration property name/value pairs. The object can be
     * used to provide default values for the objects published attributes.
     *
     * <p>
     * The config object can also contain the following non-attribute properties, providing a convenient
     * way to configure events listeners and plugins for the instance, as part of the constructor call:
     * </p>
     *
     * <dl>
     *   <dt>on</dt>
     *   <dd>An event name to listener function map, to register event listeners for the "on" moment of the event.
     *       A constructor convenience property for the <a href="Base.html#method_on">on</a> method.</dd>
     *   <dt>after</dt>
     *   <dd>An event name to listener function map, to register event listeners for the "after" moment of the event.
     *       A constructor convenience property for the <a href="Base.html#method_after">after</a> method.</dd>
     *   <dt>bubbleTargets</dt>
     *   <dd>An object, or array of objects, to register as bubble targets for bubbled events fired by this instance.
     *       A constructor convenience property for the <a href="EventTarget.html#method_addTarget">addTarget</a> method.</dd>
     *   <dt>plugins</dt>
     *   <dd>A plugin, or array of plugins to be plugged into the instance (see PluginHost's plug method for signature details).
     *       A constructor convenience property for the <a href="Plugin.Host.html#method_plug">plug</a> method.</dd>
     * </dl>
     */
    function Base() {
        BaseCore.apply(this, arguments);
        BaseObservable.apply(this, arguments);
        AttributeExtras.apply(this, arguments);
    }

    /**
     * The list of properties which can be configured for
     * each attribute (e.g. setter, getter, writeOnce, readOnly etc.)
     *
     * @property _ATTR_CFG
     * @type Array
     * @static
     * @private
     */
    Base._ATTR_CFG = BaseCore._ATTR_CFG.concat(BaseObservable._ATTR_CFG);

    /**
     * The array of non-attribute configuration properties supported by this class.
     *
     * `Base` supports "on", "after", "plugins" and "bubbleTargets" properties,
     * which are not set up as attributes.
     *
     * This property is primarily required so that when
     * <a href="#property__allowAdHocAttrs">`_allowAdHocAttrs`</a> is enabled by
     * a class, non-attribute configurations don't get added as ad-hoc attributes.
     *
     * @property _NON_ATTRS_CFG
     * @type Array
     * @static
     * @private
     */
    Base._NON_ATTRS_CFG = BaseCore._NON_ATTRS_CFG.concat(BaseObservable._NON_ATTRS_CFG);

    /**
     * <p>
     * The string to be used to identify instances of
     * this class, for example in prefixing events.
     * </p>
     * <p>
     * Classes extending Base, should define their own
     * static NAME property, which should be camelCase by
     * convention (e.g. MyClass.NAME = "myClass";).
     * </p>
     * @property NAME
     * @type String
     * @static
     */
    Base.NAME = 'base';

    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration. In addition to the configuration properties listed by
     * Attribute's <a href="Attribute.html#method_addAttr">addAttr</a> method, the attribute
     * can also be configured with a "cloneDefaultValue" property, which defines how the statically
     * defined value field should be protected ("shallow", "deep" and false are supported values).
     *
     * By default if the value is an object literal or an array it will be "shallow" cloned, to
     * protect the default value.
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    Base.ATTRS = AttributeCore.protectAttrs(BaseCore.ATTRS);

    /**
    Provides a way to safely modify a `Y.Base` subclass' static `ATTRS` after
    the class has been defined or created.

    Base-based classes cache information about the class hierarchy in order to
    efficiently create instances. This cache includes includes the aggregated
    `ATTRS` configs. If the static `ATTRS` configs need to be modified after the
    class has been defined or create, then use this method which will make sure
    to clear any cached data before making any modifications.

    @method modifyAttrs
    @param {Function} [ctor] The constructor function whose `ATTRS` should be
        modified. If a `ctor` function is not specified, then `this` is assumed
        to be the constructor which hosts the `ATTRS`.
    @param {Object} configs The collection of `ATTRS` configs to mix with the
        existing attribute configurations.
    @static
    @since 3.10.0
    **/
    Base.modifyAttrs = BaseCore.modifyAttrs;

    Y.mix(Base, BaseCore, false, null, 1);
    Y.mix(Base, AttributeExtras, false, null, 1);

    // Needs to be `true`, to overwrite methods from `BaseCore`.
    Y.mix(Base, BaseObservable, true, null, 1);

    // Fix constructor
    Base.prototype.constructor = Base;

    Y.Base = Base;


}, '3.16.0', {"requires": ["attribute-base", "base-core", "base-observable"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dom-core', function (Y, NAME) {

var NODE_TYPE = 'nodeType',
    OWNER_DOCUMENT = 'ownerDocument',
    DOCUMENT_ELEMENT = 'documentElement',
    DEFAULT_VIEW = 'defaultView',
    PARENT_WINDOW = 'parentWindow',
    TAG_NAME = 'tagName',
    PARENT_NODE = 'parentNode',
    PREVIOUS_SIBLING = 'previousSibling',
    NEXT_SIBLING = 'nextSibling',
    CONTAINS = 'contains',
    COMPARE_DOCUMENT_POSITION = 'compareDocumentPosition',
    EMPTY_ARRAY = [],

    // IE < 8 throws on node.contains(textNode)
    supportsContainsTextNode = (function() {
        var node = Y.config.doc.createElement('div'),
            textNode = node.appendChild(Y.config.doc.createTextNode('')),
            result = false;

        try {
            result = node.contains(textNode);
        } catch(e) {}

        return result;
    })(),

/**
 * The DOM utility provides a cross-browser abtraction layer
 * normalizing DOM tasks, and adds extra helper functionality
 * for other common tasks.
 * @module dom
 * @main dom
 * @submodule dom-base
 * @for DOM
 *
 */

/**
 * Provides DOM helper methods.
 * @class DOM
 *
 */

Y_DOM = {
    /**
     * Returns the HTMLElement with the given ID (Wrapper for document.getElementById).
     * @method byId
     * @param {String} id the id attribute
     * @param {Object} doc optional The document to search. Defaults to current document
     * @return {HTMLElement | null} The HTMLElement with the id, or null if none found.
     */
    byId: function(id, doc) {
        // handle dupe IDs and IE name collision
        return Y_DOM.allById(id, doc)[0] || null;
    },

    getId: function(node) {
        var id;
        // HTMLElement returned from FORM when INPUT name === "id"
        // IE < 8: HTMLCollection returned when INPUT id === "id"
        // via both getAttribute and form.id
        if (node.id && !node.id.tagName && !node.id.item) {
            id = node.id;
        } else if (node.attributes && node.attributes.id) {
            id = node.attributes.id.value;
        }

        return id;
    },

    setId: function(node, id) {
        if (node.setAttribute) {
            node.setAttribute('id', id);
        } else {
            node.id = id;
        }
    },

    /*
     * Finds the ancestor of the element.
     * @method ancestor
     * @param {HTMLElement} element The html element.
     * @param {Function} fn optional An optional boolean test to apply.
     * The optional function is passed the current DOM node being tested as its only argument.
     * If no function is given, the parentNode is returned.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * @return {HTMLElement | null} The matching DOM node or null if none found.
     */
    ancestor: function(element, fn, testSelf, stopFn) {
        var ret = null;
        if (testSelf) {
            ret = (!fn || fn(element)) ? element : null;

        }
        return ret || Y_DOM.elementByAxis(element, PARENT_NODE, fn, null, stopFn);
    },

    /*
     * Finds the ancestors of the element.
     * @method ancestors
     * @param {HTMLElement} element The html element.
     * @param {Function} fn optional An optional boolean test to apply.
     * The optional function is passed the current DOM node being tested as its only argument.
     * If no function is given, all ancestors are returned.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * @return {Array} An array containing all matching DOM nodes.
     */
    ancestors: function(element, fn, testSelf, stopFn) {
        var ancestor = element,
            ret = [];

        while ((ancestor = Y_DOM.ancestor(ancestor, fn, testSelf, stopFn))) {
            testSelf = false;
            if (ancestor) {
                ret.unshift(ancestor);

                if (stopFn && stopFn(ancestor)) {
                    return ret;
                }
            }
        }

        return ret;
    },

    /**
     * Searches the element by the given axis for the first matching element.
     * @method elementByAxis
     * @param {HTMLElement} element The html element.
     * @param {String} axis The axis to search (parentNode, nextSibling, previousSibling).
     * @param {Function} [fn] An optional boolean test to apply.
     * @param {Boolean} [all] Whether text nodes as well as element nodes should be returned, or
     * just element nodes will be returned(default)
     * The optional function is passed the current HTMLElement being tested as its only argument.
     * If no function is given, the first element is returned.
     * @return {HTMLElement | null} The matching element or null if none found.
     */
    elementByAxis: function(element, axis, fn, all, stopAt) {
        while (element && (element = element[axis])) { // NOTE: assignment
                if ( (all || element[TAG_NAME]) && (!fn || fn(element)) ) {
                    return element;
                }

                if (stopAt && stopAt(element)) {
                    return null;
                }
        }
        return null;
    },

    /**
     * Determines whether or not one HTMLElement is or contains another HTMLElement.
     * @method contains
     * @param {HTMLElement} element The containing html element.
     * @param {HTMLElement} needle The html element that may be contained.
     * @return {Boolean} Whether or not the element is or contains the needle.
     */
    contains: function(element, needle) {
        var ret = false;

        if ( !needle || !element || !needle[NODE_TYPE] || !element[NODE_TYPE]) {
            ret = false;
        } else if (element[CONTAINS] &&
                // IE < 8 throws on node.contains(textNode) so fall back to brute.
                // Falling back for other nodeTypes as well.
                (needle[NODE_TYPE] === 1 || supportsContainsTextNode)) {
                ret = element[CONTAINS](needle);
        } else if (element[COMPARE_DOCUMENT_POSITION]) {
            // Match contains behavior (node.contains(node) === true).
            // Needed for Firefox < 4.
            if (element === needle || !!(element[COMPARE_DOCUMENT_POSITION](needle) & 16)) {
                ret = true;
            }
        } else {
            ret = Y_DOM._bruteContains(element, needle);
        }

        return ret;
    },

    /**
     * Determines whether or not the HTMLElement is part of the document.
     * @method inDoc
     * @param {HTMLElement} element The containing html element.
     * @param {HTMLElement} doc optional The document to check.
     * @return {Boolean} Whether or not the element is attached to the document.
     */
    inDoc: function(element, doc) {
        var ret = false,
            rootNode;

        if (element && element.nodeType) {
            (doc) || (doc = element[OWNER_DOCUMENT]);

            rootNode = doc[DOCUMENT_ELEMENT];

            // contains only works with HTML_ELEMENT
            if (rootNode && rootNode.contains && element.tagName) {
                ret = rootNode.contains(element);
            } else {
                ret = Y_DOM.contains(rootNode, element);
            }
        }

        return ret;

    },

   allById: function(id, root) {
        root = root || Y.config.doc;
        var nodes = [],
            ret = [],
            i,
            node;

        if (root.querySelectorAll) {
            ret = root.querySelectorAll('[id="' + id + '"]');
        } else if (root.all) {
            nodes = root.all(id);

            if (nodes) {
                // root.all may return HTMLElement or HTMLCollection.
                // some elements are also HTMLCollection (FORM, SELECT).
                if (nodes.nodeName) {
                    if (nodes.id === id) { // avoid false positive on name
                        ret.push(nodes);
                        nodes = EMPTY_ARRAY; // done, no need to filter
                    } else { //  prep for filtering
                        nodes = [nodes];
                    }
                }

                if (nodes.length) {
                    // filter out matches on node.name
                    // and element.id as reference to element with id === 'id'
                    for (i = 0; node = nodes[i++];) {
                        if (node.id === id  ||
                                (node.attributes && node.attributes.id &&
                                node.attributes.id.value === id)) {
                            ret.push(node);
                        }
                    }
                }
            }
        } else {
            ret = [Y_DOM._getDoc(root).getElementById(id)];
        }

        return ret;
   },


    isWindow: function(obj) {
        return !!(obj && obj.scrollTo && obj.document);
    },

    _removeChildNodes: function(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },

    siblings: function(node, fn) {
        var nodes = [],
            sibling = node;

        while ((sibling = sibling[PREVIOUS_SIBLING])) {
            if (sibling[TAG_NAME] && (!fn || fn(sibling))) {
                nodes.unshift(sibling);
            }
        }

        sibling = node;
        while ((sibling = sibling[NEXT_SIBLING])) {
            if (sibling[TAG_NAME] && (!fn || fn(sibling))) {
                nodes.push(sibling);
            }
        }

        return nodes;
    },

    /**
     * Brute force version of contains.
     * Used for browsers without contains support for non-HTMLElement Nodes (textNodes, etc).
     * @method _bruteContains
     * @private
     * @param {HTMLElement} element The containing html element.
     * @param {HTMLElement} needle The html element that may be contained.
     * @return {Boolean} Whether or not the element is or contains the needle.
     */
    _bruteContains: function(element, needle) {
        while (needle) {
            if (element === needle) {
                return true;
            }
            needle = needle.parentNode;
        }
        return false;
    },

// TODO: move to Lang?
    /**
     * Memoizes dynamic regular expressions to boost runtime performance.
     * @method _getRegExp
     * @private
     * @param {String} str The string to convert to a regular expression.
     * @param {String} flags optional An optinal string of flags.
     * @return {RegExp} An instance of RegExp
     */
    _getRegExp: function(str, flags) {
        flags = flags || '';
        Y_DOM._regexCache = Y_DOM._regexCache || {};
        if (!Y_DOM._regexCache[str + flags]) {
            Y_DOM._regexCache[str + flags] = new RegExp(str, flags);
        }
        return Y_DOM._regexCache[str + flags];
    },

// TODO: make getDoc/Win true privates?
    /**
     * returns the appropriate document.
     * @method _getDoc
     * @private
     * @param {HTMLElement} element optional Target element.
     * @return {Object} The document for the given element or the default document.
     */
    _getDoc: function(element) {
        var doc = Y.config.doc;
        if (element) {
            doc = (element[NODE_TYPE] === 9) ? element : // element === document
                element[OWNER_DOCUMENT] || // element === DOM node
                element.document || // element === window
                Y.config.doc; // default
        }

        return doc;
    },

    /**
     * returns the appropriate window.
     * @method _getWin
     * @private
     * @param {HTMLElement} element optional Target element.
     * @return {Object} The window for the given element or the default window.
     */
    _getWin: function(element) {
        var doc = Y_DOM._getDoc(element);
        return doc[DEFAULT_VIEW] || doc[PARENT_WINDOW] || Y.config.win;
    },

    _batch: function(nodes, fn, arg1, arg2, arg3, etc) {
        fn = (typeof fn === 'string') ? Y_DOM[fn] : fn;
        var result,
            i = 0,
            node,
            ret;

        if (fn && nodes) {
            while ((node = nodes[i++])) {
                result = result = fn.call(Y_DOM, node, arg1, arg2, arg3, etc);
                if (typeof result !== 'undefined') {
                    (ret) || (ret = []);
                    ret.push(result);
                }
            }
        }

        return (typeof ret !== 'undefined') ? ret : nodes;
    },

    generateID: function(el) {
        var id = el.id;

        if (!id) {
            id = Y.stamp(el);
            el.id = id;
        }

        return id;
    }
};


Y.DOM = Y_DOM;


}, '3.16.0', {"requires": ["oop", "features"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dom-base', function (Y, NAME) {

/**
* @for DOM
* @module dom
*/
var documentElement = Y.config.doc.documentElement,
    Y_DOM = Y.DOM,
    TAG_NAME = 'tagName',
    OWNER_DOCUMENT = 'ownerDocument',
    EMPTY_STRING = '',
    addFeature = Y.Features.add,
    testFeature = Y.Features.test;

Y.mix(Y_DOM, {
    /**
     * Returns the text content of the HTMLElement.
     * @method getText
     * @param {HTMLElement} element The html element.
     * @return {String} The text content of the element (includes text of any descending elements).
     */
    getText: (documentElement.textContent !== undefined) ?
        function(element) {
            var ret = '';
            if (element) {
                ret = element.textContent;
            }
            return ret || '';
        } : function(element) {
            var ret = '';
            if (element) {
                ret = element.innerText || element.nodeValue; // might be a textNode
            }
            return ret || '';
        },

    /**
     * Sets the text content of the HTMLElement.
     * @method setText
     * @param {HTMLElement} element The html element.
     * @param {String} content The content to add.
     */
    setText: (documentElement.textContent !== undefined) ?
        function(element, content) {
            if (element) {
                element.textContent = content;
            }
        } : function(element, content) {
            if ('innerText' in element) {
                element.innerText = content;
            } else if ('nodeValue' in element) {
                element.nodeValue = content;
            }
    },

    CUSTOM_ATTRIBUTES: (!documentElement.hasAttribute) ? { // IE < 8
        'for': 'htmlFor',
        'class': 'className'
    } : { // w3c
        'htmlFor': 'for',
        'className': 'class'
    },

    /**
     * Provides a normalized attribute interface.
     * @method setAttribute
     * @param {HTMLElement} el The target element for the attribute.
     * @param {String} attr The attribute to set.
     * @param {String} val The value of the attribute.
     */
    setAttribute: function(el, attr, val, ieAttr) {
        if (el && attr && el.setAttribute) {
            attr = Y_DOM.CUSTOM_ATTRIBUTES[attr] || attr;
            el.setAttribute(attr, val, ieAttr);
        }
    },


    /**
     * Provides a normalized attribute interface.
     * @method getAttribute
     * @param {HTMLElement} el The target element for the attribute.
     * @param {String} attr The attribute to get.
     * @return {String} The current value of the attribute.
     */
    getAttribute: function(el, attr, ieAttr) {
        ieAttr = (ieAttr !== undefined) ? ieAttr : 2;
        var ret = '';
        if (el && attr && el.getAttribute) {
            attr = Y_DOM.CUSTOM_ATTRIBUTES[attr] || attr;
            // BUTTON value issue for IE < 8
            ret = (el.tagName === "BUTTON" && attr === 'value') ? Y_DOM.getValue(el) : el.getAttribute(attr, ieAttr);

            if (ret === null) {
                ret = ''; // per DOM spec
            }
        }
        return ret;
    },

    VALUE_SETTERS: {},

    VALUE_GETTERS: {},

    getValue: function(node) {
        var ret = '', // TODO: return null?
            getter;

        if (node && node[TAG_NAME]) {
            getter = Y_DOM.VALUE_GETTERS[node[TAG_NAME].toLowerCase()];

            if (getter) {
                ret = getter(node);
            } else {
                ret = node.value;
            }
        }

        // workaround for IE8 JSON stringify bug
        // which converts empty string values to null
        if (ret === EMPTY_STRING) {
            ret = EMPTY_STRING; // for real
        }

        return (typeof ret === 'string') ? ret : '';
    },

    setValue: function(node, val) {
        var setter;

        if (node && node[TAG_NAME]) {
            setter = Y_DOM.VALUE_SETTERS[node[TAG_NAME].toLowerCase()];
            val = (val === null) ? '' : val;
            if (setter) {
                setter(node, val);
            } else {
                node.value = val;
            }
        }
    },

    creators: {}
});

addFeature('value-set', 'select', {
    test: function() {
        var node = Y.config.doc.createElement('select');
        node.innerHTML = '<option>1</option><option>2</option>';
        node.value = '2';
        return (node.value && node.value === '2');
    }
});

if (!testFeature('value-set', 'select')) {
    Y_DOM.VALUE_SETTERS.select = function(node, val) {
        for (var i = 0, options = node.getElementsByTagName('option'), option;
                option = options[i++];) {
            if (Y_DOM.getValue(option) === val) {
                option.selected = true;
                //Y_DOM.setAttribute(option, 'selected', 'selected');
                break;
            }
        }
    };
}

Y.mix(Y_DOM.VALUE_GETTERS, {
    button: function(node) {
        return (node.attributes && node.attributes.value) ? node.attributes.value.value : '';
    }
});

Y.mix(Y_DOM.VALUE_SETTERS, {
    // IE: node.value changes the button text, which should be handled via innerHTML
    button: function(node, val) {
        var attr = node.attributes.value;
        if (!attr) {
            attr = node[OWNER_DOCUMENT].createAttribute('value');
            node.setAttributeNode(attr);
        }

        attr.value = val;
    }
});


Y.mix(Y_DOM.VALUE_GETTERS, {
    option: function(node) {
        var attrs = node.attributes;
        return (attrs.value && attrs.value.specified) ? node.value : node.text;
    },

    select: function(node) {
        var val = node.value,
            options = node.options;

        if (options && options.length) {
            // TODO: implement multipe select
            if (node.multiple) {
            } else if (node.selectedIndex > -1) {
                val = Y_DOM.getValue(options[node.selectedIndex]);
            }
        }

        return val;
    }
});
var addClass, hasClass, removeClass;

Y.mix(Y.DOM, {
    /**
     * Determines whether a DOM element has the given className.
     * @method hasClass
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {String} className the class name to search for
     * @return {Boolean} Whether or not the element has the given class.
     */
    hasClass: function(node, className) {
        var re = Y.DOM._getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
        return re.test(node.className);
    },

    /**
     * Adds a class name to a given DOM element.
     * @method addClass
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {String} className the class name to add to the class attribute
     */
    addClass: function(node, className) {
        if (!Y.DOM.hasClass(node, className)) { // skip if already present
            node.className = Y.Lang.trim([node.className, className].join(' '));
        }
    },

    /**
     * Removes a class name from a given element.
     * @method removeClass
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {String} className the class name to remove from the class attribute
     */
    removeClass: function(node, className) {
        if (className && hasClass(node, className)) {
            node.className = Y.Lang.trim(node.className.replace(Y.DOM._getRegExp('(?:^|\\s+)' +
                            className + '(?:\\s+|$)'), ' '));

            if ( hasClass(node, className) ) { // in case of multiple adjacent
                removeClass(node, className);
            }
        }
    },

    /**
     * Replace a class with another class for a given element.
     * If no oldClassName is present, the newClassName is simply added.
     * @method replaceClass
     * @for DOM
     * @param {HTMLElement} element The DOM element
     * @param {String} oldClassName the class name to be replaced
     * @param {String} newClassName the class name that will be replacing the old class name
     */
    replaceClass: function(node, oldC, newC) {
        removeClass(node, oldC); // remove first in case oldC === newC
        addClass(node, newC);
    },

    /**
     * If the className exists on the node it is removed, if it doesn't exist it is added.
     * @method toggleClass
     * @for DOM
     * @param {HTMLElement} element The DOM element
     * @param {String} className the class name to be toggled
     * @param {Boolean} addClass optional boolean to indicate whether class
     * should be added or removed regardless of current state
     */
    toggleClass: function(node, className, force) {
        var add = (force !== undefined) ? force :
                !(hasClass(node, className));

        if (add) {
            addClass(node, className);
        } else {
            removeClass(node, className);
        }
    }
});

hasClass = Y.DOM.hasClass;
removeClass = Y.DOM.removeClass;
addClass = Y.DOM.addClass;

var re_tag = /<([a-z]+)/i,

    Y_DOM = Y.DOM,

    addFeature = Y.Features.add,
    testFeature = Y.Features.test,

    creators = {},

    createFromDIV = function(html, tag) {
        var div = Y.config.doc.createElement('div'),
            ret = true;

        div.innerHTML = html;
        if (!div.firstChild || div.firstChild.tagName !== tag.toUpperCase()) {
            ret = false;
        }

        return ret;
    },

    re_tbody = /(?:\/(?:thead|tfoot|tbody|caption|col|colgroup)>)+\s*<tbody/,

    TABLE_OPEN = '<table>',
    TABLE_CLOSE = '</table>', 
    
    selectedIndex;

Y.mix(Y.DOM, {
    _fragClones: {},

    _create: function(html, doc, tag) {
        tag = tag || 'div';

        var frag = Y_DOM._fragClones[tag];
        if (frag) {
            frag = frag.cloneNode(false);
        } else {
            frag = Y_DOM._fragClones[tag] = doc.createElement(tag);
        }
        frag.innerHTML = html;
        return frag;
    },

    _children: function(node, tag) {
            var i = 0,
            children = node.children,
            childNodes,
            hasComments,
            child;

        if (children && children.tags) { // use tags filter when possible
            if (tag) {
                children = node.children.tags(tag);
            } else { // IE leaks comments into children
                hasComments = children.tags('!').length;
            }
        }

        if (!children || (!children.tags && tag) || hasComments) {
            childNodes = children || node.childNodes;
            children = [];
            while ((child = childNodes[i++])) {
                if (child.nodeType === 1) {
                    if (!tag || tag === child.tagName) {
                        children.push(child);
                    }
                }
            }
        }

        return children || [];
    },

    /**
     * Creates a new dom node using the provided markup string.
     * @method create
     * @param {String} html The markup used to create the element
     * @param {HTMLDocument} doc An optional document context
     * @return {HTMLElement|DocumentFragment} returns a single HTMLElement
     * when creating one node, and a documentFragment when creating
     * multiple nodes.
     */
    create: function(html, doc) {
        if (typeof html === 'string') {
            html = Y.Lang.trim(html); // match IE which trims whitespace from innerHTML

        }

        doc = doc || Y.config.doc;
        var m = re_tag.exec(html),
            create = Y_DOM._create,
            custom = creators,
            ret = null,
            creator, tag, node, nodes;

        if (html != undefined) { // not undefined or null
            if (m && m[1]) {
                creator = custom[m[1].toLowerCase()];
                if (typeof creator === 'function') {
                    create = creator;
                } else {
                    tag = creator;
                }
            }
            
            node = create(html, doc, tag);
            nodes = node.childNodes;

            if (nodes.length === 1) { // return single node, breaking parentNode ref from "fragment"
                ret = node.removeChild(nodes[0]);
            } else if (nodes[0] && nodes[0].className === 'yui3-big-dummy') { // using dummy node to preserve some attributes (e.g. OPTION not selected)
                selectedIndex = node.selectedIndex;
                
                if (nodes.length === 2) {
                    ret = nodes[0].nextSibling;
                } else {
                    node.removeChild(nodes[0]);
                    ret = Y_DOM._nl2frag(nodes, doc);
                }
            } else { // return multiple nodes as a fragment
                 ret = Y_DOM._nl2frag(nodes, doc);
            }

        }

        return ret;
    },

    _nl2frag: function(nodes, doc) {
        var ret = null,
            i, len;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            doc = doc || nodes[0].ownerDocument;
            ret = doc.createDocumentFragment();

            if (nodes.item) { // convert live list to static array
                nodes = Y.Array(nodes, 0, true);
            }

            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        } // else inline with log for minification
        return ret;
    },

    /**
     * Inserts content in a node at the given location
     * @method addHTML
     * @param {HTMLElement} node The node to insert into
     * @param {HTMLElement | Array | HTMLCollection} content The content to be inserted
     * @param {HTMLElement} where Where to insert the content
     * If no "where" is given, content is appended to the node
     * Possible values for "where"
     * <dl>
     * <dt>HTMLElement</dt>
     * <dd>The element to insert before</dd>
     * <dt>"replace"</dt>
     * <dd>Replaces the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts before the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts content before the node</dd>
     * <dt>"after"</dt>
     * <dd>Inserts content after the node</dd>
     * </dl>
     */
    addHTML: function(node, content, where) {
        var nodeParent = node.parentNode,
            i = 0,
            item,
            ret = content,
            newNode;


        if (content != undefined) { // not null or undefined (maybe 0)
            if (content.nodeType) { // DOM node, just add it
                newNode = content;
            } else if (typeof content == 'string' || typeof content == 'number') {
                ret = newNode = Y_DOM.create(content);
            } else if (content[0] && content[0].nodeType) { // array or collection
                newNode = Y.config.doc.createDocumentFragment();
                while ((item = content[i++])) {
                    newNode.appendChild(item); // append to fragment for insertion
                }
            }
        }

        if (where) {
            if (newNode && where.parentNode) { // insert regardless of relationship to node
                where.parentNode.insertBefore(newNode, where);
            } else {
                switch (where) {
                    case 'replace':
                        while (node.firstChild) {
                            node.removeChild(node.firstChild);
                        }
                        if (newNode) { // allow empty content to clear node
                            node.appendChild(newNode);
                        }
                        break;
                    case 'before':
                        if (newNode) {
                            nodeParent.insertBefore(newNode, node);
                        }
                        break;
                    case 'after':
                        if (newNode) {
                            if (node.nextSibling) { // IE errors if refNode is null
                                nodeParent.insertBefore(newNode, node.nextSibling);
                            } else {
                                nodeParent.appendChild(newNode);
                            }
                        }
                        break;
                    default:
                        if (newNode) {
                            node.appendChild(newNode);
                        }
                }
            }
        } else if (newNode) {
            node.appendChild(newNode);
        }

        // `select` elements are the only elements with `selectedIndex`.
        // Don't grab the dummy `option` element's `selectedIndex`.
        if (node.nodeName == "SELECT" && selectedIndex > 0) {
            node.selectedIndex = selectedIndex - 1;
        }
        
        return ret;
    },

    wrap: function(node, html) {
        var parent = (html && html.nodeType) ? html : Y.DOM.create(html),
            nodes = parent.getElementsByTagName('*');

        if (nodes.length) {
            parent = nodes[nodes.length - 1];
        }

        if (node.parentNode) {
            node.parentNode.replaceChild(parent, node);
        }
        parent.appendChild(node);
    },

    unwrap: function(node) {
        var parent = node.parentNode,
            lastChild = parent.lastChild,
            next = node,
            grandparent;

        if (parent) {
            grandparent = parent.parentNode;
            if (grandparent) {
                node = parent.firstChild;
                while (node !== lastChild) {
                    next = node.nextSibling;
                    grandparent.insertBefore(node, parent);
                    node = next;
                }
                grandparent.replaceChild(lastChild, parent);
            } else {
                parent.removeChild(node);
            }
        }
    }
});

addFeature('innerhtml', 'table', {
    test: function() {
        var node = Y.config.doc.createElement('table');
        try {
            node.innerHTML = '<tbody></tbody>';
        } catch(e) {
            return false;
        }
        return (node.firstChild && node.firstChild.nodeName === 'TBODY');
    }
});

addFeature('innerhtml-div', 'tr', {
    test: function() {
        return createFromDIV('<tr></tr>', 'tr');
    }
});

addFeature('innerhtml-div', 'script', {
    test: function() {
        return createFromDIV('<script></script>', 'script');
    }
});

if (!testFeature('innerhtml', 'table')) {
    // TODO: thead/tfoot with nested tbody
        // IE adds TBODY when creating TABLE elements (which may share this impl)
    creators.tbody = function(html, doc) {
        var frag = Y_DOM.create(TABLE_OPEN + html + TABLE_CLOSE, doc),
            tb = Y.DOM._children(frag, 'tbody')[0];

        if (frag.children.length > 1 && tb && !re_tbody.test(html)) {
            tb.parentNode.removeChild(tb); // strip extraneous tbody
        }
        return frag;
    };
}

if (!testFeature('innerhtml-div', 'script')) {
    creators.script = function(html, doc) {
        var frag = doc.createElement('div');

        frag.innerHTML = '-' + html;
        frag.removeChild(frag.firstChild);
        return frag;
    };

    creators.link = creators.style = creators.script;
}

if (!testFeature('innerhtml-div', 'tr')) {
    Y.mix(creators, {
        option: function(html, doc) {
            return Y_DOM.create('<select><option class="yui3-big-dummy" selected></option>' + html + '</select>', doc);
        },

        tr: function(html, doc) {
            return Y_DOM.create('<tbody>' + html + '</tbody>', doc);
        },

        td: function(html, doc) {
            return Y_DOM.create('<tr>' + html + '</tr>', doc);
        },

        col: function(html, doc) {
            return Y_DOM.create('<colgroup>' + html + '</colgroup>', doc);
        },

        tbody: 'table'
    });

    Y.mix(creators, {
        legend: 'fieldset',
        th: creators.td,
        thead: creators.tbody,
        tfoot: creators.tbody,
        caption: creators.tbody,
        colgroup: creators.tbody,
        optgroup: creators.option
    });
}

Y_DOM.creators = creators;
Y.mix(Y.DOM, {
    /**
     * Sets the width of the element to the given size, regardless
     * of box model, border, padding, etc.
     * @method setWidth
     * @param {HTMLElement} element The DOM element.
     * @param {String|Number} size The pixel height to size to
     */

    setWidth: function(node, size) {
        Y.DOM._setSize(node, 'width', size);
    },

    /**
     * Sets the height of the element to the given size, regardless
     * of box model, border, padding, etc.
     * @method setHeight
     * @param {HTMLElement} element The DOM element.
     * @param {String|Number} size The pixel height to size to
     */

    setHeight: function(node, size) {
        Y.DOM._setSize(node, 'height', size);
    },

    _setSize: function(node, prop, val) {
        val = (val > 0) ? val : 0;
        var size = 0;

        node.style[prop] = val + 'px';
        size = (prop === 'height') ? node.offsetHeight : node.offsetWidth;

        if (size > val) {
            val = val - (size - val);

            if (val < 0) {
                val = 0;
            }

            node.style[prop] = val + 'px';
        }
    }
});


}, '3.16.0', {"requires": ["dom-core"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('color-base', function (Y, NAME) {

/**
Color provides static methods for color conversion.

    Y.Color.toRGB('f00'); // rgb(255, 0, 0)

    Y.Color.toHex('rgb(255, 255, 0)'); // #ffff00

@module color
@submodule color-base
@class Color
@since 3.8.0
**/

var REGEX_HEX = /^#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})(\ufffe)?/,
    REGEX_HEX3 = /^#?([\da-fA-F]{1})([\da-fA-F]{1})([\da-fA-F]{1})(\ufffe)?/,
    REGEX_RGB = /rgba?\(([\d]{1,3}), ?([\d]{1,3}), ?([\d]{1,3}),? ?([.\d]*)?\)/,
    TYPES = { 'HEX': 'hex', 'RGB': 'rgb', 'RGBA': 'rgba' },
    CONVERTS = { 'hex': 'toHex', 'rgb': 'toRGB', 'rgba': 'toRGBA' };


Y.Color = {
    /**
    @static
    @property KEYWORDS
    @type Object
    @since 3.8.0
    **/
    KEYWORDS: {
        'black': '000', 'silver': 'c0c0c0', 'gray': '808080', 'white': 'fff',
        'maroon': '800000', 'red': 'f00', 'purple': '800080', 'fuchsia': 'f0f',
        'green': '008000', 'lime': '0f0', 'olive': '808000', 'yellow': 'ff0',
        'navy': '000080', 'blue': '00f', 'teal': '008080', 'aqua': '0ff'
    },

    /**
        NOTE: `(\ufffe)?` is added to the Regular Expression to carve out a
        place for the alpha channel that is returned from toArray
        without compromising any usage of the Regular Expression

    @static
    @property REGEX_HEX
    @type RegExp
    @default /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})(\ufffe)?/
    @since 3.8.0
    **/
    REGEX_HEX: REGEX_HEX,

    /**
        NOTE: `(\ufffe)?` is added to the Regular Expression to carve out a
        place for the alpha channel that is returned from toArray
        without compromising any usage of the Regular Expression

    @static
    @property REGEX_HEX3
    @type RegExp
    @default /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})(\ufffe)?/
    @since 3.8.0
    **/
    REGEX_HEX3: REGEX_HEX3,

    /**
    @static
    @property REGEX_RGB
    @type RegExp
    @default /rgba?\(([0-9]{1,3}), ?([0-9]{1,3}), ?([0-9]{1,3}),? ?([.0-9]{1,3})?\)/
    @since 3.8.0
    **/
    REGEX_RGB: REGEX_RGB,

    re_RGB: REGEX_RGB,

    re_hex: REGEX_HEX,

    re_hex3: REGEX_HEX3,

    /**
    @static
    @property STR_HEX
    @type String
    @default #{*}{*}{*}
    @since 3.8.0
    **/
    STR_HEX: '#{*}{*}{*}',

    /**
    @static
    @property STR_RGB
    @type String
    @default rgb({*}, {*}, {*})
    @since 3.8.0
    **/
    STR_RGB: 'rgb({*}, {*}, {*})',

    /**
    @static
    @property STR_RGBA
    @type String
    @default rgba({*}, {*}, {*}, {*})
    @since 3.8.0
    **/
    STR_RGBA: 'rgba({*}, {*}, {*}, {*})',

    /**
    @static
    @property TYPES
    @type Object
    @default {'rgb':'rgb', 'rgba':'rgba'}
    @since 3.8.0
    **/
    TYPES: TYPES,

    /**
    @static
    @property CONVERTS
    @type Object
    @default {}
    @since 3.8.0
    **/
    CONVERTS: CONVERTS,

    /**
     Converts the provided string to the provided type.
     You can use the `Y.Color.TYPES` to get a valid `to` type.
     If the color cannot be converted, the original color will be returned.

     @public
     @method convert
     @param {String} str
     @param {String} to
     @return {String}
     @since 3.8.0
     **/
    convert: function (str, to) {
        var convert = Y.Color.CONVERTS[to.toLowerCase()],
            clr = str;

        if (convert && Y.Color[convert]) {
            clr = Y.Color[convert](str);
        }

        return clr;
    },

    /**
    Converts provided color value to a hex value string

    @public
    @method toHex
    @param {String} str Hex or RGB value string
    @return {String} returns array of values or CSS string if options.css is true
    @since 3.8.0
    **/
    toHex: function (str) {
        var clr = Y.Color._convertTo(str, 'hex'),
            isTransparent = clr.toLowerCase() === 'transparent';

        if (clr.charAt(0) !== '#' && !isTransparent) {
            clr = '#' + clr;
        }

        return isTransparent ? clr.toLowerCase() : clr.toUpperCase();
    },

    /**
    Converts provided color value to an RGB value string
    @public
    @method toRGB
    @param {String} str Hex or RGB value string
    @return {String}
    @since 3.8.0
    **/
    toRGB: function (str) {
        var clr = Y.Color._convertTo(str, 'rgb');
        return clr.toLowerCase();
    },

    /**
    Converts provided color value to an RGB value string
    @public
    @method toRGBA
    @param {String} str Hex or RGB value string
    @return {String}
    @since 3.8.0
    **/
    toRGBA: function (str) {
        var clr = Y.Color._convertTo(str, 'rgba' );
        return clr.toLowerCase();
    },

    /**
    Converts the provided color string to an array of values where the
        last value is the alpha value. Will return an empty array if
        the provided string is not able to be parsed.

        NOTE: `(\ufffe)?` is added to `HEX` and `HEX3` Regular Expressions to
        carve out a place for the alpha channel that is returned from
        toArray without compromising any usage of the Regular Expression

        Y.Color.toArray('fff');              // ['ff', 'ff', 'ff', 1]
        Y.Color.toArray('rgb(0, 0, 0)');     // ['0', '0', '0', 1]
        Y.Color.toArray('rgba(0, 0, 0, 0)'); // ['0', '0', '0', 1]



    @public
    @method toArray
    @param {String} str
    @return {Array}
    @since 3.8.0
    **/
    toArray: function(str) {
        // parse with regex and return "matches" array
        var type = Y.Color.findType(str).toUpperCase(),
            regex,
            arr,
            length,
            lastItem;

        if (type === 'HEX' && str.length < 5) {
            type = 'HEX3';
        }

        if (type.charAt(type.length - 1) === 'A') {
            type = type.slice(0, -1);
        }

        regex = Y.Color['REGEX_' + type];

        if (regex) {
            arr = regex.exec(str) || [];
            length = arr.length;

            if (length) {

                arr.shift();
                length--;

                if (type === 'HEX3') {
                    arr[0] += arr[0];
                    arr[1] += arr[1];
                    arr[2] += arr[2];
                }

                lastItem = arr[length - 1];
                if (!lastItem) {
                    arr[length - 1] = 1;
                }
            }
        }

        return arr;

    },

    /**
    Converts the array of values to a string based on the provided template.
    @public
    @method fromArray
    @param {Array} arr
    @param {String} template
    @return {String}
    @since 3.8.0
    **/
    fromArray: function(arr, template) {
        arr = arr.concat();

        if (typeof template === 'undefined') {
            return arr.join(', ');
        }

        var replace = '{*}';

        template = Y.Color['STR_' + template.toUpperCase()];

        if (arr.length === 3 && template.match(/\{\*\}/g).length === 4) {
            arr.push(1);
        }

        while ( template.indexOf(replace) >= 0 && arr.length > 0) {
            template = template.replace(replace, arr.shift());
        }

        return template;
    },

    /**
    Finds the value type based on the str value provided.
    @public
    @method findType
    @param {String} str
    @return {String}
    @since 3.8.0
    **/
    findType: function (str) {
        if (Y.Color.KEYWORDS[str]) {
            return 'keyword';
        }

        var index = str.indexOf('('),
            key;

        if (index > 0) {
            key = str.substr(0, index);
        }

        if (key && Y.Color.TYPES[key.toUpperCase()]) {
            return Y.Color.TYPES[key.toUpperCase()];
        }

        return 'hex';

    }, // return 'keyword', 'hex', 'rgb'

    /**
    Retrives the alpha channel from the provided string. If no alpha
        channel is present, `1` will be returned.
    @protected
    @method _getAlpha
    @param {String} clr
    @return {Number}
    @since 3.8.0
    **/
    _getAlpha: function (clr) {
        var alpha,
            arr = Y.Color.toArray(clr);

        if (arr.length > 3) {
            alpha = arr.pop();
        }

        return +alpha || 1;
    },

    /**
    Returns the hex value string if found in the KEYWORDS object
    @protected
    @method _keywordToHex
    @param {String} clr
    @return {String}
    @since 3.8.0
    **/
    _keywordToHex: function (clr) {
        var keyword = Y.Color.KEYWORDS[clr];

        if (keyword) {
            return keyword;
        }
    },

    /**
    Converts the provided color string to the value type provided as `to`
    @protected
    @method _convertTo
    @param {String} clr
    @param {String} to
    @return {String}
    @since 3.8.0
    **/
    _convertTo: function(clr, to) {

        if (clr === 'transparent') {
            return clr;
        }

        var from = Y.Color.findType(clr),
            originalTo = to,
            needsAlpha,
            alpha,
            method,
            ucTo;

        if (from === 'keyword') {
            clr = Y.Color._keywordToHex(clr);
            from = 'hex';
        }

        if (from === 'hex' && clr.length < 5) {
            if (clr.charAt(0) === '#') {
                clr = clr.substr(1);
            }

            clr = '#' + clr.charAt(0) + clr.charAt(0) +
                        clr.charAt(1) + clr.charAt(1) +
                        clr.charAt(2) + clr.charAt(2);
        }

        if (from === to) {
            return clr;
        }

        if (from.charAt(from.length - 1) === 'a') {
            from = from.slice(0, -1);
        }

        needsAlpha = (to.charAt(to.length - 1) === 'a');
        if (needsAlpha) {
            to = to.slice(0, -1);
            alpha = Y.Color._getAlpha(clr);
        }

        ucTo = to.charAt(0).toUpperCase() + to.substr(1).toLowerCase();
        method = Y.Color['_' + from + 'To' + ucTo ];

        // check to see if need conversion to rgb first
        // check to see if there is a direct conversion method
        // convertions are: hex <-> rgb <-> hsl
        if (!method) {
            if (from !== 'rgb' && to !== 'rgb') {
                clr = Y.Color['_' + from + 'ToRgb'](clr);
                from = 'rgb';
                method = Y.Color['_' + from + 'To' + ucTo ];
            }
        }

        if (method) {
            clr = ((method)(clr, needsAlpha));
        }

        // process clr from arrays to strings after conversions if alpha is needed
        if (needsAlpha) {
            if (!Y.Lang.isArray(clr)) {
                clr = Y.Color.toArray(clr);
            }
            clr.push(alpha);
            clr = Y.Color.fromArray(clr, originalTo.toUpperCase());
        }

        return clr;
    },

    /**
    Processes the hex string into r, g, b values. Will return values as
        an array, or as an rgb string.
    @protected
    @method _hexToRgb
    @param {String} str
    @param {Boolean} [toArray]
    @return {String|Array}
    @since 3.8.0
    **/
    _hexToRgb: function (str, toArray) {
        var r, g, b;

        /*jshint bitwise:false*/
        if (str.charAt(0) === '#') {
            str = str.substr(1);
        }

        str = parseInt(str, 16);

        r = str >> 16;
        g = str >> 8 & 0xFF;
        b = str & 0xFF;

        if (toArray) {
            return [r, g, b];
        }

        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    },

    /**
    Processes the rgb string into r, g, b values. Will return values as
        an array, or as a hex string.
    @protected
    @method _rgbToHex
    @param {String} str
    @param {Boolean} [toArray]
    @return {String|Array}
    @since 3.8.0
    **/
    _rgbToHex: function (str) {
        /*jshint bitwise:false*/
        var rgb = Y.Color.toArray(str),
            hex = rgb[2] | (rgb[1] << 8) | (rgb[0] << 16);

        hex = (+hex).toString(16);

        while (hex.length < 6) {
            hex = '0' + hex;
        }

        return '#' + hex;
    }

};



}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dom-style', function (Y, NAME) {

/**
 * Add style management functionality to DOM.
 * @module dom
 * @submodule dom-style
 * @for DOM
 */

var DOCUMENT_ELEMENT = 'documentElement',
    DEFAULT_VIEW = 'defaultView',
    OWNER_DOCUMENT = 'ownerDocument',
    STYLE = 'style',
    FLOAT = 'float',
    CSS_FLOAT = 'cssFloat',
    STYLE_FLOAT = 'styleFloat',
    TRANSPARENT = 'transparent',
    GET_COMPUTED_STYLE = 'getComputedStyle',
    GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',

    DOCUMENT = Y.config.doc,

    Y_DOM = Y.DOM,

    TRANSFORM = 'transform',
    TRANSFORMORIGIN = 'transformOrigin',
    VENDOR_TRANSFORM = [
        'WebkitTransform',
        'MozTransform',
        'OTransform',
        'msTransform'
    ],

    re_color = /color$/i,
    re_unit = /width|height|top|left|right|bottom|margin|padding/i;

Y.Array.each(VENDOR_TRANSFORM, function(val) {
    if (val in DOCUMENT[DOCUMENT_ELEMENT].style) {
        TRANSFORM = val;
        TRANSFORMORIGIN = val + "Origin";
    }
});

Y.mix(Y_DOM, {
    DEFAULT_UNIT: 'px',

    CUSTOM_STYLES: {
    },


    /**
     * Sets a style property for a given element.
     * @method setStyle
     * @param {HTMLElement} node The HTMLElement to apply the style to.
     * @param {String} att The style property to set.
     * @param {String|Number} val The value.
     * @param {Object} [style] The style node. Defaults to `node.style`.
     */
    setStyle: function(node, att, val, style) {
        style = style || node.style;
        var CUSTOM_STYLES = Y_DOM.CUSTOM_STYLES;

        if (style) {
            if (val === null || val === '') { // normalize unsetting
                val = '';
            } else if (!isNaN(Number(val)) && re_unit.test(att)) { // number values may need a unit
                val += Y_DOM.DEFAULT_UNIT;
            }

            if (att in CUSTOM_STYLES) {
                if (CUSTOM_STYLES[att].set) {
                    CUSTOM_STYLES[att].set(node, val, style);
                    return; // NOTE: return
                } else if (typeof CUSTOM_STYLES[att] === 'string') {
                    att = CUSTOM_STYLES[att];
                }
            } else if (att === '') { // unset inline styles
                att = 'cssText';
                val = '';
            }
            style[att] = val;
        }
    },

    /**
     * Returns the current style value for the given property.
     * @method getStyle
     * @param {HTMLElement} node The HTMLElement to get the style from.
     * @param {String} att The style property to get.
     * @param {Object} [style] The style node. Defaults to `node.style`.
     */
    getStyle: function(node, att, style) {
        style = style || node.style;
        var CUSTOM_STYLES = Y_DOM.CUSTOM_STYLES,
            val = '';

        if (style) {
            if (att in CUSTOM_STYLES) {
                if (CUSTOM_STYLES[att].get) {
                    return CUSTOM_STYLES[att].get(node, att, style); // NOTE: return
                } else if (typeof CUSTOM_STYLES[att] === 'string') {
                    att = CUSTOM_STYLES[att];
                }
            }
            val = style[att];
            if (val === '') { // TODO: is empty string sufficient?
                val = Y_DOM[GET_COMPUTED_STYLE](node, att);
            }
        }

        return val;
    },

    /**
     * Sets multiple style properties.
     * @method setStyles
     * @param {HTMLElement} node The HTMLElement to apply the styles to.
     * @param {Object} hash An object literal of property:value pairs.
     */
    setStyles: function(node, hash) {
        var style = node.style;
        Y.each(hash, function(v, n) {
            Y_DOM.setStyle(node, n, v, style);
        }, Y_DOM);
    },

    /**
     * Returns the computed style for the given node.
     * @method getComputedStyle
     * @param {HTMLElement} node The HTMLElement to get the style from.
     * @param {String} att The style property to get.
     * @return {String} The computed value of the style property.
     */
    getComputedStyle: function(node, att) {
        var val = '',
            doc = node[OWNER_DOCUMENT],
            computed;

        if (node[STYLE] && doc[DEFAULT_VIEW] && doc[DEFAULT_VIEW][GET_COMPUTED_STYLE]) {
            computed = doc[DEFAULT_VIEW][GET_COMPUTED_STYLE](node, null);
            if (computed) { // FF may be null in some cases (ticket #2530548)
                val = computed[att];
            }
        }
        return val;
    }
});

// normalize reserved word float alternatives ("cssFloat" or "styleFloat")
if (DOCUMENT[DOCUMENT_ELEMENT][STYLE][CSS_FLOAT] !== undefined) {
    Y_DOM.CUSTOM_STYLES[FLOAT] = CSS_FLOAT;
} else if (DOCUMENT[DOCUMENT_ELEMENT][STYLE][STYLE_FLOAT] !== undefined) {
    Y_DOM.CUSTOM_STYLES[FLOAT] = STYLE_FLOAT;
}

// fix opera computedStyle default color unit (convert to rgb)
if (Y.UA.opera) {
    Y_DOM[GET_COMPUTED_STYLE] = function(node, att) {
        var view = node[OWNER_DOCUMENT][DEFAULT_VIEW],
            val = view[GET_COMPUTED_STYLE](node, '')[att];

        if (re_color.test(att)) {
            val = Y.Color.toRGB(val);
        }

        return val;
    };

}

// safari converts transparent to rgba(), others use "transparent"
if (Y.UA.webkit) {
    Y_DOM[GET_COMPUTED_STYLE] = function(node, att) {
        var view = node[OWNER_DOCUMENT][DEFAULT_VIEW],
            val = view[GET_COMPUTED_STYLE](node, '')[att];

        if (val === 'rgba(0, 0, 0, 0)') {
            val = TRANSPARENT;
        }

        return val;
    };

}

Y.DOM._getAttrOffset = function(node, attr) {
    var val = Y.DOM[GET_COMPUTED_STYLE](node, attr),
        offsetParent = node.offsetParent,
        position,
        parentOffset,
        offset;

    if (val === 'auto') {
        position = Y.DOM.getStyle(node, 'position');
        if (position === 'static' || position === 'relative') {
            val = 0;
        } else if (offsetParent && offsetParent[GET_BOUNDING_CLIENT_RECT]) {
            parentOffset = offsetParent[GET_BOUNDING_CLIENT_RECT]()[attr];
            offset = node[GET_BOUNDING_CLIENT_RECT]()[attr];
            if (attr === 'left' || attr === 'top') {
                val = offset - parentOffset;
            } else {
                val = parentOffset - node[GET_BOUNDING_CLIENT_RECT]()[attr];
            }
        }
    }

    return val;
};

Y.DOM._getOffset = function(node) {
    var pos,
        xy = null;

    if (node) {
        pos = Y_DOM.getStyle(node, 'position');
        xy = [
            parseInt(Y_DOM[GET_COMPUTED_STYLE](node, 'left'), 10),
            parseInt(Y_DOM[GET_COMPUTED_STYLE](node, 'top'), 10)
        ];

        if ( isNaN(xy[0]) ) { // in case of 'auto'
            xy[0] = parseInt(Y_DOM.getStyle(node, 'left'), 10); // try inline
            if ( isNaN(xy[0]) ) { // default to offset value
                xy[0] = (pos === 'relative') ? 0 : node.offsetLeft || 0;
            }
        }

        if ( isNaN(xy[1]) ) { // in case of 'auto'
            xy[1] = parseInt(Y_DOM.getStyle(node, 'top'), 10); // try inline
            if ( isNaN(xy[1]) ) { // default to offset value
                xy[1] = (pos === 'relative') ? 0 : node.offsetTop || 0;
            }
        }
    }

    return xy;

};

Y_DOM.CUSTOM_STYLES.transform = {
    set: function(node, val, style) {
        style[TRANSFORM] = val;
    },

    get: function(node) {
        return Y_DOM[GET_COMPUTED_STYLE](node, TRANSFORM);
    }
};

Y_DOM.CUSTOM_STYLES.transformOrigin = {
    set: function(node, val, style) {
        style[TRANSFORMORIGIN] = val;
    },

    get: function(node) {
        return Y_DOM[GET_COMPUTED_STYLE](node, TRANSFORMORIGIN);
    }
};


}, '3.16.0', {"requires": ["dom-base", "color-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('event-base', function (Y, NAME) {

/*
 * DOM event listener abstraction layer
 * @module event
 * @submodule event-base
 */

/**
 * The domready event fires at the moment the browser's DOM is
 * usable. In most cases, this is before images are fully
 * downloaded, allowing you to provide a more responsive user
 * interface.
 *
 * In YUI 3, domready subscribers will be notified immediately if
 * that moment has already passed when the subscription is created.
 *
 * One exception is if the yui.js file is dynamically injected into
 * the page.  If this is done, you must tell the YUI instance that
 * you did this in order for DOMReady (and window load events) to
 * fire normally.  That configuration option is 'injected' -- set
 * it to true if the yui.js script is not included inline.
 *
 * This method is part of the 'event-ready' module, which is a
 * submodule of 'event'.
 *
 * @event domready
 * @for YUI
 */
Y.publish('domready', {
    fireOnce: true,
    async: true
});

if (YUI.Env.DOMReady) {
    Y.fire('domready');
} else {
    Y.Do.before(function() { Y.fire('domready'); }, YUI.Env, '_ready');
}

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event
 * @submodule event-base
 */

/**
 * Wraps a DOM event, properties requiring browser abstraction are
 * fixed here.  Provids a security layer when required.
 * @class DOMEventFacade
 * @param ev {Event} the DOM event
 * @param currentTarget {HTMLElement} the element the listener was attached to
 * @param wrapper {CustomEvent} the custom event wrapper for this DOM event
 */

    var ua = Y.UA,

    EMPTY = {},

    /**
     * webkit key remapping required for Safari < 3.1
     * @property webkitKeymap
     * @private
     */
    webkitKeymap = {
        63232: 38, // up
        63233: 40, // down
        63234: 37, // left
        63235: 39, // right
        63276: 33, // page up
        63277: 34, // page down
        25:     9, // SHIFT-TAB (Safari provides a different key code in
                   // this case, even though the shiftKey modifier is set)
        63272: 46, // delete
        63273: 36, // home
        63275: 35  // end
    },

    /**
     * Returns a wrapped node.  Intended to be used on event targets,
     * so it will return the node's parent if the target is a text
     * node.
     *
     * If accessing a property of the node throws an error, this is
     * probably the anonymous div wrapper Gecko adds inside text
     * nodes.  This likely will only occur when attempting to access
     * the relatedTarget.  In this case, we now return null because
     * the anonymous div is completely useless and we do not know
     * what the related target was because we can't even get to
     * the element's parent node.
     *
     * @method resolve
     * @private
     */
    resolve = function(n) {
        if (!n) {
            return n;
        }
        try {
            if (n && 3 == n.nodeType) {
                n = n.parentNode;
            }
        } catch(e) {
            return null;
        }

        return Y.one(n);
    },

    DOMEventFacade = function(ev, currentTarget, wrapper) {
        this._event = ev;
        this._currentTarget = currentTarget;
        this._wrapper = wrapper || EMPTY;

        // if not lazy init
        this.init();
    };

Y.extend(DOMEventFacade, Object, {

    init: function() {

        var e = this._event,
            overrides = this._wrapper.overrides,
            x = e.pageX,
            y = e.pageY,
            c,
            currentTarget = this._currentTarget;

        this.altKey   = e.altKey;
        this.ctrlKey  = e.ctrlKey;
        this.metaKey  = e.metaKey;
        this.shiftKey = e.shiftKey;
        this.type     = (overrides && overrides.type) || e.type;
        this.clientX  = e.clientX;
        this.clientY  = e.clientY;

        this.pageX = x;
        this.pageY = y;

        // charCode is unknown in keyup, keydown. keyCode is unknown in keypress.
        // FF 3.6 - 8+? pass 0 for keyCode in keypress events.
        // Webkit, FF 3.6-8+?, and IE9+? pass 0 for charCode in keydown, keyup.
        // Webkit and IE9+? duplicate charCode in keyCode.
        // Opera never sets charCode, always keyCode (though with the charCode).
        // IE6-8 don't set charCode or which.
        // All browsers other than IE6-8 set which=keyCode in keydown, keyup, and
        // which=charCode in keypress.
        //
        // Moral of the story: (e.which || e.keyCode) will always return the
        // known code for that key event phase. e.keyCode is often different in
        // keypress from keydown and keyup.
        c = e.keyCode || e.charCode;

        if (ua.webkit && (c in webkitKeymap)) {
            c = webkitKeymap[c];
        }

        this.keyCode = c;
        this.charCode = c;
        // Fill in e.which for IE - implementers should always use this over
        // e.keyCode or e.charCode.
        this.which = e.which || e.charCode || c;
        // this.button = e.button;
        this.button = this.which;

        this.target = resolve(e.target);
        this.currentTarget = resolve(currentTarget);
        this.relatedTarget = resolve(e.relatedTarget);

        if (e.type == "mousewheel" || e.type == "DOMMouseScroll") {
            this.wheelDelta = (e.detail) ? (e.detail * -1) : Math.round(e.wheelDelta / 80) || ((e.wheelDelta < 0) ? -1 : 1);
        }

        if (this._touch) {
            this._touch(e, currentTarget, this._wrapper);
        }
    },

    stopPropagation: function() {
        this._event.stopPropagation();
        this._wrapper.stopped = 1;
        this.stopped = 1;
    },

    stopImmediatePropagation: function() {
        var e = this._event;
        if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        } else {
            this.stopPropagation();
        }
        this._wrapper.stopped = 2;
        this.stopped = 2;
    },

    preventDefault: function(returnValue) {
        var e = this._event;
        e.preventDefault();
        if (returnValue) {
            e.returnValue = returnValue;
        }
        this._wrapper.prevented = 1;
        this.prevented = 1;
    },

    halt: function(immediate) {
        if (immediate) {
            this.stopImmediatePropagation();
        } else {
            this.stopPropagation();
        }

        this.preventDefault();
    }

});

DOMEventFacade.resolve = resolve;
Y.DOM2EventFacade = DOMEventFacade;
Y.DOMEventFacade = DOMEventFacade;

    /**
     * The native event
     * @property _event
     * @type {DOMEvent}
     * @private
     */

    /**
    The name of the event (e.g. "click")

    @property type
    @type {String}
    **/

    /**
    `true` if the "alt" or "option" key is pressed.

    @property altKey
    @type {Boolean}
    **/

    /**
    `true` if the shift key is pressed.

    @property shiftKey
    @type {Boolean}
    **/

    /**
    `true` if the "Windows" key on a Windows keyboard, "command" key on an
    Apple keyboard, or "meta" key on other keyboards is pressed.

    @property metaKey
    @type {Boolean}
    **/

    /**
    `true` if the "Ctrl" or "control" key is pressed.

    @property ctrlKey
    @type {Boolean}
    **/

    /**
     * The X location of the event on the page (including scroll)
     * @property pageX
     * @type {Number}
     */

    /**
     * The Y location of the event on the page (including scroll)
     * @property pageY
     * @type {Number}
     */

    /**
     * The X location of the event in the viewport
     * @property clientX
     * @type {Number}
     */

    /**
     * The Y location of the event in the viewport
     * @property clientY
     * @type {Number}
     */

    /**
     * The keyCode for key events.  Uses charCode if keyCode is not available
     * @property keyCode
     * @type {Number}
     */

    /**
     * The charCode for key events.  Same as keyCode
     * @property charCode
     * @type {Number}
     */

    /**
     * The button that was pushed. 1 for left click, 2 for middle click, 3 for
     * right click.  This is only reliably populated on `mouseup` events.
     * @property button
     * @type {Number}
     */

    /**
     * The button that was pushed.  Same as button.
     * @property which
     * @type {Number}
     */

    /**
     * Node reference for the targeted element
     * @property target
     * @type {Node}
     */

    /**
     * Node reference for the element that the listener was attached to.
     * @property currentTarget
     * @type {Node}
     */

    /**
     * Node reference to the relatedTarget
     * @property relatedTarget
     * @type {Node}
     */

    /**
     * Number representing the direction and velocity of the movement of the mousewheel.
     * Negative is down, the higher the number, the faster.  Applies to the mousewheel event.
     * @property wheelDelta
     * @type {Number}
     */

    /**
     * Stops the propagation to the next bubble target
     * @method stopPropagation
     */

    /**
     * Stops the propagation to the next bubble target and
     * prevents any additional listeners from being exectued
     * on the current target.
     * @method stopImmediatePropagation
     */

    /**
     * Prevents the event's default behavior
     * @method preventDefault
     * @param returnValue {string} sets the returnValue of the event to this value
     * (rather than the default false value).  This can be used to add a customized
     * confirmation query to the beforeunload event).
     */

    /**
     * Stops the event propagation and prevents the default
     * event behavior.
     * @method halt
     * @param immediate {boolean} if true additional listeners
     * on the current target will not be executed
     */
(function() {

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 * @module event
 * @main event
 * @submodule event-base
 */

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */

Y.Env.evt.dom_wrappers = {};
Y.Env.evt.dom_map = {};

var _eventenv = Y.Env.evt,
    config = Y.config,
    win = config.win,
    add = YUI.Env.add,
    remove = YUI.Env.remove,

    onLoad = function() {
        YUI.Env.windowLoaded = true;
        Y.Event._load();
        remove(win, "load", onLoad);
    },

    onUnload = function() {
        Y.Event._unload();
    },

    EVENT_READY = 'domready',

    COMPAT_ARG = '~yui|2|compat~',

    shouldIterate = function(o) {
        try {
            // TODO: See if there's a more performant way to return true early on this, for the common case
            return (o && typeof o !== "string" && Y.Lang.isNumber(o.length) && !o.tagName && !Y.DOM.isWindow(o));
        } catch(ex) {
            return false;
        }
    },

    // aliases to support DOM event subscription clean up when the last
    // subscriber is detached. deleteAndClean overrides the DOM event's wrapper
    // CustomEvent _delete method.
    _ceProtoDelete = Y.CustomEvent.prototype._delete,
    _deleteAndClean = function(s) {
        var ret = _ceProtoDelete.apply(this, arguments);

        if (!this.hasSubs()) {
            Y.Event._clean(this);
        }

        return ret;
    },

Event = function() {

    /**
     * True after the onload event has fired
     * @property _loadComplete
     * @type boolean
     * @static
     * @private
     */
    var _loadComplete =  false,

    /**
     * The number of times to poll after window.onload.  This number is
     * increased if additional late-bound handlers are requested after
     * the page load.
     * @property _retryCount
     * @static
     * @private
     */
    _retryCount = 0,

    /**
     * onAvailable listeners
     * @property _avail
     * @static
     * @private
     */
    _avail = [],

    /**
     * Custom event wrappers for DOM events.  Key is
     * 'event:' + Element uid stamp + event type
     * @property _wrappers
     * @type CustomEvent
     * @static
     * @private
     */
    _wrappers = _eventenv.dom_wrappers,

    _windowLoadKey = null,

    /**
     * Custom event wrapper map DOM events.  Key is
     * Element uid stamp.  Each item is a hash of custom event
     * wrappers as provided in the _wrappers collection.  This
     * provides the infrastructure for getListeners.
     * @property _el_events
     * @static
     * @private
     */
    _el_events = _eventenv.dom_map;

    return {

        /**
         * The number of times we should look for elements that are not
         * in the DOM at the time the event is requested after the document
         * has been loaded.  The default is 1000@amp;40 ms, so it will poll
         * for 40 seconds or until all outstanding handlers are bound
         * (whichever comes first).
         * @property POLL_RETRYS
         * @type int
         * @static
         * @final
         */
        POLL_RETRYS: 1000,

        /**
         * The poll interval in milliseconds
         * @property POLL_INTERVAL
         * @type int
         * @static
         * @final
         */
        POLL_INTERVAL: 40,

        /**
         * addListener/removeListener can throw errors in unexpected scenarios.
         * These errors are suppressed, the method returns false, and this property
         * is set
         * @property lastError
         * @static
         * @type Error
         */
        lastError: null,


        /**
         * poll handle
         * @property _interval
         * @static
         * @private
         */
        _interval: null,

        /**
         * document readystate poll handle
         * @property _dri
         * @static
         * @private
         */
         _dri: null,

        /**
         * True when the document is initially usable
         * @property DOMReady
         * @type boolean
         * @static
         */
        DOMReady: false,

        /**
         * @method startInterval
         * @static
         * @private
         */
        startInterval: function() {
            if (!Event._interval) {
Event._interval = setInterval(Event._poll, Event.POLL_INTERVAL);
            }
        },

        /**
         * Executes the supplied callback when the item with the supplied
         * id is found.  This is meant to be used to execute behavior as
         * soon as possible as the page loads.  If you use this after the
         * initial page load it will poll for a fixed time for the element.
         * The number of times it will poll and the frequency are
         * configurable.  By default it will poll for 10 seconds.
         *
         * <p>The callback is executed with a single parameter:
         * the custom object parameter, if provided.</p>
         *
         * @method onAvailable
         *
         * @param {string||string[]}   id the id of the element, or an array
         * of ids to look for.
         * @param {function} fn what to execute when the element is found.
         * @param {object}   p_obj an optional object to be passed back as
         *                   a parameter to fn.
         * @param {boolean|object}  p_override If set to true, fn will execute
         *                   in the context of p_obj, if set to an object it
         *                   will execute in the context of that object
         * @param checkContent {boolean} check child node readiness (onContentReady)
         * @static
         * @deprecated Use Y.on("available")
         */
        // @TODO fix arguments
        onAvailable: function(id, fn, p_obj, p_override, checkContent, compat) {

            var a = Y.Array(id), i, availHandle;

            for (i=0; i<a.length; i=i+1) {
                _avail.push({
                    id:         a[i],
                    fn:         fn,
                    obj:        p_obj,
                    override:   p_override,
                    checkReady: checkContent,
                    compat:     compat
                });
            }
            _retryCount = this.POLL_RETRYS;

            // We want the first test to be immediate, but async
            setTimeout(Event._poll, 0);

            availHandle = new Y.EventHandle({

                _delete: function() {
                    // set by the event system for lazy DOM listeners
                    if (availHandle.handle) {
                        availHandle.handle.detach();
                        return;
                    }

                    var i, j;

                    // otherwise try to remove the onAvailable listener(s)
                    for (i = 0; i < a.length; i++) {
                        for (j = 0; j < _avail.length; j++) {
                            if (a[i] === _avail[j].id) {
                                _avail.splice(j, 1);
                            }
                        }
                    }
                }

            });

            return availHandle;
        },

        /**
         * Works the same way as onAvailable, but additionally checks the
         * state of sibling elements to determine if the content of the
         * available element is safe to modify.
         *
         * <p>The callback is executed with a single parameter:
         * the custom object parameter, if provided.</p>
         *
         * @method onContentReady
         *
         * @param {string}   id the id of the element to look for.
         * @param {function} fn what to execute when the element is ready.
         * @param {object}   obj an optional object to be passed back as
         *                   a parameter to fn.
         * @param {boolean|object}  override If set to true, fn will execute
         *                   in the context of p_obj.  If an object, fn will
         *                   exectute in the context of that object
         *
         * @static
         * @deprecated Use Y.on("contentready")
         */
        // @TODO fix arguments
        onContentReady: function(id, fn, obj, override, compat) {
            return Event.onAvailable(id, fn, obj, override, true, compat);
        },

        /**
         * Adds an event listener
         *
         * @method attach
         *
         * @param {String}   type     The type of event to append
         * @param {Function} fn        The method the event invokes
         * @param {String|HTMLElement|Array|NodeList} el An id, an element
         *  reference, or a collection of ids and/or elements to assign the
         *  listener to.
         * @param {Object}   context optional context object
         * @param {Boolean|object}  args 0..n arguments to pass to the callback
         * @return {EventHandle} an object to that can be used to detach the listener
         *
         * @static
         */

        attach: function(type, fn, el, context) {
            return Event._attach(Y.Array(arguments, 0, true));
        },

        _createWrapper: function (el, type, capture, compat, facade) {

            var cewrapper,
                ek  = Y.stamp(el),
                key = 'event:' + ek + type;

            if (false === facade) {
                key += 'native';
            }
            if (capture) {
                key += 'capture';
            }


            cewrapper = _wrappers[key];


            if (!cewrapper) {
                // create CE wrapper
                cewrapper = Y.publish(key, {
                    silent: true,
                    bubbles: false,
                    emitFacade:false,
                    contextFn: function() {
                        if (compat) {
                            return cewrapper.el;
                        } else {
                            cewrapper.nodeRef = cewrapper.nodeRef || Y.one(cewrapper.el);
                            return cewrapper.nodeRef;
                        }
                    }
                });

                cewrapper.overrides = {};

                // for later removeListener calls
                cewrapper.el = el;
                cewrapper.key = key;
                cewrapper.domkey = ek;
                cewrapper.type = type;
                cewrapper.fn = function(e) {
                    cewrapper.fire(Event.getEvent(e, el, (compat || (false === facade))));
                };
                cewrapper.capture = capture;

                if (el == win && type == "load") {
                    // window load happens once
                    cewrapper.fireOnce = true;
                    _windowLoadKey = key;
                }
                cewrapper._delete = _deleteAndClean;

                _wrappers[key] = cewrapper;
                _el_events[ek] = _el_events[ek] || {};
                _el_events[ek][key] = cewrapper;

                add(el, type, cewrapper.fn, capture);
            }

            return cewrapper;

        },

        _attach: function(args, conf) {

            var compat,
                handles, oEl, cewrapper, context,
                fireNow = false, ret,
                type = args[0],
                fn = args[1],
                el = args[2] || win,
                facade = conf && conf.facade,
                capture = conf && conf.capture,
                overrides = conf && conf.overrides;

            if (args[args.length-1] === COMPAT_ARG) {
                compat = true;
            }

            if (!fn || !fn.call) {
                return false;
            }

            // The el argument can be an array of elements or element ids.
            if (shouldIterate(el)) {

                handles=[];

                Y.each(el, function(v, k) {
                    args[2] = v;
                    handles.push(Event._attach(args.slice(), conf));
                });

                // return (handles.length === 1) ? handles[0] : handles;
                return new Y.EventHandle(handles);

            // If the el argument is a string, we assume it is
            // actually the id of the element.  If the page is loaded
            // we convert el to the actual element, otherwise we
            // defer attaching the event until the element is
            // ready
            } else if (Y.Lang.isString(el)) {

                // oEl = (compat) ? Y.DOM.byId(el) : Y.Selector.query(el);

                if (compat) {
                    oEl = Y.DOM.byId(el);
                } else {

                    oEl = Y.Selector.query(el);

                    switch (oEl.length) {
                        case 0:
                            oEl = null;
                            break;
                        case 1:
                            oEl = oEl[0];
                            break;
                        default:
                            args[2] = oEl;
                            return Event._attach(args, conf);
                    }
                }

                if (oEl) {

                    el = oEl;

                // Not found = defer adding the event until the element is available
                } else {

                    ret = Event.onAvailable(el, function() {

                        ret.handle = Event._attach(args, conf);

                    }, Event, true, false, compat);

                    return ret;

                }
            }

            // Element should be an html element or node
            if (!el) {
                return false;
            }

            if (Y.Node && Y.instanceOf(el, Y.Node)) {
                el = Y.Node.getDOMNode(el);
            }

            cewrapper = Event._createWrapper(el, type, capture, compat, facade);
            if (overrides) {
                Y.mix(cewrapper.overrides, overrides);
            }

            if (el == win && type == "load") {

                // if the load is complete, fire immediately.
                // all subscribers, including the current one
                // will be notified.
                if (YUI.Env.windowLoaded) {
                    fireNow = true;
                }
            }

            if (compat) {
                args.pop();
            }

            context = args[3];

            // set context to the Node if not specified
            // ret = cewrapper.on.apply(cewrapper, trimmedArgs);
            ret = cewrapper._on(fn, context, (args.length > 4) ? args.slice(4) : null);

            if (fireNow) {
                cewrapper.fire();
            }

            return ret;

        },

        /**
         * Removes an event listener.  Supports the signature the event was bound
         * with, but the preferred way to remove listeners is using the handle
         * that is returned when using Y.on
         *
         * @method detach
         *
         * @param {String} type the type of event to remove.
         * @param {Function} fn the method the event invokes.  If fn is
         * undefined, then all event handlers for the type of event are
         * removed.
         * @param {String|HTMLElement|Array|NodeList|EventHandle} el An
         * event handle, an id, an element reference, or a collection
         * of ids and/or elements to remove the listener from.
         * @return {boolean} true if the unbind was successful, false otherwise.
         * @static
         */
        detach: function(type, fn, el, obj) {

            var args=Y.Array(arguments, 0, true), compat, l, ok, i,
                id, ce;

            if (args[args.length-1] === COMPAT_ARG) {
                compat = true;
                // args.pop();
            }

            if (type && type.detach) {
                return type.detach();
            }

            // The el argument can be a string
            if (typeof el == "string") {

                // el = (compat) ? Y.DOM.byId(el) : Y.all(el);
                if (compat) {
                    el = Y.DOM.byId(el);
                } else {
                    el = Y.Selector.query(el);
                    l = el.length;
                    if (l < 1) {
                        el = null;
                    } else if (l == 1) {
                        el = el[0];
                    }
                }
                // return Event.detach.apply(Event, args);
            }

            if (!el) {
                return false;
            }

            if (el.detach) {
                args.splice(2, 1);
                return el.detach.apply(el, args);
            // The el argument can be an array of elements or element ids.
            } else if (shouldIterate(el)) {
                ok = true;
                for (i=0, l=el.length; i<l; ++i) {
                    args[2] = el[i];
                    ok = ( Y.Event.detach.apply(Y.Event, args) && ok );
                }

                return ok;
            }

            if (!type || !fn || !fn.call) {
                return Event.purgeElement(el, false, type);
            }

            id = 'event:' + Y.stamp(el) + type;
            ce = _wrappers[id];

            if (ce) {
                return ce.detach(fn);
            } else {
                return false;
            }

        },

        /**
         * Finds the event in the window object, the caller's arguments, or
         * in the arguments of another method in the callstack.  This is
         * executed automatically for events registered through the event
         * manager, so the implementer should not normally need to execute
         * this function at all.
         * @method getEvent
         * @param {Event} e the event parameter from the handler
         * @param {HTMLElement} el the element the listener was attached to
         * @return {Event} the event
         * @static
         */
        getEvent: function(e, el, noFacade) {
            var ev = e || win.event;

            return (noFacade) ? ev :
                new Y.DOMEventFacade(ev, el, _wrappers['event:' + Y.stamp(el) + e.type]);
        },

        /**
         * Generates an unique ID for the element if it does not already
         * have one.
         * @method generateId
         * @param el the element to create the id for
         * @return {string} the resulting id of the element
         * @static
         */
        generateId: function(el) {
            return Y.DOM.generateID(el);
        },

        /**
         * We want to be able to use getElementsByTagName as a collection
         * to attach a group of events to.  Unfortunately, different
         * browsers return different types of collections.  This function
         * tests to determine if the object is array-like.  It will also
         * fail if the object is an array, but is empty.
         * @method _isValidCollection
         * @param o the object to test
         * @return {boolean} true if the object is array-like and populated
         * @deprecated was not meant to be used directly
         * @static
         * @private
         */
        _isValidCollection: shouldIterate,

        /**
         * hook up any deferred listeners
         * @method _load
         * @static
         * @private
         */
        _load: function(e) {
            if (!_loadComplete) {
                _loadComplete = true;

                // Just in case DOMReady did not go off for some reason
                // E._ready();
                if (Y.fire) {
                    Y.fire(EVENT_READY);
                }

                // Available elements may not have been detected before the
                // window load event fires. Try to find them now so that the
                // the user is more likely to get the onAvailable notifications
                // before the window load notification
                Event._poll();
            }
        },

        /**
         * Polling function that runs before the onload event fires,
         * attempting to attach to DOM Nodes as soon as they are
         * available
         * @method _poll
         * @static
         * @private
         */
        _poll: function() {
            if (Event.locked) {
                return;
            }

            if (Y.UA.ie && !YUI.Env.DOMReady) {
                // Hold off if DOMReady has not fired and check current
                // readyState to protect against the IE operation aborted
                // issue.
                Event.startInterval();
                return;
            }

            Event.locked = true;

            // keep trying until after the page is loaded.  We need to
            // check the page load state prior to trying to bind the
            // elements so that we can be certain all elements have been
            // tested appropriately
            var i, len, item, el, notAvail, executeItem,
                tryAgain = !_loadComplete;

            if (!tryAgain) {
                tryAgain = (_retryCount > 0);
            }

            // onAvailable
            notAvail = [];

            executeItem = function (el, item) {
                var context, ov = item.override;
                try {
                    if (item.compat) {
                        if (item.override) {
                            if (ov === true) {
                                context = item.obj;
                            } else {
                                context = ov;
                            }
                        } else {
                            context = el;
                        }
                        item.fn.call(context, item.obj);
                    } else {
                        context = item.obj || Y.one(el);
                        item.fn.apply(context, (Y.Lang.isArray(ov)) ? ov : []);
                    }
                } catch (e) {
                }
            };

            // onAvailable
            for (i=0,len=_avail.length; i<len; ++i) {
                item = _avail[i];
                if (item && !item.checkReady) {

                    // el = (item.compat) ? Y.DOM.byId(item.id) : Y.one(item.id);
                    el = (item.compat) ? Y.DOM.byId(item.id) : Y.Selector.query(item.id, null, true);

                    if (el) {
                        executeItem(el, item);
                        _avail[i] = null;
                    } else {
                        notAvail.push(item);
                    }
                }
            }

            // onContentReady
            for (i=0,len=_avail.length; i<len; ++i) {
                item = _avail[i];
                if (item && item.checkReady) {

                    // el = (item.compat) ? Y.DOM.byId(item.id) : Y.one(item.id);
                    el = (item.compat) ? Y.DOM.byId(item.id) : Y.Selector.query(item.id, null, true);

                    if (el) {
                        // The element is available, but not necessarily ready
                        // @todo should we test parentNode.nextSibling?
                        if (_loadComplete || (el.get && el.get('nextSibling')) || el.nextSibling) {
                            executeItem(el, item);
                            _avail[i] = null;
                        }
                    } else {
                        notAvail.push(item);
                    }
                }
            }

            _retryCount = (notAvail.length === 0) ? 0 : _retryCount - 1;

            if (tryAgain) {
                // we may need to strip the nulled out items here
                Event.startInterval();
            } else {
                clearInterval(Event._interval);
                Event._interval = null;
            }

            Event.locked = false;

            return;

        },

        /**
         * Removes all listeners attached to the given element via addListener.
         * Optionally, the node's children can also be purged.
         * Optionally, you can specify a specific type of event to remove.
         * @method purgeElement
         * @param {HTMLElement} el the element to purge
         * @param {boolean} recurse recursively purge this element's children
         * as well.  Use with caution.
         * @param {string} type optional type of listener to purge. If
         * left out, all listeners will be removed
         * @static
         */
        purgeElement: function(el, recurse, type) {
            // var oEl = (Y.Lang.isString(el)) ? Y.one(el) : el,
            var oEl = (Y.Lang.isString(el)) ?  Y.Selector.query(el, null, true) : el,
                lis = Event.getListeners(oEl, type), i, len, children, child;

            if (recurse && oEl) {
                lis = lis || [];
                children = Y.Selector.query('*', oEl);
                len = children.length;
                for (i = 0; i < len; ++i) {
                    child = Event.getListeners(children[i], type);
                    if (child) {
                        lis = lis.concat(child);
                    }
                }
            }

            if (lis) {
                for (i = 0, len = lis.length; i < len; ++i) {
                    lis[i].detachAll();
                }
            }

        },

        /**
         * Removes all object references and the DOM proxy subscription for
         * a given event for a DOM node.
         *
         * @method _clean
         * @param wrapper {CustomEvent} Custom event proxy for the DOM
         *                  subscription
         * @private
         * @static
         * @since 3.4.0
         */
        _clean: function (wrapper) {
            var key    = wrapper.key,
                domkey = wrapper.domkey;

            remove(wrapper.el, wrapper.type, wrapper.fn, wrapper.capture);
            delete _wrappers[key];
            delete Y._yuievt.events[key];
            if (_el_events[domkey]) {
                delete _el_events[domkey][key];
                if (!Y.Object.size(_el_events[domkey])) {
                    delete _el_events[domkey];
                }
            }
        },

        /**
         * Returns all listeners attached to the given element via addListener.
         * Optionally, you can specify a specific type of event to return.
         * @method getListeners
         * @param el {HTMLElement|string} the element or element id to inspect
         * @param type {string} optional type of listener to return. If
         * left out, all listeners will be returned
         * @return {CustomEvent} the custom event wrapper for the DOM event(s)
         * @static
         */
        getListeners: function(el, type) {
            var ek = Y.stamp(el, true), evts = _el_events[ek],
                results=[] , key = (type) ? 'event:' + ek + type : null,
                adapters = _eventenv.plugins;

            if (!evts) {
                return null;
            }

            if (key) {
                // look for synthetic events
                if (adapters[type] && adapters[type].eventDef) {
                    key += '_synth';
                }

                if (evts[key]) {
                    results.push(evts[key]);
                }

                // get native events as well
                key += 'native';
                if (evts[key]) {
                    results.push(evts[key]);
                }

            } else {
                Y.each(evts, function(v, k) {
                    results.push(v);
                });
            }

            return (results.length) ? results : null;
        },

        /**
         * Removes all listeners registered by pe.event.  Called
         * automatically during the unload event.
         * @method _unload
         * @static
         * @private
         */
        _unload: function(e) {
            Y.each(_wrappers, function(v, k) {
                if (v.type == 'unload') {
                    v.fire(e);
                }
                v.detachAll();
            });
            remove(win, "unload", onUnload);
        },

        /**
         * Adds a DOM event directly without the caching, cleanup, context adj, etc
         *
         * @method nativeAdd
         * @param {HTMLElement} el      the element to bind the handler to
         * @param {string}      type   the type of event handler
         * @param {function}    fn      the callback to invoke
         * @param {Boolean}      capture capture or bubble phase
         * @static
         * @private
         */
        nativeAdd: add,

        /**
         * Basic remove listener
         *
         * @method nativeRemove
         * @param {HTMLElement} el      the element to bind the handler to
         * @param {string}      type   the type of event handler
         * @param {function}    fn      the callback to invoke
         * @param {Boolean}      capture capture or bubble phase
         * @static
         * @private
         */
        nativeRemove: remove
    };

}();

Y.Event = Event;

if (config.injected || YUI.Env.windowLoaded) {
    onLoad();
} else {
    add(win, "load", onLoad);
}

// Process onAvailable/onContentReady items when when the DOM is ready in IE
if (Y.UA.ie) {
    Y.on(EVENT_READY, Event._poll);

    // In IE6 and below, detach event handlers when the page is unloaded in
    // order to try and prevent cross-page memory leaks. This isn't done in
    // other browsers because a) it's not necessary, and b) it breaks the
    // back/forward cache.
    if (Y.UA.ie < 7) {
        try {
            add(win, "unload", onUnload);
        } catch(e) {
        }
    }
}

Event.Custom = Y.CustomEvent;
Event.Subscriber = Y.Subscriber;
Event.Target = Y.EventTarget;
Event.Handle = Y.EventHandle;
Event.Facade = Y.EventFacade;

Event._poll();

}());

/**
 * DOM event listener abstraction layer
 * @module event
 * @submodule event-base
 */

/**
 * Executes the callback as soon as the specified element
 * is detected in the DOM.  This function expects a selector
 * string for the element(s) to detect.  If you already have
 * an element reference, you don't need this event.
 * @event available
 * @param type {string} 'available'
 * @param fn {function} the callback function to execute.
 * @param el {string} an selector for the element(s) to attach
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 * These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
Y.Env.evt.plugins.available = {
    on: function(type, fn, id, o) {
        var a = arguments.length > 4 ?  Y.Array(arguments, 4, true) : null;
        return Y.Event.onAvailable.call(Y.Event, id, fn, o, a);
    }
};

/**
 * Executes the callback as soon as the specified element
 * is detected in the DOM with a nextSibling property
 * (indicating that the element's children are available).
 * This function expects a selector
 * string for the element(s) to detect.  If you already have
 * an element reference, you don't need this event.
 * @event contentready
 * @param type {string} 'contentready'
 * @param fn {function} the callback function to execute.
 * @param el {string} an selector for the element(s) to attach.
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 * These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
Y.Env.evt.plugins.contentready = {
    on: function(type, fn, id, o) {
        var a = arguments.length > 4 ? Y.Array(arguments, 4, true) : null;
        return Y.Event.onContentReady.call(Y.Event, id, fn, o, a);
    }
};


}, '3.16.0', {"requires": ["event-custom-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('selector-native', function (Y, NAME) {

(function(Y) {
/**
 * The selector-native module provides support for native querySelector
 * @module dom
 * @submodule selector-native
 * @for Selector
 */

/**
 * Provides support for using CSS selectors to query the DOM
 * @class Selector
 * @static
 * @for Selector
 */

Y.namespace('Selector'); // allow native module to standalone

var COMPARE_DOCUMENT_POSITION = 'compareDocumentPosition',
    OWNER_DOCUMENT = 'ownerDocument';

var Selector = {
    _types: {
        esc: {
            token: '\uE000',
            re: /\\[:\[\]\(\)#\.\'\>+~"]/gi
        },

        attr: {
            token: '\uE001',
            re: /(\[[^\]]*\])/g
        },

        pseudo: {
            token: '\uE002',
            re: /(\([^\)]*\))/g
        }
    },

    /**
     *  Use the native version of `querySelectorAll`, if it exists.
     *
     * @property useNative
     * @default true
     * @static
     */
    useNative: true,

    _escapeId: function(id) {
        if (id) {
            id = id.replace(/([:\[\]\(\)#\.'<>+~"])/g,'\\$1');
        }
        return id;
    },

    _compare: ('sourceIndex' in Y.config.doc.documentElement) ?
        function(nodeA, nodeB) {
            var a = nodeA.sourceIndex,
                b = nodeB.sourceIndex;

            if (a === b) {
                return 0;
            } else if (a > b) {
                return 1;
            }

            return -1;

        } : (Y.config.doc.documentElement[COMPARE_DOCUMENT_POSITION] ?
        function(nodeA, nodeB) {
            if (nodeA[COMPARE_DOCUMENT_POSITION](nodeB) & 4) {
                return -1;
            } else {
                return 1;
            }
        } :
        function(nodeA, nodeB) {
            var rangeA, rangeB, compare;
            if (nodeA && nodeB) {
                rangeA = nodeA[OWNER_DOCUMENT].createRange();
                rangeA.setStart(nodeA, 0);
                rangeB = nodeB[OWNER_DOCUMENT].createRange();
                rangeB.setStart(nodeB, 0);
                compare = rangeA.compareBoundaryPoints(1, rangeB); // 1 === Range.START_TO_END
            }

            return compare;

    }),

    _sort: function(nodes) {
        if (nodes) {
            nodes = Y.Array(nodes, 0, true);
            if (nodes.sort) {
                nodes.sort(Selector._compare);
            }
        }

        return nodes;
    },

    _deDupe: function(nodes) {
        var ret = [],
            i, node;

        for (i = 0; (node = nodes[i++]);) {
            if (!node._found) {
                ret[ret.length] = node;
                node._found = true;
            }
        }

        for (i = 0; (node = ret[i++]);) {
            node._found = null;
            node.removeAttribute('_found');
        }

        return ret;
    },

    /**
     * Retrieves a set of nodes based on a given CSS selector.
     * @method query
     *
     * @param {String} selector A CSS selector.
     * @param {HTMLElement} root optional A node to start the query from. Defaults to `Y.config.doc`.
     * @param {Boolean} firstOnly optional Whether or not to return only the first match.
     * @return {HTMLElement[]} The array of nodes that matched the given selector.
     * @static
     */
    query: function(selector, root, firstOnly, skipNative) {
        root = root || Y.config.doc;
        var ret = [],
            useNative = (Y.Selector.useNative && Y.config.doc.querySelector && !skipNative),
            queries = [[selector, root]],
            query,
            result,
            i,
            fn = (useNative) ? Y.Selector._nativeQuery : Y.Selector._bruteQuery;

        if (selector && fn) {
            // split group into seperate queries
            if (!skipNative && // already done if skipping
                    (!useNative || root.tagName)) { // split native when element scoping is needed
                queries = Selector._splitQueries(selector, root);
            }

            for (i = 0; (query = queries[i++]);) {
                result = fn(query[0], query[1], firstOnly);
                if (!firstOnly) { // coerce DOM Collection to Array
                    result = Y.Array(result, 0, true);
                }
                if (result) {
                    ret = ret.concat(result);
                }
            }

            if (queries.length > 1) { // remove dupes and sort by doc order
                ret = Selector._sort(Selector._deDupe(ret));
            }
        }

        return (firstOnly) ? (ret[0] || null) : ret;

    },

    _replaceSelector: function(selector) {
        var esc = Y.Selector._parse('esc', selector), // pull escaped colon, brackets, etc.
            attrs,
            pseudos;

        // first replace escaped chars, which could be present in attrs or pseudos
        selector = Y.Selector._replace('esc', selector);

        // then replace pseudos before attrs to avoid replacing :not([foo])
        pseudos = Y.Selector._parse('pseudo', selector);
        selector = Selector._replace('pseudo', selector);

        attrs = Y.Selector._parse('attr', selector);
        selector = Y.Selector._replace('attr', selector);

        return {
            esc: esc,
            attrs: attrs,
            pseudos: pseudos,
            selector: selector
        };
    },

    _restoreSelector: function(replaced) {
        var selector = replaced.selector;
        selector = Y.Selector._restore('attr', selector, replaced.attrs);
        selector = Y.Selector._restore('pseudo', selector, replaced.pseudos);
        selector = Y.Selector._restore('esc', selector, replaced.esc);
        return selector;
    },

    _replaceCommas: function(selector) {
        var replaced = Y.Selector._replaceSelector(selector),
            selector = replaced.selector;

        if (selector) {
            selector = selector.replace(/,/g, '\uE007');
            replaced.selector = selector;
            selector = Y.Selector._restoreSelector(replaced);
        }
        return selector;
    },

    // allows element scoped queries to begin with combinator
    // e.g. query('> p', document.body) === query('body > p')
    _splitQueries: function(selector, node) {
        if (selector.indexOf(',') > -1) {
            selector = Y.Selector._replaceCommas(selector);
        }

        var groups = selector.split('\uE007'), // split on replaced comma token
            queries = [],
            prefix = '',
            id,
            i,
            len;

        if (node) {
            // enforce for element scoping
            if (node.nodeType === 1) { // Elements only
                id = Y.Selector._escapeId(Y.DOM.getId(node));

                if (!id) {
                    id = Y.guid();
                    Y.DOM.setId(node, id);
                }

                prefix = '[id="' + id + '"] ';
            }

            for (i = 0, len = groups.length; i < len; ++i) {
                selector =  prefix + groups[i];
                queries.push([selector, node]);
            }
        }

        return queries;
    },

    _nativeQuery: function(selector, root, one) {
        if (
            (Y.UA.webkit || Y.UA.opera) &&          // webkit (chrome, safari) and Opera
            selector.indexOf(':checked') > -1 &&    // fail to pick up "selected"  with ":checked"
            (Y.Selector.pseudos && Y.Selector.pseudos.checked)
        ) {
            return Y.Selector.query(selector, root, one, true); // redo with skipNative true to try brute query
        }
        try {
            return root['querySelector' + (one ? '' : 'All')](selector);
        } catch(e) { // fallback to brute if available
            return Y.Selector.query(selector, root, one, true); // redo with skipNative true
        }
    },

    /**
     * Filters out nodes that do not match the given CSS selector.
     * @method filter
     *
     * @param {HTMLElement[]} nodes An array of nodes.
     * @param {String} selector A CSS selector to test each node against.
     * @return {HTMLElement[]} The nodes that matched the given CSS selector.
     * @static
     */
    filter: function(nodes, selector) {
        var ret = [],
            i, node;

        if (nodes && selector) {
            for (i = 0; (node = nodes[i++]);) {
                if (Y.Selector.test(node, selector)) {
                    ret[ret.length] = node;
                }
            }
        } else {
        }

        return ret;
    },

    /**
     * Determines whether or not the given node matches the given CSS selector.
     * @method test
     * 
     * @param {HTMLElement} node A node to test.
     * @param {String} selector A CSS selector to test the node against.
     * @param {HTMLElement} root optional A node to start the query from. Defaults to the parent document of the node.
     * @return {Boolean} Whether or not the given node matched the given CSS selector.
     * @static
     */
    test: function(node, selector, root) {
        var ret = false,
            useFrag = false,
            groups,
            parent,
            item,
            items,
            frag,
            id,
            i, j, group;

        if (node && node.tagName) { // only test HTMLElements

            if (typeof selector == 'function') { // test with function
                ret = selector.call(node, node);
            } else { // test with query
                // we need a root if off-doc
                groups = selector.split(',');
                if (!root && !Y.DOM.inDoc(node)) {
                    parent = node.parentNode;
                    if (parent) {
                        root = parent;
                    } else { // only use frag when no parent to query
                        frag = node[OWNER_DOCUMENT].createDocumentFragment();
                        frag.appendChild(node);
                        root = frag;
                        useFrag = true;
                    }
                }
                root = root || node[OWNER_DOCUMENT];

                id = Y.Selector._escapeId(Y.DOM.getId(node));
                if (!id) {
                    id = Y.guid();
                    Y.DOM.setId(node, id);
                }

                for (i = 0; (group = groups[i++]);) { // TODO: off-dom test
                    group += '[id="' + id + '"]';
                    items = Y.Selector.query(group, root);

                    for (j = 0; item = items[j++];) {
                        if (item === node) {
                            ret = true;
                            break;
                        }
                    }
                    if (ret) {
                        break;
                    }
                }

                if (useFrag) { // cleanup
                    frag.removeChild(node);
                }
            };
        }

        return ret;
    },

    /**
     * A convenience method to emulate Y.Node's aNode.ancestor(selector).
     * @method ancestor
     *
     * @param {HTMLElement} node A node to start the query from.
     * @param {String} selector A CSS selector to test the node against.
     * @param {Boolean} testSelf optional Whether or not to include the node in the scan.
     * @return {HTMLElement} The ancestor node matching the selector, or null.
     * @static
     */
    ancestor: function (node, selector, testSelf) {
        return Y.DOM.ancestor(node, function(n) {
            return Y.Selector.test(n, selector);
        }, testSelf);
    },

    _parse: function(name, selector) {
        return selector.match(Y.Selector._types[name].re);
    },

    _replace: function(name, selector) {
        var o = Y.Selector._types[name];
        return selector.replace(o.re, o.token);
    },

    _restore: function(name, selector, items) {
        if (items) {
            var token = Y.Selector._types[name].token,
                i, len;
            for (i = 0, len = items.length; i < len; ++i) {
                selector = selector.replace(token, items[i]);
            }
        }
        return selector;
    }
};

Y.mix(Y.Selector, Selector, true);

})(Y);


}, '3.16.0', {"requires": ["dom-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('selector', function (Y, NAME) {



}, '3.16.0', {"requires": ["selector-native"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('node-core', function (Y, NAME) {

/**
 * The Node Utility provides a DOM-like interface for interacting with DOM nodes.
 * @module node
 * @main node
 * @submodule node-core
 */

/**
 * The Node class provides a wrapper for manipulating DOM Nodes.
 * Node properties can be accessed via the set/get methods.
 * Use `Y.one()` to retrieve Node instances.
 *
 * <strong>NOTE:</strong> Node properties are accessed using
 * the <code>set</code> and <code>get</code> methods.
 *
 * @class Node
 * @constructor
 * @param {HTMLElement} node the DOM node to be mapped to the Node instance.
 * @uses EventTarget
 */

// "globals"
var DOT = '.',
    NODE_NAME = 'nodeName',
    NODE_TYPE = 'nodeType',
    OWNER_DOCUMENT = 'ownerDocument',
    TAG_NAME = 'tagName',
    UID = '_yuid',
    EMPTY_OBJ = {},

    _slice = Array.prototype.slice,

    Y_DOM = Y.DOM,

    Y_Node = function(node) {
        if (!this.getDOMNode) { // support optional "new"
            return new Y_Node(node);
        }

        if (typeof node == 'string') {
            node = Y_Node._fromString(node);
            if (!node) {
                return null; // NOTE: return
            }
        }

        var uid = (node.nodeType !== 9) ? node.uniqueID : node[UID];

        if (uid && Y_Node._instances[uid] && Y_Node._instances[uid]._node !== node) {
            node[UID] = null; // unset existing uid to prevent collision (via clone or hack)
        }

        uid = uid || Y.stamp(node);
        if (!uid) { // stamp failed; likely IE non-HTMLElement
            uid = Y.guid();
        }

        this[UID] = uid;

        /**
         * The underlying DOM node bound to the Y.Node instance
         * @property _node
         * @type HTMLElement
         * @private
         */
        this._node = node;

        this._stateProxy = node; // when augmented with Attribute

        if (this._initPlugins) { // when augmented with Plugin.Host
            this._initPlugins();
        }
    },

    // used with previous/next/ancestor tests
    _wrapFn = function(fn) {
        var ret = null;
        if (fn) {
            ret = (typeof fn == 'string') ?
            function(n) {
                return Y.Selector.test(n, fn);
            } :
            function(n) {
                return fn(Y.one(n));
            };
        }

        return ret;
    };
// end "globals"

Y_Node.ATTRS = {};
Y_Node.DOM_EVENTS = {};

Y_Node._fromString = function(node) {
    if (node) {
        if (node.indexOf('doc') === 0) { // doc OR document
            node = Y.config.doc;
        } else if (node.indexOf('win') === 0) { // win OR window
            node = Y.config.win;
        } else {
            node = Y.Selector.query(node, null, true);
        }
    }

    return node || null;
};

/**
 * The name of the component
 * @static
 * @type String
 * @property NAME
 */
Y_Node.NAME = 'node';

/*
 * The pattern used to identify ARIA attributes
 */
Y_Node.re_aria = /^(?:role$|aria-)/;

Y_Node.SHOW_TRANSITION = 'fadeIn';
Y_Node.HIDE_TRANSITION = 'fadeOut';

/**
 * A list of Node instances that have been created
 * @private
 * @type Object
 * @property _instances
 * @static
 *
 */
Y_Node._instances = {};

/**
 * Retrieves the DOM node bound to a Node instance
 * @method getDOMNode
 * @static
 *
 * @param {Node|HTMLElement} node The Node instance or an HTMLElement
 * @return {HTMLElement} The DOM node bound to the Node instance.  If a DOM node is passed
 * as the node argument, it is simply returned.
 */
Y_Node.getDOMNode = function(node) {
    if (node) {
        return (node.nodeType) ? node : node._node || null;
    }
    return null;
};

/**
 * Checks Node return values and wraps DOM Nodes as Y.Node instances
 * and DOM Collections / Arrays as Y.NodeList instances.
 * Other return values just pass thru.  If undefined is returned (e.g. no return)
 * then the Node instance is returned for chainability.
 * @method scrubVal
 * @static
 *
 * @param {HTMLElement|HTMLElement[]|Node} node The Node instance or an HTMLElement
 * @return {Node | NodeList | Any} Depends on what is returned from the DOM node.
 */
Y_Node.scrubVal = function(val, node) {
    if (val) { // only truthy values are risky
         if (typeof val == 'object' || typeof val == 'function') { // safari nodeList === function
            if (NODE_TYPE in val || Y_DOM.isWindow(val)) {// node || window
                val = Y.one(val);
            } else if ((val.item && !val._nodes) || // dom collection or Node instance
                    (val[0] && val[0][NODE_TYPE])) { // array of DOM Nodes
                val = Y.all(val);
            }
        }
    } else if (typeof val === 'undefined') {
        val = node; // for chaining
    } else if (val === null) {
        val = null; // IE: DOM null not the same as null
    }

    return val;
};

/**
 * Adds methods to the Y.Node prototype, routing through scrubVal.
 * @method addMethod
 * @static
 *
 * @param {String} name The name of the method to add
 * @param {Function} fn The function that becomes the method
 * @param {Object} context An optional context to call the method with
 * (defaults to the Node instance)
 * @return {any} Depends on what is returned from the DOM node.
 */
Y_Node.addMethod = function(name, fn, context) {
    if (name && fn && typeof fn == 'function') {
        Y_Node.prototype[name] = function() {
            var args = _slice.call(arguments),
                node = this,
                ret;

            if (args[0] && args[0]._node) {
                args[0] = args[0]._node;
            }

            if (args[1] && args[1]._node) {
                args[1] = args[1]._node;
            }
            args.unshift(node._node);

            ret = fn.apply(context || node, args);

            if (ret) { // scrub truthy
                ret = Y_Node.scrubVal(ret, node);
            }

            (typeof ret != 'undefined') || (ret = node);
            return ret;
        };
    } else {
    }
};

/**
 * Imports utility methods to be added as Y.Node methods.
 * @method importMethod
 * @static
 *
 * @param {Object} host The object that contains the method to import.
 * @param {String} name The name of the method to import
 * @param {String} altName An optional name to use in place of the host name
 * @param {Object} context An optional context to call the method with
 */
Y_Node.importMethod = function(host, name, altName) {
    if (typeof name == 'string') {
        altName = altName || name;
        Y_Node.addMethod(altName, host[name], host);
    } else {
        Y.Array.each(name, function(n) {
            Y_Node.importMethod(host, n);
        });
    }
};

/**
 * Retrieves a NodeList based on the given CSS selector.
 * @method all
 *
 * @param {string} selector The CSS selector to test against.
 * @return {NodeList} A NodeList instance for the matching HTMLCollection/Array.
 * @for YUI
 */

/**
 * Returns a single Node instance bound to the node or the
 * first element matching the given selector. Returns null if no match found.
 * <strong>Note:</strong> For chaining purposes you may want to
 * use <code>Y.all</code>, which returns a NodeList when no match is found.
 * @method one
 * @param {String | HTMLElement} node a node or Selector
 * @return {Node | null} a Node instance or null if no match found.
 * @for YUI
 */

/**
 * Returns a single Node instance bound to the node or the
 * first element matching the given selector. Returns null if no match found.
 * <strong>Note:</strong> For chaining purposes you may want to
 * use <code>Y.all</code>, which returns a NodeList when no match is found.
 * @method one
 * @static
 * @param {String | HTMLElement} node a node or Selector
 * @return {Node | null} a Node instance or null if no match found.
 * @for Node
 */
Y_Node.one = function(node) {
    var instance = null,
        cachedNode,
        uid;

    if (node) {
        if (typeof node == 'string') {
            node = Y_Node._fromString(node);
            if (!node) {
                return null; // NOTE: return
            }
        } else if (node.getDOMNode) {
            return node; // NOTE: return
        }

        if (node.nodeType || Y.DOM.isWindow(node)) { // avoid bad input (numbers, boolean, etc)
            uid = (node.uniqueID && node.nodeType !== 9) ? node.uniqueID : node._yuid;
            instance = Y_Node._instances[uid]; // reuse exising instances
            cachedNode = instance ? instance._node : null;
            if (!instance || (cachedNode && node !== cachedNode)) { // new Node when nodes don't match
                instance = new Y_Node(node);
                if (node.nodeType != 11) { // dont cache document fragment
                    Y_Node._instances[instance[UID]] = instance; // cache node
                }
            }
        }
    }

    return instance;
};

/**
 * The default setter for DOM properties
 * Called with instance context (this === the Node instance)
 * @method DEFAULT_SETTER
 * @static
 * @param {String} name The attribute/property being set
 * @param {any} val The value to be set
 * @return {any} The value
 */
Y_Node.DEFAULT_SETTER = function(name, val) {
    var node = this._stateProxy,
        strPath;

    if (name.indexOf(DOT) > -1) {
        strPath = name;
        name = name.split(DOT);
        // only allow when defined on node
        Y.Object.setValue(node, name, val);
    } else if (typeof node[name] != 'undefined') { // pass thru DOM properties
        node[name] = val;
    }

    return val;
};

/**
 * The default getter for DOM properties
 * Called with instance context (this === the Node instance)
 * @method DEFAULT_GETTER
 * @static
 * @param {String} name The attribute/property to look up
 * @return {any} The current value
 */
Y_Node.DEFAULT_GETTER = function(name) {
    var node = this._stateProxy,
        val;

    if (name.indexOf && name.indexOf(DOT) > -1) {
        val = Y.Object.getValue(node, name.split(DOT));
    } else if (typeof node[name] != 'undefined') { // pass thru from DOM
        val = node[name];
    }

    return val;
};

Y.mix(Y_Node.prototype, {
    DATA_PREFIX: 'data-',

    /**
     * The method called when outputting Node instances as strings
     * @method toString
     * @return {String} A string representation of the Node instance
     */
    toString: function() {
        var str = this[UID] + ': not bound to a node',
            node = this._node,
            attrs, id, className;

        if (node) {
            attrs = node.attributes;
            id = (attrs && attrs.id) ? node.getAttribute('id') : null;
            className = (attrs && attrs.className) ? node.getAttribute('className') : null;
            str = node[NODE_NAME];

            if (id) {
                str += '#' + id;
            }

            if (className) {
                str += '.' + className.replace(' ', '.');
            }

            // TODO: add yuid?
            str += ' ' + this[UID];
        }
        return str;
    },

    /**
     * Returns an attribute value on the Node instance.
     * Unless pre-configured (via `Node.ATTRS`), get hands
     * off to the underlying DOM node.  Only valid
     * attributes/properties for the node will be queried.
     * @method get
     * @param {String} attr The attribute
     * @return {any} The current value of the attribute
     */
    get: function(attr) {
        var val;

        if (this._getAttr) { // use Attribute imple
            val = this._getAttr(attr);
        } else {
            val = this._get(attr);
        }

        if (val) {
            val = Y_Node.scrubVal(val, this);
        } else if (val === null) {
            val = null; // IE: DOM null is not true null (even though they ===)
        }
        return val;
    },

    /**
     * Helper method for get.
     * @method _get
     * @private
     * @param {String} attr The attribute
     * @return {any} The current value of the attribute
     */
    _get: function(attr) {
        var attrConfig = Y_Node.ATTRS[attr],
            val;

        if (attrConfig && attrConfig.getter) {
            val = attrConfig.getter.call(this);
        } else if (Y_Node.re_aria.test(attr)) {
            val = this._node.getAttribute(attr, 2);
        } else {
            val = Y_Node.DEFAULT_GETTER.apply(this, arguments);
        }

        return val;
    },

    /**
     * Sets an attribute on the Node instance.
     * Unless pre-configured (via Node.ATTRS), set hands
     * off to the underlying DOM node.  Only valid
     * attributes/properties for the node will be set.
     * To set custom attributes use setAttribute.
     * @method set
     * @param {String} attr The attribute to be set.
     * @param {any} val The value to set the attribute to.
     * @chainable
     */
    set: function(attr, val) {
        var attrConfig = Y_Node.ATTRS[attr];

        if (this._setAttr) { // use Attribute imple
            this._setAttr.apply(this, arguments);
        } else { // use setters inline
            if (attrConfig && attrConfig.setter) {
                attrConfig.setter.call(this, val, attr);
            } else if (Y_Node.re_aria.test(attr)) { // special case Aria
                this._node.setAttribute(attr, val);
            } else {
                Y_Node.DEFAULT_SETTER.apply(this, arguments);
            }
        }

        return this;
    },

    /**
     * Sets multiple attributes.
     * @method setAttrs
     * @param {Object} attrMap an object of name/value pairs to set
     * @chainable
     */
    setAttrs: function(attrMap) {
        if (this._setAttrs) { // use Attribute imple
            this._setAttrs(attrMap);
        } else { // use setters inline
            Y.Object.each(attrMap, function(v, n) {
                this.set(n, v);
            }, this);
        }

        return this;
    },

    /**
     * Returns an object containing the values for the requested attributes.
     * @method getAttrs
     * @param {Array} attrs an array of attributes to get values
     * @return {Object} An object with attribute name/value pairs.
     */
    getAttrs: function(attrs) {
        var ret = {};
        if (this._getAttrs) { // use Attribute imple
            this._getAttrs(attrs);
        } else { // use setters inline
            Y.Array.each(attrs, function(v, n) {
                ret[v] = this.get(v);
            }, this);
        }

        return ret;
    },

    /**
     * Compares nodes to determine if they match.
     * Node instances can be compared to each other and/or HTMLElements.
     * @method compareTo
     * @param {HTMLElement | Node} refNode The reference node to compare to the node.
     * @return {Boolean} True if the nodes match, false if they do not.
     */
    compareTo: function(refNode) {
        var node = this._node;

        if (refNode && refNode._node) {
            refNode = refNode._node;
        }
        return node === refNode;
    },

    /**
     * Determines whether the node is appended to the document.
     * @method inDoc
     * @param {Node|HTMLElement} doc optional An optional document to check against.
     * Defaults to current document.
     * @return {Boolean} Whether or not this node is appended to the document.
     */
    inDoc: function(doc) {
        var node = this._node;

        if (node) {
            doc = (doc) ? doc._node || doc : node[OWNER_DOCUMENT];
            if (doc.documentElement) {
                return Y_DOM.contains(doc.documentElement, node);
            }
        }

        return false;
    },

    getById: function(id) {
        var node = this._node,
            ret = Y_DOM.byId(id, node[OWNER_DOCUMENT]);
        if (ret && Y_DOM.contains(node, ret)) {
            ret = Y.one(ret);
        } else {
            ret = null;
        }
        return ret;
    },

   /**
     * Returns the nearest ancestor that passes the test applied by supplied boolean method.
     * @method ancestor
     * @param {String | Function} fn A selector string or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * If fn is not passed as an argument, the parent node will be returned.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * @param {String | Function} stopFn optional A selector string or boolean
     * method to indicate when the search should stop. The search bails when the function
     * returns true or the selector matches.
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {Node} The matching Node instance or null if not found
     */
    ancestor: function(fn, testSelf, stopFn) {
        // testSelf is optional, check for stopFn as 2nd arg
        if (arguments.length === 2 &&
                (typeof testSelf == 'string' || typeof testSelf == 'function')) {
            stopFn = testSelf;
        }

        return Y.one(Y_DOM.ancestor(this._node, _wrapFn(fn), testSelf, _wrapFn(stopFn)));
    },

   /**
     * Returns the ancestors that pass the test applied by supplied boolean method.
     * @method ancestors
     * @param {String | Function} fn A selector string or boolean method for testing elements.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {NodeList} A NodeList instance containing the matching elements
     */
    ancestors: function(fn, testSelf, stopFn) {
        if (arguments.length === 2 &&
                (typeof testSelf == 'string' || typeof testSelf == 'function')) {
            stopFn = testSelf;
        }
        return Y.all(Y_DOM.ancestors(this._node, _wrapFn(fn), testSelf, _wrapFn(stopFn)));
    },

    /**
     * Returns the previous matching sibling.
     * Returns the nearest element node sibling if no method provided.
     * @method previous
     * @param {String | Function} fn A selector or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * @param {Boolean} [all] Whether text nodes as well as element nodes should be returned, or
     * just element nodes will be returned(default)
     * @return {Node} Node instance or null if not found
     */
    previous: function(fn, all) {
        return Y.one(Y_DOM.elementByAxis(this._node, 'previousSibling', _wrapFn(fn), all));
    },

    /**
     * Returns the next matching sibling.
     * Returns the nearest element node sibling if no method provided.
     * @method next
     * @param {String | Function} fn A selector or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * @param {Boolean} [all] Whether text nodes as well as element nodes should be returned, or
     * just element nodes will be returned(default)
     * @return {Node} Node instance or null if not found
     */
    next: function(fn, all) {
        return Y.one(Y_DOM.elementByAxis(this._node, 'nextSibling', _wrapFn(fn), all));
    },

    /**
     * Returns all matching siblings.
     * Returns all siblings if no method provided.
     * @method siblings
     * @param {String | Function} fn A selector or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {NodeList} NodeList instance bound to found siblings
     */
    siblings: function(fn) {
        return Y.all(Y_DOM.siblings(this._node, _wrapFn(fn)));
    },

    /**
     * Retrieves a single Node instance, the first element matching the given
     * CSS selector.
     * Returns null if no match found.
     * @method one
     *
     * @param {string} selector The CSS selector to test against.
     * @return {Node | null} A Node instance for the matching HTMLElement or null
     * if no match found.
     */
    one: function(selector) {
        return Y.one(Y.Selector.query(selector, this._node, true));
    },

    /**
     * Retrieves a NodeList based on the given CSS selector.
     * @method all
     *
     * @param {string} selector The CSS selector to test against.
     * @return {NodeList} A NodeList instance for the matching HTMLCollection/Array.
     */
    all: function(selector) {
        var nodelist;

        if (this._node) {
            nodelist = Y.all(Y.Selector.query(selector, this._node));
            nodelist._query = selector;
            nodelist._queryRoot = this._node;
        }

        return nodelist || Y.all([]);
    },

    // TODO: allow fn test
    /**
     * Test if the supplied node matches the supplied selector.
     * @method test
     *
     * @param {string} selector The CSS selector to test against.
     * @return {boolean} Whether or not the node matches the selector.
     */
    test: function(selector) {
        return Y.Selector.test(this._node, selector);
    },

    /**
     * Removes the node from its parent.
     * Shortcut for myNode.get('parentNode').removeChild(myNode);
     * @method remove
     * @param {Boolean} destroy whether or not to call destroy() on the node
     * after removal.
     * @chainable
     *
     */
    remove: function(destroy) {
        var node = this._node;

        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }

        if (destroy) {
            this.destroy();
        }

        return this;
    },

    /**
     * Replace the node with the other node. This is a DOM update only
     * and does not change the node bound to the Node instance.
     * Shortcut for myNode.get('parentNode').replaceChild(newNode, myNode);
     * @method replace
     * @param {Node | HTMLElement} newNode Node to be inserted
     * @chainable
     *
     */
    replace: function(newNode) {
        var node = this._node;
        if (typeof newNode == 'string') {
            newNode = Y_Node.create(newNode);
        }
        node.parentNode.replaceChild(Y_Node.getDOMNode(newNode), node);
        return this;
    },

    /**
     * @method replaceChild
     * @for Node
     * @param {String | HTMLElement | Node} node Node to be inserted
     * @param {HTMLElement | Node} refNode Node to be replaced
     * @return {Node} The replaced node
     */
    replaceChild: function(node, refNode) {
        if (typeof node == 'string') {
            node = Y_DOM.create(node);
        }

        return Y.one(this._node.replaceChild(Y_Node.getDOMNode(node), Y_Node.getDOMNode(refNode)));
    },

    /**
     * Nulls internal node references, removes any plugins and event listeners.
     * Note that destroy() will not remove the node from its parent or from the DOM. For that
     * functionality, call remove(true).
     * @method destroy
     * @param {Boolean} recursivePurge (optional) Whether or not to remove listeners from the
     * node's subtree (default is false)
     *
     */
    destroy: function(recursive) {
        var UID = Y.config.doc.uniqueID ? 'uniqueID' : '_yuid',
            instance;

        this.purge(); // TODO: only remove events add via this Node

        if (this.unplug) { // may not be a PluginHost
            this.unplug();
        }

        this.clearData();

        if (recursive) {
            Y.NodeList.each(this.all('*'), function(node) {
                instance = Y_Node._instances[node[UID]];
                if (instance) {
                   instance.destroy();
                } else { // purge in case added by other means
                    Y.Event.purgeElement(node);
                }
            });
        }

        this._node = null;
        this._stateProxy = null;

        delete Y_Node._instances[this._yuid];
    },

    /**
     * Invokes a method on the Node instance
     * @method invoke
     * @param {String} method The name of the method to invoke
     * @param {any} [args*] Arguments to invoke the method with.
     * @return {any} Whatever the underly method returns.
     * DOM Nodes and Collections return values
     * are converted to Node/NodeList instances.
     *
     */
    invoke: function(method, a, b, c, d, e) {
        var node = this._node,
            ret;

        if (a && a._node) {
            a = a._node;
        }

        if (b && b._node) {
            b = b._node;
        }

        ret = node[method](a, b, c, d, e);
        return Y_Node.scrubVal(ret, this);
    },

    /**
    * @method swap
    * @description Swap DOM locations with the given node.
    * This does not change which DOM node each Node instance refers to.
    * @param {Node} otherNode The node to swap with
     * @chainable
    */
    swap: Y.config.doc.documentElement.swapNode ?
        function(otherNode) {
            this._node.swapNode(Y_Node.getDOMNode(otherNode));
        } :
        function(otherNode) {
            otherNode = Y_Node.getDOMNode(otherNode);
            var node = this._node,
                parent = otherNode.parentNode,
                nextSibling = otherNode.nextSibling;

            if (nextSibling === node) {
                parent.insertBefore(node, otherNode);
            } else if (otherNode === node.nextSibling) {
                parent.insertBefore(otherNode, node);
            } else {
                node.parentNode.replaceChild(otherNode, node);
                Y_DOM.addHTML(parent, node, nextSibling);
            }
            return this;
        },


    hasMethod: function(method) {
        var node = this._node;
        return !!(node && method in node &&
                typeof node[method] != 'unknown' &&
            (typeof node[method] == 'function' ||
                String(node[method]).indexOf('function') === 1)); // IE reports as object, prepends space
    },

    isFragment: function() {
        return (this.get('nodeType') === 11);
    },

    /**
     * Removes and destroys all of the nodes within the node.
     * @method empty
     * @chainable
     */
    empty: function() {
        this.get('childNodes').remove().destroy(true);
        return this;
    },

    /**
     * Returns the DOM node bound to the Node instance
     * @method getDOMNode
     * @return {HTMLElement}
     */
    getDOMNode: function() {
        return this._node;
    }
}, true);

Y.Node = Y_Node;
Y.one = Y_Node.one;
/**
 * The NodeList module provides support for managing collections of Nodes.
 * @module node
 * @submodule node-core
 */

/**
 * The NodeList class provides a wrapper for manipulating DOM NodeLists.
 * NodeList properties can be accessed via the set/get methods.
 * Use Y.all() to retrieve NodeList instances.
 *
 * @class NodeList
 * @constructor
 * @param nodes {String|element|Node|Array} A selector, DOM element, Node, list of DOM elements, or list of Nodes with which to populate this NodeList.
 */

var NodeList = function(nodes) {
    var tmp = [];

    if (nodes) {
        if (typeof nodes === 'string') { // selector query
            this._query = nodes;
            nodes = Y.Selector.query(nodes);
        } else if (nodes.nodeType || Y_DOM.isWindow(nodes)) { // domNode || window
            nodes = [nodes];
        } else if (nodes._node) { // Y.Node
            nodes = [nodes._node];
        } else if (nodes[0] && nodes[0]._node) { // allow array of Y.Nodes
            Y.Array.each(nodes, function(node) {
                if (node._node) {
                    tmp.push(node._node);
                }
            });
            nodes = tmp;
        } else { // array of domNodes or domNodeList (no mixed array of Y.Node/domNodes)
            nodes = Y.Array(nodes, 0, true);
        }
    }

    /**
     * The underlying array of DOM nodes bound to the Y.NodeList instance
     * @property _nodes
     * @private
     */
    this._nodes = nodes || [];
};

NodeList.NAME = 'NodeList';

/**
 * Retrieves the DOM nodes bound to a NodeList instance
 * @method getDOMNodes
 * @static
 *
 * @param {NodeList} nodelist The NodeList instance
 * @return {Array} The array of DOM nodes bound to the NodeList
 */
NodeList.getDOMNodes = function(nodelist) {
    return (nodelist && nodelist._nodes) ? nodelist._nodes : nodelist;
};

NodeList.each = function(instance, fn, context) {
    var nodes = instance._nodes;
    if (nodes && nodes.length) {
        Y.Array.each(nodes, fn, context || instance);
    } else {
    }
};

NodeList.addMethod = function(name, fn, context) {
    if (name && fn) {
        NodeList.prototype[name] = function() {
            var ret = [],
                args = arguments;

            Y.Array.each(this._nodes, function(node) {
                var UID = (node.uniqueID && node.nodeType !== 9 ) ? 'uniqueID' : '_yuid',
                    instance = Y.Node._instances[node[UID]],
                    ctx,
                    result;

                if (!instance) {
                    instance = NodeList._getTempNode(node);
                }
                ctx = context || instance;
                result = fn.apply(ctx, args);
                if (result !== undefined && result !== instance) {
                    ret[ret.length] = result;
                }
            });

            // TODO: remove tmp pointer
            return ret.length ? ret : this;
        };
    } else {
    }
};

NodeList.importMethod = function(host, name, altName) {
    if (typeof name === 'string') {
        altName = altName || name;
        NodeList.addMethod(name, host[name]);
    } else {
        Y.Array.each(name, function(n) {
            NodeList.importMethod(host, n);
        });
    }
};

NodeList._getTempNode = function(node) {
    var tmp = NodeList._tempNode;
    if (!tmp) {
        tmp = Y.Node.create('<div></div>');
        NodeList._tempNode = tmp;
    }

    tmp._node = node;
    tmp._stateProxy = node;
    return tmp;
};

Y.mix(NodeList.prototype, {
    _invoke: function(method, args, getter) {
        var ret = (getter) ? [] : this;

        this.each(function(node) {
            var val = node[method].apply(node, args);
            if (getter) {
                ret.push(val);
            }
        });

        return ret;
    },

    /**
     * Retrieves the Node instance at the given index.
     * @method item
     *
     * @param {Number} index The index of the target Node.
     * @return {Node} The Node instance at the given index.
     */
    item: function(index) {
        return Y.one((this._nodes || [])[index]);
    },

    /**
     * Applies the given function to each Node in the NodeList.
     * @method each
     * @param {Function} fn The function to apply. It receives 3 arguments:
     * the current node instance, the node's index, and the NodeList instance
     * @param {Object} context optional An optional context to apply the function with
     * Default context is the current Node instance
     * @chainable
     */
    each: function(fn, context) {
        var instance = this;
        Y.Array.each(this._nodes, function(node, index) {
            node = Y.one(node);
            return fn.call(context || node, node, index, instance);
        });
        return instance;
    },

    batch: function(fn, context) {
        var nodelist = this;

        Y.Array.each(this._nodes, function(node, index) {
            var instance = Y.Node._instances[node[UID]];
            if (!instance) {
                instance = NodeList._getTempNode(node);
            }

            return fn.call(context || instance, instance, index, nodelist);
        });
        return nodelist;
    },

    /**
     * Executes the function once for each node until a true value is returned.
     * @method some
     * @param {Function} fn The function to apply. It receives 3 arguments:
     * the current node instance, the node's index, and the NodeList instance
     * @param {Object} context optional An optional context to execute the function from.
     * Default context is the current Node instance
     * @return {Boolean} Whether or not the function returned true for any node.
     */
    some: function(fn, context) {
        var instance = this;
        return Y.Array.some(this._nodes, function(node, index) {
            node = Y.one(node);
            context = context || node;
            return fn.call(context, node, index, instance);
        });
    },

    /**
     * Creates a documenFragment from the nodes bound to the NodeList instance
     * @method toFrag
     * @return {Node} a Node instance bound to the documentFragment
     */
    toFrag: function() {
        return Y.one(Y.DOM._nl2frag(this._nodes));
    },

    /**
     * Returns the index of the node in the NodeList instance
     * or -1 if the node isn't found.
     * @method indexOf
     * @param {Node | HTMLElement} node the node to search for
     * @return {Number} the index of the node value or -1 if not found
     */
    indexOf: function(node) {
        return Y.Array.indexOf(this._nodes, Y.Node.getDOMNode(node));
    },

    /**
     * Filters the NodeList instance down to only nodes matching the given selector.
     * @method filter
     * @param {String} selector The selector to filter against
     * @return {NodeList} NodeList containing the updated collection
     * @see Selector
     */
    filter: function(selector) {
        return Y.all(Y.Selector.filter(this._nodes, selector));
    },


    /**
     * Creates a new NodeList containing all nodes at every n indices, where
     * remainder n % index equals r.
     * (zero-based index).
     * @method modulus
     * @param {Number} n The offset to use (return every nth node)
     * @param {Number} r An optional remainder to use with the modulus operation (defaults to zero)
     * @return {NodeList} NodeList containing the updated collection
     */
    modulus: function(n, r) {
        r = r || 0;
        var nodes = [];
        NodeList.each(this, function(node, i) {
            if (i % n === r) {
                nodes.push(node);
            }
        });

        return Y.all(nodes);
    },

    /**
     * Creates a new NodeList containing all nodes at odd indices
     * (zero-based index).
     * @method odd
     * @return {NodeList} NodeList containing the updated collection
     */
    odd: function() {
        return this.modulus(2, 1);
    },

    /**
     * Creates a new NodeList containing all nodes at even indices
     * (zero-based index), including zero.
     * @method even
     * @return {NodeList} NodeList containing the updated collection
     */
    even: function() {
        return this.modulus(2);
    },

    destructor: function() {
    },

    /**
     * Reruns the initial query, when created using a selector query
     * @method refresh
     * @chainable
     */
    refresh: function() {
        var doc,
            nodes = this._nodes,
            query = this._query,
            root = this._queryRoot;

        if (query) {
            if (!root) {
                if (nodes && nodes[0] && nodes[0].ownerDocument) {
                    root = nodes[0].ownerDocument;
                }
            }

            this._nodes = Y.Selector.query(query, root);
        }

        return this;
    },

    /**
     * Returns the current number of items in the NodeList.
     * @method size
     * @return {Number} The number of items in the NodeList.
     */
    size: function() {
        return this._nodes.length;
    },

    /**
     * Determines if the instance is bound to any nodes
     * @method isEmpty
     * @return {Boolean} Whether or not the NodeList is bound to any nodes
     */
    isEmpty: function() {
        return this._nodes.length < 1;
    },

    toString: function() {
        var str = '',
            errorMsg = this[UID] + ': not bound to any nodes',
            nodes = this._nodes,
            node;

        if (nodes && nodes[0]) {
            node = nodes[0];
            str += node[NODE_NAME];
            if (node.id) {
                str += '#' + node.id;
            }

            if (node.className) {
                str += '.' + node.className.replace(' ', '.');
            }

            if (nodes.length > 1) {
                str += '...[' + nodes.length + ' items]';
            }
        }
        return str || errorMsg;
    },

    /**
     * Returns the DOM node bound to the Node instance
     * @method getDOMNodes
     * @return {Array}
     */
    getDOMNodes: function() {
        return this._nodes;
    }
}, true);

NodeList.importMethod(Y.Node.prototype, [
     /**
      * Called on each Node instance. Nulls internal node references,
      * removes any plugins and event listeners
      * @method destroy
      * @param {Boolean} recursivePurge (optional) Whether or not to
      * remove listeners from the node's subtree (default is false)
      * @see Node.destroy
      */
    'destroy',

     /**
      * Called on each Node instance. Removes and destroys all of the nodes
      * within the node
      * @method empty
      * @chainable
      * @see Node.empty
      */
    'empty',

     /**
      * Called on each Node instance. Removes the node from its parent.
      * Shortcut for myNode.get('parentNode').removeChild(myNode);
      * @method remove
      * @param {Boolean} destroy whether or not to call destroy() on the node
      * after removal.
      * @chainable
      * @see Node.remove
      */
    'remove',

     /**
      * Called on each Node instance. Sets an attribute on the Node instance.
      * Unless pre-configured (via Node.ATTRS), set hands
      * off to the underlying DOM node.  Only valid
      * attributes/properties for the node will be set.
      * To set custom attributes use setAttribute.
      * @method set
      * @param {String} attr The attribute to be set.
      * @param {any} val The value to set the attribute to.
      * @chainable
      * @see Node.set
      */
    'set'
]);

// one-off implementation to convert array of Nodes to NodeList
// e.g. Y.all('input').get('parentNode');

/** Called on each Node instance
  * @method get
  * @see Node
  */
NodeList.prototype.get = function(attr) {
    var ret = [],
        nodes = this._nodes,
        isNodeList = false,
        getTemp = NodeList._getTempNode,
        instance,
        val;

    if (nodes[0]) {
        instance = Y.Node._instances[nodes[0]._yuid] || getTemp(nodes[0]);
        val = instance._get(attr);
        if (val && val.nodeType) {
            isNodeList = true;
        }
    }

    Y.Array.each(nodes, function(node) {
        instance = Y.Node._instances[node._yuid];

        if (!instance) {
            instance = getTemp(node);
        }

        val = instance._get(attr);
        if (!isNodeList) { // convert array of Nodes to NodeList
            val = Y.Node.scrubVal(val, instance);
        }

        ret.push(val);
    });

    return (isNodeList) ? Y.all(ret) : ret;
};

Y.NodeList = NodeList;

Y.all = function(nodes) {
    return new NodeList(nodes);
};

Y.Node.all = Y.all;
/**
 * @module node
 * @submodule node-core
 */

var Y_NodeList = Y.NodeList,
    ArrayProto = Array.prototype,
    ArrayMethods = {
        /** Returns a new NodeList combining the given NodeList(s)
          * @for NodeList
          * @method concat
          * @param {NodeList | Array} valueN Arrays/NodeLists and/or values to
          * concatenate to the resulting NodeList
          * @return {NodeList} A new NodeList comprised of this NodeList joined with the input.
          */
        'concat': 1,
        /** Removes the last from the NodeList and returns it.
          * @for NodeList
          * @method pop
          * @return {Node | null} The last item in the NodeList, or null if the list is empty.
          */
        'pop': 0,
        /** Adds the given Node(s) to the end of the NodeList.
          * @for NodeList
          * @method push
          * @param {Node | HTMLElement} nodes One or more nodes to add to the end of the NodeList.
          */
        'push': 0,
        /** Removes the first item from the NodeList and returns it.
          * @for NodeList
          * @method shift
          * @return {Node | null} The first item in the NodeList, or null if the NodeList is empty.
          */
        'shift': 0,
        /** Returns a new NodeList comprising the Nodes in the given range.
          * @for NodeList
          * @method slice
          * @param {Number} begin Zero-based index at which to begin extraction.
          As a negative index, start indicates an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element in the sequence.
          * @param {Number} end Zero-based index at which to end extraction. slice extracts up to but not including end.
          slice(1,4) extracts the second element through the fourth element (elements indexed 1, 2, and 3).
          As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
          If end is omitted, slice extracts to the end of the sequence.
          * @return {NodeList} A new NodeList comprised of this NodeList joined with the input.
          */
        'slice': 1,
        /** Changes the content of the NodeList, adding new elements while removing old elements.
          * @for NodeList
          * @method splice
          * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end.
          * @param {Number} howMany An integer indicating the number of old array elements to remove. If howMany is 0, no elements are removed. In this case, you should specify at least one new element. If no howMany parameter is specified (second syntax above, which is a SpiderMonkey extension), all elements after index are removed.
          * {Node | HTMLElement| element1, ..., elementN
          The elements to add to the array. If you don't specify any elements, splice simply removes elements from the array.
          * @return {NodeList} The element(s) removed.
          */
        'splice': 1,
        /** Adds the given Node(s) to the beginning of the NodeList.
          * @for NodeList
          * @method unshift
          * @param {Node | HTMLElement} nodes One or more nodes to add to the NodeList.
          */
        'unshift': 0
    };


Y.Object.each(ArrayMethods, function(returnNodeList, name) {
    Y_NodeList.prototype[name] = function() {
        var args = [],
            i = 0,
            arg,
            ret;

        while (typeof (arg = arguments[i++]) != 'undefined') { // use DOM nodes/nodeLists
            args.push(arg._node || arg._nodes || arg);
        }

        ret = ArrayProto[name].apply(this._nodes, args);

        if (returnNodeList) {
            ret = Y.all(ret);
        } else {
            ret = Y.Node.scrubVal(ret);
        }

        return ret;
    };
});
/**
 * @module node
 * @submodule node-core
 */

Y.Array.each([
    /**
     * Passes through to DOM method.
     * @for Node
     * @method removeChild
     * @param {HTMLElement | Node} node Node to be removed
     * @return {Node} The removed node
     */
    'removeChild',

    /**
     * Passes through to DOM method.
     * @method hasChildNodes
     * @return {Boolean} Whether or not the node has any childNodes
     */
    'hasChildNodes',

    /**
     * Passes through to DOM method.
     * @method cloneNode
     * @param {Boolean} deep Whether or not to perform a deep clone, which includes
     * subtree and attributes
     * @return {Node} The clone
     */
    'cloneNode',

    /**
     * Passes through to DOM method.
     * @method hasAttribute
     * @param {String} attribute The attribute to test for
     * @return {Boolean} Whether or not the attribute is present
     */
    'hasAttribute',

    /**
     * Passes through to DOM method.
     * @method scrollIntoView
     * @chainable
     */
    'scrollIntoView',

    /**
     * Passes through to DOM method.
     * @method getElementsByTagName
     * @param {String} tagName The tagName to collect
     * @return {NodeList} A NodeList representing the HTMLCollection
     */
    'getElementsByTagName',

    /**
     * Passes through to DOM method.
     * @method focus
     * @chainable
     */
    'focus',

    /**
     * Passes through to DOM method.
     * @method blur
     * @chainable
     */
    'blur',

    /**
     * Passes through to DOM method.
     * Only valid on FORM elements
     * @method submit
     * @chainable
     */
    'submit',

    /**
     * Passes through to DOM method.
     * Only valid on FORM elements
     * @method reset
     * @chainable
     */
    'reset',

    /**
     * Passes through to DOM method.
     * @method select
     * @chainable
     */
     'select',

    /**
     * Passes through to DOM method.
     * Only valid on TABLE elements
     * @method createCaption
     * @chainable
     */
    'createCaption'

], function(method) {
    Y.Node.prototype[method] = function(arg1, arg2, arg3) {
        var ret = this.invoke(method, arg1, arg2, arg3);
        return ret;
    };
});

/**
 * Passes through to DOM method.
 * @method removeAttribute
 * @param {String} attribute The attribute to be removed
 * @chainable
 */
 // one-off implementation due to IE returning boolean, breaking chaining
Y.Node.prototype.removeAttribute = function(attr) {
    var node = this._node;
    if (node) {
        node.removeAttribute(attr, 0); // comma zero for IE < 8 to force case-insensitive
    }

    return this;
};

Y.Node.importMethod(Y.DOM, [
    /**
     * Determines whether the node is an ancestor of another HTML element in the DOM hierarchy.
     * @method contains
     * @param {Node | HTMLElement} needle The possible node or descendent
     * @return {Boolean} Whether or not this node is the needle its ancestor
     */
    'contains',
    /**
     * Allows setting attributes on DOM nodes, normalizing in some cases.
     * This passes through to the DOM node, allowing for custom attributes.
     * @method setAttribute
     * @for Node
     * @chainable
     * @param {string} name The attribute name
     * @param {string} value The value to set
     */
    'setAttribute',
    /**
     * Allows getting attributes on DOM nodes, normalizing in some cases.
     * This passes through to the DOM node, allowing for custom attributes.
     * @method getAttribute
     * @for Node
     * @param {string} name The attribute name
     * @return {string} The attribute value
     */
    'getAttribute',

    /**
     * Wraps the given HTML around the node.
     * @method wrap
     * @param {String} html The markup to wrap around the node.
     * @chainable
     * @for Node
     */
    'wrap',

    /**
     * Removes the node's parent node.
     * @method unwrap
     * @chainable
     */
    'unwrap',

    /**
     * Applies a unique ID to the node if none exists
     * @method generateID
     * @return {String} The existing or generated ID
     */
    'generateID'
]);

Y.NodeList.importMethod(Y.Node.prototype, [
/**
 * Allows getting attributes on DOM nodes, normalizing in some cases.
 * This passes through to the DOM node, allowing for custom attributes.
 * @method getAttribute
 * @see Node
 * @for NodeList
 * @param {string} name The attribute name
 * @return {string} The attribute value
 */

    'getAttribute',
/**
 * Allows setting attributes on DOM nodes, normalizing in some cases.
 * This passes through to the DOM node, allowing for custom attributes.
 * @method setAttribute
 * @see Node
 * @for NodeList
 * @chainable
 * @param {string} name The attribute name
 * @param {string} value The value to set
 */
    'setAttribute',

/**
 * Allows for removing attributes on DOM nodes.
 * This passes through to the DOM node, allowing for custom attributes.
 * @method removeAttribute
 * @see Node
 * @for NodeList
 * @param {string} name The attribute to remove
 */
    'removeAttribute',
/**
 * Removes the parent node from node in the list.
 * @method unwrap
 * @chainable
 */
    'unwrap',
/**
 * Wraps the given HTML around each node.
 * @method wrap
 * @param {String} html The markup to wrap around the node.
 * @chainable
 */
    'wrap',

/**
 * Applies a unique ID to each node if none exists
 * @method generateID
 * @return {String} The existing or generated ID
 */
    'generateID'
]);


}, '3.16.0', {"requires": ["dom-core", "selector"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('node-base', function (Y, NAME) {

/**
 * @module node
 * @submodule node-base
 */

var methods = [
/**
 * Determines whether the node has the given className.
 * @method hasClass
 * @for Node
 * @param {String} className the class name to search for
 * @return {Boolean} Whether or not the node has the specified class
 */
 'hasClass',

/**
 * Adds a class name to the node.
 * @method addClass
 * @param {String} className the class name to add to the node's class attribute
 * @chainable
 */
 'addClass',

/**
 * Removes a class name from the node.
 * @method removeClass
 * @param {String} className the class name to remove from the node's class attribute
 * @chainable
 */
 'removeClass',

/**
 * Replace a class with another class on the node.
 * If no oldClassName is present, the newClassName is simply added.
 * @method replaceClass
 * @param {String} oldClassName the class name to be replaced
 * @param {String} newClassName the class name that will be replacing the old class name
 * @chainable
 */
 'replaceClass',

/**
 * If the className exists on the node it is removed, if it doesn't exist it is added.
 * @method toggleClass
 * @param {String} className the class name to be toggled
 * @param {Boolean} force Option to force adding or removing the class.
 * @chainable
 */
 'toggleClass'
];

Y.Node.importMethod(Y.DOM, methods);
/**
 * Determines whether each node has the given className.
 * @method hasClass
 * @see Node.hasClass
 * @for NodeList
 * @param {String} className the class name to search for
 * @return {Array} An array of booleans for each node bound to the NodeList.
 */

/**
 * Adds a class name to each node.
 * @method addClass
 * @see Node.addClass
 * @param {String} className the class name to add to each node's class attribute
 * @chainable
 */

/**
 * Removes a class name from each node.
 * @method removeClass
 * @see Node.removeClass
 * @param {String} className the class name to remove from each node's class attribute
 * @chainable
 */

/**
 * Replace a class with another class for each node.
 * If no oldClassName is present, the newClassName is simply added.
 * @method replaceClass
 * @see Node.replaceClass
 * @param {String} oldClassName the class name to be replaced
 * @param {String} newClassName the class name that will be replacing the old class name
 * @chainable
 */

/**
 * For each node, if the className exists on the node it is removed, if it doesn't exist it is added.
 * @method toggleClass
 * @see Node.toggleClass
 * @param {String} className the class name to be toggled
 * @chainable
 */
Y.NodeList.importMethod(Y.Node.prototype, methods);
/**
 * @module node
 * @submodule node-base
 */

var Y_Node = Y.Node,
    Y_DOM = Y.DOM;

/**
 * Returns a new dom node using the provided markup string.
 * @method create
 * @static
 * @param {String} html The markup used to create the element.
 * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
 * to escape html content.
 * @param {HTMLDocument} doc An optional document context
 * @return {Node} A Node instance bound to a DOM node or fragment
 * @for Node
 */
Y_Node.create = function(html, doc) {
    if (doc && doc._node) {
        doc = doc._node;
    }
    return Y.one(Y_DOM.create(html, doc));
};

Y.mix(Y_Node.prototype, {
    /**
     * Creates a new Node using the provided markup string.
     * @method create
     * @param {String} html The markup used to create the element.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content.
     * @param {HTMLDocument} doc An optional document context
     * @return {Node} A Node instance bound to a DOM node or fragment
     */
    create: Y_Node.create,

    /**
     * Inserts the content before the reference node.
     * @method insert
     * @param {String | Node | HTMLElement | NodeList | HTMLCollection} content The content to insert.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content.
     * @param {Int | Node | HTMLElement | String} where The position to insert at.
     * Possible "where" arguments
     * <dl>
     * <dt>Y.Node</dt>
     * <dd>The Node to insert before</dd>
     * <dt>HTMLElement</dt>
     * <dd>The element to insert before</dd>
     * <dt>Int</dt>
     * <dd>The index of the child element to insert before</dd>
     * <dt>"replace"</dt>
     * <dd>Replaces the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts before the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts content before the node</dd>
     * <dt>"after"</dt>
     * <dd>Inserts content after the node</dd>
     * </dl>
     * @chainable
     */
    insert: function(content, where) {
        this._insert(content, where);
        return this;
    },

    _insert: function(content, where) {
        var node = this._node,
            ret = null;

        if (typeof where == 'number') { // allow index
            where = this._node.childNodes[where];
        } else if (where && where._node) { // Node
            where = where._node;
        }

        if (content && typeof content != 'string') { // allow Node or NodeList/Array instances
            content = content._node || content._nodes || content;
        }
        ret = Y_DOM.addHTML(node, content, where);

        return ret;
    },

    /**
     * Inserts the content as the firstChild of the node.
     * @method prepend
     * @param {String | Node | HTMLElement} content The content to insert.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content.
     * @chainable
     */
    prepend: function(content) {
        return this.insert(content, 0);
    },

    /**
     * Inserts the content as the lastChild of the node.
     * @method append
     * @param {String | Node | HTMLElement} content The content to insert.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content.
     * @chainable
     */
    append: function(content) {
        return this.insert(content, null);
    },

    /**
     * @method appendChild
     * @param {String | HTMLElement | Node} node Node to be appended.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content.
     * @return {Node} The appended node
     */
    appendChild: function(node) {
        return Y_Node.scrubVal(this._insert(node));
    },

    /**
     * @method insertBefore
     * @param {String | HTMLElement | Node} newNode Node to be appended
     * @param {HTMLElement | Node} refNode Node to be inserted before.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content.
     * @return {Node} The inserted node
     */
    insertBefore: function(newNode, refNode) {
        return Y.Node.scrubVal(this._insert(newNode, refNode));
    },

    /**
     * Appends the node to the given node.
     * @example
     *      // appendTo returns the node that has been created beforehand
     *      Y.Node.create('<p></p>').appendTo('body').set('text', 'hello world!');
     * @method appendTo
     * @param {Node | HTMLElement | String} node The node to append to.
     *  If `node` is a string it will be considered as a css selector and only the first matching node will be used.
     * @chainable
     */
    appendTo: function(node) {
        Y.one(node).append(this);
        return this;
    },
    
    // This method is deprecated, and is intentionally left undocumented.
    // Use `setHTML` instead.
    setContent: function(content) {
        this._insert(content, 'replace');
        return this;
    },
    
    // This method is deprecated, and is intentionally left undocumented.
    // Use `getHTML` instead.
    getContent: function() {
        var node = this;

        if (node._node.nodeType === 11) { // 11 === Node.DOCUMENT_FRAGMENT_NODE
            // "this", when it is a document fragment, must be cloned because
            // the nodes contained in the fragment actually disappear once
            // the fragment is appended anywhere
            node = node.create("<div/>").append(node.cloneNode(true));
        }

        return node.get("innerHTML");
    }
});

/**
 * Replaces the node's current html content with the content provided.
 * Note that this passes to innerHTML and is not escaped.
 * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
 * to escape html content or `set('text')` to add as text.
 * @method setHTML
 * @param {String | Node | HTMLElement | NodeList | HTMLCollection} content The content to insert
 * @chainable
 */
Y.Node.prototype.setHTML = Y.Node.prototype.setContent;

/**
 * Returns the node's current html content (e.g. innerHTML)
 * @method getHTML
 * @return {String} The html content
 */
Y.Node.prototype.getHTML = Y.Node.prototype.getContent;

Y.NodeList.importMethod(Y.Node.prototype, [
    /**
     * Called on each Node instance
     * @for NodeList
     * @method append
     * @see Node.append
     */
    'append',

    /**
     * Called on each Node instance
     * @for NodeList
     * @method insert
     * @see Node.insert
     */
    'insert',

    /**
     * Called on each Node instance
     * @for NodeList
     * @method appendChild
     * @see Node.appendChild
     */
    'appendChild',

    /**
     * Called on each Node instance
     * @for NodeList
     * @method insertBefore
     * @see Node.insertBefore
     */
    'insertBefore',

    /**
     * Called on each Node instance
     * @for NodeList
     * @method prepend
     * @see Node.prepend
     */
    'prepend',

    'setContent',

    'getContent',

    /**
     * Called on each Node instance
     * Note that this passes to innerHTML and is not escaped.
     * Use <a href="../classes/Escape.html#method_html">`Y.Escape.html()`</a>
     * to escape html content or `set('text')` to add as text.
     * @for NodeList
     * @method setHTML
     * @see Node.setHTML
     */
    'setHTML',

    /**
     * Called on each Node instance
     * @for NodeList
     * @method getHTML
     * @see Node.getHTML
     */
    'getHTML'
]);
/**
 * @module node
 * @submodule node-base
 */

var Y_Node = Y.Node,
    Y_DOM = Y.DOM;

/**
 * Static collection of configuration attributes for special handling
 * @property ATTRS
 * @static
 * @type object
 */
Y_Node.ATTRS = {
    /**
     * Allows for getting and setting the text of an element.
     * Formatting is preserved and special characters are treated literally.
     * @config text
     * @type String
     */
    text: {
        getter: function() {
            return Y_DOM.getText(this._node);
        },

        setter: function(content) {
            Y_DOM.setText(this._node, content);
            return content;
        }
    },

    /**
     * Allows for getting and setting the text of an element.
     * Formatting is preserved and special characters are treated literally.
     * @config for
     * @type String
     */
    'for': {
        getter: function() {
            return Y_DOM.getAttribute(this._node, 'for');
        },

        setter: function(val) {
            Y_DOM.setAttribute(this._node, 'for', val);
            return val;
        }
    },

    'options': {
        getter: function() {
            return this._node.getElementsByTagName('option');
        }
    },

    /**
     * Returns a NodeList instance of all HTMLElement children.
     * @readOnly
     * @config children
     * @type NodeList
     */
    'children': {
        getter: function() {
            var node = this._node,
                children = node.children,
                childNodes, i, len;

            if (!children) {
                childNodes = node.childNodes;
                children = [];

                for (i = 0, len = childNodes.length; i < len; ++i) {
                    if (childNodes[i].tagName) {
                        children[children.length] = childNodes[i];
                    }
                }
            }
            return Y.all(children);
        }
    },

    value: {
        getter: function() {
            return Y_DOM.getValue(this._node);
        },

        setter: function(val) {
            Y_DOM.setValue(this._node, val);
            return val;
        }
    }
};

Y.Node.importMethod(Y.DOM, [
    /**
     * Allows setting attributes on DOM nodes, normalizing in some cases.
     * This passes through to the DOM node, allowing for custom attributes.
     * @method setAttribute
     * @for Node
     * @for NodeList
     * @chainable
     * @param {string} name The attribute name
     * @param {string} value The value to set
     */
    'setAttribute',
    /**
     * Allows getting attributes on DOM nodes, normalizing in some cases.
     * This passes through to the DOM node, allowing for custom attributes.
     * @method getAttribute
     * @for Node
     * @for NodeList
     * @param {string} name The attribute name
     * @return {string} The attribute value
     */
    'getAttribute'

]);
/**
 * @module node
 * @submodule node-base
 */

var Y_Node = Y.Node;
var Y_NodeList = Y.NodeList;
/**
 * List of events that route to DOM events
 * @static
 * @property DOM_EVENTS
 * @for Node
 */

Y_Node.DOM_EVENTS = {
    abort: 1,
    beforeunload: 1,
    blur: 1,
    change: 1,
    click: 1,
    close: 1,
    command: 1,
    contextmenu: 1,
    copy: 1,
    cut: 1,
    dblclick: 1,
    DOMMouseScroll: 1,
    drag: 1,
    dragstart: 1,
    dragenter: 1,
    dragover: 1,
    dragleave: 1,
    dragend: 1,
    drop: 1,
    error: 1,
    focus: 1,
    key: 1,
    keydown: 1,
    keypress: 1,
    keyup: 1,
    load: 1,
    message: 1,
    mousedown: 1,
    mouseenter: 1,
    mouseleave: 1,
    mousemove: 1,
    mousemultiwheel: 1,
    mouseout: 1,
    mouseover: 1,
    mouseup: 1,
    mousewheel: 1,
    orientationchange: 1,
    paste: 1,
    reset: 1,
    resize: 1,
    select: 1,
    selectstart: 1,
    submit: 1,
    scroll: 1,
    textInput: 1,
    unload: 1
};

// Add custom event adaptors to this list.  This will make it so
// that delegate, key, available, contentready, etc all will
// be available through Node.on
Y.mix(Y_Node.DOM_EVENTS, Y.Env.evt.plugins);

Y.augment(Y_Node, Y.EventTarget);

Y.mix(Y_Node.prototype, {
    /**
     * Removes event listeners from the node and (optionally) its subtree
     * @method purge
     * @param {Boolean} recurse (optional) Whether or not to remove listeners from the
     * node's subtree
     * @param {String} type (optional) Only remove listeners of the specified type
     * @chainable
     *
     */
    purge: function(recurse, type) {
        Y.Event.purgeElement(this._node, recurse, type);
        return this;
    }

});

Y.mix(Y.NodeList.prototype, {
    _prepEvtArgs: function(type, fn, context) {
        // map to Y.on/after signature (type, fn, nodes, context, arg1, arg2, etc)
        var args = Y.Array(arguments, 0, true);

        if (args.length < 2) { // type only (event hash) just add nodes
            args[2] = this._nodes;
        } else {
            args.splice(2, 0, this._nodes);
        }

        args[3] = context || this; // default to NodeList instance as context

        return args;
    },

    /**
    Subscribe a callback function for each `Node` in the collection to execute
    in response to a DOM event.

    NOTE: Generally, the `on()` method should be avoided on `NodeLists`, in
    favor of using event delegation from a parent Node.  See the Event user
    guide for details.

    Most DOM events are associated with a preventable default behavior, such as
    link clicks navigating to a new page.  Callbacks are passed a
    `DOMEventFacade` object as their first argument (usually called `e`) that
    can be used to prevent this default behavior with `e.preventDefault()`. See
    the `DOMEventFacade` API for all available properties and methods on the
    object.

    By default, the `this` object will be the `NodeList` that the subscription
    came from, <em>not the `Node` that received the event</em>.  Use
    `e.currentTarget` to refer to the `Node`.

    Returning `false` from a callback is supported as an alternative to calling
    `e.preventDefault(); e.stopPropagation();`.  However, it is recommended to
    use the event methods.

    @example

        Y.all(".sku").on("keydown", function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();

                // Use e.currentTarget to refer to the individual Node
                var item = Y.MyApp.searchInventory( e.currentTarget.get('value') );
                // etc ...
            }
        });

    @method on
    @param {String} type The name of the event
    @param {Function} fn The callback to execute in response to the event
    @param {Object} [context] Override `this` object in callback
    @param {Any} [arg*] 0..n additional arguments to supply to the subscriber
    @return {EventHandle} A subscription handle capable of detaching that
                          subscription
    @for NodeList
    **/
    on: function(type, fn, context) {
        return Y.on.apply(Y, this._prepEvtArgs.apply(this, arguments));
    },

    /**
     * Applies an one-time event listener to each Node bound to the NodeList.
     * @method once
     * @param {String} type The event being listened for
     * @param {Function} fn The handler to call when the event fires
     * @param {Object} context The context to call the handler with.
     * Default is the NodeList instance.
     * @return {EventHandle} A subscription handle capable of detaching that
     *                    subscription
     * @for NodeList
     */
    once: function(type, fn, context) {
        return Y.once.apply(Y, this._prepEvtArgs.apply(this, arguments));
    },

    /**
     * Applies an event listener to each Node bound to the NodeList.
     * The handler is called only after all on() handlers are called
     * and the event is not prevented.
     * @method after
     * @param {String} type The event being listened for
     * @param {Function} fn The handler to call when the event fires
     * @param {Object} context The context to call the handler with.
     * Default is the NodeList instance.
     * @return {EventHandle} A subscription handle capable of detaching that
     *                    subscription
     * @for NodeList
     */
    after: function(type, fn, context) {
        return Y.after.apply(Y, this._prepEvtArgs.apply(this, arguments));
    },

    /**
     * Applies an one-time event listener to each Node bound to the NodeList
     * that will be called only after all on() handlers are called and the
     * event is not prevented.
     *
     * @method onceAfter
     * @param {String} type The event being listened for
     * @param {Function} fn The handler to call when the event fires
     * @param {Object} context The context to call the handler with.
     * Default is the NodeList instance.
     * @return {EventHandle} A subscription handle capable of detaching that
     *                    subscription
     * @for NodeList
     */
    onceAfter: function(type, fn, context) {
        return Y.onceAfter.apply(Y, this._prepEvtArgs.apply(this, arguments));
    }
});

Y_NodeList.importMethod(Y.Node.prototype, [
    /**
      * Called on each Node instance
      * @method detach
      * @see Node.detach
      * @for NodeList
      */
    'detach',

    /** Called on each Node instance
      * @method detachAll
      * @see Node.detachAll
      * @for NodeList
      */
    'detachAll'
]);

/**
Subscribe a callback function to execute in response to a DOM event or custom
event.

Most DOM events are associated with a preventable default behavior such as
link clicks navigating to a new page.  Callbacks are passed a `DOMEventFacade`
object as their first argument (usually called `e`) that can be used to
prevent this default behavior with `e.preventDefault()`. See the
`DOMEventFacade` API for all available properties and methods on the object.

If the event name passed as the first parameter is not a whitelisted DOM event,
it will be treated as a custom event subscriptions, allowing
`node.fire('customEventName')` later in the code.  Refer to the Event user guide
for the full DOM event whitelist.

By default, the `this` object in the callback will refer to the subscribed
`Node`.

Returning `false` from a callback is supported as an alternative to calling
`e.preventDefault(); e.stopPropagation();`.  However, it is recommended to use
the event methods.

@example

    Y.one("#my-form").on("submit", function (e) {
        e.preventDefault();

        // proceed with ajax form submission instead...
    });

@method on
@param {String} type The name of the event
@param {Function} fn The callback to execute in response to the event
@param {Object} [context] Override `this` object in callback
@param {Any} [arg*] 0..n additional arguments to supply to the subscriber
@return {EventHandle} A subscription handle capable of detaching that
                      subscription
@for Node
**/

Y.mix(Y.Node.ATTRS, {
    offsetHeight: {
        setter: function(h) {
            Y.DOM.setHeight(this._node, h);
            return h;
        },

        getter: function() {
            return this._node.offsetHeight;
        }
    },

    offsetWidth: {
        setter: function(w) {
            Y.DOM.setWidth(this._node, w);
            return w;
        },

        getter: function() {
            return this._node.offsetWidth;
        }
    }
});

Y.mix(Y.Node.prototype, {
    sizeTo: function(w, h) {
        var node;
        if (arguments.length < 2) {
            node = Y.one(w);
            w = node.get('offsetWidth');
            h = node.get('offsetHeight');
        }

        this.setAttrs({
            offsetWidth: w,
            offsetHeight: h
        });
    }
});

if (!Y.config.doc.documentElement.hasAttribute) { // IE < 8
    Y.Node.prototype.hasAttribute = function(attr) {
        if (attr === 'value') {
            if (this.get('value') !== "") { // IE < 8 fails to populate specified when set in HTML
                return true;
            }
        }
        return !!(this._node.attributes[attr] &&
                this._node.attributes[attr].specified);
    };
}

// IE throws an error when calling focus() on an element that's invisible, not
// displayed, or disabled.
Y.Node.prototype.focus = function () {
    try {
        this._node.focus();
    } catch (e) {
    }

    return this;
};

// IE throws error when setting input.type = 'hidden',
// input.setAttribute('type', 'hidden') and input.attributes.type.value = 'hidden'
Y.Node.ATTRS.type = {
    setter: function(val) {
        if (val === 'hidden') {
            try {
                this._node.type = 'hidden';
            } catch(e) {
                this._node.style.display = 'none';
                this._inputType = 'hidden';
            }
        } else {
            try { // IE errors when changing the type from "hidden'
                this._node.type = val;
            } catch (e) {
            }
        }
        return val;
    },

    getter: function() {
        return this._inputType || this._node.type;
    },

    _bypassProxy: true // don't update DOM when using with Attribute
};

if (Y.config.doc.createElement('form').elements.nodeType) {
    // IE: elements collection is also FORM node which trips up scrubVal.
    Y.Node.ATTRS.elements = {
            getter: function() {
                return this.all('input, textarea, button, select');
            }
    };
}
/**
 * Provides methods for managing custom Node data.
 *
 * @module node
 * @main node
 * @submodule node-data
 */

Y.mix(Y.Node.prototype, {
    _initData: function() {
        if (! ('_data' in this)) {
            this._data = {};
        }
    },

    /**
    * @method getData
    * @for Node
    * @description Retrieves arbitrary data stored on a Node instance.
    * If no data is associated with the Node, it will attempt to retrieve
    * a value from the corresponding HTML data attribute. (e.g. node.getData('foo')
    * will check node.getAttribute('data-foo')).
    * @param {string} name Optional name of the data field to retrieve.
    * If no name is given, all data is returned.
    * @return {any | Object} Whatever is stored at the given field,
    * or an object hash of all fields.
    */
    getData: function(name) {
        this._initData();
        var data = this._data,
            ret = data;

        if (arguments.length) { // single field
            if (name in data) {
                ret = data[name];
            } else { // initialize from HTML attribute
                ret = this._getDataAttribute(name);
            }
        } else if (typeof data == 'object' && data !== null) { // all fields
            ret = {};
            Y.Object.each(data, function(v, n) {
                ret[n] = v;
            });

            ret = this._getDataAttributes(ret);
        }

        return ret;

    },

    _getDataAttributes: function(ret) {
        ret = ret || {};
        var i = 0,
            attrs = this._node.attributes,
            len = attrs.length,
            prefix = this.DATA_PREFIX,
            prefixLength = prefix.length,
            name;

        while (i < len) {
            name = attrs[i].name;
            if (name.indexOf(prefix) === 0) {
                name = name.substr(prefixLength);
                if (!(name in ret)) { // only merge if not already stored
                    ret[name] = this._getDataAttribute(name);
                }
            }

            i += 1;
        }

        return ret;
    },

    _getDataAttribute: function(name) {
        name = this.DATA_PREFIX + name;

        var node = this._node,
            attrs = node.attributes,
            data = attrs && attrs[name] && attrs[name].value;

        return data;
    },

    /**
    * @method setData
    * @for Node
    * @description Stores arbitrary data on a Node instance.
    * This is not stored with the DOM node.
    * @param {string} name The name of the field to set. If no val
    * is given, name is treated as the data and overrides any existing data.
    * @param {any} val The value to be assigned to the field.
    * @chainable
    */
    setData: function(name, val) {
        this._initData();
        if (arguments.length > 1) {
            this._data[name] = val;
        } else {
            this._data = name;
        }

       return this;
    },

    /**
    * @method clearData
    * @for Node
    * @description Clears internally stored data.
    * @param {string} name The name of the field to clear. If no name
    * is given, all data is cleared.
    * @chainable
    */
    clearData: function(name) {
        if ('_data' in this) {
            if (typeof name != 'undefined') {
                delete this._data[name];
            } else {
                delete this._data;
            }
        }

        return this;
    }
});

Y.mix(Y.NodeList.prototype, {
    /**
    * @method getData
    * @for NodeList
    * @description Retrieves arbitrary data stored on each Node instance
    * bound to the NodeList.
    * @see Node
    * @param {string} name Optional name of the data field to retrieve.
    * If no name is given, all data is returned.
    * @return {Array} An array containing all of the data for each Node instance.
    * or an object hash of all fields.
    */
    getData: function(name) {
        var args = (arguments.length) ? [name] : [];
        return this._invoke('getData', args, true);
    },

    /**
    * @method setData
    * @for NodeList
    * @description Stores arbitrary data on each Node instance bound to the
    *  NodeList. This is not stored with the DOM node.
    * @param {string} name The name of the field to set. If no name
    * is given, name is treated as the data and overrides any existing data.
    * @param {any} val The value to be assigned to the field.
    * @chainable
    */
    setData: function(name, val) {
        var args = (arguments.length > 1) ? [name, val] : [name];
        return this._invoke('setData', args);
    },

    /**
    * @method clearData
    * @for NodeList
    * @description Clears data on all Node instances bound to the NodeList.
    * @param {string} name The name of the field to clear. If no name
    * is given, all data is cleared.
    * @chainable
    */
    clearData: function(name) {
        var args = (arguments.length) ? [name] : [];
        return this._invoke('clearData', [name]);
    }
});


}, '3.16.0', {"requires": ["event-base", "node-core", "dom-base", "dom-style"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('node-style', function (Y, NAME) {

(function(Y) {
/**
 * Extended Node interface for managing node styles.
 * @module node
 * @submodule node-style
 */

Y.mix(Y.Node.prototype, {
    /**
     * Sets a style property of the node.
     * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
     * @method setStyle
     * @param {String} attr The style attribute to set.
     * @param {String|Number} val The value.
     * @chainable
     */
    setStyle: function(attr, val) {
        Y.DOM.setStyle(this._node, attr, val);
        return this;
    },

    /**
     * Sets multiple style properties on the node.
     * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
     * @method setStyles
     * @param {Object} hash An object literal of property:value pairs.
     * @chainable
     */
    setStyles: function(hash) {
        Y.DOM.setStyles(this._node, hash);
        return this;
    },

    /**
     * Returns the style's current value.
     * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
     * @method getStyle
     * @for Node
     * @param {String} attr The style attribute to retrieve.
     * @return {String} The current value of the style property for the element.
     */

     getStyle: function(attr) {
        return Y.DOM.getStyle(this._node, attr);
     },

    /**
     * Returns the computed value for the given style property.
     * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
     * @method getComputedStyle
     * @param {String} attr The style attribute to retrieve.
     * @return {String} The computed value of the style property for the element.
     */
     getComputedStyle: function(attr) {
        return Y.DOM.getComputedStyle(this._node, attr);
     }
});

/**
 * Returns an array of values for each node.
 * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
 * @method getStyle
 * @for NodeList
 * @see Node.getStyle
 * @param {String} attr The style attribute to retrieve.
 * @return {Array} The current values of the style property for the element.
 */

/**
 * Returns an array of the computed value for each node.
 * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
 * @method getComputedStyle
 * @see Node.getComputedStyle
 * @param {String} attr The style attribute to retrieve.
 * @return {Array} The computed values for each node.
 */

/**
 * Sets a style property on each node.
 * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
 * @method setStyle
 * @see Node.setStyle
 * @param {String} attr The style attribute to set.
 * @param {String|Number} val The value.
 * @chainable
 */

/**
 * Sets multiple style properties on each node.
 * Use camelCase (e.g. 'backgroundColor') for multi-word properties.
 * @method setStyles
 * @see Node.setStyles
 * @param {Object} hash An object literal of property:value pairs.
 * @chainable
 */

// These are broken out to handle undefined return (avoid false positive for
// chainable)

Y.NodeList.importMethod(Y.Node.prototype, ['getStyle', 'getComputedStyle', 'setStyle', 'setStyles']);
})(Y);
/**
 * @module node
 * @submodule node-base
 */

var Y_Node = Y.Node;

Y.mix(Y_Node.prototype, {
    /**
     * Makes the node visible.
     * If the "transition" module is loaded, show optionally
     * animates the showing of the node using either the default
     * transition effect ('fadeIn'), or the given named effect.
     * @method show
     * @for Node
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    show: function(callback) {
        callback = arguments[arguments.length - 1];
        this.toggleView(true, callback);
        return this;
    },

    /**
     * The implementation for showing nodes.
     * Default is to remove the hidden attribute and reset the CSS style.display property.
     * @method _show
     * @protected
     * @chainable
     */
    _show: function() {
        this.removeAttribute('hidden');

        // For back-compat we need to leave this in for browsers that
        // do not visually hide a node via the hidden attribute
        // and for users that check visibility based on style display.
        this.setStyle('display', '');

    },

    /**
    Returns whether the node is hidden by YUI or not. The hidden status is
    determined by the 'hidden' attribute and the value of the 'display' CSS
    property.

    @method _isHidden
    @return {Boolean} `true` if the node is hidden.
    @private
    **/
    _isHidden: function() {
        return  this.hasAttribute('hidden') || Y.DOM.getComputedStyle(this._node, 'display') === 'none';
    },

    /**
     * Displays or hides the node.
     * If the "transition" module is loaded, toggleView optionally
     * animates the toggling of the node using given named effect.
     * @method toggleView
     * @for Node
     * @param {Boolean} [on] An optional boolean value to force the node to be shown or hidden
     * @param {Function} [callback] An optional function to run after the transition completes.
     * @chainable
     */
    toggleView: function(on, callback) {
        this._toggleView.apply(this, arguments);
        return this;
    },

    _toggleView: function(on, callback) {
        callback = arguments[arguments.length - 1];

        // base on current state if not forcing
        if (typeof on != 'boolean') {
            on = (this._isHidden()) ? 1 : 0;
        }

        if (on) {
            this._show();
        }  else {
            this._hide();
        }

        if (typeof callback == 'function') {
            callback.call(this);
        }

        return this;
    },

    /**
     * Hides the node.
     * If the "transition" module is loaded, hide optionally
     * animates the hiding of the node using either the default
     * transition effect ('fadeOut'), or the given named effect.
     * @method hide
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    hide: function(callback) {
        callback = arguments[arguments.length - 1];
        this.toggleView(false, callback);
        return this;
    },

    /**
     * The implementation for hiding nodes.
     * Default is to set the hidden attribute to true and set the CSS style.display to 'none'.
     * @method _hide
     * @protected
     * @chainable
     */
    _hide: function() {
        this.setAttribute('hidden', 'hidden');

        // For back-compat we need to leave this in for browsers that
        // do not visually hide a node via the hidden attribute
        // and for users that check visibility based on style display.
        this.setStyle('display', 'none');
    }
});

Y.NodeList.importMethod(Y.Node.prototype, [
    /**
     * Makes each node visible.
     * If the "transition" module is loaded, show optionally
     * animates the showing of the node using either the default
     * transition effect ('fadeIn'), or the given named effect.
     * @method show
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @for NodeList
     * @chainable
     */
    'show',

    /**
     * Hides each node.
     * If the "transition" module is loaded, hide optionally
     * animates the hiding of the node using either the default
     * transition effect ('fadeOut'), or the given named effect.
     * @method hide
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    'hide',

    /**
     * Displays or hides each node.
     * If the "transition" module is loaded, toggleView optionally
     * animates the toggling of the nodes using given named effect.
     * @method toggleView
     * @param {Boolean} [on] An optional boolean value to force the nodes to be shown or hidden
     * @param {Function} [callback] An optional function to run after the transition completes.
     * @chainable
     */
    'toggleView'
]);


}, '3.16.0', {"requires": ["dom-style", "node-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('anim-base', function (Y, NAME) {

/**
* The Animation Utility provides an API for creating advanced transitions.
* @module anim
*/

/**
* Provides the base Anim class, for animating numeric properties.
*
* @module anim
* @submodule anim-base
*/

    /**
     * A class for constructing animation instances.
     * @class Anim
     * @for Anim
     * @constructor
     * @extends Base
     */

    var RUNNING = 'running',
        START_TIME = 'startTime',
        ELAPSED_TIME = 'elapsedTime',
        /**
        * @for Anim
        * @event start
        * @description fires when an animation begins.
        * @param {Event} ev The start event.
        * @type Event.Custom
        */
        START = 'start',

        /**
        * @event tween
        * @description fires every frame of the animation.
        * @param {Event} ev The tween event.
        * @type Event.Custom
        */
        TWEEN = 'tween',

        /**
        * @event end
        * @description fires after the animation completes.
        * @param {Event} ev The end event.
        * @type Event.Custom
        */
        END = 'end',
        NODE = 'node',
        PAUSED = 'paused',
        REVERSE = 'reverse', // TODO: cleanup
        ITERATION_COUNT = 'iterationCount',

        NUM = Number;

    var _running = {},
        _timer;

    Y.Anim = function() {
        Y.Anim.superclass.constructor.apply(this, arguments);
        Y.Anim._instances[Y.stamp(this)] = this;
    };

    Y.Anim.NAME = 'anim';

    Y.Anim._instances = {};

    /**
     * Regex of properties that should use the default unit.
     *
     * @property RE_DEFAULT_UNIT
     * @static
     */
    Y.Anim.RE_DEFAULT_UNIT = /^width|height|top|right|bottom|left|margin.*|padding.*|border.*$/i;

    /**
     * The default unit to use with properties that pass the RE_DEFAULT_UNIT test.
     *
     * @property DEFAULT_UNIT
     * @static
     */
    Y.Anim.DEFAULT_UNIT = 'px';

    Y.Anim.DEFAULT_EASING = function (t, b, c, d) {
        return c * t / d + b; // linear easing
    };

    /**
     * Time in milliseconds passed to setInterval for frame processing
     *
     * @property intervalTime
     * @default 20
     * @static
     */
    Y.Anim._intervalTime = 20;

    /**
     * Bucket for custom getters and setters
     *
     * @property behaviors
     * @static
     */
    Y.Anim.behaviors = {
        left: {
            get: function(anim, attr) {
                return anim._getOffset(attr);
            }
        }
    };

    Y.Anim.behaviors.top = Y.Anim.behaviors.left;

    /**
     * The default setter to use when setting object properties.
     *
     * @property DEFAULT_SETTER
     * @static
     */
    Y.Anim.DEFAULT_SETTER = function(anim, att, from, to, elapsed, duration, fn, unit) {
        var node = anim._node,
            domNode = node._node,
            val = fn(elapsed, NUM(from), NUM(to) - NUM(from), duration);

        if (domNode) {
            if ('style' in domNode && (att in domNode.style || att in Y.DOM.CUSTOM_STYLES)) {
                unit = unit || '';
                node.setStyle(att, val + unit);
            } else if ('attributes' in domNode && att in domNode.attributes) {
                node.setAttribute(att, val);
            } else if (att in domNode) {
                domNode[att] = val;
            }
        } else if (node.set) {
            node.set(att, val);
        } else if (att in node) {
            node[att] = val;
        }
    };

    /**
     * The default getter to use when getting object properties.
     *
     * @property DEFAULT_GETTER
     * @static
     */
    Y.Anim.DEFAULT_GETTER = function(anim, att) {
        var node = anim._node,
            domNode = node._node,
            val = '';

        if (domNode) {
            if ('style' in domNode && (att in domNode.style || att in Y.DOM.CUSTOM_STYLES)) {
                val = node.getComputedStyle(att);
            } else if ('attributes' in domNode && att in domNode.attributes) {
                val = node.getAttribute(att);
            } else if (att in domNode) {
                val = domNode[att];
            }
        } else if (node.get) {
            val = node.get(att);
        } else if (att in node) {
            val = node[att];
        }

        return val;
    };

    Y.Anim.ATTRS = {
        /**
         * The object to be animated.
         * @attribute node
         * @type Node
         */
        node: {
            setter: function(node) {
                if (node) {
                    if (typeof node === 'string' || node.nodeType) {
                        node = Y.one(node);
                    }
                }

                this._node = node;
                if (!node) {
                }
                return node;
            }
        },

        /**
         * The length of the animation.  Defaults to "1" (second).
         * @attribute duration
         * @type NUM
         */
        duration: {
            value: 1
        },

        /**
         * The method that will provide values to the attribute(s) during the animation.
         * Defaults to "Easing.easeNone".
         * @attribute easing
         * @type Function
         */
        easing: {
            value: Y.Anim.DEFAULT_EASING,

            setter: function(val) {
                if (typeof val === 'string' && Y.Easing) {
                    return Y.Easing[val];
                }
            }
        },

        /**
         * The starting values for the animated properties.
         *
         * Fields may be strings, numbers, or functions.
         * If a function is used, the return value becomes the from value.
         * If no from value is specified, the DEFAULT_GETTER will be used.
         * Supports any unit, provided it matches the "to" (or default)
         * unit (e.g. `{width: '10em', color: 'rgb(0, 0, 0)', borderColor: '#ccc'}`).
         *
         * If using the default ('px' for length-based units), the unit may be omitted
         * (e.g. `{width: 100}, borderColor: 'ccc'}`, which defaults to pixels
         * and hex, respectively).
         *
         * @attribute from
         * @type Object
         */
        from: {},

        /**
         * The ending values for the animated properties.
         *
         * Fields may be strings, numbers, or functions.
         * Supports any unit, provided it matches the "from" (or default)
         * unit (e.g. `{width: '50%', color: 'red', borderColor: '#ccc'}`).
         *
         * If using the default ('px' for length-based units), the unit may be omitted
         * (e.g. `{width: 100, borderColor: 'ccc'}`, which defaults to pixels
         * and hex, respectively).
         *
         * @attribute to
         * @type Object
         */
        to: {},

        /**
         * Date stamp for the first frame of the animation.
         * @attribute startTime
         * @type Int
         * @default 0
         * @readOnly
         */
        startTime: {
            value: 0,
            readOnly: true
        },

        /**
         * Current time the animation has been running.
         * @attribute elapsedTime
         * @type Int
         * @default 0
         * @readOnly
         */
        elapsedTime: {
            value: 0,
            readOnly: true
        },

        /**
         * Whether or not the animation is currently running.
         * @attribute running
         * @type Boolean
         * @default false
         * @readOnly
         */
        running: {
            getter: function() {
                return !!_running[Y.stamp(this)];
            },
            value: false,
            readOnly: true
        },

        /**
         * The number of times the animation should run
         * @attribute iterations
         * @type Int
         * @default 1
         */
        iterations: {
            value: 1
        },

        /**
         * The number of iterations that have occurred.
         * Resets when an animation ends (reaches iteration count or stop() called).
         * @attribute iterationCount
         * @type Int
         * @default 0
         * @readOnly
         */
        iterationCount: {
            value: 0,
            readOnly: true
        },

        /**
         * How iterations of the animation should behave.
         * Possible values are "normal" and "alternate".
         * Normal will repeat the animation, alternate will reverse on every other pass.
         *
         * @attribute direction
         * @type String
         * @default "normal"
         */
        direction: {
            value: 'normal' // | alternate (fwd on odd, rev on even per spec)
        },

        /**
         * Whether or not the animation is currently paused.
         * @attribute paused
         * @type Boolean
         * @default false
         * @readOnly
         */
        paused: {
            readOnly: true,
            value: false
        },

        /**
         * If true, the `from` and `to` attributes are swapped, 
         * and the animation is then run starting from `from`.
         * @attribute reverse
         * @type Boolean
         * @default false
         */
        reverse: {
            value: false
        }


    };

    /**
     * Runs all animation instances.
     * @method run
     * @static
     */
    Y.Anim.run = function() {
        var instances = Y.Anim._instances,
            i;
        for (i in instances) {
            if (instances[i].run) {
                instances[i].run();
            }
        }
    };

    /**
     * Pauses all animation instances.
     * @method pause
     * @static
     */
    Y.Anim.pause = function() {
        for (var i in _running) { // stop timer if nothing running
            if (_running[i].pause) {
                _running[i].pause();
            }
        }

        Y.Anim._stopTimer();
    };

    /**
     * Stops all animation instances.
     * @method stop
     * @static
     */
    Y.Anim.stop = function() {
        for (var i in _running) { // stop timer if nothing running
            if (_running[i].stop) {
                _running[i].stop();
            }
        }
        Y.Anim._stopTimer();
    };

    Y.Anim._startTimer = function() {
        if (!_timer) {
            _timer = setInterval(Y.Anim._runFrame, Y.Anim._intervalTime);
        }
    };

    Y.Anim._stopTimer = function() {
        clearInterval(_timer);
        _timer = 0;
    };

    /**
     * Called per Interval to handle each animation frame.
     * @method _runFrame
     * @private
     * @static
     */
    Y.Anim._runFrame = function() {
        var done = true,
            anim;
        for (anim in _running) {
            if (_running[anim]._runFrame) {
                done = false;
                _running[anim]._runFrame();
            }
        }

        if (done) {
            Y.Anim._stopTimer();
        }
    };

    Y.Anim.RE_UNITS = /^(-?\d*\.?\d*){1}(em|ex|px|in|cm|mm|pt|pc|%)*$/;

    var proto = {
        /**
         * Starts or resumes an animation.
         * @method run
         * @chainable
         */
        run: function() {
            if (this.get(PAUSED)) {
                this._resume();
            } else if (!this.get(RUNNING)) {
                this._start();
            }
            return this;
        },

        /**
         * Pauses the animation and
         * freezes it in its current state and time.
         * Calling run() will continue where it left off.
         * @method pause
         * @chainable
         */
        pause: function() {
            if (this.get(RUNNING)) {
                this._pause();
            }
            return this;
        },

        /**
         * Stops the animation and resets its time.
         * @method stop
         * @param {Boolean} finish If true, the animation will move to the last frame
         * @chainable
         */
        stop: function(finish) {
            if (this.get(RUNNING) || this.get(PAUSED)) {
                this._end(finish);
            }
            return this;
        },

        _added: false,

        _start: function() {
            this._set(START_TIME, new Date() - this.get(ELAPSED_TIME));
            this._actualFrames = 0;
            if (!this.get(PAUSED)) {
                this._initAnimAttr();
            }
            _running[Y.stamp(this)] = this;
            Y.Anim._startTimer();

            this.fire(START);
        },

        _pause: function() {
            this._set(START_TIME, null);
            this._set(PAUSED, true);
            delete _running[Y.stamp(this)];

            /**
            * @event pause
            * @description fires when an animation is paused.
            * @param {Event} ev The pause event.
            * @type Event.Custom
            */
            this.fire('pause');
        },

        _resume: function() {
            this._set(PAUSED, false);
            _running[Y.stamp(this)] = this;
            this._set(START_TIME, new Date() - this.get(ELAPSED_TIME));
            Y.Anim._startTimer();

            /**
            * @event resume
            * @description fires when an animation is resumed (run from pause).
            * @param {Event} ev The pause event.
            * @type Event.Custom
            */
            this.fire('resume');
        },

        _end: function(finish) {
            var duration = this.get('duration') * 1000;
            if (finish) { // jump to last frame
                this._runAttrs(duration, duration, this.get(REVERSE));
            }

            this._set(START_TIME, null);
            this._set(ELAPSED_TIME, 0);
            this._set(PAUSED, false);

            delete _running[Y.stamp(this)];
            this.fire(END, {elapsed: this.get(ELAPSED_TIME)});
        },

        _runFrame: function() {
            var d = this._runtimeAttr.duration,
                t = new Date() - this.get(START_TIME),
                reverse = this.get(REVERSE),
                done = (t >= d);

            this._runAttrs(t, d, reverse);
            this._actualFrames += 1;
            this._set(ELAPSED_TIME, t);

            this.fire(TWEEN);
            if (done) {
                this._lastFrame();
            }
        },

        _runAttrs: function(t, d, reverse) {
            var attr = this._runtimeAttr,
                customAttr = Y.Anim.behaviors,
                easing = attr.easing,
                lastFrame = d,
                done = false,
                attribute,
                setter,
                i;

            if (t >= d) {
                done = true;
            }

            if (reverse) {
                t = d - t;
                lastFrame = 0;
            }

            for (i in attr) {
                if (attr[i].to) {
                    attribute = attr[i];
                    setter = (i in customAttr && 'set' in customAttr[i]) ?
                            customAttr[i].set : Y.Anim.DEFAULT_SETTER;

                    if (!done) {
                        setter(this, i, attribute.from, attribute.to, t, d, easing, attribute.unit);
                    } else {
                        setter(this, i, attribute.from, attribute.to, lastFrame, d, easing, attribute.unit);
                    }
                }
            }


        },

        _lastFrame: function() {
            var iter = this.get('iterations'),
                iterCount = this.get(ITERATION_COUNT);

            iterCount += 1;
            if (iter === 'infinite' || iterCount < iter) {
                if (this.get('direction') === 'alternate') {
                    this.set(REVERSE, !this.get(REVERSE)); // flip it
                }
                /**
                * @event iteration
                * @description fires when an animation begins an iteration.
                * @param {Event} ev The iteration event.
                * @type Event.Custom
                */
                this.fire('iteration');
            } else {
                iterCount = 0;
                this._end();
            }

            this._set(START_TIME, new Date());
            this._set(ITERATION_COUNT, iterCount);
        },

        _initAnimAttr: function() {
            var from = this.get('from') || {},
                to = this.get('to') || {},
                attr = {
                    duration: this.get('duration') * 1000,
                    easing: this.get('easing')
                },
                customAttr = Y.Anim.behaviors,
                node = this.get(NODE), // implicit attr init
                unit, begin, end;

            Y.each(to, function(val, name) {
                if (typeof val === 'function') {
                    val = val.call(this, node);
                }

                begin = from[name];
                if (begin === undefined) {
                    begin = (name in customAttr && 'get' in customAttr[name])  ?
                            customAttr[name].get(this, name) : Y.Anim.DEFAULT_GETTER(this, name);
                } else if (typeof begin === 'function') {
                    begin = begin.call(this, node);
                }

                var mFrom = Y.Anim.RE_UNITS.exec(begin),
                    mTo = Y.Anim.RE_UNITS.exec(val);

                begin = mFrom ? mFrom[1] : begin;
                end = mTo ? mTo[1] : val;
                unit = mTo ? mTo[2] : mFrom ?  mFrom[2] : ''; // one might be zero TODO: mixed units

                if (!unit && Y.Anim.RE_DEFAULT_UNIT.test(name)) {
                    unit = Y.Anim.DEFAULT_UNIT;
                }

                if (!begin || !end) {
                    Y.error('invalid "from" or "to" for "' + name + '"', 'Anim');
                    return;
                }

                attr[name] = {
                    from: Y.Lang.isObject(begin) ? Y.clone(begin) : begin,
                    to: end,
                    unit: unit
                };

            }, this);

            this._runtimeAttr = attr;
        },


        // TODO: move to computedStyle? (browsers dont agree on default computed offsets)
        _getOffset: function(attr) {
            var node = this._node,
                val = node.getComputedStyle(attr),
                get = (attr === 'left') ? 'getX': 'getY',
                set = (attr === 'left') ? 'setX': 'setY',
                position;

            if (val === 'auto') {
                position = node.getStyle('position');
                if (position === 'absolute' || position === 'fixed') {
                    val = node[get]();
                    node[set](val);
                } else {
                    val = 0;
                }
            }

            return val;
        },

        destructor: function() {
            delete Y.Anim._instances[Y.stamp(this)];
        }
    };

    Y.extend(Y.Anim, Y.Base, proto);


}, '3.16.0', {"requires": ["base-base", "node-style"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('anim-color', function (Y, NAME) {

/**
 * Adds support for color properties in <code>to</code>
 * and <code>from</code> attributes.
 * @module anim
 * @submodule anim-color
 */

var NUM = Number;

Y.Anim.getUpdatedColorValue = function(fromColor, toColor, elapsed, duration,  fn)
{
    fromColor = Y.Color.re_RGB.exec(Y.Color.toRGB(fromColor));
    toColor = Y.Color.re_RGB.exec(Y.Color.toRGB(toColor));

    if (!fromColor || fromColor.length < 3 || !toColor || toColor.length < 3) {
        Y.error('invalid from or to passed to color behavior');
    }

    return 'rgb(' + [
        Math.floor(fn(elapsed, NUM(fromColor[1]), NUM(toColor[1]) - NUM(fromColor[1]), duration)),
        Math.floor(fn(elapsed, NUM(fromColor[2]), NUM(toColor[2]) - NUM(fromColor[2]), duration)),
        Math.floor(fn(elapsed, NUM(fromColor[3]), NUM(toColor[3]) - NUM(fromColor[3]), duration))
    ].join(', ') + ')';
};

Y.Anim.behaviors.color = {
    set: function(anim, att, from, to, elapsed, duration, fn) {
        anim._node.setStyle(att, Y.Anim.getUpdatedColorValue(from, to, elapsed, duration, fn));
    },

    // TODO: default bgcolor const
    get: function(anim, att) {
        var val = anim._node.getComputedStyle(att);
        val = (val === 'transparent') ? 'rgb(255, 255, 255)' : val;
        return val;
    }
};

Y.each(['backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor'],
        function(v) {
            Y.Anim.behaviors[v] = Y.Anim.behaviors.color;
        }
);


}, '3.16.0', {"requires": ["anim-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dom-screen', function (Y, NAME) {

(function(Y) {

/**
 * Adds position and region management functionality to DOM.
 * @module dom
 * @submodule dom-screen
 * @for DOM
 */

var DOCUMENT_ELEMENT = 'documentElement',
    COMPAT_MODE = 'compatMode',
    POSITION = 'position',
    FIXED = 'fixed',
    RELATIVE = 'relative',
    LEFT = 'left',
    TOP = 'top',
    _BACK_COMPAT = 'BackCompat',
    MEDIUM = 'medium',
    BORDER_LEFT_WIDTH = 'borderLeftWidth',
    BORDER_TOP_WIDTH = 'borderTopWidth',
    GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
    GET_COMPUTED_STYLE = 'getComputedStyle',

    Y_DOM = Y.DOM,

    // TODO: how about thead/tbody/tfoot/tr?
    // TODO: does caption matter?
    RE_TABLE = /^t(?:able|d|h)$/i,

    SCROLL_NODE;

if (Y.UA.ie) {
    if (Y.config.doc[COMPAT_MODE] !== 'BackCompat') {
        SCROLL_NODE = DOCUMENT_ELEMENT;
    } else {
        SCROLL_NODE = 'body';
    }
}

Y.mix(Y_DOM, {
    /**
     * Returns the inner height of the viewport (exludes scrollbar).
     * @method winHeight
     * @return {Number} The current height of the viewport.
     */
    winHeight: function(node) {
        var h = Y_DOM._getWinSize(node).height;
        return h;
    },

    /**
     * Returns the inner width of the viewport (exludes scrollbar).
     * @method winWidth
     * @return {Number} The current width of the viewport.
     */
    winWidth: function(node) {
        var w = Y_DOM._getWinSize(node).width;
        return w;
    },

    /**
     * Document height
     * @method docHeight
     * @return {Number} The current height of the document.
     */
    docHeight:  function(node) {
        var h = Y_DOM._getDocSize(node).height;
        return Math.max(h, Y_DOM._getWinSize(node).height);
    },

    /**
     * Document width
     * @method docWidth
     * @return {Number} The current width of the document.
     */
    docWidth:  function(node) {
        var w = Y_DOM._getDocSize(node).width;
        return Math.max(w, Y_DOM._getWinSize(node).width);
    },

    /**
     * Amount page has been scroll horizontally
     * @method docScrollX
     * @return {Number} The current amount the screen is scrolled horizontally.
     */
    docScrollX: function(node, doc) {
        doc = doc || (node) ? Y_DOM._getDoc(node) : Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageXOffset : 0;
        return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, pageOffset);
    },

    /**
     * Amount page has been scroll vertically
     * @method docScrollY
     * @return {Number} The current amount the screen is scrolled vertically.
     */
    docScrollY:  function(node, doc) {
        doc = doc || (node) ? Y_DOM._getDoc(node) : Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageYOffset : 0;
        return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, pageOffset);
    },

    /**
     * Gets the current position of an element based on page coordinates.
     * Element must be part of the DOM tree to have page coordinates
     * (display:none or elements not appended return false).
     * @method getXY
     * @param element The target element
     * @return {Array} The XY position of the element

     TODO: test inDocument/display?
     */
    getXY: function() {
        if (Y.config.doc[DOCUMENT_ELEMENT][GET_BOUNDING_CLIENT_RECT]) {
            return function(node) {
                var xy = null,
                    scrollLeft,
                    scrollTop,
                    mode,
                    box,
                    offX,
                    offY,
                    doc,
                    win,
                    inDoc,
                    rootNode;

                if (node && node.tagName) {
                    doc = node.ownerDocument;
                    mode = doc[COMPAT_MODE];

                    if (mode !== _BACK_COMPAT) {
                        rootNode = doc[DOCUMENT_ELEMENT];
                    } else {
                        rootNode = doc.body;
                    }

                    // inline inDoc check for perf
                    if (rootNode.contains) {
                        inDoc = rootNode.contains(node);
                    } else {
                        inDoc = Y.DOM.contains(rootNode, node);
                    }

                    if (inDoc) {
                        win = doc.defaultView;

                        // inline scroll calc for perf
                        if (win && 'pageXOffset' in win) {
                            scrollLeft = win.pageXOffset;
                            scrollTop = win.pageYOffset;
                        } else {
                            scrollLeft = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollLeft : Y_DOM.docScrollX(node, doc);
                            scrollTop = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollTop : Y_DOM.docScrollY(node, doc);
                        }

                        if (Y.UA.ie) { // IE < 8, quirks, or compatMode
                            if (!doc.documentMode || doc.documentMode < 8 || mode === _BACK_COMPAT) {
                                offX = rootNode.clientLeft;
                                offY = rootNode.clientTop;
                            }
                        }
                        box = node[GET_BOUNDING_CLIENT_RECT]();
                        xy = [box.left, box.top];

                        if (offX || offY) {
                                xy[0] -= offX;
                                xy[1] -= offY;

                        }
                        if ((scrollTop || scrollLeft)) {
                            if (!Y.UA.ios || (Y.UA.ios >= 4.2)) {
                                xy[0] += scrollLeft;
                                xy[1] += scrollTop;
                            }

                        }
                    } else {
                        xy = Y_DOM._getOffset(node);
                    }
                }
                return xy;
            };
        } else {
            return function(node) { // manually calculate by crawling up offsetParents
                //Calculate the Top and Left border sizes (assumes pixels)
                var xy = null,
                    doc,
                    parentNode,
                    bCheck,
                    scrollTop,
                    scrollLeft;

                if (node) {
                    if (Y_DOM.inDoc(node)) {
                        xy = [node.offsetLeft, node.offsetTop];
                        doc = node.ownerDocument;
                        parentNode = node;
                        // TODO: refactor with !! or just falsey
                        bCheck = ((Y.UA.gecko || Y.UA.webkit > 519) ? true : false);

                        // TODO: worth refactoring for TOP/LEFT only?
                        while ((parentNode = parentNode.offsetParent)) {
                            xy[0] += parentNode.offsetLeft;
                            xy[1] += parentNode.offsetTop;
                            if (bCheck) {
                                xy = Y_DOM._calcBorders(parentNode, xy);
                            }
                        }

                        // account for any scrolled ancestors
                        if (Y_DOM.getStyle(node, POSITION) != FIXED) {
                            parentNode = node;

                            while ((parentNode = parentNode.parentNode)) {
                                scrollTop = parentNode.scrollTop;
                                scrollLeft = parentNode.scrollLeft;

                                //Firefox does something funky with borders when overflow is not visible.
                                if (Y.UA.gecko && (Y_DOM.getStyle(parentNode, 'overflow') !== 'visible')) {
                                        xy = Y_DOM._calcBorders(parentNode, xy);
                                }


                                if (scrollTop || scrollLeft) {
                                    xy[0] -= scrollLeft;
                                    xy[1] -= scrollTop;
                                }
                            }
                            xy[0] += Y_DOM.docScrollX(node, doc);
                            xy[1] += Y_DOM.docScrollY(node, doc);

                        } else {
                            //Fix FIXED position -- add scrollbars
                            xy[0] += Y_DOM.docScrollX(node, doc);
                            xy[1] += Y_DOM.docScrollY(node, doc);
                        }
                    } else {
                        xy = Y_DOM._getOffset(node);
                    }
                }

                return xy;
            };
        }
    }(),// NOTE: Executing for loadtime branching

    /**
    Gets the width of vertical scrollbars on overflowed containers in the body
    content.

    @method getScrollbarWidth
    @return {Number} Pixel width of a scrollbar in the current browser
    **/
    getScrollbarWidth: Y.cached(function () {
        var doc      = Y.config.doc,
            testNode = doc.createElement('div'),
            body     = doc.getElementsByTagName('body')[0],
            // 0.1 because cached doesn't support falsy refetch values
            width    = 0.1;

        if (body) {
            testNode.style.cssText = "position:absolute;visibility:hidden;overflow:scroll;width:20px;";
            testNode.appendChild(doc.createElement('p')).style.height = '1px';
            body.insertBefore(testNode, body.firstChild);
            width = testNode.offsetWidth - testNode.clientWidth;

            body.removeChild(testNode);
        }

        return width;
    }, null, 0.1),

    /**
     * Gets the current X position of an element based on page coordinates.
     * Element must be part of the DOM tree to have page coordinates
     * (display:none or elements not appended return false).
     * @method getX
     * @param element The target element
     * @return {Number} The X position of the element
     */

    getX: function(node) {
        return Y_DOM.getXY(node)[0];
    },

    /**
     * Gets the current Y position of an element based on page coordinates.
     * Element must be part of the DOM tree to have page coordinates
     * (display:none or elements not appended return false).
     * @method getY
     * @param element The target element
     * @return {Number} The Y position of the element
     */

    getY: function(node) {
        return Y_DOM.getXY(node)[1];
    },

    /**
     * Set the position of an html element in page coordinates.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @method setXY
     * @param element The target element
     * @param {Array} xy Contains X & Y values for new position (coordinates are page-based)
     * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
     */
    setXY: function(node, xy, noRetry) {
        var setStyle = Y_DOM.setStyle,
            pos,
            delta,
            newXY,
            currentXY;

        if (node && xy) {
            pos = Y_DOM.getStyle(node, POSITION);

            delta = Y_DOM._getOffset(node);
            if (pos == 'static') { // default to relative
                pos = RELATIVE;
                setStyle(node, POSITION, pos);
            }
            currentXY = Y_DOM.getXY(node);

            if (xy[0] !== null) {
                setStyle(node, LEFT, xy[0] - currentXY[0] + delta[0] + 'px');
            }

            if (xy[1] !== null) {
                setStyle(node, TOP, xy[1] - currentXY[1] + delta[1] + 'px');
            }

            if (!noRetry) {
                newXY = Y_DOM.getXY(node);
                if (newXY[0] !== xy[0] || newXY[1] !== xy[1]) {
                    Y_DOM.setXY(node, xy, true);
                }
            }

        } else {
        }
    },

    /**
     * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
     * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @method setX
     * @param element The target element
     * @param {Number} x The X values for new position (coordinates are page-based)
     */
    setX: function(node, x) {
        return Y_DOM.setXY(node, [x, null]);
    },

    /**
     * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
     * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @method setY
     * @param element The target element
     * @param {Number} y The Y values for new position (coordinates are page-based)
     */
    setY: function(node, y) {
        return Y_DOM.setXY(node, [null, y]);
    },

    /**
     * @method swapXY
     * @description Swap the xy position with another node
     * @param {Node} node The node to swap with
     * @param {Node} otherNode The other node to swap with
     * @return {Node}
     */
    swapXY: function(node, otherNode) {
        var xy = Y_DOM.getXY(node);
        Y_DOM.setXY(node, Y_DOM.getXY(otherNode));
        Y_DOM.setXY(otherNode, xy);
    },

    _calcBorders: function(node, xy2) {
        var t = parseInt(Y_DOM[GET_COMPUTED_STYLE](node, BORDER_TOP_WIDTH), 10) || 0,
            l = parseInt(Y_DOM[GET_COMPUTED_STYLE](node, BORDER_LEFT_WIDTH), 10) || 0;
        if (Y.UA.gecko) {
            if (RE_TABLE.test(node.tagName)) {
                t = 0;
                l = 0;
            }
        }
        xy2[0] += l;
        xy2[1] += t;
        return xy2;
    },

    _getWinSize: function(node, doc) {
        doc  = doc || (node) ? Y_DOM._getDoc(node) : Y.config.doc;
        var win = doc.defaultView || doc.parentWindow,
            mode = doc[COMPAT_MODE],
            h = win.innerHeight,
            w = win.innerWidth,
            root = doc[DOCUMENT_ELEMENT];

        if ( mode && !Y.UA.opera ) { // IE, Gecko
            if (mode != 'CSS1Compat') { // Quirks
                root = doc.body;
            }
            h = root.clientHeight;
            w = root.clientWidth;
        }
        return { height: h, width: w };
    },

    _getDocSize: function(node) {
        var doc = (node) ? Y_DOM._getDoc(node) : Y.config.doc,
            root = doc[DOCUMENT_ELEMENT];

        if (doc[COMPAT_MODE] != 'CSS1Compat') {
            root = doc.body;
        }

        return { height: root.scrollHeight, width: root.scrollWidth };
    }
});

})(Y);
(function(Y) {
var TOP = 'top',
    RIGHT = 'right',
    BOTTOM = 'bottom',
    LEFT = 'left',

    getOffsets = function(r1, r2) {
        var t = Math.max(r1[TOP], r2[TOP]),
            r = Math.min(r1[RIGHT], r2[RIGHT]),
            b = Math.min(r1[BOTTOM], r2[BOTTOM]),
            l = Math.max(r1[LEFT], r2[LEFT]),
            ret = {};

        ret[TOP] = t;
        ret[RIGHT] = r;
        ret[BOTTOM] = b;
        ret[LEFT] = l;
        return ret;
    },

    DOM = Y.DOM;

Y.mix(DOM, {
    /**
     * Returns an Object literal containing the following about this element: (top, right, bottom, left)
     * @for DOM
     * @method region
     * @param {HTMLElement} element The DOM element.
     * @return {Object} Object literal containing the following about this element: (top, right, bottom, left)
     */
    region: function(node) {
        var xy = DOM.getXY(node),
            ret = false;

        if (node && xy) {
            ret = DOM._getRegion(
                xy[1], // top
                xy[0] + node.offsetWidth, // right
                xy[1] + node.offsetHeight, // bottom
                xy[0] // left
            );
        }

        return ret;
    },

    /**
     * Find the intersect information for the passed nodes.
     * @method intersect
     * @for DOM
     * @param {HTMLElement} element The first element
     * @param {HTMLElement | Object} element2 The element or region to check the interect with
     * @param {Object} altRegion An object literal containing the region for the first element if we already have the data (for performance e.g. DragDrop)
     * @return {Object} Object literal containing the following intersection data: (top, right, bottom, left, area, yoff, xoff, inRegion)
     */
    intersect: function(node, node2, altRegion) {
        var r = altRegion || DOM.region(node), region = {},
            n = node2,
            off;

        if (n.tagName) {
            region = DOM.region(n);
        } else if (Y.Lang.isObject(node2)) {
            region = node2;
        } else {
            return false;
        }

        off = getOffsets(region, r);
        return {
            top: off[TOP],
            right: off[RIGHT],
            bottom: off[BOTTOM],
            left: off[LEFT],
            area: ((off[BOTTOM] - off[TOP]) * (off[RIGHT] - off[LEFT])),
            yoff: ((off[BOTTOM] - off[TOP])),
            xoff: (off[RIGHT] - off[LEFT]),
            inRegion: DOM.inRegion(node, node2, false, altRegion)
        };

    },
    /**
     * Check if any part of this node is in the passed region
     * @method inRegion
     * @for DOM
     * @param {Object} node The node to get the region from
     * @param {Object} node2 The second node to get the region from or an Object literal of the region
     * @param {Boolean} all Should all of the node be inside the region
     * @param {Object} altRegion An object literal containing the region for this node if we already have the data (for performance e.g. DragDrop)
     * @return {Boolean} True if in region, false if not.
     */
    inRegion: function(node, node2, all, altRegion) {
        var region = {},
            r = altRegion || DOM.region(node),
            n = node2,
            off;

        if (n.tagName) {
            region = DOM.region(n);
        } else if (Y.Lang.isObject(node2)) {
            region = node2;
        } else {
            return false;
        }

        if (all) {
            return (
                r[LEFT]   >= region[LEFT]   &&
                r[RIGHT]  <= region[RIGHT]  &&
                r[TOP]    >= region[TOP]    &&
                r[BOTTOM] <= region[BOTTOM]  );
        } else {
            off = getOffsets(region, r);
            if (off[BOTTOM] >= off[TOP] && off[RIGHT] >= off[LEFT]) {
                return true;
            } else {
                return false;
            }

        }
    },

    /**
     * Check if any part of this element is in the viewport
     * @method inViewportRegion
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {Boolean} all Should all of the node be inside the region
     * @param {Object} altRegion An object literal containing the region for this node if we already have the data (for performance e.g. DragDrop)
     * @return {Boolean} True if in region, false if not.
     */
    inViewportRegion: function(node, all, altRegion) {
        return DOM.inRegion(node, DOM.viewportRegion(node), all, altRegion);

    },

    _getRegion: function(t, r, b, l) {
        var region = {};

        region[TOP] = region[1] = t;
        region[LEFT] = region[0] = l;
        region[BOTTOM] = b;
        region[RIGHT] = r;
        region.width = region[RIGHT] - region[LEFT];
        region.height = region[BOTTOM] - region[TOP];

        return region;
    },

    /**
     * Returns an Object literal containing the following about the visible region of viewport: (top, right, bottom, left)
     * @method viewportRegion
     * @for DOM
     * @return {Object} Object literal containing the following about the visible region of the viewport: (top, right, bottom, left)
     */
    viewportRegion: function(node) {
        node = node || Y.config.doc.documentElement;
        var ret = false,
            scrollX,
            scrollY;

        if (node) {
            scrollX = DOM.docScrollX(node);
            scrollY = DOM.docScrollY(node);

            ret = DOM._getRegion(scrollY, // top
                DOM.winWidth(node) + scrollX, // right
                scrollY + DOM.winHeight(node), // bottom
                scrollX); // left
        }

        return ret;
    }
});
})(Y);


}, '3.16.0', {"requires": ["dom-base", "dom-style"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('node-screen', function (Y, NAME) {

/**
 * Extended Node interface for managing regions and screen positioning.
 * Adds support for positioning elements and normalizes window size and scroll detection.
 * @module node
 * @submodule node-screen
 */

// these are all "safe" returns, no wrapping required
Y.each([
    /**
     * Returns the inner width of the viewport (exludes scrollbar).
     * @config winWidth
     * @for Node
     * @type {Number}
     */
    'winWidth',

    /**
     * Returns the inner height of the viewport (exludes scrollbar).
     * @config winHeight
     * @type {Number}
     */
    'winHeight',

    /**
     * Document width
     * @config docWidth
     * @type {Number}
     */
    'docWidth',

    /**
     * Document height
     * @config docHeight
     * @type {Number}
     */
    'docHeight',

    /**
     * Pixel distance the page has been scrolled horizontally
     * @config docScrollX
     * @type {Number}
     */
    'docScrollX',

    /**
     * Pixel distance the page has been scrolled vertically
     * @config docScrollY
     * @type {Number}
     */
    'docScrollY'
    ],
    function(name) {
        Y.Node.ATTRS[name] = {
            getter: function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(Y.Node.getDOMNode(this));

                return Y.DOM[name].apply(this, args);
            }
        };
    }
);

Y.Node.ATTRS.scrollLeft = {
    getter: function() {
        var node = Y.Node.getDOMNode(this);
        return ('scrollLeft' in node) ? node.scrollLeft : Y.DOM.docScrollX(node);
    },

    setter: function(val) {
        var node = Y.Node.getDOMNode(this);
        if (node) {
            if ('scrollLeft' in node) {
                node.scrollLeft = val;
            } else if (node.document || node.nodeType === 9) {
                Y.DOM._getWin(node).scrollTo(val, Y.DOM.docScrollY(node)); // scroll window if win or doc
            }
        } else {
        }
    }
};

Y.Node.ATTRS.scrollTop = {
    getter: function() {
        var node = Y.Node.getDOMNode(this);
        return ('scrollTop' in node) ? node.scrollTop : Y.DOM.docScrollY(node);
    },

    setter: function(val) {
        var node = Y.Node.getDOMNode(this);
        if (node) {
            if ('scrollTop' in node) {
                node.scrollTop = val;
            } else if (node.document || node.nodeType === 9) {
                Y.DOM._getWin(node).scrollTo(Y.DOM.docScrollX(node), val); // scroll window if win or doc
            }
        } else {
        }
    }
};

Y.Node.importMethod(Y.DOM, [
/**
 * Gets the current position of the node in page coordinates.
 * @method getXY
 * @for Node
 * @return {Array} The XY position of the node
*/
    'getXY',

/**
 * Set the position of the node in page coordinates, regardless of how the node is positioned.
 * @method setXY
 * @param {Array} xy Contains X & Y values for new position (coordinates are page-based)
 * @chainable
 */
    'setXY',

/**
 * Gets the current position of the node in page coordinates.
 * @method getX
 * @return {Number} The X position of the node
*/
    'getX',

/**
 * Set the position of the node in page coordinates, regardless of how the node is positioned.
 * @method setX
 * @param {Number} x X value for new position (coordinates are page-based)
 * @chainable
 */
    'setX',

/**
 * Gets the current position of the node in page coordinates.
 * @method getY
 * @return {Number} The Y position of the node
*/
    'getY',

/**
 * Set the position of the node in page coordinates, regardless of how the node is positioned.
 * @method setY
 * @param {Number} y Y value for new position (coordinates are page-based)
 * @chainable
 */
    'setY',

/**
 * Swaps the XY position of this node with another node.
 * @method swapXY
 * @param {Node | HTMLElement} otherNode The node to swap with.
 * @chainable
 */
    'swapXY'
]);

/**
 * @module node
 * @submodule node-screen
 */

/**
 * Returns a region object for the node
 * @config region
 * @for Node
 * @type Node
 */
Y.Node.ATTRS.region = {
    getter: function() {
        var node = this.getDOMNode(),
            region;

        if (node && !node.tagName) {
            if (node.nodeType === 9) { // document
                node = node.documentElement;
            }
        }
        if (Y.DOM.isWindow(node)) {
            region = Y.DOM.viewportRegion(node);
        } else {
            region = Y.DOM.region(node);
        }
        return region;
    }
};

/**
 * Returns a region object for the node's viewport
 * @config viewportRegion
 * @type Node
 */
Y.Node.ATTRS.viewportRegion = {
    getter: function() {
        return Y.DOM.viewportRegion(Y.Node.getDOMNode(this));
    }
};

Y.Node.importMethod(Y.DOM, 'inViewportRegion');

// these need special treatment to extract 2nd node arg
/**
 * Compares the intersection of the node with another node or region
 * @method intersect
 * @for Node
 * @param {Node|Object} node2 The node or region to compare with.
 * @param {Object} altRegion An alternate region to use (rather than this node's).
 * @return {Object} An object representing the intersection of the regions.
 */
Y.Node.prototype.intersect = function(node2, altRegion) {
    var node1 = Y.Node.getDOMNode(this);
    if (Y.instanceOf(node2, Y.Node)) { // might be a region object
        node2 = Y.Node.getDOMNode(node2);
    }
    return Y.DOM.intersect(node1, node2, altRegion);
};

/**
 * Determines whether or not the node is within the given region.
 * @method inRegion
 * @param {Node|Object} node2 The node or region to compare with.
 * @param {Boolean} all Whether or not all of the node must be in the region.
 * @param {Object} altRegion An alternate region to use (rather than this node's).
 * @return {Boolean} True if in region, false if not.
 */
Y.Node.prototype.inRegion = function(node2, all, altRegion) {
    var node1 = Y.Node.getDOMNode(this);
    if (Y.instanceOf(node2, Y.Node)) { // might be a region object
        node2 = Y.Node.getDOMNode(node2);
    }
    return Y.DOM.inRegion(node1, node2, all, altRegion);
};


}, '3.16.0', {"requires": ["dom-screen", "node-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('anim-xy', function (Y, NAME) {

/**
 * Adds support for the <code>xy</code> property in <code>from</code> and
 * <code>to</code> attributes.
 * @module anim
 * @submodule anim-xy
 */

var NUM = Number;

Y.Anim.behaviors.xy = {
    set: function(anim, att, from, to, elapsed, duration, fn) {
        anim._node.setXY([
            fn(elapsed, NUM(from[0]), NUM(to[0]) - NUM(from[0]), duration),
            fn(elapsed, NUM(from[1]), NUM(to[1]) - NUM(from[1]), duration)
        ]);
    },
    get: function(anim) {
        return anim._node.getXY();
    }
};



}, '3.16.0', {"requires": ["anim-base", "node-screen"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('anim-curve', function (Y, NAME) {

/**
 * Adds support for the <code>curve</code> property for the <code>to</code>
 * attribute.  A curve is zero or more control points and an end point.
 * @module anim
 * @submodule anim-curve
 */

Y.Anim.behaviors.curve = {
    set: function(anim, att, from, to, elapsed, duration, fn) {
        from = from.slice.call(from);
        to = to.slice.call(to);
        var t = fn(elapsed, 0, 100, duration) / 100;
        to.unshift(from);
        anim._node.setXY(Y.Anim.getBezier(to, t));
    },

    get: function(anim) {
        return anim._node.getXY();
    }
};

/**
 * Get the current position of the animated element based on t.
 * Each point is an array of "x" and "y" values (0 = x, 1 = y)
 * At least 2 points are required (start and end).
 * First point is start. Last point is end.
 * Additional control points are optional.
 * @for Anim
 * @method getBezier
 * @static
 * @param {Number[]} points An array containing Bezier points
 * @param {Number} t A number between 0 and 1 which is the basis for determining current position
 * @return {Number[]} An array containing int x and y member data
 */
Y.Anim.getBezier = function(points, t) {
    var n = points.length,
        tmp = [],
        i,
        j;

    for (i = 0; i < n; ++i){
        tmp[i] = [points[i][0], points[i][1]]; // save input
    }

    for (j = 1; j < n; ++j) {
        for (i = 0; i < n - j; ++i) {
            tmp[i][0] = (1 - t) * tmp[i][0] + t * tmp[parseInt(i + 1, 10)][0];
            tmp[i][1] = (1 - t) * tmp[i][1] + t * tmp[parseInt(i + 1, 10)][1];
        }
    }

    return [ tmp[0][0], tmp[0][1] ];

};


}, '3.16.0', {"requires": ["anim-xy"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('anim-easing', function (Y, NAME) {

/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to
    endorse or promote products derived from this software without specific prior
    written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * The easing module provides methods for customizing
 * how an animation behaves during each run.
 * @class Easing
 * @module anim
 * @submodule anim-easing
 */

var Easing = {

    /**
     * Uniform speed between points.
     * @for Easing
     * @method easeNone
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeNone: function (t, b, c, d) {
        return c*t/d + b;
    },

    /**
     * Begins slowly and accelerates towards end. (quadratic)
     * @method easeIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeIn: function (t, b, c, d) {
        return c*(t/=d)*t + b;
    },

    /**
     * Begins quickly and decelerates towards end.  (quadratic)
     * @method easeOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOut: function (t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },

    /**
     * Begins slowly and decelerates towards end. (quadratic)
     * @method easeBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBoth: function (t, b, c, d) {
        if ((t /= d/2) < 1) {
            return c/2*t*t + b;
        }

        return -c/2 * ((--t)*(t-2) - 1) + b;
    },

    /**
     * Begins slowly and accelerates towards end. (quartic)
     * @method easeInStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeInStrong: function (t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },

    /**
     * Begins quickly and decelerates towards end.  (quartic)
     * @method easeOutStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOutStrong: function (t, b, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },

    /**
     * Begins slowly and decelerates towards end. (quartic)
     * @method easeBothStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBothStrong: function (t, b, c, d) {
        if ((t /= d/2) < 1) {
            return c/2*t*t*t*t + b;
        }

        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },

    /**
     * Snap in elastic effect.
     * @method elasticIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */

    elasticIn: function (t, b, c, d, a, p) {
        var s;
        if (t === 0) {
            return b;
        }
        if ( (t /= d) === 1 ) {
            return b+c;
        }
        if (!p) {
            p = d* 0.3;
        }

        if (!a || a < Math.abs(c)) {
            a = c;
            s = p/4;
        }
        else {
            s = p/(2*Math.PI) * Math.asin (c/a);
        }

        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },

    /**
     * Snap out elastic effect.
     * @method elasticOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticOut: function (t, b, c, d, a, p) {
        var s;
        if (t === 0) {
            return b;
        }
        if ( (t /= d) === 1 ) {
            return b+c;
        }
        if (!p) {
            p=d * 0.3;
        }

        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p/(2*Math.PI) * Math.asin (c/a);
        }

        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },

    /**
     * Snap both elastic effect.
     * @method elasticBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticBoth: function (t, b, c, d, a, p) {
        var s;
        if (t === 0) {
            return b;
        }

        if ( (t /= d/2) === 2 ) {
            return b+c;
        }

        if (!p) {
            p = d*(0.3*1.5);
        }

        if ( !a || a < Math.abs(c) ) {
            a = c;
            s = p/4;
        }
        else {
            s = p/(2*Math.PI) * Math.asin (c/a);
        }

        if (t < 1) {
            return -0.5*(a*Math.pow(2,10*(t-=1)) *
                    Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        }
        return a*Math.pow(2,-10*(t-=1)) *
                Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
    },


    /**
     * Backtracks slightly, then reverses direction and moves to end.
     * @method backIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backIn: function (t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        if (t === d) {
            t -= 0.001;
        }
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },

    /**
     * Overshoots end, then reverses and comes back to end.
     * @method backOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backOut: function (t, b, c, d, s) {
        if (typeof s === 'undefined') {
            s = 1.70158;
        }
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },

    /**
     * Backtracks slightly, then reverses direction, overshoots end,
     * then reverses and comes back to end.
     * @method backBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backBoth: function (t, b, c, d, s) {
        if (typeof s === 'undefined') {
            s = 1.70158;
        }

        if ((t /= d/2 ) < 1) {
            return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        }
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },

    /**
     * Bounce off of start.
     * @method bounceIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceIn: function (t, b, c, d) {
        return c - Y.Easing.bounceOut(d-t, 0, c, d) + b;
    },

    /**
     * Bounces off end.
     * @method bounceOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceOut: function (t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
        } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
        }
        return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
    },

    /**
     * Bounces off start and end.
     * @method bounceBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceBoth: function (t, b, c, d) {
        if (t < d/2) {
            return Y.Easing.bounceIn(t * 2, 0, c, d) * 0.5 + b;
        }
        return Y.Easing.bounceOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
};

Y.Easing = Easing;


}, '3.16.0', {"requires": ["anim-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('pluginhost-base', function (Y, NAME) {

    /**
     * Provides the augmentable PluginHost interface, which can be added to any class.
     * @module pluginhost
     */

    /**
     * Provides the augmentable PluginHost interface, which can be added to any class.
     * @module pluginhost-base
     */

    /**
     * <p>
     * An augmentable class, which provides the augmented class with the ability to host plugins.
     * It adds <a href="#method_plug">plug</a> and <a href="#method_unplug">unplug</a> methods to the augmented class, which can
     * be used to add or remove plugins from instances of the class.
     * </p>
     *
     * <p>Plugins can also be added through the constructor configuration object passed to the host class' constructor using
     * the "plugins" property. Supported values for the "plugins" property are those defined by the <a href="#method_plug">plug</a> method.
     *
     * For example the following code would add the AnimPlugin and IOPlugin to Overlay (the plugin host):
     * <xmp>
     * var o = new Overlay({plugins: [ AnimPlugin, {fn:IOPlugin, cfg:{section:"header"}}]});
     * </xmp>
     * </p>
     * <p>
     * Plug.Host's protected <a href="#method_initPlugins">_initPlugins</a> and <a href="#method_destroyPlugins">_destroyPlugins</a>
     * methods should be invoked by the host class at the appropriate point in the host's lifecyle.
     * </p>
     *
     * @class Plugin.Host
     */

    var L = Y.Lang;

    function PluginHost() {
        this._plugins = {};
    }

    PluginHost.prototype = {

        /**
         * Adds a plugin to the host object. This will instantiate the
         * plugin and attach it to the configured namespace on the host object.
         *
         * @method plug
         * @chainable
         * @param P {Function | Object |Array} Accepts the plugin class, or an
         * object with a "fn" property specifying the plugin class and
         * a "cfg" property specifying the configuration for the Plugin.
         * <p>
         * Additionally an Array can also be passed in, with the above function or
         * object values, allowing the user to add multiple plugins in a single call.
         * </p>
         * @param config (Optional) If the first argument is the plugin class, the second argument
         * can be the configuration for the plugin.
         * @return {Base} A reference to the host object
         */
        plug: function(Plugin, config) {
            var i, ln, ns;

            if (L.isArray(Plugin)) {
                for (i = 0, ln = Plugin.length; i < ln; i++) {
                    this.plug(Plugin[i]);
                }
            } else {
                if (Plugin && !L.isFunction(Plugin)) {
                    config = Plugin.cfg;
                    Plugin = Plugin.fn;
                }

                // Plugin should be fn by now
                if (Plugin && Plugin.NS) {
                    ns = Plugin.NS;

                    config = config || {};
                    config.host = this;

                    if (this.hasPlugin(ns)) {
                        // Update config
                        if (this[ns].setAttrs) {
                            this[ns].setAttrs(config);
                        }
                    } else {
                        // Create new instance
                        this[ns] = new Plugin(config);
                        this._plugins[ns] = Plugin;
                    }
                }
            }
            return this;
        },

        /**
         * Removes a plugin from the host object. This will destroy the
         * plugin instance and delete the namespace from the host object.
         *
         * @method unplug
         * @param {String | Function} plugin The namespace of the plugin, or the plugin class with the static NS namespace property defined. If not provided,
         * all registered plugins are unplugged.
         * @return {Base} A reference to the host object
         * @chainable
         */
        unplug: function(plugin) {
            var ns = plugin,
                plugins = this._plugins;

            if (plugin) {
                if (L.isFunction(plugin)) {
                    ns = plugin.NS;
                    if (ns && (!plugins[ns] || plugins[ns] !== plugin)) {
                        ns = null;
                    }
                }

                if (ns) {
                    if (this[ns]) {
                        if (this[ns].destroy) {
                            this[ns].destroy();
                        }
                        delete this[ns];
                    }
                    if (plugins[ns]) {
                        delete plugins[ns];
                    }
                }
            } else {
                for (ns in this._plugins) {
                    if (this._plugins.hasOwnProperty(ns)) {
                        this.unplug(ns);
                    }
                }
            }
            return this;
        },

        /**
         * Determines if a plugin has plugged into this host.
         *
         * @method hasPlugin
         * @param {String} ns The plugin's namespace
         * @return {Plugin} Returns a truthy value (the plugin instance) if present, or undefined if not.
         */
        hasPlugin : function(ns) {
            return (this._plugins[ns] && this[ns]);
        },

        /**
         * Initializes static plugins registered on the host (using the
         * Base.plug static method) and any plugins passed to the
         * instance through the "plugins" configuration property.
         *
         * @method _initPlugins
         * @param {Object} config The configuration object with property name/value pairs.
         * @private
         */

        _initPlugins: function(config) {
            this._plugins = this._plugins || {};

            if (this._initConfigPlugins) {
                this._initConfigPlugins(config);
            }
        },

        /**
         * Unplugs and destroys all plugins on the host
         * @method _destroyPlugins
         * @private
         */
        _destroyPlugins: function() {
            this.unplug();
        }
    };

    Y.namespace("Plugin").Host = PluginHost;


}, '3.16.0', {"requires": ["yui-base"]});
