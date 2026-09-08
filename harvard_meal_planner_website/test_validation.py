import unittest

from validation import is_valid_email, is_valid_username, parse_rating, validate_password


class EmailValidationTests(unittest.TestCase):
    def test_accepts_standard_email(self):
        self.assertTrue(is_valid_email("student@college.edu"))

    def test_rejects_missing_at(self):
        self.assertFalse(is_valid_email("student.college.edu"))

    def test_rejects_empty(self):
        self.assertFalse(is_valid_email(""))


class UsernameValidationTests(unittest.TestCase):
    def test_accepts_letter_start(self):
        ok, err = is_valid_username("alex_01")
        self.assertTrue(ok)
        self.assertIsNone(err)

    def test_rejects_too_short(self):
        ok, err = is_valid_username("ab")
        self.assertFalse(ok)
        self.assertIn("3 characters", err)

    def test_rejects_leading_digit(self):
        ok, _err = is_valid_username("1alex")
        self.assertFalse(ok)


class PasswordValidationTests(unittest.TestCase):
    def test_accepts_six_or_more(self):
        ok, err = validate_password("abcdef")
        self.assertTrue(ok)
        self.assertIsNone(err)

    def test_rejects_short_password(self):
        ok, err = validate_password("abc")
        self.assertFalse(ok)
        self.assertIn("6 characters", err)


class RatingValidationTests(unittest.TestCase):
    def test_accepts_in_range(self):
        self.assertEqual(parse_rating("4"), 4)

    def test_rejects_non_numeric(self):
        self.assertEqual(parse_rating("hot"), 0)

    def test_clamps_out_of_range(self):
        self.assertEqual(parse_rating("9"), 0)


if __name__ == "__main__":
    unittest.main()
