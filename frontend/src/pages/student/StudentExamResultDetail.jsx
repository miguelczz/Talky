import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { examService } from "../../services/exam.service";
import "../../assets/css/pages/student-exam-result-detail.css";

export default function StudentExamResultDetail() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (examId && examId !== ':examId' && examId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      loadData();
    } else {
      setError("ID de examen inválido");
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [examData, questionsData, resultData] = await Promise.all([
        examService.getById(examId),
        examService.getQuestions(examId),
        examService.getMyResult(examId),
      ]);

      setExam(examData);
      setQuestions(questionsData);
      
      if (!resultData) {
        setError("No se encontró un resultado para este examen");
        setLoading(false);
        return;
      }
      
      setResult(resultData);
    } catch (err) {
      console.error("Error loading exam result:", err);
      setError("Error al cargar los resultados del examen.");
    } finally {
      setLoading(false);
    }
  };

  const getStudentAnswer = (questionId) => {
    if (!result?.answers) return null;
    
    // Convertir questionId a string para asegurar consistencia
    const questionIdStr = String(questionId);
    
    // Si answers es un objeto (Map), buscar directamente
    if (typeof result.answers === 'object' && !Array.isArray(result.answers)) {
      // Intentar con el ID original y como string
      return result.answers[questionId] || result.answers[questionIdStr] || null;
    }
    
    // Si es un string JSON, parsearlo
    if (typeof result.answers === 'string') {
      try {
        const parsed = JSON.parse(result.answers);
        // Intentar con el ID original y como string
        return parsed[questionId] || parsed[questionIdStr] || null;
      } catch {
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

  if (error || !exam || !result) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error || "Examen o resultado no encontrado"}</p>
        <Link to="/student/results" className="btn-primary">
          Volver a Resultados
        </Link>
      </div>
    );
  }

  return (
    <div className="student-exam-result-detail-page">
      <div className="results-header">
        <div>
          <Link to="/student/results" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Volver a Resultados
          </Link>
          <h1 className="results-title">{exam.title}</h1>
          {exam.description && (
            <p className="results-description">{exam.description}</p>
          )}
        </div>
        <div className="results-stats">
          <div className="stat-card">
            <i className="fa-solid fa-question-circle"></i>
            <div>
              <span className="stat-value">{questions.length}</span>
              <span className="stat-label">Preguntas</span>
            </div>
          </div>
          <div className="stat-card score-card">
            <i className="fa-solid fa-chart-line"></i>
            <div>
              <span 
                className="stat-value" 
                style={{ color: getScoreColor(result.score) }}
              >
                {result.score.toFixed(1)}%
              </span>
              <span className="stat-label">
                {result.passed ? "Aprobado" : "No Aprobado"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="result-info-section">
        <div className="result-info-card">
          <div className="info-item">
            <i className="fa-solid fa-calendar"></i>
            <div>
              <span className="info-label">Fecha de presentación</span>
              <span className="info-value">
                {result.submittedAt
                  ? new Date(result.submittedAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Fecha no disponible"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h2 className="section-title">Tus Respuestas</h2>
        {!result.reviewed && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
            <p className="text-yellow-300 text-sm">
              <i className="fa-solid fa-info-circle mr-2"></i>
              Este examen aún no ha sido revisado por el profesor. Podrás ver las respuestas correctas una vez que sea revisado.
            </p>
          </div>
        )}
        <div className="answers-list">
          {questions.map((question, index) => {
            const studentAnswer = getStudentAnswer(question.id);
            // Mostrar si es correcta o incorrecta si tenemos la respuesta del estudiante
            // El estudiante puede ver si su respuesta fue correcta basándose en el score
            const canShowCorrectness = studentAnswer !== null;
            const isCorrect = canShowCorrectness ? isAnswerCorrect(question, studentAnswer) : null;
            const optionKeys = question.options
              ? Object.keys(question.options).sort()
              : [];

            return (
              <div
                key={question.id}
                className={`answer-card ${
                  canShowCorrectness 
                    ? (isCorrect ? "correct" : "incorrect") 
                    : ""
                }`}
              >
                <div className="answer-header">
                  <span className="question-number">Pregunta {index + 1}</span>
                  {canShowCorrectness && (
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
                  )}
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
                          isCorrectOption && result.reviewed ? "correct-option" : ""
                        } ${isSelected ? "selected" : ""}`}
                      >
                        <div className="option-indicator">
                          {isCorrectOption && result.reviewed && (
                            <i className="fa-solid fa-check-circle correct-icon"></i>
                          )}
                          {isSelected && !isCorrectOption && result.reviewed && (
                            <i className="fa-solid fa-times-circle incorrect-icon"></i>
                          )}
                          {isSelected && isCorrectOption && result.reviewed && (
                            <i className="fa-solid fa-check-circle selected-correct-icon"></i>
                          )}
                          {isSelected && !result.reviewed && (
                            <i className="fa-solid fa-circle text-blue-400"></i>
                          )}
                        </div>
                        <span className="option-key">{key.toUpperCase()}</span>
                        <span className="option-text">{question.options[key]}</span>
                        {isSelected && (
                          <span className="selected-badge">Tu respuesta</span>
                        )}
                        {isCorrectOption && result.reviewed && (
                          <span className="correct-badge">Respuesta correcta</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {studentAnswer === null && (
                  <div className="no-answer">
                    <i className="fa-solid fa-exclamation-triangle"></i>
                    <span>No respondiste esta pregunta</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

