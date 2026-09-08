import unittest

from security import DEV_SECRET_DEFAULT, is_production_env, resolve_secret


class ProductionEnvTests(unittest.TestCase):
    def test_defaults_to_non_production(self):
        self.assertFalse(is_production_env({}))

    def test_render_counts_as_production(self):
        self.assertTrue(is_production_env({"RENDER": "true"}))


class ResolveSecretTests(unittest.TestCase):
    def test_uses_dev_default_locally(self):
        self.assertEqual(resolve_secret({}, name="SECRET_KEY", default=DEV_SECRET_DEFAULT), DEV_SECRET_DEFAULT)

    def test_rejects_missing_secret_in_production(self):
        with self.assertRaises(RuntimeError):
            resolve_secret({"FLASK_ENV": "production"}, name="SECRET_KEY", default=DEV_SECRET_DEFAULT)

    def test_rejects_default_secret_in_production(self):
        env = {"FLASK_ENV": "production", "SECRET_KEY": DEV_SECRET_DEFAULT}
        with self.assertRaises(RuntimeError):
            resolve_secret(env, name="SECRET_KEY", default=DEV_SECRET_DEFAULT)


if __name__ == "__main__":
    unittest.main()
