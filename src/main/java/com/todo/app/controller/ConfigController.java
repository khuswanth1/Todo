package com.todo.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*")
@Tag(name = "Config API", description = "Configuration endpoints for Google Fonts settings")
public class ConfigController {

    @Value("${google.fonts.api.key:}")
    private String googleFontsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/google-fonts-key")
    @Operation(summary = "Get Google Fonts Key", description = "Retrieve the configured Google Fonts API Key")
    public ResponseEntity<Map<String, String>> getGoogleFontsKey() {
        return ResponseEntity.ok(Map.of("key", googleFontsApiKey != null ? googleFontsApiKey : ""));
    }

    @GetMapping("/google-fonts")
    @Operation(summary = "Fetch Google Fonts List", description = "Fetches fonts directly from the external Google API")
    public ResponseEntity<Object> getGoogleFonts() {
        if (googleFontsApiKey == null || googleFontsApiKey.trim().isEmpty()) {
            return ResponseEntity.status(500).body(Map.of("error", "Google Fonts API Key is not configured on the server."));
        }
        try {
            String url = "https://www.googleapis.com/webfonts/v1/webfonts?key=" + googleFontsApiKey + "&sort=popularity";
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch from Google API: " + e.getMessage()));
        }
    }
}
