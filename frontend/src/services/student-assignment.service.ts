import { apiFetch } from "../utils/api";
import { courseService } from "./course.service";

export interface CourseUser {
  id: string;
  title: string;
  description?: string;
  teacherName?: string;
  studentsCount?: number;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  courseTitle?: string;
  courseId?: string;
}

export const studentAssignmentService = {
  async getCourses(): Promise<CourseUser[]> {
    const courses = await courseService.getAll();
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      teacherName: course.teacherName,
      studentsCount: course.studentsCount || 0,
    }));
  },

  async getStudents(): Promise<StudentUser[]> {
    const res = await apiFetch("/api/admin/users/by-role?role=STUDENT");
    return res.json();
  },

  async getAssignedStudents(courseId: string): Promise<StudentUser[]> {
    if (!courseId) return [];
    const res = await apiFetch(`/api/admin/courses/${courseId}/students`);
    return res.json();
  },

  async assignStudent(courseId: string, studentId: string): Promise<void> {
    await apiFetch(`/api/admin/courses/${courseId}/students/${studentId}`, {
      method: "POST",
    });
  },

  async removeStudent(courseId: string, studentId: string): Promise<void> {
    await apiFetch(`/api/admin/courses/${courseId}/students/${studentId}`, {
      method: "DELETE",
    });
  },
};


