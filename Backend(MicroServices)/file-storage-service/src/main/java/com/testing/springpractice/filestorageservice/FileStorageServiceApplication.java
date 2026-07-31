package com.testing.springpractice.filestorageservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class FileStorageServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FileStorageServiceApplication.class, args);
    }

}
