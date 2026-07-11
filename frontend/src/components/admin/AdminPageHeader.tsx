interface AdminPageHeaderProps {
  title: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
  rightContent?: React.ReactNode;
}

export default function AdminPageHeader({ 
  title, 
  actionLabel, 
  actionIcon,
  onAction,
  rightContent 
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {rightContent ? (
        rightContent
      ) : actionLabel && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-dark-bg dark:bg-dark-text text-dark-text dark:text-dark-bg rounded-lg hover:opacity-90 transition-opacity"
        >
          {actionIcon && <i className={`pi ${actionIcon}`} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}





