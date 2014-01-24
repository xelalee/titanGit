/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-child', function (Y, NAME) {

/**
 * Extension enabling a Widget to be a child of another Widget.
 *
 * @module widget-child
 */

var Lang = Y.Lang;

/**
 * Widget extension providing functionality enabling a Widget to be a 
 * child of another Widget.
 *
 * @class WidgetChild
 * @param {Object} config User configuration object.
*/
function Child() {

    //  Widget method overlap
    Y.after(this._syncUIChild, this, "syncUI");
    Y.after(this._bindUIChild, this, "bindUI");

}

Child.ATTRS = {

    /**
     * @attribute selected
     * @type Number
     * @default 0
     *
     * @description Number indicating if the Widget is selected.  Possible 
     * values are:
     * <dl>
     * <dt>0</dt> <dd>(Default) Not selected</dd>
     * <dt>1</dt> <dd>Fully selected</dd>
     * <dt>2</dt> <dd>Partially selected</dd>
     * </dl>
    */
    selected: {   
        value: 0,
        validator: Lang.isNumber
    },


    /**
     * @attribute index
     * @type Number
     * @readOnly
     *
     * @description Number representing the Widget's ordinal position in its 
     * parent Widget.
     */
    index: {
        readOnly: true,
        getter: function () {
            
            var parent = this.get("parent"),
                index = -1;
            
            if (parent) {
                index = parent.indexOf(this);
            }
            
            return index;
            
        }
    },


    /**
     * @attribute parent
     * @type Widget
     * @readOnly
     *
     * @description Retrieves the parent of the Widget in the object hierarchy.
    */
    parent: {
        readOnly: true
    },


    /**
     * @attribute depth
     * @type Number
     * @default -1 
     * @readOnly         
     *
     * @description Number representing the depth of this Widget relative to 
     * the root Widget in the object heirarchy.
     */
    depth: {
        readOnly: true,
        getter: function () {
            
            var parent = this.get("parent"),
                root = this.get("root"),
                depth = -1;
            
            while (parent) {

                depth = (depth + 1);

                if (parent == root) {
                    break;
                }

                parent = parent.get("parent");

            }
            
            return depth;
            
        }
    },

    /**
     * @attribute root
     * @type Widget 
     * @readOnly         
     *
     * @description Returns the root Widget in the object hierarchy.  If the
     * ROOT_TYPE property is set, the search for the root Widget will be 
     * constrained to parent Widgets of the specified type.
     */
    root: {
        readOnly: true,
        getter: function () {

            var getParent = function (child) {

                var parent = child.get("parent"),
                    FnRootType = child.ROOT_TYPE,
                    criteria = parent;

                if (FnRootType) {
                    criteria = (parent && Y.instanceOf(parent, FnRootType));
                }

                return (criteria ? getParent(parent) : child);
                
            };

            return getParent(this);
            
        }
    }

};

Child.prototype = {

    /**
     * Constructor reference used to determine the root of a Widget-based 
     * object tree.
     * <p>
     * Currently used to control the behavior of the <code>root</code>  
     * attribute so that recursing up the object heirarchy can be constrained 
     * to a specific type of Widget.  Widget authors should set this property
     * to the constructor function for a given Widget implementation.
     * </p>
     *
     * @property ROOT_TYPE
     * @type Object
     */
    ROOT_TYPE: null,

    /**
     * Returns the node on which to bind delegate listeners.
     * 
     * Override of Widget's implementation of _getUIEventNode() to ensure that 
     * all event listeners are bound to the Widget's topmost DOM element.
     * This ensures that the firing of each type of Widget UI event (click,
     * mousedown, etc.) is facilitated by a single, top-level, delegated DOM
     * event listener.
     *
     * @method _getUIEventNode
     * @for Widget
     * @protected
     */
    _getUIEventNode: function () {
        var root = this.get("root"),
            returnVal;
        
        if (root) {
            returnVal = root.get("boundingBox");
        }
    
        return returnVal;
    },

    /**
    * @method next
    * @description Returns the Widget's next sibling.
    * @param {Boolean} circular Boolean indicating if the parent's first child 
    * should be returned if the child has no next sibling.  
    * @return {Widget} Widget instance. 
    */
    next: function (circular) {

        var parent = this.get("parent"),
            sibling;

        if (parent) {
            sibling = parent.item((this.get("index")+1));
        }

        if (!sibling && circular) {
            sibling = parent.item(0);
        }

        return sibling;

    },


    /**
    * @method previous
    * @description Returns the Widget's previous sibling.
    * @param {Boolean} circular Boolean indicating if the parent's last child 
    * should be returned if the child has no previous sibling.
    * @return {Widget} Widget instance. 
    */
    previous: function (circular) {

        var parent = this.get("parent"),
            index = this.get("index"),
            sibling;
        
        if (parent && index > 0) {
            sibling = parent.item([(index-1)]);
        }

        if (!sibling && circular) {
            sibling = parent.item((parent.size() - 1));
        }

        return sibling; 
        
    },


    //  Override of Y.WidgetParent.remove()
    //  Sugar implementation allowing a child to remove itself from its parent.
    remove: function (index) {

        var parent,
            removed;

        if (Lang.isNumber(index)) {
            removed = Y.WidgetParent.prototype.remove.apply(this, arguments);
        }
        else {

            parent = this.get("parent");

            if (parent) {
                removed = parent.remove(this.get("index"));
            }
                        
        }
        
        return removed;
        
    },


    /**
    * @method isRoot
    * @description Determines if the Widget is the root Widget in the 
    * object hierarchy.
    * @return {Boolean} Boolean indicating if Widget is the root Widget in the 
    * object hierarchy.
    */
    isRoot: function () {
        return (this == this.get("root"));
    },


    /**
    * @method ancestor
    * @description Returns the Widget instance at the specified depth.
    * @param {number} depth Number representing the depth of the ancestor.
    * @return {Widget} Widget instance.
    */
    ancestor: function (depth) {

        var root = this.get("root"),
            parent;

        if (this.get("depth") > depth)  {

            parent = this.get("parent");

            while (parent != root && parent.get("depth") > depth) {
                parent = parent.get("parent");
            }

        }

        return parent;

    },


    /**
     * Updates the UI to reflect the <code>selected</code> attribute value.
     *
     * @method _uiSetChildSelected
     * @protected
     * @param {number} selected The selected value to be reflected in the UI.
     */    
    _uiSetChildSelected: function (selected) {

        var box = this.get("boundingBox"),
            sClassName = this.getClassName("selected");

        if (selected === 0) {
            box.removeClass(sClassName);
        }
        else {
            box.addClass(sClassName);
        }
        
    },


    /**
     * Default attribute change listener for the <code>selected</code> 
     * attribute, responsible for updating the UI, in response to 
     * attribute changes.
     *
     * @method _afterChildSelectedChange
     * @protected
     * @param {EventFacade} event The event facade for the attribute change.
     */    
    _afterChildSelectedChange: function (event) {
        this._uiSetChildSelected(event.newVal);
    },
    

    /**
     * Synchronizes the UI to match the WidgetChild state.
     * <p>
     * This method is invoked after bindUI is invoked for the Widget class
     * using YUI's aop infrastructure.
     * </p>     
     *
     * @method _syncUIChild
     * @protected
     */    
    _syncUIChild: function () {
        this._uiSetChildSelected(this.get("selected"));
    },


    /**
     * Binds event listeners responsible for updating the UI state in response 
     * to WidgetChild related state changes.
     * <p>
     * This method is invoked after bindUI is invoked for the Widget class
     * using YUI's aop infrastructure.
     * </p>
     * @method _bindUIChild
     * @protected
     */    
    _bindUIChild: function () { 
        this.after("selectedChange", this._afterChildSelectedChange);
    }
    
};

