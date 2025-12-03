package com.talky.backend.dto.exam;

import com.talky.backend.model.Course;
import com.talky.backend.model.exam.Exam;
import com.talky.backend.model.lesson.Lesson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO para enviar información de un examen al frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponseDto {
    private UUID id;
    private String title;
    private String description;
    private UUID lessonId;
    private String lessonTitle;
    private UUID courseId;
    private String courseTitle;
    private Integer questionsCount;
    private Double averageScore;
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * Convierte una entidad Exam a ExamResponseDto.
     * Maneja relaciones lazy y evita problemas de serialización circular.
     */
    public static ExamResponseDto fromExam(Exam exam) {
        ExamResponseDto.ExamResponseDtoBuilder builder = ExamResponseDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .createdAt(exam.getCreatedAt())
                .updatedAt(exam.getUpdatedAt());

        // Manejar relación con Lesson de forma segura
        try {
            if (exam.getLesson() != null) {
                Lesson lesson = exam.getLesson();
                builder.lessonId(lesson.getId())
                       .lessonTitle(lesson.getTitle());

                // Manejar relación con Course de forma segura
                try {
                    if (lesson.getCourse() != null) {
                        Course course = lesson.getCourse();
                        builder.courseId(course.getId())
                               .courseTitle(course.getTitle());
                    }
                } catch (Exception e) {
                    // Si la relación Course es lazy y no está inicializada, ignorar
                    // Los valores se quedarán como null
                }
            }
        } catch (Exception e) {
            // Si la relación Lesson es lazy y no está inicializada, ignorar
            // Los valores se quedarán como null
        }

        // Manejar relación con Questions de forma segura
        try {
            if (exam.getQuestions() != null) {
                builder.questionsCount(exam.getQuestions().size());
            } else {
                builder.questionsCount(0);
            }
        } catch (Exception e) {
            // Si la relación Questions es lazy y no está inicializada, usar 0
            builder.questionsCount(0);
        }

        return builder.build();
    }
}

