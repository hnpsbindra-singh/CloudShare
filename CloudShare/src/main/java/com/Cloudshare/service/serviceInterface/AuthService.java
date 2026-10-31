package com.Cloudshare.service.serviceInterface;

import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.LoginRequest;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.ResetPasswordRequest;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.VerifyEmailRequest;
import jakarta.validation.Valid;


public interface AuthService {

    String register(@Valid RegisterRequest request);
    String verify(@Valid VerifyEmailRequest verifyEmailRequest);
    String login(@Valid LoginRequest request);
    String sendOtp(String username);
    String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest);
}
