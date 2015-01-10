/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('widget-stack', function (Y, NAME) {

/**
 * Provides stackable (z-index) support for Widgets through an extension.
 *
 * @module widget-stack
 */
    var L = Y.Lang,
        UA = Y.UA,
        Node = Y.Node,
        Widget = Y.Widget,

        ZINDEX = "zIndex",
        SHIM = "shim",
        VISIBLE = "visible",

        BOUNDING_BOX = "boundingBox",

        RENDER_UI = "renderUI",
        BIND_UI = "bindUI",
        SYNC_UI = "syncUI",

        OFFSET_WIDTH = "offsetWidth",
        OFFSET_HEIGHT = "offsetHeight",
        PARENT_NODE = "parentNode",
        FIRST_CHILD = "firstChild",
        OWNER_DOCUMENT = "ownerDocument",

        WIDTH = "width",
        HEIGHT = "height",
        PX = "px",

        // HANDLE KEYS
        SHIM_DEFERRED = "shimdeferred",
        SHIM_RESIZE = "shimresize",

        // Events
        VisibleChange = "visibleChange",
        WidthChange = "widthChange",
        HeightChange = "heightChange",
        ShimChange = "shimChange",
        ZIndexChange = "zIndexChange",
        ContentUpdate = "contentUpdate",

        // CSS
        STACKED = "stacked";

    /**
     * Widget extension, which can be used to add stackable (z-index) support to the
     * base Widget class along with a shimming solution, through the
     * <a href="Base.html#method_build">Base.build</a> method.
     *
     * @class WidgetStack
     * @param {Object} User configuration object
     */
    function Stack(config) {}

    // Static Properties
    /**
     * Static property used to define the default attribute
     * configuration introduced by WidgetStack.
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    Stack.ATTRS = {
        /**
         * @attribute shim
         * @type boolean
         * @default false, for all browsers other than IE6, for which a shim is enabled by default.
         *
         * @description Boolean flag to indicate whether or not a shim should be added to the Widgets
         * boundingBox, to protect it from select box bleedthrough.
         */
        shim: {
            value: (UA.ie == 6)
        },

        /**
         * @attribute zIndex
         * @type number
         * @default 0
         * @description The z-index to apply to the Widgets boundingBox. Non-numerical values for
         * zIndex will be converted to 0
         */
        zIndex: {
            value : 0,
            setter: '_setZIndex'
        }
    };

    /**
     * The HTML parsing rules for the WidgetStack class.
     *
     * @property HTML_PARSER
     * @static
     * @type Object
     */
    Stack.HTML_PARSER = {
        zIndex: function (srcNode) {
            return this._parseZIndex(srcNode);
        }
    };

    /**
     * Default class used to mark the shim element
     *
     * @property SHIM_CLASS_NAME
     * @type String
     * @static
     * @default "yui3-widget-shim"
     */
    Stack.SHIM_CLASS_NAME = Widget.getClassName(SHIM);

    /**
     * Default class used to mark the boundingBox of a stacked widget.
     *
     * @property STACKED_CLASS_NAME
     * @type String
     * @static
     * @default "yui3-widget-stacked"
     */
    Stack.STACKED_CLASS_NAME = Widget.getClassName(STACKED);

    /**
     * Default markup template used to generate the shim element.
     *
     * @property SHIM_TEMPLATE
     * @type String
     * @static
     */
    Stack.SHIM_TEMPLATE = '<iframe class="' + Stack.SHIM_CLASS_NAME + '" frameborder="0" title="Widget Stacking Shim" src="javascript:false" tabindex="-1" role="presentation"></iframe>';

    Stack.prototype = {

        initializer : function() {
            this._stackNode = this.get(BOUNDING_BOX);
            this._stackHandles = {};

            // WIDGET METHOD OVERLAP
            Y.after(this._renderUIStack, this, RENDER_UI);
            Y.after(this._syncUIStack, this, SYNC_UI);
            Y.after(this._bindUIStack, this, BIND_UI);
        },

        /**
         * Synchronizes the UI to match the Widgets stack state. This method in
         * invoked after syncUI is invoked for the Widget class using YUI's aop infrastructure.
         *
         * @method _syncUIStack
         * @protected
         */
        _syncUIStack: function() {
            this._uiSetShim(this.get(SHIM));
            this._uiSetZIndex(this.get(ZINDEX));
        },

        /**
         * Binds event listeners responsible for updating the UI state in response to
         * Widget stack related state changes.
         * <p>
         * This method is invoked after bindUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _bindUIStack
         * @protected
         */
        _bindUIStack: function() {
            this.after(ShimChange, this._afterShimChange);
            this.after(ZIndexChange, this._afterZIndexChange);
        },

        /**
         * Creates/Initializes the DOM to support stackability.
         * <p>
         * This method in invoked after renderUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _renderUIStack
         * @protected
         */
        _renderUIStack: function() {
            this._stackNode.addClass(Stack.STACKED_CLASS_NAME);
        },

        /**
        Parses a `zIndex` attribute value from this widget's `srcNode`.

        @method _parseZIndex
        @param {Node} srcNode The node to parse a `zIndex` value from.
        @return {Mixed} The parsed `zIndex` value.
        @protected
        **/
        _parseZIndex: function (srcNode) {
            var zIndex;

            // Prefers how WebKit handles `z-index` which better matches the
            // spec:
            //
            // * http://www.w3.org/TR/CSS2/visuren.html#z-index
            // * https://bugs.webkit.org/show_bug.cgi?id=15562
            //
            // When a node isn't rendered in the document, and/or when a
            // node is not positioned, then it doesn't have a context to derive
            // a valid `z-index` value from.
            if (!srcNode.inDoc() || srcNode.getStyle('position') === 'static') {
                zIndex = 'auto';
            } else {
                // Uses `getComputedStyle()` because it has greater accuracy in
                // more browsers than `getStyle()` does for `z-index`.
                zIndex = srcNode.getComputedStyle('zIndex');
            }

            // This extension adds a stacking context to widgets, therefore a
            // `srcNode` witout a stacking context (i.e. "auto") will return
            // `null` from this DOM parser. This way the widget's default or
            // user provided value for `zIndex` will be used.
            return zIndex === 'auto' ? null : zIndex;
        },

        /**
         * Default setter for zIndex attribute changes. Normalizes zIndex values to
         * numbers, converting non-numerical values to 0.
         *
         * @method _setZIndex
         * @protected
         * @param {String | Number} zIndex
         * @return {Number} Normalized zIndex
         */
        _setZIndex: function(zIndex) {
            if (L.isString(zIndex)) {
                zIndex = parseInt(zIndex, 10);
            }
            if (!L.isNumber(zIndex)) {
                zIndex = 0;
            }
            return zIndex;
        },

        /**
         * Default attribute change listener for the shim attribute, responsible
         * for updating the UI, in response to attribute changes.
         *
         * @method _afterShimChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterShimChange : function(e) {
            this._uiSetShim(e.newVal);
        },

        /**
         * Default attribute change listener for the zIndex attribute, responsible
         * for updating the UI, in response to attribute changes.
         *
         * @method _afterZIndexChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterZIndexChange : function(e) {
            this._uiSetZIndex(e.newVal);
        },

        /**
         * Updates the UI to reflect the zIndex value passed in.
         *
         * @method _uiSetZIndex
         * @protected
         * @param {number} zIndex The zindex to be reflected in the UI
         */
        _uiSetZIndex: function (zIndex) {
            this._stackNode.setStyle(ZINDEX, zIndex);
        },

        /**
         * Updates the UI to enable/disable the shim. If the widget is not currently visible,
         * creation of the shim is deferred until it is made visible, for performance reasons.
         *
         * @method _uiSetShim
         * @protected
         * @param {boolean} enable If true, creates/renders the shim, if false, removes it.
         */
        _uiSetShim: function (enable) {
            if (enable) {
                // Lazy creation
                if (this.get(VISIBLE)) {
                    this._renderShim();
                } else {
                    this._renderShimDeferred();
                }

                // Eagerly attach resize handlers
                //
                // Required because of Event stack behavior, commit ref: cd8dddc
                // Should be revisted after Ticket #2531067 is resolved.
                if (UA.ie == 6) {
                    this._addShimResizeHandlers();
                }
            } else {
                this._destroyShim();
            }
        },

        /**
         * Sets up change handlers for the visible attribute, to defer shim creation/rendering
         * until the Widget is made visible.
         *
         * @method _renderShimDeferred
         * @private
         */
        _renderShimDeferred : function() {

            this._stackHandles[SHIM_DEFERRED] = this._stackHandles[SHIM_DEFERRED] || [];

            var handles = this._stackHandles[SHIM_DEFERRED],
                createBeforeVisible = function(e) {
                    if (e.newVal) {
                        this._renderShim();
                    }
                };

            handles.push(this.on(VisibleChange, createBeforeVisible));
            // Depending how how Ticket #2531067 is resolved, a reversal of
            // commit ref: cd8dddc could lead to a more elagent solution, with
            // the addition of this line here:
            //
            // handles.push(this.after(VisibleChange, this.sizeShim));
        },

        /**
         * Sets up event listeners to resize the shim when the size of the Widget changes.
         * <p>
         * NOTE: This method is only used for IE6 currently, since IE6 doesn't support a way to
         * resize the shim purely through CSS, when the Widget does not have an explicit width/height
         * set.
         * </p>
         * @method _addShimResizeHandlers
         * @private
         */
        _addShimResizeHandlers : function() {

            this._stackHandles[SHIM_RESIZE] = this._stackHandles[SHIM_RESIZE] || [];

            var sizeShim = this.sizeShim,
                handles = this._stackHandles[SHIM_RESIZE];

            handles.push(this.after(VisibleChange, sizeShim));
            handles.push(this.after(WidthChange, sizeShim));
            handles.push(this.after(HeightChange, sizeShim));
            handles.push(this.after(ContentUpdate, sizeShim));
        },

        /**
         * Detaches any handles stored for the provided key
         *
         * @method _detachStackHandles
         * @param String handleKey The key defining the group of handles which should be detached
         * @private
         */
        _detachStackHandles : function(handleKey) {
            var handles = this._stackHandles[handleKey],
                handle;

            if (handles && handles.length > 0) {
                while((handle = handles.pop())) {
                    handle.detach();
                }
            }
        },

        /**
         * Creates the shim element and adds it to the DOM
         *
         * @method _renderShim
         * @private
         */
        _renderShim : function() {
            var shimEl = this._shimNode,
                stackEl = this._stackNode;

            if (!shimEl) {
                shimEl = this._shimNode = this._getShimTemplate();
                stackEl.insertBefore(shimEl, stackEl.get(FIRST_CHILD));

                this._detachStackHandles(SHIM_DEFERRED);
                this.sizeShim();
            }
        },

        /**
         * Removes the shim from the DOM, and detaches any related event
         * listeners.
         *
         * @method _destroyShim
         * @private
         */
        _destroyShim : function() {
            if (this._shimNode) {
                this._shimNode.get(PARENT_NODE).removeChild(this._shimNode);
                this._shimNode = null;

                this._detachStackHandles(SHIM_DEFERRED);
                this._detachStackHandles(SHIM_RESIZE);
            }
        },

        /**
         * For IE6, synchronizes the size and position of iframe shim to that of
         * Widget bounding box which it is protecting. For all other browsers,
         * this method does not do anything.
         *
         * @method sizeShim
         */
        sizeShim: function () {
            var shim = this._shimNode,
                node = this._stackNode;

            if (shim && UA.ie === 6 && this.get(VISIBLE)) {
                shim.setStyle(WIDTH, node.get(OFFSET_WIDTH) + PX);
                shim.setStyle(HEIGHT, node.get(OFFSET_HEIGHT) + PX);
            }
        },

        /**
         * Creates a cloned shim node, using the SHIM_TEMPLATE html template, for use on a new instance.
         *
         * @method _getShimTemplate
         * @private
         * @return {Node} node A new shim Node instance.
         */
        _getShimTemplate : function() {
            return Node.create(Stack.SHIM_TEMPLATE, this._stackNode.get(OWNER_DOCUMENT));
        }
    };

    Y.WidgetStack = Stack;


}, '3.16.0', {"requires": ["base-build", "widget"], "skinnable": true});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('escape', function (Y, NAME) {

/**
Provides utility methods for escaping strings.

@module escape
@class Escape
@static
@since 3.3.0
**/

var HTML_CHARS = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;'
    },

Escape = {
    // -- Public Static Methods ------------------------------------------------

    /**
    Returns a copy of the specified string with special HTML characters
    escaped. The following characters will be converted to their
    corresponding character entities:

        & < > " ' / `

    This implementation is based on the [OWASP HTML escaping
    recommendations][1]. In addition to the characters in the OWASP
    recommendations, we also escape the <code>&#x60;</code> character, since IE
    interprets it as an attribute delimiter.

    If _string_ is not already a string, it will be coerced to a string.

    [1]: http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet

    @method html
    @param {String} string String to escape.
    @return {String} Escaped string.
    @static
    **/
    html: function (string) {
        return (string + '').replace(/[&<>"'\/`]/g, Escape._htmlReplacer);
    },

    /**
    Returns a copy of the specified string with special regular expression
    characters escaped, allowing the string to be used safely inside a regex.
    The following characters, and all whitespace characters, are escaped:

        - $ ^ * ( ) + [ ] { } | \ , . ?

    If _string_ is not already a string, it will be coerced to a string.

    @method regex
    @param {String} string String to escape.
    @return {String} Escaped string.
    @static
    **/
    regex: function (string) {
        // There's no need to escape !, =, and : since they only have meaning
        // when they follow a parenthesized ?, as in (?:...), and we already
        // escape parens and question marks.
        return (string + '').replace(/[\-$\^*()+\[\]{}|\\,.?\s]/g, '\\$&');
    },

    // -- Protected Static Methods ---------------------------------------------

    /**
     * Regex replacer for HTML escaping.
     *
     * @method _htmlReplacer
     * @param {String} match Matched character (must exist in HTML_CHARS).
     * @return {String} HTML entity.
     * @static
     * @protected
     */
    _htmlReplacer: function (match) {
        return HTML_CHARS[match];
    }
};

Escape.regexp = Escape.regex;

Y.Escape = Escape;


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-number-parse', function (Y, NAME) {

/**
 * Parse number submodule.
 *
 * @module datatype-number
 * @submodule datatype-number-parse
 * @for Number
 */

var safe = Y.Escape.regex,
    SPACES = '\\s*';

Y.mix(Y.namespace("Number"), {
    /**
     * Returns a parsing function for the given configuration.
     * It uses `Y.cached` so it expects the format spec separated into
     * individual values.
     * The method further uses closure to put together and save the
     * regular expresssion just once in the outer function.
     *
     * @method _buildParser
     * @param [prefix] {String} Prefix string to be stripped out.
     * @param [suffix] {String} Suffix string to be stripped out.
     * @param [separator] {String} Thousands separator to be stripped out.
     * @param [decimal] {String} Decimal separator to be replaced by a dot.
     * @return {Function} Parsing function.
     * @private
     */
    _buildParser: Y.cached(function (prefix, suffix, separator, decimal) {
        var regexBits = [],
            regex;

        if (prefix) {
            regexBits.push('^' + SPACES + safe(prefix) + SPACES);
        }
        if (suffix) {
            regexBits.push(SPACES + safe(suffix) + SPACES + '$');
        }
        if (separator) {
            regexBits.push(safe(separator) + '(?=\\d)');
        }

        regex = new RegExp('(?:' + regexBits.join('|') + ')', 'g');

        if (decimal === '.') {
            decimal = null;
        }
        return function (val) {
            val = val.replace(regex, '');

            return decimal ? val.replace(decimal, '.') : val;
        };
    }),
    /**
     * Converts data to type Number.
     * If a `config` argument is used, it will strip the `data` of the prefix,
     * the suffix and the thousands separator, if any of them are found,
     * replace the decimal separator by a dot and parse the resulting string.
     * Extra whitespace around the prefix and suffix will be ignored.
     *
     * @method parse
     * @param data {String | Number | Boolean} Data to convert. The following
     * values return as null: null, undefined, NaN, "".
     * @param [config] {Object} Optional configuration values, same as for [Y.Date.format](#method_format).
     * @param [config.prefix] {String} String to be removed from the start, like a currency designator "$"
     * @param [config.decimalPlaces] {Number} Ignored, it is accepted only for compatibility with [Y.Date.format](#method_format).
     * @param [config.decimalSeparator] {String} Decimal separator.
     * @param [config.thousandsSeparator] {String} Thousands separator.
     * @param [config.suffix] {String} String to be removed from the end of the number, like " items".
     * @return {Number} A number, or null.
     */

    parse: function(data, config) {
        var parser;

        if (config && typeof data === 'string') {
            parser = this._buildParser(config.prefix, config.suffix, config.thousandsSeparator, config.decimalSeparator);

            data = parser(data);
        }

        if (typeof data === 'string' && Y.Lang.trim(data) !== '') {
            data = +data;
        }
        
        // catch NaN and ±Infinity
        if (typeof data !== 'number' || !isFinite(data)) {
            data = null;
        }

        // on the same line to get stripped for raw/min.js by build system

        return data;
    }
});

// Add Parsers shortcut
Y.namespace("Parsers").number = Y.Number.parse;
Y.namespace("DataType");
Y.DataType.Number = Y.Number;


}, '3.16.0', {"requires": ["escape"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-number-format', function (Y, NAME) {

/**
 * The Number Utility provides type-conversion and string-formatting
 * convenience methods for Numbers.
 *
 * @module datatype-number
 * @main datatype-number
 */

/**
 * Format number submodule.
 *
 * @module datatype-number
 * @submodule datatype-number-format
 */

/**
 * Number provides a set of utility functions to operate against Number objects.
 *
 * @class Number
 * @static
 */
var LANG = Y.Lang;

Y.mix(Y.namespace("Number"), {
     /**
     * Takes a Number and formats to string for display to user.
     *
     * @method format
     * @param data {Number} Number.
     * @param config {Object} (Optional) Optional configuration values:
     *  <dl>
     *   <dt>prefix {String}</dd>
     *   <dd>String prepended before each number, like a currency designator "$"</dd>
     *   <dt>decimalPlaces {Number}</dd>
     *   <dd>Number of decimal places to round. Must be a number 0 to 20.</dd>
     *   <dt>decimalSeparator {String}</dd>
     *   <dd>Decimal separator</dd>
     *   <dt>thousandsSeparator {String}</dd>
     *   <dd>Thousands separator</dd>
     *   <dt>suffix {String}</dd>
     *   <dd>String appended after each number, like " items" (note the space)</dd>
     *  </dl>
     * @return {String} Formatted number for display. Note, the following values
     * return as "": null, undefined, NaN, "".
     */
    format: function(data, config) {
        if(LANG.isNumber(data)) {
            config = config || {};

            var isNeg = (data < 0),
                output = data + "",
                decPlaces = config.decimalPlaces,
                decSep = config.decimalSeparator || ".",
                thouSep = config.thousandsSeparator,
                decIndex,
                newOutput, count, i;

            // Decimal precision
            if(LANG.isNumber(decPlaces) && (decPlaces >= 0) && (decPlaces <= 20)) {
                // Round to the correct decimal place
                output = data.toFixed(decPlaces);
            }

            // Decimal separator
            if(decSep !== "."){
                output = output.replace(".", decSep);
            }

            // Add the thousands separator
            if(thouSep) {
                // Find the dot or where it would be
                decIndex = output.lastIndexOf(decSep);
                decIndex = (decIndex > -1) ? decIndex : output.length;
                // Start with the dot and everything to the right
                newOutput = output.substring(decIndex);
                // Working left, every third time add a separator, every time add a digit
                for (count = 0, i=decIndex; i>0; i--) {
                    if ((count%3 === 0) && (i !== decIndex) && (!isNeg || (i > 1))) {
                        newOutput = thouSep + newOutput;
                    }
                    newOutput = output.charAt(i-1) + newOutput;
                    count++;
                }
                output = newOutput;
            }

            // Prepend prefix
            output = (config.prefix) ? config.prefix + output : output;

            // Append suffix
            output = (config.suffix) ? output + config.suffix : output;

            return output;
        }
        // Not a Number, just return as string
        else {
            return (LANG.isValue(data) && data.toString) ? data.toString() : "";
        }
    }
});

Y.namespace("DataType");
Y.DataType.Number = Y.Number;


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-date-parse', function (Y, NAME) {

/**
 * Parse number submodule.
 *
 * @module datatype-date
 * @submodule datatype-date-parse
 * @for Date
 */
Y.mix(Y.namespace("Date"), {
    /**
     * Converts data to type Date.
     *
     * @method parse
     * @param data {Date|Number|String} date object, timestamp (string or number), or string parsable by Date.parse
     * @return {Date} a Date object or null if unable to parse
     */
    parse: function(data) {
        var val = new Date(+data || data);
        if (Y.Lang.isDate(val)) {
            return val;
        } else {
            return null;
        }
    }
});

// Add Parsers shortcut
Y.namespace("Parsers").date = Y.Date.parse;

Y.namespace("DataType");
Y.DataType.Date = Y.Date;


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("lang/datatype-date-format_en-US",function(e){e.Intl.add("datatype-date-format","en-US",{a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],c:"%a, %b %d, %Y %l:%M:%S %p %Z",p:["AM","PM"],P:["am","pm"],x:"%m/%d/%y",X:"%l:%M:%S %p"})},"3.16.0");
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-date-format', function (Y, NAME) {

/**
 * The `datatype` module is an alias for three utilities, Y.Date,
 * Y.Number and Y.XML, that provide type-conversion and string-formatting
 * convenience methods for various JavaScript object types.
 *
 * @module datatype
 * @main datatype
 */

/**
 * The Date Utility provides type-conversion and string-formatting
 * convenience methods for Dates.
 *
 * @module datatype-date
 * @main datatype-date
 */

/**
 * Date module.
 *
 * @module datatype-date
 */

/**
 * Format date module implements strftime formatters for javascript based on the
 * Open Group specification defined at
 * http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html
 * This implementation does not include modified conversion specifiers (i.e., Ex and Ox)
 *
 * @module datatype-date
 * @submodule datatype-date-format
 */

/**
 * Date provides a set of utility functions to operate against Date objects.
 *
 * @class Date
 * @static
 */

/**
 * Pad a number with leading spaces, zeroes or something else
 * @method xPad
 * @param x {Number}    The number to be padded
 * @param pad {String}  The character to pad the number with
 * @param r {Number}    (optional) The base of the pad, eg, 10 implies to two digits, 100 implies to 3 digits.
 * @private
 */
var xPad=function (x, pad, r)
{
    if(typeof r === "undefined")
    {
        r=10;
    }
    pad = pad + "";
    for( ; parseInt(x, 10)<r && r>1; r/=10) {
        x = pad + x;
    }
    return x.toString();
};

var Dt = {
    formats: {
        a: function (d, l) { return l.a[d.getDay()]; },
        A: function (d, l) { return l.A[d.getDay()]; },
        b: function (d, l) { return l.b[d.getMonth()]; },
        B: function (d, l) { return l.B[d.getMonth()]; },
        C: function (d) { return xPad(parseInt(d.getFullYear()/100, 10), 0); },
        d: ["getDate", "0"],
        e: ["getDate", " "],
        g: function (d) { return xPad(parseInt(Dt.formats.G(d)%100, 10), 0); },
        G: function (d) {
                var y = d.getFullYear();
                var V = parseInt(Dt.formats.V(d), 10);
                var W = parseInt(Dt.formats.W(d), 10);

                if(W > V) {
                    y++;
                } else if(W===0 && V>=52) {
                    y--;
                }

                return y;
            },
        H: ["getHours", "0"],
        I: function (d) { var I=d.getHours()%12; return xPad(I===0?12:I, 0); },
        j: function (d) {
                var gmd_1 = new Date("" + d.getFullYear() + "/1/1 GMT");
                var gmdate = new Date("" + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + " GMT");
                var ms = gmdate - gmd_1;
                var doy = parseInt(ms/60000/60/24, 10)+1;
                return xPad(doy, 0, 100);
            },
        k: ["getHours", " "],
        l: function (d) { var I=d.getHours()%12; return xPad(I===0?12:I, " "); },
        m: function (d) { return xPad(d.getMonth()+1, 0); },
        M: ["getMinutes", "0"],
        p: function (d, l) { return l.p[d.getHours() >= 12 ? 1 : 0 ]; },
        P: function (d, l) { return l.P[d.getHours() >= 12 ? 1 : 0 ]; },
        s: function (d, l) { return parseInt(d.getTime()/1000, 10); },
        S: ["getSeconds", "0"],
        u: function (d) { var dow = d.getDay(); return dow===0?7:dow; },
        U: function (d) {
                var doy = parseInt(Dt.formats.j(d), 10);
                var rdow = 6-d.getDay();
                var woy = parseInt((doy+rdow)/7, 10);
                return xPad(woy, 0);
            },
        V: function (d) {
                var woy = parseInt(Dt.formats.W(d), 10);
                var dow1_1 = (new Date("" + d.getFullYear() + "/1/1")).getDay();
                // First week is 01 and not 00 as in the case of %U and %W,
                // so we add 1 to the final result except if day 1 of the year
                // is a Monday (then %W returns 01).
                // We also need to subtract 1 if the day 1 of the year is
                // Friday-Sunday, so the resulting equation becomes:
                var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
                if(idow === 53 && (new Date("" + d.getFullYear() + "/12/31")).getDay() < 4)
                {
                    idow = 1;
                }
                else if(idow === 0)
                {
                    idow = Dt.formats.V(new Date("" + (d.getFullYear()-1) + "/12/31"));
                }

                return xPad(idow, 0);
            },
        w: "getDay",
        W: function (d) {
                var doy = parseInt(Dt.formats.j(d), 10);
                var rdow = 7-Dt.formats.u(d);
                var woy = parseInt((doy+rdow)/7, 10);
                return xPad(woy, 0, 10);
            },
        y: function (d) { return xPad(d.getFullYear()%100, 0); },
        Y: "getFullYear",
        z: function (d) {
                var o = d.getTimezoneOffset();
                var H = xPad(parseInt(Math.abs(o/60), 10), 0);
                var M = xPad(Math.abs(o%60), 0);
                return (o>0?"-":"+") + H + M;
            },
        Z: function (d) {
            var tz = d.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, "$2").replace(/[a-z ]/g, "");
            if(tz.length > 4) {
                tz = Dt.formats.z(d);
            }
            return tz;
        },
        "%": function (d) { return "%"; }
    },

    aggregates: {
        c: "locale",
        D: "%m/%d/%y",
        F: "%Y-%m-%d",
        h: "%b",
        n: "\n",
        r: "%I:%M:%S %p",
        R: "%H:%M",
        t: "\t",
        T: "%H:%M:%S",
        x: "locale",
        X: "locale"
        //"+": "%a %b %e %T %Z %Y"
    },

     /**
     * Takes a native JavaScript Date and formats it as a string for display to user.
     *
     * @for Date
     * @method format
     * @param oDate {Date} Date.
     * @param oConfig {Object} (Optional) Object literal of configuration values:
     *  <dl>
     *   <dt>format {HTML} (Optional)</dt>
     *   <dd>
     *   <p>
     *   Any strftime string is supported, such as "%I:%M:%S %p". strftime has several format specifiers defined by the Open group at
     *   <a href="http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html">http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html</a>
     *   PHP added a few of its own, defined at <a href="http://www.php.net/strftime">http://www.php.net/strftime</a>
     *   </p>
     *   <p>
     *   This javascript implementation supports all the PHP specifiers and a few more.  The full list is below.
     *   </p>
     *   <p>
     *   If not specified, it defaults to the ISO 8601 standard date format: %Y-%m-%d.
     *   </p>
     *   <dl>
     *  <dt>%a</dt> <dd>abbreviated weekday name according to the current locale</dd>
     *  <dt>%A</dt> <dd>full weekday name according to the current locale</dd>
     *  <dt>%b</dt> <dd>abbreviated month name according to the current locale</dd>
     *  <dt>%B</dt> <dd>full month name according to the current locale</dd>
     *  <dt>%c</dt> <dd>preferred date and time representation for the current locale</dd>
     *  <dt>%C</dt> <dd>century number (the year divided by 100 and truncated to an integer, range 00 to 99)</dd>
     *  <dt>%d</dt> <dd>day of the month as a decimal number (range 01 to 31)</dd>
     *  <dt>%D</dt> <dd>same as %m/%d/%y</dd>
     *  <dt>%e</dt> <dd>day of the month as a decimal number, a single digit is preceded by a space (range " 1" to "31")</dd>
     *  <dt>%F</dt> <dd>same as %Y-%m-%d (ISO 8601 date format)</dd>
     *  <dt>%g</dt> <dd>like %G, but without the century</dd>
     *  <dt>%G</dt> <dd>The 4-digit year corresponding to the ISO week number</dd>
     *  <dt>%h</dt> <dd>same as %b</dd>
     *  <dt>%H</dt> <dd>hour as a decimal number using a 24-hour clock (range 00 to 23)</dd>
     *  <dt>%I</dt> <dd>hour as a decimal number using a 12-hour clock (range 01 to 12)</dd>
     *  <dt>%j</dt> <dd>day of the year as a decimal number (range 001 to 366)</dd>
     *  <dt>%k</dt> <dd>hour as a decimal number using a 24-hour clock (range 0 to 23); single digits are preceded by a blank. (See also %H.)</dd>
     *  <dt>%l</dt> <dd>hour as a decimal number using a 12-hour clock (range 1 to 12); single digits are preceded by a blank. (See also %I.) </dd>
     *  <dt>%m</dt> <dd>month as a decimal number (range 01 to 12)</dd>
     *  <dt>%M</dt> <dd>minute as a decimal number</dd>
     *  <dt>%n</dt> <dd>newline character</dd>
     *  <dt>%p</dt> <dd>either "AM" or "PM" according to the given time value, or the corresponding strings for the current locale</dd>
     *  <dt>%P</dt> <dd>like %p, but lower case</dd>
     *  <dt>%r</dt> <dd>time in a.m. and p.m. notation equal to %I:%M:%S %p</dd>
     *  <dt>%R</dt> <dd>time in 24 hour notation equal to %H:%M</dd>
     *  <dt>%s</dt> <dd>number of seconds since the Epoch, ie, since 1970-01-01 00:00:00 UTC</dd>
     *  <dt>%S</dt> <dd>second as a decimal number</dd>
     *  <dt>%t</dt> <dd>tab character</dd>
     *  <dt>%T</dt> <dd>current time, equal to %H:%M:%S</dd>
     *  <dt>%u</dt> <dd>weekday as a decimal number [1,7], with 1 representing Monday</dd>
     *  <dt>%U</dt> <dd>week number of the current year as a decimal number, starting with the
     *          first Sunday as the first day of the first week</dd>
     *  <dt>%V</dt> <dd>The ISO 8601:1988 week number of the current year as a decimal number,
     *          range 01 to 53, where week 1 is the first week that has at least 4 days
     *          in the current year, and with Monday as the first day of the week.</dd>
     *  <dt>%w</dt> <dd>day of the week as a decimal, Sunday being 0</dd>
     *  <dt>%W</dt> <dd>week number of the current year as a decimal number, starting with the
     *          first Monday as the first day of the first week</dd>
     *  <dt>%x</dt> <dd>preferred date representation for the current locale without the time</dd>
     *  <dt>%X</dt> <dd>preferred time representation for the current locale without the date</dd>
     *  <dt>%y</dt> <dd>year as a decimal number without a century (range 00 to 99)</dd>
     *  <dt>%Y</dt> <dd>year as a decimal number including the century</dd>
     *  <dt>%z</dt> <dd>numerical time zone representation</dd>
     *  <dt>%Z</dt> <dd>time zone name or abbreviation</dd>
     *  <dt>%%</dt> <dd>a literal "%" character</dd>
     *   </dl>
     *  </dd>
     * </dl>
     * @return {HTML} Formatted date for display.
     */
    format : function (oDate, oConfig) {
        oConfig = oConfig || {};

        if(!Y.Lang.isDate(oDate)) {
            return Y.Lang.isValue(oDate) ? oDate : "";
        }

        var format, resources, compatMode, sLocale, LOCALE;

        format = oConfig.format || "%Y-%m-%d";

        resources = Y.Intl.get('datatype-date-format');

        var replace_aggs = function (m0, m1) {
            if (compatMode && m1 === "r") {
                return resources[m1];
            }
            var f = Dt.aggregates[m1];
            return (f === "locale" ? resources[m1] : f);
        };

        var replace_formats = function (m0, m1) {
            var f = Dt.formats[m1];
            switch(Y.Lang.type(f)) {
                case "string":                  // string => built in date function
                    return oDate[f]();
                case "function":                // function => our own function
                    return f.call(oDate, oDate, resources);
                case "array":                   // built in function with padding
                    if(Y.Lang.type(f[0]) === "string") {
                        return xPad(oDate[f[0]](), f[1]);
                    } // no break; (fall through to default:)
                default:
                    return m1;
            }
        };

        // First replace aggregates (run in a loop because an agg may be made up of other aggs)
        while(format.match(/%[cDFhnrRtTxX]/)) {
            format = format.replace(/%([cDFhnrRtTxX])/g, replace_aggs);
        }

        // Now replace formats (do not run in a loop otherwise %%a will be replace with the value of %a)
        var str = format.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, replace_formats);

        replace_aggs = replace_formats = undefined;

        return str;
    }
};

Y.mix(Y.namespace("Date"), Dt);


Y.namespace("DataType");
Y.DataType.Date = Y.Date;


}, '3.16.0', {
    "lang": [
        "ar",
        "ar-JO",
        "ca",
        "ca-ES",
        "da",
        "da-DK",
        "de",
        "de-AT",
        "de-DE",
        "el",
        "el-GR",
        "en",
        "en-AU",
        "en-CA",
        "en-GB",
        "en-IE",
        "en-IN",
        "en-JO",
        "en-MY",
        "en-NZ",
        "en-PH",
        "en-SG",
        "en-US",
        "es",
        "es-AR",
        "es-BO",
        "es-CL",
        "es-CO",
        "es-EC",
        "es-ES",
        "es-MX",
        "es-PE",
        "es-PY",
        "es-US",
        "es-UY",
        "es-VE",
        "fi",
        "fi-FI",
        "fr",
        "fr-BE",
        "fr-CA",
        "fr-FR",
        "hi",
        "hi-IN",
        "hu",
        "id",
        "id-ID",
        "it",
        "it-IT",
        "ja",
        "ja-JP",
        "ko",
        "ko-KR",
        "ms",
        "ms-MY",
        "nb",
        "nb-NO",
        "nl",
        "nl-BE",
        "nl-NL",
        "pl",
        "pl-PL",
        "pt",
        "pt-BR",
        "ro",
        "ro-RO",
        "ru",
        "ru-RU",
        "sv",
        "sv-SE",
        "th",
        "th-TH",
        "tr",
        "tr-TR",
        "vi",
        "vi-VN",
        "zh-Hans",
        "zh-Hans-CN",
        "zh-Hant",
        "zh-Hant-HK",
        "zh-Hant-TW"
    ]
});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-date-math', function (Y, NAME) {

