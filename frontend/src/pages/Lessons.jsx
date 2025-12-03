import { useState, useEffect } from "react";
import { useAuth } from "../components/Access/AuthContext";
import { lessonService } from "../services/lesson.service";
import { courseService } from "../services/course.service";
import LessonCard from "../components/lessons/LessonCard";
import "../assets/css/pages/lessons.css";

export default function Lessons() {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isStudent && user?.courseId) {
        // Para estudiantes: cargar lecciones de su curso y progreso
        const [lessonsData, courseData] = await Promise.all([
          lessonService.getByCourse(user.courseId),
          courseService.getById(user.courseId),
        ]);
        setLessons(lessonsData);
        setCourse(courseData);

        // Cargar progreso de cada lección
        const progressPromises = lessonsData.map(async (lesson) => {
          try {
            const progress = await lessonService.getProgress(lesson.id);
            return { lessonId: lesson.id, progress: progress.progress };
          } catch {
            return { lessonId: lesson.id, progress: 0 };
          }
        });
        const progressResults = await Promise.all(progressPromises);
        const progressObj = {};
        progressResults.forEach(({ lessonId, progress }) => {
          progressObj[lessonId] = progress;
        });
        setProgressMap(progressObj);
      } else {
        // Para profesores y admins: cargar todas las lecciones
        const lessonsData = await lessonService.getAll();
        setLessons(lessonsData);
      }
    } catch (err) {
      console.error("Error loading lessons:", err);
      setError("Error al cargar las lecciones. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando lecciones...</p>
      </div>
    );
  }

  return (
    <div className="lessons-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isStudent ? "Mis Lecciones" : isTeacher ? "Lecciones" : "Todas las Lecciones"}
          </h1>
          {course && (
            <p className="page-subtitle">Curso: {course.title}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-book-open"></i>
          <h3>No hay lecciones disponibles</h3>
          <p>
            {isStudent
              ? "Aún no hay lecciones en tu curso"
              : "No hay lecciones creadas"}
          </p>
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onDelete={async () => {
                if (window.confirm(`¿Eliminar la lección "${lesson.title}"?`)) {
                  try {
                    await lessonService.delete(lesson.id);
                    loadData();
                  } catch (err) {
                    alert("Error al eliminar la lección.");
                  }
                }
              }}
              canEdit={isTeacher || isAdmin}
              canDelete={isTeacher || isAdmin}
              progress={isStudent ? progressMap[lesson.id] : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
