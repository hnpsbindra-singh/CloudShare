package com.testing.springpractice.userauthservice.DataTranseferObjects.EmailDataTransferObjects;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sender {
    private String name;
    private String email;
}
