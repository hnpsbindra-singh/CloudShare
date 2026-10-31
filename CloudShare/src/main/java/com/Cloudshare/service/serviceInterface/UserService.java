package com.Cloudshare.service.serviceInterface;

import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.UpdateProfileRequest;
import com.Cloudshare.dataTranseferObjects.UserDataTransferObjects.StorageDTO;
import jakarta.validation.Valid;


public interface UserService {

    StorageDTO getUsage();
    ProfileResponse getMydetails();
    String updateProfile(@Valid UpdateProfileRequest request);
}
