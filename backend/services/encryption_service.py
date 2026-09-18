import os
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from dotenv import load_dotenv

load_dotenv()

class EncryptionService:
    def __init__(self):
        # Key must be 32 bytes for AES-256
        key_hex = os.getenv("ENCRYPTION_KEY")
        if not key_hex:
            raise ValueError("ENCRYPTION_KEY must be set in environment variables")
        self.key = bytes.fromhex(key_hex)

    def encrypt(self, data: bytes) -> str:
        """
        Encrypts data using AES-256-GCM.
        Returns a base64 encoded string containing nonce, tag, and ciphertext.
        """
        cipher = AES.new(self.key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(data)

        # Pack as: nonce (16) + tag (16) + ciphertext
        result = cipher.nonce + tag + ciphertext
        return base64.b64encode(result).decode('utf-8')

    def decrypt(self, encrypted_str: str) -> bytes:
        """
        Decrypts data using AES-256-GCM.
        """
        data = base64.b64decode(encrypted_str)
        nonce = data[:16]
        tag = data[16:32]
        ciphertext = data[32:]

        cipher = AES.new(self.key, AES.MODE_GCM, nonce=nonce)
        try:
            return cipher.decrypt_and_verify(ciphertext, tag)
        except ValueError:
            raise ValueError("Decryption failed: Data corrupted or wrong key.")

encryption_service = EncryptionService()
