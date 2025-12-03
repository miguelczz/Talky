import { useState, useEffect } from "react";
import { useAuth } from "../components/Access/AuthContext";
import { apiFetch } from "../utils/api";
import { signOut } from "@aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser, setAmplifyUser, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phoneNumber: "",
    birthdate: "",
    gender: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // Verificar si hay cambios
      const hasChanges =
        profileData.name !== (user.name || "") ||
        profileData.phoneNumber !== (user.phoneNumber || "") ||
        profileData.birthdate !== (user.birthdate || "") ||
        profileData.gender !== (user.gender || "");

      if (!hasChanges) {
        setError("No hay cambios para guardar");
        setSaving(false);
        return;
      }

      // Determinar el endpoint según el rol
      let endpoint = "";
      if (user.role === "STUDENT") {
        endpoint = "/api/student/profile";
      } else if (user.role === "TEACHER") {
        endpoint = "/api/teacher/profile";
      } else if (user.role === "ADMIN") {
        endpoint = "/api/admin/profile";
      } else {
        throw new Error("Rol de usuario no válido");
      }

      // Preparar datos para enviar (solo campos que han cambiado)
      // El backend valida que al menos un campo esté presente
      const updateData = {};
      
      // Nombre: solo si ha cambiado y no está vacío
      const currentName = (user.name || "").trim();
      const newName = (profileData.name || "").trim();
      if (newName && newName !== currentName) {
        updateData.name = newName;
      }
      
      // Teléfono: incluir si ha cambiado (puede ser null para limpiar)
      const currentPhone = user.phoneNumber || "";
      const newPhone = profileData.phoneNumber || "";
      if (newPhone !== currentPhone) {
        updateData.phoneNumber = newPhone.trim() || null;
      }
      
      // Fecha de nacimiento: incluir si ha cambiado (puede ser null para limpiar)
      const currentBirthdate = user.birthdate || "";
      const newBirthdate = profileData.birthdate || "";
      if (newBirthdate !== currentBirthdate) {
        updateData.birthdate = newBirthdate || null;
      }
      
      // Género: incluir si ha cambiado (puede ser null para limpiar)
      const currentGender = user.gender || "";
      const newGender = profileData.gender || "";
      if (newGender !== currentGender) {
        updateData.gender = newGender || null;
      }

      // Validar que al menos un campo esté presente (validación del frontend)
      if (Object.keys(updateData).length === 0) {
        setError("Debes modificar al menos un campo");
        setSaving(false);
        return;
      }

      // Actualizar perfil usando apiFetch para mantener consistencia
      try {
        const response = await apiFetch(endpoint, {
          method: "PUT",
          body: JSON.stringify(updateData),
        });

        // El apiFetch ya maneja errores, pero verificamos la respuesta
        const updatedUser = await response.json();

        // Actualizar el contexto con los nuevos datos
        await refetchUser();
        setMessage("Perfil actualizado correctamente");
        setTimeout(() => setMessage(null), 3000);
      } catch (fetchError) {
        // apiFetch lanza errores cuando la respuesta no es ok
        // Intentar parsear el error si viene del backend como JSON
        let errorMessage = "Error al actualizar el perfil";
        
        if (fetchError.message) {
          try {
            // Intentar parsear como JSON primero
            const errorData = JSON.parse(fetchError.message);
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              // Si hay errores de validación por campo
              errorMessage = errorData.errors
                .map((err) => {
                  const fieldName = err.field || err.fieldName || "Campo";
                  return `${fieldName}: ${err.message || err.defaultMessage || "Error de validación"}`;
                })
                .join(", ");
            } else if (typeof errorData === "string") {
              errorMessage = errorData;
            }
          } catch {
            // Si no es JSON, usar el mensaje directamente
            errorMessage = fetchError.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setAmplifyUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
        <div className="text-center">
          <p className="text-red-400">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header con gradiente */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-gray-400">Gestiona tu información personal</p>
        </div>

        {/* Tarjeta principal con diseño mejorado */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-sm rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden">
          {/* Sección de información personal */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* Campos editables con mejor diseño */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={profileData.birthdate}
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
                  value={profileData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Separador visual */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

          {/* Campos informativos */}
          <div className="p-8 space-y-6 bg-zinc-900/30">
            <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
              <i className="fas fa-info-circle text-orange-500"></i>
              Información de Cuenta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <i className="fas fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"></i>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El email no se puede modificar
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-400">
                  Rol
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      user.role === "STUDENT"
                        ? "Estudiante"
                        : user.role === "TEACHER"
                        ? "Profesor"
                        : "Administrador"
                    }
                    disabled
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <i className="fas fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"></i>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Solo modificable por administrador
                </p>
              </div>

              {user.courseTitle && (
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Curso Asignado
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.courseTitle}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <i className="fas fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Asignado por administrador
                  </p>
                </div>
              )}

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

          {/* Mensajes de feedback */}
          {message && (
            <div className="mx-8 mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <i className="fas fa-check-circle"></i>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mx-8 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Botones de acción con mejor diseño */}
          <div className="p-8 border-t border-zinc-700/50 bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
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
  );
}
