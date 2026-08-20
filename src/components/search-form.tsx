type SearchFormProps = {
  hiddenFields?: Record<string, string>;
  placeholder: string;
  defaultValue?: string;
};

export function SearchForm({
  hiddenFields,
  placeholder,
  defaultValue = "",
}: SearchFormProps) {
  return (
    <form className="border-b border-[var(--line)] px-6 py-5">
      {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-4 text-sm text-[var(--foreground)]"
      />
    </form>
  );
}
