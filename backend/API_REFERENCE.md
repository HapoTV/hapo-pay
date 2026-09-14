# HapoPay API Reference

## Base URLs
- Development: http://localhost:8000/api/v1
- Staging: https://staging-api.hapopay.com/api/v1
- Production: https://api.hapopay.com/api/v1

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:

Authorization: Bearer <your_access_token>

Obtain token from POST /api/v1/auth/login/

## Standard Response Format

Success Response:
{
    "status": "success",
    "code": 200,
    "message": "Operation successful",
    "data": {},
    "errors": null
}

Error Response:
{
    "status": "error",
    "code": 400,
    "message": "Validation failed",
    "data": null,
    "errors": {
        "field_name": ["Error message"]
    }
}

Paginated Response:
{
    "status": "success",
    "data": [],
    "pagination": {
        "page": 1,
        "total_pages": 5,
        "total_items": 45,
        "next": "/api/transactions/?page=2",
        "previous": null,
        "page_size": 20
    }
}

---

## Authentication Endpoints

### POST /auth/register/
Register a new user (parent or student)

Request Body:
{
    "email": "parent@example.com",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!",
    "full_name": "John Doe",
    "role": "parent",
    "phone_number": "+27123456789"
}

Response (201 Created):
{
    "status": "success",
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "parent@example.com",
            "role": "parent",
            "is_active": true,
            "created_at": "2026-06-01T10:00:00Z"
        },
        "tokens": {
            "refresh": "eyJhbGciOiJIUzI1NiIs...",
            "access": "eyJhbGciOiJIUzI1NiIs..."
        }
    }
}

### POST /auth/login/
Login with email and password

Request Body:
{
    "email": "parent@example.com",
    "password": "SecurePass123!"
}

Response (200 OK):
{
    "status": "success",
    "message": "Login successful",
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "parent@example.com",
            "role": "parent"
        },
        "profile": {
            "full_name": "John Doe",
            "avatar_url": null
        },
        "tokens": {
            "refresh": "eyJhbGciOiJIUzI1NiIs...",
            "access": "eyJhbGciOiJIUzI1NiIs..."
        }
    }
}

### POST /auth/logout/
Logout and blacklist refresh token

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200 OK):
{
    "status": "success",
    "message": "Logged out successfully"
}

### POST /auth/refresh/
Get new access token using refresh token

Request Body:
{
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200 OK):
{
    "access": "eyJhbGciOiJIUzI1NiIs..."
}

### POST /auth/change-password/
Change user password

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "old_password": "OldPass123!",
    "new_password": "NewPass123!",
    "confirm_password": "NewPass123!"
}

Response (200 OK):
{
    "status": "success",
    "message": "Password changed successfully"
}

### POST /auth/forgot-password/
Request password reset email

Request Body:
{
    "email": "user@example.com"
}

Response (200 OK):
{
    "status": "success",
    "message": "If an account exists, a reset email has been sent"
}

### POST /auth/reset-password/
Reset password using token from email

Request Body:
{
    "token": "reset_token_from_email",
    "new_password": "NewPass123!",
    "confirm_password": "NewPass123!"
}

Response (200 OK):
{
    "status": "success",
    "message": "Password reset successfully"
}

### POST /auth/complete-profile/
Complete user profile after registration

Headers: Authorization: Bearer <access_token>

For Parent Role:
{
    "occupation": "Software Engineer",
    "default_currency": "ZAR"
}

For Student Role:
{
    "parent_email": "parent@example.com",
    "school_name": "Springfield High",
    "grade": 10,
    "weekly_allowance": 100.00,
    "savings_goal": 500.00
}

Response (200 OK):
{
    "status": "success",
    "message": "Profile completed successfully"
}

### GET /auth/profile/
Get current user profile

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john@example.com",
        "role": "parent",
        "full_name": "John Doe",
        "avatar_url": null,
        "phone_number": "+27123456789",
        "date_of_birth": null,
        "address": null,
        "city": null,
        "country": "South Africa",
        "created_at": "2026-06-01T10:00:00Z"
    }
}

