(function () {
    'use strict';

    var keyword_undefined = void 0, keyword_null = null;
    var NUMBER = 'number', STRING = 'string', BOOLEAN = 'boolean';
    var commonNS = require('../../common/common.entry.js');
    var dateTimeHelper = commonNS._DateTimeHelper;
    var toOADate = dateTimeHelper._toOADate;

    ///* enum GC.Spread.Slicers.FilteredOutDataType
    /**
     * Represents the kind of filtered out exclusive data index that should be included in the result.
     * @enum {number}
     */
    var FilteredOutDataType = {
        /**
         * Indicates all of the filtered out data.
         */
        all: 0,
        /**
         * Indicates the data was filtered out based on the current column.
         */
        byCurrentColumn: 1,
        /**
         * Indicates the data was filtered out based on other columns.
         */
        byOtherColumns: 2
    };

    ///* enum GC.Spread.Slicers.SlicerAggregateType
    /**
     * Represents the aggregate type.
     * @enum {number}
     */
    var SlicerAggregateType = {
        /**
         *  Calculates the average of the specified numeric values.
         */
        average: 1,
        /**
         *  Calculates the number of data that contain numbers.
         */
        count: 2,
        /**
         *  Calculates the number of data that contain non-null values.
         */
        counta: 3,
        /**
         *  Calculates the maximum value, the greatest value, of all the values.
         */
        max: 4,
        /**
         *  Calculates the minimum value, the least value, of all the values.
         */
        min: 5,
        /**
         *  Multiplies all the arguments and returns the product.
         */
        product: 6,
        /**
         *  Calculates the standard deviation based on a sample.
         */
        stdev: 7,
        /**
         *  Calculates the standard deviation of a population based on the entire population using the numbers in a column of a list or database that match the specified conditions.
         */
        stdevp: 8,
        /**
         *  Calculates the sum of the specified numeric values.
         */
        sum: 9,
        /**
         *  Calculates the variance based on a sample of a population, which uses only numeric values.
         */
        vars: 10,
        /**
         *  Calculates the variance based on a sample of a population, which includes numeric, logical, or text values.
         */
        varp: 11
    };

    function isDataItemObject(value) {
        return value && value.text !== keyword_undefined;
    }

    var _SortHelper = (function () {
        function _SortHelper() {
        }

        _SortHelper.quickSort = function (values) {
            var count = getLength(values);
            var array = []; // array of indexes to be sorted
            var temp;
            for (temp = 0; temp < count; temp++) {
                array[temp] = {
                    index: temp,
                    value: values[temp]
                };
            }
            return this.quickSortImp(array);
        };
        _SortHelper.quickSortImp = function (arr) {
            if (getLength(arr) <= 1) {
                return arr;
            }
            var self = this;
            var pivotIndex = Math.floor(getLength(arr) / 2);
            var pivot = arr[pivotIndex];
            var left = [];
            var right = [];
            var equal = [];
            for (var i = 0; i < getLength(arr); i++) {
                var compareResult = self.sortCompare(arr[i].value, pivot.value);
                if (compareResult < 0) {
                    left.push(arr[i]);
                } else if (compareResult > 0) {
                    right.push(arr[i]);
                } else {
                    equal.push(arr[i]);
                }
            }
            return self.quickSortImp(left).concat(equal, self.quickSortImp(right));
        };
        _SortHelper.isEquals = function (v1, v2) {
            if ((isNullOrUndefined(v1) || v1 === '') && (isNullOrUndefined(v2) || v2 === '')) {
                return true;
            }
            if (v1 instanceof Date && v2 instanceof Date) {
                return v1.valueOf() === v2.valueOf();
            } else if (getType(v1) === STRING && getType(v2) === STRING) {
                return v1.toLowerCase() === v2.toLowerCase();
            }
            return v1 === v2;
        };
        _SortHelper._toOADate = toOADate;
        _SortHelper.isGreaterThan = function (v1, v2) {
            var v1Type = getType(v1), v2Type = getType(v2);
            if (v1Type === BOOLEAN) {
                v1 = (v1 ? 1 : 0);
            } else if (v1 instanceof Date) {
                v1 = this._toOADate(v1);
            }
            if (v2Type === BOOLEAN) {
                v2 = (v2 ? 1 : 0);
            } else if (v2 instanceof Date) {
                v2 = this._toOADate(v2);
            }
            if (v1Type !== v2Type && (v1Type === NUMBER || v2Type === NUMBER)) {
                return (getType(v2) === NUMBER);
            }
            if (v1Type === STRING && v2Type === STRING) {
                return v1.toLowerCase() > v2.toLowerCase(); /* NOSONAR: s3759, Non-existent properties should not be read */
            }
            return v1 > v2;
        };
        _SortHelper.sortCompare = function (value1, value2) {
            var self = this;
            var ret = 0,
                value1IsNullOrEmptyOrNaN,
                value2IsNullOrEmptyOrNaN;
            value1IsNullOrEmptyOrNaN = isNullOrUndefined(value1) || value1 === '' || (getType(value1) === NUMBER && isNaN(value1));
            value2IsNullOrEmptyOrNaN = isNullOrUndefined(value2) || value2 === '' || (getType(value2) === NUMBER && isNaN(value2));
            if (value1IsNullOrEmptyOrNaN && value2IsNullOrEmptyOrNaN) {
                ret = 0;
            } else if (value1IsNullOrEmptyOrNaN) {
                ret = 1;
            } else if (value2IsNullOrEmptyOrNaN) {
                ret = -1;
            } else if (self.isEquals(value1, value2)) {
                ret = 0;
            } else if (self.isGreaterThan(value1, value2)) {
                ret = 1;
            } else {
                ret = -1;
            }
            return ret;
        };
        return _SortHelper;
    })();

    function tryToNumber(value, outValue) { /* NOSONAR: FunctionComplexity */
        if (value === keyword_null || value === keyword_undefined) {
            return false;
        } else if (getType(value) === NUMBER) {
            outValue.value = value;
        } else if (getType(value) === BOOLEAN) {
            outValue.value = (value ? 1 : 0);
        } else if (value instanceof Date) {
            outValue.value = _SortHelper._toOADate(value);
        } else if (getType(value) === STRING) {
            value = value.trim();
            if (getLength(value) === 0) {
                return false;
            }
            var isPercent = false;
            if (value.charAt(getLength(value) - 1) === '%') {
                isPercent = true;
                value = value.substr(0, getLength(value) - 1);
            }
            // if value is a hexadecimal number string, it can be translate to a number.But excel treats it as string.
            // so if value start with "0x", we do not translate it to number.
            if (getLength(value) >= 2 && value[0] === '0' && value[1] === 'x') {
                return false;
            }

            var result = Number(value).valueOf();
            if (isNaN(result) || !isFinite(result)) {
                // -----------
                // Cylj added this code at 2015/6/10, Excel can evaluate the formula such as: ="2013/1/2" + 1
                result = new Date(value);
                if (isNaN(result)) {
                    return false;
                }
                result = _SortHelper._toOADate(result);
            }
            if (isPercent) {
                result /= 100;
            }
            outValue.value = result;
        } else {
            return false;
        }
        return true;
    }

    function updateFilteredRows(generalSlicerData) {
        var inPreview = generalSlicerData._inPreview;
        if (!inPreview) {
            generalSlicerData._filteredRowMap = [];
            generalSlicerData._filteredRowIndexes = [];
        }
        var filteredRowMap = inPreview ? generalSlicerData._filteredPreviewRowMap : generalSlicerData._filteredRowMap,
            filteredInfoByRangeSet = generalSlicerData._filteredInfoByRangeSet,
            filteredInfoSet = generalSlicerData._filteredInfoSet,
            filteredRowIndexes = inPreview ? generalSlicerData._filteredPreviewRowIndexes : generalSlicerData._filteredRowIndexes,
            filteredColumns = generalSlicerData._filteredColumns,
            filteredPreviewColumnSet = generalSlicerData._filteredPreviewColumnSet,
            filteredPreviewByRangColumnSet = generalSlicerData._filteredPreviewByRangColumnSet,
            rowCount = getLength(generalSlicerData.data),
            exclusiveIndex;
        for (var row = 0; row < rowCount; row++) {
            var filteredOut = false;
            for (var i = 0; i < getLength(filteredColumns); i++) { /* NOSONAR: TooManyBreakOrContinueInLoop */
                var col = filteredColumns[i];
                if (inPreview && col === generalSlicerData._previewCol) {
                    continue;
                }
                if (filteredInfoSet[col]) {
                    exclusiveIndex = generalSlicerData.getExclusiveRowIndex(generalSlicerData.columnNames[col], row);
                    filteredOut = !filteredInfoSet[col][exclusiveIndex];
                } else if (filteredInfoByRangeSet[col]) {
                    filteredOut = !filteredInfoByRangeSet[col][row];
                }
                if (filteredOut) {
                    break;
                }
            }
            if (!filteredOut && inPreview) {
                if (filteredPreviewColumnSet) {
                    exclusiveIndex = generalSlicerData.getExclusiveRowIndex(generalSlicerData.columnNames[col], row);
                    filteredOut = !filteredPreviewColumnSet[exclusiveIndex];
                } else if (filteredPreviewByRangColumnSet) {
                    filteredOut = !filteredPreviewByRangColumnSet[row];
                }
            }
            if (!filteredOut) {
                filteredRowMap[row] = true;
            }
        }
        for (i = 0; i < getLength(filteredRowMap); i++) {
            if (filteredRowMap[i]) {
                filteredRowIndexes.push(i);
            }
        }
    }

    function updateDataCaches(generalSlicerData) {
        var columnsSet = generalSlicerData._columnsSet = {};
        generalSlicerData._columnDataCache = [];
        generalSlicerData._exclusiveDataCache = [];
        generalSlicerData._exclusiveToFullMap = [];
        generalSlicerData._fullToExclusivelMap = [];
        var columnNames = generalSlicerData.columnNames;
        for (var col = 0; col < getLength(columnNames); col++) {
            columnsSet[(columnNames[col] + '').toUpperCase()] = col;
        }
    }

    function updateDataCache(generalSlicerData, col) {
        var columnDataCache = generalSlicerData._columnDataCache;
        var exclusiveDataCache = generalSlicerData._exclusiveDataCache;
        var filteredInfoIndexes = generalSlicerData._exclusiveDataIndex;
        var exclusiveToFullMap = generalSlicerData._exclusiveToFullMap;
        var fullToExclusivelMap = generalSlicerData._fullToExclusivelMap;
        var data = generalSlicerData.data;
        var fullToExclusivelSet = fullToExclusivelMap[col] = [];
        generalSlicerData._sortedColumnDataCache = [];
        columnDataCache[col] = [];
        exclusiveDataCache[col] = [];
        filteredInfoIndexes[col] = {};
        exclusiveToFullMap[col] = [];
        for (var row = 0; row < getLength(data); row++) {
            var dataItem = data[row][col],
                oneData = isDataItemObject(dataItem) ? dataItem.text.trim() : dataItem;
            columnDataCache[col].push(oneData);
            if (fullToExclusivelSet[row] === undefined) {
                var exclusiveToFullList = [row];
                exclusiveDataCache[col].push(oneData);
                exclusiveToFullMap[col].push(exclusiveToFullList);
                var exclusivelIndex = getLength(exclusiveToFullMap[col]) - 1;
                filteredInfoIndexes[col][oneData] = exclusivelIndex;
                fullToExclusivelSet[row] = exclusivelIndex;
                for (var nextRow = row + 1; nextRow < getLength(data); nextRow++) {
                    var nextDataItem = data[nextRow][col],
                        nextDataItemText = isDataItemObject(nextDataItem) ? nextDataItem.text.trim() : nextDataItem;
                    if (fullToExclusivelSet[nextRow] === undefined && _SortHelper.isEquals(nextDataItemText, oneData)) {
                        exclusiveToFullList.push(nextRow);
                        fullToExclusivelSet[nextRow] = exclusivelIndex;
                    }
                }
            }
        }
    }

    function getFilteredInfos(generalSlicerData, columnName, isFilteredOut) {
        var data2SortedMapping = generalSlicerData._data2SortedMapping;
        var colIndex = generalSlicerData.getColumnIndex(columnName);
        var result = [];
        if (!colIndex) {
            return result;
        }
        var filteredRanges = generalSlicerData._inPreview ? generalSlicerData._filteredPreviewByRangColumn : generalSlicerData._filteredInfoByRange[colIndex],
            filteredInfoSet = generalSlicerData._filteredRowMap;
        if (!filteredRanges) {
            return result;
        }
        if (!data2SortedMapping[colIndex]) {
            generalSlicerData._sortOneCol(colIndex);
        }
        var sortedData = [],
            sortedColMapping = data2SortedMapping[colIndex];
        for (var i = 0; i < getLength(sortedColMapping); i++) {
            var dataItem = generalSlicerData.data[i][colIndex],
                dataItemValue = isDataItemObject(dataItem) ? dataItem.value : dataItem;
            sortedData[sortedColMapping[i]] = dataItemValue;
        }
        var sorted2DataMapping = generalSlicerData._sorted2DataMapping[colIndex];
        for (i = 0; i < getLength(filteredRanges); i++) {
            var range = filteredRanges[i],
                isVisible = false;
            var startEndIndex = generalSlicerData._getStartEndIndex(sortedData, range);
            for (var row = startEndIndex.start; row <= startEndIndex.end; row++) {
                if (filteredInfoSet[sorted2DataMapping[row]]) {
                    isVisible = true;
                    break;
                }
            }
            if (isVisible !== isFilteredOut) {
                result.push(range);
            }
        }
        return result;
    }

    function getAllFilteredOutExclusiveRowIndexes(generalSlicerData, columnName) {
        var exclusiveIndexes = [];
        var colIndex = generalSlicerData.getColumnIndex(columnName);
        if (colIndex >= 0) {
            var rowCount = getLength(generalSlicerData.getData(columnName)),
                filteredRowMap = generalSlicerData._inPreview ? generalSlicerData._filteredPreviewRowMap : generalSlicerData._filteredRowMap;
            for (var r = 0; r < rowCount; r++) {
                if (!filteredRowMap[r]) {
                    var index = generalSlicerData.getExclusiveRowIndex(columnName, r);
                    if (exclusiveIndexes.indexOf(index) === -1) {
                        exclusiveIndexes.push(index);
                    }
                }
            }
            return exclusiveIndexes;
        }
    }

    function getFilteredOutExclusiveRowIndexesBySelf(generalSlicerData, columnName) {
        var exclusiveIndexes = [];
        var colIndex = generalSlicerData.getColumnIndex(columnName);
        if (colIndex >= 0) {
            var filteredColumnSetOrRangColumnSet = generalSlicerData._filteredPreviewColumnSet || generalSlicerData._filteredPreviewByRangColumnSet;
            var filteredInfoSetOrRangeSet = generalSlicerData._filteredInfoSet[colIndex] || generalSlicerData._filteredInfoByRangeSet[colIndex];
            var filteredBySelf = (generalSlicerData._inPreview && colIndex === generalSlicerData._previewCol) ? filteredColumnSetOrRangColumnSet : filteredInfoSetOrRangeSet;
            var isRangeFilter = !!generalSlicerData._filteredInfoByRangeSet[colIndex];
            var length = isRangeFilter ? getLength(generalSlicerData.getData(columnName)) : getLength(generalSlicerData.getExclusiveData(columnName));
            for (var i = 0; i < length; i++) {
                if (filteredBySelf && !filteredBySelf[i]) {
                    var exclusiveIndex = isRangeFilter ? generalSlicerData.getExclusiveRowIndex(columnName, i) : i;
                    if (exclusiveIndexes.indexOf(exclusiveIndex) === -1) {
                        exclusiveIndexes.push(exclusiveIndex);
                    }
                }
            }
        }
        return exclusiveIndexes;
    }

    function getFilteredOutExclusiveRowIndexesByOther(generalSlicerData, columnName) {
        var indexes = [],
            columnNames = generalSlicerData.columnNames;
        for (var i = 0, length = getLength(columnNames); i < length; i++) {
            if (columnNames[i] === columnName) {
                continue;
            }
            var foedIndex = getFilteredOutExclusiveRowIndexesBySelf(generalSlicerData, columnNames[i]);
            for (var j = 0; j < getLength(foedIndex); j++) {
                var rowIndexes = generalSlicerData.getRowIndexes(columnNames[i], foedIndex[j]);
                for (var k = 0; k < getLength(rowIndexes); k++) {
                    if (indexes.indexOf(rowIndexes[k]) === -1) {
                        indexes.push(rowIndexes[k]);
                    }
                }
            }
        }
        for (i = 0, length = getLength(generalSlicerData.data); i < length; i++) {
            if (indexes.indexOf(i) !== -1) {
                indexes.splice(indexes.indexOf(i), 1);
            } else {
                indexes.push(i);
            }
        }
        var edLength = getLength(generalSlicerData.getExclusiveData(columnName)),
            result = [];
        for (i = 0; i < edLength; i++) {
            result.push(i);
        }
        for (i = 0, length = getLength(indexes); i < length; i++) {
            var edIndex = generalSlicerData.getExclusiveRowIndex(columnName, indexes[i]);
            if (result.indexOf(edIndex) !== -1) {
                result.splice(result.indexOf(edIndex), 1);
            }
        }
        return result;
    }

    function doFilterByRange(generalSlicerData, columnName, ranges, isPreview) {
        var colIndex = generalSlicerData.getColumnIndex(columnName),
            data2SortedMapping = generalSlicerData._data2SortedMapping;
        if (!data2SortedMapping[colIndex]) {
            generalSlicerData._sortOneCol(colIndex);
        }
        var sortedData = [],
            sortedColMapping = data2SortedMapping[colIndex];
        for (var i = 0; i < getLength(sortedColMapping); i++) {
            var dataItem = generalSlicerData.data[i][colIndex],
                dataItemValue = isDataItemObject(dataItem) ? dataItem.value : dataItem;
            sortedData[sortedColMapping[i]] = dataItemValue;
        }
        var map = {};
        for (i = 0; i < getLength(ranges); i++) {
            var minMax = generalSlicerData._getStartEndIndex(sortedData, ranges[i]);
            for (var rowIndex = 0; rowIndex < getLength(sortedColMapping); rowIndex++) {
                if (sortedColMapping[rowIndex] >= minMax.start && sortedColMapping[rowIndex] <= minMax.end) {
                    map[rowIndex] = true;
                }
            }
        }
        if (isPreview) {
            generalSlicerData._filteredPreviewByRangColumnSet = map;
            generalSlicerData._filteredPreviewByRangColumn = ranges;
        } else {
            generalSlicerData._filteredInfoByRange[colIndex] = ranges;
            generalSlicerData._filteredInfoByRangeSet[colIndex] = map;
            delete generalSlicerData._filteredInfoSet[colIndex];
            delete generalSlicerData._filteredInfoIndexes[colIndex];
        }
        updateFilteredRows(generalSlicerData);
    }

    function doFilterByIndexes(generalSlicerData, columnName, exclusiveRowIndexes, isPreview) {
        var colIndex = generalSlicerData.getColumnIndex(columnName);
        var newSet = {};
        for (var i = 0; i < getLength(exclusiveRowIndexes); i++) {
            newSet[exclusiveRowIndexes[i]] = true;
        }
        if (isPreview) {
            generalSlicerData._filteredPreviewColumnSet = newSet;
        } else {
            generalSlicerData._filteredInfoSet[colIndex] = newSet;
            generalSlicerData._filteredInfoIndexes[colIndex] = exclusiveRowIndexes;
            delete generalSlicerData._filteredInfoByRange[colIndex];
            delete generalSlicerData._filteredInfoByRangeSet[colIndex];
        }
        updateFilteredRows(generalSlicerData);
    }

    function clearPreviewCore(generalSlicerData, fireEvent) {
        generalSlicerData._inPreview = false;
        generalSlicerData._filteredPreviewColumnSet = {};
        generalSlicerData._filteredPreviewRowIndexes = [];
        generalSlicerData._filteredPreviewRowMap = [];
        generalSlicerData._filteredPreviewByRangColumnSet = [];
        if (fireEvent) {
            generalSlicerData.onFiltered();
        }
    }

    var GeneralSlicerData = (function () {
        ///* class GC.Spread.Slicers.GeneralSlicerData(data: any[][], columnNames: string[])
        /**
         * Represents general slicer data.
         * @class GC.Spread.Slicers.GeneralSlicerData
         * @param {Array.<Array.<any>>} data The slicer data; it is a matrix array.
         * @param {Array} columnNames The column names of the slicer data.
         */
        function GeneralSlicerData(data, columnNames) {
            var self = this;
            self._columnsSet = {}; // [columnName] = columnIndex;    ColumnName和Index的Mapping   /* NOSONAR: CommentedCode */
            self._columnDataCache = []; // [column][row] = data;    由于二维数组都是[row][column]的，在以Column为单位进行操作的时候不方便，所以这里把数据倒置
            self._exclusiveDataCache = []; // [column][exclusiveIndex] = data;      将重复的数据合并 /* NOSONAR: CommentedCode */
            self._exclusiveDataIndex = []; // [column][data] = exclusiveIndex;      将重复的数据合并 /* NOSONAR: CommentedCode */
            self._exclusiveToFullMap = []; // [column][exclusiveIndex][index] = rowIndex;  非重复数据的Index到原始数据Index的mapping，1对多的关系
            self._fullToExclusivelMap = []; // [column][row] = exclusiveIndex;   原始数据index 到非重复数据Index 的Mapping，多对1的关系
            self._filteredInfoSet = []; // [column][exclusiveIndex] = isFiltered or undefined;   若某A列的B行可见，那么[A][B]为true
            self._filteredInfoIndexes = []; // [column][index] = exclusiveIndex;     所有列中可见Row的List /* NOSONAR: CommentedCode */
            self._filteredInfoByRangeSet = [];
            self._filteredInfoByRange = [];
            self._filteredRowMap = []; // [row] = isFiltered;     所有列Filter完了之后，可见行的Map， 若B行可见，那么[B]为true
            self._filteredRowIndexes = []; // [index] = filteredRowIndex    所有列Filter完了之后，可见行的List
            self._filteredColumns = []; // [index] = filteredColumnIndex, 所有做过 Filter 的Column
            self._filteredPreviewRowIndexes = []; // [index] = filteredRowIndex
            self._filteredPreviewRowMap = [];
            self._inPreview = false;
            self._listeners = [];
            self._suspendCount = 0;
            self._sortedColumnDataCache = []; //
            self._sorted2DataMapping = [];
            self._data2SortedMapping = [];
            self._setDataSource(data, columnNames);
            for (var row = 0; row < getLength(self.data); row++) {
                self._filteredRowMap[row] = true;
                self._filteredRowIndexes.push(row);
            }
        }

        GeneralSlicerData.prototype = {
            constructor: GeneralSlicerData,
            ///* function inPreview(): any
            /**
             * Gets whether the slicer is in the preview state.
             */
            inPreview: function () {
                return this._inPreview;
            },
            _setDataSource: function (data, columnNames) {
                var self = this;
                // data
                ///* field data: any[][]
                /**
                 * Indicates the data source for general slicer data.
                 * @type {{Array.<Array.<any>>}}
                 */
                self.data = data;
                ///* field columnNames: string[]
                /**
                 * Indicates the column names for the general slicer data.
                 * @type {Array}
                 */
                self.columnNames = columnNames;
                // data caches
                updateDataCaches(self);
            },
            ///* function onDataChanged(changedDataItems: GC.Spread.Slicers.ISlicerDataItem)
            /**
             * Changes data items in the data source of the general slicer data.
             * @param {GC.Spread.Slicers.ISlicerDataItem} changedData The changed data item in the data source.
             */
            onDataChanged: function (changedDataItems) {
                var self = this,
                    changedColumnIndexes = new Array(getLength(self.columnNames)), /* NOSONAR: ArrayAndObjectConstructors */
                    filteredInfoIndexes = self._filteredInfoIndexes,
                    exclusiveDataCache = self._exclusiveDataCache,
                    filteredInfoSet = self._filteredInfoSet,
                    columnDataCache = self._columnDataCache;

                for (var i = 0; i < getLength(changedDataItems); i++) {
                    var changedDataItem = changedDataItems[i],
                        data = changedDataItem.data,
                        row = changedDataItem.row,
                        col = self.getColumnIndex(changedDataItem.columnName);
                    self.data[row][col] = data;
                    var text = isDataItemObject(data) ? data.text : data;
                    if (columnDataCache[col]) {
                        columnDataCache[col][row] = text;
                    }
                    changedColumnIndexes[col] = true;
                }
                for (var changedCol = 0; changedCol < getLength(changedColumnIndexes); changedCol++) {
                    if (changedColumnIndexes[changedCol]) {
                        var oldFilteredIndexes = filteredInfoIndexes[changedCol];
                        filteredInfoIndexes[changedCol] = oldFilteredIndexes ? [] : undefined;
                        filteredInfoSet[changedCol] = oldFilteredIndexes ? {} : undefined;

                        var oldFiltedData = [];
                        for (i = 0; oldFilteredIndexes && i < getLength(oldFilteredIndexes); i++) {
                            oldFiltedData.push(exclusiveDataCache[changedCol][oldFilteredIndexes[i]]);
                        }
                        updateDataCache(self, changedCol);
                        for (i = 0; i < getLength(oldFiltedData); i++) {
                            var newIndex = self._exclusiveDataIndex[changedCol][oldFiltedData[i]];
                            filteredInfoIndexes[changedCol].push(newIndex);
                            filteredInfoSet[changedCol][newIndex] = true;
                        }
                    }
                }
                updateFilteredRows(self);
                self._notifyListeners(changedDataItems, 'onDataChanged');
            },
            _notifyListeners: function () {
                var paraList = arguments,
                    fnName = paraList[getLength(paraList) - 1];
                paraList.length -= 1;

                var listeners = this._listeners || [];
                for (var i = 0; i < getLength(listeners); i++) {
                    var listener = listeners[i];
                    listener[fnName] && listener[fnName].apply(listener, paraList);
                }
            },
            ///* function onColumnNameChanged(oldName: string, newName: string)
            /**
             * Changes a column name for the general slicer data.
             * @param {string} oldName The old name of the column.
             * @param {string} newName The new name of the column.
             */
            onColumnNameChanged: function (oldName, newName) {
                var self = this, columnsSet = self._columnsSet;
                var index = self.getColumnIndex(oldName);
                if (index < 0) {
                    return;
                }
                self.columnNames[index] = newName;
                delete columnsSet[oldName.toUpperCase()];
                columnsSet[newName.toUpperCase()] = index;
                self._notifyListeners(oldName, newName, 'onColumnNameChanged');
            },
            ///* function onRowsAdded(rowIndex: number, rowCount: number)
            /**
             * Adds rows in the data source of the general slicer data.
             * @param {number} rowIndex The index of the starting row.
             * @param {number} rowCount The number of rows to add.
             */
            onRowsAdded: function (rowIndex, rowCount, notNotify) {
                var self = this,
                    dataColCount = getLength(self.columnNames),
                    data = self.data,
                    columnDataCache = self._columnDataCache,
                    exclusiveDataCache = self._exclusiveDataCache,
                    exclusiveToFullMap = self._exclusiveToFullMap,
                    fullToExclusivelMap = self._fullToExclusivelMap,
                    filteredInfoSet = self._filteredInfoSet,
                    filteredInfoIndexes = self._filteredInfoIndexes,
                    filteredRowMap = self._filteredRowMap,
                    filteredRowIndexes = self._filteredRowIndexes,
                    filteredColumns = self._filteredColumns;
                self._sortedColumnDataCache = [];
                for (var i = 0; i < rowCount; i++) {
                    data.splice(rowIndex, 0, new Array(dataColCount)); // updata data /* NOSONAR: ArrayAndObjectConstructors */
                }
                for (var col = 0; col < dataColCount; col++) {
                    for (i = 0; i < rowCount; i++) {
                        columnDataCache[col] && columnDataCache[col].splice(rowIndex, 0, keyword_undefined); // updata column data cache
                    }
                    var exclusiveRowData = exclusiveDataCache[col],
                        addedDataExclusiveIndex;
                    if (exclusiveRowData) {
                        var needAddedIndexMap = keyword_null;
                        for (var exclusiveRow = 0; exclusiveRow < getLength(exclusiveRowData); exclusiveRow++) {
                            var oneRowExclusiveToFullMap = exclusiveToFullMap[col][exclusiveRow];
                            for (var index = 0; index < getLength(oneRowExclusiveToFullMap); index++) {
                                if (oneRowExclusiveToFullMap[index] >= rowIndex) {
                                    oneRowExclusiveToFullMap[index] += rowCount;
                                }
                            }
                            if (_SortHelper.isEquals(exclusiveRowData[exclusiveRow], keyword_null)) {
                                needAddedIndexMap = oneRowExclusiveToFullMap;
                                addedDataExclusiveIndex = exclusiveRow;
                            }
                        }
                        if (!needAddedIndexMap) {
                            needAddedIndexMap = [];
                            exclusiveRowData.push(keyword_null);
                            addedDataExclusiveIndex = getLength(exclusiveRowData) - 1;
                            self._exclusiveDataIndex[col][keyword_null] = addedDataExclusiveIndex;
                            exclusiveToFullMap[col].push(needAddedIndexMap);
                            if (filteredInfoSet[col] && filteredColumns.indexOf(col) === -1) {
                                filteredInfoSet[col][addedDataExclusiveIndex] = true; // ?????????????????????, ?????????? Filter ???
                                filteredInfoIndexes[col].push(addedDataExclusiveIndex);
                            }
                        }
                        for (var addedRow = rowIndex; addedRow < rowIndex + rowCount; addedRow++) {
                            needAddedIndexMap.push(addedRow);
                        }
                        for (var row = rowIndex; row < rowIndex + rowCount; row++) {
                            fullToExclusivelMap[col].splice(row, 0, addedDataExclusiveIndex);
                        }
                    }
                }
                var isAddedRowVisiable = true;
                for (i = 0; i < getLength(filteredColumns); i++) {
                    col = filteredColumns[i];
                    var exclusiveIndex = fullToExclusivelMap[col][rowIndex];
                    if (filteredInfoSet[col][exclusiveIndex] !== true) {
                        isAddedRowVisiable = false;
                    }
                }
                for (i = 0; i < getLength(filteredRowIndexes); i++) {
                    if (filteredRowIndexes[i] >= rowIndex) {
                        filteredRowIndexes[i] += rowCount;
                    }
                }
                for (row = getLength(data) - 1; row >= rowIndex + rowCount; row--) {
                    filteredRowMap[row] = filteredRowMap[row - rowCount];
                }
                var isFiltered = getLength(filteredColumns) > 0;
                for (row = rowIndex; row < rowIndex + rowCount; row++) {
                    if (isAddedRowVisiable) {
                        filteredRowIndexes.push(row);
                    }
                    filteredRowMap[row] = !isFiltered; // When there has any filtered column,the added rows will be filter out,otherwise,they will be filter in.
                }
                if (!notNotify) {
                    self._notifyListeners(rowIndex, rowCount, true, 'onRowsChanged');
                }
            },
            ///* function onRowsRemoved(rowIndex: number, rowCount: number)
            /**
             * Removes rows in the data source of the general slicer data.
             * @param {number} rowIndex The index of the starting row.
             * @param {number} rowCount The number of rows to remove.
             */
            onRowsRemoved: function (rowIndex, rowCount) {
                this._onRowsRemovedCore(rowIndex, rowCount, true);
            },
            _onRowsRemovedCore: function (rowIndex, rowCount, updateFilter) {
                var self = this,
                    filteredInfoIndexes = self._filteredInfoIndexes,
                    exclusiveDataCache = self._exclusiveDataCache,
                    filteredInfoSet = self._filteredInfoSet,
                    data = self.data,
                    dataColCount = getLength(self.columnNames),
                    columnDataCache = self._columnDataCache;
                data.splice(rowIndex, rowCount); // updata data
                for (var col = 0; col < dataColCount; col++) {
                    columnDataCache[col] && columnDataCache[col].splice(rowIndex, rowCount); // updata column data cache
                    var oldFilteredIndexes = filteredInfoIndexes[col];
                    var oldFiltedData = [];
                    if (oldFilteredIndexes && updateFilter) {
                        for (var i = 0; i < getLength(oldFilteredIndexes); i++) {
                            var oldIndexes = self.getRowIndexes(self.columnNames[col], oldFilteredIndexes[i]);
                            var needRemoved = true; // ???? filtered ? exclusive row ??????????? filtered set ???
                            for (var j = 0; j < getLength(oldIndexes); j++) {
                                if (oldIndexes[j] < rowIndex || oldIndexes[j] >= rowIndex + rowCount) {
                                    needRemoved = false;
                                    break;
                                }
                            }
                            if (!needRemoved) {
                                oldFiltedData.push(exclusiveDataCache[col][oldFilteredIndexes[i]]);
                            }
                        }
                        filteredInfoIndexes[col] = [];
                        filteredInfoSet[col] = {};
                    }
                    updateDataCache(self, col);
                    if (oldFilteredIndexes && updateFilter) {
                        for (i = 0; i < getLength(oldFiltedData); i++) {
                            var newIndex = self._exclusiveDataIndex[col][oldFiltedData[i]];
                            filteredInfoIndexes[col].push(newIndex);
                            filteredInfoSet[col][newIndex] = true;
                        }
                    }
                }
                if (updateFilter) {
                    updateFilteredRows(self);
                }
                self._notifyListeners(rowIndex, rowCount, false, 'onRowsChanged');
            },
            //onColumnsAdded: function (col, colCount) {
            //    //
            //},
            ///* function onColumnsRemoved(colIndex: number, colCount: number)
            /**
             * Removes columns of the general slicer data.
             * @param {number} colIndex The index of the starting column.
             * @param {number} colCount The number of columns to remove.
             */
            onColumnsRemoved: function (colIndex, colCount) {
                var self = this, data = self.data;
                var shouldRemoveColumnNames = [];
                var filteredColumns = self._filteredColumns;
                var endColIndex = colIndex + colCount;
                for (var i = colIndex; i < endColIndex; i++) {
                    var columnName = self.columnNames[i], columnIndex = i;
                    shouldRemoveColumnNames.push(columnName);
                    if (filteredColumns.indexOf(columnIndex) !== -1) {
                        self.doUnfilter(columnName); // The filter infomation of these columns should be clear.
                    }
                }
                var filteredInfoSet = self._filteredInfoSet || self._filteredInfoByRangeSet,
                    filteredInfoIndexes = self._filteredInfoIndexes || self._filteredInfoByRange,
                    columnsSet = self._columnsSet;
                for (i = 0; i < getLength(data); i++) {
                    data[i].splice(colIndex, colCount);
                }
                self._sortedColumnDataCache = [];
                self.columnNames.splice(colIndex, colCount);
                self._columnDataCache.splice(colIndex, colCount);
                self._exclusiveDataCache.splice(colIndex, colCount);
                self._exclusiveDataIndex.splice(colIndex, colCount);
                self._exclusiveToFullMap.splice(colIndex, colCount);
                self._fullToExclusivelMap.splice(colIndex, colCount);
                filteredInfoSet.splice(colIndex, colCount);
                filteredInfoIndexes.splice(colIndex, colCount);
                for (var item in columnsSet) {
                    if (columnsSet[item] >= colIndex + colCount) {
                        columnsSet[item] -= colCount;
                    }
                }
                for (i = 0; i < getLength(shouldRemoveColumnNames); i++) {
                    columnName = shouldRemoveColumnNames[i];
                    delete columnsSet[columnName.toUpperCase()];
                    colIndex = self.getColumnIndex(columnName);
                    var index = filteredColumns.indexOf(colIndex);
                    if (index !== -1) {
                        filteredColumns.splice(index, 1);
                    }
                    self._notifyListeners(shouldRemoveColumnNames[i], 'onColumnRemoved');
                }
            },
            _getSortedColumnDataCache: function () {
                return this._sortedColumnDataCache;
            },
            _getSorted2DataMapping: function () {
                return this._sorted2DataMapping;
            },
            _sortOneCol: function (col) {
                var self = this, data = self.data;
                if (!self._columnDataCache[col]) {
                    updateDataCache(self, col);
                }
                var rowCount = getLength(data), values = [];
                for (var row = 0; row < rowCount; row++) {
                    var dataItem = data[row][col],
                        value = isDataItemObject(dataItem) ? dataItem.value : dataItem;
                    values.push(value);
                }
                var result = _SortHelper.quickSort(values);
                var dataCache = self._sortedColumnDataCache[col] = [],
                    sorted2DataMapping = self._sorted2DataMapping[col] = [],
                    data2SortedMapping = self._data2SortedMapping[col] = [];
                for (var i = 0; i < getLength(result); i++) {
                    var item = result[i];
                    dataCache.push(item.value);
                    sorted2DataMapping.push(item.index);
                    data2SortedMapping[item.index] = i;
                }
            },
            ///* function getColumnIndex(columnName: string): number
            /**
             * Gets the column index by the specified column name.
             * @param {string} columnName The column name.
             * @returns {number} The column index.
             */
            getColumnIndex: function (columnName) {
                var colIndex = this._columnsSet[columnName.toUpperCase()];
                if (colIndex === undefined) {
                    return -1;
                }
                return colIndex;
            },
            ///* function getFilteredRowIndexes(): number[]
            /**
             * Gets the filtered row indexes.
             * @returns {Array} The filtered row indexes.
             */
            getFilteredRowIndexes: function () {
                var self = this;
                return self._inPreview ? self._filteredPreviewRowIndexes : self._filteredRowIndexes;
            },
            ///* function getFilteredOutRowIndexes(): number[]
            /**
             * Gets the filtered out row indexes.
             * @returns {Array} The filtered out row indexes.
             */
            getFilteredOutRowIndexes: function () {
                var self = this;
                var rowCount = getLength(self.data);
                var filteredMap = self._inPreview ? self._filteredPreviewRowMap : self._filteredRowMap;
                var result = [];
                for (var i = 0; i < rowCount; i++) {
                    if (!filteredMap[i]) {
                        result.push(i);
                    }
                }
                return result;
            },
            ///* function getData(columnName: string, range?: GC.Spread.Slicers.ISlicerRangeConditional): any[]
            /**
             * Gets the data by the specified column name.
             * @param {string} columnName The column name.
             * @param {object} range The specific range.
             * range.min: number type, the minimum value.
             * range.max: number type, the maximum value.
             * @returns {Array} The data that corresponds to the specified column name.
             */
            getData: function (columnName, range) {
                var self = this, columnDataCache = self._columnDataCache;
                var colIndex = self.getColumnIndex(columnName);
                if (colIndex >= 0) {
                    if (range) {
                        if (!self._sortedColumnDataCache[colIndex]) {
                            self._sortOneCol(colIndex);
                        }
                        var columnDataTexts = columnDataCache[colIndex],
                            sortedData = self._sortedColumnDataCache[colIndex];
                        var startEnd = self._getStartEndIndex(sortedData, range);
                        var start = startEnd.start;
                        var end = startEnd.end,
                            result = [];
                        for (var i = start; i <= end; i++) {
                            result.push(columnDataTexts[self._sorted2DataMapping[colIndex][i]]);
                        }
                        return result;
                    } else if (!columnDataCache[colIndex]) {
                        updateDataCache(self, colIndex);
                    }
                    return columnDataCache[colIndex];
                }
                return [];
            },
            ///* function aggregateData(columnName: string, aggregateType: GC.Spread.Slicers.SlicerAggregateType, range?: GC.Spread.Slicers.ISlicerRangeConditional): number
            /**
             * Aggregates the data by the specified column name.
             * @param {string} columnName The column name.
             * @param {GC.Spread.Slicers.SlicerAggregateType} aggregateType The aggregate type.
             * @param {object} range The specific range.
             * range.min: number type, the minimum value.
             * range.max: number type, the maximum value.
             * @returns {number} The aggregated data.
             */
            aggregateData: function (columnName, aggregateType, range) {
                var self = this,
                    col = self.getColumnIndex(columnName),
                    start,
                    end;
                if (col < 0) {
                    return keyword_undefined;
                }
                if (!self._sortedColumnDataCache[col]) {
                    self._sortOneCol(col);
                }
                var sortedData = self._sortedColumnDataCache[col],
                    dataCount = getLength(sortedData);
                var startEnd = self._getStartEndIndex(sortedData, range);
                start = startEnd.start;
                end = startEnd.end;
                if (aggregateType === 5 /* min */
                ) {
                    return start >= dataCount ? keyword_undefined : sortedData[start];
                } else if (aggregateType === 4 /* max */
                ) {
                    return end < 0 ? keyword_undefined : sortedData[end];
                } else if (aggregateType === 3 /* counta */
                ) {
                    return end < start ? 0 : end - start + 1;
                }
                var option = self._calcSpecialData(sortedData, aggregateType, start, end);
                var data1 = option.data1, data2 = option.data2, data3 = option.data3;
                if (aggregateType === 1 /* average */
                ) {
                    data1 = data1 / data2;
                } else if (aggregateType === 7 /* stdev */ ||
                    aggregateType === 10 /* vars */
                ) {
                    data1 = (data3 * data2 - data1 * data1) / (data3 * (data3 - 1.0));
                    data1 = aggregateType === 7 /* stdev */
                        ? Math.sqrt(data1) : data1;
                } else if (aggregateType === 8 /* stdevp */ ||
                    aggregateType === 11 /* varp */
                ) {
                    data1 = (data3 * data2 - data1 * data1) / (data3 * data3);
                    data1 = aggregateType === 8 /* stdevp */
                        ? Math.sqrt(data1) : data1;
                }
                return data1;
            },
            _calcSpecialData: function (sortedData, aggregateType, start, end) {
                var data1 = aggregateType === 6 ? 1 : 0, data2 = 0, data3 = 0;
                for (var index = start; index <= end; index++) {
                    var itemValue = sortedData[index];
                    if (itemValue === keyword_null && itemValue === keyword_undefined) {
                        continue;
                    }
                    var item = {
                        value: keyword_null
                    };
                    if (tryToNumber(itemValue, item)) {
                        itemValue = item.value;
                        if (aggregateType === 1 /* average */
                        ) {
                            data1 += itemValue;
                            data2++;
                        } else if (aggregateType === 2 /* count */
                        ) {
                            data1++;
                        } else if (aggregateType === 9 /* sum */
                        ) {
                            data1 += itemValue;
                        } else if (aggregateType === 6 /* product */
                        ) {
                            data1 *= itemValue;
                        } else if (aggregateType === 7 /* stdev */ ||
                            aggregateType === 8 /* stdevp */ ||
                            aggregateType === 10 /* vars */ ||
                            aggregateType === 11 /* varp */
                        ) {
                            data1 += itemValue;
                            data2 += itemValue * itemValue;
                            data3++;
                        }
                    }
                }
                return {data1: data1, data2: data2, data3: data3};
            },
            _getStartEndIndex: function (sortedData, range) {
                var dataCount = getLength(sortedData),
                    start,
                    end;
                if (range) {
                    if (range.min === -Infinity) {
                        start = 0;
                    } else {
                        for (var i = 0; i < dataCount; i++) {
                            var item = sortedData[i];
                            if (_SortHelper.isEquals(range.min, item) || _SortHelper.isGreaterThan(item, range.min)) {
                                start = i;
                                break;
                            }
                        }
                    }
                    if (start === keyword_undefined) {
                        start = dataCount;
                    }
                    if (end === Infinity) {
                        end = dataCount - 1;
                    } else {
                        for (i = dataCount - 1; i >= 0; i--) {
                            item = sortedData[i];
                            if (_SortHelper.isEquals(item, range.max) || _SortHelper.isGreaterThan(range.max, item)) {
                                end = i;
                                break;
                            }
                        }
                        if (end === keyword_undefined) {
                            end = -1;
                        }
                    }
                } else {
                    start = 0;
                    end = dataCount - 1;
                }
                return {
                    start: start,
                    end: end
                };
            },
            ///* function getExclusiveData(columnName: string): any[]
            /**
             * Gets the exclusive data by the specified column name.
             * @param {string} columnName The column name.
             * @returns {Array} The exclusive data that corresponds to the specified column name.
             */
            getExclusiveData: function (columnName) {
                var self = this, exclusiveDataCache = self._exclusiveDataCache,
                    colIndex = self.getColumnIndex(columnName);
                if (colIndex >= 0) {
                    if (!exclusiveDataCache[colIndex]) {
                        updateDataCache(self, colIndex);
                    }
                    return exclusiveDataCache[colIndex];
                }
                return [];
            },
            ///* function getRowIndexes(columnName: string, exclusiveRowIndex: number): number[]
            /**
             * Gets the data indexes by the specified column name and exclusive data index.
             * @param {string} columnName The column name.
             * @param {number} exclusiveRowIndex The index of the exclusive data.
             * @returns {Array} The data indexes that correspond to the specified column name and exclusive data index.
             */
            getRowIndexes: function (columnName, exclusiveRowIndex) {
                var self = this, colIndex = self.getColumnIndex(columnName);
                if (colIndex >= 0) {
                    if (!self._fullToExclusivelMap[colIndex]) {
                        updateDataCache(self, colIndex);
                    }
                    return self._exclusiveToFullMap[colIndex][exclusiveRowIndex];
                }
                return [];
            },
            ///* function getExclusiveRowIndex(columnName: string, rowIndex: number): number
            /**
             * Gets the exclusive data index by the specified column name and data index.
             * @param {string} columnName The column name.
             * @param {number} rowIndex The index of the data.
             * @returns {number} The exclusive data index that corresponds to the specified column name and data index.
             */
            getExclusiveRowIndex: function (columnName, rowIndex) {
                var self = this, fullToExclusivelMap = self._fullToExclusivelMap,
                    colIndex = self.getColumnIndex(columnName);
                if (colIndex >= 0) {
                    if (!fullToExclusivelMap[colIndex]) {
                        updateDataCache(self, colIndex);
                    }
                    return fullToExclusivelMap[colIndex][rowIndex];
                }
                return -1;
            },
            ///* function getFilteredIndexes(columnName: string): number[]
            /**
             * Gets the filtered exclusive data indexes by the specified column name.
             * @param {string} columnName The column name.
             * @returns {Array} The filtered exclusive data indexes that correspond to the specified column name.
             */
            getFilteredIndexes: function (columnName) {
                var exclusiveIndexes = [],
                    exclusiveSet = {};
                this._getFilteredExclusiveIndexes(columnName, exclusiveIndexes, exclusiveSet);
                return exclusiveIndexes;
            },
            _getFilteredExclusiveIndexes: function (columnName, exclusiveIndexes, exclusiveSet) {
                var self = this,
                    filteredRowIndexes = self._inPreview ? self._filteredPreviewRowIndexes : self._filteredRowIndexes;
                for (var i = 0; i < getLength(filteredRowIndexes); i++) {
                    var rowIndex = filteredRowIndexes[i];
                    var exclusiveIndex = self.getExclusiveRowIndex(columnName, rowIndex);
                    if (!exclusiveSet[exclusiveIndex]) {
                        exclusiveSet[exclusiveIndex] = 1;
                        exclusiveIndexes.push(exclusiveIndex);
                    } else {
                        exclusiveSet[exclusiveIndex]++;
                    }
                }
            },
            ///* function getFilteredRanges(columnName: string): GC.Spread.Slicers.ISlicerRangeConditional[]
            /**
             * Gets the filtered ranges by the specified column name.
             * @param {string} columnName The column name.
             * @returns {Array} The filtered ranges that correspond to the specified column name.
             */
            getFilteredRanges: function (columnName) {
                return getFilteredInfos(this, columnName, false);
            },
            ///* function getFilteredOutRanges(columnName: string): GC.Spread.Slicers.ISlicerRangeConditional[]
            /**
             * Gets the filtered out ranges by other columns.
             * @param {string} columnName The column name.
             * @returns {Array} The filtered out ranges by other columns that correspond to the specified column name.
             */
            getFilteredOutRanges: function (columnName) {
                return getFilteredInfos(this, columnName, true);
            },
            ///* function getFilteredOutIndexes(columnName: string, filteredOutDataType: FilteredOutDataType): number[]
            /**
             * Gets the filtered out exclusive data indexes by the specified column name.
             * @param {string} columnName The column name.
             * @param {GC.Spread.Slicers.FilteredOutDataType} filteredOutDataType Indicates the kind of filtered out exclusive data index that should be included in the result.
             * @returns {Array} The filtered out exclusive data indexes that correspond to the specified column name.
             */
            getFilteredOutIndexes: function (columnName, filteredOutDataType) {
                var self = this;
                if (filteredOutDataType === 0 /* all */
                ) {
                    return getAllFilteredOutExclusiveRowIndexes(self, columnName);
                } else if (filteredOutDataType === 1 /* byCurrentColumn */
                ) {
                    return getFilteredOutExclusiveRowIndexesBySelf(self, columnName);
                }
                return getFilteredOutExclusiveRowIndexesByOther(self, columnName);
            },
            ///* function attachListener(listener: GC.Spread.Slicers.ISlicerListener)
            /**
             * Attaches the listener.
             * @param {GC.Spread.Slicers.ISlicerListener} listener The listener.
             */
            attachListener: function (listener) {
                this._listeners.push(listener);
            },
            ///* function detachListener(listener: GC.Spread.Slicers.ISlicerListener)
            /**
             * Detaches the listener.
             * @param {GC.Spread.Slicers.ISlicerListener} listener The listener.
             */
            detachListener: function (listener) {
                var listeners = this._listeners || [];
                for (var i = 0; i < getLength(listeners); i++) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            },
            ///* function suspendFilteredEvents
            /**
             * Suspends the onFiltered event.
             */
            suspendFilteredEvents: function () {
                this._suspendCount++;
            },
            ///* function resumeFilteredEvents
            /**
             * Resumes the onFiltered event.
             */
            resumeFilteredEvents: function () {
                var self = this;
                self._suspendCount--;
                if (self._suspendCount === 0) {
                    self.onFiltered();
                }
            },
            ///* function doFilter(columnName: string, conditional: GC.Spread.Slicers.ISlicerConditional, isPreview?: boolean)
            /**
             * Filters the data that corresponds to the specified column name and exclusive data indexes.
             * @param {string} columnName The column name.
             * @param {object} conditional The conditional filter.
             * conditional.exclusiveRowIndexes: number array type, visible exclusive row indexes
             * conditional.ranges: {min:number, max:number} array type, visible ranges.
             * @param {boolean} isPreview Indicates whether preview is set.
             */
            doFilter: function (columnName, conditional, isPreview) {
                this._doFilterInternal(columnName, conditional, isPreview);
                this.onFiltered();
            },
            _doFilterInternal: function (columnName, conditional, isPreview) {
                var self = this, filteredColumns = self._filteredColumns;
                var colIndex = self.getColumnIndex(columnName);
                if (colIndex < 0) {
                    return;
                }
                if (isPreview) {
                    self._inPreview = true;
                    self._previewCol = colIndex;
                } else if (self._inPreview) {
                    clearPreviewCore(self, false);
                }
                if (filteredColumns.indexOf(colIndex) < 0) {
                    filteredColumns.push(colIndex);
                }
                if (conditional.ranges) {
                    doFilterByRange(self, columnName, conditional.ranges, isPreview);
                } else {
                    doFilterByIndexes(self, columnName, conditional.exclusiveRowIndexes, isPreview);
                }
            },
            ///* function clearPreview
            /**
             * Clears the preview filter state.
             */
            clearPreview: function () {
                clearPreviewCore(this, true);
            },
            ///* function doUnfilter(columnName: string)
            /**
             * Unfilters the data that corresponds to the specified column name.
             * @param {string} columnName The column name.
             */
            doUnfilter: function (columnName) {
                this._doUnfilterInternal(columnName);
                this.onFiltered();
            },
            _doUnfilterInternal: function (columnName) {
                var self = this;
                if (self._inPreview) {
                    clearPreviewCore(self, false);
                }
                var colIndex = self.getColumnIndex(columnName);
                if (colIndex < 0) {
                    return;
                }
                delete self._filteredInfoByRange[colIndex];
                delete self._filteredInfoByRangeSet[colIndex];
                delete self._filteredInfoSet[colIndex];
                delete self._filteredInfoIndexes[colIndex];
                updateFilteredRows(self);
                var index = self._filteredColumns.indexOf(colIndex);
                if (index >= 0) {
                    self._filteredColumns.splice(index, 1);
                }
            },
            ///* function onFiltered
            /**
             * Occurs after the slicer data has been filtered.
             * @param {Array} filteredIndexes The filtered exclusive data indexes.
             * @param {boolean} isPreview Indicates whether the slicer is in preview mode.
             */
            onFiltered: function () {
                var self = this;
                if (self._suspendCount === 0) {
                    self._notifyListeners({
                        rowIndexes: self.getFilteredRowIndexes(),
                        isPreview: self._inPreview
                    }, 'onFiltered');
                }
            },
            getListener: function () {
                return this._listeners;
            }
        };
        return GeneralSlicerData;
    })();

    function isNullOrUndefined(value) {
        return value === keyword_null || value === keyword_undefined;
    }

    function getType(value) {
        return typeof value;
    }

    function getLength(arr) {
        return arr ? arr.length : 0;
    }

    ///* interface GC.Spread.Slicers.ISlicerDataItem
    /**
     columnName: string;
     rowIndex: number;
     data: any;
     */

    ///* interface GC.Spread.Slicers.ISlicerListener
    /**
     onFiltered(data: ISlicerFiltedData): void;
     onDataChanged(data: ISlicerDataItem[]): void;
     onRowsChanged(rowIndex: number, rowCount: number, isAdd: boolean): void;
     onColumnNameChanged(oldName: string, newName: string): void;
     onColumnRemoved(columnName: string): void;
     */

    ///* interface GC.Spread.Slicers.ISlicerData
    /**
     getColumnIndex(columnName: string): number;
     getData(columnName: string, range?: ISlicerRangeConditional): any[];
     getExclusiveData(columnName: string): any[];
     getRowIndexes(columnName: string, exclusiveRowIndex: number): number[];
     getExclusiveRowIndex(columnName: string, rowIndex: number): number;

     getFilteredIndexes(columnName: string, isPreview?: boolean): number[];
     getFilteredOutIndexes(columnName: string, filteredOutDataType: GC.Spread.Slicers.FilteredOutDataType, isPreview?: boolean): number[];

     getFilteredRanges(columnName: string): ISlicerRangeConditional[];
     getFilteredOutRanges(columnName: string): ISlicerRangeConditional[];

     attachListener(listener: ISlicerListener): void;
     detachListener(listener: ISlicerListener): void;

     doFilter(columnName: string, slicerConditional: ISlicerConditional, isPreview?: boolean): void;
     doUnfilter(columnName: string): void;
     clearPreview():void;
     */

    ///* interface GC.Spread.Slicers.ISlicerFiltedData
    /**
     isPreview: boolean;
     rowIndexes: number[];
     */

    ///* interface GC.Spread.Slicers.ISlicerRangeConditional
    /**
     min: number;
     max: number;
     */

    ///* interface GC.Spread.Slicers.ISlicerConditional
    /**
     exclusiveRowIndexes?: number[];
     ranges?: ISlicerRangeConditional[];
     */

    module.exports = {
        FilteredOutDataType: FilteredOutDataType,
        SlicerAggregateType: SlicerAggregateType,
        GeneralSlicerData: GeneralSlicerData,
        _SortHelper: _SortHelper
    };


}());