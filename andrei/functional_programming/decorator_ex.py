# Create an @authenticated decorator that only allows the function to run if user1 has
# 'valid' set to True:
user1 = {
    "name": "Sorna",
    "valid": False,  # changing this will either run or not run the message_friends function
}


def authenticated(fn):
    def wrapper(*args, **kwargs):
        # tried to get fancy with ternary but probably shouldn't for real code
        # fn(*args, **kwargs) if args[0]["valid"] else None
        # if args[0]["valid"]:
        fn(*args, **kwargs)

    return wrapper


@authenticated
def message_friends(args):
    if args["valid"]:
        print("message has ben sent")
    else:
        print("Invalid user")


message_friends(user1)
