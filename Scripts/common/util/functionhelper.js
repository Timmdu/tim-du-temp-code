(function() {
    'use strict';

    var isNaNFunc = isNaN;
    var common = {};
    var ROW_COUNT = 'rowCount', COLUMN_COUNT = 'colCount';
    function getNumber(value) {
        return value;
    }
    function _getTrendOrGrowthData(isTrend, knownY, knownX, newX, constant, convertFunc, concreteArray, errorNotAvailable, errorValue, logFunc, expFunc) { /* NOSONAR: FunctionComplexity ExcessiveParameterList */
        var i, j, k, x, y, mm, nn, d, result, s, val, L, temp, found, oneMoreKnownXColCount, twoMoreKnownXColCount,
            knownX_rowCount = knownX[ROW_COUNT], knownX_colCount = knownX[COLUMN_COUNT],
            knownY_rowCount = knownY[ROW_COUNT], knownY_colCount = knownY[COLUMN_COUNT],
            newX_rowCount = newX[ROW_COUNT], newX_colCount = newX[COLUMN_COUNT],
            isOneKnownXColCount = knownX_colCount === 1, isOneKnownYColCount = knownY_colCount === 1;
        if (knownY_rowCount === knownX_rowCount && knownY_colCount === knownX_colCount) {
            var sumx = 0.0, sumx2 = 0.0, sumy = 0.0, sumxy = 0.0;
            nn = knownX_rowCount * knownX_colCount;
            for (i = 0; i < knownX_rowCount; i++) {
                for (j = 0; j < knownX_colCount; j++) {
                    x = convertFunc(knownX[i][j]);
                    y = convertFunc(knownY[i][j]);
                    if (isTrend && (isNaNFunc(x) || isNaNFunc(y))) {
                        return errorValue;
                    }
                    y = logFunc(y);
                    sumx += x;
                    sumx2 += x * x;
                    sumy += y;
                    sumxy += x * y;
                }
            }
            var sumMM = nn * sumxy - sumx * sumy;
            mm = constant ? sumMM / (nn * sumx2 - sumx * sumx) : sumxy / sumx2;
            d = constant ? (sumy * sumx2 - sumx * sumxy) / (nn * sumx2 - sumx * sumx) : 0.0;
            result = [];
            for (i = 0; i < newX_rowCount; i++) {
                result[i] = [];
                for (j = 0; j < newX_colCount; j++) {
                    x = convertFunc(newX[i][j]);
                    if (isTrend && isNaNFunc(x)) {
                        return errorValue;
                    }
                    result[i][j] = sumMM === 0 ? knownY[0][0] : expFunc(mm * x + d);
                }
            }
            return concreteArray ? new concreteArray(result) : result;
        } else if ((isOneKnownYColCount && knownY_rowCount === knownX_rowCount) || (knownY_rowCount === 1 && knownY_colCount === knownX_colCount)) {
            x = [];
            y = [];
            oneMoreKnownXColCount = knownX_colCount + 1;
            twoMoreKnownXColCount = knownX_colCount + 2;
            for (i = 0; i < knownX_rowCount; i++) {
                val = isOneKnownYColCount ? knownY[i][0] : knownY[0][i];
                d = convertFunc(val);
                if (isTrend && isNaNFunc(d)) {
                    return errorValue;
                }
                y[i] = isOneKnownXColCount ? logFunc(d) : d;
            }
            for (i = 0; i < knownX_rowCount; i++) {
                x[i] = [];
                for (j = 0; j < knownX_colCount; j++) {
                    d = convertFunc(knownX[i][j]);
                    if (isTrend && isNaNFunc(d)) {
                        return errorValue;
                    }
                    x[i][j] = d;
                }
            }
            var q = [];
            for (mm = 0; mm < oneMoreKnownXColCount; mm++) {
                q[mm] = [];
                for (nn = 0; nn < twoMoreKnownXColCount; nn++) {
                    q[mm][nn] = 0;
                }
            }
            for (k = 0; k < knownX_rowCount; k++) {
                q[0][oneMoreKnownXColCount] += y[k];
                for (i = 0; i < knownX_colCount; i++) {
                    val = i + 1;
                    q[0][val] += x[k][i];
                    q[val][0] = q[0][val];
                    q[val][oneMoreKnownXColCount] += x[k][i] * y[k];
                    for (j = i; j < knownX_colCount; j++) {
                        temp = j + 1;
                        q[temp][val] += x[k][i] * x[k][j];
                        q[val][temp] = q[temp][val];
                    }
                }
            }
            q[0][0] = knownX_rowCount;
            var start = constant ? 0 : 1;
            for (s = start; s < oneMoreKnownXColCount; s++) {
                if (isTrend) {
                    if (q[s][s] === 0.0) {
                        found = false;
                        for (j = s + 1; !found && j < oneMoreKnownXColCount; j++) {
                            if (q[j][s] !== 0.0) {
                                for (k = 0; k < twoMoreKnownXColCount; k++) {
                                    temp = q[s][k];
                                    q[s][k] = q[j][k];
                                    q[j][k] = temp;
                                }
                                found = true;
                            }
                        }
                        if (!found) {
                            return errorNotAvailable;
                        }
                    }
                } else {
                    i = s;
                    while (i < oneMoreKnownXColCount && q[i][s] === 0.0) {
                        i++;
                    }
                    if (i >= oneMoreKnownXColCount) {
                        return errorNotAvailable;
                    }
                    for (L = start; L < twoMoreKnownXColCount; L++) {
                        val = q[s][L];
                        q[s][L] = q[i][L];
                        q[i][L] = val;
                    }
                }
                val = 1.0 / q[s][s];
                for (L = start; L < twoMoreKnownXColCount; L++) {
                    q[s][L] *= val;
                }
                for (i = start; i < oneMoreKnownXColCount; i++) {
                    if (i !== s) {
                        val = -q[i][s];
                        for (L = 0; L < twoMoreKnownXColCount; L++) {
                            q[i][L] += val * q[s][L];
                        }
                    }
                }
                if (!constant) {
                    q[0][oneMoreKnownXColCount] = 0.0;
                }
            }
            result = [];
            if (!isOneKnownYColCount) {
                result[0] = [];
            }
            for (i = 0; i < newX_rowCount; i++) {
                if (isOneKnownYColCount) {
                    result[i] = [];
                }
                val = q[0][oneMoreKnownXColCount];
                for (j = 0; j < knownX_colCount; j++) {
                    d = convertFunc(isOneKnownYColCount ? newX[i][j] : newX[j][i]);
                    if (isTrend && isNaNFunc(d)) {
                        return errorValue;
                    }
                    val += q[j + 1][oneMoreKnownXColCount] * d;
                }
                if (isOneKnownYColCount) {
                    result[i][0] = expFunc(val);
                } else {
                    result[0][i] = expFunc(val);
                }
            }
            return concreteArray ? new concreteArray(result) : result;
        }
        return errorNotAvailable;
    }
    function _trend(knownY, knownX, newX, constant, convertFunc, concreteArray, errorValue, errorNotAvailable) { /* NOSONAR: ExcessiveParameterList */
        return _getTrendOrGrowthData(true, knownY, knownX, newX, constant, convertFunc, concreteArray, errorNotAvailable, errorValue, getNumber, getNumber);
    }
    function _growth(knownY, knownX, newX, constant, concreteArray, errorNumber, errorNotAvailable) {
        var i, j;
        for (i = 0; i < knownY[ROW_COUNT]; i++) {
            for (j = 0; j < knownY[COLUMN_COUNT]; j++) {
                if (knownY[i][j] <= 0.0) {
                    return errorNumber;
                }
            }
        }
        return _getTrendOrGrowthData(false, knownY, knownX, newX, constant, getNumber, concreteArray, errorNotAvailable, null, Math.log, Math.exp);
    }
    
    common._trend = _trend;
    common._growth = _growth;
    
    module.exports = common;

}());