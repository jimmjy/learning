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

    @classmethod
    def adding_things(cls, num1, num2):
        # cls not used but typically would be used to instantiate or maybe call a static
        # method
        return num1 + num2

    @staticmethod
    def adding_other_things(num1, num2):
        return num1 + num2


"""
classmethod gives us access to the actual class but it is a method 
on the class that sticks with all classes

static method gives us a static method that is on the base class
so you call just the class.staticmethodname and you don't need 
an instance of the class

both of these method types can be called on the class, 
not an instance to perform them.

classmethod would typically be used to instantiate something 
a bit differently but is not common to see.  It can give you 
overloaded init though
"""

player_one = PlayerCharacter("James", 40)
player_two = PlayerCharacter("Cate", 39)

print(player_one.run())
print(player_two.age)
# help(player_one) - super helpful to see info about this

player_one.membership = False
print(player_one.shout())
print(player_two.shout())
print(player_one.membership)
print(player_two.membership)
print(PlayerCharacter.adding_other_things(3, 4))

print(player_one.adding_things(4, 3))
