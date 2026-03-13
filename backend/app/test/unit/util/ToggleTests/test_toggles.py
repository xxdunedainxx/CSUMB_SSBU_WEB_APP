import unittest
from src.toggle.Toggle import ToggleService
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled

from contextlib import nullcontext as does_not_raise

@enabled
def test_toggles():
    LogFactory.MAIN_LOG.info(f"RUNNING feature toggle tests")
    unittest.main(module=__name__, exit=False)

class TestFeatureToggles(unittest.TestCase):

    def test_check_error(self):
        with self.assertRaises(KeyError) as tc:
            test_one.is_toggle_enabled("RANDOM_TOGGLE")

    def test_check_true(self):
        assert test_one.is_toggle_enabled("NEW_FEATURE") ==  True

if __name__ == '__main__':
    unittest.main()

test_one = ToggleService("test/unit/util/ToggleTests/Example.json")
