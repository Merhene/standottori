import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function RequireAdmin() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="border border-amber-400 bg-amber-50 dark:bg-amber-950 rounded-lg p-6">
          <h1 className="text-xl font-bold mb-2">Backend non configuré</h1>
          <p className="text-sm">
            Copiez <code>frontend/.env.example</code> vers <code>frontend/.env.local</code> et
            renseignez les clés Supabase, puis redémarrez le serveur de développement.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
