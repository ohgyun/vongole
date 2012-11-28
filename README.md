## What is Vongole?
Vongole is a JavaScript Demoing Framework.  

When you've done your JavaScript library or module, you may want to show a demonstration on how to use.  
Using Vongole, you can give a step-by-step guide to how it works.


## Usage

1. Set up demo codes.

````js
step('Step 1', function () {

  before(function () {
    // code called before running a step
  });

  item('Item A', function () {
   
    code(function () {
      // execution code of item A
    });
    
    debug(function () {
      // [optional] code for debugging
    });
    
    ninja(function () {
      // [optional] code to execute silently after running itme
    });
    
  });
  
  item('Item B', function () {
    code(function () {});
    debug(function () {});
    ninja(function () {});
  });
  
  after(function () {
    // code called after running a step
  });

});

step('Step 2', function () {
  before(function () {});
  item('Item 2A', ... );
  item('Item 2B', ... );
  after(function () {});
});

````

2. Run demo using run() methods.

````js
run(); // run first step

run(2); // run third step (index of 2)

runItem(0): // run item with index 0 of current step
````