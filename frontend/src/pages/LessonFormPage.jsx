import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { lessonService } from "../services/lesson.service";
import { courseService } from "../services/course.service";
import LessonForm from "../components/lessons/LessonForm";
import "../assets/css/pages/lesson-form.css";

export default function LessonFormPage() {
  const { id } = useParams(); // id de la lección si estamos editando
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isTeacher, isAdmin } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const courseId = searchParams.get("courseId");
  const isEditing = !!id;

  useEffect(() => {
    // Verificar permisos
    if (!isTeacher && !isAdmin) {
      navigate("/courses");
      return;
    }

    loadData();
  }, [id, courseId, isTeacher, isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        // Cargar lección para editar
        const lessonData = await lessonService.getById(id);
        setLesson(lessonData);
        
        // Cargar información del curso
        const courseData = await courseService.getById(lessonData.courseId);
        setCourse(courseData);
      } else if (courseId) {
        // Cargar información del curso para crear nueva lección
        const courseData = await courseService.getById(courseId);
        setCourse(courseData);
      } else {
        setError("Debes especificar un curso para crear la lección");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los datos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      if (isEditing) {
        await lessonService.update(id, formData);
        // Redirigir al detalle de la lección después de actualizar
        navigate(`/lessons/${id}/detail`);
      } else {
        const newLesson = await lessonService.create(formData);
        // Redirigir al detalle del curso después de crear
        navigate(`/courses/${formData.courseId}`);
      }
    } catch (err) {
      console.error("Error saving lesson:", err);
      let errorMessage = "Error al guardar la lección. Por favor, intenta de nuevo.";
      
      if (err.message) {
        const msg = err.message;
        if (msg.includes("400") || msg.toLowerCase().includes("invalid")) {
          errorMessage = "Datos inválidos. Verifica que todos los campos estén correctos.";
        } else if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
          errorMessage = "No tienes permisos para realizar esta acción.";
        } else if (msg.length < 300) {
          errorMessage = msg;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const redirectCourseId = lesson ? lesson.courseId : courseId;
    navigate(`/courses/${redirectCourseId}`);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error && !course && !lesson) {
    return (
      <div className="error-page">
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/courses" className="btn-primary">
          Volver a Cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-form-page">
      <div className="page-header">
        <div>
          <Link 
            to={lesson ? `/courses/${lesson.courseId}` : `/courses/${courseId}`} 
            className="back-link"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          <h1 className="page-title">
            {isEditing ? "Editar Lección" : "Nueva Lección"}
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

      <LessonForm
        lesson={lesson}
        courseId={courseId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </div>
  );
}

