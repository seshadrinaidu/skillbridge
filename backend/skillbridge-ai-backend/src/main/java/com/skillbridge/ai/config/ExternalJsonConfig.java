package com.skillbridge.ai.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ExternalJsonConfig {
    @Bean
    ObjectMapper externalObjectMapper() {
        return new ObjectMapper();
    }
}
