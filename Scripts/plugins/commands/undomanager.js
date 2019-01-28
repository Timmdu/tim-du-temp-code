(function () {
    'use strict';

    // var ActionType = { /* NOSONAR: CommentedCode" */
    //     doAction: 0,
    //     undo: 1,         // Represent an action executed from undo stack.
    //     redo: 2          // Represent an action executed from redo stack.
    // };

    ///* class GC.Spread.Commands.UndoManager()
    /**
     * Represents the undo manager.
     * @constructor
     */
    function UndoManager(context, maxLength, allowUndo) {
        var self = this;
        self._context = context;
        if (maxLength < 0) {
            maxLength = 2147483647; // max value of 32bits int
        }
        self._maxLength = maxLength;
        self._allowUndo = allowUndo;

        self._undoStack = [];
        self._redoStack = [];
    }

    UndoManager.prototype = {
        _addCommand: function (command, actionType) {
            var self = this;
            if (!command) {
                return;
            }
            if (actionType === 1 /*undo*/) {
                self._redoStack.push(command);
            } else {
                var maxLength = self._maxLength, undoStackLength = self._undoStack.length;
                if (maxLength > 0 && undoStackLength >= maxLength) {
                    for (var i = 0; i < undoStackLength - maxLength + 1; i++) {
                        self._undoStack.shift();
                    }
                }
                self._undoStack.push(command);
                if (actionType === 0 /*doAction*/) {
                    self._redoStack = [];
                }
            }
        },
        ///* function canUndo(): boolean
        /**
         * Gets whether the undo operation is allowed.
         * @returns {boolean} <c>true</c> if the undo operation is allowed; otherwise, <c>false</c>.
         */
        canUndo: function () {
            return this._undoStack.length > 0;
        },
        ///* function undo(): boolean
        /**
         * Undoes the last command.
         * @returns {boolean} <c>true</c> if the undo operation is successful; otherwise, <c>false</c>.
         */
        undo: function () {
            var self = this, undoStack = self._undoStack;
            var result = true;
            if (self._allowUndo && self.canUndo()) {
                var undoAction = undoStack[undoStack.length - 1];
                try {
                    var cmd = self._context.commandManager()[undoAction.cmd];
                    if (cmd) {
                        undoAction._fromUndoManager = true;
                        result = cmd.execute(self._context, undoAction, 1 /*undo*/);
                    }
                } catch (e) {
                    result = false;
                }
                delete undoAction._fromUndoManager;
                if (result !== false) {
                    undoStack.pop();
                    self._redoStack.push(undoAction);
                }
            }
            return result;
        },
        ///* function canRedo(): boolean
        /**
         * Gets whether the redo operation is allowed.
         * @returns {boolean} <c>true</c> if the redo operation is allowed; otherwise, <c>false</c>.
         */
        canRedo: function () {
            return this._redoStack.length > 0;
        },
        ///* function redo(): boolean
        /**
         * Redoes the last command.
         * @returns {boolean} <c>true</c> if the redo operation is successful; otherwise, <c>false</c>.
         */
        redo: function () {
            var self = this, redoStack = self._redoStack;
            var result = true;
            if (self._allowUndo && self.canRedo()) {
                var redoAction = redoStack[redoStack.length - 1];
                try {
                    var cmd = self._context.commandManager()[redoAction.cmd];
                    if (cmd) {
                        var backupChanges = redoAction._changes;
                        redoAction._fromUndoManager = true;
                        result = cmd.execute(self._context, redoAction, 2 /*redo*/);
                        if (backupChanges && redoAction._changes && !redoAction._changes.calc) {
                            redoAction._changes = backupChanges;
                        }
                    }
                } catch (e) {
                    result = false;
                }
                delete redoAction._fromUndoManager;
                if (result !== false) {
                    redoStack.pop();
                    self._undoStack.push(redoAction);
                }
            }
            return result;
        },
        ///* function clear(): void
        /**
         * Clears all of the undo stack and the redo stack.
         */
        clear: function () {
            this._undoStack = [];
            this._redoStack = [];
        }
    };
    module.exports.UndoManager = UndoManager;

}());