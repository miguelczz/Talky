package com.talky.backend.dto.course;

import com.talky.backend.model.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO para enviar información de un curso al frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponseDto {
    private UUID id;
    private String title;
    private String description;
    private UUID teacherId;
    private String teacherName;
    private String teacherEmail;
    private Integer studentsCount;
    private Integer lessonsCount;
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * Convierte una entidad Course a CourseResponseDto.
     */
    public static CourseResponseDto fromCourse(Course course) {
        CourseResponseDto.CourseResponseDtoBuilder builder = CourseResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt());

        if (course.getTeacher() != null) {
            builder.teacherId(course.getTeacher().getId())
                   .teacherName(course.getTeacher().getName())
                   .teacherEmail(course.getTeacher().getEmail());
        }

        // Evitar acceder a relaciones lazy sin inicializar
        // Los conteos se pueden calcular con consultas separadas si se necesitan
        // Por ahora, los dejamos en 0 para evitar problemas de serialización
        try {
            if (course.getStudents() != null) {
                builder.studentsCount(course.getStudents().size());
            } else {
                builder.studentsCount(0);
            }
        } catch (Exception e) {
            // Si es una relación lazy no inicializada, dejamos el conteo en 0
            builder.studentsCount(0);
        }

        try {
            if (course.getLessons() != null) {
                builder.lessonsCount(course.getLessons().size());
            } else {
                builder.lessonsCount(0);
            }
        } catch (Exception e) {
            // Si es una relación lazy no inicializada, dejamos el conteo en 0
            builder.lessonsCount(0);
        }

        return builder.build();
    }
}

