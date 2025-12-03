import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { courseService } from "../services/course.service";
import CourseCard from "../components/courses/CourseCard";
import CourseForm from "../components/courses/CourseForm";
import "../assets/css/pages/courses.css";

export default function CoursesPage() {
  const { user, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    loadCourses();
    if (isAdmin) {
      loadTeachers();
    }
  }, [isAdmin]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Error al cargar los cursos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const { apiFetch } = await import("../utils/api");
      const res = await apiFetch("/api/admin/users/by-role?role=TEACHER");
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error("Error loading teachers:", err);
      // Si no es admin o no tiene permisos, simplemente no cargar profesores
      // No es crítico para la funcionalidad
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      if (editingCourse) {
        await courseService.update(editingCourse.id, formData);
      } else {
        await courseService.create(formData);
      }
      setShowForm(false);
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      let errorMessage = "Error al guardar el curso. Por favor, intenta de nuevo.";
      
      // Intentar extraer el mensaje de error del backend
      if (err.message) {
        // El mensaje ya viene parseado desde apiFetch
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
      
      // Si hay un status code, agregarlo al mensaje
      if (err.status) {
        console.error(`HTTP ${err.status}: ${errorMessage}`);
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await courseService.delete(id);
      loadCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      const errorMsg = err.message || "Error al eliminar el curso";
      if (errorMsg.includes("estudiantes")) {
        alert("No se puede eliminar un curso que tiene estudiantes asignados.");
      } else {
        alert("Error al eliminar el curso. Por favor, intenta de nuevo.");
      }
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAdmin ? "Todos los Cursos" : isTeacher ? "Mis Cursos" : "Mi Curso"}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Gestiona todos los cursos del sistema"
              : isTeacher
              ? "Crea y gestiona tus cursos"
              : "Visualiza tu curso asignado"}
          </p>
        </div>
        {(isTeacher || isAdmin) && !showForm && (
          <button className="btn-primary" onClick={handleCreate}>
            <i className="fa-solid fa-plus"></i>
            Nuevo Curso
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {showForm ? (
        <div className="form-container">
          <CourseForm
            course={editingCourse}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCourse(null);
            }}
            teachers={teachers}
            isAdmin={isAdmin}
            loading={submitting}
          />
        </div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-book-open"></i>
              <h3>No hay cursos disponibles</h3>
              <p>
                {isTeacher || isAdmin
                  ? "Crea tu primer curso para comenzar"
                  : "Aún no tienes un curso asignado"}
              </p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDelete={handleDelete}
                  canEdit={isTeacher || isAdmin}
                  canDelete={isTeacher || isAdmin}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

