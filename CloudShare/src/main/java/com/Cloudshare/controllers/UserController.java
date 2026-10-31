package com.Cloudshare.controllers;

import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.UpdateProfileRequest;
import com.Cloudshare.dataTranseferObjects.UserDataTransferObjects.StorageDTO;
import com.Cloudshare.service.serviceInterface.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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
}
