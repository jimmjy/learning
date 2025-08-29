// plain old object
let o1 = {};

let o2 = new Object(); // same as above creation

o1.name = "Whisky";
o1["name"] = "whiskyOne"; // two different ways to set but the same

o2.name = "OtherWhiskey";

const pet = { species: "Dog", name: "Elton", age: 1.5 };
console.log(typeof pet);

// properties that don't exist, you get undefined
// bracket notation is good for using expressions, which just means using a variable that should equal a key inside the object so x = 'species' pet[x]
// keys will always be stringified

// interesting example with this in object creation from other properties
let myTri = {
  a: 3,
  b: 4,
  getArea() {
    // function directly
    return (this.a + this.b) / 2;
  },
  getHypotenuse: function () {
    // function assigned
    return Math.sqrt(this.a ** 2 + this.b ** 2);
  },
};

console.log(myTri.a);
console.log("getarea", myTri.getArea());

myTri.a = 10;
console.log("gethyp", myTri.getHypotenuse());
