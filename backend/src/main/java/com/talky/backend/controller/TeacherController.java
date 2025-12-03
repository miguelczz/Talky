package com.talky.backend.controller;

import com.talky.backend.dto.UpdateProfileRequest;
import com.talky.backend.dto.UserResponseDto;
import com.talky.backend.dto.exam.ExamResponseDto;
import com.talky.backend.model.Course;
import com.talky.backend.model.User;
import com.talky.backend.model.exam.Exam;
import com.talky.backend.model.exam.UserExamResult;
import com.talky.backend.model.lesson.Lesson;
import com.talky.backend.service.CourseService;
import com.talky.backend.service.UserService;
import com.talky.backend.service.exam.ExamService;
import com.talky.backend.service.exam.UserExamResultService;
import com.talky.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador específico para profesores.
 * Todos los endpoints requieren rol TEACHER.
 */
@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final SecurityUtils securityUtils;
    private final UserService userService;
    private final CourseService courseService;
    private final ExamService examService;
    private final UserExamResultService userExamResultService;

    public TeacherController(
            SecurityUtils securityUtils,
            UserService userService,
            CourseService courseService,
            ExamService examService,
            UserExamResultService userExamResultService
    ) {
        this.securityUtils = securityUtils;
        this.userService = userService;
        this.courseService = courseService;
        this.examService = examService;
        this.userExamResultService = userExamResultService;
    }

    /**
     * Obtiene el perfil del profesor autenticado.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getProfile() {
        User teacher = securityUtils.getCurrentUserOrThrow();
        return ResponseEntity.ok(UserResponseDto.fromUser(teacher));
    }

    /**
     * Actualiza el perfil del profesor autenticado.
     * Solo puede actualizar su propio perfil.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserResponseDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = securityUtils.getCurrentUserOrThrow();
        User updatedUser = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(UserResponseDto.fromUser(updatedUser));
    }

    /**
     * Obtiene todos los cursos que dicta el profesor.
     */
    @GetMapping("/courses")
    public ResponseEntity<List<com.talky.backend.dto.course.CourseResponseDto>> getMyCourses() {
        User teacher = securityUtils.getCurrentUserOrThrow();
        List<Course> courses = courseService.findAll().stream()
                .filter(course -> course.getTeacher() != null &&
                        course.getTeacher().getId().equals(teacher.getId()))
                .collect(Collectors.toList());
        List<com.talky.backend.dto.course.CourseResponseDto> dtos = courses.stream()
                .map(com.talky.backend.dto.course.CourseResponseDto::fromCourse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Obtiene todos los exámenes de los cursos del profesor.
     */
    @GetMapping("/exams")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<ExamResponseDto>> getMyExams() {
        // Obtener los IDs de los cursos del profesor usando el método que ya maneja DTOs correctamente
        List<com.talky.backend.dto.course.CourseResponseDto> myCoursesDtos = getMyCourses().getBody();
        if (myCoursesDtos == null || myCoursesDtos.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<UUID> myCourseIds = myCoursesDtos.stream()
                .map(com.talky.backend.dto.course.CourseResponseDto::getId)
                .collect(Collectors.toList());
        
        // Filtrar exámenes por courseId sin acceder a relaciones completas
        List<Exam> exams = examService.findAll().stream()
                .filter(exam -> {
                    try {
                        if (exam.getLesson() == null) {
                            return false;
                        }
                        Lesson lesson = exam.getLesson();
                        if (lesson.getCourse() == null) {
                            return false;
                        }
                        // Solo comparar el ID del curso, no acceder a teacher
                        return myCourseIds.contains(lesson.getCourse().getId());
                    } catch (Exception e) {
                        // Si hay un error accediendo a relaciones lazy, filtrar este examen
                        return false;
                    }
                })
                .collect(Collectors.toList());
        
        // Convertir a DTOs
        List<ExamResponseDto> dtos = exams.stream()
                .map(ExamResponseDto::fromExam)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Obtiene todos los resultados de un examen específico.
     * Solo puede ver resultados de exámenes de sus cursos.
     */
    @GetMapping("/exams/{examId}/results")
    public ResponseEntity<List<UserExamResult>> getExamResults(@PathVariable UUID examId) {
        User teacher = securityUtils.getCurrentUserOrThrow();
        Exam exam = examService.findById(examId)
                .orElseThrow(() -> new RuntimeException("Examen no encontrado"));

        // Verificar que el examen pertenece a un curso del profesor
        if (exam.getLesson() == null || exam.getLesson().getCourse() == null ||
                exam.getLesson().getCourse().getTeacher() == null ||
                !exam.getLesson().getCourse().getTeacher().getId().equals(teacher.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<UserExamResult> results = userExamResultService.findByExamId(examId);
        return ResponseEntity.ok(results);
    }

    /**
     * Obtiene todos los estudiantes de los cursos del profesor.
     */
    @GetMapping("/students")
    public ResponseEntity<List<User>> getMyStudents() {
        User teacher = securityUtils.getCurrentUserOrThrow();
        List<Course> myCourses = courseService.findAll().stream()
                .filter(course -> course.getTeacher() != null &&
                        course.getTeacher().getId().equals(teacher.getId()))
                .collect(Collectors.toList());

        List<User> students = myCourses.stream()
                .flatMap(course -> userService.getAllUsers().stream()
                        .filter(user -> user.getRole() == User.Role.STUDENT &&
                                user.getCourseAsStudent() != null &&
                                user.getCourseAsStudent().getId().equals(course.getId())))
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(students);
    }
}

