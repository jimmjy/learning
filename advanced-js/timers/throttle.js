/**
  Throttling:
  - used to make sure a function is called one time within a certain duration
  - debounce ensures that a function is only executed after a specified delay has 
    passed since the last time it was invoked.  If the function is called again  
    within that delay, the timer is reset, and the function's execution 
    is postponed until the event ceases for the defined period. this is dependent
    on the previous event time occurring.
  - Throtttling on the other hand, ensures that a function is executed at most once 
    within a specified time interval.  It limits the rate at which a function can be called,
    regardless of how frequently the event triggers it.
 */
console.log("from throttle");
