(function () {
    'use strict';

    var keyword_null = null, keyword_undefined = void 0;

    var ArrayHelper = (function () {
        function ArrayHelper() {
        }

        ArrayHelper._insert = function (array, index, item) {
            array.splice(index, 0, item);
        };
        ArrayHelper._add = function (array, item) {
            array.push(item);
        };
        ArrayHelper._contains = function (array, item) {
            return array.indexOf(item) > -1;
        };
        ArrayHelper._remove = function (array, item) {
            var index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        };
        ArrayHelper._removeByIndex = function (array, index) {
            return array.slice(0, index).concat(array.slice(index + 1));
        };
        ArrayHelper._indexOf = function (array, item, start) {
            return array.indexOf(item, start);
        };
        ArrayHelper._clear = function (array, index, count) {
            if (index < 0) {
                return;
            }
            for(var i = 0; i < count && index + i < array.length; i++) {
                array[index + i] = keyword_null;
            }
        };
        ArrayHelper._nextNonEmptyIndex = function (array, index) {
            if (index < 0) {
                index = -1;
            }
            var n = index + 1;
            for (var i = n; i < array.length; i++) {
                if (array[i] !== keyword_undefined && array[i] !== keyword_null) {
                    return i;
                }
            }
            return -1;
        };
        ArrayHelper._getLength = function (array) {
            return array && array.length;
        };

        function cloneArray(newArray, source) {
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    var item = source[i];
                    if (Array.isArray(item)) {
                        newArray[i] = [];
                        cloneArray(newArray[i], source[i]);
                    } else if (typeof item === "object") {
                        newArray[i] = {};
                        cloneArray(newArray[i], source[i]);
                    } else {
                        newArray[i] = source[i];
                    }
                }
            }
        }

        ArrayHelper._clone = function (array) {
            var result = [];
            cloneArray(result, array);
            return result;
        };
        return ArrayHelper;
    })();

    module.exports = ArrayHelper;

}());