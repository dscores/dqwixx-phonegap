riot.tag2('app', '<div class="container-fluid {finished: state.finished}"> <div each="{state.colors}" class="row {color}"> <button each="{numbers}" ontouchstart="{clickNumber}" onclick="{clickNumber}" class="btn {skipped: skipped, marked: marked, disabled: last && !lockable}"> <span class="{hidden: marked}">{number}</span> <span class="glyphicon glyphicon-remove {hidden: !marked}"></span> </button> <button ontouchstart="{clickLock}" onclick="{clickLock}" class="btn lock {locked: locked}"> <span class="glyphicon glyphicon-lock {hidden: locked}"></span> <span class="glyphicon glyphicon-remove {hidden: !locked}"></span> </button> </div> <div class="row fails"> <button each="{state.fails.fails}" ontouchstart="{clickFail}" onclick="{clickFail}" class="btn {failed: failed}"> <span class="glyphicon glyphicon-ban-circle {hidden: failed}"></span> <span class="glyphicon glyphicon-remove {hidden: !failed}"></span> </button> </div> <div class="row results"> <button each="{state.colors}" class="btn {color}">+ {points}</button> <button class="btn fails">- {state.fails.points}</button> <button class="btn total">= {state.points}</button> <button class="btn btn-info refresh" ontouchstart="{clickRefresh}" onclick="{clickRefresh}"><span class="glyphicon glyphicon-refresh"></span></button> </div> </div>', '', '', function(opts) {
'use strict';

(function () {
  function generateColor(color, order) {
    color = { color: color, order: order, numbers: [], lockable: false, closed: false, points: 0 };
    if (order === 'asc') {
      var number;
      for (number = 2; number <= 12; ++number) {
        color.numbers.push({ color: color, number: number, marked: false, skipped: false, last: number === 12 });
      }
    }
    if (order === 'desc') {
      for (number = 12; number >= 2; --number) {
        color.numbers.push({ color: color, number: number, marked: false, skipped: false, last: number === 2 });
      }
    }
    return color;
  }

  function refresh(state) {
    state.colors = [generateColor('red', 'asc'), generateColor('yellow', 'asc'), generateColor('green', 'desc'), generateColor('blue', 'desc')];
    state.fails = {
        fails: [{ failed: false }, { failed: false }, { failed: false }, { failed: false }],
        points: 0
    };
    state.points = 0;
    state.finished = false;
  }

  function calcColorPoints(color) {
    var marked = color.numbers.filter(function (number) { return number.marked }).length;
    var numbers = color.numbers;
    var last = numbers[numbers.length - 1];
    if (marked > 5 && last.marked && color.locked) {
      ++marked;
    }
    color.points = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78][marked];
  }

  function determineLockable(color) {
    var marked = color.numbers.filter(function (number) { return number.marked }).length;
    color.lockable = marked >= 5;
  }

  function calcFailPoints(state) {
    var fails = state.fails;
    var failed = fails.fails.filter(function (fail) { return fail.failed }).length;
    fails.points = failed * 5;
  }

  function calcTotalPoints(state) {
    var points = state.colors
        .map(function (color) { return color.points })
        .reduce(function (pointsA, pointsB) { return pointsA + pointsB }, 0);
    points -= state.fails.points;
    state.points = points;
  }

  function determineFinished(state) {
    var locked = state.colors.filter(function (color) { return color.locked }).length;
    var failed = state.fails.fails.filter(function (fail) { return fail.failed }).length;
    state.finished = locked >= 2 || failed >= 4;
  }

  function markNumber(number) {
    number.marked = true;
    number.skipped = false;
    var color = number.color;
    if (number.last && !color.locked) {
      lockColor(color);
    } else {
      var numbers = color.numbers;
      for (var i = 0; i < numbers.length; ++i) {
        if (numbers[i].number === number.number) {
          break;
        }
        numbers[i].skipped = !numbers[i].marked;
      }
    }
  }

  function unmarkNumber(number) {
    number.marked = false;
    var color = number.color;
    if (number.last && color.locked) {
      unlockColor(color);
    } else {
      var numbers = color.numbers;
      var last = numbers[10];
      var marked = numbers.filter(function (number) { return number.marked }).length;
      if (last.marked && marked <= 5) {
        unmarkNumber(last);
      }
      for (var i = numbers.length - 1; i >= 0; --i) {
        if (numbers[i].marked) {
          if ((color.order === 'asc' && numbers[i].number > number.number)
              || (color.order === 'desc' && numbers[i].number < number.number)) {
            number.skipped = true;
          }
          break;
        }
        numbers[i].skipped = color.locked;
      }
    }
  }

  function lockColor(color) {
    color.locked = true;
    var numbers = color.numbers;
    for (var i = 0; i < numbers.length; ++i) {
      var number = numbers[i];
      number.skipped = !number.marked;
    }
  }

  function unlockColor(color) {
    color.locked = false;
    var numbers = color.numbers;
    var last = numbers[numbers.length - 1];
    if (last.marked) {
      unmarkNumber(last);
    } else {
      for (var i = numbers.length - 1; i >= 0; --i) {
        if (numbers[i].marked) {
          break;
        }
        numbers[i].skipped = false;
      }
    }
  }

  var dqwixx = { state: {} };

  dqwixx.clickNumber = function (number) {
    var color = number.color;
    if (number.last && !color.lockable) {
      return;
    }
    if (number.marked) {
      unmarkNumber(number);
    } else {
      markNumber(number);
    }
    calcColorPoints(color);
    determineLockable(color);
    calcTotalPoints(dqwixx.state);
    if (number.last) {
      determineFinished(dqwixx.state);
    }
  };

  dqwixx.clickLock = function (color) {
    if (color.locked) {
      unlockColor(color);
    } else {
      lockColor(color);
    }
    calcColorPoints(color);
    determineLockable(color);
    calcTotalPoints(dqwixx.state);
    determineFinished(dqwixx.state);
  };

  dqwixx.clickFail = function (fail) {
    fail.failed = !fail.failed;
    calcFailPoints(dqwixx.state);
    calcTotalPoints(dqwixx.state);
    determineFinished(dqwixx.state);
  };

  dqwixx.clickRefresh = function () {
    refresh(dqwixx.state);
  };

  window.dqwixx = dqwixx;
})();

  this.state = dqwixx.state;

  dqwixx.clickRefresh();

  this.clickRefresh = function () { dqwixx.clickRefresh(); };
  this.clickNumber = function (e) { dqwixx.clickNumber(e.item); };
  this.clickLock = function (e) { dqwixx.clickLock(e.item); };
  this.clickFail = function (e) { dqwixx.clickFail(e.item); };
});
