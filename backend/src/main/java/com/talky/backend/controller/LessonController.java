package com.talky.backend.controller;

import com.talky.backend.dto.lesson.LessonRequestDto;
import com.talky.backend.dto.lesson.LessonResponseDto;
import com.talky.backend.model.Course;
import com.talky.backend.model.lesson.Lesson;
import com.talky.backend.model.User;
import com.talky.backend.model.lesson.UserLesson;
import com.talky.backend.repository.CourseRepository;
import com.talky.backend.service.lesson.LessonService;
import com.talky.backend.service.lesson.UserLessonService;
import com.talky.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;
    private final UserLessonService userLessonService;
    private final UserService userService;
    private final CourseRepository courseRepository;

    public LessonController(LessonService lessonService,
                            UserLessonService userLessonService,
                            UserService userService,
                            CourseRepository courseRepository) {
        this.lessonService = lessonService;
        this.userLessonService = userLessonService;
        this.userService = userService;
        this.courseRepository = courseRepository;
    }

    /**
     * Crea una nueva lección en un curso.
     * Solo profesores o administradores pueden hacerlo.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<LessonResponseDto> createLesson(@Valid @RequestBody LessonRequestDto requestDto) {
        // Buscar el curso por ID
        Course course = courseRepository.findById(requestDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado con ID: " + requestDto.getCourseId()));
        
        // Crear la entidad Lesson desde el DTO
        Lesson lesson = new Lesson();
        lesson.setTitle(requestDto.getTitle());
        lesson.setDescription(requestDto.getDescription());
        lesson.setContent(requestDto.getContent());
        lesson.setCourse(course);
        
        Lesson savedLesson = lessonService.save(lesson);
        return ResponseEntity.ok(LessonResponseDto.fromLesson(savedLesson));
    }

    /**
     * Obtiene todas las lecciones.
     * Acceso permitido a todos los roles.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<List<LessonResponseDto>> getAllLessons() {
        List<Lesson> lessons = lessonService.findAll();
        List<LessonResponseDto> dtos = lessons.stream()
                .map(LessonResponseDto::fromLesson)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Obtiene una lección por su ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<LessonResponseDto> getLessonById(@PathVariable UUID id) {
        return lessonService.findById(id)
                .map(LessonResponseDto::fromLesson)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtiene todas las lecciones de un curso específico.
     */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<List<LessonResponseDto>> getLessonsByCourse(@PathVariable UUID courseId) {
        List<Lesson> lessons = lessonService.findByCourseId(courseId);
        List<LessonResponseDto> dtos = lessons.stream()
                .map(LessonResponseDto::fromLesson)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Actualiza una lección.
     * Solo profesores o administradores pueden hacerlo.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<LessonResponseDto> updateLesson(@PathVariable UUID id, @Valid @RequestBody LessonRequestDto requestDto) {
        Optional<Lesson> existingLessonOpt = lessonService.findById(id);
        if (existingLessonOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Lesson existingLesson = existingLessonOpt.get();
        
        // Actualizar campos
        if (requestDto.getTitle() != null) {
            existingLesson.setTitle(requestDto.getTitle());
        }
        if (requestDto.getDescription() != null) {
            existingLesson.setDescription(requestDto.getDescription());
        }
        if (requestDto.getContent() != null) {
            existingLesson.setContent(requestDto.getContent());
        }
        
        // Si se proporciona un nuevo courseId, actualizar el curso
        if (requestDto.getCourseId() != null) {
            Course course = courseRepository.findById(requestDto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Curso no encontrado con ID: " + requestDto.getCourseId()));
            existingLesson.setCourse(course);
        }
        
        Lesson updatedLesson = lessonService.save(existingLesson);
        return ResponseEntity.ok(LessonResponseDto.fromLesson(updatedLesson));
    }

    /**
     * Elimina una lección.
     * Solo profesores o administradores pueden hacerlo.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable UUID id) {
        lessonService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Gestión del progreso (UserLesson) ---

    /**
     * Registra o actualiza el progreso de un estudiante en una lección.
     */
    @PostMapping("/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<UserLesson> updateProgress(@PathVariable UUID lessonId,
                                                     @RequestParam Integer progress,
                                                     @AuthenticationPrincipal Jwt jwt) {
        String cognitoSub = jwt.getClaim("sub");

        // Buscar usuario autenticado en BD
        User user = userService.getByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Optional<UserLesson> existing = userLessonService.findByUserAndLesson(user.getId(), lessonId);

        UserLesson userLesson;
        if (existing.isPresent()) {
            userLesson = existing.get();
            userLesson.setProgress(progress);
            if (progress == 100) {
                userLesson.setCompleted(true);
                userLesson.setCompletedAt(Instant.now());
            }
        } else {
            Lesson lesson = lessonService.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

            userLesson = UserLesson.builder()
                    .user(user)
                    .lesson(lesson)
                    .progress(progress)
                    .completed(progress == 100)
                    .completedAt(progress == 100 ? Instant.now() : null)
                    .build();
        }

        return ResponseEntity.ok(userLessonService.save(userLesson));
    }

    /**
     * Consulta el progreso de un estudiante en una lección específica.
     */
    @GetMapping("/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<UserLesson> getProgress(@PathVariable UUID lessonId,
                                                  @AuthenticationPrincipal Jwt jwt) {
        String cognitoSub = jwt.getClaim("sub");

        User user = userService.getByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return userLessonService.findByUserAndLesson(user.getId(), lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}