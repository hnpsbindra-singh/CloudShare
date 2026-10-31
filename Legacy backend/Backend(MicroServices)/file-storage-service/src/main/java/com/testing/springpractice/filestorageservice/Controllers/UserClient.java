package com.testing.springpractice.filestorageservice.Controllers;

import com.testing.springpractice.filestorageservice.DataTranseferObjects.FolderDataTransferObjects.UserStorageDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "user-auth-service", url = "http://localhost:8081")
public interface UserClient {
    @GetMapping("/api/user/internal/storage/{id}")
    UserStorageDto getUserStorage(@PathVariable UUID id);

    @PutMapping("/api/user/internal/storage/{id}")
    void updateStorageUsed(@PathVariable UUID id, @RequestParam Long bytes);

}
