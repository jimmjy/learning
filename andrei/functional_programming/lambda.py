# are anonymouse functions basically

# lambda param: action(param)

from functools import reduce

my_list = [1, 2, 3]


def multiply_by2(item):
    return item * 2


# anonymouse function run once we don't need to reuse it
print(f"lambad: {list(map(lambda item: item * 2, my_list))}")

print(f"Filter: {list(filter(lambda num: num % 2 != 0, my_list))}")

print(f"Reduce: {reduce(lambda acc, item: acc + item, my_list, 0)}")

my_new_list = [5, 4, 3]

# square list with lambda
print(f"Squared: {list(map(lambda item: item * item, my_new_list))}")

# List sorting
a = [(0, 2), (4, 3), (9, 9), (10, -1)]

a.sort(key=lambda x: x[1])
print(a)