/**
 * Date Math submodule.
 *
 * @module datatype-date
 * @submodule datatype-date-math
 * @for Date
 */
var LANG = Y.Lang;

Y.mix(Y.namespace("Date"), {

    /**
     * Checks whether a native JavaScript Date contains a valid value.
     * @for Date
     * @method isValidDate
     * @param oDate {Date} Date in the month for which the number of days is desired.
     * @return {Boolean} True if the date argument contains a valid value.
     */
     isValidDate : function (oDate) {
        if(LANG.isDate(oDate) && (isFinite(oDate)) && (oDate != "Invalid Date") && !isNaN(oDate) && (oDate != null)) {
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Checks whether two dates correspond to the same date and time.
     * @for Date
     * @method areEqual
     * @param aDate {Date} The first date to compare.
     * @param bDate {Date} The second date to compare.
     * @return {Boolean} True if the two dates correspond to the same
     * date and time.
     */
    areEqual : function (aDate, bDate) {
        return (this.isValidDate(aDate) && this.isValidDate(bDate) && (aDate.getTime() == bDate.getTime()));
    },

    /**
     * Checks whether the first date comes later than the second.
     * @for Date
     * @method isGreater
     * @param aDate {Date} The first date to compare.
     * @param bDate {Date} The second date to compare.
     * @return {Boolean} True if the first date is later than the second.
     */
    isGreater : function (aDate, bDate) {
        return (this.isValidDate(aDate) && this.isValidDate(bDate) && (aDate.getTime() > bDate.getTime()));
    },

    /**
     * Checks whether the first date comes later than or is the same as
     * the second.
     * @for Date
     * @method isGreaterOrEqual
     * @param aDate {Date} The first date to compare.
     * @param bDate {Date} The second date to compare.
     * @return {Boolean} True if the first date is later than or
     * the same as the second.
     */
    isGreaterOrEqual : function (aDate, bDate) {
        return (this.isValidDate(aDate) && this.isValidDate(bDate) && (aDate.getTime() >= bDate.getTime()));
    },


    /**
     * Checks whether the date is between two other given dates.
     * @for Date
     * @method isInRange
     * @param aDate {Date} The date to check
     * @param bDate {Date} Lower bound of the range.
     * @param cDate {Date} Higher bound of the range.
     * @return {Boolean} True if the date is between the two other given dates.
     */
    isInRange : function (aDate, bDate, cDate) {
        return (this.isGreaterOrEqual(aDate, bDate) && this.isGreaterOrEqual(cDate, aDate));
    },

    /**
     * Adds a specified number of days to the given date.
     * @for Date
     * @method addDays
     * @param oDate {Date} The date to add days to.
     * @param numDays {Number} The number of days to add (can be negative)
     * @return {Date} A new Date with the specified number of days
     * added to the original date.
     */
    addDays : function (oDate, numDays) {
        return new Date(oDate.getTime() + 86400000*numDays);
    },


    /**
     * Adds a specified number of months to the given date.
     * @for Date
     * @method addMonths
     * @param oDate {Date} The date to add months to.
     * @param numMonths {Number} The number of months to add (can be negative)
     * @return {Date} A new Date with the specified number of months
     * added to the original date.
     */
    addMonths : function (oDate, numMonths) {
        var newYear = oDate.getFullYear();
        var newMonth = oDate.getMonth() + numMonths;

        newYear  = Math.floor(newYear + newMonth / 12);
        newMonth = (newMonth % 12 + 12) % 12;

        var newDate = new Date (oDate.getTime());
        newDate.setFullYear(newYear);
        newDate.setMonth(newMonth);

        return newDate;
    },

    /**
     * Adds a specified number of years to the given date.
     * @for Date
     * @method addYears
     * @param oDate {Date} The date to add years to.
     * @param numYears {Number} The number of years to add (can be negative)
     * @return {Date} A new Date with the specified number of years
     * added to the original date.
     */
    addYears : function (oDate, numYears) {
        var newYear = oDate.getFullYear() + numYears;
        var newDate = new Date(oDate.getTime());

        newDate.setFullYear(newYear);
        return newDate;
    },

    /**
     * Lists all dates in a given month.
     * @for Date
     * @method listOfDatesInMonth
     * @param oDate {Date} The date corresponding to the month for
     * which a list of dates is required.
     * @return {Array} An `Array` of `Date`s from a given month.
     */
    listOfDatesInMonth : function (oDate) {
       if (!this.isValidDate(oDate)) {
         return [];
       }

       var daysInMonth = this.daysInMonth(oDate),
           year        = oDate.getFullYear(),
           month       = oDate.getMonth(),
           output      = [];

       for (var day = 1; day <= daysInMonth; day++) {
           output.push(new Date(year, month, day, 12, 0, 0));
       }

       return output;
    },

    /**
     * Takes a native JavaScript Date and returns the number of days
     * in the month that the given date belongs to.
     * @for Date
     * @method daysInMonth
     * @param oDate {Date} Date in the month for which the number
     * of days is desired.
     * @return {Number} A number (either 28, 29, 30 or 31) of days
     * in the given month.
     */
     daysInMonth : function (oDate) {
        if (!this.isValidDate(oDate)) {
            return 0;
        }

        var mon = oDate.getMonth();
        var lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (mon != 1) {
            return lengths[mon];
        }
        else {

            var year = oDate.getFullYear();
            if (year%400 === 0) {
                   return 29;
            }
            else if (year%100 === 0) {
                   return 28;
            }
            else if (year%4 === 0) {
                   return 29;
            }
            else {
                   return 28;
            }
       }
    }

});

Y.namespace("DataType");
Y.DataType.Date = Y.Date;


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-base', function (Y, NAME) {

/**
 * The Charts widget provides an api for displaying data
 * graphically.
 *
 * @module charts
 * @main charts
 */

/**
 * Provides functionality for the handling of axis data in a chart.
 *
 * @module charts
 * @submodule axis-base
 */
var Y_Lang = Y.Lang;

/**
 * The Renderer class is a base class for chart components that use the `styles`
 * attribute.
 *
 * @module charts
 * @class Renderer
 * @constructor
 */
function Renderer(){}

Renderer.ATTRS = {
        /**
         * Style properties for class
         *
         * @attribute styles
         * @type Object
         */
        styles:
        {
            getter: function()
            {
                this._styles = this._styles || this._getDefaultStyles();
                return this._styles;
            },

            setter: function(val)
            {
                this._styles = this._setStyles(val);
            }
        },

        /**
         * The graphic in which drawings will be rendered.
         *
         * @attribute graphic
         * @type Graphic
         */
        graphic: {}
};
Renderer.NAME = "renderer";

Renderer.prototype = {
    /**
     * Storage for `styles` attribute.
     *
     * @property _styles
     * @type Object
     * @private
     */
	_styles: null,

    /**
     * Method used by `styles` setter.
     *
     * @method _setStyles
     * @param {Object} newStyles Hash of properties to update.
     * @return Object
     * @protected
     */
	_setStyles: function(newstyles)
	{
		var styles = this.get("styles");
        return this._mergeStyles(newstyles, styles);
	},

    /**
     * Merges to object literals so that only specified properties are
     * overwritten.
     *
     * @method _mergeStyles
     * @param {Object} a Hash of new styles
     * @param {Object} b Hash of original styles
     * @return Object
     * @protected
     */
    _mergeStyles: function(a, b)
    {
        if(!b)
        {
            b = {};
        }
        var newstyles = Y.merge(b, {});
        Y.Object.each(a, function(value, key)
        {
            if(b.hasOwnProperty(key) && Y_Lang.isObject(value) && !Y_Lang.isFunction(value) && !Y_Lang.isArray(value))
            {
                newstyles[key] = this._mergeStyles(value, b[key]);
            }
            else
            {
                newstyles[key] = value;
            }
        }, this);
        return newstyles;
    },

    /**
     * Copies an object literal.
     *
     * @method _copyObject
     * @param {Object} obj Object literal to be copied.
     * @return Object
     * @private
     */
    _copyObject: function(obj) {
        var newObj = {},
            key,
            val;
        for(key in obj)
        {
            if(obj.hasOwnProperty(key))
            {
                val = obj[key];
                if(typeof val === "object" && !Y_Lang.isArray(val))
                {
                    newObj[key] = this._copyObject(val);
                }
                else
                {
                    newObj[key] = val;
                }
            }
        }
        return newObj;
    },

    /**
     * Gets the default value for the `styles` attribute.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function()
    {
        return {padding:{
            top:0,
            right: 0,
            bottom: 0,
            left: 0
        }};
    }
};

Y.augment(Renderer, Y.Attribute);
Y.Renderer = Renderer;

/**
 * The axis-base submodule contains functionality for the handling of axis data in a chart.
 *
 * @module charts
 * @submodule axis-base
 */
/**
 * An abstract class that provides the core functionality used by the following classes:
 * <ul>
 *      <li>{{#crossLink "CategoryAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "NumericAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "StackedAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "TimeAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "CategoryAxis"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "NumericAxis"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "StackedAxis"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "TimeAxis"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class AxisBase
 * @constructor
 * @extends Base
 * @uses Renderer
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-base
 */
Y.AxisBase = Y.Base.create("axisBase", Y.Base, [Y.Renderer], {
    /**
     * @method initializer
     * @private
     */
    initializer: function()
    {
        this.after("minimumChange", Y.bind(this._keyChangeHandler, this));
        this.after("maximumChange", Y.bind(this._keyChangeHandler, this));
        this.after("keysChange", this._keyChangeHandler);
        this.after("dataProviderChange", this._dataProviderChangeHandler);
    },

    /**
     * Returns the value corresponding to the origin on the axis.
     *
     * @method getOrigin
     * @return Number
     */
    getOrigin: function() {
        return this.get("minimum");
    },

    /**
     * Handles changes to `dataProvider`.
     *
     * @method _dataProviderChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _dataProviderChangeHandler: function()
    {
        var keyCollection = this.get("keyCollection").concat(),
            keys = this.get("keys"),
            i;
        if(keys)
        {
            for(i in keys)
            {
                if(keys.hasOwnProperty(i))
                {
                    delete keys[i];
                }
            }
        }
        if(keyCollection && keyCollection.length)
        {
            this.set("keys", keyCollection);
        }
    },

    /**
     * Calculates the maximum and minimum values for the `Data`.
     *
     * @method _updateMinAndMax
     * @private
     */
    _updateMinAndMax: function() {
    },

    /**
     * Constant used to generate unique id.
     *
     * @property GUID
     * @type String
     * @private
     */
    GUID: "yuibaseaxis",

    /**
     * Type of data used in `Axis`.
     *
     * @property _type
     * @type String
     * @readOnly
     * @private
     */
    _type: null,

    /**
     * Storage for `setMaximum` attribute.
     *
     * @property _setMaximum
     * @type Object
     * @private
     */
    _setMaximum: null,

    /**
     * Storage for `setMinimum` attribute.
     *
     * @property _setMinimum
     * @type Object
     * @private
     */
    _setMinimum: null,

    /**
     * Reference to data array.
     *
     * @property _data
     * @type Array
     * @private
     */
    _data: null,

    /**
     * Indicates whether the all data is up to date.
     *
     * @property _updateTotalDataFlag
     * @type Boolean
     * @private
     */
    _updateTotalDataFlag: true,

    /**
     * Storage for `dataReady` attribute.
     *
     * @property _dataReady
     * @type Boolean
     * @readOnly
     * @private
     */
    _dataReady: false,

    /**
     * Adds an array to the key hash.
     *
     * @method addKey
     * @param value Indicates what key to use in retrieving
     * the array.
     */
    addKey: function (value)
	{
        this.set("keys", value);
	},

    /**
     * Gets an array of values based on a key.
     *
     * @method _getKeyArray
     * @param {String} key Value key associated with the data array.
     * @param {Array} data Array in which the data resides.
     * @return Array
     * @private
     */
    _getKeyArray: function(key, data)
    {
        var i = 0,
            obj,
            keyArray = [],
            len = data.length;
        for(; i < len; ++i)
        {
            obj = data[i];
            keyArray[i] = obj[key];
        }
        return keyArray;
    },

    /**
     * Updates the total data array.
     *
     * @method _updateTotalData
     * @private
     */
    _updateTotalData: function()
    {
		var keys = this.get("keys"),
            i;
        this._data = [];
        for(i in keys)
        {
            if(keys.hasOwnProperty(i))
            {
                this._data = this._data.concat(keys[i]);
            }
        }
        this._updateTotalDataFlag = false;
    },

    /**
     * Removes an array from the key hash.
     *
     * @method removeKey
     * @param {String} value Indicates what key to use in removing from
     * the hash.
     */
    removeKey: function(value)
    {
        var keys = this.get("keys");
        if(keys.hasOwnProperty(value))
        {
            delete keys[value];
            this._keyChangeHandler();
        }
    },

    /**
     * Returns a value based of a key value and an index.
     *
     * @method getKeyValueAt
     * @param {String} key value used to look up the correct array
     * @param {Number} index within the array
     * @return Number
     */
    getKeyValueAt: function(key, index)
    {
        var value = NaN,
            keys = this.get("keys");
        if(keys[key] && Y_Lang.isNumber(parseFloat(keys[key][index])))
        {
            value = keys[key][index];
        }
        return parseFloat(value);
    },

    /**
     * Returns values based on key identifiers. When a string is passed as an argument, an array of values is returned.
     * When an array of keys is passed as an argument, an object literal with an array of values mapped to each key is
     * returned.
     *
     * @method getDataByKey
     * @param {String|Array} value value used to identify the array
     * @return Array|Object
     */
    getDataByKey: function (value)
    {
        var obj,
            i,
            len,
            key,
            keys = this.get("keys");
        if(Y_Lang.isArray(value))
        {
            obj = {};
            len = value.length;
            for(i = 0; i < len; i = i + 1)
            {
                key = value[i];
                if(keys[key])
                {
                    obj[key] = this.getDataByKey(key);
                }
            }
        }
        else if(keys[value])
        {
            obj = keys[value];
        }
        else
        {
            obj = null;
        }
        return obj;
    },

    /**
     * Returns the total number of majorUnits that will appear on an axis.
     *
     * @method getTotalMajorUnits
     * @return Number
     */
    getTotalMajorUnits: function()
    {
        var units,
            majorUnit = this.get("styles").majorUnit;
        units = majorUnit.count;
        return units;
    },

    /**
     * Gets the distance that the first and last ticks are offset from there respective
     * edges.
     *
     * @method getEdgeOffset
     * @param {Number} ct Number of ticks on the axis.
     * @param {Number} l Length (in pixels) of the axis.
     * @return Number
     */
    getEdgeOffset: function(ct, l)
    {
        var edgeOffset;
        if(this.get("calculateEdgeOffset")) {
            edgeOffset = (l/ct)/2;
        } else {
            edgeOffset = 0;
        }
        return edgeOffset;
    },

    /**
     * Updates the `Axis` after a change in keys.
     *
     * @method _keyChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _keyChangeHandler: function()
    {
        this._updateMinAndMax();
        this._updateTotalDataFlag = true;
        this.fire("dataUpdate");
    },

    /**
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function()
    {
        var axisstyles = {
            majorUnit: {
                determinant:"count",
                count:11,
                distance:75
            }
        };
        return axisstyles;
    },

    /**
     * Getter method for maximum attribute.
     *
     * @method _maximumGetter
     * @return Number
     * @private
     */
    _maximumGetter: function ()
    {
        var max = this.get("dataMaximum"),
            min = this.get("minimum");
        //If all values are zero, force a range so that the Axis and related series
        //will still render.
        if(min === 0 && max === 0)
        {
            max = 10;
        }
        if(Y_Lang.isNumber(this._setMaximum))
        {
            max = this._setMaximum;
        }
        return parseFloat(max);
    },

    /**
     * Setter method for maximum attribute.
     *
     * @method _maximumSetter
     * @param {Object} value
     * @private
     */
    _maximumSetter: function (value)
    {
        this._setMaximum = parseFloat(value);
        return value;
    },

    /**
     * Getter method for minimum attribute.
     *
     * @method _minimumGetter
     * @return Number
     * @private
     */
    _minimumGetter: function ()
    {
        var min = this.get("dataMinimum");
        if(Y_Lang.isNumber(this._setMinimum))
        {
            min = this._setMinimum;
        }
        return parseFloat(min);
    },

    /**
     * Setter method for minimum attribute.
     *
     * @method _minimumSetter
     * @param {Object} value
     * @private
     */
    _minimumSetter: function(val)
    {
        this._setMinimum = parseFloat(val);
        return val;
    },

    /**
     * Indicates whether or not the maximum attribute has been explicitly set.
     *
     * @method _getSetMax
     * @return Boolean
     * @private
     */
    _getSetMax: function()
    {
        return Y_Lang.isNumber(this._setMaximum);
    },


    /**
     * Returns and array of coordinates corresponding to an array of data values.
     *
     * @method _getCoordsFromValues
     * @param {Number} min The minimum for the axis.
     * @param {Number} max The maximum for the axis.
     * @param {Number} length The distance that the axis spans.
     * @param {Array} dataValues An array of values.
     * @param {Number} offset Value in which to offset the coordinates.
     * @param {Boolean} reverse Indicates whether the coordinates should start from
     * the end of an axis. Only used in the numeric implementation.
     * @return Array
     * @private
     */
    _getCoordsFromValues: function(min, max, length, dataValues, offset, reverse)
    {
        var i,
            valuecoords = [],
            len = dataValues.length;
        for(i = 0; i < len; i = i + 1)
        {
            valuecoords.push(this._getCoordFromValue.apply(this, [min, max, length, dataValues[i], offset, reverse]));
        }
        return valuecoords;
    },

    /**
     * Returns and array of data values based on the axis' range and number of values.
     *
     * @method _getDataValuesByCount
     * @param {Number} count The number of values to be used.
     * @param {Number} min The minimum value of the axis.
     * @param {Number} max The maximum value of the axis.
     * @return Array
     * @private
     */
    _getDataValuesByCount: function(count, min, max)
    {
        var dataValues = [],
            dataValue = min,
            len = count - 1,
            range = max - min,
            increm = range/len,
            i;
        for(i = 0; i < len; i = i + 1)
        {
            dataValues.push(dataValue);
            dataValue = dataValue + increm;
        }
        dataValues.push(max);
        return dataValues;
    },

    /**
     * Indicates whether or not the minimum attribute has been explicitly set.
     *
     * @method _getSetMin
     * @return Boolean
     * @private
     */
    _getSetMin: function()
    {
        return Y_Lang.isNumber(this._setMinimum);
    }
}, {
    ATTRS: {
        /**
         * Determines whether and offset is automatically calculated for the edges of the axis.
         *
         * @attribute calculateEdgeOffset
         * @type Boolean
         */
        calculateEdgeOffset: {
            value: false
        },

        labelFunction: {
            valueFn: function() {
                return this.formatLabel;
            }
        },

        /**
         * Hash of array identifed by a string value.
         *
         * @attribute keys
         * @type Object
         */
        keys: {
            value: {},

            setter: function(val)
            {
                var keys = {},
                    i,
                    len,
                    data = this.get("dataProvider");
                if(Y_Lang.isArray(val))
                {
                    len = val.length;
                    for(i = 0; i < len; ++i)
                    {
                        keys[val[i]] = this._getKeyArray(val[i], data);
                    }

                }
                else if(Y_Lang.isString(val))
                {
                    keys = this.get("keys");
                    keys[val] = this._getKeyArray(val, data);
                }
                else
                {
                    for(i in val)
                    {
                        if(val.hasOwnProperty(i))
                        {
                            keys[i] = this._getKeyArray(i, data);
                        }
                    }
                }
                this._updateTotalDataFlag = true;
                return keys;
            }
        },

        /**
         *Returns the type of axis data
         *  <dl>
         *      <dt>time</dt><dd>Manages time data</dd>
         *      <dt>stacked</dt><dd>Manages stacked numeric data</dd>
         *      <dt>numeric</dt><dd>Manages numeric data</dd>
         *      <dt>category</dt><dd>Manages categorical data</dd>
         *  </dl>
         *
         * @attribute type
         * @type String
         */
        type:
        {
            readOnly: true,

            getter: function ()
            {
                return this._type;
            }
        },

        /**
         * Instance of `ChartDataProvider` that the class uses
         * to build its own data.
         *
         * @attribute dataProvider
         * @type Array
         */
        dataProvider:{
            setter: function (value)
            {
                return value;
            }
        },

        /**
         * The maximum value contained in the `data` array. Used for
         * `maximum` when `autoMax` is true.
         *
         * @attribute dataMaximum
         * @type Number
         */
        dataMaximum: {
            getter: function ()
            {
                if(!Y_Lang.isNumber(this._dataMaximum))
                {
                    this._updateMinAndMax();
                }
                return this._dataMaximum;
            }
        },

        /**
         * The maximum value that will appear on an axis.
         *
         * @attribute maximum
         * @type Number
         */
        maximum: {
            lazyAdd: false,

            getter: "_maximumGetter",

            setter: "_maximumSetter"
        },

        /**
         * The minimum value contained in the `data` array. Used for
         * `minimum` when `autoMin` is true.
         *
         * @attribute dataMinimum
         * @type Number
         */
        dataMinimum: {
            getter: function ()
            {
                if(!Y_Lang.isNumber(this._dataMinimum))
                {
                    this._updateMinAndMax();
                }
                return this._dataMinimum;
            }
        },

        /**
         * The minimum value that will appear on an axis.
         *
         * @attribute minimum
         * @type Number
         */
        minimum: {
            lazyAdd: false,

            getter: "_minimumGetter",

            setter: "_minimumSetter"
        },

        /**
         * Determines whether the maximum is calculated or explicitly
         * set by the user.
         *
         * @attribute setMax
         * @type Boolean
         */
        setMax: {
            readOnly: true,

            getter: "_getSetMax"
        },

        /**
         * Determines whether the minimum is calculated or explicitly
         * set by the user.
         *
         * @attribute setMin
         * @type Boolean
         */
        setMin: {
            readOnly: true,

            getter: "_getSetMin"
        },

        /**
         * Array of axis data
         *
         * @attribute data
         * @type Array
         */
        data: {
            getter: function ()
            {
                if(!this._data || this._updateTotalDataFlag)
                {
                    this._updateTotalData();
                }
                return this._data;
            }
        },

        /**
         * Array containing all the keys in the axis.

         * @attribute keyCollection
         * @type Array
         */
        keyCollection: {
            getter: function()
            {
                var keys = this.get("keys"),
                    i,
                    col = [];
                for(i in keys)
                {
                    if(keys.hasOwnProperty(i))
                    {
                        col.push(i);
                    }
                }
                return col;
            },
            readOnly: true
        },

        /**
         * Object which should have by the labelFunction
         *
         * @attribute labelFunctionScope
         * @type Object
         */
        labelFunctionScope: {}
    }
});


}, '3.16.0', {"requires": ["classnamemanager", "datatype-number", "datatype-date", "base", "event-custom"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis', function (Y, NAME) {

/**
 * Provides base functionality for drawing chart axes.
 *
 * @module charts
 * @submodule axis
 */
var CONFIG = Y.config,
    DOCUMENT = CONFIG.doc,
    Y_Lang = Y.Lang,
    IS_STRING = Y_Lang.isString,
    Y_DOM = Y.DOM,
    LeftAxisLayout,
    RightAxisLayout,
    BottomAxisLayout,
    TopAxisLayout;
/**
 * Algorithmic strategy for rendering a left axis.
 *
 * @class LeftAxisLayout
 * @constructor
 * @submodule axis
 */
LeftAxisLayout = function() {};

LeftAxisLayout.prototype = {
    /**
     *  Default margins for text fields.
     *
     *  @private
     *  @method _getDefaultMargins
     *  @return Object
     */
    _getDefaultMargins: function()
    {
        return {
            top: 0,
            left: 0,
            right: 4,
            bottom: 0
        };
    },

    /**
     * Sets the length of the tick on either side of the axis line.
     *
     * @method setTickOffset
     * @protected
     */
    setTickOffsets: function()
    {
        var host = this,
            majorTicks = host.get("styles").majorTicks,
            tickLength = majorTicks.length,
            halfTick = tickLength * 0.5,
            display = majorTicks.display;
        host.set("topTickOffset",  0);
        host.set("bottomTickOffset",  0);

        switch(display)
        {
            case "inside" :
                host.set("rightTickOffset",  tickLength);
                host.set("leftTickOffset", 0);
            break;
            case "outside" :
                host.set("rightTickOffset", 0);
                host.set("leftTickOffset",  tickLength);
            break;
            case "cross":
                host.set("rightTickOffset", halfTick);
                host.set("leftTickOffset",  halfTick);
            break;
            default:
                host.set("rightTickOffset", 0);
                host.set("leftTickOffset", 0);
            break;
        }
    },

    /**
     * Draws a tick
     *
     * @method drawTick
     * @param {Path} path reference to the path `Path` element in which to draw the tick.
     * @param {Object} pt Point on the axis in which the tick will intersect.
     * @param {Object} tickStyle Hash of properties to apply to the tick.
     * @protected
     */
    drawTick: function(path, pt, tickStyles)
    {
        var host = this,
            style = host.get("styles"),
            padding = style.padding,
            tickLength = tickStyles.length,
            start = {x:padding.left, y:pt.y},
            end = {x:tickLength + padding.left, y:pt.y};
        host.drawLine(path, start, end);
    },

    /**
     * Calculates the coordinates for the first point on an axis.
     *
     * @method getLineStart
     * @return {Object}
     * @protected
     */
    getLineStart: function()
    {
        var style = this.get("styles"),
            padding = style.padding,
            majorTicks = style.majorTicks,
            tickLength = majorTicks.length,
            display = majorTicks.display,
            pt = {x:padding.left, y:0};
        if(display === "outside")
        {
            pt.x += tickLength;
        }
        else if(display === "cross")
        {
            pt.x += tickLength/2;
        }
        return pt;
    },

    /**
     * Calculates the point for a label.
     *
     * @method getLabelPoint
     * @param {Object} point Point on the axis in which the tick will intersect.
     * @return {Object}
     * @protected
     */
    getLabelPoint: function(point)
    {
        return {x:point.x - this.get("leftTickOffset"), y:point.y};
    },

    /**
     * Updates the value for the `maxLabelSize` for use in calculating total size.
     *
     * @method updateMaxLabelSize
     * @param {HTMLElement} label to measure
     * @protected
     */
    updateMaxLabelSize: function(labelWidth, labelHeight)
    {
        var host = this,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            sinRadians = props.sinRadians,
            cosRadians = props.cosRadians,
            max;
        if(rot === 0)
        {
            max = labelWidth;
        }
        else if(absRot === 90)
        {
            max = labelHeight;
        }
        else
        {
            max = (cosRadians * labelWidth) + (sinRadians * labelHeight);
        }
        host._maxLabelSize = Math.max(host._maxLabelSize, max);
    },

    /**
     * Determines the available label width when the axis width has been explicitly set.
     *
     * @method getExplicitlySized
     * @return Boolean
     * @protected
     */
    getExplicitlySized: function(styles)
    {
        if(this._explicitWidth)
        {
            var host = this,
                w = host._explicitWidth,
                totalTitleSize = host._totalTitleSize,
                leftTickOffset = host.get("leftTickOffset"),
                margin = styles.label.margin.right;
            host._maxLabelSize =  w - (leftTickOffset + margin + totalTitleSize);
            return true;
        }
        return false;
    },

    /**
     * Rotate and position title.
     *
     * @method positionTitle
     * @param {HTMLElement} label to rotate position
     * @protected
     */
    positionTitle: function(label)
    {
        var host = this,
            bounds = host._titleBounds,
            margin = host.get("styles").title.margin,
            props = host._titleRotationProps,
            w = bounds.right - bounds.left,
            labelWidth = label.offsetWidth,
            labelHeight = label.offsetHeight,
            x = (labelWidth * -0.5) + (w * 0.5),
            y = (host.get("height") * 0.5) - (labelHeight * 0.5);
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        if(margin && margin.left)
        {
            x += margin.left;
        }
        props.x = x;
        props.y = y;
        props.transformOrigin = [0.5, 0.5];
        host._rotate(label, props);
    },

    /**
     * Rotate and position labels.
     *
     * @method positionLabel
     * @param {HTMLElement} label to rotate position
     * @param {Object} pt hash containing the x and y coordinates in which the label will be positioned
     * against.
     * @protected
     */
    positionLabel: function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("leftTickOffset"),
            totalTitleSize = this._totalTitleSize,
            leftOffset = pt.x + totalTitleSize - tickOffset,
            topOffset = pt.y,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            maxLabelSize = host._maxLabelSize,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(rot === 0)
        {
            leftOffset -= labelWidth;
            topOffset -= labelHeight * offset;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset + labelWidth/2 - (labelWidth * offset);
        }
        else if(rot === -90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset - labelHeight + labelWidth/2 - (labelWidth * offset);
        }
        else
        {
            leftOffset -= labelWidth + (labelHeight * absRot/360);
            topOffset -= labelHeight * offset;
        }
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = Math.round(maxLabelSize + leftOffset);
        props.y = Math.round(topOffset);
        this._rotate(label, props);
    },

    /**
     * Adjusts the coordinates of an axis label based on the rotation.
     *
     * @method _setRotationCoords
     * @param {Object} props Coordinates, dimension and rotation properties of the label.
     * @protected
     */
    _setRotationCoords: function(props)
    {
        var rot = props.rot,
            absRot = props.absRot,
            leftOffset,
            topOffset,
            labelWidth = props.labelWidth,
            labelHeight = props.labelHeight;
        if(rot === 0)
        {
            leftOffset = labelWidth;
            topOffset = labelHeight * 0.5;
        }
        else if(rot === 90)
        {
            topOffset = 0;
            leftOffset = labelWidth * 0.5;
        }
        else if(rot === -90)
        {
            leftOffset = labelWidth * 0.5;
            topOffset = labelHeight;
        }
        else
        {
            leftOffset = labelWidth + (labelHeight * absRot/360);
            topOffset = labelHeight * 0.5;
        }
        props.x -= leftOffset;
        props.y -= topOffset;
    },

    /**
     * Returns the transformOrigin to use for an axis label based on the position of the axis
     * and the rotation of the label.
     *
     * @method _getTransformOrigin
     * @param {Number} rot The rotation (in degrees) of the label.
     * @return Array
     * @protected
     */
    _getTransformOrigin: function(rot)
    {
        var transformOrigin;
        if(rot === 0)
        {
            transformOrigin = [0, 0];
        }
        else if(rot === 90)
        {
            transformOrigin = [0.5, 0];
        }
        else if(rot === -90)
        {
            transformOrigin = [0.5, 1];
        }
        else
        {
            transformOrigin = [1, 0.5];
        }
        return transformOrigin;
    },

    /**
     * Adjust the position of the Axis widget's content box for internal axes.
     *
     * @method offsetNodeForTick
     * @param {Node} cb contentBox of the axis
     * @protected
     */
    offsetNodeForTick: function()
    {
    },

    /**
     * Sets the width of the axis based on its contents.
     *
     * @method setCalculatedSize
     * @protected
     */
    setCalculatedSize: function()
    {
        var host = this,
            graphic = this.get("graphic"),
            style = host.get("styles"),
            label = style.label,
            tickOffset = host.get("leftTickOffset"),
            max = host._maxLabelSize,
            totalTitleSize = this._totalTitleSize,
            ttl = Math.round(totalTitleSize + tickOffset + max + label.margin.right);
        if(this._explicitWidth)
        {
            ttl = this._explicitWidth;
        }
        this.set("calculatedWidth", ttl);
        graphic.set("x", ttl - tickOffset);
    }
};

Y.LeftAxisLayout = LeftAxisLayout;
/**
 * RightAxisLayout contains algorithms for rendering a right axis.
 *
 * @class RightAxisLayout
 * @constructor
 * @submodule axis
 */
RightAxisLayout = function(){};

RightAxisLayout.prototype = {
    /**
     *  Default margins for text fields.
     *
     *  @private
     *  @method _getDefaultMargins
     *  @return Object
     */
    _getDefaultMargins: function()
    {
        return {
            top: 0,
            left: 4,
            right: 0,
            bottom: 0
        };
    },

    /**
     * Sets the length of the tick on either side of the axis line.
     *
     * @method setTickOffset
     * @protected
     */
    setTickOffsets: function()
    {
        var host = this,
            majorTicks = host.get("styles").majorTicks,
            tickLength = majorTicks.length,
            halfTick = tickLength * 0.5,
            display = majorTicks.display;
        host.set("topTickOffset",  0);
        host.set("bottomTickOffset",  0);

        switch(display)
        {
            case "inside" :
                host.set("leftTickOffset", tickLength);
                host.set("rightTickOffset", 0);
            break;
            case "outside" :
                host.set("leftTickOffset", 0);
                host.set("rightTickOffset", tickLength);
            break;
            case "cross" :
                host.set("rightTickOffset", halfTick);
                host.set("leftTickOffset", halfTick);
            break;
            default:
                host.set("leftTickOffset", 0);
                host.set("rightTickOffset", 0);
            break;
        }
    },

    /**
     * Draws a tick
     *
     * @method drawTick
     * @param {Path} path reference to the path `Path` element in which to draw the tick.
     * @param {Object} pt Point on the axis in which the tick will intersect.
     * @param {Object} tickStyle Hash of properties to apply to the tick.
     * @protected
     */
    drawTick: function(path, pt, tickStyles)
    {
        var host = this,
            style = host.get("styles"),
            padding = style.padding,
            tickLength = tickStyles.length,
            start = {x:padding.left, y:pt.y},
            end = {x:padding.left + tickLength, y:pt.y};
        host.drawLine(path, start, end);
    },

    /**
     * Calculates the coordinates for the first point on an axis.
     *
     * @method getLineStart
     * @return {Object}
     * @protected
     */
    getLineStart: function()
    {
        var host = this,
            style = host.get("styles"),
            padding = style.padding,
            majorTicks = style.majorTicks,
            tickLength = majorTicks.length,
            display = majorTicks.display,
            pt = {x:padding.left, y:padding.top};
        if(display === "inside")
        {
            pt.x += tickLength;
        }
        else if(display === "cross")
        {
            pt.x += tickLength/2;
        }
        return pt;
    },

    /**
     * Calculates the point for a label.
     *
     * @method getLabelPoint
     * @param {Object} point Point on the axis in which the tick will intersect.
     * @return {Object}
     * @protected
     */
    getLabelPoint: function(point)
    {
        return {x:point.x + this.get("rightTickOffset"), y:point.y};
    },

    /**
     * Updates the value for the `maxLabelSize` for use in calculating total size.
     *
     * @method updateMaxLabelSize
     * @param {HTMLElement} label to measure
     * @protected
     */
    updateMaxLabelSize: function(labelWidth, labelHeight)
    {
        var host = this,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            sinRadians = props.sinRadians,
            cosRadians = props.cosRadians,
            max;
        if(rot === 0)
        {
            max = labelWidth;
        }
        else if(absRot === 90)
        {
            max = labelHeight;
        }
        else
        {
            max = (cosRadians * labelWidth) + (sinRadians * labelHeight);
        }
        host._maxLabelSize = Math.max(host._maxLabelSize, max);
    },

    /**
     * Determines the available label width when the axis width has been explicitly set.
     *
     * @method getExplicitlySized
     * @return Boolean
     * @protected
     */
    getExplicitlySized: function(styles)
    {
        if(this._explicitWidth)
        {
            var host = this,
                w = host._explicitWidth,
                totalTitleSize = this._totalTitleSize,
                rightTickOffset = host.get("rightTickOffset"),
                margin = styles.label.margin.right;
            host._maxLabelSize =  w - (rightTickOffset + margin + totalTitleSize);
            return true;
        }
        return false;
    },

    /**
     * Rotate and position title.
     *
     * @method positionTitle
     * @param {HTMLElement} label to rotate position
     * @protected
     */
    positionTitle: function(label)
    {
        var host = this,
            bounds = host._titleBounds,
            margin = host.get("styles").title.margin,
            props = host._titleRotationProps,
            labelWidth = label.offsetWidth,
            labelHeight = label.offsetHeight,
            w = bounds.right - bounds.left,
            x = this.get("width") - (labelWidth * 0.5) - (w * 0.5),
            y = (host.get("height") * 0.5) - (labelHeight * 0.5);
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        if(margin && margin.right)
        {
            x -= margin.left;
        }
        props.x = x;
        props.y = y;
        props.transformOrigin = [0.5, 0.5];
        host._rotate(label, props);
    },

    /**
     * Rotate and position labels.
     *
     * @method positionLabel
     * @param {HTMLElement} label to rotate position
     * @param {Object} pt hash containing the x and y coordinates in which the label will be positioned
     * against.
     * @protected
     */
    positionLabel: function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("rightTickOffset"),
            labelStyles = styles.label,
            margin = 0,
            leftOffset = pt.x,
            topOffset = pt.y,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(labelStyles.margin && labelStyles.margin.left)
        {
            margin = labelStyles.margin.left;
        }
        if(rot === 0)
        {
            topOffset -= labelHeight * offset;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset - labelHeight + labelWidth/2 - (labelWidth * offset);
        }
        else if(rot === -90)
        {
            topOffset = topOffset + labelWidth/2 - (labelWidth * offset);
            leftOffset -= labelWidth * 0.5;
        }
        else
        {
            topOffset -= labelHeight * offset;
            leftOffset += labelHeight/2 * absRot/90;
        }
        leftOffset += margin;
        leftOffset += tickOffset;
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = Math.round(leftOffset);
        props.y = Math.round(topOffset);
        this._rotate(label, props);
    },

    /**
     * Adjusts the coordinates of an axis label based on the rotation.
     *
     * @method _setRotationCoords
     * @param {Object} props Coordinates, dimension and rotation properties of the label.
     * @protected
     */
    _setRotationCoords: function(props)
    {
        var rot = props.rot,
            absRot = props.absRot,
            leftOffset = 0,
            topOffset = 0,
            labelWidth = props.labelWidth,
            labelHeight = props.labelHeight;
        if(rot === 0)
        {
            topOffset = labelHeight * 0.5;
        }
        else if(rot === 90)
        {
            leftOffset = labelWidth * 0.5;
            topOffset = labelHeight;
        }
        else if(rot === -90)
        {
            leftOffset = labelWidth * 0.5;
        }
        else
        {
            topOffset = labelHeight * 0.5;
            leftOffset = labelHeight/2 * absRot/90;
        }
        props.x -= leftOffset;
        props.y -= topOffset;
    },

    /**
     * Returns the transformOrigin to use for an axis label based on the position of the axis
     * and the rotation of the label.
     *
     * @method _getTransformOrigin
     * @param {Number} rot The rotation (in degrees) of the label.
     * @return Array
     * @protected
     */
    _getTransformOrigin: function(rot)
    {
        var transformOrigin;
        if(rot === 0)
        {
            transformOrigin = [0, 0];
        }
        else if(rot === 90)
        {
            transformOrigin = [0.5, 1];
        }
        else if(rot === -90)
        {
            transformOrigin = [0.5, 0];
        }
        else
        {
            transformOrigin = [0, 0.5];
        }
        return transformOrigin;
    },

    /**
     * Adjusts position for inner ticks.
     *
     * @method offsetNodeForTick
     * @param {Node} cb contentBox of the axis
     * @protected
     */
    offsetNodeForTick: function(cb)
    {
        var host = this,
            tickOffset = host.get("leftTickOffset"),
            offset = 0 - tickOffset;
        cb.setStyle("left", offset);
    },

    /**
     * Assigns a height based on the size of the contents.
     *
     * @method setCalculatedSize
     * @protected
     */
    setCalculatedSize: function()
    {
        var host = this,
            styles = host.get("styles"),
            labelStyle = styles.label,
            totalTitleSize = this._totalTitleSize,
            ttl = Math.round(host.get("rightTickOffset") + host._maxLabelSize + totalTitleSize + labelStyle.margin.left);
        if(this._explicitWidth)
        {
            ttl = this._explicitWidth;
        }
        host.set("calculatedWidth", ttl);
        host.get("contentBox").setStyle("width", ttl);
    }
};

Y.RightAxisLayout = RightAxisLayout;
/**
 * Contains algorithms for rendering a bottom axis.
 *
 * @class BottomAxisLayout
 * @Constructor
 * @submodule axis
 */
BottomAxisLayout = function(){};

BottomAxisLayout.prototype = {
    /**
     *  Default margins for text fields.
     *
     *  @private
     *  @method _getDefaultMargins
     *  @return Object
     */
    _getDefaultMargins: function()
    {
        return {
            top: 4,
            left: 0,
            right: 0,
            bottom: 0
        };
    },

    /**
     * Sets the length of the tick on either side of the axis line.
     *
     * @method setTickOffsets
     * @protected
     */
    setTickOffsets: function()
    {
        var host = this,
            majorTicks = host.get("styles").majorTicks,
            tickLength = majorTicks.length,
            halfTick = tickLength * 0.5,
            display = majorTicks.display;
        host.set("leftTickOffset",  0);
        host.set("rightTickOffset",  0);

        switch(display)
        {
            case "inside" :
                host.set("topTickOffset", tickLength);
                host.set("bottomTickOffset", 0);
            break;
            case "outside" :
                host.set("topTickOffset", 0);
                host.set("bottomTickOffset", tickLength);
            break;
            case "cross":
                host.set("topTickOffset",  halfTick);
                host.set("bottomTickOffset",  halfTick);
            break;
            default:
                host.set("topTickOffset", 0);
                host.set("bottomTickOffset", 0);
            break;
        }
    },

    /**
     * Calculates the coordinates for the first point on an axis.
     *
     * @method getLineStart
     * @protected
     */
    getLineStart: function()
    {
        var style = this.get("styles"),
            padding = style.padding,
            majorTicks = style.majorTicks,
            tickLength = majorTicks.length,
            display = majorTicks.display,
            pt = {x:0, y:padding.top};
        if(display === "inside")
        {
            pt.y += tickLength;
        }
        else if(display === "cross")
        {
            pt.y += tickLength/2;
        }
        return pt;
    },

    /**
     * Draws a tick
     *
     * @method drawTick
     * @param {Path} path reference to the path `Path` element in which to draw the tick.
     * @param {Object} pt hash containing x and y coordinates
     * @param {Object} tickStyles hash of properties used to draw the tick
     * @protected
     */
    drawTick: function(path, pt, tickStyles)
    {
        var host = this,
            style = host.get("styles"),
            padding = style.padding,
            tickLength = tickStyles.length,
            start = {x:pt.x, y:padding.top},
            end = {x:pt.x, y:tickLength + padding.top};
        host.drawLine(path, start, end);
    },

    /**
     * Calculates the point for a label.
     *
     * @method getLabelPoint
     * @param {Object} pt Object containing x and y coordinates
     * @return Object
     * @protected
     */
    getLabelPoint: function(point)
    {
        return {x:point.x, y:point.y + this.get("bottomTickOffset")};
    },

    /**
     * Updates the value for the `maxLabelSize` for use in calculating total size.
     *
     * @method updateMaxLabelSize
     * @param {HTMLElement} label to measure
     * @protected
     */
    updateMaxLabelSize: function(labelWidth, labelHeight)
    {
        var host = this,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            sinRadians = props.sinRadians,
            cosRadians = props.cosRadians,
            max;
        if(rot === 0)
        {
            max = labelHeight;
        }
        else if(absRot === 90)
        {
            max = labelWidth;
        }
        else
        {
            max = (sinRadians * labelWidth) + (cosRadians * labelHeight);
        }
        host._maxLabelSize = Math.max(host._maxLabelSize, max);
    },

    /**
     * Determines the available label height when the axis width has been explicitly set.
     *
     * @method getExplicitlySized
     * @return Boolean
     * @protected
     */
    getExplicitlySized: function(styles)
    {
        if(this._explicitHeight)
        {
            var host = this,
                h = host._explicitHeight,
                totalTitleSize = host._totalTitleSize,
                bottomTickOffset = host.get("bottomTickOffset"),
                margin = styles.label.margin.right;
            host._maxLabelSize =  h - (bottomTickOffset + margin + totalTitleSize);
            return true;
        }
        return false;
    },

    /**
     * Rotate and position title.
     *
     * @method positionTitle
     * @param {HTMLElement} label to rotate position
     * @protected
     */
    positionTitle: function(label)
    {
        var host = this,
            bounds = host._titleBounds,
            margin = host.get("styles").title.margin,
            props = host._titleRotationProps,
            h = bounds.bottom - bounds.top,
            labelWidth = label.offsetWidth,
            labelHeight = label.offsetHeight,
            x = (host.get("width") * 0.5) - (labelWidth * 0.5),
            y = host.get("height") - labelHeight/2 - h/2;
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        if(margin && margin.bottom)
        {
            y -= margin.bottom;
        }
        props.x = x;
        props.y = y;
        props.transformOrigin = [0.5, 0.5];
        host._rotate(label, props);
    },

    /**
     * Rotate and position labels.
     *
     * @method positionLabel
     * @param {HTMLElement} label to rotate position
     * @param {Object} pt hash containing the x and y coordinates in which the label will be positioned
     * against.
     * @protected
     */
    positionLabel: function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("bottomTickOffset"),
            labelStyles = styles.label,
            margin = 0,
            props = host._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            leftOffset = Math.round(pt.x),
            topOffset = Math.round(pt.y),
            labelWidth = host._labelWidths[i],
            labelHeight = host._labelHeights[i];
        if(labelStyles.margin && labelStyles.margin.top)
        {
            margin = labelStyles.margin.top;
        }
        if(rot === 90)
        {
            topOffset -= labelHeight/2 * rot/90;
            leftOffset = leftOffset + labelHeight/2 - (labelHeight * offset);
        }
        else if(rot === -90)
        {
            topOffset -= labelHeight/2 * absRot/90;
            leftOffset = leftOffset - labelWidth + labelHeight/2 - (labelHeight * offset);
        }
        else if(rot > 0)
        {
            leftOffset = leftOffset + labelHeight/2 - (labelHeight * offset);
            topOffset -= labelHeight/2 * rot/90;
        }
        else if(rot < 0)
        {
            leftOffset = leftOffset - labelWidth + labelHeight/2 - (labelHeight * offset);
            topOffset -= labelHeight/2 * absRot/90;
        }
        else
        {
            leftOffset -= labelWidth * offset;
        }
        topOffset += margin;
        topOffset += tickOffset;
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = leftOffset;
        props.y = topOffset;
        host._rotate(label, props);
    },

    /**
     * Adjusts the coordinates of an axis label based on the rotation.
     *
     * @method _setRotationCoords
     * @param {Object} props Coordinates, dimension and rotation properties of the label.
     * @protected
     */
    _setRotationCoords: function(props)
    {
        var rot = props.rot,
            absRot = props.absRot,
            labelWidth = props.labelWidth,
            labelHeight = props.labelHeight,
            leftOffset,
            topOffset;

        if(rot > 0)
        {
            leftOffset = 0;
            topOffset = labelHeight/2 * rot/90;
        }
        else if(rot < 0)
        {
            leftOffset = labelWidth;
            topOffset = labelHeight/2 * absRot/90;
        }
        else
        {
            leftOffset = labelWidth * 0.5;
            topOffset = 0;
        }
        props.x -= leftOffset;
        props.y -= topOffset;
    },

    /**
     * Returns the transformOrigin to use for an axis label based on the position of the axis
     * and the rotation of the label.
     *
     * @method _getTransformOrigin
     * @param {Number} rot The rotation (in degrees) of the label.
     * @return Array
     * @protected
     */
    _getTransformOrigin: function(rot)
    {
        var transformOrigin;
        if(rot > 0)
        {
            transformOrigin = [0, 0.5];
        }
        else if(rot < 0)
        {
            transformOrigin = [1, 0.5];
        }
        else
        {
            transformOrigin = [0, 0];
        }
        return transformOrigin;
    },

    /**
     * Adjusts position for inner ticks.
     *
     * @method offsetNodeForTick
     * @param {Node} cb contentBox of the axis
     * @protected
     */
    offsetNodeForTick: function(cb)
    {
        var host = this;
        cb.setStyle("top", 0 - host.get("topTickOffset"));
    },

    /**
     * Assigns a height based on the size of the contents.
     *
     * @method setCalculatedSize
     * @protected
     */
    setCalculatedSize: function()
    {
        var host = this,
            styles = host.get("styles"),
            labelStyle = styles.label,
            totalTitleSize = host._totalTitleSize,
            ttl = Math.round(host.get("bottomTickOffset") + host._maxLabelSize + labelStyle.margin.top + totalTitleSize);
        if(host._explicitHeight)
        {
            ttl = host._explicitHeight;
        }
        host.set("calculatedHeight", ttl);
    }
};
Y.BottomAxisLayout = BottomAxisLayout;
/**
 * Contains algorithms for rendering a top axis.
 *
 * @class TopAxisLayout
 * @constructor
 * @submodule axis
 */
TopAxisLayout = function(){};

TopAxisLayout.prototype = {
    /**
     *  Default margins for text fields.
     *
     *  @private
     *  @method _getDefaultMargins
     *  @return Object
     */
    _getDefaultMargins: function()
    {
        return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 4
        };
    },

    /**
     * Sets the length of the tick on either side of the axis line.
     *
     * @method setTickOffsets
     * @protected
     */
    setTickOffsets: function()
    {
        var host = this,
            majorTicks = host.get("styles").majorTicks,
            tickLength = majorTicks.length,
            halfTick = tickLength * 0.5,
            display = majorTicks.display;
        host.set("leftTickOffset",  0);
        host.set("rightTickOffset",  0);
        switch(display)
        {
            case "inside" :
                host.set("bottomTickOffset", tickLength);
                host.set("topTickOffset", 0);
            break;
            case "outside" :
                host.set("bottomTickOffset", 0);
                host.set("topTickOffset",  tickLength);
            break;
            case "cross" :
                host.set("topTickOffset", halfTick);
                host.set("bottomTickOffset", halfTick);
            break;
            default:
                host.set("topTickOffset", 0);
                host.set("bottomTickOffset", 0);
            break;
        }
    },

    /**
     * Calculates the coordinates for the first point on an axis.
     *
     * @method getLineStart
     * @protected
     */
    getLineStart: function()
    {
        var host = this,
            style = host.get("styles"),
            padding = style.padding,
            majorTicks = style.majorTicks,
            tickLength = majorTicks.length,
            display = majorTicks.display,
            pt = {x:0, y:padding.top};
        if(display === "outside")
        {
            pt.y += tickLength;
        }
        else if(display === "cross")
        {
            pt.y += tickLength/2;
        }
        return pt;
    },

    /**
     * Draws a tick
     *
     * @method drawTick
     * @param {Path} path reference to the path `Path` element in which to draw the tick.
     * @param {Object} pt hash containing x and y coordinates
     * @param {Object} tickStyles hash of properties used to draw the tick
     * @protected
     */
    drawTick: function(path, pt, tickStyles)
    {
        var host = this,
            style = host.get("styles"),
            padding = style.padding,
            tickLength = tickStyles.length,
            start = {x:pt.x, y:padding.top},
            end = {x:pt.x, y:tickLength + padding.top};
        host.drawLine(path, start, end);
    },

    /**
     * Calculates the point for a label.
     *
     * @method getLabelPoint
     * @param {Object} pt hash containing x and y coordinates
     * @return Object
     * @protected
     */
    getLabelPoint: function(pt)
    {
        return {x:pt.x, y:pt.y - this.get("topTickOffset")};
    },

    /**
     * Updates the value for the `maxLabelSize` for use in calculating total size.
     *
     * @method updateMaxLabelSize
     * @param {HTMLElement} label to measure
     * @protected
     */
    updateMaxLabelSize: function(labelWidth, labelHeight)
    {
        var host = this,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            sinRadians = props.sinRadians,
            cosRadians = props.cosRadians,
            max;
        if(rot === 0)
        {
            max = labelHeight;
        }
        else if(absRot === 90)
        {
            max = labelWidth;
        }
        else
        {
            max = (sinRadians * labelWidth) + (cosRadians * labelHeight);
        }
        host._maxLabelSize = Math.max(host._maxLabelSize, max);
    },

    /**
     * Determines the available label height when the axis width has been explicitly set.
     *
     * @method getExplicitlySized
     * @return Boolean
     * @protected
     */
    getExplicitlySized: function(styles)
    {
        if(this._explicitHeight)
        {
            var host = this,
                h = host._explicitHeight,
                totalTitleSize = host._totalTitleSize,
                topTickOffset = host.get("topTickOffset"),
                margin = styles.label.margin.right;
            host._maxLabelSize =  h - (topTickOffset + margin + totalTitleSize);
            return true;
        }
        return false;
    },

    /**
     * Rotate and position title.
     *
     * @method positionTitle
     * @param {HTMLElement} label to rotate position
     * @protected
     */
    positionTitle: function(label)
    {
        var host = this,
            bounds = host._titleBounds,
            margin = host.get("styles").title.margin,
            props = host._titleRotationProps,
            labelWidth = label.offsetWidth,
            labelHeight = label.offsetHeight,
            h = bounds.bottom - bounds.top,
            x = (host.get("width") * 0.5) - (labelWidth * 0.5),
            y = h/2 - labelHeight/2;
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        if(margin && margin.top)
        {
            y += margin.top;
        }
        props.x = x;
        props.y = y;
        props.transformOrigin = [0.5, 0.5];
        host._rotate(label, props);
    },

    /**
     * Rotate and position labels.
     *
     * @method positionLabel
     * @param {HTMLElement} label to rotate position
     * @param {Object} pt hash containing the x and y coordinates in which the label will be positioned
     * against.
     * @protected
     */
    positionLabel: function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            totalTitleSize = this._totalTitleSize,
            maxLabelSize = host._maxLabelSize,
            leftOffset = pt.x,
            topOffset = pt.y + totalTitleSize + maxLabelSize,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(rot === 0)
        {
            leftOffset -= labelWidth * offset;
            topOffset -= labelHeight;
        }
        else
        {
            if(rot === 90)
            {
                leftOffset = leftOffset - labelWidth + labelHeight/2 - (labelHeight * offset);
                topOffset -= (labelHeight * 0.5);
            }
            else if (rot === -90)
            {
                leftOffset = leftOffset + labelHeight/2 - (labelHeight * offset);
                topOffset -= (labelHeight * 0.5);
            }
            else if(rot > 0)
            {
                leftOffset = leftOffset - labelWidth + labelHeight/2 - (labelHeight * offset);
                topOffset -= labelHeight - (labelHeight * rot/180);
            }
            else
            {
                leftOffset = leftOffset + labelHeight/2 - (labelHeight * offset);
                topOffset -= labelHeight - (labelHeight * absRot/180);
            }
        }
        props.x = Math.round(leftOffset);
        props.y = Math.round(topOffset);
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        this._rotate(label, props);
    },

    /**
     * Adjusts the coordinates of an axis label based on the rotation.
     *
     * @method _setRotationCoords
     * @param {Object} props Coordinates, dimension and rotation properties of the label.
     * @protected
     */
    _setRotationCoords: function(props)
    {
        var rot = props.rot,
            absRot = props.absRot,
            labelWidth = props.labelWidth,
            labelHeight = props.labelHeight,
            leftOffset,
            topOffset;
        if(rot === 0)
        {
            leftOffset = labelWidth * 0.5;
            topOffset = labelHeight;
        }
        else
        {
            if(rot === 90)
            {
                leftOffset = labelWidth;
                topOffset = (labelHeight * 0.5);
            }
            else if (rot === -90)
            {
                topOffset = (labelHeight * 0.5);
            }
            else if(rot > 0)
            {
                leftOffset = labelWidth;
                topOffset = labelHeight - (labelHeight * rot/180);
            }
            else
            {
                topOffset = labelHeight - (labelHeight * absRot/180);
            }
        }
        props.x -= leftOffset;
        props.y -= topOffset;
    },

    /**
     * Returns the transformOrigin to use for an axis label based on the position of the axis
     * and the rotation of the label.
     *
     * @method _getTransformOrigin
     * @param {Number} rot The rotation (in degrees) of the label.
     * @return Array
     * @protected
     */
    _getTransformOrigin: function(rot)
    {
        var transformOrigin;
        if(rot === 0)
        {
            transformOrigin = [0, 0];
        }
        else
        {
            if(rot === 90)
            {
                transformOrigin = [1, 0.5];
            }
            else if (rot === -90)
            {
                transformOrigin = [0, 0.5];
            }
            else if(rot > 0)
            {
                transformOrigin = [1, 0.5];
            }
            else
            {
                transformOrigin = [0, 0.5];
            }
        }
        return transformOrigin;
    },

    /**
     * Adjusts position for inner ticks.
     *
     * @method offsetNodeForTick
     * @param {Node} cb contentBox of the axis
     * @protected
     */
    offsetNodeForTick: function()
    {
    },

    /**
     * Assigns a height based on the size of the contents.
     *
     * @method setCalculatedSize
     * @protected
     */
    setCalculatedSize: function()
    {
        var host = this,
            graphic = host.get("graphic"),
            styles = host.get("styles"),
            labelMargin = styles.label.margin,
            totalLabelSize = labelMargin.bottom + host._maxLabelSize,
            totalTitleSize = host._totalTitleSize,
            topTickOffset = this.get("topTickOffset"),
            ttl = Math.round(topTickOffset + totalLabelSize + totalTitleSize);
        if(this._explicitHeight)
        {
           ttl = this._explicitHeight;
        }
        host.set("calculatedHeight", ttl);
        graphic.set("y", ttl - topTickOffset);
    }
};
Y.TopAxisLayout = TopAxisLayout;

