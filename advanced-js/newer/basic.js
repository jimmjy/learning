/*
  Newerer array methods and conditionals
*/

// array.at(index) - can also process -1 whereas regular arrays cannot

const colors = ["red", "green", "blue", "orange"];

console.log(colors.at(-1));

// string.replaceAll()
// current .replace only replaces the first match.
// replace is a return and does not modify the inial string

const phrase =
  "I really love cats. My cat is such an amazing pet.  She loves to cuddle with me and play";

const updated = phrase.replace("cat", "dog");

console.log(`Orig: ${phrase}, mod: ${updated}`);

const allUpdated = phrase.replaceAll("cat", "dog");

console.log(`allUpdated: ${allUpdated}`);

/*
  &&= means if value is truthy, then update it to value on the right.
  - This seems like it could most be useful to update object values.
  e.g. Checking if the user is logged in,
  loggedInUser &&= {...loggedInUser, colorPreference: 'purple'} - this allows us to update the user with more info

  Another that could be ??= cares about null or undefined.

  array.from() is a good method to use as it can take a second argument, a callback function tath can action on each value
*/
// creating arrays with array.from()

const array_ten = Array.from({ length: 5 }, (value, index) => {
  console.log({ value, index });
  return index * 10;
});
console.log({ array_ten });
