import { useAuth } from "../../components/Access/AuthContext";
import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Obtener cursos del profesor
      const coursesRes = await apiFetch("/api/teacher/courses");
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Obtener exámenes
      const examsRes = await apiFetch("/api/teacher/exams");
      const examsData = await examsRes.json();
      setExams(examsData);

      // Obtener estudiantes
      const studentsRes = await apiFetch("/api/teacher/students");
      const studentsData = await studentsRes.json();
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
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
        <h1 className="text-3xl font-bold mb-8">Panel de Profesor</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-2">Cursos</h2>
            <p className="text-3xl font-bold text-blue-500">{courses.length}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-2">Exámenes</h2>
            <p className="text-3xl font-bold text-green-500">{exams.length}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-2">Estudiantes</h2>
            <p className="text-3xl font-bold text-yellow-500">{students.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cursos */}
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Mis Cursos</h2>
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-zinc-800 p-4 rounded border border-zinc-600"
                  >
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {course.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No tienes cursos asignados</p>
            )}
          </div>

          {/* Exámenes recientes */}
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Exámenes Recientes</h2>
            {exams.length > 0 ? (
              <div className="space-y-3">
                {exams.slice(0, 5).map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-zinc-800 p-4 rounded border border-zinc-600"
                  >
                    <h3 className="font-medium">{exam.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {exam.course?.title || "Sin curso"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No hay exámenes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

