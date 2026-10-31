package com.Cloudshare.service.serviceImpl;

import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.UpdateProfileRequest;
import com.Cloudshare.dataTranseferObjects.UserDataTransferObjects.StorageDTO;
import com.Cloudshare.repositories.UserRepository;
import com.Cloudshare.service.serviceInterface.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
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
        if (rows==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Failed update");
        return "Update Success";
    }
}
