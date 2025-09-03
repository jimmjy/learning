/*
  Imperative programming:
  - is all about describing how a program operates by using code to actually manipulate the state

  e.g. 
  let sum = 0
  for (let i = 1; i <= 5; i++){
  sum += i
  }

  Functional programming:
  - Is all about figuring out what needs to be solved without mutating and using pure functions
  [1,2,3,4,5].reduce((acc, val) => acc + val, 0)
  the above has no state or anything we are mutating, it just gives us back a value and we 
  don't know how it works
*/

const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// imperative approach to get evens
const evens = [];
for (let num of nums) {
  if (num % 2 == 0) {
    evens.push(num);
  }
}

console.log(evens);

// functional approach
nums.filter((num) => num % 2 == 0);
