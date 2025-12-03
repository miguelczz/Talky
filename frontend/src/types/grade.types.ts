export interface ExamResultDto {
  answers: { [questionId: string]: string }; // questionId es UUID, valor es opción (ej: "a")
}

export interface UserExamResult {
  id: string;
  user?: {
    id: string;
    name: string;
  };
  exam?: {
    id: string;
    title: string;
  };
  examId?: string;
  examTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  courseId?: string;
  courseTitle?: string;
  score: number; // 0.0 - 100.0
  answers?: string | { [key: string]: string }; // JSON string o Map
  reviewed?: boolean;
  submittedAt: string;
}

export interface UserLesson {
  id: string;
  user: {
    id: string;
    name: string;
  };
  lesson: {
    id: string;
    title: string;
  };
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string;
}

