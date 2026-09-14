# core/utils.py
import uuid
import secrets
import string
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from datetime import timedelta


def parse_date_param(value):
    """Parse a user-supplied date/datetime filter value.

    Returns a datetime/date, or raises ValueError. Views previously passed the
    raw query-string value straight into `created_at__gte=...`, where a
    malformed value surfaced as an unhandled ValidationError (HTTP 500) rather
    than a 400.
    """
    parsed = parse_datetime(value) or parse_date(value)
    if parsed is None:
        raise ValueError(f"Invalid date value: {value!r}")
    return parsed

def generate_reference(prefix='HAP'):
    """Generate unique reference number.

    Uses secrets rather than random: the random module is a Mersenne Twister
    whose state is recoverable from output, which would make references (and
    therefore transaction identifiers) predictable.
    """
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    random_part = ''.join(secrets.choice(string.digits) for _ in range(6))
    return f"{prefix}{timestamp}{random_part}"

def generate_otp(length=6):
    """Generate OTP code.

    secrets, not random: an OTP generated from a predictable PRNG can be
    derived by an attacker who has observed earlier codes, defeating the
    second factor entirely.
    """
    return ''.join(secrets.choice(string.digits) for _ in range(length))

def calculate_expiry(minutes=15):
    """Calculate expiry datetime"""
    return timezone.now() + timedelta(minutes=minutes)

def mask_email(email):
    """Mask email for privacy"""
    if '@' not in email:
        return email
    local, domain = email.split('@')
    if len(local) <= 3:
        masked_local = '*' * len(local)
    else:
        masked_local = local[:2] + '*' * (len(local) - 4) + local[-2:]
    return f"{masked_local}@{domain}"

def mask_phone(phone):
    """Mask phone number for privacy"""
    if len(phone) <= 8:
        return '*' * len(phone)
    return phone[:3] + '*' * (len(phone) - 6) + phone[-3:]

def format_currency(amount, currency='ZAR'):
    """Format currency amount"""
    return f"{currency} {amount:,.2f}"