# Student Result Management System

A complete full-stack application for managing student results with authentication, data export, and statistics.

[![Smoke Tests](https://github.com/<OWNER>/<REPO>/actions/workflows/smoke-ci.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/smoke-ci.yml)

Note: replace `<OWNER>/<REPO>` in the badge URL with your GitHub repository path to enable the live status badge.

## Features

✅ User Authentication (Login/Signup)
✅ Role-based Access (Teacher/Student)
✅ Add, Edit, Delete Results
✅ Search & Filter Results
✅ Export to CSV & PDF
✅ Real-time Statistics
✅ Data Persistence (MongoDB)
✅ Responsive Design

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Additional**: JWT, BCrypt, PDFKit, CSV-Writer

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Default connection: `mongodb://localhost:27017/student-results`

**Option B: MongoDB Atlas (Cloud)**
- Create an account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get your connection string
- Update `.env` file with your connection string

### 3. Configure Environment Variables

Edit `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-results
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=development
```

## Running the Application

### Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Seed test users (optional)
Run the seed script to create default teacher and student accounts:
```bash
npm run seed
```

Default credentials created:
- Teacher: `teacher@example.com` / `password123`
- Student: `student@example.com` / `password123`

### Smoke tests (optional)
After starting the server, run the smoke test which exercises auth, create/update, exports, and stats:
```bash
npm run smoke
```

The script will create `./exports/smoke-results.csv` and `./exports/smoke-results.pdf` if successful.

Continuous Integration
----------------------

This repository includes a GitHub Actions workflow that runs the smoke tests automatically on pushes and pull requests to `main`/`master`.
The workflow starts a MongoDB service, seeds the database, starts the server, waits for readiness, and executes the same smoke test script.


### Open in Browser
1. Go to `http://localhost:5000`
2. Create an account or login

### Running frontend separately (optional)
You can run the frontend as a standalone static site, separate from the API server. This is useful for deploying the UI to a static host (GitHub Pages, Netlify) while the API runs elsewhere.

1. Change into the `frontend` folder:

```bash
cd frontend
```

2. Install frontend dependencies and start the static server:

```bash
npm install
npm start
```

The frontend will run at `http://localhost:3000` and talk to the API at the URL set in `frontend/config.js`.

A dedicated `frontend/README.md` is included with all setup, build, and deploy instructions.

### Deploying to Netlify
Netlify can build and publish the standalone frontend directly from the `frontend` folder.

1. Create a Netlify site and connect your repository.
2. Set the build command to:

```bash
npm run build
```

3. Set the publish directory to:

```bash
dist
```

The repository already includes `frontend/netlify.toml` and `frontend/_redirects` for clean single-page routing.

### Deploying to GitHub Pages
The repository includes a GitHub Actions workflow at `.github/workflows/deploy-frontend.yml`.

On push to `main` or `master`, it will:
- install frontend dependencies,
- build the frontend,
- deploy `frontend/dist` to the `gh-pages` branch.

To enable this, make sure the repository is configured for GitHub Pages to serve from the `gh-pages` branch.

### Deploying the backend with Docker
The backend is now container-ready with `Dockerfile`, `docker-compose.yml`, and `.dockerignore`.

Build and run locally:

```bash
npm run docker:build
npm run docker:up
```

This starts the API at `http://localhost:5000` and MongoDB at `mongodb://localhost:27017`.

### Deploying to Render
A `render.yaml` file is included for Render deploys.

- Deploy the backend service with environment variables `JWT_SECRET` and `MONGODB_URI`.
- Deploy the frontend service from `frontend/dist`.

Once the backend and frontend are deployed, update `frontend/config.js` to point to your live backend URL.

## Usage

### For Teachers
1. **Add Result**: Fill in student name, score, and subject
2. **Edit Result**: Click Edit button next to a result
3. **Delete Result**: Click Delete button
4. **Export Data**: Download as CSV or PDF
5. **View Statistics**: See all statistics on the dashboard

### For Students
1. **View Results**: See only their own results
2. **View Statistics**: See stats based on their results
3. **Export Data**: Download their results as CSV or PDF

## Project Structure

```
project 2/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── models/
│   ├── User.js           # User model
│   └── Result.js         # Result model
├── routes/
│   ├── auth.js           # Authentication routes
│   └── results.js        # Results management routes
├── middleware/
│   └── auth.js           # Authentication middleware
├── public/
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styling
│   └── script.js         # Frontend JavaScript
	│   └── assets/
	│       └── logo.svg     # Project branding (Thomas Adewumi University)
└── exports/              # Generated CSV/PDF files

```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Results
- `GET /api/results` - Get all results
- `GET /api/results/search` - Search results
- `POST /api/results` - Add new result (Teacher only)
- `PUT /api/results/:id` - Update result (Teacher only)
- `DELETE /api/results/:id` - Delete result (Teacher only)
- `GET /api/results/export/csv` - Export as CSV
- `GET /api/results/export/pdf` - Export as PDF
- `GET /api/results/stats/summary` - Get statistics

## Test Credentials

### Teacher Account
- Email: teacher@example.com
- Password: password123
- Role: Teacher

### Student Account
- Email: student@example.com
- Password: password123
- Role: Student

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check your connection string in `.env`
- Verify MongoDB URI and credentials

### "Export not working"
- Make sure `/exports` folder exists (created automatically)
- Check server logs for errors
- Verify file permissions

### "Authentication failed"
- Clear browser cache and cookies
- Check localStorage for stored token
- Try logging out and logging back in

## Future Enhancements

- Profile settings
- Bulk upload results
- Email notifications
- Advanced analytics
- Multi-subject management
- GPA calculation
- Parent portal

## Support

For issues or questions, check the console logs and error messages.

---

**Created for Student Result Management**