### PUT /auth/profile/
Update user profile

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "full_name": "John Smith",
    "avatar_url": "https://...",
    "date_of_birth": "1990-01-01",
    "address": "123 Main St",
    "city": "Cape Town",
    "country": "South Africa"
}

Response (200 OK):
{
    "status": "success",
    "data": {
        "full_name": "John Smith",
        "avatar_url": "https://..."
    }
}

---

## Parent Endpoints

### GET /parent/wallet/
Get parent wallet balance

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": {
        "id": "wallet-uuid",
        "balance": 1500.00,
        "currency": "ZAR",
        "is_active": true,
        "created_at": "2026-06-01T10:00:00Z"
    }
}

### POST /parent/transfer/
Transfer funds to child

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "recipient_id": "child-uuid-here",
    "amount": 100.00,
    "description": "Weekly allowance"
}

Response (200 OK):
{
    "status": "success",
    "message": "Transfer completed successfully",
    "data": {
        "sender_balance": 1400.00,
        "recipient_balance": 250.00
    }
}

### GET /parent/children/
List all children linked to parent

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "child-uuid-1",
            "email": "child1@example.com",
            "full_name": "Jane Doe",
            "grade": 10,
            "school_name": "Springfield High",
            "wallet_balance": 150.00,
            "is_account_frozen": false,
            "created_at": "2026-06-01T10:00:00Z"
        },
        {
            "id": "child-uuid-2",
            "email": "child2@example.com",
            "full_name": "Jim Doe",
            "grade": 8,
            "school_name": "Springfield High",
            "wallet_balance": 75.00,
            "is_account_frozen": false,
            "created_at": "2026-06-02T10:00:00Z"
        }
    ]
}

### POST /parent/children/
Add a new child

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "email": "newchild@example.com",
    "full_name": "New Child",
    "grade": 9,
    "school_name": "Springfield High",
    "weekly_allowance": 50.00
}

Response (201 Created):
{
    "status": "success",
    "message": "Child added successfully",
    "data": {
        "id": "new-child-uuid",
        "email": "newchild@example.com",
        "full_name": "New Child"
    }
}

### GET /parent/children/{child_id}/transactions/
Get child's transaction history with pagination and filters

Headers: Authorization: Bearer <access_token>

Query Parameters:
- page: Page number (default: 1)
- page_size: Items per page (default: 20, max: 100)
- type: Filter by transaction type (payment, transfer, deposit, refund)
- category: Filter by category (food, transport, shopping, entertainment, education, health, savings, airtime, other)
- start_date: ISO date filter (2026-01-01)
- end_date: ISO date filter (2026-01-31)
- ordering: Sort by field (-created_at for newest first)

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "txn-uuid",
            "amount": 50.00,
            "type": "payment",
            "category": "food",
            "status": "completed",
            "description": "Lunch at school",
            "merchant_name": "School Cafeteria",
            "created_at": "2026-06-01T12:30:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "total_pages": 3,
        "total_items": 45,
        "next": "/api/parent/children/child-uuid/transactions/?page=2",
        "previous": null,
        "page_size": 20
    }
}

### GET /parent/children/{child_id}/spending-limits/
Get spending limits for a child

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "limit-uuid",
            "category": "entertainment",
            "daily_limit": 50.00,
            "daily_spent": 25.00,
            "weekly_limit": 200.00,
            "weekly_spent": 75.00,
            "monthly_limit": 500.00,
            "monthly_spent": 150.00,
            "is_enabled": true,
            "remaining_today": 25.00,
            "remaining_weekly": 125.00,
            "remaining_monthly": 350.00
        }
    ]
}

### PUT /parent/children/{child_id}/spending-limits/
Update spending limits for a child

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "category": "entertainment",
    "daily_limit": 75.00,
    "weekly_limit": 250.00,
    "monthly_limit": 600.00,
    "is_enabled": true
}

Response (200 OK):
{
    "status": "success",
    "message": "Spending limit updated successfully",
    "data": {
        "id": "limit-uuid",
        "category": "entertainment",
        "daily_limit": 75.00,
        "weekly_limit": 250.00,
        "monthly_limit": 600.00,
        "is_enabled": true
    }
}

### GET /parent/money-requests/
Get all money requests from children

Headers: Authorization: Bearer <access_token>

