"use client";

import { useState } from "react";

function extractLocalDigits(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  if (digits.length >= 11 && digits.startsWith("1")) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
}

function normalizeLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.length >= 11 && digits.startsWith("1")) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
}

function formatLocalDigits(value: string) {
  if (!value) return "";
  if (value.length <= 3) return value;
  if (value.length <= 6) {
    return `${value.slice(0, 3)} ${value.slice(3)}`.trim();
  }

  return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`.trim();
}

function formatStoredPhone(value: string) {
  if (!value) return "";
  if (value.length <= 3) return `+1 ${value}`.trim();
  if (value.length <= 6) {
    return `+1 ${value.slice(0, 3)} ${value.slice(3)}`.trim();
  }

  return `+1 ${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`.trim();
}

export function DoPhoneField({
  label = "Telefono",
  name = "phone",
  defaultValue,
  placeholder = "+1 809 555 1234",
}: {
  label?: string;
  name?: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const [digits, setDigits] = useState(() => extractLocalDigits(defaultValue));

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
        {label}
      </label>
      <input type="hidden" name={name} value={formatStoredPhone(digits)} />
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
          +1
        </span>
        <input
          type="tel"
          inputMode="tel"
          placeholder={placeholder.replace("+1 ", "")}
          value={formatLocalDigits(digits)}
          onChange={(event) => setDigits(normalizeLocalDigits(event.target.value))}
          className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-12 py-3 text-sm text-[var(--foreground)]"
        />
      </div>
    </div>
  );
}
