package com.agendaamiga.backend.controller;

import com.agendaamiga.backend.dto.child.ChildRequest;
import com.agendaamiga.backend.dto.child.ChildResponse;
import com.agendaamiga.backend.security.UserPrincipal;
import com.agendaamiga.backend.service.ChildService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/criancas")
public class ChildController {
    private final ChildService childService;

    public ChildController(ChildService childService) {
        this.childService = childService;
    }

    @GetMapping
    public ResponseEntity<List<ChildResponse>> listChildren(Authentication authentication) {
        final UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(childService.findByTutor(principal.getId().toString()));
    }

    @PostMapping
    public ResponseEntity<ChildResponse> createChild(Authentication authentication,
        @Valid @RequestBody ChildRequest request) {
        final UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        final ChildResponse response = childService.createChild(principal.getId().toString(), request);
        return ResponseEntity.status(201).body(response);
    }
}
