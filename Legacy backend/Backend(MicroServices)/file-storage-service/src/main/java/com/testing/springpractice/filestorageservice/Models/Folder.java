package com.testing.springpractice.filestorageservice.Models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String folderName;
    @JoinColumn(name = "parent_folder_id", nullable = true)
    private UUID parentFolderId;
    @JoinColumn(name = "owner_id", nullable = false)
    private UUID ownerId;
    @CreationTimestamp
    private LocalDateTime creationTime;

}
