def main():
    username: str = input("What is your username?\n")
    password: str = input("Type in your password\n")

    length_of_password = len(password)

    print(
        f"{username}, your password {length_of_password * '*'} is {length_of_password} letters long"
    )
    print("Hello from structures!")


if __name__ == "__main__":
    main()
