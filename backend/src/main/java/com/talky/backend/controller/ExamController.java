package com.talky.backend.controller;

import com.talky.backend.dto.exam.ExamRequestDto;
import com.talky.backend.dto.exam.ExamResponseDto;
import com.talky.backend.dto.grade.GradeResponseDto;
import com.talky.backend.dto.question.QuestionRequestDto;
import com.talky.backend.dto.question.QuestionResponseDto;
import com.talky.backend.model.exam.Exam;
import com.talky.backend.model.exam.Question;
import com.talky.backend.model.exam.UserExamResult;
import com.talky.backend.model.User;
import com.talky.backend.service.exam.ExamService;
import com.talky.backend.service.exam.QuestionService;
import com.talky.backend.service.exam.UserExamResultService;
import com.talky.backend.service.lesson.LessonService;
import com.talky.backend.dto.ExamResultDto;
import com.talky.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;
    private final QuestionService questionService;
    private final LessonService lessonService;
    private final UserExamResultService userExamResultService;
    private final SecurityUtils securityUtils;

    public ExamController(
            ExamService examService,
            QuestionService questionService,
            LessonService lessonService,
            UserExamResultService userExamResultService,
            SecurityUtils securityUtils
    ) {
        this.examService = examService;
        this.questionService = questionService;
        this.lessonService = lessonService;
        this.userExamResultService = userExamResultService;
        this.securityUtils = securityUtils;
    }

    // --- Gestión de exámenes ---

    @PostMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ExamResponseDto> createExam(
            @PathVariable UUID lessonId, 
            @Valid @RequestBody ExamRequestDto requestDto) {
        // Buscar la lección
        com.talky.backend.model.lesson.Lesson lesson = lessonService.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));
        
        // Crear la entidad Exam desde el DTO
        Exam exam = new Exam();
        exam.setTitle(requestDto.getTitle());
        exam.setDescription(requestDto.getDescription());
        exam.setLesson(lesson);
        
        Exam savedExam = examService.save(exam);
        return ResponseEntity.ok(ExamResponseDto.fromExam(savedExam));
    }

    /**
     * Obtiene todos los exámenes.
     * - Estudiantes: solo ven exámenes de su curso
     * - Profesores: ven exámenes de sus cursos
     * - Administradores: ven todos los exámenes
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<List<ExamResponseDto>> getAllExams() {
        User currentUser = securityUtils.getCurrentUserOrThrow();
        List<Exam> exams;

        if (currentUser.getRole() == User.Role.STUDENT) {
            // Estudiantes solo ven exámenes de su curso
            if (currentUser.getCourseAsStudent() == null) {
                exams = List.of();
            } else {
                exams = examService.findAll().stream()
                        .filter(exam -> exam.getLesson() != null &&
                                exam.getLesson().getCourse() != null &&
                                exam.getLesson().getCourse().getId().equals(currentUser.getCourseAsStudent().getId()))
                        .collect(Collectors.toList());
            }
        } else if (currentUser.getRole() == User.Role.TEACHER) {
            // Profesores ven exámenes de sus cursos
            exams = examService.findAll().stream()
                    .filter(exam -> exam.getLesson() != null &&
                            exam.getLesson().getCourse() != null &&
                            exam.getLesson().getCourse().getTeacher() != null &&
                            exam.getLesson().getCourse().getTeacher().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        } else {
            // Administradores ven todos los exámenes
            exams = examService.findAll();
        }

        List<ExamResponseDto> dtos = exams.stream()
                .map(ExamResponseDto::fromExam)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<ExamResponseDto> getExamById(@PathVariable UUID id) {
        return examService.findById(id)
                .map(ExamResponseDto::fromExam)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<List<ExamResponseDto>> getExamsByLesson(@PathVariable UUID lessonId) {
        List<Exam> exams = examService.findByLessonId(lessonId);
        List<ExamResponseDto> dtos = exams.stream()
                .map(ExamResponseDto::fromExam)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable UUID id) {
        examService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Gestión de preguntas ---

    @PostMapping("/{examId}/questions")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<QuestionResponseDto> addQuestion(
            @PathVariable UUID examId, 
            @Valid @RequestBody QuestionRequestDto requestDto) {
        Exam exam = examService.findById(examId)
                .orElseThrow(() -> new RuntimeException("Examen no encontrado"));
        
        // Crear la entidad Question desde el DTO
        Question question = new Question();
        question.setText(requestDto.getText());
        // Normalizar correctAnswer: eliminar espacios y convertir a minúsculas para consistencia
        String normalizedCorrectAnswer = requestDto.getCorrectAnswer() != null 
            ? requestDto.getCorrectAnswer().trim().toLowerCase().replaceAll("\\s+", "").trim()
            : "";
        question.setCorrectAnswer(normalizedCorrectAnswer);
        
        // Convertir options Map a JSON string
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String optionsJson = mapper.writeValueAsString(requestDto.getOptions());
            question.setOptions(optionsJson);
        } catch (Exception e) {
            throw new RuntimeException("Error al serializar opciones", e);
        }
        
        question.setExam(exam);
        Question savedQuestion = questionService.save(question);
        return ResponseEntity.ok(QuestionResponseDto.fromQuestion(savedQuestion));
    }

    @GetMapping("/{examId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<List<QuestionResponseDto>> getQuestionsByExam(@PathVariable UUID examId) {
        List<Question> questions = questionService.findByExamId(examId);
        List<QuestionResponseDto> dtos = questions.stream()
                .map(QuestionResponseDto::fromQuestion)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<QuestionResponseDto> getQuestionById(@PathVariable UUID id) {
        return questionService.findById(id)
                .map(QuestionResponseDto::fromQuestion)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Gestión de resultados (UserExamResult) ---

    /**
     * Un estudiante envía sus respuestas de un examen.
     */

    @PostMapping("/{examId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<GradeResponseDto> submitExam(
            @PathVariable UUID examId,
            @RequestBody ExamResultDto submission
    ) {
        User student = securityUtils.getCurrentUserOrThrow();

        Exam exam = examService.findById(examId)
                .orElseThrow(() -> new RuntimeException("Examen no encontrado"));

        // Obtener respuestas enviadas
        Map<String, String> answersMap = submission.getAnswers();
        if (answersMap == null) {
            throw new RuntimeException("No se recibieron respuestas");
        }

        // --- Calcular score ---
        List<Question> questions = questionService.findByExamId(examId);
        int totalQuestions = questions.size();
        int correctCount = 0;

        // Log detallado para depuración
        System.out.println("=== Cálculo de Score ===");
        System.out.println("Total preguntas en BD: " + totalQuestions);
        System.out.println("Respuestas recibidas (keys): " + answersMap.keySet());
        System.out.println("Respuestas recibidas (completo): " + answersMap);

        for (Question q : questions) {
            String questionIdStr = q.getId().toString();
            String answer = answersMap.get(questionIdStr);
            
            // Si no se encuentra, intentar diferentes variaciones del ID
            if (answer == null) {
                // Intentar sin guiones
                String questionIdNoDashes = questionIdStr.replace("-", "");
                answer = answersMap.get(questionIdNoDashes);
            }
            if (answer == null) {
                // Intentar en minúsculas
                answer = answersMap.get(questionIdStr.toLowerCase());
            }
            if (answer == null) {
                // Intentar en mayúsculas
                answer = answersMap.get(questionIdStr.toUpperCase());
            }
            if (answer == null) {
                // Buscar en todas las claves que contengan el ID
                for (String key : answersMap.keySet()) {
                    if (key.contains(questionIdStr) || questionIdStr.contains(key)) {
                        answer = answersMap.get(key);
                        System.out.println("Respuesta encontrada con clave alternativa: " + key);
                        break;
                    }
                }
            }
            
            boolean isCorrect = false;
            if (answer != null && !answer.trim().isEmpty()) {
                // Normalizar ambas respuestas: eliminar espacios al inicio/final y convertir a minúsculas
                // También eliminar cualquier espacio interno para comparación más robusta
                String normalizedAnswer = answer.trim().toLowerCase().replaceAll("\\s+", "").trim();
                String normalizedCorrect = q.getCorrectAnswer().trim().toLowerCase().replaceAll("\\s+", "").trim();
                
                // Comparar las respuestas normalizadas
                isCorrect = normalizedAnswer.equals(normalizedCorrect);
                
                if (isCorrect) {
                    correctCount++;
                }
            }
            
            System.out.println("Pregunta ID: " + questionIdStr);
            System.out.println("  - Respuesta recibida (raw): '" + (answer != null ? answer : "NULL") + "'");
            System.out.println("  - Respuesta recibida (normalizada): '" + (answer != null ? answer.trim().toLowerCase().replaceAll("\\s+", "").trim() : "NULL") + "'");
            System.out.println("  - Respuesta correcta (raw): '" + q.getCorrectAnswer() + "'");
            System.out.println("  - Respuesta correcta (normalizada): '" + q.getCorrectAnswer().trim().toLowerCase().replaceAll("\\s+", "").trim() + "'");
            System.out.println("  - Es correcta: " + isCorrect);
        }

        double score = totalQuestions > 0 ? (correctCount * 100.0 / totalQuestions) : 0.0;
        
        System.out.println("=== Resumen ===");
        System.out.println("Respuestas correctas: " + correctCount + " de " + totalQuestions);
        System.out.println("Score calculado: " + score + "%");

        // Guardar en DB
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        String answersJson;
        try {
            answersJson = mapper.writeValueAsString(answersMap);
        } catch (Exception e) {
            throw new RuntimeException("Error al serializar respuestas", e);
        }

        UserExamResult result = userExamResultService.findByUserAndExam(student.getId(), examId)
                .orElse(UserExamResult.builder().user(student).exam(exam).reviewed(false).build());

        result.setAnswers(answersJson);
        result.setScore(score);
        result.setReviewed(false); // Por defecto no está revisado

        UserExamResult savedResult = userExamResultService.save(result);
        // Devolver como GradeResponseDto para estudiantes (sin respuestas correctas)
        return ResponseEntity.ok(GradeResponseDto.fromUserExamResultForStudent(savedResult));
    }

    /**
     * Profesor/Admin obtiene todos los resultados de un examen.
     * - Profesores: solo ven resultados de exámenes de sus cursos
     * - Administradores: ven todos los resultados
     */
    @GetMapping("/{examId}/results")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<GradeResponseDto>> getResultsByExam(@PathVariable UUID examId) {
        User currentUser = securityUtils.getCurrentUserOrThrow();
        List<UserExamResult> results = userExamResultService.findByExamId(examId);

        if (currentUser.getRole() == User.Role.TEACHER) {
            // Profesores solo ven resultados de exámenes de sus cursos
            Exam exam = examService.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Examen no encontrado"));
            
            if (exam.getLesson() == null || exam.getLesson().getCourse() == null ||
                    exam.getLesson().getCourse().getTeacher() == null ||
                    !exam.getLesson().getCourse().getTeacher().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        List<GradeResponseDto> dtos = results.stream()
                .map(GradeResponseDto::fromUserExamResult)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Profesor/Admin obtiene el resultado de un estudiante en un examen.
     */
    @GetMapping("/{examId}/results/{userId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<GradeResponseDto> getResultByUser(
            @PathVariable UUID examId,
            @PathVariable UUID userId
    ) {
        return userExamResultService.findByUserAndExam(userId, examId)
                .map(GradeResponseDto::fromUserExamResult)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Marca un examen como revisado por el profesor.
     * Una vez revisado, el estudiante puede ver las respuestas correctas.
     */
    @PutMapping("/{examId}/results/{userId}/review")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<GradeResponseDto> reviewExam(
            @PathVariable UUID examId,
            @PathVariable UUID userId
    ) {
        User currentUser = securityUtils.getCurrentUserOrThrow();
        UserExamResult result = userExamResultService.findByUserAndExam(userId, examId)
                .orElseThrow(() -> new RuntimeException("Resultado no encontrado"));

        // Verificar que el profesor tenga acceso a este examen
        if (currentUser.getRole() == User.Role.TEACHER) {
            Exam exam = examService.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Examen no encontrado"));
            
            if (exam.getLesson() == null || exam.getLesson().getCourse() == null ||
                    exam.getLesson().getCourse().getTeacher() == null ||
                    !exam.getLesson().getCourse().getTeacher().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        result.setReviewed(true);
        UserExamResult updatedResult = userExamResultService.save(result);
        return ResponseEntity.ok(GradeResponseDto.fromUserExamResult(updatedResult));
    }
}
