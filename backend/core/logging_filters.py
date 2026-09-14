# core/logging_filters.py
"""Logging filters that keep secrets and cardholder data out of the log stream.

A fintech log pipeline is durable storage: anything written here is retained,
shipped to aggregators and read by operators. PCI-DSS 3.4 and SOC 2 both treat
a log file containing a PAN, a bearer token or a password as an exposure of the
underlying data, so redaction has to happen before the record is emitted rather
than relying on every call site to remember.
"""
import logging
import re

# Key=value / "key": "value" pairs whose value must never be written out.
_SENSITIVE_KEYS = (
    'password', 'passwd', 'secret', 'token', 'authorization', 'api_key',
    'apikey', 'access_token', 'refresh_token', 'signature', 'card_number',
    'pan', 'cvv', 'cvc', 'pin', 'otp', 'service_key', 'jwt',
)

# Matches key=value, key: value, "key": "value" and 'key': 'value'.
# The value group also swallows an optional leading Bearer/Basic scheme so
# `Authorization: Bearer <jwt>` redacts the token and not just the scheme word.
_KV_PATTERN = re.compile(
    r'(?i)([\'"]?)\b(' + '|'.join(_SENSITIVE_KEYS) + r')\b\1'
    r'(\s*[=:]\s*)'
    r'([\'"]?)'
    r'((?:bearer|basic|token)\s+)?'
    r'[^\s,;}\)\'"]+'
    r'\4'
)

# Bearer/JWT tokens appearing bare in a message, with no key in front.
_BEARER_PATTERN = re.compile(r'(?i)\b(bearer|basic)\s+[A-Za-z0-9._\-=+/]+')

# 13-19 digit sequences, optionally separated by spaces or dashes: a PAN.
_PAN_PATTERN = re.compile(r'\b(?:\d[ -]?){13,19}\b')

REDACTED = '[REDACTED]'


def _redact(text):
    # Bare tokens first, so a scheme-prefixed value is collapsed before the
    # key=value pass runs over the same span.
    text = _BEARER_PATTERN.sub(lambda m: f'{m.group(1)} {REDACTED}', text)
    text = _KV_PATTERN.sub(
        lambda m: f'{m.group(1)}{m.group(2)}{m.group(1)}{m.group(3)}'
                  f'{m.group(4)}{m.group(5) or ""}{REDACTED}{m.group(4)}',
        text,
    )
    text = _PAN_PATTERN.sub(REDACTED, text)
    return text


class RedactSensitiveFilter(logging.Filter):
    """Redact secrets in the message and its interpolation arguments."""

    def filter(self, record):
        try:
            if isinstance(record.msg, str):
                record.msg = _redact(record.msg)

            if record.args:
                if isinstance(record.args, dict):
                    record.args = {k: self._redact_value(v) for k, v in record.args.items()}
                else:
                    record.args = tuple(self._redact_value(a) for a in record.args)
        except Exception:
            # A logging filter must never raise: that would suppress the very
            # log line being emitted, including during incident response.
            return True
        return True

    @staticmethod
    def _redact_value(value):
        return _redact(value) if isinstance(value, str) else value
