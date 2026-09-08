# Validation helpers for FeedMe account fields
import re


def is_valid_email(email):
    # Check if email matches standard format (user@domain.tld)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    # Validate: 3-20 chars, alphanumeric + underscore, must start with letter
    if len(username) < 3:
        return False, "Username must be at least 3 characters long."
    if len(username) > 20:
        return False, "Username cannot be longer than 20 characters."
    if not username[0].isalpha():
        return False, "Username must start with a letter."
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', username):
        return False, "Username can only contain letters, numbers, and underscores."
    return True, None

def validate_password(password):
    # Check password meets minimum length requirement
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    return True, None

def parse_rating(raw, default=0):
    # Coerce form ratings to 0-5; invalid values become default
    try:
        rating = int(raw)
    except (TypeError, ValueError):
        return default
    if rating < 0 or rating > 5:
        return 0
    return rating
