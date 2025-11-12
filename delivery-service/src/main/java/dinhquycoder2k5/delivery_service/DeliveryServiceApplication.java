package dinhquycoder2k5.delivery_service;
/* This file is main door to open everything */

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;//Auto scan, config, start anything

@SpringBootApplication
public class DeliveryServiceApplication {
    
    public static void main(String[] args) {
        /*Due to load config, scan components, inject dependencies, 
connect database, start Tomcat server*/
        SpringApplication.run(DeliveryServiceApplication.class, args);
        
        System.out.println("===============================================");
        System.out.println("🚚 Delivery Service is running on port 8081");
        System.out.println("📍 API Base URL: http://localhost:8081/api/deliveries");
        System.out.println("===============================================");
    }
}
