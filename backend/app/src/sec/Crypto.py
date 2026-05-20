"""
    Author: Zach Mcfadden
    Date: 4.6.2026
    Synopsis: General Container class for any cryptographic related functions such as hashing and encryption.
"""
import base64

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hashlib

from src.util.FileIO import FileIO

class CryptoService:
    ENCODING="utf-8"

    """
        Util methods for hashing below 
    """
    @staticmethod
    def sha256_hash_string(data: str) -> str:
        return hashlib.sha256(data.encode(CryptoService.ENCODING)).hexdigest()

    @staticmethod
    def sha256_hash_bytes(data: str) -> bytes:
        return hashlib.sha256(data.encode(CryptoService.ENCODING)).digest()

    def __init__(self, initiazationVectorFile: str, keyFile: str):
        self.__establish_aes_cipher(initiazationVectorFile, keyFile)

    """
        Encrypts a series of bytes, and returns the cyphertext as bytes 
    """
    def encrypt_bytes(self, data: bytes) -> bytes:
        return self.aes256.encrypt(
            self.iv,
            data,
            associated_data=None
        )

    """
        Decrypts a series of bytes, and returns the plain text as bytes 
    """
    def decrypt_to_bytes(self, data: bytes) -> bytes:
        return self.aes256.decrypt(
            self.iv,
            data,
            associated_data=None
        )

    """
        Encrypts a string object and will decode the ciphertext bytes into usable string 
    """
    def encrypt_string(self, data: str) -> str:
        return base64.b64encode(self.aes256.encrypt(
            self.iv,
            data.encode(CryptoService.ENCODING),
            associated_data=None
        )).decode(CryptoService.ENCODING)

    """
        Decrypts the ciphertext data string to a plaintext string 
    """
    def decrypt_to_string(self, data: str) -> str:
        return self.aes256.decrypt(
            self.iv,
            base64.b64decode(data.encode(CryptoService.ENCODING)),
            associated_data=None
        ).decode(CryptoService.ENCODING)

    """
        Establishes the AES cipher 
    """
    def __establish_aes_cipher(self, ivPath: str, keyPath: str):
        aes256 = AESGCM(
            self.__read_and_delete_file(keyPath)
        )

        self.aes256=aes256
        self.iv=self.__read_and_delete_file(ivPath)

    """ 
        Reads a file and deletes it 
    """
    def __read_and_delete_file(self, path: str) -> bytes:
        b=FileIO.read_bytes_from_file(path)

        FileIO.delete_file(path)

        return b

