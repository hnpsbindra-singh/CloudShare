package com.testing.springpractice.cloudshare.DataTranseferObjects.AuthDataTransferObjects;

import lombok.*;

import java.util.UUID;


public interface ProfileResponse {
    UUID getId();
    String getName();
    String getUsername();
    String getPhoneNumber();
}
