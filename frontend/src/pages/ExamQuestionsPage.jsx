import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { examService } from "../services/exam.service";
import "../assets/css/pages/exam-questions.css";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const defaultOptions = () => [
  { key: "a", label: "Opción A", value: "" },
  { key: "b", label: "Opción B", value: "" },
];

export default function ExamQuestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isTeacher, isAdmin } = useAuth();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionError, setQuestionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [lessonLinkId, setLessonLinkId] = useState(
    location.state?.fromLessonId || null
  );
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: defaultOptions(),
    correctAnswer: "a",
  });

  useEffect(() => {
    if (!isTeacher && !isAdmin) {
      navigate("/courses");
      return;
    }
    loadData();
  }, [id, isTeacher, isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examData, questionsData] = await Promise.all([
        examService.getById(id),
        examService.getQuestions(id),
      ]);
      setExam(examData);
      setQuestions(questionsData);
      setLessonLinkId(examData.lessonId || location.state?.fromLessonId || null);
    } catch (err) {
      console.error("Error loading exam questions:", err);
      setError("Error al cargar el examen. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const questionCountLabel = useMemo(() => {
    if (!questions.length) return "Sin preguntas";
    return `${questions.length} pregunta${questions.length === 1 ? "" : "s"}`;
  }, [questions.length]);

  const resetForm = () => {
    setNewQuestion({
      text: "",
      options: defaultOptions(),
      correctAnswer: "a",
    });
    setQuestionError(null);
  };

  const addOption = () => {
    if (newQuestion.options.length >= MAX_OPTIONS) return;
    const nextKey = String.fromCharCode(97 + newQuestion.options.length); // a,b,c...
    setNewQuestion((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          key: nextKey,
          label: `Opción ${nextKey.toUpperCase()}`,
          value: "",
        },
      ],
    }));
  };

  const removeOption = (key) => {
    if (newQuestion.options.length <= MIN_OPTIONS) return;
    setNewQuestion((prev) => {
      const filtered = prev.options.filter((opt) => opt.key !== key);
      let nextCorrect = prev.correctAnswer;
      if (!filtered.find((opt) => opt.key === nextCorrect)) {
        nextCorrect = filtered[0].key;
      }
      return {
        ...prev,
        options: filtered,
        correctAnswer: nextCorrect,
      };
    });
  };

  const handleOptionChange = (key, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.key === key ? { ...opt, value } : opt
      ),
    }));
  };

  const validateQuestion = () => {
    if (!newQuestion.text.trim()) {
      return "La pregunta es obligatoria.";
    }

    const filledOptions = newQuestion.options.filter(
      (opt) => opt.value.trim().length > 0
    );

    if (filledOptions.length < MIN_OPTIONS) {
      return "Agrega al menos dos opciones.";
    }

    const correctOptionExists = filledOptions.some(
      (opt) => opt.key === newQuestion.correctAnswer
    );

    if (!correctOptionExists) {
      return "Selecciona una respuesta correcta válida.";
    }

    return null;
  };

  const handleAddQuestion = async () => {
    const validationError = validateQuestion();
    if (validationError) {
      setQuestionError(validationError);
      return;
    }

    try {
      setSaving(true);
      setQuestionError(null);

      const optionsPayload = {};
      newQuestion.options.forEach((opt) => {
        const trimmed = opt.value.trim();
        if (trimmed) {
          optionsPayload[opt.key] = trimmed;
        }
      });

      await examService.addQuestion(id, {
        text: newQuestion.text.trim(),
        options: optionsPayload,
        correctAnswer: newQuestion.correctAnswer,
      });

      resetForm();
      const updatedQuestions = await examService.getQuestions(id);
      setQuestions(updatedQuestions);
    } catch (err) {
      console.error("Error adding question:", err);
      setQuestionError("No se pudo agregar la pregunta. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("¿Eliminar esta pregunta?")) return;
    try {
      setDeletingId(questionId);
      await examService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("No se pudo eliminar la pregunta.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando examen...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error || "Examen no encontrado"}</p>
        <Link to="/courses" className="btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  const lessonDetailPath = lessonLinkId
    ? `/lessons/${lessonLinkId}/detail`
    : "/courses";

  return (
    <div className="exam-questions-page">
      <div className="page-header">
        <div>
          <Link
            to={lessonDetailPath}
            className="back-link"
            aria-label="Volver a la lección"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver a la lección
          </Link>
          <h1 className="page-title">{exam.title}</h1>
          <p className="page-subtitle">
            {exam.courseTitle} · {exam.lessonTitle} · {questionCountLabel}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/exams/${exam.id}/edit`)}
          >
            <i className="fa-solid fa-pen"></i>
            Editar examen
          </button>
        </div>
      </div>

      <div className="questions-layout">
        <section className="questions-list">
          {questions.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-list"></i>
              <p>Aún no has creado preguntas.</p>
              <span>Usa el formulario de la derecha para agregar la primera.</span>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-card-header">
                  <div>
                    <span className="question-number">Pregunta {index + 1}</span>
                    <p className="question-text">{question.text}</p>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={deletingId === question.id}
                    title="Eliminar pregunta"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
                <div className="question-options">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`question-option ${
                        question.correctAnswer === key ? "correct" : ""
                      }`}
                    >
                      <span className="option-key">{key.toUpperCase()}.</span>
                      <span className="option-text">{value}</span>
                      {question.correctAnswer === key && (
                        <span className="option-correct-label">Correcta</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="question-form">
          <h2>Agregar pregunta</h2>
          <div className="form-group">
            <label htmlFor="question-text" className="form-label">
              Pregunta
            </label>
            <textarea
              id="question-text"
              className="form-textarea"
              placeholder="Escribe la pregunta aquí..."
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion((prev) => ({ ...prev, text: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opciones</label>
            {newQuestion.options.map((option, idx) => (
              <div key={option.key} className="option-row">
                <div className="option-radio">
                  <input
                    type="radio"
                    name="correct-answer"
                    id={`correct-${option.key}`}
                    checked={newQuestion.correctAnswer === option.key}
                    onChange={() =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        correctAnswer: option.key,
                      }))
                    }
                  />
                  <label htmlFor={`correct-${option.key}`}>
                    {String.fromCharCode(65 + idx)}
                  </label>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Opción ${option.key.toUpperCase()}`}
                  value={option.value}
                  onChange={(e) => handleOptionChange(option.key, e.target.value)}
                />
                {newQuestion.options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removeOption(option.key)}
                    title="Eliminar opción"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            ))}
            {newQuestion.options.length < MAX_OPTIONS && (
              <button
                type="button"
                className="btn-link"
                onClick={addOption}
              >
                <i className="fa-solid fa-plus"></i>
                Agregar opción
              </button>
            )}
          </div>

          {questionError && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              {questionError}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddQuestion}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar pregunta"}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


