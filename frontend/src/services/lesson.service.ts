import { apiFetch } from "../utils/api";
import type {
  LessonRequestDto,
  LessonResponseDto,
  LessonProgressDto,
} from "../types/lesson.types";

export const lessonService = {
  /**
   * Listar todas las lecciones (filtrado por rol)
   */
  async getAll(): Promise<LessonResponseDto[]> {
    const res = await apiFetch("/api/lessons");
    return res.json();
  },

  /**
   * Obtener lecciones de un curso
   */
  async getByCourse(courseId: string): Promise<LessonResponseDto[]> {
    const res = await apiFetch(`/api/lessons/course/${courseId}`);
    return res.json();
  },

  /**
   * Obtener lección por ID
   */
  async getById(id: string): Promise<LessonResponseDto> {
    const res = await apiFetch(`/api/lessons/${id}`);
    return res.json();
  },

  /**
   * Crear nueva lección
   */
  async create(data: LessonRequestDto): Promise<LessonResponseDto> {
    const res = await apiFetch("/api/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    // Verificar que la respuesta sea JSON válido
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Respuesta no es JSON: ${text.substring(0, 200)}`);
    }
    
    return res.json();
  },

  /**
   * Actualizar lección
   */
  async update(id: string, data: Partial<LessonRequestDto>): Promise<LessonResponseDto> {
    const res = await apiFetch(`/api/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    
    // Verificar que la respuesta sea JSON válido
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Respuesta no es JSON: ${text.substring(0, 200)}`);
    }
    
    return res.json();
  },

  /**
   * Eliminar lección
   */
  async delete(id: string): Promise<void> {
    await apiFetch(`/api/lessons/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Actualizar progreso de lección (STUDENT)
   */
  async updateProgress(lessonId: string, progress: number): Promise<LessonProgressDto> {
    const res = await apiFetch(`/api/lessons/${lessonId}/progress?progress=${progress}`, {
      method: "POST",
    });
    return res.json();
  },

  /**
   * Obtener progreso de lección (STUDENT)
   */
  async getProgress(lessonId: string): Promise<LessonProgressDto> {
    const res = await apiFetch(`/api/lessons/${lessonId}/progress`);
    return res.json();
  },
};

