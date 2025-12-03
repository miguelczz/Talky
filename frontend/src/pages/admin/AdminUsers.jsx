import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/Access/AuthContext";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/users";
      if (filterRole !== "ALL") {
        url = `/api/admin/users/by-role?role=${filterRole}`;
      }
      
      const response = await apiFetch(url);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    // Proteger al usuario admin actual
    if (userId === currentUser?.id) {
      alert("No puedes eliminar tu propia cuenta de administrador");
      return;
    }

    // Verificar si el usuario a eliminar es admin
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete?.role === "ADMIN") {
      alert("No se pueden eliminar usuarios administradores");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return;
    }

    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      fetchUsers(); // Recargar lista
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar usuario");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

        <div className="mb-6">
          <label className="block mb-2">Filtrar por rol:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2 rounded-md"
          >
            <option value="ALL">Todos</option>
            <option value="STUDENT">Estudiantes</option>
            <option value="TEACHER">Profesores</option>
            <option value="ADMIN">Administradores</option>
          </select>
        </div>

        <div className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-purple-600"
                          : user.role === "TEACHER"
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Ver
                    </Link>
                    {user.id !== currentUser?.id && user.role !== "ADMIN" && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    )}
                    {(user.id === currentUser?.id || user.role === "ADMIN") && (
                      <span className="text-gray-500 text-sm">Protegido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center mt-8 text-gray-400">
            No hay usuarios disponibles
          </div>
        )}
      </div>
    </div>
  );
}

