import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Componente que protege rutas según el rol del usuario
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si el usuario tiene acceso
 * @param {Array<'STUDENT' | 'TEACHER' | 'ADMIN'>} props.allowedRoles - Roles permitidos para acceder
 */
export default function ProtectedRoute({ children, allowedRoles }) {
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

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-400 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual: <span className="font-semibold">{user.role}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
}

