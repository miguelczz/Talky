export interface QuestionRequestDto {
  text: string;
  options: { [key: string]: string }; // Ej: { "a": "Opción 1", "b": "Opción 2" }
  correctAnswer: string;
}

export interface QuestionResponseDto {
  id: string;
  text: string;
  options: { [key: string]: string };
  correctAnswer?: string; // Oculto para estudiantes
  examId: string;
  examTitle: string;
}

