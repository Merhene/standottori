interface AdminEmptyStateProps {
  icon: string;
  message: string;
  hint?: string;
}

export default function AdminEmptyState({ icon, message, hint }: AdminEmptyStateProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
      <i className={`pi ${icon} text-4xl opacity-30 mb-4`} style={{ display: 'block' }} />
      <p className="opacity-50">{message}</p>
      {hint && <p className="text-sm opacity-30 mt-2">{hint}</p>}
    </div>
  );
}





