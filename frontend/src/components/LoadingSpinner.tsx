export default function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-kakao-border border-t-kakao-yellow"
        aria-hidden
      />
      {label && (
        <p className="text-base text-kakao-muted">{label}</p>
      )}
    </div>
  );
}
