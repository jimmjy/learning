"""
syntax:
for item in iterable:
    // do something with item

iterables can be list, tuple, set, dict (has other things we can do)
for dict without .keys .values .items, it will just print the keys
"""

test = {"name": "james", "age": 3}

for item in test:
    print(item)


"""
Iterable - list, dict, tuple, set, string are iterable
because they can be iterated or one by one check each item
in the collection

items gives us tuples with key, value for the values of it,
good for
for key, value in user.items():
    // do stuff with key and value
"""

car = "hello"

# enumerate - we wrap around something we want to interate over
# it is special that it gives an index counter and the item, like items()
for i, char in enumerate("helllooo"):
    print(i, char)

for i, num in enumerate(range(100)):
    if i == 50:
        # print(f"For index: {i}, the number is {num}")
        print(f"For index {i} the char is {num}")
