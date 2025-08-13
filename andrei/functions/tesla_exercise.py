def check_driver_age(age: str):
    if int(age) < 18:
        print("Sorry, you are too young to drive this car. Powering off")
    elif int(age) > 18:
        print("Powering On. Enjoy the ride!")
    elif int(age) == 18:
        print("Congratulations on your first year of driving. Enjoy the ride!")


age = input("What is your age?: ")
check_driver_age(age)


class Person:
    def __init__(self, name):
        self.name = name

    def get_user_name(self):
        return self.name


james = Person("james")

print(james)
