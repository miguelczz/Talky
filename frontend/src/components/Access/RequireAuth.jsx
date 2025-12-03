import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Componente que protege rutas que requieren autenticación (cualquier rol)
 * Para rutas con roles específicos, usar ProtectedRoute
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-4">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
