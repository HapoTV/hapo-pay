# HapoPay

> Empowering Student Spending. Shaping Financial Futures.

HapoPay is a parent-child money management platform enabling safe student spending through QR payments, real-time parental controls, and gamified financial education.

## Monorepo Structure

```
Hapo-Pay/
├── backend/      # Django REST API (Python 3.11+)
├── mobile/       # Flutter mobile app (iOS & Android)
├── web/          # React + TypeScript web app
├── docs/         # Architecture & API documentation
└── .github/      # CI/CD workflows
```

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 20+ |
| Flutter SDK | 3.x |

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your values
python manage.py migrate
python manage.py runserver
```

API available at `http://localhost:8000/api/`

### Web App (React + TypeScript)

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

App available at `http://localhost:5173`

### Mobile App (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

## Architecture

- **Backend**: Django + Django REST Framework, PostgreSQL (Supabase), JWT auth
- **Web**: React 18, TypeScript, Vite, TailwindCSS, React Query
- **Mobile**: Flutter 3, Dart, Riverpod state management
- **Shared infra**: Supabase (database, auth, real-time, storage)

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: describe your change'`
4. Push and open a Pull Request

## License

MIT
