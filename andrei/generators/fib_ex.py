def fib(num):
    fib_seq = [0, 1]

    if num == 0:
        return fib_seq[0]

    if num == 1:
        return fib_seq[1]

    for i in range(2, num + 1):
        fib_seq.append(fib_seq[i - 2] + fib_seq[i - 1])

    return fib_seq[num]


print(fib(20))

# a generator approach


def fib_gen(num):
    a = 0
    b = 1
    for i in range(num + 1):
        yield a
        temp = a
        a = b
        b = temp + b


for x in fib_gen(20):
    print(x)

a = 10
# print(id(a))
