const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { EventEmitter } = require("events");
const { validateRegistration } = require("./validator");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "registrations.json");
const LOG_FILE = path.join(DATA_DIR, "server.log");
const publicDir = path.join(__dirname, "public");

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");

const appEvents = new EventEmitter();
const logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });

function log(message) {
  const line = `${new Date().toISOString()} - ${message}\n`;
  logStream.write(line); // Writable stream
  console.log(message);
}

appEvents.on("registrationSuccess", (user) => {
  log(`New registration: ${user.email}`);
});

appEvents.on("registrationFailed", (reason) => {
  log(`Registration rejected: ${reason}`);
});

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const contentType = req.headers["content-type"] || "";
        if (contentType.includes("application/json")) {
          resolve(JSON.parse(body || "{}"));
        } else {
          resolve(Object.fromEntries(new URLSearchParams(body)));
        }
      } catch {
        reject(new Error("Invalid request data"));
      }
    });
    req.on("error", reject);
  });
}

function readUsers() {
  return new Promise((resolve, reject) => {
    fs.readFile(USERS_FILE, "utf8", (err, data) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data || "[]"));
      } catch {
        reject(new Error("Could not read registration database"));
      }
    });
  });
}

function saveUsers(users) {
  return new Promise((resolve, reject) => {
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8", err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function serveHome(res) {
  const filePath = path.join(publicDir, "index.html");
  fs.readFile(filePath, (err, content) => {
    if (err) return sendJson(res, 500, { success: false, message: "Could not load page." });
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = requestUrl.pathname;

  if (req.method === "GET" && route === "/") {
    return serveHome(res);
  }

  if (req.method === "GET" && route === "/api/registrations") {
    try {
      const users = await readUsers();
      return sendJson(res, 200, { success: true, count: users.length, registrations: users });
    } catch (error) {
      return sendJson(res, 500, { success: false, message: error.message });
    }
  }

  // Demonstrates a readable stream by sending the server log file.
  if (req.method === "GET" && route === "/api/logs") {
    if (!fs.existsSync(LOG_FILE)) return sendJson(res, 404, { success: false, message: "No logs found." });
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    const readStream = fs.createReadStream(LOG_FILE);
    readStream.on("error", () => {
      if (!res.headersSent) sendJson(res, 500, { success: false, message: "Unable to read logs." });
      else res.destroy();
    });
    readStream.pipe(res);
    return;
  }

  if (req.method === "POST" && route === "/api/register") {
    try {
      const input = await readRequestBody(req);
      const errors = validateRegistration(input);

      if (errors.length > 0) {
        appEvents.emit("registrationFailed", errors.join("; "));
        return sendJson(res, 400, { success: false, message: "Please correct the following errors.", errors });
      }

      const users = await readUsers();
      const email = String(input.email).trim().toLowerCase();

      if (users.some(user => user.email === email)) {
        appEvents.emit("registrationFailed", `Duplicate email: ${email}`);
        return sendJson(res, 409, { success: false, message: "This email is already registered." });
      }

      const newUser = {
        id: Date.now().toString(),
        name: String(input.name).trim(),
        email,
        phone: String(input.phone).trim(),
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      await saveUsers(users);
      appEvents.emit("registrationSuccess", newUser);

      return sendJson(res, 201, {
        success: true,
        message: "Registration completed successfully!",
        user: newUser
      });
    } catch (error) {
      appEvents.emit("registrationFailed", error.message);
      return sendJson(res, 400, { success: false, message: error.message || "Invalid request." });
    }
  }

  if (req.method === "GET" && route === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }

  return sendJson(res, 404, { success: false, message: "Route not found." });
});

server.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
  log("Server shutting down");
  logStream.end(() => process.exit(0));
});
