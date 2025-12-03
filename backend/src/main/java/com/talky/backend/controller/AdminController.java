package com.talky.backend.controller;

import com.talky.backend.dto.UpdateProfileRequest;
import com.talky.backend.dto.UpdateRoleRequest;
import com.talky.backend.dto.UserResponseDto;
import com.talky.backend.dto.course.CourseResponseDto;
import com.talky.backend.model.Course;
import com.talky.backend.model.User;
import com.talky.backend.service.CourseService;
import com.talky.backend.service.UserService;
import com.talky.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador específico para administradores.
 * Todos los endpoints requieren rol ADMIN.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final SecurityUtils securityUtils;
    private final UserService userService;
    private final CourseService courseService;

    public AdminController(
            SecurityUtils securityUtils,
            UserService userService,
            CourseService courseService
    ) {
        this.securityUtils = securityUtils;
        this.userService = userService;
        this.courseService = courseService;
    }

    /**
     * Obtiene el perfil del administrador autenticado.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getProfile() {
        User admin = securityUtils.getCurrentUserOrThrow();
        return ResponseEntity.ok(UserResponseDto.fromUser(admin));
    }

    /**
     * Actualiza el perfil del administrador autenticado.
     * Solo puede actualizar su propio perfil.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserResponseDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = securityUtils.getCurrentUserOrThrow();
        User updatedUser = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(UserResponseDto.fromUser(updatedUser));
    }

    /**
     * Obtiene todos los usuarios del sistema.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponseDto> userDtos = users.stream()
                .map(UserResponseDto::fromUser)
                .toList();
        return ResponseEntity.ok(userDtos);
    }

    /**
     * Obtiene usuarios por rol.
     * Ejemplo: /api/admin/users/by-role?role=STUDENT
     */
    @GetMapping("/users/by-role")
    public ResponseEntity<List<UserResponseDto>> getUsersByRole(@RequestParam User.Role role) {
        List<User> users = userService.getUsersByRole(role);
        List<UserResponseDto> userDtos = users.stream()
                .map(UserResponseDto::fromUser)
                .toList();
        return ResponseEntity.ok(userDtos);
    }

    /**
     * Obtiene estudiantes sin curso asignado.
     */
    @GetMapping("/users/students-without-course")
    public ResponseEntity<List<UserResponseDto>> getStudentsWithoutCourse() {
        List<User> students = userService.getStudentsWithoutCourse();
        List<UserResponseDto> userDtos = students.stream()
                .map(UserResponseDto::fromUser)
                .toList();
        return ResponseEntity.ok(userDtos);
    }

    /**
     * Obtiene un usuario por ID.
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserResponseDto.fromUser(user));
    }

    /**
     * Actualiza el perfil de cualquier usuario del sistema.
     * Permite a los administradores gestionar los datos de todos los usuarios.
     * No permite modificar email ni role desde este endpoint.
     */
    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<UserResponseDto> updateUserProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        User updatedUser = userService.updateProfile(userId, request);
        return ResponseEntity.ok(UserResponseDto.fromUser(updatedUser));
    }

    /**
     * Actualiza el rol de un usuario.
     * Usa un DTO para mejor validación.
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponseDto> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        User updatedUser = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(UserResponseDto.fromUser(updatedUser));
    }

    /**
     * Actualiza el rol de un usuario (versión alternativa con query param para compatibilidad).
     */
    @PutMapping("/users/{id}/role-simple")
    public ResponseEntity<UserResponseDto> updateUserRoleSimple(
            @PathVariable UUID id,
            @RequestParam String role
    ) {
        try {
            User.Role newRole = User.Role.valueOf(role.toUpperCase());
            User updatedUser = userService.updateUserRole(id, newRole);
            return ResponseEntity.ok(UserResponseDto.fromUser(updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Elimina un usuario.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtiene todos los cursos del sistema.
     */
    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponseDto>> getAllCourses() {
        List<Course> courses = courseService.findAll();
        List<CourseResponseDto> dtos = courses.stream()
                .map(CourseResponseDto::fromCourse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Asigna un curso a un estudiante.
     */
    @PutMapping("/users/{userId}/assign-course/{courseId}")
    public ResponseEntity<UserResponseDto> assignCourseToStudent(
            @PathVariable UUID userId,
            @PathVariable UUID courseId
    ) {
        User user = userService.assignCourseToStudent(userId, courseId);
        return ResponseEntity.ok(UserResponseDto.fromUser(user));
    }

    /**
     * Quita el curso de un estudiante.
     */
    @PutMapping("/users/{userId}/remove-course")
    public ResponseEntity<UserResponseDto> removeCourseFromStudent(@PathVariable UUID userId) {
        User user = userService.removeCourseFromStudent(userId);
        return ResponseEntity.ok(UserResponseDto.fromUser(user));
    }

    // --- Gestión de mentores y estudiantes ---

    /**
     * Obtiene los estudiantes asignados a un mentor (profesor o administrador).
     * Los estudiantes están asignados a través de los cursos del mentor.
     */
    @GetMapping("/mentors/{mentorId}/students")
    public ResponseEntity<List<UserResponseDto>> getMentorStudents(@PathVariable UUID mentorId) {
        User mentor = userService.getUserById(mentorId);
        
        // Verificar que sea un mentor (TEACHER o ADMIN)
        if (mentor.getRole() != User.Role.TEACHER && mentor.getRole() != User.Role.ADMIN) {
            return ResponseEntity.badRequest().build();
        }

        // Obtener todos los cursos del mentor
        List<Course> mentorCourses = courseService.findAll().stream()
                .filter(course -> course.getTeacher() != null && 
                        course.getTeacher().getId().equals(mentorId))
                .toList();

        // Obtener todos los estudiantes que están en esos cursos
        List<User> students = userService.getAllUsers().stream()
                .filter(user -> user.getRole() == User.Role.STUDENT &&
                        user.getCourseAsStudent() != null &&
                        mentorCourses.stream()
                                .anyMatch(course -> course.getId().equals(user.getCourseAsStudent().getId())))
                .toList();

        List<UserResponseDto> studentDtos = students.stream()
                .map(UserResponseDto::fromUser)
                .toList();

        return ResponseEntity.ok(studentDtos);
    }

    /**
     * Asigna un estudiante a un mentor.
     * Si el mentor no tiene cursos, se crea uno automáticamente.
     * Si tiene varios cursos, se asigna al primero disponible.
     */
    @PostMapping("/mentors/{mentorId}/students/{studentId}")
    public ResponseEntity<UserResponseDto> assignStudentToMentor(
            @PathVariable UUID mentorId,
            @PathVariable UUID studentId) {
        try {
            User mentor = userService.getUserById(mentorId);
        
        // Verificar que sea un mentor (TEACHER o ADMIN)
        if (mentor.getRole() != User.Role.TEACHER && mentor.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("El usuario especificado no es un mentor (TEACHER o ADMIN)");
        }

        User student = userService.getUserById(studentId);
        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("El usuario especificado no es un estudiante");
        }

        // Buscar un curso del mentor
        List<Course> mentorCourses = courseService.findAll().stream()
                .filter(course -> course.getTeacher() != null && 
                        course.getTeacher().getId().equals(mentorId))
                .toList();

        Course targetCourse;
        if (mentorCourses.isEmpty()) {
            // Si no tiene cursos, crear uno automáticamente
            String courseTitle = mentor.getRole() == User.Role.ADMIN 
                    ? "Curso de " + mentor.getName()
                    : "Curso de " + mentor.getName();
            
            Course newCourse = Course.builder()
                    .title(courseTitle)
                    .description("Curso asignado automáticamente")
                    .teacher(mentor)
                    .build();
            targetCourse = courseService.save(newCourse);
        } else {
            // Usar el primer curso disponible
            targetCourse = mentorCourses.get(0);
        }

            // Asignar el estudiante al curso
            student.setCourseAsStudent(targetCourse);
            User updatedStudent = userService.save(student);

            return ResponseEntity.ok(UserResponseDto.fromUser(updatedStudent));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("ID inválido: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error al asignar estudiante: " + e.getMessage(), e);
        }
    }

    /**
     * Remueve un estudiante de un mentor (quita el curso asignado).
     */
    @DeleteMapping("/mentors/{mentorId}/students/{studentId}")
    public ResponseEntity<UserResponseDto> removeStudentFromMentor(
            @PathVariable UUID mentorId,
            @PathVariable UUID studentId) {
        User mentor = userService.getUserById(mentorId);
        
        // Verificar que sea un mentor
        if (mentor.getRole() != User.Role.TEACHER && mentor.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("El usuario especificado no es un mentor");
        }

        User student = userService.getUserById(studentId);
        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("El usuario especificado no es un estudiante");
        }

        // Verificar que el estudiante esté en un curso del mentor
        if (student.getCourseAsStudent() != null) {
            Course studentCourse = student.getCourseAsStudent();
            if (studentCourse.getTeacher() != null && 
                    studentCourse.getTeacher().getId().equals(mentorId)) {
                // Quitar el curso del estudiante
                student.setCourseAsStudent(null);
                User updatedStudent = userService.save(student);
                return ResponseEntity.ok(UserResponseDto.fromUser(updatedStudent));
            } else {
                throw new RuntimeException("El estudiante no está asignado a este mentor");
            }
        } else {
            throw new RuntimeException("El estudiante no tiene un curso asignado");
        }
    }

    /**
     * Obtiene los estudiantes asignados a un curso.
     */
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<UserResponseDto>> getCourseStudents(@PathVariable UUID courseId) {
        // Verificar que el curso existe
        courseService.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Obtener todos los estudiantes que están en este curso
        List<User> students = userService.getAllUsers().stream()
                .filter(user -> user.getRole() == User.Role.STUDENT &&
                        user.getCourseAsStudent() != null &&
                        user.getCourseAsStudent().getId().equals(courseId))
                .toList();

        List<UserResponseDto> studentDtos = students.stream()
                .map(UserResponseDto::fromUser)
                .toList();

        return ResponseEntity.ok(studentDtos);
    }

    /**
     * Asigna un estudiante directamente a un curso.
     */
    @PostMapping("/courses/{courseId}/students/{studentId}")
    public ResponseEntity<UserResponseDto> assignStudentToCourse(
            @PathVariable UUID courseId,
            @PathVariable UUID studentId) {
        try {
            User student = userService.getUserById(studentId);
            if (student.getRole() != User.Role.STUDENT) {
                throw new RuntimeException("El usuario especificado no es un estudiante");
            }

            // Asignar el estudiante al curso usando el servicio
            User updatedStudent = userService.assignCourseToStudent(studentId, courseId);
            return ResponseEntity.ok(UserResponseDto.fromUser(updatedStudent));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("ID inválido: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error al asignar estudiante al curso: " + e.getMessage(), e);
        }
    }

    /**
     * Remueve un estudiante de un curso.
     */
    @DeleteMapping("/courses/{courseId}/students/{studentId}")
    public ResponseEntity<UserResponseDto> removeStudentFromCourse(
            @PathVariable UUID courseId,
            @PathVariable UUID studentId) {
        User student = userService.getUserById(studentId);
        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("El usuario especificado no es un estudiante");
        }

        // Verificar que el estudiante esté en el curso especificado
        if (student.getCourseAsStudent() != null &&
                student.getCourseAsStudent().getId().equals(courseId)) {
            // Quitar el curso del estudiante
            User updatedStudent = userService.removeCourseFromStudent(studentId);
            return ResponseEntity.ok(UserResponseDto.fromUser(updatedStudent));
        } else {
            throw new RuntimeException("El estudiante no está asignado a este curso");
        }
    }
}

