"""
    Author: Ishaya Iliya
    Date: 2.18.2026
    Synopsis: Class to detect and scrub PII from strings
"""
import os

from src.sec.Crypto import CryptoService
from src.util.FileIO import FileIO
from src.util.LogFactory import LogFactory

from test.util.decorators.Toggle import enabled

import unittest

@enabled
def crypto_service_unit_testing():
    LogFactory.MAIN_LOG.info(f"RUNNING Crypto Service tests")
    unittest.main(module=__name__, exit=False)

class CryptoServiceUnitTests(unittest.TestCase):

    @enabled
    def test_hash_functions(self):
        assert(CryptoService.sha256_hash_string("test") != CryptoService.sha256_hash_string("test2"))
        assert(CryptoService.sha256_hash_string("test") == CryptoService.sha256_hash_string("test"))
        assert(CryptoService.sha256_hash_string("test") == "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08")

    @enabled
    def test_aes_encryption(self):
        ivFile="tmpIV"
        keyFile="tmpAesKey"
        FileIO.generate_byte_file(
            keyFile,
            os.urandom(32)
        )

        FileIO.generate_byte_file(
            ivFile,
            os.urandom(16)
        )

        cryptoService=CryptoService(
            ivFile,
            keyFile
        )

        bytesToEncrypt=os.urandom(10)
        encryptedData=cryptoService.encrypt_bytes(bytesToEncrypt)
        assert(cryptoService.decrypt_to_bytes(encryptedData) == bytesToEncrypt)

        stringToEncrypt="test"
        encryptedData=cryptoService.encrypt_string(stringToEncrypt)
        assert(cryptoService.decrypt_to_string(encryptedData) == stringToEncrypt)

if __name__ == "__main__":
    unittest.main()
