package com.testing.springpractice.userauthservice.Configurations;

import com.testing.springpractice.userauthservice.DataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Autowired
    RedisConnectionFactory redisConnectionFactory;

    @Bean
    public RedisTemplate<String, String> redisTemplate(){
        RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }
    @Bean
    public RedisTemplate<String, RegisterRequest> registerRequestRedisTemplate(){
        RedisTemplate<String, RegisterRequest> requestRedisTemplate = new RedisTemplate<>();
        JacksonJsonRedisSerializer<RegisterRequest> jsonRedisSerializer = new JacksonJsonRedisSerializer<>(RegisterRequest.class);
        requestRedisTemplate.setConnectionFactory(redisConnectionFactory);
        requestRedisTemplate.setKeySerializer(new StringRedisSerializer());
        requestRedisTemplate.setValueSerializer(jsonRedisSerializer);
        requestRedisTemplate.setHashKeySerializer(new StringRedisSerializer());
        requestRedisTemplate.setHashValueSerializer(jsonRedisSerializer);
        return requestRedisTemplate;
    }
    @Bean
    CacheManager cacheManager(){
        RedisCacheConfiguration cacheConfiguration = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5));
        return RedisCacheManager
                .builder(redisConnectionFactory)
                .cacheDefaults(cacheConfiguration)
                .build();
    }
}
