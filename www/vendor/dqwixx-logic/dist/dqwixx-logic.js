(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Row_1 = require('./Row');
var Fail_1 = require('./Fail');
var Board = (function () {
    function Board() {
        this.rows = [];
        this.fails = [];
    }
    Board.prototype.resume = function (jsonBoard) {
        this.rows = jsonBoard.rows.map(function (row) { return (new Row_1["default"]().resume(row)); });
        this.fails = jsonBoard.fails.map(function (fail) { return (new Fail_1["default"]()).resume(fail.state); });
        return this;
    };
    Board.prototype.setRows = function (rows) {
        this.rows = rows;
    };
    Board.prototype.getRows = function () {
        return this.rows;
    };
    Board.prototype.setFails = function (fails) {
        this.fails = Array.apply({}, Array(fails)).map(function () { return new Fail_1["default"](); });
    };
    Board.prototype.getFails = function () {
        return this.fails;
    };
    Board.prototype.markNumber = function (rowIndex, numberIndex) {
        if (this.isFinished()) {
            return;
        }
        return this.rows[rowIndex].markNumber(numberIndex);
    };
    Board.prototype.closeRow = function (rowIndex) {
        if (this.isFinished()) {
            return;
        }
        this.rows[rowIndex].closeRow();
    };
    Board.prototype.failFail = function (failIndex) {
        if (this.isFinished()) {
            return;
        }
        this.fails[failIndex].failFail();
    };
    Board.prototype.getColorPoints = function (color) {
        var marked = this.getRows().map(function (row) { return row.countNumbersMarkedByColor(color); })
            .reduce(function (colorPointsA, colorPointsB) { return colorPointsA + colorPointsB; }, 0);
        var colorPoints = 0;
        for (var increase = 1; increase <= marked; ++increase) {
            colorPoints += increase;
        }
        return colorPoints;
    };
    Board.prototype.getFailPoints = function () {
        return this.countFailsFailed() * -5;
    };
    Board.prototype.getPoints = function () {
        var points = 0;
        for (var _i = 0, _a = ['red', 'yellow', 'green', 'blue']; _i < _a.length; _i++) {
            var color = _a[_i];
            points += this.getColorPoints(color);
        }
        points += this.getFailPoints();
        return points;
    };
    Board.prototype.isOpen = function () {
        return this.countRowsClosed() < 2 && this.countFailsFailed() < 4;
    };
    Board.prototype.isFinished = function () {
        return !this.isOpen();
    };
    Board.prototype.countRowsClosed = function () {
        return this.rows.filter(function (row) { return row.isRowClosed(); }).length;
    };
    Board.prototype.countFailsFailed = function () {
        return this.fails.filter(function (fail) { return fail.isFailFailed(); }).length;
    };
    return Board;
}());
exports.__esModule = true;
exports["default"] = Board;

},{"./Fail":3,"./Row":5}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Board_1 = require('./Board');
var CachedBoard = (function (_super) {
    __extends(CachedBoard, _super);
    function CachedBoard() {
        _super.apply(this, arguments);
        this.colorPoints = {};
    }
    CachedBoard.prototype.resume = function (jsonBoard) {
        _super.prototype.resume.call(this, jsonBoard);
        this.colorPoints = {};
        return this;
    };
    CachedBoard.prototype.setRows = function (rows) {
        _super.prototype.setRows.call(this, rows);
        this.colorPoints = {};
    };
    CachedBoard.prototype.markNumber = function (rowIndex, numberIndex) {
        var color = _super.prototype.markNumber.call(this, rowIndex, numberIndex);
        if (color) {
            delete this.colorPoints[color];
        }
        return color;
    };
    CachedBoard.prototype.getColorPoints = function (color) {
        if (!this.colorPoints[color]) {
            this.colorPoints[color] = _super.prototype.getColorPoints.call(this, color);
        }
        return this.colorPoints[color];
    };
    return CachedBoard;
}(Board_1["default"]));
exports.__esModule = true;
exports["default"] = CachedBoard;

},{"./Board":1}],3:[function(require,module,exports){
"use strict";
(function (FailState) {
    FailState[FailState["Open"] = 1] = "Open";
    FailState[FailState["Failed"] = 2] = "Failed";
})(exports.FailState || (exports.FailState = {}));
var FailState = exports.FailState;
var Fail = (function () {
    function Fail() {
        this.state = FailState.Open;
    }
    Fail.prototype.resume = function (state) {
        this.state = state;
        return this;
    };
    Fail.prototype.failFail = function () {
        if (!this.isFailOpen()) {
            return;
        }
        this.state = FailState.Failed;
    };
    Fail.prototype.isFailOpen = function () {
        return this.state === FailState.Open;
    };
    Fail.prototype.isFailFailed = function () {
        return this.state === FailState.Failed;
    };
    return Fail;
}());
exports.__esModule = true;
exports["default"] = Fail;

},{}],4:[function(require,module,exports){
"use strict";
(function (NumberState) {
    NumberState[NumberState["Open"] = 1] = "Open";
    NumberState[NumberState["Marked"] = 2] = "Marked";
    NumberState[NumberState["Skipped"] = 3] = "Skipped";
})(exports.NumberState || (exports.NumberState = {}));
var NumberState = exports.NumberState;
var Number = (function () {
    function Number(color, label) {
        this.state = NumberState.Open;
        this.color = color;
        this.label = label;
    }
    Number.prototype.resume = function (state) {
        this.state = state;
        return this;
    };
    Number.prototype.getColor = function () {
        return this.color;
    };
    Number.prototype.getLabel = function () {
        return this.label;
    };
    Number.prototype.markNumber = function () {
        if (!this.isNumberOpen()) {
            return;
        }
        this.state = NumberState.Marked;
        return this.getColor();
    };
    Number.prototype.skipNumber = function () {
        if (!this.isNumberOpen()) {
            return;
        }
        this.state = NumberState.Skipped;
    };
    Number.prototype.isNumberOpen = function () {
        return this.state === NumberState.Open;
    };
    Number.prototype.isNumberMarked = function () {
        return this.state === NumberState.Marked;
    };
    Number.prototype.isNumberSkipped = function () {
        return this.state === NumberState.Skipped;
    };
    return Number;
}());
exports.__esModule = true;
exports["default"] = Number;

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Number_1 = require('./Number');
var Row = (function (_super) {
    __extends(Row, _super);
    function Row() {
        _super.apply(this, arguments);
    }
    Row.prototype.resume = function (jsonRow) {
        for (var _i = 0, jsonRow_1 = jsonRow; _i < jsonRow_1.length; _i++) {
            var jsonNumber = jsonRow_1[_i];
            var number = new Number_1["default"](jsonNumber.color, jsonNumber.label);
            this.push(number.resume(jsonNumber.state));
        }
        return this;
    };
    Row.prototype.markNumber = function (numberIndex) {
        if (this.isRowClosed()) {
            return;
        }
        if (this.isNumberDisabled(numberIndex)) {
            return;
        }
        for (var i = 0; i < this.length; ++i) {
            if (i === numberIndex) {
                return this[i].markNumber();
            }
            else {
                this[i].skipNumber();
            }
        }
    };
    Row.prototype.closeRow = function () {
        if (this.isRowClosed()) {
            return;
        }
        for (var i = 0; i < this.length; ++i) {
            this[i].skipNumber();
        }
    };
    Row.prototype.isRowOpen = function () {
        return this.getLastNumber().isNumberOpen();
    };
    Row.prototype.isRowClosed = function () {
        return !this.isRowOpen();
    };
    Row.prototype.countNumbersMarkedByColor = function (color) {
        var markedNumbers = this.filter(function (number) { return number.isNumberMarked() && number.getColor() === color; }).length;
        var lastNumber = this.getLastNumber();
        if (lastNumber.isNumberMarked() && lastNumber.getColor() === color) {
            ++markedNumbers;
        }
        return markedNumbers;
    };
    Row.prototype.isNumberDisabled = function (numberIndex) {
        return this.isLastNumber(numberIndex) && this.countNumbersMarked() < 5;
    };
    Row.prototype.getLastNumber = function () {
        return this[this.length - 1];
    };
    Row.prototype.isLastNumber = function (numberIndex) {
        return this.length - 1 === numberIndex;
    };
    Row.prototype.countNumbersMarked = function () {
        return this.filter(function (number) { return number.isNumberMarked(); }).length;
    };
    return Row;
}(Array));
exports.__esModule = true;
exports["default"] = Row;

},{"./Number":4}],6:[function(require,module,exports){
"use strict";
var Number_1 = require('../logics/Number');
var Row_1 = require('../logics/Row');
function Ascending(color) {
    var row = new Row_1["default"]();
    for (var numberLabel = 2; numberLabel <= 12; ++numberLabel) {
        row.push(new Number_1["default"](color, numberLabel));
    }
    return row;
}
function Descending(color) {
    var row = new Row_1["default"]();
    for (var numberLabel = 12; numberLabel >= 2; --numberLabel) {
        row.push(new Number_1["default"](color, numberLabel));
    }
    return row;
}
function classic(board) {
    board.setRows([Ascending('red'), Ascending('yellow'), Descending('green'), Descending('blue')]);
    board.setFails(4);
    return board;
}
exports.__esModule = true;
exports["default"] = classic;

},{"../logics/Number":4,"../logics/Row":5}],7:[function(require,module,exports){
"use strict";
var Number_1 = require('../logics/Number');
var Row_1 = require('../logics/Row');
function red() {
    var row = new Row_1["default"]();
    row.push(new Number_1["default"]('yellow', 2));
    row.push(new Number_1["default"]('yellow', 3));
    row.push(new Number_1["default"]('yellow', 4));
    row.push(new Number_1["default"]('blue', 5));
    row.push(new Number_1["default"]('blue', 6));
    row.push(new Number_1["default"]('blue', 7));
    row.push(new Number_1["default"]('green', 8));
    row.push(new Number_1["default"]('green', 9));
    row.push(new Number_1["default"]('green', 10));
    row.push(new Number_1["default"]('red', 11));
    row.push(new Number_1["default"]('red', 12));
    return row;
}
function yellow() {
    var row = new Row_1["default"]();
    row.push(new Number_1["default"]('red', 2));
    row.push(new Number_1["default"]('red', 3));
    row.push(new Number_1["default"]('green', 4));
    row.push(new Number_1["default"]('green', 5));
    row.push(new Number_1["default"]('green', 6));
    row.push(new Number_1["default"]('green', 7));
    row.push(new Number_1["default"]('blue', 8));
    row.push(new Number_1["default"]('blue', 9));
    row.push(new Number_1["default"]('yellow', 10));
    row.push(new Number_1["default"]('yellow', 11));
    row.push(new Number_1["default"]('yellow', 12));
    return row;
}
function green() {
    var row = new Row_1["default"]();
    row.push(new Number_1["default"]('blue', 12));
    row.push(new Number_1["default"]('blue', 11));
    row.push(new Number_1["default"]('blue', 10));
    row.push(new Number_1["default"]('yellow', 9));
    row.push(new Number_1["default"]('yellow', 8));
    row.push(new Number_1["default"]('yellow', 7));
    row.push(new Number_1["default"]('red', 6));
    row.push(new Number_1["default"]('red', 5));
    row.push(new Number_1["default"]('red', 4));
    row.push(new Number_1["default"]('green', 3));
    row.push(new Number_1["default"]('green', 2));
    return row;
}
function blue() {
    var row = new Row_1["default"]();
    row.push(new Number_1["default"]('green', 12));
    row.push(new Number_1["default"]('green', 11));
    row.push(new Number_1["default"]('red', 10));
    row.push(new Number_1["default"]('red', 9));
    row.push(new Number_1["default"]('red', 8));
    row.push(new Number_1["default"]('red', 7));
    row.push(new Number_1["default"]('yellow', 6));
    row.push(new Number_1["default"]('yellow', 5));
    row.push(new Number_1["default"]('blue', 4));
    row.push(new Number_1["default"]('blue', 3));
    row.push(new Number_1["default"]('blue', 2));
    return row;
}
function mixedColors(board) {
    board.setRows([red(), yellow(), green(), blue()]);
    board.setFails(4);
    return board;
}
exports.__esModule = true;
exports["default"] = mixedColors;

},{"../logics/Number":4,"../logics/Row":5}],8:[function(require,module,exports){
"use strict";
var Number_1 = require('../logics/Number');
var Row_1 = require('../logics/Row');
function row(color, numberLabels) {
    var row = new Row_1["default"]();
    for (var _i = 0, numberLabels_1 = numberLabels; _i < numberLabels_1.length; _i++) {
        var numberLabel = numberLabels_1[_i];
        row.push(new Number_1["default"](color, numberLabel));
    }
    return row;
}
function red() {
    return row('red', [10, 6, 2, 8, 3, 4, 12, 5, 9, 7, 11]);
}
function yellow() {
    return row('yellow', [9, 12, 4, 6, 7, 2, 5, 8, 11, 3, 10]);
}
function green() {
    return row('green', [8, 2, 10, 12, 6, 9, 7, 4, 5, 11, 3]);
}
function blue() {
    return row('blue', [5, 7, 11, 9, 12, 3, 8, 10, 2, 6, 4]);
}
function mixedNumbers(board) {
    board.setRows([red(), yellow(), green(), blue()]);
    board.setFails(4);
    return board;
}
exports.__esModule = true;
exports["default"] = mixedNumbers;

},{"../logics/Number":4,"../logics/Row":5}],9:[function(require,module,exports){
"use strict";
var CachedBoard_1 = require('./logics/CachedBoard');
var classic_1 = require('./themes/classic');
var mixedColors_1 = require('./themes/mixedColors');
var mixedNumbers_1 = require('./themes/mixedNumbers');
var Dqwixx = { Board: CachedBoard_1["default"], themes: { classic: classic_1["default"], mixedColors: mixedColors_1["default"], mixedNumbers: mixedNumbers_1["default"] } };
window.Dqwixx = Dqwixx;

},{"./logics/CachedBoard":2,"./themes/classic":6,"./themes/mixedColors":7,"./themes/mixedNumbers":8}]},{},[9]);
