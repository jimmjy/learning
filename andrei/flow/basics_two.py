is_old = True
is_licenced = True


# if is_old:
#     print('You are old enough to drive')
# elif is_licenced:
#     print('You can drive now')
# else:
#     print('checkcheck')

if is_old and is_licenced:
    print("You are old enough to drive, and have a licence")
else:
    print("you are not of age!")

# Ternary Operator - a shortcut expressions (also called conditional expression)

"""
Syntax:
condition_if_true if condition else condition_if_else
the if is going to check condition first, if it is true, it uses condition_if_true or else it will
use condition_if_else

*Note: this is not the same as comprehension but can be combined
"""
is_friend = True
can_message = "message allowed" if is_friend else "not allowed to message"

print(can_message)

# short circuit - try to figure out crucial first to prevent expensive calcs
