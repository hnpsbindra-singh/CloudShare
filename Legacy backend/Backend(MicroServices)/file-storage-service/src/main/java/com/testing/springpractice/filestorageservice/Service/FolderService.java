package com.testing.springpractice.filestorageservice.Service;

import com.cloudinary.Cloudinary;

import com.cloudinary.utils.ObjectUtils;
import com.testing.springpractice.filestorageservice.Controllers.UserClient;
import com.testing.springpractice.filestorageservice.DataTranseferObjects.FolderDataTransferObjects.*;
import com.testing.springpractice.filestorageservice.Models.Folder;
import com.testing.springpractice.filestorageservice.Models.StoredFile;
import com.testing.springpractice.filestorageservice.Repositories.FileRepository;
import com.testing.springpractice.filestorageservice.Repositories.FolderRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FolderService {
    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final Cloudinary cloudinary;
    private final UserClient userClient;

    public FolderService(FolderRepository folderRepository, FileRepository fileRepository, Cloudinary cloudinary, UserClient userClient) {
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
        this.cloudinary = cloudinary;
        this.userClient = userClient;
    }

    public String createFolder(UUID parentId, FolderCreation creation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);

        Folder parentFolder = null;

        if (parentId != null) {
            parentFolder = folderRepository.findByIdAndOwnerId(parentId, userId).orElseThrow(()->
                    new RuntimeException("Invalid parent Folder"));
        }
        Folder folder = Folder.builder()
                .folderName(creation.getFolderName())
                .parentFolderId(parentId)
                .ownerId(userId)
                .build();
        folderRepository.save(folder);
        return "Folder Successfully Created";

    }

    public FolderContents getAllContents(UUID parentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);
        List<FolderDetails> folderDetails = null;
        List<FileDetails> fileDetails = null;
        if(parentId==null){
            folderDetails = folderRepository.findByOwnerIdAndParentFolderIsNull(userId);
            fileDetails = fileRepository.findByOwnerIdAndFolderIsNull(userId);
        }else {
            folderDetails = folderRepository.findByParentFolderId(parentId);
            fileDetails = fileRepository.findByFolder_Id(parentId);
        }

        FolderContents contents = FolderContents.builder()
                .id(parentId)
                .allFolders(folderDetails)
                .allFiles(fileDetails).build();

        return contents;
    }

    public String getFile(UUID fileId) {
        String publicUrl = fileRepository.findPublicUrlByFileId(fileId);
        return publicUrl;
    }

    public String upload(MultipartFile file, UUID folderId) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);
        Folder folder = null;
        if (folderId!=null){
            folder = folderRepository.findById(folderId).orElseThrow(()->new RuntimeException("Invalid Folder"));
            if (!userId.equals(folder.getOwnerId())){
                throw new RuntimeException("Invalid Access");
            }
        }
        UserStorageDto userStorage = userClient.getUserStorage(userId);

        if (userStorage.getStorageUsed()+file.getSize()>userStorage.getStorageLimit()){
            throw new RuntimeException("Not enough Space");
        }

        Map upload = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "auto"
        ));
        String link = upload.get("secure_url").toString();
        String resourceType = upload.get("resource_type").toString();
        String publicId = upload.get("public_id").toString();



        StoredFile storedFile = StoredFile.builder()
                .name(file.getOriginalFilename())
                .publicUrl(link)
                .mimeType(file.getContentType())
                .resourceType(resourceType)
                .size(file.getSize())
                .ownerId(userId)
                .publicId(publicId)
                .folderId(folderId)
                .build();
        userClient.updateStorageUsed(userId, userStorage.getStorageUsed()+file.getSize());
        fileRepository.save(storedFile);
        return "Save Success";

    }

    public String renameFolder(UUID folderId, String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);
        int rows = folderRepository.updateFolderName(folderId, name, userId);
        if (rows==0){
            throw new RuntimeException("Rename Failed");
        }
        return "Rename Success";

    }

    public String renameFile(UUID fileId, String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);
        int rows = fileRepository.updateFolderName(fileId, name,userId);
        if (rows==0){
            throw new RuntimeException("Rename Failed");
        }
        return "Rename Success";
    }
    public String deleteFile(UUID fileId) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);
        StoredFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        if (!userId.equals(file.getOwnerId())) {
            throw new RuntimeException("Unauthorized access");
        }
        cloudinary.uploader().destroy(file.getPublicId(), ObjectUtils.asMap(
                "resource_type", file.getResourceType()
        ));

        UserStorageDto userStorageDto = userClient.getUserStorage(userId);
        long updatedStorage = userStorageDto.getStorageUsed() - file.getSize();
        userClient.updateStorageUsed(userId, Math.max(0L, updatedStorage));
        fileRepository.delete(file);

        return "File Deleted Successfully";
    }

    public FolderContents searchKeyword(String query) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);
        List<FolderDetails> folderDetails = null;
        List<FileDetails> fileDetails = null;
        folderDetails = folderRepository.findByKeywordAndOwner(query, userId);
        fileDetails = fileRepository.findByKeywordAndOwner(query, userId);


        FolderContents contents = FolderContents.builder()
                .allFolders(folderDetails)
                .allFiles(fileDetails).build();
        return contents;

    }

    @Transactional
    public String deleteFolder(UUID folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        UUID userId = UUID.fromString(user);

        Folder folder = folderRepository.findByIdAndOwnerId(folderId, userId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        folderRepository.unlinkChildFolders(folderId, userId);
        fileRepository.unlinkChildFiles(folderId, userId);
        folderRepository.delete(folder);
        return "Folder Deleted Successfully";
    }
}
