module('vongole', {
  setup: function () {

  },
  teardown: function () {

  }
});

var BEFORE_STEP = 2,
  AFTER_STEP = 4;

function checkResult(result, arr) {
  equal(result, arr.reduce(function (pv, cv) {
    return pv + cv;
  }));
}

test('define step', function () {

  var result = 0;

  beforeEachStep(function () {
    result += BEFORE_STEP;
  });

  afterEachStep(function () {
    result += AFTER_STEP;
  });

  step('test', function () {

  });

  run();

  checkResult(result, [BEFORE_STEP, AFTER_STEP]);

});