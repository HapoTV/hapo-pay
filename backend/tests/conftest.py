# tests/conftest.py
"""Test-suite safety rails.

The project's DATABASE_* settings point at the live Supabase instance, and
pytest-django creates (and afterwards DROPS) a `test_<NAME>` database on
whatever host it is given. Running `pytest` from a developer machine therefore
issued CREATE/DROP DATABASE against production infrastructure -- and because
the configured host is the Supabase *pooler*, which does not support those
statements, the suite simply hung instead of failing loudly.

This fixture refuses to run against a non-local database host unless the
operator opts in explicitly, so the default outcome is a clear error rather
than either a hang or a destructive operation on production.
"""
import os

import pytest
from django.conf import settings

_LOCAL_HOSTS = {'localhost', '127.0.0.1', '::1', 'db', 'postgres', ''}

# CI and anyone who genuinely means it can set this.
_OPT_IN_VAR = 'HAPOPAY_ALLOW_REMOTE_TEST_DB'


def pytest_configure(config):
    # The per-IP flood guard and the anonymous throttle both key on client
    # address, and every request in the suite comes from 127.0.0.1. Left on,
    # they make unrelated tests fail with 429 once the shared bucket fills --
    # which is exactly what happened while auditing this suite. Tests should
    # assert application behaviour; rate limiting has its own tests.
    settings.RATELIMIT_ENABLE = False
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        'DEFAULT_THROTTLE_CLASSES': [],
    }


    host = (settings.DATABASES['default'].get('HOST') or '').strip()

    if host in _LOCAL_HOSTS:
        return

    if os.environ.get(_OPT_IN_VAR) == '1':
        return

    raise pytest.UsageError(
        f"Refusing to run the test suite against remote database host {host!r}.\n"
        f"pytest-django will CREATE and DROP a database named "
        f"'test_{settings.DATABASES['default'].get('NAME')}' on that host.\n\n"
        f"Point DATABASE_HOST at a local Postgres (see docker-compose.yml), or set "
        f"{_OPT_IN_VAR}=1 if you are certain the target is disposable."
    )
