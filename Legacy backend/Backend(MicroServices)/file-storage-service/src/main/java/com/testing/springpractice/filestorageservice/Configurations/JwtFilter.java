package com.testing.springpractice.filestorageservice.Configurations;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {


    private final JwtUtils jwtUtils;


    public JwtFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader("Authorization");
        String jwt = null;
        if (request.getRequestURI().startsWith("/api/auth")){
            filterChain.doFilter(request, response);
            return;
        }
        if (token!=null&&token.startsWith("Bearer")){
            jwt = token.substring(7);
        }
        if (jwt!=null&& SecurityContextHolder.getContext().getAuthentication()==null){
            Claims claims = jwtUtils.getClaims(jwt);
            String username = claims.getSubject();
            if (username!=null&&!jwtUtils.isExpired(jwt)&&claims.get("verified", Boolean.class)){
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                        claims.get("userId", String.class), jwt, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                ));
            }
        }
        filterChain.doFilter(request,response);
    }
}
