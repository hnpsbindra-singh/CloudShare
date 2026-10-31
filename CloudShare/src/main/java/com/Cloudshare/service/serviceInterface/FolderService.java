package com.Cloudshare.service.serviceInterface;

import com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects.FileReturnDTO;
import com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects.FolderContents;
import com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects.FolderCreation;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface FolderService {
    String createFolder(UUID parentId, FolderCreation creation);
    FolderContents getAllContents(UUID parentId);
    FileReturnDTO getFile(UUID fileId);
    String upload(MultipartFile file, UUID folderId) throws IOException;
    String renameFolder(UUID folderId, String name);
    String renameFile(UUID fileId, String name);
    String deleteFile(UUID fileId) throws IOException;
    FolderContents searchKeyword(String query);
    String deleteFolder(UUID folderId);
    String summariseFile(UUID fileId);
}
