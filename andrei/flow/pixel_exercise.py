# Exercise

picture = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
]

pixel_line = ""


for line in picture:
    for symbol in line:
        if symbol == 0:
            pixel_line += " "
        else:
            pixel_line += "*"

    pixel_line += "\n"

print(pixel_line)

# this is a different way that shows print working differently
# for line in picture:
#     for symbol in line:
#         if symbol == 0: # this is falsey so could switch and use truthy without ==
#             print(" ", end="")
#         else:
#             print("*", end="")
#     print("")

# Exercise 2 - check for duplicates in list:
some_list = ["a", "b", "c", "b", "d", "m", "n", "n"]

# original attempt
# duplicate_dict = {}
#
# for value in some_list:
#     if value in duplicate_dict:
#         duplicate_dict[value] += 1
#     else:
#         duplicate_dict[value] = 1
#
# for letter, count in duplicate_dict.items():
#     if count > 1:
#         print(letter)
#
# print(some_list.count("b"))

duplicates = []

for value in some_list:
    if some_list.count(value) > 1 and value not in duplicates:
        duplicates.append(value)

print(*duplicates)  # list unpacking
