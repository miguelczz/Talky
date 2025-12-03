import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Lessons from "../pages/Lessons";
import Chat from "../pages/Chat";
import Verbs from "../pages/Verbs";
import Glossary from "../pages/Glossary";
import Description from "../pages/Description";
import SignUp from "../components/Access/SignUp";
import SignIn from "../components/Access/SignIn";
import ConfirmAccount from "../components/Access/ConfirmAccount";
import ForgotPassword from "../components/Access/ForgotPassword";
import ResetPassword from "../components/Access/ResetPassword";

import RequireAuth from "../components/Access/RequireAuth";
import ProtectedRoute from "../components/Access/ProtectedRoute";

// Página de perfil
import Profile from "../pages/Profile";

// Páginas de cursos, lecciones y exámenes
import CoursesPage from "../pages/CoursesPage";
import CourseDetailPage from "../pages/CourseDetailPage";
import LessonFormPage from "../pages/LessonFormPage";
import LessonDetailPage from "../pages/LessonDetailPage";
import ExamFormPage from "../pages/ExamFormPage";
import TakeExamPage from "../pages/TakeExamPage";
import ExamQuestionsPage from "../pages/ExamQuestionsPage";

// Páginas de estudiantes
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentCourse from "../pages/student/StudentCourse";
import StudentExams from "../pages/student/StudentExams";
import StudentResults from "../pages/student/StudentResults";
import StudentExamResultDetail from "../pages/student/StudentExamResultDetail";

// Páginas de profesores
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherCourses from "../pages/teacher/TeacherCourses";
import TeacherExams from "../pages/teacher/TeacherExams";
import TeacherStudents from "../pages/teacher/TeacherStudents";
import TeacherExamResults from "../pages/teacher/TeacherExamResults";
import TeacherGrades from "../pages/teacher/TeacherGrades";

// Páginas de administradores
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminStats from "../pages/admin/AdminStats";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserDetails from "../pages/admin/AdminUserDetails";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminRoleManagement from "../pages/admin/AdminRoleManagement";
import AdminStudentAssignments from "../pages/admin/AdminStudentAssignments";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/confirm" element={<ConfirmAccount />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/about" element={<Description />} />

            {/* Rutas privadas protegidas (cualquier rol autenticado) */}
            <Route
                path="/profile"
                element={
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                }
            />
            <Route
                path="/chat"
                element={
                    <RequireAuth>
                        <Chat />
                    </RequireAuth>
                }
            />
            <Route
                path="/lessons"
                element={
                    <RequireAuth>
                        <Lessons />
                    </RequireAuth>
                }
            />
            <Route
                path="/courses"
                element={
                    <RequireAuth>
                        <CoursesPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/courses/:id"
                element={
                    <RequireAuth>
                        <CourseDetailPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/lessons/new"
                element={
                    <RequireAuth>
                        <LessonFormPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/lessons/:id/edit"
                element={
                    <RequireAuth>
                        <LessonFormPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/lessons/:id/detail"
                element={
                    <RequireAuth>
                        <LessonDetailPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/lessons/:id"
                element={
                    <RequireAuth>
                        <LessonDetailPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/exams/new"
                element={
                    <RequireAuth>
                        <ExamFormPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/exams/:id/edit"
                element={
                    <RequireAuth>
                        <ExamFormPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/exams/:id/questions"
                element={
                    <RequireAuth>
                        <ExamQuestionsPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/exams/:id/take"
                element={
                    <RequireAuth>
                        <TakeExamPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/verbs"
                element={
                    <RequireAuth>
                        <Verbs />
                    </RequireAuth>
                }
            />
            <Route
                path="/glossary"
                element={
                    <RequireAuth>
                        <Glossary initialWords={[]} />
                    </RequireAuth>
                }
            />

            {/* Rutas específicas para estudiantes */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/course"
                element={
                    <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <StudentCourse />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/exams"
                element={
                    <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <StudentExams />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/results"
                element={
                    <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <StudentResults />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/exams/:examId/result"
                element={
                    <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <StudentExamResultDetail />
                    </ProtectedRoute>
                }
            />

            {/* Rutas específicas para profesores */}
            <Route
                path="/teacher"
                element={
                    <ProtectedRoute allowedRoles={["TEACHER"]}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/courses"
                element={
                    <ProtectedRoute allowedRoles={["TEACHER"]}>
                        <TeacherCourses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/exams"
                element={
                    <ProtectedRoute allowedRoles={["TEACHER"]}>
                        <TeacherExams />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/students"
                element={
                    <ProtectedRoute allowedRoles={["TEACHER"]}>
                        <TeacherStudents />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/exams/:examId/results"
                element={
                    <ProtectedRoute allowedRoles={["TEACHER"]}>
                        <TeacherExamResults />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/grades"
                element={
                    <ProtectedRoute allowedRoles={["TEACHER"]}>
                        <TeacherGrades />
                    </ProtectedRoute>
                }
            />

            {/* Rutas específicas para administradores */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/stats"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminStats />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminUsers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users/:id"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminUserDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/courses"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminCourses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/assignments"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminStudentAssignments />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/roles"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminRoleManagement />
                    </ProtectedRoute>
                }
            />

            {/* Ruta desconocida */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
