package com.skillbridge.ai.assessment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "assessments")
@Getter @Setter @NoArgsConstructor
public class Assessment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false,length=200)
    private String title;
    @Column(columnDefinition="TEXT")
    private String description;
    @Column(nullable=false)
    private boolean published = true;
    @Column(nullable=false,updatable=false)
    private Instant createdAt = Instant.now();
}
