class Triangle {
  constructor(a, b) {
    // should probably do some data validation
    if (!Number.isFinite(a) || a <= 0) {
      throw new Error(`Invalid a: ${a}`);
    }

    if (!Number.isFinite(b) || b <= 0) {
      throw new Error(`Invalid a: ${b}`);
    }

    this.a = a;
    this.b = b;
  }

  getArea() {
    return (this.a * this.b) / 2;
  }

  getHypotenuse() {
    return Math.sqrt(this.a ** 2 + this.b ** 2);
  }

  sayHi() {
    return "HELLO FROM A TRIANGLE";
  }
}

const testTriangle = new Triangle(10, 20);
console.log(testTriangle);

class BankAccount {
  constructor(balance = 0, accountHolder, accountNumber) {
    this.balance = balance;
    this.accountHolder = accountHolder;
    this.accountNumber = accountNumber;
  }

  desposit(amt) {
    this.balance += amt;
  }

  withdraw(amt) {
    // should have validation here
    this.balance -= amt;
  }
}

console.log(BankAccount);
