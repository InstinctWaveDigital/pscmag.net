"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { hashPassword, verifyPassword, setSession, getSession, destroySession } from "@/lib/auth";
import crypto from "crypto";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

// ─── LOGIN ACTION ───
export async function loginAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { success: false, error: "Please fill in all fields." };
  }

  try {
    const res = await query("SELECT * FROM users WHERE username = $1", [username]);
    if (res.rows.length === 0) {
      return { success: false, error: "Invalid username or password." };
    }

    const user = res.rows[0];
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
    }

    await setSession({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  } catch (err: any) {
    console.error("Login failed:", err);
    return { success: false, error: "An unexpected error occurred." };
  }

  redirect("/admin");
}

// ─── LOGOUT ACTION ───
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ─── ARTICLE ACTIONS ───
export async function saveArticleAction(payload: {
  id?: string;
  category: string;
  art: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  dateline: string;
  readTime: string;
  tags: string[];
  body: string[];
  status: "published" | "draft" | "archived";
  featured: boolean;
}): Promise<ActionResponse & { id?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized access." };
  }

  const isEditing = !!payload.id;
  const now = new Date().toISOString().slice(0, 10);

  try {
    if (isEditing) {
      // Fetch existing to check permission
      const checkRes = await query("SELECT author FROM articles WHERE id = $1", [payload.id]);
      if (checkRes.rows.length === 0) {
        return { success: false, error: "Article not found." };
      }

      const existing = checkRes.rows[0];
      // Writer restriction: Can only edit their own stories
      if (session.role === "writer" && existing.author !== session.name) {
        return { success: false, error: "You are not authorized to edit this story." };
      }

      await query(
        `UPDATE articles SET 
          category = $1, art = $2, title = $3, excerpt = $4, author = $5, role = $6, 
          read_time = $7, dateline = $8, featured = $9, tags = $10, body = $11, status = $12, updated_at = $13
         WHERE id = $14`,
        [
          payload.category,
          payload.art,
          payload.title,
          payload.excerpt,
          payload.author || session.name,
          payload.role,
          payload.readTime,
          payload.dateline,
          payload.featured ? 1 : 0,
          payload.tags.join(","),
          JSON.stringify(payload.body),
          payload.status,
          now,
          payload.id,
        ]
      );
      return { success: true, id: payload.id };
    } else {
      const newId = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `story-${Date.now()}`;
      
      const finalAuthor = session.role === "writer" ? session.name : (payload.author || session.name);

      await query(
        `INSERT INTO articles (
          id, category, art, title, excerpt, author, role, date, read_time, dateline, featured, tags, body, status, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newId,
          payload.category,
          payload.art,
          payload.title,
          payload.excerpt,
          finalAuthor,
          payload.role,
          now,
          payload.readTime,
          payload.dateline,
          payload.featured ? 1 : 0,
          payload.tags.join(","),
          JSON.stringify(payload.body),
          payload.status,
          now,
        ]
      );
      return { success: true, id: newId };
    }
  } catch (err: any) {
    console.error("Failed to save article:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized access." };
  }

  if (session.role === "writer") {
    return { success: false, error: "Writers do not have permissions to delete articles." };
  }

  try {
    await query("DELETE FROM articles WHERE id = $1", [id]);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete article:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

// ─── USER ACTIONS ───
export async function createUserAction(payload: {
  username: string;
  name: string;
  role: "admin" | "editor" | "writer";
  password?: string;
}): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  if (!payload.username || !payload.name || !payload.password) {
    return { success: false, error: "All fields are required." };
  }

  try {
    const checkRes = await query("SELECT id FROM users WHERE username = $1", [payload.username]);
    if (checkRes.rows.length > 0) {
      return { success: false, error: "Username already exists." };
    }

    await query(
      "INSERT INTO users (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
      [crypto.randomUUID(), payload.username, hashPassword(payload.password), payload.name, payload.role]
    );
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create user:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  if (session.userId === id) {
    return { success: false, error: "Self-deletion is blocked." };
  }

  try {
    await query("DELETE FROM users WHERE id = $1", [id]);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete user:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function resetPasswordAction(userId: string, newPassword?: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashPassword(newPassword),
      userId,
    ]);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to reset password:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized access." };
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  try {
    const res = await query("SELECT filepath FROM media WHERE id = $1", [id]);
    if (res.rows.length === 0) {
      return { success: false, error: "Media item not found." };
    }

    const filepath = res.rows[0].filepath;
    const fullPath = path.join(process.cwd(), "public", filepath);

    // Delete from disk
    try {
      await fs.unlink(fullPath);
    } catch (e) {
      console.warn(`File could not be unlinked on disk: ${fullPath}`, e);
    }

    // Delete from database
    await query("DELETE FROM media WHERE id = $1", [id]);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete media item:", err);
    return { success: false, error: "Database transaction failed." };
  }
}
