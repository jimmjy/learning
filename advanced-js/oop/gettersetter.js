class Circle {
  constructor(radius) {
    this._radius = radius;
  }

  // Getter for the diameter
  // a good reason to use a getter is in case the radius changes, this gets it
  // in realtime.
  get diameter() {
    return this._radius * 2;
  }

  set radius(value) {
    if (value < 0) {
      throw new Error("Radius cannot be negative");
    } else {
      this._radius = value;
    }
  }
}

const circle = new Circle(5);

/**

To use a getter, you just add the dot property 

to use a setter, you use an equals vs calling it with something.
e.g. for set radius above,
circle.radius = #
 */
console.log(`Diameter: ${circle.diameter}`);

class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this._fullName = `${this.firstName} ${this.lastName}`;
  }

  get fullName() {
    return this._fullName;
  }

  set fullName(name) {
    const [first, last] = name.split(" ");
    this.firstName = first;
    this.lastName = last;
    this._fullName = name;
  }
}

const james = new Person("James", "Finkelstein");
console.log(james);
console.log(james.fullName);
james.fullName = "Ted Lasso";
console.log(james);
