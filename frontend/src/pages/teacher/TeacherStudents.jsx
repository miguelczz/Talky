import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiFetch("/api/teacher/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mis Estudiantes</h1>

        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-zinc-900 p-6 rounded-lg border border-zinc-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{student.name}</h2>
                    <p className="text-gray-400 mt-1">{student.email}</p>
                    {student.courseTitle && (
                      <p className="text-sm text-gray-500 mt-2">
                        Curso: {student.courseTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 text-center">
            <p className="text-gray-400">No tienes estudiantes asignados</p>
          </div>
        )}
      </div>
    </div>
  );
}

