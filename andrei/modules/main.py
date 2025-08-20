# for sub folders, they are considered packages so we need a dot syntax
import os

import utility
from shopping.shopping_cart import buy

print(utility.multiply(2, 3))
print(utility.divide(6, 2))
print(buy("hello"))

os.getenv("OPENAPI_KEY")
