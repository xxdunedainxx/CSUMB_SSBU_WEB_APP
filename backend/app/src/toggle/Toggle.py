"""
    Author: Kay Makinde-Odusola
    Date: 3/9/26
    Synopsis: The class allows you to turn off/on certain features at runtime
"""

"""
    TODO - Class description
"""
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
        self.__load_toggle_configuration(toggleConfigurationFilePath)

    """
        TODO - Load initial toggle state from file.
        This should setup the __TOGGLES var based on what is in the toggle configuration file
    """
    def __load_toggle_configuration(self, toggleConfPath):
        pass

    """
        TODO - implement a way to determine if a toggle is enabled
    """
    def is_toggle_enabled(self, toggleName: str) -> bool:
        pass

toggles = ToggleService("TODO_FILE_PATH.json")

toggles.is_toggle_enabled(ToggleService.EXAMPLE_TOGGLE)