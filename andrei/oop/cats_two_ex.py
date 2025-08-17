class Pets:
    animals = []

    def __init__(self, animals) -> None:
        self.animals = animals

    def walk(self):
        for animal in self.animals:
            print(animal.walk())


class Cat:
    is_lazy = True

    def __init__(self, name, age) -> None:
        self.name = name
        self.age = age

    def walk(self):
        return f"{self.name} is just walking around"


class Simon(Cat):
    def sing(self, sounds):
        return f"{sounds}"


class Sally(Cat):
    def sing(self, sounds):
        return f"{sounds}"


class Manny(Cat):
    def sing(self, sounds):
        return f"{sounds}"


cat_one = Manny("manny", 20)
cat_two = Manny("tilly", 18)
cat_three = Manny("Cate", 40)

pets = Pets([cat_one, cat_two, cat_three])
print(cat_one.walk())
pets.walk()
