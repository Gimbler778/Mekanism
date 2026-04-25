import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateAvatarUrl } from "../utils/avatarGenerator.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const isGoogleHostedEmail = (email = "") => {
  const normalized = email.toLowerCase();
  return normalized.endsWith("@gmail.com") || normalized.endsWith("@googlemail.com");
};

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const avatarUrl = generateAvatarUrl(email.toLowerCase());

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: role || "hr",
        avatarUrl,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        avatarUrl: users.avatarUrl,
      });

    const token = generateToken(user.id);

    res.status(201).json({
      data: { user, token },
      message: "Registration successful",
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      if (isGoogleHostedEmail(normalizedEmail)) {
        return res.status(404).json({
          error: "Email not registered. Please use Google sign-in.",
        });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.passwordHash) {
      if (user.oauthProvider === "google") {
        return res.status(400).json({
          error: "This account is registered with Google. Please continue with Google.",
        });
      }

      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const token = generateToken(user.id);

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      data: { user: safeUser, token },
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ data: safeUser });
};

export const googleCallback = (req, res) => {
  const token = generateToken(req.user.id);
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
};
