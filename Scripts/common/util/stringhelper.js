(function() {
    'use strict';

    var isNullOrUndefined = require('./types')._isNullOrUndefined;
    
    function substr(str, start, length) {
        return str.substr(start, length);
    }
    
    var StringHelper = {
        _contains: function (str, value, ignoreCase) {
            if (ignoreCase) {
                str = str.toLowerCase();
                value = value.toLowerCase();
            }
            return value === '' || str.indexOf(value) >= 0;
        },
        _indexOf: function (str, value, ignoreCase) {
            if (ignoreCase) {
                var tempStr = str.toLowerCase();
                var tempValue = value.toLowerCase();
                return tempStr.indexOf(tempValue);
            }
            return str.indexOf(value);
        },
        // todo: str = 'ababcdef',trimChar = 'ab' ->'cdef'
        _trimStart: function (str, trimChar) {
            if (!trimChar) {
                return str;
            }
            var temp = str;
            while (substr(temp, 0, trimChar.length) === trimChar) {
                temp = substr(temp, trimChar.length);
            }
            return temp;
        },
        // todo: str = 'cdefabab', trimChar = 'ab'->'cdef'
        _trimEnd: function (str, trimChar) {
            if (!trimChar) {
                return str;
            }
            var temp = str;
            while (substr(temp, temp.length - trimChar.length, trimChar.length) === trimChar) {
                temp = substr(temp, 0, temp.length - trimChar.length);
            }
            return temp;
        },
        _insert: function (str, startIndex, value) {
            if (startIndex < 0 || startIndex > str.length || isNullOrUndefined(value)) {
                throw new Error();
            }
            var tempStrStart = substr(str, 0, startIndex);
            var tempStrEnd = substr(str, startIndex, str.length - startIndex);
            return tempStrStart + value + tempStrEnd;
        },
        _remove: function (str, startIndex, count) {
            if (isNullOrUndefined(count)) {
                count = str.length - startIndex;
            }
            if (startIndex < 0 || count < 0 || startIndex + count > str.length) {
                throw new Error();
            }
            var valueStart = substr(str, 0, startIndex);
            var valueEnd = substr(str, startIndex + count, str.length - startIndex - count);
            return valueStart + valueEnd;
        },
        _startsWith: function (str, value, ignoreCase) {
            return stringWith(str, value, ignoreCase, function (str1, str2) {
                return str1.slice(0, str2.length) === str2;
            });
        },
        _endsWith: function (str, value, ignoreCase) {
            return stringWith(str, value, ignoreCase, function (str1, str2) {
                return str1.slice(-str2.length) === str2;
            });
        },
        _replace: function (str, oldValue, newValue, ignoreCase) {
            if (!oldValue) {
                throw new Error();
            }
            // Because $ will be treated as a special replacement pattern, hence, the case "123$$" should be changed to "123$$$$" for correctly replace.
            newValue = ('' + newValue).replace(/\$/g, '$$$$');
            return str.replace(new RegExp(oldValue, 'g' + (ignoreCase ? 'i' : '')), newValue);
        },
        _replaceAllNoReg: function (str, oldValue, newValue, ignoreCase) {
            oldValue = require('./regexhelper.js')._replaceRegString2NormalString(oldValue);
            return this._replace(str, oldValue, newValue, ignoreCase);
        },
        _leftBefore: function (src, suffex) {
            var index = src.indexOf(suffex);
            if (index < 0 || index >= src.length) {
                return src;
            }
            return substr(src, 0, index);
        },
        _count: function (src, ss) {
            var count = 0, pos = src.indexOf(ss);
            while (pos >= 0) {
                count += 1;
                pos = src.indexOf(ss, pos + 1);
            }
            return count;
        },
        _join: function (src, substring, replacement) {
            return src.split(substring).join(replacement);
        },
        _format: function (format, args) {
            var f = format;
            for (var i = 0; i < args.length; i++) {
                var re = new RegExp('\\{' + i + '\\}', 'g');
                f = f.replace(re, args[i]);
            }
            return f;
        },
        //_padLeft: function (string, padStr, count) {
        //    // Array(count + 1).join(padStr) : make a string like '000000000'
        //    // string.slice : slice right characters by count
        //    return (Array(count + 1).join(padStr) + string).slice(-count);
        //},
        //_padRight: function (string, padStr, count) {
        //    return (string + Array(count + 1).join(padStr)).slice(0, count);
        //},
        _padZero: function (str, count, left) {
            var str2 = str.toString();
            for (var l = str2.length; l < count; l++) {
                str2 = (left ? ('0' + str2) : (str2 + '0'));
            }
            return str2;
        },
        _padZeroLeft: function (string, count) {
            return StringHelper._padZero(string, count, true);
        },
        _padZeroRight: function (string, count) {
            return StringHelper._padZero(string, count, false);
        },
        _compareStringIgnoreCase: function (s1, s2) {
            return s1 === s2 || !s1 && !s2 || s1 && s2 && s1.toLowerCase() === s2.toLowerCase();
        },
        _toUpperCase: function (string) {
            return string.toUpperCase();
        },
        _escapeHtml: function (str) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '\'': '&#x27;',
                '`': '&#x60;'
            };
            var replaceReg = require('./regexhelper.js')._getReg('(?:&|<|>|\"|\'|`)');
            return replaceReg.test(str) ? str.replace(replaceReg, function (m) {
                return map[m];
            }) : str;
        },
        _unescapeHtml: function (str) {
            var map = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#x27;': '\'',
                '&#x60;': '`'
            };
            var replaceReg = require('./regexhelper.js')._getReg('(?:&amp;|&lt;|&gt;|&quot;|&#x27;|&#x60;)');
            return replaceReg.test(str) ? str.replace(replaceReg, function (m) {
                return map[m];
            }) : str;
        }
    };
    
    function stringWith(str, value, ignoreCase, callBack) {
        if (isNullOrUndefined(value)) {
            throw new Error();
        }
        if (value === '') {
            return true;
        }
        if (value.length > str.length) {
            return false;
        }
        var thisStr = str;
        var valueStr = value;
        if (ignoreCase) {
            thisStr = thisStr.toLowerCase();
            valueStr = valueStr.toLowerCase();
        }
        return callBack(thisStr, valueStr);
    }
    
    module.exports = StringHelper;

}());