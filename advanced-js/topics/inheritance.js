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
    return `I am a triangle with area of ${this.getArea()}`;
  }
}

class ShyTriangle extends Triangle {
  describe() {
    // polymorphism
    return "(runs and hides)";
  }
}

console.log(ShyTriangle);

class ColorTriangle extends Triangle {
  constructor(a, b, color) {
    // call parent constructor w/(a,b)
    super(a, b);
    this.color = color;
  }

  // 'inherits' getArea, getHypotenuse
  // 'override' describe() w/new version

  describe() {
    return super.describe() + ` and my color is ${this.color}!`;
  }
}

const color = new ColorTriangle(12, 3, "red");
console.log(color);
console.log(color.describe());
