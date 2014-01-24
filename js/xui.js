/* xui build beta 0.0.1 by xela */
/* reference from YUI ( YUI 3.8.1 (build 5795) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ ) */
/**
@module xui
@main xui
@submodule xui-base
**/

if (typeof XUI != 'undefined') {
    XUI._XUI = XUI;
}

    var XUI = function() {
        var i = 0,
            X = this,
            args = arguments,
            l = args.length,
            instanceOf = function(o, type) {
                return (o && o.hasOwnProperty && (o instanceof type));
            },
            gconf = (typeof XUI_config !== 'undefined') && XUI_config;

        if (!(instanceOf(Y, XUI))) {
            X = new XUI();
        } else {
            // set up the core environment
            X._init();
            if (gconf) {
                X.applyConfig(gconf);
            }

            // bind the specified additional modules for this instance
            if (!l) {
                X._setup();
            }
        }

        if (l) {
            // Each instance can accept one or more configuration objects.
            // These are applied after YUI.GlobalConfig and YUI_Config,
            // overriding values set in those config files if there is a
            // matching property.
            for (; i < l; i++) {
                X.applyConfig(args[i]);
            }

            X._setup();
        }

        X.instanceOf = instanceOf;

        return X;
    };

