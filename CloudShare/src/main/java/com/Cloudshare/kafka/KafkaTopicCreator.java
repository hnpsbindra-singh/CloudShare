package com.Cloudshare.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicCreator {
    @Bean
    public NewTopic sendOtp(){
        return TopicBuilder.name("Send-Otp")
                .partitions(5)
                .replicas(3)
                .build();
    }
    @Bean
    public NewTopic notificationService(){
        //TODO:This will be used when i create a Notification service(MAYBE NEVER)
        return TopicBuilder.name("Notification-Service")
                .partitions(5)
                .replicas(3)
                .build();
    }
}
