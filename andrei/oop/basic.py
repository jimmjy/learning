# OOP
class PlayerCharacter:
    # Class object attribute - an attribute that comes with the class
    # and doesn't change across objects
    membership = True

    def __init__(self, name, age):
        if self.membership:
            self.name = name  # attributes
            self.age = age

    def run(self):
        print("run")
        return "done"

    def shout(self):
        print(f"my name is {self.name}")


player_one = PlayerCharacter("James", 40)
player_two = PlayerCharacter("Cate", 39)

print(player_one.run())
print(player_two.age)
player_two.attack = 50
# help(player_one) - super helpful to see info about this

player_one.membership = False
print(player_one.shout())
print(player_two.shout())
print(player_one.membership)
print(player_two.membership)
