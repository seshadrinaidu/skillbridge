package com.skillbridge.ai.roadmap;

import java.util.List;

public final class RoadmapDtos {
    private RoadmapDtos(){}
    public record GenerateRequest(String targetRole,Integer studyTimeHoursPerWeek,String userId){}
    public record RoadmapResponse(Long id,String targetRole,String title,List<MilestoneResponse> milestones){}
    public record MilestoneResponse(Long id,String title,String description,List<TaskResponse> tasks){}
    public record TaskResponse(Long id,String title,String taskType,boolean completed){}
    public record DailyProblemResponse(Long id,String title,String difficulty,String topic){}
}
