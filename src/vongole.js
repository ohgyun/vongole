(function (g) {

  'use strict';

  var EMPTY_STR = '',
    EMPTY_FUNC = function () { return EMPTY_STR; };

  var v = g.vongole = {
      title: EMPTY_STR,
      debug: false,
      beforeEachItem: EMPTY_FUNC,
      afterEachItem: EMPTY_FUNC,
      beforeEachStep: EMPTY_FUNC,
      afterEachStep: EMPTY_FUNC
    },

    // all steps
    _steps = [],

    // event handlers  
    _handlers = {},

    // current focused
    _step = null,
    _item = null,
    _cursor = 0;

  // throw error 
  // usage: error('error {0} {1}', 'foo', 'bar');
  function error(str) {
    var regexp = /(\{(\d)\})/;

    while (regexp.test(str)) {
      str = str.replace(regexp, arguments[+RegExp.$2 + 1]);
    }

    throw '[vongole] ' + str;
  }

  /**
   * Define a title of the demo.
   *
   * @param {String} title
   */
  g.title = function (title) {
    v.title = title;
  };

  /**
   * Define a step.
   *
   * @param {String} title Title of step
   * @param {Function} def Definition of step
   */
  g.step = function (title, def) {
    var step = {
      title: title || EMPTY_STR,
      items: [],
      before: EMPTY_FUNC,
      after: EMPTY_FUNC,
      beforeEachItem: EMPTY_FUNC,
      afterEachItem: EMPTY_FUNC
    };
    _steps.push(step);
    _step = step;

    def();

    _step = null;
  };

  /**
   * Define a item in step.
   *
   * @param {String} title Title of item
   * @param {Function} def Definition of item
   */
  g.item = function (title, def) {
    if ( ! step) error('item() should be called in step definition');

    var item = {
      title: title || EMPTY_STR,
      desc: EMPTY_FUNC,
      code: EMPTY_FUNC,
      debug: EMPTY_FUNC,
      ninja: EMPTY_FUNC,
      before: EMPTY_FUNC,
      after: EMPTY_FUNC
    };
    _step.items.push(item);
    _item = item;

    def();

    _item = null;
  };

  /**
   * Define description of item.
   *
   * @param {Function} f
   */
  g.desc = function (f) {
    defineItemMethod('desc', f);
  };

  /**
   * Define execution code of item.
   *
   * @param {Function} f
   */
  g.code = function (f) {
    defineItemMethod('code', f);
  };

  /**
   * Define code for debugging.
   * This code would be run after execution code of item,
   * only `vongole.debug` value is true.
   *
   * @param {Function} f
   */
  g.debug = function (f) {
    defineItemMethod('debug', f);
  };

  /**
   * Define code to execute sliently, after execution code of item.
   *
   * @param {Function} f
   */
  g.ninja = function (f) {
    defineItemMethod('ninja', f);
  };

  // define item method
  // @param {String} name Function name
  // @param {Function} f
  function defineItemMethod(name, f) {
    if ( ! _item) {
      error('{0}(handler) should be called in item definition', name);
    }

    if (typeof f !== 'function') {
      error('{0}(handler) should have a function parameter', name);
    }

    _item[name] = f;
  }

  /**
   * Run a step.
   *
   * @param {Number} [idx] Index of step. (default = 0)
   */
  g.run = function (idx) {
    if (_item) {
      // after hook
      _item.after();
      _step.afterEachItem();
      v.afterEachItem();
      _item = null;
    }

    if (_step) {
      // after hook
      _step.after();
      v.afterEachStep();
    }

    _cursor = isNaN(idx) ? _cursor : idx;
    _step = _steps[_cursor];

    if ( ! _step) error('step with index {0} does not exist', _cursor);

    // before hook
    v.beforeEachStep();
    _step.before();

    trigger('run', _step);
  };

  /**
   * Run previous step.
   */
  g.prevStep = function () {
    moveStep(function () {
      _cursor--;
    });
  };

  /**
   * Run next step.
   */
  g.nextStep = function () {
    moveStep(function () {
      _cursor++;
    });
  };

  function moveStep(f) {
    f();
    g.run();
  }

  /**
   * Run a item in step.
   *
   * @param {Number} idx Index of item
   */
  g.runItem = function (idx) {
    if (_item) {
      // after hook
      _item.after();
      _step.afterEachItem();
      v.afterEachItem();
    }

    _item = _step.items[idx];

    if ( ! _item) {
      error('item with index {0} does not exist', idx);
    }

    // before hook
    v.beforeEachItem();
    _step.beforeEachItem();
    _item.before();

    // run item
    _item.description = _item.desc.call(_item);
    _item.result = _item.code.call(_item);
    if (v.debug) { _item.debug.call(_item); }
    _item.ninja.call(_item);

    trigger('runItem', _item);
  };

  /**
   * Define code to execute before running step or item.
   *
   * @param {Function} f
   */
  g.before = function (f) {
    if (_item) {
      _item.before = f;
      return;
    }
    if (_step) {
      _step.before = f;
      return;
    }

    error('before() should be called in step or item definition');
  };

  /**
   * Define code to execute after running step or item.
   *
   * @param {Function} f
   */
  g.after = function (f) {
    if (_item) {
      _item.after = f;
      return;
    }

    if (_step) {
      _step.after = f;
      return;
    }

    error('after() should be called in step or item definition');
  };

  /**
   * Define code to execute before running EACH item.
   *
   * @param {Function} f
   */
  g.beforeEachItem = function (f) {
    if (_item) {
      error('{0}() cannot be called in item definition', 'beforeEachItem');
    }

    if (_step) {
      _step.beforeEachItem = f;
      return;
    }

    v.beforeEachItem = f;
  };

  /**
   * Define code to execute after running EACH item.
   *
   * @param {Function} f
   */
  g.afterEachItem = function (f) {
    if (_item) {
      error('{0}() cannot be called in item definition', 'afterEachItem');
    }

    if (_step) {
      _step.afterEachItem = f;
      return;
    }

    v.afterEachItem = f;
  };

  /**
   * Define code to execute before running EACH step.
   *
   * @param {Function} f
   */
  g.beforeEachStep = function (f) {
    if (_step || _item) {
      error('{0}() should be called out of step definition', 'beforeEachStep');
    }
    v.beforeEachStep = f;
  };

  /**
   * Define code to execute after running EACH step.
   *
   * @param {Function} f
   */
  g.afterEachStep = function (f) {
    if (_step || _item) {
      error('{0}() should be called out of step definition', 'afterEachStep');
    }
    v.afterEachStep = f;
  };

  // get status of current step
  g.getStatus = function () {
    var len = _steps.length,
      isFirst = _cursor === 0,
      isLast = _cursor === len - 1;

    return {
      total: len,
      current: _cursor,
      isSingle: len === 1,
      isFirst: isFirst,
      isLast: isLast,
      hasNext: !isLast && len > 1,
      hasPrev: !isFirst && len > 1
    };
  };

  /**
   * Reset demo.
   */
  g.reset = function () {
    _step = null;
    _item = null;
    _cursor = 0;
  };

  // register events
  v.on = function (key, handler) {
    handlers(key).push(handler);
    return this;
  };

  // get handlers
  function handlers(key) {
    var hs = _handlers[key] = (_handlers[key] || []);
    return hs;
  }

  // trigger event
  function trigger(key/*, data, data, ... */) {
    var hs = handlers(key),
      i = 0,
      len = hs.length,
      args = Array.prototype.slice.call(arguments, 1);

    for (; i < len; i++) {
      hs[i].apply(v, args);
    }
  }


}(this));
