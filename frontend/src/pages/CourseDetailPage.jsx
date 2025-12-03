import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { courseService } from "../services/course.service";
import { lessonService } from "../services/lesson.service";
import LessonCard from "../components/lessons/LessonCard";
import "../assets/css/pages/course-detail.css";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher, isAdmin } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, lessonsData] = await Promise.all([
        courseService.getById(id),
        lessonService.getByCourse(id),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (err) {
      console.error("Error loading course:", err);
      setError("Error al cargar el curso. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await lessonService.delete(lessonId);
      loadData();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Error al eliminar la lección.");
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error || "Curso no encontrado"}</p>
        <Link to="/courses" className="btn-primary">
          Volver a Cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-detail-header">
        <div>
          <Link to="/courses" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          <h1 className="course-detail-title">{course.title}</h1>
          {course.description && (
            <p className="course-detail-description">{course.description}</p>
          )}
        </div>
        {(isTeacher || isAdmin) && (
          <Link to={`/lessons/new?courseId=${course.id}`} className="btn-primary">
            <i className="fa-solid fa-plus"></i>
            Nueva Lección
          </Link>
        )}
      </div>

      <div className="course-detail-info">
        <div className="info-card">
          <i className="fa-solid fa-user-tie"></i>
          <div>
            <span className="info-label">Profesor</span>
            <span className="info-value">{course.teacherName}</span>
          </div>
        </div>
        <div className="info-card">
          <i className="fa-solid fa-users"></i>
          <div>
            <span className="info-label">Estudiantes</span>
            <span className="info-value">{course.studentsCount}</span>
          </div>
        </div>
        <div className="info-card">
          <i className="fa-solid fa-book"></i>
          <div>
            <span className="info-label">Lecciones</span>
            <span className="info-value">{course.lessonsCount}</span>
          </div>
        </div>
      </div>

      <div className="lessons-section">
        <h2 className="section-title">Lecciones</h2>
        {lessons.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-book-open"></i>
            <p>No hay lecciones en este curso</p>
          </div>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onDelete={handleDeleteLesson}
                canEdit={isTeacher || isAdmin}
                canDelete={isTeacher || isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

