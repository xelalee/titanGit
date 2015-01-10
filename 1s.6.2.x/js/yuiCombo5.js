/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('charts-base', function (Y, NAME) {

/**
 * Provides functionality for creating charts.
 *
 * @module charts
 * @submodule charts-base
 */
var CONFIG = Y.config,
    WINDOW = CONFIG.win,
    DOCUMENT = CONFIG.doc,
    Y_Lang = Y.Lang,
    IS_STRING = Y_Lang.isString,
    _getClassName = Y.ClassNameManager.getClassName,
    SERIES_MARKER = _getClassName("seriesmarker");

/**
 * Gridlines draws gridlines on a Graph.
 *
 * @class Gridlines
 * @constructor
 * @extends Base
 * @uses Renderer
 * @param {Object} config (optional) Configuration parameters.
 * @submodule charts-base
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
            count = this.get("count"),
            length,
            lineFunction;
        if(isFinite(w) && isFinite(h) && w > 0 && h > 0)
        {
            if(count && Y.Lang.isNumber(count))
            {
                points = this._getPoints(count, w, h);
            }
            else if(axisPosition !== "none" && axis && axis.get("tickPoints"))
            {
                points = axis.get("tickPoints");
            }
            else
            {
                points = this._getPoints(axis.get("styles").majorUnit.count, w, h);
            }
            l = points.length;
            path = graph.get("gridlines");
            path.set("width", w);
            path.set("height", h);
            path.set("stroke", {
                weight: weight,
                color: color,
                opacity: alpha
            });
            if(direction === "vertical")
            {
                lineFunction = this._verticalLine;
                length = h;
            }
            else
            {
                lineFunction = this._horizontalLine;
                length = w;
            }
            for(i = 0; i < l; i = i + 1)
            {
                lineFunction(path, points[i], length);
            }
            path.end();
        }
    },

    /**
     * Calculates the coordinates for the gridlines based on a count.
     *
     * @method _getPoints
     * @param {Number} count Number of gridlines
     * @return Array
     * @private
     */
    _getPoints: function(count, w, h)
    {
        var i,
            points = [],
            multiplier,
            divisor = count - 1;
        for(i = 0; i < count; i = i + 1)
        {
            multiplier = i/divisor;
            points[i] = {
                x: w * multiplier,
                y: h * multiplier
            };
        }
        return points;
    },

    /**
     * Algorithm for horizontal lines.
     *
     * @method _horizontalLine
     * @param {Path} path Reference to path element
     * @param {Object} pt Coordinates corresponding to a major unit of an axis.
     * @param {Number} w Width of the Graph
     * @private
     */
    _horizontalLine: function(path, pt, w)
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
     * @param {Number} h Height of the Graph
     * @private
     */
    _verticalLine: function(path, pt, h)
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
        graph: {},

        /**
         * Indicates the number of gridlines to display. If no value is set, gridlines will equal the number of ticks in
         * the corresponding axis.
         *
         * @attribute count
         * @type Number
         */
        count: {}
    }
});
/**
 * Graph manages and contains series instances for a `CartesianChart`
 * instance.
 *
 * @class Graph
 * @constructor
 * @extends Widget
 * @uses Renderer
 * @submodule charts-base
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
            if(series instanceof Y.SeriesBase)
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
            seriesKey = series.get("direction") === "horizontal" ? "yKey" : "xKey";
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
        series.set("seriesTypeCollection", typeSeriesCollection);
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
            SeriesClass,
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
        SeriesClass = this._getSeries(seriesData.type);
        series = new SeriesClass(seriesData);
        this.addDispatcher(series);
        series.after("drawingComplete", Y.bind(this._drawingCompleteHandler, this));
        typeSeriesCollection.push(series);
        seriesCollection.push(series);
        series.set("seriesTypeCollection", typeSeriesCollection);
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
    _sizeChangeHandler: function()
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
        graphic.set("width", this.get("width"));
        graphic.set("height", this.get("height"));
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
        chart: {
            getter: function() {
                var chart = this._state.chart || this;
                return chart;
            }
        },

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
                var cfg,
                    key,
                    gl = this.get("horizontalGridlines");
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
                else if(val)
                {
                    cfg = {
                        direction: "horizonal",
                        graph: this
                    };
                    for(key in val)
                    {
                        if(val.hasOwnProperty(key))
                        {
                            cfg[key] = val[key];
                        }
                    }
                    gl = new Y.Gridlines(cfg);
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
                var cfg,
                    key,
                    gl = this.get("verticalGridlines");
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
                else if(val)
                {
                    cfg = {
                        direction: "vertical",
                        graph: this
                    };
                    for(key in val)
                    {
                        if(val.hasOwnProperty(key))
                        {
                            cfg[key] = val[key];
                        }
                    }
                    gl = new Y.Gridlines(cfg);
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
 * @class ChartBase
 * @constructor
 * @submodule charts-base
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
            if(!this._wereSeriesKeysExplicitlySet())
            {
                this.set("seriesKeys", this._buildSeriesKeys(defDataProvider), {src: "internal"});
            }
            return defDataProvider;
        },

        setter: function(val)
        {
            var dataProvider = this._setDataValues(val);
            if(!this._wereSeriesKeysExplicitlySet())
            {
                this.set("seriesKeys", this._buildSeriesKeys(dataProvider), {src: "internal"});
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
        lazyAdd: false,

        setter: function(val)
        {
            var opts = arguments[2];
            if(!val || (opts && opts.src && opts.src === "internal"))
            {
                this._seriesKeysExplicitlySet = false;
            }
            else
            {
                this._seriesKeysExplicitlySet = true;
            }
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
                this._description.set("text", val);
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
     * Utility method to determine if `seriesKeys` was explicitly provided
     * (for example during construction, or set by the user), as opposed to
     * being derived from the dataProvider for example.
     *
     * @method _wereSeriesKeysExplicitlySet
     * @private
     * @return boolean true if the `seriesKeys` attribute was explicitly set.
     */
    _wereSeriesKeysExplicitlySet : function()
    {
        var seriesKeys = this.get("seriesKeys");
        return seriesKeys && this._seriesKeysExplicitlySet;
    },

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
        graph.after("chartRendered", Y.bind(function() {
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
        description.set("text", this.get("ariaDescription"));
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
                this._liveRegion.set("text", msg);
            }
        }, this), this.get("contentBox"));
        if(interactionType === "marker")
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
        else if(interactionType === "planar")
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
            if(hideEvent && showEvent && hideEvent === showEvent)
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
        if(type === "mouseenter")
        {
            type = "mouseover";
        }
        else if(type === "mouseleave")
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
                        if(axis.get("position") !== "none")
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
            if(val.node && tt.node)
            {
                tt.node.destroy(true);
                node = Y.one(val.node);
            }
            else
            {
                node = tt.node;
            }
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
     *  @return {HTMLElement}
     * @private
     */
    _planarLabelFunction: function(categoryAxis, valueItems, index, seriesArray)
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
            categoryValue = categoryAxis.get("labelFunction").apply(
                this,
                [categoryAxis.getKeyValueAt(this.get("categoryKey"), index), categoryAxis.get("labelFormat")]
            );
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
                seriesValue =  axis.get("labelFunction").apply(
                    this,
                    [axis.getKeyValueAt(valueItem.key, index), axis.get("labelFormat")]
                );
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
     * @return {HTMLElement}
     * @private
     */
    _tooltipLabelFunction: function(categoryItem, valueItem)
    {
        var msg = DOCUMENT.createElement("div"),
            categoryValue = categoryItem.axis.get("labelFunction").apply(
                this,
                [categoryItem.value, categoryItem.axis.get("labelFormat")]
            ),
            seriesValue = valueItem.axis.get("labelFunction").apply(
                this,
                [valueItem.value, valueItem.axis.get("labelFormat")]
            );
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
    _tooltipChangeHandler: function()
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
        textField.empty();
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
            if(allKeys.hasOwnProperty(i) && i !== catKey)
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
 * @class CartesianChart
 * @extends ChartBase
 * @constructor
 * @submodule charts-base
 */
Y.CartesianChart = Y.Base.create("cartesianChart", Y.Widget, [Y.ChartBase, Y.Renderer], {
    /**
     * @method renderUI
     * @private
     */
    renderUI: function()
    {
        var bb = this.get("boundingBox"),
            cb = this.get("contentBox"),
            tt = this.get("tooltip"),
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
        if(this.get("interactionType") === "planar")
        {
            this._overlay = Y.Node.create("<div></div>");
            this._overlay.set("id", this.get("id") + "_overlay");
            this._overlay.setStyle("position", "absolute");
            this._overlay.setStyle("background", "#fff");
            this._overlay.setStyle("opacity", 0);
            this._overlay.addClass(overlayClass);
            this._overlay.setStyle("zIndex", 4);
            cb.append(this._overlay);
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
        if(direction === "horizontal")
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
            seriesStyles = this.get("styles").series,
            stylesAreArray = seriesStyles && Y_Lang.isArray(seriesStyles),
            stylesIndex,
            setStyles,
            globalStyles,
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
        val = val ? val.concat() : [];
        if(dir === "vertical")
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
            }
            else
            {
                series[catKey] = series[catKey] || categoryKey;
                series[seriesKey] = series[seriesKey] || seriesKeys.shift();
                series[catAxis] = this._getCategoryAxis();
                series[valAxis] = this._getSeriesAxis(series[seriesKey]);

                series.type = series.type || type;
                series.direction = series.direction || dir;

                if(series.type === "combo" ||
                    series.type === "stackedcombo" ||
                    series.type === "combospline" ||
                    series.type === "stackedcombospline")
                {
                    if(showAreaFill !== null)
                    {
                        series.showAreaFill = (series.showAreaFill !== null && series.showAreaFill !== undefined) ?
                                               series.showAreaFill : showAreaFill;
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
                if(seriesStyles)
                {
                    stylesIndex = stylesAreArray ? i : series[seriesKey];
                    globalStyles = seriesStyles[stylesIndex];
                    if(globalStyles)
                    {
                        setStyles = series.styles;
                        if(setStyles)
                        {
                            series.styles = this._mergeStyles(setStyles, globalStyles);
                        }
                        else
                        {
                            series.styles = globalStyles;
                        }
                    }
                }
                sc[i] = series;
            }
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
                calculateEdgeOffset: "calculateEdgeOffset",
                position: "position",
                overlapGraph:"overlapGraph",
                labelValues: "labelValues",
                hideFirstMajorUnit: "hideFirstMajorUnit",
                hideLastMajorUnit: "hideLastMajorUnit",
                labelFunction:"labelFunction",
                labelFunctionScope:"labelFunctionScope",
                labelFormat:"labelFormat",
                appendLabelFunction: "appendLabelFunction",
                appendTitleFunction: "appendTitleFunction",
                maximum:"maximum",
                minimum:"minimum",
                roundingMethod:"roundingMethod",
                alwaysShowZero:"alwaysShowZero",
                scaleType: "scaleType",
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
            AxisClass,
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
                        if(pos !== axisPosition)
                        {
                            if(axisPosition !== "none")
                            {
                                axesCollection = this.get(axisPosition + "AxesCollection");
                                axesCollection.splice(Y.Array.indexOf(axesCollection, axis), 1);
                            }
                            if(pos !== "none")
                            {
                                this._addToAxesCollection(pos, axis);
                            }
                        }
                        axis.setAttrs(config);
                    }
                    else
                    {
                        AxisClass = this._getAxisClass(dh.type);
                        axis = new AxisClass(config);
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
        var graph = this.get("graph");
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
                hAxis = direction === "horizontal" ? catAxis : seriesAxesCollection[0];
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
                vAxis = direction === "vertical" ? catAxis : seriesAxesCollection[0];
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
            newKeys = [],
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
        if(direction === "vertical")
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
                    if(attr === "time" || attr === "category")
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
                    else if(i === categoryAxisName)
                    {
                        newAxes[i] = axis;
                    }
                    else
                    {
                        newAxes[i] = axis;
                        if(i !== valueAxisName && keys && Y_Lang.isArray(keys))
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
                            this._setBaseAttribute(
                                newAxes[i],
                                "position",
                                this._getDefaultAxisPosition(newAxes[i], valueAxes, seriesPosition)
                            );
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
        l = seriesKeys.length;
        for(i = 0; i < l; ++i)
        {
            cIndex = Y.Array.indexOf(claimedKeys, seriesKeys[i]);
            if(cIndex > -1)
            {
                newKeys = newKeys.concat(claimedKeys.splice(cIndex, 1));
            }
        }
        claimedKeys = newKeys.concat(claimedKeys);
        l = claimedKeys.length;
        for(i = 0; i < l; i = i + 1)
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
                this._setBaseAttribute(
                    newAxes[valueAxisName],
                    "position",
                    this._getDefaultAxisPosition(newAxes[valueAxisName], valueAxes, seriesPosition)
                );
            }
            this._setBaseAttribute(newAxes[valueAxisName], "type", seriesAxis);
            this._setBaseAttribute(newAxes[valueAxisName], "keys", seriesKeys);
        }
        if(!this._wereSeriesKeysExplicitlySet())
        {
            this.set("seriesKeys", seriesKeys, {src: "internal"});
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
            if(direction === "horizontal")
            {
                if(valueAxes[i - 1].position === "left")
                {
                    position = "right";
                }
                else if(valueAxes[i - 1].position === "right")
                {
                    position = "left";
                }
            }
            else
            {
                if (valueAxes[i -1].position === "bottom")
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
        if(this.get("direction") === "vertical")
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
    _sizeChanged: function()
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
                overflow = Math.max(
                    overflow,
                    Math.abs(axis.getMaxLabelBounds().top) - axis.getEdgeOffset(axis.get("styles").majorTicks.count, height)
                );
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(
                    overflow,
                    Math.abs(axis.getMaxLabelBounds().top) - axis.getEdgeOffset(axis.get("styles").majorTicks.count, height)
                );
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
                overflow = Math.max(
                    overflow,
                    axis.getMaxLabelBounds().right - axis.getEdgeOffset(axis.get("styles").majorTicks.count, width)
                );
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(
                    overflow,
                    axis.getMaxLabelBounds().right - axis.getEdgeOffset(axis.get("styles").majorTicks.count, width)
                );
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
                overflow = Math.max(
                    overflow,
                    Math.abs(axis.getMinLabelBounds().left) - axis.getEdgeOffset(axis.get("styles").majorTicks.count, width)
                );
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(
                    overflow,
                    Math.abs(axis.getMinLabelBounds().left) - axis.getEdgeOffset(axis.get("styles").majorTicks.count, width)
                );
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
                overflow = Math.max(
                    overflow,
                    axis.getMinLabelBounds().bottom - axis.getEdgeOffset(axis.get("styles").majorTicks.count, height)
                );
            }
        }
        if(set2)
        {
            i = 0;
            len = set2.length;
            for(; i < len; ++i)
            {
                axis = set2[i];
                overflow = Math.max(
                    overflow,
                    axis.getMinLabelBounds().bottom - axis.getEdgeOffset(axis.get("styles").majorTicks.count, height)
                );
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
                msg += categoryItem.displayName +
                    ": " +
                    categoryItem.axis.formatLabel.apply(this, [categoryItem.value, categoryItem.axis.get("labelFormat")]) +
                    ", ";
                msg += valueItem.displayName +
                    ": " +
                    valueItem.axis.formatLabel.apply(this, [valueItem.value, valueItem.axis.get("labelFormat")]) +
                    ", ";
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
            lazyAdd: false,

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
                return val;
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
            lazyAdd: false,

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
                return val;
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
            lazyAdd: false,

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
                return val;
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
            lazyAdd: false,

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
            lazyAdd: false,

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
            lazyAdd: false,

            valueFn: "_getDefaultSeriesCollection",

            setter: function(val)
            {
                if(this.get("dataProvider"))
                {
                    return this._parseSeriesCollection(val);
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
                if(type === "bar")
                {
                    return "vertical";
                }
                else if(type === "column")
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
                if(this._type === "bar")
                {
                    if(val !== "bar")
                    {
                        this.set("direction", "horizontal");
                    }
                }
                else
                {
                    if(val === "bar")
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
 * @class PieChart
 * @extends ChartBase
 * @constructor
 * @submodule charts-base
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
        var i, pos, axis, dh, config, AxisClass,
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
                pos = type === "pie" ? "none" : dh.position;
                AxisClass = this._getAxisClass(dh.type);
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
                axis = new AxisClass(config);
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
    _sizeChanged: function()
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
     * @return {HTMLElement}
     * @private
     */
    _tooltipLabelFunction: function(categoryItem, valueItem, itemIndex, series)
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
            msg += categoryItem.displayName +
                ": " +
                categoryItem.axis.formatLabel.apply(this, [categoryItem.value, categoryItem.axis.get("labelFormat")]) +
                ", ";
            msg += valueItem.displayName +
                ": " + valueItem.axis.formatLabel.apply(this, [valueItem.value, valueItem.axis.get("labelFormat")]) +
                ", ";
            msg += "Percent of total " + valueItem.displayName + ": " + pct + "%,";
        }
        else
        {
            msg += "No data available,";
        }
        msg += (itemIndex + 1) + " of " + len + ". ";
        return msg;
    },

    /**
     * Destructor implementation for the PieChart class.
     *
     * @method destructor
     * @protected
     */
    destructor: function()
    {
        var series,
            axis,
            tooltip = this.get("tooltip"),
            tooltipNode = tooltip.node,
            graph = this.get("graph"),
            axesCollection = this._axesCollection,
            seriesCollection = this.get("seriesCollection");
        while(seriesCollection.length > 0)
        {
            series = seriesCollection.shift();
            series.destroy(true);
        }
        while(axesCollection.length > 0)
        {
            axis = axesCollection.shift();
            if(axis instanceof Y.Axis)
            {
                axis.destroy(true);
            }
        }
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
        if(graph)
        {
            graph.destroy(true);
        }
        if(tooltipNode)
        {
            tooltipNode.empty();
            tooltipNode.remove(true);
        }
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
                    this._description.set("text", val);
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
            lazyAdd: false,

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
/**
 * The Chart class is the basic application used to create a chart.
 *
 * @class Chart
 * @constructor
 * @submodule charts-base
 */
function Chart(cfg)
{
    if(cfg.type !== "pie")
    {
        return new Y.CartesianChart(cfg);
    }
    else
    {
        return new Y.PieChart(cfg);
    }
}
Y.Chart = Chart;


}, '3.16.0', {
    "requires": [
        "dom",
        "event-mouseenter",
        "event-touch",
        "graphics-group",
        "axes",
        "series-pie",
        "series-line",
        "series-marker",
        "series-area",
        "series-spline",
        "series-column",
        "series-bar",
        "series-areaspline",
        "series-combo",
        "series-combospline",
        "series-line-stacked",
        "series-marker-stacked",
        "series-area-stacked",
        "series-spline-stacked",
        "series-column-stacked",
        "series-bar-stacked",
        "series-areaspline-stacked",
        "series-combo-stacked",
        "series-combospline-stacked"
    ]
});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('charts-legend', function (Y, NAME) {

/**
 * Adds legend functionality to charts.
 *
 * @module charts
 * @submodule charts-legend
 */
var TOP = "top",
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
PieChartLegend,
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
     * @protected
     */
    _positionLegendItems: function(items, maxWidth, maxHeight, totalWidth, totalHeight, padding, horizontalGap, verticalGap, hAlign)
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
     * @param {String} vAlign The vertical alignment of the legend.
     * @protected
     */
    _positionLegendItems: function(items, maxWidth, maxHeight, totalWidth, totalHeight, padding, horizontalGap, verticalGap, vAlign)
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
            if(position !== EXTERNAL)
            {
                direction = legend.get("direction");
                dimension = direction === HORIZONTAL ? HEIGHT : WIDTH;
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

PieChartLegend = Y.Base.create("pieChartLegend", Y.PieChart, [], {
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

                if((direction === "vertical" && (graphWidth + legendWidth + gap !== w)) ||
                    (direction === "horizontal" &&  (graphHeight + legendHeight + gap !== h)))
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
        this.get("chart").after("stylesChange", Y.bind(this._updateHandler, this));
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
    _updateHandler: function()
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
    _positionChangeHandler: function()
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
            vert = pos === LEFT || pos === RIGHT,
            hor = pos === BOTTOM || pos === TOP;
        if((hor && attrName === WIDTH) || (vert && attrName === HEIGHT))
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
            direction = this.get("direction"),
            align = direction === "vertical" ? styles.vAlign : styles.hAlign,
            marker = styles.marker,
            labelStyles = itemStyles.label,
            displayName,
            layout = this._layout[direction],
            i,
            len,
            isArray,
            legendShape,
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
            legendShape = marker.shape;
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
            shape = legendShape || Y.Circle;
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
                if(!legendShape)
                {
                    shape = seriesStyles.shape;
                    if(!shape)
                    {
                        shape = Y.Circle;
                    }
                }
                shapeClass = Y.Lang.isArray(shape) ? shape[i] : shape;
                item = this._getLegendItem(
                    node,
                    this._getShapeClass(shape),
                    seriesStyles.fill,
                    seriesStyles.border,
                    labelStyles,
                    markerWidth,
                    markerHeight,
                    series.get("valueDisplayName")
                );
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
            layout._positionLegendItems.apply(
                this,
                [items, maxWidth, maxHeight, totalWidth, totalHeight, padding, hSpacing, vSpacing, align]
            );
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
     * @param {String} labelStyles String to be rendered as the legend's text
     * @param {Number} width Total width of the legend item
     * @param {Number} height Total height of the legend item
     * @param {String} text Text for the legendItem
     * @return Object
     * @private
     */
    _getLegendItem: function(node, shapeClass, fill, border, labelStyles, w, h, text)
    {
        var containerNode = Y.Node.create("<div>"),
            textField = Y.Node.create("<span>"),
            shape,
            dimension,
            padding,
            left,
            item,
            ShapeClass = shapeClass;
        containerNode.setStyle(POSITION, "absolute");
        textField.setStyle(POSITION, "absolute");
        textField.setStyles(labelStyles);
        textField.set("text", text);
        containerNode.appendChild(textField);
        node.append(containerNode);
        dimension = textField.get("offsetHeight");
        padding = dimension - h;
        left = w + padding + 2;
        textField.setStyle("left", left + PX);
        containerNode.setStyle("height", dimension + PX);
        containerNode.setStyle("width", (left + textField.get("offsetWidth")) + PX);
        shape = new ShapeClass({
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
         * Indicates the position and direction of the legend. Possible values are `left`, `top`, `right` and `bottom`.
         * Values of `left` and `right` values have a `direction` of `vertical`. Values of `top` and `bottom` values have
         * a `direction` of `horizontal`.
         *
         * @attribute position
         * @type String
         */
        position: {
            lazyAdd: false,

            value: "right",

            setter: function(val)
            {
                if(val === TOP || val === BOTTOM)
                {
                    this.set("direction", HORIZONTAL);
                }
                else if(val === LEFT || val === RIGHT)
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


}, '3.16.0', {"requires": ["charts-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("lang/console_en",function(e){e.Intl.add("console","en",{title:"Log Console",pause:"Pause",clear:"Clear",collapse:"Collapse",expand:"Expand"})},"3.16.0");
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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

/**
A basic console that displays messages logged throughout your application.

@class Console
@constructor
@extends Widget
@param [config] {Object} Object literal specifying widget configuration properties.
**/
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
         * @param event {EventFacade} An Event Facade object with the following attribute specific properties added:
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
         * @param event {EventFacade} Event Facade object
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


}, '3.16.0', {"requires": ["yui-log", "widget"], "skinnable": true, "lang": ["en", "es", "hu", "it", "ja"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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
         * @return {Any} If no converter is specified, returns a string or null if
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
         * @return {Any} If the cookie doesn't exist, null is returned. If the subcookie
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
         * @param {Any} value The value to set for the cookie.
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
         * @param {Any} value The value to set.
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


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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
         * @param e {EventFacade} Event Facade with the following properties:
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
         * @param e {EventFacade} Event Facade with the following properties:
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
         * @param e {EventFacade} Event Facade with the following properties:
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
         * @param e {EventFacade} Event Facade with the following properties:
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
     * @param e {EventFacade} Event Facadewith the following properties:
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
     * @param e {EventFacade} Event Facade with the following properties:
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
     * @param e {EventFacade} Event Facade with the following properties:
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


}, '3.16.0', {"requires": ["base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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
    *       <dt>credentials</dt>
    *         <dd>Set the value to 'true' to set XHR.withCredentials property to true.</dd>
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
    *   <dt>username</dt>
    *     <dd>Username to use in a HTTP authentication.</dd>
    *
    *   <dt>password</dt>
    *     <dd>Password to use in a HTTP authentication.</dd>
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

        // Convert falsy values to an empty string. This way IE can't be
        // rediculous and translate `undefined` to "undefined".
        data || (data = '');

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




}, '3.16.0', {"requires": ["event-custom-base", "querystring-stringify-simple"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

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
    * @param e {EventFacade} Event facade.
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
    * @param e {EventFacade} Event facade.
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
     * @param e {EventFacade} Event Facade with the following properties:
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


}, '3.16.0', {"requires": ["datasource-local", "io-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-get', function (Y, NAME) {

/**
 * Provides a DataSource implementation which can be used to retrieve data via the Get Utility.
 *
 * @module datasource
 * @submodule datasource-get
 */

/**
 * Get Utility subclass for the DataSource Utility.
 * @class DataSource.Get
 * @extends DataSource.Local
 * @constructor
 */
var DSGet = function() {
    DSGet.superclass.constructor.apply(this, arguments);
};


Y.DataSource.Get = Y.extend(DSGet, Y.DataSource.Local, {
    /**
     * Passes query string to Get Utility. Fires <code>response</code> event when
     * response is received asynchronously.
     *
     * @method _defRequestFn
     * @param e {EventFacade} Event Facade with the following properties:
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
        var uri  = this.get("source"),
            get  = this.get("get"),
            guid = Y.guid().replace(/\-/g, '_'),
            generateRequest = this.get( "generateRequestCallback" ),
            payload = e.details[0],
            self = this;

        /**
         * Stores the most recent request id for validation against stale
         * response handling.
         *
         * @property _last
         * @type {String}
         * @protected
         */
        this._last = guid;

        // Dynamically add handler function with a closure to the callback stack
        // for access to guid
        YUI.Env.DataSource.callbacks[guid] = function(response) {
            delete YUI.Env.DataSource.callbacks[guid];
            delete Y.DataSource.Local.transactions[e.tId];

            var process = self.get('asyncMode') !== "ignoreStaleResponses" ||
                          self._last === guid;

            if (process) {
                payload.data = response;

                self.fire("data", payload);
            } else {
            }

        };

        // Add the callback param to the request url
        uri += e.request + generateRequest.call( this, guid );


        Y.DataSource.Local.transactions[e.tId] = get.script(uri, {
            autopurge: true,
            // Works in Firefox only....
            onFailure: function (o) {
                delete YUI.Env.DataSource.callbacks[guid];
                delete Y.DataSource.Local.transactions[e.tId];

                payload.error = new Error(o.msg || "Script node data failure");


                self.fire("data", payload);
            },
            onTimeout: function(o) {
                delete YUI.Env.DataSource.callbacks[guid];
                delete Y.DataSource.Local.transactions[e.tId];

                payload.error = new Error(o.msg || "Script node data timeout");


                self.fire("data", payload);
            }
        });

        return e.tId;
    },


    /**
     * Default method for adding callback param to url.  See
     * generateRequestCallback attribute.
     *
     * @method _generateRequest
     * @param guid {String} unique identifier for callback function wrapper
     * @protected
     */
     _generateRequest: function (guid) {
        return "&" + this.get("scriptCallbackParam") +
                "=YUI.Env.DataSource.callbacks." + guid;
    }

}, {

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceGet"
     */
    NAME: "dataSourceGet",


    ////////////////////////////////////////////////////////////////////////////
    //
    // DataSource.Get Attributes
    //
    ////////////////////////////////////////////////////////////////////////////
    ATTRS: {
        /**
         * Pointer to Get Utility.
         *
         * @attribute get
         * @type Y.Get
         * @default Y.Get
         */
        get: {
            value: Y.Get,
            cloneDefaultValue: false
        },

        /**
         * Defines request/response management in the following manner:
         * <dl>
         *     <!--<dt>queueRequests</dt>
         *     <dd>If a request is already in progress, wait until response is
         *     returned before sending the next request.</dd>
         *     <dt>cancelStaleRequests</dt>
         *     <dd>If a request is already in progress, cancel it before
         *     sending the next request.</dd>-->
         *     <dt>ignoreStaleResponses</dt>
         *     <dd>Send all requests, but handle only the response for the most
         *     recently sent request.</dd>
         *     <dt>allowAll</dt>
         *     <dd>Send all requests and handle all responses.</dd>
         * </dl>
         *
         * @attribute asyncMode
         * @type String
         * @default "allowAll"
         */
        asyncMode: {
            value: "allowAll"
        },

        /**
         * Callback string parameter name sent to the remote script. By default,
         * requests are sent to
         * &#60;URI&#62;?&#60;scriptCallbackParam&#62;=callbackFunction
         *
         * @attribute scriptCallbackParam
         * @type String
         * @default "callback"
         */
        scriptCallbackParam : {
            value: "callback"
        },

        /**
         * Accepts the DataSource instance and a callback ID, and returns a callback
         * param/value string that gets appended to the script URI. Implementers
         * can customize this string to match their server's query syntax.
         *
         * @attribute generateRequestCallback
         * @type Function
         */
        generateRequestCallback : {
            value: function () {
                return this._generateRequest.apply(this, arguments);
            }
        }
    }
});

YUI.namespace("Env.DataSource.callbacks");


}, '3.16.0', {"requires": ["datasource-local", "get"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-function', function (Y, NAME) {

/**
 * Provides a DataSource implementation which can be used to retrieve data from
 * a custom function.
 *
 * @module datasource
 * @submodule datasource-function
 */

/**
 * Function subclass for the DataSource Utility.
 * @class DataSource.Function
 * @extends DataSource.Local
 * @constructor
 */
var LANG = Y.Lang,

    DSFn = function() {
        DSFn.superclass.constructor.apply(this, arguments);
    };


    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSource.Function static properties
    //
    /////////////////////////////////////////////////////////////////////////////
Y.mix(DSFn, {
    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceFunction"
     */
    NAME: "dataSourceFunction",


    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSource.Function Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        /**
        * Stores the function that will serve the response data.
        *
        * @attribute source
        * @type {Any}
        * @default null
        */
        source: {
            validator: LANG.isFunction
        }
    }
});

Y.extend(DSFn, Y.DataSource.Local, {
    /**
     * Passes query data to the source function. Fires <code>response</code>
     * event with the function results (synchronously).
     *
     * @method _defRequestFn
     * @param e {EventFacade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>The callback object with the following
     * properties:
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
        var fn = this.get("source"),
            payload = e.details[0];

        if (fn) {
            try {
                payload.data = fn(e.request, this, e);
            } catch (ex) {
                payload.error = ex;
            }
        } else {
            payload.error = new Error("Function data failure");
        }

        this.fire("data", payload);

        return e.tId;
    }
});

Y.DataSource.Function = DSFn;


}, '3.16.0', {"requires": ["datasource-local"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('plugin', function (Y, NAME) {

    /**
     * Provides the base Plugin class, which plugin developers should extend, when creating custom plugins
     *
     * @module plugin
     */

    /**
     * The base class for all Plugin instances.
     *
     * @class Plugin.Base
     * @extends Base
     * @param {Object} config Configuration object with property name/value pairs.
     */
    function Plugin(config) {
        if (! (this.hasImpl && this.hasImpl(Y.Plugin.Base)) ) {
            Plugin.superclass.constructor.apply(this, arguments);
        } else {
            Plugin.prototype.initializer.apply(this, arguments);
        }
    }

    /**
     * Object defining the set of attributes supported by the Plugin.Base class
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    Plugin.ATTRS = {

        /**
         * The plugin's host object.
         *
         * @attribute host
         * @writeonce
         * @type Plugin.Host
         */
        host : {
            writeOnce: true
        }
    };

    /**
     * The string identifying the Plugin.Base class. Plugins extending
     * Plugin.Base should set their own NAME value.
     *
     * @property NAME
     * @type String
     * @static
     */
    Plugin.NAME = 'plugin';

    /**
     * The name of the property the the plugin will be attached to
     * when plugged into a Plugin Host. Plugins extending Plugin.Base,
     * should set their own NS value.
     *
     * @property NS
     * @type String
     * @static
     */
    Plugin.NS = 'plugin';

    Y.extend(Plugin, Y.Base, {

        /**
         * The list of event handles for event listeners or AOP injected methods
         * applied by the plugin to the host object.
         *
         * @property _handles
         * @private
         * @type Array
         * @value null
         */
        _handles: null,

        /**
         * Initializer lifecycle implementation.
         *
         * @method initializer
         * @param {Object} config Configuration object with property name/value pairs.
         */
        initializer : function(config) {
            this._handles = [];
        },

        /**
         * Destructor lifecycle implementation.
         *
         * Removes any event listeners or injected methods applied by the Plugin
         *
         * @method destructor
         */
        destructor: function() {
            // remove all handles
            if (this._handles) {
                for (var i = 0, l = this._handles.length; i < l; i++) {
                   this._handles[i].detach();
                }
            }
        },

        /**
         * Listens for the "on" moment of events fired by the host,
         * or injects code "before" a given method on the host.
         *
         * @method doBefore
         *
         * @param strMethod {String} The event to listen for, or method to inject logic before.
         * @param fn {Function} The handler function. For events, the "on" moment listener. For methods, the function to execute before the given method is executed.
         * @param context {Object} An optional context to call the handler with. The default context is the plugin instance.
         * @return handle {EventHandle} The detach handle for the handler.
         */
        doBefore: function(strMethod, fn, context) {
            var host = this.get("host"), handle;

            if (strMethod in host) { // method
                handle = this.beforeHostMethod(strMethod, fn, context);
            } else if (host.on) { // event
                handle = this.onHostEvent(strMethod, fn, context);
            }

            return handle;
        },

        /**
         * Listens for the "after" moment of events fired by the host,
         * or injects code "after" a given method on the host.
         *
         * @method doAfter
         *
         * @param strMethod {String} The event to listen for, or method to inject logic after.
         * @param fn {Function} The handler function. For events, the "after" moment listener. For methods, the function to execute after the given method is executed.
         * @param context {Object} An optional context to call the handler with. The default context is the plugin instance.
         * @return handle {EventHandle} The detach handle for the listener.
         */
        doAfter: function(strMethod, fn, context) {
            var host = this.get("host"), handle;

            if (strMethod in host) { // method
                handle = this.afterHostMethod(strMethod, fn, context);
            } else if (host.after) { // event
                handle = this.afterHostEvent(strMethod, fn, context);
            }

            return handle;
        },

        /**
         * Listens for the "on" moment of events fired by the host object.
         *
         * Listeners attached through this method will be detached when the plugin is unplugged.
         *
         * @method onHostEvent
         * @param {String | Object} type The event type.
         * @param {Function} fn The listener.
         * @param {Object} context The execution context. Defaults to the plugin instance.
         * @return handle {EventHandle} The detach handle for the listener.
         */
        onHostEvent : function(type, fn, context) {
            var handle = this.get("host").on(type, fn, context || this);
            this._handles.push(handle);
            return handle;
        },

        /**
         * Listens for the "on" moment of events fired by the host object one time only.
         * The listener is immediately detached when it is executed.
         *
         * Listeners attached through this method will be detached when the plugin is unplugged.
         *
         * @method onceHostEvent
         * @param {String | Object} type The event type.
         * @param {Function} fn The listener.
         * @param {Object} context The execution context. Defaults to the plugin instance.
         * @return handle {EventHandle} The detach handle for the listener.
         */
        onceHostEvent : function(type, fn, context) {
            var handle = this.get("host").once(type, fn, context || this);
            this._handles.push(handle);
            return handle;
        },

        /**
         * Listens for the "after" moment of events fired by the host object.
         *
         * Listeners attached through this method will be detached when the plugin is unplugged.
         *
         * @method afterHostEvent
         * @param {String | Object} type The event type.
         * @param {Function} fn The listener.
         * @param {Object} context The execution context. Defaults to the plugin instance.
         * @return handle {EventHandle} The detach handle for the listener.
         */
        afterHostEvent : function(type, fn, context) {
            var handle = this.get("host").after(type, fn, context || this);
            this._handles.push(handle);
            return handle;
        },

        /**
         * Listens for the "after" moment of events fired by the host object one time only.
         * The listener is immediately detached when it is executed.
         *
         * Listeners attached through this method will be detached when the plugin is unplugged.
         *
         * @method onceAfterHostEvent
         * @param {String | Object} type The event type.
         * @param {Function} fn The listener.
         * @param {Object} context The execution context. Defaults to the plugin instance.
         * @return handle {EventHandle} The detach handle for the listener.
         */
        onceAfterHostEvent : function(type, fn, context) {
            var handle = this.get("host").onceAfter(type, fn, context || this);
            this._handles.push(handle);
            return handle;
        },

        /**
         * Injects a function to be executed before a given method on host object.
         *
         * The function will be detached when the plugin is unplugged.
         *
         * @method beforeHostMethod
         * @param {String} method The name of the method to inject the function before.
         * @param {Function} fn The function to inject.
         * @param {Object} context The execution context. Defaults to the plugin instance.
         * @return handle {EventHandle} The detach handle for the injected function.
         */
        beforeHostMethod : function(strMethod, fn, context) {
            var handle = Y.Do.before(fn, this.get("host"), strMethod, context || this);
            this._handles.push(handle);
            return handle;
        },

        /**
         * Injects a function to be executed after a given method on host object.
         *
         * The function will be detached when the plugin is unplugged.
         *
         * @method afterHostMethod
         * @param {String} method The name of the method to inject the function after.
         * @param {Function} fn The function to inject.
         * @param {Object} context The execution context. Defaults to the plugin instance.
         * @return handle {EventHandle} The detach handle for the injected function.
         */
        afterHostMethod : function(strMethod, fn, context) {
            var handle = Y.Do.after(fn, this.get("host"), strMethod, context || this);
            this._handles.push(handle);
            return handle;
        },

        toString: function() {
            return this.constructor.NAME + '[' + this.constructor.NS + ']';
        }
    });

    Y.namespace("Plugin").Base = Plugin;


}, '3.16.0', {"requires": ["base-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('cache-base', function (Y, NAME) {

/**
 * The Cache utility provides a common configurable interface for components to
 * cache and retrieve data from a local JavaScript struct.
 *
 * @module cache
 * @main
 */

/**
 * Provides the base class for the YUI Cache utility.
 *
 * @submodule cache-base
 */
var LANG = Y.Lang,
    isDate = Y.Lang.isDate,

/**
 * Base class for the YUI Cache utility.
 * @class Cache
 * @extends Base
 * @constructor
 */
Cache = function() {
    Cache.superclass.constructor.apply(this, arguments);
};

    /////////////////////////////////////////////////////////////////////////////
    //
    // Cache static properties
    //
    /////////////////////////////////////////////////////////////////////////////
Y.mix(Cache, {
    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "cache"
     */
    NAME: "cache",


    ATTRS: {
        /////////////////////////////////////////////////////////////////////////////
        //
        // Cache Attributes
        //
        /////////////////////////////////////////////////////////////////////////////

        /**
        * @attribute max
        * @description Maximum number of entries the Cache can hold.
        * Set to 0 to turn off caching.
        * @type Number
        * @default 0
        */
        max: {
            value: 0,
            setter: "_setMax"
        },

        /**
        * @attribute size
        * @description Number of entries currently cached.
        * @type Number
        */
        size: {
            readOnly: true,
            getter: "_getSize"
        },

        /**
        * @attribute uniqueKeys
        * @description Validate uniqueness of stored keys. Default is false and
        * is more performant.
        * @type Boolean
        */
        uniqueKeys: {
            value: false
        },

        /**
        * @attribute expires
        * @description Absolute Date when data expires or
        * relative number of milliseconds. Zero disables expiration.
        * @type Date | Number
        * @default 0
        */
        expires: {
            value: 0,
            validator: function(v) {
                return Y.Lang.isDate(v) || (Y.Lang.isNumber(v) && v >= 0);
            }
        },

        /**
         * @attribute entries
         * @description Cached entries.
         * @type Array
         */
        entries: {
            readOnly: true,
            getter: "_getEntries"
        }
    }
});

Y.extend(Cache, Y.Base, {
    /////////////////////////////////////////////////////////////////////////////
    //
    // Cache private properties
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Array of request/response objects indexed chronologically.
     *
     * @property _entries
     * @type Object[]
     * @private
     */
    _entries: null,

    /////////////////////////////////////////////////////////////////////////////
    //
    // Cache private methods
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
    * @method initializer
    * @description Internal init() handler.
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {

        /**
        * @event add
        * @description Fired when an entry is added.
        * @param e {EventFacade} Event Facade with the following properties:
         * <dl>
         * <dt>entry (Object)</dt> <dd>The cached entry.</dd>
         * </dl>
        * @preventable _defAddFn
        */
        this.publish("add", {defaultFn: this._defAddFn});

        /**
        * @event flush
        * @description Fired when the cache is flushed.
        * @param e {EventFacade} Event Facade object.
        * @preventable _defFlushFn
        */
        this.publish("flush", {defaultFn: this._defFlushFn});

        /**
        * @event request
        * @description Fired when an entry is requested from the cache.
        * @param e {EventFacade} Event Facade with the following properties:
        * <dl>
        * <dt>request (Object)</dt> <dd>The request object.</dd>
        * </dl>
        */

        /**
        * @event retrieve
        * @description Fired when an entry is retrieved from the cache.
        * @param e {EventFacade} Event Facade with the following properties:
        * <dl>
        * <dt>entry (Object)</dt> <dd>The retrieved entry.</dd>
        * </dl>
        */

        // Initialize internal values
        this._entries = [];
    },

    /**
    * @method destructor
    * @description Internal destroy() handler.
    * @private
    */
    destructor: function() {
        this._entries = [];
    },

    /////////////////////////////////////////////////////////////////////////////
    //
    // Cache protected methods
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Sets max.
     *
     * @method _setMax
     * @protected
     */
    _setMax: function(value) {
        // If the cache is full, make room by removing stalest element (index=0)
        var entries = this._entries;
        if(value > 0) {
            if(entries) {
                while(entries.length > value) {
                    entries.shift();
                }
            }
        }
        else {
            value = 0;
            this._entries = [];
        }
        return value;
    },

    /**
     * Gets size.
     *
     * @method _getSize
     * @protected
     */
    _getSize: function() {
        return this._entries.length;
    },

    /**
     * Gets all entries.
     *
     * @method _getEntries
     * @protected
     */
    _getEntries: function() {
        return this._entries;
    },


    /**
     * Adds entry to cache.
     *
     * @method _defAddFn
     * @param e {EventFacade} Event Facade with the following properties:
     * <dl>
     * <dt>entry (Object)</dt> <dd>The cached entry.</dd>
     * </dl>
     * @protected
     */
    _defAddFn: function(e) {
        var entries = this._entries,
            entry   = e.entry,
            max     = this.get("max"),
            pos;

        // If uniqueKeys is true and item exists with this key, then remove it.
        if (this.get("uniqueKeys")) {
            pos = this._position(e.entry.request);
            if (LANG.isValue(pos)) {
                entries.splice(pos, 1);
            }
        }

        // If the cache at or over capacity, make room by removing stalest
        // element(s) starting at index-0.
        while (max && entries.length >= max) {
            entries.shift();
        }

        // Add entry to cache in the newest position, at the end of the array
        entries[entries.length] = entry;
    },

    /**
     * Flushes cache.
     *
     * @method _defFlushFn
     * @param e {EventFacade} Event Facade object.
     * @protected
     */
    _defFlushFn: function(e) {
        var entries = this._entries,
            details = e.details[0],
            pos;

        //passed an item, flush only that
        if(details && LANG.isValue(details.request)) {
            pos = this._position(details.request);

            if(LANG.isValue(pos)) {
                entries.splice(pos,1);

            }
        }
        //no item, flush everything
        else {
            this._entries = [];
        }
    },

    /**
     * Default overridable method compares current request with given cache entry.
     * Returns true if current request matches the cached request, otherwise
     * false. Implementers should override this method to customize the
     * cache-matching algorithm.
     *
     * @method _isMatch
     * @param request {Object} Request object.
     * @param entry {Object} Cached entry.
     * @return {Boolean} True if current request matches given cached request, false otherwise.
     * @protected
     */
    _isMatch: function(request, entry) {
        if(!entry.expires || new Date() < entry.expires) {
            return (request === entry.request);
        }
        return false;
    },

    /**
     * Returns position of a request in the entries array, otherwise null.
     *
     * @method _position
     * @param request {Object} Request object.
     * @return {Number} Array position if found, null otherwise.
     * @protected
     */
    _position: function(request) {
        // If cache is enabled...
        var entries = this._entries,
            length = entries.length,
            i = length-1;

        if((this.get("max") === null) || this.get("max") > 0) {
            // Loop through each cached entry starting from the newest
            for(; i >= 0; i--) {
                // Execute matching function
                if(this._isMatch(request, entries[i])) {
                    return i;
                }
            }
        }

        return null;
    },

    /////////////////////////////////////////////////////////////////////////////
    //
    // Cache public methods
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Adds a new entry to the cache of the format
     * {request:request, response:response, cached:cached, expires:expires}.
     * If cache is full, evicts the stalest entry before adding the new one.
     *
     * @method add
     * @param request {Object} Request value.
     * @param response {Object} Response value.
     */
    add: function(request, response) {
        var expires = this.get("expires");
        if(this.get("initialized") && ((this.get("max") === null) || this.get("max") > 0) &&
                (LANG.isValue(request) || LANG.isNull(request) || LANG.isUndefined(request))) {
            this.fire("add", {entry: {
                request:request,
                response:response,
                cached: new Date(),
                expires: isDate(expires) ? expires :
            (expires ? new Date(new Date().getTime() + this.get("expires")) : null)
            }});
        }
        else {
        }
    },

    /**
     * Flushes cache.
     *
     * @method flush
     */
    flush: function(request) {
        this.fire("flush", { request: (LANG.isValue(request) ? request : null) });
    },

    /**
     * Retrieves cached object for given request, if available, and refreshes
     * entry in the cache. Returns null if there is no cache match.
     *
     * @method retrieve
     * @param request {Object} Request object.
     * @return {Object} Cached object with the properties request and response, or null.
     */
    retrieve: function(request) {
        // If cache is enabled...
        var entries = this._entries,
            length = entries.length,
            entry = null,
            pos;

        if((length > 0) && ((this.get("max") === null) || (this.get("max") > 0))) {
            this.fire("request", {request: request});

            pos = this._position(request);

            if(LANG.isValue(pos)) {
                entry = entries[pos];

                this.fire("retrieve", {entry: entry});

                // Refresh the position of the cache hit
                if(pos < length-1) {
                    // Remove element from its original location
                    entries.splice(pos,1);
                    // Add as newest
                    entries[entries.length] = entry;
                }

                return entry;
            }
        }
        return null;
    }
});

Y.Cache = Cache;


}, '3.16.0', {"requires": ["base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-cache', function (Y, NAME) {

/**
 * Plugs DataSource with caching functionality.
 *
 * @module datasource
 * @submodule datasource-cache
 */

/**
 * DataSourceCache extension binds Cache to DataSource.
 * @class DataSourceCacheExtension
 */
var DataSourceCacheExtension = function() {
};

Y.mix(DataSourceCacheExtension, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "cache"
     */
    NS: "cache",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceCacheExtension"
     */
    NAME: "dataSourceCacheExtension"
});

DataSourceCacheExtension.prototype = {
    /**
    * Internal init() handler.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        this.doBefore("_defRequestFn", this._beforeDefRequestFn);
        this.doBefore("_defResponseFn", this._beforeDefResponseFn);
    },

    /**
     * First look for cached response, then send request to live data.
     *
     * @method _beforeDefRequestFn
     * @param e {EventFacade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>The callback object.</dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * </dl>
     * @protected
     */
    _beforeDefRequestFn: function(e) {
        // Is response already in the Cache?
        var entry = (this.retrieve(e.request)) || null,
            payload = e.details[0];

        if (entry && entry.response) {
            payload.cached   = entry.cached;
            payload.response = entry.response;
            payload.data     = entry.data;

            this.get("host").fire("response", payload);

            return new Y.Do.Halt("DataSourceCache extension halted _defRequestFn");
        }
    },

    /**
     * Adds data to cache before returning data.
     *
     * @method _beforeDefResponseFn
     * @param e {EventFacade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>The callback object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * </dd>
     * <dt>data (Object)</dt> <dd>Raw data.</dd>
     * <dt>response (Object)</dt> <dd>Normalized response object with the following properties:
     *     <dl>
     *         <dt>cached (Object)</dt> <dd>True when response is cached.</dd>
     *         <dt>results (Object)</dt> <dd>Parsed results.</dd>
     *         <dt>meta (Object)</dt> <dd>Parsed meta data.</dd>
     *         <dt>error (Object)</dt> <dd>Error object.</dd>
     *     </dl>
     * </dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * </dl>
     * @protected
     */
     _beforeDefResponseFn: function(e) {
        // Add to Cache before returning
        if(e.response && !e.cached) {
            this.add(e.request, e.response);
        }
     }
};

Y.namespace("Plugin").DataSourceCacheExtension = DataSourceCacheExtension;



/**
 * DataSource plugin adds cache functionality.
 * @class DataSourceCache
 * @extends Cache
 * @uses Plugin.Base, DataSourceCachePlugin
 */
function DataSourceCache(config) {
    var cache = config && config.cache ? config.cache : Y.Cache,
        tmpclass = Y.Base.create("dataSourceCache", cache, [Y.Plugin.Base, Y.Plugin.DataSourceCacheExtension]),
        tmpinstance = new tmpclass(config);
    tmpclass.NS = "tmpClass";
    return tmpinstance;
}

Y.mix(DataSourceCache, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "cache"
     */
    NS: "cache",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceCache"
     */
    NAME: "dataSourceCache"
});


Y.namespace("Plugin").DataSourceCache = DataSourceCache;


}, '3.16.0', {"requires": ["datasource-local", "plugin", "cache-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dataschema-base', function (Y, NAME) {

/**
 * The DataSchema utility provides a common configurable interface for widgets to
 * apply a given schema to a variety of data.
 *
 * @module dataschema
 * @main dataschema
 */

/**
 * Provides the base DataSchema implementation, which can be extended to
 * create DataSchemas for specific data formats, such XML, JSON, text and
 * arrays.
 *
 * @module dataschema
 * @submodule dataschema-base
 */

var LANG = Y.Lang,
/**
 * Base class for the YUI DataSchema Utility.
 * @class DataSchema.Base
 * @static
 */
    SchemaBase = {
    /**
     * Overridable method returns data as-is.
     *
     * @method apply
     * @param schema {Object} Schema to apply.
     * @param data {Object} Data.
     * @return {Object} Schema-parsed data.
     * @static
     */
    apply: function(schema, data) {
        return data;
    },

    /**
     * Applies field parser, if defined
     *
     * @method parse
     * @param value {Object} Original value.
     * @param field {Object} Field.
     * @return {Object} Type-converted value.
     */
    parse: function(value, field) {
        if(field.parser) {
            var parser = (LANG.isFunction(field.parser)) ?
            field.parser : Y.Parsers[field.parser+''];
            if(parser) {
                value = parser.call(this, value);
            }
            else {
            }
        }
        return value;
    }
};

Y.namespace("DataSchema").Base = SchemaBase;
Y.namespace("Parsers");


}, '3.16.0', {"requires": ["base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('json-parse', function (Y, NAME) {

var _JSON = Y.config.global.JSON;

Y.namespace('JSON').parse = function (obj, reviver, space) {
    return _JSON.parse((typeof obj === 'string' ? obj : obj + ''), reviver, space);
};


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('json-stringify', function (Y, NAME) {

/**
 * Provides Y.JSON.stringify method for converting objects to JSON strings.
 *
 * @module json
 * @submodule json-stringify
 * @for JSON
 * @static
 */
var COLON     = ':',
    _JSON     = Y.config.global.JSON;

Y.mix(Y.namespace('JSON'), {
    /**
     * Serializes a Date instance as a UTC date string.  Used internally by
     * stringify.  Override this method if you need Dates serialized in a
     * different format.
     *
     * @method dateToString
     * @param d {Date} The Date to serialize
     * @return {String} stringified Date in UTC format YYYY-MM-DDTHH:mm:SSZ
     * @deprecated Use a replacer function
     * @static
     */
    dateToString: function (d) {
        function _zeroPad(v) {
            return v < 10 ? '0' + v : v;
        }

        return d.getUTCFullYear()           + '-' +
              _zeroPad(d.getUTCMonth() + 1) + '-' +
              _zeroPad(d.getUTCDate())      + 'T' +
              _zeroPad(d.getUTCHours())     + COLON +
              _zeroPad(d.getUTCMinutes())   + COLON +
              _zeroPad(d.getUTCSeconds())   + 'Z';
    },

    /**
     * <p>Converts an arbitrary value to a JSON string representation.</p>
     *
     * <p>Objects with cyclical references will trigger an exception.</p>
     *
     * <p>If a whitelist is provided, only matching object keys will be
     * included.  Alternately, a replacer function may be passed as the
     * second parameter.  This function is executed on every value in the
     * input, and its return value will be used in place of the original value.
     * This is useful to serialize specialized objects or class instances.</p>
     *
     * <p>If a positive integer or non-empty string is passed as the third
     * parameter, the output will be formatted with carriage returns and
     * indentation for readability.  If a String is passed (such as "\t") it
     * will be used once for each indentation level.  If a number is passed,
     * that number of spaces will be used.</p>
     *
     * @method stringify
     * @param o {MIXED} any arbitrary value to convert to JSON string
     * @param w {Array|Function} (optional) whitelist of acceptable object
     *                  keys to include, or a replacer function to modify the
     *                  raw value before serialization
     * @param ind {Number|String} (optional) indentation character or depth of
     *                  spaces to format the output.
     * @return {string} JSON string representation of the input
     * @static
     */
    stringify: function () {
        return _JSON.stringify.apply(_JSON, arguments);
    },

    /**
     * <p>Number of occurrences of a special character within a single call to
     * stringify that should trigger promotion of that character to a dedicated
     * preprocess step for future calls.  This is only used in environments
     * that don't support native JSON, or when useNativeJSONStringify is set to
     * false.</p>
     *
     * <p>So, if set to 50 and an object is passed to stringify that includes
     * strings containing the special character \x07 more than 50 times,
     * subsequent calls to stringify will process object strings through a
     * faster serialization path for \x07 before using the generic, slower,
     * replacement process for all special characters.</p>
     *
     * <p>To prime the preprocessor cache, set this value to 1, then call
     * <code>Y.JSON.stringify("<em>(all special characters to
     * cache)</em>");</code>, then return this setting to a more conservative
     * value.</p>
     *
     * <p>Special characters \ " \b \t \n \f \r are already cached.</p>
     *
     * @property charCacheThreshold
     * @static
     * @default 100
     * @type {Number}
     */
    charCacheThreshold: 100
});


}, '3.16.0', {"requires": ["yui-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dataschema-json', function (Y, NAME) {

/**
Provides a DataSchema implementation which can be used to work with JSON data.

@module dataschema
@submodule dataschema-json
**/

/**
Provides a DataSchema implementation which can be used to work with JSON data.

See the `apply` method for usage.

@class DataSchema.JSON
@extends DataSchema.Base
@static
**/
var LANG = Y.Lang,
    isFunction = LANG.isFunction,
    isObject   = LANG.isObject,
    isArray    = LANG.isArray,
    // TODO: I don't think the calls to Base.* need to be done via Base since
    // Base is mixed into SchemaJSON.  Investigate for later.
    Base       = Y.DataSchema.Base,

    SchemaJSON;

SchemaJSON = {

/////////////////////////////////////////////////////////////////////////////
//
// DataSchema.JSON static methods
//
/////////////////////////////////////////////////////////////////////////////
    /**
     * Utility function converts JSON locator strings into walkable paths
     *
     * @method getPath
     * @param locator {String} JSON value locator.
     * @return {String[]} Walkable path to data value.
     * @static
     */
    getPath: function(locator) {
        var path = null,
            keys = [],
            i = 0;

        if (locator) {
            // Strip the ["string keys"] and [1] array indexes
            // TODO: the first two steps can probably be reduced to one with
            // /\[\s*(['"])?(.*?)\1\s*\]/g, but the array indices would be
            // stored as strings.  This is not likely an issue.
            locator = locator.
                replace(/\[\s*(['"])(.*?)\1\s*\]/g,
                function (x,$1,$2) {keys[i]=$2;return '.@'+(i++);}).
                replace(/\[(\d+)\]/g,
                function (x,$1) {keys[i]=parseInt($1,10)|0;return '.@'+(i++);}).
                replace(/^\./,''); // remove leading dot

            // Validate against problematic characters.
            // commented out because the path isn't sent to eval, so it
            // should be safe. I'm not sure what makes a locator invalid.
            //if (!/[^\w\.\$@]/.test(locator)) {
            path = locator.split('.');
            for (i=path.length-1; i >= 0; --i) {
                if (path[i].charAt(0) === '@') {
                    path[i] = keys[parseInt(path[i].substr(1),10)];
                }
            }
            /*}
            else {
            }
            */
        }
        return path;
    },

    /**
     * Utility function to walk a path and return the value located there.
     *
     * @method getLocationValue
     * @param path {String[]} Locator path.
     * @param data {String} Data to traverse.
     * @return {Object} Data value at location.
     * @static
     */
    getLocationValue: function (path, data) {
        var i = 0,
            len = path.length;
        for (;i<len;i++) {
            if (isObject(data) && (path[i] in data)) {
                data = data[path[i]];
            } else {
                data = undefined;
                break;
            }
        }
        return data;
    },

    /**
    Applies a schema to an array of data located in a JSON structure, returning
    a normalized object with results in the `results` property. Additional
    information can be parsed out of the JSON for inclusion in the `meta`
    property of the response object.  If an error is encountered during
    processing, an `error` property will be added.

    The input _data_ is expected to be an object or array.  If it is a string,
    it will be passed through `Y.JSON.parse()`.

    If _data_ contains an array of data records to normalize, specify the
    _schema.resultListLocator_ as a dot separated path string just as you would
    reference it in JavaScript.  So if your _data_ object has a record array at
    _data.response.results_, use _schema.resultListLocator_ =
    "response.results". Bracket notation can also be used for array indices or
    object properties (e.g. "response['results']");  This is called a "path
    locator"

    Field data in the result list is extracted with field identifiers in
    _schema.resultFields_.  Field identifiers are objects with the following
    properties:

      * `key`   : <strong>(required)</strong> The path locator (String)
      * `parser`: A function or the name of a function on `Y.Parsers` used
            to convert the input value into a normalized type.  Parser
            functions are passed the value as input and are expected to
            return a value.

    If no value parsing is needed, you can use path locators (strings)
    instead of field identifiers (objects) -- see example below.

    If no processing of the result list array is needed, _schema.resultFields_
    can be omitted; the `response.results` will point directly to the array.

    If the result list contains arrays, `response.results` will contain an
    array of objects with key:value pairs assuming the fields in
    _schema.resultFields_ are ordered in accordance with the data array
    values.

    If the result list contains objects, the identified _schema.resultFields_
    will be used to extract a value from those objects for the output result.

    To extract additional information from the JSON, include an array of
    path locators in _schema.metaFields_.  The collected values will be
    stored in `response.meta`.


    @example
        // Process array of arrays
        var schema = {
                resultListLocator: 'produce.fruit',
                resultFields: [ 'name', 'color' ]
            },
            data = {
                produce: {
                    fruit: [
                        [ 'Banana', 'yellow' ],
                        [ 'Orange', 'orange' ],
                        [ 'Eggplant', 'purple' ]
                    ]
                }
            };

        var response = Y.DataSchema.JSON.apply(schema, data);

        // response.results[0] is { name: "Banana", color: "yellow" }


        // Process array of objects + some metadata
        schema.metaFields = [ 'lastInventory' ];

        data = {
            produce: {
                fruit: [
                    { name: 'Banana', color: 'yellow', price: '1.96' },
                    { name: 'Orange', color: 'orange', price: '2.04' },
                    { name: 'Eggplant', color: 'purple', price: '4.31' }
                ]
            },
            lastInventory: '2011-07-19'
        };

        response = Y.DataSchema.JSON.apply(schema, data);

        // response.results[0] is { name: "Banana", color: "yellow" }
        // response.meta.lastInventory is '2001-07-19'


        // Use parsers
        schema.resultFields = [
            {
                key: 'name',
                parser: function (val) { return val.toUpperCase(); }
            },
            {
                key: 'price',
                parser: 'number' // Uses Y.Parsers.number
            }
        ];

        response = Y.DataSchema.JSON.apply(schema, data);

        // Note price was converted from a numeric string to a number
        // response.results[0] looks like { fruit: "BANANA", price: 1.96 }

    @method apply
    @param {Object} [schema] Schema to apply.  Supported configuration
        properties are:
      @param {String} [schema.resultListLocator] Path locator for the
          location of the array of records to flatten into `response.results`
      @param {Array} [schema.resultFields] Field identifiers to
          locate/assign values in the response records. See above for
          details.
      @param {Array} [schema.metaFields] Path locators to extract extra
          non-record related information from the data object.
    @param {Object|Array|String} data JSON data or its string serialization.
    @return {Object} An Object with properties `results` and `meta`
    @static
    **/
    apply: function(schema, data) {
        var data_in = data,
            data_out = { results: [], meta: {} };

        // Convert incoming JSON strings
        if (!isObject(data)) {
            try {
                data_in = Y.JSON.parse(data);
            }
            catch(e) {
                data_out.error = e;
                return data_out;
            }
        }

        if (isObject(data_in) && schema) {
            // Parse results data
            data_out = SchemaJSON._parseResults.call(this, schema, data_in, data_out);

            // Parse meta data
            if (schema.metaFields !== undefined) {
                data_out = SchemaJSON._parseMeta(schema.metaFields, data_in, data_out);
            }
        }
        else {
            data_out.error = new Error("JSON schema parse failure");
        }

        return data_out;
    },

    /**
     * Schema-parsed list of results from full data
     *
     * @method _parseResults
     * @param schema {Object} Schema to parse against.
     * @param json_in {Object} JSON to parse.
     * @param data_out {Object} In-progress parsed data to update.
     * @return {Object} Parsed data object.
     * @static
     * @protected
     */
    _parseResults: function(schema, json_in, data_out) {
        var getPath  = SchemaJSON.getPath,
            getValue = SchemaJSON.getLocationValue,
            path     = getPath(schema.resultListLocator),
            results  = path ?
                        (getValue(path, json_in) ||
                         // Fall back to treat resultListLocator as a simple key
                            json_in[schema.resultListLocator]) :
                        // Or if no resultListLocator is supplied, use the input
                        json_in;

        if (isArray(results)) {
            // if no result fields are passed in, then just take
            // the results array whole-hog Sometimes you're getting
            // an array of strings, or want the whole object, so
            // resultFields don't make sense.
            if (isArray(schema.resultFields)) {
                data_out = SchemaJSON._getFieldValues.call(this, schema.resultFields, results, data_out);
            } else {
                data_out.results = results;
            }
        } else if (schema.resultListLocator) {
            data_out.results = [];
            data_out.error = new Error("JSON results retrieval failure");
        }

        return data_out;
    },

    /**
     * Get field data values out of list of full results
     *
     * @method _getFieldValues
     * @param fields {Array} Fields to find.
     * @param array_in {Array} Results to parse.
     * @param data_out {Object} In-progress parsed data to update.
     * @return {Object} Parsed data object.
     * @static
     * @protected
     */
    _getFieldValues: function(fields, array_in, data_out) {
        var results = [],
            len = fields.length,
            i, j,
            field, key, locator, path, parser, val,
            simplePaths = [], complexPaths = [], fieldParsers = [],
            result, record;

        // First collect hashes of simple paths, complex paths, and parsers
        for (i=0; i<len; i++) {
            field = fields[i]; // A field can be a simple string or a hash
            key = field.key || field; // Find the key
            locator = field.locator || key; // Find the locator

            // Validate and store locators for later
            path = SchemaJSON.getPath(locator);
            if (path) {
                if (path.length === 1) {
                    simplePaths.push({
                        key : key,
                        path: path[0]
                    });
                } else {
                    complexPaths.push({
                        key    : key,
                        path   : path,
                        locator: locator
                    });
                }
            } else {
            }

            // Validate and store parsers for later
            //TODO: use Y.DataSchema.parse?
            parser = (isFunction(field.parser)) ?
                        field.parser :
                        Y.Parsers[field.parser + ''];

            if (parser) {
                fieldParsers.push({
                    key   : key,
                    parser: parser
                });
            }
        }

        // Traverse list of array_in, creating records of simple fields,
        // complex fields, and applying parsers as necessary
        for (i=array_in.length-1; i>=0; --i) {
            record = {};
            result = array_in[i];
            if(result) {
                // Cycle through complexLocators
                for (j=complexPaths.length - 1; j>=0; --j) {
                    path = complexPaths[j];
                    val = SchemaJSON.getLocationValue(path.path, result);
                    if (val === undefined) {
                        val = SchemaJSON.getLocationValue([path.locator], result);
                        // Fail over keys like "foo.bar" from nested parsing
                        // to single token parsing if a value is found in
                        // results["foo.bar"]
                        if (val !== undefined) {
                            simplePaths.push({
                                key:  path.key,
                                path: path.locator
                            });
                            // Don't try to process the path as complex
                            // for further results
                            complexPaths.splice(i,1);
                            continue;
                        }
                    }

                    record[path.key] = Base.parse.call(this,
                        (SchemaJSON.getLocationValue(path.path, result)), path);
                }

                // Cycle through simpleLocators
                for (j = simplePaths.length - 1; j >= 0; --j) {
                    path = simplePaths[j];
                    // Bug 1777850: The result might be an array instead of object
                    record[path.key] = Base.parse.call(this,
                            ((result[path.path] === undefined) ?
                            result[j] : result[path.path]), path);
                }

                // Cycle through fieldParsers
                for (j=fieldParsers.length-1; j>=0; --j) {
                    key = fieldParsers[j].key;
                    record[key] = fieldParsers[j].parser.call(this, record[key]);
                    // Safety net
                    if (record[key] === undefined) {
                        record[key] = null;
                    }
                }
                results[i] = record;
            }
        }
        data_out.results = results;
        return data_out;
    },

    /**
     * Parses results data according to schema
     *
     * @method _parseMeta
     * @param metaFields {Object} Metafields definitions.
     * @param json_in {Object} JSON to parse.
     * @param data_out {Object} In-progress parsed data to update.
     * @return {Object} Schema-parsed meta data.
     * @static
     * @protected
     */
    _parseMeta: function(metaFields, json_in, data_out) {
        if (isObject(metaFields)) {
            var key, path;
            for(key in metaFields) {
                if (metaFields.hasOwnProperty(key)) {
                    path = SchemaJSON.getPath(metaFields[key]);
                    if (path && json_in) {
                        data_out.meta[key] = SchemaJSON.getLocationValue(path, json_in);
                    }
                }
            }
        }
        else {
            data_out.error = new Error("JSON meta data retrieval failure");
        }
        return data_out;
    }
};

// TODO: Y.Object + mix() might be better here
Y.DataSchema.JSON = Y.mix(SchemaJSON, Base);


}, '3.16.0', {"requires": ["dataschema-base", "json"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-jsonschema', function (Y, NAME) {

/**
 * Extends DataSource with schema-parsing on JSON data.
 *
 * @module datasource
 * @submodule datasource-jsonschema
 */

/**
 * Adds schema-parsing to the DataSource Utility.
 * @class DataSourceJSONSchema
 * @extends Plugin.Base
 */
var DataSourceJSONSchema = function() {
    DataSourceJSONSchema.superclass.constructor.apply(this, arguments);
};

Y.mix(DataSourceJSONSchema, {
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
     * @value "dataSourceJSONSchema"
     */
    NAME: "dataSourceJSONSchema",

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSourceJSONSchema Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        schema: {
            //value: {}
        }
    }
});

Y.extend(DataSourceJSONSchema, Y.Plugin.Base, {
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
     * Parses raw data into a normalized response. To accommodate XHR responses,
     * will first look for data in data.responseText. Otherwise will just work
     * with data.
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
        var data = e.data && (e.data.responseText || e.data),
            schema = this.get('schema'),
            payload = e.details[0];

        payload.response = Y.DataSchema.JSON.apply.call(this, schema, data) || {
            meta: {},
            results: data
        };

        this.get("host").fire("response", payload);

        return new Y.Do.Halt("DataSourceJSONSchema plugin halted _defDataFn");
    }
});

Y.namespace('Plugin').DataSourceJSONSchema = DataSourceJSONSchema;


}, '3.16.0', {"requires": ["datasource-local", "plugin", "dataschema-json"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-xml-parse', function (Y, NAME) {

/**
 * Parse XML submodule.
 *
 * @module datatype-xml
 * @submodule datatype-xml-parse
 * @for XML
 */

Y.mix(Y.namespace("XML"), {
    /**
     * Converts data to type XMLDocument.
     *
     * @method parse
     * @param data {String} Data to convert.
     * @return {XMLDocument} XML Document.
     */
    parse: function(data) {
        var xmlDoc = null, win;
        if (typeof data === "string") {
            win = Y.config.win;
            if (win.ActiveXObject !== undefined) {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(data);            
            } else if (win.DOMParser !== undefined) {
                xmlDoc = new DOMParser().parseFromString(data, "text/xml");            
            } else if (win.Windows !== undefined) {
                xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
                xmlDoc.loadXml(data);            
            }
        }

        if (xmlDoc === null || xmlDoc.documentElement === null || xmlDoc.documentElement.nodeName === "parsererror") {
        }

        return xmlDoc;
    }
});

// Add Parsers shortcut
Y.namespace("Parsers").xml = Y.XML.parse;

Y.namespace("DataType");
Y.DataType.XML = Y.XML;


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datatype-xml-format', function (Y, NAME) {

/**
 * The Number Utility provides type-conversion and string-formatting
 * convenience methods for Numbers.
 *
 * @module datatype-xml
 * @submodule datatype-xml-format
 */

/**
 * XML provides a set of utility functions to operate against XML documents.
 *
 * @class XML
 * @static
 */
var LANG = Y.Lang;

Y.mix(Y.namespace("XML"), {
    /**
     * Converts data to type XMLDocument.
     *
     * @method format
     * @param data {XMLDocument} Data to convert.
     * @return {String} String.
     */
    format: function(data) {
        try {
            if(!LANG.isUndefined(data.getXml)) {
                return data.getXml();
            }

            if(!LANG.isUndefined(XMLSerializer)) {
                return (new XMLSerializer()).serializeToString(data);
            }
        }
        catch(e) {
            if(data && data.xml) {
                return data.xml;
            }
            else {
                return (LANG.isValue(data) && data.toString) ? data.toString() : "";
            }
        }
    }
});

Y.namespace("DataType");
Y.DataType.XML = Y.XML;


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dataschema-xml', function (Y, NAME) {

/**
Provides a DataSchema implementation which can be used to work with XML data.

@module dataschema
@submodule dataschema-xml
**/

/**
Provides a DataSchema implementation which can be used to work with XML data.

See the `apply` method for usage.

@class DataSchema.XML
@extends DataSchema.Base
@static
**/
var Lang = Y.Lang,

    okNodeType = {
        1 : true,
        9 : true,
        11: true
    },

    SchemaXML;

SchemaXML = {

    ////////////////////////////////////////////////////////////////////////////
    //
    // DataSchema.XML static methods
    //
    ////////////////////////////////////////////////////////////////////////////
    /**
    Applies a schema to an XML data tree, returning a normalized object with
    results in the `results` property. Additional information can be parsed out
    of the XML for inclusion in the `meta` property of the response object.  If
    an error is encountered during processing, an `error` property will be
    added.

    Field data in the nodes captured by the XPath in _schema.resultListLocator_
    is extracted with the field identifiers described in _schema.resultFields_.
    Field identifiers are objects with the following properties:

      * `key`    : <strong>(required)</strong> The desired property name to use
            store the retrieved value in the result object.  If `locator` is
            not specified, `key` is also used as the XPath locator (String)
      * `locator`: The XPath locator to the node or attribute within each
            result node found by _schema.resultListLocator_ containing the
            desired field data (String)
      * `parser` : A function or the name of a function on `Y.Parsers` used
            to convert the input value into a normalized type.  Parser
            functions are passed the value as input and are expected to
            return a value.
      * `schema` : Used to retrieve nested field data into an array for
            assignment as the result field value.  This object follows the same
            conventions as _schema_.

    If no value parsing or nested parsing is needed, you can use XPath locators
    (strings) instead of field identifiers (objects) -- see example below.

    `response.results` will contain an array of objects with key:value pairs.
    The keys are the field identifier `key`s, and the values are the data
    values extracted from the nodes or attributes found by the field `locator`
    (or `key` fallback).

    To extract additional information from the XML, include an array of
    XPath locators in _schema.metaFields_.  The collected values will be
    stored in `response.meta` with the XPath locator as keys.

    @example
        var schema = {
                resultListLocator: '//produce/item',
                resultFields: [
                    {
                        locator: 'name',
                        key: 'name'
                    },
                    {
                        locator: 'color',
                        key: 'color',
                        parser: function (val) { return val.toUpperCase(); }
                    }
                ]
            };

        // Assumes data like
        // <inventory>
        //   <produce>
        //     <item><name>Banana</name><color>yellow</color></item>
        //     <item><name>Orange</name><color>orange</color></item>
        //     <item><name>Eggplant</name><color>purple</color></item>
        //   </produce>
        // </inventory>

        var response = Y.DataSchema.JSON.apply(schema, data);

        // response.results[0] is { name: "Banana", color: "YELLOW" }

    @method apply
    @param {Object} schema Schema to apply.  Supported configuration
        properties are:
      @param {String} [schema.resultListLocator] XPath locator for the
          XML nodes that contain the data to flatten into `response.results`
      @param {Array} [schema.resultFields] Field identifiers to
          locate/assign values in the response records. See above for
          details.
      @param {Array} [schema.metaFields] XPath locators to extract extra
          non-record related information from the XML data
    @param {XMLDocument} data XML data to parse
    @return {Object} An Object with properties `results` and `meta`
    @static
    **/
    apply: function(schema, data) {
        var xmldoc = data, // unnecessary variables
            data_out = { results: [], meta: {} };

        if (xmldoc && okNodeType[xmldoc.nodeType] && schema) {
            // Parse results data
            data_out = SchemaXML._parseResults(schema, xmldoc, data_out);

            // Parse meta data
            data_out = SchemaXML._parseMeta(schema.metaFields, xmldoc, data_out);
        } else {
            data_out.error = new Error("XML schema parse failure");
        }

        return data_out;
    },

    /**
     * Get an XPath-specified value for a given field from an XML node or document.
     *
     * @method _getLocationValue
     * @param field {String | Object} Field definition.
     * @param context {Object} XML node or document to search within.
     * @return {Object} Data value or null.
     * @static
     * @protected
     */
    _getLocationValue: function(field, context) {
        var locator = field.locator || field.key || field,
            xmldoc = context.ownerDocument || context,
            result, res, value = null;

        try {
            result = SchemaXML._getXPathResult(locator, context, xmldoc);
            while ((res = result.iterateNext())) {
                value = res.textContent || res.value || res.text || res.innerHTML || res.innerText || null;
            }

            // FIXME: Why defer to a method that is mixed into this object?
            // DSchema.Base is mixed into DSchema.XML (et al), so
            // DSchema.XML.parse(...) will work.  This supports the use case
            // where DSchema.Base.parse is changed, and that change is then
            // seen by all DSchema.* implementations, but does not support the
            // case where redefining DSchema.XML.parse changes behavior. In
            // fact, DSchema.XML.parse is never even called.
            return Y.DataSchema.Base.parse.call(this, value, field);
        } catch (e) {
        }

        return null;
    },

    /**
     * Fetches the XPath-specified result for a given location in an XML node
     * or document.
     *
     * @method _getXPathResult
     * @param locator {String} The XPath location.
     * @param context {Object} XML node or document to search within.
     * @param xmldoc {Object} XML document to resolve namespace.
     * @return {Object} Data collection or null.
     * @static
     * @protected
     */
    _getXPathResult: function(locator, context, xmldoc) {
        // Standards mode
        if (! Lang.isUndefined(xmldoc.evaluate)) {
            return xmldoc.evaluate(locator, context, xmldoc.createNSResolver(context.ownerDocument ? context.ownerDocument.documentElement : context.documentElement), 0, null);

        }
        // IE mode
        else {
            var values=[], locatorArray = locator.split(/\b\/\b/), i=0, l=locatorArray.length, location, subloc, m, isNth;

            // XPath is supported
            try {
                // this fixes the IE 5.5+ issue where childnode selectors begin at 0 instead of 1
                try {
                   xmldoc.setProperty("SelectionLanguage", "XPath");
                } catch (e) {}

                values = context.selectNodes(locator);
            }
            // Fallback for DOM nodes and fragments
            catch (e) {
                // Iterate over each locator piece
                for (; i<l && context; i++) {
                    location = locatorArray[i];

                    // grab nth child []
                    if ((location.indexOf("[") > -1) && (location.indexOf("]") > -1)) {
                        subloc = location.slice(location.indexOf("[")+1, location.indexOf("]"));
                        //XPath is 1-based while DOM is 0-based
                        subloc--;
                        context = context.children[subloc];
                        isNth = true;
                    }
                    // grab attribute value @
                    else if (location.indexOf("@") > -1) {
                        subloc = location.substr(location.indexOf("@"));
                        context = subloc ? context.getAttribute(subloc.replace('@', '')) : context;
                    }
                    // grab that last instance of tagName
                    else if (-1 < location.indexOf("//")) {
                        subloc = context.getElementsByTagName(location.substr(2));
                        context = subloc.length ? subloc[subloc.length - 1] : null;
                    }
                    // find the last matching location in children
                    else if (l != i + 1) {
                        for (m=context.childNodes.length-1; 0 <= m; m-=1) {
                            if (location === context.childNodes[m].tagName) {
                                context = context.childNodes[m];
                                m = -1;
                            }
                        }
                    }
                }

                if (context) {
                    // attribute
                    if (Lang.isString(context)) {
                        values[0] = {value: context};
                    }
                    // nth child
                    else if (isNth) {
                        values[0] = {value: context.innerHTML};
                    }
                    // all children
                    else {
                        values = Y.Array(context.childNodes, 0, true);
                    }
                }
            }

            // returning a mock-standard object for IE
            return {
                index: 0,

                iterateNext: function() {
                    if (this.index >= this.values.length) {return undefined;}
                    var result = this.values[this.index];
                    this.index += 1;
                    return result;
                },

                values: values
            };
        }
    },

    /**
     * Schema-parsed result field.
     *
     * @method _parseField
     * @param field {String | Object} Required. Field definition.
     * @param result {Object} Required. Schema parsed data object.
     * @param context {Object} Required. XML node or document to search within.
     * @static
     * @protected
     */
    _parseField: function(field, result, context) {
        var key = field.key || field,
            parsed;

        if (field.schema) {
            parsed = { results: [], meta: {} };
            parsed = SchemaXML._parseResults(field.schema, context, parsed);

            result[key] = parsed.results;
        } else {
            result[key] = SchemaXML._getLocationValue(field, context);
        }
    },

    /**
     * Parses results data according to schema
     *
     * @method _parseMeta
     * @param xmldoc_in {Object} XML document parse.
     * @param data_out {Object} In-progress schema-parsed data to update.
     * @return {Object} Schema-parsed data.
     * @static
     * @protected
     */
    _parseMeta: function(metaFields, xmldoc_in, data_out) {
        if(Lang.isObject(metaFields)) {
            var key,
                xmldoc = xmldoc_in.ownerDocument || xmldoc_in;

            for(key in metaFields) {
                if (metaFields.hasOwnProperty(key)) {
                    data_out.meta[key] = SchemaXML._getLocationValue(metaFields[key], xmldoc);
                }
            }
        }
        return data_out;
    },

    /**
     * Schema-parsed result to add to results list.
     *
     * @method _parseResult
     * @param fields {Array} Required. A collection of field definition.
     * @param context {Object} Required. XML node or document to search within.
     * @return {Object} Schema-parsed data.
     * @static
     * @protected
     */
    _parseResult: function(fields, context) {
        var result = {}, j;

        // Find each field value
        for (j=fields.length-1; 0 <= j; j--) {
            SchemaXML._parseField(fields[j], result, context);
        }

        return result;
    },

    /**
     * Schema-parsed list of results from full data
     *
     * @method _parseResults
     * @param schema {Object} Schema to parse against.
     * @param context {Object} XML node or document to parse.
     * @param data_out {Object} In-progress schema-parsed data to update.
     * @return {Object} Schema-parsed data.
     * @static
     * @protected
     */
    _parseResults: function(schema, context, data_out) {
        if (schema.resultListLocator && Lang.isArray(schema.resultFields)) {
            var xmldoc = context.ownerDocument || context,
                fields = schema.resultFields,
                results = [],
                node, nodeList, i=0;

            if (schema.resultListLocator.match(/^[:\-\w]+$/)) {
                nodeList = context.getElementsByTagName(schema.resultListLocator);

                // loop through each result node
                for (i = nodeList.length - 1; i >= 0; --i) {
                    results[i] = SchemaXML._parseResult(fields, nodeList[i]);
                }
            } else {
                nodeList = SchemaXML._getXPathResult(schema.resultListLocator, context, xmldoc);

                // loop through the nodelist
                while ((node = nodeList.iterateNext())) {
                    results[i] = SchemaXML._parseResult(fields, node);
                    i += 1;
                }
            }

            if (results.length) {
                data_out.results = results;
            } else {
                data_out.error = new Error("XML schema result nodes retrieval failure");
            }
        }
        return data_out;
    }
};

Y.DataSchema.XML = Y.mix(SchemaXML, Y.DataSchema.Base);


}, '3.16.0', {"requires": ["dataschema-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('datasource-xmlschema', function (Y, NAME) {

/**
 * Extends DataSource with schema-parsing on XML data.
 *
 * @module datasource
 * @submodule datasource-xmlschema
 */

/**
 * Adds schema-parsing to the DataSource Utility.
 * @class DataSourceXMLSchema
 * @extends Plugin.Base
 */
var DataSourceXMLSchema = function() {
    DataSourceXMLSchema.superclass.constructor.apply(this, arguments);
};

Y.mix(DataSourceXMLSchema, {
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
     * @value "dataSourceXMLSchema"
     */
    NAME: "dataSourceXMLSchema",

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSourceXMLSchema Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {
        schema: {
            //value: {}
        }
    }
});

Y.extend(DataSourceXMLSchema, Y.Plugin.Base, {
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
            // TODO: Do I need to sniff for DS.IO + responseXML.nodeType 9?
            data = Y.XML.parse(e.data.responseText) || e.data;

        payload.response = Y.DataSchema.XML.apply.call(this, schema, data) || {
            meta: {},
            results: data
        };

        this.get("host").fire("response", payload);

        return new Y.Do.Halt("DataSourceXMLSchema plugin halted _defDataFn");
    }
});

Y.namespace('Plugin').DataSourceXMLSchema = DataSourceXMLSchema;


}, '3.16.0', {"requires": ["datasource-local", "plugin", "datatype-xml", "dataschema-xml"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('dataschema-array', function (Y, NAME) {

/**
 * Provides a DataSchema implementation which can be used to work with data
 * stored in arrays.
 *
 * @module dataschema
 * @submodule dataschema-array
 */

/**
Provides a DataSchema implementation which can be used to work with data
stored in arrays.

See the `apply` method below for usage.

@class DataSchema.Array
@extends DataSchema.Base
@static
**/
var LANG = Y.Lang,

    SchemaArray = {

        ////////////////////////////////////////////////////////////////////////
        //
        // DataSchema.Array static methods
        //
        ////////////////////////////////////////////////////////////////////////

        /**
        Applies a schema to an array of data, returning a normalized object
        with results in the `results` property. The `meta` property of the
        response object is present for consistency, but is assigned an empty
        object.  If the input data is absent or not an array, an `error`
        property will be added.

        The input array is expected to contain objects, arrays, or strings.

        If _schema_ is not specified or _schema.resultFields_ is not an array,
        `response.results` will be assigned the input array unchanged.

        When a _schema_ is specified, the following will occur:

        If the input array contains strings, they will be copied as-is into the
        `response.results` array.

        If the input array contains arrays, `response.results` will contain an
        array of objects with key:value pairs assuming the fields in
        _schema.resultFields_ are ordered in accordance with the data array
        values.

        If the input array contains objects, the identified
        _schema.resultFields_ will be used to extract a value from those
        objects for the output result.

        _schema.resultFields_ field identifiers are objects with the following properties:

          * `key`   : <strong>(required)</strong> The locator name (String)
          * `parser`: A function or the name of a function on `Y.Parsers` used
                to convert the input value into a normalized type.  Parser
                functions are passed the value as input and are expected to
                return a value.

        If no value parsing is needed, you can use strings as identifiers
        instead of objects (see example below).

        @example
            // Process array of arrays
            var schema = { resultFields: [ 'fruit', 'color' ] },
                data = [
                    [ 'Banana', 'yellow' ],
                    [ 'Orange', 'orange' ],
                    [ 'Eggplant', 'purple' ]
                ];

            var response = Y.DataSchema.Array.apply(schema, data);

            // response.results[0] is { fruit: "Banana", color: "yellow" }


            // Process array of objects
            data = [
                { fruit: 'Banana', color: 'yellow', price: '1.96' },
                { fruit: 'Orange', color: 'orange', price: '2.04' },
                { fruit: 'Eggplant', color: 'purple', price: '4.31' }
            ];

            response = Y.DataSchema.Array.apply(schema, data);

            // response.results[0] is { fruit: "Banana", color: "yellow" }


            // Use parsers
            schema.resultFields = [
                {
                    key: 'fruit',
                    parser: function (val) { return val.toUpperCase(); }
                },
                {
                    key: 'price',
                    parser: 'number' // Uses Y.Parsers.number
                }
            ];

            response = Y.DataSchema.Array.apply(schema, data);

            // Note price was converted from a numeric string to a number
            // response.results[0] looks like { fruit: "BANANA", price: 1.96 }

        @method apply
        @param {Object} [schema] Schema to apply.  Supported configuration
            properties are:
          @param {Array} [schema.resultFields] Field identifiers to
              locate/assign values in the response records. See above for
              details.
        @param {Array} data Array data.
        @return {Object} An Object with properties `results` and `meta`
        @static
        **/
        apply: function(schema, data) {
            var data_in = data,
                data_out = {results:[],meta:{}};

            if(LANG.isArray(data_in)) {
                if(schema && LANG.isArray(schema.resultFields)) {
                    // Parse results data
                    data_out = SchemaArray._parseResults.call(this, schema.resultFields, data_in, data_out);
                }
                else {
                    data_out.results = data_in;
                }
            }
            else {
                data_out.error = new Error("Array schema parse failure");
            }

            return data_out;
        },

        /**
         * Schema-parsed list of results from full data
         *
         * @method _parseResults
         * @param fields {Array} Schema to parse against.
         * @param array_in {Array} Array to parse.
         * @param data_out {Object} In-progress parsed data to update.
         * @return {Object} Parsed data object.
         * @static
         * @protected
         */
        _parseResults: function(fields, array_in, data_out) {
            var results = [],
                result, item, type, field, key, value, i, j;

            for(i=array_in.length-1; i>-1; i--) {
                result = {};
                item = array_in[i];
                type = (LANG.isObject(item) && !LANG.isFunction(item)) ? 2 : (LANG.isArray(item)) ? 1 : (LANG.isString(item)) ? 0 : -1;
                if(type > 0) {
                    for(j=fields.length-1; j>-1; j--) {
                        field = fields[j];
                        key = (!LANG.isUndefined(field.key)) ? field.key : field;
                        value = (!LANG.isUndefined(item[key])) ? item[key] : item[j];
                        result[key] = Y.DataSchema.Base.parse.call(this, value, field);
                    }
                }
                else if(type === 0) {
                    result = item;
                }
                else {
                    //TODO: null or {}?
                    result = null;
                }
                results[i] = result;
            }
            data_out.results = results;

            return data_out;
        }
    };

Y.DataSchema.Array = Y.mix(SchemaArray, Y.DataSchema.Base);


}, '3.16.0', {"requires": ["dataschema-base"]});
