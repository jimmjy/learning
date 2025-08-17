class Cat:
    species = "mammal"

    def __init__(self, name, age):
        self.name = name
        self.age = age


# 1 Instantiate the Cat object with 3 cats
manny = Cat("Manny", 12)
tilly = Cat("Tilly", 10)
betty = Cat("Betty", 22)


# 2 Create a function that finds the oldest cat


def get_oldest(*args):
    oldest = 0

    for cat in args:
        # Ternary expression value_if_true if condition else value_if_false
        oldest = cat.age if cat.age > oldest else oldest

    print(oldest)


get_oldest(manny, tilly, betty)


# 3 Print out: "The oldest cat is x years old.". x will be the oldest cat age by using the function in #2
