import { Link, useNavigate } from "react-router-dom";
import "../exams/ExamCard.css";

export default function ExamCard({ exam, onDelete, canEdit = false, canDelete = false, canTake = false }) {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de eliminar el examen "${exam.title}"?`)) {
      onDelete(exam.id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/exams/${exam.id}/edit`);
  };

  const handleManageQuestions = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/exams/${exam.id}/questions`, {
      state: { fromLessonId: exam.lessonId ?? null },
    });
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "var(--color-success)";
    return "rgb(239, 68, 68)";
  };

  return (
    <div className="exam-card">
      <Link
        to={canTake ? `/exams/${exam.id}/take` : `/exams/${exam.id}`}
        className="exam-card-link">
        <div className="exam-card-header">
          <h3 className="exam-card-title">{exam.title}</h3>
          {(canEdit || canDelete) && (
            <div className="exam-card-actions" onClick={(e) => e.preventDefault()}>
              {canEdit && (
                <>
                  <button
                    className="exam-card-action-btn"
                    onClick={handleManageQuestions}
                    title="Preguntas">
                    <i className="fa-solid fa-list-check"></i>
                  </button>
                  <button
                    className="exam-card-action-btn"
                    onClick={handleEdit}
                    title="Editar">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  className="exam-card-action-btn exam-card-delete"
                  onClick={handleDelete}
                  title="Eliminar">
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>
          )}
        </div>
        {exam.description && (
          <p className="exam-card-description">{exam.description}</p>
        )}
        <div className="exam-card-info">
          <div className="exam-card-info-item">
            <i className="fa-solid fa-book"></i>
            <span>{exam.lessonTitle}</span>
          </div>
          <div className="exam-card-info-item">
            <i className="fa-solid fa-question-circle"></i>
            <span>{exam.questionsCount} preguntas</span>
          </div>
          {exam.averageScore !== null && exam.averageScore !== undefined && (
            <div className="exam-card-info-item">
              <i className="fa-solid fa-chart-line"></i>
              <span style={{ color: getScoreColor(exam.averageScore) }}>
                Promedio: {exam.averageScore.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {canTake && (
          <div className="exam-card-take">
            <button className="btn-take-exam">
              <i className="fa-solid fa-play"></i>
              Presentar Examen
            </button>
          </div>
        )}
      </Link>
    </div>
  );
}

