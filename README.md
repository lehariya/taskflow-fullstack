# TaskFlow – Todo Tracker & Product Explorer

A fresher-friendly full-stack portfolio project implementing both assignment tasks in one application.

## Features

### Task 1A – Todo Tracker
- Create, edit and delete tasks.
- Every successful edit increments that task's `update_count` by one.
- Counter and task title persist in SQLite across refreshes.
- Clear validation and loading/success/error states.

### Task 1B – Bulk task creation
- Enter `Make Food 3` to create three separate tasks named `Make Food`.
- A task without a trailing number creates one task.
- Quantity is limited to 1–50 to avoid accidental huge submissions.

### Task 2 – Product Explorer
- Fetches the product list from Fake Store API through the Flask backend.
- Responsive product grid with image, title, category, price and rating.
- Search by title and filter by category.
- Select a product to open its detail page, including description and rating.

## Technology choices

- **React + Vite:** reusable components and fast frontend development.
- **React Router:** navigation between Todo, product grid and product detail.
- **Flask:** Python REST API and application business logic.
- **SQLite + Flask-SQLAlchemy:** lightweight persistent task storage.
- **Fake Store API:** external sample product catalog.
- **Lucide React:** interface icons.

## Architecture

```text
Browser
  |
  | React UI / fetch()
  v
Flask REST API (http://localhost:5000)
  |                       |
  v                       v
SQLite database       Fake Store API
(todos table)         (products)
```

The browser calls Flask for both features. Flask persists Todo records in SQLite and proxies product requests to `https://fakestoreapi.com`. No API key is required for Fake Store API.

## Folder structure

```text
taskflow_fullstack/
├── backend/
│   ├── app.py                 # Flask routes, model and app factory
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Backend configuration template
│   └── tests/
│       └── test_api.py        # Todo API tests
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── main.jsx
│       ├── styles.css
│       └── pages/
│           ├── TodoPage.jsx
│           ├── ProductsPage.jsx
│           └── ProductDetail.jsx
├── .gitignore
└── README.md
```

## Run locally (Windows PowerShell)

Prerequisites: Python 3.10+ and Node.js 18+.

### 1. Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python app.py
```

The API runs at `http://localhost:5000`. The SQLite database is created automatically as `backend/taskflow.db` on first startup.

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate again.

### 2. Frontend (open a second terminal)

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`.

### macOS/Linux equivalents

Backend virtual environment activation: `source .venv/bin/activate`. Copy env files with `cp .env.example .env`.

## Environment variables

Backend `.env`:
- `DATABASE_URL`: SQLite URL by default. For production, set a persistent database URL supported by SQLAlchemy.
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS.
- `PORT`: server port (default 5000).
- `LOG_LEVEL`: logging level.

Frontend `.env`:
- `VITE_API_BASE_URL`: API root, default `http://localhost:5000/api`.

Never commit real credentials. The supplied env files contain placeholders/defaults only.

## REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/todos` | List tasks |
| POST | `/api/todos` | Create one or multiple tasks |
| PUT | `/api/todos/:id` | Rename task and increment counter |
| DELETE | `/api/todos/:id` | Delete task |
| GET | `/api/products` | Fetch product collection |
| GET | `/api/products/:id` | Fetch one product |

Example create request:

```json
{ "title": "Make Food 3" }
```

Example response (shortened):

```json
{
  "count": 3,
  "created": [
    { "id": 1, "title": "Make Food", "update_count": 0 }
  ]
}
```

The actual `created` array contains all three created tasks.

## Run tests

From the `backend` directory with the virtual environment active:

```powershell
python -m unittest discover -s tests -v
```

The tests cover health, adding, bulk creation, edit counter, validation and deletion. Product endpoints call the live Fake Store API and are not mocked by this test suite.

## Deployment notes

This source package is ready to deploy, but it has **not been deployed** and no public URL is claimed.

A practical deployment:
1. Push this folder to a GitHub repository.
2. Deploy `backend` as a Python web service on Render (build: `pip install -r requirements.txt`; start: `gunicorn app:app`).
3. Configure `FRONTEND_ORIGIN` on the backend to your deployed frontend URL.
4. Deploy `frontend` on Vercel. Build command: `npm run build`; publish directory: `dist`.
5. Set `VITE_API_BASE_URL` on the frontend to `https://YOUR-BACKEND-DOMAIN/api`, then redeploy the frontend.

**Persistence warning:** SQLite on many free hosting instances may be ephemeral. Use a persistent disk or a managed PostgreSQL database for production. Set `DATABASE_URL` to the provider's SQLAlchemy-compatible connection URL. Configure CORS to the exact deployed frontend origin.

