"use client";

import { useActionState } from "react";

import { initialActionResponse, type ActionResponse } from "@/lib/action-state";

type ActionFormProps = {
  action: (state: ActionResponse, formData: FormData) => Promise<ActionResponse>;
  children: React.ReactNode;
  className?: string;
};

export function ActionForm({ action, children, className }: ActionFormProps) {
  const [state, formAction] = useActionState(action, initialActionResponse);

  return (
    <form action={formAction} className={className} encType="multipart/form-data">
      {children}
      {state.status !== "idle" ? (
        <p
          className={`mt-4 rounded-[10px] px-4 py-3 text-sm ${
            state.status === "error"
              ? "border border-[var(--mustard)] bg-[var(--mustard-soft)] text-[var(--mustard-700)]"
              : "border border-[var(--indigo)]/20 bg-[var(--indigo-soft)] text-[var(--indigo-700)]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
