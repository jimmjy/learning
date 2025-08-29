class CatWithStaticProp {
  constructor(name) {
    this.name = name;
  }

  // called a class attribute in other languages typically
  // good example of a static property --
  // all instances of cats are the same species;
  // it doesn't vary from one cat to another
  // this is tied to class not instances so called on CatWithStaticProp
  static genusSpecies = "feline catus";

  describe() {
    return `${this.name} is a ${CatWithStaticProp.genusSpecies}`;
  }

  // can also do static methods
  // has to be called on a class not instance
  static meow() {
    return "MEOW MEOW MEOW!!!";
  }
}

console.log(CatWithStaticProp.genusSpecies);

// use cases for static methods
/*
  We might want to group functionality together, such as an api finder 
  We might want to use them to create instances for us, like @classmethod in python
*/
