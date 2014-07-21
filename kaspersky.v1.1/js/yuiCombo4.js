/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-marker', function (Y, NAME) {

/**
 * Provides functionality for creating a marker series.
 *
 * @module charts
 * @submodule series-marker
 */
/**
 * The MarkerSeries class renders quantitative data by plotting relevant data points
 * on a graph.
 *
 * @class MarkerSeries
 * @extends CartesianSeries
 * @uses Plots
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-marker
 */
Y.MarkerSeries = Y.Base.create("markerSeries", Y.CartesianSeries, [Y.Plots], {
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



}, '3.16.0', {"requires": ["series-cartesian", "series-plot-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-fill-util', function (Y, NAME) {

/**
 * Provides functionality for drawing fills in a series.
 *
 * @module charts
 * @submodule series-fill-util
 */
var Y_Lang = Y.Lang;

/**
 * Utility class used for drawing area fills.
 *
 * @class Fills
 * @constructor
 * @submodule series-fill-util
 */
function Fills() {}

Fills.ATTRS = {
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
            path = this.get("graphic").addShape({type:"path"});
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
            seriesCollection = this.get("seriesTypeCollection"),
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
        var coords = direction === "vertical" ? "stackedXCoords" : "stackedYCoords",
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
        if(direction === "vertical")
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
            direction = this.get("direction"),
            seriesCollection = this.get("seriesTypeCollection"),
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
        if(direction === "vertical")
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
        if(previousXCoords &&
            previousXCoords.length > 0 &&
            previousSeriesLastValidIndex > firstValidIndex &&
            previousSeriesFirstValidIndex < lastValidIndex)
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


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-area', function (Y, NAME) {

/**
 * Provides functionality for creating a area series.
 *
 * @module charts
 * @submodule series-area
 */
/**
 * The AreaSeries class renders quantitative data on a graph by creating a fill between 0
 * and the relevant data points.
 *
 * @class AreaSeries
 * @extends CartesianSeries
 * @uses Fills
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-area
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








}, '3.16.0', {"requires": ["series-cartesian", "series-fill-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-curve-util', function (Y, NAME) {

/**
 * Provides functionality for drawing curves in a series.
 *
 * @module charts
 * @submodule series-curve-util
 */
/**
 * Utility class used for calculating curve points.
 *
 * @class CurveUtil
 * @constructor
 * @submodule series-curve-util
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
			outpoints.push({
                startx: Math.round(xcoords[i]),
                starty: Math.round(ycoords[i]),
                endx: Math.round(xcoords[i+1]),
                endy: Math.round(ycoords[i+1])
            });
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


}, '3.16.0');
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-spline', function (Y, NAME) {

/**
 * Provides functionality for creating a spline series.
 *
 * @module charts
 * @submodule series-spline
 */
/**
 * SplineSeries renders a graph with data points connected by a curve.
 *
 * @class SplineSeries
 * @extends LineSeries
 * @uses CurveUtil
 * @uses Lines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-spline
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








}, '3.16.0', {"requires": ["series-line", "series-curve-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-histogram-base', function (Y, NAME) {

/**
 * Provides core functionality for creating a bar or column series.
 *
 * @module charts
 * @submodule series-histogram
 */
var Y_Lang = Y.Lang;

/**
 * Histogram is the base class for Column and Bar series.
 *
 * @class Histogram
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-histogram
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
        var style = this._copyObject(this.get("styles").marker),
            graphic = this.get("graphic"),
            setSize,
            calculatedSize,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            seriesTypeCollection = this.get("seriesTypeCollection"),
            seriesLen = seriesTypeCollection ? seriesTypeCollection.length : 0,
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
        if(this.get("direction") === "vertical")
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
        this._maxSize = graphic.get(setSizeKey);
        if(seriesTypeCollection && seriesLen > 1)
        {
            for(; i < seriesLen; ++i)
            {
                renderer = seriesTypeCollection[i];
                seriesSize += renderer.get("styles").marker[setSizeKey];
                if(order > i)
                {
                    offset = seriesSize;
                }
            }
            totalSize = len * seriesSize;
            if(totalSize > this._maxSize)
            {
                ratio = graphic.get(setSizeKey)/totalSize;
                seriesSize *= ratio;
                offset *= ratio;
                setSize *= ratio;
                setSize = Math.max(setSize, 1);
                this._maxSize = setSize;
            }
        }
        else
        {
            seriesSize = style[setSizeKey];
            totalSize = len * seriesSize;
            if(totalSize > this._maxSize)
            {
                seriesSize = this._maxSize/len;
                this._maxSize = seriesSize;
            }
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
            if(!groupMarkers && (isNaN(xcoords[i]) || isNaN(ycoords[i])))
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


}, '3.16.0', {"requires": ["series-cartesian", "series-plot-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-column', function (Y, NAME) {

/**
 * Provides functionality for creating a column series.
 *
 * @module charts
 * @submodule series-column
 */
/**
 * The ColumnSeries class renders columns positioned horizontally along a category or time axis. The columns'
 * lengths are proportional to the values they represent along a vertical axis.
 * and the relevant data points.
 *
 * @class ColumnSeries
 * @extends MarkerSeries
 * @uses Histogram
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-column
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
            var styles = this._copyObject(this.get("styles").marker),
                markerStyles,
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                markers,
                seriesStyles,
                seriesCollection = this.get("seriesTypeCollection"),
                seriesLen = seriesCollection ? seriesCollection.length : 0,
                seriesSize = 0,
                offset = 0,
                renderer,
                n = 0,
                xs = [],
                order = this.get("order"),
                config;
            markerStyles = state === "off" || !styles[state] ? this._copyObject(styles) : this._copyObject(styles[state]);
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


}, '3.16.0', {"requires": ["series-marker", "series-histogram-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-bar', function (Y, NAME) {

/**
 * Provides functionality for creating a bar series.
 *
 * @module charts
 * @submodule series-bar
 */
/**
 * The BarSeries class renders bars positioned vertically along a category or time axis. The bars'
 * lengths are proportional to the values they represent along a horizontal axis.
 * and the relevant data points.
 *
 * @class BarSeries
 * @extends MarkerSeries
 * @uses Histogram
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-bar
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
            var styles = this._copyObject(this.get("styles").marker),
                markerStyles,
                state = this._getState(type),
                xcoords = this.get("xcoords"),
                ycoords = this.get("ycoords"),
                marker = this._markers[i],
                markers,
                seriesCollection = this.get("seriesTypeCollection"),
                seriesLen = seriesCollection ? seriesCollection.length : 0,
                seriesStyles,
                seriesSize = 0,
                offset = 0,
                renderer,
                n = 0,
                ys = [],
                order = this.get("order"),
                config;
            markerStyles = state === "off" || !styles[state] ? styles : styles[state];
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


}, '3.16.0', {"requires": ["series-marker", "series-histogram-base"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-areaspline', function (Y, NAME) {

/**
 * Provides functionality for creating an areaspline series.
 *
 * @module charts
 * @submodule series-areaspline
 */
/**
 * AreaSplineSeries renders an area graph with data points connected by a curve.
 *
 * @class AreaSplineSeries
 * @extends AreaSeries
 * @uses CurveUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-areaspline
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



}, '3.16.0', {"requires": ["series-area", "series-curve-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-combo', function (Y, NAME) {

/**
 * Provides functionality for creating a combo series.
 *
 * @module charts
 * @submodule series-combo
 */
/**
 * The ComboSeries class renders a combination of lines, plots and area fills in a single series.
 * Each series type has a corresponding boolean attribute indicating if it is rendered. By default,
 * lines and plots are rendered and area is not.
 *
 * @class ComboSeries
 * @extends CartesianSeries
 * @uses Fills
 * @uses Lines
 * @uses Plots
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-combo
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








}, '3.16.0', {"requires": ["series-cartesian", "series-line-util", "series-plot-util", "series-fill-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-combospline', function (Y, NAME) {

/**
 * Provides functionality for creating a combospline series.
 *
 * @module charts
 * @submodule series-combospline
 */
/**
 * The ComboSplineSeries class renders a combination of splines, plots and areaspline fills in a single series. Each
 * series type has a corresponding boolean attribute indicating if it is rendered. By default, splines and plots
 * are rendered and areaspline is not.
 *
 * @class ComboSplineSeries
 * @extends ComboSeries
 * @uses CurveUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-combospline
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


}, '3.16.0', {"requires": ["series-combo", "series-curve-util"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating stacked series.
 *
 * @module charts
 * @submodule series-stacked
 */
var Y_Lang = Y.Lang;

/**
 * Utility class used for creating stacked series.
 *
 * @module charts
 * @class StackingUtil
 * @constructor
 * @submodule series-stacked
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
        if(this.get("direction") === "vertical")
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
            seriesCollection = this.get("seriesTypeCollection"),
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
            graphic = this.get("graphic"),
            h = graphic.get("height"),
            seriesCollection = this.get("seriesTypeCollection"),
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


}, '3.16.0', {"requires": ["axis-stacked"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-line-stacked', function (Y, NAME) {

/**
 * Provides functionality for creatiing a stacked line series.
 *
 * @module charts
 * @submodule series-line-stacked
 */
/**
 * StackedLineSeries creates line graphs in which the different series are stacked along a value axis
 * to indicate their contribution to a cumulative total.
 *
 * @class StackedLineSeries
 * @constructor
 * @extends  LineSeries
 * @uses StackingUtil
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-line-stacked
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


}, '3.16.0', {"requires": ["series-stacked", "series-line"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-marker-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked marker series.
 *
 * @module charts
 * @submodule series-marker-stacked
 */
/**
 * StackedMarkerSeries plots markers with different series stacked along the value axis to indicate each
 * series' contribution to a cumulative total.
 *
 * @class StackedMarkerSeries
 * @constructor
 * @extends MarkerSeries
 * @uses StackingUtil
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-marker-stacked
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



}, '3.16.0', {"requires": ["series-stacked", "series-marker"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-area-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked area series.
 *
 * @module charts
 * @submodule series-area-stacked
 */
/**
 * StackedAreaSeries area fills to display data showing its contribution to a whole.
 *
 * @class StackedAreaSeries
 * @extends AreaSeries
 * @uses StackingUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-area-stacked
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


}, '3.16.0', {"requires": ["series-stacked", "series-area"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-spline-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked spline series.
 *
 * @module charts
 * @submodule series-spline-stacked
 */
/**
 * StackedSplineSeries creates spline graphs in which the different series are stacked along a value axis
 * to indicate their contribution to a cumulative total.
 *
 * @class StackedSplineSeries
 * @constructor
 * @extends SplineSeries
 * @uses StackingUtil
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-spline-stacked
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



}, '3.16.0', {"requires": ["series-stacked", "series-spline"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-column-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked column series.
 *
 * @module charts
 * @submodule series-column-stacked
 */
var Y_Lang = Y.Lang;

/**
 * The StackedColumnSeries renders column chart in which series are stacked vertically to show
 * their contribution to the cumulative total.
 *
 * @class StackedColumnSeries
 * @extends ColumnSeries
 * @uses StackingUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-column-stacked
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
            style = this._copyObject(this.get("styles").marker),
            w = style.width,
            h = style.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            seriesCollection = this.get("seriesTypeCollection"),
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
            ratio = this.get("width")/totalWidth;
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
            markerStyles = state === "off" || !styles[state] ? this._copyObject(styles) : this._copyObject(styles[state]);
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



}, '3.16.0', {"requires": ["series-stacked", "series-column"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-bar-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked bar series.
 *
 * @module charts
 * @submodule series-bar-stacked
 */
var Y_Lang = Y.Lang;

/**
 * The StackedBarSeries renders bar chart in which series are stacked horizontally to show
 * their contribution to the cumulative total.
 *
 * @class StackedBarSeries
 * @extends BarSeries
 * @uses StackingUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-bar-stacked
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
            style = this._copyObject(this.get("styles").marker),
            w = style.width,
            h = style.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i = 0,
            len = xcoords.length,
            top = ycoords[0],
            seriesCollection = this.get("seriesTypeCollection"),
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
            ratio = this.get("height")/totalHeight;
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
                markerStyles = state === "off" || !styles[state] ? this._copyObject(styles) : this._copyObject(styles[state]),
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



}, '3.16.0', {"requires": ["series-stacked", "series-bar"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-areaspline-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked area spline series.
 *
 * @module charts
 * @submodule series-areaspline-stacked
 */
/**
 * StackedAreaSplineSeries creates a stacked area chart with points data points connected by a curve.
 *
 * @class StackedAreaSplineSeries
 * @extends AreaSeries
 * @uses CurveUtil
 * @uses StackingUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-areaspline-stacked
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



}, '3.16.0', {"requires": ["series-stacked", "series-areaspline"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-combo-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked combo series.
 *
 * @module charts
 * @submodule series-combo-stacked
 */
/**
 * The StackedComboSeries class renders a combination of lines, plots and area fills in a single series. Series
 * are stacked along the value axis to indicate each series contribution to a cumulative total. Each
 * series type has a corresponding boolean attribute indicating if it is rendered. By default, all three types are
 * rendered.
 *
 * @class StackedComboSeries
 * @extends ComboSeries
 * @uses StackingUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-combo-stacked
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


}, '3.16.0', {"requires": ["series-stacked", "series-combo"]});
/*
YUI 3.16.0 (build 76f0e08)
Copyright 2014 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add('series-combospline-stacked', function (Y, NAME) {

/**
 * Provides functionality for creating a stacked combospline series.
 *
 * @module charts
 * @submodule series-combospline-stacked
 */
/**
 * The StackedComboSplineSeries class renders a combination of splines, plots and areaspline fills in a single series. Series
 * are stacked along the value axis to indicate each series contribution to a cumulative total. Each
 * series type has a corresponding boolean attribute indicating if it is rendered. By default, all three types are
 * rendered.
 *
 * @class StackedComboSplineSeries
 * @extends StackedComboSeries
 * @uses CurveUtil
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-combospline-stacked
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


}, '3.16.0', {"requires": ["series-combo-stacked", "series-curve-util"]});
