import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function TeacherGrades() {
  const [courses, setCourses] = useState([]);
  const [courseGrades, setCourseGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener cursos del profesor
      const coursesResponse = await apiFetch("/api/teacher/courses");
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Obtener todos los exámenes del profesor
      const examsResponse = await apiFetch("/api/teacher/exams");
      const examsData = await examsResponse.json();

      // Obtener estudiantes del profesor
      const studentsResponse = await apiFetch("/api/teacher/students");
      const studentsData = await studentsResponse.json();

      // Agrupar exámenes por curso
      const gradesByCourse = {};
      
      for (const exam of examsData) {
        if (!exam.courseId) continue;
        
        const courseId = exam.courseId;
        
        if (!gradesByCourse[courseId]) {
          gradesByCourse[courseId] = {
            course: coursesData.find(c => c.id === courseId),
            exams: [],
            students: studentsData.filter(s => {
              // Verificar si el estudiante pertenece a este curso
              return s.courseAsStudent?.id === courseId || 
                     s.courseId === courseId ||
                     (s.courseAsStudent && typeof s.courseAsStudent === 'string' && s.courseAsStudent === courseId);
            })
          };
        }

        // Obtener resultados del examen
        try {
          const resultsResponse = await apiFetch(`/api/exams/${exam.id}/results`);
          const resultsData = await resultsResponse.json();
          
          gradesByCourse[courseId].exams.push({
            ...exam,
            results: resultsData
          });
        } catch (err) {
          console.error(`Error fetching results for exam ${exam.id}:`, err);
          gradesByCourse[courseId].exams.push({
            ...exam,
            results: []
          });
        }
      }

      setCourseGrades(gradesByCourse);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#10b981"; // verde
    if (score >= 50) return "#f59e0b"; // amarillo
    return "#ef4444"; // rojo
  };

  const getStudentAverage = (studentId, courseId) => {
    const courseData = courseGrades[courseId];
    if (!courseData) return null;

    const studentResults = [];
    courseData.exams.forEach(exam => {
      const result = exam.results.find(r => r.studentId === studentId);
      if (result) {
        studentResults.push(result.score);
      }
    });

    if (studentResults.length === 0) return null;
    const average = studentResults.reduce((a, b) => a + b, 0) / studentResults.length;
    return average.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Calificaciones de Estudiantes</h1>

        {Object.keys(courseGrades).length === 0 ? (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 text-center">
            <p className="text-gray-400">No hay calificaciones disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(courseGrades).map(([courseId, courseData]) => {
              const course = courseData.course;
              if (!course) return null;

              const isExpanded = expandedCourses[courseId];

              return (
                <div
                  key={courseId}
                  className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleCourse(courseId)}
                    className="w-full p-6 flex justify-between items-center hover:bg-zinc-800 transition"
                  >
                    <div className="text-left">
                      <h2 className="text-xl font-semibold">{course.title}</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {courseData.students.length} estudiante(s) • {courseData.exams.length} examen(es)
                      </p>
                    </div>
                    <i
                      className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} text-gray-400`}
                    ></i>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-zinc-700 p-6">
                      {courseData.students.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">
                          No hay estudiantes asignados a este curso
                        </p>
                      ) : (
                        <div className="space-y-6">
                          {courseData.students.map((student) => {
                            const average = getStudentAverage(student.id, courseId);
                            const studentResults = [];
                            
                            courseData.exams.forEach(exam => {
                              const result = exam.results.find(r => r.studentId === student.id);
                              studentResults.push({
                                exam,
                                result
                              });
                            });

                            return (
                              <div
                                key={student.id}
                                className="bg-zinc-800 p-4 rounded-lg border border-zinc-700"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">{student.name}</h3>
                                    <p className="text-sm text-gray-400">{student.email}</p>
                                  </div>
                                  {average && (
                                    <div className="text-right">
                                      <p
                                        className="text-2xl font-bold"
                                        style={{ color: getScoreColor(parseFloat(average)) }}
                                      >
                                        {average}%
                                      </p>
                                      <p className="text-xs text-gray-400">Promedio</p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  {studentResults.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                      No ha presentado exámenes aún
                                    </p>
                                  ) : (
                                    studentResults.map(({ exam, result }) => (
                                      <div
                                        key={exam.id}
                                        className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-700"
                                      >
                                        <div className="flex-1">
                                          <p className="font-medium">{exam.title}</p>
                                          <p className="text-xs text-gray-400">
                                            {result?.submittedAt
                                              ? new Date(result.submittedAt).toLocaleDateString("es-ES")
                                              : "No presentado"}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          {result ? (
                                            <>
                                              <span
                                                className="text-lg font-bold"
                                                style={{ color: getScoreColor(result.score) }}
                                              >
                                                {result.score.toFixed(1)}%
                                              </span>
                                              <Link
                                                to={`/teacher/exams/${exam.id}/results`}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                                              >
                                                Ver Detalles
                                              </Link>
                                            </>
                                          ) : (
                                            <span className="text-sm text-gray-500">
                                              No presentado
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

