package com.testing.springpractice.userauthservice.Controllers;

import com.testing.springpractice.userauthservice.DataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.testing.springpractice.userauthservice.DataTranseferObjects.AuthDataTransferObjects.UpdateProfileRequest;
import com.testing.springpractice.userauthservice.DataTranseferObjects.UserDataTransferObjects.StorageDTO;
import com.testing.springpractice.userauthservice.DataTranseferObjects.UserStorageDto;
import com.testing.springpractice.userauthservice.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/storageUsage")
    public StorageDTO getUsage(){
        return userService.getUsage();
    }
    @GetMapping("/me")
    public ProfileResponse getMyDetails(){
        return userService.getMydetails();
    }
    @PatchMapping("/me")
    public String Update(@Valid @RequestBody UpdateProfileRequest request){
        return userService.updateProfile(request);
    }
    @GetMapping("/internal/storage/{id}")
    public UserStorageDto getUserStorage(@PathVariable UUID id) {
        return userService.getUserStorageById(id);
    }
    @PutMapping("/internal/storage/{id}")
    public void updateStorageUsed(@PathVariable UUID id, @RequestParam Long bytes) {
        userService.updateUserStorage(id, bytes);
    }
}
