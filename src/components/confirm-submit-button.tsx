"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  confirmMessage: string;
};

export function ConfirmSubmitButton({
  children,
  className,
  pendingLabel = "Procesando...",
  confirmMessage,
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!pending && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] bg-[var(--indigo)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
