import { Link, useNavigate } from "react-router-dom";
import "../lessons/LessonCard.css";

export default function LessonCard({ lesson, onDelete, canEdit = false, canDelete = false, progress = null }) {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de eliminar la lección "${lesson.title}"?`)) {
      onDelete(lesson.id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/lessons/${lesson.id}/edit`);
  };

  return (
    <div className="lesson-card">
      <Link to={`/lessons/${lesson.id}/detail`} className="lesson-card-link">
        <div className="lesson-card-header">
          <h3 className="lesson-card-title">{lesson.title}</h3>
          {(canEdit || canDelete) && (
            <div className="lesson-card-actions" onClick={(e) => e.preventDefault()}>
              {canEdit && (
                <button
                  className="lesson-card-action-btn"
                  onClick={handleEdit}
                  title="Editar">
                  <i className="fa-solid fa-pen"></i>
                </button>
              )}
              {canDelete && (
                <button
                  className="lesson-card-action-btn lesson-card-delete"
                  onClick={handleDelete}
                  title="Eliminar">
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>
          )}
        </div>
        {lesson.description && (
          <p className="lesson-card-description">{lesson.description}</p>
        )}
        <div className="lesson-card-info">
          <div className="lesson-card-info-item">
            <i className="fa-solid fa-book"></i>
            <span>{lesson.courseTitle}</span>
          </div>
          <div className="lesson-card-info-item">
            <i className="fa-solid fa-file-lines"></i>
            <span>{lesson.examsCount} exámenes</span>
          </div>
        </div>
        {progress !== null && (
          <div className="lesson-card-progress">
            <div className="lesson-progress-bar">
              <div
                className="lesson-progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="lesson-progress-text">{progress}% completado</span>
          </div>
        )}
      </Link>
    </div>
  );
}

