package com.testing.springpractice.cloudshare.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FileDetails;
import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FolderContents;
import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FolderCreation;
import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FolderDetails;
import com.testing.springpractice.cloudshare.Models.Folder;
import com.testing.springpractice.cloudshare.Models.StoredFile;
import com.testing.springpractice.cloudshare.Models.Users;
import com.testing.springpractice.cloudshare.Repositories.FileRepository;
import com.testing.springpractice.cloudshare.Repositories.FolderRepository;
import com.testing.springpractice.cloudshare.Repositories.UserRepository;
import org.springframework.data.domain.Page;
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
    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final Cloudinary cloudinary;

    public FolderService(FolderRepository folderRepository, UserRepository userRepository, FileRepository fileRepository, Cloudinary cloudinary) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.cloudinary = cloudinary;
    }

    public String createFolder(UUID parentId, FolderCreation creation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users users =  userRepository.findByUsername(authentication.getName());
        Folder parentFolder = null;

        if (parentId != null) {
            parentFolder = folderRepository
                    .findByIdAndOwner(parentId, users)
                    .orElseThrow(() ->
                            new RuntimeException("Invalid parent folder"));
        }
        Folder folder = Folder.builder()
                .folderName(creation.getFolderName())
                .parentFolder(parentFolder)
                .owner(users)
                .build();
        folderRepository.save(folder);
        return "Folder Successfully Created";

    }

    public FolderContents getAllContents(UUID parentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users users = userRepository.findByUsername(authentication.getName());
        List<FolderDetails> folderDetails = null;
        List<FileDetails> fileDetails = null;
        if(parentId==null){
            folderDetails = folderRepository.findByOwnerIdAndParentFolderIsNull(users.getId());
            fileDetails = fileRepository.findByOwnerIdAndFolderIsNull(users.getId());
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
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        Folder folder = null;
        if (folderId!=null){
            folder = folderRepository.findById(folderId).orElseThrow(()->new RuntimeException("Invalid Folder"));
            if (!folder.getOwner().getId().equals(user.getId())){
                throw new RuntimeException("Invalid Access");
            }
        }

        if (user.getStorageUsed()+file.getSize()>user.getStorageLimit()){
            throw new RuntimeException("Not enough Space");
        }

        Map upload = cloudinary.uploader().upload(file.getBytes(),ObjectUtils.asMap(
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
                .owner(user)
                .publicId(publicId)
                .folder(folder)
                .build();
        user.setStorageUsed(user.getStorageUsed()+file.getSize());
        userRepository.save(user);
        fileRepository.save(storedFile);
        return "Save Success";

    }

    public String renameFolder(UUID folderId, String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int rows = folderRepository.updateFolderName(folderId, name, username);
        if (rows==0){
            throw new RuntimeException("Rename Failed");
        }
        return "Rename Success";

    }

    public String renameFile(UUID fileId, String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int rows = fileRepository.updateFolderName(fileId, name, username);
        if (rows==0){
            throw new RuntimeException("Rename Failed");
        }
        return "Rename Success";
    }
    public String deleteFile(UUID fileId) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        StoredFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        if (!file.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }
        cloudinary.uploader().destroy(file.getPublicId(), ObjectUtils.asMap(
                "resource_type", file.getResourceType()
        ));
        long updatedStorage = user.getStorageUsed() - file.getSize();
        user.setStorageUsed(Math.max(0L, updatedStorage));
        userRepository.save(user);
        fileRepository.delete(file);

        return "File Deleted Successfully";
    }

    public FolderContents searchKeyword(String query) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users users = userRepository.findByUsername(authentication.getName());
        List<FolderDetails> folderDetails = null;
        List<FileDetails> fileDetails = null;
        folderDetails = folderRepository.findByKeywordAndOwner(query, users.getId());
        fileDetails = fileRepository.findByKeywordAndOwner(query, users.getId());


        FolderContents contents = FolderContents.builder()
                .allFolders(folderDetails)
                .allFiles(fileDetails).build();
        return contents;

    }

    @Transactional
    public String deleteFolder(UUID folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);

        Folder folder = folderRepository.findByIdAndOwner(folderId, user)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        folderRepository.unlinkChildFolders(folder, user);
        fileRepository.unlinkChildFiles(folder, user);
        folderRepository.delete(folder);
        return "Folder Deleted Successfully";
    }
}
