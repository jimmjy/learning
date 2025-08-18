from functools import reduce

# 1 Capitalize all of the pet names and print the list
my_pets = ["sisi", "bibi", "titi", "carla"]


def capital(name: str) -> str:
    return name.capitalize()


print(f"Capital: {list(map(capital, my_pets))}")

# 2 Zip the 2 lists into a list of tuples, but sort the number from lowest to highest.
my_strings = ["a", "b", "c", "d", "e"]
my_numbers = [5, 4, 3, 2, 1]

my_numbers.sort()

print(f"Zip: {list(zip(my_strings, my_numbers))}")

# 3 filter the cores that pass over 50%
scores = [73, 20, 65, 19, 76, 100, 88]


def filter_over_fifty(item):
    return item > 50


print(f"Filters: {list(filter(filter_over_fifty, scores))}")

# 4 Combine all of the numbers that are in a list on this file using reduce (my_numbers
# and scores). What is the total?


def accumulate(acc, item):
    return acc + item


my_numbers.extend(scores)

print(f"reduce: {reduce(accumulate, my_numbers, 0)}")
