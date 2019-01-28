(function() {
    'use strict';

    var common = {};
    var cM = require('../culture/cultureInfo.js').CultureManager;
    
    
    var getResource = function (resources) {
        return function () {
            var cultureName = cM.culture();
            if (resources && cultureName) {
                var key = cultureName.substr(0, 2).toLowerCase();
                if (resources.hasOwnProperty(key)) {
                    return resources[key];
                }
                return resources.en;
            }
            return {};
        };
    };
    
    function addElements(a, aCount, index, count) {
        if (a && 0 <= index && index < aCount) {
            var rows = [], rowCount, i;
            for (i = index; i < aCount; i++) {
                if (typeof (a[i]) !== 'undefined') {
                    rows.push(i);
                }
            }
            rowCount = rows.length;
            for (i = 0; i < rowCount; i++) {
                var k = rows[rowCount - i - 1];
                var value = a[k];
                a[k] = null;
                a[Math.floor(k) + count] = value;
            }
        }
    }
    function deleteElements(a, aCount, index, count) {
        if (a && 0 <= index && index < aCount) {
            var rows = [], rowCount, index2 = index + count, i;
            for (i = index; i < aCount; i++) {
                if (typeof (a[i]) !== 'undefined') {
                    if (index <= i && i < index2) {
                        a[i] = null;
                    } else if (i >= index2) {
                        rows.push(i);
                    }
                }
            }
            rowCount = rows.length;
            for (i = 0; i < rowCount; i++) {
                var k = rows[i];
                var value = a[k];
                a[k] = null;
                a[Math.floor(k) - count] = value;
            }
        }
    }
    function hasOwnProperty(obj, property) {
        return obj.hasOwnProperty(property);
    }
    function isInstanceOf(obj, type) {
        return obj instanceof type;
    }
    
    common._addElements = addElements;
    common._deleteElements = deleteElements;
    common._getResource = getResource;
    common._hasOwnProperty = hasOwnProperty;
    common._isInstanceOf = isInstanceOf;
    
    module.exports = common;

}());