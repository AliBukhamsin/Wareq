// ============================================================
//  وارق (Wareq) — Node.js + Express Backend Server
// ============================================================

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wareq_db",
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Connected to MySQL — wareq_db");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

const JWT_SECRET = process.env.JWT_SECRET || "wareq_secret_key_change_in_production";

function generateToken(user) {
  return jwt.sign(
    { id: user.user_id, email: user.email, name: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ============================================================
//  AUTH ROUTES
// ============================================================

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });
  try {
    const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    const user = { user_id: result.insertId, email, username: name };
    const token = generateToken(user);
    res.status(201).json({ message: "Account created!", token, user: { id: result.insertId, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid email or password" });
    const token = generateToken(user);
    res.json({ token, user: { id: user.user_id, name: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, email, created_at FROM users WHERE user_id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  PLANTS ROUTES
// ============================================================

app.get("/api/plants", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/plants", authMiddleware, async (req, res) => {
  const { name, species, notes, image_url } = req.body;
  if (!name) return res.status(400).json({ error: "Plant name is required" });
  try {
    const [result] = await db.query(
      "INSERT INTO plants (user_id, name, species, notes, image_url) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, name, species || null, notes || null, image_url || null]
    );
    res.status(201).json({ message: "Plant added!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/plants/:id", authMiddleware, async (req, res) => {
  const { name, species, notes, image_url } = req.body;
  try {
    await db.query(
      "UPDATE plants SET name=?, species=?, notes=?, image_url=? WHERE id=? AND user_id=?",
      [name, species, notes, image_url, req.params.id, req.user.id]
    );
    res.json({ message: "Plant updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/plants/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM plants WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Plant deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  POSTS ROUTES
// ============================================================

app.get("/api/posts", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT posts.*, users.username AS author_name
      FROM posts
      JOIN users ON posts.user_id = users.user_id
      ORDER BY posts.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/posts", authMiddleware, async (req, res) => {
  const { content, image_url, title } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required" });
  try {
    const [result] = await db.query(
      "INSERT INTO posts (user_id, title, content, image_url) VALUES (?, ?, ?, ?)",
      [req.user.id, title || content.substring(0, 50), content, image_url || null]
    );
    res.status(201).json({ message: "Post created!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/posts/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM posts WHERE post_id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Post deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/posts/mine", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  SAVED POSTS ROUTES
// ============================================================

// GET /api/saved — get all saved posts for logged-in user
app.get("/api/saved", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT posts.*, users.username AS author_name, saved_posts.saved_at
      FROM saved_posts
      JOIN posts ON saved_posts.post_id = posts.post_id
      JOIN users ON posts.user_id = users.user_id
      WHERE saved_posts.user_id = ?
      ORDER BY saved_posts.saved_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/saved/:postId — save/pin a post
app.post("/api/saved/:postId", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)",
      [req.user.id, req.params.postId]
    );
    res.status(201).json({ message: "Post saved!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Already saved" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/saved/:postId — unsave/unpin a post
app.delete("/api/saved/:postId", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?",
      [req.user.id, req.params.postId]
    );
    res.json({ message: "Post unsaved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/saved/ids — get just the IDs of saved posts (to highlight pins in PostsPage)
app.get("/api/saved/ids", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT post_id FROM saved_posts WHERE user_id = ?",
      [req.user.id]
    );
    res.json(rows.map(r => r.post_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  DIAGNOSTICS ROUTES
// ============================================================

app.get("/api/diagnostics", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT diagnostics.*, plants.name AS plant_name
       FROM diagnostics
       JOIN plants ON diagnostics.plant_id = plants.id
       WHERE plants.user_id = ?
       ORDER BY diagnostics.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/diagnostics", authMiddleware, async (req, res) => {
  const { plant_id, result, image_url } = req.body;
  if (!result) return res.status(400).json({ error: "Result is required" });
  try {
    const [insertResult] = await db.query(
      "INSERT INTO diagnostics (plant_id, result, image_url) VALUES (?, ?, ?)",
      [plant_id || null, result, image_url || null]
    );
    res.status(201).json({ message: "Diagnostic saved!", id: insertResult.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  NOTIFICATIONS ROUTES
// ============================================================

app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  HEALTH CHECK
// ============================================================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "وارق server is running 🌿" });
});

app.listen(PORT, () => {
  console.log(`🌿 Wareq server running on http://localhost:${PORT}`);
});
