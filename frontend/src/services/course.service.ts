import { apiFetch } from "../utils/api";
import type { CourseRequestDto, CourseResponseDto } from "../types/course.types";

export const courseService = {
  /**
   * Listar cursos (filtrado automáticamente por rol)
   */
  async getAll(): Promise<CourseResponseDto[]> {
    const res = await apiFetch("/api/courses");
    return res.json();
  },

  /**
   * Obtener curso por ID
   */
  async getById(id: string): Promise<CourseResponseDto> {
    const res = await apiFetch(`/api/courses/${id}`);
    return res.json();
  },

  /**
   * Crear nuevo curso
   */
  async create(data: CourseRequestDto): Promise<CourseResponseDto> {
    const res = await apiFetch("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Actualizar curso
   */
  async update(id: string, data: Partial<CourseRequestDto>): Promise<CourseResponseDto> {
    const res = await apiFetch(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Eliminar curso
   */
  async delete(id: string): Promise<void> {
    await apiFetch(`/api/courses/${id}`, {
      method: "DELETE",
    });
  },
};