Y.WidgetChild = Child;

}, '3.8.1', {"requires": ["base-build", "widget"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('tabview-base', function (Y, NAME) {

var getClassName = Y.ClassNameManager.getClassName,
    TABVIEW = 'tabview',
    TAB = 'tab',
    PANEL = 'panel',
    SELECTED = 'selected',
    EMPTY_OBJ = {},
    DOT = '.',

    _classNames = {
        tabview: getClassName(TABVIEW),
        tabviewPanel: getClassName(TABVIEW, PANEL),
        tabviewList: getClassName(TABVIEW, 'list'),
        tab: getClassName(TAB),
        tabLabel: getClassName(TAB, 'label'),
        tabPanel: getClassName(TAB, PANEL),
        selectedTab: getClassName(TAB, SELECTED),
        selectedPanel: getClassName(TAB, PANEL, SELECTED)
    },

    _queries = {
        tabview: DOT + _classNames.tabview,
        tabviewList: '> ul',
        tab: '> ul > li',
        tabLabel: '> ul > li > a',
        tabviewPanel: '> div',
        tabPanel: '> div > div',
        selectedTab: '> ul > ' + DOT + _classNames.selectedTab,
        selectedPanel: '> div ' + DOT + _classNames.selectedPanel
    },

    TabviewBase = function() {
        this.init.apply(this, arguments);
    };

TabviewBase.NAME = 'tabviewBase';
TabviewBase._queries = _queries;
TabviewBase._classNames = _classNames;

Y.mix(TabviewBase.prototype, {
    init: function(config) {
        config = config || EMPTY_OBJ;
        this._node = config.host || Y.one(config.node);

        this.refresh();
    },

    initClassNames: function(index) {
        Y.Object.each(_queries, function(query, name) {
            // this === tabview._node
            if (_classNames[name]) {
                var result = this.all(query);
                
                if (index !== undefined) {
                    result = result.item(index);
                }

                if (result) {
                    result.addClass(_classNames[name]);
                }
            }
        }, this._node);

        this._node.addClass(_classNames.tabview);
    },

    _select: function(index) {
        var node = this._node,
            oldItem = node.one(_queries.selectedTab),
            oldContent = node.one(_queries.selectedPanel),
            newItem = node.all(_queries.tab).item(index),
            newContent = node.all(_queries.tabPanel).item(index);

        if (oldItem) {
            oldItem.removeClass(_classNames.selectedTab);
        }

        if (oldContent) {
            oldContent.removeClass(_classNames.selectedPanel);
        }

        if (newItem) {
            newItem.addClass(_classNames.selectedTab);
        }

        if (newContent) {
            newContent.addClass(_classNames.selectedPanel);
        }
    },

    initState: function() {
        var node = this._node,
            activeNode = node.one(_queries.selectedTab),
            activeIndex = activeNode ?
                    node.all(_queries.tab).indexOf(activeNode) : 0;

        this._select(activeIndex);
    },

    // collapse extra space between list-items
    _scrubTextNodes: function() {
        this._node.one(_queries.tabviewList).get('childNodes').each(function(node) {
            if (node.get('nodeType') === 3) { // text node
                node.remove();
            }
        });
    },

    // base renderer only enlivens existing markup
    refresh: function() {
        this._scrubTextNodes();
        this.initClassNames();
        this.initState();
        this.initEvents();
    },

    tabEventName: 'click',

    initEvents: function() {
        // TODO: detach prefix for delegate?
        // this._node.delegate('tabview|' + this.tabEventName),
        this._node.delegate(this.tabEventName,
            this.onTabEvent,
            _queries.tab,
            this
        );
    },

    onTabEvent: function(e) {
        e.preventDefault();
        this._select(this._node.all(_queries.tab).indexOf(e.currentTarget));
    },

    destroy: function() {
        this._node.detach(this.tabEventName);
    }
});

Y.TabviewBase = TabviewBase;


}, '3.8.1', {"requires": ["node-event-delegate", "classnamemanager", "skin-sam-tabview"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-simulate', function (Y, NAME) {

(function() {
/**
 * Simulate user interaction by generating native DOM events.
 *
 * @module event-simulate
 * @requires event
 */

//shortcuts
var L   = Y.Lang,
    isFunction  = L.isFunction,
    isString    = L.isString,
    isBoolean   = L.isBoolean,
    isObject    = L.isObject,
    isNumber    = L.isNumber,

    //mouse events supported
    mouseEvents = {
        click:      1,
        dblclick:   1,
        mouseover:  1,
        mouseout:   1,
        mousedown:  1,
        mouseup:    1,
        mousemove:  1,
        contextmenu:1
    },

    msPointerEvents = {
        MSPointerOver:  1,
        MSPointerOut:   1,
        MSPointerDown:  1,
        MSPointerUp:    1,
        MSPointerMove:  1
    },

    //key events supported
    keyEvents   = {
        keydown:    1,
        keyup:      1,
        keypress:   1
    },

    //HTML events supported
    uiEvents  = {
        submit:     1,
        blur:       1,
        change:     1,
        focus:      1,
        resize:     1,
        scroll:     1,
        select:     1
    },

    //events that bubble by default
    bubbleEvents = {
        scroll:     1,
        resize:     1,
        reset:      1,
        submit:     1,
        change:     1,
        select:     1,
        error:      1,
        abort:      1
    },
    
    //touch events supported
    touchEvents = {
        touchstart: 1,
        touchmove: 1,
        touchend: 1, 
        touchcancel: 1
    },
    
    gestureEvents = {
        gesturestart: 1,
        gesturechange: 1,
        gestureend: 1
    };

//all key, mouse and touch events bubble
Y.mix(bubbleEvents, mouseEvents);
Y.mix(bubbleEvents, keyEvents);
Y.mix(bubbleEvents, touchEvents);

/*
 * Note: Intentionally not for YUIDoc generation.
 * Simulates a key event using the given event information to populate
 * the generated event object. This method does browser-equalizing
 * calculations to account for differences in the DOM and IE event models
 * as well as different browser quirks. Note: keydown causes Safari 2.x to
 * crash.
 * @method simulateKeyEvent
 * @private
 * @static
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: keyup, keydown, and keypress.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 3 specifies that all key events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 3 specifies that all
 *      key events can be cancelled. The default
 *      is true.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
 *      is pressed while the event is firing. The default is false.
 * @param {int} keyCode (Optional) The code for the key that is in use.
 *      The default is 0.
 * @param {int} charCode (Optional) The Unicode code for the character
 *      associated with the key being used. The default is 0.
 */
function simulateKeyEvent(target /*:HTMLElement*/, type /*:String*/,
                             bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                             view /*:Window*/,
                             ctrlKey /*:Boolean*/,    altKey /*:Boolean*/,
                             shiftKey /*:Boolean*/,   metaKey /*:Boolean*/,
                             keyCode /*:int*/,        charCode /*:int*/) /*:Void*/
{
    //check target
    if (!target){
        Y.error("simulateKeyEvent(): Invalid target.");
    }

    //check event type
    if (isString(type)){
        type = type.toLowerCase();
        switch(type){
            case "textevent": //DOM Level 3
                type = "keypress";
                break;
            case "keyup":
            case "keydown":
            case "keypress":
                break;
            default:
                Y.error("simulateKeyEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateKeyEvent(): Event type must be a string.");
    }

    //setup default values
    if (!isBoolean(bubbles)){
        bubbles = true; //all key events bubble
    }
    if (!isBoolean(cancelable)){
        cancelable = true; //all key events can be cancelled
    }
    if (!isObject(view)){
        view = Y.config.win; //view is typically window
    }
    if (!isBoolean(ctrlKey)){
        ctrlKey = false;
    }
    if (!isBoolean(altKey)){
        altKey = false;
    }
    if (!isBoolean(shiftKey)){
        shiftKey = false;
    }
    if (!isBoolean(metaKey)){
        metaKey = false;
    }
    if (!isNumber(keyCode)){
        keyCode = 0;
    }
    if (!isNumber(charCode)){
        charCode = 0;
    }

    //try to create a mouse event
    var customEvent /*:MouseEvent*/ = null;

    //check for DOM-compliant browsers first
    if (isFunction(Y.config.doc.createEvent)){

        try {

            //try to create key event
            customEvent = Y.config.doc.createEvent("KeyEvents");

            /*
             * Interesting problem: Firefox implemented a non-standard
             * version of initKeyEvent() based on DOM Level 2 specs.
             * Key event was removed from DOM Level 2 and re-introduced
             * in DOM Level 3 with a different interface. Firefox is the
             * only browser with any implementation of Key Events, so for
             * now, assume it's Firefox if the above line doesn't error.
             */
            // @TODO: Decipher between Firefox's implementation and a correct one.
            customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey,
                altKey, shiftKey, metaKey, keyCode, charCode);

        } catch (ex /*:Error*/){

            /*
             * If it got here, that means key events aren't officially supported.
             * Safari/WebKit is a real problem now. WebKit 522 won't let you
             * set keyCode, charCode, or other properties if you use a
             * UIEvent, so we first must try to create a generic event. The
             * fun part is that this will throw an error on Safari 2.x. The
             * end result is that we need another try...catch statement just to
             * deal with this mess.
             */
            try {

                //try to create generic event - will fail in Safari 2.x
                customEvent = Y.config.doc.createEvent("Events");

            } catch (uierror /*:Error*/){

                //the above failed, so create a UIEvent for Safari 2.x
                customEvent = Y.config.doc.createEvent("UIEvents");

            } finally {

                customEvent.initEvent(type, bubbles, cancelable);

                //initialize
                customEvent.view = view;
                customEvent.altKey = altKey;
                customEvent.ctrlKey = ctrlKey;
                customEvent.shiftKey = shiftKey;
                customEvent.metaKey = metaKey;
                customEvent.keyCode = keyCode;
                customEvent.charCode = charCode;

            }

        }

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (isObject(Y.config.doc.createEventObject)){ //IE

        //create an IE event object
        customEvent = Y.config.doc.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.ctrlKey = ctrlKey;
        customEvent.altKey = altKey;
        customEvent.shiftKey = shiftKey;
        customEvent.metaKey = metaKey;

        /*
         * IE doesn't support charCode explicitly. CharCode should
         * take precedence over any keyCode value for accurate
         * representation.
         */
        customEvent.keyCode = (charCode > 0) ? charCode : keyCode;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        Y.error("simulateKeyEvent(): No event simulation framework present.");
    }
}

/*
 * Note: Intentionally not for YUIDoc generation.
 * Simulates a mouse event using the given event information to populate
 * the generated event object. This method does browser-equalizing
 * calculations to account for differences in the DOM and IE event models
 * as well as different browser quirks.
 * @method simulateMouseEvent
 * @private
 * @static
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: click, dblclick, mousedown, mouseup, mouseout,
 *      mouseover, and mousemove.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 2 specifies that all
 *      mouse events except mousemove can be cancelled. The default
 *      is true for all events except mousemove, for which the default
 *      is false.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {int} detail (Optional) The number of times the mouse button has
 *      been used. The default value is 1.
 * @param {int} screenX (Optional) The x-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} screenY (Optional) The y-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} clientX (Optional) The x-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {int} clientY (Optional) The y-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
 *      is pressed while the event is firing. The default is false.
 * @param {int} button (Optional) The button being pressed while the event
 *      is executing. The value should be 0 for the primary mouse button
 *      (typically the left button), 1 for the terciary mouse button
 *      (typically the middle button), and 2 for the secondary mouse button
 *      (typically the right button). The default is 0.
 * @param {HTMLElement} relatedTarget (Optional) For mouseout events,
 *      this is the element that the mouse has moved to. For mouseover
 *      events, this is the element that the mouse has moved from. This
 *      argument is ignored for all other events. The default is null.
 */
function simulateMouseEvent(target /*:HTMLElement*/, type /*:String*/,
                               bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                               view /*:Window*/,        detail /*:int*/,
                               screenX /*:int*/,        screenY /*:int*/,
                               clientX /*:int*/,        clientY /*:int*/,
                               ctrlKey /*:Boolean*/,    altKey /*:Boolean*/,
                               shiftKey /*:Boolean*/,   metaKey /*:Boolean*/,
                               button /*:int*/,         relatedTarget /*:HTMLElement*/) /*:Void*/
{
    //check target
    if (!target){
        Y.error("simulateMouseEvent(): Invalid target.");
    }

    
    if (isString(type)){

        //make sure it's a supported mouse event or an msPointerEvent. 
        if (!mouseEvents[type.toLowerCase()] && !msPointerEvents[type]){
            Y.error("simulateMouseEvent(): Event type '" + type + "' not supported.");
        }
    } 
    else {
        Y.error("simulateMouseEvent(): Event type must be a string.");
    }

    //setup default values
    if (!isBoolean(bubbles)){
        bubbles = true; //all mouse events bubble
    }
    if (!isBoolean(cancelable)){
        cancelable = (type !== "mousemove"); //mousemove is the only one that can't be cancelled
    }
    if (!isObject(view)){
        view = Y.config.win; //view is typically window
    }
    if (!isNumber(detail)){
        detail = 1;  //number of mouse clicks must be at least one
    }
    if (!isNumber(screenX)){
        screenX = 0;
    }
    if (!isNumber(screenY)){
        screenY = 0;
    }
    if (!isNumber(clientX)){
        clientX = 0;
    }
    if (!isNumber(clientY)){
        clientY = 0;
    }
    if (!isBoolean(ctrlKey)){
        ctrlKey = false;
    }
    if (!isBoolean(altKey)){
        altKey = false;
    }
    if (!isBoolean(shiftKey)){
        shiftKey = false;
    }
    if (!isBoolean(metaKey)){
        metaKey = false;
    }
    if (!isNumber(button)){
        button = 0;
    }

    relatedTarget = relatedTarget || null;

    //try to create a mouse event
    var customEvent /*:MouseEvent*/ = null;

    //check for DOM-compliant browsers first
    if (isFunction(Y.config.doc.createEvent)){

        customEvent = Y.config.doc.createEvent("MouseEvents");

        //Safari 2.x (WebKit 418) still doesn't implement initMouseEvent()
        if (customEvent.initMouseEvent){
            customEvent.initMouseEvent(type, bubbles, cancelable, view, detail,
                                 screenX, screenY, clientX, clientY,
                                 ctrlKey, altKey, shiftKey, metaKey,
                                 button, relatedTarget);
        } else { //Safari

            //the closest thing available in Safari 2.x is UIEvents
            customEvent = Y.config.doc.createEvent("UIEvents");
            customEvent.initEvent(type, bubbles, cancelable);
            customEvent.view = view;
            customEvent.detail = detail;
            customEvent.screenX = screenX;
            customEvent.screenY = screenY;
            customEvent.clientX = clientX;
            customEvent.clientY = clientY;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.metaKey = metaKey;
            customEvent.shiftKey = shiftKey;
            customEvent.button = button;
            customEvent.relatedTarget = relatedTarget;
        }

        /*
         * Check to see if relatedTarget has been assigned. Firefox
         * versions less than 2.0 don't allow it to be assigned via
         * initMouseEvent() and the property is readonly after event
         * creation, so in order to keep YAHOO.util.getRelatedTarget()
         * working, assign to the IE proprietary toElement property
         * for mouseout event and fromElement property for mouseover
         * event.
         */
        if (relatedTarget && !customEvent.relatedTarget){
            if (type === "mouseout"){
                customEvent.toElement = relatedTarget;
            } else if (type === "mouseover"){
                customEvent.fromElement = relatedTarget;
            }
        }

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (isObject(Y.config.doc.createEventObject)){ //IE

        //create an IE event object
        customEvent = Y.config.doc.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.detail = detail;
        customEvent.screenX = screenX;
        customEvent.screenY = screenY;
        customEvent.clientX = clientX;
        customEvent.clientY = clientY;
        customEvent.ctrlKey = ctrlKey;
        customEvent.altKey = altKey;
        customEvent.metaKey = metaKey;
        customEvent.shiftKey = shiftKey;

        //fix button property for IE's wacky implementation
        switch(button){
            case 0:
                customEvent.button = 1;
                break;
            case 1:
                customEvent.button = 4;
                break;
            case 2:
                //leave as is
                break;
            default:
                customEvent.button = 0;
        }

        /*
         * Have to use relatedTarget because IE won't allow assignment
         * to toElement or fromElement on generic events. This keeps
         * YAHOO.util.customEvent.getRelatedTarget() functional.
         */
        customEvent.relatedTarget = relatedTarget;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        Y.error("simulateMouseEvent(): No event simulation framework present.");
    }
}

/*
 * Note: Intentionally not for YUIDoc generation.
 * Simulates a UI event using the given event information to populate
 * the generated event object. This method does browser-equalizing
 * calculations to account for differences in the DOM and IE event models
 * as well as different browser quirks.
 * @method simulateHTMLEvent
 * @private
 * @static
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: click, dblclick, mousedown, mouseup, mouseout,
 *      mouseover, and mousemove.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 2 specifies that all
 *      mouse events except mousemove can be cancelled. The default
 *      is true for all events except mousemove, for which the default
 *      is false.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {int} detail (Optional) The number of times the mouse button has
 *      been used. The default value is 1.
 */
function simulateUIEvent(target /*:HTMLElement*/, type /*:String*/,
                               bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                               view /*:Window*/,        detail /*:int*/) /*:Void*/
{

    //check target
    if (!target){
        Y.error("simulateUIEvent(): Invalid target.");
    }

    //check event type
    if (isString(type)){
        type = type.toLowerCase();

        //make sure it's a supported mouse event
        if (!uiEvents[type]){
            Y.error("simulateUIEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateUIEvent(): Event type must be a string.");
    }

    //try to create a mouse event
    var customEvent = null;


    //setup default values
    if (!isBoolean(bubbles)){
        bubbles = (type in bubbleEvents);  //not all events bubble
    }
    if (!isBoolean(cancelable)){
        cancelable = (type === "submit"); //submit is the only one that can be cancelled
    }
    if (!isObject(view)){
        view = Y.config.win; //view is typically window
    }
    if (!isNumber(detail)){
        detail = 1;  //usually not used but defaulted to this
    }

    //check for DOM-compliant browsers first
    if (isFunction(Y.config.doc.createEvent)){

        //just a generic UI Event object is needed
        customEvent = Y.config.doc.createEvent("UIEvents");
        customEvent.initUIEvent(type, bubbles, cancelable, view, detail);

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (isObject(Y.config.doc.createEventObject)){ //IE

        //create an IE event object
        customEvent = Y.config.doc.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.detail = detail;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        Y.error("simulateUIEvent(): No event simulation framework present.");
    }
}

/*
 * (iOS only) This is for creating native DOM gesture events which only iOS
 * v2.0+ is supporting.
 * 
 * @method simulateGestureEvent
 * @private
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: touchstart, touchmove, touchend, touchcancel.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 2 specifies that all
 *      touch events except touchcancel can be cancelled. The default
 *      is true for all events except touchcancel, for which the default
 *      is false.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {int} detail (Optional) Specifies some detail information about 
 *      the event depending on the type of event.
 * @param {int} screenX (Optional) The x-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} screenY (Optional) The y-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} clientX (Optional) The x-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {int} clientY (Optional) The y-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
 *      is pressed while the event is firing. The default is false. 
 * @param {float} scale (iOS v2+ only) The distance between two fingers 
 *      since the start of an event as a multiplier of the initial distance. 
 *      The default value is 1.0.
 * @param {float} rotation (iOS v2+ only) The delta rotation since the start 
 *      of an event, in degrees, where clockwise is positive and 
 *      counter-clockwise is negative. The default value is 0.0.   
 */
function simulateGestureEvent(target, type,
    bubbles,            // boolean
    cancelable,         // boolean
    view,               // DOMWindow
    detail,             // long
    screenX, screenY,   // long
    clientX, clientY,   // long
    ctrlKey, altKey, shiftKey, metaKey, // boolean
    scale,              // float
    rotation            // float
) {
    var customEvent;

    if(!Y.UA.ios || Y.UA.ios<2.0) {
        Y.error("simulateGestureEvent(): Native gesture DOM eventframe is not available in this platform.");
    }

    // check taget    
    if (!target){
        Y.error("simulateGestureEvent(): Invalid target.");
    }

    //check event type
    if (Y.Lang.isString(type)) {
        type = type.toLowerCase();

        //make sure it's a supported touch event
        if (!gestureEvents[type]){
            Y.error("simulateTouchEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateGestureEvent(): Event type must be a string.");
    }

    // setup default values
    if (!Y.Lang.isBoolean(bubbles)) { bubbles = true; } // bubble by default
    if (!Y.Lang.isBoolean(cancelable)) { cancelable = true; } 
    if (!Y.Lang.isObject(view))     { view = Y.config.win; }
    if (!Y.Lang.isNumber(detail))   { detail = 2; }     // usually not used.
    if (!Y.Lang.isNumber(screenX))  { screenX = 0; }
    if (!Y.Lang.isNumber(screenY))  { screenY = 0; }
    if (!Y.Lang.isNumber(clientX))  { clientX = 0; }
    if (!Y.Lang.isNumber(clientY))  { clientY = 0; }
    if (!Y.Lang.isBoolean(ctrlKey)) { ctrlKey = false; }
    if (!Y.Lang.isBoolean(altKey))  { altKey = false; }
    if (!Y.Lang.isBoolean(shiftKey)){ shiftKey = false; }
    if (!Y.Lang.isBoolean(metaKey)) { metaKey = false; }

    if (!Y.Lang.isNumber(scale)){ scale = 1.0; }
    if (!Y.Lang.isNumber(rotation)){ rotation = 0.0; }

    customEvent = Y.config.doc.createEvent("GestureEvent");

    customEvent.initGestureEvent(type, bubbles, cancelable, view, detail,
        screenX, screenY, clientX, clientY,
        ctrlKey, altKey, shiftKey, metaKey,
        target, scale, rotation);

    target.dispatchEvent(customEvent);
}


/*
 * @method simulateTouchEvent
 * @private
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: touchstart, touchmove, touchend, touchcancel.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 2 specifies that all
 *      touch events except touchcancel can be cancelled. The default
 *      is true for all events except touchcancel, for which the default
 *      is false.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {int} detail (Optional) Specifies some detail information about 
 *      the event depending on the type of event.
 * @param {int} screenX (Optional) The x-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} screenY (Optional) The y-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} clientX (Optional) The x-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {int} clientY (Optional) The y-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
 *      is pressed while the event is firing. The default is false. 
 * @param {TouchList} touches A collection of Touch objects representing 
 *      all touches associated with this event.
 * @param {TouchList} targetTouches A collection of Touch objects 
 *      representing all touches associated with this target.
 * @param {TouchList} changedTouches A collection of Touch objects 
 *      representing all touches that changed in this event.
 * @param {float} scale (iOS v2+ only) The distance between two fingers 
 *      since the start of an event as a multiplier of the initial distance. 
 *      The default value is 1.0.
 * @param {float} rotation (iOS v2+ only) The delta rotation since the start 
 *      of an event, in degrees, where clockwise is positive and 
 *      counter-clockwise is negative. The default value is 0.0.   
 */
function simulateTouchEvent(target, type,
    bubbles,            // boolean
    cancelable,         // boolean
    view,               // DOMWindow
    detail,             // long
    screenX, screenY,   // long
    clientX, clientY,   // long
    ctrlKey, altKey, shiftKey, metaKey, // boolean
    touches,            // TouchList
    targetTouches,      // TouchList
    changedTouches,     // TouchList
    scale,              // float
    rotation            // float
) {

    var customEvent;

    // check taget    
    if (!target){
        Y.error("simulateTouchEvent(): Invalid target.");
    }

    //check event type
    if (Y.Lang.isString(type)) {
        type = type.toLowerCase();

        //make sure it's a supported touch event
        if (!touchEvents[type]){
            Y.error("simulateTouchEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateTouchEvent(): Event type must be a string.");
    }

    // note that the caller is responsible to pass appropriate touch objects.
    // check touch objects
    // Android(even 4.0) doesn't define TouchList yet
    /*if(type === 'touchstart' || type === 'touchmove') {
        if(!touches instanceof TouchList) {
            Y.error('simulateTouchEvent(): Invalid touches. It must be a TouchList');
        } else {
            if(touches.length === 0) {
                Y.error('simulateTouchEvent(): No touch object found.');
            }
        }
    } else if(type === 'touchend') {
        if(!changedTouches instanceof TouchList) {
            Y.error('simulateTouchEvent(): Invalid touches. It must be a TouchList');
        } else {
            if(changedTouches.length === 0) {
                Y.error('simulateTouchEvent(): No touch object found.');
            }
        }
    }*/

    if(type === 'touchstart' || type === 'touchmove') {
        if(touches.length === 0) {
            Y.error('simulateTouchEvent(): No touch object in touches');
        }
    } else if(type === 'touchend') {
        if(changedTouches.length === 0) {
            Y.error('simulateTouchEvent(): No touch object in changedTouches');
        }
    }

    // setup default values
    if (!Y.Lang.isBoolean(bubbles)) { bubbles = true; } // bubble by default.
    if (!Y.Lang.isBoolean(cancelable)) { 
        cancelable = (type !== "touchcancel"); // touchcancel is not cancelled 
    } 
    if (!Y.Lang.isObject(view))     { view = Y.config.win; }
    if (!Y.Lang.isNumber(detail))   { detail = 1; } // usually not used. defaulted to # of touch objects.
    if (!Y.Lang.isNumber(screenX))  { screenX = 0; }
    if (!Y.Lang.isNumber(screenY))  { screenY = 0; }
    if (!Y.Lang.isNumber(clientX))  { clientX = 0; }
    if (!Y.Lang.isNumber(clientY))  { clientY = 0; }
    if (!Y.Lang.isBoolean(ctrlKey)) { ctrlKey = false; }
    if (!Y.Lang.isBoolean(altKey))  { altKey = false; }
    if (!Y.Lang.isBoolean(shiftKey)){ shiftKey = false; }
    if (!Y.Lang.isBoolean(metaKey)) { metaKey = false; }
    if (!Y.Lang.isNumber(scale))    { scale = 1.0; }
    if (!Y.Lang.isNumber(rotation)) { rotation = 0.0; }


    //check for DOM-compliant browsers first
    if (Y.Lang.isFunction(Y.config.doc.createEvent)) {
        if (Y.UA.android) {
            /**
                * Couldn't find android start version that supports touch event. 
                * Assumed supported(btw APIs broken till icecream sandwitch) 
                * from the beginning.
                */
            if(Y.UA.android < 4.0) {
                /**
                    * Touch APIs are broken in androids older than 4.0. We will use 
                    * simulated touch apis for these versions. 
                    * App developer still can listen for touch events. This events
                    * will be dispatched with touch event types.
                    * 
                    * (Note) Used target for the relatedTarget. Need to verify if
                    * it has a side effect.
                    */
                customEvent = Y.config.doc.createEvent("MouseEvents");
                customEvent.initMouseEvent(type, bubbles, cancelable, view, detail, 
                    screenX, screenY, clientX, clientY,
                    ctrlKey, altKey, shiftKey, metaKey,
                    0, target);

                customEvent.touches = touches;
                customEvent.targetTouches = targetTouches;
                customEvent.changedTouches = changedTouches;
            } else {
                customEvent = Y.config.doc.createEvent("TouchEvent");

                // Andoroid isn't compliant W3C initTouchEvent method signature.
                customEvent.initTouchEvent(touches, targetTouches, changedTouches,
                    type, view,
                    screenX, screenY, clientX, clientY,
                    ctrlKey, altKey, shiftKey, metaKey);
            }
        } else if (Y.UA.ios) {
            if(Y.UA.ios >= 2.0) {
                customEvent = Y.config.doc.createEvent("TouchEvent");

                // Available iOS 2.0 and later
                customEvent.initTouchEvent(type, bubbles, cancelable, view, detail,
                    screenX, screenY, clientX, clientY,
                    ctrlKey, altKey, shiftKey, metaKey,
                    touches, targetTouches, changedTouches,
                    scale, rotation);
            } else {
                Y.error('simulateTouchEvent(): No touch event simulation framework present for iOS, '+Y.UA.ios+'.');
            }
        } else {
            Y.error('simulateTouchEvent(): Not supported agent yet, '+Y.UA.userAgent);
        }

        //fire the event
        target.dispatchEvent(customEvent);
    //} else if (Y.Lang.isObject(doc.createEventObject)){ // Windows Mobile/IE, support later 
    } else {
        Y.error('simulateTouchEvent(): No event simulation framework present.');
    }
}

/**
 * Simulates the event or gesture with the given name on a target.
 * @param {HTMLElement} target The DOM element that's the target of the event.
 * @param {String} type The type of event or name of the supported gesture to simulate 
 *      (i.e., "click", "doubletap", "flick").
 * @param {Object} options (Optional) Extra options to copy onto the event object. 
 *      For gestures, options are used to refine the gesture behavior.
 * @return {void}
 * @for Event
 * @method simulate
 * @static
 */
Y.Event.simulate = function(target, type, options){

    options = options || {};

    if (mouseEvents[type] || msPointerEvents[type]){
        simulateMouseEvent(target, type, options.bubbles,
            options.cancelable, options.view, options.detail, options.screenX,
            options.screenY, options.clientX, options.clientY, options.ctrlKey,
            options.altKey, options.shiftKey, options.metaKey, options.button,
            options.relatedTarget);
    } else if (keyEvents[type]){
        simulateKeyEvent(target, type, options.bubbles,
            options.cancelable, options.view, options.ctrlKey,
            options.altKey, options.shiftKey, options.metaKey,
            options.keyCode, options.charCode);
    } else if (uiEvents[type]){
        simulateUIEvent(target, type, options.bubbles,
            options.cancelable, options.view, options.detail);
            
    // touch low-level event simulation        
    } else if (touchEvents[type]) {
        if((Y.config.win && ("ontouchstart" in Y.config.win)) && !(Y.UA.phantomjs) && !(Y.UA.chrome && Y.UA.chrome < 6)) {
            simulateTouchEvent(target, type, 
                options.bubbles, options.cancelable, options.view, options.detail, 
                options.screenX, options.screenY, options.clientX, options.clientY, 
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, 
                options.touches, options.targetTouches, options.changedTouches,
                options.scale, options.rotation);
        } else {
            Y.error("simulate(): Event '" + type + "' can't be simulated. Use gesture-simulate module instead.");
        }

    // ios gesture low-level event simulation (iOS v2+ only)        
    } else if(Y.UA.ios && Y.UA.ios >= 2.0 && gestureEvents[type]) {
        simulateGestureEvent(target, type, 
            options.bubbles, options.cancelable, options.view, options.detail, 
            options.screenX, options.screenY, options.clientX, options.clientY, 
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
            options.scale, options.rotation);
    
    // anything else
    } else {
        Y.error("simulate(): Event '" + type + "' can't be simulated.");
    }
};


})();



}, '3.8.1', {"requires": ["event-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('async-queue', function (Y, NAME) {

/**
 * <p>AsyncQueue allows you create a chain of function callbacks executed
 * via setTimeout (or synchronously) that are guaranteed to run in order.
 * Items in the queue can be promoted or removed.  Start or resume the
 * execution chain with run().  pause() to temporarily delay execution, or
 * stop() to halt and clear the queue.</p>
 *
 * @module async-queue
 */

/**
 * <p>A specialized queue class that supports scheduling callbacks to execute
 * sequentially, iteratively, even asynchronously.</p>
 *
 * <p>Callbacks can be function refs or objects with the following keys.  Only
 * the <code>fn</code> key is required.</p>
 *
 * <ul>
 * <li><code>fn</code> -- The callback function</li>
 * <li><code>context</code> -- The execution context for the callbackFn.</li>
 * <li><code>args</code> -- Arguments to pass to callbackFn.</li>
 * <li><code>timeout</code> -- Millisecond delay before executing callbackFn.
 *                     (Applies to each iterative execution of callback)</li>
 * <li><code>iterations</code> -- Number of times to repeat the callback.
 * <li><code>until</code> -- Repeat the callback until this function returns
 *                         true.  This setting trumps iterations.</li>
 * <li><code>autoContinue</code> -- Set to false to prevent the AsyncQueue from
 *                        executing the next callback in the Queue after
 *                        the callback completes.</li>
 * <li><code>id</code> -- Name that can be used to get, promote, get the
 *                        indexOf, or delete this callback.</li>
 * </ul>
 *
 * @class AsyncQueue
 * @extends EventTarget
 * @constructor
 * @param callback* {Function|Object} 0..n callbacks to seed the queue
 */
Y.AsyncQueue = function() {
    this._init();
    this.add.apply(this, arguments);
};

var Queue   = Y.AsyncQueue,
    EXECUTE = 'execute',
    SHIFT   = 'shift',
    PROMOTE = 'promote',
    REMOVE  = 'remove',

    isObject   = Y.Lang.isObject,
    isFunction = Y.Lang.isFunction;

/**
 * <p>Static default values used to populate callback configuration properties.
 * Preconfigured defaults include:</p>
 *
 * <ul>
 *  <li><code>autoContinue</code>: <code>true</code></li>
 *  <li><code>iterations</code>: 1</li>
 *  <li><code>timeout</code>: 10 (10ms between callbacks)</li>
 *  <li><code>until</code>: (function to run until iterations &lt;= 0)</li>
 * </ul>
 *
 * @property defaults
 * @type {Object}
 * @static
 */
Queue.defaults = Y.mix({
    autoContinue : true,
    iterations   : 1,
    timeout      : 10,
    until        : function () {
        this.iterations |= 0;
        return this.iterations <= 0;
    }
}, Y.config.queueDefaults || {});

Y.extend(Queue, Y.EventTarget, {
    /**
     * Used to indicate the queue is currently executing a callback.
     *
     * @property _running
     * @type {Boolean|Object} true for synchronous callback execution, the
     *                        return handle from Y.later for async callbacks.
     *                        Otherwise false.
     * @protected
     */
    _running : false,

    /**
     * Initializes the AsyncQueue instance properties and events.
     *
     * @method _init
     * @protected
     */
    _init : function () {
        Y.EventTarget.call(this, { prefix: 'queue', emitFacade: true });

        this._q = [];

        /** 
         * Callback defaults for this instance.  Static defaults that are not
         * overridden are also included.
         *
         * @property defaults
         * @type {Object}
         */
        this.defaults = {};

        this._initEvents();
    },

    /**
     * Initializes the instance events.
     *
     * @method _initEvents
     * @protected
     */
    _initEvents : function () {
        this.publish({
            'execute' : { defaultFn : this._defExecFn,    emitFacade: true },
            'shift'   : { defaultFn : this._defShiftFn,   emitFacade: true },
            'add'     : { defaultFn : this._defAddFn,     emitFacade: true },
            'promote' : { defaultFn : this._defPromoteFn, emitFacade: true },
            'remove'  : { defaultFn : this._defRemoveFn,  emitFacade: true }
        });
    },

    /**
     * Returns the next callback needing execution.  If a callback is
     * configured to repeat via iterations or until, it will be returned until
     * the completion criteria is met.
     *
     * When the queue is empty, null is returned.
     *
     * @method next
     * @return {Function} the callback to execute
     */
    next : function () {
        var callback;

        while (this._q.length) {
            callback = this._q[0] = this._prepare(this._q[0]);
            if (callback && callback.until()) {
                this.fire(SHIFT, { callback: callback });
                callback = null;
            } else {
                break;
            }
        }

        return callback || null;
    },

    /**
     * Default functionality for the &quot;shift&quot; event.  Shifts the
     * callback stored in the event object's <em>callback</em> property from
     * the queue if it is the first item.
     *
     * @method _defShiftFn
     * @param e {Event} The event object
     * @protected
     */
    _defShiftFn : function (e) {
        if (this.indexOf(e.callback) === 0) {
            this._q.shift();
        }
    },

    /**
     * Creates a wrapper function to execute the callback using the aggregated 
     * configuration generated by combining the static AsyncQueue.defaults, the
     * instance defaults, and the specified callback settings.
     *
     * The wrapper function is decorated with the callback configuration as
     * properties for runtime modification.
     *
     * @method _prepare
     * @param callback {Object|Function} the raw callback
     * @return {Function} a decorated function wrapper to execute the callback
     * @protected
     */
    _prepare: function (callback) {
        if (isFunction(callback) && callback._prepared) {
            return callback;
        }

        var config = Y.merge(
            Queue.defaults,
            { context : this, args: [], _prepared: true },
            this.defaults,
            (isFunction(callback) ? { fn: callback } : callback)),
            
            wrapper = Y.bind(function () {
                if (!wrapper._running) {
                    wrapper.iterations--;
                }
                if (isFunction(wrapper.fn)) {
                    wrapper.fn.apply(wrapper.context || Y,
                                     Y.Array(wrapper.args));
                }
            }, this);
            
        return Y.mix(wrapper, config);
    },

    /**
     * Sets the queue in motion.  All queued callbacks will be executed in
     * order unless pause() or stop() is called or if one of the callbacks is
     * configured with autoContinue: false.
     *
     * @method run
     * @return {AsyncQueue} the AsyncQueue instance
     * @chainable
     */
    run : function () {
        var callback,
            cont = true;

        for (callback = this.next();
            cont && callback && !this.isRunning();
            callback = this.next())
        {
            cont = (callback.timeout < 0) ?
                this._execute(callback) :
                this._schedule(callback);
        }

        if (!callback) {
            /**
             * Event fired after the last queued callback is executed.
             * @event complete
             */
            this.fire('complete');
        }

        return this;
    },

    /**
     * Handles the execution of callbacks. Returns a boolean indicating
     * whether it is appropriate to continue running.
     *
     * @method _execute
     * @param callback {Object} the callback object to execute
     * @return {Boolean} whether the run loop should continue
     * @protected
     */
    _execute : function (callback) {
        this._running = callback._running = true;

        callback.iterations--;
        this.fire(EXECUTE, { callback: callback });

        var cont = this._running && callback.autoContinue;

        this._running = callback._running = false;

        return cont;
    },

    /**
     * Schedules the execution of asynchronous callbacks.
     *
     * @method _schedule
     * @param callback {Object} the callback object to execute
     * @return {Boolean} whether the run loop should continue
     * @protected
     */
    _schedule : function (callback) {
        this._running = Y.later(callback.timeout, this, function () {
            if (this._execute(callback)) {
                this.run();
            }
        });

        return false;
    },

    /**
     * Determines if the queue is waiting for a callback to complete execution.
     *
     * @method isRunning
     * @return {Boolean} true if queue is waiting for a 
     *                   from any initiated transactions
     */
    isRunning : function () {
        return !!this._running;
    },

    /**
     * Default functionality for the &quot;execute&quot; event.  Executes the
     * callback function
     *
     * @method _defExecFn
     * @param e {Event} the event object
     * @protected
     */
    _defExecFn : function (e) {
        e.callback();
    },

    /**
     * Add any number of callbacks to the end of the queue. Callbacks may be
     * provided as functions or objects.
     *
     * @method add
     * @param callback* {Function|Object} 0..n callbacks
     * @return {AsyncQueue} the AsyncQueue instance
     * @chainable
     */
    add : function () {
        this.fire('add', { callbacks: Y.Array(arguments,0,true) });

        return this;
    },

    /**
     * Default functionality for the &quot;add&quot; event.  Adds the callbacks
     * in the event facade to the queue. Callbacks successfully added to the
     * queue are present in the event's <code>added</code> property in the
     * after phase.
     *
     * @method _defAddFn
     * @param e {Event} the event object
     * @protected
     */
    _defAddFn : function(e) {
        var _q = this._q,
            added = [];

        Y.Array.each(e.callbacks, function (c) {
            if (isObject(c)) {
                _q.push(c);
                added.push(c);
            }
        });

        e.added = added;
    },

    /**
     * Pause the execution of the queue after the execution of the current
     * callback completes.  If called from code outside of a queued callback,
     * clears the timeout for the pending callback. Paused queue can be
     * restarted with q.run()
     *
     * @method pause
     * @return {AsyncQueue} the AsyncQueue instance
     * @chainable
     */
    pause: function () {
        if (isObject(this._running)) {
            this._running.cancel();
        }

        this._running = false;

        return this;
    },

    /**
     * Stop and clear the queue after the current execution of the
     * current callback completes.
     *
     * @method stop
     * @return {AsyncQueue} the AsyncQueue instance
     * @chainable
     */
    stop : function () { 
        this._q = [];

        return this.pause();
    },

    /** 
     * Returns the current index of a callback.  Pass in either the id or
     * callback function from getCallback.
     *
     * @method indexOf
     * @param callback {String|Function} the callback or its specified id
     * @return {Number} index of the callback or -1 if not found
     */
    indexOf : function (callback) {
        var i = 0, len = this._q.length, c;

        for (; i < len; ++i) {
            c = this._q[i];
            if (c === callback || c.id === callback) {
                return i;
            }
        }

        return -1;
    },

    /**
     * Retrieve a callback by its id.  Useful to modify the configuration
     * while the queue is running.
     *
     * @method getCallback
     * @param id {String} the id assigned to the callback
     * @return {Object} the callback object
     */
    getCallback : function (id) {
        var i = this.indexOf(id);

        return (i > -1) ? this._q[i] : null;
    },

    /**
     * Promotes the named callback to the top of the queue. If a callback is
     * currently executing or looping (via until or iterations), the promotion
     * is scheduled to occur after the current callback has completed.
     *
     * @method promote
     * @param callback {String|Object} the callback object or a callback's id
     * @return {AsyncQueue} the AsyncQueue instance
     * @chainable
     */
    promote : function (callback) {
        var payload = { callback : callback },e;

        if (this.isRunning()) {
            e = this.after(SHIFT, function () {
                    this.fire(PROMOTE, payload);
                    e.detach();
                }, this);
        } else {
            this.fire(PROMOTE, payload);
        }

        return this;
    },

    /**
     * <p>Default functionality for the &quot;promote&quot; event.  Promotes the
     * named callback to the head of the queue.</p>
     *
     * <p>The event object will contain a property &quot;callback&quot;, which
     * holds the id of a callback or the callback object itself.</p>
     *
     * @method _defPromoteFn
     * @param e {Event} the custom event
     * @protected
     */
    _defPromoteFn : function (e) {
        var i = this.indexOf(e.callback),
            promoted = (i > -1) ? this._q.splice(i,1)[0] : null;

        e.promoted = promoted;

        if (promoted) {
            this._q.unshift(promoted);
        }
    },

    /**
     * Removes the callback from the queue.  If the queue is active, the
     * removal is scheduled to occur after the current callback has completed.
     *
     * @method remove
     * @param callback {String|Object} the callback object or a callback's id
     * @return {AsyncQueue} the AsyncQueue instance
     * @chainable
     */
    remove : function (callback) {
        var payload = { callback : callback },e;

        // Can't return the removed callback because of the deferral until
        // current callback is complete
        if (this.isRunning()) {
            e = this.after(SHIFT, function () {
                    this.fire(REMOVE, payload);
                    e.detach();
                },this);
        } else {
            this.fire(REMOVE, payload);
        }

        return this;
    },

    /**
     * <p>Default functionality for the &quot;remove&quot; event.  Removes the
     * callback from the queue.</p>
     *
     * <p>The event object will contain a property &quot;callback&quot;, which
     * holds the id of a callback or the callback object itself.</p>
     *
     * @method _defRemoveFn
     * @param e {Event} the custom event
     * @protected
     */
    _defRemoveFn : function (e) {
        var i = this.indexOf(e.callback);

        e.removed = (i > -1) ? this._q.splice(i,1)[0] : null;
    },

    /**
     * Returns the number of callbacks in the queue.
     *
     * @method size
     * @return {Number}
     */
    size : function () {
        // next() flushes callbacks that have met their until() criteria and
        // therefore shouldn't count since they wouldn't execute anyway.
        if (!this.isRunning()) {
            this.next();
        }

        return this._q.length;
    }
});



}, '3.8.1', {"requires": ["event-custom"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('gesture-simulate', function (Y, NAME) {

/**
 * Simulate high-level user gestures by generating a set of native DOM events.
 *
 * @module gesture-simulate
 * @requires event-simulate, async-queue, node-screen
 */

var NAME = "gesture-simulate",

    // phantomjs check may be temporary, until we determine if it really support touch all the way through, like it claims to (http://code.google.com/p/phantomjs/issues/detail?id=375)
    SUPPORTS_TOUCH = ((Y.config.win && ("ontouchstart" in Y.config.win)) && !(Y.UA.phantomjs) && !(Y.UA.chrome && Y.UA.chrome < 6)),

    gestureNames = {
        tap: 1,
        doubletap: 1,
        press: 1,
        move: 1,
        flick: 1,
        pinch: 1,
        rotate: 1
    },

    touchEvents = {
        touchstart: 1,
        touchmove: 1,
        touchend: 1,
        touchcancel: 1
    },

    document = Y.config.doc,
    emptyTouchList,

    EVENT_INTERVAL = 20,        // 20ms
    START_PAGEX,                // will be adjusted to the node element center
    START_PAGEY,                // will be adjusted to the node element center

    // defaults that user can override.
    DEFAULTS = {
        // tap gestures
        HOLD_TAP: 10,           // 10ms
        DELAY_TAP: 10,          // 10ms

        // press gesture
        HOLD_PRESS: 3000,       // 3sec
        MIN_HOLD_PRESS: 1000,   // 1sec
        MAX_HOLD_PRESS: 60000,  // 1min

        // move gesture
        DISTANCE_MOVE: 200,     // 200 pixels
        DURATION_MOVE: 1000,    // 1sec
        MAX_DURATION_MOVE: 5000,// 5sec

        // flick gesture
        MIN_VELOCITY_FLICK: 1.3,
        DISTANCE_FLICK: 200,     // 200 pixels
        DURATION_FLICK: 1000,    // 1sec
        MAX_DURATION_FLICK: 5000,// 5sec

        // pinch/rotation
        DURATION_PINCH: 1000     // 1sec
    },

    TOUCH_START = 'touchstart',
    TOUCH_MOVE = 'touchmove',
    TOUCH_END = 'touchend',

    GESTURE_START = 'gesturestart',
    GESTURE_CHANGE = 'gesturechange',
    GESTURE_END = 'gestureend',

    MOUSE_UP    = 'mouseup',
    MOUSE_MOVE  = 'mousemove',
    MOUSE_DOWN  = 'mousedown',
    MOUSE_CLICK = 'click',
    MOUSE_DBLCLICK = 'dblclick',

    X_AXIS = 'x',
    Y_AXIS = 'y';

/**
 *
 */
function Simulations(node) {
    if(!node) {
        Y.error(NAME+': invalid target node');
    }
    this.node = node;
    this.target = Y.Node.getDOMNode(node);

    var startXY = this.node.getXY(),
        dims = this._getDims();

    START_PAGEX = startXY[0] + (dims[0])/2;
    START_PAGEY = startXY[1] + (dims[1])/2;
}

Simulations.prototype = {

    /**
     * Helper method to convert a degree to a radian.
     * 
     * @method _toRadian
     * @private
     * @param {Number} deg A degree to be converted to a radian.
     * @return {Number} The degree in radian. 
     */
    _toRadian: function(deg) {
        return deg * (Math.PI/180);
    },

    /**
     * Helper method to get height/width while accounting for 
     * rotation/scale transforms where possible by using the 
     * bounding client rectangle height/width instead of the 
     * offsetWidth/Height which region uses.
     * @method _getDims
     * @private
     * @return {Array} Array with [height, width]
     */
    _getDims : function() {
        var region,
            width,
            height;

        // Ideally, this should be in DOM somewhere.
        if (this.target.getBoundingClientRect) {
            region = this.target.getBoundingClientRect();

            if ("height" in region) {
                height = region.height;
            } else {
                // IE7,8 has getBCR, but no height.
                height = Math.abs(region.bottom - region.top);
            }

            if ("width" in region) {
                width = region.width;
            } else {
                // IE7,8 has getBCR, but no width.
                width = Math.abs(region.right - region.left);
            }
        } else {
            region = this.node.get("region");
            width = region.width;
            height = region.height;
        }

        return [width, height];
    },

    /**
     * Helper method to convert a point relative to the node element into 
     * the point in the page coordination.
     * 
     * @method _calculateDefaultPoint
     * @private
     * @param {Array} point A point relative to the node element.
     * @return {Array} The same point in the page coordination. 
     */
    _calculateDefaultPoint: function(point) {

        var height;

        if(!Y.Lang.isArray(point) || point.length === 0) {
            point = [START_PAGEX, START_PAGEY];
        } else {
            if(point.length == 1) {
                height = this._getDims[1];
                point[1] = height/2;
            }
            // convert to page(viewport) coordination
            point[0] = this.node.getX() + point[0];
            point[1] = this.node.getY() + point[1];
        }

        return point;
    },

    /**
     * The "rotate" and "pinch" methods are essencially same with the exact same 
     * arguments. Only difference is the required parameters. The rotate method 
     * requires "rotation" parameter while the pinch method requires "startRadius" 
     * and "endRadius" parameters.
     *
     * @method rotate
     * @param {Function} cb The callback to execute when the gesture simulation 
     *      is completed.
     * @param {Array} center A center point where the pinch gesture of two fingers
     *      should happen. It is relative to the top left corner of the target 
     *      node element.
     * @param {Number} startRadius A radius of start circle where 2 fingers are 
     *      on when the gesture starts. This is optional. The default is a fourth of 
     *      either target node width or height whichever is smaller.
     * @param {Number} endRadius A radius of end circle where 2 fingers will be on when
     *      the pinch or spread gestures are completed. This is optional. 
     *      The default is a fourth of either target node width or height whichever is less.
     * @param {Number} duration A duration of the gesture in millisecond.
     * @param {Number} start A start angle(0 degree at 12 o'clock) where the 
     *      gesture should start. Default is 0.  
     * @param {Number} rotation A rotation in degree. It is required.
     */
    rotate: function(cb, center, startRadius, endRadius, duration, start, rotation) {
        var radius,
            r1 = startRadius,   // optional
            r2 = endRadius;     // optional

        if(!Y.Lang.isNumber(r1) || !Y.Lang.isNumber(r2) || r1<0 || r2<0) {
            radius = (this.target.offsetWidth < this.target.offsetHeight)? 
                this.target.offsetWidth/4 : this.target.offsetHeight/4;
            r1 = radius;
            r2 = radius;
        }

        // required
        if(!Y.Lang.isNumber(rotation)) {
            Y.error(NAME+'Invalid rotation detected.');
        }

        this.pinch(cb, center, r1, r2, duration, start, rotation);
    },

    /**
     * The "rotate" and "pinch" methods are essencially same with the exact same 
     * arguments. Only difference is the required parameters. The rotate method 
     * requires "rotation" parameter while the pinch method requires "startRadius" 
     * and "endRadius" parameters.
     *
     * The "pinch" gesture can simulate various 2 finger gestures such as pinch, 
     * spread and/or rotation. The "startRadius" and "endRadius" are required.
     * If endRadius is larger than startRadius, it becomes a spread gesture 
     * otherwise a pinch gesture. 
     *
     * @method pinch
     * @param {Function} cb The callback to execute when the gesture simulation 
     *      is completed.
     * @param {Array} center A center point where the pinch gesture of two fingers
     *      should happen. It is relative to the top left corner of the target 
     *      node element.
     * @param {Number} startRadius A radius of start circle where 2 fingers are 
     *      on when the gesture starts. This paramenter is required.
     * @param {Number} endRadius A radius of end circle where 2 fingers will be on when
     *      the pinch or spread gestures are completed. This parameter is required.
     * @param {Number} duration A duration of the gesture in millisecond.
     * @param {Number} start A start angle(0 degree at 12 o'clock) where the 
     *      gesture should start. Default is 0.  
     * @param {Number} rotation If rotation is desired during the pinch or 
     *      spread gestures, this parameter can be used. Default is 0 degree.  
     */
    pinch: function(cb, center, startRadius, endRadius, duration, start, rotation) {
        var eventQueue,
            i,
            interval = EVENT_INTERVAL,
            touches,
            id = 0,
            r1 = startRadius,   // required
            r2 = endRadius,     // required
            radiusPerStep,
            centerX, centerY,
            startScale, endScale, scalePerStep,
            startRot, endRot, rotPerStep,
            path1 = {start: [], end: []}, // paths for 1st and 2nd fingers. 
            path2 = {start: [], end: []},
            steps,
            touchMove;

        center = this._calculateDefaultPoint(center);

        if(!Y.Lang.isNumber(r1) || !Y.Lang.isNumber(r2) || r1<0 || r2<0) {
            Y.error(NAME+'Invalid startRadius and endRadius detected.');
        }

        if(!Y.Lang.isNumber(duration) || duration <= 0) {
            duration = DEFAULTS.DURATION_PINCH;
        }

        if(!Y.Lang.isNumber(start)) {
            start = 0.0;
        } else {
            start = start%360;
            while(start < 0) {
                start += 360;
            }
        }

        if(!Y.Lang.isNumber(rotation)) {
            rotation = 0.0;
        }

        Y.AsyncQueue.defaults.timeout = interval;
        eventQueue = new Y.AsyncQueue();

        // range determination
        centerX = center[0];
        centerY = center[1];

        startRot = start;
        endRot = start + rotation;

        // 1st finger path
        path1.start = [
            centerX + r1*Math.sin(this._toRadian(startRot)), 
            centerY - r1*Math.cos(this._toRadian(startRot))
        ];
        path1.end   = [
            centerX + r2*Math.sin(this._toRadian(endRot)), 
            centerY - r2*Math.cos(this._toRadian(endRot))
        ];
        
        // 2nd finger path
        path2.start = [
            centerX - r1*Math.sin(this._toRadian(startRot)), 
            centerY + r1*Math.cos(this._toRadian(startRot))
        ];
        path2.end   = [
            centerX - r2*Math.sin(this._toRadian(endRot)), 
            centerY + r2*Math.cos(this._toRadian(endRot))
        ];

        startScale = 1.0;
        endScale = endRadius/startRadius;

        // touch/gesture start
        eventQueue.add({
            fn: function() {
                var coord1, coord2, coord, touches;

                // coordinate for each touch object.
                coord1 = {
                    pageX: path1.start[0], 
                    pageY: path1.start[1],
                    clientX: path1.start[0], 
                    clientY: path1.start[1]
                };
                coord2 = {
                    pageX: path2.start[0], 
                    pageY: path2.start[1],
                    clientX: path2.start[0], 
                    clientY: path2.start[1]
                };
                touches = this._createTouchList([Y.merge({
                    identifier: (id++)   
                }, coord1), Y.merge({
                    identifier: (id++)
                }, coord2)]);

                // coordinate for top level event
                coord = {
                    pageX: (path1.start[0] + path2.start[0])/2,
                    pageY: (path1.start[0] + path2.start[1])/2,
                    clientX: (path1.start[0] + path2.start[0])/2,
                    clientY: (path1.start[0] + path2.start[1])/2
                };

                this._simulateEvent(this.target, TOUCH_START, Y.merge({
                    touches: touches,
                    targetTouches: touches,
                    changedTouches: touches,
                    scale: startScale,
                    rotation: startRot
                }, coord));

                if(Y.UA.ios >= 2.0) {
                    /* gesture starts when the 2nd finger touch starts.
                    * The implementation will fire 1 touch start event for both fingers,
                    * simulating 2 fingers touched on the screen at the same time.
                    */
                    this._simulateEvent(this.target, GESTURE_START, Y.merge({
                        scale: startScale,
                        rotation: startRot
                    }, coord));
                }
            },
            timeout: 0,
            context: this
        });

        // gesture change
        steps = Math.floor(duration/interval);
        radiusPerStep = (r2 - r1)/steps;
        scalePerStep = (endScale - startScale)/steps;
        rotPerStep = (endRot - startRot)/steps;
        
        touchMove = function(step) {
            var radius = r1 + (radiusPerStep)*step,
                px1 = centerX + radius*Math.sin(this._toRadian(startRot + rotPerStep*step)),
                py1 = centerY - radius*Math.cos(this._toRadian(startRot + rotPerStep*step)),
                px2 = centerX - radius*Math.sin(this._toRadian(startRot + rotPerStep*step)),
                py2 = centerY + radius*Math.cos(this._toRadian(startRot + rotPerStep*step)),
                px = (px1+px2)/2,
                py = (py1+py2)/2,
                coord1, coord2, coord, touches;

            // coordinate for each touch object.    
            coord1 = {
                pageX: px1,
                pageY: py1,
                clientX: px1,
                clientY: py1
            };
            coord2 = {
                pageX: px2,
                pageY: py2,
                clientX: px2,
                clientY: py2
            };
            touches = this._createTouchList([Y.merge({
                identifier: (id++)   
            }, coord1), Y.merge({
                identifier: (id++)
            }, coord2)]);

            // coordinate for top level event
            coord = {
                pageX: px,
                pageY: py,
                clientX: px,
                clientY: py
            };

            this._simulateEvent(this.target, TOUCH_MOVE, Y.merge({
                touches: touches,
                targetTouches: touches,
                changedTouches: touches,
                scale: startScale + scalePerStep*step,
                rotation: startRot + rotPerStep*step
            }, coord));

            if(Y.UA.ios >= 2.0) {
                this._simulateEvent(this.target, GESTURE_CHANGE, Y.merge({
                    scale: startScale + scalePerStep*step,
                    rotation: startRot + rotPerStep*step
                }, coord));
            }
        };

        for (i=0; i < steps; i++) {
            eventQueue.add({
                fn: touchMove,
                args: [i],
                context: this
            });
        }

        // gesture end
        eventQueue.add({
            fn: function() {
                var emptyTouchList = this._getEmptyTouchList(),
                    coord1, coord2, coord, touches;

                // coordinate for each touch object.
                coord1 = {
                    pageX: path1.end[0], 
                    pageY: path1.end[1],
                    clientX: path1.end[0], 
                    clientY: path1.end[1]
                };
                coord2 = {
                    pageX: path2.end[0], 
                    pageY: path2.end[1],
                    clientX: path2.end[0], 
                    clientY: path2.end[1]
                };
                touches = this._createTouchList([Y.merge({
                    identifier: (id++)   
                }, coord1), Y.merge({
                    identifier: (id++)
                }, coord2)]);

                // coordinate for top level event
                coord = {
                    pageX: (path1.end[0] + path2.end[0])/2,
                    pageY: (path1.end[0] + path2.end[1])/2,
                    clientX: (path1.end[0] + path2.end[0])/2,
                    clientY: (path1.end[0] + path2.end[1])/2
                };  

                if(Y.UA.ios >= 2.0) {
                    this._simulateEvent(this.target, GESTURE_END, Y.merge({
                        scale: endScale,
                        rotation: endRot
                    }, coord));
                }

                this._simulateEvent(this.target, TOUCH_END, Y.merge({
                    touches: emptyTouchList,
                    targetTouches: emptyTouchList,
                    changedTouches: touches,
                    scale: endScale,
                    rotation: endRot
                }, coord));
            },
            context: this
        });

        if(cb && Y.Lang.isFunction(cb)) {
            eventQueue.add({
                fn: cb,

                // by default, the callback runs the node context where 
                // simulateGesture method is called.
                context: this.node

                //TODO: Use args to pass error object as 1st param if there is an error.
                //args: 
            });
        }

        eventQueue.run();
    },

    /**
     * The "tap" gesture can be used for various single touch point gestures 
     * such as single tap, N number of taps, long press. The default is a single 
     * tap.
     * 
     * @method tap
     * @param {Function} cb The callback to execute when the gesture simulation 
     *      is completed.
     * @param {Array} point A point(relative to the top left corner of the 
     *      target node element) where the tap gesture should start. The default 
     *      is the center of the taget node.
     * @param {Number} times The number of taps. Default is 1.
     * @param {Number} hold The hold time in milliseconds between "touchstart" and
     *      "touchend" event generation. Default is 10ms.
     * @param {Number} delay The time gap in millisecond between taps if this
     *      gesture has more than 1 tap. Default is 10ms.
     */
    tap: function(cb, point, times, hold, delay) {           
        var eventQueue = new Y.AsyncQueue(),
            emptyTouchList = this._getEmptyTouchList(),
            touches,
            coord,
            i,
            touchStart,
            touchEnd;

        point = this._calculateDefaultPoint(point);

        if(!Y.Lang.isNumber(times) || times < 1) {
            times = 1;
        }

        if(!Y.Lang.isNumber(hold)) {
            hold = DEFAULTS.HOLD_TAP;
        }

        if(!Y.Lang.isNumber(delay)) {
            delay = DEFAULTS.DELAY_TAP;
        }

        coord = {
            pageX: point[0], 
            pageY: point[1],
            clientX: point[0], 
            clientY: point[1]
        };

        touches = this._createTouchList([Y.merge({identifier: 0}, coord)]);

        touchStart = function() {
            this._simulateEvent(this.target, TOUCH_START, Y.merge({
                touches: touches,
                targetTouches: touches,
                changedTouches: touches
            }, coord));
        };
        
        touchEnd = function() {
            this._simulateEvent(this.target, TOUCH_END, Y.merge({
                touches: emptyTouchList,
                targetTouches: emptyTouchList,
                changedTouches: touches
            }, coord));
        };
        
        for (i=0; i < times; i++) {
            eventQueue.add({
                fn: touchStart,
                context: this,
                timeout: (i === 0)? 0 : delay
            });

            eventQueue.add({
                fn: touchEnd,
                context: this,
                timeout: hold
            });
        }

        if(times > 1 && !SUPPORTS_TOUCH) {
            eventQueue.add({
                fn: function() {
                    this._simulateEvent(this.target, MOUSE_DBLCLICK, coord);
                },
                context: this
            });
        }

        if(cb && Y.Lang.isFunction(cb)) {
            eventQueue.add({
                fn: cb,

                // by default, the callback runs the node context where 
                // simulateGesture method is called.
                context: this.node

                //TODO: Use args to pass error object as 1st param if there is an error.
                //args: 
            });
        }

        eventQueue.run();
    },

    /**
     * The "flick" gesture is a specialized "move" that has some velocity 
     * and the movement always runs either x or y axis. The velocity is calculated
     * with "distance" and "duration" arguments. If the calculated velocity is 
     * below than the minimum velocity, the given duration will be ignored and 
     * new duration will be created to make a valid flick gesture.
     *   
     * @method flick
     * @param {Function} cb The callback to execute when the gesture simulation 
     *      is completed.
     * @param {Array} point A point(relative to the top left corner of the 
     *      target node element) where the flick gesture should start. The default 
     *      is the center of the taget node.
     * @param {String} axis Either "x" or "y".
     * @param {Number} distance A distance in pixels to flick.
     * @param {Number} duration A duration of the gesture in millisecond.
     * 
     */
    flick: function(cb, point, axis, distance, duration) {
        var path;

        point = this._calculateDefaultPoint(point);

        if(!Y.Lang.isString(axis)) {
            axis = X_AXIS;
        } else {
            axis = axis.toLowerCase();
            if(axis !== X_AXIS && axis !== Y_AXIS) {
                Y.error(NAME+'(flick): Only x or y axis allowed');
            }
        }

        if(!Y.Lang.isNumber(distance)) { 
            distance = DEFAULTS.DISTANCE_FLICK; 
        }

        if(!Y.Lang.isNumber(duration)){
            duration = DEFAULTS.DURATION_FLICK; // ms
        } else {
            if(duration > DEFAULTS.MAX_DURATION_FLICK) {
                duration = DEFAULTS.MAX_DURATION_FLICK;
            }
        }

        /**
         * Check if too slow for a flick.
         * Adjust duration if the calculated velocity is less than 
         * the minimum velcocity to be claimed as a flick.
         */
        if(Math.abs(distance)/duration < DEFAULTS.MIN_VELOCITY_FLICK) {
            duration = Math.abs(distance)/DEFAULTS.MIN_VELOCITY_FLICK;
        }

        path = {
            start: Y.clone(point),
            end: [
                (axis === X_AXIS) ? point[0]+distance : point[0],
                (axis === Y_AXIS) ? point[1]+distance : point[1]
            ]
        };

        this._move(cb, path, duration);
    },

    /**
     * The "move" gesture simulate the movement of any direction between 
     * the straight line of start and end point for the given duration.
     * The path argument is an object with "point", "xdist" and "ydist" properties.
     * The "point" property is an array with x and y coordinations(relative to the
     * top left corner of the target node element) while "xdist" and "ydist" 
     * properties are used for the distance along the x and y axis. A negative 
     * distance number can be used to drag either left or up direction. 
     * 
     * If no arguments are given, it will simulate the default move, which
     * is moving 200 pixels from the center of the element to the positive X-axis 
     * direction for 1 sec.
     * 
     * @method move
     * @param {Function} cb The callback to execute when the gesture simulation 
     *      is completed.
     * @param {Object} path An object with "point", "xdist" and "ydist".
     * @param {Number} duration A duration of the gesture in millisecond.
     */
    move: function(cb, path, duration) {
        var convertedPath;

        if(!Y.Lang.isObject(path)) {
            path = {
                point: this._calculateDefaultPoint([]),
                xdist: DEFAULTS.DISTANCE_MOVE,
                ydist: 0
            };
        } else {
            // convert to the page coordination
            if(!Y.Lang.isArray(path.point)) {
                path.point = this._calculateDefaultPoint([]);
            } else {
                path.point = this._calculateDefaultPoint(path.point);
            }

            if(!Y.Lang.isNumber(path.xdist)) {
                path.xdist = DEFAULTS.DISTANCE_MOVE;
            }

            if(!Y.Lang.isNumber(path.ydist)) {
                path.ydist = 0;
            }
        }

        if(!Y.Lang.isNumber(duration)){
            duration = DEFAULTS.DURATION_MOVE; // ms
        } else {
            if(duration > DEFAULTS.MAX_DURATION_MOVE) {
                duration = DEFAULTS.MAX_DURATION_MOVE;
            }
        }

        convertedPath = {
            start: Y.clone(path.point),
            end: [path.point[0]+path.xdist, path.point[1]+path.ydist]
        };

        this._move(cb, convertedPath, duration);
    },

    /**
     * A base method on top of "move" and "flick" methods. The method takes
     * the path with start/end properties and duration to generate a set of 
     * touch events for the movement gesture. 
     *
     * @method _move
     * @private
     * @param {Function} cb The callback to execute when the gesture simulation 
     *      is completed.
     * @param {Object} path An object with "start" and "end" properties. Each 
     *      property should be an array with x and y coordination (e.g. start: [100, 50])
     * @param {Number} duration A duration of the gesture in millisecond. 
     */
    _move: function(cb, path, duration) {
        var eventQueue,
            i,
            interval = EVENT_INTERVAL,
            steps, stepX, stepY,
            id = 0,
            touchMove;

        if(!Y.Lang.isNumber(duration)){
            duration = DEFAULTS.DURATION_MOVE; // ms
        } else {
            if(duration > DEFAULTS.MAX_DURATION_MOVE) {
                duration = DEFAULTS.MAX_DURATION_MOVE;
            }
        }

        if(!Y.Lang.isObject(path)) {
            path = {
                start: [
                    START_PAGEX, 
                    START_PAGEY
                ], 
                end: [
                    START_PAGEX + DEFAULTS.DISTANCE_MOVE, 
                    START_PAGEY
                ]
            };
        } else {
            if(!Y.Lang.isArray(path.start)) {
                path.start = [
                    START_PAGEX, 
                    START_PAGEY
                ];
            }
            if(!Y.Lang.isArray(path.end)) {
                path.end = [
                    START_PAGEX + DEFAULTS.DISTANCE_MOVE, 
                    START_PAGEY
                ];
            }
        }

        Y.AsyncQueue.defaults.timeout = interval;
        eventQueue = new Y.AsyncQueue();

        // start
        eventQueue.add({
            fn: function() {
                var coord = {
                        pageX: path.start[0], 
                        pageY: path.start[1],
                        clientX: path.start[0], 
                        clientY: path.start[1]
                    }, 
                    touches = this._createTouchList([
                        Y.merge({identifier: (id++)}, coord)
                    ]);

                this._simulateEvent(this.target, TOUCH_START, Y.merge({
                    touches: touches,
                    targetTouches: touches,
                    changedTouches: touches
                }, coord));
            },
            timeout: 0,
            context: this
        });

        // move
        steps = Math.floor(duration/interval);
        stepX = (path.end[0] - path.start[0])/steps;
        stepY = (path.end[1] - path.start[1])/steps;

        touchMove = function(step) {
            var px = path.start[0]+(stepX * step),
                py = path.start[1]+(stepY * step), 
                coord = {
                    pageX: px, 
                    pageY: py,
                    clientX: px,
                    clientY: py
                }, 
                touches = this._createTouchList([
                    Y.merge({identifier: (id++)}, coord)
                ]);

            this._simulateEvent(this.target, TOUCH_MOVE, Y.merge({
                touches: touches,
                targetTouches: touches,
                changedTouches: touches
            }, coord));
        };

        for (i=0; i < steps; i++) {
            eventQueue.add({
                fn: touchMove,
                args: [i],
                context: this
            });
        }

        // last move
        eventQueue.add({
            fn: function() {
                var coord = {
                        pageX: path.end[0], 
                        pageY: path.end[1],
                        clientX: path.end[0], 
                        clientY: path.end[1]
                    },
                    touches = this._createTouchList([
                        Y.merge({identifier: id}, coord)
                    ]);

                this._simulateEvent(this.target, TOUCH_MOVE, Y.merge({
                    touches: touches,
                    targetTouches: touches,
                    changedTouches: touches
                }, coord));
            },
            timeout: 0,
            context: this
        });

        // end
        eventQueue.add({
            fn: function() {
                var coord = {
                    pageX: path.end[0], 
                    pageY: path.end[1],
                    clientX: path.end[0], 
                    clientY: path.end[1]
                },
                emptyTouchList = this._getEmptyTouchList(),
                touches = this._createTouchList([
                    Y.merge({identifier: id}, coord)
                ]);

                this._simulateEvent(this.target, TOUCH_END, Y.merge({
                    touches: emptyTouchList,
                    targetTouches: emptyTouchList,
                    changedTouches: touches
                }, coord));
            },
            context: this
        });
        
        if(cb && Y.Lang.isFunction(cb)) {
            eventQueue.add({
                fn: cb,

                // by default, the callback runs the node context where 
                // simulateGesture method is called.
                context: this.node

                //TODO: Use args to pass error object as 1st param if there is an error.
                //args: 
            });
        }
        
        eventQueue.run();
    },

    /**
     * Helper method to return a singleton instance of empty touch list.
     * 
     * @method _getEmptyTouchList
     * @private
     * @return {TouchList | Array} An empty touch list object.
     */
    _getEmptyTouchList: function() {
        if(!emptyTouchList) {
            emptyTouchList = this._createTouchList([]);
        }

        return emptyTouchList;
    },

    /**
     * Helper method to convert an array with touch points to TouchList object as
     * defined in http://www.w3.org/TR/touch-events/
     * 
     * @method _createTouchList
     * @private
     * @param {Array} touchPoints 
     * @return {TouchList | Array} If underlaying platform support creating touch list
     *      a TouchList object will be returned otherwise a fake Array object 
     *      will be returned.
     */
    _createTouchList: function(touchPoints) {
        /*
        * Android 4.0.3 emulator:
        * Native touch api supported starting in version 4.0 (Ice Cream Sandwich).
        * However the support seems limited. In Android 4.0.3 emulator, I got
        * "TouchList is not defined".
        */
        var touches = [],
            touchList,
            self = this;

        if(!!touchPoints && Y.Lang.isArray(touchPoints)) {
            if(Y.UA.android && Y.UA.android >= 4.0 || Y.UA.ios && Y.UA.ios >= 2.0) {
                Y.each(touchPoints, function(point) {
                    if(!point.identifier) {point.identifier = 0;}
                    if(!point.pageX) {point.pageX = 0;}
                    if(!point.pageY) {point.pageY = 0;}
                    if(!point.screenX) {point.screenX = 0;}
                    if(!point.screenY) {point.screenY = 0;}

                    touches.push(document.createTouch(Y.config.win, 
                        self.target,
                        point.identifier, 
                        point.pageX, point.pageY, 
                        point.screenX, point.screenY));
                });

                touchList = document.createTouchList.apply(document, touches);
            } else if(Y.UA.ios && Y.UA.ios < 2.0) { 
                Y.error(NAME+': No touch event simulation framework present.');
            } else {
                // this will inclide android(Y.UA.android && Y.UA.android < 4.0) 
                // and desktops among all others. 

                /**
                 * Touch APIs are broken in androids older than 4.0. We will use 
                 * simulated touch apis for these versions. 
                 */
                touchList = [];
                Y.each(touchPoints, function(point) {
                    if(!point.identifier) {point.identifier = 0;}
                    if(!point.clientX)  {point.clientX = 0;}
                    if(!point.clientY)  {point.clientY = 0;}
                    if(!point.pageX)    {point.pageX = 0;}
                    if(!point.pageY)    {point.pageY = 0;}
                    if(!point.screenX)  {point.screenX = 0;}
                    if(!point.screenY)  {point.screenY = 0;}

                    touchList.push({
                        target: self.target,
                        identifier: point.identifier,
                        clientX: point.clientX,
                        clientY: point.clientY,
                        pageX: point.pageX,
                        pageY: point.pageY,
                        screenX: point.screenX,
                        screenY: point.screenY
                    });
                });

                touchList.item = function(i) {
                    return touchList[i];
                };
            }
        } else {
            Y.error(NAME+': Invalid touchPoints passed');
        }

        return touchList;
    },

    /**
     * @method _simulateEvent
     * @private
     * @param {HTMLElement} target The DOM element that's the target of the event.
     * @param {String} type The type of event or name of the supported gesture to simulate 
     *      (i.e., "click", "doubletap", "flick").
     * @param {Object} options (Optional) Extra options to copy onto the event object. 
     *      For gestures, options are used to refine the gesture behavior.
     * @return {void}
     */
    _simulateEvent: function(target, type, options) {
        var touches;

        if (touchEvents[type]) {
            if(SUPPORTS_TOUCH) {
                Y.Event.simulate(target, type, options);
            } else {
                // simulate using mouse events if touch is not applicable on this platform.
                // but only single touch event can be simulated.
                if(this._isSingleTouch(options.touches, options.targetTouches, options.changedTouches)) {
                    type = {
                        touchstart: MOUSE_DOWN,
                        touchmove: MOUSE_MOVE,
                        touchend: MOUSE_UP
                    }[type];

                    options.button = 0;
                    options.relatedTarget = null; // since we are not using mouseover event.

                    // touchend has none in options.touches.
                    touches = (type === MOUSE_UP)? options.changedTouches : options.touches;

                    options = Y.mix(options, {
                        screenX: touches.item(0).screenX,
                        screenY: touches.item(0).screenY,
                        clientX: touches.item(0).clientX,
                        clientY: touches.item(0).clientY
                    }, true);

                    Y.Event.simulate(target, type, options);

                    if(type == MOUSE_UP) {
                        Y.Event.simulate(target, MOUSE_CLICK, options);
                    }
                } else {
                    Y.error("_simulateEvent(): Event '" + type + "' has multi touch objects that can't be simulated in your platform.");
                }
            }
        } else {
            // pass thru for all non touch events
            Y.Event.simulate(target, type, options);
        }
    },

    /**
     * Helper method to check the single touch.
     * @method _isSingleTouch
     * @private
     * @param {TouchList} touches
     * @param {TouchList} targetTouches
     * @param {TouchList} changedTouches
     */
    _isSingleTouch: function(touches, targetTouches, changedTouches) {
        return (touches && (touches.length <= 1)) && 
            (targetTouches && (targetTouches.length <= 1)) &&
            (changedTouches && (changedTouches.length <= 1));
    }
};

/**
 * A gesture simulation class.
 */
Y.GestureSimulation = Simulations;

/**
 * Various simulation default behavior properties. If user override 
 * Y.GestureSimulation.defaults, overriden values will be used and this 
 * should be done before the gesture simulation.  
 */
Y.GestureSimulation.defaults = DEFAULTS;

/**
 * The high level gesture names that YUI knows how to simulate.
 */
Y.GestureSimulation.GESTURES = gestureNames;

/**
 * Simulates the higher user level gesture of the given name on a target. 
 * This method generates a set of low level touch events(Apple specific gesture 
 * events as well for the iOS platforms) asynchronously. Note that gesture  
 * simulation is relying on `Y.Event.simulate()` method to generate 
 * the touch events under the hood. The `Y.Event.simulate()` method
 * itself is a synchronous method.
 * 
 * Users are suggested to use `Node.simulateGesture()` method which 
 * basically calls this method internally. Supported gestures are `tap`, 
 * `doubletap`, `press`, `move`, `flick`, `pinch` and `rotate`.
 * 
 * The `pinch` gesture is used to simulate the pinching and spreading of two
 * fingers. During a pinch simulation, rotation is also possible. Essentially
 * `pinch` and `rotate` simulations share the same base implementation to allow
 * both pinching and rotation at the same time. The only difference is `pinch`
 * requires `start` and `end` option properties while `rotate` requires `rotation` 
 * option property.
 * 
 * The `pinch` and `rotate` gestures can be described as placing 2 fingers along a
 * circle. Pinching and spreading can be described by start and end circles while 
 * rotation occurs on a single circle. If the radius of the start circle is greater 
 * than the end circle, the gesture becomes a pinch, otherwise it is a spread spread.
 * 
 * @example
 *
 *     var node = Y.one("#target");
 *       
 *     // double tap example
 *     node.simulateGesture("doubletap", function() {
 *         // my callback function
 *     });
 *     
 *     // flick example from the center of the node, move 50 pixels down for 50ms)
 *     node.simulateGesture("flick", {
 *         axis: y,
 *         distance: -100
 *         duration: 50
 *     }, function() {
 *         // my callback function
 *     });
 *     
 *     // simulate rotating a node 75 degrees counter-clockwise 
 *     node.simulateGesture("rotate", {
 *         rotation: -75
 *     });
 *
 *     // simulate a pinch and a rotation at the same time. 
 *     // fingers start on a circle of radius 100 px, placed at top/bottom
 *     // fingers end on a circle of radius 50px, placed at right/left 
 *     node.simulateGesture("pinch", {
 *         r1: 100,
 *         r2: 50,
 *         start: 0
 *         rotation: 90
 *     });
 *     
 * @method simulateGesture
 * @param {HTMLElement|Node} node The YUI node or HTML element that's the target 
 *      of the event.
 * @param {String} name The name of the supported gesture to simulate. The 
 *      supported gesture name is one of "tap", "doubletap", "press", "move", 
 *      "flick", "pinch" and "rotate". 
 * @param {Object} [options] Extra options used to define the gesture behavior:
 * 
 *      Valid options properties for the `tap` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x,y] coordinates 
 *        where the tap should be simulated. Default is the center of the node 
 *        element.
 *      @param {Number} [options.hold=10] (Optional) The hold time in milliseconds. 
 *        This is the time between `touchstart` and `touchend` event generation.
 *      @param {Number} [options.times=1] (Optional) Indicates the number of taps.
 *      @param {Number} [options.delay=10] (Optional) The number of milliseconds 
 *        before the next tap simulation happens. This is valid only when `times` 
 *        is more than 1. 
 *        
 *      Valid options properties for the `doubletap` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x,y] coordinates 
 *        where the doubletap should be simulated. Default is the center of the 
 *        node element.
 * 
 *      Valid options properties for the `press` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x,y] coordinates 
 *        where the press should be simulated. Default is the center of the node 
 *        element.
 *      @param {Number} [options.hold=3000] (Optional) The hold time in milliseconds. 
 *        This is the time between `touchstart` and `touchend` event generation. 
 *        Default is 3000ms (3 seconds).
 * 
 *      Valid options properties for the `move` gesture:
 *      
 *      @param {Object} [options.path] (Optional) Indicates the path of the finger 
 *        movement. It's an object with three optional properties: `point`, 
 *        `xdist` and  `ydist`.
 *        @param {Array} [options.path.point] A starting point of the gesture.
 *          Default is the center of the node element.
 *        @param {Number} [options.path.xdist=200] A distance to move in pixels  
 *          along the X axis. A negative distance value indicates moving left.
 *        @param {Number} [options.path.ydist=0] A distance to move in pixels  
 *          along the Y axis. A negative distance value indicates moving up.
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds.
 * 
 *      Valid options properties for the `flick` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x, y] coordinates 
 *        where the flick should be simulated. Default is the center of the 
 *        node element.
 *      @param {String} [options.axis='x'] (Optional) Valid values are either 
 *        "x" or "y". Indicates axis to move along. The flick can move to one of 
 *        4 directions(left, right, up and down).
 *      @param {Number} [options.distance=200] (Optional) Distance to move in pixels
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds. User given value could be automatically 
 *        adjusted by the framework if it is below the minimum velocity to be 
 *        a flick gesture.
 * 
 *      Valid options properties for the `pinch` gesture:
 *      
 *      @param {Array} [options.center] (Optional) The center of the circle where 
 *        two fingers are placed. Default is the center of the node element.
 *      @param {Number} [options.r1] (Required) Pixel radius of the start circle 
 *        where 2 fingers will be on when the gesture starts. The circles are 
 *        centered at the center of the element.
 *      @param {Number} [options.r2] (Required) Pixel radius of the end circle 
 *        when this gesture ends.
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds.
 *      @param {Number} [options.start=0] (Optional) Starting degree of the first 
 *        finger. The value is relative to the path of the north. Default is 0 
 *        (i.e., 12:00 on a clock).
 *      @param {Number} [options.rotation=0] (Optional) Degrees to rotate from 
 *        the starting degree. A negative value means rotation to the 
 *        counter-clockwise direction.
 * 
 *      Valid options properties for the `rotate` gesture:
 *      
 *      @param {Array} [options.center] (Optional) The center of the circle where 
 *        two fingers are placed. Default is the center of the node element.
 *      @param {Number} [options.r1] (Optional) Pixel radius of the start circle 
 *        where 2 fingers will be on when the gesture starts. The circles are 
 *        centered at the center of the element. Default is a fourth of the node 
 *        element width or height, whichever is smaller.
 *      @param {Number} [options.r2] (Optional) Pixel radius of the end circle 
 *        when this gesture ends. Default is a fourth of the node element width or 
 *        height, whichever is smaller.
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds.
 *      @param {Number} [options.start=0] (Optional) Starting degree of the first 
 *        finger. The value is relative to the path of the north. Default is 0 
 *        (i.e., 12:00 on a clock).
 *      @param {Number} [options.rotation] (Required) Degrees to rotate from 
 *        the starting degree. A negative value means rotation to the 
 *        counter-clockwise direction.
 * 
 * @param {Function} [cb] The callback to execute when the asynchronouse gesture  
 *      simulation is completed. 
 *      @param {Error} cb.err An error object if the simulation is failed.  
 * @return {void}
 * @for Event
 * @static
 */
Y.Event.simulateGesture = function(node, name, options, cb) {

    node = Y.one(node);    

    var sim = new Y.GestureSimulation(node);
    name = name.toLowerCase();

    if(!cb && Y.Lang.isFunction(options)) {
        cb = options;
        options = {};
    }

    options = options || {};

    if (gestureNames[name]) {
        switch(name) {
            // single-touch: point gestures 
            case 'tap':
                sim.tap(cb, options.point, options.times, options.hold, options.delay);
                break;
            case 'doubletap':
                sim.tap(cb, options.point, 2);
                break;
            case 'press':
                if(!Y.Lang.isNumber(options.hold)) {
                    options.hold = DEFAULTS.HOLD_PRESS;
                } else if(options.hold < DEFAULTS.MIN_HOLD_PRESS) {
                    options.hold = DEFAULTS.MIN_HOLD_PRESS;
                } else if(options.hold > DEFAULTS.MAX_HOLD_PRESS) {
                    options.hold = DEFAULTS.MAX_HOLD_PRESS;
                }
                sim.tap(cb, options.point, 1, options.hold);
                break;

            // single-touch: move gestures 
            case 'move':
                sim.move(cb, options.path, options.duration);
                break;
            case 'flick':
                sim.flick(cb, options.point, options.axis, options.distance, 
                    options.duration);
                break;

            // multi-touch: pinch/rotation gestures
            case 'pinch':
                sim.pinch(cb, options.center, options.r1, options.r2, 
                    options.duration, options.start, options.rotation);
                break;    
            case 'rotate':
                sim.rotate(cb, options.center, options.r1, options.r2, 
                    options.duration, options.start, options.rotation);
                break;
        }
    } else {
        Y.error(NAME+': Not a supported gesture simulation: '+name);
    }
};


}, '3.8.1', {"requires": ["async-queue", "event-simulate", "node-screen"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('node-event-simulate', function (Y, NAME) {

/**
 * Adds functionality to simulate events.
 * @module node
 * @submodule node-event-simulate
 */

/**
 * Simulates an event on the node.
 * @param {String} type The type of event (i.e., "click").
 * @param {Object} options (Optional) Extra options to copy onto the event object.
 * @return {void}
 * @for Node
 * @method simulate
 */
Y.Node.prototype.simulate = function (type, options) {
    
    Y.Event.simulate(Y.Node.getDOMNode(this), type, options);
};

/**
 * Simulates the higher user level gesture of the given name on this node. 
 * This method generates a set of low level touch events(Apple specific gesture 
 * events as well for the iOS platforms) asynchronously. Note that gesture  
 * simulation is relying on `Y.Event.simulate()` method to generate 
 * the touch events under the hood. The `Y.Event.simulate()` method
 * itself is a synchronous method.
 * 
 * Supported gestures are `tap`, `doubletap`, `press`, `move`, `flick`, `pinch`
 * and `rotate`.
 * 
 * The `pinch` gesture is used to simulate the pinching and spreading of two
 * fingers. During a pinch simulation, rotation is also possible. Essentially
 * `pinch` and `rotate` simulations share the same base implementation to allow
 * both pinching and rotation at the same time. The only difference is `pinch`
 * requires `start` and `end` option properties while `rotate` requires `rotation` 
 * option property.
 * 
 * The `pinch` and `rotate` gestures can be described as placing 2 fingers along a
 * circle. Pinching and spreading can be described by start and end circles while 
 * rotation occurs on a single circle. If the radius of the start circle is greater 
 * than the end circle, the gesture becomes a pinch, otherwise it is a spread spread.
 * 
 * @example
 *
 *     var node = Y.one("#target");
 *       
 *     // double tap example
 *     node.simulateGesture("doubletap", function() {
 *         // my callback function
 *     });
 *     
 *     // flick example from the center of the node, move 50 pixels down for 50ms)
 *     node.simulateGesture("flick", {
 *         axis: y,
 *         distance: -100
 *         duration: 50
 *     }, function() {
 *         // my callback function
 *     });
 *     
 *     // simulate rotating a node 75 degrees counter-clockwise 
 *     node.simulateGesture("rotate", {
 *         rotation: -75
 *     });
 *
 *     // simulate a pinch and a rotation at the same time. 
 *     // fingers start on a circle of radius 100 px, placed at top/bottom
 *     // fingers end on a circle of radius 50px, placed at right/left 
 *     node.simulateGesture("pinch", {
 *         r1: 100,
 *         r2: 50,
 *         start: 0
 *         rotation: 90
 *     });
 *     
 * @method simulateGesture
 * @param {String} name The name of the supported gesture to simulate. The 
 *      supported gesture name is one of "tap", "doubletap", "press", "move", 
 *      "flick", "pinch" and "rotate". 
 * @param {Object} [options] Extra options used to define the gesture behavior:
 * 
 *      Valid options properties for the `tap` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x,y] coordinates 
 *        where the tap should be simulated. Default is the center of the node 
 *        element.
 *      @param {Number} [options.hold=10] (Optional) The hold time in milliseconds. 
 *        This is the time between `touchstart` and `touchend` event generation.
 *      @param {Number} [options.times=1] (Optional) Indicates the number of taps.
 *      @param {Number} [options.delay=10] (Optional) The number of milliseconds 
 *        before the next tap simulation happens. This is valid only when `times` 
 *        is more than 1. 
 *        
 *      Valid options properties for the `doubletap` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x,y] coordinates 
 *        where the doubletap should be simulated. Default is the center of the 
 *        node element.
 * 
 *      Valid options properties for the `press` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x,y] coordinates 
 *        where the press should be simulated. Default is the center of the node 
 *        element.
 *      @param {Number} [options.hold=3000] (Optional) The hold time in milliseconds. 
 *        This is the time between `touchstart` and `touchend` event generation. 
 *        Default is 3000ms (3 seconds).
 * 
 *      Valid options properties for the `move` gesture:
 *      
 *      @param {Object} [options.path] (Optional) Indicates the path of the finger 
 *        movement. It's an object with three optional properties: `point`, 
 *        `xdist` and  `ydist`.
 *        @param {Array} [options.path.point] A starting point of the gesture.
 *          Default is the center of the node element.
 *        @param {Number} [options.path.xdist=200] A distance to move in pixels  
 *          along the X axis. A negative distance value indicates moving left.
 *        @param {Number} [options.path.ydist=0] A distance to move in pixels  
 *          along the Y axis. A negative distance value indicates moving up.
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds.
 * 
 *      Valid options properties for the `flick` gesture:
 *      
 *      @param {Array} [options.point] (Optional) Indicates the [x, y] coordinates 
 *        where the flick should be simulated. Default is the center of the 
 *        node element.
 *      @param {String} [options.axis='x'] (Optional) Valid values are either 
 *        "x" or "y". Indicates axis to move along. The flick can move to one of 
 *        4 directions(left, right, up and down).
 *      @param {Number} [options.distance=200] (Optional) Distance to move in pixels
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds. User given value could be automatically 
 *        adjusted by the framework if it is below the minimum velocity to be 
 *        a flick gesture.
 * 
 *      Valid options properties for the `pinch` gesture:
 *      
 *      @param {Array} [options.center] (Optional) The center of the circle where 
 *        two fingers are placed. Default is the center of the node element.
 *      @param {Number} [options.r1] (Required) Pixel radius of the start circle 
 *        where 2 fingers will be on when the gesture starts. The circles are 
 *        centered at the center of the element.
 *      @param {Number} [options.r2] (Required) Pixel radius of the end circle 
 *        when this gesture ends.
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds.
 *      @param {Number} [options.start=0] (Optional) Starting degree of the first 
 *        finger. The value is relative to the path of the north. Default is 0 
 *        (i.e., 12:00 on a clock).
 *      @param {Number} [options.rotation=0] (Optional) Degrees to rotate from 
 *        the starting degree. A negative value means rotation to the 
 *        counter-clockwise direction.
 * 
 *      Valid options properties for the `rotate` gesture:
 *      
 *      @param {Array} [options.center] (Optional) The center of the circle where 
 *        two fingers are placed. Default is the center of the node element.
 *      @param {Number} [options.r1] (Optional) Pixel radius of the start circle 
 *        where 2 fingers will be on when the gesture starts. The circles are 
 *        centered at the center of the element. Default is a fourth of the node 
 *        element width or height, whichever is smaller.
 *      @param {Number} [options.r2] (Optional) Pixel radius of the end circle 
 *        when this gesture ends. Default is a fourth of the node element width or 
 *        height, whichever is smaller.
 *      @param {Number} [options.duration=1000] (Optional) The duration of the 
 *        gesture in milliseconds.
 *      @param {Number} [options.start=0] (Optional) Starting degree of the first 
 *        finger. The value is relative to the path of the north. Default is 0 
 *        (i.e., 12:00 on a clock).
 *      @param {Number} [options.rotation] (Required) Degrees to rotate from 
 *        the starting degree. A negative value means rotation to the 
 *        counter-clockwise direction.
 * 
 * @param {Function} [cb] The callback to execute when the asynchronouse gesture  
 *      simulation is completed. 
 *      @param {Error} cb.err An error object if the simulation is failed.  
 * @return {void}
 * @for Node
 */
Y.Node.prototype.simulateGesture = function (name, options, cb) {

    Y.Event.simulateGesture(this, name, options, cb);
};


}, '3.8.1', {"requires": ["node-base", "event-simulate", "gesture-simulate"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('node-focusmanager', function (Y, NAME) {

/**
* <p>The Focus Manager Node Plugin makes it easy to manage focus among
* a Node's descendants.  Primarily intended to help with widget development,
* the Focus Manager Node Plugin can be used to improve the keyboard
* accessibility of widgets.</p>
*
* <p>
* When designing widgets that manage a set of descendant controls (i.e. buttons
* in a toolbar, tabs in a tablist, menuitems in a menu, etc.) it is important to
* limit the number of descendants in the browser's default tab flow.  The fewer
* number of descendants in the default tab flow, the easier it is for keyboard
* users to navigate between widgets by pressing the tab key.  When a widget has
* focus it should provide a set of shortcut keys (typically the arrow keys)
* to move focus among its descendants.
* </p>
*
* <p>
* To this end, the Focus Manager Node Plugin makes it easy to define a Node's
* focusable descendants, define which descendant should be in the default tab
* flow, and define the keys that move focus among each descendant.
* Additionally, as the CSS
* <a href="http://www.w3.org/TR/CSS21/selector.html#x38"><code>:focus</code></a>
* pseudo class is not supported on all elements in all
* <a href="http://developer.yahoo.com/yui/articles/gbs/">A-Grade browsers</a>,
* the Focus Manager Node Plugin provides an easy, cross-browser means of
* styling focus.
* </p>
*
* @module node-focusmanager
*/

	//	Frequently used strings

var ACTIVE_DESCENDANT = "activeDescendant",
	ID = "id",
	DISABLED = "disabled",
	TAB_INDEX = "tabIndex",
	FOCUSED = "focused",
	FOCUS_CLASS = "focusClass",
	CIRCULAR = "circular",
	UI = "UI",
	KEY = "key",
	ACTIVE_DESCENDANT_CHANGE = ACTIVE_DESCENDANT + "Change",
	HOST = "host",

	//	Collection of keys that, when pressed, cause the browser viewport
	//	to scroll.
	scrollKeys = {
		37: true,
		38: true,
		39: true,
		40: true
	},

	clickableElements = {
		"a": true,
		"button": true,
		"input": true,
		"object": true
	},

	//	Library shortcuts

	Lang = Y.Lang,
 	UA = Y.UA,

	/**
	* The NodeFocusManager class is a plugin for a Node instance.  The class is used
	* via the <a href="Node.html#method_plug"><code>plug</code></a> method of Node
	* and should not be instantiated directly.
	* @namespace plugin
	* @class NodeFocusManager
	*/
	NodeFocusManager = function () {

		NodeFocusManager.superclass.constructor.apply(this, arguments);

	};


NodeFocusManager.ATTRS = {

	/**
	* Boolean indicating that one of the descendants is focused.
	*
	* @attribute focused
	* @readOnly
	* @default false
	* @type boolean
	*/
	focused: {

		value: false,
		readOnly: true

	},


	/**
	* String representing the CSS selector used to define the descendant Nodes
	* whose focus should be managed.
	*
	* @attribute descendants
	* @type Y.NodeList
	*/
	descendants: {

		getter: function (value) {

			return this.get(HOST).all(value);

		}

	},


	/**
	* <p>Node, or index of the Node, representing the descendant that is either
	* focused or is focusable (<code>tabIndex</code> attribute is set to 0).
	* The value cannot represent a disabled descendant Node.  Use a value of -1
	* to remove all descendant Nodes from the default tab flow.
	* If no value is specified, the active descendant will be inferred using
	* the following criteria:</p>
	* <ol>
	* <li>Examining the <code>tabIndex</code> attribute of each descendant and
	* using the first descendant whose <code>tabIndex</code> attribute is set
	* to 0</li>
	* <li>If no default can be inferred then the value is set to either 0 or
	* the index of the first enabled descendant.</li>
	* </ol>
	*
	* @attribute activeDescendant
	* @type Number
	*/
	activeDescendant: {

		setter: function (value) {

			var isNumber = Lang.isNumber,
				INVALID_VALUE = Y.Attribute.INVALID_VALUE,
				descendantsMap = this._descendantsMap,
				descendants = this._descendants,
				nodeIndex,
				returnValue,
				oNode;


			if (isNumber(value)) {
				nodeIndex = value;
				returnValue = nodeIndex;
			}
			else if ((value instanceof Y.Node) && descendantsMap) {

				nodeIndex = descendantsMap[value.get(ID)];

				if (isNumber(nodeIndex)) {
					returnValue = nodeIndex;
				}
				else {

					//	The user passed a reference to a Node that wasn't one
					//	of the descendants.
					returnValue = INVALID_VALUE;

				}

			}
			else {
				returnValue = INVALID_VALUE;
			}


			if (descendants) {

				oNode = descendants.item(nodeIndex);

				if (oNode && oNode.get("disabled")) {

					//	Setting the "activeDescendant" attribute to the index
					//	of a disabled descendant is invalid.
					returnValue = INVALID_VALUE;

				}

			}

			return returnValue;

		}

	},


	/**
	* Object literal representing the keys to be used to navigate between the
	* next/previous descendant.  The format for the attribute's value is
	* <code>{ next: "down:40", previous: "down:38" }</code>.  The value for the
	* "next" and "previous" properties are used to attach
	* <a href="event/#keylistener"><code>key</code></a> event listeners. See
	* the <a href="event/#keylistener">Using the key Event</a> section of
	* the Event documentation for more information on "key" event listeners.
	*
	* @attribute keys
	* @type Object
	*/
	keys: {

		value: {

			next: null,
			previous: null

		}


	},


	/**
	* String representing the name of class applied to the focused active
	* descendant Node.  Can also be an object literal used to define both the
	* class name, and the Node to which the class should be applied.  If using
	* an object literal, the format is:
	* <code>{ className: "focus", fn: myFunction }</code>.  The function
	* referenced by the <code>fn</code> property in the object literal will be
	* passed a reference to the currently focused active descendant Node.
	*
	* @attribute focusClass
	* @type String|Object
	*/
	focusClass: { },


	/**
	* Boolean indicating if focus should be set to the first/last descendant
	* when the end or beginning of the descendants has been reached.
	*
	* @attribute circular
	* @type Boolean
	* @default true
	*/
	circular: {
		value: true
	}

};

Y.extend(NodeFocusManager, Y.Plugin.Base, {

	//	Protected properties

	//	Boolean indicating if the NodeFocusManager is active.
	_stopped: true,

	//	NodeList representing the descendants selected via the
	//	"descendants" attribute.
	_descendants: null,

	//	Object literal mapping the IDs of each descendant to its index in the
	//	"_descendants" NodeList.
	_descendantsMap: null,

	//	Reference to the Node instance to which the focused class (defined
	//	by the "focusClass" attribute) is currently applied.
	_focusedNode: null,

	//	Number representing the index of the last descendant Node.
	_lastNodeIndex: 0,

	//	Array of handles for event handlers used for a NodeFocusManager instance.
	_eventHandlers: null,



	//	Protected methods

	/**
	* @method _initDescendants
	* @description Sets the <code>tabIndex</code> attribute of all of the
	* descendants to -1, except the active descendant, whose
	* <code>tabIndex</code> attribute is set to 0.
	* @protected
	*/
	_initDescendants: function () {

		var descendants = this.get("descendants"),
			descendantsMap = {},
			nFirstEnabled = -1,
			nDescendants,
			nActiveDescendant = this.get(ACTIVE_DESCENDANT),
			oNode,
			sID,
			i = 0;



		if (Lang.isUndefined(nActiveDescendant)) {
			nActiveDescendant = -1;
		}


		if (descendants) {

			nDescendants = descendants.size();


            for (i = 0; i < nDescendants; i++) {

                oNode = descendants.item(i);

                if (nFirstEnabled === -1 && !oNode.get(DISABLED)) {
                    nFirstEnabled = i;
                }


                //	If the user didn't specify a value for the
                //	"activeDescendant" attribute try to infer it from
                //	the markup.

                //	Need to pass "2" when using "getAttribute" for IE to get
                //	the attribute value as it is set in the markup.
                //	Need to use "parseInt" because IE always returns the
                //	value as a number, whereas all other browsers return
                //	the attribute as a string when accessed
                //	via "getAttribute".

                if (nActiveDescendant < 0 &&
                        parseInt(oNode.getAttribute(TAB_INDEX, 2), 10) === 0) {

                    nActiveDescendant = i;

                }

                if (oNode) {
                    oNode.set(TAB_INDEX, -1);
                }

                sID = oNode.get(ID);

                if (!sID) {
                    sID = Y.guid();
                    oNode.set(ID, sID);
                }

                descendantsMap[sID] = i;

            }


            //	If the user didn't specify a value for the
            //	"activeDescendant" attribute and no default value could be
            //	determined from the markup, then default to 0.

            if (nActiveDescendant < 0) {
                nActiveDescendant = 0;
            }


            oNode = descendants.item(nActiveDescendant);

            //	Check to make sure the active descendant isn't disabled,
            //	and fall back to the first enabled descendant if it is.

            if (!oNode || oNode.get(DISABLED)) {
                oNode = descendants.item(nFirstEnabled);
                nActiveDescendant = nFirstEnabled;
            }

            this._lastNodeIndex = nDescendants - 1;
            this._descendants = descendants;
            this._descendantsMap = descendantsMap;

            this.set(ACTIVE_DESCENDANT, nActiveDescendant);

            //	Need to set the "tabIndex" attribute here, since the
            //	"activeDescendantChange" event handler used to manage
            //	the setting of the "tabIndex" attribute isn't wired up yet.

            if (oNode) {
                oNode.set(TAB_INDEX, 0);
            }

		}

	},


	/**
	* @method _isDescendant
	* @description Determines if the specified Node instance is a descendant
	* managed by the Focus Manager.
	* @param node {Node} Node instance to be checked.
	* @return {Boolean} Boolean indicating if the specified Node instance is a
	* descendant managed by the Focus Manager.
	* @protected
	*/
	_isDescendant: function (node) {

		return (node.get(ID) in this._descendantsMap);

	},


	/**
	* @method _removeFocusClass
	* @description Removes the class name representing focus (as specified by
	* the "focusClass" attribute) from the Node instance to which it is
	* currently applied.
	* @protected
	*/
	_removeFocusClass: function () {

		var oFocusedNode = this._focusedNode,
			focusClass = this.get(FOCUS_CLASS),
			sClassName;

		if (focusClass) {
			sClassName = Lang.isString(focusClass) ?
				focusClass : focusClass.className;
		}

		if (oFocusedNode && sClassName) {
			oFocusedNode.removeClass(sClassName);
		}

	},


	/**
	* @method _detachKeyHandler
	* @description Detaches the "key" event handlers used to support the "keys"
	* attribute.
	* @protected
	*/
	_detachKeyHandler: function () {

		var prevKeyHandler = this._prevKeyHandler,
			nextKeyHandler = this._nextKeyHandler;

		if (prevKeyHandler) {
			prevKeyHandler.detach();
		}

		if (nextKeyHandler) {
			nextKeyHandler.detach();
		}

	},


	/**
	* @method _preventScroll
	* @description Prevents the viewport from scolling when the user presses
	* the up, down, left, or right key.
	* @protected
	*/
	_preventScroll: function (event) {

		if (scrollKeys[event.keyCode] && this._isDescendant(event.target)) {
			event.preventDefault();
		}

	},


	/**
	* @method _fireClick
	* @description Fires the click event if the enter key is pressed while
	* focused on an HTML element that is not natively clickable.
	* @protected
	*/
	_fireClick: function (event) {

		var oTarget = event.target,
			sNodeName = oTarget.get("nodeName").toLowerCase();

		if (event.keyCode === 13 && (!clickableElements[sNodeName] ||
				(sNodeName === "a" && !oTarget.getAttribute("href")))) {


			oTarget.simulate("click");

		}

	},


	/**
	* @method _attachKeyHandler
	* @description Attaches the "key" event handlers used to support the "keys"
	* attribute.
	* @protected
	*/
	_attachKeyHandler: function () {

		this._detachKeyHandler();

		var sNextKey = this.get("keys.next"),
			sPrevKey = this.get("keys.previous"),
			oNode = this.get(HOST),
			aHandlers = this._eventHandlers;

		if (sPrevKey) {
 			this._prevKeyHandler =
				Y.on(KEY, Y.bind(this._focusPrevious, this), oNode, sPrevKey);
		}

		if (sNextKey) {
 			this._nextKeyHandler =
				Y.on(KEY, Y.bind(this._focusNext, this), oNode, sNextKey);
		}


		//	In Opera it is necessary to call the "preventDefault" method in
		//	response to the user pressing the arrow keys in order to prevent
		//	the viewport from scrolling when the user is moving focus among
		//	the focusable descendants.

		if (UA.opera) {
			aHandlers.push(oNode.on("keypress", this._preventScroll, this));
		}


		//	For all browsers except Opera: HTML elements that are not natively
		//	focusable but made focusable via the tabIndex attribute don't
		//	fire a click event when the user presses the enter key.  It is
		//	possible to work around this problem by simplying dispatching a
		//	click event in response to the user pressing the enter key.

		if (!UA.opera) {
			aHandlers.push(oNode.on("keypress", this._fireClick, this));
		}

	},


	/**
	* @method _detachEventHandlers
	* @description Detaches all event handlers used by the Focus Manager.
	* @protected
	*/
	_detachEventHandlers: function () {

		this._detachKeyHandler();

		var aHandlers = this._eventHandlers;

		if (aHandlers) {

			Y.Array.each(aHandlers, function (handle) {
				handle.detach();
			});

			this._eventHandlers = null;

		}

	},


	/**
	* @method _detachEventHandlers
	* @description Attaches all event handlers used by the Focus Manager.
	* @protected
	*/
	_attachEventHandlers: function () {

		var descendants = this._descendants,
			aHandlers,
			oDocument,
			handle;

		if (descendants && descendants.size()) {

			aHandlers = this._eventHandlers || [];
			oDocument = this.get(HOST).get("ownerDocument");


			if (aHandlers.length === 0) {


				aHandlers.push(oDocument.on("focus", this._onDocFocus, this));

				aHandlers.push(oDocument.on("mousedown",
					this._onDocMouseDown, this));

				aHandlers.push(
						this.after("keysChange", this._attachKeyHandler));

				aHandlers.push(
						this.after("descendantsChange", this._initDescendants));

				aHandlers.push(
						this.after(ACTIVE_DESCENDANT_CHANGE,
								this._afterActiveDescendantChange));


				//	For performance: defer attaching all key-related event
				//	handlers until the first time one of the specified
				//	descendants receives focus.

				handle = this.after("focusedChange", Y.bind(function (event) {

					if (event.newVal) {


						this._attachKeyHandler();

						//	Detach this "focusedChange" handler so that the
						//	key-related handlers only get attached once.

						handle.detach();

					}

				}, this));

				aHandlers.push(handle);

			}


			this._eventHandlers = aHandlers;

		}

	},


	//	Protected event handlers

	/**
	* @method _onDocMouseDown
	* @description "mousedown" event handler for the owner document of the
	* Focus Manager's Node.
	* @protected
	* @param event {Object} Object representing the DOM event.
	*/
	_onDocMouseDown: function (event) {

		var oHost = this.get(HOST),
			oTarget = event.target,
			bChildNode = oHost.contains(oTarget),
			node,

			getFocusable = function (node) {

				var returnVal = false;

				if (!node.compareTo(oHost)) {

					returnVal = this._isDescendant(node) ? node :
									getFocusable.call(this, node.get("parentNode"));

				}

				return returnVal;

			};


		if (bChildNode) {

			//	Check to make sure that the target isn't a child node of one
			//	of the focusable descendants.

			node = getFocusable.call(this, oTarget);

			if (node) {
				oTarget = node;
			}
			else if (!node && this.get(FOCUSED)) {

				//	The target was a non-focusable descendant of the root
				//	node, so the "focused" attribute should be set to false.

	 			this._set(FOCUSED, false);
	 			this._onDocFocus(event);

			}

		}


		if (bChildNode && this._isDescendant(oTarget)) {

			//	Fix general problem in Webkit: mousing down on a button or an
			//	anchor element doesn't focus it.

			//	For all browsers: makes sure that the descendant that
			//	was the target of the mousedown event is now considered the
			//	active descendant.

			this.focus(oTarget);
		}
		else if (UA.webkit && this.get(FOCUSED) &&
			(!bChildNode || (bChildNode && !this._isDescendant(oTarget)))) {

			//	Fix for Webkit:

			//	Document doesn't receive focus in Webkit when the user mouses
			//	down on it, so the "focused" attribute won't get set to the
			//	correct value.

			//	The goal is to force a blur if the user moused down on
			//	either: 1) A descendant node, but not one that managed by
			//	the FocusManager, or 2) an element outside of the
			//	FocusManager

 			this._set(FOCUSED, false);
 			this._onDocFocus(event);

		}

	},


	/**
	* @method _onDocFocus
	* @description "focus" event handler for the owner document of the
	* Focus Manager's Node.
	* @protected
	* @param event {Object} Object representing the DOM event.
	*/
	_onDocFocus: function (event) {

		var oTarget = this._focusTarget || event.target,
			bFocused = this.get(FOCUSED),
			focusClass = this.get(FOCUS_CLASS),
			oFocusedNode = this._focusedNode,
			bInCollection;

		if (this._focusTarget) {
			this._focusTarget = null;
		}


		if (this.get(HOST).contains(oTarget)) {

			//	The target is a descendant of the root Node.

			bInCollection = this._isDescendant(oTarget);

			if (!bFocused && bInCollection) {

				//	The user has focused a focusable descendant.

				bFocused = true;

			}
			else if (bFocused && !bInCollection) {

				//	The user has focused a child of the root Node that is
				//	not one of the descendants managed by this Focus Manager
				//	so clear the currently focused descendant.

				bFocused = false;

			}

		}
		else {

			// The target is some other node in the document.

			bFocused = false;

		}


		if (focusClass) {

			if (oFocusedNode && (!oFocusedNode.compareTo(oTarget) || !bFocused)) {
				this._removeFocusClass();
			}

			if (bInCollection && bFocused) {

				if (focusClass.fn) {
					oTarget = focusClass.fn(oTarget);
					oTarget.addClass(focusClass.className);
				}
				else {
					oTarget.addClass(focusClass);
				}

				this._focusedNode = oTarget;

			}

		}


		this._set(FOCUSED, bFocused);

	},


	/**
	* @method _focusNext
	* @description Keydown event handler that moves focus to the next
	* enabled descendant.
	* @protected
	* @param event {Object} Object representing the DOM event.
	* @param activeDescendant {Number} Number representing the index of the
	* next descendant to be focused
	*/
	_focusNext: function (event, activeDescendant) {

		var nActiveDescendant = activeDescendant || this.get(ACTIVE_DESCENDANT),
			oNode;


		if (this._isDescendant(event.target) &&
			(nActiveDescendant <= this._lastNodeIndex)) {

			nActiveDescendant = nActiveDescendant + 1;

			if (nActiveDescendant === (this._lastNodeIndex + 1) &&
				this.get(CIRCULAR)) {

				nActiveDescendant = 0;

			}

			oNode = this._descendants.item(nActiveDescendant);

            if (oNode) {

                if (oNode.get("disabled")) {
                    this._focusNext(event, nActiveDescendant);
                }
                else {
                    this.focus(nActiveDescendant);
                }

            }

		}

		this._preventScroll(event);

	},


	/**
	* @method _focusPrevious
	* @description Keydown event handler that moves focus to the previous
	* enabled descendant.
	* @protected
	* @param event {Object} Object representing the DOM event.
	* @param activeDescendant {Number} Number representing the index of the
	* next descendant to be focused.
	*/
	_focusPrevious: function (event, activeDescendant) {

		var nActiveDescendant = activeDescendant || this.get(ACTIVE_DESCENDANT),
			oNode;

		if (this._isDescendant(event.target) && nActiveDescendant >= 0) {

			nActiveDescendant = nActiveDescendant - 1;

			if (nActiveDescendant === -1 && this.get(CIRCULAR)) {
				nActiveDescendant = this._lastNodeIndex;
			}

            oNode = this._descendants.item(nActiveDescendant);

            if (oNode) {

                if (oNode.get("disabled")) {
                    this._focusPrevious(event, nActiveDescendant);
                }
                else {
                    this.focus(nActiveDescendant);
                }

            }

		}

		this._preventScroll(event);

	},


	/**
	* @method _afterActiveDescendantChange
	* @description afterChange event handler for the
	* "activeDescendant" attribute.
	* @protected
	* @param event {Object} Object representing the change event.
	*/
	_afterActiveDescendantChange: function (event) {

		var oNode = this._descendants.item(event.prevVal);

		if (oNode) {
			oNode.set(TAB_INDEX, -1);
		}

		oNode = this._descendants.item(event.newVal);

		if (oNode) {
			oNode.set(TAB_INDEX, 0);
		}

	},



	//	Public methods

    initializer: function (config) {

		this.start();

    },

	destructor: function () {

		this.stop();
		this.get(HOST).focusManager = null;

    },


	/**
	* @method focus
	* @description Focuses the active descendant and sets the
	* <code>focused</code> attribute to true.
	* @param index {Number} Optional. Number representing the index of the
	* descendant to be set as the active descendant.
	* @param index {Node} Optional. Node instance representing the
	* descendant to be set as the active descendant.
	*/
	focus: function (index) {

		if (Lang.isUndefined(index)) {
			index = this.get(ACTIVE_DESCENDANT);
		}

		this.set(ACTIVE_DESCENDANT, index, { src: UI });

		var oNode = this._descendants.item(this.get(ACTIVE_DESCENDANT));

		if (oNode) {

			oNode.focus();

			//	In Opera focusing a <BUTTON> element programmatically
			//	will result in the document-level focus event handler
			//	"_onDocFocus" being called, resulting in the handler
			//	incorrectly setting the "focused" Attribute to false.  To fix
			//	this, set a flag ("_focusTarget") that the "_onDocFocus" method
			//	can look for to properly handle this edge case.

			if (UA.opera && oNode.get("nodeName").toLowerCase() === "button") {
				this._focusTarget = oNode;
			}

		}

	},


	/**
	* @method blur
	* @description Blurs the current active descendant and sets the
	* <code>focused</code> attribute to false.
	*/
	blur: function () {

		var oNode;

		if (this.get(FOCUSED)) {

			oNode = this._descendants.item(this.get(ACTIVE_DESCENDANT));

			if (oNode) {

				oNode.blur();

				//	For Opera and Webkit:  Blurring an element in either browser
				//	doesn't result in another element (such as the document)
				//	being focused.  Therefore, the "_onDocFocus" method
				//	responsible for managing the application and removal of the
				//	focus indicator class name is never called.

				this._removeFocusClass();

			}

			this._set(FOCUSED, false, { src: UI });
		}

	},


	/**
	* @method start
	* @description Enables the Focus Manager.
	*/
	start: function () {

		if (this._stopped) {

			this._initDescendants();
			this._attachEventHandlers();

			this._stopped = false;

		}

	},


	/**
	* @method stop
	* @description Disables the Focus Manager by detaching all event handlers.
	*/
	stop: function () {

		if (!this._stopped) {

			this._detachEventHandlers();

			this._descendants = null;
			this._focusedNode = null;
			this._lastNodeIndex = 0;
			this._stopped = true;

		}

	},


	/**
	* @method refresh
	* @description Refreshes the Focus Manager's descendants by re-executing the
	* CSS selector query specified by the <code>descendants</code> attribute.
	*/
	refresh: function () {

		this._initDescendants();

		if (!this._eventHandlers) {
			this._attachEventHandlers();
		}

	}

});


NodeFocusManager.NAME = "nodeFocusManager";
NodeFocusManager.NS = "focusManager";

Y.namespace("Plugin");
Y.Plugin.NodeFocusManager = NodeFocusManager;


}, '3.8.1', {"requires": ["attribute", "node", "plugin", "node-event-simulate", "event-key", "event-focus"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('tabview', function (Y, NAME) {

/**
 * The TabView module
 *
 * @module tabview
 */

var _queries = Y.TabviewBase._queries,
    _classNames = Y.TabviewBase._classNames,
    DOT = '.',

    /**
     * Provides a tabbed widget interface
     * @param config {Object} Object literal specifying tabview configuration properties.
     *
     * @class TabView
     * @constructor
     * @extends Widget
     * @uses WidgetParent
     */
    TabView = Y.Base.create('tabView', Y.Widget, [Y.WidgetParent], {
    _afterChildAdded: function() {
        this.get('contentBox').focusManager.refresh();
    },

    _defListNodeValueFn: function() {
        return Y.Node.create(TabView.LIST_TEMPLATE);
    },

    _defPanelNodeValueFn: function() {
        return Y.Node.create(TabView.PANEL_TEMPLATE);
    },

    _afterChildRemoved: function(e) { // update the selected tab when removed
        var i = e.index,
            selection = this.get('selection');

        if (!selection) { // select previous item if selection removed
            selection = this.item(i - 1) || this.item(0);
            if (selection) {
                selection.set('selected', 1);
            }
        }

        this.get('contentBox').focusManager.refresh();
    },

    _initAria: function() {
        var contentBox = this.get('contentBox'),
            tablist = contentBox.one(_queries.tabviewList);

        if (tablist) {
            tablist.setAttrs({
                //'aria-labelledby':
                role: 'tablist'
            });
        }
    },

    bindUI: function() {
        //  Use the Node Focus Manager to add keyboard support:
        //  Pressing the left and right arrow keys will move focus
        //  among each of the tabs.

        this.get('contentBox').plug(Y.Plugin.NodeFocusManager, {
                        descendants: DOT + _classNames.tabLabel,
                        keys: { next: 'down:39', // Right arrow
                                previous: 'down:37' },  // Left arrow
                        circular: true
                    });

        this.after('render', this._setDefSelection);
        this.after('addChild', this._afterChildAdded);
        this.after('removeChild', this._afterChildRemoved);
    },
    
    renderUI: function() {
        var contentBox = this.get('contentBox');
        this._renderListBox(contentBox);
        this._renderPanelBox(contentBox);
        this._childrenContainer = this.get('listNode');
        this._renderTabs(contentBox);
    },

    _setDefSelection: function() {
        //  If no tab is selected, select the first tab.
        var selection = this.get('selection') || this.item(0);

        this.some(function(tab) {
            if (tab.get('selected')) {
                selection = tab;
                return true;
            }
        });
        if (selection) {
            // TODO: why both needed? (via widgetParent/Child)?
            this.set('selection', selection);
            selection.set('selected', 1);
        }
    },

    _renderListBox: function(contentBox) {
        var node = this.get('listNode');
        if (!node.inDoc()) {
            contentBox.append(node);
        }
    },

    _renderPanelBox: function(contentBox) {
        var node = this.get('panelNode');
        if (!node.inDoc()) {
            contentBox.append(node);
        }
    },

    _renderTabs: function(contentBox) {
        var tabs = contentBox.all(_queries.tab),
            panelNode = this.get('panelNode'),
            panels = (panelNode) ? this.get('panelNode').get('children') : null,
            tabview = this;

        if (tabs) { // add classNames and fill in Tab fields from markup when possible
            tabs.addClass(_classNames.tab);
            contentBox.all(_queries.tabLabel).addClass(_classNames.tabLabel);
            contentBox.all(_queries.tabPanel).addClass(_classNames.tabPanel);

            tabs.each(function(node, i) {
                var panelNode = (panels) ? panels.item(i) : null;
                tabview.add({
                    boundingBox: node,
                    contentBox: node.one(DOT + _classNames.tabLabel),
                    panelNode: panelNode
                });
            });
        }
    }
}, {

    LIST_TEMPLATE: '<ul class="' + _classNames.tabviewList + '"></ul>',
    PANEL_TEMPLATE: '<div class="' + _classNames.tabviewPanel + '"></div>',

    ATTRS: {
        defaultChildType: {
            value: 'Tab'
        },

        listNode: {
            setter: function(node) {
                node = Y.one(node);
                if (node) {
                    node.addClass(_classNames.tabviewList);
                }
                return node;
            },

            valueFn: '_defListNodeValueFn'
        },

        panelNode: {
            setter: function(node) {
                node = Y.one(node);
                if (node) {
                    node.addClass(_classNames.tabviewPanel);
                }
                return node;
            },

            valueFn: '_defPanelNodeValueFn'
        },

        tabIndex: {
            value: null
            //validator: '_validTabIndex'
        }
    },

    HTML_PARSER: {
        listNode: _queries.tabviewList,
        panelNode: _queries.tabviewPanel
    }
});

Y.TabView = TabView;
var Lang = Y.Lang,
    _classNames = Y.TabviewBase._classNames;

/**
 * Provides Tab instances for use with TabView
 * @param config {Object} Object literal specifying tabview configuration properties.
 *
 * @class Tab
 * @constructor
 * @extends Widget
 * @uses WidgetChild
 */
Y.Tab = Y.Base.create('tab', Y.Widget, [Y.WidgetChild], {
    BOUNDING_TEMPLATE: '<li class="' + _classNames.tab + '"></li>',
    CONTENT_TEMPLATE: '<a class="' + _classNames.tabLabel + '"></a>',
    PANEL_TEMPLATE: '<div class="' + _classNames.tabPanel + '"></div>',

    _uiSetSelectedPanel: function(selected) {
        this.get('panelNode').toggleClass(_classNames.selectedPanel, selected);
    },

    _afterTabSelectedChange: function(event) {
       this._uiSetSelectedPanel(event.newVal);
    },

    _afterParentChange: function(e) {
        if (!e.newVal) {
            this._remove();
        } else {
            this._add();
        }
    },

    _initAria: function() {
        var anchor = this.get('contentBox'),
            id = anchor.get('id'),
            panel = this.get('panelNode');
 
        if (!id) {
            id = Y.guid();
            anchor.set('id', id);
        }
        //  Apply the ARIA roles, states and properties to each tab
        anchor.set('role', 'tab');
        anchor.get('parentNode').set('role', 'presentation');
 
 
        //  Apply the ARIA roles, states and properties to each panel
        panel.setAttrs({
            role: 'tabpanel',
            'aria-labelledby': id
        });
    },

    syncUI: function() {
        this.set('label', this.get('label'));
        this.set('content', this.get('content'));
        this._uiSetSelectedPanel(this.get('selected'));
    },

    bindUI: function() {
       this.after('selectedChange', this._afterTabSelectedChange);
       this.after('parentChange', this._afterParentChange);
    },

    renderUI: function() {
        this._renderPanel();
        this._initAria();
    },

    _renderPanel: function() {
        this.get('parent').get('panelNode')
            .appendChild(this.get('panelNode'));
    },

    _add: function() {
        var parent = this.get('parent').get('contentBox'),
            list = parent.get('listNode'),
            panel = parent.get('panelNode');

        if (list) {
            list.appendChild(this.get('boundingBox'));
        }

        if (panel) {
            panel.appendChild(this.get('panelNode'));
        }
    },
    
    _remove: function() {
        this.get('boundingBox').remove();
        this.get('panelNode').remove();
    },

    _onActivate: function(e) {
         if (e.target === this) {
             //  Prevent the browser from navigating to the URL specified by the
             //  anchor's href attribute.
             e.domEvent.preventDefault();
             e.target.set('selected', 1);
         }
    },
    
    initializer: function() {
       this.publish(this.get('triggerEvent'), {
           defaultFn: this._onActivate
       });
    },

    _defLabelGetter: function() {
        return this.get('contentBox').getHTML();
    },

    _defLabelSetter: function(label) {
        var labelNode = this.get('contentBox');
        if (labelNode.getHTML() !== label) { // Avoid rewriting existing label.
            labelNode.setHTML(label);
        }
        return label;
    },

    _defContentSetter: function(content) {
        var panel = this.get('panelNode');
        if (panel.getHTML() !== content) { // Avoid rewriting existing content.
            panel.setHTML(content);
        }
        return content;
    },

    _defContentGetter: function() {
        return this.get('panelNode').getHTML();
    },

    // find panel by ID mapping from label href
    _defPanelNodeValueFn: function() {
        var href = this.get('contentBox').get('href') || '',
            parent = this.get('parent'),
            hashIndex = href.indexOf('#'),
            panel;

        href = href.substr(hashIndex);

        if (href.charAt(0) === '#') { // in-page nav, find by ID
            panel = Y.one(href);
            if (panel) {
                panel.addClass(_classNames.tabPanel);
            }
        }

        // use the one found by id, or else try matching indices
        if (!panel && parent) {
            panel = parent.get('panelNode')
                    .get('children').item(this.get('index'));
        }

        if (!panel) { // create if none found
            panel = Y.Node.create(this.PANEL_TEMPLATE);
        }
        return panel;
    }
}, {
    ATTRS: {
        /**
         * @attribute triggerEvent
         * @default "click"
         * @type String
         */
        triggerEvent: {
            value: 'click'
        },

        /**
         * @attribute label
         * @type HTML
         */
        label: {
            setter: '_defLabelSetter',
            getter: '_defLabelGetter'
        },

        /**
         * @attribute content
         * @type HTML
         */
        content: {
            setter: '_defContentSetter',
            getter: '_defContentGetter'
        },

        /**
         * @attribute panelNode
         * @type Y.Node
         */
        panelNode: {
            setter: function(node) {
                node = Y.one(node);
                if (node) {
                    node.addClass(_classNames.tabPanel);
                }
                return node;
            },
            valueFn: '_defPanelNodeValueFn'
        },
        
        tabIndex: {
            value: null,
            validator: '_validTabIndex'
        }

    },

    HTML_PARSER: {
        selected: function() {
            var ret = (this.get('boundingBox').hasClass(_classNames.selectedTab)) ?
                        1 : 0;
            return ret;
        }
    }

});


}, '3.8.1', {
    "requires": [
        "widget",
        "widget-parent",
        "widget-child",
        "tabview-base",
        "node-pluginhost",
        "node-focusmanager"
    ],
    "skinnable": true
});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('substitute', function (Y, NAME) {

/**
 * String variable substitution and string formatting.
 * If included, the substitute method is added to the YUI instance.
 *
 * @module substitute
 */

    var L = Y.Lang, DUMP = 'dump', SPACE = ' ', LBRACE = '{', RBRACE = '}',
		savedRegExp =  /(~-(\d+)-~)/g, lBraceRegExp = /\{LBRACE\}/g, rBraceRegExp = /\{RBRACE\}/g,

    /**
     * The following methods are added to the YUI instance
     * @class YUI~substitute
     */

    /**
    Does {placeholder} substitution on a string.  The object passed as the
    second parameter provides values to replace the {placeholder}s.
    {placeholder} token names must match property names of the object.  For
    example

    `var greeting = Y.substitute("Hello, {who}!", { who: "World" });`

    {placeholder} tokens that are undefined on the object map will be left in
    tact (leaving unsightly "{placeholder}"s in the output string).  If your
    replacement strings *should* include curly braces, use `{LBRACE}` and
    `{RBRACE}` in your object map string value.

    If a function is passed as a third argument, it will be called for each
    {placeholder} found.  The {placeholder} name is passed as the first value
    and the value from the object map is passed as the second.  If the
    {placeholder} contains a space, the first token will be used to identify
    the object map property and the remainder will be passed as a third
    argument to the function.  See below for an example.
    
    If the value in the object map for a given {placeholder} is an object and
    the `dump` module is loaded, the replacement value will be the string
    result of calling `Y.dump(...)` with the object as input.  Include a
    numeric second token in the {placeholder} to configure the depth of the call
    to `Y.dump(...)`, e.g. "{someObject 2}".  See the
    <a href="../classes/YUI.html#method_dump">`dump`</a> method for details.

    @method substitute
    @param {string} s The string that will be modified.
    @param {object} o An object containing the replacement values.
    @param {function} f An optional function that can be used to
                        process each match.  It receives the key,
                        value, and any extra metadata included with
                        the key inside of the braces.
    @param {boolean} recurse if true, the replacement will be recursive,
                        letting you have replacement tokens in replacement text.
                        The default is false.
    @return {string} the substituted string.

    @example

        function getAttrVal(key, value, name) {
            // Return a string describing the named attribute and its value if
            // the first token is @. Otherwise, return the value from the
            // replacement object.
            if (key === "@") {
                value += name + " Value: " + myObject.get(name);
            }
            return value;
        }

        // Assuming myObject.set('foo', 'flowers'),
        // => "Attr: foo Value: flowers"
        var attrVal = Y.substitute("{@ foo}", { "@": "Attr: " }, getAttrVal);
    **/

    substitute = function(s, o, f, recurse) {
        var i, j, k, key, v, meta, saved = [], token, dump,
            lidx = s.length;

        for (;;) {
            i = s.lastIndexOf(LBRACE, lidx);
            if (i < 0) {
                break;
            }
            j = s.indexOf(RBRACE, i);
            if (i + 1 >= j) {
                break;
            }

            //Extract key and meta info
            token = s.substring(i + 1, j);
            key = token;
            meta = null;
            k = key.indexOf(SPACE);
            if (k > -1) {
                meta = key.substring(k + 1);
                key = key.substring(0, k);
            }

            // lookup the value
            v = o[key];

            // if a substitution function was provided, execute it
            if (f) {
                v = f(key, v, meta);
            }

            if (L.isObject(v)) {
                if (!Y.dump) {
                    v = v.toString();
                } else {
                    if (L.isArray(v)) {
                        v = Y.dump(v, parseInt(meta, 10));
                    } else {
                        meta = meta || '';

                        // look for the keyword 'dump', if found force obj dump
                        dump = meta.indexOf(DUMP);
                        if (dump > -1) {
                            meta = meta.substring(4);
                        }

                        // use the toString if it is not the Object toString
                        // and the 'dump' meta info was not found
                        if (v.toString === Object.prototype.toString ||
                            dump > -1) {
                            v = Y.dump(v, parseInt(meta, 10));
                        } else {
                            v = v.toString();
                        }
                    }
                }
			} else if (L.isUndefined(v)) {
                // This {block} has no replace string. Save it for later.
                v = '~-' + saved.length + '-~';
					saved.push(token);

                // break;
            }

            s = s.substring(0, i) + v + s.substring(j + 1);

			if (!recurse) {
				lidx = i - 1;
			} 
		}
		// restore saved {block}s and escaped braces

		return s
			.replace(savedRegExp, function (str, p1, p2) {
				return LBRACE + saved[parseInt(p2,10)] + RBRACE;
			})
			.replace(lBraceRegExp, LBRACE)
			.replace(rBraceRegExp, RBRACE)
		;
	};

    Y.substitute = substitute;
    L.substitute = substitute;



}, '3.8.1', {"requires": ["yui-base"], "optional": ["dump"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('file-html5', function (Y, NAME) {

    /**
     * The FileHTML5 class provides a wrapper for a file pointer in an HTML5 The File wrapper 
     * also implements the mechanics for uploading a file and tracking its progress.
     * @module file-html5
     */     
     
    /**
     * The class provides a wrapper for a file pointer.
     * @class FileHTML5
     * @extends Base
     * @constructor
     * @param {Object} config Configuration object.
     */
    var Lang = Y.Lang,
        Bind = Y.bind,
        Win = Y.config.win;

    var FileHTML5 = function(o) {
        
        var file = null;

        if (FileHTML5.isValidFile(o)) {
            file = o;
        }
        else if (FileHTML5.isValidFile(o.file)) {
            file = o.file;
        }
        else {
            file = false;
        }

        FileHTML5.superclass.constructor.apply(this, arguments);      
        
        if (file && FileHTML5.canUpload()) {
           if (!this.get("file")) {
               this._set("file", file);
           }

           if (!this.get("name")) {
           this._set("name", file.name || file.fileName);
           }

           if (this.get("size") != (file.size || file.fileSize)) {
           this._set("size", file.size || file.fileSize);
           }

           if (!this.get("type")) {
           this._set("type", file.type);
           }

           if (file.hasOwnProperty("lastModifiedDate") && !this.get("dateModified")) {
               this._set("dateModified", file.lastModifiedDate);
           }
        }
    };


    Y.extend(FileHTML5, Y.Base, {

       /**
        * Construction logic executed during FileHTML5 instantiation.
        *
        * @method initializer
        * @protected
        */
        initializer : function (cfg) {
            if (!this.get("id")) {
                this._set("id", Y.guid("file"));
            }
        },

       /**
        * Handler of events dispatched by the XMLHTTPRequest.
        *
        * @method _uploadEventHandler
        * @param {Event} event The event object received from the XMLHTTPRequest.
        * @protected
        */      
        _uploadEventHandler: function (event) {
            var xhr = this.get("xhr");

            switch (event.type) {
                case "progress":
                  /**
                   * Signals that progress has been made on the upload of this file. 
                   *
                   * @event uploadprogress
                   * @param event {Event} The event object for the `uploadprogress` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the XMLHttpRequest instance.</dd>
                   *      <dt>bytesLoaded</dt>
                   *          <dd>The number of bytes of the file that has been uploaded.</dd>
                   *      <dt>bytesTotal</dt>
                   *          <dd>The total number of bytes in the file (the file size)</dd>
                   *      <dt>percentLoaded</dt>
                   *          <dd>The fraction of the file that has been uploaded, out of 100.</dd>
                   *  </dl>
                   */
                   this.fire("uploadprogress", {originEvent: event,
                                               bytesLoaded: event.loaded, 
                                               bytesTotal: this.get("size"), 
                                               percentLoaded: Math.min(100, Math.round(10000*event.loaded/this.get("size"))/100)
                                               });
                   this._set("bytesUploaded", event.loaded);
                   break;

                case "load":
                  /**
                   * Signals that this file's upload has completed and data has been received from the server.
                   *
                   * @event uploadcomplete
                   * @param event {Event} The event object for the `uploadcomplete` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the XMLHttpRequest instance.</dd>
                   *      <dt>data</dt>
                   *          <dd>The data returned by the server.</dd>
                   *  </dl>
                   */

                   if (xhr.status >= 200 && xhr.status <= 299) {
                        this.fire("uploadcomplete", {originEvent: event,
                                                     data: event.target.responseText});
                        var xhrupload = xhr.upload,
                            boundEventHandler = this.get("boundEventHandler");
    
                        xhrupload.removeEventListener ("progress", boundEventHandler);
                        xhrupload.removeEventListener ("error", boundEventHandler);
                        xhrupload.removeEventListener ("abort", boundEventHandler);
                        xhr.removeEventListener ("load", boundEventHandler); 
                        xhr.removeEventListener ("error", boundEventHandler);
                        xhr.removeEventListener ("readystatechange", boundEventHandler);
                        
                        this._set("xhr", null);
                   }
                   else {
                        this.fire("uploaderror", {originEvent: event,
                                                  status: xhr.status,
                                                  statusText: xhr.statusText,
                                                  source: "http"});
                   }                   
                   break;

                case "error":
                  /**
                   * Signals that this file's upload has encountered an error. 
                   *
                   * @event uploaderror
                   * @param event {Event} The event object for the `uploaderror` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the XMLHttpRequest instance.</dd>
                   *      <dt>status</dt>
                   *          <dd>The status code reported by the XMLHttpRequest. If it's an HTTP error,
                                  then this corresponds to the HTTP status code received by the uploader.</dd>
                   *      <dt>statusText</dt>
                   *          <dd>The text of the error event reported by the XMLHttpRequest instance</dd>
                   *      <dt>source</dt>
                   *          <dd>Either "http" (if it's an HTTP error), or "io" (if it's a network transmission 
                   *              error.)</dd>
                   *
                   *  </dl>
                   */
                   this.fire("uploaderror", {originEvent: event,
                                                  status: xhr.status,
                                                  statusText: xhr.statusText,
                                                  source: "io"});
                   break;

                case "abort":

                  /**
                   * Signals that this file's upload has been cancelled. 
                   *
                   * @event uploadcancel
                   * @param event {Event} The event object for the `uploadcancel` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the XMLHttpRequest instance.</dd>
                   *  </dl>
                   */
                   this.fire("uploadcancel", {originEvent: event});
                   break;

                case "readystatechange":

                  /**
                   * Signals that XMLHttpRequest has fired a readystatechange event. 
                   *
                   * @event readystatechange
                   * @param event {Event} The event object for the `readystatechange` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>readyState</dt>
                   *          <dd>The readyState code reported by the XMLHttpRequest instance.</dd>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the XMLHttpRequest instance.</dd>
                   *  </dl>
                   */
                   this.fire("readystatechange", {readyState: event.target.readyState,
                                                  originEvent: event});
                   break;
            }
        },

       /**
        * Starts the upload of a specific file.
        *
        * @method startUpload
        * @param url {String} The URL to upload the file to.
        * @param parameters {Object} (optional) A set of key-value pairs to send as variables along with the file upload HTTP request.
        * @param fileFieldName {String} (optional) The name of the POST variable that should contain the uploaded file ('Filedata' by default)
        */
        startUpload: function(url, parameters, fileFieldName) {
         
            this._set("bytesUploaded", 0);
            
            this._set("xhr", new XMLHttpRequest());
            this._set("boundEventHandler", Bind(this._uploadEventHandler, this));
                         
            var uploadData = new FormData(),
                fileField = fileFieldName || "Filedata",
                xhr = this.get("xhr"),
                xhrupload = this.get("xhr").upload,
                boundEventHandler = this.get("boundEventHandler");

            Y.each(parameters, function (value, key) {uploadData.append(key, value);});
            uploadData.append(fileField, this.get("file"));




            xhr.addEventListener ("loadstart", boundEventHandler, false);
            xhrupload.addEventListener ("progress", boundEventHandler, false);
            xhr.addEventListener ("load", boundEventHandler, false);
            xhr.addEventListener ("error", boundEventHandler, false);
            xhrupload.addEventListener ("error", boundEventHandler, false);
            xhrupload.addEventListener ("abort", boundEventHandler, false);
            xhr.addEventListener ("abort", boundEventHandler, false);
            xhr.addEventListener ("loadend", boundEventHandler, false); 
            xhr.addEventListener ("readystatechange", boundEventHandler, false);

            xhr.open("POST", url, true);

            xhr.withCredentials = this.get("xhrWithCredentials");

            Y.each(this.get("xhrHeaders"), function (value, key) {
                 xhr.setRequestHeader(key, value);
            });

            xhr.send(uploadData);
      
            /**
             * Signals that this file's upload has started. 
             *
             * @event uploadstart
             * @param event {Event} The event object for the `uploadstart` with the
             *                      following payload:
             *  <dl>
             *      <dt>xhr</dt>
             *          <dd>The XMLHttpRequest instance handling the file upload.</dd>
             *  </dl>
             */
             this.fire("uploadstart", {xhr: xhr});

        },

       /**
        * Cancels the upload of a specific file, if currently in progress.
        *
        * @method cancelUpload
        */    
        cancelUpload: function () {
            this.get('xhr').abort();
        }


    }, {

       /**
        * The identity of the class.
        *
        * @property NAME
        * @type String
        * @default 'file'
        * @readOnly
        * @protected
        * @static
        */
        NAME: 'file',

       /**
        * The type of transport.
        *
        * @property TYPE
        * @type String
        * @default 'html5'
        * @readOnly
        * @protected
        * @static
        */
        TYPE: 'html5',

       /**
        * Static property used to define the default attribute configuration of
        * the File.
        *
        * @property ATTRS
        * @type {Object}
        * @protected
        * @static
        */
        ATTRS: {

       /**
        * A String containing the unique id of the file wrapped by the FileFlash instance.
        * The id is supplied by the Flash player uploader.
        *
        * @attribute id
        * @type {String}
        * @initOnly
        */
        id: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The size of the file wrapped by FileHTML5. This value is supplied by the instance of File().
        *
        * @attribute size
        * @type {Number}
        * @initOnly
        */
        size: {
            writeOnce: "initOnly",
            value: 0
        },

       /**
        * The name of the file wrapped by FileHTML5. This value is supplied by the instance of File().
        *
        * @attribute name
        * @type {String}
        * @initOnly
        */
        name: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The date that the file wrapped by FileHTML5 was created on. This value is supplied by the instance of File().
        *
        * @attribute dateCreated
        * @type {Date}
        * @initOnly
        * @default null
        */
        dateCreated: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The date that the file wrapped by FileHTML5 was last modified on. This value is supplied by the instance of File().
        *
        * @attribute dateModified
        * @type {Date}
        * @initOnly
        */
        dateModified: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The number of bytes of the file that has been uploaded to the server. This value is
        * non-zero only while a file is being uploaded.
        *
        * @attribute bytesUploaded
        * @type {Date}
        * @readOnly
        */
        bytesUploaded: {
            readOnly: true,
            value: 0
        },

       /**
        * The type of the file wrapped by FileHTML. This value is provided by the instance of File()
        *
        * @attribute type
        * @type {String}
        * @initOnly
        */
        type: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The pointer to the instance of File() wrapped by FileHTML5.
        *
        * @attribute file
        * @type {File}
        * @initOnly
        */
        file: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The pointer to the instance of XMLHttpRequest used by FileHTML5 to upload the file.
        *
        * @attribute xhr
        * @type {XMLHttpRequest}
        * @initOnly
        */
        xhr: {
            readOnly: true,
            value: null
        },

       /**
        * The dictionary of headers that should be set on the XMLHttpRequest object before
        * sending it.
        *
        * @attribute xhrHeaders
        * @type {Object}
        * @initOnly
        */
        xhrHeaders: {
            value: {}
        },

       /**
        * A Boolean indicating whether the XMLHttpRequest should be sent with user credentials.
        * This does not affect same-site requests. 
        *
        * @attribute xhrWithCredentials
        * @type {Boolean}
        * @initOnly
        */
        xhrWithCredentials: {
            value: true
        },

       /**
        * The bound event handler used to handle events from XMLHttpRequest.
        *
        * @attribute boundEventHandler
        * @type {Function}
        * @initOnly
        */
        boundEventHandler: {
            readOnly: true,
            value: null
        }
        },

       /**
        * Checks whether a specific native file instance is valid
        *
        * @method isValidFile
        * @param file {File} A native File() instance.
        * @static
        */
        isValidFile: function (file) {
            return (Win && Win.File && file instanceof File);
        },

       /**
        * Checks whether the browser has a native upload capability
        * via XMLHttpRequest Level 2.
        *
        * @method canUpload
        * @static
        */
        canUpload: function () {
            return (Win && Win.FormData && Win.XMLHttpRequest);
        }
    });

    Y.FileHTML5 = FileHTML5;

}, '3.8.1', {"requires": ["base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('uploader-queue', function (Y, NAME) {

/**
* The class manages a queue of files that should be uploaded to the server.
* It initializes the required number of uploads, tracks them as they progress,
* and automatically advances to the next upload when a preceding one has completed.
* @module uploader-queue
*/



/**
* This class manages a queue of files to be uploaded to the server.
* @class Uploader.Queue
* @extends Base
* @constructor
*/
var UploaderQueue = function() {
    this.queuedFiles = [];
    this.uploadRetries = {};
    this.numberOfUploads = 0;
    this.currentUploadedByteValues = {};
    this.currentFiles = {};
    this.totalBytesUploaded = 0;
    this.totalBytes = 0;

    UploaderQueue.superclass.constructor.apply(this, arguments);
};


Y.extend(UploaderQueue, Y.Base, {

    /**
    * Stored value of the current queue state
    * @property _currentState
    * @type {String}
    * @protected
    * @default UploaderQueue.STOPPED
    */
    _currentState: UploaderQueue.STOPPED,

    /**
    * Construction logic executed during UploaderQueue instantiation.
    *
    * @method initializer
    * @protected
    */
    initializer : function () {},

    /**
    * Handles and retransmits upload start event.
    *
    * @method _uploadStartHandler
    * @param event The event dispatched during the upload process.
    * @private
    */
    _uploadStartHandler : function (event) {
        var updatedEvent = event;
        updatedEvent.file = event.target;
        updatedEvent.originEvent = event;

        this.fire("uploadstart", updatedEvent);
    },

    /**
    * Handles and retransmits upload error event.
    *
    * @method _uploadErrorHandler
    * @param event The event dispatched during the upload process.
    * @private
    */
    _uploadErrorHandler : function (event) {
        var errorAction = this.get("errorAction"),
            updatedEvent = event,
            fileid,
            retries;

        updatedEvent.file = event.target;
        updatedEvent.originEvent = event;

        this.numberOfUploads-=1;
        delete this.currentFiles[event.target.get("id")];
        this._detachFileEvents(event.target);

        event.target.cancelUpload();

        if (errorAction === UploaderQueue.STOP) {
            this.pauseUpload();
        }

        else if (errorAction === UploaderQueue.RESTART_ASAP) {
            fileid = event.target.get("id");
            retries = this.uploadRetries[fileid] || 0;

            if (retries < this.get("retryCount")) {
                this.uploadRetries[fileid] = retries + 1;
                this.addToQueueTop(event.target);
            }
            this._startNextFile();
        }
        else if (errorAction === UploaderQueue.RESTART_AFTER) {
            fileid = event.target.get("id");
            retries = this.uploadRetries[fileid] || 0;

            if (retries < this.get("retryCount")) {
                this.uploadRetries[fileid] = retries + 1;
                this.addToQueueBottom(event.target);
            }
            this._startNextFile();
        }

        this.fire("uploaderror", updatedEvent);
    },

    /**
    * Launches the upload of the next file in the queue.
    *
    * @method _startNextFile
    * @private
    */
    _startNextFile : function () {
        if (this.queuedFiles.length > 0) {
            var currentFile = this.queuedFiles.shift(),
                fileId = currentFile.get("id"),
                parameters = this.get("perFileParameters"),
                fileParameters = parameters.hasOwnProperty(fileId) ? parameters[fileId] : parameters;

            this.currentUploadedByteValues[fileId] = 0;

            currentFile.on("uploadstart", this._uploadStartHandler, this);
            currentFile.on("uploadprogress", this._uploadProgressHandler, this);
            currentFile.on("uploadcomplete", this._uploadCompleteHandler, this);
            currentFile.on("uploaderror", this._uploadErrorHandler, this);
            currentFile.on("uploadcancel", this._uploadCancelHandler, this);

            currentFile.set("xhrHeaders", this.get("uploadHeaders"));
            currentFile.set("xhrWithCredentials", this.get("withCredentials"));

            currentFile.startUpload(this.get("uploadURL"), fileParameters, this.get("fileFieldName"));

            this._registerUpload(currentFile);
        }
    },

    /**
    * Register a new upload process.
    *
    * @method _registerUpload
    * @private
    */
    _registerUpload : function (file) {
        this.numberOfUploads += 1;
        this.currentFiles[file.get("id")] = file;
    },

    /**
    * Unregisters a new upload process.
    *
    * @method _unregisterUpload
    * @private
    */
    _unregisterUpload : function (file) {
        if (this.numberOfUploads > 0) {
            this.numberOfUploads -= 1;
        }

        delete this.currentFiles[file.get("id")];
        delete this.uploadRetries[file.get("id")];

        this._detachFileEvents(file);
    },

    _detachFileEvents : function (file) {
        file.detach("uploadstart", this._uploadStartHandler);
        file.detach("uploadprogress", this._uploadProgressHandler);
        file.detach("uploadcomplete", this._uploadCompleteHandler);
        file.detach("uploaderror", this._uploadErrorHandler);
        file.detach("uploadcancel", this._uploadCancelHandler);
    },

    /**
    * Handles and retransmits upload complete event.
    *
    * @method _uploadCompleteHandler
    * @param event The event dispatched during the upload process.
    * @private
    */
    _uploadCompleteHandler : function (event) {

        this._unregisterUpload(event.target);

        this.totalBytesUploaded += event.target.get("size");
        delete this.currentUploadedByteValues[event.target.get("id")];


        if (this.queuedFiles.length > 0 && this._currentState === UploaderQueue.UPLOADING) {
            this._startNextFile();
        }

        var updatedEvent = event,
            uploadedTotal = this.totalBytesUploaded,
            percentLoaded = Math.min(100, Math.round(10000*uploadedTotal/this.totalBytes) / 100);

        updatedEvent.file = event.target;
        updatedEvent.originEvent = event;

        Y.each(this.currentUploadedByteValues, function (value) {
            uploadedTotal += value;
        });

        this.fire("totaluploadprogress", {
            bytesLoaded: uploadedTotal,
            bytesTotal: this.totalBytes,
            percentLoaded: percentLoaded
        });

        this.fire("uploadcomplete", updatedEvent);

        if (this.queuedFiles.length === 0 && this.numberOfUploads <= 0) {
            this.fire("alluploadscomplete");
            this._currentState = UploaderQueue.STOPPED;
        }
    },

    /**
    * Handles and retransmits upload cancel event.
    *
    * @method _uploadCancelHandler
    * @param event The event dispatched during the upload process.
    * @private
    */
    _uploadCancelHandler : function (event) {

        var updatedEvent = event;
        updatedEvent.originEvent = event;
        updatedEvent.file = event.target;

        this.fire("uploadcacel", updatedEvent);
    },



    /**
    * Handles and retransmits upload progress event.
    *
    * @method _uploadProgressHandler
    * @param event The event dispatched during the upload process.
    * @private
    */
    _uploadProgressHandler : function (event) {

        this.currentUploadedByteValues[event.target.get("id")] = event.bytesLoaded;

        var updatedEvent = event,
            uploadedTotal = this.totalBytesUploaded,
            percentLoaded = Math.min(100, Math.round(10000*uploadedTotal/this.totalBytes) / 100);

        updatedEvent.originEvent = event;
        updatedEvent.file = event.target;

        this.fire("uploadprogress", updatedEvent);

        Y.each(this.currentUploadedByteValues, function (value) {
            uploadedTotal += value;
        });

        this.fire("totaluploadprogress", {
            bytesLoaded: uploadedTotal,
            bytesTotal: this.totalBytes,
            percentLoaded: percentLoaded
        });
    },

    /**
    * Starts uploading the queued up file list.
    *
    * @method startUpload
    */
    startUpload: function() {
        this.queuedFiles = this.get("fileList").slice(0);
        this.numberOfUploads = 0;
        this.currentUploadedByteValues = {};
        this.currentFiles = {};
        this.totalBytesUploaded = 0;

        this._currentState = UploaderQueue.UPLOADING;

        while (this.numberOfUploads < this.get("simUploads") && this.queuedFiles.length > 0) {
            this._startNextFile();
        }
    },

    /**
    * Pauses the upload process. The ongoing file uploads
    * will complete after this method is called, but no
    * new ones will be launched.
    *
    * @method pauseUpload
    */
    pauseUpload: function () {
        this._currentState = UploaderQueue.STOPPED;
    },

    /**
    * Restarts a paused upload process.
    *
    * @method restartUpload
    */
    restartUpload: function () {
        this._currentState = UploaderQueue.UPLOADING;
        while (this.numberOfUploads < this.get("simUploads")) {
             this._startNextFile();
        }
    },

    /**
    * If a particular file is stuck in an ongoing upload without
    * any progress events, this method allows to force its reupload
    * by cancelling its upload and immediately relaunching it.
    *
    * @method forceReupload
    * @param file {Y.File} The file to force reupload on.
    */
    forceReupload : function (file) {
        var id = file.get("id");
        if (this.currentFiles.hasOwnProperty(id)) {
            file.cancelUpload();
            this._unregisterUpload(file);
            this.addToQueueTop(file);
            this._startNextFile();
        }
    },

    /**
    * Add a new file to the top of the queue (the upload will be
    * launched as soon as the current number of uploading files
    * drops below the maximum permissible value).
    *
    * @method addToQueueTop
    * @param file {Y.File} The file to add to the top of the queue.
    */
    addToQueueTop: function (file) {
            this.queuedFiles.unshift(file);
    },

    /**
    * Add a new file to the bottom of the queue (the upload will be
    * launched after all the other queued files are uploaded.)
    *
    * @method addToQueueBottom
    * @param file {Y.File} The file to add to the bottom of the queue.
    */
    addToQueueBottom: function (file) {
            this.queuedFiles.push(file);
    },

    /**
    * Cancels a specific file's upload. If no argument is passed,
    * all ongoing uploads are cancelled and the upload process is
    * stopped.
    *
    * @method cancelUpload
    * @param file {Y.File} An optional parameter - the file whose upload
    * should be cancelled.
    */
    cancelUpload: function (file) {
        var id,
            i,
            fid;

        if (file) {
            id = file.get("id");

            if (this.currentFiles[id]) {
                this.currentFiles[id].cancelUpload();
                this._unregisterUpload(this.currentFiles[id]);
                if (this._currentState === UploaderQueue.UPLOADING) {
                    this._startNextFile();
                }
            }
            else {
                for (i = 0, len = this.queuedFiles.length; i < len; i++) {
                    if (this.queuedFiles[i].get("id") === id) {
                        this.queuedFiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
        else {
            for (fid in this.currentFiles) {
                this.currentFiles[fid].cancelUpload();
                this._unregisterUpload(this.currentFiles[fid]);
            }

            this.currentUploadedByteValues = {};
            this.currentFiles = {};
            this.totalBytesUploaded = 0;
            this.fire("alluploadscancelled");
            this._currentState = UploaderQueue.STOPPED;
        }
    }
}, {
    /**
    * Static constant for the value of the `errorAction` attribute:
    * prescribes the queue to continue uploading files in case of
    * an error.
    * @property CONTINUE
    * @readOnly
    * @type {String}
    * @static
    */
    CONTINUE: "continue",

    /**
    * Static constant for the value of the `errorAction` attribute:
    * prescribes the queue to stop uploading files in case of
    * an error.
    * @property STOP
    * @readOnly
    * @type {String}
    * @static
    */
    STOP: "stop",

    /**
    * Static constant for the value of the `errorAction` attribute:
    * prescribes the queue to restart a file upload immediately in case of
    * an error.
    * @property RESTART_ASAP
    * @readOnly
    * @type {String}
    * @static
    */
    RESTART_ASAP: "restartasap",

    /**
    * Static constant for the value of the `errorAction` attribute:
    * prescribes the queue to restart an errored out file upload after
    * other files have finished uploading.
    * @property RESTART_AFTER
    * @readOnly
    * @type {String}
    * @static
    */
    RESTART_AFTER: "restartafter",

    /**
    * Static constant for the value of the `_currentState` property:
    * implies that the queue is currently not uploading files.
    * @property STOPPED
    * @readOnly
    * @type {String}
    * @static
    */
    STOPPED: "stopped",

    /**
    * Static constant for the value of the `_currentState` property:
    * implies that the queue is currently uploading files.
    * @property UPLOADING
    * @readOnly
    * @type {String}
    * @static
    */
    UPLOADING: "uploading",

    /**
    * The identity of the class.
    *
    * @property NAME
    * @type String
    * @default 'uploaderqueue'
    * @readOnly
    * @protected
    * @static
    */
    NAME: 'uploaderqueue',

    /**
    * Static property used to define the default attribute configuration of
    * the class.
    *
    * @property ATTRS
    * @type {Object}
    * @protected
    * @static
    */
    ATTRS: {

        /**
        * Maximum number of simultaneous uploads; must be in the
        * range between 1 and 5. The value of `2` is default. It
        * is recommended that this value does not exceed 3.
        * @property simUploads
        * @type Number
        * @default 2
        */
         simUploads: {
                 value: 2,
                 validator: function (val) {
                         return (val >= 1 && val <= 5);
                 }
         },

        /**
        * The action to take in case of error. The valid values for this attribute are:
        * `Y.Uploader.Queue.CONTINUE` (the upload process should continue on other files,
        * ignoring the error), `Y.Uploader.Queue.STOP` (the upload process
        * should stop completely), `Y.Uploader.Queue.RESTART_ASAP` (the upload
        * should restart immediately on the errored out file and continue as planned), or
        * Y.Uploader.Queue.RESTART_AFTER (the upload of the errored out file should restart
        * after all other files have uploaded)
        * @property errorAction
        * @type String
        * @default Y.Uploader.Queue.CONTINUE
        */
        errorAction: {
            value: "continue",
                validator: function (val) {
                return (
                    val === UploaderQueue.CONTINUE ||
                    val === UploaderQueue.STOP ||
                    val === UploaderQueue.RESTART_ASAP ||
                    val === UploaderQueue.RESTART_AFTER
                );
            }
        },

        /**
        * The total number of bytes that has been uploaded.
        * @property bytesUploaded
        * @type Number
        */
        bytesUploaded: {
            readOnly: true,
            value: 0
        },

        /**
        * The total number of bytes in the queue.
        * @property bytesTotal
        * @type Number
        */
        bytesTotal: {
            readOnly: true,
            value: 0
        },

        /**
        * The queue file list. This file list should only be modified
        * before the upload has been started; modifying it after starting
        * the upload has no effect, and `addToQueueTop` or `addToQueueBottom` methods
        * should be used instead.
        * @property fileList
        * @type Number
        */
        fileList: {
            value: [],
            lazyAdd: false,
            setter: function (val) {
                var newValue = val;
                Y.Array.each(newValue, function (value) {
                    this.totalBytes += value.get("size");
                }, this);

                return val;
            }
        },

        /**
        * A String specifying what should be the POST field name for the file
        * content in the upload request.
        *
        * @attribute fileFieldName
        * @type {String}
        * @default Filedata
        */
        fileFieldName: {
            value: "Filedata"
        },

        /**
        * The URL to POST the file upload requests to.
        *
        * @attribute uploadURL
        * @type {String}
        * @default ""
        */
        uploadURL: {
            value: ""
        },

        /**
        * Additional HTTP headers that should be included
        * in the upload request. Due to Flash Player security
        * restrictions, this attribute is only honored in the
        * HTML5 Uploader.
        *
        * @attribute uploadHeaders
        * @type {Object}
        * @default {}
        */
        uploadHeaders: {
            value: {}
        },

        /**
        * A Boolean that specifies whether the file should be
        * uploaded with the appropriate user credentials for the
        * domain. Due to Flash Player security restrictions, this
        * attribute is only honored in the HTML5 Uploader.
        *
        * @attribute withCredentials
        * @type {Boolean}
        * @default true
        */
        withCredentials: {
            value: true
        },


        /**
        * An object, keyed by `fileId`, containing sets of key-value pairs
        * that should be passed as POST variables along with each corresponding
        * file.
        *
        * @attribute perFileParameters
        * @type {Object}
        * @default {}
        */
        perFileParameters: {
            value: {}
        },

        /**
        * The number of times to try re-uploading a file that failed to upload before
        * cancelling its upload.
        *
        * @attribute retryCount
        * @type {Number}
        * @default 3
        */
        retryCount: {
            value: 3
        }

    }
});


Y.namespace('Uploader');
Y.Uploader.Queue = UploaderQueue;


}, '3.8.1', {"requires": ["base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('uploader-html5', function (Y, NAME) {

/**
* This module provides a UI for file selection and multiple file upload capability using
* HTML5 XMLHTTPRequest Level 2 as a transport engine.
* The supported features include: automatic upload queue management, upload progress
* tracking, drag-and-drop support, server response retrieval and error reporting.
*
* @module uploader-html5
*/

// Shorthands for the external modules
var  substitute  = Y.Lang.sub,
     UploaderQueue = Y.Uploader.Queue;

/**
* This module provides a UI for file selection and multiple file upload capability using
* HTML5 XMLHTTPRequest Level 2 as a transport engine.
* @class UploaderHTML5
* @extends Widget
* @constructor
*/
function UploaderHTML5() {
    UploaderHTML5.superclass.constructor.apply ( this, arguments );
}



Y.UploaderHTML5 = Y.extend( UploaderHTML5, Y.Widget, {

    /**
    * Stored reference to the instance of the file input field used to
    * initiate the file selection dialog.
    *
    * @property _fileInputField
    * @type {Node}
    * @protected
    */
    _fileInputField: null,

    /**
    * Stored reference to the click event binding of the `Select Files`
    * button.
    *
    * @property _buttonBinding
    * @type {EventHandle}
    * @protected
    */
    _buttonBinding: null,

    /**
    * Stored reference to the instance of Uploader.Queue used to manage
    * the upload process. This is a read-only property that only exists
    * during an active upload process. Only one queue can be active at
    * a time; if an upload start is attempted while a queue is active,
    * it will be ignored.
    *
    * @property queue
    * @type {Y.Uploader.Queue}
    */
    queue: null,

    // Y.UploaderHTML5 prototype

    /**
    * Construction logic executed during UploaderHTML5 instantiation.
    *
    * @method initializer
    * @protected
    */
    initializer : function () {

        this._fileInputField = null;
        this.queue = null;
        this._buttonBinding = null;
        this._fileList = [];

        // Publish available events

        /**
        * Signals that files have been selected.
        *
        * @event fileselect
        * @param event {Event} The event object for the `fileselect` with the
        *                      following payload:
        *  <dl>
        *      <dt>fileList</dt>
        *          <dd>An `Array` of files selected by the user, encapsulated
        *              in Y.FileHTML5 objects.</dd>
        *  </dl>
        */
        this.publish("fileselect");

        /**
        * Signals that an upload of multiple files has been started.
        *
        * @event uploadstart
        * @param event {Event} The event object for the `uploadstart`.
        */
        this.publish("uploadstart");

        /**
        * Signals that an upload of a specific file has started.
        *
        * @event fileuploadstart
        * @param event {Event} The event object for the `fileuploadstart` with the
        *                      following payload:
        *  <dl>
        *      <dt>file</dt>
        *          <dd>A reference to the Y.File that dispatched the event.</dd>
        *      <dt>originEvent</dt>
        *          <dd>The original event dispatched by Y.File.</dd>
        *  </dl>
        */
        this.publish("fileuploadstart");

        /**
        * Reports on upload progress of a specific file.
        *
        * @event uploadprogress
        * @param event {Event} The event object for the `uploadprogress` with the
        *                      following payload:
        *  <dl>
        *      <dt>file</dt>
        *          <dd>The pointer to the instance of `Y.File` that dispatched the event.</dd>
        *      <dt>bytesLoaded</dt>
        *          <dd>The number of bytes of the file that has been uploaded</dd>
        *      <dt>bytesTotal</dt>
        *          <dd>The total number of bytes in the file</dd>
        *      <dt>percentLoaded</dt>
        *          <dd>The fraction of the file that has been uploaded, out of 100</dd>
        *      <dt>originEvent</dt>
        *          <dd>The original event dispatched by the HTML5 uploader</dd>
        *  </dl>
        */
        this.publish("uploadprogress");

        /**
        * Reports on the total upload progress of the file list.
        *
        * @event totaluploadprogress
        * @param event {Event} The event object for the `totaluploadprogress` with the
        *                      following payload:
        *  <dl>
        *      <dt>bytesLoaded</dt>
        *          <dd>The number of bytes of the file list that has been uploaded</dd>
        *      <dt>bytesTotal</dt>
        *          <dd>The total number of bytes in the file list</dd>
        *      <dt>percentLoaded</dt>
        *          <dd>The fraction of the file list that has been uploaded, out of 100</dd>
        *  </dl>
        */
        this.publish("totaluploadprogress");

        /**
        * Signals that a single file upload has been completed.
        *
        * @event uploadcomplete
        * @param event {Event} The event object for the `uploadcomplete` with the
        *                      following payload:
        *  <dl>
        *      <dt>file</dt>
        *          <dd>The pointer to the instance of `Y.File` whose upload has been completed.</dd>
        *      <dt>originEvent</dt>
        *          <dd>The original event fired by the SWF Uploader</dd>
        *      <dt>data</dt>
        *          <dd>Data returned by the server.</dd>
        *  </dl>
        */
        this.publish("uploadcomplete");

        /**
        * Signals that the upload process of the entire file list has been completed.
        *
        * @event alluploadscomplete
        * @param event {Event} The event object for the `alluploadscomplete`.
        */
        this.publish("alluploadscomplete");

        /**
        * Signals that a error has occurred in a specific file's upload process.
        *
        * @event uploaderror
        * @param event {Event} The event object for the `uploaderror` with the
        *                      following payload:
        *  <dl>
        *      <dt>originEvent</dt>
        *          <dd>The original error event fired by the HTML5 Uploader. </dd>
        *      <dt>file</dt>
        *          <dd>The pointer at the instance of Y.File that returned the error.</dd>
        *      <dt>status</dt>
        *          <dd>The status reported by the XMLHttpRequest object.</dd>
        *      <dt>statusText</dt>
        *          <dd>The statusText reported by the XMLHttpRequest object.</dd>
        *  </dl>
        */
        this.publish("uploaderror");

        /**
        * Signals that a dragged object has entered into the uploader's associated drag-and-drop area.
        *
        * @event dragenter
        * @param event {Event} The event object for the `dragenter`.
        */
        this.publish("dragenter");

        /**
        * Signals that an object has been dragged over the uploader's associated drag-and-drop area.
        *
        * @event dragover
        * @param event {Event} The event object for the `dragover`.
        */
        this.publish("dragover");

        /**
        * Signals that an object has been dragged off of the uploader's associated drag-and-drop area.
        *
        * @event dragleave
        * @param event {Event} The event object for the `dragleave`.
        */
        this.publish("dragleave");

        /**
        * Signals that an object has been dropped over the uploader's associated drag-and-drop area.
        *
        * @event drop
        * @param event {Event} The event object for the `drop` with the
        *                      following payload:
        *  <dl>
        *      <dt>fileList</dt>
        *          <dd>An `Array` of files dropped by the user, encapsulated
        *              in Y.FileHTML5 objects.</dd>
        *  </dl>
        */
        this.publish("drop");

    },

    /**
    * Create the DOM structure for the UploaderHTML5.
    * UploaderHTML5's DOM structure consists of a "Select Files" button that can
    * be replaced by the developer's widget of choice; and a hidden file input field
    * that is used to instantiate the File Select dialog.
    *
    * @method renderUI
    * @protected
    */
    renderUI : function () {
        var contentBox = this.get('contentBox'),
            selButton = this.get("selectFilesButton");

        selButton.setStyles({width:"100%", height:"100%"});
        contentBox.append(selButton);
        this._fileInputField = Y.Node.create(UploaderHTML5.HTML5FILEFIELD_TEMPLATE);
        contentBox.append(this._fileInputField);
    },

    /**
    * Binds to the UploaderHTML5 UI and subscribes to the necessary events.
    *
    * @method bindUI
    * @protected
    */
    bindUI : function () {

        this._bindSelectButton();
        this._setMultipleFiles();
        this._setFileFilters();
        this._bindDropArea();
        this._triggerEnabled();

        this.after("multipleFilesChange", this._setMultipleFiles, this);
        this.after("fileFiltersChange", this._setFileFilters, this);
        this.after("enabledChange", this._triggerEnabled, this);
        this.after("selectFilesButtonChange", this._bindSelectButton, this);
        this.after("dragAndDropAreaChange", this._bindDropArea, this);
        this.after("tabIndexChange", function () {
            this.get("selectFilesButton").set("tabIndex", this.get("tabIndex"));
        }, this);
        this._fileInputField.on("change", this._updateFileList, this);

        this.get("selectFilesButton").set("tabIndex", this.get("tabIndex"));
    },


    /**
    * Recreates the file field to null out the previous list of files and
    * thus allow for an identical file list selection.
    *
    * @method _rebindFileField
    * @protected
    */
    _rebindFileField : function () {
        this._fileInputField.remove(true);
        this._fileInputField = Y.Node.create(UploaderHTML5.HTML5FILEFIELD_TEMPLATE);
        this.get("contentBox").append(this._fileInputField);
        this._fileInputField.on("change", this._updateFileList, this);
        this._setMultipleFiles();
        this._setFileFilters();
    },


    /**
    * Binds the specified drop area's drag and drop events to the
    * uploader's custom handler.
    *
    * @method _bindDropArea
    * @protected
    */
    _bindDropArea : function (event) {
        var ev = event || {prevVal: null},
            ddArea = this.get("dragAndDropArea");

        if (ev.prevVal !== null) {
            ev.prevVal.detach('drop', this._ddEventHandler);
            ev.prevVal.detach('dragenter', this._ddEventHandler);
            ev.prevVal.detach('dragover', this._ddEventHandler);
            ev.prevVal.detach('dragleave', this._ddEventHandler);
        }

        if (ddArea !== null) {
            ddArea.on('drop', this._ddEventHandler, this);
            ddArea.on('dragenter', this._ddEventHandler, this);
            ddArea.on('dragover', this._ddEventHandler, this);
            ddArea.on('dragleave', this._ddEventHandler, this);
        }
    },

    /**
    * Binds the instantiation of the file select dialog to the current file select
    * control.
    *
    * @method _bindSelectButton
    * @protected
    */
    _bindSelectButton : function () {
       this._buttonBinding = this.get("selectFilesButton").on("click", this.openFileSelectDialog, this);
    },

    /**
    * Handles the drag and drop events from the uploader's specified drop
    * area.
    *
    * @method _ddEventHandler
    * @protected
    */
    _ddEventHandler : function (event) {


        event.stopPropagation();
        event.preventDefault();

        if (Y.Array.indexOf(event._event.dataTransfer.types, 'Files') > -1) {
            switch (event.type) {
                case "dragenter":
                    this.fire("dragenter");
                    break;
                case "dragover":
                    this.fire("dragover");
                    break;
                case "dragleave":
                    this.fire("dragleave");
                    break;
                case "drop":

                    var newfiles = event._event.dataTransfer.files,
                        parsedFiles = [],
                        filterFunc = this.get("fileFilterFunction"),
                        oldfiles;

                    if (filterFunc) {
                        Y.each(newfiles, function (value) {
                            var newfile = new Y.FileHTML5(value);
                            if (filterFunc(newfile)) {
                                parsedFiles.push(newfile);
                            }
                        });
                    }
                    else {
                        Y.each(newfiles, function (value) {
                            parsedFiles.push(new Y.FileHTML5(value));
                        });
                    }

                    if (parsedFiles.length > 0) {
                        oldfiles = this.get("fileList");
                        this.set("fileList",
                        this.get("appendNewFiles") ? oldfiles.concat(parsedFiles) : parsedFiles);
                        this.fire("fileselect", {fileList: parsedFiles});
                    }

                    this.fire("drop", {fileList: parsedFiles});
                    break;
            }
        }
    },

    /**
    * Adds or removes a specified state CSS class to the underlying uploader button.
    *
    * @method _setButtonClass
    * @protected
    * @param state {String} The name of the state enumerated in `buttonClassNames` attribute
    * from which to derive the needed class name.
    * @param add {Boolean} A Boolean indicating whether to add or remove the class.
    */
    _setButtonClass : function (state, add) {
        if (add) {
            this.get("selectFilesButton").addClass(this.get("buttonClassNames")[state]);
        }
        else {
            this.get("selectFilesButton").removeClass(this.get("buttonClassNames")[state]);
        }
    },

    /**
    * Syncs the state of the `multipleFiles` attribute between this class
    * and the file input field.
    *
    * @method _setMultipleFiles
    * @protected
    */
    _setMultipleFiles : function () {
        if (this.get("multipleFiles") === true) {
            this._fileInputField.set("multiple", "multiple");
        }
        else {
            this._fileInputField.set("multiple", "");
        }
    },

    /**
    * Syncs the state of the `fileFilters` attribute between this class
    * and the file input field.
    *
    * @method _setFileFilters
    * @protected
    */
    _setFileFilters : function () {
        if (this.get("fileFilters").length > 0) {
            this._fileInputField.set("accept", this.get("fileFilters").join(","));
        }
        else {
            this._fileInputField.set("accept", "");
        }
    },


    /**
    * Syncs the state of the `enabled` attribute between this class
    * and the underlying button.
    *
    * @method _triggerEnabled
    * @private
    */
    _triggerEnabled : function () {
        if (this.get("enabled") && this._buttonBinding === null) {
            this._bindSelectButton();
            this._setButtonClass("disabled", false);
            this.get("selectFilesButton").setAttribute("aria-disabled", "false");
        }
        else if (!this.get("enabled") && this._buttonBinding) {
            this._buttonBinding.detach();
            this._buttonBinding = null;
            this._setButtonClass("disabled", true);
            this.get("selectFilesButton").setAttribute("aria-disabled", "true");
        }
    },

    /**
    * Getter for the `fileList` attribute
    *
    * @method _getFileList
    * @private
    */
    _getFileList : function () {
        return this._fileList.concat();
    },

    /**
    * Setter for the `fileList` attribute
    *
    * @method _setFileList
    * @private
    */
    _setFileList : function (val) {
        this._fileList = val.concat();
        return this._fileList.concat();
    },

    /**
    * Adjusts the content of the `fileList` based on the results of file selection
    * and the `appendNewFiles` attribute. If the `appendNewFiles` attribute is true,
    * then selected files are appended to the existing list; otherwise, the list is
    * cleared and populated with the newly selected files.
    *
    * @method _updateFileList
    * @param ev {Event} The file selection event received from the uploader.
    * @protected
    */
    _updateFileList : function (ev) {
        var newfiles = ev.target.getDOMNode().files,
            parsedFiles = [],
            filterFunc = this.get("fileFilterFunction"),
            oldfiles;

        if (filterFunc) {
            Y.each(newfiles, function (value) {
                var newfile = new Y.FileHTML5(value);
                if (filterFunc(newfile)) {
                    parsedFiles.push(newfile);
                }
            });
        }
        else {
            Y.each(newfiles, function (value) {
                parsedFiles.push(new Y.FileHTML5(value));
            });
        }

        if (parsedFiles.length > 0) {
            oldfiles = this.get("fileList");

            this.set("fileList",
                    this.get("appendNewFiles") ? oldfiles.concat(parsedFiles) : parsedFiles );

            this.fire("fileselect", {fileList: parsedFiles});
        }

        this._rebindFileField();
    },


    /**
    * Handles and retransmits events fired by `Y.File` and `Y.Uploader.Queue`.
    *
    * @method _uploadEventHandler
    * @param event The event dispatched during the upload process.
    * @protected
    */
    _uploadEventHandler : function (event) {

        switch (event.type) {
            case "file:uploadstart":
                this.fire("fileuploadstart", event);
                break;
            case "file:uploadprogress":
                this.fire("uploadprogress", event);
                break;
            case "uploaderqueue:totaluploadprogress":
                this.fire("totaluploadprogress", event);
                break;
            case "file:uploadcomplete":
                this.fire("uploadcomplete", event);
                break;
            case "uploaderqueue:alluploadscomplete":
                this.queue = null;
                this.fire("alluploadscomplete", event);
                break;
            case "file:uploaderror": // overflow intentional
            case "uploaderqueue:uploaderror":
                this.fire("uploaderror", event);
                break;
            case "file:uploadcancel": // overflow intentional
            case "uploaderqueue:uploadcancel":
                this.fire("uploadcancel", event);
                break;
        }

    },

    /**
    * Opens the File Selection dialog by simulating a click on the file input field.
    *
    * @method openFileSelectDialog
    */
    openFileSelectDialog : function () {
        var fileDomNode = this._fileInputField.getDOMNode();
        if (fileDomNode.click) {
            fileDomNode.click();
        }
    },

    /**
    * Starts the upload of a specific file.
    *
    * @method upload
    * @param file {Y.File} Reference to the instance of the file to be uploaded.
    * @param url {String} The URL to upload the file to.
    * @param postVars {Object} (optional) A set of key-value pairs to send as variables along with the file upload HTTP request.
    *                          If not specified, the values from the attribute `postVarsPerFile` are used instead.
    */
    upload : function (file, url, postvars) {

        var uploadURL = url || this.get("uploadURL"),
            postVars = postvars || this.get("postVarsPerFile"),
            fileId = file.get("id");

        postVars = postVars.hasOwnProperty(fileId) ? postVars[fileId] : postVars;

        if (file instanceof Y.FileHTML5) {

            file.on("uploadstart", this._uploadEventHandler, this);
            file.on("uploadprogress", this._uploadEventHandler, this);
            file.on("uploadcomplete", this._uploadEventHandler, this);
            file.on("uploaderror", this._uploadEventHandler, this);
            file.on("uploadcancel", this._uploadEventHandler, this);

            file.startUpload(uploadURL, postVars, this.get("fileFieldName"));
        }
    },

   /**
    * Starts the upload of all files on the file list, using an automated queue.
    *
    * @method uploadAll
    * @param url {String} The URL to upload the files to.
    * @param [postVars] {Object} A set of key-value pairs to send as variables along with the file upload HTTP request.
    *                          If not specified, the values from the attribute `postVarsPerFile` are used instead.
    */
    uploadAll : function (url, postvars) {
        this.uploadThese(this.get("fileList"), url, postvars);
    },

    /**
    * Starts the upload of the files specified in the first argument, using an automated queue.
    *
    * @method uploadThese
    * @param files {Array} The list of files to upload.
    * @param url {String} The URL to upload the files to.
    * @param [postVars] {Object} A set of key-value pairs to send as variables along with the file upload HTTP request.
    *                          If not specified, the values from the attribute `postVarsPerFile` are used instead.
    */
    uploadThese : function (files, url, postvars) {
        if (!this.queue) {
            var uploadURL = url || this.get("uploadURL"),
                postVars = postvars || this.get("postVarsPerFile");

            this.queue = new UploaderQueue({
                simUploads: this.get("simLimit"),
                errorAction: this.get("errorAction"),
                fileFieldName: this.get("fileFieldName"),
                fileList: files,
                uploadURL: uploadURL,
                perFileParameters: postVars,
                retryCount: this.get("retryCount"),
                uploadHeaders: this.get("uploadHeaders"),
                withCredentials: this.get("withCredentials")
            });

            this.queue.on("uploadstart", this._uploadEventHandler, this);
            this.queue.on("uploadprogress", this._uploadEventHandler, this);
            this.queue.on("totaluploadprogress", this._uploadEventHandler, this);
            this.queue.on("uploadcomplete", this._uploadEventHandler, this);
            this.queue.on("alluploadscomplete", this._uploadEventHandler, this);
            this.queue.on("uploadcancel", this._uploadEventHandler, this);
            this.queue.on("uploaderror", this._uploadEventHandler, this);
            this.queue.startUpload();

            this.fire("uploadstart");
       }
       else if (this.queue._currentState === UploaderQueue.UPLOADING) {
            this.queue.set("perFileParameters", this.get("postVarsPerFile"));
            Y.each(files, function (file) {
                this.queue.addToQueueBottom(file);
            }, this);
       }
    }
}, {

    /**
    * The template for the hidden file input field container. The file input field will only
    * accept clicks if its visibility is set to hidden (and will not if it's `display` value
    * is set to `none`)
    *
    * @property HTML5FILEFIELD_TEMPLATE
    * @type {String}
    * @static
    */
    HTML5FILEFIELD_TEMPLATE: "<input type='file' style='visibility:hidden; width:0px; height: 0px;'>",

    /**
    * The template for the "Select Files" button.
    *
    * @property SELECT_FILES_BUTTON
    * @type {HTML}
    * @static
    * @default '<button type="button" class="yui3-button" role="button" aria-label="{selectButtonLabel}"
    *           tabindex="{tabIndex}">{selectButtonLabel}</button>'
    */
    SELECT_FILES_BUTTON: '<button type="button" class="yui3-button" role="button" aria-label="{selectButtonLabel}" ' +
                         'tabindex="{tabIndex}">{selectButtonLabel}</button>',

    /**
    * The static property reflecting the type of uploader that `Y.Uploader`
    * aliases. The UploaderHTML5 value is `"html5"`.
    *
    * @property TYPE
    * @type {String}
    * @static
    */
    TYPE: "html5",

    /**
    * The identity of the widget.
    *
    * @property NAME
    * @type String
    * @default 'uploader'
    * @readOnly
    * @protected
    * @static
    */
    NAME: "uploader",

    /**
    * Static property used to define the default attribute configuration of
    * the Widget.
    *
    * @property ATTRS
    * @type {Object}
    * @protected
    * @static
    */
    ATTRS: {

        /**
        * A Boolean indicating whether newly selected files should be appended
        * to the existing file list, or whether they should replace it.
        *
        * @attribute appendNewFiles
        * @type {Boolean}
        * @default true
        */
        appendNewFiles : {
            value: true
        },

        /**
        * The names of CSS classes that correspond to different button states
        * of the "Select Files" control. These classes are assigned to the
        * "Select Files" control based on the configuration of the uploader.
        * Currently, the only class name used is that corresponding to the
        * `disabled` state of the uploader. Other button states should be managed
        * directly via CSS selectors.
        * <ul>
        *   <li> <strong>`disabled`</strong>: the class corresponding to the disabled state
        *      of the "Select Files" button.</li>
        * </ul>
        * @attribute buttonClassNames
        * @type {Object}
        * @default {
        *            disabled: "yui3-button-disabled"
        *          }
        */
        buttonClassNames: {
            value: {
                "hover": "yui3-button-hover",
                "active": "yui3-button-active",
                "disabled": "yui3-button-disabled",
                "focus": "yui3-button-selected"
            }
        },

        /**
        * The node that serves as the drop target for files.
        *
        * @attribute dragAndDropArea
        * @type {Node}
        * @default null
        */
        dragAndDropArea: {
            value: null,
            setter: function (val) {
                return Y.one(val);
            }
        },

        /**
        * A Boolean indicating whether the uploader is enabled or disabled for user input.
        *
        * @attribute enabled
        * @type {Boolean}
        * @default true
        */
        enabled : {
            value: true
        },

        /**
        * The action  performed when an upload error occurs for a specific file being uploaded.
        * The possible values are:
        * <ul>
        *   <li> <strong>`UploaderQueue.CONTINUE`</strong>: the error is ignored and the upload process is continued.</li>
        *   <li> <strong>`UploaderQueue.STOP`</strong>: the upload process is stopped as soon as any other parallel file
        *     uploads are finished.</li>
        *   <li> <strong>`UploaderQueue.RESTART_ASAP`</strong>: the file is added back to the front of the queue.</li>
        *   <li> <strong>`UploaderQueue.RESTART_AFTER`</strong>: the file is added to the back of the queue.</li>
        * </ul>
        * @attribute errorAction
        * @type {String}
        * @default UploaderQueue.CONTINUE
        */
        errorAction: {
            value: "continue",
            validator: function (val) {
                return (
                    val === UploaderQueue.CONTINUE ||
                    val === UploaderQueue.STOP ||
                    val === UploaderQueue.RESTART_ASAP ||
                    val === UploaderQueue.RESTART_AFTER
                );
            }
        },

        /**
        * An array indicating what fileFilters should be applied to the file
        * selection dialog. Each element in the array should be a string
        * indicating the Media (MIME) type for the files that should be supported
        * for selection. The Media type strings should be properly formatted
        * or this parameter will be ignored. Examples of valid strings include:
        * "audio/*", "video/*", "application/pdf", etc. More information
        * on valid Media type strings is available here:
        * http://www.iana.org/assignments/media-types/index.html
        * @attribute fileFilters
        * @type {Array}
        * @default []
        */
        fileFilters: {
            value: []
        },

        /**
        * A filtering function that is applied to every file selected by the user.
        * The function receives the `Y.File` object and must return a Boolean value.
        * If a `false` value is returned, the file in question is not added to the
        * list of files to be uploaded.
        * Use this function to put limits on file sizes or check the file names for
        * correct extension, but make sure that a server-side check is also performed,
        * since any client-side restrictions are only advisory and can be circumvented.
        *
        * @attribute fileFilterFunction
        * @type {Function}
        * @default null
        */
        fileFilterFunction: {
            value: null
        },

        /**
        * A String specifying what should be the POST field name for the file
        * content in the upload request.
        *
        * @attribute fileFieldName
        * @type {String}
        * @default Filedata
        */
        fileFieldName: {
            value: "Filedata"
        },

        /**
        * The array of files to be uploaded. All elements in the array
        * must be instances of `Y.File` and be instantiated with an instance
        * of native JavaScript File() class.
        *
        * @attribute fileList
        * @type {Array}
        * @default []
        */
        fileList: {
            value: [],
            getter: "_getFileList",
            setter: "_setFileList"
        },

        /**
        * A Boolean indicating whether multiple file selection is enabled.
        *
        * @attribute multipleFiles
        * @type {Boolean}
        * @default false
        */
        multipleFiles: {
            value: false
        },

        /**
        * An object, keyed by `fileId`, containing sets of key-value pairs
        * that should be passed as POST variables along with each corresponding
        * file. This attribute is only used if no POST variables are specifed
        * in the upload method call.
        *
        * @attribute postVarsPerFile
        * @type {Object}
        * @default {}
        */
        postVarsPerFile: {
            value: {}
        },

        /**
        * The label for the "Select Files" widget. This is the value that replaces the
        * `{selectButtonLabel}` token in the `SELECT_FILES_BUTTON` template.
        *
        * @attribute selectButtonLabel
        * @type {String}
        * @default "Select Files"
        */
        selectButtonLabel: {
            value: "Select Files"
        },

        /**
        * The widget that serves as the "Select Files control for the file uploader
        *
        *
        * @attribute selectFilesButton
        * @type {Node | Widget}
        * @default A standard HTML button with YUI CSS Button skin.
        */
        selectFilesButton : {
            valueFn: function () {
                return Y.Node.create(substitute(Y.UploaderHTML5.SELECT_FILES_BUTTON, {
                    selectButtonLabel: this.get("selectButtonLabel"),
                    tabIndex: this.get("tabIndex")
                }));
            }
        },

        /**
        * The number of files that can be uploaded
        * simultaneously if the automatic queue management
        * is used. This value can be in the range between 2
        * and 5.
        *
        * @attribute simLimit
        * @type {Number}
        * @default 2
        */
        simLimit: {
            value: 2,
            validator: function (val) {
                return (val >= 1 && val <= 5);
            }
        },

        /**
        * The URL to which file upload requested are POSTed. Only used if a different url is not passed to the upload method call.
        *
        * @attribute uploadURL
        * @type {String}
        * @default ""
        */
        uploadURL: {
            value: ""
        },

        /**
        * Additional HTTP headers that should be included
        * in the upload request.
        *
        *
        * @attribute uploadHeaders
        * @type {Object}
        * @default {}
        */
        uploadHeaders: {
            value: {}
        },

        /**
        * A Boolean that specifies whether the file should be
        * uploaded with the appropriate user credentials for the
        * domain.
        *
        * @attribute withCredentials
        * @type {Boolean}
        * @default true
        */
        withCredentials: {
            value: true
        },

        /**
        * The number of times to try re-uploading a file that failed to upload before
        * cancelling its upload.
        *
        * @attribute retryCount
        * @type {Number}
        * @default 3
        */
        retryCount: {
            value: 3
        }
    }
});

Y.UploaderHTML5.Queue = UploaderQueue;



}, '3.8.1', {"requires": ["widget", "node-event-simulate", "substitute", "file-html5", "uploader-queue"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('swfdetect', function (Y, NAME) {

/**
 * Utility for Flash version detection
 * @module swfdetect
 */

// Shortcuts and helper methods
var version = 0,
    uA = Y.UA,
    lG = Y.Lang,
    sF = "ShockwaveFlash",
    mF, eP, vS, ax6, ax;

function makeInt(n) {
    return parseInt(n, 10);
}

function parseFlashVersion (flashVer) {
    if (lG.isNumber(makeInt(flashVer[0]))) {
        uA.flashMajor = flashVer[0];
    }
    
    if (lG.isNumber(makeInt(flashVer[1]))) {
        uA.flashMinor = flashVer[1];
    }
    
    if (lG.isNumber(makeInt(flashVer[2]))) {
        uA.flashRev = flashVer[2];
    }
}

if (uA.gecko || uA.webkit || uA.opera) {
   if ((mF = navigator.mimeTypes['application/x-shockwave-flash'])) {
      if ((eP = mF.enabledPlugin)) {
         vS = eP.description.replace(/\s[rd]/g, '.').replace(/[A-Za-z\s]+/g, '').split('.');
         parseFlashVersion(vS);
      }
   }
}
else if(uA.ie) {
    try
    {
        ax6 = new ActiveXObject(sF + "." + sF + ".6");
        ax6.AllowScriptAccess = "always";
    }
    catch (e)
    {
        if(ax6 !== null)
        {
            version = 6.0;
        }
    }
    if (version === 0) {
    try
    {
        ax = new ActiveXObject(sF + "." + sF);
        vS = ax.GetVariable("$version").replace(/[A-Za-z\s]+/g, '').split(',');
        parseFlashVersion(vS);
    } catch (e2) {}
    }
}

/** Create a calendar view to represent a single or multiple
  * month range of dates, rendered as a grid with date and
  * weekday labels.
  * 
  * @class SWFDetect
  * @constructor
  */

        
Y.SWFDetect = {

    /**
     * Returns the version of either the Flash Player plugin (in Mozilla/WebKit/Opera browsers),
     * or the Flash Player ActiveX control (in IE), as a String of the form "MM.mm.rr", where
     * MM is the major version, mm is the minor version, and rr is the revision.
     * @method getFlashVersion
     */ 
    
    getFlashVersion : function () {
        return (String(uA.flashMajor) + "." + String(uA.flashMinor) + "." + String(uA.flashRev));
    },

    /**
     * Checks whether the version of the Flash player installed on the user's machine is greater
     * than or equal to the one specified. If it is, this method returns true; it is false otherwise.
     * @method isFlashVersionAtLeast
     * @return {Boolean} Whether the Flash player version is greater than or equal to the one specified.
     * @param flashMajor {int} The Major version of the Flash player to compare against.
     * @param flashMinor {int} The Minor version of the Flash player to compare against.
     * @param flashRev {int} The Revision version of the Flash player to compare against.
     */ 
    isFlashVersionAtLeast : function (flashMajor, flashMinor, flashRev) {
        var uaMajor    = makeInt(uA.flashMajor),
            uaMinor    = makeInt(uA.flashMinor),
            uaRev      = makeInt(uA.flashRev);
            
        flashMajor = makeInt(flashMajor || 0);
        flashMinor = makeInt(flashMinor || 0);
        flashRev   = makeInt(flashRev || 0);

        if (flashMajor === uaMajor) {
            if (flashMinor === uaMinor) {
                return flashRev <= uaRev;
            }
            return flashMinor < uaMinor;
        }
        return flashMajor < uaMajor;
    }           
};


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('swf', function (Y, NAME) {

/**
 * Embed a Flash applications in a standard manner and communicate with it
 * via External Interface.
 * @module swf
 */

    var Event = Y.Event,
        SWFDetect = Y.SWFDetect,
        Lang = Y.Lang,
        uA = Y.UA,
        Node = Y.Node,
        Escape = Y.Escape,

        // private
        FLASH_CID = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
        FLASH_TYPE = "application/x-shockwave-flash",
        FLASH_VER = "10.0.22",
        EXPRESS_INSTALL_URL = "http://fpdownload.macromedia.com/pub/flashplayer/update/current/swf/autoUpdater.swf?" + Math.random(),
        EVENT_HANDLER = "SWF.eventHandler",
        possibleAttributes = {align:"", allowFullScreen:"", allowNetworking:"", allowScriptAccess:"", base:"", bgcolor:"", loop:"", menu:"", name:"", play: "", quality:"", salign:"", scale:"", tabindex:"", wmode:""};

        /**
         * The SWF utility is a tool for embedding Flash applications in HTML pages.
         * @module swf
         * @title SWF Utility
         * @requires event-custom, node, swfdetect
         */

        /**
         * Creates the SWF instance and keeps the configuration data
         *
         * @class SWF
         * @augments Y.Event.Target
         * @constructor
         * @param {String|HTMLElement} id The id of the element, or the element itself that the SWF will be inserted into.
         *        The width and height of the SWF will be set to the width and height of this container element.
         * @param {String} swfURL The URL of the SWF to be embedded into the page.
         * @param {Object} p_oAttributes (optional) Configuration parameters for the Flash application and values for Flashvars
         *        to be passed to the SWF. The p_oAttributes object allows the following additional properties:
         *        <dl>
         *          <dt>version : String</dt>
         *          <dd>The minimum version of Flash required on the user's machine.</dd>
         *          <dt>fixedAttributes : Object</dt>
         *          <dd>An object literal containing one or more of the following String keys and their values: <code>align,
         *              allowFullScreen, allowNetworking, allowScriptAccess, base, bgcolor, menu, name, quality, salign, scale,
         *              tabindex, wmode.</code> event from the thumb</dd>
         *        </dl>
         */

function SWF (p_oElement /*:String*/, swfURL /*:String*/, p_oAttributes /*:Object*/ ) {

    this._id = Y.guid("yuiswf");


    var _id = this._id;
    var oElement = Node.one(p_oElement);
    
    var p_oAttributes = p_oAttributes || {};

    var flashVersion = p_oAttributes.version || FLASH_VER;

    var flashVersionSplit = (flashVersion + '').split(".");
    var isFlashVersionRight = SWFDetect.isFlashVersionAtLeast(parseInt(flashVersionSplit[0], 10), parseInt(flashVersionSplit[1], 10), parseInt(flashVersionSplit[2], 10));
    var canExpressInstall = (SWFDetect.isFlashVersionAtLeast(8,0,0));
    var shouldExpressInstall = canExpressInstall && !isFlashVersionRight && p_oAttributes.useExpressInstall;
    var flashURL = (shouldExpressInstall)?EXPRESS_INSTALL_URL:swfURL;
    var objstring = '<object ';
    var w, h;
    var flashvarstring = "yId=" + Y.id + "&YUISwfId=" + _id + "&YUIBridgeCallback=" + EVENT_HANDLER + "&allowedDomain=" + document.location.hostname;

    Y.SWF._instances[_id] = this;
    if (oElement && (isFlashVersionRight || shouldExpressInstall) && flashURL) {
        objstring += 'id="' + _id + '" ';
        if (uA.ie) {
            objstring += 'classid="' + FLASH_CID + '" ';
        } else {
            objstring += 'type="' + FLASH_TYPE + '" data="' + Escape.html(flashURL) + '" ';
        }

        w = "100%";
        h = "100%";

        objstring += 'width="' + w + '" height="' + h + '">';

        if (uA.ie) {
            objstring += '<param name="movie" value="' + Escape.html(flashURL) + '"/>';
        }

        for (var attribute in p_oAttributes.fixedAttributes) {
            if (possibleAttributes.hasOwnProperty(attribute)) {
                objstring += '<param name="' + Escape.html(attribute) + '" value="' + Escape.html(p_oAttributes.fixedAttributes[attribute]) + '"/>';
            }
        }

        for (var flashvar in p_oAttributes.flashVars) {
            var fvar = p_oAttributes.flashVars[flashvar];
            if (Lang.isString(fvar)) {
                flashvarstring += "&" + Escape.html(flashvar) + "=" + Escape.html(encodeURIComponent(fvar));
            }
        }

        if (flashvarstring) {
            objstring += '<param name="flashVars" value="' + flashvarstring + '"/>';
        }

        objstring += "</object>";
        //using innerHTML as setHTML/setContent causes some issues with ExternalInterface for IE versions of the player
        oElement.set("innerHTML", objstring);
        
        this._swf = Node.one("#" + _id);
    } else {
        /**
         * Fired when the Flash player version on the user's machine is
         * below the required value.
         *
         * @event wrongflashversion
         */
        var event = {};
        event.type = "wrongflashversion";
        this.publish("wrongflashversion", {fireOnce:true});
        this.fire("wrongflashversion", event);
    }
}

/**
 * @private
 * The static collection of all instances of the SWFs on the page.
 * @property _instances
 * @type Object
 */

SWF._instances = SWF._instances || {};

/**
 * @private
 * Handles an event coming from within the SWF and delegate it
 * to a specific instance of SWF.
 * @method eventHandler
 * @param swfid {String} the id of the SWF dispatching the event
 * @param event {Object} the event being transmitted.
 */
SWF.eventHandler = function (swfid, event) {
    SWF._instances[swfid]._eventHandler(event);
};

SWF.prototype = {
    /**
     * @private
     * Propagates a specific event from Flash to JS.
     * @method _eventHandler
     * @param event {Object} The event to be propagated from Flash.
     */
    _eventHandler: function(event) {
        if (event.type === "swfReady") {
            this.publish("swfReady", {fireOnce:true});
            this.fire("swfReady", event);
        } else if(event.type === "log") {
        } else {
            this.fire(event.type, event);
        }
    },

        /**
     * Calls a specific function exposed by the SWF's
     * ExternalInterface.
     * @method callSWF
     * @param func {String} the name of the function to call
     * @param args {Array} the set of arguments to pass to the function.
     */
    
    callSWF: function (func, args)
    {
    if (!args) { 
          args= []; 
    }   
        if (this._swf._node[func]) {
        return(this._swf._node[func].apply(this._swf._node, args));
        } else {
        return null;
        }
    },
    
    /**
     * Public accessor to the unique name of the SWF instance.
     *
     * @method toString
     * @return {String} Unique name of the SWF instance.
     */
    toString: function()
    {
        return "SWF " + this._id;
    }
};

Y.augment(SWF, Y.EventTarget);

Y.SWF = SWF;


}, '3.8.1', {"requires": ["event-custom", "node", "swfdetect", "escape"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('file-flash', function (Y, NAME) {

    /**
     * The FileFlash class provides a wrapper for a file pointer stored in Flash. The File wrapper 
     * also implements the mechanics for uploading a file and tracking its progress.
     * @module file-flash
     */     
    /**
     * The class provides a wrapper for a file pointer in Flash.
     * @class FileFlash
     * @extends Base
     * @constructor
     * @param {Object} config Configuration object.
     */

    var FileFlash = function(o) {
        FileFlash.superclass.constructor.apply(this, arguments);   
    };

    Y.extend(FileFlash, Y.Base, {

       /**
        * Construction logic executed during FileFlash instantiation.
        *
        * @method initializer
        * @protected
        */
        initializer : function (cfg) {
            if (!this.get("id")) {
                this._set("id", Y.guid("file"));
            }
        },

       /**
        * Handler of events dispatched by the Flash player.
        *
        * @method _swfEventHandler
        * @param {Event} event The event object received from the Flash player.
        * @protected
        */      
        _swfEventHandler: function (event) {
          if (event.id === this.get("id")) {
          switch (event.type) {
            /**
             * Signals that this file's upload has started. 
             *
             * @event uploadstart
             * @param event {Event} The event object for the `uploadstart` with the
             *                      following payload:
             *  <dl>
             *      <dt>uploader</dt>
             *          <dd>The Y.SWF instance of Flash uploader that's handling the upload.</dd>
             *  </dl>
             */
            case "uploadstart":
                 this.fire("uploadstart", {uploader: this.get("uploader")});
                 break;
            case "uploadprogress":

                  /**
                   * Signals that progress has been made on the upload of this file. 
                   *
                   * @event uploadprogress
                   * @param event {Event} The event object for the `uploadprogress` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the Flash uploader instance.</dd>
                   *      <dt>bytesLoaded</dt>
                   *          <dd>The number of bytes of the file that has been uploaded.</dd>
                   *      <dt>bytesTotal</dt>
                   *          <dd>The total number of bytes in the file (the file size)</dd>
                   *      <dt>percentLoaded</dt>
                   *          <dd>The fraction of the file that has been uploaded, out of 100.</dd>
                   *  </dl>
                   */
                 this.fire("uploadprogress", {originEvent: event,
                                              bytesLoaded: event.bytesLoaded, 
                                              bytesTotal: event.bytesTotal, 
                                              percentLoaded: Math.min(100, Math.round(10000*event.bytesLoaded/event.bytesTotal)/100)
                                             });
                 this._set("bytesUploaded", event.bytesLoaded);
                 break;
            case "uploadcomplete":

                  /**
                   * Signals that this file's upload has completed, but data has not yet been received from the server. 
                   *
                   * @event uploadfinished
                   * @param event {Event} The event object for the `uploadfinished` with the
                   *                      following payload:
                   *  <dl>
                   *      <dt>originEvent</dt>
                   *          <dd>The original event fired by the Flash player instance.</dd>
                   *  </dl>
                   */
                 this.fire("uploadfinished", {originEvent: event});
                 break;
            case "uploadcompletedata":
                /**
                 * Signals that this file's upload has completed and data has been received from the server.
                 *
                 * @event uploadcomplete
                 * @param event {Event} The event object for the `uploadcomplete` with the
                 *                      following payload:
                 *  <dl>
                 *      <dt>originEvent</dt>
                 *          <dd>The original event fired by the Flash player instance.</dd>
                 *      <dt>data</dt>
                 *          <dd>The data returned by the server.</dd>
                 *  </dl>
                 */
                 this.fire("uploadcomplete", {originEvent: event,
                                              data: event.data});  
                 break;
            case "uploadcancel":

                /**
                 * Signals that this file's upload has been cancelled. 
                 *
                 * @event uploadcancel
                 * @param event {Event} The event object for the `uploadcancel` with the
                 *                      following payload:
                 *  <dl>
                 *      <dt>originEvent</dt>
                 *          <dd>The original event fired by the Flash player instance.</dd>
                 *  </dl>
                 */
                 this.fire("uploadcancel", {originEvent: event});
                 break;
            case "uploaderror":

                /**
                 * Signals that this file's upload has encountered an error. 
                 *
                 * @event uploaderror
                 * @param event {Event} The event object for the `uploaderror` with the
                 *                      following payload:
                 *  <dl>
                 *      <dt>originEvent</dt>
                 *          <dd>The original event fired by the Flash player instance.</dd>
                 *      <dt>status</dt>
                 *          <dd>The status code reported by the Flash Player. If it's an HTTP error,
                 *                then this corresponds to the HTTP status code received by the uploader.</dd>
                 *      <dt>statusText</dt>
                 *          <dd>The text of the error event reported by the Flash Player.</dd>
                 *      <dt>source</dt>
                 *          <dd>Either "http" (if it's an HTTP error), or "io" (if it's a network transmission 
                 *              error.)</dd>
                 *  </dl>
                 */
                 this.fire("uploaderror", {originEvent: event, status: event.status, statusText: event.message, source: event.source});         

          }
        }
        },

       /**
        * Starts the upload of a specific file.
        *
        * @method startUpload
        * @param url {String} The URL to upload the file to.
        * @param parameters {Object} (optional) A set of key-value pairs to send as variables along with the file upload HTTP request.
        * @param fileFieldName {String} (optional) The name of the POST variable that should contain the uploaded file ('Filedata' by default)
        */
        startUpload: function(url, parameters, fileFieldName) {
         
        if (this.get("uploader")) {

            var myUploader = this.get("uploader"),
                fileField = fileFieldName || "Filedata",
                id = this.get("id"),
                params = parameters || null;

            this._set("bytesUploaded", 0);
            
            myUploader.on("uploadstart", this._swfEventHandler, this);
            myUploader.on("uploadprogress", this._swfEventHandler, this);
            myUploader.on("uploadcomplete", this._swfEventHandler, this);
            myUploader.on("uploadcompletedata", this._swfEventHandler, this);
            myUploader.on("uploaderror", this._swfEventHandler, this);

            myUploader.callSWF("upload", [id, url, params, fileField]);
         }

        },

       /**
        * Cancels the upload of a specific file, if currently in progress.
        *
        * @method cancelUpload
        */  
        cancelUpload: function () {
         if (this.get("uploader")) {
           this.get("uploader").callSWF("cancel", [this.get("id")]);
           this.fire("uploadcancel");
         }
        }

    }, {

       /**
        * The identity of the class.
        *
        * @property NAME
        * @type String
        * @default 'file'
        * @readOnly
        * @protected
        * @static
        */
        NAME: 'file',

       /**
        * The type of transport.
        *
        * @property TYPE
        * @type String
        * @default 'flash'
        * @readOnly
        * @protected
        * @static
        */
        TYPE: "flash",

       /**
        * Static property used to define the default attribute configuration of
        * the File.
        *
        * @property ATTRS
        * @type {Object}
        * @protected
        * @static
        */
        ATTRS: {

       /**
        * A String containing the unique id of the file wrapped by the FileFlash instance.
        * The id is supplied by the Flash player uploader.
        *
        * @attribute id
        * @type {String}
        * @initOnly
        */
        id: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The size of the file wrapped by FileFlash. This value is supplied by the Flash player uploader.
        *
        * @attribute size
        * @type {Number}
        * @initOnly
        */
        size: {
            writeOnce: "initOnly",
            value: 0
        },

       /**
        * The name of the file wrapped by FileFlash. This value is supplied by the Flash player uploader.
        *
        * @attribute name
        * @type {String}
        * @initOnly
        */
        name: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The date that the file wrapped by FileFlash was created on. This value is supplied by the Flash player uploader.
        *
        * @attribute dateCreated
        * @type {Date}
        * @initOnly
        */
        dateCreated: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The date that the file wrapped by FileFlash was last modified on. This value is supplied by the Flash player uploader.
        *
        * @attribute dateModified
        * @type {Date}
        * @initOnly
        */
        dateModified: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The number of bytes of the file that has been uploaded to the server. This value is
        * non-zero only while a file is being uploaded.
        *
        * @attribute bytesUploaded
        * @type {Date}
        * @readOnly
        */
        bytesUploaded: {
            readOnly: true,
            value: 0
        },

       /**
        * The type of the file wrapped by FileFlash. This value is provided by the Flash player
        * uploader.
        *
        * @attribute type
        * @type {String}
        * @initOnly
        */
        type: {
            writeOnce: "initOnly",
            value: null
        },

       /**
        * The instance of Y.SWF wrapping the Flash player uploader associated with this file.
        *
        * @attribute uploder
        * @type {SWF}
        * @initOnly
        */
        uploader: {
            writeOnce: "initOnly",
            value: null
        }
        }
    });

    Y.FileFlash = FileFlash;

}, '3.8.1', {"requires": ["base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('uploader-flash', function (Y, NAME) {

/**
* This module provides a UI for file selection and multiple file upload capability using
* Flash as a transport engine.
* The supported features include: automatic upload queue management, upload progress
* tracking, file filtering, server response retrieval and error reporting.
*
* @module uploader-flash
*/

// Shorthands for external modules
var substitute            = Y.Lang.sub,
    UploaderQueue         = Y.Uploader.Queue;


/**
* This module provides a UI for file selection and multiple file upload capability
* using Flash as a transport engine.
* @class UploaderFlash
* @extends Widget
* @param {Object} config Configuration object.
* @constructor
*/

function UploaderFlash() {
    UploaderFlash.superclass.constructor.apply ( this, arguments );
}



Y.UploaderFlash = Y.extend(UploaderFlash, Y.Widget, {

    /**
    * Stored value of the current button state (based on
    * mouse events dispatched by the Flash player)
    * @property _buttonState
    * @type {String}
    * @protected
    */
    _buttonState: "up",

    /**
    * Stored value of the current button focus state (based
    * on keyboard and mouse events).
    * @property _buttonFocus
    * @type {Boolean}
    * @protected
    */
    _buttonFocus: false,

    /**
    * Stored value of the unique id for the container that holds the
    * Flash uploader.
    *
    * @property _swfContainerId
    * @type {String}
    * @protected
    */
    _swfContainerId: null,

    /**
    * Stored reference to the instance of SWF used to host the
    * Flash uploader.
    *
    * @property _swfReference
    * @type {SWF}
    * @protected
    */
    _swfReference: null,

    /**
    * Stored reference to the instance of Uploader.Queue used to manage
    * the upload process. This is a read-only property that only exists
    * during an active upload process. Only one queue can be active at
    * a time; if an upload start is attempted while a queue is active,
    * it will be ignored.
    *
    * @property queue
    * @type {Y.Uploader.Queue}
    */
    queue: null,

    /**
    * Stored event bindings for keyboard navigation to and from the uploader.
    *
    * @property _tabElementBindings
    * @type {Object}
    * @protected
    */
    _tabElementBindings: null,


    /**
    * Construction logic executed during UploaderFlash instantiation.
    *
    * @method initializer
    * @protected
    */
    initializer : function () {

        // Assign protected variable values
        this._swfContainerId = Y.guid("uploader");
        this._swfReference = null;
        this.queue = null;
        this._buttonState = "up";
        this._buttonFocus = null;
        this._tabElementBindings = null;
        this._fileList = [];

        // Publish available events

        /**
        * Signals that files have been selected.
        *
        * @event fileselect
        * @param event {Event} The event object for the `fileselect` with the
        *                      following payload:
        *  <dl>
        *      <dt>fileList</dt>
        *          <dd>An `Array` of files selected by the user, encapsulated
        *              in Y.FileFlash objects.</dd>
        *  </dl>
        */
        this.publish("fileselect");

        /**
        * Signals that an upload of multiple files has been started.
        *
        * @event uploadstart
        * @param event {Event} The event object for the `uploadstart`.
        */
        this.publish("uploadstart");

        /**
        * Signals that an upload of a specific file has started.
        *
        * @event fileuploadstart
        * @param event {Event} The event object for the `fileuploadstart` with the
        *                      following payload:
        *  <dl>
        *      <dt>file</dt>
        *          <dd>A reference to the Y.File that dispatched the event.</dd>
        *      <dt>originEvent</dt>
        *          <dd>The original event dispatched by Y.File.</dd>
        *  </dl>
        */
        this.publish("fileuploadstart");

        /**
        * Reports on upload progress of a specific file.
        *
        * @event uploadprogress
        * @param event {Event} The event object for the `uploadprogress` with the
        *                      following payload:
        *  <dl>
        *      <dt>bytesLoaded</dt>
        *          <dd>The number of bytes of the file that has been uploaded</dd>
        *      <dt>bytesTotal</dt>
        *          <dd>The total number of bytes in the file</dd>
        *      <dt>percentLoaded</dt>
        *          <dd>The fraction of the file that has been uploaded, out of 100</dd>
        *      <dt>originEvent</dt>
        *          <dd>The original event dispatched by the SWF uploader</dd>
        *  </dl>
        */
        this.publish("uploadprogress");

        /**
        * Reports on the total upload progress of the file list.
        *
        * @event totaluploadprogress
        * @param event {Event} The event object for the `totaluploadprogress` with the
        *                      following payload:
        *  <dl>
        *      <dt>bytesLoaded</dt>
        *          <dd>The number of bytes of the file list that has been uploaded</dd>
        *      <dt>bytesTotal</dt>
        *          <dd>The total number of bytes in the file list</dd>
        *      <dt>percentLoaded</dt>
        *          <dd>The fraction of the file list that has been uploaded, out of 100</dd>
        *  </dl>
        */
        this.publish("totaluploadprogress");

        /**
        * Signals that a single file upload has been completed.
        *
        * @event uploadcomplete
        * @param event {Event} The event object for the `uploadcomplete` with the
        *                      following payload:
        *  <dl>
        *      <dt>file</dt>
        *          <dd>The pointer to the instance of `Y.File` whose upload has been completed.</dd>
        *      <dt>originEvent</dt>
        *          <dd>The original event fired by the SWF Uploader</dd>
        *      <dt>data</dt>
        *          <dd>Data returned by the server.</dd>
        *  </dl>
        */
        this.publish("uploadcomplete");

        /**
        * Signals that the upload process of the entire file list has been completed.
        *
        * @event alluploadscomplete
        * @param event {Event} The event object for the `alluploadscomplete`.
        */
        this.publish("alluploadscomplete");

        /**
        * Signals that a error has occurred in a specific file's upload process.
        *
        * @event uploaderror
        * @param event {Event} The event object for the `uploaderror` with the
        *                      following payload:
        *  <dl>
        *      <dt>originEvent</dt>
        *          <dd>The original error event fired by the SWF Uploader. </dd>
        *      <dt>file</dt>
        *          <dd>The pointer at the instance of Y.FileFlash that returned the error.</dd>
        *      <dt>source</dt>
        *          <dd>The source of the upload error, either "io" or "http"</dd>
        *      <dt>message</dt>
        *          <dd>The message that accompanied the error. Corresponds to the text of
        *              the error in cases where source is "io", and to the HTTP status for
                                     cases where source is "http".</dd>
        *  </dl>
        */
        this.publish("uploaderror");

        /**
        * Signals that a mouse has begun hovering over the `Select Files` button.
        *
        * @event mouseenter
        * @param event {Event} The event object for the `mouseenter` event.
        */
        this.publish("mouseenter");

        /**
        * Signals that a mouse has stopped hovering over the `Select Files` button.
        *
        * @event mouseleave
        * @param event {Event} The event object for the `mouseleave` event.
        */
        this.publish("mouseleave");

        /**
        * Signals that a mouse button has been pressed over the `Select Files` button.
        *
        * @event mousedown
        * @param event {Event} The event object for the `mousedown` event.
        */
        this.publish("mousedown");

        /**
        * Signals that a mouse button has been released over the `Select Files` button.
        *
        * @event mouseup
        * @param event {Event} The event object for the `mouseup` event.
        */
        this.publish("mouseup");

        /**
        * Signals that a mouse has been clicked over the `Select Files` button.
        *
        * @event click
        * @param event {Event} The event object for the `click` event.
        */
        this.publish("click");
    },

    /**
    * Creates the DOM structure for the UploaderFlash.
    * UploaderFlash's DOM structure consists of two layers: the base "Select Files"
    * button that can be replaced by the developer's widget of choice; and a transparent
    * Flash overlay positoned above the button that captures all input events.
    * The `position` style attribute of the `boundingBox` of the `Uploader` widget
    * is forced to be `relative`, in order to accommodate the Flash player overlay
    * (which is `position`ed `absolute`ly).
    *
    * @method renderUI
    * @protected
    */
    renderUI : function () {
        var boundingBox = this.get("boundingBox"),
            contentBox = this.get('contentBox'),
            selFilesButton = this.get("selectFilesButton"),
            flashContainer = Y.one("#" + this._swfContainerId),
            params = {
                version: "10.0.45",
                fixedAttributes: {
                    wmode: "transparent",
                    allowScriptAccess:"always",
                    allowNetworking:"all",
                    scale: "noscale"
                }
            };

        boundingBox.setStyle("position", "relative");
        selFilesButton.setStyles({width: "100%", height: "100%"});
        contentBox.append(selFilesButton);
        contentBox.append(Y.Node.create(substitute(UploaderFlash.FLASH_CONTAINER, {
            swfContainerId: this._swfContainerId
        })));

        this._swfReference = new Y.SWF(flashContainer, this.get("swfURL"), params);
    },

    /**
    * Binds handlers to the UploaderFlash UI events and propagates attribute
    * values to the Flash player.
    * The propagation of initial values is set to occur once the Flash player
    * instance is ready (as indicated by the `swfReady` event.)
    *
    * @method bindUI
    * @protected
    */
    bindUI : function () {

        this._swfReference.on("swfReady", function () {
            this._setMultipleFiles();
            this._setFileFilters();
            this._triggerEnabled();
            this._attachTabElements();
            this.after("multipleFilesChange", this._setMultipleFiles, this);
            this.after("fileFiltersChange", this._setFileFilters, this);
            this.after("enabledChange", this._triggerEnabled, this);
            this.after("tabElementsChange", this._attachTabElements);
        }, this);

        this._swfReference.on("fileselect", this._updateFileList, this);



        // this._swfReference.on("trace", function (ev) {console.log(ev.message);});

        this._swfReference.on("mouseenter", function () {
            this.fire("mouseenter");
            this._setButtonClass("hover", true);
            if (this._buttonState === "down") {
                this._setButtonClass("active", true);
            }
        }, this);

        this._swfReference.on("mouseleave", function () {
            this.fire("mouseleave");
            this._setButtonClass("hover", false);
            this._setButtonClass("active", false);
        }, this);

        this._swfReference.on("mousedown", function () {
            this.fire("mousedown");
            this._buttonState = "down";
            this._setButtonClass("active", true);
        }, this);

        this._swfReference.on("mouseup", function () {
            this.fire("mouseup");
            this._buttonState = "up";
            this._setButtonClass("active", false);
        }, this);

        this._swfReference.on("click", function () {
            this.fire("click");
            this._buttonFocus = true;
            this._setButtonClass("focus", true);
            Y.one("body").focus();
            this._swfReference._swf.focus();
        }, this);
    },

    /**
    * Attaches keyboard bindings to enabling tabbing to and from the instance of the Flash
    * player in the Uploader widget. If the previous and next elements are specified, the
    * keyboard bindings enable the user to tab from the `tabElements["from"]` node to the
    * Flash-powered "Select Files" button, and to the `tabElements["to"]` node.
    *
    * @method _attachTabElements
    * @protected
    * @param ev {Event} Optional event payload if called as a `tabElementsChange` handler.
    */
    _attachTabElements : function () {
        if (this.get("tabElements") !== null && this.get("tabElements").from !== null && this.get("tabElements").to !== null) {

            if (this._tabElementBindings !== null) {
                this._tabElementBindings.from.detach();
                this._tabElementBindings.to.detach();
                this._tabElementBindings.tabback.detach();
                this._tabElementBindings.tabforward.detach();
                this._tabElementBindings.focus.detach();
                this._tabElementBindings.blur.detach();
            }
            else {
                this._tabElementBindings = {};
            }

            var fromElement = Y.one(this.get("tabElements").from),
                toElement = Y.one(this.get("tabElements").to);


            this._tabElementBindings.from = fromElement.on("keydown", function (ev) {
                if (ev.keyCode === 9 && !ev.shiftKey) {
                    ev.preventDefault();
                    this._swfReference._swf.setAttribute("tabindex", 0);
                    this._swfReference._swf.setAttribute("role", "button");
                    this._swfReference._swf.setAttribute("aria-label", this.get("selectButtonLabel"));
                    this._swfReference._swf.focus();
                }
            }, this);

            this._tabElementBindings.to = toElement.on("keydown", function (ev) {
                if (ev.keyCode === 9 && ev.shiftKey) {
                    ev.preventDefault();
                    this._swfReference._swf.setAttribute("tabindex", 0);
                    this._swfReference._swf.setAttribute("role", "button");
                    this._swfReference._swf.setAttribute("aria-label", this.get("selectButtonLabel"));
                    this._swfReference._swf.focus();
                }
            }, this);

            this._tabElementBindings.tabback = this._swfReference.on("tabback", function () {
                this._swfReference._swf.blur();
                setTimeout(function () {
                    fromElement.focus();
                }, 30);
            }, this);

            this._tabElementBindings.tabforward = this._swfReference.on("tabforward", function () {
                this._swfReference._swf.blur();
                setTimeout(function () {
                    toElement.focus();
                }, 30);
            }, this);

            this._tabElementBindings.focus = this._swfReference._swf.on("focus", function () {
                this._buttonFocus = true;
                this._setButtonClass("focus", true);
            }, this);

            this._tabElementBindings.blur = this._swfReference._swf.on("blur", function () {
                this._buttonFocus = false;
                this._setButtonClass("focus", false);
            }, this);
        }
        else if (this._tabElementBindings !== null) {
            this._tabElementBindings.from.detach();
            this._tabElementBindings.to.detach();
            this._tabElementBindings.tabback.detach();
            this._tabElementBindings.tabforward.detach();
            this._tabElementBindings.focus.detach();
            this._tabElementBindings.blur.detach();
        }
    },


    /**
    * Adds or removes a specified state CSS class to the underlying uploader button.
    *
    * @method _setButtonClass
    * @protected
    * @param state {String} The name of the state enumerated in `buttonClassNames` attribute
    * from which to derive the needed class name.
    * @param add {Boolean} A Boolean indicating whether to add or remove the class.
    */
    _setButtonClass : function (state, add) {
        if (add) {
            this.get("selectFilesButton").addClass(this.get("buttonClassNames")[state]);
        }
        else {
            this.get("selectFilesButton").removeClass(this.get("buttonClassNames")[state]);
        }
    },


    /**
    * Syncs the state of the `fileFilters` attribute between the instance of UploaderFlash
    * and the Flash player.
    *
    * @method _setFileFilters
    * @private
    */
    _setFileFilters : function () {
        if (this._swfReference && this.get("fileFilters").length > 0) {
            this._swfReference.callSWF("setFileFilters", [this.get("fileFilters")]);
        }
    },



    /**
    * Syncs the state of the `multipleFiles` attribute between this class
    * and the Flash uploader.
    *
    * @method _setMultipleFiles
    * @private
    */
    _setMultipleFiles : function () {
        if (this._swfReference) {
            this._swfReference.callSWF("setAllowMultipleFiles", [this.get("multipleFiles")]);
        }
    },

    /**
    * Syncs the state of the `enabled` attribute between this class
    * and the Flash uploader.
    *
    * @method _triggerEnabled
    * @private
    */
    _triggerEnabled : function () {
        if (this.get("enabled")) {
            this._swfReference.callSWF("enable");
            this._swfReference._swf.setAttribute("aria-disabled", "false");
            this._setButtonClass("disabled", false);
        }
        else {
            this._swfReference.callSWF("disable");
            this._swfReference._swf.setAttribute("aria-disabled", "true");
            this._setButtonClass("disabled", true);
        }
    },

    /**
    * Getter for the `fileList` attribute
    *
    * @method _getFileList
    * @private
    */
    _getFileList : function () {
        return this._fileList.concat();
    },

    /**
    * Setter for the `fileList` attribute
    *
    * @method _setFileList
    * @private
    */
    _setFileList : function (val) {
        this._fileList = val.concat();
        return this._fileList.concat();
    },

    /**
    * Adjusts the content of the `fileList` based on the results of file selection
    * and the `appendNewFiles` attribute. If the `appendNewFiles` attribute is true,
    * then selected files are appended to the existing list; otherwise, the list is
    * cleared and populated with the newly selected files.
    *
    * @method _updateFileList
    * @param ev {Event} The file selection event received from the uploader.
    * @private
    */
    _updateFileList : function (ev) {

        Y.one("body").focus();
        this._swfReference._swf.focus();


        var newfiles = ev.fileList,
            fileConfObjects = [],
            parsedFiles = [],
            swfRef = this._swfReference,
            filterFunc = this.get("fileFilterFunction"),
            oldfiles;

        Y.each(newfiles, function (value) {
            var newFileConf = {};
            newFileConf.id = value.fileId;
            newFileConf.name = value.fileReference.name;
            newFileConf.size = value.fileReference.size;
            newFileConf.type = value.fileReference.type;
            newFileConf.dateCreated = value.fileReference.creationDate;
            newFileConf.dateModified = value.fileReference.modificationDate;
            newFileConf.uploader = swfRef;

            fileConfObjects.push(newFileConf);
        });

         if (filterFunc) {
            Y.each(fileConfObjects, function (value) {
                var newfile = new Y.FileFlash(value);
                if (filterFunc(newfile)) {
                    parsedFiles.push(newfile);
                }
            });
         }
         else {
            Y.each(fileConfObjects, function (value) {
                parsedFiles.push(new Y.FileFlash(value));
            });
         }

        if (parsedFiles.length > 0) {
            oldfiles = this.get("fileList");

            this.set("fileList",
                             this.get("appendNewFiles") ? oldfiles.concat(parsedFiles) : parsedFiles );

            this.fire("fileselect", { fileList: parsedFiles });
        }

    },



    /**
    * Handles and retransmits events fired by `Y.FileFlash` and `Y.Uploader.Queue`.
    *
    * @method _uploadEventHandler
    * @param event The event dispatched during the upload process.
    * @private
    */
    _uploadEventHandler : function (event) {

        switch (event.type) {
            case "file:uploadstart":
                 this.fire("fileuploadstart", event);
                break;
            case "file:uploadprogress":
                 this.fire("uploadprogress", event);
                break;
            case "uploaderqueue:totaluploadprogress":
                 this.fire("totaluploadprogress", event);
                break;
            case "file:uploadcomplete":
                 this.fire("uploadcomplete", event);
                break;
            case "uploaderqueue:alluploadscomplete":
                 this.queue = null;
                 this.fire("alluploadscomplete", event);
                break;
            case "file:uploaderror": //overflow intentional
            case "uploaderqueue:uploaderror":
                 this.fire("uploaderror", event);
                break;
            case "file:uploadcancel": // overflow intentional
            case "uploaderqueue:uploadcancel":
                 this.fire("uploadcancel", event);
            break;
        }

    },



    /**
    * Starts the upload of a specific file.
    *
    * @method upload
    * @param file {Y.FileFlash} Reference to the instance of the file to be uploaded.
    * @param url {String} The URL to upload the file to.
    * @param [postVars] {Object} A set of key-value pairs to send as variables along with the file upload HTTP request.
    *                          If not specified, the values from the attribute `postVarsPerFile` are used instead.
    */
    upload : function (file, url, postvars) {

        var uploadURL = url || this.get("uploadURL"),
            postVars = postvars || this.get("postVarsPerFile"),
            fileId = file.get("id");

            postVars = postVars.hasOwnProperty(fileId) ? postVars[fileId] : postVars;

        if (file instanceof Y.FileFlash) {

            file.on("uploadstart", this._uploadEventHandler, this);
            file.on("uploadprogress", this._uploadEventHandler, this);
            file.on("uploadcomplete", this._uploadEventHandler, this);
            file.on("uploaderror", this._uploadEventHandler, this);
            file.on("uploadcancel", this._uploadEventHandler, this);

            file.startUpload(uploadURL, postVars, this.get("fileFieldName"));
        }
    },

    /**
    * Starts the upload of all files on the file list, using an automated queue.
    *
    * @method uploadAll
    * @param url {String} The URL to upload the files to.
    * @param [postVars] {Object} A set of key-value pairs to send as variables along with the file upload HTTP request.
    *                          If not specified, the values from the attribute `postVarsPerFile` are used instead.
    */
    uploadAll : function (url, postvars) {
        this.uploadThese(this.get("fileList"), url, postvars);
    },

    /**
    * Starts the upload of the files specified in the first argument, using an automated queue.
    *
    * @method uploadThese
    * @param files {Array} The list of files to upload.
    * @param url {String} The URL to upload the files to.
    * @param [postVars] {Object} A set of key-value pairs to send as variables along with the file upload HTTP request.
    *                          If not specified, the values from the attribute `postVarsPerFile` are used instead.
    */
    uploadThese : function (files, url, postvars) {
        if (!this.queue) {
            var uploadURL = url || this.get("uploadURL"),
                postVars = postvars || this.get("postVarsPerFile");

            this.queue = new UploaderQueue({
                simUploads: this.get("simLimit"),
                errorAction: this.get("errorAction"),
                fileFieldName: this.get("fileFieldName"),
                fileList: files,
                uploadURL: uploadURL,
                perFileParameters: postVars,
                retryCount: this.get("retryCount")
            });

            this.queue.on("uploadstart", this._uploadEventHandler, this);
            this.queue.on("uploadprogress", this._uploadEventHandler, this);
            this.queue.on("totaluploadprogress", this._uploadEventHandler, this);
            this.queue.on("uploadcomplete", this._uploadEventHandler, this);
            this.queue.on("alluploadscomplete", this._uploadEventHandler, this);
            this.queue.on("alluploadscancelled", function () {this.queue = null;}, this);
            this.queue.on("uploaderror", this._uploadEventHandler, this);
            this.queue.startUpload();

            this.fire("uploadstart");
        }
    }
},

{
    /**
    * The template for the Flash player container. Since the Flash player container needs
    * to completely overlay the &lquot;Select Files&rqot; control, it's positioned absolutely,
    * with width and height set to 100% of the parent.
    *
    * @property FLASH_CONTAINER
    * @type {HTML}
    * @static
    * @default '<div id="{swfContainerId}" style="position:absolute; top:0px; left: 0px; margin: 0; padding: 0;
    *           border: 0; width:100%; height:100%"></div>'
    */
    FLASH_CONTAINER: '<div id="{swfContainerId}" style="position:absolute; top:0px; left: 0px; margin: 0; ' +
                     'padding: 0; border: 0; width:100%; height:100%"></div>',

    /**
    * The template for the "Select Files" button.
    *
    * @property SELECT_FILES_BUTTON
    * @type {HTML}
    * @static
    * @default "<button type='button' class='yui3-button' tabindex='-1'>{selectButtonLabel}</button>"
    */
    SELECT_FILES_BUTTON: "<button type='button' class='yui3-button' tabindex='-1'>{selectButtonLabel}</button>",

    /**
    * The static property reflecting the type of uploader that `Y.Uploader`
    * aliases. The UploaderFlash value is `"flash"`.
    *
    * @property TYPE
    * @type {String}
    * @static
    */
    TYPE: "flash",

    /**
    * The identity of the widget.
    *
    * @property NAME
    * @type String
    * @default 'uploader'
    * @readOnly
    * @protected
    * @static
    */
    NAME: "uploader",

    /**
    * Static property used to define the default attribute configuration of
    * the Widget.
    *
    * @property ATTRS
    * @type {Object}
    * @protected
    * @static
    */
    ATTRS: {

        /**
        * A Boolean indicating whether newly selected files should be appended
        * to the existing file list, or whether they should replace it.
        *
        * @attribute appendNewFiles
        * @type {Boolean}
        * @default true
        */
        appendNewFiles : {
            value: true
        },

        /**
        * The names of CSS classes that correspond to different button states
        * of the "Select Files" control. These classes are assigned to the
        * "Select Files" control based on the mouse states reported by the
        * Flash player. The keys for the class names are:
        * <ul>
        *   <li> <strong>`hover`</strong>: the class corresponding to mouse hovering over
        *      the "Select Files" button.</li>
        *   <li> <strong>`active`</strong>: the class corresponding to mouse down state of
        *      the "Select Files" button.</li>
        *   <li> <strong>`disabled`</strong>: the class corresponding to the disabled state
        *      of the "Select Files" button.</li>
        *   <li> <strong>`focus`</strong>: the class corresponding to the focused state of
        *      the "Select Files" button.</li>
        * </ul>
        * @attribute buttonClassNames
        * @type {Object}
        * @default { hover: "yui3-button-hover",
        *            active: "yui3-button-active",
        *            disabled: "yui3-button-disabled",
        *            focus: "yui3-button-selected"
        *          }
        */
        buttonClassNames: {
            value: {
                "hover": "yui3-button-hover",
                "active": "yui3-button-active",
                "disabled": "yui3-button-disabled",
                "focus": "yui3-button-selected"
            }
        },

        /**
        * A Boolean indicating whether the uploader is enabled or disabled for user input.
        *
        * @attribute enabled
        * @type {Boolean}
        * @default true
        */
        enabled : {
            value: true
        },

        /**
        * The action  performed when an upload error occurs for a specific file being uploaded.
        * The possible values are:
        * <ul>
        *   <li> <strong>`UploaderQueue.CONTINUE`</strong>: the error is ignored and the upload process is continued.</li>
        *   <li> <strong>`UploaderQueue.STOP`</strong>: the upload process is stopped as soon as any other parallel file
        *     uploads are finished.</li>
        *   <li> <strong>`UploaderQueue.RESTART_ASAP`</strong>: the file is added back to the front of the queue.</li>
        *   <li> <strong>`UploaderQueue.RESTART_AFTER`</strong>: the file is added to the back of the queue.</li>
        * </ul>
        * @attribute errorAction
        * @type {String}
        * @default UploaderQueue.CONTINUE
        */
        errorAction: {
            value: "continue",
            validator: function (val) {
                return (
                    val === UploaderQueue.CONTINUE ||
                    val === UploaderQueue.STOP ||
                    val === UploaderQueue.RESTART_ASAP ||
                    val === UploaderQueue.RESTART_AFTER
                );
            }
        },

        /**
        * An array indicating what fileFilters should be applied to the file
        * selection dialog. Each element in the array should be an object with
        * the following key-value pairs:
        * {
        *   description : String
         extensions: String of the form &lquot;*.ext1;*.ext2;*.ext3;...&rquot;
        * }
        * @attribute fileFilters
        * @type {Array}
        * @default []
        */
        fileFilters: {
            value: []
        },

        /**
        * A filtering function that is applied to every file selected by the user.
        * The function receives the `Y.File` object and must return a Boolean value.
        * If a `false` value is returned, the file in question is not added to the
        * list of files to be uploaded.
        * Use this function to put limits on file sizes or check the file names for
        * correct extension, but make sure that a server-side check is also performed,
        * since any client-side restrictions are only advisory and can be circumvented.
        *
        * @attribute fileFilterFunction
        * @type {Function}
        * @default null
        */
        fileFilterFunction: {
            value: null
        },

        /**
        * A String specifying what should be the POST field name for the file
        * content in the upload request.
        *
        * @attribute fileFieldName
        * @type {String}
        * @default Filedata
        */
        fileFieldName: {
            value: "Filedata"
        },

        /**
        * The array of files to be uploaded. All elements in the array
        * must be instances of `Y.FileFlash` and be instantiated with a `fileId`
        * retrieved from an instance of the uploader.
        *
        * @attribute fileList
        * @type {Array}
        * @default []
        */
        fileList: {
            value: [],
            getter: "_getFileList",
            setter: "_setFileList"
        },

        /**
        * A Boolean indicating whether multiple file selection is enabled.
        *
        * @attribute multipleFiles
        * @type {Boolean}
        * @default false
        */
        multipleFiles: {
            value: false
        },

        /**
        * An object, keyed by `fileId`, containing sets of key-value pairs
        * that should be passed as POST variables along with each corresponding
        * file. This attribute is only used if no POST variables are specifed
        * in the upload method call.
        *
        * @attribute postVarsPerFile
        * @type {Object}
        * @default {}
        */
        postVarsPerFile: {
            value: {}
        },

        /**
        * The label for the "Select Files" widget. This is the value that replaces the
        * `{selectButtonLabel}` token in the `SELECT_FILES_BUTTON` template.
        *
        * @attribute selectButtonLabel
        * @type {String}
        * @default "Select Files"
        */
        selectButtonLabel: {
            value: "Select Files"
        },

        /**
        * The widget that serves as the "Select Files" control for the file uploader
        *
        *
        * @attribute selectFilesButton
        * @type {Node | Widget}
        * @default A standard HTML button with YUI CSS Button skin.
        */
        selectFilesButton : {
            valueFn: function () {
                return Y.Node.create(substitute(Y.UploaderFlash.SELECT_FILES_BUTTON, {selectButtonLabel: this.get("selectButtonLabel")}));
             }
        },

        /**
        * The number of files that can be uploaded
        * simultaneously if the automatic queue management
        * is used. This value can be in the range between 2
        * and 5.
        *
        * @attribute simLimit
        * @type {Number}
        * @default 2
        */
        simLimit: {
            value: 2,
            validator: function (val) {
                    return (val >= 2 && val <= 5);
            }
        },

        /**
        * The URL to the SWF file of the flash uploader. A copy local to
        * the server that hosts the page on which the uploader appears is
        * recommended.
        *
        * @attribute swfURL
        * @type {String}
        * @default "CDN Prefix + uploader/assets/flashuploader.swf" with a
        * random GET parameter for IE (to prevent buggy behavior when the SWF
        * is cached).
        */
        swfURL: {
            valueFn: function () {
                var prefix = Y.Env.cdn + "uploader/assets/flashuploader.swf";

                if (Y.UA.ie > 0) {
                    return (prefix + "?t=" + Y.guid("uploader"));
                }

                return prefix;
            }
        },

        /**
        * The id's or `Node` references of the DOM elements that precede
        * and follow the `Select Files` button in the tab order. Specifying
        * these allows keyboard navigation to and from the Flash player
        * layer of the uploader.
        * The two keys corresponding to the DOM elements are:
        <ul>
        *   <li> `from`: the id or the `Node` reference corresponding to the
        *     DOM element that precedes the `Select Files` button in the tab order.</li>
        *   <li> `to`: the id or the `Node` reference corresponding to the
        *     DOM element that follows the `Select Files` button in the tab order.</li>
        * </ul>
        * @attribute tabElements
        * @type {Object}
        * @default null
        */
        tabElements: {
            value: null
        },

        /**
        * The URL to which file upload requested are POSTed. Only used if a different url is not passed to the upload method call.
        *
        * @attribute uploadURL
        * @type {String}
        * @default ""
        */
        uploadURL: {
            value: ""
        },

        /**
        * The number of times to try re-uploading a file that failed to upload before
        * cancelling its upload.
        *
        * @attribute retryCount
        * @type {Number}
        * @default 3
        */
        retryCount: {
            value: 3
        }
    }
});

Y.UploaderFlash.Queue = UploaderQueue;


}, '3.8.1', {
    "requires": [
        "swf",
        "widget",
        "substitute",
        "base",
        "cssbutton",
        "node",
        "event-custom",
        "file-flash",
        "uploader-queue"
    ]
});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('uploader', function (Y, NAME) {

/**
* Provides UI for selecting multiple files and functionality for
* uploading multiple files to the server with support for either
* html5 or Flash transport mechanisms, automatic queue management,
* upload progress monitoring, and error events.
* @module uploader
* @main uploader
* @since 3.5.0
*/

/**
* `Y.Uploader` serves as an alias for either <a href="UploaderFlash.html">`Y.UploaderFlash`</a>
* or <a href="UploaderHTML5.html">`Y.UploaderHTML5`</a>, depending on the feature set available
* in a specific browser. If neither HTML5 nor Flash transport layers are available, `Y.Uploader.TYPE`
* static property is set to `"none"`.
*
* @class Uploader
*/

/**
* The static property reflecting the type of uploader that `Y.Uploader`
* aliases. The possible values are:
* <ul>
* <li><strong>`"html5"`</strong>: Y.Uploader is an alias for <a href="UploaderHTML5.html">Y.UploaderHTML5</a></li>
* <li><strong>`"flash"`</strong>: Y.Uploader is an alias for <a href="UploaderFlash.html">Y.UploaderFlash</a></li>
* <li><strong>`"none"`</strong>: Neither Flash not HTML5 are available, and Y.Uploader does
* not reference an actual implementation.</li>
* </ul>
*
* @property TYPE
* @type {String}
* @static
*/

var Win = Y.config.win;

if (Win && Win.File && Win.FormData && Win.XMLHttpRequest) {
    Y.Uploader = Y.UploaderHTML5;
}

else if (Y.SWFDetect.isFlashVersionAtLeast(10,0,45)) {
    Y.Uploader = Y.UploaderFlash;
}

else {
    Y.namespace("Uploader");
    Y.Uploader.TYPE = "none";
}

}, '3.8.1', {"requires": ["uploader-html5", "uploader-flash"]});