Query Parameters:
- status: Filter by status (pending, approved, declined, cancelled)

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "request-uuid",
            "child_id": "child-uuid",
            "child_name": "Jane Doe",
            "amount": 50.00,
            "reason": "Need money for school supplies",
            "status": "pending",
            "created_at": "2026-06-01T10:00:00Z"
        }
    ]
}

### POST /parent/money-requests/{request_id}/approve/
Approve a money request from child

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "parent_notes": "Approved for books"
}

Response (200 OK):
{
    "status": "success",
    "message": "Money request approved"
}

### POST /parent/money-requests/{request_id}/decline/
Decline a money request from child

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "parent_notes": "Not this week"
}

Response (200 OK):
{
    "status": "success",
    "message": "Money request declined"
}

### POST /parent/freeze-account/{child_id}/
Temporarily freeze child's account

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "freeze_reason": "Lost card reported"
}

Response (200 OK):
{
    "status": "success",
    "message": "Account frozen successfully"
}

### POST /parent/unfreeze-account/{child_id}/
Unfreeze child's account

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "message": "Account unfrozen successfully"
}

### GET /parent/analytics/spending/
Get spending analytics dashboard

Headers: Authorization: Bearer <access_token>

Query Parameters:
- child_id: Filter by specific child (optional)
- period: week, month, year (default: month)

Response (200 OK):
{
    "status": "success",
    "data": {
        "period": "month",
        "total_spent": 450.00,
        "total_saved": 200.00,
        "average_daily": 15.00,
        "category_breakdown": [
            {
                "category": "food",
                "total": 200.00,
                "percentage": 44.4,
                "count": 15
            },
            {
                "category": "entertainment",
                "total": 150.00,
                "percentage": 33.3,
                "count": 5
            },
            {
                "category": "transport",
                "total": 100.00,
                "percentage": 22.2,
                "count": 8
            }
        ],
        "daily_spending": [
            {
                "date": "2026-06-01",
                "total": 50.00
            },
            {
                "date": "2026-06-02",
                "total": 30.00
            }
        ],
        "top_merchants": [
            {
                "merchant_name": "School Cafeteria",
                "total": 120.00,
                "count": 10
            }
        ],
        "transaction_count": 28
    }
}

### GET /parent/transactions/
Get parent's own transaction history

Headers: Authorization: Bearer <access_token>

Query Parameters: Same as child transactions endpoint

Response: Same format as child transactions

---

## Student Endpoints

### GET /student/wallet/
Get student wallet balance

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": {
        "id": "wallet-uuid",
        "balance": 250.00,
        "currency": "ZAR",
        "is_active": true
    }
}

### GET /student/transactions/
Get student's transaction history

Headers: Authorization: Bearer <access_token>

Query Parameters: Same as parent transactions endpoint

Response: Same format as parent transactions

### POST /student/money-requests/
Request money from parent

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "amount": 50.00,
    "reason": "Need money for school trip"
}

Response (201 Created):
{
    "status": "success",
    "message": "Money request sent successfully",
    "data": {
        "id": "request-uuid",
        "amount": 50.00,
        "reason": "Need money for school trip",
        "status": "pending",
        "created_at": "2026-06-01T10:00:00Z"
    }
}

### GET /student/money-requests/
Get student's money request history

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "request-uuid",
            "amount": 50.00,
            "reason": "Need money for school trip",
            "status": "approved",
            "parent_notes": "Have fun!",
            "created_at": "2026-06-01T10:00:00Z",
            "responded_at": "2026-06-01T12:00:00Z"
        }
    ]
}

### GET /student/spending-limits/
View personal spending limits

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "category": "entertainment",
            "daily_limit": 50.00,
            "daily_spent": 25.00,
            "remaining_today": 25.00,
            "weekly_limit": 200.00,
            "weekly_spent": 75.00,
            "remaining_weekly": 125.00
        }
    ]
}

### GET /student/rewards/
View rewards and points

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": {
        "points": 1250,
        "level": 2,
        "next_level_points": 2000,
        "streak_days": 15,
        "total_saved": 500.00,
        "total_spent": 750.00,
        "points_to_next_level": 750,
        "recent_achievements": [
            {
                "id": "achievement-uuid",
                "name": "First Purchase",
                "description": "Made your first purchase",
                "earned_at": "2026-06-01T10:00:00Z",
                "badge_icon": "/icons/first-purchase.png"
            }
        ]
    }
}

