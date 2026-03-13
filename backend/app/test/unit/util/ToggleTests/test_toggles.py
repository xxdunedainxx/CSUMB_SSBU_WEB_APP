import unittest
from src.toggle.Toggle import ToggleService
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled
import os
from contextlib import nullcontext as does_not_raise

@enabled
def test_toggles():
    LogFactory.MAIN_LOG.info(f"RUNNING feature toggle tests")
    unittest.main(module=__name__, exit=False)

class TestFeatureToggles(unittest.TestCase):

    # test that an error raises when a key doesn't exist
    @enabled
    def test_check_error(self):
        with self.assertRaises(KeyError) as tc:
            test_one.is_toggle_enabled("RANDOM_TOGGLE")

    # tests that no error raises when key does exist
    @enabled
    def test_check_true(self):
        with does_not_raise():
            assert test_one.is_toggle_enabled("NEW_FEATURE")

if __name__ == '__main__':
    unittest.main()

base_dir = os.path.dirname(os.path.abspath(__file__))
test_one = ToggleService(f"{base_dir}/Example.json")
