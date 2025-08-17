# a = 1
#
#
# def confusion():
#     a = 5
#     return a
#
#
# print(a)
# print(confusion())

"""
Rules of scope
1 - start with local
2 - Parent or local?
3 - global
4 - built in python functions. (python defined functions)
"""

# This is using a global scope
a = 10


def confusion():
    global a
    a = 10
    print(a)
    return a


print(a)
print(confusion())

total = 0


def increase_counter():
    # this can modify a global without creating a local first
    global total
    total += 1
    return total


increase_counter()
increase_counter()


# non local so somewhere inbetween global and local
def outer():
    x = "local"

    def inner():
        nonlocal x
        x = "nonlocal"
        print(f"inner {x}")

    inner()
    print(f"Outer: {x}")


outer()
