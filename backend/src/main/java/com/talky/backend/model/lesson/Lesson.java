package com.talky.backend.model.lesson;

import com.talky.backend.model.exam.Exam;
import com.talky.backend.model.Course;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    /**
     * Descripción breve de la lección (para mostrar en listas).
     */
    private String description;

    /**
     * Contenido completo del curso que el profesor edita para los estudiantes.
     * Este es el contenido educativo principal de la lección.
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    // Relación con el curso
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    // Relación con exámenes
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Exam> exams;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
