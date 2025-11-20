package com.agendaamiga.backend.controller;

import com.agendaamiga.backend.dto.treatment.TreatmentRequest;
import com.agendaamiga.backend.dto.treatment.TreatmentResponse;
import com.agendaamiga.backend.service.TreatmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tratamentos")
public class TreatmentController {
    private final TreatmentService treatmentService;

    public TreatmentController(TreatmentService treatmentService) {
        this.treatmentService = treatmentService;
    }

    @GetMapping
    public ResponseEntity<List<TreatmentResponse>> listTreatments() {
        return ResponseEntity.ok(treatmentService.findAll());
    }

    @PostMapping
    public ResponseEntity<TreatmentResponse> create(@Valid @RequestBody TreatmentRequest request) {
        final TreatmentResponse response = treatmentService.create(request);
        return ResponseEntity.status(201).body(response);
    }
}
