
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
        try {
            SpringApplication.run(TodoApplication.class, args);
        } catch (Exception e) {
            System.err.println("❌ Application failed to start:");
            e.printStackTrace();
            throw e;
        }
    }
}
