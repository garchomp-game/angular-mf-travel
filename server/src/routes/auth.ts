import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sign } from "hono/jwt";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const auth = new Hono();

// Register
auth.post("/register", zValidator("json", authSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return c.json({ error: "このメールアドレスは既に登録されています" }, 409);
  }

  const passwordHash = await hash(password, 10);
  const newUser = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning()
    .get();

  const token = await sign(
    { sub: newUser.id, email: newUser.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    JWT_SECRET,
  );

  return c.json({ token, user: { id: newUser.id, email: newUser.email } }, 201);
});

// Login
auth.post("/login", zValidator("json", authSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) {
    return c.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      401,
    );
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return c.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      401,
    );
  }

  const token = await sign(
    { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    JWT_SECRET,
  );

  return c.json({ token, user: { id: user.id, email: user.email } });
});

export default auth;
