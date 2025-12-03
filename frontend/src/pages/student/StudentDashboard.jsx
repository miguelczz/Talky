import { useAuth } from "../../components/Access/AuthContext";
import { apiFetch, baseUrl } from "../../utils/api";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Obtener curso del estudiante
      const courseRes = await apiFetch("/api/student/course");
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Obtener exámenes del estudiante
      const examsRes = await apiFetch("/api/student/exams");
      const examsData = await examsRes.json();
      setExams(examsData);
    } catch (error) {
      console.error("Error fetching student data:", error);
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
        <h1 className="text-3xl font-bold mb-8">Panel de Estudiante</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Información del curso */}
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Mi Curso</h2>
            {course ? (
              <div>
                <p className="text-lg font-medium">{course.title}</p>
                <p className="text-gray-400 mt-2">{course.description}</p>
              </div>
            ) : (
              <p className="text-gray-400">No tienes un curso asignado</p>
            )}
          </div>

          {/* Información del usuario */}
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Mi Perfil</h2>
            <p className="text-gray-300">Nombre: {user?.name}</p>
            <p className="text-gray-300">Email: {user?.email}</p>
            <p className="text-gray-300">Rol: {user?.role}</p>
          </div>
        </div>

        {/* Exámenes */}
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
          <h2 className="text-xl font-semibold mb-4">Mis Exámenes</h2>
          {exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-zinc-800 p-4 rounded border border-zinc-600"
                >
                  <h3 className="font-medium">{exam.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {exam.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay exámenes disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}

