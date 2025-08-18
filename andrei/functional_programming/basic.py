from functools import reduce

"""
Pure functions should have no side effects
The below function could have had new_list outside
but we want it inside
"""

# original multiply_by2 before map
# def multiply_by2(li):
#     new_list = []
#     for item in li:
#         new_list.append(item * 2)
#     return new_list


# print(multiply_by2([1, 2, 3]))


def multiply_by2(num):
    return num * 2


# map, filter, zip and reduce
# map does not modify the original data structure


def check_odd(item):
    """
    This is for filter, which returns true or false

    Args:
        item (): A list

    Returns:
    True or False

    """
    return item % 2 != 0


my_list = [1, 2, 3, 4, 5, 6, 7]
your_list = [10, 20, 30]

print(list(map(multiply_by2, my_list)))
print(list(filter(check_odd, my_list)))

# zip - creates a list of tuples with the tuples being the index of everything in same
# tuple
print(f"Zip: {list(zip(my_list, your_list))}")


# reduce - does not come from standard library.  reduce takes accumulator, our list and
# initial value we are using to sum to.  This will return a single value
def accumulator(acc, item):
    print(f"Acc: {acc}, item: {item}")
    return acc + item


print(f"Reduce: {reduce(accumulator, my_list, 10)}")
