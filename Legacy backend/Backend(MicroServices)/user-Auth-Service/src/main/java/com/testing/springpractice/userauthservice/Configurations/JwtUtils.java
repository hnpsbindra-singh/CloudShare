package com.testing.springpractice.userauthservice.Configurations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtils {
    @Value("${jwt.secret}")
    private String jwtSecret;
    @Value("${jwt.expiration}")
    private Long expiration;

    public Key getSignedKey(){
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    public String getToken(String username, Boolean verified, UUID userId){
        return Jwts.builder().signWith(getSignedKey())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+expiration))
                .setSubject(username)
                .claim("verified", verified)
                .claim("userId", userId.toString())
                .compact();
    }

    public Claims getClaims(String token){
        return Jwts.parser().setSigningKey(getSignedKey())
                .build().parseClaimsJws(token).getBody();
    }
    public String getUsername(String token){
        return getClaims(token).getSubject();
    }
    public Date getExpiration(String token){
        return getClaims(token).getExpiration();
    }
    public boolean isExpired(String token){
        return getClaims(token).getExpiration().before(new Date());
    }

}
