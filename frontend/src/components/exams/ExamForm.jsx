import { useState, useEffect } from "react";
import "../exams/ExamForm.css";

export default function ExamForm({
  exam = null,
  lessonId = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title || "",
        description: exam.description || "",
      });
    }
  }, [exam]);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: formData.title.trim(),
      lessonId: exam ? exam.lessonId : lessonId,
    };

    // Solo incluir description si no está vacía
    const trimmedDescription = formData.description.trim();
    if (trimmedDescription) {
      data.description = trimmedDescription;
    }

    onSubmit(data);
  };

  return (
    <form className="exam-form" onSubmit={handleSubmit}>
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
          placeholder="Ej: Examen de Presente Simple"
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
          placeholder="Describe el contenido del examen..."
          rows={4}
          maxLength={1000}
          disabled={loading}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
        <span className="form-helper">
          {formData.description.length}/1000 caracteres
        </span>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : exam ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

