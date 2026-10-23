// Shown while a page's code is downloading
export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-24" role="status" aria-label="Loading">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
    </div>
  );
}
