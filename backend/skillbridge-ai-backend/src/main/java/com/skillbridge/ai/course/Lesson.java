package com.skillbridge.ai.course;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="lessons")
@Getter @Setter @NoArgsConstructor
public class Lesson {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="course_id",nullable=false)
    private Course course;
    @Column(nullable=false,length=200)
    private String title;
    @Column(columnDefinition="TEXT")
    private String content;
    @Column(nullable=false)
    private int position;
    @Column(nullable=false)
    private boolean published=true;
}
