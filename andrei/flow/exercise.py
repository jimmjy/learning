is_magician = False
is_expert = False


# check if magician AND expert: "you are a master magician"

# check if magician but not expert: "at least you're getting there"

# if you're not a magician: "You need magic powers"

if is_magician and is_expert:
    print("You are a master magician")
elif (
    is_magician and not is_expert
):  # this could be or also without not but hard to read
    print("At least you're getting there")
else:
    print("You need magic powers")


"""
== checks for equality
is check if location in memory is the same
"""
