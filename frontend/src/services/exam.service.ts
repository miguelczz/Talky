import { apiFetch } from "../utils/api";
import type { ExamRequestDto, ExamResponseDto } from "../types/exam.types";
import type { QuestionRequestDto, QuestionResponseDto } from "../types/question.types";
import type { ExamResultDto, UserExamResult } from "../types/grade.types";

export const examService = {
  /**
   * Listar exámenes (filtrado por rol)
   */
  async getAll(): Promise<ExamResponseDto[]> {
    const res = await apiFetch("/api/exams");
    return res.json();
  },

  /**
   * Obtener exámenes de una lección
   */
  async getByLesson(lessonId: string): Promise<ExamResponseDto[]> {
    const res = await apiFetch(`/api/exams/lesson/${lessonId}`);
    return res.json();
  },

  /**
   * Obtener examen por ID
   */
  async getById(id: string): Promise<ExamResponseDto> {
    const res = await apiFetch(`/api/exams/${id}`);
    return res.json();
  },

  /**
   * Crear examen en una lección
   */
  async create(lessonId: string, data: Omit<ExamRequestDto, "lessonId">): Promise<ExamResponseDto> {
    const res = await apiFetch(`/api/exams/lesson/${lessonId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Actualizar examen
   */
  async update(id: string, data: Partial<ExamRequestDto>): Promise<ExamResponseDto> {
    const res = await apiFetch(`/api/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Eliminar examen
   */
  async delete(id: string): Promise<void> {
    await apiFetch(`/api/exams/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Obtener preguntas de un examen
   */
  async getQuestions(examId: string): Promise<QuestionResponseDto[]> {
    const res = await apiFetch(`/api/exams/${examId}/questions`);
    return res.json();
  },

  /**
   * Agregar pregunta a un examen
   */
  async addQuestion(examId: string, data: QuestionRequestDto): Promise<QuestionResponseDto> {
    const res = await apiFetch(`/api/exams/${examId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Actualizar pregunta
   */
  async updateQuestion(questionId: string, data: QuestionRequestDto): Promise<QuestionResponseDto> {
    const res = await apiFetch(`/api/exams/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Eliminar pregunta
   */
  async deleteQuestion(questionId: string): Promise<void> {
    await apiFetch(`/api/exams/questions/${questionId}`, {
      method: "DELETE",
    });
  },

  /**
   * Obtener resultado del estudiante actual en un examen (STUDENT)
   */
  async getMyResult(examId: string): Promise<UserExamResult | null> {
    try {
      const res = await apiFetch(`/api/student/exam-results/${examId}`);
      return res.json();
    } catch (err) {
      // Si no existe resultado, retornar null
      if (err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Presentar examen (STUDENT)
   */
  async submit(examId: string, answers: ExamResultDto): Promise<UserExamResult> {
    const res = await apiFetch(`/api/exams/${examId}/submit`, {
      method: "POST",
      body: JSON.stringify(answers),
    });
    return res.json();
  },

  /**
   * Obtener resultados de un examen (TEACHER, ADMIN)
   */
  async getResults(examId: string): Promise<UserExamResult[]> {
    const res = await apiFetch(`/api/exams/${examId}/results`);
    return res.json();
  },

  /**
   * Obtener resultado de un estudiante en un examen (TEACHER, ADMIN)
   */
  async getStudentResult(examId: string, userId: string): Promise<UserExamResult> {
    const res = await apiFetch(`/api/exams/${examId}/results/${userId}`);
    return res.json();
  },
};

