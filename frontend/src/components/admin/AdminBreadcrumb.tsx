import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <div className="flex align-items-center gap-2 mb-6 text-sm">
      <Link to="/admin" className="admin-breadcrumb-link">
        <i className="pi pi-arrow-left text-xs" />
        Administration
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex align-items-center gap-2">
          <span>/</span>
          {item.path ? (
            <Link to={item.path} className="admin-breadcrumb-link">{item.label}</Link>
          ) : (
            <span className="font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}



