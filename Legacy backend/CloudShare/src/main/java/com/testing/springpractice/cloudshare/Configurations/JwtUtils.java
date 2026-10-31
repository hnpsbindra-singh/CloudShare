package com.testing.springpractice.cloudshare.Configurations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    @Value("${jwt.secret}")
    private String jwtSecret;
    @Value("${jwt.expiration}")
    private Long expiration;

    public Key getSignedKey(){
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    public String getToken(String username){
        return Jwts.builder().signWith(getSignedKey())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+expiration))
                .setSubject(username)
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
