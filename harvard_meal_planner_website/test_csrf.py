import unittest

from csrf import token_from_request, tokens_match, wants_json_response


class TokenMatchTests(unittest.TestCase):
    def test_matching_tokens(self):
        self.assertTrue(tokens_match("abc123", "abc123"))

    def test_rejects_mismatch(self):
        self.assertFalse(tokens_match("abc123", "abc124"))

    def test_rejects_missing_expected(self):
        self.assertFalse(tokens_match("", "abc123"))
        self.assertFalse(tokens_match(None, "abc123"))

    def test_rejects_missing_provided(self):
        self.assertFalse(tokens_match("abc123", ""))
        self.assertFalse(tokens_match("abc123", None))


class TokenFromRequestTests(unittest.TestCase):
    def test_prefers_form_token(self):
        token = token_from_request({"csrf_token": "from-form"}, {"X-CSRF-Token": "from-header"})
        self.assertEqual(token, "from-form")

    def test_falls_back_to_header(self):
        token = token_from_request({}, {"X-CSRF-Token": "from-header"})
        self.assertEqual(token, "from-header")

    def test_empty_when_missing(self):
        self.assertEqual(token_from_request({}, {}), "")


class WantsJsonTests(unittest.TestCase):
    def test_ajax_header(self):
        self.assertTrue(wants_json_response({"X-Requested-With": "XMLHttpRequest"}))

    def test_json_accept(self):
        self.assertTrue(wants_json_response({"Accept": "application/json"}))

    def test_html_form(self):
        self.assertFalse(wants_json_response({"Accept": "text/html"}))


if __name__ == "__main__":
    unittest.main()
