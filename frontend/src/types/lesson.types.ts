export interface LessonRequestDto {
  title: string;
  description?: string;
  content?: string;
  courseId: string;
}

export interface LessonResponseDto {
  id: string;
  title: string;
  description?: string;
  content?: string;
  courseId: string;
  courseTitle: string;
  examsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressDto {
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string;
}

