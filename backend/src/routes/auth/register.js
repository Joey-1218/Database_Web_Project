import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../../db.js";

const router = Router();

//simple validation helpers
const isNonEmpty = (s) => typeof (s) === "string" && s.trim().length > 0;
const validUsername = (s) =>
    typeof s === "string" &&
    s.trim().length >= 3 &&
    s.trim().length <= 32 &&
    /^[A-Za-z0-9._-]+$/.test(s);

router.post("/", async (req, res) => {
    try {
        const username = String(req.body?.username ?? "").trim();
        const password = String(req.body?.password ?? "");
        // 1) validate inputs
        if (!validUsername(username)) {
            return res
                .status(400)
                .json({ error: "Invalid username" });
        }
        if (!isNonEmpty(password)) {
            return res
                .status(400)
                .json({ error: "Invalid password" });
        }

        const db = await getDb();
        // 2) (optional) early existence check
        const userExist = await db.get(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );
        if (userExist) {
            return res.status(409).json({ error: "Username already taken" });
        }
        // 3) hash + insert
        const password_hash = await bcrypt.hash(password, 12);
        const result = await db.run(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            [username, password_hash]
        );
        // sqlite 'run' returns { lastID, changes }
        return res.status(201).json({
            user: { id: result.lastID, username },
            // No token here—keep register simple.
        });
    } catch (err) {
        if (err && (err.code === "SQLITE_CONSTRAINT" || err.code === "SQLITE_CONSTRAINT_UNIQUE")) {
            return res.status(409).json({ error: "Username already taken" });
        }
        console.error("register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
})

export default router;
