# core/utils.py
import uuid
import random
import string
from django.utils import timezone
from datetime import timedelta

def generate_reference(prefix='HAP'):
    """Generate unique reference number"""
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    random_part = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}{timestamp}{random_part}"

def generate_otp(length=6):
    """Generate OTP code"""
    return ''.join(random.choices(string.digits, k=length))

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