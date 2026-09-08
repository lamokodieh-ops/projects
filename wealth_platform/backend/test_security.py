import unittest

from security import (
    DEFAULT_CORS_ORIGINS,
    DEV_JWT_DEFAULT,
    DEV_SECRET_DEFAULT,
    cors_origins,
    is_production_env,
    resolve_secret,
)


class ProductionEnvTests(unittest.TestCase):
    def test_defaults_to_non_production(self):
        self.assertFalse(is_production_env({}))

    def test_flask_env_production(self):
        self.assertTrue(is_production_env({"FLASK_ENV": "production"}))


class ResolveSecretTests(unittest.TestCase):
    def test_uses_dev_default_locally(self):
        self.assertEqual(resolve_secret({}, name="SECRET_KEY", default=DEV_SECRET_DEFAULT), DEV_SECRET_DEFAULT)

    def test_rejects_missing_secret_in_production(self):
        with self.assertRaises(RuntimeError):
            resolve_secret({"FLASK_ENV": "production"}, name="SECRET_KEY", default=DEV_SECRET_DEFAULT)

    def test_rejects_default_jwt_secret_in_production(self):
        env = {"FLASK_ENV": "production", "JWT_SECRET_KEY": DEV_JWT_DEFAULT}
        with self.assertRaises(RuntimeError):
            resolve_secret(env, name="JWT_SECRET_KEY", default=DEV_JWT_DEFAULT)

    def test_accepts_custom_production_secret(self):
        env = {"FLASK_ENV": "production", "SECRET_KEY": "prod-secret-not-default"}
        self.assertEqual(resolve_secret(env, name="SECRET_KEY", default=DEV_SECRET_DEFAULT), "prod-secret-not-default")


class CorsOriginTests(unittest.TestCase):
    def test_default_local_frontend_origins(self):
        self.assertEqual(
            cors_origins({}, DEFAULT_CORS_ORIGINS),
            ["http://127.0.0.1:5173", "http://localhost:5173"],
        )

    def test_parses_comma_separated_override(self):
        env = {"CORS_ORIGINS": "https://fortis.example.com"}
        self.assertEqual(cors_origins(env, DEFAULT_CORS_ORIGINS), ["https://fortis.example.com"])


if __name__ == "__main__":
    unittest.main()
