(function () {
    'use strict';

    var Common = require('./common.js');
    var isNullOrUndefined = require('./types')._isNullOrUndefined;
    var RegexHelper = require('./regexhelper.js');
    var StringHelper = require('./stringhelper.js');
    var padZeroLeft = StringHelper._padZeroLeft, padZeroRight = StringHelper._padZeroRight;
    var cM = require('../culture/cultureInfo.js').CultureManager;
    var keyword_null = null, keyword_undefined = void 0, parseIntFn = parseInt, parseFloatFn = parseFloat,
        FALSE = false, TRUE = true, Math_floor = Math.floor, Math_abs = Math.abs, Math_pow = Math.pow,
        Math_min = Math.min;

    function substr(str, start, length) {
        return str.substr(start, length);
    }

    var sR = function () {
        return Common._getResource(Common.SR)();
    };

    var NumberHelper = (function () {
        var _generalNumberInt = '##################0';
        var _generalNumberDec = '################';
        var _signs = {'1': '+', '0': '', '-1': '-'};
        var _maxInt32 = 4294967295;
        var _intPlaceholder = ['0', '#', '?'];
        var currencySymbolList = {
            "¤": "¤",
            "Br": "Br",
            "Fdj": "Fdj",
            "Nfk": "Nfk",
            "R": "R",
            "$": "$",
            "FCFA": "FCFA",
            "GH₵": "GH₵",
            "ብር": "ብር",
            "ر.س.‏": "ر.س.‏",
            "XDR": "XDR",
            "د.إ.‏": "د.إ.‏",
            "د.ب.‏": "د.ب.‏",
            "د.ج.‏": "د.ج.‏",
            "ج.م.‏": "ج.م.‏",
            "₪": "₪",
            "د.ع.‏": "د.ع.‏",
            "د.ا.‏": "د.ا.‏",
            "ف.ج.ق.‏": "ف.ج.ق.‏",
            "د.ك.‏": "د.ك.‏",
            "ل.ل.‏": "ل.ل.‏",
            "د.ل.‏": "د.ل.‏",
            "د.م.‏": "د.م.‏",
            "أ.م.‏": "أ.م.‏",
            "ر.ع.‏": "ر.ع.‏",
            "ر.ق.‏": "ر.ق.‏",
            "ج.س.": "ج.س.",
            "S": "S",
            "£": "£",
            "ل.س.‏": "ل.س.‏",
            "د.ت.‏": "د.ت.‏",
            "ر.ي.‏": "ر.ي.‏",
            "₹": "₹",
            "TSh": "TSh",
            "€": "€",
            "₼": "₼",
            "₽": "₽",
            "K": "K",
            "лв.": "лв.",
            "₦": "₦",
            "CFA": "CFA",
            "৳": "৳",
            "¥": "¥",
            "KM": "KM",
            "КМ": "КМ",
            "USh": "USh",
            "Kč": "Kč",
            "kr.": "kr.",
            "Ksh": "Ksh",
            "CHF": "CHF",
            "ރ.": "ރ.",
            "Nu.": "Nu.",
            "EC$": "EC$",
            "P": "P",
            "US$": "US$",
            "D": "D",
            "Rp": "Rp",
            "Ar": "Ar",
            "MOP$": "MOP$",
            "Rs": "Rs",
            "MK": "MK",
            "RM": "RM",
            "₱": "₱",
            "RF": "RF",
            "SR": "SR",
            "SDG": "SDG",
            "Le": "Le",
            "NAf.": "NAf.",
            "E": "E",
            "T$": "T$",
            "VT": "VT",
            "WS$": "WS$",
            "Bs": "Bs",
            "₡": "₡",
            "Q": "Q",
            "L": "L",
            "C$": "C$",
            "B/.": "B/.",
            "S/.": "S/.",
            "₲": "₲",
            "Bs.": "Bs.",
            "ريال": "ريال",
            "FG": "FG",
            "UM": "UM",
            "kr": "kr",
            "FBu": "FBu",
            "FC": "FC",
            "DA": "DA",
            "G": "G",
            "CF": "CF",
            "DH": "DH",
            "FCFP": "FCFP",
            "LS": "LS",
            "DT": "DT",
            "kn": "kn",
            "HUF": "HUF",
            "֏": "֏",
            "ISK": "ISK",
            "₾": "₾",
            "​": "​",
            "₸": "₸",
            "៛": "៛",
            "₩": "₩",
            "сом": "сом",
            "Kz": "Kz",
            "₭": "₭",
            "MTn": "MTn",
            "ден": "ден",
            "₮": "₮",
            "रु": "रु",
            "Afl.": "Afl.",
            "ߖߕ.": "ߖߕ.",
            "руб.": "руб.",
            "zł": "zł",
            "؋": "؋",
            "R$": "R$",
            "Db": "Db",
            "RON": "RON",
            "₴": "₴",
            "MAD": "MAD",
            "රු.": "රු.",
            "Lekë": "Lekë",
            "den": "den",
            "RSD": "RSD",
            "дин.": "дин.",
            "ܠ.ܣ.‏": "ܠ.ܣ.‏",
            "Rs.": "Rs.",
            "смн": "смн",
            "฿": "฿",
            "m.": "m.",
            "₺": "₺",
            "ⴷⵔ": "ⴷⵔ",
            "soʻm": "soʻm",
            "сўм": "сўм",
            "₫": "₫",
            "HK$": "HK$",
            "MOP": "MOP",
            "NT$": "NT$"
        };

        function _toFormattedString(num, format, cultureInfo, isFraction) {
            if (!format || (format.length === 0) || (format === 'i')) {
                if (cultureInfo && (cultureInfo.name.length > 0)) {
                    return num.toLocaleString();
                }
                return num.toString();
            }
            return _toCustomFormattedString(num, format, cultureInfo.NumberFormat, isFraction);
        }

        function _toCustomFormattedString(num, format, numberFormatCultureInfo, isFraction) {
            var parsedFormat = _parseCustomNumberFormatter(format, numberFormatCultureInfo);
            // parsing format success.
            // result [{type: '', value: ''}].
            return _formatNumber(num, parsedFormat, numberFormatCultureInfo, isFraction);
        }

        function _getIntegerAndDecimalLength(value, separator) {
            var ip = Math_floor(Math_abs(value));
            var digit = {_integer: 1, _decimal: 0};
            while (ip >= 10) {
                ip = ip / 10;
                digit._integer++;
            }
            var valueStr = value.toString();
            var exponentIndex = valueStr.search(/e/ig);
            var pointIndex = valueStr.indexOf(separator);
            var length;
            if (exponentIndex !== -1) {
                var numPart = substr(valueStr, 0, exponentIndex);
                var expPart = substr(valueStr, exponentIndex + 1);
                var decimalPartLength = 0;
                if (pointIndex !== -1) {
                    decimalPartLength = substr(numPart, pointIndex + 1).length;
                }
                var expValue = parseFloatFn(expPart);
                length = decimalPartLength - expValue;
                if (length < 0) {
                    length = 0;
                }
                digit._decimal = length;
            } else {
                length = 0;
                if (pointIndex !== -1) {
                    length = substr(valueStr, pointIndex + 1).length;
                }
                digit._decimal = length;
            }
            return digit;
        }

        function _parseExponentFormat(format) {
            var exponent = {
                _symbol: format.charAt(0),
                _sign: 0,
                _exp: 0
            };
            var ss = '';
            for (var si = 1; si < format.length; si++) {
                ss = format.charAt(si);
                if (ss === '+') {
                    exponent._sign = 1;
                } else if (ss === '-') {
                    exponent._sign = -1;
                } else if (ss === '0') {
                    exponent._exp = format.length - si;
                    break;
                } else {
                    throw new Error(sR().Exp_InvalidExponentFormat);
                }
            }
            return exponent;
        }

        function _parseCustomNumberFormatter(format, numberFormatCultureInfo) {
            var currentParsedPart = {
                _intPart: keyword_null,
                _decPart: keyword_null,
                _group: FALSE,
                _scale: 0,
                _percent: 0,
                _permille: 0,
                _exponent: keyword_null
            };
            var stringBuffer = '', inDoubleQuoteString = FALSE, inScientific = FALSE, decimalPointFound = FALSE,
                groupSeparatorFound = FALSE, scientificFound = FALSE, intPlaceHoldFound = FALSE;
            var currentChar, previousChar = keyword_null, currentPart = [];

            for (var i = 0; i < format.length; i++) { /* NOSONAR: TooManyBreakOrContinueInLoop */
                currentChar = format.charAt(i);
                if (inDoubleQuoteString) {
                    stringBuffer += currentChar;
                    if (currentChar === '"') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                        inDoubleQuoteString = FALSE;
                    }
                } else if (inScientific) {
                    if (previousChar === 'E' || previousChar === 'e') {
                        if (['+', '-', '0'].indexOf(currentChar) >= 0) {
                            stringBuffer += currentChar;
                        } else {
                            inScientific = FALSE;
                            i--; /* NOSONAR: S2310, Loop counters should not be assigned to from within the loop body */
                            continue;
                        }
                    } else if (previousChar === '+' || previousChar === '-') {
                        if (currentChar === '0') {
                            stringBuffer += currentChar;
                        } else {
                            inScientific = FALSE;
                            i--; /* NOSONAR: S2310, Loop counters should not be assigned to from within the loop body */
                            continue;
                        }
                    } else if (previousChar === '0') {
                        if (currentChar === '0') {
                            stringBuffer += currentChar;
                        } else {
                            inScientific = FALSE;
                            if (!scientificFound) {
                                scientificFound = TRUE;
                                // parse strBuf to get current exp format
                                currentParsedPart._exponent = _parseExponentFormat(stringBuffer);
                            }
                            i--; /* NOSONAR: S2310, Loop counters should not be assigned to from within the loop body */
                            continue;
                        }
                    }
                } else if ((previousChar === '*' || previousChar === '_' || previousChar === '\\') && stringBuffer !== '') {
                    stringBuffer += currentChar;
                    currentPart.push(stringBuffer);
                    stringBuffer = '';
                } else if (currentChar === '*' || currentChar === '_' || currentChar === '\\') {
                    intPlaceHoldFound = FALSE;
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    stringBuffer += currentChar;
                } else if (currentChar === "'") {
                    intPlaceHoldFound = FALSE;
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    currentPart.push(currentChar);
                } else if (currentChar === '"') {
                    intPlaceHoldFound = FALSE;
                    inDoubleQuoteString = TRUE;
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    stringBuffer += currentChar;
                } else if (_intPlaceholder.indexOf(currentChar) >= 0) {
                    intPlaceHoldFound = TRUE;
                    if (_intPlaceholder.indexOf(previousChar) < 0 && stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    stringBuffer += currentChar;
                } else if (currentChar === '.' && !decimalPointFound) {
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    currentParsedPart._intPart = currentPart;
                    currentPart = [];
                    decimalPointFound = TRUE;
                    intPlaceHoldFound = FALSE;
                } else if (currentChar === numberFormatCultureInfo.percentSymbol) {
                    intPlaceHoldFound = FALSE;
                    currentParsedPart._percent++;
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    currentPart.push(currentChar);
                } else if (currentChar === numberFormatCultureInfo.perMilleSymbol) {
                    intPlaceHoldFound = FALSE;
                    currentParsedPart._permille++;
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    currentPart.push(currentChar);
                } else if (currentChar === numberFormatCultureInfo.percentGroupSeparator) {
                    if (!intPlaceHoldFound) {
                        stringBuffer += currentChar;
                    } else {
                        if (stringBuffer !== '') {
                            currentPart.push(stringBuffer);
                            stringBuffer = '';
                        }
                        var isScale = TRUE, stringQuote = '';
                        for (var j = i + 1; j < format.length; j++) { /* NOSONAR: NestedIfDepth */
                            var nextChar = format.charAt(j);
                            if (stringQuote !== '') {
                                if (nextChar === '"') {
                                    stringQuote = '';
                                }
                                continue;
                            }
                            if (nextChar === '"') {
                                stringQuote = nextChar;
                            } else if (_intPlaceholder.indexOf(nextChar) >= 0) {
                                isScale = FALSE;
                                break;
                            } else if (nextChar === numberFormatCultureInfo.numberDecimalSeparator || nextChar === ';') {
                                break;
                            }
                        }
                        if (isScale) {
                            currentParsedPart._scale++;
                        } else if (!decimalPointFound) {
                            nextChar = format.charAt(i + 1);
                            if (nextChar && (_intPlaceholder.indexOf(nextChar) >= 0)) {
                                groupSeparatorFound = TRUE;
                            }
                        }
                    }
                } else if (currentChar === 'E' || currentChar === 'e') {
                    intPlaceHoldFound = FALSE;
                    inScientific = TRUE;
                    if (stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    stringBuffer += currentChar;
                } else {
                    intPlaceHoldFound = FALSE;
                    if (_intPlaceholder.indexOf(previousChar) >= 0 && stringBuffer !== '') {
                        currentPart.push(stringBuffer);
                        stringBuffer = '';
                    }
                    stringBuffer += currentChar;
                }
                previousChar = currentChar;
            }

            if (stringBuffer !== '') {
                if (inScientific && !scientificFound) {
                    // parse strBuf to get current exp format
                    currentParsedPart._exponent = _parseExponentFormat(stringBuffer);
                }
                currentPart.push(stringBuffer);
            }
            if (groupSeparatorFound) {
                currentParsedPart._group = TRUE;
            }
            if (decimalPointFound) {
                currentParsedPart._decPart = currentPart;
            } else {
                currentParsedPart._intPart = currentPart;
            }
            return currentParsedPart;
        }

        function _insertGroupSeparator(numberArray, groupSizes, sep, shareFlags) {
            var curSize = groupSizes[0];
            var curGroupIndex = 1;
            var numberCount = 0;
            var needSep = FALSE;
            var originLength = numberArray.length;
            for (var i = 0; i < originLength; i++) {
                var type = numberArray[i].type;
                if (type === 'number') {
                    var result = '';
                    var numberString = numberArray[i].value;
                    var stringIndex = numberString.length - 1;
                    while (stringIndex >= 0) {
                        if (curSize < 1 || curSize > 9) {
                            throw new Error(sR().Exp_InvalidNumberGroupSize);
                        }
                        if (/\d/ig.test(numberString[stringIndex])) {
                            if (needSep) {
                                if (result) {
                                    numberArray.push({type: 'number', value: result});
                                }
                                numberArray.push({type: 'groupSeparator', value: sep});
                                result = '';
                                needSep = FALSE;
                            }
                            numberCount++;
                        } else {
                            numberCount = 0;
                        }
                        result = numberString[stringIndex] + result;
                        if (numberCount === curSize) {
                            needSep = TRUE;
                            numberCount = 0;
                            if (curGroupIndex < groupSizes.length) {
                                curSize = groupSizes[curGroupIndex];
                                curGroupIndex++;
                            }
                        }
                        stringIndex--;
                    }
                    if (result) {
                        numberArray.push({type: type, value: result});
                    }
                } else {
                    if (type === 'fillingChar') {
                        shareFlags.infillIndex = numberArray.length - originLength;
                    }
                    numberArray.push({type: type, value: numberArray[i].value});
                }
            }
            return numberArray.splice(0, originLength);
        }

        function _expandNumber(num, precision, groupSizes, sep, decimalChar, negativeSign) {
            var rounded = round10(num, -precision);
            if (!isFinite(rounded)) {
                rounded = num;
            }
            num = rounded;
            var numberString = num.toString();
            var right;
            var exponent;
            var split = numberString.split(/e/i);
            numberString = split[0];
            exponent = (split.length > 1 ? parseIntFn(split[1], 10) : 0);
            split = numberString.split('.');
            numberString = split[0];
            right = split.length > 1 ? split[1] : '';
            if (exponent > 0) {
                right = padZeroRight(right, exponent);
                numberString += right.slice(0, exponent);
                right = substr(right, exponent);
            } else if (exponent < 0) {
                exponent = -exponent;
                if (num < 0) {
                    numberString = negativeSign + padZeroLeft(numberString.replace(negativeSign, ''), exponent + 1);
                } else {
                    numberString = padZeroLeft(numberString, exponent + 1);
                }
                right = numberString.slice(-exponent, numberString.length) + right;
                numberString = numberString.slice(0, -exponent);
            }
            if (precision > 0) {
                if (right.length > precision) {
                    right = right.slice(0, precision);
                } else {
                    right = padZeroRight(right, precision);
                }
                right = decimalChar + right;
            } else {
                right = '';
            }
            return numberString + right;
        }

        function _processValueWithScale(value, percent, permille, scale) {
            var result = value;
            if (percent > 0) {
                result = value * (Math_pow(100, percent));
            }
            if (permille > 0) {
                result = value * (Math_pow(1000, permille));
            }
            if (scale > 0) {
                result = value / (Math_pow(1000, scale));
            }
            return result;
        }

        function _getPartFormatter(part) {
            var result = keyword_null;
            if (part) {
                result = '';
                for (var i = 0; i < part.length; i++) {
                    var partItem = part[i];
                    if (/^(0|#|\?)+/g.test(partItem)) {
                        result += partItem;
                    }
                }
            }
            return result;
        }

        function _processExponentValue(value, exponent, integerFormatter) {
            var result = {value: value, exponentValue: 0};
            var digitLength = _getIntegerAndDecimalLength(value, '.');
            var digitIntegerLength = digitLength._integer;
            var absoluteValue = Math_abs(value);
            var integerLength = (!integerFormatter) ? 1 : integerFormatter.length;
            if (absoluteValue >= 1) {
                if (digitIntegerLength > integerLength) {
                    digitIntegerLength -= integerLength;
                    result.value = value / Math_pow(10, digitIntegerLength);
                    result.exponentValue = digitIntegerLength;
                } else {
                    result.exponentValue = 0;
                }
                if (exponent._sign === -1) {
                    exponent._sign = 0;
                }
            } else if (absoluteValue < 1 && absoluteValue > 0) {
                exponent._sign = -1;
                var baseVal = Math_pow(10, integerLength);
                while (absoluteValue * 10 < baseVal) {
                    absoluteValue *= 10;
                    result.exponentValue++;
                }
                result.value *= Math_pow(10, result.exponentValue);
            }
            return result;
        }

        function _processIntegerPart(integerPart, numberIntPart, partIntegerFormatter, formatter, exponentValue, result, shareFlags, numberFormatCultureInfo) { /* NOSONAR: FunctionComplexity */
            var numberGroupSizes = numberFormatCultureInfo.numberGroupSizes,
                numberGroupSeparator = numberFormatCultureInfo.numberGroupSeparator,
                negativeSign = numberFormatCultureInfo.negativeSign,
                percent = numberFormatCultureInfo.percentSymbol,
                permille = numberFormatCultureInfo.perMilleSymbol;
            var exponent = formatter._exponent;
            var neg = substr(numberIntPart, 0, 1);
            if (neg === negativeSign) {
                numberIntPart = substr(numberIntPart, 1);
            }
            var numIntPartLength = numberIntPart.length === 1 && numberIntPart === '0' ? 0 : numberIntPart.length;
            numberIntPart = numIntPartLength === 0 ? '' : numberIntPart;

            var processedDigitLen = 0, processedIntPart = '';
            for (var i = integerPart.length - 1; i >= 0; i--) {
                var resultString = '';
                var integerPartItem = integerPart[i];
                if (/^(0|#|\?)+/g.test(integerPartItem)) {
                    if (processedIntPart !== partIntegerFormatter) {
                        var intPartLength = integerPartItem.length;
                        for (var intPartIndex = numIntPartLength - processedDigitLen - 1; intPartIndex >= 0 && intPartLength > 0; intPartIndex--) {
                            var nc = numberIntPart.charAt(intPartIndex);
                            resultString = nc + resultString;
                            intPartLength--;
                            processedDigitLen++;
                        }
                        for (var j = intPartLength - 1; j >= 0; j--) {
                            var formatChar = integerPartItem[j];
                            processedDigitLen++;
                            if (formatChar === '0') {
                                resultString = formatChar + resultString;
                            } else if (formatChar === '?') {
                                if (resultString !== '') {
                                    result.push({type: 'number', value: resultString});
                                    resultString = '';
                                }
                                result.push({type: 'numberPlaceholder', value: formatChar});
                            }
                        }
                        processedIntPart = integerPartItem + processedIntPart;
                        if (processedIntPart === partIntegerFormatter && processedDigitLen < numIntPartLength) {
                            resultString = numberIntPart.substr(0, numIntPartLength - processedDigitLen) + resultString;
                        }
                        if (resultString !== '') {
                            result.push({type: 'number', value: resultString});
                        }
                    }
                } else if (formatter._exponent && !shareFlags.replaceExponent && /^((E(\+|-)?|e(\+|-)?)\d+)/g.test(integerPartItem)) {
                    shareFlags.replaceExponent = TRUE;
                    var exponentStr = '';
                    exponentStr += exponent._symbol;
                    exponentStr += _signs[exponent._sign];
                    exponentStr += padZeroLeft(exponentValue.toString(), exponent._exp);
                    result.push({type: 'exponent', value: exponentStr});
                } else if (integerPartItem[0] === '_') {
                    result.push({type: 'placeholder', value: integerPartItem[1]});
                } else if (integerPartItem[0] === '*') {
                    // Only one fillingChar can take effect in one formatter
                    // int part process from back to front, So the first fillingChar will take effect
                    if (!shareFlags.hasInfilling) {
                        result.push({type: 'fillingChar', value: integerPartItem[1]});
                        shareFlags.hasInfilling = true;
                        shareFlags.infillIndex = result.length - 1;
                    }
                } else if (integerPartItem[0] === '\\') {
                    if (integerPartItem.length === 2) {
                        result.push({type: 'text', value: integerPartItem[1]});
                    }
                } else if (integerPartItem[0] === '"' && integerPartItem[integerPartItem.length - 1] === '"') {
                    if (integerPartItem.length > 2) {
                        result.push({type: 'text', value: integerPartItem.substr(1, integerPartItem.length - 2)});
                    }
                } else if (integerPartItem === percent) {
                    result.push({type: 'percent', value: integerPartItem});
                } else if (integerPartItem === permille) {
                    result.push({type: 'permille', value: integerPartItem});
                } else if (currencySymbolList[integerPartItem]) {
                    result.push({type: 'currency', value: integerPartItem});
                } else {
                    result.push({type: 'text', value: integerPartItem});
                }
            }
            // Fix bug 253427. The negative sign should not be added when there is no integer formatter.
            if (neg === negativeSign && partIntegerFormatter) {
                result.push({type: 'text', value: neg});
            }
            if (formatter._group === TRUE) {
                _insertGroupSeparator(result, numberGroupSizes, numberGroupSeparator, shareFlags);
            }
            result = result.reverse();
            shareFlags.infillIndex = result.length - 1 - shareFlags.infillIndex;
        }

        function _processDecimalPart(decimalPart, numbers, partDecimalFormatter, partIntegerFormatter, formatter, exponentValue, result, shareFlags, numberFormatCultureInfo) { /* NOSONAR: FunctionComplexity */
            var numberDecimalSeparator = numberFormatCultureInfo.numberDecimalSeparator;
            var percent = numberFormatCultureInfo.percentSymbol,
                permille = numberFormatCultureInfo.perMilleSymbol;
            var decimalSeparatorIndex = numbers.indexOf(numberDecimalSeparator);
            var exponent = formatter._exponent;
            if (decimalSeparatorIndex > 0 || partIntegerFormatter !== _generalNumberInt || partDecimalFormatter !== _generalNumberDec) {
                result.push({type: 'decimalSeparator', value: numberDecimalSeparator});
            }
            var numberDecPart = (decimalSeparatorIndex !== -1) ? numbers.substring(decimalSeparatorIndex + 1) : '';

            var processedDigitLen = 0, processedDecimalPart = '';
            for (var d = 0; d < decimalPart.length; d++) {
                var decimalPartItem = decimalPart[d];
                if (/^(0|#|\?)+/g.test(decimalPartItem)) {
                    var resultString = '';
                    if (processedDecimalPart !== partDecimalFormatter) {
                        var decPartLength = decimalPartItem.length;
                        var processedItemLength = 0;
                        for (var decPartIndex = processedDigitLen; decPartLength > 0 && numberDecPart.length - processedDigitLen > 0;) {
                            var nc = numberDecPart.charAt(decPartIndex);
                            resultString += nc;
                            decPartLength--;
                            processedDigitLen++;
                            processedItemLength++;
                            decPartIndex++;
                        }
                        for (var j = processedItemLength; decPartLength > 0;) {
                            var formatChar = decimalPartItem[j];
                            j++;
                            processedDigitLen++;
                            decPartLength--;
                            if (formatChar === '0') {
                                resultString += formatChar;
                            } else if (formatChar === '?') {
                                if (resultString !== '') {
                                    result.push({type: 'number', value: resultString});
                                    resultString = '';
                                }
                                result.push({type: 'numberPlaceholder', value: formatChar});
                            }
                        }
                        if (resultString !== '') {
                            result.push({type: 'number', value: resultString});
                        }
                        processedDecimalPart += decimalPartItem;
                    }
                } else if (exponent && !shareFlags.replaceExponent && /^((E(\+|-)?|e(\+|-)?)\d+)/g.test(decimalPartItem)) {
                    shareFlags.replaceExponent = TRUE;
                    var exponentStr = '';
                    exponentStr += exponent._symbol;
                    exponentStr += _signs[exponent._sign];
                    exponentStr += padZeroLeft(exponentValue.toString(), exponent._exp);
                    result.push({type: 'exponent', value: exponentStr});
                } else if (decimalPartItem[0] === '_') {
                    result.push({type: 'placeholder', value: decimalPartItem[1]});
                } else if (decimalPartItem[0] === '*') {
                    // Only one fillingChar can take effect in one formatter
                    // dec part process from front to back, So the last will take effect.
                    result.push({type: 'fillingChar', value: decimalPartItem[1]});
                    if (shareFlags.hasInfilling) {
                        result.splice(shareFlags.infillIndex, 1);
                    }
                    shareFlags.hasInfilling = true;
                    shareFlags.infillIndex = result.length - 1;
                } else if (decimalPartItem[0] === '\\') {
                    if (decimalPartItem.length === 2) {
                        result.push({type: 'text', value: decimalPartItem[1]});
                    }
                } else if (decimalPartItem[0] === '"' && decimalPartItem[decimalPartItem.length - 1] === '"') {
                    if (decimalPartItem.length > 2) {
                        result.push({type: 'text', value: decimalPartItem.substr(1, decimalPartItem.length - 2)});
                    }
                } else if (decimalPartItem === percent) {
                    result.push({type: 'percent', value: decimalPartItem});
                } else if (decimalPartItem === permille) {
                    result.push({type: 'permille', value: decimalPartItem});
                } else if (currencySymbolList[decimalPartItem]) {
                    result.push({type: 'currency', value: decimalPartItem});
                } else {
                    result.push({type: 'text', value: decimalPartItem});
                }
            }

        }

        function _removeLastZeroInDecimal(numbers, numberDecimalSeparator) {
            var num = numbers;
            var pointIndex = numbers.indexOf(numberDecimalSeparator);
            if (pointIndex !== -1) {
                num = numbers.replace(/0+$/, '');
            }
            return num;
        }

        function _formatNumber(value, formatter, numnerFormatInfo, isFraction) {
            // result : [{type: 'number', value: '123'}]
            var result = [];
            value = _processValueWithScale(value, formatter._percent, formatter._permille, formatter._scale);
            var integerPart = formatter._intPart, decimalPart = formatter._decPart;
            if (!integerPart && !decimalPart) {
                return result;
            }
            var partIntegerFormatter = _getPartFormatter(integerPart);
            var partDecimalFormatter = _getPartFormatter(decimalPart);
            if (!partDecimalFormatter) {
                partDecimalFormatter = '';
            }
            var exponentValue;
            if (formatter._exponent) {
                var processedExponent = _processExponentValue(value, formatter._exponent, partIntegerFormatter);
                value = processedExponent.value;
                exponentValue = processedExponent.exponentValue;
            }
            var digitLength = _getIntegerAndDecimalLength(value, '.');
            var numberGroupSizes = numnerFormatInfo.numberGroupSizes,
                numberGroupSeparator = numnerFormatInfo.numberGroupSeparator,
                numberDecimalSeparator = numnerFormatInfo.numberDecimalSeparator,
                negativeSign = numnerFormatInfo.negativeSign;
            var precision = Math_min(digitLength._decimal, partDecimalFormatter.length);
            var numbers = _expandNumber(value, precision, numberGroupSizes, numberGroupSeparator, numberDecimalSeparator, negativeSign);
            if (!isFraction) {
                numbers = _removeLastZeroInDecimal(numbers, numberDecimalSeparator);
            }
            if (numbers === '') {
                result.push({
                    type: 'text',
                    value: (integerPart ? integerPart.join('') : '') + (decimalPart ? decimalPart.join('') : '')
                });
                return result;
            }

            var shareFlags = {hasInfilling: FALSE, infillIndex: -1, replaceExponent: FALSE};
            var numberIntPart = numbers.split(numberDecimalSeparator)[0];
            if (integerPart) {
                _processIntegerPart(integerPart, numberIntPart, partIntegerFormatter, formatter, exponentValue, result, shareFlags, numnerFormatInfo);
            }
            // use for these cases:
            // value 12, format "A"."B", result: A12.B
            // value 0,  format "A"."B", result: A.B
            // value 12, format "A".,    result: A12.
            if (numberIntPart !== '0' && partIntegerFormatter === '' && decimalPart) {
                result.push({type: 'number', value: numberIntPart});
            }
            if (decimalPart) {
                _processDecimalPart(decimalPart, numbers, partDecimalFormatter, partIntegerFormatter, formatter, exponentValue, result, shareFlags, numnerFormatInfo);
            }
            return result;
        }

        function _parseNumber(value, cultureInfo) {
            value = (!isNullOrUndefined(value)) ? StringHelper._trimEnd(value, '') : '';
            if (value.match(/^[+-]?infinity$/i)) {
                return parseFloatFn(value);
            }
            if (value.match(/^0x[a-f0-9]+$/i)) {
                return parseIntFn(value, 10);
            }
            var numFormat = cultureInfo.NumberFormat;
            var numberNegativePattern = numFormat.numberNegativePattern;
            var signInfo = _parseNumberNegativePattern(value, numFormat, numberNegativePattern);
            var sign = signInfo[0];
            var num = signInfo[1];
            if ((sign === '') && (numberNegativePattern !== 1)) {
                signInfo = _parseNumberNegativePattern(value, numFormat, 1);
                sign = signInfo[0];
                num = signInfo[1];
            }
            if (sign === '') {
                sign = '+';
            }
            // trim currencySymbol
            if (num[0] === numFormat.currencySymbol) {
                num = substr(num, 1);
            }
            var exponent;
            var intAndFraction;
            var exponentPos = num.indexOf('e');
            if (exponentPos < 0) {
                exponentPos = num.indexOf('E');
            }
            if (exponentPos < 0) {
                intAndFraction = num;
                exponent = keyword_null;
            } else {
                intAndFraction = substr(num, 0, exponentPos);
                exponent = substr(num, exponentPos + 1);
            }
            var integer, fraction;
            var decimalPos = intAndFraction.indexOf('.');
            if (decimalPos < 0) {
                integer = intAndFraction;
                fraction = keyword_null;
            } else {
                integer = substr(intAndFraction, 0, decimalPos);
                fraction = substr(intAndFraction, decimalPos + '.'.length);
            }
            integer = integer.split(',').join('');
            var altNumGroupSeparator = ','.replace(/\u00A0/g, ' ');
            if (',' !== altNumGroupSeparator) {
                integer = integer.split(altNumGroupSeparator).join('');
            }
            var p = sign + integer;
            if (fraction !== keyword_null) {
                p += '.' + fraction;
            }
            // trim percentSymbol,then correct
            var lastChar = p[p.length - 1];
            if (lastChar === numFormat.percentSymbol) {
                p = substr(p, 0, p.length - 1);
                p = StringHelper._trimEnd(p, '');
                var ndp = p.indexOf('.');
                if (ndp === -1) {
                    ndp = p.length;
                }
                var resultBuilder = '';
                resultBuilder += substr(p, 0, ndp - 2);
                resultBuilder += '.';
                resultBuilder += substr(p, ndp - 2, 2);
                resultBuilder += substr(p, ndp + 1);
                p = resultBuilder;
            }
            if (exponent !== keyword_null) {
                var expSignInfo = _parseNumberNegativePattern(exponent, numFormat, 1);
                if (expSignInfo[0] === '') {
                    expSignInfo[0] = '+';
                }
                p += 'e' + expSignInfo[0] + expSignInfo[1];
            }
            if (p.match(/^[+-]?\d*\.?\d*(e[+-]?\d+)?$/)) {
                return parseFloatFn(p);
            }
            return NaN;
        }

        function _parseNumberNegativePattern(value, numFormat, numberNegativePattern) {
            var neg = numFormat.negativeSign;
            var pos = numFormat.positiveSign;
            var strHelper = StringHelper;

            if (numberNegativePattern === 4 || numberNegativePattern === 2) {
                neg = ' ' + neg;
                pos = ' ' + pos;
            }
            if (numberNegativePattern === 4 || numberNegativePattern === 3) {
                if (strHelper._endsWith(value, neg)) {
                    return ['-', substr(value, 0, value.length - neg.length)];
                } else if (strHelper._endsWith(value, pos)) {
                    return ['+', substr(value, 0, value.length - pos.length)];
                }
            } else if (numberNegativePattern === 2 || numberNegativePattern === 1) {
                if (strHelper._startsWith(value, neg)) {
                    return ['-', substr(value, neg.length)];
                } else if (strHelper._startsWith(value, pos)) {
                    return ['+', substr(value, pos.length)];
                }
            } else if (numberNegativePattern === 0) {
                if (strHelper._startsWith(value, '(') && strHelper._endsWith(value, ')')) {
                    return ['-', substr(value, 1, value.length - 2)];
                }
            } else {
                throw new Error('');
            }
            return ['', value];
        }

        function _toHexString(num, lowCase, precision) {
            if (Math_abs(Math_floor(num) - num) !== 0) {
                throw new Error(sR().Exp_BadFormatSpecifier);
            }
            var number = num >= 0 ? num.toString(16) : (_maxInt32 + num + 1).toString(16);
            number = lowCase ? number.toLowerCase() : number.toUpperCase();
            if (!isNullOrUndefined(precision) && number.length < precision) {
                return padZeroLeft(number, precision);
            }
            return number;
        }

        // Copy from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
        function round10(value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === keyword_undefined || +exp === 0) {
                return Math.round(value);
            }
            value = +value;
            exp = +exp;
            // If the value is not a number or the exp is not an _integer...
            if (isNaN(value) || !(exp % 1 === 0)) {
                return NaN;
            }
            //For excel, the round logic is round the number to the infinity or positive infinity
            //such 1.55->1.6, but -1.55->-1.6
            //But in javascript, the Math.round will round the number to the nearest integer.
            //so, 1.55->1.6, but -1.55->1.5
            //Fix bug FB 243822, change the negative number to positive number, then shift back.
            var isNegative = value < 0;
            value = isNegative ? -value : value;
            // Shift
            value = value.toString().split('e');
            value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = isNegative ? -value : value;
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        var DOT_REPLACE_SYMBOL = '#dot#';
        var GROUP_REPLACE_SYMBOL = '#group#';

        function getNumberFormat(cultureName) {
            var numberFormat = cM._getCultureInfo().NumberFormat;
            if (typeof cultureName === 'string') {
                numberFormat = cM._getCultureInfo(cultureName).NumberFormat;
            }
            return numberFormat;
        }

        function _formatObjectToSrting(formatObject) {
            var resultString = '';
            if (Array.isArray(formatObject) && formatObject.length > 0) {
                for (var i = 0; i < formatObject.length; i++) {
                    var valueType = formatObject[i].type;
                    var value = formatObject[i].value;
                    if (valueType === 'placeholder') {
                        resultString += ' ';
                    } else if (valueType === 'fillingChar') {
                        continue;
                    } else if (valueType === 'numberPlaceholder') {
                        resultString += ' ';
                    } else {
                        resultString += value;
                    }

                }
            }
            return resultString;
        }

        function _fixNumber(value, num) {
            if (typeof value === 'number' && value.toString().length >= num) {
                value = (value < 1 && value > -1) ?
                    +value.toFixed(num) :
                    +value.toPrecision(num);
            }
            return value;
        }

        return {
            _parseLocale: function (value) {
                return _parseNumber(value, cM._getCultureInfo());
            },
            _parseInvariant: function (value) {
                return _parseNumber(value, cM._getCultureInfo('invariant'));
            },
            _customCultureFormat: function (num, format, cultureInfo, isFraction) {
                if (!cultureInfo) {
                    cultureInfo = cM._getCultureInfo();
                }
                return _toFormattedString(num, format, cultureInfo, isFraction);
            },
            _replaceNormalToCultureSymbol: function (value, cultureName) {
                if (typeof value !== 'string') {
                    return value;
                }
                var numberFormat = getNumberFormat(cultureName);
                var decimalSeparator = numberFormat.numberDecimalSeparator;
                var groupSeparator = numberFormat.numberGroupSeparator;

                if (decimalSeparator !== '.') {
                    value = value.replace(_getReg('[.]'), DOT_REPLACE_SYMBOL);
                }
                if (groupSeparator !== ',') {
                    value = value.replace(_getReg('[,]'), GROUP_REPLACE_SYMBOL);
                }
                if (decimalSeparator !== '.') {
                    value = value.replace(_getReg(DOT_REPLACE_SYMBOL), decimalSeparator);
                }
                if (groupSeparator !== ',') {
                    value = value.replace(_getReg(GROUP_REPLACE_SYMBOL), groupSeparator);
                }
                return value;
            },
            _replaceCultureSymbolToNormal: function (value, cultureName) {
                if (typeof value !== 'string') {
                    return value;
                }
                var numberFormat = getNumberFormat(cultureName);
                var decimalSeparator = numberFormat.numberDecimalSeparator;
                var groupSeparator = numberFormat.numberGroupSeparator;
                if (decimalSeparator !== '.') {
                    value = value.replace(_getReg('[' + decimalSeparator + ']'), DOT_REPLACE_SYMBOL);
                }
                if (groupSeparator !== ',') {
                    value = value.replace(_getReg('[' + groupSeparator + ']'), GROUP_REPLACE_SYMBOL);
                }
                if (decimalSeparator !== '.') {
                    value = value.replace(_getReg(DOT_REPLACE_SYMBOL), '.');
                }
                if (groupSeparator !== ',') {
                    value = value.replace(_getReg(GROUP_REPLACE_SYMBOL), ',');
                }
                return value;
            },
            _isValidCultureNumberString: function (value, cultureName) {
                //In some culture, the decimal separator is not '.', and the groupSeparator is not ','
                //such as in "fr", decimalPoint is ',', and groupSep is ' '. if customer provide "123.456", actually it is a invalid number string.
                //Our internal logic could not separate this part, this method write some special condition to handle such case.
                //If we have more suitable way to judge this, this part could be remove in future.
                if (typeof value === 'string') {
                    var numberFormat = getNumberFormat(cultureName);
                    var decimalSeparator = numberFormat.numberDecimalSeparator;
                    var groupSeparator = numberFormat.numberGroupSeparator;
                    if ((decimalSeparator !== '.' && groupSeparator !== '.' && value.indexOf('.') >= 0)
                        || (decimalSeparator !== ',' && groupSeparator !== ',' && value.indexOf(',') >= 0)) {
                        return false;
                    }
                }
                return true;
            },
            _parseFloat: function (number, cultureName) {
                return parseFloatFn(this._replaceCultureSymbolToNormal(number, cultureName));
            },
            _toHexString: _toHexString,
            _parseCustomNumberFormatter: _parseCustomNumberFormatter,
            _formatNumber: _formatNumber,
            _formatObjectToSrting: _formatObjectToSrting,
            _generalNumberInt: _generalNumberInt,
            _generalNumberDec: _generalNumberDec,
            _fixNumber: _fixNumber
        };
    })();


    function _getReg(regStr) {
        return RegexHelper._getReg(regStr);
    }

    module.exports = NumberHelper;

}());