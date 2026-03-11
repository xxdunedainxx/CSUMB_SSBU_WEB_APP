"""
    Author: Kay Makinde-Odusola
    Date: 3/9/26
    Synopsis: The class allows you to turn off/on certain features at runtime
"""
import json

class ToggleService:

    # TODO - SET Singleton Instance IN CONSTRUCTOR
    INSTANCE = None

    EXAMPLE_TOGGLE="EXAMPLE_TOGGLE"

    """
        Class constructor
    """
    def __init__(self, toggleConfigurationFilePath: str):
        # Toggles are a dictionary of strings --> bools
        self.__TOGGLES: dict[str, bool] = {}
        # when an object is created, convert the file path to a dictionary and store in Toggles
        self.__load_toggle_configuration(toggleConfigurationFilePath)

    def __load_toggle_configuration(self, toggleConfPath):
        # with is a context manager that closes the file given after we're done
        # helps with avoiding an error of having too many files open at once
        with open(toggleConfPath, "r") as tempFile:
            self.__TOGGLES = json.load(tempFile)

    def is_toggle_enabled(self, toggleName: str) -> bool:
        if toggleName in self.__TOGGLES:
            return True
        return False

toggles = ToggleService("TODO_FILE_PATH.json")

toggles.is_toggle_enabled(ToggleService.EXAMPLE_TOGGLE)