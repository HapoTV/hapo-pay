# HapoPay Backend Roadmap

**Project**: HapoPay - Smart Student Spending Platform  
**Backend**: Django 4.2 + Supabase (PostgreSQL + Auth)  
**Current Version**: 1.0 (MVP Complete)  
**Next Version**: 2.0 (AI-Powered Expense Tracking)  
**Last Updated**: 2026

---

## 🎯 Vision

Build a secure, scalable, and intelligent backend that powers a parent-child money management platform with QR payments, NFC tap-to-pay, airtime purchases, transport tickets, spending limits, and gamified financial education.

---

## 📊 Current Status Overview

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1: MVP (v1.0)** | ✅ Complete | 100% |
| **Phase 2: Enhanced (v1.5)** | 🔧 In Progress | 60% |
| **Phase 3: AI Expense Tracker (v2.0)** | ❌ Planned | 0% |
| **Phase 4: Native Mobile (v3.0)** | ❌ Planned | 0% |

---

## ✅ Phase 1: MVP (v1.0) — COMPLETED

### Core Infrastructure
- [x] Django 4.2 project setup
- [x] Supabase PostgreSQL integration
- [x] Supabase Auth integration (JWT)
- [x] Row Level Security (RLS) policies
- [x] Redis cache + Channels (WebSocket)
- [x] Celery + Celery Beat (scheduled tasks)
- [x] Docker + docker-compose setup
- [x] Nginx reverse proxy config
- [x] Structured logging
- [x] Environment-based configuration

### Authentication & Roles
- [x] Custom User model (UUID primary key)
- [x] Three roles: Parent, Student, Admin
- [x] JWT-based authentication (access + refresh)
- [x] Register / Login / Logout endpoints
- [x] Password change / Forgot / Reset flow
- [x] Profile creation + completion flow
- [x] Role-based permissions
- [x] Axes brute-force protection

### Wallets & Transactions
- [x] Wallet model (balance, currency, is_active)
- [x] Transaction model (type, category, status, fraud flags)
- [x] Atomic transfers via `WalletService` with `select_for_update()`
- [x] Deposit and deduct flows
- [x] Spending limit enforcement (daily/weekly/monthly per category)
- [x] Money request flow (child → parent, approve/decline)
- [x] Transaction history + filtering
- [x] Spending analytics endpoint

### Family Management
- [x] Add child (creates User + Profile + StudentProfile + Wallet)
- [x] Update child details
- [x] Unlink child (soft removal)
- [x] Freeze / Unfreeze child account
- [x] View child transactions

### Payments
- [x] Merchant model + verification
- [x] QR code generation
- [x] QR payment processing
- [x] NFC token registration
- [x] NFC tap-to-pay
- [x] Airtime purchase (Vodacom, MTN, Cell C, Telkom, Rain)
- [x] Transport ticket purchase (bus, train, taxi, Uber, Bolt)
- [x] Fraud detection hooks

### Gamification
- [x] Reward model (points, level, streak)
- [x] Achievement model + user achievements
- [x] Challenges (spending, saving, streak)
- [x] Leaderboard
- [x] Point calculation service

### Notifications
- [x] Notification model
- [x] Notification preferences
- [x] Email notifications
- [x] Push notification hooks (Firebase)
- [x] WebSocket real-time notifications
- [x] WebSocket wallet updates

### Admin Panel
- [x] User management
- [x] Merchant verification
- [x] Platform analytics
- [x] Fraud alerts
- [x] System config
- [x] Audit logs

### Documentation
- [x] Swagger / OpenAPI (drf-yasg)
- [x] Frontend API documentation
- [x] Architecture diagrams (Mermaid)
- [x] Deployment guide
- [x] Security policy
- [x] Contributing guidelines

---

## 🔧 Phase 2: Enhanced (v1.5) — IN PROGRESS

### Security & Compliance
- [x] Axes brute-force protection
- [x] Rate limiting middleware
- [x] Audit log middleware
- [x] RLS middleware for Supabase context
- [ ] Two-Factor Authentication (TOTP)
- [ ] Session management dashboard (view/revoke sessions)
- [ ] POPIA compliance checklist
- [ ] GDPR data export endpoint
- [ ] Data retention policy enforcement

### Payments Expansion
- [x] Airtime purchase
- [x] Transport ticket
- [ ] Bill payments (electricity, water)
- [ ] Voucher purchases (gaming, streaming)
- [ ] Recurring payments (subscriptions)
- [ ] Merchant payout system (settle merchant balances)
- [ ] Refund flow with audit trail
- [ ] Dispute resolution workflow

### Analytics & Reporting
- [x] Basic spending analytics
- [ ] PDF monthly statements
- [ ] CSV export of transactions
- [ ] Parental weekly email digest
- [ ] Child spending trend analysis
- [ ] Merchant category insights
- [ ] Budget forecasting (basic)

