package com.skillbridge.ai.course;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {
    private final CourseRepository courses;

    public CourseService(CourseRepository courses) {
        this.courses = courses;
    }

    @Transactional(readOnly = true)
    public Page<CourseDtos.CourseResponse> publishedCourses(Pageable pageable) {
        return courses.findByPublishedTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CourseDtos.CourseResponse getPublishedOrAuthorized(Long id, User requester) {
        Course course = courses.findById(id)
                .orElseThrow(() -> new ApiException(404, "NOT_FOUND", "Course not found"));
        if (!course.isPublished() && (requester == null
                || (!course.getTrainer().getId().equals(requester.getId())
                && requester.getRole() != UserRole.ADMIN))) {
            throw new ApiException(404, "NOT_FOUND", "Course not found");
        }
        return toResponse(course);
    }

    @Transactional
    public CourseDtos.CourseResponse create(CourseDtos.CourseRequest request, User trainer) {
        requireTrainerOrAdmin(trainer);
        Course course = new Course();
        apply(course, request);
        course.setTrainer(trainer);
        return toResponse(courses.save(course));
    }

    @Transactional
    public CourseDtos.CourseResponse update(Long id, CourseDtos.CourseRequest request, User requester) {
        Course course = ownedCourse(id, requester);
        apply(course, request);
        return toResponse(courses.save(course));
    }

    @Transactional
    public void delete(Long id, User requester) {
        courses.delete(ownedCourse(id, requester));
    }

    private Course ownedCourse(Long id, User requester) {
        Course course = courses.findById(id)
                .orElseThrow(() -> new ApiException(404, "NOT_FOUND", "Course not found"));
        if (requester.getRole() != UserRole.ADMIN
                && !course.getTrainer().getId().equals(requester.getId())) {
            throw new ApiException(403, "FORBIDDEN", "You may only modify your own courses");
        }
        return course;
    }

    private void requireTrainerOrAdmin(User user) {
        if (user.getRole() != UserRole.TRAINER && user.getRole() != UserRole.ADMIN) {
            throw new ApiException(403, "FORBIDDEN", "Only trainers and administrators may create courses");
        }
    }

    private void apply(Course course, CourseDtos.CourseRequest request) {
        course.setTitle(request.title().trim());
        course.setDescription(request.description());
        course.setCategory(request.category());
        course.setDifficulty(request.difficulty());
        course.setPublished(request.published());
    }

    public CourseDtos.CourseResponse toResponse(Course course) {
        return new CourseDtos.CourseResponse(course.getId(), course.getTitle(), course.getDescription(),
                course.getCategory(), course.getDifficulty(), course.getTrainer().getId(),
                course.getTrainer().getFullName(), course.isPublished());
    }
}
