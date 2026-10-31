package com.testing.springpractice.filestorageservice.DataTranseferObjects.FolderDataTransferObjects;


import java.time.LocalDateTime;
import java.util.UUID;

public interface FileDetails {
    UUID getId();
    String getName();
    UUID getOwnerId();
    LocalDateTime getCreationTime();
}
