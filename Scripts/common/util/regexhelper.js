(function() {
    'use strict';

    var StringHelper = require('./stringhelper.js');
    
    var RegexHelper = (function () {
        function RegexHelper() {
        }
    
        RegexHelper._getReg = function (regStr) {
            var reg = RegexHelper._regDict[regStr];
            if (!reg) {
                reg = RegexHelper._regDict[regStr] = new RegExp(regStr, 'g');
            }
            reg.lastIndex = 0;
            return reg;
        };
        RegexHelper._getRegIgnoreCase = function (regStr) {
            var reg = RegexHelper._regDictIgnoreCase[regStr];
            if (!reg) {
                reg = RegexHelper._regDictIgnoreCase[regStr] = new RegExp(regStr, 'gi');
            }
            reg.lastIndex = 0;
            return reg;
        };
        RegexHelper._getWildcardCriteria = function (criteria, ignoreTilda /* ~ */, exactMatch) {
            if (RegexHelper._wildcardParseRecord[criteria]) {
                return RegexHelper._wildcardParseResultBuffer[criteria];
            }
            var wildcardChars = '[~?*]+';
            if (RegexHelper._getReg(wildcardChars).test(criteria)) {
                var result = [];
                var charArray = criteria.split(''), currentChar;
                var escapeCharDict = {
                    '.': true,
                    '+': true,
                    '$': true,
                    '^': true,
                    '[': true,
                    ']': true,
                    '(': true,
                    ')': true,
                    '{': true,
                    '}': true,
                    '|': true,
                    '/': true
                };
                for (var i = 0; i < charArray.length; i++) {
                    currentChar = charArray[i];
                    if (currentChar === '~' && i < charArray.length - 1) {
                        i++; /* NOSONAR: S2310, Loop counters should not be assigned to from within the loop body */
                        currentChar = charArray[i];
                        if (currentChar === '*' || currentChar === '?') {
                            result.push('\\');
                        } else if (ignoreTilda) {
                            result.push('~');
                        }
                        result.push(currentChar);
                    } else if (currentChar === '?') {
                        result.push('.');
                    } else if (currentChar === '*') {
                        result.push('.');
                        if(exactMatch) {
                            result.push('+');
                        } else {
                            result.push('*');
                        }
                    } else if(escapeCharDict[currentChar]) {
                        result.push('\\');
                        result.push(currentChar);
                    } else {
                        result.push(currentChar);
                    }
                }
                return result.join('');
            }
            return null;
        };
        RegexHelper._getWildcardCriteriaFullMatch = function (criteria, ignoreTilda /* ~ */, exactMatch) {
            var criteriaTemp = RegexHelper._getWildcardCriteria(criteria, ignoreTilda, exactMatch);
            if (criteriaTemp) {
                criteriaTemp = '^' + criteriaTemp + '$';
            }
            return criteriaTemp;
        };
        RegexHelper._getReplaceSymbol = function (expectSymbol, srcStr) {
            var asteriskSymbol = '#' + expectSymbol + '0#';
            var i = 1;
            while (srcStr.indexOf(asteriskSymbol) > 0) { /* NOSONAR: S2692, "indexOf" checks should not be for positive numbers */
                asteriskSymbol = StringHelper._join(asteriskSymbol, '#' + expectSymbol + (i - 1) + '#', '#' + expectSymbol + i + '#');
                i++;
            }
            return asteriskSymbol;
        };
        RegexHelper._regDict = {}; // save the RegExp object that has been new ago
        RegexHelper._regDictIgnoreCase = {}; // the same as _regDict, this for ingore case
        RegexHelper._wildcardParseRecord = {}; // record that whether this string has been parsed to wildcard parser
        RegexHelper._wildcardParseResultBuffer = {}; // the wildparse buffer, save the wildcard parse result
        RegexHelper._replaceRegString2NormalString = function (srcStr) {
            return srcStr.replace(/([\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\|\\\;\:\'\"\,\.\/\<\>\?])/, '\\$1');
        };
        return RegexHelper;
    })();
    
    module.exports = RegexHelper;

}());