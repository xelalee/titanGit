/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-resize', function (Y, NAME) {

/**
 * Adds a window resize event that has its behavior normalized to fire at the
 * end of the resize rather than constantly during the resize.
 * @module event
 * @submodule event-resize
 */


/**
 * Old firefox fires the window resize event once when the resize action
 * finishes, other browsers fire the event periodically during the
 * resize.  This code uses timeout logic to simulate the Firefox 
 * behavior in other browsers.
 * @event windowresize
 * @for YUI
 */
Y.Event.define('windowresize', {

    on: (Y.UA.gecko && Y.UA.gecko < 1.91) ?
        function (node, sub, notifier) {
            sub._handle = Y.Event.attach('resize', function (e) {
                notifier.fire(e);
            });
        } :
        function (node, sub, notifier) {
            // interval bumped from 40 to 100ms as of 3.4.1
            var delay = Y.config.windowResizeDelay || 100;

            sub._handle = Y.Event.attach('resize', function (e) {
                if (sub._timer) {
                    sub._timer.cancel();
                }

                sub._timer = Y.later(delay, Y, function () {
                    notifier.fire(e);
                });
            });
        },

    detach: function (node, sub) {
        if (sub._timer) {
            sub._timer.cancel();
        }
        sub._handle.detach();
    }
    // delegate methods not defined because this only works for window
    // subscriptions, so...yeah.
});


}, '3.8.1', {"requires": ["node-base", "event-synthetic"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-ddm', function (Y, NAME) {


    /**
     * Extends the dd-ddm-base Class to add support for the viewport shim to allow a draggable
     * anode to drag to be dragged over an iframe or any other node that traps mousemove events.
     * It is also required to have Drop Targets enabled, as the viewport shim will contain the shims for the Drop Targets.
     * @module dd
     * @submodule dd-ddm
     * @for DDM
     * @namespace DD
     */
    Y.mix(Y.DD.DDM, {
        /**
        * The shim placed over the screen to track the mousemove event.
        * @private
        * @property _pg
        * @type {Node}
        */
        _pg: null,
        /**
        * Set this to true to set the shims opacity to .5 for debugging it, default: false.
        * @private
        * @property _debugShim
        * @type {Boolean}
        */
        _debugShim: false,
        _activateTargets: function() { },
        _deactivateTargets: function() {},
        _startDrag: function() {
            if (this.activeDrag && this.activeDrag.get('useShim')) {
                this._shimming = true;
                this._pg_activate();
                this._activateTargets();
            }
        },
        _endDrag: function() {
            this._pg_deactivate();
            this._deactivateTargets();
        },
        /**
        * Deactivates the shim
        * @private
        * @method _pg_deactivate
        */
        _pg_deactivate: function() {
            this._pg.setStyle('display', 'none');
        },
        /**
        * Activates the shim
        * @private
        * @method _pg_activate
        */
        _pg_activate: function() {
            if (!this._pg) {
                this._createPG();
            }
            var ah = this.activeDrag.get('activeHandle'), cur = 'auto';
            if (ah) {
                cur = ah.getStyle('cursor');
            }
            if (cur === 'auto') {
                cur = this.get('dragCursor');
            }

            this._pg_size();
            this._pg.setStyles({
                top: 0,
                left: 0,
                display: 'block',
                opacity: ((this._debugShim) ? '.5' : '0'),
                cursor: cur
            });
        },
        /**
        * Sizes the shim on: activatation, window:scroll, window:resize
        * @private
        * @method _pg_size
        */
        _pg_size: function() {
            if (this.activeDrag) {
                var b = Y.one('body'),
                h = b.get('docHeight'),
                w = b.get('docWidth');
                this._pg.setStyles({
                    height: h + 'px',
                    width: w + 'px'
                });
            }
        },
        /**
        * Creates the shim and adds it's listeners to it.
        * @private
        * @method _createPG
        */
        _createPG: function() {
            var pg = Y.Node.create('<div></div>'),
            bd = Y.one('body'), win;
            pg.setStyles({
                top: '0',
                left: '0',
                position: 'absolute',
                zIndex: '9999',
                overflow: 'hidden',
                backgroundColor: 'red',
                display: 'none',
                height: '5px',
                width: '5px'
            });
            pg.set('id', Y.stamp(pg));
            pg.addClass(Y.DD.DDM.CSS_PREFIX + '-shim');
            bd.prepend(pg);
            this._pg = pg;
            this._pg.on('mousemove', Y.throttle(Y.bind(this._move, this), this.get('throttleTime')));
            this._pg.on('mouseup', Y.bind(this._end, this));

            win = Y.one('win');
            Y.on('window:resize', Y.bind(this._pg_size, this));
            win.on('scroll', Y.bind(this._pg_size, this));
        }
    }, true);




}, '3.8.1', {"requires": ["dd-ddm-base", "event-resize"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-ddm-drop', function (Y, NAME) {


    /**
     * Extends the dd-ddm Class to add support for the placement of Drop Target
     * shims inside the viewport shim. It also handles all Drop Target related events and interactions.
     * @module dd
     * @submodule dd-ddm-drop
     * @for DDM
     * @namespace DD
     */

    //TODO CSS class name for the bestMatch..
    Y.mix(Y.DD.DDM, {
        /**
        * This flag turns off the use of the mouseover/mouseout shim. It should not be used unless you know what you are doing.
        * @private
        * @property _noShim
        * @type {Boolean}
        */
        _noShim: false,
        /**
        * Placeholder for all active shims on the page
        * @private
        * @property _activeShims
        * @type {Array}
        */
        _activeShims: [],
        /**
        * This method checks the _activeShims Object to see if there is a shim active.
        * @private
        * @method _hasActiveShim
        * @return {Boolean}
        */
        _hasActiveShim: function() {
            if (this._noShim) {
                return true;
            }
            return this._activeShims.length;
        },
        /**
        * Adds a Drop Target to the list of active shims
        * @private
        * @method _addActiveShim
        * @param {Object} d The Drop instance to add to the list.
        */
        _addActiveShim: function(d) {
            this._activeShims.push(d);
        },
        /**
        * Removes a Drop Target to the list of active shims
        * @private
        * @method _removeActiveShim
        * @param {Object} d The Drop instance to remove from the list.
        */
        _removeActiveShim: function(d) {
            var s = [];
            Y.Array.each(this._activeShims, function(v) {
                if (v._yuid !== d._yuid) {
                    s.push(v);
                }

            });
            this._activeShims = s;
        },
        /**
        * This method will sync the position of the shims on the Drop Targets that are currently active.
        * @method syncActiveShims
        * @param {Boolean} force Resize/sync all Targets.
        */
        syncActiveShims: function(force) {
            Y.later(0, this, function(force) {
                var drops = ((force) ? this.targets : this._lookup());
                Y.Array.each(drops, function(v) {
                    v.sizeShim.call(v);
                }, this);
            }, force);
        },
        /**
        * The mode that the drag operations will run in 0 for Point, 1 for Intersect, 2 for Strict
        * @private
        * @property mode
        * @type Number
        */
        mode: 0,
        /**
        * In point mode, a Drop is targeted by the cursor being over the Target
        * @private
        * @property POINT
        * @type Number
        */
        POINT: 0,
        /**
        * In intersect mode, a Drop is targeted by "part" of the drag node being over the Target
        * @private
        * @property INTERSECT
        * @type Number
        */
        INTERSECT: 1,
        /**
        * In strict mode, a Drop is targeted by the "entire" drag node being over the Target
        * @private
        * @property STRICT
        * @type Number
        */
        STRICT: 2,
        /**
        * Should we only check targets that are in the viewport on drags (for performance), default: true
        * @property useHash
        * @type {Boolean}
        */
        useHash: true,
        /**
        * A reference to the active Drop Target
        * @property activeDrop
        * @type {Object}
        */
        activeDrop: null,
        /**
        * An array of the valid Drop Targets for this interaction.
        * @property validDrops
        * @type {Array}
        */
        //TODO Change array/object literals to be in sync..
        validDrops: [],
        /**
        * An object literal of Other Drop Targets that we encountered during this interaction (in the case of overlapping Drop Targets)
        * @property otherDrops
        * @type {Object}
        */
        otherDrops: {},
        /**
        * All of the Targets
        * @property targets
        * @type {Array}
        */
        targets: [],
        /**
        * Add a Drop Target to the list of Valid Targets. This list get's regenerated on each new drag operation.
        * @private
        * @method _addValid
        * @param {Object} drop
        * @return {Self}
        * @chainable
        */
        _addValid: function(drop) {
            this.validDrops.push(drop);
            return this;
        },
        /**
        * Removes a Drop Target from the list of Valid Targets. This list get's regenerated on each new drag operation.
        * @private
        * @method _removeValid
        * @param {Object} drop
        * @return {Self}
        * @chainable
        */
        _removeValid: function(drop) {
            var drops = [];
            Y.Array.each(this.validDrops, function(v) {
                if (v !== drop) {
                    drops.push(v);
                }
            });

            this.validDrops = drops;
            return this;
        },
        /**
        * Check to see if the Drag element is over the target, method varies on current mode
        * @method isOverTarget
        * @param {Object} drop The drop to check against
        * @return {Boolean}
        */
        isOverTarget: function(drop) {
            if (this.activeDrag && drop) {
                var xy = this.activeDrag.mouseXY, r, dMode = this.activeDrag.get('dragMode'),
                    aRegion, node = drop.shim;
                if (xy && this.activeDrag) {
                    aRegion = this.activeDrag.region;
                    if (dMode === this.STRICT) {
                        return this.activeDrag.get('dragNode').inRegion(drop.region, true, aRegion);
                    }
                    if (drop && drop.shim) {
                        if ((dMode === this.INTERSECT) && this._noShim) {
                            r = aRegion || this.activeDrag.get('node');
                            return drop.get('node').intersect(r, drop.region).inRegion;
                        }

                        if (this._noShim) {
                            node = drop.get('node');
                        }
                        return node.intersect({
                            top: xy[1],
                            bottom: xy[1],
                            left: xy[0],
                            right: xy[0]
                        }, drop.region).inRegion;
                    }
                }
            }
            return false;
        },
        /**
        * Clears the cache data used for this interaction.
        * @method clearCache
        */
        clearCache: function() {
            this.validDrops = [];
            this.otherDrops = {};
            this._activeShims = [];
        },
        /**
        * Clear the cache and activate the shims of all the targets
        * @private
        * @method _activateTargets
        */
        _activateTargets: function() {
            this._noShim = true;
            this.clearCache();
            Y.Array.each(this.targets, function(v) {
                v._activateShim([]);
                if (v.get('noShim') === true) {
                    this._noShim = false;
                }
            }, this);
            this._handleTargetOver();

        },
        /**
        * This method will gather the area for all potential targets and see which has the hightest covered area and return it.
        * @method getBestMatch
        * @param {Array} drops An Array of drops to scan for the best match.
        * @param {Boolean} all If present, it returns an Array. First item is best match, second is an Array of the other items in the original Array.
        * @return {Object or Array}
        */
        getBestMatch: function(drops, all) {
            var biggest = null, area = 0, out;

            Y.Array.each(drops, function(v) {
                var inter = this.activeDrag.get('dragNode').intersect(v.get('node'));
                v.region.area = inter.area;

                if (inter.inRegion) {
                    if (inter.area > area) {
                        area = inter.area;
                        biggest = v;
                    }
                }
            }, this);
            if (all) {
                out = [];
                //TODO Sort the others in numeric order by area covered..
                Y.Array.each(drops, function(v) {
                    if (v !== biggest) {
                        out.push(v);
                    }
                }, this);
                return [biggest, out];
            }
            return biggest;
        },
        /**
        * This method fires the drop:hit, drag:drophit, drag:dropmiss methods and deactivates the shims..
        * @private
        * @method _deactivateTargets
        */
        _deactivateTargets: function() {
            var other = [], tmp,
                activeDrag = this.activeDrag,
                activeDrop = this.activeDrop;

            //TODO why is this check so hard??
            if (activeDrag && activeDrop && this.otherDrops[activeDrop]) {
                if (!activeDrag.get('dragMode')) {
                    //TODO otherDrops -- private..
                    other = this.otherDrops;
                    delete other[activeDrop];
                } else {
                    tmp = this.getBestMatch(this.otherDrops, true);
                    activeDrop = tmp[0];
                    other = tmp[1];
                }
                activeDrag.get('node').removeClass(this.CSS_PREFIX + '-drag-over');
                if (activeDrop) {
                    activeDrop.fire('drop:hit', { drag: activeDrag, drop: activeDrop, others: other });
                    activeDrag.fire('drag:drophit', { drag: activeDrag,  drop: activeDrop, others: other });
                }
            } else if (activeDrag && activeDrag.get('dragging')) {
                activeDrag.get('node').removeClass(this.CSS_PREFIX + '-drag-over');
                activeDrag.fire('drag:dropmiss', { pageX: activeDrag.lastXY[0], pageY: activeDrag.lastXY[1] });
            }

            this.activeDrop = null;

            Y.Array.each(this.targets, function(v) {
                v._deactivateShim([]);
            }, this);
        },
        /**
        * This method is called when the move method is called on the Drag Object.
        * @private
        * @method _dropMove
        */
        _dropMove: function() {
            if (this._hasActiveShim()) {
                this._handleTargetOver();
            } else {
                Y.Array.each(this.otherDrops, function(v) {
                    v._handleOut.apply(v, []);
                });
            }
        },
        /**
        * Filters the list of Drops down to those in the viewport.
        * @private
        * @method _lookup
        * @return {Array} The valid Drop Targets that are in the viewport.
        */
        _lookup: function() {
            if (!this.useHash || this._noShim) {
                return this.validDrops;
            }
            var drops = [];
            //Only scan drop shims that are in the Viewport
            Y.Array.each(this.validDrops, function(v) {
                if (v.shim && v.shim.inViewportRegion(false, v.region)) {
                    drops.push(v);
                }
            });
            return drops;

        },
        /**
        * This method execs _handleTargetOver on all valid Drop Targets
        * @private
        * @method _handleTargetOver
        */
        _handleTargetOver: function() {
            var drops = this._lookup();
            Y.Array.each(drops, function(v) {
                v._handleTargetOver.call(v);
            }, this);
        },
        /**
        * Add the passed in Target to the targets collection
        * @private
        * @method _regTarget
        * @param {Object} t The Target to add to the targets collection
        */
        _regTarget: function(t) {
            this.targets.push(t);
        },
        /**
        * Remove the passed in Target from the targets collection
        * @private
        * @method _unregTarget
        * @param {Object} drop The Target to remove from the targets collection
        */
        _unregTarget: function(drop) {
            var targets = [], vdrops;
            Y.Array.each(this.targets, function(v) {
                if (v !== drop) {
                    targets.push(v);
                }
            }, this);
            this.targets = targets;

            vdrops = [];
            Y.Array.each(this.validDrops, function(v) {
                if (v !== drop) {
                    vdrops.push(v);
                }
            });

            this.validDrops = vdrops;
        },
        /**
        * Get a valid Drop instance back from a Node or a selector string, false otherwise
        * @method getDrop
        * @param {String/Object} node The Node instance or Selector string to check for a valid Drop Object
        * @return {Object}
        */
        getDrop: function(node) {
            var drop = false,
                n = Y.one(node);
            if (n instanceof Y.Node) {
                Y.Array.each(this.targets, function(v) {
                    if (n.compareTo(v.get('node'))) {
                        drop = v;
                    }
                });
            }
            return drop;
        }
    }, true);




}, '3.8.1', {"requires": ["dd-ddm"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-drag', function (Y, NAME) {


    /**
     * Provides the ability to drag a Node.
     * @module dd
     * @submodule dd-drag
     */
    /**
     * Provides the ability to drag a Node.
     * @class Drag
     * @extends Base
     * @constructor
     * @namespace DD
     */

    var DDM = Y.DD.DDM,
        NODE = 'node',
        DRAGGING = 'dragging',
        DRAG_NODE = 'dragNode',
        OFFSET_HEIGHT = 'offsetHeight',
        OFFSET_WIDTH = 'offsetWidth',
        /**
        * Handles the mouseup DOM event, does nothing internally just fires.
        * @event drag:mouseup
        * @bubbles DDM
        * @type {CustomEvent}
        */
        /**
        * Handles the mousedown DOM event, checks to see if you have a valid handle then starts the drag timers.
        * @event drag:mouseDown
        * @preventable _defMouseDownFn
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl><dt>ev</dt><dd>The original mousedown event.</dd></dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_MOUSE_DOWN = 'drag:mouseDown',
        /**
        * Fires after the mousedown event has been cleared.
        * @event drag:afterMouseDown
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl><dt>ev</dt><dd>The original mousedown event.</dd></dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_AFTER_MOUSE_DOWN = 'drag:afterMouseDown',
        /**
        * Fires after a handle is removed.
        * @event drag:removeHandle
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl><dt>handle</dt><dd>The handle that was removed.</dd></dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_REMOVE_HANDLE = 'drag:removeHandle',
        /**
        * Fires after a handle is added.
        * @event drag:addHandle
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl><dt>handle</dt><dd>The handle that was added.</dd></dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_ADD_HANDLE = 'drag:addHandle',
        /**
        * Fires after an invalid selector is removed.
        * @event drag:removeInvalid
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl><dt>handle</dt><dd>The handle that was removed.</dd></dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_REMOVE_INVALID = 'drag:removeInvalid',
        /**
        * Fires after an invalid selector is added.
        * @event drag:addInvalid
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl><dt>handle</dt><dd>The handle that was added.</dd></dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_ADD_INVALID = 'drag:addInvalid',
        /**
        * Fires at the start of a drag operation.
        * @event drag:start
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>pageX</dt><dd>The original node position X.</dd>
        * <dt>pageY</dt><dd>The original node position Y.</dd>
        * <dt>startTime</dt><dd>The startTime of the event. getTime on the current Date object.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_START = 'drag:start',
        /**
        * Fires at the end of a drag operation.
        * @event drag:end
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>pageX</dt><dd>The current node position X.</dd>
        * <dt>pageY</dt><dd>The current node position Y.</dd>
        * <dt>startTime</dt><dd>The startTime of the event, from the start event.</dd>
        * <dt>endTime</dt><dd>The endTime of the event. getTime on the current Date object.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_END = 'drag:end',
        /**
        * Fires every mousemove during a drag operation.
        * @event drag:drag
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>pageX</dt><dd>The current node position X.</dd>
        * <dt>pageY</dt><dd>The current node position Y.</dd>
        * <dt>scroll</dt><dd>Should a scroll action occur.</dd>
        * <dt>info</dt><dd>Object hash containing calculated XY arrays: start, xy, delta, offset</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_DRAG = 'drag:drag',
        /**
        * Fires when this node is aligned.
        * @event drag:align
        * @preventable _defAlignFn
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>pageX</dt><dd>The current node position X.</dd>
        * <dt>pageY</dt><dd>The current node position Y.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_ALIGN = 'drag:align',
        /**
        * Fires when this node is over a Drop Target. (Fired from dd-drop)
        * @event drag:over
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The drop object at the time of the event.</dd>
        * <dt>drag</dt><dd>The drag object at the time of the event.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        /**
        * Fires when this node enters a Drop Target. (Fired from dd-drop)
        * @event drag:enter
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The drop object at the time of the event.</dd>
        * <dt>drag</dt><dd>The drag object at the time of the event.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        /**
        * Fires when this node exits a Drop Target. (Fired from dd-drop)
        * @event drag:exit
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The drop object at the time of the event.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        /**
        * Fires when this node is dropped on a valid Drop Target. (Fired from dd-ddm-drop)
        * @event drag:drophit
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The best guess on what was dropped on.</dd>
        * <dt>drag</dt><dd>The drag object at the time of the event.</dd>
        * <dt>others</dt><dd>An array of all the other drop targets that was dropped on.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        /**
        * Fires when this node is dropped on an invalid Drop Target. (Fired from dd-ddm-drop)
        * @event drag:dropmiss
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>pageX</dt><dd>The current node position X.</dd>
        * <dt>pageY</dt><dd>The current node position Y.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */

    Drag = function(o) {
        this._lazyAddAttrs = false;
        Drag.superclass.constructor.apply(this, arguments);

        var valid = DDM._regDrag(this);
        if (!valid) {
            Y.error('Failed to register node, already in use: ' + o.node);
        }
    };

    Drag.NAME = 'drag';

    /**
    * This property defaults to "mousedown", but when drag-gestures is loaded, it is changed to "gesturemovestart"
    * @static
    * @property START_EVENT
    */
    Drag.START_EVENT = 'mousedown';

    Drag.ATTRS = {
        /**
        * Y.Node instance to use as the element to initiate a drag operation
        * @attribute node
        * @type Node
        */
        node: {
            setter: function(node) {
                if (this._canDrag(node)) {
                    return node;
                }
                var n = Y.one(node);
                if (!n) {
                    Y.error('DD.Drag: Invalid Node Given: ' + node);
                }
                return n;
            }
        },
        /**
        * Y.Node instance to use as the draggable element, defaults to node
        * @attribute dragNode
        * @type Node
        */
        dragNode: {
            setter: function(node) {
                if (this._canDrag(node)) {
                    return node;
                }
                var n = Y.one(node);
                if (!n) {
                    Y.error('DD.Drag: Invalid dragNode Given: ' + node);
                }
                return n;
            }
        },
        /**
        * Offset the drag element by the difference in cursor position: default true
        * @attribute offsetNode
        * @type Boolean
        */
        offsetNode: {
            value: true
        },
        /**
        * Center the dragNode to the mouse position on drag:start: default false
        * @attribute startCentered
        * @type Boolean
        */
        startCentered: {
            value: false
        },
        /**
        * The number of pixels to move to start a drag operation, default is 3.
        * @attribute clickPixelThresh
        * @type Number
        */
        clickPixelThresh: {
            value: DDM.get('clickPixelThresh')
        },
        /**
        * The number of milliseconds a mousedown has to pass to start a drag operation, default is 1000.
        * @attribute clickTimeThresh
        * @type Number
        */
        clickTimeThresh: {
            value: DDM.get('clickTimeThresh')
        },
        /**
        * Set to lock this drag element so that it can't be dragged: default false.
        * @attribute lock
        * @type Boolean
        */
        lock: {
            value: false,
            setter: function(lock) {
                if (lock) {
                    this.get(NODE).addClass(DDM.CSS_PREFIX + '-locked');
                } else {
                    this.get(NODE).removeClass(DDM.CSS_PREFIX + '-locked');
                }
                return lock;
            }
        },
        /**
        * A payload holder to store arbitrary data about this drag object, can be used to store any value.
        * @attribute data
        * @type Mixed
        */
        data: {
            value: false
        },
        /**
        * If this is false, the drag element will not move with the cursor: default true. Can be used to "resize" the element.
        * @attribute move
        * @type Boolean
        */
        move: {
            value: true
        },
        /**
        * Use the protective shim on all drag operations: default true. Only works with dd-ddm, not dd-ddm-base.
        * @attribute useShim
        * @type Boolean
        */
        useShim: {
            value: true
        },
        /**
        * Config option is set by Drag to inform you of which handle fired the drag event (in the case that there are several handles): default false.
        * @attribute activeHandle
        * @type Node
        */
        activeHandle: {
            value: false
        },
        /**
        * By default a drag operation will only begin if the mousedown occurred with the primary mouse button.
        * Setting this to false will allow for all mousedown events to trigger a drag.
        * @attribute primaryButtonOnly
        * @type Boolean
        */
        primaryButtonOnly: {
            value: true
        },
        /**
        * This attribute is not meant to be used by the implementor, it is meant to be used as an Event tracker so you can listen for it to change.
        * @attribute dragging
        * @type Boolean
        */
        dragging: {
            value: false
        },
        parent: {
            value: false
        },
        /**
        * This attribute only works if the dd-drop module has been loaded. It will make this node a drop target as well as draggable.
        * @attribute target
        * @type Boolean
        */
        target: {
            value: false,
            setter: function(config) {
                this._handleTarget(config);
                return config;
            }
        },
        /**
        * This attribute only works if the dd-drop module is active. It will set the dragMode (point, intersect, strict) of this Drag instance.
        * @attribute dragMode
        * @type String
        */
        dragMode: {
            value: null,
            setter: function(mode) {
                return DDM._setDragMode(mode);
            }
        },
        /**
        * Array of groups to add this drag into.
        * @attribute groups
        * @type Array
        */
        groups: {
            value: ['default'],
            getter: function() {
                if (!this._groups) {
                    this._groups = {};
                    return [];
                }

                return Y.Object.keys(this._groups);
            },
            setter: function(g) {
                this._groups = Y.Array.hash(g);
                return g;
            }
        },
        /**
        * Array of valid handles to add. Adding something here will set all handles, even if previously added with addHandle
        * @attribute handles
        * @type Array
        */
        handles: {
            value: null,
            setter: function(g) {
                if (g) {
                    this._handles = {};
                    Y.Array.each(g, function(v) {
                        var key = v;
                        if (v instanceof Y.Node || v instanceof Y.NodeList) {
                            key = v._yuid;
                        }
                        this._handles[key] = v;
                    }, this);
                } else {
                    this._handles = null;
                }
                return g;
            }
        },
        /**
        * Controls the default bubble parent for this Drag instance. Default: Y.DD.DDM. Set to false to disable bubbling. Use bubbleTargets in config
        * @deprecated
        * @attribute bubbles
        * @type Object
        */
        bubbles: {
            setter: function(t) {
                this.addTarget(t);
                return t;
            }
        },
        /**
        * Should the mousedown event be halted. Default: true
        * @attribute haltDown
        * @type Boolean
        */
        haltDown: {
            value: true
        }
    };

    Y.extend(Drag, Y.Base, {
        /**
        * Checks the object for the methods needed to drag the object around.
        * Normally this would be a node instance, but in the case of Graphics, it
        * may be an SVG node or something similar.
        * @method _canDrag
        * @private
        * @param {Object} n The object to check
        * @return {Boolean} True or false if the Object contains the methods needed to Drag
        */
        _canDrag: function(n) {
            if (n && n.setXY && n.getXY && n.test && n.contains) {
                return true;
            }
            return false;
        },
        /**
        * The default bubbleTarget for this object. Default: Y.DD.DDM
        * @private
        * @property _bubbleTargets
        */
        _bubbleTargets: Y.DD.DDM,
        /**
        * Add this Drag instance to a group, this should be used for on-the-fly group additions.
        * @method addToGroup
        * @param {String} g The group to add this Drag Instance to.
        * @return {Self}
        * @chainable
        */
        addToGroup: function(g) {
            this._groups[g] = true;
            DDM._activateTargets();
            return this;
        },
        /**
        * Remove this Drag instance from a group, this should be used for on-the-fly group removals.
        * @method removeFromGroup
        * @param {String} g The group to remove this Drag Instance from.
        * @return {Self}
        * @chainable
        */
        removeFromGroup: function(g) {
            delete this._groups[g];
            DDM._activateTargets();
            return this;
        },
        /**
        * This will be a reference to the Drop instance associated with this drag if the target: true config attribute is set..
        * @property target
        * @type {Object}
        */
        target: null,
        /**
        * Attribute handler for the target config attribute.
        * @private
        * @method _handleTarget
        * @param {Boolean/Object} config The Config
        */
        _handleTarget: function(config) {
            if (Y.DD.Drop) {
                if (config === false) {
                    if (this.target) {
                        DDM._unregTarget(this.target);
                        this.target = null;
                    }
                } else {
                    if (!Y.Lang.isObject(config)) {
                        config = {};
                    }
                    config.bubbleTargets = config.bubbleTargets || Y.Object.values(this._yuievt.targets);
                    config.node = this.get(NODE);
                    config.groups = config.groups || this.get('groups');
                    this.target = new Y.DD.Drop(config);
                }
            }
        },
        /**
        * Storage Array for the groups this drag belongs to.
        * @private
        * @property _groups
        * @type {Array}
        */
        _groups: null,
        /**
        * This method creates all the events for this Event Target and publishes them so we get Event Bubbling.
        * @private
        * @method _createEvents
        */
        _createEvents: function() {

            this.publish(EV_MOUSE_DOWN, {
                defaultFn: this._defMouseDownFn,
                queuable: false,
                emitFacade: true,
                bubbles: true,
                prefix: 'drag'
            });

            this.publish(EV_ALIGN, {
                defaultFn: this._defAlignFn,
                queuable: false,
                emitFacade: true,
                bubbles: true,
                prefix: 'drag'
            });

            this.publish(EV_DRAG, {
                defaultFn: this._defDragFn,
                queuable: false,
                emitFacade: true,
                bubbles: true,
                prefix: 'drag'
            });

            this.publish(EV_END, {
                defaultFn: this._defEndFn,
                preventedFn: this._prevEndFn,
                queuable: false,
                emitFacade: true,
                bubbles: true,
                prefix: 'drag'
            });

            var ev = [
                EV_AFTER_MOUSE_DOWN,
                EV_REMOVE_HANDLE,
                EV_ADD_HANDLE,
                EV_REMOVE_INVALID,
                EV_ADD_INVALID,
                EV_START,
                'drag:drophit',
                'drag:dropmiss',
                'drag:over',
                'drag:enter',
                'drag:exit'
            ];

            Y.Array.each(ev, function(v) {
                this.publish(v, {
                    type: v,
                    emitFacade: true,
                    bubbles: true,
                    preventable: false,
                    queuable: false,
                    prefix: 'drag'
                });
            }, this);
        },
        /**
        * A private reference to the mousedown DOM event
        * @private
        * @property _ev_md
        * @type {EventFacade}
        */
        _ev_md: null,
        /**
        * The getTime of the mousedown event. Not used, just here in case someone wants/needs to use it.
        * @private
        * @property _startTime
        * @type Date
        */
        _startTime: null,
        /**
        * The getTime of the mouseup event. Not used, just here in case someone wants/needs to use it.
        * @private
        * @property _endTime
        * @type Date
        */
        _endTime: null,
        /**
        * A private hash of the valid drag handles
        * @private
        * @property _handles
        * @type {Object}
        */
        _handles: null,
        /**
        * A private hash of the invalid selector strings
        * @private
        * @property _invalids
        * @type {Object}
        */
        _invalids: null,
        /**
        * A private hash of the default invalid selector strings: {'textarea': true, 'input': true, 'a': true, 'button': true, 'select': true}
        * @private
        * @property _invalidsDefault
        * @type {Object}
        */
        _invalidsDefault: {'textarea': true, 'input': true, 'a': true, 'button': true, 'select': true },
        /**
        * Private flag to see if the drag threshhold was met
        * @private
        * @property _dragThreshMet
        * @type {Boolean}
        */
        _dragThreshMet: null,
        /**
        * Flag to determine if the drag operation came from a timeout
        * @private
        * @property _fromTimeout
        * @type {Boolean}
        */
        _fromTimeout: null,
        /**
        * Holder for the setTimeout call
        * @private
        * @property _clickTimeout
        * @type {Boolean}
        */
        _clickTimeout: null,
        /**
        * The offset of the mouse position to the element's position
        * @property deltaXY
        * @type {Array}
        */
        deltaXY: null,
        /**
        * The initial mouse position
        * @property startXY
        * @type {Array}
        */
        startXY: null,
        /**
        * The initial element position
        * @property nodeXY
        * @type {Array}
        */
        nodeXY: null,
        /**
        * The position of the element as it's moving (for offset calculations)
        * @property lastXY
        * @type {Array}
        */
        lastXY: null,
        /**
        * The xy that the node will be set to. Changing this will alter the position as it's dragged.
        * @property actXY
        * @type {Array}
        */
        actXY: null,
        /**
        * The real xy position of the node.
        * @property realXY
        * @type {Array}
        */
        realXY: null,
        /**
        * The XY coords of the mousemove
        * @property mouseXY
        * @type {Array}
        */
        mouseXY: null,
        /**
        * A region object associated with this drag, used for checking regions while dragging.
        * @property region
        * @type Object
        */
        region: null,
        /**
        * Handler for the mouseup DOM event
        * @private
        * @method _handleMouseUp
        * @param {EventFacade} ev The Event
        */
        _handleMouseUp: function() {
            this.fire('drag:mouseup');
            this._fixIEMouseUp();
            if (DDM.activeDrag) {
                DDM._end();
            }
        },
        /**
        * The function we use as the ondragstart handler when we start a drag
        * in Internet Explorer. This keeps IE from blowing up on images as drag handles.
        * @private
        * @method _fixDragStart
        * @param {Event} e The Event
        */
        _fixDragStart: function(e) {
            if (this.validClick(e)) {
                e.preventDefault();
            }
        },
        /**
        * The function we use as the onselectstart handler when we start a drag in Internet Explorer
        * @private
        * @method _ieSelectFix
        */
        _ieSelectFix: function() {
            return false;
        },
        /**
        * We will hold a copy of the current "onselectstart" method on this property, and reset it after we are done using it.
        * @private
        * @property _ieSelectBack
        */
        _ieSelectBack: null,
        /**
        * This method copies the onselectstart listner on the document to the _ieSelectFix property
        * @private
        * @method _fixIEMouseDown
        */
        _fixIEMouseDown: function() {
            if (Y.UA.ie) {
                this._ieSelectBack = Y.config.doc.body.onselectstart;
                Y.config.doc.body.onselectstart = this._ieSelectFix;
            }
        },
        /**
        * This method copies the _ieSelectFix property back to the onselectstart listner on the document.
        * @private
        * @method _fixIEMouseUp
        */
        _fixIEMouseUp: function() {
            if (Y.UA.ie) {
                Y.config.doc.body.onselectstart = this._ieSelectBack;
            }
        },
        /**
        * Handler for the mousedown DOM event
        * @private
        * @method _handleMouseDownEvent
        * @param {EventFacade} ev  The Event
        */
        _handleMouseDownEvent: function(ev) {
            this.fire(EV_MOUSE_DOWN, { ev: ev });
        },
        /**
        * Handler for the mousedown DOM event
        * @private
        * @method _defMouseDownFn
        * @param {EventFacade} e  The Event
        */
        _defMouseDownFn: function(e) {
            var ev = e.ev;

            this._dragThreshMet = false;
            this._ev_md = ev;

            if (this.get('primaryButtonOnly') && ev.button > 1) {
                return false;
            }
            if (this.validClick(ev)) {
                this._fixIEMouseDown(ev);
                if (Drag.START_EVENT.indexOf('gesture') !== 0) {
                    //Only do these if it's not a gesture
                    if (this.get('haltDown')) {
                        ev.halt();
                    } else {
                        ev.preventDefault();
                    }
                }

                this._setStartPosition([ev.pageX, ev.pageY]);

                DDM.activeDrag = this;

                this._clickTimeout = Y.later(this.get('clickTimeThresh'), this, this._timeoutCheck);
            }
            this.fire(EV_AFTER_MOUSE_DOWN, { ev: ev });
        },
        /**
        * Method first checks to see if we have handles, if so it validates the click
        * against the handle. Then if it finds a valid handle, it checks it against
        * the invalid handles list. Returns true if a good handle was used, false otherwise.
        * @method validClick
        * @param {EventFacade} ev  The Event
        * @return {Boolean}
        */
        validClick: function(ev) {
            var r = false, n = false,
            tar = ev.target,
            hTest = null,
            els = null,
            nlist = null,
            set = false;
            if (this._handles) {
                Y.Object.each(this._handles, function(i, n) {
                    if (i instanceof Y.Node || i instanceof Y.NodeList) {
                        if (!r) {
                            nlist = i;
                            if (nlist instanceof Y.Node) {
                                nlist = new Y.NodeList(i._node);
                            }
                            nlist.each(function(nl) {
                                if (nl.contains(tar)) {
                                    r = true;
                                }
                            });
                        }
                    } else if (Y.Lang.isString(n)) {
                        //Am I this or am I inside this
                        if (tar.test(n + ', ' + n + ' *') && !hTest) {
                            hTest = n;
                            r = true;
                        }
                    }
                });
            } else {
                n = this.get(NODE);
                if (n.contains(tar) || n.compareTo(tar)) {
                    r = true;
                }
            }
            if (r) {
                if (this._invalids) {
                    Y.Object.each(this._invalids, function(i, n) {
                        if (Y.Lang.isString(n)) {
                            //Am I this or am I inside this
                            if (tar.test(n + ', ' + n + ' *')) {
                                r = false;
                            }
                        }
                    });
                }
            }
            if (r) {
                if (hTest) {
                    els = ev.currentTarget.all(hTest);
                    set = false;
                    els.each(function(n) {
                        if ((n.contains(tar) || n.compareTo(tar)) && !set) {
                            set = true;
                            this.set('activeHandle', n);
                        }
                    }, this);
                } else {
                    this.set('activeHandle', this.get(NODE));
                }
            }
            return r;
        },
        /**
        * Sets the current position of the Element and calculates the offset
        * @private
        * @method _setStartPosition
        * @param {Array} xy The XY coords to set the position to.
        */
        _setStartPosition: function(xy) {
            this.startXY = xy;

            this.nodeXY = this.lastXY = this.realXY = this.get(NODE).getXY();

            if (this.get('offsetNode')) {
                this.deltaXY = [(this.startXY[0] - this.nodeXY[0]), (this.startXY[1] - this.nodeXY[1])];
            } else {
                this.deltaXY = [0, 0];
            }
        },
        /**
        * The method passed to setTimeout to determine if the clickTimeThreshold was met.
        * @private
        * @method _timeoutCheck
        */
        _timeoutCheck: function() {
            if (!this.get('lock') && !this._dragThreshMet && this._ev_md) {
                this._fromTimeout = this._dragThreshMet = true;
                this.start();
                this._alignNode([this._ev_md.pageX, this._ev_md.pageY], true);
            }
        },
        /**
        * Remove a Selector added by addHandle
        * @method removeHandle
        * @param {String} str The selector for the handle to be removed.
        * @return {Self}
        * @chainable
        */
        removeHandle: function(str) {
            var key = str;
            if (str instanceof Y.Node || str instanceof Y.NodeList) {
                key = str._yuid;
            }
            if (this._handles[key]) {
                delete this._handles[key];
                this.fire(EV_REMOVE_HANDLE, { handle: str });
            }
            return this;
        },
        /**
        * Add a handle to a drag element. Drag only initiates when a mousedown happens on this element.
        * @method addHandle
        * @param {String} str The selector to test for a valid handle. Must be a child of the element.
        * @return {Self}
        * @chainable
        */
        addHandle: function(str) {
            if (!this._handles) {
                this._handles = {};
            }
            var key = str;
            if (str instanceof Y.Node || str instanceof Y.NodeList) {
                key = str._yuid;
            }
            this._handles[key] = str;
            this.fire(EV_ADD_HANDLE, { handle: str });
            return this;
        },
        /**
        * Remove an invalid handle added by addInvalid
        * @method removeInvalid
        * @param {String} str The invalid handle to remove from the internal list.
        * @return {Self}
        * @chainable
        */
        removeInvalid: function(str) {
            if (this._invalids[str]) {
                this._invalids[str] = null;
                delete this._invalids[str];
                this.fire(EV_REMOVE_INVALID, { handle: str });
            }
            return this;
        },
        /**
        * Add a selector string to test the handle against. If the test passes the drag operation will not continue.
        * @method addInvalid
        * @param {String} str The selector to test against to determine if this is an invalid drag handle.
        * @return {Self}
        * @chainable
        */
        addInvalid: function(str) {
            if (Y.Lang.isString(str)) {
                this._invalids[str] = true;
                this.fire(EV_ADD_INVALID, { handle: str });
            }
            return this;
        },
        /**
        * Internal init handler
        * @private
        * @method initializer
        */
        initializer: function() {

            this.get(NODE).dd = this;

            if (!this.get(NODE).get('id')) {
                var id = Y.stamp(this.get(NODE));
                this.get(NODE).set('id', id);
            }

            this.actXY = [];

            this._invalids = Y.clone(this._invalidsDefault, true);

            this._createEvents();

            if (!this.get(DRAG_NODE)) {
                this.set(DRAG_NODE, this.get(NODE));
            }

            //Fix for #2528096
            //Don't prep the DD instance until all plugins are loaded.
            this.on('initializedChange', Y.bind(this._prep, this));

            //Shouldn't have to do this..
            this.set('groups', this.get('groups'));
        },
        /**
        * Attach event listners and add classname
        * @private
        * @method _prep
        */
        _prep: function() {
            this._dragThreshMet = false;
            var node = this.get(NODE);
            node.addClass(DDM.CSS_PREFIX + '-draggable');
            node.on(Drag.START_EVENT, Y.bind(this._handleMouseDownEvent, this));
            node.on('mouseup', Y.bind(this._handleMouseUp, this));
            node.on('dragstart', Y.bind(this._fixDragStart, this));
        },
        /**
        * Detach event listeners and remove classname
        * @private
        * @method _unprep
        */
        _unprep: function() {
            var node = this.get(NODE);
            node.removeClass(DDM.CSS_PREFIX + '-draggable');
            node.detachAll('mouseup');
            node.detachAll('dragstart');
            node.detachAll(Drag.START_EVENT);
            this.mouseXY = [];
            this.deltaXY = [0,0];
            this.startXY = [];
            this.nodeXY = [];
            this.lastXY = [];
            this.actXY = [];
            this.realXY = [];
        },
        /**
        * Starts the drag operation
        * @method start
        * @return {Self}
        * @chainable
        */
        start: function() {
            if (!this.get('lock') && !this.get(DRAGGING)) {
                var node = this.get(NODE), ow, oh, xy;
                this._startTime = (new Date()).getTime();

                DDM._start();
                node.addClass(DDM.CSS_PREFIX + '-dragging');
                this.fire(EV_START, {
                    pageX: this.nodeXY[0],
                    pageY: this.nodeXY[1],
                    startTime: this._startTime
                });
                node = this.get(DRAG_NODE);
                xy = this.nodeXY;

                ow = node.get(OFFSET_WIDTH);
                oh = node.get(OFFSET_HEIGHT);

                if (this.get('startCentered')) {
                    this._setStartPosition([xy[0] + (ow / 2), xy[1] + (oh / 2)]);
                }


                this.region = {
                    '0': xy[0],
                    '1': xy[1],
                    area: 0,
                    top: xy[1],
                    right: xy[0] + ow,
                    bottom: xy[1] + oh,
                    left: xy[0]
                };
                this.set(DRAGGING, true);
            }
            return this;
        },
        /**
        * Ends the drag operation
        * @method end
        * @return {Self}
        * @chainable
        */
        end: function() {
            this._endTime = (new Date()).getTime();
            if (this._clickTimeout) {
                this._clickTimeout.cancel();
            }
            this._dragThreshMet = this._fromTimeout = false;

            if (!this.get('lock') && this.get(DRAGGING)) {
                this.fire(EV_END, {
                    pageX: this.lastXY[0],
                    pageY: this.lastXY[1],
                    startTime: this._startTime,
                    endTime: this._endTime
                });
            }
            this.get(NODE).removeClass(DDM.CSS_PREFIX + '-dragging');
            this.set(DRAGGING, false);
            this.deltaXY = [0, 0];

            return this;
        },
        /**
        * Handler for fixing the selection in IE
        * @private
        * @method _defEndFn
        */
        _defEndFn: function() {
            this._fixIEMouseUp();
            this._ev_md = null;
        },
        /**
        * Handler for preventing the drag:end event. It will reset the node back to it's start position
        * @private
        * @method _prevEndFn
        */
        _prevEndFn: function() {
            this._fixIEMouseUp();
            //Bug #1852577
            this.get(DRAG_NODE).setXY(this.nodeXY);
            this._ev_md = null;
            this.region = null;
        },
        /**
        * Calculates the offsets and set's the XY that the element will move to.
        * @private
        * @method _align
        * @param {Array} xy The xy coords to align with.
        */
        _align: function(xy) {
            this.fire(EV_ALIGN, {pageX: xy[0], pageY: xy[1] });
        },
        /**
        * Calculates the offsets and set's the XY that the element will move to.
        * @private
        * @method _defAlignFn
        * @param {EventFacade} e The drag:align event.
        */
        _defAlignFn: function(e) {
            this.actXY = [e.pageX - this.deltaXY[0], e.pageY - this.deltaXY[1]];
        },
        /**
        * This method performs the alignment before the element move.
        * @private
        * @method _alignNode
        * @param {Array} eXY The XY to move the element to, usually comes from the mousemove DOM event.
        */
        _alignNode: function(eXY, scroll) {
            this._align(eXY);
            if (!scroll) {
                this._moveNode();
            }
        },
        /**
        * This method performs the actual element move.
        * @private
        * @method _moveNode
        */
        _moveNode: function(scroll) {
            //if (!this.get(DRAGGING)) {
            //    return;
            //}
            var diffXY = [], diffXY2 = [], startXY = this.nodeXY, xy = this.actXY;

            diffXY[0] = (xy[0] - this.lastXY[0]);
            diffXY[1] = (xy[1] - this.lastXY[1]);

            diffXY2[0] = (xy[0] - this.nodeXY[0]);
            diffXY2[1] = (xy[1] - this.nodeXY[1]);


            this.region = {
                '0': xy[0],
                '1': xy[1],
                area: 0,
                top: xy[1],
                right: xy[0] + this.get(DRAG_NODE).get(OFFSET_WIDTH),
                bottom: xy[1] + this.get(DRAG_NODE).get(OFFSET_HEIGHT),
                left: xy[0]
            };

            this.fire(EV_DRAG, {
                pageX: xy[0],
                pageY: xy[1],
                scroll: scroll,
                info: {
                    start: startXY,
                    xy: xy,
                    delta: diffXY,
                    offset: diffXY2
                }
            });

            this.lastXY = xy;
        },
        /**
        * Default function for drag:drag. Fired from _moveNode.
        * @private
        * @method _defDragFn
        * @param {EventFacade} ev The drag:drag event
        */
        _defDragFn: function(e) {
            if (this.get('move')) {
                if (e.scroll && e.scroll.node) {
                    var domNode = e.scroll.node.getDOMNode();
                    //If it's the window
                    if (domNode === Y.config.win) {
                        domNode.scrollTo(e.scroll.left, e.scroll.top);
                    } else {
                        e.scroll.node.set('scrollTop', e.scroll.top);
                        e.scroll.node.set('scrollLeft', e.scroll.left);
                    }
                }
                this.get(DRAG_NODE).setXY([e.pageX, e.pageY]);
                this.realXY = [e.pageX, e.pageY];
            }
        },
        /**
        * Fired from DragDropMgr (DDM) on mousemove.
        * @private
        * @method _move
        * @param {EventFacade} ev The mousemove DOM event
        */
        _move: function(ev) {
            if (this.get('lock')) {
                return false;
            }

            this.mouseXY = [ev.pageX, ev.pageY];
            if (!this._dragThreshMet) {
                var diffX = Math.abs(this.startXY[0] - ev.pageX),
                diffY = Math.abs(this.startXY[1] - ev.pageY);
                if (diffX > this.get('clickPixelThresh') || diffY > this.get('clickPixelThresh')) {
                    this._dragThreshMet = true;
                    this.start();
                    //This only happens on gestures to stop the page from scrolling
                    if (ev && ev.preventDefault) {
                        ev.preventDefault();
                    }
                    this._alignNode([ev.pageX, ev.pageY]);
                }
            } else {
                if (this._clickTimeout) {
                    this._clickTimeout.cancel();
                }
                this._alignNode([ev.pageX, ev.pageY]);
            }
        },
        /**
        * Method will forcefully stop a drag operation. For example calling this from inside an ESC keypress handler will stop this drag.
        * @method stopDrag
        * @return {Self}
        * @chainable
        */
        stopDrag: function() {
            if (this.get(DRAGGING)) {
                DDM._end();
            }
            return this;
        },
        /**
        * Lifecycle destructor, unreg the drag from the DDM and remove listeners
        * @private
        * @method destructor
        */
        destructor: function() {
            this._unprep();
            if (this.target) {
                this.target.destroy();
            }
            DDM._unregDrag(this);
        }
    });
    Y.namespace('DD');
    Y.DD.Drag = Drag;




}, '3.8.1', {"requires": ["dd-ddm-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-proxy', function (Y, NAME) {


    /**
     * Plugin for dd-drag for creating a proxy drag node, instead of dragging the original node.
     * @module dd
     * @submodule dd-proxy
     */
    /**
     * Plugin for dd-drag for creating a proxy drag node, instead of dragging the original node.
     * @class DDProxy
     * @extends Base
     * @constructor
     * @namespace Plugin
     */
    var DDM = Y.DD.DDM,
        NODE = 'node',
        DRAG_NODE = 'dragNode',
        HOST = 'host',
        TRUE = true, proto,
        P = function() {
            P.superclass.constructor.apply(this, arguments);
        };

    P.NAME = 'DDProxy';
    /**
    * The Proxy instance will be placed on the Drag instance under the proxy namespace.
    * @property NS
    * @default con
    * @readonly
    * @protected
    * @static
    * @type {String}
    */
    P.NS = 'proxy';

    P.ATTRS = {
        host: {
        },
        /**
        * Move the original node at the end of the drag. Default: true
        * @attribute moveOnEnd
        * @type Boolean
        */
        moveOnEnd: {
            value: TRUE
        },
        /**
        * Hide the drag node at the end of the drag. Default: true
        * @attribute hideOnEnd
        * @type Boolean
        */
        hideOnEnd: {
            value: TRUE
        },
        /**
        * Make the Proxy node assume the size of the original node. Default: true
        * @attribute resizeFrame
        * @type Boolean
        */
        resizeFrame: {
            value: TRUE
        },
        /**
        * Make the Proxy node appear in the same place as the original node. Default: true
        * @attribute positionProxy
        * @type Boolean
        */
        positionProxy: {
            value: TRUE
        },
        /**
        * The default border style for the border of the proxy. Default: 1px solid #808080
        * @attribute borderStyle
        * @type Boolean
        */
        borderStyle: {
            value: '1px solid #808080'
        },
        /**
        * Should the node be cloned into the proxy for you. Default: false
        * @attribute cloneNode
        * @type Boolean
        */
        cloneNode: {
            value: false
        }
    };

    proto = {
        /**
        * Holds the event handles for setting the proxy
        * @private
        * @property _hands
        */
        _hands: null,
        /**
        * Handler for the proxy config attribute
        * @private
        * @method _init
        */
        _init: function() {
            if (!DDM._proxy) {
                DDM._createFrame();
                Y.on('domready', Y.bind(this._init, this));
                return;
            }
            if (!this._hands) {
                this._hands = [];
            }
            var h, h1, host = this.get(HOST), dnode = host.get(DRAG_NODE);
            if (dnode.compareTo(host.get(NODE))) {
                if (DDM._proxy) {
                    host.set(DRAG_NODE, DDM._proxy);
                }
            }
            Y.Array.each(this._hands, function(v) {
                v.detach();
            });
            h = DDM.on('ddm:start', Y.bind(function() {
                if (DDM.activeDrag === host) {
                    DDM._setFrame(host);
                }
            }, this));
            h1 = DDM.on('ddm:end', Y.bind(function() {
                if (host.get('dragging')) {
                    if (this.get('moveOnEnd')) {
                        host.get(NODE).setXY(host.lastXY);
                    }
                    if (this.get('hideOnEnd')) {
                        host.get(DRAG_NODE).setStyle('display', 'none');
                    }
                    if (this.get('cloneNode')) {
                        host.get(DRAG_NODE).remove();
                        host.set(DRAG_NODE, DDM._proxy);
                    }
                }
            }, this));
            this._hands = [h, h1];
        },
        initializer: function() {
            this._init();
        },
        destructor: function() {
            var host = this.get(HOST);
            Y.Array.each(this._hands, function(v) {
                v.detach();
            });
            host.set(DRAG_NODE, host.get(NODE));
        },
        clone: function() {
            var host = this.get(HOST),
                n = host.get(NODE),
                c = n.cloneNode(true);

            delete c._yuid;
            c.setAttribute('id', Y.guid());
            c.setStyle('position', 'absolute');
            n.get('parentNode').appendChild(c);
            host.set(DRAG_NODE, c);
            return c;
        }
    };

    Y.namespace('Plugin');
    Y.extend(P, Y.Base, proto);
    Y.Plugin.DDProxy = P;

    //Add a couple of methods to the DDM
    Y.mix(DDM, {
        /**
        * Create the proxy element if it doesn't already exist and set the DD.DDM._proxy value
        * @private
        * @for DDM
        * @namespace DD
        * @method _createFrame
        */
        _createFrame: function() {
            if (!DDM._proxy) {
                DDM._proxy = TRUE;

                var p = Y.Node.create('<div></div>'),
                b = Y.one('body');

                p.setStyles({
                    position: 'absolute',
                    display: 'none',
                    zIndex: '999',
                    top: '-999px',
                    left: '-999px'
                });

                b.prepend(p);
                p.set('id', Y.guid());
                p.addClass(DDM.CSS_PREFIX + '-proxy');
                DDM._proxy = p;
            }
        },
        /**
        * If resizeProxy is set to true (default) it will resize the proxy element to match the size of the Drag Element.
        * If positionProxy is set to true (default) it will position the proxy element in the same location as the Drag Element.
        * @private
        * @for DDM
        * @namespace DD
        * @method _setFrame
        */
        _setFrame: function(drag) {
            var n = drag.get(NODE), d = drag.get(DRAG_NODE), ah, cur = 'auto';

            ah = DDM.activeDrag.get('activeHandle');
            if (ah) {
                cur = ah.getStyle('cursor');
            }
            if (cur === 'auto') {
                cur = DDM.get('dragCursor');
            }

            d.setStyles({
                visibility: 'hidden',
                display: 'block',
                cursor: cur,
                border: drag.proxy.get('borderStyle')
            });

            if (drag.proxy.get('cloneNode')) {
                d = drag.proxy.clone();
            }

            if (drag.proxy.get('resizeFrame')) {
                d.setStyles({
                    height: n.get('offsetHeight') + 'px',
                    width: n.get('offsetWidth') + 'px'
                });
            }

            if (drag.proxy.get('positionProxy')) {
                d.setXY(drag.nodeXY);
            }
            d.setStyle('visibility', 'visible');
        }
    });

    //Create the frame when DOM is ready
    //Y.on('domready', Y.bind(DDM._createFrame, DDM));




}, '3.8.1', {"requires": ["dd-drag"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-constrain', function (Y, NAME) {


    /**
     * The Drag & Drop Utility allows you to create a draggable interface efficiently,
     * buffering you from browser-level abnormalities and enabling you to focus on the interesting
     * logic surrounding your particular implementation. This component enables you to create a
     * variety of standard draggable objects with just a few lines of code and then,
     * using its extensive API, add your own specific implementation logic.
     * @module dd
     * @main dd
     * @submodule dd-constrain
     */
    /**
     * Plugin for the dd-drag module to add the constraining methods to it.
     * It supports constraining to a node or viewport. It supports tick based moves and XY axis constraints.
     * @class DDConstrained
     * @extends Base
     * @constructor
     * @namespace Plugin
     */

    var DRAG_NODE = 'dragNode',
        OFFSET_HEIGHT = 'offsetHeight',
        OFFSET_WIDTH = 'offsetWidth',
        HOST = 'host',
        TICK_X_ARRAY = 'tickXArray',
        TICK_Y_ARRAY = 'tickYArray',
        DDM = Y.DD.DDM,
        TOP = 'top',
        RIGHT = 'right',
        BOTTOM = 'bottom',
        LEFT = 'left',
        VIEW = 'view',
        proto = null,

        /**
        * Fires when this node is aligned with the tickX value.
        * @event drag:tickAlignX
        * @param {EventFacade} event An Event Facade object
        * @type {CustomEvent}
        */
        EV_TICK_ALIGN_X = 'drag:tickAlignX',

        /**
        * Fires when this node is aligned with the tickY value.
        * @event drag:tickAlignY
        * @param {EventFacade} event An Event Facade object
        * @type {CustomEvent}
        */
        EV_TICK_ALIGN_Y = 'drag:tickAlignY',

        C = function() {
            this._lazyAddAttrs = false;
            C.superclass.constructor.apply(this, arguments);
        };

    C.NAME = 'ddConstrained';
    /**
    * The Constrained instance will be placed on the Drag instance under the con namespace.
    * @property NS
    * @default con
    * @readonly
    * @protected
    * @static
    * @type {String}
    */
    C.NS = 'con';

    C.ATTRS = {
        host: {
        },
        /**
        * Stick the drag movement to the X-Axis. Default: false
        * @attribute stickX
        * @type Boolean
        */
        stickX: {
            value: false
        },
        /**
        * Stick the drag movement to the Y-Axis
        * @type Boolean
        * @attribute stickY
        */
        stickY: {
            value: false
        },
        /**
        * The X tick offset the drag node should snap to on each drag move. False for no ticks. Default: false
        * @type Number/false
        * @attribute tickX
        */
        tickX: {
            value: false
        },
        /**
        * The Y tick offset the drag node should snap to on each drag move. False for no ticks. Default: false
        * @type Number/false
        * @attribute tickY
        */
        tickY: {
            value: false
        },
        /**
        * An array of page coordinates to use as X ticks for drag movement.
        * @type Array
        * @attribute tickXArray
        */
        tickXArray: {
            value: false
        },
        /**
        * An array of page coordinates to use as Y ticks for drag movement.
        * @type Array
        * @attribute tickYArray
        */
        tickYArray: {
            value: false
        },
        /**
        * CSS style string for the gutter of a region (supports negative values): '5 0'
        * (sets top and bottom to 5px, left and right to 0px), '1 2 3 4' (top 1px, right 2px, bottom 3px, left 4px)
        * @attribute gutter
        * @type String
        */
        gutter: {
            value: '0',
            setter: function(gutter) {
                return Y.DD.DDM.cssSizestoObject(gutter);
            }
        },
        /**
        * Will attempt to constrain the drag node to the boundaries. Arguments:<br>
        * 'view': Contrain to Viewport<br>
        * '#selector_string': Constrain to this node<br>
        * '{Region Object}': An Object Literal containing a valid region (top, right, bottom, left) of page positions
        * @attribute constrain
        * @type {String/Object/Node}
        */
        constrain: {
            value: VIEW,
            setter: function(con) {
                var node = Y.one(con);
                if (node) {
                    con = node;
                }
                return con;
            }
        },
        /**
        * An Object Literal containing a valid region (top, right, bottom, left) of page positions to constrain the drag node to.
        * @deprecated
        * @attribute constrain2region
        * @type Object
        */
        constrain2region: {
            setter: function(r) {
                return this.set('constrain', r);
            }
        },
        /**
        * Will attempt to constrain the drag node to the boundaries of this node.
        * @deprecated
        * @attribute constrain2node
        * @type Object
        */
        constrain2node: {
            setter: function(n) {
                return this.set('constrain', Y.one(n));
            }
        },
        /**
        * Will attempt to constrain the drag node to the boundaries of the viewport region.
        * @deprecated
        * @attribute constrain2view
        * @type Object
        */
        constrain2view: {
            setter: function() {
                return this.set('constrain', VIEW);
            }
        },
        /**
        * Should the region be cached for performace. Default: true
        * @attribute cacheRegion
        * @type Boolean
        */
        cacheRegion: {
            value: true
        }
    };

    proto = {
        _lastTickXFired: null,
        _lastTickYFired: null,

        initializer: function() {
            this._createEvents();

            this._eventHandles = [
                this.get(HOST).on('drag:end', Y.bind(this._handleEnd, this)),
                this.get(HOST).on('drag:start', Y.bind(this._handleStart, this)),
                this.get(HOST).after('drag:align', Y.bind(this.align, this)),
                this.get(HOST).after('drag:drag', Y.bind(this.drag, this))
            ];
        },
        destructor: function() {
            Y.Array.each(
                this._eventHandles,
                function(handle) {
                    handle.detach();
                }
            );

            this._eventHandles.length = 0;
        },
        /**
        * This method creates all the events for this Event Target and publishes them so we get Event Bubbling.
        * @private
        * @method _createEvents
        */
        _createEvents: function() {
            var ev = [
                EV_TICK_ALIGN_X,
                EV_TICK_ALIGN_Y
            ];

            Y.Array.each(ev, function(v) {
                this.publish(v, {
                    type: v,
                    emitFacade: true,
                    bubbles: true,
                    queuable: false,
                    prefix: 'drag'
                });
            }, this);
        },
        /**
        * Fires on drag:end
        * @private
        * @method _handleEnd
        */
        _handleEnd: function() {
            this._lastTickYFired = null;
            this._lastTickXFired = null;
        },
        /**
        * Fires on drag:start and clears the _regionCache
        * @private
        * @method _handleStart
        */
        _handleStart: function() {
            this.resetCache();
        },
        /**
        * Store a cache of the region that we are constraining to
        * @private
        * @property _regionCache
        * @type Object
        */
        _regionCache: null,
        /**
        * Get's the region and caches it, called from window.resize and when the cache is null
        * @private
        * @method _cacheRegion
        */
        _cacheRegion: function() {
            this._regionCache = this.get('constrain').get('region');
        },
        /**
        * Reset the internal region cache.
        * @method resetCache
        */
        resetCache: function() {
            this._regionCache = null;
        },
        /**
        * Standardizes the 'constraint' attribute
        * @private
        * @method _getConstraint
        */
        _getConstraint: function() {
            var con = this.get('constrain'),
                g = this.get('gutter'),
                region;

            if (con) {
                if (con instanceof Y.Node) {
                    if (!this._regionCache) {
                        this._eventHandles.push(Y.on('resize', Y.bind(this._cacheRegion, this), Y.config.win));
                        this._cacheRegion();
                    }
                    region = Y.clone(this._regionCache);
                    if (!this.get('cacheRegion')) {
                        this.resetCache();
                    }
                } else if (Y.Lang.isObject(con)) {
                    region = Y.clone(con);
                }
            }
            if (!con || !region) {
                con = VIEW;
            }
            if (con === VIEW) {
                region = this.get(HOST).get(DRAG_NODE).get('viewportRegion');
            }

            Y.Object.each(g, function(i, n) {
                if ((n === RIGHT) || (n === BOTTOM)) {
                    region[n] -= i;
                } else {
                    region[n] += i;
                }
            });
            return region;
        },

        /**
        * Get the active region: viewport, node, custom region
        * @method getRegion
        * @param {Boolean} inc Include the node's height and width
        * @return {Object} The active region.
        */
        getRegion: function(inc) {
            var r = {}, oh = null, ow = null,
                host = this.get(HOST);

            r = this._getConstraint();

            if (inc) {
                oh = host.get(DRAG_NODE).get(OFFSET_HEIGHT);
                ow = host.get(DRAG_NODE).get(OFFSET_WIDTH);
                r[RIGHT] = r[RIGHT] - ow;
                r[BOTTOM] = r[BOTTOM] - oh;
            }
            return r;
        },
        /**
        * Check if xy is inside a given region, if not change to it be inside.
        * @private
        * @method _checkRegion
        * @param {Array} _xy The XY to check if it's in the current region, if it isn't
        * inside the region, it will reset the xy array to be inside the region.
        * @return {Array} The new XY that is inside the region
        */
        _checkRegion: function(_xy) {
            var oxy = _xy,
                r = this.getRegion(),
                host = this.get(HOST),
                oh = host.get(DRAG_NODE).get(OFFSET_HEIGHT),
                ow = host.get(DRAG_NODE).get(OFFSET_WIDTH);

                if (oxy[1] > (r[BOTTOM] - oh)) {
                    _xy[1] = (r[BOTTOM] - oh);
                }
                if (r[TOP] > oxy[1]) {
                    _xy[1] = r[TOP];

                }
                if (oxy[0] > (r[RIGHT] - ow)) {
                    _xy[0] = (r[RIGHT] - ow);
                }
                if (r[LEFT] > oxy[0]) {
                    _xy[0] = r[LEFT];
                }

            return _xy;
        },
        /**
        * Checks if the XY passed or the dragNode is inside the active region.
        * @method inRegion
        * @param {Array} xy Optional XY to check, if not supplied this.get('dragNode').getXY() is used.
        * @return {Boolean} True if the XY is inside the region, false otherwise.
        */
        inRegion: function(xy) {
            xy = xy || this.get(HOST).get(DRAG_NODE).getXY();

            var _xy = this._checkRegion([xy[0], xy[1]]),
                inside = false;
                if ((xy[0] === _xy[0]) && (xy[1] === _xy[1])) {
                    inside = true;
                }
            return inside;
        },
        /**
        * Modifies the Drag.actXY method from the after drag:align event. This is where the constraining happens.
        * @method align
        */
        align: function() {
            var host = this.get(HOST),
                _xy = [host.actXY[0], host.actXY[1]],
                r = this.getRegion(true);

            if (this.get('stickX')) {
                _xy[1] = (host.startXY[1] - host.deltaXY[1]);
            }
            if (this.get('stickY')) {
                _xy[0] = (host.startXY[0] - host.deltaXY[0]);
            }

            if (r) {
                _xy = this._checkRegion(_xy);
            }

            _xy = this._checkTicks(_xy, r);

            host.actXY = _xy;
        },
        /**
        * Fires after drag:drag. Handle the tickX and tickX align events.
        * @method drag
        */
        drag: function() {
            var host = this.get(HOST),
                xt = this.get('tickX'),
                yt = this.get('tickY'),
                _xy = [host.actXY[0], host.actXY[1]];

            if ((Y.Lang.isNumber(xt) || this.get(TICK_X_ARRAY)) && (this._lastTickXFired !== _xy[0])) {
                this._tickAlignX();
                this._lastTickXFired = _xy[0];
            }

            if ((Y.Lang.isNumber(yt) || this.get(TICK_Y_ARRAY)) && (this._lastTickYFired !== _xy[1])) {
                this._tickAlignY();
                this._lastTickYFired = _xy[1];
            }
        },
        /**
        * This method delegates the proper helper method for tick calculations
        * @private
        * @method _checkTicks
        * @param {Array} xy The XY coords for the Drag
        * @param {Object} r The optional region that we are bound to.
        * @return {Array} The calced XY coords
        */
        _checkTicks: function(xy, r) {
            var host = this.get(HOST),
                lx = (host.startXY[0] - host.deltaXY[0]),
                ly = (host.startXY[1] - host.deltaXY[1]),
                xt = this.get('tickX'),
                yt = this.get('tickY');
                if (xt && !this.get(TICK_X_ARRAY)) {
                    xy[0] = DDM._calcTicks(xy[0], lx, xt, r[LEFT], r[RIGHT]);
                }
                if (yt && !this.get(TICK_Y_ARRAY)) {
                    xy[1] = DDM._calcTicks(xy[1], ly, yt, r[TOP], r[BOTTOM]);
                }
                if (this.get(TICK_X_ARRAY)) {
                    xy[0] = DDM._calcTickArray(xy[0], this.get(TICK_X_ARRAY), r[LEFT], r[RIGHT]);
                }
                if (this.get(TICK_Y_ARRAY)) {
                    xy[1] = DDM._calcTickArray(xy[1], this.get(TICK_Y_ARRAY), r[TOP], r[BOTTOM]);
                }

            return xy;
        },
        /**
        * Fires when the actXY[0] reach a new value respecting the tickX gap.
        * @private
        * @method _tickAlignX
        */
        _tickAlignX: function() {
            this.fire(EV_TICK_ALIGN_X);
        },
        /**
        * Fires when the actXY[1] reach a new value respecting the tickY gap.
        * @private
        * @method _tickAlignY
        */
        _tickAlignY: function() {
            this.fire(EV_TICK_ALIGN_Y);
        }
    };

    Y.namespace('Plugin');
    Y.extend(C, Y.Base, proto);
    Y.Plugin.DDConstrained = C;

    Y.mix(DDM, {
        /**
        * Helper method to calculate the tick offsets for a given position
        * @for DDM
        * @namespace DD
        * @private
        * @method _calcTicks
        * @param {Number} pos The current X or Y position
        * @param {Number} start The start X or Y position
        * @param {Number} tick The X or Y tick increment
        * @param {Number} off1 The min offset that we can't pass (region)
        * @param {Number} off2 The max offset that we can't pass (region)
        * @return {Number} The new position based on the tick calculation
        */
        _calcTicks: function(pos, start, tick, off1, off2) {
            var ix = ((pos - start) / tick),
                min = Math.floor(ix),
                max = Math.ceil(ix);
                if ((min !== 0) || (max !== 0)) {
                    if ((ix >= min) && (ix <= max)) {
                        pos = (start + (tick * min));
                        if (off1 && off2) {
                            if (pos < off1) {
                                pos = (start + (tick * (min + 1)));
                            }
                            if (pos > off2) {
                                pos = (start + (tick * (min - 1)));
                            }
                        }
                    }
                }
                return pos;
        },
        /**
        * This method is used with the tickXArray and tickYArray config options
        * @for DDM
        * @namespace DD
        * @private
        * @method _calcTickArray
        * @param {Number} pos The current X or Y position
        * @param {Number} ticks The array containing our custom tick positions.
        * @param {Number} off1 The min offset that we can't pass (region)
        * @param {Number} off2 The max offset that we can't pass (region)
        * @return The tick position
        */
        _calcTickArray: function(pos, ticks, off1, off2) {
            var i = 0, len = ticks.length, next = 0,
                diff1, diff2, ret;

            if (!ticks || (ticks.length === 0)) {
                return pos;
            }
            if (ticks[0] >= pos) {
                return ticks[0];
            }

            for (i = 0; i < len; i++) {
                next = (i + 1);
                if (ticks[next] && ticks[next] >= pos) {
                    diff1 = pos - ticks[i];
                    diff2 = ticks[next] - pos;
                    ret = (diff2 > diff1) ? ticks[i] : ticks[next];
                    if (off1 && off2) {
                        if (ret > off2) {
                            if (ticks[i]) {
                                ret = ticks[i];
                            } else {
                                ret = ticks[len - 1];
                            }
                        }
                    }
                    return ret;
                }

            }
            return ticks[ticks.length - 1];
        }
    });



}, '3.8.1', {"requires": ["dd-drag"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-drop', function (Y, NAME) {


    /**
     * Provides the ability to create a Drop Target.
     * @module dd
     * @submodule dd-drop
     */
    /**
     * Provides the ability to create a Drop Target.
     * @class Drop
     * @extends Base
     * @constructor
     * @namespace DD
     */

    var NODE = 'node',
        DDM = Y.DD.DDM,
        OFFSET_HEIGHT = 'offsetHeight',
        OFFSET_WIDTH = 'offsetWidth',
        /**
        * Fires when a drag element is over this target.
        * @event drop:over
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The drop object at the time of the event.</dd>
        * <dt>drag</dt><dd>The drag object at the time of the event.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_DROP_OVER = 'drop:over',
        /**
        * Fires when a drag element enters this target.
        * @event drop:enter
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The drop object at the time of the event.</dd>
        * <dt>drag</dt><dd>The drag object at the time of the event.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_DROP_ENTER = 'drop:enter',
        /**
        * Fires when a drag element exits this target.
        * @event drop:exit
        * @param {EventFacade} event An Event Facade object
        * @bubbles DDM
        * @type {CustomEvent}
        */
        EV_DROP_EXIT = 'drop:exit',

        /**
        * Fires when a draggable node is dropped on this Drop Target. (Fired from dd-ddm-drop)
        * @event drop:hit
        * @param {EventFacade} event An Event Facade object with the following specific property added:
        * <dl>
        * <dt>drop</dt><dd>The best guess on what was dropped on.</dd>
        * <dt>drag</dt><dd>The drag object at the time of the event.</dd>
        * <dt>others</dt><dd>An array of all the other drop targets that was dropped on.</dd>
        * </dl>
        * @bubbles DDM
        * @type {CustomEvent}
        */


    Drop = function() {
        this._lazyAddAttrs = false;
        Drop.superclass.constructor.apply(this, arguments);


        //DD init speed up.
        Y.on('domready', Y.bind(function() {
            Y.later(100, this, this._createShim);
        }, this));
        DDM._regTarget(this);

        /* TODO
        if (Dom.getStyle(this.el, 'position') == 'fixed') {
            Event.on(window, 'scroll', function() {
                this.activateShim();
            }, this, true);
        }
        */
    };

    Drop.NAME = 'drop';

    Drop.ATTRS = {
        /**
        * Y.Node instanace to use as the element to make a Drop Target
        * @attribute node
        * @type Node
        */
        node: {
            setter: function(node) {
                var n = Y.one(node);
                if (!n) {
                    Y.error('DD.Drop: Invalid Node Given: ' + node);
                }
                return n;
            }
        },
        /**
        * Array of groups to add this drop into.
        * @attribute groups
        * @type Array
        */
        groups: {
            value: ['default'],
            getter: function() {
                if (!this._groups) {
                    this._groups = {};
                    return [];
                }

                return Y.Object.keys(this._groups);
            },
            setter: function(g) {
                this._groups = Y.Array.hash(g);
                return g;
            }
        },
        /**
        * CSS style padding to make the Drop Target bigger than the node.
        * @attribute padding
        * @type String
        */
        padding: {
            value: '0',
            setter: function(p) {
                return DDM.cssSizestoObject(p);
            }
        },
        /**
        * Set to lock this drop element.
        * @attribute lock
        * @type Boolean
        */
        lock: {
            value: false,
            setter: function(lock) {
                if (lock) {
                    this.get(NODE).addClass(DDM.CSS_PREFIX + '-drop-locked');
                } else {
                    this.get(NODE).removeClass(DDM.CSS_PREFIX + '-drop-locked');
                }
                return lock;
            }
        },
        /**
        * Controls the default bubble parent for this Drop instance. Default: Y.DD.DDM. Set to false to disable bubbling.
        * Use bubbleTargets in config.
        * @deprecated
        * @attribute bubbles
        * @type Object
        */
        bubbles: {
            setter: function(t) {
                this.addTarget(t);
                return t;
            }
        },
        /**
        * Use the Drop shim. Default: true
        * @deprecated
        * @attribute useShim
        * @type Boolean
        */
        useShim: {
            value: true,
            setter: function(v) {
                Y.DD.DDM._noShim = !v;
                return v;
            }
        }
    };

    Y.extend(Drop, Y.Base, {
        /**
        * The default bubbleTarget for this object. Default: Y.DD.DDM
        * @private
        * @property _bubbleTargets
        */
        _bubbleTargets: Y.DD.DDM,
        /**
        * Add this Drop instance to a group, this should be used for on-the-fly group additions.
        * @method addToGroup
        * @param {String} g The group to add this Drop Instance to.
        * @return {Self}
        * @chainable
        */
        addToGroup: function(g) {
            this._groups[g] = true;
            return this;
        },
        /**
        * Remove this Drop instance from a group, this should be used for on-the-fly group removals.
        * @method removeFromGroup
        * @param {String} g The group to remove this Drop Instance from.
        * @return {Self}
        * @chainable
        */
        removeFromGroup: function(g) {
            delete this._groups[g];
            return this;
        },
        /**
        * This method creates all the events for this Event Target and publishes them so we get Event Bubbling.
        * @private
        * @method _createEvents
        */
        _createEvents: function() {

            var ev = [
                EV_DROP_OVER,
                EV_DROP_ENTER,
                EV_DROP_EXIT,
                'drop:hit'
            ];

            Y.Array.each(ev, function(v) {
                this.publish(v, {
                    type: v,
                    emitFacade: true,
                    preventable: false,
                    bubbles: true,
                    queuable: false,
                    prefix: 'drop'
                });
            }, this);
        },
        /**
        * Flag for determining if the target is valid in this operation.
        * @private
        * @property _valid
        * @type Boolean
        */
        _valid: null,
        /**
        * The groups this target belongs to.
        * @private
        * @property _groups
        * @type Array
        */
        _groups: null,
        /**
        * Node reference to the targets shim
        * @property shim
        * @type {Object}
        */
        shim: null,
        /**
        * A region object associated with this target, used for checking regions while dragging.
        * @property region
        * @type Object
        */
        region: null,
        /**
        * This flag is tripped when a drag element is over this target.
        * @property overTarget
        * @type Boolean
        */
        overTarget: null,
        /**
        * Check if this target is in one of the supplied groups.
        * @method inGroup
        * @param {Array} groups The groups to check against
        * @return Boolean
        */
        inGroup: function(groups) {
            this._valid = false;
            var ret = false;
            Y.Array.each(groups, function(v) {
                if (this._groups[v]) {
                    ret = true;
                    this._valid = true;
                }
            }, this);
            return ret;
        },
        /**
        * Private lifecycle method
        * @private
        * @method initializer
        */
        initializer: function() {
            Y.later(100, this, this._createEvents);

            var node = this.get(NODE), id;
            if (!node.get('id')) {
                id = Y.stamp(node);
                node.set('id', id);
            }
            node.addClass(DDM.CSS_PREFIX + '-drop');
            //Shouldn't have to do this..
            this.set('groups', this.get('groups'));
        },
        /**
        * Lifecycle destructor, unreg the drag from the DDM and remove listeners
        * @private
        * @method destructor
        */
        destructor: function() {
            DDM._unregTarget(this);
            if (this.shim && (this.shim !== this.get(NODE))) {
                this.shim.detachAll();
                this.shim.remove();
                this.shim = null;
            }
            this.get(NODE).removeClass(DDM.CSS_PREFIX + '-drop');
            this.detachAll();
        },
        /**
        * Removes classes from the target, resets some flags and sets the shims deactive position [-999, -999]
        * @private
        * @method _deactivateShim
        */
        _deactivateShim: function() {
            if (!this.shim) {
                return false;
            }
            this.get(NODE).removeClass(DDM.CSS_PREFIX + '-drop-active-valid');
            this.get(NODE).removeClass(DDM.CSS_PREFIX + '-drop-active-invalid');
            this.get(NODE).removeClass(DDM.CSS_PREFIX + '-drop-over');

            if (this.get('useShim')) {
                this.shim.setStyles({
                    top: '-999px',
                    left: '-999px',
                    zIndex: '1'
                });
            }
            this.overTarget = false;
        },
        /**
        * Activates the shim and adds some interaction CSS classes
        * @private
        * @method _activateShim
        */
        _activateShim: function() {
            if (!DDM.activeDrag) {
                return false; //Nothing is dragging, no reason to activate.
            }
            if (this.get(NODE) === DDM.activeDrag.get(NODE)) {
                return false;
            }
            if (this.get('lock')) {
                return false;
            }
            var node = this.get(NODE);
            //TODO Visibility Check..
            //if (this.inGroup(DDM.activeDrag.get('groups')) && this.get(NODE).isVisible()) {
            if (this.inGroup(DDM.activeDrag.get('groups'))) {
                node.removeClass(DDM.CSS_PREFIX + '-drop-active-invalid');
                node.addClass(DDM.CSS_PREFIX + '-drop-active-valid');
                DDM._addValid(this);
                this.overTarget = false;
                if (!this.get('useShim')) {
                    this.shim = this.get(NODE);
                }
                this.sizeShim();
            } else {
                DDM._removeValid(this);
                node.removeClass(DDM.CSS_PREFIX + '-drop-active-valid');
                node.addClass(DDM.CSS_PREFIX + '-drop-active-invalid');
            }
        },
        /**
        * Positions and sizes the shim with the raw data from the node,
        * this can be used to programatically adjust the Targets shim for Animation..
        * @method sizeShim
        */
        sizeShim: function() {
            if (!DDM.activeDrag) {
                return false; //Nothing is dragging, no reason to activate.
            }
            if (this.get(NODE) === DDM.activeDrag.get(NODE)) {
                return false;
            }
            //if (this.get('lock') || !this.get('useShim')) {
            if (this.get('lock')) {
                return false;
            }
            if (!this.shim) {
                Y.later(100, this, this.sizeShim);
                return false;
            }
            var node = this.get(NODE),
                nh = node.get(OFFSET_HEIGHT),
                nw = node.get(OFFSET_WIDTH),
                xy = node.getXY(),
                p = this.get('padding'),
                dd, dH, dW;


            //Apply padding
            nw = nw + p.left + p.right;
            nh = nh + p.top + p.bottom;
            xy[0] = xy[0] - p.left;
            xy[1] = xy[1] - p.top;


            if (DDM.activeDrag.get('dragMode') === DDM.INTERSECT) {
                //Intersect Mode, make the shim bigger
                dd = DDM.activeDrag;
                dH = dd.get(NODE).get(OFFSET_HEIGHT);
                dW = dd.get(NODE).get(OFFSET_WIDTH);

                nh = (nh + dH);
                nw = (nw + dW);
                xy[0] = xy[0] - (dW - dd.deltaXY[0]);
                xy[1] = xy[1] - (dH - dd.deltaXY[1]);

            }

            if (this.get('useShim')) {
                //Set the style on the shim
                this.shim.setStyles({
                    height: nh + 'px',
                    width: nw + 'px',
                    top: xy[1] + 'px',
                    left: xy[0] + 'px'
                });
            }

            //Create the region to be used by intersect when a drag node is over us.
            this.region = {
                '0': xy[0],
                '1': xy[1],
                area: 0,
                top: xy[1],
                right: xy[0] + nw,
                bottom: xy[1] + nh,
                left: xy[0]
            };
        },
        /**
        * Creates the Target shim and adds it to the DDM's playground..
        * @private
        * @method _createShim
        */
        _createShim: function() {
            //No playground, defer
            if (!DDM._pg) {
                Y.later(10, this, this._createShim);
                return;
            }
            //Shim already here, cancel
            if (this.shim) {
                return;
            }
            var s = this.get('node');

            if (this.get('useShim')) {
                s = Y.Node.create('<div id="' + this.get(NODE).get('id') + '_shim"></div>');
                s.setStyles({
                    height: this.get(NODE).get(OFFSET_HEIGHT) + 'px',
                    width: this.get(NODE).get(OFFSET_WIDTH) + 'px',
                    backgroundColor: 'yellow',
                    opacity: '.5',
                    zIndex: '1',
                    overflow: 'hidden',
                    top: '-900px',
                    left: '-900px',
                    position:  'absolute'
                });

                DDM._pg.appendChild(s);

                s.on('mouseover', Y.bind(this._handleOverEvent, this));
                s.on('mouseout', Y.bind(this._handleOutEvent, this));
            }


            this.shim = s;
        },
        /**
        * This handles the over target call made from this object or from the DDM
        * @private
        * @method _handleOverTarget
        */
        _handleTargetOver: function() {
            if (DDM.isOverTarget(this)) {
                this.get(NODE).addClass(DDM.CSS_PREFIX + '-drop-over');
                DDM.activeDrop = this;
                DDM.otherDrops[this] = this;
                if (this.overTarget) {
                    DDM.activeDrag.fire('drag:over', { drop: this, drag: DDM.activeDrag });
                    this.fire(EV_DROP_OVER, { drop: this, drag: DDM.activeDrag });
                } else {
                    //Prevent an enter before a start..
                    if (DDM.activeDrag.get('dragging')) {
                        this.overTarget = true;
                        this.fire(EV_DROP_ENTER, { drop: this, drag: DDM.activeDrag });
                        DDM.activeDrag.fire('drag:enter', { drop: this, drag: DDM.activeDrag });
                        DDM.activeDrag.get(NODE).addClass(DDM.CSS_PREFIX + '-drag-over');
                        //TODO - Is this needed??
                        //DDM._handleTargetOver();
                    }
                }
            } else {
                this._handleOut();
            }
        },
        /**
        * Handles the mouseover DOM event on the Target Shim
        * @private
        * @method _handleOverEvent
        */
        _handleOverEvent: function() {
            this.shim.setStyle('zIndex', '999');
            DDM._addActiveShim(this);
        },
        /**
        * Handles the mouseout DOM event on the Target Shim
        * @private
        * @method _handleOutEvent
        */
        _handleOutEvent: function() {
            this.shim.setStyle('zIndex', '1');
            DDM._removeActiveShim(this);
        },
        /**
        * Handles out of target calls/checks
        * @private
        * @method _handleOut
        */
        _handleOut: function(force) {
            if (!DDM.isOverTarget(this) || force) {
                if (this.overTarget) {
                    this.overTarget = false;
                    if (!force) {
                        DDM._removeActiveShim(this);
                    }
                    if (DDM.activeDrag) {
                        this.get(NODE).removeClass(DDM.CSS_PREFIX + '-drop-over');
                        DDM.activeDrag.get(NODE).removeClass(DDM.CSS_PREFIX + '-drag-over');
                        this.fire(EV_DROP_EXIT, { drop: this, drag: DDM.activeDrag });
                        DDM.activeDrag.fire('drag:exit', { drop: this, drag: DDM.activeDrag });
                        delete DDM.otherDrops[this];
                    }
                }
            }
        }
    });

    Y.DD.Drop = Drop;




}, '3.8.1', {"requires": ["dd-drag", "dd-ddm-drop"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-scroll', function (Y, NAME) {


    /**
     * Base scroller class used to create the Plugin.DDNodeScroll and Plugin.DDWinScroll.
     * This class should not be called on it's own, it's designed to be a plugin.
     * @module dd
     * @submodule dd-scroll
     */
    /**
     * Base scroller class used to create the Plugin.DDNodeScroll and Plugin.DDWinScroll.
     * This class should not be called on it's own, it's designed to be a plugin.
     * @class Scroll
     * @extends Base
     * @namespace DD
     * @constructor
     */

    var S = function() {
        S.superclass.constructor.apply(this, arguments);

    },
    WS, NS,
    HOST = 'host',
    BUFFER = 'buffer',
    PARENT_SCROLL = 'parentScroll',
    WINDOW_SCROLL = 'windowScroll',
    SCROLL_TOP = 'scrollTop',
    SCROLL_LEFT = 'scrollLeft',
    OFFSET_WIDTH = 'offsetWidth',
    OFFSET_HEIGHT = 'offsetHeight';


    S.ATTRS = {
        /**
        * Internal config option to hold the node that we are scrolling. Should not be set by the developer.
        * @attribute parentScroll
        * @type Node
        */
        parentScroll: {
            value: false,
            setter: function(node) {
                if (node) {
                    return node;
                }
                return false;
            }
        },
        /**
        * The number of pixels from the edge of the screen to turn on scrolling. Default: 30
        * @attribute buffer
        * @type Number
        */
        buffer: {
            value: 30,
            validator: Y.Lang.isNumber
        },
        /**
        * The number of milliseconds delay to pass to the auto scroller. Default: 235
        * @attribute scrollDelay
        * @type Number
        */
        scrollDelay: {
            value: 235,
            validator: Y.Lang.isNumber
        },
        /**
        * The host we are plugged into.
        * @attribute host
        * @type Object
        */
        host: {
            value: null
        },
        /**
        * Turn on window scroll support, default: false
        * @attribute windowScroll
        * @type Boolean
        */
        windowScroll: {
            value: false,
            validator: Y.Lang.isBoolean
        },
        /**
        * Allow vertical scrolling, default: true.
        * @attribute vertical
        * @type Boolean
        */
        vertical: {
            value: true,
            validator: Y.Lang.isBoolean
        },
        /**
        * Allow horizontal scrolling, default: true.
        * @attribute horizontal
        * @type Boolean
        */
        horizontal: {
            value: true,
            validator: Y.Lang.isBoolean
        }
    };

    Y.extend(S, Y.Base, {
        /**
        * Tells if we are actively scrolling or not.
        * @private
        * @property _scrolling
        * @type Boolean
        */
        _scrolling: null,
        /**
        * Cache of the Viewport dims.
        * @private
        * @property _vpRegionCache
        * @type Object
        */
        _vpRegionCache: null,
        /**
        * Cache of the dragNode dims.
        * @private
        * @property _dimCache
        * @type Object
        */
        _dimCache: null,
        /**
        * Holder for the Timer object returned from Y.later.
        * @private
        * @property _scrollTimer
        * @type {Y.later}
        */
        _scrollTimer: null,
        /**
        * Sets the _vpRegionCache property with an Object containing the dims from the viewport.
        * @private
        * @method _getVPRegion
        */
        _getVPRegion: function() {
            var r = {},
                n = this.get(PARENT_SCROLL),
            b = this.get(BUFFER),
            ws = this.get(WINDOW_SCROLL),
            xy = ((ws) ? [] : n.getXY()),
            w = ((ws) ? 'winWidth' : OFFSET_WIDTH),
            h = ((ws) ? 'winHeight' : OFFSET_HEIGHT),
            t = ((ws) ? n.get(SCROLL_TOP) : xy[1]),
            l = ((ws) ? n.get(SCROLL_LEFT) : xy[0]);

            r = {
                top: t + b,
                right: (n.get(w) + l) - b,
                bottom: (n.get(h) + t) - b,
                left: l + b
            };
            this._vpRegionCache = r;
            return r;
        },
        initializer: function() {
            var h = this.get(HOST);
            h.after('drag:start', Y.bind(this.start, this));
            h.after('drag:end', Y.bind(this.end, this));
            h.on('drag:align', Y.bind(this.align, this));

            //TODO - This doesn't work yet??
            Y.one('win').on('scroll', Y.bind(function() {
                this._vpRegionCache = null;
            }, this));
        },
        /**
        * Check to see if we need to fire the scroll timer. If scroll timer is running this will scroll the window.
        * @private
        * @method _checkWinScroll
        * @param {Boolean} move Should we move the window. From Y.later
        */
        _checkWinScroll: function(move) {
            var r = this._getVPRegion(),
                ho = this.get(HOST),
                ws = this.get(WINDOW_SCROLL),
                xy = ho.lastXY,
                scroll = false,
                b = this.get(BUFFER),
                win = this.get(PARENT_SCROLL),
                sTop = win.get(SCROLL_TOP),
                sLeft = win.get(SCROLL_LEFT),
                w = this._dimCache.w,
                h = this._dimCache.h,
                bottom = xy[1] + h,
                top = xy[1],
                right = xy[0] + w,
                left = xy[0],
                nt = top,
                nl = left,
                st = sTop,
                sl = sLeft;

            if (this.get('horizontal')) {
                if (left <= r.left) {
                    scroll = true;
                    nl = xy[0] - ((ws) ? b : 0);
                    sl = sLeft - b;
                }
                if (right >= r.right) {
                    scroll = true;
                    nl = xy[0] + ((ws) ? b : 0);
                    sl = sLeft + b;
                }
            }
            if (this.get('vertical')) {
                if (bottom >= r.bottom) {
                    scroll = true;
                    nt = xy[1] + ((ws) ? b : 0);
                    st = sTop + b;

                }
                if (top <= r.top) {
                    scroll = true;
                    nt = xy[1] - ((ws) ? b : 0);
                    st = sTop - b;
                }
            }

            if (st < 0) {
                st = 0;
                nt = xy[1];
            }

            if (sl < 0) {
                sl = 0;
                nl = xy[0];
            }

            if (nt < 0) {
                nt = xy[1];
            }
            if (nl < 0) {
                nl = xy[0];
            }
            if (move) {
                ho.actXY = [nl, nt];
                ho._alignNode([nl, nt], true); //We are srolling..
                xy = ho.actXY;
                ho.actXY = [nl, nt];
                ho._moveNode({ node: win, top: st, left: sl});
                if (!st && !sl) {
                    this._cancelScroll();
                }
            } else {
                if (scroll) {
                    this._initScroll();
                } else {
                    this._cancelScroll();
                }
            }
        },
        /**
        * Cancel a previous scroll timer and init a new one.
        * @private
        * @method _initScroll
        */
        _initScroll: function() {
            this._cancelScroll();
            this._scrollTimer = Y.Lang.later(this.get('scrollDelay'), this, this._checkWinScroll, [true], true);

        },
        /**
        * Cancel a currently running scroll timer.
        * @private
        * @method _cancelScroll
        */
        _cancelScroll: function() {
            this._scrolling = false;
            if (this._scrollTimer) {
                this._scrollTimer.cancel();
                delete this._scrollTimer;
            }
        },
        /**
        * Called from the drag:align event to determine if we need to scroll.
        * @method align
        */
        align: function(e) {
            if (this._scrolling) {
                this._cancelScroll();
                e.preventDefault();
            }
            if (!this._scrolling) {
                this._checkWinScroll();
            }
        },
        /**
        * Set the cache of the dragNode dims.
        * @private
        * @method _setDimCache
        */
        _setDimCache: function() {
            var node = this.get(HOST).get('dragNode');
            this._dimCache = {
                h: node.get(OFFSET_HEIGHT),
                w: node.get(OFFSET_WIDTH)
            };
        },
        /**
        * Called from the drag:start event
        * @method start
        */
        start: function() {
            this._setDimCache();
        },
        /**
        * Called from the drag:end event
        * @method end
        */
        end: function() {
            this._dimCache = null;
            this._cancelScroll();
        }
    });

    Y.namespace('Plugin');


    /**
     * Extends the Scroll class to make the window scroll while dragging.
     * @class DDWindowScroll
     * @extends Scroll
     * @namespace Plugin
     * @constructor
     */
    WS = function() {
        WS.superclass.constructor.apply(this, arguments);
    };
    WS.ATTRS = Y.merge(S.ATTRS, {
        /**
        * Turn on window scroll support, default: true
        * @attribute windowScroll
        * @type Boolean
        */
        windowScroll: {
            value: true,
            setter: function(scroll) {
                if (scroll) {
                    this.set(PARENT_SCROLL, Y.one('win'));
                }
                return scroll;
            }
        }
    });
    Y.extend(WS, S, {
        //Shouldn't have to do this..
        initializer: function() {
            this.set('windowScroll', this.get('windowScroll'));
        }
    });
    /**
    * The Scroll instance will be placed on the Drag instance under the winscroll namespace.
    * @property NS
    * @default winscroll
    * @readonly
    * @protected
    * @static
    * @type {String}
    */
    WS.NAME = WS.NS = 'winscroll';
    Y.Plugin.DDWinScroll = WS;


    /**
     * Extends the Scroll class to make a parent node scroll while dragging.
     * @class DDNodeScroll
     * @extends Scroll
     * @namespace Plugin
     * @constructor
     */
    NS = function() {
        NS.superclass.constructor.apply(this, arguments);

    };
    NS.ATTRS = Y.merge(S.ATTRS, {
        /**
        * The node we want to scroll. Used to set the internal parentScroll attribute.
        * @attribute node
        * @type Node
        */
        node: {
            value: false,
            setter: function(node) {
                var n = Y.one(node);
                if (!n) {
                    if (node !== false) {
                        Y.error('DDNodeScroll: Invalid Node Given: ' + node);
                    }
                } else {
                    this.set(PARENT_SCROLL, n);
                }
                return n;
            }
        }
    });
    Y.extend(NS, S, {
        //Shouldn't have to do this..
        initializer: function() {
            this.set('node', this.get('node'));
        }
    });
    /**
    * The NodeScroll instance will be placed on the Drag instance under the nodescroll namespace.
    * @property NS
    * @default nodescroll
    * @readonly
    * @protected
    * @static
    * @type {String}
    */
    NS.NAME = NS.NS = 'nodescroll';
    Y.Plugin.DDNodeScroll = NS;

    Y.DD.Scroll = S;




}, '3.8.1', {"requires": ["dd-drag"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-drop-plugin', function (Y, NAME) {


       /**
        * Simple Drop plugin that can be attached to a Node via the plug method.
        * @module dd
        * @submodule dd-drop-plugin
        */
       /**
        * Simple Drop plugin that can be attached to a Node via the plug method.
        * @class Drop
        * @extends DD.Drop
        * @constructor
        * @namespace Plugin
        */


        var Drop = function(config) {
            config.node = config.host;
            Drop.superclass.constructor.apply(this, arguments);
        };

        /**
        * dd-drop-plugin
        * @property NAME
        * @type {String}
        */
        Drop.NAME = "dd-drop-plugin";
        /**
        * The Drop instance will be placed on the Node instance under the drop namespace. It can be accessed via Node.drop;
        * @property NS
        * @type {String}
        */
        Drop.NS = "drop";


        Y.extend(Drop, Y.DD.Drop);
        Y.namespace('Plugin');
        Y.Plugin.Drop = Drop;




}, '3.8.1', {"requires": ["dd-drop"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-delegate', function (Y, NAME) {


    /**
     * Provides the ability to drag multiple nodes under a container element using only one Y.DD.Drag instance as a delegate.
     * @module dd
     * @submodule dd-delegate
     */
    /**
     * Provides the ability to drag multiple nodes under a container element using only one Y.DD.Drag instance as a delegate.
     * @class Delegate
     * @extends Base
     * @constructor
     * @namespace DD
     */


    var Delegate = function() {
        Delegate.superclass.constructor.apply(this, arguments);
    },
    CONT = 'container',
    NODES = 'nodes',
    _tmpNode = Y.Node.create('<div>Temp Node</div>');


    Y.extend(Delegate, Y.Base, {
        /**
        * The default bubbleTarget for this object. Default: Y.DD.DDM
        * @private
        * @property _bubbleTargets
        */
        _bubbleTargets: Y.DD.DDM,
        /**
        * A reference to the temporary dd instance used under the hood.
        * @property dd
        */
        dd: null,
        /**
        * The state of the Y.DD.DDM._noShim property to it can be reset.
        * @property _shimState
        * @private
        */
        _shimState: null,
        /**
        * Array of event handles to be destroyed
        * @private
        * @property _handles
        */
        _handles: null,
        /**
        * Listens to the nodeChange event and sets the dragNode on the temp dd instance.
        * @private
        * @method _onNodeChange
        * @param {Event} e The Event.
        */
        _onNodeChange: function(e) {
            this.set('dragNode', e.newVal);
        },
        /**
        * Listens for the drag:end event and updates the temp dd instance.
        * @private
        * @method _afterDragEnd
        * @param {Event} e The Event.
        */
        _afterDragEnd: function() {
            Y.DD.DDM._noShim = this._shimState;

            this.set('lastNode', this.dd.get('node'));
            this.get('lastNode').removeClass(Y.DD.DDM.CSS_PREFIX + '-dragging');
            this.dd._unprep();
            this.dd.set('node', _tmpNode);
        },
        /**
        * The callback for the Y.DD.Delegate instance used
        * @private
        * @method _delMouseDown
        * @param {Event} e The MouseDown Event.
        */
        _delMouseDown: function(e) {
            var tar = e.currentTarget,
                dd = this.dd,
                dNode = tar,
                config = this.get('dragConfig');

            if (tar.test(this.get(NODES)) && !tar.test(this.get('invalid'))) {
                this._shimState = Y.DD.DDM._noShim;
                Y.DD.DDM._noShim = true;
                this.set('currentNode', tar);
                dd.set('node', tar);
                if (config && config.dragNode) {
                    dNode = config.dragNode;
                } else if (dd.proxy) {
                    dNode = Y.DD.DDM._proxy;
                }
                dd.set('dragNode', dNode);
                dd._prep();

                dd.fire('drag:mouseDown', { ev: e });
            }
        },
        /**
        * Sets the target shim state
        * @private
        * @method _onMouseEnter
        * @param {Event} e The MouseEnter Event
        */
        _onMouseEnter: function() {
            this._shimState = Y.DD.DDM._noShim;
            Y.DD.DDM._noShim = true;
        },
        /**
        * Resets the target shim state
        * @private
        * @method _onMouseLeave
        * @param {Event} e The MouseLeave Event
        */
        _onMouseLeave: function() {
            Y.DD.DDM._noShim = this._shimState;
        },
        initializer: function() {
            this._handles = [];
            //Create a tmp DD instance under the hood.
            //var conf = Y.clone(this.get('dragConfig') || {}),
            var conf = this.get('dragConfig') || {},
                cont = this.get(CONT);

            conf.node = _tmpNode.cloneNode(true);
            conf.bubbleTargets = this;

            if (this.get('handles')) {
                conf.handles = this.get('handles');
            }

            this.dd = new Y.DD.Drag(conf);

            //On end drag, detach the listeners
            this.dd.after('drag:end', Y.bind(this._afterDragEnd, this));
            this.dd.on('dragNodeChange', Y.bind(this._onNodeChange, this));
            this.dd.after('drag:mouseup', function() {
                this._unprep();
            });

            //Attach the delegate to the container
            this._handles.push(Y.delegate(Y.DD.Drag.START_EVENT, Y.bind(this._delMouseDown, this), cont, this.get(NODES)));

            this._handles.push(Y.on('mouseenter', Y.bind(this._onMouseEnter, this), cont));

            this._handles.push(Y.on('mouseleave', Y.bind(this._onMouseLeave, this), cont));

            Y.later(50, this, this.syncTargets);
            Y.DD.DDM.regDelegate(this);
        },
        /**
        * Applies the Y.Plugin.Drop to all nodes matching the cont + nodes selector query.
        * @method syncTargets
        * @return {Self}
        * @chainable
        */
        syncTargets: function() {
            if (!Y.Plugin.Drop || this.get('destroyed')) {
                return;
            }
            var items, groups, config;

            if (this.get('target')) {
                items = Y.one(this.get(CONT)).all(this.get(NODES));
                groups = this.dd.get('groups');
                config = this.get('dragConfig');

                if (config && config.groups) {
                    groups = config.groups;
                }

                items.each(function(i) {
                    this.createDrop(i, groups);
                }, this);
            }
            return this;
        },
        /**
        * Apply the Drop plugin to this node
        * @method createDrop
        * @param {Node} node The Node to apply the plugin to
        * @param {Array} groups The default groups to assign this target to.
        * @return Node
        */
        createDrop: function(node, groups) {
            var config = {
                useShim: false,
                bubbleTargets: this
            };

            if (!node.drop) {
                node.plug(Y.Plugin.Drop, config);
            }
            node.drop.set('groups', groups);
            return node;
        },
        destructor: function() {
            if (this.dd) {
                this.dd.destroy();
            }
            if (Y.Plugin.Drop) {
                var targets = Y.one(this.get(CONT)).all(this.get(NODES));
                targets.unplug(Y.Plugin.Drop);
            }
            Y.Array.each(this._handles, function(v) {
                v.detach();
            });
        }
    }, {
        NAME: 'delegate',
        ATTRS: {
            /**
            * A selector query to get the container to listen for mousedown events on. All "nodes" should be a child of this container.
            * @attribute container
            * @type String
            */
            container: {
                value: 'body'
            },
            /**
            * A selector query to get the children of the "container" to make draggable elements from.
            * @attribute nodes
            * @type String
            */
            nodes: {
                value: '.dd-draggable'
            },
            /**
            * A selector query to test a node to see if it's an invalid item.
            * @attribute invalid
            * @type String
            */
            invalid: {
                value: 'input, select, button, a, textarea'
            },
            /**
            * Y.Node instance of the last item dragged.
            * @attribute lastNode
            * @type Node
            */
            lastNode: {
                value: _tmpNode
            },
            /**
            * Y.Node instance of the dd node.
            * @attribute currentNode
            * @type Node
            */
            currentNode: {
                value: _tmpNode
            },
            /**
            * Y.Node instance of the dd dragNode.
            * @attribute dragNode
            * @type Node
            */
            dragNode: {
                value: _tmpNode
            },
            /**
            * Is the mouse currently over the container
            * @attribute over
            * @type Boolean
            */
            over: {
                value: false
            },
            /**
            * Should the items also be a drop target.
            * @attribute target
            * @type Boolean
            */
            target: {
                value: false
            },
            /**
            * The default config to be used when creating the DD instance.
            * @attribute dragConfig
            * @type Object
            */
            dragConfig: {
                value: null
            },
            /**
            * The handles config option added to the temp DD instance.
            * @attribute handles
            * @type Array
            */
            handles: {
                value: null
            }
        }
    });

    Y.mix(Y.DD.DDM, {
        /**
        * Holder for all Y.DD.Delegate instances
        * @private
        * @for DDM
        * @property _delegates
        * @type Array
        */
        _delegates: [],
        /**
        * Register a Delegate with the DDM
        * @for DDM
        * @method regDelegate
        */
        regDelegate: function(del) {
            this._delegates.push(del);
        },
        /**
        * Get a delegate instance from a container node
        * @for DDM
        * @method getDelegate
        * @return Y.DD.Delegate
        */
        getDelegate: function(node) {
            var del = null;
            node = Y.one(node);
            Y.Array.each(this._delegates, function(v) {
                if (node.test(v.get(CONT))) {
                    del = v;
                }
            }, this);
            return del;
        }
    });

    Y.namespace('DD');
    Y.DD.Delegate = Delegate;




}, '3.8.1', {"requires": ["dd-drag", "dd-drop-plugin", "event-mouseenter"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('dd-plugin', function (Y, NAME) {



       /**
        * Simple Drag plugin that can be attached to a Node or Widget via the plug method.
        * @module dd
        * @submodule dd-plugin
        */
       /**
        * Simple Drag plugin that can be attached to a Node or Widget via the plug method.
        * @class Drag
        * @extends DD.Drag
        * @constructor
        * @namespace Plugin
        */
        var Drag = function(config) {
                if (Y.Widget && config.host instanceof Y.Widget) {
                        config.node = config.host.get('boundingBox');
                        config.widget = config.host;
                } else {
                        config.node = config.host;
                        config.widget = false;
                }
                Drag.superclass.constructor.call(this, config);
        },

        EV_START = 'drag:start',
        EV_DRAG = 'drag:drag',
        EV_DRAG_END = 'drag:end';

        /**
        * dd-plugin
        * @property NAME
        * @type {String}
        */
        Drag.NAME = "dd-plugin";

        /**
        * The Drag instance will be placed on the Node instance under the dd namespace. It can be accessed via Node.dd;
        * @property NS
        * @type {String}
        */
        Drag.NS = "dd";

        Y.extend(Drag, Y.DD.Drag, {

                _widgetHandles: null,

                /**
                * refers to a Y.Widget if its the host, otherwise = false.
                *
                * @attribute _widget
                * @private
                */
                _widget: undefined,


                /**
                * refers to the [x,y] coordinate where the drag was stopped last
                *
                * @attribute _stoppedPosition
                * @private
                */
                _stoppedPosition: undefined,


                /**
                * Returns true if widget uses widgetPosition, otherwise returns false
                *
                * @method _usesWidgetPosition
                * @private
                */
                _usesWidgetPosition: function(widget) {
                        var r = false;
                        if (widget) {
                                r = (widget.hasImpl && widget.hasImpl(Y.WidgetPosition)) ? true : false;
                        }
                        return r;
                },
                /**
                * Attached to the `drag:start` event, it checks if this plugin needs
                * to attach or detach listeners for widgets. If `dd-proxy` is plugged
                * the default widget positioning should be ignored.
                * @method _checkEvents
                * @private
                */
                _checkEvents: function() {
                    if (this._widget) {
                        //It's a widget
                        if (this.proxy) {
                            //It's a proxy
                            if (this._widgetHandles.length > 0) {
                                //Remove Listeners
                                this._removeWidgetListeners();
                            }
                        } else {
                            if (this._widgetHandles.length === 0) {
                                this._attachWidgetListeners();
                            }
                        }
                    }
                },
                /**
                * Remove the attached widget listeners
                * @method _removeWidgetListeners
                * @private
                */
                _removeWidgetListeners: function() {
                    Y.Array.each(this._widgetHandles, function(handle) {
                        handle.detach();
                    });
                    this._widgetHandles = [];
                },
                /**
                * If this is a Widget, then attach the positioning listeners
                * @method _attachWidgetListeners
                * @private
                */
                _attachWidgetListeners: function() {
                        //if this thing is a widget, and it uses widgetposition...
                        if (this._usesWidgetPosition(this._widget)) {

                               //set the x,y on the widget's ATTRS
                               this._widgetHandles.push(this.on(EV_DRAG, this._setWidgetCoords));

                               //store the new position that the widget ends up on
                               this._widgetHandles.push(this.on(EV_DRAG_END, this._updateStopPosition));
                        }
                },
                /**
                * Sets up event listeners on drag events if interacting with a widget
                *
                * @method initializer
                * @protected
                */
                initializer: function(config) {

                        this._widgetHandles = [];

                        this._widget = config.widget;

                        this.on(EV_START, this._checkEvents); //Always run, don't check

                        this._attachWidgetListeners();

                },

                /**
                * Updates x,y or xy attributes on widget based on where the widget is dragged
                *
                * @method initializer
                * @param {EventFacade} e Event Facade
                * @private
                */
                _setWidgetCoords: function(e) {

                        //get the last position where the widget was, or get the starting point
                        var nodeXY = this._stoppedPosition || e.target.nodeXY,
                         realXY = e.target.realXY,

                         //amount moved = [(x2 - x1) , (y2 - y1)]
                         movedXY = [realXY[0] - nodeXY[0], realXY[1] - nodeXY[1]];

                         //if both have changed..
                         if (movedXY[0] !== 0 && movedXY[1] !== 0) {
                                 this._widget.set('xy', realXY);
                         }

                         //if only x is 0, set the Y
                         else if (movedXY[0] === 0) {
                                 this._widget.set('y',realXY[1]);
                         }

                         //otherwise, y is 0, so set X
                         else if (movedXY[1] === 0){
                                 this._widget.set('x', realXY[0]);
                         }
                },

                /**
                * Updates the last position where the widget was stopped.
                *
                * @method _updateStopPosition
                * @param {EventFacade} e Event Facade
                * @private
                */
                _updateStopPosition: function(e) {
                        this._stoppedPosition = e.target.realXY;
                }
        });

        Y.namespace('Plugin');
        Y.Plugin.Drag = Drag;





}, '3.8.1', {"optional": ["dd-constrain", "dd-proxy"], "requires": ["dd-drag"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('io-upload-iframe', function (Y, NAME) {

/**
Extends the IO  to enable file uploads, with HTML forms
using an iframe as the transport medium.
@module io
@submodule io-upload-iframe
@for IO
**/

var w = Y.config.win,
    d = Y.config.doc,
    _std = (d.documentMode && d.documentMode >= 8),
    _d = decodeURIComponent,
    _end = Y.IO.prototype.end;

/**
 * Creates the iframe transported used in file upload
 * transactions, and binds the response event handler.
 *
 * @method _cFrame
 * @private
 * @param {Object} o Transaction object generated by _create().
 * @param {Object} c Configuration object passed to YUI.io().
 * @param {Object} io
 */
function _cFrame(o, c, io) {
    var i = Y.Node.create('<iframe src="#" id="io_iframe' + o.id + '" name="io_iframe' + o.id + '" />');
        i._node.style.position = 'absolute';
        i._node.style.top = '-1000px';
        i._node.style.left = '-1000px';
        Y.one('body').appendChild(i);
    // Bind the onload handler to the iframe to detect the file upload response.
    Y.on("load", function() { io._uploadComplete(o, c); }, '#io_iframe' + o.id);
}

/**
 * Removes the iframe transport used in the file upload
 * transaction.
 *
 * @method _dFrame
 * @private
 * @param {Number} id The transaction ID used in the iframe's creation.
 */
function _dFrame(id) {
	Y.Event.purgeElement('#io_iframe' + id, false);
	Y.one('body').removeChild(Y.one('#io_iframe' + id));
}

Y.mix(Y.IO.prototype, {
   /**
    * Parses the POST data object and creates hidden form elements
    * for each key-value, and appends them to the HTML form object.
    * @method appendData
    * @private
    * @static
    * @param {Object} f HTML form object.
    * @param {String} s The key-value POST data.
    * @return {Array} o Array of created fields.
    */
    _addData: function(f, s) {
        // Serialize an object into a key-value string using
        // querystring-stringify-simple.
        if (Y.Lang.isObject(s)) {
            s = Y.QueryString.stringify(s);
        }

        var o = [],
            m = s.split('='),
            i, l;

        for (i = 0, l = m.length - 1; i < l; i++) {
            o[i] = d.createElement('input');
            o[i].type = 'hidden';
            o[i].name = _d(m[i].substring(m[i].lastIndexOf('&') + 1));
            o[i].value = (i + 1 === l) ? _d(m[i + 1]) : _d(m[i + 1].substring(0, (m[i + 1].lastIndexOf('&'))));
            f.appendChild(o[i]);
        }

        return o;
    },

   /**
    * Removes the custom fields created to pass additional POST
    * data, along with the HTML form fields.
    * @method _removeData
    * @private
    * @static
    * @param {Object} f HTML form object.
    * @param {Object} o HTML form fields created from configuration.data.
    */
    _removeData: function(f, o) {
        var i, l;

        for (i = 0, l = o.length; i < l; i++) {
            f.removeChild(o[i]);
        }
    },

   /**
    * Sets the appropriate attributes and values to the HTML
    * form, in preparation of a file upload transaction.
    * @method _setAttrs
    * @private
    * @static
    * @param {Object} f HTML form object.
    * @param {Object} id The Transaction ID.
    * @param {Object} uri Qualified path to transaction resource.
    */
    _setAttrs: function(f, id, uri) {
        f.setAttribute('action', uri);
        f.setAttribute('method', 'POST');
        f.setAttribute('target', 'io_iframe' + id );
        f.setAttribute(Y.UA.ie && !_std ? 'encoding' : 'enctype', 'multipart/form-data');
    },

   /**
    * Reset the HTML form attributes to their original values.
    * @method _resetAttrs
    * @private
    * @static
    * @param {Object} f HTML form object.
    * @param {Object} a Object of original attributes.
    */
    _resetAttrs: function(f, a) {
        Y.Object.each(a, function(v, p) {
            if (v) {
                f.setAttribute(p, v);
            }
            else {
                f.removeAttribute(p);
            }
        });
    },

   /**
    * Starts timeout count if the configuration object
    * has a defined timeout property.
    *
    * @method _startUploadTimeout
    * @private
    * @static
    * @param {Object} o Transaction object generated by _create().
    * @param {Object} c Configuration object passed to YUI.io().
    */
    _startUploadTimeout: function(o, c) {
        var io = this;

        io._timeout[o.id] = w.setTimeout(
            function() {
                o.status = 0;
                o.statusText = 'timeout';
                io.complete(o, c);
                io.end(o, c);
            }, c.timeout);
    },

   /**
    * Clears the timeout interval started by _startUploadTimeout().
    * @method _clearUploadTimeout
    * @private
    * @static
    * @param {Number} id - Transaction ID.
    */
    _clearUploadTimeout: function(id) {
        var io = this;

        w.clearTimeout(io._timeout[id]);
        delete io._timeout[id];
    },

   /**
    * Bound to the iframe's Load event and processes
    * the response data.
    * @method _uploadComplete
    * @private
    * @static
    * @param {Object} o The transaction object
    * @param {Object} c Configuration object for the transaction.
    */
    _uploadComplete: function(o, c) {
        var io = this,
            d = Y.one('#io_iframe' + o.id).get('contentWindow.document'),
            b = d.one('body'),
            p;

        if (c.timeout) {
            io._clearUploadTimeout(o.id);
        }

		try {
			if (b) {
				// When a response Content-Type of "text/plain" is used, Firefox and Safari
				// will wrap the response string with <pre></pre>.
				p = b.one('pre:first-child');
				o.c.responseText = p ? p.get('text') : b.get('text');
			}
			else {
				o.c.responseXML = d._node;
			}
		}
		catch (e) {
			o.e = "upload failure";
		}

        io.complete(o, c);
        io.end(o, c);
        // The transaction is complete, so call _dFrame to remove
        // the event listener bound to the iframe transport, and then
        // destroy the iframe.
        w.setTimeout( function() { _dFrame(o.id); }, 0);
    },

   /**
    * Uploads HTML form data, inclusive of files/attachments,
    * using the iframe created in _create to facilitate the transaction.
    * @method _upload
    * @private
    * @static
    * @param {Object} o The transaction object
    * @param {Object} uri Qualified path to transaction resource.
    * @param {Object} c Configuration object for the transaction.
    */
    _upload: function(o, uri, c) {
        var io = this,
            f = (typeof c.form.id === 'string') ? d.getElementById(c.form.id) : c.form.id,
            // Track original HTML form attribute values.
            attr = {
                action: f.getAttribute('action'),
                target: f.getAttribute('target')
            },
            fields;

        // Initialize the HTML form properties in case they are
        // not defined in the HTML form.
        io._setAttrs(f, o.id, uri);
        if (c.data) {
            fields = io._addData(f, c.data);
        }

        // Start polling if a callback is present and the timeout
        // property has been defined.
        if (c.timeout) {
            io._startUploadTimeout(o, c);
        }

        // Start file upload.
        f.submit();
        io.start(o, c);
        if (c.data) {
            io._removeData(f, fields);
        }

        return {
            id: o.id,
            abort: function() {
                o.status = 0;
                o.statusText = 'abort';
                if (Y.one('#io_iframe' + o.id)) {
                    _dFrame(o.id);
                    io.complete(o, c);
                    io.end(o, c, attr);
                }
                else {
                    return false;
                }
            },
            isInProgress: function() {
                return Y.one('#io_iframe' + o.id) ? true : false;
            },
            io: io
        };
    },

    upload: function(o, uri, c) {
        _cFrame(o, c, this);
        return this._upload(o, uri, c);
    },

    end: function(transaction, config, attr) {
        if (config && config.form && config.form.upload) {
            var io = this;
            // Restore HTML form attributes to their original values.
            io._resetAttrs(f, attr);
        }

        return _end.call(this, transaction, config);
    }
});


}, '3.8.1', {"requires": ["io-base", "node-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-key', function (Y, NAME) {

/**
 * Functionality to listen for one or more specific key combinations.
 * @module event
 * @submodule event-key
 */

var ALT      = "+alt",
    CTRL     = "+ctrl",
    META     = "+meta",
    SHIFT    = "+shift",

    trim     = Y.Lang.trim,

    eventDef = {
        KEY_MAP: {
            enter    : 13,
            esc      : 27,
            backspace: 8,
            tab      : 9,
            pageup   : 33,
            pagedown : 34
        },

        _typeRE: /^(up|down|press):/,
        _keysRE: /^(?:up|down|press):|\+(alt|ctrl|meta|shift)/g,

        processArgs: function (args) {
            var spec = args.splice(3,1)[0],
                mods = Y.Array.hash(spec.match(/\+(?:alt|ctrl|meta|shift)\b/g) || []),
                config = {
                    type: this._typeRE.test(spec) ? RegExp.$1 : null,
                    mods: mods,
                    keys: null
                },
                // strip type and modifiers from spec, leaving only keyCodes
                bits = spec.replace(this._keysRE, ''),
                chr, uc, lc, i;

            if (bits) {
                bits = bits.split(',');

                config.keys = {};

                // FIXME: need to support '65,esc' => keypress, keydown
                for (i = bits.length - 1; i >= 0; --i) {
                    chr = trim(bits[i]);

                    // catch sloppy filters, trailing commas, etc 'a,,'
                    if (!chr) {
                        continue;
                    }

                    // non-numerics are single characters or key names
                    if (+chr == chr) {
                        config.keys[chr] = mods;
                    } else {
                        lc = chr.toLowerCase();

                        if (this.KEY_MAP[lc]) {
                            config.keys[this.KEY_MAP[lc]] = mods;
                            // FIXME: '65,enter' defaults keydown for both
                            if (!config.type) {
                                config.type = "down"; // safest
                            }
                        } else {
                            // FIXME: Character mapping only works for keypress
                            // events. Otherwise, it uses String.fromCharCode()
                            // from the keyCode, which is wrong.
                            chr = chr.charAt(0);
                            uc  = chr.toUpperCase();

                            if (mods["+shift"]) {
                                chr = uc;
                            }

                            // FIXME: stupid assumption that
                            // the keycode of the lower case == the
                            // charCode of the upper case
                            // a (key:65,char:97), A (key:65,char:65)
                            config.keys[chr.charCodeAt(0)] =
                                (chr === uc) ?
                                    // upper case chars get +shift free
                                    Y.merge(mods, { "+shift": true }) :
                                    mods;
                        }
                    }
                }
            }

            if (!config.type) {
                config.type = "press";
            }

            return config;
        },

        on: function (node, sub, notifier, filter) {
            var spec   = sub._extra,
                type   = "key" + spec.type,
                keys   = spec.keys,
                method = (filter) ? "delegate" : "on";

            // Note: without specifying any keyCodes, this becomes a
            // horribly inefficient alias for 'keydown' (et al), but I
            // can't abort this subscription for a simple
            // Y.on('keypress', ...);
            // Please use keyCodes or just subscribe directly to keydown,
            // keyup, or keypress
            sub._detach = node[method](type, function (e) {
                var key = keys ? keys[e.which] : spec.mods;

                if (key &&
                    (!key[ALT]   || (key[ALT]   && e.altKey)) &&
                    (!key[CTRL]  || (key[CTRL]  && e.ctrlKey)) &&
                    (!key[META]  || (key[META]  && e.metaKey)) &&
                    (!key[SHIFT] || (key[SHIFT] && e.shiftKey)))
                {
                    notifier.fire(e);
                }
            }, filter);
        },

        detach: function (node, sub, notifier) {
            sub._detach.detach();
        }
    };

eventDef.delegate = eventDef.on;
eventDef.detachDelegate = eventDef.detach;

/**
 * <p>Add a key listener.  The listener will only be notified if the
 * keystroke detected meets the supplied specification.  The
 * specification is a string that is defined as:</p>
 * 
 * <dl>
 *   <dt>spec</dt>
 *   <dd><code>[{type}:]{code}[,{code}]*</code></dd>
 *   <dt>type</dt>
 *   <dd><code>"down", "up", or "press"</code></dd>
 *   <dt>code</dt>
 *   <dd><code>{keyCode|character|keyName}[+{modifier}]*</code></dd>
 *   <dt>modifier</dt>
 *   <dd><code>"shift", "ctrl", "alt", or "meta"</code></dd>
 *   <dt>keyName</dt>
 *   <dd><code>"enter", "backspace", "esc", "tab", "pageup", or "pagedown"</code></dd>
 * </dl>
 *
 * <p>Examples:</p>
 * <ul>
 *   <li><code>Y.on("key", callback, "press:12,65+shift+ctrl", "#my-input");</code></li>
 *   <li><code>Y.delegate("key", preventSubmit, "#forms", "enter", "input[type=text]");</code></li>
 *   <li><code>Y.one("doc").on("key", viNav, "j,k,l,;");</code></li>
 * </ul>
 *   
 * @event key
 * @for YUI
 * @param type {string} 'key'
 * @param fn {function} the function to execute
 * @param id {string|HTMLElement|collection} the element(s) to bind
 * @param spec {string} the keyCode and modifier specification
 * @param o optional context object
 * @param args 0..n additional arguments to provide to the listener.
 * @return {Event.Handle} the detach handle
 */
Y.Event.define('key', eventDef, true);


}, '3.8.1', {"requires": ["event-synthetic"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-outside', function (Y, NAME) {

/**
 * Outside events are synthetic DOM events that fire when a corresponding native
 * or synthetic DOM event occurs outside a bound element.
 *
 * The following outside events are pre-defined by this module:
 * <ul>
 *   <li>blur</li>
 *   <li>change</li>
 *   <li>click</li>
 *   <li>dblclick</li>
 *   <li>focus</li>
 *   <li>keydown</li>
 *   <li>keypress</li>
 *   <li>keyup</li>
 *   <li>mousedown</li>
 *   <li>mousemove</li>
 *   <li>mouseout</li>
 *   <li>mouseover</li>
 *   <li>mouseup</li>
 *   <li>select</li>
 *   <li>submit</li>
 * </ul>
 *
 * Define new outside events with
 * <code>Y.Event.defineOutside(eventType);</code>.
 * By default, the created synthetic event name will be the name of the event
 * with "outside" appended (e.g. "click" becomes "clickoutside"). If you want
 * a different name for the created Event, pass it as a second argument like so:
 * <code>Y.Event.defineOutside(eventType, "yonderclick")</code>.
 *
 * This module was contributed by Brett Stimmerman, promoted from his
 * gallery-outside-events module at
 * http://yuilibrary.com/gallery/show/outside-events
 *
 * @module event
 * @submodule event-outside
 * @author brettstimmerman
 * @since 3.4.0
 */

// Outside events are pre-defined for each of these native DOM events
var nativeEvents = [
        'blur', 'change', 'click', 'dblclick', 'focus', 'keydown', 'keypress',
        'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup',
        'select', 'submit'
    ];

/**
 * Defines a new outside event to correspond with the given DOM event.
 *
 * By default, the created synthetic event name will be the name of the event
 * with "outside" appended (e.g. "click" becomes "clickoutside"). If you want
 * a different name for the created Event, pass it as a second argument like so:
 * <code>Y.Event.defineOutside(eventType, "yonderclick")</code>.
 *
 * @method defineOutside
 * @param {String} event DOM event
 * @param {String} name (optional) custom outside event name
 * @static
 * @for Event
 */
Y.Event.defineOutside = function (event, name) {
    name = name || (event + 'outside');

    var config = {
    
        on: function (node, sub, notifier) {
            sub.handle = Y.one('doc').on(event, function(e) {
                if (this.isOutside(node, e.target)) {
                    e.currentTarget = node;
                    notifier.fire(e);
                }
            }, this);
        },
        
        detach: function (node, sub, notifier) {
            sub.handle.detach();
        },
        
        delegate: function (node, sub, notifier, filter) {
            sub.handle = Y.one('doc').delegate(event, function (e) {
                if (this.isOutside(node, e.target)) {
                    notifier.fire(e);
                }
            }, filter, this);
        },
        
        isOutside: function (node, target) {
            return target !== node && !target.ancestor(function (p) {
                    return p === node;
                });
        }
    };
    config.detachDelegate = config.detach;

    Y.Event.define(name, config);
};

// Define outside events for some common native DOM events
Y.Array.each(nativeEvents, function (event) {
    Y.Event.defineOutside(event);
});


}, '3.8.1', {"requires": ["event-synthetic"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-autohide', function (Y, NAME) {

/**
 * A widget-level extension that provides ability to hide widget when
 * certain events occur.
 *
 * @module widget-autohide
 * @author eferraiuolo, tilomitra
 * @since 3.4.0
 */


var WIDGET_AUTOHIDE    = 'widgetAutohide',
    AUTOHIDE            = 'autohide',
    CLICK_OUTSIDE     = 'clickoutside',
    FOCUS_OUTSIDE     = 'focusoutside',
    DOCUMENT            = 'document',
    KEY                 = 'key',
    PRESS_ESCAPE         = 'esc',
    BIND_UI             = 'bindUI',
    SYNC_UI             = "syncUI",
    RENDERED            = "rendered",
    BOUNDING_BOX        = "boundingBox",
    VISIBLE             = "visible",
    CHANGE              = 'Change',

    getCN               = Y.ClassNameManager.getClassName;

/**
 * The WidgetAutohide class provides the hideOn attribute which can
 * be used to hide the widget when certain events occur.
 *
 * @class WidgetAutohide
 * @param {Object} config User configuration object
 */
function WidgetAutohide(config) {
    Y.after(this._bindUIAutohide, this, BIND_UI);
    Y.after(this._syncUIAutohide, this, SYNC_UI);


    if (this.get(RENDERED)) {
        this._bindUIAutohide();
        this._syncUIAutohide();
    }

}

/**
* Static property used to define the default attribute
* configuration introduced by WidgetAutohide.
*
* @property ATTRS
* @static
* @type Object
*/
WidgetAutohide.ATTRS = {


    /**
     * @attribute hideOn
     * @type array
     *
     * @description An array of objects corresponding to the nodes, events, and keycodes to hide the widget on.
     * The implementer can supply an array of objects, with each object having the following properties:
     * <p>eventName: (string, required): The eventName to listen to.</p>
     * <p>node: (Y.Node, optional): The Y.Node that will fire the event (defaults to the boundingBox of the widget)</p>
     * <p>keyCode: (string, optional): If listening for key events, specify the keyCode</p>
     * <p>By default, this attribute consists of one object which will cause the widget to hide if the
     * escape key is pressed.</p>
     */
    hideOn: {
        validator: Y.Lang.isArray,
        valueFn  : function() {
            return [
                {
                    node: Y.one(DOCUMENT),
                    eventName: KEY,
                    keyCode: PRESS_ESCAPE
                }
            ];
        }
    }
};

WidgetAutohide.prototype = {
    // *** Instance Members *** //

        _uiHandlesAutohide : null,

        // *** Lifecycle Methods *** //

        destructor : function () {

            this._detachUIHandlesAutohide();
        },

        /**
         * Binds event listeners to the widget.
         * <p>
         * This method in invoked after bindUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _bindUIAutohide
         * @protected
         */
        _bindUIAutohide : function () {

            this.after(VISIBLE+CHANGE, this._afterHostVisibleChangeAutohide);
            this.after("hideOnChange", this._afterHideOnChange);
        },

        /**
         * Syncs up the widget based on its current state. In particular, removes event listeners if
         * widget is not visible, and attaches them otherwise.
         * <p>
         * This method in invoked after syncUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _syncUIAutohide
         * @protected
         */
        _syncUIAutohide : function () {

            this._uiSetHostVisibleAutohide(this.get(VISIBLE));
        },

        // *** Private Methods *** //

        /**
         * Removes event listeners if widget is not visible, and attaches them otherwise.
         *
         * @method _uiSetHostVisibleAutohide
         * @protected
         */
        _uiSetHostVisibleAutohide : function (visible) {

            if (visible) {
                //this._attachUIHandlesAutohide();
                Y.later(1, this, '_attachUIHandlesAutohide');
            } else {
                this._detachUIHandlesAutohide();
            }
        },

        /**
         * Iterates through all objects in the hideOn attribute and creates event listeners.
         *
         * @method _attachUIHandlesAutohide
         * @protected
         */
        _attachUIHandlesAutohide : function () {

            if (this._uiHandlesAutohide) { return; }

            var bb = this.get(BOUNDING_BOX),
                hide = Y.bind(this.hide,this),
                uiHandles = [],
                self = this,
                hideOn = this.get('hideOn'),
                i = 0,
                o = {node: undefined, ev: undefined, keyCode: undefined};

                //push all events on which the widget should be hidden
                for (; i < hideOn.length; i++) {

                    o.node = hideOn[i].node;
                    o.ev = hideOn[i].eventName;
                    o.keyCode = hideOn[i].keyCode;

                    //no keycode or node defined
                    if (!o.node && !o.keyCode && o.ev) {
                        uiHandles.push(bb.on(o.ev, hide));
                    }

                    //node defined, no keycode (not a keypress)
                    else if (o.node && !o.keyCode && o.ev) {
                        uiHandles.push(o.node.on(o.ev, hide));
                    }

                    //node defined, keycode defined, event defined (its a key press)
                    else if (o.node && o.keyCode && o.ev) {
                        uiHandles.push(o.node.on(o.ev, hide, o.keyCode));
                    }

                    else {
                    }

                }

            this._uiHandlesAutohide = uiHandles;
        },

        /**
         * Detaches all event listeners created by this extension
         *
         * @method _detachUIHandlesAutohide
         * @protected
         */
        _detachUIHandlesAutohide : function () {

            Y.each(this._uiHandlesAutohide, function(h){
                h.detach();
            });
            this._uiHandlesAutohide = null;
        },

        /**
         * Default function called when the visibility of the widget changes. Determines
         * whether to attach or detach event listeners based on the visibility of the widget.
         *
         * @method _afterHostVisibleChangeAutohide
         * @protected
         */
        _afterHostVisibleChangeAutohide : function (e) {

            this._uiSetHostVisibleAutohide(e.newVal);
        },

        /**
         * Default function called when hideOn Attribute is changed. Remove existing listeners and create new listeners.
         *
         * @method _afterHideOnChange
         */
        _afterHideOnChange : function(e) {
            this._detachUIHandlesAutohide();

            if (this.get(VISIBLE)) {
                this._attachUIHandlesAutohide();
            }
        }
};

Y.WidgetAutohide = WidgetAutohide;


}, '3.8.1', {"requires": ["base-build", "event-key", "event-outside", "widget"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('button-core', function (Y, NAME) {

/**
 * Provides an interface for working with button-like DOM nodes
 *
 * @module button-core
 * @since 3.5.0
 */
var getClassName = Y.ClassNameManager.getClassName;

/**
 * Creates a button
 *
 * @class ButtonCore
 * @uses AttributeCore
 * @param config {Object} Configuration object
 * @constructor
 */
function ButtonCore(config) {
    this.initializer(config);
}

ButtonCore.prototype = {

    /**
     *
     * @property TEMPLATE
     * @type {String}
     * @default <button/>
     */
    TEMPLATE: '<button/>',

    /**
     *
     * @property constructor
     * @type {Object}
     * @default ButtonCore
     * @private
     */
    constructor: ButtonCore,

    /**
     * @method initializer
     * @description Internal init() handler.
     * @param config {Object} Config object.
     * @private
     */
    initializer: function(config) {
        this._initNode(config);
        this._initAttributes(config);
        this._renderUI(config);
    },

    /**
     * @method _initNode
     * @description Node initializer
     * @param config {Object} Config object.
     * @private
     */
    _initNode: function(config) {
        if (config.host) {
            this._host = Y.one(config.host);
        } else {
            this._host = Y.Node.create(this.TEMPLATE);
        }
    },

    /**
     * @method _initAttributes
     * @description  Attribute initializer
     * @param config {Object} Config object.
     * @private
     */
    _initAttributes: function(config) {
        var host = this._host,
            node = host.one('.' + ButtonCore.CLASS_NAMES.LABEL) || host;
            
        config.label = config.label || this._getLabel(node);
        Y.AttributeCore.call(this, ButtonCore.ATTRS, config);
    },

    /**
     * @method renderUI
     * @description Renders any UI/DOM elements for Button instances
     * @param config {Object} Config object.
     * @private
     */
    _renderUI: function() {
        var node = this.getNode(),
            tagName = node.get('tagName').toLowerCase();

        // Set some default node attributes
        node.addClass(ButtonCore.CLASS_NAMES.BUTTON);
        
        if (tagName !== 'button' && tagName !== 'input') {
            node.set('role', 'button');
        }
    },

    /**
     * @method enable
     * @description Sets the button's `disabled` DOM attribute to false
     * @public
     */
    enable: function() {
        this.set('disabled', false);
    },

    /**
     * @method disable
     * @description Sets the button's `disabled` DOM attribute to true
     * @public
     */
    disable: function() {
        this.set('disabled', true);
    },

    /**
     * @method getNode
     * @description Gets the host DOM node for this button instance
     * @public
     */
    getNode: function() {
        return this._host;
    },
    
    /**
     * @method _getLabel
     * @description Getter for a button's 'label' ATTR
     * @private
     */
    _getLabel: function () {
        var node    = this.getNode(),
            tagName = node.get('tagName').toLowerCase(),
            label;

        if (tagName === 'input') {
            label = node.get('value');
        }
        else {
            label = (node.one('.' + ButtonCore.CLASS_NAMES.LABEL) || node).get('text');
        }
        
        return label;
    },
    
    /**
     * @method _uiSetLabel
     * @description Setter for a button's 'label' ATTR
     * @param label {string}
     * @private
     */
    _uiSetLabel: function (label) {
        var node    = this.getNode(),
            tagName = node.get('tagName').toLowerCase();

        if (tagName === 'input') {
            node.set('value', label);
        } else {
            (node.one('.' + ButtonCore.CLASS_NAMES.LABEL) || node).set('text', label);
        }

        return label;
    },

    /**
     * @method _uiSetDisabled
     * @description Setter for the 'disabled' ATTR
     * @param value {boolean}
     * @private
     */
    _uiSetDisabled: function(value) {
        var node = this.getNode();
        
        node.getDOMNode().disabled = value; // avoid rerunning setter when this === node
        node.toggleClass(ButtonCore.CLASS_NAMES.DISABLED, value);
        
        return value;
    }
};


Y.mix(ButtonCore.prototype, Y.AttributeCore.prototype);

/**
 * Attribute configuration.
 *
 * @property ATTRS
 * @type {Object}
 * @protected
 * @static
 */
ButtonCore.ATTRS = {

    /**
     * The text of the button (the `value` or `text` property)
     *
     * @attribute label
     * @type String
     */
    label: {
        setter: '_uiSetLabel',
        getter: '_getLabel',
        lazyAdd: false
    },

    /**
     * The button's enabled/disabled state
     *
     * @attribute disabled
     * @type Boolean
     */
    disabled: {
        value: false,
        setter: '_uiSetDisabled',
        lazyAdd: false
    }
};

/**
 * Name of this component.
 *
 * @property NAME
 * @type String
 * @static
 */
ButtonCore.NAME = "button";

/**
 * Array of static constants used to identify the classnames applied to DOM nodes
 *
 * @property CLASS_NAMES
 * @type {Object}
 * @public
 * @static
 */
ButtonCore.CLASS_NAMES = {
    BUTTON  : getClassName('button'),
    DISABLED: getClassName('button', 'disabled'),
    SELECTED: getClassName('button', 'selected'),
    LABEL   : getClassName('button', 'label')
};

/**
 * Array of static constants used to for applying ARIA states
 *
 * @property CLASS_NAMES
 * @type {Object}
 * @private
 * @static
 */
ButtonCore.ARIA_STATES = {
    PRESSED : 'aria-pressed',
    CHECKED : 'aria-checked'
};

/**
 * Array of static constants used to for applying ARIA roles
 *
 * @property CLASS_NAMES
 * @type {Object}
 * @private
 * @static
 */
ButtonCore.ARIA_ROLES = {
    BUTTON  : 'button',
    CHECKBOX: 'checkbox',
    TOGGLE  : 'toggle'
};

// Export Button
Y.ButtonCore = ButtonCore;

}, '3.8.1', {"requires": ["attribute-core", "classnamemanager", "node-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('button-plugin', function (Y, NAME) {

/**
* A Button Plugin
*
* @module button-plugin
* @since 3.5.0
*/

/**
* @class Button
* @param config {Object} Configuration object
* @extends ButtonCore
* @constructor
* @namespace Plugin
*/
function ButtonPlugin() {
    ButtonPlugin.superclass.constructor.apply(this, arguments);
}

Y.extend(ButtonPlugin, Y.ButtonCore, {
    
    /**
    * @method _afterNodeGet
    * @param name {string}
    * @private
    */
    _afterNodeGet: function (name) {
        // TODO: point to method (_uiSetLabel, etc) instead of getter/setter
        var ATTRS = this.constructor.ATTRS,
            fn = ATTRS[name] && ATTRS[name].getter && this[ATTRS[name].getter];
            
        if (fn) {
            return new Y.Do.AlterReturn('get ' + name, fn.call(this));
        }
    },

    /**
    * @method _afterNodeSet
    * @param name {String}
    * @param val {String}
    * @private
    */
    _afterNodeSet: function (name, val) {
        var ATTRS = this.constructor.ATTRS,
            fn = ATTRS[name] && ATTRS[name].setter && this[ATTRS[name].setter];
            
        if (fn) {
            fn.call(this, val);
        }
    },

    /**
    * @method _initNode
    * @param config {Object}
    * @private
    */
    _initNode: function(config) {
        var node = config.host;
        this._host = node;
        
        Y.Do.after(this._afterNodeGet, node, 'get', this);
        Y.Do.after(this._afterNodeSet, node, 'set', this);
    },

    /**
    * @method destroy
    * @private
    */
    destroy: function(){
        // Nothing to do, but things are happier with it here
    }
    
}, {
    
    /**
    * Attribute configuration.
    *
    * @property ATTRS
    * @type {Object}
    * @private
    * @static
    */
    ATTRS: Y.merge(Y.ButtonCore.ATTRS),
    
    /**
    * Name of this component.
    *
    * @property NAME
    * @type String
    * @static
    */
    NAME: 'buttonPlugin',
    
    /**
    * Namespace of this component.
    *
    * @property NS
    * @type String
    * @static
    */
    NS: 'button'
    
});

/**
* @method createNode
* @description A factory that plugs a Y.Node instance with Y.Plugin.Button
* @param node {Object}
* @param config {Object}
* @return {Object} A plugged Y.Node instance
* @public
*/
ButtonPlugin.createNode = function(node, config) {
    var template;

    if (node && !config) {
        if (! (node.nodeType || node.getDOMNode || typeof node === 'string')) {
            config = node;
            node = config.srcNode;
        }
    }

    config   = config || {};
    template = config.template || Y.Plugin.Button.prototype.TEMPLATE;
    node     = node || config.srcNode || Y.DOM.create(template);

    return Y.one(node).plug(Y.Plugin.Button, config);
};

Y.namespace('Plugin').Button = ButtonPlugin;


}, '3.8.1', {"requires": ["button-core", "cssbutton", "node-pluginhost"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-stdmod', function (Y, NAME) {

/**
 * Provides standard module support for Widgets through an extension.
 *
 * @module widget-stdmod
 */
    var L = Y.Lang,
        Node = Y.Node,
        UA = Y.UA,
        Widget = Y.Widget,

        EMPTY = "",
        HD = "hd",
        BD = "bd",
        FT = "ft",
        HEADER = "header",
        BODY = "body",
        FOOTER = "footer",
        FILL_HEIGHT = "fillHeight",
        STDMOD = "stdmod",

        NODE_SUFFIX = "Node",
        CONTENT_SUFFIX = "Content",

        FIRST_CHILD = "firstChild",
        CHILD_NODES = "childNodes",
        OWNER_DOCUMENT = "ownerDocument",

        CONTENT_BOX = "contentBox",

        HEIGHT = "height",
        OFFSET_HEIGHT = "offsetHeight",
        AUTO = "auto",

        HeaderChange = "headerContentChange",
        BodyChange = "bodyContentChange",
        FooterChange = "footerContentChange",
        FillHeightChange = "fillHeightChange",
        HeightChange = "heightChange",
        ContentUpdate = "contentUpdate",

        RENDERUI = "renderUI",
        BINDUI = "bindUI",
        SYNCUI = "syncUI",

        APPLY_PARSED_CONFIG = "_applyParsedConfig",

        UI = Y.Widget.UI_SRC;

    /**
     * Widget extension, which can be used to add Standard Module support to the
     * base Widget class, through the <a href="Base.html#method_build">Base.build</a>
     * method.
     * <p>
     * The extension adds header, body and footer sections to the Widget's content box and
     * provides the corresponding methods and attributes to modify the contents of these sections.
     * </p>
     * @class WidgetStdMod
     * @param {Object} The user configuration object
     */
    function StdMod(config) {

        this._stdModNode = this.get(CONTENT_BOX);

        Y.before(this._renderUIStdMod, this, RENDERUI);
        Y.before(this._bindUIStdMod, this, BINDUI);
        Y.before(this._syncUIStdMod, this, SYNCUI);
    }

    /**
     * Constant used to refer the the standard module header, in methods which expect a section specifier
     *
     * @property HEADER
     * @static
     * @type String
     */
    StdMod.HEADER = HEADER;

    /**
     * Constant used to refer the the standard module body, in methods which expect a section specifier
     *
     * @property BODY
     * @static
     * @type String
     */
    StdMod.BODY = BODY;

    /**
     * Constant used to refer the the standard module footer, in methods which expect a section specifier
     *
     * @property FOOTER
     * @static
     * @type String
     */
    StdMod.FOOTER = FOOTER;

    /**
     * Constant used to specify insertion position, when adding content to sections of the standard module in
     * methods which expect a "where" argument.
     * <p>
     * Inserts new content <em>before</em> the sections existing content.
     * </p>
     * @property AFTER
     * @static
     * @type String
     */
    StdMod.AFTER = "after";

    /**
     * Constant used to specify insertion position, when adding content to sections of the standard module in
     * methods which expect a "where" argument.
     * <p>
     * Inserts new content <em>before</em> the sections existing content.
     * </p>
     * @property BEFORE
     * @static
     * @type String
     */
    StdMod.BEFORE = "before";
    /**
     * Constant used to specify insertion position, when adding content to sections of the standard module in
     * methods which expect a "where" argument.
     * <p>
     * <em>Replaces</em> the sections existing content, with new content.
     * </p>
     * @property REPLACE
     * @static
     * @type String
     */
    StdMod.REPLACE = "replace";

    var STD_HEADER = StdMod.HEADER,
        STD_BODY = StdMod.BODY,
        STD_FOOTER = StdMod.FOOTER,

        HEADER_CONTENT = STD_HEADER + CONTENT_SUFFIX,
        FOOTER_CONTENT = STD_FOOTER + CONTENT_SUFFIX,
        BODY_CONTENT = STD_BODY + CONTENT_SUFFIX;

    /**
     * Static property used to define the default attribute
     * configuration introduced by WidgetStdMod.
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    StdMod.ATTRS = {

        /**
         * @attribute headerContent
         * @type HTML
         * @default undefined
         * @description The content to be added to the header section. This will replace any existing content
         * in the header. If you want to append, or insert new content, use the <a href="#method_setStdModContent">setStdModContent</a> method.
         */
        headerContent: {
            value:null
        },

        /**
         * @attribute footerContent
         * @type HTML
         * @default undefined
         * @description The content to be added to the footer section. This will replace any existing content
         * in the footer. If you want to append, or insert new content, use the <a href="#method_setStdModContent">setStdModContent</a> method.
         */
        footerContent: {
            value:null
        },

        /**
         * @attribute bodyContent
         * @type HTML
         * @default undefined
         * @description The content to be added to the body section. This will replace any existing content
         * in the body. If you want to append, or insert new content, use the <a href="#method_setStdModContent">setStdModContent</a> method.
         */
        bodyContent: {
            value:null
        },

        /**
         * @attribute fillHeight
         * @type {String}
         * @default WidgetStdMod.BODY
         * @description The section (WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER) which should be resized to fill the height of the standard module, when a
         * height is set on the Widget. If a height is not set on the widget, then all sections are sized based on
         * their content.
         */
        fillHeight: {
            value: StdMod.BODY,
            validator: function(val) {
                 return this._validateFillHeight(val);
            }
        }
    };

    /**
     * The HTML parsing rules for the WidgetStdMod class.
     *
     * @property HTML_PARSER
     * @static
     * @type Object
     */
    StdMod.HTML_PARSER = {
        headerContent: function(contentBox) {
            return this._parseStdModHTML(STD_HEADER);
        },

        bodyContent: function(contentBox) {
            return this._parseStdModHTML(STD_BODY);
        },

        footerContent : function(contentBox) {
            return this._parseStdModHTML(STD_FOOTER);
        }
    };

    /**
     * Static hash of default class names used for the header,
     * body and footer sections of the standard module, keyed by
     * the section identifier (WidgetStdMod.STD_HEADER, WidgetStdMod.STD_BODY, WidgetStdMod.STD_FOOTER)
     *
     * @property SECTION_CLASS_NAMES
     * @static
     * @type Object
     */
    StdMod.SECTION_CLASS_NAMES = {
        header: Widget.getClassName(HD),
        body: Widget.getClassName(BD),
        footer: Widget.getClassName(FT)
    };

    /**
     * The template HTML strings for each of the standard module sections. Section entries are keyed by the section constants,
     * WidgetStdMod.HEADER, WidgetStdMod.BODY, WidgetStdMod.FOOTER, and contain the HTML to be added for each section.
     * e.g.
     * <pre>
     *    {
     *       header : '&lt;div class="yui-widget-hd"&gt;&lt;/div&gt;',
     *       body : '&lt;div class="yui-widget-bd"&gt;&lt;/div&gt;',
     *       footer : '&lt;div class="yui-widget-ft"&gt;&lt;/div&gt;'
     *    }
     * </pre>
     * @property TEMPLATES
     * @type Object
     * @static
     */
    StdMod.TEMPLATES = {
        header : '<div class="' + StdMod.SECTION_CLASS_NAMES[STD_HEADER] + '"></div>',
        body : '<div class="' + StdMod.SECTION_CLASS_NAMES[STD_BODY] + '"></div>',
        footer : '<div class="' + StdMod.SECTION_CLASS_NAMES[STD_FOOTER] + '"></div>'
    };

    StdMod.prototype = {

        /**
         * Synchronizes the UI to match the Widgets standard module state.
         * <p>
         * This method is invoked after syncUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _syncUIStdMod
         * @protected
         */
        _syncUIStdMod : function() {
            var stdModParsed = this._stdModParsed;

            if (!stdModParsed || !stdModParsed[HEADER_CONTENT]) {
                this._uiSetStdMod(STD_HEADER, this.get(HEADER_CONTENT));
            }

            if (!stdModParsed || !stdModParsed[BODY_CONTENT]) {
                this._uiSetStdMod(STD_BODY, this.get(BODY_CONTENT));
            }

            if (!stdModParsed || !stdModParsed[FOOTER_CONTENT]) {
                this._uiSetStdMod(STD_FOOTER, this.get(FOOTER_CONTENT));
            }

            this._uiSetFillHeight(this.get(FILL_HEIGHT));
        },

        /**
         * Creates/Initializes the DOM for standard module support.
         * <p>
         * This method is invoked after renderUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _renderUIStdMod
         * @protected
         */
        _renderUIStdMod : function() {
            this._stdModNode.addClass(Widget.getClassName(STDMOD));
            this._renderStdModSections();

            //This normally goes in bindUI but in order to allow setStdModContent() to work before renderUI
            //stage, these listeners should be set up at the earliest possible time.
            this.after(HeaderChange, this._afterHeaderChange);
            this.after(BodyChange, this._afterBodyChange);
            this.after(FooterChange, this._afterFooterChange);
        },

        _renderStdModSections : function() {
            if (L.isValue(this.get(HEADER_CONTENT))) { this._renderStdMod(STD_HEADER); }
            if (L.isValue(this.get(BODY_CONTENT))) { this._renderStdMod(STD_BODY); }
            if (L.isValue(this.get(FOOTER_CONTENT))) { this._renderStdMod(STD_FOOTER); }
        },

        /**
         * Binds event listeners responsible for updating the UI state in response to
         * Widget standard module related state changes.
         * <p>
         * This method is invoked after bindUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _bindUIStdMod
         * @protected
         */
        _bindUIStdMod : function() {
            // this.after(HeaderChange, this._afterHeaderChange);
            // this.after(BodyChange, this._afterBodyChange);
            // this.after(FooterChange, this._afterFooterChange);

            this.after(FillHeightChange, this._afterFillHeightChange);
            this.after(HeightChange, this._fillHeight);
            this.after(ContentUpdate, this._fillHeight);
        },

        /**
         * Default attribute change listener for the headerContent attribute, responsible
         * for updating the UI, in response to attribute changes.
         *
         * @method _afterHeaderChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterHeaderChange : function(e) {
            if (e.src !== UI) {
                this._uiSetStdMod(STD_HEADER, e.newVal, e.stdModPosition);
            }
        },

        /**
         * Default attribute change listener for the bodyContent attribute, responsible
         * for updating the UI, in response to attribute changes.
         *
         * @method _afterBodyChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterBodyChange : function(e) {
            if (e.src !== UI) {
                this._uiSetStdMod(STD_BODY, e.newVal, e.stdModPosition);
            }
        },

        /**
         * Default attribute change listener for the footerContent attribute, responsible
         * for updating the UI, in response to attribute changes.
         *
         * @method _afterFooterChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterFooterChange : function(e) {
            if (e.src !== UI) {
                this._uiSetStdMod(STD_FOOTER, e.newVal, e.stdModPosition);
            }
        },

        /**
         * Default attribute change listener for the fillHeight attribute, responsible
         * for updating the UI, in response to attribute changes.
         *
         * @method _afterFillHeightChange
         * @protected
         * @param {EventFacade} e The event facade for the attribute change
         */
        _afterFillHeightChange: function (e) {
            this._uiSetFillHeight(e.newVal);
        },

        /**
         * Default validator for the fillHeight attribute. Verifies that the
         * value set is a valid section specifier - one of WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER,
         * or a falsey value if fillHeight is to be disabled.
         *
         * @method _validateFillHeight
         * @protected
         * @param {String} val The section which should be setup to fill height, or false/null to disable fillHeight
         * @return true if valid, false if not
         */
        _validateFillHeight : function(val) {
            return !val || val == StdMod.BODY || val == StdMod.HEADER || val == StdMod.FOOTER;
        },

        /**
         * Updates the rendered UI, to resize the provided section so that the standard module fills out
         * the specified widget height. Note: This method does not check whether or not a height is set
         * on the Widget.
         *
         * @method _uiSetFillHeight
         * @protected
         * @param {String} fillSection A valid section specifier - one of WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER
         */
        _uiSetFillHeight : function(fillSection) {
            var fillNode = this.getStdModNode(fillSection);
            var currNode = this._currFillNode;

            if (currNode && fillNode !== currNode){
                currNode.setStyle(HEIGHT, EMPTY);
            }

            if (fillNode) {
                this._currFillNode = fillNode;
            }

            this._fillHeight();
        },

        /**
         * Updates the rendered UI, to resize the current section specified by the fillHeight attribute, so
         * that the standard module fills out the Widget height. If a height has not been set on Widget,
         * the section is not resized (height is set to "auto").
         *
         * @method _fillHeight
         * @private
         */
        _fillHeight : function() {
            if (this.get(FILL_HEIGHT)) {
                var height = this.get(HEIGHT);
                if (height != EMPTY && height != AUTO) {
                    this.fillHeight(this._currFillNode);
                }
            }
        },

        /**
         * Updates the rendered UI, adding the provided content (either an HTML string, or node reference),
         * to the specified section. The content is either added before, after or replaces existing content
         * in the section, based on the value of the <code>where</code> argument.
         *
         * @method _uiSetStdMod
         * @protected
         *
         * @param {String} section The section to be updated. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @param {String | Node} content The new content (either as an HTML string, or Node reference) to add to the section
         * @param {String} where Optional. Either WidgetStdMod.AFTER, WidgetStdMod.BEFORE or WidgetStdMod.REPLACE.
         * If not provided, the content will replace existing content in the section.
         */
        _uiSetStdMod : function(section, content, where) {
            // Using isValue, so that "" is valid content
            if (L.isValue(content)) {
                var node = this.getStdModNode(section, true);

                this._addStdModContent(node, content, where);

                this.set(section + CONTENT_SUFFIX, this._getStdModContent(section), {src:UI});
            } else {
                this._eraseStdMod(section);
            }
            this.fire(ContentUpdate);
        },

        /**
         * Creates the DOM node for the given section, and inserts it into the correct location in the contentBox.
         *
         * @method _renderStdMod
         * @protected
         * @param {String} section The section to create/render. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @return {Node} A reference to the added section node
         */
        _renderStdMod : function(section) {

            var contentBox = this.get(CONTENT_BOX),
                sectionNode = this._findStdModSection(section);

            if (!sectionNode) {
                sectionNode = this._getStdModTemplate(section);
            }

            this._insertStdModSection(contentBox, section, sectionNode);

            this[section + NODE_SUFFIX] = sectionNode;
            return this[section + NODE_SUFFIX];
        },

        /**
         * Removes the DOM node for the given section.
         *
         * @method _eraseStdMod
         * @protected
         * @param {String} section The section to remove. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         */
        _eraseStdMod : function(section) {
            var sectionNode = this.getStdModNode(section);
            if (sectionNode) {
                sectionNode.remove(true);
                delete this[section + NODE_SUFFIX];
            }
        },

        /**
         * Helper method to insert the Node for the given section into the correct location in the contentBox.
         *
         * @method _insertStdModSection
         * @private
         * @param {Node} contentBox A reference to the Widgets content box.
         * @param {String} section The section to create/render. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @param {Node} sectionNode The Node for the section.
         */
        _insertStdModSection : function(contentBox, section, sectionNode) {
            var fc = contentBox.get(FIRST_CHILD);

            if (section === STD_FOOTER || !fc) {
                contentBox.appendChild(sectionNode);
            } else {
                if (section === STD_HEADER) {
                    contentBox.insertBefore(sectionNode, fc);
                } else {
                    var footer = this[STD_FOOTER + NODE_SUFFIX];
                    if (footer) {
                        contentBox.insertBefore(sectionNode, footer);
                    } else {
                        contentBox.appendChild(sectionNode);
                    }
                }
            }
        },

        /**
         * Gets a new Node reference for the given standard module section, by cloning
         * the stored template node.
         *
         * @method _getStdModTemplate
         * @protected
         * @param {String} section The section to create a new node for. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @return {Node} The new Node instance for the section
         */
        _getStdModTemplate : function(section) {
            return Node.create(StdMod.TEMPLATES[section], this._stdModNode.get(OWNER_DOCUMENT));
        },

        /**
         * Helper method to add content to a StdMod section node.
         * The content is added either before, after or replaces the existing node content
         * based on the value of the <code>where</code> argument.
         *
         * @method _addStdModContent
         * @private
         *
         * @param {Node} node The section Node to be updated.
         * @param {Node|NodeList|String} children The new content Node, NodeList or String to be added to section Node provided.
         * @param {String} where Optional. Either WidgetStdMod.AFTER, WidgetStdMod.BEFORE or WidgetStdMod.REPLACE.
         * If not provided, the content will replace existing content in the Node.
         */
        _addStdModContent : function(node, children, where) {

            // StdMod where to Node where
            switch (where) {
                case StdMod.BEFORE:  // 0 is before fistChild
                    where = 0;
                    break;
                case StdMod.AFTER:   // undefined is appendChild
                    where = undefined;
                    break;
                default:            // replace is replace, not specified is replace
                    where = StdMod.REPLACE;
            }

            node.insert(children, where);
        },

        /**
         * Helper method to obtain the precise height of the node provided, including padding and border.
         * The height could be a sub-pixel value for certain browsers, such as Firefox 3.
         *
         * @method _getPreciseHeight
         * @private
         * @param {Node} node The node for which the precise height is required.
         * @return {Number} The height of the Node including borders and padding, possibly a float.
         */
        _getPreciseHeight : function(node) {
            var height = (node) ? node.get(OFFSET_HEIGHT) : 0,
                getBCR = "getBoundingClientRect";

            if (node && node.hasMethod(getBCR)) {
                var preciseRegion = node.invoke(getBCR);
                if (preciseRegion) {
                    height = preciseRegion.bottom - preciseRegion.top;
                }
            }

            return height;
        },

        /**
         * Helper method to to find the rendered node for the given section,
         * if it exists.
         *
         * @method _findStdModSection
         * @private
         * @param {String} section The section for which the render Node is to be found. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @return {Node} The rendered node for the given section, or null if not found.
         */
        _findStdModSection: function(section) {
            return this.get(CONTENT_BOX).one("> ." + StdMod.SECTION_CLASS_NAMES[section]);
        },

        /**
         * Utility method, used by WidgetStdMods HTML_PARSER implementation
         * to extract data for each section from markup.
         *
         * @method _parseStdModHTML
         * @private
         * @param {String} section
         * @return {String} Inner HTML string with the contents of the section
         */
        _parseStdModHTML : function(section) {

            var node = this._findStdModSection(section);

            if (node) {
                if (!this._stdModParsed) {
                    this._stdModParsed = {};
                    Y.before(this._applyStdModParsedConfig, this, APPLY_PARSED_CONFIG);
                }
                this._stdModParsed[section + CONTENT_SUFFIX] = 1;

                return node.get("innerHTML");
            }

            return null;
        },

        /**
         * This method is injected before the _applyParsedConfig step in
         * the application of HTML_PARSER, and sets up the state to
         * identify whether or not we should remove the current DOM content
         * or not, based on whether or not the current content attribute value
         * was extracted from the DOM, or provided by the user configuration
         *
         * @method _applyStdModParsedConfig
         * @private
         */
        _applyStdModParsedConfig : function(node, cfg, parsedCfg) {
            var parsed = this._stdModParsed;
            if (parsed) {
                parsed[HEADER_CONTENT] = !(HEADER_CONTENT in cfg) && (HEADER_CONTENT in parsed);
                parsed[BODY_CONTENT] = !(BODY_CONTENT in cfg) && (BODY_CONTENT in parsed);
                parsed[FOOTER_CONTENT] = !(FOOTER_CONTENT in cfg) && (FOOTER_CONTENT in parsed);
            }
        },

        /**
         * Retrieves the child nodes (content) of a standard module section
         *
         * @method _getStdModContent
         * @private
         * @param {String} section The standard module section whose child nodes are to be retrieved. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @return {Node} The child node collection of the standard module section.
         */
        _getStdModContent : function(section) {
            return (this[section + NODE_SUFFIX]) ? this[section + NODE_SUFFIX].get(CHILD_NODES) : null;
        },

        /**
         * Updates the body section of the standard module with the content provided (either an HTML string, or node reference).
         * <p>
         * This method can be used instead of the corresponding section content attribute if you'd like to retain the current content of the section,
         * and insert content before or after it, by specifying the <code>where</code> argument.
         * </p>
         * @method setStdModContent
         * @param {String} section The standard module section whose content is to be updated. Either WidgetStdMod.HEADER, WidgetStdMod.BODY or WidgetStdMod.FOOTER.
         * @param {String | Node} content The content to be added, either an HTML string or a Node reference.
         * @param {String} where Optional. Either WidgetStdMod.AFTER, WidgetStdMod.BEFORE or WidgetStdMod.REPLACE.
         * If not provided, the content will replace existing content in the section.
         */
        setStdModContent : function(section, content, where) {
            //var node = this.getStdModNode(section) || this._renderStdMod(section);
            this.set(section + CONTENT_SUFFIX, content, {stdModPosition:where});
            //this._addStdModContent(node, content, where);
        },

        /**
        Returns the node reference for the specified `section`.

        **Note:** The DOM is not queried for the node reference. The reference
        stored by the widget instance is returned if it was set. Passing a
        truthy for `forceCreate` will create the section node if it does not
        already exist.

        @method getStdModNode
        @param {String} section The section whose node reference is required.
            Either `WidgetStdMod.HEADER`, `WidgetStdMod.BODY`, or
            `WidgetStdMod.FOOTER`.
        @param {Boolean} forceCreate Whether the section node should be created
            if it does not already exist.
        @return {Node} The node reference for the `section`, or null if not set.
        **/
        getStdModNode : function(section, forceCreate) {
            var node = this[section + NODE_SUFFIX] || null;

            if (!node && forceCreate) {
                node = this._renderStdMod(section);
            }

            return node;
        },

        /**
         * Sets the height on the provided header, body or footer element to
         * fill out the height of the Widget. It determines the height of the
         * widgets bounding box, based on it's configured height value, and
         * sets the height of the provided section to fill out any
         * space remaining after the other standard module section heights
         * have been accounted for.
         *
         * <p><strong>NOTE:</strong> This method is not designed to work if an explicit
         * height has not been set on the Widget, since for an "auto" height Widget,
         * the heights of the header/body/footer will drive the height of the Widget.</p>
         *
         * @method fillHeight
         * @param {Node} node The node which should be resized to fill out the height
         * of the Widget bounding box. Should be a standard module section node which belongs
         * to the widget.
         */
        fillHeight : function(node) {
            if (node) {
                var contentBox = this.get(CONTENT_BOX),
                    stdModNodes = [this.headerNode, this.bodyNode, this.footerNode],
                    stdModNode,
                    cbContentHeight,
                    filled = 0,
                    remaining = 0,

                    validNode = false;

                for (var i = 0, l = stdModNodes.length; i < l; i++) {
                    stdModNode = stdModNodes[i];
                    if (stdModNode) {
                        if (stdModNode !== node) {
                            filled += this._getPreciseHeight(stdModNode);
                        } else {
                            validNode = true;
                        }
                    }
                }

                if (validNode) {
                    if (UA.ie || UA.opera) {
                        // Need to set height to 0, to allow height to be reduced
                        node.set(OFFSET_HEIGHT, 0);
                    }

                    cbContentHeight = contentBox.get(OFFSET_HEIGHT) -
                            parseInt(contentBox.getComputedStyle("paddingTop"), 10) -
                            parseInt(contentBox.getComputedStyle("paddingBottom"), 10) -
                            parseInt(contentBox.getComputedStyle("borderBottomWidth"), 10) -
                            parseInt(contentBox.getComputedStyle("borderTopWidth"), 10);

                    if (L.isNumber(cbContentHeight)) {
                        remaining = cbContentHeight - filled;
                        if (remaining >= 0) {
                            node.set(OFFSET_HEIGHT, remaining);
                        }
                    }
                }
            }
        }
    };

    Y.WidgetStdMod = StdMod;


}, '3.8.1', {"requires": ["base-build", "widget"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-buttons', function (Y, NAME) {

/**
Provides header/body/footer button support for Widgets that use the
`WidgetStdMod` extension.

@module widget-buttons
@since 3.4.0
**/

var YArray  = Y.Array,
    YLang   = Y.Lang,
    YObject = Y.Object,

    ButtonPlugin = Y.Plugin.Button,
    Widget       = Y.Widget,
    WidgetStdMod = Y.WidgetStdMod,

    getClassName = Y.ClassNameManager.getClassName,
    isArray      = YLang.isArray,
    isNumber     = YLang.isNumber,
    isString     = YLang.isString,
    isValue      = YLang.isValue;

// Utility to determine if an object is a Y.Node instance, even if it was
// created in a different YUI sandbox.
function isNode(node) {
    return !!node.getDOMNode;
}

/**
Provides header/body/footer button support for Widgets that use the
`WidgetStdMod` extension.

This Widget extension makes it easy to declaratively configure a widget's
buttons. It adds a `buttons` attribute along with button- accessor and mutator
methods. All button nodes have the `Y.Plugin.Button` plugin applied.

This extension also includes `HTML_PARSER` support to seed a widget's `buttons`
from those which already exist in its DOM.

@class WidgetButtons
@extensionfor Widget
@since 3.4.0
**/
function WidgetButtons() {
    // Require `Y.WidgetStdMod`.
    if (!this._stdModNode) {
        Y.error('WidgetStdMod must be added to a Widget before WidgetButtons.');
    }

    // Has to be setup before the `initializer()`.
    this._buttonsHandles = {};
}

WidgetButtons.ATTRS = {
    /**
    Collection containing a widget's buttons.

    The collection is an Object which contains an Array of `Y.Node`s for every
    `WidgetStdMod` section (header, body, footer) which has one or more buttons.
    All button nodes have the `Y.Plugin.Button` plugin applied.

    This attribute is very flexible in the values it will accept. `buttons` can
    be specified as a single Array, or an Object of Arrays keyed to a particular
    section.

    All specified values will be normalized to this type of structure:

        {
            header: [...],
            footer: [...]
        }

    A button can be specified as a `Y.Node`, config Object, or String name for a
    predefined button on the `BUTTONS` prototype property. When a config Object
    is provided, it will be merged with any defaults provided by a button with
    the same `name` defined on the `BUTTONS` property.

    See `addButton()` for the detailed list of configuration properties.

    For convenience, a widget's buttons will always persist and remain rendered
    after header/body/footer content updates. Buttons should be removed by
    updating this attribute or using the `removeButton()` method.

    @example
        {
            // Uses predefined "close" button by string name.
            header: ['close'],

            footer: [
                {
                    name  : 'cancel',
                    label : 'Cancel',
                    action: 'hide'
                },

                {
                    name     : 'okay',
                    label    : 'Okay',
                    isDefault: true,

                    events: {
                        click: function (e) {
                            this.hide();
                        }
                    }
                }
            ]
        }

    @attribute buttons
    @type Object
    @default {}
    @since 3.4.0
    **/
    buttons: {
        getter: '_getButtons',
        setter: '_setButtons',
        value : {}
    },

    /**
    The current default button as configured through this widget's `buttons`.

    A button can be configured as the default button in the following ways:

      * As a config Object with an `isDefault` property:
        `{label: 'Okay', isDefault: true}`.

      * As a Node with a `data-default` attribute:
        `<button data-default="true">Okay</button>`.

    This attribute is **read-only**; anytime there are changes to this widget's
    `buttons`, the `defaultButton` will be updated if needed.

    **Note:** If two or more buttons are configured to be the default button,
    the last one wins.

    @attribute defaultButton
    @type Node
    @default null
    @readOnly
    @since 3.5.0
    **/
    defaultButton: {
        readOnly: true,
        value   : null
    }
};

/**
CSS classes used by `WidgetButtons`.

@property CLASS_NAMES
@type Object
@static
@since 3.5.0
**/
WidgetButtons.CLASS_NAMES = {
    button : getClassName('button'),
    buttons: Widget.getClassName('buttons'),
    primary: getClassName('button', 'primary')
};

WidgetButtons.HTML_PARSER = {
    buttons: function (srcNode) {
        return this._parseButtons(srcNode);
    }
};

/**
The list of button configuration properties which are specific to
`WidgetButtons` and should not be passed to `Y.Plugin.Button.createNode()`.

@property NON_BUTTON_NODE_CFG
@type Array
@static
@since 3.5.0
**/
WidgetButtons.NON_BUTTON_NODE_CFG = [
    'action', 'classNames', 'context', 'events', 'isDefault', 'section'
];

WidgetButtons.prototype = {
    // -- Public Properties ----------------------------------------------------

    /**
    Collection of predefined buttons mapped by name -> config.

    These button configurations will serve as defaults for any button added to a
    widget's buttons which have the same `name`.

    See `addButton()` for a list of possible configuration values.

    @property BUTTONS
    @type Object
    @default {}
    @see addButton()
    @since 3.5.0
    **/
    BUTTONS: {},

    /**
    The HTML template to use when creating the node which wraps all buttons of a
    section. By default it will have the CSS class: "yui3-widget-buttons".

    @property BUTTONS_TEMPLATE
    @type String
    @default "<span />"
    @since 3.5.0
    **/
    BUTTONS_TEMPLATE: '<span />',

    /**
    The default section to render buttons in when no section is specified.

    @property DEFAULT_BUTTONS_SECTION
    @type String
    @default Y.WidgetStdMod.FOOTER
    @since 3.5.0
    **/
    DEFAULT_BUTTONS_SECTION: WidgetStdMod.FOOTER,

    // -- Protected Properties -------------------------------------------------

    /**
    A map of button node `_yuid` -> event-handle for all button nodes which were
    created by this widget.

    @property _buttonsHandles
    @type Object
    @protected
    @since 3.5.0
    **/

    /**
    A map of this widget's `buttons`, both name -> button and
    section:name -> button.

    @property _buttonsMap
    @type Object
    @protected
    @since 3.5.0
    **/

    /**
    Internal reference to this widget's default button.

    @property _defaultButton
    @type Node
    @protected
    @since 3.5.0
    **/

    // -- Lifecycle Methods ----------------------------------------------------

    initializer: function () {
        // Creates button mappings and sets the `defaultButton`.
        this._mapButtons(this.get('buttons'));
        this._updateDefaultButton();

        // Bound with `Y.bind()` to make more extensible.
        this.after({
            buttonsChange      : Y.bind('_afterButtonsChange', this),
            defaultButtonChange: Y.bind('_afterDefaultButtonChange', this)
        });

        Y.after(this._bindUIButtons, this, 'bindUI');
        Y.after(this._syncUIButtons, this, 'syncUI');
    },

    destructor: function () {
        // Detach all event subscriptions this widget added to its `buttons`.
        YObject.each(this._buttonsHandles, function (handle) {
            handle.detach();
        });

        delete this._buttonsHandles;
        delete this._buttonsMap;
        delete this._defaultButton;
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Adds a button to this widget.

    The new button node will have the `Y.Plugin.Button` plugin applied, be added
    to this widget's `buttons`, and rendered in the specified `section` at the
    specified `index` (or end of the section when no `index` is provided). If
    the section does not exist, it will be created.

    This fires the `buttonsChange` event and adds the following properties to
    the event facade:

      * `button`: The button node or config object to add.

      * `section`: The `WidgetStdMod` section (header/body/footer) where the
        button will be added.

      * `index`: The index at which the button will be in the section.

      * `src`: "add"

    **Note:** The `index` argument will be passed to the Array `splice()`
    method, therefore a negative value will insert the `button` that many items
    from the end. The `index` property on the `buttonsChange` event facade is
    the index at which the `button` was added.

    @method addButton
    @param {Node|Object|String} button The button to add. This can be a `Y.Node`
        instance, config Object, or String name for a predefined button on the
        `BUTTONS` prototype property. When a config Object is provided, it will
        be merged with any defaults provided by any `srcNode` and/or a button
        with the same `name` defined on the `BUTTONS` property. The following
        are the possible configuration properties beyond what Node plugins
        accept by default:
      @param {Function|String} [button.action] The default handler that should
        be called when the button is clicked. A String name of a Function that
        exists on the `context` object can also be provided. **Note:**
        Specifying a set of `events` will override this setting.
      @param {String|String[]} [button.classNames] Additional CSS classes to add
        to the button node.
      @param {Object} [button.context=this] Context which any `events` or
        `action` should be called with. Defaults to `this`, the widget.
        **Note:** `e.target` will access the button node in the event handlers.
      @param {Boolean} [button.disabled=false] Whether the button should be
        disabled.
      @param {String|Object} [button.events="click"] Event name, or set of
        events and handlers to bind to the button node. **See:** `Y.Node.on()`,
        this value is passed as the first argument to `on()`.
      @param {Boolean} [button.isDefault=false] Whether the button is the
        default button.
      @param {String} [button.label] The visible text/value displayed in the
        button.
      @param {String} [button.name] A name which can later be used to reference
        this button. If a button is defined on the `BUTTONS` property with this
        same name, its configuration properties will be merged in as defaults.
      @param {String} [button.section] The `WidgetStdMod` section (header, body,
        footer) where the button should be added.
      @param {Node} [button.srcNode] An existing Node to use for the button,
        default values will be seeded from this node, but are overriden by any
        values specified in the config object. By default a new &lt;button&gt;
        node will be created.
      @param {String} [button.template] A specific template to use when creating
        a new button node (e.g. "&lt;a /&gt;"). **Note:** Specifying a `srcNode`
        will overide this.
    @param {String} [section="footer"] The `WidgetStdMod` section
        (header/body/footer) where the button should be added. This takes
        precedence over the `button.section` configuration property.
    @param {Number} [index] The index at which the button should be inserted. If
        not specified, the button will be added to the end of the section. This
        value is passed to the Array `splice()` method, therefore a negative
        value will insert the `button` that many items from the end.
    @chainable
    @see Plugin.Button.createNode()
    @since 3.4.0
    **/
    addButton: function (button, section, index) {
        var buttons = this.get('buttons'),
            sectionButtons, atIndex;

        // Makes sure we have the full config object.
        if (!isNode(button)) {
            button = this._mergeButtonConfig(button);
            section || (section = button.section);
        }

        section || (section = this.DEFAULT_BUTTONS_SECTION);
        sectionButtons = buttons[section] || (buttons[section] = []);
        isNumber(index) || (index = sectionButtons.length);

        // Insert new button at the correct position.
        sectionButtons.splice(index, 0, button);

        // Determine the index at which the `button` now exists in the array.
        atIndex = YArray.indexOf(sectionButtons, button);

        this.set('buttons', buttons, {
            button : button,
            section: section,
            index  : atIndex,
            src    : 'add'
        });

        return this;
    },

    /**
    Returns a button node from this widget's `buttons`.

    @method getButton
    @param {Number|String} name The string name or index of the button.
    @param {String} [section="footer"] The `WidgetStdMod` section
        (header/body/footer) where the button exists. Only applicable when
        looking for a button by numerical index, or by name but scoped to a
        particular section.
    @return {Node} The button node.
    @since 3.5.0
    **/
    getButton: function (name, section) {
        if (!isValue(name)) { return; }

        var map = this._buttonsMap,
            buttons;

        section || (section = this.DEFAULT_BUTTONS_SECTION);

        // Supports `getButton(1, 'header')` signature.
        if (isNumber(name)) {
            buttons = this.get('buttons');
            return buttons[section] && buttons[section][name];
        }

        // Looks up button by name or section:name.
        return arguments.length > 1 ? map[section + ':' + name] : map[name];
    },

    /**
    Removes a button from this widget.

    The button will be removed from this widget's `buttons` and its DOM. Any
    event subscriptions on the button which were created by this widget will be
    detached. If the content section becomes empty after removing the button
    node, then the section will also be removed.

    This fires the `buttonsChange` event and adds the following properties to
    the event facade:

      * `button`: The button node to remove.

      * `section`: The `WidgetStdMod` section (header/body/footer) where the
        button should be removed from.

      * `index`: The index at which the button exists in the section.

      * `src`: "remove"

    @method removeButton
    @param {Node|Number|String} button The button to remove. This can be a
        `Y.Node` instance, index, or String name of a button.
    @param {String} [section="footer"] The `WidgetStdMod` section
        (header/body/footer) where the button exists. Only applicable when
        removing a button by numerical index, or by name but scoped to a
        particular section.
    @chainable
    @since 3.5.0
    **/
    removeButton: function (button, section) {
        if (!isValue(button)) { return this; }

        var buttons = this.get('buttons'),
            index;

        // Shortcut if `button` is already an index which is needed for slicing.
        if (isNumber(button)) {
            section || (section = this.DEFAULT_BUTTONS_SECTION);
            index  = button;
            button = buttons[section][index];
        } else {
            // Supports `button` being the string name.
            if (isString(button)) {
                // `getButton()` is called this way because its behavior is
                // different based on the number of arguments.
                button = this.getButton.apply(this, arguments);
            }

            // Determines the `section` and `index` at which the button exists.
            YObject.some(buttons, function (sectionButtons, currentSection) {
                index = YArray.indexOf(sectionButtons, button);

                if (index > -1) {
                    section = currentSection;
                    return true;
                }
            });
        }

        // Button was found at an appropriate index.
        if (button && index > -1) {
            // Remove button from `section` array.
            buttons[section].splice(index, 1);

            this.set('buttons', buttons, {
                button : button,
                section: section,
                index  : index,
                src    : 'remove'
            });
        }

        return this;
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    Binds UI event listeners. This method is inserted via AOP, and will execute
    after `bindUI()`.

    @method _bindUIButtons
    @protected
    @since 3.4.0
    **/
    _bindUIButtons: function () {
        // Event handlers are bound with `bind()` to make them more extensible.
        var afterContentChange = Y.bind('_afterContentChangeButtons', this);

        this.after({
            visibleChange      : Y.bind('_afterVisibleChangeButtons', this),
            headerContentChange: afterContentChange,
            bodyContentChange  : afterContentChange,
            footerContentChange: afterContentChange
        });
    },

    /**
    Returns a button node based on the specified `button` node or configuration.

    The button node will either be created via `Y.Plugin.Button.createNode()`,
    or when `button` is specified as a node already, it will by `plug()`ed with
    `Y.Plugin.Button`.

    @method _createButton
    @param {Node|Object} button Button node or configuration object.
    @return {Node} The button node.
    @protected
    @since 3.5.0
    **/
    _createButton: function (button) {
        var config, buttonConfig, nonButtonNodeCfg,
            i, len, action, context, handle;

        // Makes sure the exiting `Y.Node` instance is from this YUI sandbox and
        // is plugged with `Y.Plugin.Button`.
        if (isNode(button)) {
            return Y.one(button.getDOMNode()).plug(ButtonPlugin);
        }

        // Merge `button` config with defaults and back-compat.
        config = Y.merge({
            context: this,
            events : 'click',
            label  : button.value
        }, button);

        buttonConfig     = Y.merge(config);
        nonButtonNodeCfg = WidgetButtons.NON_BUTTON_NODE_CFG;

        // Remove all non-button Node config props.
        for (i = 0, len = nonButtonNodeCfg.length; i < len; i += 1) {
            delete buttonConfig[nonButtonNodeCfg[i]];
        }

        // Create the button node using the button Node-only config.
        button = ButtonPlugin.createNode(buttonConfig);

        context = config.context;
        action  = config.action;

        // Supports `action` as a String name of a Function on the `context`
        // object.
        if (isString(action)) {
            action = Y.bind(action, context);
        }

        // Supports all types of crazy configs for event subscriptions and
        // stores a reference to the returned `EventHandle`.
        handle = button.on(config.events, action, context);
        this._buttonsHandles[Y.stamp(button, true)] = handle;

        // Tags the button with the configured `name` and `isDefault` settings.
        button.setData('name', this._getButtonName(config));
        button.setData('default', this._getButtonDefault(config));

        // Add any CSS classnames to the button node.
        YArray.each(YArray(config.classNames), button.addClass, button);

        return button;
    },

    /**
    Returns the buttons container for the specified `section`, passing a truthy
    value for `create` will create the node if it does not already exist.

    **Note:** It is up to the caller to properly insert the returned container
    node into the content section.

    @method _getButtonContainer
    @param {String} section The `WidgetStdMod` section (header/body/footer).
    @param {Boolean} create Whether the buttons container should be created if
        it does not already exist.
    @return {Node} The buttons container node for the specified `section`.
    @protected
    @see BUTTONS_TEMPLATE
    @since 3.5.0
    **/
    _getButtonContainer: function (section, create) {
        var sectionClassName = WidgetStdMod.SECTION_CLASS_NAMES[section],
            buttonsClassName = WidgetButtons.CLASS_NAMES.buttons,
            contentBox       = this.get('contentBox'),
            containerSelector, container;

        // Search for an existing buttons container within the section.
        containerSelector = '.' + sectionClassName + ' .' + buttonsClassName;
        container         = contentBox.one(containerSelector);

        // Create the `container` if it doesn't already exist.
        if (!container && create) {
            container = Y.Node.create(this.BUTTONS_TEMPLATE);
            container.addClass(buttonsClassName);
        }

        return container;
    },

    /**
    Returns whether or not the specified `button` is configured to be the
    default button.

    When a button node is specified, the button's `getData()` method will be
    used to determine if the button is configured to be the default. When a
    button config object is specified, the `isDefault` prop will determine
    whether the button is the default.

    **Note:** `<button data-default="true"></button>` is supported via the
    `button.getData('default')` API call.

    @method _getButtonDefault
    @param {Node|Object} button The button node or configuration object.
    @return {Boolean} Whether the button is configured to be the default button.
    @protected
    @since 3.5.0
    **/
    _getButtonDefault: function (button) {
        var isDefault = isNode(button) ?
                button.getData('default') : button.isDefault;

        if (isString(isDefault)) {
            return isDefault.toLowerCase() === 'true';
        }

        return !!isDefault;
    },

    /**
    Returns the name of the specified `button`.

    When a button node is specified, the button's `getData('name')` method is
    preferred, but will fallback to `get('name')`, and the result will determine
    the button's name. When a button config object is specified, the `name` prop
    will determine the button's name.

    **Note:** `<button data-name="foo"></button>` is supported via the
    `button.getData('name')` API call.

    @method _getButtonName
    @param {Node|Object} button The button node or configuration object.
    @return {String} The name of the button.
    @protected
    @since 3.5.0
    **/
    _getButtonName: function (button) {
        var name;

        if (isNode(button)) {
            name = button.getData('name') || button.get('name');
        } else {
            name = button && (button.name || button.type);
        }

        return name;
    },

    /**
    Getter for the `buttons` attribute. A copy of the `buttons` object is
    returned so the stored state cannot be modified by the callers of
    `get('buttons')`.

    This will recreate a copy of the `buttons` object, and each section array
    (the button nodes are *not* copied/cloned.)

    @method _getButtons
    @param {Object} buttons The widget's current `buttons` state.
    @return {Object} A copy of the widget's current `buttons` state.
    @protected
    @since 3.5.0
    **/
    _getButtons: function (buttons) {
        var buttonsCopy = {};

        // Creates a new copy of the `buttons` object.
        YObject.each(buttons, function (sectionButtons, section) {
            // Creates of copy of the array of button nodes.
            buttonsCopy[section] = sectionButtons.concat();
        });

        return buttonsCopy;
    },

    /**
    Adds the specified `button` to the buttons map (both name -> button and
    section:name -> button), and sets the button as the default if it is
    configured as the default button.

    **Note:** If two or more buttons are configured with the same `name` and/or
    configured to be the default button, the last one wins.

    @method _mapButton
    @param {Node} button The button node to map.
    @param {String} section The `WidgetStdMod` section (header/body/footer).
    @protected
    @since 3.5.0
    **/
    _mapButton: function (button, section) {
        var map       = this._buttonsMap,
            name      = this._getButtonName(button),
            isDefault = this._getButtonDefault(button);

        if (name) {
            // name -> button
            map[name] = button;

            // section:name -> button
            map[section + ':' + name] = button;
        }

        isDefault && (this._defaultButton = button);
    },

    /**
    Adds the specified `buttons` to the buttons map (both name -> button and
    section:name -> button), and set the a button as the default if one is
    configured as the default button.

    **Note:** This will clear all previous button mappings and null-out any
    previous default button! If two or more buttons are configured with the same
    `name` and/or configured to be the default button, the last one wins.

    @method _mapButtons
    @param {Node[]} buttons The button nodes to map.
    @protected
    @since 3.5.0
    **/
    _mapButtons: function (buttons) {
        this._buttonsMap    = {};
        this._defaultButton = null;

        YObject.each(buttons, function (sectionButtons, section) {
            var i, len;

            for (i = 0, len = sectionButtons.length; i < len; i += 1) {
                this._mapButton(sectionButtons[i], section);
            }
        }, this);
    },

    /**
    Returns a copy of the specified `config` object merged with any defaults
    provided by a `srcNode` and/or a predefined configuration for a button
    with the same `name` on the `BUTTONS` property.

    @method _mergeButtonConfig
    @param {Object|String} config Button configuration object, or string name.
    @return {Object} A copy of the button configuration object merged with any
        defaults.
    @protected
    @since 3.5.0
    **/
    _mergeButtonConfig: function (config) {
        var buttonConfig, defConfig, name, button, tagName, label;

        // Makes sure `config` is an Object and a copy of the specified value.
        config = isString(config) ? {name: config} : Y.merge(config);

        // Seeds default values from the button node, if there is one.
        if (config.srcNode) {
            button  = config.srcNode;
            tagName = button.get('tagName').toLowerCase();
            label   = button.get(tagName === 'input' ? 'value' : 'text');

            // Makes sure the button's current values override any defaults.
            buttonConfig = {
                disabled : !!button.get('disabled'),
                isDefault: this._getButtonDefault(button),
                name     : this._getButtonName(button)
            };

            // Label should only be considered when not an empty string.
            label && (buttonConfig.label = label);

            // Merge `config` with `buttonConfig` values.
            Y.mix(config, buttonConfig, false, null, 0, true);
        }

        name      = this._getButtonName(config);
        defConfig = this.BUTTONS && this.BUTTONS[name];

        // Merge `config` with predefined default values.
        if (defConfig) {
            Y.mix(config, defConfig, false, null, 0, true);
        }

        return config;
    },

    /**
    `HTML_PARSER` implementation for the `buttons` attribute.

    **Note:** To determine a button node's name its `data-name` and `name`
    attributes are examined. Whether the button should be the default is
    determined by its `data-default` attribute.

    @method _parseButtons
    @param {Node} srcNode This widget's srcNode to search for buttons.
    @return {null|Object} `buttons` Config object parsed from this widget's DOM.
    @protected
    @since 3.5.0
    **/
    _parseButtons: function (srcNode) {
        var buttonSelector = '.' + WidgetButtons.CLASS_NAMES.button,
            sections       = ['header', 'body', 'footer'],
            buttonsConfig  = null;

        YArray.each(sections, function (section) {
            var container = this._getButtonContainer(section),
                buttons   = container && container.all(buttonSelector),
                sectionButtons;

            if (!buttons || buttons.isEmpty()) { return; }

            sectionButtons = [];

            // Creates a button config object for every button node found and
            // adds it to the section. This way each button configuration can be
            // merged with any defaults provided by predefined `BUTTONS`.
            buttons.each(function (button) {
                sectionButtons.push({srcNode: button});
            });

            buttonsConfig || (buttonsConfig = {});
            buttonsConfig[section] = sectionButtons;
        }, this);

        return buttonsConfig;
    },

    /**
    Setter for the `buttons` attribute. This processes the specified `config`
    and returns a new `buttons` object which is stored as the new state; leaving
    the original, specified `config` unmodified.

    The button nodes will either be created via `Y.Plugin.Button.createNode()`,
    or when a button is already a Node already, it will by `plug()`ed with
    `Y.Plugin.Button`.

    @method _setButtons
    @param {Array|Object} config The `buttons` configuration to process.
    @return {Object} The processed `buttons` object which represents the new
        state.
    @protected
    @since 3.5.0
    **/
    _setButtons: function (config) {
        var defSection = this.DEFAULT_BUTTONS_SECTION,
            buttons    = {};

        function processButtons(buttonConfigs, currentSection) {
            if (!isArray(buttonConfigs)) { return; }

            var i, len, button, section;

            for (i = 0, len = buttonConfigs.length; i < len; i += 1) {
                button  = buttonConfigs[i];
                section = currentSection;

                if (!isNode(button)) {
                    button = this._mergeButtonConfig(button);
                    section || (section = button.section);
                }

                // Always passes through `_createButton()` to make sure the node
                // is decorated as a button.
                button = this._createButton(button);

                // Use provided `section` or fallback to the default section.
                section || (section = defSection);

                // Add button to the array of buttons for the specified section.
                (buttons[section] || (buttons[section] = [])).push(button);
            }
        }

        // Handle `config` being either an Array or Object of Arrays.
        if (isArray(config)) {
            processButtons.call(this, config);
        } else {
            YObject.each(config, processButtons, this);
        }

        return buttons;
    },

    /**
    Syncs this widget's current button-related state to its DOM. This method is
    inserted via AOP, and will execute after `syncUI()`.

    @method _syncUIButtons
    @protected
    @since 3.4.0
    **/
    _syncUIButtons: function () {
        this._uiSetButtons(this.get('buttons'));
        this._uiSetDefaultButton(this.get('defaultButton'));
        this._uiSetVisibleButtons(this.get('visible'));
    },

    /**
    Inserts the specified `button` node into this widget's DOM at the specified
    `section` and `index` and updates the section content.

    The section and button container nodes will be created if they do not
    already exist.

    @method _uiInsertButton
    @param {Node} button The button node to insert into this widget's DOM.
    @param {String} section The `WidgetStdMod` section (header/body/footer).
    @param {Number} index Index at which the `button` should be positioned.
    @protected
    @since 3.5.0
    **/
    _uiInsertButton: function (button, section, index) {
        var buttonsClassName = WidgetButtons.CLASS_NAMES.button,
            buttonContainer  = this._getButtonContainer(section, true),
            sectionButtons   = buttonContainer.all('.' + buttonsClassName);

        // Inserts the button node at the correct index.
        buttonContainer.insertBefore(button, sectionButtons.item(index));

        // Adds the button container to the section content.
        this.setStdModContent(section, buttonContainer, 'after');
    },

    /**
    Removes the button node from this widget's DOM and detaches any event
    subscriptions on the button that were created by this widget. The section
    content will be updated unless `{preserveContent: true}` is passed in the
    `options`.

    By default the button container node will be removed when this removes the
    last button of the specified `section`; and if no other content remains in
    the section node, it will also be removed.

    @method _uiRemoveButton
    @param {Node} button The button to remove and destroy.
    @param {String} section The `WidgetStdMod` section (header/body/footer).
    @param {Object} [options] Additional options.
      @param {Boolean} [options.preserveContent=false] Whether the section
        content should be updated.
    @protected
    @since 3.5.0
    **/
    _uiRemoveButton: function (button, section, options) {
        var yuid    = Y.stamp(button, this),
            handles = this._buttonsHandles,
            handle  = handles[yuid],
            buttonContainer, buttonClassName;

        if (handle) {
            handle.detach();
        }

        delete handles[yuid];

        button.remove();

        options || (options = {});

        // Remove the button container and section nodes if needed.
        if (!options.preserveContent) {
            buttonContainer = this._getButtonContainer(section);
            buttonClassName = WidgetButtons.CLASS_NAMES.button;

            // Only matters if we have a button container which is empty.
            if (buttonContainer &&
                    buttonContainer.all('.' + buttonClassName).isEmpty()) {

                buttonContainer.remove();
                this._updateContentButtons(section);
            }
        }
    },

    /**
    Sets the current `buttons` state to this widget's DOM by rendering the
    specified collection of `buttons` and updates the contents of each section
    as needed.

    Button nodes which already exist in the DOM will remain intact, or will be
    moved if they should be in a new position. Old button nodes which are no
    longer represented in the specified `buttons` collection will be removed,
    and any event subscriptions on the button which were created by this widget
    will be detached.

    If the button nodes in this widget's DOM actually change, then each content
    section will be updated (or removed) appropriately.

    @method _uiSetButtons
    @param {Object} buttons The current `buttons` state to visually represent.
    @protected
    @since 3.5.0
    **/
    _uiSetButtons: function (buttons) {
        var buttonClassName = WidgetButtons.CLASS_NAMES.button,
            sections        = ['header', 'body', 'footer'];

        YArray.each(sections, function (section) {
            var sectionButtons  = buttons[section] || [],
                numButtons      = sectionButtons.length,
                buttonContainer = this._getButtonContainer(section, numButtons),
                buttonsUpdated  = false,
                oldNodes, i, button, buttonIndex;

            // When there's no button container, there are no new buttons or old
            // buttons that we have to deal with for this section.
            if (!buttonContainer) { return; }

            oldNodes = buttonContainer.all('.' + buttonClassName);

            for (i = 0; i < numButtons; i += 1) {
                button      = sectionButtons[i];
                buttonIndex = oldNodes.indexOf(button);

                // Buttons already rendered in the Widget should remain there or
                // moved to their new index. New buttons will be added to the
                // current `buttonContainer`.
                if (buttonIndex > -1) {
                    // Remove button from existing buttons nodeList since its in
                    // the DOM already.
                    oldNodes.splice(buttonIndex, 1);

                    // Check that the button is at the right position, if not,
                    // move it to its new position.
                    if (buttonIndex !== i) {
                        // Using `i + 1` because the button should be at index
                        // `i`; it's inserted before the node which comes after.
                        buttonContainer.insertBefore(button, i + 1);
                        buttonsUpdated = true;
                    }
                } else {
                    buttonContainer.appendChild(button);
                    buttonsUpdated = true;
                }
            }

            // Safely removes the old button nodes which are no longer part of
            // this widget's `buttons`.
            oldNodes.each(function (button) {
                this._uiRemoveButton(button, section, {preserveContent: true});
                buttonsUpdated = true;
            }, this);

            // Remove leftover empty button containers and updated the StdMod
            // content area.
            if (numButtons === 0) {
                buttonContainer.remove();
                this._updateContentButtons(section);
                return;
            }

            // Adds the button container to the section content.
            if (buttonsUpdated) {
                this.setStdModContent(section, buttonContainer, 'after');
            }
        }, this);
    },

    /**
    Adds the "yui3-button-primary" CSS class to the new `defaultButton` and
    removes it from the old default button.

    @method _uiSetDefaultButton
    @param {Node} newButton The new `defaultButton`.
    @param {Node} oldButton The old `defaultButton`.
    @protected
    @since 3.5.0
    **/
    _uiSetDefaultButton: function (newButton, oldButton) {
        var primaryClassName = WidgetButtons.CLASS_NAMES.primary;

        if (newButton) { newButton.addClass(primaryClassName); }
        if (oldButton) { oldButton.removeClass(primaryClassName); }
    },

    /**
    Focuses this widget's `defaultButton` if there is one and this widget is
    visible.

    @method _uiSetVisibleButtons
    @param {Boolean} visible Whether this widget is visible.
    @protected
    @since 3.5.0
    **/
    _uiSetVisibleButtons: function (visible) {
        if (!visible) { return; }

        var defaultButton = this.get('defaultButton');
        if (defaultButton) {
            defaultButton.focus();
        }
    },

    /**
    Removes the specified `button` from the buttons map (both name -> button and
    section:name -> button), and nulls-out the `defaultButton` if it is
    currently the default button.

    @method _unMapButton
    @param {Node} button The button node to remove from the buttons map.
    @param {String} section The `WidgetStdMod` section (header/body/footer).
    @protected
    @since 3.5.0
    **/
    _unMapButton: function (button, section) {
        var map  = this._buttonsMap,
            name = this._getButtonName(button),
            sectionName;

        // Only delete the map entry if the specified `button` is mapped to it.
        if (name) {
            // name -> button
            if (map[name] === button) {
                delete map[name];
            }

            // section:name -> button
            sectionName = section + ':' + name;
            if (map[sectionName] === button) {
                delete map[sectionName];
            }
        }

        // Clear the default button if its the specified `button`.
        if (this._defaultButton === button) {
            this._defaultButton = null;
        }
    },

    /**
    Updates the `defaultButton` attribute if it needs to be updated by comparing
    its current value with the protected `_defaultButton` property.

    @method _updateDefaultButton
    @protected
    @since 3.5.0
    **/
    _updateDefaultButton: function () {
        var defaultButton = this._defaultButton;

        if (this.get('defaultButton') !== defaultButton) {
            this._set('defaultButton', defaultButton);
        }
    },

    /**
    Updates the content attribute which corresponds to the specified `section`.

    The method updates the section's content to its current `childNodes`
    (text and/or HTMLElement), or will null-out its contents if the section is
    empty. It also specifies a `src` of `buttons` on the change event facade.

    @method _updateContentButtons
    @param {String} section The `WidgetStdMod` section (header/body/footer) to
        update.
    @protected
    @since 3.5.0
    **/
    _updateContentButtons: function (section) {
        // `childNodes` return text nodes and HTMLElements.
        var sectionContent = this.getStdModNode(section).get('childNodes');

        // Updates the section to its current contents, or null if it is empty.
        this.set(section + 'Content', sectionContent.isEmpty() ? null :
            sectionContent, {src: 'buttons'});
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    Handles this widget's `buttonsChange` event which fires anytime the
    `buttons` attribute is modified.

    **Note:** This method special-cases the `buttons` modifications caused by
    `addButton()` and `removeButton()`, both of which set the `src` property on
    the event facade to "add" and "remove" respectively.

    @method _afterButtonsChange
    @param {EventFacade} e
    @protected
    @since 3.4.0
    **/
    _afterButtonsChange: function (e) {
        var buttons = e.newVal,
            section = e.section,
            index   = e.index,
            src     = e.src,
            button;

        // Special cases `addButton()` to only set and insert the new button.
        if (src === 'add') {
            // Make sure we have the button node.
            button = buttons[section][index];

            this._mapButton(button, section);
            this._updateDefaultButton();
            this._uiInsertButton(button, section, index);

            return;
        }

        // Special cases `removeButton()` to only remove the specified button.
        if (src === 'remove') {
            // Button node already exists on the event facade.
            button = e.button;

            this._unMapButton(button, section);
            this._updateDefaultButton();
            this._uiRemoveButton(button, section);

            return;
        }

        this._mapButtons(buttons);
        this._updateDefaultButton();
        this._uiSetButtons(buttons);
    },

    /**
    Handles this widget's `headerContentChange`, `bodyContentChange`,
    `footerContentChange` events by making sure the `buttons` remain rendered
    after changes to the content areas.

    These events are very chatty, so extra caution is taken to avoid doing extra
    work or getting into an infinite loop.

    @method _afterContentChangeButtons
    @param {EventFacade} e
    @protected
    @since 3.5.0
    **/
    _afterContentChangeButtons: function (e) {
        var src     = e.src,
            pos     = e.stdModPosition,
            replace = !pos || pos === WidgetStdMod.REPLACE;

        // Only do work when absolutely necessary.
        if (replace && src !== 'buttons' && src !== Widget.UI_SRC) {
            this._uiSetButtons(this.get('buttons'));
        }
    },

    /**
    Handles this widget's `defaultButtonChange` event by adding the
    "yui3-button-primary" CSS class to the new `defaultButton` and removing it
    from the old default button.

    @method _afterDefaultButtonChange
    @param {EventFacade} e
    @protected
    @since 3.5.0
    **/
    _afterDefaultButtonChange: function (e) {
        this._uiSetDefaultButton(e.newVal, e.prevVal);
    },

    /**
    Handles this widget's `visibleChange` event by focusing the `defaultButton`
    if there is one.

    @method _afterVisibleChangeButtons
    @param {EventFacade} e
    @protected
    @since 3.5.0
    **/
    _afterVisibleChangeButtons: function (e) {
        this._uiSetVisibleButtons(e.newVal);
    }
};

Y.WidgetButtons = WidgetButtons;


}, '3.8.1', {"requires": ["button-plugin", "cssbutton", "widget-stdmod"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-modality', function (Y, NAME) {

/**
 * Provides modality support for Widgets, though an extension
 *
 * @module widget-modality
 */

var WIDGET       = 'widget',
    RENDER_UI    = 'renderUI',
    BIND_UI      = 'bindUI',
    SYNC_UI      = 'syncUI',
    BOUNDING_BOX = 'boundingBox',
    CONTENT_BOX  = 'contentBox',
    VISIBLE      = 'visible',
    Z_INDEX      = 'zIndex',
    CHANGE       = 'Change',
    isBoolean    = Y.Lang.isBoolean,
    getCN        = Y.ClassNameManager.getClassName,
    MaskShow     = "maskShow",
    MaskHide     = "maskHide",
    ClickOutside = "clickoutside",
    FocusOutside = "focusoutside",

    supportsPosFixed = (function(){

        /*! IS_POSITION_FIXED_SUPPORTED - Juriy Zaytsev (kangax) - http://yura.thinkweb2.com/cft/ */

        var doc         = Y.config.doc,
            isSupported = null,
            el, root;

        if (doc.createElement) {
            el = doc.createElement('div');
            if (el && el.style) {
                el.style.position = 'fixed';
                el.style.top = '10px';
                root = doc.body;
                if (root && root.appendChild && root.removeChild) {
                    root.appendChild(el);
                    isSupported = (el.offsetTop === 10);
                    root.removeChild(el);
                }
            }
        }

        return isSupported;
    }());

    /**
     * Widget extension, which can be used to add modality support to the base Widget class,
     * through the Base.create method.
     *
     * @class WidgetModality
     * @param {Object} config User configuration object
     */
    function WidgetModal(config) {}

    var MODAL           = 'modal',
        MASK            = 'mask',
        MODAL_CLASSES   = {
            modal   : getCN(WIDGET, MODAL),
            mask    : getCN(WIDGET, MASK)
        };

    /**
    * Static property used to define the default attribute
    * configuration introduced by WidgetModality.
    *
    * @property ATTRS
    * @static
    * @type Object
    */
    WidgetModal.ATTRS = {
            /**
             * @attribute maskNode
             * @type Y.Node
             *
             * @description Returns a Y.Node instance of the node being used as the mask.
             */
            maskNode : {
                getter      : '_getMaskNode',
                readOnly    : true
            },


            /**
             * @attribute modal
             * @type boolean
             *
             * @description Whether the widget should be modal or not.
             */
            modal: {
                value:false,
                validator: isBoolean
            },

            /**
             * @attribute focusOn
             * @type array
             *
             * @description An array of objects corresponding to the nodes and events that will trigger a re-focus back on the widget.
             * The implementer can supply an array of objects, with each object having the following properties:
             * <p>eventName: (string, required): The eventName to listen to.</p>
             * <p>node: (Y.Node, optional): The Y.Node that will fire the event (defaults to the boundingBox of the widget)</p>
             * <p>By default, this attribute consists of two objects which will cause the widget to re-focus if anything
             * outside the widget is clicked on or focussed upon.</p>
             */
            focusOn: {
                valueFn: function() {
                    return [
                        {
                            // node: this.get(BOUNDING_BOX),
                            eventName: ClickOutside
                        },
                        {
                            //node: this.get(BOUNDING_BOX),
                            eventName: FocusOutside
                        }
                    ];
                },

                validator: Y.Lang.isArray
            }

    };


    WidgetModal.CLASSES = MODAL_CLASSES;


    /**
     * Returns the mask if it exists on the page - otherwise creates a mask. There's only
     * one mask on a page at a given time.
     * <p>
     * This method in invoked internally by the getter of the maskNode ATTR.
     * </p>
     * @method _GET_MASK
     * @static
     */
    WidgetModal._GET_MASK = function() {

        var mask = Y.one('.' + MODAL_CLASSES.mask),
            win  = Y.one('win');

        if (mask) {
            return mask;
        }

        mask = Y.Node.create('<div></div>').addClass(MODAL_CLASSES.mask);

        if (supportsPosFixed) {
            mask.setStyles({
                position: 'fixed',
                width   : '100%',
                height  : '100%',
                top     : '0',
                left    : '0',
                display : 'block'
            });
        } else {
            mask.setStyles({
                position: 'absolute',
                width   : win.get('winWidth') +'px',
                height  : win.get('winHeight') + 'px',
                top     : '0',
                left    : '0',
                display : 'block'
            });
        }

        return mask;
    };

    /**
     * A stack of Y.Widget objects representing the current hierarchy of modal widgets presently displayed on the screen
     * @property STACK
     */
    WidgetModal.STACK = [];


    WidgetModal.prototype = {

        initializer: function () {
            Y.after(this._renderUIModal, this, RENDER_UI);
            Y.after(this._syncUIModal, this, SYNC_UI);
            Y.after(this._bindUIModal, this, BIND_UI);
        },

        destructor: function () {
            // Hack to remove this thing from the STACK.
            this._uiSetHostVisibleModal(false);
        },

        // *** Instance Members *** //

        _uiHandlesModal: null,


        /**
         * Adds modal class to the bounding box of the widget
         * <p>
         * This method in invoked after renderUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _renderUIModal
         * @protected
         */
        _renderUIModal : function () {

            var bb = this.get(BOUNDING_BOX);
                //cb = this.get(CONTENT_BOX);

            //this makes the content box content appear over the mask
            // cb.setStyles({
            //     position: ""
            // });

            this._repositionMask(this);
            bb.addClass(MODAL_CLASSES.modal);

        },


        /**
         * Hooks up methods to be executed when the widget's visibility or z-index changes
         * <p>
         * This method in invoked after bindUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _bindUIModal
         * @protected
         */
        _bindUIModal : function () {

            this.after(VISIBLE+CHANGE, this._afterHostVisibleChangeModal);
            this.after(Z_INDEX+CHANGE, this._afterHostZIndexChangeModal);
            this.after("focusOnChange", this._afterFocusOnChange);

            // Re-align the mask in the viewport if `position: fixed;` is not
            // supported. iOS < 5 and Android < 3 don't actually support it even
            // though they both pass the feature test; the UA sniff is here to
            // account for that. Ideally this should be replaced with a better
            // feature test.
            if (!supportsPosFixed ||
                    (Y.UA.ios && Y.UA.ios < 5) ||
                    (Y.UA.android && Y.UA.android < 3)) {

                Y.one('win').on('scroll', this._resyncMask, this);
            }
        },

        /**
         * Syncs the mask with the widget's current state, namely the visibility and z-index of the widget
         * <p>
         * This method in invoked after syncUI is invoked for the Widget class
         * using YUI's aop infrastructure.
         * </p>
         * @method _syncUIModal
         * @protected
         */
        _syncUIModal : function () {

            //var host = this.get(HOST);

            this._uiSetHostVisibleModal(this.get(VISIBLE));
            this._uiSetHostZIndexModal(this.get(Z_INDEX));

        },

        /**
         * Provides mouse and tab focus to the widget's bounding box.
         *
         * @method _focus
         */
        _focus : function (e) {

            var bb = this.get(BOUNDING_BOX),
            oldTI = bb.get('tabIndex');

            bb.set('tabIndex', oldTI >= 0 ? oldTI : 0);
            this.focus();
        },
        /**
         * Blurs the widget.
         *
         * @method _blur
         */
        _blur : function () {

            this.blur();
        },

        /**
         * Returns the Y.Node instance of the maskNode
         *
         * @method _getMaskNode
         * @return {Node} The Y.Node instance of the mask, as returned from WidgetModal._GET_MASK
         */
        _getMaskNode : function () {

            return WidgetModal._GET_MASK();
        },

        /**
         * Performs events attaching/detaching, stack shifting and mask repositioning based on the visibility of the widget
         *
         * @method _uiSetHostVisibleModal
         * @param {boolean} Whether the widget is visible or not
         */
        _uiSetHostVisibleModal : function (visible) {
            var stack    = WidgetModal.STACK,
                maskNode = this.get('maskNode'),
                isModal  = this.get('modal'),
                topModal, index;

            if (visible) {

                Y.Array.each(stack, function(modal){
                    modal._detachUIHandlesModal();
                    modal._blur();
                });

                // push on top of stack
                stack.unshift(this);

                this._repositionMask(this);
                this._uiSetHostZIndexModal(this.get(Z_INDEX));

                if (isModal) {
                    maskNode.show();
                    Y.later(1, this, '_attachUIHandlesModal');
                    this._focus();
                }


            } else {

                index = Y.Array.indexOf(stack, this);
                if (index >= 0) {
                    // Remove modal widget from global stack.
                    stack.splice(index, 1);
                }

                this._detachUIHandlesModal();
                this._blur();

                if (stack.length) {
                    topModal = stack[0];
                    this._repositionMask(topModal);
                    //topModal._attachUIHandlesModal();
                    topModal._uiSetHostZIndexModal(topModal.get(Z_INDEX));

                    if (topModal.get('modal')) {
                        //topModal._attachUIHandlesModal();
                        Y.later(1, topModal, '_attachUIHandlesModal');
                        topModal._focus();
                    }

                } else {

                    if (maskNode.getStyle('display') === 'block') {
                        maskNode.hide();
                    }

                }

            }
        },

        /**
         * Sets the z-index of the mask node.
         *
         * @method _uiSetHostZIndexModal
         * @param {Number} Z-Index of the widget
         */
        _uiSetHostZIndexModal : function (zIndex) {

            if (this.get('modal')) {
                this.get('maskNode').setStyle(Z_INDEX, zIndex || 0);
            }

        },

        /**
         * Attaches UI Listeners for "clickoutside" and "focusoutside" on the
         * widget. When these events occur, and the widget is modal, focus is
         * shifted back onto the widget.
         *
         * @method _attachUIHandlesModal
         */
        _attachUIHandlesModal : function () {

            if (this._uiHandlesModal || WidgetModal.STACK[0] !== this) {
                // Quit early if we have ui handles, or if we not at the top
                // of the global stack.
                return;
            }

            var bb          = this.get(BOUNDING_BOX),
                maskNode    = this.get('maskNode'),
                focusOn     = this.get('focusOn'),
                focus       = Y.bind(this._focus, this),
                uiHandles   = [],
                i, len, o;

            for (i = 0, len = focusOn.length; i < len; i++) {

                o = {};
                o.node = focusOn[i].node;
                o.ev = focusOn[i].eventName;
                o.keyCode = focusOn[i].keyCode;

                //no keycode or node defined
                if (!o.node && !o.keyCode && o.ev) {
                    uiHandles.push(bb.on(o.ev, focus));
                }

                //node defined, no keycode (not a keypress)
                else if (o.node && !o.keyCode && o.ev) {
                    uiHandles.push(o.node.on(o.ev, focus));
                }

                //node defined, keycode defined, event defined (its a key press)
                else if (o.node && o.keyCode && o.ev) {
                    uiHandles.push(o.node.on(o.ev, focus, o.keyCode));
                }

                else {
                    Y.Log('focusOn ATTR Error: The event with name "'+o.ev+'" could not be attached.');
                }

            }

            if ( ! supportsPosFixed) {
                uiHandles.push(Y.one('win').on('scroll', Y.bind(function(e){
                    maskNode.setStyle('top', maskNode.get('docScrollY'));
                }, this)));
            }

            this._uiHandlesModal = uiHandles;
        },

        /**
         * Detaches all UI Listeners that were set in _attachUIHandlesModal from the widget.
         *
         * @method _detachUIHandlesModal
         */
        _detachUIHandlesModal : function () {
            Y.each(this._uiHandlesModal, function(h){
                h.detach();
            });
            this._uiHandlesModal = null;
        },

        /**
         * Default function that is called when visibility is changed on the widget.
         *
         * @method _afterHostVisibleChangeModal
         * @param {EventFacade} e The event facade of the change
         */
        _afterHostVisibleChangeModal : function (e) {

            this._uiSetHostVisibleModal(e.newVal);
        },

        /**
         * Default function that is called when z-index is changed on the widget.
         *
         * @method _afterHostZIndexChangeModal
         * @param {EventFacade} e The event facade of the change
         */
        _afterHostZIndexChangeModal : function (e) {

            this._uiSetHostZIndexModal(e.newVal);
        },

        /**
         * Returns a boolean representing whether the current widget is in a "nested modality" state.
         * This is done by checking the number of widgets currently on the stack.
         *
         * @method isNested
         * @public
         */
        isNested: function() {
            var length = WidgetModal.STACK.length,
            retval = (length > 1) ? true : false;
            return retval;
        },

        /**
         * Repositions the mask in the DOM for nested modality cases.
         *
         * @method _repositionMask
         * @param {Widget} nextElem The Y.Widget instance that will be visible in the stack once the current widget is closed.
         */
        _repositionMask: function(nextElem) {

            var currentModal = this.get('modal'),
                nextModal    = nextElem.get('modal'),
                maskNode     = this.get('maskNode'),
                bb, bbParent;

            //if this is modal and host is not modal
            if (currentModal && !nextModal) {
                //leave the mask where it is, since the host is not modal.
                maskNode.remove();
                this.fire(MaskHide);
            }

            //if the main widget is not modal but the host is modal, or both of them are modal
            else if ((!currentModal && nextModal) || (currentModal && nextModal)) {

                //then remove the mask off DOM, reposition it, and reinsert it into the DOM
                maskNode.remove();
                this.fire(MaskHide);
                bb = nextElem.get(BOUNDING_BOX);
                bbParent = bb.get('parentNode') || Y.one('body');
                bbParent.insert(maskNode, bbParent.get('firstChild'));
                this.fire(MaskShow);
            }

        },

        /**
         * Resyncs the mask in the viewport for browsers that don't support fixed positioning
         *
         * @method _resyncMask
         * @param {Y.Widget} nextElem The Y.Widget instance that will be visible in the stack once the current widget is closed.
         * @private
         */
        _resyncMask: function (e) {
            var o       = e.currentTarget,
                offsetX = o.get('docScrollX'),
                offsetY = o.get('docScrollY'),
                w       = o.get('innerWidth') || o.get('winWidth'),
                h       = o.get('innerHeight') || o.get('winHeight'),
                mask    = this.get('maskNode');

            mask.setStyles({
                "top": offsetY + "px",
                "left": offsetX + "px",
                "width": w + 'px',
                "height": h + 'px'
            });
        },

        /**
         * Default function called when focusOn Attribute is changed. Remove existing listeners and create new listeners.
         *
         * @method _afterFocusOnChange
         */
        _afterFocusOnChange : function(e) {
            this._detachUIHandlesModal();

            if (this.get(VISIBLE)) {
                this._attachUIHandlesModal();
            }
        }
    };

    Y.WidgetModality = WidgetModal;



}, '3.8.1', {"requires": ["base-build", "event-outside", "widget"], "skinnable": true});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-position-align', function (Y, NAME) {

/**
Provides extended/advanced XY positioning support for Widgets, through an
extension.

It builds on top of the `widget-position` module, to provide alignment and
centering support. Future releases aim to add constrained and fixed positioning
support.

@module widget-position-align
**/
var Lang = Y.Lang,

    ALIGN        = 'align',
    ALIGN_ON     = 'alignOn',

    VISIBLE      = 'visible',
    BOUNDING_BOX = 'boundingBox',

    OFFSET_WIDTH    = 'offsetWidth',
    OFFSET_HEIGHT   = 'offsetHeight',
    REGION          = 'region',
    VIEWPORT_REGION = 'viewportRegion';

/**
Widget extension, which can be used to add extended XY positioning support to
the base Widget class, through the `Base.create` method.

**Note:** This extension requires that the `WidgetPosition` extension be added
to the Widget (before `WidgetPositionAlign`, if part of the same extension list
passed to `Base.build`).

@class WidgetPositionAlign
@param {Object} config User configuration object.
@constructor
**/
function PositionAlign (config) {
    if ( ! this._posNode) {
        Y.error('WidgetPosition needs to be added to the Widget, ' + 
            'before WidgetPositionAlign is added'); 
    }

    Y.after(this._bindUIPosAlign, this, 'bindUI');
    Y.after(this._syncUIPosAlign, this, 'syncUI');
}

PositionAlign.ATTRS = {

    /**
    The alignment configuration for this widget.

    The `align` attribute is used to align a reference point on the widget, with
    the reference point on another `Node`, or the viewport. The object which
    `align` expects has the following properties:

      * __`node`__: The `Node` to which the widget is to be aligned. If set to
        `null`, or not provided, the widget is aligned to the viewport.
    
      * __`points`__: A two element Array, defining the two points on the widget
        and `Node`/viewport which are to be aligned. The first element is the
        point on the widget, and the second element is the point on the
        `Node`/viewport. Supported alignment points are defined as static
        properties on `WidgetPositionAlign`.
    
    @example Aligns the top-right corner of the widget with the top-left corner 
    of the viewport:

        myWidget.set('align', {
            points: [Y.WidgetPositionAlign.TR, Y.WidgetPositionAlign.TL]
        });
    
    @attribute align
    @type Object
    @default null
    **/
    align: {
        value: null
    },

    /**
    A convenience Attribute, which can be used as a shortcut for the `align` 
    Attribute.
    
    If set to `true`, the widget is centered in the viewport. If set to a `Node` 
    reference or valid selector String, the widget will be centered within the 
    `Node`. If set to `false`, no center positioning is applied.

    @attribute centered
    @type Boolean|Node
    @default false
    **/
    centered: {
        setter : '_setAlignCenter',
        lazyAdd:false,
        value  :false
    },

    /**
    An Array of Objects corresponding to the `Node`s and events that will cause
    the alignment of this widget to be synced to the DOM.

    The `alignOn` Attribute is expected to be an Array of Objects with the 
    following properties:

      * __`eventName`__: The String event name to listen for.

      * __`node`__: The optional `Node` that will fire the event, it can be a 
        `Node` reference or a selector String. This will default to the widget's 
        `boundingBox`.

    @example Sync this widget's alignment on window resize:

        myWidget.set('alignOn', [
            {
                node     : Y.one('win'),
                eventName: 'resize'
            }
        ]);

    @attribute alignOn
    @type Array
    @default []
    **/
    alignOn: {
        value    : [],
        validator: Y.Lang.isArray
    }
};

/**
Constant used to specify the top-left corner for alignment

@property TL
@type String
@value 'tl'
@static
**/
PositionAlign.TL = 'tl';

/**
Constant used to specify the top-right corner for alignment
 
@property TR
@type String
@value 'tr'
@static
**/
PositionAlign.TR = 'tr';

/**
Constant used to specify the bottom-left corner for alignment
 
@property BL
@type String
@value 'bl'
@static
**/
PositionAlign.BL = 'bl';

/**
Constant used to specify the bottom-right corner for alignment

@property BR
@type String
@value 'br'
@static
**/
PositionAlign.BR = 'br';

/**
Constant used to specify the top edge-center point for alignment

@property TC
@type String
@value 'tc'
@static
**/
PositionAlign.TC = 'tc';

/**
Constant used to specify the right edge, center point for alignment
 
@property RC
@type String
@value 'rc'
@static
**/
PositionAlign.RC = 'rc';

/**
Constant used to specify the bottom edge, center point for alignment
 
@property BC
@type String
@value 'bc'
@static
**/
PositionAlign.BC = 'bc';

/**
Constant used to specify the left edge, center point for alignment
 
@property LC
@type String
@value 'lc'
@static
**/
PositionAlign.LC = 'lc';

/**
Constant used to specify the center of widget/node/viewport for alignment

@property CC
@type String
@value 'cc'
@static
*/
PositionAlign.CC = 'cc';

PositionAlign.prototype = {
    // -- Protected Properties -------------------------------------------------

    /**
    Holds the alignment-syncing event handles.

    @property _posAlignUIHandles
    @type Array
    @default null
    @protected
    **/
    _posAlignUIHandles: null,

    // -- Lifecycle Methods ----------------------------------------------------

    destructor: function () {
        this._detachPosAlignUIHandles();
    },

    /**
    Bind event listeners responsible for updating the UI state in response to
    the widget's position-align related state changes.

    This method is invoked after `bindUI` has been invoked for the `Widget`
    class using the AOP infrastructure.

    @method _bindUIPosAlign
    @protected
    **/
    _bindUIPosAlign: function () {
        this.after('alignChange', this._afterAlignChange);
        this.after('alignOnChange', this._afterAlignOnChange);
        this.after('visibleChange', this._syncUIPosAlign);
    },

    /**
    Synchronizes the current `align` Attribute value to the DOM.

    This method is invoked after `syncUI` has been invoked for the `Widget`
    class using the AOP infrastructure.

    @method _syncUIPosAlign
    @protected
    **/
    _syncUIPosAlign: function () {
        var align = this.get(ALIGN);

        this._uiSetVisiblePosAlign(this.get(VISIBLE));

        if (align) {
            this._uiSetAlign(align.node, align.points);
        }
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Aligns this widget to the provided `Node` (or viewport) using the provided
    points. This method can be invoked with no arguments which will cause the 
    widget's current `align` Attribute value to be synced to the DOM.

    @example Aligning to the top-left corner of the `<body>`:

        myWidget.align('body',
            [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.TR]);

    @method align
    @param {Node|String|null} [node] A reference (or selector String) for the
      `Node` which with the widget is to be aligned. If null is passed in, the
      widget will be aligned with the viewport.
    @param {Array[2]} [points] A two item array specifying the points on the 
      widget and `Node`/viewport which will to be aligned. The first entry is 
      the point on the widget, and the second entry is the point on the 
      `Node`/viewport. Valid point references are defined as static constants on 
      the `WidgetPositionAlign` extension.
    @chainable
    **/
    align: function (node, points) {
        if (arguments.length) {
            // Set the `align` Attribute.
            this.set(ALIGN, {
                node  : node,
                points: points
            });
        } else {
            // Sync the current `align` Attribute value to the DOM.
            this._syncUIPosAlign();
        }

        return this;
    },

    /**
    Centers the widget in the viewport, or if a `Node` is passed in, it will 
    be centered to that `Node`.

    @method centered
    @param {Node|String} [node] A `Node` reference or selector String defining 
      the `Node` which the widget should be centered. If a `Node` is not  passed
      in, then the widget will be centered to the viewport.
    @chainable
    **/
    centered: function (node) {
        return this.align(node, [PositionAlign.CC, PositionAlign.CC]);
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    Default setter for `center` Attribute changes. Sets up the appropriate
    value, and passes it through the to the align attribute.

    @method _setAlignCenter
    @param {Boolean|Node} val The Attribute value being set.
    @return {Boolean|Node} the value passed in.
    @protected
    **/
    _setAlignCenter: function (val) {
        if (val) {
            this.set(ALIGN, {
                node  : val === true ? null : val,
                points: [PositionAlign.CC, PositionAlign.CC]
            });
        }

        return val;
    },

    /**
    Updates the UI to reflect the `align` value passed in.

    **Note:** See the `align` Attribute documentation, for the Object structure
    expected.

    @method _uiSetAlign
    @param {Node|String|null} [node] The node to align to, or null to indicate
      the viewport.
    @param {Array} points The alignment points.
    @protected
    **/
    _uiSetAlign: function (node, points) {
        if ( ! Lang.isArray(points) || points.length !== 2) {
            Y.error('align: Invalid Points Arguments');
            return;
        }

        var nodeRegion = this._getRegion(node), 
            widgetPoint, nodePoint, xy;

        if ( ! nodeRegion) {
            // No-op, nothing to align to.
            return;
        }

        widgetPoint = points[0];
        nodePoint   = points[1];

        // TODO: Optimize KWeight - Would lookup table help?
        switch (nodePoint) {
        case PositionAlign.TL:
            xy = [nodeRegion.left, nodeRegion.top];
            break;

        case PositionAlign.TR:
            xy = [nodeRegion.right, nodeRegion.top];
            break;

        case PositionAlign.BL:
            xy = [nodeRegion.left, nodeRegion.bottom];
            break;

        case PositionAlign.BR:
            xy = [nodeRegion.right, nodeRegion.bottom];
            break;

        case PositionAlign.TC:
            xy = [
                nodeRegion.left + Math.floor(nodeRegion.width / 2),
                nodeRegion.top
            ];
            break;

        case PositionAlign.BC:
            xy = [
                nodeRegion.left + Math.floor(nodeRegion.width / 2),
                nodeRegion.bottom
            ];
            break;

        case PositionAlign.LC:
            xy = [
                nodeRegion.left,
                nodeRegion.top + Math.floor(nodeRegion.height / 2)
            ];
            break;

        case PositionAlign.RC:
            xy = [
                nodeRegion.right,
                nodeRegion.top + Math.floor(nodeRegion.height / 2)
            ];
            break;

        case PositionAlign.CC:
            xy = [
                nodeRegion.left + Math.floor(nodeRegion.width / 2),
                nodeRegion.top + Math.floor(nodeRegion.height / 2)
            ];
            break;

        default:
            break;

        }

        if (xy) {
            this._doAlign(widgetPoint, xy[0], xy[1]);
        }
    },

    /**
    Attaches or detaches alignment-syncing event handlers based on the widget's
    `visible` Attribute state.

    @method _uiSetVisiblePosAlign
    @param {Boolean} visible The current value of the widget's `visible`
      Attribute.
    @protected
    **/
    _uiSetVisiblePosAlign: function (visible) {
        if (visible) {
            this._attachPosAlignUIHandles();
        } else {
            this._detachPosAlignUIHandles();
        }
    },

    /**
    Attaches the alignment-syncing event handlers.

    @method _attachPosAlignUIHandles
    @protected
    **/
    _attachPosAlignUIHandles: function () {
        if (this._posAlignUIHandles) {
            // No-op if we have already setup the event handlers.
            return;
        }

        var bb        = this.get(BOUNDING_BOX),
            syncAlign = Y.bind(this._syncUIPosAlign, this),
            handles   = [];

        Y.Array.each(this.get(ALIGN_ON), function (o) {
            var event = o.eventName,
                node  = Y.one(o.node) || bb;
            
            if (event) {
                handles.push(node.on(event, syncAlign));
            }
        });

        this._posAlignUIHandles = handles;
    },

    /**
    Detaches the alignment-syncing event handlers.

    @method _detachPosAlignUIHandles
    @protected
    **/
    _detachPosAlignUIHandles: function () {
        var handles = this._posAlignUIHandles;
        if (handles) {
            new Y.EventHandle(handles).detach();
            this._posAlignUIHandles = null;
        }
    },

    // -- Private Methods ------------------------------------------------------

    /**
    Helper method, used to align the given point on the widget, with the XY page
    coordinates provided.

    @method _doAlign
    @param {String} widgetPoint Supported point constant
      (e.g. WidgetPositionAlign.TL)
    @param {Number} x X page coordinate to align to.
    @param {Number} y Y page coordinate to align to.
    @private
    **/
    _doAlign: function (widgetPoint, x, y) {
        var widgetNode = this._posNode,
            xy;

        switch (widgetPoint) {
        case PositionAlign.TL:
            xy = [x, y];
            break;

        case PositionAlign.TR:
            xy = [
                x - widgetNode.get(OFFSET_WIDTH),
                y
            ];
            break;

        case PositionAlign.BL:
            xy = [
                x,
                y - widgetNode.get(OFFSET_HEIGHT)
            ];
            break;

        case PositionAlign.BR:
            xy = [
                x - widgetNode.get(OFFSET_WIDTH),
                y - widgetNode.get(OFFSET_HEIGHT)
            ];
            break;

        case PositionAlign.TC:
            xy = [
                x - (widgetNode.get(OFFSET_WIDTH) / 2),
                y
            ];
            break;

        case PositionAlign.BC:
            xy = [
                x - (widgetNode.get(OFFSET_WIDTH) / 2),
                y - widgetNode.get(OFFSET_HEIGHT)
            ];
            break;

        case PositionAlign.LC:
            xy = [
                x,
                y - (widgetNode.get(OFFSET_HEIGHT) / 2)
            ];
            break;

        case PositionAlign.RC:
            xy = [
                x - widgetNode.get(OFFSET_WIDTH),
                y - (widgetNode.get(OFFSET_HEIGHT) / 2)
            ];
            break;

        case PositionAlign.CC:
            xy = [
                x - (widgetNode.get(OFFSET_WIDTH) / 2),
                y - (widgetNode.get(OFFSET_HEIGHT) / 2)
            ];
            break;

        default:
            break;

        }

        if (xy) {
            this.move(xy);
        }
    },

    /**
    Returns the region of the passed-in `Node`, or the viewport region if
    calling with passing in a `Node`.

    @method _getRegion
    @param {Node} [node] The node to get the region of.
    @return {Object} The node's region.
    @private
    **/
    _getRegion: function (node) {
        var nodeRegion;

        if ( ! node) {
            nodeRegion = this._posNode.get(VIEWPORT_REGION);
        } else {
            node = Y.Node.one(node);
            if (node) {
                nodeRegion = node.get(REGION);
            }
        }

        return nodeRegion;
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    Handles `alignChange` events by updating the UI in response to `align`
    Attribute changes.

    @method _afterAlignChange
    @param {EventFacade} e
    @protected
    **/
    _afterAlignChange: function (e) {
        var align = e.newVal;
        if (align) {
            this._uiSetAlign(align.node, align.points);               
        }
    },

    /**
    Handles `alignOnChange` events by updating the alignment-syncing event
    handlers.

    @method _afterAlignOnChange
    @param {EventFacade} e
    @protected
    **/
    _afterAlignOnChange: function(e) {
        this._detachPosAlignUIHandles();

        if (this.get(VISIBLE)) {
            this._attachPosAlignUIHandles();
        }
    }
};

Y.WidgetPositionAlign = PositionAlign;


}, '3.8.1', {"requires": ["widget-position"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('widget-position-constrain', function (Y, NAME) {

/**
 * Provides constrained xy positioning support for Widgets, through an extension.
 *
 * It builds on top of the widget-position module, to provide constrained positioning support.
 *
 * @module widget-position-constrain
 */
var CONSTRAIN = "constrain",
    CONSTRAIN_XYCHANGE = "constrain|xyChange",
    CONSTRAIN_CHANGE = "constrainChange",

    PREVENT_OVERLAP = "preventOverlap",
    ALIGN = "align",
    
    EMPTY_STR = "",

    BINDUI = "bindUI",

    XY = "xy",
    X_COORD = "x",
    Y_COORD = "y",

    Node = Y.Node,

    VIEWPORT_REGION = "viewportRegion",
    REGION = "region",

    PREVENT_OVERLAP_MAP;

/**
 * A widget extension, which can be used to add constrained xy positioning support to the base Widget class,
 * through the <a href="Base.html#method_build">Base.build</a> method. This extension requires that 
 * the WidgetPosition extension be added to the Widget (before WidgetPositionConstrain, if part of the same 
 * extension list passed to Base.build).
 *
 * @class WidgetPositionConstrain
 * @param {Object} User configuration object
 */
function PositionConstrain(config) {
    if (!this._posNode) {
        Y.error("WidgetPosition needs to be added to the Widget, before WidgetPositionConstrain is added"); 
    }
    Y.after(this._bindUIPosConstrained, this, BINDUI);
}

/**
 * Static property used to define the default attribute 
 * configuration introduced by WidgetPositionConstrain.
 *
 * @property ATTRS
 * @type Object
 * @static
 */
PositionConstrain.ATTRS = {

    /**
     * @attribute constrain
     * @type boolean | Node
     * @default null
     * @description The node to constrain the widget's bounding box to, when setting xy. Can also be
     * set to true, to constrain to the viewport.
     */
    constrain : {
        value: null,
        setter: "_setConstrain"
    },

    /**
     * @attribute preventOverlap
     * @type boolean
     * @description If set to true, and WidgetPositionAlign is also added to the Widget, 
     * constrained positioning will attempt to prevent the widget's bounding box from overlapping 
     * the element to which it has been aligned, by flipping the orientation of the alignment
     * for corner based alignments  
     */
    preventOverlap : {
        value:false
    }
};

/**
 * @property _PREVENT_OVERLAP
 * @static
 * @protected
 * @type Object
 * @description The set of positions for which to prevent
 * overlap.
 */
PREVENT_OVERLAP_MAP = PositionConstrain._PREVENT_OVERLAP = {
    x: {
        "tltr": 1,
        "blbr": 1,
        "brbl": 1,
        "trtl": 1
    },
    y : {
        "trbr": 1,
        "tlbl": 1,
        "bltl": 1,
        "brtr": 1
    }
};

PositionConstrain.prototype = {

    /**
     * Calculates the constrained positions for the XY positions provided, using
     * the provided node argument is passed in. If no node value is passed in, the value of 
     * the "constrain" attribute is used.
     * 
     * @method getConstrainedXY
     * @param {Array} xy The xy values to constrain
     * @param {Node | boolean} node Optional. The node to constrain to, or true for the viewport
     * @return {Array} The constrained xy values
     */
    getConstrainedXY : function(xy, node) {
        node = node || this.get(CONSTRAIN);

        var constrainingRegion = this._getRegion((node === true) ? null : node),
            nodeRegion = this._posNode.get(REGION);

        return [
            this._constrain(xy[0], X_COORD, nodeRegion, constrainingRegion),
            this._constrain(xy[1], Y_COORD, nodeRegion, constrainingRegion)
        ];
    },

    /**
     * Constrains the widget's bounding box to a node (or the viewport). If xy or node are not 
     * passed in, the current position and the value of "constrain" will be used respectively.
     * 
     * The widget's position will be changed to the constrained position.
     *
     * @method constrain 
     * @param {Array} xy Optional. The xy values to constrain
     * @param {Node | boolean} node Optional. The node to constrain to, or true for the viewport
     */
    constrain : function(xy, node) {
        var currentXY, 
            constrainedXY,
            constraint = node || this.get(CONSTRAIN);

        if (constraint) {
            currentXY = xy || this.get(XY);
            constrainedXY = this.getConstrainedXY(currentXY, constraint);

            if (constrainedXY[0] !== currentXY[0] || constrainedXY[1] !== currentXY[1]) {
                this.set(XY, constrainedXY, { constrained:true });
            }
        }
    },

    /**
     * The setter implementation for the "constrain" attribute.
     *
     * @method _setConstrain
     * @protected
     * @param {Node | boolean} val The attribute value 
     */
    _setConstrain : function(val) {
        return (val === true) ? val : Node.one(val);
    },

    /**
     * The method which performs the actual constrain calculations for a given axis ("x" or "y") based
     * on the regions provided.
     * 
     * @method _constrain
     * @protected
     * 
     * @param {Number} val The value to constrain
     * @param {String} axis The axis to use for constrainment
     * @param {Region} nodeRegion The region of the node to constrain
     * @param {Region} constrainingRegion The region of the node (or viewport) to constrain to
     * 
     * @return {Number} The constrained value
     */
    _constrain: function(val, axis, nodeRegion, constrainingRegion) {
        if (constrainingRegion) {

            if (this.get(PREVENT_OVERLAP)) {
                val = this._preventOverlap(val, axis, nodeRegion, constrainingRegion);
            }

            var x = (axis == X_COORD),

                regionSize    = (x) ? constrainingRegion.width : constrainingRegion.height,
                nodeSize      = (x) ? nodeRegion.width : nodeRegion.height,
                minConstraint = (x) ? constrainingRegion.left : constrainingRegion.top,
                maxConstraint = (x) ? constrainingRegion.right - nodeSize : constrainingRegion.bottom - nodeSize;

            if (val < minConstraint || val > maxConstraint) {
                if (nodeSize < regionSize) {
                    if (val < minConstraint) {
                        val = minConstraint;
                    } else if (val > maxConstraint) {
                        val = maxConstraint;
                    }
                } else {
                    val = minConstraint;
                }
            }
        }

        return val;
    },

    /**
     * The method which performs the preventOverlap calculations for a given axis ("x" or "y") based
     * on the value and regions provided.
     * 
     * @method _preventOverlap
     * @protected
     *
     * @param {Number} val The value being constrain
     * @param {String} axis The axis to being constrained
     * @param {Region} nodeRegion The region of the node being constrained
     * @param {Region} constrainingRegion The region of the node (or viewport) we need to constrain to
     * 
     * @return {Number} The constrained value
     */
    _preventOverlap : function(val, axis, nodeRegion, constrainingRegion) {

        var align = this.get(ALIGN),
            x = (axis === X_COORD),
            nodeSize,
            alignRegion,
            nearEdge,
            farEdge,
            spaceOnNearSide, 
            spaceOnFarSide;

        if (align && align.points && PREVENT_OVERLAP_MAP[axis][align.points.join(EMPTY_STR)]) {

            alignRegion = this._getRegion(align.node);

            if (alignRegion) {
                nodeSize        = (x) ? nodeRegion.width : nodeRegion.height;
                nearEdge        = (x) ? alignRegion.left : alignRegion.top;
                farEdge         = (x) ? alignRegion.right : alignRegion.bottom;
                spaceOnNearSide = (x) ? alignRegion.left - constrainingRegion.left : alignRegion.top - constrainingRegion.top;
                spaceOnFarSide  = (x) ? constrainingRegion.right - alignRegion.right : constrainingRegion.bottom - alignRegion.bottom;
            }
 
            if (val > nearEdge) {
                if (spaceOnFarSide < nodeSize && spaceOnNearSide > nodeSize) {
                    val = nearEdge - nodeSize;
                }
            } else {
                if (spaceOnNearSide < nodeSize && spaceOnFarSide > nodeSize) {
                    val = farEdge;
                }
            }
        }

        return val;
    },

    /**
     * Binds event listeners responsible for updating the UI state in response to 
     * Widget constrained positioning related state changes.
     * <p>
     * This method is invoked after bindUI is invoked for the Widget class
     * using YUI's aop infrastructure.
     * </p>
     *
     * @method _bindUIPosConstrained
     * @protected
     */
    _bindUIPosConstrained : function() {
        this.after(CONSTRAIN_CHANGE, this._afterConstrainChange);
        this._enableConstraints(this.get(CONSTRAIN));
    },

    /**
     * After change listener for the "constrain" attribute, responsible
     * for updating the UI, in response to attribute changes.
     *
     * @method _afterConstrainChange
     * @protected
     * @param {EventFacade} e The event facade
     */
    _afterConstrainChange : function(e) {
        this._enableConstraints(e.newVal);
    },

    /**
     * Updates the UI if enabling constraints, and sets up the xyChange event listeners
     * to constrain whenever the widget is moved. Disabling constraints removes the listeners.
     * 
     * @method enable or disable constraints listeners
     * @private
     * @param {boolean} enable Enable or disable constraints 
     */
    _enableConstraints : function(enable) {
        if (enable) {
            this.constrain();
            this._cxyHandle = this._cxyHandle || this.on(CONSTRAIN_XYCHANGE, this._constrainOnXYChange);
        } else if (this._cxyHandle) {
            this._cxyHandle.detach();
            this._cxyHandle = null;    
        }
    },

    /**
     * The on change listener for the "xy" attribute. Modifies the event facade's
     * newVal property with the constrained XY value.
     *
     * @method _constrainOnXYChange
     * @protected
     * @param {EventFacade} e The event facade for the attribute change
     */
    _constrainOnXYChange : function(e) {
        if (!e.constrained) {
            e.newVal = this.getConstrainedXY(e.newVal);
        }
    },

    /**
     * Utility method to normalize region retrieval from a node instance, 
     * or the viewport, if no node is provided. 
     * 
     * @method _getRegion
     * @private
     * @param {Node} node Optional.
     */
    _getRegion : function(node) {
        var region;
        if (!node) {
            region = this._posNode.get(VIEWPORT_REGION);
        } else {
            node = Node.one(node);
            if (node) {
                region = node.get(REGION);
            }
        }
        return region;
    }
};

Y.WidgetPositionConstrain = PositionConstrain;


}, '3.8.1', {"requires": ["widget-position"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('panel', function (Y, NAME) {

// TODO: Change this description!
/**
Provides a Panel widget, a widget that mimics the functionality of a regular OS
window. Comes with Standard Module support, XY Positioning, Alignment Support,
Stack (z-index) support, modality, auto-focus and auto-hide functionality, and
header/footer button support.

@module panel
**/

var getClassName = Y.ClassNameManager.getClassName;

// TODO: Change this description!
/**
A basic Panel Widget, which can be positioned based on Page XY co-ordinates and
is stackable (z-index support). It also provides alignment and centering support
and uses a standard module format for it's content, with header, body and footer
section support. It can be made modal, and has functionality to hide and focus
on different events. The header and footer sections can be modified to allow for
button support.

@class Panel
@constructor
@extends Widget
@uses WidgetAutohide
@uses WidgetButtons
@uses WidgetModality
@uses WidgetPosition
@uses WidgetPositionAlign
@uses WidgetPositionConstrain
@uses WidgetStack
@uses WidgetStdMod
@since 3.4.0
 */
Y.Panel = Y.Base.create('panel', Y.Widget, [
    // Other Widget extensions depend on these two.
    Y.WidgetPosition,
    Y.WidgetStdMod,

    Y.WidgetAutohide,
    Y.WidgetButtons,
    Y.WidgetModality,
    Y.WidgetPositionAlign,
    Y.WidgetPositionConstrain,
    Y.WidgetStack
], {
    // -- Public Properties ----------------------------------------------------

    /**
    Collection of predefined buttons mapped from name => config.

    Panel includes a "close" button which can be use by name. When the close
    button is in the header (which is the default), it will look like: [x].

    See `addButton()` for a list of possible configuration values.

    @example
        // Panel with close button in header.
        var panel = new Y.Panel({
            buttons: ['close']
        });

        // Panel with close button in footer.
        var otherPanel = new Y.Panel({
            buttons: {
                footer: ['close']
            }
        });

    @property BUTTONS
    @type Object
    @default {close: {}}
    @since 3.5.0
    **/
    BUTTONS: {
        close: {
            label  : 'Close',
            action : 'hide',
            section: 'header',

            // Uses `type="button"` so the button's default action can still
            // occur but it won't cause things like a form to submit.
            template  : '<button type="button" />',
            classNames: getClassName('button', 'close')
        }
    }
}, {
    ATTRS: {
        // TODO: API Docs.
        buttons: {
            value: ['close']
        }
    }
});


}, '3.8.1', {
    "requires": [
        "widget",
        "widget-autohide",
        "widget-buttons",
        "widget-modality",
        "widget-position",
        "widget-position-align",
        "widget-position-constrain",
        "widget-stack",
        "widget-stdmod"
    ],
    "skinnable": true
});
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
