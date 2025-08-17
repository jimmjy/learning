num_list = [10, 2, 3, 4, 8, 11, 44]


def highest_even(li: list[int]):
    highest = 0

    for num in li:
        if num % 2 == 0 and num > highest:
            highest = num

    print(highest)


highest_even(num_list)

# an alternate approach, make a new list and
# append only evens to it.  Then use the max() to find
# the largets value
