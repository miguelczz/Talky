import { Link } from "react-router-dom";
import "../courses/CourseCard.css";

export default function CourseCard({ course, onDelete, canEdit = false, canDelete = false }) {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de eliminar el curso "${course.title}"?`)) {
      onDelete(course.id);
    }
  };

  return (
    <div className="course-card">
      <Link to={`/courses/${course.id}`} className="course-card-link">
        <div className="course-card-header">
          <h3 className="course-card-title">{course.title}</h3>
          {(canEdit || canDelete) && (
            <div className="course-card-actions" onClick={(e) => e.preventDefault()}>
              {canEdit && (
                <Link
                  to={`/courses/${course.id}/edit`}
                  className="course-card-action-btn"
                  onClick={(e) => e.stopPropagation()}
                  title="Editar">
                  <i className="fa-solid fa-pen"></i>
                </Link>
              )}
              {canDelete && (
                <button
                  className="course-card-action-btn course-card-delete"
                  onClick={handleDelete}
                  title="Eliminar">
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>
          )}
        </div>
        {course.description && (
          <p className="course-card-description">{course.description}</p>
        )}
        <div className="course-card-info">
          <div className="course-card-info-item">
            <i className="fa-solid fa-user-tie"></i>
            <span>{course.teacherName}</span>
          </div>
          <div className="course-card-info-item">
            <i className="fa-solid fa-users"></i>
            <span>{course.studentsCount} estudiantes</span>
          </div>
          <div className="course-card-info-item">
            <i className="fa-solid fa-book"></i>
            <span>{course.lessonsCount} lecciones</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

