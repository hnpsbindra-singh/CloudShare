package com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects;
import java.time.LocalDateTime;
import java.util.UUID;

public interface FolderDetails {
    UUID getId();
    String getFolderName();
    String getOwnerName();
    LocalDateTime getCreationTime();
}
