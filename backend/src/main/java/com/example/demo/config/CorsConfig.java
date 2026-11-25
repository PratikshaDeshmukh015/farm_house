package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origins:}")
    private String additionalAllowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedOrigins = Arrays.asList(
            "https://farm-house-wine.vercel.app",
            "https://farm-house-61adfeox1-pratikshadeshmukh015s-projects.vercel.app",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            frontendUrl
        );

        List<String> configuredOrigins = Arrays.stream(additionalAllowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isBlank())
            .collect(Collectors.toList());

        allowedOrigins.forEach(origin -> {
            if (origin != null && !origin.isBlank()) {
                configuration.addAllowedOrigin(origin);
            }
        });
        configuredOrigins.forEach(configuration::addAllowedOrigin);

        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", "Authorization", "Accept", "Origin",
            "X-Requested-With", "user-id", "owner-id", "requester-id"
        ));
        configuration.setExposedHeaders(Arrays.asList("Location"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
