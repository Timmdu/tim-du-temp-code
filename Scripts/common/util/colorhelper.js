(function () {
    'use strict';

    var Common = require('./common.js');
    var _toHexString = require('./numberhelper.js')._toHexString;

    var Math_min = Math.min, Math_max = Math.max, Math_abs = Math.abs;
    var parseIntFn = parseInt;

    var ColorHelper = (function () {
        function ColorHelper() {

        }

        ColorHelper._toString = function (color) {
            // default arguments is "#ffabcdef" or 'blue' like.
            var a = color.a;
            var r = color.r;
            var g = color.g;
            var b = color.b;
            if (arguments.length === 3) { // arguments is (255, 255, 255)
                a = 255;
                r = arguments[0];
                g = arguments[1];
                b = arguments[2];
            }
            if (arguments.length === 4) { // arguments is (255, 255, 255, 255)
                a = arguments[0];
                r = arguments[1];
                g = arguments[2];
                b = arguments[3];
            }
            if (a === 255) {
                return '#' + _toHexString(r, true, 2) + _toHexString(g, true, 2) + _toHexString(b, true, 2);
            }
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        };

        ColorHelper._equal = function (color1, color2) {
            return color1.a === color2.a && color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
        };

        ColorHelper._getBrightness = function (color) {
            return ((color.r * 299) + (color.g * 587) + (color.b * 114)) / 1000;
        };
        ColorHelper._hueToRGB = function (n1, n2, hue) {
            if (hue < 0) {
                hue += 240;
            }
            if (hue > 240) {
                hue -= 240;
            }
            if (hue < 40) {
                return (n1 + ((((n2 - n1) * hue) + 20) / 40));
            }
            if (hue < 120) {
                return n2;
            }
            if (hue < 160) {
                return (n1 + ((((n2 - n1) * (160 - hue)) + 20) / 40));
            }
            return n1;
        };
        function saturate(n1, n2, hue) {
            return (((ColorHelper._hueToRGB(n1, n2, hue) * 0xff) + 120) / 240) & 255;//convert to byte
        }

        ColorHelper._fromHLS = function (hue, luminosity, saturation) {
            var r, g, b;

            if (saturation === 0) {
                r = g = b = parseIntFn(((luminosity * 0xff) / 240), 10);
            } else {
                var n1, n2;
                n2 = (luminosity <= 120)
                    ? parseIntFn(((luminosity * (240 + saturation)) + 120) / 240)
                    : (luminosity + saturation) - parseIntFn(((luminosity * saturation) + 120) / 240);

                n1 = (2 * luminosity) - n2;

                r = saturate(n1, n2, hue + 80);
                g = saturate(n1, n2, hue);
                b = saturate(n1, n2, hue - 80);
            }
            return {a: 0xff, r: r, g: g, b: b};

        };
        ColorHelper._isTwoColorSimilar = function (color1, color2) {
            // calculate differences between reds, greens and blues
            var r = 255 - Math_abs(color1.r - color2.r);
            var g = 255 - Math_abs(color1.g - color2.g);
            var b = 255 - Math_abs(color1.b - color2.b);
            var a = Math_abs(color1.a - color2.a);
            // limit differences between 0 and 1
            r /= 255;
            g /= 255;
            b /= 255;
            // 0 means opposite colors, 1 means same colors
            var judge = (r + g + b) / 3;
            return !!(judge >= 0.9 && a <= 0.05);

        };
        ColorHelper._invertColor = function (color) {
            var r = color.r ^ 255;
            var g = color.g ^ 255;
            var b = color.b ^ 255;
            return ColorHelper._toString(color.a, r, g, b);
        };
        function stringToARGB(value) {
            var canvasContext = ColorHelper._ctx;
            if (!canvasContext) {
                var c = document.createElement('canvas');
                if (c && c.getContext) {
                    canvasContext = ColorHelper._ctx = c.getContext('2d');
                }
            }
            if (!canvasContext) {
                return value;
            }
            canvasContext.clearRect(1, 1, 1, 1);
            canvasContext.fillStyle = value;
            canvasContext.fillRect(1, 1, 1, 1);

            var imgData = canvasContext.getImageData(1, 1, 1, 1);
            if (imgData) {
                return imgData.data;
            }
            return null;
        }

        ColorHelper._fromString = function (value) {
            if (value instanceof ColorHelper) {
                return value;
            }
            var a = 0, r = 0, g = 0, b = 0;
            if (value) {
                var val = stringToARGB(value);
                if (val) {
                    r = val[0];
                    g = val[1];
                    b = val[2];
                    a = val[3];
                }
            }
            return {a: a, r: r, g: g, b: b};
        };
        ColorHelper._applyTint = function (color, tint) {
            if (tint === 0) {
                return color;
            }
            var hls = new HLSColor(color); /* NOSONAR: VariableDeclarationAfterUsage */
            var lumDiff = parseIntFn((tint > 0 ? ((240 - hls._luminosity) * tint) : (hls._luminosity * tint)), 10);
            return ColorHelper._fromHLS(hls._hue, hls._luminosity + lumDiff, hls._saturation);
        };
        ColorHelper._getLighterColor = function (colorString, percentLighter) {
            var color = ColorHelper._fromString(colorString);
            var hls = new HLSColor(color);
            var lighterColor = hls._getLighterColor(percentLighter);
            return ColorHelper._toString(lighterColor);
        };

        return ColorHelper;
    })();

    var HLSColor = (function () {
        function HLSColor(rgbColor) {
            var self = this;
            var r = rgbColor.r, g = rgbColor.g, b = rgbColor.b;
            var maxUnit = Math_max(Math_max(r, g), b);
            var minUnit = Math_min(Math_min(r, g), b);
            var sum = maxUnit + minUnit;
            self._luminosity = parseIntFn((((sum * 240) + 0xff) / 510), 10);
            var diff = maxUnit - minUnit;
            if (diff === 0) {
                self._saturation = 0;
                self._hue = 160;
            } else {
                if (self._luminosity <= 120) {
                    self._saturation = parseIntFn((((diff * 240) + (sum / 2)) / sum), 10);
                } else {
                    self._saturation = parseIntFn((((diff * 240) + ((510 - sum) / 2)) / (510 - sum)), 10);
                }
                var partR = (((maxUnit - r) * 40) + (diff / 2)) / diff;
                var partG = (((maxUnit - g) * 40) + (diff / 2)) / diff;
                var partB = (((maxUnit - b) * 40) + (diff / 2)) / diff;
                if (r === maxUnit) {
                    self._hue = parseIntFn((partB - partG), 10);
                } else if (g === maxUnit) {
                    self._hue = parseIntFn(((80 + partR) - partB), 10);
                } else {
                    self._hue = parseIntFn(((160 + partG) - partR), 10);
                }
                if (self._hue < 0) {
                    self._hue += 240;
                }
                if (self._hue > 240) {
                    self._hue -= 240;
                }
            }
        }

        HLSColor.prototype = {
            constructor: HLSColor,
            // toColor: function () {
            //    return fromHLS(this._hue, this._luminosity, this._saturation);
            // },
            _getLighterColor: function (percentLighter) {
                var self = this;
                var luminosity = self._luminosity;
                var newLuma = self._newLuma(self._luminosity, 500, true);
                return ColorHelper._fromHLS(self._hue, luminosity + ((newLuma - luminosity) * percentLighter), self._saturation);
            },
            // getDrakerColor: function (percentDarker) {
            //    var self = this;
            //    var _newLuma = self._newLuma(self._luminosity, -333, true);
            //    return fromHLS(self._hue, _newLuma * (1 - percentDarker), self._saturation);
            // },
            _newLuma: function (luminosity, n, scale) {
                if (n === 0) {
                    return luminosity;
                }
                if (scale) {
                    if (n > 0) {
                        return (((luminosity * (0x3e8 - n)) + (0xf1 * n)) / 0x3e8);
                    }
                    return ((luminosity * (n + 0x3e8)) / 0x3e8);
                }
                luminosity += ((n * 240) / 0x3e8);
                if (luminosity < 0) {
                    luminosity = 0;
                }
                if (luminosity > 240) {
                    luminosity = 240;
                }
                return luminosity;
            }
        };
        return HLSColor;
    })();


    Common._ColorHelper = ColorHelper;

    module.exports = Common;

}());