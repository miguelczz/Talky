import { useEffect, useMemo, useState } from "react";
import { studentAssignmentService } from "../../services/student-assignment.service";
import { useAuth } from "../../components/Access/AuthContext";
import "../../assets/css/pages/admin-assignments.css";

export default function AdminStudentAssignments() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (selectedCourseId) {
      loadAssignments(selectedCourseId);
    } else if (courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesList, studentsList] = await Promise.all([
        studentAssignmentService.getCourses(),
        studentAssignmentService.getStudents(),
      ]);
      setCourses(coursesList);
      setStudents(studentsList);
      setSelectedCourseId((prev) => prev || coursesList[0]?.id || null);
    } catch (err) {
      console.error("Error loading assignment data:", err);
      setError(
        err?.message || "No fue posible cargar los datos, intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (courseId) => {
    if (!courseId) return;
    try {
      setAssignmentsLoading(true);
      setError(null);
      const data = await studentAssignmentService.getAssignedStudents(courseId);
      setAssignedStudents(data);
    } catch (err) {
      console.error("Error loading course assignments:", err);
      setError(
        err?.message ||
          "No se pudieron cargar los estudiantes asignados al curso seleccionado."
      );
      setAssignedStudents([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const coursesFiltered = useMemo(() => {
    if (!courseSearch.trim()) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(courseSearch.toLowerCase())) ||
        (course.teacherName && course.teacherName.toLowerCase().includes(courseSearch.toLowerCase()))
    );
  }, [courseSearch, courses]);

  const availableStudents = useMemo(() => {
    const assignedIds = new Set(assignedStudents.map((s) => s.id));
    const filtered = students.filter((student) => !assignedIds.has(student.id));
    if (!studentSearch.trim()) return filtered;
    return filtered.filter(
      (student) =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, assignedStudents, studentSearch]);

  const handleSelectCourse = (courseId) => {
    if (courseId === selectedCourseId) return;
    setSelectedCourseId(courseId);
  };

  const handleAssignStudent = async (studentId) => {
    if (!selectedCourseId) return;
    try {
      setAssigningId(studentId);
      await studentAssignmentService.assignStudent(selectedCourseId, studentId);
      await loadAssignments(selectedCourseId);
    } catch (err) {
      console.error("Error assigning student:", err);
      alert(err?.message || "No se pudo asignar el estudiante.");
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedCourseId) return;
    if (!confirm("¿Deseas quitar este estudiante del curso seleccionado?"))
      return;
    try {
      setRemovingId(studentId);
      await studentAssignmentService.removeStudent(selectedCourseId, studentId);
      setAssignedStudents((prev) =>
        prev.filter((student) => student.id !== studentId)
      );
    } catch (err) {
      console.error("Error removing student:", err);
      alert(err?.message || "No se pudo quitar el estudiante.");
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-assignments-page">
        <div className="empty-state">
          <h2>Sin permisos</h2>
          <p>Debes iniciar sesión como administrador para gestionar asignaciones.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Cargando asignaciones...</p>
      </div>
    );
  }

  return (
    <div className="admin-assignments-page">
      <header className="assignments-header">
        <div>
          <h1>Asignar estudiantes a cursos</h1>
          <p>
            Controla qué estudiantes están asignados a cada curso. Los datos se
            cargan directamente desde la base de usuarios.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadData}>
          <i className="fa-solid fa-rotate" />
          Actualizar
        </button>
      </header>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}

      <div className="assignments-layout">
        <section className="mentors-panel">
          <div className="panel-header">
            <h2>Cursos disponibles</h2>
            <span>{courses.length} cursos</span>
          </div>
          <input
            className="form-input"
            placeholder="Buscar por título, descripción o profesor..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
          />
          <div className="mentor-list">
            {coursesFiltered.length === 0 && (
              <div className="empty-state small">
                <p>No se encontraron cursos con ese criterio.</p>
              </div>
            )}
            {coursesFiltered.map((course) => (
              <button
                key={course.id}
                className={`mentor-card ${
                  course.id === selectedCourseId ? "active" : ""
                }`}
                onClick={() => handleSelectCourse(course.id)}
              >
                <div>
                  <h3>{course.title}</h3>
                  {course.description && <p>{course.description}</p>}
                  {course.teacherName && (
                    <small>Profesor: {course.teacherName}</small>
                  )}
                </div>
                <span className="mentor-role">
                  {course.studentsCount || 0} estudiantes
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="students-panel">
          <div className="students-panel-header">
            <div>
              <h2>Estudiantes asignados</h2>
              <p>
                {assignmentsLoading
                  ? "Cargando..."
                  : `${assignedStudents.length} estudiante(s)`}
              </p>
            </div>
            <input
              className="form-input"
              placeholder="Buscar estudiante disponible..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          <div className="students-columns">
            <div className="students-column">
              <h3>Asignados</h3>
              {assignedStudents.length === 0 ? (
                <div className="empty-state small">
                  <p>No hay estudiantes asignados al curso seleccionado.</p>
                </div>
              ) : (
                <ul className="student-list">
                  {assignedStudents.map((student) => (
                    <li key={student.id} className="student-card">
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.email}</span>
                        {student.courseTitle && (
                          <small>Curso: {student.courseTitle}</small>
                        )}
                      </div>
                      <button
                        className="icon-button danger"
                        onClick={() => handleRemoveStudent(student.id)}
                        disabled={removingId === student.id}
                        title="Quitar del curso"
                      >
                        <i className="fa-solid fa-user-minus" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="students-column">
              <h3>Disponibles</h3>
              {availableStudents.length === 0 ? (
                <div className="empty-state small">
                  <p>No hay estudiantes disponibles con ese filtro.</p>
                </div>
              ) : (
                <ul className="student-list available">
                  {availableStudents.map((student) => (
                    <li key={student.id} className="student-card">
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.email}</span>
                        {student.courseTitle && (
                          <small>Curso actual: {student.courseTitle}</small>
                        )}
                      </div>
                      <button
                        className="icon-button success"
                        onClick={() => handleAssignStudent(student.id)}
                        disabled={assigningId === student.id}
                        title="Asignar a este curso"
                      >
                        <i className="fa-solid fa-user-plus" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


