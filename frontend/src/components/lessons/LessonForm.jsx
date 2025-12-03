import { useState, useEffect } from "react";
import "../lessons/LessonForm.css";

export default function LessonForm({
  lesson = null,
  courseId = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || "",
        description: lesson.description || "",
        content: lesson.content || "",
      });
    }
  }, [lesson]);

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
    if (formData.content && formData.content.length > 10000) {
      newErrors.content = "El contenido no puede exceder 10000 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: formData.title.trim(),
      courseId: lesson ? lesson.courseId : courseId,
    };

    // Solo incluir description si no está vacía
    const trimmedDescription = formData.description.trim();
    if (trimmedDescription) {
      data.description = trimmedDescription;
    }

    // Incluir content si no está vacío
    const trimmedContent = formData.content.trim();
    if (trimmedContent) {
      data.content = trimmedContent;
    }

    onSubmit(data);
  };

  return (
    <form className="lesson-form" onSubmit={handleSubmit}>
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
          placeholder="Ej: Presente Simple"
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
          placeholder="Describe el contenido de la lección..."
          rows={4}
          maxLength={1000}
          disabled={loading}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
        <span className="form-helper">
          {formData.description.length}/1000 caracteres
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="content" className="form-label">
          Contenido de la Lección
        </label>
        <textarea
          id="content"
          className={`form-textarea ${errors.content ? "error" : ""}`}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Escribe el contenido educativo de la lección aquí. Puedes usar texto, listas, y formato básico..."
          rows={12}
          maxLength={10000}
          disabled={loading}
        />
        {errors.content && <span className="form-error">{errors.content}</span>}
        <span className="form-helper">
          {formData.content.length}/10000 caracteres
        </span>
        <p className="form-helper" style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Este contenido será visible para los estudiantes. Puedes incluir explicaciones, ejemplos, y material educativo.
        </p>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : lesson ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

