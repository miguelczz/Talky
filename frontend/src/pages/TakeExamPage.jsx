import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { examService } from "../services/exam.service";
import "../assets/css/pages/take-exam.css";

export default function TakeExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      console.warn("Usuario no autenticado");
      navigate("/signin");
      return;
    }
    loadExam();
  }, [id, user, navigate]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examData, questionsData] = await Promise.all([
        examService.getById(id),
        examService.getQuestions(id),
      ]);
      setExam(examData);
      setQuestions(questionsData);
      
      // Verificar si el estudiante ya presentó este examen
      try {
        const existingResult = await examService.getMyResult(id);
        if (existingResult) {
          // Ya existe un resultado, mostrar el resultado en lugar del formulario
          setResult(existingResult);
          setLoading(false);
          return;
        }
      } catch (err) {
        // No hay resultado previo, continuar normalmente
        if (err.status !== 404) {
          console.error("Error checking existing result:", err);
        }
      }
      
      // Inicializar respuestas vacías
      // Asegurar que los IDs sean strings para consistencia
      const initialAnswers = {};
      questionsData.forEach((q) => {
        const questionIdStr = String(q.id);
        initialAnswers[questionIdStr] = "";
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error("Error loading exam:", err);
      setError("Error al cargar el examen. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionKey) => {
    // Asegurar que el questionId sea string
    const questionIdStr = String(questionId);
    setAnswers((prev) => ({
      ...prev,
      [questionIdStr]: String(optionKey).trim(),
    }));
  };

  const handleSubmit = async () => {
    // Filtrar respuestas vacías antes de validar
    // Asegurar que los IDs sean strings para consistencia
    const filteredAnswers = {};
    Object.keys(answers).forEach((questionId) => {
      if (answers[questionId] && answers[questionId] !== "") {
        // Convertir el ID a string para asegurar consistencia
        const questionIdStr = String(questionId);
        filteredAnswers[questionIdStr] = String(answers[questionId]).trim();
      }
    });

    // Validar que haya al menos una respuesta
    if (Object.keys(filteredAnswers).length === 0) {
      setError("Debes responder al menos una pregunta para enviar el examen.");
      return;
    }

    // Validar que todas las preguntas tengan respuesta (solo mostrar mensaje, no alerta)
    const unansweredQuestions = questions.filter((q) => {
      const questionIdStr = String(q.id);
      return !answers[questionIdStr] || answers[questionIdStr] === "";
    });
    if (unansweredQuestions.length > 0) {
      setError(`Tienes ${unansweredQuestions.length} pregunta(s) sin responder. Por favor, responde todas las preguntas antes de enviar.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Log para depuración (solo en desarrollo)
      if (import.meta.env.DEV) {
        console.log("=== Enviando examen ===");
        console.log("Exam ID:", id);
        console.log("Total preguntas:", questions.length);
        console.log("Respuestas enviadas:", filteredAnswers);
        console.log("Detalle de preguntas y respuestas:");
        questions.forEach((q) => {
          console.log(`  Pregunta ID: ${q.id} (tipo: ${typeof q.id})`);
          console.log(`  Respuesta enviada: ${filteredAnswers[q.id] || 'NO ENCONTRADA'}`);
          console.log(`  Respuesta correcta: ${q.correctAnswer}`);
        });
        console.log("Payload completo:", { answers: filteredAnswers });
      }

      const result = await examService.submit(id, { answers: filteredAnswers });
      
      // Log del resultado recibido
      if (import.meta.env.DEV) {
        console.log("=== Resultado recibido ===");
        console.log("Score:", result.score);
        console.log("Resultado completo:", result);
      }
      
      setResult(result);
    } catch (err) {
      console.error("Error submitting exam:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.status,
        statusText: err.statusText,
      });
      
      let errorMessage = "Error al enviar el examen. Por favor, intenta de nuevo.";
      
      if (err.status === 403) {
        errorMessage = "No tienes permisos para realizar esta acción. Verifica que tu sesión sea válida.";
      } else if (err.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      } else if (err.status === 400) {
        errorMessage = "Datos inválidos. Verifica tus respuestas.";
      } else if (err.message) {
        const msg = err.message;
        if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
          errorMessage = "No tienes permisos para realizar esta acción. Verifica que tu sesión sea válida.";
        } else if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (msg.includes("400") || msg.toLowerCase().includes("invalid")) {
          errorMessage = "Datos inválidos. Verifica tus respuestas.";
        } else if (msg.length < 300) {
          errorMessage = msg;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((a) => a && a !== "").length;
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "var(--color-success)";
    if (score >= 50) return "#f59e0b";
    return "rgb(239, 68, 68)";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "¡Excelente!";
    if (score >= 70) return "¡Bien hecho!";
    if (score >= 50) return "Puedes mejorar";
    return "Sigue practicando";
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando examen...</p>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/courses" className="btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  // Mostrar resultado después de enviar
  if (result) {
    const lessonId = result.lessonId || exam?.lessonId;
    return (
      <div className="take-exam-page">
        <div className="exam-result-container">
          <div className="exam-result-header">
            <div className="result-icon">
              <i className={`fa-solid ${result.score >= 70 ? "fa-check-circle" : "fa-times-circle"}`}></i>
            </div>
            <h1 className="result-title">Examen Completado</h1>
            <p className="result-subtitle">{exam?.title || result.examTitle || "Examen"}</p>
          </div>

          <div className="result-score-card">
            <div className="score-circle" style={{ borderColor: getScoreColor(result.score) }}>
              <div className="score-value" style={{ color: getScoreColor(result.score) }}>
                {result.score.toFixed(1)}%
              </div>
            </div>
            <p className="score-message" style={{ color: getScoreColor(result.score) }}>
              {getScoreMessage(result.score)}
            </p>
          </div>

          <div className="result-info">
            <div className="result-info-item">
              <i className="fa-solid fa-list-check"></i>
              <span>Preguntas respondidas: {questions.length} de {questions.length}</span>
            </div>
            <div className="result-info-item">
              <i className="fa-solid fa-percent"></i>
              <span>Calificación: {result.score.toFixed(1)}%</span>
            </div>
            <div className="result-info-item">
              <i className="fa-solid fa-clock"></i>
              <span>
                Enviado el: {new Date(result.submittedAt).toLocaleString("es-ES")}
              </span>
            </div>
          </div>

          <div className="result-actions">
            {lessonId && (
              <Link to={`/lessons/${lessonId}/detail`} className="btn-primary">
                <i className="fa-solid fa-list"></i>
                Ver Mis Exámenes
              </Link>
            )}
            <Link to="/courses" className="btn-secondary">
              <i className="fa-solid fa-arrow-left"></i>
              Volver a Cursos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="take-exam-page">
      <div className="exam-header">
        <div>
          <Link to="/student/exams" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          <h1 className="exam-title">{exam.title}</h1>
          {exam.description && (
            <p className="exam-description">{exam.description}</p>
          )}
        </div>
        <div className="exam-stats">
          <div className="stat-item">
            <i className="fa-solid fa-question-circle"></i>
            <span>{questions.length} preguntas</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-check"></i>
            <span>{getAnsweredCount()} respondidas</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="questions-container">
        {questions.map((question, index) => {
          const optionKeys = Object.keys(question.options).sort();
          const questionIdStr = String(question.id);
          const selectedAnswer = answers[questionIdStr] || "";

          return (
            <div key={questionIdStr} className="question-card">
              <div className="question-header">
                <span className="question-number">Pregunta {index + 1}</span>
                {selectedAnswer && (
                  <span className="question-answered">
                    <i className="fa-solid fa-check"></i>
                    Respondida
                  </span>
                )}
              </div>
              <p className="question-text">{question.text}</p>
              <div className="options-container">
                {optionKeys.map((key) => (
                  <label
                    key={key}
                    className={`option-label ${selectedAnswer === key ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name={`question-${questionIdStr}`}
                      value={key}
                      checked={selectedAnswer === key}
                      onChange={() => handleAnswerChange(questionIdStr, key)}
                      className="option-input"
                    />
                    <span className="option-key">{key.toUpperCase()}</span>
                    <span className="option-text">{question.options[key]}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="exam-footer">
        <div className="footer-info">
          <span>
            {getAnsweredCount()} de {questions.length} preguntas respondidas
          </span>
        </div>
        <button
          className="btn-submit-exam"
          onClick={handleSubmit}
          disabled={submitting}>
          {submitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Enviando...
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i>
              Enviar Examen
            </>
          )}
        </button>
      </div>
    </div>
  );
}

