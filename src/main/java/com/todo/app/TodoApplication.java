
package com.todo.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class TodoApplication {
    public static void main(String[] args) {
        // Auto-configure from Render's DATABASE_URL if present
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                String cleanUrl = databaseUrl.replace("postgres://", "db://").replace("postgresql://", "db://");
                java.net.URI uri = new java.net.URI(cleanUrl);
                String userInfo = uri.getUserInfo();
                String username = "";
                String password = "";
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }
                String host = uri.getHost();
                int port = uri.getPort();
                if (port == -1) {
                    port = 5432;
                }
                String path = uri.getPath();
                
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";
                
                System.setProperty("DB_URL", jdbcUrl);
                System.setProperty("DB_USERNAME", username);
                System.setProperty("DB_PASSWORD", password);
                System.setProperty("DB_DRIVER", "org.postgresql.Driver");
                System.out.println("🔧 Auto-configured database settings from DATABASE_URL");
            } catch (Exception e) {
                System.err.println("❌ Failed to parse DATABASE_URL: " + e.getMessage());
            }
        }

        try {
            SpringApplication.run(TodoApplication.class, args);
        } catch (Exception e) {
            System.err.println("❌ Application failed to start:");
            e.printStackTrace();
            throw e;
        }
    }
}
