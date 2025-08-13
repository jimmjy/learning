def main():
    username: str = input("What is your username?\n")
    password: str = input("Type in your password\n")

    length_of_password = len(password)

    print(
        f"{username}, your password {length_of_password * '*'} is {length_of_password}"
    )
    print("Hello from structures!")
    print("Hello from {length_of_password}")


if __name__ == "__main__":
    main()
