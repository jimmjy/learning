# Error handling

while True:
    try:
        age = int(input("what is your age? "))
        print(age)
        # 10 / age
    except ValueError:
        print("please enter a number")
    except ZeroDivisionError:
        print("please enter age higher then 0")
    else:
        print("Thank you")
        break
    finally:
        # This will always run, for except even
        print("ok, I am finally done")


def sum(num1, num2):
    try:
        return num1 / num2
    # except TypeError as err:
    except (TypeError, ZeroDivisionError) as err:
        print(f"Please enter numbers {err}")


print(sum(1, 0))

raise ValueError("Hey cut it out")  # can be any error raise Exception
