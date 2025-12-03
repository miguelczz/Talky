package com.talky.backend.controller;

import com.talky.backend.dto.UpdateProfileRequest;
import com.talky.backend.dto.UserResponseDto;
import com.talky.backend.model.User;
import com.talky.backend.model.exam.Exam;
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
 * Controlador específico para estudiantes.
 * Todos los endpoints requieren rol STUDENT.
 */
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final SecurityUtils securityUtils;
    private final UserService userService;
    private final ExamService examService;
    private final UserExamResultService userExamResultService;

    public StudentController(
            SecurityUtils securityUtils,
            UserService userService,
            ExamService examService,
            UserExamResultService userExamResultService
    ) {
        this.securityUtils = securityUtils;
        this.userService = userService;
        this.examService = examService;
        this.userExamResultService = userExamResultService;
    }

    /**
     * Obtiene el perfil del estudiante autenticado.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getProfile() {
        User student = securityUtils.getCurrentUserOrThrow();
        return ResponseEntity.ok(UserResponseDto.fromUser(student));
    }

    /**
     * Actualiza el perfil del estudiante autenticado.
     * Solo puede actualizar su propio perfil.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserResponseDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = securityUtils.getCurrentUserOrThrow();
        User updatedUser = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(UserResponseDto.fromUser(updatedUser));
    }

    /**
     * Obtiene el curso asignado al estudiante.
     */
    @GetMapping("/course")
    public ResponseEntity<com.talky.backend.dto.course.CourseResponseDto> getMyCourse() {
        User student = securityUtils.getCurrentUserOrThrow();
        if (student.getCourseAsStudent() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(com.talky.backend.dto.course.CourseResponseDto.fromCourse(student.getCourseAsStudent()));
    }

    /**
     * Obtiene todos los exámenes del curso del estudiante.
     */
    @GetMapping("/exams")
    public ResponseEntity<List<Exam>> getMyExams() {
        User student = securityUtils.getCurrentUserOrThrow();
        if (student.getCourseAsStudent() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Exam> exams = examService.findAll().stream()
                .filter(exam -> exam.getLesson() != null &&
                        exam.getLesson().getCourse() != null &&
                        exam.getLesson().getCourse().getId().equals(student.getCourseAsStudent().getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(exams);
    }

    /**
     * Obtiene los resultados de exámenes del estudiante.
     * Los estudiantes solo ven las respuestas correctas si el examen ha sido revisado.
     */
    @GetMapping("/exam-results")
    public ResponseEntity<List<com.talky.backend.dto.grade.GradeResponseDto>> getMyExamResults() {
        User student = securityUtils.getCurrentUserOrThrow();
        List<com.talky.backend.model.exam.UserExamResult> results = userExamResultService.findByUserId(student.getId());
        List<com.talky.backend.dto.grade.GradeResponseDto> dtos = results.stream()
                .map(com.talky.backend.dto.grade.GradeResponseDto::fromUserExamResultForStudent)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Obtiene el resultado de un examen específico del estudiante.
     * Los estudiantes solo ven las respuestas correctas si el examen ha sido revisado.
     */
    @GetMapping("/exam-results/{examId}")
    public ResponseEntity<com.talky.backend.dto.grade.GradeResponseDto> getMyExamResult(@PathVariable UUID examId) {
        User student = securityUtils.getCurrentUserOrThrow();
        return userExamResultService.findByUserAndExam(student.getId(), examId)
                .map(com.talky.backend.dto.grade.GradeResponseDto::fromUserExamResultForStudent)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

