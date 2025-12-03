export interface CourseRequestDto {
  title: string;
  description?: string;
  teacherId?: string; // Solo para ADMIN
}

export interface CourseResponseDto {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  studentsCount: number;
  lessonsCount: number;
  createdAt: string;
  updatedAt: string;
}

