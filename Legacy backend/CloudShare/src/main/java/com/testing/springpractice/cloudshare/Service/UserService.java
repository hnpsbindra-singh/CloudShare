package com.testing.springpractice.cloudshare.Service;

import com.testing.springpractice.cloudshare.DataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.testing.springpractice.cloudshare.DataTranseferObjects.AuthDataTransferObjects.UpdateProfileRequest;
import com.testing.springpractice.cloudshare.DataTranseferObjects.UserDataTransferObjects.StorageDTO;
import com.testing.springpractice.cloudshare.Repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public StorageDTO getUsage() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.getStorageDetails(username);
    }


    public ProfileResponse getMydetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.getProfileDetails(username);
    }

    public String updateProfile(@Valid UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int rows = userRepository.updateProfile(request.getPhoneNumber(), request.getName(), username);
        if (rows==0) throw new RuntimeException("Failed update");
        return "Update Success";
    }
}
