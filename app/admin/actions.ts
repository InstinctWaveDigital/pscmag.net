"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  setSession,
  getSession,
  destroySession,
} from "@/lib/auth";
import crypto from "crypto";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

// ─── LOGIN ACTION ────────────────────────────────────────────────────────────

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { success: false, error: "Please fill in all fields." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return { success: false, error: "Invalid username or password." };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
    }

    await setSession({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role as "admin" | "editor" | "writer",
    });
  } catch (err: any) {
    console.error("Login failed:", err);
    return { success: false, error: "An unexpected error occurred." };
  }

  redirect("/admin");
}

// ─── LOGOUT ACTION ───────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ─── ARTICLE ACTIONS ─────────────────────────────────────────────────────────

import { BodyBlock } from "@/lib/data";

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
  body: BodyBlock[]; // was string[]
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
      const existing = await prisma.article.findUnique({
        where: { id: payload.id },
        select: { author: true },
      });

      if (!existing) {
        return { success: false, error: "Article not found." };
      }

      if (session.role === "writer" && existing.author !== session.name) {
        return {
          success: false,
          error: "You are not authorized to edit this story.",
        };
      }

      await prisma.article.update({
        where: { id: payload.id },
        data: {
          category: payload.category,
          art: payload.art,
          title: payload.title,
          excerpt: payload.excerpt,
          author: payload.author || session.name,
          role: payload.role,
          readTime: payload.readTime,
          dateline: payload.dateline,
          featured: payload.featured ? 1 : 0,
          tags: payload.tags.join(","),
          body: JSON.stringify(payload.body),
          status: payload.status,
          updatedAt: now,
        },
      });
      return { success: true, id: payload.id };
    } else {
      const newId =
        payload.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `story-${Date.now()}`;

      const finalAuthor =
        session.role === "writer"
          ? session.name
          : payload.author || session.name;

      await prisma.article.create({
        data: {
          id: newId,
          category: payload.category,
          art: payload.art,
          title: payload.title,
          excerpt: payload.excerpt,
          author: finalAuthor,
          role: payload.role,
          date: now,
          readTime: payload.readTime,
          dateline: payload.dateline,
          featured: payload.featured ? 1 : 0,
          tags: payload.tags.join(","),
          body: JSON.stringify(payload.body),
          status: payload.status,
          updatedAt: now,
        },
      });
      return { success: true, id: newId };
    }
  } catch (err: any) {
    console.error("Failed to save article:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function deleteArticleAction(
  id: string
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized access." };
  }

  if (session.role === "writer") {
    return {
      success: false,
      error: "Writers do not have permissions to delete articles.",
    };
  }

  try {
    await prisma.article.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete article:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

// ─── USER ACTIONS ─────────────────────────────────────────────────────────────

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
    const existing = await prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (existing) {
      return { success: false, error: "Username already exists." };
    }

    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        username: payload.username,
        passwordHash: hashPassword(payload.password),
        name: payload.name,
        role: payload.role,
      },
    });
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
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete user:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function resetPasswordAction(
  userId: string,
  newPassword?: string
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(newPassword) },
    });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to reset password:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

// ─── MEDIA ACTIONS ────────────────────────────────────────────────────────────

export async function deleteMediaAction(id: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized access." };
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return { success: false, error: "Media item not found." };
    }

    const fullPath = path.join(process.cwd(), "public", media.filepath);
    try {
      await fs.unlink(fullPath);
    } catch (e) {
      console.warn(`File could not be unlinked on disk: ${fullPath}`, e);
    }

    await prisma.media.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete media item:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

// ─── SUBSCRIBER ACTIONS (Admin) ───────────────────────────────────────────────

export async function removeSubscriberAction(
  id: string
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.subscriber.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to remove subscriber:", err);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function toggleSubscriberActiveAction(
  id: string,
  active: boolean
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.subscriber.update({ where: { id }, data: { active } });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to toggle subscriber:", err);
    return { success: false, error: "Database transaction failed." };
  }
}
