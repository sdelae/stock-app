import hashlib
import secrets
import string

# Function to generate a secure token
def generate_token(length=40):
    # Generate a random string token
    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for _ in range(length))
    return token

# Function to hash a password (or any string)
def hash_password(password):
    # Create a new sha256 hash object
    hash_object = hashlib.sha256()
    # Update the hash object with the bytes of the password
    hash_object.update(password.encode('utf-8'))
    # Return the hexadecimal representation of the digest
    return hash_object.hexdigest()

# Function to verify a password against a given hash
def verify_password(password, hash):
    # Hash the password using the same function as when we stored it
    password_hash = hash_password(password)
    # Compare the hash of the password provided with the hash from the database
    return password_hash == hash

# Example function to hash values using sha1 (less secure, provided for completeness)
def hash_value(string):
    hash_object = hashlib.sha1()
    hash_object.update(string.encode('utf-8'))
    return hash_object.hexdigest()