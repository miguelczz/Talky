import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { lessonService } from "../services/lesson.service";
import { courseService } from "../services/course.service";
import { examService } from "../services/exam.service";
import ExamCard from "../components/exams/ExamCard";
import "../assets/css/pages/lesson-detail.css";

export default function LessonDetailPage() {
  const { id } = useParams();
  const { user, isTeacher, isAdmin, isStudent } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Lección no encontrada");
      setLoading(false);
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lessonData, examsData] = await Promise.all([
        lessonService.getById(id),
        examService.getByLesson(id),
      ]);
      setLesson(lessonData);
      
      // Cargar información del curso
      const courseData = await courseService.getById(lessonData.courseId);
      setCourse(courseData);
      
      setExams(examsData);
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError("Error al cargar la lección. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await examService.delete(examId);
      loadData();
    } catch (err) {
      console.error("Error deleting exam:", err);
      alert("Error al eliminar el examen.");
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando lección...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error || "Lección no encontrada"}</p>
        <Link to={course ? `/courses/${course.id}` : "/courses"} className="btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-detail-page">
      <div className="lesson-detail-header">
        <div>
          <Link 
            to={course ? `/courses/${course.id}` : "/courses"} 
            className="back-link"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          <h1 className="lesson-detail-title">{lesson.title}</h1>
          {lesson.description && (
            <p className="lesson-detail-description">{lesson.description}</p>
          )}
        </div>
        <div className="header-actions">
          {isStudent && (
            <Link 
              to="/student/results" 
              className="btn-secondary"
            >
              <i className="fa-solid fa-chart-line"></i>
              Calificaciones
            </Link>
          )}
          {isTeacher && (
            <Link 
              to="/teacher/exams" 
              className="btn-secondary"
            >
              <i className="fa-solid fa-chart-line"></i>
              Calificaciones
            </Link>
          )}
          {(isTeacher || isAdmin) && (
            <Link to={`/exams/new?lessonId=${lesson.id}`} className="btn-primary">
              <i className="fa-solid fa-plus"></i>
              Nuevo Examen
            </Link>
          )}
        </div>
      </div>

      <div className="lesson-detail-info">
        <div className="info-card">
          <i className="fa-solid fa-book"></i>
          <div>
            <span className="info-label">Curso</span>
            <span className="info-value">{lesson.courseTitle}</span>
          </div>
        </div>
        <div className="info-card">
          <i className="fa-solid fa-file-lines"></i>
          <div>
            <span className="info-label">Exámenes</span>
            <span className="info-value">{exams.length}</span>
          </div>
        </div>
      </div>

      {/* Contenido de la lección */}
      <div className="lesson-content-section">
        <div className="content-header">
          <h2 className="section-title">Contenido de la Lección</h2>
          {(isTeacher || isAdmin) && (
            <Link 
              to={`/lessons/${lesson.id}/edit`}
              className="btn-secondary btn-edit-content"
            >
              <i className="fa-solid fa-edit"></i>
              {lesson.content ? "Editar Contenido" : "Agregar Contenido"}
            </Link>
          )}
        </div>
        {lesson.content && lesson.content.trim() ? (
          <div className="lesson-content">
            <div 
              className="content-text"
              dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }} 
            />
          </div>
        ) : (
          <div className="content-empty-state">
            <i className="fa-solid fa-book-open"></i>
            <div>
              <h3>No hay contenido disponible</h3>
              <p>
                {isTeacher || isAdmin 
                  ? "Agrega contenido educativo a esta lección para que los estudiantes puedan aprender."
                  : "El profesor aún no ha agregado contenido a esta lección."}
              </p>
              {(isTeacher || isAdmin) && (
                <Link 
                  to={`/lessons/${lesson.id}/edit`}
                  className="btn-primary"
                  style={{ marginTop: '16px', display: 'inline-flex' }}
                >
                  <i className="fa-solid fa-plus"></i>
                  Agregar Contenido
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="exams-section">
        <h2 className="section-title">Exámenes</h2>
        {exams.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-file-lines"></i>
            <p>No hay exámenes en esta lección</p>
          </div>
        ) : (
          <div className="exams-grid">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onDelete={handleDeleteExam}
                canEdit={isTeacher || isAdmin}
                canDelete={isTeacher || isAdmin}
                canTake={!isTeacher && !isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

