# dictionary
# its a data type and structure
# Keys can be anything that is immutable


class Person:
    pass


dictionary = {
    'basket': [1, 2, 3],
    'greet': 'hello',
}

print(f'Dict: {dictionary["basket"]}')

# When you aren't sure if something exists, .get is better to access to prevent errors
# print(dictionary['age'])
# this will return None if something doesn't exist, now we are safe
print(dictionary.get('age'))

# un common dict creation
user_one = dict(name='James')

print(user_one)

user = {'basket': [1, 2, 3], 'greet': 'hello', 'age': 20}

# using in to check
print('size' in user)

# keys
print('age' in user.keys())

# items keys, values, items methods

# print(user.items())
# user.clear()
# print(user)
user_two = user.copy()
print(user_two)

# user.pop('age') can remove a key/value pair

# popitem() - randomly pops off something, the last item

# user.update({"age": 55}) - updates a key, and will add if it doesn't exist
