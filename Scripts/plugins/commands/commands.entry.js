(function() {
    'use strict';

    var exports = {};
    _CopyProperty(exports, require('./commands.js'));
    _CopyProperty(exports, require('./undomanager.js'));
    module.exports = exports;
    
    function _CopyProperty(to, from) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop)) {
                to[prop] = from[prop];
            }
        }
    }

}());