# pop - index we want to remove and returns removed value
# remove - index to remove
# clear() - removes all elements

# for slicing with [:] even though stop is exclusive,
# if it is omited, it implies including last element

basket = [1, 2, 3, 4, 5]
basket_two = ["a", "b", "c", "d", "e", "b"]


def sorted_local():
    # this is in place sorted() creates a new list or .copy
    basket_two.sort()
    print(f"Sorted baskets: {basket_two}")
    basket_two.reverse()
    print(f"Reversed: {basket_two}")


def index():
    # (value, startIndex, stopIndex)
    index = basket_two.index("c")

    # in checking
    print("d in basket", "d" in basket_two)
    print(f"Count of b: {basket_two.count('b')}")
    print(f"Index: {index}")


def adding():
    print("basket before:", basket)
    # append runs in place not return
    basket.append(100)

    print("basket after:", basket)


def insert():
    basket.insert(6, 201)
    print(basket)


def extend():
    # example of how this runs in place
    new_list = basket.extend([100])
    print(f"newlist: {new_list} basket: {basket}")


def run_all():
    print("adding:")
    adding()
    print("insert")
    insert()
    print("extend")
    extend()
    print("index:")
    index()
    sorted_local()
