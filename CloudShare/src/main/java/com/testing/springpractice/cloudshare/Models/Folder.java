package com.testing.springpractice.cloudshare.Models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
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
    @ManyToOne
    @JoinColumn(name = "parent_folder_id", nullable = true)
    private Folder parentFolder;
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private Users owner;
    @CreationTimestamp
    private LocalDateTime creationTime;

}
