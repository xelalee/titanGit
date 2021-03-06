/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-arrayschema', function (Y, NAME) {

/**
 * Extends DataSource with schema-parsing on array data.
 *
 * @module datasource
 * @submodule datasource-arrayschema
 */

/**
 * Adds schema-parsing to the DataSource Utility.
 * @class DataSourceArraySchema
 * @extends Plugin.Base
 */
var DataSourceArraySchema = function() {
    DataSourceArraySchema.superclass.constructor.apply(this, arguments);
};

Y.mix(DataSourceArraySchema, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "schema"
     */
    NS: "schema",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceArraySchema"
     */
    NAME: "dataSourceArraySchema",

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSourceArraySchema Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        schema: {
            //value: {}
        }
    }
});

Y.extend(DataSourceArraySchema, Y.Plugin.Base, {
    /**
    * Internal init() handler.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        this.doBefore("_defDataFn", this._beforeDefDataFn);
    },

    /**
     * Parses raw data into a normalized response.
     *
     * @method _beforeDefDataFn
     * @param tId {Number} Unique transaction ID.
     * @param request {Object} The request.
     * @param callback {Object} The callback object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * @param data {Object} Raw data.
     * @protected
     */
    _beforeDefDataFn: function(e) {
        var data = (Y.DataSource.IO && (this.get("host") instanceof Y.DataSource.IO) && Y.Lang.isString(e.data.responseText)) ? e.data.responseText : e.data,
            response = Y.DataSchema.Array.apply.call(this, this.get("schema"), data),
            payload = e.details[0];

        // Default
        if (!response) {
            response = {
                meta: {},
                results: data
            };
        }

        payload.response = response;

        this.get("host").fire("response", payload);

        return new Y.Do.Halt("DataSourceArraySchema plugin halted _defDataFn");
    }
});

