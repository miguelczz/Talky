import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";

export default function StudentCourse() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const response = await apiFetch("/api/student/course");
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
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
        <h1 className="text-3xl font-bold mb-8">Mi Curso</h1>

        {course ? (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-2xl font-semibold mb-4">{course.title}</h2>
            <p className="text-gray-300 mb-4">{course.description}</p>
            {course.teacher && (
              <p className="text-sm text-gray-400">
                Profesor: {course.teacher.name}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 text-center">
            <p className="text-gray-400">
              No tienes un curso asignado. Contacta a un administrador.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

