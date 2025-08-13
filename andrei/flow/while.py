value = 0

#  ==================================================
# this is a special case, with else, if you used a break in
# the while portion, else would be skipped
#  ==================================================

while value < 50:
    print(value)
    value += 1
else:
    print("done with all the work")
