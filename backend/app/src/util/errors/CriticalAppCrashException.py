"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: A REALLYYY bad exception.
"""
class CriticalAppCrashedException(Exception):
  def __init__(self, errorMessage: str):
    super().__init__(f"Application Crashed with Exception {errorMessage}")