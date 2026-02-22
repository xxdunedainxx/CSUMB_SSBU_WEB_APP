"""
  Author: Zach McFadden
  Date: 2/2/26
  Synopsis: Unit testing for RNG
"""
from src.util.FileIO import FileIO
from src.util.LogFactory import LogFactory

from test.util.decorators.Toggle import enabled

import unittest

@enabled
def file_io_unit_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING rng tests")
    unittest.main(module=__name__, exit=False)

class FileIoUnitTests(unittest.TestCase):

    @enabled
    def test_basic_file_operations(self):
        someRandFile="someRandomFile.txt"
        assert(FileIO.file_exists(someRandFile) == False)

        FileIO.create_file_if_does_not_exist(someRandFile)
        assert(FileIO.file_exists(someRandFile))

        FileIO.delete_file(someRandFile)
        assert(FileIO.file_exists(someRandFile) == False)

    @enabled
    def test_path_manipulation(self):
        testPath="./blah"

        assert(FileIO.contains_path(testPath))

        assert("blah" == FileIO.strip_relative_path(testPath))

    @enabled
    def test_simple_file_write_operations(self):
        testPath="./testIo.txt"
        testWriteData="Hello world!"
        FileIO.create_file_if_does_not_exist(testPath)
        assert(FileIO.file_exists(testPath))

        FileIO.write_string_to_file(testPath, testWriteData)
        assert(FileIO.read_file_content_to_string(testPath) == testWriteData)

        FileIO.delete_file(testPath)
        assert(FileIO.file_exists(testPath) == False)


if __name__ == "__main__":
    unittest.main()