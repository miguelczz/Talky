import { apiFetch, baseUrl, getToken } from "../../utils/api";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/Access/AuthContext";

export default function AdminRoleManagement() {
  const { user: currentUser, refetchUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Todos los usuarios sin filtrar
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  useEffect(() => {
    // Filtrar usuarios por término de búsqueda
    if (searchTerm.trim() === "") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/users";
      if (filterRole !== "ALL") {
        url = `/api/admin/users/by-role?role=${filterRole}`;
      }

      const response = await apiFetch(url);
      const data = await response.json();
      setAllUsers(data);
      setUsers(data);
      // Limpiar búsqueda cuando cambia el filtro de rol
      setSearchTerm("");
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // Proteger al usuario admin actual
    if (userId === currentUser?.id) {
      alert("No puedes cambiar tu propio rol de administrador");
      return;
    }

    // Verificar si el usuario es admin
    const userToUpdate = users.find((u) => u.id === userId);
    if (userToUpdate?.role === "ADMIN") {
      alert("No se puede cambiar el rol de usuarios administradores");
      return;
    }

    try {
      setUpdating({ ...updating, [userId]: true });

      const token = await getToken();
      const response = await fetch(`${baseUrl}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "No se pudo actualizar el rol");
      }

      // Recargar usuarios
      await loadUsers();
      
      // Si se actualizó el usuario actual, refetch
      if (currentUser?.id === userId) {
        await refetchUser();
      }

      alert("Rol actualizado correctamente");
    } catch (error) {
      console.error("Error updating role:", error);
      alert(`Error: ${error.message || "No se pudo actualizar el rol"}`);
    } finally {
      setUpdating({ ...updating, [userId]: false });
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
        <h1 className="text-3xl font-bold mb-8">Gestión de Roles</h1>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-300">Filtrar por rol:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos</option>
              <option value="STUDENT">Estudiantes</option>
              <option value="TEACHER">Profesores</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-300">
              Buscar por nombre o email:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full bg-zinc-800 border border-zinc-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="mb-4 text-sm text-gray-400">
            Mostrando {users.length} resultado(s) para "{searchTerm}"
          </div>
        )}

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
                  Rol Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cambiar Rol
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
                    {(user.id === currentUser?.id || user.role === "ADMIN") ? (
                      <span className="text-gray-500 text-sm">Protegido</span>
                    ) : (
                      <>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          disabled={updating[user.id]}
                          className="bg-zinc-800 border border-zinc-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="STUDENT">Estudiante</option>
                          <option value="TEACHER">Profesor</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                        {updating[user.id] && (
                          <span className="ml-2 text-sm text-gray-400">
                            Actualizando...
                          </span>
                        )}
                      </>
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

        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">
            Notas Importantes
          </h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Si un estudiante cambia de rol, se quita su curso asignado</li>
            <li>No se puede cambiar a estudiante a un profesor con cursos asignados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

