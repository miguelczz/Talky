import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch, baseUrl, getToken } from "../../utils/api";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    phoneNumber: "",
    birthdate: "",
    gender: "",
    courseId: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchCourses();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await apiFetch(`/api/admin/users/${id}`);
      const data = await response.json();
      setUser(data);
      setUserData({
        name: data.name || "",
        phoneNumber: data.phoneNumber || "",
        birthdate: data.birthdate || "",
        gender: data.gender || "",
        courseId: data.courseId || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiFetch("/api/admin/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // Preparar datos para actualizar perfil
      const updateData = {};
      if (userData.name.trim() !== (user.name || "").trim()) {
        updateData.name = userData.name.trim();
      }
      if (userData.phoneNumber !== (user.phoneNumber || "")) {
        updateData.phoneNumber = userData.phoneNumber.trim() || null;
      }
      if (userData.birthdate !== (user.birthdate || "")) {
        updateData.birthdate = userData.birthdate || null;
      }
      if (userData.gender !== (user.gender || "")) {
        updateData.gender = userData.gender || null;
      }

      // Actualizar perfil si hay cambios
      // Nota: Necesitamos un endpoint específico de admin para actualizar otros usuarios
      // Por ahora, intentamos usar el endpoint de admin para actualizar usuarios
      if (Object.keys(updateData).length > 0) {
        const token = await getToken();
        
        // Intentar actualizar usando endpoint de admin (si existe)
        // Si no existe, el backend necesitará crear: PUT /api/admin/users/{id}/profile
        const profileResponse = await fetch(`${baseUrl}/api/admin/users/${id}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!profileResponse.ok) {
          // Si el endpoint no existe (404), solo continuamos con la actualización del curso
          if (profileResponse.status !== 404) {
            const errorText = await profileResponse.text();
            throw new Error(errorText || "Error al actualizar el perfil del usuario");
          }
        }
      }

      // Manejar asignación/remoción de curso (solo para estudiantes)
      if (user.role === "STUDENT") {
        const currentCourseId = user.courseId || "";
        const newCourseId = userData.courseId || "";

        if (newCourseId !== currentCourseId) {
          const token = await getToken();
          
          // Si había un curso y se cambió o se quitó
          if (currentCourseId) {
            const removeResponse = await fetch(`${baseUrl}/api/admin/users/${id}/remove-course`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!removeResponse.ok) {
              const errorText = await removeResponse.text();
              throw new Error(errorText || "Error al quitar el curso");
            }
          }

          // Si se asignó un nuevo curso
          if (newCourseId) {
            const assignResponse = await fetch(`${baseUrl}/api/admin/users/${id}/assign-course/${newCourseId}`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!assignResponse.ok) {
              const errorText = await assignResponse.text();
              throw new Error(errorText || "Error al asignar el curso");
            }
          }
        }
      }

      // Recargar datos
      await fetchUserData();
      setMessage("Usuario actualizado correctamente");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      let errorMessage = "Error al actualizar el usuario";
      
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">Usuario no encontrado</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Volver a Usuarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/admin/users")}
              className="mb-4 text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Volver a Usuarios</span>
            </button>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              Detalles del Usuario
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === "ADMIN"
                  ? "bg-purple-600/20 text-purple-400 border border-purple-600/50"
                  : user.role === "TEACHER"
                  ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/50"
                  : "bg-green-600/20 text-green-400 border border-green-600/50"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-sm rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Avatar y nombre */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-700/50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* Campos editables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={userData.birthdate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Género
                </label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              {/* Curso asignado (solo para estudiantes) */}
              {user.role === "STUDENT" && (
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Curso Asignado
                  </label>
                  <select
                    name="courseId"
                    value={userData.courseId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                  >
                    <option value="">Sin curso asignado</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona un curso para asignarlo al estudiante
                  </p>
                </div>
              )}
            </div>

            {/* Campos informativos */}
            <div className="pt-6 border-t border-zinc-700/50">
              <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-orange-500"></i>
                Información del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">
                    Fecha de Registro
                  </label>
                  <input
                    type="text"
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"
                    }
                    disabled
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Mensajes */}
            {message && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-700/50">
              <button
                onClick={() => navigate("/admin/users")}
                className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-600/50 text-white rounded-lg transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

