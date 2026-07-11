import { Link } from 'react-router-dom';

interface AdminCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
  buttonLabel?: string;
  badge?: string;
}

export default function AdminCard({ 
  icon, 
  title, 
  description, 
  path, 
  buttonLabel = 'Accéder',
  badge 
}: AdminCardProps) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <i className={`pi ${icon} text-2xl`} />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {badge && (
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm opacity-70 mb-4">{description}</p>
      <Link to={path} className="admin-btn">
        {buttonLabel}
        <i className="pi pi-arrow-right text-xs" />
      </Link>
    </div>
  );
}





