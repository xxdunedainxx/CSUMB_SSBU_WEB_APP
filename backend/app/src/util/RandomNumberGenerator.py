"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: A simple RNG
"""
# May not be used
import random
import string

class RandomNumberGenerator:

  def __init__(self):
    pass

  """
    Generates a random string (combination of ASCII chars and numbers) of a length specified by the function caller.
    
    Usage Example:
      randomString =  RandomNumberGenerator.generate_random_string(5)
      print(len(randomString)) # Should be a random string of length 5
      print(randomString) # Whatever the random string was 
  """
  @staticmethod
  def generate_random_string(length: int) -> str:
    r_string_builder: str = ''
    for i in range(length):
      rand_int = random.randint(0,1000000)

      if rand_int % 2 == 0:
        # TODO - improve - not just ASCII uppercase?
        r_string_builder += random.choice(string.ascii_uppercase)
      else:
        r_string_builder += str(random.randint(0,9))

    return r_string_builder