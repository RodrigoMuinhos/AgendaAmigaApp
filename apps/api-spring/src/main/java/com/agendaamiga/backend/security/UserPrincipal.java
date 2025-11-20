package com.agendaamiga.backend.security;

import com.agendaamiga.backend.domain.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class UserPrincipal implements UserDetails {
    private final UUID id;
    private final String username;
    private final String password;

    private UserPrincipal(UUID id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getId().toString(), user.getSenhaHash());
    }

    public UUID getId() {
        return id;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
