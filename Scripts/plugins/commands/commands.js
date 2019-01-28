(function() {
    'use strict';

    var exports = {};
    ///* enum GC.Spread.Commands.Key
    /**
     * Represents the key code.
     * @enum {number}
     * @example
     * //This example creates a custom action using the enter key.
     * var activeSheet = spread.getActiveSheet();
     * spread.commandManager().register('myCmd',
     *                 function ColorAction() {
     *                     //Click on a cell and press the Enter key.
     *                     activeSheet.getCell(activeSheet.getActiveRowIndex(), activeSheet.getActiveColumnIndex()).backColor("red");
     *                 }
     *             );
     * //Map the created action to the Enter key.
     * spread.commandManager().setShortcutKey('myCmd', GC.Spread.Commands.Key.enter, false, false, false, false);
     */
    exports.Key = {
        /**
         * Indicates the left arrow key.
         */
        left: 37,
        /**
         * Indicates the right arrow key.
         */
        right: 39,
        /**
         * Indicates the up arrow key.
         */
        up: 38,
        /**
         * Indicates the down arrow key.
         */
        down: 40,
        /**
         * Indicates the Tab key.
         */
        tab: 9,
        /**
         * Indicates the Enter key.
         */
        enter: 13,
        /**
         * Indicates the Shift key.
         */
        shift: 16,
        /**
         * Indicates the Ctrl key.
         */
        ctrl: 17,
        /**
         * Indicates the space key.
         */
        space: 32,
        /**
         * Indicates the Alt key.
         */
        altkey: 18,
        /**
         * Indicates the Home key.
         */
        home: 36,
        /**
         * Indicates the End key.
         */
        end: 35,
        /**
         * Indicates the Page Up key.
         */
        pup: 33,
        /**
         * Indicates the Page Down key.
         */
        pdn: 34,
        /**
         * Indicates the Backspace key.
         */
        backspace: 8,
        /**
         * Indicates the Delete key.
         */
        del: 46,
        /**
         * Indicates the Esc key.
         */
        esc: 27,
        /**
         * Indicates the A key
         */
        a: 65,
        /**
         * Indicates the C key.
         */
        c: 67,
        /**
         * Indicates the V key.
         */
        v: 86,
        /**
         * Indicates the X key.
         */
        x: 88,
        /**
         * Indicates the Z key.
         */
        z: 90,
        /**
         * Indicates the Y key.
         */
        y: 89
    };
    
    function Command(owner, cmdDef, name) {
        var self = this;
        self._owner = owner;
        self._cmdDef = cmdDef;
        self._name = name;
    
        Object.defineProperty(self, 'shortcutKey', {
            get: function () {
                return self._shortcutKey;
            },
            set: function (value) {
                var key = self._shortcutKey;
                if (key !== value) {
                    var shortcutKeys = self._owner._shortcutKeys;
                    var actions = shortcutKeys[key];
                    if (actions) {
                        var n = actions.indexOf(self);
                        if (n >= 0) {
                            actions.splice(n, 1);
                        }
                    }
    
                    self._shortcutKey = value;
    
                    if (value) {
                        actions = shortcutKeys[value];
                        if (!actions) {
                            shortcutKeys[value] = actions = [];
                        }
                        actions.splice(0, 0, self);
                    }
                }
            }
        });
    }
    
    Command.prototype = {
        canUndo: function () {
            var cmd = this._cmdDef;
            return cmd.canUndo;
        },
        // context: the execute context --- for Sheets that is workbook
        execute: function (context, options, actionType) {
            var self = this, success = true;
            try {
                // can return an undo command or result.
                var fn = self._cmdDef.execute || self._cmdDef;
                var ret = fn(context, options, actionType === 1 /*undo*/);
                success = (ret !== false);
            } catch (e) {
                success = false;
            }
    
            if (options && success) {
                self._owner._commandExecuted({command: options, result: ret, _actionType: actionType});
            }
    
            return ret;
        }
    };
    
    // The CommandManager manages commands.
    //
    // The CommandManager has internal keymap that manages key assignments for commands.
    // The CommandManager keymap will give priority to newly added keys by the features, if one shortcutkey has different commands.
    ///* class GC.Spread.Commands.CommandManager(context: Object)
    /**
     * Represents a command manager.
     * @class
     * @param {Object} context The execution context for all commands in the command manager.
     * @constructor
     */
    function CommandManager(context) {
        var self = this;
        self._context = context;
        self._listeners = {};
        self._shortcutKeys = {};
    }
    
    CommandManager.prototype = {
        ///* function register(name: string, command: Object, key?: number|GC.Spread.Commands.Key, ctrl?: boolean, shift?: boolean, alt?: boolean, meta?: boolean): void
        /**
         * Registers a command with the command manager.
         * @param {string} name - The name of the command.
         * @param {Object} command - The object that defines the command.
         * @param {number|GC.Spread.Commands.Key} key - The key code.
         * @param {boolean} ctrl - <c>true</c> if the command uses the Ctrl key; otherwise, <c>false</c>.
         * @param {boolean} shift - <c>true</c> if the command uses the Shift key; otherwise, <c>false</c>.
         * @param {boolean} alt - <c>true</c> if the command uses the Alt key; otherwise, <c>false</c>.
         * @param {boolean} meta - <c>true</c> if the command uses the Command key on the Macintosh or the Windows key on Microsoft Windows; otherwise, <c>false</c>.
         * @example
         * //For example, the following code registers the changeBackColor command and then executes the command.
         *  var command = {
         *       canUndo: true,
                 execute: function (context, options, isUndo) {
                            var Commands = GC.Spread.Sheets.Commands;
                         if (isUndo) {
                             Commands.undoTransaction(context, options);
                             return true;
                         } else {
                             Commands.startTransaction(context, options);
                             var sheet = context.getSheetFromName(options.sheetName);
                             var cell = sheet.getCell(options.row, options.col);
                             cell.backColor(options.backColor);
                             Commands.endTransaction(context, options);
                            return true;
                       }
                   }
              };
         *  var spread = GC.Spread.Sheets.findControl(document.getElementById("ss"));
         *  var commandManager = spread.commandManager();
         *  commandManager.register("changeBackColor", command);
         *  commandManager.execute({cmd: "changeBackColor", sheetName: spread.getSheet(0).name(), row: 1, col: 2, backColor: "red"});
         */
        register: function (name, command, key, ctrl, shift, alt, meta) {
            var self = this;
            var cmd = new Command(self, command, name);
            self[name] = cmd;
    
            if (key) {
                cmd.shortcutKey = self.getShortcutKey(key, ctrl, shift, alt, meta);
            }
        },
        //internal API, use for designer
        getCommand: function (name) {
            return this[name];
        },
        ///* function execute(commandOptions: Object): any
        /**
         * Executes a command and adds the command to UndoManager.
         * @param {Object} commandOptions The options for the command.
         * @param {string} commandOptions.cmd The command name, the field is required.
         * @param {Object} [commandOptions.arg1] The command argument, the name and type are decided by the command definition.
         * @param {Object} [commandOptions.arg2] The command argument, the name and type are decided by the command definition.
         * @param {Object} [commandOptions.argN] The command argument, the name and type are decided by the command definition.
         * @returns {string} The execute command result.
         * @example
         * //For example, the following code executes the autoFitColumn command.
         * var spread = GC.Spread.Sheets.findControl(document.getElementById("ss"));
         * spread.commandManager().execute({cmd: "autoFitColumn", sheetName: "Sheet1", columns: [{col: 1}], rowHeader: false, autoFitType: GC.Spread.Sheets.AutoFitType.cell});
         */
        execute: function (commandOptions) {
            var cmd = this[commandOptions.cmd];
            if (cmd) {
                return cmd.execute(this._context, commandOptions, 0 /*doAction*/);
            }
        },
        ///* function setShortcutKey(commandName: string, key?: number|GC.Spread.Commands.Key, ctrl?: boolean, shift?: boolean, alt?: boolean, meta?: boolean): void
        /**
         * Binds a shortcut key to a command.
         * @param {string} commandName The command name, setting commandName to undefined removes the bound command of the shortcut key.
         * @param {number|GC.Spread.Commands.Key} key The key code, setting the key code to undefined removes the shortcut key of the command.
         * @param {boolean} ctrl <c>true</c> if the command uses the Ctrl key; otherwise, <c>false</c>.
         * @param {boolean} shift <c>true</c> if the command uses the Shift key; otherwise, <c>false</c>.
         * @param {boolean} alt <c>true</c> if the command uses the Alt key; otherwise, <c>false</c>.
         * @param {boolean} meta <c>true</c> if the command uses the Command key on the Macintosh or the Windows key on Microsoft Windows; otherwise, <c>false</c>.
         * @example
         * //This example changes the behavior of default keys.
         * var activeSheet = spread.getActiveSheet();
         * //Change the default Up arrow key action to "Page Up" for the active cell.
         * spread.commandManager().setShortcutKey('navigationPageUp', GC.Spread.Commands.Key.up, false, false, false, false);
         * //Change the default Down arrow key action to "Page Down" for the active cell.
         * spread.commandManager().setShortcutKey('navigationPageDown', GC.Spread.Commands.Key.down, false, false, false, false);
         */
        setShortcutKey: function (commandName, key, ctrl, shift, alt, meta) {
            var self = this;
            if (commandName) { // set or remove specified command's shortcutKey
                var cmd = self[commandName];
                if (cmd) {
                    cmd.shortcutKey = self.getShortcutKey(key, ctrl, shift, alt, meta);
                }
            } else { // remove specified shortcutKey
                var shortcutKey = self.getShortcutKey(key, ctrl, shift, alt, meta);
                var cmds = self.getCommands(shortcutKey);
                if (cmds) {
                    for (var i = cmds.length - 1; i >= 0; i--) {
                        cmds[i].shortcutKey = void 0;
                    }
                }
            }
        },
        getShortcutKey: function (key, ctrl, shift, alt, meta) {
            if (!key) {
                return undefined;
            }
            var t = ('A'.charCodeAt(0) <= key && key <= 'Z'.charCodeAt(0)) ? String.fromCharCode(key) : exports.Key[key];
            if (!t) {
                t = key;
            }
            return '' + t + (ctrl ? '+ctrl' : '') + (shift ? '+shift' : '') + (alt ? '+alt' : '') + (meta ? '+window' : '');
        },
        getCommands: function (shortcutKey) {
            return this._shortcutKeys[shortcutKey];
        },
        ///**
        // * Adds a listener to the CommandManager. The listener is called when the command is executed.
        // * @param {string} name The name that identifies the listener.
        // * @param {function} action The listener to be added.
        // */
        addListener: function (name, action) {
            this._listeners[name] = action;
        },
        ///**
        // * Removes the listener from the CommandManager.
        // * @param {string} name The name that identifies the listener.
        // */
        removeListener: function (name) {
            delete this._listeners[name];
        },
        _commandExecuted: function (arg) {
            var listeners = this._listeners;
            for (var t in listeners) {
                if (listeners.hasOwnProperty(t)) {
                    listeners[t](arg);
                }
            }
        }
    };
    exports.CommandManager = CommandManager;
    module.exports = exports;

}());