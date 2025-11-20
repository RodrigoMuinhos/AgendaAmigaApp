package com.agendaamiga.backend.controller;

import com.agendaamiga.backend.dto.family.FamilyRequest;
import com.agendaamiga.backend.dto.family.FamilyResponse;
import com.agendaamiga.backend.service.FamilyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/familias")
public class FamilyController {
    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping
    public ResponseEntity<List<FamilyResponse>> listFamilies() {
        return ResponseEntity.ok(familyService.findAllFamilies());
    }

    @PostMapping
    public ResponseEntity<FamilyResponse> createFamily(@Valid @RequestBody FamilyRequest request) {
        final FamilyResponse response = familyService.createFamily(request);
        return ResponseEntity.status(201).body(response);
    }
}