/**
 * An abstract class that provides the core functionality for draw a chart axis. Axis is used by the following classes:
 * <ul>
 *      <li>{{#crossLink "CategoryAxis"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "NumericAxis"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "StackedAxis"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "TimeAxis"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class Axis
 * @extends Widget
 * @uses AxisBase
 * @uses TopAxisLayout
 * @uses RightAxisLayout
 * @uses BottomAxisLayout
 * @uses LeftAxisLayout
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis
 */
Y.Axis = Y.Base.create("axis", Y.Widget, [Y.AxisBase], {
    /**
     * Calculates and returns a value based on the number of labels and the index of
     * the current label.
     *
     * @method getLabelByIndex
     * @param {Number} i Index of the label.
     * @param {Number} l Total number of labels.
     * @return String
     */
    getLabelByIndex: function(i, l)
    {
        var position = this.get("position"),
            direction = position === "left" || position === "right" ? "vertical" : "horizontal";
        return this._getLabelByIndex(i, l, direction);
    },

    /**
     * @method bindUI
     * @private
     */
    bindUI: function()
    {
        this.after("dataReady", Y.bind(this._dataChangeHandler, this));
        this.after("dataUpdate", Y.bind(this._dataChangeHandler, this));
        this.after("stylesChange", this._updateHandler);
        this.after("overlapGraphChange", this._updateHandler);
        this.after("positionChange", this._positionChangeHandler);
        this.after("widthChange", this._handleSizeChange);
        this.after("heightChange", this._handleSizeChange);
        this.after("calculatedWidthChange", this._handleSizeChange);
        this.after("calculatedHeightChange", this._handleSizeChange);
    },
    /**
     * Storage for calculatedWidth value.
     *
     * @property _calculatedWidth
     * @type Number
     * @private
     */
    _calculatedWidth: 0,

    /**
     * Storage for calculatedHeight value.
     *
     * @property _calculatedHeight
     * @type Number
     * @private
     */
    _calculatedHeight: 0,

    /**
     * Handles change to the dataProvider
     *
     * @method _dataChangeHandler
     * @param {Object} e Event object
     * @private
     */
    _dataChangeHandler: function()
    {
        if(this.get("rendered"))
        {
            this._drawAxis();
        }
    },

    /**
     * Handles change to the position attribute
     *
     * @method _positionChangeHandler
     * @param {Object} e Event object
     * @private
     */
    _positionChangeHandler: function(e)
    {
        this._updateGraphic(e.newVal);
        this._updateHandler();
    },

    /**
     * Updates the the Graphic instance
     *
     * @method _updateGraphic
     * @param {String} position Position of axis
     * @private
     */
    _updateGraphic: function(position)
    {
        var graphic = this.get("graphic");
        if(position === "none")
        {
            if(graphic)
            {
                graphic.destroy();
            }
        }
        else
        {
            if(!graphic)
            {
                this._setCanvas();
            }
        }
    },

    /**
     * Handles changes to axis.
     *
     * @method _updateHandler
     * @param {Object} e Event object
     * @private
     */
    _updateHandler: function()
    {
        if(this.get("rendered"))
        {
            this._drawAxis();
        }
    },

    /**
     * @method renderUI
     * @private
     */
    renderUI: function()
    {
        this._updateGraphic(this.get("position"));
    },

    /**
     * @method syncUI
     * @private
     */
    syncUI: function()
    {
        var layout = this._layout,
            defaultMargins,
            styles,
            label,
            title,
            i;
        if(layout)
        {
            defaultMargins = layout._getDefaultMargins();
            styles = this.get("styles");
            label = styles.label.margin;
            title =styles.title.margin;
            //need to defaultMargins method to the layout classes.
            for(i in defaultMargins)
            {
                if(defaultMargins.hasOwnProperty(i))
                {
                    label[i] = label[i] === undefined ? defaultMargins[i] : label[i];
                    title[i] = title[i] === undefined ? defaultMargins[i] : title[i];
                }
            }
        }
        this._drawAxis();
    },

    /**
     * Creates a graphic instance to be used for the axis line and ticks.
     *
     * @method _setCanvas
     * @private
     */
    _setCanvas: function()
    {
        var cb = this.get("contentBox"),
            bb = this.get("boundingBox"),
            p = this.get("position"),
            pn = this._parentNode,
            w = this.get("width"),
            h = this.get("height");
        bb.setStyle("position", "absolute");
        bb.setStyle("zIndex", 2);
        w = w ? w + "px" : pn.getStyle("width");
        h = h ? h + "px" : pn.getStyle("height");
        if(p === "top" || p === "bottom")
        {
            cb.setStyle("width", w);
        }
        else
        {
            cb.setStyle("height", h);
        }
        cb.setStyle("position", "relative");
        cb.setStyle("left", "0px");
        cb.setStyle("top", "0px");
        this.set("graphic", new Y.Graphic());
        this.get("graphic").render(cb);
    },

    /**
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function()
    {
        var axisstyles = {
            majorTicks: {
                display:"inside",
                length:4,
                color:"#dad8c9",
                weight:1,
                alpha:1
            },
            minorTicks: {
                display:"none",
                length:2,
                color:"#dad8c9",
                weight:1
            },
            line: {
                weight:1,
                color:"#dad8c9",
                alpha:1
            },
            majorUnit: {
                determinant:"count",
                count:11,
                distance:75
            },
            top: "0px",
            left: "0px",
            width: "100px",
            height: "100px",
            label: {
                color:"#808080",
                alpha: 1,
                fontSize:"85%",
                rotation: 0,
                offset: 0.5,
                margin: {
                    top: undefined,
                    right: undefined,
                    bottom: undefined,
                    left: undefined
                }
            },
            title: {
                color:"#808080",
                alpha: 1,
                fontSize:"85%",
                rotation: undefined,
                margin: {
                    top: undefined,
                    right: undefined,
                    bottom: undefined,
                    left: undefined
                }
            },
            hideOverlappingLabelTicks: false
        };

        return Y.merge(Y.Renderer.prototype._getDefaultStyles(), axisstyles);
    },

    /**
     * Updates the axis when the size changes.
     *
     * @method _handleSizeChange
     * @param {Object} e Event object.
     * @private
     */
    _handleSizeChange: function(e)
    {
        var attrName = e.attrName,
            pos = this.get("position"),
            vert = pos === "left" || pos === "right",
            cb = this.get("contentBox"),
            hor = pos === "bottom" || pos === "top";
        cb.setStyle("width", this.get("width"));
        cb.setStyle("height", this.get("height"));
        if((hor && attrName === "width") || (vert && attrName === "height"))
        {
            this._drawAxis();
        }
    },

    /**
     * Maps key values to classes containing layout algorithms
     *
     * @property _layoutClasses
     * @type Object
     * @private
     */
    _layoutClasses:
    {
        top : TopAxisLayout,
        bottom: BottomAxisLayout,
        left: LeftAxisLayout,
        right : RightAxisLayout
    },

    /**
     * Draws a line segment between 2 points
     *
     * @method drawLine
     * @param {Object} startPoint x and y coordinates for the start point of the line segment
     * @param {Object} endPoint x and y coordinates for the for the end point of the line segment
     * @param {Object} line styles (weight, color and alpha to be applied to the line segment)
     * @private
     */
    drawLine: function(path, startPoint, endPoint)
    {
        path.moveTo(startPoint.x, startPoint.y);
        path.lineTo(endPoint.x, endPoint.y);
    },

    /**
     * Generates the properties necessary for rotating and positioning a text field.
     *
     * @method _getTextRotationProps
     * @param {Object} styles properties for the text field
     * @return Object
     * @private
     */
    _getTextRotationProps: function(styles)
    {
        if(styles.rotation === undefined)
        {
            switch(this.get("position"))
            {
                case "left" :
                    styles.rotation = -90;
                break;
                case "right" :
                    styles.rotation = 90;
                break;
                default :
                    styles.rotation = 0;
                break;
            }
        }
        var rot =  Math.min(90, Math.max(-90, styles.rotation)),
            absRot = Math.abs(rot),
            radCon = Math.PI/180,
            sinRadians = parseFloat(parseFloat(Math.sin(absRot * radCon)).toFixed(8)),
            cosRadians = parseFloat(parseFloat(Math.cos(absRot * radCon)).toFixed(8));
        return {
            rot: rot,
            absRot: absRot,
            radCon: radCon,
            sinRadians: sinRadians,
            cosRadians: cosRadians,
            textAlpha: styles.alpha
        };
    },

    /**
     * Draws an axis.
     *
     * @method _drawAxis
     * @private
     */
    _drawAxis: function ()
    {
        if(this._drawing)
        {
            this._callLater = true;
            return;
        }
        this._drawing = true;
        this._callLater = false;
        if(this._layout)
        {
            var styles = this.get("styles"),
                line = styles.line,
                labelStyles = styles.label,
                majorTickStyles = styles.majorTicks,
                drawTicks = majorTickStyles.display !== "none",
                len,
                i = 0,
                layout = this._layout,
                layoutLength,
                lineStart,
                label,
                labelWidth,
                labelHeight,
                labelFunction = this.get("labelFunction"),
                labelFunctionScope = this.get("labelFunctionScope"),
                labelFormat = this.get("labelFormat"),
                graphic = this.get("graphic"),
                path = this.get("path"),
                tickPath,
                explicitlySized,
                position = this.get("position"),
                labelData,
                labelValues,
                point,
                points,
                firstPoint,
                lastPoint,
                firstLabel,
                lastLabel,
                staticCoord,
                dynamicCoord,
                edgeOffset,
                explicitLabels = this._labelValuesExplicitlySet ? this.get("labelValues") : null,
                direction = (position === "left" || position === "right") ? "vertical" : "horizontal";
            this._labelWidths = [];
            this._labelHeights = [];
            graphic.set("autoDraw", false);
            path.clear();
            path.set("stroke", {
                weight: line.weight,
                color: line.color,
                opacity: line.alpha
            });
            this._labelRotationProps = this._getTextRotationProps(labelStyles);
            this._labelRotationProps.transformOrigin = layout._getTransformOrigin(this._labelRotationProps.rot);
            layout.setTickOffsets.apply(this);
            layoutLength = this.getLength();

            len = this.getTotalMajorUnits();
            edgeOffset = this.getEdgeOffset(len, layoutLength);
            this.set("edgeOffset", edgeOffset);
            lineStart = layout.getLineStart.apply(this);

            if(direction === "vertical")
            {
                staticCoord = "x";
                dynamicCoord = "y";
            }
            else
            {
                staticCoord = "y";
                dynamicCoord = "x";
            }

            labelData = this._getLabelData(
                lineStart[staticCoord],
                staticCoord,
                dynamicCoord,
                this.get("minimum"),
                this.get("maximum"),
                edgeOffset,
                layoutLength - edgeOffset - edgeOffset,
                len,
                explicitLabels
            );

            points = labelData.points;
            labelValues = labelData.values;
            len = points.length;
            if(!this._labelValuesExplicitlySet)
            {
                this.set("labelValues", labelValues, {src: "internal"});
            }

            //Don't create the last label or tick.
            if(this.get("hideFirstMajorUnit"))
            {
                firstPoint = points.shift();
                firstLabel = labelValues.shift();
                len = len - 1;
            }

            //Don't create the last label or tick.
            if(this.get("hideLastMajorUnit"))
            {
                lastPoint = points.pop();
                lastLabel = labelValues.pop();
                len = len - 1;
            }

            if(len < 1)
            {
                this._clearLabelCache();
            }
            else
            {
                this.drawLine(path, lineStart, this.getLineEnd(lineStart));
                if(drawTicks)
                {
                    tickPath = this.get("tickPath");
                    tickPath.clear();
                    tickPath.set("stroke", {
                        weight: majorTickStyles.weight,
                        color: majorTickStyles.color,
                        opacity: majorTickStyles.alpha
                    });
                    for(i = 0; i < len; i = i + 1)
                    {
                        point = points[i];
                        if(point)
                        {
                            layout.drawTick.apply(this, [tickPath, points[i], majorTickStyles]);
                        }
                    }
                }
                this._createLabelCache();
                this._maxLabelSize = 0;
                this._totalTitleSize = 0;
                this._titleSize = 0;
                this._setTitle();
                explicitlySized = layout.getExplicitlySized.apply(this, [styles]);
                for(i = 0; i < len; i = i + 1)
                {
                    point = points[i];
                    if(point)
                    {
                        label = this.getLabel(labelStyles);
                        this._labels.push(label);
                        this.get("appendLabelFunction")(label, labelFunction.apply(labelFunctionScope, [labelValues[i], labelFormat]));
                        labelWidth = Math.round(label.offsetWidth);
                        labelHeight = Math.round(label.offsetHeight);
                        if(!explicitlySized)
                        {
                            this._layout.updateMaxLabelSize.apply(this, [labelWidth, labelHeight]);
                        }
                        this._labelWidths.push(labelWidth);
                        this._labelHeights.push(labelHeight);
                    }
                }
                this._clearLabelCache();
                if(this.get("overlapGraph"))
                {
                   layout.offsetNodeForTick.apply(this, [this.get("contentBox")]);
                }
                layout.setCalculatedSize.apply(this);
                if(this._titleTextField)
                {
                    this._layout.positionTitle.apply(this, [this._titleTextField]);
                }
                len = this._labels.length;
                for(i = 0; i < len; ++i)
                {
                    layout.positionLabel.apply(this, [this.get("labels")[i], points[i], styles, i]);
                }
                if(firstPoint)
                {
                    points.unshift(firstPoint);
                }
                if(lastPoint)
                {
                    points.push(lastPoint);
                }
                if(firstLabel)
                {
                    labelValues.unshift(firstLabel);
                }
                if(lastLabel)
                {
                    labelValues.push(lastLabel);
                }
                this._tickPoints = points;
            }
        }
        this._drawing = false;
        if(this._callLater)
        {
            this._drawAxis();
        }
        else
        {
            this._updatePathElement();
            this.fire("axisRendered");
        }
    },

    /**
     * Calculates and sets the total size of a title.
     *
     * @method _setTotalTitleSize
     * @param {Object} styles Properties for the title field.
     * @private
     */
    _setTotalTitleSize: function(styles)
    {
        var title = this._titleTextField,
            w = title.offsetWidth,
            h = title.offsetHeight,
            rot = this._titleRotationProps.rot,
            bounds,
            size,
            margin = styles.margin,
            position = this.get("position"),
            matrix = new Y.Matrix();
        matrix.rotate(rot);
        bounds = matrix.getContentRect(w, h);
        if(position === "left" || position === "right")
        {
            size = bounds.right - bounds.left;
            if(margin)
            {
                size += margin.left + margin.right;
            }
        }
        else
        {
            size = bounds.bottom - bounds.top;
            if(margin)
            {
                size += margin.top + margin.bottom;
            }
        }
        this._titleBounds = bounds;
        this._totalTitleSize = size;
    },

    /**
     *  Updates path.
     *
     *  @method _updatePathElement
     *  @private
     */
    _updatePathElement: function()
    {
        var path = this._path,
            tickPath = this._tickPath,
            redrawGraphic = false,
            graphic = this.get("graphic");
        if(path)
        {
            redrawGraphic = true;
            path.end();
        }
        if(tickPath)
        {
            redrawGraphic = true;
            tickPath.end();
        }
        if(redrawGraphic)
        {
            graphic._redraw();
        }
    },

    /**
     * Updates the content and style properties for a title field.
     *
     * @method _updateTitle
     * @private
     */
    _setTitle: function()
    {
        var i,
            styles,
            customStyles,
            title = this.get("title"),
            titleTextField = this._titleTextField,
            parentNode;
        if(title !== null && title !== undefined)
        {
            customStyles = {
                    rotation: "rotation",
                    margin: "margin",
                    alpha: "alpha"
            };
            styles = this.get("styles").title;
            if(!titleTextField)
            {
                titleTextField = DOCUMENT.createElement('span');
                titleTextField.style.display = "block";
                titleTextField.style.whiteSpace = "nowrap";
                titleTextField.setAttribute("class", "axisTitle");
                this.get("contentBox").append(titleTextField);
            }
            else if(!DOCUMENT.createElementNS)
            {
                if(titleTextField.style.filter)
                {
                    titleTextField.style.filter = null;
                }
            }
            titleTextField.style.position = "absolute";
            for(i in styles)
            {
                if(styles.hasOwnProperty(i) && !customStyles.hasOwnProperty(i))
                {
                    titleTextField.style[i] = styles[i];
                }
            }
            this.get("appendTitleFunction")(titleTextField, title);
            this._titleTextField = titleTextField;
            this._titleRotationProps = this._getTextRotationProps(styles);
            this._setTotalTitleSize(styles);
        }
        else if(titleTextField)
        {
            parentNode = titleTextField.parentNode;
            if(parentNode)
            {
                parentNode.removeChild(titleTextField);
            }
            this._titleTextField = null;
            this._totalTitleSize = 0;
        }
    },

    /**
     * Creates or updates an axis label.
     *
     * @method getLabel
     * @param {Object} styles styles applied to label
     * @return HTMLElement
     * @private
     */
    getLabel: function(styles)
    {
        var i,
            label,
            labelCache = this._labelCache,
            customStyles = {
                rotation: "rotation",
                margin: "margin",
                alpha: "alpha"
            };
        if(labelCache && labelCache.length > 0)
        {
            label = labelCache.shift();
        }
        else
        {
            label = DOCUMENT.createElement("span");
            label.className = Y.Lang.trim([label.className, "axisLabel"].join(' '));
            this.get("contentBox").append(label);
        }
        if(!DOCUMENT.createElementNS)
        {
            if(label.style.filter)
            {
                label.style.filter = null;
            }
        }
        label.style.display = "block";
        label.style.whiteSpace = "nowrap";
        label.style.position = "absolute";
        for(i in styles)
        {
            if(styles.hasOwnProperty(i) && !customStyles.hasOwnProperty(i))
            {
                label.style[i] = styles[i];
            }
        }
        return label;
    },

    /**
     * Creates a cache of labels that can be re-used when the axis redraws.
     *
     * @method _createLabelCache
     * @private
     */
    _createLabelCache: function()
    {
        if(this._labels)
        {
            while(this._labels.length > 0)
            {
                this._labelCache.push(this._labels.shift());
            }
        }
        else
        {
            this._clearLabelCache();
        }
        this._labels = [];
    },

    /**
     * Removes axis labels from the dom and clears the label cache.
     *
     * @method _clearLabelCache
     * @private
     */
    _clearLabelCache: function()
    {
        if(this._labelCache)
        {
            var len = this._labelCache.length,
                i = 0,
                label;
            for(; i < len; ++i)
            {
                label = this._labelCache[i];
                this._removeChildren(label);
                Y.Event.purgeElement(label, true);
                label.parentNode.removeChild(label);
            }
        }
        this._labelCache = [];
    },

    /**
     * Gets the end point of an axis.
     *
     * @method getLineEnd
     * @return Object
     * @private
     */
    getLineEnd: function(pt)
    {
        var w = this.get("width"),
            h = this.get("height"),
            pos = this.get("position");
        if(pos === "top" || pos === "bottom")
        {
            return {x:w, y:pt.y};
        }
        else
        {
            return {x:pt.x, y:h};
        }
    },

    /**
     * Calcuates the width or height of an axis depending on its direction.
     *
     * @method getLength
     * @return Number
     * @private
     */
    getLength: function()
    {
        var l,
            style = this.get("styles"),
            padding = style.padding,
            w = this.get("width"),
            h = this.get("height"),
            pos = this.get("position");
        if(pos === "top" || pos === "bottom")
        {
            l = w - (padding.left + padding.right);
        }
        else
        {
            l = h - (padding.top + padding.bottom);
        }
        return l;
    },

    /**
     * Gets the position of the first point on an axis.
     *
     * @method getFirstPoint
     * @param {Object} pt Object containing x and y coordinates.
     * @return Object
     * @private
     */
    getFirstPoint:function(pt)
    {
        var style = this.get("styles"),
            pos = this.get("position"),
            padding = style.padding,
            np = {x:pt.x, y:pt.y};
        if(pos === "top" || pos === "bottom")
        {
            np.x += padding.left + this.get("edgeOffset");
        }
        else
        {
            np.y += this.get("height") - (padding.top + this.get("edgeOffset"));
        }
        return np;
    },

    /**
     * Rotates and positions a text field.
     *
     * @method _rotate
     * @param {HTMLElement} label text field to rotate and position
     * @param {Object} props properties to be applied to the text field.
     * @private
     */
    _rotate: function(label, props)
    {
        var rot = props.rot,
            x = props.x,
            y = props.y,
            filterString,
            textAlpha,
            matrix = new Y.Matrix(),
            transformOrigin = props.transformOrigin || [0, 0],
            offsetRect;
        if(DOCUMENT.createElementNS)
        {
            matrix.translate(x, y);
            matrix.rotate(rot);
            Y_DOM.setStyle(label, "transformOrigin", (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%");
            Y_DOM.setStyle(label, "transform", matrix.toCSSText());
        }
        else
        {
            textAlpha = props.textAlpha;
            if(Y_Lang.isNumber(textAlpha) && textAlpha < 1 && textAlpha > -1 && !isNaN(textAlpha))
            {
                filterString = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + Math.round(textAlpha * 100) + ")";
            }
            if(rot !== 0)
            {
                //ms filters kind of, sort of uses a transformOrigin of 0, 0.
                //we'll translate the difference to create a true 0, 0 origin.
                matrix.rotate(rot);
                offsetRect = matrix.getContentRect(props.labelWidth, props.labelHeight);
                matrix.init();
                matrix.translate(offsetRect.left, offsetRect.top);
                matrix.translate(x, y);
                this._simulateRotateWithTransformOrigin(matrix, rot, transformOrigin, props.labelWidth, props.labelHeight);
                if(filterString)
                {
                    filterString += " ";
                }
                else
                {
                    filterString = "";
                }
                filterString += matrix.toFilterText();
                label.style.left = matrix.dx + "px";
                label.style.top = matrix.dy + "px";
            }
            else
            {
                label.style.left = x + "px";
                label.style.top = y + "px";
            }
            if(filterString)
            {
                label.style.filter = filterString;
            }
        }
    },

    /**
     * Simulates a rotation with a specified transformOrigin.
     *
     * @method _simulateTransformOrigin
     * @param {Matrix} matrix Reference to a `Matrix` instance.
     * @param {Number} rot The rotation (in degrees) that will be performed on a matrix.
     * @param {Array} transformOrigin An array represeniting the origin in which to perform the transform. The first
     * index represents the x origin and the second index represents the y origin.
     * @param {Number} w The width of the object that will be transformed.
     * @param {Number} h The height of the object that will be transformed.
     * @private
     */
    _simulateRotateWithTransformOrigin: function(matrix, rot, transformOrigin, w, h)
    {
        var transformX = transformOrigin[0] * w,
            transformY = transformOrigin[1] * h;
        transformX = !isNaN(transformX) ? transformX : 0;
        transformY = !isNaN(transformY) ? transformY : 0;
        matrix.translate(transformX, transformY);
        matrix.rotate(rot);
        matrix.translate(-transformX, -transformY);
    },

    /**
     * Returns the coordinates (top, right, bottom, left) for the bounding box of the last label.
     *
     * @method getMaxLabelBounds
     * @return Object
     */
    getMaxLabelBounds: function()
    {
        return this._getLabelBounds(this.getMaximumValue());
    },

    /**
     * Returns the coordinates (top, right, bottom, left) for the bounding box of the first label.
     *
     * @method getMinLabelBounds
     * @return Object
     */
    getMinLabelBounds: function()
    {
        return this._getLabelBounds(this.getMinimumValue());
    },

    /**
     * Returns the coordinates (top, right, bottom, left) for the bounding box of a label.
     *
     * @method _getLabelBounds
     * @param {String} Value of the label
     * @return Object
     * @private
     */
    _getLabelBounds: function(val)
    {
        var layout = this._layout,
            labelStyles = this.get("styles").label,
            matrix = new Y.Matrix(),
            label,
            props = this._getTextRotationProps(labelStyles);
            props.transformOrigin = layout._getTransformOrigin(props.rot);
        label = this.getLabel(labelStyles);
        this.get("appendLabelFunction")(label, this.get("labelFunction").apply(this, [val, this.get("labelFormat")]));
        props.labelWidth = label.offsetWidth;
        props.labelHeight = label.offsetHeight;
        this._removeChildren(label);
        Y.Event.purgeElement(label, true);
        label.parentNode.removeChild(label);
        props.x = 0;
        props.y = 0;
        layout._setRotationCoords(props);
        matrix.translate(props.x, props.y);
        this._simulateRotateWithTransformOrigin(matrix, props.rot, props.transformOrigin, props.labelWidth, props.labelHeight);
        return matrix.getContentRect(props.labelWidth, props.labelHeight);
    },

    /**
     * Removes all DOM elements from an HTML element. Used to clear out labels during detruction
     * phase.
     *
     * @method _removeChildren
     * @private
     */
    _removeChildren: function(node)
    {
        if(node.hasChildNodes())
        {
            var child;
            while(node.firstChild)
            {
                child = node.firstChild;
                this._removeChildren(child);
                node.removeChild(child);
            }
        }
    },

    /**
     * Destructor implementation Axis class. Removes all labels and the Graphic instance from the widget.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        var cb = this.get("contentBox").getDOMNode(),
            labels = this.get("labels"),
            graphic = this.get("graphic"),
            label,
            len = labels ? labels.length : 0;
        if(len > 0)
        {
            while(labels.length > 0)
            {
                label = labels.shift();
                this._removeChildren(label);
                cb.removeChild(label);
                label = null;
            }
        }
        if(graphic)
        {
            graphic.destroy();
        }
    },

    /**
     * Length in pixels of largest text bounding box. Used to calculate the height of the axis.
     *
     * @property maxLabelSize
     * @type Number
     * @protected
     */
    _maxLabelSize: 0,

    /**
     * Updates the content of text field. This method writes a value into a text field using
     * `appendChild`. If the value is a `String`, it is converted to a `TextNode` first.
     *
     * @method _setText
     * @param label {HTMLElement} label to be updated
     * @param val {String} value with which to update the label
     * @private
     */
    _setText: function(textField, val)
    {
        textField.innerHTML = "";
        if(Y_Lang.isNumber(val))
        {
            val = val + "";
        }
        else if(!val)
        {
            val = "";
        }
        if(IS_STRING(val))
        {
            val = DOCUMENT.createTextNode(val);
        }
        textField.appendChild(val);
    },

    /**
     * Returns the total number of majorUnits that will appear on an axis.
     *
     * @method getTotalMajorUnits
     * @return Number
     */
    getTotalMajorUnits: function()
    {
        var units,
            majorUnit = this.get("styles").majorUnit,
            len;
        if(majorUnit.determinant === "count")
        {
            units = majorUnit.count;
        }
        else if(majorUnit.determinant === "distance")
        {
            len = this.getLength();
            units = (len/majorUnit.distance) + 1;
        }
        return units;
    },

    /**
     * Returns the distance between major units on an axis.
     *
     * @method getMajorUnitDistance
     * @param {Number} len Number of ticks
     * @param {Number} uiLen Size of the axis.
     * @param {Object} majorUnit Hash of properties used to determine the majorUnit
     * @return Number
     */
    getMajorUnitDistance: function(len, uiLen, majorUnit)
    {
        var dist;
        if(majorUnit.determinant === "count")
        {
            if(!this.get("calculateEdgeOffset"))
            {
                len = len - 1;
            }
            dist = uiLen/len;
        }
        else if(majorUnit.determinant === "distance")
        {
            dist = majorUnit.distance;
        }
        return dist;
    },

    /**
     * Checks to see if data extends beyond the range of the axis. If so,
     * that data will need to be hidden. This method is internal, temporary and subject
     * to removal in the future.
     *
     * @method _hasDataOverflow
     * @protected
     * @return Boolean
     */
    _hasDataOverflow: function()
    {
        if(this.get("setMin") || this.get("setMax"))
        {
            return true;
        }
        return false;
    },

    /**
     * Returns a string corresponding to the first label on an
     * axis.
     *
     * @method getMinimumValue
     * @return String
     */
    getMinimumValue: function()
    {
        return this.get("minimum");
    },

    /**
     * Returns a string corresponding to the last label on an
     * axis.
     *
     * @method getMaximumValue
     * @return String
     */
    getMaximumValue: function()
    {
        return this.get("maximum");
    }
}, {
    ATTRS:
    {
        /**
         * When set, defines the width of a vertical axis instance. By default, vertical axes automatically size based
         * on their contents. When the width attribute is set, the axis will not calculate its width. When the width
         * attribute is explicitly set, axis labels will postion themselves off of the the inner edge of the axis and the
         * title, if present, will position itself off of the outer edge. If a specified width is less than the sum of
         * the axis' contents, excess content will overflow.
         *
         * @attribute width
         * @type Number
         */
        width: {
            lazyAdd: false,

            getter: function()
            {
                if(this._explicitWidth)
                {
                    return this._explicitWidth;
                }
                return this._calculatedWidth;
            },

            setter: function(val)
            {
                this._explicitWidth = val;
                return val;
            }
        },

        /**
         * When set, defines the height of a horizontal axis instance. By default, horizontal axes automatically size based
         * on their contents. When the height attribute is set, the axis will not calculate its height. When the height
         * attribute is explicitly set, axis labels will postion themselves off of the the inner edge of the axis and the
         * title, if present, will position itself off of the outer edge. If a specified height is less than the sum of
         * the axis' contents, excess content will overflow.
         *
         * @attribute height
         * @type Number
         */
        height: {
            lazyAdd: false,

            getter: function()
            {
                if(this._explicitHeight)
                {
                    return this._explicitHeight;
                }
                return this._calculatedHeight;
            },

            setter: function(val)
            {
                this._explicitHeight = val;
                return val;
            }
        },

        /**
         * Calculated value of an axis' width. By default, the value is used internally for vertical axes. If the `width`
         * attribute is explicitly set, this value will be ignored.
         *
         * @attribute calculatedWidth
         * @type Number
         * @private
         */
        calculatedWidth: {
            getter: function()
            {
                return this._calculatedWidth;
            },

            setter: function(val)
            {
                this._calculatedWidth = val;
                return val;
            }
        },

        /**
         * Calculated value of an axis' height. By default, the value is used internally for horizontal axes. If the `height`
         * attribute is explicitly set, this value will be ignored.
         *
         * @attribute calculatedHeight
         * @type Number
         * @private
         */
        calculatedHeight: {
            getter: function()
            {
                return this._calculatedHeight;
            },

            setter: function(val)
            {
                this._calculatedHeight = val;
                return val;
            }
        },

        /**
         * Difference between the first/last tick and edge of axis.
         *
         * @attribute edgeOffset
         * @type Number
         * @protected
         */
        edgeOffset:
        {
            value: 0
        },

        /**
         * The graphic in which the axis line and ticks will be rendered.
         *
         * @attribute graphic
         * @type Graphic
         */
        graphic: {},

        /**
         *  @attribute path
         *  @type Shape
         *  @readOnly
         *  @private
         */
        path: {
            readOnly: true,

            getter: function()
            {
                if(!this._path)
                {
                    var graphic = this.get("graphic");
                    if(graphic)
                    {
                        this._path = graphic.addShape({type:"path"});
                    }
                }
                return this._path;
            }
        },

        /**
         *  @attribute tickPath
         *  @type Shape
         *  @readOnly
         *  @private
         */
        tickPath: {
            readOnly: true,

            getter: function()
            {
                if(!this._tickPath)
                {
                    var graphic = this.get("graphic");
                    if(graphic)
                    {
                        this._tickPath = graphic.addShape({type:"path"});
                    }
                }
                return this._tickPath;
            }
        },

        /**
         * Contains the contents of the axis.
         *
         * @attribute node
         * @type HTMLElement
         */
        node: {},

        /**
         * Direction of the axis.
         *
         * @attribute position
         * @type String
         */
        position: {
            lazyAdd: false,

            setter: function(val)
            {
                var LayoutClass = this._layoutClasses[val];
                if(val && val !== "none")
                {
                    this._layout = new LayoutClass();
                }
                return val;
            }
        },

        /**
         * Distance determined by the tick styles used to calculate the distance between the axis
         * line in relation to the top of the axis.
         *
         * @attribute topTickOffset
         * @type Number
         */
        topTickOffset: {
            value: 0
        },

        /**
         * Distance determined by the tick styles used to calculate the distance between the axis
         * line in relation to the bottom of the axis.
         *
         * @attribute bottomTickOffset
         * @type Number
         */
        bottomTickOffset: {
            value: 0
        },

        /**
         * Distance determined by the tick styles used to calculate the distance between the axis
         * line in relation to the left of the axis.
         *
         * @attribute leftTickOffset
         * @type Number
         */
        leftTickOffset: {
            value: 0
        },

        /**
         * Distance determined by the tick styles used to calculate the distance between the axis
         * line in relation to the right side of the axis.
         *
         * @attribute rightTickOffset
         * @type Number
         */
        rightTickOffset: {
            value: 0
        },

        /**
         * Collection of labels used to render the axis.
         *
         * @attribute labels
         * @type Array
         */
        labels: {
            readOnly: true,
            getter: function()
            {
                return this._labels;
            }
        },

        /**
         * Collection of points used for placement of labels and ticks along the axis.
         *
         * @attribute tickPoints
         * @type Array
         */
        tickPoints: {
            readOnly: true,

            getter: function()
            {
                if(this.get("position") === "none")
                {
                    return this.get("styles").majorUnit.count;
                }
                return this._tickPoints;
            }
        },

        /**
         * Indicates whether the axis overlaps the graph. If an axis is the inner most axis on a given
         * position and the tick position is inside or cross, the axis will need to overlap the graph.
         *
         * @attribute overlapGraph
         * @type Boolean
         */
        overlapGraph: {
            value:true,

            validator: function(val)
            {
                return Y_Lang.isBoolean(val);
            }
        },

        /**
         * Length in pixels of largest text bounding box. Used to calculate the height of the axis.
         *
         * @attribute maxLabelSize
         * @type Number
         * @protected
         */
        maxLabelSize: {
            getter: function()
            {
                return this._maxLabelSize;
            },

            setter: function(val)
            {
                this._maxLabelSize = val;
                return val;
            }
        },

        /**
         *  Title for the axis. When specified, the title will display. The position of the title is determined by the axis position.
         *  <dl>
         *      <dt>top</dt><dd>Appears above the axis and it labels. The default rotation is 0.</dd>
         *      <dt>right</dt><dd>Appears to the right of the axis and its labels. The default rotation is 90.</dd>
         *      <dt>bottom</dt><dd>Appears below the axis and its labels. The default rotation is 0.</dd>
         *      <dt>left</dt><dd>Appears to the left of the axis and its labels. The default rotation is -90.</dd>
         *  </dl>
         *
         *  @attribute title
         *  @type String
         */
        title: {
            value: null
        },

        /**
         * Function used to append an axis value to an axis label. This function has the following signature:
         *  <dl>
         *      <dt>textField</dt><dd>The axis label to be appended. (`HTMLElement`)</dd>
         *      <dt>val</dt><dd>The value to attach to the text field. This method will accept an `HTMLELement`
         *      or a `String`. This method does not use (`HTMLElement` | `String`)</dd>
         *  </dl>
         * The default method appends a value to the `HTMLElement` using the `appendChild` method. If the given
         * value is a `String`, the method will convert the the value to a `textNode` before appending to the
         * `HTMLElement`. This method will not convert an `HTMLString` to an `HTMLElement`.
         *
         * @attribute appendLabelFunction
         * @type Function
         */
        appendLabelFunction: {
            valueFn: function()
            {
                return this._setText;
            }
        },

        /**
         * Function used to append a title value to the title object. This function has the following signature:
         *  <dl>
         *      <dt>textField</dt><dd>The title text field to be appended. (`HTMLElement`)</dd>
         *      <dt>val</dt><dd>The value to attach to the text field. This method will accept an `HTMLELement`
         *      or a `String`. This method does not use (`HTMLElement` | `String`)</dd>
         *  </dl>
         * The default method appends a value to the `HTMLElement` using the `appendChild` method. If the given
         * value is a `String`, the method will convert the the value to a `textNode` before appending to the
         * `HTMLElement` element. This method will not convert an `HTMLString` to an `HTMLElement`.
         *
         * @attribute appendTitleFunction
         * @type Function
         */
        appendTitleFunction: {
            valueFn: function()
            {
                return this._setText;
            }
        },

        /**
         * An array containing the unformatted values of the axis labels. By default, TimeAxis, NumericAxis and
         * StackedAxis labelValues are determined by the majorUnit style. By default, CategoryAxis labels are
         * determined by the values of the dataProvider.
         * <p>When the labelValues attribute is explicitly set, the labelValues are dictated by the set value and
         * the position of ticks and labels are determined by where those values would fall on the axis. </p>
         *
         * @attribute labelValues
         * @type Array
         */
        labelValues: {
            lazyAdd: false,

            setter: function(val)
            {
                var opts = arguments[2];
                if(!val || (opts && opts.src && opts.src === "internal"))
                {
                    this._labelValuesExplicitlySet = false;
                }
                else
                {
                    this._labelValuesExplicitlySet = true;
                }
                return val;
            }
        },

        /**
         * Suppresses the creation of the the first visible label and tick.
         *
         * @attribute hideFirstMajorUnit
         * @type Boolean
         */
        hideFirstMajorUnit: {
            value: false
        },

        /**
         * Suppresses the creation of the the last visible label and tick.
         *
         * @attribute hideLastMajorUnit
         * @type Boolean
         */
        hideLastMajorUnit: {
            value: false
        }

        /**
         * Style properties used for drawing an axis. This attribute is inherited from `Renderer`. Below are the default values:
         *  <dl>
         *      <dt>majorTicks</dt><dd>Properties used for drawing ticks.
         *          <dl>
         *              <dt>display</dt><dd>Position of the tick. Possible values are `inside`, `outside`, `cross` and `none`.
         *              The default value is `inside`.</dd>
         *              <dt>length</dt><dd>The length (in pixels) of the tick. The default value is 4.</dd>
         *              <dt>color</dt><dd>The color of the tick. The default value is `#dad8c9`</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the tick. The default value is 1.</dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the tick. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>line</dt><dd>Properties used for drawing the axis line.
         *          <dl>
         *              <dt>weight</dt><dd>Number indicating the width of the axis line. The default value is 1.</dd>
         *              <dt>color</dt><dd>The color of the axis line. The default value is `#dad8c9`.</dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the tick. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>majorUnit</dt><dd>Properties used to calculate the `majorUnit` for the axis.
         *          <dl>
         *              <dt>determinant</dt><dd>The algorithm used for calculating distance between ticks. The possible options are
         *              `count` and `distance`. If the `determinant` is `count`, the axis ticks will spaced so that a specified number
         *              of ticks appear on the axis. If the `determinant` is `distance`, the axis ticks will spaced out according to
         *              the specified distance. The default value is `count`.</dd>
         *              <dt>count</dt><dd>Number of ticks to appear on the axis when the `determinant` is `count`. The default value is 11.</dd>
         *              <dt>distance</dt><dd>The distance (in pixels) between ticks when the `determinant` is `distance`. The default
         *              value is 75.</dd>
         *          </dl>
         *      </dd>
         *      <dt>label</dt><dd>Properties and styles applied to the axis labels.
         *          <dl>
         *              <dt>color</dt><dd>The color of the labels. The default value is `#808080`.</dd>
         *              <dt>alpha</dt><dd>Number between 0 and 1 indicating the opacity of the labels. The default value is 1.</dd>
         *              <dt>fontSize</dt><dd>The font-size of the labels. The default value is 85%</dd>
         *              <dt>rotation</dt><dd>The rotation, in degrees (between -90 and 90) of the labels. The default value is 0.</dd>
         *              <dt>offset</td><dd>A number between 0 and 1 indicating the relationship of the label to a tick. For a horizontal axis
         *              label, a value of 0 will position the label's left side even to the the tick. A position of 1 would position the
         *              right side of the label with the tick. A position of 0.5 would center the label horizontally with the tick. For a
         *              vertical axis, a value of 0 would position the top of the label with the tick, a value of 1 would position the bottom
         *              of the label with the tick and a value 0 would center the label vertically with the tick. The default value is 0.5.</dd>
         *              <dt>margin</dt><dd>The distance between the label and the axis/tick. Depending on the position of the `Axis`,
         *              only one of the properties used.
         *                  <dl>
         *                      <dt>top</dt><dd>Pixel value used for an axis with a `position` of `bottom`. The default value is 4.</dd>
         *                      <dt>right</dt><dd>Pixel value used for an axis with a `position` of `left`. The default value is 4.</dd>
         *                      <dt>bottom</dt><dd>Pixel value used for an axis with a `position` of `top`. The default value is 4.</dd>
         *                      <dt>left</dt><dd>Pixel value used for an axis with a `position` of `right`. The default value is 4.</dd>
         *                  </dl>
         *              </dd>
         *          </dl>
         *      </dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});
Y.AxisType = Y.Base.create("baseAxis", Y.Axis, [], {});


}, '3.16.0', {"requires": ["dom", "widget", "widget-position", "widget-stack", "graphics", "axis-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-numeric-base', function (Y, NAME) {

/**
 * Provides functionality for the handling of numeric axis data for a chart.
 *
 * @module charts
 * @submodule axis-numeric-base
 */
var Y_Lang = Y.Lang;

/**
 * NumericImpl contains logic for numeric data. NumericImpl is used by the following classes:
 * <ul>
 *      <li>{{#crossLink "NumericAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "NumericAxis"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class NumericImpl
 * @constructor
 * @submodule axis-numeric-base
 */
function NumericImpl()
{
}

NumericImpl.NAME = "numericImpl";

NumericImpl.ATTRS = {
    /**
     * Indicates whether 0 should always be displayed.
     *
     * @attribute alwaysShowZero
     * @type Boolean
     */
    alwaysShowZero: {
        value: true
    },

    /**
     * Method used for formatting a label. This attribute allows for the default label formatting method to overridden.
     * The method use would need to implement the arguments below and return a `String` or an `HTMLElement`. The default
     * implementation of the method returns a `String`. The output of this method will be rendered to the DOM using
     * `appendChild`. If you override the `labelFunction` method and return an html string, you will also need to override
     * the Data' `appendLabelFunction` to accept html as a `String`.
     * <dl>
     *      <dt>val</dt><dd>Label to be formatted. (`String`)</dd>
     *      <dt>format</dt><dd>Object containing properties used to format the label. (optional)</dd>
     * </dl>
     *
     * @attribute labelFunction
     * @type Function
     */

    /**
     * Object containing properties used by the `labelFunction` to format a
     * label.
     *
     * @attribute labelFormat
     * @type Object
     */
    labelFormat: {
        value: {
            prefix: "",
            thousandsSeparator: "",
            decimalSeparator: "",
            decimalPlaces: "0",
            suffix: ""
        }
    },

    /**
     *Indicates how to round unit values.
     *  <dl>
     *      <dt>niceNumber</dt><dd>Units will be smoothed based on the number of ticks and data range.</dd>
     *      <dt>auto</dt><dd>If the range is greater than 1, the units will be rounded.</dd>
     *      <dt>numeric value</dt><dd>Units will be equal to the numeric value.</dd>
     *      <dt>null</dt><dd>No rounding will occur.</dd>
     *  </dl>
     *
     * @attribute roundingMethod
     * @type String
     * @default niceNumber
     */
    roundingMethod: {
        value: "niceNumber"
    },

    /**
     * Indicates the scaling for the chart. The default value is `linear`. For a logarithmic axis, set the value
     * to `logarithmic`.
     *
     * @attribute
     * @type String
     * @default linear
     */
    scaleType: {
        value: "linear"
    }
};

NumericImpl.prototype = {
    /**
     * @method initializer
     * @private
     */
    initializer: function() {
        this.after("alwaysShowZeroChange", this._keyChangeHandler);
        this.after("roundingMethodChange", this._keyChangeHandler);
        this.after("scaleTypeChange", this._keyChangeHandler);
    },

    /**
     * Formats a label based on the axis type and optionally specified format.
     *
     * @method
     * @param {Object} value
     * @param {Object} format Pattern used to format the value.
     * @return String
     */
    formatLabel: function(val, format)
    {
        if(format)
        {
            return Y.DataType.Number.format(val, format);
        }
        return val;
    },

    /**
     * Returns the sum of all values per key.
     *
     * @method getTotalByKey
     * @param {String} key The identifier for the array whose values will be calculated.
     * @return Number
     */
    getTotalByKey: function(key)
    {
        var total = 0,
            values = this.getDataByKey(key),
            i = 0,
            val,
            len = values ? values.length : 0;
        for(; i < len; ++i)
        {
           val = parseFloat(values[i]);
           if(!isNaN(val))
           {
                total += val;
           }
        }
        return total;
    },

    /**
     * Returns the value corresponding to the origin on the axis.
     *
     * @method getOrigin
     * @return Number
     */
    getOrigin: function() {
        var origin = 0,
            min = this.get("minimum"),
            max = this.get("maximum");
        origin = Math.max(origin, min);
        origin = Math.min(origin, max);
        return origin;
    },

    /**
     * Type of data used in `Data`.
     *
     * @property _type
     * @readOnly
     * @private
     */
    _type: "numeric",

    /**
     * Helper method for getting a `roundingUnit` when calculating the minimum and maximum values.
     *
     * @method _getMinimumUnit
     * @param {Number} max Maximum number
     * @param {Number} min Minimum number
     * @param {Number} units Number of units on the axis
     * @return Number
     * @private
     */
    _getMinimumUnit:function(max, min, units)
    {
        return this._getNiceNumber(Math.ceil((max - min)/units));
    },

    /**
     * Calculates a nice rounding unit based on the range.
     *
     * @method _getNiceNumber
     * @param {Number} roundingUnit The calculated rounding unit.
     * @return Number
     * @private
     */
    _getNiceNumber: function(roundingUnit)
    {
        var tempMajorUnit = roundingUnit,
            order = Math.ceil(Math.log(tempMajorUnit) * 0.4342944819032518),
            roundedMajorUnit = Math.pow(10, order),
            roundedDiff;

        if (roundedMajorUnit / 2 >= tempMajorUnit)
        {
            roundedDiff = Math.floor((roundedMajorUnit / 2 - tempMajorUnit) / (Math.pow(10,order-1)/2));
            tempMajorUnit = roundedMajorUnit/2 - roundedDiff*Math.pow(10,order-1)/2;
        }
        else
        {
            tempMajorUnit = roundedMajorUnit;
        }
        if(!isNaN(tempMajorUnit))
        {
            return tempMajorUnit;
        }
        return roundingUnit;

    },

    /**
     * Calculates the maximum and minimum values for the `Data`.
     *
     * @method _updateMinAndMax
     * @private
     */
    _updateMinAndMax: function()
    {
        var data = this.get("data"),
            max,
            min,
            len,
            num,
            i = 0,
            setMax = this.get("setMax"),
            setMin = this.get("setMin");
        if(!setMax || !setMin)
        {
            if(data && data.length && data.length > 0)
            {
                len = data.length;
                for(; i < len; i++)
                {
                    num = data[i];
                    if(isNaN(num))
                    {
                        max = setMax ? this._setMaximum : max;
                        min = setMin ? this._setMinimum : min;
                        continue;
                    }

                    if(setMin)
                    {
                        min = this._setMinimum;
                    }
                    else if(min === undefined)
                    {
                        min = num;
                    }
                    else
                    {
                        min = Math.min(num, min);
                    }
                    if(setMax)
                    {
                        max = this._setMaximum;
                    }
                    else if(max === undefined)
                    {
                        max = num;
                    }
                    else
                    {
                        max = Math.max(num, max);
                    }

                    this._actualMaximum = max;
                    this._actualMinimum = min;
                }
            }
            if(this.get("scaleType") !== "logarithmic")
            {
                this._roundMinAndMax(min, max, setMin, setMax);
            }
            else
            {
                this._dataMaximum = max;
                this._dataMinimum = min;
            }
        }
    },

    /**
     * Rounds the mimimum and maximum values based on the `roundingUnit` attribute.
     *
     * @method _roundMinAndMax
     * @param {Number} min Minimum value
     * @param {Number} max Maximum value
     * @private
     */
    _roundMinAndMax: function(min, max, setMin, setMax)
    {
        var roundingUnit,
            minimumRange,
            minGreaterThanZero = min >= 0,
            maxGreaterThanZero = max > 0,
            dataRangeGreater,
            maxRound,
            minRound,
            topTicks,
            botTicks,
            tempMax,
            tempMin,
            units = this.getTotalMajorUnits() - 1,
            alwaysShowZero = this.get("alwaysShowZero"),
            roundingMethod = this.get("roundingMethod"),
            useIntegers = (max - min)/units >= 1;
        if(roundingMethod)
        {
            if(roundingMethod === "niceNumber")
            {
                roundingUnit = this._getMinimumUnit(max, min, units);
                if(minGreaterThanZero && maxGreaterThanZero)
                {
                    if((alwaysShowZero || min < roundingUnit) && !setMin)
                    {
                        min = 0;
                        roundingUnit = this._getMinimumUnit(max, min, units);
                    }
                    else
                    {
                       min = this._roundDownToNearest(min, roundingUnit);
                    }
                    if(setMax)
                    {
                        if(!alwaysShowZero)
                        {
                            min = max - (roundingUnit * units);
                        }
                    }
                    else if(setMin)
                    {
                        max = min + (roundingUnit * units);
                    }
                    else
                    {
                        max = this._roundUpToNearest(max, roundingUnit);
                    }
                }
                else if(maxGreaterThanZero && !minGreaterThanZero)
                {
                    if(alwaysShowZero)
                    {
                        topTicks = Math.round(units/((-1 * min)/max + 1));
                        topTicks = Math.max(Math.min(topTicks, units - 1), 1);
                        botTicks = units - topTicks;
                        tempMax = Math.ceil( max/topTicks );
                        tempMin = Math.floor( min/botTicks ) * -1;

                        if(setMin)
                        {
                            while(tempMin < tempMax && botTicks >= 0)
                            {
                                botTicks--;
                                topTicks++;
                                tempMax = Math.ceil( max/topTicks );
                                tempMin = Math.floor( min/botTicks ) * -1;
                            }
                            //if there are any bottom ticks left calcualate the maximum by multiplying by the tempMin value
                            //if not, it's impossible to ensure that a zero is shown. skip it
                            if(botTicks > 0)
                            {
                                max = tempMin * topTicks;
                            }
                            else
                            {
                                max = min + (roundingUnit * units);
                            }
                        }
                        else if(setMax)
                        {
                            while(tempMax < tempMin && topTicks >= 0)
                            {
                                botTicks++;
                                topTicks--;
                                tempMin = Math.floor( min/botTicks ) * -1;
                                tempMax = Math.ceil( max/topTicks );
                            }
                            //if there are any top ticks left calcualate the minimum by multiplying by the tempMax value
                            //if not, it's impossible to ensure that a zero is shown. skip it
                            if(topTicks > 0)
                            {
                                min = tempMax * botTicks * -1;
                            }
                            else
                            {
                                min = max - (roundingUnit * units);
                            }
                        }
                        else
                        {
                            roundingUnit = Math.max(tempMax, tempMin);
                            roundingUnit = this._getNiceNumber(roundingUnit);
                            max = roundingUnit * topTicks;
                            min = roundingUnit * botTicks * -1;
                        }
                    }
                    else
                    {
                        if(setMax)
                        {
                            min = max - (roundingUnit * units);
                        }
                        else if(setMin)
                        {
                            max = min + (roundingUnit * units);
                        }
                        else
                        {
                            min = this._roundDownToNearest(min, roundingUnit);
                            max = this._roundUpToNearest(max, roundingUnit);
                        }
                    }
                }
                else
                {
                    if(setMin)
                    {
                        if(alwaysShowZero)
                        {
                            max = 0;
                        }
                        else
                        {
                            max = min + (roundingUnit * units);
                        }
                    }
                    else if(!setMax)
                    {
                        if(alwaysShowZero || max === 0 || max + roundingUnit > 0)
                        {
                            max = 0;
                            roundingUnit = this._getMinimumUnit(max, min, units);
                            min = max - (roundingUnit * units);
                        }
                        else
                        {
                            min = this._roundDownToNearest(min, roundingUnit);
                            max = this._roundUpToNearest(max, roundingUnit);
                        }
                    }
                    else
                    {
                        min = max - (roundingUnit * units);
                    }
                }
            }
            else if(roundingMethod === "auto")
            {
                if(minGreaterThanZero && maxGreaterThanZero)
                {
                    if((alwaysShowZero || min < (max-min)/units) && !setMin)
                    {
                        min = 0;
                    }

                    roundingUnit = (max - min)/units;
                    if(useIntegers)
                    {
                        roundingUnit = Math.ceil(roundingUnit);
                        max = min + (roundingUnit * units);
                    }
                    else
                    {
                        max = min + Math.ceil(roundingUnit * units * 100000)/100000;

                    }
                }
                else if(maxGreaterThanZero && !minGreaterThanZero)
                {
                    if(alwaysShowZero)
                    {
                        topTicks = Math.round( units / ( (-1 * min) /max + 1) );
                        topTicks = Math.max(Math.min(topTicks, units - 1), 1);
                        botTicks = units - topTicks;

                        if(useIntegers)
                        {
                            tempMax = Math.ceil( max/topTicks );
                            tempMin = Math.floor( min/botTicks ) * -1;
                            roundingUnit = Math.max(tempMax, tempMin);
                            max = roundingUnit * topTicks;
                            min = roundingUnit * botTicks * -1;
                        }
                        else
                        {
                            tempMax = max/topTicks;
                            tempMin = min/botTicks * -1;
                            roundingUnit = Math.max(tempMax, tempMin);
                            max = Math.ceil(roundingUnit * topTicks * 100000)/100000;
                            min = Math.ceil(roundingUnit * botTicks * 100000)/100000 * -1;
                        }
                    }
                    else
                    {
                        roundingUnit = (max - min)/units;
                        if(useIntegers)
                        {
                            roundingUnit = Math.ceil(roundingUnit);
                        }
                        min = Math.round(this._roundDownToNearest(min, roundingUnit) * 100000)/100000;
                        max = Math.round(this._roundUpToNearest(max, roundingUnit) * 100000)/100000;
                    }
                }
                else
                {
                    roundingUnit = (max - min)/units;
                    if(useIntegers)
                    {
                        roundingUnit = Math.ceil(roundingUnit);
                    }
                    if(alwaysShowZero || max === 0 || max + roundingUnit > 0)
                    {
                        max = 0;
                        roundingUnit = (max - min)/units;
                        if(useIntegers)
                        {
                            Math.ceil(roundingUnit);
                            min = max - (roundingUnit * units);
                        }
                        else
                        {
                            min = max - Math.ceil(roundingUnit * units * 100000)/100000;
                        }
                    }
                    else
                    {
                        min = this._roundDownToNearest(min, roundingUnit);
                        max = this._roundUpToNearest(max, roundingUnit);
                    }

                }
            }
            else if(!isNaN(roundingMethod) && isFinite(roundingMethod))
            {
                roundingUnit = roundingMethod;
                minimumRange = roundingUnit * units;
                dataRangeGreater = (max - min) > minimumRange;
                minRound = this._roundDownToNearest(min, roundingUnit);
                maxRound = this._roundUpToNearest(max, roundingUnit);
                if(setMax)
                {
                    min = max - minimumRange;
                }
                else if(setMin)
                {
                    max = min + minimumRange;
                }
                else if(minGreaterThanZero && maxGreaterThanZero)
                {
                    if(alwaysShowZero || minRound <= 0)
                    {
                        min = 0;
                    }
                    else
                    {
                        min = minRound;
                    }
                    max = min + minimumRange;
                }
                else if(maxGreaterThanZero && !minGreaterThanZero)
                {
                    min = minRound;
                    max = maxRound;
                }
                else
                {
                    if(alwaysShowZero || maxRound >= 0)
                    {
                        max = 0;
                    }
                    else
                    {
                        max = maxRound;
                    }
                    min = max - minimumRange;
                }
            }
        }
        this._dataMaximum = max;
        this._dataMinimum = min;
    },

    /**
     * Rounds a Number to the nearest multiple of an input. For example, by rounding
     * 16 to the nearest 10, you will receive 20. Similar to the built-in function Math.round().
     *
     * @method _roundToNearest
     * @param {Number} number Number to round
     * @param {Number} nearest Multiple to round towards.
     * @return Number
     * @private
     */
    _roundToNearest: function(number, nearest)
    {
        nearest = nearest || 1;
        var roundedNumber = Math.round(this._roundToPrecision(number / nearest, 10)) * nearest;
        return this._roundToPrecision(roundedNumber, 10);
    },

    /**
     * Rounds a Number up to the nearest multiple of an input. For example, by rounding
     * 16 up to the nearest 10, you will receive 20. Similar to the built-in function Math.ceil().
     *
     * @method _roundUpToNearest
     * @param {Number} number Number to round
     * @param {Number} nearest Multiple to round towards.
     * @return Number
     * @private
     */
    _roundUpToNearest: function(number, nearest)
    {
        nearest = nearest || 1;
        return Math.ceil(this._roundToPrecision(number / nearest, 10)) * nearest;
    },

    /**
     * Rounds a Number down to the nearest multiple of an input. For example, by rounding
     * 16 down to the nearest 10, you will receive 10. Similar to the built-in function Math.floor().
     *
     * @method _roundDownToNearest
     * @param {Number} number Number to round
     * @param {Number} nearest Multiple to round towards.
     * @return Number
     * @private
     */
    _roundDownToNearest: function(number, nearest)
    {
        nearest = nearest || 1;
        return Math.floor(this._roundToPrecision(number / nearest, 10)) * nearest;
    },

    /**
     * Returns a coordinate corresponding to a data values.
     *
     * @method _getCoordFromValue
     * @param {Number} min The minimum for the axis.
     * @param {Number} max The maximum for the axis.
     * @param {Number} length The distance that the axis spans.
     * @param {Number} dataValue A value used to ascertain the coordinate.
     * @param {Number} offset Value in which to offset the coordinates.
     * @param {Boolean} reverse Indicates whether the coordinates should start from
     * the end of an axis. Only used in the numeric implementation.
     * @return Number
     * @private
     */
    _getCoordFromValue: function(min, max, length, dataValue, offset, reverse)
    {
        var range,
            multiplier,
            valuecoord,
            isNumber = Y_Lang.isNumber;
        dataValue = parseFloat(dataValue);
        if(isNumber(dataValue))
        {
            if(this.get("scaleType") === "logarithmic" && min > 0)
            {
                min = Math.log(min);
                max = Math.log(max);
                dataValue = Math.log(dataValue);
            }
            range = max - min;
            multiplier = length/range;
            valuecoord = (dataValue - min) * multiplier;
            valuecoord = reverse ? offset - valuecoord : offset + valuecoord;
        }
        else
        {
            valuecoord = NaN;
        }
        return valuecoord;
    },

    /**
     * Rounds a number to a certain level of precision. Useful for limiting the number of
     * decimal places on a fractional number.
     *
     * @method _roundToPrecision
     * @param {Number} number Number to round
     * @param {Number} precision Multiple to round towards.
     * @return Number
     * @private
     */
    _roundToPrecision: function(number, precision)
    {
        precision = precision || 0;
        var decimalPlaces = Math.pow(10, precision);
        return Math.round(decimalPlaces * number) / decimalPlaces;
    }
};

Y.NumericImpl = NumericImpl;

/**
 * NumericAxisBase manages numeric data for an axis.
 *
 * @class NumericAxisBase
 * @constructor
 * @extends AxisBase
 * @uses NumericImpl
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-numeric-base
 */
Y.NumericAxisBase = Y.Base.create("numericAxisBase", Y.AxisBase, [Y.NumericImpl]);


}, '3.16.0', {"requires": ["axis-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-numeric', function (Y, NAME) {

/**
 * Provides functionality for drawing a numeric axis for use with a chart.
 *
 * @module charts
 * @submodule axis-numeric
 */
var Y_Lang = Y.Lang;
/**
 * NumericAxis draws a numeric axis.
 *
 * @class NumericAxis
 * @constructor
 * @extends Axis
 * @uses NumericImpl
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-numeric
 */
Y.NumericAxis = Y.Base.create("numericAxis", Y.Axis, [Y.NumericImpl], {
    /**
     * Calculates and returns a value based on the number of labels and the index of
     * the current label.
     *
     * @method getLabelByIndex
     * @param {Number} i Index of the label.
     * @param {Number} l Total number of labels.
     * @return String
     * @private
     */
    _getLabelByIndex: function(i, l)
    {
        var min = this.get("minimum"),
            max = this.get("maximum"),
            increm = (max - min)/(l-1),
            label,
            roundingMethod = this.get("roundingMethod");
            l -= 1;
        //respect the min and max. calculate all other labels.
        if(i === 0)
        {
            label = min;
        }
        else if(i === l)
        {
            label = max;
        }
        else
        {
            label = (i * increm);
            if(roundingMethod === "niceNumber")
            {
                label = this._roundToNearest(label, increm);
            }
            label += min;
        }
        return parseFloat(label);
    },

    /**
     * Returns an object literal containing and array of label values and an array of points.
     *
     * @method _getLabelData
     * @param {Object} startPoint An object containing x and y values.
     * @param {Number} edgeOffset Distance to offset coordinates.
     * @param {Number} layoutLength Distance that the axis spans.
     * @param {Number} count Number of labels.
     * @param {String} direction Indicates whether the axis is horizontal or vertical.
     * @param {Array} Array containing values for axis labels.
     * @return Array
     * @private
     */
    _getLabelData: function(constantVal, staticCoord, dynamicCoord, min, max, edgeOffset, layoutLength, count, dataValues)
    {
        var dataValue,
            i,
            points = [],
            values = [],
            point,
            isVertical = staticCoord === "x",
            offset = isVertical ? layoutLength + edgeOffset : edgeOffset;
        dataValues = dataValues || this._getDataValuesByCount(count, min, max);
        for(i = 0; i < count; i = i + 1)
        {
            dataValue = parseFloat(dataValues[i]);
            if(dataValue <= max && dataValue >= min)
            {
                point = {};
                point[staticCoord] = constantVal;
                point[dynamicCoord] = this._getCoordFromValue(
                    min,
                    max,
                    layoutLength,
                    dataValue,
                    offset,
                    isVertical
                );
                points.push(point);
                values.push(dataValue);
            }
        }
        return {
            points: points,
            values: values
        };
    },

    /**
     * Checks to see if data extends beyond the range of the axis. If so,
     * that data will need to be hidden. This method is internal, temporary and subject
     * to removal in the future.
     *
     * @method _hasDataOverflow
     * @protected
     * @return Boolean
     */
    _hasDataOverflow: function()
    {
        var roundingMethod,
            min,
            max;
        if(this.get("setMin") || this.get("setMax"))
        {
            return true;
        }
        roundingMethod = this.get("roundingMethod");
        min = this._actualMinimum;
        max = this._actualMaximum;
        if(Y_Lang.isNumber(roundingMethod) &&
            ((Y_Lang.isNumber(max) && max > this._dataMaximum) || (Y_Lang.isNumber(min) && min < this._dataMinimum)))
        {
            return true;
        }
        return false;
    }
});



}, '3.16.0', {"requires": ["axis", "axis-numeric-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-category-base', function (Y, NAME) {

/**
 * Provides functionality for the handling of category axis data for a chart.
 *
 * @module charts
 * @submodule axis-category-base
 */
var Y_Lang = Y.Lang;

/**
 * CategoryImpl contains logic for managing category data. CategoryImpl is used by the following classes:
 * <ul>
 *      <li>{{#crossLink "CategoryAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "CategoryAxis"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class CategoryImpl
 * @constructor
 * @submodule axis-category-base
 */
function CategoryImpl()
{
}

CategoryImpl.NAME = "categoryImpl";

CategoryImpl.ATTRS = {
    /**
     * Pattern used by the `labelFunction` to format a label. The default `labelFunction` values for
     * `CategoryAxis` and `CategoryAxisBase` do not accept a format object. This value can be used by
     * a custom method.
     *
     * @attribute labelFormat
     * @type Object
     */
    labelFormat: {
        value: null
    },

    /**
     * Determines whether and offset is automatically calculated for the edges of the axis.
     *
     * @attribute calculateEdgeOffset
     * @type Boolean
     */
    calculateEdgeOffset: {
        value: true
    }

    /**
     * Method used for formatting a label. This attribute allows for the default label formatting method to overridden.
     * The method use would need to implement the arguments below and return a `String` or `HTMLElement`.
     * <dl>
     *      <dt>val</dt><dd>Label to be formatted. (`String`)</dd>
     *      <dt>format</dt><dd>Template for formatting label. (optional)</dd>
     * </dl>
     *
     * @attribute labelFunction
     * @type Function
     */
};

CategoryImpl.prototype = {
    /**
     * Formats a label based on the axis type and optionally specified format.
     *
     * @method formatLabel
     * @param {Object} value
     * @return String
     */
    formatLabel: function(val)
    {
        return val;
    },

    /**
     * Object storing key data.
     *
     * @property _indices
     * @private
     */
    _indices: null,

    /**
     * Constant used to generate unique id.
     *
     * @property GUID
     * @type String
     * @private
     */
    GUID: "yuicategoryaxis",

    /**
     * Type of data used in `Data`.
     *
     * @property _dataType
     * @readOnly
     * @private
     */
    _type: "category",

    /**
     * Calculates the maximum and minimum values for the `Data`.
     *
     * @method _updateMinAndMax
     * @private
     */
    _updateMinAndMax: function()
    {
        this._dataMaximum = Math.max(this.get("data").length - 1, 0);
        this._dataMinimum = 0;
    },

    /**
     * Gets an array of values based on a key.
     *
     * @method _getKeyArray
     * @param {String} key Value key associated with the data array.
     * @param {Array} data Array in which the data resides.
     * @return Array
     * @private
     */
    _getKeyArray: function(key, data)
    {
        var i = 0,
            obj,
            keyArr = [],
            labels = [],
            len = data.length;
        if(!this._indices)
        {
            this._indices = {};
        }
        for(; i < len; ++i)
        {
            obj = data[i];
            keyArr[i] = i;
            labels[i] = obj[key];
        }
        this._indices[key] = keyArr;
        return labels;
    },

    /**
     * Returns an array of values based on an identifier key.
     *
     * @method getDataByKey
     * @param {String} value value used to identify the array
     * @return Array
     */
    getDataByKey: function (value)
    {
        if(!this._indices)
        {
            this.get("keys");
        }
        var keys = this._indices;
        if(keys && keys[value])
        {
            return keys[value];
        }
        return null;
    },

    /**
     * Returns the total number of majorUnits that will appear on an axis.
     *
     * @method getTotalMajorUnits
     * @param {Object} majorUnit Object containing properties related to the majorUnit.
     * @param {Number} len Length of the axis.
     * @return Number
     */
    getTotalMajorUnits: function()
    {
        return this.get("data").length;
    },

    /**
     * Returns a coordinate corresponding to a data values.
     *
     * @method _getCoordFromValue
     * @param {Number} min The minimum for the axis.
     * @param {Number} max The maximum for the axis.
     * @param {Number} length The distance that the axis spans.
     * @param {Number} dataValue A value used to ascertain the coordinate.
     * @param {Number} offset Value in which to offset the coordinates.
     * @param {Boolean} reverse Indicates whether the coordinates should start from
     * the end of an axis. Only used in the numeric implementation.
     * @return Number
     * @private
     */
    _getCoordFromValue: function(min, max, length, dataValue, offset)
    {
        var range,
            multiplier,
            valuecoord;
        if(Y_Lang.isNumber(dataValue))
        {
            range = max - min;
            multiplier = length/range;
            valuecoord = (dataValue - min) * multiplier;
            valuecoord = offset + valuecoord;
        }
        else
        {
            valuecoord = NaN;
        }
        return valuecoord;
    },

    /**
     * Returns a value based of a key value and an index.
     *
     * @method getKeyValueAt
     * @param {String} key value used to look up the correct array
     * @param {Number} index within the array
     * @return String
     */
    getKeyValueAt: function(key, index)
    {
        var value = NaN,
            keys = this.get("keys");
        if(keys[key] && keys[key][index])
        {
            value = keys[key][index];
        }
        return value;
    }
};

Y.CategoryImpl = CategoryImpl;

/**
 * CategoryAxisBase manages category data for an axis.
 *
 * @class CategoryAxisBase
 * @constructor
 * @extends AxisBase
 * @uses CategoryImpl
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-category-base
 */
Y.CategoryAxisBase = Y.Base.create("categoryAxisBase", Y.AxisBase, [Y.CategoryImpl]);


}, '3.16.0', {"requires": ["axis-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-category', function (Y, NAME) {

/**
 * Provides functionality for drawing a category axis for use with a chart.
 *
 * @module charts
 * @submodule axis-category
 */
var Y_Lang = Y.Lang;
/**
 * CategoryAxis draws a category axis for a chart.
 *
 * @class CategoryAxis
 * @constructor
 * @extends Axis
 * @uses CategoryImpl
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-category
 */
Y.CategoryAxis = Y.Base.create("categoryAxis", Y.Axis, [Y.CategoryImpl], {
    /**
     * Returns a string corresponding to the first label on an
     * axis.
     *
     * @method getMinimumValue
     * @return String
     */
    getMinimumValue: function()
    {
        var data = this.get("data"),
            label = data[0];
        return label;
    },

    /**
     * Returns a string corresponding to the last label on an
     * axis.
     *
     * @method getMaximumValue
     * @return String
     */
    getMaximumValue: function()
    {
        var data = this.get("data"),
            len = data.length - 1,
            label = data[len];
        return label;
    },

    /**
     * Calculates and returns a value based on the number of labels and the index of
     * the current label.
     *
     * @method _getLabelByIndex
     * @param {Number} i Index of the label.
     * @return String
     * @private
     */
    _getLabelByIndex: function(i)
    {
        var label,
            data = this.get("data");
        label = data[i];
        return label;
    },

    /**
     * Returns an object literal containing and array of label values and an array of points.
     *
     * @method _getLabelData
     * @param {Object} startPoint An object containing x and y values.
     * @param {Number} edgeOffset Distance to offset coordinates.
     * @param {Number} layoutLength Distance that the axis spans.
     * @param {Number} count Number of labels.
     * @param {String} direction Indicates whether the axis is horizontal or vertical.
     * @param {Array} Array containing values for axis labels.
     * @return Array
     * @private
     */
    _getLabelData: function(constantVal, staticCoord, dynamicCoord, min, max, edgeOffset, layoutLength, count, dataValues)
    {
        var labelValue,
            i,
            points = [],
            values = [],
            point,
            labelIndex,
            data = this.get("data"),
            offset = edgeOffset;
        dataValues = dataValues || data;
        for(i = 0; i < count; i = i + 1)
        {
            labelValue = dataValues[i];
            labelIndex = Y.Array.indexOf(data, labelValue);
            if(Y_Lang.isNumber(labelIndex) && labelIndex > -1)
            {
                point = {};
                point[staticCoord] = constantVal;
                point[dynamicCoord] = this._getCoordFromValue(
                    min,
                    max,
                    layoutLength,
                    labelIndex,
                    offset
                );
                points.push(point);
                values.push(labelValue);
            }
        }
        return {
            points: points,
            values: values
        };
    }
});



}, '3.16.0', {"requires": ["axis", "axis-category-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-time-base', function (Y, NAME) {

/**
 * Provides functionality for the handling of time axis data for a chart.
 *
 * @module charts
 * @submodule axis-time-base
 */
var Y_Lang = Y.Lang;

/**
 * TimeImpl contains logic for time data. TimeImpl is used by the following classes:
 * <ul>
 *      <li>{{#crossLink "TimeAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "TimeAxis"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class TimeImpl
 * @constructor
 * @submodule axis-time-base
 */
function TimeImpl()
{
}

TimeImpl.NAME = "timeImpl";

TimeImpl.ATTRS =
{
    /**
     * Method used for formatting a label. This attribute allows for the default label formatting method to overridden.
     * The method use would need to implement the arguments below and return a `String` or an `HTMLElement`. The default
     * implementation of the method returns a `String`. The output of this method will be rendered to the DOM using
     * `appendChild`. If you override the `labelFunction` method and return an html string, you will also need to override
     * the Axis' `appendLabelFunction` to accept html as a `String`.
     * <dl>
     *      <dt>val</dt><dd>Label to be formatted. (`String`)</dd>
     *      <dt>format</dt><dd>STRFTime string used to format the label. (optional)</dd>
     * </dl>
     *
     * @attribute labelFunction
     * @type Function
     */

    /**
     * Pattern used by the `labelFunction` to format a label.
     *
     * @attribute labelFormat
     * @type String
     */
    labelFormat: {
        value: "%b %d, %y"
    }
};

TimeImpl.prototype = {
    /**
     * Type of data used in `Data`.
     *
     * @property _type
     * @readOnly
     * @private
     */
    _type: "time",

    /**
     * Getter method for maximum attribute.
     *
     * @method _maximumGetter
     * @return Number
     * @private
     */
    _maximumGetter: function ()
    {
        var max = this._getNumber(this._setMaximum);
        if(!Y_Lang.isNumber(max))
        {
            max = this._getNumber(this.get("dataMaximum"));
        }
        return parseFloat(max);
    },

    /**
     * Setter method for maximum attribute.
     *
     * @method _maximumSetter
     * @param {Object} value
     * @private
     */
    _maximumSetter: function (value)
    {
        this._setMaximum = this._getNumber(value);
        return value;
    },

    /**
     * Getter method for minimum attribute.
     *
     * @method _minimumGetter
     * @return Number
     * @private
     */
    _minimumGetter: function ()
    {
        var min = this._getNumber(this._setMinimum);
        if(!Y_Lang.isNumber(min))
        {
            min = this._getNumber(this.get("dataMinimum"));
        }
        return parseFloat(min);
    },

    /**
     * Setter method for minimum attribute.
     *
     * @method _minimumSetter
     * @param {Object} value
     * @private
     */
    _minimumSetter: function (value)
    {
        this._setMinimum = this._getNumber(value);
        return value;
    },

    /**
     * Indicates whether or not the maximum attribute has been explicitly set.
     *
     * @method _getSetMax
     * @return Boolean
     * @private
     */
    _getSetMax: function()
    {
        var max = this._getNumber(this._setMaximum);
        return (Y_Lang.isNumber(max));
    },

    /**
     * Indicates whether or not the minimum attribute has been explicitly set.
     *
     * @method _getSetMin
     * @return Boolean
     * @private
     */
    _getSetMin: function()
    {
        var min = this._getNumber(this._setMinimum);
        return (Y_Lang.isNumber(min));
    },

    /**
     * Formats a label based on the axis type and optionally specified format.
     *
     * @method formatLabel
     * @param {Object} value
     * @param {Object} format Pattern used to format the value.
     * @return String
     */
    formatLabel: function(val, format)
    {
        val = Y.DataType.Date.parse(val);
        if(format)
        {
            return Y.DataType.Date.format(val, {format:format});
        }
        return val;
    },

    /**
     * Constant used to generate unique id.
     *
     * @property GUID
     * @type String
     * @private
     */
    GUID: "yuitimeaxis",

    /**
     * Type of data used in `Axis`.
     *
     * @property _dataType
     * @readOnly
     * @private
     */
    _dataType: "time",

    /**
     * Gets an array of values based on a key.
     *
     * @method _getKeyArray
     * @param {String} key Value key associated with the data array.
     * @param {Array} data Array in which the data resides.
     * @return Array
     * @private
     */
    _getKeyArray: function(key, data)
    {
        var obj,
            keyArray = [],
            i = 0,
            val,
            len = data.length;
        for(; i < len; ++i)
        {
            obj = data[i][key];
            if(Y_Lang.isDate(obj))
            {
                val = obj.valueOf();
            }
            else
            {
                val = new Date(obj);
                if(Y_Lang.isDate(val))
                {
                    val = val.valueOf();
                }
                else if(!Y_Lang.isNumber(obj))
                {
                    if(Y_Lang.isNumber(parseFloat(obj)))
                    {
                        val = parseFloat(obj);
                    }
                    else
                    {
                        if(typeof obj !== "string")
                        {
                            obj = obj;
                        }
                        val = new Date(obj).valueOf();
                    }
                }
                else
                {
                    val = obj;
                }
            }
            keyArray[i] = val;
        }
        return keyArray;
    },

    /**
     * Calculates the maximum and minimum values for the `Axis`.
     *
     * @method _updateMinAndMax
     * @private
     */
    _updateMinAndMax: function()
    {
        var data = this.get("data"),
            max = 0,
            min = 0,
            len,
            num,
            i;
        if(data && data.length && data.length > 0)
        {
            len = data.length;
            max = min = data[0];
            if(len > 1)
            {
                for(i = 1; i < len; i++)
                {
                    num = data[i];
                    if(isNaN(num))
                    {
                        continue;
                    }
                    max = Math.max(num, max);
                    min = Math.min(num, min);
                }
            }
        }
        this._dataMaximum = max;
        this._dataMinimum = min;
    },

    /**
     * Returns a coordinate corresponding to a data values.
     *
     * @method _getCoordFromValue
     * @param {Number} min The minimum for the axis.
     * @param {Number} max The maximum for the axis.
     * @param {Number} length The distance that the axis spans.
     * @param {Number} dataValue A value used to ascertain the coordinate.
     * @param {Number} offset Value in which to offset the coordinates.
     * @param {Boolean} reverse Indicates whether the coordinates should start from
     * the end of an axis. Only used in the numeric implementation.
     * @return Number
     * @private
     */
    _getCoordFromValue: function(min, max, length, dataValue, offset)
    {
        var range,
            multiplier,
            valuecoord,
            isNumber = Y_Lang.isNumber;
            dataValue = this._getNumber(dataValue);
        if(isNumber(dataValue))
        {
            range = max - min;
            multiplier = length/range;
            valuecoord = (dataValue - min) * multiplier;
            valuecoord = offset + valuecoord;
        }
        else
        {
            valuecoord = NaN;
        }
        return valuecoord;
    },

    /**
     * Parses value into a number.
     *
     * @method _getNumber
     * @param val {Object} Value to parse into a number
     * @return Number
     * @private
     */
    _getNumber: function(val)
    {
        if(Y_Lang.isDate(val))
        {
            val = val.valueOf();
        }
        else if(!Y_Lang.isNumber(val) && val)
        {
            val = new Date(val).valueOf();
        }

        return val;
    }
};

Y.TimeImpl = TimeImpl;

/**
 * TimeAxisBase manages time data for an axis.
 *
 * @class TimeAxisBase
 * @extends AxisBase
 * @uses TimeImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-time-base
 */
Y.TimeAxisBase = Y.Base.create("timeAxisBase", Y.AxisBase, [Y.TimeImpl]);


}, '3.16.0', {"requires": ["axis-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-time', function (Y, NAME) {

/**
 * Provides functionality for drawing a time axis for use with a chart.
 *
 * @module charts
 * @submodule axis-time
 */
/**
 * TimeAxis draws a time-based axis for a chart.
 *
 * @class TimeAxis
 * @constructor
 * @extends Axis
 * @uses TimeImpl
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-time
 */
Y.TimeAxis = Y.Base.create("timeAxis", Y.Axis, [Y.TimeImpl], {
    /**
     * Calculates and returns a value based on the number of labels and the index of
     * the current label.
     *
     * @method _getLabelByIndex
     * @param {Number} i Index of the label.
     * @param {Number} l Total number of labels.
     * @return String
     * @private
     */
    _getLabelByIndex: function(i, l)
    {
        var min = this.get("minimum"),
            max = this.get("maximum"),
            increm,
            label;
            l -= 1;
        increm = ((max - min)/l) * i;
        label = min + increm;
        return label;
    },

    /**
     * Returns an object literal containing and array of label values and an array of points.
     *
     * @method _getLabelData
     * @param {Object} startPoint An object containing x and y values.
     * @param {Number} edgeOffset Distance to offset coordinates.
     * @param {Number} layoutLength Distance that the axis spans.
     * @param {Number} count Number of labels.
     * @param {String} direction Indicates whether the axis is horizontal or vertical.
     * @param {Array} Array containing values for axis labels.
     * @return Array
     * @private
     */
    _getLabelData: function(constantVal, staticCoord, dynamicCoord, min, max, edgeOffset, layoutLength, count, dataValues)
    {
        var dataValue,
            i,
            points = [],
            values = [],
            point,
            offset = edgeOffset;
        dataValues = dataValues || this._getDataValuesByCount(count, min, max);
        for(i = 0; i < count; i = i + 1)
        {
            dataValue = this._getNumber(dataValues[i]);
            if(dataValue <= max && dataValue >= min)
            {
                point = {};
                point[staticCoord] = constantVal;
                point[dynamicCoord] = this._getCoordFromValue(
                    min,
                    max,
                    layoutLength,
                    dataValue,
                    offset
                );
                points.push(point);
                values.push(dataValue);
            }
        }
        return {
            points: points,
            values: values
        };
    }
});



}, '3.16.0', {"requires": ["axis", "axis-time-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-stacked-base', function (Y, NAME) {

/**
 * Provides core functionality for the handling of stacked numeric axis data for a chart.
 *
 * @module charts
 * @submodule axis-stacked-base
 */

/**
 * StackedImpl contains logic for managing stacked numeric data. StackedImpl is used by the following classes:
 * <ul>
 *      <li>{{#crossLink "StackedAxisBase"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "StackedAxis"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @submodule axis-stacked-base
 * @class StackedImpl
 * @constructor
 */
function StackedImpl()
{
}

StackedImpl.NAME = "stackedImpl";

StackedImpl.prototype = {
    /**
     * Type of data used in `Data`.
     *
     * @property _type
     * @readOnly
     * @private
     */
    _type: "stacked",

    /**
     * Calculates the maximum and minimum values for the `Data`.
     *
     * @method _updateMinAndMax
     * @private
     */
    _updateMinAndMax: function()
    {
        var max = 0,
            min = 0,
            pos = 0,
            neg = 0,
            len = 0,
            i = 0,
            key,
            num,
            keys = this.get("keys"),
            setMin = this.get("setMin"),
            setMax = this.get("setMax");

        for(key in keys)
        {
            if(keys.hasOwnProperty(key))
            {
                len = Math.max(len, keys[key].length);
            }
        }
        for(; i < len; ++i)
        {
            pos = 0;
            neg = 0;
            for(key in keys)
            {
                if(keys.hasOwnProperty(key))
                {
                    num = keys[key][i];
                    if(isNaN(num))
                    {
                        continue;
                    }
                    if(num >= 0)
                    {
                        pos += num;
                    }
                    else
                    {
                        neg += num;
                    }
                }
            }
            if(pos > 0)
            {
                max = Math.max(max, pos);
            }
            else
            {
                max = Math.max(max, neg);
            }
            if(neg < 0)
            {
                min = Math.min(min, neg);
            }
            else
            {
                min = Math.min(min, pos);
            }
        }
        this._actualMaximum = max;
        this._actualMinimum = min;
        if(setMax)
        {
            max = this._setMaximum;
        }
        if(setMin)
        {
            min = this._setMinimum;
        }
        this._roundMinAndMax(min, max, setMin, setMax);
    }
};

Y.StackedImpl = StackedImpl;

/**
 * StackedAxisBase manages stacked numeric data for an axis.
 *
 * @class StackedAxisBase
 * @constructor
 * @extends AxisBase
 * @uses StackedImpl
 * @param {Object} config (optional) Configuration parameters.
 * @submodule axis-stacked-base
 */
Y.StackedAxisBase = Y.Base.create("stackedAxisBase", Y.NumericAxisBase, [Y.StackedImpl]);


}, '3.16.0', {"requires": ["axis-numeric-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('axis-stacked', function (Y, NAME) {

/**
 * Provides functionality for drawing a stacked numeric axis for use with a chart.
 *
 * @module charts
 * @submodule axis-stacked
 */
/**
 * StackedAxis draws a stacked numeric axis for a chart.
 *
 * @class StackedAxis
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @extends NumericAxis
 * @uses StackedImpl
 * @submodule axis-stacked
 */
Y.StackedAxis = Y.Base.create("stackedAxis", Y.NumericAxis, [Y.StackedImpl]);



}, '3.16.0', {"requires": ["axis-numeric", "axis-stacked-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-base', function (Y, NAME) {

/**
 * Provides functionality for creating a chart series.
 *
 * @module charts
 * @submodule series-base
 */

/**
 * An abstract class for creating series instances.
 * SeriesBase is used by the following classes:
 * <ul>
 *      <li>{{#crossLink "CartesianSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "PieSeries"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class SeriesBase
 * @extends Base
 * @uses Renderer
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-base
 */
Y.SeriesBase = Y.Base.create("seriesBase", Y.Base, [Y.Renderer], {
    /**
     * @method render
     * @private
     */
    render: function()
    {
        this._setCanvas();
        this.addListeners();
        this.validate();
    },

    /**
     * Creates a `Graphic` instance.
     *
     * @method _setCanvas
     * @protected
     */
    _setCanvas: function()
    {
        var graph = this.get("graph"),
            graphic = graph.get("graphic");
        this.set("graphic", graphic);
    },

    /**
     * Returns a reference to the parent container to which all chart elements are contained.
     * When the series is bound to a `Chart` instance, the `Chart` instance is the reference.
     * If nothing is set as the `chart` attribute, the `_getChart` method will return a reference
     * to the `graphic` attribute.
     *
     * @method _getChart
     * @return {Object}
     * @private
     */
    _getChart:function() {
        var chart,
            graph = this.get("graph");
        if(graph)
        {
            chart = graph.get("chart");
        }
        if(!chart)
        {
            chart = this.get("graphic");
        }
        return chart;
    },

    /**
     * Returns the sum of all values for the series.
     *
     * @method getTotalValues
     * @return Number
     */
    getTotalValues: function()
    {
        var valueCoord = this.get("direction") === "vertical" ? "x" : "y",
            total = this.get(valueCoord + "Axis").getTotalByKey(this.get(valueCoord + "Key"));
        return total;
    },

    /**
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function()
    {
        return {padding:{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }};
    },

    /**
     * Shows/hides contents of the series.
     *
     * @method _handleVisibleChange
     * @param {Object} e Event object.
     * @protected
     */
    _handleVisibleChange: function()
    {
        this._toggleVisible(this.get("visible"));
    },

    /**
     * Destructor implementation for the CartesianSeries class. Calls destroy on all Graphic instances.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        var marker,
            markers = this.get("markers");
        if(this.get("rendered"))
        {
            if(this._stylesChangeHandle)
            {
                this._stylesChangeHandle.detach();
            }
            if(this._widthChangeHandle)
            {
                this._widthChangeHandle.detach();
            }
            if(this._heightChangeHandle)
            {
                this._heightChangeHandle.detach();
            }
            if(this._visibleChangeHandle)
            {
                this._visibleChangeHandle.detach();
            }
        }
        while(markers && markers.length > 0)
        {
            marker = markers.shift();
            if(marker && marker instanceof Y.Shape)
            {
                marker.destroy();
            }
        }
        if(this._path)
        {
            this._path.destroy();
            this._path = null;
        }
        if(this._lineGraphic)
        {
            this._lineGraphic.destroy();
            this._lineGraphic = null;
        }
        if(this._groupMarker)
        {
            this._groupMarker.destroy();
            this._groupMarker = null;
        }
    },

    /**
     * Collection of default colors used for lines in a series when not specified by user.
     *
     * @property _defaultLineColors
     * @type Array
     * @protected
     */
    _defaultLineColors:[
        "#426ab3",
        "#d09b2c",
        "#000000",
        "#b82837",
        "#b384b5",
        "#ff7200",
        "#779de3",
        "#cbc8ba",
        "#7ed7a6",
        "#007a6c"
    ],

    /**
     * Collection of default colors used for marker fills in a series when not specified by user.
     *
     * @property _defaultFillColors
     * @type Array
     * @protected
     */
    _defaultFillColors:[
        "#6084d0",
        "#eeb647",
        "#6c6b5f",
        "#d6484f",
        "#ce9ed1",
        "#ff9f3b",
        "#93b7ff",
        "#e0ddd0",
        "#94ecba",
        "#309687"
    ],

    /**
     * Collection of default colors used for marker borders in a series when not specified by user.
     *
     * @property _defaultBorderColors
     * @type Array
     * @protected
     */
    _defaultBorderColors:[
        "#205096",
        "#b38206",
        "#000000",
        "#94001e",
        "#9d6fa0",
        "#e55b00",
        "#5e85c9",
        "#adab9e",
        "#6ac291",
        "#006457"
    ],

    /**
     * Collection of default colors used for area fills, histogram fills and pie fills in a series when not specified by user.
     *
     * @property _defaultSliceColors
     * @type Array
     * @protected
     */
    _defaultSliceColors: [
        "#66007f",
        "#a86f41",
        "#295454",
        "#996ab2",
        "#e8cdb7",
        "#90bdbd",
        "#000000",
        "#c3b8ca",
        "#968373",
        "#678585"
    ],

    /**
     * Parses a color based on a series order and type.
     *
     * @method _getDefaultColor
     * @param {Number} index Index indicating the series order.
     * @param {String} type Indicates which type of object needs the color.
     * @return String
     * @protected
     */
    _getDefaultColor: function(index, type)
    {
        var colors = {
                line: this._defaultLineColors,
                fill: this._defaultFillColors,
                border: this._defaultBorderColors,
                slice: this._defaultSliceColors
            },
            col = colors[type] || colors.fill,
            l = col.length;
        index = index || 0;
        if(index >= l)
        {
            index = index % l;
        }
        type = type || "fill";
        return colors[type][index];
    }
}, {
    ATTRS: {
        /*
         * Returns the width of the parent graph
         *
         * @attribute width
         * @type Number
         */
        width: {
            readOnly: true,

            getter: function()
            {
                return this.get("graphic").get("width");
            }
        },

        /**
         * Returns the height of the parent graph
         *
         * @attribute height
         * @type Number
         */
        height: {
            readOnly: true,

            getter: function()
            {
                return this.get("graphic").get("height");
            }
        },

        /**
         * The graphic in which drawings will be rendered.
         *
         * @attribute graphic
         * @type Graphic
         */
        graphic: {
            lazyAdd: false,

            setter: function(val) {
                //woraround for Attribute order of operations bug
                if(!this.get("rendered")) {
                    this.set("rendered", true);
                }
                return val;
            }
        },

        /**
         * Reference to the `Chart` application. If no `Chart` application is present,
         * a reference to the `Graphic` instance that the series is drawn into will be returned.
         *
         * @attribute chart
         * @type ChartBase
         */
        chart: {
            getter: function()
            {
                var chart,
                    graph = this.get("graph");
                if(graph)
                {
                    chart = graph.get("chart");
                }
                return chart;
            }
        },

        /**
         * Reference to the `Graph` in which the series is drawn into.
         *
         * @attribute graph
         * @type Graph
         */
        graph: {},

        /**
         * Indicates whether the Series has been through its initial set up.
         *
         * @attribute rendered
         * @type Boolean
         */
        rendered: {
            value: false
        },

        /**
         * Indicates whether to show the series
         *
         * @attribute visible
         * @type Boolean
         * @default true
         */
        visible: {
            value: true
        },

        /**
         * Indicates whether or not markers for a series will be grouped and rendered in a single complex shape instance.
         *
         * @attribute groupMarkers
         * @type Boolean
         */
        groupMarkers: {
            getter: function()
            {
                var graph,
                    groupMarkers = this._groupMarkers;
                if(!groupMarkers) {
                    graph = this.get("graph");
                    if(graph)
                    {
                        groupMarkers = graph.get("groupMarkers");
                    }
                }
                return groupMarkers;
            },

            setter: function(val)
            {
                this._groupMarkers = val;
                return val;
            }
        }
    }
});


}, '3.16.0', {"requires": ["graphics", "axis-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-plot-util', function (Y, NAME) {

/**
 * Provides functionality for drawing plots in a series.
 *
 * @module charts
 * @submodule series-plot-util
 */
var Y_Lang = Y.Lang,
    _getClassName = Y.ClassNameManager.getClassName,
    SERIES_MARKER = _getClassName("seriesmarker");

/**
 * Utility class used for drawing markers.
 *
 * @class Plots
 * @constructor
 * @submodule series-plot-util
 */
function Plots(cfg)
{
    var attrs = {
        markers: {
            getter: function()
            {
                return this._markers;
            }
        }
    };
    this.addAttrs(attrs, cfg);
}

Plots.prototype = {
    /**
     * Storage for default marker styles.
     *
     * @property _plotDefaults
     * @type Object
     * @private
     */
    _plotDefaults: null,

    /**
     * Draws the markers
     *
     * @method drawPlots
     * @protected
     */
    drawPlots: function()
    {
        if(!this.get("xcoords") || this.get("xcoords").length < 1)
		{
			return;
		}
        var isNumber = Y_Lang.isNumber,
            style = this._copyObject(this.get("styles").marker),
            w = style.width,
            h = style.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            left,
            marker,
            offsetWidth = w/2,
            offsetHeight = h/2,
            xvalues,
            yvalues,
            fillColors = null,
            borderColors = null,
            graphOrder = this.get("graphOrder"),
            groupMarkers = this.get("groupMarkers");
        if(groupMarkers)
        {
            xvalues = [];
            yvalues = [];
            for(; i < len; ++i)
            {
                xvalues.push(parseFloat(xcoords[i] - offsetWidth));
                yvalues.push(parseFloat(ycoords[i] - offsetHeight));
            }
            this._createGroupMarker({
                xvalues: xvalues,
                yvalues: yvalues,
                fill: style.fill,
                border: style.border,
                dimensions: {
                    width: w,
                    height: h
                },
                graphOrder: graphOrder,
                shape: style.shape
            });
            return;
        }
        if(Y_Lang.isArray(style.fill.color))
        {
            fillColors = style.fill.color.concat();
        }
        if(Y_Lang.isArray(style.border.color))
        {
            borderColors = style.border.color.concat();
        }
        this._createMarkerCache();
        for(; i < len; ++i)
        {
            top = parseFloat(ycoords[i] - offsetHeight);
            left = parseFloat(xcoords[i] - offsetWidth);
            if(!isNumber(left) || !isNumber(top))
            {
                this._markers.push(null);
                continue;
            }
            if(fillColors)
            {
                style.fill.color = fillColors[i % fillColors.length];
            }
            if(borderColors)
            {
                style.border.color = borderColors[i % borderColors.length];
            }

            style.x = left;
            style.y = top;
            marker = this.getMarker(style, graphOrder, i);
        }
        this._clearMarkerCache();
    },

    /**
     * Pre-defined group shapes.
     *
     * @property _groupShapes
     * @private
     */
    _groupShapes: {
        circle: Y.CircleGroup,
        rect: Y.RectGroup,
        ellipse: Y.EllipseGroup,
        diamond: Y.DiamondGroup
    },

    /**
     * Returns the correct group shape class.
     *
     * @method _getGroupShape
     * @param {Shape | String} shape Indicates which shape class.
     * @return Function
     * @protected
     */
    _getGroupShape: function(shape)
    {
        if(Y_Lang.isString(shape))
        {
            shape = this._groupShapes[shape];
        }
        return shape;
    },

    /**
     * Gets the default values for series that use the utility. This method is used by
     * the class' `styles` attribute's getter to get build default values.
     *
     * @method _getPlotDefaults
     * @return Object
     * @protected
     */
    _getPlotDefaults: function()
    {
        var defs = {
            fill:{
                type: "solid",
                alpha: 1,
                colors:null,
                alphas: null,
                ratios: null
            },
            border:{
                weight: 1,
                alpha: 1
            },
            width: 10,
            height: 10,
            shape: "circle"
        };
        defs.fill.color = this._getDefaultColor(this.get("graphOrder"), "fill");
        defs.border.color = this._getDefaultColor(this.get("graphOrder"), "border");
        return defs;
    },

    /**
     * Collection of markers to be used in the series.
     *
     * @property _markers
     * @type Array
     * @private
     */
    _markers: null,

    /**
     * Collection of markers to be re-used on a series redraw.
     *
     * @property _markerCache
     * @type Array
     * @private
     */
    _markerCache: null,

    /**
     * Gets and styles a marker. If there is a marker in cache, it will use it. Otherwise
     * it will create one.
     *
     * @method getMarker
     * @param {Object} styles Hash of style properties.
     * @param {Number} order Order of the series.
     * @param {Number} index Index within the series associated with the marker.
     * @return Shape
     * @protected
     */
    getMarker: function(styles, order, index)
    {
        var marker,
            border = styles.border;
        styles.id = this._getChart().get("id") + "_" + order + "_" + index;
        //fix name differences between graphic layer
        border.opacity = border.alpha;
        styles.stroke = border;
        styles.fill.opacity = styles.fill.alpha;
        if(this._markerCache.length > 0)
        {
            while(!marker)
            {
                if(this._markerCache.length < 1)
                {
                    marker = this._createMarker(styles);
                    break;
                }
                marker = this._markerCache.shift();

            }
            marker.set(styles);
        }
        else
        {
            marker = this._createMarker(styles);
        }
        this._markers.push(marker);
        return marker;
    },

    /**
     * Creates a shape to be used as a marker.
     *
     * @method _createMarker
     * @param {Object} styles Hash of style properties.
     * @return Shape
     * @private
     */
    _createMarker: function(styles)
    {
        var graphic = this.get("graphic"),
            marker,
            cfg = this._copyObject(styles);
        cfg.type = cfg.shape;
        marker = graphic.addShape(cfg);
        marker.addClass(SERIES_MARKER);
        return marker;
    },

    /**
     * Creates a cache of markers for reuse.
     *
     * @method _createMarkerCache
     * @private
     */
    _createMarkerCache: function()
    {
        if(this._groupMarker)
        {
            this._groupMarker.destroy();
            this._groupMarker = null;
        }
        if(this._markers && this._markers.length > 0)
        {
            this._markerCache = this._markers.concat();
        }
        else
        {
            this._markerCache = [];
        }
        this._markers = [];
    },

    /**
     * Draws a series of markers in a single shape instance.
     *
     * @method _createGroupMarkers
     * @param {Object} styles Set of configuration properties used to create the markers.
     * @protected
     */
    _createGroupMarker: function(styles)
    {
        var marker,
            markers = this.get("markers"),
            border = styles.border,
            graphic,
            cfg,
            shape;
        if(markers && markers.length > 0)
        {
            while(markers.length > 0)
            {
                marker = markers.shift();
                marker.destroy();
            }
            this.set("markers", []);
        }
        //fix name differences between graphic layer
        border.opacity = border.alpha;
        cfg = {
            id: this._getChart().get("id") + "_" + styles.graphOrder,
            stroke: border,
            fill: styles.fill,
            dimensions: styles.dimensions,
            xvalues: styles.xvalues,
            yvalues: styles.yvalues
        };
        cfg.fill.opacity = styles.fill.alpha;
        shape = this._getGroupShape(styles.shape);
        if(shape)
        {
            cfg.type = shape;
        }
        if(styles.hasOwnProperty("radius") && !isNaN(styles.radius))
        {
            cfg.dimensions.radius = styles.radius;
        }
        if(this._groupMarker)
        {
            this._groupMarker.destroy();
        }
        graphic = this.get("graphic");
        this._groupMarker = graphic.addShape(cfg);
        graphic._redraw();
    },

    /**
     * Toggles visibility
     *
     * @method _toggleVisible
     * @param {Boolean} visible indicates visibilitye
     * @private
     */
    _toggleVisible: function(visible)
    {
        var marker,
            markers = this.get("markers"),
            i = 0,
            len;
        if(markers)
        {
            len = markers.length;
            for(; i < len; ++i)
            {
                marker = markers[i];
                if(marker)
                {
                    marker.set("visible", visible);
                }
            }
        }
    },

    /**
     * Removes unused markers from the marker cache
     *
     * @method _clearMarkerCache
     * @private
     */
    _clearMarkerCache: function()
    {
        var marker;
        while(this._markerCache.length > 0)
        {
            marker = this._markerCache.shift();
            if(marker)
            {
                marker.destroy();
            }
        }
    },

    /**
     * Resizes and positions markers based on a mouse interaction.
     *
     * @method updateMarkerState
     * @param {String} type state of the marker
     * @param {Number} i index of the marker
     * @protected
     */
    updateMarkerState: function(type, i)
    {
        if(this._markers && this._markers[i])
        {
            var w,
                h,
                styles = this._copyObject(this.get("styles").marker),
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                markerStyles = state === "off" || !styles[state] ? styles : styles[state];
                markerStyles.fill.color = this._getItemColor(markerStyles.fill.color, i);
                markerStyles.border.color = this._getItemColor(markerStyles.border.color, i);
                markerStyles.stroke = markerStyles.border;
                marker.set(markerStyles);
                w = markerStyles.width;
                h = markerStyles.height;
                marker.set("x", (xcoords[i] - w/2));
                marker.set("y",  (ycoords[i] - h/2));
                marker.set("visible", this.get("visible"));
        }
    },

    /**
     * Parses a color from an array.
     *
     * @method _getItemColor
     * @param {Array} val collection of colors
     * @param {Number} i index of the item
     * @return String
     * @protected
     */
    _getItemColor: function(val, i)
    {
        if(Y_Lang.isArray(val))
        {
            return val[i % val.length];
        }
        return val;
    },

    /**
     * Method used by `styles` setter. Overrides base implementation.
     *
     * @method _setStyles
     * @param {Object} newStyles Hash of properties to update.
     * @return Object
     * @protected
     */
    _setStyles: function(val)
    {
        val = this._parseMarkerStyles(val);
        return Y.Renderer.prototype._setStyles.apply(this, [val]);
    },

    /**
     * Combines new styles with existing styles.
     *
     * @method _parseMarkerStyles
     * @param {Object} Object containing style properties for the marker.
     * @return Object
     * @private
     */
    _parseMarkerStyles: function(val)
    {
        if(val.marker)
        {
            var defs = this._getPlotDefaults();
            val.marker = this._mergeStyles(val.marker, defs);
            if(val.marker.over)
            {
                val.marker.over = this._mergeStyles(val.marker.over, val.marker);
            }
            if(val.marker.down)
            {
                val.marker.down = this._mergeStyles(val.marker.down, val.marker);
            }
        }
        return val;
    },

    /**
     * Returns marker state based on event type
     *
     * @method _getState
     * @param {String} type event type
     * @return String
     * @protected
     */
    _getState: function(type)
    {
        var state;
        switch(type)
        {
            case "mouseout" :
                state = "off";
            break;
            case "mouseover" :
                state = "over";
            break;
            case "mouseup" :
                state = "over";
            break;
            case "mousedown" :
                state = "down";
            break;
        }
        return state;
    },

    /**
     * @property _statSyles
     * @type Object
     * @private
     */
    _stateSyles: null,

    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        this.drawPlots();
    },

    /**
     * @protected
     *
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     */
    _getDefaultStyles: function()
    {
        var styles = this._mergeStyles({marker:this._getPlotDefaults()}, this.constructor.superclass._getDefaultStyles());
        return styles;
    }
};

Y.augment(Plots, Y.Attribute);
Y.Plots = Plots;


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-pie', function (Y, NAME) {

/**
 * Provides functionality for creating a pie series.
 *
 * @module charts
 * @submodule series-pie
 */
/**
 * PieSeries visualizes data as a circular chart divided into wedges which represent data as a
 * percentage of a whole.
 *
 * @class PieSeries
 * @constructor
 * @extends SeriesBase
 * @uses Plots
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-pie
 */
var CONFIG = Y.config,
    DOCUMENT = CONFIG.doc,
    _getClassName = Y.ClassNameManager.getClassName,
    SERIES_MARKER = _getClassName("seriesmarker");
Y.PieSeries = Y.Base.create("pieSeries", Y.SeriesBase, [Y.Plots], {
    /**
     * Image map used for interactivity when rendered with canvas.
     *
     * @property _map
     * @type HTMLElement
     * @private
     */
    _map: null,

    /**
     * Image used for image map when rendered with canvas.
     *
     * @property _image
     * @type HTMLElement
     * @private
     */
    _image: null,

    /**
     * Creates or updates the image map when rendered with canvas.
     *
     * @method _setMap
     * @private
     */
    _setMap: function()
    {
        var id = "pieHotSpotMapi_" + Math.round(100000 * Math.random()),
            graph = this.get("graph"),
            graphic,
            cb,
            areaNode;
        if(graph)
        {
            cb = graph.get("contentBox");
        }
        else
        {
            graphic = this.get("graphic");
            cb = graphic.get("node");
        }
        if(this._image)
        {
            cb.removeChild(this._image);
            while(this._areaNodes && this._areaNodes.length > 0)
            {
                areaNode = this._areaNodes.shift();
                this._map.removeChild(areaNode);
            }
            cb.removeChild(this._map);
        }
        this._image = DOCUMENT.createElement("img");
        this._image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAABCAYAAAD9yd/wAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSB" +
                        "JbWFnZVJlYWR5ccllPAAAABJJREFUeNpiZGBgSGPAAgACDAAIkABoFyloZQAAAABJRU5ErkJggg==";
        cb.appendChild(this._image);
        this._image.style.position = "absolute";
        this._image.style.left = "0px";
        this._image.style.top = "0px";
        this._image.setAttribute("usemap", "#" + id);
        this._image.style.zIndex = 3;
        this._image.style.opacity = 0;
        this._image.setAttribute("alt", "imagemap");
        this._map = DOCUMENT.createElement("map");
        cb.appendChild(this._map);
        this._map.setAttribute("name", id);
        this._map.setAttribute("id", id);
        this._areaNodes = [];
    },

    /**
     * Storage for `categoryDisplayName` attribute.
     *
     * @property _categoryDisplayName
     * @private
     */
    _categoryDisplayName: null,

    /**
     * Storage for `valueDisplayName` attribute.
     *
     * @property _valueDisplayName
     * @private
     */
    _valueDisplayName: null,

    /**
     * Adds event listeners.
     *
     * @method addListeners
     * @private
     */
    addListeners: function()
    {
        var categoryAxis = this.get("categoryAxis"),
            valueAxis = this.get("valueAxis");
        if(categoryAxis)
        {
            categoryAxis.after("dataReady", Y.bind(this._categoryDataChangeHandler, this));
            categoryAxis.after("dataUpdate", Y.bind(this._categoryDataChangeHandler, this));
        }
        if(valueAxis)
        {
            valueAxis.after("dataReady", Y.bind(this._valueDataChangeHandler, this));
            valueAxis.after("dataUpdate", Y.bind(this._valueDataChangeHandler, this));
        }
        this.after("categoryAxisChange", this.categoryAxisChangeHandler);
        this.after("valueAxisChange", this.valueAxisChangeHandler);
        this._stylesChangeHandle = this.after("stylesChange", this._updateHandler);
        this._visibleChangeHandle = this.after("visibleChange", this._handleVisibleChange);
    },

    /**
     * Draws the series.
     *
     * @method validate
     * @private
     */
    validate: function()
    {
        this.draw();
        this._renderered = true;
    },

    /**
     * Event handler for the categoryAxisChange event.
     *
     * @method _categoryAxisChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _categoryAxisChangeHandler: function()
    {
        var categoryAxis = this.get("categoryAxis");
        categoryAxis.after("dataReady", Y.bind(this._categoryDataChangeHandler, this));
        categoryAxis.after("dataUpdate", Y.bind(this._categoryDataChangeHandler, this));
    },

    /**
     * Event handler for the valueAxisChange event.
     *
     * @method _valueAxisChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _valueAxisChangeHandler: function()
    {
        var valueAxis = this.get("valueAxis");
        valueAxis.after("dataReady", Y.bind(this._valueDataChangeHandler, this));
        valueAxis.after("dataUpdate", Y.bind(this._valueDataChangeHandler, this));
    },

    /**
     * Constant used to generate unique id.
     *
     * @property GUID
     * @type String
     * @private
     */
    GUID: "pieseries",

    /**
     * Event handler for categoryDataChange event.
     *
     * @method _categoryDataChangeHandler
     * @param {Object} event Event object.
     * @private
     */
    _categoryDataChangeHandler: function()
    {
       if(this._rendered && this.get("categoryKey") && this.get("valueKey"))
        {
            this.draw();
        }
    },

    /**
     * Event handler for valueDataChange event.
     *
     * @method _valueDataChangeHandler
     * @param {Object} event Event object.
     * @private
     */
    _valueDataChangeHandler: function()
    {
        if(this._rendered && this.get("categoryKey") && this.get("valueKey"))
        {
            this.draw();
        }
    },

    /**
     * Returns the sum of all values for the series.
     *
     * @method getTotalValues
     * @return Number
     */
    getTotalValues: function()
    {
        var total = this.get("valueAxis").getTotalByKey(this.get("valueKey"));
        return total;
    },

    /**
     * Draws the series. Overrides the base implementation.
     *
     * @method draw
     * @protected
     */
    draw: function()
    {
        var w = this.get("width"),
            h = this.get("height");
        if(isFinite(w) && isFinite(h) && w > 0 && h > 0)
        {
            this._rendered = true;
            if(this._drawing)
            {
                this._callLater = true;
                return;
            }
            this._drawing = true;
            this._callLater = false;
            this.drawSeries();
            this._drawing = false;
            if(this._callLater)
            {
                this.draw();
            }
            else
            {
                this.fire("drawingComplete");
            }
        }
    },

    /**
     * Draws the markers
     *
     * @method drawPlots
     * @protected
     */
    drawPlots: function()
    {
        var values = this.get("valueAxis").getDataByKey(this.get("valueKey")).concat(),
            totalValue = 0,
            itemCount = values.length,
            styles = this.get("styles").marker,
            fillColors = styles.fill.colors,
            fillAlphas = styles.fill.alphas || ["1"],
            borderColors = styles.border.colors,
            borderWeights = [styles.border.weight],
            borderAlphas = [styles.border.alpha],
            tbw = borderWeights.concat(),
            tbc = borderColors.concat(),
            tba = borderAlphas.concat(),
            tfc,
            tfa,
            padding = styles.padding,
            graphic = this.get("graphic"),
            minDimension = Math.min(graphic.get("width"), graphic.get("height")),
            w = minDimension - (padding.left + padding.right),
            h = minDimension - (padding.top + padding.bottom),
            startAngle = -90,
            halfWidth = w / 2,
            halfHeight = h / 2,
            radius = Math.min(halfWidth, halfHeight),
            i = 0,
            value,
            angle = 0,
            lc,
            la,
            lw,
            wedgeStyle,
            marker,
            graphOrder = this.get("graphOrder") || 0,
            isCanvas = Y.Graphic.NAME === "canvasGraphic";
        for(; i < itemCount; ++i)
        {
            value = parseFloat(values[i]);

            values.push(value);
            if(!isNaN(value))
            {
                totalValue += value;
            }
        }

        tfc = fillColors ? fillColors.concat() : null;
        tfa = fillAlphas ? fillAlphas.concat() : null;
        this._createMarkerCache();
        if(isCanvas)
        {
            this._setMap();
            this._image.width = w;
            this._image.height = h;
        }
        for(i = 0; i < itemCount; i++)
        {
            value = values[i];
            if(totalValue === 0)
            {
                angle = 360 / values.length;
            }
            else
            {
                angle = 360 * (value / totalValue);
            }
            if(tfc && tfc.length < 1)
            {
                tfc = fillColors.concat();
            }
            if(tfa && tfa.length < 1)
            {
                tfa = fillAlphas.concat();
            }
            if(tbw && tbw.length < 1)
            {
                tbw = borderWeights.concat();
            }
            if(tbw && tbc.length < 1)
            {
                tbc = borderColors.concat();
            }
            if(tba && tba.length < 1)
            {
                tba = borderAlphas.concat();
            }
            lw = tbw ? tbw.shift() : null;
            lc = tbc ? tbc.shift() : null;
            la = tba ? tba.shift() : null;
            startAngle += angle;
            wedgeStyle = {
                border: {
                    color:lc,
                    weight:lw,
                    alpha:la
                },
                fill: {
                    color:tfc ? tfc.shift() : this._getDefaultColor(i, "slice"),
                    alpha:tfa ? tfa.shift() : null
                },
                type: "pieslice",
                arc: angle,
                radius: radius,
                startAngle: startAngle,
                cx: halfWidth,
                cy: halfHeight,
                width: w,
                height: h
            };
            marker = this.getMarker(wedgeStyle, graphOrder, i);
            if(isCanvas)
            {
                this._addHotspot(wedgeStyle, graphOrder, i);
            }
        }
        this._clearMarkerCache();
    },

    /**
     * @protected
     *
     * Method used by `styles` setter. Overrides base implementation.
     *
     * @method _setStyles
     * @param {Object} newStyles Hash of properties to update.
     * @return Object
     */
    _setStyles: function(val)
    {
        if(!val.marker)
        {
            val = {marker:val};
        }
        val = this._parseMarkerStyles(val);
        return Y.PieSeries.superclass._mergeStyles.apply(this, [val, this._getDefaultStyles()]);
    },

    /**
     *  Adds an interactive map when rendering in canvas.
     *
     *  @method _addHotspot
     *  @param {Object} cfg Object containing data used to draw the hotspot
     *  @param {Number} seriesIndex Index of series in the `seriesCollection`.
     *  @param {Number} index Index of the marker using the hotspot.
     *  @private
     */
    _addHotspot: function(cfg, seriesIndex, index)
    {
        var areaNode = DOCUMENT.createElement("area"),
            i = 1,
            x = cfg.cx,
            y = cfg.cy,
            arc = cfg.arc,
            startAngle = cfg.startAngle - arc,
            endAngle = cfg.startAngle,
            radius = cfg.radius,
            ax = x + Math.cos(startAngle / 180 * Math.PI) * radius,
            ay = y + Math.sin(startAngle / 180 * Math.PI) * radius,
            bx = x + Math.cos(endAngle / 180 * Math.PI) * radius,
            by = y + Math.sin(endAngle / 180 * Math.PI) * radius,
            numPoints = Math.floor(arc/10) - 1,
            divAngle = (arc/(Math.floor(arc/10)) / 180) * Math.PI,
            angleCoord = Math.atan((ay - y)/(ax - x)),
            pts = x + ", " + y + ", " + ax + ", " + ay,
            cosAng,
            sinAng,
            multDivAng;
        for(i = 1; i <= numPoints; ++i)
        {
            multDivAng = divAngle * i;
            cosAng = Math.cos(angleCoord + multDivAng);
            sinAng = Math.sin(angleCoord + multDivAng);
            if(startAngle <= 90)
            {
                pts += ", " + (x + (radius * Math.cos(angleCoord + (divAngle * i))));
                pts += ", " + (y + (radius * Math.sin(angleCoord + (divAngle * i))));
            }
            else
            {
                pts += ", " + (x - (radius * Math.cos(angleCoord + (divAngle * i))));
                pts += ", " + (y - (radius * Math.sin(angleCoord + (divAngle * i))));
            }
        }
        pts += ", " + bx + ", " + by;
        pts += ", " + x + ", " + y;
        this._map.appendChild(areaNode);
        areaNode.setAttribute("class", SERIES_MARKER);
        areaNode.setAttribute("id", "hotSpot_" + seriesIndex + "_" + index);
        areaNode.setAttribute("shape", "polygon");
        areaNode.setAttribute("coords", pts);
        this._areaNodes.push(areaNode);

    },

    /**
     * Resizes and positions markers based on a mouse interaction.
     *
     * @method updateMarkerState
     * @param {String} type state of the marker
     * @param {Number} i index of the marker
     * @protected
     */
    updateMarkerState: function(type, i)
    {
        if(this._markers[i])
        {
            var state = this._getState(type),
                markerStyles,
                indexStyles,
                marker = this._markers[i],
                styles = this.get("styles").marker;
            markerStyles = state === "off" || !styles[state] ? styles : styles[state];
            indexStyles = this._mergeStyles(markerStyles, {});
            indexStyles.fill.color = indexStyles.fill.colors[i % indexStyles.fill.colors.length];
            indexStyles.fill.alpha = indexStyles.fill.alphas[i % indexStyles.fill.alphas.length];
            marker.set(indexStyles);
        }
    },

    /**
     * Creates a shape to be used as a marker.
     *
     * @method _createMarker
     * @param {Object} styles Hash of style properties.
     * @return Shape
     * @private
     */
    _createMarker: function(styles)
    {
        var graphic = this.get("graphic"),
            marker,
            cfg = this._copyObject(styles);
        marker = graphic.addShape(cfg);
        marker.addClass(SERIES_MARKER);
        return marker;
    },

    /**
     * Creates a cache of markers for reuse.
     *
     * @method _createMarkerCache
     * @private
     */
    _clearMarkerCache: function()
    {
        var len = this._markerCache.length,
            i = 0,
            marker;
        for(; i < len; ++i)
        {
            marker = this._markerCache[i];
            if(marker)
            {
                marker.destroy();
            }
        }
        this._markerCache = [];
    },

    /**
     * Gets the default style values for the markers.
     *
     * @method _getPlotDefaults
     * @return Object
     * @private
     */
    _getPlotDefaults: function()
    {
         var defs = {
            padding:{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            fill:{
                alphas:["1"]
            },
            border: {
                weight: 0,
                alpha: 1
            }
        };
        defs.fill.colors = this._defaultSliceColors;
        defs.border.colors = this._defaultBorderColors;
        return defs;
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default pie
         */
        type: {
            value: "pie"
        },

        /**
         * Order of this instance of this `type`.
         *
         * @attribute order
         * @type Number
         */
        order: {},

        /**
         * Reference to the `Graph` in which the series is drawn into.
         *
         * @attribute graph
         * @type Graph
         */
        graph: {},

        /**
         * Reference to the `Axis` instance used for assigning
         * category values to the graph.
         *
         * @attribute categoryAxis
         * @type Axis
         */
        categoryAxis: {
            value: null,

            validator: function(value)
            {
                return value !== this.get("categoryAxis");
            }
        },

        /**
         * Reference to the `Axis` instance used for assigning
         * series values to the graph.
         *
         * @attribute categoryAxis
         * @type Axis
         */
        valueAxis: {
            value: null,

            validator: function(value)
            {
                return value !== this.get("valueAxis");
            }
        },

        /**
         * Indicates which array to from the hash of value arrays in
         * the category `Axis` instance.
         *
         * @attribute categoryKey
         * @type String
         */
        categoryKey: {
            value: null,

            validator: function(value)
            {
                return value !== this.get("categoryKey");
            }
        },
        /**
         * Indicates which array to from the hash of value arrays in
         * the value `Axis` instance.
         *
         * @attribute valueKey
         * @type String
         */
        valueKey: {
            value: null,

            validator: function(value)
            {
                return value !== this.get("valueKey");
            }
        },

        /**
         * Name used for for displaying category data
         *
         * @attribute categoryDisplayName
         * @type String
         */
        categoryDisplayName: {
            setter: function(val)
            {
                this._categoryDisplayName = val;
                return val;
            },

            getter: function()
            {
                return this._categoryDisplayName || this.get("categoryKey");
            }
        },

        /**
         * Name used for for displaying value data
         *
         * @attribute valueDisplayName
         * @type String
         */
        valueDisplayName: {
            setter: function(val)
            {
                this._valueDisplayName = val;
                return val;
            },

            getter: function()
            {
                return this._valueDisplayName || this.get("valueKey");
            }
        },

        /**
         * @attribute slices
         * @type Array
         * @private
         */
        slices: null

        /**
         * Style properties used for drawing markers. This attribute is inherited from `MarkerSeries`. Below are  the default
         * values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>colors</dt><dd>An array of colors to be used for the marker fills. The color for each marker  is
         *              retrieved from the array below:<br/>
         *              `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *              </dd>
         *              <dt>alphas</dt><dd>An array of alpha references (Number from 0 to 1) indicating the opacity of each marker
         *              fill. The default value is [1].</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>An array of colors to be used for the marker borders. The color for each marker is
         *              retrieved from the array below:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>over</dt><dd>hash containing styles for markers when highlighted by a `mouseover` event. The default
         *      values for each style is null. When an over style is not set, the non-over value will be used. For example,
         *      the default value for `marker.over.fill.color` is equivalent to `marker.fill.color`.</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});


}, '3.16.0', {"requires": ["series-base", "series-plot-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-cartesian', function (Y, NAME) {

/**
 * Provides functionality for creating a cartesian chart series.
 *
 * @module charts
 * @submodule series-cartesian
 */
var Y_Lang = Y.Lang;

/**
 * An abstract class for creating series instances with horizontal and vertical axes.
 * CartesianSeries provides the core functionality used by the following classes:
 * <ul>
 *      <li>{{#crossLink "LineSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "MarkerSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "AreaSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "SplineSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "AreaSplineSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "ComboSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "ComboSplineSeries"}}{{/crossLink}}</li>
 *      <li>{{#crossLink "Histogram"}}{{/crossLink}}</li>
 *  </ul>
 *
 * @class CartesianSeries
 * @extends SeriesBase
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-base
 */
Y.CartesianSeries = Y.Base.create("cartesianSeries", Y.SeriesBase, [], {
    /**
     * Storage for `xDisplayName` attribute.
     *
     * @property _xDisplayName
     * @type String
     * @private
     */
    _xDisplayName: null,

    /**
     * Storage for `yDisplayName` attribute.
     *
     * @property _yDisplayName
     * @type String
     * @private
     */
    _yDisplayName: null,

    /**
     * Th x-coordinate for the left edge of the series.
     *
     * @property _leftOrigin
     * @type String
     * @private
     */
    _leftOrigin: null,

    /**
     * The y-coordinate for the bottom edge of the series.
     *
     * @property _bottomOrigin
     * @type String
     * @private
     */
    _bottomOrigin: null,

    /**
     * Adds event listeners.
     *
     * @method addListeners
     * @private
     */
    addListeners: function()
    {
        var xAxis = this.get("xAxis"),
            yAxis = this.get("yAxis");
        if(xAxis)
        {
            this._xDataReadyHandle = xAxis.after("dataReady", Y.bind(this._xDataChangeHandler, this));
            this._xDataUpdateHandle = xAxis.after("dataUpdate", Y.bind(this._xDataChangeHandler, this));
        }
        if(yAxis)
        {
            this._yDataReadyHandle = yAxis.after("dataReady", Y.bind(this._yDataChangeHandler, this));
            this._yDataUpdateHandle = yAxis.after("dataUpdate", Y.bind(this._yDataChangeHandler, this));
        }
        this._xAxisChangeHandle = this.after("xAxisChange", this._xAxisChangeHandler);
        this._yAxisChangeHandle = this.after("yAxisChange", this._yAxisChangeHandler);
        this._stylesChangeHandle = this.after("stylesChange", function() {
            var axesReady = this._updateAxisBase();
            if(axesReady)
            {
                this.draw();
            }
        });
        this._widthChangeHandle = this.after("widthChange", function() {
            var axesReady = this._updateAxisBase();
            if(axesReady)
            {
                this.draw();
            }
        });
        this._heightChangeHandle = this.after("heightChange", function() {
            var axesReady = this._updateAxisBase();
            if(axesReady)
            {
                this.draw();
            }
        });
        this._visibleChangeHandle = this.after("visibleChange", this._handleVisibleChange);
    },

    /**
     * Event handler for the xAxisChange event.
     *
     * @method _xAxisChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _xAxisChangeHandler: function()
    {
        var xAxis = this.get("xAxis");
        xAxis.after("dataReady", Y.bind(this._xDataChangeHandler, this));
        xAxis.after("dataUpdate", Y.bind(this._xDataChangeHandler, this));
    },

    /**
     * Event handler the yAxisChange event.
     *
     * @method _yAxisChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _yAxisChangeHandler: function()
    {
        var yAxis = this.get("yAxis");
        yAxis.after("dataReady", Y.bind(this._yDataChangeHandler, this));
        yAxis.after("dataUpdate", Y.bind(this._yDataChangeHandler, this));
    },

    /**
     * Constant used to generate unique id.
     *
     * @property GUID
     * @type String
     * @private
     */
    GUID: "yuicartesianseries",

    /**
     * Event handler for xDataChange event.
     *
     * @method _xDataChangeHandler
     * @param {Object} event Event object.
     * @private
     */
    _xDataChangeHandler: function()
    {
        var axesReady = this._updateAxisBase();
        if(axesReady)
        {
            this.draw();
        }
    },

    /**
     * Event handler for yDataChange event.
     *
     * @method _yDataChangeHandler
     * @param {Object} event Event object.
     * @private
     */
    _yDataChangeHandler: function()
    {
        var axesReady = this._updateAxisBase();
        if(axesReady)
        {
            this.draw();
        }
    },

    /**
     * Checks to ensure that both xAxis and yAxis data are available. If so, set the `xData` and `yData` attributes
     * and return `true`. Otherwise, return `false`.
     *
     * @method _updateAxisBase
     * @return Boolean
     * @private
     */
    _updateAxisBase: function()
    {
        var xAxis = this.get("xAxis"),
            yAxis = this.get("yAxis"),
            xKey = this.get("xKey"),
            yKey = this.get("yKey"),
            yData,
            xData,
            xReady,
            yReady,
            ready;
        if(!xAxis || !yAxis || !xKey || !yKey)
        {
            ready = false;
        }
        else
        {
            xData = xAxis.getDataByKey(xKey);
            yData = yAxis.getDataByKey(yKey);
            if(Y_Lang.isArray(xKey))
            {
                xReady = (xData && Y.Object.size(xData) > 0) ? this._checkForDataByKey(xData, xKey) : false;
            }
            else
            {
                xReady = xData ? true : false;
            }
            if(Y_Lang.isArray(yKey))
            {
                yReady = (yData && Y.Object.size(yData) > 0) ? this._checkForDataByKey(yData, yKey) : false;
            }
            else
            {
                yReady = yData ? true : false;
            }
            ready = xReady && yReady;
            if(ready)
            {
                this.set("xData", xData);
                this.set("yData", yData);
            }
        }
        return ready;
    },

    /**
     * Checks to see if all keys of a data object exist and contain data.
     *
     * @method _checkForDataByKey
     * @param {Object} obj The object to check
     * @param {Array} keys The keys to check
     * @return Boolean
     * @private
     */
    _checkForDataByKey: function(obj, keys)
    {
        var i,
            len = keys.length,
            hasData = false;
        for(i = 0; i < len; i = i + 1)
        {
            if(obj[keys[i]])
            {
                hasData = true;
                break;
            }
        }
        return hasData;
    },

    /**
     * Draws the series is the xAxis and yAxis data are both available.
     *
     * @method validate
     * @private
     */
    validate: function()
    {
        if((this.get("xData") && this.get("yData")) || this._updateAxisBase())
        {
            this.draw();
        }
        else
        {
            this.fire("drawingComplete");
        }
    },

    /**
     * Calculates the coordinates for the series.
     *
     * @method setAreaData
     * @protected
     */
    setAreaData: function()
    {
        var w = this.get("width"),
            h = this.get("height"),
            xAxis = this.get("xAxis"),
            yAxis = this.get("yAxis"),
            xData = this._copyData(this.get("xData")),
            yData = this._copyData(this.get("yData")),
            direction = this.get("direction"),
            dataLength = direction === "vertical" ? yData.length : xData.length,
            xOffset = xAxis.getEdgeOffset(xAxis.getTotalMajorUnits(), w),
            yOffset = yAxis.getEdgeOffset(yAxis.getTotalMajorUnits(), h),
            padding = this.get("styles").padding,
			leftPadding = padding.left,
			topPadding = padding.top,
			dataWidth = w - (leftPadding + padding.right + xOffset * 2),
			dataHeight = h - (topPadding + padding.bottom + yOffset * 2),
			xMax = xAxis.get("maximum"),
			xMin = xAxis.get("minimum"),
			yMax = yAxis.get("maximum"),
			yMin = yAxis.get("minimum"),
            graphic = this.get("graphic"),
            yAxisType = yAxis.get("type"),
            reverseYCoords = (yAxisType === "numeric" || yAxisType === "stacked"),
            xcoords,
            ycoords,
            xOriginValue = xAxis.getOrigin(),
            yOriginValue = yAxis.getOrigin();
        graphic.set("width", w);
        graphic.set("height", h);
        xOffset = xOffset + leftPadding;
        yOffset = reverseYCoords ? yOffset + dataHeight + topPadding + padding.bottom : topPadding + yOffset;
        this._leftOrigin = Math.round(xAxis._getCoordFromValue(xMin, xMax, dataWidth, xOriginValue, xOffset, false));
        this._bottomOrigin = Math.round(yAxis._getCoordFromValue(yMin, yMax, dataHeight, yOriginValue, yOffset, reverseYCoords));

        xcoords = this._getCoords(xMin, xMax, dataWidth, xData, xAxis, xOffset, false);
        ycoords = this._getCoords(yMin, yMax, dataHeight, yData, yAxis, yOffset, reverseYCoords);
        this.set("xcoords", xcoords);
		this.set("ycoords", ycoords);
        this._dataLength = dataLength;
        this._setXMarkerPlane(xcoords, dataLength);
        this._setYMarkerPlane(ycoords, dataLength);
    },

    /**
     * Returns either an array coordinates or an object key valued arrays of coordinates depending on the input.
     * If the input data is an array, an array is returned. If the input data is an object, an object will be returned.
     *
     * @method _getCoords
     * @param {Number} min The minimum value of the range of data.
     * @param {Number} max The maximum value of the range of data.
     * @param {Number} length The length, in pixels, of across which the coordinates will be calculated.
     * @param {AxisBase} axis The axis in which the data is bound.
     * @param {Number} offset The value in which to offet the first coordinate.
     * @param {Boolean} reverse Indicates whether to calculate the coordinates in reverse order.
     * @return Array|Object
     * @private
     */
    _getCoords: function(min, max, length, data, axis, offset, reverse)
    {
        var coords,
            key;
        if(Y_Lang.isArray(data))
        {
            coords = axis._getCoordsFromValues(min, max, length, data, offset, reverse);
        }
        else
        {
            coords = {};
            for(key in data)
            {
                if(data.hasOwnProperty(key))
                {
                    coords[key] = this._getCoords.apply(this, [min, max, length, data[key], axis, offset, reverse]);
                }
            }
        }
        return coords;
    },

    /**
     * Used to cache xData and yData in the setAreaData method. Returns a copy of an
     * array if an array is received as the param and returns an object literal of
     * array copies if an object literal is received as the param.
     *
     * @method _copyData
     * @param {Array|Object} val The object or array to be copied.
     * @return Array|Object
     * @private
     */
    _copyData: function(val)
    {
        var copy,
            key;
        if(Y_Lang.isArray(val))
        {
            copy = val.concat();
        }
        else
        {
            copy = {};
            for(key in val)
            {
                if(val.hasOwnProperty(key))
                {
                    copy[key] = val[key].concat();
                }
            }
        }
        return copy;
    },

    /**
     * Sets the marker plane for the series when the coords argument is an array.
     * If the coords argument is an object literal no marker plane is set.
     *
     * @method _setXMarkerPlane
     * @param {Array|Object} coords An array of x coordinates or an object literal
     * containing key value pairs mapped to an array of coordinates.
     * @param {Number} dataLength The length of data for the series.
     * @private
     */
    _setXMarkerPlane: function(coords, dataLength)
    {
        var i = 0,
            xMarkerPlane = [],
            xMarkerPlaneOffset = this.get("xMarkerPlaneOffset"),
            nextX;
        if(Y_Lang.isArray(coords))
        {
            for(i = 0; i < dataLength; i = i + 1)
            {
                nextX = coords[i];
                xMarkerPlane.push({start:nextX - xMarkerPlaneOffset, end: nextX + xMarkerPlaneOffset});
            }
            this.set("xMarkerPlane", xMarkerPlane);
        }
    },

    /**
     * Sets the marker plane for the series when the coords argument is an array.
     * If the coords argument is an object literal no marker plane is set.
     *
     * @method _setYMarkerPlane
     * @param {Array|Object} coords An array of y coordinates or an object literal
     * containing key value pairs mapped to an array of coordinates.
     * @param {Number} dataLength The length of data for the series.
     * @private
     */
    _setYMarkerPlane: function(coords, dataLength)
    {
        var i = 0,
            yMarkerPlane = [],
            yMarkerPlaneOffset = this.get("yMarkerPlaneOffset"),
            nextY;
        if(Y_Lang.isArray(coords))
        {
            for(i = 0; i < dataLength; i = i + 1)
            {
                nextY = coords[i];
                yMarkerPlane.push({start:nextY - yMarkerPlaneOffset, end: nextY + yMarkerPlaneOffset});
            }
            this.set("yMarkerPlane", yMarkerPlane);
        }
    },

    /**
     * Finds the first valid index of an array coordinates.
     *
     * @method _getFirstValidIndex
     * @param {Array} coords An array of x or y coordinates.
     * @return Number
     * @private
     */
    _getFirstValidIndex: function(coords)
    {
        var coord,
            i = -1,
            limit = coords.length;
        while(!Y_Lang.isNumber(coord) && i < limit)
        {
            i += 1;
            coord = coords[i];
        }
        return i;
    },

    /**
     * Finds the last valid index of an array coordinates.
     *
     * @method _getLastValidIndex
     * @param {Array} coords An array of x or y coordinates.
     * @return Number
     * @private
     */
    _getLastValidIndex: function(coords)
    {
        var coord,
            i = coords.length,
            limit = -1;
        while(!Y_Lang.isNumber(coord) && i > limit)
        {
            i -= 1;
            coord = coords[i];
        }
        return i;
    },

    /**
     * Draws the series.
     *
     * @method draw
     * @protected
     */
    draw: function()
    {
        var w = this.get("width"),
            h = this.get("height"),
            xcoords,
            ycoords;
        if(this.get("rendered"))
        {
            if((isFinite(w) && isFinite(h) && w > 0 && h > 0) &&
                ((this.get("xData") && this.get("yData")) ||
                this._updateAxisBase()))
            {
                if(this._drawing)
                {
                    this._callLater = true;
                    return;
                }
                this._drawing = true;
                this._callLater = false;
                this.setAreaData();
                xcoords = this.get("xcoords");
                ycoords = this.get("ycoords");
                if(xcoords && ycoords && xcoords.length > 0)
                {
                    this.drawSeries();
                }
                this._drawing = false;
                if(this._callLater)
                {
                    this.draw();
                }
                else
                {
                    this._toggleVisible(this.get("visible"));
                    this.fire("drawingComplete");
                }
            }
        }
    },

    /**
     * Default value for plane offsets when the parent chart's `interactiveType` is `planar`.
     *
     * @property _defaultPlaneOffset
     * @type Number
     * @private
     */
    _defaultPlaneOffset: 4,

    /**
     * Destructor implementation for the CartesianSeries class.
     * Calls destroy on all Graphic instances.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        if(this.get("rendered"))
        {
            if(this._xDataReadyHandle)
            {
                this._xDataReadyHandle.detach();
            }
            if(this._xDataUpdateHandle)
            {
                this._xDataUpdateHandle.detach();
            }
            if(this._yDataReadyHandle)
            {
                this._yDataReadyHandle.detach();
            }
            if(this._yDataUpdateHandle)
            {
                this._yDataUpdateHandle.detach();
            }
            if(this._xAxisChangeHandle)
            {
                this._xAxisChangeHandle.detach();
            }
            if(this._yAxisChangeHandle)
            {
                this._yAxisChangeHandle.detach();
            }
        }
    }
        /**
         * Event handle for the x-axis' dataReady event.
         *
         * @property _xDataReadyHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the x-axis dataUpdate event.
         *
         * @property _xDataUpdateHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the y-axis dataReady event.
         *
         * @property _yDataReadyHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the y-axis dataUpdate event.
         * @property _yDataUpdateHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the xAxisChange event.
         * @property _xAxisChangeHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the yAxisChange event.
         * @property _yAxisChangeHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the stylesChange event.
         * @property _stylesChangeHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the widthChange event.
         * @property _widthChangeHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the heightChange event.
         * @property _heightChangeHandle
         * @type {EventHandle}
         * @private
         */

        /**
         * Event handle for the visibleChange event.
         * @property _visibleChangeHandle
         * @type {EventHandle}
         * @private
         */
}, {
    ATTRS: {
        /**
         * An array of all series of the same type used within a chart application.
         *
         * @attribute seriesTypeCollection
         * @type Array
         */
        seriesTypeCollection: {},

        /**
         * Name used for for displaying data related to the x-coordinate.
         *
         * @attribute xDisplayName
         * @type String
         */
        xDisplayName: {
            getter: function()
            {
                return this._xDisplayName || this.get("xKey");
            },

            setter: function(val)
            {
                this._xDisplayName = val.toString();
                return val;
            }
        },

        /**
         * Name used for for displaying data related to the y-coordinate.
         *
         * @attribute yDisplayName
         * @type String
         */
        yDisplayName: {
            getter: function()
            {
                return this._yDisplayName || this.get("yKey");
            },

            setter: function(val)
            {
                this._yDisplayName = val.toString();
                return val;
            }
        },

        /**
         * Name used for for displaying category data
         *
         * @attribute categoryDisplayName
         * @type String
         * @readOnly
         */
        categoryDisplayName: {
            lazyAdd: false,

            getter: function()
            {
                return this.get("direction") === "vertical" ? this.get("yDisplayName") : this.get("xDisplayName");
            },

            setter: function(val)
            {
                if(this.get("direction") === "vertical")
                {
                    this._yDisplayName = val;
                }
                else
                {
                    this._xDisplayName = val;
                }
                return val;
            }
        },

        /**
         * Name used for for displaying value data
         *
         * @attribute valueDisplayName
         * @type String
         * @readOnly
         */
        valueDisplayName: {
            lazyAdd: false,

            getter: function()
            {
                return this.get("direction") === "vertical" ? this.get("xDisplayName") : this.get("yDisplayName");
            },

            setter: function(val)
            {
                if(this.get("direction") === "vertical")
                {
                    this._xDisplayName = val;
                }
                else
                {
                    this._yDisplayName = val;
                }
                return val;
            }
        },

        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default cartesian
         */
        type: {
            value: "cartesian"
        },

        /**
         * Order of this instance of this `type`.
         *
         * @attribute order
         * @type Number
         */
        order: {},

        /**
         * Order of the instance
         *
         * @attribute graphOrder
         * @type Number
         */
        graphOrder: {},

        /**
         * x coordinates for the series.
         *
         * @attribute xcoords
         * @type Array
         */
        xcoords: {},

        /**
         * y coordinates for the series
         *
         * @attribute ycoords
         * @type Array
         */
        ycoords: {},

        /**
         * Reference to the `Axis` instance used for assigning
         * x-values to the graph.
         *
         * @attribute xAxis
         * @type Axis
         */
        xAxis: {},

        /**
         * Reference to the `Axis` instance used for assigning
         * y-values to the graph.
         *
         * @attribute yAxis
         * @type Axis
         */
        yAxis: {},

        /**
         * Indicates which array to from the hash of value arrays in
         * the x-axis `Axis` instance.
         *
         * @attribute xKey
         * @type String
         */
        xKey: {
            setter: function(val)
            {
                if(Y_Lang.isArray(val))
                {
                    return val;
                }
                else
                {
                    return val.toString();
                }
            }
        },

        /**
         * Indicates which array to from the hash of value arrays in
         * the y-axis `Axis` instance.
         *
         * @attribute yKey
         * @type String
         */
        yKey: {
            setter: function(val)
            {
                if(Y_Lang.isArray(val))
                {
                    return val;
                }
                else
                {
                    return val.toString();
                }
            }
        },

        /**
         * Array of x values for the series.
         *
         * @attribute xData
         * @type Array
         */
        xData: {},

        /**
         * Array of y values for the series.
         *
         * @attribute yData
         * @type Array
         */
        yData: {},

        /**
         * Collection of area maps along the xAxis. Used to determine mouseover for multiple
         * series.
         *
         * @attribute xMarkerPlane
         * @type Array
         */
        xMarkerPlane: {},

        /**
         * Collection of area maps along the yAxis. Used to determine mouseover for multiple
         * series.
         *
         * @attribute yMarkerPlane
         * @type Array
         */
        yMarkerPlane: {},

        /**
         * Distance from a data coordinate to the left/right for setting a hotspot.
         *
         * @attribute xMarkerPlaneOffset
         * @type Number
         */
        xMarkerPlaneOffset: {
            getter: function() {
                var marker = this.get("styles").marker;
                if(marker && marker.width && isFinite(marker.width))
                {
                    return marker.width * 0.5;
                }
                return this._defaultPlaneOffset;
            }
        },

        /**
         * Distance from a data coordinate to the top/bottom for setting a hotspot.
         *
         * @attribute yMarkerPlaneOffset
         * @type Number
         */
        yMarkerPlaneOffset: {
            getter: function() {
                var marker = this.get("styles").marker;
                if(marker && marker.height && isFinite(marker.height))
                {
                    return marker.height * 0.5;
                }
                return this._defaultPlaneOffset;
            }
        },

        /**
         * Direction of the series
         *
         * @attribute direction
         * @type String
         */
        direction: {
            value: "horizontal"
        }
    }
});


}, '3.16.0', {"requires": ["series-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-line-util', function (Y, NAME) {

/**
 * Provides functionality for drawing lines in a series.
 *
 * @module charts
 * @submodule series-line-util
 */
/**
 * Utility class used for drawing lines.
 *
 * @class Lines
 * @constructor
 * @submodule series-line-util
 */
var Y_Lang = Y.Lang;
function Lines(){}

Lines.prototype = {
    /**
     * @property _lineDefaults
     * @type Object
     * @private
     */
    _lineDefaults: null,

    /**
     * Creates a graphic in which to draw a series.
     *
     * @method _getGraphic
     * @return Graphic
     * @private
     */
    _getGraphic: function()
    {
        var graphic = this.get("graphic") || this.get("graph").get("graphic");
        if(!this._lineGraphic)
        {
            this._lineGraphic = graphic.addShape({type: "path"});
        }
        this._lineGraphic.clear();
        return this._lineGraphic;
    },

    /**
     * Toggles visibility
     *
     * @method _toggleVisible
     * @param {Boolean} visible indicates visibilitye
     * @private
     */
    _toggleVisible: function(visible)
    {
        if(this._lineGraphic)
        {
            this._lineGraphic.set("visible", visible);
        }
    },

    /**
     * Draws lines for the series.
     *
     * @method drawLines
     * @protected
     */
    drawLines: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var isNumber = Y_Lang.isNumber,
            xcoords,
            ycoords,
            direction = this.get("direction"),
            len,
            lastPointValid,
            pointValid,
            noPointsRendered = true,
            lastValidX,
            lastValidY,
            nextX,
            nextY,
            i,
            styles = this.get("styles").line,
            lineType = styles.lineType,
            lc = styles.color || this._getDefaultColor(this.get("graphOrder"), "line"),
            lineAlpha = styles.alpha,
            dashLength = styles.dashLength,
            gapSpace = styles.gapSpace,
            connectDiscontinuousPoints = styles.connectDiscontinuousPoints,
            discontinuousType = styles.discontinuousType,
            discontinuousDashLength = styles.discontinuousDashLength,
            discontinuousGapSpace = styles.discontinuousGapSpace,
            path = this._getGraphic();
        if(this._stacked)
        {
            xcoords = this.get("stackedXCoords");
            ycoords = this.get("stackedYCoords");
        }
        else
        {
            xcoords = this.get("xcoords");
            ycoords = this.get("ycoords");
        }
        len = direction === "vertical" ? ycoords.length : xcoords.length;
        path.set("stroke", {
            weight: styles.weight,
            color: lc,
            opacity: lineAlpha
        });
        for(i = 0; i < len; i = ++i)
        {
            nextX = xcoords[i];
            nextY = ycoords[i];
            pointValid = isNumber(nextX) && isNumber(nextY);
            if(!pointValid)
            {
                lastPointValid = pointValid;
                continue;
            }
            if(noPointsRendered)
            {
                noPointsRendered = false;
                path.moveTo(nextX, nextY);
            }
            else if(lastPointValid)
            {
                if(lineType !== "dashed")
                {
                    path.lineTo(nextX, nextY);
                }
                else
                {
                    this.drawDashedLine(path, lastValidX, lastValidY, nextX, nextY,
                                                dashLength,
                                                gapSpace);
                }
            }
            else if(!connectDiscontinuousPoints)
            {
                path.moveTo(nextX, nextY);
            }
            else
            {
                if(discontinuousType !== "solid")
                {
                    this.drawDashedLine(path, lastValidX, lastValidY, nextX, nextY,
                                                discontinuousDashLength,
                                                discontinuousGapSpace);
                }
                else
                {
                    path.lineTo(nextX, nextY);
                }
            }
            lastValidX = nextX;
            lastValidY = nextY;
            lastPointValid = true;
        }
        path.end();
    },

    /**
     * Connects data points with a consistent curve for a series.
     *
     * @method drawSpline
     * @protected
     */
    drawSpline: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            curvecoords = this.getCurveControlPoints(xcoords, ycoords),
            len = curvecoords.length,
            cx1,
            cx2,
            cy1,
            cy2,
            x,
            y,
            i = 0,
            styles = this.get("styles").line,
            path = this._getGraphic(),
            lineAlpha = styles.alpha,
            color = styles.color || this._getDefaultColor(this.get("graphOrder"), "line");
        path.set("stroke", {
            weight: styles.weight,
            color: color,
            opacity: lineAlpha
        });
        path.moveTo(xcoords[0], ycoords[0]);
        for(; i < len; i = ++i)
        {
            x = curvecoords[i].endx;
            y = curvecoords[i].endy;
            cx1 = curvecoords[i].ctrlx1;
            cx2 = curvecoords[i].ctrlx2;
            cy1 = curvecoords[i].ctrly1;
            cy2 = curvecoords[i].ctrly2;
            path.curveTo(cx1, cy1, cx2, cy2, x, y);
        }
        path.end();
    },

    /**
     * Draws a dashed line between two points.
     *
     * @method drawDashedLine
     * @param {Number} xStart	The x position of the start of the line
     * @param {Number} yStart	The y position of the start of the line
     * @param {Number} xEnd		The x position of the end of the line
     * @param {Number} yEnd		The y position of the end of the line
     * @param {Number} dashSize	the size of dashes, in pixels
     * @param {Number} gapSize	the size of gaps between dashes, in pixels
     * @private
     */
    drawDashedLine: function(path, xStart, yStart, xEnd, yEnd, dashSize, gapSize)
    {
        dashSize = dashSize || 10;
        gapSize = gapSize || 10;
        var segmentLength = dashSize + gapSize,
            xDelta = xEnd - xStart,
            yDelta = yEnd - yStart,
            delta = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2)),
            segmentCount = Math.floor(Math.abs(delta / segmentLength)),
            radians = Math.atan2(yDelta, xDelta),
            xCurrent = xStart,
            yCurrent = yStart,
            i;
        xDelta = Math.cos(radians) * segmentLength;
        yDelta = Math.sin(radians) * segmentLength;

        for(i = 0; i < segmentCount; ++i)
        {
            path.moveTo(xCurrent, yCurrent);
            path.lineTo(xCurrent + Math.cos(radians) * dashSize, yCurrent + Math.sin(radians) * dashSize);
            xCurrent += xDelta;
            yCurrent += yDelta;
        }

        path.moveTo(xCurrent, yCurrent);
        delta = Math.sqrt((xEnd - xCurrent) * (xEnd - xCurrent) + (yEnd - yCurrent) * (yEnd - yCurrent));

        if(delta > dashSize)
        {
            path.lineTo(xCurrent + Math.cos(radians) * dashSize, yCurrent + Math.sin(radians) * dashSize);
        }
        else if(delta > 0)
        {
            path.lineTo(xCurrent + Math.cos(radians) * delta, yCurrent + Math.sin(radians) * delta);
        }

        path.moveTo(xEnd, yEnd);
    },

    /**
     * Default values for `styles` attribute.
     *
     * @method _getLineDefaults
     * @return Object
     * @protected
     */
    _getLineDefaults: function()
    {
        return {
            alpha: 1,
            weight: 6,
            lineType:"solid",
            dashLength:10,
            gapSpace:10,
            connectDiscontinuousPoints:true,
            discontinuousType:"solid",
            discontinuousDashLength:10,
            discontinuousGapSpace:10
        };
    }
};
Y.augment(Lines, Y.Attribute);
Y.Lines = Lines;


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-line', function (Y, NAME) {

/**
 * Provides functionality for creating a line series.
 *
 * @module charts
 * @submodule series-line
 */
/**
 * The LineSeries class renders quantitative data on a graph by connecting relevant data points.
 *
 * @class LineSeries
 * @extends CartesianSeries
 * @uses Lines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-line
 */
Y.LineSeries = Y.Base.create("lineSeries", Y.CartesianSeries, [Y.Lines], {
    /**
     * @protected
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        this.drawLines();
    },

    /**
     * @protected
     *
     * Method used by `styles` setter. Overrides base implementation.
     *
     * @method _setStyles
     * @param {Object} newStyles Hash of properties to update.
     * @return Object
     */
    _setStyles: function(val)
    {
        if(!val.line)
        {
            val = {line:val};
        }
        return Y.LineSeries.superclass._setStyles.apply(this, [val]);
    },

    /**
     * @protected
     *
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     */
    _getDefaultStyles: function()
    {
        var styles = this._mergeStyles({line:this._getLineDefaults()}, Y.LineSeries.superclass._getDefaultStyles());
        return styles;
    }
},
{
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default line
         */
        type: {
            value:"line"
        }

        /**
         * Style properties used for drawing lines. This attribute is inherited from `Renderer`. Below are the
         * default values:
         *  <dl>
         *      <dt>color</dt><dd>The color of the line. The default value is determined by the order of the series
         *      on the graph. The color will be retrieved from the following array:
         *      `["#426ab3", "#d09b2c", "#000000", "#b82837", "#b384b5", "#ff7200", "#779de3", "#cbc8ba", "#7ed7a6", "#007a6c"]`
         *      <dt>weight</dt><dd>Number that indicates the width of the line. The default value is 6.</dd>
         *      <dt>alpha</dt><dd>Number between 0 and 1 that indicates the opacity of the line. The default value is 1.</dd>
         *      <dt>lineType</dt><dd>Indicates whether the line is solid or dashed. The default value is solid.</dd>
         *      <dt>dashLength</dt><dd>When the `lineType` is dashed, indicates the length of the dash. The default
         *      value is 10.</dd>
         *      <dt>gapSpace</dt><dd>When the `lineType` is dashed, indicates the distance between dashes. The default
         *      value is 10.</dd>
         *      <dt>connectDiscontinuousPoints</dt><dd>Indicates whether or not to connect lines when there is a missing
         *      or null value between points. The default value is true.</dd>
         *      <dt>discontinuousType</dt><dd>Indicates whether the line between discontinuous points is solid or dashed.
         *      The default value is solid.</dd>
         *      <dt>discontinuousDashLength</dt><dd>When the `discontinuousType` is dashed, indicates the length of the
         *      dash. The default value is 10.</dd>
         *      <dt>discontinuousGapSpace</dt><dd>When the `discontinuousType` is dashed, indicates the distance between
         *      dashes. The default value is 10.</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});








}, '3.16.0', {"requires": ["series-cartesian", "series-line-util"]});
