package com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FolderCreation {
    @NotBlank(message = "Folder name cannot be empty")
    private String folderName;
}