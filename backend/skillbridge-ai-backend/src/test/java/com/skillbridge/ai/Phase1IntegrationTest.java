package com.skillbridge.ai;

import com.skillbridge.ai.enrollment.EnrollmentRepository;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Phase1IntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired EnrollmentRepository enrollments;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void clean() {
        enrollments.deleteAll();
        users.deleteAll();
    }

    @Test
    void studentCanRegisterLoginAndHasHashedPassword() throws Exception {
        String body = """
                {"fullName":"Ada Student","email":"ada@example.com","password":"StrongPass123!",
                 "targetJobRole":"Java Backend Developer","experienceLevel":"BEGINNER",
                 "weeklyStudyHours":10,"timezone":"Asia/Kolkata","role":"STUDENT"}
                """;

        String response = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("STUDENT"))
                .andReturn().getResponse().getContentAsString();

        var user = users.findByEmailIgnoreCase("ada@example.com").orElseThrow();
        assertThat(passwordEncoder.matches("StrongPass123!", user.getPasswordHash())).isTrue();
        assertThat(user.getPasswordHash()).doesNotContain("StrongPass123!");

        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"ada@example.com","password":"StrongPass123!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void publicRegistrationCannotCreateAdmin() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Not Admin","email":"bad@example.com","password":"StrongPass123!",
                                 "timezone":"UTC","role":"ADMIN"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void trainerCreatesCourseAndStudentEnrollsOnce() throws Exception {
        String trainerToken = register("Trainer One", "trainer@example.com", "TRAINER");
        String courseResponse = mvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + trainerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Java Backend Developer","description":"Beginner track",
                                 "category":"Backend","difficulty":"BEGINNER","published":true}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long courseId = Long.parseLong(courseResponse.replaceAll("(?s).*\\\"id\\\"\\s*:\\s*(\\d+).*", "$1"));

        String studentToken = register("Student One", "student@example.com", "STUDENT");
        String enrollmentJson = "{\"courseId\":" + courseId + "}";

        mvc.perform(post("/api/v1/enrollments")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON).content(enrollmentJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseId").value(courseId));

        mvc.perform(post("/api/v1/enrollments")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON).content(enrollmentJson))
                .andExpect(status().isConflict());

        mvc.perform(delete("/api/v1/courses/" + courseId + "/enroll")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/v1/trainer/dashboard")
                        .header("Authorization", "Bearer " + trainerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeCourses").value(1));
    }

    private String register(String name, String email, String role) throws Exception {
        String response = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"%s","email":"%s","password":"StrongPass123!",
                                 "timezone":"UTC","role":"%s"}
                                """.formatted(name, email, role)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return response.replaceAll("(?s).*\\\"accessToken\\\"\\s*:\\s*\\\"([^\\\"]+)\\\".*", "$1");
    }
}