### Notifications
- [x] Email notifications
- [x] WebSocket real-time
- [x] Push notification hooks
- [ ] SMS notifications (Twilio integration)
- [ ] WhatsApp Business API
- [ ] Notification digest batching

### Admin & Operations
- [x] Admin panel
- [x] Platform analytics
- [x] Fraud alerts
- [ ] Bulk user import (CSV)
- [ ] Feature flags system
- [ ] A/B testing framework
- [ ] Support ticket system

### Developer Experience
- [x] Swagger documentation
- [x] Docker setup
- [ ] GraphQL API layer (optional)
- [ ] SDK for frontend (TypeScript)
- [ ] Postman collection
- [ ] Automated API contract tests

---

## 🚀 Phase 3: AI Expense Tracker (v2.0) — PLANNED

### AI/ML Infrastructure
- [ ] Model serving infrastructure (TensorFlow Serving / ONNX)
- [ ] Feature store setup
- [ ] Training pipeline (Airflow / Prefect)
- [ ] Model versioning (MLflow)
- [ ] A/B testing for models

### Smart Logging
- [ ] Voice entry → auto-categorization
- [ ] Receipt OCR → structured expense
- [ ] Camera-based expense capture
- [ ] Smart merchant matching
- [ ] Auto-tagging with ML

### Predictive Analytics
- [ ] Monthly spending forecast
- [ ] Budget exhaustion prediction
- [ ] Personalized savings recommendations
- [ ] Anomaly detection (unusual spending)
- [ ] Category drift detection

### Intelligent Insights
- [ ] Monthly AI-generated summary
- [ ] Comparison to peer group (anonymized)
- [ ] "You spent X% more on Y this month"
- [ ] "Transport budget will run out in N days"
- [ ] Savings opportunity detection

### Advanced Gamification
- [ ] Savings challenges with AI difficulty tuning
- [ ] Streak prediction and reminders
- [ ] Social features (family leaderboards)
- [ ] Brand partnerships (discounts)
- [ ] Challenge recommendation engine

### Smart Financial Features
- [ ] Smart rounding (R37 → R40, save R3)
- [ ] Automatic spare-change savings
- [ ] Investment integration (EasyEquities, etc.)
- [ ] Group expenses (shared wallets)
- [ ] Bill splitting with settlement

---

## 📱 Phase 4: Native Mobile (v3.0) — PLANNED

### Mobile Infrastructure
- [ ] Flutter project setup
- [ ] Shared code with web backend
- [ ] Offline-first sync engine
- [ ] Background sync for transactions
- [ ] Push notification native integration

### Native Features
- [ ] Biometric authentication (FaceID / fingerprint)
- [ ] Native QR scanner
- [ ] NFC tap-to-pay (HCE)
- [ ] Camera receipt capture
- [ ] Voice entry with on-device processing
- [ ] Offline transaction queuing

### Platform Integration
- [ ] Apple Pay / Google Pay
- [ ] Physical debit card integration
- [ ] Open Banking (South African banks)
- [ ] Cryptocurrency wallet (teens)
- [ ] Investment education module

---

## 🎯 Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| v1.0 MVP Released | Q1 2026 | ✅ Done |
| v1.5 Enhanced Released | Q2 2026 | 🔧 In Progress |
| v2.0 AI Expense Tracker | Q4 2026 | ❌ Planned |
| v3.0 Native Mobile | Q2 2027 | ❌ Planned |

---

## 📈 Success Metrics

| Metric | Current | Target (v1.5) | Target (v2.0) |
|--------|---------|---------------|---------------|
| API Response Time (p95) | < 300ms | < 200ms | < 150ms |
| Uptime | 99.5% | 99.9% | 99.95% |
| Test Coverage | 65% | 85% | 90% |
| Active Parents | - | 1,000 | 10,000 |
| Active Students | - | 3,000 | 30,000 |
| Monthly Transactions | - | 50,000 | 500,000 |
| Fraud Detection Accuracy | 70% | 90% | 95% |

---

## 🛠 Technology Evolution

| Layer | v1.0 | v2.0 | v3.0 |
|-------|------|------|------|
| Backend | Django 4.2 | Django 5.0 | Django 5.x |
| Database | Supabase PostgreSQL | Supabase + TimescaleDB | Distributed Postgres |
| Cache | Redis | Redis Cluster | Redis Cluster |
| AI/ML | None | TensorFlow + ONNX | Custom ML platform |
| Mobile | None | None | Flutter |
| Payments | QR/NFC | + Card + Open Banking | + Crypto |
| Notifications | Email + WS | + SMS + WhatsApp | + Native Push |

---

## 📞 Contact & Contributions

For roadmap questions or feature requests:
- **Email**: roadmap@hapopay.com
- **GitHub Issues**: Feature requests welcome
- **Monthly Review**: Last Friday of each month

---

**This roadmap is a living document and will be updated as the project evolves.**