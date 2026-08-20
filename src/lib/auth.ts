import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/session";

const SESSION_COOKIE = "conectados_session";

export async function getSessionUser(): Promise<null | SessionUser> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    title: user.title,
    bio: user.bio,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
