package com.testing.springpractice.filestorageservice.DataTranseferObjects.FolderDataTransferObjects;
import java.time.LocalDateTime;
import java.util.UUID;

public interface FolderDetails {
    UUID getId();
    String getFolderName();
    UUID getOwnerId();
    LocalDateTime getCreationTime();
}
