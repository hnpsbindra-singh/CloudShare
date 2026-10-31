package com.Cloudshare.service.serviceImpl;

import com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects.*;
import com.Cloudshare.dataTranseferObjects.FolderDataTransferObjects.*;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.Cloudshare.models.Folder;
import com.Cloudshare.models.StoredFile;
import com.Cloudshare.models.Users;
import com.Cloudshare.repositories.FileRepository;
import com.Cloudshare.repositories.FolderRepository;
import com.Cloudshare.repositories.UserRepository;
import com.Cloudshare.service.serviceInterface.FolderService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MimeType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FolderServiceImpl implements FolderService {
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final Cloudinary cloudinary;
    private final ChatClient chatClient;

    public FolderServiceImpl(FolderRepository folderRepository, UserRepository userRepository, FileRepository fileRepository, Cloudinary cloudinary, ChatClient chatClient) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.cloudinary = cloudinary;
        this.chatClient = chatClient;
    }

    public String createFolder(UUID parentId, FolderCreation creation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users users =  userRepository.findByUsername(authentication.getName());
        Folder parentFolder = null;

        if (parentId != null) {
            parentFolder = folderRepository
                    .findByIdAndOwner(parentId, users)
                    .orElseThrow(() ->
                            new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid parent folder"));
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

    @Cacheable(value = "files", key = "#fileId")
    public FileReturnDTO getFile(UUID fileId) {
        FileReturnDTO publicUrl = fileRepository.findPublicUrlByFileId(fileId);
        return publicUrl;
    }

    public String upload(MultipartFile file, UUID folderId) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        Folder folder = null;
        if (folderId!=null){
            folder = folderRepository.findById(folderId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid Folder"));
            if (!folder.getOwner().getId().equals(user.getId())){
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Access");
            }
        }

        if (user.getStorageUsed()+file.getSize()>user.getStorageLimit()){
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "Not enough Space");
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
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rename Failed");
        }
        return "Rename Success";

    }

    @CacheEvict(value = "files", key = "#fileId")
    public String renameFile(UUID fileId, String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int rows = fileRepository.updateFolderName(fileId, name, username);
        if (rows==0){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Rename Failed");
        }
        return "Rename Success";
    }
    @CacheEvict(
            value = "files",
            key = "#fileId"
    )
    public String deleteFile(UUID fileId) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        StoredFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        folderRepository.unlinkChildFolders(folder, user);
        fileRepository.unlinkChildFiles(folder, user);
        folderRepository.delete(folder);
        return "Folder Deleted Successfully";
    }

    @Cacheable(value = "SummaryCache", key = "#fileId")
    public String summariseFile(UUID fileId) {
        StoredFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Users userLoggedin = userRepository.findByUsername(auth.getName());
        if (!file.getOwner().getId().equals(userLoggedin.getId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Access denied: You do not own this file");
        }
        ChatResponse response = chatClient.prompt()
                .advisors(user->user
                        .param(ChatMemory.CONVERSATION_ID, fileId.toString()))
                .user(user-> {
                    try {
                        user
                                .text("You are a file Summariser Expert, Summarise the file in Not More than 50-60 word")
                                .media(MimeType.valueOf(file.getMimeType()),
                                        new UrlResource(file.getPublicUrl()));
                    } catch (MalformedURLException e) {
                        throw new RuntimeException(e);
                    }
                })
                .call()
                .chatResponse();
        return response.getResult().getOutput().getText();

    }
}
