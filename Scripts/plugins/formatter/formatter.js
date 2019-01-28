(function () {
    'use strict';

    var keyword_null = null, keyword_undefined = void 0, Math_abs = Math.abs;
    var Plugins = {};
    var commonNS = require('../../common/common.entry.js');
    var stringHelper = commonNS._StringHelper;
    var dateTimeHelper = commonNS._DateTimeHelper;
    var Types = commonNS._Types;
    var isType = Types._isType;
    var isArray = Types._isArray;
    var numberHelper = commonNS._NumberHelper;
    var generalNumberFormatDigit = numberHelper._generalNumberInt + '.' + numberHelper._generalNumberDec;
    var formatObjectToSrting = numberHelper._formatObjectToSrting;
    var customCultureFormat = numberHelper._customCultureFormat;
    var isNullOrUndefined = Types._isNullOrUndefined;
    var cM = commonNS.CultureManager;
    var DBNum1Ten = '一十', DBNum1ExcelTen = '十';
    var SR = function () {
        return commonNS._getResource(Plugins.SR)();
    };
    var getCultureInfo = function (cultureName) {
        return cM._getCultureInfo(cultureName);
    };
    var getDateTimeFormat = function (cultureName) {
        return getCultureInfo(cultureName).DateTimeFormat;
    };
    var getNumberFormat = function (cultureName) {
        return getCultureInfo(cultureName).NumberFormat;
    };

    var toLowerCase = function (s) {
        return s && s.toLowerCase();
    };
    var throwFormatEx = function () {
        throw new Error(SR().Exp_FormatIllegal);
    };

    var stringEx = {
        _Empty: '',
        _format: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (arguments.length === 0) {
                return keyword_null;
            }
            var str = args[0];
            for (var i = 1; i < arguments.length; i++) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        },
        _isNullOrEmpty: function (obj) {
            return !obj || obj === stringEx._Empty;
        }
    };

    var CharHelper = {
        _isDigit: function (c) {
            var cc = c.charCodeAt(0);
            return cc >= 0x30 && cc <= 0x39;
        },
        _isWhiteSpace: function (c) {
            var cc = c.charCodeAt(0);
            return (cc >= 0x0009 && cc <= 0x000D) || (cc === 0x0020) || (cc === 0x0085) || (cc === 0x00A0);
        }
    };

    var LocaleIDFormatPart = (function () {
        function LocaleIDFormatPart(token, original) {
            appendFormatBasePro.call(this, original);
            var self = this;
            self._content = token;
            var contentTemp = self._content;
            var startWithDollar = isEquals(contentTemp[0], '$', false);
            var minusIndex = contentTemp.indexOf('-');
            if (startWithDollar && minusIndex > -1) {
                self._currencySymbol = substr(contentTemp, 1, minusIndex - 1);
                contentTemp = stringHelper._remove(contentTemp, 0, minusIndex + 1);
                if (contentTemp.length > 0) {
                    self._locateID = parseInt(contentTemp, 16);
                }
            } else {
                throw new Error(SR().Exp_TokenIllegal);
            }
        }

        LocaleIDFormatPart.Name = 'LocaleIDFormatPart';

        LocaleIDFormatPart.prototype = {
            cultureInfo: function () {
                var self = this;
                if (!self._cultureInfo) {
                    self._cultureInfo = getCultureInfo(self._locateID);
                    if (self._currencySymbol && self._currencySymbol !== stringEx._Empty && !self._cultureInfo.NumberFormat.isReadOnly) {
                        self._cultureInfo.NumberFormat.currencySymbol = self._currencySymbol;
                    }
                }
                return self._cultureInfo;
            },
            currencySymbol: function () {
                if (this._currencySymbol) {
                    return stringHelper._replace(this._currencySymbol, '\\.', '\".\"');
                }
                return stringEx._Empty;
            },
            allowScience: function () {
                if (this._cultureInfo) {
                    return (!(this._cultureInfo.name().indexOf('ja') === 0) && !(this._cultureInfo.name().indexOf('zh') === 0));
                }
            },
            toString: function () {
                if (this._content) {
                    return addSquareBracket(this._content);
                }
                return stringEx._Empty;
            }
        };

        return LocaleIDFormatPart;
    })();

    var FormatterBase = (function () {
        ///* class GC.Spread.Formatter.FormatterBase(format: string, cultureName: string)
        /**
         * Represents a custom formatter with the specified format string.
         * @class
         * @param {string} format The format.
         * @param {string} cultureName The culture name.
         */
        function FormatterBase(format, cultureName) {
            this.formatCached = format;
            this.cultureName = cultureName;
            ///* field typeName: string
            /** Represents the type name string used for supporting serialization.
             * @type {string}
             */
            this.typeName = '';
        }

        FormatterBase.prototype = {
            ///* function format(obj: Object): string
            /**
             * Formats the specified object as a string with a conditional color. This function should be overwritten.
             * @param {Object} obj - The object with cell data to format.
             * @param {Object} [options] - The additonal format data.
             * @param {string} [options.conditionalForeColor] - The conditonal foreColor when format pattern contains color patter, such as [red]###.##
             * @returns {string} The formatted string.
             * @example
             * //This example creates a custom formatter.
             * var customFormatterTest = {};
             * customFormatterTest.prototype = GC.Spread.Formatter.FormatterBase;
             * customFormatterTest.format = function (obj, data) {
             *     data.conditionalForeColor = "blue";
             *     return "My format result : " + obj.toString();
             * };
             * customFormatterTest.parse = function (str) {
             *     if (!str) {
             *         return "";
             *     }
             *     return str;
             * }
             * activeSheet.getCell(1, 0).formatter(customFormatterTest);
             * activeSheet.getCell(1, 0).value("Test");
             */
            format: function (obj, conditionalForeColor) { /* NOSONAR: UnusedFunctionArgument */ // eslint-disable-line
                return keyword_null;
            },
            ///* function parse(str: string): Object
            /**
             * Parses the specified text. This function should be overwritten.
             * @param {string} text The text.
             * @returns {Object} The parsed object.
             * @example
             * //This example creates a custom formatter.
             * var customFormatterTest = {};
             * customFormatterTest.prototype = GC.Spread.Formatter.FormatterBase;
             * customFormatterTest.format = function (obj, conditionalForeColor) {
             *     conditionalForeColor.value = "blue";
             *     return "My format result : " + obj.toString();
             * };
             * customFormatterTest.parse = function (str) {
             *     if (!str) {
             *         return "";
             *     }
             *     return str;
             * }
             * activeSheet.getCell(1, 0).formatter(customFormatterTest);
             * activeSheet.getCell(1, 0).value("Test")
             */
            parse: function (text) { /* NOSONAR: UnusedFunctionArgument */  // eslint-disable-line
                return keyword_null;
            },
            formatString: function () {
                return this.formatCached;
            },
            ///* function toJSON(): Object
            /**
             * Saves the object state to a JSON string.
             * @returns {Object} The custom formatter data.
             */
            toJSON: function () {
                var settings = {};
                for (var p in this) {
                    if (this.hasOwnProperty(p)) {
                        settings[p] = this[p];
                    }
                }
                return settings;
            },
            ///* function fromJSON(settings: Object)
            /**
             * Loads the object state from the specified JSON string.
             * @param {Object} settings The custom formatter data from deserialization.
             */
            fromJSON: function (settings) {
                if (!settings) {
                    return;
                }
                for (var p in settings) {
                    if (settings[p] !== keyword_undefined) {
                        this[p] = settings[p];
                    }
                }
            }
        };
        return FormatterBase;
    })();

    var dateTimeTokens = {
        _yearTwoDigit: 'yy',
        _yearSingleDigit: 'y',
        _yearFourDigit: 'yyyy',
        _monthSingleDigit: 'm',
        _monthTwoDigit: 'mm',
        _monthAbbreviation: 'mmm',
        _monthUnabbreviated: 'mmmm',
        _monthJD: 'mmmmm',
        _daySingleDigit: 'd',
        _dayTwoDigit: 'dd',
        _dayWeekDayAbbreviation: 'aaa',
        _dayWeekDayUnabbreviated: 'aaaa',
        _hoursSingleDigit: 'h',
        _hoursTwoDigit: 'hh',
        _minuteSingleDigit: 'm',
        _minuteTwoDigit: 'mm',
        _secondSingleDigit: 's',
        _secondTwoDigit: 'ss',
        _eraYear: 'e',
        _aMPMTwoDigit: 'AM/PM',
        _aMPMSingleDigit: 'A/P',
        _placeholderMonthJD: '@mmmmm',
        _defaultAbsoluteTime: new Date(1899, 11, 30, 0, 0, 0, 0)
    };
    var dateTimeKeyWords = [
        dateTimeTokens._yearSingleDigit,
        dateTimeTokens._yearTwoDigit,
        dateTimeTokens._yearFourDigit,
        dateTimeTokens._monthSingleDigit,
        dateTimeTokens._monthTwoDigit,
        dateTimeTokens._monthAbbreviation,
        dateTimeTokens._monthUnabbreviated,
        dateTimeTokens._monthJD,
        dateTimeTokens._daySingleDigit,
        dateTimeTokens._dayTwoDigit,
        dateTimeTokens._dayWeekDayAbbreviation,
        dateTimeTokens._dayWeekDayUnabbreviated,
        dateTimeTokens._hoursSingleDigit,
        dateTimeTokens._hoursTwoDigit,
        dateTimeTokens._minuteSingleDigit,
        dateTimeTokens._minuteTwoDigit,
        dateTimeTokens._secondSingleDigit,
        dateTimeTokens._secondTwoDigit,
        'ggg',
        'gg',
        'g',
        'ee',
        'e'
    ];

    var ConditionalFormatPart = (function () {
        function ConditionalFormatPart(content, original) {
            appendFormatBasePro.call(this, original);
            var self = this;
            var op;
            var token;
            var value;
            var validOperator = ['<=', '<>', '>=', '>', '<', '='];
            for (var i = 0, len = validOperator.length; i < len; i++) {
                op = validOperator[i];
                if (stringHelper._startsWith(content, op, true /* IgnoreCase */)) {
                    token = stringHelper._remove(content, 0, op.length);
                    var tempValue = parseFloat(token);
                    if (!isNaN(tempValue)) {
                        value = tempValue;
                    }
                    break;
                }
            }
            if (value === keyword_null && value === keyword_undefined) {
                throw new Error(SR().Exp_TokenIllegal);
            }
            self.value = value;
            self._compareOperator = op;
            self.isMeetCondition = createComp(self);
        }

        ConditionalFormatPart.Name = 'ConditionalFormatPart';

        ConditionalFormatPart.prototype = {
            toString: function () {
                return addSquareBracket(this._compareOperator + this.value.toString());
            }
        };
        function createComp(part) {
            var body = 'var self = this;', operator = part._compareOperator;
            operator = operator === '<>' ? '!=' : operator;
            operator = operator === '=' ? '===' : operator;
            body += 'return value ' + operator + ' self.value;';
            return new Function(['value'], body); /* NOSONAR: javascript:S3523, Function constructors should not be used */
        }

        return ConditionalFormatPart;
    })();

    var DBNumberFormatPart = (function () {
        // <editor-fold desc="DBNumberFormatPart">
        function DBNumberFormatPart(token, original) {
            appendFormatBasePro.call(this, original);
            var self = this;
            self.token = token;
            self.type = parseInt(stringHelper._remove(token, 0, 'dbnum'.length), 10);
            if (self.type < 0 || self.type > 3) {
                throw new Error(SR().Exp_TokenIllegal);
            }
        }

        DBNumberFormatPart.Name = 'DBNumberFormatPart';

        DBNumberFormatPart.prototype = {
            _replaceNumberString: function (s, dbNumber, isNumber) {
                if (!s || s === stringEx._Empty) {
                    return s;
                }
                var strData = s;
                var str = s;
                var end = -1;
                var start = -1;
                var hasPoint = false;
                var token;
                var ret;
                var formatedNumber;
                for (var n = s.length - 1; n >= 0; n--) {
                    var c = str[n];
                    if ((!isNaN(c) && !isEquals(c, ' ', false)) || (isEquals(c, '.', false) && !hasPoint)) {
                        if (isEquals(c, '.', false)) {
                            hasPoint = true;
                        }
                        if (end === -1) {
                            end = n;
                        }
                        start = n;
                    } else if (start > -1 && end > -1) {
                        token = substr(str, start, end - start + 1);
                        ret = parseFloat(token);
                        if (!isNaN(ret)) {
                            formatedNumber = numberString(token, dbNumber, isNumber);
                            strData = stringHelper._remove(strData, start, end - start + 1);
                            strData = stringHelper._insert(strData, start, formatedNumber);
                        }
                        end = -1;
                        start = -1;
                        hasPoint = false;
                    }
                }
                if (start > -1 && end > -1) {
                    token = substr(str, start, end - start + 1);
                    ret = parseFloat(token);
                    if (!isNaN(ret)) {
                        formatedNumber = numberString(token, dbNumber, isNumber);
                        strData = stringHelper._remove(strData, start, end - start + 1);
                        strData = stringHelper._insert(strData, start, formatedNumber);
                    }
                }
                return strData;
            },
            toString: function () {
                if (this.type > -1) {
                    return addSquareBracket('DBNum' + this.type);
                }
                throw new Error();
            }
        };

        function numberString(value, dbNumber, isNumber) {
            var partValues = value.split('.');
            if (partValues) {
                if (partValues.length === 1) {
                    return formatNumberString(partValues[0], dbNumber.numbers, isNumber ? dbNumber.letters : keyword_null);
                } else if (partValues.length === 2) {
                    var integerString = formatNumberString(partValues[0], dbNumber.numbers, isNumber ? dbNumber.letters : keyword_null);
                    var decimalString = formatNumberString(partValues[1], dbNumber.numbers);
                    return integerString + '.' + decimalString;
                }
            }
            throw new Error(SR().Exp_ValueIllegal);
        }

        function formatNumberString(value, numbers, letters) {
            var strValue = value;
            var n = 0;
            var c;
            var nC = 0;
            if (arguments.length === 2) {
                var sb = '';
                for (n = 0; n < strValue.length; n++) {
                    c = substr(strValue, n, 1);
                    nC = parseInt(c, 10);
                    sb += (numbers[nC]);
                }
                return sb;
            } else if (arguments.length === 3) {
                if (!letters) {
                    return formatNumberString(value, numbers);
                }
                var zeroCount = 0;
                var result = '';
                var maxLength = strValue.length;
                var inZero = false;
                var numberLetter = [];
                for (n = 0; n < maxLength; n++) {
                    var validCharIndex = letters.length - 1 - n;
                    if (validCharIndex > -1) {
                        numberLetter.push(letters[validCharIndex].toString());
                    } else {
                        numberLetter.push(stringEx._Empty);
                    }
                }
                var tmpLetters = [];
                for (var i = numberLetter.length - 1; i >= 0; i--) {
                    tmpLetters[numberLetter.length - i - 1] = numberLetter[i];
                }
                numberLetter = tmpLetters;
                var isZeroAcceptable = false;
                for (i = 0; i < maxLength; i++) {
                    c = substr(strValue, i, 1);
                    nC = parseInt(c, 10);
                    var ch1;
                    var ch2 = stringEx._Empty;
                    if (maxLength - i - 16 > 0) {
                        ch1 = numbers[nC];
                        ch2 = '';
                        isZeroAcceptable = true;
                    } else if (i !== (maxLength - 1) && i !== (maxLength - 5) && i !== (maxLength - 9) && i !== (maxLength - 13)) {
                        if (c === '0') {
                            ch1 = '';
                            ch2 = '';
                            zeroCount = zeroCount + 1;
                        } else if (c !== '0' && zeroCount !== 0) {
                            ch1 = numbers[0] + numbers[nC];
                            ch2 = numberLetter[i];
                            zeroCount = 0;
                        } else {
                            ch1 = numbers[nC];
                            ch2 = numberLetter[i];
                            zeroCount = 0;
                        }
                    } else if (c !== '0' && zeroCount !== 0) {
                        ch1 = numbers[0] + numbers[nC];
                        ch2 = numberLetter[i];
                        zeroCount = 0;
                    } else if ((c !== '0' && zeroCount === 0) || isZeroAcceptable) {
                        ch1 = numbers[nC];
                        ch2 = numberLetter[i];
                        zeroCount = 0;
                        isZeroAcceptable = false;
                    } else if (c === '0' && zeroCount >= 3) {
                        ch1 = '';
                        ch2 = '';
                        zeroCount = zeroCount + 1;
                    } else if (maxLength >= 11) {
                        ch1 = '';
                        zeroCount = zeroCount + 1;
                    } else {
                        ch1 = '';
                        ch2 = numberLetter[i];
                        zeroCount = zeroCount + 1;
                    }
                    var isZero = (ch1 + ch2) === stringEx._Empty;
                    if (!isZero) {
                        inZero = false;
                    }
                    if (i === (maxLength - 13) && !inZero) {
                        ch2 = numberLetter[i];
                        inZero = true;
                    }
                    if (i === (maxLength - 9) && !inZero) {
                        ch2 = numberLetter[i];
                        inZero = true;
                    }
                    if (i === (maxLength - 1)) {
                        ch2 = numberLetter[i];
                        inZero = true;
                    }
                    result = result + ch1 + ch2;
                }
                var iValue = parseInt(value, 10);
                if (iValue === 0) {
                    return numbers[0];
                }
                return result;
            }
        }

        return DBNumberFormatPart;
    })();

    var NumberFormatDateTime = (function () {
        function NumberFormatDateTime(format, partLocaleID, dbNumberFormatPart, cultureName, absTimeParts) {
            appendNumberFormatPro.call(this, partLocaleID, dbNumberFormatPart, cultureName);
            var self = this;
            self._formatString = self._fixFormat(trimUnsupportedSymbol(format));
            self._absTimeParts = absTimeParts;
            self._formatType = 2 /* DateTime */;
            self._init();
        }

        NumberFormatDateTime.prototype = {
            _init: function () {
                var self = this;
                var formatTemp = {'_value': self._formatString};
                var selfClass = NumberFormatDateTime;
                if (selfClass._evaluateFormat(formatTemp._value)) {
                    var hasAMPM = self._processAMPM(formatTemp);
                    // todo: in excel, 'm' represents month or minute, in order to make it clear,replace 'm' in Date Pattern to M.
                    // mmmmm -> "@MMMMM"
                    self.hasJD = self._replace(formatTemp._value, dateTimeTokens._monthJD, '"' + dateTimeTokens._placeholderMonthJD + '"', true, false, formatTemp, false);
                    // mmmm -> MMMM
                    self._replace(formatTemp._value, dateTimeTokens._monthUnabbreviated, 'MMMM', true, false, formatTemp, false);
                    // mmm -> MMM
                    self._replace(formatTemp._value, dateTimeTokens._monthAbbreviation, 'MMM', true, false, formatTemp, false);
                    // mm -> MM
                    self._replace(formatTemp._value, dateTimeTokens._monthTwoDigit, 'MM', true, false, formatTemp, false);
                    // m -> M
                    self._replace(formatTemp._value, dateTimeTokens._monthSingleDigit, 'M', true, false, formatTemp, false);
                    // aaa -> ddd
                    self._replace(formatTemp._value, dateTimeTokens._dayWeekDayAbbreviation, 'ddd', true, true, formatTemp, true);
                    // aaaa ->dddd
                    self._replace(formatTemp._value, dateTimeTokens._dayWeekDayUnabbreviated, 'dddd', true, true, formatTemp, true);
                    // todo: h represents 12 hours system and H represent 24 hours system.
                    if (!hasAMPM) {
                        // h -> H
                        self._replace(formatTemp._value, dateTimeTokens._hoursSingleDigit, 'H', true, true, formatTemp, false);
                        // hh -> HH
                        self._replace(formatTemp._value, dateTimeTokens._hoursTwoDigit, 'HH', true, true, formatTemp, false);
                    }
                    // todo: we will use @ as key words to translate string to DateTime string.
                    if (self._partDBNumberFormat && self._partLocaleID) {
                        // yyyy -> "@yyyy"
                        self._hasYearDelay = self._hasYearDelay || self._replace(formatTemp._value, dateTimeTokens._yearFourDigit, '"@' + dateTimeTokens._yearFourDigit + '"', true, false, formatTemp, true);
                        // yy -> "@yy"
                        self._hasYearDelay = self._hasYearDelay || self._replace(formatTemp._value, dateTimeTokens._yearTwoDigit, '"@' + dateTimeTokens._yearTwoDigit + '"', true, false, formatTemp, true);
                    }
                    if (self._absTimeParts) {
                        for (var key = 0; key < self._absTimeParts.length; key++) {
                            var absPart = self._absTimeParts[key];
                            self._replace(formatTemp._value, absPart._originalToken, '@' + absPart._originalToken, true, true, formatTemp, true);
                        }
                    }
                    self._validDateTimeFormatString = formatTemp._value;
                } else {
                    throwFormatEx();
                }
            },
            formatString: function () {
                return this._formatString;
            },
            format: function (obj) {
                var self = this;
                var result = stringEx._Empty;
                var dateTime = keyword_null;
                try {
                    dateTime = dateTimeHelper._DT(obj);
                    if (!dateTime) {
                        result = obj.toString();
                    } else {
                        obj = dateTime;
                    }

                    if (dateTime) {
                        result = dateTimeHelper._customCultureFormat(dateTime, self._validDateTimeFormatString, (self._partLocaleID && self._partLocaleID.cultureInfo()) || getCultureInfo(self.cultureName));
                        if (self.hasJD) {
                            var monthName = getCultureInfo(self.cultureName).DateTimeFormat.monthNames[dateTime.getMonth()];
                            result = stringHelper._replace(result, dateTimeTokens._placeholderMonthJD, substr(monthName, 0, 1));
                        }
                        if (self._absTimeParts) {
                            var span = (dateTimeHelper._toOADate(dateTime) - dateTimeHelper._toOADate(dateTimeTokens._defaultAbsoluteTime)) * 24 * 60 * 60 * 1000;
                            for (var key = 0; key < self._absTimeParts.length; key++) {
                                var absPart = self._absTimeParts[key];
                                var absTimePartString = absPart._getTimeSpan(span);
                                if (!isNullOrUndefined(absTimePartString)) {
                                    var tempAbsPart = absPart._originalToken.replace('[', '\\[').replace(']', '\\]');
                                    result = stringHelper._replace(result, '@' + tempAbsPart, absTimePartString);
                                }
                            }
                        }
                    }
                } catch (ex) {
                    result = convertToString(obj);
                }
                return convertDateTimeNumberString(result, obj, self._partLocaleID, self._partDBNumberFormat, self.cultureName);
            },
            parse: function (s) {
                if (!s || s === stringEx._Empty) {
                    return keyword_null;
                }
                var self = this;
                var strTemp = s;
                var boolResult = toLowerCase(strTemp);
                if (boolResult === 'true') {
                    return true;
                } else if (boolResult === 'false') {
                    return false;
                }
                if (self._validDateTimeFormatString) {
                    var dateTimeResult = dateTimeHelper._parseExact(strTemp, self._validDateTimeFormatString, getCultureInfo(self.cultureName));
                    if (dateTimeResult) {
                        return dateTimeResult;
                    }
                }

                try {
                    var resultDate = dateTimeHelper._DT(strTemp);
                    if (resultDate && !isNaN(resultDate)) {
                        return resultDate;
                    }
                    resultDate = new Date(strTemp);
                    return !isNaN(resultDate.valueOf()) ? resultDate : strTemp;
                } catch (err) {
                    return strTemp;
                }
            },
            _fixFormat: function (format) {
                // todo: rewrite
                var formatTemp = format;
                var strBuilder = '';
                var inComments = false;
                for (var n = 0; n < formatTemp.length; n++) {
                    var c = formatTemp[n];
                    if (c === '\"') {
                        inComments = !inComments;
                    } else if (!inComments) {
                        if (c === 'Y' || c === 'D' || c === 'S' || c === 'E' || c === 'G') {
                            c = toLowerCase(c);
                        } else if (c === 'M') {
                            var frontC = formatTemp[n - 1];
                            if (!isEquals('A', frontC, true) && !isEquals('P', frontC, true)) {
                                c = toLowerCase(c);
                            }
                        }
                    }

                    strBuilder += c;
                }
                return strBuilder;
            },
            _processAMPM: function (format) {
                var keywords = [dateTimeTokens._aMPMTwoDigit, getDateTimeFormat(this.cultureName).amDesignator + '/' + getDateTimeFormat(this.cultureName).pmDesignator,
                    dateTimeTokens._aMPMSingleDigit];
                var array2 = ['tt', 'tt', 't'];
                for (var i = 0; i < 3; i++) {
                    if (stringHelper._contains(format._value, keywords[i], 1)) {
                        format._value = stringHelper._replace(format._value, keywords[i], array2[i], true);
                        return true;
                    }
                }

                return false;
            },
            _replace: function (format, oldToken, newToken, isReplaceInDateFormat, isReplaceInTimeFormat, result, isIgnoreCase) {
                if (isReplaceInDateFormat || isReplaceInTimeFormat) {
                    var positions = [];
                    var isInDate = true;
                    if (!hasDate(format) && hasTime(format)) {
                        isInDate = false;
                    }
                    var isStartSpecialString = false;
                    var index = 0;
                    for (; index < format.length; index++) {
                        var c = format[index];
                        if (hasTime(c)) {
                            isInDate = false;
                        } else if (hasDate(c)) {
                            isInDate = true;
                        }
                        if ((isReplaceInDateFormat && isEquals(c, oldToken[0], isIgnoreCase) && isInDate) ||
                            (isReplaceInTimeFormat && isEquals(c, oldToken[0], isIgnoreCase) && !isInDate)) {
                            var isMatch = true;
                            for (var x = 0; x < oldToken.length; x++) {
                                if (x + index >= format.length || !isEquals(oldToken[x], format[x + index], isIgnoreCase)) {
                                    isMatch = false;
                                    break;
                                }
                            }
                            var indexLastMatch = index + oldToken.length - 1;
                            if (isMatch && indexLastMatch + 1 < format.length) {
                                var lastMatchChar = format[indexLastMatch];
                                var tail = -1;
                                for (tail = indexLastMatch + 1; tail < format.length; tail++) {
                                    if (!isEquals(lastMatchChar, format[tail], isIgnoreCase)) {
                                        break;
                                    }
                                }
                                if (tail > indexLastMatch + 1) {
                                    index = tail; /* NOSONAR: S2310, Loop counters should not be assigned to from within the loop body*/
                                    isMatch = false;
                                }
                            }
                            if (isMatch && !isStartSpecialString) {
                                positions.splice(0, 0, index);
                            }
                        }
                        if (c === '\"') {
                            isStartSpecialString = !isStartSpecialString;
                        }
                    }
                    result._value = format;
                    if (positions.length > 0) {
                        for (index = 0; index < positions.length; index++) {
                            var position = positions[index];
                            result._value = stringHelper._remove(result._value, position, oldToken.length);
                            result._value = stringHelper._insert(result._value, position, newToken);
                        }
                        return true;
                    }
                    return false;
                }
                return false;
            }
        };

        function hasTime(s) {
            return stringHelper._indexOf(s, dateTimeTokens._hoursSingleDigit[0], true /* IgnoreCase */) > -1 ||
                stringHelper._indexOf(s, dateTimeTokens._secondSingleDigit[0], true /* IgnoreCase */) > -1;
        }

        function hasDate(s) {
            return (stringHelper._indexOf(s, dateTimeTokens._yearTwoDigit[0], true /* IgnoreCase */) > -1 ||
            stringHelper._indexOf(s, dateTimeTokens._daySingleDigit[0], true /* IgnoreCase */) > -1);
        }

        NumberFormatDateTime._evaluateFormat = function (content) {
            return containsKeywords(content, dateTimeKeyWords);
        };
        // NumberFormatDateTime static Methods

        return NumberFormatDateTime;
    })();

    var ABSTimeFormatPart = function (token, original) {
        appendFormatBasePro.call(this, original);
        var self = this;
        var keyword = toLowerCase(token)[0];
        var factor;
        if (keyword === 'h') {
            factor = 3600;
        } else if (keyword === 'm') {
            factor = 60;
        } else if (keyword === 's') {
            factor = 1;
        } else {
            throw new Error(SR().Exp_TokenIllegal);
        }
        self._getTimeSpan = function (span) {
            var result = span / 1000 / factor;
            // Process float number error in JavaScript, like 236.99999999997
            if (Math.abs(result - Math.round(result)) < 0.000001) {
                return Math.round(result);
            }
            return Math.floor(result);
        };
    };
    ABSTimeFormatPart.Name = 'ABSTimeFormatPart';

    var ColorFormatPart = (function () {
        function ColorFormatPart(token, original) {
            appendFormatBasePro.call(this, original);
            this.foreColor = token;
        }

        ColorFormatPart.Name = 'ColorFormatPart';

        ColorFormatPart.prototype.toString = function () {
            return addSquareBracket(this.foreColor);
        };
        return ColorFormatPart;
    })();

    var NumberFormatDigital = (function () {
        function NumberFormatDigital(format, partLocaleID, dbNumberFormatPart, cultureName) {
            function splitString(s, spliter) {
                var strs = [], strMark = '\"';
                if (s === keyword_null || s === '') {
                    return strs;
                }
                var inEscape = false, sb = [], inStr = false, n, c;
                for (n = 0; n < s.length; n++) {
                    c = s[n];
                    if (c === strMark && !inEscape) {
                        inStr = !inStr;
                    }
                    if (!inEscape && !inStr && c === spliter) {
                        strs.push(sb.join(''));
                        sb = [];
                    } else {
                        sb.push(c);
                    }
                    inEscape = c === '\\' ? !inEscape : false;
                }
                strs.push(sb.join(''));
                return strs;
            }

            // base Constructor
            appendNumberFormatPro.call(this, partLocaleID, dbNumberFormatPart, cultureName);
            var self = this;
            self._isGeneralNumber = false;
            self._formatType = 1 /* Number */;
            self._fullFormatString = filterSquareBracket(format);
            var formatTemp = trimUnsupportedSymbol(format);
            if (partLocaleID) {
                formatTemp = replaceKeyword(formatTemp, self._partLocaleID._originalToken, self._partLocaleID.currencySymbol());
            }
            formatTemp = filterSquareBracket(formatTemp);
            // Fraction:
            var solidusIndex = formatTemp.indexOf('/');
            if (solidusIndex > -1) {
                var sp = splitString(formatTemp, '/');
                if (sp && sp.length === 2) { /* NOSONAR: S2589, Boolean expressions should not be gratuitous */
                    self._fractionDenominatorFormat = sp[1];
                    var left = sp[0];
                    if (left) {
                        var kjIndex = left.lastIndexOf(' ');
                        if (kjIndex > -1) {
                            self._fractionIntegerFormat = substr(left, 0, kjIndex);
                            self._fractionNumeratorFormat = substr(left, kjIndex + 1, left.length - kjIndex - 1);
                        } else {
                            self._fractionNumeratorFormat = left;
                        }
                    }
                }
            }
            self._numberFormatString = formatTemp;
        }

        NumberFormatDigital.prototype = {
            formatString: function () {
                return this._fullFormatString;
            },
            format: function (obj) {
                if (isType(obj, 'boolean')) {
                    return obj.toString().toUpperCase();
                }
                var self = this;
                var num = Types._toDouble(obj);
                if (isNaN(num) || !isFinite(num) || isNaN(obj)) {
                    if (typeof obj === 'string') {
                        return obj;
                    }
                    return keyword_null;
                }
                var cultureInfo = getCultureInfo(self.cultureName);
                var result, denominatorFormat, fixedDenominator, numeratorValueRoundUp, temp;
                var sb;

                if (self._fractionNumeratorFormat && self._fractionDenominatorFormat) {
                    var out_integer = {'value': 0.0};
                    var out_numerator = {'value': 0.0};
                    var out_denominator = {'value': 0.0};
                    var d = self._getDenominatorLength();
                    if (getFraction(num, d, out_integer, out_numerator, out_denominator)) {
                        var tempValue = getGCD(out_numerator.value, out_denominator.value);
                        if (tempValue > 1) {
                            out_numerator.value /= tempValue;
                            out_denominator.value /= tempValue;
                        }
                        if (self._fractionIntegerFormat) {
                            sb = '';

                            //For the case 1/1 and format is "# ?/?", 99/100
                            if (out_denominator.value === 1) {
                                out_integer.value += out_numerator.value;
                                out_numerator.value = 0;
                                out_denominator.value = 0;
                            }
                            var tempIntegerString = formatObjectToSrting(customCultureFormat(out_integer.value, self._fractionIntegerFormat, cultureInfo));
                            if (tempIntegerString && tempIntegerString !== '0') {
                                sb += tempIntegerString;
                                sb += ' ';
                            }
                            if (out_integer.value === 0 && num < 0) {
                                sb += cultureInfo.NumberFormat.negativeSign;
                            }

                            if (num === 0) {
                                sb += ('0');
                            }

                            denominatorFormat = self._fractionDenominatorFormat;
                            fixedDenominator = parseFloat(denominatorFormat);
                            if (!isNaN(fixedDenominator) && fixedDenominator > 0) {
                                if (out_numerator.value !== 0 && out_denominator.value !== 0) {
                                    out_numerator.value *= fixedDenominator / out_denominator.value;
                                }
                                out_denominator.value = fixedDenominator;
                                denominatorFormat = denominatorFormat.replace(/^\d+/, toNumberPlaceholder(fixedDenominator));
                                numeratorValueRoundUp = Math.ceil(out_numerator.value);
                                temp = numeratorValueRoundUp - out_numerator.value;
                                if (temp <= 0.5 && temp >= 0) {
                                    out_numerator.value = parseFloat(numeratorValueRoundUp.toString());
                                } else {
                                    out_numerator.value = parseFloat((numeratorValueRoundUp - 1).toString());
                                }
                            }

                            // fix numeratorFormat string.
                            var numeratorFormat = self._fractionNumeratorFormat;
                            var fixedNumeratorForma = parseFloat(numeratorFormat);
                            if (!isNaN(fixedNumeratorForma) && fixedNumeratorForma === 0) {
                                var numeratorFormatLength = numeratorFormat.length;
                                var numeratorString = out_numerator.value.toString();
                                var numeratorLength = numeratorString.length;
                                if (numeratorFormatLength > numeratorLength) {
                                    numeratorFormat = numeratorFormat.substr(0, numeratorFormatLength - (numeratorFormatLength - numeratorLength));
                                } else if (numeratorFormatLength < numeratorLength) {
                                    numeratorString = numeratorString.substr(0, numeratorLength - (numeratorLength - numeratorFormatLength));
                                    out_numerator.value = parseInt(numeratorString, 10);
                                }
                            }
                            var fractionString = self._getFormattedFractionString(out_numerator.value, out_denominator.value, numeratorFormat, denominatorFormat, cultureInfo);
                            if (out_numerator.value === 0) {
                                // for case like this: 9 formatter "# ?/10", it will be string "9     "
                                fractionString = fractionString.replace(/./g, ' ');
                                // integer part is "" and numerator is zero should return 0 plus fraction part blank.
                                if (tempIntegerString === "") {
                                    return '0 ' + fractionString;
                                }
                            }
                            sb += fractionString;
                            return sb === '' ? '0' : sb;
                        }
                        sb = '';
                        var value = out_integer.value * out_denominator.value + out_numerator.value;
                        denominatorFormat = self._fractionDenominatorFormat;
                        fixedDenominator = parseFloat(denominatorFormat);
                        if (fixedDenominator > 0) {
                            value *= fixedDenominator / out_denominator.value;
                            out_denominator.value = fixedDenominator;
                            numeratorValueRoundUp = Math.ceil(value);
                            temp = numeratorValueRoundUp - value;
                            if (temp <= 0.5 && temp >= 0) {
                                value = parseFloat(numeratorValueRoundUp.toString());
                            } else {
                                value = parseFloat((numeratorValueRoundUp - 1).toString());
                            }
                            sb += (value + '/' + out_denominator.value);
                        } else {
                            sb += self._getFormattedFractionString(value, out_denominator.value, self._fractionNumeratorFormat, self._fractionDenominatorFormat, cultureInfo);
                        }
                        return value === 0 ? '0' : sb;
                    }
                    //TODO: toString with arguments.
                    //return num.toString(self.NumberFormatInfo());
                    return num.toString();
                }
                result = customCultureFormat(num, self._numberFormatString, cultureInfo);
                result = convertNumberString(result, self._isGeneralNumber, self._partLocaleID, self._partDBNumberFormat, self.cultureName);
                return result;
            },
            parse: function (s) {
                var self = this;
                if (!s || s === stringEx._Empty) {
                    return keyword_null;
                }
                var sl = toLowerCase(s);
                if (sl === 'true') {
                    return true;
                } else if (sl === 'false') {
                    return false;
                }

                s = self._trimSpecialSymbol(s);
                s = self._trimCurrencySymbol(s);
                var result = self._trimPercentSign(s);
                var isPer = result._isPer;
                var str = result._str;
                if (self._isValidaNumberString(str)) {
                    str = stringHelper._replaceAllNoReg(str, getNumberFormat(self.cultureName).numberGroupSeparator, '');
                    var value = numberHelper._parseFloat(str, self.cultureName);
                    if (!isNaN(value) && isFinite(value)) {
                        if (isPer) {
                            value = value / 100.0;
                        }
                        return value;
                    }
                }

                return keyword_null;
            },
            _getDenominatorLength: function () {
                var self = this;
                var fractionDenominatorFormat = self._fractionDenominatorFormat;
                var length = 0;
                if (fractionDenominatorFormat) {
                    var l = fractionDenominatorFormat.length;
                    for (var i = 0; i < l; i++) {
                        if (fractionDenominatorFormat[i].match(/[#?0\d]/)) {
                            length++;
                        } else {
                            break;
                        }
                    }
                }
                return length;
            },
            _isValidaNumberString: function (str) {
                var tempStr = '';
                var decimalFlagCount = 0;
                var eFlagCount = 0;
                var separatorFlagCount = 0;
                var isValidGroup = true;
                var numberFormatInfo = getNumberFormat(this.cultureName);
                for (var i = str.length - 1; i > -1; i--) {
                    if (str[i] === numberFormatInfo.numberDecimalSeparator) {
                        decimalFlagCount++;
                        if (separatorFlagCount > 0) {
                            isValidGroup = false;
                        }
                        tempStr = '';
                    } else if (toLowerCase(str[i]) === 'e') {
                        eFlagCount++;
                        tempStr = '';
                        if (i === str.length - 1) {
                            //case 1e,2e...
                            return false;
                        }
                    } else if (str[i] === numberFormatInfo.numberGroupSeparator) {
                        isValidGroup = (tempStr.length === 3);
                        separatorFlagCount++;
                        tempStr = '';
                    } else if (str[i] === '-' || str[i] === '+') {
                        if (i > 0 && toLowerCase(str[i - 1]) !== 'e') {
                            return false;
                        }
                    } else if (CharHelper._isDigit(str[i])) {
                        tempStr += str[i];
                    } else {
                        return false;
                    }
                    if (decimalFlagCount > 1 || eFlagCount > 1 || !isValidGroup) {
                        return false;
                    }
                }
                return true;
            },
            _trimSpecialSymbol: function (s) {
                var strTemp = s;
                var digital = [];
                for (var i = 0; i < strTemp.length; i++) {
                    if (CharHelper._isDigit(strTemp[i])) {
                        digital.push(i);
                    }
                }
                var fp = getNumberFormat(this.cultureName);
                var keywords = [fp.currencyDecimalSeparator, fp.currencyGroupSeparator, fp.currencySymbol, fp.nanSymbol, fp.negativeInfinitySymbol, fp.negativeSign,
                    fp.numberDecimalSeparator, fp.numberGroupSeparator, fp.percentDecimalSeparator, fp.percentGroupSeparator, fp.percentSymbol,
                    fp.perMilleSymbol, fp.positiveInfinitySymbol, fp.positiveSign];

                for (var n = strTemp.length - 1; n > -1; n--) {
                    var c = strTemp[n];
                    if (CharHelper._isWhiteSpace(c) && !(keywords.indexOf(c.toString()) > -1)) {
                        if (n < digital[0] || digital[digital.length - 1] < n) {
                            strTemp = stringHelper._remove(strTemp, n, 1);
                        }
                    } else if (c === '-' || c === '+') { // todo:e-,e+,(-,$- is permitted
                        var frontChar = n > 0 ? strTemp[n - 1].toString() : keyword_null;
                        var permitChars = ['e', 'E', '(', getNumberFormat(this.cultureName).currencySymbol];
                        if (permitChars.indexOf(frontChar) < 0) {
                            break;
                        }
                    }
                }
                return strTemp;
            },
            _trimCurrencySymbol: function (s) {
                var currencySymbol = getNumberFormat(this.cultureName).currencySymbol;
                var tempS = stringHelper._startsWith(s, currencySymbol) ? stringHelper._remove(s, 0, currencySymbol.length) : s;
                return tempS.indexOf(currencySymbol) < 0 ? tempS : s;
            },
            _trimPercentSign: function (s) {
                var percentSymbol = getNumberFormat(this.cultureName).percentSymbol;
                var isPercent = true;
                var tempS = s;
                if (stringHelper._startsWith(s, percentSymbol)) {
                    tempS = stringHelper._remove(s, 0, percentSymbol.length);
                } else if (stringHelper._endsWith(s, percentSymbol)) {
                    tempS = stringHelper._remove(s, s.length - percentSymbol.length, percentSymbol.length);
                } else {
                    isPercent = false;
                }

                if (stringHelper._contains(tempS, percentSymbol)) {
                    isPercent = false;
                }

                return {_str: tempS, _isPer: isPercent};
            },
            _getFormattedFractionString: function (numberatorValue, denominatorValue, numeratorFormat, denominatorFormat, cultureInfo) {
                // numberatorValue will be treated as integer part and denominatorValue will be treated as decimal part
                // process numberator part, use it value and formatter
                var numeratorFormatStr = formatObjectToSrting(customCultureFormat(numberatorValue, numeratorFormat, cultureInfo));
                // process denominator part, use 0. + deminatorValue as number and #. + denominatorFormat as formatter.
                var fakeDenominatorNumber = '0.' + denominatorValue;
                var fakeDenominatorformat = '#.' + denominatorFormat;
                var denominatorStr = formatObjectToSrting(customCultureFormat(fakeDenominatorNumber, fakeDenominatorformat, cultureInfo, true));
                // Only use denominatorStr's decimal part.
                var resultString = numeratorFormatStr + '/' + denominatorStr.substr(denominatorStr.indexOf('.') + 1);
                // for fixedDenominator and fixedNumeratorFormat
                if (numeratorFormat === '') {
                    resultString = numberatorValue + resultString;
                }
                if (denominatorFormat === '') {
                    resultString += denominatorValue;
                }
                return resultString;
            }
        };
        //greatest common divisor
        function getGCD(value1, value2) {
            if (value1 === 0.0) {
                return Math_abs(value2);
            }
            if (value2 === 0.0) {
                return Math_abs(value1);
            }

            var max = Math.max(value1, value2);
            var min = Math.min(value1, value2);
            var value3 = max % min;

            while (value3 !== 0.0) {
                max = min;
                min = value3;
                value3 = max % min;
            }

            return Math_abs(min);
        }

        function getFraction(value, denominatorDigits, out_integer, out_numerator, out_denominator) {
            var integer = 0;
            var numerator = 0;
            var denominator = 0;
            var decimalValue = 0;
            var Math_ceil = Math.ceil;
            if (value > 0) {
                decimalValue = value - Math_ceil(value) + 1.0;
                if (decimalValue === 1.0) {
                    decimalValue = 0;
                    integer = value;
                } else {
                    integer = Math_ceil(value) - 1.0;
                }
            } else if (value < 0) {
                integer = Math_ceil(value);
                decimalValue = Math_ceil(value) - value;
            }

            var min = Math.pow(10, denominatorDigits - 1);
            var max = Math.pow(10, denominatorDigits) - 1;
            if (min < 2) {
                min = 2;
            }
            if (max < 2) {
                max = 2;
            }
            var isValueSet = false;
            var lastTriedValue = 0;
            for (var n = min; n <= max; n++) {
                var valueTemp = n * decimalValue;
                var valueIntegerTemp = Math.round(valueTemp);
                var triedValue = valueIntegerTemp / n;
                var deviation = Math_abs(triedValue - decimalValue);
                if (isValueSet ? deviation < Math_abs(lastTriedValue - decimalValue) : true) {
                    isValueSet = true;
                    lastTriedValue = triedValue;
                    numerator = valueIntegerTemp;
                    denominator = n;

                    //Adjust the accuracy to get more precise value.
                    if (deviation < 0.00001) {
                        break;
                    }
                }
            }
            out_integer.value = integer;
            out_numerator.value = numerator;
            out_denominator.value = denominator;
            return isValueSet;
        }

        function toNumberPlaceholder(num) {
            return num.toString().replace(/\d/g, '?');
        }

        return NumberFormatDigital;
    })();

    var NumberFormatGeneral = (function () {
        function NumberFormatGeneral(format, partLocaleID, dbNumberFormatPart, cultureName) {
            appendNumberFormatPro.call(this, partLocaleID, dbNumberFormatPart, cultureName);
            if (arguments.length > 0) {
                if (format.indexOf('0') >= 0 || format.indexOf('#') >= 0 || format.indexOf('.') >= 0 || format.indexOf('@') >= 0) {
                    throwFormatEx();
                }
                this._fullFormatString = format;
            } else {
                this._fullFormatString = 'General';
            }
            this._formatType = 0 /* General */;
        }

        NumberFormatGeneral.prototype = {
            _getDigitalFormat: function () {
                var self = this;
                if (!self._digitalFormat) {
                    var nfStringTmp = self._fullFormatString;
                    nfStringTmp = replaceKeyword(nfStringTmp, 'General', generalNumberFormatDigit);
                    self._digitalFormat = new NumberFormatDigital(nfStringTmp, self._partLocaleID, self._partDBNumberFormat, self.cultureName);
                    self._digitalFormat._isGeneralNumber = true;
                }
                return self._digitalFormat;
            },
            _getExponentialDigitalFormat: function () {
                var self = this;
                if (!self._exponentialDigitalFormat) {
                    self._exponentialDigitalFormat = new NumberFormatDigital('0.#####E+00', self._partLocaleID, self._partDBNumberFormat, self.cultureName);
                    self._exponentialDigitalFormat._isGeneralNumber = true;
                }
                return self._exponentialDigitalFormat;
            },
            formatString: function () {
                return stringHelper._replace(this._fullFormatString, '@NumberFormat', 'General');
            },
            format: function (obj) {
                var self = this;
                if (Types._isNumber(obj, self.cultureName)) {
                    var allowS = !self._partLocaleID ? true : self._partLocaleID.allowScience();
                    var d = Types._toDouble(obj);
                    if (d !== keyword_undefined && d !== keyword_null) {
                        if ((Math_abs(d) > 99999999999 && allowS) || (Math_abs(d) < 1E-11 && d !== 0)) {
                            return self._getExponentialDigitalFormat().format(obj);
                        }
                        return self._getDigitalFormat().format(obj);
                    }
                } else if (isType(obj, 'string')) { // todo:why not use numberformattext to formt
                    var formatTmp = stringHelper._replace(self.formatString(), '"', '');
                    formatTmp = trimBackslash(formatTmp);
                    if (formatTmp) {
                        return stringHelper._replace(formatTmp, 'General', obj);
                    }
                    return obj;
                } else if (isType(obj, 'boolean')) { // todo:duplicate with the begin.
                    return obj.toString().toUpperCase();
                }
                return '';
            },
            parse: function (s) {
                if (stringEx._isNullOrEmpty(s)) {
                    return keyword_null;
                }
                if (typeof s === 'number') {
                    return s;
                }
                var hasMin = false;
                var minIndex = stringHelper._indexOf(s, '-');
                if (minIndex > 0 && !isEquals(s.charAt(minIndex - 1), 'E', true)) { // todo: which case?
                    hasMin = true;
                }
                if (stringHelper._contains(s, '/') || hasMin || stringHelper._contains(s, ':') || stringHelper._contains(s, '-')) {
                    var dt = dateTimeHelper._parseLocale(s);
                    // TODO: isNaN(Date)
                    if (dt) {
                        return dt;
                    }
                }

                var result;
                var hasNegativeSin = s.charAt(0) === '-';
                var temp = hasNegativeSin ? stringHelper._remove(s, 0, 1) : s;
                var hasParenthesis = temp.charAt(0) === '(' && s.charAt(s.length - 1) === ')';
                result = this._getDigitalFormat().parse(temp);
                if (result !== keyword_null && result !== keyword_undefined) {
                    if ((hasParenthesis || hasNegativeSin) && isType(result, 'number')) {
                        return -1 * Math_abs(result);
                    }
                    return result;
                }

                return s;
            }
        };

        return NumberFormatGeneral;
    })();

    var NumberFormatText = (function () {
        function NumberFormatText(format, partLocaleID, dbNumberFormatPart, culture) {
            var self = this;
            appendNumberFormatPro.call(self, partLocaleID, dbNumberFormatPart, culture);
            var formatTemp = trimUnsupportedSymbol(format, false);
            if (partLocaleID) {
                formatTemp = replaceKeyword(formatTemp, self._partLocaleID._originalToken, self._partLocaleID.currencySymbol());
            }
            formatTemp = filterSquareBracket(formatTemp);
            formatTemp = trimBackslash(formatTemp);
            self._formatString = formatTemp;
            self._formatType = 3 /* Text */;
        }

        NumberFormatText.prototype = {
            format: function (obj) {
                var self = this;
                try {
                    var result, value;
                    if (obj instanceof Date) {
                        value = dateTimeHelper._toOADate(obj).toString();
                    } else {
                        value = convertToString(obj);
                    }
                    var formatObj = self._parseFormat(self._formatString);
                    result = self._toFormattedObject(value, formatObj);
                    return result;
                } catch (err) {
                    return '';
                }
            },
            parse: function (str) {
                return str ? str : '';
            },
            formatString: function () {
                return this._formatString;
            },
            _parseFormat: function (format) { /* NOSONAR: FunctionComplexity */
                var stringBuffer = '', inDoubleQuoteString = false;
                var currentChar, previousChar = keyword_null, currentPart = [];
                for (var i = 0; i < format.length; i++) { /* NOSONAR: TooManyBreakOrContinueInLoop */
                    currentChar = format.charAt(i);
                    if (inDoubleQuoteString) {
                        if (currentChar !== '"') {
                            stringBuffer += currentChar;
                        } else {
                            stringBuffer += currentChar;
                            currentPart.push(stringBuffer);
                            stringBuffer = '';
                            inDoubleQuoteString = false;
                        }
                        previousChar = currentChar;
                        continue;
                    } else if ((previousChar === '*' || previousChar === '_' || previousChar === '\\') && stringBuffer !== '') {
                        stringBuffer += currentChar;
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                        continue;
                    }
                    if (currentChar === '*' || currentChar === '_' || currentChar === '\\') {
                        previousChar = currentChar;
                        if (stringBuffer !== '') {
                            currentPart.push(stringBuffer);
                            stringBuffer = '';
                        }
                        stringBuffer += currentChar;
                        continue;
                    } else if (currentChar === '@') {
                        previousChar = currentChar;
                        if (stringBuffer !== '') {
                            currentPart.push(stringBuffer);
                            stringBuffer = '';
                        }
                        currentPart.push(currentChar);
                        continue;
                    } else if (currentChar === '"') {
                        previousChar = currentChar;
                        if (stringBuffer !== '') {
                            currentPart.push(stringBuffer);
                        }
                        stringBuffer = currentChar;
                        inDoubleQuoteString = true;
                        continue;
                    }
                    stringBuffer += currentChar;
                    previousChar = currentChar;
                }
                if (stringBuffer !== '') {
                    currentPart.push(stringBuffer);
                }
                return currentPart;
            },
            _toFormattedObject: function (value, format) {
                var result = [];
                var hasInfilling = false;
                for (var i = format.length - 1; i >= 0; i--) {
                    var intPartItem = format[i];
                    if (intPartItem[0] === '*') {
                        if (!hasInfilling) {
                            hasInfilling = true;
                            result.push({type: 'fillingChar', value: intPartItem[1]});
                        }
                    } else if (intPartItem[0] === '_') {
                        result.push({type: 'placeholder', value: intPartItem[1]});
                    } else if (intPartItem[0] === '"' && intPartItem[intPartItem.length - 1] === '"') {
                        if (intPartItem.length > 2) {
                            result.push({type: 'text', value: intPartItem.substr(1, intPartItem.length - 2)});
                        }
                    } else if (intPartItem[0] === '@') {
                        result.push({type: 'text', value: value});
                    } else {
                        result.push({type: 'text', value: intPartItem});
                    }
                }
                return result.reverse();
            }
        };
        return NumberFormatText;
    })();

    function substr(str, start, length) {
        return str.substr(start, length);
    }

    function convertToString(value) {
        if (Types._isNullOrUndefined(value)) {
            return '';
        } else if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE';
        } else if (typeof value === 'string') {
            return value;
        }
        return value.toString();
    }

    var formatPart = {
        _positive: 0,
        _negative: 1,
        _zero: 2,
        _text: 3
    };
    var replaceRegExp = new RegExp('([.+?*$^\\[\\](){}|\/])', 'g');

    function isEscapeCharacter(str, currentpos) {
        if (str[currentpos] === '\\') {
            throw new Error(SR().Exp_InvalidBackslash);
        }
        // check the current character is like \a, not \\a.
        if (currentpos - 1 > 0 && currentpos - 1 < str.length && str[currentpos - 1] === '\\') {
            if (currentpos - 2 < 0) { // todo: '\a'
                return true;
            } else if (currentpos - 2 > 0 && currentpos - 2 < str.length) { // todo: '\\a' is false, 'b\a' is true.
                return str[currentpos - 2] !== '\\';
            }
        }
        return false;
    }

    function addSquareBracket(token) {
        if (!token) {
            throw new Error(SR().Exp_TokenIsNull);
        }
        return '[' + token + ']';
    }

    function filterSquareBracket(s) {
        if (s === keyword_undefined || s === keyword_null || s === '') {
            return s;
        }
        var sb = '';
        var refCount = 0;
        for (var n = 0; n < s.length; n++) {
            var c = s[n];
            if (c === '[') {
                refCount++;
            } else if (c === ']') {
                refCount--;
                if (refCount < 0) {
                    refCount = 0;
                }
            } else if (refCount === 0) {
                sb += c;
            }
        }
        return sb.toString();
    }

    function trimSquareBracket(token) {
        token = replaceKeyword(token, '[', '');
        return replaceKeyword(token, ']', '');
    }

    function replaceKeyword(s, oldString, newString) {
        if (!s || s === stringEx._Empty || isEquals(oldString, newString, true)) {
            return s;
        }

        oldString = oldString.replace(replaceRegExp, '\\$1');
        return s.replace(new RegExp(oldString, 'g'), newString);
    }

    function trimBackslash(token) {
        var len = token.length;
        var inEscape = false;
        var sb = '';
        for (var n = 0; n < len; n++) {
            var c = token.charAt(n);
            if (c === '\\') {
                inEscape = !inEscape;
                if (!inEscape) {
                    sb += c;
                }
            } else {
                inEscape = false;
                sb += c;
            }
        }
        return sb;
    }

    function isEquals(a, b, isIgnoreCase) {
        return isIgnoreCase ? toLowerCase(a) === toLowerCase(b) : a === b;
    }

    function trimUnsupportedSymbol(format, isSupportedFraction) {
        if (arguments.length === 1) {
            isSupportedFraction = true;
        }
        var inComments = false;
        var sb = '';
        for (var n = 0; n < format.length; n++) {
            var c = format[n];
            if (c === '\"') {
                inComments = !inComments;
            } else if (!inComments && !isSupportedFraction && c === '/' && !isEscapeCharacter(format, n)) {
                if (c === '_') {
                    n++; /* NOSONAR: S2310, Loop counters should not be assigned to from within the loop body*/
                }
                continue;
            }
            sb += c;
        }
        return sb;
    }

    function trimCommentedChar(format) {
        var result = '';
        var inComments = false;
        for (var i = 0, l = format.length; i < l; i++) {
            var c = format[i];
            if (c === '"') {
                inComments = !inComments;
            }
            if (c !== 'E' && !inComments) {
                result += toLowerCase(c);
            }
        }
        return result;
    }

    function containsKeywords(format, keywords) {
        if (!format || format === stringEx._Empty) {
            return false;
        }
        var formatTemp = trimUnsupportedSymbol(format);
        var result = trimCommentedChar(formatTemp);
        for (var index = 0; index < keywords.length; index++) {
            var keywordsIndex = result.indexOf(keywords[index]);
            if (keywordsIndex === 0) {
                return true;
            } else if (keywordsIndex > 0 && result[keywordsIndex - 1] !== '_' && result[keywordsIndex - 1] !== '*') {
                return true;
            }
        }
        return false;
    }

    var defaultPattern = [
        ['M/d', 'MMM/d', 'MMMM/d', 'd/M', 'd/MMM', 'd/MMMM', 'M-d', 'MMM-d', 'MMMM-d', 'd-M', 'd-MMM', 'd-MMMM'],
        ['M/y', 'MMM/y', 'M/yyyy', 'MMM/yyyy', 'M-y', 'MMM-y', 'M-yyyy', 'MMM-yyyy'],
        ['M/d/y', 'MMM/d/y', 'MMMM/d/y', 'M/d/yyyy', 'MMM/d/yyyy', 'MMMM/d/yyyy', 'd/M/y', 'd/MMM/y', 'd/MMMM/y', 'd/M/yyyy', 'd/MMM/yyyy', 'd/MMMM/yyyy', 'yyyy/M/d', 'M-d-y', 'MMM-d-y', 'MMMM-d-y', 'M-d-yyyy', 'MMM-d-yyyy', 'MMMM-d-yyyy', 'd-M-y', 'd-MMM-y', 'd-MMMM-y', 'd-M-yyyy', 'd-MMM-yyyy', 'd-MMMM-yyyy', 'yyyy-M-d'],
        ['H:m', 'h:m tt'],
        ['H:m:s', 'h:m:s tt', 'H:m:s', 'h:mm:ss tt'],
        ['H:m:s.FFF', 'h:m:s.FFF tt'],
        ['M/d H:m',
            'MMM/d H:m',
            'MMMM/d H:m',
            'd/M H:m',
            'd/MMM H:m',
            'd/MMMM H:m',
            'M/y H:m',
            'MMM/y H:m',
            'M/yyyy H:m',
            'MMM/yyyy H:m',
            'M/d/y H:m',
            'MMM/d/y H:m',
            'MMMM/d/y H:m',
            'M/d/yyyy H:m',
            'MMM/d/yyyy H:m',
            'MMMM/d/yyyy H:m',
            'M-d H:m',
            'MMM-d H:m',
            'MMMM-d H:m',
            'd-M H:m',
            'd-MMM H:m',
            'd-MMMM H:m',
            'M-y H:m',
            'MMM-y H:m',
            'M-yyyy H:m',
            'MMM-yyyy H:m',
            'M-d-y H:m',
            'MMM-d-y H:m',
            'MMMM-d-y H:m',
            'M-d-yyyy H:m',
            'MMM-d-yyyy H:m',
            'MMMM-d-yyyy H:m',
            'M/d h:m tt',
            'MMM/d h:m tt',
            'MMMM/d h:m tt',
            'd/M h:m tt',
            'd/MMM h:m tt',
            'd/MMMM h:m tt',
            'M/y h:m tt',
            'MMM/y h:m tt',
            'M/yyyy h:m tt',
            'MMM/yyyy h:m tt',
            'M/d/y h:m tt',
            'MMM/d/y h:m tt',
            'MMMM/d/y h:m tt',
            'M/d/yyyy h:m tt',
            'MMM/d/yyyy h:m tt',
            'MMMM/d/yyyy h:m tt',
            'M-d h:m tt',
            'MMM-d h:m tt',
            'MMMM-d h:m tt',
            'd-M h:m tt',
            'd-MMM h:m tt',
            'd-MMMM h:m tt',
            'M-y h:m tt',
            'MMM-y h:m tt',
            'M-yyyy h:m tt',
            'MMM-yyyy h:m tt',
            'M-d-y h:m tt',
            'MMM-d-y h:m tt',
            'MMMM-d-y h:m tt',
            'M-d-yyyy h:m tt',
            'MMM-d-yyyy h:m tt',
            'MMMM-d-yyyy h:m tt'
        ],
        [
            'M/d H:m:s',
            'MMM/d H:m:s',
            'MMMM/d H:m:s',
            'd/M H:m:s',
            'd/MMM H:m:s',
            'd/MMMM H:m:s',
            'M/y H:m:s',
            'MMM/y H:m:s',
            'M/yyyy H:m:s',
            'MMM/yyyy H:m:s',
            'M/d/y H:m:s',
            'MMM/d/y H:m:s',
            'MMMM/d/y H:m:s',
            'M/d/yyyy H:m:s',
            'MMM/d/yyyy H:m:s',
            'MMMM/d/yyyy H:m:s',
            'd/M/y H:m:s',
            'd/MMM/y H:m:s',
            'd/MMMM/y H:m:s',
            'd/M/yyyy H:m:s',
            'd/MMM/yyyy H:m:s',
            'd/MMMM/yyyy H:m:s',
            'yyyy/M/d H:m:s',
            'M-d H:m:s',
            'MMM-d H:m:s',
            'MMMM-d H:m:s',
            'd-M H:m:s',
            'd-MMM H:m:s',
            'd-MMMM H:m:s',
            'M-y H:m:s',
            'MMM-y H:m:s',
            'M-yyyy H:m:s',
            'MMM-yyyy H:m:s',
            'M-d-y H:m:s',
            'MMM-d-y H:m:s',
            'MMMM-d-y H:m:s',
            'M-d-yyyy H:m:s',
            'MMM-d-yyyy H:m:s',
            'MMMM-d-yyyy H:m:s',
            'd-M-y H:m:s',
            'd-MMM-y H:m:s',
            'd-MMMM-y H:m:s',
            'd-M-yyyy H:m:s',
            'd-MMM-yyyy H:m:s',
            'd-MMMM-yyyy H:m:s',
            'yyyy-M-d H:m:s',
            'M/d h:m:s tt',
            'MMM/d h:m:s tt',
            'MMMM/d h:m:s tt',
            'd/M h:m:s tt',
            'd/MMM h:m:s tt',
            'd/MMMM h:m:s tt',
            'M/y h:m:s tt',
            'MMM/y h:m:s tt',
            'M/yyyy h:m:s tt',
            'MMM/yyyy h:m:s tt',
            'M/d/y h:m:s tt',
            'MMM/d/y h:m:s tt',
            'MMMM/d/y h:m:s tt',
            'M/d/yyyy h:m:s tt',
            'MMM/d/yyyy h:m:s tt',
            'MMMM/d/yyyy h:m:s tt',
            'd/M/y h:m:s tt',
            'd/MMM/y h:m:s tt',
            'd/MMMM/y h:m:s tt',
            'd/M/yyyy h:m:s tt',
            'd/MMM/yyyy h:m:s tt',
            'd/MMMM/yyyy h:m:s tt',
            'yyyy/M/d h:m:s tt',
            'M/d/yyyy h:mm:ss tt',
            'M-d h:m:s tt',
            'MMM-d h:m:s tt',
            'MMMM-d h:m:s tt',
            'd-M h:m:s tt',
            'd-MMM h:m:s tt',
            'd-MMMM h:m:s tt',
            'M-y h:m:s tt',
            'MMM-y h:m:s tt',
            'M-yyyy h:m:s tt',
            'MMM-yyyy h:m:s tt',
            'M-d-y h:m:s tt',
            'MMM-d-y h:m:s tt',
            'MMMM-d-y h:m:s tt',
            'M-d-yyyy h:m:s tt',
            'MMM-d-yyyy h:m:s tt',
            'MMMM-d-yyyy h:m:s tt',
            'd-M-y h:m:s tt',
            'd-MMM-y h:m:s tt',
            'd-MMMM-y h:m:s tt',
            'd-M-yyyy h:m:s tt',
            'd-MMM-yyyy h:m:s tt',
            'd-MMMM-yyyy h:m:s tt',
            'yyyy-M-d h:m:s tt'
        ],
        [
            'M/d H:m:s.FFF',
            'MMM/d H:m:s.FFF',
            'MMMM/d H:m:s.FFF',
            'd/M H:m:s.FFF',
            'd/MMM H:m:s.FFF',
            'd/MMMM H:m:s.FFF',
            'M/y H:m:s.FFF',
            'MMM/y H:m:s.FFF',
            'M/yyyy H:m:s.FFF',
            'MMM/yyyy H:m:s.FFF',
            'd/M/y H:m',
            'd/MMM/y H:m',
            'd/MMMM/y H:m',
            'd/M/yyyy H:m',
            'd/mmm/yyyy H:m',
            'd/MMMM/yyyy H:m',
            'yyyy/M/d H:m',
            'M/d/y H:m:s.FFF',
            'MMM/d/y H:m:s.FFF',
            'MMMM/d/y H:m:s.FFF',
            'M/d/yyyy H:m:s',
            'MMM/d/yyyy H:m:s.FFF',
            'MMMM/d/yyyy H:m:s.FFF',
            'd/M/y H:m:s.FFF',
            'd/MMM/y H:m:s.FFF',
            'd/MMMM/y H:m:s.FFF',
            'd/M/yyyy H:m:s.FFF',
            'd/MMM/yyyy H:m:s.FFF',
            'd/MMMM/yyyy H:m:s.FFF',
            'yyyy/M/d H:m:s.FFF',
            'M-d H:m:s.FFF',
            'MMM-d H:m:s.FFF',
            'MMMM-d H:m:s.FFF',
            'd-M H:m:s.FFF',
            'd-MMM H:m:s.FFF',
            'd-MMMM H:m:s.FFF',
            'M-y H:m:s.FFF',
            'MMM-y H:m:s.FFF',
            'M-yyyy H:m:s.FFF',
            'MMM-Yyyy H:m:s.FFF',
            'd-M-y H:m',
            'd-MMM-y H:m',
            'd-MMMM-y H:m',
            'd-M-yyyy H:m',
            'd-MMM-yyyy H:m',
            'd-MMMM-yyyy H:m',
            'yyyy-M-d H:m',
            'M-d-y H:m:s.FFF',
            'MMM-d-y H:m:s.FFF',
            'MMMM-d-y H:m:s.FFF',
            'M-d-yyyy H:m:s',
            'MMM-d-yyyy H:m:s.FFF',
            'MMMM-d-yyyy H:m:s.FFF',
            'D-M-y H:m:s.FFF',
            'd-MMM-y H:m:s.FFF',
            'd-MMMM-y H:m:s.FFF',
            'D-M-yyyy H:m:s.FFF',
            'd-MMM-yyyy H:m:s.FFF',
            'd-MMMM-yyyy H:m:s.FFF',
            'yyyy-M-d H:m:s.FFF',
            'M/d h:m:s.FFF tt',
            'MMM/d h:m:s.FFF tt',
            'MMMM/d h:m:s.FFF tt',
            'd/M h:m:s.FFF tt',
            'd/MMM h:m:s.FFF tt',
            'd/MMMM h:m:s.FFF tt',
            'M/y h:m:s.FFF tt',
            'MMM/y h:m:s.FFF tt',
            'M/yyyy h:m:s.FFF tt',
            'MMM/yyyy h:m:s.FFF tt',
            'd/M/y h:m tt',
            'd/MMM/y h:m tt',
            'd/MMMM/y h:m tt',
            'd/M/yyyy h:m tt',
            'd/mmm/yyyy h:m tt',
            'd/MMMM/yyyy h:m tt',
            'yyyy/M/d h:m tt',
            'M/d/y h:m:s.FFF tt',
            'MMM/d/y h:m:s.FFF tt',
            'MMMM/d/y h:m:s.FFF tt',
            'M/d/yyyy h:m:s tt',
            'MMM/d/yyyy h:m:s.FFF tt',
            'MMMM/d/yyyy h:m:s.FFF tt',
            'd/M/y h:m:s.FFF tt',
            'd/MMM/y h:m:s.FFF tt',
            'd/MMMM/y h:m:s.FFF tt',
            'd/M/yyyy h:m:s.FFF tt',
            'd/MMM/yyyy h:m:s.FFF tt',
            'd/MMMM/yyyy h:m:s.FFF tt',
            'yyyy/M/d h:m:s.FFF tt',
            'M-d h:m:s.FFF tt',
            'MMM-d h:m:s.FFF tt',
            'MMMM-d h:m:s.FFF tt',
            'd-M h:m:s.FFF tt',
            'd-MMM h:m:s.FFF tt',
            'd-MMMM h:m:s.FFF tt',
            'M-y h:m:s.FFF tt',
            'MMM-y h:m:s.FFF tt',
            'M-yyyy h:m:s.FFF tt',
            'MMM-Yyyy h:m:s.FFF tt',
            'd-M-y h:m tt',
            'd-MMM-y h:m tt',
            'd-MMMM-y h:m tt',
            'd-M-yyyy h:m tt',
            'd-MMM-yyyy h:m tt',
            'd-MMMM-yyyy h:m tt',
            'yyyy-M-d h:m tt',
            'M-d-y h:m:s.FFF tt',
            'MMM-d-y h:m:s.FFF tt',
            'MMMM-d-y h:m:s.FFF tt',
            'M-d-yyyy H:m:s tt',
            'MMM-d-yyyy H:m:s.FFF tt',
            'MMMM-d-yyyy h:m:s.FFF tt',
            'd-M-y h:m:s.FFF tt',
            'd-MMM-y h:m:s.FFF tt',
            'd-MMMM-y h:m:s.FFF tt',
            'd-M-yyyy h:m:s.FFF tt',
            'd-MMM-yyyy h:m:s.FFF tt',
            'd-MMMM-yyyy h:m:s.FFF tt',
            'yyyy-M-d h:m:s.FFF tt'
        ]
    ];
    var defaultDateTimeFormatter = function () {
        return {
            pattern: defaultPattern,
            formatter: ['d-mmm', 'mmm-yy', getDateTimeFormat().shortDatePattern, 'h:mm', 'h:mm:ss', 'h:mm:ss.0',
                getDateTimeFormat().shortDatePattern + ' h:mm',
                getDateTimeFormat().shortDatePattern + ' h:mm:ss',
                getDateTimeFormat().shortDatePattern + ' h:mm:ss.0'
            ]
        };
    };

    function appendNumberFormatPro(partLocaleID, dbNumberFormatPart, cultureName) {
        this._partLocaleID = partLocaleID;
        this._partDBNumberFormat = dbNumberFormatPart;
        this.cultureName = cultureName;
    }

    function appendFormatBasePro(token) {
        this._originalToken = token;
    }

    function getFormatPartType(token) {
        var type;
        var content = trimSquareBracket(token);
        if (!content || content === stringEx._Empty) {
            return type;
        }
        var c = content[0];
        if (['<', '>', '='].indexOf(c) > -1) {
            type = ConditionalFormatPart;
            type.Name = 'ConditionalFormatPart';
        } else if (stringHelper._startsWith(content, 'DBNum', true /* IgnoreCase */)) {
            type = DBNumberFormatPart;
            type.Name = 'DBNumberFormatPart';
        } else if (isEquals(content[0], '$', false) && content.indexOf('-') > -1) {
            type = LocaleIDFormatPart;
            type.Name = 'LocaleIDFormatPart';
        } else if (isABSTimePart(content)) {
            type = ABSTimeFormatPart;
            type.Name = 'ABSTimeFormatPart';
        } else if (content.indexOf('$') < 0 && content.length >= 3) {
            type = ColorFormatPart;
            type.Name = 'ColorFormatPart';
        }

        return type;
    }

    function getFormatterType(content, isConditionalFormat) {
        var isDigitalOrText = false;
        var type;
        content = content ? content.toString() : stringEx._Empty;
        if (containsKeywords(content, ['general'])) {
            type = NumberFormatGeneral;
        } else if (NumberFormatDateTime._evaluateFormat(content)) {
            type = NumberFormatDateTime;
        } else if (containsKeywords(content, ['E+', 'E-', '#', '.', ',', '%', '0', '/', '?']) || isConditionalFormat) {
            isDigitalOrText = true;
            type = NumberFormatDigital;
        } else {
            isDigitalOrText = true;
            type = NumberFormatText;
        }
        return {
            _isDigitalOrText: isDigitalOrText,
            _type: type
        };
    }

    function isABSTimePart(content) {
        var contentLowerCase = toLowerCase(content);
        var c = contentLowerCase[0];
        if (c !== 'h' && c !== 'm' && c !== 's') {
            return false;
        }
        for (var n = 1; n < contentLowerCase.length; n++) {
            if (c !== contentLowerCase[n]) {
                return false;
            }
        }
        return true;
    }

    function getDBNumber(locale, dbNumberType, cultureName) {
        var cultureInfo;
        if (locale) {
            cultureInfo = locale.cultureInfo();
        } else {
            cultureInfo = getCultureInfo(cultureName);
        }
        var dbNumbers = cultureInfo.NumberFormat.dbNumber;
        if (dbNumbers) {
            return dbNumbers[dbNumberType];
        }
        return keyword_null;
    }

    function convertDateTimeNumberString(num, value, locale, dbNumber, cultureName) {
        var strTemp = num;
        if (!isNullOrUndefined(dbNumber) && value instanceof Date) {
            var dbNumberTemp = getDBNumber(locale, dbNumber.type, cultureName);
            strTemp = dbNumber._replaceNumberString(strTemp, dbNumberTemp, true);
            if (dbNumber.type === 1) { // DBNum1
                strTemp = strTemp.replace(new RegExp(DBNum1Ten, 'g'), DBNum1ExcelTen);
            }
            strTemp = strTemp.replace('@' + dateTimeTokens._yearFourDigit, dateTimeHelper._localeFormat(value, dateTimeTokens._yearFourDigit));
            strTemp = strTemp.replace('@' + dateTimeTokens._yearTwoDigit, dateTimeHelper._localeFormat(value, dateTimeTokens._yearTwoDigit));
            strTemp = dbNumber._replaceNumberString(strTemp, dbNumberTemp, false);
        }
        return strTemp;
    }

    function convertNumberString(num, isGeneralNumber, locale, dbNumber, cultureName) {
        if (!isNullOrUndefined(dbNumber)) {
            var dbNumberTemp = getDBNumber(locale, dbNumber.type, cultureName);
            if (!isNullOrUndefined(dbNumberTemp)) {
                var isFractional = false;
                var fractional;
                var cultureInfo = getCultureInfo(cultureName);
                var head;
                for (var i = 0, len = num.length; i < len; i++) {
                    if (num[i].type === 'decimalSeparator') {
                        isFractional = true;
                        num[i].value = dbNumber._replaceNumberString(num[i].value, dbNumberTemp, isGeneralNumber);
                        fractional = num[i].value;
                    }
                    if (num[i].type === 'number') {
                        if (isFractional) {
                            num[i].value = dbNumber._replaceNumberString(fractional + num[i].value, dbNumberTemp, isGeneralNumber).slice(1);
                        } else {
                            num[i].value = dbNumber._replaceNumberString(num[i].value, dbNumberTemp, isGeneralNumber);
                        }
                        // TODO add jp culture derived class
                        if (cultureInfo.name() === 'ja-JP' &&
                            num[i].value.length > 1 && ((head = num[i].value.substr(0, 2)) === '一千' || head === '一百' || head === '一十')) {
                            // fix bug 214360, in ja-JP culture, DBNumber will ignore first character if it is 1
                            num[i].value = num[i].value.substr(1);
                        }
                    }

                }
                return num;
            }
        }
        return num;
    }


    var CustomNumberFormat = (function () {
        function CustomNumberFormat(format, cultureName) {
            var self = this;
            if (arguments.length === 0) {
                self.formatCached = 'General';
                self._numberFormat = new NumberFormatGeneral();
            } else {
                self._init(format, cultureName);
            }
        }

        // CustomNumberFormat Public Properties
        var proNames = ['colorFormatPart', 'conditionalFormatPart', 'dbNumberFormatPart', 'localeIDFormatPart'];

        function checkFormatter(str) {
            if (!str || str === stringEx._Empty) {
                throw new Error(SR().Exp_TokenIllegal);
            }
        }

        function preProcessPart(part) {
            checkFormatter(part);
            var content = trimSquareBracket(part);
            checkFormatter(content);
            return content;
        }

        function partToNormalStr(part) {
            var content = preProcessPart(part);            
            if (content[0] === '$') {
                content = content.slice(1);
            }
            return '"' + content + '"';
        }

        CustomNumberFormat.prototype = {
            _init: function (format, cultureName) {
                if (format === keyword_null || format === keyword_undefined) {
                    throwFormatEx();
                }
                var formatCache = format;
                var self = this;
                self.formatCached = format;
                var contentToken = '';
                var token = '';
                var isInFormatPart = false;
                var absTimePart = [];
                // todo:[red][<200]]##.00
                // todo: pattern = new RegExp("\\[[\\<\\>\\w]*\\]", "g")
                // todo: use reg to replace following code.
                for (var index = 0; index < format.length; index++) {
                    var c = format[index];
                    if (c === '[') {
                        if (isInFormatPart) {
                            throwFormatEx();
                        }

                        // todo:for use case, #,##0.00 [$Lek-41C]
                        if (token) {
                            if (!contentToken) {
                                contentToken = '';
                            }
                            contentToken += token;
                        }
                        token = c.toString();
                        isInFormatPart = true;
                    } else if (c === ']') {
                        if (!isInFormatPart) {
                            throwFormatEx();
                        }

                        if (token) {
                            token += c;
                            var part = token.toString();
                            var partType = getFormatPartType(token.toString());
                            if (partType) {
                                if (partType.Name === 'ABSTimeFormatPart') {
                                    absTimePart.push(new partType(preProcessPart(part), part));
                                    contentToken += token;
                                } else {
                                    self.addPart(partType, part);
                                }
                            } else {
                                // If the part type is null, treat the string in "[]" as normal string. And '$' in "[]" should be ignored.
                                //            format          |    value    |           result
                                //        [$USD] * #,##0.00   |  123456.789 |   USD         123,456.79
                                //        [$ MYR] * #,##0.00  |  123456.789 |    MYR        123,456.79
                                //        [$] * #,##0.00      |  123456.789 |               123,456.79
                                //        [$aaa] * #,##0.00   |  123456.789 |   aaa         123,456.79
                                var partString = partToNormalStr(part);
                                contentToken += partString;
                                formatCache = replaceKeyword(format, part, partString);
                            }
                            token = '';
                        } else {
                            throwFormatEx();
                        }

                        isInFormatPart = false;
                    } else {
                        token += c;
                    }
                }
                if (token) {
                    if (isInFormatPart) {
                        throwFormatEx();
                    } else {
                        contentToken += token;
                    }
                } else if (!contentToken) {
                    // Fix bug 254362, when the format is a DBNumber format, and there is nothing after "[]",
                    // 'General' should be appended to format string.
                    //      [DBNum2] -> [DBNum2]General
                    contentToken = self._getDBNumberDefaultFormat();
                }
                // Use the localeID in format string.
                if (self.localeIDFormatPart) {
                    cultureName = self.localeIDFormatPart.cultureInfo().name();
                }
                var isConditionalFormat = self.conditionalFormatPart;
                var result = getFormatterType(contentToken, isConditionalFormat);
                var formatType = result._type;
                var formatTemp = result._isDigitalOrText ? formatCache : contentToken;
                if (formatType) {
                    self._numberFormat = new formatType(formatTemp, self.localeIDFormatPart, self.dbNumberFormatPart, cultureName, absTimePart.length > 0 ? absTimePart : keyword_null);
                } else {
                    throwFormatEx();
                }
            },            
            _getDBNumberDefaultFormat: function () {
                var _this = this, retFormat = '';
                if (_this.dbNumberFormatPart) {
                    var hasOtherPart = proNames.some(function (item) {
                        return item !== 'dbNumberFormatPart' && _this[item];
                    });
                    if (!hasOtherPart) {
                        retFormat = 'General';
                    }
                }
                return retFormat;
            },
            formatString: function () {
                var self = this;
                var formatString = '';
                for (var i = 0, len = proNames.length; i < len; i++) {
                    var proName = proNames[i];
                    if (self[proName]) {
                        formatString += self[proName].toString();
                    }
                }
                formatString += (self._numberFormat.formatString());
                return formatString;
            },
            addPart: function (type, part) {
                var self = this;
                var content = preProcessPart(part);
                for (var i = 0, len = proNames.length; i < len; i++) {
                    var proName = proNames[i];
                    if (isEquals(proName, type.Name, true)) {
                        if (!self[proName]) {
                            self[proName] = new type(content, part);
                        } else {
                            throw new Error(SR().Exp_DuplicatedDescriptor);
                        }
                    }
                }
            },
            format: function (obj) {
                return this._numberFormat.format(obj);
            },
            parse: function (str) {
                return this._numberFormat.parse(str);
            }
        };
        return CustomNumberFormat;
    })();

    var GeneralFormatter = (function (_super) {
        Types._inherit(GeneralFormatter, _super);
        ///* class GC.Spread.Formatter.GeneralFormatter(format: string, cultureName: string)
        /**
         * Represents a formatter with the specified format mode and format string.
         * @class
         * @param {string} format The format.
         * @param {string} cultureName The culture name.
         */
        function GeneralFormatter(format, cultureName) {
            var self = this;
            self._isSingleFormatterInfo = true;
            self.PropertyChanged = [];
            if (stringEx._isNullOrEmpty(format)) {
                format = 'General';
            }

            self.formatCached = format;
            self.cultureName = cultureName;
            self.init();
        }

        // GeneralFormatter static Properties
        function defFormatter(formatStr) {
            var t = GeneralFormatter[formatStr];
            if (!t) {
                t = new GeneralFormatter(formatStr);
                GeneralFormatter[formatStr] = t;
            }
            return t;
        }

        GeneralFormatter.prototype = {
            toJSON: function () {
                var self = this;
                var jsData = {
                    formatCached: self.formatCached
                };
                if (self.cultureName) {
                    jsData['customerCultureName'] = self.cultureName;
                }
                if (toLowerCase(self.formatCached) === 'general') {
                    delete jsData.formatCached;
                }
                return jsData;
            },

            hasFormatedColor: function () {
                var self = this;
                for (var pro in formatPart) {
                    if (formatPart.hasOwnProperty(pro)) {
                        var expression = self.getFormatter(formatPart[pro]);
                        if (expression && expression.colorFormatPart) {
                            return true;
                        }
                    }
                }
                return false;
            },
            ///* function formatString(value?: string): any
            /**
             * Gets or sets the format string for this formatter.
             * @param {string} value The format string for this formatter.
             * @returns {string|GC.Spread.Formatter.GeneralFormatter} If no value is set, returns the formatter string for this formatter; otherwise, returns the formatter.
             */
            formatString: function (value) {
                var self = this;
                if (arguments.length === 0) {
                    // Get
                    var formatStringBuilder = stringEx._Empty;
                    for (var i = 0, len = self.formatters.length; i < len; i++) {
                        var p = self.formatters[i];
                        formatStringBuilder += (p.formatString());
                        if (i !== len - 1) {
                            formatStringBuilder += (';');
                        }
                    }
                    return formatStringBuilder;
                }
                // Set
                if (!value) {
                    throw new Error(SR().Exp_ValueIsNull);
                }
                self.formatters = keyword_null;
                self.formatCached = value;
                self.init();
                self._raisePropertyChanged('formatString');
                return self;
            },
            getFormatter: function (index) {
                var self = this;
                return self.formatters && self.formatters[index];
            },

            getPreferredEditingFormatter: function (obj) {
                var dateTimeFormatInfo = getDateTimeFormat(this.cultureName);
                if (isType(obj, 'DateTime')) {
                    var addF = (obj.getHours() === 0 && obj.getMinutes() === 0 && obj.getSeconds() === 0 && obj.getMilliseconds() === 0) ? '' : ' h:mm:ss';
                    return defFormatter(dateTimeFormatInfo.shortDatePattern + addF);
                } else if (isType(obj, 'TimeSpan')) {
                    return defFormatter(dateTimeFormatInfo.longTimePattern);
                } else if (Types._isNumber(obj, this.cultureName)) {
                    var value = Types._toDouble(obj);
                    if (value >= 1E20 || value <= 1E-17 && value > 0 || value <= -1E20 || value < 0 && value >= -1E-17) {
                        return defFormatter('0.##E+00');
                    }
                    return defFormatter(generalNumberFormatDigit);
                }
                return defFormatter('General');
            },

            getPreferredDisplayFormatter: function (s, valueRef) {
                // The following three lines of code is for saving workload of writing cellformatter test scripts.
                // The test scripts are migrated from SX,and GetPreferredDisplayFormatter has only one param in SX,so make this change.
                // If user doesn't want to get the result of parse when call this method,the second param of the method can be omitted.
                var self = this;
                if (!valueRef) {
                    valueRef = {'value': keyword_null};
                }
                valueRef.value = keyword_null;
                if (stringEx._isNullOrEmpty(s)) {
                    return new GeneralFormatter();
                }
                var strTemp = s;
                var v = valueRef.value = self.parse(strTemp);
                if (isType(v, 'DateTime') || isType(v, 'TimeSpan')) {
                    var dateTimeFormatter = defaultDateTimeFormatter();
                    var pattern = dateTimeFormatter.pattern;
                    var formatter = dateTimeFormatter.formatter;
                    for (var i = 0; i < pattern.length; i++) {
                        var p = pattern[i];
                        for (var j = 0; j < p.length; j++) {
                            var f = p[j];
                            var dt = dateTimeHelper._parseLocale(s, f);
                            if (dt && (dt - v === 0)) {
                                return new GeneralFormatter(formatter[i]);
                            }
                        }
                    }
                } else if (Types._isNumber(v, self.cultureName)) {
                    var numberFormat = getNumberFormat(self.cultureName);
                    var currencySymbol = numberFormat.currencySymbol;
                    var decimalSymbol = numberFormat.numberDecimalSeparator;
                    var percentSymbol = numberFormat.percentSymbol;
                    var numberGroupSymbol = numberFormat.numberGroupSeparator;
                    var eSymbol = 'E';
                    var contains = stringHelper._contains;
                    var hasDecimalSymbol = contains(strTemp, decimalSymbol);
                    var decimalPart = hasDecimalSymbol ? '.00' : '';
                    if (strTemp[0] === currencySymbol) {
                        return defFormatter(stringEx._format('{0}#,##0{1};[Red]({0}#,##0{1})', currencySymbol, decimalPart));
                    } else if (contains(strTemp, eSymbol, 1)) {
                        return defFormatter('0.00E+00');
                    } else if (strTemp[0].toString() === percentSymbol || strTemp[strTemp.length - 1].toString() === percentSymbol) {
                        return defFormatter(stringEx._format('0{0}%', decimalPart));
                    } else if (contains(strTemp, numberGroupSymbol)) {
                        return defFormatter(stringEx._format('#,##0{0}', decimalPart));
                    }
                }
                return defFormatter('General');
            },
            ///* function format(obj: Object, formattedData: Object): string
            /**
             * Formats the specified object as a string with a formatted data Object.
             * @param {Object} obj The object with cell data to format.
             * @param {Object} formattedData The object with formatted data.
             * @param {Array} [formattedData.content]-The formatted data array, each item is an object that has two properties type and value, And it may contain these types: 'number', 'text', 'fillingChar', 'placeholder', 'exponent', 'decimalSeparator', 'groupSeparator', 'numberPlaceholder', 'percent', 'permille' and 'currency'. For example: {type: 'number', value: '123'}.
             * @param {string} [formattedData.conditionalForeColor]-The conditional foreground color.
             * @returns {string} The formatted string.
             */
            format: function (obj, formattedData) {
                if (isType(obj, 'boolean')) {
                    return obj.toString().toUpperCase();
                }
                var formatInfo = this._getFormatInfo(obj);
                if (formatInfo) {
                    var colorPart = formatInfo.colorFormatPart;
                    if (formattedData && colorPart) {
                        formattedData.conditionalForeColor = formattedData.value = colorPart.foreColor;
                    }
                    // format value
                    var value = 0;
                    var isNumber = Types._isNumber(obj, self.cultureName);
                    if (isNumber) {
                        value = Types._toDouble(obj);
                    }

                    var result = stringEx._Empty;
                    try {
                        if (isNumber && formatInfo === this.getFormatter(formatPart._negative)) {
                            result = formatInfo.format(Math_abs(value));
                        } else {
                            result = formatInfo.format(obj);
                        }
                        if (formattedData) {
                            formattedData.content = isArray(result) ? result : [{type: 'text', value: result}];
                        }
                        if (isArray(result)) {
                            result = numberHelper._formatObjectToSrting(result);
                        }
                    } catch (Exception) {
                        if (isType(obj, 'string')) {
                            result = obj.toString();
                        }
                    }
                    return result;
                }
                if (isNumber && value < 0) {
                    return '-'.toString();
                }
                if (isType(obj, 'string')) {
                    return obj.toString();
                }
                return (obj === keyword_undefined || obj === keyword_null) ? stringEx._Empty : obj.toString();
            },
            ///* function parse(str: string): Object
            /**
             * Parses the specified text.
             * @param {string} text The text.
             * @returns {Object} The parsed object.
             */
            parse: function (str) {
                var self = this;
                if (self.formatters && self.formatters.length > 0) {
                    return self.formatters[0].parse(str);
                }
                return keyword_null;
            },
            // GeneralFormatter Private Methods
            //use for migration
            init: function () {
                var self = this;
                var format = self.formatCached;
                if (stringEx._isNullOrEmpty(format)) {
                    throwFormatEx();
                }
                self.formatters = [];
                var items = format.split(';');
                self._isSingleFormatterInfo = (items.length === 1);
                if (!items || items.length < 1 || items.length > 4) {
                    throwFormatEx();
                }
                for (var index = 0; index < items.length; index++) {
                    var formatItem = new CustomNumberFormat(items[index], self.cultureName);
                    self.formatters.push(formatItem);
                }
                if (!self.getFormatter(formatPart._positive)) {
                    throwFormatEx();
                }
            },
            _getFormatInfo: function (obj) {
                var self = this;
                var positive = self.getFormatter(formatPart._positive);
                var text = self.getFormatter(formatPart._text);
                if (typeof (obj) === 'string' && isNaN(obj)) {
                    if (text) {
                        return text;
                    }
                    return positive;
                } else if (Types._isNumber(obj, self.cultureName) || isType(obj, 'boolean')) {
                    var negative = self.getFormatter(formatPart._negative);
                    var zero = self.getFormatter(formatPart._zero);
                    var value = Types._toDouble(obj);
                    var hasPCondition = positive && positive.conditionalFormatPart;
                    var positiveMatchCondition = hasPCondition && positive.conditionalFormatPart.isMeetCondition(value);
                    var hasNCondition = negative && negative.conditionalFormatPart;
                    var negativeMatchCondition = hasNCondition && negative.conditionalFormatPart.isMeetCondition(value);
                    var resultFormatter;

                    if (self._isSingleFormatterInfo || (hasPCondition ? positiveMatchCondition : (value > 0 || (value === 0 && !zero)))) {
                        resultFormatter = positive;
                    } else if (hasNCondition ? negativeMatchCondition : value < 0) {
                        resultFormatter = negative;
                    } else if (zero) {
                        resultFormatter = zero;
                    } else if (negative) {
                        resultFormatter = negative;
                    }
                    return resultFormatter;
                }
                return keyword_null;
            },
            _raisePropertyChanged: function (propertyName) {
                var self = this;
                if (self.PropertyChanged) {
                    for (var index = 0; index < self.PropertyChanged.length; index++) {
                        var method = self.PropertyChanged[index];
                        if (typeof (method) === 'function') {
                            method(self, propertyName);
                        }
                    }
                }
            }
        };

        return GeneralFormatter;
    })(FormatterBase);
    Plugins.GeneralFormatter = GeneralFormatter;

    Plugins.FormatterBase = FormatterBase;

    module.exports = Plugins;

}());