package com.testing.springpractice.cloudshare.Repositories;

import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FolderDetails;
import com.testing.springpractice.cloudshare.Models.Folder;
import com.testing.springpractice.cloudshare.Models.Users;
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
    Optional<Folder> findByIdAndOwner(UUID parentId, Users users);

    @Query("select " +
            "f.id as id," +
            "f.folderName as folderName," +
            "f.owner.name as ownerName," +
            "f.creationTime as creationTime " +
            "from Folder f " +
            "where f.parentFolder.id = :id order by f.creationTime desc")
    List<FolderDetails> findByParentFolderId(UUID id);

    @Query("select " +
            "f.id as id," +
            "f.folderName as folderName," +
            "f.owner.name as ownerName," +
            "f.creationTime as creationTime "  +
            "from Folder f " +
            "where f.owner.id = :ownerId AND f.parentFolder.id is null order by f.creationTime desc")
    List<FolderDetails> findByOwnerIdAndParentFolderIsNull(UUID ownerId);

    @Modifying
    @Transactional
    @Query("UPDATE Folder f " +
            "set f.folderName = :name " +
            "where f.id = :folderId AND f.owner.username = :username")
    int updateFolderName(UUID folderId, String name, String username);

    @Query("select f.id as id," +
            "f.folderName as folderName," +
            "f.owner.name as ownerName," +
            "f.creationTime as creationTime " +
            "from Folder f " +
            "where f.owner.id = :id AND lower(f.folderName) LIKE lower(concat( '%', :query, '%')) " +
            "ORDER BY f.creationTime desc ")
    List<FolderDetails> findByKeywordAndOwner(String query, UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE Folder f SET f.parentFolder = null WHERE f.parentFolder = :folder AND f.owner = :owner")
    int unlinkChildFolders(Folder folder, Users owner);
}
