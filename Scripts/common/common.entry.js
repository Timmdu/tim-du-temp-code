(function() {
    'use strict';

    var common = require('./util/common.js');
    require('./util/colorhelper.js');
    var culture = require('./culture/cultureInfo.js');
    _CopyProperty(common, culture);
    var functionHelper = require('./util/functionhelper.js');
    _CopyProperty(common, functionHelper);

    common._Types = require('./util/types.js');
    common._ArrayHelper = require('./util/arrayhelper.js');
    common._DateTimeHelper = require('./util/datetimehelper.js');
    common._NumberHelper = require('./util/numberhelper.js');
    common._RegexHelper = require('./util/regexhelper.js');
    common._StringHelper = require('./util/stringhelper.js');

    common.SR = {};
    common.SR['en'] = require('./util/util.res.en.js');


    module.exports = common;

    function _CopyProperty (to, from) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop)) {
                to[prop] = from[prop];
            }
        }
    }

}());