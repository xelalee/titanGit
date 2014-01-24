/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-base', function (Y, NAME) {

/**
 * Provides the base Widget class, with HTML Parser support
 *
 * @module widget
 * @main widget
 */

/**
 * Provides the base Widget class
 *
 * @module widget
 * @submodule widget-base
 */
var L = Y.Lang,
    Node = Y.Node,

    ClassNameManager = Y.ClassNameManager,

    _getClassName = ClassNameManager.getClassName,
    _getWidgetClassName,

    _toInitialCap = Y.cached(function(str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }),

    // K-Weight, IE GC optimizations
    CONTENT = "content",
    VISIBLE = "visible",
    HIDDEN = "hidden",
    DISABLED = "disabled",
    FOCUSED = "focused",
    WIDTH = "width",
    HEIGHT = "height",
    BOUNDING_BOX = "boundingBox",
    CONTENT_BOX = "contentBox",
    PARENT_NODE = "parentNode",
    OWNER_DOCUMENT = "ownerDocument",
    AUTO = "auto",
    SRC_NODE = "srcNode",
    BODY = "body",
    TAB_INDEX = "tabIndex",
    ID = "id",
    RENDER = "render",
    RENDERED = "rendered",
    DESTROYED = "destroyed",
    STRINGS = "strings",
    DIV = "<div></div>",
    CHANGE = "Change",
    LOADING = "loading",

    _UISET = "_uiSet",

    EMPTY_STR = "",
    EMPTY_FN = function() {},

    TRUE = true,
    FALSE = false,

    UI,
    ATTRS = {},
    UI_ATTRS = [VISIBLE, DISABLED, HEIGHT, WIDTH, FOCUSED, TAB_INDEX],

    WEBKIT = Y.UA.webkit,

    // Widget nodeid-to-instance map.
    _instances = {};

/**
 * A base class for widgets, providing:
 * <ul>
 *    <li>The render lifecycle method, in addition to the init and destroy 
 *        lifecycle methods provide by Base</li>
 *    <li>Abstract methods to support consistent MVC structure across 
 *        widgets: renderer, renderUI, bindUI, syncUI</li>
 *    <li>Support for common widget attributes, such as boundingBox, contentBox, visible, 
 *        disabled, focused, strings</li>
 * </ul>
 *
 * @param config {Object} Object literal specifying widget configuration properties.
 *
 * @class Widget
 * @constructor
 * @extends Base
 */
function Widget(config) {

    // kweight
    var widget = this,
        parentNode,
        render, 
        constructor = widget.constructor; 

    widget._strs = {};
    widget._cssPrefix = constructor.CSS_PREFIX || _getClassName(constructor.NAME.toLowerCase());

    // We need a config for HTML_PARSER to work.
    config = config || {};

    Widget.superclass.constructor.call(widget, config);

    render = widget.get(RENDER);

    if (render) {
        // Render could be a node or boolean
        if (render !== TRUE) {
            parentNode = render;
        }
        widget.render(parentNode);
    }
}

/**
 * Static property provides a string to identify the class.
 * <p>
 * Currently used to apply class identifiers to the bounding box 
 * and to classify events fired by the widget.
 * </p>
 *
 * @property NAME
 * @type String
 * @static
 */
Widget.NAME = "widget";

/**
 * Constant used to identify state changes originating from
 * the DOM (as opposed to the JavaScript model).
 *
 * @property UI_SRC
 * @type String
 * @static
 * @final
 */
UI = Widget.UI_SRC = "ui";

/**
 * Static property used to define the default attribute 
 * configuration for the Widget.
 * 
 * @property ATTRS
 * @type Object
 * @static
 */
Widget.ATTRS = ATTRS;

// Trying to optimize kweight by setting up attrs this way saves about 0.4K min'd

/**
 * @attribute id
 * @writeOnce
 * @default Generated using guid()
 * @type String
 */

ATTRS[ID] = {
    valueFn: "_guid",
    writeOnce: TRUE
};

/**
 * Flag indicating whether or not this Widget
 * has been through the render lifecycle phase.
 *
 * @attribute rendered
 * @readOnly
 * @default false
 * @type boolean
 */
ATTRS[RENDERED] = {
    value:FALSE,
    readOnly: TRUE
};

/**
 * @attribute boundingBox
 * @description The outermost DOM node for the Widget, used for sizing and positioning 
 * of a Widget as well as a containing element for any decorator elements used 
 * for skinning.
 * @type String | Node
 * @writeOnce
 */
ATTRS[BOUNDING_BOX] = {
    value:null,
    setter: "_setBB",
    writeOnce: TRUE
};

/**
 * @attribute contentBox
 * @description A DOM node that is a direct descendant of a Widget's bounding box that 
 * houses its content.
 * @type String | Node
 * @writeOnce
 */
ATTRS[CONTENT_BOX] = {
    valueFn:"_defaultCB",
    setter: "_setCB",
    writeOnce: TRUE
};

/**
 * @attribute tabIndex
 * @description Number (between -32767 to 32767) indicating the widget's 
 * position in the default tab flow.  The value is used to set the 
 * "tabIndex" attribute on the widget's bounding box.  Negative values allow
 * the widget to receive DOM focus programmatically (by calling the focus
 * method), while being removed from the default tab flow.  A value of 
 * null removes the "tabIndex" attribute from the widget's bounding box.
 * @type Number
 * @default null
 */
ATTRS[TAB_INDEX] = {
    value: null,
    validator: "_validTabIndex"
};

/**
 * @attribute focused
 * @description Boolean indicating if the Widget, or one of its descendants, 
 * has focus.
 * @readOnly
 * @default false
 * @type boolean
 */
ATTRS[FOCUSED] = {
    value: FALSE,
    readOnly:TRUE
};

/**
 * @attribute disabled
 * @description Boolean indicating if the Widget should be disabled. The disabled implementation
 * is left to the specific classes extending widget.
 * @default false
 * @type boolean
 */
ATTRS[DISABLED] = {
    value: FALSE
};

/**
 * @attribute visible
 * @description Boolean indicating whether or not the Widget is visible.
 * @default TRUE
 * @type boolean
 */
ATTRS[VISIBLE] = {
    value: TRUE
};

/**
 * @attribute height
 * @description String with units, or number, representing the height of the Widget. If a number is provided,
 * the default unit, defined by the Widgets DEF_UNIT, property is used.
 * @default EMPTY_STR
 * @type {String | Number}
 */
ATTRS[HEIGHT] = {
    value: EMPTY_STR
};

/**
 * @attribute width
 * @description String with units, or number, representing the width of the Widget. If a number is provided,
 * the default unit, defined by the Widgets DEF_UNIT, property is used.
 * @default EMPTY_STR
 * @type {String | Number}
 */
ATTRS[WIDTH] = {
    value: EMPTY_STR
};

/**
 * @attribute strings
 * @description Collection of strings used to label elements of the Widget's UI.
 * @default null
 * @type Object
 */
ATTRS[STRINGS] = {
    value: {},
    setter: "_strSetter",
    getter: "_strGetter"
};

/**
 * Whether or not to render the widget automatically after init, and optionally, to which parent node.
 *
 * @attribute render
 * @type boolean | Node
 * @writeOnce
 */
ATTRS[RENDER] = {
    value:FALSE,
    writeOnce:TRUE
};

/**
 * The css prefix which the static Widget.getClassName method should use when constructing class names
 *
 * @property CSS_PREFIX
 * @type String
 * @default Widget.NAME.toLowerCase()
 * @private
 * @static
 */
Widget.CSS_PREFIX = _getClassName(Widget.NAME.toLowerCase());

/**
 * Generate a standard prefixed classname for the Widget, prefixed by the default prefix defined
 * by the <code>Y.config.classNamePrefix</code> attribute used by <code>ClassNameManager</code> and 
 * <code>Widget.NAME.toLowerCase()</code> (e.g. "yui-widget-xxxxx-yyyyy", based on default values for 
 * the prefix and widget class name).
 * <p>
 * The instance based version of this method can be used to generate standard prefixed classnames,
 * based on the instances NAME, as opposed to Widget.NAME. This method should be used when you
 * need to use a constant class name across different types instances.
 * </p>
 * @method getClassName
 * @param {String*} args* 0..n strings which should be concatenated, using the default separator defined by ClassNameManager, to create the class name
 */
Widget.getClassName = function() {
    // arguments needs to be array'fied to concat
    return _getClassName.apply(ClassNameManager, [Widget.CSS_PREFIX].concat(Y.Array(arguments), true));
};

_getWidgetClassName = Widget.getClassName;

/**
 * Returns the widget instance whose bounding box contains, or is, the given node. 
 * <p>
 * In the case of nested widgets, the nearest bounding box ancestor is used to
 * return the widget instance.
 * </p>
 * @method getByNode
 * @static
 * @param node {Node | String} The node for which to return a Widget instance. If a selector
 * string is passed in, which selects more than one node, the first node found is used.
 * @return {Widget} Widget instance, or null if not found.
 */
Widget.getByNode = function(node) {
    var widget,
        widgetMarker = _getWidgetClassName();

    node = Node.one(node);
    if (node) {
        node = node.ancestor("." + widgetMarker, true);
        if (node) {
            widget = _instances[Y.stamp(node, true)];
        }
    }

    return widget || null;
};

Y.extend(Widget, Y.Base, {

    /**
     * Returns a class name prefixed with the the value of the 
     * <code>YUI.config.classNamePrefix</code> attribute + the instances <code>NAME</code> property.
     * Uses <code>YUI.config.classNameDelimiter</code> attribute to delimit the provided strings.
     * e.g. 
     * <code>
     * <pre>
     *    // returns "yui-slider-foo-bar", for a slider instance
     *    var scn = slider.getClassName('foo','bar');
     *
     *    // returns "yui-overlay-foo-bar", for an overlay instance
     *    var ocn = overlay.getClassName('foo','bar');
     * </pre>
     * </code>
     *
     * @method getClassName
     * @param {String}+ One or more classname bits to be joined and prefixed
     */
    getClassName: function () {
        return _getClassName.apply(ClassNameManager, [this._cssPrefix].concat(Y.Array(arguments), true));
    },

    /**
     * Initializer lifecycle implementation for the Widget class. Registers the 
     * widget instance, and runs through the Widget's HTML_PARSER definition. 
     *
     * @method initializer
     * @protected
     * @param  config {Object} Configuration object literal for the widget
     */
    initializer: function(config) {

        var bb = this.get(BOUNDING_BOX);

        if (bb instanceof Node) {
            this._mapInstance(Y.stamp(bb));
        }

        /**
         * Notification event, which widget implementations can fire, when
         * they change the content of the widget. This event has no default
         * behavior and cannot be prevented, so the "on" or "after"
         * moments are effectively equivalent (with on listeners being invoked before 
         * after listeners).
         *
         * @event widget:contentUpdate
         * @preventable false
         * @param {EventFacade} e The Event Facade
         */

        if (this._applyParser) {
            this._applyParser(config);
        }
    },

    /**
     * Utility method used to add an entry to the boundingBox id to instance map. 
     *
     * This method can be used to populate the instance with lazily created boundingBox Node references. 
     *
     * @method _mapInstance
     * @param {String} The boundingBox id
     * @protected
     */
    _mapInstance : function(id) {
        _instances[id] = this;
    },

    /**
     * Destructor lifecycle implementation for the Widget class. Purges events attached
     * to the bounding box and content box, removes them from the DOM and removes 
     * the Widget from the list of registered widgets.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {

        var boundingBox = this.get(BOUNDING_BOX),
            bbGuid;

        if (boundingBox instanceof Node) {
            bbGuid = Y.stamp(boundingBox,true);

            if (bbGuid in _instances) {
                delete _instances[bbGuid];
            }

            this._destroyBox();
        }
    },

    /**
     * <p>
     * Destroy lifecycle method. Fires the destroy
     * event, prior to invoking destructors for the
     * class hierarchy.
     *
     * Overrides Base's implementation, to support arguments to destroy
     * </p>
     * <p>
     * Subscribers to the destroy
     * event can invoke preventDefault on the event object, to prevent destruction
     * from proceeding.
     * </p>
     * @method destroy
     * @param destroyAllNodes {Boolean} If true, all nodes contained within the Widget are removed and destroyed. Defaults to false due to potentially high run-time cost. 
     * @return {Widget} A reference to this object
     * @chainable
     */
    destroy: function(destroyAllNodes) {
        this._destroyAllNodes = destroyAllNodes;
        return Widget.superclass.destroy.apply(this);
    },

    /**
     * Removes and destroys the widgets rendered boundingBox, contentBox,
     * and detaches bound UI events.
     *
     * @method _destroyBox
     * @protected 
     */
    _destroyBox : function() {

        var boundingBox = this.get(BOUNDING_BOX),
            contentBox = this.get(CONTENT_BOX),
            deep = this._destroyAllNodes,
            same;

        same = boundingBox && boundingBox.compareTo(contentBox);

        if (this.UI_EVENTS) {
            this._destroyUIEvents();
        }

        this._unbindUI(boundingBox);

        if (deep) {
            // Removes and destroys all child nodes.
            boundingBox.empty();
            boundingBox.remove(TRUE);
        } else {
            if (contentBox) {
                contentBox.remove(TRUE);
            }
            if (!same) {
                boundingBox.remove(TRUE);
            }
        }
    },

    /**
     * Establishes the initial DOM for the widget. Invoking this
     * method will lead to the creating of all DOM elements for
     * the widget (or the manipulation of existing DOM elements 
     * for the progressive enhancement use case).
     * <p>
     * This method should only be invoked once for an initialized
     * widget.
     * </p>
     * <p>
     * It delegates to the widget specific renderer method to do
     * the actual work.
     * </p>
     *
     * @method render
     * @chainable
     * @final 
     * @param  parentNode {Object | String} Optional. The Node under which the 
     * Widget is to be rendered. This can be a Node instance or a CSS selector string. 
     * <p>
     * If the selector string returns more than one Node, the first node will be used 
     * as the parentNode. NOTE: This argument is required if both the boundingBox and contentBox
     * are not currently in the document. If it's not provided, the Widget will be rendered
     * to the body of the current document in this case.
     * </p>
     */
    render: function(parentNode) {

        if (!this.get(DESTROYED) && !this.get(RENDERED)) {
             /**
              * Lifecycle event for the render phase, fired prior to rendering the UI 
              * for the widget (prior to invoking the widget's renderer method).
              * <p>
              * Subscribers to the "on" moment of this event, will be notified 
              * before the widget is rendered.
              * </p>
              * <p>
              * Subscribers to the "after" moment of this event, will be notified
              * after rendering is complete.
              * </p>
              *
              * @event widget:render
              * @preventable _defRenderFn
              * @param {EventFacade} e The Event Facade
              */
            this.publish(RENDER, {
                queuable:FALSE,
                fireOnce:TRUE,
                defaultTargetOnly:TRUE,
                defaultFn: this._defRenderFn
            });

            this.fire(RENDER, {parentNode: (parentNode) ? Node.one(parentNode) : null});
        }
        return this;
    },

    /**
     * Default render handler
     *
     * @method _defRenderFn
     * @protected
     * @param {EventFacade} e The Event object
     * @param {Node} parentNode The parent node to render to, if passed in to the <code>render</code> method
     */
    _defRenderFn : function(e) {
        this._parentNode = e.parentNode;
         
        this.renderer();
        this._set(RENDERED, TRUE);

        this._removeLoadingClassNames();
    },

    /**
     * Creates DOM (or manipulates DOM for progressive enhancement)
     * This method is invoked by render() and is not chained 
     * automatically for the class hierarchy (unlike initializer, destructor) 
     * so it should be chained manually for subclasses if required.
     *
     * @method renderer
     * @protected
     */
    renderer: function() {
        // kweight
        var widget = this;

        widget._renderUI();
        widget.renderUI();

        widget._bindUI();
        widget.bindUI();

        widget._syncUI();
        widget.syncUI();
    },

    /**
     * Configures/Sets up listeners to bind Widget State to UI/DOM
     * 
     * This method is not called by framework and is not chained 
     * automatically for the class hierarchy.
     * 
     * @method bindUI
     * @protected
     */
    bindUI: EMPTY_FN,

    /**
     * Adds nodes to the DOM 
     * 
     * This method is not called by framework and is not chained 
     * automatically for the class hierarchy.
     * 
     * @method renderUI
     * @protected
     */
    renderUI: EMPTY_FN,

    /**
     * Refreshes the rendered UI, based on Widget State
     * 
     * This method is not called by framework and is not chained
     * automatically for the class hierarchy.
     *
     * @method syncUI
     * @protected
     *
     */
    syncUI: EMPTY_FN,

    /**
     * @method hide
     * @description Hides the Widget by setting the "visible" attribute to "false".
     * @chainable
     */
    hide: function() {
        return this.set(VISIBLE, FALSE);
    },

    /**
     * @method show
     * @description Shows the Widget by setting the "visible" attribute to "true".
     * @chainable
     */
    show: function() {
        return this.set(VISIBLE, TRUE);
    },

    /**
     * @method focus
     * @description Causes the Widget to receive the focus by setting the "focused" 
     * attribute to "true".
     * @chainable
     */
    focus: function () {
        return this._set(FOCUSED, TRUE);
    },

    /**
     * @method blur
     * @description Causes the Widget to lose focus by setting the "focused" attribute 
     * to "false"
     * @chainable
     */
    blur: function () {
        return this._set(FOCUSED, FALSE);
    },

    /**
     * @method enable
     * @description Set the Widget's "disabled" attribute to "false".
     * @chainable
     */
    enable: function() {
        return this.set(DISABLED, FALSE);
    },

    /**
     * @method disable
     * @description Set the Widget's "disabled" attribute to "true".
     * @chainable
     */
    disable: function() {
        return this.set(DISABLED, TRUE);
    },

    /**
     * @method _uiSizeCB
     * @protected
     * @param {boolean} expand
     */
    _uiSizeCB : function(expand) {
        this.get(CONTENT_BOX).toggleClass(_getWidgetClassName(CONTENT, "expanded"), expand);        
    },

    /**
     * Helper method to collect the boundingBox and contentBox and append to the provided parentNode, if not
     * already a child. The owner document of the boundingBox, or the owner document of the contentBox will be used 
     * as the document into which the Widget is rendered if a parentNode is node is not provided. If both the boundingBox and
     * the contentBox are not currently in the document, and no parentNode is provided, the widget will be rendered 
     * to the current document's body.
     *
     * @method _renderBox
     * @private
     * @param {Node} parentNode The parentNode to render the widget to. If not provided, and both the boundingBox and
     * the contentBox are not currently in the document, the widget will be rendered to the current document's body.
     */
    _renderBox: function(parentNode) {

        // TODO: Performance Optimization [ More effective algo to reduce Node refs, compares, replaces? ]

        var widget = this, // kweight
            contentBox = widget.get(CONTENT_BOX),
            boundingBox = widget.get(BOUNDING_BOX),
            srcNode = widget.get(SRC_NODE),
            defParentNode = widget.DEF_PARENT_NODE,

            doc = (srcNode && srcNode.get(OWNER_DOCUMENT)) || boundingBox.get(OWNER_DOCUMENT) || contentBox.get(OWNER_DOCUMENT);

        // If srcNode (assume it's always in doc), have contentBox take its place (widget render responsible for re-use of srcNode contents)
        if (srcNode && !srcNode.compareTo(contentBox) && !contentBox.inDoc(doc)) {
            srcNode.replace(contentBox);
        }

        if (!boundingBox.compareTo(contentBox.get(PARENT_NODE)) && !boundingBox.compareTo(contentBox)) {
            // If contentBox box is already in the document, have boundingBox box take it's place
            if (contentBox.inDoc(doc)) {
                contentBox.replace(boundingBox);
            }
            boundingBox.appendChild(contentBox);
        }

        parentNode = parentNode || (defParentNode && Node.one(defParentNode));

        if (parentNode) {
            parentNode.appendChild(boundingBox);
        } else if (!boundingBox.inDoc(doc)) {
            Node.one(BODY).insert(boundingBox, 0);
        }
    },

    /**
     * Setter for the boundingBox attribute
     *
     * @method _setBB
     * @private
     * @param Node/String
     * @return Node
     */
    _setBB: function(node) {
        return this._setBox(this.get(ID), node, this.BOUNDING_TEMPLATE, true);
    },

    /**
     * Setter for the contentBox attribute
     *
     * @method _setCB
     * @private
     * @param {Node|String} node
     * @return Node
     */
    _setCB: function(node) {
        return (this.CONTENT_TEMPLATE === null) ? this.get(BOUNDING_BOX) : this._setBox(null, node, this.CONTENT_TEMPLATE, false);
    },

    /**
     * Returns the default value for the contentBox attribute. 
     *
     * For the Widget class, this will be the srcNode if provided, otherwise null (resulting in
     * a new contentBox node instance being created)
     *
     * @method _defaultCB
     * @protected
     */
    _defaultCB : function(node) {
        return this.get(SRC_NODE) || null;
    },

    /**
     * Helper method to set the bounding/content box, or create it from
     * the provided template if not found.
     *
     * @method _setBox
     * @private
     *
     * @param {String} id The node's id attribute
     * @param {Node|String} node The node reference
     * @param {String} template HTML string template for the node
     * @param {boolean} true if this is the boundingBox, false if it's the contentBox
     * @return {Node} The node
     */
    _setBox : function(id, node, template, isBounding) {

        node = Node.one(node);

        if (!node) {
            node = Node.create(template);

            if (isBounding) {
                this._bbFromTemplate = true;
            } else {
                this._cbFromTemplate = true;
            }
        }

        if (!node.get(ID)) {
            node.set(ID, id || Y.guid());
        }

        return node;
    },

    /**
     * Initializes the UI state for the Widget's bounding/content boxes.
     *
     * @method _renderUI
     * @protected
     */
    _renderUI: function() {
        this._renderBoxClassNames();
        this._renderBox(this._parentNode);
    },

    /**
     * Applies standard class names to the boundingBox and contentBox
     *
     * @method _renderBoxClassNames
     * @protected
     */
    _renderBoxClassNames : function() {
        var classes = this._getClasses(),
            cl,
            boundingBox = this.get(BOUNDING_BOX),
            i;

        boundingBox.addClass(_getWidgetClassName());

        // Start from Widget Sub Class
        for (i = classes.length-3; i >= 0; i--) {
            cl = classes[i];
            boundingBox.addClass(cl.CSS_PREFIX || _getClassName(cl.NAME.toLowerCase()));
        }

        // Use instance based name for content box
        this.get(CONTENT_BOX).addClass(this.getClassName(CONTENT));
    },

    /**
     * Removes class names representative of the widget's loading state from 
     * the boundingBox.
     *
     * @method _removeLoadingClassNames
     * @protected
     */
    _removeLoadingClassNames: function () {

        var boundingBox = this.get(BOUNDING_BOX),
            contentBox = this.get(CONTENT_BOX),
            instClass = this.getClassName(LOADING),
            widgetClass = _getWidgetClassName(LOADING);

        boundingBox.removeClass(widgetClass)
                   .removeClass(instClass);

        contentBox.removeClass(widgetClass)
                  .removeClass(instClass);
    },

    /**
     * Sets up DOM and CustomEvent listeners for the widget.
     *
     * @method _bindUI
     * @protected
     */
    _bindUI: function() {
        this._bindAttrUI(this._UI_ATTRS.BIND);
        this._bindDOM();
    },

    /**
     * @method _unbindUI
     * @protected
     */
    _unbindUI : function(boundingBox) {
        this._unbindDOM(boundingBox);
    },

    /**
     * Sets up DOM listeners, on elements rendered by the widget.
     * 
     * @method _bindDOM
     * @protected
     */
    _bindDOM : function() {
        var oDocument = this.get(BOUNDING_BOX).get(OWNER_DOCUMENT),
            focusHandle = Widget._hDocFocus;

        // Shared listener across all Widgets.
        if (!focusHandle) {
            focusHandle = Widget._hDocFocus = oDocument.on("focus", this._onDocFocus, this);
            focusHandle.listeners = {
                count: 0
            };
        }

        focusHandle.listeners[Y.stamp(this, true)] = true;
        focusHandle.listeners.count++;

        //	Fix for Webkit:
        //	Document doesn't receive focus in Webkit when the user mouses 
        //	down on it, so the "focused" attribute won't get set to the 
        //	correct value. Keeping this instance based for now, potential better performance.
        //  Otherwise we'll end up looking up widgets from the DOM on every mousedown.
        if (WEBKIT){
            this._hDocMouseDown = oDocument.on("mousedown", this._onDocMouseDown, this);
        }
    },

    /**
     * @method _unbindDOM
     * @protected
     */   
    _unbindDOM : function(boundingBox) {

        var focusHandle = Widget._hDocFocus,
            yuid = Y.stamp(this, true),
            focusListeners,
            mouseHandle = this._hDocMouseDown;

        if (focusHandle) {

            focusListeners = focusHandle.listeners;

            if (focusListeners[yuid]) {
                delete focusListeners[yuid];
                focusListeners.count--;
            }

            if (focusListeners.count === 0) {
                focusHandle.detach();
                Widget._hDocFocus = null;
            }
        }

        if (WEBKIT && mouseHandle) {
            mouseHandle.detach();
        }
    },

    /**
     * Updates the widget UI to reflect the attribute state.
     *
     * @method _syncUI
     * @protected
     */
    _syncUI: function() {
        this._syncAttrUI(this._UI_ATTRS.SYNC);
    },

    /**
     * Sets the height on the widget's bounding box element
     *
     * @method _uiSetHeight
     * @protected
     * @param {String | Number} val
     */
    _uiSetHeight: function(val) {
        this._uiSetDim(HEIGHT, val);
        this._uiSizeCB((val !== EMPTY_STR && val !== AUTO));
    },

    /**
     * Sets the width on the widget's bounding box element
     *
     * @method _uiSetWidth
     * @protected
     * @param {String | Number} val
     */
    _uiSetWidth: function(val) {
        this._uiSetDim(WIDTH, val);
    },

    /**
     * @method _uiSetDim
     * @private
     * @param {String} dim The dimension - "width" or "height"
     * @param {Number | String} val The value to set
     */
    _uiSetDim: function(dimension, val) {
        this.get(BOUNDING_BOX).setStyle(dimension, L.isNumber(val) ? val + this.DEF_UNIT : val);
    },

    /**
     * Sets the visible state for the UI
     * 
     * @method _uiSetVisible
     * @protected
     * @param {boolean} val
     */
    _uiSetVisible: function(val) {
        this.get(BOUNDING_BOX).toggleClass(this.getClassName(HIDDEN), !val);
    },

    /**
     * Sets the disabled state for the UI
     *
     * @method _uiSetDisabled
     * @protected
     * @param {boolean} val
     */
    _uiSetDisabled: function(val) {
        this.get(BOUNDING_BOX).toggleClass(this.getClassName(DISABLED), val);
    },

    /**
     * Sets the focused state for the UI
     *
     * @method _uiSetFocused
     * @protected
     * @param {boolean} val
     * @param {string} src String representing the source that triggered an update to 
     * the UI.     
     */
    _uiSetFocused: function(val, src) {
         var boundingBox = this.get(BOUNDING_BOX);
         boundingBox.toggleClass(this.getClassName(FOCUSED), val);

         if (src !== UI) {
            if (val) {
                boundingBox.focus();  
            } else {
                boundingBox.blur();
            }
         }
    },

    /**
     * Set the tabIndex on the widget's rendered UI
     *
     * @method _uiSetTabIndex
     * @protected
     * @param Number
     */
    _uiSetTabIndex: function(index) {
        var boundingBox = this.get(BOUNDING_BOX);

        if (L.isNumber(index)) {
            boundingBox.set(TAB_INDEX, index);
        } else {
            boundingBox.removeAttribute(TAB_INDEX);
        }
    },

    /**
     * @method _onDocMouseDown
     * @description "mousedown" event handler for the owner document of the 
     * widget's bounding box.
     * @protected
     * @param {EventFacade} evt The event facade for the DOM focus event
     */
    _onDocMouseDown: function (evt) {
        if (this._domFocus) {
            this._onDocFocus(evt);
        }
    },

    /**
     * DOM focus event handler, used to sync the state of the Widget with the DOM
     * 
     * @method _onDocFocus
     * @protected
     * @param {EventFacade} evt The event facade for the DOM focus event
     */
    _onDocFocus: function (evt) {
        var widget = Widget.getByNode(evt.target),
            activeWidget = Widget._active;

        if (activeWidget && (activeWidget !== widget)) {
            activeWidget._domFocus = false;
            activeWidget._set(FOCUSED, false, {src:UI});

            Widget._active = null;
        }

        if (widget) {
            widget._domFocus = true;
            widget._set(FOCUSED, true, {src:UI});

            Widget._active = widget;
        }
    },

    /**
     * Generic toString implementation for all widgets.
     *
     * @method toString
     * @return {String} The default string value for the widget [ displays the NAME of the instance, and the unique id ]
     */
    toString: function() {
        // Using deprecated name prop for kweight squeeze.
        return this.name + "[" + this.get(ID) + "]";
    },

    /**
     * Default unit to use for dimension values
     * 
     * @property DEF_UNIT
     * @type String
     */
    DEF_UNIT : "px",

    /** 
     * Default node to render the bounding box to. If not set,
     * will default to the current document body.
     * 
     * @property DEF_PARENT_NODE
     * @type String | Node
     */ 
    DEF_PARENT_NODE : null,

    /**
     * Property defining the markup template for content box. If your Widget doesn't
     * need the dual boundingBox/contentBox structure, set CONTENT_TEMPLATE to null,
     * and contentBox and boundingBox will both point to the same Node. 
     *
     * @property CONTENT_TEMPLATE
     * @type String
     */
    CONTENT_TEMPLATE : DIV,

    /**
     * Property defining the markup template for bounding box.
     *
     * @property BOUNDING_TEMPLATE
     * @type String
     */
    BOUNDING_TEMPLATE : DIV,

    /**
     * @method _guid
     * @protected
     */
    _guid : function() {
        return Y.guid();
    },

    /**
     * @method _validTabIndex
     * @protected
     * @param {Number} tabIndex
     */
    _validTabIndex : function (tabIndex) {
        return (L.isNumber(tabIndex) || L.isNull(tabIndex));
    },

    /**
     * Binds after listeners for the list of attributes provided
     * 
     * @method _bindAttrUI
     * @private
     * @param {Array} attrs
     */
    _bindAttrUI : function(attrs) {
        var i, 
            l = attrs.length; 

        for (i = 0; i < l; i++) {
            this.after(attrs[i] + CHANGE, this._setAttrUI);
        }
    },

    /**
     * Invokes the _uiSet&#61;ATTR NAME&#62; method for the list of attributes provided  
     *
     * @method _syncAttrUI
     * @private
     * @param {Array} attrs
     */
    _syncAttrUI : function(attrs) {
        var i, l = attrs.length, attr;
        for (i = 0; i < l; i++) {
            attr = attrs[i];
            this[_UISET + _toInitialCap(attr)](this.get(attr));
        }
    },

    /**
     * @method _setAttrUI
     * @private
     * @param {EventFacade} e
     */
    _setAttrUI : function(e) {
        if (e.target === this) {
            this[_UISET + _toInitialCap(e.attrName)](e.newVal, e.src);
        }
    },

    /**
     * The default setter for the strings attribute. Merges partial sets
     * into the full string set, to allow users to partial sets of strings  
     *
     * @method _strSetter
     * @protected
     * @param {Object} strings
     * @return {String} The full set of strings to set
     */
    _strSetter : function(strings) {
        return Y.merge(this.get(STRINGS), strings);
    },

    /**
     * Helper method to get a specific string value
     *
     * @deprecated Used by deprecated WidgetLocale implementations. 
     * @method getString
     * @param {String} key
     * @return {String} The string
     */
    getString : function(key) {
        return this.get(STRINGS)[key];
    },

    /**
     * Helper method to get the complete set of strings for the widget
     *
     * @deprecated  Used by deprecated WidgetLocale implementations.
     * @method getStrings
     * @param {String} key
     * @return {String} The strings
     */
    getStrings : function() {
        return this.get(STRINGS);
    },

    /**
     * The lists of UI attributes to bind and sync for widget's _bindUI and _syncUI implementations
     *
     * @property _UI_ATTRS
     * @type Object
     * @private
     */
    _UI_ATTRS : {
        BIND: UI_ATTRS,
        SYNC: UI_ATTRS
    }
});

Y.Widget = Widget;


}, '3.8.1', {
    "requires": [
        "attribute",
        "base-base",
        "base-pluginhost",
        "classnamemanager",
        "event-focus",
        "node-base",
        "node-style"
    ],
    "skinnable": true
});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-htmlparser', function (Y, NAME) {

/**
 * Adds HTML Parser support to the base Widget class
 *
 * @module widget
 * @submodule widget-htmlparser
 * @for Widget
 */

var Widget = Y.Widget,
    Node = Y.Node,
    Lang = Y.Lang,

    SRC_NODE = "srcNode",
    CONTENT_BOX = "contentBox";

/**
 * Object hash, defining how attribute values are to be parsed from
 * markup contained in the widget's content box. e.g.:
 * <pre>
 *   {
 *       // Set single Node references using selector syntax 
 *       // (selector is run through node.one)
 *       titleNode: "span.yui-title",
 *       // Set NodeList references using selector syntax 
 *       // (array indicates selector is to be run through node.all)
 *       listNodes: ["li.yui-item"],
 *       // Set other attribute types, using a parse function. 
 *       // Context is set to the widget instance.
 *       label: function(contentBox) {
 *           return contentBox.one("span.title").get("innerHTML");
 *       }
 *   }
 * </pre>
 * 
 * @property HTML_PARSER
 * @type Object
 * @static
 */
Widget.HTML_PARSER = {};

/**
 * The build configuration for the Widget class.
 * <p>
 * Defines the static fields which need to be aggregated,
 * when this class is used as the main class passed to 
 * the <a href="Base.html#method_build">Base.build</a> method.
 * </p>
 * @property _buildCfg
 * @type Object
 * @static
 * @final
 * @private
 */
Widget._buildCfg = {
    aggregates : ["HTML_PARSER"]
};

/**
 * The DOM node to parse for configuration values, passed to the Widget's HTML_PARSER definition
 *
 * @attribute srcNode
 * @type String | Node
 * @writeOnce
 */
Widget.ATTRS[SRC_NODE] = {
    value: null,
    setter: Node.one,
    getter: "_getSrcNode",
    writeOnce: true
};

Y.mix(Widget.prototype, {

    /**
     * @method _getSrcNode
     * @protected
     * @return {Node} The Node to apply HTML_PARSER to
     */
    _getSrcNode : function(val) {
        return val || this.get(CONTENT_BOX);
    },

    /**
     * @method _applyParsedConfig
     * @protected
     * @return {Object} The merged configuration literal
     */
    _applyParsedConfig : function(node, cfg, parsedCfg) {
        return (parsedCfg) ? Y.mix(cfg, parsedCfg, false) : cfg;
    },

    /**
     * Utility method used to apply the <code>HTML_PARSER</code> configuration for the 
     * instance, to retrieve config data values.
     *
     * @method _applyParser
     * @protected
     * @param config {Object} User configuration object (will be populated with values from Node) 
     */
    _applyParser : function(config) {

        var widget = this,
            srcNode = this._getNodeToParse(),
            schema = widget._getHtmlParser(),
            parsedConfig,
            val;

        if (schema && srcNode) {
            Y.Object.each(schema, function(v, k, o) {
                val = null;

                if (Lang.isFunction(v)) {
                    val = v.call(widget, srcNode);
                } else {
                    if (Lang.isArray(v)) {
                        val = srcNode.all(v[0]);
                        if (val.isEmpty()) {
                            val = null;
                        }
                    } else {
                        val = srcNode.one(v);
                    }
                }

                if (val !== null && val !== undefined) {
                    parsedConfig = parsedConfig || {};
                    parsedConfig[k] = val;
                }
            });
        }
        config = widget._applyParsedConfig(srcNode, config, parsedConfig);
    },

    /**
     * Determines whether we have a node reference which we should try and parse.
     * 
     * The current implementation does not parse nodes generated from CONTENT_TEMPLATE,
     * only explicitly set srcNode, or contentBox attributes.
     * 
     * @method _getNodeToParse
     * @return {Node} The node reference to apply HTML_PARSER to.
     * @private
     */
    _getNodeToParse : function() {
        var srcNode = this.get("srcNode");
        return (!this._cbFromTemplate) ? srcNode : null;
    },

    /**
     * Gets the HTML_PARSER definition for this instance, by merging HTML_PARSER
     * definitions across the class hierarchy.
     *
     * @private
     * @method _getHtmlParser
     * @return {Object} HTML_PARSER definition for this instance
     */
    _getHtmlParser : function() {
        // Removed caching for kweight. This is a private method
        // and only called once so don't need to cache HTML_PARSER
        var classes = this._getClasses(),
            parser = {},
            i, p;

        for (i = classes.length - 1; i >= 0; i--) {
            p = classes[i].HTML_PARSER;
            if (p) {
                Y.mix(parser, p, true);
            }
        }
        return parser;
    }
});


}, '3.8.1', {"requires": ["widget-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-skin', function (Y, NAME) {

/**
 * Provides skin related utlility methods.
 *
 * @module widget
 * @submodule widget-skin
 */

var BOUNDING_BOX = "boundingBox",
    CONTENT_BOX = "contentBox",
    SKIN = "skin",
    _getClassName = Y.ClassNameManager.getClassName;

/**
 * Returns the name of the skin that's currently applied to the widget.
 * This is only really useful after the widget's DOM structure is in the
 * document, either by render or by progressive enhancement.  Searches up
 * the Widget's ancestor axis for a class yui3-skin-(name), and returns the
 * (name) portion.  Otherwise, returns null.
 *
 * @method getSkinName
 * @for Widget
 * @return {String} the name of the skin, or null (yui3-skin-sam => sam)
 */

Y.Widget.prototype.getSkinName = function () {
    var root = this.get( CONTENT_BOX ) || this.get( BOUNDING_BOX ),
        search = new RegExp( '\\b' + _getClassName( SKIN ) + '-(\\S+)' ),
        match;

    if ( root ) {
        root.ancestor( function ( node ) {
            match = node.get( 'className' ).match( search );
            return match;
        } );
    }

    return ( match ) ? match[1] : null;
};


}, '3.8.1', {"requires": ["widget-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-delegate', function (Y, NAME) {

/**
 * Adds event delegation support to the library.
 *
 * @module event
 * @submodule event-delegate
 */

var toArray          = Y.Array,
    YLang            = Y.Lang,
    isString         = YLang.isString,
    isObject         = YLang.isObject,
    isArray          = YLang.isArray,
    selectorTest     = Y.Selector.test,
    detachCategories = Y.Env.evt.handles;

/**
 * <p>Sets up event delegation on a container element.  The delegated event
 * will use a supplied selector or filtering function to test if the event
 * references at least one node that should trigger the subscription
 * callback.</p>
 *
 * <p>Selector string filters will trigger the callback if the event originated
 * from a node that matches it or is contained in a node that matches it.
 * Function filters are called for each Node up the parent axis to the
 * subscribing container node, and receive at each level the Node and the event
 * object.  The function should return true (or a truthy value) if that Node
 * should trigger the subscription callback.  Note, it is possible for filters
 * to match multiple Nodes for a single event.  In this case, the delegate
 * callback will be executed for each matching Node.</p>
 *
 * <p>For each matching Node, the callback will be executed with its 'this'
 * object set to the Node matched by the filter (unless a specific context was
 * provided during subscription), and the provided event's
 * <code>currentTarget</code> will also be set to the matching Node.  The
 * containing Node from which the subscription was originally made can be
 * referenced as <code>e.container</code>.
 *
 * @method delegate
 * @param type {String} the event type to delegate
 * @param fn {Function} the callback function to execute.  This function
 *              will be provided the event object for the delegated event.
 * @param el {String|node} the element that is the delegation container
 * @param filter {string|Function} a selector that must match the target of the
 *              event or a function to test target and its parents for a match
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 *              These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @static
 * @for Event
 */
function delegate(type, fn, el, filter) {
    var args     = toArray(arguments, 0, true),
        query    = isString(el) ? el : null,
        typeBits, synth, container, categories, cat, i, len, handles, handle;

    // Support Y.delegate({ click: fnA, key: fnB }, el, filter, ...);
    // and Y.delegate(['click', 'key'], fn, el, filter, ...);
    if (isObject(type)) {
        handles = [];

        if (isArray(type)) {
            for (i = 0, len = type.length; i < len; ++i) {
                args[0] = type[i];
                handles.push(Y.delegate.apply(Y, args));
            }
        } else {
            // Y.delegate({'click', fn}, el, filter) =>
            // Y.delegate('click', fn, el, filter)
            args.unshift(null); // one arg becomes two; need to make space

            for (i in type) {
                if (type.hasOwnProperty(i)) {
                    args[0] = i;
                    args[1] = type[i];
                    handles.push(Y.delegate.apply(Y, args));
                }
            }
        }

        return new Y.EventHandle(handles);
    }

    typeBits = type.split(/\|/);

    if (typeBits.length > 1) {
        cat  = typeBits.shift();
        args[0] = type = typeBits.shift();
    }

    synth = Y.Node.DOM_EVENTS[type];

    if (isObject(synth) && synth.delegate) {
        handle = synth.delegate.apply(synth, arguments);
    }

    if (!handle) {
        if (!type || !fn || !el || !filter) {
            return;
        }

        container = (query) ? Y.Selector.query(query, null, true) : el;

        if (!container && isString(el)) {
            handle = Y.on('available', function () {
                Y.mix(handle, Y.delegate.apply(Y, args), true);
            }, el);
        }

        if (!handle && container) {
            args.splice(2, 2, container); // remove the filter

            handle = Y.Event._attach(args, { facade: false });
            handle.sub.filter  = filter;
            handle.sub._notify = delegate.notifySub;
        }
    }

    if (handle && cat) {
        categories = detachCategories[cat]  || (detachCategories[cat] = {});
        categories = categories[type] || (categories[type] = []);
        categories.push(handle);
    }

    return handle;
}

/**
Overrides the <code>_notify</code> method on the normal DOM subscription to
inject the filtering logic and only proceed in the case of a match.

This method is hosted as a private property of the `delegate` method
(e.g. `Y.delegate.notifySub`)

@method notifySub
@param thisObj {Object} default 'this' object for the callback
@param args {Array} arguments passed to the event's <code>fire()</code>
@param ce {CustomEvent} the custom event managing the DOM subscriptions for
             the subscribed event on the subscribing node.
@return {Boolean} false if the event was stopped
@private
@static
@since 3.2.0
**/
delegate.notifySub = function (thisObj, args, ce) {
    // Preserve args for other subscribers
    args = args.slice();
    if (this.args) {
        args.push.apply(args, this.args);
    }

    // Only notify subs if the event occurred on a targeted element
    var currentTarget = delegate._applyFilter(this.filter, args, ce),
        //container     = e.currentTarget,
        e, i, len, ret;

    if (currentTarget) {
        // Support multiple matches up the the container subtree
        currentTarget = toArray(currentTarget);

        // The second arg is the currentTarget, but we'll be reusing this
        // facade, replacing the currentTarget for each use, so it doesn't
        // matter what element we seed it with.
        e = args[0] = new Y.DOMEventFacade(args[0], ce.el, ce);

        e.container = Y.one(ce.el);

        for (i = 0, len = currentTarget.length; i < len && !e.stopped; ++i) {
            e.currentTarget = Y.one(currentTarget[i]);

            ret = this.fn.apply(this.context || e.currentTarget, args);

            if (ret === false) { // stop further notifications
                break;
            }
        }

        return ret;
    }
};

/**
Compiles a selector string into a filter function to identify whether
Nodes along the parent axis of an event's target should trigger event
notification.

This function is memoized, so previously compiled filter functions are
returned if the same selector string is provided.

This function may be useful when defining synthetic events for delegate
handling.

Hosted as a property of the `delegate` method (e.g. `Y.delegate.compileFilter`).

@method compileFilter
@param selector {String} the selector string to base the filtration on
@return {Function}
@since 3.2.0
@static
**/
delegate.compileFilter = Y.cached(function (selector) {
    return function (target, e) {
        return selectorTest(target._node, selector,
            (e.currentTarget === e.target) ? null : e.currentTarget._node);
    };
});

/**
Walks up the parent axis of an event's target, and tests each element
against a supplied filter function.  If any Nodes, including the container,
satisfy the filter, the delegated callback will be triggered for each.

Hosted as a protected property of the `delegate` method (e.g.
`Y.delegate._applyFilter`).

@method _applyFilter
@param filter {Function} boolean function to test for inclusion in event
                 notification
@param args {Array} the arguments that would be passed to subscribers
@param ce   {CustomEvent} the DOM event wrapper
@return {Node|Node[]|undefined} The Node or Nodes that satisfy the filter
@protected
**/
delegate._applyFilter = function (filter, args, ce) {
    var e         = args[0],
        container = ce.el, // facadeless events in IE, have no e.currentTarget
        target    = e.target || e.srcElement,
        match     = [],
        isContainer = false;

    // Resolve text nodes to their containing element
    if (target.nodeType === 3) {
        target = target.parentNode;
    }

    // passing target as the first arg rather than leaving well enough alone
    // making 'this' in the filter function refer to the target.  This is to
    // support bound filter functions.
    args.unshift(target);

    if (isString(filter)) {
        while (target) {
            isContainer = (target === container);
            if (selectorTest(target, filter, (isContainer ? null: container))) {
                match.push(target);
            }

            if (isContainer) {
                break;
            }

            target = target.parentNode;
        }
    } else {
        // filter functions are implementer code and should receive wrappers
        args[0] = Y.one(target);
        args[1] = new Y.DOMEventFacade(e, container, ce);

        while (target) {
            // filter(target, e, extra args...) - this === target
            if (filter.apply(args[0], args)) {
                match.push(target);
            }

            if (target === container) {
                break;
            }

            target = target.parentNode;
            args[0] = Y.one(target);
        }
        args[1] = e; // restore the raw DOM event
    }

    if (match.length <= 1) {
        match = match[0]; // single match or undefined
    }

    // remove the target
    args.shift();

    return match;
};

/**
 * Sets up event delegation on a container element.  The delegated event
 * will use a supplied filter to test if the callback should be executed.
 * This filter can be either a selector string or a function that returns
 * a Node to use as the currentTarget for the event.
 *
 * The event object for the delegated event is supplied to the callback
 * function.  It is modified slightly in order to support all properties
 * that may be needed for event delegation.  'currentTarget' is set to
 * the element that matched the selector string filter or the Node returned
 * from the filter function.  'container' is set to the element that the
 * listener is delegated from (this normally would be the 'currentTarget').
 *
 * Filter functions will be called with the arguments that would be passed to
 * the callback function, including the event object as the first parameter.
 * The function should return false (or a falsey value) if the success criteria
 * aren't met, and the Node to use as the event's currentTarget and 'this'
 * object if they are.
 *
 * @method delegate
 * @param type {string} the event type to delegate
 * @param fn {function} the callback function to execute.  This function
 * will be provided the event object for the delegated event.
 * @param el {string|node} the element that is the delegation container
 * @param filter {string|function} a selector that must match the target of the
 * event or a function that returns a Node or false.
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 * These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
Y.delegate = Y.Event.delegate = delegate;


}, '3.8.1', {"requires": ["node-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('node-event-delegate', function (Y, NAME) {

/**
 * Functionality to make the node a delegated event container
 * @module node
 * @submodule node-event-delegate
 */

/**
 * <p>Sets up a delegation listener for an event occurring inside the Node.
 * The delegated event will be verified against a supplied selector or
 * filtering function to test if the event references at least one node that
 * should trigger the subscription callback.</p>
 *
 * <p>Selector string filters will trigger the callback if the event originated
 * from a node that matches it or is contained in a node that matches it.
 * Function filters are called for each Node up the parent axis to the
 * subscribing container node, and receive at each level the Node and the event
 * object.  The function should return true (or a truthy value) if that Node
 * should trigger the subscription callback.  Note, it is possible for filters
 * to match multiple Nodes for a single event.  In this case, the delegate
 * callback will be executed for each matching Node.</p>
 *
 * <p>For each matching Node, the callback will be executed with its 'this'
 * object set to the Node matched by the filter (unless a specific context was
 * provided during subscription), and the provided event's
 * <code>currentTarget</code> will also be set to the matching Node.  The
 * containing Node from which the subscription was originally made can be
 * referenced as <code>e.container</code>.
 *
 * @method delegate
 * @param type {String} the event type to delegate
 * @param fn {Function} the callback function to execute.  This function
 *              will be provided the event object for the delegated event.
 * @param spec {String|Function} a selector that must match the target of the
 *              event or a function to test target and its parents for a match
 * @param context {Object} optional argument that specifies what 'this' refers to.
 * @param args* {any} 0..n additional arguments to pass on to the callback function.
 *              These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for Node
 */
Y.Node.prototype.delegate = function(type) {

    var args = Y.Array(arguments, 0, true),
        index = (Y.Lang.isObject(type) && !Y.Lang.isArray(type)) ? 1 : 2;

    args.splice(index, 0, this._node);

    return Y.delegate.apply(Y, args);
};


}, '3.8.1', {"requires": ["node-base", "event-delegate"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-uievents', function (Y, NAME) {

/**
 * Support for Widget UI Events (Custom Events fired by the widget, which wrap the underlying DOM events - e.g. widget:click, widget:mousedown)
 *
 * @module widget
 * @submodule widget-uievents
 */

var BOUNDING_BOX = "boundingBox",
    Widget = Y.Widget,
    RENDER = "render",
    L = Y.Lang,
    EVENT_PREFIX_DELIMITER = ":",

    //  Map of Node instances serving as a delegation containers for a specific
    //  event type to Widget instances using that delegation container.
    _uievts = Y.Widget._uievts = Y.Widget._uievts || {};

Y.mix(Widget.prototype, {

    /**
     * Destructor logic for UI event infrastructure,
     * invoked during Widget destruction.
     *
     * @method _destroyUIEvents
     * @for Widget
     * @private
     */
    _destroyUIEvents: function() {

        var widgetGuid = Y.stamp(this, true);

        Y.each(_uievts, function (info, key) {
            if (info.instances[widgetGuid]) {
                //  Unregister this Widget instance as needing this delegated
                //  event listener.
                delete info.instances[widgetGuid];

                //  There are no more Widget instances using this delegated 
                //  event listener, so detach it.

                if (Y.Object.isEmpty(info.instances)) {
                    info.handle.detach();

                    if (_uievts[key]) {
                        delete _uievts[key];
                    }
                }
            }
        });
    },

    /**
     * Map of DOM events that should be fired as Custom Events by the  
     * Widget instance.
     *
     * @property UI_EVENTS
     * @for Widget
     * @type Object
     */
    UI_EVENTS: Y.Node.DOM_EVENTS,

    /**
     * Returns the node on which to bind delegate listeners.
     *
     * @method _getUIEventNode
     * @for Widget
     * @protected
     */
    _getUIEventNode: function () {
        return this.get(BOUNDING_BOX);
    },

    /**
     * Binds a delegated DOM event listener of the specified type to the 
     * Widget's outtermost DOM element to facilitate the firing of a Custom
     * Event of the same type for the Widget instance.  
     *
     * @method _createUIEvent
     * @for Widget 
     * @param type {String} String representing the name of the event
     * @private
     */
    _createUIEvent: function (type) {

        var uiEvtNode = this._getUIEventNode(),
            key = (Y.stamp(uiEvtNode) + type),
            info = _uievts[key],
            handle;

        //  For each Node instance: Ensure that there is only one delegated
        //  event listener used to fire Widget UI events.

        if (!info) {

            handle = uiEvtNode.delegate(type, function (evt) {

                var widget = Widget.getByNode(this);

                // Widget could be null if node instance belongs to
                // another Y instance.

                if (widget) {
                    if (widget._filterUIEvent(evt)) {
                        widget.fire(evt.type, { domEvent: evt });
                    }
                }

            }, "." + Y.Widget.getClassName());

            _uievts[key] = info = { instances: {}, handle: handle };
        }

        //  Register this Widget as using this Node as a delegation container.
        info.instances[Y.stamp(this)] = 1;
    },

    /**
     * This method is used to determine if we should fire
     * the UI Event or not. The default implementation makes sure
     * that for nested delegates (nested unrelated widgets), we don't 
     * fire the UI event listener more than once at each level.
     *
     * <p>For example, without the additional filter, if you have nested 
     * widgets, each widget will have a delegate listener. If you 
     * click on the inner widget, the inner delegate listener's 
     * filter will match once, but the outer will match twice 
     * (based on delegate's design) - once for the inner widget, 
     * and once for the outer.</p>
     *
     * @method _filterUIEvent
     * @for Widget 
     * @param {DOMEventFacade} evt
     * @return {boolean} true if it's OK to fire the custom UI event, false if not.
     * @private
     * 
     */
    _filterUIEvent: function(evt) {
        // Either it's hitting this widget's delegate container (and not some other widget's), 
        // or the container it's hitting is handling this widget's ui events.
        return (evt.currentTarget.compareTo(evt.container) || evt.container.compareTo(this._getUIEventNode()));        
    },

    /**
     * Determines if the specified event is a UI event.
     *
     * @private
     * @method _isUIEvent
     * @for Widget 
     * @param type {String} String representing the name of the event
     * @return {String} Event Returns the name of the UI Event, otherwise 
     * undefined.
     */
    _getUIEvent: function (type) {

        if (L.isString(type)) {
            var sType = this.parseType(type)[1],
                iDelim,
                returnVal;

            if (sType) {
                // TODO: Get delimiter from ET, or have ET support this.
                iDelim = sType.indexOf(EVENT_PREFIX_DELIMITER);
                if (iDelim > -1) {
                    sType = sType.substring(iDelim + EVENT_PREFIX_DELIMITER.length);
                }

                if (this.UI_EVENTS[sType]) {
                    returnVal = sType;
                }
            }

            return returnVal;
        }
    },

    /**
     * Sets up infrastructure required to fire a UI event.
     * 
     * @private
     * @method _initUIEvent
     * @for Widget
     * @param type {String} String representing the name of the event
     * @return {String}     
     */
    _initUIEvent: function (type) {
        var sType = this._getUIEvent(type),
            queue = this._uiEvtsInitQueue || {};

        if (sType && !queue[sType]) {

            this._uiEvtsInitQueue = queue[sType] = 1;

            this.after(RENDER, function() { 
                this._createUIEvent(sType);
                delete this._uiEvtsInitQueue[sType];
            });
        }
    },

    //  Override of "on" from Base to facilitate the firing of Widget events
    //  based on DOM events of the same name/type (e.g. "click", "mouseover").
    //  Temporary solution until we have the ability to listen to when 
    //  someone adds an event listener (bug 2528230)
    on: function (type) {
        this._initUIEvent(type);
        return Widget.superclass.on.apply(this, arguments);
    },

    //  Override of "publish" from Base to facilitate the firing of Widget events
    //  based on DOM events of the same name/type (e.g. "click", "mouseover").    
    //  Temporary solution until we have the ability to listen to when 
    //  someone publishes an event (bug 2528230)     
    publish: function (type, config) {
        var sType = this._getUIEvent(type);
        if (sType && config && config.defaultFn) {
            this._initUIEvent(sType);
        }        
        return Widget.superclass.publish.apply(this, arguments);
    }

}, true); // overwrite existing EventTarget methods


}, '3.8.1', {"requires": ["node-event-delegate", "widget-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('base-build', function (Y, NAME) {

    /**
     * The base-build submodule provides Base.build functionality, which
     * can be used to create custom classes, by aggregating extensions onto
     * a main class.
     *
     * @module base
     * @submodule base-build
     * @for Base
     */
    var BaseCore = Y.BaseCore,
        Base     = Y.Base,
        L        = Y.Lang,

        INITIALIZER = "initializer",
        DESTRUCTOR  = "destructor",
        AGGREGATES  = ["_PLUG", "_UNPLUG"],

        build;

    // Utility function used in `_buildCfg` to aggregate array values into a new
    // array from the sender constructor to the reciver constructor.
    function arrayAggregator(prop, r, s) {
        if (s[prop]) {
            r[prop] = (r[prop] || []).concat(s[prop]);
        }
    }

    // Utility function used in `_buildCfg` to aggregate `_ATTR_CFG` array
    // values from the sender constructor into a new array on reciver's
    // constructor, and clear the cached hash.
    function attrCfgAggregator(prop, r, s) {
        if (s._ATTR_CFG) {
            arrayAggregator.apply(null, arguments);

            // Clear cached hash.
            r._ATTR_CFG_HASH = null;
        }
    }

    // Utility function used in `_buildCfg` to aggregate ATTRS configs from one
    // the sender constructor to the reciver constructor.
    function attrsAggregator(prop, r, s) {
        var sAttrs, rAttrs, a;

        r.ATTRS = r.ATTRS || {};

        if (s.ATTRS) {
            sAttrs = s.ATTRS;
            rAttrs = r.ATTRS;

            for (a in sAttrs) {
                if (sAttrs.hasOwnProperty(a)) {
                    rAttrs[a] = rAttrs[a] || {};
                    Y.mix(rAttrs[a], sAttrs[a], true);
                }
            }
        }
    }

    Base._build = function(name, main, extensions, px, sx, cfg) {

        var build = Base._build,

            builtClass = build._ctor(main, cfg),
            buildCfg = build._cfg(main, cfg, extensions),

            _mixCust = build._mixCust,

            dynamic = builtClass._yuibuild.dynamic,

            i, l, extClass, extProto,
            initializer,
            destructor;

        // Augment/Aggregate
        for (i = 0, l = extensions.length; i < l; i++) {
            extClass = extensions[i];

            extProto = extClass.prototype;

            initializer = extProto[INITIALIZER];
            destructor = extProto[DESTRUCTOR];
            delete extProto[INITIALIZER];
            delete extProto[DESTRUCTOR];

            // Prototype, old non-displacing augment
            Y.mix(builtClass, extClass, true, null, 1);

            // Custom Statics
            _mixCust(builtClass, extClass, buildCfg);

            if (initializer) {
                extProto[INITIALIZER] = initializer;
            }

            if (destructor) {
                extProto[DESTRUCTOR] = destructor;
            }

            builtClass._yuibuild.exts.push(extClass);
        }

        if (px) {
            Y.mix(builtClass.prototype, px, true);
        }

        if (sx) {
            Y.mix(builtClass, build._clean(sx, buildCfg), true);
            _mixCust(builtClass, sx, buildCfg);
        }

        builtClass.prototype.hasImpl = build._impl;

        if (dynamic) {
            builtClass.NAME = name;
            builtClass.prototype.constructor = builtClass;
        }

        return builtClass;
    };

    build = Base._build;

    Y.mix(build, {

        _mixCust: function(r, s, cfg) {

            var aggregates,
                custom,
                statics,
                aggr,
                l,
                i;

            if (cfg) {
                aggregates = cfg.aggregates;
                custom = cfg.custom;
                statics = cfg.statics;
            }

            if (statics) {
                Y.mix(r, s, true, statics);
            }

            if (aggregates) {
                for (i = 0, l = aggregates.length; i < l; i++) {
                    aggr = aggregates[i];
                    if (!r.hasOwnProperty(aggr) && s.hasOwnProperty(aggr)) {
                        r[aggr] = L.isArray(s[aggr]) ? [] : {};
                    }
                    Y.aggregate(r, s, true, [aggr]);
                }
            }

            if (custom) {
                for (i in custom) {
                    if (custom.hasOwnProperty(i)) {
                        custom[i](i, r, s);
                    }
                }
            }

        },

        _tmpl: function(main) {

            function BuiltClass() {
                BuiltClass.superclass.constructor.apply(this, arguments);
            }
            Y.extend(BuiltClass, main);

            return BuiltClass;
        },

        _impl : function(extClass) {
            var classes = this._getClasses(), i, l, cls, exts, ll, j;
            for (i = 0, l = classes.length; i < l; i++) {
                cls = classes[i];
                if (cls._yuibuild) {
                    exts = cls._yuibuild.exts;
                    ll = exts.length;

                    for (j = 0; j < ll; j++) {
                        if (exts[j] === extClass) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        _ctor : function(main, cfg) {

           var dynamic = (cfg && false === cfg.dynamic) ? false : true,
               builtClass = (dynamic) ? build._tmpl(main) : main,
               buildCfg = builtClass._yuibuild;

            if (!buildCfg) {
                buildCfg = builtClass._yuibuild = {};
            }

            buildCfg.id = buildCfg.id || null;
            buildCfg.exts = buildCfg.exts || [];
            buildCfg.dynamic = dynamic;

            return builtClass;
        },

        _cfg : function(main, cfg, exts) {
            var aggr = [],
                cust = {},
                statics = [],
                buildCfg,
                cfgAggr = (cfg && cfg.aggregates),
                cfgCustBuild = (cfg && cfg.custom),
                cfgStatics = (cfg && cfg.statics),
                c = main,
                i,
                l;

            // Prototype Chain
            while (c && c.prototype) {
                buildCfg = c._buildCfg;
                if (buildCfg) {
                    if (buildCfg.aggregates) {
                        aggr = aggr.concat(buildCfg.aggregates);
                    }
                    if (buildCfg.custom) {
                        Y.mix(cust, buildCfg.custom, true);
                    }
                    if (buildCfg.statics) {
                        statics = statics.concat(buildCfg.statics);
                    }
                }
                c = c.superclass ? c.superclass.constructor : null;
            }

            // Exts
            if (exts) {
                for (i = 0, l = exts.length; i < l; i++) {
                    c = exts[i];
                    buildCfg = c._buildCfg;
                    if (buildCfg) {
                        if (buildCfg.aggregates) {
                            aggr = aggr.concat(buildCfg.aggregates);
                        }
                        if (buildCfg.custom) {
                            Y.mix(cust, buildCfg.custom, true);
                        }
                        if (buildCfg.statics) {
                            statics = statics.concat(buildCfg.statics);
                        }
                    }
                }
            }

            if (cfgAggr) {
                aggr = aggr.concat(cfgAggr);
            }

            if (cfgCustBuild) {
                Y.mix(cust, cfg.cfgBuild, true);
            }

            if (cfgStatics) {
                statics = statics.concat(cfgStatics);
            }

            return {
                aggregates: aggr,
                custom: cust,
                statics: statics
            };
        },

        _clean : function(sx, cfg) {
            var prop, i, l, sxclone = Y.merge(sx),
                aggregates = cfg.aggregates,
                custom = cfg.custom;

            for (prop in custom) {
                if (sxclone.hasOwnProperty(prop)) {
                    delete sxclone[prop];
                }
            }

            for (i = 0, l = aggregates.length; i < l; i++) {
                prop = aggregates[i];
                if (sxclone.hasOwnProperty(prop)) {
                    delete sxclone[prop];
                }
            }

            return sxclone;
        }
    });

    /**
     * <p>
     * Builds a custom constructor function (class) from the
     * main function, and array of extension functions (classes)
     * provided. The NAME field for the constructor function is
     * defined by the first argument passed in.
     * </p>
     * <p>
     * The cfg object supports the following properties
     * </p>
     * <dl>
     *    <dt>dynamic &#60;boolean&#62;</dt>
     *    <dd>
     *    <p>If true (default), a completely new class
     *    is created which extends the main class, and acts as the
     *    host on which the extension classes are augmented.</p>
     *    <p>If false, the extensions classes are augmented directly to
     *    the main class, modifying the main class' prototype.</p>
     *    </dd>
     *    <dt>aggregates &#60;String[]&#62;</dt>
     *    <dd>An array of static property names, which will get aggregated
     *    on to the built class, in addition to the default properties build
     *    will always aggregate as defined by the main class' static _buildCfg
     *    property.
     *    </dd>
     * </dl>
     *
     * @method build
     * @deprecated Use the more convenient Base.create and Base.mix methods instead
     * @static
     * @param {Function} name The name of the new class. Used to define the NAME property for the new class.
     * @param {Function} main The main class on which to base the built class
     * @param {Function[]} extensions The set of extension classes which will be
     * augmented/aggregated to the built class.
     * @param {Object} cfg Optional. Build configuration for the class (see description).
     * @return {Function} A custom class, created from the provided main and extension classes
     */
    Base.build = function(name, main, extensions, cfg) {
        return build(name, main, extensions, null, null, cfg);
    };

    /**
     * Creates a new class (constructor function) which extends the base class passed in as the second argument,
     * and mixes in the array of extensions provided.
     *
     * Prototype properties or methods can be added to the new class, using the px argument (similar to Y.extend).
     *
     * Static properties or methods can be added to the new class, using the sx argument (similar to Y.extend).
     *
     * **NOTE FOR COMPONENT DEVELOPERS**: Both the `base` class, and `extensions` can define static a `_buildCfg`
     * property, which acts as class creation meta-data, and drives how special static properties from the base
     * class, or extensions should be copied, aggregated or (custom) mixed into the newly created class.
     *
     * The `_buildCfg` property is a hash with 3 supported properties: `statics`, `aggregates` and `custom`, e.g:
     *
     *     // If the Base/Main class is the thing introducing the property:
     *
     *     MyBaseClass._buildCfg = {
     *
     *        // Static properties/methods to copy (Alias) to the built class.
     *        statics: ["CopyThisMethod", "CopyThisProperty"],
     *
     *        // Static props to aggregate onto the built class.
     *        aggregates: ["AggregateThisProperty"],
     *
     *        // Static properties which need custom handling (e.g. deep merge etc.)
     *        custom: {
     *           "CustomProperty" : function(property, Receiver, Supplier) {
     *              ...
     *              var triggers = Receiver.CustomProperty.triggers;
                    Receiver.CustomProperty.triggers = triggers.concat(Supplier.CustomProperty.triggers);
     *              ...
     *           }
     *        }
     *     };
     *
     *     MyBaseClass.CopyThisMethod = function() {...};
     *     MyBaseClass.CopyThisProperty = "foo";
     *     MyBaseClass.AggregateThisProperty = {...};
     *     MyBaseClass.CustomProperty = {
     *        triggers: [...]
     *     }
     *
     *     // Or, if the Extension is the thing introducing the property:
     *
     *     MyExtension._buildCfg = {
     *         statics : ...
     *         aggregates : ...
     *         custom : ...
     *     }
     *
     * This way, when users pass your base or extension class to `Y.Base.create` or `Y.Base.mix`, they don't need to
     * know which properties need special handling. `Y.Base` has a buildCfg which defines `ATTRS` for custom mix handling
     * (to protect the static config objects), and `Y.Widget` has a buildCfg which specifies `HTML_PARSER` for
     * straight up aggregation.
     *
     * @method create
     * @static
     * @param {Function} name The name of the newly created class. Used to define the NAME property for the new class.
     * @param {Function} main The base class which the new class should extend. This class needs to be Base or a class derived from base (e.g. Widget).
     * @param {Function[]} extensions The list of extensions which will be mixed into the built class.
     * @param {Object} px The set of prototype properties/methods to add to the built class.
     * @param {Object} sx The set of static properties/methods to add to the built class.
     * @return {Function} The newly created class.
     */
    Base.create = function(name, base, extensions, px, sx) {
        return build(name, base, extensions, px, sx);
    };

    /**
     * <p>Mixes in a list of extensions to an existing class.</p>
     * @method mix
     * @static
     * @param {Function} main The existing class into which the extensions should be mixed.  The class needs to be Base or a class derived from Base (e.g. Widget)
     * @param {Function[]} extensions The set of extension classes which will mixed into the existing main class.
     * @return {Function} The modified main class, with extensions mixed in.
     */
    Base.mix = function(main, extensions) {
        return build(null, main, extensions, null, null, {dynamic:false});
    };

    /**
     * The build configuration for the Base class.
     *
     * Defines the static fields which need to be aggregated when the Base class
     * is used as the main class passed to the
     * <a href="#method_Base.build">Base.build</a> method.
     *
     * @property _buildCfg
     * @type Object
     * @static
     * @final
     * @private
     */
    BaseCore._buildCfg = {
        custom: {
            ATTRS         : attrsAggregator,
            _ATTR_CFG     : attrCfgAggregator,
            _NON_ATTRS_CFG: arrayAggregator
        },

        aggregates: AGGREGATES.concat()
    };

    // Makes sure Base and BaseCore use separate `_buildCfg` objects.
    Base._buildCfg = {
        custom: {
            ATTRS         : attrsAggregator,
            _ATTR_CFG     : attrCfgAggregator,
            _NON_ATTRS_CFG: arrayAggregator
        },

        aggregates: AGGREGATES.concat()
    };


}, '3.8.1', {"requires": ["base-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-position', function (Y, NAME) {

/**
 * Provides basic XY positioning support for Widgets, though an extension
 *
 * @module widget-position
 */
    var Lang = Y.Lang,
        Widget = Y.Widget,

        XY_COORD = "xy",

        POSITION = "position",
        POSITIONED = "positioned",
        BOUNDING_BOX = "boundingBox",
        RELATIVE = "relative",

        RENDERUI = "renderUI",
        BINDUI = "bindUI",
        SYNCUI = "syncUI",

        UI = Widget.UI_SRC,

        XYChange = "xyChange";

    /**
     * Widget extension, which can be used to add positioning support to the base Widget class, 
     * through the <a href="Base.html#method_build">Base.build</a> method.
     *
     * @class WidgetPosition
     * @param {Object} config User configuration object
     */
    function Position(config) {
        this._posNode = this.get(BOUNDING_BOX);

        // WIDGET METHOD OVERLAP
        Y.after(this._renderUIPosition, this, RENDERUI);
        Y.after(this._syncUIPosition, this, SYNCUI);
        Y.after(this._bindUIPosition, this, BINDUI);
    }

    /**
     * Static property used to define the default attribute 
     * configuration introduced by WidgetPosition.
     *
     * @property ATTRS
     * @static
     * @type Object
     */
    Position.ATTRS = {

        /**
         * @attribute x
         * @type number
         * @default 0
         *
         * @description Page X co-ordinate for the widget. This attribute acts as a facade for the 
         * xy attribute. Changes in position can be monitored by listening for xyChange events.
         */
        x: {
            setter: function(val) {
                this._setX(val);
            },
            getter: function() {
                return this._getX();
            },
            lazyAdd:false
        },

        /**
         * @attribute y
         * @type number
         * @default 0
         *
         * @description Page Y co-ordinate for the widget. This attribute acts as a facade for the 
         * xy attribute. Changes in position can be monitored by listening for xyChange events.
         */
        y: {
            setter: function(val) {
                this._setY(val);
            },
            getter: function() {
                return this._getY();
            },
            lazyAdd: false
        },

        /**
         * @attribute xy
         * @type Array
         * @default [0,0]
         *
         * @description Page XY co-ordinate pair for the widget.
         */
        xy: {
            value:[0,0],
            validator: function(val) {
                return this._validateXY(val);
            }
        }
    };

    /**
     * Default class used to mark the boundingBox of a positioned widget.
     *
     * @property POSITIONED_CLASS_NAME
     * @type String
     * @default "yui-widget-positioned"
     * @static
     */
    Position.POSITIONED_CLASS_NAME = Widget.getClassName(POSITIONED);

    Position.prototype = {

        /**
         * Creates/Initializes the DOM to support xy page positioning.
         * <p>
         * This method in invoked after renderUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _renderUIPosition
         * @protected
         */
        _renderUIPosition : function() {
            this._posNode.addClass(Position.POSITIONED_CLASS_NAME);
        },

        /**
         * Synchronizes the UI to match the Widgets xy page position state.
         * <p>
         * This method in invoked after syncUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _syncUIPosition
         * @protected
         */
        _syncUIPosition : function() {
            var posNode = this._posNode;
            if (posNode.getStyle(POSITION) === RELATIVE) {
                this.syncXY();
            }
            this._uiSetXY(this.get(XY_COORD));
        },

        /**
         * Binds event listeners responsible for updating the UI state in response to 
         * Widget position related state changes.
         * <p>
         * This method in invoked after bindUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _bindUIPosition
         * @protected
         */
        _bindUIPosition :function() {
            this.after(XYChange, this._afterXYChange);
        },

        /**
         * Moves the Widget to the specified page xy co-ordinate position.
         *
         * @method move
         *
         * @param {Number} x The new x position
         * @param {Number} y The new y position
         * <p>Or</p>
         * @param {Array} x, y values passed as an array ([x, y]), to support
         * simple pass through of Node.getXY results
         */
        move: function () {
            var args = arguments,
                coord = (Lang.isArray(args[0])) ? args[0] : [args[0], args[1]];
                this.set(XY_COORD, coord);
        },

        /**
         * Synchronizes the Panel's "xy", "x", and "y" properties with the 
         * Widget's position in the DOM.
         *
         * @method syncXY
         */
        syncXY : function () {
            this.set(XY_COORD, this._posNode.getXY(), {src: UI});
        },

        /**
         * Default validator for the XY attribute
         *
         * @method _validateXY
         * @protected
         * @param {Array} val The XY page co-ordinate value which is being set.
         * @return {boolean} true if valid, false if not.
         */
        _validateXY : function(val) {
            return (Lang.isArray(val) && Lang.isNumber(val[0]) && Lang.isNumber(val[1]));
        },

        /**
         * Default setter for the X attribute. The setter passes the X value through
         * to the XY attribute, which is the sole store for the XY state.
         *
         * @method _setX
         * @protected
         * @param {Number} val The X page co-ordinate value
         */
        _setX : function(val) {
            this.set(XY_COORD, [val, this.get(XY_COORD)[1]]);
        },

        /**
         * Default setter for the Y attribute. The setter passes the Y value through
         * to the XY attribute, which is the sole store for the XY state.
         *
         * @method _setY
         * @protected
         * @param {Number} val The Y page co-ordinate value
         */
        _setY : function(val) {
            this.set(XY_COORD, [this.get(XY_COORD)[0], val]);
        },

        /**
         * Default getter for the X attribute. The value is retrieved from 
         * the XY attribute, which is the sole store for the XY state.
         *
         * @method _getX
         * @protected 
         * @return {Number} The X page co-ordinate value
         */
        _getX : function() {
            return this.get(XY_COORD)[0];
        },

        /**
         * Default getter for the Y attribute. The value is retrieved from 
         * the XY attribute, which is the sole store for the XY state.
         *
         * @method _getY
         * @protected 
         * @return {Number} The Y page co-ordinate value
         */
        _getY : function() {
            return this.get(XY_COORD)[1];
        },

        /**
         * Default attribute change listener for the xy attribute, responsible
         * for updating the UI, in response to attribute changes.
         * 
         * @method _afterXYChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterXYChange : function(e) {
            if (e.src != UI) {
                this._uiSetXY(e.newVal);
            }
        },

        /**
         * Updates the UI to reflect the XY page co-ordinates passed in.
         * 
         * @method _uiSetXY
         * @protected
         * @param {String} val The XY page co-ordinates value to be reflected in the UI
         */
        _uiSetXY : function(val) {
            this._posNode.setXY(val);
        }
    };

    Y.WidgetPosition = Position;


}, '3.8.1', {"requires": ["base-build", "node-screen", "widget"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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
    function Stack(config) {
        this._stackNode = this.get(BOUNDING_BOX);
        this._stackHandles = {};

        // WIDGET METHOD OVERLAP
        Y.after(this._renderUIStack, this, RENDER_UI);
        Y.after(this._syncUIStack, this, SYNC_UI);
        Y.after(this._bindUIStack, this, BIND_UI);
    }

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


}, '3.8.1', {"requires": ["base-build", "widget"], "skinnable": true});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('matrix', function (Y, NAME) {

/**
 * Matrix utilities.
 *
 * @class MatrixUtil
 * @module matrix
 **/

var MatrixUtil = {
        /**
         * Used as value for the _rounding method.
         *
         * @property _rounder
         * @private
         */
        _rounder: 100000,

        /**
         * Rounds values
         *
         * @method _round
         * @private
         */
        _round: function(val) {
            val = Math.round(val * MatrixUtil._rounder) / MatrixUtil._rounder;
            return val;
        },
        /**
         * Converts a radian value to a degree.
         *
         * @method rad2deg
         * @param {Number} rad Radian value to be converted.
         * @return Number
         */
        rad2deg: function(rad) {
            var deg = rad * (180 / Math.PI);
            return deg;
        },

        /**
         * Converts a degree value to a radian.
         *
         * @method deg2rad
         * @param {Number} deg Degree value to be converted to radian.
         * @return Number
         */
        deg2rad: function(deg) {
            var rad = deg * (Math.PI / 180);
            return rad;
        },

        /**
         * Converts an angle to a radian
         *
         * @method angle2rad
         * @param {Objecxt} val Value to be converted to radian.
         * @return Number
         */
        angle2rad: function(val) {
            if (typeof val === 'string' && val.indexOf('rad') > -1) {
                val = parseFloat(val);
            } else { // default to deg
                val = MatrixUtil.deg2rad(parseFloat(val));
            }

            return val;
        },

        /**
         * Converts a transform object to an array of column vectors.
         *
         * /                                             \
         * | matrix[0][0]   matrix[1][0]    matrix[2][0] |
         * | matrix[0][1]   matrix[1][1]    matrix[2][1] |
         * | matrix[0][2]   matrix[1][2]    matrix[2][2] |
         * \                                             /
         *
         * @method getnxn
         * @return Array
         */
        convertTransformToArray: function(matrix)
        {
            var matrixArray = [
                    [matrix.a, matrix.c, matrix.dx],
                    [matrix.b, matrix.d, matrix.dy],
                    [0, 0, 1]
                ];
            return matrixArray;
        },

        /**
         * Returns the determinant of a given matrix.
         *
         * /                                             \
         * | matrix[0][0]   matrix[1][0]    matrix[2][0] |
         * | matrix[0][1]   matrix[1][1]    matrix[2][1] |
         * | matrix[0][2]   matrix[1][2]    matrix[2][2] |
         * | matrix[0][3]   matrix[1][3]    matrix[2][3] |
         * \                                             /
         *
         * @method getDeterminant
         * @param {Array} matrix An nxn matrix represented an array of vector (column) arrays. Each vector array has index for each row.
         * @return Number
         */
        getDeterminant: function(matrix)
        {
            var determinant = 0,
                len = matrix.length,
                i = 0,
                multiplier;

            if(len == 2)
            {
                return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
            }
            for(; i < len; ++i)
            {
                multiplier = matrix[i][0];
                if(i % 2 === 0 || i === 0)
                {
                    determinant += multiplier * MatrixUtil.getDeterminant(MatrixUtil.getMinors(matrix, i, 0));
                }
                else
                {
                    determinant -= multiplier * MatrixUtil.getDeterminant(MatrixUtil.getMinors(matrix, i, 0));
                }
            }
            return determinant;
        },

        /**
         * Returns the inverse of a matrix
         *
         * @method inverse
         * @param Array matrix An array representing an nxn matrix
         * @return Array
         *
         * /                                             \
         * | matrix[0][0]   matrix[1][0]    matrix[2][0] |
         * | matrix[0][1]   matrix[1][1]    matrix[2][1] |
         * | matrix[0][2]   matrix[1][2]    matrix[2][2] |
         * | matrix[0][3]   matrix[1][3]    matrix[2][3] |
         * \                                             /
         */
        inverse: function(matrix)
        {
            var determinant = 0,
                len = matrix.length,
                i = 0,
                j,
                inverse,
                adjunct = [],
                //vector representing 2x2 matrix
                minor = [];
            if(len === 2)
            {
                determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
                inverse = [
                    [matrix[1][1] * determinant, -matrix[1][0] * determinant],
                    [-matrix[0][1] * determinant, matrix[0][0] * determinant]
                ];
            }
            else
            {
                determinant = MatrixUtil.getDeterminant(matrix);
                for(; i < len; ++i)
                {
                    adjunct[i] = [];
                    for(j = 0; j < len; ++j)
                    {
                        minor = MatrixUtil.getMinors(matrix, j, i);
                        adjunct[i][j] = MatrixUtil.getDeterminant(minor);
                        if((i + j) % 2 !== 0 && (i + j) !== 0)
                        {
                            adjunct[i][j] *= -1;
                        }
                    }
                }
                inverse = MatrixUtil.scalarMultiply(adjunct, 1/determinant);
            }
            return inverse;
        },

        /**
         * Multiplies a matrix by a numeric value.
         *
         * @method scalarMultiply
         * @param {Array} matrix The matrix to be altered.
         * @param {Number} multiplier The number to multiply against the matrix.
         * @return Array
         */
        scalarMultiply: function(matrix, multiplier)
        {
            var i = 0,
                j,
                len = matrix.length;
            for(; i < len; ++i)
            {
                for(j = 0; j < len; ++j)
                {
                    matrix[i][j] = MatrixUtil._round(matrix[i][j] * multiplier);
                }
            }
            return matrix;
        },

        /**
         * Returns the transpose for an nxn matrix.
         *
         * @method transpose
         * @param matrix An nxn matrix represented by an array of vector arrays.
         * @return Array
         */
        transpose: function(matrix)
        {
            var len = matrix.length,
                i = 0,
                j = 0,
                transpose = [];
            for(; i < len; ++i)
            {
                transpose[i] = [];
                for(j = 0; j < len; ++j)
                {
                    transpose[i].push(matrix[j][i]);
                }
            }
            return transpose;
        },

        /**
         * Returns a matrix of minors based on a matrix, column index and row index.
         *
         * @method getMinors
         * @param {Array} matrix The matrix from which to extract the matrix of minors.
         * @param {Number} columnIndex A zero-based index representing the specified column to exclude.
         * @param {Number} rowIndex A zero-based index represeenting the specified row to exclude.
         * @return Array
         */
        getMinors: function(matrix, columnIndex, rowIndex)
        {
            var minors = [],
                len = matrix.length,
                i = 0,
                j,
                column;
            for(; i < len; ++i)
            {
                if(i !== columnIndex)
                {
                    column = [];
                    for(j = 0; j < len; ++j)
                    {
                        if(j !== rowIndex)
                        {
                            column.push(matrix[i][j]);
                        }
                    }
                    minors.push(column);
                }
            }
            return minors;
        },

        /**
         * Returns the sign of value
         *
         * @method sign
         * @param {Number} val value to be interpreted
         * @return Number
         */
        sign: function(val)
        {
            return val === 0 ? 1 : val/Math.abs(val);
        },

        /**
         * Multiplies a vector and a matrix
         *
         * @method vectorMatrixProduct
         * @param {Array} vector Array representing a column vector
         * @param {Array} matrix Array representing an nxn matrix
         * @return Array
         */
        vectorMatrixProduct: function(vector, matrix)
        {
            var i,
                j,
                len = vector.length,
                product = [],
                rowProduct;
            for(i = 0; i < len; ++i)
            {
                rowProduct = 0;
                for(j = 0; j < len; ++j)
                {
                    rowProduct += vector[i] * matrix[i][j];
                }
                product[i] = rowProduct;
            }
            return product;
        },

        /**
         * Breaks up a 2d transform matrix into a series of transform operations.
         *
         * @method decompose
         * @param {Array} 3x3 matrix array
         * @return Array
         */
        decompose: function(matrix)
        {
            var a = parseFloat(matrix[0][0]),
                b = parseFloat(matrix[1][0]),
                c = parseFloat(matrix[0][1]),
                d = parseFloat(matrix[1][1]),
                dx = parseFloat(matrix[0][2]),
                dy = parseFloat(matrix[1][2]),
                rotate,
                sx,
                sy,
                shear;
            if((a * d - b * c) === 0)
            {
                return false;
            }
            //get length of vector(ab)
            sx = MatrixUtil._round(Math.sqrt(a * a + b * b));
            //normalize components of vector(ab)
            a /= sx;
            b /= sx;
            shear = MatrixUtil._round(a * c + b * d);
            c -= a * shear;
            d -= b * shear;
            //get length of vector(cd)
            sy = MatrixUtil._round(Math.sqrt(c * c + d * d));
            //normalize components of vector(cd)
            c /= sy;
            d /= sy;
            shear /=sy;
            shear = MatrixUtil._round(MatrixUtil.rad2deg(Math.atan(shear)));
            rotate = MatrixUtil._round(MatrixUtil.rad2deg(Math.atan2(matrix[1][0], matrix[0][0])));

            return [
                ["translate", dx, dy],
                ["rotate", rotate],
                ["skewX", shear],
                ["scale", sx, sy]
            ];
        },

        /**
         * Parses a transform string and returns an array of transform arrays.
         *
         * @method getTransformArray
         * @param {String} val A transform string
         * @return Array
         */
        getTransformArray: function(transform) {
            var re = /\s*([a-z]*)\(([\w,\.,\-,\s]*)\)/gi,
                transforms = [],
                args,
                m,
                decomp,
                methods = MatrixUtil.transformMethods;

            while ((m = re.exec(transform))) {
                if (methods.hasOwnProperty(m[1]))
                {
                    args = m[2].split(',');
                    args.unshift(m[1]);
                    transforms.push(args);
                }
                else if(m[1] == "matrix")
                {
                    args = m[2].split(',');
                    decomp = MatrixUtil.decompose([
                        [args[0], args[2], args[4]],
                        [args[1], args[3], args[5]],
                        [0, 0, 1]
                    ]);
                    transforms.push(decomp[0]);
                    transforms.push(decomp[1]);
                    transforms.push(decomp[2]);
                    transforms.push(decomp[3]);
                }
            }
            return transforms;
        },

        /**
         * Returns an array of transform arrays representing transform functions and arguments.
         *
         * @method getTransformFunctionArray
         * @return Array
         */
        getTransformFunctionArray: function(transform) {
            var list;
            switch(transform)
            {
                case "skew" :
                    list = [transform, 0, 0];
                break;
                case "scale" :
                    list = [transform, 1, 1];
                break;
                case "scaleX" :
                    list = [transform, 1];
                break;
                case "scaleY" :
                    list = [transform, 1];
                break;
                case "translate" :
                    list = [transform, 0, 0];
                break;
                default :
                    list = [transform, 0];
                break;
            }
            return list;
        },

        /**
         * Compares to arrays or transform functions to ensure both contain the same functions in the same
         * order.
         *
         * @method compareTransformSequence
         * @param {Array} list1 Array to compare
         * @param {Array} list2 Array to compare
         * @return Boolean
         */
        compareTransformSequence: function(list1, list2)
        {
            var i = 0,
                len = list1.length,
                len2 = list2.length,
                isEqual = len === len2;
            if(isEqual)
            {
                for(; i < len; ++i)
                {
                    if(list1[i][0] != list2[i][0])
                    {
                        isEqual = false;
                        break;
                    }
                }
            }
            return isEqual;
        },

        /**
         * Mapping of possible transform method names.
         *
         * @property transformMethods
         * @type Object
         */
        transformMethods: {
            rotate: "rotate",
            skew: "skew",
            skewX: "skewX",
            skewY: "skewY",
            translate: "translate",
            translateX: "translateX",
            translateY: "tranlsateY",
            scale: "scale",
            scaleX: "scaleX",
            scaleY: "scaleY"
        }

};

Y.MatrixUtil = MatrixUtil;

/**
 * Matrix is a class that allows for the manipulation of a transform matrix.
 * This class is a work in progress.
 *
 * @class Matrix
 * @constructor
 * @module matrix
 */
var Matrix = function(config) {
    this.init(config);
};

Matrix.prototype = {
    /**
     * Used as value for the _rounding method.
     *
     * @property _rounder
     * @private
     */
    _rounder: 100000,

    /**
     * Updates the matrix.
     *
     * @method multiple
     * @param {Number} a
     * @param {Number} b
     * @param {Number} c
     * @param {Number} d
     * @param {Number} dx
     * @param {Number} dy
     */
    multiply: function(a, b, c, d, dx, dy) {
        var matrix = this,
            matrix_a = matrix.a * a + matrix.c * b,
            matrix_b = matrix.b * a + matrix.d * b,
            matrix_c = matrix.a * c + matrix.c * d,
            matrix_d = matrix.b * c + matrix.d * d,
            matrix_dx = matrix.a * dx + matrix.c * dy + matrix.dx,
            matrix_dy = matrix.b * dx + matrix.d * dy + matrix.dy;

        matrix.a = this._round(matrix_a);
        matrix.b = this._round(matrix_b);
        matrix.c = this._round(matrix_c);
        matrix.d = this._round(matrix_d);
        matrix.dx = this._round(matrix_dx);
        matrix.dy = this._round(matrix_dy);
        return this;
    },

    /**
     * Parses a string and updates the matrix.
     *
     * @method applyCSSText
     * @param {String} val A css transform string
     */
    applyCSSText: function(val) {
        var re = /\s*([a-z]*)\(([\w,\.,\-,\s]*)\)/gi,
            args,
            m;

        val = val.replace(/matrix/g, "multiply");
        while ((m = re.exec(val))) {
            if (typeof this[m[1]] === 'function') {
                args = m[2].split(',');
                this[m[1]].apply(this, args);
            }
        }
    },

    /**
     * Parses a string and returns an array of transform arrays.
     *
     * @method getTransformArray
     * @param {String} val A css transform string
     * @return Array
     */
    getTransformArray: function(val) {
        var re = /\s*([a-z]*)\(([\w,\.,\-,\s]*)\)/gi,
            transforms = [],
            args,
            m;

        val = val.replace(/matrix/g, "multiply");
        while ((m = re.exec(val))) {
            if (typeof this[m[1]] === 'function') {
                args = m[2].split(',');
                args.unshift(m[1]);
                transforms.push(args);
            }
        }
        return transforms;
    },

    /**
     * Default values for the matrix
     *
     * @property _defaults
     * @private
     */
    _defaults: {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        dx: 0,
        dy: 0
    },

    /**
     * Rounds values
     *
     * @method _round
     * @private
     */
    _round: function(val) {
        val = Math.round(val * this._rounder) / this._rounder;
        return val;
    },

    /**
     * Initializes a matrix.
     *
     * @method init
     * @param {Object} config Specified key value pairs for matrix properties. If a property is not explicitly defined in the config argument,
     * the default value will be used.
     */
    init: function(config) {
        var defaults = this._defaults,
            prop;

        config = config || {};

        for (prop in defaults) {
            if(defaults.hasOwnProperty(prop))
            {
                this[prop] = (prop in config) ? config[prop] : defaults[prop];
            }
        }

        this._config = config;
    },

    /**
     * Applies a scale transform
     *
     * @method scale
     * @param {Number} val
     */
    scale: function(x, y) {
        this.multiply(x, 0, 0, y, 0, 0);
        return this;
    },

    /**
     * Applies a skew transformation.
     *
     * @method skew
     * @param {Number} x The value to skew on the x-axis.
     * @param {Number} y The value to skew on the y-axis.
     */
    skew: function(x, y) {
        x = x || 0;
        y = y || 0;

        if (x !== undefined) { // null or undef
            x = Math.tan(this.angle2rad(x));

        }

        if (y !== undefined) { // null or undef
            y = Math.tan(this.angle2rad(y));
        }

        this.multiply(1, y, x, 1, 0, 0);
        return this;
    },

    /**
     * Applies a skew to the x-coordinate
     *
     * @method skewX
     * @param {Number} x x-coordinate
     */
    skewX: function(x) {
        this.skew(x);
        return this;
    },

    /**
     * Applies a skew to the y-coordinate
     *
     * @method skewY
     * @param {Number} y y-coordinate
     */
    skewY: function(y) {
        this.skew(null, y);
        return this;
    },

    /**
     * Returns a string of text that can be used to populate a the css transform property of an element.
     *
     * @method toCSSText
     * @return String
     */
    toCSSText: function() {
        var matrix = this,
            text = 'matrix(' +
                    matrix.a + ',' +
                    matrix.b + ',' +
                    matrix.c + ',' +
                    matrix.d + ',' +
                    matrix.dx + ',' +
                    matrix.dy + ')';
        return text;
    },

    /**
     * Returns a string that can be used to populate the css filter property of an element.
     *
     * @method toFilterText
     * @return String
     */
    toFilterText: function() {
        var matrix = this,
            text = 'progid:DXImageTransform.Microsoft.Matrix(';
        text +=     'M11=' + matrix.a + ',' +
                    'M21=' + matrix.b + ',' +
                    'M12=' + matrix.c + ',' +
                    'M22=' + matrix.d + ',' +
                    'sizingMethod="auto expand")';

        text += '';

        return text;
    },

    /**
     * Converts a radian value to a degree.
     *
     * @method rad2deg
     * @param {Number} rad Radian value to be converted.
     * @return Number
     */
    rad2deg: function(rad) {
        var deg = rad * (180 / Math.PI);
        return deg;
    },

    /**
     * Converts a degree value to a radian.
     *
     * @method deg2rad
     * @param {Number} deg Degree value to be converted to radian.
     * @return Number
     */
    deg2rad: function(deg) {
        var rad = deg * (Math.PI / 180);
        return rad;
    },

    angle2rad: function(val) {
        if (typeof val === 'string' && val.indexOf('rad') > -1) {
            val = parseFloat(val);
        } else { // default to deg
            val = this.deg2rad(parseFloat(val));
        }

        return val;
    },

    /**
     * Applies a rotate transform.
     *
     * @method rotate
     * @param {Number} deg The degree of the rotation.
     */
    rotate: function(deg, x, y) {
        var rad = this.angle2rad(deg),
            sin = Math.sin(rad),
            cos = Math.cos(rad);
        this.multiply(cos, sin, 0 - sin, cos, 0, 0);
        return this;
    },

    /**
     * Applies translate transformation.
     *
     * @method translate
     * @param {Number} x The value to transate on the x-axis.
     * @param {Number} y The value to translate on the y-axis.
     */
    translate: function(x, y) {
        x = parseFloat(x) || 0;
        y = parseFloat(y) || 0;
        this.multiply(1, 0, 0, 1, x, y);
        return this;
    },

    /**
     * Applies a translate to the x-coordinate
     *
     * @method translateX
     * @param {Number} x x-coordinate
     */
    translateX: function(x) {
        this.translate(x);
        return this;
    },

    /**
     * Applies a translate to the y-coordinate
     *
     * @method translateY
     * @param {Number} y y-coordinate
     */
    translateY: function(y) {
        this.translate(null, y);
        return this;
    },


    /**
     * Returns an identity matrix.
     *
     * @method identity
     * @return Object
     */
    identity: function() {
        var config = this._config,
            defaults = this._defaults,
            prop;

        for (prop in config) {
            if (prop in defaults) {
                this[prop] = defaults[prop];
            }
        }
        return this;
    },

    /**
     * Returns a 3x3 Matrix array
     *
     * /                                             \
     * | matrix[0][0]   matrix[1][0]    matrix[2][0] |
     * | matrix[0][1]   matrix[1][1]    matrix[2][1] |
     * | matrix[0][2]   matrix[1][2]    matrix[2][2] |
     * \                                             /
     *
     * @method getMatrixArray
     * @return Array
     */
    getMatrixArray: function()
    {
        var matrix = this,
            matrixArray = [
                [matrix.a, matrix.c, matrix.dx],
                [matrix.b, matrix.d, matrix.dy],
                [0, 0, 1]
            ];
        return matrixArray;
    },

    /**
     * Returns the left, top, right and bottom coordinates for a transformed
     * item.
     *
     * @method getContentRect
     * @param {Number} width The width of the item.
     * @param {Number} height The height of the item.
     * @param {Number} x The x-coordinate of the item.
     * @param {Number} y The y-coordinate of the item.
     * @return Object
     */
    getContentRect: function(width, height, x, y)
    {
        var left = !isNaN(x) ? x : 0,
            top = !isNaN(y) ? y : 0,
            right = left + width,
            bottom = top + height,
            matrix = this,
            a = matrix.a,
            b = matrix.b,
            c = matrix.c,
            d = matrix.d,
            dx = matrix.dx,
            dy = matrix.dy,
            x1 = (a * left + c * top + dx),
            y1 = (b * left + d * top + dy),
            //[x2, y2]
            x2 = (a * right + c * top + dx),
            y2 = (b * right + d * top + dy),
            //[x3, y3]
            x3 = (a * left + c * bottom + dx),
            y3 = (b * left + d * bottom + dy),
            //[x4, y4]
            x4 = (a * right + c * bottom + dx),
            y4 = (b * right + d * bottom + dy);
        return {
            left: Math.min(x3, Math.min(x1, Math.min(x2, x4))),
            right: Math.max(x3, Math.max(x1, Math.max(x2, x4))),
            top: Math.min(y2, Math.min(y4, Math.min(y3, y1))),
            bottom: Math.max(y2, Math.max(y4, Math.max(y3, y1)))
        };
    },

    /**
     * Returns the determinant of the matrix.
     *
     * @method getDeterminant
     * @return Number
     */
    getDeterminant: function()
    {
        return Y.MatrixUtil.getDeterminant(this.getMatrixArray());
    },

    /**
     * Returns the inverse (in array form) of the matrix.
     *
     * @method inverse
     * @return Array
     */
    inverse: function()
    {
        return Y.MatrixUtil.inverse(this.getMatrixArray());
    },

    /**
     * Returns the transpose of the matrix
     *
     * @method transpose
     * @return Array
     */
    transpose: function()
    {
        return Y.MatrixUtil.transpose(this.getMatrixArray());
    },

    /**
     * Returns an array of transform commands that represent the matrix.
     *
     * @method decompose
     * @return Array
     */
    decompose: function()
    {
        return Y.MatrixUtil.decompose(this.getMatrixArray());
    }
};

Y.Matrix = Matrix;


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('graphics', function (Y, NAME) {

/**
 *
 * <p>The `Graphics` module provides a JavaScript API for creating shapes in a variety of formats across
 * a <a href="http://developer.yahoo.com/yui/articles/gbs">browser test baseline</a>.
 * Based on device and browser capabilities, `Graphics` leverages <a href="http://www.w3.org/TR/SVG/">SVG</a>,
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> and <a href="http://www.w3.org/TR/NOTE-VML">VML</a>
 * to render its graphical elements.</p>
 *
 * <p>The `Graphics` module features a <a href="../classes/Graphic.html">`Graphic`</a> class that allows you to easily create and manage shapes.
 * Currently, a <a href="../classes/Graphic.html">`Graphic`</a> instance can be used to create predifined shapes and free-form polygons with fill
 * and stroke properties.</p>
 *
 * <p>The `Graphics` module normalizes an API through the use of alias and implementation classes that share
 * interfaces. Each alias class points to an appropriate implementation class dependent on the browser's
 * capabilities. There should rarely, if ever, be a need to interact directly with an implementation class.</p>
 *
 * <p>Below is a list of available classes.
 *     <ul>
 *         <li><a href="../classes/Graphic.html">`Graphic`</a>
 *         <li><a href="../classes/Shape.html">`Shape`</a>
 *         <li><a href="../classes/Circle.html">`Circle`</a>
 *         <li><a href="../classes/Ellipse.html">`Ellipse`</a>
 *         <li><a href="../classes/Rect.html">`Rect`</a>
 *         <li><a href="../classes/Path.html">`Path`</a>
 *     </ul>
 * You can also extend the `Shape` class to create your own custom shape classes.</p>
 * @module graphics
 * @main graphics
 */
var SETTER = "setter",
	PluginHost = Y.Plugin.Host,
    VALUE = "value",
    VALUEFN = "valueFn",
    READONLY = "readOnly",
    Y_LANG = Y.Lang,
    STR = "string",
    WRITE_ONCE = "writeOnce",
    GraphicBase,
    AttributeLite;

    /**
	 * AttributeLite provides Attribute-like getters and setters for shape classes in the Graphics module.
     * It provides a get/set API without the event infastructure. This class is temporary and a work in progress.
	 *
	 * @class AttributeLite
	 * @constructor
	 */
    AttributeLite = function()
    {
        var host = this; // help compression

        // Perf tweak - avoid creating event literals if not required.
        host._ATTR_E_FACADE = {};

        Y.EventTarget.call(this, {emitFacade:true});
        host._state = {};
        host.prototype = Y.mix(AttributeLite.prototype, host.prototype);
    };

    AttributeLite.prototype = {
		/**
		 * Initializes the attributes for a shape. If an attribute config is passed into the constructor of the host,
		 * the initial values will be overwritten.
		 *
		 * @method addAttrs
		 * @param {Object} cfg Optional object containing attributes key value pairs to be set.
		 */
		addAttrs: function(cfg)
		{
			var host = this,
				attrConfig = this.constructor.ATTRS,
				attr,
				i,
				fn,
				state = host._state;
			for(i in attrConfig)
			{
				if(attrConfig.hasOwnProperty(i))
				{
					attr = attrConfig[i];
					if(attr.hasOwnProperty(VALUE))
					{
						state[i] = attr.value;
					}
					else if(attr.hasOwnProperty(VALUEFN))
					{
						fn = attr.valueFn;
						if(Y_LANG.isString(fn))
						{
							state[i] = host[fn].apply(host);
						}
						else
						{
							state[i] = fn.apply(host);
						}
					}
                }
            }
			host._state = state;
            for(i in attrConfig)
			{
				if(attrConfig.hasOwnProperty(i))
				{
					attr = attrConfig[i];
                    if(attr.hasOwnProperty(READONLY) && attr.readOnly)
					{
						continue;
					}

					if(attr.hasOwnProperty(WRITE_ONCE) && attr.writeOnce)
					{
						attr.readOnly = true;
					}

					if(cfg && cfg.hasOwnProperty(i))
					{
						if(attr.hasOwnProperty(SETTER))
						{
							host._state[i] = attr.setter.apply(host, [cfg[i]]);
						}
						else
						{
							host._state[i] = cfg[i];
						}
					}
				}
			}
		},

        /**
         * For a given item, returns the value of the property requested, or undefined if not found.
         *
         * @method get
         * @param name {String} The name of the item
         * @return {Any} The value of the supplied property.
         */
        get: function(attr)
        {
            var host = this,
                getter,
                attrConfig = host.constructor.ATTRS;
            if(attrConfig && attrConfig[attr])
            {
                getter = attrConfig[attr].getter;
                if(getter)
                {
                    if(typeof getter == STR)
                    {
                        return host[getter].apply(host);
                    }
                    return attrConfig[attr].getter.apply(host);
                }

                return host._state[attr];
            }
            return null;
        },

        /**
         * Sets the value of an attribute.
         *
         * @method set
         * @param {String|Object} name The name of the attribute. Alternatively, an object of key value pairs can
         * be passed in to set multiple attributes at once.
         * @param {Any} value The value to set the attribute to. This value is ignored if an object is received as
         * the name param.
         */
        set: function(attr, val)
        {
            var i;
            if(Y_LANG.isObject(attr))
            {
                for(i in attr)
                {
                    if(attr.hasOwnProperty(i))
                    {
                        this._set(i, attr[i]);
                    }
                }
            }
            else
            {
                this._set.apply(this, arguments);
            }
        },

		/**
         * Provides setter logic. Used by `set`.
         *
         * @method _set
         * @param {String|Object} name The name of the attribute. Alternatively, an object of key value pairs can
         * be passed in to set multiple attributes at once.
         * @param {Any} value The value to set the attribute to. This value is ignored if an object is received as
         * the name param.
		 * @protected
		 */
		_set: function(attr, val)
		{
			var host = this,
				setter,
				args,
				attrConfig = host.constructor.ATTRS;
			if(attrConfig && attrConfig.hasOwnProperty(attr))
			{
				setter = attrConfig[attr].setter;
				if(setter)
				{
					args = [val];
					if(typeof setter == STR)
					{
						val = host[setter].apply(host, args);
					}
					else
                    {
                        val = attrConfig[attr].setter.apply(host, args);
                    }
				}
				host._state[attr] = val;
			}
		}
	};
    Y.mix(AttributeLite, Y.EventTarget, false, null, 1);
	Y.AttributeLite = AttributeLite;

    /**
     * GraphicBase serves as the base class for the graphic layer. It serves the same purpose as
     * Base but uses a lightweight getter/setter class instead of Attribute.
     * This class is temporary and a work in progress.
     *
     * @class GraphicBase
     * @constructor
     * @param {Object} cfg Key value pairs for attributes
     */
    GraphicBase = function(cfg)
    {
        var host = this,
            PluginHost = Y.Plugin && Y.Plugin.Host;
        if (host._initPlugins && PluginHost) {
            PluginHost.call(host);
        }

        host.name = host.constructor.NAME;
        host._eventPrefix = host.constructor.EVENT_PREFIX || host.constructor.NAME;
        AttributeLite.call(host);
        host.addAttrs(cfg);
        host.init.apply(this, arguments);
        if (host._initPlugins) {
            // Need to initPlugins manually, to handle constructor parsing, static Plug parsing
            host._initPlugins(cfg);
        }
        host.initialized = true;
    };

    GraphicBase.NAME = "baseGraphic";

    GraphicBase.prototype = {
        /**
         * Init method, invoked during construction.
         * Fires an init event after calling `initializer` on implementers.
         *
         * @method init
         * @protected
         */
        init: function()
        {
            this.publish("init", {
                fireOnce:true
            });
            this.initializer.apply(this, arguments);
            this.fire("init", {cfg: arguments[0]});
        },

        /**
         * Camel case concatanates two strings.
         *
         * @method _camelCaseConcat
         * @param {String} prefix The first string
         * @param {String} name The second string
         * @return String
         * @private
         */
        _camelCaseConcat: function(prefix, name)
        {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
    };
//Straightup augment, no wrapper functions
Y.mix(GraphicBase, Y.AttributeLite, false, null, 1);
Y.mix(GraphicBase, PluginHost, false, null, 1);
GraphicBase.prototype.constructor = GraphicBase;
GraphicBase.plug = PluginHost.plug;
GraphicBase.unplug = PluginHost.unplug;
Y.GraphicBase = GraphicBase;


/**
 * `Drawing` provides a set of drawing methods used by `Path` and custom shape classes.
 * `Drawing` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGDrawing.html">`SVGDrawing`</a></li>
 *      <li><a href="VMLDrawing.html">`VMLDrawing`</a></li>
 *      <li><a href="CanvasDrawing.html">`CanvasDrawing`</a></li>
 *  </ul>
 *
 * @class Drawing
 * @constructor
 */
    /**
     * Draws a line segment using the current line style from the current drawing position to the specified x and y coordinates.
     *
     * @method lineTo
     * @param {Number} point1 x-coordinate for the end point.
     * @param {Number} point2 y-coordinate for the end point.
     */
    /**
     * Moves the current drawing position to specified x and y coordinates.
     *
     * @method moveTo
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    /**
     * Draws a bezier curve.
     *
     * @method curveTo
     * @param {Number} cp1x x-coordinate for the first control point.
     * @param {Number} cp1y y-coordinate for the first control point.
     * @param {Number} cp2x x-coordinate for the second control point.
     * @param {Number} cp2y y-coordinate for the second control point.
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    /**
     * Draws a quadratic bezier curve.
     *
     * @method quadraticCurveTo
     * @param {Number} cpx x-coordinate for the control point.
     * @param {Number} cpy y-coordinate for the control point.
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    /**
     * Draws a rectangle.
     *
     * @method drawRect
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @param {Number} w width
     * @param {Number} h height
     */
    /**
     * Draws a rectangle with rounded corners.
     *
     * @method drawRoundRect
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @param {Number} w width
     * @param {Number} h height
     * @param {Number} ew width of the ellipse used to draw the rounded corners
     * @param {Number} eh height of the ellipse used to draw the rounded corners
     */
    /**
     * Completes a drawing operation.
     *
     * @method end
     */
    /**
     * Clears the path.
     *
     * @method clear
     */
/**
 *  <p>Base class for creating shapes.</p>
 *  <p>`Shape` is an abstract class and is not meant to be used directly. The following classes extend
 *  `Shape`.
 *
 *  <ul>
 *      <li><a href="Circle.html">`Circle`</a></li>
 *      <li><a href="Ellipse.html">`Ellipse`</a></li>
 *      <li><a href="Rect.html">`Rect`</a></li>
 *      <li><a href="Path.html">`Path`</a></li>
 *  </ul>
 *
 * `Shape` can also be extended to create custom shape classes.</p>
 *
 * `Shape` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGShape.html">`SVGShape`</a></li>
 *      <li><a href="VMLShape.html">`VMLShape`</a></li>
 *      <li><a href="CanvasShape.html">`CanvasShape`</a></li>
 *  </ul>
 *
 * It is not necessary to interact with these classes directly. `Shape` will point to the appropriate implemention.</p>
 *
 * @class Shape
 * @constructor
 * @param {Object} cfg (optional) Attribute configs
 */
    /**
     * Init method, invoked during construction.
     * Calls `initializer` method.
     *
     * @method init
     * @protected
     */
	/**
	 * Initializes the shape
	 *
	 * @private
	 * @method initializer
	 */
	/**
	 * Add a class name to each node.
	 *
	 * @method addClass
	 * @param {String} className the class name to add to the node's class attribute
	 */
	/**
	 * Removes a class name from each node.
	 *
	 * @method removeClass
	 * @param {String} className the class name to remove from the node's class attribute
	 */
	/**
	 * Gets the current position of the node in page coordinates.
	 *
	 * @method getXY
	 * @return Array The XY position of the shape.
	 */
	/**
	 * Set the position of the shape in page coordinates, regardless of how the node is positioned.
	 *
	 * @method setXY
	 * @param {Array} Contains x & y values for new position (coordinates are page-based)
	 */
	/**
	 * Determines whether the node is an ancestor of another HTML element in the DOM hierarchy.
	 *
	 * @method contains
	 * @param {Shape | HTMLElement} needle The possible node or descendent
	 * @return Boolean Whether or not this shape is the needle or its ancestor.
	 */
	/**
	 * Compares nodes to determine if they match.
	 * Node instances can be compared to each other and/or HTMLElements.
	 * @method compareTo
	 * @param {HTMLElement | Node} refNode The reference node to compare to the node.
	 * @return {Boolean} True if the nodes match, false if they do not.
	 */
	/**
	 * Test if the supplied node matches the supplied selector.
	 *
	 * @method test
	 * @param {String} selector The CSS selector to test against.
	 * @return Boolean Wheter or not the shape matches the selector.
	 */
    /**
     * Sets the value of an attribute.
     *
     * @method set
     * @param {String|Object} name The name of the attribute. Alternatively, an object of key value pairs can
     * be passed in to set multiple attributes at once.
     * @param {Any} value The value to set the attribute to. This value is ignored if an object is received as
     * the name param.
     */
	/**
	 * Specifies a 2d translation.
	 *
	 * @method translate
	 * @param {Number} x The value to transate on the x-axis.
	 * @param {Number} y The value to translate on the y-axis.
	 */
	/**
	 * Translates the shape along the x-axis. When translating x and y coordinates,
	 * use the `translate` method.
	 *
	 * @method translateX
	 * @param {Number} x The value to translate.
	 */
	/**
	 * Translates the shape along the y-axis. When translating x and y coordinates,
	 * use the `translate` method.
	 *
	 * @method translateY
	 * @param {Number} y The value to translate.
	 */
    /**
     * Skews the shape around the x-axis and y-axis.
     *
     * @method skew
     * @param {Number} x The value to skew on the x-axis.
     * @param {Number} y The value to skew on the y-axis.
     */
	/**
	 * Skews the shape around the x-axis.
	 *
	 * @method skewX
	 * @param {Number} x x-coordinate
	 */
	/**
	 * Skews the shape around the y-axis.
	 *
	 * @method skewY
	 * @param {Number} y y-coordinate
	 */
	/**
	 * Rotates the shape clockwise around it transformOrigin.
	 *
	 * @method rotate
	 * @param {Number} deg The degree of the rotation.
	 */
	/**
	 * Specifies a 2d scaling operation.
	 *
	 * @method scale
	 * @param {Number} val
	 */
	/**
	 * Returns the bounds for a shape.
	 *
     * Calculates the a new bounding box from the original corner coordinates (base on size and position) and the transform matrix.
     * The calculated bounding box is used by the graphic instance to calculate its viewBox.
     *
	 * @method getBounds
	 * @return Object
	 */
    /**
     * Destroys the instance.
     *
     * @method destroy
     */
	/**
	 * An array of x, y values which indicates the transformOrigin in which to rotate the shape. Valid values range between 0 and 1 representing a
	 * fraction of the shape's corresponding bounding box dimension. The default value is [0.5, 0.5].
	 *
	 * @config transformOrigin
	 * @type Array
	 */
    /**
     * <p>A string containing, in order, transform operations applied to the shape instance. The `transform` string can contain the following values:
     *
     *    <dl>
     *        <dt>rotate</dt><dd>Rotates the shape clockwise around it transformOrigin.</dd>
     *        <dt>translate</dt><dd>Specifies a 2d translation.</dd>
     *        <dt>skew</dt><dd>Skews the shape around the x-axis and y-axis.</dd>
     *        <dt>scale</dt><dd>Specifies a 2d scaling operation.</dd>
     *        <dt>translateX</dt><dd>Translates the shape along the x-axis.</dd>
     *        <dt>translateY</dt><dd>Translates the shape along the y-axis.</dd>
     *        <dt>skewX</dt><dd>Skews the shape around the x-axis.</dd>
     *        <dt>skewY</dt><dd>Skews the shape around the y-axis.</dd>
     *        <dt>matrix</dt><dd>Specifies a 2D transformation matrix comprised of the specified six values.</dd>
     *    </dl>
     * </p>
     * <p>Applying transforms through the transform attribute will reset the transform matrix and apply a new transform. The shape class also contains
     * corresponding methods for each transform that will apply the transform to the current matrix. The below code illustrates how you might use the
     * `transform` attribute to instantiate a recangle with a rotation of 45 degrees.</p>
            var myRect = new Y.Rect({
                type:"rect",
                width: 50,
                height: 40,
                transform: "rotate(45)"
            };
     * <p>The code below would apply `translate` and `rotate` to an existing shape.</p>

        myRect.set("transform", "translate(40, 50) rotate(45)");
	 * @config transform
     * @type String
	 */
	/**
	 * Unique id for class instance.
	 *
	 * @config id
	 * @type String
	 */
	/**
	 * Indicates the x position of shape.
	 *
	 * @config x
	 * @type Number
	 */
	/**
	 * Indicates the y position of shape.
	 *
	 * @config y
	 * @type Number
	 */
	/**
	 * Indicates the width of the shape
	 *
	 * @config width
	 * @type Number
	 */
	/**
	 * Indicates the height of the shape
	 *
	 * @config height
	 * @type Number
	 */
	/**
	 * Indicates whether the shape is visible.
	 *
	 * @config visible
	 * @type Boolean
	 */
	/**
	 * Contains information about the fill of the shape.
     *  <dl>
     *      <dt>color</dt><dd>The color of the fill.</dd>
     *      <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the fill. The default value is 1.</dd>
     *      <dt>type</dt><dd>Type of fill.
     *          <dl>
     *              <dt>solid</dt><dd>Solid single color fill. (default)</dd>
     *              <dt>linear</dt><dd>Linear gradient fill.</dd>
     *              <dt>radial</dt><dd>Radial gradient fill.</dd>
     *          </dl>
     *      </dd>
     *  </dl>
     *  <p>If a `linear` or `radial` is specified as the fill type. The following additional property is used:
     *  <dl>
     *      <dt>stops</dt><dd>An array of objects containing the following properties:
     *          <dl>
     *              <dt>color</dt><dd>The color of the stop.</dd>
     *              <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the stop. The default value is 1.
     *              Note: No effect for IE 6 - 8</dd>
     *              <dt>offset</dt><dd>Number between 0 and 1 indicating where the color stop is positioned.</dd>
     *          </dl>
     *      </dd>
     *      <p>Linear gradients also have the following property:</p>
     *      <dt>rotation</dt><dd>Linear gradients flow left to right by default. The rotation property allows you to change the
     *      flow by rotation. (e.g. A rotation of 180 would make the gradient pain from right to left.)</dd>
     *      <p>Radial gradients have the following additional properties:</p>
     *      <dt>r</dt><dd>Radius of the gradient circle.</dd>
     *      <dt>fx</dt><dd>Focal point x-coordinate of the gradient.</dd>
     *      <dt>fy</dt><dd>Focal point y-coordinate of the gradient.</dd>
     *      <dt>cx</dt><dd>
     *          <p>The x-coordinate of the center of the gradient circle. Determines where the color stop begins. The default value 0.5.</p>
     *          <p><strong>Note: </strong>Currently, this property is not implemented for corresponding `CanvasShape` and
     *          `VMLShape` classes which are used on Android or IE 6 - 8.</p>
     *      </dd>
     *      <dt>cy</dt><dd>
     *          <p>The y-coordinate of the center of the gradient circle. Determines where the color stop begins. The default value 0.5.</p>
     *          <p><strong>Note: </strong>Currently, this property is not implemented for corresponding `CanvasShape` and `VMLShape`
     *          classes which are used on Android or IE 6 - 8.</p>
     *      </dd>
     *  </dl>
	 *
	 * @config fill
	 * @type Object
	 */
	/**
	 * Contains information about the stroke of the shape.
     *  <dl>
     *      <dt>color</dt><dd>The color of the stroke.</dd>
     *      <dt>weight</dt><dd>Number that indicates the width of the stroke.</dd>
     *      <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the stroke. The default value is 1.</dd>
     *      <dt>dashstyle</dt>Indicates whether to draw a dashed stroke. When set to "none", a solid stroke is drawn. When set
     *      to an array, the first index indicates the length of the dash. The second index indicates the length of gap.
     *      <dt>linecap</dt><dd>Specifies the linecap for the stroke. The following values can be specified:
     *          <dl>
     *              <dt>butt (default)</dt><dd>Specifies a butt linecap.</dd>
     *              <dt>square</dt><dd>Specifies a sqare linecap.</dd>
     *              <dt>round</dt><dd>Specifies a round linecap.</dd>
     *          </dl>
     *      </dd>
     *      <dt>linejoin</dt><dd>Specifies a linejoin for the stroke. The following values can be specified:
     *          <dl>
     *              <dt>round (default)</dt><dd>Specifies that the linejoin will be round.</dd>
     *              <dt>bevel</dt><dd>Specifies a bevel for the linejoin.</dd>
     *              <dt>miter limit</dt><dd>An integer specifying the miter limit of a miter linejoin. If you want to specify a linejoin
     *              of miter, you simply specify the limit as opposed to having separate miter and miter limit values.</dd>
     *          </dl>
     *      </dd>
     *  </dl>
	 *
	 * @config stroke
	 * @type Object
	 */
	/**
	 * Dom node for the shape.
	 *
	 * @config node
	 * @type HTMLElement
	 * @readOnly
	 */
    /**
     * Represents an SVG Path string. This will be parsed and added to shape's API to represent the SVG data across all
     * implementations. Note that when using VML or SVG implementations, part of this content will be added to the DOM using
     * respective VML/SVG attributes. If your content comes from an untrusted source, you will need to ensure that no
     * malicious code is included in that content.
     *
     * @config data
     * @type String
     */
	/**
	 * Reference to the parent graphic instance
	 *
	 * @config graphic
	 * @type Graphic
	 * @readOnly
	 */

/**
 * <p>Creates circle shape with editable attributes.</p>
 * <p>`Circle` instances can be created using the <a href="Graphic.html#method_addShape">`addShape`</a> method of the
 * <a href="Graphic.html">`Graphic`</a> class. The method's `cfg` argument contains a `type` attribute. Assigning "circle"
 * or `Y.Circle` to this attribute will create a `Circle` instance. Required attributes for instantiating a `Circle` are
 * `type` and `radius`. Optional attributes include:
 *  <ul>
 *      <li><a href="#attr_fill">fill</a></li>
 *      <li><a href="#attr_id">id</a></li>
 *      <li><a href="#attr_stroke">stroke</a></li>
 *      <li><a href="#attr_transform">transform</a></li>
 *      <li><a href="#attr_transformOrigin">transformOrigin</a></li>
 *      <li><a href="#attr_visible">visible</a></li>
 *      <li><a href="#attr_x">x</a></li>
 *      <li><a href="#attr_y">y</a></li>
 *  </ul>
 *
 * The below code creates a circle by defining the `type` attribute as "circle":</p>

        var myCircle = myGraphic.addShape({
            type: "circle",
            radius: 10,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });

 * Below, this same circle is created by defining the `type` attribute with a class reference:
 *
        var myCircle = myGraphic.addShape({
            type: Y.Circle,
            radius: 10,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });
 *
 * <p>`Circle` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGCircle.html">`SVGCircle`</a></li>
 *      <li><a href="VMLCircle.html">`VMLCircle`</a></li>
 *      <li><a href="CanvasCircle.html">`CanvasCircle`</a></li>
 *  </ul>
 *
 * It is not necessary to interact with these classes directly. `Circle` will point to the appropriate implemention.</p>
 *
 * @class Circle
 * @extends Shape
 * @constructor
 */
    /**
     * Radius of the circle
     *
     * @config radius
     * @type Number
     */
/**
 * <p>Creates an ellipse shape with editable attributes.</p>
 * <p>`Ellipse` instances can be created using the <a href="Graphic.html#method_addShape">`addShape`</a> method of the
 * <a href="Graphic.html">`Graphic`</a> class. The method's `cfg` argument contains a `type` attribute. Assigning "ellipse"
 * or `Y.Ellipse` to this attribute will create a `Ellipse` instance. Required attributes for instantiating a `Ellipse` are
 * `type`, `width` and `height`. Optional attributes include:
 *  <ul>
 *      <li><a href="#attr_fill">fill</a></li>
 *      <li><a href="#attr_id">id</a></li>
 *      <li><a href="#attr_stroke">stroke</a></li>
 *      <li><a href="#attr_transform">transform</a></li>
 *      <li><a href="#attr_transformOrigin">transformOrigin</a></li>
 *      <li><a href="#attr_visible">visible</a></li>
 *      <li><a href="#attr_x">x</a></li>
 *      <li><a href="#attr_y">y</a></li>
 *  </ul>
 *
 * The below code creates an ellipse by defining the `type` attribute as "ellipse":</p>

        var myEllipse = myGraphic.addShape({
            type: "ellipse",
            width: 20,
            height: 10,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });

 * Below, the same ellipse is created by defining the `type` attribute with a class reference:
 *
        var myEllipse = myGraphic.addShape({
            type: Y.Ellipse,
            width: 20,
            height: 10,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });
 *
 * <p>`Ellipse` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGEllipse.html">`SVGEllipse`</a></li>
 *      <li><a href="VMLEllipse.html">`VMLEllipse`</a></li>
 *      <li><a href="CanvasEllipse.html">`CanvasEllipse`</a></li>
 *  </ul>
 *
 * It is not necessary to interact with these classes directly. `Ellipse` will point to the appropriate implemention.</p>
 *
 * @class Ellipse
 * @extends Shape
 * @constructor
 */
/**
 * <p>Creates an rectangle shape with editable attributes.</p>
 * <p>`Rect` instances can be created using the <a href="Graphic.html#method_addShape">`addShape`</a> method of the
 * <a href="Graphic.html">`Graphic`</a> class. The method's `cfg` argument contains a `type` attribute. Assigning "rect"
 * or `Y.Rect` to this attribute will create a `Rect` instance. Required attributes for instantiating a `Rect` are `type`,
 * `width` and `height`. Optional attributes include:
 *  <ul>
 *      <li><a href="#attr_fill">fill</a></li>
 *      <li><a href="#attr_id">id</a></li>
 *      <li><a href="#attr_stroke">stroke</a></li>
 *      <li><a href="#attr_transform">transform</a></li>
 *      <li><a href="#attr_transformOrigin">transformOrigin</a></li>
 *      <li><a href="#attr_visible">visible</a></li>
 *      <li><a href="#attr_x">x</a></li>
 *      <li><a href="#attr_y">y</a></li>
 *  </ul>
 *
 * The below code creates a rectangle by defining the `type` attribute as "rect":</p>

        var myRect = myGraphic.addShape({
            type: "rect",
            width: 20,
            height: 10,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });

 * Below, the same rectangle is created by defining the `type` attribute with a class reference:
 *
        var myRect = myGraphic.addShape({
            type: Y.Rect,
            width: 20,
            height: 10,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });
 *
 * <p>`Rect` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGRect.html">`SVGRect`</a></li>
 *      <li><a href="VMLRect.html">`VMLRect`</a></li>
 *      <li><a href="CanvasRect.html">`CanvasRect`</a></li>
 *  </ul>
 *
 * It is not necessary to interact with these classes directly. `Rect` will point to the appropriate implemention.</p>
 *
 * @class Rect
 * @extends Shape
 * @constructor
 */
/**
 * <p>The `Path` class creates a shape through the use of drawing methods. The `Path` class has the following drawing methods available:</p>
 *  <ul>
 *      <li><a href="#method_clear">`clear`</a></li>
 *      <li><a href="#method_curveTo">`curveTo`</a></li>
 *      <li><a href="#method_drawRect">`drawRect`</a></li>
 *      <li><a href="#method_drawRoundRect">`drawRoundRect`</a></li>
 *      <li><a href="#method_end">`end`</a></li>
 *      <li><a href="#method_lineTo">`lineTo`</a></li>
 *      <li><a href="#method_moveTo">`moveTo`</a></li>
 *      <li><a href="#method_quadraticCurveTo">`quadraticCurveTo`</a></li>
 *  </ul>
 *
 *  <p>Like other shapes, `Path` elements are created using the <a href="Graphic.html#method_addShape">`addShape`</a>
 *  method of the <a href="Graphic.html">`Graphic`</a> class. The method's `cfg` argument contains a `type` attribute.
 *  Assigning "path" or `Y.Path` to this attribute will create a `Path` instance. After instantiation, a series of drawing
 *  operations must be performed in order to render a shape. The below code instantiates a path element by defining the
 *  `type` attribute as "path":</p>

        var myPath = myGraphic.addShape({
            type: "path",
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });

 * Below a `Path` element with the same properties is instantiated by defining the `type` attribute with a class reference:
 *
        var myPath = myGraphic.addShape({
            type: Y.Path,
            fill: {
                color: "#9aa"
            },
            stroke: {
                weight: 1,
                color: "#000"
            }
        });

 * After instantiation, a shape or segment needs to be drawn for an element to render. After all draw operations are performed,
 * the <a href="#method_end">`end`</a> method will render the shape. The code below will draw a triangle:

        myPath.moveTo(35, 5);
        myPath.lineTo(65, 65);
        myPath.lineTo(5, 65);
        myPath.lineTo(35, 5);
        myPath.end();
 *
 * <p>`Path` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGPath.html">`SVGPath`</a></li>
 *      <li><a href="VMLPath.html">`VMLPath`</a></li>
 *      <li><a href="CanvasPath.html">`CanvasPath`</a></li>
 *  </ul>
 * It is not necessary to interact with these classes directly. `Path` will point to the appropriate implemention.</p>
 *
 * @class Path
 * @extends Shape
 * @uses Drawing
 * @constructor
 */
	/**
	 * Indicates the path used for the node.
	 *
	 * @config path
	 * @type String
     * @readOnly
	 */
/**
 * `Graphic` acts a factory and container for shapes. You need at least one `Graphic` instance to create shapes for your application.
 * <p>The code block below creates a `Graphic` instance and appends it to an HTMLElement with the id 'mygraphiccontainer'.</p>

        var myGraphic = new Y.Graphic({render:"#mygraphiccontainer"});

 * <p>Alternatively, you can add a `Graphic` instance to the DOM using the <a href="#method_render">`render`</a> method.</p>
        var myGraphic = new Y.Graphic();
        myGraphic.render("#mygraphiccontainer");

 * `Graphic` has the following implementations based on browser capability.
 *  <ul>
 *      <li><a href="SVGGraphic.html">`SVGGraphic`</a></li>
 *      <li><a href="VMLGraphic.html">`VMLGraphic`</a></li>
 *      <li><a href="CanvasGraphic.html">`CanvasGraphic`</a></li>
 *  </ul>
 *
 * It is not necessary to interact with these classes directly. `Graphic` will point to the appropriate implemention.</p>
 *
 * @class Graphic
 * @constructor
 */
    /**
     * Whether or not to render the `Graphic` automatically after to a specified parent node after init. This can be a Node
     * instance or a CSS selector string.
     *
     * @config render
     * @type Node | String
     */
    /**
	 * Unique id for class instance.
	 *
	 * @config id
	 * @type String
	 */
    /**
     * Key value pairs in which a shape instance is associated with its id.
     *
     *  @config shapes
     *  @type Object
     *  @readOnly
     */
    /**
     *  Object containing size and coordinate data for the content of a Graphic in relation to the coordSpace node.
     *
     *  @config contentBounds
     *  @type Object
     *  @readOnly
     */
    /**
     *  The html element that represents to coordinate system of the Graphic instance.
     *
     *  @config node
     *  @type HTMLElement
     *  @readOnly
     */
	/**
	 * Indicates the width of the `Graphic`.
	 *
	 * @config width
	 * @type Number
	 */
	/**
	 * Indicates the height of the `Graphic`.
	 *
	 * @config height
	 * @type Number
	 */
    /**
     *  Determines the sizing of the Graphic.
     *
     *  <dl>
     *      <dt>sizeContentToGraphic</dt><dd>The Graphic's width and height attributes are, either explicitly set through the
     *      <code>width</code> and <code>height</code> attributes or are determined by the dimensions of the parent element. The
     *      content contained in the Graphic will be sized to fit with in the Graphic instance's dimensions. When using this
     *      setting, the <code>preserveAspectRatio</code> attribute will determine how the contents are sized.</dd>
     *      <dt>sizeGraphicToContent</dt><dd>(Also accepts a value of true) The Graphic's width and height are determined by the
     *      size and positioning of the content.</dd>
     *      <dt>false</dt><dd>The Graphic's width and height attributes are, either explicitly set through the <code>width</code>
     *      and <code>height</code> attributes or are determined by the dimensions of the parent element. The contents of the
     *      Graphic instance are not affected by this setting.</dd>
     *  </dl>
     *
     *
     *  @config autoSize
     *  @type Boolean | String
     *  @default false
     */
    /**
     * Determines how content is sized when <code>autoSize</code> is set to <code>sizeContentToGraphic</code>.
     *
     *  <dl>
     *      <dt>none<dt><dd>Do not force uniform scaling. Scale the graphic content of the given element non-uniformly if necessary
     *      such that the element's bounding box exactly matches the viewport rectangle.</dd>
     *      <dt>xMinYMin</dt><dd>Force uniform scaling position along the top left of the Graphic's node.</dd>
     *      <dt>xMidYMin</dt><dd>Force uniform scaling horizontally centered and positioned at the top of the Graphic's node.<dd>
     *      <dt>xMaxYMin</dt><dd>Force uniform scaling positioned horizontally from the right and vertically from the top.</dd>
     *      <dt>xMinYMid</dt>Force uniform scaling positioned horizontally from the left and vertically centered.</dd>
     *      <dt>xMidYMid (the default)</dt><dd>Force uniform scaling with the content centered.</dd>
     *      <dt>xMaxYMid</dt><dd>Force uniform scaling positioned horizontally from the right and vertically centered.</dd>
     *      <dt>xMinYMax</dt><dd>Force uniform scaling positioned horizontally from the left and vertically from the bottom.</dd>
     *      <dt>xMidYMax</dt><dd>Force uniform scaling horizontally centered and position vertically from the bottom.</dd>
     *      <dt>xMaxYMax</dt><dd>Force uniform scaling positioned horizontally from the right and vertically from the bottom.</dd>
     *  </dl>
     *
     * @config preserveAspectRatio
     * @type String
     * @default xMidYMid
     */
    /**
     * The contentBounds will resize to greater values but not to smaller values. (for performance)
     * When resizing the contentBounds down is desirable, set the resizeDown value to true.
     *
     * @config resizeDown
     * @type Boolean
     */
	/**
	 * Indicates the x-coordinate for the instance.
	 *
	 * @config x
	 * @type Number
	 */
	/**
	 * Indicates the y-coordinate for the instance.
	 *
	 * @config y
	 * @type Number
	 */
    /**
     * Indicates whether or not the instance will automatically redraw after a change is made to a shape.
     * This property will get set to false when batching operations.
     *
     * @config autoDraw
     * @type Boolean
     * @default true
     * @private
     */
	/**
	 * Indicates whether the `Graphic` and its children are visible.
	 *
	 * @config visible
	 * @type Boolean
	 */
    /**
     * Gets the current position of the graphic instance in page coordinates.
     *
     * @method getXY
     * @return Array The XY position of the shape.
     */
    /**
     * Adds the graphics node to the dom.
     *
     * @method render
     * @param {Node|String} parentNode node in which to render the graphics node into.
     */
    /**
     * Removes all nodes.
     *
     * @method destroy
     */
    /**
     * <p>Generates a shape instance by type. The method accepts an object that contain's the shape's
     * type and attributes to be customized. For example, the code below would create a rectangle:</p>
     *
            var myRect = myGraphic.addShape({
                type: "rect",
                width: 40,
                height: 30,
                fill: {
                    color: "#9aa"
                },
                stroke: {
                    weight: 1,
                    color: "#000"
                }
            });
     *
     * <p>The `Graphics` module includes a few basic shapes. More information on their creation
     * can be found in each shape's documentation:
     *
     *  <ul>
     *      <li><a href="Circle.html">`Circle`</a></li>
     *      <li><a href="Ellipse.html">`Ellipse`</a></li>
     *      <li><a href="Rect.html">`Rect`</a></li>
     *      <li><a href="Path.html">`Path`</a></li>
     *  </ul>
     *
     *  The `Graphics` module also allows for the creation of custom shapes. If a custom shape
     *  has been created, it can be instantiated with the `addShape` method as well. The attributes,
     *  required and optional, would need to be defined in the custom shape.
     *
            var myCustomShape = myGraphic.addShape({
                type: Y.MyCustomShape,
                width: 50,
                height: 50,
                fill: {
                    color: "#9aa"
                },
                stroke: {
                    weight: 1,
                    color: "#000"
                }
            });
     *
     * @method addShape
     * @param {Object} cfg Object containing the shape's type and attributes.
     * @return Shape
     */
    /**
     * Removes a shape instance from from the graphic instance.
     *
     * @method removeShape
     * @param {Shape|String} shape The instance or id of the shape to be removed.
     */
    /**
     * Removes all shape instances from the dom.
     *
     * @method removeAllShapes
     */
    /**
     * Returns a shape based on the id of its dom node.
     *
     * @method getShapeById
     * @param {String} id Dom id of the shape's node attribute.
     * @return Shape
     */
	/**
	 * Allows for creating multiple shapes in order to batch appending and redraw operations.
	 *
	 * @method batch
	 * @param {Function} method Method to execute.
	 */


}, '3.8.1', {"requires": ["node", "event-custom", "pluginhost", "matrix", "classnamemanager"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('graphics-canvas-default', function (Y, NAME) {

Y.Graphic = Y.CanvasGraphic;
Y.Shape = Y.CanvasShape;
Y.Circle = Y.CanvasCircle;
Y.Rect = Y.CanvasRect;
Y.Ellipse = Y.CanvasEllipse;
Y.Path = Y.CanvasPath;
Y.Drawing = Y.CanvasDrawing;


}, '3.8.1');
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('graphics-canvas', function (Y, NAME) {

var IMPLEMENTATION = "canvas",
    SHAPE = "shape",
	SPLITPATHPATTERN = /[a-z][^a-z]*/ig,
    SPLITARGSPATTERN = /[-]?[0-9]*[0-9|\.][0-9]*/g,
    DOCUMENT = Y.config.doc,
    Y_LANG = Y.Lang,
    AttributeLite = Y.AttributeLite,
	CanvasShape,
	CanvasPath,
	CanvasRect,
    CanvasEllipse,
	CanvasCircle,
    CanvasPieSlice,
    Y_DOM = Y.DOM,
    Y_Color = Y.Color,
    PARSE_INT = parseInt,
    PARSE_FLOAT = parseFloat,
    IS_NUMBER = Y_LANG.isNumber,
    RE = RegExp,
    TORGB = Y_Color.toRGB,
    TOHEX = Y_Color.toHex,
    _getClassName = Y.ClassNameManager.getClassName;

/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the <a href="Drawing.html">`Drawing`</a> class.
 * `CanvasDrawing` is not intended to be used directly. Instead, use the <a href="Drawing.html">`Drawing`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Drawing.html">`Drawing`</a>
 * class will point to the `CanvasDrawing` class.
 *
 * @module graphics
 * @class CanvasDrawing
 * @constructor
 */
function CanvasDrawing()
{
}

CanvasDrawing.prototype = {
    /**
     * Maps path to methods
     *
     * @property _pathSymbolToMethod
     * @type Object
     * @private
     */
    _pathSymbolToMethod: {
        M: "moveTo",
        m: "relativeMoveTo",
        L: "lineTo",
        l: "relativeLineTo",
        C: "curveTo",
        c: "relativeCurveTo",
        Q: "quadraticCurveTo",
        q: "relativeQuadraticCurveTo",
        z: "closePath",
        Z: "closePath"
    },

    /**
     * Current x position of the drawing.
     *
     * @property _currentX
     * @type Number
     * @private
     */
    _currentX: 0,

    /**
     * Current y position of the drqwing.
     *
     * @property _currentY
     * @type Number
     * @private
     */
    _currentY: 0,

    /**
     * Parses hex color string and alpha value to rgba
     *
     * @method _toRGBA
     * @param {Object} val Color value to parse. Can be hex string, rgb or name.
     * @param {Number} alpha Numeric value between 0 and 1 representing the alpha level.
     * @private
     */
    _toRGBA: function(val, alpha) {
        alpha = (alpha !== undefined) ? alpha : 1;
        if (!Y_Color.re_RGB.test(val)) {
            val = TOHEX(val);
        }

        if(Y_Color.re_hex.exec(val)) {
            val = 'rgba(' + [
                PARSE_INT(RE.$1, 16),
                PARSE_INT(RE.$2, 16),
                PARSE_INT(RE.$3, 16)
            ].join(',') + ',' + alpha + ')';
        }
        return val;
    },

    /**
     * Converts color to rgb format
     *
     * @method _toRGB
     * @param val Color value to convert.
     * @private
     */
    _toRGB: function(val) {
        return TORGB(val);
    },

    /**
     * Sets the size of the graphics object.
     *
     * @method setSize
     * @param w {Number} width to set for the instance.
     * @param h {Number} height to set for the instance.
     * @private
     */
	setSize: function(w, h) {
        if(this.get("autoSize"))
        {
            if(w > this.node.getAttribute("width"))
            {
                this.node.style.width = w + "px";
                this.node.setAttribute("width", w);
            }
            if(h > this.node.getAttribute("height"))
            {
                this.node.style.height = h + "px";
                this.node.setAttribute("height", h);
            }
        }
    },

	/**
     * Tracks coordinates. Used to calculate the start point of dashed lines.
     *
     * @method _updateCoords
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
	 * @private
	 */
    _updateCoords: function(x, y)
    {
        this._xcoords.push(x);
        this._ycoords.push(y);
        this._currentX = x;
        this._currentY = y;
    },

	/**
     * Clears the coordinate arrays. Called at the end of a drawing operation.
	 *
     * @method _clearAndUpdateCoords
     * @private
	 */
    _clearAndUpdateCoords: function()
    {
        var x = this._xcoords.pop() || 0,
            y = this._ycoords.pop() || 0;
        this._updateCoords(x, y);
    },

	/**
     * Moves the shape's dom node.
     *
     * @method _updateNodePosition
	 * @private
	 */
    _updateNodePosition: function()
    {
        var node = this.get("node"),
            x = this.get("x"),
            y = this.get("y");
        node.style.position = "absolute";
        node.style.left = (x + this._left) + "px";
        node.style.top = (y + this._top) + "px";
    },

    /**
     * Queues up a method to be executed when a shape redraws.
     *
     * @method _updateDrawingQueue
     * @param {Array} val An array containing data that can be parsed into a method and arguments. The value at zero-index
     * of the array is a string reference of the drawing method that will be called. All subsequent indices are argument for
     * that method. For example, `lineTo(10, 100)` would be structured as:
     * `["lineTo", 10, 100]`.
     * @private
     */
    _updateDrawingQueue: function(val)
    {
        this._methods.push(val);
    },

    /**
     * Draws a line segment from the current drawing position to the specified x and y coordinates.
     *
     * @method lineTo
     * @param {Number} point1 x-coordinate for the end point.
     * @param {Number} point2 y-coordinate for the end point.
     */
    lineTo: function()
    {
        this._lineTo.apply(this, [Y.Array(arguments), false]);
    },

    /**
     * Draws a line segment from the current drawing position to the relative x and y coordinates.
     *
     * @method lineTo
     * @param {Number} point1 x-coordinate for the end point.
     * @param {Number} point2 y-coordinate for the end point.
     */
    relativeLineTo: function()
    {
        this._lineTo.apply(this, [Y.Array(arguments), true]);
    },

    /**
     * Implements lineTo methods.
     *
     * @method _lineTo
     * @param {Array} args The arguments to be used.
     * @param {Boolean} relative Indicates whether or not to use relative coordinates.
     * @private
     */
    _lineTo: function(args, relative)
    {
        var point1 = args[0],
            i,
            len,
            x,
            y,
            wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0,
            relativeX = relative ? parseFloat(this._currentX) : 0,
            relativeY = relative ? parseFloat(this._currentY) : 0;
        if(!this._lineToMethods)
        {
            this._lineToMethods = [];
        }
        len = args.length - 1;
        if (typeof point1 === 'string' || typeof point1 === 'number') {
            for (i = 0; i < len; i = i + 2) {
                x = parseFloat(args[i]);
                y = parseFloat(args[i + 1]);
                x = x + relativeX;
                y = y + relativeY;
                this._updateDrawingQueue(["lineTo", x, y]);
                this._trackSize(x - wt, y - wt);
                this._trackSize(x + wt, y + wt);
                this._updateCoords(x, y);
            }
        }
        else
        {
            for (i = 0; i < len; i = i + 1)
            {
                x = parseFloat(args[i][0]);
                y = parseFloat(args[i][1]);
                this._updateDrawingQueue(["lineTo", x, y]);
                this._lineToMethods[this._lineToMethods.length] = this._methods[this._methods.length - 1];
                this._trackSize(x - wt, y - wt);
                this._trackSize(x + wt, y + wt);
                this._updateCoords(x, y);
            }
        }
        this._drawingComplete = false;
        return this;
    },

    /**
     * Moves the current drawing position to specified x and y coordinates.
     *
     * @method moveTo
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    moveTo: function()
    {
        this._moveTo.apply(this, [Y.Array(arguments), false]);
    },

    /**
     * Moves the current drawing position relative to specified x and y coordinates.
     *
     * @method relativeMoveTo
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    relativeMoveTo: function()
    {
        this._moveTo.apply(this, [Y.Array(arguments), true]);
    },

    /**
     * Implements moveTo methods.
     *
     * @method _moveTo
     * @param {Array} args The arguments to be used.
     * @param {Boolean} relative Indicates whether or not to use relative coordinates.
     * @private
     */
    _moveTo: function(args, relative) {
        var wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0,
            relativeX = relative ? parseFloat(this._currentX) : 0,
            relativeY = relative ? parseFloat(this._currentY) : 0,
            x = parseFloat(args[0]) + relativeX,
            y = parseFloat(args[1]) + relativeY;
        this._updateDrawingQueue(["moveTo", x, y]);
        this._trackSize(x - wt, y - wt);
        this._trackSize(x + wt, y + wt);
        this._updateCoords(x, y);
        this._drawingComplete = false;
        return this;
    },

    /**
     * Draws a bezier curve.
     *
     * @method curveTo
     * @param {Number} cp1x x-coordinate for the first control point.
     * @param {Number} cp1y y-coordinate for the first control point.
     * @param {Number} cp2x x-coordinate for the second control point.
     * @param {Number} cp2y y-coordinate for the second control point.
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    curveTo: function() {
        this._curveTo.apply(this, [Y.Array(arguments), false]);
    },

    /**
     * Draws a bezier curve relative to the current coordinates.
     *
     * @method curveTo
     * @param {Number} cp1x x-coordinate for the first control point.
     * @param {Number} cp1y y-coordinate for the first control point.
     * @param {Number} cp2x x-coordinate for the second control point.
     * @param {Number} cp2y y-coordinate for the second control point.
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    relativeCurveTo: function() {
        this._curveTo.apply(this, [Y.Array(arguments), true]);
    },

    /**
     * Implements curveTo methods.
     *
     * @method _curveTo
     * @param {Array} args The arguments to be used.
     * @param {Boolean} relative Indicates whether or not to use relative coordinates.
     * @private
     */
    _curveTo: function(args, relative) {
        var w,
            h,
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            x,
            y,
            pts,
            right,
            left,
            bottom,
            top,
            i,
            len,
            relativeX = relative ? parseFloat(this._currentX) : 0,
            relativeY = relative ? parseFloat(this._currentY) : 0;
        len = args.length - 5;
        for(i = 0; i < len; i = i + 6)
        {
            cp1x = parseFloat(args[i]) + relativeX;
            cp1y = parseFloat(args[i + 1]) + relativeY;
            cp2x = parseFloat(args[i + 2]) + relativeX;
            cp2y = parseFloat(args[i + 3]) + relativeY;
            x = parseFloat(args[i + 4]) + relativeX;
            y = parseFloat(args[i + 5]) + relativeY;
            this._updateDrawingQueue(["bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y]);
            this._drawingComplete = false;
            right = Math.max(x, Math.max(cp1x, cp2x));
            bottom = Math.max(y, Math.max(cp1y, cp2y));
            left = Math.min(x, Math.min(cp1x, cp2x));
            top = Math.min(y, Math.min(cp1y, cp2y));
            w = Math.abs(right - left);
            h = Math.abs(bottom - top);
            pts = [[this._currentX, this._currentY] , [cp1x, cp1y], [cp2x, cp2y], [x, y]];
            this._setCurveBoundingBox(pts, w, h);
            this._currentX = x;
            this._currentY = y;
        }
    },

    /**
     * Draws a quadratic bezier curve.
     *
     * @method quadraticCurveTo
     * @param {Number} cpx x-coordinate for the control point.
     * @param {Number} cpy y-coordinate for the control point.
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    quadraticCurveTo: function() {
        this._quadraticCurveTo.apply(this, [Y.Array(arguments), false]);
    },

    /**
     * Draws a quadratic bezier curve relative to the current position.
     *
     * @method relativeQuadraticCurveTo
     * @param {Number} cpx x-coordinate for the control point.
     * @param {Number} cpy y-coordinate for the control point.
     * @param {Number} x x-coordinate for the end point.
     * @param {Number} y y-coordinate for the end point.
     */
    relativeQuadraticCurveTo: function() {
        this._quadraticCurveTo.apply(this, [Y.Array(arguments), true]);
    },

    /**
     * Implements quadraticCurveTo methods.
     *
     * @method _quadraticCurveTo
     * @param {Array} args The arguments to be used.
     * @param {Boolean} relative Indicates whether or not to use relative coordinates.
     * @private
     */
    _quadraticCurveTo: function(args, relative) {
        var cpx,
            cpy,
            x,
            y,
            w,
            h,
            pts,
            right,
            left,
            bottom,
            top,
            i,
            len = args.length - 3,
            wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0,
            relativeX = relative ? parseFloat(this._currentX) : 0,
            relativeY = relative ? parseFloat(this._currentY) : 0;
        for(i = 0; i < len; i = i + 4)
        {
            cpx = parseFloat(args[i]) + relativeX;
            cpy = parseFloat(args[i + 1]) + relativeY;
            x = parseFloat(args[i + 2]) + relativeX;
            y = parseFloat(args[i + 3]) + relativeY;
            this._drawingComplete = false;
            right = Math.max(x, cpx);
            bottom = Math.max(y, cpy);
            left = Math.min(x, cpx);
            top = Math.min(y, cpy);
            w = Math.abs(right - left);
            h = Math.abs(bottom - top);
            pts = [[this._currentX, this._currentY] , [cpx, cpy], [x, y]];
            this._setCurveBoundingBox(pts, w, h);
            this._updateDrawingQueue(["quadraticCurveTo", cpx, cpy, x, y]);
            this._updateCoords(x, y);
        }
        return this;
    },

    /**
     * Draws a circle. Used internally by `CanvasCircle` class.
     *
     * @method drawCircle
     * @param {Number} x y-coordinate
     * @param {Number} y x-coordinate
     * @param {Number} r radius
     * @protected
     */
	drawCircle: function(x, y, radius) {
        var startAngle = 0,
            endAngle = 2 * Math.PI,
            wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0,
            circum = radius * 2;
            circum += wt;
        this._drawingComplete = false;
        this._trackSize(x + circum, y + circum);
        this._trackSize(x - wt, y - wt);
        this._updateCoords(x, y);
        this._updateDrawingQueue(["arc", x + radius, y + radius, radius, startAngle, endAngle, false]);
        return this;
    },

    /**
     * Draws a diamond.
     *
     * @method drawDiamond
     * @param {Number} x y-coordinate
     * @param {Number} y x-coordinate
     * @param {Number} width width
     * @param {Number} height height
     * @protected
     */
    drawDiamond: function(x, y, width, height)
    {
        var midWidth = width * 0.5,
            midHeight = height * 0.5;
        this.moveTo(x + midWidth, y);
        this.lineTo(x + width, y + midHeight);
        this.lineTo(x + midWidth, y + height);
        this.lineTo(x, y + midHeight);
        this.lineTo(x + midWidth, y);
        return this;
    },

    /**
     * Draws an ellipse. Used internally by `CanvasEllipse` class.
     *
     * @method drawEllipse
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @param {Number} w width
     * @param {Number} h height
     * @protected
     */
	drawEllipse: function(x, y, w, h) {
        var l = 8,
            theta = -(45/180) * Math.PI,
            angle = 0,
            angleMid,
            radius = w/2,
            yRadius = h/2,
            i,
            centerX = x + radius,
            centerY = y + yRadius,
            ax, ay, bx, by, cx, cy,
            wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0;

        ax = centerX + Math.cos(0) * radius;
        ay = centerY + Math.sin(0) * yRadius;
        this.moveTo(ax, ay);
        for(i = 0; i < l; i++)
        {
            angle += theta;
            angleMid = angle - (theta / 2);
            bx = centerX + Math.cos(angle) * radius;
            by = centerY + Math.sin(angle) * yRadius;
            cx = centerX + Math.cos(angleMid) * (radius / Math.cos(theta / 2));
            cy = centerY + Math.sin(angleMid) * (yRadius / Math.cos(theta / 2));
            this._updateDrawingQueue(["quadraticCurveTo", cx, cy, bx, by]);
        }
        this._trackSize(x + w + wt, y + h + wt);
        this._trackSize(x - wt, y - wt);
        this._updateCoords(x, y);
        return this;
    },

    /**
     * Draws a rectangle.
     *
     * @method drawRect
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @param {Number} w width
     * @param {Number} h height
     */
    drawRect: function(x, y, w, h) {
        var wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0;
        this._drawingComplete = false;
        this.moveTo(x, y);
        this.lineTo(x + w, y);
        this.lineTo(x + w, y + h);
        this.lineTo(x, y + h);
        this.lineTo(x, y);
        return this;
    },

    /**
     * Draws a rectangle with rounded corners.
     *
     * @method drawRect
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @param {Number} w width
     * @param {Number} h height
     * @param {Number} ew width of the ellipse used to draw the rounded corners
     * @param {Number} eh height of the ellipse used to draw the rounded corners
     */
    drawRoundRect: function(x, y, w, h, ew, eh) {
        var wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0;
        this._drawingComplete = false;
        this.moveTo( x, y + eh);
        this.lineTo(x, y + h - eh);
        this.quadraticCurveTo(x, y + h, x + ew, y + h);
        this.lineTo(x + w - ew, y + h);
        this.quadraticCurveTo(x + w, y + h, x + w, y + h - eh);
        this.lineTo(x + w, y + eh);
        this.quadraticCurveTo(x + w, y, x + w - ew, y);
        this.lineTo(x + ew, y);
        this.quadraticCurveTo(x, y, x, y + eh);
        return this;
    },

    /**
     * Draws a wedge.
     *
     * @method drawWedge
     * @param {Number} x x-coordinate of the wedge's center point
     * @param {Number} y y-coordinate of the wedge's center point
     * @param {Number} startAngle starting angle in degrees
     * @param {Number} arc sweep of the wedge. Negative values draw clockwise.
     * @param {Number} radius radius of wedge. If [optional] yRadius is defined, then radius is the x radius.
     * @param {Number} yRadius [optional] y radius for wedge.
     * @private
     */
    drawWedge: function(x, y, startAngle, arc, radius, yRadius)
    {
        var wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0,
            segs,
            segAngle,
            theta,
            angle,
            angleMid,
            ax,
            ay,
            bx,
            by,
            cx,
            cy,
            i = 0;
        yRadius = yRadius || radius;

        this._drawingComplete = false;
        // move to x,y position
        this._updateDrawingQueue(["moveTo", x, y]);

        yRadius = yRadius || radius;

        // limit sweep to reasonable numbers
        if(Math.abs(arc) > 360)
        {
            arc = 360;
        }

        // First we calculate how many segments are needed
        // for a smooth arc.
        segs = Math.ceil(Math.abs(arc) / 45);

        // Now calculate the sweep of each segment.
        segAngle = arc / segs;

        // The math requires radians rather than degrees. To convert from degrees
        // use the formula (degrees/180)*Math.PI to get radians.
        theta = -(segAngle / 180) * Math.PI;

        // convert angle startAngle to radians
        angle = (startAngle / 180) * Math.PI;

        // draw the curve in segments no larger than 45 degrees.
        if(segs > 0)
        {
            // draw a line from the center to the start of the curve
            ax = x + Math.cos(startAngle / 180 * Math.PI) * radius;
            ay = y + Math.sin(startAngle / 180 * Math.PI) * yRadius;
            this.lineTo(ax, ay);
            // Loop for drawing curve segments
            for(i = 0; i < segs; ++i)
            {
                angle += theta;
                angleMid = angle - (theta / 2);
                bx = x + Math.cos(angle) * radius;
                by = y + Math.sin(angle) * yRadius;
                cx = x + Math.cos(angleMid) * (radius / Math.cos(theta / 2));
                cy = y + Math.sin(angleMid) * (yRadius / Math.cos(theta / 2));
                this._updateDrawingQueue(["quadraticCurveTo", cx, cy, bx, by]);
            }
            // close the wedge by drawing a line to the center
            this._updateDrawingQueue(["lineTo", x, y]);
        }
        this._trackSize(-wt , -wt);
        this._trackSize((radius * 2) + wt, (radius * 2) + wt);
        return this;
    },

    /**
     * Completes a drawing operation.
     *
     * @method end
     */
    end: function() {
        this._closePath();
        return this;
    },

    /**
     * Ends a fill and stroke
     *
     * @method closePath
     */
    closePath: function()
    {
        this._updateDrawingQueue(["closePath"]);
        this._updateDrawingQueue(["beginPath"]);
    },

	/**
	 * Clears the graphics object.
	 *
	 * @method clear
	 */

    /**
     * Returns a linear gradient fill
     *
     * @method _getLinearGradient
     * @return CanvasGradient
     * @private
     */
    _getLinearGradient: function() {
        var isNumber = Y.Lang.isNumber,
            fill = this.get("fill"),
            stops = fill.stops,
            opacity,
            color,
            stop,
            i,
            len = stops.length,
            gradient,
            x = 0,
            y = 0,
            w = this.get("width"),
            h = this.get("height"),
            r = fill.rotation || 0,
            x1, x2, y1, y2,
            cx = x + w/2,
            cy = y + h/2,
            offset,
            radCon = Math.PI/180,
            tanRadians = parseFloat(parseFloat(Math.tan(r * radCon)).toFixed(8));
        if(Math.abs(tanRadians) * w/2 >= h/2)
        {
            if(r < 180)
            {
                y1 = y;
                y2 = y + h;
            }
            else
            {
                y1 = y + h;
                y2 = y;
            }
            x1 = cx - ((cy - y1)/tanRadians);
            x2 = cx - ((cy - y2)/tanRadians);
        }
        else
        {
            if(r > 90 && r < 270)
            {
                x1 = x + w;
                x2 = x;
            }
            else
            {
                x1 = x;
                x2 = x + w;
            }
            y1 = ((tanRadians * (cx - x1)) - cy) * -1;
            y2 = ((tanRadians * (cx - x2)) - cy) * -1;
        }
        gradient = this._context.createLinearGradient(x1, y1, x2, y2);
        for(i = 0; i < len; ++i)
        {
            stop = stops[i];
            opacity = stop.opacity;
            color = stop.color;
            offset = stop.offset;
            if(isNumber(opacity))
            {
                opacity = Math.max(0, Math.min(1, opacity));
                color = this._toRGBA(color, opacity);
            }
            else
            {
                color = TORGB(color);
            }
            offset = stop.offset || i/(len - 1);
            gradient.addColorStop(offset, color);
        }
        return gradient;
    },

    /**
     * Returns a radial gradient fill
     *
     * @method _getRadialGradient
     * @return CanvasGradient
     * @private
     */
    _getRadialGradient: function() {
        var isNumber = Y.Lang.isNumber,
            fill = this.get("fill"),
            r = fill.r,
            fx = fill.fx,
            fy = fill.fy,
            stops = fill.stops,
            opacity,
            color,
            stop,
            i,
            len = stops.length,
            gradient,
            x = 0,
            y = 0,
            w = this.get("width"),
            h = this.get("height"),
            x1, x2, y1, y2, r2,
            xc, yc, xn, yn, d,
            offset,
            ratio,
            stopMultiplier;
        xc = x + w/2;
        yc = y + h/2;
        x1 = w * fx;
        y1 = h * fy;
        x2 = x + w/2;
        y2 = y + h/2;
        r2 = w * r;
        d = Math.sqrt( Math.pow(Math.abs(xc - x1), 2) + Math.pow(Math.abs(yc - y1), 2) );
        if(d >= r2)
        {
            ratio = d/r2;
            //hack. gradient won't show if it is exactly on the edge of the arc
            if(ratio === 1)
            {
                ratio = 1.01;
            }
            xn = (x1 - xc)/ratio;
            yn = (y1 - yc)/ratio;
            xn = xn > 0 ? Math.floor(xn) : Math.ceil(xn);
            yn = yn > 0 ? Math.floor(yn) : Math.ceil(yn);
            x1 = xc + xn;
            y1 = yc + yn;
        }

        //If the gradient radius is greater than the circle's, adjusting the radius stretches the gradient properly.
        //If the gradient radius is less than the circle's, adjusting the radius of the gradient will not work.
        //Instead, adjust the color stops to reflect the smaller radius.
        if(r >= 0.5)
        {
            gradient = this._context.createRadialGradient(x1, y1, r, x2, y2, r * w);
            stopMultiplier = 1;
        }
        else
        {
            gradient = this._context.createRadialGradient(x1, y1, r, x2, y2, w/2);
            stopMultiplier = r * 2;
        }
        for(i = 0; i < len; ++i)
        {
            stop = stops[i];
            opacity = stop.opacity;
            color = stop.color;
            offset = stop.offset;
            if(isNumber(opacity))
            {
                opacity = Math.max(0, Math.min(1, opacity));
                color = this._toRGBA(color, opacity);
            }
            else
            {
                color = TORGB(color);
            }
            offset = stop.offset || i/(len - 1);
            offset *= stopMultiplier;
            if(offset <= 1)
            {
                gradient.addColorStop(offset, color);
            }
        }
        return gradient;
    },


    /**
     * Clears all values
     *
     * @method _initProps
     * @private
     */
    _initProps: function() {
        this._methods = [];
        this._lineToMethods = [];
        this._xcoords = [0];
		this._ycoords = [0];
		this._width = 0;
        this._height = 0;
        this._left = 0;
        this._top = 0;
        this._right = 0;
        this._bottom = 0;
        this._currentX = 0;
        this._currentY = 0;
    },

    /**
     * Indicates a drawing has completed.
     *
     * @property _drawingComplete
     * @type Boolean
     * @private
     */
    _drawingComplete: false,

    /**
     * Creates canvas element
     *
     * @method _createGraphic
     * @return HTMLCanvasElement
     * @private
     */
    _createGraphic: function(config) {
        var graphic = Y.config.doc.createElement('canvas');
        return graphic;
    },

    /**
     * Returns the points on a curve
     *
     * @method getBezierData
     * @param Array points Array containing the begin, end and control points of a curve.
     * @param Number t The value for incrementing the next set of points.
     * @return Array
     * @private
     */
    getBezierData: function(points, t) {
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
    },

    /**
     * Calculates the bounding box for a curve
     *
     * @method _setCurveBoundingBox
     * @param Array pts Array containing points for start, end and control points of a curve.
     * @param Number w Width used to calculate the number of points to describe the curve.
     * @param Number h Height used to calculate the number of points to describe the curve.
     * @private
     */
    _setCurveBoundingBox: function(pts, w, h)
    {
        var i = 0,
            left = this._currentX,
            right = left,
            top = this._currentY,
            bottom = top,
            len = Math.round(Math.sqrt((w * w) + (h * h))),
            t = 1/len,
            wt = this._stroke && this._strokeWeight ? this._strokeWeight : 0,
            xy;
        for(i = 0; i < len; ++i)
        {
            xy = this.getBezierData(pts, t * i);
            left = isNaN(left) ? xy[0] : Math.min(xy[0], left);
            right = isNaN(right) ? xy[0] : Math.max(xy[0], right);
            top = isNaN(top) ? xy[1] : Math.min(xy[1], top);
            bottom = isNaN(bottom) ? xy[1] : Math.max(xy[1], bottom);
        }
        left = Math.round(left * 10)/10;
        right = Math.round(right * 10)/10;
        top = Math.round(top * 10)/10;
        bottom = Math.round(bottom * 10)/10;
        this._trackSize(right + wt, bottom + wt);
        this._trackSize(left - wt, top - wt);
    },

    /**
     * Updates the size of the graphics object
     *
     * @method _trackSize
     * @param {Number} w width
     * @param {Number} h height
     * @private
     */
    _trackSize: function(w, h) {
        if (w > this._right) {
            this._right = w;
        }
        if(w < this._left)
        {
            this._left = w;
        }
        if (h < this._top)
        {
            this._top = h;
        }
        if (h > this._bottom)
        {
            this._bottom = h;
        }
        this._width = this._right - this._left;
        this._height = this._bottom - this._top;
    }
};
Y.CanvasDrawing = CanvasDrawing;
/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the <a href="Shape.html">`Shape`</a> class.
 * `CanvasShape` is not intended to be used directly. Instead, use the <a href="Shape.html">`Shape`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Shape.html">`Shape`</a>
 * class will point to the `CanvasShape` class.
 *
 * @module graphics
 * @class CanvasShape
 * @constructor
 */
CanvasShape = function(cfg)
{
    this._transforms = [];
    this.matrix = new Y.Matrix();
    CanvasShape.superclass.constructor.apply(this, arguments);
};

CanvasShape.NAME = "shape";

Y.extend(CanvasShape, Y.GraphicBase, Y.mix({
    /**
     * Init method, invoked during construction.
     * Calls `initializer` method.
     *
     * @method init
     * @protected
     */
    init: function()
	{
		this.initializer.apply(this, arguments);
	},

	/**
	 * Initializes the shape
	 *
	 * @private
	 * @method _initialize
	 */
	initializer: function(cfg)
	{
		var host = this,
            graphic = cfg.graphic,
            data = this.get("data");
        host._initProps();
		host.createNode();
		host._xcoords = [0];
		host._ycoords = [0];
        if(graphic)
        {
            this._setGraphic(graphic);
        }
        if(data)
        {
            host._parsePathData(data);
        }
		host._updateHandler();
	},

    /**
     * Set the Graphic instance for the shape.
     *
     * @method _setGraphic
     * @param {Graphic | Node | HTMLElement | String} render This param is used to determine the graphic instance. If it is a
     * `Graphic` instance, it will be assigned to the `graphic` attribute. Otherwise, a new Graphic instance will be created
     * and rendered into the dom element that the render represents.
     * @private
     */
    _setGraphic: function(render)
    {
        var graphic;
        if(render instanceof Y.CanvasGraphic)
        {
            this._graphic = render;
        }
        else
        {
            render = Y.one(render);
            graphic = new Y.CanvasGraphic({
                render: render
            });
            graphic._appendShape(this);
            this._graphic = graphic;
        }
    },

	/**
	 * Add a class name to each node.
	 *
	 * @method addClass
	 * @param {String} className the class name to add to the node's class attribute
	 */
	addClass: function(className)
	{
		var node = Y.one(this.get("node"));
		node.addClass(className);
	},

	/**
	 * Removes a class name from each node.
	 *
	 * @method removeClass
	 * @param {String} className the class name to remove from the node's class attribute
	 */
	removeClass: function(className)
	{
		var node = Y.one(this.get("node"));
		node.removeClass(className);
	},

	/**
	 * Gets the current position of the node in page coordinates.
	 *
	 * @method getXY
	 * @return Array The XY position of the shape.
	 */
	getXY: function()
	{
		var graphic = this.get("graphic"),
			parentXY = graphic.getXY(),
			x = this.get("x"),
			y = this.get("y");
		return [parentXY[0] + x, parentXY[1] + y];
	},

	/**
	 * Set the position of the shape in page coordinates, regardless of how the node is positioned.
	 *
	 * @method setXY
	 * @param {Array} Contains X & Y values for new position (coordinates are page-based)
	 */
	setXY: function(xy)
	{
		var graphic = this.get("graphic"),
			parentXY = graphic.getXY(),
			x = xy[0] - parentXY[0],
			y = xy[1] - parentXY[1];
		this._set("x", x);
		this._set("y", y);
		this._updateNodePosition(x, y);
	},

	/**
	 * Determines whether the node is an ancestor of another HTML element in the DOM hierarchy.
	 *
	 * @method contains
	 * @param {CanvasShape | HTMLElement} needle The possible node or descendent
	 * @return Boolean Whether or not this shape is the needle or its ancestor.
	 */
	contains: function(needle)
	{
		return needle === Y.one(this.node);
	},

	/**
	 * Test if the supplied node matches the supplied selector.
	 *
	 * @method test
	 * @param {String} selector The CSS selector to test against.
	 * @return Boolean Wheter or not the shape matches the selector.
	 */
	test: function(selector)
	{
		return Y.one(this.get("node")).test(selector);
		//return Y.Selector.test(this.node, selector);
	},

	/**
	 * Compares nodes to determine if they match.
	 * Node instances can be compared to each other and/or HTMLElements.
	 * @method compareTo
	 * @param {HTMLElement | Node} refNode The reference node to compare to the node.
	 * @return {Boolean} True if the nodes match, false if they do not.
	 */
	compareTo: function(refNode) {
		var node = this.node;
		return node === refNode;
	},

	/**
	 * Value function for fill attribute
	 *
	 * @method _getDefaultFill
	 * @return Object
	 * @private
	 */
	_getDefaultFill: function() {
		return {
			type: "solid",
			opacity: 1,
			cx: 0.5,
			cy: 0.5,
			fx: 0.5,
			fy: 0.5,
			r: 0.5
		};
	},

	/**
	 * Value function for stroke attribute
	 *
	 * @method _getDefaultStroke
	 * @return Object
	 * @private
	 */
	_getDefaultStroke: function()
	{
		return {
			weight: 1,
			dashstyle: "none",
			color: "#000",
			opacity: 1.0
		};
	},

	/**
	 * Left edge of the path
	 *
     * @property _left
     * @type Number
	 * @private
	 */
	_left: 0,

	/**
	 * Right edge of the path
	 *
     * @property _right
     * @type Number
	 * @private
	 */
	_right: 0,

	/**
	 * Top edge of the path
	 *
     * @property _top
     * @type Number
	 * @private
	 */
	_top: 0,

	/**
	 * Bottom edge of the path
	 *
     * @property _bottom
     * @type Number
	 * @private
	 */
	_bottom: 0,

	/**
	 * Creates the dom node for the shape.
	 *
     * @method createNode
	 * @return HTMLElement
	 * @private
	 */
	createNode: function()
	{
		var host = this,
            node = Y.config.doc.createElement('canvas'),
			id = host.get("id"),
            concat = host._camelCaseConcat,
            name = host.name;
		host._context = node.getContext('2d');
		node.setAttribute("overflow", "visible");
        node.style.overflow = "visible";
        if(!host.get("visible"))
        {
            node.style.visibility = "hidden";
        }
		node.setAttribute("id", id);
		id = "#" + id;
        host.node = node;
		host.addClass(_getClassName(SHAPE) + " " + _getClassName(concat(IMPLEMENTATION, SHAPE)) + " " + _getClassName(name) + " " + _getClassName(concat(IMPLEMENTATION, name)));
	},

	/**
     * Overrides default `on` method. Checks to see if its a dom interaction event. If so,
     * return an event attached to the `node` element. If not, return the normal functionality.
     *
     * @method on
     * @param {String} type event type
     * @param {Object} callback function
	 * @private
	 */
	on: function(type, fn)
	{
		if(Y.Node.DOM_EVENTS[type])
		{
			return Y.one("#" +  this.get("id")).on(type, fn);
		}
		return Y.on.apply(this, arguments);
	},

	/**
	 * Adds a stroke to the shape node.
	 *
	 * @method _strokeChangeHandler
     * @param {Object} stroke Properties of the `stroke` attribute.
	 * @private
	 */
	_setStrokeProps: function(stroke)
	{
		var color,
			weight,
			opacity,
			linejoin,
			linecap,
			dashstyle;
        if(stroke)
        {
            color = stroke.color;
            weight = PARSE_FLOAT(stroke.weight);
            opacity = PARSE_FLOAT(stroke.opacity);
            linejoin = stroke.linejoin || "round";
            linecap = stroke.linecap || "butt";
            dashstyle = stroke.dashstyle;
            this._miterlimit = null;
            this._dashstyle = (dashstyle && Y.Lang.isArray(dashstyle) && dashstyle.length > 1) ? dashstyle : null;
            this._strokeWeight = weight;

            if (IS_NUMBER(weight) && weight > 0)
            {
                this._stroke = 1;
            }
            else
            {
                this._stroke = 0;
            }
            if (IS_NUMBER(opacity)) {
                this._strokeStyle = this._toRGBA(color, opacity);
            }
            else
            {
                this._strokeStyle = color;
            }
            this._linecap = linecap;
            if(linejoin == "round" || linejoin == "bevel")
            {
                this._linejoin = linejoin;
            }
            else
            {
                linejoin = parseInt(linejoin, 10);
                if(IS_NUMBER(linejoin))
                {
                    this._miterlimit =  Math.max(linejoin, 1);
                    this._linejoin = "miter";
                }
            }
        }
        else
        {
            this._stroke = 0;
        }
	},

    /**
     * Sets the value of an attribute.
     *
     * @method set
     * @param {String|Object} name The name of the attribute. Alternatively, an object of key value pairs can
     * be passed in to set multiple attributes at once.
     * @param {Any} value The value to set the attribute to. This value is ignored if an object is received as
     * the name param.
     */
	set: function()
	{
		var host = this,
			val = arguments[0];
		AttributeLite.prototype.set.apply(host, arguments);
		if(host.initialized)
		{
			host._updateHandler();
		}
	},

	/**
	 * Adds a fill to the shape node.
	 *
	 * @method _setFillProps
     * @param {Object} fill Properties of the `fill` attribute.
	 * @private
	 */
	_setFillProps: function(fill)
	{
		var isNumber = IS_NUMBER,
			color,
			opacity,
			type;
        if(fill)
        {
            color = fill.color;
            type = fill.type;
            if(type == "linear" || type == "radial")
            {
                this._fillType = type;
            }
            else if(color)
            {
                opacity = fill.opacity;
                if (isNumber(opacity))
                {
                    opacity = Math.max(0, Math.min(1, opacity));
                    color = this._toRGBA(color, opacity);
                }
                else
                {
                    color = TORGB(color);
                }

                this._fillColor = color;
                this._fillType = 'solid';
            }
            else
            {
                this._fillColor = null;
            }
        }
		else
		{
            this._fillType = null;
			this._fillColor = null;
		}
	},

	/**
	 * Specifies a 2d translation.
	 *
	 * @method translate
	 * @param {Number} x The value to transate on the x-axis.
	 * @param {Number} y The value to translate on the y-axis.
	 */
	translate: function(x, y)
	{
		this._translateX += x;
		this._translateY += y;
		this._addTransform("translate", arguments);
	},

	/**
	 * Translates the shape along the x-axis. When translating x and y coordinates,
	 * use the `translate` method.
	 *
	 * @method translateX
	 * @param {Number} x The value to translate.
	 */
	translateX: function(x)
    {
        this._translateX += x;
        this._addTransform("translateX", arguments);
    },

	/**
	 * Performs a translate on the y-coordinate. When translating x and y coordinates,
	 * use the `translate` method.
	 *
	 * @method translateY
	 * @param {Number} y The value to translate.
	 */
	translateY: function(y)
    {
        this._translateY += y;
        this._addTransform("translateY", arguments);
    },

    /**
     * Skews the shape around the x-axis and y-axis.
     *
     * @method skew
     * @param {Number} x The value to skew on the x-axis.
     * @param {Number} y The value to skew on the y-axis.
     */
    skew: function(x, y)
    {
        this._addTransform("skew", arguments);
    },

	/**
	 * Skews the shape around the x-axis.
	 *
	 * @method skewX
	 * @param {Number} x x-coordinate
	 */
    skewX: function(x)
    {
        this._addTransform("skewX", arguments);
    },

	/**
	 * Skews the shape around the y-axis.
	 *
	 * @method skewY
	 * @param {Number} y y-coordinate
	 */
    skewY: function(y)
    {
        this._addTransform("skewY", arguments);
    },

	/**
	 * Rotates the shape clockwise around it transformOrigin.
	 *
	 * @method rotate
	 * @param {Number} deg The degree of the rotation.
	 */
    rotate: function(deg)
    {
        this._rotation = deg;
        this._addTransform("rotate", arguments);
    },

	/**
	 * Specifies a 2d scaling operation.
	 *
	 * @method scale
	 * @param {Number} val
	 */
    scale: function(x, y)
    {
        this._addTransform("scale", arguments);
    },

    /**
     * Storage for `rotation` atribute.
     *
     * @property _rotation
     * @type Number
	 * @private
	 */
	_rotation: 0,

    /**
     * Storage for the transform attribute.
     *
     * @property _transform
     * @type String
     * @private
     */
    _transform: "",

    /**
     * Adds a transform to the shape.
     *
     * @method _addTransform
     * @param {String} type The transform being applied.
     * @param {Array} args The arguments for the transform.
	 * @private
	 */
	_addTransform: function(type, args)
	{
        args = Y.Array(args);
        this._transform = Y_LANG.trim(this._transform + " " + type + "(" + args.join(", ") + ")");
        args.unshift(type);
        this._transforms.push(args);
        if(this.initialized)
        {
            this._updateTransform();
        }
	},

	/**
     * Applies all transforms.
     *
     * @method _updateTransform
	 * @private
	 */
	_updateTransform: function()
	{
		var node = this.node,
			key,
			transform,
			transformOrigin = this.get("transformOrigin"),
            matrix = this.matrix,
            i,
            len = this._transforms.length;

        if(this._transforms && this._transforms.length > 0)
        {
            for(i = 0; i < len; ++i)
            {
                key = this._transforms[i].shift();
                if(key)
                {
                    matrix[key].apply(matrix, this._transforms[i]);
                }
            }
            transform = matrix.toCSSText();
        }

        this._graphic.addToRedrawQueue(this);
		transformOrigin = (100 * transformOrigin[0]) + "% " + (100 * transformOrigin[1]) + "%";
        Y_DOM.setStyle(node, "transformOrigin", transformOrigin);
        if(transform)
		{
            Y_DOM.setStyle(node, "transform", transform);
		}
        this._transforms = [];
	},

	/**
     * Updates `Shape` based on attribute changes.
     *
     * @method _updateHandler
	 * @private
	 */
	_updateHandler: function()
	{
		this._draw();
		this._updateTransform();
	},

	/**
	 * Updates the shape.
	 *
	 * @method _draw
	 * @private
	 */
	_draw: function()
	{
        var node = this.node;
        this.clear();
		this._closePath();
		node.style.left = this.get("x") + "px";
		node.style.top = this.get("y") + "px";
	},

	/**
	 * Completes a shape or drawing
	 *
	 * @method _closePath
	 * @private
	 */
	_closePath: function()
	{
		if(!this._methods)
		{
			return;
		}
		var node = this.get("node"),
			w = this._right - this._left,
			h = this._bottom - this._top,
			context = this._context,
			methods = [],
			cachedMethods = this._methods.concat(),
			i,
			j,
			method,
			args,
            argsLen,
			len = 0;
		this._context.clearRect(0, 0, node.width, node.height);
        if(this._methods)
        {
			len = cachedMethods.length;
			if(!len || len < 1)
			{
				return;
			}
			for(i = 0; i < len; ++i)
			{
				methods[i] = cachedMethods[i].concat();
				args = methods[i];
                argsLen = (args[0] == "quadraticCurveTo" || args[0] == "bezierCurveTo") ? args.length : 3;
				for(j = 1; j < argsLen; ++j)
				{
					if(j % 2 === 0)
					{
						args[j] = args[j] - this._top;
					}
					else
					{
						args[j] = args[j] - this._left;
					}
				}
			}
            node.setAttribute("width", Math.min(w, 2000));
            node.setAttribute("height", Math.min(2000, h));
            context.beginPath();
			for(i = 0; i < len; ++i)
			{
				args = methods[i].concat();
				if(args && args.length > 0)
				{
					method = args.shift();
					if(method)
					{
                        if(method == "closePath")
                        {
                            context.closePath();
                            this._strokeAndFill(context);
                        }
						else if(method && method == "lineTo" && this._dashstyle)
						{
							args.unshift(this._xcoords[i] - this._left, this._ycoords[i] - this._top);
							this._drawDashedLine.apply(this, args);
						}
						else
						{
                            context[method].apply(context, args);
						}
					}
				}
			}

            this._strokeAndFill(context);
			this._drawingComplete = true;
			this._clearAndUpdateCoords();
			this._updateNodePosition();
			this._methods = cachedMethods;
		}
	},

    /**
     * Completes a stroke and/or fill operation on the context.
     *
     * @method _strokeAndFill
     * @param {Context} Reference to the context element of the canvas instance.
     * @private
     */
    _strokeAndFill: function(context)
    {
        if (this._fillType)
        {
            if(this._fillType == "linear")
            {
                context.fillStyle = this._getLinearGradient();
            }
            else if(this._fillType == "radial")
            {
                context.fillStyle = this._getRadialGradient();
            }
            else
            {
                context.fillStyle = this._fillColor;
            }
            context.closePath();
            context.fill();
        }

        if (this._stroke) {
            if(this._strokeWeight)
            {
                context.lineWidth = this._strokeWeight;
            }
            context.lineCap = this._linecap;
            context.lineJoin = this._linejoin;
            if(this._miterlimit)
            {
                context.miterLimit = this._miterlimit;
            }
            context.strokeStyle = this._strokeStyle;
            context.stroke();
        }
    },

	/**
	 * Draws a dashed line between two points.
	 *
	 * @method _drawDashedLine
	 * @param {Number} xStart	The x position of the start of the line
	 * @param {Number} yStart	The y position of the start of the line
	 * @param {Number} xEnd		The x position of the end of the line
	 * @param {Number} yEnd		The y position of the end of the line
	 * @private
	 */
	_drawDashedLine: function(xStart, yStart, xEnd, yEnd)
	{
		var context = this._context,
			dashsize = this._dashstyle[0],
			gapsize = this._dashstyle[1],
			segmentLength = dashsize + gapsize,
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
			context.moveTo(xCurrent, yCurrent);
			context.lineTo(xCurrent + Math.cos(radians) * dashsize, yCurrent + Math.sin(radians) * dashsize);
			xCurrent += xDelta;
			yCurrent += yDelta;
		}

		context.moveTo(xCurrent, yCurrent);
		delta = Math.sqrt((xEnd - xCurrent) * (xEnd - xCurrent) + (yEnd - yCurrent) * (yEnd - yCurrent));

		if(delta > dashsize)
		{
			context.lineTo(xCurrent + Math.cos(radians) * dashsize, yCurrent + Math.sin(radians) * dashsize);
		}
		else if(delta > 0)
		{
			context.lineTo(xCurrent + Math.cos(radians) * delta, yCurrent + Math.sin(radians) * delta);
		}

		context.moveTo(xEnd, yEnd);
	},

	//This should move to CanvasDrawing class.
    //Currently docmented in CanvasDrawing class.
    clear: function() {
		this._initProps();
        if(this.node)
        {
            this._context.clearRect(0, 0, this.node.width, this.node.height);
        }
        return this;
	},

	/**
	 * Returns the bounds for a shape.
	 *
     * Calculates the a new bounding box from the original corner coordinates (base on size and position) and the transform matrix.
     * The calculated bounding box is used by the graphic instance to calculate its viewBox.
     *
	 * @method getBounds
	 * @return Object
	 */
	getBounds: function()
	{
		var type = this._type,
			w = this.get("width"),
			h = this.get("height"),
			x = this.get("x"),
			y = this.get("y");
        if(type == "path")
        {
            x = x + this._left;
            y = y + this._top;
            w = this._right - this._left;
            h = this._bottom - this._top;
        }
        return this._getContentRect(w, h, x, y);
	},

    /**
     * Calculates the bounding box for the shape.
     *
     * @method _getContentRect
     * @param {Number} w width of the shape
     * @param {Number} h height of the shape
     * @param {Number} x x-coordinate of the shape
     * @param {Number} y y-coordinate of the shape
     * @private
     */
    _getContentRect: function(w, h, x, y)
    {
        var transformOrigin = this.get("transformOrigin"),
            transformX = transformOrigin[0] * w,
            transformY = transformOrigin[1] * h,
            transforms = this.matrix.getTransformArray(this.get("transform")),
            matrix = new Y.Matrix(),
            i,
            len = transforms.length,
            transform,
            key,
            contentRect;
        if(this._type == "path")
        {
            transformX = transformX + x;
            transformY = transformY + y;
        }
        transformX = !isNaN(transformX) ? transformX : 0;
        transformY = !isNaN(transformY) ? transformY : 0;
        matrix.translate(transformX, transformY);
        for(i = 0; i < len; i = i + 1)
        {
            transform = transforms[i];
            key = transform.shift();
            if(key)
            {
                matrix[key].apply(matrix, transform);
            }
        }
        matrix.translate(-transformX, -transformY);
        contentRect = matrix.getContentRect(w, h, x, y);
        return contentRect;
    },

    /**
     * Places the shape above all other shapes.
     *
     * @method toFront
     */
    toFront: function()
    {
        var graphic = this.get("graphic");
        if(graphic)
        {
            graphic._toFront(this);
        }
    },

    /**
     * Places the shape underneath all other shapes.
     *
     * @method toFront
     */
    toBack: function()
    {
        var graphic = this.get("graphic");
        if(graphic)
        {
            graphic._toBack(this);
        }
    },

    /**
     * Parses path data string and call mapped methods.
     *
     * @method _parsePathData
     * @param {String} val The path data
     * @private
     */
    _parsePathData: function(val)
    {
        var method,
            methodSymbol,
            args,
            commandArray = Y.Lang.trim(val.match(SPLITPATHPATTERN)),
            i,
            len,
            str,
            symbolToMethod = this._pathSymbolToMethod;
        if(commandArray)
        {
            this.clear();
            len = commandArray.length || 0;
            for(i = 0; i < len; i = i + 1)
            {
                str = commandArray[i];
                methodSymbol = str.substr(0, 1);
                args = str.substr(1).match(SPLITARGSPATTERN);
                method = symbolToMethod[methodSymbol];
                if(method)
                {
                    if(args)
                    {
                        this[method].apply(this, args);
                    }
                    else
                    {
                        this[method].apply(this);
                    }
                }
            }
            this.end();
        }
    },

    /**
     * Destroys the shape instance.
     *
     * @method destroy
     */
    destroy: function()
    {
        var graphic = this.get("graphic");
        if(graphic)
        {
            graphic.removeShape(this);
        }
        else
        {
            this._destroy();
        }
    },

    /**
     *  Implementation for shape destruction
     *
     *  @method destroy
     *  @protected
     */
    _destroy: function()
    {
        if(this.node)
        {
            Y.one(this.node).remove(true);
            this._context = null;
            this.node = null;
        }
    }
}, Y.CanvasDrawing.prototype));

CanvasShape.ATTRS =  {
	/**
	 * An array of x, y values which indicates the transformOrigin in which to rotate the shape. Valid values range between 0 and 1 representing a
	 * fraction of the shape's corresponding bounding box dimension. The default value is [0.5, 0.5].
	 *
	 * @config transformOrigin
	 * @type Array
	 */
	transformOrigin: {
		valueFn: function()
		{
			return [0.5, 0.5];
		}
	},

    /**
     * <p>A string containing, in order, transform operations applied to the shape instance. The `transform` string can contain the following values:
     *
     *    <dl>
     *        <dt>rotate</dt><dd>Rotates the shape clockwise around it transformOrigin.</dd>
     *        <dt>translate</dt><dd>Specifies a 2d translation.</dd>
     *        <dt>skew</dt><dd>Skews the shape around the x-axis and y-axis.</dd>
     *        <dt>scale</dt><dd>Specifies a 2d scaling operation.</dd>
     *        <dt>translateX</dt><dd>Translates the shape along the x-axis.</dd>
     *        <dt>translateY</dt><dd>Translates the shape along the y-axis.</dd>
     *        <dt>skewX</dt><dd>Skews the shape around the x-axis.</dd>
     *        <dt>skewY</dt><dd>Skews the shape around the y-axis.</dd>
     *        <dt>matrix</dt><dd>Specifies a 2D transformation matrix comprised of the specified six values.</dd>
     *    </dl>
     * </p>
     * <p>Applying transforms through the transform attribute will reset the transform matrix and apply a new transform. The shape class also contains
     * corresponding methods for each transform that will apply the transform to the current matrix. The below code illustrates how you might use the
     * `transform` attribute to instantiate a recangle with a rotation of 45 degrees.</p>
            var myRect = new Y.Rect({
                type:"rect",
                width: 50,
                height: 40,
                transform: "rotate(45)"
            };
     * <p>The code below would apply `translate` and `rotate` to an existing shape.</p>

        myRect.set("transform", "translate(40, 50) rotate(45)");
	 * @config transform
     * @type String
	 */
	transform: {
		setter: function(val)
		{
            this.matrix.init();
            this._transforms = this.matrix.getTransformArray(val);
            this._transform = val;
            return val;
		},

        getter: function()
        {
            return this._transform;
        }
	},

	/**
	 * Dom node for the shape
	 *
	 * @config node
	 * @type HTMLElement
	 * @readOnly
	 */
	node: {
		readOnly: true,

		getter: function()
		{
			return this.node;
		}
	},

	/**
	 * Unique id for class instance.
	 *
	 * @config id
	 * @type String
	 */
	id: {
		valueFn: function()
		{
			return Y.guid();
		},

		setter: function(val)
		{
			var node = this.node;
			if(node)
			{
				node.setAttribute("id", val);
			}
			return val;
		}
	},

	/**
	 * Indicates the width of the shape
	 *
	 * @config width
	 * @type Number
	 */
	width: {
        value: 0
    },

	/**
	 * Indicates the height of the shape
	 *
	 * @config height
	 * @type Number
	 */
	height: {
        value: 0
    },

	/**
	 * Indicates the x position of shape.
	 *
	 * @config x
	 * @type Number
	 */
	x: {
		value: 0
	},

	/**
	 * Indicates the y position of shape.
	 *
	 * @config y
	 * @type Number
	 */
	y: {
		value: 0
	},

	/**
	 * Indicates whether the shape is visible.
	 *
	 * @config visible
	 * @type Boolean
	 */
	visible: {
		value: true,

		setter: function(val){
			var node = this.get("node"),
                visibility = val ? "visible" : "hidden";
			if(node)
            {
                node.style.visibility = visibility;
            }
			return val;
		}
	},

	/**
	 * Contains information about the fill of the shape.
     *  <dl>
     *      <dt>color</dt><dd>The color of the fill.</dd>
     *      <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the fill. The default value is 1.</dd>
     *      <dt>type</dt><dd>Type of fill.
     *          <dl>
     *              <dt>solid</dt><dd>Solid single color fill. (default)</dd>
     *              <dt>linear</dt><dd>Linear gradient fill.</dd>
     *              <dt>radial</dt><dd>Radial gradient fill.</dd>
     *          </dl>
     *      </dd>
     *  </dl>
     *  <p>If a `linear` or `radial` is specified as the fill type. The following additional property is used:
     *  <dl>
     *      <dt>stops</dt><dd>An array of objects containing the following properties:
     *          <dl>
     *              <dt>color</dt><dd>The color of the stop.</dd>
     *              <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the stop. The default value is 1.
     *              Note: No effect for IE 6 - 8</dd>
     *              <dt>offset</dt><dd>Number between 0 and 1 indicating where the color stop is positioned.</dd>
     *          </dl>
     *      </dd>
     *      <p>Linear gradients also have the following property:</p>
     *      <dt>rotation</dt><dd>Linear gradients flow left to right by default. The rotation property allows you to change the
     *      flow by rotation. (e.g. A rotation of 180 would make the gradient pain from right to left.)</dd>
     *      <p>Radial gradients have the following additional properties:</p>
     *      <dt>r</dt><dd>Radius of the gradient circle.</dd>
     *      <dt>fx</dt><dd>Focal point x-coordinate of the gradient.</dd>
     *      <dt>fy</dt><dd>Focal point y-coordinate of the gradient.</dd>
     *  </dl>
     *  <p>The corresponding `SVGShape` class implements the following additional properties.</p>
     *  <dl>
     *      <dt>cx</dt><dd>
     *          <p>The x-coordinate of the center of the gradient circle. Determines where the color stop begins. The default value 0.5.</p>
     *          <p><strong>Note: </strong>Currently, this property is not implemented for corresponding `CanvasShape` and
     *          `VMLShape` classes which are used on Android or IE 6 - 8.</p>
     *      </dd>
     *      <dt>cy</dt><dd>
     *          <p>The y-coordinate of the center of the gradient circle. Determines where the color stop begins. The default value 0.5.</p>
     *          <p><strong>Note: </strong>Currently, this property is not implemented for corresponding `CanvasShape` and `VMLShape`
     *          classes which are used on Android or IE 6 - 8.</p>
     *      </dd>
     *  </dl>
     *  <p>These properties are not currently implemented in `CanvasShape` or `VMLShape`.</p>
	 *
	 * @config fill
	 * @type Object
	 */
	fill: {
		valueFn: "_getDefaultFill",

		setter: function(val)
		{
			var fill,
				tmpl = this.get("fill") || this._getDefaultFill();
			fill = (val) ? Y.merge(tmpl, val) : null;
			if(fill && fill.color)
			{
				if(fill.color === undefined || fill.color == "none")
				{
					fill.color = null;
				}
			}
			this._setFillProps(fill);
			return fill;
		}
	},

	/**
	 * Contains information about the stroke of the shape.
     *  <dl>
     *      <dt>color</dt><dd>The color of the stroke.</dd>
     *      <dt>weight</dt><dd>Number that indicates the width of the stroke.</dd>
     *      <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the stroke. The default value is 1.</dd>
     *      <dt>dashstyle</dt>Indicates whether to draw a dashed stroke. When set to "none", a solid stroke is drawn. When set
     *      to an array, the first index indicates the length of the dash. The second index indicates the length of gap.
     *      <dt>linecap</dt><dd>Specifies the linecap for the stroke. The following values can be specified:
     *          <dl>
     *              <dt>butt (default)</dt><dd>Specifies a butt linecap.</dd>
     *              <dt>square</dt><dd>Specifies a sqare linecap.</dd>
     *              <dt>round</dt><dd>Specifies a round linecap.</dd>
     *          </dl>
     *      </dd>
     *      <dt>linejoin</dt><dd>Specifies a linejoin for the stroke. The following values can be specified:
     *          <dl>
     *              <dt>round (default)</dt><dd>Specifies that the linejoin will be round.</dd>
     *              <dt>bevel</dt><dd>Specifies a bevel for the linejoin.</dd>
     *              <dt>miter limit</dt><dd>An integer specifying the miter limit of a miter linejoin. If you want to specify a linejoin
     *              of miter, you simply specify the limit as opposed to having separate miter and miter limit values.</dd>
     *          </dl>
     *      </dd>
     *  </dl>
	 *
	 * @config stroke
	 * @type Object
	 */
	stroke: {
		valueFn: "_getDefaultStroke",

		setter: function(val)
		{
			var tmpl = this.get("stroke") || this._getDefaultStroke(),
                wt;
            if(val && val.hasOwnProperty("weight"))
            {
                wt = parseInt(val.weight, 10);
                if(!isNaN(wt))
                {
                    val.weight = wt;
                }
            }
			val = (val) ? Y.merge(tmpl, val) : null;
			this._setStrokeProps(val);
			return val;
		}
	},

	//Not used. Remove in future.
	autoSize: {
		value: false
	},

	// Only implemented in SVG
	// Determines whether the instance will receive mouse events.
	//
	// @config pointerEvents
	// @type string
	//
	pointerEvents: {
		value: "visiblePainted"
	},

    /**
     * Represents an SVG Path string. This will be parsed and added to shape's API to represent the SVG data across all
     * implementations. Note that when using VML or SVG implementations, part of this content will be added to the DOM using
     * respective VML/SVG attributes. If your content comes from an untrusted source, you will need to ensure that no
     * malicious code is included in that content.
     *
     * @config data
     * @type String
     */
    data: {
        setter: function(val)
        {
            if(this.get("node"))
            {
                this._parsePathData(val);
            }
            return val;
        }
    },

	/**
	 * Reference to the container Graphic.
	 *
	 * @config graphic
	 * @type Graphic
	 */
	graphic: {
		readOnly: true,

		getter: function()
		{
			return this._graphic;
		}
    }
};
Y.CanvasShape = CanvasShape;
/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the <a href="Path.html">`Path`</a> class.
 * `CanvasPath` is not intended to be used directly. Instead, use the <a href="Path.html">`Path`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Path.html">`Path`</a>
 * class will point to the `CanvasPath` class.
 *
 * @module graphics
 * @class CanvasPath
 * @extends CanvasShape
 */
CanvasPath = function(cfg)
{
	CanvasPath.superclass.constructor.apply(this, arguments);
};
CanvasPath.NAME = "path";
Y.extend(CanvasPath, Y.CanvasShape, {
    /**
     * Indicates the type of shape
     *
     * @property _type
     * @type String
     * @private
     */
    _type: "path",

	/**
	 * Draws the shape.
	 *
	 * @method _draw
	 * @private
	 */
    _draw: function()
    {
        this._closePath();
        this._updateTransform();
    },

	/**
	 * Creates the dom node for the shape.
	 *
     * @method createNode
	 * @return HTMLElement
	 * @private
	 */
	createNode: function()
	{
		var host = this,
            node = Y.config.doc.createElement('canvas'),
			name = host.name,
            concat = host._camelCaseConcat,
            id = host.get("id");
		host._context = node.getContext('2d');
		node.setAttribute("overflow", "visible");
        node.setAttribute("pointer-events", "none");
        node.style.pointerEvents = "none";
        node.style.overflow = "visible";
		node.setAttribute("id", id);
		id = "#" + id;
		host.node = node;
		host.addClass(_getClassName(SHAPE) + " " + _getClassName(concat(IMPLEMENTATION, SHAPE)) + " " + _getClassName(name) + " " + _getClassName(concat(IMPLEMENTATION, name)));
	},

    /**
     * Completes a drawing operation.
     *
     * @method end
     */
    end: function()
    {
        this._draw();
    }
});

CanvasPath.ATTRS = Y.merge(Y.CanvasShape.ATTRS, {
	/**
	 * Indicates the width of the shape
	 *
	 * @config width
	 * @type Number
	 */
	width: {
		getter: function()
		{
			var offset = this._stroke && this._strokeWeight ? (this._strokeWeight * 2) : 0;
			return this._width - offset;
		},

		setter: function(val)
		{
			this._width = val;
			return val;
		}
	},

	/**
	 * Indicates the height of the shape
	 *
	 * @config height
	 * @type Number
	 */
	height: {
		getter: function()
		{
			var offset = this._stroke && this._strokeWeight ? (this._strokeWeight * 2) : 0;
            return this._height - offset;
		},

		setter: function(val)
		{
			this._height = val;
			return val;
		}
	},

	/**
	 * Indicates the path used for the node.
	 *
	 * @config path
	 * @type String
     * @readOnly
	 */
	path: {
        readOnly: true,

		getter: function()
		{
			return this._path;
		}
	}
});
Y.CanvasPath = CanvasPath;
/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the <a href="Rect.html">`Rect`</a> class.
 * `CanvasRect` is not intended to be used directly. Instead, use the <a href="Rect.html">`Rect`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Rect.html">`Rect`</a>
 * class will point to the `CanvasRect` class.
 *
 * @module graphics
 * @class CanvasRect
 * @constructor
 */
CanvasRect = function()
{
	CanvasRect.superclass.constructor.apply(this, arguments);
};
CanvasRect.NAME = "rect";
Y.extend(CanvasRect, Y.CanvasShape, {
	/**
	 * Indicates the type of shape
	 *
	 * @property _type
	 * @type String
     * @private
	 */
	_type: "rect",

	/**
	 * Draws the shape.
	 *
	 * @method _draw
	 * @private
	 */
	_draw: function()
	{
		var w = this.get("width"),
			h = this.get("height");
		this.clear();
        this.drawRect(0, 0, w, h);
		this._closePath();
	}
});
CanvasRect.ATTRS = Y.CanvasShape.ATTRS;
Y.CanvasRect = CanvasRect;
/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the <a href="Ellipse.html">`Ellipse`</a> class.
 * `CanvasEllipse` is not intended to be used directly. Instead, use the <a href="Ellipse.html">`Ellipse`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Ellipse.html">`Ellipse`</a>
 * class will point to the `CanvasEllipse` class.
 *
 * @module graphics
 * @class CanvasEllipse
 * @constructor
 */
CanvasEllipse = function(cfg)
{
	CanvasEllipse.superclass.constructor.apply(this, arguments);
};

CanvasEllipse.NAME = "ellipse";

Y.extend(CanvasEllipse, CanvasShape, {
	/**
	 * Indicates the type of shape
	 *
	 * @property _type
	 * @type String
     * @private
	 */
	_type: "ellipse",

	/**
     * Draws the shape.
     *
     * @method _draw
	 * @private
	 */
	_draw: function()
	{
		var w = this.get("width"),
			h = this.get("height");
		this.clear();
        this.drawEllipse(0, 0, w, h);
		this._closePath();
	}
});
CanvasEllipse.ATTRS = Y.merge(CanvasShape.ATTRS, {
	/**
	 * Horizontal radius for the ellipse.
	 *
	 * @config xRadius
	 * @type Number
	 */
	xRadius: {
		setter: function(val)
		{
			this.set("width", val * 2);
		},

		getter: function()
		{
			var val = this.get("width");
			if(val)
			{
				val *= 0.5;
			}
			return val;
		}
	},

	/**
	 * Vertical radius for the ellipse.
	 *
	 * @config yRadius
	 * @type Number
	 * @readOnly
	 */
	yRadius: {
		setter: function(val)
		{
			this.set("height", val * 2);
		},

		getter: function()
		{
			var val = this.get("height");
			if(val)
			{
				val *= 0.5;
			}
			return val;
		}
	}
});
Y.CanvasEllipse = CanvasEllipse;
/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the <a href="Circle.html">`Circle`</a> class.
 * `CanvasCircle` is not intended to be used directly. Instead, use the <a href="Circle.html">`Circle`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Circle.html">`Circle`</a>
 * class will point to the `CanvasCircle` class.
 *
 * @module graphics
 * @class CanvasCircle
 * @constructor
 */
CanvasCircle = function(cfg)
{
	CanvasCircle.superclass.constructor.apply(this, arguments);
};

CanvasCircle.NAME = "circle";

Y.extend(CanvasCircle, Y.CanvasShape, {
	/**
	 * Indicates the type of shape
	 *
	 * @property _type
	 * @type String
     * @private
	 */
	_type: "circle",

	/**
     * Draws the shape.
     *
     * @method _draw
	 * @private
	 */
	_draw: function()
	{
		var radius = this.get("radius");
		if(radius)
		{
            this.clear();
            this.drawCircle(0, 0, radius);
			this._closePath();
		}
	}
});

CanvasCircle.ATTRS = Y.merge(Y.CanvasShape.ATTRS, {
	/**
	 * Indicates the width of the shape
	 *
	 * @config width
	 * @type Number
	 */
	width: {
        setter: function(val)
        {
            this.set("radius", val/2);
            return val;
        },

		getter: function()
		{
			return this.get("radius") * 2;
		}
	},

	/**
	 * Indicates the height of the shape
	 *
	 * @config height
	 * @type Number
	 */
	height: {
        setter: function(val)
        {
            this.set("radius", val/2);
            return val;
        },

		getter: function()
		{
			return this.get("radius") * 2;
		}
	},

	/**
	 * Radius of the circle
	 *
	 * @config radius
     * @type Number
	 */
	radius: {
		lazyAdd: false
	}
});
Y.CanvasCircle = CanvasCircle;
/**
 * Draws pie slices
 *
 * @module graphics
 * @class CanvasPieSlice
 * @constructor
 */
CanvasPieSlice = function()
{
	CanvasPieSlice.superclass.constructor.apply(this, arguments);
};
CanvasPieSlice.NAME = "canvasPieSlice";
Y.extend(CanvasPieSlice, Y.CanvasShape, {
    /**
     * Indicates the type of shape
     *
     * @property _type
     * @type String
     * @private
     */
    _type: "path",

	/**
	 * Change event listener
	 *
	 * @private
	 * @method _updateHandler
	 */
	_draw: function(e)
	{
        var x = this.get("cx"),
            y = this.get("cy"),
            startAngle = this.get("startAngle"),
            arc = this.get("arc"),
            radius = this.get("radius");
        this.clear();
        this._left = x;
        this._right = radius;
        this._top = y;
        this._bottom = radius;
        this.drawWedge(x, y, startAngle, arc, radius);
		this.end();
	}
 });
CanvasPieSlice.ATTRS = Y.mix({
    cx: {
        value: 0
    },

    cy: {
        value: 0
    },
    /**
     * Starting angle in relation to a circle in which to begin the pie slice drawing.
     *
     * @config startAngle
     * @type Number
     */
    startAngle: {
        value: 0
    },

    /**
     * Arc of the slice.
     *
     * @config arc
     * @type Number
     */
    arc: {
        value: 0
    },

    /**
     * Radius of the circle in which the pie slice is drawn
     *
     * @config radius
     * @type Number
     */
    radius: {
        value: 0
    }
}, Y.CanvasShape.ATTRS);
Y.CanvasPieSlice = CanvasPieSlice;
/**
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> implementation of the `Graphic` class.
 * `CanvasGraphic` is not intended to be used directly. Instead, use the <a href="Graphic.html">`Graphic`</a> class.
 * If the browser lacks <a href="http://www.w3.org/TR/SVG/">SVG</a> capabilities but has
 * <a href="http://www.w3.org/TR/html5/the-canvas-element.html">Canvas</a> capabilities, the <a href="Graphic.html">`Graphic`</a>
 * class will point to the `CanvasGraphic` class.
 *
 * @module graphics
 * @class CanvasGraphic
 * @constructor
 */
function CanvasGraphic(config) {

    CanvasGraphic.superclass.constructor.apply(this, arguments);
}

CanvasGraphic.NAME = "canvasGraphic";

CanvasGraphic.ATTRS = {
    /**
     * Whether or not to render the `Graphic` automatically after to a specified parent node after init. This can be a Node
     * instance or a CSS selector string.
     *
     * @config render
     * @type Node | String
     */
    render: {},

    /**
	 * Unique id for class instance.
	 *
	 * @config id
	 * @type String
	 */
	id: {
		valueFn: function()
		{
			return Y.guid();
		},

		setter: function(val)
		{
			var node = this._node;
			if(node)
			{
				node.setAttribute("id", val);
			}
			return val;
		}
	},

    /**
     * Key value pairs in which a shape instance is associated with its id.
     *
     *  @config shapes
     *  @type Object
     *  @readOnly
     */
    shapes: {
        readOnly: true,

        getter: function()
        {
            return this._shapes;
        }
    },

    /**
     *  Object containing size and coordinate data for the content of a Graphic in relation to the graphic instance's position.
     *
     *  @config contentBounds
     *  @type Object
     *  @readOnly
     */
    contentBounds: {
        readOnly: true,

        getter: function()
        {
            return this._contentBounds;
        }
    },

    /**
     *  The outermost html element of the Graphic instance.
     *
     *  @config node
     *  @type HTMLElement
     *  @readOnly
     */
    node: {
        readOnly: true,

        getter: function()
        {
            return this._node;
        }
    },

	/**
	 * Indicates the width of the `Graphic`.
	 *
	 * @config width
	 * @type Number
	 */
    width: {
        setter: function(val)
        {
            if(this._node)
            {
                this._node.style.width = val + "px";
            }
            return val;
        }
    },

	/**
	 * Indicates the height of the `Graphic`.
	 *
	 * @config height
	 * @type Number
	 */
    height: {
        setter: function(val)
        {
            if(this._node)
            {
                this._node.style.height = val + "px";
            }
            return val;
        }
    },

    /**
     *  Determines the sizing of the Graphic.
     *
     *  <dl>
     *      <dt>sizeContentToGraphic</dt><dd>The Graphic's width and height attributes are, either explicitly set through the
     *      <code>width</code> and <code>height</code> attributes or are determined by the dimensions of the parent element. The
     *      content contained in the Graphic will be sized to fit with in the Graphic instance's dimensions. When using this
     *      setting, the <code>preserveAspectRatio</code> attribute will determine how the contents are sized.</dd>
     *      <dt>sizeGraphicToContent</dt><dd>(Also accepts a value of true) The Graphic's width and height are determined by the
     *      size and positioning of the content.</dd>
     *      <dt>false</dt><dd>The Graphic's width and height attributes are, either explicitly set through the <code>width</code>
     *      and <code>height</code> attributes or are determined by the dimensions of the parent element. The contents of the
     *      Graphic instance are not affected by this setting.</dd>
     *  </dl>
     *
     *
     *  @config autoSize
     *  @type Boolean | String
     *  @default false
     */
    autoSize: {
        value: false
    },

    /**
     * Determines how content is sized when <code>autoSize</code> is set to <code>sizeContentToGraphic</code>.
     *
     *  <dl>
     *      <dt>none<dt><dd>Do not force uniform scaling. Scale the graphic content of the given element non-uniformly if necessary
     *      such that the element's bounding box exactly matches the viewport rectangle.</dd>
     *      <dt>xMinYMin</dt><dd>Force uniform scaling position along the top left of the Graphic's node.</dd>
     *      <dt>xMidYMin</dt><dd>Force uniform scaling horizontally centered and positioned at the top of the Graphic's node.<dd>
     *      <dt>xMaxYMin</dt><dd>Force uniform scaling positioned horizontally from the right and vertically from the top.</dd>
     *      <dt>xMinYMid</dt>Force uniform scaling positioned horizontally from the left and vertically centered.</dd>
     *      <dt>xMidYMid (the default)</dt><dd>Force uniform scaling with the content centered.</dd>
     *      <dt>xMaxYMid</dt><dd>Force uniform scaling positioned horizontally from the right and vertically centered.</dd>
     *      <dt>xMinYMax</dt><dd>Force uniform scaling positioned horizontally from the left and vertically from the bottom.</dd>
     *      <dt>xMidYMax</dt><dd>Force uniform scaling horizontally centered and position vertically from the bottom.</dd>
     *      <dt>xMaxYMax</dt><dd>Force uniform scaling positioned horizontally from the right and vertically from the bottom.</dd>
     *  </dl>
     *
     * @config preserveAspectRatio
     * @type String
     * @default xMidYMid
     */
    preserveAspectRatio: {
        value: "xMidYMid"
    },

    /**
     * The contentBounds will resize to greater values but not smaller values. (for performance)
     * When resizing the contentBounds down is desirable, set the resizeDown value to true.
     *
     * @config resizeDown
     * @type Boolean
     */
    resizeDown: {
        value: false
    },

	/**
	 * Indicates the x-coordinate for the instance.
	 *
	 * @config x
	 * @type Number
	 */
    x: {
        getter: function()
        {
            return this._x;
        },

        setter: function(val)
        {
            this._x = val;
            if(this._node)
            {
                this._node.style.left = val + "px";
            }
            return val;
        }
    },

	/**
	 * Indicates the y-coordinate for the instance.
	 *
	 * @config y
	 * @type Number
	 */
    y: {
        getter: function()
        {
            return this._y;
        },

        setter: function(val)
        {
            this._y = val;
            if(this._node)
            {
                this._node.style.top = val + "px";
            }
            return val;
        }
    },

    /**
     * Indicates whether or not the instance will automatically redraw after a change is made to a shape.
     * This property will get set to false when batching operations.
     *
     * @config autoDraw
     * @type Boolean
     * @default true
     * @private
     */
    autoDraw: {
        value: true
    },

	/**
	 * Indicates whether the `Graphic` and its children are visible.
	 *
	 * @config visible
	 * @type Boolean
	 */
    visible: {
        value: true,

        setter: function(val)
        {
            this._toggleVisible(val);
            return val;
        }
    }
};

Y.extend(CanvasGraphic, Y.GraphicBase, {
    /**
     * Sets the value of an attribute.
     *
     * @method set
     * @param {String|Object} name The name of the attribute. Alternatively, an object of key value pairs can
     * be passed in to set multiple attributes at once.
     * @param {Any} value The value to set the attribute to. This value is ignored if an object is received as
     * the name param.
     */
	set: function(attr, value)
	{
		var host = this,
            redrawAttrs = {
                autoDraw: true,
                autoSize: true,
                preserveAspectRatio: true,
                resizeDown: true
            },
            key,
            forceRedraw = false;
		AttributeLite.prototype.set.apply(host, arguments);
        if(host._state.autoDraw === true && Y.Object.size(this._shapes) > 0)
        {
            if(Y_LANG.isString && redrawAttrs[attr])
            {
                forceRedraw = true;
            }
            else if(Y_LANG.isObject(attr))
            {
                for(key in redrawAttrs)
                {
                    if(redrawAttrs.hasOwnProperty(key) && attr[key])
                    {
                        forceRedraw = true;
                        break;
                    }
                }
            }
        }
        if(forceRedraw)
        {
            host._redraw();
        }
	},

    /**
     * Storage for `x` attribute.
     *
     * @property _x
     * @type Number
     * @private
     */
    _x: 0,

    /**
     * Storage for `y` attribute.
     *
     * @property _y
     * @type Number
     * @private
     */
    _y: 0,

    /**
     * Gets the current position of the graphic instance in page coordinates.
     *
     * @method getXY
     * @return Array The XY position of the shape.
     */
    getXY: function()
    {
        var node = Y.one(this._node),
            xy;
        if(node)
        {
            xy = node.getXY();
        }
        return xy;
    },

	/**
     * Initializes the class.
     *
     * @method initializer
     * @param {Object} config Optional attributes
     * @private
     */
    initializer: function(config) {
        var render = this.get("render"),
            visibility = this.get("visible") ? "visible" : "hidden",
            w = this.get("width") || 0,
            h = this.get("height") || 0;
        this._shapes = {};
        this._redrawQueue = {};
		this._contentBounds = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        this._node = DOCUMENT.createElement('div');
        this._node.style.position = "absolute";
        this._node.style.visibility = visibility;
        this.set("width", w);
        this.set("height", h);
        if(render)
        {
            this.render(render);
        }
    },

    /**
     * Adds the graphics node to the dom.
     *
     * @method render
     * @param {HTMLElement} parentNode node in which to render the graphics node into.
     */
    render: function(render) {
        var parentNode = Y.one(render),
            node = this._node,
            w = this.get("width") || parseInt(parentNode.getComputedStyle("width"), 10),
            h = this.get("height") || parseInt(parentNode.getComputedStyle("height"), 10);
        parentNode = parentNode || DOCUMENT.body;
        parentNode.appendChild(node);
        node.style.display = "block";
        node.style.position = "absolute";
        node.style.left = "0px";
        node.style.top = "0px";
        this.set("width", w);
        this.set("height", h);
        this.parentNode = parentNode;
        return this;
    },

    /**
     * Removes all nodes.
     *
     * @method destroy
     */
    destroy: function()
    {
        this.removeAllShapes();
        if(this._node)
        {
            this._removeChildren(this._node);
            Y.one(this._node).destroy();
        }
    },

    /**
     * Generates a shape instance by type.
     *
     * @method addShape
     * @param {Object} cfg attributes for the shape
     * @return Shape
     */
    addShape: function(cfg)
    {
        cfg.graphic = this;
        if(!this.get("visible"))
        {
            cfg.visible = false;
        }
        var shapeClass = this._getShapeClass(cfg.type),
            shape = new shapeClass(cfg);
        this._appendShape(shape);
        return shape;
    },

    /**
     * Adds a shape instance to the graphic instance.
     *
     * @method _appendShape
     * @param {Shape} shape The shape instance to be added to the graphic.
     * @private
     */
    _appendShape: function(shape)
    {
        var node = shape.node,
            parentNode = this._frag || this._node;
        if(this.get("autoDraw"))
        {
            parentNode.appendChild(node);
        }
        else
        {
            this._getDocFrag().appendChild(node);
        }
    },

    /**
     * Removes a shape instance from from the graphic instance.
     *
     * @method removeShape
     * @param {Shape|String} shape The instance or id of the shape to be removed.
     */
    removeShape: function(shape)
    {
        if(!(shape instanceof CanvasShape))
        {
            if(Y_LANG.isString(shape))
            {
                shape = this._shapes[shape];
            }
        }
        if(shape && shape instanceof CanvasShape)
        {
            shape._destroy();
            delete this._shapes[shape.get("id")];
        }
        if(this.get("autoDraw"))
        {
            this._redraw();
        }
        return shape;
    },

    /**
     * Removes all shape instances from the dom.
     *
     * @method removeAllShapes
     */
    removeAllShapes: function()
    {
        var shapes = this._shapes,
            i;
        for(i in shapes)
        {
            if(shapes.hasOwnProperty(i))
            {
                shapes[i].destroy();
            }
        }
        this._shapes = {};
    },

    /**
     * Clears the graphics object.
     *
     * @method clear
     */
    clear: function() {
        this.removeAllShapes();
    },

    /**
     * Removes all child nodes.
     *
     * @method _removeChildren
     * @param {HTMLElement} node
     * @private
     */
    _removeChildren: function(node)
    {
        if(node && node.hasChildNodes())
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
     * Toggles visibility
     *
     * @method _toggleVisible
     * @param {Boolean} val indicates visibilitye
     * @private
     */
    _toggleVisible: function(val)
    {
        var i,
            shapes = this._shapes,
            visibility = val ? "visible" : "hidden";
        if(shapes)
        {
            for(i in shapes)
            {
                if(shapes.hasOwnProperty(i))
                {
                    shapes[i].set("visible", val);
                }
            }
        }
        if(this._node)
        {
            this._node.style.visibility = visibility;
        }
    },

    /**
     * Returns a shape class. Used by `addShape`.
     *
     * @method _getShapeClass
     * @param {Shape | String} val Indicates which shape class.
     * @return Function
     * @private
     */
    _getShapeClass: function(val)
    {
        var shape = this._shapeClass[val];
        if(shape)
        {
            return shape;
        }
        return val;
    },

    /**
     * Look up for shape classes. Used by `addShape` to retrieve a class for instantiation.
     *
     * @property _shapeClass
     * @type Object
     * @private
     */
    _shapeClass: {
        circle: Y.CanvasCircle,
        rect: Y.CanvasRect,
        path: Y.CanvasPath,
        ellipse: Y.CanvasEllipse,
        pieslice: Y.CanvasPieSlice
    },

    /**
     * Returns a shape based on the id of its dom node.
     *
     * @method getShapeById
     * @param {String} id Dom id of the shape's node attribute.
     * @return Shape
     */
    getShapeById: function(id)
    {
        var shape = this._shapes[id];
        return shape;
    },

	/**
	 * Allows for creating multiple shapes in order to batch appending and redraw operations.
	 *
	 * @method batch
	 * @param {Function} method Method to execute.
	 */
    batch: function(method)
    {
        var autoDraw = this.get("autoDraw");
        this.set("autoDraw", false);
        method();
        this.set("autoDraw", autoDraw);
    },

    /**
     * Returns a document fragment to for attaching shapes.
     *
     * @method _getDocFrag
     * @return DocumentFragment
     * @private
     */
    _getDocFrag: function()
    {
        if(!this._frag)
        {
            this._frag = DOCUMENT.createDocumentFragment();
        }
        return this._frag;
    },

    /**
     * Redraws all shapes.
     *
     * @method _redraw
     * @private
     */
    _redraw: function()
    {
        var autoSize = this.get("autoSize"),
            preserveAspectRatio = this.get("preserveAspectRatio"),
            box = this.get("resizeDown") ? this._getUpdatedContentBounds() : this._contentBounds,
            contentWidth,
            contentHeight,
            w,
            h,
            xScale,
            yScale,
            translateX = 0,
            translateY = 0,
            matrix,
            node = this.get("node");
        if(autoSize)
        {
            if(autoSize == "sizeContentToGraphic")
            {
                contentWidth = box.right - box.left;
                contentHeight = box.bottom - box.top;
                w = parseFloat(Y_DOM.getComputedStyle(node, "width"));
                h = parseFloat(Y_DOM.getComputedStyle(node, "height"));
                matrix = new Y.Matrix();
                if(preserveAspectRatio == "none")
                {
                    xScale = w/contentWidth;
                    yScale = h/contentHeight;
                }
                else
                {
                    if(contentWidth/contentHeight !== w/h)
                    {
                        if(contentWidth * h/contentHeight > w)
                        {
                            xScale = yScale = w/contentWidth;
                            translateY = this._calculateTranslate(preserveAspectRatio.slice(5).toLowerCase(), contentHeight * w/contentWidth, h);
                        }
                        else
                        {
                            xScale = yScale = h/contentHeight;
                            translateX = this._calculateTranslate(preserveAspectRatio.slice(1, 4).toLowerCase(), contentWidth * h/contentHeight, w);
                        }
                    }
                }
                Y_DOM.setStyle(node, "transformOrigin", "0% 0%");
                translateX = translateX - (box.left * xScale);
                translateY = translateY - (box.top * yScale);
                matrix.translate(translateX, translateY);
                matrix.scale(xScale, yScale);
                Y_DOM.setStyle(node, "transform", matrix.toCSSText());
            }
            else
            {
                this.set("width", box.right);
                this.set("height", box.bottom);
            }
        }
        if(this._frag)
        {
            this._node.appendChild(this._frag);
            this._frag = null;
        }
    },

    /**
     * Determines the value for either an x or y value to be used for the <code>translate</code> of the Graphic.
     *
     * @method _calculateTranslate
     * @param {String} position The position for placement. Possible values are min, mid and max.
     * @param {Number} contentSize The total size of the content.
     * @param {Number} boundsSize The total size of the Graphic.
     * @return Number
     * @private
     */
    _calculateTranslate: function(position, contentSize, boundsSize)
    {
        var ratio = boundsSize - contentSize,
            coord;
        switch(position)
        {
            case "mid" :
                coord = ratio * 0.5;
            break;
            case "max" :
                coord = ratio;
            break;
            default :
                coord = 0;
            break;
        }
        return coord;
    },

    /**
     * Adds a shape to the redraw queue and calculates the contentBounds. Used internally
     * by `Shape` instances.
     *
     * @method addToRedrawQueue
     * @param Shape shape The shape instance to add to the queue
     * @protected
     */
    addToRedrawQueue: function(shape)
    {
        var shapeBox,
            box;
        this._shapes[shape.get("id")] = shape;
        if(!this.get("resizeDown"))
        {
            shapeBox = shape.getBounds();
            box = this._contentBounds;
            box.left = box.left < shapeBox.left ? box.left : shapeBox.left;
            box.top = box.top < shapeBox.top ? box.top : shapeBox.top;
            box.right = box.right > shapeBox.right ? box.right : shapeBox.right;
            box.bottom = box.bottom > shapeBox.bottom ? box.bottom : shapeBox.bottom;
            this._contentBounds = box;
        }
        if(this.get("autoDraw"))
        {
            this._redraw();
        }
    },

    /**
     * Recalculates and returns the `contentBounds` for the `Graphic` instance.
     *
     * @method _getUpdatedContentBounds
     * @return {Object}
     * @private
     */
    _getUpdatedContentBounds: function()
    {
        var bounds,
            i,
            shape,
            queue = this._shapes,
            box = {};
        for(i in queue)
        {
            if(queue.hasOwnProperty(i))
            {
                shape = queue[i];
                bounds = shape.getBounds();
                box.left = Y_LANG.isNumber(box.left) ? Math.min(box.left, bounds.left) : bounds.left;
                box.top = Y_LANG.isNumber(box.top) ? Math.min(box.top, bounds.top) : bounds.top;
                box.right = Y_LANG.isNumber(box.right) ? Math.max(box.right, bounds.right) : bounds.right;
                box.bottom = Y_LANG.isNumber(box.bottom) ? Math.max(box.bottom, bounds.bottom) : bounds.bottom;
            }
        }
        box.left = Y_LANG.isNumber(box.left) ? box.left : 0;
        box.top = Y_LANG.isNumber(box.top) ? box.top : 0;
        box.right = Y_LANG.isNumber(box.right) ? box.right : 0;
        box.bottom = Y_LANG.isNumber(box.bottom) ? box.bottom : 0;
        this._contentBounds = box;
        return box;
    },

    /**
     * Inserts shape on the top of the tree.
     *
     * @method _toFront
     * @param {CanvasShape} Shape to add.
     * @private
     */
    _toFront: function(shape)
    {
        var contentNode = this.get("node");
        if(shape instanceof Y.CanvasShape)
        {
            shape = shape.get("node");
        }
        if(contentNode && shape)
        {
            contentNode.appendChild(shape);
        }
    },

    /**
     * Inserts shape as the first child of the content node.
     *
     * @method _toBack
     * @param {CanvasShape} Shape to add.
     * @private
     */
    _toBack: function(shape)
    {
        var contentNode = this.get("node"),
            targetNode;
        if(shape instanceof Y.CanvasShape)
        {
            shape = shape.get("node");
        }
        if(contentNode && shape)
        {
            targetNode = contentNode.firstChild;
            if(targetNode)
            {
                contentNode.insertBefore(shape, targetNode);
            }
            else
            {
                contentNode.appendChild(shape);
            }
        }
    }
});

Y.CanvasGraphic = CanvasGraphic;


}, '3.8.1', {"requires": ["graphics"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('charts-base', function (Y, NAME) {

/**
 * The Charts widget provides an api for displaying data
 * graphically.
 *
 * @module charts
 * @main charts
 */

/**
 * The charts-base submodule contains the core functionality for the charts module.
 *
 * @module charts
 * @submodule charts-base
 */
var CONFIG = Y.config,
    WINDOW = CONFIG.win,
    DOCUMENT = CONFIG.doc,
    Y_Lang = Y.Lang,
    IS_STRING = Y_Lang.isString,
    Y_DOM = Y.DOM,
    LeftAxisLayout,
    RightAxisLayout,
    BottomAxisLayout,
    TopAxisLayout,
    _getClassName = Y.ClassNameManager.getClassName,
    SERIES_MARKER = _getClassName("seriesmarker"),
    ShapeGroup,
    CircleGroup,
    RectGroup,
    EllipseGroup,
    DiamondGroup;

/**
 * Abstract class for creating groups of shapes with the same styles and dimensions.
 *
 * @class ShapeGroup
 * @constructor
 */
 ShapeGroup = function(cfg)
 {
    ShapeGroup.superclass.constructor.apply(this, arguments);
 };

 ShapeGroup.NAME = "shapeGroup";

 Y.extend(ShapeGroup, Y.Path, {
    /**
     * Updates the shape.
     *
     * @method _draw
     * @private
     */
    _draw: function()
    {
        var xvalues = this.get("xvalues"),
            yvalues = this.get("yvalues"),
            x,
            y,
            xRad,
            yRad,
            i = 0,
            len,
            attrs = [],
            dimensions = this.get("dimensions"),
            width = dimensions.width,
            height = dimensions.height,
            radius = dimensions.radius,
            yRadius = dimensions.yRadius,
            id = this.get("id"),
            className = this.node.className,
            widthIsArray = Y_Lang.isArray(width),
            heightIsArray = Y_Lang.isArray(height),
            radiusIsArray = Y_Lang.isArray(radius),
            yRadiusIsArray = Y_Lang.isArray(yRadius);
        if(xvalues && yvalues && xvalues.length > 0)
        {
            this.clear();

            len = xvalues.length;
            for(; i < len; ++i)
            {
                x = xvalues[i];
                y = yvalues[i];
                xRad = radiusIsArray ? radius[i] : radius;
                yRad = yRadiusIsArray ? yRadius[i] : yRadius;
                if(!isNaN(x) && !isNaN(y) && !isNaN(xRad))
                {
                    this.drawShape({
                        x: x,
                        y: y,
                        width: widthIsArray ? width[i] : width,
                        height: heightIsArray ? height[i] : height,
                        radius: xRad,
                        yRadius: yRad
                    });
                    this.closePath();
                    attrs[i] = {
                        id: id + "_" + i,
                        className: className,
                        coords: (x - this._left) + ", " + (y - this._top)  + ", " + radius,
                        shape: "circle"
                    };
                }
            }
            this._closePath();
        }
    },

    /**
     * Parses and array of lengths into radii
     *
     * @method _getRadiusCollection
     * @param {Array} val Array of lengths
     * @return Array
     * @private
     */
    _getRadiusCollection: function(val)
    {
        var i = 0,
            len = val.length,
            radii = [];
        for(; i < len; ++i)
        {
            radii[i] = val[i] * 0.5;
        }
        return radii;
    }
 });

ShapeGroup.ATTRS = Y.merge(Y.Path.ATTRS, {
    dimensions: {
        getter: function()
        {
            var dimensions = this._dimensions,
                radius,
                yRadius,
                width,
                height;
            if(dimensions.hasOwnProperty("radius"))
            {
                return dimensions;
            }
            else
            {
                width = dimensions.width;
                height = dimensions.height;
                radius = Y_Lang.isArray(width) ? this._getRadiusCollection(width) : (width * 0.5);
                yRadius = Y_Lang.isArray(height) ? this._getRadiusCollection(height) : (height * 0.5);
                return {
                    width: width,
                    height: height,
                    radius: radius,
                    yRadius: yRadius
                };
            }
        },

        setter: function(val)
        {
            this._dimensions = val;
            return val;
        }
    },
    xvalues: {
        getter: function()
        {
            return this._xvalues;
        },
        setter: function(val)
        {
            this._xvalues = val;
        }
    },
    yvalues: {
        getter: function()
        {
            return this._yvalues;
        },
        setter: function(val)
        {
            this._yvalues = val;
        }
    }
});
Y.ShapeGroup = ShapeGroup;
/**
 * Abstract class for creating groups of circles with the same styles and dimensions.
 *
 * @module charts
 * @submodule charts-base
 * @class CircleGroup
 * @constructor
 */
 CircleGroup = function(cfg)
 {
    CircleGroup.superclass.constructor.apply(this, arguments);
 };

 CircleGroup.NAME = "circleGroup";

 Y.extend(CircleGroup, Y.ShapeGroup, {
    /**
     * Algorithm for drawing shape.
     *
     * @method drawShape
     * @param {Object} cfg Parameters used to draw the shape.
     */
    drawShape: function(cfg)
    {
        this.drawCircle(cfg.x, cfg.y, cfg.radius);
    }
 });

CircleGroup.ATTRS = Y.merge(Y.ShapeGroup.ATTRS, {
    dimensions: {
        getter: function()
        {
            var dimensions = this._dimensions,
                radius,
                yRadius,
                width,
                height;
            if(dimensions.hasOwnProperty("radius"))
            {
                return dimensions;
            }
            else
            {
                width = dimensions.width;
                height = dimensions.height;
                radius = Y_Lang.isArray(width) ? this._getRadiusCollection(width) : (width * 0.5);
                yRadius = radius;
                return {
                    width: width,
                    height: height,
                    radius: radius,
                    yRadius: yRadius
                };
            }
        }
    }
});

CircleGroup.ATTRS = Y.ShapeGroup.ATTRS;
Y.CircleGroup = CircleGroup;
/**
 * Abstract class for creating groups of rects with the same styles and dimensions.
 *
 * @module charts
 * @submodule charts-base
 * @class GroupRect
 * @constructor
 */
 RectGroup = function(cfg)
 {
    RectGroup.superclass.constructor.apply(this, arguments);
 };

 RectGroup.NAME = "rectGroup";

 Y.extend(RectGroup, Y.ShapeGroup, {
    /**
     * Updates the rect.
     *
     * @method _draw
     * @private
     */
    drawShape: function(cfg)
    {
        this.drawRect(cfg.x, cfg.y, cfg.width, cfg.height);
    }
 });

RectGroup.ATTRS = Y.ShapeGroup.ATTRS;
Y.RectGroup = RectGroup;
/**
 * Abstract class for creating groups of diamonds with the same styles and dimensions.
 *
 * @module charts
 * @submodule charts-base
 * @class GroupDiamond
 * @constructor
 */
 DiamondGroup = function(cfg)
 {
    DiamondGroup.superclass.constructor.apply(this, arguments);
 };

 DiamondGroup.NAME = "diamondGroup";

 Y.extend(DiamondGroup, Y.ShapeGroup, {
    /**
     * Updates the diamond.
     *
     * @method _draw
     * @private
     */
    drawShape: function(cfg)
    {
        this.drawDiamond(cfg.x, cfg.y, cfg.width, cfg.height);
    }
 });

DiamondGroup.ATTRS = Y.ShapeGroup.ATTRS;
Y.DiamondGroup = DiamondGroup;
/**
 * Abstract class for creating groups of diamonds with the same styles and dimensions.
 *
 * @module charts
 * @submodule charts-base
 * @class EllipseGroup
 * @constructor
 */
 EllipseGroup = function(cfg)
 {
    EllipseGroup.superclass.constructor.apply(this, arguments);
 };

 EllipseGroup.NAME = "diamondGroup";

 Y.extend(EllipseGroup, Y.ShapeGroup, {
    /**
     * Updates the diamond.
     *
     * @method _draw
     * @private
     */
    drawShape: function(cfg)
    {
        this.drawEllipse(cfg.x, cfg.y, cfg.width, cfg.height);
    }
 });

EllipseGroup.ATTRS = Y.ShapeGroup.ATTRS;
Y.EllipseGroup = EllipseGroup;
/**
 * The Renderer class is a base class for chart components that use the `styles`
 * attribute.
 *
 * @module charts
 * @submodule charts-base
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
        Y.Object.each(a, function(value, key, a)
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
 * Algorithmic strategy for rendering a left axis.
 *
 * @module charts
 * @submodule charts-base
 * @class LeftAxisLayout
 * @constructor
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
            topOffset -= labelHeight * 0.5;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
        }
        else if(rot === -90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset -= labelHeight;
        }
        else
        {
            leftOffset -= labelWidth + (labelHeight * absRot/360);
            topOffset -= labelHeight * 0.5;
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
     * @param {Node} cb Content box of the Axis.
     * @protected
     */
    offsetNodeForTick: function(cb)
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
 * @module charts
 * @submodule charts-base
 * @class RightAxisLayout
 * @constructor
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
     * @param {Object) tickStyle Hash of properties to apply to the tick.
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
            topOffset -= labelHeight * 0.5;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset -= labelHeight;
        }
        else if(rot === -90)
        {
            leftOffset -= labelWidth * 0.5;
        }
        else
        {
            topOffset -= labelHeight * 0.5;
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
 * @module charts
 * @submodule charts-base
 * @class BottomAxisLayout
 * @Constructor
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
        if(rot > 0)
        {
            topOffset -= labelHeight/2 * rot/90;
        }
        else if(rot < 0)
        {
            leftOffset -= labelWidth;
            topOffset -= labelHeight/2 * absRot/90;
        }
        else
        {
            leftOffset -= labelWidth * 0.5;
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
        host.get("contentBox").setStyle("top", 0 - host.get("topTickOffset"));
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
 * @module charts
 * @submodule charts-base
 * @class TopAxisLayout
 * @constructor
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
            leftOffset -= labelWidth * 0.5;
            topOffset -= labelHeight;
        }
        else
        {
            if(rot === 90)
            {
                leftOffset -= labelWidth;
                topOffset -= (labelHeight * 0.5);
            }
            else if (rot === -90)
            {
                topOffset -= (labelHeight * 0.5);
            }
            else if(rot > 0)
            {
                leftOffset -= labelWidth;
                topOffset -= labelHeight - (labelHeight * rot/180);
            }
            else
            {
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
    offsetNodeForTick: function(cb)
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
           ttl = this._explicitWidth;
        }
        host.set("calculatedHeight", ttl);
        graphic.set("y", ttl - topTickOffset);
    }
};
Y.TopAxisLayout = TopAxisLayout;

/**
 * The Axis class. Generates axes for a chart.
 *
 * @module charts
 * @submodule charts-base
 * @class Axis
 * @extends Widget
 * @uses Renderer
 * @constructor
 * @param {Object} config (optional) Configuration parameters for the Chart.
 */
Y.Axis = Y.Base.create("axis", Y.Widget, [Y.Renderer], {
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
    _dataChangeHandler: function(e)
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
        if(position == "none")
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
    _updateHandler: function(e)
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
            vert = pos == "left" || pos == "right",
            cb = this.get("contentBox"),
            hor = pos == "bottom" || pos == "top";
        cb.setStyle("width", this.get("width"));
        cb.setStyle("height", this.get("height"));
        if((hor && attrName == "width") || (vert && attrName == "height"))
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
                drawTicks = majorTickStyles.display != "none",
                tickPoint,
                majorUnit = styles.majorUnit,
                len,
                majorUnitDistance,
                i = 0,
                layout = this._layout,
                layoutLength,
                position,
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
                explicitlySized;
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
            lineStart = layout.getLineStart.apply(this);
            len = this.getTotalMajorUnits(majorUnit);
            majorUnitDistance = this.getMajorUnitDistance(len, layoutLength, majorUnit);
            this.set("edgeOffset", this.getEdgeOffset(len, layoutLength) * 0.5);
            if(len < 1)
            {
                this._clearLabelCache();
            }
            else
            {
                tickPoint = this.getFirstPoint(lineStart);
                this.drawLine(path, lineStart, this.getLineEnd(tickPoint));
                if(drawTicks)
                {
                    tickPath = this.get("tickPath");
                    tickPath.clear();
                    tickPath.set("stroke", {
                        weight: majorTickStyles.weight,
                        color: majorTickStyles.color,
                        opacity: majorTickStyles.alpha
                    });
                   layout.drawTick.apply(this, [tickPath, tickPoint, majorTickStyles]);
                }
                this._createLabelCache();
                this._tickPoints = [];
                this._maxLabelSize = 0;
                this._totalTitleSize = 0;
                this._titleSize = 0;
                this._setTitle();
                explicitlySized = layout.getExplicitlySized.apply(this, [styles]);
                for(; i < len; ++i)
                {
                    if(drawTicks)
                    {
                        layout.drawTick.apply(this, [tickPath, tickPoint, majorTickStyles]);
                    }
                    position = this.getPosition(tickPoint);
                    label = this.getLabel(tickPoint, labelStyles);
                    this._labels.push(label);
                    this._tickPoints.push({x:tickPoint.x, y:tickPoint.y});
                    this.get("appendLabelFunction")(label, labelFunction.apply(labelFunctionScope, [this.getLabelByIndex(i, len), labelFormat]));
                    labelWidth = Math.round(label.offsetWidth);
                    labelHeight = Math.round(label.offsetHeight);
                    if(!explicitlySized)
                    {
                        this._layout.updateMaxLabelSize.apply(this, [labelWidth, labelHeight]);
                    }
                    this._labelWidths.push(labelWidth);
                    this._labelHeights.push(labelHeight);
                    tickPoint = this.getNextPoint(tickPoint, majorUnitDistance);
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
                for(i = 0; i < len; ++i)
                {
                    layout.positionLabel.apply(this, [this.get("labels")[i], this._tickPoints[i], styles, i]);
                }
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
        if(position == "left" || position == "right")
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
     * @param {Object} pt x and y coordinates for the label
     * @param {Object} styles styles applied to label
     * @return HTMLElement
     * @private
     */
    getLabel: function(pt, styles)
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
     * Gets the position of the next point on an axis.
     *
     * @method getNextPoint
     * @param {Object} point Object containing x and y coordinates.
     * @param {Number} majorUnitDistance Distance in pixels between ticks.
     * @return Object
     * @private
     */
    getNextPoint: function(point, majorUnitDistance)
    {
        var pos = this.get("position");
        if(pos === "top" || pos === "bottom")
        {
            point.x = point.x + majorUnitDistance;
        }
        else
        {
            point.y = point.y - majorUnitDistance;
        }
        return point;
    },

    /**
     * Calculates the placement of last tick on an axis.
     *
     * @method getLastPoint
     * @return Object
     * @private
     */
    getLastPoint: function()
    {
        var style = this.get("styles"),
            padding = style.padding,
            w = this.get("width"),
            pos = this.get("position");
        if(pos === "top" || pos === "bottom")
        {
            return {x:w - padding.right, y:padding.top};
        }
        else
        {
            return {x:padding.left, y:padding.top};
        }
    },

    /**
     * Calculates position on the axis.
     *
     * @method getPosition
     * @param {Object} point contains x and y values
     * @private
     */
    getPosition: function(point)
    {
        var p,
            h = this.get("height"),
            style = this.get("styles"),
            padding = style.padding,
            pos = this.get("position"),
            dataType = this.get("dataType");
        if(pos === "left" || pos === "right")
        {
            //Numeric data on a vertical axis is displayed from bottom to top.
            //Categorical and Timeline data is displayed from top to bottom.
            if(dataType === "numeric")
            {
                p = (h - (padding.top + padding.bottom)) - (point.y - padding.top);
            }
            else
            {
                p = point.y - padding.top;
            }
        }
        else
        {
            p = point.x - padding.left;
        }
        return p;
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
        label = this.getLabel({x: 0, y: 0}, labelStyles);
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
         * Difference betweend the first/last tick and edge of axis.
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
            setter: function(val)
            {
                var layoutClass = this._layoutClasses[val];
                if(val && val != "none")
                {
                    this._layout = new layoutClass();
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
                if(this.get("position") == "none")
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
         * Object which should have by the labelFunction
         *
         * @attribute labelFunctionScope
         * @type Object
         */
        labelFunctionScope: {},

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
        labelFunction: {
            value: function(val, format)
            {
                return val;
            }
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
/**
 * AxisType is an abstract class that manages the data for an axis.
 *
 * @module charts
 * @submodule charts-base
 * @class AxisType
 * @constructor
 * @extends Axis
 */
Y.AxisType = Y.Base.create("baseAxis", Y.Axis, [], {
    /**
     * @method initializer
     * @private
     */
    initializer: function()
    {
        this.after("dataReady", Y.bind(this._dataChangeHandler, this));
        this.after("dataUpdate", Y.bind(this._dataChangeHandler, this));
        this.after("minimumChange", Y.bind(this._keyChangeHandler, this));
        this.after("maximumChange", Y.bind(this._keyChangeHandler, this));
        this.after("keysChange", this._keyChangeHandler);
        this.after("dataProviderChange", this._dataProviderChangeHandler);
        this.after("alwaysShowZeroChange", this._keyChangeHandler);
        this.after("roundingMethodChange", this._keyChangeHandler);
    },

    /**
     * @method bindUI
     * @private
     */
    bindUI: function()
    {
        this.after("stylesChange", this._updateHandler);
        this.after("overlapGraphChange", this._updateHandler);
        this.after("positionChange", this._positionChangeHandler);
        this.after("widthChange", this._handleSizeChange);
        this.after("heightChange", this._handleSizeChange);
        this.after("calculatedWidthChange", this._handleSizeChange);
        this.after("calculatedHeightChange", this._handleSizeChange);
    },

    /**
     * Handles changes to `dataProvider`.
     *
     * @method _dataProviderChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _dataProviderChangeHandler: function(e)
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
     * Storage for `dataMaximum` attribute.
     *
     * @property _dataMaximum
     * @type Object
     * @private
     */
    _dataMaximum: null,

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
     * Sets data by key
     *
     * @method _setDataByKey
     * @param {String} key Key value to use.
     * @param {Array} data Array to use.
     * @private
     */
    _setDataByKey: function(key, data)
    {
        var i,
            obj,
            arr = [],
            dv = this._dataClone.concat(),
            len = dv.length;
        for(i = 0; i < len; ++i)
        {
            obj = dv[i];
            arr[i] = obj[key];
        }
        this.get("keys")[key] = arr;
        this._updateTotalDataFlag = true;
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
     * Returns an array of values based on an identifier key.
     *
     * @method getDataByKey
     * @param {String} value value used to identify the array
     * @return Object
     */
    getDataByKey: function (value)
    {
        var keys = this.get("keys");
        if(keys[value])
        {
            return keys[value];
        }
        return null;
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
     * Returns the total number of majorUnits that will appear on an axis.
     *
     * @method getTotalMajorUnits
     * @return Number
     */
    getTotalMajorUnits: function()
    {
        var units,
            majorUnit = this.get("styles").majorUnit,
            len = this.getLength();
        if(majorUnit.determinant === "count")
        {
            units = majorUnit.count;
        }
        else if(majorUnit.determinant === "distance")
        {
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
            dist = uiLen/(len - 1);
        }
        else if(majorUnit.determinant === "distance")
        {
            dist = majorUnit.distance;
        }
        return dist;
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
        return 0;
    },

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
        var min = this.get("minimum"),
            max = this.get("maximum"),
            increm = (max - min)/(l-1),
            label;
            l -= 1;
        label = min + (i * increm);
        return label;
    },

    /**
     * Updates the `Axis` after a change in keys.
     *
     * @method _keyChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _keyChangeHandler: function(e)
    {
        this._updateMinAndMax();
        this.fire("dataUpdate");
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
    ATTRS: {
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
                if(!this._dataMaximum)
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

            getter: function ()
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
            setter: function (value)
            {
                this._setMaximum = parseFloat(value);
                return value;
            }
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
                if(!this._dataMinimum)
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

            getter: function ()
            {
                var min = this.get("dataMinimum");
                if(Y_Lang.isNumber(this._setMinimum))
                {
                    min = this._setMinimum;
                }
                return parseFloat(min);
            },
            setter: function(val)
            {
                this._setMinimum = parseFloat(val);
                return val;
            }
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

            getter: function()
            {
                return Y_Lang.isNumber(this._setMaximum);
            }
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

            getter: function()
            {
                return Y_Lang.isNumber(this._setMinimum);
            }
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
        }
    }
});
/**
 * NumericAxis manages numeric data on an axis.
 *
 * @module charts
 * @submodule charts-base
 * @class NumericAxis
 * @constructor
 * @param {Object} config (optional) Configuration parameters for the Chart.
 * @extends AxisType
 */
function NumericAxis(config)
{
	NumericAxis.superclass.constructor.apply(this, arguments);
}

NumericAxis.NAME = "numericAxis";

NumericAxis.ATTRS = {
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
     * the Axis' `appendLabelFunction` to accept html as a `String`.
     * <dl>
     *      <dt>val</dt><dd>Label to be formatted. (`String`)</dd>
     *      <dt>format</dt><dd>Object containing properties used to format the label. (optional)</dd>
     * </dl>
     *
     * @attribute labelFunction
     * @type Function
     */
    labelFunction: {
        value: function(val, format)
        {
            if(format)
            {
                return Y.DataType.Number.format(val, format);
            }
            return val;
        }
    },

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
    }
};

Y.extend(NumericAxis, Y.AxisType,
{
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
     * Type of data used in `Axis`.
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
     * Calculates the maximum and minimum values for the `Axis`.
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
            key,
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
                        if(Y_Lang.isObject(num))
                        {
                            min = max = 0;
                            //hloc values
                            for(key in num)
                            {
                               if(num.hasOwnProperty(key))
                               {
                                    max = Math.max(num[key], max);
                                    min = Math.min(num[key], min);
                               }
                            }
                        }
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
            this._roundMinAndMax(min, max, setMin, setMax);
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
            if(roundingMethod == "niceNumber")
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
            else if(roundingMethod == "auto")
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
                    }
                    max = min + (roundingUnit * units);
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
                        }
                        else
                        {
                            tempMax = max/topTicks;
                            tempMin = min/botTicks * -1;
                        }
                        roundingUnit = Math.max(tempMax, tempMin);
                        max = roundingUnit * topTicks;
                        min = roundingUnit * botTicks * -1;
                    }
                    else
                    {
                        roundingUnit = (max - min)/units;
                        if(useIntegers)
                        {
                            roundingUnit = Math.ceil(roundingUnit);
                        }
                        min = this._roundDownToNearest(min, roundingUnit);
                        max = this._roundUpToNearest(max, roundingUnit);
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
                        }
                        min = max - (roundingUnit * units);
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
            if(roundingMethod == "niceNumber")
            {
                label = this._roundToNearest(label, increm);
            }
            label += min;
        }
        return parseFloat(label);
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
        if(nearest === 0)
        {
            return number;
        }
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
        if(nearest === 0)
        {
            return number;
        }
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
        if(nearest === 0)
        {
            return number;
        }
        return Math.floor(this._roundToPrecision(number / nearest, 10)) * nearest;
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
        if(Y_Lang.isNumber(roundingMethod) && ((Y_Lang.isNumber(max) && max > this._dataMaximum) || (Y_Lang.isNumber(min) && min < this._dataMinimum)))
        {
            return true;
        }
        return false;
    }
});

Y.NumericAxis = NumericAxis;

/**
 * StackedAxis manages stacked numeric data on an axis.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedAxis
 * @constructor
 * @param {Object} config (optional) Configuration parameters for the Chart.
 * @extends NumericAxis
 */
function StackedAxis(config)
{
	StackedAxis.superclass.constructor.apply(this, arguments);
}

StackedAxis.NAME = "stackedAxis";


Y.extend(StackedAxis, Y.NumericAxis,
{
    /**
     * Calculates the maximum and minimum values for the `Axis`.
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
});

Y.StackedAxis = StackedAxis;

/**
 * TimeAxis manages time data on an axis.
 *
 * @module charts
 * @submodule charts-base
 * @class TimeAxis
 * @constructor
 * @param {Object} config (optional) Configuration parameters for the Chart.
 * @extends AxisType
 */
function TimeAxis(config)
{
	TimeAxis.superclass.constructor.apply(this, arguments);
}

TimeAxis.NAME = "timeAxis";

TimeAxis.ATTRS =
{
    /**
     * Indicates whether the maximum is calculated or explicitly set.
     *
     * @attribute setMax
     * @readOnly
     * @type Boolean
     * @private
     */
    setMax: {
        readOnly: true,

        getter: function()
        {
            var max = this._getNumber(this._setMaximum);
            return (Y_Lang.isNumber(max));
        }
    },

    /**
     * Indicates whether the minimum is calculated or explicitly set.
     *
     * @attribute setMin
     * @readOnly
     * @type Boolean
     * @private
     */
    setMin: {
        readOnly: true,

        getter: function()
        {
            var min = this._getNumber(this._setMinimum);
            return (Y_Lang.isNumber(min));
        }
    },

    /**
     * The maximum value that will appear on an axis. Unless explicitly set, this value is calculated by the `Axis`.
     *
     * @attribute maximum
     * @type Number
     */
    maximum: {
        getter: function ()
        {
            var max = this._getNumber(this._setMaximum);
            if(!Y_Lang.isNumber(max))
            {
                max = this._getNumber(this.get("dataMaximum"));
            }
            return parseFloat(max);
        },
        setter: function (value)
        {
            this._setMaximum = this._getNumber(value);
            return value;
        }
    },

    /**
     * The minimum value that will appear on an axis. Unless explicitly set, this value is calculated by the `Axis`.
     *
     * @attribute minimum
     * @type Number
     */
    minimum: {
        getter: function ()
        {
            var min = this._getNumber(this._setMinimum);
            if(!Y_Lang.isNumber(min))
            {
                min = this._getNumber(this.get("dataMinimum"));
            }
            return parseFloat(min);
        },
        setter: function (value)
        {
            this._setMinimum = this._getNumber(value);
            return value;
        }
    },

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
    labelFunction: {
        value: function(val, format)
        {
            val = Y.DataType.Date.parse(val);
            if(format)
            {
                return Y.DataType.Date.format(val, {format:format});
            }
            return val;
        }
    },

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

Y.extend(TimeAxis, Y.AxisType, {
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
        var min = this.get("minimum"),
            max = this.get("maximum"),
            position = this.get("position"),
            increm,
            label;
            l -= 1;
        increm = ((max - min)/l) * i;
        if(position == "bottom" || position == "top")
        {
            label = min + increm;
        }
        else
        {
            label = max - increm;
        }
        return label;
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
                        if(typeof obj != "string")
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
     * Sets data by key
     *
     * @method _setDataByKey
     * @param {String} key Key value to use.
     * @param {Array} data Array to use.
     * @private
     */
    _setDataByKey: function(key, data)
    {
        var obj,
            arr = [],
            dv = this._dataClone.concat(),
            i,
            val,
            len = dv.length;
        for(i = 0; i < len; ++i)
        {
            obj = dv[i][key];
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
                        if(typeof obj != "string")
                        {
                            obj = obj.toString();
                        }
                        val = new Date(obj).valueOf();
                    }
                }
                else
                {
                    val = obj;
                }
            }
            arr[i] = val;
        }
        this.get("keys")[key] = arr;
        this._updateTotalDataFlag = true;
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
});

Y.TimeAxis = TimeAxis;

/**
 * CategoryAxis manages category data on an axis.
 *
 * @module charts
 * @submodule charts-base
 * @class CategoryAxis
 * @constructor
 * @param {Object} config (optional) Configuration parameters for the Chart.
 * @extends AxisType
 */
function CategoryAxis(config)
{
	CategoryAxis.superclass.constructor.apply(this, arguments);
}

CategoryAxis.NAME = "categoryAxis";

Y.extend(CategoryAxis, Y.AxisType,
{
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
     * Type of data used in `Axis`.
     *
     * @property _dataType
     * @readOnly
     * @private
     */
    _type: "category",

    /**
     * Calculates the maximum and minimum values for the `Axis`.
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
     * Sets data by key
     *
     * @method _setDataByKey
     * @param {String} key Key value to use.
     * @param {Array} data Array to use.
     * @private
     */
    _setDataByKey: function(key)
    {
        var i,
            obj,
            arr = [],
            labels = [],
            dv = this._dataClone.concat(),
            len = dv.length;
        if(!this._indices)
        {
            this._indices = {};
        }
        for(i = 0; i < len; ++i)
        {
            obj = dv[i];
            arr[i] = i;
            labels[i] = obj[key];
        }
        this._indices[key] = arr;
        this.get("keys")[key] = labels.concat();
        this._updateTotalDataFlag = true;
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
        if(keys[value])
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
    getTotalMajorUnits: function(majorUnit, len)
    {
        return this.get("data").length;
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
            dist = uiLen/len;
        }
        else if(majorUnit.determinant === "distance")
        {
            dist = majorUnit.distance;
        }
        return dist;
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
        return l/ct;
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
    },

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
        var label,
            data = this.get("data"),
            position = this.get("position");
        if(position == "bottom" || position == "top")
        {
            label = data[i];
        }
        else
        {
            label = data[l - (i + 1)];
        }
        return label;
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
    }
});

Y.CategoryAxis = CategoryAxis;

/**
 * Utility class used for calculating curve points.
 *
 * @module charts
 * @submodule charts-base
 * @class CurveUtil
 * @constructor
 */
function CurveUtil()
{
}

CurveUtil.prototype = {
    /**
     * Creates an array of start, end and control points for splines.
     *
     * @method getCurveControlPoints
     * @param {Array} xcoords Collection of x-coordinates used for calculate the curves
     * @param {Array} ycoords Collection of y-coordinates used for calculate the curves
     * @return Object
     * @protected
     */
    getCurveControlPoints: function(xcoords, ycoords)
    {
		var outpoints = [],
            i = 1,
            l = xcoords.length - 1,
		    xvals = [],
		    yvals = [];


		// Too few points, need at least two
		if (l < 1)
        {
			return null;
		}

        outpoints[0] = {
            startx: xcoords[0],
            starty: ycoords[0],
            endx: xcoords[1],
            endy: ycoords[1]
        };

		// Special case, the Bezier should be a straight line
        if (l === 1)
        {
			outpoints[0].ctrlx1 = (2.0*xcoords[0] + xcoords[1])/3.0;
			outpoints[0].ctrly2 = (2.0*ycoords[0] + ycoords[1])/3.0;
			outpoints[0].ctrlx2 = 2.0*outpoints[0].ctrlx1 - xcoords[0];
            outpoints[0].ctrly2 = 2.0*outpoints[0].ctrly1 - ycoords[0];
            return outpoints;
		}

		for (; i < l; ++i)
        {
			outpoints.push({startx: Math.round(xcoords[i]), starty: Math.round(ycoords[i]), endx: Math.round(xcoords[i+1]), endy: Math.round(ycoords[i+1])});
			xvals[i] = 4.0 * xcoords[i] + 2*xcoords[i+1];
			yvals[i] = 4.0*ycoords[i] + 2*ycoords[i+1];
		}

		xvals[0] = xcoords[0] + (2.0 * xcoords[1]);
		xvals[l-1] = (8.0 * xcoords[l-1] + xcoords[l]) / 2.0;
		xvals = this.getControlPoints(xvals.concat());
        yvals[0] = ycoords[0] + (2.0 * ycoords[1]);
		yvals[l-1] = (8.0 * ycoords[l-1] + ycoords[l]) / 2.0;
		yvals = this.getControlPoints(yvals.concat());

        for (i = 0; i < l; ++i)
        {
			outpoints[i].ctrlx1 = Math.round(xvals[i]);
            outpoints[i].ctrly1 = Math.round(yvals[i]);

			if (i < l-1)
            {
				outpoints[i].ctrlx2 = Math.round(2*xcoords[i+1] - xvals[i+1]);
                outpoints[i].ctrly2 = Math.round(2*ycoords[i+1] - yvals[i+1]);
			}
			else
            {
				outpoints[i].ctrlx2 = Math.round((xcoords[l] + xvals[l-1])/2);
                outpoints[i].ctrly2 = Math.round((ycoords[l] + yvals[l-1])/2);
			}
		}

		return outpoints;
	},

    /**
     * Gets the control points for the curve.
     *
     * @method getControlPoints
     * @param {Array} vals Collection of values coords used to generate control points.
     * @return Array
     * @private
     */
	getControlPoints: function(vals)
    {
		var l = vals.length,
            x = [],
            tmp = [],
            b = 2.0,
            i = 1;
		x[0] = vals[0] / b;
		for (; i < l; ++i)
        {
			tmp[i] = 1/b;
			b = (i < l-1 ? 4.0 : 3.5) - tmp[i];
			x[i] = (vals[i] - x[i-1]) / b;
		}

		for (i = 1; i < l; ++i)
        {
			x[l-i-1] -= tmp[l-i] * x[l-i];
		}

		return x;
	}
};
Y.CurveUtil = CurveUtil;
/**
 * Utility class used for creating stacked series.
 *
 * @module charts
 * @submodule charts-base
 * @class StackingUtil
 * @constructor
 */
function StackingUtil(){}

StackingUtil.prototype = {
    /**
     * Indicates whether the series is stacked.
     *
     * @property _stacked
     * @private
     */
    _stacked: true,

    /**
     * @protected
     *
     * Adjusts coordinate values for stacked series.
     *
     * @method _stackCoordinates
     */
    _stackCoordinates: function()
    {
        if(this.get("direction") == "vertical")
        {
            this._stackXCoords();
        }
        else
        {
            this._stackYCoords();
        }
    },

    /**
     * Stacks coordinates for a stacked vertical series.
     *
     * @method _stackXCoords
     * @protected
     */
    _stackXCoords: function()
    {
        var order = this.get("order"),
            type = this.get("type"),
            graph = this.get("graph"),
            seriesCollection = graph.seriesTypes[type],
            i = 0,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            len,
            coord,
            prevCoord,
            prevOrder,
            stackedXCoords = xcoords.concat(),
            prevXCoords,
            prevYCoords,
            nullIndices = [],
            nullIndex;
        if(order > 0)
        {
            prevXCoords = seriesCollection[order - 1].get("stackedXCoords");
            prevYCoords = seriesCollection[order - 1].get("stackedYCoords");
            len = prevXCoords.length;
        }
        else
        {
            len = xcoords.length;
        }
        for(; i < len; i = i + 1)
        {
            if(Y_Lang.isNumber(xcoords[i]))
            {
                if(order > 0)
                {
                    prevCoord = prevXCoords[i];
                    if(!Y_Lang.isNumber(prevCoord))
                    {
                        prevOrder = order;
                        while(prevOrder >  - 1 && !Y_Lang.isNumber(prevCoord))
                        {
                            prevOrder = prevOrder - 1;
                            if(prevOrder > -1)
                            {
                                prevCoord = seriesCollection[prevOrder].get("stackedXCoords")[i];
                            }
                            else
                            {
                                prevCoord = this._leftOrigin;
                            }
                        }
                    }
                    xcoords[i] = xcoords[i] + prevCoord;
                }
                stackedXCoords[i] = xcoords[i];
            }
            else
            {
                nullIndices.push(i);
            }
        }
        this._cleanXNaN(stackedXCoords, ycoords);
        len = nullIndices.length;
        if(len > 0)
        {
            for(i = 0; i < len; i = i + 1)
            {
                nullIndex = nullIndices[i];
                coord = order > 0 ? prevXCoords[nullIndex] : this._leftOrigin;
                stackedXCoords[nullIndex] =  Math.max(stackedXCoords[nullIndex], coord);
            }
        }
        this.set("stackedXCoords", stackedXCoords);
        this.set("stackedYCoords", ycoords);
    },

    /**
     * Stacks coordinates for a stacked horizontal series.
     *
     * @method _stackYCoords
     * @protected
     */
    _stackYCoords: function()
    {
        var order = this.get("order"),
            type = this.get("type"),
            graph = this.get("graph"),
            h = graph.get("height"),
            seriesCollection = graph.seriesTypes[type],
            i = 0,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            len,
            coord,
            prevCoord,
            prevOrder,
            stackedYCoords = ycoords.concat(),
            prevXCoords,
            prevYCoords,
            nullIndices = [],
            nullIndex;
        if(order > 0)
        {
            prevXCoords = seriesCollection[order - 1].get("stackedXCoords");
            prevYCoords = seriesCollection[order - 1].get("stackedYCoords");
            len = prevYCoords.length;
        }
        else
        {
            len = ycoords.length;
        }
        for(; i < len; i = i + 1)
        {
            if(Y_Lang.isNumber(ycoords[i]))
            {
                if(order > 0)
                {
                    prevCoord = prevYCoords[i];
                    if(!Y_Lang.isNumber(prevCoord))
                    {
                        prevOrder = order;
                        while(prevOrder >  - 1 && !Y_Lang.isNumber(prevCoord))
                        {
                            prevOrder = prevOrder - 1;
                            if(prevOrder > -1)
                            {
                                prevCoord = seriesCollection[prevOrder].get("stackedYCoords")[i];
                            }
                            else
                            {
                                prevCoord = this._bottomOrigin;
                            }
                        }
                    }
                    ycoords[i] = prevCoord - (h - ycoords[i]);
                }
                stackedYCoords[i] = ycoords[i];
            }
            else
            {
                nullIndices.push(i);
            }
        }
        this._cleanYNaN(xcoords, stackedYCoords);
        len = nullIndices.length;
        if(len > 0)
        {
            for(i = 0; i < len; i = i + 1)
            {
                nullIndex = nullIndices[i];
                coord = order > 0 ? prevYCoords[nullIndex] : h;
                stackedYCoords[nullIndex] =  Math.min(stackedYCoords[nullIndex], coord);
            }
        }
        this.set("stackedXCoords", xcoords);
        this.set("stackedYCoords", stackedYCoords);
    },

    /**
     * Cleans invalid x-coordinates by calculating their value based on the corresponding y-coordinate, the
     * previous valid x-coordinate with its corresponding y-coordinate and the next valid x-coordinate with
     * its corresponding y-coordinate. If there is no previous or next valid x-coordinate, the value will not
     * be altered.
     *
     * @method _cleanXNaN
     * @param {Array} xcoords An array of x-coordinate values
     * @param {Array} ycoords An arry of y-coordinate values
     * @private
     */
    _cleanXNaN: function(xcoords, ycoords)
    {
        var previousValidIndex,
            nextValidIndex,
            previousValidX,
            previousValidY,
            x,
            y,
            nextValidX,
            nextValidY,
            isNumber = Y_Lang.isNumber,
            m,
            i = 0,
            len = ycoords.length;
        for(; i < len; ++i)
        {
            x = xcoords[i];
            y = ycoords[i];
            //if x is invalid, calculate where it should be
            if(!isNumber(x) && i > 0 && i < len - 1)
            {
                previousValidY = ycoords[i - 1];
                //check to see if the previous value is valid
                previousValidX = this._getPreviousValidCoordValue(xcoords, i);
                nextValidY = ycoords[i + 1];
                nextValidX = this._getNextValidCoordValue(xcoords, i);
                //check to see if the next value is valid
                if(isNumber(previousValidX) && isNumber(nextValidX))
                {
                    //calculate slope and solve for x
                    m = (nextValidY - previousValidY) / (nextValidX - previousValidX);
                    xcoords[i] = (y + (m * previousValidX) - previousValidY)/m;
                }
                previousValidIndex = NaN;
                nextValidIndex = NaN;
            }
        }
    },

    /**
     * Returns the previous valid (numeric) value in an array if available.
     *
     * @method _getPreviousValidCoordValue
     * @param {Array} coords Array of values
     * @param {Number} index The index in the array in which to begin searching.
     * @return Number
     * @private
     */
    _getPreviousValidCoordValue: function(coords, index)
    {
        var coord,
            isNumber = Y_Lang.isNumber,
            limit = -1;
        while(!isNumber(coord) && index > limit)
        {
            index = index - 1;
            coord = coords[index];
        }
        return coord;
    },

    /**
     * Returns the next valid (numeric) value in an array if available.
     *
     * @method _getNextValidCoordValue
     * @param {Array} coords Array of values
     * @param {Number} index The index in the array in which to begin searching.
     * @return Number
     * @private
     */
    _getNextValidCoordValue: function(coords, index)
    {
        var coord,
            isNumber = Y_Lang.isNumber,
            limit = coords.length;
        while(!isNumber(coord) && index < limit)
        {
            index = index + 1;
            coord = coords[index];
        }
        return coord;
    },

    /**
     * Cleans invalid y-coordinates by calculating their value based on the corresponding x-coordinate, the
     * previous valid y-coordinate with its corresponding x-coordinate and the next valid y-coordinate with
     * its corresponding x-coordinate. If there is no previous or next valid y-coordinate, the value will not
     * be altered.
     *
     * @method _cleanYNaN
     * @param {Array} xcoords An array of x-coordinate values
     * @param {Array} ycoords An arry of y-coordinate values
     * @private
     */
    _cleanYNaN: function(xcoords, ycoords)
    {
        var previousValidIndex,
            nextValidIndex,
            previousValidX,
            previousValidY,
            x,
            y,
            nextValidX,
            nextValidY,
            isNumber = Y_Lang.isNumber,
            m,
            i = 0,
            len = xcoords.length;
        for(; i < len; ++i)
        {
            x = xcoords[i];
            y = ycoords[i];
            //if y is invalid, calculate where it should be
            if(!isNumber(y) && i > 0 && i < len - 1)
            {
                //check to see if the previous value is valid
                previousValidX = xcoords[i - 1];
                previousValidY = this._getPreviousValidCoordValue(ycoords, i);
                //check to see if the next value is valid
                nextValidX = xcoords[i + 1];
                nextValidY = this._getNextValidCoordValue(ycoords, i);
                if(isNumber(previousValidY) && isNumber(nextValidY))
                {
                    //calculate slope and solve for y
                    m = (nextValidY - previousValidY) / (nextValidX - previousValidX);
                    ycoords[i] = previousValidY + ((m * x) - (m * previousValidX));
                }
                previousValidIndex = NaN;
                nextValidIndex = NaN;
            }
        }
    }
};
Y.StackingUtil = StackingUtil;
/**
 * Utility class used for drawing lines.
 *
 * @module charts
 * @submodule charts-base
 * @class Lines
 * @constructor
 */
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
                if(lineType != "dashed")
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
                if(discontinuousType != "solid")
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
/**
 * Utility class used for drawing area fills.
 *
 * @module charts
 * @class Fills
 * @constructor
 */
function Fills(cfg)
{
    var attrs = {
        area: {
            getter: function()
            {
                return this._defaults || this._getAreaDefaults();
            },

            setter: function(val)
            {
                var defaults = this._defaults || this._getAreaDefaults();
                this._defaults = Y.merge(defaults, val);
            }
        }
    };
    this.addAttrs(attrs, cfg);
    this.get("styles");
}

Fills.prototype = {
    /**
     * Returns a path shape used for drawing fills.
     *
     * @method _getPath
     * @return Path
     * @private
     */
    _getPath: function()
    {
        var path = this._path;
        if(!path)
        {
            path = this.get("graph").get("graphic").addShape({type:"path"});
            this._path = path;
        }
        return path;
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
        if(this._path)
        {
            this._path.set("visible", visible);
        }
    },

    /**
     * Draws fill
     *
     * @method drawFill
     * @param {Array} xcoords The x-coordinates for the series.
     * @param {Array} ycoords The y-coordinates for the series.
     * @protected
     */
    drawFill: function(xcoords, ycoords)
    {
        if(xcoords.length < 1)
        {
            return;
        }
        var isNumber = Y_Lang.isNumber,
            len = xcoords.length,
            firstX = xcoords[0],
            firstY = ycoords[0],
            lastValidX = firstX,
            lastValidY = firstY,
            nextX,
            nextY,
            pointValid,
            noPointsRendered = true,
            i = 0,
            styles = this.get("styles").area,
            path = this._getPath(),
            color = styles.color || this._getDefaultColor(this.get("graphOrder"), "slice");
        path.clear();
        path.set("fill", {
            color: color,
            opacity: styles.alpha
        });
        path.set("stroke", {weight: 0});
        for(; i < len; i = ++i)
        {
            nextX = xcoords[i];
            nextY = ycoords[i];
            pointValid = isNumber(nextX) && isNumber(nextY);
            if(!pointValid)
            {
                continue;
            }
            if(noPointsRendered)
            {
                this._firstValidX = nextX;
                this._firstValidY = nextY;
                noPointsRendered = false;
                path.moveTo(nextX, nextY);
            }
            else
            {
                path.lineTo(nextX, nextY);
            }
            lastValidX = nextX;
            lastValidY = nextY;
        }
        this._lastValidX = lastValidX;
        this._lastValidY = lastValidY;
        path.end();
    },

    /**
     * Draws a fill for a spline
     *
     * @method drawAreaSpline
     * @protected
     */
    drawAreaSpline: function()
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
            firstX = xcoords[0],
            firstY = ycoords[0],
            styles = this.get("styles").area,
            path = this._getPath(),
            color = styles.color || this._getDefaultColor(this.get("graphOrder"), "slice");
        path.set("fill", {
            color: color,
            opacity: styles.alpha
        });
        path.set("stroke", {weight: 0});
        path.moveTo(firstX, firstY);
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
        if(this.get("direction") === "vertical")
        {
            path.lineTo(this._leftOrigin, y);
            path.lineTo(this._leftOrigin, firstY);
        }
        else
        {
            path.lineTo(x, this._bottomOrigin);
            path.lineTo(firstX, this._bottomOrigin);
        }
        path.lineTo(firstX, firstY);
        path.end();
    },

    /**
     * Draws a a stacked area spline
     *
     * @method drawStackedAreaSpline
     * @protected
     */
    drawStackedAreaSpline: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            curvecoords,
            order = this.get("order"),
            type = this.get("type"),
            graph = this.get("graph"),
            seriesCollection = graph.seriesTypes[type],
            prevXCoords,
            prevYCoords,
            len,
            cx1,
            cx2,
            cy1,
            cy2,
            x,
            y,
            i = 0,
            firstX,
            firstY,
            styles = this.get("styles").area,
            path = this._getPath(),
            color = styles.color || this._getDefaultColor(this.get("graphOrder"), "slice");
        firstX = xcoords[0];
        firstY = ycoords[0];
        curvecoords = this.getCurveControlPoints(xcoords, ycoords);
        len = curvecoords.length;
        path.set("fill", {
            color: color,
            opacity: styles.alpha
        });
        path.set("stroke", {weight: 0});
        path.moveTo(firstX, firstY);
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
        if(order > 0)
        {
            prevXCoords = seriesCollection[order - 1].get("xcoords").concat().reverse();
            prevYCoords = seriesCollection[order - 1].get("ycoords").concat().reverse();
            curvecoords = this.getCurveControlPoints(prevXCoords, prevYCoords);
            i = 0;
            len = curvecoords.length;
            path.lineTo(prevXCoords[0], prevYCoords[0]);
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
        }
        else
        {
            if(this.get("direction") === "vertical")
            {
                path.lineTo(this._leftOrigin, ycoords[ycoords.length-1]);
                path.lineTo(this._leftOrigin, firstY);
            }
            else
            {
                path.lineTo(xcoords[xcoords.length-1], this._bottomOrigin);
                path.lineTo(firstX, this._bottomOrigin);
            }

        }
        path.lineTo(firstX, firstY);
        path.end();
    },

    /**
     * Storage for default area styles.
     *
     * @property _defaults
     * @type Object
     * @private
     */
    _defaults: null,

    /**
     * Concatenates coordinate array with correct coordinates for closing an area fill.
     *
     * @method _getClosingPoints
     * @return Array
     * @protected
     */
    _getClosingPoints: function()
    {
        var xcoords = this.get("xcoords").concat(),
            ycoords = this.get("ycoords").concat(),
            firstValidIndex,
            lastValidIndex;
        if(this.get("direction") === "vertical")
        {
            lastValidIndex = this._getLastValidIndex(xcoords);
            firstValidIndex = this._getFirstValidIndex(xcoords);
            ycoords.push(ycoords[lastValidIndex]);
            ycoords.push(ycoords[firstValidIndex]);
            xcoords.push(this._leftOrigin);
            xcoords.push(this._leftOrigin);
        }
        else
        {
            lastValidIndex = this._getLastValidIndex(ycoords);
            firstValidIndex = this._getFirstValidIndex(ycoords);
            xcoords.push(xcoords[lastValidIndex]);
            xcoords.push(xcoords[firstValidIndex]);
            ycoords.push(this._bottomOrigin);
            ycoords.push(this._bottomOrigin);
        }
        xcoords.push(xcoords[0]);
        ycoords.push(ycoords[0]);
        return [xcoords, ycoords];
    },

    /**
     * Returns the order of the series closest to the current series that has a valid value for the current index.
     *
     * @method _getHighestValidOrder
     * @param {Array} seriesCollection Array of series of a given type.
     * @param {Number} index Index of the series item.
     * @param {Number} order Index of the the series in the seriesCollection
     * @param {String} direction Indicates the direction of the series
     * @return Number
     * @private
     */
    _getHighestValidOrder: function(seriesCollection, index, order, direction)
    {
        var coords = direction == "vertical" ? "stackedXCoords" : "stackedYCoords",
            coord;
        while(isNaN(coord) && order > -1)
        {
          order = order - 1;
          if(order > -1)
          {
            coord = seriesCollection[order].get(coords)[index];
          }
        }
        return order;
    },

    /**
     * Returns an array containing the x and y coordinates for a given series and index.
     *
     * @method _getCoordsByOrderAndIndex
     * @param {Array} seriesCollection Array of series of a given type.
     * @param {Number} index Index of the series item.
     * @param {Number} order Index of the the series in the seriesCollection
     * @param {String} direction Indicates the direction of the series
     * @return Array
     * @private
     */
    _getCoordsByOrderAndIndex: function(seriesCollection, index, order, direction)
    {
        var xcoord,
            ycoord;
        if(direction == "vertical")
        {
            xcoord = order < 0 ? this._leftOrigin : seriesCollection[order].get("stackedXCoords")[index];
            ycoord = this.get("stackedYCoords")[index];
        }
        else
        {
            xcoord = this.get("stackedXCoords")[index];
            ycoord = order < 0 ? this._bottomOrigin : seriesCollection[order].get("stackedYCoords")[index];
        }
        return [xcoord, ycoord];
    },

    /**
     * Concatenates coordinate array with the correct coordinates for closing an area stack.
     *
     * @method _getStackedClosingPoints
     * @return Array
     * @protected
     */
    _getStackedClosingPoints: function()
    {
        var order = this.get("order"),
            type = this.get("type"),
            graph = this.get("graph"),
            direction = this.get("direction"),
            seriesCollection = graph.seriesTypes[type],
            firstValidIndex,
            lastValidIndex,
            xcoords = this.get("stackedXCoords"),
            ycoords = this.get("stackedYCoords"),
            limit,
            previousSeries,
            previousSeriesFirstValidIndex,
            previousSeriesLastValidIndex,
            previousXCoords,
            previousYCoords,
            coords,
            closingXCoords,
            closingYCoords,
            currentIndex,
            highestValidOrder,
            oldOrder;
        if(order < 1)
        {
          return this._getClosingPoints();
        }

        previousSeries = seriesCollection[order - 1];
        previousXCoords = previousSeries.get("stackedXCoords").concat();
        previousYCoords = previousSeries.get("stackedYCoords").concat();
        if(direction == "vertical")
        {
            firstValidIndex = this._getFirstValidIndex(xcoords);
            lastValidIndex = this._getLastValidIndex(xcoords);
            previousSeriesFirstValidIndex = previousSeries._getFirstValidIndex(previousXCoords);
            previousSeriesLastValidIndex = previousSeries._getLastValidIndex(previousXCoords);
        }
        else
        {
            firstValidIndex = this._getFirstValidIndex(ycoords);
            lastValidIndex = this._getLastValidIndex(ycoords);
            previousSeriesFirstValidIndex = previousSeries._getFirstValidIndex(previousYCoords);
            previousSeriesLastValidIndex = previousSeries._getLastValidIndex(previousYCoords);
        }
        if(previousSeriesLastValidIndex >= firstValidIndex && previousSeriesFirstValidIndex <= lastValidIndex)
        {
            previousSeriesFirstValidIndex = Math.max(firstValidIndex, previousSeriesFirstValidIndex);
            previousSeriesLastValidIndex = Math.min(lastValidIndex, previousSeriesLastValidIndex);
            previousXCoords = previousXCoords.slice(previousSeriesFirstValidIndex, previousSeriesLastValidIndex + 1);
            previousYCoords = previousYCoords.slice(previousSeriesFirstValidIndex, previousSeriesLastValidIndex + 1);
            limit = previousSeriesFirstValidIndex;
        }
        else
        {
            limit = lastValidIndex;
        }

        closingXCoords = [xcoords[firstValidIndex]];
        closingYCoords = [ycoords[firstValidIndex]];
        currentIndex = firstValidIndex;
        while((isNaN(highestValidOrder) || highestValidOrder < order - 1) && currentIndex <= limit)
        {
            oldOrder = highestValidOrder;
            highestValidOrder = this._getHighestValidOrder(seriesCollection, currentIndex, order, direction);
            if(!isNaN(oldOrder) && highestValidOrder > oldOrder)
            {
                coords = this._getCoordsByOrderAndIndex(seriesCollection, currentIndex, oldOrder, direction);
                closingXCoords.push(coords[0]);
                closingYCoords.push(coords[1]);
            }
            coords = this._getCoordsByOrderAndIndex(seriesCollection, currentIndex, highestValidOrder, direction);
            closingXCoords.push(coords[0]);
            closingYCoords.push(coords[1]);
            currentIndex = currentIndex + 1;
        }
        if(previousXCoords && previousXCoords.length > 0 && previousSeriesLastValidIndex > firstValidIndex && previousSeriesFirstValidIndex < lastValidIndex)
        {
            closingXCoords = closingXCoords.concat(previousXCoords);
            closingYCoords = closingYCoords.concat(previousYCoords);
            highestValidOrder = order -1;
        }
        currentIndex = Math.max(firstValidIndex, previousSeriesLastValidIndex);
        order = order - 1;
        highestValidOrder = NaN;
        while(currentIndex <= lastValidIndex)
        {
            oldOrder = highestValidOrder;
            highestValidOrder = this._getHighestValidOrder(seriesCollection, currentIndex, order, direction);
            if(!isNaN(oldOrder))
            {
                if(highestValidOrder > oldOrder)
                {
                    coords = this._getCoordsByOrderAndIndex(seriesCollection, currentIndex, oldOrder, direction);
                    closingXCoords.push(coords[0]);
                    closingYCoords.push(coords[1]);
                }
                else if(highestValidOrder < oldOrder)
                {
                    coords = this._getCoordsByOrderAndIndex(seriesCollection, currentIndex - 1, highestValidOrder, direction);
                    closingXCoords.push(coords[0]);
                    closingYCoords.push(coords[1]);
                }
            }
            coords = this._getCoordsByOrderAndIndex(seriesCollection, currentIndex, highestValidOrder, direction);
            closingXCoords.push(coords[0]);
            closingYCoords.push(coords[1]);
            currentIndex = currentIndex + 1;
        }

        closingXCoords.reverse();
        closingYCoords.reverse();
        return [xcoords.concat(closingXCoords), ycoords.concat(closingYCoords)];
    },

    /**
     * Returns default values for area styles.
     *
     * @method _getAreaDefaults
     * @return Object
     * @private
     */
    _getAreaDefaults: function()
    {
        return {
        };
    }
};
Y.augment(Fills, Y.Attribute);
Y.Fills = Fills;
/**
 * Utility class used for drawing markers.
 *
 * @module charts
 * @submodule charts-base
 * @class Plots
 * @constructor
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
            style = Y.clone(this.get("styles").marker),
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
        styles.id = this.get("chart").get("id") + "_" + order + "_" + index;
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
                    marker = this._createMarker(styles, order, index);
                    break;
                }
                marker = this._markerCache.shift();

            }
            marker.set(styles);
        }
        else
        {
            marker = this._createMarker(styles, order, index);
        }
        this._markers.push(marker);
        return marker;
    },

    /**
     * Creates a shape to be used as a marker.
     *
     * @method _createMarker
     * @param {Object} styles Hash of style properties.
     * @param {Number} order Order of the series.
     * @param {Number} index Index within the series associated with the marker.
     * @return Shape
     * @private
     */
    _createMarker: function(styles, order, index)
    {
        var graphic = this.get("graphic"),
            marker,
            cfg = Y.clone(styles);
        graphic.set("autoDraw", false);
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
            id: this.get("chart").get("id") + "_" + styles.graphOrder,
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
                styles = Y.clone(this.get("styles").marker),
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                markerStyles = state == "off" || !styles[state] ? styles : styles[state];
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
    _stateSyles: null
};

Y.augment(Plots, Y.Attribute);
Y.Plots = Plots;
/**
 * Histogram is the base class for Column and Bar series.
 *
 * @module charts
 * @submodule charts-base
 * @class Histogram
 * @constructor
 */
function Histogram(){}

Histogram.prototype = {
    /**
     * Draws the series.
     *
     * @method drawSeries
     * @protected
     */
    drawSeries: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var style = Y.clone(this.get("styles").marker),
            setSize,
            calculatedSize,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            type = this.get("type"),
            graph = this.get("graph"),
            seriesCollection = graph.seriesTypes[type],
            seriesLen = seriesCollection.length,
            seriesSize = 0,
            totalSize = 0,
            offset = 0,
            ratio,
            renderer,
            order = this.get("order"),
            graphOrder = this.get("graphOrder"),
            left,
            marker,
            setSizeKey,
            calculatedSizeKey,
            config,
            fillColors = null,
            borderColors = null,
            xMarkerPlane = [],
            yMarkerPlane = [],
            xMarkerPlaneLeft,
            xMarkerPlaneRight,
            yMarkerPlaneTop,
            yMarkerPlaneBottom,
            dimensions = {
                width: [],
                height: []
            },
            xvalues = [],
            yvalues = [],
            groupMarkers = this.get("groupMarkers");
        if(Y_Lang.isArray(style.fill.color))
        {
            fillColors = style.fill.color.concat();
        }
        if(Y_Lang.isArray(style.border.color))
        {
            borderColors = style.border.color.concat();
        }
        if(this.get("direction") == "vertical")
        {
            setSizeKey = "height";
            calculatedSizeKey = "width";
        }
        else
        {
            setSizeKey = "width";
            calculatedSizeKey = "height";
        }
        setSize = style[setSizeKey];
        calculatedSize = style[calculatedSizeKey];
        this._createMarkerCache();
        for(; i < seriesLen; ++i)
        {
            renderer = seriesCollection[i];
            seriesSize += renderer.get("styles").marker[setSizeKey];
            if(order > i)
            {
                offset = seriesSize;
            }
        }
        totalSize = len * seriesSize;
        this._maxSize = graph.get(setSizeKey);
        if(totalSize > this._maxSize)
        {
            ratio = graph.get(setSizeKey)/totalSize;
            seriesSize *= ratio;
            offset *= ratio;
            setSize *= ratio;
            setSize = Math.max(setSize, 1);
            this._maxSize = setSize;
        }
        offset -= seriesSize/2;
        for(i = 0; i < len; ++i)
        {
            xMarkerPlaneLeft = xcoords[i] - seriesSize/2;
            xMarkerPlaneRight = xMarkerPlaneLeft + seriesSize;
            yMarkerPlaneTop = ycoords[i] - seriesSize/2;
            yMarkerPlaneBottom = yMarkerPlaneTop + seriesSize;
            xMarkerPlane.push({start: xMarkerPlaneLeft, end: xMarkerPlaneRight});
            yMarkerPlane.push({start: yMarkerPlaneTop, end: yMarkerPlaneBottom});
            if(isNaN(xcoords[i]) || isNaN(ycoords[i]))
            {
                this._markers.push(null);
                continue;
            }
            config = this._getMarkerDimensions(xcoords[i], ycoords[i], calculatedSize, offset);
            if(!isNaN(config.calculatedSize) && config.calculatedSize > 0)
            {
                top = config.top;
                left = config.left;

                if(groupMarkers)
                {
                    dimensions[setSizeKey][i] = setSize;
                    dimensions[calculatedSizeKey][i] = config.calculatedSize;
                    xvalues.push(left);
                    yvalues.push(top);
                }
                else
                {
                    style[setSizeKey] = setSize;
                    style[calculatedSizeKey] = config.calculatedSize;
                    style.x = left;
                    style.y = top;
                    if(fillColors)
                    {
                        style.fill.color = fillColors[i % fillColors.length];
                    }
                    if(borderColors)
                    {
                        style.border.color = borderColors[i % borderColors.length];
                    }
                    marker = this.getMarker(style, graphOrder, i);
                }

            }
            else if(!groupMarkers)
            {
                this._markers.push(null);
            }
        }
        this.set("xMarkerPlane", xMarkerPlane);
        this.set("yMarkerPlane", yMarkerPlane);
        if(groupMarkers)
        {
            this._createGroupMarker({
                fill: style.fill,
                border: style.border,
                dimensions: dimensions,
                xvalues: xvalues,
                yvalues: yvalues,
                shape: style.shape
            });
        }
        else
        {
            this._clearMarkerCache();
        }
    },

    /**
     * Collection of default colors used for marker fills in a series when not specified by user.
     *
     * @property _defaultFillColors
     * @type Array
     * @protected
     */
    _defaultFillColors: ["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"],

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
            fill:{
                type: "solid",
                alpha: 1,
                colors:null,
                alphas: null,
                ratios: null
            },
            border:{
                weight: 0,
                alpha: 1
            },
            width: 12,
            height: 12,
            shape: "rect",

            padding:{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }
        };
        defs.fill.color = this._getDefaultColor(this.get("graphOrder"), "fill");
        defs.border.color = this._getDefaultColor(this.get("graphOrder"), "border");
        return defs;
    }
};

Y.Histogram = Histogram;
/**
 * The CartesianSeries class creates a chart with horizontal and vertical axes.
 *
 * @module charts
 * @submodule charts-base
 * @class CartesianSeries
 * @extends Base
 * @uses Renderer
 * @constructor
 */
Y.CartesianSeries = Y.Base.create("cartesianSeries", Y.Base, [Y.Renderer], {
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
     * @method render
     * @private
     */
    render: function()
    {
        this._setCanvas();
        this.addListeners();
        this.set("rendered", true);
        this.validate();
    },

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
        this._stylesChangeHandle = this.after("stylesChange", function(e) {
            var axesReady = this._updateAxisData();
            if(axesReady)
            {
                this.draw();
            }
        });
        this._widthChangeHandle = this.after("widthChange", function(e) {
            var axesReady = this._updateAxisData();
            if(axesReady)
            {
                this.draw();
            }
        });
        this._heightChangeHandle = this.after("heightChange", function(e) {
            var axesReady = this._updateAxisData();
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
    _xAxisChangeHandler: function(e)
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
    _yAxisChangeHandler: function(e)
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
    _xDataChangeHandler: function(event)
    {
        var axesReady = this._updateAxisData();
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
    _yDataChangeHandler: function(event)
    {
        var axesReady = this._updateAxisData();
        if(axesReady)
        {
            this.draw();
        }
    },

    /**
     * Checks to ensure that both xAxis and yAxis data are available. If so, set the `xData` and `yData` attributes
     * and return `true`. Otherwise, return `false`.
     *
     * @method _updateAxisData
     * @return Boolean
     * @private
     */
    _updateAxisData: function()
    {
        var xAxis = this.get("xAxis"),
            yAxis = this.get("yAxis"),
            xKey = this.get("xKey"),
            yKey = this.get("yKey"),
            yData,
            xData;
        if(!xAxis || !yAxis || !xKey || !yKey)
        {
            return false;
        }
        xData = xAxis.getDataByKey(xKey);
        yData = yAxis.getDataByKey(yKey);
        if(!xData || !yData)
        {
            return false;
        }
        this.set("xData", xData.concat());
        this.set("yData", yData.concat());
        return true;
    },

    /**
     * Draws the series is the xAxis and yAxis data are both available.
     *
     * @method validate
     * @private
     */
    validate: function()
    {
        if((this.get("xData") && this.get("yData")) || this._updateAxisData())
        {
            this.draw();
        }
        else
        {
            this.fire("drawingComplete");
        }
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
     * Calculates the coordinates for the series.
     *
     * @method setAreaData
     * @protected
     */
    setAreaData: function()
    {
        var isNumber = Y_Lang.isNumber,
            nextX, nextY,
            graph = this.get("graph"),
            w = graph.get("width"),
            h = graph.get("height"),
            xAxis = this.get("xAxis"),
            yAxis = this.get("yAxis"),
            xData = this.get("xData").concat(),
            yData = this.get("yData").concat(),
            xValue,
            yValue,
            xOffset = xAxis.getEdgeOffset(xData.length, w),
            yOffset = yAxis.getEdgeOffset(yData.length, h),
            padding = this.get("styles").padding,
			leftPadding = padding.left,
			topPadding = padding.top,
			dataWidth = w - (leftPadding + padding.right + xOffset),
			dataHeight = h - (topPadding + padding.bottom + yOffset),
			xcoords = [],
			ycoords = [],
			xMax = xAxis.get("maximum"),
			xMin = xAxis.get("minimum"),
			yMax = yAxis.get("maximum"),
			yMin = yAxis.get("minimum"),
            xScaleFactor = dataWidth / (xMax - xMin),
			yScaleFactor = dataHeight / (yMax - yMin),
            dataLength,
            direction = this.get("direction"),
            i = 0,
            xMarkerPlane = [],
            yMarkerPlane = [],
            xMarkerPlaneOffset = this.get("xMarkerPlaneOffset"),
            yMarkerPlaneOffset = this.get("yMarkerPlaneOffset"),
            graphic = this.get("graphic");
        graphic.set("width", w);
        graphic.set("height", h);
        dataLength = xData.length;
        xOffset *= 0.5;
        yOffset *= 0.5;
        //Assuming a vertical graph has a range/category for its vertical axis.
        if(direction === "vertical")
        {
            yData = yData.reverse();
        }
        this._leftOrigin = Math.round(((0 - xMin) * xScaleFactor) + leftPadding + xOffset);
        this._bottomOrigin = Math.round((dataHeight + topPadding + yOffset));
        if(yMin < 0)
        {
            this._bottomOrigin = this._bottomOrigin - ((0 - yMin) * yScaleFactor);
        }
        for (; i < dataLength; ++i)
		{
            xValue = parseFloat(xData[i]);
            yValue = parseFloat(yData[i]);
            if(isNumber(xValue))
            {
                nextX = (((xValue - xMin) * xScaleFactor) + leftPadding + xOffset);
            }
            else
            {
                nextX = NaN;
            }
            if(isNumber(yValue))
            {
			    nextY = ((dataHeight + topPadding + yOffset) - (yValue - yMin) * yScaleFactor);
            }
            else
            {
                nextY = NaN;
            }
            xcoords.push(nextX);
            ycoords.push(nextY);
            xMarkerPlane.push({start:nextX - xMarkerPlaneOffset, end: nextX + xMarkerPlaneOffset});
            yMarkerPlane.push({start:nextY - yMarkerPlaneOffset, end: nextY + yMarkerPlaneOffset});
        }
        this.set("xcoords", xcoords);
		this.set("ycoords", ycoords);
        this.set("xMarkerPlane", xMarkerPlane);
        this.set("yMarkerPlane", yMarkerPlane);
        this._dataLength = dataLength;
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
        var graph = this.get("graph"),
            w = graph.get("width"),
            h = graph.get("height");
        if(this.get("rendered"))
        {
            if((isFinite(w) && isFinite(h) && w > 0 && h > 0) && ((this.get("xData") && this.get("yData")) || this._updateAxisData()))
            {
                if(this._drawing)
                {
                    this._callLater = true;
                    return;
                }
                this._drawing = true;
                this._callLater = false;
                this.setAreaData();
                if(this.get("xcoords") && this.get("ycoords"))
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
     * Collection of default colors used for lines in a series when not specified by user.
     *
     * @property _defaultLineColors
     * @type Array
     * @protected
     */
    _defaultLineColors:["#426ab3", "#d09b2c", "#000000", "#b82837", "#b384b5", "#ff7200", "#779de3", "#cbc8ba", "#7ed7a6", "#007a6c"],

    /**
     * Collection of default colors used for marker fills in a series when not specified by user.
     *
     * @property _defaultFillColors
     * @type Array
     * @protected
     */
    _defaultFillColors:["#6084d0", "#eeb647", "#6c6b5f", "#d6484f", "#ce9ed1", "#ff9f3b", "#93b7ff", "#e0ddd0", "#94ecba", "#309687"],

    /**
     * Collection of default colors used for marker borders in a series when not specified by user.
     *
     * @property _defaultBorderColors
     * @type Array
     * @protected
     */
    _defaultBorderColors:["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"],

    /**
     * Collection of default colors used for area fills, histogram fills and pie fills in a series when not specified by user.
     *
     * @property _defaultSliceColors
     * @type Array
     * @protected
     */
    _defaultSliceColors: ["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"],

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
            col = colors[type],
            l = col.length;
        index = index || 0;
        if(index >= l)
        {
            index = index % l;
        }
        type = type || "fill";
        return colors[type][index];
    },

    /**
     * Shows/hides contents of the series.
     *
     * @method _handleVisibleChange
     * @param {Object} e Event object.
     * @protected
     */
    _handleVisibleChange: function(e)
    {
        this._toggleVisible(this.get("visible"));
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
            this._xAxisChangeHandle.detach();
            this._yAxisChangeHandle.detach();
            this._stylesChangeHandle.detach();
            this._widthChangeHandle.detach();
            this._heightChangeHandle.detach();
            this._visibleChangeHandle.detach();
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
                return this.get("direction") == "vertical" ? this.get("yDisplayName") : this.get("xDisplayName");
           },

            setter: function(val)
            {
                if(this.get("direction") == "vertical")
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
                return this.get("direction") == "vertical" ? this.get("xDisplayName") : this.get("yDisplayName");
            },

            setter: function(val)
            {
                if(this.get("direction") == "vertical")
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
         * Reference to the `Chart` application.
         *
         * @attribute chart
         * @type ChartBase
         * @readOnly
         */
        chart: {
            readOnly: true,

            getter: function()
            {
                return this.get("graph").get("chart");
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
                return val.toString();
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
                return val.toString();
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
         * Indicates whether the Series has been through its initial set up.
         *
         * @attribute rendered
         * @type Boolean
         */
        rendered: {
            value: false
        },

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
                this.get("graph").get("width");
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
                this.get("graph").get("height");
            }
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
                if(this._groupMarkers === undefined)
                {
                    return this.get("graph").get("groupMarkers");
                }
                else
                {
                    return this._groupMarkers;
                }
            },

            setter: function(val)
            {
                this._groupMarkers = val;
                return val;
            }
        }
    }
});
/**
 * The MarkerSeries class renders quantitative data by plotting relevant data points
 * on a graph.
 *
 * @module charts
 * @submodule charts-base
 * @class MarkerSeries
 * @extends CartesianSeries
 * @uses Plots
 * @constructor
 */
Y.MarkerSeries = Y.Base.create("markerSeries", Y.CartesianSeries, [Y.Plots], {
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
        return Y.MarkerSeries.superclass._mergeStyles.apply(this, [val, this._getDefaultStyles()]);
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
        var styles = this._mergeStyles({marker:this._getPlotDefaults()}, Y.MarkerSeries.superclass._getDefaultStyles());
        return styles;
    }
},{
    ATTRS : {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default marker
         */
        type: {
            value:"marker"
        }

        /**
         * Style properties used for drawing markers. This attribute is inherited from `Renderer`. Below are the default
         * values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the fill. The default value is determined by the order of the series on
         *              the graph. The color will be retrieved from the below array:<br/>
         *              `["#6084d0", "#eeb647", "#6c6b5f", "#d6484f", "#ce9ed1", "#ff9f3b", "#93b7ff", "#e0ddd0", "#94ecba", "#309687"]`
         *              </dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker fill. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the border. The default value is determined by the order of the series on
         *              the graph. The color will be retrieved from the below array:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>width</dt><dd>indicates the width of the marker. The default value is 10.</dd>
         *      <dt>height</dt><dd>indicates the height of the marker The default value is 10.</dd>
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

/**
 * The LineSeries class renders quantitative data on a graph by connecting relevant data points.
 *
 * @module charts
 * @submodule charts-base
 * @class LineSeries
 * @extends CartesianSeries
 * @uses Lines
 * @constructor
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






/**
 * SplineSeries renders a graph with data points connected by a curve.
 *
 * @module charts
 * @submodule charts-base
 * @class SplineSeries
 * @constructor
 * @extends CartesianSeries
 * @uses CurveUtil
 * @uses Lines
 */
Y.SplineSeries = Y.Base.create("splineSeries",  Y.LineSeries, [Y.CurveUtil, Y.Lines], {
    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        this.drawSpline();
    }
}, {
	ATTRS : {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default spline
         */
        type : {
            value:"spline"
        }

        /**
         * Style properties used for drawing lines. This attribute is inherited from `Renderer`.
         * Below are the default values:
         *  <dl>
         *      <dt>color</dt><dd>The color of the line. The default value is determined by the order of the series on
         *      the graph. The color will be retrieved from the following array:
         *      `["#426ab3", "#d09b2c", "#000000", "#b82837", "#b384b5", "#ff7200", "#779de3", "#cbc8ba", "#7ed7a6", "#007a6c"]`
         *      <dt>weight</dt><dd>Number that indicates the width of the line. The default value is 6.</dd>
         *      <dt>alpha</dt><dd>Number between 0 and 1 that indicates the opacity of the line. The default value is 1.</dd>
         *      <dt>lineType</dt><dd>Indicates whether the line is solid or dashed. The default value is solid.</dd>
         *      <dt>dashLength</dt><dd>When the `lineType` is dashed, indicates the length of the dash. The default value
         *      is 10.</dd>
         *      <dt>gapSpace</dt><dd>When the `lineType` is dashed, indicates the distance between dashes. The default value is
         *      10.</dd>
         *      <dt>connectDiscontinuousPoints</dt><dd>Indicates whether or not to connect lines when there is a missing or null
         *      value between points. The default value is true.</dd>
         *      <dt>discontinuousType</dt><dd>Indicates whether the line between discontinuous points is solid or dashed. The
         *      default value is solid.</dd>
         *      <dt>discontinuousDashLength</dt><dd>When the `discontinuousType` is dashed, indicates the length of the dash.
         *      The default value is 10.</dd>
         *      <dt>discontinuousGapSpace</dt><dd>When the `discontinuousType` is dashed, indicates the distance between dashes.
         *      The default value is 10.</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});






/**
 * StackedSplineSeries creates spline graphs in which the different series are stacked along a value axis
 * to indicate their contribution to a cumulative total.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedSplineSeries
 * @constructor
 * @extends SplineSeries
 * @extends StackingUtil
 */
Y.StackedSplineSeries = Y.Base.create("stackedSplineSeries", Y.SplineSeries, [Y.StackingUtil], {
    /**
     * @protected
     *
     * Calculates the coordinates for the series. Overrides base implementation.
     *
     * @method setAreaData
     */
    setAreaData: function()
    {
        Y.StackedSplineSeries.superclass.setAreaData.apply(this);
        this._stackCoordinates.apply(this);
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedSpline
         */
        type: {
            value:"stackedSpline"
        }
    }
});

/**
 * StackedMarkerSeries plots markers with different series stacked along the value axis to indicate each
 * series' contribution to a cumulative total.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedMarkerSeries
 * @constructor
 * @extends MarkerSeries
 * @extends StackingUtil
 */
Y.StackedMarkerSeries = Y.Base.create("stackedMarkerSeries", Y.MarkerSeries, [Y.StackingUtil], {
    /**
     * @protected
     *
     * Calculates the coordinates for the series. Overrides base implementation.
     *
     * @method setAreaData
     */
    setAreaData: function()
    {
        Y.StackedMarkerSeries.superclass.setAreaData.apply(this);
        this._stackCoordinates.apply(this);
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedMarker
         */
        type: {
            value:"stackedMarker"
        }
    }
});

/**
 * The ColumnSeries class renders columns positioned horizontally along a category or time axis. The columns'
 * lengths are proportional to the values they represent along a vertical axis.
 * and the relevant data points.
 *
 * @module charts
 * @submodule charts-base
 * @class ColumnSeries
 * @extends MarkerSeries
 * @uses Histogram
 * @constructor
 */
Y.ColumnSeries = Y.Base.create("columnSeries", Y.MarkerSeries, [Y.Histogram], {
    /**
     * Helper method for calculating the size of markers.
     *
     * @method _getMarkerDimensions
     * @param {Number} xcoord The x-coordinate representing the data point for the marker.
     * @param {Number} ycoord The y-coordinate representing the data point for the marker.
     * @param {Number} calculatedSize The calculated size for the marker. For a `BarSeries` is it the width. For a `ColumnSeries` it is the height.
     * @param {Number} offset Distance of position offset dictated by other marker series in the same graph.
     * @return Object
     * @private
     */
    _getMarkerDimensions: function(xcoord, ycoord, calculatedSize, offset)
    {
        var config = {
            left: xcoord + offset
        };
        if(this._bottomOrigin >= ycoord)
        {
            config.top = ycoord;
            config.calculatedSize = this._bottomOrigin - config.top;
        }
        else
        {
            config.top = this._bottomOrigin;
            config.calculatedSize = ycoord - this._bottomOrigin;
        }
        return config;
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
            var styles = Y.clone(this.get("styles").marker),
                markerStyles,
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                markers,
                graph = this.get("graph"),
                seriesStyles,
                seriesCollection = graph.seriesTypes[this.get("type")],
                seriesLen = seriesCollection.length,
                seriesSize = 0,
                offset = 0,
                renderer,
                n = 0,
                xs = [],
                order = this.get("order"),
                config;
            markerStyles = state == "off" || !styles[state] ? Y.clone(styles) : Y.clone(styles[state]);
            markerStyles.fill.color = this._getItemColor(markerStyles.fill.color, i);
            markerStyles.border.color = this._getItemColor(markerStyles.border.color, i);
            config = this._getMarkerDimensions(xcoords[i], ycoords[i], styles.width, offset);
            markerStyles.height = config.calculatedSize;
            markerStyles.width = Math.min(this._maxSize, markerStyles.width);
            marker.set(markerStyles);
            for(; n < seriesLen; ++n)
            {
                xs[n] = xcoords[i] + seriesSize;
                seriesStyles = seriesCollection[n].get("styles").marker;
                seriesSize += Math.min(this._maxSize, seriesStyles.width);
                if(order > n)
                {
                    offset = seriesSize;
                }
                offset -= seriesSize/2;
            }
            for(n = 0; n < seriesLen; ++n)
            {
                markers = seriesCollection[n].get("markers");
                if(markers)
                {
                    renderer = markers[i];
                    if(renderer && renderer !== undefined)
                    {
                        renderer.set("x", (xs[n] - seriesSize/2));
                    }
                }
            }
        }
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default column
         */
        type: {
            value: "column"
        }

        /**
         * Style properties used for drawing markers. This attribute is inherited from `MarkerSeries`. Below are the default values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the fill. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *              </dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker fill. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the border. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>width</dt><dd>indicates the width of the marker. The default value is 12.</dd>
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
/**
 * The BarSeries class renders bars positioned vertically along a category or time axis. The bars'
 * lengths are proportional to the values they represent along a horizontal axis.
 * and the relevant data points.
 *
 * @module charts
 * @submodule charts-base
 * @class BarSeries
 * @extends MarkerSeries
 * @uses Histogram
 * @constructor
 */
Y.BarSeries = Y.Base.create("barSeries", Y.MarkerSeries, [Y.Histogram], {
    /**
     * Helper method for calculating the size of markers.
     *
     * @method _getMarkerDimensions
     * @param {Number} xcoord The x-coordinate representing the data point for the marker.
     * @param {Number} ycoord The y-coordinate representing the data point for the marker.
     * @param {Number} calculatedSize The calculated size for the marker. For a `BarSeries` is it the width. For a `ColumnSeries` it is the height.
     * @param {Number} offset Distance of position offset dictated by other marker series in the same graph.
     * @return Object
     * @private
     */
    _getMarkerDimensions: function(xcoord, ycoord, calculatedSize, offset)
    {
        var config = {
            top: ycoord + offset
        };
        if(xcoord >= this._leftOrigin)
        {
            config.left = this._leftOrigin;
            config.calculatedSize = xcoord - config.left;
        }
        else
        {
            config.left = xcoord;
            config.calculatedSize = this._leftOrigin - xcoord;
        }
        return config;
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
            var styles = Y.clone(this.get("styles").marker),
                markerStyles,
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                markers,
                graph = this.get("graph"),
                seriesCollection = graph.seriesTypes[this.get("type")],
                seriesLen = seriesCollection.length,
                seriesStyles,
                seriesSize = 0,
                offset = 0,
                renderer,
                n = 0,
                ys = [],
                order = this.get("order"),
                config;
            markerStyles = state == "off" || !styles[state] ? styles : styles[state];
            markerStyles.fill.color = this._getItemColor(markerStyles.fill.color, i);
            markerStyles.border.color = this._getItemColor(markerStyles.border.color, i);
            config = this._getMarkerDimensions(xcoords[i], ycoords[i], styles.height, offset);
            markerStyles.width = config.calculatedSize;
            markerStyles.height = Math.min(this._maxSize, markerStyles.height);
            marker.set(markerStyles);
            for(; n < seriesLen; ++n)
            {
                ys[n] = ycoords[i] + seriesSize;
                seriesStyles = seriesCollection[n].get("styles").marker;
                seriesSize += Math.min(this._maxSize, seriesStyles.height);
                if(order > n)
                {
                    offset = seriesSize;
                }
                offset -= seriesSize/2;
            }
            for(n = 0; n < seriesLen; ++n)
            {
                markers = seriesCollection[n].get("markers");
                if(markers)
                {
                    renderer = markers[i];
                    if(renderer && renderer !== undefined)
                    {
                        renderer.set("y", (ys[n] - seriesSize/2));
                    }
                }
            }
        }
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default bar
         */
        type: {
            value: "bar"
        },

        /**
         * Indicates the direction of the category axis that the bars are plotted against.
         *
         * @attribute direction
         * @type String
         */
        direction: {
            value: "vertical"
        }

        /**
         * Style properties used for drawing markers. This attribute is inherited from `MarkerSeries`. Below are the default values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the fill. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *              </dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker fill. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the border. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>height</dt><dd>indicates the width of the marker. The default value is 12.</dd>
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
/**
 * The AreaSeries class renders quantitative data on a graph by creating a fill between 0
 * and the relevant data points.
 *
 * @module charts
 * @submodule charts-base
 * @class AreaSeries
 * @extends CartesianSeries
 * @uses Fills
 * @constructor
 */
Y.AreaSeries = Y.Base.create("areaSeries", Y.CartesianSeries, [Y.Fills], {
    /**
     * @protected
     *
     * Renders the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        this.drawFill.apply(this, this._getClosingPoints());
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
        if(!val.area)
        {
            val = {area:val};
        }
        return Y.AreaSeries.superclass._setStyles.apply(this, [val]);
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
        var styles = this._mergeStyles({area:this._getAreaDefaults()}, Y.AreaSeries.superclass._getDefaultStyles());
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
         * @default area
         */
        type: {
            value:"area"
        }

        /**
         * Style properties used for drawing area fills. This attribute is inherited from `Renderer`. Below are the default values:
         *
         *  <dl>
         *      <dt>color</dt><dd>The color of the fill. The default value is determined by the order of the series on the graph. The color will be
         *      retrieved from the following array:
         *      `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *      </dd>
         *      <dt>alpha</dt><dd>Number between 0 and 1 that indicates the opacity of the fill. The default value is 1</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});






/**
 * AreaSplineSeries renders an area graph with data points connected by a curve.
 *
 * @module charts
 * @submodule charts-base
 * @class AreaSplineSeries
 * @constructor
 * @extends CartesianSeries
 * @uses Fills
 * @uses CurveUtil
 */
Y.AreaSplineSeries = Y.Base.create("areaSplineSeries", Y.AreaSeries, [Y.CurveUtil], {
    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        this.drawAreaSpline();
    }
}, {
	ATTRS : {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default areaSpline
         */
        type: {
            value:"areaSpline"
        }

        /**
         * Style properties used for drawing area fills. This attribute is inherited from `Renderer`. Below are the default values:
         *
         *  <dl>
         *      <dt>color</dt><dd>The color of the fill. The default value is determined by the order of the series on the graph. The color will be
         *      retrieved from the following array:
         *      `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *      </dd>
         *      <dt>alpha</dt><dd>Number between 0 and 1 that indicates the opacity of the fill. The default value is 1</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});

/**
 * StackedAreaSplineSeries creates a stacked area chart with points data points connected by a curve.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedAreaSplineSeries
 * @constructor
 * @extends AreaSeries
 * @uses CurveUtil
 * @uses StackingUtil
 */
Y.StackedAreaSplineSeries = Y.Base.create("stackedAreaSplineSeries", Y.AreaSeries, [Y.CurveUtil, Y.StackingUtil], {
    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        this._stackCoordinates();
        this.drawStackedAreaSpline();
    }
}, {
    ATTRS : {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedAreaSpline
         */
        type: {
            value:"stackedAreaSpline"
        }
    }
});

/**
 * The ComboSeries class renders a combination of lines, plots and area fills in a single series.
 * Each series type has a corresponding boolean attribute indicating if it is rendered. By default,
 * lines and plots are rendered and area is not.
 *
 * @module charts
 * @submodule charts-base
 * @class ComboSeries
 * @extends CartesianSeries
 * @uses Fills
 * @uses Lines
 * @uses Plots
 * @constructor
 */
Y.ComboSeries = Y.Base.create("comboSeries", Y.CartesianSeries, [Y.Fills, Y.Lines, Y.Plots], {
	/**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        if(this.get("showAreaFill"))
        {
            this.drawFill.apply(this, this._getClosingPoints());
        }
        if(this.get("showLines"))
        {
            this.drawLines();
        }
        if(this.get("showMarkers"))
        {
            this.drawPlots();
        }
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
        var markers,
            marker,
            len,
            i;
        if(this.get("showAreaFill") && this._path)
        {
            this._path.set("visible", visible);
        }
        if(this.get("showLines") && this._lineGraphic)
        {
            this._lineGraphic.set("visible", visible);
        }
        if(this.get("showMarkers"))
        {
            markers = this.get("markers");
            if(markers)
            {
                i = 0;
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
        }
    },

    /**
     * @protected
     *
     * Returns the default hash for the `styles` attribute.
     *
     * @method _getDefaultStyles
     * @return Object
     */
    _getDefaultStyles: function()
    {
        var styles = Y.ComboSeries.superclass._getDefaultStyles();
        styles.line = this._getLineDefaults();
        styles.marker = this._getPlotDefaults();
        styles.area = this._getAreaDefaults();
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
         * @default combo
         */
        type: {
            value:"combo"
        },

        /**
         * Indicates whether a fill is displayed.
         *
         * @attribute showAreaFill
         * @type Boolean
         * @default false
         */
        showAreaFill: {
            value: false
        },

        /**
         * Indicates whether lines are displayed.
         *
         * @attribute showLines
         * @type Boolean
         * @default true
         */
        showLines: {
            value: true
        },

        /**
         * Indicates whether markers are displayed.
         *
         * @attribute showMarkers
         * @type Boolean
         * @default true
         */
        showMarkers: {
            value: true
        },

        /**
         * Reference to the styles of the markers. These styles can also
         * be accessed through the `styles` attribute. Below are default
         * values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the fill. The default value is determined by the order of the series on the
         *              graph. The color will be retrieved from the below array:<br/>
         *              `["#6084d0", "#eeb647", "#6c6b5f", "#d6484f", "#ce9ed1", "#ff9f3b", "#93b7ff", "#e0ddd0", "#94ecba", "#309687"]`
         *              </dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker fill. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the border. The default value is determined by the order of the series on the graph.
         *              The color will be retrieved from the below array:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>width</dt><dd>indicates the width of the marker. The default value is 10.</dd>
         *      <dt>height</dt><dd>indicates the height of the marker The default value is 10.</dd>
         *      <dt>over</dt><dd>hash containing styles for markers when highlighted by a `mouseover` event. The default
         *      values for each style is null. When an over style is not set, the non-over value will be used. For example,
         *      the default value for `marker.over.fill.color` is equivalent to `marker.fill.color`.</dd>
         *  </dl>
         *
         * @attribute marker
         * @type Object
         */
        marker: {
            lazyAdd: false,
            getter: function()
            {
                return this.get("styles").marker;
            },
            setter: function(val)
            {
                this.set("styles", {marker:val});
            }
        },

        /**
         * Reference to the styles of the lines. These styles can also be accessed through the `styles` attribute.
         * Below are the default values:
         *  <dl>
         *      <dt>color</dt><dd>The color of the line. The default value is determined by the order of the series on the graph. The color
         *      will be retrieved from the following array:
         *      `["#426ab3", "#d09b2c", "#000000", "#b82837", "#b384b5", "#ff7200", "#779de3", "#cbc8ba", "#7ed7a6", "#007a6c"]`
         *      <dt>weight</dt><dd>Number that indicates the width of the line. The default value is 6.</dd>
         *      <dt>alpha</dt><dd>Number between 0 and 1 that indicates the opacity of the line. The default value is 1.</dd>
         *      <dt>lineType</dt><dd>Indicates whether the line is solid or dashed. The default value is solid.</dd>
         *      <dt>dashLength</dt><dd>When the `lineType` is dashed, indicates the length of the dash. The default value is 10.</dd>
         *      <dt>gapSpace</dt><dd>When the `lineType` is dashed, indicates the distance between dashes. The default value is 10.</dd>
         *      <dt>connectDiscontinuousPoints</dt><dd>Indicates whether or not to connect lines when there is a missing or null value
         *      between points. The default value is true.</dd>
         *      <dt>discontinuousType</dt><dd>Indicates whether the line between discontinuous points is solid or dashed. The default
         *      value is solid.</dd>
         *      <dt>discontinuousDashLength</dt><dd>When the `discontinuousType` is dashed, indicates the length of the dash. The default
         *      value is 10.</dd>
         *      <dt>discontinuousGapSpace</dt><dd>When the `discontinuousType` is dashed, indicates the distance between dashes. The default
         *      value is 10.</dd>
         *  </dl>
         *
         * @attribute line
         * @type Object
         */
        line: {
            lazyAdd: false,
            getter: function()
            {
                return this.get("styles").line;
            },
            setter: function(val)
            {
                this.set("styles", {line:val});
            }
        },

        /**
         * Reference to the styles of the area fills. These styles can also be accessed through the `styles` attribute.
         * Below are the default values:
         *
         *  <dl>
         *      <dt>color</dt><dd>The color of the fill. The default value is determined by the order of the series on the
         *      graph. The color will be retrieved from the following array:
         *      `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *      </dd>
         *      <dt>alpha</dt><dd>Number between 0 and 1 that indicates the opacity of the fill. The default value is 1</dd>
         *  </dl>
         *
         * @attribute area
         * @type Object
         */
        area: {
            lazyAdd: false,
            getter: function()
            {
                return this.get("styles").area;
            },
            setter: function(val)
            {
                this.set("styles", {area:val});
            }
        }

        /**
         * Style properties for the series. Contains a key indexed hash of the following:
         *  <dl>
         *      <dt>marker</dt><dd>Style properties for the markers in the series. Specific style attributes are listed
         *      <a href="#attr_marker">here</a>.</dd>
         *      <dt>line</dt><dd>Style properties for the lines in the series. Specific
         *      style attributes are listed <a href="#attr_line">here</a>.</dd>
         *      <dt>area</dt><dd>Style properties for the area fills in the series. Specific style attributes are listed
         *      <a href="#attr_area">here</a>.</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});






/**
 * The StackedComboSeries class renders a combination of lines, plots and area fills in a single series. Series
 * are stacked along the value axis to indicate each series contribution to a cumulative total. Each
 * series type has a corresponding boolean attribute indicating if it is rendered. By default, all three types are
 * rendered.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedComboSeries
 * @extends ComboSeries
 * @uses StackingUtil
 * @constructor
 */
Y.StackedComboSeries = Y.Base.create("stackedComboSeries", Y.ComboSeries, [Y.StackingUtil], {
    /**
     * @protected
     *
     * Calculates the coordinates for the series. Overrides base implementation.
     *
     * @method setAreaData
     */
    setAreaData: function()
    {
        Y.StackedComboSeries.superclass.setAreaData.apply(this);
        this._stackCoordinates.apply(this);
    },

    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        if(this.get("showAreaFill"))
        {
            this.drawFill.apply(this, this._getStackedClosingPoints());
        }
        if(this.get("showLines"))
        {
            this.drawLines();
        }
        if(this.get("showMarkers"))
        {
            this.drawPlots();
        }
    }

}, {
    ATTRS : {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedCombo
         */
        type: {
            value: "stackedCombo"
        },

        /**
         * Indicates whether a fill is displayed.
         *
         * @attribute showAreaFill
         * @type Boolean
         * @default true
         */
        showAreaFill: {
            value: true
        }
    }
});
/**
 * The ComboSplineSeries class renders a combination of splines, plots and areaspline fills in a single series. Each
 * series type has a corresponding boolean attribute indicating if it is rendered. By default, splines and plots
 * are rendered and areaspline is not.
 *
 * @module charts
 * @submodule charts-base
 * @class ComboSplineSeries
 * @extends ComboSeries
 * @extends CurveUtil
 * @constructor
 */
Y.ComboSplineSeries = Y.Base.create("comboSplineSeries", Y.ComboSeries, [Y.CurveUtil], {
    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
    {
        if(this.get("showAreaFill"))
        {
            this.drawAreaSpline();
        }
        if(this.get("showLines"))
        {
            this.drawSpline();
        }
        if(this.get("showMarkers"))
        {
            this.drawPlots();
        }
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default comboSpline
         */
        type: {
            value : "comboSpline"
        }
    }
});
/**
 * The StackedComboSplineSeries class renders a combination of splines, plots and areaspline fills in a single series. Series
 * are stacked along the value axis to indicate each series contribution to a cumulative total. Each
 * series type has a corresponding boolean attribute indicating if it is rendered. By default, all three types are
 * rendered.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedComboSplineSeries
 * @extends StackedComboSeries
 * @uses CurveUtil
 * @constructor
 */
Y.StackedComboSplineSeries = Y.Base.create("stackedComboSplineSeries", Y.StackedComboSeries, [Y.CurveUtil], {
    /**
	 * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
	 */
	drawSeries: function()
    {
        if(this.get("showAreaFill"))
        {
            this.drawStackedAreaSpline();
        }
        if(this.get("showLines"))
        {
            this.drawSpline();
        }
        if(this.get("showMarkers"))
        {
            this.drawPlots();
        }
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedComboSpline
         */
        type : {
            value : "stackedComboSpline"
        },

        /**
         * Indicates whether a fill is displayed.
         *
         * @attribute showAreaFill
         * @type Boolean
         * @default true
         */
        showAreaFill: {
            value: true
        }
    }
});
/**
 * StackedLineSeries creates line graphs in which the different series are stacked along a value axis
 * to indicate their contribution to a cumulative total.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedLineSeries
 * @constructor
 * @extends  LineSeries
 * @uses StackingUtil
 */
Y.StackedLineSeries = Y.Base.create("stackedLineSeries", Y.LineSeries, [Y.StackingUtil], {
    /**
     * @protected
     *
     * Calculates the coordinates for the series. Overrides base implementation.
     *
     * @method setAreaData
     */
    setAreaData: function()
    {
        Y.StackedLineSeries.superclass.setAreaData.apply(this);
        this._stackCoordinates.apply(this);
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedLine
         */
        type: {
            value:"stackedLine"
        }
    }
});
/**
 * StackedAreaSeries area fills to display data showing its contribution to a whole.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedAreaSeries
 * @constructor
 * @param {Object} config (optional) Configuration parameters for the Chart.
 * @extends AreaSeries
 * @uses StackingUtil
 */
Y.StackedAreaSeries = Y.Base.create("stackedAreaSeries", Y.AreaSeries, [Y.StackingUtil], {
    /**
     * @protected
     *
     * Calculates the coordinates for the series. Overrides base implementation.
     *
     * @method setAreaData
     */
    setAreaData: function()
    {
        Y.StackedAreaSeries.superclass.setAreaData.apply(this);
        this._stackCoordinates.apply(this);
    },

    /**
     * @protected
     *
     * Draws the series
     *
     * @method drawSeries
     */
	drawSeries: function()
    {
        this.drawFill.apply(this, this._getStackedClosingPoints());
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedArea
         */
        type: {
            value:"stackedArea"
        }
    }
});
/**
 * The StackedColumnSeries renders column chart in which series are stacked vertically to show
 * their contribution to the cumulative total.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedColumnSeries
 * @extends ColumnSeries
 * @uses StackingUtil
 * @constructor
 */
Y.StackedColumnSeries = Y.Base.create("stackedColumnSeries", Y.ColumnSeries, [Y.StackingUtil], {
    /**
     * Draws the series.
     *
     * @method drawSeries
	 * @protected
	 */
	drawSeries: function()
	{
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var isNumber = Y_Lang.isNumber,
            style = Y.clone(this.get("styles").marker),
            w = style.width,
            h = style.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            type = this.get("type"),
            graph = this.get("graph"),
            seriesCollection = graph.seriesTypes[type],
            ratio,
            order = this.get("order"),
            graphOrder = this.get("graphOrder"),
            left,
            marker,
            fillColors,
            borderColors,
            lastCollection,
            negativeBaseValues,
            positiveBaseValues,
            useOrigin = order === 0,
            totalWidth = len * w,
            dimensions = {
                width: [],
                height: []
            },
            xvalues = [],
            yvalues = [],
            groupMarkers = this.get("groupMarkers");
        if(Y_Lang.isArray(style.fill.color))
        {
            fillColors = style.fill.color.concat();
        }
        if(Y_Lang.isArray(style.border.color))
        {
            borderColors = style.border.color.concat();
        }
        this._createMarkerCache();
        if(totalWidth > this.get("width"))
        {
            ratio = this.width/totalWidth;
            w *= ratio;
            w = Math.max(w, 1);
        }
        if(!useOrigin)
        {
            lastCollection = seriesCollection[order - 1];
            negativeBaseValues = lastCollection.get("negativeBaseValues");
            positiveBaseValues = lastCollection.get("positiveBaseValues");
            if(!negativeBaseValues || !positiveBaseValues)
            {
                useOrigin = true;
                positiveBaseValues = [];
                negativeBaseValues = [];
            }
        }
        else
        {
            negativeBaseValues = [];
            positiveBaseValues = [];
        }
        this.set("negativeBaseValues", negativeBaseValues);
        this.set("positiveBaseValues", positiveBaseValues);
        for(i = 0; i < len; ++i)
        {
            left = xcoords[i];
            top = ycoords[i];

            if(!isNumber(top) || !isNumber(left))
            {
                if(useOrigin)
                {
                    negativeBaseValues[i] = this._bottomOrigin;
                    positiveBaseValues[i] = this._bottomOrigin;
                }
                this._markers.push(null);
                continue;
            }
            if(useOrigin)
            {
                h = Math.abs(this._bottomOrigin - top);
                if(top < this._bottomOrigin)
                {
                    positiveBaseValues[i] = top;
                    negativeBaseValues[i] = this._bottomOrigin;
                }
                else if(top > this._bottomOrigin)
                {
                    positiveBaseValues[i] = this._bottomOrigin;
                    negativeBaseValues[i] = top;
                    top -= h;
                }
                else
                {
                    positiveBaseValues[i] = top;
                    negativeBaseValues[i] = top;
                }
            }
            else
            {
                if(top > this._bottomOrigin)
                {
                    top += (negativeBaseValues[i] - this._bottomOrigin);
                    h = top - negativeBaseValues[i];
                    negativeBaseValues[i] = top;
                    top -= h;
                }
                else if(top <= this._bottomOrigin)
                {
                    top = positiveBaseValues[i] - (this._bottomOrigin - top);
                    h = positiveBaseValues[i] - top;
                    positiveBaseValues[i] = top;
                }
            }
            if(!isNaN(h) && h > 0)
            {
                left -= w/2;
                if(groupMarkers)
                {
                    dimensions.width[i] = w;
                    dimensions.height[i] = h;
                    xvalues.push(left);
                    yvalues.push(top);
                }
                else
                {
                    style.width = w;
                    style.height = h;
                    style.x = left;
                    style.y = top;
                    if(fillColors)
                    {
                        style.fill.color = fillColors[i % fillColors.length];
                    }
                    if(borderColors)
                    {
                        style.border.color = borderColors[i % borderColors.length];
                    }
                    marker = this.getMarker(style, graphOrder, i);
                }
            }
            else if(!groupMarkers)
            {
               this._markers.push(null);
            }
        }
        if(groupMarkers)
        {
            this._createGroupMarker({
                fill: style.fill,
                border: style.border,
                dimensions: dimensions,
                xvalues: xvalues,
                yvalues: yvalues,
                shape: style.shape
            });
        }
        else
        {
            this._clearMarkerCache();
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
            var styles,
                markerStyles,
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                marker = this._markers[i],
                offset = 0,
                fillColor,
                borderColor;
            styles = this.get("styles").marker;
            offset = styles.width * 0.5;
            markerStyles = state == "off" || !styles[state] ? Y.clone(styles) : Y.clone(styles[state]);
            markerStyles.height = marker.get("height");
            markerStyles.x = (xcoords[i] - offset);
            markerStyles.y = marker.get("y");
            markerStyles.id = marker.get("id");
            fillColor = markerStyles.fill.color;
            borderColor = markerStyles.border.color;
            if(Y_Lang.isArray(fillColor))
            {
                markerStyles.fill.color = fillColor[i % fillColor.length];
            }
            else
            {
                markerStyles.fill.color = this._getItemColor(markerStyles.fill.color, i);
            }
            if(Y_Lang.isArray(borderColor))
            {
                markerStyles.border.color = borderColor[i % borderColor.length];
            }
            else
            {
                markerStyles.border.color = this._getItemColor(markerStyles.border.color, i);
            }
            marker.set(markerStyles);
        }
    },

    /**
     * Gets the default values for the markers.
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
                weight: 0,
                alpha: 1
            },
            width: 24,
            height: 24,
            shape: "rect",

            padding:{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }
        };
        defs.fill.color = this._getDefaultColor(this.get("graphOrder"), "fill");
        defs.border.color = this._getDefaultColor(this.get("graphOrder"), "border");
        return defs;
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedColumn
         */
        type: {
            value: "stackedColumn"
        },

        /**
         * @attribute negativeBaseValues
         * @type Array
         * @default null
         * @private
         */
        negativeBaseValues: {
            value: null
        },

        /**
         * @attribute positiveBaseValues
         * @type Array
         * @default null
         * @private
         */
        positiveBaseValues: {
            value: null
        }

        /**
         * Style properties used for drawing markers. This attribute is inherited from `ColumnSeries`. Below are the default values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the fill. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *              </dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker fill. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the border. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>width</dt><dd>indicates the width of the marker. The default value is 24.</dd>
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

/**
 * The StackedBarSeries renders bar chart in which series are stacked horizontally to show
 * their contribution to the cumulative total.
 *
 * @module charts
 * @submodule charts-base
 * @class StackedBarSeries
 * @extends BarSeries
 * @uses StackingUtil
 * @constructor
 */
Y.StackedBarSeries = Y.Base.create("stackedBarSeries", Y.BarSeries, [Y.StackingUtil], {
    /**
     * @protected
     *
     * Draws the series.
     *
     * @method drawSeries
     */
    drawSeries: function()
	{
        if(this.get("xcoords").length < 1)
        {
            return;
        }

        var isNumber = Y_Lang.isNumber,
            style = Y.clone(this.get("styles").marker),
            w = style.width,
            h = style.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            type = this.get("type"),
            graph = this.get("graph"),
            seriesCollection = graph.seriesTypes[type],
            ratio,
            order = this.get("order"),
            graphOrder = this.get("graphOrder"),
            left,
            marker,
            lastCollection,
            negativeBaseValues,
            positiveBaseValues,
            fillColors,
            borderColors,
            useOrigin = order === 0,
            totalHeight = len * h,
            dimensions = {
                width: [],
                height: []
            },
            xvalues = [],
            yvalues = [],
            groupMarkers = this.get("groupMarkers");
        if(Y_Lang.isArray(style.fill.color))
        {
            fillColors = style.fill.color.concat();
        }
        if(Y_Lang.isArray(style.border.color))
        {
            borderColors = style.border.color.concat();
        }
        this._createMarkerCache();
        if(totalHeight > this.get("height"))
        {
            ratio = this.height/totalHeight;
            h *= ratio;
            h = Math.max(h, 1);
        }
        if(!useOrigin)
        {
            lastCollection = seriesCollection[order - 1];
            negativeBaseValues = lastCollection.get("negativeBaseValues");
            positiveBaseValues = lastCollection.get("positiveBaseValues");
            if(!negativeBaseValues || !positiveBaseValues)
            {
                useOrigin = true;
                positiveBaseValues = [];
                negativeBaseValues = [];
            }
        }
        else
        {
            negativeBaseValues = [];
            positiveBaseValues = [];
        }
        this.set("negativeBaseValues", negativeBaseValues);
        this.set("positiveBaseValues", positiveBaseValues);
        for(i = 0; i < len; ++i)
        {
            top = ycoords[i];
            left = xcoords[i];
            if(!isNumber(top) || !isNumber(left))
            {
                if(useOrigin)
                {
                    positiveBaseValues[i] = this._leftOrigin;
                    negativeBaseValues[i] = this._leftOrigin;
                }
                this._markers.push(null);
                continue;
            }
            if(useOrigin)
            {
                w = Math.abs(left - this._leftOrigin);
                if(left > this._leftOrigin)
                {
                    positiveBaseValues[i] = left;
                    negativeBaseValues[i] = this._leftOrigin;
                    left -= w;
                }
                else if(left < this._leftOrigin)
                {
                    positiveBaseValues[i] = this._leftOrigin;
                    negativeBaseValues[i] = left;
                }
                else
                {
                    positiveBaseValues[i] = left;
                    negativeBaseValues[i] = this._leftOrigin;
                }
            }
            else
            {
                if(left < this._leftOrigin)
                {
                    left = negativeBaseValues[i] - (this._leftOrigin - xcoords[i]);
                    w = negativeBaseValues[i] - left;
                    negativeBaseValues[i] = left;
                }
                else if(left >= this._leftOrigin)
                {
                    left += (positiveBaseValues[i] - this._leftOrigin);
                    w = left - positiveBaseValues[i];
                    positiveBaseValues[i] = left;
                    left -= w;
                }
            }
            if(!isNaN(w) && w > 0)
            {
                top -= h/2;
                if(groupMarkers)
                {
                    dimensions.width[i] = w;
                    dimensions.height[i] = h;
                    xvalues.push(left);
                    yvalues.push(top);
                }
                else
                {
                    style.width = w;
                    style.height = h;
                    style.x = left;
                    style.y = top;
                    if(fillColors)
                    {
                        style.fill.color = fillColors[i % fillColors.length];
                    }
                    if(borderColors)
                    {
                        style.border.color = borderColors[i % borderColors.length];
                    }
                    marker = this.getMarker(style, graphOrder, i);
                }
            }
            else if(!groupMarkers)
            {
                this._markers.push(null);
            }
        }
        if(groupMarkers)
        {
            this._createGroupMarker({
                fill: style.fill,
                border: style.border,
                dimensions: dimensions,
                xvalues: xvalues,
                yvalues: yvalues,
                shape: style.shape
            });
        }
        else
        {
            this._clearMarkerCache();
        }
    },

    /**
     * @protected
     *
     * Resizes and positions markers based on a mouse interaction.
     *
     * @method updateMarkerState
     * @param {String} type state of the marker
     * @param {Number} i index of the marker
     */
    updateMarkerState: function(type, i)
    {
        if(this._markers[i])
        {
            var state = this._getState(type),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                styles = this.get("styles").marker,
                h = styles.height,
                markerStyles = state == "off" || !styles[state] ? Y.clone(styles) : Y.clone(styles[state]),
                fillColor,
                borderColor;
            markerStyles.y = (ycoords[i] - h/2);
            markerStyles.x = marker.get("x");
            markerStyles.width = marker.get("width");
            markerStyles.id = marker.get("id");
            fillColor = markerStyles.fill.color;
            borderColor = markerStyles.border.color;
            if(Y_Lang.isArray(fillColor))
            {
                markerStyles.fill.color = fillColor[i % fillColor.length];
            }
            else
            {
                markerStyles.fill.color = this._getItemColor(markerStyles.fill.color, i);
            }
            if(Y_Lang.isArray(borderColor))
            {
                markerStyles.border.color = borderColor[i % borderColor.length];
            }
            else
            {
                markerStyles.border.color = this._getItemColor(markerStyles.border.color, i);
            }
            marker.set(markerStyles);
        }
    },

    /**
     * @protected
     *
     * Returns default values for the `styles` attribute.
     *
     * @method _getPlotDefaults
     * @return Object
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
                weight: 0,
                alpha: 1
            },
            width: 24,
            height: 24,
            shape: "rect",

            padding:{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }
        };
        defs.fill.color = this._getDefaultColor(this.get("graphOrder"), "fill");
        defs.border.color = this._getDefaultColor(this.get("graphOrder"), "border");
        return defs;
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default stackedBar
         */
        type: {
            value: "stackedBar"
        },

        /**
         * Direction of the series
         *
         * @attribute direction
         * @type String
         * @default vertical
         */
        direction: {
            value: "vertical"
        },

        /**
         * @private
         *
         * @attribute negativeBaseValues
         * @type Array
         * @default null
         */
        negativeBaseValues: {
            value: null
        },

        /**
         * @private
         *
         * @attribute positiveBaseValues
         * @type Array
         * @default null
         */
        positiveBaseValues: {
            value: null
        }

        /**
         * Style properties used for drawing markers. This attribute is inherited from `BarSeries`. Below are the default values:
         *  <dl>
         *      <dt>fill</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the fill. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"]`
         *              </dd>
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker fill. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>border</dt><dd>A hash containing the following values:
         *          <dl>
         *              <dt>color</dt><dd>Color of the border. The default value is determined by the order of the series on the graph. The color
         *              will be retrieved from the below array:<br/>
         *              `["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"]`
         *              <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the marker border. The default value is 1.</dd>
         *              <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
         *          </dl>
         *      </dd>
         *      <dt>height</dt><dd>indicates the width of the marker. The default value is 24.</dd>
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

/**
 * PieSeries visualizes data as a circular chart divided into wedges which represent data as a
 * percentage of a whole.
 *
 * @module charts
 * @submodule charts-base
 * @class PieSeries
 * @constructor
 * @extends MarkerSeries
 */
Y.PieSeries = Y.Base.create("pieSeries", Y.MarkerSeries, [], {
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
            cb = this.get("graph").get("contentBox"),
            areaNode;
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
        this._image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAABCAYAAAD9yd/wAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABJJREFUeNpiZGBgSGPAAgACDAAIkABoFyloZQAAAABJRU5ErkJggg==";
        cb.appendChild(this._image);
        this._image.setAttribute("usemap", "#" + id);
        this._image.style.zIndex = 3;
        this._image.style.opacity = 0;
        this._image.setAttribute("alt", "imagemap");
        this._map = DOCUMENT.createElement("map");
        this._map.style.zIndex = 5;
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
        this.after("stylesChange", this._updateHandler);
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
    _categoryAxisChangeHandler: function(e)
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
    _valueAxisChangeHandler: function(e)
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
    _categoryDataChangeHandler: function(event)
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
    _valueDataChangeHandler: function(event)
    {
        if(this._rendered && this.get("categoryKey") && this.get("valueKey"))
        {
            this.draw();
        }
    },

    /**
     * Draws the series. Overrides the base implementation.
     *
     * @method draw
     * @protected
     */
    draw: function()
    {
        var graph = this.get("graph"),
            w = graph.get("width"),
            h = graph.get("height");
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
            catValues = this.get("categoryAxis").getDataByKey(this.get("categoryKey")).concat(),
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
            graph = this.get("graph"),
            minDimension = Math.min(graph.get("width"), graph.get("height")),
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
            graphOrder = this.get("graphOrder"),
            isCanvas = Y.Graphic.NAME == "canvasGraphic";
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
            markerStyles = state == "off" || !styles[state] ? styles : styles[state];
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
     * @param {Number} order Order of the series.
     * @param {Number} index Index within the series associated with the marker.
     * @return Shape
     * @private
     */
    _createMarker: function(styles, order, index)
    {
        var graphic = this.get("graphic"),
            marker,
            cfg = Y.clone(styles);
        graphic.set("autoDraw", false);
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
    },

    /**
     * Collection of default colors used for lines in a series when not specified by user.
     *
     * @property _defaultLineColors
     * @type Array
     * @protected
     */
    _defaultLineColors:["#426ab3", "#d09b2c", "#000000", "#b82837", "#b384b5", "#ff7200", "#779de3", "#cbc8ba", "#7ed7a6", "#007a6c"],

    /**
     * Collection of default colors used for marker fills in a series when not specified by user.
     *
     * @property _defaultFillColors
     * @type Array
     * @protected
     */
    _defaultFillColors:["#6084d0", "#eeb647", "#6c6b5f", "#d6484f", "#ce9ed1", "#ff9f3b", "#93b7ff", "#e0ddd0", "#94ecba", "#309687"],

    /**
     * Collection of default colors used for marker borders in a series when not specified by user.
     *
     * @property _defaultBorderColors
     * @type Array
     * @protected
     */
    _defaultBorderColors:["#205096", "#b38206", "#000000", "#94001e", "#9d6fa0", "#e55b00", "#5e85c9", "#adab9e", "#6ac291", "#006457"],

    /**
     * Collection of default colors used for area fills, histogram fills and pie fills in a series when not specified by user.
     *
     * @property _defaultSliceColors
     * @type Array
     * @protected
     */
    _defaultSliceColors: ["#66007f", "#a86f41", "#295454", "#996ab2", "#e8cdb7", "#90bdbd","#000000","#c3b8ca", "#968373", "#678585"],

    /**
     * Colors used if style colors are not specified
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
            col = colors[type],
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
/**
 * Gridlines draws gridlines on a Graph.
 *
 * @module charts
 * @submodule charts-base
 * @class Gridlines
 * @constructor
 * @extends Base
 * @uses Renderer
 */
Y.Gridlines = Y.Base.create("gridlines", Y.Base, [Y.Renderer], {
    /**
     * Reference to the `Path` element used for drawing Gridlines.
     *
     * @property _path
     * @type Path
     * @private
     */
    _path: null,

    /**
     * Removes the Gridlines.
     *
     * @method remove
     * @private
     */
    remove: function()
    {
        var path = this._path;
        if(path)
        {
            path.destroy();
        }
    },

    /**
     * Draws the gridlines
     *
     * @method draw
     * @protected
     */
    draw: function()
    {
        if(this.get("axis") && this.get("graph"))
        {
            this._drawGridlines();
        }
    },

    /**
     * Algorithm for drawing gridlines
     *
     * @method _drawGridlines
     * @private
     */
    _drawGridlines: function()
    {
        var path,
            axis = this.get("axis"),
            axisPosition = axis.get("position"),
            points,
            i = 0,
            l,
            direction = this.get("direction"),
            graph = this.get("graph"),
            w = graph.get("width"),
            h = graph.get("height"),
            line = this.get("styles").line,
            color = line.color,
            weight = line.weight,
            alpha = line.alpha,
            lineFunction = direction == "vertical" ? this._verticalLine : this._horizontalLine;
        if(isFinite(w) && isFinite(h) && w > 0 && h > 0)
        {
            if(axisPosition != "none" && axis && axis.get("tickPoints"))
            {
                points = axis.get("tickPoints");
                l = points.length;
            }
            else
            {
                points = [];
                l = axis.get("styles").majorUnit.count;
                for(; i < l; ++i)
                {
                    points[i] = {
                        x: w * (i/(l-1)),
                        y: h * (i/(l-1))
                    };
                }
                i = 0;
            }
            path = graph.get("gridlines");
            path.set("width", w);
            path.set("height", h);
            path.set("stroke", {
                weight: weight,
                color: color,
                opacity: alpha
            });
            for(; i < l; ++i)
            {
                lineFunction(path, points[i], w, h);
            }
            path.end();
        }
    },

    /**
     * Algorithm for horizontal lines.
     *
     * @method _horizontalLine
     * @param {Path} path Reference to path element
     * @param {Object} pt Coordinates corresponding to a major unit of an axis.
     * @param {Number} w Width of the Graph
     * @param {Number} h Height of the Graph
     * @private
     */
    _horizontalLine: function(path, pt, w, h)
    {
        path.moveTo(0, pt.y);
        path.lineTo(w, pt.y);
    },

    /**
     * Algorithm for vertical lines.
     *
     * @method _verticalLine
     * @param {Path} path Reference to path element
     * @param {Object} pt Coordinates corresponding to a major unit of an axis.
     * @param {Number} w Width of the Graph
     * @param {Number} h Height of the Graph
     * @private
     */
    _verticalLine: function(path, pt, w, h)
    {
        path.moveTo(pt.x, 0);
        path.lineTo(pt.x, h);
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
        var defs = {
            line: {
                color:"#f0efe9",
                weight: 1,
                alpha: 1
            }
        };
        return defs;
    }

},
{
    ATTRS: {
        /**
         * Indicates the direction of the gridline.
         *
         * @attribute direction
         * @type String
         */
        direction: {},

        /**
         * Indicate the `Axis` in which to bind
         * the gridlines.
         *
         * @attribute axis
         * @type Axis
         */
        axis: {},

        /**
         * Indicates the `Graph` in which the gridlines
         * are drawn.
         *
         * @attribute graph
         * @type Graph
         */
        graph: {}
    }
});
/**
 * Graph manages and contains series instances for a `CartesianChart`
 * instance.
 *
 * @module charts
 * @submodule charts-base
 * @class Graph
 * @constructor
 * @extends Widget
 * @uses Renderer
 */
Y.Graph = Y.Base.create("graph", Y.Widget, [Y.Renderer], {
    /**
     * @method bindUI
     * @private
     */
    bindUI: function()
    {
        var bb = this.get("boundingBox");
        bb.setStyle("position", "absolute");
        this.after("widthChange", this._sizeChangeHandler);
        this.after("heightChange", this._sizeChangeHandler);
        this.after("stylesChange", this._updateStyles);
        this.after("groupMarkersChange", this._drawSeries);
    },

    /**
     * @method syncUI
     * @private
     */
    syncUI: function()
    {
        var background,
            cb,
            bg,
            sc = this.get("seriesCollection"),
            series,
            i = 0,
            len = sc ? sc.length : 0,
            hgl = this.get("horizontalGridlines"),
            vgl = this.get("verticalGridlines");
        if(this.get("showBackground"))
        {
            background = this.get("background");
            cb = this.get("contentBox");
            bg = this.get("styles").background;
            bg.stroke = bg.border;
            bg.stroke.opacity = bg.stroke.alpha;
            bg.fill.opacity = bg.fill.alpha;
            bg.width = this.get("width");
            bg.height = this.get("height");
            bg.type = bg.shape;
            background.set(bg);
        }
        for(; i < len; ++i)
        {
            series = sc[i];
            if(series instanceof Y.CartesianSeries)
            {
                series.render();
            }
        }
        if(hgl && hgl instanceof Y.Gridlines)
        {
            hgl.draw();
        }
        if(vgl && vgl instanceof Y.Gridlines)
        {
            vgl.draw();
        }
    },

    /**
     * Object of arrays containing series mapped to a series type.
     *
     * @property seriesTypes
     * @type Object
     * @private
     */
    seriesTypes: null,

    /**
     * Returns a series instance based on an index.
     *
     * @method getSeriesByIndex
     * @param {Number} val index of the series
     * @return CartesianSeries
     */
    getSeriesByIndex: function(val)
    {
        var col = this.get("seriesCollection"),
            series;
        if(col && col.length > val)
        {
            series = col[val];
        }
        return series;
    },

    /**
     * Returns a series instance based on a key value.
     *
     * @method getSeriesByKey
     * @param {String} val key value of the series
     * @return CartesianSeries
     */
    getSeriesByKey: function(val)
    {
        var obj = this._seriesDictionary,
            series;
        if(obj && obj.hasOwnProperty(val))
        {
            series = obj[val];
        }
        return series;
    },

    /**
     * Adds dispatcher to a `_dispatcher` used to
     * to ensure all series have redrawn before for firing event.
     *
     * @method addDispatcher
     * @param {CartesianSeries} val series instance to add
     * @protected
     */
    addDispatcher: function(val)
    {
        if(!this._dispatchers)
        {
            this._dispatchers = [];
        }
        this._dispatchers.push(val);
    },

    /**
     * Collection of series to be displayed in the graph.
     *
     * @property _seriesCollection
     * @type Array
     * @private
     */
    _seriesCollection: null,

    /**
     * Object containing key value pairs of `CartesianSeries` instances.
     *
     * @property _seriesDictionary
     * @type Object
     * @private
     */
    _seriesDictionary: null,

    /**
     * Parses series instances to be displayed in the graph.
     *
     * @method _parseSeriesCollection
     * @param {Array} Collection of `CartesianSeries` instances or objects container `CartesianSeries` attributes values.
     * @private
     */
    _parseSeriesCollection: function(val)
    {
        if(!val)
        {
            return;
        }
        var len = val.length,
            i = 0,
            series,
            seriesKey;
        this._seriesCollection = [];
        this._seriesDictionary = {};
        this.seriesTypes = [];
        for(; i < len; ++i)
        {
            series = val[i];
            if(!(series instanceof Y.CartesianSeries) && !(series instanceof Y.PieSeries))
            {
                this._createSeries(series);
                continue;
            }
            this._addSeries(series);
        }
        len = this._seriesCollection.length;
        for(i = 0; i < len; ++i)
        {
            series = this.get("seriesCollection")[i];
            seriesKey = series.get("direction") == "horizontal" ? "yKey" : "xKey";
            this._seriesDictionary[series.get(seriesKey)] = series;
        }
    },

    /**
     * Adds a series to the graph.
     *
     * @method _addSeries
     * @param {CartesianSeries} series Series to add to the graph.
     * @private
     */
    _addSeries: function(series)
    {
        var type = series.get("type"),
            seriesCollection = this.get("seriesCollection"),
            graphSeriesLength = seriesCollection.length,
            seriesTypes = this.seriesTypes,
            typeSeriesCollection;
        if(!series.get("graph"))
        {
            series.set("graph", this);
        }
        seriesCollection.push(series);
        if(!seriesTypes.hasOwnProperty(type))
        {
            this.seriesTypes[type] = [];
        }
        typeSeriesCollection = this.seriesTypes[type];
        series.set("graphOrder", graphSeriesLength);
        series.set("order", typeSeriesCollection.length);
        typeSeriesCollection.push(series);
        this.addDispatcher(series);
        series.after("drawingComplete", Y.bind(this._drawingCompleteHandler, this));
        this.fire("seriesAdded", series);
    },

    /**
     * Creates a `CartesianSeries` instance from an object containing attribute key value pairs. The key value pairs include
     * attributes for the specific series and a type value which defines the type of series to be used.
     *
     * @method createSeries
     * @param {Object} seriesData Series attribute key value pairs.
     * @private
     */
    _createSeries: function(seriesData)
    {
        var type = seriesData.type,
            seriesCollection = this.get("seriesCollection"),
            seriesTypes = this.seriesTypes,
            typeSeriesCollection,
            seriesType,
            series;
            seriesData.graph = this;
        if(!seriesTypes.hasOwnProperty(type))
        {
            seriesTypes[type] = [];
        }
        typeSeriesCollection = seriesTypes[type];
        seriesData.graph = this;
        seriesData.order = typeSeriesCollection.length;
        seriesData.graphOrder = seriesCollection.length;
        seriesType = this._getSeries(seriesData.type);
        series = new seriesType(seriesData);
        this.addDispatcher(series);
        series.after("drawingComplete", Y.bind(this._drawingCompleteHandler, this));
        typeSeriesCollection.push(series);
        seriesCollection.push(series);
        if(this.get("rendered"))
        {
            series.render();
        }
    },

    /**
     * String reference for pre-defined `Series` classes.
     *
     * @property _seriesMap
     * @type Object
     * @private
     */
    _seriesMap: {
        line : Y.LineSeries,
        column : Y.ColumnSeries,
        bar : Y.BarSeries,
        area :  Y.AreaSeries,
        candlestick : Y.CandlestickSeries,
        ohlc : Y.OHLCSeries,
        stackedarea : Y.StackedAreaSeries,
        stackedline : Y.StackedLineSeries,
        stackedcolumn : Y.StackedColumnSeries,
        stackedbar : Y.StackedBarSeries,
        markerseries : Y.MarkerSeries,
        spline : Y.SplineSeries,
        areaspline : Y.AreaSplineSeries,
        stackedspline : Y.StackedSplineSeries,
        stackedareaspline : Y.StackedAreaSplineSeries,
        stackedmarkerseries : Y.StackedMarkerSeries,
        pie : Y.PieSeries,
        combo : Y.ComboSeries,
        stackedcombo : Y.StackedComboSeries,
        combospline : Y.ComboSplineSeries,
        stackedcombospline : Y.StackedComboSplineSeries
    },

    /**
     * Returns a specific `CartesianSeries` class based on key value from a look up table of a direct reference to a
     * class. When specifying a key value, the following options are available:
     *
     *  <table>
     *      <tr><th>Key Value</th><th>Class</th></tr>
     *      <tr><td>line</td><td>Y.LineSeries</td></tr>
     *      <tr><td>column</td><td>Y.ColumnSeries</td></tr>
     *      <tr><td>bar</td><td>Y.BarSeries</td></tr>
     *      <tr><td>area</td><td>Y.AreaSeries</td></tr>
     *      <tr><td>stackedarea</td><td>Y.StackedAreaSeries</td></tr>
     *      <tr><td>stackedline</td><td>Y.StackedLineSeries</td></tr>
     *      <tr><td>stackedcolumn</td><td>Y.StackedColumnSeries</td></tr>
     *      <tr><td>stackedbar</td><td>Y.StackedBarSeries</td></tr>
     *      <tr><td>markerseries</td><td>Y.MarkerSeries</td></tr>
     *      <tr><td>spline</td><td>Y.SplineSeries</td></tr>
     *      <tr><td>areaspline</td><td>Y.AreaSplineSeries</td></tr>
     *      <tr><td>stackedspline</td><td>Y.StackedSplineSeries</td></tr>
     *      <tr><td>stackedareaspline</td><td>Y.StackedAreaSplineSeries</td></tr>
     *      <tr><td>stackedmarkerseries</td><td>Y.StackedMarkerSeries</td></tr>
     *      <tr><td>pie</td><td>Y.PieSeries</td></tr>
     *      <tr><td>combo</td><td>Y.ComboSeries</td></tr>
     *      <tr><td>stackedcombo</td><td>Y.StackedComboSeries</td></tr>
     *      <tr><td>combospline</td><td>Y.ComboSplineSeries</td></tr>
     *      <tr><td>stackedcombospline</td><td>Y.StackedComboSplineSeries</td></tr>
     *  </table>
     *
     * When referencing a class directly, you can specify any of the above classes or any custom class that extends
     * `CartesianSeries` or `PieSeries`.
     *
     * @method _getSeries
     * @param {String | Object} type Series type.
     * @return CartesianSeries
     * @private
     */
    _getSeries: function(type)
    {
        var seriesClass;
        if(Y_Lang.isString(type))
        {
            seriesClass = this._seriesMap[type];
        }
        else
        {
            seriesClass = type;
        }
        return seriesClass;
    },

    /**
     * Event handler for marker events.
     *
     * @method _markerEventHandler
     * @param {Object} e Event object.
     * @private
     */
    _markerEventHandler: function(e)
    {
        var type = e.type,
            markerNode = e.currentTarget,
            strArr = markerNode.getAttribute("id").split("_"),
            series = this.getSeriesByIndex(strArr[1]),
            index = strArr[2];
        series.updateMarkerState(type, index);
    },

    /**
     * Collection of `CartesianSeries` instances to be redrawn.
     *
     * @property _dispatchers
     * @type Array
     * @private
     */
    _dispatchers: null,

    /**
     * Updates the `Graph` styles.
     *
     * @method _updateStyles
     * @private
     */
    _updateStyles: function()
    {
        var styles = this.get("styles").background,
            border = styles.border;
            border.opacity = border.alpha;
            styles.stroke = border;
            styles.fill.opacity = styles.fill.alpha;
        this.get("background").set(styles);
        this._sizeChangeHandler();
    },

    /**
     * Event handler for size changes.
     *
     * @method _sizeChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _sizeChangeHandler: function(e)
    {
        var hgl = this.get("horizontalGridlines"),
            vgl = this.get("verticalGridlines"),
            w = this.get("width"),
            h = this.get("height"),
            bg = this.get("styles").background,
            weight,
            background;
        if(bg && bg.border)
        {
            weight = bg.border.weight || 0;
        }
        if(this.get("showBackground"))
        {
            background = this.get("background");
            if(w && h)
            {
                background.set("width", w);
                background.set("height", h);
            }
        }
        if(this._gridlines)
        {
            this._gridlines.clear();
        }
        if(hgl && hgl instanceof Y.Gridlines)
        {
            hgl.draw();
        }
        if(vgl && vgl instanceof Y.Gridlines)
        {
            vgl.draw();
        }
        this._drawSeries();
    },

    /**
     * Draws each series.
     *
     * @method _drawSeries
     * @private
     */
    _drawSeries: function()
    {
        if(this._drawing)
        {
            this._callLater = true;
            return;
        }
        var sc,
            i,
            len,
            graphic = this.get("graphic");
        graphic.set("autoDraw", false);
        this._callLater = false;
        this._drawing = true;
        sc = this.get("seriesCollection");
        i = 0;
        len = sc ? sc.length : 0;
        for(; i < len; ++i)
        {
            sc[i].draw();
            if((!sc[i].get("xcoords") || !sc[i].get("ycoords")) && !sc[i] instanceof Y.PieSeries)
            {
                this._callLater = true;
                break;
            }
        }
        this._drawing = false;
        if(this._callLater)
        {
            this._drawSeries();
        }
    },

    /**
     * Event handler for series drawingComplete event.
     *
     * @method _drawingCompleteHandler
     * @param {Object} e Event object.
     * @private
     */
    _drawingCompleteHandler: function(e)
    {
        var series = e.currentTarget,
            graphic,
            index = Y.Array.indexOf(this._dispatchers, series);
        if(index > -1)
        {
            this._dispatchers.splice(index, 1);
        }
        if(this._dispatchers.length < 1)
        {
            graphic = this.get("graphic");
            if(!graphic.get("autoDraw"))
            {
                graphic._redraw();
            }
            this.fire("chartRendered");
        }
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
        var defs = {
            background: {
                shape: "rect",
                fill:{
                    color:"#faf9f2"
                },
                border: {
                    color:"#dad8c9",
                    weight: 1
                }
            }
        };
        return defs;
    },

    /**
     * Destructor implementation Graph class. Removes all Graphic instances from the widget.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        if(this._graphic)
        {
            this._graphic.destroy();
            this._graphic = null;
        }
        if(this._background)
        {
            this._background.get("graphic").destroy();
            this._background = null;
        }
        if(this._gridlines)
        {
            this._gridlines.get("graphic").destroy();
            this._gridlines = null;
        }
    }
}, {
    ATTRS: {
        /**
         * The x-coordinate for the graph.
         *
         * @attribute x
         * @type Number
         * @protected
         */
        x: {
            setter: function(val)
            {
                this.get("boundingBox").setStyle("left", val + "px");
                return val;
            }
        },

        /**
         * The y-coordinate for the graph.
         *
         * @attribute y
         * @type Number
         * @protected
         */
        y: {
            setter: function(val)
            {
                this.get("boundingBox").setStyle("top", val + "px");
                return val;
            }
        },

        /**
         * Reference to the chart instance using the graph.
         *
         * @attribute chart
         * @type ChartBase
         * @readOnly
         */
        chart: {},

        /**
         * Collection of series. When setting the `seriesCollection` the array can contain a combination of either
         * `CartesianSeries` instances or object literals with properties that will define a series.
         *
         * @attribute seriesCollection
         * @type CartesianSeries
         */
        seriesCollection: {
            getter: function()
            {
                return this._seriesCollection;
            },

            setter: function(val)
            {
                this._parseSeriesCollection(val);
                return this._seriesCollection;
            }
        },

        /**
         * Indicates whether the `Graph` has a background.
         *
         * @attribute showBackground
         * @type Boolean
         * @default true
         */
        showBackground: {
            value: true
        },

        /**
         * Read-only hash lookup for all series on in the `Graph`.
         *
         * @attribute seriesDictionary
         * @type Object
         * @readOnly
         */
        seriesDictionary: {
            readOnly: true,

            getter: function()
            {
                return this._seriesDictionary;
            }
        },

        /**
         * Reference to the horizontal `Gridlines` instance.
         *
         * @attribute horizontalGridlines
         * @type Gridlines
         * @default null
         */
        horizontalGridlines: {
            value: null,

            setter: function(val)
            {
                var gl = this.get("horizontalGridlines");
                if(gl && gl instanceof Y.Gridlines)
                {
                    gl.remove();
                }
                if(val instanceof Y.Gridlines)
                {
                    gl = val;
                    val.set("graph", this);
                    return val;
                }
                else if(val && val.axis)
                {
                    gl = new Y.Gridlines({direction:"horizontal", axis:val.axis, graph:this, styles:val.styles});
                    return gl;
                }
            }
        },

        /**
         * Reference to the vertical `Gridlines` instance.
         *
         * @attribute verticalGridlines
         * @type Gridlines
         * @default null
         */
        verticalGridlines: {
            value: null,

            setter: function(val)
            {
                var gl = this.get("verticalGridlines");
                if(gl && gl instanceof Y.Gridlines)
                {
                    gl.remove();
                }
                if(val instanceof Y.Gridlines)
                {
                    gl = val;
                    val.set("graph", this);
                    return val;
                }
                else if(val && val.axis)
                {
                    gl = new Y.Gridlines({direction:"vertical", axis:val.axis, graph:this, styles:val.styles});
                    return gl;
                }
            }
        },

        /**
         * Reference to graphic instance used for the background.
         *
         * @attribute background
         * @type Graphic
         * @readOnly
         */
        background: {
            getter: function()
            {
                if(!this._background)
                {
                    this._backgroundGraphic = new Y.Graphic({render:this.get("contentBox")});
                    this._backgroundGraphic.get("node").style.zIndex = 0;
                    this._background = this._backgroundGraphic.addShape({type: "rect"});
                }
                return this._background;
            }
        },

        /**
         * Reference to graphic instance used for gridlines.
         *
         * @attribute gridlines
         * @type Graphic
         * @readOnly
         */
        gridlines: {
            readOnly: true,

            getter: function()
            {
                if(!this._gridlines)
                {
                    this._gridlinesGraphic = new Y.Graphic({render:this.get("contentBox")});
                    this._gridlinesGraphic.get("node").style.zIndex = 1;
                    this._gridlines = this._gridlinesGraphic.addShape({type: "path"});
                }
                return this._gridlines;
            }
        },

        /**
         * Reference to graphic instance used for series.
         *
         * @attribute graphic
         * @type Graphic
         * @readOnly
         */
        graphic: {
            readOnly: true,

            getter: function()
            {
                if(!this._graphic)
                {
                    this._graphic = new Y.Graphic({render:this.get("contentBox")});
                    this._graphic.get("node").style.zIndex = 2;
                    this._graphic.set("autoDraw", false);
                }
                return this._graphic;
            }
        },

        /**
         * Indicates whether or not markers for a series will be grouped and rendered in a single complex shape instance.
         *
         * @attribute groupMarkers
         * @type Boolean
         */
        groupMarkers: {
            value: false
        }

        /**
         * Style properties used for drawing a background. Below are the default values:
         *  <dl>
         *      <dt>background</dt><dd>An object containing the following values:
         *          <dl>
         *              <dt>fill</dt><dd>Defines the style properties for the fill. Contains the following values:
         *                  <dl>
         *                      <dt>color</dt><dd>Color of the fill. The default value is #faf9f2.</dd>
         *                      <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the background fill.
         *                      The default value is 1.</dd>
         *                  </dl>
         *              </dd>
         *              <dt>border</dt><dd>Defines the style properties for the border. Contains the following values:
         *                  <dl>
         *                      <dt>color</dt><dd>Color of the border. The default value is #dad8c9.</dd>
         *                      <dt>alpha</dt><dd>Number from 0 to 1 indicating the opacity of the background border.
         *                      The default value is 1.</dd>
         *                      <dt>weight</dt><dd>Number indicating the width of the border. The default value is 1.</dd>
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
/**
 * The ChartBase class is an abstract class used to create charts.
 *
 * @module charts
 * @submodule charts-base
 * @class ChartBase
 * @constructor
 */
function ChartBase() {}

ChartBase.ATTRS = {
    /**
     * Data used to generate the chart.
     *
     * @attribute dataProvider
     * @type Array
     */
    dataProvider: {
        lazyAdd: false,

        valueFn: function()
        {
            var defDataProvider = [];
            if(!this._seriesKeysExplicitlySet)
            {
                this._seriesKeys = this._buildSeriesKeys(defDataProvider);
            }
            return defDataProvider;
        },

        setter: function(val)
        {
            var dataProvider = this._setDataValues(val);
            if(!this._seriesKeysExplicitlySet)
            {
                this._seriesKeys = this._buildSeriesKeys(dataProvider);
            }
            return dataProvider;
        }
    },

    /**
     * A collection of keys that map to the series axes. If no keys are set,
     * they will be generated automatically depending on the data structure passed into
     * the chart.
     *
     * @attribute seriesKeys
     * @type Array
     */
    seriesKeys: {
        getter: function()
        {
            return this._seriesKeys;
        },

        setter: function(val)
        {
            this._seriesKeysExplicitlySet = true;
            this._seriesKeys = val;
            return val;
        }
    },

    /**
     * Sets the `aria-label` for the chart.
     *
     * @attribute ariaLabel
     * @type String
     */
    ariaLabel: {
        value: "Chart Application",

        setter: function(val)
        {
            var cb = this.get("contentBox");
            if(cb)
            {
                cb.setAttribute("aria-label", val);
            }
            return val;
        }
    },

    /**
     * Sets the aria description for the chart.
     *
     * @attribute ariaDescription
     * @type String
     */
    ariaDescription: {
        value: "Use the up and down keys to navigate between series. Use the left and right keys to navigate through items in a series.",

        setter: function(val)
        {
            if(this._description)
            {
                this._description.setContent("");
                this._description.appendChild(DOCUMENT.createTextNode(val));
            }
            return val;
        }
    },

    /**
     * Reference to the default tooltip available for the chart.
     * <p>Contains the following properties:</p>
     *  <dl>
     *      <dt>node</dt><dd>Reference to the actual dom node</dd>
     *      <dt>showEvent</dt><dd>Event that should trigger the tooltip</dd>
     *      <dt>hideEvent</dt><dd>Event that should trigger the removal of a tooltip (can be an event or an array of events)</dd>
     *      <dt>styles</dt><dd>A hash of style properties that will be applied to the tooltip node</dd>
     *      <dt>show</dt><dd>Indicates whether or not to show the tooltip</dd>
     *      <dt>markerEventHandler</dt><dd>Displays and hides tooltip based on marker events</dd>
     *      <dt>planarEventHandler</dt><dd>Displays and hides tooltip based on planar events</dd>
     *      <dt>markerLabelFunction</dt><dd>Reference to the function used to format a marker event triggered tooltip's text.
     *      The method contains the following arguments:
     *  <dl>
     *      <dt>categoryItem</dt><dd>An object containing the following:
     *  <dl>
     *      <dt>axis</dt><dd>The axis to which the category is bound.</dd>
     *      <dt>displayName</dt><dd>The display name set to the category (defaults to key if not provided).</dd>
     *      <dt>key</dt><dd>The key of the category.</dd>
     *      <dt>value</dt><dd>The value of the category.</dd>
     *  </dl>
     *  </dd>
     *  <dt>valueItem</dt><dd>An object containing the following:
     *      <dl>
     *          <dt>axis</dt><dd>The axis to which the item's series is bound.</dd>
     *          <dt>displayName</dt><dd>The display name of the series. (defaults to key if not provided)</dd>
     *          <dt>key</dt><dd>The key for the series.</dd>
     *          <dt>value</dt><dd>The value for the series item.</dd>
     *      </dl>
     *  </dd>
     *  <dt>itemIndex</dt><dd>The index of the item within the series.</dd>
     *  <dt>series</dt><dd> The `CartesianSeries` instance of the item.</dd>
     *  <dt>seriesIndex</dt><dd>The index of the series in the `seriesCollection`.</dd>
     *  </dl>
     *  The method returns an `HTMLElement` which is written into the DOM using `appendChild`. If you override this method and choose
     *  to return an html string, you will also need to override the tooltip's `setTextFunction` method to accept an html string.
     *  </dd>
     *  <dt>planarLabelFunction</dt><dd>Reference to the function used to format a planar event triggered tooltip's text
     *  <dl>
     *      <dt>categoryAxis</dt><dd> `CategoryAxis` Reference to the categoryAxis of the chart.
     *      <dt>valueItems</dt><dd>Array of objects for each series that has a data point in the coordinate plane of the event. Each
     *      object contains the following data:
     *  <dl>
     *      <dt>axis</dt><dd>The value axis of the series.</dd>
     *      <dt>key</dt><dd>The key for the series.</dd>
     *      <dt>value</dt><dd>The value for the series item.</dd>
     *      <dt>displayName</dt><dd>The display name of the series. (defaults to key if not provided)</dd>
     *  </dl>
     *  </dd>
     *      <dt>index</dt><dd>The index of the item within its series.</dd>
     *      <dt>seriesArray</dt><dd>Array of series instances for each value item.</dd>
     *      <dt>seriesIndex</dt><dd>The index of the series in the `seriesCollection`.</dd>
     *  </dl>
     *  </dd>
     *  </dl>
     *  The method returns an `HTMLElement` which is written into the DOM using `appendChild`. If you override this method and choose
     *  to return an html string, you will also need to override the tooltip's `setTextFunction` method to accept an html string.
     *  </dd>
     *  <dt>setTextFunction</dt><dd>Method that writes content returned from `planarLabelFunction` or `markerLabelFunction` into the
     *  the tooltip node. Has the following signature:
     *  <dl>
     *      <dt>label</dt><dd>The `HTMLElement` that the content is to be added.</dd>
     *      <dt>val</dt><dd>The content to be rendered into tooltip. This can be a `String` or `HTMLElement`. If an HTML string is used,
     *      it will be rendered as a string.</dd>
     *  </dl>
     *  </dd>
     *  </dl>
     * @attribute tooltip
     * @type Object
     */
    tooltip: {
        valueFn: "_getTooltip",

        setter: function(val)
        {
            return this._updateTooltip(val);
        }
    },

    /**
     * The key value used for the chart's category axis.
     *
     * @attribute categoryKey
     * @type String
     * @default category
     */
    categoryKey: {
        value: "category"
    },

    /**
     * Indicates the type of axis to use for the category axis.
     *
     *  <dl>
     *      <dt>category</dt><dd>Specifies a `CategoryAxis`.</dd>
     *      <dt>time</dt><dd>Specifies a `TimeAxis</dd>
     *  </dl>
     *
     * @attribute categoryType
     * @type String
     * @default category
     */
    categoryType:{
        value:"category"
    },

    /**
     * Indicates the the type of interactions that will fire events.
     *
     *  <dl>
     *      <dt>marker</dt><dd>Events will be broadcasted when the mouse interacts with individual markers.</dd>
     *      <dt>planar</dt><dd>Events will be broadcasted when the mouse intersects the plane of any markers on the chart.</dd>
     *      <dt>none</dt><dd>No events will be broadcasted.</dd>
     *  </dl>
     *
     * @attribute interactionType
     * @type String
     * @default marker
     */
    interactionType: {
        value: "marker"
    },

    /**
     * Reference to all the axes in the chart.
     *
     * @attribute axesCollection
     * @type Array
     */
    axesCollection: {},

    /**
     * Reference to graph instance.
     *
     * @attribute graph
     * @type Graph
     */
    graph: {
        valueFn: "_getGraph"
    },

    /**
     * Indicates whether or not markers for a series will be grouped and rendered in a single complex shape instance.
     *
     * @attribute groupMarkers
     * @type Boolean
     */
    groupMarkers: {
        value: false
    }
};

ChartBase.prototype = {
    /**
     * Handles groupMarkers change event.
     *
     * @method _groupMarkersChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _groupMarkersChangeHandler: function(e)
    {
        var graph = this.get("graph"),
            useGroupMarkers = e.newVal;
        if(graph)
        {
            graph.set("groupMarkers", useGroupMarkers);
        }
    },

    /**
     * Handler for itemRendered event.
     *
     * @method _itemRendered
     * @param {Object} e Event object.
     * @private
     */
    _itemRendered: function(e)
    {
        this._itemRenderQueue = this._itemRenderQueue.splice(1 + Y.Array.indexOf(this._itemRenderQueue, e.currentTarget), 1);
        if(this._itemRenderQueue.length < 1)
        {
            this._redraw();
        }
    },

    /**
     * Default value function for the `Graph` attribute.
     *
     * @method _getGraph
     * @return Graph
     * @private
     */
    _getGraph: function()
    {
        var graph = new Y.Graph({
            chart:this,
            groupMarkers: this.get("groupMarkers")
        });
        graph.after("chartRendered", Y.bind(function(e) {
            this.fire("chartRendered");
        }, this));
        return graph;
    },

    /**
     * Returns a series instance by index or key value.
     *
     * @method getSeries
     * @param val
     * @return CartesianSeries
     */
    getSeries: function(val)
    {
        var series = null,
            graph = this.get("graph");
        if(graph)
        {
            if(Y_Lang.isNumber(val))
            {
                series = graph.getSeriesByIndex(val);
            }
            else
            {
                series = graph.getSeriesByKey(val);
            }
        }
        return series;
    },

    /**
     * Returns an `Axis` instance by key reference. If the axis was explicitly set through the `axes` attribute,
     * the key will be the same as the key used in the `axes` object. For default axes, the key for
     * the category axis is the value of the `categoryKey` (`category`). For the value axis, the default
     * key is `values`.
     *
     * @method getAxisByKey
     * @param {String} val Key reference used to look up the axis.
     * @return Axis
     */
    getAxisByKey: function(val)
    {
        var axis,
            axes = this.get("axes");
        if(axes && axes.hasOwnProperty(val))
        {
            axis = axes[val];
        }
        return axis;
    },

    /**
     * Returns the category axis for the chart.
     *
     * @method getCategoryAxis
     * @return Axis
     */
    getCategoryAxis: function()
    {
        var axis,
            key = this.get("categoryKey"),
            axes = this.get("axes");
        if(axes.hasOwnProperty(key))
        {
            axis = axes[key];
        }
        return axis;
    },

    /**
     * Default direction of the chart.
     *
     * @property _direction
     * @type String
     * @default horizontal
     * @private
     */
    _direction: "horizontal",

    /**
     * Storage for the `dataProvider` attribute.
     *
     * @property _dataProvider
     * @type Array
     * @private
     */
    _dataProvider: null,

    /**
     * Setter method for `dataProvider` attribute.
     *
     * @method _setDataValues
     * @param {Array} val Array to be set as `dataProvider`.
     * @return Array
     * @private
     */
    _setDataValues: function(val)
    {
        if(Y_Lang.isArray(val[0]))
        {
            var hash,
                dp = [],
                cats = val[0],
                i = 0,
                l = cats.length,
                n,
                sl = val.length;
            for(; i < l; ++i)
            {
                hash = {category:cats[i]};
                for(n = 1; n < sl; ++n)
                {
                    hash["series" + n] = val[n][i];
                }
                dp[i] = hash;
            }
            return dp;
        }
        return val;
    },

    /**
     * Storage for `seriesCollection` attribute.
     *
     * @property _seriesCollection
     * @type Array
     * @private
     */
    _seriesCollection: null,

    /**
     * Setter method for `seriesCollection` attribute.
     *
     * @property _setSeriesCollection
     * @param {Array} val Array of either `CartesianSeries` instances or objects containing series attribute key value pairs.
     * @private
     */
    _setSeriesCollection: function(val)
    {
        this._seriesCollection = val;
    },
    /**
     * Helper method that returns the axis class that a key references.
     *
     * @method _getAxisClass
     * @param {String} t The type of axis.
     * @return Axis
     * @private
     */
    _getAxisClass: function(t)
    {
        return this._axisClass[t];
    },

    /**
     * Key value pairs of axis types.
     *
     * @property _axisClass
     * @type Object
     * @private
     */
    _axisClass: {
        stacked: Y.StackedAxis,
        numeric: Y.NumericAxis,
        category: Y.CategoryAxis,
        time: Y.TimeAxis
    },

    /**
     * Collection of axes.
     *
     * @property _axes
     * @type Array
     * @private
     */
    _axes: null,

    /**
     * @method initializer
     * @private
     */
    initializer: function()
    {
        this._itemRenderQueue = [];
        this._seriesIndex = -1;
        this._itemIndex = -1;
        this.after("dataProviderChange", this._dataProviderChangeHandler);
    },

    /**
     * @method renderUI
     * @private
     */
    renderUI: function()
    {
        var tt = this.get("tooltip"),
            bb = this.get("boundingBox"),
            cb = this.get("contentBox");
        //move the position = absolute logic to a class file
        bb.setStyle("position", "absolute");
        cb.setStyle("position", "absolute");
        this._addAxes();
        this._addSeries();
        if(tt && tt.show)
        {
            this._addTooltip();
        }
        this._setAriaElements(bb, cb);
    },

    /**
     * Creates an aria `live-region`, `aria-label` and `aria-describedby` for the Chart.
     *
     * @method _setAriaElements
     * @param {Node} cb Reference to the Chart's `contentBox` attribute.
     * @private
     */
    _setAriaElements: function(bb, cb)
    {
        var description = this._getAriaOffscreenNode(),
            id = this.get("id") + "_description",
            liveRegion = this._getAriaOffscreenNode();
        cb.set("tabIndex", 0);
        cb.set("role", "img");
        cb.setAttribute("aria-label", this.get("ariaLabel"));
        cb.setAttribute("aria-describedby", id);
        description.set("id", id);
        description.set("tabIndex", -1);
        description.appendChild(DOCUMENT.createTextNode(this.get("ariaDescription")));
        liveRegion.set("id", "live-region");
        liveRegion.set("aria-live", "polite");
        liveRegion.set("aria-atomic", "true");
        liveRegion.set("role", "status");
        bb.setAttribute("role", "application");
        bb.appendChild(description);
        bb.appendChild(liveRegion);
        this._description = description;
        this._liveRegion = liveRegion;
    },

    /**
     * Sets a node offscreen for use as aria-description or aria-live-regin.
     *
     * @method _setOffscreen
     * @return Node
     * @private
     */
    _getAriaOffscreenNode: function()
    {
        var node = Y.Node.create("<div></div>"),
            ie = Y.UA.ie,
            clipRect = (ie && ie < 8) ? "rect(1px 1px 1px 1px)" : "rect(1px, 1px, 1px, 1px)";
        node.setStyle("position", "absolute");
        node.setStyle("height", "1px");
        node.setStyle("width", "1px");
        node.setStyle("overflow", "hidden");
        node.setStyle("clip", clipRect);
        return node;
    },

    /**
     * @method syncUI
     * @private
     */
    syncUI: function()
    {
        this._redraw();
    },

    /**
     * @method bindUI
     * @private
     */
    bindUI: function()
    {
        this.after("tooltipChange", Y.bind(this._tooltipChangeHandler, this));
        this.after("widthChange", this._sizeChanged);
        this.after("heightChange", this._sizeChanged);
        this.after("groupMarkersChange", this._groupMarkersChangeHandler);
        var tt = this.get("tooltip"),
            hideEvent = "mouseout",
            showEvent = "mouseover",
            cb = this.get("contentBox"),
            interactionType = this.get("interactionType"),
            i = 0,
            len,
            markerClassName = "." + SERIES_MARKER,
            isTouch = ((WINDOW && ("ontouchstart" in WINDOW)) && !(Y.UA.chrome && Y.UA.chrome < 6));
        Y.on("keydown", Y.bind(function(e) {
            var key = e.keyCode,
                numKey = parseFloat(key),
                msg;
            if(numKey > 36 && numKey < 41)
            {
                e.halt();
                msg = this._getAriaMessage(numKey);
                this._liveRegion.setContent("");
                this._liveRegion.appendChild(DOCUMENT.createTextNode(msg));
            }
        }, this), this.get("contentBox"));
        if(interactionType == "marker")
        {
            //if touch capabilities, toggle tooltip on touchend. otherwise, the tooltip attribute's hideEvent/showEvent types.
            hideEvent = tt.hideEvent;
            showEvent = tt.showEvent;
            if(isTouch)
            {
                Y.delegate("touchend", Y.bind(this._markerEventDispatcher, this), cb, markerClassName);
                //hide active tooltip if the chart is touched
                Y.on("touchend", Y.bind(function(e) {
                    //only halt the event if it originated from the chart
                    if(cb.contains(e.target))
                    {
                        e.halt(true);
                    }
                    if(this._activeMarker)
                    {
                        this._activeMarker = null;
                        this.hideTooltip(e);
                    }
                }, this));
            }
            else
            {
                Y.delegate("mouseenter", Y.bind(this._markerEventDispatcher, this), cb, markerClassName);
                Y.delegate("mousedown", Y.bind(this._markerEventDispatcher, this), cb, markerClassName);
                Y.delegate("mouseup", Y.bind(this._markerEventDispatcher, this), cb, markerClassName);
                Y.delegate("mouseleave", Y.bind(this._markerEventDispatcher, this), cb, markerClassName);
                Y.delegate("click", Y.bind(this._markerEventDispatcher, this), cb, markerClassName);
                Y.delegate("mousemove", Y.bind(this._positionTooltip, this), cb, markerClassName);
            }
        }
        else if(interactionType == "planar")
        {
            if(isTouch)
            {
                this._overlay.on("touchend", Y.bind(this._planarEventDispatcher, this));
            }
            else
            {
                this._overlay.on("mousemove", Y.bind(this._planarEventDispatcher, this));
                this.on("mouseout", this.hideTooltip);
            }
        }
        if(tt)
        {
            this.on("markerEvent:touchend", Y.bind(function(e) {
                var marker = e.series.get("markers")[e.index];
                if(this._activeMarker && marker === this._activeMarker)
                {
                    this._activeMarker = null;
                    this.hideTooltip(e);
                }
                else
                {

                    this._activeMarker = marker;
                    tt.markerEventHandler.apply(this, [e]);
                }
            }, this));
            if(hideEvent && showEvent && hideEvent == showEvent)
            {
                this.on(interactionType + "Event:" + hideEvent, this.toggleTooltip);
            }
            else
            {
                if(showEvent)
                {
                    this.on(interactionType + "Event:" + showEvent, tt[interactionType + "EventHandler"]);
                }
                if(hideEvent)
                {
                    if(Y_Lang.isArray(hideEvent))
                    {
                        len = hideEvent.length;
                        for(; i < len; ++i)
                        {
                            this.on(interactionType + "Event:" + hideEvent[i], this.hideTooltip);
                        }
                    }
                    this.on(interactionType + "Event:" + hideEvent, this.hideTooltip);
                }
            }
        }
    },

    /**
     * Event handler for marker events.
     *
     * @method _markerEventDispatcher
     * @param {Object} e Event object.
     * @private
     */
    _markerEventDispatcher: function(e)
    {
        var type = e.type,
            cb = this.get("contentBox"),
            markerNode = e.currentTarget,
            strArr = markerNode.getAttribute("id").split("_"),
            index = strArr.pop(),
            seriesIndex = strArr.pop(),
            series = this.getSeries(parseInt(seriesIndex, 10)),
            items = this.getSeriesItems(series, index),
            isTouch = e && e.hasOwnProperty("changedTouches"),
            pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
            pageY = isTouch ? e.changedTouches[0].pageY : e.pageY,
            x = pageX - cb.getX(),
            y = pageY - cb.getY();
        if(type == "mouseenter")
        {
            type = "mouseover";
        }
        else if(type == "mouseleave")
        {
            type = "mouseout";
        }
        series.updateMarkerState(type, index);
        e.halt();
        /**
         * Broadcasts when `interactionType` is set to `marker` and a series marker has received a mouseover event.
         *
         *
         * @event markerEvent:mouseover
         * @preventable false
         * @param {EventFacade} e Event facade with the following additional
         *   properties:
         *  <dl>
         *      <dt>categoryItem</dt><dd>Hash containing information about the category `Axis`.</dd>
         *      <dt>valueItem</dt><dd>Hash containing information about the value `Axis`.</dd>
         *      <dt>node</dt><dd>The dom node of the marker.</dd>
         *      <dt>x</dt><dd>The x-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>y</dt><dd>The y-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>series</dt><dd>Reference to the series of the marker.</dd>
         *      <dt>index</dt><dd>Index of the marker in the series.</dd>
         *      <dt>seriesIndex</dt><dd>The `order` of the marker's series.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when `interactionType` is set to `marker` and a series marker has received a mouseout event.
         *
         * @event markerEvent:mouseout
         * @preventable false
         * @param {EventFacade} e Event facade with the following additional
         *   properties:
         *  <dl>
         *      <dt>categoryItem</dt><dd>Hash containing information about the category `Axis`.</dd>
         *      <dt>valueItem</dt><dd>Hash containing information about the value `Axis`.</dd>
         *      <dt>node</dt><dd>The dom node of the marker.</dd>
         *      <dt>x</dt><dd>The x-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>y</dt><dd>The y-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>series</dt><dd>Reference to the series of the marker.</dd>
         *      <dt>index</dt><dd>Index of the marker in the series.</dd>
         *      <dt>seriesIndex</dt><dd>The `order` of the marker's series.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when `interactionType` is set to `marker` and a series marker has received a mousedown event.
         *
         * @event markerEvent:mousedown
         * @preventable false
         * @param {EventFacade} e Event facade with the following additional
         *   properties:
         *  <dl>
         *      <dt>categoryItem</dt><dd>Hash containing information about the category `Axis`.</dd>
         *      <dt>valueItem</dt><dd>Hash containing information about the value `Axis`.</dd>
         *      <dt>node</dt><dd>The dom node of the marker.</dd>
         *      <dt>x</dt><dd>The x-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>y</dt><dd>The y-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>series</dt><dd>Reference to the series of the marker.</dd>
         *      <dt>index</dt><dd>Index of the marker in the series.</dd>
         *      <dt>seriesIndex</dt><dd>The `order` of the marker's series.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when `interactionType` is set to `marker` and a series marker has received a mouseup event.
         *
         * @event markerEvent:mouseup
         * @preventable false
         * @param {EventFacade} e Event facade with the following additional
         *   properties:
         *  <dl>
         *      <dt>categoryItem</dt><dd>Hash containing information about the category `Axis`.</dd>
         *      <dt>valueItem</dt><dd>Hash containing information about the value `Axis`.</dd>
         *      <dt>node</dt><dd>The dom node of the marker.</dd>
         *      <dt>x</dt><dd>The x-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>y</dt><dd>The y-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>series</dt><dd>Reference to the series of the marker.</dd>
         *      <dt>index</dt><dd>Index of the marker in the series.</dd>
         *      <dt>seriesIndex</dt><dd>The `order` of the marker's series.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when `interactionType` is set to `marker` and a series marker has received a click event.
         *
         * @event markerEvent:click
         * @preventable false
         * @param {EventFacade} e Event facade with the following additional
         *   properties:
         *  <dl>
         *      <dt>categoryItem</dt><dd>Hash containing information about the category `Axis`.</dd>
         *      <dt>valueItem</dt><dd>Hash containing information about the value `Axis`.</dd>
         *      <dt>node</dt><dd>The dom node of the marker.</dd>
         *      <dt>x</dt><dd>The x-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>y</dt><dd>The y-coordinate of the mouse in relation to the Chart.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>series</dt><dd>Reference to the series of the marker.</dd>
         *      <dt>index</dt><dd>Index of the marker in the series.</dd>
         *      <dt>seriesIndex</dt><dd>The `order` of the marker's series.</dd>
         *      <dt>originEvent</dt><dd>Underlying dom event.</dd>
         *  </dl>
         */
        this.fire("markerEvent:" + type, {
            originEvent: e,
            pageX:pageX,
            pageY:pageY,
            categoryItem:items.category,
            valueItem:items.value,
            node:markerNode,
            x:x,
            y:y,
            series:series,
            index:index,
            seriesIndex:seriesIndex
        });
    },

    /**
     * Event handler for dataProviderChange.
     *
     * @method _dataProviderChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _dataProviderChangeHandler: function(e)
    {
        var dataProvider = e.newVal,
            axes,
            i,
            axis;
        this._seriesIndex = -1;
        this._itemIndex = -1;
        if(this instanceof Y.CartesianChart)
        {
            this.set("axes", this.get("axes"));
            this.set("seriesCollection", this.get("seriesCollection"));
        }
        axes = this.get("axes");
        if(axes)
        {
            for(i in axes)
            {
                if(axes.hasOwnProperty(i))
                {
                    axis = axes[i];
                    if(axis instanceof Y.Axis)
                    {
                        if(axis.get("position") != "none")
                        {
                            this._addToAxesRenderQueue(axis);
                        }
                        axis.set("dataProvider", dataProvider);
                    }
                }
            }
        }
    },

    /**
     * Event listener for toggling the tooltip. If a tooltip is visible, hide it. If not, it
     * will create and show a tooltip based on the event object.
     *
     * @method toggleTooltip
     * @param {Object} e Event object.
     */
    toggleTooltip: function(e)
    {
        var tt = this.get("tooltip");
        if(tt.visible)
        {
            this.hideTooltip();
        }
        else
        {
            tt.markerEventHandler.apply(this, [e]);
        }
    },

    /**
     * Shows a tooltip
     *
     * @method _showTooltip
     * @param {String} msg Message to dispaly in the tooltip.
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @private
     */
    _showTooltip: function(msg, x, y)
    {
        var tt = this.get("tooltip"),
            node = tt.node;
        if(msg)
        {
            tt.visible = true;
            tt.setTextFunction(node, msg);
            node.setStyle("top", y + "px");
            node.setStyle("left", x + "px");
            node.setStyle("visibility", "visible");
        }
    },

    /**
     * Positions the tooltip
     *
     * @method _positionTooltip
     * @param {Object} e Event object.
     * @private
     */
    _positionTooltip: function(e)
    {
        var tt = this.get("tooltip"),
            node = tt.node,
            cb = this.get("contentBox"),
            x = (e.pageX + 10) - cb.getX(),
            y = (e.pageY + 10) - cb.getY();
        if(node)
        {
            node.setStyle("left", x + "px");
            node.setStyle("top", y + "px");
        }
    },

    /**
     * Hides the default tooltip
     *
     * @method hideTooltip
     */
    hideTooltip: function()
    {
        var tt = this.get("tooltip"),
            node = tt.node;
        tt.visible = false;
        node.set("innerHTML", "");
        node.setStyle("left", -10000);
        node.setStyle("top", -10000);
        node.setStyle("visibility", "hidden");
    },

    /**
     * Adds a tooltip to the dom.
     *
     * @method _addTooltip
     * @private
     */
    _addTooltip: function()
    {
        var tt = this.get("tooltip"),
            id = this.get("id") + "_tooltip",
            cb = this.get("contentBox"),
            oldNode = DOCUMENT.getElementById(id);
        if(oldNode)
        {
            cb.removeChild(oldNode);
        }
        tt.node.set("id", id);
        tt.node.setStyle("visibility", "hidden");
        cb.appendChild(tt.node);
    },

    /**
     * Updates the tooltip attribute.
     *
     * @method _updateTooltip
     * @param {Object} val Object containing properties for the tooltip.
     * @return Object
     * @private
     */
    _updateTooltip: function(val)
    {
        var tt = this.get("tooltip") || this._getTooltip(),
            i,
            styles,
            node,
            props = {
                markerLabelFunction:"markerLabelFunction",
                planarLabelFunction:"planarLabelFunction",
                setTextFunction:"setTextFunction",
                showEvent:"showEvent",
                hideEvent:"hideEvent",
                markerEventHandler:"markerEventHandler",
                planarEventHandler:"planarEventHandler",
                show:"show"
            };
        if(Y_Lang.isObject(val))
        {
            styles = val.styles;
            node = Y.one(val.node) || tt.node;
            if(styles)
            {
                for(i in styles)
                {
                    if(styles.hasOwnProperty(i))
                    {
                        node.setStyle(i, styles[i]);
                    }
                }
            }
            for(i in props)
            {
                if(val.hasOwnProperty(i))
                {
                    tt[i] = val[i];
                }
            }
            tt.node = node;
        }
        return tt;
    },

    /**
     * Default getter for `tooltip` attribute.
     *
     * @method _getTooltip
     * @return Object
     * @private
     */
    _getTooltip: function()
    {
        var node = DOCUMENT.createElement("div"),
            tooltipClass = _getClassName("chart-tooltip"),
            tt = {
                setTextFunction: this._setText,
                markerLabelFunction: this._tooltipLabelFunction,
                planarLabelFunction: this._planarLabelFunction,
                show: true,
                hideEvent: "mouseout",
                showEvent: "mouseover",
                markerEventHandler: function(e)
                {
                    var tt = this.get("tooltip"),
                    msg = tt.markerLabelFunction.apply(this, [e.categoryItem, e.valueItem, e.index, e.series, e.seriesIndex]);
                    this._showTooltip(msg, e.x + 10, e.y + 10);
                },
                planarEventHandler: function(e)
                {
                    var tt = this.get("tooltip"),
                        msg ,
                        categoryAxis = this.get("categoryAxis");
                    msg = tt.planarLabelFunction.apply(this, [categoryAxis, e.valueItem, e.index, e.items, e.seriesIndex]);
                    this._showTooltip(msg, e.x + 10, e.y + 10);
                }
            };
        node = Y.one(node);
        node.set("id", this.get("id") + "_tooltip");
        node.setStyle("fontSize", "85%");
        node.setStyle("opacity", "0.83");
        node.setStyle("position", "absolute");
        node.setStyle("paddingTop", "2px");
        node.setStyle("paddingRight", "5px");
        node.setStyle("paddingBottom", "4px");
        node.setStyle("paddingLeft", "2px");
        node.setStyle("backgroundColor", "#fff");
        node.setStyle("border", "1px solid #dbdccc");
        node.setStyle("pointerEvents", "none");
        node.setStyle("zIndex", 3);
        node.setStyle("whiteSpace", "noWrap");
        node.setStyle("visibility", "hidden");
        node.addClass(tooltipClass);
        tt.node = Y.one(node);
        return tt;
    },

    /**
     * Formats tooltip text when `interactionType` is `planar`.
     *
     * @method _planarLabelFunction
     * @param {Axis} categoryAxis Reference to the categoryAxis of the chart.
     * @param {Array} valueItems Array of objects for each series that has a data point in the coordinate plane of the event.
     * Each object contains the following data:
     *  <dl>
     *      <dt>axis</dt><dd>The value axis of the series.</dd>
     *      <dt>key</dt><dd>The key for the series.</dd>
     *      <dt>value</dt><dd>The value for the series item.</dd>
     *      <dt>displayName</dt><dd>The display name of the series. (defaults to key if not provided)</dd>
     *  </dl>
     *  @param {Number} index The index of the item within its series.
     *  @param {Array} seriesArray Array of series instances for each value item.
     *  @param {Number} seriesIndex The index of the series in the `seriesCollection`.
     *  @return {String | HTML}
     * @private
     */
    _planarLabelFunction: function(categoryAxis, valueItems, index, seriesArray, seriesIndex)
    {
        var msg = DOCUMENT.createElement("div"),
            valueItem,
            i = 0,
            len = seriesArray.length,
            axis,
            categoryValue,
            seriesValue,
            series;
        if(categoryAxis)
        {
            categoryValue = categoryAxis.get("labelFunction").apply(this, [categoryAxis.getKeyValueAt(this.get("categoryKey"), index), categoryAxis.get("labelFormat")]);
            if(!Y_Lang.isObject(categoryValue))
            {
                categoryValue = DOCUMENT.createTextNode(categoryValue);
            }
            msg.appendChild(categoryValue);
        }

        for(; i < len; ++i)
        {
            series = seriesArray[i];
            if(series.get("visible"))
            {
                valueItem = valueItems[i];
                axis = valueItem.axis;
                seriesValue =  axis.get("labelFunction").apply(this, [axis.getKeyValueAt(valueItem.key, index), axis.get("labelFormat")]);
                msg.appendChild(DOCUMENT.createElement("br"));
                msg.appendChild(DOCUMENT.createTextNode(valueItem.displayName));
                msg.appendChild(DOCUMENT.createTextNode(": "));
                if(!Y_Lang.isObject(seriesValue))
                {
                    seriesValue = DOCUMENT.createTextNode(seriesValue);
                }
                msg.appendChild(seriesValue);
            }
        }
        return msg;
    },

    /**
     * Formats tooltip text when `interactionType` is `marker`.
     *
     * @method _tooltipLabelFunction
     * @param {Object} categoryItem An object containing the following:
     *  <dl>
     *      <dt>axis</dt><dd>The axis to which the category is bound.</dd>
     *      <dt>displayName</dt><dd>The display name set to the category (defaults to key if not provided)</dd>
     *      <dt>key</dt><dd>The key of the category.</dd>
     *      <dt>value</dt><dd>The value of the category</dd>
     *  </dl>
     * @param {Object} valueItem An object containing the following:
     *  <dl>
     *      <dt>axis</dt><dd>The axis to which the item's series is bound.</dd>
     *      <dt>displayName</dt><dd>The display name of the series. (defaults to key if not provided)</dd>
     *      <dt>key</dt><dd>The key for the series.</dd>
     *      <dt>value</dt><dd>The value for the series item.</dd>
     *  </dl>
     * @param {Number} itemIndex The index of the item within the series.
     * @param {CartesianSeries} series The `CartesianSeries` instance of the item.
     * @param {Number} seriesIndex The index of the series in the `seriesCollection`.
     * @return {String | HTML}
     * @private
     */
    _tooltipLabelFunction: function(categoryItem, valueItem, itemIndex, series, seriesIndex)
    {
        var msg = DOCUMENT.createElement("div"),
            categoryValue = categoryItem.axis.get("labelFunction").apply(this, [categoryItem.value, categoryItem.axis.get("labelFormat")]),
            seriesValue = valueItem.axis.get("labelFunction").apply(this, [valueItem.value, valueItem.axis.get("labelFormat")]);
        msg.appendChild(DOCUMENT.createTextNode(categoryItem.displayName));
        msg.appendChild(DOCUMENT.createTextNode(": "));
        if(!Y_Lang.isObject(categoryValue))
        {
            categoryValue = DOCUMENT.createTextNode(categoryValue);
        }
        msg.appendChild(categoryValue);
        msg.appendChild(DOCUMENT.createElement("br"));
        msg.appendChild(DOCUMENT.createTextNode(valueItem.displayName));
        msg.appendChild(DOCUMENT.createTextNode(": "));
        if(!Y_Lang.isObject(seriesValue))
        {
            seriesValue = DOCUMENT.createTextNode(seriesValue);
        }
        msg.appendChild(seriesValue);
        return msg;
    },

    /**
     * Event handler for the tooltipChange.
     *
     * @method _tooltipChangeHandler
     * @param {Object} e Event object.
     * @private
     */
    _tooltipChangeHandler: function(e)
    {
        if(this.get("tooltip"))
        {
            var tt = this.get("tooltip"),
                node = tt.node,
                show = tt.show,
                cb = this.get("contentBox");
            if(node && show)
            {
                if(!cb.contains(node))
                {
                    this._addTooltip();
                }
            }
        }
    },

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
        textField.setContent("");
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
     * Returns all the keys contained in a  `dataProvider`.
     *
     * @method _getAllKeys
     * @param {Array} dp Collection of objects to be parsed.
     * @return Object
     */
    _getAllKeys: function(dp)
    {
        var i = 0,
            len = dp.length,
            item,
            key,
            keys = {};
        for(; i < len; ++i)
        {
            item = dp[i];
            for(key in item)
            {
                if(item.hasOwnProperty(key))
                {
                    keys[key] = true;
                }
            }
        }
        return keys;
    },

    /**
     * Constructs seriesKeys if not explicitly specified.
     *
     * @method _buildSeriesKeys
     * @param {Array} dataProvider The dataProvider for the chart.
     * @return Array
     * @private
     */
    _buildSeriesKeys: function(dataProvider)
    {
        var allKeys,
            catKey = this.get("categoryKey"),
            keys = [],
            i;
        if(this._seriesKeysExplicitlySet)
        {
            return this._seriesKeys;
        }
        allKeys = this._getAllKeys(dataProvider);
        for(i in allKeys)
        {
            if(allKeys.hasOwnProperty(i) && i != catKey)
            {
                keys.push(i);
            }
        }
        return keys;
    }
};
Y.ChartBase = ChartBase;
/**
 * The CartesianChart class creates a chart with horizontal and vertical axes.
 *
 * @module charts
 * @submodule charts-base
 * @class CartesianChart
 * @extends ChartBase
 * @constructor
 */
Y.CartesianChart = Y.Base.create("cartesianChart", Y.Widget, [Y.ChartBase], {
    /**
     * @method renderUI
     * @private
     */
    renderUI: function()
    {
        var bb = this.get("boundingBox"),
            cb = this.get("contentBox"),
            tt = this.get("tooltip"),
            overlay,
            overlayClass = _getClassName("overlay");
        //move the position = absolute logic to a class file
        bb.setStyle("position", "absolute");
        cb.setStyle("position", "absolute");
        this._addAxes();
        this._addGridlines();
        this._addSeries();
        if(tt && tt.show)
        {
            this._addTooltip();
        }
        //If there is a style definition. Force them to set.
        this.get("styles");
        if(this.get("interactionType") == "planar")
        {
            overlay = DOCUMENT.createElement("div");
            this.get("contentBox").appendChild(overlay);
            this._overlay = Y.one(overlay);
            this._overlay.set("id", this.get("id") + "_overlay");
            this._overlay.setStyle("position", "absolute");
            this._overlay.setStyle("background", "#fff");
            this._overlay.setStyle("opacity", 0);
            this._overlay.addClass(overlayClass);
            this._overlay.setStyle("zIndex", 4);
        }
        this._setAriaElements(bb, cb);
        this._redraw();
    },

    /**
     * When `interactionType` is set to `planar`, listens for mouse move events and fires `planarEvent:mouseover` or `planarEvent:mouseout`
     * depending on the position of the mouse in relation to data points on the `Chart`.
     *
     * @method _planarEventDispatcher
     * @param {Object} e Event object.
     * @private
     */
    _planarEventDispatcher: function(e)
    {
        var graph = this.get("graph"),
            bb = this.get("boundingBox"),
            cb = graph.get("contentBox"),
            isTouch = e && e.hasOwnProperty("changedTouches"),
            pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
            pageY = isTouch ? e.changedTouches[0].pageY : e.pageY,
            posX = pageX - bb.getX(),
            posY = pageY - bb.getY(),
            offset = {
                x: pageX - cb.getX(),
                y: pageY - cb.getY()
            },
            sc = graph.get("seriesCollection"),
            series,
            i = 0,
            index,
            oldIndex = this._selectedIndex,
            item,
            items = [],
            categoryItems = [],
            valueItems = [],
            direction = this.get("direction"),
            hasMarkers,
            catAxis,
            valAxis,
            coord,
            //data columns and area data could be created on a graph level
            markerPlane,
            len,
            coords;
        e.halt(true);
        if(direction == "horizontal")
        {
            catAxis = "x";
            valAxis = "y";
        }
        else
        {
            valAxis = "x";
            catAxis = "y";
        }
        coord = offset[catAxis];
        if(sc)
        {
            len = sc.length;
            while(i < len && !markerPlane)
            {
                if(sc[i])
                {
                    markerPlane = sc[i].get(catAxis + "MarkerPlane");
                }
                i++;
            }
        }
        if(markerPlane)
        {
            len = markerPlane.length;
            for(i = 0; i < len; ++i)
            {
                if(coord <= markerPlane[i].end && coord >= markerPlane[i].start)
                {
                    index = i;
                    break;
                }
            }
            len = sc.length;
            for(i = 0; i < len; ++i)
            {
                series = sc[i];
                coords = series.get(valAxis + "coords");
                hasMarkers = series.get("markers");
                if(hasMarkers && !isNaN(oldIndex) && oldIndex > -1)
                {
                    series.updateMarkerState("mouseout", oldIndex);
                }
                if(coords && coords[index] > -1)
                {
                    if(hasMarkers && !isNaN(index) && index > -1)
                    {
                        series.updateMarkerState("mouseover", index);
                    }
                    item = this.getSeriesItems(series, index);
                    categoryItems.push(item.category);
                    valueItems.push(item.value);
                    items.push(series);
                }

            }
            this._selectedIndex = index;

            /**
             * Broadcasts when `interactionType` is set to `planar` and a series' marker plane has received a mouseover event.
             *
             *
             * @event planarEvent:mouseover
             * @preventable false
             * @param {EventFacade} e Event facade with the following additional
             *   properties:
             *  <dl>
             *      <dt>categoryItem</dt><dd>An array of hashes, each containing information about the category `Axis` of each marker
             *      whose plane has been intersected.</dd>
             *      <dt>valueItem</dt><dd>An array of hashes, each containing information about the value `Axis` of each marker whose
             *      plane has been intersected.</dd>
             *      <dt>x</dt><dd>The x-coordinate of the mouse in relation to the Chart.</dd>
             *      <dt>y</dt><dd>The y-coordinate of the mouse in relation to the Chart.</dd>
             *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
             *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
             *      <dt>items</dt><dd>An array including all the series which contain a marker whose plane has been intersected.</dd>
             *      <dt>index</dt><dd>Index of the markers in their respective series.</dd>
             *      <dt>originEvent</dt><dd>Underlying dom event.</dd>
             *  </dl>
             */
            /**
             * Broadcasts when `interactionType` is set to `planar` and a series' marker plane has received a mouseout event.
             *
             * @event planarEvent:mouseout
             * @preventable false
             * @param {EventFacade} e
             */
            if(index > -1)
            {
                this.fire("planarEvent:mouseover", {
                    categoryItem:categoryItems,
                    valueItem:valueItems,
                    x:posX,
                    y:posY,
                    pageX:pageX,
                    pageY:pageY,
                    items:items,
                    index:index,
                    originEvent:e
                });
            }
            else
            {
                this.fire("planarEvent:mouseout");
            }
        }
    },

    /**
     * Indicates the default series type for the chart.
     *
     * @property _type
     * @type {String}
     * @private
     */
    _type: "combo",

    /**
     * Queue of axes instances that will be updated. This method is used internally to determine when all axes have been updated.
     *
     * @property _itemRenderQueue
     * @type Array
     * @private
     */
    _itemRenderQueue: null,

    /**
     * Adds an `Axis` instance to the `_itemRenderQueue`.
     *
     * @method _addToAxesRenderQueue
     * @param {Axis} axis An `Axis` instance.
     * @private
     */
    _addToAxesRenderQueue: function(axis)
    {
        if(!this._itemRenderQueue)
        {
            this._itemRenderQueue = [];
        }
        if(Y.Array.indexOf(this._itemRenderQueue, axis) < 0)
        {
            this._itemRenderQueue.push(axis);
        }
    },

    /**
     * Adds axis instance to the appropriate array based on position
     *
     * @method _addToAxesCollection
     * @param {String} position The position of the axis
     * @param {Axis} axis The `Axis` instance
     */
    _addToAxesCollection: function(position, axis)
    {
        var axesCollection = this.get(position + "AxesCollection");
        if(!axesCollection)
        {
            axesCollection = [];
            this.set(position + "AxesCollection", axesCollection);
        }
        axesCollection.push(axis);
    },

    /**
     * Returns the default value for the `seriesCollection` attribute.
     *
     * @method _getDefaultSeriesCollection
     * @param {Array} val Array containing either `CartesianSeries` instances or objects containing data to construct series instances.
     * @return Array
     * @private
     */
    _getDefaultSeriesCollection: function()
    {
        var seriesCollection,
            dataProvider = this.get("dataProvider");
        if(dataProvider)
        {
            seriesCollection = this._parseSeriesCollection();
        }
        return seriesCollection;
    },

    /**
     * Parses and returns a series collection from an object and default properties.
     *
     * @method _parseSeriesCollection
     * @param {Object} val Object contain properties for series being set.
     * @return Object
     * @private
     */
    _parseSeriesCollection: function(val)
    {
        var dir = this.get("direction"),
            sc = [],
            catAxis,
            valAxis,
            tempKeys = [],
            series,
            seriesKeys = this.get("seriesKeys").concat(),
            i,
            index,
            l,
            type = this.get("type"),
            key,
            catKey,
            seriesKey,
            graph,
            orphans = [],
            categoryKey = this.get("categoryKey"),
            showMarkers = this.get("showMarkers"),
            showAreaFill = this.get("showAreaFill"),
            showLines = this.get("showLines");
        val = val || [];
        if(dir == "vertical")
        {
            catAxis = "yAxis";
            catKey = "yKey";
            valAxis = "xAxis";
            seriesKey = "xKey";
        }
        else
        {
            catAxis = "xAxis";
            catKey = "xKey";
            valAxis = "yAxis";
            seriesKey = "yKey";
        }
        l = val.length;
        while(val && val.length > 0)
        {
            series = val.shift();
            key = this._getBaseAttribute(series, seriesKey);
            if(key)
            {
                index = Y.Array.indexOf(seriesKeys, key);
                if(index > -1)
                {
                    seriesKeys.splice(index, 1);
                    tempKeys.push(key);
                    sc.push(series);
                }
                else
                {
                    orphans.push(series);
                }
            }
            else
            {
                orphans.push(series);
            }
        }
        while(orphans.length > 0)
        {
            series = orphans.shift();
            if(seriesKeys.length > 0)
            {
                key = seriesKeys.shift();
                this._setBaseAttribute(series, seriesKey, key);
                tempKeys.push(key);
                sc.push(series);
            }
            else if(series instanceof Y.CartesianSeries)
            {
                series.destroy(true);
            }
        }
        if(seriesKeys.length > 0)
        {
            tempKeys = tempKeys.concat(seriesKeys);
        }
        l = tempKeys.length;
        for(i = 0; i < l; ++i)
        {
            series = sc[i] || {type:type};
            if(series instanceof Y.CartesianSeries)
            {
                this._parseSeriesAxes(series);
                continue;
            }

            series[catKey] = series[catKey] || categoryKey;
            series[seriesKey] = series[seriesKey] || seriesKeys.shift();
            series[catAxis] = this._getCategoryAxis();
            series[valAxis] = this._getSeriesAxis(series[seriesKey]);

            series.type = series.type || type;
            series.direction = series.direction || dir;

            if((series.type == "combo" || series.type == "stackedcombo" || series.type == "combospline" || series.type == "stackedcombospline"))
            {
                if(showAreaFill !== null)
                {
                    series.showAreaFill = (series.showAreaFill !== null && series.showAreaFill !== undefined) ? series.showAreaFill : showAreaFill;
                }
                if(showMarkers !== null)
                {
                    series.showMarkers = (series.showMarkers !== null && series.showMarkers !== undefined) ? series.showMarkers : showMarkers;
                }
                if(showLines !== null)
                {
                    series.showLines = (series.showLines !== null && series.showLines !== undefined) ? series.showLines : showLines;
                }
            }
            sc[i] = series;
        }
        if(sc)
        {
            graph = this.get("graph");
            graph.set("seriesCollection", sc);
            sc = graph.get("seriesCollection");
        }
        return sc;
    },

    /**
     * Parse and sets the axes for a series instance.
     *
     * @method _parseSeriesAxes
     * @param {CartesianSeries} series A `CartesianSeries` instance.
     * @private
     */
    _parseSeriesAxes: function(series)
    {
        var axes = this.get("axes"),
            xAxis = series.get("xAxis"),
            yAxis = series.get("yAxis"),
            YAxis = Y.Axis,
            axis;
        if(xAxis && !(xAxis instanceof YAxis) && Y_Lang.isString(xAxis) && axes.hasOwnProperty(xAxis))
        {
            axis = axes[xAxis];
            if(axis instanceof YAxis)
            {
                series.set("xAxis", axis);
            }
        }
        if(yAxis && !(yAxis instanceof YAxis) && Y_Lang.isString(yAxis) && axes.hasOwnProperty(yAxis))
        {
            axis = axes[yAxis];
            if(axis instanceof YAxis)
            {
                series.set("yAxis", axis);
            }
        }

    },

    /**
     * Returns the category axis instance for the chart.
     *
     * @method _getCategoryAxis
     * @return Axis
     * @private
     */
    _getCategoryAxis: function()
    {
        var axis,
            axes = this.get("axes"),
            categoryAxisName = this.get("categoryAxisName") || this.get("categoryKey");
        axis = axes[categoryAxisName];
        return axis;
    },

    /**
     * Returns the value axis for a series.
     *
     * @method _getSeriesAxis
     * @param {String} key The key value used to determine the axis instance.
     * @return Axis
     * @private
     */
    _getSeriesAxis:function(key, axisName)
    {
        var axes = this.get("axes"),
            i,
            keys,
            axis;
        if(axes)
        {
            if(axisName && axes.hasOwnProperty(axisName))
            {
                axis = axes[axisName];
            }
            else
            {
                for(i in axes)
                {
                    if(axes.hasOwnProperty(i))
                    {
                        keys = axes[i].get("keys");
                        if(keys && keys.hasOwnProperty(key))
                        {
                            axis = axes[i];
                            break;
                        }
                    }
                }
            }
        }
        return axis;
    },

    /**
     * Gets an attribute from an object, using a getter for Base objects and a property for object
     * literals. Used for determining attributes from series/axis references which can be an actual class instance
     * or a hash of properties that will be used to create a class instance.
     *
     * @method _getBaseAttribute
     * @param {Object} item Object or instance in which the attribute resides.
     * @param {String} key Attribute whose value will be returned.
     * @return Object
     * @private
     */
    _getBaseAttribute: function(item, key)
    {
        if(item instanceof Y.Base)
        {
            return item.get(key);
        }
        if(item.hasOwnProperty(key))
        {
            return item[key];
        }
        return null;
    },

    /**
     * Sets an attribute on an object, using a setter of Base objects and a property for object
     * literals. Used for setting attributes on a Base class, either directly or to be stored in an object literal
     * for use at instantiation.
     *
     * @method _setBaseAttribute
     * @param {Object} item Object or instance in which the attribute resides.
     * @param {String} key Attribute whose value will be assigned.
     * @param {Object} value Value to be assigned to the attribute.
     * @private
     */
    _setBaseAttribute: function(item, key, value)
    {
        if(item instanceof Y.Base)
        {
            item.set(key, value);
        }
        else
        {
            item[key] = value;
        }
    },

    /**
     * Creates `Axis` instances.
     *
     * @method _setAxes
     * @param {Object} val Object containing `Axis` instances or objects in which to construct `Axis` instances.
     * @return Object
     * @private
     */
    _setAxes: function(val)
    {
        var hash = this._parseAxes(val),
            axes = {},
            axesAttrs = {
                edgeOffset: "edgeOffset",
                position: "position",
                overlapGraph:"overlapGraph",
                labelFunction:"labelFunction",
                labelFunctionScope:"labelFunctionScope",
                labelFormat:"labelFormat",
                appendLabelFunction: "appendLabelFunction",
                appendTitleFunction: "appendTitleFunction",
                maximum:"maximum",
                minimum:"minimum",
                roundingMethod:"roundingMethod",
                alwaysShowZero:"alwaysShowZero",
                title:"title",
                width:"width",
                height:"height"
            },
            dp = this.get("dataProvider"),
            ai,
            i,
            pos,
            axis,
            axisPosition,
            dh,
            axisClass,
            config,
            axesCollection;
        for(i in hash)
        {
            if(hash.hasOwnProperty(i))
            {
                dh = hash[i];
                if(dh instanceof Y.Axis)
                {
                    axis = dh;
                }
                else
                {
                    axis = null;
                    config = {};
                    config.dataProvider = dh.dataProvider || dp;
                    config.keys = dh.keys;

                    if(dh.hasOwnProperty("roundingUnit"))
                    {
                        config.roundingUnit = dh.roundingUnit;
                    }
                    pos = dh.position;
                    if(dh.styles)
                    {
                        config.styles = dh.styles;
                    }
                    config.position = dh.position;
                    for(ai in axesAttrs)
                    {
                        if(axesAttrs.hasOwnProperty(ai) && dh.hasOwnProperty(ai))
                        {
                            config[ai] = dh[ai];
                        }
                    }

                    //only check for existing axis if we constructed the default axes already
                    if(val)
                    {
                        axis = this.getAxisByKey(i);
                    }

                    if(axis && axis instanceof Y.Axis)
                    {
                        axisPosition = axis.get("position");
                        if(pos != axisPosition)
                        {
                            if(axisPosition != "none")
                            {
                                axesCollection = this.get(axisPosition + "AxesCollection");
                                axesCollection.splice(Y.Array.indexOf(axesCollection, axis), 1);
                            }
                            if(pos != "none")
                            {
                                this._addToAxesCollection(pos, axis);
                            }
                        }
                        axis.setAttrs(config);
                    }
                    else
                    {
                        axisClass = this._getAxisClass(dh.type);
                        axis = new axisClass(config);
                        axis.after("axisRendered", Y.bind(this._itemRendered, this));
                    }
                }

                if(axis)
                {
                    axesCollection = this.get(pos + "AxesCollection");
                    if(axesCollection && Y.Array.indexOf(axesCollection, axis) > 0)
                    {
                        axis.set("overlapGraph", false);
                    }
                    axes[i] = axis;
                }
            }
        }
        return axes;
    },

    /**
     * Adds axes to the chart.
     *
     * @method _addAxes
     * @private
     */
    _addAxes: function()
    {
        var axes = this.get("axes"),
            i,
            axis,
            pos,
            w = this.get("width"),
            h = this.get("height"),
            node = Y.Node.one(this._parentNode);
        if(!this._axesCollection)
        {
            this._axesCollection = [];
        }
        for(i in axes)
        {
            if(axes.hasOwnProperty(i))
            {
                axis = axes[i];
                if(axis instanceof Y.Axis)
                {
                    if(!w)
                    {
                        this.set("width", node.get("offsetWidth"));
                        w = this.get("width");
                    }
                    if(!h)
                    {
                        this.set("height", node.get("offsetHeight"));
                        h = this.get("height");
                    }
                    this._addToAxesRenderQueue(axis);
                    pos = axis.get("position");
                    if(!this.get(pos + "AxesCollection"))
                    {
                        this.set(pos + "AxesCollection", [axis]);
                    }
                    else
                    {
                        this.get(pos + "AxesCollection").push(axis);
                    }
                    this._axesCollection.push(axis);
                    if(axis.get("keys").hasOwnProperty(this.get("categoryKey")))
                    {
                        this.set("categoryAxis", axis);
                    }
                    axis.render(this.get("contentBox"));
                }
            }
        }
    },

    /**
     * Renders the Graph.
     *
     * @method _addSeries
     * @private
     */
    _addSeries: function()
    {
        var graph = this.get("graph"),
            sc = this.get("seriesCollection");
        graph.render(this.get("contentBox"));

    },

    /**
     * Adds gridlines to the chart.
     *
     * @method _addGridlines
     * @private
     */
    _addGridlines: function()
    {
        var graph = this.get("graph"),
            hgl = this.get("horizontalGridlines"),
            vgl = this.get("verticalGridlines"),
            direction = this.get("direction"),
            leftAxesCollection = this.get("leftAxesCollection"),
            rightAxesCollection = this.get("rightAxesCollection"),
            bottomAxesCollection = this.get("bottomAxesCollection"),
            topAxesCollection = this.get("topAxesCollection"),
            seriesAxesCollection,
            catAxis = this.get("categoryAxis"),
            hAxis,
            vAxis;
        if(this._axesCollection)
        {
            seriesAxesCollection = this._axesCollection.concat();
            seriesAxesCollection.splice(Y.Array.indexOf(seriesAxesCollection, catAxis), 1);
        }
        if(hgl)
        {
            if(leftAxesCollection && leftAxesCollection[0])
            {
                hAxis = leftAxesCollection[0];
            }
            else if(rightAxesCollection && rightAxesCollection[0])
            {
                hAxis = rightAxesCollection[0];
            }
            else
            {
                hAxis = direction == "horizontal" ? catAxis : seriesAxesCollection[0];
            }
            if(!this._getBaseAttribute(hgl, "axis") && hAxis)
            {
                this._setBaseAttribute(hgl, "axis", hAxis);
            }
            if(this._getBaseAttribute(hgl, "axis"))
            {
                graph.set("horizontalGridlines", hgl);
            }
        }
        if(vgl)
        {
            if(bottomAxesCollection && bottomAxesCollection[0])
            {
                vAxis = bottomAxesCollection[0];
            }
            else if (topAxesCollection && topAxesCollection[0])
            {
                vAxis = topAxesCollection[0];
            }
            else
            {
                vAxis = direction == "vertical" ? catAxis : seriesAxesCollection[0];
            }
            if(!this._getBaseAttribute(vgl, "axis") && vAxis)
            {
                this._setBaseAttribute(vgl, "axis", vAxis);
            }
            if(this._getBaseAttribute(vgl, "axis"))
            {
                graph.set("verticalGridlines", vgl);
            }
        }
    },

    /**
     * Default Function for the axes attribute.
     *
     * @method _getDefaultAxes
     * @return Object
     * @private
     */
    _getDefaultAxes: function()
    {
        var axes;
        if(this.get("dataProvider"))
        {
            axes = this._parseAxes();
        }
        return axes;
    },

    /**
     * Generates and returns a key-indexed object containing `Axis` instances or objects used to create `Axis` instances.
     *
     * @method _parseAxes
     * @param {Object} axes Object containing `Axis` instances or `Axis` attributes.
     * @return Object
     * @private
     */
    _parseAxes: function(axes)
    {
        var catKey = this.get("categoryKey"),
            axis,
            attr,
            keys,
            newAxes = {},
            claimedKeys = [],
            categoryAxisName = this.get("categoryAxisName") || this.get("categoryKey"),
            valueAxisName = this.get("valueAxisName"),
            seriesKeys = this.get("seriesKeys").concat(),
            i,
            l,
            ii,
            ll,
            cIndex,
            direction = this.get("direction"),
            seriesPosition,
            categoryPosition,
            valueAxes = [],
            seriesAxis = this.get("stacked") ? "stacked" : "numeric";
        if(direction == "vertical")
        {
            seriesPosition = "bottom";
            categoryPosition = "left";
        }
        else
        {
            seriesPosition = "left";
            categoryPosition = "bottom";
        }
        if(axes)
        {
            for(i in axes)
            {
                if(axes.hasOwnProperty(i))
                {
                    axis = axes[i];
                    keys = this._getBaseAttribute(axis, "keys");
                    attr = this._getBaseAttribute(axis, "type");
                    if(attr == "time" || attr == "category")
                    {
                        categoryAxisName = i;
                        this.set("categoryAxisName", i);
                        if(Y_Lang.isArray(keys) && keys.length > 0)
                        {
                            catKey = keys[0];
                            this.set("categoryKey", catKey);
                        }
                        newAxes[i] = axis;
                    }
                    else if(i == categoryAxisName)
                    {
                        newAxes[i] = axis;
                    }
                    else
                    {
                        newAxes[i] = axis;
                        if(i != valueAxisName && keys && Y_Lang.isArray(keys))
                        {
                            ll = keys.length;
                            for(ii = 0; ii < ll; ++ii)
                            {
                                claimedKeys.push(keys[ii]);
                            }
                            valueAxes.push(newAxes[i]);
                        }
                        if(!(this._getBaseAttribute(newAxes[i], "type")))
                        {
                            this._setBaseAttribute(newAxes[i], "type", seriesAxis);
                        }
                        if(!(this._getBaseAttribute(newAxes[i], "position")))
                        {
                            this._setBaseAttribute(newAxes[i], "position", this._getDefaultAxisPosition(newAxes[i], valueAxes, seriesPosition));
                        }
                    }
                }
            }
        }
        cIndex = Y.Array.indexOf(seriesKeys, catKey);
        if(cIndex > -1)
        {
            seriesKeys.splice(cIndex, 1);
        }
        l = claimedKeys.length;
        for(i = 0; i < l; ++i)
        {
            cIndex = Y.Array.indexOf(seriesKeys, claimedKeys[i]);
            if(cIndex > -1)
            {
                seriesKeys.splice(cIndex, 1);
            }
        }
        if(!newAxes.hasOwnProperty(categoryAxisName))
        {
            newAxes[categoryAxisName] = {};
        }
        if(!(this._getBaseAttribute(newAxes[categoryAxisName], "keys")))
        {
            this._setBaseAttribute(newAxes[categoryAxisName], "keys", [catKey]);
        }

        if(!(this._getBaseAttribute(newAxes[categoryAxisName], "position")))
        {
            this._setBaseAttribute(newAxes[categoryAxisName], "position", categoryPosition);
        }

        if(!(this._getBaseAttribute(newAxes[categoryAxisName], "type")))
        {
            this._setBaseAttribute(newAxes[categoryAxisName], "type", this.get("categoryType"));
        }
        if(!newAxes.hasOwnProperty(valueAxisName) && seriesKeys && seriesKeys.length > 0)
        {
            newAxes[valueAxisName] = {keys:seriesKeys};
            valueAxes.push(newAxes[valueAxisName]);
        }
        if(claimedKeys.length > 0)
        {
            if(seriesKeys.length > 0)
            {
                seriesKeys = claimedKeys.concat(seriesKeys);
            }
            else
            {
                seriesKeys = claimedKeys;
            }
        }
        if(newAxes.hasOwnProperty(valueAxisName))
        {
            if(!(this._getBaseAttribute(newAxes[valueAxisName], "position")))
            {
                this._setBaseAttribute(newAxes[valueAxisName], "position", this._getDefaultAxisPosition(newAxes[valueAxisName], valueAxes, seriesPosition));
            }
            this._setBaseAttribute(newAxes[valueAxisName], "type", seriesAxis);
            this._setBaseAttribute(newAxes[valueAxisName], "keys", seriesKeys);
        }
        if(!this._seriesKeysExplicitlySet)
        {
            this._seriesKeys = seriesKeys;
        }
        return newAxes;
    },

    /**
     * Determines the position of an axis when one is not specified.
     *
     * @method _getDefaultAxisPosition
     * @param {Axis} axis `Axis` instance.
     * @param {Array} valueAxes Array of `Axis` instances.
     * @param {String} position Default position depending on the direction of the chart and type of axis.
     * @return String
     * @private
     */
    _getDefaultAxisPosition: function(axis, valueAxes, position)
    {
        var direction = this.get("direction"),
            i = Y.Array.indexOf(valueAxes, axis);

        if(valueAxes[i - 1] && valueAxes[i - 1].position)
        {
            if(direction == "horizontal")
            {
                if(valueAxes[i - 1].position == "left")
                {
                    position = "right";
                }
                else if(valueAxes[i - 1].position == "right")
                {
                    position = "left";
                }
            }
            else
            {
                if (valueAxes[i -1].position == "bottom")
                {
                    position = "top";
                }
                else
                {
                    position = "bottom";
                }
            }
        }
        return position;
    },


    /**
     * Returns an object literal containing a categoryItem and a valueItem for a given series index. Below is the structure of each:
     *
     * @method getSeriesItems
     * @param {CartesianSeries} series Reference to a series.
     * @param {Number} index Index of the specified item within a series.
     * @return Object An object literal containing the following:
     *
     *  <dl>
     *      <dt>categoryItem</dt><dd>Object containing the following data related to the category axis of the series.
     *  <dl>
     *      <dt>axis</dt><dd>Reference to the category axis of the series.</dd>
     *      <dt>key</dt><dd>Category key for the series.</dd>
     *      <dt>value</dt><dd>Value on the axis corresponding to the series index.</dd>
     *  </dl>
     *      </dd>
     *      <dt>valueItem</dt><dd>Object containing the following data related to the category axis of the series.
     *  <dl>
     *      <dt>axis</dt><dd>Reference to the value axis of the series.</dd>
     *      <dt>key</dt><dd>Value key for the series.</dd>
     *      <dt>value</dt><dd>Value on the axis corresponding to the series index.</dd>
     *  </dl>
     *      </dd>
     *  </dl>
     */
    getSeriesItems: function(series, index)
    {
        var xAxis = series.get("xAxis"),
            yAxis = series.get("yAxis"),
            xKey = series.get("xKey"),
            yKey = series.get("yKey"),
            categoryItem,
            valueItem;
        if(this.get("direction") == "vertical")
        {
            categoryItem = {
                axis:yAxis,
                key:yKey,
                value:yAxis.getKeyValueAt(yKey, index)
            };
            valueItem = {
                axis:xAxis,
                key:xKey,
                value: xAxis.getKeyValueAt(xKey, index)
            };
        }
        else
        {
            valueItem = {
                axis:yAxis,
                key:yKey,
                value:yAxis.getKeyValueAt(yKey, index)
            };
            categoryItem = {
                axis:xAxis,
                key:xKey,
                value: xAxis.getKeyValueAt(xKey, index)
            };
        }
        categoryItem.displayName = series.get("categoryDisplayName");
        valueItem.displayName = series.get("valueDisplayName");
        categoryItem.value = categoryItem.axis.getKeyValueAt(categoryItem.key, index);
        valueItem.value = valueItem.axis.getKeyValueAt(valueItem.key, index);
        return {category:categoryItem, value:valueItem};
    },

    /**
     * Handler for sizeChanged event.
     *
     * @method _sizeChanged
     * @param {Object} e Event object.
     * @private
     */
    _sizeChanged: function(e)
    {
        if(this._axesCollection)
        {
            var ac = this._axesCollection,
                i = 0,
                l = ac.length;
            for(; i < l; ++i)
            {
                this._addToAxesRenderQueue(ac[i]);
            }
            this._redraw();
        }
    },

    /**
     * Returns the maximum distance in pixels that the extends outside the top bounds of all vertical axes.
     *
     * @method _getTopOverflow
     * @param {Array} set1 Collection of axes to check.
     * @param {Array} set2 Seconf collection of axes to check.
     * @param {Number} width Width of the axes
     * @return Number
     * @private
     */
    _getTopOverflow: function(set1, set2, height)
    {
        var i = 0,
            len,
            overflow = 0,
            axis;
        if(set1)
        {
            len = set1.length;
            for(; i < len; ++i)
            {
                axis = set1[i];
                overflow = Math.max(overflow, Math.abs(axis.getMaxLabelBounds().top) - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, height) * 0.5));
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(overflow, Math.abs(axis.getMaxLabelBounds().top) - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, height) * 0.5));
            }
        }
        return overflow;
    },

    /**
     * Returns the maximum distance in pixels that the extends outside the right bounds of all horizontal axes.
     *
     * @method _getRightOverflow
     * @param {Array} set1 Collection of axes to check.
     * @param {Array} set2 Seconf collection of axes to check.
     * @param {Number} width Width of the axes
     * @return Number
     * @private
     */
    _getRightOverflow: function(set1, set2, width)
    {
        var i = 0,
            len,
            overflow = 0,
            axis;
        if(set1)
        {
            len = set1.length;
            for(; i < len; ++i)
            {
                axis = set1[i];
                overflow = Math.max(overflow, axis.getMaxLabelBounds().right - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, width) * 0.5));
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(overflow, axis.getMaxLabelBounds().right - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, width) * 0.5));
            }
        }
        return overflow;
    },

    /**
     * Returns the maximum distance in pixels that the extends outside the left bounds of all horizontal axes.
     *
     * @method _getLeftOverflow
     * @param {Array} set1 Collection of axes to check.
     * @param {Array} set2 Seconf collection of axes to check.
     * @param {Number} width Width of the axes
     * @return Number
     * @private
     */
    _getLeftOverflow: function(set1, set2, width)
    {
        var i = 0,
            len,
            overflow = 0,
            axis;
        if(set1)
        {
            len = set1.length;
            for(; i < len; ++i)
            {
                axis = set1[i];
                overflow = Math.max(overflow, Math.abs(axis.getMinLabelBounds().left) - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, width) * 0.5));
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(overflow, Math.abs(axis.getMinLabelBounds().left) - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, width) * 0.5));
            }
        }
        return overflow;
    },

    /**
     * Returns the maximum distance in pixels that the extends outside the bottom bounds of all vertical axes.
     *
     * @method _getBottomOverflow
     * @param {Array} set1 Collection of axes to check.
     * @param {Array} set2 Seconf collection of axes to check.
     * @param {Number} height Height of the axes
     * @return Number
     * @private
     */
    _getBottomOverflow: function(set1, set2, height)
    {
        var i = 0,
            len,
            overflow = 0,
            axis;
        if(set1)
        {
            len = set1.length;
            for(; i < len; ++i)
            {
                axis = set1[i];
                overflow = Math.max(overflow, axis.getMinLabelBounds().bottom - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, height) * 0.5));
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(overflow, axis.getMinLabelBounds().bottom - (axis.getEdgeOffset(axis.get("styles").majorTicks.count, height) * 0.5));
            }
        }
        return overflow;
    },

    /**
     * Redraws and position all the components of the chart instance.
     *
     * @method _redraw
     * @private
     */
    _redraw: function()
    {
        if(this._drawing)
        {
            this._callLater = true;
            return;
        }
        this._drawing = true;
        this._callLater = false;
        var w = this.get("width"),
            h = this.get("height"),
            leftPaneWidth = 0,
            rightPaneWidth = 0,
            topPaneHeight = 0,
            bottomPaneHeight = 0,
            leftAxesCollection = this.get("leftAxesCollection"),
            rightAxesCollection = this.get("rightAxesCollection"),
            topAxesCollection = this.get("topAxesCollection"),
            bottomAxesCollection = this.get("bottomAxesCollection"),
            i = 0,
            l,
            axis,
            graphOverflow = "visible",
            graph = this.get("graph"),
            topOverflow,
            bottomOverflow,
            leftOverflow,
            rightOverflow,
            graphWidth,
            graphHeight,
            graphX,
            graphY,
            allowContentOverflow = this.get("allowContentOverflow"),
            diff,
            rightAxesXCoords,
            leftAxesXCoords,
            topAxesYCoords,
            bottomAxesYCoords,
            graphRect = {};
        if(leftAxesCollection)
        {
            leftAxesXCoords = [];
            l = leftAxesCollection.length;
            for(i = l - 1; i > -1; --i)
            {
                leftAxesXCoords.unshift(leftPaneWidth);
                leftPaneWidth += leftAxesCollection[i].get("width");
            }
        }
        if(rightAxesCollection)
        {
            rightAxesXCoords = [];
            l = rightAxesCollection.length;
            i = 0;
            for(i = l - 1; i > -1; --i)
            {
                rightPaneWidth += rightAxesCollection[i].get("width");
                rightAxesXCoords.unshift(w - rightPaneWidth);
            }
        }
        if(topAxesCollection)
        {
            topAxesYCoords = [];
            l = topAxesCollection.length;
            for(i = l - 1; i > -1; --i)
            {
                topAxesYCoords.unshift(topPaneHeight);
                topPaneHeight += topAxesCollection[i].get("height");
            }
        }
        if(bottomAxesCollection)
        {
            bottomAxesYCoords = [];
            l = bottomAxesCollection.length;
            for(i = l - 1; i > -1; --i)
            {
                bottomPaneHeight += bottomAxesCollection[i].get("height");
                bottomAxesYCoords.unshift(h - bottomPaneHeight);
            }
        }

        graphWidth = w - (leftPaneWidth + rightPaneWidth);
        graphHeight = h - (bottomPaneHeight + topPaneHeight);
        graphRect.left = leftPaneWidth;
        graphRect.top = topPaneHeight;
        graphRect.bottom = h - bottomPaneHeight;
        graphRect.right = w - rightPaneWidth;
        if(!allowContentOverflow)
        {
            topOverflow = this._getTopOverflow(leftAxesCollection, rightAxesCollection);
            bottomOverflow = this._getBottomOverflow(leftAxesCollection, rightAxesCollection);
            leftOverflow = this._getLeftOverflow(bottomAxesCollection, topAxesCollection);
            rightOverflow = this._getRightOverflow(bottomAxesCollection, topAxesCollection);

            diff = topOverflow - topPaneHeight;
            if(diff > 0)
            {
                graphRect.top = topOverflow;
                if(topAxesYCoords)
                {
                    i = 0;
                    l = topAxesYCoords.length;
                    for(; i < l; ++i)
                    {
                        topAxesYCoords[i] += diff;
                    }
                }
            }

            diff = bottomOverflow - bottomPaneHeight;
            if(diff > 0)
            {
                graphRect.bottom = h - bottomOverflow;
                if(bottomAxesYCoords)
                {
                    i = 0;
                    l = bottomAxesYCoords.length;
                    for(; i < l; ++i)
                    {
                        bottomAxesYCoords[i] -= diff;
                    }
                }
            }

            diff = leftOverflow - leftPaneWidth;
            if(diff > 0)
            {
                graphRect.left = leftOverflow;
                if(leftAxesXCoords)
                {
                    i = 0;
                    l = leftAxesXCoords.length;
                    for(; i < l; ++i)
                    {
                        leftAxesXCoords[i] += diff;
                    }
                }
            }

            diff = rightOverflow - rightPaneWidth;
            if(diff > 0)
            {
                graphRect.right = w - rightOverflow;
                if(rightAxesXCoords)
                {
                    i = 0;
                    l = rightAxesXCoords.length;
                    for(; i < l; ++i)
                    {
                        rightAxesXCoords[i] -= diff;
                    }
                }
            }
        }
        graphWidth = graphRect.right - graphRect.left;
        graphHeight = graphRect.bottom - graphRect.top;
        graphX = graphRect.left;
        graphY = graphRect.top;
        if(topAxesCollection)
        {
            l = topAxesCollection.length;
            i = 0;
            for(; i < l; i++)
            {
                axis = topAxesCollection[i];
                if(axis.get("width") !== graphWidth)
                {
                    axis.set("width", graphWidth);
                }
                axis.get("boundingBox").setStyle("left", graphX + "px");
                axis.get("boundingBox").setStyle("top", topAxesYCoords[i] + "px");
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        if(bottomAxesCollection)
        {
            l = bottomAxesCollection.length;
            i = 0;
            for(; i < l; i++)
            {
                axis = bottomAxesCollection[i];
                if(axis.get("width") !== graphWidth)
                {
                    axis.set("width", graphWidth);
                }
                axis.get("boundingBox").setStyle("left", graphX + "px");
                axis.get("boundingBox").setStyle("top", bottomAxesYCoords[i] + "px");
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        if(leftAxesCollection)
        {
            l = leftAxesCollection.length;
            i = 0;
            for(; i < l; ++i)
            {
                axis = leftAxesCollection[i];
                axis.get("boundingBox").setStyle("top", graphY + "px");
                axis.get("boundingBox").setStyle("left", leftAxesXCoords[i] + "px");
                if(axis.get("height") !== graphHeight)
                {
                    axis.set("height", graphHeight);
                }
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        if(rightAxesCollection)
        {
            l = rightAxesCollection.length;
            i = 0;
            for(; i < l; ++i)
            {
                axis = rightAxesCollection[i];
                axis.get("boundingBox").setStyle("top", graphY + "px");
                axis.get("boundingBox").setStyle("left", rightAxesXCoords[i] + "px");
                if(axis.get("height") !== graphHeight)
                {
                    axis.set("height", graphHeight);
                }
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        this._drawing = false;
        if(this._callLater)
        {
            this._redraw();
            return;
        }
        if(graph)
        {
            graph.get("boundingBox").setStyle("left", graphX + "px");
            graph.get("boundingBox").setStyle("top", graphY + "px");
            graph.set("width", graphWidth);
            graph.set("height", graphHeight);
            graph.get("boundingBox").setStyle("overflow", graphOverflow);
        }

        if(this._overlay)
        {
            this._overlay.setStyle("left", graphX + "px");
            this._overlay.setStyle("top", graphY + "px");
            this._overlay.setStyle("width", graphWidth + "px");
            this._overlay.setStyle("height", graphHeight + "px");
        }
    },

    /**
     * Destructor implementation for the CartesianChart class. Calls destroy on all axes, series and the Graph instance.
     * Removes the tooltip and overlay HTML elements.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        var graph = this.get("graph"),
            i = 0,
            len,
            seriesCollection = this.get("seriesCollection"),
            axesCollection = this._axesCollection,
            tooltip = this.get("tooltip").node;
        if(this._description)
        {
            this._description.empty();
            this._description.remove(true);
        }
        if(this._liveRegion)
        {
            this._liveRegion.empty();
            this._liveRegion.remove(true);
        }
        len = seriesCollection ? seriesCollection.length : 0;
        for(; i < len; ++i)
        {
            if(seriesCollection[i] instanceof Y.CartesianSeries)
            {
                seriesCollection[i].destroy(true);
            }
        }
        len = axesCollection ? axesCollection.length : 0;
        for(i = 0; i < len; ++i)
        {
            if(axesCollection[i] instanceof Y.Axis)
            {
                axesCollection[i].destroy(true);
            }
        }
        if(graph)
        {
            graph.destroy(true);
        }
        if(tooltip)
        {
            tooltip.empty();
            tooltip.remove(true);
        }
        if(this._overlay)
        {
            this._overlay.empty();
            this._overlay.remove(true);
        }
    },

    /**
     * Returns the appropriate message based on the key press.
     *
     * @method _getAriaMessage
     * @param {Number} key The keycode that was pressed.
     * @return String
     */
    _getAriaMessage: function(key)
    {
        var msg = "",
            series,
            items,
            categoryItem,
            valueItem,
            seriesIndex = this._seriesIndex,
            itemIndex = this._itemIndex,
            seriesCollection = this.get("seriesCollection"),
            len = seriesCollection.length,
            dataLength;
        if(key % 2 === 0)
        {
            if(len > 1)
            {
                if(key === 38)
                {
                    seriesIndex = seriesIndex < 1 ? len - 1 : seriesIndex - 1;
                }
                else if(key === 40)
                {
                    seriesIndex = seriesIndex >= len - 1 ? 0 : seriesIndex + 1;
                }
                this._itemIndex = -1;
            }
            else
            {
                seriesIndex = 0;
            }
            this._seriesIndex = seriesIndex;
            series = this.getSeries(parseInt(seriesIndex, 10));
            msg = series.get("valueDisplayName") + " series.";
        }
        else
        {
            if(seriesIndex > -1)
            {
                msg = "";
                series = this.getSeries(parseInt(seriesIndex, 10));
            }
            else
            {
                seriesIndex = 0;
                this._seriesIndex = seriesIndex;
                series = this.getSeries(parseInt(seriesIndex, 10));
                msg = series.get("valueDisplayName") + " series.";
            }
            dataLength = series._dataLength ? series._dataLength : 0;
            if(key === 37)
            {
                itemIndex = itemIndex > 0 ? itemIndex - 1 : dataLength - 1;
            }
            else if(key === 39)
            {
                itemIndex = itemIndex >= dataLength - 1 ? 0 : itemIndex + 1;
            }
            this._itemIndex = itemIndex;
            items = this.getSeriesItems(series, itemIndex);
            categoryItem = items.category;
            valueItem = items.value;
            if(categoryItem && valueItem && categoryItem.value && valueItem.value)
            {
                msg += categoryItem.displayName + ": " + categoryItem.axis.formatLabel.apply(this, [categoryItem.value, categoryItem.axis.get("labelFormat")]) + ", ";
                msg += valueItem.displayName + ": " + valueItem.axis.formatLabel.apply(this, [valueItem.value, valueItem.axis.get("labelFormat")]) + ", ";
            }
           else
            {
                msg += "No data available.";
            }
            msg += (itemIndex + 1) + " of " + dataLength + ". ";
        }
        return msg;
    }
}, {
    ATTRS: {
        /**
         * Indicates whether axis labels are allowed to overflow beyond the bounds of the chart's content box.
         *
         * @attribute allowContentOverflow
         * @type Boolean
         */
        allowContentOverflow: {
            value: false
        },

        /**
         * Style object for the axes.
         *
         * @attribute axesStyles
         * @type Object
         * @private
         */
        axesStyles: {
            getter: function()
            {
                var axes = this.get("axes"),
                    i,
                    styles = this._axesStyles;
                if(axes)
                {
                    for(i in axes)
                    {
                        if(axes.hasOwnProperty(i) && axes[i] instanceof Y.Axis)
                        {
                            if(!styles)
                            {
                                styles = {};
                            }
                            styles[i] = axes[i].get("styles");
                        }
                    }
                }
                return styles;
            },

            setter: function(val)
            {
                var axes = this.get("axes"),
                    i;
                for(i in val)
                {
                    if(val.hasOwnProperty(i) && axes.hasOwnProperty(i))
                    {
                        this._setBaseAttribute(axes[i], "styles", val[i]);
                    }
                }
            }
        },

        /**
         * Style object for the series
         *
         * @attribute seriesStyles
         * @type Object
         * @private
         */
        seriesStyles: {
            getter: function()
            {
                var styles = this._seriesStyles,
                    graph = this.get("graph"),
                    dict,
                    i;
                if(graph)
                {
                    dict = graph.get("seriesDictionary");
                    if(dict)
                    {
                        styles = {};
                        for(i in dict)
                        {
                            if(dict.hasOwnProperty(i))
                            {
                                styles[i] = dict[i].get("styles");
                            }
                        }
                    }
                }
                return styles;
            },

            setter: function(val)
            {
                var i,
                    l,
                    s;

                if(Y_Lang.isArray(val))
                {
                    s = this.get("seriesCollection");
                    i = 0;
                    l = val.length;

                    for(; i < l; ++i)
                    {
                        this._setBaseAttribute(s[i], "styles", val[i]);
                    }
                }
                else
                {
                    for(i in val)
                    {
                        if(val.hasOwnProperty(i))
                        {
                            s = this.getSeries(i);
                            this._setBaseAttribute(s, "styles", val[i]);
                        }
                    }
                }
            }
        },

        /**
         * Styles for the graph.
         *
         * @attribute graphStyles
         * @type Object
         * @private
         */
        graphStyles: {
            getter: function()
            {
                var graph = this.get("graph");
                if(graph)
                {
                    return(graph.get("styles"));
                }
                return this._graphStyles;
            },

            setter: function(val)
            {
                var graph = this.get("graph");
                this._setBaseAttribute(graph, "styles", val);
            }

        },

        /**
         * Style properties for the chart. Contains a key indexed hash of the following:
         *  <dl>
         *      <dt>series</dt><dd>A key indexed hash containing references to the `styles` attribute for each series in the chart.
         *      Specific style attributes vary depending on the series:
         *      <ul>
         *          <li><a href="AreaSeries.html#attr_styles">AreaSeries</a></li>
         *          <li><a href="BarSeries.html#attr_styles">BarSeries</a></li>
         *          <li><a href="ColumnSeries.html#attr_styles">ColumnSeries</a></li>
         *          <li><a href="ComboSeries.html#attr_styles">ComboSeries</a></li>
         *          <li><a href="LineSeries.html#attr_styles">LineSeries</a></li>
         *          <li><a href="MarkerSeries.html#attr_styles">MarkerSeries</a></li>
         *          <li><a href="SplineSeries.html#attr_styles">SplineSeries</a></li>
         *      </ul>
         *      </dd>
         *      <dt>axes</dt><dd>A key indexed hash containing references to the `styles` attribute for each axes in the chart. Specific
         *      style attributes can be found in the <a href="Axis.html#attr_styles">Axis</a> class.</dd>
         *      <dt>graph</dt><dd>A reference to the `styles` attribute in the chart. Specific style attributes can be found in the
         *      <a href="Graph.html#attr_styles">Graph</a> class.</dd>
         *  </dl>
         *
         * @attribute styles
         * @type Object
         */
        styles: {
            getter: function()
            {
                var styles = {
                    axes: this.get("axesStyles"),
                    series: this.get("seriesStyles"),
                    graph: this.get("graphStyles")
                };
                return styles;
            },
            setter: function(val)
            {
                if(val.hasOwnProperty("axes"))
                {
                    if(this.get("axesStyles"))
                    {
                        this.set("axesStyles", val.axes);
                    }
                    else
                    {
                        this._axesStyles = val.axes;
                    }
                }
                if(val.hasOwnProperty("series"))
                {
                    if(this.get("seriesStyles"))
                    {
                        this.set("seriesStyles", val.series);
                    }
                    else
                    {
                        this._seriesStyles = val.series;
                    }
                }
                if(val.hasOwnProperty("graph"))
                {
                    this.set("graphStyles", val.graph);
                }
            }
        },

        /**
         * Axes to appear in the chart. This can be a key indexed hash of axis instances or object literals
         * used to construct the appropriate axes.
         *
         * @attribute axes
         * @type Object
         */
        axes: {
            valueFn: "_getDefaultAxes",

            setter: function(val)
            {
                if(this.get("dataProvider"))
                {
                    val = this._setAxes(val);
                }
                return val;
            }
        },

        /**
         * Collection of series to appear on the chart. This can be an array of Series instances or object literals
         * used to construct the appropriate series.
         *
         * @attribute seriesCollection
         * @type Array
         */
        seriesCollection: {
            valueFn: "_getDefaultSeriesCollection",

            setter: function(val)
            {
                if(this.get("dataProvider"))
                {
                    val = this._parseSeriesCollection(val);
                }
                return val;
            }
        },

        /**
         * Reference to the left-aligned axes for the chart.
         *
         * @attribute leftAxesCollection
         * @type Array
         * @private
         */
        leftAxesCollection: {},

        /**
         * Reference to the bottom-aligned axes for the chart.
         *
         * @attribute bottomAxesCollection
         * @type Array
         * @private
         */
        bottomAxesCollection: {},

        /**
         * Reference to the right-aligned axes for the chart.
         *
         * @attribute rightAxesCollection
         * @type Array
         * @private
         */
        rightAxesCollection: {},

        /**
         * Reference to the top-aligned axes for the chart.
         *
         * @attribute topAxesCollection
         * @type Array
         * @private
         */
        topAxesCollection: {},

        /**
         * Indicates whether or not the chart is stacked.
         *
         * @attribute stacked
         * @type Boolean
         */
        stacked: {
            value: false
        },

        /**
         * Direction of chart's category axis when there is no series collection specified. Charts can
         * be horizontal or vertical. When the chart type is column, the chart is horizontal.
         * When the chart type is bar, the chart is vertical.
         *
         * @attribute direction
         * @type String
         */
        direction: {
            getter: function()
            {
                var type = this.get("type");
                if(type == "bar")
                {
                    return "vertical";
                }
                else if(type == "column")
                {
                    return "horizontal";
                }
                return this._direction;
            },

            setter: function(val)
            {
                this._direction = val;
                return this._direction;
            }
        },

        /**
         * Indicates whether or not an area is filled in a combo chart.
         *
         * @attribute showAreaFill
         * @type Boolean
         */
        showAreaFill: {},

        /**
         * Indicates whether to display markers in a combo chart.
         *
         * @attribute showMarkers
         * @type Boolean
         */
        showMarkers:{},

        /**
         * Indicates whether to display lines in a combo chart.
         *
         * @attribute showLines
         * @type Boolean
         */
        showLines:{},

        /**
         * Indicates the key value used to identify a category axis in the `axes` hash. If
         * not specified, the categoryKey attribute value will be used.
         *
         * @attribute categoryAxisName
         * @type String
         */
        categoryAxisName: {
        },

        /**
         * Indicates the key value used to identify a the series axis when an axis not generated.
         *
         * @attribute valueAxisName
         * @type String
         */
        valueAxisName: {
            value: "values"
        },

        /**
         * Reference to the horizontalGridlines for the chart.
         *
         * @attribute horizontalGridlines
         * @type Gridlines
         */
        horizontalGridlines: {
            getter: function()
            {
                var graph = this.get("graph");
                if(graph)
                {
                    return graph.get("horizontalGridlines");
                }
                return this._horizontalGridlines;
            },
            setter: function(val)
            {
                var graph = this.get("graph");
                if(val && !Y_Lang.isObject(val))
                {
                    val = {};
                }
                if(graph)
                {
                    graph.set("horizontalGridlines", val);
                }
                else
                {
                    this._horizontalGridlines = val;
                }
            }
        },

        /**
         * Reference to the verticalGridlines for the chart.
         *
         * @attribute verticalGridlines
         * @type Gridlines
         */
        verticalGridlines: {
            getter: function()
            {
                var graph = this.get("graph");
                if(graph)
                {
                    return graph.get("verticalGridlines");
                }
                return this._verticalGridlines;
            },
            setter: function(val)
            {
                var graph = this.get("graph");
                if(val && !Y_Lang.isObject(val))
                {
                    val = {};
                }
                if(graph)
                {
                    graph.set("verticalGridlines", val);
                }
                else
                {
                    this._verticalGridlines = val;
                }
            }
        },

        /**
         * Type of chart when there is no series collection specified.
         *
         * @attribute type
         * @type String
         */
        type: {
            getter: function()
            {
                if(this.get("stacked"))
                {
                    return "stacked" + this._type;
                }
                return this._type;
            },

            setter: function(val)
            {
                if(this._type == "bar")
                {
                    if(val != "bar")
                    {
                        this.set("direction", "horizontal");
                    }
                }
                else
                {
                    if(val == "bar")
                    {
                        this.set("direction", "vertical");
                    }
                }
                this._type = val;
                return this._type;
            }
        },

        /**
         * Reference to the category axis used by the chart.
         *
         * @attribute categoryAxis
         * @type Axis
         */
        categoryAxis:{}
    }
});
/**
 * The PieChart class creates a pie chart
 *
 * @module charts
 * @submodule charts-base
 * @class PieChart
 * @extends ChartBase
 * @constructor
 */
Y.PieChart = Y.Base.create("pieChart", Y.Widget, [Y.ChartBase], {
    /**
     * Calculates and returns a `seriesCollection`.
     *
     * @method _getSeriesCollection
     * @return Array
     * @private
     */
    _getSeriesCollection: function()
    {
        if(this._seriesCollection)
        {
            return this._seriesCollection;
        }
        var axes = this.get("axes"),
            sc = [],
            seriesKeys,
            i = 0,
            l,
            type = this.get("type"),
            key,
            catAxis = "categoryAxis",
            catKey = "categoryKey",
            valAxis = "valueAxis",
            seriesKey = "valueKey";
        if(axes)
        {
            seriesKeys = axes.values.get("keyCollection");
            key = axes.category.get("keyCollection")[0];
            l = seriesKeys.length;
            for(; i < l; ++i)
            {
                sc[i] = {type:type};
                sc[i][catAxis] = "category";
                sc[i][valAxis] = "values";
                sc[i][catKey] = key;
                sc[i][seriesKey] = seriesKeys[i];
            }
        }
        this._seriesCollection = sc;
        return sc;
    },

    /**
     * Creates `Axis` instances.
     *
     * @method _parseAxes
     * @param {Object} val Object containing `Axis` instances or objects in which to construct `Axis` instances.
     * @return Object
     * @private
     */
    _parseAxes: function(hash)
    {
        if(!this._axes)
        {
            this._axes = {};
        }
        var i, pos, axis, dh, config, axisClass,
            type = this.get("type"),
            w = this.get("width"),
            h = this.get("height"),
            node = Y.Node.one(this._parentNode);
        if(!w)
        {
            this.set("width", node.get("offsetWidth"));
            w = this.get("width");
        }
        if(!h)
        {
            this.set("height", node.get("offsetHeight"));
            h = this.get("height");
        }
        for(i in hash)
        {
            if(hash.hasOwnProperty(i))
            {
                dh = hash[i];
                pos = type == "pie" ? "none" : dh.position;
                axisClass = this._getAxisClass(dh.type);
                config = {dataProvider:this.get("dataProvider")};
                if(dh.hasOwnProperty("roundingUnit"))
                {
                    config.roundingUnit = dh.roundingUnit;
                }
                config.keys = dh.keys;
                config.width = w;
                config.height = h;
                config.position = pos;
                config.styles = dh.styles;
                axis = new axisClass(config);
                axis.on("axisRendered", Y.bind(this._itemRendered, this));
                this._axes[i] = axis;
            }
        }
    },

    /**
     * Adds axes to the chart.
     *
     * @method _addAxes
     * @private
     */
    _addAxes: function()
    {
        var axes = this.get("axes"),
            i,
            axis,
            p;
        if(!axes)
        {
            this.set("axes", this._getDefaultAxes());
            axes = this.get("axes");
        }
        if(!this._axesCollection)
        {
            this._axesCollection = [];
        }
        for(i in axes)
        {
            if(axes.hasOwnProperty(i))
            {
                axis = axes[i];
                p = axis.get("position");
                if(!this.get(p + "AxesCollection"))
                {
                    this.set(p + "AxesCollection", [axis]);
                }
                else
                {
                    this.get(p + "AxesCollection").push(axis);
                }
                this._axesCollection.push(axis);
            }
        }
    },

    /**
     * Renders the Graph.
     *
     * @method _addSeries
     * @private
     */
    _addSeries: function()
    {
        var graph = this.get("graph"),
            seriesCollection = this.get("seriesCollection");
        this._parseSeriesAxes(seriesCollection);
        graph.set("showBackground", false);
        graph.set("width", this.get("width"));
        graph.set("height", this.get("height"));
        graph.set("seriesCollection", seriesCollection);
        this._seriesCollection = graph.get("seriesCollection");
        graph.render(this.get("contentBox"));
    },

    /**
     * Parse and sets the axes for the chart.
     *
     * @method _parseSeriesAxes
     * @param {Array} c A collection `PieSeries` instance.
     * @private
     */
    _parseSeriesAxes: function(c)
    {
        var i = 0,
            len = c.length,
            s,
            axes = this.get("axes"),
            axis;
        for(; i < len; ++i)
        {
            s = c[i];
            if(s)
            {
                //If series is an actual series instance,
                //replace axes attribute string ids with axes
                if(s instanceof Y.PieSeries)
                {
                    axis = s.get("categoryAxis");
                    if(axis && !(axis instanceof Y.Axis))
                    {
                        s.set("categoryAxis", axes[axis]);
                    }
                    axis = s.get("valueAxis");
                    if(axis && !(axis instanceof Y.Axis))
                    {
                        s.set("valueAxis", axes[axis]);
                    }
                    continue;
                }
                s.categoryAxis = axes.category;
                s.valueAxis = axes.values;
                if(!s.type)
                {
                    s.type = this.get("type");
                }
            }
        }
    },

    /**
     * Generates and returns a key-indexed object containing `Axis` instances or objects used to create `Axis` instances.
     *
     * @method _getDefaultAxes
     * @return Object
     * @private
     */
    _getDefaultAxes: function()
    {
        var catKey = this.get("categoryKey"),
            seriesKeys = this.get("seriesKeys").concat(),
            seriesAxis = "numeric";
        return {
            values:{
                keys:seriesKeys,
                type:seriesAxis
            },
            category:{
                keys:[catKey],
                type:this.get("categoryType")
            }
        };
    },

    /**
     * Returns an object literal containing a categoryItem and a valueItem for a given series index.
     *
     * @method getSeriesItem
     * @param series Reference to a series.
     * @param index Index of the specified item within a series.
     * @return Object
     */
    getSeriesItems: function(series, index)
    {
        var categoryItem = {
                axis: series.get("categoryAxis"),
                key: series.get("categoryKey"),
                displayName: series.get("categoryDisplayName")
            },
            valueItem = {
                axis: series.get("valueAxis"),
                key: series.get("valueKey"),
                displayName: series.get("valueDisplayName")
            };
        categoryItem.value = categoryItem.axis.getKeyValueAt(categoryItem.key, index);
        valueItem.value = valueItem.axis.getKeyValueAt(valueItem.key, index);
        return {category:categoryItem, value:valueItem};
    },

    /**
     * Handler for sizeChanged event.
     *
     * @method _sizeChanged
     * @param {Object} e Event object.
     * @private
     */
    _sizeChanged: function(e)
    {
        this._redraw();
    },

    /**
     * Redraws the chart instance.
     *
     * @method _redraw
     * @private
     */
    _redraw: function()
    {
        var graph = this.get("graph"),
            w = this.get("width"),
            h = this.get("height"),
            dimension;
        if(graph)
        {
            dimension = Math.min(w, h);
            graph.set("width", dimension);
            graph.set("height", dimension);
        }
    },

    /**
     * Formats tooltip text for a pie chart.
     *
     * @method _tooltipLabelFunction
     * @param {Object} categoryItem An object containing the following:
     *  <dl>
     *      <dt>axis</dt><dd>The axis to which the category is bound.</dd>
     *      <dt>displayName</dt><dd>The display name set to the category (defaults to key if not provided)</dd>
     *      <dt>key</dt><dd>The key of the category.</dd>
     *      <dt>value</dt><dd>The value of the category</dd>
     *  </dl>
     * @param {Object} valueItem An object containing the following:
     *  <dl>
     *      <dt>axis</dt><dd>The axis to which the item's series is bound.</dd>
     *      <dt>displayName</dt><dd>The display name of the series. (defaults to key if not provided)</dd>
     *      <dt>key</dt><dd>The key for the series.</dd>
     *      <dt>value</dt><dd>The value for the series item.</dd>
     *  </dl>
     * @param {Number} itemIndex The index of the item within the series.
     * @param {CartesianSeries} series The `PieSeries` instance of the item.
     * @param {Number} seriesIndex The index of the series in the `seriesCollection`.
     * @return {HTML}
     * @private
     */
    _tooltipLabelFunction: function(categoryItem, valueItem, itemIndex, series, seriesIndex)
    {
        var msg = DOCUMENT.createElement("div"),
            total = series.getTotalValues(),
            pct = Math.round((valueItem.value / total) * 10000)/100;
        msg.appendChild(DOCUMENT.createTextNode(categoryItem.displayName +
        ": " + categoryItem.axis.get("labelFunction").apply(this, [categoryItem.value, categoryItem.axis.get("labelFormat")])));
        msg.appendChild(DOCUMENT.createElement("br"));
        msg.appendChild(DOCUMENT.createTextNode(valueItem.displayName +
        ": " + valueItem.axis.get("labelFunction").apply(this, [valueItem.value, valueItem.axis.get("labelFormat")])));
        msg.appendChild(DOCUMENT.createElement("br"));
        msg.appendChild(DOCUMENT.createTextNode(pct + "%"));
        return msg;
    },

    /**
     * Returns the appropriate message based on the key press.
     *
     * @method _getAriaMessage
     * @param {Number} key The keycode that was pressed.
     * @return String
     */
    _getAriaMessage: function(key)
    {
        var msg = "",
            categoryItem,
            items,
            series,
            valueItem,
            seriesIndex = 0,
            itemIndex = this._itemIndex,
            seriesCollection = this.get("seriesCollection"),
            len,
            total,
            pct,
            markers;
        series = this.getSeries(parseInt(seriesIndex, 10));
        markers = series.get("markers");
        len = markers && markers.length ? markers.length : 0;
        if(key === 37)
        {
            itemIndex = itemIndex > 0 ? itemIndex - 1 : len - 1;
        }
        else if(key === 39)
        {
            itemIndex = itemIndex >= len - 1 ? 0 : itemIndex + 1;
        }
        this._itemIndex = itemIndex;
        items = this.getSeriesItems(series, itemIndex);
        categoryItem = items.category;
        valueItem = items.value;
        total = series.getTotalValues();
        pct = Math.round((valueItem.value / total) * 10000)/100;
        if(categoryItem && valueItem)
        {
            msg += categoryItem.displayName + ": " + categoryItem.axis.formatLabel.apply(this, [categoryItem.value, categoryItem.axis.get("labelFormat")]) + ", ";
            msg += valueItem.displayName + ": " + valueItem.axis.formatLabel.apply(this, [valueItem.value, valueItem.axis.get("labelFormat")]) + ", ";
            msg += "Percent of total " + valueItem.displayName + ": " + pct + "%,";
        }
        else
        {
            msg += "No data available,";
        }
        msg += (itemIndex + 1) + " of " + len + ". ";
        return msg;
    }
}, {
    ATTRS: {
        /**
         * Sets the aria description for the chart.
         *
         * @attribute ariaDescription
         * @type String
         */
        ariaDescription: {
            value: "Use the left and right keys to navigate through items.",

            setter: function(val)
            {
                if(this._description)
                {
                    this._description.setContent("");
                    this._description.appendChild(DOCUMENT.createTextNode(val));
                }
                return val;
            }
        },

        /**
         * Axes to appear in the chart.
         *
         * @attribute axes
         * @type Object
         */
        axes: {
            getter: function()
            {
                return this._axes;
            },

            setter: function(val)
            {
                this._parseAxes(val);
            }
        },

        /**
         * Collection of series to appear on the chart. This can be an array of Series instances or object literals
         * used to describe a Series instance.
         *
         * @attribute seriesCollection
         * @type Array
         */
        seriesCollection: {
            getter: function()
            {
                return this._getSeriesCollection();
            },

            setter: function(val)
            {
                return this._setSeriesCollection(val);
            }
        },

        /**
         * Type of chart when there is no series collection specified.
         *
         * @attribute type
         * @type String
         */
        type: {
            value: "pie"
        }
    }
});


}, '3.8.1', {
    "requires": [
        "dom",
        "datatype-number",
        "datatype-date",
        "event-custom",
        "event-mouseenter",
        "event-touch",
        "widget",
        "widget-position",
        "widget-stack",
        "graphics"
    ]
});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('charts', function (Y, NAME) {

/**
 * The Chart class is the basic application used to create a chart.
 *
 * @module charts
 * @class Chart
 * @constructor
 */
function Chart(cfg)
{
    if(cfg.type != "pie")
    {
        return new Y.CartesianChart(cfg);
    }
    else
    {
        return new Y.PieChart(cfg);
    }
}
Y.Chart = Chart;


}, '3.8.1', {"requires": ["charts-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('charts-legend', function (Y, NAME) {

/**
 * Adds legend functionality to charts.
 *
 * @module charts
 * @submodule charts-legend
 */
var DOCUMENT = Y.config.doc,
TOP = "top",
RIGHT = "right",
BOTTOM = "bottom",
LEFT = "left",
EXTERNAL = "external",
HORIZONTAL = "horizontal",
VERTICAL = "vertical",
WIDTH = "width",
HEIGHT = "height",
POSITION = "position",
_X = "x",
_Y = "y",
PX = "px",
LEGEND = {
    setter: function(val)
    {
        var legend = this.get("legend");
        if(legend)
        {
            legend.destroy(true);
        }
        if(val instanceof Y.ChartLegend)
        {
            legend = val;
            legend.set("chart", this);
        }
        else
        {
            val.chart = this;
            if(!val.hasOwnProperty("render"))
            {
                val.render = this.get("contentBox");
                val.includeInChartLayout = true;
            }
            legend = new Y.ChartLegend(val);
        }
        return legend;
    }
},

/**
 * Contains methods for displaying items horizontally in a legend.
 *
 * @module charts
 * @submodule charts-legend
 * @class HorizontalLegendLayout
 */
HorizontalLegendLayout = {
    /**
     * Displays items horizontally in a legend.
     *
     * @method _positionLegendItems
     * @param {Array} items Array of items to display in the legend.
     * @param {Number} maxWidth The width of the largest item in the legend.
     * @param {Number} maxHeight The height of the largest item in the legend.
     * @param {Number} totalWidth The total width of all items in a legend.
     * @param {Number} totalHeight The total height of all items in a legend.
     * @param {Number} padding The left, top, right and bottom padding properties for the legend.
     * @param {Number} horizontalGap The horizontal distance between items in a legend.
     * @param {Number} verticalGap The vertical distance between items in a legend.
     * @param {String} hAlign The horizontal alignment of the legend.
     * @param {String} vAlign The vertical alignment of the legend.
     * @protected
     */
    _positionLegendItems: function(items, maxWidth, maxHeight, totalWidth, totalHeight, padding, horizontalGap, verticalGap, hAlign, vAlign)
    {
        var i = 0,
            rowIterator = 0,
            item,
            node,
            itemWidth,
            itemHeight,
            len,
            width = this.get("width"),
            rows,
            rowsLen,
            row,
            totalWidthArray,
            legendWidth,
            topHeight = padding.top - verticalGap,
            limit = width - (padding.left + padding.right),
            left,
            top,
            right,
            bottom;
        HorizontalLegendLayout._setRowArrays(items, limit, horizontalGap);
        rows = HorizontalLegendLayout.rowArray;
        totalWidthArray = HorizontalLegendLayout.totalWidthArray;
        rowsLen = rows.length;
        for(; rowIterator < rowsLen; ++ rowIterator)
        {
            topHeight += verticalGap;
            row = rows[rowIterator];
            len = row.length;
            legendWidth =  HorizontalLegendLayout.getStartPoint(width, totalWidthArray[rowIterator], hAlign, padding);
            for(i = 0; i < len; ++i)
            {
                item = row[i];
                node = item.node;
                itemWidth = item.width;
                itemHeight = item.height;
                item.x = legendWidth;
                item.y = 0;
                left = !isNaN(left) ? Math.min(left, legendWidth) : legendWidth;
                top = !isNaN(top) ? Math.min(top, topHeight) : topHeight;
                right = !isNaN(right) ? Math.max(legendWidth + itemWidth, right) : legendWidth + itemWidth;
                bottom = !isNaN(bottom) ? Math.max(topHeight + itemHeight, bottom) : topHeight + itemHeight;
                node.setStyle("left", legendWidth + PX);
                node.setStyle("top", topHeight + PX);
                legendWidth += itemWidth + horizontalGap;
            }
            topHeight += item.height;
        }
        this._contentRect = {
            left: left,
            top: top,
            right: right,
            bottom: bottom
        };
        if(this.get("includeInChartLayout"))
        {
            this.set("height", topHeight + padding.bottom);
        }
    },

    /**
     * Creates row and total width arrays used for displaying multiple rows of
     * legend items based on the items, available width and horizontalGap for the legend.
     *
     * @method _setRowArrays
     * @param {Array} items Array of legend items to display in a legend.
     * @param {Number} limit Total available width for displaying items in a legend.
     * @param {Number} horizontalGap Horizontal distance between items in a legend.
     * @protected
     */
    _setRowArrays: function(items, limit, horizontalGap)
    {
        var item = items[0],
            rowArray = [[item]],
            i = 1,
            rowIterator = 0,
            len = items.length,
            totalWidth = item.width,
            itemWidth,
            totalWidthArray = [[totalWidth]];
        for(; i < len; ++i)
        {
            item = items[i];
            itemWidth = item.width;
            if((totalWidth + horizontalGap + itemWidth) <= limit)
            {
                totalWidth += horizontalGap + itemWidth;
                rowArray[rowIterator].push(item);
            }
            else
            {
                totalWidth = horizontalGap + itemWidth;
                if(rowArray[rowIterator])
                {
                    rowIterator += 1;
                }
                rowArray[rowIterator] = [item];
            }
            totalWidthArray[rowIterator] = totalWidth;
        }
        HorizontalLegendLayout.rowArray = rowArray;
        HorizontalLegendLayout.totalWidthArray = totalWidthArray;
    },

    /**
     * Returns the starting x-coordinate for a row of legend items.
     *
     * @method getStartPoint
     * @param {Number} w Width of the legend.
     * @param {Number} totalWidth Total width of all labels in the row.
     * @param {String} align Horizontal alignment of items for the legend.
     * @param {Object} padding Object contain left, top, right and bottom padding properties.
     * @return Number
     * @protected
     */
    getStartPoint: function(w, totalWidth, align, padding)
    {
        var startPoint;
        switch(align)
        {
            case LEFT :
                startPoint = padding.left;
            break;
            case "center" :
                startPoint = (w - totalWidth) * 0.5;
            break;
            case RIGHT :
                startPoint = w - totalWidth - padding.right;
            break;
        }
        return startPoint;
    }
},

/**
 * Contains methods for displaying items vertically in a legend.
 *
 * @module charts
 * @submodule charts-legend
 * @class VerticalLegendLayout
 */
VerticalLegendLayout = {
    /**
     * Displays items vertically in a legend.
     *
     * @method _positionLegendItems
     * @param {Array} items Array of items to display in the legend.
     * @param {Number} maxWidth The width of the largest item in the legend.
     * @param {Number} maxHeight The height of the largest item in the legend.
     * @param {Number} totalWidth The total width of all items in a legend.
     * @param {Number} totalHeight The total height of all items in a legend.
     * @param {Number} padding The left, top, right and bottom padding properties for the legend.
     * @param {Number} horizontalGap The horizontal distance between items in a legend.
     * @param {Number} verticalGap The vertical distance between items in a legend.
     * @param {String} hAlign The horizontal alignment of the legend.
     * @param {String} vAlign The vertical alignment of the legend.
     * @protected
     */
    _positionLegendItems: function(items, maxWidth, maxHeight, totalWidth, totalHeight, padding, horizontalGap, verticalGap, hAlign, vAlign)
    {
        var i = 0,
            columnIterator = 0,
            item,
            node,
            itemHeight,
            itemWidth,
            len,
            height = this.get("height"),
            columns,
            columnsLen,
            column,
            totalHeightArray,
            legendHeight,
            leftWidth = padding.left - horizontalGap,
            legendWidth,
            limit = height - (padding.top + padding.bottom),
            left,
            top,
            right,
            bottom;
        VerticalLegendLayout._setColumnArrays(items, limit, verticalGap);
        columns = VerticalLegendLayout.columnArray;
        totalHeightArray = VerticalLegendLayout.totalHeightArray;
        columnsLen = columns.length;
        for(; columnIterator < columnsLen; ++ columnIterator)
        {
            leftWidth += horizontalGap;
            column = columns[columnIterator];
            len = column.length;
            legendHeight =  VerticalLegendLayout.getStartPoint(height, totalHeightArray[columnIterator], vAlign, padding);
            legendWidth = 0;
            for(i = 0; i < len; ++i)
            {
                item = column[i];
                node = item.node;
                itemHeight = item.height;
                itemWidth = item.width;
                item.y = legendHeight;
                item.x = leftWidth;
                left = !isNaN(left) ? Math.min(left, leftWidth) : leftWidth;
                top = !isNaN(top) ? Math.min(top, legendHeight) : legendHeight;
                right = !isNaN(right) ? Math.max(leftWidth + itemWidth, right) : leftWidth + itemWidth;
                bottom = !isNaN(bottom) ? Math.max(legendHeight + itemHeight, bottom) : legendHeight + itemHeight;
                node.setStyle("left", leftWidth + PX);
                node.setStyle("top", legendHeight + PX);
                legendHeight += itemHeight + verticalGap;
                legendWidth = Math.max(legendWidth, item.width);
            }
            leftWidth += legendWidth;
        }
        this._contentRect = {
            left: left,
            top: top,
            right: right,
            bottom: bottom
        };
        if(this.get("includeInChartLayout"))
        {
            this.set("width", leftWidth + padding.right);
        }
    },

    /**
     * Creates column and total height arrays used for displaying multiple columns of
     * legend items based on the items, available height and verticalGap for the legend.
     *
     * @method _setColumnArrays
     * @param {Array} items Array of legend items to display in a legend.
     * @param {Number} limit Total available height for displaying items in a legend.
     * @param {Number} verticalGap Vertical distance between items in a legend.
     * @protected
     */
    _setColumnArrays: function(items, limit, verticalGap)
    {
        var item = items[0],
            columnArray = [[item]],
            i = 1,
            columnIterator = 0,
            len = items.length,
            totalHeight = item.height,
            itemHeight,
            totalHeightArray = [[totalHeight]];
        for(; i < len; ++i)
        {
            item = items[i];
            itemHeight = item.height;
            if((totalHeight + verticalGap + itemHeight) <= limit)
            {
                totalHeight += verticalGap + itemHeight;
                columnArray[columnIterator].push(item);
            }
            else
            {
                totalHeight = verticalGap + itemHeight;
                if(columnArray[columnIterator])
                {
                    columnIterator += 1;
                }
                columnArray[columnIterator] = [item];
            }
            totalHeightArray[columnIterator] = totalHeight;
        }
        VerticalLegendLayout.columnArray = columnArray;
        VerticalLegendLayout.totalHeightArray = totalHeightArray;
    },

    /**
     * Returns the starting y-coordinate for a column of legend items.
     *
     * @method getStartPoint
     * @param {Number} h Height of the legend.
     * @param {Number} totalHeight Total height of all labels in the column.
     * @param {String} align Vertical alignment of items for the legend.
     * @param {Object} padding Object contain left, top, right and bottom padding properties.
     * @return Number
     * @protected
     */
    getStartPoint: function(h, totalHeight, align, padding)
    {
        var startPoint;
        switch(align)
        {
            case TOP :
                startPoint = padding.top;
            break;
            case "middle" :
                startPoint = (h - totalHeight) * 0.5;
            break;
            case BOTTOM :
                startPoint = h - totalHeight - padding.bottom;
            break;
        }
        return startPoint;
    }
},

CartesianChartLegend = Y.Base.create("cartesianChartLegend", Y.CartesianChart, [], {
    /**
     * Redraws and position all the components of the chart instance.
     *
     * @method _redraw
     * @private
     */
    _redraw: function()
    {
        if(this._drawing)
        {
            this._callLater = true;
            return;
        }
        this._drawing = true;
        this._callLater = false;
        var w = this.get("width"),
            h = this.get("height"),
            layoutBoxDimensions = this._getLayoutBoxDimensions(),
            leftPaneWidth = layoutBoxDimensions.left,
            rightPaneWidth = layoutBoxDimensions.right,
            topPaneHeight = layoutBoxDimensions.top,
            bottomPaneHeight = layoutBoxDimensions.bottom,
            leftAxesCollection = this.get("leftAxesCollection"),
            rightAxesCollection = this.get("rightAxesCollection"),
            topAxesCollection = this.get("topAxesCollection"),
            bottomAxesCollection = this.get("bottomAxesCollection"),
            i = 0,
            l,
            axis,
            graphOverflow = "visible",
            graph = this.get("graph"),
            topOverflow,
            bottomOverflow,
            leftOverflow,
            rightOverflow,
            graphWidth,
            graphHeight,
            graphX,
            graphY,
            allowContentOverflow = this.get("allowContentOverflow"),
            diff,
            rightAxesXCoords,
            leftAxesXCoords,
            topAxesYCoords,
            bottomAxesYCoords,
            legend = this.get("legend"),
            graphRect = {};

        if(leftAxesCollection)
        {
            leftAxesXCoords = [];
            l = leftAxesCollection.length;
            for(i = l - 1; i > -1; --i)
            {
                leftAxesXCoords.unshift(leftPaneWidth);
                leftPaneWidth += leftAxesCollection[i].get("width");
            }
        }
        if(rightAxesCollection)
        {
            rightAxesXCoords = [];
            l = rightAxesCollection.length;
            i = 0;
            for(i = l - 1; i > -1; --i)
            {
                rightPaneWidth += rightAxesCollection[i].get("width");
                rightAxesXCoords.unshift(w - rightPaneWidth);
            }
        }
        if(topAxesCollection)
        {
            topAxesYCoords = [];
            l = topAxesCollection.length;
            for(i = l - 1; i > -1; --i)
            {
                topAxesYCoords.unshift(topPaneHeight);
                topPaneHeight += topAxesCollection[i].get("height");
            }
        }
        if(bottomAxesCollection)
        {
            bottomAxesYCoords = [];
            l = bottomAxesCollection.length;
            for(i = l - 1; i > -1; --i)
            {
                bottomPaneHeight += bottomAxesCollection[i].get("height");
                bottomAxesYCoords.unshift(h - bottomPaneHeight);
            }
        }

        graphWidth = w - (leftPaneWidth + rightPaneWidth);
        graphHeight = h - (bottomPaneHeight + topPaneHeight);
        graphRect.left = leftPaneWidth;
        graphRect.top = topPaneHeight;
        graphRect.bottom = h - bottomPaneHeight;
        graphRect.right = w - rightPaneWidth;
        if(!allowContentOverflow)
        {
            topOverflow = this._getTopOverflow(leftAxesCollection, rightAxesCollection);
            bottomOverflow = this._getBottomOverflow(leftAxesCollection, rightAxesCollection);
            leftOverflow = this._getLeftOverflow(bottomAxesCollection, topAxesCollection);
            rightOverflow = this._getRightOverflow(bottomAxesCollection, topAxesCollection);

            diff = topOverflow - topPaneHeight;
            if(diff > 0)
            {
                graphRect.top = topOverflow;
                if(topAxesYCoords)
                {
                    i = 0;
                    l = topAxesYCoords.length;
                    for(; i < l; ++i)
                    {
                        topAxesYCoords[i] += diff;
                    }
                }
            }

            diff = bottomOverflow - bottomPaneHeight;
            if(diff > 0)
            {
                graphRect.bottom = h - bottomOverflow;
                if(bottomAxesYCoords)
                {
                    i = 0;
                    l = bottomAxesYCoords.length;
                    for(; i < l; ++i)
                    {
                        bottomAxesYCoords[i] -= diff;
                    }
                }
            }

            diff = leftOverflow - leftPaneWidth;
            if(diff > 0)
            {
                graphRect.left = leftOverflow;
                if(leftAxesXCoords)
                {
                    i = 0;
                    l = leftAxesXCoords.length;
                    for(; i < l; ++i)
                    {
                        leftAxesXCoords[i] += diff;
                    }
                }
            }

            diff = rightOverflow - rightPaneWidth;
            if(diff > 0)
            {
                graphRect.right = w - rightOverflow;
                if(rightAxesXCoords)
                {
                    i = 0;
                    l = rightAxesXCoords.length;
                    for(; i < l; ++i)
                    {
                        rightAxesXCoords[i] -= diff;
                    }
                }
            }
        }
        graphWidth = graphRect.right - graphRect.left;
        graphHeight = graphRect.bottom - graphRect.top;
        graphX = graphRect.left;
        graphY = graphRect.top;
        if(legend)
        {
            if(legend.get("includeInChartLayout"))
            {
                switch(legend.get("position"))
                {
                    case "left" :
                        legend.set("y", graphY);
                        legend.set("height", graphHeight);
                    break;
                    case "top" :
                        legend.set("x", graphX);
                        legend.set("width", graphWidth);
                    break;
                    case "bottom" :
                        legend.set("x", graphX);
                        legend.set("width", graphWidth);
                    break;
                    case "right" :
                        legend.set("y", graphY);
                        legend.set("height", graphHeight);
                    break;
                }
            }
        }
        if(topAxesCollection)
        {
            l = topAxesCollection.length;
            i = 0;
            for(; i < l; i++)
            {
                axis = topAxesCollection[i];
                if(axis.get("width") !== graphWidth)
                {
                    axis.set("width", graphWidth);
                }
                axis.get("boundingBox").setStyle("left", graphX + PX);
                axis.get("boundingBox").setStyle("top", topAxesYCoords[i] + PX);
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        if(bottomAxesCollection)
        {
            l = bottomAxesCollection.length;
            i = 0;
            for(; i < l; i++)
            {
                axis = bottomAxesCollection[i];
                if(axis.get("width") !== graphWidth)
                {
                    axis.set("width", graphWidth);
                }
                axis.get("boundingBox").setStyle("left", graphX + PX);
                axis.get("boundingBox").setStyle("top", bottomAxesYCoords[i] + PX);
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        if(leftAxesCollection)
        {
            l = leftAxesCollection.length;
            i = 0;
            for(; i < l; ++i)
            {
                axis = leftAxesCollection[i];
                axis.get("boundingBox").setStyle("top", graphY + PX);
                axis.get("boundingBox").setStyle("left", leftAxesXCoords[i] + PX);
                if(axis.get("height") !== graphHeight)
                {
                    axis.set("height", graphHeight);
                }
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        if(rightAxesCollection)
        {
            l = rightAxesCollection.length;
            i = 0;
            for(; i < l; ++i)
            {
                axis = rightAxesCollection[i];
                axis.get("boundingBox").setStyle("top", graphY + PX);
                axis.get("boundingBox").setStyle("left", rightAxesXCoords[i] + PX);
                if(axis.get("height") !== graphHeight)
                {
                    axis.set("height", graphHeight);
                }
            }
            if(axis._hasDataOverflow())
            {
                graphOverflow = "hidden";
            }
        }
        this._drawing = false;
        if(this._callLater)
        {
            this._redraw();
            return;
        }
        if(graph)
        {
            graph.get("boundingBox").setStyle("left", graphX + PX);
            graph.get("boundingBox").setStyle("top", graphY + PX);
            graph.set("width", graphWidth);
            graph.set("height", graphHeight);
            graph.get("boundingBox").setStyle("overflow", graphOverflow);
        }

        if(this._overlay)
        {
            this._overlay.setStyle("left", graphX + PX);
            this._overlay.setStyle("top", graphY + PX);
            this._overlay.setStyle("width", graphWidth + PX);
            this._overlay.setStyle("height", graphHeight + PX);
        }
    },

    /**
     * Positions the legend in a chart and returns the properties of the legend to be used in the
     * chart's layout algorithm.
     *
     * @method _getLayoutDimensions
     * @return {Object} The left, top, right and bottom values for the legend.
     * @protected
     */
    _getLayoutBoxDimensions: function()
    {
        var box = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            legend = this.get("legend"),
            position,
            direction,
            dimension,
            size,
            w = this.get(WIDTH),
            h = this.get(HEIGHT),
            gap;
        if(legend && legend.get("includeInChartLayout"))
        {
            gap = legend.get("styles").gap;
            position = legend.get(POSITION);
            if(position != EXTERNAL)
            {
                direction = legend.get("direction");
                dimension = direction == HORIZONTAL ? HEIGHT : WIDTH;
                size = legend.get(dimension);
                box[position] = size + gap;
                switch(position)
                {
                    case TOP :
                        legend.set(_Y, 0);
                    break;
                    case BOTTOM :
                        legend.set(_Y, h - size);
                    break;
                    case RIGHT :
                        legend.set(_X, w - size);
                    break;
                    case LEFT:
                        legend.set(_X, 0);
                    break;
                }
            }
        }
        return box;
    },

    /**
     * Destructor implementation for the CartesianChart class. Calls destroy on all axes, series, legend (if available) and the Graph instance.
     * Removes the tooltip and overlay HTML elements.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        var legend = this.get("legend");
        if(legend)
        {
            legend.destroy(true);
        }
    }
}, {
    ATTRS: {
        legend: LEGEND
    }
});

Y.CartesianChart = CartesianChartLegend;

var PieChartLegend = Y.Base.create("pieChartLegend", Y.PieChart, [], {
    /**
     * Redraws the chart instance.
     *
     * @method _redraw
     * @private
     */
    _redraw: function()
    {
        if(this._drawing)
        {
            this._callLater = true;
            return;
        }
        this._drawing = true;
        this._callLater = false;
        var graph = this.get("graph"),
            w = this.get("width"),
            h = this.get("height"),
            graphWidth,
            graphHeight,
            legend = this.get("legend"),
            x = 0,
            y = 0,
            legendX = 0,
            legendY = 0,
            legendWidth,
            legendHeight,
            dimension,
            gap,
            position,
            direction;
        if(graph)
        {
            if(legend)
            {
                position = legend.get("position");
                direction = legend.get("direction");
                graphWidth = graph.get("width");
                graphHeight = graph.get("height");
                legendWidth = legend.get("width");
                legendHeight = legend.get("height");
                gap = legend.get("styles").gap;

                if((direction == "vertical" && (graphWidth + legendWidth + gap !== w)) || (direction == "horizontal" &&  (graphHeight + legendHeight + gap !== h)))
                {
                    switch(legend.get("position"))
                    {
                        case LEFT :
                            dimension = Math.min(w - (legendWidth + gap), h);
                            legendHeight = h;
                            x = legendWidth + gap;
                            legend.set(HEIGHT, legendHeight);
                        break;
                        case TOP :
                            dimension = Math.min(h - (legendHeight + gap), w);
                            legendWidth = w;
                            y = legendHeight + gap;
                            legend.set(WIDTH, legendWidth);
                        break;
                        case RIGHT :
                            dimension = Math.min(w - (legendWidth + gap), h);
                            legendHeight = h;
                            legendX = dimension + gap;
                            legend.set(HEIGHT, legendHeight);
                        break;
                        case BOTTOM :
                            dimension = Math.min(h - (legendHeight + gap), w);
                            legendWidth = w;
                            legendY = dimension + gap;
                            legend.set(WIDTH, legendWidth);
                        break;
                    }
                    graph.set(WIDTH, dimension);
                    graph.set(HEIGHT, dimension);
                }
                else
                {
                    switch(legend.get("position"))
                    {
                        case LEFT :
                            x = legendWidth + gap;
                        break;
                        case TOP :
                            y = legendHeight + gap;
                        break;
                        case RIGHT :
                            legendX = graphWidth + gap;
                        break;
                        case BOTTOM :
                            legendY = graphHeight + gap;
                        break;
                    }
                }
            }
            else
            {
                graph.set(_X, 0);
                graph.set(_Y, 0);
                graph.set(WIDTH, w);
                graph.set(HEIGHT, h);
            }
        }
        this._drawing = false;
        if(this._callLater)
        {
            this._redraw();
            return;
        }
        if(graph)
        {
            graph.set(_X, x);
            graph.set(_Y, y);
        }
        if(legend)
        {
            legend.set(_X, legendX);
            legend.set(_Y, legendY);
        }
    }
}, {
    ATTRS: {
        /**
         * The legend for the chart.
         *
         * @attribute
         * @type Legend
         */
        legend: LEGEND
    }
});
Y.PieChart = PieChartLegend;
/**
 * ChartLegend provides a legend for a chart.
 *
 * @class ChartLegend
 * @module charts
 * @submodule charts-legend
 * @extends Widget
 */
Y.ChartLegend = Y.Base.create("chartlegend", Y.Widget, [Y.Renderer], {
    /**
     * Initializes the chart.
     *
     * @method initializer
     * @private
     */
    initializer: function()
    {
        this._items = [];
    },

    /**
     * @method renderUI
     * @private
     */
    renderUI: function()
    {
        var bb = this.get("boundingBox"),
            cb = this.get("contentBox"),
            styles = this.get("styles").background,
            background = new Y.Rect({
                graphic: cb,
                fill: styles.fill,
                stroke: styles.border
            });
        bb.setStyle("display", "block");
        bb.setStyle("position", "absolute");
        this.set("background", background);
    },

    /**
     * @method bindUI
     * @private
     */
    bindUI: function()
    {
        this.get("chart").after("seriesCollectionChange", Y.bind(this._updateHandler, this));
        this.after("stylesChange", this._updateHandler);
        this.after("positionChange", this._positionChangeHandler);
        this.after("widthChange", this._handleSizeChange);
        this.after("heightChange", this._handleSizeChange);
    },

    /**
     * @method syncUI
     * @private
     */
    syncUI: function()
    {
        var w = this.get("width"),
            h = this.get("height");
        if(isFinite(w) && isFinite(h) && w > 0 && h > 0)
        {
            this._drawLegend();
        }
    },

    /**
     * Handles changes to legend.
     *
     * @method _updateHandler
     * @param {Object} e Event object
     * @private
     */
    _updateHandler: function(e)
    {
        if(this.get("rendered"))
        {
            this._drawLegend();
        }
    },

    /**
     * Handles position changes.
     *
     * @method _positionChangeHandler
     * @param {Object} e Event object
     * @private
     */
    _positionChangeHandler: function(e)
    {
        var chart = this.get("chart"),
            parentNode = this._parentNode;
        if(parentNode && ((chart && this.get("includeInChartLayout"))))
        {
            this.fire("legendRendered");
        }
        else if(this.get("rendered"))
        {
            this._drawLegend();
        }
    },

    /**
     * Updates the legend when the size changes.
     *
     * @method _handleSizeChange
     * @param {Object} e Event object.
     * @private
     */
    _handleSizeChange: function(e)
    {
        var attrName = e.attrName,
            pos = this.get(POSITION),
            vert = pos == LEFT || pos == RIGHT,
            hor = pos == BOTTOM || pos == TOP;
        if((hor && attrName == WIDTH) || (vert && attrName == HEIGHT))
        {
            this._drawLegend();
        }
    },

    /**
     * Draws the legend
     *
     * @method _drawLegend
     * @private
     */
    _drawLegend: function()
    {
        if(this._drawing)
        {
            this._callLater = true;
            return;
        }
        this._drawing = true;
        this._callLater = false;
        if(this.get("includeInChartLayout"))
        {
            this.get("chart")._itemRenderQueue.unshift(this);
        }
        var chart = this.get("chart"),
            node = this.get("contentBox"),
            seriesCollection = chart.get("seriesCollection"),
            series,
            styles = this.get("styles"),
            padding = styles.padding,
            itemStyles = styles.item,
            seriesStyles,
            hSpacing = itemStyles.hSpacing,
            vSpacing = itemStyles.vSpacing,
            hAlign = styles.hAlign,
            vAlign = styles.vAlign,
            marker = styles.marker,
            labelStyles = itemStyles.label,
            displayName,
            layout = this._layout[this.get("direction")],
            i,
            len,
            isArray,
            shape,
            shapeClass,
            item,
            fill,
            border,
            fillColors,
            borderColors,
            borderWeight,
            items = [],
            markerWidth = marker.width,
            markerHeight = marker.height,
            totalWidth = 0 - hSpacing,
            totalHeight = 0 - vSpacing,
            maxWidth = 0,
            maxHeight = 0,
            itemWidth,
            itemHeight;
        if(marker && marker.shape)
        {
            shape = marker.shape;
        }
        this._destroyLegendItems();
        if(chart instanceof Y.PieChart)
        {
            series = seriesCollection[0];
            displayName = series.get("categoryAxis").getDataByKey(series.get("categoryKey"));
            seriesStyles = series.get("styles").marker;
            fillColors = seriesStyles.fill.colors;
            borderColors = seriesStyles.border.colors;
            borderWeight = seriesStyles.border.weight;
            i = 0;
            len = displayName.length;
            shape = shape || Y.Circle;
            isArray = Y.Lang.isArray(shape);
            for(; i < len; ++i)
            {
                shape = isArray ? shape[i] : shape;
                fill = {
                    color: fillColors[i]
                };
                border = {
                    colors: borderColors[i],
                    weight: borderWeight
                };
                displayName = chart.getSeriesItems(series, i).category.value;
                item = this._getLegendItem(node, this._getShapeClass(shape), fill, border, labelStyles, markerWidth, markerHeight, displayName);
                itemWidth = item.width;
                itemHeight = item.height;
                maxWidth = Math.max(maxWidth, itemWidth);
                maxHeight = Math.max(maxHeight, itemHeight);
                totalWidth += itemWidth + hSpacing;
                totalHeight += itemHeight + vSpacing;
                items.push(item);
            }
        }
        else
        {
            i = 0;
            len = seriesCollection.length;
            for(; i < len; ++i)
            {
                series = seriesCollection[i];
                seriesStyles = this._getStylesBySeriesType(series, shape);
                if(!shape)
                {
                    shape = seriesStyles.shape;
                    if(!shape)
                    {
                        shape = Y.Circle;
                    }
                }
                shapeClass = Y.Lang.isArray(shape) ? shape[i] : shape;
                item = this._getLegendItem(node, this._getShapeClass(shape), seriesStyles.fill, seriesStyles.border, labelStyles, markerWidth, markerHeight, series.get("valueDisplayName"));
                itemWidth = item.width;
                itemHeight = item.height;
                maxWidth = Math.max(maxWidth, itemWidth);
                maxHeight = Math.max(maxHeight, itemHeight);
                totalWidth += itemWidth + hSpacing;
                totalHeight += itemHeight + vSpacing;
                items.push(item);
            }
        }
        this._drawing = false;
        if(this._callLater)
        {
            this._drawLegend();
        }
        else
        {
            layout._positionLegendItems.apply(this, [items, maxWidth, maxHeight, totalWidth, totalHeight, padding, hSpacing, vSpacing, hAlign, vAlign]);
            this._updateBackground(styles);
            this.fire("legendRendered");
        }
    },

    /**
     * Updates the background for the legend.
     *
     * @method _updateBackground
     * @param {Object} styles Reference to the legend's styles attribute
     * @private
     */
    _updateBackground: function(styles)
    {
        var backgroundStyles = styles.background,
            contentRect = this._contentRect,
            padding = styles.padding,
            x = contentRect.left - padding.left,
            y = contentRect.top - padding.top,
            w = contentRect.right - x + padding.right,
            h = contentRect.bottom - y + padding.bottom;
        this.get("background").set({
            fill: backgroundStyles.fill,
            stroke: backgroundStyles.border,
            width: w,
            height: h,
            x: x,
            y: y
        });
    },

    /**
     * Retrieves the marker styles based on the type of series. For series that contain a marker, the marker styles are returned.
     *
     * @method _getStylesBySeriesType
     * @param {CartesianSeries | PieSeries} The series in which the style properties will be received.
     * @return Object An object containing fill, border and shape information.
     * @private
     */
    _getStylesBySeriesType: function(series)
    {
        var styles = series.get("styles"),
            color;
        if(series instanceof Y.LineSeries || series instanceof Y.StackedLineSeries)
        {
            styles = series.get("styles").line;
            color = styles.color || series._getDefaultColor(series.get("graphOrder"), "line");
            return {
                border: {
                    weight: 1,
                    color: color
                },
                fill: {
                    color: color
                }
            };
        }
        else if(series instanceof Y.AreaSeries || series instanceof Y.StackedAreaSeries)
        {
            styles = series.get("styles").area;
            color = styles.color || series._getDefaultColor(series.get("graphOrder"), "slice");
            return {
                border: {
                    weight: 1,
                    color: color
                },
                fill: {
                    color: color
                }
            };
        }
        else
        {
            styles = series.get("styles").marker;
            return {
                fill: styles.fill,

                border: {
                    weight: styles.border.weight,

                    color: styles.border.color,

                    shape: styles.shape
                },
                shape: styles.shape
            };
        }
    },

    /**
     * Returns a legend item consisting of the following properties:
     *  <dl>
     *    <dt>node</dt><dd>The `Node` containing the legend item elements.</dd>
     *      <dt>shape</dt><dd>The `Shape` element for the legend item.</dd>
     *      <dt>textNode</dt><dd>The `Node` containing the text></dd>
     *      <dt>text</dt><dd></dd>
     *  </dl>
     *
     * @method _getLegendItem
     * @param {Node} shapeProps Reference to the `node` attribute.
     * @param {String | Class} shapeClass The type of shape
     * @param {Object} fill Properties for the shape's fill
     * @param {Object} border Properties for the shape's border
     * @param {String} text String to be rendered as the legend's text
     * @param {Number} width Total width of the legend item
     * @param {Number} height Total height of the legend item
     * @param {HTML | String} text Text for the legendItem
     * @return Object
     * @private
     */
    _getLegendItem: function(node, shapeClass, fill, border, labelStyles, w, h, text)
    {
        var containerNode = Y.one(DOCUMENT.createElement("div")),
            textField = Y.one(DOCUMENT.createElement("span")),
            shape,
            dimension,
            padding,
            left,
            item;
        containerNode.setStyle(POSITION, "absolute");
        textField.setStyle(POSITION, "absolute");
        textField.setStyles(labelStyles);
        textField.appendChild(DOCUMENT.createTextNode(text));
        containerNode.appendChild(textField);
        node.appendChild(containerNode);
        dimension = textField.get("offsetHeight");
        padding = dimension - h;
        left = w + padding + 2;
        textField.setStyle("left", left + PX);
        containerNode.setStyle("height", dimension + PX);
        containerNode.setStyle("width", (left + textField.get("offsetWidth")) + PX);
        shape = new shapeClass({
            fill: fill,
            stroke: border,
            width: w,
            height: h,
            x: padding * 0.5,
            y: padding * 0.5,
            w: w,
            h: h,
            graphic: containerNode
        });
        textField.setStyle("left", dimension + PX);
        item = {
            node: containerNode,
            width: containerNode.get("offsetWidth"),
            height: containerNode.get("offsetHeight"),
            shape: shape,
            textNode: textField,
            text: text
        };
        this._items.push(item);
        return item;
    },

    /**
     * Evaluates and returns correct class for drawing a shape.
     *
     * @method _getShapeClass
     * @return Shape
     * @private
     */
    _getShapeClass: function()
    {
        var graphic = this.get("background").get("graphic");
        return graphic._getShapeClass.apply(graphic, arguments);
    },

    /**
     * Returns the default hash for the `styles` attribute.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function()
    {
        var styles = {
            padding: {
                top: 8,
                right: 8,
                bottom: 8,
                left: 9
            },
            gap: 10,
            hAlign: "center",
            vAlign: "top",
            marker: this._getPlotDefaults(),
            item: {
                hSpacing: 10,
                vSpacing: 5,
                label: {
                    color:"#808080",
                    fontSize:"85%",
                    whiteSpace: "nowrap"
                }
            },
            background: {
                shape: "rect",
                fill:{
                    color:"#faf9f2"
                },
                border: {
                    color:"#dad8c9",
                    weight: 1
                }
            }
        };
        return styles;
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
            width: 10,
            height: 10
        };
        return defs;
    },

    /**
     * Destroys legend items.
     *
     * @method _destroyLegendItems
     * @private
     */
    _destroyLegendItems: function()
    {
        var item;
        if(this._items)
        {
            while(this._items.length > 0)
            {
                item = this._items.shift();
                item.shape.get("graphic").destroy();
                item.node.empty();
                item.node.destroy(true);
                item.node = null;
                item = null;
            }
        }
        this._items = [];
    },

    /**
     * Maps layout classes.
     *
     * @property _layout
     * @private
     */
    _layout: {
        vertical: VerticalLegendLayout,
        horizontal: HorizontalLegendLayout
    },

    /**
     * Destructor implementation ChartLegend class. Removes all items and the Graphic instance from the widget.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        var background = this.get("background"),
            backgroundGraphic;
        this._destroyLegendItems();
        if(background)
        {
            backgroundGraphic = background.get("graphic");
            if(backgroundGraphic)
            {
                backgroundGraphic.destroy();
            }
            else
            {
                background.destroy();
            }
        }

    }
}, {
    ATTRS: {
        /**
         * Indicates whether the chart's contentBox is the parentNode for the legend.
         *
         * @attribute includeInChartLayout
         * @type Boolean
         * @private
         */
        includeInChartLayout: {
            value: false
        },

        /**
         * Reference to the `Chart` instance.
         *
         * @attribute chart
         * @type Chart
         */
        chart: {
            setter: function(val)
            {
                this.after("legendRendered", Y.bind(val._itemRendered, val));
                return val;
            }
        },

        /**
         * Indicates the direction in relation of the legend's layout. The `direction` of the legend is determined by its
         * `position` value.
         *
         * @attribute direction
         * @type String
         */
        direction: {
            value: "vertical"
        },

        /**
         * Indicates the position and direction of the legend. Possible values are `left`, `top`, `right` and `bottom`. Values of `left` and
         * `right` values have a `direction` of `vertical`. Values of `top` and `bottom` values have a `direction` of `horizontal`.
         *
         * @attribute position
         * @type String
         */
        position: {
            lazyAdd: false,

            value: "right",

            setter: function(val)
            {
                if(val == TOP || val == BOTTOM)
                {
                    this.set("direction", HORIZONTAL);
                }
                else if(val == LEFT || val == RIGHT)
                {
                    this.set("direction", VERTICAL);
                }
                return val;
            }
        },

        /**
         * The width of the legend. Depending on the implementation of the ChartLegend, this value is `readOnly`.
         * By default, the legend is included in the layout of the `Chart` that it references. Under this circumstance,
         * `width` is always `readOnly`. When the legend is rendered in its own dom element, the `readOnly` status is
         * determined by the direction of the legend. If the `position` is `left` or `right` or the `direction` is
         * `vertical`, width is `readOnly`. If the position is `top` or `bottom` or the `direction` is `horizontal`,
         * width can be explicitly set. If width is not explicitly set, the width will be determined by the width of the
         * legend's parent element.
         *
         * @attribute width
         * @type Number
         */
        width: {
            getter: function()
            {
                var chart = this.get("chart"),
                    parentNode = this._parentNode;
                if(parentNode)
                {
                    if((chart && this.get("includeInChartLayout")) || this._width)
                    {
                        if(!this._width)
                        {
                            this._width = 0;
                        }
                        return this._width;
                    }
                    else
                    {
                        return parentNode.get("offsetWidth");
                    }
                }
                return "";
            },

            setter: function(val)
            {
                this._width = val;
                return val;
            }
        },

        /**
         * The height of the legend. Depending on the implementation of the ChartLegend, this value is `readOnly`.
         * By default, the legend is included in the layout of the `Chart` that it references. Under this circumstance,
         * `height` is always `readOnly`. When the legend is rendered in its own dom element, the `readOnly` status is
         * determined by the direction of the legend. If the `position` is `top` or `bottom` or the `direction` is
         * `horizontal`, height is `readOnly`. If the position is `left` or `right` or the `direction` is `vertical`,
         * height can be explicitly set. If height is not explicitly set, the height will be determined by the width of the
         * legend's parent element.
         *
         * @attribute height
         * @type Number
         */
        height: {
            valueFn: "_heightGetter",

            getter: function()
            {
                var chart = this.get("chart"),
                    parentNode = this._parentNode;
                if(parentNode)
                {
                    if((chart && this.get("includeInChartLayout")) || this._height)
                    {
                        if(!this._height)
                        {
                            this._height = 0;
                        }
                        return this._height;
                    }
                    else
                    {
                        return parentNode.get("offsetHeight");
                    }
                }
                return "";
            },

            setter: function(val)
            {
                this._height = val;
                return val;
            }
        },

        /**
         * Indicates the x position of legend.
         *
         * @attribute x
         * @type Number
         * @readOnly
         */
        x: {
            lazyAdd: false,

            value: 0,

            setter: function(val)
            {
                var node = this.get("boundingBox");
                if(node)
                {
                    node.setStyle(LEFT, val + PX);
                }
                return val;
            }
        },

        /**
         * Indicates the y position of legend.
         *
         * @attribute y
         * @type Number
         * @readOnly
         */
        y: {
            lazyAdd: false,

            value: 0,

            setter: function(val)
            {
                var node = this.get("boundingBox");
                if(node)
                {
                    node.setStyle(TOP, val + PX);
                }
                return val;
            }
        },

        /**
         * Array of items contained in the legend. Each item is an object containing the following properties:
         *
         * <dl>
         *      <dt>node</dt><dd>Node containing text for the legend item.</dd>
         *      <dt>marker</dt><dd>Shape for the legend item.</dd>
         * </dl>
         *
         * @attribute items
         * @type Array
         * @readOnly
         */
        items: {
            getter: function()
            {
                return this._items;
            }
        },

        /**
         * Background for the legend.
         *
         * @attribute background
         * @type Rect
         */
        background: {}

        /**
         * Properties used to display and style the ChartLegend.  This attribute is inherited from `Renderer`.
         * Below are the default values:
         *
         *  <dl>
         *      <dt>gap</dt><dd>Distance, in pixels, between the `ChartLegend` instance and the chart's content. When `ChartLegend`
         *      is rendered within a `Chart` instance this value is applied.</dd>
         *      <dt>hAlign</dt><dd>Defines the horizontal alignment of the `items` in a `ChartLegend` rendered in a horizontal direction.
         *      This value is applied when the instance's `position` is set to top or bottom. This attribute can be set to left, center
         *      or right. The default value is center.</dd>
         *      <dt>vAlign</dt><dd>Defines the vertical alignment of the `items` in a `ChartLegend` rendered in vertical direction. This
         *      value is applied when the instance's `position` is set to left or right. The attribute can be set to top, middle or
         *      bottom. The default value is middle.</dd>
         *      <dt>item</dt><dd>Set of style properties applied to the `items` of the `ChartLegend`.
         *          <dl>
         *              <dt>hSpacing</dt><dd>Horizontal distance, in pixels, between legend `items`.</dd>
         *              <dt>vSpacing</dt><dd>Vertical distance, in pixels, between legend `items`.</dd>
         *              <dt>label</dt><dd>Properties for the text of an `item`.
         *                  <dl>
         *                      <dt>color</dt><dd>Color of the text. The default values is "#808080".</dd>
         *                      <dt>fontSize</dt><dd>Font size for the text. The default value is "85%".</dd>
         *                  </dl>
         *              </dd>
         *              <dt>marker</dt><dd>Properties for the `item` markers.
         *                  <dl>
         *                      <dt>width</dt><dd>Specifies the width of the markers.</dd>
         *                      <dt>height</dt><dd>Specifies the height of the markers.</dd>
         *                  </dl>
         *              </dd>
         *          </dl>
         *      </dd>
         *      <dt>background</dt><dd>Properties for the `ChartLegend` background.
         *          <dl>
         *              <dt>fill</dt><dd>Properties for the background fill.
         *                  <dl>
         *                      <dt>color</dt><dd>Color for the fill. The default value is "#faf9f2".</dd>
         *                  </dl>
         *              </dd>
         *              <dt>border</dt><dd>Properties for the background border.
         *                  <dl>
         *                      <dt>color</dt><dd>Color for the border. The default value is "#dad8c9".</dd>
         *                      <dt>weight</dt><dd>Weight of the border. The default values is 1.</dd>
         *                  </dl>
         *              </dd>
         *          </dl>
         *      </dd>
         * </dl>
         *
         * @attribute styles
         * @type Object
         */
    }
});
/**
 * The Chart class is the basic application used to create a chart.
 *
 * @module charts
 * @class Chart
 * @constructor
 */
function Chart(cfg)
{
    if(cfg.type != "pie")
    {
        return new Y.CartesianChart(cfg);
    }
    else
    {
        return new Y.PieChart(cfg);
    }
}
Y.Chart = Chart;


}, '3.8.1', {"requires": ["charts-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add("lang/console_en",function(e){e.Intl.add("console","en",{title:"Log Console",pause:"Pause",clear:"Clear",collapse:"Collapse",expand:"Expand"})},"3.8.1");
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('console', function (Y, NAME) {

/**
 * Console creates a visualization for messages logged through calls to a YUI
 * instance's <code>Y.log( message, category, source )</code> method.  The
 * debug versions of YUI modules will include logging statements to offer some
 * insight into the steps executed during that module's operation.  Including
 * log statements in your code will cause those messages to also appear in the
 * Console.  Use Console to aid in developing your page or application.
 *
 * Entry categories &quot;info&quot;, &quot;warn&quot;, and &quot;error&quot;
 * are also referred to as the log level, and entries are filtered against the
 * configured logLevel.
 *
 * @module console
 * @class Console
 * @extends Widget
 * @param conf {Object} Configuration object (see Configuration attributes)
 * @constructor
 */
var getCN = Y.ClassNameManager.getClassName,
    CHECKED        = 'checked',
    CLEAR          = 'clear',
    CLICK          = 'click',
    COLLAPSED      = 'collapsed',
    CONSOLE        = 'console',
    CONTENT_BOX    = 'contentBox',
    DISABLED       = 'disabled',
    ENTRY          = 'entry',
    ERROR          = 'error',
    HEIGHT         = 'height',
    INFO           = 'info',
    LAST_TIME      = 'lastTime',
    PAUSE          = 'pause',
    PAUSED         = 'paused',
    RESET          = 'reset',
    START_TIME     = 'startTime',
    TITLE          = 'title',
    WARN           = 'warn',

    DOT = '.',

    C_BUTTON           = getCN(CONSOLE,'button'),
    C_CHECKBOX         = getCN(CONSOLE,'checkbox'),
    C_CLEAR            = getCN(CONSOLE,CLEAR),
    C_COLLAPSE         = getCN(CONSOLE,'collapse'),
    C_COLLAPSED        = getCN(CONSOLE,COLLAPSED),
    C_CONSOLE_CONTROLS = getCN(CONSOLE,'controls'),
    C_CONSOLE_HD       = getCN(CONSOLE,'hd'),
    C_CONSOLE_BD       = getCN(CONSOLE,'bd'),
    C_CONSOLE_FT       = getCN(CONSOLE,'ft'),
    C_CONSOLE_TITLE    = getCN(CONSOLE,TITLE),
    C_ENTRY            = getCN(CONSOLE,ENTRY),
    C_ENTRY_CAT        = getCN(CONSOLE,ENTRY,'cat'),
    C_ENTRY_CONTENT    = getCN(CONSOLE,ENTRY,'content'),
    C_ENTRY_META       = getCN(CONSOLE,ENTRY,'meta'),
    C_ENTRY_SRC        = getCN(CONSOLE,ENTRY,'src'),
    C_ENTRY_TIME       = getCN(CONSOLE,ENTRY,'time'),
    C_PAUSE            = getCN(CONSOLE,PAUSE),
    C_PAUSE_LABEL      = getCN(CONSOLE,PAUSE,'label'),

    RE_INLINE_SOURCE = /^(\S+)\s/,
    RE_AMP = /&(?!#?[a-z0-9]+;)/g,
    RE_GT  = />/g,
    RE_LT  = /</g,

    ESC_AMP = '&#38;',
    ESC_GT  = '&#62;',
    ESC_LT  = '&#60;',
    
    ENTRY_TEMPLATE_STR =
        '<div class="{entry_class} {cat_class} {src_class}">'+
            '<p class="{entry_meta_class}">'+
                '<span class="{entry_src_class}">'+
                    '{sourceAndDetail}'+
                '</span>'+
                '<span class="{entry_cat_class}">'+
                    '{category}</span>'+
                '<span class="{entry_time_class}">'+
                    ' {totalTime}ms (+{elapsedTime}) {localTime}'+
                '</span>'+
            '</p>'+
            '<pre class="{entry_content_class}">{message}</pre>'+
        '</div>',

    L = Y.Lang,
    create     = Y.Node.create,
    isNumber   = L.isNumber,
    isString   = L.isString,
    merge      = Y.merge,
    substitute = Y.Lang.sub;
    

function Console() {
    Console.superclass.constructor.apply(this,arguments);
}

Y.Console = Y.extend(Console, Y.Widget,

// Y.Console prototype
{
    /**
     * Category to prefix all event subscriptions to allow for ease of detach
     * during destroy.
     *
     * @property _evtCat
     * @type string
     * @protected
     */
    _evtCat : null,

    /**
     * Reference to the Node instance containing the header contents.
     *
     * @property _head
     * @type Node
     * @default null
     * @protected
     */
    _head    : null,

    /**
     * Reference to the Node instance that will house the console messages.
     *
     * @property _body
     * @type Node
     * @default null
     * @protected
     */
    _body    : null,

    /**
     * Reference to the Node instance containing the footer contents.
     *
     * @property _foot
     * @type Node
     * @default null
     * @protected
     */
    _foot    : null,

    /**
     * Holds the object API returned from <code>Y.later</code> for the print
     * loop interval.
     *
     * @property _printLoop
     * @type Object
     * @default null
     * @protected
     */
    _printLoop : null,

    /**
     * Array of normalized message objects awaiting printing.
     *
     * @property buffer
     * @type Array
     * @default null
     * @protected
     */
    buffer   : null,

    /**
     * Wrapper for <code>Y.log</code>.
     *
     * @method log
     * @param arg* {MIXED} (all arguments passed through to <code>Y.log</code>)
     * @chainable
     */
    log : function () {
        Y.log.apply(Y,arguments);

        return this;
    },

    /**
     * Clear the console of messages and flush the buffer of pending messages.
     *
     * @method clearConsole
     * @chainable
     */
    clearConsole : function () {
        // TODO: clear event listeners from console contents
        this._body.empty();

        this._cancelPrintLoop();

        this.buffer = [];

        return this;
    },

    /**
     * Clears the console and resets internal timers.
     *
     * @method reset
     * @chainable
     */
    reset : function () {
        this.fire(RESET);
        
        return this;
    },

    /**
     * Collapses the body and footer.
     *
     * @method collapse
     * @chainable
     */
    collapse : function () {
        this.set(COLLAPSED, true);

        return this;
    },

    /**
     * Expands the body and footer if collapsed.
     *
     * @method expand
     * @chainable
     */
    expand : function () {
        this.set(COLLAPSED, false);

        return this;
    },

    /**
     * Outputs buffered messages to the console UI.  This is typically called
     * from a scheduled interval until the buffer is empty (referred to as the
     * print loop).  The number of buffered messages output to the Console is
     * limited to the number provided as an argument.  If no limit is passed,
     * all buffered messages are rendered.
     * 
     * @method printBuffer
     * @param limit {Number} (optional) max number of buffered entries to write
     * @chainable
     */
    printBuffer: function (limit) {
        var messages    = this.buffer,
            debug       = Y.config.debug,
            entries     = [],
            consoleLimit= this.get('consoleLimit'),
            newestOnTop = this.get('newestOnTop'),
            anchor      = newestOnTop ? this._body.get('firstChild') : null,
            i;

        if (messages.length > consoleLimit) {
            messages.splice(0, messages.length - consoleLimit);
        }

        limit = Math.min(messages.length, (limit || messages.length));
        
        // turn off logging system
        Y.config.debug = false;

        if (!this.get(PAUSED) && this.get('rendered')) {

            for (i = 0; i < limit && messages.length; ++i) {
                entries[i] = this._createEntryHTML(messages.shift());
            }

            if (!messages.length) {
                this._cancelPrintLoop();
            }

            if (entries.length) {
                if (newestOnTop) {
                    entries.reverse();
                }

                this._body.insertBefore(create(entries.join('')), anchor);

                if (this.get('scrollIntoView')) {
                    this.scrollToLatest();
                }

                this._trimOldEntries();
            }
        }

        // restore logging system
        Y.config.debug = debug;

        return this;
    },

    
    /**
     * Constructor code.  Set up the buffer and entry template, publish
     * internal events, and subscribe to the configured logEvent.
     * 
     * @method initializer
     * @protected
     */
    initializer : function () {
        this._evtCat = Y.stamp(this) + '|';

        this.buffer = [];

        this.get('logSource').on(this._evtCat +
            this.get('logEvent'),Y.bind("_onLogEvent",this));

        /**
         * Transfers a received message to the print loop buffer.  Default
         * behavior defined in _defEntryFn.
         *
         * @event entry
         * @param event {Event.Facade} An Event Facade object with the following attribute specific properties added:
         *  <dl>
         *      <dt>message</dt>
         *          <dd>The message data normalized into an object literal (see _normalizeMessage)</dd>
         *  </dl>
         * @preventable _defEntryFn
         */
        this.publish(ENTRY, { defaultFn: this._defEntryFn });

        /**
         * Triggers the reset behavior via the default logic in _defResetFn.
         *
         * @event reset
         * @param event {Event.Facade} Event Facade object
         * @preventable _defResetFn
         */
        this.publish(RESET, { defaultFn: this._defResetFn });

        this.after('rendered', this._schedulePrint);
    },

    /**
     * Tears down the instance, flushing event subscriptions and purging the UI.
     *
     * @method destructor
     * @protected
     */
    destructor : function () {
        var bb = this.get('boundingBox');

        this._cancelPrintLoop();

        this.get('logSource').detach(this._evtCat + '*');
        
        bb.purge(true);
    },

    /**
     * Generate the Console UI.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        this._initHead();
        this._initBody();
        this._initFoot();

        // Apply positioning to the bounding box if appropriate
        var style = this.get('style');
        if (style !== 'block') {
            this.get('boundingBox').addClass(this.getClassName(style));
        }
    },

    /**
     * Sync the UI state to the current attribute state.
     *
     * @method syncUI
     */
    syncUI : function () {
        this._uiUpdatePaused(this.get(PAUSED));
        this._uiUpdateCollapsed(this.get(COLLAPSED));
        this._uiSetHeight(this.get(HEIGHT));
    },

    /**
     * Set up event listeners to wire up the UI to the internal state.
     *
     * @method bindUI
     * @protected
     */
    bindUI : function () {
        this.get(CONTENT_BOX).one('button.'+C_COLLAPSE).
            on(CLICK,this._onCollapseClick,this);

        this.get(CONTENT_BOX).one('input[type=checkbox].'+C_PAUSE).
            on(CLICK,this._onPauseClick,this);

        this.get(CONTENT_BOX).one('button.'+C_CLEAR).
            on(CLICK,this._onClearClick,this);

        // Attribute changes
        this.after(this._evtCat + 'stringsChange',
            this._afterStringsChange);
        this.after(this._evtCat + 'pausedChange',
            this._afterPausedChange);
        this.after(this._evtCat + 'consoleLimitChange',
            this._afterConsoleLimitChange);
        this.after(this._evtCat + 'collapsedChange',
            this._afterCollapsedChange);
    },

    
    /**
     * Create the DOM structure for the header elements.
     *
     * @method _initHead
     * @protected
     */
    _initHead : function () {
        var cb   = this.get(CONTENT_BOX),
            info = merge(Console.CHROME_CLASSES, {
                        str_collapse : this.get('strings.collapse'),
                        str_title : this.get('strings.title')
                    });

        this._head = create(substitute(Console.HEADER_TEMPLATE,info));

        cb.insertBefore(this._head,cb.get('firstChild'));
    },

    /**
     * Create the DOM structure for the console body&#8212;where messages are
     * rendered.
     *
     * @method _initBody
     * @protected
     */
    _initBody : function () {
        this._body = create(substitute(
                            Console.BODY_TEMPLATE,
                            Console.CHROME_CLASSES));

        this.get(CONTENT_BOX).appendChild(this._body);
    },

    /**
     * Create the DOM structure for the footer elements.
     *
     * @method _initFoot
     * @protected
     */
    _initFoot : function () {
        var info = merge(Console.CHROME_CLASSES, {
                id_guid   : Y.guid(),
                str_pause : this.get('strings.pause'),
                str_clear : this.get('strings.clear')
            });

        this._foot = create(substitute(Console.FOOTER_TEMPLATE,info));

        this.get(CONTENT_BOX).appendChild(this._foot);
    },

    /**
     * Determine if incoming log messages are within the configured logLevel
     * to be buffered for printing.
     *
     * @method _isInLogLevel
     * @protected
     */
    _isInLogLevel : function (e) {
        var cat = e.cat, lvl = this.get('logLevel');

        if (lvl !== INFO) {
            cat = cat || INFO;

            if (isString(cat)) {
                cat = cat.toLowerCase();
            }

            if ((cat === WARN && lvl === ERROR) ||
                (cat === INFO && lvl !== INFO)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Create a log entry message from the inputs including the following keys:
     * <ul>
     *     <li>time - this moment</li>
     *     <li>message - leg message</li>
     *     <li>category - logLevel or custom category for the message</li>
     *     <li>source - when provided, the widget or util calling Y.log</li>
     *     <li>sourceAndDetail - same as source but can include instance info</li>
     *     <li>localTime - readable version of time</li>
     *     <li>elapsedTime - ms since last entry</li>
     *     <li>totalTime - ms since Console was instantiated or reset</li>
     * </ul>
     *
     * @method _normalizeMessage
     * @param e {Event} custom event containing the log message
     * @return Object the message object
     * @protected
     */
    _normalizeMessage : function (e) {

        var msg = e.msg,
            cat = e.cat,
            src = e.src,

            m = {
                time            : new Date(),
                message         : msg,
                category        : cat || this.get('defaultCategory'),
                sourceAndDetail : src || this.get('defaultSource'),
                source          : null,
                localTime       : null,
                elapsedTime     : null,
                totalTime       : null
            };

        // Extract m.source "Foo" from m.sourceAndDetail "Foo bar baz"
        m.source          = RE_INLINE_SOURCE.test(m.sourceAndDetail) ?
                                RegExp.$1 : m.sourceAndDetail;
        m.localTime       = m.time.toLocaleTimeString ? 
                            m.time.toLocaleTimeString() : (m.time + '');
        m.elapsedTime     = m.time - this.get(LAST_TIME);
        m.totalTime       = m.time - this.get(START_TIME);

        this._set(LAST_TIME,m.time);

        return m;
    },

    /**
     * Sets an interval for buffered messages to be output to the console.
     *
     * @method _schedulePrint
     * @protected
     */
    _schedulePrint : function () {
        if (!this._printLoop && !this.get(PAUSED) && this.get('rendered')) {
            this._printLoop = Y.later(
                                this.get('printTimeout'),
                                this, this.printBuffer,
                                this.get('printLimit'), true);
        }
    },

    /**
     * Translates message meta into the markup for a console entry.
     *
     * @method _createEntryHTML
     * @param m {Object} object literal containing normalized message metadata
     * @return String
     * @protected
     */
    _createEntryHTML : function (m) {
        m = merge(
                this._htmlEscapeMessage(m),
                Console.ENTRY_CLASSES,
                {
                    cat_class : this.getClassName(ENTRY,m.category),
                    src_class : this.getClassName(ENTRY,m.source)
                });

        return this.get('entryTemplate').replace(/\{(\w+)\}/g,
            function (_,token) {
                return token in m ? m[token] : '';
            });
    },

    /**
     * Scrolls to the most recent entry
     *
     * @method scrollToLatest
     * @chainable
     */
    scrollToLatest : function () {
        var scrollTop = this.get('newestOnTop') ?
                            0 :
                            this._body.get('scrollHeight');

        this._body.set('scrollTop', scrollTop);
    },

    /**
     * Performs HTML escaping on strings in the message object.
     *
     * @method _htmlEscapeMessage
     * @param m {Object} the normalized message object
     * @return Object the message object with proper escapement
     * @protected
     */
    _htmlEscapeMessage : function (m) {
        m.message         = this._encodeHTML(m.message);
        m.source          = this._encodeHTML(m.source);
        m.sourceAndDetail = this._encodeHTML(m.sourceAndDetail);
        m.category        = this._encodeHTML(m.category);

        return m;
    },

    /**
     * Removes the oldest message entries from the UI to maintain the limit
     * specified in the consoleLimit configuration.
     *
     * @method _trimOldEntries
     * @protected
     */
    _trimOldEntries : function () {
        // Turn off the logging system for the duration of this operation
        // to prevent an infinite loop
        Y.config.debug = false;

        var bd = this._body,
            limit = this.get('consoleLimit'),
            debug = Y.config.debug,
            entries,e,i,l;

        if (bd) {
            entries = bd.all(DOT+C_ENTRY);
            l = entries.size() - limit;

            if (l > 0) {
                if (this.get('newestOnTop')) {
                    i = limit;
                    l = entries.size();
                } else {
                    i = 0;
                }

                this._body.setStyle('display','none');

                for (;i < l; ++i) {
                    e = entries.item(i);
                    if (e) {
                        e.remove();
                    }
                }

                this._body.setStyle('display','');
            }

        }

        Y.config.debug = debug;
    },

    /**
     * Returns the input string with ampersands (&amp;), &lt, and &gt; encoded
     * as HTML entities.
     *
     * @method _encodeHTML
     * @param s {String} the raw string
     * @return String the encoded string
     * @protected
     */
    _encodeHTML : function (s) {
        return isString(s) ?
            s.replace(RE_AMP,ESC_AMP).
              replace(RE_LT, ESC_LT).
              replace(RE_GT, ESC_GT) :
            s;
    },

    /**
     * Clears the timeout for printing buffered messages.
     *
     * @method _cancelPrintLoop
     * @protected
     */
    _cancelPrintLoop : function () {
        if (this._printLoop) {
            this._printLoop.cancel();
            this._printLoop = null;
        }
    },

    /**
     * Validates input value for style attribute.  Accepts only values 'inline',
     * 'block', and 'separate'.
     *
     * @method _validateStyle
     * @param style {String} the proposed value
     * @return {Boolean} pass/fail
     * @protected
     */
    _validateStyle : function (style) {
        return style === 'inline' || style === 'block' || style === 'separate';
    },

    /**
     * Event handler for clicking on the Pause checkbox to update the paused
     * attribute.
     *
     * @method _onPauseClick
     * @param e {Event} DOM event facade for the click event
     * @protected
     */
    _onPauseClick : function (e) {
        this.set(PAUSED,e.target.get(CHECKED));
    },

    /**
     * Event handler for clicking on the Clear button.  Pass-through to
     * <code>this.clearConsole()</code>.
     *
     * @method _onClearClick
     * @param e {Event} DOM event facade for the click event
     * @protected
     */
    _onClearClick : function (e) {
        this.clearConsole();
    },

    /**
     * Event handler for clicking on the Collapse/Expand button. Sets the
     * &quot;collapsed&quot; attribute accordingly.
     *
     * @method _onCollapseClick
     * @param e {Event} DOM event facade for the click event
     * @protected
     */
    _onCollapseClick : function (e) {
        this.set(COLLAPSED, !this.get(COLLAPSED));
    },


    /**
     * Validator for logSource attribute.
     *
     * @method _validateLogSource
     * @param v {Object} the desired logSource
     * @return {Boolean} true if the input is an object with an <code>on</code>
     *                   method
     * @protected
     */
    _validateLogSource: function (v) {
        return v && Y.Lang.isFunction(v.on);
    },

    /**
     * Setter method for logLevel attribute.  Acceptable values are
     * &quot;error&quot, &quot;warn&quot, and &quot;info&quot (case
     * insensitive).  Other values are treated as &quot;info&quot;.
     *
     * @method _setLogLevel
     * @param v {String} the desired log level
     * @return String One of Console.LOG_LEVEL_INFO, _WARN, or _ERROR
     * @protected
     */
    _setLogLevel : function (v) {
        if (isString(v)) {
            v = v.toLowerCase();
        }
        
        return (v === WARN || v === ERROR) ? v : INFO;
    },

    /**
     * Getter method for useBrowserConsole attribute.  Just a pass through to
     * the YUI instance configuration setting.
     *
     * @method _getUseBrowserConsole
     * @return {Boolean} or null if logSource is not a YUI instance
     * @protected
     */
    _getUseBrowserConsole: function () {
        var logSource = this.get('logSource');
        return logSource instanceof YUI ?
            logSource.config.useBrowserConsole : null;
    },

    /**
     * Setter method for useBrowserConsole attributes.  Only functional if the
     * logSource attribute points to a YUI instance.  Passes the value down to
     * the YUI instance.  NOTE: multiple Console instances cannot maintain
     * independent useBrowserConsole values, since it is just a pass through to
     * the YUI instance configuration.
     *
     * @method _setUseBrowserConsole
     * @param v {Boolean} false to disable browser console printing (default)
     * @return {Boolean} true|false if logSource is a YUI instance
     * @protected
     */
    _setUseBrowserConsole: function (v) {
        var logSource = this.get('logSource');
        if (logSource instanceof YUI) {
            v = !!v;
            logSource.config.useBrowserConsole = v;
            return v;
        } else {
            return Y.Attribute.INVALID_VALUE;
        }
    },

    /**
     * Set the height of the Console container.  Set the body height to the
     * difference between the configured height and the calculated heights of
     * the header and footer.
     * Overrides Widget.prototype._uiSetHeight.
     *
     * @method _uiSetHeight
     * @param v {String|Number} the new height
     * @protected
     */
    _uiSetHeight : function (v) {
        Console.superclass._uiSetHeight.apply(this,arguments);

        if (this._head && this._foot) {
            var h = this.get('boundingBox').get('offsetHeight') -
                    this._head.get('offsetHeight') -
                    this._foot.get('offsetHeight');

            this._body.setStyle(HEIGHT,h+'px');
        }
    },

    /**
     * Over-ride default content box sizing to do nothing, since we're sizing
     * the body section to fill out height ourselves.
     * 
     * @method _uiSizeCB
     * @protected
     */
    _uiSizeCB : function() {
        // Do Nothing. Ideally want to move to Widget-StdMod, which accounts for
        // _uiSizeCB        
    },

    /**
     * Updates the UI if changes are made to any of the strings in the strings
     * attribute.
     *
     * @method _afterStringsChange
     * @param e {Event} Custom event for the attribute change
     * @protected
     */
    _afterStringsChange : function (e) {
        var prop   = e.subAttrName ? e.subAttrName.split(DOT)[1] : null,
            cb     = this.get(CONTENT_BOX),
            before = e.prevVal,
            after  = e.newVal;

        if ((!prop || prop === TITLE) && before.title !== after.title) {
            cb.all(DOT+C_CONSOLE_TITLE).setHTML(after.title);
        }

        if ((!prop || prop === PAUSE) && before.pause !== after.pause) {
            cb.all(DOT+C_PAUSE_LABEL).setHTML(after.pause);
        }

        if ((!prop || prop === CLEAR) && before.clear !== after.clear) {
            cb.all(DOT+C_CLEAR).set('value',after.clear);
        }
    },

    /**
     * Updates the UI and schedules or cancels the print loop.
     *
     * @method _afterPausedChange
     * @param e {Event} Custom event for the attribute change
     * @protected
     */
    _afterPausedChange : function (e) {
        var paused = e.newVal;

        if (e.src !== Y.Widget.SRC_UI) {
            this._uiUpdatePaused(paused);
        }

        if (!paused) {
            this._schedulePrint();
        } else if (this._printLoop) {
            this._cancelPrintLoop();
        }
    },

    /**
     * Checks or unchecks the paused checkbox
     *
     * @method _uiUpdatePaused
     * @param on {Boolean} the new checked state
     * @protected
     */
    _uiUpdatePaused : function (on) {
        var node = this._foot.all('input[type=checkbox].'+C_PAUSE);

        if (node) {
            node.set(CHECKED,on);
        }
    },

    /**
     * Calls this._trimOldEntries() in response to changes in the configured
     * consoleLimit attribute.
     * 
     * @method _afterConsoleLimitChange
     * @param e {Event} Custom event for the attribute change
     * @protected
     */
    _afterConsoleLimitChange : function () {
        this._trimOldEntries();
    },


    /**
     * Updates the className of the contentBox, which should trigger CSS to
     * hide or show the body and footer sections depending on the new value.
     *
     * @method _afterCollapsedChange
     * @param e {Event} Custom event for the attribute change
     * @protected
     */
    _afterCollapsedChange : function (e) {
        this._uiUpdateCollapsed(e.newVal);
    },

    /**
     * Updates the UI to reflect the new Collapsed state
     *
     * @method _uiUpdateCollapsed
     * @param v {Boolean} true for collapsed, false for expanded
     * @protected
     */
    _uiUpdateCollapsed : function (v) {
        var bb     = this.get('boundingBox'),
            button = bb.all('button.'+C_COLLAPSE),
            method = v ? 'addClass' : 'removeClass',
            str    = this.get('strings.'+(v ? 'expand' : 'collapse'));

        bb[method](C_COLLAPSED);

        if (button) {
            button.setHTML(str);
        }

        this._uiSetHeight(v ? this._head.get('offsetHeight'): this.get(HEIGHT));
    },

    /**
     * Makes adjustments to the UI if needed when the Console is hidden or shown
     *
     * @method _afterVisibleChange
     * @param e {Event} the visibleChange event
     * @protected
     */
    _afterVisibleChange : function (e) {
        Console.superclass._afterVisibleChange.apply(this,arguments);

        this._uiUpdateFromHideShow(e.newVal);
    },

    /**
     * Recalculates dimensions and updates appropriately when shown
     *
     * @method _uiUpdateFromHideShow
     * @param v {Boolean} true for visible, false for hidden
     * @protected
     */
    _uiUpdateFromHideShow : function (v) {
        if (v) {
            this._uiSetHeight(this.get(HEIGHT));
        }
    },

    /**
     * Responds to log events by normalizing qualifying messages and passing
     * them along through the entry event for buffering etc.
     * 
     * @method _onLogEvent
     * @param msg {String} the log message
     * @param cat {String} OPTIONAL the category or logLevel of the message
     * @param src {String} OPTIONAL the source of the message (e.g. widget name)
     * @protected
     */
    _onLogEvent : function (e) {

        if (!this.get(DISABLED) && this._isInLogLevel(e)) {

            var debug = Y.config.debug;

            /* TODO: needed? */
            Y.config.debug = false;

            this.fire(ENTRY, {
                message : this._normalizeMessage(e)
            });

            Y.config.debug = debug;
        }
    },

    /**
     * Clears the console, resets the startTime attribute, enables and
     * unpauses the widget.
     *
     * @method _defResetFn
     * @protected
     */
    _defResetFn : function () {
        this.clearConsole();
        this.set(START_TIME,new Date());
        this.set(DISABLED,false);
        this.set(PAUSED,false);
    },

    /**
     * Buffers incoming message objects and schedules the printing.
     *
     * @method _defEntryFn
     * @param e {Event} The Custom event carrying the message in its payload
     * @protected
     */
    _defEntryFn : function (e) {
        if (e.message) {
            this.buffer.push(e.message);
            this._schedulePrint();
        }
    }

},

// Y.Console static properties
{
    /**
     * The identity of the widget.
     *
     * @property NAME
     * @type String
     * @static
     */
    NAME : CONSOLE,

    /**
     * Static identifier for logLevel configuration setting to allow all
     * incoming messages to generate Console entries.
     *
     * @property LOG_LEVEL_INFO
     * @type String
     * @static
     */
    LOG_LEVEL_INFO  : INFO,

    /**
     * Static identifier for logLevel configuration setting to allow only
     * incoming messages of logLevel &quot;warn&quot; or &quot;error&quot;
     * to generate Console entries.
     *
     * @property LOG_LEVEL_WARN
     * @type String
     * @static
     */
    LOG_LEVEL_WARN  : WARN,

    /**
     * Static identifier for logLevel configuration setting to allow only
     * incoming messages of logLevel &quot;error&quot; to generate
     * Console entries.
     *
     * @property LOG_LEVEL_ERROR
     * @type String
     * @static
     */
    LOG_LEVEL_ERROR : ERROR,

    /**
     * Map (object) of classNames used to populate the placeholders in the
     * Console.ENTRY_TEMPLATE markup when rendering a new Console entry.
     *
     * <p>By default, the keys contained in the object are:</p>
     * <ul>
     *    <li>entry_class</li>
     *    <li>entry_meta_class</li>
     *    <li>entry_cat_class</li>
     *    <li>entry_src_class</li>
     *    <li>entry_time_class</li>
     *    <li>entry_content_class</li>
     * </ul>
     *
     * @property ENTRY_CLASSES
     * @type Object
     * @static
     */
    ENTRY_CLASSES   : {
        entry_class         : C_ENTRY,
        entry_meta_class    : C_ENTRY_META,
        entry_cat_class     : C_ENTRY_CAT,
        entry_src_class     : C_ENTRY_SRC,
        entry_time_class    : C_ENTRY_TIME,
        entry_content_class : C_ENTRY_CONTENT
    },

    /**
     * Map (object) of classNames used to populate the placeholders in the
     * Console.HEADER_TEMPLATE, Console.BODY_TEMPLATE, and
     * Console.FOOTER_TEMPLATE markup when rendering the Console UI.
     *
     * <p>By default, the keys contained in the object are:</p>
     * <ul>
     *   <li>console_hd_class</li>
     *   <li>console_bd_class</li>
     *   <li>console_ft_class</li>
     *   <li>console_controls_class</li>
     *   <li>console_checkbox_class</li>
     *   <li>console_pause_class</li>
     *   <li>console_pause_label_class</li>
     *   <li>console_button_class</li>
     *   <li>console_clear_class</li>
     *   <li>console_collapse_class</li>
     *   <li>console_title_class</li>
     * </ul>
     *
     * @property CHROME_CLASSES
     * @type Object
     * @static
     */
    CHROME_CLASSES  : {
        console_hd_class       : C_CONSOLE_HD,
        console_bd_class       : C_CONSOLE_BD,
        console_ft_class       : C_CONSOLE_FT,
        console_controls_class : C_CONSOLE_CONTROLS,
        console_checkbox_class : C_CHECKBOX,
        console_pause_class    : C_PAUSE,
        console_pause_label_class : C_PAUSE_LABEL,
        console_button_class   : C_BUTTON,
        console_clear_class    : C_CLEAR,
        console_collapse_class : C_COLLAPSE,
        console_title_class    : C_CONSOLE_TITLE
    },

    /**
     * Markup template used to generate the DOM structure for the header
     * section of the Console when it is rendered.  The template includes
     * these {placeholder}s:
     *
     * <ul>
     *   <li>console_button_class - contributed by Console.CHROME_CLASSES</li>
     *   <li>console_collapse_class - contributed by Console.CHROME_CLASSES</li>
     *   <li>console_hd_class - contributed by Console.CHROME_CLASSES</li>
     *   <li>console_title_class - contributed by Console.CHROME_CLASSES</li>
     *   <li>str_collapse - pulled from attribute strings.collapse</li>
     *   <li>str_title - pulled from attribute strings.title</li>
     * </ul>
     *
     * @property HEADER_TEMPLATE
     * @type String
     * @static
     */
    HEADER_TEMPLATE :
        '<div class="{console_hd_class}">'+
            '<h4 class="{console_title_class}">{str_title}</h4>'+
            '<button type="button" class="'+
                '{console_button_class} {console_collapse_class}">{str_collapse}'+
            '</button>'+
        '</div>',

    /**
     * Markup template used to generate the DOM structure for the Console body
     * (where the messages are inserted) when it is rendered.  The template
     * includes only the {placeholder} &quot;console_bd_class&quot;, which is
     * constributed by Console.CHROME_CLASSES.
     *
     * @property BODY_TEMPLATE
     * @type String
     * @static
     */
    BODY_TEMPLATE : '<div class="{console_bd_class}"></div>',

    /**
     * Markup template used to generate the DOM structure for the footer
     * section of the Console when it is rendered.  The template includes
     * many of the {placeholder}s from Console.CHROME_CLASSES as well as:
     *
     * <ul>
     *   <li>id_guid - generated unique id, relates the label and checkbox</li>
     *   <li>str_pause - pulled from attribute strings.pause</li>
     *   <li>str_clear - pulled from attribute strings.clear</li>
     * </ul>
     *
     * @property FOOTER_TEMPLATE
     * @type String
     * @static
     */
    FOOTER_TEMPLATE :
        '<div class="{console_ft_class}">'+
            '<div class="{console_controls_class}">'+
                '<label class="{console_pause_label_class}"><input type="checkbox" class="{console_checkbox_class} {console_pause_class}" value="1" id="{id_guid}"> {str_pause}</label>' +
                '<button type="button" class="'+
                    '{console_button_class} {console_clear_class}">{str_clear}'+
                '</button>'+
            '</div>'+
        '</div>',

    /**
     * Default markup template used to create the DOM structure for Console
     * entries. The markup contains {placeholder}s for content and classes
     * that are replaced via Y.Lang.sub.  The default template contains
     * the {placeholder}s identified in Console.ENTRY_CLASSES as well as the
     * following placeholders that will be populated by the log entry data:
     *
     * <ul>
     *   <li>cat_class</li>
     *   <li>src_class</li>
     *   <li>totalTime</li>
     *   <li>elapsedTime</li>
     *   <li>localTime</li>
     *   <li>sourceAndDetail</li>
     *   <li>message</li>
     * </ul>
     *
     * @property ENTRY_TEMPLATE
     * @type String
     * @static
     */
    ENTRY_TEMPLATE : ENTRY_TEMPLATE_STR,

    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property ATTRS
     * @Type Object
     * @static
     */
    ATTRS : {

        /**
         * Name of the custom event that will communicate log messages.
         *
         * @attribute logEvent
         * @type String
         * @default "yui:log"
         */
        logEvent : {
            value : 'yui:log',
            writeOnce : true,
            validator : isString
        },

        /**
         * Object that will emit the log events.  By default the YUI instance.
         * To have a single Console capture events from all YUI instances, set
         * this to the Y.Global object.
         *
         * @attribute logSource
         * @type EventTarget
         * @default Y
         */
        logSource : {
            value : Y,
            writeOnce : true,
            validator : function (v) {
                return this._validateLogSource(v);
            }
        },

        /**
         * Collection of strings used to label elements in the Console UI.
         * Default collection contains the following name:value pairs:
         *
         * <ul>
         *   <li>title : &quot;Log Console&quot;</li>
         *   <li>pause : &quot;Pause&quot;</li>
         *   <li>clear : &quot;Clear&quot;</li>
         *   <li>collapse : &quot;Collapse&quot;</li>
         *   <li>expand : &quot;Expand&quot;</li>
         * </ul>
         *
         * @attribute strings
         * @type Object
         */
        strings : {
            valueFn: function() { return Y.Intl.get("console"); }
        },

        /**
         * Boolean to pause the outputting of new messages to the console.
         * When paused, messages will accumulate in the buffer.
         *
         * @attribute paused
         * @type boolean
         * @default false
         */
        paused : {
            value : false,
            validator : L.isBoolean
        },

        /**
         * If a category is not specified in the Y.log(..) statement, this
         * category will be used. Categories &quot;info&quot;,
         * &quot;warn&quot;, and &quot;error&quot; are also called log level.
         *
         * @attribute defaultCategory
         * @type String
         * @default "info"
         */
        defaultCategory : {
            value : INFO,
            validator : isString
        },

        /**
         * If a source is not specified in the Y.log(..) statement, this
         * source will be used.
         *
         * @attribute defaultSource
         * @type String
         * @default "global"
         */
        defaultSource   : {
            value : 'global',
            validator : isString
        },

        /**
         * Markup template used to create the DOM structure for Console entries.
         *
         * @attribute entryTemplate
         * @type String
         * @default Console.ENTRY_TEMPLATE
         */
        entryTemplate : {
            value : ENTRY_TEMPLATE_STR,
            validator : isString
        },

        /**
         * Minimum entry log level to render into the Console.  The initial
         * logLevel value for all Console instances defaults from the
         * Y.config.logLevel YUI configuration, or Console.LOG_LEVEL_INFO if
         * that configuration is not set.
         *
         * Possible values are &quot;info&quot;, &quot;warn&quot;,
         * &quot;error&quot; (case insensitive), or their corresponding statics
         * Console.LOG_LEVEL_INFO and so on.
         *
         * @attribute logLevel
         * @type String
         * @default Y.config.logLevel or Console.LOG_LEVEL_INFO
         */
        logLevel : {
            value : Y.config.logLevel || INFO,
            setter : function (v) {
                return this._setLogLevel(v);
            }
        },

        /**
         * Millisecond timeout between iterations of the print loop, moving
         * entries from the buffer to the UI.
         *
         * @attribute printTimeout
         * @type Number
         * @default 100
         */
        printTimeout : {
            value : 100,
            validator : isNumber
        },

        /**
         * Maximum number of entries printed in each iteration of the print
         * loop. This is used to prevent excessive logging locking the page UI.
         *
         * @attribute printLimit
         * @type Number
         * @default 50
         */
        printLimit : {
            value : 50,
            validator : isNumber
        },

        /**
         * Maximum number of Console entries allowed in the Console body at one
         * time.  This is used to keep acquired messages from exploding the
         * DOM tree and impacting page performance.
         *
         * @attribute consoleLimit
         * @type Number
         * @default 300
         */
        consoleLimit : {
            value : 300,
            validator : isNumber
        },

        /**
         * New entries should display at the top of the Console or the bottom?
         *
         * @attribute newestOnTop
         * @type Boolean
         * @default true
         */
        newestOnTop : {
            value : true
        },

        /**
         * When new entries are added to the Console UI, should they be
         * scrolled into view?
         *
         * @attribute scrollIntoView
         * @type Boolean
         * @default true
         */
        scrollIntoView : {
            value : true
        },

        /**
         * The baseline time for this Console instance, used to measure elapsed
         * time from the moment the console module is <code>use</code>d to the
         * moment each new entry is logged (not rendered).
         *
         * This value is reset by the instance method myConsole.reset().
         *
         * @attribute startTime
         * @type Date
         * @default The moment the console module is <code>use</code>d
         */
        startTime : {
            value : new Date()
        },

        /**
         * The precise time the last entry was logged.  Used to measure elapsed
         * time between log messages.
         *
         * @attribute lastTime
         * @type Date
         * @default The moment the console module is <code>use</code>d
         */
        lastTime : {
            value : new Date(),
            readOnly: true
        },

        /**
         * Controls the collapsed state of the Console
         *
         * @attribute collapsed
         * @type Boolean
         * @default false
         */
        collapsed : {
            value : false
        },

        /**
        * String with units, or number, representing the height of the Console,
        * inclusive of header and footer. If a number is provided, the default
        * unit, defined by Widget's DEF_UNIT, property is used.
        *
        * @attribute height
        * @default "300px"
        * @type {String | Number}
        */
        height: {
            value: "300px"
        },

        /**
        * String with units, or number, representing the width of the Console.
        * If a number is provided, the default unit, defined by Widget's
        * DEF_UNIT, property is used.
        *
        * @attribute width
        * @default "300px"
        * @type {String | Number}
        */
        width: {
            value: "300px"
        },

        /**
         * Pass through to the YUI instance useBrowserConsole configuration.
         * By default this is set to false, which will disable logging to the
         * browser console when a Console instance is created.  If the
         * logSource is not a YUI instance, this has no effect.
         * 
         * @attribute useBrowserConsole
         * @type {Boolean}
         * @default false
         */
         useBrowserConsole : {
            lazyAdd: false,
            value: false,
            getter : function () {
                return this._getUseBrowserConsole();
            },
            setter : function (v) {
                return this._setUseBrowserConsole(v);
            }
         },

         /**
          * Allows the Console to flow in the document.  Available values are
          * 'inline', 'block', and 'separate' (the default).  
          *
          * @attribute style
          * @type {String}
          * @default 'separate'
          */
         style : {
            value : 'separate',
            writeOnce : true,
            validator : function (v) {
                return this._validateStyle(v);
            }
         }
    }

});


}, '3.8.1', {"requires": ["yui-log", "widget"], "skinnable": true, "lang": ["en", "es", "ja"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('cookie', function (Y, NAME) {

/**
 * Utilities for cookie management
 * @module cookie
 */

    //shortcuts
    var L       = Y.Lang,
        O       = Y.Object,
        NULL    = null,

        //shortcuts to functions
        isString    = L.isString,
        isObject    = L.isObject,
        isUndefined = L.isUndefined,
        isFunction  = L.isFunction,
        encode      = encodeURIComponent,
        decode      = decodeURIComponent,

        //shortcut to document
        doc         = Y.config.doc;

    /*
     * Throws an error message.
     */
    function error(message){
        throw new TypeError(message);
    }

    /*
     * Checks the validity of a cookie name.
     */
    function validateCookieName(name){
        if (!isString(name) || name === ""){
            error("Cookie name must be a non-empty string.");
        }
    }

    /*
     * Checks the validity of a subcookie name.
     */
    function validateSubcookieName(subName){
        if (!isString(subName) || subName === ""){
            error("Subcookie name must be a non-empty string.");
        }
    }

    /**
     * Cookie utility.
     * @class Cookie
     * @static
     */
    Y.Cookie = {

        //-------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------

        /**
         * Creates a cookie string that can be assigned into document.cookie.
         * @param {String} name The name of the cookie.
         * @param {String} value The value of the cookie.
         * @param {Boolean} encodeValue True to encode the value, false to leave as-is.
         * @param {Object} options (Optional) Options for the cookie.
         * @return {String} The formatted cookie string.
         * @method _createCookieString
         * @private
         * @static
         */
        _createCookieString : function (name /*:String*/, value /*:Variant*/, encodeValue /*:Boolean*/, options /*:Object*/) /*:String*/ {

            options = options || {};

            var text /*:String*/ = encode(name) + "=" + (encodeValue ? encode(value) : value),
                expires = options.expires,
                path    = options.path,
                domain  = options.domain;


            if (isObject(options)){
                //expiration date
                if (expires instanceof Date){
                    text += "; expires=" + expires.toUTCString();
                }

                //path
                if (isString(path) && path !== ""){
                    text += "; path=" + path;
                }

                //domain
                if (isString(domain) && domain !== ""){
                    text += "; domain=" + domain;
                }

                //secure
                if (options.secure === true){
                    text += "; secure";
                }
            }

            return text;
        },

        /**
         * Formats a cookie value for an object containing multiple values.
         * @param {Object} hash An object of key-value pairs to create a string for.
         * @return {String} A string suitable for use as a cookie value.
         * @method _createCookieHashString
         * @private
         * @static
         */
        _createCookieHashString : function (hash /*:Object*/) /*:String*/ {
            if (!isObject(hash)){
                error("Cookie._createCookieHashString(): Argument must be an object.");
            }

            var text /*:Array*/ = [];

            O.each(hash, function(value, key){
                if (!isFunction(value) && !isUndefined(value)){
                    text.push(encode(key) + "=" + encode(String(value)));
                }
            });

            return text.join("&");
        },

        /**
         * Parses a cookie hash string into an object.
         * @param {String} text The cookie hash string to parse (format: n1=v1&n2=v2).
         * @return {Object} An object containing entries for each cookie value.
         * @method _parseCookieHash
         * @private
         * @static
         */
        _parseCookieHash : function (text) {

            var hashParts   = text.split("&"),
                hashPart    = NULL,
                hash        = {};

            if (text.length){
                for (var i=0, len=hashParts.length; i < len; i++){
                    hashPart = hashParts[i].split("=");
                    hash[decode(hashPart[0])] = decode(hashPart[1]);
                }
            }

            return hash;
        },

        /**
         * Parses a cookie string into an object representing all accessible cookies.
         * @param {String} text The cookie string to parse.
         * @param {Boolean} shouldDecode (Optional) Indicates if the cookie values should be decoded or not. Default is true.
         * @param {Object} options (Optional) Contains settings for loading the cookie.
         * @return {Object} An object containing entries for each accessible cookie.
         * @method _parseCookieString
         * @private
         * @static
         */
        _parseCookieString : function (text /*:String*/, shouldDecode /*:Boolean*/, options /*:Object*/) /*:Object*/ {

            var cookies /*:Object*/ = {};

            if (isString(text) && text.length > 0) {

                var decodeValue = (shouldDecode === false ? function(s){return s;} : decode),
                    cookieParts = text.split(/;\s/g),
                    cookieName  = NULL,
                    cookieValue = NULL,
                    cookieNameValue = NULL;

                for (var i=0, len=cookieParts.length; i < len; i++){
                    //check for normally-formatted cookie (name-value)
                    cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
                    if (cookieNameValue instanceof Array){
                        try {
                            cookieName = decode(cookieNameValue[1]);
                            cookieValue = decodeValue(cookieParts[i].substring(cookieNameValue[1].length+1));
                        } catch (ex){
                            //intentionally ignore the cookie - the encoding is wrong
                        }
                    } else {
                        //means the cookie does not have an "=", so treat it as a boolean flag
                        cookieName = decode(cookieParts[i]);
                        cookieValue = "";
                    }
                    // don't overwrite an already loaded cookie if set by option
                    if (!isUndefined(options) && options.reverseCookieLoading) {
                        if (isUndefined(cookies[cookieName])) {
                            cookies[cookieName] = cookieValue;
                        }
                    } else {
                        cookies[cookieName] = cookieValue;
                    }
                }

            }

            return cookies;
        },

        /**
         * Sets the document object that the cookie utility uses for setting
         * cookies. This method is necessary to ensure that the cookie utility
         * unit tests can pass even when run on a domain instead of locally.
         * This method should not be used otherwise; you should use
         * <code>Y.config.doc</code> to change the document that the cookie
         * utility uses for everyday purposes.
         * @param {Object} newDoc The object to use as the document.
         * @return {void}
         * @method _setDoc
         * @private
         */
        _setDoc: function(newDoc){
            doc = newDoc;
        },

        //-------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------

        /**
         * Determines if the cookie with the given name exists. This is useful for
         * Boolean cookies (those that do not follow the name=value convention).
         * @param {String} name The name of the cookie to check.
         * @return {Boolean} True if the cookie exists, false if not.
         * @method exists
         * @static
         */
        exists: function(name) {

            validateCookieName(name);   //throws error

            var cookies = this._parseCookieString(doc.cookie, true);

            return cookies.hasOwnProperty(name);
        },

        /**
         * Returns the cookie value for the given name.
         * @param {String} name The name of the cookie to retrieve.
         * @param {Function|Object} options (Optional) An object containing one or more
         *      cookie options: raw (true/false), reverseCookieLoading (true/false)
         *      and converter (a function).
         *      The converter function is run on the value before returning it. The
         *      function is not used if the cookie doesn't exist. The function can be
         *      passed instead of the options object for backwards compatibility. When
         *      raw is set to true, the cookie value is not URI decoded.
         * @return {Variant} If no converter is specified, returns a string or null if
         *      the cookie doesn't exist. If the converter is specified, returns the value
         *      returned from the converter or null if the cookie doesn't exist.
         * @method get
         * @static
         */
        get : function (name, options) {

            validateCookieName(name);   //throws error

            var cookies,
                cookie,
                converter;

            //if options is a function, then it's the converter
            if (isFunction(options)) {
                converter = options;
                options = {};
            } else if (isObject(options)) {
                converter = options.converter;
            } else {
                options = {};
            }

            cookies = this._parseCookieString(doc.cookie, !options.raw, options);
            cookie = cookies[name];

            //should return null, not undefined if the cookie doesn't exist
            if (isUndefined(cookie)) {
                return NULL;
            }

            if (!isFunction(converter)){
                return cookie;
            } else {
                return converter(cookie);
            }
        },

        /**
         * Returns the value of a subcookie.
         * @param {String} name The name of the cookie to retrieve.
         * @param {String} subName The name of the subcookie to retrieve.
         * @param {Function} converter (Optional) A function to run on the value before returning
         *      it. The function is not used if the cookie doesn't exist.
         * @param {Object} options (Optional) Containing one or more settings for cookie parsing.
         * @return {Variant} If the cookie doesn't exist, null is returned. If the subcookie
         *      doesn't exist, null if also returned. If no converter is specified and the
         *      subcookie exists, a string is returned. If a converter is specified and the
         *      subcookie exists, the value returned from the converter is returned.
         * @method getSub
         * @static
         */
        getSub : function (name /*:String*/, subName /*:String*/, converter /*:Function*/, options /*:Object*/) /*:Variant*/ {

            var hash /*:Variant*/ = this.getSubs(name, options);

            if (hash !== NULL) {

                validateSubcookieName(subName);   //throws error

                if (isUndefined(hash[subName])){
                    return NULL;
                }

                if (!isFunction(converter)){
                    return hash[subName];
                } else {
                    return converter(hash[subName]);
                }
            } else {
                return NULL;
            }

        },

        /**
         * Returns an object containing name-value pairs stored in the cookie with the given name.
         * @param {String} name The name of the cookie to retrieve.
         * @param {Object} options (Optional) Containing one or more settings for cookie parsing.
         * @return {Object} An object of name-value pairs if the cookie with the given name
         *      exists, null if it does not.
         * @method getSubs
         * @static
         */
        getSubs : function (name /*:String*/, options /*:Object*/) {

            validateCookieName(name);   //throws error

            var cookies = this._parseCookieString(doc.cookie, false, options);
            if (isString(cookies[name])){
                return this._parseCookieHash(cookies[name]);
            }
            return NULL;
        },

        /**
         * Removes a cookie from the machine by setting its expiration date to
         * sometime in the past.
         * @param {String} name The name of the cookie to remove.
         * @param {Object} options (Optional) An object containing one or more
         *      cookie options: path (a string), domain (a string),
         *      and secure (true/false). The expires option will be overwritten
         *      by the method.
         * @return {String} The created cookie string.
         * @method remove
         * @static
         */
        remove : function (name, options) {

            validateCookieName(name);   //throws error

            //set options
            options = Y.merge(options || {}, {
                expires: new Date(0)
            });

            //set cookie
            return this.set(name, "", options);
        },

        /**
         * Removes a sub cookie with a given name.
         * @param {String} name The name of the cookie in which the subcookie exists.
         * @param {String} subName The name of the subcookie to remove.
         * @param {Object} options (Optional) An object containing one or more
         *      cookie options: path (a string), domain (a string), expires (a Date object),
         *      removeIfEmpty (true/false), and secure (true/false). This must be the same
         *      settings as the original subcookie.
         * @return {String} The created cookie string.
         * @method removeSub
         * @static
         */
        removeSub : function(name, subName, options) {

            validateCookieName(name);   //throws error

            validateSubcookieName(subName);   //throws error

            options = options || {};

            //get all subcookies for this cookie
            var subs = this.getSubs(name);

            //delete the indicated subcookie
            if (isObject(subs) && subs.hasOwnProperty(subName)){
                delete subs[subName];

                if (!options.removeIfEmpty) {
                    //reset the cookie

                    return this.setSubs(name, subs, options);
                } else {
                    //reset the cookie if there are subcookies left, else remove
                    for (var key in subs){
                        if (subs.hasOwnProperty(key) && !isFunction(subs[key]) && !isUndefined(subs[key])){
                            return this.setSubs(name, subs, options);
                        }
                    }

                    return this.remove(name, options);
                }
            } else {
                return "";
            }

        },

        /**
         * Sets a cookie with a given name and value.
         * @param {String} name The name of the cookie to set.
         * @param {Variant} value The value to set for the cookie.
         * @param {Object} options (Optional) An object containing one or more
         *      cookie options: path (a string), domain (a string), expires (a Date object),
         *      secure (true/false), and raw (true/false). Setting raw to true indicates
         *      that the cookie should not be URI encoded before being set.
         * @return {String} The created cookie string.
         * @method set
         * @static
         */
        set : function (name, value, options) {

            validateCookieName(name);   //throws error

            if (isUndefined(value)){
                error("Cookie.set(): Value cannot be undefined.");
            }

            options = options || {};

            var text = this._createCookieString(name, value, !options.raw, options);
            doc.cookie = text;
            return text;
        },

        /**
         * Sets a sub cookie with a given name to a particular value.
         * @param {String} name The name of the cookie to set.
         * @param {String} subName The name of the subcookie to set.
         * @param {Variant} value The value to set.
         * @param {Object} options (Optional) An object containing one or more
         *      cookie options: path (a string), domain (a string), expires (a Date object),
         *      and secure (true/false).
         * @return {String} The created cookie string.
         * @method setSub
         * @static
         */
        setSub : function (name, subName, value, options) {

            validateCookieName(name);   //throws error

            validateSubcookieName(subName);   //throws error

            if (isUndefined(value)){
                error("Cookie.setSub(): Subcookie value cannot be undefined.");
            }

            var hash = this.getSubs(name);

            if (!isObject(hash)){
                hash = {};
            }

            hash[subName] = value;

            return this.setSubs(name, hash, options);

        },

        /**
         * Sets a cookie with a given name to contain a hash of name-value pairs.
         * @param {String} name The name of the cookie to set.
         * @param {Object} value An object containing name-value pairs.
         * @param {Object} options (Optional) An object containing one or more
         *      cookie options: path (a string), domain (a string), expires (a Date object),
         *      and secure (true/false).
         * @return {String} The created cookie string.
         * @method setSubs
         * @static
         */
        setSubs : function (name, value, options) {

            validateCookieName(name);   //throws error

            if (!isObject(value)){
                error("Cookie.setSubs(): Cookie value must be an object.");
            }

            var text /*:String*/ = this._createCookieString(name, this._createCookieHashString(value), false, options);
            doc.cookie = text;
            return text;
        }

    };


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('querystring-stringify-simple', function (Y, NAME) {

/*global Y */
/**
 * <p>Provides Y.QueryString.stringify method for converting objects to Query Strings.
 * This is a subset implementation of the full querystring-stringify.</p>
 * <p>This module provides the bare minimum functionality (encoding a hash of simple values),
 * without the additional support for nested data structures.  Every key-value pair is
 * encoded by encodeURIComponent.</p>
 * <p>This module provides a minimalistic way for io to handle  single-level objects
 * as transaction data.</p>
 *
 * @module querystring
 * @submodule querystring-stringify-simple
 */

var QueryString = Y.namespace("QueryString"),
    EUC = encodeURIComponent;


QueryString.stringify = function (obj, c) {
    var qs = [],
        // Default behavior is false; standard key notation.
        s = c && c.arrayKey ? true : false,
        key, i, l;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (Y.Lang.isArray(obj[key])) {
                for (i = 0, l = obj[key].length; i < l; i++) {
                    qs.push(EUC(s ? key + '[]' : key) + '=' + EUC(obj[key][i]));
                }
            }
            else {
                qs.push(EUC(key) + '=' + EUC(obj[key]));
            }
        }
    }

    return qs.join('&');
};


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('io-base', function (Y, NAME) {

/**
Base IO functionality. Provides basic XHR transport support.

@module io
@submodule io-base
@for IO
**/

var // List of events that comprise the IO event lifecycle.
    EVENTS = ['start', 'complete', 'end', 'success', 'failure', 'progress'],

    // Whitelist of used XHR response object properties.
    XHR_PROPS = ['status', 'statusText', 'responseText', 'responseXML'],

    win = Y.config.win,
    uid = 0;

/**
The IO class is a utility that brokers HTTP requests through a simplified
interface.  Specifically, it allows JavaScript to make HTTP requests to
a resource without a page reload.  The underlying transport for making
same-domain requests is the XMLHttpRequest object.  IO can also use
Flash, if specified as a transport, for cross-domain requests.

@class IO
@constructor
@param {Object} config Object of EventTarget's publish method configurations
                    used to configure IO's events.
**/
function IO (config) {
    var io = this;

    io._uid = 'io:' + uid++;
    io._init(config);
    Y.io._map[io._uid] = io;
}

IO.prototype = {
    //--------------------------------------
    //  Properties
    //--------------------------------------

   /**
    * A counter that increments for each transaction.
    *
    * @property _id
    * @private
    * @type {Number}
    */
    _id: 0,

   /**
    * Object of IO HTTP headers sent with each transaction.
    *
    * @property _headers
    * @private
    * @type {Object}
    */
    _headers: {
        'X-Requested-With' : 'XMLHttpRequest'
    },

   /**
    * Object that stores timeout values for any transaction with a defined
    * "timeout" configuration property.
    *
    * @property _timeout
    * @private
    * @type {Object}
    */
    _timeout: {},

    //--------------------------------------
    //  Methods
    //--------------------------------------

    _init: function(config) {
        var io = this, i, len;

        io.cfg = config || {};

        Y.augment(io, Y.EventTarget);
        for (i = 0, len = EVENTS.length; i < len; ++i) {
            // Publish IO global events with configurations, if any.
            // IO global events are set to broadcast by default.
            // These events use the "io:" namespace.
            io.publish('io:' + EVENTS[i], Y.merge({ broadcast: 1 }, config));
            // Publish IO transaction events with configurations, if
            // any.  These events use the "io-trn:" namespace.
            io.publish('io-trn:' + EVENTS[i], config);
        }
    },

   /**
    * Method that creates a unique transaction object for each request.
    *
    * @method _create
    * @private
    * @param {Object} cfg Configuration object subset to determine if
    *                 the transaction is an XDR or file upload,
    *                 requiring an alternate transport.
    * @param {Number} id Transaction id
    * @return {Object} The transaction object
    */
    _create: function(config, id) {
        var io = this,
            transaction = {
                id : Y.Lang.isNumber(id) ? id : io._id++,
                uid: io._uid
            },
            alt = config.xdr ? config.xdr.use : null,
            form = config.form && config.form.upload ? 'iframe' : null,
            use;

        if (alt === 'native') {
            // Non-IE and IE >= 10  can use XHR level 2 and not rely on an
            // external transport.
            alt = Y.UA.ie && !SUPPORTS_CORS ? 'xdr' : null;

            // Prevent "pre-flight" OPTIONS request by removing the
            // `X-Requested-With` HTTP header from CORS requests. This header
            // can be added back on a per-request basis, if desired.
            io.setHeader('X-Requested-With');
        }

        use = alt || form;
        transaction = use ? Y.merge(Y.IO.customTransport(use), transaction) :
                            Y.merge(Y.IO.defaultTransport(), transaction);

        if (transaction.notify) {
            config.notify = function (e, t, c) { io.notify(e, t, c); };
        }

        if (!use) {
            if (win && win.FormData && config.data instanceof win.FormData) {
                transaction.c.upload.onprogress = function (e) {
                    io.progress(transaction, e, config);
                };
                transaction.c.onload = function (e) {
                    io.load(transaction, e, config);
                };
                transaction.c.onerror = function (e) {
                    io.error(transaction, e, config);
                };
                transaction.upload = true;
            }
        }

        return transaction;
    },

    _destroy: function(transaction) {
        if (win && !transaction.notify && !transaction.xdr) {
            if (XHR && !transaction.upload) {
                transaction.c.onreadystatechange = null;
            } else if (transaction.upload) {
                transaction.c.upload.onprogress = null;
                transaction.c.onload = null;
                transaction.c.onerror = null;
            } else if (Y.UA.ie && !transaction.e) {
                // IE, when using XMLHttpRequest as an ActiveX Object, will throw
                // a "Type Mismatch" error if the event handler is set to "null".
                transaction.c.abort();
            }
        }

        transaction = transaction.c = null;
    },

   /**
    * Method for creating and firing events.
    *
    * @method _evt
    * @private
    * @param {String} eventName Event to be published.
    * @param {Object} transaction Transaction object.
    * @param {Object} config Configuration data subset for event subscription.
    */
    _evt: function(eventName, transaction, config) {
        var io          = this, params,
            args        = config['arguments'],
            emitFacade  = io.cfg.emitFacade,
            globalEvent = "io:" + eventName,
            trnEvent    = "io-trn:" + eventName;

        // Workaround for #2532107
        this.detach(trnEvent);

        if (transaction.e) {
            transaction.c = { status: 0, statusText: transaction.e };
        }

        // Fire event with parameters or an Event Facade.
        params = [ emitFacade ?
            {
                id: transaction.id,
                data: transaction.c,
                cfg: config,
                'arguments': args
            } :
            transaction.id
        ];

        if (!emitFacade) {
            if (eventName === EVENTS[0] || eventName === EVENTS[2]) {
                if (args) {
                    params.push(args);
                }
            } else {
                if (transaction.evt) {
                    params.push(transaction.evt);
                } else {
                    params.push(transaction.c);
                }
                if (args) {
                    params.push(args);
                }
            }
        }

        params.unshift(globalEvent);
        // Fire global events.
        io.fire.apply(io, params);
        // Fire transaction events, if receivers are defined.
        if (config.on) {
            params[0] = trnEvent;
            io.once(trnEvent, config.on[eventName], config.context || Y);
            io.fire.apply(io, params);
        }
    },

   /**
    * Fires event "io:start" and creates, fires a transaction-specific
    * start event, if `config.on.start` is defined.
    *
    * @method start
    * @param {Object} transaction Transaction object.
    * @param {Object} config Configuration object for the transaction.
    */
    start: function(transaction, config) {
       /**
        * Signals the start of an IO request.
        * @event io:start
        */
        this._evt(EVENTS[0], transaction, config);
    },

   /**
    * Fires event "io:complete" and creates, fires a
    * transaction-specific "complete" event, if config.on.complete is
    * defined.
    *
    * @method complete
    * @param {Object} transaction Transaction object.
    * @param {Object} config Configuration object for the transaction.
    */
    complete: function(transaction, config) {
       /**
        * Signals the completion of the request-response phase of a
        * transaction. Response status and data are accessible, if
        * available, in this event.
        * @event io:complete
        */
        this._evt(EVENTS[1], transaction, config);
    },

   /**
    * Fires event "io:end" and creates, fires a transaction-specific "end"
    * event, if config.on.end is defined.
    *
    * @method end
    * @param {Object} transaction Transaction object.
    * @param {Object} config Configuration object for the transaction.
    */
    end: function(transaction, config) {
       /**
        * Signals the end of the transaction lifecycle.
        * @event io:end
        */
        this._evt(EVENTS[2], transaction, config);
        this._destroy(transaction);
    },

   /**
    * Fires event "io:success" and creates, fires a transaction-specific
    * "success" event, if config.on.success is defined.
    *
    * @method success
    * @param {Object} transaction Transaction object.
    * @param {Object} config Configuration object for the transaction.
    */
    success: function(transaction, config) {
       /**
        * Signals an HTTP response with status in the 2xx range.
        * Fires after io:complete.
        * @event io:success
        */
        this._evt(EVENTS[3], transaction, config);
        this.end(transaction, config);
    },

   /**
    * Fires event "io:failure" and creates, fires a transaction-specific
    * "failure" event, if config.on.failure is defined.
    *
    * @method failure
    * @param {Object} transaction Transaction object.
    * @param {Object} config Configuration object for the transaction.
    */
    failure: function(transaction, config) {
       /**
        * Signals an HTTP response with status outside of the 2xx range.
        * Fires after io:complete.
        * @event io:failure
        */
        this._evt(EVENTS[4], transaction, config);
        this.end(transaction, config);
    },

   /**
    * Fires event "io:progress" and creates, fires a transaction-specific
    * "progress" event -- for XMLHttpRequest file upload -- if
    * config.on.progress is defined.
    *
    * @method progress
    * @param {Object} transaction Transaction object.
    * @param {Object} progress event.
    * @param {Object} config Configuration object for the transaction.
    */
    progress: function(transaction, e, config) {
       /**
        * Signals the interactive state during a file upload transaction.
        * This event fires after io:start and before io:complete.
        * @event io:progress
        */
        transaction.evt = e;
        this._evt(EVENTS[5], transaction, config);
    },

   /**
    * Fires event "io:complete" and creates, fires a transaction-specific
    * "complete" event -- for XMLHttpRequest file upload -- if
    * config.on.complete is defined.
    *
    * @method load
    * @param {Object} transaction Transaction object.
    * @param {Object} load event.
    * @param {Object} config Configuration object for the transaction.
    */
    load: function (transaction, e, config) {
        transaction.evt = e.target;
        this._evt(EVENTS[1], transaction, config);
    },

   /**
    * Fires event "io:failure" and creates, fires a transaction-specific
    * "failure" event -- for XMLHttpRequest file upload -- if
    * config.on.failure is defined.
    *
    * @method error
    * @param {Object} transaction Transaction object.
    * @param {Object} error event.
    * @param {Object} config Configuration object for the transaction.
    */
    error: function (transaction, e, config) {
        transaction.evt = e;
        this._evt(EVENTS[4], transaction, config);
    },

   /**
    * Retry an XDR transaction, using the Flash tranport, if the native
    * transport fails.
    *
    * @method _retry
    * @private
    * @param {Object} transaction Transaction object.
    * @param {String} uri Qualified path to transaction resource.
    * @param {Object} config Configuration object for the transaction.
    */
    _retry: function(transaction, uri, config) {
        this._destroy(transaction);
        config.xdr.use = 'flash';
        return this.send(uri, config, transaction.id);
    },

   /**
    * Method that concatenates string data for HTTP GET transactions.
    *
    * @method _concat
    * @private
    * @param {String} uri URI or root data.
    * @param {String} data Data to be concatenated onto URI.
    * @return {String}
    */
    _concat: function(uri, data) {
        uri += (uri.indexOf('?') === -1 ? '?' : '&') + data;
        return uri;
    },

   /**
    * Stores default client headers for all transactions. If a label is
    * passed with no value argument, the header will be deleted.
    *
    * @method setHeader
    * @param {String} name HTTP header
    * @param {String} value HTTP header value
    */
    setHeader: function(name, value) {
        if (value) {
            this._headers[name] = value;
        } else {
            delete this._headers[name];
        }
    },

   /**
    * Method that sets all HTTP headers to be sent in a transaction.
    *
    * @method _setHeaders
    * @private
    * @param {Object} transaction - XHR instance for the specific transaction.
    * @param {Object} headers - HTTP headers for the specific transaction, as
    *                    defined in the configuration object passed to YUI.io().
    */
    _setHeaders: function(transaction, headers) {
        headers = Y.merge(this._headers, headers);
        Y.Object.each(headers, function(value, name) {
            if (value !== 'disable') {
                transaction.setRequestHeader(name, headers[name]);
            }
        });
    },

   /**
    * Starts timeout count if the configuration object has a defined
    * timeout property.
    *
    * @method _startTimeout
    * @private
    * @param {Object} transaction Transaction object generated by _create().
    * @param {Object} timeout Timeout in milliseconds.
    */
    _startTimeout: function(transaction, timeout) {
        var io = this;

        io._timeout[transaction.id] = setTimeout(function() {
            io._abort(transaction, 'timeout');
        }, timeout);
    },

   /**
    * Clears the timeout interval started by _startTimeout().
    *
    * @method _clearTimeout
    * @private
    * @param {Number} id - Transaction id.
    */
    _clearTimeout: function(id) {
        clearTimeout(this._timeout[id]);
        delete this._timeout[id];
    },

   /**
    * Method that determines if a transaction response qualifies as success
    * or failure, based on the response HTTP status code, and fires the
    * appropriate success or failure events.
    *
    * @method _result
    * @private
    * @static
    * @param {Object} transaction Transaction object generated by _create().
    * @param {Object} config Configuration object passed to io().
    */
    _result: function(transaction, config) {
        var status;
        // Firefox will throw an exception if attempting to access
        // an XHR object's status property, after a request is aborted.
        try {
            status = transaction.c.status;
        } catch(e) {
            status = 0;
        }

        // IE reports HTTP 204 as HTTP 1223.
        if (status >= 200 && status < 300 || status === 304 || status === 1223) {
            this.success(transaction, config);
        } else {
            this.failure(transaction, config);
        }
    },

   /**
    * Event handler bound to onreadystatechange.
    *
    * @method _rS
    * @private
    * @param {Object} transaction Transaction object generated by _create().
    * @param {Object} config Configuration object passed to YUI.io().
    */
    _rS: function(transaction, config) {
        var io = this;

        if (transaction.c.readyState === 4) {
            if (config.timeout) {
                io._clearTimeout(transaction.id);
            }

            // Yield in the event of request timeout or abort.
            setTimeout(function() {
                io.complete(transaction, config);
                io._result(transaction, config);
            }, 0);
        }
    },

   /**
    * Terminates a transaction due to an explicit abort or timeout.
    *
    * @method _abort
    * @private
    * @param {Object} transaction Transaction object generated by _create().
    * @param {String} type Identifies timed out or aborted transaction.
    */
    _abort: function(transaction, type) {
        if (transaction && transaction.c) {
            transaction.e = type;
            transaction.c.abort();
        }
    },

   /**
    * Requests a transaction. `send()` is implemented as `Y.io()`.  Each
    * transaction may include a configuration object.  Its properties are:
    *
    * <dl>
    *   <dt>method</dt>
    *     <dd>HTTP method verb (e.g., GET or POST). If this property is not
    *         not defined, the default value will be GET.</dd>
    *
    *   <dt>data</dt>
    *     <dd>This is the name-value string that will be sent as the
    *     transaction data. If the request is HTTP GET, the data become
    *     part of querystring. If HTTP POST, the data are sent in the
    *     message body.</dd>
    *
    *   <dt>xdr</dt>
    *     <dd>Defines the transport to be used for cross-domain requests.
    *     By setting this property, the transaction will use the specified
    *     transport instead of XMLHttpRequest. The properties of the
    *     transport object are:
    *     <dl>
    *       <dt>use</dt>
    *         <dd>The transport to be used: 'flash' or 'native'</dd>
    *       <dt>dataType</dt>
    *         <dd>Set the value to 'XML' if that is the expected response
    *         content type.</dd>
    *     </dl></dd>
    *
    *   <dt>form</dt>
    *     <dd>Form serialization configuration object.  Its properties are:
    *     <dl>
    *       <dt>id</dt>
    *         <dd>Node object or id of HTML form</dd>
    *       <dt>useDisabled</dt>
    *         <dd>`true` to also serialize disabled form field values
    *         (defaults to `false`)</dd>
    *     </dl></dd>
    *
    *   <dt>on</dt>
    *     <dd>Assigns transaction event subscriptions. Available events are:
    *     <dl>
    *       <dt>start</dt>
    *         <dd>Fires when a request is sent to a resource.</dd>
    *       <dt>complete</dt>
    *         <dd>Fires when the transaction is complete.</dd>
    *       <dt>success</dt>
    *         <dd>Fires when the HTTP response status is within the 2xx
    *         range.</dd>
    *       <dt>failure</dt>
    *         <dd>Fires when the HTTP response status is outside the 2xx
    *         range, if an exception occurs, if the transation is aborted,
    *         or if the transaction exceeds a configured `timeout`.</dd>
    *       <dt>end</dt>
    *         <dd>Fires at the conclusion of the transaction
    *            lifecycle, after `success` or `failure`.</dd>
    *     </dl>
    *
    *     <p>Callback functions for `start` and `end` receive the id of the
    *     transaction as a first argument. For `complete`, `success`, and
    *     `failure`, callbacks receive the id and the response object
    *     (usually the XMLHttpRequest instance).  If the `arguments`
    *     property was included in the configuration object passed to
    *     `Y.io()`, the configured data will be passed to all callbacks as
    *     the last argument.</p>
    *     </dd>
    *
    *   <dt>sync</dt>
    *     <dd>Pass `true` to make a same-domain transaction synchronous.
    *     <strong>CAVEAT</strong>: This will negatively impact the user
    *     experience. Have a <em>very</em> good reason if you intend to use
    *     this.</dd>
    *
    *   <dt>context</dt>
    *     <dd>The "`this'" object for all configured event handlers. If a
    *     specific context is needed for individual callbacks, bind the
    *     callback to a context using `Y.bind()`.</dd>
    *
    *   <dt>headers</dt>
    *     <dd>Object map of transaction headers to send to the server. The
    *     object keys are the header names and the values are the header
    *     values.</dd>
    *
    *   <dt>timeout</dt>
    *     <dd>Millisecond threshold for the transaction before being
    *     automatically aborted.</dd>
    *
    *   <dt>arguments</dt>
    *     <dd>User-defined data passed to all registered event handlers.
    *     This value is available as the second argument in the "start" and
    *     "end" event handlers. It is the third argument in the "complete",
    *     "success", and "failure" event handlers. <strong>Be sure to quote
    *     this property name in the transaction configuration as
    *     "arguments" is a reserved word in JavaScript</strong> (e.g.
    *     `Y.io({ ..., "arguments": stuff })`).</dd>
    * </dl>
    *
    * @method send
    * @public
    * @param {String} uri Qualified path to transaction resource.
    * @param {Object} config Configuration object for the transaction.
    * @param {Number} id Transaction id, if already set.
    * @return {Object}
    */
    send: function(uri, config, id) {
        var transaction, method, i, len, sync, data,
            io = this,
            u = uri,
            response = {};

        config = config ? Y.Object(config) : {};
        transaction = io._create(config, id);
        method = config.method ? config.method.toUpperCase() : 'GET';
        sync = config.sync;
        data = config.data;

        // Serialize a map object into a key-value string using
        // querystring-stringify-simple.
        if ((Y.Lang.isObject(data) && !data.nodeType) && !transaction.upload) {
            if (Y.QueryString && Y.QueryString.stringify) {
                config.data = data = Y.QueryString.stringify(data);
            } else {
            }
        }

        if (config.form) {
            if (config.form.upload) {
                // This is a file upload transaction, calling
                // upload() in io-upload-iframe.
                return io.upload(transaction, uri, config);
            } else {
                // Serialize HTML form data into a key-value string.
                data = io._serialize(config.form, data);
            }
        }

        if (data) {
            switch (method) {
                case 'GET':
                case 'HEAD':
                case 'DELETE':
                    u = io._concat(u, data);
                    data = '';
                    break;
                case 'POST':
                case 'PUT':
                    // If Content-Type is defined in the configuration object, or
                    // or as a default header, it will be used instead of
                    // 'application/x-www-form-urlencoded; charset=UTF-8'
                    config.headers = Y.merge({
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }, config.headers);
                    break;
            }
        }

        if (transaction.xdr) {
            // Route data to io-xdr module for flash and XDomainRequest.
            return io.xdr(u, transaction, config);
        }
        else if (transaction.notify) {
            // Route data to custom transport
            return transaction.c.send(transaction, uri, config);
        }

        if (!sync && !transaction.upload) {
            transaction.c.onreadystatechange = function() {
                io._rS(transaction, config);
            };
        }

        try {
            // Determine if request is to be set as
            // synchronous or asynchronous.
            transaction.c.open(method, u, !sync, config.username || null, config.password || null);
            io._setHeaders(transaction.c, config.headers || {});
            io.start(transaction, config);

            // Will work only in browsers that implement the
            // Cross-Origin Resource Sharing draft.
            if (config.xdr && config.xdr.credentials && SUPPORTS_CORS) {
                transaction.c.withCredentials = true;
            }

            // Using "null" with HTTP POST will result in a request
            // with no Content-Length header defined.
            transaction.c.send(data);

            if (sync) {
                // Create a response object for synchronous transactions,
                // mixing id and arguments properties with the xhr
                // properties whitelist.
                for (i = 0, len = XHR_PROPS.length; i < len; ++i) {
                    response[XHR_PROPS[i]] = transaction.c[XHR_PROPS[i]];
                }

                response.getAllResponseHeaders = function() {
                    return transaction.c.getAllResponseHeaders();
                };

                response.getResponseHeader = function(name) {
                    return transaction.c.getResponseHeader(name);
                };

                io.complete(transaction, config);
                io._result(transaction, config);

                return response;
            }
        } catch(e) {
            if (transaction.xdr) {
                // This exception is usually thrown by browsers
                // that do not support XMLHttpRequest Level 2.
                // Retry the request with the XDR transport set
                // to 'flash'.  If the Flash transport is not
                // initialized or available, the transaction
                // will resolve to a transport error.
                return io._retry(transaction, uri, config);
            } else {
                io.complete(transaction, config);
                io._result(transaction, config);
            }
        }

        // If config.timeout is defined, and the request is standard XHR,
        // initialize timeout polling.
        if (config.timeout) {
            io._startTimeout(transaction, config.timeout);
        }

        return {
            id: transaction.id,
            abort: function() {
                return transaction.c ? io._abort(transaction, 'abort') : false;
            },
            isInProgress: function() {
                return transaction.c ? (transaction.c.readyState % 4) : false;
            },
            io: io
        };
    }
};

/**
Method for initiating an ajax call.  The first argument is the url end
point for the call.  The second argument is an object to configure the
transaction and attach event subscriptions.  The configuration object
supports the following properties:

<dl>
  <dt>method</dt>
    <dd>HTTP method verb (e.g., GET or POST). If this property is not
        not defined, the default value will be GET.</dd>

  <dt>data</dt>
    <dd>This is the name-value string that will be sent as the
    transaction data. If the request is HTTP GET, the data become
    part of querystring. If HTTP POST, the data are sent in the
    message body.</dd>

  <dt>xdr</dt>
    <dd>Defines the transport to be used for cross-domain requests.
    By setting this property, the transaction will use the specified
    transport instead of XMLHttpRequest. The properties of the
    transport object are:
    <dl>
      <dt>use</dt>
        <dd>The transport to be used: 'flash' or 'native'</dd>
      <dt>dataType</dt>
        <dd>Set the value to 'XML' if that is the expected response
        content type.</dd>
    </dl></dd>

  <dt>form</dt>
    <dd>Form serialization configuration object.  Its properties are:
    <dl>
      <dt>id</dt>
        <dd>Node object or id of HTML form</dd>
      <dt>useDisabled</dt>
        <dd>`true` to also serialize disabled form field values
        (defaults to `false`)</dd>
    </dl></dd>

  <dt>on</dt>
    <dd>Assigns transaction event subscriptions. Available events are:
    <dl>
      <dt>start</dt>
        <dd>Fires when a request is sent to a resource.</dd>
      <dt>complete</dt>
        <dd>Fires when the transaction is complete.</dd>
      <dt>success</dt>
        <dd>Fires when the HTTP response status is within the 2xx
        range.</dd>
      <dt>failure</dt>
        <dd>Fires when the HTTP response status is outside the 2xx
        range, if an exception occurs, if the transation is aborted,
        or if the transaction exceeds a configured `timeout`.</dd>
      <dt>end</dt>
        <dd>Fires at the conclusion of the transaction
           lifecycle, after `success` or `failure`.</dd>
    </dl>

    <p>Callback functions for `start` and `end` receive the id of the
    transaction as a first argument. For `complete`, `success`, and
    `failure`, callbacks receive the id and the response object
    (usually the XMLHttpRequest instance).  If the `arguments`
    property was included in the configuration object passed to
    `Y.io()`, the configured data will be passed to all callbacks as
    the last argument.</p>
    </dd>

  <dt>sync</dt>
    <dd>Pass `true` to make a same-domain transaction synchronous.
    <strong>CAVEAT</strong>: This will negatively impact the user
    experience. Have a <em>very</em> good reason if you intend to use
    this.</dd>

  <dt>context</dt>
    <dd>The "`this'" object for all configured event handlers. If a
    specific context is needed for individual callbacks, bind the
    callback to a context using `Y.bind()`.</dd>

  <dt>headers</dt>
    <dd>Object map of transaction headers to send to the server. The
    object keys are the header names and the values are the header
    values.</dd>

  <dt>timeout</dt>
    <dd>Millisecond threshold for the transaction before being
    automatically aborted.</dd>

  <dt>arguments</dt>
    <dd>User-defined data passed to all registered event handlers.
    This value is available as the second argument in the "start" and
    "end" event handlers. It is the third argument in the "complete",
    "success", and "failure" event handlers. <strong>Be sure to quote
    this property name in the transaction configuration as
    "arguments" is a reserved word in JavaScript</strong> (e.g.
    `Y.io({ ..., "arguments": stuff })`).</dd>
</dl>

@method io
@static
@param {String} url qualified path to transaction resource.
@param {Object} config configuration object for the transaction.
@return {Object}
@for YUI
**/
Y.io = function(url, config) {
    // Calling IO through the static interface will use and reuse
    // an instance of IO.
    var transaction = Y.io._map['io:0'] || new IO();
    return transaction.send.apply(transaction, [url, config]);
};

/**
Method for setting and deleting IO HTTP headers to be sent with every
request.

Hosted as a property on the `io` function (e.g. `Y.io.header`).

@method header
@param {String} name HTTP header
@param {String} value HTTP header value
@static
**/
Y.io.header = function(name, value) {
    // Calling IO through the static interface will use and reuse
    // an instance of IO.
    var transaction = Y.io._map['io:0'] || new IO();
    transaction.setHeader(name, value);
};

Y.IO = IO;
// Map of all IO instances created.
Y.io._map = {};
var XHR = win && win.XMLHttpRequest,
    XDR = win && win.XDomainRequest,
    AX = win && win.ActiveXObject,

    // Checks for the presence of the `withCredentials` in an XHR instance
    // object, which will be present if the environment supports CORS.
    SUPPORTS_CORS = XHR && 'withCredentials' in (new XMLHttpRequest());


Y.mix(Y.IO, {
    /**
    * The ID of the default IO transport, defaults to `xhr`
    * @property _default
    * @type {String}
    * @static
    */
    _default: 'xhr',
    /**
    *
    * @method defaultTransport
    * @static
    * @param {String} [id] The transport to set as the default, if empty a new transport is created.
    * @return {Object} The transport object with a `send` method
    */
    defaultTransport: function(id) {
        if (id) {
            Y.IO._default = id;
        } else {
            var o = {
                c: Y.IO.transports[Y.IO._default](),
                notify: Y.IO._default === 'xhr' ? false : true
            };
            return o;
        }
    },
    /**
    * An object hash of custom transports available to IO
    * @property transports
    * @type {Object}
    * @static
    */
    transports: {
        xhr: function () {
            return XHR ? new XMLHttpRequest() :
                AX ? new ActiveXObject('Microsoft.XMLHTTP') : null;
        },
        xdr: function () {
            return XDR ? new XDomainRequest() : null;
        },
        iframe: function () { return {}; },
        flash: null,
        nodejs: null
    },
    /**
    * Create a custom transport of type and return it's object
    * @method customTransport
    * @param {String} id The id of the transport to create.
    * @static
    */
    customTransport: function(id) {
        var o = { c: Y.IO.transports[id]() };

        o[(id === 'xdr' || id === 'flash') ? 'xdr' : 'notify'] = true;
        return o;
    }
});

Y.mix(Y.IO.prototype, {
    /**
    * Fired from the notify method of the transport which in turn fires
    * the event on the IO object.
    * @method notify
    * @param {String} event The name of the event
    * @param {Object} transaction The transaction object
    * @param {Object} config The configuration object for this transaction
    */
    notify: function(event, transaction, config) {
        var io = this;

        switch (event) {
            case 'timeout':
            case 'abort':
            case 'transport error':
                transaction.c = { status: 0, statusText: event };
                event = 'failure';
            default:
                io[event].apply(io, [transaction, config]);
        }
    }
});




}, '3.8.1', {"requires": ["event-custom-base", "querystring-stringify-simple"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('datasource-local', function (Y, NAME) {

/**
 * The DataSource utility provides a common configurable interface for widgets to
 * access a variety of data, from JavaScript arrays to online database servers.
 *
 * @module datasource
 * @main datasource
 */
    
/**
 * Provides the base DataSource implementation, which can be extended to
 * create DataSources for specific data protocols, such as the IO Utility, the
 * Get Utility, or custom functions.
 *
 * @module datasource
 * @submodule datasource-local
 */

/**
 * Base class for the DataSource Utility.
 * @class DataSource.Local
 * @extends Base
 * @constructor
 */    
var LANG = Y.Lang,

DSLocal = function() {
    DSLocal.superclass.constructor.apply(this, arguments);
};
    
    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSource static properties
    //
    /////////////////////////////////////////////////////////////////////////////
Y.mix(DSLocal, {
    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static     
     * @final
     * @value "dataSourceLocal"
     */
    NAME: "dataSourceLocal",

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSource Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        /**
        * @attribute source
        * @description Pointer to live data.
        * @type MIXED
        * @default null        
        */
        source: {
            value: null
        }
    },

    /**
     * Global transaction counter.
     *
     * @property _tId
     * @type Number
     * @static
     * @private
     * @default 0
     */
    _tId: 0,

    /**
     * Global in-progress transaction objects.
     *
     * @property transactions
     * @type Object
     * @static
     */
    transactions: {},

    /**
     * Returns data to callback.
     *
     * @method issueCallback
     * @param e {EventFacade} Event Facade.
     * @param caller {DataSource} Calling DataSource instance.
     * @static
     */
    issueCallback: function (e, caller) {
        var callbacks = e.on || e.callback,
            callback = callbacks && callbacks.success,
            payload = e.details[0];

        payload.error = (e.error || e.response.error);

        if (payload.error) {
            caller.fire("error", payload);
            callback = callbacks && callbacks.failure;
        }

        if (callback) {
            //TODO: this should be executed from a specific context
            callback(payload);
        }
    }
});
    
Y.extend(DSLocal, Y.Base, {
    /**
    * Internal init() handler.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private        
    */
    initializer: function(config) {
        this._initEvents();
    },

    /**
    * This method creates all the events for this module.
    * @method _initEvents
    * @private        
    */
    _initEvents: function() {
        /**
         * Fired when a data request is received.
         *
         * @event request
         * @param e {Event.Facade} Event Facade with the following properties:
         * <dl>                          
         * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
         * <dt>request (Object)</dt> <dd>The request.</dd>
         * <dt>callback (Object)</dt> <dd>The callback object
         *   (deprecated, refer to <strong>on</strong></dd>
         * <dt>on (Object)</dt> <dd>The map of configured callback
         *   functions.</dd>
         * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
         * </dl>
         * @preventable _defRequestFn
         */
        this.publish("request", {defaultFn: Y.bind("_defRequestFn", this), queuable:true});
         
        /**
         * Fired when raw data is received.
         *
         * @event data
         * @param e {Event.Facade} Event Facade with the following properties:
         * <dl>
         * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
         * <dt>request (Object)</dt> <dd>The request.</dd>
         * <dt>callback (Object)</dt> <dd>Deprecated alias for the
         *   <strong>on</strong> property</dd>
         * <dt>on (Object)</dt> <dd>The map of configured transaction
         *   callbacks.  An object with the following properties:
         *     <dl>
         *         <dt>success (Function)</dt> <dd>Success handler.</dd>
         *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
         *     </dl>
         * </dd>
         * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
         * <dt>data (Object)</dt> <dd>Raw data.</dd>
         * </dl>
         * @preventable _defDataFn
         */
        this.publish("data", {defaultFn: Y.bind("_defDataFn", this), queuable:true});

        /**
         * Fired when response is returned.
         *
         * @event response
         * @param e {Event.Facade} Event Facade with the following properties:
         * <dl>
         * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
         * <dt>request (Object)</dt> <dd>The request.</dd>
         * <dt>callback (Object)</dt> <dd>Deprecated alias for the
         *   <strong>on</strong> property</dd>
         * <dt>on (Object)</dt> <dd>The map of configured transaction
         *   callbacks.  An object with the following properties:
         *     <dl>
         *         <dt>success (Function)</dt> <dd>Success handler.</dd>
         *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
         *     </dl>
         * </dd>
         * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
         * <dt>data (Object)</dt> <dd>Raw data.</dd>
         * <dt>response (Object)</dt>
         *     <dd>Normalized response object with the following properties:
         *         <dl>
         *             <dt>results (Object)</dt> <dd>Parsed results.</dd>
         *             <dt>meta (Object)</dt> <dd>Parsed meta data.</dd>
         *             <dt>error (Boolean)</dt> <dd>Error flag.</dd>
         *         </dl>
         *     </dd>
         * <dt>error</dt>
         *     <dd>Any error that occurred along the transaction lifecycle.</dd>
         * </dl>
         * @preventable _defResponseFn
         */
         this.publish("response", {defaultFn: Y.bind("_defResponseFn", this), queuable:true});

        /**
         * Fired when an error is encountered.
         *
         * @event error
         * @param e {Event.Facade} Event Facade with the following properties:
         * <dl>
         * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
         * <dt>request (Object)</dt> <dd>The request.</dd>
         * <dt>callback (Object)</dt> <dd>Deprecated alias for the
         *   <strong>on</strong> property</dd>
         * <dt>on (Object)</dt> <dd>The map of configured transaction
         *   callbacks.  An object with the following properties:
         *     <dl>
         *         <dt>success (Function)</dt> <dd>Success handler.</dd>
         *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
         *     </dl>
         * </dd>
         * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
         * <dt>data (Object)</dt> <dd>Raw data.</dd>
         * <dt>response (Object)</dt>
         *     <dd>Normalized response object with the following properties:
         *         <dl>
         *             <dt>results (Object)</dt> <dd>Parsed results.</dd>
         *             <dt>meta (Object)</dt> <dd>Parsed meta data.</dd>
         *             <dt>error (Object)</dt> <dd>Error object.</dd>
         *         </dl>
         *     </dd>
         * <dt>error</dt>
         *     <dd>Any error that occurred along the transaction lifecycle.</dd>
         * </dl>
         */

    },

    /**
     * Manages request/response transaction. Must fire <code>response</code>
     * event when response is received. This method should be implemented by
     * subclasses to achieve more complex behavior such as accessing remote data.
     *
     * @method _defRequestFn
     * @param e {Event.Facade} Event Facadewith the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>Deprecated alias for the
     *   <strong>on</strong> property</dd>
     * <dt>on (Object)</dt> <dd>The map of configured transaction
     *   callbacks.  An object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * </dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * </dl>
     * @protected
     */
    _defRequestFn: function(e) {
        var data = this.get("source"),
            payload = e.details[0];
        
        // Problematic data
        if(LANG.isUndefined(data)) {
            payload.error = new Error("Local source undefined");
        }

        payload.data = data;
        this.fire("data", payload);
    },

    /**
     * Normalizes raw data into a response that includes results and meta properties.
     *
     * @method _defDataFn
     * @param e {Event.Facade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>Deprecated alias for the
     *   <strong>on</strong> property</dd>
     * <dt>on (Object)</dt> <dd>The map of configured transaction
     *   callbacks.  An object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * </dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * <dt>data (Object)</dt> <dd>Raw data.</dd>
     * </dl>
     * @protected
     */
    _defDataFn: function(e) {
        var data = e.data,
            meta = e.meta,
            response = {
                results: (LANG.isArray(data)) ? data : [data],
                meta: (meta) ? meta : {}
            },
            payload = e.details[0];

        payload.response = response;
        this.fire("response", payload);
    },

    /**
     * Sends data as a normalized response to callback.
     *
     * @method _defResponseFn
     * @param e {Event.Facade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>Deprecated alias for the
     *   <strong>on</strong> property</dd>
     * <dt>on (Object)</dt> <dd>The map of configured transaction
     *   callbacks.  An object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * </dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * <dt>data (Object)</dt> <dd>Raw data.</dd>
     * <dt>response (Object)</dt> <dd>Normalized response object with the following properties:
     *     <dl>
     *         <dt>results (Object)</dt> <dd>Parsed results.</dd>
     *         <dt>meta (Object)</dt> <dd>Parsed meta data.</dd>
     *         <dt>error (Boolean)</dt> <dd>Error flag.</dd>
     *     </dl>
     * </dd>
     * </dl>
     * @protected
     */
    _defResponseFn: function(e) {
        // Send the response back to the callback
        DSLocal.issueCallback(e, this);
    },
    
    /**
     * Generates a unique transaction ID and fires <code>request</code> event.
     * <strong>Note</strong>: the property <code>callback</code> is a
     * deprecated alias for the <code>on</code> transaction configuration
     * property described below.
     *
     * @method sendRequest
     * @param [request] {Object} An object literal with the following properties:
     *     <dl>
     *     <dt><code>request</code></dt>
     *     <dd>The request to send to the live data source, if any.</dd>
     *     <dt><code>on</code></dt>
     *     <dd>An object literal with the following properties:
     *         <dl>
     *         <dt><code>success</code></dt>
     *         <dd>The function to call when the data is ready.</dd>
     *         <dt><code>failure</code></dt>
     *         <dd>The function to call upon a response failure condition.</dd>
     *         <dt><code>argument</code></dt>
     *         <dd>Arbitrary data payload that will be passed back to the success and failure handlers.</dd>
     *         </dl>
     *     </dd>
     *     <dt><code>cfg</code></dt>
     *     <dd>Configuration object, if any.</dd>
     *     </dl>
     * @return {Number} Transaction ID.
     */
    sendRequest: function(request) {
        var tId = DSLocal._tId++,
            callbacks;

        request = request || {};

        callbacks = request.on || request.callback;

        this.fire("request", {
            tId: tId,
            request: request.request,
            on: callbacks,
            callback: callbacks,
            cfg: request.cfg || {}
        });


        return tId;
    }
});
    
Y.namespace("DataSource").Local = DSLocal;


}, '3.8.1', {"requires": ["base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('datasource-io', function (Y, NAME) {

/**
 * Provides a DataSource implementation which can be used to retrieve data via the IO Utility.
 *
 * @module datasource
 * @submodule datasource-io
 */

/**
 * IO subclass for the DataSource Utility.
 * @class DataSource.IO
 * @extends DataSource.Local
 * @constructor
 */    
var DSIO = function() {
    DSIO.superclass.constructor.apply(this, arguments);
};
    

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSource.IO static properties
    //
    /////////////////////////////////////////////////////////////////////////////
Y.mix(DSIO, {
    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static     
     * @final
     * @value "dataSourceIO"
     */
    NAME: "dataSourceIO",


    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSource.IO Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        /**
         * Pointer to IO Utility.
         *
         * @attribute io
         * @type Y.io
         * @default Y.io
         */
        io: {
            value: Y.io,
            cloneDefaultValue: false
        },
        
        /**
         * Default IO Config.
         *
         * @attribute ioConfig
         * @type Object
         * @default null
         */
         ioConfig: {
            value: null
         }
    }
});
    
Y.extend(DSIO, Y.DataSource.Local, {
    /**
    * Internal init() handler.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        this._queue = {interval:null, conn:null, requests:[]};
    },

    /**
    * IO success callback.
    *
    * @method successHandler
    * @param id {String} Transaction ID.
    * @param response {String} Response.
    * @param e {Event.Facade} Event facade.
    * @private
    */
    successHandler: function (id, response, e) {
        var defIOConfig = this.get("ioConfig"),
            payload = e.details[0];

        delete Y.DataSource.Local.transactions[e.tId];

        payload.data = response;
        this.fire("data", payload);


        if (defIOConfig && defIOConfig.on && defIOConfig.on.success) {
            defIOConfig.on.success.apply(defIOConfig.context || Y, arguments);
        }
    },

    /**
    * IO failure callback.
    *
    * @method failureHandler
    * @param id {String} Transaction ID.
    * @param response {String} Response.
    * @param e {Event.Facade} Event facade.
    * @private
    */
    failureHandler: function (id, response, e) {
        var defIOConfig = this.get("ioConfig"),
            payload = e.details[0];
        
        delete Y.DataSource.Local.transactions[e.tId];

        payload.error = new Error("IO data failure");

        payload.data = response;
        this.fire("data", payload);


        if (defIOConfig && defIOConfig.on && defIOConfig.on.failure) {
            defIOConfig.on.failure.apply(defIOConfig.context || Y, arguments);
        }
    },
    
    /**
    * @property _queue
    * @description Object literal to manage asynchronous request/response
    * cycles enabled if queue needs to be managed (asyncMode/ioConnMode):
    * <dl>
    *     <dt>interval {Number}</dt>
    *         <dd>Interval ID of in-progress queue.</dd>
    *     <dt>conn</dt>
    *         <dd>In-progress connection identifier (if applicable).</dd>
    *     <dt>requests {Object[]}</dt>
    *         <dd>Array of queued request objects: {request:request, callback:callback}.</dd>
    * </dl>
    * @type Object
    * @default {interval:null, conn:null, requests:[]}
    * @private
    */
    _queue: null,

    /**
     * Passes query string to IO. Fires <code>response</code> event when
     * response is received asynchronously.
     *
     * @method _defRequestFn
     * @param e {Event.Facade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>The callback object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * </dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * </dl>
     * @protected
     */
    _defRequestFn: function(e) {
        var uri = this.get("source"),
            io = this.get("io"),
            defIOConfig = this.get("ioConfig"),
            request = e.request,
            cfg = Y.merge(defIOConfig, e.cfg, {
                on: Y.merge(defIOConfig, {
                    success: this.successHandler,
                    failure: this.failureHandler
                }),
                context: this,
                "arguments": e
            });
        
        // Support for POST transactions
        if(Y.Lang.isString(request)) {
            if(cfg.method && (cfg.method.toUpperCase() === "POST")) {
                cfg.data = cfg.data ? cfg.data+request : request;
            }
            else {
                uri += request;
            }
        }
        Y.DataSource.Local.transactions[e.tId] = io(uri, cfg);
        return e.tId;
    }
});
  
Y.DataSource.IO = DSIO;


}, '3.8.1', {"requires": ["datasource-local", "io-base"]});
