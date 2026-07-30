package com.testing.springpractice.cloudshare.Controllers;

import com.testing.springpractice.cloudshare.Configurations.VerifiedUser;
import com.testing.springpractice.cloudshare.DataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.testing.springpractice.cloudshare.DataTranseferObjects.AuthDataTransferObjects.UpdateProfileRequest;
import com.testing.springpractice.cloudshare.DataTranseferObjects.UserDataTransferObjects.StorageDTO;
import com.testing.springpractice.cloudshare.Service.UserService;
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
