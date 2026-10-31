package com.Cloudshare.dataTranseferObjects.AuthDataTransferObjects;

import java.util.UUID;


public interface ProfileResponse {
    UUID getId();
    String getName();
    String getUsername();
    String getPhoneNumber();
}
