"""
abstraction - this is just the hiding of how something happens
private vs public:
private in python is with _ so it hides it conceptually, not actually

Inheritance:
getting shared values, methods a blueprint user below

the 4 pillars:
- Encapsulation
- Abstraction
- Inheritance
- Polymorphism:
    This is just over writing the parent method
"""


class PlayerCharacter:
    _tempurature: int = 40

    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def run(self):
        print("run")

    def speak(self):
        print(f"my name is {self.name}")


class User:
    def __init__(self, email) -> None:
        self.email = email

    def sign_in(self):
        print("logged in")


class Wizard:
    def __init__(self, name, power, email):
        # super().__init__(email)
        self.name = name
        self.power = power

    def attack(self):
        print(f"attacking iwth power of {self.power}")


class Archer:
    def __init__(self, name, arrows):
        self.name = name
        self.arrows = arrows

    def check_arrows(self):
        print("hello")
        print(f"{self.arrows}  remaining")

    def run(self):
        print("ran really fast")


wizard_one = Wizard("merlin", 50, "test@test.com")
archer_one = Archer("Robin", 100)
# print(wizard_one.email)

# introspection
# print(dir(wizard_one))  # shows all things we have access to

"""
dunder
"""


class Toy:
    def __init__(self, color, age):
        self.color = color
        self.age = age
        self.my_dict = {"name": "Yoyou", "age": 14}

    # this is to change how the object is outputted in text
    def __str__(self):
        return f"{self.color}"

    def __len__(self):
        return 5

    def __call__(self):
        return "yess??"

    def __getitem__(self, i):
        return self.my_dict[i]


action_figure = Toy("red", 0)
print(action_figure.__str__())
print(action_figure)  # so this outputs self.color instead of the odd object syntax
print(len(action_figure))  # gets over written with 5 now due to __len__
print(action_figure())
print(action_figure["name"])


class SuperList(list):  # we are now a subclass of list
    def __len__(self):
        return 1000


# allows us to access through index
# when we do len return 1000
super_list = SuperList()
print(len(super_list))

super_list.append(5)  # this is due to the inheritance of list
print(super_list[0])

print(issubclass(SuperList, list))


class HybridBorg(Wizard, Archer):
    def __init__(self, name, power, arrows, email):
        Archer.__init__(self, name, arrows)
        Wizard.__init__(self, name, power, email)


hb1 = HybridBorg("James", 100, 20, "test@test.com")
print(hb1.check_arrows())
