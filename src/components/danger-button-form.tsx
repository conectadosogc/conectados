import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

type DangerButtonFormProps = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
};

export function DangerButtonForm({
  action,
  id,
  label = "Eliminar",
  confirmMessage = "Esta accion eliminara este registro de forma permanente. Deseas continuar?",
}: DangerButtonFormProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmitButton
        confirmMessage={confirmMessage}
        className="bg-[var(--surface-strong)] px-3 py-2 text-xs text-[var(--mustard-700)] ring-1 ring-[var(--mustard)]/30"
        pendingLabel="..."
      >
        {label}
      </ConfirmSubmitButton>
    </form>
  );
}
