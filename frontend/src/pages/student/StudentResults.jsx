import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await apiFetch("/api/student/exam-results");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching results:", error);
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
        <h1 className="text-3xl font-bold mb-8">Mis Resultados</h1>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 hover:border-blue-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      {result.examTitle || result.exam?.title || "Examen"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      Fecha: {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "N/A"}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-blue-500">
                      {result.score}%
                    </p>
                    <p className="text-sm text-gray-400">
                      {result.passed ? "Aprobado" : "No Aprobado"}
                    </p>
                  </div>
                </div>
                {result.feedback && (
                  <p className="text-gray-300 mt-4 mb-4">{result.feedback}</p>
                )}
                {(result.examId || result.exam?.id) && (
                  <Link
                    to={`/student/exams/${result.examId || result.exam?.id}/result`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition text-white font-medium"
                  >
                    <i className="fa-solid fa-eye"></i>
                    Ver Respuestas
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 text-center">
            <p className="text-gray-400">No hay resultados disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

