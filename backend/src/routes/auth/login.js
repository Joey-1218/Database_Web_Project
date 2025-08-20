import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../../db.js";

const router = Router();

//simple validation helpers
const isNonEmpty = (s) => typeof (s) === "string" && s.trim().length > 0;

router.post("/", async (req, res) => {
    try {
        const username = String(req.body?.username ?? "").trim();
        const password = String(req.body?.password ?? "");
        if (!isNonEmpty(username) || !isNonEmpty(password)) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const db = await getDb();
        const row = await db.get(
            "SELECT id, password_hash FROM users WHERE username = ?",
            [username]
        );

        // Generic error to avoid username enumeration
        if (!row) return res.status(400).json({ error: "Invalid username or password" });

        // Compare plaintext password with stored hash
        const ok = await bcrypt.compare(password, row.password_hash);
        if (!ok) return res.status(400).json({ error: "Invalid username or password" });

        // Success — return user info (add JWT later if you want)
        return res.status(200).json({ user: { id: row.id, username } });

    } catch (err) {
        console.error("login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
})

export default router;