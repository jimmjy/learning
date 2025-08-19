"""
Return the duplicate letters ["b", "n"] use list comprehension

"""

some_list = ["a", "b", "c", "b", "d", "m", "n", "n"]

duplicates = {char for char in some_list if some_list.count(char) > 1}
print(f"Duplicates: {list(duplicates)}")
