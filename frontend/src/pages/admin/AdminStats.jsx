import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";

export default function AdminStats() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los usuarios
      const usersRes = await apiFetch("/api/admin/users");
      const usersData = await usersRes.json();
      
      // Obtener cursos
      const coursesRes = await apiFetch("/api/admin/courses");
      const coursesData = await coursesRes.json();

      setStats({
        users: usersData.length,
        students: usersData.filter((u) => u.role === "STUDENT").length,
        teachers: usersData.filter((u) => u.role === "TEACHER").length,
        admins: usersData.filter((u) => u.role === "ADMIN").length,
        courses: coursesData.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-8">Estadísticas del Sistema</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-semibold mb-2">Total Usuarios</h2>
            <p className="text-4xl font-bold text-blue-500">{stats.users}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-semibold mb-2">Estudiantes</h2>
            <p className="text-4xl font-bold text-green-500">{stats.students}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-semibold mb-2">Profesores</h2>
            <p className="text-4xl font-bold text-yellow-500">{stats.teachers}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-semibold mb-2">Administradores</h2>
            <p className="text-4xl font-bold text-purple-500">{stats.admins}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-semibold mb-2">Cursos</h2>
            <p className="text-4xl font-bold text-red-500">{stats.courses}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

