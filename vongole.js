/*!
 * Vongole - JavaScript Demoing Framework
 * 
 * Copyright 2012 Ohgyun Ahn
 * MIT Licensed
 * https://github.com/ohgyun/vongole/
 */
(function (g) {
 
  var v = g.vongole = {
      version: '0.1.1',
      handler: {},
      steps: [],
      debug: false
    },
  
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
  
  g.step = function (title, def) {
    var step = {
      title: title || '',
      items: []
    };
    v.steps.push(step);
    _step = step;
    
    def();
  };
  
  g.item = function (title, def) {
    !_step && error('item() should be called in step definition');
    
    var item = {
      title: title || ''
    };
    _step.items.push(item);
    _item = item;
    
    def();
  };
  
  g.code = function (f) {
    defineItemMethod('code', f);
  };
  
  g.debug = function (f) {
    defineItemMethod('debug', f);
  };
  
  g.ninja = function (f) {
    defineItemMethod('ninja', f);
  };
  
  function defineItemMethod(name, f) {
    !_item && error('{0}() should be called in item definition', name);
    _item[name] = f;
  }
  
  g.run = function (idx) {
    _cursor = idx || _cursor;
    _step = v.steps[_cursor];
    
    !_step && error('step with index {0} does not exist', _cursor);
    
    _step.before && _step.before();
    
    v.handler.onRun && v.handler.onRun(_step);
  };
  
  g.prevStep = function () {
    moveStep(function () {
      _cursor--;
    });
  };
  
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
  
  g.reset = function () {
    _step = null;
    _item = null;
    _cursor = 0;
  };
  
  g.runItem = function (idx) {
    _item = _step.items[idx];
    
    !_item && error('item with index {0} does not exist', idx);
    
    _item.ret = _item.code && _item.code();
    v.debug && _item.debug && _item.debug.call(_item);
    _item.ninja && _item.ninja.call(_item);
    
    v.handler.onRunItem && v.handler.onRunItem(_item);
  };
  
  g.before = function (f) {
    !_step && error('before() should be called in step definition');
    _step.before = f;
  };
  
  g.after = function (f) {
    !_step && error('after() should be called in step definition');
    _step.after = f;
  };
  
}(this));
