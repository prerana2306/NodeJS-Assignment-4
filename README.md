# User Registration and Server-Side Validation (Node.js)

## Assignment
Web Technology - Assignment 4: Server-Side Validation Application using NodeJS.

## Features
- Node.js core HTTP server with GET and POST routes
- Server-side validation for name, email, password and Indian mobile number
- HTTP status codes: 201 success, 400 invalid input, 409 duplicate email, 404 unknown route
- Custom validation module (`validator.js`)
- File System module for JSON data persistence
- EventEmitter events for successful and failed registrations
- Writable stream for server logs and readable stream for viewing logs
- Simple browser-based registration form

## Requirements
- Node.js 18 or later
- npm (installed with Node.js)

## Run locally
1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Run `npm start`.
4. Open `http://localhost:3000` in your browser.

No external npm packages are required.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Displays registration form |
| POST | `/api/register` | Validates and saves registration |
| GET | `/api/registrations` | Displays saved registration records |
| GET | `/api/logs` | Reads server log using a readable stream |

## Test POST request
Use Postman or curl:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Prerana Kamankar\",\"email\":\"prerana@example.com\",\"password\":\"example123\",\"phone\":\"9876543210\"}"
```

Try an invalid email or short password to verify the server returns HTTP 400.
Register the same email again to verify HTTP 409.

## Deploy on GitHub and Render
### GitHub
1. Create a new GitHub repository, for example `nodejs-assignment-4`.
2. Extract this project ZIP.
3. Open a terminal in the extracted project folder.
4. Run:

```bash
git init
git add .
git commit -m "Add Node.js server-side validation application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nodejs-assignment-4.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

### Render
1. Sign in at https://render.com/.
2. Choose **New +** -> **Web Service**.
3. Connect your GitHub account and select this repository.
4. Select **Node** as the runtime if prompted.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `npm start`.
7. Choose the free instance if available and click **Deploy Web Service**.
8. After deployment, open the `onrender.com` URL shown by Render.

The application reads the hosting provider's `PORT` environment variable.

## Important deployment note
The app stores registrations in `data/registrations.json` and logs in `data/server.log`. Some free hosting services use an ephemeral filesystem, so these files may reset after redeployment or restart. This is suitable for demonstrating the assignment; use a persistent disk or database if permanent storage is required.

## Files
- `server.js` - HTTP server, routes, file handling, events and streams
- `validator.js` - custom server-side validation module
- `public/index.html` - registration form and browser-side request
- `data/registrations.json` - created automatically when the server starts
- `data/server.log` - created automatically when the server writes logs
