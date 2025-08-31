/**
 * Public and Private fields are more related to instances.

 They are similar to static but the static sticks with the class vs instances

 Private instance class fields provide a way to maintain encapsulation and 
 not allow external access.

 The syntax looks like:
 #privateField = "Private Field" es2021 maybe
 */

export class Cat {
  static numOfCats = 0;
  numLegs = 4; // this is a public field and sticks with instance

  constructor(name) {
    this.name = name;
    Cat.numOfCats += 1;
  }
}

console.log(Cat.numOfCats, Cat.numLegs);

// private things
class Circle {
  #radius;
  constructor(radius) {
    this.#radius = radius;
  }

  get radius() {
    return this.#radius;
  }

  set radius(value) {
    // validate input first
    this.#radius = value;
  }
}

const circle = new Circle(4);

console.log(`Circle: ${circle.radius}`);

// static initialization blocks
class DatabaseConnection {
  static connection;
  static {
    this.connection = {}; // logic normally before this
  }

  static loadProductionConnection() {
    // do stuff
  }
}

const connection = new DatabaseConnection();

console.log(connection);
