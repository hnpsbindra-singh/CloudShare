package com.testing.springpractice.userauthservice.DataTranseferObjects;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserStorageDto {
    private UUID userId;
    private Long storageUsed;
    private Long storageLimit;
}