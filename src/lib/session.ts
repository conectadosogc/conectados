import type { AppRole } from "@/lib/permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatarUrl?: string | null;
  phone?: string | null;
  title?: string | null;
  bio?: string | null;
};

export type ScopeBadge = {
  title: string;
  detail: string;
};
