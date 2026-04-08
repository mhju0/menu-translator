export default function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-black/[0.08] border-t-apple-accent"
        aria-hidden
      />
      {label && (
        <p className="text-[17px] font-normal text-apple-muted">{label}</p>
      )}
    </div>
  );
}