Y.namespace('Plugin').DataSourceArraySchema = DataSourceArraySchema;


}, '3.16.0', {"requires": ["datasource-local", "plugin", "dataschema-array"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dataschema-text', function (Y, NAME) {

/**
 * Provides a DataSchema implementation which can be used to work with
 * delimited text data.
 *
 * @module dataschema
 * @submodule dataschema-text
 */

/**
Provides a DataSchema implementation which can be used to work with
delimited text data.

See the `apply` method for usage.

@class DataSchema.Text
@extends DataSchema.Base
@static
**/

var Lang = Y.Lang,
    isString = Lang.isString,
    isUndef  = Lang.isUndefined,

    SchemaText = {

        ////////////////////////////////////////////////////////////////////////
        //
        // DataSchema.Text static methods
        //
        ////////////////////////////////////////////////////////////////////////
        /**
        Applies a schema to a string of delimited data, returning a normalized
        object with results in the `results` property. The `meta` property of
        the response object is present for consistency, but is assigned an
        empty object.  If the input data is absent or not a string, an `error`
        property will be added.

        Use _schema.resultDelimiter_ and _schema.fieldDelimiter_ to instruct
        `apply` how to split up the string into an array of data arrays for
        processing.

        Use _schema.resultFields_ to specify the keys in the generated result
        objects in `response.results`. The key:value pairs will be assigned
        in the order of the _schema.resultFields_ array, assuming the values
        in the data records are defined in the same order.

        _schema.resultFields_ field identifiers are objects with the following
        properties:

          * `key`   : <strong>(required)</strong> The property name you want
                the data value assigned to in the result object (String)
          * `parser`: A function or the name of a function on `Y.Parsers` used
                to convert the input value into a normalized type.  Parser
                functions are passed the value as input and are expected to
                return a value.

        If no value parsing is needed, you can use just the desired property
        name string as the field identifier instead of an object (see example
        below).

        @example
            // Process simple csv
            var schema = {
                    resultDelimiter: "\n",
                    fieldDelimiter: ",",
                    resultFields: [ 'fruit', 'color' ]
                },
                data = "Banana,yellow\nOrange,orange\nEggplant,purple";

            var response = Y.DataSchema.Text.apply(schema, data);

            // response.results[0] is { fruit: "Banana", color: "yellow" }


            // Use parsers
            schema.resultFields = [
                {
                    key: 'fruit',
                    parser: function (val) { return val.toUpperCase(); }
                },
                'color' // mix and match objects and strings
            ];

            response = Y.DataSchema.Text.apply(schema, data);

            // response.results[0] is { fruit: "BANANA", color: "yellow" }

        @method apply
        @param {Object} schema Schema to apply.  Supported configuration
            properties are:
          @param {String} schema.resultDelimiter Character or character
              sequence that marks the end of one record and the start of
              another.
          @param {String} [schema.fieldDelimiter] Character or character
              sequence that marks the end of a field and the start of
              another within the same record.
          @param {Array} [schema.resultFields] Field identifiers to
              assign values in the response records. See above for details.
        @param {String} data Text data.
        @return {Object} An Object with properties `results` and `meta`
        @static
        **/
        apply: function(schema, data) {
            var data_in = data,
                data_out = { results: [], meta: {} };

            if (isString(data) && schema && isString(schema.resultDelimiter)) {
                // Parse results data
                data_out = SchemaText._parseResults.call(this, schema, data_in, data_out);
            } else {
                data_out.error = new Error("Text schema parse failure");
            }

            return data_out;
        },

        /**
         * Schema-parsed list of results from full data
         *
         * @method _parseResults
         * @param schema {Array} Schema to parse against.
         * @param text_in {String} Text to parse.
         * @param data_out {Object} In-progress parsed data to update.
         * @return {Object} Parsed data object.
         * @static
         * @protected
         */
        _parseResults: function(schema, text_in, data_out) {
            var resultDelim = schema.resultDelimiter,
                fieldDelim  = isString(schema.fieldDelimiter) &&
                                schema.fieldDelimiter,
                fields      = schema.resultFields || [],
                results     = [],
                parse       = Y.DataSchema.Base.parse,
                results_in, fields_in, result, item,
                field, key, value, i, j;

            // Delete final delimiter at end of string if there
            if (text_in.slice(-resultDelim.length) === resultDelim) {
                text_in = text_in.slice(0, -resultDelim.length);
            }

            // Split into results
            results_in = text_in.split(schema.resultDelimiter);

            if (fieldDelim) {
                for (i = results_in.length - 1; i >= 0; --i) {
                    result = {};
                    item = results_in[i];

                    fields_in = item.split(schema.fieldDelimiter);

                    for (j = fields.length - 1; j >= 0; --j) {
                        field = fields[j];
                        key = (!isUndef(field.key)) ? field.key : field;
                        // FIXME: unless the key is an array index, this test
                        // for fields_in[key] is useless.
                        value = (!isUndef(fields_in[key])) ?
                                    fields_in[key] :
                                    fields_in[j];

                        result[key] = parse.call(this, value, field);
                    }

                    results[i] = result;
                }
            } else {
                results = results_in;
            }

            data_out.results = results;

            return data_out;
        }
    };

Y.DataSchema.Text = Y.mix(SchemaText, Y.DataSchema.Base);


}, '3.16.0', {"requires": ["dataschema-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-textschema', function (Y, NAME) {

/**
 * Extends DataSource with schema-parsing on text data.
 *
 * @module datasource
 * @submodule datasource-textschema
 */

/**
 * Adds schema-parsing to the DataSource Utility.
 * @class DataSourceTextSchema
 * @extends Plugin.Base
 */
var DataSourceTextSchema = function() {
    DataSourceTextSchema.superclass.constructor.apply(this, arguments);
};

Y.mix(DataSourceTextSchema, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "schema"
     */
    NS: "schema",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceTextSchema"
     */
    NAME: "dataSourceTextSchema",

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSourceTextSchema Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        schema: {
            //value: {}
        }
    }
});

Y.extend(DataSourceTextSchema, Y.Plugin.Base, {
    /**
    * Internal init() handler.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        this.doBefore("_defDataFn", this._beforeDefDataFn);
    },

    /**
     * Parses raw data into a normalized response.
     *
     * @method _beforeDefDataFn
     * @param tId {Number} Unique transaction ID.
     * @param request {Object} The request.
     * @param callback {Object} The callback object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * @param data {Object} Raw data.
     * @protected
     */
    _beforeDefDataFn: function(e) {
        var schema = this.get('schema'),
            payload = e.details[0],
            // TODO: Do I need to sniff for DS.IO + isString(responseText)?
            data = e.data.responseText || e.data;

        payload.response = Y.DataSchema.Text.apply.call(this, schema, data) || {
            meta: {},
            results: data
        };

        this.get("host").fire("response", payload);

        return new Y.Do.Halt("DataSourceTextSchema plugin halted _defDataFn");
    }
});

Y.namespace('Plugin').DataSourceTextSchema = DataSourceTextSchema;


}, '3.16.0', {"requires": ["datasource-local", "plugin", "dataschema-text"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-polling', function (Y, NAME) {

/**
 * Extends DataSource with polling functionality.
 *
 * @module datasource
 * @submodule datasource-polling
 */

/**
 * Adds polling to the DataSource Utility.
 * @class Pollable
 * @extends DataSource.Local
 */
function Pollable() {
    this._intervals = {};
}

Pollable.prototype = {

    /**
    * @property _intervals
    * @description Hash of polling interval IDs that have been enabled,
    * stored here to be able to clear all intervals.
    * @private
    */
    _intervals: null,

    /**
     * Sets up a polling mechanism to send requests at set intervals and
     * forward responses to given callback.
     *
     * @method setInterval
     * @param msec {Number} Length of interval in milliseconds.
     * @param [request] {Object} An object literal with the following properties:
     *     <dl>
     *     <dt><code>request</code></dt>
     *     <dd>The request to send to the live data source, if any.</dd>
     *     <dt><code>callback</code></dt>
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
     * @return {Number} Interval ID.
     */
    setInterval: function(msec, request) {
        var x = Y.later(msec, this, this.sendRequest, [ request ], true);
        this._intervals[x.id] = x;
        // First call happens immediately, but async
        Y.later(0, this, this.sendRequest, [request]);
        return x.id;
    },

    /**
     * Disables polling mechanism associated with the given interval ID.
     *
     * @method clearInterval
     * @param id {Number} Interval ID.
     */
    clearInterval: function(id, key) {
        // In case of being called by clearAllIntervals()
        id = key || id;
        if(this._intervals[id]) {
            // Clear the interval
            this._intervals[id].cancel();
            // Clear from tracker
            delete this._intervals[id];
        }
    },

    /**
     * Clears all intervals.
     *
     * @method clearAllIntervals
     */
    clearAllIntervals: function() {
        Y.each(this._intervals, this.clearInterval, this);
    }
};

Y.augment(Y.DataSource.Local, Pollable);


}, '3.16.0', {"requires": ["datasource-local"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('array-extras', function (Y, NAME) {

/**
Adds additional utility methods to the `Y.Array` class.

@module collection
@submodule array-extras
**/

var A          = Y.Array,
    L          = Y.Lang,
    ArrayProto = Array.prototype;

/**
Returns the index of the last item in the array that contains the specified
value, or `-1` if the value isn't found.

@method lastIndexOf
@param {Array} a Array to search in.
@param {Any} val Value to search for.
@param {Number} [fromIndex] Index at which to start searching backwards.
  Defaults to the array's length - 1. If negative, it will be taken as an offset
  from the end of the array. If the calculated index is less than 0, the array
  will not be searched and `-1` will be returned.
@return {Number} Index of the item that contains the value, or `-1` if not
  found.
@static
@for Array
**/
A.lastIndexOf = L._isNative(ArrayProto.lastIndexOf) ?
    function(a, val, fromIndex) {
        // An undefined fromIndex is still considered a value by some (all?)
        // native implementations, so we can't pass it unless it's actually
        // specified.
        return fromIndex || fromIndex === 0 ? a.lastIndexOf(val, fromIndex) :
                a.lastIndexOf(val);
    } :
    function(a, val, fromIndex) {
        var len = a.length,
            i   = len - 1;

        if (fromIndex || fromIndex === 0) {
            i = Math.min(fromIndex < 0 ? len + fromIndex : fromIndex, len);
        }

        if (i > -1 && len > 0) {
            for (; i > -1; --i) {
                if (i in a && a[i] === val) {
                    return i;
                }
            }
        }

        return -1;
    };

/**
Returns a copy of the input array with duplicate items removed.

Note: If the input array only contains strings, the `Y.Array.dedupe()` method is
a much faster alternative.

@method unique
@param {Array} array Array to dedupe.
@param {Function} [testFn] Custom function to use to test the equality of two
    values. A truthy return value indicates that the values are equal. A falsy
    return value indicates that the values are not equal.

    @param {Any} testFn.a First value to compare.
    @param {Any} testFn.b Second value to compare.
    @param {Number} testFn.index Index of the current item in the original
        array.
    @param {Array} testFn.array The original array.
    @return {Boolean} _true_ if the items are equal, _false_ otherwise.

@return {Array} Copy of the input array with duplicate items removed.
@static
**/
A.unique = function (array, testFn) {
    var i       = 0,
        len     = array.length,
        results = [],
        j, result, resultLen, value;

    // Note the label here. It's used to jump out of the inner loop when a value
    // is not unique.
    outerLoop: for (; i < len; i++) {
        value = array[i];

        // For each value in the input array, iterate through the result array
        // and check for uniqueness against each result value.
        for (j = 0, resultLen = results.length; j < resultLen; j++) {
            result = results[j];

            // If the test function returns true or there's no test function and
            // the value equals the current result item, stop iterating over the
            // results and continue to the next value in the input array.
            if (testFn) {
                if (testFn.call(array, value, result, i, array)) {
                    continue outerLoop;
                }
            } else if (value === result) {
                continue outerLoop;
            }
        }

        // If we get this far, that means the current value is not already in
        // the result array, so add it.
        results.push(value);
    }

    return results;
};

/**
Executes the supplied function on each item in the array. Returns a new array
containing the items for which the supplied function returned a truthy value.

@method filter
@param {Array} a Array to filter.
@param {Function} f Function to execute on each item.
@param {Object} [o] Optional context object.
@return {Array} Array of items for which the supplied function returned a
  truthy value (empty if it never returned a truthy value).
@static
*/
A.filter = L._isNative(ArrayProto.filter) ?
    function(a, f, o) {
        return ArrayProto.filter.call(a, f, o);
    } :
    function(a, f, o) {
        var i       = 0,
            len     = a.length,
            results = [],
            item;

        for (; i < len; ++i) {
            if (i in a) {
                item = a[i];

                if (f.call(o, item, i, a)) {
                    results.push(item);
                }
            }
        }

        return results;
    };

/**
The inverse of `Array.filter()`. Executes the supplied function on each item.
Returns a new array containing the items for which the supplied function
returned `false`.

@method reject
@param {Array} a the array to iterate.
@param {Function} f the function to execute on each item.
@param {object} [o] Optional context object.
@return {Array} The items for which the supplied function returned `false`.
@static
*/
A.reject = function(a, f, o) {
    return A.filter(a, function(item, i, a) {
        return !f.call(o, item, i, a);
    });
};

/**
Executes the supplied function on each item in the array. Iteration stops if the
supplied function does not return a truthy value.

@method every
@param {Array} a the array to iterate.
@param {Function} f the function to execute on each item.
@param {Object} [o] Optional context object.
@return {Boolean} `true` if every item in the array returns `true` from the
  supplied function, `false` otherwise.
@static
*/
A.every = L._isNative(ArrayProto.every) ?
    function(a, f, o) {
        return ArrayProto.every.call(a, f, o);
    } :
    function(a, f, o) {
        for (var i = 0, l = a.length; i < l; ++i) {
            if (i in a && !f.call(o, a[i], i, a)) {
                return false;
            }
        }

        return true;
    };

/**
Executes the supplied function on each item in the array and returns a new array
containing all the values returned by the supplied function.

@example

    // Convert an array of numbers into an array of strings.
    Y.Array.map([1, 2, 3, 4], function (item) {
      return '' + item;
    });
    // => ['1', '2', '3', '4']

@method map
@param {Array} a the array to iterate.
@param {Function} f the function to execute on each item.
@param {object} [o] Optional context object.
@return {Array} A new array containing the return value of the supplied function
  for each item in the original array.
@static
*/
A.map = L._isNative(ArrayProto.map) ?
    function(a, f, o) {
        return ArrayProto.map.call(a, f, o);
    } :
    function(a, f, o) {
        var i       = 0,
            len     = a.length,
            results = ArrayProto.concat.call(a);

        for (; i < len; ++i) {
            if (i in a) {
                results[i] = f.call(o, a[i], i, a);
            }
        }

        return results;
    };


/**
Executes the supplied function on each item in the array, "folding" the array
into a single value.

@method reduce
@param {Array} a Array to iterate.
@param {Any} init Initial value to start with.
@param {Function} f Function to execute on each item. This function should
  update and return the value of the computation. It will receive the following
  arguments:
    @param {Any} f.previousValue Value returned from the previous iteration,
      or the initial value if this is the first iteration.
    @param {Any} f.currentValue Value of the current item being iterated.
    @param {Number} f.index Index of the current item.
    @param {Array} f.array Array being iterated.
@param {Object} [o] Optional context object.
@return {Any} Final result from iteratively applying the given function to each
  element in the array.
@static
*/
A.reduce = L._isNative(ArrayProto.reduce) ?
    function(a, init, f, o) {
        // ES5 Array.reduce doesn't support a thisObject, so we need to
        // implement it manually.
        return ArrayProto.reduce.call(a, function(init, item, i, a) {
            return f.call(o, init, item, i, a);
        }, init);
    } :
    function(a, init, f, o) {
        var i      = 0,
            len    = a.length,
            result = init;

        for (; i < len; ++i) {
            if (i in a) {
                result = f.call(o, result, a[i], i, a);
            }
        }

        return result;
    };

/**
Executes the supplied function on each item in the array, searching for the
first item that matches the supplied function.

@method find
@param {Array} a the array to search.
@param {Function} f the function to execute on each item. Iteration is stopped
  as soon as this function returns `true`.
@param {Object} [o] Optional context object.
@return {Object} the first item that the supplied function returns `true` for,
  or `null` if it never returns `true`.
@static
*/
A.find = function(a, f, o) {
    for (var i = 0, l = a.length; i < l; i++) {
        if (i in a && f.call(o, a[i], i, a)) {
            return a[i];
        }
    }
    return null;
};

/**
Iterates over an array, returning a new array of all the elements that match the
supplied regular expression.

@method grep
@param {Array} a Array to iterate over.
@param {RegExp} pattern Regular expression to test against each item.
@return {Array} All the items in the array that produce a match against the
  supplied regular expression. If no items match, an empty array is returned.
@static
*/
A.grep = function(a, pattern) {
    return A.filter(a, function(item, index) {
        return pattern.test(item);
    });
};

/**
Partitions an array into two new arrays, one with the items for which the
supplied function returns `true`, and one with the items for which the function
returns `false`.

@method partition
@param {Array} a Array to iterate over.
@param {Function} f Function to execute for each item in the array. It will
  receive the following arguments:
    @param {Any} f.item Current item.
    @param {Number} f.index Index of the current item.
    @param {Array} f.array The array being iterated.
@param {Object} [o] Optional execution context.
@return {Object} An object with two properties: `matches` and `rejects`. Each is
  an array containing the items that were selected or rejected by the test
  function (or an empty array if none).
@static
*/
A.partition = function(a, f, o) {
    var results = {
        matches: [],
        rejects: []
    };

    A.each(a, function(item, index) {
        var set = f.call(o, item, index, a) ? results.matches : results.rejects;
        set.push(item);
    });

    return results;
};

/**
Creates an array of arrays by pairing the corresponding elements of two arrays
together into a new array.

@method zip
@param {Array} a Array to iterate over.
@param {Array} a2 Another array whose values will be paired with values of the
  first array.
@return {Array} An array of arrays formed by pairing each element of the first
  array with an item in the second array having the corresponding index.
@static
*/
A.zip = function(a, a2) {
    var results = [];
    A.each(a, function(item, index) {
        results.push([item, a2[index]]);
    });
    return results;
};

/**
Flattens an array of nested arrays at any abitrary depth into a single, flat
array.

@method flatten
@param {Array} a Array with nested arrays to flatten.
@return {Array} An array whose nested arrays have been flattened.
@static
@since 3.7.0
**/
A.flatten = function(a) {
    var result = [],
        i, len, val;

    // Always return an array.
    if (!a) {
        return result;
    }

    for (i = 0, len = a.length; i < len; ++i) {
        val = a[i];

        if (L.isArray(val)) {
            // Recusively flattens any nested arrays.
            result.push.apply(result, A.flatten(val));
        } else {
            result.push(val);
        }
    }

    return result;
};


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('array-invoke', function (Y, NAME) {

/**
@module collection
@submodule array-invoke
*/

/**
Executes a named method on each item in an array of objects. Items in the array
that do not have a function by that name will be skipped.

@example

    Y.Array.invoke(arrayOfDrags, 'plug', Y.Plugin.DDProxy);

@method invoke
@param {Array} items Array of objects supporting the named method.
@param {String} name the name of the method to execute on each item.
@param {Any} [args*] Any number of additional args are passed as parameters to
  the execution of the named method.
@return {Array} All return values, indexed according to the item index.
@static
@for Array
**/
Y.Array.invoke = function(items, name) {
    var args = Y.Array(arguments, 2, true),
        isFunction = Y.Lang.isFunction,
        ret = [];

    Y.Array.each(Y.Array(items), function(item, i) {
        if (item && isFunction(item[name])) {
            ret[i] = item[name].apply(item, args);
        }
    });

    return ret;
};


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('arraylist', function (Y, NAME) {

/**
 * Collection utilities beyond what is provided in the YUI core
 * @module collection
 * @submodule arraylist
 */

var YArray      = Y.Array,
    YArray_each = YArray.each,
    ArrayListProto;

/**
 * Generic ArrayList class for managing lists of items and iterating operations
 * over them.  The targeted use for this class is for augmentation onto a
 * class that is responsible for managing multiple instances of another class
 * (e.g. NodeList for Nodes).  The recommended use is to augment your class with
 * ArrayList, then use ArrayList.addMethod to mirror the API of the constituent
 * items on the list's API.
 *
 * The default implementation creates immutable lists, but mutability can be
 * provided via the arraylist-add submodule or by implementing mutation methods
 * directly on the augmented class's prototype.
 *
 * @class ArrayList
 * @constructor
 * @param items { Array } array of items this list will be responsible for
 */
function ArrayList( items ) {
    if ( items !== undefined ) {
        this._items = Y.Lang.isArray( items ) ? items : YArray( items );
    } else {
        // ||= to support lazy initialization from augment
        this._items = this._items || [];
    }
}

ArrayListProto = {
    /**
     * Get an item by index from the list.  Override this method if managing a
     * list of objects that have a different public representation (e.g. Node
     * instances vs DOM nodes).  The iteration methods that accept a user
     * function will use this method for access list items for operation.
     *
     * @method item
     * @param i { Integer } index to fetch
     * @return { mixed } the item at the requested index
     */
    item: function ( i ) {
        return this._items[i];
    },

    /**
     * <p>Execute a function on each item of the list, optionally providing a
     * custom execution context.  Default context is the item.</p>
     *
     * <p>The callback signature is <code>callback( item, index )</code>.</p>
     *
     * @method each
     * @param fn { Function } the function to execute
     * @param context { mixed } optional override 'this' in the function
     * @return { ArrayList } this instance
     * @chainable
     */
    each: function ( fn, context ) {
        YArray_each( this._items, function ( item, i ) {
            item = this.item( i );

            fn.call( context || item, item, i, this );
        }, this);

        return this;
    },

    /**
     * <p>Execute a function on each item of the list, optionally providing a
     * custom execution context.  Default context is the item.</p>
     *
     * <p>The callback signature is <code>callback( item, index )</code>.</p>
     *
     * <p>Unlike <code>each</code>, if the callback returns true, the
     * iteration will stop.</p>
     *
     * @method some
     * @param fn { Function } the function to execute
     * @param context { mixed } optional override 'this' in the function
     * @return { Boolean } True if the function returned true on an item
     */
    some: function ( fn, context ) {
        return YArray.some( this._items, function ( item, i ) {
            item = this.item( i );

            return fn.call( context || item, item, i, this );
        }, this);
    },

    /**
     * Finds the first index of the needle in the managed array of items.
     *
     * @method indexOf
     * @param needle { mixed } The item to search for
     * @return { Integer } Array index if found.  Otherwise -1
     */
    indexOf: function ( needle ) {
        return YArray.indexOf( this._items, needle );
    },

    /**
     * How many items are in this list?
     *
     * @method size
     * @return { Integer } Number of items in the list
     */
    size: function () {
        return this._items.length;
    },

    /**
     * Is this instance managing any items?
     *
     * @method isEmpty
     * @return { Boolean } true if 1 or more items are being managed
     */
    isEmpty: function () {
        return !this.size();
    },

    /**
     * Provides an array-like representation for JSON.stringify.
     *
     * @method toJSON
     * @return { Array } an array representation of the ArrayList
     */
    toJSON: function () {
        return this._items;
    }
};
// Default implementation does not distinguish between public and private
// item getter
/**
 * Protected method for optimizations that may be appropriate for API
 * mirroring. Similar in functionality to <code>item</code>, but is used by
 * methods added with <code>ArrayList.addMethod()</code>.
 *
 * @method _item
 * @protected
 * @param i { Integer } Index of item to fetch
 * @return { mixed } The item appropriate for pass through API methods
 */
ArrayListProto._item = ArrayListProto.item;

// Mixed onto existing proto to preserve constructor NOT being an own property.
// This has bitten me when composing classes by enumerating, copying prototypes.
Y.mix(ArrayList.prototype, ArrayListProto);

Y.mix( ArrayList, {

    /**
     * <p>Adds a pass through method to dest (typically the prototype of a list
     * class) that calls the named method on each item in the list with
     * whatever parameters are passed in.  Allows for API indirection via list
     * instances.</p>
     *
     * <p>Accepts a single string name or an array of string names.</p>
     *
     * <pre><code>list.each( function ( item ) {
     *     item.methodName( 1, 2, 3 );
     * } );
     * // becomes
     * list.methodName( 1, 2, 3 );</code></pre>
     *
     * <p>Additionally, the pass through methods use the item retrieved by the
     * <code>_item</code> method in case there is any special behavior that is
     * appropriate for API mirroring.</p>
     *
     * <p>If the iterated method returns a value, the return value from the
     * added method will be an array of values with each value being at the
     * corresponding index for that item.  If the iterated method does not
     * return a value, the added method will be chainable.
     *
     * @method addMethod
     * @static
     * @param dest {Object} Object or prototype to receive the iterator method
     * @param name {String|String[]} Name of method of methods to create
     */
    addMethod: function ( dest, names ) {

        names = YArray( names );

        YArray_each( names, function ( name ) {
            dest[ name ] = function () {
                var args = YArray( arguments, 0, true ),
                    ret  = [];

                YArray_each( this._items, function ( item, i ) {
                    item = this._item( i );

                    var result = item[ name ].apply( item, args );

                    if ( result !== undefined && result !== item ) {
                        ret[i] = result;
                    }
                }, this);

                return ret.length ? ret : this;
            };
        } );
    }
} );

Y.ArrayList = ArrayList;


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('model', function (Y, NAME) {

/**
Attribute-based data model with APIs for getting, setting, validating, and
syncing attribute values, as well as events for being notified of model changes.

@module app
@submodule model
@since 3.4.0
**/

/**
Attribute-based data model with APIs for getting, setting, validating, and
syncing attribute values, as well as events for being notified of model changes.

In most cases, you'll want to create your own subclass of `Y.Model` and
customize it to meet your needs. In particular, the `sync()` and `validate()`
methods are meant to be overridden by custom implementations. You may also want
to override the `parse()` method to parse non-generic server responses.

@class Model
@constructor
@extends Base
@since 3.4.0
**/

var GlobalEnv = YUI.namespace('Env.Model'),
    Lang      = Y.Lang,
    YArray    = Y.Array,
    YObject   = Y.Object,

    /**
    Fired when one or more attributes on this model are changed.

    @event change
    @param {Object} changed Hash of change information for each attribute that
        changed. Each item in the hash has the following properties:
      @param {Any} changed.newVal New value of the attribute.
      @param {Any} changed.prevVal Previous value of the attribute.
      @param {String|null} changed.src Source of the change event, if any.
    **/
    EVT_CHANGE = 'change',

    /**
    Fired when an error occurs, such as when the model doesn't validate or when
    a sync layer response can't be parsed.

    @event error
    @param {Any} error Error message, object, or exception generated by the
      error. Calling `toString()` on this should result in a meaningful error
      message.
    @param {String} src Source of the error. May be one of the following (or any
      custom error source defined by a Model subclass):

      * `load`: An error loading the model from a sync layer. The sync layer's
        response (if any) will be provided as the `response` property on the
        event facade.

      * `parse`: An error parsing a JSON response. The response in question will
        be provided as the `response` property on the event facade.

      * `save`: An error saving the model to a sync layer. The sync layer's
        response (if any) will be provided as the `response` property on the
        event facade.

      * `validate`: The model failed to validate. The attributes being validated
        will be provided as the `attributes` property on the event facade.
    **/
    EVT_ERROR = 'error',

    /**
    Fired after model attributes are loaded from a sync layer.

    @event load
    @param {Object} parsed The parsed version of the sync layer's response to
        the load request.
    @param {any} response The sync layer's raw, unparsed response to the load
        request.
    @since 3.5.0
    **/
    EVT_LOAD = 'load',

    /**
    Fired after model attributes are saved to a sync layer.

    @event save
    @param {Object} [parsed] The parsed version of the sync layer's response to
        the save request, if there was a response.
    @param {any} [response] The sync layer's raw, unparsed response to the save
        request, if there was one.
    @since 3.5.0
    **/
    EVT_SAVE = 'save';

function Model() {
    Model.superclass.constructor.apply(this, arguments);
}

Y.Model = Y.extend(Model, Y.Base, {
    // -- Public Properties ----------------------------------------------------

    /**
    Hash of attributes that have changed since the last time this model was
    saved.

    @property changed
    @type Object
    @default {}
    **/

    /**
    Name of the attribute to use as the unique id (or primary key) for this
    model.

    The default is `id`, but if your persistence layer uses a different name for
    the primary key (such as `_id` or `uid`), you can specify that here.

    The built-in `id` attribute will always be an alias for whatever attribute
    name you specify here, so getting and setting `id` will always behave the
    same as getting and setting your custom id attribute.

    @property idAttribute
    @type String
    @default `'id'`
    **/
    idAttribute: 'id',

    /**
    Hash of attributes that were changed in the last `change` event. Each item
    in this hash is an object with the following properties:

      * `newVal`: The new value of the attribute after it changed.
      * `prevVal`: The old value of the attribute before it changed.
      * `src`: The source of the change, or `null` if no source was specified.

    @property lastChange
    @type Object
    @default {}
    **/

    /**
    Array of `ModelList` instances that contain this model.

    When a model is in one or more lists, the model's events will bubble up to
    those lists. You can subscribe to a model event on a list to be notified
    when any model in the list fires that event.

    This property is updated automatically when this model is added to or
    removed from a `ModelList` instance. You shouldn't alter it manually. When
    working with models in a list, you should always add and remove models using
    the list's `add()` and `remove()` methods.

    @example Subscribing to model events on a list:

        // Assuming `list` is an existing Y.ModelList instance.
        list.on('*:change', function (e) {
            // This function will be called whenever any model in the list
            // fires a `change` event.
            //
            // `e.target` will refer to the model instance that fired the
            // event.
        });

    @property lists
    @type ModelList[]
    @default `[]`
    **/

    // -- Protected Properties -------------------------------------------------

    /**
    This tells `Y.Base` that it should create ad-hoc attributes for config
    properties passed to Model's constructor. This makes it possible to
    instantiate a model and set a bunch of attributes without having to subclass
    `Y.Model` and declare all those attributes first.

    @property _allowAdHocAttrs
    @type Boolean
    @default true
    @protected
    @since 3.5.0
    **/
    _allowAdHocAttrs: true,

    /**
    Total hack to allow us to identify Model instances without using
    `instanceof`, which won't work when the instance was created in another
    window or YUI sandbox.

    @property _isYUIModel
    @type Boolean
    @default true
    @protected
    @since 3.5.0
    **/
    _isYUIModel: true,

    // -- Lifecycle Methods ----------------------------------------------------
    initializer: function (config) {
        this.changed    = {};
        this.lastChange = {};
        this.lists      = [];
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Destroys this model instance and removes it from its containing lists, if
    any.

    The _callback_, if one is provided, will be called after the model is
    destroyed.

    If `options.remove` is `true`, then this method delegates to the `sync()`
    method to delete the model from the persistence layer, which is an
    asynchronous action. In this case, the _callback_ (if provided) will be
    called after the sync layer indicates success or failure of the delete
    operation.

    @method destroy
    @param {Object} [options] Sync options. It's up to the custom sync
        implementation to determine what options it supports or requires, if
        any.
      @param {Boolean} [options.remove=false] If `true`, the model will be
        deleted via the sync layer in addition to the instance being destroyed.
    @param {Function} [callback] Called after the model has been destroyed (and
        deleted via the sync layer if `options.remove` is `true`).
      @param {Error|null} callback.err If an error occurred, this parameter will
        contain the error. Otherwise _err_ will be `null`.
    @chainable
    **/
    destroy: function (options, callback) {
        var self = this;

        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = null;
        }

        self.onceAfter('destroy', function () {
            function finish(err) {
                if (!err) {
                    YArray.each(self.lists.concat(), function (list) {
                        list.remove(self, options);
                    });
                }

                callback && callback.apply(null, arguments);
            }

            if (options && (options.remove || options['delete'])) {
                self.sync('delete', options, finish);
            } else {
                finish();
            }
        });

        return Model.superclass.destroy.call(self);
    },

    /**
    Returns a clientId string that's unique among all models on the current page
    (even models in other YUI instances). Uniqueness across pageviews is
    unlikely.

    @method generateClientId
    @return {String} Unique clientId.
    **/
    generateClientId: function () {
        GlobalEnv.lastId || (GlobalEnv.lastId = 0);
        return this.constructor.NAME + '_' + (GlobalEnv.lastId += 1);
    },

    /**
    Returns the value of the specified attribute.

    If the attribute's value is an object, _name_ may use dot notation to
    specify the path to a specific property within the object, and the value of
    that property will be returned.

    @example
        // Set the 'foo' attribute to an object.
        myModel.set('foo', {
            bar: {
                baz: 'quux'
            }
        });

        // Get the value of 'foo'.
        myModel.get('foo');
        // => {bar: {baz: 'quux'}}

        // Get the value of 'foo.bar.baz'.
        myModel.get('foo.bar.baz');
        // => 'quux'

    @method get
    @param {String} name Attribute name or object property path.
    @return {Any} Attribute value, or `undefined` if the attribute doesn't
      exist.
    **/

    // get() is defined by Y.Attribute.

    /**
    Returns an HTML-escaped version of the value of the specified string
    attribute. The value is escaped using `Y.Escape.html()`.

    @method getAsHTML
    @param {String} name Attribute name or object property path.
    @return {String} HTML-escaped attribute value.
    **/
    getAsHTML: function (name) {
        var value = this.get(name);
        return Y.Escape.html(Lang.isValue(value) ? String(value) : '');
    },

    /**
    Returns a URL-encoded version of the value of the specified string
    attribute. The value is encoded using the native `encodeURIComponent()`
    function.

    @method getAsURL
    @param {String} name Attribute name or object property path.
    @return {String} URL-encoded attribute value.
    **/
    getAsURL: function (name) {
        var value = this.get(name);
        return encodeURIComponent(Lang.isValue(value) ? String(value) : '');
    },

    /**
    Returns `true` if any attribute of this model has been changed since the
    model was last saved.

    New models (models for which `isNew()` returns `true`) are implicitly
    considered to be "modified" until the first time they're saved.

    @method isModified
    @return {Boolean} `true` if this model has changed since it was last saved,
      `false` otherwise.
    **/
    isModified: function () {
        return this.isNew() || !YObject.isEmpty(this.changed);
    },

    /**
    Returns `true` if this model is "new", meaning it hasn't been saved since it
    was created.

    Newness is determined by checking whether the model's `id` attribute has
    been set. An empty id is assumed to indicate a new model, whereas a
    non-empty id indicates a model that was either loaded or has been saved
    since it was created.

    @method isNew
    @return {Boolean} `true` if this model is new, `false` otherwise.
    **/
    isNew: function () {
        return !Lang.isValue(this.get('id'));
    },

    /**
    Loads this model from the server.

    This method delegates to the `sync()` method to perform the actual load
    operation, which is an asynchronous action. Specify a _callback_ function to
    be notified of success or failure.

    A successful load operation will fire a `load` event, while an unsuccessful
    load operation will fire an `error` event with the `src` value "load".

    If the load operation succeeds and one or more of the loaded attributes
    differ from this model's current attributes, a `change` event will be fired.

    @method load
    @param {Object} [options] Options to be passed to `sync()` and to `set()`
      when setting the loaded attributes. It's up to the custom sync
      implementation to determine what options it supports or requires, if any.
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error|null} callback.err If an error occurred, this parameter will
        contain the error. If the sync operation succeeded, _err_ will be
        `null`.
      @param {Any} callback.response The server's response. This value will
        be passed to the `parse()` method, which is expected to parse it and
        return an attribute hash.
    @chainable
    **/
    load: function (options, callback) {
        var self = this;

        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        options || (options = {});

        self.sync('read', options, function (err, response) {
            var facade = {
                    options : options,
                    response: response
                },

                parsed;

            if (err) {
                facade.error = err;
                facade.src   = 'load';

                self.fire(EVT_ERROR, facade);
            } else {
                // Lazy publish.
                if (!self._loadEvent) {
                    self._loadEvent = self.publish(EVT_LOAD, {
                        preventable: false
                    });
                }

                parsed = facade.parsed = self._parse(response);

                self.setAttrs(parsed, options);
                self.changed = {};

                self.fire(EVT_LOAD, facade);
            }

            callback && callback.apply(null, arguments);
        });

        return self;
    },

    /**
    Called to parse the _response_ when the model is loaded from the server.
    This method receives a server _response_ and is expected to return an
    attribute hash.

    The default implementation assumes that _response_ is either an attribute
    hash or a JSON string that can be parsed into an attribute hash. If
    _response_ is a JSON string and either `Y.JSON` or the native `JSON` object
    are available, it will be parsed automatically. If a parse error occurs, an
    `error` event will be fired and the model will not be updated.

    You may override this method to implement custom parsing logic if necessary.

    @method parse
    @param {Any} response Server response.
    @return {Object} Attribute hash.
    **/
    parse: function (response) {
        if (typeof response === 'string') {
            try {
                return Y.JSON.parse(response);
            } catch (ex) {
                this.fire(EVT_ERROR, {
                    error   : ex,
                    response: response,
                    src     : 'parse'
                });

                return null;
            }
        }

        return response;
    },

    /**
    Saves this model to the server.

    This method delegates to the `sync()` method to perform the actual save
    operation, which is an asynchronous action. Specify a _callback_ function to
    be notified of success or failure.

    A successful save operation will fire a `save` event, while an unsuccessful
    save operation will fire an `error` event with the `src` value "save".

    If the save operation succeeds and one or more of the attributes returned in
    the server's response differ from this model's current attributes, a
    `change` event will be fired.

    @method save
    @param {Object} [options] Options to be passed to `sync()` and to `set()`
      when setting synced attributes. It's up to the custom sync implementation
      to determine what options it supports or requires, if any.
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error|null} callback.err If an error occurred or validation
        failed, this parameter will contain the error. If the sync operation
        succeeded, _err_ will be `null`.
      @param {Any} callback.response The server's response. This value will
        be passed to the `parse()` method, which is expected to parse it and
        return an attribute hash.
    @chainable
    **/
    save: function (options, callback) {
        var self = this;

        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        options || (options = {});

        self._validate(self.toJSON(), function (err) {
            if (err) {
                callback && callback.call(null, err);
                return;
            }

            self.sync(self.isNew() ? 'create' : 'update', options, function (err, response) {
                var facade = {
                        options : options,
                        response: response
                    },

                    parsed;

                if (err) {
                    facade.error = err;
                    facade.src   = 'save';

                    self.fire(EVT_ERROR, facade);
                } else {
                    // Lazy publish.
                    if (!self._saveEvent) {
                        self._saveEvent = self.publish(EVT_SAVE, {
                            preventable: false
                        });
                    }

                    if (response) {
                        parsed = facade.parsed = self._parse(response);
                        self.setAttrs(parsed, options);
                    }

                    self.changed = {};
                    self.fire(EVT_SAVE, facade);
                }

                callback && callback.apply(null, arguments);
            });
        });

        return self;
    },

    /**
    Sets the value of a single attribute. If model validation fails, the
    attribute will not be set and an `error` event will be fired.

    Use `setAttrs()` to set multiple attributes at once.

    @example
        model.set('foo', 'bar');

    @method set
    @param {String} name Attribute name or object property path.
    @param {any} value Value to set.
    @param {Object} [options] Data to be mixed into the event facade of the
        `change` event(s) for these attributes.
      @param {Boolean} [options.silent=false] If `true`, no `change` event will
          be fired.
    @chainable
    **/
    set: function (name, value, options) {
        var attributes = {};
        attributes[name] = value;

        return this.setAttrs(attributes, options);
    },

    /**
    Sets the values of multiple attributes at once. If model validation fails,
    the attributes will not be set and an `error` event will be fired.

    @example
        model.setAttrs({
            foo: 'bar',
            baz: 'quux'
        });

    @method setAttrs
    @param {Object} attributes Hash of attribute names and values to set.
    @param {Object} [options] Data to be mixed into the event facade of the
        `change` event(s) for these attributes.
      @param {Boolean} [options.silent=false] If `true`, no `change` event will
          be fired.
    @chainable
    **/
    setAttrs: function (attributes, options) {
        var idAttribute = this.idAttribute,
            changed, e, key, lastChange, transaction;

        // Makes a shallow copy of the `options` object before adding the
        // `_transaction` object to it so we don't modify someone else's object.
        options     = Y.merge(options);
        transaction = options._transaction = {};

        // When a custom id attribute is in use, always keep the default `id`
        // attribute in sync.
        if (idAttribute !== 'id') {
            // So we don't modify someone else's object.
            attributes = Y.merge(attributes);

            if (YObject.owns(attributes, idAttribute)) {
                attributes.id = attributes[idAttribute];
            } else if (YObject.owns(attributes, 'id')) {
                attributes[idAttribute] = attributes.id;
            }
        }

        for (key in attributes) {
            if (YObject.owns(attributes, key)) {
                this._setAttr(key, attributes[key], options);
            }
        }

        if (!YObject.isEmpty(transaction)) {
            changed    = this.changed;
            lastChange = this.lastChange = {};

            for (key in transaction) {
                if (YObject.owns(transaction, key)) {
                    e = transaction[key];

                    changed[key] = e.newVal;

                    lastChange[key] = {
                        newVal : e.newVal,
                        prevVal: e.prevVal,
                        src    : e.src || null
                    };
                }
            }

            if (!options.silent) {
                // Lazy publish for the change event.
                if (!this._changeEvent) {
                    this._changeEvent = this.publish(EVT_CHANGE, {
                        preventable: false
                    });
                }

                options.changed = lastChange;

                this.fire(EVT_CHANGE, options);
            }
        }

        return this;
    },

    /**
    Override this method to provide a custom persistence implementation for this
    model. The default just calls the callback without actually doing anything.

    This method is called internally by `load()`, `save()`, and `destroy()`, and
    their implementations rely on the callback being called. This effectively
    means that when a callback is provided, it must be called at some point for
    the class to operate correctly.

    @method sync
    @param {String} action Sync action to perform. May be one of the following:

      * `create`: Store a newly-created model for the first time.
      * `delete`: Delete an existing model.
      * `read`  : Load an existing model.
      * `update`: Update an existing model.

    @param {Object} [options] Sync options. It's up to the custom sync
      implementation to determine what options it supports or requires, if any.
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error|null} callback.err If an error occurred, this parameter will
        contain the error. If the sync operation succeeded, _err_ will be
        falsy.
      @param {Any} [callback.response] The server's response.
    **/
    sync: function (/* action, options, callback */) {
        var callback = YArray(arguments, 0, true).pop();

        if (typeof callback === 'function') {
            callback();
        }
    },

    /**
    Returns a copy of this model's attributes that can be passed to
    `Y.JSON.stringify()` or used for other nefarious purposes.

    The `clientId` attribute is not included in the returned object.

    If you've specified a custom attribute name in the `idAttribute` property,
    the default `id` attribute will not be included in the returned object.

    Note: The ECMAScript 5 specification states that objects may implement a
    `toJSON` method to provide an alternate object representation to serialize
    when passed to `JSON.stringify(obj)`.  This allows class instances to be
    serialized as if they were plain objects.  This is why Model's `toJSON`
    returns an object, not a JSON string.

    See <http://es5.github.com/#x15.12.3> for details.

    @method toJSON
    @return {Object} Copy of this model's attributes.
    **/
    toJSON: function () {
        var attrs = this.getAttrs();

        delete attrs.clientId;
        delete attrs.destroyed;
        delete attrs.initialized;

        if (this.idAttribute !== 'id') {
            delete attrs.id;
        }

        return attrs;
    },

    /**
    Reverts the last change to the model.

    If an _attrNames_ array is provided, then only the named attributes will be
    reverted (and only if they were modified in the previous change). If no
    _attrNames_ array is provided, then all changed attributes will be reverted
    to their previous values.

    Note that only one level of undo is available: from the current state to the
    previous state. If `undo()` is called when no previous state is available,
    it will simply do nothing.

    @method undo
    @param {String[]} [attrNames] Array of specific attribute names to revert. If
      not specified, all attributes modified in the last change will be
      reverted.
    @param {Object} [options] Data to be mixed into the event facade of the
        change event(s) for these attributes.
      @param {Boolean} [options.silent=false] If `true`, no `change` event will
          be fired.
    @chainable
    **/
    undo: function (attrNames, options) {
        var lastChange  = this.lastChange,
            idAttribute = this.idAttribute,
            toUndo      = {},
            needUndo;

        attrNames || (attrNames = YObject.keys(lastChange));

        YArray.each(attrNames, function (name) {
            if (YObject.owns(lastChange, name)) {
                // Don't generate a double change for custom id attributes.
                name = name === idAttribute ? 'id' : name;

                needUndo     = true;
                toUndo[name] = lastChange[name].prevVal;
            }
        });

        return needUndo ? this.setAttrs(toUndo, options) : this;
    },

    /**
    Override this method to provide custom validation logic for this model.

    While attribute-specific validators can be used to validate individual
    attributes, this method gives you a hook to validate a hash of all
    attributes before the model is saved. This method is called automatically
    before `save()` takes any action. If validation fails, the `save()` call
    will be aborted.

    In your validation method, call the provided `callback` function with no
    arguments to indicate success. To indicate failure, pass a single argument,
    which may contain an error message, an array of error messages, or any other
    value. This value will be passed along to the `error` event.

    @example

        model.validate = function (attrs, callback) {
            if (attrs.pie !== true) {
                // No pie?! Invalid!
                callback('Must provide pie.');
                return;
            }

            // Success!
            callback();
        };

    @method validate
    @param {Object} attrs Attribute hash containing all model attributes to
        be validated.
    @param {Function} callback Validation callback. Call this function when your
        validation logic finishes. To trigger a validation failure, pass any
        value as the first argument to the callback (ideally a meaningful
        validation error of some kind).

        @param {Any} [callback.err] Validation error. Don't provide this
            argument if validation succeeds. If validation fails, set this to an
            error message or some other meaningful value. It will be passed
            along to the resulting `error` event.
    **/
    validate: function (attrs, callback) {
        callback && callback();
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    Duckpunches the `addAttr` method provided by `Y.Attribute` to keep the
    `id` attribute’s value and a custom id attribute’s (if provided) value
    in sync when adding the attributes to the model instance object.

    Marked as protected to hide it from Model's public API docs, even though
    this is a public method in Attribute.

    @method addAttr
    @param {String} name The name of the attribute.
    @param {Object} config An object with attribute configuration property/value
      pairs, specifying the configuration for the attribute.
    @param {Boolean} lazy (optional) Whether or not to add this attribute lazily
      (on the first call to get/set).
    @return {Object} A reference to the host object.
    @chainable
    @protected
    **/
    addAttr: function (name, config, lazy) {
        var idAttribute = this.idAttribute,
            idAttrCfg, id;

        if (idAttribute && name === idAttribute) {
            idAttrCfg = this._isLazyAttr('id') || this._getAttrCfg('id');
            id        = config.value === config.defaultValue ? null : config.value;

            if (!Lang.isValue(id)) {
                // Hunt for the id value.
                id = idAttrCfg.value === idAttrCfg.defaultValue ? null : idAttrCfg.value;

                if (!Lang.isValue(id)) {
                    // No id value provided on construction, check defaults.
                    id = Lang.isValue(config.defaultValue) ?
                        config.defaultValue :
                        idAttrCfg.defaultValue;
                }
            }

            config.value = id;

            // Make sure `id` is in sync.
            if (idAttrCfg.value !== id) {
                idAttrCfg.value = id;

                if (this._isLazyAttr('id')) {
                    this._state.add('id', 'lazy', idAttrCfg);
                } else {
                    this._state.add('id', 'value', id);
                }
            }
        }

        return Model.superclass.addAttr.apply(this, arguments);
    },

    /**
    Calls the public, overrideable `parse()` method and returns the result.

    Override this method to provide a custom pre-parsing implementation. This
    provides a hook for custom persistence implementations to "prep" a response
    before calling the `parse()` method.

    @method _parse
    @param {Any} response Server response.
    @return {Object} Attribute hash.
    @protected
    @see Model.parse()
    @since 3.7.0
    **/
    _parse: function (response) {
        return this.parse(response);
    },

    /**
    Calls the public, overridable `validate()` method and fires an `error` event
    if validation fails.

    @method _validate
    @param {Object} attributes Attribute hash.
    @param {Function} callback Validation callback.
        @param {Any} [callback.err] Value on failure, non-value on success.
    @protected
    **/
    _validate: function (attributes, callback) {
        var self = this;

        function handler(err) {
            if (Lang.isValue(err)) {
                // Validation failed. Fire an error.
                self.fire(EVT_ERROR, {
                    attributes: attributes,
                    error     : err,
                    src       : 'validate'
                });

                callback(err);
                return;
            }

            callback();
        }

        if (self.validate.length === 1) {
            // Backcompat for 3.4.x-style synchronous validate() functions that
            // don't take a callback argument.
            handler(self.validate(attributes, handler));
        } else {
            self.validate(attributes, handler);
        }
    },

    // -- Private Methods ----------------------------------------------------

    /**
     Overrides AttributeCore's `_setAttrVal`, to register the changed value if it's part
     of a Model `setAttrs` transaction.

     NOTE: AttributeCore's `_setAttrVal` is currently private, but until we support coalesced
     change events in attribute, we need this override.

     @method _setAttrVal
     @private
     @param {String} attrName The attribute name.
     @param {String} subAttrName The sub-attribute name, if setting a sub-attribute property ("x.y.z").
     @param {Any} prevVal The currently stored value of the attribute.
     @param {Any} newVal The value which is going to be stored.
     @param {Object} [opts] Optional data providing the circumstances for the change.
     @param {Object} [attrCfg] Optional config hash for the attribute. This is added for performance along the critical path,
     where the calling method has already obtained the config from state.

     @return {boolean} true if the new attribute value was stored, false if not.
     **/
    _setAttrVal : function(attrName, subAttrName, prevVal, newVal, opts, attrCfg) {

        var didChange = Model.superclass._setAttrVal.apply(this, arguments),
            transaction = opts && opts._transaction,
            initializing = attrCfg && attrCfg.initializing;

        // value actually changed inside a model setAttrs transaction
        if (didChange && transaction && !initializing) {
            transaction[attrName] = {
                newVal: this.get(attrName), // newVal may be impacted by getter
                prevVal: prevVal,
                src: opts.src || null
            };
        }

        return didChange;
    }

}, {
    NAME: 'model',

    ATTRS: {
        /**
        A client-only identifier for this model.

        Like the `id` attribute, `clientId` may be used to retrieve model
        instances from lists. Unlike the `id` attribute, `clientId` is
        automatically generated, and is only intended to be used on the client
        during the current pageview.

        @attribute clientId
        @type String
        @readOnly
        **/
        clientId: {
            valueFn : 'generateClientId',
            readOnly: true
        },

        /**
        A unique identifier for this model. Among other things, this id may be
        used to retrieve model instances from lists, so it should be unique.

        If the id is empty, this model instance is assumed to represent a new
        item that hasn't yet been saved.

        If you would prefer to use a custom attribute as this model's id instead
        of using the `id` attribute (for example, maybe you'd rather use `_id`
        or `uid` as the primary id), you may set the `idAttribute` property to
        the name of your custom id attribute. The `id` attribute will then
        act as an alias for your custom attribute.

        @attribute id
        @type String|Number|null
        @default `null`
        **/
        id: {value: null}
    }
});


}, '3.16.0', {"requires": ["base-build", "escape", "json-parse"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('model-list', function (Y, NAME) {

/**
Provides an API for managing an ordered list of Model instances.

@module app
@submodule model-list
@since 3.4.0
**/

/**
Provides an API for managing an ordered list of Model instances.

In addition to providing convenient `add`, `create`, `reset`, and `remove`
methods for managing the models in the list, ModelLists are also bubble targets
for events on the model instances they contain. This means, for example, that
you can add several models to a list, and then subscribe to the `*:change` event
on the list to be notified whenever any model in the list changes.

ModelLists also maintain sort order efficiently as models are added and removed,
based on a custom `comparator` function you may define (if no comparator is
defined, models are sorted in insertion order).

@class ModelList
@extends Base
@uses ArrayList
@constructor
@param {Object} config Config options.
    @param {Model|Model[]|ModelList|Object|Object[]} config.items Model
        instance, array of model instances, or ModelList to add to this list on
        init. The `add` event will not be fired for models added on init.
@since 3.4.0
**/

var AttrProto = Y.Attribute.prototype,
    Lang      = Y.Lang,
    YArray    = Y.Array,

    /**
    Fired when a model is added to the list.

    Listen to the `on` phase of this event to be notified before a model is
    added to the list. Calling `e.preventDefault()` during the `on` phase will
    prevent the model from being added.

    Listen to the `after` phase of this event to be notified after a model has
    been added to the list.

    @event add
    @param {Model} model The model being added.
    @param {Number} index The index at which the model will be added.
    @preventable _defAddFn
    **/
    EVT_ADD = 'add',

    /**
    Fired when a model is created or updated via the `create()` method, but
    before the model is actually saved or added to the list. The `add` event
    will be fired after the model has been saved and added to the list.

    @event create
    @param {Model} model The model being created/updated.
    @since 3.5.0
    **/
    EVT_CREATE = 'create',

    /**
    Fired when an error occurs, such as when an attempt is made to add a
    duplicate model to the list, or when a sync layer response can't be parsed.

    @event error
    @param {Any} error Error message, object, or exception generated by the
      error. Calling `toString()` on this should result in a meaningful error
      message.
    @param {String} src Source of the error. May be one of the following (or any
      custom error source defined by a ModelList subclass):

      * `add`: Error while adding a model (probably because it's already in the
         list and can't be added again). The model in question will be provided
         as the `model` property on the event facade.
      * `parse`: An error parsing a JSON response. The response in question will
         be provided as the `response` property on the event facade.
      * `remove`: Error while removing a model (probably because it isn't in the
        list and can't be removed). The model in question will be provided as
        the `model` property on the event facade.
    **/
    EVT_ERROR = 'error',

    /**
    Fired after models are loaded from a sync layer.

    @event load
    @param {Object} parsed The parsed version of the sync layer's response to
        the load request.
    @param {Mixed} response The sync layer's raw, unparsed response to the load
        request.
    @since 3.5.0
    **/
    EVT_LOAD = 'load',

    /**
    Fired when a model is removed from the list.

    Listen to the `on` phase of this event to be notified before a model is
    removed from the list. Calling `e.preventDefault()` during the `on` phase
    will prevent the model from being removed.

    Listen to the `after` phase of this event to be notified after a model has
    been removed from the list.

    @event remove
    @param {Model} model The model being removed.
    @param {Number} index The index of the model being removed.
    @preventable _defRemoveFn
    **/
    EVT_REMOVE = 'remove',

    /**
    Fired when the list is completely reset via the `reset()` method or sorted
    via the `sort()` method.

    Listen to the `on` phase of this event to be notified before the list is
    reset. Calling `e.preventDefault()` during the `on` phase will prevent
    the list from being reset.

    Listen to the `after` phase of this event to be notified after the list has
    been reset.

    @event reset
    @param {Model[]} models Array of the list's new models after the reset.
    @param {String} src Source of the event. May be either `'reset'` or
      `'sort'`.
    @preventable _defResetFn
    **/
    EVT_RESET = 'reset';

function ModelList() {
    ModelList.superclass.constructor.apply(this, arguments);
}

Y.ModelList = Y.extend(ModelList, Y.Base, {
    // -- Public Properties ----------------------------------------------------

    /**
    The `Model` class or subclass of the models in this list.

    The class specified here will be used to create model instances
    automatically based on attribute hashes passed to the `add()`, `create()`,
    and `reset()` methods.

    You may specify the class as an actual class reference or as a string that
    resolves to a class reference at runtime (the latter can be useful if the
    specified class will be loaded lazily).

    @property model
    @type Model|String
    @default Y.Model
    **/
    model: Y.Model,

    // -- Protected Properties -------------------------------------------------

    /**
    Total hack to allow us to identify ModelList instances without using
    `instanceof`, which won't work when the instance was created in another
    window or YUI sandbox.

    @property _isYUIModelList
    @type Boolean
    @default true
    @protected
    @since 3.5.0
    **/
    _isYUIModelList: true,

    // -- Lifecycle Methods ----------------------------------------------------
    initializer: function (config) {
        config || (config = {});

        var model = this.model = config.model || this.model;

        if (typeof model === 'string') {
            // Look for a namespaced Model class on `Y`.
            this.model = Y.Object.getValue(Y, model.split('.'));

            if (!this.model) {
                Y.error('ModelList: Model class not found: ' + model);
            }
        }

        this.publish(EVT_ADD,    {defaultFn: this._defAddFn});
        this.publish(EVT_RESET,  {defaultFn: this._defResetFn});
        this.publish(EVT_REMOVE, {defaultFn: this._defRemoveFn});

        this.after('*:idChange', this._afterIdChange);

        this._clear();

        if (config.items) {
            this.add(config.items, {silent: true});
        }
    },

    destructor: function () {
        this._clear();
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Adds the specified model or array of models to this list. You may also pass
    another ModelList instance, in which case all the models in that list will
    be added to this one as well.

    @example

        // Add a single model instance.
        list.add(new Model({foo: 'bar'}));

        // Add a single model, creating a new instance automatically.
        list.add({foo: 'bar'});

        // Add multiple models, creating new instances automatically.
        list.add([
            {foo: 'bar'},
            {baz: 'quux'}
        ]);

        // Add all the models in another ModelList instance.
        list.add(otherList);

    @method add
    @param {Model|Model[]|ModelList|Object|Object[]} models Model or array of
        models to add. May be existing model instances or hashes of model
        attributes, in which case new model instances will be created from the
        hashes. You may also pass a ModelList instance to add all the models it
        contains.
    @param {Object} [options] Data to be mixed into the event facade of the
        `add` event(s) for the added models.

        @param {Number} [options.index] Index at which to insert the added
            models. If not specified, the models will automatically be inserted
            in the appropriate place according to the current sort order as
            dictated by the `comparator()` method, if any.
        @param {Boolean} [options.silent=false] If `true`, no `add` event(s)
            will be fired.

    @return {Model|Model[]} Added model or array of added models.
    **/
    add: function (models, options) {
        var isList = models._isYUIModelList;

        if (isList || Lang.isArray(models)) {
            return YArray.map(isList ? models.toArray() : models, function (model, index) {
                var modelOptions = options || {};

                // When an explicit insertion index is specified, ensure that
                // the index is increased by one for each subsequent item in the
                // array.
                if ('index' in modelOptions) {
                    modelOptions = Y.merge(modelOptions, {
                        index: modelOptions.index + index
                    });
                }

                return this._add(model, modelOptions);
            }, this);
        } else {
            return this._add(models, options);
        }
    },

    /**
    Define this method to provide a function that takes a model as a parameter
    and returns a value by which that model should be sorted relative to other
    models in this list.

    By default, no comparator is defined, meaning that models will not be sorted
    (they'll be stored in the order they're added).

    @example
        var list = new Y.ModelList({model: Y.Model});

        list.comparator = function (model) {
            return model.get('id'); // Sort models by id.
        };

    @method comparator
    @param {Model} model Model being sorted.
    @return {Number|String} Value by which the model should be sorted relative
      to other models in this list.
    **/

    // comparator is not defined by default

    /**
    Creates or updates the specified model on the server, then adds it to this
    list if the server indicates success.

    @method create
    @param {Model|Object} model Model to create. May be an existing model
      instance or a hash of model attributes, in which case a new model instance
      will be created from the hash.
    @param {Object} [options] Options to be passed to the model's `sync()` and
        `set()` methods and mixed into the `create` and `add` event facades.
      @param {Boolean} [options.silent=false] If `true`, no `add` event(s) will
          be fired.
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error} callback.err If an error occurred, this parameter will
        contain the error. If the sync operation succeeded, _err_ will be
        falsy.
      @param {Any} callback.response The server's response.
    @return {Model} Created model.
    **/
    create: function (model, options, callback) {
        var self = this;

        // Allow callback as second arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        options || (options = {});

        if (!model._isYUIModel) {
            model = new this.model(model);
        }

        self.fire(EVT_CREATE, Y.merge(options, {
            model: model
        }));

        return model.save(options, function (err) {
            if (!err) {
                self.add(model, options);
            }

            if (callback) {
                callback.apply(null, arguments);
            }
        });
    },

    /**
    Executes the supplied function on each model in this list.

    By default, the callback function's `this` object will refer to the model
    currently being iterated. Specify a `thisObj` to override the `this` object
    if desired.

    Note: Iteration is performed on a copy of the internal array of models, so
    it's safe to delete a model from the list during iteration.

    @method each
    @param {Function} callback Function to execute on each model.
        @param {Model} callback.model Model instance.
        @param {Number} callback.index Index of the current model.
        @param {ModelList} callback.list The ModelList being iterated.
    @param {Object} [thisObj] Object to use as the `this` object when executing
        the callback.
    @chainable
    @since 3.6.0
    **/
    each: function (callback, thisObj) {
        var items = this._items.concat(),
            i, item, len;

        for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            callback.call(thisObj || item, item, i, this);
        }

        return this;
    },

    /**
    Executes the supplied function on each model in this list. Returns an array
    containing the models for which the supplied function returned a truthy
    value.

    The callback function's `this` object will refer to this ModelList. Use
    `Y.bind()` to bind the `this` object to another object if desired.

    @example

        // Get an array containing only the models whose "enabled" attribute is
        // truthy.
        var filtered = list.filter(function (model) {
            return model.get('enabled');
        });

        // Get a new ModelList containing only the models whose "enabled"
        // attribute is truthy.
        var filteredList = list.filter({asList: true}, function (model) {
            return model.get('enabled');
        });

    @method filter
    @param {Object} [options] Filter options.
        @param {Boolean} [options.asList=false] If truthy, results will be
            returned as a new ModelList instance rather than as an array.

    @param {Function} callback Function to execute on each model.
        @param {Model} callback.model Model instance.
        @param {Number} callback.index Index of the current model.
        @param {ModelList} callback.list The ModelList being filtered.

    @return {Model[]|ModelList} Array of models for which the callback function
        returned a truthy value (empty if it never returned a truthy value). If
        the `options.asList` option is truthy, a new ModelList instance will be
        returned instead of an array.
    @since 3.5.0
    */
    filter: function (options, callback) {
        var filtered = [],
            items    = this._items,
            i, item, len, list;

        // Allow options as first arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        for (i = 0, len = items.length; i < len; ++i) {
            item = items[i];

            if (callback.call(this, item, i, this)) {
                filtered.push(item);
            }
        }

        if (options.asList) {
            list = new this.constructor({model: this.model});

            if (filtered.length) {
                list.add(filtered, {silent: true});
            }

            return list;
        } else {
            return filtered;
        }
    },

    /**
    If _name_ refers to an attribute on this ModelList instance, returns the
    value of that attribute. Otherwise, returns an array containing the values
    of the specified attribute from each model in this list.

    @method get
    @param {String} name Attribute name or object property path.
    @return {Any|Any[]} Attribute value or array of attribute values.
    @see Model.get()
    **/
    get: function (name) {
        if (this.attrAdded(name)) {
            return AttrProto.get.apply(this, arguments);
        }

        return this.invoke('get', name);
    },

    /**
    If _name_ refers to an attribute on this ModelList instance, returns the
    HTML-escaped value of that attribute. Otherwise, returns an array containing
    the HTML-escaped values of the specified attribute from each model in this
    list.

    The values are escaped using `Escape.html()`.

    @method getAsHTML
    @param {String} name Attribute name or object property path.
    @return {String|String[]} HTML-escaped value or array of HTML-escaped
      values.
    @see Model.getAsHTML()
    **/
    getAsHTML: function (name) {
        if (this.attrAdded(name)) {
            return Y.Escape.html(AttrProto.get.apply(this, arguments));
        }

        return this.invoke('getAsHTML', name);
    },

    /**
    If _name_ refers to an attribute on this ModelList instance, returns the
    URL-encoded value of that attribute. Otherwise, returns an array containing
    the URL-encoded values of the specified attribute from each model in this
    list.

    The values are encoded using the native `encodeURIComponent()` function.

    @method getAsURL
    @param {String} name Attribute name or object property path.
    @return {String|String[]} URL-encoded value or array of URL-encoded values.
    @see Model.getAsURL()
    **/
    getAsURL: function (name) {
        if (this.attrAdded(name)) {
            return encodeURIComponent(AttrProto.get.apply(this, arguments));
        }

        return this.invoke('getAsURL', name);
    },

    /**
    Returns the model with the specified _clientId_, or `null` if not found.

    @method getByClientId
    @param {String} clientId Client id.
    @return {Model} Model, or `null` if not found.
    **/
    getByClientId: function (clientId) {
        return this._clientIdMap[clientId] || null;
    },

    /**
    Returns the model with the specified _id_, or `null` if not found.

    Note that models aren't expected to have an id until they're saved, so if
    you're working with unsaved models, it may be safer to call
    `getByClientId()`.

    @method getById
    @param {String|Number} id Model id.
    @return {Model} Model, or `null` if not found.
    **/
    getById: function (id) {
        return this._idMap[id] || null;
    },

    /**
    Calls the named method on every model in the list. Any arguments provided
    after _name_ will be passed on to the invoked method.

    @method invoke
    @param {String} name Name of the method to call on each model.
    @param {Any} [args*] Zero or more arguments to pass to the invoked method.
    @return {Any[]} Array of return values, indexed according to the index of
      the model on which the method was called.
    **/
    invoke: function (name /*, args* */) {
        var args = [this._items, name].concat(YArray(arguments, 1, true));
        return YArray.invoke.apply(YArray, args);
    },

    /**
    Returns the model at the specified _index_.

    @method item
    @param {Number} index Index of the model to fetch.
    @return {Model} The model at the specified index, or `undefined` if there
      isn't a model there.
    **/

    // item() is inherited from ArrayList.

    /**
    Loads this list of models from the server.

    This method delegates to the `sync()` method to perform the actual load
    operation, which is an asynchronous action. Specify a _callback_ function to
    be notified of success or failure.

    If the load operation succeeds, a `reset` event will be fired.

    @method load
    @param {Object} [options] Options to be passed to `sync()` and to
      `reset()` when adding the loaded models. It's up to the custom sync
      implementation to determine what options it supports or requires, if any.
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error} callback.err If an error occurred, this parameter will
        contain the error. If the sync operation succeeded, _err_ will be
        falsy.
      @param {Any} callback.response The server's response. This value will
        be passed to the `parse()` method, which is expected to parse it and
        return an array of model attribute hashes.
    @chainable
    **/
    load: function (options, callback) {
        var self = this;

        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        options || (options = {});

        this.sync('read', options, function (err, response) {
            var facade = {
                    options : options,
                    response: response
                },

                parsed;

            if (err) {
                facade.error = err;
                facade.src   = 'load';

                self.fire(EVT_ERROR, facade);
            } else {
                // Lazy publish.
                if (!self._loadEvent) {
                    self._loadEvent = self.publish(EVT_LOAD, {
                        preventable: false
                    });
                }

                parsed = facade.parsed = self._parse(response);

                self.reset(parsed, options);
                self.fire(EVT_LOAD, facade);
            }

            if (callback) {
                callback.apply(null, arguments);
            }
        });

        return this;
    },

    /**
    Executes the specified function on each model in this list and returns an
    array of the function's collected return values.

    @method map
    @param {Function} fn Function to execute on each model.
      @param {Model} fn.model Current model being iterated.
      @param {Number} fn.index Index of the current model in the list.
      @param {Model[]} fn.models Array of models being iterated.
    @param {Object} [thisObj] `this` object to use when calling _fn_.
    @return {Array} Array of return values from _fn_.
    **/
    map: function (fn, thisObj) {
        return YArray.map(this._items, fn, thisObj);
    },

    /**
    Called to parse the _response_ when the list is loaded from the server.
    This method receives a server _response_ and is expected to return an array
    of model attribute hashes.

    The default implementation assumes that _response_ is either an array of
    attribute hashes or a JSON string that can be parsed into an array of
    attribute hashes. If _response_ is a JSON string and either `Y.JSON` or the
    native `JSON` object are available, it will be parsed automatically. If a
    parse error occurs, an `error` event will be fired and the model will not be
    updated.

    You may override this method to implement custom parsing logic if necessary.

    @method parse
    @param {Any} response Server response.
    @return {Object[]} Array of model attribute hashes.
    **/
    parse: function (response) {
        if (typeof response === 'string') {
            try {
                return Y.JSON.parse(response) || [];
            } catch (ex) {
                this.fire(EVT_ERROR, {
                    error   : ex,
                    response: response,
                    src     : 'parse'
                });

                return null;
            }
        }

        return response || [];
    },

    /**
    Removes the specified model or array of models from this list. You may also
    pass another ModelList instance to remove all the models that are in both
    that instance and this instance, or pass numerical indices to remove the
    models at those indices.

    @method remove
    @param {Model|Model[]|ModelList|Number|Number[]} models Models or indices of
        models to remove.
    @param {Object} [options] Data to be mixed into the event facade of the
        `remove` event(s) for the removed models.

        @param {Boolean} [options.silent=false] If `true`, no `remove` event(s)
            will be fired.

    @return {Model|Model[]} Removed model or array of removed models.
    **/
    remove: function (models, options) {
        var isList = models._isYUIModelList;

        if (isList || Lang.isArray(models)) {
            // We can't remove multiple models by index because the indices will
            // change as we remove them, so we need to get the actual models
            // first.
            models = YArray.map(isList ? models.toArray() : models, function (model) {
                if (Lang.isNumber(model)) {
                    return this.item(model);
                }

                return model;
            }, this);

            return YArray.map(models, function (model) {
                return this._remove(model, options);
            }, this);
        } else {
            return this._remove(models, options);
        }
    },

    /**
    Completely replaces all models in the list with those specified, and fires a
    single `reset` event.

    Use `reset` when you want to add or remove a large number of items at once
    with less overhead, and without firing `add` or `remove` events for each
    one.

    @method reset
    @param {Model[]|ModelList|Object[]} [models] Models to add. May be existing
        model instances or hashes of model attributes, in which case new model
        instances will be created from the hashes. If a ModelList is passed, all
        the models in that list will be added to this list. Calling `reset()`
        without passing in any models will clear the list.
    @param {Object} [options] Data to be mixed into the event facade of the
        `reset` event.

        @param {Boolean} [options.silent=false] If `true`, no `reset` event will
            be fired.

    @chainable
    **/
    reset: function (models, options) {
        models  || (models  = []);
        options || (options = {});

        var facade = Y.merge({src: 'reset'}, options);

        if (models._isYUIModelList) {
            models = models.toArray();
        } else {
            models = YArray.map(models, function (model) {
                return model._isYUIModel ? model : new this.model(model);
            }, this);
        }

        facade.models = models;

        if (options.silent) {
            this._defResetFn(facade);
        } else {
            // Sort the models before firing the reset event.
            if (this.comparator) {
                models.sort(Y.bind(this._sort, this));
            }

            this.fire(EVT_RESET, facade);
        }

        return this;
    },

    /**
    Executes the supplied function on each model in this list, and stops
    iterating if the callback returns `true`.

    By default, the callback function's `this` object will refer to the model
    currently being iterated. Specify a `thisObj` to override the `this` object
    if desired.

    Note: Iteration is performed on a copy of the internal array of models, so
    it's safe to delete a model from the list during iteration.

    @method some
    @param {Function} callback Function to execute on each model.
        @param {Model} callback.model Model instance.
        @param {Number} callback.index Index of the current model.
        @param {ModelList} callback.list The ModelList being iterated.
    @param {Object} [thisObj] Object to use as the `this` object when executing
        the callback.
    @return {Boolean} `true` if the callback returned `true` for any item,
        `false` otherwise.
    @since 3.6.0
    **/
    some: function (callback, thisObj) {
        var items = this._items.concat(),
            i, item, len;

        for (i = 0, len = items.length; i < len; i++) {
            item = items[i];

            if (callback.call(thisObj || item, item, i, this)) {
                return true;
            }
        }

        return false;
    },

    /**
    Forcibly re-sorts the list.

    Usually it shouldn't be necessary to call this method since the list
    maintains its sort order when items are added and removed, but if you change
    the `comparator` function after items are already in the list, you'll need
    to re-sort.

    @method sort
    @param {Object} [options] Data to be mixed into the event facade of the
        `reset` event.
      @param {Boolean} [options.silent=false] If `true`, no `reset` event will
          be fired.
      @param {Boolean} [options.descending=false] If `true`, the sort is
          performed in descending order.
    @chainable
    **/
    sort: function (options) {
        if (!this.comparator) {
            return this;
        }

        var models = this._items.concat(),
            facade;

        options || (options = {});

        models.sort(Y.rbind(this._sort, this, options));

        facade = Y.merge(options, {
            models: models,
            src   : 'sort'
        });

        if (options.silent) {
            this._defResetFn(facade);
        } else {
            this.fire(EVT_RESET, facade);
        }

        return this;
    },

    /**
    Override this method to provide a custom persistence implementation for this
    list. The default method just calls the callback without actually doing
    anything.

    This method is called internally by `load()` and its implementations relies
    on the callback being called. This effectively means that when a callback is
    provided, it must be called at some point for the class to operate correctly.

    @method sync
    @param {String} action Sync action to perform. May be one of the following:

      * `create`: Store a list of newly-created models for the first time.
      * `delete`: Delete a list of existing models.
      * `read`  : Load a list of existing models.
      * `update`: Update a list of existing models.

      Currently, model lists only make use of the `read` action, but other
      actions may be used in future versions.

    @param {Object} [options] Sync options. It's up to the custom sync
      implementation to determine what options it supports or requires, if any.
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error} callback.err If an error occurred, this parameter will
        contain the error. If the sync operation succeeded, _err_ will be
        falsy.
      @param {Any} [callback.response] The server's response. This value will
        be passed to the `parse()` method, which is expected to parse it and
        return an array of model attribute hashes.
    **/
    sync: function (/* action, options, callback */) {
        var callback = YArray(arguments, 0, true).pop();

        if (typeof callback === 'function') {
            callback();
        }
    },

    /**
    Returns an array containing the models in this list.

    @method toArray
    @return {Model[]} Array containing the models in this list.
    **/
    toArray: function () {
        return this._items.concat();
    },

    /**
    Returns an array containing attribute hashes for each model in this list,
    suitable for being passed to `Y.JSON.stringify()`.

    Under the hood, this method calls `toJSON()` on each model in the list and
    pushes the results into an array.

    @method toJSON
    @return {Object[]} Array of model attribute hashes.
    @see Model.toJSON()
    **/
    toJSON: function () {
        return this.map(function (model) {
            return model.toJSON();
        });
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    Adds the specified _model_ if it isn't already in this list.

    If the model's `clientId` or `id` matches that of a model that's already in
    the list, an `error` event will be fired and the model will not be added.

    @method _add
    @param {Model|Object} model Model or object to add.
    @param {Object} [options] Data to be mixed into the event facade of the
        `add` event for the added model.
      @param {Boolean} [options.silent=false] If `true`, no `add` event will be
          fired.
    @return {Model} The added model.
    @protected
    **/
    _add: function (model, options) {
        var facade, id;

        options || (options = {});

        if (!model._isYUIModel) {
            model = new this.model(model);
        }

        id = model.get('id');

        if (this._clientIdMap[model.get('clientId')]
                || (Lang.isValue(id) && this._idMap[id])) {

            this.fire(EVT_ERROR, {
                error: 'Model is already in the list.',
                model: model,
                src  : 'add'
            });

            return;
        }

        facade = Y.merge(options, {
            index: 'index' in options ? options.index : this._findIndex(model),
            model: model
        });

        if (options.silent) {
            this._defAddFn(facade);
        } else {
            this.fire(EVT_ADD, facade);
        }

        return model;
    },

    /**
    Adds this list as a bubble target for the specified model's events.

    @method _attachList
    @param {Model} model Model to attach to this list.
    @protected
    **/
    _attachList: function (model) {
        // Attach this list and make it a bubble target for the model.
        model.lists.push(this);
        model.addTarget(this);
    },

    /**
    Clears all internal state and the internal list of models, returning this
    list to an empty state. Automatically detaches all models in the list.

    @method _clear
    @protected
    **/
    _clear: function () {
        YArray.each(this._items, this._detachList, this);

        this._clientIdMap = {};
        this._idMap       = {};
        this._items       = [];
    },

    /**
    Compares the value _a_ to the value _b_ for sorting purposes. Values are
    assumed to be the result of calling a model's `comparator()` method. You can
    override this method to implement custom sorting logic, such as a descending
    sort or multi-field sorting.

    @method _compare
    @param {Mixed} a First value to compare.
    @param {Mixed} b Second value to compare.
    @return {Number} `-1` if _a_ should come before _b_, `0` if they're
        equivalent, `1` if _a_ should come after _b_.
    @protected
    @since 3.5.0
    **/
    _compare: function (a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    },

    /**
    Removes this list as a bubble target for the specified model's events.

    @method _detachList
    @param {Model} model Model to detach.
    @protected
    **/
    _detachList: function (model) {
        var index = YArray.indexOf(model.lists, this);

        if (index > -1) {
            model.lists.splice(index, 1);
            model.removeTarget(this);
        }
    },

    /**
    Returns the index at which the given _model_ should be inserted to maintain
    the sort order of the list.

    @method _findIndex
    @param {Model} model The model being inserted.
    @return {Number} Index at which the model should be inserted.
    @protected
    **/
    _findIndex: function (model) {
        var items = this._items,
            max   = items.length,
            min   = 0,
            item, middle, needle;

        if (!this.comparator || !max) {
            return max;
        }

        needle = this.comparator(model);

        // Perform an iterative binary search to determine the correct position
        // based on the return value of the `comparator` function.
        while (min < max) {
            middle = (min + max) >> 1; // Divide by two and discard remainder.
            item   = items[middle];

            if (this._compare(this.comparator(item), needle) < 0) {
                min = middle + 1;
            } else {
                max = middle;
            }
        }

        return min;
    },

    /**
    Calls the public, overrideable `parse()` method and returns the result.

    Override this method to provide a custom pre-parsing implementation. This
    provides a hook for custom persistence implementations to "prep" a response
    before calling the `parse()` method.

    @method _parse
    @param {Any} response Server response.
    @return {Object[]} Array of model attribute hashes.
    @protected
    @see ModelList.parse()
    @since 3.7.0
    **/
    _parse: function (response) {
        return this.parse(response);
    },

    /**
    Removes the specified _model_ if it's in this list.

    @method _remove
    @param {Model|Number} model Model or index of the model to remove.
    @param {Object} [options] Data to be mixed into the event facade of the
        `remove` event for the removed model.
      @param {Boolean} [options.silent=false] If `true`, no `remove` event will
          be fired.
    @return {Model} Removed model.
    @protected
    **/
    _remove: function (model, options) {
        var index, facade;

        options || (options = {});

        if (Lang.isNumber(model)) {
            index = model;
            model = this.item(index);
        } else {
            index = this.indexOf(model);
        }

        if (index === -1 || !model) {
            this.fire(EVT_ERROR, {
                error: 'Model is not in the list.',
                index: index,
                model: model,
                src  : 'remove'
            });

            return;
        }

        facade = Y.merge(options, {
            index: index,
            model: model
        });

        if (options.silent) {
            this._defRemoveFn(facade);
        } else {
            this.fire(EVT_REMOVE, facade);
        }

        return model;
    },

    /**
    Array sort function used by `sort()` to re-sort the models in the list.

    @method _sort
    @param {Model} a First model to compare.
    @param {Model} b Second model to compare.
    @param {Object} [options] Options passed from `sort()` function.
        @param {Boolean} [options.descending=false] If `true`, the sort is
          performed in descending order.
    @return {Number} `-1` if _a_ is less than _b_, `0` if equal, `1` if greater
      (for ascending order, the reverse for descending order).
    @protected
    **/
    _sort: function (a, b, options) {
        var result = this._compare(this.comparator(a), this.comparator(b));

        // Early return when items are equal in their sort comparison.
        if (result === 0) {
            return result;
        }

        // Flips sign when the sort is to be peformed in descending order.
        return options && options.descending ? -result : result;
    },

    // -- Event Handlers -------------------------------------------------------

    /**
    Updates the model maps when a model's `id` attribute changes.

    @method _afterIdChange
    @param {EventFacade} e
    @protected
    **/
    _afterIdChange: function (e) {
        var newVal  = e.newVal,
            prevVal = e.prevVal,
            target  = e.target;

        if (Lang.isValue(prevVal)) {
            if (this._idMap[prevVal] === target) {
                delete this._idMap[prevVal];
            } else {
                // The model that changed isn't in this list. Probably just a
                // bubbled change event from a nested Model List.
                return;
            }
        } else {
            // The model had no previous id. Verify that it exists in this list
            // before continuing.
            if (this.indexOf(target) === -1) {
                return;
            }
        }

        if (Lang.isValue(newVal)) {
            this._idMap[newVal] = target;
        }
    },

    // -- Default Event Handlers -----------------------------------------------

    /**
    Default event handler for `add` events.

    @method _defAddFn
    @param {EventFacade} e
    @protected
    **/
    _defAddFn: function (e) {
        var model = e.model,
            id    = model.get('id');

        this._clientIdMap[model.get('clientId')] = model;

        if (Lang.isValue(id)) {
            this._idMap[id] = model;
        }

        this._attachList(model);
        this._items.splice(e.index, 0, model);
    },

    /**
    Default event handler for `remove` events.

    @method _defRemoveFn
    @param {EventFacade} e
    @protected
    **/
    _defRemoveFn: function (e) {
        var model = e.model,
            id    = model.get('id');

        this._detachList(model);
        delete this._clientIdMap[model.get('clientId')];

        if (Lang.isValue(id)) {
            delete this._idMap[id];
        }

        this._items.splice(e.index, 1);
    },

    /**
    Default event handler for `reset` events.

    @method _defResetFn
    @param {EventFacade} e
    @protected
    **/
    _defResetFn: function (e) {
        // When fired from the `sort` method, we don't need to clear the list or
        // add any models, since the existing models are sorted in place.
        if (e.src === 'sort') {
            this._items = e.models.concat();
            return;
        }

        this._clear();

        if (e.models.length) {
            this.add(e.models, {silent: true});
        }
    }
}, {
    NAME: 'modelList'
});

Y.augment(ModelList, Y.ArrayList);


}, '3.16.0', {"requires": ["array-extras", "array-invoke", "arraylist", "base-build", "escape", "json-parse", "model"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-core', function (Y, NAME) {

/**
The core implementation of the `DataTable` and `DataTable.Base` Widgets.

@module datatable
@submodule datatable-core
@since 3.5.0
**/

var INVALID = Y.Attribute.INVALID_VALUE,

    Lang         = Y.Lang,
    isFunction   = Lang.isFunction,
    isObject     = Lang.isObject,
    isArray      = Lang.isArray,
    isString     = Lang.isString,
    isNumber     = Lang.isNumber,

    toArray = Y.Array,

    keys = Y.Object.keys,

    Table;

/**
_API docs for this extension are included in the DataTable class._

Class extension providing the core API and structure for the DataTable Widget.

Use this class extension with Widget or another Base-based superclass to create
the basic DataTable model API and composing class structure.

@class DataTable.Core
@for DataTable
@since 3.5.0
**/
Table = Y.namespace('DataTable').Core = function () {};

Table.ATTRS = {
    /**
    Columns to include in the rendered table.

    If omitted, the attributes on the configured `recordType` or the first item
    in the `data` collection will be used as a source.

    This attribute takes an array of strings or objects (mixing the two is
    fine).  Each string or object is considered a column to be rendered.
    Strings are converted to objects, so `columns: ['first', 'last']` becomes
    `columns: [{ key: 'first' }, { key: 'last' }]`.

    DataTable.Core only concerns itself with a few properties of columns.
    These properties are:

    * `key` - Used to identify the record field/attribute containing content for
      this column.  Also used to create a default Model if no `recordType` or
      `data` are provided during construction.  If `name` is not specified, this
      is assigned to the `_id` property (with added incrementer if the key is
      used by multiple columns).
    * `children` - Traversed to initialize nested column objects
    * `name` - Used in place of, or in addition to, the `key`.  Useful for
      columns that aren't bound to a field/attribute in the record data.  This
      is assigned to the `_id` property.
    * `id` - For backward compatibility.  Implementers can specify the id of
      the header cell.  This should be avoided, if possible, to avoid the
      potential for creating DOM elements with duplicate IDs.
    * `field` - For backward compatibility.  Implementers should use `name`.
    * `_id` - Assigned unique-within-this-instance id for a column.  By order
      of preference, assumes the value of `name`, `key`, `id`, or `_yuid`.
      This is used by the rendering views as well as feature module
      as a means to identify a specific column without ambiguity (such as
      multiple columns using the same `key`.
    * `_yuid` - Guid stamp assigned to the column object.
    * `_parent` - Assigned to all child columns, referencing their parent
      column.

    @attribute columns
    @type {Object[]|String[]}
    @default (from `recordType` ATTRS or first item in the `data`)
    @since 3.5.0
    **/
    columns: {
        // TODO: change to setter to clone input array/objects
        validator: isArray,
        setter: '_setColumns',
        getter: '_getColumns'
    },

    /**
    Model subclass to use as the `model` for the ModelList stored in the `data`
    attribute.

    If not provided, it will try really hard to figure out what to use.  The
    following attempts will be made to set a default value:

    1. If the `data` attribute is set with a ModelList instance and its `model`
       property is set, that will be used.
    2. If the `data` attribute is set with a ModelList instance, and its
       `model` property is unset, but it is populated, the `ATTRS` of the
       `constructor of the first item will be used.
    3. If the `data` attribute is set with a non-empty array, a Model subclass
       will be generated using the keys of the first item as its `ATTRS` (see
       the `_createRecordClass` method).
    4. If the `columns` attribute is set, a Model subclass will be generated
       using the columns defined with a `key`. This is least desirable because
       columns can be duplicated or nested in a way that's not parsable.
    5. If neither `data` nor `columns` is set or populated, a change event
       subscriber will listen for the first to be changed and try all over
       again.

    @attribute recordType
    @type {Function}
    @default (see description)
    @since 3.5.0
    **/
    recordType: {
        getter: '_getRecordType',
        setter: '_setRecordType'
    },

    /**
    The collection of data records to display.  This attribute is a pass
    through to a `data` property, which is a ModelList instance.

    If this attribute is passed a ModelList or subclass, it will be assigned to
    the property directly.  If an array of objects is passed, a new ModelList
    will be created using the configured `recordType` as its `model` property
    and seeded with the array.

    Retrieving this attribute will return the ModelList stored in the `data`
    property.

    @attribute data
    @type {ModelList|Object[]}
    @default `new ModelList()`
    @since 3.5.0
    **/
    data: {
        valueFn: '_initData',
        setter : '_setData',
        lazyAdd: false
    },

    /**
    Content for the `<table summary="ATTRIBUTE VALUE HERE">`.  Values assigned
    to this attribute will be HTML escaped for security.

    @attribute summary
    @type {String}
    @default '' (empty string)
    @since 3.5.0
    **/
    //summary: {},

    /**
    HTML content of an optional `<caption>` element to appear above the table.
    Leave this config unset or set to a falsy value to remove the caption.

    @attribute caption
    @type HTML
    @default '' (empty string)
    @since 3.5.0
    **/
    //caption: {},

    /**
    Deprecated as of 3.5.0. Passes through to the `data` attribute.

    WARNING: `get('recordset')` will NOT return a Recordset instance as of
    3.5.0.  This is a break in backward compatibility.

    @attribute recordset
    @type {Object[]|Recordset}
    @deprecated Use the `data` attribute
    @since 3.5.0
    **/
    recordset: {
        setter: '_setRecordset',
        getter: '_getRecordset',
        lazyAdd: false
    },

    /**
    Deprecated as of 3.5.0. Passes through to the `columns` attribute.

    WARNING: `get('columnset')` will NOT return a Columnset instance as of
    3.5.0.  This is a break in backward compatibility.

    @attribute columnset
    @type {Object[]}
    @deprecated Use the `columns` attribute
    @since 3.5.0
    **/
    columnset: {
        setter: '_setColumnset',
        getter: '_getColumnset',
        lazyAdd: false
    }
};

Y.mix(Table.prototype, {
    // -- Instance properties -------------------------------------------------
    /**
    The ModelList that manages the table's data.

    @property data
    @type {ModelList}
    @default undefined (initially unset)
    @since 3.5.0
    **/
    //data: null,

    // -- Public methods ------------------------------------------------------

    /**
    Gets the column configuration object for the given key, name, or index.  For
    nested columns, `name` can be an array of indexes, each identifying the index
    of that column in the respective parent's "children" array.

    If you pass a column object, it will be returned.

    For columns with keys, you can also fetch the column with
    `instance.get('columns.foo')`.

    @method getColumn
    @param {String|Number|Number[]} name Key, "name", index, or index array to
                identify the column
    @return {Object} the column configuration object
    @since 3.5.0
    **/
    getColumn: function (name) {
        var col, columns, i, len, cols;

        if (isObject(name) && !isArray(name)) {
            if (name && name._node) {
                col = this.body.getColumn(name);
            } else {
                col = name;
            }
        } else {
            col = this.get('columns.' + name);
        }

        if (col) {
            return col;
        }

        columns = this.get('columns');

        if (isNumber(name) || isArray(name)) {
            name = toArray(name);
            cols = columns;

            for (i = 0, len = name.length - 1; cols && i < len; ++i) {
                cols = cols[name[i]] && cols[name[i]].children;
            }

            return (cols && cols[name[i]]) || null;
        }

        return null;
    },

    /**
    Returns the Model associated to the record `id`, `clientId`, or index (not
    row index).  If none of those yield a Model from the `data` ModelList, the
    arguments will be passed to the `view` instance's `getRecord` method
    if it has one.

    If no Model can be found, `null` is returned.

    @method getRecord
    @param {Number|String|Node} seed Record `id`, `clientId`, index, Node, or
        identifier for a row or child element
    @return {Model}
    @since 3.5.0
    **/
    getRecord: function (seed) {
        var record = this.data.getById(seed) || this.data.getByClientId(seed);

        if (!record) {
            if (isNumber(seed)) {
                record = this.data.item(seed);
            }

            // TODO: this should be split out to base somehow
            if (!record && this.view && this.view.getRecord) {
                record = this.view.getRecord.apply(this.view, arguments);
            }
        }

        return record || null;
    },

    // -- Protected and private properties and methods ------------------------

    /**
    This tells `Y.Base` that it should create ad-hoc attributes for config
    properties passed to DataTable's constructor. This is useful for setting
    configurations on the DataTable that are intended for the rendering View(s).

    @property _allowAdHocAttrs
    @type Boolean
    @default true
    @protected
    @since 3.6.0
    **/
    _allowAdHocAttrs: true,

    /**
    A map of column key to column configuration objects parsed from the
    `columns` attribute.

    @property _columnMap
    @type {Object}
    @default undefined (initially unset)
    @protected
    @since 3.5.0
    **/
    //_columnMap: null,

    /**
    The Node instance of the table containing the data rows.  This is set when
    the table is rendered.  It may also be set by progressive enhancement,
    though this extension does not provide the logic to parse from source.

    @property _tableNode
    @type {Node}
    @default undefined (initially unset)
    @protected
    @since 3.5.0
    **/
    //_tableNode: null,

    /**
    Updates the `_columnMap` property in response to changes in the `columns`
    attribute.

    @method _afterColumnsChange
    @param {EventFacade} e The `columnsChange` event object
    @protected
    @since 3.5.0
    **/
    _afterColumnsChange: function (e) {
        this._setColumnMap(e.newVal);
    },

    /**
    Updates the `modelList` attributes of the rendered views in response to the
    `data` attribute being assigned a new ModelList.

    @method _afterDataChange
    @param {EventFacade} e the `dataChange` event
    @protected
    @since 3.5.0
    **/
    _afterDataChange: function (e) {
        var modelList = e.newVal;

        this.data = e.newVal;

        if (!this.get('columns') && modelList.size()) {
            // TODO: this will cause a re-render twice because the Views are
            // subscribed to columnsChange
            this._initColumns();
        }
    },

    /**
    Assigns to the new recordType as the model for the data ModelList

    @method _afterRecordTypeChange
    @param {EventFacade} e recordTypeChange event
    @protected
    @since 3.6.0
    **/
    _afterRecordTypeChange: function (e) {
        var data = this.data.toJSON();

        this.data.model = e.newVal;

        this.data.reset(data);

        if (!this.get('columns') && data) {
            if (data.length) {
                this._initColumns();
            } else {
                this.set('columns', keys(e.newVal.ATTRS));
            }
        }
    },

    /**
    Creates a Model subclass from an array of attribute names or an object of
    attribute definitions.  This is used to generate a class suitable to
    represent the data passed to the `data` attribute if no `recordType` is
    set.

    @method _createRecordClass
    @param {String[]|Object} attrs Names assigned to the Model subclass's
                `ATTRS` or its entire `ATTRS` definition object
    @return {Model}
    @protected
    @since 3.5.0
    **/
    _createRecordClass: function (attrs) {
        var ATTRS, i, len;

        if (isArray(attrs)) {
            ATTRS = {};

            for (i = 0, len = attrs.length; i < len; ++i) {
                ATTRS[attrs[i]] = {};
            }
        } else if (isObject(attrs)) {
            ATTRS = attrs;
        }

        return Y.Base.create('record', Y.Model, [], null, { ATTRS: ATTRS });
    },

    /**
    Tears down the instance.

    @method destructor
    @protected
    @since 3.6.0
    **/
    destructor: function () {
        new Y.EventHandle(Y.Object.values(this._eventHandles)).detach();
    },

    /**
    The getter for the `columns` attribute.  Returns the array of column
    configuration objects if `instance.get('columns')` is called, or the
    specific column object if `instance.get('columns.columnKey')` is called.

    @method _getColumns
    @param {Object[]} columns The full array of column objects
    @param {String} name The attribute name requested
                         (e.g. 'columns' or 'columns.foo');
    @protected
    @since 3.5.0
    **/
    _getColumns: function (columns, name) {
        // Workaround for an attribute oddity (ticket #2529254)
        // getter is expected to return an object if get('columns.foo') is called.
        // Note 'columns.' is 8 characters
        return name.length > 8 ? this._columnMap : columns;
    },

    /**
    Relays the `get()` request for the deprecated `columnset` attribute to the
    `columns` attribute.

    THIS BREAKS BACKWARD COMPATIBILITY.  3.4.1 and prior implementations will
    expect a Columnset instance returned from `get('columnset')`.

    @method _getColumnset
    @param {Object} ignored The current value stored in the `columnset` state
    @param {String} name The attribute name requested
                         (e.g. 'columnset' or 'columnset.foo');
    @deprecated This will be removed with the `columnset` attribute in a future
                version.
    @protected
    @since 3.5.0
    **/
    _getColumnset: function (_, name) {
        return this.get(name.replace(/^columnset/, 'columns'));
    },

    /**
    Returns the Model class of the instance's `data` attribute ModelList.  If
    not set, returns the explicitly configured value.

    @method _getRecordType
    @param {Model} val The currently configured value
    @return {Model}
    **/
    _getRecordType: function (val) {
        // Prefer the value stored in the attribute because the attribute
        // change event defaultFn sets e.newVal = this.get('recordType')
        // before notifying the after() subs.  But if this getter returns
        // this.data.model, then after() subs would get e.newVal === previous
        // model before _afterRecordTypeChange can set
        // this.data.model = e.newVal
        return val || (this.data && this.data.model);
    },

    /**
    Initializes the `_columnMap` property from the configured `columns`
    attribute.  If `columns` is not set, but there are records in the `data`
    ModelList, use
    `ATTRS` of that class.

    @method _initColumns
    @protected
    @since 3.5.0
    **/
    _initColumns: function () {
        var columns = this.get('columns') || [],
            item;

        // Default column definition from the configured recordType
        if (!columns.length && this.data.size()) {
            // TODO: merge superclass attributes up to Model?
            item = this.data.item(0);

            if (item.toJSON) {
                item = item.toJSON();
            }

            this.set('columns', keys(item));
        }

        this._setColumnMap(columns);
    },

    /**
    Sets up the change event subscriptions to maintain internal state.

    @method _initCoreEvents
    @protected
    @since 3.6.0
    **/
    _initCoreEvents: function () {
        this._eventHandles.coreAttrChanges = this.after({
            columnsChange   : Y.bind('_afterColumnsChange', this),
            recordTypeChange: Y.bind('_afterRecordTypeChange', this),
            dataChange      : Y.bind('_afterDataChange', this)
        });
    },

    /**
    Defaults the `data` attribute to an empty ModelList if not set during
    construction.  Uses the configured `recordType` for the ModelList's `model`
    proeprty if set.

    @method _initData
    @protected
    @return {ModelList}
    @since 3.6.0
    **/
    _initData: function () {
        var recordType = this.get('recordType'),
            // TODO: LazyModelList if recordType doesn't have complex ATTRS
            modelList = new Y.ModelList();

        if (recordType) {
            modelList.model = recordType;
        }

        return modelList;
    },

    /**
    Initializes the instance's `data` property from the value of the `data`
    attribute.  If the attribute value is a ModelList, it is assigned directly
    to `this.data`.  If it is an array, a ModelList is created, its `model`
    property is set to the configured `recordType` class, and it is seeded with
    the array data.  This ModelList is then assigned to `this.data`.

    @method _initDataProperty
    @param {Array|ModelList|ArrayList} data Collection of data to populate the
            DataTable
    @protected
    @since 3.6.0
    **/
    _initDataProperty: function (data) {
        var recordType;

        if (!this.data) {
            recordType = this.get('recordType');

            if (data && data.each && data.toJSON) {
                this.data = data;

                if (recordType) {
                    this.data.model = recordType;
                }
            } else {
                // TODO: customize the ModelList or read the ModelList class
                // from a configuration option?
                this.data = new Y.ModelList();

                if (recordType) {
                    this.data.model = recordType;
                }
            }

            // TODO: Replace this with an event relay for specific events.
            // Using bubbling causes subscription conflicts with the models'
            // aggregated change event and 'change' events from DOM elements
            // inside the table (via Widget UI event).
            this.data.addTarget(this);
        }
    },

    /**
    Initializes the columns, `recordType` and data ModelList.

    @method initializer
    @param {Object} config Configuration object passed to constructor
    @protected
    @since 3.5.0
    **/
    initializer: function (config) {
        var data       = config.data,
            columns    = config.columns,
            recordType;

        // Referencing config.data to allow _setData to be more stringent
        // about its behavior
        this._initDataProperty(data);

        // Default columns from recordType ATTRS if recordType is supplied at
        // construction.  If no recordType is supplied, but the data is
        // supplied as a non-empty array, use the keys of the first item
        // as the columns.
        if (!columns) {
            recordType = (config.recordType || config.data === this.data) &&
                            this.get('recordType');

            if (recordType) {
                columns = keys(recordType.ATTRS);
            } else if (isArray(data) && data.length) {
                columns = keys(data[0]);
            }

            if (columns) {
                this.set('columns', columns);
            }
        }

        this._initColumns();

        this._eventHandles = {};

        this._initCoreEvents();
    },

    /**
    Iterates the array of column configurations to capture all columns with a
    `key` property.  An map is built with column keys as the property name and
    the corresponding column object as the associated value.  This map is then
    assigned to the instance's `_columnMap` property.

    @method _setColumnMap
    @param {Object[]|String[]} columns The array of column config objects
    @protected
    @since 3.6.0
    **/
    _setColumnMap: function (columns) {
        var map = {};

        function process(cols) {
            var i, len, col, key;

            for (i = 0, len = cols.length; i < len; ++i) {
                col = cols[i];
                key = col.key;

                // First in wins for multiple columns with the same key
                // because the first call to genId (in _setColumns) will
                // return the same key, which will then be overwritten by the
                // subsequent same-keyed column.  So table.getColumn(key) would
                // return the last same-keyed column.
                if (key && !map[key]) {
                    map[key] = col;
                }
                //TODO: named columns can conflict with keyed columns
                map[col._id] = col;

                if (col.children) {
                    process(col.children);
                }
            }
        }

        process(columns);

        this._columnMap = map;
    },

    /**
    Translates string columns into objects with that string as the value of its
    `key` property.

    All columns are assigned a `_yuid` stamp and `_id` property corresponding
    to the column's configured `name` or `key` property with any spaces
    replaced with dashes.  If the same `name` or `key` appears in multiple
    columns, subsequent appearances will have their `_id` appended with an
    incrementing number (e.g. if column "foo" is included in the `columns`
    attribute twice, the first will get `_id` of "foo", and the second an `_id`
    of "foo1").  Columns that are children of other columns will have the
    `_parent` property added, assigned the column object to which they belong.

    @method _setColumns
    @param {null|Object[]|String[]} val Array of config objects or strings
    @return {null|Object[]}
    @protected
    **/
    _setColumns: function (val) {
        var keys = {},
            known = [],
            knownCopies = [],
            arrayIndex = Y.Array.indexOf;

        function copyObj(o) {
            var copy = {},
                key, val, i;

            known.push(o);
            knownCopies.push(copy);

            for (key in o) {
                if (o.hasOwnProperty(key)) {
                    val = o[key];

                    if (isArray(val)) {
                        copy[key] = val.slice();
                    } else if (isObject(val, true)) {
                        i = arrayIndex(known, val);

                        copy[key] = i === -1 ? copyObj(val) : knownCopies[i];
                    } else {
                        copy[key] = o[key];
                    }
                }
            }

            return copy;
        }

        function genId(name) {
            // Sanitize the name for use in generated CSS classes.
            // TODO: is there more to do for other uses of _id?
            name = name.replace(/\s+/, '-');

            if (keys[name]) {
                name += (keys[name]++);
            } else {
                keys[name] = 1;
            }

            return name;
        }

        function process(cols, parent) {
            var columns = [],
                i, len, col, yuid;

            for (i = 0, len = cols.length; i < len; ++i) {
                columns[i] = // chained assignment
                col = isString(cols[i]) ? { key: cols[i] } : copyObj(cols[i]);

                yuid = Y.stamp(col);

                // For backward compatibility
                if (!col.id) {
                    // Implementers can shoot themselves in the foot by setting
                    // this config property to a non-unique value
                    col.id = yuid;
                }
                if (col.field) {
                    // Field is now known as "name" to avoid confusion with data
                    // fields or schema.resultFields
                    col.name = col.field;
                }

                if (parent) {
                    col._parent = parent;
                } else {
                    delete col._parent;
                }

                // Unique id based on the column's configured name or key,
                // falling back to the yuid.  Duplicates will have a counter
                // added to the end.
                col._id = genId(col.name || col.key || col.id);

                if (isArray(col.children)) {
                    col.children = process(col.children, col);
                }
            }

            return columns;
        }

        return val && process(val);
    },

    /**
    Relays attribute assignments of the deprecated `columnset` attribute to the
    `columns` attribute.  If a Columnset is object is passed, its basic object
    structure is mined.

    @method _setColumnset
    @param {Array|Columnset} val The columnset value to relay
    @deprecated This will be removed with the deprecated `columnset` attribute
                in a later version.
    @protected
    @since 3.5.0
    **/
    _setColumnset: function (val) {
        this.set('columns', val);

        return isArray(val) ? val : INVALID;
    },

    /**
    Accepts an object with `each` and `getAttrs` (preferably a ModelList or
    subclass) or an array of data objects.  If an array is passes, it will
    create a ModelList to wrap the data.  In doing so, it will set the created
    ModelList's `model` property to the class in the `recordType` attribute,
    which will be defaulted if not yet set.

    If the `data` property is already set with a ModelList, passing an array as
    the value will call the ModelList's `reset()` method with that array rather
    than replacing the stored ModelList wholesale.

    Any non-ModelList-ish and non-array value is invalid.

    @method _setData
    @protected
    @since 3.5.0
    **/
    _setData: function (val) {
        if (val === null) {
            val = [];
        }

        if (isArray(val)) {
            this._initDataProperty();

            // silent to prevent subscribers to both reset and dataChange
            // from reacting to the change twice.
            // TODO: would it be better to return INVALID to silence the
            // dataChange event, or even allow both events?
            this.data.reset(val, { silent: true });

            // Return the instance ModelList to avoid storing unprocessed
            // data in the state and their vivified Model representations in
            // the instance's data property.  Decreases memory consumption.
            val = this.data;
        } else if (!val || !val.each || !val.toJSON) {
            // ModelList/ArrayList duck typing
            val = INVALID;
        }

        return val;
    },

    /**
    Relays the value assigned to the deprecated `recordset` attribute to the
    `data` attribute.  If a Recordset instance is passed, the raw object data
    will be culled from it.

    @method _setRecordset
    @param {Object[]|Recordset} val The recordset value to relay
    @deprecated This will be removed with the deprecated `recordset` attribute
                in a later version.
    @protected
    @since 3.5.0
    **/
    _setRecordset: function (val) {
        var data;

        if (val && Y.Recordset && val instanceof Y.Recordset) {
            data = [];
            val.each(function (record) {
                data.push(record.get('data'));
            });
            val = data;
        }

        this.set('data', val);

        return val;
    },

    /**
    Accepts a Base subclass (preferably a Model subclass). Alternately, it will
    generate a custom Model subclass from an array of attribute names or an
    object defining attributes and their respective configurations (it is
    assigned as the `ATTRS` of the new class).

    Any other value is invalid.

    @method _setRecordType
    @param {Function|String[]|Object} val The Model subclass, array of
            attribute names, or the `ATTRS` definition for a custom model
            subclass
    @return {Function} A Base/Model subclass
    @protected
    @since 3.5.0
    **/
    _setRecordType: function (val) {
        var modelClass;

        // Duck type based on known/likely consumed APIs
        if (isFunction(val) && val.prototype.toJSON && val.prototype.setAttrs) {
            modelClass = val;
        } else if (isObject(val)) {
            modelClass = this._createRecordClass(val);
        }

        return modelClass || INVALID;
    }

});



/**
_This is a documentation entry only_

Columns are described by object literals with a set of properties.
There is not an actual `DataTable.Column` class.
However, for the purpose of documenting it, this pseudo-class is declared here.

DataTables accept an array of column definitions in their [columns](DataTable.html#attr_columns)
attribute.  Each entry in this array is a column definition which may contain
any combination of the properties listed below.

There are no mandatory properties though a column will usually have a
[key](#property_key) property to reference the data it is supposed to show.
The [columns](DataTable.html#attr_columns) attribute can accept a plain string
in lieu of an object literal, which is the equivalent of an object with the
[key](#property_key) property set to that string.

@class DataTable.Column
*/

/**
Binds the column values to the named property in the [data](DataTable.html#attr_data).

Optional if [formatter](#property_formatter), [nodeFormatter](#property_nodeFormatter),
or [cellTemplate](#property_cellTemplate) is used to populate the content.

It should not be set if [children](#property_children) is set.

The value is used for the [\_id](#property__id) property unless the [name](#property_name)
property is also set.

    { key: 'username' }

The above column definition can be reduced to this:

    'username'

@property key
@type String
 */
/**
An identifier that can be used to locate a column via
[getColumn](DataTable.html#method_getColumn)
or style columns with class `yui3-datatable-col-NAME` after dropping characters
that are not valid for CSS class names.

It defaults to the [key](#property_key).

The value is used for the [\_id](#property__id) property.

    { name: 'fullname', formatter: ... }

@property name
@type String
*/
/**
An alias for [name](#property_name) for backward compatibility.

    { field: 'fullname', formatter: ... }

@property field
@type String
*/
/**
Overrides the default unique id assigned `<th id="HERE">`.

__Use this with caution__, since it can result in
duplicate ids in the DOM.

    {
        name: 'checkAll',
        id: 'check-all',
        label: ...
        formatter: ...
    }

@property id
@type String
 */
/**
HTML to populate the header `<th>` for the column.
It defaults to the value of the [key](#property_key) property or the text
`Column n` where _n_ is an ordinal number.

    { key: 'MfgvaPrtNum', label: 'Part Number' }

@property label
@type {String}
 */
/**
Used to create stacked headers.

Child columns may also contain `children`. There is no limit
to the depth of nesting.

Columns configured with `children` are for display only and
<strong>should not</strong> be configured with a [key](#property_key).
Configurations relating to the display of data, such as
[formatter](#property_formatter), [nodeFormatter](#property_nodeFormatter),
[emptyCellValue](#property_emptyCellValue), etc. are ignored.

    { label: 'Name', children: [
        { key: 'firstName', label: 'First`},
        { key: 'lastName', label: 'Last`}
    ]}

@property  children
@type Array
*/
/**
Assigns the value `<th abbr="HERE">`.

    {
      key  : 'forecast',
      label: '1yr Target Forecast',
      abbr : 'Forecast'
    }

@property abbr
@type String
 */
/**
Assigns the value `<th title="HERE">`.

    {
      key  : 'forecast',
      label: '1yr Target Forecast',
      title: 'Target Forecast for the Next 12 Months'
    }

@property title
@type String
 */
/**
Overrides the default [CELL_TEMPLATE](DataTable.HeaderView.html#property_CELL_TEMPLATE)
used by `Y.DataTable.HeaderView` to render the header cell
for this column.  This is necessary when more control is
needed over the markup for the header itself, rather than
its content.

Use the [label](#property_label) configuration if you don't need to
customize the `<th>` iteself.

Implementers are strongly encouraged to preserve at least
the `{id}` and `{_id}` placeholders in the custom value.

    {
        headerTemplate:
            '<th id="{id}" ' +
                'title="Unread" ' +
                'class="{className}" ' +
                '{_id}>&#9679;</th>'
    }

@property headerTemplate
@type HTML
 */
/**
Overrides the default [CELL_TEMPLATE](DataTable.BodyView.html#property_CELL_TEMPLATE)
used by `Y.DataTable.BodyView` to render the data cells
for this column.  This is necessary when more control is
needed over the markup for the `<td>` itself, rather than
its content.

    {
        key: 'id',
        cellTemplate:
            '<td class="{className}">' +
              '<input type="checkbox" ' +
                     'id="{content}">' +
            '</td>'
    }


@property cellTemplate
@type String
 */
/**
String or function used to translate the raw record data for each cell in a
given column into a format better suited to display.

If it is a string, it will initially be assumed to be the name of one of the
formatting functions in
[Y.DataTable.BodyView.Formatters](DataTable.BodyView.Formatters.html).
If one such formatting function exists, it will be used.

If no such named formatter is found, it will be assumed to be a template
string and will be expanded.  The placeholders can contain the key to any
field in the record or the placeholder `{value}` which represents the value
of the current field.

If the value is a function, it will be assumed to be a formatting function.
A formatting function receives a single argument, an object with the following properties:

* __value__ The raw value from the record Model to populate this cell.
  Equivalent to `o.record.get(o.column.key)` or `o.data[o.column.key]`.
* __data__ The Model data for this row in simple object format.
* __record__ The Model for this row.
* __column__ The column configuration object.
* __className__ A string of class names to add `<td class="HERE">` in addition to
  the column class and any classes in the column's className configuration.
* __rowIndex__ The index of the current Model in the ModelList.
  Typically correlates to the row index as well.
* __rowClass__ A string of css classes to add `<tr class="HERE"><td....`
  This is useful to avoid the need for nodeFormatters to add classes to the containing row.

The formatter function may return a string value that will be used for the cell
contents or it may change the value of the `value`, `className` or `rowClass`
properties which well then be used to format the cell.  If the value for the cell
is returned in the `value` property of the input argument, no value should be returned.

    {
        key: 'name',
        formatter: 'link',  // named formatter
        linkFrom: 'website' // extra column property for link formatter
    },
    {
        key: 'cost',
        formatter: '${value}' // formatter template string
      //formatter: '${cost}'  // same result but less portable
    },
    {
        name: 'Name',          // column does not have associated field value
                               // thus, it uses name instead of key
        formatter: '{firstName} {lastName}' // template references other fields
    },
    {
        key: 'price',
        formatter: function (o) { // function both returns a string to show
            if (o.value > 3) {    // and a className to apply to the cell
                o.className += 'expensive';
            }

            return '$' + o.value.toFixed(2);
        }
    },
@property formatter
@type String || Function

*/
/**
Used to customize the content of the data cells for this column.

`nodeFormatter` is significantly slower than [formatter](#property_formatter)
and should be avoided if possible. Unlike [formatter](#property_formatter),
`nodeFormatter` has access to the `<td>` element and its ancestors.

The function provided is expected to fill in the `<td>` element itself.
__Node formatters should return `false`__ except in certain conditions as described
in the users guide.

The function receives a single object
argument with the following properties:

* __td__	The `<td>` Node for this cell.
* __cell__	If the cell `<td> contains an element with class `yui3-datatable-liner,
  this will refer to that Node. Otherwise, it is equivalent to `td` (default behavior).
* __value__	The raw value from the record Model to populate this cell.
  Equivalent to `o.record.get(o.column.key)` or `o.data[o.column.key]`.
* __data__	The Model data for this row in simple object format.
* __record__	The Model for this row.
* __column__	The column configuration object.
* __rowIndex__	The index of the current Model in the ModelList.
 _Typically_ correlates to the row index as well.

@example
    nodeFormatter: function (o) {
        if (o.value < o.data.quota) {
            o.td.setAttribute('rowspan', 2);
            o.td.setAttribute('data-term-id', this.record.get('id'));

            o.td.ancestor().insert(
                '<tr><td colspan"3">' +
                    '<button class="term">terminate</button>' +
                '</td></tr>',
                'after');
        }

        o.cell.setHTML(o.value);
        return false;
    }

@property nodeFormatter
@type Function
*/
/**
Provides the default value to populate the cell if the data
for that cell is `undefined`, `null`, or an empty string.

    {
        key: 'price',
        emptyCellValue: '???'
    }

@property emptyCellValue
@type {String} depending on the setting of allowHTML
 */
/**
Skips the security step of HTML escaping the value for cells
in this column.

This is also necessary if [emptyCellValue](#property_emptyCellValue)
is set with an HTML string.
`nodeFormatter`s ignore this configuration.  If using a
`nodeFormatter`, it is recommended to use
[Y.Escape.html()](Escape.html#method_html)
on any user supplied content that is to be displayed.

    {
        key: 'preview',
        allowHTML: true
    }

@property allowHTML
@type Boolean
*/
/**
A string of CSS classes that will be added to the `<td>`'s
`class` attribute.

Note, all cells will automatically have a class in the
form of "yui3-datatable-col-XXX" added to the `<td>`, where
XXX is the column's configured `name`, `key`, or `id` (in
that order of preference) sanitized from invalid characters.

    {
        key: 'symbol',
        className: 'no-hide'
    }

@property className
@type String
*/
/**
(__read-only__) The unique identifier assigned
to each column.  This is used for the `id` if not set, and
the `_id` if none of [name](#property_name),
[field](#property_field), [key](#property_key), or [id](#property_id) are
set.

@property _yuid
@type String
@protected
 */
/**
(__read-only__) A unique-to-this-instance name
used extensively in the rendering process.  It is also used
to create the column's classname, as the input name
`table.getColumn(HERE)`, and in the column header's
`<th data-yui3-col-id="HERE">`.

The value is populated by the first of [name](#property_name),
[field](#property_field), [key](#property_key), [id](#property_id),
 or [_yuid](#property__yuid) to have a value.  If that value
has already been used (such as when multiple columns have
the same `key`), an incrementer is added to the end.  For
example, two columns with `key: "id"` will have `_id`s of
"id" and "id2".  `table.getColumn("id")` will return the
first column, and `table.getColumn("id2")` will return the
second.

@property _id
@type String
@protected
 */
/**
(__read-only__) Used by
`Y.DataTable.HeaderView` when building stacked column
headers.

@property _colspan
@type Integer
@protected
 */
/**
(__read-only__) Used by
`Y.DataTable.HeaderView` when building stacked column
headers.

@property _rowspan
@type Integer
@protected
 */
/**
(__read-only__) Assigned to all columns in a
column's `children` collection.  References the parent
column object.

@property _parent
@type DataTable.Column
@protected
 */
/**
(__read-only__) Array of the `id`s of the
column and all parent columns.  Used by
`Y.DataTable.BodyView` to populate `<td headers="THIS">`
when a cell references more than one header.

@property _headers
@type Array
@protected
*/


}, '3.16.0', {"requires": ["escape", "model-list", "node-event-delegate"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('view', function (Y, NAME) {

/**
Represents a logical piece of an application's user interface, and provides a
lightweight, overridable API for rendering content and handling delegated DOM
events on a container element.

@module app
@submodule view
@since 3.4.0
**/

/**
Represents a logical piece of an application's user interface, and provides a
lightweight, overridable API for rendering content and handling delegated DOM
events on a container element.

The View class imposes little structure and provides only minimal functionality
of its own: it's basically just an overridable API interface that helps you
implement custom views.

As of YUI 3.5.0, View allows ad-hoc attributes to be specified at instantiation
time, so you don't need to subclass `Y.View` to add custom attributes. Just pass
them to the constructor:

    var view = new Y.View({foo: 'bar'});
    view.get('foo'); // => "bar"

@class View
@constructor
@extends Base
@since 3.4.0
**/

function View() {
    View.superclass.constructor.apply(this, arguments);
}

Y.View = Y.extend(View, Y.Base, {
    // -- Public Properties ----------------------------------------------------

    /**
    Template for this view's container.

    @property containerTemplate
    @type String
    @default "<div/>"
    @since 3.5.0
    **/
    containerTemplate: '<div/>',

    /**
    Hash of CSS selectors mapped to events to delegate to elements matching
    those selectors.

    CSS selectors are relative to the `container` element. Events are attached
    to the container, and delegation is used so that subscribers are only
    notified of events that occur on elements inside the container that match
    the specified selectors. This allows the container's contents to be re-
    rendered as needed without losing event subscriptions.

    Event handlers can be specified either as functions or as strings that map
    to function names on this view instance or its prototype.

    The `this` object in event handlers will refer to this view instance. If
    you'd prefer `this` to be something else, use `Y.bind()` to bind a custom
    `this` object.

    @example

        var view = new Y.View({
            events: {
                // Call `this.toggle()` whenever the element with the id
                // "toggle-button" is clicked.
                '#toggle-button': {click: 'toggle'},

                // Call `this.hoverOn()` when the mouse moves over any element
                // with the "hoverable" class, and `this.hoverOff()` when the
                // mouse moves out of any element with the "hoverable" class.
                '.hoverable': {
                    mouseover: 'hoverOn',
                    mouseout : 'hoverOff'
                }
            }
        });

    @property events
    @type Object
    @default {}
    **/
    events: {},

    /**
    Template for this view's contents.

    This is a convenience property that has no default behavior of its own.
    It's only provided as a convention to allow you to store whatever you
    consider to be a template, whether that's an HTML string, a `Y.Node`
    instance, a Mustache template, or anything else your little heart
    desires.

    How this template gets used is entirely up to you and your custom
    `render()` method.

    @property template
    @type mixed
    @default ''
    **/
    template: '',

    // -- Protected Properties -------------------------------------------------

    /**
    This tells `Y.Base` that it should create ad-hoc attributes for config
    properties passed to View's constructor. This makes it possible to
    instantiate a view and set a bunch of attributes without having to subclass
    `Y.View` and declare all those attributes first.

    @property _allowAdHocAttrs
    @type Boolean
    @default true
    @protected
    @since 3.5.0
    **/
    _allowAdHocAttrs: true,

    // -- Lifecycle Methods ----------------------------------------------------
    initializer: function (config) {
        config || (config = {});

        // Set instance properties specified in the config.
        config.containerTemplate &&
            (this.containerTemplate = config.containerTemplate);

        config.template && (this.template = config.template);

        // Merge events from the config into events in `this.events`.
        this.events = config.events ? Y.merge(this.events, config.events) :
            this.events;

        // When the container node changes (or when it's set for the first
        // time), we'll attach events to it, but not until then. This allows the
        // container to be created lazily the first time it's accessed rather
        // than always on init.
        this.after('containerChange', this._afterContainerChange);
    },

    /**
    Destroys this View, detaching any DOM events and optionally also destroying
    its container node.

    By default, the container node will not be destroyed. Pass an _options_
    object with a truthy `remove` property to destroy the container as well.

    @method destroy
    @param {Object} [options] Options.
        @param {Boolean} [options.remove=false] If `true`, this View's container
            will be removed from the DOM and destroyed as well.
    @chainable
    */
    destroy: function (options) {
        // We also accept `delete` as a synonym for `remove`.
        if (options && (options.remove || options['delete'])) {
            // Attaching an event handler here because the `destroy` event is
            // preventable. If we destroyed the container before calling the
            // superclass's `destroy()` method and the event was prevented, the
            // class would end up in a broken state.
            this.onceAfter('destroy', function () {
                this._destroyContainer();
            });
        }

        return View.superclass.destroy.call(this);
    },

    destructor: function () {
        this.detachEvents();
        delete this._container;
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Attaches delegated event handlers to this view's container element. This
    method is called internally to subscribe to events configured in the
    `events` attribute when the view is initialized.

    You may override this method to customize the event attaching logic.

    @method attachEvents
    @param {Object} [events] Hash of events to attach. See the docs for the
        `events` attribute for details on the format. If not specified, this
        view's `events` property will be used.
    @chainable
    @see detachEvents
    **/
    attachEvents: function (events) {
        var container = this.get('container'),
            owns      = Y.Object.owns,
            handler, handlers, name, selector;

        this.detachEvents();

        events || (events = this.events);

        for (selector in events) {
            if (!owns(events, selector)) { continue; }

            handlers = events[selector];

            for (name in handlers) {
                if (!owns(handlers, name)) { continue; }

                handler = handlers[name];

                // TODO: Make this more robust by using lazy-binding:
                // `handler = Y.bind(handler, this);`
                if (typeof handler === 'string') {
                    handler = this[handler];
                }

                if (!handler) {
                    continue;
                }

                this._attachedViewEvents.push(
                    container.delegate(name, handler, selector, this));
            }
        }

        return this;
    },

    /**
    Creates and returns a container node for this view.

    By default, the container is created from the HTML template specified in the
    `containerTemplate` property, and is _not_ added to the DOM automatically.

    You may override this method to customize how the container node is created
    (such as by rendering it from a custom template format). Your method must
    return a `Y.Node` instance.

    @method create
    @param {HTMLElement|Node|String} [container] Selector string, `Y.Node`
        instance, or DOM element to use at the container node.
    @return {Node} Node instance of the created container node.
    **/
    create: function (container) {
        return container ? Y.one(container) :
                Y.Node.create(this.containerTemplate);
    },

    /**
    Detaches DOM events that have previously been attached to the container by
    `attachEvents()`.

    @method detachEvents
    @chainable
    @see attachEvents
    **/
    detachEvents: function () {
        Y.Array.each(this._attachedViewEvents, function (handle) {
            if (handle) {
                handle.detach();
            }
        });

        this._attachedViewEvents = [];
        return this;
    },

    /**
    Removes this view's container element from the DOM (if it's in the DOM),
    but doesn't destroy it or any event listeners attached to it.

    @method remove
    @chainable
    **/
    remove: function () {
        var container = this.get('container');
        container && container.remove();
        return this;
    },

    /**
    Renders this view.

    This method is a noop by default. Override it to provide a custom
    implementation that renders this view's content and appends it to the
    container element. Ideally your `render` method should also return `this` as
    the end to allow chaining, but that's up to you.

    Since there's no default renderer, you're free to render your view however
    you see fit, whether that means manipulating the DOM directly, dumping
    strings into `innerHTML`, or using a template language of some kind.

    For basic templating needs, `Y.Node.create()` and `Y.Lang.sub()` may
    suffice, but there are no restrictions on what tools or techniques you can
    use to render your view. All you need to do is append something to the
    container element at some point, and optionally append the container
    to the DOM if it's not there already.

    @method render
    @chainable
    **/
    render: function () {
        return this;
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    Removes the `container` from the DOM and purges all its event listeners.

    @method _destroyContainer
    @protected
    **/
    _destroyContainer: function () {
        var container = this.get('container');
        container && container.remove(true);
    },

    /**
    Getter for the `container` attribute.

    @method _getContainer
    @param {Node|null} value Current attribute value.
    @return {Node} Container node.
    @protected
    @since 3.5.0
    **/
    _getContainer: function (value) {
        // This wackiness is necessary to enable fully lazy creation of the
        // container node both when no container is specified and when one is
        // specified via a valueFn.

        if (!this._container) {
            if (value) {
                // Attach events to the container when it's specified via a
                // valueFn, which won't fire the containerChange event.
                this._container = value;
                this.attachEvents();
            } else {
                // Create a default container and set that as the new attribute
                // value. The `this._container` property prevents infinite
                // recursion.
                value = this._container = this.create();
                this._set('container', value);
            }
        }

        return value;
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    Handles `containerChange` events. Detaches event handlers from the old
    container (if any) and attaches them to the new container.

    Right now the `container` attr is initOnly so this event should only ever
    fire the first time the container is created, but in the future (once Y.App
    can handle it) we may allow runtime container changes.

    @method _afterContainerChange
    @protected
    @since 3.5.0
    **/
    _afterContainerChange: function () {
        this.attachEvents(this.events);
    }
}, {
    NAME: 'view',

    ATTRS: {
        /**
        Container node into which this view's content will be rendered.

        The container node serves as the host for all DOM events attached by the
        view. Delegation is used to handle events on children of the container,
        allowing the container's contents to be re-rendered at any time without
        losing event subscriptions.

        The default container is a `<div>` Node, but you can override this in
        a subclass, or by passing in a custom `container` config value at
        instantiation time. If you override the default container in a subclass
        using `ATTRS`, you must use the `valueFn` property. The view's constructor
        will ignore any assignments using `value`.

        When `container` is overridden by a subclass or passed as a config
        option at instantiation time, you can provide it as a selector string, a
        DOM element, a `Y.Node` instance, or (if you are subclassing and modifying
        the attribute), a `valueFn` function that returns a `Y.Node` instance.
        The value will be converted into a `Y.Node` instance if it isn't one
        already.

        The container is not added to the page automatically. This allows you to
        have full control over how and when your view is actually rendered to
        the page.

        @attribute container
        @type HTMLElement|Node|String
        @default Y.Node.create(this.containerTemplate)
        @writeOnce
        **/
        container: {
            getter   : '_getContainer',
            setter   : Y.one,
            writeOnce: true
        }
    },

    /**
    Properties that shouldn't be turned into ad-hoc attributes when passed to
    View's constructor.

    @property _NON_ATTRS_CFG
    @type Array
    @static
    @protected
    @since 3.5.0
    **/
    _NON_ATTRS_CFG: [
        'containerTemplate',
        'events',
        'template'
    ]
});



}, '3.16.0', {"requires": ["base-build", "node-event-delegate"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-head', function (Y, NAME) {

/**
View class responsible for rendering the `<thead>` section of a table. Used as
the default `headerView` for `Y.DataTable.Base` and `Y.DataTable` classes.

@module datatable
@submodule datatable-head
@since 3.5.0
**/
var Lang = Y.Lang,
    fromTemplate = Lang.sub,
    isArray = Lang.isArray,
    toArray = Y.Array;

/**
View class responsible for rendering the `<thead>` section of a table. Used as
the default `headerView` for `Y.DataTable.Base` and `Y.DataTable` classes.

Translates the provided array of column configuration objects into a rendered
`<thead>` based on the data in those objects.


The structure of the column data is expected to be a single array of objects,
where each object corresponds to a `<th>`.  Those objects may contain a
`children` property containing a similarly structured array to indicate the
nested cells should be grouped under the parent column's colspan in a separate
row of header cells. E.g.

<pre><code>
new Y.DataTable.HeaderView({
  container: tableNode,
  columns: [
    { key: 'id' }, // no nesting
    { key: 'name', children: [
      { key: 'firstName', label: 'First' },
      { key: 'lastName',  label: 'Last' } ] }
  ]
}).render();
</code></pre>

This would translate to the following visualization:

<pre>
---------------------
|    |     name     |
|    |---------------
| id | First | Last |
---------------------
</pre>

Supported properties of the column objects include:

  * `label`     - The HTML content of the header cell.
  * `key`       - If `label` is not specified, the `key` is used for content.
  * `children`  - Array of columns to appear below this column in the next
                  row.
  * `headerTemplate` - Overrides the instance's `CELL_TEMPLATE` for cells in this
    column only.
  * `abbr`      - The content of the 'abbr' attribute of the `<th>`
  * `title`     - The content of the 'title' attribute of the `<th>`
  * `className` - Adds this string of CSS classes to the column header

Through the life of instantiation and rendering, the column objects will have
the following properties added to them:

  * `id`       - (Defaulted by DataTable) The id to assign the rendered column
  * `_colspan` - To supply the `<th>` attribute
  * `_rowspan` - To supply the `<th>` attribute
  * `_parent`  - (Added by DataTable) If the column is a child of another
    column, this points to its parent column

The column object is also used to provide values for {placeholder} tokens in the
instance's `CELL_TEMPLATE`, so you can modify the template and include other
column object properties to populate them.

@class HeaderView
@namespace DataTable
@extends View
@since 3.5.0
**/
Y.namespace('DataTable').HeaderView = Y.Base.create('tableHeader', Y.View, [], {
    // -- Instance properties -------------------------------------------------

    /**
    Template used to create the table's header cell markup.  Override this to
    customize how header cell markup is created.

    @property CELL_TEMPLATE
    @type {String}
    @default '<th id="{id}" colspan="{_colspan}" rowspan="{_rowspan}" class="{className}" scope="col" {_id}{abbr}{title}>{content}</th>'
    @since 3.5.0
    **/
    CELL_TEMPLATE:
        '<th id="{id}" colspan="{_colspan}" rowspan="{_rowspan}" class="{className}" scope="col" {_id}{abbr}{title}>{content}</th>',

    /**
    The data representation of the header rows to render.  This is assigned by
    parsing the `columns` configuration array, and is used by the render()
    method.

    @property columns
    @type {Array[]}
    @default (initially unset)
    @since 3.5.0
    **/
    //TODO: should this be protected?
    //columns: null,

    /**
    Template used to create the table's header row markup.  Override this to
    customize the row markup.

    @property ROW_TEMPLATE
    @type {String}
    @default '<tr>{content}</tr>'
    @since 3.5.0
    **/
    ROW_TEMPLATE:
        '<tr>{content}</tr>',

    /**
    The object that serves as the source of truth for column and row data.
    This property is assigned at instantiation from the `source` property of
    the configuration object passed to the constructor.

    @property source
    @type {Object}
    @default (initially unset)
    @since 3.5.0
    **/
    //TODO: should this be protected?
    //source: null,

    /**
    HTML templates used to create the `<thead>` containing the table headers.

    @property THEAD_TEMPLATE
    @type {String}
    @default '<thead class="{className}">{content}</thead>'
    @since 3.6.0
    **/
    THEAD_TEMPLATE: '<thead class="{className}"></thead>',

    // -- Public methods ------------------------------------------------------

    /**
    Returns the generated CSS classname based on the input.  If the `host`
    attribute is configured, it will attempt to relay to its `getClassName`
    or use its static `NAME` property as a string base.

    If `host` is absent or has neither method nor `NAME`, a CSS classname
    will be generated using this class's `NAME`.

    @method getClassName
    @param {String} token* Any number of token strings to assemble the
        classname from.
    @return {String}
    @protected
    **/
    getClassName: function () {
        // TODO: add attribute with setter? to host to use property this.host
        // for performance
        var host = this.host,
            NAME = (host && host.constructor.NAME) ||
                    this.constructor.NAME;

        if (host && host.getClassName) {
            return host.getClassName.apply(host, arguments);
        } else {
            return Y.ClassNameManager.getClassName
                .apply(Y.ClassNameManager,
                       [NAME].concat(toArray(arguments, 0, true)));
        }
    },

    /**
    Creates the `<thead>` Node content by assembling markup generated by
    populating the `ROW_TEMPLATE` and `CELL_TEMPLATE` templates with content
    from the `columns` property.

    @method render
    @chainable
    @since 3.5.0
    **/
    render: function () {
        var table    = this.get('container'),
            thead    = this.theadNode ||
                        (this.theadNode = this._createTHeadNode()),
            columns  = this.columns,
            defaults = {
                _colspan: 1,
                _rowspan: 1,
                abbr: '',
                title: ''
            },
            i, len, j, jlen, col, html, content, values;

        if (thead && columns) {
            html = '';

            if (columns.length) {
                for (i = 0, len = columns.length; i < len; ++i) {
                    content = '';

                    for (j = 0, jlen = columns[i].length; j < jlen; ++j) {
                        col = columns[i][j];
                        values = Y.merge(
                            defaults,
                            col, {
                                className: this.getClassName('header'),
                                content  : col.label || col.key ||
                                           ("Column " + (j + 1))
                            }
                        );

                        values._id = col._id ?
                            ' data-yui3-col-id="' + col._id + '"' : '';

                        if (col.abbr) {
                            values.abbr = ' abbr="' + col.abbr + '"';
                        }

                        if (col.title) {
                            values.title = ' title="' + col.title + '"';
                        }

                        if (col.className) {
                            values.className += ' ' + col.className;
                        }

                        if (col._first) {
                            values.className += ' ' + this.getClassName('first', 'header');
                        }

                        if (col._id) {
                            values.className +=
                                ' ' + this.getClassName('col', col._id);
                        }

                        content += fromTemplate(
                            col.headerTemplate || this.CELL_TEMPLATE, values);
                    }

                    html += fromTemplate(this.ROW_TEMPLATE, {
                        content: content
                    });
                }
            }

            thead.setHTML(html);

            if (thead.get('parentNode') !== table) {
                table.insertBefore(thead, table.one('tfoot, tbody'));
            }
        }

        this.bindUI();

        return this;
    },

    // -- Protected and private properties and methods ------------------------

    /**
    Handles changes in the source's columns attribute.  Redraws the headers.

    @method _afterColumnsChange
    @param {EventFacade} e The `columnsChange` event object
    @protected
    @since 3.5.0
    **/
    _afterColumnsChange: function (e) {
        this.columns = this._parseColumns(e.newVal);

        this.render();
    },

    /**
    Binds event subscriptions from the UI and the source (if assigned).

    @method bindUI
    @protected
    @since 3.5.0
    **/
    bindUI: function () {
        if (!this._eventHandles.columnsChange) {
            // TODO: How best to decouple this?
            this._eventHandles.columnsChange =
                this.after('columnsChange',
                    Y.bind('_afterColumnsChange', this));
        }
    },

    /**
    Creates the `<thead>` node that will store the header rows and cells.

    @method _createTHeadNode
    @return {Node}
    @protected
    @since 3.6.0
    **/
    _createTHeadNode: function () {
        return Y.Node.create(fromTemplate(this.THEAD_TEMPLATE, {
            className: this.getClassName('columns')
        }));
    },

    /**
    Destroys the instance.

    @method destructor
    @protected
    @since 3.5.0
    **/
    destructor: function () {
        (new Y.EventHandle(Y.Object.values(this._eventHandles))).detach();
    },

    /**
    Holds the event subscriptions needing to be detached when the instance is
    `destroy()`ed.

    @property _eventHandles
    @type {Object}
    @default undefined (initially unset)
    @protected
    @since 3.5.0
    **/
    //_eventHandles: null,

    /**
    Initializes the instance. Reads the following configuration properties:

      * `columns` - (REQUIRED) The initial column information
      * `host`    - The object to serve as source of truth for column info

    @method initializer
    @param {Object} config Configuration data
    @protected
    @since 3.5.0
    **/
    initializer: function (config) {
        this.host  = config.host;
        this.columns = this._parseColumns(config.columns);

        this._eventHandles = [];
    },

    /**
    Translate the input column format into a structure useful for rendering a
    `<thead>`, rows, and cells.  The structure of the input is expected to be a
    single array of objects, where each object corresponds to a `<th>`.  Those
    objects may contain a `children` property containing a similarly structured
    array to indicate the nested cells should be grouped under the parent
    column's colspan in a separate row of header cells. E.g.

    <pre><code>
    [
      { key: 'id' }, // no nesting
      { key: 'name', children: [
        { key: 'firstName', label: 'First' },
        { key: 'lastName',  label: 'Last' } ] }
    ]
    </code></pre>

    would indicate two header rows with the first column 'id' being assigned a
    `rowspan` of `2`, the 'name' column appearing in the first row with a
    `colspan` of `2`, and the 'firstName' and 'lastName' columns appearing in
    the second row, below the 'name' column.

    <pre>
    ---------------------
    |    |     name     |
    |    |---------------
    | id | First | Last |
    ---------------------
    </pre>

    Supported properties of the column objects include:

      * `label`    - The HTML content of the header cell.
      * `key`      - If `label` is not specified, the `key` is used for content.
      * `children` - Array of columns to appear below this column in the next
                     row.
      * `abbr`     - The content of the 'abbr' attribute of the `<th>`
      * `title`    - The content of the 'title' attribute of the `<th>`
      * `headerTemplate` - Overrides the instance's `CELL_TEMPLATE` for cells
        in this column only.

    The output structure is basically a simulation of the `<thead>` structure
    with arrays for rows and objects for cells.  Column objects have the
    following properties added to them:

      * `id`       - (Defaulted by DataTable) The id to assign the rendered
                     column
      * `_colspan` - Per the `<th>` attribute
      * `_rowspan` - Per the `<th>` attribute
      * `_parent`  - (Added by DataTable) If the column is a child of another
        column, this points to its parent column

    The column object is also used to provide values for {placeholder}
    replacement in the `CELL_TEMPLATE`, so you can modify the template and
    include other column object properties to populate them.

    @method _parseColumns
    @param {Object[]} data Array of column object data
    @return {Array[]} An array of arrays corresponding to the header row
            structure to render
    @protected
    @since 3.5.0
    **/
    _parseColumns: function (data) {
        var columns = [],
            stack = [],
            rowSpan = 1,
            entry, row, col, children, parent, i, len, j;

        if (isArray(data) && data.length) {
            // don't modify the input array
            data = data.slice();

            // First pass, assign colspans and calculate row count for
            // non-nested headers' rowspan
            stack.push([data, -1]);

            while (stack.length) {
                entry = stack[stack.length - 1];
                row   = entry[0];
                i     = entry[1] + 1;

                for (len = row.length; i < len; ++i) {
                    row[i] = col = Y.merge(row[i]);
                    children = col.children;

                    Y.stamp(col);

                    if (!col.id) {
                        col.id = Y.guid();
                    }

                    if (isArray(children) && children.length) {
                        stack.push([children, -1]);
                        entry[1] = i;

                        rowSpan = Math.max(rowSpan, stack.length);

                        // break to let the while loop process the children
                        break;
                    } else {
                        col._colspan = 1;
                    }
                }

                if (i >= len) {
                    // All columns in this row are processed
                    if (stack.length > 1) {
                        entry  = stack[stack.length - 2];
                        parent = entry[0][entry[1]];

                        parent._colspan = 0;

                        for (i = 0, len = row.length; i < len; ++i) {
                            // Can't use .length because in 3+ rows, colspan
                            // needs to aggregate the colspans of children
                            row[i]._parent   = parent;
                            parent._colspan += row[i]._colspan;
                        }
                    }
                    stack.pop();
                }
            }

            // Second pass, build row arrays and assign rowspan
            for (i = 0; i < rowSpan; ++i) {
                columns.push([]);
            }

            stack.push([data, -1]);

            while (stack.length) {
                entry = stack[stack.length - 1];
                row   = entry[0];
                i     = entry[1] + 1;

                for (len = row.length; i < len; ++i) {
                    col = row[i];
                    children = col.children;

                    columns[stack.length - 1].push(col);

                    entry[1] = i;

                    // collect the IDs of parent cols
                    col._headers = [col.id];

                    for (j = stack.length - 2; j >= 0; --j) {
                        parent = stack[j][0][stack[j][1]];

                        col._headers.unshift(parent.id);
                    }

                    if (children && children.length) {
                        // parent cells must assume rowspan 1 (long story)

                        // break to let the while loop process the children
                        stack.push([children, -1]);
                        break;
                    } else {
                        col._rowspan = rowSpan - stack.length + 1;
                    }
                }

                if (i >= len) {
                    // All columns in this row are processed
                    stack.pop();
                }
            }
        }

        for (i = 0, len = columns.length; i < len; i += col._rowspan) {
            col = columns[i][0];

            col._first = true;
        }

        return columns;
    }
});


}, '3.16.0', {"requires": ["datatable-core", "view", "classnamemanager"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-body', function (Y, NAME) {

/**
View class responsible for rendering the `<tbody>` section of a table. Used as
the default `bodyView` for `Y.DataTable.Base` and `Y.DataTable` classes.

@module datatable
@submodule datatable-body
@since 3.5.0
**/
var Lang             = Y.Lang,
    isArray          = Lang.isArray,
    isNumber         = Lang.isNumber,
    isString         = Lang.isString,
    fromTemplate     = Lang.sub,
    htmlEscape       = Y.Escape.html,
    toArray          = Y.Array,
    bind             = Y.bind,
    YObject          = Y.Object,
    valueRegExp      = /\{value\}/g,
    EV_CONTENT_UPDATE = 'contentUpdate',

    shiftMap = {
        above:    [-1, 0],
        below:    [1, 0],
        next:     [0, 1],
        prev:     [0, -1],
        previous: [0, -1]
    };

/**
View class responsible for rendering the `<tbody>` section of a table. Used as
the default `bodyView` for `Y.DataTable.Base` and `Y.DataTable` classes.

Translates the provided `modelList` into a rendered `<tbody>` based on the data
in the constituent Models, altered or amended by any special column
configurations.

The `columns` configuration, passed to the constructor, determines which
columns will be rendered.

The rendering process involves constructing an HTML template for a complete row
of data, built by concatenating a customized copy of the instance's
`CELL_TEMPLATE` into the `ROW_TEMPLATE` once for each column.  This template is
then populated with values from each Model in the `modelList`, aggregating a
complete HTML string of all row and column data.  A `<tbody>` Node is then created from the markup and any column `nodeFormatter`s are applied.

Supported properties of the column objects include:

  * `key` - Used to link a column to an attribute in a Model.
  * `name` - Used for columns that don't relate to an attribute in the Model
    (`formatter` or `nodeFormatter` only) if the implementer wants a
    predictable name to refer to in their CSS.
  * `cellTemplate` - Overrides the instance's `CELL_TEMPLATE` for cells in this
    column only.
  * `formatter` - Used to customize or override the content value from the
    Model.  These do not have access to the cell or row Nodes and should
    return string (HTML) content.
  * `nodeFormatter` - Used to provide content for a cell as well as perform any
    custom modifications on the cell or row Node that could not be performed by
    `formatter`s.  Should be used sparingly for better performance.
  * `emptyCellValue` - String (HTML) value to use if the Model data for a
    column, or the content generated by a `formatter`, is the empty string,
    `null`, or `undefined`.
  * `allowHTML` - Set to `true` if a column value, `formatter`, or
    `emptyCellValue` can contain HTML.  This defaults to `false` to protect
    against XSS.
  * `className` - Space delimited CSS classes to add to all `<td>`s in a column.

A column `formatter` can be:

  * a function, as described below.
  * a string which can be:
      * the name of a pre-defined formatter function
        which can be located in the `Y.DataTable.BodyView.Formatters` hash using the
        value of the `formatter` property as the index.
      * A template that can use the `{value}` placeholder to include the value
        for the current cell or the name of any field in the underlaying model
        also enclosed in curly braces.  Any number and type of these placeholders
        can be used.

Column `formatter`s are passed an object (`o`) with the following properties:

  * `value` - The current value of the column's associated attribute, if any.
  * `data` - An object map of Model keys to their current values.
  * `record` - The Model instance.
  * `column` - The column configuration object for the current column.
  * `className` - Initially empty string to allow `formatter`s to add CSS
    classes to the cell's `<td>`.
  * `rowIndex` - The zero-based row number.
  * `rowClass` - Initially empty string to allow `formatter`s to add CSS
    classes to the cell's containing row `<tr>`.

They may return a value or update `o.value` to assign specific HTML content.  A
returned value has higher precedence.

Column `nodeFormatter`s are passed an object (`o`) with the following
properties:

  * `value` - The current value of the column's associated attribute, if any.
  * `td` - The `<td>` Node instance.
  * `cell` - The `<div>` liner Node instance if present, otherwise, the `<td>`.
    When adding content to the cell, prefer appending into this property.
  * `data` - An object map of Model keys to their current values.
  * `record` - The Model instance.
  * `column` - The column configuration object for the current column.
  * `rowIndex` - The zero-based row number.

They are expected to inject content into the cell's Node directly, including
any "empty" cell content.  Each `nodeFormatter` will have access through the
Node API to all cells and rows in the `<tbody>`, but not to the `<table>`, as
it will not be attached yet.

If a `nodeFormatter` returns `false`, the `o.td` and `o.cell` Nodes will be
`destroy()`ed to remove them from the Node cache and free up memory.  The DOM
elements will remain as will any content added to them.  _It is highly
advisable to always return `false` from your `nodeFormatter`s_.

@class BodyView
@namespace DataTable
@extends View
@since 3.5.0
**/
Y.namespace('DataTable').BodyView = Y.Base.create('tableBody', Y.View, [], {
    // -- Instance properties -------------------------------------------------

    /**
    HTML template used to create table cells.

    @property CELL_TEMPLATE
    @type {String}
    @default '<td {headers} class="{className}">{content}</td>'
    @since 3.5.0
    **/
    CELL_TEMPLATE: '<td {headers} class="{className}">{content}</td>',

    /**
    CSS class applied to even rows.  This is assigned at instantiation.

    For DataTable, this will be `yui3-datatable-even`.

    @property CLASS_EVEN
    @type {String}
    @default 'yui3-table-even'
    @since 3.5.0
    **/
    //CLASS_EVEN: null

    /**
    CSS class applied to odd rows.  This is assigned at instantiation.

    When used by DataTable instances, this will be `yui3-datatable-odd`.

    @property CLASS_ODD
    @type {String}
    @default 'yui3-table-odd'
    @since 3.5.0
    **/
    //CLASS_ODD: null

    /**
    HTML template used to create table rows.

    @property ROW_TEMPLATE
    @type {String}
    @default '<tr id="{rowId}" data-yui3-record="{clientId}" class="{rowClass}">{content}</tr>'
    @since 3.5.0
    **/
    ROW_TEMPLATE : '<tr id="{rowId}" data-yui3-record="{clientId}" class="{rowClass}">{content}</tr>',

    /**
    The object that serves as the source of truth for column and row data.
    This property is assigned at instantiation from the `host` property of
    the configuration object passed to the constructor.

    @property host
    @type {Object}
    @default (initially unset)
    @since 3.5.0
    **/
    //TODO: should this be protected?
    //host: null,

    /**
    HTML templates used to create the `<tbody>` containing the table rows.

    @property TBODY_TEMPLATE
    @type {String}
    @default '<tbody class="{className}">{content}</tbody>'
    @since 3.6.0
    **/
    TBODY_TEMPLATE: '<tbody class="{className}"></tbody>',

    // -- Public methods ------------------------------------------------------

    /**
    Returns the `<td>` Node from the given row and column index.  Alternately,
    the `seed` can be a Node.  If so, the nearest ancestor cell is returned.
    If the `seed` is a cell, it is returned.  If there is no cell at the given
    coordinates, `null` is returned.

    Optionally, include an offset array or string to return a cell near the
    cell identified by the `seed`.  The offset can be an array containing the
    number of rows to shift followed by the number of columns to shift, or one
    of "above", "below", "next", or "previous".

    <pre><code>// Previous cell in the previous row
    var cell = table.getCell(e.target, [-1, -1]);

    // Next cell
    var cell = table.getCell(e.target, 'next');
    var cell = table.getCell(e.target, [0, 1];</pre></code>

    @method getCell
    @param {Number[]|Node} seed Array of row and column indexes, or a Node that
        is either the cell itself or a descendant of one.
    @param {Number[]|String} [shift] Offset by which to identify the returned
        cell Node
    @return {Node}
    @since 3.5.0
    **/
    getCell: function (seed, shift) {
        var tbody = this.tbodyNode,
            row, cell, index, rowIndexOffset;

        if (seed && tbody) {
            if (isArray(seed)) {
                row = tbody.get('children').item(seed[0]);
                cell = row && row.get('children').item(seed[1]);
            } else if (seed._node) {
                cell = seed.ancestor('.' + this.getClassName('cell'), true);
            }

            if (cell && shift) {
                rowIndexOffset = tbody.get('firstChild.rowIndex');
                if (isString(shift)) {
                    if (!shiftMap[shift]) {
                        Y.error('Unrecognized shift: ' + shift, null, 'datatable-body');
                    }
                    shift = shiftMap[shift];
                }

                if (isArray(shift)) {
                    index = cell.get('parentNode.rowIndex') +
                                shift[0] - rowIndexOffset;
                    row   = tbody.get('children').item(index);

                    index = cell.get('cellIndex') + shift[1];
                    cell  = row && row.get('children').item(index);
                }
            }
        }

        return cell || null;
    },

    /**
    Returns the generated CSS classname based on the input.  If the `host`
    attribute is configured, it will attempt to relay to its `getClassName`
    or use its static `NAME` property as a string base.

    If `host` is absent or has neither method nor `NAME`, a CSS classname
    will be generated using this class's `NAME`.

    @method getClassName
    @param {String} token* Any number of token strings to assemble the
        classname from.
    @return {String}
    @protected
    @since 3.5.0
    **/
    getClassName: function () {
        var host = this.host,
            args;

        if (host && host.getClassName) {
            return host.getClassName.apply(host, arguments);
        } else {
            args = toArray(arguments);
            args.unshift(this.constructor.NAME);
            return Y.ClassNameManager.getClassName
                .apply(Y.ClassNameManager, args);
        }
    },

    /**
    Returns the Model associated to the row Node or id provided. Passing the
    Node or id for a descendant of the row also works.

    If no Model can be found, `null` is returned.

    @method getRecord
    @param {String|Node} seed Row Node or `id`, or one for a descendant of a row
    @return {Model}
    @since 3.5.0
    **/
    getRecord: function (seed) {
        var modelList = this.get('modelList'),
            tbody     = this.tbodyNode,
            row       = null,
            record;

        if (tbody) {
            if (isString(seed)) {
                seed = tbody.one('#' + seed);
            }

            if (seed && seed._node) {
                row = seed.ancestor(function (node) {
                    return node.get('parentNode').compareTo(tbody);
                }, true);

                record = row &&
                    modelList.getByClientId(row.getData('yui3-record'));
            }
        }

        return record || null;
    },

    /**
    Returns the `<tr>` Node from the given row index, Model, or Model's
    `clientId`.  If the rows haven't been rendered yet, or if the row can't be
    found by the input, `null` is returned.

    @method getRow
    @param {Number|String|Model} id Row index, Model instance, or clientId
    @return {Node}
    @since 3.5.0
    **/
    getRow: function (id) {
        var tbody = this.tbodyNode,
            row = null;

        if (tbody) {
            if (id) {
                id = this._idMap[id.get ? id.get('clientId') : id] || id;
            }

            row = isNumber(id) ?
                tbody.get('children').item(id) :
                tbody.one('#' + id);
        }

        return row;
    },

    /**
    Creates the table's `<tbody>` content by assembling markup generated by
    populating the `ROW\_TEMPLATE`, and `CELL\_TEMPLATE` templates with content
    from the `columns` and `modelList` attributes.

    The rendering process happens in three stages:

    1. A row template is assembled from the `columns` attribute (see
       `_createRowTemplate`)

    2. An HTML string is built up by concatenating the application of the data in
       each Model in the `modelList` to the row template. For cells with
       `formatter`s, the function is called to generate cell content. Cells
       with `nodeFormatter`s are ignored. For all other cells, the data value
       from the Model attribute for the given column key is used.  The
       accumulated row markup is then inserted into the container.

    3. If any column is configured with a `nodeFormatter`, the `modelList` is
       iterated again to apply the `nodeFormatter`s.

    Supported properties of the column objects include:

      * `key` - Used to link a column to an attribute in a Model.
      * `name` - Used for columns that don't relate to an attribute in the Model
        (`formatter` or `nodeFormatter` only) if the implementer wants a
        predictable name to refer to in their CSS.
      * `cellTemplate` - Overrides the instance's `CELL_TEMPLATE` for cells in
        this column only.
      * `formatter` - Used to customize or override the content value from the
        Model.  These do not have access to the cell or row Nodes and should
        return string (HTML) content.
      * `nodeFormatter` - Used to provide content for a cell as well as perform
        any custom modifications on the cell or row Node that could not be
        performed by `formatter`s.  Should be used sparingly for better
        performance.
      * `emptyCellValue` - String (HTML) value to use if the Model data for a
        column, or the content generated by a `formatter`, is the empty string,
        `null`, or `undefined`.
      * `allowHTML` - Set to `true` if a column value, `formatter`, or
        `emptyCellValue` can contain HTML.  This defaults to `false` to protect
        against XSS.
      * `className` - Space delimited CSS classes to add to all `<td>`s in a
        column.

    Column `formatter`s are passed an object (`o`) with the following
    properties:

      * `value` - The current value of the column's associated attribute, if
        any.
      * `data` - An object map of Model keys to their current values.
      * `record` - The Model instance.
      * `column` - The column configuration object for the current column.
      * `className` - Initially empty string to allow `formatter`s to add CSS
        classes to the cell's `<td>`.
      * `rowIndex` - The zero-based row number.
      * `rowClass` - Initially empty string to allow `formatter`s to add CSS
        classes to the cell's containing row `<tr>`.

    They may return a value or update `o.value` to assign specific HTML
    content.  A returned value has higher precedence.

    Column `nodeFormatter`s are passed an object (`o`) with the following
    properties:

      * `value` - The current value of the column's associated attribute, if
        any.
      * `td` - The `<td>` Node instance.
      * `cell` - The `<div>` liner Node instance if present, otherwise, the
        `<td>`.  When adding content to the cell, prefer appending into this
        property.
      * `data` - An object map of Model keys to their current values.
      * `record` - The Model instance.
      * `column` - The column configuration object for the current column.
      * `rowIndex` - The zero-based row number.

    They are expected to inject content into the cell's Node directly, including
    any "empty" cell content.  Each `nodeFormatter` will have access through the
    Node API to all cells and rows in the `<tbody>`, but not to the `<table>`,
    as it will not be attached yet.

    If a `nodeFormatter` returns `false`, the `o.td` and `o.cell` Nodes will be
    `destroy()`ed to remove them from the Node cache and free up memory.  The
    DOM elements will remain as will any content added to them.  _It is highly
    advisable to always return `false` from your `nodeFormatter`s_.

    @method render
    @chainable
    @since 3.5.0
    **/
    render: function () {
        var table   = this.get('container'),
            data    = this.get('modelList'),
            displayCols = this.get('columns'),
            tbody   = this.tbodyNode ||
                      (this.tbodyNode = this._createTBodyNode());

        // Needed for mutation
        this._createRowTemplate(displayCols);

        if (data) {
            tbody.setHTML(this._createDataHTML(displayCols));

            this._applyNodeFormatters(tbody, displayCols);
        }

        if (tbody.get('parentNode') !== table) {
            table.appendChild(tbody);
        }

        this.bindUI();

        return this;
    },

    /**
     Refreshes the provided row against the provided model and the Array of
     columns to be updated.

     @method refreshRow
     @param {Node} row
     @param {Model} model Y.Model representation of the row
     @param {String[]} colKeys Array of column keys

     @chainable
     */
    refreshRow: function (row, model, colKeys) {
        var col,
            cell,
            len = colKeys.length,
            i;

        for (i = 0; i < len; i++) {
            col = this.getColumn(colKeys[i]);

            if (col !== null) {
                cell = row.one('.' + this.getClassName('col', col._id || col.key));
                this.refreshCell(cell, model);
            }
        }

        return this;
    },

    /**
     Refreshes the given cell with the provided model data and the provided
     column configuration.

     Uses the provided column formatter if aviable.

     @method refreshCell
     @param {Node} cell Y.Node pointer to the cell element to be updated
     @param {Model} [model] Y.Model representation of the row
     @param {Object} [col] Column configuration object for the cell

     @chainable
     */
    refreshCell: function (cell, model, col) {
        var content,
            formatterFn,
            formatterData,
            data = model.toJSON();

        cell = this.getCell(cell);
        /* jshint -W030 */
        model || (model = this.getRecord(cell));
        col || (col = this.getColumn(cell));
        /* jshint +W030 */

        if (col.nodeFormatter) {
            formatterData = {
                cell: cell.one('.' + this.getClassName('liner')) || cell,
                column: col,
                data: data,
                record: model,
                rowIndex: this._getRowIndex(cell.ancestor('tr')),
                td: cell,
                value: data[col.key]
            };

            keep = col.nodeFormatter.call(host,formatterData);

            if (keep === false) {
                // Remove from the Node cache to reduce
                // memory footprint.  This also purges events,
                // which you shouldn't be scoping to a cell
                // anyway.  You've been warned.  Incidentally,
                // you should always return false. Just sayin.
                cell.destroy(true);
            }

        } else if (col.formatter) {
            if (!col._formatterFn) {
                col = this._setColumnsFormatterFn([col])[0];
            }

            formatterFn = col._formatterFn || null;

            if (formatterFn) {
                formatterData = {
                    value    : data[col.key],
                    data     : data,
                    column   : col,
                    record   : model,
                    className: '',
                    rowClass : '',
                    rowIndex : this._getRowIndex(cell.ancestor('tr'))
                };

                // Formatters can either return a value ...
                content = formatterFn.call(this.get('host'), formatterData);

                // ... or update the value property of the data obj passed
                if (content === undefined) {
                    content = formatterData.value;
                }
            }

            if (content === undefined || content === null || content === '') {
                content = col.emptyCellValue || '';
            }

        } else {
            content = data[col.key] || col.emptyCellValue || '';
        }

        cell.setHTML(col.allowHTML ? content : Y.Escape.html(content));

        return this;
    },

    /**
     Returns column data from this.get('columns'). If a Y.Node is provided as
     the key, will try to determine the key from the classname
     @method getColumn
     @param {String|Node} name
     @return {Object} Returns column configuration
     */
    getColumn: function (name) {
        if (name && name._node) {
            // get column name from node
            name = name.get('className').match(
                new RegExp( this.getClassName('col') +'-([^ ]*)' )
            )[1];
        }

        if (this.host) {
            return this.host._columnMap[name] || null;
        }
        var displayCols = this.get('columns'),
            col = null;

        Y.Array.some(displayCols, function (_col) {
            if ((_col._id || _col.key) === name) {
                col = _col;
                return true;
            }
        });

        return col;
    },

    // -- Protected and private methods ---------------------------------------
    /**
    Handles changes in the source's columns attribute.  Redraws the table data.

    @method _afterColumnsChange
    @param {EventFacade} e The `columnsChange` event object
    @protected
    @since 3.5.0
    **/
    // TODO: Preserve existing DOM
    // This will involve parsing and comparing the old and new column configs
    // and reacting to four types of changes:
    // 1. formatter, nodeFormatter, emptyCellValue changes
    // 2. column deletions
    // 3. column additions
    // 4. column moves (preserve cells)
    _afterColumnsChange: function () {
        this.render();
    },

    /**
    Handles modelList changes, including additions, deletions, and updates.

    Modifies the existing table DOM accordingly.

    @method _afterDataChange
    @param {EventFacade} e The `change` event from the ModelList
    @protected
    @since 3.5.0
    **/
    _afterDataChange: function (e) {
        var type = (e.type.match(/:(add|change|remove)$/) || [])[1],
            index = e.index,
            displayCols = this.get('columns'),
            col,
            changed = e.changed && Y.Object.keys(e.changed),
            key,
            row,
            i,
            len;

        for (i = 0, len = displayCols.length; i < len; i++ ) {
            col = displayCols[i];

            // since nodeFormatters typcially make changes outside of it's
            // cell, we need to see if there are any columns that have a
            // nodeFormatter and if so, we need to do a full render() of the
            // tbody
            if (col.hasOwnProperty('nodeFormatter')) {
                this.render();
                this.fire(EV_CONTENT_UPDATE);
                return;
            }
        }

        // TODO: if multiple rows are being added/remove/swapped, can we avoid the restriping?
        switch (type) {
            case 'change':
                for (i = 0, len = displayCols.length; i < len; i++) {
                    col = displayCols[i];
                    key = col.key;
                    if (col.formatter && !e.changed[key]) {
                        changed.push(key);
                    }
                }
                this.refreshRow(this.getRow(e.target), e.target, changed);
                break;
            case 'add':
                // we need to make sure we don't have an index larger than the data we have
                index =  Math.min(index, this.get('modelList').size() - 1);

                // updates the columns with formatter functions
                this._setColumnsFormatterFn(displayCols);
                row = Y.Node.create(this._createRowHTML(e.model, index, displayCols));
                this.tbodyNode.insert(row, index);
                this._restripe(index);
                break;
            case 'remove':
                this.getRow(index).remove(true);
                // we removed a row, so we need to back up our index to stripe
                this._restripe(index - 1);
                break;
            default:
                this.render();
        }

        // Event fired to tell users when we are done updating after the data
        // was changed
        this.fire(EV_CONTENT_UPDATE);
    },

    /**
     Toggles the odd/even classname of the row after the given index. This method
     is used to update rows after a row is inserted into or removed from the table.
     Note this event is delayed so the table is only restriped once when multiple
     rows are updated at one time.

     @protected
     @method _restripe
     @param {Number} [index] Index of row to start restriping after
     @since 3.11.0
     */
    _restripe: function (index) {
        var task = this._restripeTask,
            self;

        // index|0 to force int, avoid NaN. Math.max() to avoid neg indexes.
        index = Math.max((index|0), 0);

        if (!task) {
            self = this;

            this._restripeTask = {
                timer: setTimeout(function () {
                    // Check for self existence before continuing
                    if (!self || self.get('destroy') || !self.tbodyNode || !self.tbodyNode.inDoc()) {
                        self._restripeTask = null;
                        return;
                    }

                    var odd  = [self.CLASS_ODD, self.CLASS_EVEN],
                        even = [self.CLASS_EVEN, self.CLASS_ODD],
                        index = self._restripeTask.index;

                    self.tbodyNode.get('childNodes')
                        .slice(index)
                        .each(function (row, i) { // TODO: each vs batch
                            row.replaceClass.apply(row, (index + i) % 2 ? even : odd);
                        });

                    self._restripeTask = null;
                }, 0),

                index: index
            };
        } else {
            task.index = Math.min(task.index, index);
        }

    },

    /**
    Handles replacement of the modelList.

    Rerenders the `<tbody>` contents.

    @method _afterModelListChange
    @param {EventFacade} e The `modelListChange` event
    @protected
    @since 3.6.0
    **/
    _afterModelListChange: function () {
        var handles = this._eventHandles;

        if (handles.dataChange) {
            handles.dataChange.detach();
            delete handles.dataChange;
            this.bindUI();
        }

        if (this.tbodyNode) {
            this.render();
        }
    },

    /**
    Iterates the `modelList`, and calls any `nodeFormatter`s found in the
    `columns` param on the appropriate cell Nodes in the `tbody`.

    @method _applyNodeFormatters
    @param {Node} tbody The `<tbody>` Node whose columns to update
    @param {Object[]} displayCols The column configurations
    @protected
    @since 3.5.0
    **/
    _applyNodeFormatters: function (tbody, displayCols) {
        var host = this.host || this,
            data = this.get('modelList'),
            formatters = [],
            linerQuery = '.' + this.getClassName('liner'),
            rows, i, len;

        // Only iterate the ModelList again if there are nodeFormatters
        for (i = 0, len = displayCols.length; i < len; ++i) {
            if (displayCols[i].nodeFormatter) {
                formatters.push(i);
            }
        }

        if (data && formatters.length) {
            rows = tbody.get('childNodes');

            data.each(function (record, index) {
                var formatterData = {
                        data      : record.toJSON(),
                        record    : record,
                        rowIndex  : index
                    },
                    row = rows.item(index),
                    i, len, col, key, cells, cell, keep;


                if (row) {
                    cells = row.get('childNodes');
                    for (i = 0, len = formatters.length; i < len; ++i) {
                        cell = cells.item(formatters[i]);

                        if (cell) {
                            col = formatterData.column = displayCols[formatters[i]];
                            key = col.key || col.id;

                            formatterData.value = record.get(key);
                            formatterData.td    = cell;
                            formatterData.cell  = cell.one(linerQuery) || cell;

                            keep = col.nodeFormatter.call(host,formatterData);

                            if (keep === false) {
                                // Remove from the Node cache to reduce
                                // memory footprint.  This also purges events,
                                // which you shouldn't be scoping to a cell
                                // anyway.  You've been warned.  Incidentally,
                                // you should always return false. Just sayin.
                                cell.destroy(true);
                            }
                        }
                    }
                }
            });
        }
    },

    /**
    Binds event subscriptions from the UI and the host (if assigned).

    @method bindUI
    @protected
    @since 3.5.0
    **/
    bindUI: function () {
        var handles     = this._eventHandles,
            modelList   = this.get('modelList'),
            changeEvent = modelList.model.NAME + ':change';

        if (!handles.columnsChange) {
            handles.columnsChange = this.after('columnsChange',
                bind('_afterColumnsChange', this));
        }

        if (modelList && !handles.dataChange) {
            handles.dataChange = modelList.after(
                ['add', 'remove', 'reset', changeEvent],
                bind('_afterDataChange', this));
        }
    },

    /**
    Iterates the `modelList` and applies each Model to the `_rowTemplate`,
    allowing any column `formatter` or `emptyCellValue` to override cell
    content for the appropriate column.  The aggregated HTML string is
    returned.

    @method _createDataHTML
    @param {Object[]} displayCols The column configurations to customize the
                generated cell content or class names
    @return {String} The markup for all Models in the `modelList`, each applied
                to the `_rowTemplate`
    @protected
    @since 3.5.0
    **/
    _createDataHTML: function (displayCols) {
        var data = this.get('modelList'),
            html = '';

        if (data) {
            data.each(function (model, index) {
                html += this._createRowHTML(model, index, displayCols);
            }, this);
        }

        return html;
    },

    /**
    Applies the data of a given Model, modified by any column formatters and
    supplemented by other template values to the instance's `_rowTemplate` (see
    `_createRowTemplate`).  The generated string is then returned.

    The data from Model's attributes is fetched by `toJSON` and this data
    object is appended with other properties to supply values to {placeholders}
    in the template.  For a template generated from a Model with 'foo' and 'bar'
    attributes, the data object would end up with the following properties
    before being used to populate the `_rowTemplate`:

      * `clientID` - From Model, used the assign the `<tr>`'s 'id' attribute.
      * `foo` - The value to populate the 'foo' column cell content.  This
        value will be the value stored in the Model's `foo` attribute, or the
        result of the column's `formatter` if assigned.  If the value is '',
        `null`, or `undefined`, and the column's `emptyCellValue` is assigned,
        that value will be used.
      * `bar` - Same for the 'bar' column cell content.
      * `foo-className` - String of CSS classes to apply to the `<td>`.
      * `bar-className` - Same.
      * `rowClass`      - String of CSS classes to apply to the `<tr>`. This
        will be the odd/even class per the specified index plus any additional
        classes assigned by column formatters (via `o.rowClass`).

    Because this object is available to formatters, any additional properties
    can be added to fill in custom {placeholders} in the `_rowTemplate`.

    @method _createRowHTML
    @param {Model} model The Model instance to apply to the row template
    @param {Number} index The index the row will be appearing
    @param {Object[]} displayCols The column configurations
    @return {String} The markup for the provided Model, less any `nodeFormatter`s
    @protected
    @since 3.5.0
    **/
    _createRowHTML: function (model, index, displayCols) {
        var data     = model.toJSON(),
            clientId = model.get('clientId'),
            values   = {
                rowId   : this._getRowId(clientId),
                clientId: clientId,
                rowClass: (index % 2) ? this.CLASS_ODD : this.CLASS_EVEN
            },
            host = this.host || this,
            i, len, col, token, value, formatterData;

        for (i = 0, len = displayCols.length; i < len; ++i) {
            col   = displayCols[i];
            value = data[col.key];
            token = col._id || col.key;

            values[token + '-className'] = '';

            if (col._formatterFn) {
                formatterData = {
                    value    : value,
                    data     : data,
                    column   : col,
                    record   : model,
                    className: '',
                    rowClass : '',
                    rowIndex : index
                };

                // Formatters can either return a value
                value = col._formatterFn.call(host, formatterData);

                // or update the value property of the data obj passed
                if (value === undefined) {
                    value = formatterData.value;
                }

                values[token + '-className'] = formatterData.className;
                values.rowClass += ' ' + formatterData.rowClass;
            }

            // if the token missing OR is the value a legit value
            if (!values.hasOwnProperty(token) || data.hasOwnProperty(col.key)) {
                if (value === undefined || value === null || value === '') {
                    value = col.emptyCellValue || '';
                }

                values[token] = col.allowHTML ? value : htmlEscape(value);
            }
        }

        // replace consecutive whitespace with a single space
        values.rowClass = values.rowClass.replace(/\s+/g, ' ');

        return fromTemplate(this._rowTemplate, values);
    },

    /**
     Locates the row within the tbodyNode and returns the found index, or Null
     if it is not found in the tbodyNode
     @param {Node} row
     @return {Number} Index of row in tbodyNode
     */
    _getRowIndex: function (row) {
        var tbody = this.tbodyNode,
            index = 1;

        if (tbody && row) {

            //if row is not in the tbody, return
            if (row.ancestor('tbody') !== tbody) {
                return null;
            }

            // increment until we no longer have a previous node
            /*jshint boss: true*/
            while (row = row.previous()) { // NOTE: assignment
            /*jshint boss: false*/
                index++;
            }
        }

        return index;
    },

    /**
    Creates a custom HTML template string for use in generating the markup for
    individual table rows with {placeholder}s to capture data from the Models
    in the `modelList` attribute or from column `formatter`s.

    Assigns the `_rowTemplate` property.

    @method _createRowTemplate
    @param {Object[]} displayCols Array of column configuration objects
    @protected
    @since 3.5.0
    **/
    _createRowTemplate: function (displayCols) {
        var html         = '',
            cellTemplate = this.CELL_TEMPLATE,
            i, len, col, key, token, headers, tokenValues, formatter;

        this._setColumnsFormatterFn(displayCols);

        for (i = 0, len = displayCols.length; i < len; ++i) {
            col     = displayCols[i];
            key     = col.key;
            token   = col._id || key;
            formatter = col._formatterFn;
            // Only include headers if there are more than one
            headers = (col._headers || []).length > 1 ?
                        'headers="' + col._headers.join(' ') + '"' : '';

            tokenValues = {
                content  : '{' + token + '}',
                headers  : headers,
                className: this.getClassName('col', token) + ' ' +
                           (col.className || '') + ' ' +
                           this.getClassName('cell') +
                           ' {' + token + '-className}'
            };
            if (!formatter && col.formatter) {
                tokenValues.content = col.formatter.replace(valueRegExp, tokenValues.content);
            }

            if (col.nodeFormatter) {
                // Defer all node decoration to the formatter
                tokenValues.content = '';
            }

            html += fromTemplate(col.cellTemplate || cellTemplate, tokenValues);
        }

        this._rowTemplate = fromTemplate(this.ROW_TEMPLATE, {
            content: html
        });
    },

    /**
     Parses the columns array and defines the column's _formatterFn if there
     is a formatter available on the column
     @protected
     @method _setColumnsFormatterFn
     @param {Object[]} displayCols Array of column configuration objects

     @return {Object[]} Returns modified displayCols configuration Array
     */
    _setColumnsFormatterFn: function (displayCols) {
        var Formatters = Y.DataTable.BodyView.Formatters,
            formatter,
            col,
            i,
            len;

        for (i = 0, len = displayCols.length; i < len; i++) {
            col = displayCols[i];
            formatter = col.formatter;

            if (!col._formatterFn && formatter) {
                if (Lang.isFunction(formatter)) {
                    col._formatterFn = formatter;
                } else if (formatter in Formatters) {
                    col._formatterFn = Formatters[formatter].call(this.host || this, col);
                }
            }
        }

        return displayCols;
    },

    /**
    Creates the `<tbody>` node that will store the data rows.

    @method _createTBodyNode
    @return {Node}
    @protected
    @since 3.6.0
    **/
    _createTBodyNode: function () {
        return Y.Node.create(fromTemplate(this.TBODY_TEMPLATE, {
            className: this.getClassName('data')
        }));
    },

    /**
    Destroys the instance.

    @method destructor
    @protected
    @since 3.5.0
    **/
    destructor: function () {
        (new Y.EventHandle(YObject.values(this._eventHandles))).detach();
    },

    /**
    Holds the event subscriptions needing to be detached when the instance is
    `destroy()`ed.

    @property _eventHandles
    @type {Object}
    @default undefined (initially unset)
    @protected
    @since 3.5.0
    **/
    //_eventHandles: null,

    /**
    Returns the row ID associated with a Model's clientId.

    @method _getRowId
    @param {String} clientId The Model clientId
    @return {String}
    @protected
    **/
    _getRowId: function (clientId) {
        return this._idMap[clientId] || (this._idMap[clientId] = Y.guid());
    },

    /**
    Map of Model clientIds to row ids.

    @property _idMap
    @type {Object}
    @protected
    **/
    //_idMap,

    /**
    Initializes the instance. Reads the following configuration properties in
    addition to the instance attributes:

      * `columns` - (REQUIRED) The initial column information
      * `host`    - The object to serve as source of truth for column info and
                    for generating class names

    @method initializer
    @param {Object} config Configuration data
    @protected
    @since 3.5.0
    **/
    initializer: function (config) {
        this.host = config.host;

        this._eventHandles = {
            modelListChange: this.after('modelListChange',
                bind('_afterModelListChange', this))
        };
        this._idMap = {};

        this.CLASS_ODD  = this.getClassName('odd');
        this.CLASS_EVEN = this.getClassName('even');

    }

    /**
    The HTML template used to create a full row of markup for a single Model in
    the `modelList` plus any customizations defined in the column
    configurations.

    @property _rowTemplate
    @type {String}
    @default (initially unset)
    @protected
    @since 3.5.0
    **/
    //_rowTemplate: null
},{
    /**
    Hash of formatting functions for cell contents.

    This property can be populated with a hash of formatting functions by the developer
    or a set of pre-defined functions can be loaded via the `datatable-formatters` module.

    See: [DataTable.BodyView.Formatters](./DataTable.BodyView.Formatters.html)
    @property Formatters
    @type Object
    @since 3.8.0
    @static
    **/
    Formatters: {}
});


}, '3.16.0', {"requires": ["datatable-core", "view", "classnamemanager"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-table', function (Y, NAME) {

/**
View class responsible for rendering a `<table>` from provided data.  Used as
the default `view` for `Y.DataTable.Base` and `Y.DataTable` classes.

@module datatable
@submodule datatable-table
@since 3.6.0
**/
var toArray = Y.Array,
    YLang   = Y.Lang,
    fromTemplate = YLang.sub,

    isArray    = YLang.isArray,
    isFunction = YLang.isFunction;

/**
View class responsible for rendering a `<table>` from provided data.  Used as
the default `view` for `Y.DataTable.Base` and `Y.DataTable` classes.



@class TableView
@namespace DataTable
@extends View
@since 3.6.0
**/
Y.namespace('DataTable').TableView = Y.Base.create('table', Y.View, [], {

    /**
    The HTML template used to create the caption Node if the `caption`
    attribute is set.

    @property CAPTION_TEMPLATE
    @type {String}
    @default '<caption class="{className}"></caption>'
    @since 3.6.0
    **/
    CAPTION_TEMPLATE: '<caption class="{className}"></caption>',

    /**
    The HTML template used to create the table Node.

    @property TABLE_TEMPLATE
    @type {String}
    @default '<table cellspacing="0" class="{className}"></table>'
    @since 3.6.0
    **/
    TABLE_TEMPLATE  : '<table cellspacing="0" class="{className}"></table>',

    /**
    The object or instance of the class assigned to `bodyView` that is
    responsible for rendering and managing the table's `<tbody>`(s) and its
    content.

    @property body
    @type {Object}
    @default undefined (initially unset)
    @since 3.5.0
    **/
    //body: null,

    /**
    The object or instance of the class assigned to `footerView` that is
    responsible for rendering and managing the table's `<tfoot>` and its
    content.

    @property foot
    @type {Object}
    @default undefined (initially unset)
    @since 3.5.0
    **/
    //foot: null,

    /**
    The object or instance of the class assigned to `headerView` that is
    responsible for rendering and managing the table's `<thead>` and its
    content.

    @property head
    @type {Object}
    @default undefined (initially unset)
    @since 3.5.0
    **/
    //head: null,

    //-----------------------------------------------------------------------//
    // Public methods
    //-----------------------------------------------------------------------//

    /**
    Returns the `<td>` Node from the given row and column index.  Alternately,
    the `seed` can be a Node.  If so, the nearest ancestor cell is returned.
    If the `seed` is a cell, it is returned.  If there is no cell at the given
    coordinates, `null` is returned.

    Optionally, include an offset array or string to return a cell near the
    cell identified by the `seed`.  The offset can be an array containing the
    number of rows to shift followed by the number of columns to shift, or one
    of "above", "below", "next", or "previous".

    <pre><code>// Previous cell in the previous row
    var cell = table.getCell(e.target, [-1, -1]);

    // Next cell
    var cell = table.getCell(e.target, 'next');
    var cell = table.getCell(e.taregt, [0, 1];</pre></code>

    This is actually just a pass through to the `bodyView` instance's method
    by the same name.

    @method getCell
    @param {Number[]|Node} seed Array of row and column indexes, or a Node that
        is either the cell itself or a descendant of one.
    @param {Number[]|String} [shift] Offset by which to identify the returned
        cell Node
    @return {Node}
    @since 3.5.0
    **/
    getCell: function (/* seed, shift */) {
        return this.body && this.body.getCell &&
            this.body.getCell.apply(this.body, arguments);
    },

    /**
    Returns the generated CSS classname based on the input.  If the `host`
    attribute is configured, it will attempt to relay to its `getClassName`
    or use its static `NAME` property as a string base.

    If `host` is absent or has neither method nor `NAME`, a CSS classname
    will be generated using this class's `NAME`.

    @method getClassName
    @param {String} token* Any number of token strings to assemble the
        classname from.
    @return {String}
    @protected
    **/
    getClassName: function () {
        // TODO: add attr with setter for host?
        var host = this.host,
            NAME = (host && host.constructor.NAME) ||
                    this.constructor.NAME;

        if (host && host.getClassName) {
            return host.getClassName.apply(host, arguments);
        } else {
            return Y.ClassNameManager.getClassName
                .apply(Y.ClassNameManager,
                       [NAME].concat(toArray(arguments, 0, true)));
        }
    },

    /**
    Relays call to the `bodyView`'s `getRecord` method if it has one.

    @method getRecord
    @param {String|Node} seed Node or identifier for a row or child element
    @return {Model}
    @since 3.6.0
    **/
    getRecord: function () {
        return this.body && this.body.getRecord &&
            this.body.getRecord.apply(this.body, arguments);
    },

    /**
    Returns the `<tr>` Node from the given row index, Model, or Model's
    `clientId`.  If the rows haven't been rendered yet, or if the row can't be
    found by the input, `null` is returned.

    This is actually just a pass through to the `bodyView` instance's method
    by the same name.

    @method getRow
    @param {Number|String|Model} id Row index, Model instance, or clientId
    @return {Node}
    @since 3.5.0
    **/
    getRow: function (/* id */) {
        return this.body && this.body.getRow &&
            this.body.getRow.apply(this.body, arguments);
    },


    //-----------------------------------------------------------------------//
    // Protected and private methods
    //-----------------------------------------------------------------------//
    /**
    Updates the table's `summary` attribute.

    @method _afterSummaryChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _afterSummaryChange: function (e) {
        this._uiSetSummary(e.newVal);
    },

    /**
    Updates the table's `<caption>`.

    @method _afterCaptionChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _afterCaptionChange: function (e) {
        this._uiSetCaption(e.newVal);
    },

    /**
    Updates the table's width.

    @method _afterWidthChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _afterWidthChange: function (e) {
        this._uiSetWidth(e.newVal);
    },

    /**
    Attaches event subscriptions to relay attribute changes to the child Views.

    @method _bindUI
    @protected
    @since 3.6.0
    **/
    _bindUI: function () {
        var relay;

        if (!this._eventHandles) {
            relay = Y.bind('_relayAttrChange', this);

            this._eventHandles = this.after({
                columnsChange  : relay,
                modelListChange: relay,
                summaryChange  : Y.bind('_afterSummaryChange', this),
                captionChange  : Y.bind('_afterCaptionChange', this),
                widthChange    : Y.bind('_afterWidthChange', this)
            });
        }
    },

    /**
    Creates the `<table>`.

    @method _createTable
    @return {Node} The `<table>` node
    @protected
    @since 3.5.0
    **/
    _createTable: function () {
        return Y.Node.create(fromTemplate(this.TABLE_TEMPLATE, {
            className: this.getClassName('table')
        })).empty();
    },

    /**
    Calls `render()` on the `bodyView` class instance.

    @method _defRenderBodyFn
    @param {EventFacade} e The renderBody event
    @protected
    @since 3.5.0
    **/
    _defRenderBodyFn: function (e) {
        e.view.render();
    },

    /**
    Calls `render()` on the `footerView` class instance.

    @method _defRenderFooterFn
    @param {EventFacade} e The renderFooter event
    @protected
    @since 3.5.0
    **/
    _defRenderFooterFn: function (e) {
        e.view.render();
    },

    /**
    Calls `render()` on the `headerView` class instance.

    @method _defRenderHeaderFn
    @param {EventFacade} e The renderHeader event
    @protected
    @since 3.5.0
    **/
    _defRenderHeaderFn: function (e) {
        e.view.render();
    },

    /**
    Renders the `<table>` and, if there are associated Views, the `<thead>`,
    `<tfoot>`, and `<tbody>` (empty until `syncUI`).

    Assigns the generated table nodes to the `tableNode`, `_theadNode`,
    `_tfootNode`, and `_tbodyNode` properties.  Assigns the instantiated Views
    to the `head`, `foot`, and `body` properties.


    @method _defRenderTableFn
    @param {EventFacade} e The renderTable event
    @protected
    @since 3.5.0
    **/
    _defRenderTableFn: function (e) {
        var container = this.get('container'),
            attrs = this.getAttrs();

        if (!this.tableNode) {
            this.tableNode = this._createTable();
        }

        attrs.host  = this.get('host') || this;
        attrs.table = this;
        attrs.container = this.tableNode;

        this._uiSetCaption(this.get('caption'));
        this._uiSetSummary(this.get('summary'));
        this._uiSetWidth(this.get('width'));

        if (this.head || e.headerView) {
            if (!this.head) {
                this.head = new e.headerView(Y.merge(attrs, e.headerConfig));
            }

            this.fire('renderHeader', { view: this.head });
        }

        if (this.foot || e.footerView) {
            if (!this.foot) {
                this.foot = new e.footerView(Y.merge(attrs, e.footerConfig));
            }

            this.fire('renderFooter', { view: this.foot });
        }

        attrs.columns = this.displayColumns;

        if (this.body || e.bodyView) {
            if (!this.body) {
                this.body = new e.bodyView(Y.merge(attrs, e.bodyConfig));
            }

            this.fire('renderBody', { view: this.body });
        }

        if (!container.contains(this.tableNode)) {
            container.append(this.tableNode);
        }

        this._bindUI();
    },

    /**
    Cleans up state, destroys child views, etc.

    @method destructor
    @protected
    **/
    destructor: function () {
        if (this.head && this.head.destroy) {
            this.head.destroy();
        }
        delete this.head;

        if (this.foot && this.foot.destroy) {
            this.foot.destroy();
        }
        delete this.foot;

        if (this.body && this.body.destroy) {
            this.body.destroy();
        }
        delete this.body;

        if (this._eventHandles) {
            this._eventHandles.detach();
            delete this._eventHandles;
        }

        if (this.tableNode) {
            this.tableNode.remove().destroy(true);
        }
    },

    /**
    Processes the full column array, distilling the columns down to those that
    correspond to cell data columns.

    @method _extractDisplayColumns
    @protected
    **/
    _extractDisplayColumns: function () {
        var columns = this.get('columns'),
            displayColumns = [];

        function process(cols) {
            var i, len, col;

            for (i = 0, len = cols.length; i < len; ++i) {
                col = cols[i];

                if (isArray(col.children)) {
                    process(col.children);
                } else {
                    displayColumns.push(col);
                }
            }
        }

        if (columns) {
            process(columns);
        }

        /**
        Array of the columns that correspond to those with value cells in the
        data rows. Excludes colspan header columns (configured with `children`).

        @property displayColumns
        @type {Object[]}
        @since 3.6.0
        **/
        this.displayColumns = displayColumns;
    },

    /**
    Publishes core events.

    @method _initEvents
    @protected
    @since 3.5.0
    **/
    _initEvents: function () {
        this.publish({
            // Y.bind used to allow late binding for method override support
            renderTable : { defaultFn: Y.bind('_defRenderTableFn', this) },
            renderHeader: { defaultFn: Y.bind('_defRenderHeaderFn', this) },
            renderBody  : { defaultFn: Y.bind('_defRenderBodyFn', this) },
            renderFooter: { defaultFn: Y.bind('_defRenderFooterFn', this) }
        });
    },

    /**
    Constructor logic.

    @method intializer
    @param {Object} config Configuration object passed to the constructor
    @protected
    @since 3.6.0
    **/
    initializer: function (config) {
        this.host = config.host;

        this._initEvents();

        this._extractDisplayColumns();

        this.after('columnsChange', this._extractDisplayColumns, this);
    },

    /**
    Relays attribute changes to the child Views.

    @method _relayAttrChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _relayAttrChange: function (e) {
        var attr = e.attrName,
            val  = e.newVal;

        if (this.head) {
            this.head.set(attr, val);
        }

        if (this.foot) {
            this.foot.set(attr, val);
        }

        if (this.body) {
            if (attr === 'columns') {
                val = this.displayColumns;
            }

            this.body.set(attr, val);
        }
    },

    /**
    Creates the UI in the configured `container`.

    @method render
    @chainable
    **/
    render: function () {
        if (this.get('container')) {
            this.fire('renderTable', {
                headerView  : this.get('headerView'),
                headerConfig: this.get('headerConfig'),

                bodyView    : this.get('bodyView'),
                bodyConfig  : this.get('bodyConfig'),

                footerView  : this.get('footerView'),
                footerConfig: this.get('footerConfig')
            });
        }

        return this;
    },

    /**
    Creates, removes, or updates the table's `<caption>` element per the input
    value.  Empty values result in the caption being removed.

    @method _uiSetCaption
    @param {String} htmlContent The content to populate the table caption
    @protected
    @since 3.5.0
    **/
    _uiSetCaption: function (htmlContent) {
        var table   = this.tableNode,
            caption = this.captionNode;

        if (htmlContent) {
            if (!caption) {
                this.captionNode = caption = Y.Node.create(
                    fromTemplate(this.CAPTION_TEMPLATE, {
                        className: this.getClassName('caption')
                    }));

                table.prepend(this.captionNode);
            }

            caption.setHTML(htmlContent);

        } else if (caption) {
            caption.remove(true);

            delete this.captionNode;
        }
    },

    /**
    Updates the table's `summary` attribute with the input value.

    @method _uiSetSummary
    @protected
    @since 3.5.0
    **/
    _uiSetSummary: function (summary) {
        if (summary) {
            this.tableNode.setAttribute('summary', summary);
        } else {
            this.tableNode.removeAttribute('summary');
        }
    },

    /**
    Sets the `boundingBox` and table width per the input value.

    @method _uiSetWidth
    @param {Number|String} width The width to make the table
    @protected
    @since 3.5.0
    **/
    _uiSetWidth: function (width) {
        var table = this.tableNode;

        // Table width needs to account for borders
        table.setStyle('width', !width ? '' :
            (this.get('container').get('offsetWidth') -
             (parseInt(table.getComputedStyle('borderLeftWidth'), 10)||0) -
             (parseInt(table.getComputedStyle('borderLeftWidth'), 10)||0)) +
             'px');

        table.setStyle('width', width);
    },

    /**
    Ensures that the input is a View class or at least has a `render` method.

    @method _validateView
    @param {View|Function} val The View class
    @return {Boolean}
    @protected
    **/
    _validateView: function (val) {
        return isFunction(val) && val.prototype.render;
    }
}, {
    ATTRS: {
        /**
        Content for the `<table summary="ATTRIBUTE VALUE HERE">`.  Values
        assigned to this attribute will be HTML escaped for security.

        @attribute summary
        @type {String}
        @default '' (empty string)
        @since 3.5.0
        **/
        //summary: {},

        /**
        HTML content of an optional `<caption>` element to appear above the
        table.  Leave this config unset or set to a falsy value to remove the
        caption.

        @attribute caption
        @type HTML
        @default undefined (initially unset)
        @since 3.6.0
        **/
        //caption: {},

        /**
        Columns to include in the rendered table.

        This attribute takes an array of objects. Each object is considered a
        data column or header cell to be rendered.  How the objects are
        translated into markup is delegated to the `headerView`, `bodyView`,
        and `footerView`.

        The raw value is passed to the `headerView` and `footerView`.  The
        `bodyView` receives the instance's `displayColumns` array, which is
        parsed from the columns array.  If there are no nested columns (columns
        configured with a `children` array), the `displayColumns` is the same
        as the raw value.

        @attribute columns
        @type {Object[]}
        @since 3.6.0
        **/
        columns: {
            validator: isArray
        },

        /**
        Width of the table including borders.  This value requires units, so
        `200` is invalid, but `'200px'` is valid.  Setting the empty string
        (the default) will allow the browser to set the table width.

        @attribute width
        @type {String}
        @default ''
        @since 3.6.0
        **/
        width: {
            value: '',
            validator: YLang.isString
        },

        /**
        An instance of this class is used to render the contents of the
        `<thead>`&mdash;the column headers for the table.

        The instance of this View will be assigned to the instance's `head`
        property.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        @attribute headerView
        @type {Function|Object}
        @default Y.DataTable.HeaderView
        @since 3.6.0
        **/
        headerView: {
            value: Y.DataTable.HeaderView,
            validator: '_validateView'
        },

        /**
        Configuration overrides used when instantiating the `headerView`
        instance.

        @attribute headerConfig
        @type {Object}
        @since 3.6.0
        **/
        //headerConfig: {},

        /**
        An instance of this class is used to render the contents of the
        `<tfoot>` (if appropriate).

        The instance of this View will be assigned to the instance's `foot`
        property.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        @attribute footerView
        @type {Function|Object}
        @since 3.6.0
        **/
        footerView: {
            validator: '_validateView'
        },

        /**
        Configuration overrides used when instantiating the `footerView`
        instance.

        @attribute footerConfig
        @type {Object}
        @since 3.6.0
        **/
        //footerConfig: {},

        /**
        An instance of this class is used to render the contents of the table's
        `<tbody>`&mdash;the data cells in the table.

        The instance of this View will be assigned to the instance's `body`
        property.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        @attribute bodyView
        @type {Function|Object}
        @default Y.DataTable.BodyView
        @since 3.6.0
        **/
        bodyView: {
            value: Y.DataTable.BodyView,
            validator: '_validateView'
        }

        /**
        Configuration overrides used when instantiating the `bodyView`
        instance.

        @attribute bodyConfig
        @type {Object}
        @since 3.6.0
        **/
        //bodyConfig: {}
    }
});




}, '3.16.0', {"requires": ["datatable-core", "datatable-head", "datatable-body", "view", "classnamemanager"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-base', function (Y, NAME) {

/**
A Widget for displaying tabular data.  The base implementation of DataTable
provides the ability to dynamically generate an HTML table from a set of column
configurations and row data.

Two classes are included in the `datatable-base` module: `Y.DataTable` and
`Y.DataTable.Base`.

@module datatable
@submodule datatable-base
@main datatable
@since 3.5.0
**/

// DataTable API docs included before DataTable.Base to make yuidoc work
/**
A Widget for displaying tabular data.  Before feature modules are `use()`d,
this class is functionally equivalent to DataTable.Base.  However, feature
modules can modify this class in non-destructive ways, expanding the API and
functionality.

This is the primary DataTable class.  Out of the box, it provides the ability
to dynamically generate an HTML table from a set of column configurations and
row data.  But feature module inclusion can add table sorting, pagintaion,
highlighting, selection, and more.

<pre><code>
// The functionality of this table would require additional modules be use()d,
// but the feature APIs are aggregated onto Y.DataTable.
// (Snippet is for illustration. Not all features are available today.)
var table = new Y.DataTable({
    columns: [
        { type: 'checkbox', defaultChecked: true },
        { key: 'firstName', sortable: true, resizable: true },
        { key: 'lastName', sortable: true },
        { key: 'role', formatter: toRoleName }
    ],
    data: {
        source: 'http://myserver.com/service/json',
        type: 'json',
        schema: {
            resultListLocator: 'results.users',
            fields: [
                'username',
                'firstName',
                'lastName',
                { key: 'role', type: 'number' }
            ]
        }
    },
    recordType: UserModel,
    pagedData: {
        location: 'footer',
        pageSizes: [20, 50, 'all'],
        rowsPerPage: 20,
        pageLinks: 5
    },
    editable: true
});
</code></pre>

### Column Configuration

The column configurations are set in the form of an array of objects, where
each object corresponds to a column.  For columns populated directly from the
row data, a 'key' property is required to bind the column to that property or
attribute in the row data.

Not all columns need to relate to row data, nor do all properties or attributes
of the row data need to have a corresponding column.  However, only those
columns included in the `columns` configuration attribute will be rendered.

Other column configuration properties are supported by the configured
`view`, class as well as any features added by plugins or class extensions.
See the description of DataTable.TableView and its subviews
DataTable.HeaderView, DataTable.BodyView, and DataTable.FooterView (and other
DataTable feature classes) to see what column properties they support.

Some examples of column configurations would be:

<pre><code>
// Basic
var columns = [{ key: 'firstName' }, { key: 'lastName' }, { key: 'age' }];

// For columns without any additional configuration, strings can be used
var columns = ['firstName', 'lastName', 'age'];

// Multi-row column headers (see DataTable.HeaderView for details)
var columns = [
    {
        label: 'Name',
        children: [
            { key: 'firstName' },
            { key: 'lastName' }
        ]
    },
    'age' // mixing and matching objects and strings is ok
];

// Including columns that are not related 1:1 to row data fields/attributes
// (See DataTable.BodyView for details)
var columns = [
    {
        label: 'Name', // Needed for the column header
        formatter: function (o) {
            // Fill the column cells with data from firstName and lastName
            if (o.data.age > 55) {
                o.className += ' senior';
            }
            return o.data.lastName + ', ' + o.data.firstName;
        }
    },
    'age'
];

// Columns that include feature configurations (for illustration; not all
// features are available today).
var columns = [
    { type: 'checkbox', defaultChecked: true },
    { key: 'firstName', sortable: true, resizable: true, min-width: '300px' },
    { key: 'lastName', sortable: true, resizable: true, min-width: '300px' },
    { key: 'age', emptyCellValue: '<em>unknown</em>' }
];
</code></pre>

### Row Data Configuration

The `data` configuration attribute is responsible for housing the data objects
that will be rendered as rows.  You can provide this information in two ways by default:

1. An array of simple objects with key:value pairs
2. A ModelList of Base-based class instances (presumably Model subclass
   instances)

If an array of objects is passed, it will be translated into a ModelList filled
with instances of the class provided to the `recordType` attribute.  This
attribute can also create a custom Model subclass from an array of field names
or an object of attribute configurations.  If no `recordType` is provided, one
will be created for you from available information (see `_initRecordType`).
Providing either your own ModelList instance for `data`, or at least Model
class for `recordType`, is the best way to control client-server
synchronization when modifying data on the client side.

The ModelList instance that manages the table's data is available in the `data`
property on the DataTable instance.


### Rendering

Table rendering is a collaborative process between the DataTable and its
configured `view`. The DataTable creates an instance of the configured `view`
(DataTable.TableView by default), and calls its `render()` method.
DataTable.TableView, for instance, then creates the `<table>` and `<caption>`,
then delegates the rendering of the specific sections of the table to subviews,
which can be configured as `headerView`, `bodyView`, and `footerView`.
DataTable.TableView defaults the `headerView` to DataTable.HeaderView and the
`bodyView` to DataTable.BodyView, but leaves the `footerView` unassigned.
Setting any subview to `null` will result in that table section not being
rendered.

@class DataTable
@extends DataTable.Base
@since 3.5.0
**/

// DataTable API docs included before DataTable.Base to make yuidoc work
/**
The baseline implementation of a DataTable.  This class should be used
primarily as a superclass for a custom DataTable with a specific set of
features.  Because features can be composed onto `Y.DataTable`, custom
subclasses of DataTable.Base will remain unmodified when new feature modules
are loaded.

Example usage might look like this:

<pre><code>
// Custom subclass with only sorting and mutability added.  If other datatable
// feature modules are loaded, this class will not be affected.
var MyTableClass = Y.Base.create('table', Y.DataTable.Base,
                       [ Y.DataTable.Sortable, Y.DataTable.Mutable ]);

var table = new MyTableClass({
    columns: ['firstName', 'lastName', 'age'],
    data: [
        { firstName: 'Frank', lastName: 'Zappa', age: 71 },
        { firstName: 'Frank', lastName: 'Lloyd Wright', age: 144 },
        { firstName: 'Albert', lastName: 'Einstein', age: 132 },
        ...
    ]
});

table.render('#over-there');

// DataTable.Base can be instantiated if a featureless table is needed.
var table = new Y.DataTable.Base({
    columns: ['firstName', 'lastName', 'age'],
    data: [
        { firstName: 'Frank', lastName: 'Zappa', age: 71 },
        { firstName: 'Frank', lastName: 'Lloyd Wright', age: 144 },
        { firstName: 'Albert', lastName: 'Einstein', age: 132 },
        ...
    ]
});

table.render('#in-here');
</code></pre>

DataTable.Base is built from DataTable.Core, and sets the default `view`
to `Y.DataTable.TableView`.

@class Base
@extends Widget
@uses DataTable.Core
@namespace DataTable
@since 3.5.0
**/
Y.DataTable.Base = Y.Base.create('datatable', Y.Widget, [Y.DataTable.Core], {

    /**
    Pass through to `delegate()` called from the `contentBox`.

    @method delegate
    @param type {String} the event type to delegate
    @param fn {Function} the callback function to execute.  This function
                 will be provided the event object for the delegated event.
    @param spec {String|Function} a selector that must match the target of the
                 event or a function to test target and its parents for a match
    @param context {Object} optional argument that specifies what 'this' refers to
    @param args* {any} 0..n additional arguments to pass on to the callback
                 function.  These arguments will be added after the event object.
    @return {EventHandle} the detach handle
    @since 3.5.0
    **/
    delegate: function () {
        var contentBox = this.get('contentBox');

        return contentBox.delegate.apply(contentBox, arguments);
    },

    /**
    Destroys the table `View` if it's been created.

    @method destructor
    @protected
    @since 3.6.0
    **/
    destructor: function () {
        if (this.view) {
            this.view.destroy();
        }
    },

    /**
    Returns the `<td>` Node from the given row and column index.  Alternately,
    the `seed` can be a Node.  If so, the nearest ancestor cell is returned.
    If the `seed` is a cell, it is returned.  If there is no cell at the given
    coordinates, `null` is returned.

    Optionally, include an offset array or string to return a cell near the
    cell identified by the `seed`.  The offset can be an array containing the
    number of rows to shift followed by the number of columns to shift, or one
    of "above", "below", "next", or "previous".

    <pre><code>// Previous cell in the previous row
    var cell = table.getCell(e.target, [-1, -1]);

    // Next cell
    var cell = table.getCell(e.target, 'next');
    var cell = table.getCell(e.taregt, [0, 1];</pre></code>

    This is actually just a pass through to the `view` instance's method
    by the same name.

    @method getCell
    @param {Number[]|Node} seed Array of row and column indexes, or a Node that
        is either the cell itself or a descendant of one.
    @param {Number[]|String} [shift] Offset by which to identify the returned
        cell Node
    @return {Node}
    @since 3.5.0
    **/
    getCell: function (/* seed, shift */) {
        return this.view && this.view.getCell &&
            this.view.getCell.apply(this.view, arguments);
    },

    /**
    Returns the `<tr>` Node from the given row index, Model, or Model's
    `clientId`.  If the rows haven't been rendered yet, or if the row can't be
    found by the input, `null` is returned.

    This is actually just a pass through to the `view` instance's method
    by the same name.

    @method getRow
    @param {Number|String|Model} id Row index, Model instance, or clientId
    @return {Node}
    @since 3.5.0
    **/
    getRow: function (/* id */) {
        return this.view && this.view.getRow &&
            this.view.getRow.apply(this.view, arguments);
    },

    /**
    Updates the `_displayColumns` property.

    @method _afterDisplayColumnsChange
    @param {EventFacade} e The `columnsChange` event
    @protected
    @since 3.6.0
    **/
    // FIXME: This is a kludge for back compat with features that reference
    // _displayColumns.  They should be updated to TableView plugins.
    _afterDisplayColumnsChange: function (e) {
        this._extractDisplayColumns(e.newVal || []);
    },

    /**
    Attaches subscriptions to relay core change events to the view.

    @method bindUI
    @protected
    @since 3.6.0
    **/
    bindUI: function () {
        this._eventHandles.relayCoreChanges = this.after(
            ['columnsChange',
             'dataChange',
             'summaryChange',
             'captionChange',
             'widthChange'],
            Y.bind('_relayCoreAttrChange', this));
    },

    /**
    The default behavior of the `renderView` event.  Calls `render()` on the
    `View` instance on the event.

    @method _defRenderViewFn
    @param {EventFacade} e The `renderView` event
    @protected
    **/
    _defRenderViewFn: function (e) {
        e.view.render();
    },

    /**
    Processes the full column array, distilling the columns down to those that
    correspond to cell data columns.

    @method _extractDisplayColumns
    @param {Object[]} columns The full set of table columns
    @protected
    **/
    // FIXME: this is a kludge for back compat, duplicating logic in the
    // tableView
    _extractDisplayColumns: function (columns) {
        var displayColumns = [];

        function process(cols) {
            var i, len, col;

            for (i = 0, len = cols.length; i < len; ++i) {
                col = cols[i];

                if (Y.Lang.isArray(col.children)) {
                    process(col.children);
                } else {
                    displayColumns.push(col);
                }
            }
        }

        process(columns);

        /**
        Array of the columns that correspond to those with value cells in the
        data rows. Excludes colspan header columns (configured with `children`).

        @property _displayColumns
        @type {Object[]}
        @since 3.5.0
        **/
        this._displayColumns = displayColumns;
    },

    /**
    Sets up the instance's events.

    @method initializer
    @param {Object} [config] Configuration object passed at construction
    @protected
    @since 3.6.0
    **/
    initializer: function () {
        this.publish('renderView', {
            defaultFn: Y.bind('_defRenderViewFn', this)
        });

        // Have to use get('columns'), not config.columns because the setter
        // needs to transform string columns to objects.
        this._extractDisplayColumns(this.get('columns') || []);

        // FIXME: kludge for back compat of features that reference
        // _displayColumns on the instance.  They need to be updated to
        // TableView plugins, most likely.
        this.after('columnsChange', Y.bind('_afterDisplayColumnsChange', this));
    },

    /**
    Relays attribute changes to the instance's `view`.

    @method _relayCoreAttrChange
    @param {EventFacade} e The change event
    @protected
    @since 3.6.0
    **/
    _relayCoreAttrChange: function (e) {
        var attr = (e.attrName === 'data') ? 'modelList' : e.attrName;

        this.view.set(attr, e.newVal);
    },

    /**
    Instantiates the configured `view` class that will be responsible for
    setting up the View class.

    @method @renderUI
    @protected
    @since 3.6.0
    **/
    renderUI: function () {
        var self = this,
            View = this.get('view');

        if (View) {
            this.view = new View(
                Y.merge(
                    this.getAttrs(),
                    {
                        host     : this,
                        container: this.get('contentBox'),
                        modelList: this.data
                    },
                    this.get('viewConfig')));

            // For back compat, share the view instances and primary nodes
            // on this instance.
            // TODO: Remove this?
            if (!this._eventHandles.legacyFeatureProps) {
                this._eventHandles.legacyFeatureProps = this.view.after({
                    renderHeader: function (e) {
                        self.head = e.view;
                        self._theadNode = e.view.theadNode;
                        // TODO: clean up the repetition.
                        // This is here so that subscribers to renderHeader etc
                        // have access to this._tableNode from the DT instance
                        self._tableNode = e.view.get('container');
                    },
                    renderFooter: function (e) {
                        self.foot = e.view;
                        self._tfootNode = e.view.tfootNode;
                        self._tableNode = e.view.get('container');
                    },
                    renderBody: function (e) {
                        self.body = e.view;
                        self._tbodyNode = e.view.tbodyNode;
                        self._tableNode = e.view.get('container');
                    },
                    // FIXME: guarantee that the properties are available, even
                    // if the configured (or omitted) views don't create them
                    renderTable: function () {
                        var contentBox = this.get('container');

                        self._tableNode = this.tableNode ||
                            contentBox.one('.' + this.getClassName('table') +
                                           ', table');

                        // FIXME: _captionNode isn't available until after
                        // renderTable unless in the renderX subs I look for
                        // it under the container's parentNode (to account for
                        // scroll breaking out the caption table).
                        self._captionNode = this.captionNode ||
                            contentBox.one('caption');

                        if (!self._theadNode) {
                            self._theadNode = contentBox.one(
                                '.' + this.getClassName('columns') + ', thead');
                        }

                        if (!self._tbodyNode) {
                            self._tbodyNode = contentBox.one(
                                '.' + this.getClassName('data') + ', tbody');
                        }

                        if (!self._tfootNode) {
                            self._tfootNode = contentBox.one(
                                '.' + this.getClassName('footer') + ', tfoot');
                        }
                    }
                });
            }

            // To *somewhat* preserve table.on('renderHeader', fn) in the
            // form of table.on('table:renderHeader', fn), because I couldn't
            // figure out another option.
            this.view.addTarget(this);
        }
    },

    /**
    Fires the `renderView` event, delegating UI updates to the configured View.

    @method syncUI
    @since 3.5.0
    **/
    syncUI: function () {
        if (this.view) {
            this.fire('renderView', { view: this.view });
        }
    },

    /**
    Verifies the input value is a function with a `render` method on its
    prototype.  `null` is also accepted to remove the default View.

    @method _validateView
    @protected
    @since 3.5.0
    **/
    _validateView: function (val) {
        // TODO support View instances?
        return val === null || (Y.Lang.isFunction(val) && val.prototype.render);
    }
}, {
    ATTRS: {
        /**
        The View class used to render the `<table>` into the Widget's
        `contentBox`.  This View can handle the entire table rendering itself
        or delegate to other Views.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        When the DataTable is rendered, an instance of this View will be
        created and its `render()` method called.  The View instance will be
        assigned to the DataTable instance's `view` property.

        @attribute view
        @type {Function}
        @default Y.DataTable.TableView
        @since 3.6.0
        **/
        view: {
            value: Y.DataTable.TableView,
            validator: '_validateView'
        },

        /**
        Configuration object passed to the class constructor in `view`
        during render.

        @attribute viewConfig
        @type {Object}
        @default undefined (initially unset)
        @protected
        @since 3.6.0
        **/
        viewConfig: {}

        /**
        If the View class assigned to the DataTable's `view` attribute supports
        it, this class will be used for rendering the contents of the
        `<thead>`&mdash;the column headers for the table.

        Similar to `view`, the instance of this View will be assigned to the
        DataTable instance's `head` property.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        @attribute headerView
        @type {Function|Object}
        @default Y.DataTable.HeaderView
        @since 3.5.0
        **/
        /*
        headerView: {
            value: Y.DataTable.HeaderView,
            validator: '_validateView'
        },
        */

        /**
        Configuration object passed to the class constructor in `headerView`
        during render.

        @attribute headerConfig
        @type {Object}
        @default undefined (initially unset)
        @protected
        @since 3.6.0
        **/
        //headConfig: {},

        /**
        If the View class assigned to the DataTable's `view` attribute supports
        it, this class will be used for rendering the contents of the `<tfoot>`.

        Similar to `view`, the instance of this View will be assigned to the
        DataTable instance's `foot` property.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        @attribute footerView
        @type {Function|Object}
        @since 3.5.0
        **/
        /*
        footerView: {
            validator: '_validateView'
        },
        */

        /**
        Configuration object passed to the class constructor in `footerView`
        during render.

        @attribute footerConfig
        @type {Object}
        @default undefined (initially unset)
        @protected
        @since 3.6.0
        **/
        //footerConfig: {},

        /**
        If the View class assigned to the DataTable's `view` attribute supports
        it, this class will be used for rendering the contents of the `<tbody>`
        including all data rows.

        Similar to `view`, the instance of this View will be assigned to the
        DataTable instance's `body` property.

        It is not strictly necessary that the class function assigned here be
        a View subclass.  It must however have a `render()` method.

        @attribute bodyView
        @type {Function}
        @default Y.DataTable.BodyView
        @since 3.5.0
        **/
        /*
        bodyView: {
            value: Y.DataTable.BodyView,
            validator: '_validateView'
        },
        */

        /**
        Configuration object passed to the class constructor in `bodyView`
        during render.

        @attribute bodyConfig
        @type {Object}
        @default undefined (initially unset)
        @protected
        @since 3.6.0
        **/
        //bodyConfig: {}
    }
});

// The DataTable API docs are above DataTable.Base docs.
Y.DataTable = Y.mix(
    Y.Base.create('datatable', Y.DataTable.Base, []), // Create the class
    Y.DataTable); // Migrate static and namespaced classes


}, '3.16.0', {
    "requires": [
        "datatable-core",
        "datatable-table",
        "datatable-head",
        "datatable-body",
        "base-build",
        "widget"
    ],
    "skinnable": true
});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("lang/datatable-sort_en",function(e){e.Intl.add("datatable-sort","en",{asc:"Ascending",desc:"Descending",sortBy:"Sort by {column}",reverseSortBy:"Reverse sort by {column}"})},"3.16.0");
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-sort', function (Y, NAME) {

/**
Adds support for sorting the table data by API methods `table.sort(...)` or
`table.toggleSort(...)` or by clicking on column headers in the rendered UI.

@module datatable
@submodule datatable-sort
@since 3.5.0
**/
var YLang     = Y.Lang,
    isBoolean = YLang.isBoolean,
    isString  = YLang.isString,
    isArray   = YLang.isArray,
    isObject  = YLang.isObject,

    toArray = Y.Array,
    sub     = YLang.sub,

    dirMap = {
        asc : 1,
        desc: -1,
        "1" : 1,
        "-1": -1
    };


/**
_API docs for this extension are included in the DataTable class._

This DataTable class extension adds support for sorting the table data by API
methods `table.sort(...)` or `table.toggleSort(...)` or by clicking on column
headers in the rendered UI.

Sorting by the API is enabled automatically when this module is `use()`d.  To
enable UI triggered sorting, set the DataTable's `sortable` attribute to
`true`.

<pre><code>
var table = new Y.DataTable({
    columns: [ 'id', 'username', 'name', 'birthdate' ],
    data: [ ... ],
    sortable: true
});

table.render('#table');
</code></pre>

Setting `sortable` to `true` will enable UI sorting for all columns.  To enable
UI sorting for certain columns only, set `sortable` to an array of column keys,
or just add `sortable: true` to the respective column configuration objects.
This uses the default setting of `sortable: auto` for the DataTable instance.

<pre><code>
var table = new Y.DataTable({
    columns: [
        'id',
        { key: 'username',  sortable: true },
        { key: 'name',      sortable: true },
        { key: 'birthdate', sortable: true }
    ],
    data: [ ... ]
    // sortable: 'auto' is the default
});

// OR
var table = new Y.DataTable({
    columns: [ 'id', 'username', 'name', 'birthdate' ],
    data: [ ... ],
    sortable: [ 'username', 'name', 'birthdate' ]
});
</code></pre>

To disable UI sorting for all columns, set `sortable` to `false`.  This still
permits sorting via the API methods.

As new records are inserted into the table's `data` ModelList, they will be inserted at the correct index to preserve the sort order.

The current sort order is stored in the `sortBy` attribute.  Assigning this value at instantiation will automatically sort your data.

Sorting is done by a simple value comparison using &lt; and &gt; on the field
value.  If you need custom sorting, add a sort function in the column's
`sortFn` property.  Columns whose content is generated by formatters, but don't
relate to a single `key`, require a `sortFn` to be sortable.

<pre><code>
function nameSort(a, b, desc) {
    var aa = a.get('lastName') + a.get('firstName'),
        bb = a.get('lastName') + b.get('firstName'),
        order = (aa > bb) ? 1 : -(aa < bb);

    return desc ? -order : order;
}

var table = new Y.DataTable({
    columns: [ 'id', 'username', { key: name, sortFn: nameSort }, 'birthdate' ],
    data: [ ... ],
    sortable: [ 'username', 'name', 'birthdate' ]
});
</code></pre>

See the user guide for more details.

@class DataTable.Sortable
@for DataTable
@since 3.5.0
**/
function Sortable() {}

Sortable.ATTRS = {
    // Which columns in the UI should suggest and respond to sorting interaction
    // pass an empty array if no UI columns should show sortable, but you want the
    // table.sort(...) API
    /**
    Controls which column headers can trigger sorting by user clicks.

    Acceptable values are:

     * "auto" - (default) looks for `sortable: true` in the column configurations
     * `true` - all columns are enabled
     * `false - no UI sortable is enabled
     * {String[]} - array of key names to give sortable headers

    @attribute sortable
    @type {String|String[]|Boolean}
    @default "auto"
    @since 3.5.0
    **/
    sortable: {
        value: 'auto',
        validator: '_validateSortable'
    },

    /**
    The current sort configuration to maintain in the data.

    Accepts column `key` strings or objects with a single property, the column
    `key`, with a value of 1, -1, "asc", or "desc".  E.g. `{ username: 'asc'
    }`.  String values are assumed to be ascending.

    Example values would be:

     * `"username"` - sort by the data's `username` field or the `key`
       associated to a column with that `name`.
     * `{ username: "desc" }` - sort by `username` in descending order.
       Alternately, use values "asc", 1 (same as "asc"), or -1 (same as "desc").
     * `["lastName", "firstName"]` - ascending sort by `lastName`, but for
       records with the same `lastName`, ascending subsort by `firstName`.
       Array can have as many items as you want.
     * `[{ lastName: -1 }, "firstName"]` - descending sort by `lastName`,
       ascending subsort by `firstName`. Mixed types are ok.

    @attribute sortBy
    @type {String|String[]|Object|Object[]}
    @since 3.5.0
    **/
    sortBy: {
        validator: '_validateSortBy',
        getter: '_getSortBy'
    },

    /**
    Strings containing language for sorting tooltips.

    @attribute strings
    @type {Object}
    @default (strings for current lang configured in the YUI instance config)
    @since 3.5.0
    **/
    strings: {}
};

Y.mix(Sortable.prototype, {

    /**
    Sort the data in the `data` ModelList and refresh the table with the new
    order.

    Acceptable values for `fields` are `key` strings or objects with a single
    property, the column `key`, with a value of 1, -1, "asc", or "desc".  E.g.
    `{ username: 'asc' }`.  String values are assumed to be ascending.

    Example values would be:

     * `"username"` - sort by the data's `username` field or the `key`
       associated to a column with that `name`.
     * `{ username: "desc" }` - sort by `username` in descending order.
       Alternately, use values "asc", 1 (same as "asc"), or -1 (same as "desc").
     * `["lastName", "firstName"]` - ascending sort by `lastName`, but for
       records with the same `lastName`, ascending subsort by `firstName`.
       Array can have as many items as you want.
     * `[{ lastName: -1 }, "firstName"]` - descending sort by `lastName`,
       ascending subsort by `firstName`. Mixed types are ok.

    @method sort
    @param {String|String[]|Object|Object[]} fields The field(s) to sort by
    @param {Object} [payload] Extra `sort` event payload you want to send along
    @return {DataTable}
    @chainable
    @since 3.5.0
    **/
    sort: function (fields, payload) {
        /**
        Notifies of an impending sort, either from clicking on a column
        header, or from a call to the `sort` or `toggleSort` method.

        The requested sort is available in the `sortBy` property of the event.

        The default behavior of this event sets the table's `sortBy` attribute.

        @event sort
        @param {String|String[]|Object|Object[]} sortBy The requested sort
        @preventable _defSortFn
        **/
        return this.fire('sort', Y.merge((payload || {}), {
            sortBy: fields || this.get('sortBy')
        }));
    },

    /**
    Template for the node that will wrap the header content for sortable
    columns.

    @property SORTABLE_HEADER_TEMPLATE
    @type {String}
    @value '<div class="{className}" tabindex="0"><span class="{indicatorClass}"></span></div>'
    @since 3.5.0
    **/
    SORTABLE_HEADER_TEMPLATE: '<div class="{className}" tabindex="0" unselectable="on"><span class="{indicatorClass}"></span></div>',

    /**
    Reverse the current sort direction of one or more fields currently being
    sorted by.

    Pass the `key` of the column or columns you want the sort order reversed
    for.

    @method toggleSort
    @param {String|String[]} fields The field(s) to reverse sort order for
    @param {Object} [payload] Extra `sort` event payload you want to send along
    @return {DataTable}
    @chainable
    @since 3.5.0
    **/
    toggleSort: function (columns, payload) {
        var current = this._sortBy,
            sortBy = [],
            i, len, j, col, index;

        // To avoid updating column configs or sortBy directly
        for (i = 0, len = current.length; i < len; ++i) {
            col = {};
            col[current[i]._id] = current[i].sortDir;
            sortBy.push(col);
        }

        if (columns) {
            columns = toArray(columns);

            for (i = 0, len = columns.length; i < len; ++i) {
                col = columns[i];
                index = -1;

                for (j = sortBy.length - 1; i >= 0; --i) {
                    if (sortBy[j][col]) {
                        sortBy[j][col] *= -1;
                        break;
                    }
                }
            }
        } else {
            for (i = 0, len = sortBy.length; i < len; ++i) {
                for (col in sortBy[i]) {
                    if (sortBy[i].hasOwnProperty(col)) {
                        sortBy[i][col] *= -1;
                        break;
                    }
                }
            }
        }

        return this.fire('sort', Y.merge((payload || {}), {
            sortBy: sortBy
        }));
    },

    //--------------------------------------------------------------------------
    // Protected properties and methods
    //--------------------------------------------------------------------------
    /**
    Sorts the `data` ModelList based on the new `sortBy` configuration.

    @method _afterSortByChange
    @param {EventFacade} e The `sortByChange` event
    @protected
    @since 3.5.0
    **/
    _afterSortByChange: function () {
        // Can't use a setter because it's a chicken and egg problem. The
        // columns need to be set up to translate, but columns are initialized
        // from Core's initializer.  So construction-time assignment would
        // fail.
        this._setSortBy();

        // Don't sort unless sortBy has been set
        if (this._sortBy.length) {
            if (!this.data.comparator) {
                 this.data.comparator = this._sortComparator;
            }

            this.data.sort();
        }
    },

    /**
    Applies the sorting logic to the new ModelList if the `newVal` is a new
    ModelList.

    @method _afterSortDataChange
    @param {EventFacade} e the `dataChange` event
    @protected
    @since 3.5.0
    **/
    _afterSortDataChange: function (e) {
        // object values always trigger a change event, but we only want to
        // call _initSortFn if the value passed to the `data` attribute was a
        // new ModelList, not a set of new data as an array, or even the same
        // ModelList.
        if (e.prevVal !== e.newVal || e.newVal.hasOwnProperty('_compare')) {
            this._initSortFn();
        }
    },

    /**
    Checks if any of the fields in the modified record are fields that are
    currently being sorted by, and if so, resorts the `data` ModelList.

    @method _afterSortRecordChange
    @param {EventFacade} e The Model's `change` event
    @protected
    @since 3.5.0
    **/
    _afterSortRecordChange: function (e) {
        var i, len;

        for (i = 0, len = this._sortBy.length; i < len; ++i) {
            if (e.changed[this._sortBy[i].key]) {
                this.data.sort();
                break;
            }
        }
    },

    /**
    Subscribes to state changes that warrant updating the UI, and adds the
    click handler for triggering the sort operation from the UI.

    @method _bindSortUI
    @protected
    @since 3.5.0
    **/
    _bindSortUI: function () {
        var handles = this._eventHandles;

        if (!handles.sortAttrs) {
            handles.sortAttrs = this.after(
                ['sortableChange', 'sortByChange', 'columnsChange'],
                Y.bind('_uiSetSortable', this));
        }

        if (!handles.sortUITrigger && this._theadNode) {
            handles.sortUITrigger = this.delegate(['click','keydown'],
                Y.rbind('_onUITriggerSort', this),
                '.' + this.getClassName('sortable', 'column'));
        }
    },

    /**
    Sets the `sortBy` attribute from the `sort` event's `e.sortBy` value.

    @method _defSortFn
    @param {EventFacade} e The `sort` event
    @protected
    @since 3.5.0
    **/
    _defSortFn: function (e) {
        this.set.apply(this, ['sortBy', e.sortBy].concat(e.details));
    },

    /**
    Getter for the `sortBy` attribute.

    Supports the special subattribute "sortBy.state" to get a normalized JSON
    version of the current sort state.  Otherwise, returns the last assigned
    value.

    For example:

    <pre><code>var table = new Y.DataTable({
        columns: [ ... ],
        data: [ ... ],
        sortBy: 'username'
    });

    table.get('sortBy'); // 'username'
    table.get('sortBy.state'); // { key: 'username', dir: 1 }

    table.sort(['lastName', { firstName: "desc" }]);
    table.get('sortBy'); // ['lastName', { firstName: "desc" }]
    table.get('sortBy.state'); // [{ key: "lastName", dir: 1 }, { key: "firstName", dir: -1 }]
    </code></pre>

    @method _getSortBy
    @param {String|String[]|Object|Object[]} val The current sortBy value
    @param {String} detail String passed to `get(HERE)`. to parse subattributes
    @protected
    @since 3.5.0
    **/
    _getSortBy: function (val, detail) {
        var state, i, len, col;

        // "sortBy." is 7 characters. Used to catch
        detail = detail.slice(7);

        // TODO: table.get('sortBy.asObject')? table.get('sortBy.json')?
        if (detail === 'state') {
            state = [];

            for (i = 0, len = this._sortBy.length; i < len; ++i) {
                col = this._sortBy[i];
                state.push({
                    column: col._id,
                    dir: col.sortDir
                });
            }

            // TODO: Always return an array?
            return { state: (state.length === 1) ? state[0] : state };
        } else {
            return val;
        }
    },

    /**
    Sets up the initial sort state and instance properties.  Publishes events
    and subscribes to attribute change events to maintain internal state.

    @method initializer
    @protected
    @since 3.5.0
    **/
    initializer: function () {
        var boundParseSortable = Y.bind('_parseSortable', this);

        this._parseSortable();

        this._setSortBy();

        this._initSortFn();

        this._initSortStrings();

        this.after({
            'table:renderHeader': Y.bind('_renderSortable', this),
            dataChange          : Y.bind('_afterSortDataChange', this),
            sortByChange        : Y.bind('_afterSortByChange', this),
            sortableChange      : boundParseSortable,
            columnsChange       : boundParseSortable
        });
        this.data.after(this.data.model.NAME + ":change",
            Y.bind('_afterSortRecordChange', this));

        // TODO: this event needs magic, allowing async remote sorting
        this.publish('sort', {
            defaultFn: Y.bind('_defSortFn', this)
        });
    },

    /**
    Creates a `_compare` function for the `data` ModelList to allow custom
    sorting by multiple fields.

    @method _initSortFn
    @protected
    @since 3.5.0
    **/
    _initSortFn: function () {
        var self = this;

        // TODO: This should be a ModelList extension.
        // FIXME: Modifying a component of the host seems a little smelly
        // FIXME: Declaring inline override to leverage closure vs
        // compiling a new function for each column/sortable change or
        // binding the _compare implementation to this, resulting in an
        // extra function hop during sorting. Lesser of three evils?
        this.data._compare = function (a, b) {
            var cmp = 0,
                i, len, col, dir, cs, aa, bb;

            for (i = 0, len = self._sortBy.length; !cmp && i < len; ++i) {
                col = self._sortBy[i];
                dir = col.sortDir,
                cs = col.caseSensitive;

                if (col.sortFn) {
                    cmp = col.sortFn(a, b, (dir === -1));
                } else {
                    // FIXME? Requires columns without sortFns to have key
                    aa = a.get(col.key) || '';
                    bb = b.get(col.key) || '';
                    if (!cs && typeof(aa) === "string" && typeof(bb) === "string"){// Not case sensitive
                        aa = aa.toLowerCase();
                        bb = bb.toLowerCase();
                    }
                    cmp = (aa > bb) ? dir : ((aa < bb) ? -dir : 0);
                }
            }

            return cmp;
        };

        if (this._sortBy.length) {
            this.data.comparator = this._sortComparator;

            // TODO: is this necessary? Should it be elsewhere?
            this.data.sort();
        } else {
            // Leave the _compare method in place to avoid having to set it
            // up again.  Mistake?
            delete this.data.comparator;
        }
    },

    /**
    Add the sort related strings to the `strings` map.

    @method _initSortStrings
    @protected
    @since 3.5.0
    **/
    _initSortStrings: function () {
        // Not a valueFn because other class extensions will want to add to it
        this.set('strings', Y.mix((this.get('strings') || {}),
            Y.Intl.get('datatable-sort')));
    },

    /**
    Fires the `sort` event in response to user clicks on sortable column
    headers.

    @method _onUITriggerSort
    @param {DOMEventFacade} e The `click` event
    @protected
    @since 3.5.0
    **/
    _onUITriggerSort: function (e) {
        var id = e.currentTarget.getAttribute('data-yui3-col-id'),
            column = id && this.getColumn(id),
            sortBy, i, len;

        if (e.type === 'keydown' && e.keyCode !== 32) {
            return;
        }

        // In case a headerTemplate injected a link
        // TODO: Is this overreaching?
        e.preventDefault();

        if (column) {
            if (e.shiftKey) {
                sortBy = this.get('sortBy') || [];

                for (i = 0, len = sortBy.length; i < len; ++i) {
                    if (id === sortBy[i]  || Math.abs(sortBy[i][id]) === 1) {
                        if (!isObject(sortBy[i])) {
                            sortBy[i] = {};
                        }

                        sortBy[i][id] = -(column.sortDir||0) || 1;
                        break;
                    }
                }

                if (i >= len) {
                    sortBy.push(column._id);
                }
            } else {
                sortBy = [{}];

                sortBy[0][id] = -(column.sortDir||0) || 1;
            }

            this.fire('sort', {
                originEvent: e,
                sortBy: sortBy
            });
        }
    },

    /**
    Normalizes the possible input values for the `sortable` attribute, storing
    the results in the `_sortable` property.

    @method _parseSortable
    @protected
    @since 3.5.0
    **/
    _parseSortable: function () {
        var sortable = this.get('sortable'),
            columns  = [],
            i, len, col;

        if (isArray(sortable)) {
            for (i = 0, len = sortable.length; i < len; ++i) {
                col = sortable[i];

                // isArray is called because arrays are objects, but will rely
                // on getColumn to nullify them for the subsequent if (col)
                if (!isObject(col, true) || isArray(col)) {
                    col = this.getColumn(col);
                }

                if (col) {
                    columns.push(col);
                }
            }
        } else if (sortable) {
            columns = this._displayColumns.slice();

            if (sortable === 'auto') {
                for (i = columns.length - 1; i >= 0; --i) {
                    if (!columns[i].sortable) {
                        columns.splice(i, 1);
                    }
                }
            }
        }

        this._sortable = columns;
    },

    /**
    Initial application of the sortable UI.

    @method _renderSortable
    @protected
    @since 3.5.0
    **/
    _renderSortable: function () {
        this._uiSetSortable();

        this._bindSortUI();
    },

    /**
    Parses the current `sortBy` attribute into a normalized structure for the
    `data` ModelList's `_compare` method.  Also updates the column
    configurations' `sortDir` properties.

    @method _setSortBy
    @protected
    @since 3.5.0
    **/
    _setSortBy: function () {
        var columns     = this._displayColumns,
            sortBy      = this.get('sortBy') || [],
            sortedClass = ' ' + this.getClassName('sorted'),
            i, len, name, dir, field, column;

        this._sortBy = [];

        // Purge current sort state from column configs
        for (i = 0, len = columns.length; i < len; ++i) {
            column = columns[i];

            delete column.sortDir;

            if (column.className) {
                // TODO: be more thorough
                column.className = column.className.replace(sortedClass, '');
            }
        }

        sortBy = toArray(sortBy);

        for (i = 0, len = sortBy.length; i < len; ++i) {
            name = sortBy[i];
            dir  = 1;

            if (isObject(name)) {
                field = name;
                // Have to use a for-in loop to process sort({ foo: -1 })
                for (name in field) {
                    if (field.hasOwnProperty(name)) {
                        dir = dirMap[field[name]];
                        break;
                    }
                }
            }

            if (name) {
                // Allow sorting of any model field and any column
                // FIXME: this isn't limited to model attributes, but there's no
                // convenient way to get a list of the attributes for a Model
                // subclass *including* the attributes of its superclasses.
                column = this.getColumn(name) || { _id: name, key: name };

                if (column) {
                    column.sortDir = dir;

                    if (!column.className) {
                        column.className = '';
                    }

                    column.className += sortedClass;

                    this._sortBy.push(column);
                }
            }
        }
    },

    /**
    Array of column configuration objects of those columns that need UI setup
    for user interaction.

    @property _sortable
    @type {Object[]}
    @protected
    @since 3.5.0
    **/
    //_sortable: null,

    /**
    Array of column configuration objects for those columns that are currently
    being used to sort the data.  Fake column objects are used for fields that
    are not rendered as columns.

    @property _sortBy
    @type {Object[]}
    @protected
    @since 3.5.0
    **/
    //_sortBy: null,

    /**
    Replacement `comparator` for the `data` ModelList that defers sorting logic
    to the `_compare` method.  The deferral is accomplished by returning `this`.

    @method _sortComparator
    @param {Model} item The record being evaluated for sort position
    @return {Model} The record
    @protected
    @since 3.5.0
    **/
    _sortComparator: function (item) {
        // Defer sorting to ModelList's _compare
        return item;
    },

    /**
    Applies the appropriate classes to the `boundingBox` and column headers to
    indicate sort state and sortability.

    Also currently wraps the header content of sortable columns in a `<div>`
    liner to give a CSS anchor for sort indicators.

    @method _uiSetSortable
    @protected
    @since 3.5.0
    **/
    _uiSetSortable: function () {
        var columns       = this._sortable || [],
            sortableClass = this.getClassName('sortable', 'column'),
            ascClass      = this.getClassName('sorted'),
            descClass     = this.getClassName('sorted', 'desc'),
            linerClass    = this.getClassName('sort', 'liner'),
            indicatorClass= this.getClassName('sort', 'indicator'),
            sortableCols  = {},
            i, len, col, node, liner, title, desc;

        this.get('boundingBox').toggleClass(
            this.getClassName('sortable'),
            columns.length);

        for (i = 0, len = columns.length; i < len; ++i) {
            sortableCols[columns[i].id] = columns[i];
        }

        // TODO: this.head.render() + decorate cells?
        this._theadNode.all('.' + sortableClass).each(function (node) {
            var col       = sortableCols[node.get('id')],
                liner     = node.one('.' + linerClass),
                indicator;

            if (col) {
                if (!col.sortDir) {
                    node.removeClass(ascClass)
                        .removeClass(descClass);
                }
            } else {
                node.removeClass(sortableClass)
                    .removeClass(ascClass)
                    .removeClass(descClass);

                if (liner) {
                    liner.replace(liner.get('childNodes').toFrag());
                }

                indicator = node.one('.' + indicatorClass);

                if (indicator) {
                    indicator.remove().destroy(true);
                }
            }
        });

        for (i = 0, len = columns.length; i < len; ++i) {
            col  = columns[i];
            node = this._theadNode.one('#' + col.id);
            desc = col.sortDir === -1;

            if (node) {
                liner = node.one('.' + linerClass);

                node.addClass(sortableClass);

                if (col.sortDir) {
                    node.addClass(ascClass);

                    node.toggleClass(descClass, desc);

                    node.setAttribute('aria-sort', desc ?
                        'descending' : 'ascending');
                }

                if (!liner) {
                    liner = Y.Node.create(Y.Lang.sub(
                        this.SORTABLE_HEADER_TEMPLATE, {
                            className: linerClass,
                            indicatorClass: indicatorClass
                        }));

                    liner.prepend(node.get('childNodes').toFrag());

                    node.append(liner);
                }

                title = sub(this.getString(
                    (col.sortDir === 1) ? 'reverseSortBy' : 'sortBy'), // get string
                    {
                        title:  col.title || '',
                        key:    col.key || '',
                        abbr:   col.abbr || '',
                        label:  col.label || '',
                        column: col.abbr || col.label ||
                                col.key  || ('column ' + i)
                    }
                );

                node.setAttribute('title', title);
                // To combat VoiceOver from reading the sort title as the
                // column header
                node.setAttribute('aria-labelledby', col.id);
            }
        }
    },

    /**
    Allows values `true`, `false`, "auto", or arrays of column names through.

    @method _validateSortable
    @param {Any} val The input value to `set("sortable", VAL)`
    @return {Boolean}
    @protected
    @since 3.5.0
    **/
    _validateSortable: function (val) {
        return val === 'auto' || isBoolean(val) || isArray(val);
    },

    /**
    Allows strings, arrays of strings, objects, or arrays of objects.

    @method _validateSortBy
    @param {String|String[]|Object|Object[]} val The new `sortBy` value
    @return {Boolean}
    @protected
    @since 3.5.0
    **/
    _validateSortBy: function (val) {
        return val === null ||
               isString(val) ||
               isObject(val, true) ||
               (isArray(val) && (isString(val[0]) || isObject(val, true)));
    }

}, true);

Y.DataTable.Sortable = Sortable;
/**
Used when the instance's `sortable` attribute is set to
"auto" (the default) to determine which columns will support
user sorting by clicking on the header.

If the instance's `key` attribute is not set, this
configuration is ignored.

    { key: 'lastLogin', sortable: true }

@property sortable
@type Boolean
@for DataTable.Column
 */
/**
When the instance's `caseSensitive` attribute is set to
`true` the sort order is case sensitive (relevant to string columns only).

Case sensitive sort is marginally more efficient and should be considered
for large data sets when case insensitive sort is not required.

    { key: 'lastLogin', sortable: true, caseSensitive: true }

@property caseSensitive
@type Boolean
@for DataTable.Column
 */
/**
Allows a column to be sorted using a custom algorithm.  The
function receives three parameters, the first two being the
two record Models to compare, and the third being a boolean
`true` if the sort order should be descending.

The function should return `1` to sort `a` above `b`, `-1`
to sort `a` below `b`, and `0` if they are equal.  Keep in
mind that the order should be reversed when `desc` is
`true`.

The `desc` parameter is provided to allow `sortFn`s to
always sort certain values above or below others, such as
always sorting `null`s on top.

    {
      label: 'Name',
      sortFn: function (a, b, desc) {
        var an = a.get('lname') + b.get('fname'),
            bn = a.get('lname') + b.get('fname'),
            order = (an > bn) ? 1 : -(an < bn);

        return desc ? -order : order;
      },
      formatter: function (o) {
        return o.data.lname + ', ' + o.data.fname;
      }
    }

@property sortFn
@type Function
@for DataTable.Column
*/
/**
(__read-only__) If a column is sorted, this
will be set to `1` for ascending order or `-1` for
descending.  This configuration is public for inspection,
but can't be used during DataTable instantiation to set the
sort direction of the column.  Use the table's
[sortBy](DataTable.html#attr_sortBy)
attribute for that.

@property sortDir
@type {Number}
@readOnly
@for DataTable.Column
*/

Y.Base.mix(Y.DataTable, [Sortable]);


}, '3.16.0', {"requires": ["datatable-base"], "lang": ["en", "fr", "es", "hu"], "skinnable": true});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatable-datasource', function (Y, NAME) {

/**
 * Plugs DataTable with DataSource integration.
 *
 * @module datatable
 * @submodule datatable-datasource
 */

/**
 * Adds DataSource integration to DataTable.
 * @class Plugin.DataTableDataSource
 * @extends Plugin.Base
 */
function DataTableDataSource() {
    DataTableDataSource.superclass.constructor.apply(this, arguments);
}

/////////////////////////////////////////////////////////////////////////////
//
// STATIC PROPERTIES
//
/////////////////////////////////////////////////////////////////////////////
Y.mix(DataTableDataSource, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "datasource"
     */
    NS: "datasource",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataTableDataSource"
     */
    NAME: "dataTableDataSource",

/////////////////////////////////////////////////////////////////////////////
//
// ATTRIBUTES
//
/////////////////////////////////////////////////////////////////////////////
    ATTRS: {
        /**
        * @attribute datasource
        * @description Pointer to DataSource instance.
        * @type {DataSource}
        */
        datasource: {
            setter: "_setDataSource"
        },

        /**
        * @attribute initialRequest
        * @description Request sent to DataSource immediately upon initialization.
        * @type Object
        */
        initialRequest: {
            setter: "_setInitialRequest"
        }
    }
});

/////////////////////////////////////////////////////////////////////////////
//
// PROTOTYPE
//
/////////////////////////////////////////////////////////////////////////////
Y.extend(DataTableDataSource, Y.Plugin.Base, {
    /////////////////////////////////////////////////////////////////////////////
    //
    // ATTRIBUTE HELPERS
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
    * @method _setDataSource
    * @description Creates new DataSource instance if one is not provided.
    * @param ds {Object|DataSource}
    * @return {DataSource}
    * @private
    */
    _setDataSource: function(ds) {
        return ds || new Y.DataSource.Local(ds);
    },

    /**
    * @method _setInitialRequest
    * @description Sends request to DataSource.
    * @param request {Object} DataSource request.
    * @private
    */
    _setInitialRequest: function(/* request */) {
    },

    /////////////////////////////////////////////////////////////////////////////
    //
    // METHODS
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
    * Initializer.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        if(!Y.Lang.isUndefined(config.initialRequest)) {
            this.load({request:config.initialRequest});
        }
    },

    ////////////////////////////////////////////////////////////////////////////
    //
    // DATA
    //
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Load data by calling DataSource's sendRequest() method under the hood.
     *
     * @method load
     * @param config {object} Optional configuration parameters:
     *
     * <dl>
     * <dt>request</dt><dd>Pass in a new request, or initialRequest is used.</dd>
     * <dt>callback</dt><dd>Pass in DataSource callback object, or the following default is used:
     *    <dl>
     *      <dt>success</dt><dd>datatable.onDataReturnInitializeTable</dd>
     *      <dt>failure</dt><dd>datatable.onDataReturnInitializeTable</dd>
     *      <dt>scope</dt><dd>datatable</dd>
     *      <dt>argument</dt><dd>datatable.getState()</dd>
     *    </dl>
     * </dd>
     * <dt>datasource</dt><dd>Pass in a new DataSource instance to override the current DataSource for this transaction.</dd>
     * </dl>
     */
    load: function(config) {
        config = config || {};
        config.request = config.request || this.get("initialRequest");
        config.callback = config.callback || {
            success: Y.bind(this.onDataReturnInitializeTable, this),
            failure: Y.bind(this.onDataReturnInitializeTable, this),
            argument: this.get("host").get("state") //TODO
        };

        var ds = (config.datasource || this.get("datasource"));
        if(ds) {
            ds.sendRequest(config);
        }
    },

    /**
     * Callback function passed to DataSource's sendRequest() method populates
     * an entire DataTable with new data, clearing previous data, if any.
     *
     * @method onDataReturnInitializeTable
     * @param e {EventFacade} DataSource Event Facade object.
     */
    onDataReturnInitializeTable : function(e) {
        var records = (e.response && e.response.results) || [];

        this.get("host").set("data", records);
    }
});

Y.namespace("Plugin").DataTableDataSource = DataTableDataSource;


}, '3.16.0', {"requires": ["datatable-base", "plugin", "datasource-local"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('yui-throttle', function (Y, NAME) {

/**
Throttles a call to a method based on the time between calls. This method is attached
to the `Y` object and is <a href="../classes/YUI.html#method_throttle">documented there</a>.

    var fn = Y.throttle(function() {
        counter++;
    });

    for (i; i< 35000; i++) {
        out++;
        fn();
    }


@module yui
@submodule yui-throttle
*/

/*! Based on work by Simon Willison: http://gist.github.com/292562 */
/**
 * Throttles a call to a method based on the time between calls.
 * @method throttle
 * @for YUI
 * @param fn {function} The function call to throttle.
 * @param ms {Number} The number of milliseconds to throttle the method call.
 * Can set globally with Y.config.throttleTime or by call. Passing a -1 will
 * disable the throttle. Defaults to 150.
 * @return {function} Returns a wrapped function that calls fn throttled.
 * @since 3.1.0
 */
Y.throttle = function(fn, ms) {
    ms = (ms) ? ms : (Y.config.throttleTime || 150);

    if (ms === -1) {
        return function() {
            fn.apply(this, arguments);
        };
    }

    var last = Y.Lang.now();

    return function() {
        var now = Y.Lang.now();
        if (now - last > ms) {
            last = now;
            fn.apply(this, arguments);
        }
    };
};


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dd-ddm-base', function (Y, NAME) {


    /**
     * Provides the base Drag Drop Manager required for making a Node draggable.
     * @module dd
     * @submodule dd-ddm-base
     */
     /**
     * Provides the base Drag Drop Manager required for making a Node draggable.
     * @class DDM
     * @extends Base
     * @constructor
     * @namespace DD
     */

    var DDMBase = function() {
        DDMBase.superclass.constructor.apply(this, arguments);
    };

    DDMBase.NAME = 'ddm';

    DDMBase.ATTRS = {
        /**
        * The cursor to apply when dragging, if shimmed the shim will get the cursor.
        * @attribute dragCursor
        * @type String
        */
        dragCursor: {
            value: 'move'
        },
        /**
        * The number of pixels to move to start a drag operation, default is 3.
        * @attribute clickPixelThresh
        * @type Number
        */
        clickPixelThresh: {
            value: 3
        },
        /**
        * The number of milliseconds a mousedown has to pass to start a drag operation, default is 1000.
        * @attribute clickTimeThresh
        * @type Number
        */
        clickTimeThresh: {
            value: 1000
        },
        /**
        * The number of milliseconds to throttle the mousemove event. Default: 150
        * @attribute throttleTime
        * @type Number
        */
        throttleTime: {
            //value: 150
            value: -1
        },
        /**
        * This attribute only works if the dd-drop module is active. It will set the dragMode (point, intersect, strict) of all future Drag instances.
        * @attribute dragMode
        * @type String
        */
        dragMode: {
            value: 'point',
            setter: function(mode) {
                this._setDragMode(mode);
                return mode;
            }
        }

    };

    Y.extend(DDMBase, Y.Base, {
        _createPG: function() {},
        /**
        * flag set when we activate our first drag, so DDM can start listening for events.
        * @property _active
        * @type {Boolean}
        */
        _active: null,
        /**
        * Handler for dragMode attribute setter.
        * @private
        * @method _setDragMode
        * @param {String|Number} mode The Number value or the String for the DragMode to default all future drag instances to.
        * @return Number The Mode to be set
        */
        _setDragMode: function(mode) {
            if (mode === null) {
                mode = Y.DD.DDM.get('dragMode');
            }
            switch (mode) {
                case 1:
                case 'intersect':
                    return 1;
                case 2:
                case 'strict':
                    return 2;
                case 0:
                case 'point':
                    return 0;
            }
            return 0;
        },
        /**
        * The PREFIX to attach to all DD CSS class names
        * @property CSS_PREFIX
        * @type {String}
        */
        CSS_PREFIX: Y.ClassNameManager.getClassName('dd'),
        _activateTargets: function() {},
        /**
        * Holder for all registered drag elements.
        * @private
        * @property _drags
        * @type {Array}
        */
        _drags: [],
        /**
        * A reference to the currently active draggable object.
        * @property activeDrag
        * @type {Drag}
        */
        activeDrag: false,
        /**
        * Adds a reference to the drag object to the DDM._drags array, called in the constructor of Drag.
        * @private
        * @method _regDrag
        * @param {Drag} d The Drag object
        */
        _regDrag: function(d) {
            if (this.getDrag(d.get('node'))) {
                return false;
            }

            if (!this._active) {
                this._setupListeners();
            }
            this._drags.push(d);
            return true;
        },
        /**
        * Remove this drag object from the DDM._drags array.
        * @private
        * @method _unregDrag
        * @param {Drag} d The drag object.
        */
        _unregDrag: function(d) {
            var tmp = [];
            Y.Array.each(this._drags, function(n) {
                if (n !== d) {
                    tmp[tmp.length] = n;
                }
            });
            this._drags = tmp;
        },
        /**
        * Add the document listeners.
        * @private
        * @method _setupListeners
        */
        _setupListeners: function() {
            this._createPG();
            this._active = true;

            var doc = Y.one(Y.config.doc);
            doc.on('mousemove', Y.throttle(Y.bind(this._docMove, this), this.get('throttleTime')));
            doc.on('mouseup', Y.bind(this._end, this));
        },
        /**
        * Internal method used by Drag to signal the start of a drag operation
        * @private
        * @method _start
        */
        _start: function() {
            this.fire('ddm:start');
            this._startDrag();
        },
        /**
        * Factory method to be overwritten by other DDM's
        * @private
        * @method _startDrag
        * @param {Number} x The x position of the drag element
        * @param {Number} y The y position of the drag element
        * @param {Number} w The width of the drag element
        * @param {Number} h The height of the drag element
        */
        _startDrag: function() {},
        /**
        * Factory method to be overwritten by other DDM's
        * @private
        * @method _endDrag
        */
        _endDrag: function() {},
        _dropMove: function() {},
        /**
        * Internal method used by Drag to signal the end of a drag operation
        * @private
        * @method _end
        */
        _end: function() {
            if (this.activeDrag) {
                this._shimming = false;
                this._endDrag();
                this.fire('ddm:end');
                this.activeDrag.end.call(this.activeDrag);
                this.activeDrag = null;
            }
        },
        /**
        * Method will forcefully stop a drag operation. For example calling this from inside an ESC keypress handler will stop this drag.
        * @method stopDrag
        * @chainable
        */
        stopDrag: function() {
            if (this.activeDrag) {
                this._end();
            }
            return this;
        },
        /**
        * Set to true when drag starts and useShim is true. Used in pairing with _docMove
        * @private
        * @property _shimming
        * @see _docMove
        * @type {Boolean}
        */
        _shimming: false,
        /**
        * Internal listener for the mousemove on Document. Checks if the shim is in place to only call _move once per mouse move
        * @private
        * @method _docMove
        * @param {EventFacade} ev The Dom mousemove Event
        */
        _docMove: function(ev) {
            if (!this._shimming) {
                this._move(ev);
            }
        },
        /**
        * Internal listener for the mousemove DOM event to pass to the Drag's move method.
        * @private
        * @method _move
        * @param {EventFacade} ev The Dom mousemove Event
        */
        _move: function(ev) {
            if (this.activeDrag) {
                this.activeDrag._move.call(this.activeDrag, ev);
                this._dropMove();
            }
        },
        /**
        * //TODO Private, rename??...
        * Helper method to use to set the gutter from the attribute setter.
        * CSS style string for gutter: '5 0' (sets top and bottom to 5px, left and right to 0px), '1 2 3 4' (top 1px, right 2px, bottom 3px, left 4px)
        * @private
        * @method cssSizestoObject
        * @param {String} gutter CSS style string for gutter
        * @return {Object} The gutter Object Literal.
        */
        cssSizestoObject: function(gutter) {
            var x = gutter.split(' ');

            switch (x.length) {
                case 1: x[1] = x[2] = x[3] = x[0]; break;
                case 2: x[2] = x[0]; x[3] = x[1]; break;
                case 3: x[3] = x[1]; break;
            }

            return {
                top   : parseInt(x[0],10),
                right : parseInt(x[1],10),
                bottom: parseInt(x[2],10),
                left  : parseInt(x[3],10)
            };
        },
        /**
        * Get a valid Drag instance back from a Node or a selector string, false otherwise
        * @method getDrag
        * @param {String/Object} node The Node instance or Selector string to check for a valid Drag Object
        * @return {Object}
        */
        getDrag: function(node) {
            var drag = false,
                n = Y.one(node);
            if (n instanceof Y.Node) {
                Y.Array.each(this._drags, function(v) {
                    if (n.compareTo(v.get('node'))) {
                        drag = v;
                    }
                });
            }
            return drag;
        },
        /**
        * Swap the position of 2 nodes based on their CSS positioning.
        * @method swapPosition
        * @param {Node} n1 The first node to swap
        * @param {Node} n2 The first node to swap
        * @return {Node}
        */
        swapPosition: function(n1, n2) {
            n1 = Y.DD.DDM.getNode(n1);
            n2 = Y.DD.DDM.getNode(n2);
            var xy1 = n1.getXY(),
                xy2 = n2.getXY();

            n1.setXY(xy2);
            n2.setXY(xy1);
            return n1;
        },
        /**
        * Return a node instance from the given node, selector string or Y.Base extended object.
        * @method getNode
        * @param {Node/Object/String} n The node to resolve.
        * @return {Node}
        */
        getNode: function(n) {
            if (n instanceof Y.Node) {
                return n;
            }
            if (n && n.get) {
                if (Y.Widget && (n instanceof Y.Widget)) {
                    n = n.get('boundingBox');
                } else {
                    n = n.get('node');
                }
            } else {
                n = Y.one(n);
            }
            return n;
        },
        /**
        * Swap the position of 2 nodes based on their DOM location.
        * @method swapNode
        * @param {Node} n1 The first node to swap
        * @param {Node} n2 The first node to swap
        * @return {Node}
        */
        swapNode: function(n1, n2) {
            n1 = Y.DD.DDM.getNode(n1);
            n2 = Y.DD.DDM.getNode(n2);
            var p = n2.get('parentNode'),
                s = n2.get('nextSibling');

            if (s === n1) {
                p.insertBefore(n1, n2);
            } else if (n2 === n1.get('nextSibling')) {
                p.insertBefore(n2, n1);
            } else {
                n1.get('parentNode').replaceChild(n2, n1);
                p.insertBefore(n1, s);
            }
            return n1;
        }
    });

    Y.namespace('DD');
    Y.DD.DDM = new DDMBase();

    /**
    * Fires from the DDM before all drag events fire.
    * @event ddm:start
    * @type {CustomEvent}
    */
    /**
    * Fires from the DDM after the DDM finishes, before the drag end events.
    * @event ddm:end
    * @type {CustomEvent}
    */




}, '3.16.0', {"requires": ["node", "base", "yui-throttle", "classnamemanager"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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


}, '3.16.0', {"requires": ["node-base", "event-synthetic"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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




}, '3.16.0', {"requires": ["dd-ddm-base", "event-resize"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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

            Y.Object.each(drops, function(v) {
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
                Y.Object.each(drops, function(v) {
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
                Y.Object.each(this.otherDrops, function(v) {
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




}, '3.16.0', {"requires": ["dd-ddm"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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
                    config.bubbleTargets = config.bubbleTargets || this.getTargets();
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
            ev.preventDefault();
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




}, '3.16.0', {"requires": ["dd-ddm-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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

            c.all('input[type="radio"]').removeAttribute('name');

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




}, '3.16.0', {"requires": ["dd-drag"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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



}, '3.16.0', {"requires": ["dd-drag"]});
