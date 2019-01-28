(function () {
    'use strict';

    var Types = {};
    Types._each = function (obj, callback) {
        var value, isArray = Types._isArraylike(obj);
        if (isArray) {
            for (var i = 0, length = obj.length; i < length; i++) {
                value = callback.call(obj[i], i, obj[i]);
                if (value === false) {
                    break;
                }
            }
        } else {
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    value = callback.call(obj[p], p, obj[p]);
                    if (value === false) {
                        break;
                    }
                }
            }
        }
        return obj;
    };
    Types._isEmptyObject = function (obj) {
        return obj ? (typeof obj === 'object') && (Object.keys(obj).length === 0) : true;
    };
    Types._isFunction = function (obj) {
        return Types._getType(obj) === 'function';
    };
    Types._isArray = function (obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        }
        return Types._getType(obj) === 'array';
    };
    Types._isNumeric = function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };
    Types._getType = function (obj) {
        if (obj === null) {
            return "null";
        }
        var class2type = Types._class2type;
        if (!class2type) {
            class2type = Types._class2type = {};
            var arr = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'];
            for (var i = 0, length = arr.length; i < length; i++) {
                class2type['[object ' + arr[i] + ']'] = arr[i].toLowerCase();
            }
        }
        var core_toString = class2type.toString;
        var typeofObj = typeof obj;
        return typeofObj === 'object' || typeofObj === 'function' ? class2type[core_toString.call(obj)] || 'object' : typeofObj;
    };
    Types._inArray = function (elem, arr, i) {
        var len;
        if (arr) {
            var core_indexOf = [].indexOf;
            if (core_indexOf) {
                return core_indexOf.call(arr, elem, i);
            }
            len = arr.length;
            if (Types._isNullOrUndefined(i)) {
                i = 0;
            }
            i = i < 0 ? Math.max(0, len + i) : i;
            for (; i < len; i++) {
                // Skip accessing in sparse arrays
                if (i in arr && arr[i] === elem) {
                    return i;
                }
            }
        }
        return -1;
    };
    Types._merge = function (first, second) {
        var l = second.length, i = first.length, j = 0;
        if (typeof l === 'number') {
            for (; j < l; j++) {
                first[i++] = second[j];
            }
        } else {
            while (second[j] !== undefined) {
                first[i++] = second[j++];
            }
        }
        first.length = i;
        return first;
    };
    Types._map = function (elems, callback, arg) {
        var value, i = 0, length = elems.length, isArray = Types._isArraylike(elems), ret = [];
        // Go through the array, translating each of the items to their
        if (isArray) {
            for (; i < length; i++) {
                value = callback(elems[i], i, arg);
                if (value !== null) {
                    ret[ret.length] = value;
                }
            }
        } else {
            for (i in elems) {
                if (elems.hasOwnProperty(i)) {
                    value = callback(elems[i], i, arg);
                    if (value !== null) {
                        ret[ret.length] = value;
                    }
                }
            }
        }
        // Flatten any nested arrays
        var core_concat = [].concat;
        return core_concat.apply([], ret);
    };
    Types._extend = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length,
            deep = false;
        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }
        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== 'object' && !Types._isFunction(target)) {
            target = {};
        }
        // extend GC$ itself if only one argument is passed
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            options = arguments[i];
            // Only deal with non-null/undefined values
            if (!Types._isNullOrUndefined(options)) {
                for (name in options) { /* NOSONAR: ForIn */ // eslint-disable-line guard-for-in
                    src = target[name];
                    copy = options[name];
                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }
                    // Recurse if we're merging plain objects or arrays
                    copyIsArray = Types._isArray(copy);
                    if (deep && copy && (Types._isPlainObject(copy) || copyIsArray)) {
                        if (copyIsArray) {
                            clone = src && Types._isArray(src) ? src : [];
                        } else {
                            clone = src && Types._isPlainObject(src) ? src : {};
                        }
                        // Never move original objects, clone them
                        target[name] = Types._extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    };
    Types._inherit = function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) {
                d[p] = b[p];
            }
        }
        function __() {
            this.constructor = d;
        }

        __.prototype = b.prototype;
        d.prototype = new __();
    };
    Types._isWindow = function (obj) {
        return obj !== null && obj === obj.window;
    };
    Types._isPlainObject = function (obj) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || Types._getType(obj) !== 'object' || obj.nodeType || Types._isWindow(obj)) {
            return false;
        }
        var core_hasOwn = {}.hasOwnProperty;
        try {
            // Not own constructor property must be Object
            if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {
            // add this comment just for eslint;
        }
        return key === undefined || core_hasOwn.call(obj, key);
    };
    Types._isArraylike = function (obj) {
        if (Types._isNullOrUndefined(obj)) {
            return false;
        }
        var length = obj.length, type = Types._getType(obj);
        if (Types._isWindow(obj)) {
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === 'array' || type !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && (length - 1) in obj); /* NOSONAR: S3758, Values not convertible to numbers should not be used in numeric comparisons */
    };
    Types._makeArray = function (arr, results) {
        var ret = results || [];
        if (arr !== null) {
            if (Types._isArraylike(Object(arr))) {
                Types._merge(ret, typeof arr === 'string' ? [arr] : arr);
            } else {
                [].push.call(ret, arr);
            }
        }
        return ret;
    };
    Types._isType = function (obj, type) {
        if (Types._isNullOrUndefined(obj)) {
            return type === 'null';
        }
        if (!type) {
            return false;
        }
        if (type instanceof Function && obj instanceof type) {
            return true;
        }

        if (typeof obj === type) {
            return true;
        }
        if (type === 'function' && /^\s*\bfunction\b/.test('' + obj)) {
            return true;
        }

        if (Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() === type.toLowerCase()) {
            return true;
        }
        if (type === 'DateTime' || type === 'TimeSpan') {
            return obj instanceof Date;
        }
        if (typeof type === 'string' && 'undefined number boolean string'.indexOf(type) > -1) {
            return false;
        }
        return false;
    };
    Types._isNullOrUndefined = function (value) {
        return value === void 0 || value === null;
    };
    Types._isNumber = function (value, cultureName) {
        var numHelper = require('./numberhelper.js');
        if (!numHelper._isValidCultureNumberString(value, cultureName)) {
            return false;
        }
        value = numHelper._replaceCultureSymbolToNormal(value, cultureName);
        return Types._isType(value, 'number') || Types._isType(value, 'DateTime') || Types._isType(value, 'TimeSpan') ||
            (value && !Types._isType(value, 'boolean') && !isNaN(value) && !isNaN(parseFloat(value)) && !(value.length >= 2 && value[0] === '0' && value[1] === 'x'));
        // if value is a hexadecimal number string, isNaN will return false. So the value will be treat as number, but excel treat it as string.
    };
    Types._toDouble = function (value) {
        var DateTimeHelper = require('./datetimehelper.js');
        if (Types._isNullOrUndefined(value) || value === '') {
            return 0.0;
        } else if (Types._isType(value, 'number')) {
            return value;
        } else if (Types._isType(value, 'string') && !isNaN(value)) {
            return require('./numberhelper.js')._parseLocale(value);
        } else if (Types._isType(value, 'boolean')) {
            return value ? 1.0 : 0.0;
        } else if (Types._isType(value, 'DateTime')) {
            return DateTimeHelper._toOADate(value);
        } else if (Types._isType(value, 'TimeSpan')) {
            return Math.floor(DateTimeHelper._toOADate(value));
        }
        return parseFloat(value);
    };

    Types._cloneObject = function (obj) {
        if (!obj) {
            return obj;
        }
        if (typeof (obj) === 'number' || typeof (obj) === 'string' || typeof (obj) === 'boolean' || Types._isNullOrUndefined(obj)) {
            return obj;
        } else if (obj.clone) {
            return obj.clone();
        } else if (obj instanceof Date) {
            return new Date(obj);
        }
        var objClone, key, value;
        if (obj instanceof Object) {
            objClone = new obj.constructor();
        } else {
            objClone = new obj.constructor(obj.valueOf());
        }
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                value = obj[key];
                if (obj.hasOwnProperty(key) && objClone[key] !== value) {
                    if (typeof (value) === 'object') {
                        objClone[key] = Types._cloneObject(value);
                    } else {
                        objClone[key] = value;
                    }
                }
            }
        }
        objClone.toString = obj.toString;
        objClone.valueOf = obj.valueOf;
        return objClone;
    };

    module.exports = Types;

}());