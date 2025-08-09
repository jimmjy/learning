from list_methods import run_all


def main():
    li = [1, 2, 3, 4, 5]
    li2 = ["a", "b", "c"]
    li3 = [1, 2, "a", True]
    print(f"Lists: {li}, {li2}, {li3}")

    # List slicing
    amazon_cart = ["notebooks", "sunglasses", "toys", "grapes"]

    # [start:stop:step]
    print(amazon_cart[0::2])

    # full copy value = amazon_cart[:]

    amazon_cart[0] = "laptop"

    print(amazon_cart)

    # Matrix - multi dimensional
    matrix = [[1, 5, 1], [0, 1, 0], [1, 0, 1]]

    print(f"Matrix: {matrix[0][1]}")
    run_all()


if __name__ == "__main__":
    main()
