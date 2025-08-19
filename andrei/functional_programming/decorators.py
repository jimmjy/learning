"""
functions are first class citizen
Going to comment out below and write the proper setup to understand what is happening in
this code.

The setup below is basically what decorators do for us.

They basically super charge our function, such as adds more things to hello function
@decorator
def hello():
    pass


Higher order Functions HOC
2 ways:
- A function that accepts a function as argument
- Or a function that returns another function
"""


# def hello(func):
#     func()
#
#
# def greet():
#     print("still here!")
#
#
# a = hello(greet)
#
# print(a)


# Decorator
# def hello():
#     print("Helllooooo")


def my_decorator(func):
    def wrap_func(args):
        print("**********")
        func(args)
        print("**********")

    return wrap_func


# A decorator is basically a setup function to abstract away subbing in a function to
# another function
@my_decorator
def hello(greeting):
    print(greeting)


# Now hello is actually passed to my decorator as the func it is suppose to accept so
# when I call hello(), it can be paired with whatever we add inside of my_decorator.
# hello()

# basically what we are saying is my_decorator(hello) -> and hello is func() inside
# decorator

# now what happens if hello also accepts an argument as well.


def test(func):
    def wrap_func(greeting):
        func(greeting)

    return wrap_func


def test_two(greeting):
    print(greeting)


# test(test_two)("Own test")
#
# # scratch code above now lets call real decorator
# hello("Hello")

# the final way it should all look with arguments


def my_new_decorator(func):
    def wrapper(*args, **kwargs):
        print("&&&&&&&")
        func(*args, **kwargs)
        print("&&&&&&&")

    return wrapper


@my_new_decorator
def hello_again(greeting, emoji=":)"):
    print(greeting, emoji)


hello_again("is it hello", ":s")
