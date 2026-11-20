package com.tarea.tarea.controllers;

import com.tarea.tarea.services.AvistamientoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avistamientos")
public class ApiController {
    private final AvistamientoService avistamientoService;
    public ApiController(AvistamientoService avistamientoService) {
        this.avistamientoService = avistamientoService;
    }

   
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> buscar(@RequestParam(name = "q", required = false, defaultValue = "") String q) {
        List<Map<String, Object>> resultados = avistamientoService.buscarAvistamientos(q);
        return ResponseEntity.ok(resultados);
    }


    @PostMapping("/{id}/nota")
    public ResponseEntity<?> registrarNota(@PathVariable("id") Integer id,
                                           @RequestBody Map<String, Object> body) {
        try {
            if (body == null || !body.containsKey("nota")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Debe proporcionar una nota."));
            }

            Object notaObj = body.get("nota");
            Integer nota;
            if (notaObj instanceof Number) {
                nota = ((Number) notaObj).intValue();
            } else {
                try {
                    nota = Integer.parseInt(notaObj.toString());
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "La nota debe ser un número entero entre 1 y 7."));
                }
            }

            Map<String, Object> respuesta = avistamientoService.agregarNota(id, nota);
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno al procesar la nota."));
        }
    }
}
