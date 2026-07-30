package com.testing.springpractice.cloudshare.DataTranseferObjects.EmailDataTransferObjects;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailRequest {
    private Sender sender;
    private List<Receiver> to;
    private String subject;
    private String htmlContent;
}