### GET /student/achievements/
View all achievements and progress

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "achievement-uuid",
            "name": "First Purchase",
            "description": "Made your first purchase",
            "points_required": 100,
            "badge_icon": "/icons/first-purchase.png",
            "category": "spending",
            "earned": true,
            "earned_at": "2026-06-01T10:00:00Z"
        },
        {
            "id": "achievement-uuid-2",
            "name": "Savings Champion",
            "description": "Save R500 in a month",
            "points_required": 500,
            "badge_icon": "/icons/savings-champion.png",
            "category": "saving",
            "earned": false,
            "progress": 300,
            "progress_percentage": 60
        }
    ]
}

### GET /student/challenges/
View active challenges

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "challenge-uuid",
            "title": "No Takeout Week",
            "description": "Don't order takeout for 7 days",
            "challenge_type": "streak",
            "target_value": 7,
            "reward_points": 200,
            "start_date": "2026-06-01T00:00:00Z",
            "end_date": "2026-06-08T00:00:00Z",
            "joined": true,
            "progress": 3,
            "status": "active"
        }
    ]
}

### POST /student/challenges/{challenge_id}/join/
Join a challenge

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "message": "Joined challenge successfully",
    "data": {
        "id": "user-challenge-uuid",
        "challenge_id": "challenge-uuid",
        "progress": 0,
        "status": "active"
    }
}

### GET /student/leaderboard/
View global leaderboard

Headers: Authorization: Bearer <access_token>

Query Parameters:
- limit: Number of top users to show (default: 50, max: 100)

Response (200 OK):
{
    "status": "success",
    "data": {
        "leaderboard": [
            {
                "rank": 1,
                "user_name": "John Doe",
                "points": 5000,
                "level": 5,
                "avatar": "https://..."
            }
        ],
        "user_rank": 42,
        "user_points": 1250,
        "total_participants": 1250
    }
}

---

## Payment Endpoints

### POST /payments/qr/generate/
Generate QR code for payment (Merchant or Admin only)

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "merchant_id": "merchant-uuid",
    "amount": 25.00,
    "description": "Coffee purchase",
    "expires_in_minutes": 15
}

Response (201 Created):
{
    "status": "success",
    "data": {
        "qr_id": "qr-uuid",
        "qr_image": "base64_encoded_image_data",
        "expires_at": "2026-06-01T12:30:00Z",
        "amount": 25.00,
        "merchant": "Coffee Shop"
    }
}

### POST /payments/qr/pay/
Scan QR code and make payment

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "qr_id": "qr-uuid"
}

Response (200 OK):
{
    "status": "success",
    "message": "Payment successful",
    "data": {
        "transaction_id": "txn-uuid",
        "amount": 25.00,
        "merchant": "Coffee Shop",
        "balance": 175.00,
        "points_earned": 2,
        "timestamp": "2026-06-01T12:30:00Z"
    }
}

Error Response (400 Bad Request):
{
    "status": "error",
    "code": 400,
    "message": "Insufficient balance",
    "data": null,
    "errors": null
}

### POST /payments/nfc/register/
Register NFC device for tap-to-pay

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "device_id": "device_mac_address_or_unique_id"
}

Response (201 Created):
{
    "status": "success",
    "data": {
        "token": "nfc_token_here_32_chars",
        "device_id": "device_mac_address_or_unique_id",
        "expires_at": "2027-06-01T00:00:00Z",
        "is_active": true
    }
}

### POST /payments/nfc/pay/
Make payment using NFC tap

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "token": "nfc_token_here_32_chars",
    "amount": 15.50,
    "merchant_id": "merchant-uuid"
}

Response (200 OK):
{
    "status": "success",
    "message": "NFC payment successful",
    "data": {
        "transaction_id": "txn-uuid",
        "amount": 15.50,
        "balance": 159.50,
        "merchant": "Coffee Shop"
    }
}

