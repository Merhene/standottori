export interface Status {
  kind: 'success' | 'error';
  message: string;
}

export default function StatusBanner({ status }: { status: Status | null }) {
  if (!status) return null;

  const colorClass =
    status.kind === 'success'
      ? 'border-green-500 text-green-700 dark:text-green-400'
      : 'border-red-500 text-red-700 dark:text-red-400';

  return (
    <p role="status" className={`border-l-4 pl-3 py-2 mb-4 text-sm ${colorClass}`}>
      {status.message}
    </p>
  );
}
