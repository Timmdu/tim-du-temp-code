(function () {
    'use strict';

    var Common = require('./common.js');
    var StringHelper = require('./stringhelper.js');
    var ArrayHelper = require('./arrayhelper.js');
    var cM = require('../culture/cultureInfo.js').CultureManager;
    var isNullOrUndefined = require('./types')._isNullOrUndefined;
    var padZeroLeft = StringHelper._padZeroLeft;
    var keyword_null = null, parseIntFn = parseInt, FALSE = false, TRUE = true, Math_floor = Math.floor,
        Math_abs = Math.abs;

    var sR = function () {
        return Common._getResource(Common.SR)();
    };

    var dateCache = {};
    var DateTimeHelper = (function () {
        function parseDate(value, cultureInfo, args) {
            var i, l, date, format, formats, custom = FALSE;
            formats = args;
            formats.slice(1).forEach(function (f) {
                if (f) {
                    custom = true;
                }
            });
            if (!custom) {
                formats = formats.concat(cultureInfo._getDateTimePattern());
            }
            for (i = 1, l = formats.length; i < l; i++) {
                format = formats[i];
                if (format) {
                    custom = TRUE;
                    date = parseDateExact(value, format, cultureInfo);
                    if (date) {
                        return date;
                    }
                }
            }
            return keyword_null;
        }

        function toFormattedString(date, format, cultureInfo) {
            var dtf = cultureInfo.DateTimeFormat, convert = dtf.Calendar.convert;
            if (!format || !format.length) {
                if (cultureInfo && cultureInfo.name.length) {
                    if (convert) {
                        return toFormattedString(date, dtf.fullDateTimePattern, cultureInfo);
                    }
                    return date.toLocaleString();
                }
                return date.toString();
            }
            var eras = dtf.eras, sortable = (format === 's');
            var ret = '';
            var hour;
            var foundDay, checkedDay, dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g;

            function hasDay() {
                if (foundDay || checkedDay) {
                    return foundDay;
                }
                foundDay = dayPartRegExp.test(format);
                checkedDay = TRUE;
                return foundDay;
            }

            var quoteCount = 0, tokenRegExp = getTokenRegExp(), converted;
            if (!sortable && convert) {
                converted = convert.fromGregorian(date);
            }
            function getPart(dateObj, part) {
                if (converted) {
                    return converted[part];
                }
                switch (part) {
                    case 0:
                        return dateObj.getFullYear();
                    case 1:
                        return dateObj.getMonth();
                    case 2:
                        return dateObj.getDate();
                    default:
                        return;
                }
            }
            var eraIndex = -2;
            var eraYearIndex = -2;
            var stringValue = {_value: ''};
            for (var tokenIndex = 0; ; tokenIndex++) { /* NOSONAR: TooManyBreakOrContinueInLoop */
                var index = tokenRegExp.lastIndex;
                var ar = tokenRegExp.exec(format);
                var preMatch = format.slice(index, ar ? ar.index : format.length);
                stringValue._value = '';
                quoteCount += appendPreOrPostMatch(preMatch, stringValue);
                ret += stringValue._value;
                if (!ar) {
                    break;
                }
                if ((quoteCount % 2) === 1) {
                    ret += (ar[0]);
                    continue;
                }
                var fullYear = date.getFullYear(),
                    day = date.getDay(),
                    hours = date.getHours(),
                    minutes = date.getMinutes(),
                    seconds = date.getSeconds(),
                    milliseconds = date.getMilliseconds(),
                    timezoneOffset = date.getTimezoneOffset();
                switch (ar[0]) {
                    case 'dddd':
                        ret += (dtf.dayNames[day]);
                        break;
                    case 'ddd':
                        ret += (dtf.abbreviatedDayNames[day]);
                        break;
                    case 'dd':
                        foundDay = TRUE;
                        ret += (padZeroLeft(getPart(date, 2), 2));
                        break;
                    case 'd':
                        foundDay = TRUE;
                        ret += (getPart(date, 2));
                        break;
                    case 'MMMM':
                        ret += ((dtf.monthGenitiveNames && hasDay()) ? dtf.monthGenitiveNames[getPart(date, 1)] : dtf.monthNames[getPart(date, 1)]);
                        break;
                    case 'MMM':
                        ret += ((dtf.abbreviatedMonthGenitiveNames && hasDay()) ? dtf.abbreviatedMonthGenitiveNames[getPart(date, 1)] : dtf.abbreviatedMonthNames[getPart(date, 1)]);
                        break;
                    case 'MM':
                        ret += padZeroLeft(getPart(date, 1) + 1, 2);
                        break;
                    case 'M':
                        ret += (getPart(date, 1) + 1);
                        break;
                    case 'yyyy':
                    case 'yyy':
                        // If era had been setted, same as "ee".
                        if (eraIndex >= 0) {
                            ret += eras._formatEraPart('ee', date);
                        } else {
                            ret += padZeroLeft((converted ? converted[0] : fullYear), 4);
                        }
                        break;
                    case 'yy':
                        // If era had been setted, same as "ee".
                        if (eraIndex >= 0) {
                            ret += eras._formatEraPart('ee', date);
                        } else {
                            ret += padZeroLeft((converted ? converted[0] : fullYear) % 100, 2);
                        }
                        break;
                    case 'y':
                        // If era had been setted, same as "e".
                        if (eraIndex >= 0) {
                            ret += eras._formatEraPart('e', date);
                        } else {
                            ret += (((converted ? converted[0] : fullYear) % 100).toString());
                        }
                        break;
                    case 'hh':
                        hour = hours % 12;
                        if (hour === 0) {
                            hour = 12;
                        }
                        ret += (padZeroLeft(hour, 2));
                        break;
                    case 'h':
                        hour = hours % 12;
                        if (hour === 0) {
                            hour = 12;
                        }
                        ret += (hour);
                        break;
                    case 'HH':
                        ret += padZeroLeft(hours, 2);
                        break;
                    case 'H':
                        ret += (hours.toString());
                        break;
                    case 'mm':
                        ret += padZeroLeft(minutes, 2);
                        break;
                    case 'm':
                        ret += (minutes.toString());
                        break;
                    case 'ss':
                        ret += padZeroLeft(seconds, 2);
                        break;
                    case 's':
                        ret += (seconds.toString());
                        break;
                    case 'tt':
                        ret += ((hours < 12) ? dtf.amDesignator : dtf.pmDesignator);
                        break;
                    case 't':
                        ret += (((hours < 12) ? dtf.amDesignator : dtf.pmDesignator).charAt(0));
                        break;
                    case 'f':
                    case '0':
                        ret += (padZeroLeft(milliseconds, 3).charAt(0));
                        break;
                    case 'ff':
                    case '00':
                        ret += (padZeroLeft(milliseconds, 3).substr(0, 2));
                        break;
                    case 'fff':
                    case '000':
                        ret += (padZeroLeft(milliseconds, 3));
                        break;
                    case 'z':
                        hour = timezoneOffset / 60;
                        ret += (((hour <= 0) ? '+' : '-') + Math_floor(Math_abs(hour)));
                        break;
                    case 'zz':
                        hour = timezoneOffset / 60;
                        ret += (((hour <= 0) ? '+' : '-') + padZeroLeft(Math_floor(Math_abs(hour)), 2));
                        break;
                    case 'zzz':
                        hour = timezoneOffset / 60;
                        ret += (((hour <= 0) ? '+' : '-') + padZeroLeft(Math_floor(Math_abs(hour)), 2) + ':' + padZeroLeft(Math_abs(timezoneOffset % 60), 2));
                        break;
                    case 'g':
                    case 'gg':
                    case 'ggg':
                        // other culture, do nothing.
                        if (!eras) {
                            break;
                        }
                        if (eraIndex === tokenIndex - 1) {
                            eraIndex = tokenIndex;
                            break;
                        } else {
                            ret += eras._formatEraPart(ar[0], date);
                            eraIndex = tokenIndex;
                        }
                        break;
                    case 'e':
                    case 'ee':
                        // other culture
                        if (!eras) {
                            ret += padZeroLeft((converted ? converted[0] : fullYear), 4);
                            break;
                        } else if (eraYearIndex === tokenIndex - 1) {
                            eraYearIndex = tokenIndex;
                            break;
                        } else {
                            ret += eras._formatEraPart(ar[0], date);
                            eraYearIndex = tokenIndex;
                        }
                        break;
                    case '/':
                        ret += (dtf.dateSeparator);
                        break;
                    case '[h]':
                    case '[hh]':
                    case '[H]':
                    case '[HH]':
                    case '[mm]':
                    case '[ss]':
                        ret += ar[0];
                        break;
                    default:
                        throw new Error(sR().Exp_InvalidDateFormat);
                }
            }
            return ret.toString();
        }

        function appendPreOrPostMatch(preMatch, strBuilder) {
            var quoteCount = 0;
            var escaped = FALSE;
            for (var i = 0, il = preMatch.length; i < il; i++) {
                var c = preMatch.charAt(i);
                switch (c) {
                    // case '\'': // fix bug 205580, ' is a normal character in formatter. the case: "It's" dddd
                    case '\"':
                        if (escaped) {
                            strBuilder._value += '\'';
                        } else {
                            quoteCount++;
                        }
                        escaped = FALSE;
                        break;
                    case '\\':
                        if (escaped) {
                            strBuilder._value += '\\';
                        }
                        escaped = !escaped;
                        break;
                    default:
                        strBuilder._value += c;
                        escaped = FALSE;
                        break;
                }
            }
            return quoteCount;
        }

        function expandYear(cultureInfo, year) {
            var now = new Date();
            var eras = cultureInfo.DateTimeFormat.eras;
            if (eras && year < 100) {
                var curr = eras._getEraDate(now)._eraYear;
                year += curr - (curr % 100);
                if (year > cultureInfo.DateTimeFormat.Calendar.TwoDigitYearMax) {
                    year -= 100;
                }
            }
            return year;
        }

        function getTokenRegExp() {
            return /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|000|00|0|zzz|zz|z|ggg|gg|g|ee|e|\[H\]|\[HH\]|\[h\]|\[hh\]|\[mm\]|\[ss\]/g;
        }

        function getParseRegExp(dtf, format) {
            if (!dtf._parseRegExp) {
                dtf._parseRegExp = {};
            } else if (dtf._parseRegExp[format]) {
                return dtf._parseRegExp[format];
            }
            var expFormat = format;
            // Cylj fix the bug 41571 at 2013/10/21.
            // The validDateTimeFormatString will replace the "m" to "%M",
            // So remove the "%" here.
            expFormat = expFormat.replace('%M', 'M');
            expFormat = expFormat.replace(/([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, '\\\\$1');
            var regexp = '^';
            var stringValue = {_value: ''};
            var groups = [];
            var index = 0;
            var quoteCount = 0;
            var tokenRegExp = getTokenRegExp();
            var match;
            while ((match = tokenRegExp.exec(expFormat)) !== keyword_null) {
                stringValue._value = '';
                var preMatch = expFormat.slice(index, match.index);
                index = tokenRegExp.lastIndex;
                quoteCount += appendPreOrPostMatch(preMatch, stringValue);
                regexp += stringValue._value;
                if ((quoteCount % 2) === 1) {
                    regexp += match[0];
                    continue;
                }
                switch (match[0]) {
                    case 'dddd':
                    case 'ddd':
                    case 'MMMM':
                    case 'MMM':
                    case 'gggg':
                    case 'ggg':
                    case 'gg':
                    case 'g':
                        regexp += '(\\D+)';
                        break;
                    case 'tt':
                    case 't':
                        regexp += '(\\D*)';
                        break;
                    case 'dd':
                    case 'd':
                    case 'MM':
                    case 'M':
                    case 'yy':
                    case 'y':
                    case 'eee':
                    case 'ee':
                    case 'e':
                    case 'HH':
                    case 'H':
                    case 'hh':
                    case 'h':
                    case 'mm':
                    case 'm':
                    case 'ss':
                    case 's':
                        regexp += '(\\d\\d?)';
                        break;
                    case 'yyy':
                    case 'yyyy':
                        regexp += '(\\d{2}|\\d{4})';
                        break;
                    case 'fff':
                    case '000':
                        regexp += '(\\d{3})';
                        break;
                    case 'ff':
                    case '00':
                        regexp += '(\\d{2})';
                        break;
                    case 'f':
                    case '0':
                        regexp += '(\\d)';
                        break;
                    case 'zzz':
                        regexp += '([+-]?\\d\\d?:\\d{2})';
                        break;
                    case 'zz':
                    case 'z':
                        regexp += '([+-]?\\d\\d?)';
                        break;
                    case '/':
                        regexp += '(\\' + dtf.dateSeparator + ')';
                        break;
                    default:
                        throw new Error(sR().Exp_InvalidDateFormat);
                }
                ArrayHelper._add(groups, match[0]);
            }
            stringValue._value = '';
            appendPreOrPostMatch(expFormat.slice(index), stringValue);
            regexp += stringValue._value;
            regexp += '$';
            var regexpStr = regexp.toString().replace(/\s+/g, '\\s+');
            var parseRegExp = {'_regExp': regexpStr, '_groups': groups, '_exp': new RegExp(regexpStr)};
            dtf._parseRegExp[format] = parseRegExp;
            return parseRegExp;
        }

        function parseDateExact(value, format, cultureInfo) {
            value = value.trim();
            var dtf = cultureInfo.DateTimeFormat, parseInfo = getParseRegExp(dtf, format),
                match = parseInfo._exp.exec(value);
            if (match === keyword_null) {
                return keyword_null;
            }
            var groups = parseInfo._groups, era = keyword_null, year = keyword_null, month = keyword_null,
                date = keyword_null,
                weekDay = keyword_null, hour = 0, hourOffset, min = 0, sec = 0, msec = 0, tzMinOffset = keyword_null,
                pmHour = FALSE;
            for (var j = 0, jl = groups.length; j < jl; j++) {
                var matchGroup = match[j + 1];
                if (matchGroup) {
                    switch (groups[j]) {
                        case 'dd':
                        case 'd':
                            date = parseIntFn(matchGroup, 10);
                            if ((date < 1) || (date > 31)) {
                                return keyword_null;
                            }
                            break;
                        case 'MMMM':
                            month = cultureInfo._getMonthIndex(matchGroup);
                            if ((month < 0) || (month > 11)) {
                                return keyword_null;
                            }
                            break;
                        case 'MMM':
                            month = cultureInfo._getAbbrMonthIndex(matchGroup);
                            if ((month < 0) || (month > 11)) {
                                return keyword_null;
                            }
                            break;
                        case 'M':
                        case 'MM':
                        case '%M':
                            month = parseIntFn(matchGroup, 10) - 1;
                            if ((month < 0) || (month > 11)) {
                                return keyword_null;
                            }
                            break;
                        case 'e':
                        case 'ee':
                            year = expandYear(cultureInfo, parseIntFn(matchGroup, 10));
                            if ((year < 0) || (year > 9999)) {
                                return keyword_null;
                            }
                            break;
                        case 'y':
                        case 'yy':
                        case 'yyy':
                        case 'yyyy':
                            year = parseIntFn(matchGroup, 10);
                            if ((year < 0) || (year > 9999)) {
                                return keyword_null;
                            }
                            break;
                        case 'h':
                        case 'hh':
                        case 'H':
                        case 'HH':
                            hour = parseIntFn(matchGroup, 10);
                            // fix bug #129049 that time format of "[h]" for elapsed time does not seem to recognize time value "24:30"
                            // if ((hour < 0) || (hour > 23))
                            if (hour < 0) {
                                return keyword_null;
                            }
                            break;
                        case 'm':
                        case 'mm':
                            min = parseIntFn(matchGroup, 10);
                            if ((min < 0) || (min > 59)) {
                                return keyword_null;
                            }
                            break;
                        case 's':
                        case 'ss':
                            sec = parseIntFn(matchGroup, 10);
                            if ((sec < 0) || (sec > 59)) {
                                return keyword_null;
                            }
                            break;
                        case 'tt':
                        case 't':
                            var upperToken = matchGroup.toUpperCase();
                            pmHour = (upperToken === dtf.pmDesignator.toUpperCase());
                            if (!pmHour && (upperToken !== dtf.amDesignator.toUpperCase())) {
                                return keyword_null;
                            }
                            break;
                        case 'f':
                        case '0':
                            msec = parseIntFn(matchGroup, 10) * 100;
                            if ((msec < 0) || (msec > 999)) {
                                return keyword_null;
                            }
                            break;
                        case 'ff':
                        case '00':
                            msec = parseIntFn(matchGroup, 10) * 10;
                            if ((msec < 0) || (msec > 999)) {
                                return keyword_null;
                            }
                            break;
                        case 'fff':
                        case '000':
                            msec = parseIntFn(matchGroup, 10);
                            if ((msec < 0) || (msec > 999)) {
                                return keyword_null;
                            }
                            break;
                        case 'dddd':
                            weekDay = cultureInfo._getDayIndex(matchGroup);
                            if ((weekDay < 0) || (weekDay > 6)) {
                                return keyword_null;
                            }
                            break;
                        case 'ddd':
                            weekDay = cultureInfo._getAbbrDayIndex(matchGroup);
                            if ((weekDay < 0) || (weekDay > 6)) {
                                return keyword_null;
                            }
                            break;
                        case 'zzz':
                            var offsets = matchGroup.split(/:/);
                            if (offsets.length !== 2) {
                                return keyword_null;
                            }
                            hourOffset = parseIntFn(offsets[0], 10);
                            if ((hourOffset < -12) || (hourOffset > 13)) {
                                return keyword_null;
                            }
                            var minOffset = parseIntFn(offsets[1], 10);
                            if ((minOffset < 0) || (minOffset > 59)) {
                                return keyword_null;
                            }
                            tzMinOffset = (hourOffset * 60) + (StringHelper._startsWith(matchGroup, '-') ? -minOffset : minOffset);
                            break;
                        case 'z':
                        case 'zz':
                            hourOffset = parseIntFn(matchGroup, 10);
                            if ((hourOffset < -12) || (hourOffset > 13)) {
                                return keyword_null;
                            }
                            tzMinOffset = hourOffset * 60;
                            break;
                        case 'g':
                        case 'gg':
                        case 'ggg':
                            var eraName = matchGroup;
                            if (!eraName || !dtf.eras) {
                                return keyword_null;
                            }
                            era = dtf.eras._parseEraPart(groups[j], eraName);
                            if (era < 0) {
                                return keyword_null;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
            // 1899/12/30 is the start date of OADate
            var timeOnly = /^(\d|\d\d):/.test(value); // The string that starts with 1 digit or 2 digit and follows colon is regarded as time.
            var result = timeOnly ? new Date(1899, 11, 30) : new Date(), defaults, convert = dtf.Calendar.convert; // If input value only contains time, use 1899/12/30, otherwise, use current date.
            if (convert) {
                defaults = convert.fromGregorian(result);
            }
            if (!convert) {
                defaults = [result.getFullYear(), result.getMonth(), result.getDate()];
            }
            if (year === keyword_null) {
                year = defaults[0];
            } else if (year < 100) {
                if (dtf.eras && era !== keyword_null) {
                    year = dtf.eras._getYearFromEra(era || 0, year);
                } else if (year >= 30) {
                    year += 1900;
                } else {
                    year += 2000;
                }
            }
            if (month === keyword_null) {
                month = defaults[1];
            }
            if (date === keyword_null) {
                date = defaults[2];
            }
            if (convert) {
                result = convert.toGregorian(year, month, date);
                if (result === keyword_null) {
                    return keyword_null;
                }
            } else {
                result.setFullYear(year, month, date);
                if (result.getDate() !== date) {
                    return keyword_null;
                }
                if ((weekDay !== keyword_null) && (result.getDay() !== weekDay)) {
                    return keyword_null;
                }
            }
            if (pmHour && (hour < 12)) {
                hour += 12;
            }
            result.setHours(hour, min, sec, msec);
            if (tzMinOffset !== keyword_null) {
                var adjustedMin = result.getMinutes() - (tzMinOffset + result.getTimezoneOffset());
                result.setHours(result.getHours() + adjustedMin / 60, adjustedMin % 60);
            }
            // TODO: extends _classNames to Date.
            // result._classNames = [isTimeSpan ? "TimeSpan" : "DateTime"];
            return result;
        }

        return {
            _customCultureFormat: function (date, format, cultureInfo) {
                if (!cultureInfo) {
                    cultureInfo = cM._getCultureInfo();
                }
                return toFormattedString(date, format, cultureInfo);
            },
            _localeFormat: function (date, format, cultureInfo) {
                return toFormattedString(date, format, cultureInfo || cM._getCultureInfo());
            },
            _parseLocale: function (value, formats, cultureInfo) {
                var args, result;
                if (!formats && !cultureInfo) {
                    result = dateCache[value];
                    if (result !== undefined) {
                        return result ? new Date(result) : result;
                    }
                }
                if (formats) {
                    args = [value, formats];
                } else {
                    args = [value];
                }
                result = parseDate(value, cultureInfo || cM._getCultureInfo(), args);
                if (!formats && !cultureInfo) {
                    dateCache[value] = result;
                }
                return result ? new Date(result) : result;
            },
            _parseInvariant: function (value, formats) {
                return parseDate(value, cM._getCultureInfo('invariant'), [value, formats]);
            },
            _parseExact: parseDateExact,
            _fromOADate: function (oadate) {
                //The 1970/1/1 is the start time of javascript Date system. new Date(0);
                //The 1899/12/30 is the start time of OADate system.
                //25569 is the day between 1899/12/30~1970/1/1
                //86400000 = 1*24*60*60 (1 day * 24 hours * 60 mins * 60secs *1000 milliseconds.
                var offsetDay = oadate - 25569;
                var date = new Date(offsetDay * 86400000);
                // multiply 86400000 first then do divide. it will cause some float precision error if the order is not.
                // 2014/10/17 ben.yin here is a "+1" or "-1", is for javascript divide low precision, it will loss last digit precision.So here add 1, for loss, for result right.
                // add 1 when after 1970, sub 1 when before 1970
                var adjustValue = offsetDay >= 0 ? 1 : -1;
                var oldDateTimezoneOffset = date.getTimezoneOffset();
                var ms = (oadate * 86400000 * 1440 + adjustValue - 25569 * 86400000 * 1440 + oldDateTimezoneOffset * 86400000) / 1440;
                var firstResult = new Date(ms);
                // here the code below is for Daylight Saving Time.
                // if the timezone of next hour after the result is different from result, means the result need to be fixed.
                var fixHourSign = oldDateTimezoneOffset >= 0 ? 1 : -1; // this is for east and west time zone
                var nextHour = new Date(ms + fixHourSign * 3600000);
                var nextHourTimezoneOffset = nextHour.getTimezoneOffset();
                if (oldDateTimezoneOffset !== nextHourTimezoneOffset) {
                    var newResult = new Date(ms + (nextHourTimezoneOffset - oldDateTimezoneOffset) * 60 * 1000);
                    if (oldDateTimezoneOffset > nextHourTimezoneOffset) {
                        // here is Standard Time to Daylight Saving Time
                        // the time 0:00,1:00,2:00,3:00 => 0:00,1:00,3:00,4:00
                        // fix time from 3:00,4:00. don't fix 2:00~2:59, and this hour is not exist.
                        if (fixHourSign === -1 || nextHourTimezoneOffset === firstResult.getTimezoneOffset()) {
                            newResult = newResult.getMilliseconds() === 999 ? new Date(newResult.valueOf() + 1) : newResult;
                            return newResult;
                        }
                    } else if (oldDateTimezoneOffset < nextHourTimezoneOffset) { /* NOSONAR: CollapsibleIfStatements */
                        // here is Daylight Saving Time to Standard Time
                        // here drop the 1:00~1:59 in Daylight Saving Time
                        // the result time is in new time zone.
                        if (fixHourSign === 1 || nextHourTimezoneOffset === firstResult.getTimezoneOffset()) {
                            newResult = newResult.getMilliseconds() === 999 ? new Date(newResult.valueOf() + 1) : newResult;
                            return newResult;
                        }
                    }
                }
                // For some oadate value, such as 42899.5833333333,actually the float precision is not enough, should be 42899.583333333333...333
                // This precision caused the Date also have precision error in milliseconds, hence, here specially judge the value if the milliseconds is 999
                // add 1 to get the correct value.
                firstResult = firstResult.getMilliseconds() === 999 ? new Date(firstResult.valueOf() + 1) : firstResult;
                return firstResult;
            },
            _fromOADateString: function (oadateString) {
                if (oadateString.substr(0, 8) === '/OADate(') {
                    var oadate = parseFloat(oadateString.substr(8, oadateString.length - 10));// 10 for '/OADate(' length and ')/' length
                    return this._fromOADate(oadate);
                }
            },
            _toOADateString: function (date) {
                return '/OADate(' + this._toOADate(date) + ')/';
            },
            _toOADate: function (date) {
                if (isNullOrUndefined(date)) {
                    return 0;
                }
                if (typeof date === 'number') {
                    date = new Date(date);
                }
                // return (date.getTime() / 86400000) + 25569 - date.getTimezoneOffset() / 1440;
                // multiply 86400000 and 1440 first then do divide. it will cause some float precision error if the order is not.
                return (date.getTime() * 1440 + 25569 * 86400000 * 1440 - date.getTimezoneOffset() * 86400000) / (86400000 * 1440);
            },
            _DT: function (value) {
                var dateValue = keyword_null;
                var sucess = TRUE;
                if (isNullOrUndefined(value)) {
                    dateValue = this._fromOADate(0);
                } else if (value instanceof Date) {
                    dateValue = new Date(value);
                } else if (typeof value === 'string') {
                    var dateTime = this._parseLocale(value);
                    if (!dateTime) {
                        if (!isNaN(value)) {
                            dateTime = DateTimeHelper._fromOADate(parseFloat(value));
                            if (!dateTime) {
                                sucess = FALSE;
                            }
                        } else {
                            dateTime = new Date(value); // use browser parser ability to parse the date such as "APRIL 10, 2012"
                            if (isNaN(dateTime.valueOf())) {
                                sucess = FALSE;
                            }
                            var reg = /^[-+=\s]*(\d+)\W+(\d+)\W+(\d+)$/;
                            var results = reg.exec(value.replace(/ |\n/g, '').trim());
                            if (results && results.length === 4) { /* NOSONAR: CollapsibleIfStatements */
                                if (results.indexOf(dateTime.getFullYear().toString()) === -1 ||
                                    results.indexOf((dateTime.getMonth() + 1).toString()) === -1 ||
                                    results.indexOf(dateTime.getDate().toString()) === -1) {
                                    sucess = FALSE;
                                }
                            }
                        }
                    }
                    dateValue = dateTime;
                } else if (typeof value === 'number') {
                    dateValue = this._fromOADate(value);
                } else {
                    sucess = FALSE;
                }
                if (sucess) {
                    return dateValue;
                }
                throw sR().Exp_InvalidCast;
            },
            _isDate: function (value) {
                // if the Date is cross iframe, "value.constructor === Date" returns false, so use getUTCDate and setFullYear to determ a Date for performance.
                return value && (value.constructor === Date || value.getUTCDate && value.setFullYear);
            }
        };
    })();

    module.exports = DateTimeHelper;

}());