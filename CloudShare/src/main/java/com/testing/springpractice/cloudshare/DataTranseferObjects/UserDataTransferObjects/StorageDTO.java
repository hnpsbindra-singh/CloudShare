package com.testing.springpractice.cloudshare.DataTranseferObjects.UserDataTransferObjects;

import lombok.*;


public interface StorageDTO {
    Long getStorageLimit();
    Long getStorageUsed();
}
