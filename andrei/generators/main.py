"""
Generators:
Allows us to generate a sequence of values over time

we can use the keyword yield with them to pause

range(100) - this is a generator as it creates the values in time and does not create a
list that it stores in memory. So it is a just in time sort of thing
list(range(100)) - this creates values up front

Why are generators good?
so for example, with range, if we were to pass like 1,000,000,000 it could take a long
time for this to get created in memory such as wrapping with list().  Generators on the
other hand, like range, access the next value at time of needing so nothing is created
up front.

all generators are iterables, but not all iterables are generators.
List for example is an iterable but is not a generator.
Range is a generator and so must be an iterable
"""


# test range example
def make_list(num):
    result = []
    for i in range(num):
        result.append(i * 2)
    return result


my_list = make_list(100)
# print(my_list)
# print(list(range(10000000)))


def generator_function(num):
    for i in range(num):
        yield i * 2  # pauses the function here until we request again


# for item in generator_function(1000):
#     print(item)

g = generator_function(1)
# next(g)  # this will advance the generator_function 1 value more or calls it
# next(g)
# print(next(g))

# under the hood


def special_for(iterable):
    iterator = iter(iterable)

    while True:
        try:
            print(iterator)
            print(next(iterator))
        except StopIteration:
            break


special_for([1, 2, 3])


class MyGen:
    current = 0

    def __init__(self, first, last) -> None:
        self.first = first
        self.last = last

    def __iter__(self):
        print(f"Self: {self}")
        # help(self)
        return self

    def __next__(self):
        if MyGen.current < self.last:
            num = MyGen.current
            MyGen.current += 1
            return num
        raise StopIteration


gen = MyGen(0, 100)

for i in gen:
    print(i)

# help(range)
