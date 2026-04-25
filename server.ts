import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "apc-campaign-secret-2026";
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_3StnfOFAk9Wy@ep-sparkling-wind-abq1nqcv-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const CONFIG_PATH = path.join(process.cwd(), "db_config.json");

function getDbUrl() {
  if (existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      if (cfg.url) return cfg.url;
    } catch (e) {
      console.error("Failed to read db_config.json", e);
    }
  }
  return DATABASE_URL;
}

let pool = new Pool({
  connectionString: getDbUrl(),
  ssl: {
    rejectUnauthorized: false
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database Tables
  async function initDb() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          phone_number TEXT UNIQUE NOT NULL,
          email TEXT,
          password TEXT NOT NULL,
          lga TEXT,
          ward TEXT,
          role TEXT DEFAULT 'Supporter',
          is_apc_member BOOLEAN DEFAULT false,
          is_approved BOOLEAN DEFAULT false,
          gender TEXT,
          dob TEXT,
          vin TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          sender_id TEXT,
          sender_name TEXT,
          target_type TEXT,
          target_lga TEXT,
          target_ward TEXT,
          sent_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT,
          time TEXT,
          location TEXT,
          type TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS feedback (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_name TEXT,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'Open',
          admin_reply TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS pledges (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_name TEXT,
          type TEXT,
          amount NUMERIC DEFAULT 0,
          note TEXT,
          ward TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_name TEXT,
          title TEXT,
          description TEXT,
          type TEXT,
          url TEXT,
          status TEXT DEFAULT 'Approved',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS polls (
          id TEXT PRIMARY KEY,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          results JSONB NOT NULL,
          voters JSONB DEFAULT '[]',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Default Settings
      const settingsResult = await client.query('SELECT count(*) FROM settings');
      if (parseInt(settingsResult.rows[0].count) === 0) {
        const defaultSettings = {
          authPageImage: "https://images.unsplash.com/photo-1590133322241-8c62104500d2?auto=format&fit=crop&q=80&w=2670",
          campaignTitle: "APC Campaign Portal",
          campaignSubtitle: "Jalingo/Yorro/Zing Constituency",
          logoUrl: "",
          landingHeroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2670",
          landingHeroTagline: "The People's Mandate",
          landingHeroTitle: "SMART GOVERNANCE FOR PROGRESS",
          landingHeroSubtitle: "Driving strategic grassroots transformation across Jalingo, Yorro, and Zing. Built for integrity, data-driven decisions, and sustainable prosperity.",
          landingStat1Value: "1.2M+",
          landingStat1Label: "Target Reach",
          landingStat2Value: "42",
          landingStat2Label: "Key Sectors",
          landingStrategyTitle: "Mission Intelligence",
          landingStrategySubtitle: "Our approach leverages modern architectural thinking to solve grassroots coordination challenges.",
          landingConstTitle: "Jalingo. Yorro. Zing.",
          landingConstSubtitle: "Our constituency is a network of human potential. We are building the architecture for its future, one ward at a time.",
          landingConstImage: "https://images.unsplash.com/photo-1540910419892-f39a62a15242?auto=format&fit=crop&q=80&w=2670",
          landingSupporterImages: [
            "https://i.pravatar.cc/150?u=1",
            "https://i.pravatar.cc/150?u=2",
            "https://i.pravatar.cc/150?u=3",
            "https://i.pravatar.cc/150?u=4",
            "https://i.pravatar.cc/150?u=5"
          ],
          landingSupporterCount: "+2K",
          manifesto: "# Our Manifesto\n\n## Vision for Progress\nWe believe in a future where every citizen of Jalingo, Yorro, and Zing has access to modern governance, quality education, and sustainable economic opportunities.\n\n## Strategic Pillars\n1. **Integrity-First Governance**: Ensuring transparency in every decision.\n2. **Data-Driven Growth**: Using technology to identify and solve grassroots challenges.\n3. **Sustainable Prosperity**: Building infrastructure that lasts for generations.\n\n## Our Commitment\nWe are not just a campaign; we are a movement dedicated to the architectural transformation of our constituency.",
          landingVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          landingVideoTitle: "Campaign Vision Video",
          landingVideoSubtitle: "Watch our strategic plan for Jalingo, Yorro, and Zing.",
          strategicInsightOverride: "",
          allowMemberUploads: true
        };
        await client.query('INSERT INTO settings (data) VALUES ($1)', [defaultSettings]);
      }

      // Default Admin
      const adminResult = await client.query('SELECT count(*) FROM users WHERE role = $1', ['Admin']);
      if (parseInt(adminResult.rows[0].count) === 0) {
        const adminPassword = await bcrypt.hash("admin123", 10);
        await client.query(`
          INSERT INTO users (id, full_name, phone_number, password, role, is_approved)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, ["admin-1", "Principal Admin", "08000000000", adminPassword, "Admin", true]);
      }

      // Default Poll
      const pollResult = await client.query('SELECT count(*) FROM polls');
      if (parseInt(pollResult.rows[0].count) === 0) {
        const defaultPoll = {
          id: 'poll-1',
          question: 'Which sector deserves immediate tactical focus in Jalingo?',
          options: ['Education', 'Healthcare', 'Infrastructure', 'Security'],
          results: { 'Education': 120, 'Healthcare': 85, 'Infrastructure': 150, 'Security': 210 },
          voters: [],
          active: true
        };
        await client.query(`
          INSERT INTO polls (id, question, options, results, voters, active)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [defaultPoll.id, defaultPoll.question, JSON.stringify(defaultPoll.options), JSON.stringify(defaultPoll.results), JSON.stringify(defaultPoll.voters), defaultPoll.active]);
      }
    } finally {
      client.release();
    }
  }

  await initDb();

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // --- Multer Configuration for Video Uploads ---
  const uploadsDir = path.join(__dirname, "public", "uploads");
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only video files are permitted for tactical intelligence"));
      }
    }
  });

  app.use("/uploads", express.static(uploadsDir));

  // --- Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
    const token = tokenFromHeader || req.cookies.token;
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: "Access denied" });
    }
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin access required" });
    next();
  };

  // --- Optimized API Routes ---

  app.get("/api/health", async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json({ 
        status: "Online", 
        database: "PostgreSQL Strategic Link",
        db_url: getDbUrl().split('@')[1], // Mask password
        db_time: result.rows[0].now,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: "Tactical connection interrupted" });
    }
  });

  // Admin DB Configuration
  app.post("/api/system/db/test", authenticateToken, isAdmin, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing tactical connection link" });
    
    const testPool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      const client = await testPool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      await testPool.end();
      res.json({ success: true, time: result.rows[0].now });
    } catch (err: any) {
      await testPool.end();
      res.status(400).json({ error: "Uplink failed: " + err.message });
    }
  });

  app.post("/api/system/db/apply", authenticateToken, isAdmin, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing link" });

    try {
      // Save to config file
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ url, updatedAt: new Date().toISOString() }));
      
      // Attempt to switch the active pool
      const oldPool = pool;
      pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
      });
      
      await initDb(); // Provision new DB tables if necessary
      
      // Close old pool after a delay to ensure ongoing requests finish
      setTimeout(() => oldPool.end(), 10000);

      res.json({ success: true, message: "Strategic link successfully synchronized. Tactical nodes updated." });
    } catch (err: any) {
      res.status(500).json({ error: "Synch failure: " + err.message });
    }
  });

  // Global Settings (Public)
  app.get("/api/settings", async (req, res) => {
    try {
      const result = await pool.query('SELECT data FROM settings LIMIT 1');
      res.json(result.rows[0]?.data || {});
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tactical parameters" });
    }
  });

  app.patch("/api/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
      const current = await pool.query('SELECT data FROM settings LIMIT 1');
      const newData = { ...(current.rows[0]?.data || {}), ...req.body };
      await pool.query('UPDATE settings SET data = $1 WHERE id = (SELECT id FROM settings LIMIT 1)', [newData]);
      res.json(newData);
    } catch (err) {
      res.status(500).json({ error: "Failed to update strategic configurations" });
    }
  });

  app.post("/api/settings/landing-video", authenticateToken, isAdmin, upload.single("video"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No video file provided" });
    
    try {
      const current = await pool.query('SELECT data FROM settings LIMIT 1');
      const newData = { ...(current.rows[0]?.data || {}), landingVideoUrl: `/uploads/${req.file.filename}` };
      await pool.query('UPDATE settings SET data = $1 WHERE id = (SELECT id FROM settings LIMIT 1)', [newData]);
      res.json(newData);
    } catch (err) {
      res.status(500).json({ error: "Failed to store video intelligence" });
    }
  });

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    const { fullName, phoneNumber, password, lga, ward, role, isApcMember, gender, dob, vin } = req.body;
    try {
      const check = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
      if (check.rows.length > 0) {
        return res.status(400).json({ error: "Identification already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password || "password123", 10);
      const id = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await pool.query(`
        INSERT INTO users (id, full_name, phone_number, password, lga, ward, role, is_apc_member, gender, dob, vin, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [id, fullName, phoneNumber, hashedPassword, lga, ward, role || 'Supporter', isApcMember, gender, dob, vin, role === 'Admin']);
      
      res.status(201).json({ message: "Registration successful. Pending strategic approval." });
    } catch (err) {
      res.status(500).json({ error: "Mission failure: Registration obstructed" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
      const user = result.rows[0];
      
      if (!user) return res.status(400).json({ error: "Credentials invalid" });

      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) return res.status(400).json({ error: "Authentication failed" });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });
      
      const { password: _, ...userWithoutPass } = user;
      // Convert underscores to camelCase for frontend
      const formattedUser = {
        id: user.id,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        lga: user.lga,
        ward: user.ward,
        role: user.role,
        isApcMember: user.is_apc_member,
        isApproved: user.is_approved,
        createdAt: user.created_at
      };
      res.json({ user: formattedUser, token });
    } catch (err) {
      res.status(500).json({ error: "Login protocol failure" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Session terminated" });
  });

  app.get("/api/auth/me", async (req: any, res) => {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
    const token = tokenFromHeader || req.cookies.token;
    
    if (!token || token === 'null' || token === 'undefined') return res.json(null);

    try {
      const verified = jwt.verify(token, JWT_SECRET) as any;
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [verified.id]);
      const user = result.rows[0];
      if (!user) return res.json(null);
      
      const formattedUser = {
        id: user.id,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        lga: user.lga,
        ward: user.ward,
        role: user.role,
        isApcMember: user.is_apc_member,
        isApproved: user.is_approved,
        createdAt: user.created_at
      };
      res.json(formattedUser);
    } catch (err) {
      res.json(null);
    }
  });

  // Intelligence: Users/Members
  app.get("/api/users", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, full_name as "fullName", phone_number as "phoneNumber", lga, ward, role, is_apc_member as "isApcMember", is_approved as "isApproved", created_at as "createdAt" FROM users');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user directory" });
    }
  });

  app.patch("/api/users/:id/approve", authenticateToken, isAdmin, async (req, res) => {
    const { isApproved } = req.body;
    try {
      const result = await pool.query('UPDATE users SET is_approved = $1 WHERE id = $2 RETURNING *', [isApproved, req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "User not identified" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to update security clearance" });
    }
  });

  // Tactical Comms: Messaging
  app.get("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      const user = result.rows[0];
      if (!user) return res.status(404).json({ error: "User not found" });

      let query = 'SELECT id, content, sender_id as "senderId", sender_name as "senderName", target_type as "targetType", target_lga as "targetLga", target_ward as "targetWard", sent_at as "sentAt" FROM messages WHERE 1=1';
      const params: any[] = [];

      if (user.role !== 'Admin') {
        query += ' AND (target_type = \'All\' OR (target_type = \'Delegates\' AND $1 = \'Delegate\') OR (target_type = \'Ward\' AND target_ward = $2) OR (target_type = \'LGA\' AND target_lga = $3) OR sender_id = $4)';
        params.push(user.role, user.ward, user.lga, user.id);
      }

      const msgResult = await pool.query(query, params);
      res.json(msgResult.rows);
    } catch (err) {
      res.status(500).json({ error: "Strategic comms failure" });
    }
  });

  app.post("/api/messages", authenticateToken, isAdmin, async (req: any, res) => {
    const { content, targetType, targetLga, targetWard } = req.body;
    try {
      const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [req.user.id]);
      const senderName = userResult.rows[0]?.full_name;
      const id = `MSG-${Date.now()}`;
      
      const result = await pool.query(`
        INSERT INTO messages (id, content, sender_id, sender_name, target_type, target_lga, target_ward)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, content, sender_id as "senderId", sender_name as "senderName", target_type as "targetType", target_lga as "targetLga", target_ward as "targetWard", sent_at as "sentAt"
      `, [id, content, req.user.id, senderName, targetType, targetLga, targetWard]);
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to dispatch tactical directive" });
    }
  });

  // Campaign Ops: Events
  app.get("/api/events", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, title, description, date, time, location, type, created_at as "createdAt" FROM events');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch operational objectives" });
    }
  });

  app.post("/api/events", authenticateToken, isAdmin, async (req, res) => {
    const { title, description, date, time, location, type } = req.body;
    const id = `EVT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    try {
      const result = await pool.query(`
        INSERT INTO events (id, title, description, date, time, location, type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, description, date, time, location, type, created_at as "createdAt"
      `, [id, title, description, date, time, location, type]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to log operational objective" });
    }
  });

  app.delete("/api/events/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Objective not found" });
      res.json({ message: "Objective neutralized" });
    } catch (err) {
      res.status(500).json({ error: "Failed to decommission objective" });
    }
  });

  // Feedback & Intel
  app.get("/api/feedback", authenticateToken, async (req: any, res) => {
    try {
      let query = 'SELECT id, user_id as "userId", user_name as "userName", content, status, admin_reply as "adminReply", created_at as "createdAt" FROM feedback';
      const params: any[] = [];
      if (req.user.role !== 'Admin') {
        query += ' WHERE user_id = $1';
        params.push(req.user.id);
      }
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve intel reports" });
    }
  });

  app.post("/api/feedback", authenticateToken, async (req: any, res) => {
    try {
      const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [req.user.id]);
      const userName = userResult.rows[0]?.full_name;
      const id = `FDB-${Date.now()}`;
      const result = await pool.query(`
        INSERT INTO feedback (id, user_id, user_name, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id as "userId", user_name as "userName", content, status, admin_reply as "adminReply", created_at as "createdAt"
      `, [id, req.user.id, userName, req.body.content]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to submit intelligence" });
    }
  });

  app.patch("/api/feedback/:id/reply", authenticateToken, isAdmin, async (req, res) => {
    const { adminReply } = req.body;
    try {
      const result = await pool.query(`
        UPDATE feedback 
        SET admin_reply = $1, status = 'Replied' 
        WHERE id = $2 
        RETURNING id, user_id as "userId", user_name as "userName", content, status, admin_reply as "adminReply", created_at as "createdAt"
      `, [adminReply, req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Intel report not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to process tactical reply" });
    }
  });

  // --- Supporters Hub: Pledges & Polls ---
  app.get("/api/pledges", authenticateToken, async (req: any, res) => {
    try {
      const result = await pool.query('SELECT id, user_id as "userId", user_name as "userName", type, amount, note, ward, created_at as "createdAt" FROM pledges WHERE user_id = $1', [req.user.id]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tactical commitments" });
    }
  });

  app.post("/api/pledges", authenticateToken, async (req: any, res) => {
    const { type, amount, note } = req.body;
    try {
      const userResult = await pool.query('SELECT full_name, ward FROM users WHERE id = $1', [req.user.id]);
      const user = userResult.rows[0];
      const id = `PLD-${Date.now()}`;
      
      const result = await pool.query(`
        INSERT INTO pledges (id, user_id, user_name, type, amount, note, ward)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, user_id as "userId", user_name as "userName", type, amount, note, ward, created_at as "createdAt"
      `, [id, req.user.id, user.full_name, type, amount || 0, note || '', user.ward]);
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to log commitment" });
    }
  });

  app.get("/api/polls", authenticateToken, async (req: any, res) => {
    try {
      let query = 'SELECT id, question, options, results, voters, active, created_at as "createdAt" FROM polls';
      if (req.user.role !== 'Admin') {
        query += ' WHERE active = true';
      }
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch neural polls" });
    }
  });

  app.post("/api/polls", authenticateToken, isAdmin, async (req, res) => {
    const { question, options } = req.body;
    if (!question || !options || !options.length) return res.status(400).json({ error: "Invalid poll configuration" });
    
    const results: Record<string, number> = {};
    options.forEach((opt: string) => results[opt] = 0);
    const id = `poll-${Date.now()}`;

    try {
      const result = await pool.query(`
        INSERT INTO polls (id, question, options, results)
        VALUES ($1, $2, $3, $4)
        RETURNING id, question, options, results, voters, active, created_at as "createdAt"
      `, [id, question, JSON.stringify(options), JSON.stringify(results)]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to initialize poll" });
    }
  });

  app.patch("/api/polls/:id", authenticateToken, isAdmin, async (req, res) => {
    const { active, question } = req.body;
    try {
      let query = 'UPDATE polls SET ';
      const params: any[] = [];
      const sets: string[] = [];
      
      if (active !== undefined) {
        params.push(active);
        sets.push(`active = $${params.length}`);
      }
      if (question) {
        params.push(question);
        sets.push(`question = $${params.length}`);
      }
      
      if (sets.length === 0) return res.status(400).json({ error: "No tactical updates provided" });
      
      params.push(req.params.id);
      query += sets.join(', ') + ` WHERE id = $${params.length} RETURNING id, question, options, results, voters, active, created_at as "createdAt"`;
      
      const result = await pool.query(query, params);
      if (result.rows.length === 0) return res.status(404).json({ error: "Poll not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to update poll parameters" });
    }
  });

  app.delete("/api/polls/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM polls WHERE id = $1 RETURNING *', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Poll not found" });
      res.json({ message: "Poll deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to decommission poll" });
    }
  });

  app.post("/api/polls/:id/vote", authenticateToken, async (req: any, res) => {
    const { option } = req.body;
    if (!option) return res.status(400).json({ error: "No orbital selection provided" });

    try {
      const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [req.params.id]);
      const poll = pollResult.rows[0];
      
      if (!poll) return res.status(404).json({ error: "Poll not found" });
      
      // Handle JSONB voters list
      const voters = poll.voters || [];
      if (voters.includes(req.user.id)) return res.status(400).json({ error: "You have already cast your tactical vote" });
      
      if (!poll.options.includes(option)) return res.status(400).json({ error: "Invalid orbital selection" });
      
      const results = poll.results;
      results[option] = (results[option] || 0) + 1;
      voters.push(req.user.id);

      const result = await pool.query(`
        UPDATE polls 
        SET results = $1, voters = $2 
        WHERE id = $3 
        RETURNING id, question, options, results, voters, active, created_at as "createdAt"
      `, [JSON.stringify(results), JSON.stringify(voters), req.params.id]);
      
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Ballot box error intensified" });
    }
  });

  // --- Media Center: Video Testimonials & Highlights ---
  app.get("/api/videos", authenticateToken, async (req: any, res) => {
    try {
      const result = await pool.query('SELECT id, user_id as "userId", user_name as "userName", title, description, type, url, status, created_at as "createdAt" FROM videos');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch video intelligence" });
    }
  });

  app.post("/api/videos", authenticateToken, async (req: any, res: any, next: any) => {
    try {
      const settingsResult = await pool.query('SELECT data FROM settings LIMIT 1');
      const settings = settingsResult.rows[0]?.data;
      if (!settings?.allowMemberUploads && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Tactical uplink disabled by Command Center" });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: "Security check failure" });
    }
  }, upload.single("video"), async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: "No video file provided for uplink" });
    
    try {
      const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [req.user.id]);
      const userName = userResult.rows[0]?.full_name;
      const id = `VID-${Date.now()}`;
      
      const result = await pool.query(`
        INSERT INTO videos (id, user_id, user_name, title, description, type, url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, user_id as "userId", user_name as "userName", title, description, type, url, status, created_at as "createdAt"
      `, [id, req.user.id, userName, req.body.title || "Untitled Intelligence", req.body.description || "", req.body.type || "Testimonial", `/uploads/${req.file.filename}`]);
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to register video uplink" });
    }
  });

  app.delete("/api/videos/:id", authenticateToken, async (req: any, res) => {
    try {
      const videoResult = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
      const video = videoResult.rows[0];
      if (!video) return res.status(404).json({ error: "Video intel not found" });
      
      if (video.user_id !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Unauthorized tactical deletion" });
      }
      
        try {
          const fileName = path.basename(video.url);
          const filePath = path.join(uploadsDir, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn("Physical file not found or deletion failed:", err);
        }

      await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);
      res.json({ message: "Video decommissioned" });
    } catch (err) {
      res.status(500).json({ error: "Failed to decommission video" });
    }
  });

  // Command Center: Global Search
  app.get("/api/search", authenticateToken, isAdmin, async (req, res) => {
    const q = `%${(req.query.q as string || "").toLowerCase()}%`;
    try {
      const users = await pool.query('SELECT id, full_name as "fullName", phone_number as "phoneNumber" FROM users WHERE LOWER(full_name) LIKE $1 OR phone_number LIKE $1 LIMIT 5', [q]);
      const events = await pool.query('SELECT id, title FROM events WHERE LOWER(title) LIKE $1 LIMIT 5', [q]);
      const messages = await pool.query('SELECT id, content FROM messages WHERE LOWER(content) LIKE $1 LIMIT 5', [q]);
      const videos = await pool.query('SELECT id, title, description FROM videos WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 5', [q]);

      res.json({
        users: users.rows,
        events: events.rows,
        messages: messages.rows,
        videos: videos.rows
      });
    } catch (err) {
      res.status(500).json({ error: "Search protocol failure" });
    }
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ 
      error: "Strategic system error encountered",
      message: process.env.NODE_ENV === 'production' ? null : err.message 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Command Center Uplink established at http://localhost:${PORT}`);
  });
}

startServer();
