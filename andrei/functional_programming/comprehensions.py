"""
list, set, dictionary comprehensions these are the types that can do this

initial simple syntax:
my_list = [param for param in iterable]

expanded syntax
my_list = [num * 2 for num in range(0, 100)]
expanded = [expression for_loop condition_for_value]
"""

# lists
my_list = []

for char in "hello":
    my_list.append(char)

print(my_list)

# this becomes
my_list_two = [char for char in "hello"]

print(my_list_two)

my_list_three = [num**2 for num in range(0, 100)]
print(my_list_three)

my_list_four = [num**2 for num in range(0, 100) if num % 2 == 0]
print(my_list_four)

# sets
my_set = {char for char in "hello"}
my_set_two = {num**2 for num in range(0, 100)}
my_set_three = {num**2 for num in range(0, 100) if num % 2 == 0}

print(f"Sets - set: {my_set},\n\ntwo: {my_set_two},\n\nthree: {my_set_three}")

# dict
simple_dict = {"a": 2, "b": 4, "c": 5}

my_dict = {key: value**2 for key, value in simple_dict.items() if value % 2 == 0}
my_dict_two = {num: num * 2 for num in [1, 2, 3]}

print(f"my_dict: {my_dict},\n\nmy_dict_two: {my_dict_two},\n\n")
