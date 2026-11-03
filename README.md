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
4. Deploy `frontend` on Netlify or Vercel. Build command: `npm run build`; publish directory: `dist`.
5. Set `VITE_API_BASE_URL` on the frontend to `https://YOUR-BACKEND-DOMAIN/api`, then redeploy the frontend.

**Persistence warning:** SQLite on many free hosting instances may be ephemeral. Use a persistent disk or a managed PostgreSQL database for production. Set `DATABASE_URL` to the provider's SQLAlchemy-compatible connection URL. Configure CORS to the exact deployed frontend origin.

## Interview explanation

### 60-second explanation

"I built TaskFlow, a full-stack application with two modules. The first is a Todo Tracker where users can create, edit and delete tasks. Each task stores an update counter, and the counter increases whenever the task is successfully edited. I also implemented bulk creation: entering a task followed by a number creates that many separate copies. The second module is a Product Explorer that fetches products from Fake Store API, displays them in a responsive grid and opens a detail page when a product is selected. I used React for the UI, Flask for REST APIs and SQLite with SQLAlchemy for persistent Todo data. The frontend communicates with the backend using HTTP requests."

### 3-minute explanation

"TaskFlow combines a small productivity workflow and an API-driven product catalog. I designed it to demonstrate frontend development, backend API design, database persistence and third-party API integration.

On the Todo side, the React page loads tasks from `GET /api/todos`. When a user submits a task, the frontend sends `POST /api/todos`. The backend validates the input and checks whether the title ends with a number. If it does, the number is treated as the quantity and the backend creates that many individual rows. Each row starts with an update count of zero.

When a user edits a task, React sends a PUT request with the task ID and new title. Flask finds the corresponding database record, changes the title and increments `update_count` by one before committing the transaction. This makes the counter persistent rather than keeping it only in browser state. Delete uses a DELETE endpoint.

For the product module, the frontend requests the collection from Flask. Flask calls Fake Store API and returns the JSON response. React renders the products as cards. Clicking a card navigates to a route containing the product ID, and the detail page fetches that individual product.

I separated the UI pages, API helper functions and backend routes to make the code easier to maintain. I also included input validation, error messages, loading states and backend unit tests. If I extend the project, I would add user authentication, pagination, stronger integration tests and a production database such as PostgreSQL."

### 25 interview questions and sample answers

1. **What problem does this project solve?**  
   It provides a simple task tracker with an edit counter and a product catalog that demonstrates API-driven UI development.

2. **Why did you choose React?**  
   React lets me split the interface into reusable components and update the UI when state changes.

3. **What is Flask?**  
   Flask is a lightweight Python web framework used here to expose REST endpoints and implement backend logic.

4. **What is a REST API?**  
   It is a way for systems to communicate over HTTP using methods such as GET, POST, PUT and DELETE.

5. **What is the difference between GET and POST?**  
   GET retrieves data; POST submits data to create a resource.

6. **Why use PUT for editing?**  
   PUT updates an existing resource identified by its ID.

7. **How does the update counter work?**  
   The backend increments the stored counter after validating and applying each successful edit.

8. **Why is the counter stored in SQLite?**  
   Database storage means the count survives browser refreshes and application restarts, assuming the database file persists.

9. **How does bulk creation work?**  
   A regular expression detects a trailing integer, separates the task title and quantity, then creates that many database records.

10. **What happens if the user enters `Study 0`?**  
    The API rejects it because quantity must be between 1 and 50.

11. **What is SQLite?**  
    It is a lightweight relational database that stores data in a local file.

12. **What is SQLAlchemy?**  
    It is an ORM that maps Python classes to database tables and lets the application query records using Python.

13. **What is an ORM?**  
    Object-Relational Mapping connects application objects with relational database records.

14. **How does React communicate with Flask?**  
    The frontend uses `fetch()` to send HTTP requests and reads JSON responses.

15. **How do you handle API errors?**  
    Flask returns an appropriate HTTP status and JSON error message; the frontend catches errors and displays them.

16. **How does the product grid get data?**  
    It calls the Flask products endpoint, which retrieves the collection from Fake Store API.

17. **How does product detail navigation work?**  
    React Router puts the product ID in the URL, and the detail component fetches that ID.

18. **What is `useState`?**  
    It is a React Hook for storing component state and triggering a render when the state changes.

19. **What is `useEffect` used for here?**  
    It loads tasks or products when the relevant page component mounts.

20. **Why separate API calls into `api.js`?**  
    It avoids repeating fetch logic across pages and keeps UI components focused on presentation and state.

21. **What is CORS?**  
    Cross-Origin Resource Sharing is a browser security mechanism. Flask-CORS allows the configured frontend origin to call the backend.

22. **How do you validate user input?**  
    The backend trims whitespace, checks for an empty title, limits title length and validates the bulk quantity.

23. **What tests did you write?**  
    Unit tests cover health, task creation, bulk creation, edit counter increment, invalid input and deletion.

24. **What would you improve next?**  
    Authentication, task completion status, pagination, product sorting, automated frontend tests and PostgreSQL deployment.

25. **What was your main learning from this project?**  
    I learned how frontend state, HTTP APIs, backend validation and database persistence work together in a complete application.

## Be honest in your interview

Describe only the features you have personally run, tested and understood. In particular, distinguish between the local implementation and a future deployment; do not say it is hosted until you have deployed it and verified the public URL.
