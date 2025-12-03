import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { examService } from "../services/exam.service";
import { lessonService } from "../services/lesson.service";
import { courseService } from "../services/course.service";
import ExamForm from "../components/exams/ExamForm";
import "../assets/css/pages/exam-form.css";

export default function ExamFormPage() {
  const { id } = useParams(); // id del examen si estamos editando
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isTeacher, isAdmin } = useAuth();
  const [exam, setExam] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const lessonId = searchParams.get("lessonId");
  const isEditing = !!id;

  useEffect(() => {
    // Verificar permisos
    if (!isTeacher && !isAdmin) {
      navigate("/courses");
      return;
    }

    loadData();
  }, [id, lessonId, isTeacher, isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        // Cargar examen para editar
        const examData = await examService.getById(id);
        setExam(examData);
        
        // Cargar información de la lección y curso
        const lessonData = await lessonService.getById(examData.lessonId);
        setLesson(lessonData);
        
        const courseData = await courseService.getById(lessonData.courseId);
        setCourse(courseData);
      } else if (lessonId) {
        // Cargar información de la lección para crear nuevo examen
        const lessonData = await lessonService.getById(lessonId);
        setLesson(lessonData);
        
        const courseData = await courseService.getById(lessonData.courseId);
        setCourse(courseData);
      } else {
        setError("Debes especificar una lección para crear el examen");
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

      let targetExamId = id;
      let targetLessonId = lessonId;

      if (isEditing) {
        const updatedExam = await examService.update(id, formData);
        targetExamId = updatedExam.id;
        targetLessonId = updatedExam.lessonId;
      } else {
        const createdExam = await examService.create(lessonId, formData);
        targetExamId = createdExam.id;
        targetLessonId = createdExam.lessonId;
      }

      const lessonIdForState = targetLessonId || lesson?.id || null;

      navigate(`/exams/${targetExamId}/questions`, {
        state: { fromLessonId: lessonIdForState },
      });
    } catch (err) {
      console.error("Error saving exam:", err);
      let errorMessage = "Error al guardar el examen. Por favor, intenta de nuevo.";
      
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
    const redirectLessonId = exam?.lessonId || lessonId || lesson?.id;
    if (redirectLessonId) {
      navigate(`/lessons/${redirectLessonId}/detail`);
    } else {
      navigate("/courses");
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error && !lesson && !exam) {
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
    <div className="exam-form-page">
      <div className="page-header">
        <div>
          <Link 
            to={
              lesson?.id
                ? `/lessons/${lesson.id}/detail`
                : course?.id
                ? `/courses/${course.id}`
                : "/courses"
            } 
            className="back-link"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          <h1 className="page-title">
            {isEditing ? "Editar Examen" : "Nuevo Examen"}
          </h1>
          {lesson && (
            <p className="page-subtitle">Lección: {lesson.title}</p>
          )}
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

      <ExamForm
        exam={exam}
        lessonId={lessonId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </div>
  );
}

