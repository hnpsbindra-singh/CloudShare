package com.Cloudshare.service.serviceImpl;

import com.Cloudshare.configurations.JwtUtils;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.LoginRequest;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.ResetPasswordRequest;
import com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects.VerifyEmailRequest;
import com.Cloudshare.kafka.OtpKafkaDTO;
import com.Cloudshare.models.Users;
import com.Cloudshare.repositories.UserRepository;
import com.Cloudshare.service.serviceInterface.AuthService;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository, RedisTemplate<String, Object> redisTemplate, KafkaTemplate<String, Object> kafkaTemplate, EmailService emailService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.kafkaTemplate = kafkaTemplate;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }


    public String register(@Valid RegisterRequest request) {
        if(userRepository.existsByUsername(request.getUsername().toLowerCase().trim())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User Already Exists");
        }
        int oneTime = 100000 + (int)(Math.random() * 900000);
        String otp = Integer.toString(oneTime);
        request.setUsername(request.getUsername().toLowerCase().trim());
        redisTemplate.opsForValue().set("user: "+request.getUsername(),
                otp,
                5,
                TimeUnit.MINUTES);
        request.setPassword(passwordEncoder.encode(request.getPassword()));
        redisTemplate.opsForValue().set("userObject: " + request.getUsername(),
                request,
                5,
                TimeUnit.MINUTES);
        OtpKafkaDTO otpKafkaDTO = new OtpKafkaDTO(request.getUsername(), request.getName(), otp);
        kafkaTemplate.send("Send-Otp", request.getUsername(), otpKafkaDTO);
        return "Otp Sent Successfully";
    }

    public String verify(@Valid VerifyEmailRequest verifyEmailRequest) {
        RegisterRequest registerRequest = (RegisterRequest) redisTemplate.opsForValue().get("userObject: " + verifyEmailRequest.getUsername().toLowerCase().trim());
        String storedOtp = (String) redisTemplate.opsForValue().get("user: "+verifyEmailRequest.getUsername().toLowerCase().trim());
        if (storedOtp == null) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "OTP expired.");
        }

        if (!storedOtp.equals(verifyEmailRequest.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Otp");

        }
        if (registerRequest == null) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Registration Expired");
        }
        Users user = Users.builder()
                .name(registerRequest.getName())
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .mobile(registerRequest.getMobile())
                .verified(true)
                .build();
        userRepository.save(user);
        redisTemplate.delete("userObject: " + verifyEmailRequest.getUsername());
        redisTemplate.delete("user: "+verifyEmailRequest.getUsername());
        return "Registration Successful";


    }


    public String login(@Valid LoginRequest request) {
        request.setUsername(request.getUsername().toLowerCase().trim());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword()
        ));
        Users user = userRepository.findByUsername(request.getUsername());
        return jwtUtils.getToken(request.getUsername());
    }

    public String sendOtp(String username) {
        username = username.toLowerCase().trim();
        if (!userRepository.existsByUsername(username)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"User Doesn't Exist");
        int oneTime = 100000 + (int)(Math.random() * 900000);
        String otp = Integer.toString(oneTime);
        redisTemplate.opsForValue().set("username:" + username
                , otp,
                5,
                TimeUnit.MINUTES);
        OtpKafkaDTO otpKafkaDTO = new OtpKafkaDTO(username, "User", otp);
        kafkaTemplate.send("Send-Otp", username, otpKafkaDTO);
        return "Otp Sent Successfully";
    }

    public String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest) {
        String username = resetPasswordRequest.getUsername().toLowerCase().trim();
        String storedOtp = (String) redisTemplate.opsForValue().get("username:" + username);
        if (storedOtp == null) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "OTP expired.");
        }
        if (!storedOtp.equals(resetPasswordRequest.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP.");
        }
        int rowsAffected = userRepository.updatepasswordForusername(
                passwordEncoder.encode(resetPasswordRequest.getNewPassword()),
                username
        );
        if (rowsAffected == 0) {
            return "Password update failed";
        }
        redisTemplate.delete("username:" + username);
        return "Password updated successfully";
    }
}
