"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  className,
  pendingLabel = "Guardando...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] bg-[var(--indigo)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
