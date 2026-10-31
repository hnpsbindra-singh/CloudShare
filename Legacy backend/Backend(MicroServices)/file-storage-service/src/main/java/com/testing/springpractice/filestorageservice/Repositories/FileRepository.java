package com.testing.springpractice.filestorageservice.Repositories;

import com.testing.springpractice.filestorageservice.DataTranseferObjects.FolderDataTransferObjects.FileDetails;
import com.testing.springpractice.filestorageservice.Models.StoredFile;
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
            "f.ownerId as ownerId," +
            "f.creationTime as creationTime " +
            "from StoredFile f " +
            "where f.folderId= :id " +
            "order by f.creationTime desc")
    List<FileDetails> findByFolder_Id(UUID id);

    @Query("select " +
            "f.id as id," +
            "f.name as name," +
            "f.ownerId as ownerId," +
            "f.creationTime as creationTime " +
            "from StoredFile f " +
            "where f.ownerId = :ownerId AND f.folderId is null " +
            "order by f.creationTime desc")
    List<FileDetails> findByOwnerIdAndFolderIsNull(UUID ownerId);

    @Query("SELECT f.publicUrl from StoredFile f where f.id = :id")
    String findPublicUrlByFileId(UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE StoredFile f " +
            "set f.name = :name " +
            "where f.id = :fileId AND f.ownerId = :userId")
    int updateFolderName(UUID fileId, String name, UUID userId);

    @Query("select f.id as id," +
            "f.name as name," +
            "f.ownerId as ownerId," +
            "f.creationTime as creationTime " +
            "from StoredFile f " +
            "where f.ownerId = :id AND lower(f.name) LIKE lower(concat( '%', :query, '%')) " +
            "order by f.creationTime desc")
    List<FileDetails> findByKeywordAndOwner(String query, UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE StoredFile f SET f.folderId = null WHERE f.folderId = :folderId AND f.ownerId = :ownerId")
    int unlinkChildFiles(UUID folderId, UUID ownerId);
}
