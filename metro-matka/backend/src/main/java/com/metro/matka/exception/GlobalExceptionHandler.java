package com.metro.matka.exception;

import com.metro.matka.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> badRequest(BadRequestException e) {
        log.warn("Bad request: {}", e.getMessage());
        return ApiResponse.error(e.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> notFound(ResourceNotFoundException e) {
        return ApiResponse.error(e.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> unauthorized(UnauthorizedException e) {
        return ApiResponse.error(e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> forbidden(AccessDeniedException e) {
        return ApiResponse.error("Access denied: insufficient permissions");
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> badCredentials(BadCredentialsException e) {
        return ApiResponse.error("Invalid username or password");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> validation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getAllErrors().forEach(err ->
            errors.put(((FieldError) err).getField(), err.getDefaultMessage()));
        return ApiResponse.<Map<String, String>>builder()
            .success(false).message("Validation failed").data(errors)
            .timestamp(System.currentTimeMillis()).build();
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<Void> dataIntegrity(
            org.springframework.dao.DataIntegrityViolationException e) {
        log.warn("Data integrity violation: {}", e.getMessage());
        String msg = e.getMessage() != null && e.getMessage().contains("username")
            ? "Username already exists"
            : e.getMessage() != null && e.getMessage().contains("email")
            ? "Email already registered"
            : "Duplicate data - record already exists";
        return ApiResponse.error(msg);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<String> general(Exception e) {
        // Log full stack trace for debugging
        log.error("Unexpected error [{}]: {}", e.getClass().getSimpleName(), e.getMessage(), e);
        // Return actual cause in message to help debug
        return ApiResponse.<String>builder()
            .success(false)
            .message("Server error: " + e.getClass().getSimpleName() + " - " + e.getMessage())
            .data(null)
            .timestamp(System.currentTimeMillis())
            .build();
    }
}
