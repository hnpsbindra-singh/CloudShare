package com.testing.springpractice.filestorageservice.Repositories;

import com.testing.springpractice.filestorageservice.DataTranseferObjects.FolderDataTransferObjects.FolderDetails;
import com.testing.springpractice.filestorageservice.Models.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {
    Optional<Folder> findByIdAndOwnerId(UUID parentId, UUID userID);

    @Query("select " +
            "f.id as id," +
            "f.folderName as folderName," +
            "f.ownerId as ownerId," +
            "f.creationTime as creationTime " +
            "from Folder f " +
            "where f.parentFolderId = :id order by f.creationTime desc")
    List<FolderDetails> findByParentFolderId(UUID id);

    @Query("select " +
            "f.id as id," +
            "f.folderName as folderName," +
            "f.ownerId as ownerId," +
            "f.creationTime as creationTime "  +
            "from Folder f " +
            "where f.ownerId = :ownerId AND f.parentFolderId is null order by f.creationTime desc")
    List<FolderDetails> findByOwnerIdAndParentFolderIsNull(UUID ownerId);

    @Modifying
    @Transactional
    @Query("UPDATE Folder f " +
            "set f.folderName = :name " +
            "where f.id = :folderId AND f.ownerId = :userId")
    int updateFolderName(UUID folderId, String name, UUID userId);

    @Query("select f.id as id," +
            "f.folderName as folderName," +
            "f.ownerId as ownerId," +
            "f.creationTime as creationTime " +
            "from Folder f " +
            "where f.ownerId = :id AND lower(f.folderName) LIKE lower(concat( '%', :query, '%')) " +
            "ORDER BY f.creationTime desc ")
    List<FolderDetails> findByKeywordAndOwner(String query, UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE Folder f SET f.parentFolderId = null WHERE f.parentFolderId = :folderId AND f.ownerId = :ownerId")
    int unlinkChildFolders(UUID folderId, UUID ownerId);
}
