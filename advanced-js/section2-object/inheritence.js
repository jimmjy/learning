// Original class
class Triangle {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  getArea() {
    return (this.a * this.b) / 2;
  }

  getHypotenuse() {
    return Math.sqrt(this.a ** 2 + this.b ** 2);
  }

  describe() {
    return `I am a triangle with the area of ${this.getArea()}`;
  }
}

class ShyTriangle {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  static name = "billy";

  getArea() {
    return (this.a * this.b) / 2;
  }

  getHypotenuse() {
    return Math.sqrt(this.a ** 2 + this.b ** 2);
  }

  describe() {
    return "I run and hide";
  }

  describeAgain() {
    console.log(ShyTriangle.name);
    return this.name;
  }

  static getName() {
    console.log("The this object", this);
    return this;
  }
}

const billy = new ShyTriangle(4, 5);
console.log({ billy, name: ShyTriangle.name });
billy.describeAgain();
ShyTriangle.getName();

const testing = ShyTriangle.getName();
