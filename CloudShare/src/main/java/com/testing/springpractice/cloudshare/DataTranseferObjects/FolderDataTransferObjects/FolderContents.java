package com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FolderContents {
    private UUID id;
    List<FolderDetails> allFolders;
    List<FileDetails> allFiles;

}
