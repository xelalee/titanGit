/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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


}, '3.8.1', {"requires": ["anim-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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
         * @param {Config} config The configuration object with property name/value pairs.
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


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('pluginhost-config', function (Y, NAME) {

    /**
     * Adds pluginhost constructor configuration and static configuration support
     * @submodule pluginhost-config
     */

    var PluginHost = Y.Plugin.Host,
        L = Y.Lang;

    /**
     * A protected initialization method, used by the host class to initialize
     * plugin configurations passed the constructor, through the config object.
     * 
     * Host objects should invoke this method at the appropriate time in their
     * construction lifecycle.
     * 
     * @method _initConfigPlugins
     * @param {Object} config The configuration object passed to the constructor
     * @protected
     * @for Plugin.Host
     */
    PluginHost.prototype._initConfigPlugins = function(config) {

        // Class Configuration
        var classes = (this._getClasses) ? this._getClasses() : [this.constructor],
            plug = [],
            unplug = {},
            constructor, i, classPlug, classUnplug, pluginClassName;

        // TODO: Room for optimization. Can we apply statically/unplug in same pass?
        for (i = classes.length - 1; i >= 0; i--) {
            constructor = classes[i];

            classUnplug = constructor._UNPLUG;
            if (classUnplug) {
                // subclasses over-write
                Y.mix(unplug, classUnplug, true);
            }

            classPlug = constructor._PLUG;
            if (classPlug) {
                // subclasses over-write
                Y.mix(plug, classPlug, true);
            }
        }

        for (pluginClassName in plug) {
            if (plug.hasOwnProperty(pluginClassName)) {
                if (!unplug[pluginClassName]) {
                    this.plug(plug[pluginClassName]);
                }
            }
        }

        // User Configuration
        if (config && config.plugins) {
            this.plug(config.plugins);
        }
    };
    
    /**
     * Registers plugins to be instantiated at the class level (plugins 
     * which should be plugged into every instance of the class by default).
     *
     * @method plug
     * @static
     *
     * @param {Function} hostClass The host class on which to register the plugins
     * @param {Function | Array} plugin Either the plugin class, an array of plugin classes or an array of objects (with fn and cfg properties defined)
     * @param {Object} config (Optional) If plugin is the plugin class, the configuration for the plugin
     * @for Plugin.Host
     */
    PluginHost.plug = function(hostClass, plugin, config) {
        // Cannot plug into Base, since Plugins derive from Base [ will cause infinite recurrsion ]
        var p, i, l, name;
    
        if (hostClass !== Y.Base) {
            hostClass._PLUG = hostClass._PLUG || {};
    
            if (!L.isArray(plugin)) {
                if (config) {
                    plugin = {fn:plugin, cfg:config};
                }
                plugin = [plugin];
            }
    
            for (i = 0, l = plugin.length; i < l;i++) {
                p = plugin[i];
                name = p.NAME || p.fn.NAME;
                hostClass._PLUG[name] = p;
            }
        }
    };

    /**
     * Unregisters any class level plugins which have been registered by the host class, or any
     * other class in the hierarchy.
     *
     * @method unplug
     * @static
     *
     * @param {Function} hostClass The host class from which to unregister the plugins
     * @param {Function | Array} plugin The plugin class, or an array of plugin classes
     * @for Plugin.Host
     */
    PluginHost.unplug = function(hostClass, plugin) {
        var p, i, l, name;
    
        if (hostClass !== Y.Base) {
            hostClass._UNPLUG = hostClass._UNPLUG || {};
    
            if (!L.isArray(plugin)) {
                plugin = [plugin];
            }
    
            for (i = 0, l = plugin.length; i < l; i++) {
                p = plugin[i];
                name = p.NAME;
                if (!hostClass._PLUG[name]) {
                    hostClass._UNPLUG[name] = p;
                } else {
                    delete hostClass._PLUG[name];
                }
            }
        }
    };


}, '3.8.1', {"requires": ["pluginhost-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('node-pluginhost', function (Y, NAME) {

/**
 * @module node
 * @submodule node-pluginhost
 */

/**
 * Registers plugins to be instantiated at the class level (plugins
 * which should be plugged into every instance of Node by default).
 *
 * @method plug
 * @static
 * @for Node
 * @param {Function | Array} plugin Either the plugin class, an array of plugin classes or an array of objects (with fn and cfg properties defined)
 * @param {Object} config (Optional) If plugin is the plugin class, the configuration for the plugin
 */
Y.Node.plug = function() {
    var args = Y.Array(arguments);
    args.unshift(Y.Node);
    Y.Plugin.Host.plug.apply(Y.Base, args);
    return Y.Node;
};

/**
 * Unregisters any class level plugins which have been registered by the Node
 *
 * @method unplug
 * @static
 *
 * @param {Function | Array} plugin The plugin class, or an array of plugin classes
 */
Y.Node.unplug = function() {
    var args = Y.Array(arguments);
    args.unshift(Y.Node);
    Y.Plugin.Host.unplug.apply(Y.Base, args);
    return Y.Node;
};

Y.mix(Y.Node, Y.Plugin.Host, false, null, 1);

// allow batching of plug/unplug via NodeList
// doesn't use NodeList.importMethod because we need real Nodes (not tmpNode)
/**
 * Adds a plugin to each node in the NodeList.
 * This will instantiate the plugin and attach it to the configured namespace on each node
 * @method plug
 * @for NodeList
 * @param P {Function | Object |Array} Accepts the plugin class, or an 
 * object with a "fn" property specifying the plugin class and 
 * a "cfg" property specifying the configuration for the Plugin.
 * <p>
 * Additionally an Array can also be passed in, with the above function or 
 * object values, allowing the user to add multiple plugins in a single call.
 * </p>
 * @param config (Optional) If the first argument is the plugin class, the second argument
 * can be the configuration for the plugin.
 * @chainable
 */
Y.NodeList.prototype.plug = function() {
    var args = arguments;
    Y.NodeList.each(this, function(node) {
        Y.Node.prototype.plug.apply(Y.one(node), args);
    });
    return this;
};

/**
 * Removes a plugin from all nodes in the NodeList. This will destroy the 
 * plugin instance and delete the namespace each node. 
 * @method unplug
 * @for NodeList
 * @param {String | Function} plugin The namespace of the plugin, or the plugin class with the static NS namespace property defined. If not provided,
 * all registered plugins are unplugged.
 * @chainable
 */
Y.NodeList.prototype.unplug = function() {
    var args = arguments;
    Y.NodeList.each(this, function(node) {
        Y.Node.prototype.unplug.apply(Y.one(node), args);
    });
    return this;
};


}, '3.8.1', {"requires": ["node-base", "pluginhost"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('anim-node-plugin', function (Y, NAME) {

/**
 *  Binds an Anim instance to a Node instance
 * @module anim
 * @class Plugin.NodeFX
 * @extends Anim
 * @submodule anim-node-plugin
 */

var NodeFX = function(config) {
    config = (config) ? Y.merge(config) : {};
    config.node = config.host;
    NodeFX.superclass.constructor.apply(this, arguments);
};

NodeFX.NAME = "nodefx";
NodeFX.NS = "fx";

Y.extend(NodeFX, Y.Anim);

Y.namespace('Plugin');
Y.Plugin.NodeFX = NodeFX;


}, '3.8.1', {"requires": ["node-pluginhost", "anim-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('anim-scroll', function (Y, NAME) {

/**
 * Adds support for the <code>scroll</code> property in <code>to</code>
 * and <code>from</code> attributes.
 * @module anim
 * @submodule anim-scroll
 */

var NUM = Number;

//TODO: deprecate for scrollTop/Left properties?
Y.Anim.behaviors.scroll = {
    set: function(anim, att, from, to, elapsed, duration, fn) {
        var
            node = anim._node,
            val = ([
            fn(elapsed, NUM(from[0]), NUM(to[0]) - NUM(from[0]), duration),
            fn(elapsed, NUM(from[1]), NUM(to[1]) - NUM(from[1]), duration)
        ]);

        if (val[0]) {
            node.set('scrollLeft', val[0]);
        }

        if (val[1]) {
            node.set('scrollTop', val[1]);
        }
    },
    get: function(anim) {
        var node = anim._node;
        return [node.get('scrollLeft'), node.get('scrollTop')];
    }
};



}, '3.8.1', {"requires": ["anim-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('intl', function (Y, NAME) {

var _mods = {},

    ROOT_LANG = "yuiRootLang",
    ACTIVE_LANG = "yuiActiveLang",
    NONE = [];

/**
 * Provides utilities to support the management of localized resources (strings and formatting patterns).
 *
 * @module intl
 */

/**
 * The Intl utility provides a central location for managing sets of localized resources (strings and formatting patterns).
 *
 * @class Intl
 * @uses EventTarget
 * @static
 */
Y.mix(Y.namespace("Intl"), {

    /**
     * Private method to retrieve the language hash for a given module.
     *
     * @method _mod
     * @private
     *
     * @param {String} module The name of the module
     * @return {Object} The hash of localized resources for the module, keyed by BCP language tag
     */
    _mod : function(module) {
        if (!_mods[module]) {
            _mods[module] = {};
        }
        return _mods[module];
    },

    /**
     * Sets the active language for the given module.
     *
     * Returns false on failure, which would happen if the language had not been registered through the <a href="#method_add">add()</a> method.
     *
     * @method setLang
     *
     * @param {String} module The module name.
     * @param {String} lang The BCP 47 language tag.
     * @return boolean true if successful, false if not.
     */
    setLang : function(module, lang) {
        var langs = this._mod(module),
            currLang = langs[ACTIVE_LANG],
            exists = !!langs[lang];

        if (exists && lang !== currLang) {
            langs[ACTIVE_LANG] = lang;
            this.fire("intl:langChange", {module: module, prevVal: currLang, newVal: (lang === ROOT_LANG) ? "" : lang});
        }

        return exists;
    },

    /**
     * Get the currently active language for the given module.
     *
     * @method getLang
     *
     * @param {String} module The module name.
     * @return {String} The BCP 47 language tag.
     */
    getLang : function(module) {
        var lang = this._mod(module)[ACTIVE_LANG];
        return (lang === ROOT_LANG) ? "" : lang;
    },

    /**
     * Register a hash of localized resources for the given module and language
     *
     * @method add
     *
     * @param {String} module The module name.
     * @param {String} lang The BCP 47 language tag.
     * @param {Object} strings The hash of localized values, keyed by the string name.
     */
    add : function(module, lang, strings) {
        lang = lang || ROOT_LANG;
        this._mod(module)[lang] = strings;
        this.setLang(module, lang);
    },

    /**
     * Gets the module's localized resources for the currently active language (as provided by the <a href="#method_getLang">getLang</a> method).
     * <p>
     * Optionally, the localized resources for alternate languages which have been added to Intl (see the <a href="#method_add">add</a> method) can
     * be retrieved by providing the BCP 47 language tag as the lang parameter.
     * </p>
     * @method get
     *
     * @param {String} module The module name.
     * @param {String} key Optional. A single resource key. If not provided, returns a copy (shallow clone) of all resources.
     * @param {String} lang Optional. The BCP 47 language tag. If not provided, the module's currently active language is used.
     * @return String | Object A copy of the module's localized resources, or a single value if key is provided.
     */
    get : function(module, key, lang) {
        var mod = this._mod(module),
            strs;

        lang = lang || mod[ACTIVE_LANG];
        strs = mod[lang] || {};

        return (key) ? strs[key] : Y.merge(strs);
    },

    /**
     * Gets the list of languages for which localized resources are available for a given module, based on the module
     * meta-data (part of loader). If loader is not on the page, returns an empty array.
     *
     * @method getAvailableLangs
     * @param {String} module The name of the module
     * @return {Array} The array of languages available.
     */
    getAvailableLangs : function(module) {
        var loader = Y.Env._loader,
            mod = loader && loader.moduleInfo[module],
            langs = mod && mod.lang;
        return (langs) ? langs.concat() : NONE;

    }
});

Y.augment(Y.Intl, Y.EventTarget);

/**
 * Notification event to indicate when the lang for a module has changed. There is no default behavior associated with this event,
 * so the on and after moments are equivalent.
 *
 * @event intl:langChange
 * @param {EventFacade} e The event facade
 * <p>The event facade contains:</p>
 * <dl>
 *     <dt>module</dt><dd>The name of the module for which the language changed</dd>
 *     <dt>newVal</dt><dd>The new language tag</dd>
 *     <dt>prevVal</dt><dd>The current language tag</dd>
 * </dl>
 */
Y.Intl.publish("intl:langChange", {emitFacade:true});


}, '3.8.1', {"requires": ["intl-base", "event-custom"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('datatype-number-parse', function (Y, NAME) {

/**
 * Parse number submodule.
 *
 * @module datatype-number
 * @submodule datatype-number-parse
 * @for Number
 */

var LANG = Y.Lang;

Y.mix(Y.namespace("Number"), {
    /**
     * Converts data to type Number.
     *
     * @method parse
     * @param data {String | Number | Boolean} Data to convert. The following
     * values return as null: null, undefined, NaN, "".
     * @return {Number} A number, or null.
     */
    parse: function(data) {
        var number = (data === null) ? data : +data;
        if(LANG.isNumber(number)) {
            return number;
        }
        else {
            return null;
        }
    }
});

// Add Parsers shortcut
Y.namespace("Parsers").number = Y.Number.parse;
Y.namespace("DataType");
Y.DataType.Number = Y.Number;


}, '3.8.1');
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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
     *   <dt>prefix {HTML}</dd>
     *   <dd>String prepended before each number, like a currency designator "$"</dd>
     *   <dt>decimalPlaces {Number}</dd>
     *   <dd>Number of decimal places to round. Must be a number 0 to 20.</dd>
     *   <dt>decimalSeparator {HTML}</dd>
     *   <dd>Decimal separator</dd>
     *   <dt>thousandsSeparator {HTML}</dd>
     *   <dd>Thousands separator</dd>
     *   <dt>suffix {HTML}</dd>
     *   <dd>String appended after each number, like " items" (note the space)</dd>
     *  </dl>
     * @return {HTML} Formatted number for display. Note, the following values
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


}, '3.8.1');
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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


}, '3.8.1');
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add("lang/datatype-date-format_en-US",function(e){e.Intl.add("datatype-date-format","en-US",{a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],c:"%a, %b %d, %Y %l:%M:%S %p %Z",p:["AM","PM"],P:["am","pm"],x:"%m/%d/%y",X:"%l:%M:%S %p"})},"3.8.1");
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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
 * @param x {Number}	The number to be padded
 * @param pad {String}  The character to pad the number with
 * @param r {Number}	(optional) The base of the pad, eg, 10 implies to two digits, 100 implies to 3 digits.
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
	 *	<dt>%a</dt> <dd>abbreviated weekday name according to the current locale</dd>
	 *	<dt>%A</dt> <dd>full weekday name according to the current locale</dd>
	 *	<dt>%b</dt> <dd>abbreviated month name according to the current locale</dd>
	 *	<dt>%B</dt> <dd>full month name according to the current locale</dd>
	 *	<dt>%c</dt> <dd>preferred date and time representation for the current locale</dd>
	 *	<dt>%C</dt> <dd>century number (the year divided by 100 and truncated to an integer, range 00 to 99)</dd>
	 *	<dt>%d</dt> <dd>day of the month as a decimal number (range 01 to 31)</dd>
	 *	<dt>%D</dt> <dd>same as %m/%d/%y</dd>
	 *	<dt>%e</dt> <dd>day of the month as a decimal number, a single digit is preceded by a space (range " 1" to "31")</dd>
	 *	<dt>%F</dt> <dd>same as %Y-%m-%d (ISO 8601 date format)</dd>
	 *	<dt>%g</dt> <dd>like %G, but without the century</dd>
	 *	<dt>%G</dt> <dd>The 4-digit year corresponding to the ISO week number</dd>
	 *	<dt>%h</dt> <dd>same as %b</dd>
	 *	<dt>%H</dt> <dd>hour as a decimal number using a 24-hour clock (range 00 to 23)</dd>
	 *	<dt>%I</dt> <dd>hour as a decimal number using a 12-hour clock (range 01 to 12)</dd>
	 *	<dt>%j</dt> <dd>day of the year as a decimal number (range 001 to 366)</dd>
	 *	<dt>%k</dt> <dd>hour as a decimal number using a 24-hour clock (range 0 to 23); single digits are preceded by a blank. (See also %H.)</dd>
	 *	<dt>%l</dt> <dd>hour as a decimal number using a 12-hour clock (range 1 to 12); single digits are preceded by a blank. (See also %I.) </dd>
	 *	<dt>%m</dt> <dd>month as a decimal number (range 01 to 12)</dd>
	 *	<dt>%M</dt> <dd>minute as a decimal number</dd>
	 *	<dt>%n</dt> <dd>newline character</dd>
	 *	<dt>%p</dt> <dd>either "AM" or "PM" according to the given time value, or the corresponding strings for the current locale</dd>
	 *	<dt>%P</dt> <dd>like %p, but lower case</dd>
	 *	<dt>%r</dt> <dd>time in a.m. and p.m. notation equal to %I:%M:%S %p</dd>
	 *	<dt>%R</dt> <dd>time in 24 hour notation equal to %H:%M</dd>
	 *	<dt>%s</dt> <dd>number of seconds since the Epoch, ie, since 1970-01-01 00:00:00 UTC</dd>
	 *	<dt>%S</dt> <dd>second as a decimal number</dd>
	 *	<dt>%t</dt> <dd>tab character</dd>
	 *	<dt>%T</dt> <dd>current time, equal to %H:%M:%S</dd>
	 *	<dt>%u</dt> <dd>weekday as a decimal number [1,7], with 1 representing Monday</dd>
	 *	<dt>%U</dt> <dd>week number of the current year as a decimal number, starting with the
	 *			first Sunday as the first day of the first week</dd>
	 *	<dt>%V</dt> <dd>The ISO 8601:1988 week number of the current year as a decimal number,
	 *			range 01 to 53, where week 1 is the first week that has at least 4 days
	 *			in the current year, and with Monday as the first day of the week.</dd>
	 *	<dt>%w</dt> <dd>day of the week as a decimal, Sunday being 0</dd>
	 *	<dt>%W</dt> <dd>week number of the current year as a decimal number, starting with the
	 *			first Monday as the first day of the first week</dd>
	 *	<dt>%x</dt> <dd>preferred date representation for the current locale without the time</dd>
	 *	<dt>%X</dt> <dd>preferred time representation for the current locale without the date</dd>
	 *	<dt>%y</dt> <dd>year as a decimal number without a century (range 00 to 99)</dd>
	 *	<dt>%Y</dt> <dd>year as a decimal number including the century</dd>
	 *	<dt>%z</dt> <dd>numerical time zone representation</dd>
	 *	<dt>%Z</dt> <dd>time zone name or abbreviation</dd>
	 *	<dt>%%</dt> <dd>a literal "%" character</dd>
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
				case "string":					// string => built in date function
					return oDate[f]();
				case "function":				// function => our own function
					return f.call(oDate, oDate, resources);
				case "array":					// built in function with padding
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


}, '3.8.1', {
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
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
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


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-synthetic', function (Y, NAME) {

/**
 * Define new DOM events that can be subscribed to from Nodes.
 *
 * @module event
 * @submodule event-synthetic
 */
var CustomEvent = Y.CustomEvent,
    DOMMap   = Y.Env.evt.dom_map,
    toArray  = Y.Array,
    YLang    = Y.Lang,
    isObject = YLang.isObject,
    isString = YLang.isString,
    isArray  = YLang.isArray,
    query    = Y.Selector.query,
    noop     = function () {};

/**
 * <p>The triggering mechanism used by SyntheticEvents.</p>
 *
 * <p>Implementers should not instantiate these directly.  Use the Notifier
 * provided to the event's implemented <code>on(node, sub, notifier)</code> or
 * <code>delegate(node, sub, notifier, filter)</code> methods.</p>
 *
 * @class SyntheticEvent.Notifier
 * @constructor
 * @param handle {EventHandle} the detach handle for the subscription to an
 *              internal custom event used to execute the callback passed to
 *              on(..) or delegate(..)
 * @param emitFacade {Boolean} take steps to ensure the first arg received by
 *              the subscription callback is an event facade
 * @private
 * @since 3.2.0
 */
function Notifier(handle, emitFacade) {
    this.handle     = handle;
    this.emitFacade = emitFacade;
}

/**
 * <p>Executes the subscription callback, passing the firing arguments as the
 * first parameters to that callback. For events that are configured with
 * emitFacade=true, it is common practice to pass the triggering DOMEventFacade
 * as the first parameter.  Barring a proper DOMEventFacade or EventFacade
 * (from a CustomEvent), a new EventFacade will be generated.  In that case, if
 * fire() is called with a simple object, it will be mixed into the facade.
 * Otherwise, the facade will be prepended to the callback parameters.</p>
 *
 * <p>For notifiers provided to delegate logic, the first argument should be an
 * object with a &quot;currentTarget&quot; property to identify what object to
 * default as 'this' in the callback.  Typically this is gleaned from the
 * DOMEventFacade or EventFacade, but if configured with emitFacade=false, an
 * object must be provided.  In that case, the object will be removed from the
 * callback parameters.</p>
 *
 * <p>Additional arguments passed during event subscription will be
 * automatically added after those passed to fire().</p>
 *
 * @method fire
 * @param e {EventFacade|DOMEventFacade|Object|any} (see description)
 * @param arg* {any} additional arguments received by all subscriptions
 * @private
 */
Notifier.prototype.fire = function (e) {
    // first arg to delegate notifier should be an object with currentTarget
    var args     = toArray(arguments, 0, true),
        handle   = this.handle,
        ce       = handle.evt,
        sub      = handle.sub,
        thisObj  = sub.context,
        delegate = sub.filter,
        event    = e || {},
        ret;

    if (this.emitFacade) {
        if (!e || !e.preventDefault) {
            event = ce._getFacade();

            if (isObject(e) && !e.preventDefault) {
                Y.mix(event, e, true);
                args[0] = event;
            } else {
                args.unshift(event);
            }
        }

        event.type    = ce.type;
        event.details = args.slice();

        if (delegate) {
            event.container = ce.host;
        }
    } else if (delegate && isObject(e) && e.currentTarget) {
        args.shift();
    }

    sub.context = thisObj || event.currentTarget || ce.host;
    ret = ce.fire.apply(ce, args);
    sub.context = thisObj; // reset for future firing

    // to capture callbacks that return false to stopPropagation.
    // Useful for delegate implementations
    return ret;
};

/**
 * Manager object for synthetic event subscriptions to aggregate multiple synths on the same node without colliding with actual DOM subscription entries in the global map of DOM subscriptions.  Also facilitates proper cleanup on page unload.
 *
 * @class SynthRegistry
 * @constructor
 * @param el {HTMLElement} the DOM element
 * @param yuid {String} the yuid stamp for the element
 * @param key {String} the generated id token used to identify an event type +
 *                     element in the global DOM subscription map.
 * @private
 */
function SynthRegistry(el, yuid, key) {
    this.handles = [];
    this.el      = el;
    this.key     = key;
    this.domkey  = yuid;
}

SynthRegistry.prototype = {
    constructor: SynthRegistry,

    // A few object properties to fake the CustomEvent interface for page
    // unload cleanup.  DON'T TOUCH!
    type      : '_synth',
    fn        : noop,
    capture   : false,

    /**
     * Adds a subscription from the Notifier registry.
     *
     * @method register
     * @param handle {EventHandle} the subscription
     * @since 3.4.0
     */
    register: function (handle) {
        handle.evt.registry = this;
        this.handles.push(handle);
    },

    /**
     * Removes the subscription from the Notifier registry.
     *
     * @method _unregisterSub
     * @param sub {Subscription} the subscription
     * @since 3.4.0
     */
    unregister: function (sub) {
        var handles = this.handles,
            events = DOMMap[this.domkey],
            i;

        for (i = handles.length - 1; i >= 0; --i) {
            if (handles[i].sub === sub) {
                handles.splice(i, 1);
                break;
            }
        }

        // Clean up left over objects when there are no more subscribers.
        if (!handles.length) {
            delete events[this.key];
            if (!Y.Object.size(events)) {
                delete DOMMap[this.domkey];
            }
        }
    },

    /**
     * Used by the event system's unload cleanup process.  When navigating
     * away from the page, the event system iterates the global map of element
     * subscriptions and detaches everything using detachAll().  Normally,
     * the map is populated with custom events, so this object needs to
     * at least support the detachAll method to duck type its way to
     * cleanliness.
     *
     * @method detachAll
     * @private
     * @since 3.4.0
     */
    detachAll : function () {
        var handles = this.handles,
            i = handles.length;

        while (--i >= 0) {
            handles[i].detach();
        }
    }
};

/**
 * <p>Wrapper class for the integration of new events into the YUI event
 * infrastructure.  Don't instantiate this object directly, use
 * <code>Y.Event.define(type, config)</code>.  See that method for details.</p>
 *
 * <p>Properties that MAY or SHOULD be specified in the configuration are noted
 * below and in the description of <code>Y.Event.define</code>.</p>
 *
 * @class SyntheticEvent
 * @constructor
 * @param cfg {Object} Implementation pieces and configuration
 * @since 3.1.0
 * @in event-synthetic
 */
function SyntheticEvent() {
    this._init.apply(this, arguments);
}

Y.mix(SyntheticEvent, {
    Notifier: Notifier,
    SynthRegistry: SynthRegistry,

    /**
     * Returns the array of subscription handles for a node for the given event
     * type.  Passing true as the third argument will create a registry entry
     * in the event system's DOM map to host the array if one doesn't yet exist.
     *
     * @method getRegistry
     * @param node {Node} the node
     * @param type {String} the event
     * @param create {Boolean} create a registration entry to host a new array
     *                  if one doesn't exist.
     * @return {Array}
     * @static
     * @protected
     * @since 3.2.0
     */
    getRegistry: function (node, type, create) {
        var el     = node._node,
            yuid   = Y.stamp(el),
            key    = 'event:' + yuid + type + '_synth',
            events = DOMMap[yuid];
            
        if (create) {
            if (!events) {
                events = DOMMap[yuid] = {};
            }
            if (!events[key]) {
                events[key] = new SynthRegistry(el, yuid, key);
            }
        }

        return (events && events[key]) || null;
    },

    /**
     * Alternate <code>_delete()</code> method for the CustomEvent object
     * created to manage SyntheticEvent subscriptions.
     *
     * @method _deleteSub
     * @param sub {Subscription} the subscription to clean up
     * @private
     * @since 3.2.0
     */
    _deleteSub: function (sub) {
        if (sub && sub.fn) {
            var synth = this.eventDef,
                method = (sub.filter) ? 'detachDelegate' : 'detach';

            this._subscribers = [];

            if (CustomEvent.keepDeprecatedSubs) {
                this.subscribers = {};
            }

            synth[method](sub.node, sub, this.notifier, sub.filter);
            this.registry.unregister(sub);

            delete sub.fn;
            delete sub.node;
            delete sub.context;
        }
    },

    prototype: {
        constructor: SyntheticEvent,

        /**
         * Construction logic for the event.
         *
         * @method _init
         * @protected
         */
        _init: function () {
            var config = this.publishConfig || (this.publishConfig = {});

            // The notification mechanism handles facade creation
            this.emitFacade = ('emitFacade' in config) ?
                                config.emitFacade :
                                true;
            config.emitFacade  = false;
        },

        /**
         * <p>Implementers MAY provide this method definition.</p>
         *
         * <p>Implement this function if the event supports a different
         * subscription signature.  This function is used by both
         * <code>on()</code> and <code>delegate()</code>.  The second parameter
         * indicates that the event is being subscribed via
         * <code>delegate()</code>.</p>
         *
         * <p>Implementations must remove extra arguments from the args list
         * before returning.  The required args for <code>on()</code>
         * subscriptions are</p>
         * <pre><code>[type, callback, target, context, argN...]</code></pre>
         *
         * <p>The required args for <code>delegate()</code>
         * subscriptions are</p>
         *
         * <pre><code>[type, callback, target, filter, context, argN...]</code></pre>
         *
         * <p>The return value from this function will be stored on the
         * subscription in the '_extra' property for reference elsewhere.</p>
         *
         * @method processArgs
         * @param args {Array} parmeters passed to Y.on(..) or Y.delegate(..)
         * @param delegate {Boolean} true if the subscription is from Y.delegate
         * @return {any}
         */
        processArgs: noop,

        /**
         * <p>Implementers MAY override this property.</p>
         *
         * <p>Whether to prevent multiple subscriptions to this event that are
         * classified as being the same.  By default, this means the subscribed
         * callback is the same function.  See the <code>subMatch</code>
         * method.  Setting this to true will impact performance for high volume
         * events.</p>
         *
         * @property preventDups
         * @type {Boolean}
         * @default false
         */
        //preventDups  : false,

        /**
         * <p>Implementers SHOULD provide this method definition.</p>
         *
         * Implementation logic for subscriptions done via <code>node.on(type,
         * fn)</code> or <code>Y.on(type, fn, target)</code>.  This
         * function should set up the monitor(s) that will eventually fire the
         * event.  Typically this involves subscribing to at least one DOM
         * event.  It is recommended to store detach handles from any DOM
         * subscriptions to make for easy cleanup in the <code>detach</code>
         * method.  Typically these handles are added to the <code>sub</code>
         * object.  Also for SyntheticEvents that leverage a single DOM
         * subscription under the hood, it is recommended to pass the DOM event
         * object to <code>notifier.fire(e)</code>.  (The event name on the
         * object will be updated).
         *
         * @method on
         * @param node {Node} the node the subscription is being applied to
         * @param sub {Subscription} the object to track this subscription
         * @param notifier {SyntheticEvent.Notifier} call notifier.fire(..) to
         *              trigger the execution of the subscribers
         */
        on: noop,

        /**
         * <p>Implementers SHOULD provide this method definition.</p>
         *
         * <p>Implementation logic for detaching subscriptions done via
         * <code>node.on(type, fn)</code>.  This function should clean up any
         * subscriptions made in the <code>on()</code> phase.</p>
         *
         * @method detach
         * @param node {Node} the node the subscription was applied to
         * @param sub {Subscription} the object tracking this subscription
         * @param notifier {SyntheticEvent.Notifier} the Notifier used to
         *              trigger the execution of the subscribers
         */
        detach: noop,

        /**
         * <p>Implementers SHOULD provide this method definition.</p>
         *
         * <p>Implementation logic for subscriptions done via
         * <code>node.delegate(type, fn, filter)</code> or
         * <code>Y.delegate(type, fn, container, filter)</code>.  Like with
         * <code>on()</code> above, this function should monitor the environment
         * for the event being fired, and trigger subscription execution by
         * calling <code>notifier.fire(e)</code>.</p>
         *
         * <p>This function receives a fourth argument, which is the filter
         * used to identify which Node's are of interest to the subscription.
         * The filter will be either a boolean function that accepts a target
         * Node for each hierarchy level as the event bubbles, or a selector
         * string.  To translate selector strings into filter functions, use
         * <code>Y.delegate.compileFilter(filter)</code>.</p>
         *
         * @method delegate
         * @param node {Node} the node the subscription is being applied to
         * @param sub {Subscription} the object to track this subscription
         * @param notifier {SyntheticEvent.Notifier} call notifier.fire(..) to
         *              trigger the execution of the subscribers
         * @param filter {String|Function} Selector string or function that
         *              accepts an event object and returns null, a Node, or an
         *              array of Nodes matching the criteria for processing.
         * @since 3.2.0
         */
        delegate       : noop,

        /**
         * <p>Implementers SHOULD provide this method definition.</p>
         *
         * <p>Implementation logic for detaching subscriptions done via
         * <code>node.delegate(type, fn, filter)</code> or
         * <code>Y.delegate(type, fn, container, filter)</code>.  This function
         * should clean up any subscriptions made in the
         * <code>delegate()</code> phase.</p>
         *
         * @method detachDelegate
         * @param node {Node} the node the subscription was applied to
         * @param sub {Subscription} the object tracking this subscription
         * @param notifier {SyntheticEvent.Notifier} the Notifier used to
         *              trigger the execution of the subscribers
         * @param filter {String|Function} Selector string or function that
         *              accepts an event object and returns null, a Node, or an
         *              array of Nodes matching the criteria for processing.
         * @since 3.2.0
         */
        detachDelegate : noop,

        /**
         * Sets up the boilerplate for detaching the event and facilitating the
         * execution of subscriber callbacks.
         *
         * @method _on
         * @param args {Array} array of arguments passed to
         *              <code>Y.on(...)</code> or <code>Y.delegate(...)</code>
         * @param delegate {Boolean} true if called from
         * <code>Y.delegate(...)</code>
         * @return {EventHandle} the detach handle for this subscription
         * @private
         * since 3.2.0
         */
        _on: function (args, delegate) {
            var handles  = [],
                originalArgs = args.slice(),
                extra    = this.processArgs(args, delegate),
                selector = args[2],
                method   = delegate ? 'delegate' : 'on',
                nodes, handle;

            // Can't just use Y.all because it doesn't support window (yet?)
            nodes = (isString(selector)) ?
                query(selector) :
                toArray(selector || Y.one(Y.config.win));

            if (!nodes.length && isString(selector)) {
                handle = Y.on('available', function () {
                    Y.mix(handle, Y[method].apply(Y, originalArgs), true);
                }, selector);

                return handle;
            }

            Y.Array.each(nodes, function (node) {
                var subArgs = args.slice(),
                    filter;

                node = Y.one(node);

                if (node) {
                    if (delegate) {
                        filter = subArgs.splice(3, 1)[0];
                    }

                    // (type, fn, el, thisObj, ...) => (fn, thisObj, ...)
                    subArgs.splice(0, 4, subArgs[1], subArgs[3]);

                    if (!this.preventDups ||
                        !this.getSubs(node, args, null, true))
                    {
                        handles.push(this._subscribe(node, method, subArgs, extra, filter));
                    }
                }
            }, this);

            return (handles.length === 1) ?
                handles[0] :
                new Y.EventHandle(handles);
        },

        /**
         * Creates a new Notifier object for use by this event's
         * <code>on(...)</code> or <code>delegate(...)</code> implementation
         * and register the custom event proxy in the DOM system for cleanup.
         *
         * @method _subscribe
         * @param node {Node} the Node hosting the event
         * @param method {String} "on" or "delegate"
         * @param args {Array} the subscription arguments passed to either
         *              <code>Y.on(...)</code> or <code>Y.delegate(...)</code>
         *              after running through <code>processArgs(args)</code> to
         *              normalize the argument signature
         * @param extra {any} Extra data parsed from
         *              <code>processArgs(args)</code>
         * @param filter {String|Function} the selector string or function
         *              filter passed to <code>Y.delegate(...)</code> (not
         *              present when called from <code>Y.on(...)</code>)
         * @return {EventHandle}
         * @private
         * @since 3.2.0
         */
        _subscribe: function (node, method, args, extra, filter) {
            var dispatcher = new Y.CustomEvent(this.type, this.publishConfig),
                handle     = dispatcher.on.apply(dispatcher, args),
                notifier   = new Notifier(handle, this.emitFacade),
                registry   = SyntheticEvent.getRegistry(node, this.type, true),
                sub        = handle.sub;

            sub.node   = node;
            sub.filter = filter;
            if (extra) {
                this.applyArgExtras(extra, sub);
            }

            Y.mix(dispatcher, {
                eventDef     : this,
                notifier     : notifier,
                host         : node,       // I forget what this is for
                currentTarget: node,       // for generating facades
                target       : node,       // for generating facades
                el           : node._node, // For category detach

                _delete      : SyntheticEvent._deleteSub
            }, true);

            handle.notifier = notifier;

            registry.register(handle);

            // Call the implementation's "on" or "delegate" method
            this[method](node, sub, notifier, filter);

            return handle;
        },

        /**
         * <p>Implementers MAY provide this method definition.</p>
         *
         * <p>Implement this function if you want extra data extracted during
         * processArgs to be propagated to subscriptions on a per-node basis.
         * That is to say, if you call <code>Y.on('xyz', fn, xtra, 'div')</code>
         * the data returned from processArgs will be shared
         * across the subscription objects for all the divs.  If you want each
         * subscription to receive unique information, do that processing
         * here.</p>
         *
         * <p>The default implementation adds the data extracted by processArgs
         * to the subscription object as <code>sub._extra</code>.</p>
         *
         * @method applyArgExtras
         * @param extra {any} Any extra data extracted from processArgs
         * @param sub {Subscription} the individual subscription
         */
        applyArgExtras: function (extra, sub) {
            sub._extra = extra;
        },

        /**
         * Removes the subscription(s) from the internal subscription dispatch
         * mechanism.  See <code>SyntheticEvent._deleteSub</code>.
         *
         * @method _detach
         * @param args {Array} The arguments passed to
         *                  <code>node.detach(...)</code>
         * @private
         * @since 3.2.0
         */
        _detach: function (args) {
            // Can't use Y.all because it doesn't support window (yet?)
            // TODO: Does Y.all support window now?
            var target = args[2],
                els    = (isString(target)) ?
                            query(target) : toArray(target),
                node, i, len, handles, j;

            // (type, fn, el, context, filter?) => (type, fn, context, filter?)
            args.splice(2, 1);

            for (i = 0, len = els.length; i < len; ++i) {
                node = Y.one(els[i]);

                if (node) {
                    handles = this.getSubs(node, args);

                    if (handles) {
                        for (j = handles.length - 1; j >= 0; --j) {
                            handles[j].detach();
                        }
                    }
                }
            }
        },

        /**
         * Returns the detach handles of subscriptions on a node that satisfy a
         * search/filter function.  By default, the filter used is the
         * <code>subMatch</code> method.
         *
         * @method getSubs
         * @param node {Node} the node hosting the event
         * @param args {Array} the array of original subscription args passed
         *              to <code>Y.on(...)</code> (before
         *              <code>processArgs</code>
         * @param filter {Function} function used to identify a subscription
         *              for inclusion in the returned array
         * @param first {Boolean} stop after the first match (used to check for
         *              duplicate subscriptions)
         * @return {EventHandle[]} detach handles for the matching subscriptions
         */
        getSubs: function (node, args, filter, first) {
            var registry = SyntheticEvent.getRegistry(node, this.type),
                handles  = [],
                allHandles, i, len, handle;

            if (registry) {
                allHandles = registry.handles;

                if (!filter) {
                    filter = this.subMatch;
                }

                for (i = 0, len = allHandles.length; i < len; ++i) {
                    handle = allHandles[i];
                    if (filter.call(this, handle.sub, args)) {
                        if (first) {
                            return handle;
                        } else {
                            handles.push(allHandles[i]);
                        }
                    }
                }
            }

            return handles.length && handles;
        },

        /**
         * <p>Implementers MAY override this to define what constitutes a
         * &quot;same&quot; subscription.  Override implementations should
         * consider the lack of a comparator as a match, so calling
         * <code>getSubs()</code> with no arguments will return all subs.</p>
         *
         * <p>Compares a set of subscription arguments against a Subscription
         * object to determine if they match.  The default implementation
         * compares the callback function against the second argument passed to
         * <code>Y.on(...)</code> or <code>node.detach(...)</code> etc.</p>
         *
         * @method subMatch
         * @param sub {Subscription} the existing subscription
         * @param args {Array} the calling arguments passed to
         *                  <code>Y.on(...)</code> etc.
         * @return {Boolean} true if the sub can be described by the args
         *                  present
         * @since 3.2.0
         */
        subMatch: function (sub, args) {
            // Default detach cares only about the callback matching
            return !args[1] || sub.fn === args[1];
        }
    }
}, true);

Y.SyntheticEvent = SyntheticEvent;

/**
 * <p>Defines a new event in the DOM event system.  Implementers are
 * responsible for monitoring for a scenario whereby the event is fired.  A
 * notifier object is provided to the functions identified below.  When the
 * criteria defining the event are met, call notifier.fire( [args] ); to
 * execute event subscribers.</p>
 *
 * <p>The first parameter is the name of the event.  The second parameter is a
 * configuration object which define the behavior of the event system when the
 * new event is subscribed to or detached from.  The methods that should be
 * defined in this configuration object are <code>on</code>,
 * <code>detach</code>, <code>delegate</code>, and <code>detachDelegate</code>.
 * You are free to define any other methods or properties needed to define your
 * event.  Be aware, however, that since the object is used to subclass
 * SyntheticEvent, you should avoid method names used by SyntheticEvent unless
 * your intention is to override the default behavior.</p>
 *
 * <p>This is a list of properties and methods that you can or should specify
 * in the configuration object:</p>
 *
 * <dl>
 *   <dt><code>on</code></dt>
 *       <dd><code>function (node, subscription, notifier)</code> The
 *       implementation logic for subscription.  Any special setup you need to
 *       do to create the environment for the event being fired--E.g. native
 *       DOM event subscriptions.  Store subscription related objects and
 *       state on the <code>subscription</code> object.  When the
 *       criteria have been met to fire the synthetic event, call
 *       <code>notifier.fire(e)</code>.  See Notifier's <code>fire()</code>
 *       method for details about what to pass as parameters.</dd>
 *
 *   <dt><code>detach</code></dt>
 *       <dd><code>function (node, subscription, notifier)</code> The
 *       implementation logic for cleaning up a detached subscription. E.g.
 *       detach any DOM subscriptions added in <code>on</code>.</dd>
 *
 *   <dt><code>delegate</code></dt>
 *       <dd><code>function (node, subscription, notifier, filter)</code> The
 *       implementation logic for subscription via <code>Y.delegate</code> or
 *       <code>node.delegate</code>.  The filter is typically either a selector
 *       string or a function.  You can use
 *       <code>Y.delegate.compileFilter(selectorString)</code> to create a
 *       filter function from a selector string if needed.  The filter function
 *       expects an event object as input and should output either null, a
 *       matching Node, or an array of matching Nodes.  Otherwise, this acts
 *       like <code>on</code> DOM event subscriptions.  Store subscription
 *       related objects and information on the <code>subscription</code>
 *       object.  When the criteria have been met to fire the synthetic event,
 *       call <code>notifier.fire(e)</code> as noted above.</dd>
 *
 *   <dt><code>detachDelegate</code></dt>
 *       <dd><code>function (node, subscription, notifier)</code> The
 *       implementation logic for cleaning up a detached delegate subscription.
 *       E.g. detach any DOM delegate subscriptions added in
 *       <code>delegate</code>.</dd>
 *
 *   <dt><code>publishConfig</code></dt>
 *       <dd>(Object) The configuration object that will be used to instantiate
 *       the underlying CustomEvent. See Notifier's <code>fire</code> method
 *       for details.</dd>
 *
 *   <dt><code>processArgs</code></dt
 *       <dd>
 *          <p><code>function (argArray, fromDelegate)</code> Optional method
 *          to extract any additional arguments from the subscription
 *          signature.  Using this allows <code>on</code> or
 *          <code>delegate</code> signatures like
 *          <code>node.on(&quot;hover&quot;, overCallback,
 *          outCallback)</code>.</p>
 *          <p>When processing an atypical argument signature, make sure the
 *          args array is returned to the normal signature before returning
 *          from the function.  For example, in the &quot;hover&quot; example
 *          above, the <code>outCallback</code> needs to be <code>splice</code>d
 *          out of the array.  The expected signature of the args array for
 *          <code>on()</code> subscriptions is:</p>
 *          <pre>
 *              <code>[type, callback, target, contextOverride, argN...]</code>
 *          </pre>
 *          <p>And for <code>delegate()</code>:</p>
 *          <pre>
 *              <code>[type, callback, target, filter, contextOverride, argN...]</code>
 *          </pre>
 *          <p>where <code>target</code> is the node the event is being
 *          subscribed for.  You can see these signatures documented for
 *          <code>Y.on()</code> and <code>Y.delegate()</code> respectively.</p>
 *          <p>Whatever gets returned from the function will be stored on the
 *          <code>subscription</code> object under
 *          <code>subscription._extra</code>.</p></dd>
 *   <dt><code>subMatch</code></dt>
 *       <dd>
 *           <p><code>function (sub, args)</code>  Compares a set of
 *           subscription arguments against a Subscription object to determine
 *           if they match.  The default implementation compares the callback
 *           function against the second argument passed to
 *           <code>Y.on(...)</code> or <code>node.detach(...)</code> etc.</p>
 *       </dd>
 * </dl>
 *
 * @method define
 * @param type {String} the name of the event
 * @param config {Object} the prototype definition for the new event (see above)
 * @param force {Boolean} override an existing event (use with caution)
 * @return {SyntheticEvent} the subclass implementation instance created to
 *              handle event subscriptions of this type
 * @static
 * @for Event
 * @since 3.1.0
 * @in event-synthetic
 */
Y.Event.define = function (type, config, force) {
    var eventDef, Impl, synth;

    if (type && type.type) {
        eventDef = type;
        force = config;
    } else if (config) {
        eventDef = Y.merge({ type: type }, config);
    }

    if (eventDef) {
        if (force || !Y.Node.DOM_EVENTS[eventDef.type]) {
            Impl = function () {
                SyntheticEvent.apply(this, arguments);
            };
            Y.extend(Impl, SyntheticEvent, eventDef);
            synth = new Impl();

            type = synth.type;

            Y.Node.DOM_EVENTS[type] = Y.Env.evt.plugins[type] = {
                eventDef: synth,

                on: function () {
                    return synth._on(toArray(arguments));
                },

                delegate: function () {
                    return synth._on(toArray(arguments), true);
                },

                detach: function () {
                    return synth._detach(toArray(arguments));
                }
            };

        }
    } else if (isString(type) || isArray(type)) {
        Y.Array.each(toArray(type), function (t) {
            Y.Node.DOM_EVENTS[t] = 1;
        });
    }

    return synth;
};


}, '3.8.1', {"requires": ["node-base", "event-custom-complex"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-mouseenter', function (Y, NAME) {

/**
 * <p>Adds subscription and delegation support for mouseenter and mouseleave
 * events.  Unlike mouseover and mouseout, these events aren't fired from child
 * elements of a subscribed node.</p>
 *
 * <p>This avoids receiving three mouseover notifications from a setup like</p>
 *
 * <pre><code>div#container > p > a[href]</code></pre>
 *
 * <p>where</p>
 *
 * <pre><code>Y.one('#container').on('mouseover', callback)</code></pre>
 *
 * <p>When the mouse moves over the link, one mouseover event is fired from
 * #container, then when the mouse moves over the p, another mouseover event is
 * fired and bubbles to #container, causing a second notification, and finally
 * when the mouse moves over the link, a third mouseover event is fired and
 * bubbles to #container for a third notification.</p>
 *
 * <p>By contrast, using mouseenter instead of mouseover, the callback would be
 * executed only once when the mouse moves over #container.</p>
 *
 * @module event
 * @submodule event-mouseenter
 */

var domEventProxies = Y.Env.evt.dom_wrappers,
    contains = Y.DOM.contains,
    toArray = Y.Array,
    noop = function () {},

    config = {
        proxyType: "mouseover",
        relProperty: "fromElement",

        _notify: function (e, property, notifier) {
            var el = this._node,
                related = e.relatedTarget || e[property];

            if (el !== related && !contains(el, related)) {
                notifier.fire(new Y.DOMEventFacade(e, el,
                    domEventProxies['event:' + Y.stamp(el) + e.type]));
            }
        },

        on: function (node, sub, notifier) {
            var el = Y.Node.getDOMNode(node),
                args = [
                    this.proxyType,
                    this._notify,
                    el,
                    null,
                    this.relProperty,
                    notifier];

            sub.handle = Y.Event._attach(args, { facade: false });
            // node.on(this.proxyType, notify, null, notifier);
        },

        detach: function (node, sub) {
            sub.handle.detach();
        },

        delegate: function (node, sub, notifier, filter) {
            var el = Y.Node.getDOMNode(node),
                args = [
                    this.proxyType,
                    noop,
                    el,
                    null,
                    notifier
                ];

            sub.handle = Y.Event._attach(args, { facade: false });
            sub.handle.sub.filter = filter;
            sub.handle.sub.relProperty = this.relProperty;
            sub.handle.sub._notify = this._filterNotify;
        },

        _filterNotify: function (thisObj, args, ce) {
            args = args.slice();
            if (this.args) {
                args.push.apply(args, this.args);
            }

            var currentTarget = Y.delegate._applyFilter(this.filter, args, ce),
                related = args[0].relatedTarget || args[0][this.relProperty],
                e, i, len, ret, ct;

            if (currentTarget) {
                currentTarget = toArray(currentTarget);
                
                for (i = 0, len = currentTarget.length && (!e || !e.stopped); i < len; ++i) {
                    ct = currentTarget[0];
                    if (!contains(ct, related)) {
                        if (!e) {
                            e = new Y.DOMEventFacade(args[0], ct, ce);
                            e.container = Y.one(ce.el);
                        }
                        e.currentTarget = Y.one(ct);

                        // TODO: where is notifier? args? this.notifier?
                        ret = args[1].fire(e);

                        if (ret === false) {
                            break;
                        }
                    }
                }
            }

            return ret;
        },

        detachDelegate: function (node, sub) {
            sub.handle.detach();
        }
    };

Y.Event.define("mouseenter", config, true);
Y.Event.define("mouseleave", Y.merge(config, {
    proxyType: "mouseout",
    relProperty: "toElement"
}), true);


}, '3.8.1', {"requires": ["event-synthetic"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-touch', function (Y, NAME) {

/**
Adds touch event facade normalization properties (touches, changedTouches, targetTouches etc.) to the DOM event facade. Adds
touch events to the DOM events whitelist. 

@example
    YUI().use('event-touch', function (Y) {
        Y.one('#myDiv').on('touchstart', function(e) {
            ...
        });
    });
@module event
@submodule event-touch
 */
var SCALE = "scale",
    ROTATION = "rotation",
    IDENTIFIER = "identifier",
    win = Y.config.win,
    GESTURE_MAP = {};

/**
 * Adds touch event facade normalization properties to the DOM event facade
 *
 * @method _touch
 * @for DOMEventFacade
 * @private
 * @param ev {Event} the DOM event
 * @param currentTarget {HTMLElement} the element the listener was attached to
 * @param wrapper {Event.Custom} the custom event wrapper for this DOM event
 */
Y.DOMEventFacade.prototype._touch = function(e, currentTarget, wrapper) {

    var i,l, etCached, et,touchCache;


    if (e.touches) {

        /**
         * Array of individual touch events for touch points that are still in
         * contact with the touch surface.
         *
         * @property touches
         * @type {DOMEventFacade[]}
         */
        this.touches = [];
        touchCache = {};

        for (i = 0, l = e.touches.length; i < l; ++i) {
            et = e.touches[i];
            touchCache[Y.stamp(et)] = this.touches[i] = new Y.DOMEventFacade(et, currentTarget, wrapper);
        }
    }

    if (e.targetTouches) {

        /**
         * Array of individual touch events still in contact with the touch
         * surface and whose `touchstart` event occurred inside the same taregt
         * element as the current target element.
         *
         * @property targetTouches
         * @type {DOMEventFacade[]}
         */
        this.targetTouches = [];

        for (i = 0, l = e.targetTouches.length; i < l; ++i) {
            et = e.targetTouches[i];
            etCached = touchCache && touchCache[Y.stamp(et, true)];

            this.targetTouches[i] = etCached || new Y.DOMEventFacade(et, currentTarget, wrapper);
            
        }
    }

    if (e.changedTouches) {

        /**
        An array of event-specific touch events.

        For `touchstart`, the touch points that became active with the current
        event.

        For `touchmove`, the touch points that have changed since the last
        event.
        
        For `touchend`, the touch points that have been removed from the touch
        surface.

        @property changedTouches
        @type {DOMEventFacade[]}
        **/
        this.changedTouches = [];

        for (i = 0, l = e.changedTouches.length; i < l; ++i) {
            et = e.changedTouches[i];
            etCached = touchCache && touchCache[Y.stamp(et, true)];

            this.changedTouches[i] = etCached || new Y.DOMEventFacade(et, currentTarget, wrapper);
            
        }
    }

    if (SCALE in e) {
        this[SCALE] = e[SCALE];
    }

    if (ROTATION in e) {
        this[ROTATION] = e[ROTATION];
    }

    if (IDENTIFIER in e) {
        this[IDENTIFIER] = e[IDENTIFIER];
    }
};

//Adding MSPointer events to whitelisted DOM Events. MSPointer event payloads
//have the same properties as mouse events.
if (Y.Node.DOM_EVENTS) {
    Y.mix(Y.Node.DOM_EVENTS, {
        touchstart:1,
        touchmove:1,
        touchend:1,
        touchcancel:1,
        gesturestart:1,
        gesturechange:1,
        gestureend:1,
        MSPointerDown:1, 
        MSPointerUp:1,
        MSPointerMove:1
    });
}

//Add properties to Y.EVENT.GESTURE_MAP based on feature detection.
if ((win && ("ontouchstart" in win)) && !(Y.UA.chrome && Y.UA.chrome < 6)) {
    GESTURE_MAP.start = "touchstart";
    GESTURE_MAP.end = "touchend";
    GESTURE_MAP.move = "touchmove";
    GESTURE_MAP.cancel = "touchcancel";
}



else if (win && ("msPointerEnabled" in win.navigator)) {
    GESTURE_MAP.start = "MSPointerDown";
    GESTURE_MAP.end = "MSPointerUp";
    GESTURE_MAP.move = "MSPointerMove";
    GESTURE_MAP.cancel = "MSPointerCancel";
}

else {
    GESTURE_MAP.start = "mousedown";
    GESTURE_MAP.end = "mouseup";
    GESTURE_MAP.move = "mousemove";
    GESTURE_MAP.cancel = "mousecancel";
}

/**
 * A object literal with keys "start", "end", and "move". The value for each key is a
 * string representing the event for that environment. For touch environments, the respective
 * values are "touchstart", "touchend" and "touchmove". Mouse and MSPointer environments are also
 * supported via feature detection.
 *
 * @property _GESTURE_MAP
 * @type Object
 * @static
 */
Y.Event._GESTURE_MAP = GESTURE_MAP;


}, '3.8.1', {"requires": ["node-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('attribute-complex', function (Y, NAME) {

    /**
     * Adds support for attribute providers to handle complex attributes in the constructor
     *
     * @module attribute
     * @submodule attribute-complex
     * @for Attribute
     * @deprecated AttributeComplex's overrides are now part of AttributeCore.
     */

    var Attribute = Y.Attribute;

    Attribute.Complex = function() {};
    Attribute.Complex.prototype = {

        /**
         * Utility method to split out simple attribute name/value pairs ("x")
         * from complex attribute name/value pairs ("x.y.z"), so that complex
         * attributes can be keyed by the top level attribute name.
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
        _normAttrVals : Attribute.prototype._normAttrVals,

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
        _getAttrInitVal : Attribute.prototype._getAttrInitVal

    };

    // Consistency with the rest of the Attribute addons for now.
    Y.AttributeComplex = Attribute.Complex;


}, '3.8.1', {"requires": ["attribute-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('base-pluginhost', function (Y, NAME) {

    /**
     * The base-pluginhost submodule adds Plugin support to Base, by augmenting Base with
     * Plugin.Host and setting up static (class level) Base.plug and Base.unplug methods.
     *
     * @module base
     * @submodule base-pluginhost
     * @for Base
     */

    var Base = Y.Base,
        PluginHost = Y.Plugin.Host;

    Y.mix(Base, PluginHost, false, null, 1);

    /**
     * Alias for <a href="Plugin.Host.html#method_Plugin.Host.plug">Plugin.Host.plug</a>. See aliased
     * method for argument and return value details.
     *
     * @method plug
     * @static
     */
    Base.plug = PluginHost.plug;

    /**
     * Alias for <a href="Plugin.Host.html#method_Plugin.Host.unplug">Plugin.Host.unplug</a>. See the
     * aliased method for argument and return value details.
     *
     * @method unplug
     * @static
     */
    Base.unplug = PluginHost.unplug;


}, '3.8.1', {"requires": ["base-base", "pluginhost"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('classnamemanager', function (Y, NAME) {

/**
* Contains a singleton (ClassNameManager) that enables easy creation and caching of 
* prefixed class names.
* @module classnamemanager
*/

/**
 * A singleton class providing: 
 * 
 * <ul>
 *    <li>Easy creation of prefixed class names</li>
 *    <li>Caching of previously created class names for improved performance.</li>
 * </ul>
 * 
 * @class ClassNameManager
 * @static 
 */

// String constants
var CLASS_NAME_PREFIX = 'classNamePrefix',
	CLASS_NAME_DELIMITER = 'classNameDelimiter',
    CONFIG = Y.config;

// Global config

/**
 * Configuration property indicating the prefix for all CSS class names in this YUI instance.
 *
 * @property classNamePrefix
 * @type {String}
 * @default "yui"
 * @static
 */
CONFIG[CLASS_NAME_PREFIX] = CONFIG[CLASS_NAME_PREFIX] || 'yui3';

/**
 * Configuration property indicating the delimiter used to compose all CSS class names in
 * this YUI instance.
 *
 * @property classNameDelimiter
 * @type {String}
 * @default "-"
 * @static
 */
CONFIG[CLASS_NAME_DELIMITER] = CONFIG[CLASS_NAME_DELIMITER] || '-';

Y.ClassNameManager = function () {

	var sPrefix    = CONFIG[CLASS_NAME_PREFIX],
		sDelimiter = CONFIG[CLASS_NAME_DELIMITER];

	return {

		/**
		 * Returns a class name prefixed with the the value of the 
		 * <code>Y.config.classNamePrefix</code> attribute + the provided strings.
		 * Uses the <code>Y.config.classNameDelimiter</code> attribute to delimit the 
		 * provided strings. E.g. Y.ClassNameManager.getClassName('foo','bar'); // yui-foo-bar
		 *
		 * @method getClassName
		 * @param {String}+ classnameSection one or more classname sections to be joined
		 * @param {Boolean} skipPrefix If set to true, the classname will not be prefixed with the default Y.config.classNameDelimiter value.  
		 */
		getClassName: Y.cached(function () {

            var args = Y.Array(arguments);

            if (args[args.length-1] !== true) {
                args.unshift(sPrefix);
            } else {
                args.pop();
            }

			return args.join(sDelimiter);
		})

	};

}();


}, '3.8.1', {"requires": ["yui-base"]});
/* YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add('event-focus', function (Y, NAME) {

/**
 * Adds bubbling and delegation support to DOM events focus and blur.
 * 
 * @module event
 * @submodule event-focus
 */
var Event    = Y.Event,

    YLang    = Y.Lang,

    isString = YLang.isString,

    arrayIndex = Y.Array.indexOf,

    useActivate = (function() {

        // Changing the structure of this test, so that it doesn't use inline JS in HTML,
        // which throws an exception in Win8 packaged apps, due to additional security restrictions:
        // http://msdn.microsoft.com/en-us/library/windows/apps/hh465380.aspx#differences

        var supported = false,
            doc = Y.config.doc,
            p;

        if (doc) {

            p = doc.createElement("p");
            p.setAttribute("onbeforeactivate", ";");

            // onbeforeactivate is a function in IE8+.
            // onbeforeactivate is a string in IE6,7 (unfortunate, otherwise we could have just checked for function below).
            // onbeforeactivate is a function in IE10, in a Win8 App environment (no exception running the test).

            // onbeforeactivate is undefined in Webkit/Gecko.
            // onbeforeactivate is a function in Webkit/Gecko if it's a supported event (e.g. onclick).

            supported = (p.onbeforeactivate !== undefined);
        }

        return supported;
    }());

function define(type, proxy, directEvent) {
    var nodeDataKey = '_' + type + 'Notifiers';

    Y.Event.define(type, {

        _useActivate : useActivate,

        _attach: function (el, notifier, delegate) {
            if (Y.DOM.isWindow(el)) {
                return Event._attach([type, function (e) {
                    notifier.fire(e);
                }, el]);
            } else {
                return Event._attach(
                    [proxy, this._proxy, el, this, notifier, delegate],
                    { capture: true });
            }
        },

        _proxy: function (e, notifier, delegate) {
            var target        = e.target,
                currentTarget = e.currentTarget,
                notifiers     = target.getData(nodeDataKey),
                yuid          = Y.stamp(currentTarget._node),
                defer         = (useActivate || target !== currentTarget),
                directSub;
                
            notifier.currentTarget = (delegate) ? target : currentTarget;
            notifier.container     = (delegate) ? currentTarget : null;

            // Maintain a list to handle subscriptions from nested
            // containers div#a>div#b>input #a.on(focus..) #b.on(focus..),
            // use one focus or blur subscription that fires notifiers from
            // #b then #a to emulate bubble sequence.
            if (!notifiers) {
                notifiers = {};
                target.setData(nodeDataKey, notifiers);

                // only subscribe to the element's focus if the target is
                // not the current target (
                if (defer) {
                    directSub = Event._attach(
                        [directEvent, this._notify, target._node]).sub;
                    directSub.once = true;
                }
            } else {
                // In old IE, defer is always true.  In capture-phase browsers,
                // The delegate subscriptions will be encountered first, which
                // will establish the notifiers data and direct subscription
                // on the node.  If there is also a direct subscription to the
                // node's focus/blur, it should not call _notify because the
                // direct subscription from the delegate sub(s) exists, which
                // will call _notify.  So this avoids _notify being called
                // twice, unnecessarily.
                defer = true;
            }

            if (!notifiers[yuid]) {
                notifiers[yuid] = [];
            }

            notifiers[yuid].push(notifier);

            if (!defer) {
                this._notify(e);
            }
        },

        _notify: function (e, container) {
            var currentTarget = e.currentTarget,
                notifierData  = currentTarget.getData(nodeDataKey),
                axisNodes     = currentTarget.ancestors(),
                doc           = currentTarget.get('ownerDocument'),
                delegates     = [],
                                // Used to escape loops when there are no more
                                // notifiers to consider
                count         = notifierData ?
                                    Y.Object.keys(notifierData).length :
                                    0,
                target, notifiers, notifier, yuid, match, tmp, i, len, sub, ret;

            // clear the notifications list (mainly for delegation)
            currentTarget.clearData(nodeDataKey);

            // Order the delegate subs by their placement in the parent axis
            axisNodes.push(currentTarget);
            // document.get('ownerDocument') returns null
            // which we'll use to prevent having duplicate Nodes in the list
            if (doc) {
                axisNodes.unshift(doc);
            }

            // ancestors() returns the Nodes from top to bottom
            axisNodes._nodes.reverse();

            if (count) {
                // Store the count for step 2
                tmp = count;
                axisNodes.some(function (node) {
                    var yuid      = Y.stamp(node),
                        notifiers = notifierData[yuid],
                        i, len;

                    if (notifiers) {
                        count--;
                        for (i = 0, len = notifiers.length; i < len; ++i) {
                            if (notifiers[i].handle.sub.filter) {
                                delegates.push(notifiers[i]);
                            }
                        }
                    }

                    return !count;
                });
                count = tmp;
            }

            // Walk up the parent axis, notifying direct subscriptions and
            // testing delegate filters.
            while (count && (target = axisNodes.shift())) {
                yuid = Y.stamp(target);

                notifiers = notifierData[yuid];

                if (notifiers) {
                    for (i = 0, len = notifiers.length; i < len; ++i) {
                        notifier = notifiers[i];
                        sub      = notifier.handle.sub;
                        match    = true;

                        e.currentTarget = target;

                        if (sub.filter) {
                            match = sub.filter.apply(target,
                                [target, e].concat(sub.args || []));

                            // No longer necessary to test against this
                            // delegate subscription for the nodes along
                            // the parent axis.
                            delegates.splice(
                                arrayIndex(delegates, notifier), 1);
                        }

                        if (match) {
                            // undefined for direct subs
                            e.container = notifier.container;
                            ret = notifier.fire(e);
                        }

                        if (ret === false || e.stopped === 2) {
                            break;
                        }
                    }
                    
                    delete notifiers[yuid];
                    count--;
                }

                if (e.stopped !== 2) {
                    // delegates come after subs targeting this specific node
                    // because they would not normally report until they'd
                    // bubbled to the container node.
                    for (i = 0, len = delegates.length; i < len; ++i) {
                        notifier = delegates[i];
                        sub = notifier.handle.sub;

                        if (sub.filter.apply(target,
                            [target, e].concat(sub.args || []))) {

                            e.container = notifier.container;
                            e.currentTarget = target;
                            ret = notifier.fire(e);
                        }

                        if (ret === false || e.stopped === 2) {
                            break;
                        }
                    }
                }

                if (e.stopped) {
                    break;
                }
            }
        },

        on: function (node, sub, notifier) {
            sub.handle = this._attach(node._node, notifier);
        },

        detach: function (node, sub) {
            sub.handle.detach();
        },

        delegate: function (node, sub, notifier, filter) {
            if (isString(filter)) {
                sub.filter = function (target) {
                    return Y.Selector.test(target._node, filter,
                        node === target ? null : node._node);
                };
            }

            sub.handle = this._attach(node._node, notifier, true);
        },

        detachDelegate: function (node, sub) {
            sub.handle.detach();
        }
    }, true);
}

// For IE, we need to defer to focusin rather than focus because
// `el.focus(); doSomething();` executes el.onbeforeactivate, el.onactivate,
// el.onfocusin, doSomething, then el.onfocus.  All others support capture
// phase focus, which executes before doSomething.  To guarantee consistent
// behavior for this use case, IE's direct subscriptions are made against
// focusin so subscribers will be notified before js following el.focus() is
// executed.
if (useActivate) {
    //     name     capture phase       direct subscription
    define("focus", "beforeactivate",   "focusin");
    define("blur",  "beforedeactivate", "focusout");
} else {
    define("focus", "focus", "focus");
    define("blur",  "blur",  "blur");
}


}, '3.8.1', {"requires": ["event-synthetic"]});
