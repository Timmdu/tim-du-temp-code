(function() {
    'use strict';

    var exports = {};
    _CopyProperty(exports, require('./formatter.js'));
    exports.SR = {};
    exports.SR['en'] = require('./formatter.res.en.js');
    module.exports = exports;
    
    function _CopyProperty(to, from) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop)) {
                to[prop] = from[prop];
            }
        }
    }

}());