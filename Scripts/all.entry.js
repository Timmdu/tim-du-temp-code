(function() {
    'use strict';

    exports.Common = require('./common/common.entry');
    exports.Commands = require('./plugins/commands/commands.entry');
    exports.Formatter = require('./plugins/formatter/formatter.entry');
    exports.Sparklines = require('./plugins/sparkline/sparkline.entry');
    exports.Slicers = require('./plugins/slicer/slicer.entry');

}());