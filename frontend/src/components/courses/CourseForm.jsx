import { useState, useEffect } from "react";
import "../courses/CourseForm.css";

export default function CourseForm({
  course = null,
  onSubmit,
  onCancel,
  teachers = [],
  isAdmin = false,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teacherId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        teacherId: course.teacherId || "",
      });
    }
  }, [course]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (formData.title.length > 200) {
      newErrors.title = "El título no puede exceder 200 caracteres";
    }
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "La descripción no puede exceder 1000 caracteres";
    }
    if (isAdmin && !formData.teacherId) {
      newErrors.teacherId = "Debes seleccionar un profesor";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: formData.title.trim(),
    };

    // Solo incluir description si no está vacía
    const trimmedDescription = formData.description.trim();
    if (trimmedDescription) {
      data.description = trimmedDescription;
    }

    // Solo incluir teacherId si es admin y está seleccionado
    if (isAdmin && formData.teacherId) {
      data.teacherId = formData.teacherId;
    }

    onSubmit(data);
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Título <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          className={`form-input ${errors.title ? "error" : ""}`}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Inglés Básico"
          maxLength={200}
          disabled={loading}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción
        </label>
        <textarea
          id="description"
          className={`form-textarea ${errors.description ? "error" : ""}`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe el contenido del curso..."
          rows={4}
          maxLength={1000}
          disabled={loading}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
        <span className="form-helper">
          {formData.description.length}/1000 caracteres
        </span>
      </div>

      {isAdmin && teachers.length > 0 && (
        <div className="form-group">
          <label htmlFor="teacherId" className="form-label">
            Profesor <span className="required">*</span>
          </label>
          <select
            id="teacherId"
            className={`form-select ${errors.teacherId ? "error" : ""}`}
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            disabled={loading || !!course}>
            <option value="">Selecciona un profesor</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
          {errors.teacherId && <span className="form-error">{errors.teacherId}</span>}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : course ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

