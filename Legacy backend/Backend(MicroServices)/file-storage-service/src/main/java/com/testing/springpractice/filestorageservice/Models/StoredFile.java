package com.testing.springpractice.filestorageservice.Models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoredFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String publicUrl;
    private String mimeType;
    private String resourceType;
    private Long size;
    @JoinColumn(name = "owner_id", nullable = false)
    private UUID ownerId;
    @JoinColumn(name = "folder_id", nullable = true)
    private UUID folderId;
    @CreationTimestamp
    private LocalDateTime creationTime;
    private String publicId;


}
