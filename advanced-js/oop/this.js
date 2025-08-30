// good example of left side dot call
// because we are using obj. obj becomes this
// but if we just called whatIsThis(), we would get the window
function whatIsThis() {
  console.log("The value of this is: ", this);
}

const obj = {
  color: "purple",
  age: 2,
  whatIsThis,
};

obj.whatIsThis();

// another good example of this acting different
const person = {
  name: "Conan",
  city: "Los Angeles",
  sing: function () {
    console.log("This is: ", this);
    return `${this.name} sings LA LA LA`;
  },
};

console.log(`person this: ${person.sing()}`); // because it is person., person is the this value

// but if we get a reference such as
const s = person.sing;

console.log(`Window.this: ${s()}`); // this is undefined because s is defined in global, so this is actually window.s()

// here is how we can test this now.  So this.name doesn't exists but lets define one for node env.
// global.name = "james";

// now when we call s() we should get james for name

// console.log(`global.this: ${s()}`); // because we added global.name above this now sees james for name

/*
  call, apply, bind 

  - Sometimes, you'll need to say "call this function on this object"
*/

class Cat {
  constructor(firstName) {
    this.firstName = firstName;
  }

  static getRandomCat() {
    console.log(`This is: ${this}`);
  }

  dance(style = "tango") {
    console.log(`This is dance this: ${this}`);
    return `Meow, I am ${this.firstName} and I like to ${style}`;
  }
}

const manny = new Cat("Manny");
console.log({ manny });

// call
manny.dance(); // works
const mannyDance = manny.dance;
// mannyDance(); // this errors because this is undefined

// but if we use .call to give it a this(manny), it will call on manny as this or whatever we pass in

console.log(mannyDance.call(manny)); // this now work son manny
// you can also pass arguments to call so we can do
console.log(mannyDance.call(manny, "Salsa"));

// regular object
const conan = {
  name: "Conan",
  city: "Los Angeles",
  sing: function () {
    console.log(`This is: ${this}`);
    return `${this.name} sings LA LA LA`;
  },
};

const lisa = {
  name: "Lisa",
  city: "Los Angeles",
};

// this is an example of .call with different this
console.log(conan.sing());
console.log(conan.sing.call(lisa)); // we have now tied the conan method to us lisa as this
