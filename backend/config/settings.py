"""
Configuration settings for the Addition PWA backend
"""

import os


class Config:
    """Base configuration class"""

    # Flask settings
    SECRET_KEY = (
        os.environ.get("SECRET_KEY") or "your-secret-key-change-this-in-production"
    )
    DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

    # CORS settings
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

    # API settings
    API_VERSION = "v1"
    API_PREFIX = f"/api/{API_VERSION}"

    # Pagination settings
    DEFAULT_PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100

    # Calculation settings
    MAX_OPERANDS = 100
    MAX_NUMBER_VALUE = 1e10
    MIN_NUMBER_VALUE = -1e10

    # History settings
    MAX_HISTORY_ENTRIES = 10000
    HISTORY_CLEANUP_ENABLED = True
    HISTORY_CLEANUP_DAYS = 365

    # Logging settings
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # File storage settings
    DATA_DIRECTORY = os.path.join(os.path.dirname(__file__), "..", "data")
    HISTORY_FILE = "calculation_history.json"

    # Rate limiting (if implemented)
    RATELIMIT_ENABLED = os.environ.get("RATELIMIT_ENABLED", "False").lower() == "true"
    RATELIMIT_DEFAULT = os.environ.get("RATELIMIT_DEFAULT", "100 per hour")

    # Security settings
    SECURE_HEADERS = True
    FORCE_HTTPS = os.environ.get("FORCE_HTTPS", "False").lower() == "true"


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    LOG_LEVEL = "DEBUG"


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    SECURE_HEADERS = True
    FORCE_HTTPS = True
    LOG_LEVEL = "WARNING"


class TestingConfig(Config):
    """Testing configuration"""

    TESTING = True
    DEBUG = True
    HISTORY_FILE = "test_calculation_history.json"


# Configuration mapping
config_mapping = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}


def get_config(config_name=None):
    """Get configuration based on environment"""
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "default")

    return config_mapping.get(config_name, DevelopmentConfig)