### POST /payments/airtime/buy/
Purchase mobile airtime

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "phone_number": "0712345678",
    "amount": 50.00,
    "provider": "vodacom"
}

Provider Options: vodacom, mtn, cellc, telkom, rain

Response (200 OK):
{
    "status": "success",
    "message": "Airtime purchased successfully",
    "data": {
        "purchase_id": "purchase-uuid",
        "transaction_id": "provider-transaction-id",
        "phone_number": "0712345678",
        "amount": 50.00,
        "provider": "vodacom",
        "status": "completed",
        "completed_at": "2026-06-01T12:30:00Z"
    }
}

Error Response (400 Bad Request):
{
    "status": "error",
    "code": 400,
    "message": "Insufficient balance for airtime purchase",
    "data": null,
    "errors": null
}

### GET /payments/airtime/history/
View airtime purchase history

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "purchase-uuid",
            "phone_number": "0712345678",
            "amount": 50.00,
            "provider": "vodacom",
            "status": "completed",
            "created_at": "2026-06-01T10:00:00Z",
            "completed_at": "2026-06-01T10:00:05Z"
        }
    ]
}

### POST /payments/transport/buy/
Purchase transport ticket

Headers: Authorization: Bearer <access_token>

Request Body:
{
    "ticket_type": "bus",
    "route": "JHB-CPT",
    "departure_time": "2026-06-10T09:00:00Z",
    "arrival_time": "2026-06-10T18:00:00Z",
    "amount": 450.00,
    "seat_number": "12A"
}

Ticket Types: bus, train, taxi, uber, bolt

Response (200 OK):
{
    "status": "success",
    "message": "Ticket purchased successfully",
    "data": {
        "ticket_id": "ticket-uuid",
        "reference": "TKT123456",
        "qr_code": "base64_encoded_ticket_qr",
        "ticket_type": "bus",
        "route": "JHB-CPT",
        "departure_time": "2026-06-10T09:00:00Z",
        "arrival_time": "2026-06-10T18:00:00Z",
        "seat_number": "12A",
        "amount": 450.00,
        "status": "confirmed"
    }
}

### GET /payments/transport/tickets/
View transport ticket history

Headers: Authorization: Bearer <access_token>

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "ticket-uuid",
            "ticket_type": "bus",
            "route": "JHB-CPT",
            "departure_time": "2026-06-10T09:00:00Z",
            "amount": 450.00,
            "status": "confirmed",
            "qr_code": "base64_encoded_ticket_qr",
            "created_at": "2026-06-01T10:00:00Z"
        }
    ]
}

### GET /payments/merchants/
List verified merchants

Headers: Authorization: Bearer <access_token> (optional - public endpoint)

Query Parameters:
- category: Filter by category (retail, restaurant, transport, entertainment, education, healthcare, airtime, other)
- search: Search by merchant name
- verified: Filter by verified status (default: true)

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "merchant-uuid",
            "name": "Coffee Shop",
            "category": "restaurant",
            "address": "123 Main St, Cape Town",
            "logo_url": "https://...",
            "verified": true
        }
    ]
}

### GET /payments/merchants/{merchant_id}/
Get merchant details

Headers: Authorization: Bearer <access_token> (optional)

Response (200 OK):
{
    "status": "success",
    "data": {
        "id": "merchant-uuid",
        "name": "Coffee Shop",
        "category": "restaurant",
        "address": "123 Main St, Cape Town",
        "phone": "+27123456789",
        "email": "info@coffeeshop.com",
        "logo_url": "https://...",
        "verified": true,
        "verified_at": "2026-01-01T00:00:00Z"
    }
}

---

## WebSocket Endpoints

### WebSocket /ws/notifications/
Connect to receive real-time notifications

Headers: Must include authentication token in connection query string

Connection URL:
ws://localhost:8000/ws/notifications/?token=<access_token>

Messages Received Format:
{
    "type": "notification",
    "notification": {
        "id": "notif-uuid",
        "title": "New Transaction",
        "body": "You spent R50.00 at Coffee Shop",
        "type": "transaction",
        "created_at": "2026-06-01T10:00:00Z",
        "metadata": {
            "transaction_id": "txn-uuid",
            "amount": 50.00
        }
    }
}

