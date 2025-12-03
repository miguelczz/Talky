import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { examService } from "../../services/exam.service";
import { apiFetch } from "../../utils/api";
import "../../assets/css/pages/teacher-exam-results.css";

export default function TeacherExamResults() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validar que examId exista y no sea el placeholder
    if (examId && examId !== ':examId') {
      loadData();
    } else {
      setError("ID de examen inválido");
      setLoading(false);
    }
  }, [examId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [examData, questionsData, resultsData] = await Promise.all([
        examService.getById(examId),
        examService.getQuestions(examId),
        examService.getResults(examId),
      ]);

      setExam(examData);
      setQuestions(questionsData);
      setResults(resultsData || []);
    } catch (err) {
      console.error("Error loading exam results:", err);
      let errorMessage = "Error al cargar los resultados del examen.";
      
      if (err.status === 403) {
        errorMessage = "No tienes permisos para ver los resultados de este examen.";
      } else if (err.status === 404) {
        errorMessage = "Examen no encontrado.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (result) => {
    setSelectedStudent(result);
    
    // Cargar el resultado completo con todas las respuestas
    try {
      const fullResult = await examService.getStudentResult(examId, result.studentId);
      setSelectedResult(fullResult);
    } catch (err) {
      console.error("Error loading student result:", err);
      setSelectedResult(result);
    }
  };

  const getStudentAnswer = (questionId) => {
    if (!selectedResult?.answers) return null;
    
    // Convertir questionId a string para asegurar consistencia
    const questionIdStr = String(questionId);
    
    // Si answers es un objeto (Map), buscar directamente
    if (typeof selectedResult.answers === 'object' && !Array.isArray(selectedResult.answers)) {
      // Intentar con el ID original y como string
      return selectedResult.answers[questionId] || selectedResult.answers[questionIdStr] || null;
    }
    
    // Si es un string JSON, parsearlo
    if (typeof selectedResult.answers === 'string') {
      try {
        const parsed = JSON.parse(selectedResult.answers);
        // Intentar con el ID original y como string
        return parsed[questionId] || parsed[questionIdStr] || null;
      } catch (e) {
        return null;
      }
    }
    
    return null;
  };

  const isAnswerCorrect = (question, studentAnswer) => {
    if (!studentAnswer) return false;
    return studentAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#10b981"; // verde
    if (score >= 50) return "#f59e0b"; // amarillo
    return "#ef4444"; // rojo
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando resultados...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error || "Examen no encontrado"}</p>
        <Link to="/teacher/exams" className="btn-primary">
          Volver a Exámenes
        </Link>
      </div>
    );
  }

  return (
    <div className="teacher-exam-results-page">
      <div className="results-header">
        <div>
          <Link to="/teacher/exams" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Volver a Exámenes
          </Link>
          <h1 className="results-title">{exam.title}</h1>
          {exam.description && (
            <p className="results-description">{exam.description}</p>
          )}
        </div>
        <div className="results-stats">
          <div className="stat-card">
            <i className="fa-solid fa-users"></i>
            <div>
              <span className="stat-value">{results.length}</span>
              <span className="stat-label">Estudiantes</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-question-circle"></i>
            <div>
              <span className="stat-value">{questions.length}</span>
              <span className="stat-label">Preguntas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-layout">
        {/* Lista de estudiantes */}
        <div className="students-panel">
          <h2 className="panel-title">Estudiantes</h2>
          {results.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-user-slash"></i>
              <p>Ningún estudiante ha presentado este examen aún</p>
            </div>
          ) : (
            <div className="students-list">
              {results.map((result) => (
                <button
                  key={result.id}
                  className={`student-card ${
                    selectedStudent?.id === result.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectStudent(result)}
                >
                  <div className="student-info">
                    <h3 className="student-name">
                      {result.studentName || "Estudiante"}
                    </h3>
                    <p className="student-email">{result.studentEmail}</p>
                    <p className="student-date">
                      {result.submittedAt
                        ? new Date(result.submittedAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Fecha no disponible"}
                    </p>
                  </div>
                  <div className="student-score">
                    <span
                      className="score-badge"
                      style={{ color: getScoreColor(result.score) }}
                    >
                      {result.score.toFixed(1)}%
                    </span>
                    {result.reviewed && (
                      <span className="reviewed-badge">
                        <i className="fa-solid fa-check-circle"></i>
                        Revisado
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalle de respuestas del estudiante seleccionado */}
        <div className="answers-panel">
          {!selectedStudent ? (
            <div className="empty-state-large">
              <i className="fa-solid fa-hand-pointer"></i>
              <h3>Selecciona un estudiante</h3>
              <p>Haz clic en un estudiante de la lista para ver sus respuestas</p>
            </div>
          ) : (
            <div className="student-answers-detail">
              <div className="detail-header">
                <div>
                  <h2 className="detail-title">
                    Respuestas de {selectedStudent.studentName}
                  </h2>
                  <p className="detail-subtitle">{selectedStudent.studentEmail}</p>
                </div>
                <div className="detail-score">
                  <div
                    className="score-circle-large"
                    style={{ borderColor: getScoreColor(selectedResult?.score || selectedStudent.score) }}
                  >
                    <span
                      style={{
                        color: getScoreColor(selectedResult?.score || selectedStudent.score),
                      }}
                    >
                      {(selectedResult?.score || selectedStudent.score).toFixed(1)}%
                    </span>
                  </div>
                  <p className="score-label">Calificación</p>
                </div>
              </div>

              <div className="answers-list">
                {questions.map((question, index) => {
                  const studentAnswer = getStudentAnswer(question.id);
                  const isCorrect = isAnswerCorrect(question, studentAnswer);
                  const optionKeys = question.options
                    ? Object.keys(question.options).sort()
                    : [];

                  return (
                    <div
                      key={question.id}
                      className={`answer-card ${isCorrect ? "correct" : "incorrect"}`}
                    >
                      <div className="answer-header">
                        <span className="question-number">Pregunta {index + 1}</span>
                        <span
                          className={`answer-status ${isCorrect ? "correct" : "incorrect"}`}
                        >
                          <i
                            className={`fa-solid ${
                              isCorrect ? "fa-check-circle" : "fa-times-circle"
                            }`}
                          ></i>
                          {isCorrect ? "Correcta" : "Incorrecta"}
                        </span>
                      </div>

                      <p className="question-text">{question.text}</p>

                      <div className="options-list">
                        {optionKeys.map((key) => {
                          const isSelected = studentAnswer === key;
                          const isCorrectOption = key.toLowerCase() === question.correctAnswer.toLowerCase();

                          return (
                            <div
                              key={key}
                              className={`option-item ${
                                isCorrectOption ? "correct-option" : ""
                              } ${isSelected ? "selected" : ""}`}
                            >
                              <div className="option-indicator">
                                {isCorrectOption && (
                                  <i className="fa-solid fa-check-circle correct-icon"></i>
                                )}
                                {isSelected && !isCorrectOption && (
                                  <i className="fa-solid fa-times-circle incorrect-icon"></i>
                                )}
                                {isSelected && isCorrectOption && (
                                  <i className="fa-solid fa-check-circle selected-correct-icon"></i>
                                )}
                              </div>
                              <span className="option-key">{key.toUpperCase()}</span>
                              <span className="option-text">{question.options[key]}</span>
                              {isSelected && (
                                <span className="selected-badge">Tu respuesta</span>
                              )}
                              {isCorrectOption && (
                                <span className="correct-badge">Correcta</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!studentAnswer && (
                        <div className="no-answer">
                          <i className="fa-solid fa-exclamation-triangle"></i>
                          <span>El estudiante no respondió esta pregunta</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedResult && !selectedResult.reviewed && (
                <div className="review-actions">
                  <button
                    className="btn-review"
                    onClick={async () => {
                      try {
                        await apiFetch(
                          `/api/exams/${examId}/results/${selectedResult.studentId}/review`,
                          { method: "PUT" }
                        );
                        await loadData();
                        if (selectedStudent) {
                          await handleSelectStudent(selectedStudent);
                        }
                      } catch (err) {
                        console.error("Error reviewing exam:", err);
                        alert("Error al marcar el examen como revisado");
                      }
                    }}
                  >
                    <i className="fa-solid fa-check"></i>
                    Marcar como Revisado
                  </button>
                  <p className="review-note">
                    Al marcar como revisado, el estudiante podrá ver las respuestas correctas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

