package com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects;


import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public interface FileDetails {
    UUID getId();
    String getName();
    String getOwnerName();
    LocalDateTime getCreationTime();
}
