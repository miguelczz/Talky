import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await apiFetch("/api/student/exams");
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error("Error fetching exams:", error);
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
        <h1 className="text-3xl font-bold mb-8">Mis Exámenes</h1>

        {exams.length > 0 ? (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 hover:border-blue-500 transition"
              >
                <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
                <p className="text-gray-300 mb-4">{exam.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Curso: {exam.course?.title || "N/A"}
                  </span>
                  <Link
                    to={`/student/exam/${exam.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
                  >
                    Ver Examen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 text-center">
            <p className="text-gray-400">No hay exámenes disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

