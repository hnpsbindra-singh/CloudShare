package com.testing.springpractice.cloudshare.Repositories;

import com.testing.springpractice.cloudshare.DataTranseferObjects.FolderDataTransferObjects.FileDetails;
import com.testing.springpractice.cloudshare.Models.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface FileRepository extends JpaRepository<StoredFile, UUID> {
    @Query("select " +
            "f.id as id," +
            "f.name as name," +
            "f.owner.name as ownerName," +
            "f.creationTime as creationTime " +
            "from StoredFile f " +
            "where f.folder.id = :id " +
            "order by f.creationTime desc")
    List<FileDetails> findByFolder_Id(UUID id);

    @Query("select " +
            "f.id as id," +
            "f.name as name," +
            "f.owner.name as ownerName," +
            "f.creationTime as creationTime " +
            "from StoredFile f " +
            "where f.owner.id = :ownerId AND f.folder.id is null " +
            "order by f.creationTime desc")
    List<FileDetails> findByOwnerIdAndFolderIsNull(UUID ownerId);

    @Query("SELECT f.publicUrl from StoredFile f where f.id = :id")
    String findPublicUrlByFileId(UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE StoredFile f " +
            "set f.name = :name " +
            "where f.id = :fileId AND f.owner.username = :username")
    int updateFolderName(UUID fileId, String name, String username);

    @Query("select f.id as id," +
            "f.name as name," +
            "f.owner.name as ownerName," +
            "f.creationTime as creationTime " +
            "from StoredFile f " +
            "where f.owner.id = :id AND lower(f.name) LIKE lower(concat( '%', :query, '%')) " +
            "order by f.creationTime desc")
    List<FileDetails> findByKeywordAndOwner(String query, UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE StoredFile f SET f.folder = null WHERE f.folder = :folder AND f.owner = :owner")
    int unlinkChildFiles(@org.springframework.data.repository.query.Param("folder") com.testing.springpractice.cloudshare.Models.Folder folder, @org.springframework.data.repository.query.Param("owner") com.testing.springpractice.cloudshare.Models.Users owner);
}
