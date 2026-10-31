package com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects;


import java.time.LocalDateTime;
import java.util.UUID;

public interface FileDetails {
    UUID getId();
    String getName();
    String getOwnerName();
    LocalDateTime getCreationTime();
}
