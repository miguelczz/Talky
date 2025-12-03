export interface ExamRequestDto {
  title: string;
  description?: string;
  lessonId: string;
}

export interface ExamResponseDto {
  id: string;
  title: string;
  description?: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  questionsCount: number;
  averageScore?: number;
  createdAt: string;
  updatedAt: string;
}

