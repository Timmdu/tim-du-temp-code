(function () {
    'use strict';

    var Common = require('../../common/common.entry.js');
    var isNullOrUndefined = Common._Types._isNullOrUndefined;

    var _ColorHelper = Common._ColorHelper;
    var getLighterColor = _ColorHelper._getLighterColor;
    var parseColor = _ColorHelper._fromString;
    var ArrayHelper = Common._ArrayHelper;
    var ArrayHelper_indexOf = ArrayHelper._indexOf;

    var exports = {};
    var __invalidValuePlaceHolder = exports.__invalidValuePlaceHolder = {};

    var keyword_null = null, keyword_undefined = void 0, Math_floor = Math.floor, Math_PI = Math.PI,
        Math_sin = Math.sin,
        Math_cos = Math.cos, Math_min = Math.min, Math_max = Math.max, Math_round = Math.round, Math_pow = Math.pow,
        Math_sqrt = Math.sqrt, Math_abs = Math.abs, Math_ceil = Math.ceil, const_undefined = 'undefined',
        const_string = 'string';
    var isNotANumber = isNaN;
    var convertFloat = parseFloat;
    var NUMBER_MAX_VALUE = Number.MAX_VALUE;
    var DEFAULT_COLOR1 = '#969696';
    var DEFAULT_COLOR2 = '#CB0000';
    var DEFAULT_COLOR3 = '#646464';
    var DEFAULT_COLOR4 = '#DCDCDC';
    var WHITE_COLOR = 'white';
    var BLACK_COLOR = 'black';
    var BLUE_COLOR = 'blue';
    var GREEN_COLOR = 'green';
    var RED_COLOR = 'red';
    var LEFT_ALIGN = 'left';
    var RIGHT_ALIGN = 'right';
    var CENTER_ALIGN = 'center';
    var TOP_ALIGN = 'top';
    var BOTTOM_ALIGN = 'bottom';
    var MIDDLE_ALIGN = 'middle';
    var PX_ARIAL = 'px Arial';

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Rect(x, y, width, height) {
        var self = this;
        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
    }

    function getMinOrMax(array, isMin) {
        var t = array[0];
        var r = t && t.value ? t.value : t, temp;
        for (var i = 1, length = array.length; i < length; i++) {
            t = array[i];
            temp = t && t.value ? t.value : t;
            if (isMin && r > temp || !isMin && r < temp) {
                r = temp;
            }
        }
        return r;
    }

    function drawLine(context, x1, y1, x2, y2, strokeStyle, lineWidth) {
        if (strokeStyle) {
            context.strokeStyle = strokeStyle;
        }
        if (lineWidth) {
            context.lineWidth = lineWidth;
        }

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    function drawLines(context, condition, x1, y1, x2, y2, x3, y3, x4, y4, strokeStyle, lineWidth) { /* NOSONAR: ExcessiveParameterList */
        if (condition) {
            drawLine(context, x1, y1, x2, y2, strokeStyle, lineWidth);
        } else {
            drawLine(context, x3, y3, x4, y4, strokeStyle, lineWidth);
        }
    }

    function getTextColor(backColor) {
        if (_ColorHelper._getBrightness(_ColorHelper._fromString(backColor)) < 255 / 2) {
            return WHITE_COLOR;
        }
        return BLACK_COLOR;
    }

    function getPlotRect(x, y, width, height, margin, leftOffset, vertical) {
        var rect = {};
        if (vertical) {
            rect.left = y + margin + leftOffset;
            rect.width = height - 2 * margin;
            rect.top = x + margin;
            rect.height = width - 2 * margin;
        } else {
            rect.left = x + margin;
            rect.width = width - 2 * margin;
            rect.top = y + margin;
            rect.height = height - 2 * margin;
        }

        return rect;
    }

    function getSum(array, condition) {
        var sum = 0;
        for (var i = 0, len = array.length; i < len; i++) {
            sum += (condition && !condition(array[i])) ? 0 : array[i];
        }
        return sum;
    }

    function fixValues(values, condition, getValue, processValues) {
        var newValues = [], temp;
        for (var i = 0, j = 0, length = values.length; i < length; i++) {
            if (condition) {
                if (condition(values[i])) {
                    newValues[j++] = getValue ? getValue(values[i]) : values[i];
                } else {            // Fix bug 207953, invalid value is treated as 0 here.
                    newValues[j++] = 0;
                }
            } else {
                temp = convertFloat(values[i]);
                if (!isNotANumber(temp) && isFinite(temp)) {
                    newValues[j++] = temp;
                }
            }
        }
        if (processValues) {
            processValues(newValues);
        }

        return newValues;
    }

    function paintRect(ctx, x, y, width, height, fillStyle) {
        var endX = Math_round(x + width), endY = Math_round(y + height);
        x = Math_round(x);
        y = Math_round(y);
        width = Math_round(endX - x);
        height = Math_round(endY - y);

        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, width, height);
        ctx.fill();
    }

    function adjustValue(value, max, min) {
        value = Math_min(value, max);
        value = Math_max(value, min);
        return value;
    }

    function clipContext(context, x, y, width, height) {
        context.save();
        context.rect(x, y, width, height);
        context.clip();
    }

    // <editor-folder desc="PieSparkline">
    function pieSparkline_paint(context, value, x, y, width, height) {
        var centerX = x + width / 2, centerY = y + height / 2, margin = 5,
            radius = Math_min(width, height) / 2 - margin,
            fromAngle = -0.5 * Math_PI, toAngle, XOnCircle = centerX + radius * Math_cos(fromAngle),
            YOnCircle = centerY + radius * Math_sin(fromAngle), XOnCircleCacheArray = [], YOnCircleCacheArray = [];
        if (radius <= 0) {
            return;
        }
        var values = fixValues(value.values,
            function (v) {
                return !isNullOrUndefined(v) && !isNotANumber(v) && isFinite(v);
            },
            function (v) {
                return Math_abs(v);
            },
            function (needFixedValues) {
                if (needFixedValues.length === 1) {
                    needFixedValues[1] = 1 - needFixedValues[0];
                }
            });
        var length = values.length, colors = pieSparkline_fixColors(length, value.colors);
        var sum = getSum(values), i;

        context.save();
        //paint sector
        for (i = 0; i < length; i++) {
            toAngle = fromAngle + values[i] / sum * 2 * Math_PI;
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(XOnCircle, YOnCircle);
            context.arc(centerX, centerY, radius, fromAngle, toAngle, false);
            context.lineTo(centerX, centerY);
            context.fillStyle = colors[i];
            context.fill();

            XOnCircleCacheArray.push(XOnCircle);
            YOnCircleCacheArray.push(YOnCircle);

            fromAngle = toAngle;
            XOnCircle = centerX + radius * Math_cos(fromAngle);
            YOnCircle = centerY + radius * Math_sin(fromAngle);
        }
        //paint separating line
        for (i = 0; i < length; i++) { //paint line after paint sector so that line is above sector
            drawLine(context, centerX, centerY, XOnCircleCacheArray[i], YOnCircleCacheArray[i], WHITE_COLOR);
        }

        context.restore();
    }

    function pieSparkline_fixColors(valueCount, colors) {
        var newColors = [], colorCount = colors.length;
        if (valueCount <= colorCount) {
            newColors = colors.slice(0, valueCount);
        } else {
            if (colorCount === 0) {
                newColors.push('darkgray');
                colorCount = 1;
            } else {
                newColors = colors.slice(0);
            }
            var baseColors = [], color, len = valueCount - colorCount + 1, i;
            for (i = 0; i < colorCount; i++) {
                baseColors[i] = parseColor(newColors[i]);
            }
            for (i = colorCount; i < valueCount; i++) {
                color = baseColors[i % colorCount];
                for (var pro in color) {
                    if (color.hasOwnProperty(pro)) {
                        var pValue = color[pro];
                        color[pro] = Math_floor(pValue - (pValue / len) * (i / colorCount));
                    }
                }

                color.a = 255;
                newColors[i] = _ColorHelper._toString(color);
            }
        }
        return newColors;
    }

    // </editor-folder>

    // <editor-folder desc="AreaSparkline">
    function AreaPoint(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
    }

    function areaSparkline_paint(context, value, x, y, width, height) {
        context.save();
        var points = value.points, mini = value.mini, maxi = value.maxi, line1 = value.line1, line2 = value.line2,
            colorPositive = value.colorPositive, colorNegative = value.colorNegative, margin = 5,
            sngMin, sngMax, threshold, pointsCount, plotLeft, plotTop, plotWidth, plotHeight, sngIntvX, sngIntvY;
        points = fixValues(points, function (v) {
            return !isNullOrUndefined(v) && !isNotANumber(v) && isFinite(v);
        });
        colorPositive = isNullOrUndefined(colorPositive) ? '#787878' : colorPositive;
        colorNegative = isNullOrUndefined(colorNegative) ? DEFAULT_COLOR2 : colorNegative;

        var maxTag = getMinOrMax(points, false);
        maxi = isNullOrUndefined(maxi) ? maxTag : maxi;
        sngMax = Math_max(maxi, maxTag);
        var minTag = getMinOrMax(points, true);
        mini = isNullOrUndefined(mini) ? minTag : mini;
        sngMin = Math_min(mini, minTag);
        sngMin = sngMin > 0 ? 0 : sngMin;
        sngMax = sngMax < 0 ? 0 : sngMax;
        threshold = 0;
        threshold = threshold > sngMax ? sngMax : threshold;
        threshold = threshold < sngMin ? sngMin - 1 : threshold;
        pointsCount = points.length;
        var rect = getPlotRect(x, y, width, height, margin);
        plotLeft = rect.left;
        plotTop = rect.top;
        plotWidth = rect.width;
        plotHeight = rect.height;
        sngIntvX = plotWidth / (pointsCount - 1);
        sngIntvY = (sngMax - sngMin) / plotHeight;
        // paint area
        var polyArray = [], currentPoint, poly, prevPoly, thresholdX,
            thresholdY = plotTop + (sngMax - threshold) / sngIntvY,
            currentPointX, currentPointY;
        for (var i = 0; i < pointsCount; i++) {
            currentPoint = points[i];
            currentPointX = plotLeft + sngIntvX * i;
            currentPointY = plotTop + (sngMax - currentPoint) / sngIntvY;
            if (i === 0) {
                polyArray.push(new AreaPoint(currentPointX, thresholdY, threshold));
            }
            if (i > 0 && currentPoint * points[i - 1] < 0) {
                prevPoly = polyArray[polyArray.length - 1];
                if (prevPoly) {
                    thresholdX = areaSparkline_getXInStraightLine(prevPoly.x, prevPoly.y, currentPointX, currentPointY, thresholdY);
                    polyArray.push(new AreaPoint(thresholdX, thresholdY, threshold));
                }
            }
            polyArray.push(new AreaPoint(currentPointX, currentPointY, currentPoint));
            if (i === pointsCount - 1) {
                polyArray.push(new AreaPoint(currentPointX, thresholdY, threshold));
            }
        }
        context.beginPath();
        for (var k = 0, polyArrayLength = polyArray.length; k < polyArrayLength; k++) {
            poly = polyArray[k];
            if (poly) {
                if (k === 0) {
                    context.moveTo(poly.x, poly.y);
                } else {
                    context.lineTo(poly.x, poly.y);
                }
                prevPoly = polyArray[k - 1];
                if (poly.value === threshold && prevPoly) {
                    context.fillStyle = prevPoly.value > threshold ? colorPositive : colorNegative;
                    context.fill();
                    if (k !== polyArrayLength - 1) {
                        context.beginPath();
                        context.moveTo(poly.x, poly.y);
                    }
                }
            }
        }

        // paint line1
        drawAreaLine(line1);
        // paint line2
        drawAreaLine(line2);
        context.restore();

        function drawAreaLine(line) {
            if (line !== keyword_null || typeof line === const_undefined) {
                var lineValue = adjustValue(line, sngMax, sngMin);
                var adjustY = sngIntvY !== 0 ? (sngMax - lineValue) / sngIntvY : plotHeight / 2;
                var linePosition = Math_round(plotTop + adjustY) - 0.5;
                drawLine(context, plotLeft, linePosition, plotLeft + plotWidth, linePosition, BLUE_COLOR);
            }
        }
    }

    function areaSparkline_getXInStraightLine(x1, y1, x2, y2, y) {
        return ((y1 - y) * x2 + (y - y2) * x1) / (y1 - y2);
    }

    // </editor-folder>

    // <editor-folder desc="ScatterSparkline">
    function scatterSparkline_paint(context, value, xVal, yVal, width, height) {
        var points1 = value.points1, points2 = value.points2, minX = value.minX, maxX = value.maxX, minY = value.minY,
            maxY = value.maxY, hLine = value.hLine, vLine = value.vLine, xMinZone = value.xMinZone,
            xMaxZone = value.xMaxZone,
            yMinZone = value.yMinZone, yMaxZone = value.yMaxZone, tags = value.tags, drawSymbol = value.drawSymbol,
            needDrawLines = value.drawLines, color1 = value.color1, color2 = value.color2, dash = value.dash,
            symbolSize = 4,
            scatterPoints1, scatterPoints2, dblMinY, dblMaxY, dblMinX, dblMaxX, i, point, length, dblXLeft,
            dblYLeft, dblXRight, dblYRight, saveX, saveY, saveX2, saveY2, tagMinX, tagMinY, tagMaxX, tagMaxY,
            linePosition;
        var rect = getPlotRect(xVal, yVal, width, height, 5);
        var plotLeft = rect.left, plotTop = rect.top, plotWidth = rect.width, plotHeight = rect.height;
        if (!points1 || points1.length <= 0) {
            return;
        }
        scatterPoints1 = scatterSparkline_getScatterPoints(points1);
        if (scatterPoints1.length <= 0) {
            return;
        }
        if (points2 && points2.length > 0) {
            scatterPoints2 = scatterSparkline_getScatterPoints(points2);
            if (scatterPoints2.length <= 0) {
                return;
            }
        }
        clipContext(context, xVal, yVal, width, height);
        context.beginPath();
        drawSymbol = isNullOrUndefined(drawSymbol) ? true : drawSymbol;
        color1 = isNullOrUndefined(color1) ? DEFAULT_COLOR1 : color1;
        color2 = isNullOrUndefined(color2) ? DEFAULT_COLOR2 : color2;

        fixMinMaxValue(scatterPoints1, minY, maxY, minX, maxX);
        // paint zone
        if (!isNullOrUndefined(xMinZone) && !isNullOrUndefined(xMaxZone) && !isNullOrUndefined(yMinZone) &&
            !isNullOrUndefined(yMaxZone) && dblMinX <= xMinZone && xMinZone <= dblMaxX && dblMinX <= xMaxZone &&
            xMaxZone <= dblMaxX && dblMinY <= yMinZone && yMinZone <= dblMaxY && dblMinY <= yMaxZone && yMaxZone <= dblMaxY) {
            var zoneLeft = Math_max(dblMinX, xMinZone), zoneRight = Math_min(dblMaxX, xMaxZone),
                zoneBottom = Math_max(dblMinY, yMinZone), zoneTop = Math_min(dblMaxY, yMaxZone);
            if (zoneLeft >= zoneRight) {
                zoneRight = zoneLeft + 1;
            }
            if (zoneBottom >= zoneTop) {
                zoneTop = zoneBottom + 1;
            }
            paintRect(context, plotLeft + (zoneLeft - dblMinX) * plotWidth / (dblMaxX - dblMinX),
                plotTop + (dblMaxY - zoneTop) * plotHeight / (dblMaxY - dblMinY),
                (zoneRight - zoneLeft) * plotWidth / (dblMaxX - dblMinX),
                (zoneTop - zoneBottom) * plotHeight / (dblMaxY - dblMinY), DEFAULT_COLOR4);
        }
        // paint lines and symbol pf points1
        tagMinX = -NUMBER_MAX_VALUE;
        tagMinY = -NUMBER_MAX_VALUE;
        tagMaxX = NUMBER_MAX_VALUE;
        tagMaxY = NUMBER_MAX_VALUE;
        for (i = 0, length = scatterPoints1.length; i < length - 1; i++) {
            paintPoints(scatterPoints1, i, color1, strokeShape);
            if (tags) {
                if (i === 0) {
                    if (saveY > tagMinY) {
                        tagMinX = saveX;
                        tagMinY = saveY;
                    }
                    if (saveY < tagMaxY) {
                        tagMaxX = saveX;
                        tagMaxY = saveY;
                    }
                }
                if (saveY2 > tagMinY) {
                    tagMinX = saveX2;
                    tagMinY = saveY2;
                }
                if (saveY2 < tagMaxY) {
                    tagMaxX = saveX2;
                    tagMaxY = saveY2;
                }
            }
        }
        // paint lines and symbol pf points2
        if (scatterPoints2 && scatterPoints2.length > 0) {
            fixMinMaxValue(scatterPoints2, dblMinY, dblMaxY, dblMinX, dblMaxX);
            for (i = 0, length = scatterPoints2.length; i < length - 1; i++) {
                paintPoints(scatterPoints2, i, color2, strokeRect);
            }
        }
        // paint tags
        if (tags) {
            fillShape(tagMinX, tagMinY, DEFAULT_COLOR2);
            fillShape(tagMaxX, tagMaxY, '#0000FF');
        }
        // paint hLine
        if (!isNullOrUndefined(hLine) && dblMinY <= hLine && hLine <= dblMaxY) {
            linePosition = Math_round(plotTop + (dblMaxY - hLine) * plotHeight / (dblMaxY - dblMinY)) - 0.5;
            scatterSparkline_paintLine(context, plotLeft, linePosition, plotLeft + plotWidth, linePosition, DEFAULT_COLOR2);
        }
        // paint vLine
        if (!isNullOrUndefined(vLine) && dblMinX <= vLine && vLine <= dblMaxX) {
            linePosition = Math_round(plotLeft + (vLine - dblMinX) * plotWidth / (dblMaxX - dblMinX)) - 0.5;
            scatterSparkline_paintLine(context, linePosition, plotTop, linePosition, plotTop + plotHeight, DEFAULT_COLOR2);
        }
        function paintPoints(scatterPoints, index, color, drawFuncion) {
            point = scatterPoints[index];
            dblXLeft = point.x;
            dblYLeft = point.y;
            point = scatterPoints[index + 1];
            dblXRight = point.x;
            dblYRight = point.y;
            saveX = plotLeft + (dblXLeft - dblMinX) * plotWidth / (dblMaxX - dblMinX);
            saveX2 = plotLeft + (dblXRight - dblMinX) * plotWidth / (dblMaxX - dblMinX);
            saveY = plotTop + (dblMaxY - dblYLeft) * plotHeight / (dblMaxY - dblMinY);
            saveY2 = plotTop + (dblMaxY - dblYRight) * plotHeight / (dblMaxY - dblMinY);
            if (needDrawLines) {
                scatterSparkline_paintLine(context, saveX, saveY, saveX2, saveY2, color, dash);
            }
            if (drawSymbol) {
                if (index === 0) {
                    drawFuncion(saveX, saveY);
                }
                drawFuncion(saveX2, saveY2);
            }
        }

        function fixMinMaxValue(scatterPoints, y1, y2, x1, x2) {
            var minPoint = scatterSparkline_getMinOrMaxScatterPoint(scatterPoints, true);
            var maxPoint = scatterSparkline_getMinOrMaxScatterPoint(scatterPoints, false);
            dblMinY = isNullOrUndefined(minY) ? minPoint.y : y1;
            dblMaxY = isNullOrUndefined(maxY) ? maxPoint.y : y2;
            dblMinX = isNullOrUndefined(minX) ? minPoint.x : x1;
            dblMaxX = isNullOrUndefined(maxX) ? maxPoint.x : x2;
            dblMaxX = dblMinX >= dblMaxX ? dblMinX + 1 : dblMaxX;
            dblMaxY = dblMinY >= dblMaxY ? dblMinY + 1 : dblMaxY;
        }

        function fillShape(x, y, fillStyle) {
            context.beginPath();
            context.arc(x - symbolSize / 2, y - symbolSize / 2, symbolSize / 2, 0, Math_PI * 2, false);
            context.fillStyle = fillStyle;
            context.fill();
        }

        function strokeShape(x, y) {
            context.beginPath();
            context.strokeStyle = color1;
            context.arc(x - symbolSize / 2, y - symbolSize / 2, symbolSize / 2, 0, Math_PI * 2, false);
            context.stroke();
        }

        function strokeRect(x, y) {
            context.beginPath();
            context.strokeStyle = color2;
            context.strokeRect(x - symbolSize / 2, y - symbolSize / 2, symbolSize, symbolSize);
        }

        context.restore();
    }

    function scatterSparkline_getMinOrMaxScatterPoint(scatterPoints, isMin) {
        var factor = isMin ? 1 : -1;
        var coompareFn = isMin ? Math_min : Math_max;
        var value = new Point(factor * NUMBER_MAX_VALUE, factor * NUMBER_MAX_VALUE), length = scatterPoints.length,
            point;
        for (var i = 0; i < length; i++) {
            point = scatterPoints[i];
            value.x = coompareFn(value.x, point.x);
            value.y = coompareFn(value.y, point.y);
        }
        return value;
    }

    function scatterSparkline_getXInStraightLine(x1, x2, length, totalLength) {
        return length / totalLength * (x2 - x1) + x1;
    }

    function scatterSparkline_paintLine(context, startX, startY, endX, endY, color, isDashed) {
        if (isDashed) {
            var totalLength = Math_sqrt(Math_pow(endX - startX, 2) + Math_pow(endY - startY, 2)), paintedLength = 0,
                longLength = 6, shortLength = 2, intervalLength = 4; // dashed line: long interval short interval long...
            var scatterPoints = [], minX, maxX, x, y;
            if (startX <= endX) {
                minX = startX;
                maxX = endX;
                x = startX;
                y = startY;
            } else {
                minX = endX;
                maxX = startX;
                x = endX;
                y = endY;
            }
            // y = k * x + b
            var k = (endY - startY) / (endX - startX), b = startY - k * startX;
            scatterPoints.push(new Point(x, y));
            var offset = [longLength, intervalLength, shortLength, intervalLength];
            while (paintedLength < totalLength) {
                for (var i = 0, len = offset.length; i < len; i++) {
                    paintedLength += offset[i];
                    if (paintedLength <= totalLength) {
                        x = scatterSparkline_getXInStraightLine(minX, maxX, paintedLength, totalLength);
                        y = k * x + b;
                        scatterPoints.push(new Point(x, y));
                    }
                }
            }
            for (var index = 0, length = scatterPoints.length; index < length - 1; index += 2) {
                drawLine(context, scatterPoints[index].x, scatterPoints[index].y, scatterPoints[index + 1].x, scatterPoints[index + 1].y, color);
            }
        } else {
            drawLine(context, startX, startY, endX, endY, color);
        }
    }

    function scatterSparkline_getScatterPoints(points) {
        var scatterPoints = [], rowCount, colCount;
        rowCount = points.length;
        if (rowCount > 0) {
            colCount = points[0].length;
            if (rowCount < colCount) {
                if (rowCount >= 2) {
                    for (var c = 0; c < colCount; c++) {
                        scatterPoints.push(new Point(points[0][c], points[1][c]));
                    }
                }
            } else if (colCount >= 2) {
                for (var r = 0; r < rowCount; r++) {
                    scatterPoints.push(new Point(points[r][0], points[r][1]));
                }
            }
        }
        return scatterPoints;
    }

    // </editor-folder>

    // <editor-folder desc="BulletSparkline">
    function bulletSparkline_paint(context, value, x, y, width, height) {
        var measure = value.measure, target = value.target, maxi = value.maxi, good = value.good,
            bad = value.bad, forecast = value.forecast, tickUnit = value.tickUnit, colorScheme = value.colorScheme,
            vertical = value.vertical, margin = 5;
        if (isNullOrUndefined(maxi) || maxi < 0) {
            return;
        }

        measure = (isNullOrUndefined(measure) || measure < 0) ? 0 : measure;
        good = (isNullOrUndefined(good) || good < 0) ? 0 : good;
        bad = (isNullOrUndefined(bad) || bad < 0) ? 0 : bad;
        target = isNullOrUndefined(target) ? 0 : target;
        forecast = isNullOrUndefined(forecast) ? 0 : forecast;
        tickUnit = isNullOrUndefined(tickUnit) ? 0 : tickUnit;
        colorScheme = isNullOrUndefined(colorScheme) ? '#A0A0A0' : colorScheme;

        var measureBarColor = '#252525'; // color of measure bar
        if (measure > maxi) {
            measure = maxi;
            measureBarColor = DEFAULT_COLOR2;
        }
        if (good > maxi) {
            good = maxi;
            measureBarColor = DEFAULT_COLOR2;
        }
        if (bad > maxi) {
            bad = maxi;
            measureBarColor = DEFAULT_COLOR2;
        }
        if (target > maxi) {
            target = 0;
            measureBarColor = DEFAULT_COLOR2;
        }
        if (forecast > maxi) {
            forecast = maxi;
            measureBarColor = DEFAULT_COLOR2;
        }
        var rect = getPlotRect(x, y, width, height, margin, height - 2 * margin, vertical);
        var plotLeft = rect.left, plotWidth = rect.width;
        context.save();
        // maxi
        drawRect(getLighterColor(colorScheme, 1.66), 1, 1, 0.2, 0.6);
        // good
        drawRect(getLighterColor(colorScheme, 1.33), good, maxi, 0.2, 0.6);
        // bad
        drawRect(colorScheme, bad, maxi, 0.2, 0.6);
        // measure bar
        drawRect(measureBarColor, measure, maxi, 0.375, 0.25);

        // forecast
        if (forecast > 0) {
            var startForecast = plotLeft, endForecast = plotWidth * (forecast / maxi);
            if (endForecast > plotWidth) {
                endForecast = plotWidth;
            }
            drawLines(context, vertical, x + width * 0.5, startForecast, x + width * 0.5, startForecast - endForecast,
                startForecast, y + height * 0.5, startForecast + endForecast, y + height * 0.5, '#3690BF', 3);
        }
        // target
        if (target > 0) {
            var startTarget = Math_round(plotLeft - (vertical ? 1 : -1) * plotWidth * (target / maxi)) - 0.5;
            drawLines(context, vertical, x + width * 0.2, startTarget, x + width * 0.8, startTarget,
                startTarget, y + height * 0.2, startTarget, y + height * 0.8, DEFAULT_COLOR2, 1);
        }
        // ticks
        if (tickUnit > 0) {
            var numTicks = Math_floor(maxi / tickUnit), xMark;
            for (var i = 0; i <= numTicks; i++) {
                xMark = Math_round(plotLeft - (vertical ? 1 : -1) * (plotWidth / maxi * tickUnit) * i) - 0.5;
                drawLines(context, vertical, x, xMark, x + width * 0.05, xMark,
                    xMark, y + height, xMark, y + height * 0.95, DEFAULT_COLOR3, 1);
            }
        }
        context.restore();

        function drawRect(fillStyle, statusType, maxIndex, factor1, factor2) {
            // maxi
            context.fillStyle = fillStyle;
            var startGood = plotLeft, endGood = plotWidth * (statusType / maxIndex);
            if (endGood > plotWidth) {
                endGood = plotWidth;
            }
            var fillRect = vertical ? new Rect(x + width * factor1, startGood - endGood, width * factor2, endGood) : new Rect(startGood, y + height * factor1, endGood, height * factor2);
            context.fillRect(fillRect.x, fillRect.y, fillRect.width, fillRect.height);
        }
    }

    // </editor-folder>

    // <editor-folder desc="SpreadSparkline">
    function spreadSparkline_paint(context, value, x, y, width, height) {
        var spreadSparklineDataArray = value.spreadData, showAverage = value.showAverage,
            scaleStart = value.scaleStart, scaleEnd = value.scaleEnd, style = value.style,
            colorScheme = value.colorScheme,
            vertical = value.vertical, margin = 5;
        var length = spreadSparklineDataArray.length;
        if (length <= 0) {
            return;
        }
        var minKey = spreadSparklineDataArray[0].key, maxKey = spreadSparklineDataArray[length - 1].key;
        scaleStart = isNullOrUndefined(scaleStart) ? minKey : scaleStart;
        scaleEnd = isNullOrUndefined(scaleEnd) ? maxKey : scaleEnd;
        style = isNullOrUndefined(style) ? 4 : style;
        colorScheme = isNullOrUndefined(colorScheme) ? DEFAULT_COLOR3 : colorScheme;
        var rect = getPlotRect(x, y, width, height, margin, height - 2 * margin, vertical);
        var plotLeft = rect.left, plotWidth = rect.width, plotTop = rect.top, plotHeight = rect.height;
        clipContext(context, x, y, width, height);
        context.beginPath();
        context.strokeStyle = colorScheme;
        context.fillStyle = colorScheme;
        context.lineWidth = 2;
        // each point(line or dot)
        var xMark, yMark, max = getMinOrMax(spreadSparklineDataArray, false), offset;
        for (var i = 0, pointCount = spreadSparklineDataArray.length; i < pointCount; i++) {
            var p = spreadSparklineDataArray[i], pKey = p.key, pValue = p.value;
            xMark = plotLeft + (vertical ? -1 : 1) * plotWidth * (pKey - scaleStart) / (scaleEnd - scaleStart);
            if (vertical) {
                xMark = Math_min(xMark, plotLeft);
                xMark = Math_max(xMark, plotLeft - plotWidth);
            } else {
                xMark = Math_max(xMark, plotLeft);
                xMark = Math_min(xMark, plotLeft + plotWidth);
            }

            xMark = Math_round(xMark);
            if (style === 1 /* Stacked */) {
                offset = pValue / 2 * plotHeight / max;
                offset = offset < 0.5 ? 0.5 : offset;
                var lineStart = plotTop + plotHeight / 2 - offset, lineEnd = plotTop + plotHeight / 2 + offset;
                drawLines(context, vertical, lineStart, xMark, lineEnd, xMark, xMark, lineStart, xMark, lineEnd);
            } else if (style === 4 /* Poles */) {
                offset = pValue * plotHeight / max;
                offset = offset < 1 ? 1 : offset;
                drawLines(context, vertical, plotTop, xMark, plotTop + offset, xMark, xMark, plotTop + plotHeight, xMark, plotTop + plotHeight - offset);
            } else if (style === 6 /* Stripe */) {
                drawLines(context, vertical, plotTop, xMark, plotTop + plotHeight, xMark, xMark, plotTop, xMark, plotTop + plotHeight);
            } else {
                var symbolSize = 2;
                for (var j = 1; j <= pValue; j++) {
                    switch (style) {
                        case 2 /* Spread */
                        :
                            yMark = plotTop + plotHeight / 2 - margin - (pValue / 2 - j) * plotHeight / max;
                            break;
                        case 3 /* Jitter */
                        :
                            var randomOffsetArray = spreadSparkline_getRandomOffsetArray(pValue, plotHeight, symbolSize + 1, p.randomNumbers);
                            yMark = plotTop + plotHeight - margin - randomOffsetArray[j - 1];
                            break;
                        case 5 /* StackedDots */
                        :
                        default:
                            yMark = plotTop + plotHeight - j * plotHeight / max;
                            break;
                    }
                    yMark = Math_round(yMark);
                    context.beginPath();
                    context.fillRect(vertical ? yMark : xMark, vertical ? xMark : yMark, symbolSize, symbolSize);
                }
            }
        }
        // average
        if (showAverage) {
            var average = spreadSparkline_getAverage(spreadSparklineDataArray);
            xMark = plotLeft - (vertical ? 1 : -1) * plotWidth * (average - scaleStart) / (scaleEnd - scaleStart);
            drawLines(context, vertical, plotTop - margin, xMark, plotTop + plotHeight + margin, xMark,
                xMark, plotTop - margin, xMark, plotTop + plotHeight + margin, DEFAULT_COLOR2);
        }
        context.restore();
    }

    function spreadSparkline_getRandomOffsetArray(count, totalOffset, minInterval, randomNumbers) {
        var randomOffsetArray = [], MAX_ATTEMPT_TIMES = Math_max(100, count * 10), attemptedTimes = 0,
            forbiddenRangeArray = [], i = 0;
        while (randomOffsetArray.length < count) {
            var offset = Math_floor(randomNumbers[i++] * totalOffset);
            if (attemptedTimes > MAX_ATTEMPT_TIMES || spreadSparkline_isValid(offset, forbiddenRangeArray)) {
                randomOffsetArray.push(offset);
                forbiddenRangeArray.push([offset - minInterval, offset + minInterval]);
            }
            attemptedTimes++;
        }
        return randomOffsetArray;
    }

    function spreadSparkline_getAverage(array) {
        var sum = 0, count = 0;
        for (var i = 0, length = array.length; i < length; i++) {
            var p = array[i];
            count += p.value;
            sum += p.key * p.value;
        }
        if (count === 0) {
            return 0;
        }
        return sum / count;
    }

    function spreadSparkline_isValid(offset, forbiddenRangeArray) {
        for (var i = 0, length = forbiddenRangeArray.length; i < length; i++) {
            var t = forbiddenRangeArray[i];
            if (t[0] <= offset && offset <= t[1]) {
                return false;
            }
        }
        return true;
    }

    // </editor-folder>

    // <editor-folder desc="StackedSparkline">
    // var TextOrientation = {
    //    Horizontal: 0,
    //    Vertical: 1
    // };
    function stackedSparkline_paint(context, value, x, y, width, height, options) {
        var pointsCount, points = value.points, colorRange = value.colorRange, labelRange = value.labelRange,
            maximum = value.maximum, targetRed = value.targetRed, targetGreen = value.targetGreen,
            targetBlue = value.targetBlue,
            targetYellow = value.targetYellow, color = value.color, highlightPosition = value.highlightPosition,
            vertical = value.vertical, textOrientation = value.textOrientation, textSize = value.textSize, margin = 5;
        if (isNullOrUndefined(points) || (pointsCount = points.length) <= 0) {
            return;
        }
        color = isNullOrUndefined(color) ? DEFAULT_COLOR3 : color;
        if (isNullOrUndefined(colorRange) || colorRange.length !== pointsCount || stackedSparkline_hasNullOrUndefined(colorRange)) {
            colorRange = [];
            for (var index = 0; index < pointsCount; index++) {
                colorRange.push(getLighterColor(color, 1 + index / pointsCount));
            }
        }
        var sumPositive = getSum(points, function (v) {
            return v > 0;
        });
        maximum = (isNullOrUndefined(maximum) || maximum < sumPositive) ? sumPositive : maximum;
        textOrientation = isNullOrUndefined(textOrientation) ? 0 : textOrientation;
        textSize = (isNullOrUndefined(textSize) || textSize <= 0) ? 10 : textSize;
        textSize = !isNotANumber(textSize) ? textSize * options.zoomFactor : textSize;
        var rect = getPlotRect(x, y, width, height, margin, height - 2 * margin, vertical);
        var plotLeft = rect.left, plotWidth = rect.width, plotTop = rect.top, plotHeight = rect.height;
        context.save();
        var startX = plotLeft, sWidth, rectX, rectY, rectWidth, rectHeight, p;
        for (var i = 0, length = pointsCount; i < length; i++) {
            p = points[i];
            if (p <= 0) {
                continue;
            }
            sWidth = p / maximum * plotWidth;
            if (vertical) {
                rectX = x + width * 0.15;
                rectWidth = width * 0.7;
                rectY = startX - sWidth;
                rectHeight = sWidth;
            } else {
                rectX = startX;
                rectWidth = sWidth;
                rectY = y + height * 0.15;
                rectHeight = height * 0.7;
            }
            // colorful rectangle
            var backColor = (i + 1 === highlightPosition) ? DEFAULT_COLOR2 : colorRange[i];
            context.save();
            context.fillStyle = backColor;
            context.fillRect(rectX, rectY, rectWidth, rectHeight);
            // label
            var text = labelRange && labelRange[i];
            if (text) {
                context.save();
                context.fillStyle = getTextColor(backColor);
                context.textBaseline = MIDDLE_ALIGN;
                context.textAlign = CENTER_ALIGN;
                context.font = textSize + PX_ARIAL;
                context.rect(rectX, rectY, rectWidth, rectHeight);
                context.clip();
                if (textOrientation === 1 /* Vertical */) {
                    context.translate(rectX + rectWidth / 2, rectY);
                    context.rotate(Math.PI / 2);
                    context.fillText(text, rectHeight / 2, 0);
                } else {
                    context.fillText(text, rectX + rectWidth / 2, rectY + rectHeight / 2);
                }
                context.restore();
            }
            startX = startX + (vertical ? -1 : 1) * sWidth;
            context.restore();
        }
        drawStackedLine(RED_COLOR, targetRed, function (v) {
            return v > 0;
        });
        drawStackedLine(GREEN_COLOR, targetGreen);
        drawStackedLine(BLUE_COLOR, targetBlue);
        drawStackedLine('yellow', targetYellow);
        context.restore();

        function drawStackedLine(style, target, callBack) {
            if (target === keyword_null || target === keyword_undefined) {
                return;
            }
            target = target > maximum ? maximum : target;
            if (callBack && !callBack(target)) {
                return;
            }
            target = target < 0 ? 0 : target;
            var linePosition;
            var temp = target / maximum * plotWidth;
            if (vertical) {
                linePosition = Math_round(plotLeft - temp) - 0.5;
                drawLine(context, plotTop, linePosition, plotTop + plotHeight, linePosition, style);
            } else {
                linePosition = Math_round(plotLeft + temp) - 0.5;
                drawLine(context, linePosition, plotTop, linePosition, plotTop + plotHeight, style);
            }
        }
    }

    function stackedSparkline_hasNullOrUndefined(array) {
        for (var i = 0, length = array.length; i < length; i++) {
            if (isNullOrUndefined(array[i])) {
                return true;
            }
        }
        return false;
    }

    // </editor-folder>

    // <editor-folder desc="HBarSparkline, VBarSparkline, VariSparkline">
    // var ArrowDirection = {
    //    Top: 0,
    //    Right: 1,
    //    Down: 2,
    //    Left: 3
    // };
    // var BarSparklineType = {
    //    Horizontal: 0,
    //    Vertical : 1
    // };

    function barSparklineBase_paintLine(context, startX, startY, endX, endY, strokeStyle) {
        drawLine(context, barSparklineBase_fixValue(startX), barSparklineBase_fixValue(startY), barSparklineBase_fixValue(endX), barSparklineBase_fixValue(endY), isNullOrUndefined(strokeStyle) ? BLACK_COLOR : strokeStyle, 1);
    }

    function barSparklineBase_paintArrow(context, topX, topY, refWidth, direction) {
        var arrowSideLength = refWidth * 0.4;
        topX = barSparklineBase_fixValue(topX);
        topY = barSparklineBase_fixValue(topY);
        context.beginPath();
        context.moveTo(topX, topY);
        var para1 = arrowSideLength / 2;
        var para2 = Math_sqrt(3) * arrowSideLength / 2;
        var para3 = arrowSideLength / Math_sqrt(3);
        var xArray, yArry;
        switch (direction) {
            case 0 /* Top */
            :
                xArray = [-para1, 0, para1];
                yArry = [para2, para3, para2];
                break;
            case 2 /* Down */
            :
                xArray = [-para1, 0, para1];
                yArry = [-para2, -para3, -para2];
                break;
            case 3 /* Left */
            :
                xArray = [para2, para3, para2];
                yArry = [-para1, 0, para1];
                break;
            case 1 /* Right */
            :
                xArray = [-para2, -para3, -para2];
                yArry = [-para1, 0, para1];
                break;
            default:
                xArray = [];
                yArry = [];
                break;
        }
        xArray.forEach(function (x, index) {
            context.lineTo(barSparklineBase_fixValue(topX + x), barSparklineBase_fixValue(topY + yArry[index]));
        });

        context.lineTo(topX, topY);
        context.closePath();
        context.fillStyle = WHITE_COLOR;
        context.fill();
    }

    function barSparklineBase_paint(type, context, value, x, y, width, height) {
        var ratio = value.value, colorScheme = value.colorScheme;
        var rectMargin = 5, arrowMargin = 5, rectRatio = 0.7, needDrawArrow = false;
        var arrow, rect, lineStart, lineEnd, arrowDirection, refWidth;
        ratio = convertFloat(ratio);
        if (isNotANumber(ratio)) {
            return;
        }
        if (ratio > 1) {
            ratio = 1;
            needDrawArrow = true;
        } else if (ratio < -1) {
            ratio = -1;
            needDrawArrow = true;
        }
        colorScheme = isNullOrUndefined(colorScheme) ? 'grey' : colorScheme;

        context.save();
        if (type === 0 /* Horizontal */) {
            var rectHMaxWidth = width - rectMargin * 2;
            var rectHMaxHeight = height * rectRatio;
            if (ratio >= 0) {
                if (needDrawArrow) {
                    arrow = new Point(x + rectMargin + rectHMaxWidth - arrowMargin, y + height / 2);
                }
                rect = new Rect(x + rectMargin, y + height * (1 - rectRatio) / 2, rectHMaxWidth * ratio, rectHMaxHeight);
                lineStart = new Point(x + rectMargin, y + 1);
                lineEnd = new Point(x + rectMargin, y + height);
                arrowDirection = 1 /* Right */;
            } else {
                var rectWidth = Math_abs(rectHMaxWidth * ratio);
                if (needDrawArrow) {
                    arrow = new Point(x + rectMargin + arrowMargin, y + height / 2);
                }
                rect = new Rect(x + width - rectMargin - rectWidth, y + height * (1 - rectRatio) / 2, rectWidth, rectHMaxHeight);
                lineStart = new Point(x + width - rectMargin, y + 1);
                lineEnd = new Point(x + width - rectMargin, y + height);
                arrowDirection = 3 /* Left */;
            }
            refWidth = height;
        } else if (type === 1 /* Vertical */) {
            var rectVMaxHeight = height - rectMargin * 2;
            var rectVMaxWidth = width * rectRatio;
            if (ratio >= 0) {
                var rectHeight = rectVMaxHeight * ratio;
                rect = new Rect(x + (1 - rectRatio) / 2 * width, y + height - rectMargin - rectHeight, rectVMaxWidth, rectHeight);
                if (needDrawArrow) {
                    arrow = new Point(x + width / 2, y + height - rectMargin - rectHeight + arrowMargin);
                    arrowDirection = 0 /* Top */;
                }
                lineStart = new Point(x + 1, y + height - rectMargin);
                lineEnd = new Point(x + width, y + height - rectMargin);
            } else {
                ratio = Math_abs(ratio);
                rect = new Rect(x + (1 - rectRatio) / 2 * width, y + rectMargin, rectVMaxWidth, rectVMaxHeight * ratio);
                if (needDrawArrow) {
                    arrow = new Point(x + width / 2, y + rectMargin + rectVMaxHeight - arrowMargin);
                    arrowDirection = 2 /* Down */;
                }
                lineStart = new Point(x + 1, y + rectMargin);
                lineEnd = new Point(x + width, y + rectMargin);
            }
            refWidth = width;
        }
        // begin to paint
        context.beginPath();
        if (rect) {
            paintRect(context, rect.x, rect.y, rect.width, rect.height, colorScheme);
            clipContext(context, rect.x, rect.y, rect.width, rect.height);
        }
        if (arrow) {
            barSparklineBase_paintArrow(context, arrow.x, arrow.y, refWidth, arrowDirection);
        }
        context.restore();
        if (lineStart) {
            barSparklineBase_paintLine(context, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
        }
        context.restore();
    }

    function barSparklineBase_fixValue(value) {
        return Math_round(value) - 0.5;
    }

    function hBarSparkline_paint(context, value, x, y, width, height) {
        barSparklineBase_paint(0, context, value, x, y, width, height);
    }

    function vBarSparkline_paint(context, value, x, y, width, height) {
        barSparklineBase_paint(1, context, value, x, y, width, height);
    }

    function variSparkline_paint(context, value, x, y, width, height, options) {
        var variance = value.variance, reference = value.reference, mini = value.mini, maxi = value.maxi,
            mark = value.mark,
            tickUnit = value.tickUnit, legend = value.legend, colorPositive = value.colorPositive,
            colorNegative = value.colorNegative, vertical = value.vertical;
        var plotLeft, plotWidth, plotHeight;
        var xy, labelText, refWidth, needShowReference;
        var rectRatio = 0.5, halfRectRatio = 0.5 - rectRatio / 2, needDrawArrow, margin = 5,
            defaultMarklineColor = DEFAULT_COLOR2,
            defaultTickColor = DEFAULT_COLOR1, fontSize = 13 * options.zoomFactor; // px
        variance = convertFloat(variance);
        if (isNotANumber(variance)) {
            return;
        }
        colorNegative = isNullOrUndefined(colorNegative) ? RED_COLOR : colorNegative;
        colorPositive = isNullOrUndefined(colorPositive) ? GREEN_COLOR : colorPositive;
        tickUnit = isNullOrUndefined(tickUnit) ? 0 : tickUnit;
        maxi = isNullOrUndefined(maxi) ? 1 : maxi;
        mini = isNullOrUndefined(mini) ? -1 : mini;
        needShowReference = !isNullOrUndefined(reference);
        if (!needShowReference) {
            reference = 0;
        }
        if (vertical) {
            plotLeft = y + height - margin;
            plotWidth = height - 2 * margin;
            plotHeight = width - 4 * margin;
            xy = -1;
        } else {
            plotLeft = x + margin;
            plotWidth = width - 2 * margin;
            plotHeight = height - 4 * margin;
            xy = 1;
        }
        if (legend) {
            var temp = convertFloat(value.variance);
            if (!isNotANumber(temp)) {
                var tempStr = temp.toString();
                var len = tempStr.substr(tempStr.indexOf('.') + 1).length;
                labelText = len >= 2 ? (temp * 100).toFixed(len - 2) + '%' : (temp * 100).toFixed(0) + '%';
            }
        }
        if (variance > maxi) {
            variance = maxi;
            needDrawArrow = true; // show arrow
        }
        if (variance < mini) {
            variance = mini;
            needDrawArrow = true;
        }

        reference = adjustValue(reference, maxi, mini);
        if (needDrawArrow) {
            refWidth = adjustValue(plotHeight, 60, 15);
        }
        // paint
        var amplitude = Math_abs(maxi - mini);
        var unit = plotWidth / amplitude;
        var startShape = plotLeft + xy * Math_abs(mini - reference) * unit;
        var endShape = Math_abs(variance - reference) * unit;
        if (endShape > Math_abs(amplitude) * unit) {
            endShape = Math_abs(amplitude + mini) * unit;
        }
        var limitRight = plotLeft + xy * plotWidth;
        if ((vertical && startShape < limitRight) || (!vertical && startShape > limitRight)) {
            return;
        }
        clipContext(context, x, y, width, height);
        if (variance > reference) {
            drawLegend(colorPositive, 0, margin - plotWidth, plotWidth - margin, 0, 1, y - startShape, BOTTOM_ALIGN, TOP_ALIGN, startShape - x - width, LEFT_ALIGN, RIGHT_ALIGN, -1, Math_abs(maxi - variance) * unit);
        } else {
            if (endShape > Math_abs(amplitude) * unit) {
                endShape = Math_abs(amplitude + mini) * unit;
                startShape = plotLeft;
            }
            drawLegend(colorNegative, 1, -margin, margin, 2, 3, startShape - y - height, TOP_ALIGN, BOTTOM_ALIGN, x - startShape, RIGHT_ALIGN, LEFT_ALIGN, 1, Math_abs(mini - variance) * unit);
        }
        // Draw reference line
        if (needShowReference) {
            var referencePosition = plotLeft + xy * (Math.abs(mini - reference) * unit);
            drawPart(x, referencePosition, x + width, referencePosition, referencePosition, y, referencePosition, y + height);
        }
        // Draw ticks
        if (tickUnit > 0) {
            context.beginPath();
            var numTicks = amplitude / tickUnit;
            for (var i = 0; i <= numTicks; i++) {
                var xMark = plotLeft + plotWidth / numTicks * i * xy;
                drawPart(x, xMark, x + 0.1 * width, xMark, xMark, y + 0.9 * height, xMark, y + height, defaultTickColor, defaultTickColor);
            }
        }
        // Draw Mark line
        if (!isNullOrUndefined(mark) && mini <= mark && mark <= maxi) {
            context.beginPath();
            var markPosition = plotLeft - (vertical ? 1 : -1) * Math_abs(mini - mark) * unit;
            drawPart(x, markPosition, x + 0.33 * width, markPosition, markPosition, y + 0.66 * height, markPosition, y + height, defaultMarklineColor, defaultMarklineColor);
            context.fill();
        }
        context.restore();

        function drawLegend(color, rectType, arrowOffsetY1, arrowOffsetX2, verticalDir, horizonDir, dValue1, defaultDir1, dir1, dValue2, defaultDir2, dir2, factor, blank) { /* NOSONAR: ExcessiveParameterList */
            var clipX, clipY, clipWidth, clipHeight;
            if (vertical) {
                clipX = x + halfRectRatio * width;
                clipY = rectType === 0 ? startShape - endShape : startShape;
                clipWidth = width * rectRatio;
                clipHeight = endShape;
                paintRect(context, clipX, clipY, clipWidth, clipHeight, color);
            } else {
                clipX = rectType === 0 ? startShape : startShape - endShape;
                clipY = y + halfRectRatio * height;
                clipWidth = endShape;
                clipHeight = height * rectRatio;
                paintRect(context, clipX, clipY, clipWidth, clipHeight, color);
            }
            // paint arrow
            if (needDrawArrow) {
                clipContext(context, clipX, clipY, clipWidth, clipHeight);
                if (vertical) {
                    barSparklineBase_paintArrow(context, x + width / 2, plotLeft + arrowOffsetY1, refWidth, verticalDir /* Top */);
                } else {
                    barSparklineBase_paintArrow(context, plotLeft + arrowOffsetX2, y + height / 2, refWidth, horizonDir /* Right */);
                }
                context.restore();
            }

            // paint label
            if (legend) {
                var dValue;
                var offsetFromArrow = 0;
                if (needDrawArrow) {
                    offsetFromArrow = 0.4 * refWidth * Math_sqrt(3) / 2 + margin + 2;
                }
                context.save();
                context.beginPath();
                context.font = fontSize + PX_ARIAL;
                context.fillStyle = BLACK_COLOR;

                if (vertical) {
                    // If blank area isn't enough to draw label, try to compare blank area with variance area.
                    // Then draw label in bigger area.
                    context.textAlign = CENTER_ALIGN;
                    dValue = fontSize + endShape + dValue1;
                    initDrawLegendContext(dValue, blank, color, defaultDir1, dir1, clipX, clipY, clipWidth, clipHeight, vertical);
                    context.fillText(labelText, x + width / 2, startShape + factor * (endShape - offsetFromArrow));
                } else {
                    context.textBaseline = MIDDLE_ALIGN;
                    dValue = context.measureText(labelText).width + endShape + dValue2;
                    initDrawLegendContext(dValue, blank, color, defaultDir2, dir2, clipX, clipY, clipWidth, clipHeight, vertical);
                    context.fillText(labelText, startShape + factor * (offsetFromArrow - endShape), y + height / 2);
                }
                context.restore();
            }
        }

        function initDrawLegendContext(dValue, blank, color, defaultDir, dir, clipX, clipY, clipWidth, clipHeight, isVertical) {
            if (isVertical) {
                context.textBaseline = defaultDir;
            } else {
                context.textAlign = defaultDir;
            }
            if (dValue > 0 && blank < endShape) {
                context.rect(clipX, clipY, clipWidth, clipHeight);
                context.clip();
                if (isVertical) {
                    context.textBaseline = dir;
                } else {
                    context.textAlign = dir;
                }
                context.fillStyle = getTextColor(color);
            }
        }

        function drawPart(x1, y1, x2, y2, x3, y3, x4, y4, stroke1, stroke2) { /* NOSONAR: ExcessiveParameterList */
            if (vertical) {
                barSparklineBase_paintLine(context, x1, y1, x2, y2, stroke1);
            } else {
                barSparklineBase_paintLine(context, x3, y3, x4, y4, stroke2);
            }
        }
    }

    // </editor-folder>

    // <editor-folder desc="BoxPlotSparkline">
    // var BoxPlotStyle = {
    //    Classical: 0,
    //    Neo: 1
    // };
    var _7NS = '7ns', _5NS = '5ns', _TUKEY = 'tukey', _BOWLEY = 'bowley', _SIGMA3 = 'sigma3';

    function boxPlotSparkline_paint(context, value, x, y, width, height) {
        var points = value.points, boxPlotClass = value.boxPlotClass, showAverage = value.showAverage,
            scaleStart = value.scaleStart, scaleEnd = value.scaleEnd, acceptableStart = value.acceptableStart,
            acceptableEnd = value.acceptableEnd, style = value.style, colorScheme = value.colorScheme,
            vertical = value.vertical, margin = 5, maximum = getMinOrMax(points, false),
            minimum = getMinOrMax(points, true);
        if (isNullOrUndefined(points)) {
            return;
        }
        points = fixValues(points);
        if (points.length <= 0) {
            return;
        }
        boxPlotClass = (boxPlotClass === keyword_null || typeof boxPlotClass !== const_string) ? _5NS : boxPlotClass.toLocaleLowerCase();
        if (boxPlotClass !== _5NS && boxPlotClass !== _7NS && boxPlotClass !== _TUKEY && boxPlotClass !== _BOWLEY && boxPlotClass !== _SIGMA3) {
            boxPlotClass = _5NS;
        }

        scaleStart = convertFloat(scaleStart);
        scaleStart = isNotANumber(scaleStart) ? minimum : scaleStart;
        scaleEnd = convertFloat(scaleEnd);
        scaleEnd = isNotANumber(scaleEnd) ? maximum : scaleEnd;
        acceptableStart = convertFloat(acceptableStart);
        acceptableEnd = convertFloat(acceptableEnd);
        if (colorScheme === keyword_null || typeof colorScheme !== const_string) {
            colorScheme = '#D2D2D2';
        }
        if (style === keyword_null || style !== 0 /* Classical */ && style !== 1 /* Neo */) {
            style = 0 /* Classical */;
        }
        var unreasonableColor = DEFAULT_COLOR2;
        if (scaleStart > minimum) {
            colorScheme = unreasonableColor;
            scaleStart = minimum;
        }
        if (scaleEnd < maximum) {
            colorScheme = unreasonableColor;
            scaleEnd = maximum;
        }
        clipContext(context, x, y, width, height);
        context.lineWidth = 2;
        var rect = getPlotRect(x, y, width, height, margin, height - 2 * margin, vertical);
        var plotLeft = rect.left, plotWidth = rect.width, plotTop = rect.top, plotHeight = rect.height;
        var xy = vertical ? -1 : 1;
        var perc02 = value.perc02, perc09 = value.perc09, perc10 = value.perc10, perc90 = value.perc90,
            perc91 = value.perc91, perc98 = value.perc98, q1 = value.q1, q3 = value.q3, iQR = q3 - q1, x01 = minimum,
            x03 = maximum, y01 = 1.5 * iQR, y03 = 1.5 * iQR, stDev = value.stDev,
            avgMean = getSum(points) / Math_max(1, points.length),
            startAverage = 0, transparency = 0, topBox = plotTop + plotHeight * 0.1, heightBox = plotHeight * 0.7,
            amplitude = Math_abs(scaleEnd - scaleStart);
        for (var i = 0, len = points.length; i < len; i++) {
            var point = points[i];
            if (point < q1 && point >= q1 - 1.5 * iQR && point - (q1 - 1.5 * iQR) < y01) {
                y01 = point - (q1 - 1.5 * iQR);
                x01 = point;
            }
            if (point > q3 && point <= q3 + 1.5 * iQR && q3 + 1.5 * iQR - point < y03) {
                y03 = q3 + 1.5 * iQR - point;
                x03 = point;
            }
            var blOutlier = false;
            startAverage = plotLeft + xy * (plotWidth * ((point - scaleStart) / amplitude));
            // outliers between q1 - 1.5iQR and q3 + 1.5iQR, extreme outliers beyond Q1 - 3IQR and Q3 + 3IQR
            if (boxPlotClass === _TUKEY && (point <= q1 - 1.5 * iQR || point >= q3 + 1.5 * iQR)) {
                blOutlier = true;
                transparency = (point <= q1 - 3 * iQR || point >= q3 + 3 * iQR) ? 0 : 1;
            }
            // outliers beyond perc02 and perc98
            if (boxPlotClass === _7NS && (point <= perc02 || point >= perc98)) {
                blOutlier = true;
                transparency = 1;
            }
            // outliers between avgMean - 2 * stDev and avgMean + 2 * stDev, extreme outliers beyond avgMean - 3 * stDev and avgMean + 3 * stDev
            if (boxPlotClass === _SIGMA3 && (point <= (avgMean - 2 * stDev) || point >= (avgMean + 2 * stDev))) {
                blOutlier = true;
                transparency = (point <= avgMean - 3 * stDev || point >= avgMean + 3 * stDev) ? 0 : 1;
            }
            var outlierColor = DEFAULT_COLOR1;
            if (blOutlier) {
                if (style === 1 /* Neo */) {
                    if (transparency === 1) {
                        _drawLines(0.2, 0.8, startAverage, outlierColor);
                    } else {
                        _drawLines(0.3, 0.7, startAverage, outlierColor);
                    }
                } else {
                    var diameter = 0.1 * plotHeight;
                    if (diameter < 2) {
                        diameter = 2;
                    }
                    context.beginPath();
                    context.strokeStyle = outlierColor;
                    var tempX = plotTop + plotHeight * 0.45;
                    var tempY = startAverage;
                    context.arc(vertical ? tempX : tempY, vertical ? tempY : tempX, diameter / 2, 0, 2 * Math.PI);
                    context.stroke();
                }
            }
        }
        if (scaleStart > acceptableStart || scaleEnd < acceptableEnd) {
            colorScheme = '#C0FF00';
        }
        acceptableStart = Math_max(scaleStart, acceptableStart);
        acceptableEnd = Math_min(scaleEnd, acceptableEnd);
        // acceptablebar
        if (acceptableStart > acceptableEnd) {
            colorScheme = unreasonableColor;
        } else if (acceptableStart < acceptableEnd) {
            var startAcceptable = plotLeft + xy * (plotWidth * ((acceptableStart - scaleStart) / amplitude));
            var endAcceptable = plotLeft + xy * (plotWidth * ((acceptableEnd - scaleStart) / amplitude));
            var xyMark = plotTop + plotHeight * 0.9;
            drawLines(context, vertical, xyMark, startAcceptable, xyMark, endAcceptable,
                startAcceptable, xyMark, endAcceptable, xyMark, DEFAULT_COLOR3);
        }

        var startBox = plotLeft + xy * (plotWidth * ((q1 - scaleStart) / amplitude)),
            endBox = Math_abs(plotLeft + xy * (plotWidth * ((q3 - scaleStart) / amplitude)) - startBox),
            median = value.median, startMedian = plotLeft + xy * (plotWidth * ((median - scaleStart) / amplitude)),
            startWhisker, endWhisker;
        var para1, para2;
        switch (boxPlotClass) {
            case _7NS:
                para1 = perc02;
                para2 = perc98;
                break;
            case _TUKEY:
                para1 = x01;
                para2 = x03;
                break;
            case _SIGMA3:
                startBox = plotLeft + xy * (plotWidth * ((avgMean - stDev - scaleStart) / amplitude));
                endBox = Math_abs(plotLeft + xy * (plotWidth * ((avgMean + stDev - scaleStart) / amplitude)) - startBox);
                startMedian = plotLeft + xy * (plotWidth * ((avgMean - scaleStart) / amplitude));
                var tempValue = avgMean - 2 * stDev;
                para1 = tempValue > scaleStart ? tempValue : minimum;
                tempValue = avgMean + 2 * stDev;
                para2 = tempValue < scaleEnd ? tempValue : maximum;
                showAverage = false;
                break;
            case _5NS:
            case _BOWLEY:
            default:
                para1 = minimum;
                para2 = maximum;
                break;
        }
        startWhisker = plotLeft + xy * (plotWidth * ((para1 - scaleStart) / amplitude));
        endWhisker = plotLeft + xy * (plotWidth * ((para2 - scaleStart) / amplitude));
        var lineColor = DEFAULT_COLOR1;
        // whisker line
        if (style === 1 /* Neo */) {
            _paintRect('#F2F2F2', topBox, endWhisker, heightBox, startWhisker - endWhisker,
                startWhisker, topBox, endWhisker - startWhisker, heightBox);
        } else {
            var topWhiskerLine = plotTop + plotHeight * 0.45;
            drawLines(context, vertical, topWhiskerLine, startWhisker, topWhiskerLine, endWhisker,
                startWhisker, topWhiskerLine, endWhisker, topWhiskerLine, lineColor);
        }
        // box: [q1-q3]
        _paintRect(colorScheme, topBox, startBox - endBox, heightBox, endBox,
            startBox, topBox, endBox, heightBox);
        // median marker
        drawLines(context, vertical, topBox, startMedian, topBox + heightBox, startMedian,
            startMedian, topBox, startMedian, topBox + heightBox, lineColor);

        // max and min whisker
        if (style === 0 /* Classical */) {
            drawLines(context, vertical, topBox + heightBox * 0.3, endWhisker, topBox + heightBox * 0.7, endWhisker,
                endWhisker, topBox + heightBox * 0.3, endWhisker, topBox + heightBox * 0.7, lineColor);
            drawLines(context, vertical, topBox + heightBox * 0.3, startWhisker, topBox + heightBox * 0.7, startWhisker,
                startWhisker, topBox + heightBox * 0.3, startWhisker, topBox + heightBox * 0.7, lineColor);
        }
        // hatches marks
        if (boxPlotClass === _7NS || boxPlotClass === _BOWLEY) {
            var startHatch, endHatch;
            if (boxPlotClass === _7NS) {
                para1 = perc09;
                para2 = perc91;
            } else {
                para1 = perc10;
                para2 = perc90;
            }
            startHatch = plotLeft + xy * (plotWidth * ((para1 - scaleStart) / amplitude));
            endHatch = plotLeft + xy * (plotWidth * ((para2 - scaleStart) / amplitude));
            _drawLines(0.3, 0.7, endHatch, lineColor);
            _drawLines(0.3, 0.7, startHatch, lineColor);
        }
        // average line
        if (showAverage) {
            startAverage = plotLeft + xy * (plotWidth * ((avgMean - scaleStart) / amplitude));
            _drawLines(0.2, 0.8, startAverage, unreasonableColor);
        }
        context.restore();

        function _paintRect(color, x1, y1, width1, height1, x2, y2, width2, height2) { /* NOSONAR: ExcessiveParameterList */
            if (vertical) {
                paintRect(context, x1, y1, width1, height1, color);
            } else {
                paintRect(context, x2, y2, width2, height2, color);
            }
        }

        function _drawLines(factor1, factor2, param, color) {
            drawLines(context, vertical, topBox + heightBox * factor1, param, topBox + heightBox * factor2, param,
                param, topBox + heightBox * factor1, param, topBox + heightBox * factor2, color);
        }
    }

    // </editor-folder>

    // <editor-folder desc="CascadeSparkline, ParetoSparkline">
    function accumulateSparklineBase_paintLine(ctx, startX, startY, endX, endY) {
        startX = Math_round(startX);
        startY = Math_round(startY);
        endX = Math_round(endX);
        endY = Math_round(endY);
        if (startX === endX) {
            endX = endX - 0.5;
            startX = endX;
        }
        if (startY === endY) {
            endY = endY - 0.5;
            startY = endY;
        }
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
    }

    function accumulateSparklineBase_paintLines(ctx, condition, strokeStyle, x1, y1, x2, y2, x3, y3, x4, y4) { /* NOSONAR: ExcessiveParameterList */
        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        if (condition) {
            accumulateSparklineBase_paintLine(ctx, x1, y1, x2, y2);
        } else {
            accumulateSparklineBase_paintLine(ctx, x3, y3, x4, y4);
        }
        ctx.stroke();
    }
    function clipCtx(context, x, y, width, height) {
        context.rect(x, y, width, height);
        context.clip();
    }
    function accumulateSparklineBase_paintLabel(context, x, y, width, height, labelOption) {
        var labelText = labelOption.labelText, fontSize = labelOption.fontSize,
            startBox = labelOption.startBox, endBox = labelOption.endBox, boxColor = labelOption.boxColor,
            isInRightOrTopOfBox = labelOption.isInRightOrTopOfBox;
        context.save();
        context.beginPath();
        context.font = fontSize + PX_ARIAL;
        var dValue, labelStartX, labelStartY, textMargin = 1;
        var textAlign, textBaseline, fillStyle = BLACK_COLOR;
        if (labelOption.vertical) {
            textAlign = CENTER_ALIGN;
            if (isInRightOrTopOfBox) {
                dValue = fontSize + endBox - (startBox - y);
                if (dValue > 0 && startBox - endBox - y < endBox) {
                    textBaseline = TOP_ALIGN;
                    fillStyle = getTextColor(boxColor);
                    labelStartY = startBox - endBox + textMargin;
                    clipCtx(context, x, startBox - endBox, width, endBox);
                } else {
                    textBaseline = BOTTOM_ALIGN;
                    labelStartY = startBox - endBox - textMargin;
                }
            } else {
                dValue = fontSize - (y + height - startBox);
                if (dValue > 0 && y + height - startBox < endBox) {
                    clipCtx(context, x, startBox - endBox, width, endBox);
                    textBaseline = BOTTOM_ALIGN;
                    fillStyle = getTextColor(boxColor);
                    labelStartY = startBox - textMargin;
                } else {
                    textBaseline = TOP_ALIGN;
                    labelStartY = startBox + textMargin;
                }
            }
            context.textAlign = textAlign;
            context.textBaseline = textBaseline;
            context.fillStyle = fillStyle;
            context.fillText(labelText, x + width / 2, labelStartY);
        } else {
            textBaseline = MIDDLE_ALIGN;
            var textWidth = context.measureText(labelText);
            if (isInRightOrTopOfBox) {
                dValue = textWidth.width + endBox - (x + width - startBox);
                if (dValue > 0 && x + width - (startBox + endBox) < endBox) {
                    clipCtx(context, startBox, y, endBox, height);
                    textAlign = RIGHT_ALIGN;
                    fillStyle = getTextColor(boxColor);
                    labelStartX = startBox + endBox - textMargin;
                } else {
                    textAlign = LEFT_ALIGN;
                    labelStartX = startBox + endBox + textMargin;
                }
            } else {
                dValue = textWidth.width - (startBox - x);
                if (dValue > 0 && startBox - x < endBox) {
                    clipCtx(context, startBox, y, endBox, height);
                    labelStartX = startBox + textMargin;
                    textAlign = LEFT_ALIGN;
                    fillStyle = getTextColor(boxColor);
                } else {
                    textAlign = RIGHT_ALIGN;
                    labelStartX = startBox - textMargin;
                }
            }
            context.textAlign = textAlign;
            context.textBaseline = textBaseline;
            context.fillStyle = fillStyle;
            context.fillText(labelText, labelStartX, y + height / 2);
        }
        context.restore();
    }

    function cascadeSparkline_paint(context, value, x, y, width, height, options) {
        var points = value.points, labels = value.labels, pointIndex = value.pointIndex,
            minimum = value.minimum, maximum = value.maximum, colorPositive = value.colorPositive,
            colorNegative = value.colorNegative, vertical = value.vertical, margin = 5,
            fontSize = 13 * options.zoomFactor; // px
        if (isNullOrUndefined(points)) {
            return;
        }
        var pointsLength = points.length;
        if (pointsLength <= 0) {
            return;
        }
        pointIndex = parseInt(pointIndex);
        if (isNotANumber(pointIndex) || pointIndex <= 0 || pointIndex > pointsLength) {
            return;
        }
        labels = isNullOrUndefined(labels) ? [] : labels;
        if (colorPositive === keyword_null || typeof colorPositive !== const_string) {
            colorPositive = '#8CBF64';
        }
        if (colorNegative === keyword_null || typeof colorNegative !== const_string) {
            colorNegative = '#D6604D';
        }
        var positiveStartColor = colorPositive, positiveMidColor = getLighterColor(colorPositive, 1.3),
            negativeStartColor = colorNegative, negativeMidColor = getLighterColor(colorNegative, 1.3);
        // calculation of data array
        var rank = 1, totalValue = 0, totalValuePrevious = 0, min = 0, max = 0, dataArray = [], zero = 0;
        for (var i = 0, len = points.length; i < len; i++) {
            var pointValue = points[i];
            dataArray[rank] = [];
            var dataPoint = dataArray[rank];
            if (isNotANumber(pointValue)) {
                dataPoint[0] = 0;
                dataPoint[1] = totalValue;
                dataPoint[2] = 0;
            } else {
                dataPoint[0] = Math_abs(pointValue);
                totalValue = pointValue + totalValue;
                dataPoint[1] = pointValue > 0 ? totalValuePrevious : totalValue; // startPosition
                dataPoint[2] = pointValue;
            }
            dataPoint[3] = rank;

            min = Math_min(totalValuePrevious, min);
            max = Math_max(totalValuePrevious, max);

            if (rank === pointsLength) {
                zero = min < 0 ? -min : 0;
                dataPoint[1] = pointValue > 0 ? 0 : pointValue;
            }
            totalValuePrevious = pointValue + totalValuePrevious;
            rank++;
        }
        totalValue = totalValue - pointValue; // the sum of all the points' value expect the last one.  /* NOSONAR: s3757, Arithmetic operations should not result in "NaN" */
        // adjust scale, minimum and maximum
        var scaleStart, scaleEnd;
        minimum = convertFloat(minimum);
        if (isNotANumber(minimum) || minimum > 0 || minimum > min) {
            scaleStart = min;
            minimum = min;
        } else {
            scaleStart = minimum;
            zero = -minimum;
        }
        maximum = convertFloat(maximum);
        if (isNotANumber(maximum) || maximum < 0 || maximum < max) {
            scaleEnd = max;
        } else {
            scaleEnd = maximum;
            zero = -minimum;
        }

        var rect = getPlotRect(x, y, width, height, margin, height - 2 * margin, vertical);
        var plotLeft = rect.left, plotWidth = rect.width, plotTop = rect.top, plotHeight = rect.height;
        var xy = vertical ? -1 : 1;
        var amplitude = scaleEnd - scaleStart, unit = plotWidth / amplitude;
        clipContext(context, x, y, width, height);
        context.beginPath();
        context.lineWidth = 1;
        var point = dataArray[pointIndex], dataPointValue = point[2],
            startBox = plotLeft + xy * (point[1] + zero) * unit, endBox = point[0] * unit;
        var boxColor;

        if (pointIndex === 1 || pointIndex === pointsLength) {
            boxColor = dataPointValue >= 0 ? positiveStartColor : negativeStartColor;
        } else {
            boxColor = dataPointValue >= 0 ? positiveMidColor : negativeMidColor;
        }

        // paint box
        if (vertical) {
            paintRect(context, plotTop, startBox - endBox, plotHeight, endBox, boxColor);
        } else {
            paintRect(context, startBox, plotTop, endBox, plotHeight, boxColor);
        }
        // paint link line
        if (vertical) {
            // link before
            if (pointIndex !== 1) {
                if (pointIndex !== pointsLength) {
                    accumulateSparklineBase_paintLines(context, dataPointValue > 0, DEFAULT_COLOR4, x, startBox, plotTop + plotHeight, startBox,
                        x, startBox - endBox, plotTop + plotHeight, startBox - endBox);
                } else {
                    var yMark = plotLeft - (totalValue + zero) * unit;
                    accumulateSparklineBase_paintLines(context, true, DEFAULT_COLOR4, x, yMark, plotTop + plotHeight, yMark);
                }
            }
            // link after
            if (pointIndex !== pointsLength) {
                accumulateSparklineBase_paintLines(context, dataPointValue > 0, DEFAULT_COLOR4, plotTop, startBox - endBox, x + width, startBox - endBox,
                    plotTop, startBox, x + width, startBox);
            }
        } else {
            // link before
            if (pointIndex !== 1) {
                if (pointIndex !== pointsLength) {
                    accumulateSparklineBase_paintLines(context, dataPointValue > 0, DEFAULT_COLOR4, startBox, y, startBox, plotTop + plotHeight,
                        startBox + endBox, y, startBox + endBox, plotTop + plotHeight);
                } else {
                    var xMark = plotLeft + (totalValue + zero) * unit;
                    accumulateSparklineBase_paintLines(context, true, DEFAULT_COLOR4, xMark, y, xMark, plotTop + plotHeight);
                }
            }
            // link after
            if (pointIndex !== pointsLength) {
                accumulateSparklineBase_paintLines(context, dataPointValue > 0, DEFAULT_COLOR4, startBox + endBox, plotTop, startBox + endBox, y + height,
                    startBox, plotTop, startBox, y + height);
            }
        }
        // paint label
        var labelText = labels[pointIndex - 1];
        if (labels.length > 0 && !isNullOrUndefined(labelText) && labelText !== '') {
            accumulateSparklineBase_paintLabel(context, x, y, width, height, {
                labelText: labelText,
                vertical: vertical,
                isInRightOrTopOfBox: dataPointValue > 0,
                fontSize: fontSize,
                startBox: startBox,
                endBox: endBox,
                boxColor: boxColor
            });
        }
        // paint zero line
        accumulateSparklineBase_paintLines(context, vertical, BLACK_COLOR, x, plotLeft - zero * unit, x + width, plotLeft - zero * unit,
            plotLeft + zero * unit, y, plotLeft + zero * unit, y + height);
        context.restore();
    }

    function paretoSparkline_paint(context, value, x, y, width, height, options) {
        var points = value.points, pointIndex = value.pointIndex, colorRange = value.colorRange,
            target = value.target, target2 = value.target2, highlightPosition = value.highlightPosition,
            label = value.label, vertical = value.vertical, margin = 5, fontSize = 13 * options.zoomFactor; // px
        if (isNullOrUndefined(points)) {
            return;
        }
        var pointsLength = points.length;
        if (pointsLength <= 0) {
            return;
        }
        pointIndex = parseInt(pointIndex);
        if (isNotANumber(pointIndex) || pointIndex <= 0 || pointIndex > pointsLength) {
            return;
        }
        colorRange = isNullOrUndefined(colorRange) ? [] : colorRange;
        target = processTarget(target);
        target2 = processTarget(target2);
        label = parseInt(label);
        label = isNotANumber(label) ? 0 : label;

        // calculation of data array; start plot, end plot, segment percentage
        var rank = 1, total = 0, paretoArray = [];
        for (var i = 0, len = points.length; i < len; i++) {
            var pointValue = points[i];
            paretoArray[rank] = [];
            var paretoPoint = paretoArray[rank];
            if (pointValue < 0 || isNotANumber(pointValue) || isNullOrUndefined(pointValue)) {
                paretoPoint[0] = rank === 1 ? 0 : total;
                paretoPoint[1] = 0;
            } else {
                total = total + pointValue;
                paretoPoint[0] = rank === 1 ? 0 : total - pointValue;
                paretoPoint[1] = pointValue;
            }
            rank++;
        }
        var rect = getPlotRect(x, y, width, height, margin, height - 2 * margin, vertical);
        var plotLeft = rect.left, plotWidth = rect.width, plotTop = rect.top, plotHeight = rect.height;
        var xy = vertical ? -1 : 1;
        var unit = plotWidth / total;
        clipContext(context, x, y, width, height);
        context.beginPath();
        context.lineWidth = 1;
        var point = paretoArray[pointIndex], dataPointValue = point[1], startBox = plotLeft + xy * point[0] * unit,
            endBox = point[1] * unit, boxColor;
        if (pointIndex === highlightPosition) {
            boxColor = DEFAULT_COLOR2;
        } else if (colorRange.length === 0 || typeof colorRange[pointIndex - 1] !== const_string) {
            boxColor = DEFAULT_COLOR1;
        } else {
            boxColor = colorRange[pointIndex - 1];
        }
        // paint box
        if (vertical) {
            paintRect(context, plotTop, startBox - endBox, plotHeight, endBox, boxColor);
        } else {
            paintRect(context, startBox, plotTop, endBox, plotHeight, boxColor);
        }
        // paint label
        var labelPerc;
        if (label === 1) {
            labelPerc = (point[0] + dataPointValue) / total * 1000;
        } else if (label === 2) {
            labelPerc = dataPointValue / total * 1000;
        }
        var labelText = Math_round(labelPerc) / 10 + '%';
        if ((label === 1 || label === 2) && labelText !== '') {
            accumulateSparklineBase_paintLabel(context, x, y, width, height, {
                labelText: labelText,
                vertical: vertical,
                isInRightOrTopOfBox: (point[0] + point[1]) * unit < plotWidth / 2,
                fontSize: fontSize,
                startBox: startBox,
                endBox: endBox,
                boxColor: boxColor
            });
        }
        // paint target line
        // paint target2 line
        var colorArray = ['#8CBF64', '#EE5D5D'];
        [target, target2].forEach(function (item, index) {
            var targetLine = Math_ceil(plotLeft + xy * plotWidth * item);
            accumulateSparklineBase_paintLines(context, vertical, colorArray[index], x, targetLine, x + width, targetLine, targetLine, y, targetLine, y + height);
        });
        context.restore();

        function processTarget(targetVaule) {
            targetVaule = convertFloat(targetVaule);
            targetVaule = isNotANumber(targetVaule) ? 0 : targetVaule;
            targetVaule = targetVaule < 0 ? 0 : targetVaule;
            targetVaule = targetVaule > 1 ? 1 : targetVaule;
            return targetVaule;
        }
    }

    // </editor-folder>

    //<editor-folder desc="MonthSparkline, YearSparkline">
    function calendarSparkline_daysOfMonth(year, month) {
        switch (month) {
            case 2:
                var isLeapYear = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
                return isLeapYear ? 29 : 28;
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
            default:
                return 31;
        }
    }

    function calendarSparkline_getLinearColor(percent, startColor, endColor) {
        if (percent < 0) {
            percent = 0;
        }
        if (percent > 1) {
            percent = 1;
        }
        var minColor = parseColor(startColor);
        var maxColor = parseColor(endColor);
        var a = (minColor.a) * (1 - percent) + (maxColor.a) * (percent);
        var r = (minColor.r) * (1 - percent) + (maxColor.r) * (percent);
        var g = (minColor.g) * (1 - percent) + (maxColor.g) * (percent);
        var b = (minColor.b) * (1 - percent) + (maxColor.b) * (percent);
        return "rgba(" + parseInt(r, 10) + "," + parseInt(g, 10) + "," + parseInt(b, 10) + "," + convertFloat(a / 255) + ")";
    }

    function calendarSparkline_getPercent(currentValue, minValue, maxValue) {
        if (currentValue === minValue && currentValue === maxValue) {
            return 1.0;
        }
        if (currentValue <= minValue) {
            return 0.0;
        }
        if (currentValue >= maxValue) {
            return 1.0;
        }
        return (currentValue - minValue) / (maxValue - minValue);
    }

    function calendarSparkline_getColor(startColor, middleColor, endColor, currentValue, minValue, maxValue) {
        var middleValue = (maxValue + minValue) / 2;
        if (minValue <= currentValue && currentValue <= middleValue) {
            return calendarSparkline_getLinearColor(calendarSparkline_getPercent(currentValue, minValue, middleValue), startColor, middleColor);
        }
        return calendarSparkline_getLinearColor(calendarSparkline_getPercent(currentValue, middleValue, maxValue), middleColor, endColor);
    }

    function calendarSparkline_getMinMaxValue(values) {
        var minValue = NUMBER_MAX_VALUE, maxValue = -NUMBER_MAX_VALUE;
        values.forEach(function (v) {
            if (v !== keyword_null && v !== keyword_undefined) {
                if (minValue > v) {
                    minValue = v;
                }
                if (maxValue < v) {
                    maxValue = v;
                }
            }
        });
        return {min: minValue, max: maxValue};
    }

    function calendarSparkline_fillColors(values, colors, dayOfWeek, value_colors, startColor, middleColor, endColor) {
        if (value_colors) {
            values.forEach(function (v, i) {
                if (v !== 0 && v !== keyword_null && v !== keyword_undefined) {
                    colors[dayOfWeek + i] = value_colors[i] || colors[dayOfWeek + i];
                }
            });
        } else {
            var returnObj = calendarSparkline_getMinMaxValue(values);
            var minValue = returnObj.min, maxValue = returnObj.max;
            values.forEach(function (v, i) {
                if (v !== 0 && v !== keyword_null && v !== keyword_undefined) {
                    colors[dayOfWeek + i] = calendarSparkline_getColor(startColor, middleColor, endColor, v, minValue, maxValue);
                }
            });
        }
    }

    function monthSparkline_paint(context, value, x, y, width, height) {
        var year = value.year, month = value.month, values = value.values,
            emptyColor = value.emptyColor || "lightgray", startColor = value.startColor,
            middleColor = value.middleColor, endColor = value.endColor, notThisMonthColor = "white";
        var HORIZONTAL_ITEMCOUNT = 6, VERTICAL_ITEMCOUNT = 7;
        var MARGIN = 2, UNIT_WIDTH = (width - (HORIZONTAL_ITEMCOUNT + 1) * MARGIN) / HORIZONTAL_ITEMCOUNT,
            UNIT_HEIGHT = (height - (VERTICAL_ITEMCOUNT + 1) * MARGIN) / VERTICAL_ITEMCOUNT;
        var colors = [];
        var dayOfWeek = new Date(year, month - 1, 1).getDay();
        for (var i = 0; i < HORIZONTAL_ITEMCOUNT * VERTICAL_ITEMCOUNT; i++) {
            if (i < dayOfWeek) {
                colors[i] = notThisMonthColor;
            } else if (i < dayOfWeek + calendarSparkline_daysOfMonth(year, month)) {
                colors[i] = emptyColor;
            } else {
                colors[i] = notThisMonthColor;
            }
        }
        calendarSparkline_fillColors(values, colors, dayOfWeek, value.colors, startColor, middleColor, endColor);

        context.save();
        context.rect(x, y, width, height);
        context.clip();
        context.beginPath();

        var colorIndex = 0;
        for (var col = 0; col < HORIZONTAL_ITEMCOUNT; col++) {
            for (var row = 0; row < VERTICAL_ITEMCOUNT; row++) {
                context.fillStyle = colors[colorIndex++];
                context.fillRect(x + col * UNIT_WIDTH + (col + 1 ) * MARGIN, y + row * UNIT_HEIGHT + (row + 1) * MARGIN, UNIT_WIDTH, UNIT_HEIGHT);
            }
        }

        context.restore();
    }

    function calendarSparkline_dayInYear(date) {
        var year = date.getFullYear(), month = date.getMonth();
        var day = date.getDate();
        for (var i = 1; i < month + 1; i++) {
            day += calendarSparkline_daysOfMonth(year, i);
        }
        return day;
    }

    function yearSparkline_paint(context, value, x, y, width, height, options) {
        var year = value.year, values = value.values,
            emptyColor = value.emptyColor || "lightgray", startColor = value.startColor,
            middleColor = value.middleColor, endColor = value.endColor, notThisYearColor = "white";
        var VERTICAL_ITEMCOUNT = 7, HORIZONTAL_ITEMCOUNT = parseInt(366 / VERTICAL_ITEMCOUNT) + 2;
        var colors = [];
        var dayOfWeek = new Date(year, 0, 1).getDay(), totalDays = calendarSparkline_dayInYear(new Date(year, 11, 31));
        for (var i = 0; i < HORIZONTAL_ITEMCOUNT * VERTICAL_ITEMCOUNT; i++) {
            if (i < dayOfWeek) {
                colors[i] = notThisYearColor;
            } else if (i < dayOfWeek + totalDays) {
                colors[i] = emptyColor;
            } else {
                colors[i] = notThisYearColor;
            }
        }
        calendarSparkline_fillColors(values, colors, dayOfWeek, value.colors, startColor, middleColor, endColor);

        context.save();
        context.rect(x, y, width, height);
        context.clip();

        /* paint year text */
        var zoomFactor = options.zoomFactor;
        var YEAR_WIDTH = 15 * zoomFactor, plotX = x + YEAR_WIDTH, plotY = y, plotWidth = width - YEAR_WIDTH,
            plotHeight = height;
        context.save();
        context.translate(x + YEAR_WIDTH / 2, plotY + plotHeight);
        context.rotate(-Math.PI / 2);
        context.font = 13 * zoomFactor + PX_ARIAL;
        context.fillStyle = "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.fillText(year, plotHeight / 2, 0);
        context.restore();
        /* paint day square */
        var MARGIN = 2, UNIT_WIDTH = (plotWidth - (HORIZONTAL_ITEMCOUNT + 1) * MARGIN) / HORIZONTAL_ITEMCOUNT,
            UNIT_HEIGHT = (plotHeight - (VERTICAL_ITEMCOUNT + 1) * MARGIN) / VERTICAL_ITEMCOUNT;
        var index = 0, row, col, layout;
        var layoutModel = [];
        for (col = 0; col < HORIZONTAL_ITEMCOUNT; col++) {
            for (row = 0; row < VERTICAL_ITEMCOUNT; row++) {
                layout = {
                    x: plotX + col * UNIT_WIDTH + (col + 1 ) * MARGIN,
                    y: plotY + row * UNIT_HEIGHT + (row + 1) * MARGIN,
                    w: UNIT_WIDTH,
                    h: UNIT_HEIGHT
                };
                layoutModel[index] = layout;
                context.fillStyle = colors[index++];
                context.fillRect(layout.x, layout.y, layout.w, layout.h);
            }
        }
        /* paint month line */
        var lines = [];
        var firstDayIndexDict = {};
        for (var m = 0; m < 12; m++) {
            firstDayIndexDict[m] = calendarSparkline_dayInYear(new Date(year, m, 1)) - 1 + dayOfWeek;
        }
        var lastDayInYear = firstDayIndexDict[11] + calendarSparkline_daysOfMonth(year, 12) - 1;
        index = 0;
        for (col = 0; col < HORIZONTAL_ITEMCOUNT; col++) {
            for (row = 0; row < VERTICAL_ITEMCOUNT; row++) {
                if (dayOfWeek <= index && index < dayOfWeek + totalDays) {
                    var tmpDate = new Date(year, 0, index - dayOfWeek + 1);
                    var tmpMonth = tmpDate.getMonth();
                    var firstDayInMonth = firstDayIndexDict[tmpMonth];
                    layout = layoutModel[index];
                    /* left */
                    if (firstDayInMonth <= index && index < 7 + firstDayInMonth) {
                        lines.push({
                            x1: layout.x,
                            y1: layout.y - MARGIN / 2,
                            x2: layout.x,
                            y2: layout.y + layout.h + MARGIN / 2
                        });
                    }
                    /* top */
                    if (index === firstDayInMonth || tmpDate.getDay() === 0) {
                        lines.push({
                            x1: layout.x - MARGIN / 2,
                            y1: layout.y,
                            x2: layout.x + layout.w + MARGIN / 2 + (index === firstDayInMonth ? MARGIN : 0),
                            y2: layout.y
                        });
                    }
                    /* right */
                    if (lastDayInYear - 7 < index && index <= lastDayInYear) {
                        lines.push({
                            x1: layout.x + layout.w,
                            y1: layout.y - MARGIN / 2,
                            x2: layout.x + layout.w,
                            y2: layout.y + layout.h + MARGIN / 2
                        });
                    }
                    /* bottom */
                    if (index === lastDayInYear || tmpDate.getDay() === 6) {
                        lines.push({
                            x1: layout.x - MARGIN / 2 - (index === lastDayInYear ? MARGIN : 0),
                            y1: layout.y + layout.h,
                            x2: layout.x + layout.w + MARGIN / 2,
                            y2: layout.y + layout.h
                        });
                    }
                }
                index++;
            }
        }
        context.strokeStyle = "black";
        context.lineWidth = 2;
        for (var j = 0; j < lines.length; j++) {
            var lineInfo = lines[j];
            context.beginPath();
            context.moveTo(lineInfo.x1, lineInfo.y1);
            context.lineTo(lineInfo.x2, lineInfo.y2);
            context.stroke();
        }

        context.restore();
    }

    //</editor-folder>

    // <editor-folder desc="SparklineRender">
    var SparklineRender = (function () {
        function SparklineRender() {
            var self = this;
            self._minItemHeight = 2;
            self._cachedMinDatetime = NUMBER_MAX_VALUE;
            self._cachedMaxDatetime = -NUMBER_MAX_VALUE;
            self._cachedMinValue = NUMBER_MAX_VALUE;
            self._cachedMaxValue = -NUMBER_MAX_VALUE;
        }

        SparklineRender.prototype = {
            constructor: SparklineRender,
            paint: function (ctx, value, x, y, w, h) {
                var self = this;
                self.options = value;
                self.setting = value.settings;
                var values = value.values;
                var dateValues = value.dateValues;
                var zoomFactor = value.zoomFactor;
                ctx.save();
                ctx.rect(x, y, w, h);
                ctx.clip();
                ctx.beginPath();
                if (value.sparklineType === 0 /* line */) {
                    self._paintLines(ctx, x, y, w, h, values, dateValues, zoomFactor);
                }
                self._paintDataPoints(ctx, x, y, w, h, values, dateValues, zoomFactor);
                self._paintAxis(ctx, x, y, w, h, values, dateValues, zoomFactor);
                ctx.restore();
            },
            _getSpace: function (zoomFactor) {
                if (this.options.sparklineType === 0 /* line */) {
                    return 3 + this._getLineWeight(zoomFactor) + 1;
                }
                return 3;
            },
            _getCachedIndexMaping: function (cachedValues, cachedDatetimes) {
                var cachedIndexMapping = this._cachedIndexMapping;
                if (cachedIndexMapping) {
                    return cachedIndexMapping;
                }
                cachedIndexMapping = this._cachedIndexMapping = [];
                var valueCount = cachedValues.length, i, v;
                if (this.options.displayDateAxis) {
                    var dateAxisCount = cachedDatetimes.length, count = Math_min(valueCount, dateAxisCount),
                        sorted = [];
                    if (count > 0) {
                        sorted = cachedDatetimes.slice(0, count);
                    }
                    // then sort them
                    sorted.sort(function (a, b) {
                        if (a === b) {
                            return 0;
                        }
                        if (a === __invalidValuePlaceHolder) {
                            a = 0;
                        }
                        if (b === __invalidValuePlaceHolder) {
                            b = 0;
                        }
                        return a - b;
                    });
                    var sortedCount = sorted.length, datetime, valueIndex;
                    for (i = 0; i < sortedCount; i++) {
                        datetime = sorted[i];
                        if (typeof datetime === const_undefined || datetime === keyword_null) {
                            continue;
                        }
                        valueIndex = ArrayHelper_indexOf(cachedDatetimes, datetime);
                        while (ArrayHelper._contains(cachedIndexMapping, valueIndex)) {
                            valueIndex = ArrayHelper_indexOf(cachedDatetimes, datetime, valueIndex + 1);
                        }
                        if (!isNaN(datetime)) {
                            v = cachedValues[valueIndex];
                            if (!(v !== keyword_undefined && v !== keyword_null && isNaN(v) && v !== __invalidValuePlaceHolder)) {
                                cachedIndexMapping.push(valueIndex);
                            }
                        }
                    }
                } else {
                    for (i = 0; i < valueCount; i++) {
                        v = cachedValues[i];
                        if (!(typeof v !== const_undefined && v !== keyword_null && isNaN(v) && v !== __invalidValuePlaceHolder)) {
                            cachedIndexMapping.push(i);
                        }
                    }
                }
                return cachedIndexMapping;
            },
            _getValue: function (valueIndex, cachedValues) {
                var item = cachedValues[valueIndex];
                if (typeof item === const_undefined || item === keyword_null) {
                    if (this.setting.options.displayEmptyCellsAs === 1 /* Zero */) {
                        item = 0;
                    }
                } else if (item === __invalidValuePlaceHolder) {
                    item = 0;
                }
                return item;
            },
            _paintLines: function (ctx, x, y, w, h, cachedValues, cachedDatetimes, zoomFactor) {
                // :calculate the points
                var self = this;
                var cachedIndexMaping = self._getCachedIndexMaping(cachedValues, cachedDatetimes), i, p1, p2,
                    count = cachedIndexMaping.length - 1;
                if (count < 0) {
                    count = 0;
                }
                var optionSettings = self.setting.options;
                var linePos = self.linePos = [], start, end, endIndex, startRec, endRec,
                    displayEmptyCellsAs = optionSettings.displayEmptyCellsAs, temp, d;
                for (i = 0; i < count; i++) {
                    start = self._getValue(cachedIndexMaping[i], cachedValues);
                    if (typeof start !== const_undefined && start !== keyword_null) {
                        endIndex = i + 1;
                        end = self._getValue(cachedIndexMaping[endIndex], cachedValues);
                        if (typeof end === const_undefined || end === keyword_null) {
                            if (displayEmptyCellsAs === 1 /* Zero */) {
                                end = 0;
                            } else if (displayEmptyCellsAs === 2 /* Connect */) {
                                for (endIndex = i + 2; endIndex <= count; endIndex++) {
                                    temp = cachedValues[cachedIndexMaping[endIndex]];
                                    if (typeof temp !== const_undefined && temp !== keyword_null) {
                                        end = temp;
                                        break;
                                    }
                                }
                            }
                        }
                        if (typeof end !== const_undefined && end !== keyword_null) {
                            startRec = self._getDataPointPosition(cachedIndexMaping[i], {
                                Width: w,
                                Height: h
                            }, cachedValues, cachedDatetimes, zoomFactor);
                            endRec = self._getDataPointPosition(cachedIndexMaping[endIndex], {
                                Width: w,
                                Height: h
                            }, cachedValues, cachedDatetimes, zoomFactor);
                            d = startRec.Width / 2;
                            p1 = {X: startRec.X + d, Y: startRec.Y + d};
                            p2 = {X: endRec.X + d, Y: endRec.Y + d};
                            linePos[i] = {P1: p1, P2: p2};
                        } else {
                            i++; /* NOSONAR:S2310, Loop counters should not be assigned to from within the loop body*/
                        }
                    }
                }
                // :~end calculate points
                // : draw the lines.
                var linePosCount = linePos.length, line;
                if (linePosCount > 0) {
                    ctx.strokeStyle = self.options.getColor(optionSettings.seriesColor);
                    ctx.lineCap = 'round';
                    ctx.lineWidth = self._getLineWeight(zoomFactor);
                    for (i = 0; i < linePosCount; i++) {
                        line = linePos[i];
                        if (!line) {
                            continue;
                        }
                        ctx.beginPath();
                        p1 = line.P1;
                        p2 = line.P2;
                        ctx.moveTo(x + p1.X, y + p1.Y);
                        ctx.lineTo(x + p2.X, y + p2.Y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
                // :~
            },
            _getDataPointColor: function (indexInValueCache, cachedValues, cachedDatetimes) {
                var self = this;
                var options = self.options;
                var settingOptions = self.setting.options;
                var ret = keyword_null,
                    value = self._getValue(indexInValueCache, cachedValues),
                    cachedIndexMaping = self._getCachedIndexMaping(cachedValues, cachedDatetimes),
                    cachedIndexMapingCount = cachedIndexMaping.length;
                var getColor = options.getColor.bind(self);
                if (typeof value !== const_undefined && value !== keyword_null) {
                    if (self._cachedMinValue === NUMBER_MAX_VALUE || self._cachedMaxValue === -NUMBER_MAX_VALUE) {
                        self._getMaxMinValue(cachedValues);
                    }
                    if (value === self._cachedMinValue && settingOptions.showLow) {
                        ret = getColor(settingOptions.lowMarkerColor);
                    }
                    if (value === self._cachedMaxValue && settingOptions.showHigh && (typeof ret === const_undefined || ret === keyword_null)) {
                        ret = getColor(settingOptions.highMarkerColor);
                    }
                    if (typeof ret === const_undefined || ret === keyword_null) {
                        if (options.displayDateAxis) {
                            var dateIndex1 = ArrayHelper_indexOf(cachedIndexMaping, indexInValueCache);
                            if (dateIndex1 === 0 && settingOptions.showFirst) {
                                ret = getColor(settingOptions.firstMarkerColor);
                            }
                        } else if (indexInValueCache === 0 && settingOptions.showFirst) {
                            ret = getColor(settingOptions.firstMarkerColor);
                        }
                    }
                    if (typeof ret === const_undefined || ret === keyword_null) {
                        if (options.displayDateAxis) {
                            var dateIndex2 = ArrayHelper_indexOf(cachedIndexMaping, indexInValueCache);
                            if (dateIndex2 === cachedIndexMapingCount - 1 && settingOptions.showLast) {
                                // last marker
                                ret = getColor(settingOptions.lastMarkerColor);
                            }
                        } else if (indexInValueCache === cachedIndexMapingCount - 1 && settingOptions.showLast) {
                            ret = getColor(settingOptions.lastMarkerColor);
                        }
                    }
                    if (value < 0 && settingOptions.showNegative && (typeof ret === const_undefined || ret === keyword_null)) {
                        ret = getColor(settingOptions.negativeColor);
                    }
                    if (typeof ret === const_undefined || ret === keyword_null) {
                        var sparklineType = options.sparklineType;
                        if (sparklineType === 0 /* line */) {
                            if (settingOptions.showMarkers) {
                                ret = getColor(settingOptions.markersColor);
                            }
                        } else if (sparklineType === 1 /* column */) {
                            ret = getColor(settingOptions.seriesColor);
                        } else if (sparklineType === 2 /* winloss */) {
                            ret = getColor(settingOptions.seriesColor);
                        }
                    }
                }
                if (ret === keyword_undefined || ret === keyword_null) {
                    return 'Transparent';
                }
                return ret;
            },

            _paintDataPoints: function (ctx, x, y, w, h, cachedValues, cachedDatetimes, zoomFactor) { /* NOSONAR: ExcessiveParameterList */
                var self = this;
                var finalSize = {
                        Width: w,
                        Height: h
                    }, cachedIndexMaping = self._getCachedIndexMaping(cachedValues, cachedDatetimes),
                    cachedIndexMapingCount = cachedIndexMaping.length, spType = self.options.sparklineType, index,
                    color,
                    rec, centerX, centerY, newX, newY, newWidth, newHeight;
                for (var i = 0; i < cachedIndexMapingCount; i++) {
                    index = cachedIndexMaping[i];
                    color = self._getDataPointColor(index, cachedValues, cachedDatetimes);
                    rec = self._getDataPointPosition(index, finalSize, cachedValues, cachedDatetimes, zoomFactor);
                    if (ctx.fillStyle !== color) {
                        ctx.fillStyle = color;
                    }
                    if (spType === 0 /* line */) {
                        ctx.save();
                        centerX = x + rec.X + rec.Width / 2;
                        centerY = y + rec.Y + rec.Height / 2;
                        ctx.translate(centerX, centerY);
                        ctx.rotate(45 * Math_PI / 180);
                        ctx.fillRect(0 - rec.Width / 2, 0 - rec.Height / 2, rec.Width, rec.Height);
                        ctx.restore();
                    } else {
                        newX = x + rec.X + rec.Width / 4;
                        newX = Math_floor(newX);
                        newY = y + rec.Y;
                        newWidth = rec.Width / 2;
                        newHeight = rec.Height;
                        ctx.fillRect(newX, newY, newWidth, newHeight);
                    }
                }
            },
            _paintAxis: function (ctx, x, y, w, h, cachedValues, cachedDatetimes, zoomFactor) { /* NOSONAR: ExcessiveParameterList */
                var self = this;
                var settingOptions = self.setting && self.setting.options;
                if (!settingOptions || !settingOptions.displayXAxis || !self._hasAxis(cachedValues, cachedDatetimes)) {
                    return;
                }
                var avalibleSize = {
                        Width: w,
                        Height: h
                    }, x1 = self._getSpace(zoomFactor), x2 = avalibleSize.Width - self._getSpace(zoomFactor),
                    y1 = Math_floor(self._getAxisY(avalibleSize, cachedValues, zoomFactor)) + 0.5, y2 = y1,
                    color = self.options.getColor(settingOptions.axisColor), lineWidth = zoomFactor;
                if (lineWidth < 1) {
                    lineWidth = 1;
                }
                if (ctx.strokeStyle !== color) {
                    ctx.strokeStyle = color;
                }
                if (ctx.lineWidth !== lineWidth) {
                    ctx.lineWidth = lineWidth;
                }
                ctx.beginPath();
                ctx.moveTo(x + x1, y + y1);
                ctx.lineTo(x + x2, y + y2);
                ctx.stroke();
            },
            _hasAxisNormal: function (cachedValues) {
                var max = this._getActualMaxValue(cachedValues);
                if (max !== -NUMBER_MAX_VALUE) {
                    var min = this._getActualMinValue(cachedValues);
                    if (min !== NUMBER_MAX_VALUE) {
                        return max === min || max * min <= 0;
                    }
                }
                return true;
            },
            _hasAxis: function (cachedValues, cachedDatetimes) {
                var b = this._hasAxisNormal(cachedValues);
                if (this.options.sparklineType !== 2 /* winloss */) {
                    return b;
                }
                var cachedIndexMaping = this._getCachedIndexMaping(cachedValues, cachedDatetimes),
                    cachedIndexMapingCount = cachedIndexMaping.length, index, item;
                if (!b && cachedIndexMapingCount > 0) {
                    for (var i = 0; i < cachedIndexMapingCount; i++) {
                        index = cachedIndexMaping[i];
                        item = cachedValues[index];
                        if (typeof item !== const_undefined && item !== keyword_null) {
                            return true;
                        }
                    }
                }
                return b;
            },
            _getMinDatetime: function (cachedValues, cachedDatetimes) {
                var oldCachedMinDatetime = this._cachedMinDatetime;
                if (isNaN(oldCachedMinDatetime) || oldCachedMinDatetime === NUMBER_MAX_VALUE) {
                    this._getMaxMindatetimes(cachedValues, cachedDatetimes);
                }
                return this._cachedMinDatetime;
            },
            _getMaxDatetime: function (cachedValues, cachedDatetimes) {
                var oldCachedMaxDatetime = this._cachedMaxDatetime;
                if (isNaN(oldCachedMaxDatetime) || oldCachedMaxDatetime === -NUMBER_MAX_VALUE) {
                    this._getMaxMindatetimes(cachedValues, cachedDatetimes);
                }
                return this._cachedMaxDatetime;
            },
            _getMaxMindatetimes: function (cachedValues, cachedDatetimes) {
                var self = this;
                var maxDatetime = new Date(0, 0, 0), minDatetime = NUMBER_MAX_VALUE,
                    cachedIndexMaping = self._getCachedIndexMaping(cachedValues, cachedDatetimes),
                    cachedIndexMapingCount = cachedIndexMaping.length, index, datetime, v;
                for (var i = 0; i < cachedIndexMapingCount; i++) { /* NOSONAR: TooManyBreakOrContinueInLoop */
                    index = cachedIndexMaping[i];
                    datetime = cachedDatetimes[index];
                    if (isNaN(datetime)) {
                        continue;
                    }
                    v = self._getValue(index, cachedValues);
                    if (v !== keyword_null && typeof v === const_undefined || isNaN(v)) {
                        continue;
                    }
                    if (typeof datetime === const_undefined || datetime === keyword_null) {
                        continue;
                    }
                    if (datetime > maxDatetime) {
                        maxDatetime = datetime;
                    }
                    if (datetime < minDatetime) {
                        minDatetime = datetime;
                    }
                }
                self._cachedMaxDatetime = maxDatetime;
                self._cachedMinDatetime = minDatetime;
            },
            _calcItemWidth: function (availableSize, cachedValues, cachedDatetimes, zoomFactor) {
                var self = this;
                var min = self._getMinDatetime(cachedValues, cachedDatetimes),
                    max = self._getMaxDatetime(cachedValues, cachedDatetimes),
                    datetimeValues = [], i, d, index,
                    cachedIndexMaping = self._getCachedIndexMaping(cachedValues, cachedDatetimes),
                    cachedIndexMapingCount = cachedIndexMaping.length;
                for (i = 0; i < cachedIndexMapingCount; i++) {
                    index = cachedIndexMaping[i];
                    d = cachedDatetimes[index];
                    if (!d || isNaN(d)) {
                        continue;
                    }
                    datetimeValues.push(d);
                }
                datetimeValues.sort(function (x, y) {
                    return x - y;
                });
                var valueCount = datetimeValues.length;
                if (valueCount > 1 && min !== max) {
                    var minDValue = NUMBER_MAX_VALUE, sumD = 0, oa;
                    for (i = 1; i < valueCount; i++) {
                        oa = datetimeValues[i];
                        d = oa - datetimeValues[i - 1];
                        if (d < minDValue && d > 0) {
                            minDValue = d;
                        }
                        sumD += d;
                    }
                    var width = (availableSize.Width - self._getSpace(zoomFactor) - self._getSpace(zoomFactor)) * minDValue / sumD / 2;
                    if (width < 2) {
                        width = 2;
                    }
                    return width;
                }
                return (availableSize.Width - self._getSpace(zoomFactor) - self._getSpace(zoomFactor)) / 2;
            },
            _getItemWidth: function (availableSize, cachedValues, cachedDatetimes, zoomFactor) {
                var self = this;
                if (self.options.displayDateAxis) {
                    return self._calcItemWidth(availableSize, cachedValues, cachedDatetimes, zoomFactor);
                }
                var count = self._getCachedIndexMaping(cachedValues, cachedDatetimes).length;
                return (availableSize.Width - self._getSpace(zoomFactor) - self._getSpace(zoomFactor)) / count;
            },
            _getItemX: function (availableSize, index, cachedValues, cachedDatetimes, zoomFactor) {
                var self = this;
                var itemWidth, leftSpace = self._getSpace(zoomFactor);
                if (self.options.displayDateAxis) {
                    itemWidth = self._getItemWidth(availableSize, cachedValues, cachedDatetimes, zoomFactor);
                    var max = self._getMaxDatetime(cachedValues, cachedDatetimes),
                        min = self._getMinDatetime(cachedValues, cachedDatetimes);
                    if (max === min) {
                        return leftSpace + itemWidth / 2;
                    }
                    var datetime = cachedDatetimes[index];
                    if (!datetime) {
                        return 0;
                    }
                    // -itemWidth;// -itemWidth;
                    var canvasWidth = availableSize.Width - leftSpace - self._getSpace(zoomFactor);
                    canvasWidth -= itemWidth; // minus for the last item's width
                    var range = max - min;
                    return leftSpace + Math_floor(((datetime - min) / range) * canvasWidth);
                }

                itemWidth = self._getItemWidth(availableSize, cachedValues, cachedDatetimes, zoomFactor);
                var valueIndex = ArrayHelper_indexOf(self._getCachedIndexMaping(cachedValues, cachedDatetimes), index),
                    x = leftSpace + itemWidth * valueIndex;
                return Math_floor(x);
            },
            _getCanvasSize: function (availableSize, zoomFactor) {
                var self = this;
                var w = availableSize.Width - self._getSpace(zoomFactor) - self._getSpace(zoomFactor);
                w = Math_max(w, 0);
                var h = availableSize.Height - self._getSpace(zoomFactor) - self._getSpace(zoomFactor);
                h = Math_max(h, 0);
                return {Width: w, Height: h};
            },
            _getMaxMinValue: function (cachedValues) {
                var self = this;
                var valueCount = cachedValues.length, item;
                for (var i = 0; i < valueCount; i++) {
                    item = cachedValues[i];
                    if (typeof item !== const_undefined && item !== keyword_null) {
                        if (typeof item !== 'number') {
                            item = 0;
                        }
                        if (item < self._cachedMinValue) {
                            self._cachedMinValue = item;
                        }
                        if (item > self._cachedMaxValue) {
                            self._cachedMaxValue = item;
                        }
                    }
                }
            },
            _getActualMaxValue: function (cachedValues) {
                var self = this;
                if (self._cachedMaxValue === -NUMBER_MAX_VALUE || !self._cachedMaxValue) {
                    self._getMaxMinValue(cachedValues);
                }
                var settingOptions = self.setting.options, maxAxisType = settingOptions.maxAxisType;
                if (maxAxisType === 0 /* individual */) {
                    return self._cachedMaxValue;
                } else if (maxAxisType === 1 /* group */) {
                    return settingOptions.groupMaxValue;
                } else if (maxAxisType === 2 /* custom */) {
                    return settingOptions.manualMax;
                }
                return self._cachedMaxValue;
            },
            _getActualMinValue: function (cachedValues) {
                var self = this;
                if (self._cachedMinValue === NUMBER_MAX_VALUE || !self._cachedMinValue) {
                    self._getMaxMinValue(cachedValues);
                }
                var settingOptions = self.setting.options, maxAxisType = settingOptions.minAxisType;
                if (maxAxisType === 0 /* individual */) {
                    return self._cachedMinValue;
                } else if (maxAxisType === 1 /* group */) {
                    return settingOptions.groupMinValue;
                } else if (maxAxisType === 2 /* custom */) {
                    return settingOptions.manualMin;
                }
            },
            _getItemHeightNormal: function (availableSize, index, cachedValues, zoomFactor) {
                var size = this._getCanvasSize(availableSize, zoomFactor), max = this._getActualMaxValue(cachedValues),
                    min = this._getActualMinValue(cachedValues), range = max - min, value, d;
                if (max === min) {
                    if (max === 0) {
                        return 0;
                    }
                    range = Math_abs(max);
                }
                value = cachedValues[index];
                if (!value) {
                    value = 0;
                }
                d = size.Height / range;
                return value * d;
            },
            _getItemHeight: function (availableSize, index, cachedValues, zoomFactor) {
                var self = this;
                var sparklineType = self.options.sparklineType, value;
                if (sparklineType === 0 /* line */) {
                    return self._getItemHeightNormal(availableSize, index, cachedValues, zoomFactor);
                } else if (sparklineType === 1 /* column */) {
                    value = cachedValues[index];
                    if (self.setting.options.displayEmptyCellsAs === 1 /* Zero */ && (typeof value === const_undefined || value === keyword_null)) {
                        return 0;
                    }
                    var h = self._getItemHeightNormal(availableSize, index, cachedValues, zoomFactor);
                    if (h > -self._minItemHeight && h < self._minItemHeight) {
                        if (value > 0) {
                            return h + self._minItemHeight;
                        } else if (value < 0) {
                            return h - self._minItemHeight;
                        }
                    }
                    return h;
                } else if (sparklineType === 2 /* winloss */) {
                    value = cachedValues[index];
                    if (typeof value === const_undefined || value === keyword_null || value === 0 || isNaN(value)) {
                        return 0;
                    }
                    var size = self._getCanvasSize(availableSize, zoomFactor);
                    if (value >= 0) {
                        return size.Height / 2;
                    }
                    return -size.Height / 2;
                }
            },
            _getAxisYNormal: function (availableSize, cachedValues, zoomFactor) {
                var self = this;
                var size = self._getCanvasSize(availableSize, zoomFactor), max = self._getActualMaxValue(cachedValues),
                    min = self._getActualMinValue(cachedValues);
                // if there is no value.
                if (max === -NUMBER_MAX_VALUE || min === NUMBER_MAX_VALUE) {
                    return availableSize.Height / 2;
                }
                var range = max - min;
                if (max === min) {
                    if (max === 0) {
                        return availableSize.Height / 2;
                    }
                    range = max;
                    if (max < 0) {
                        max = 0;
                    }
                }
                var d = size.Height / range;
                return self._getSpace(zoomFactor) + max * d;
            },
            _getAxisY: function (availableSize, cachedValues, zoomFactor) {
                if (this.options.sparklineType === 2 /* winloss */) {
                    return availableSize.Height / 2;
                }
                return this._getAxisYNormal(availableSize, cachedValues, zoomFactor);
            },
            _getItemVisibleHeightNormal: function (availableSize, index, cachedValues, zoomFactor) {
                var self = this;
                var size = self._getCanvasSize(availableSize, zoomFactor), max = self._getActualMaxValue(cachedValues),
                    min = self._getActualMinValue(cachedValues), range = max - min, d, value;
                if (max === min) {
                    if (max === 0) {
                        return 0;
                    }
                    range = max;
                }
                d = size.Height / range;
                value = self._getValue(index, cachedValues);
                if (typeof value === const_undefined || value === keyword_null) {
                    value = 0;
                }
                if (max !== min && max * min > 0) {
                    var visibleHeight = 0;
                    if (value >= 0) {
                        visibleHeight = (value - min) * d;
                    } else {
                        visibleHeight = (value - max) * d;
                    }
                    return visibleHeight;
                }
                return value * d;
            },
            _getItemVisibleHeight: function (availableSize, index, cachedValues, zoomFactor) {
                var self = this;
                var sparklineType = self.options.sparklineType;
                if (sparklineType === 0 /* line */) {
                    return self._getItemVisibleHeightNormal(availableSize, index, cachedValues, zoomFactor);
                } else if (sparklineType === 1 /* column */) {
                    var h = self._getItemVisibleHeightNormal(availableSize, index, cachedValues, zoomFactor),
                        minItemHeight = self._minItemHeight;
                    if (h > -minItemHeight && h < minItemHeight) {
                        var value = self._getValue(index, cachedValues);
                        if (typeof value === const_undefined || value === keyword_null) {
                            value = 0;
                        }
                        if (value !== 0) {
                            if (value > 0) {
                                return h + minItemHeight;
                            }
                            return h - minItemHeight;
                        }
                    }
                    return h;
                } else if (sparklineType === 2 /* winloss */) {
                    return self._getItemHeight(availableSize, index, cachedValues, zoomFactor);
                }
            },
            _getDataPointPositionNormal: function (index, availableSize, cachedValues, cachedDatetimes, zoomFactor) {
                var self = this;
                var itemWidth = self._getItemWidth(availableSize, cachedValues, cachedDatetimes, zoomFactor),
                    x = self._getItemX(availableSize, index, cachedValues, cachedDatetimes, zoomFactor);
                if (itemWidth < 0) {
                    itemWidth = 0;
                }
                itemWidth = Math_floor(itemWidth);
                if (itemWidth % 2 === 1) {
                    itemWidth += 1;
                }
                var height = self._getItemHeight(availableSize, index, cachedValues, zoomFactor),
                    axis = self._getAxisY(availableSize, cachedValues, zoomFactor),
                    max = self._getActualMaxValue(cachedValues),
                    min = self._getActualMinValue(cachedValues), y = 0;
                if (max < 0 && min < 0) {
                    y = Math_max(self._getSpace(zoomFactor), axis);
                } else {
                    y = axis;
                    if (height >= 0) {
                        y = axis - height;
                    }
                }
                var visibleHeight = self._getItemVisibleHeight(availableSize, index, cachedValues, zoomFactor),
                    rect = new _PositionRect(x, y, itemWidth, Math_abs(visibleHeight));
                if (height !== 0) {
                    var topSpace = self._getSpace(zoomFactor);
                    if (rect.Y < topSpace && rect.Bottom < topSpace + 1) {
                        rect.Height = Math_floor(rect.Height + 1);
                    } else {
                        var bottomLine = availableSize.Height - self._getSpace(zoomFactor);
                        if (rect.Bottom > bottomLine && rect.Y > bottomLine - 1) {
                            rect.Y = bottomLine - visibleHeight;
                            rect.Height = visibleHeight;
                        }
                    }
                }
                return rect;
            },
            _getLineWeight: function (zoomFactor) {
                var lineWeight = this.setting.options.lineWeight * zoomFactor;
                if (lineWeight < 1) {
                    lineWeight = 1;
                }
                return lineWeight;
            },
            _getDataPointPosition: function (index, availableSize, cachedValues, cachedDatetimes, zoomFactor) {
                var self = this;
                var lineWeight = self._getLineWeight(zoomFactor);
                lineWeight++;
                if (lineWeight < 2) {
                    lineWeight = 2;
                }
                var rec = self._getDataPointPositionNormal(index, availableSize, cachedValues, cachedDatetimes, zoomFactor);
                if (self.options.sparklineType === 0 /* line */) {
                    // for line type;
                    rec.X = rec.X + (rec.Width - lineWeight) / 2;
                    var value = self._getValue(index, cachedValues);
                    if (typeof value !== const_undefined && value !== keyword_null) {
                        if (value >= 0) {
                            rec.Y -= lineWeight / 2;
                        } else {
                            rec.Y = rec.Bottom - lineWeight / 2;
                        }
                        rec.Width = lineWeight;
                        rec.Height = lineWeight;
                    } else {
                        rec.Width = 0;
                        rec.Height = 0;
                    }
                }
                if (self.setting.options.rightToLeft) {
                    var left = rec.X, reverseLeft = availableSize.Width - left, newLeft = reverseLeft - rec.Width;
                    rec = new _PositionRect(newLeft, rec.Y, rec.Width, rec.Height);
                }
                return rec;
            }
        };

        function _PositionRect(x, y, w, h) {
            var self = this;
            self.X = x;
            self.Y = y;
            self.Width = w;
            self.Height = h;
            self.Left = self.X;
            self.Right = self.Left + self.Width;
            self.Top = self.Y;
            self.Bottom = self.Y + self.Height;
        }

        return SparklineRender;
    })();
    exports.SparklineRender = SparklineRender;
    exports.SparklineExRenders = {
        PIESPARKLINE: pieSparkline_paint,
        AREASPARKLINE: areaSparkline_paint,
        SCATTERSPARKLINE: scatterSparkline_paint,
        BULLETSPARKLINE: bulletSparkline_paint,
        SPREADSPARKLINE: spreadSparkline_paint,
        STACKEDSPARKLINE: stackedSparkline_paint,
        HBARSPARKLINE: hBarSparkline_paint,
        VBARSPARKLINE: vBarSparkline_paint,
        VARISPARKLINE: variSparkline_paint,
        BOXPLOTSPARKLINE: boxPlotSparkline_paint,
        CASCADESPARKLINE: cascadeSparkline_paint,
        PARETOSPARKLINE: paretoSparkline_paint,
        MONTHSPARKLINE: monthSparkline_paint,
        YEARSPARKLINE: yearSparkline_paint
    };
    // </editor-folder>

    module.exports = exports;

}());