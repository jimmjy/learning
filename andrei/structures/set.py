# Sets are an unordered unique collection (no duplicates)
my_set = {1, 2, 3, 4, 5, 5}
print(my_set)

my_set.add(100)
my_set.add(2)
print(my_set)
# this has clear also

my_list = [1, 2, 4, 5, 6, 6]
print(set(my_list))

# my_set = {1, 2, 3, 4, 5}
# your_set = {4, 5, 6, 7, 8, 9, 10}

# methods
"""
.difference() - my_set.difference(your_set) only show what is different based off first one
.discard() - my_set.discard(5) - removes that value
.difference_update() - my_set.difference_update(your_set)
.intersection() - my_set.intersection(your_set) - what are common
.isdisjoint() - my_set.isdisjoint(your_set) - are the two sets not overlapping so false if they have same values
.issubset() - my_set.issubset(your_set) - this would  be true because 4,5 are in your_set
.issuperset() -
.union() - my_set.union(your_set) - unites both sets and removes duplicates can be | also
"""
