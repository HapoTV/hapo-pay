# HapoPay Backend Testing Guide

**Version**: 1.0  
**Last Updated**: 2026  
**Test Framework**: pytest + pytest-django + factory-boy

---

## 🎯 Testing Philosophy

Every feature must have:
1. **Unit tests** for models, services, and serializers
2. **Integration tests** for API endpoints
3. **Edge case tests** for error conditions
4. **Security tests** for authorization and permission boundaries

**Minimum Coverage Target**: 85%

---

## 🛠 Test Stack

| Tool | Purpose |
|------|---------|
| `pytest` | Test runner |
| `pytest-django` | Django integration |
| `factory-boy` | Test data generation |
| `faker` | Realistic fake data |
| `coverage` | Coverage reporting |
| `freezegun` | Time mocking (optional) |
| `responses` | HTTP mocking for external APIs |

---

## 📁 Test Structure

tests/
├── init.py
├── conftest.py # Shared fixtures
├── factories/ # factory-boy factories
│ ├── init.py
│ ├── user_factory.py
│ ├── wallet_factory.py
│ ├── transaction_factory.py
│ ├── merchant_factory.py
│ └── money_request_factory.py
├── test_accounts.py # Auth + user tests
├── test_wallets.py # Wallet + transaction tests
├── test_payments.py # QR/NFC/airtime/transport tests
├── test_gamification.py # Rewards/achievements tests
├── test_admin_panel.py # Admin tests
├── test_notifications.py # Notification tests
├── test_services.py # Service layer tests
├── test_security.py # Security/permission tests
└── test_integration/ # End-to-end flows
├── init.py
├── test_parent_flow.py
├── test_student_flow.py
└── test_payment_flow.py

---

## 🏭 Setting Up Tests

### Install Test Dependencies

```bash
pip install pytest pytest-django factory-boy faker coverage responses