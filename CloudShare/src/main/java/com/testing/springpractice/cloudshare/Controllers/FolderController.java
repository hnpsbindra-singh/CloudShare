package com.testing.springpractice.cloudshare.Controllers;

import com.testing.springpractice.cloudshare.Configurations.VerifiedUser;
import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FolderContents;
import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FolderCreation;
import com.testing.springpractice.cloudshare.Service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/folder")
@VerifiedUser
public class FolderController {
    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    public String createFolder(@RequestParam(required = false) UUID parentId, @Valid @RequestBody FolderCreation creation){
        return folderService.createFolder(parentId, creation);
    }

    @GetMapping
    public FolderContents getAllContents(@RequestParam(required = false) UUID parentId){
        return folderService.getAllContents(parentId);
    }

    @GetMapping("/file/{fileId}")
    public String getFile(@PathVariable UUID fileId){
        return folderService.getFile(fileId);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String UploadFIle(
            @RequestParam("file")MultipartFile file,
            @RequestParam(required = false) UUID folderId
            ) throws IOException {
        return folderService.upload(file, folderId);
    }

    @PatchMapping("/{folderId}")
    public String renameFolder(@PathVariable UUID folderId, @RequestParam String name){
        return folderService.renameFolder(folderId, name);
    }

    @PatchMapping("/file/{fileId}")
    public String renameFile(@PathVariable UUID fileId, @RequestParam String name){
        return folderService.renameFile(fileId, name);
    }

    @DeleteMapping("/file/{fileId}")
    public String deleteFile(@PathVariable UUID fileId) throws IOException {
        return folderService.deleteFile(fileId);
    }

    @GetMapping("/files/search")
    public FolderContents searchKeyWord(@RequestParam String query){
        return folderService.searchKeyword(query);
    }

    @DeleteMapping("/{folderId}")
    public String deleteFolder(@PathVariable UUID folderId){
        System.out.println("Enter");
        return folderService.deleteFolder(folderId);
    }


}
