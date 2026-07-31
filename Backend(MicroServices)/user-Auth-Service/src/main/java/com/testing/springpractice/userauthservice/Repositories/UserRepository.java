package com.testing.springpractice.userauthservice.Repositories;

import com.testing.springpractice.userauthservice.DataTranseferObjects.AuthDataTransferObjects.ProfileResponse;
import com.testing.springpractice.userauthservice.DataTranseferObjects.UserDataTransferObjects.StorageDTO;
import com.testing.springpractice.userauthservice.DataTranseferObjects.UserStorageDto;
import com.testing.springpractice.userauthservice.Models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, UUID> {
    Users findByUsername(String username);

    boolean existsByUsername(String trim);

    @Modifying
    @Transactional
    @Query("update Users u " +
            "set u.password = :password " +
            "where u.username = :username")
    int updatepasswordForusername(String password,String username);


    @Query("select u.storageLimit as storageLimit," +
            "u.storageUsed as storageUsed " +
            "from Users u " +
            "where u.username = :username")
    StorageDTO getStorageDetails(String username);

    @Query("select u.id as id," +
            "u.name as name," +
            "u.username as username," +
            "u.mobile as phoneNumber " +
            "from Users u " +
            "where u.username = :username")
    ProfileResponse getProfileDetails(String username);

    @Modifying
    @Transactional
    @Query("UPDATE Users u " +
            "set u.mobile = :phoneNumber," +
            "u.name = :name " +
            "where u.username = :username ")
    int updateProfile(String phoneNumber, String name, String username);

    @Query("select new com.testing.springpractice.userauthservice.DataTranseferObjects.UserStorageDto(" +
            "u.id," +
            "u.storageUsed," +
            "u.storageLimit) " +
            "from Users u " +
            "where u.id = :id")
    UserStorageDto getUserStorageDetails(UUID id);

    @Modifying
    @Transactional
    @Query("update Users u " +
            "set u.storageUsed = :bytes where u.id = :id")
    int updateStorage(UUID id, Long bytes);
}