Notification Types:
- transaction: New transaction completed
- transfer: Money received or sent
- money_request: New money request
- money_request_approved: Request approved
- money_request_declined: Request declined
- alert: Low balance or spending limit alert
- spending_alert: Child spending notification for parent
- achievement: New achievement unlocked
- promotion: Promotional message
- system: System notification

### WebSocket /ws/wallet/{user_id}/
Connect to receive real-time wallet updates

Connection URL:
ws://localhost:8000/ws/wallet/{user_id}/?token=<access_token>

Messages Received Format:

Balance Update:
{
    "type": "balance_update",
    "balance": 150.00,
    "currency": "ZAR",
    "timestamp": "2026-06-01T10:00:00Z"
}

Transaction Notification:
{
    "type": "transaction",
    "transaction": {
        "id": "txn-uuid",
        "amount": 25.00,
        "type": "payment",
        "category": "food",
        "description": "Coffee purchase",
        "merchant_name": "Coffee Shop",
        "created_at": "2026-06-01T10:00:00Z"
    },
    "timestamp": "2026-06-01T10:00:00Z"
}

---

## Admin Endpoints

### GET /admin/users/
List all users (Admin only)

Headers: Authorization: Bearer <access_token> (Admin role required)

Query Parameters:
- role: Filter by role (parent, student, admin)
- is_active: Filter by active status (true, false)
- search: Search by email or name
- page: Page number
- page_size: Items per page

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "user-uuid",
            "email": "user@example.com",
            "role": "parent",
            "is_active": true,
            "profile_name": "John Doe",
            "created_at": "2026-01-01T00:00:00Z",
            "last_login": "2026-06-01T10:00:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "total_pages": 10,
        "total_items": 200
    }
}

### PUT /admin/users/{user_id}/
Update user (Admin only)

Headers: Authorization: Bearer <access_token> (Admin role required)

Request Body:
{
    "role": "parent",
    "is_active": false
}

Response (200 OK):
{
    "status": "success",
    "message": "User updated successfully"
}

### GET /admin/merchants/pending/
List pending merchant verifications (Admin only)

Headers: Authorization: Bearer <access_token> (Admin role required)

Response (200 OK):
{
    "status": "success",
    "data": [
        {
            "id": "merchant-uuid",
            "name": "New Coffee Shop",
            "business_registration": "2020/123456/07",
            "category": "restaurant",
            "email": "info@newcoffee.com",
            "phone": "+27123456789",
            "address": "456 New St",
            "created_at": "2026-06-01T10:00:00Z"
        }
    ]
}

### POST /admin/merchants/{merchant_id}/verify/
Verify a merchant (Admin only)

Headers: Authorization: Bearer <access_token> (Admin role required)

Request Body:
{
    "verified": true
}

Response (200 OK):
{
    "status": "success",
    "message": "Merchant verified successfully"
}

### GET /admin/analytics/
Get platform analytics (Admin only)

Headers: Authorization: Bearer <access_token> (Admin role required)

Query Parameters:
- period: week, month, year (default: month)

Response (200 OK):
{
    "status": "success",
    "data": {
        "period": "month",
        "total_users": 1250,
        "active_users": 890,
        "total_transactions": 5432,
        "total_volume": 125000.00,
        "pending_alerts": 12,
        "user_growth": [
            {
                "month": "2026-01",
                "new_users": 120,
                "total_users": 120
            },
            {
                "month": "2026-02",
                "new_users": 150,
                "total_users": 270
            }
        ],
        "revenue_by_category": [
            {
                "category": "food",
                "total": 45000.00,
                "percentage": 36
            },
            {
                "category": "transport",
                "total": 35000.00,
                "percentage": 28
            }
        ],
        "transaction_trend": [
            {
                "date": "2026-06-01",
                "count": 180,
                "volume": 4500.00
            }
        ]
    }
}

### GET /admin/fraud-alerts/
List fraud alerts (Admin only)

Headers: Authorization: Bearer <access_token> (Admin role required)

Query Parameters:
- status: Filter by status (pending, investigating, confirmed, false_positive, resolved)
- severity: Filter by severity (low, medium, high, critical)

Response (