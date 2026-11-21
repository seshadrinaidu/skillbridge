package com.skillbridge.ai.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApi(ApiException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus()).body(error(ex.getStatus(), ex.getCode(), ex.getMessage(), request));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> badCredentials(BadCredentialsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error(401, "UNAUTHORIZED", "Invalid email or password", request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst().map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(error(400, "VALIDATION_ERROR", message, request));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> constraint(ConstraintViolationException ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(error(400, "VALIDATION_ERROR", ex.getMessage(), request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> denied(AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(error(403, "FORBIDDEN", "You do not have permission to perform this action", request));
    }

    private Map<String, Object> error(int status, String code, String message, HttpServletRequest request) {
        return Map.of("timestamp", Instant.now().toString(),
                "status", status,
                "error", code,
                "message", message,
                "path", request.getRequestURI());
    }
}
