// settimeout runs a callback after a delay in milliseconds
setTimeout(() => {
  console.log("Times up after");
}, 2000);

// function showNotification(message, duration) {
//
// }

// const testObj = {
//   name: "james",
//   age: 20,
//   getName: function () {
//     return this.name;
//   },
// };

// debounce: adding a pause before some function runs.  This is to
// control performance and reduce unnecessary things

// let debounceTime;
//   () => {
//   // debouncedQuery();
//   // clearTimeout(debounceTime);
//   // // console.log(event); - this gets the event when passed as argument
//   // debounceTime = setTimeout(() => {
//   //   fakeQueryRequest();
//   // }, 1000);
// });

/*
  debouncing: ensures that a function is executed only after a certain 
  period of inactivity following a series of rapid events.

  Mechanism: When an event fires, a timer is set. If the same event  
  fires again before the timer expires, the timer is reset. 
  The function only executes when the timer successfully 
  completes without being reset

  throttling: this is sort of the opposite in terms of how it works, 
  but it limits how many times an action will get triggered, ensuring 
  the event only gets triggered once during a specific interval regardless 
  of how many times it is triggered.

  Mechanism: When an event fires, the function is executed immediately
  (or after an initial delay), and a cooldown period begins. Subsequent
  event triggers during this cooldown period are ignored. The function 
  can only execute again once the cooldown period has passed.
*/
