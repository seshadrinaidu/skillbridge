package com.skillbridge.ai.course;

import jakarta.validation.constraints.NotBlank;

public final class LessonDtos {
    private LessonDtos(){}
    public record LessonRequest(@NotBlank String title,String content,Integer position,Boolean published){}
    public record LessonResponse(Long id,String title,String content,int position,boolean published,boolean completed){}
}
