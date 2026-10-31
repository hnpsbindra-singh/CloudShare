package com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects;
import java.time.LocalDateTime;
import java.util.UUID;

public interface FolderDetails {
    UUID getId();
    String getFolderName();
    String getOwnerName();
    LocalDateTime getCreationTime();
}
