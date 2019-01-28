(function () {
    'use strict';

    var types = require('../util/types.js');
    var keyword_undefined = void 0, keyword_null = null;
    var inherit = types._inherit, each = types._each;
    var WINDOW = window;
    var datePattern1 = [
        'MM/dd/yyyy',
        'MM/d/yyyy',
        'M/dd/yyyy',
        'M/d/yyyy',
        'yy/MM/dd',
        'yy/MM/d',
        'yy/M/dd',
        'yy/M/d',
        'yyyy/MM/dd',
        'yyyy/MM/d',
        'yyyy/M/dd',
        'yyyy/M/d'
    ], timePattern1 = [
        'hh:mm:ss',
        'hh:mm:s',
        'hh:m:ss',
        'hh:m:s',
        'h:mm:ss',
        'h:mm:s',
        'h:m:ss',
        'h:m:s',
        'hh:mm:ss tt',
        'hh:mm:s tt',
        'hh:m:ss tt',
        'hh:m:s tt',
        'h:mm:ss tt',
        'h:mm:s tt',
        'h:m:ss tt',
        'h:m:s tt',
        'hh:mm',
        'hh:m',
        'h:mm',
        'h:m',
        'hh:mm tt',
        'hh:m tt',
        'h:mm tt',
        'h:m tt'
    ], datePattern2 = [
        'MM-dd-yyyy',
        'MM-d-yyyy',
        'M-dd-yyyy',
        'M-d-yyyy',
        'yy-MM-dd',
        'yy-MM-d',
        'yy-M-dd',
        'yy-M-d',
        'yyyy-MM-dd',
        'yyyy-MM-d',
        'yyyy-M-dd',
        'yyyy-M-d',
        'dd-MMMM-yy',
        'dd-MMM-yy'
    ];
    var dateTimeFormatPattern = datePattern1.concat(timePattern1);
    each(datePattern1, function (dateIndex, dateValue) {
        each(timePattern1, function (timeIndex, timeValue) {
            if (timeIndex < timePattern1.length - 4) {
                dateTimeFormatPattern.push(dateValue + ' ' + timeValue);
            }
        });
    });
    dateTimeFormatPattern = dateTimeFormatPattern.concat(datePattern2);
    each(datePattern2, function (dateIndex, dateValue) {
        each(timePattern1, function (timeIndex, timeValue) {
            if (timeIndex < timePattern1.length - 4) {
                dateTimeFormatPattern.push(dateValue + ' ' + timeValue);
            }
        });
    });


    var CultureInfo = (function () {
        ///* class GC.Spread.Common.CultureInfo()
        /**
         * Represents the custom culture class. The member variable can be overwritten.
         * @class
         */
        function CultureInfo() { /* NOSONAR: S138, function too many lines */
            ///* interface GC.Spread.Common.INumberFormat
            /**
             currencyDecimalSeparator?: string;
             currencyGroupSeparator?: string;
             currencySymbol?: string;
             numberDecimalSeparator?: string;
             numberGroupSeparator?: string;
             listSeparator?: string;
             arrayListSeparator?: string;
             arrayGroupSeparator?: string;
             dbNumber?: Object
             */

            ///* field NumberFormat: GC.Spread.Common.INumberFormat
            /**
             * Indicates all the number format fields.
             * @type {Object}
             * @property {string} currencyDecimalSeparator - Indicates the currency decimal point.
             * @property {string} currencyGroupSeparator - Indicates the currency thousand separator.
             * @property {string} currencySymbol - Indicates the currency symbol.
             * @property {string} numberDecimalSeparator - Indicates the decimal point.
             * @property {string} numberGroupSeparator - Indicates the thousand separator.
             * @property {string} listSeparator - Indicates the separator for function arguments in a formula.
             * @property {string} arrayListSeparator - Indicates the separator for the constants in one row of an array constant in a formula.
             * @property {string} arrayGroupSeparator - Indicates the separator for the array rows of an array constant in a formula.
             * @property {object} dbNumber - Specifies the DBNumber characters.
             * The dbNumber object structure as follow:
             *  {
             *     1: {letters: ['兆', '千', '百', '十', '亿', '千', '百', '十', '万', '千', '百', '十', ''], // 兆千百十亿千百十万千百十
             *         numbers: ['○', '一', '二', '三', '四', '五', '六', '七', '八', '九'] }, // ○一二三四五六七八九
             *     2: {letters: ['兆', '仟', '佰', '拾', '亿', '仟', '佰', '拾', '万', '仟', '佰', '拾', ''], // 兆仟佰拾亿仟佰拾万仟佰拾
             *         numbers: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']}, // 零壹贰叁肆伍陆柒捌玖
             *     3: {letters: null,
             *         numbers: ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９']} // ０１２３４５６７８９
             * };
             * @example
             * // This example creates a custom culture.
             * var myCulture = new GC.Spread.Common.CultureInfo();
             * myCulture.NumberFormat.currencySymbol = "€"
             * myCulture.NumberFormat.numberDecimalSeparator = ",";
             * myCulture.NumberFormat.numberGroupSeparator = ".";
             * myCulture.NumberFormat.arrayGroupSeparator = ";";
             * myCulture.NumberFormat.arrayListSeparator = "\\";
             * myCulture.NumberFormat.listSeparator = ";";
             * myCulture.DateTimeFormat.amDesignator = "";
             * myCulture.DateTimeFormat.pmDesignator = "";
             * myCulture.DateTimeFormat.abbreviatedMonthNames = ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", ""];
             * myCulture.DateTimeFormat.abbreviatedDayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
             * myCulture.DateTimeFormat.abbreviatedMonthGenitiveNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
             * myCulture.DateTimeFormat.dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
             * myCulture.DateTimeFormat.fullDateTimePattern = "dddd, d. MMMM yyyy HH:mm:ss";
             * myCulture.DateTimeFormat.longDatePattern = "dddd, d. MMMM yyyy";
             * myCulture.DateTimeFormat.longTimePattern = "HH:mm:ss";
             * myCulture.DateTimeFormat.monthDayPattern = "dd MMMM";
             * myCulture.DateTimeFormat.monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""];
             * myCulture.DateTimeFormat.monthGenitiveNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""];
             * myCulture.DateTimeFormat.shortDatePattern = "dd.MM.yyyy";
             * myCulture.DateTimeFormat.shortTimePattern = "HH:mm";
             * myCulture.DateTimeFormat.yearMonthPattern = "MMMM yyyy";
             * //add one culture
             * GC.Spread.Common.CultureManager.addCultureInfo("de-DE", myCulture);
             * //switch to "de-DE" culture
             * GC.Spread.Common.CultureManager.culture("de-DE");
             * var d = new Date();
             * //With culture
             * activeSheet.setValue(1, 0, new Date(d.setDate(d.getDate() + 1)));
             * activeSheet.getCell(1, 0).formatter("mmm");
             * var dvalue = 12345.6789;
             * activeSheet.setColumnWidth(0, 200);
             * activeSheet.setColumnWidth(1, 200);
             * activeSheet.setColumnWidth(2, 200);
             * activeSheet.setValue(0, 0, dvalue);
             * activeSheet.getCell(0, 0).formatter("###,###.00");
             * activeSheet.setValue(2, 0, new Date(d.setDate(d.getDate() + 1)));
             * //With culture
             * activeSheet.getCell(3, 0).formatter("yyyy/mmm/dddd");
             * activeSheet.setValue(3, 0, new Date());
             */
            this.NumberFormat = {
                currencyDecimalDigits: 2,
                currencyDecimalSeparator: '.',
                currencyGroupSeparator: ',',
                currencyGroupSizes: [3],
                currencyNegativePattern: 0,
                currencyPositivePattern: 0,
                currencySymbol: '\u00A4',
                digitSubstitution: 1,
                isReadOnly: true,
                numberGroupSizes: [3],
                nanSymbol: 'NaN',
                nativeDigits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                numberNegativePattern: 1,
                negativeInfinitySymbol: '-Infinity',
                negativeSign: '-',
                numberDecimalDigits: 2,
                numberDecimalSeparator: '.',
                numberGroupSeparator: ',',
                positiveInfinitySymbol: 'Infinity',
                positiveSign: '+',
                percentDecimalDigits: 2,
                percentDecimalSeparator: '.',
                percentGroupSeparator: ',',
                percentGroupSizes: [3],
                percentNegativePattern: 0,
                percentPositivePattern: 0,
                percentSymbol: '%',
                perMilleSymbol: '\u2030',
                listSeparator: ',',
                arrayListSeparator: ',',
                arrayGroupSeparator: ';',
                dbNumber: {}
            };


            ///* interface GC.Spread.Common.IDateTimeFormat
            /**
             abbreviatedDayNames?: string[];
             abbreviatedMonthGenitiveNames?: string[];
             abbreviatedMonthNames?: string[];
             amDesignator?: string;
             dayNames?: string[];
             fullDateTimePattern?: string;
             longDatePattern?: string;
             longTimePattern?: string;
             monthDayPattern?: string;
             monthGenitiveNames?: string[];
             monthNames?: string[];
             pmDesignator?: string;
             shortDatePattern?: string;
             shortTimePattern?: string;
             yearMonthPattern?: string;
             */

            ///* field DateTimeFormat: GC.Spread.Common.IDateTimeFormat
            /**
             * Indicates the date time format fields.
             * @type {Object}
             * @property {Array.<string>} abbreviatedDayNames - Specifies the day formatter for "ddd".
             * @property {Array.<string>} abbreviatedMonthGenitiveNames - Specifies the month formatter for "MMM".
             * @property {Array.<string>} abbreviatedMonthNames - Specifies the month formatter for "MMM".
             * @property {string} amDesignator - Indicates the AM designator.
             * @property {Array.<string>} dayNames - Specifies the day formatter for "dddd".
             * @property {string} fullDateTimePattern - Specifies the standard date formatter for "F".
             * @property {string} longDatePattern - Specifies the standard date formatter for "D".
             * @property {string} longTimePattern - Specifies the standard date formatter for "T" and "U".
             * @property {string} monthDayPattern - Specifies the standard date formatter for "M" and "m".
             * @property {Array.<string>} monthGenitiveNames - Specifies the formatter for "MMMM".
             * @property {Array.<string>} monthNames - Specifies the formatter for "M" or "MM".
             * @property {string} pmDesignator - Indicates the PM designator.
             * @property {string} shortDatePattern - Specifies the standard date formatter for "d".
             * @property {string} shortTimePattern - Specifies the standard date formatter for "t".
             * @property {string} yearMonthPattern - Specifies the standard date formatter for "y" and "Y".
             * @example
             * // This example creates a custom culture.
             * var myCulture = new GC.Spread.Common.CultureInfo();
             * myCulture.NumberFormat.currencySymbol = "€"
             * myCulture.NumberFormat.numberDecimalSeparator = ",";
             * myCulture.NumberFormat.numberGroupSeparator = ".";
             * myCulture.NumberFormat.arrayGroupSeparator = ";";
             * myCulture.NumberFormat.arrayListSeparator = "\\";
             * myCulture.NumberFormat.listSeparator = ";";
             * myCulture.DateTimeFormat.amDesignator = "";
             * myCulture.DateTimeFormat.pmDesignator = "";
             * myCulture.DateTimeFormat.abbreviatedMonthNames = ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", ""];
             * myCulture.DateTimeFormat.abbreviatedDayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
             * myCulture.DateTimeFormat.abbreviatedMonthGenitiveNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
             * myCulture.DateTimeFormat.dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
             * myCulture.DateTimeFormat.fullDateTimePattern = "dddd, d. MMMM yyyy HH:mm:ss";
             * myCulture.DateTimeFormat.longDatePattern = "dddd, d. MMMM yyyy";
             * myCulture.DateTimeFormat.longTimePattern = "HH:mm:ss";
             * myCulture.DateTimeFormat.monthDayPattern = "dd MMMM";
             * myCulture.DateTimeFormat.monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""];
             * myCulture.DateTimeFormat.monthGenitiveNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""];
             * myCulture.DateTimeFormat.shortDatePattern = "dd.MM.yyyy";
             * myCulture.DateTimeFormat.shortTimePattern = "HH:mm";
             * myCulture.DateTimeFormat.yearMonthPattern = "MMMM yyyy";
             * //add one culture
             * GC.Spread.Common.CultureManager.addCultureInfo("de-DE", myCulture);
             * //switch to "de-DE" culture
             * GC.Spread.Common.CultureManager.culture("de-DE");
             * var d = new Date();
             * //With culture
             * activeSheet.setValue(1, 0, new Date(d.setDate(d.getDate() + 1)));
             * activeSheet.getCell(1, 0).formatter("mmm");
             * var dvalue = 12345.6789;
             * activeSheet.setColumnWidth(0, 200);
             * activeSheet.setColumnWidth(1, 200);
             * activeSheet.setColumnWidth(2, 200);
             * activeSheet.setValue(0, 0, dvalue);
             * activeSheet.getCell(0, 0).formatter("###,###.00");
             * activeSheet.setValue(2, 0, new Date(d.setDate(d.getDate() + 1)));
             * //With culture
             * activeSheet.getCell(3, 0).formatter("yyyy/mmm/dddd");
             * activeSheet.setValue(3, 0, new Date());
             */
            this.DateTimeFormat = {
                abbreviatedDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                abbreviatedMonthGenitiveNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ''],
                abbreviatedMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ''],
                amDesignator: 'AM',
                calendarIsReadOnly: true,
                calendarWeekRule: 0,
                Calendar: {
                    MinSupportedDateTime: '@-62135568000000@',
                    MaxSupportedDateTime: '@253402300799999@',
                    AlgorithmType: 1,
                    CalendarType: 1,
                    Eras: [1],
                    TwoDigitYearMax: 2029,
                    isReadOnly: true
                },
                dateSeparator: '/',
                dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                firstDayOfWeek: 0, // Sunday
                fullDateTimePattern: 'dddd, dd MMMM yyyy HH:mm:ss',
                longDatePattern: 'dddd, dd MMMM yyyy',
                longTimePattern: 'HH:mm:ss',
                monthDayPattern: 'MMMM dd',
                monthGenitiveNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ''],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ''],
                nativeCalendarName: 'Gregorian Calendar',
                pmDesignator: 'PM',
                rfc1123Pattern: 'ddd, dd MMM yyyy HH\':\'mm\':\'ss \'GMT\'',
                shortDatePattern: 'MM/dd/yyyy',
                shortestDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                shortTimePattern: 'HH:mm',
                sortableDateTimePattern: 'yyyy\'-\'MM\'-\'dd\'T\'HH\':\'mm\':\'ss',
                timeSeparator: ':',
                universalSortableDateTimePattern: 'yyyy\'-\'MM\'-\'dd HH\':\'mm\':\'ss\'Z\'',
                yearMonthPattern: 'yyyy MMMM',
                filterDialogDateFormatter: 'yyyy/mmmm/dd'   //EN formatter, for dateType filter dialog.
            };
            this.name = function () {
                return '';
            };
            this.id = -1;
        }

        CultureInfo.prototype = {
            constructor: CultureInfo,
            _getDateTimePattern: function () {
                if (!this._dateTimeFormatPattern) {
                    var dateTimeFormat = this.DateTimeFormat;
                    var shortDatePattern = dateTimeFormat.shortDatePattern.replace(/m/g, 'M');
                    var cultureDateTimeFormatPattern = [shortDatePattern,
                        shortDatePattern + ' h:mm',
                        shortDatePattern + ' h:mm:ss',
                        shortDatePattern + ' h:mm:ss.0',
                        'MMMdd',
                        'MMMd',
                        'MMM dd',
                        'MMM d'
                    ];
                    this._dateTimeFormatPattern = cultureDateTimeFormatPattern.concat(dateTimeFormatPattern);
                }
                return this._dateTimeFormatPattern;
            },
            _getMonthIndex: function (value) {
                var self = this;
                if (!self._upperMonths) {
                    self._upperMonths = __toUpperArray(self.DateTimeFormat.monthNames);
                    self._upperMonthsGenitive = __toUpperArray(self.DateTimeFormat.monthGenitiveNames);
                }
                return __getIndex(value, self._upperMonths, self._upperMonthsGenitive);
            },
            _getAbbrMonthIndex: function (value) {
                var self = this;
                if (!self._upperAbbrMonths) {
                    self._upperAbbrMonths = __toUpperArray(self.DateTimeFormat.abbreviatedMonthNames);
                    self._upperAbbrMonthsGenitive = __toUpperArray(self.DateTimeFormat.abbreviatedMonthGenitiveNames);
                }
                return __getIndex(value, self._upperAbbrMonths, self._upperAbbrMonthsGenitive);
            },
            _getDayIndex: function (value) {
                var self = this;
                if (!self._upperDays) {
                    self._upperDays = __toUpperArray(self.DateTimeFormat.dayNames);
                }
                return self._upperDays.indexOf(__toUpper(value));
            },
            _getAbbrDayIndex: function (value) {
                var self = this;
                if (!self._upperAbbrDays) {
                    self._upperAbbrDays = __toUpperArray(self.DateTimeFormat.abbreviatedDayNames);
                }
                return self._upperAbbrDays.indexOf(__toUpper(value));
            }
        };
        function __toUpper(value) {
            return value.split('\u00A0').join(' ').toUpperCase();
        }

        function __toUpperArray(arr) {
            var result = [];
            for (var i = 0, il = arr.length; i < il; i++) {
                result[i] = __toUpper(arr[i]);
            }
            return result;
        }

        function __getIndex(value, a1, a2) {
            var upper = __toUpper(value), i = a1.indexOf(upper);
            if (i === -1) {
                i = a2.indexOf(upper);
            }
            return i;
        }

        return CultureInfo;
    })();
    var _EraHelper = (function () {
        function _EraHelper() {
        }

        _EraHelper._isValidEraDate = function (date) {
            return date >= this._getEraMin() && date <= this._getEraMax();
        };
        _EraHelper._getEraDates = function () {
            var eras = CultureInfo.eras;
            if (eras !== keyword_undefined) {
                var eraDates = [];
                for (var i = 0; i < eras.length; i++) {
                    eraDates[i] = new Date(eras[i].startDate.replace(/-/g, '/'));
                }
                return eraDates;
            }
            return this._EraDates;
        };
        _EraHelper._getEraPropByFormat = function (format) {
            var self = this, propName, retValue;
            switch (format) {
                case 'g':
                    propName = 'symbol';
                    retValue = self._symbols;
                    break;
                case 'gg':
                    propName = 'abbreviation';
                    retValue = self._abbreviations;
                    break;
                case 'ggg':
                    propName = 'name';
                    retValue = self._names;
                    break;
                default:
                    return [];
            }

            var eras = CultureInfo.eras;
            var eraNames = [];
            if (eras !== keyword_undefined) {
                for (var i = 0; i < eras.length; i++) {
                    eraNames[i] = eras[i][propName];
                }
                return eraNames;
            }
            return retValue;
        };
        _EraHelper._getEraMax = function () {
            var eras = CultureInfo.eras;
            if (eras !== keyword_undefined && eras.length > 0) {
                var date = new Date(eras[eras.length - 1].startDate.replace(/-/g, '/'));
                date.setFullYear(date.getFullYear() + 99);
                return date;
            }
            return this._EraMax;
        };
        _EraHelper._getEraMin = function () {
            var eras = CultureInfo.eras;
            if (eras !== keyword_undefined && eras.length > 0) {
                return new Date(eras[0].startDate.replace(/-/g, '/'));
            }
            return this._EraMin;
        };
        _EraHelper._getEraCount = function () {
            var eras = CultureInfo.eras;
            if (eras !== keyword_undefined) {
                return eras.length;
            }
            return this._EraCount;
        };
        _EraHelper._getEraYears = function () {
            var eras = CultureInfo.eras;
            if (eras !== keyword_undefined) {
                var eraYears = [];
                for (var i = 1; i < eras.length; i++) {
                    var date1 = new Date(eras[i - 1].startDate.replace(/-/g, '/'));
                    var date2 = new Date(eras[i].startDate.replace(/-/g, '/'));
                    eraYears[i - 1] = date2.getFullYear() - date1.getFullYear() + 1;
                }
                eraYears[i - 1] = 99;
                return eraYears;
            }
            return this._EraYears;
        };
        _EraHelper._getEraDate = function (date) {
            var eraDate = {};
            eraDate._era = -1;
            eraDate._eraYear = -1;
            var self = this;
            if (!self._isValidEraDate(date)) {
                return eraDate;
            }
            for (var i = 0; i < self._getEraCount(); i++) {
                var nextDate = i + 1 !== self._getEraCount() ? self._getEraDates()[i + 1] : self._addMilliseconds(self._getEraMax(), 1);
                if (date < nextDate) {
                    eraDate._era = i;
                    eraDate._eraYear = date.getFullYear() - self._getEraDates()[i].getFullYear() + 1;
                    break;
                }
            }
            return eraDate;
        };
        _EraHelper._addMilliseconds = function (date, msec) {
            var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            newDate.setMilliseconds(newDate.getMilliseconds() + msec);
            return new Date(newDate.valueOf());
        };
        _EraHelper._getYearFromEra = function (era, eraYear) {
            var startYear = _EraHelper._getEraDates()[era].getFullYear();
            return startYear + eraYear - 1;
        };
        _EraHelper._parseEraPart = function (format, text) {
            text = text.toUpperCase();
            var eraNames = _EraHelper._getEraPropByFormat(format);
            for (var i = 0; i < eraNames.length; i++) {
                if (eraNames[i] === text) {
                    return i;
                }
            }
            return -1;
        };
        _EraHelper._formatEraPart = function (format, date) {
            var eras = _EraHelper;
            var eraDateInfo = eras._getEraDate(date);
            var era = eraDateInfo._era;
            if (era >= 0) {
                var ret = eras._getEraPropByFormat(format);
                if (ret.length > 0) {
                    return ret[era];
                }
            }
            var eraYear = eraDateInfo._eraYear;
            if (eraYear >= 0) {
                var eraYearStr = eraYear.toString();
                if (format === 'ee') {
                    if (eraYearStr.length === 1) {
                        eraYearStr = '0' + eraYearStr;
                    }
                    return eraYearStr;
                }
                if (format === 'e') {
                    return eraYearStr;
                }
            }
            return '';
        };
        _EraHelper._EraDates = [new Date(1868, 8, 8), new Date(1912, 6, 30), new Date(1926, 11, 25), new Date(1989, 0, 8)];
        _EraHelper._EraCount = 4;
        _EraHelper._EraYears = [45, 15, 64, 99];
        _EraHelper._EraMax = new Date(2087, 12 - 1, 31, 23, 59, 59);
        _EraHelper._EraMin = new Date(1868, 9 - 1, 8);
        _EraHelper._shortcuts = ['1,m', '2,t', '3,s', '4,h'];
        _EraHelper._EraIndices = [0, 1, 2, 3, 0, 1, 2, 3];
        _EraHelper._names = ['明治', '大正', '昭和', '平成'];
        _EraHelper._symbols = ['M', 'T', 'S', 'H'];
        _EraHelper._abbreviations = ['明', '大', '昭', '平'];
        _EraHelper._EraYearMax = 99;
        return _EraHelper;
    })();
    var _ENCultureInfo = (function (_super) {
        inherit(_ENCultureInfo, _super);
        function _ENCultureInfo() {
            _super.apply(this, arguments);
            overridePro.call(this, 'NumberFormat', ['currencySymbol', 'isReadOnly'], ['$', false]);
            overridePro.call(this, 'DateTimeFormat',
                ['fullDateTimePattern', 'longDatePattern', 'longTimePattern', 'shortDatePattern', 'shortTimePattern', 'yearMonthPattern', 'calendarIsReadOnly'],
                ['dddd, MMMM dd, yyyy h:mm:ss tt', 'dddd, MMMM dd, yyyy', 'h:mm:ss tt', 'M/d/yyyy', 'h:mm tt', 'MMMM, yyyy', false]);
            this.name = function () {
                return 'en-US';
            };
            this.id = 0x0409;
        }

        return _ENCultureInfo;
    })(CultureInfo);
    var _JACultureInfo = (function (_super) {
        inherit(_JACultureInfo, _super);
        function _JACultureInfo() {
            _super.apply(this, arguments);
            var dbNumber = {
                1: {
                    letters: ['兆', '千', '百', '十', '亿', '千', '百', '十', '万', '千', '百', '十', ''], // 兆千百十亿千百十万千百十
                    numbers: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
                }, // 〇一二三四五六七八九
                2: {
                    letters: ['兆', '阡', '百', '拾', '億', '阡', '百', '拾', '萬', '阡', '百', '拾', ''], // 兆阡百拾億阡百拾萬阡百拾
                    numbers: ['〇', '壱', '弐', '参', '四', '伍', '六', '七', '八', '九']
                }, // 〇壱弐参四伍六七八九
                3: {
                    letters: keyword_null,
                    numbers: ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９']
                } // ０１２３４５６７８９
            };
            overridePro.call(this, 'NumberFormat',
                ['currencyDecimalDigits', 'currencyNegativePattern', 'currencySymbol', 'isReadOnly', 'nanSymbol',
                    'negativeInfinitySymbol', 'percentNegativePattern', 'percentPositivePattern', 'positiveInfinitySymbol', 'dbNumber'],
                [0, 1, '¥', false, 'NaN (非数値)', '-∞', 1, 1, '+∞', dbNumber]);
            var monthNum = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', ''];
            var monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', ''];
            overridePro.call(this, 'DateTimeFormat', ['abbreviatedDayNames', 'abbreviatedMonthGenitiveNames', 'abbreviatedMonthNames', 'amDesignator',
                    'calendarIsReadOnly', 'dayNames', 'fullDateTimePattern', 'longDatePattern', 'longTimePattern', 'monthDayPattern', 'monthGenitiveNames',
                    'monthNames', 'nativeCalendarName', 'pmDesignator', 'shortDatePattern', 'shortestDayNames', 'shortTimePattern', 'yearMonthPattern',
                    'filterDialogDateFormatter', 'EraFilterDialogDateFormatter'],
                [['日', '月', '火', '水', '木', '金', '土'], monthNum, monthNum, '午前', false, ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                    'yyyy\'年\'M\'月\'d\'日\' H:mm:ss', 'yyyy\'年\'M\'月\'d\'日\'', 'H:mm:ss', 'M\'月\'d\'日\'', monthNames, monthNames,
                    '西暦 (日本語)', '午後', 'yyyy/MM/dd', ['日', '月', '火', '水', '木', '金', '土'], 'H:mm', 'yyyy\'年\'M\'月\'', 'yyyy年/mmmm/d日', 'ggge/mmmm/d日']);
            this.DateTimeFormat.eras = _EraHelper;
            this.name = function () {
                return 'ja-JP';
            };
            this.id = 0x0411;
            this.isJCKCulture = true;
        }

        return _JACultureInfo;
    })(CultureInfo);
    var _ZHCultureInfo = (function (_super) {
        inherit(_ZHCultureInfo, _super);
        function _ZHCultureInfo() {
            _super.apply(this, arguments);
            var dbNumber = {
                1: {
                    letters: ['兆', '千', '百', '十', '亿', '千', '百', '十', '万', '千', '百', '十', ''], // 兆千百十亿千百十万千百十
                    numbers: ['○', '一', '二', '三', '四', '五', '六', '七', '八', '九']
                }, // ○一二三四五六七八九
                2: {
                    letters: ['兆', '仟', '佰', '拾', '亿', '仟', '佰', '拾', '万', '仟', '佰', '拾', ''], // 兆仟佰拾亿仟佰拾万仟佰拾
                    numbers: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
                }, // 零壹贰叁肆伍陆柒捌玖
                3: {
                    letters: keyword_null,
                    numbers: ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９']
                } // ０１２３４５６７８９
            };
            overridePro.call(this, 'NumberFormat', ['currencyNegativePattern', 'currencySymbol', 'isReadOnly', 'nanSymbol', 'negativeInfinitySymbol',
                    'percentNegativePattern', 'percentPositivePattern', 'positiveInfinitySymbol', 'dbNumber'],
                [2, '¥', false, '非数字', '负无穷大', 1, 1, '正无穷大', dbNumber]);
            var abbMNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', ''];
            var mNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月', ''];
            overridePro.call(this, 'DateTimeFormat', ['abbreviatedDayNames', 'abbreviatedMonthGenitiveNames', 'abbreviatedMonthNames',
                    'amDesignator', 'calendarIsReadOnly', 'dayNames', 'firstDayOfWeek', 'fullDateTimePattern', 'longDatePattern', 'longTimePattern',
                    'monthDayPattern', 'monthGenitiveNames', 'monthNames', 'nativeCalendarName', 'pmDesignator',
                    'shortDatePattern', 'shortestDayNames', 'shortTimePattern', 'yearMonthPattern',
                    'filterDialogDateFormatter'],
                [['周日', '周一', '周二', '周三', '周四', '周五', '周六'], abbMNames, abbMNames, '上午', false, ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], 1,
                    'yyyy\'年\'M\'月\'d\'日\' H:mm:ss', 'yyyy\'年\'M\'月\'d\'日\'', 'H:mm:ss', 'M\'月\'d\'日\'', mNames, mNames, '公历', '下午', 'yyyy/M/d',
                    ['日', '一', '二', '三', '四', '五', '六'], 'H:mm', 'yyyy\'年\'M\'月\'', 'yyyy年/mmmm/d日']);
            this.name = function () {
                return 'zh-cn';
            };
            this.id = 0x0804;
            this.isJCKCulture = true;
        }

        return _ZHCultureInfo;
    })(CultureInfo);
    var _KOCultureInfo = (function (_super) {
        inherit(_KOCultureInfo, _super);
        function _KOCultureInfo() {
            _super.apply(this, arguments);
            var dbNumber = {
                1: {
                    letters: ['兆', '千', '百', '十', '億', '千', '百', '十', '万', '千', '百', '十', ''], // 兆千百十億千百十万千百十
                    numbers: ['０', '一', '二', '三', '四', '五', '六', '七', '八', '九']
                }, // ０一二三四五六七八九
                2: {
                    letters: ['兆', '阡', '百', '拾', '億', '阡', '百', '拾', '萬', '阡', '百', '拾', ''], // 兆阡百拾億阡百拾萬阡百拾
                    numbers: ['零', '壹', '貳', '參', '四', '伍', '六', '七', '八', '九']
                }, // 零壹貳參四伍六七八九
                3: {
                    letters: ['兆', '千', '百', '十', '億', '千', '百', '十', '万', '千', '百', '十', ''], // 兆千百十億千百十万千百十
                    numbers: ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９']
                } // ０１２３４５６７８９
            };
            overridePro.call(this, 'NumberFormat', ['currencyDecimalDigits', 'currencyNegativePattern', 'currencySymbol', 'isReadOnly', 'dbNumber'],
                [0, 1, '₩', false, dbNumber]);
            var abbMNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", ""];
            var mNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", ""];
            overridePro.call(this, 'DateTimeFormat', ['abbreviatedDayNames', 'abbreviatedMonthGenitiveNames', 'abbreviatedMonthNames',
                    'amDesignator', 'calendarIsReadOnly', 'dayNames', 'firstDayOfWeek', 'fullDateTimePattern', 'longDatePattern', 'longTimePattern',
                    'monthDayPattern', 'monthGenitiveNames', 'monthNames', 'nativeCalendarName', 'pmDesignator',
                    'shortDatePattern', 'shortestDayNames', 'shortTimePattern', 'yearMonthPattern',
                    'filterDialogDateFormatter'],
                [["일", "월", "화", "수", "목", "금", "토"], abbMNames, abbMNames, '오전', false, ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"], 1,
                    'yyyy\'년\' M\'월\' d\'일\' dddd h:mm:ss', 'yyyy\'년\' M\'월\' d\'일\' dddd', 'h:mm:ss', 'M\'월\' d\'일\'', mNames, mNames, '서기', '오후', 'yyyy-MM-dd',
                    ["일", "월", "화", "수", "목", "금", "토"], 'tt h:mm', 'yyyy\'년\' M\'월\'', 'yyyy년/mmmm/d일']);
            this.name = function () {
                return 'ko-kr';
            };
            this.id = 0x0412;
            this.isJCKCulture = true;
        }

        return _KOCultureInfo;
    })(CultureInfo);

    var cultureInfoDict = {
        'invariant': new CultureInfo(),
        'en-us': new _ENCultureInfo(),
        'ja-jp': new _JACultureInfo(),
        'zh-cn': new _ZHCultureInfo(),
        'ko-kr': new _KOCultureInfo()
    };

    function overridePro(proName, fields, values) {
        var self = this;
        var field;
        for (var i = 0, len = fields.length; i < len; i++) {
            field = fields[i];
            self[proName][field] = values[i];
        }
    }

    var CultureManager = (function () {
        if (typeof CultureManager.instance === 'object') {
            return CultureManager.instance;
        }
        ///* class GC.Spread.Common.CultureManager
        /**
         * Represente a culture manager.
         * @constructor
         */
        function CultureManager() {
            var cRName = 'en-us';
            ///* function static GC.Spread.Common.@CultureManager.culture(cultureName?: string): string
            /**
             * Get or set the Sheets culture.
             * @static
             * @param {string} cultureName The culture name to get.
             * @returns {string}. The current culture name of Sheets.
             */
            this.culture = function (cultureName) {
                if (arguments.length === 0) {
                    return cRName;
                }
                if (!cultureName) {
                    return;
                }
                if (cRName !== cultureName) {
                    cRName = cultureName.toLowerCase();
                    triggerEvent(cRName);
                }
            };
            ///* function static GC.Spread.Common.@CultureManager.addCultureInfo(cultureName, culture): GC.Spread.Common.CultureInfo
            /**
             * Adds the cultureInfo into the culture manager.
             * @static
             * @param {string} cultureName
             * @param {GC.Spread.Common.CultureInfo} culture object
             */
            this.addCultureInfo = function (cultureName, culture) {
                var numberDecimalSeparator = culture.NumberFormat.numberDecimalSeparator,
                    arrayListSeparator = culture.NumberFormat.arrayListSeparator,
                    arrayGroupSeparator = culture.NumberFormat.arrayGroupSeparator;
                if (numberDecimalSeparator === culture.NumberFormat.listSeparator || arrayGroupSeparator === arrayListSeparator) {
                    var Common = require('../util/common.js');
                    throw Common._getResource(Common.SR)().Exp_Separator;
                }
                cultureInfoDict[cultureName.toLowerCase()] = culture;
            };
            ///* function static GC.Spread.Common.@CultureManager.getCultureInfo(cultureName: Object): GC.Spread.Common.CultureInfo
            /**
             * Gets the specified cultureInfo. If no culture name, get current cultureInfo.
             * @static
             * @param {Object} cultureName Culture name or culture ID
             * @returns {GC.Spread.Common.CultureInfo} cultureInfo object
             */
            this.getCultureInfo = function (cultureName) {
                if (arguments.length === 0) {
                    return cultureInfoDict[cRName];
                }

                var isString = typeof (cultureName) === 'string';
                cultureName = isString ? cultureName.toLowerCase() : cultureName;
                var dic = cultureInfoDict;
                var culture = keyword_null;
                for (var p in dic) {
                    if (p === cultureName || (dic[p].id !== keyword_undefined && dic[p].id === cultureName)) {
                        culture = dic[p];
                        break;
                    }
                }

                return culture;
            };
            this._getCultureInfo = function (cultureName) {
                var culture = this.getCultureInfo(cultureName);
                if (!culture) {
                    culture = cultureInfoDict[cRName];
                    if (!culture) {
                        culture = new CultureInfo();
                    }
                }
                return culture;
            };
            this._getFilterDialogFormatterStr = function (id, formatWords) {
                var cultureInfo = this.getCultureInfo(id) || this.getCultureInfo('en-US');
                var dateTimeFormatInfo = cultureInfo.DateTimeFormat;
                var formatterStr = dateTimeFormatInfo.filterDialogDateFormatter;
                if(formatWords.indexOf('g') >= 0 || formatWords.indexOf('e') >= 0) {
                    formatterStr = dateTimeFormatInfo.EraFilterDialogDateFormatter || formatterStr;   // for ERA; 平成30/1月/01
                }
                return formatterStr;
            };
            CultureManager.instance = this;
        }

        function triggerEvent(culture) {
            var evt;
            if (typeof CustomEvent !== 'function') {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent('cultureChanged', false, false, undefined);
            } else {
                evt = new CustomEvent('cultureChanged', {});
            }
            evt.cultureInfo = culture;
            //This global field is used to sync the culture status in ExcelIO and Runtime.
            //Because in commonjs project (such as webpack), could not get the global namespace: GC, and of couse, could not get
            //CultureManager our namespace.
            //This is a temporary solution, we may have better soltuion in the future version.
            WINDOW.gcCultureInfo = culture;
            document.dispatchEvent(evt);
        }

        return CultureManager;
    })();

    module.exports = {
        CultureInfo: CultureInfo,
        CultureManager: new CultureManager()
    };

}());