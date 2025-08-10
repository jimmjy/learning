# Tuple - like a list but can't be modified good use are locations
my_tuple = (1, 2, 3, 4, 5)
# my_tuple[1] = 'z' - this will error
a = 5 in my_tuple

# tuples can be used as keys in dictionary because they are immutable
# even though they are immutable you can create new ones from existing
x = my_tuple[0]
y = my_tuple[0:]

print(f'x: {x}, y: {y}')

print(my_tuple.count(5))  # - how many times it appears
