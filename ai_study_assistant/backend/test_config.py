import os
import unittest

from config import (
    DEFAULT_CORS_ORIGINS,
    DEV_API_KEY_DEFAULT,
    DEV_SECRET_DEFAULT,
    MAX_UPLOAD_BYTES,
    api_key_matches,
    cors_origins,
    is_production_env,
    is_public_api_path,
    resolve_secret,
    upload_too_large,
)


class ProductionEnvTests(unittest.TestCase):
    def test_defaults_to_non_production(self):
        self.assertFalse(is_production_env({}))

    def test_flask_env_production(self):
        self.assertTrue(is_production_env({"FLASK_ENV": "production"}))

    def test_render_and_railway_count_as_production(self):
        self.assertTrue(is_production_env({"RENDER": "true"}))
        self.assertTrue(is_production_env({"RAILWAY_ENVIRONMENT": "production"}))


class ResolveSecretTests(unittest.TestCase):
    def test_uses_dev_default_locally(self):
        self.assertEqual(
            resolve_secret({}, name="FLASK_SECRET_KEY", default=DEV_SECRET_DEFAULT),
            DEV_SECRET_DEFAULT,
        )

    def test_uses_provided_value(self):
        env = {"FLASK_SECRET_KEY": "  local-secret  "}
        self.assertEqual(
            resolve_secret(env, name="FLASK_SECRET_KEY", default=DEV_SECRET_DEFAULT),
            "local-secret",
        )

    def test_rejects_missing_secret_in_production(self):
        env = {"FLASK_ENV": "production"}
        with self.assertRaises(RuntimeError):
            resolve_secret(env, name="FLASK_SECRET_KEY", default=DEV_SECRET_DEFAULT)

    def test_rejects_default_secret_in_production(self):
        env = {"FLASK_ENV": "production", "FLASK_SECRET_KEY": DEV_SECRET_DEFAULT}
        with self.assertRaises(RuntimeError):
            resolve_secret(env, name="FLASK_SECRET_KEY", default=DEV_SECRET_DEFAULT)

    def test_rejects_default_api_key_in_production(self):
        env = {"FLASK_ENV": "production", "CORTEX_API_KEY": DEV_API_KEY_DEFAULT}
        with self.assertRaises(RuntimeError):
            resolve_secret(env, name="CORTEX_API_KEY", default=DEV_API_KEY_DEFAULT)


class UploadLimitTests(unittest.TestCase):
    def test_limit_is_10mb(self):
        self.assertEqual(MAX_UPLOAD_BYTES, 10 * 1024 * 1024)

    def test_accepts_files_at_limit(self):
        self.assertFalse(upload_too_large(MAX_UPLOAD_BYTES))

    def test_rejects_files_over_limit(self):
        self.assertTrue(upload_too_large(MAX_UPLOAD_BYTES + 1))


class CorsOriginTests(unittest.TestCase):
    def test_default_local_frontend_origins(self):
        self.assertEqual(
            cors_origins({}, DEFAULT_CORS_ORIGINS),
            ["http://127.0.0.1:3002", "http://localhost:3002"],
        )

    def test_parses_comma_separated_override(self):
        env = {"CORS_ORIGINS": "https://app.example.com, https://admin.example.com"}
        self.assertEqual(
            cors_origins(env, DEFAULT_CORS_ORIGINS),
            ["https://app.example.com", "https://admin.example.com"],
        )


class ApiKeyTests(unittest.TestCase):
    def test_health_path_is_public(self):
        self.assertTrue(is_public_api_path("/api/health"))
        self.assertTrue(is_public_api_path("/api/health/"))
        self.assertFalse(is_public_api_path("/api/materials"))

    def test_matches_expected_key(self):
        env = {"CORTEX_API_KEY": "test-key"}
        self.assertTrue(api_key_matches(env, "test-key"))
        self.assertFalse(api_key_matches(env, "other-key"))
        self.assertFalse(api_key_matches(env, ""))


if __name__ == "__main__":
    unittest.main()
