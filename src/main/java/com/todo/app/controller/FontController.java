package com.todo.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/fonts")
@CrossOrigin(origins = "*")
@Tag(name = "Fonts API", description = "Provides Google Fonts directly from the backend")
public class FontController {

    @Value("${google.fonts.api.key:}")
    private String googleFontsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, Object> fontCache = new ConcurrentHashMap<>();
    private long lastFetchTime = 0;
    private static final long CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

    @GetMapping
    @Operation(summary = "Get Google Fonts", description = "Fetches the list of popular Google Fonts using the backend API key")
    public ResponseEntity<Object> getFonts() {
        if (googleFontsApiKey == null || googleFontsApiKey.trim().isEmpty()) {
            return ResponseEntity.status(500).body(Map.of("error", "Google Fonts API Key is not configured on the server."));
        }

        long currentTime = System.currentTimeMillis();
        
        // Return cached response if valid
        if (!fontCache.isEmpty() && (currentTime - lastFetchTime) < CACHE_EXPIRY_MS) {
            return ResponseEntity.ok(fontCache.get("fonts"));
        }

        try {
            String url = "https://www.googleapis.com/webfonts/v1/webfonts?key=" + googleFontsApiKey + "&sort=popularity";
            Object response = restTemplate.getForObject(url, Object.class);
            
            // Cache the successful response
            fontCache.put("fonts", response);
            lastFetchTime = currentTime;
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Fallback to cache if available on failure, otherwise error
            if (!fontCache.isEmpty()) {
                return ResponseEntity.ok(fontCache.get("fonts"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch fonts from Google API: " + e.getMessage()));
        }
    }
}
