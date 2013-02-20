/*!
 * Vongole - JavaScript Demoing Framework
 * 
 * Copyright 2012 Ohgyun Ahn
 * MIT Licensed
 * https://github.com/ohgyun/vongole/
 */
(function (g) {

  'use strict';
 
  var v = g.vongole = {
      VERSION: '0.2.0',
      title: '',
      debug: false
    },

    // all steps
    _steps = [],

    // event handlers  
    _handlers = {},

    _step = null,
    _item = null,
    _cursor = 0;
  
  function error(str) {
    var regexp = /(\{(\d)\})/;

    while (regexp.test(str)) {
      str = str.replace(regexp, arguments[+RegExp.$2 + 1]);
    }
    
    throw '[vongole] ' + str; 
  }
  
  // define title of demo
  g.title = function (title) {
    v.title = title;
  };

  // define step
  g.step = function (title, def) {
    var step = {
      title: title || '',
      items: []
    };
    _steps.push(step);
    _step = step;
    
    def();
  };
  
  // define each item in step
  g.item = function (title, def) {
    !_step && error('item() should be called in step definition');
    
    var item = {
      title: title || ''
    };
    _step.items.push(item);
    _item = item;
    
    def();
  };
  
  // define description of item
  g.desc = function (f) {
    defineItemMethod('desc', f);
  };

  // define execution code of item
  g.code = function (f) {
    defineItemMethod('code', f);
  };
  
  // define code for debugging 
  // if vongole.debug value is true,
  // this code is runned after running item
  g.debug = function (f) {
    defineItemMethod('debug', f);
  };
  
  // define code to execute silently after running item
  g.ninja = function (f) {
    defineItemMethod('ninja', f);
  };
  
  function defineItemMethod(name, f) {
    !_item && error('{0}() should be called in item definition', name);
    _item[name] = f;
  }
 
  // run step 
  g.run = function (idx) {
    _cursor = idx || _cursor;
    _step = _steps[_cursor];
    
    !_step && error('step with index {0} does not exist', _cursor);
    
    _step.before && _step.before();
    
    trigger('run', _step);
  };

  // run previous step
  g.prevStep = function () {
    moveStep(function () {
      _cursor--;
    });
  };
  
  // run next step
  g.nextStep = function () {
    moveStep(function () {
      _cursor++;
    });
  };
  
  function moveStep(f) {
    _step && _step.after && _step.after();
    f();
    g.run();
  }
  
  // reset demo
  g.reset = function () {
    _step = null;
    _item = null;
    _cursor = 0;
  };
  
  // run item
  g.runItem = function (idx) {
    _item = _step.items[idx];
    
    !_item && error('item with index {0} does not exist', idx);
   
    _item.description = _item.desc && _item.desc.call(_item); 
    _item.result = _item.code && _item.code.call(_item);
    v.debug && _item.debug && _item.debug.call(_item);
    _item.ninja && _item.ninja.call(_item);
    
    trigger('runItem', _item);
  };
  
  // define code to execute before running each step
  g.before = function (f) {
    !_step && error('before() should be called in step definition');
    _step.before = f;
  };
  
  // define code to execute after running each step
  g.after = function (f) {
    !_step && error('after() should be called in step definition');
    _step.after = f;
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
