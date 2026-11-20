package com.tarea.tarea.services;

import com.tarea.tarea.models.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AvistamientoService {

    private final AvistamientoRepository avistamientoRepository;
    private final NotaRepository notaRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public AvistamientoService(AvistamientoRepository avistamientoRepository, NotaRepository notaRepository) {
        this.avistamientoRepository = avistamientoRepository;
        this.notaRepository = notaRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> buscarAvistamientos(String q) {
        if (q == null || q.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<Avistamiento> avistamientos = avistamientoRepository.buscarPorTermino(q.trim());
        List<Map<String, Object>> resultados = new ArrayList<>();

        for (Avistamiento a : avistamientos) {
            String dia = a.getFechaHora() != null ? a.getFechaHora().format(dateFormatter) : "-";
            String nombreVoluntario = a.getVoluntario() != null ? a.getVoluntario().getNombre() : "-";
            String nombreAve = a.getAve() != null ? a.getAve().getNombre() : "-";
            String nombreComuna = (a.getVoluntario() != null && a.getVoluntario().getComuna() != null)
                    ? a.getVoluntario().getComuna().getNombre()
                    : "-";

            String notaPromedio = calcularNotaPromedioTexto(a.getNotas());

            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("nombreVoluntario", nombreVoluntario);
            item.put("diaAvistamiento", dia);
            item.put("nombreAve", nombreAve);
            item.put("nombreComuna", nombreComuna);
            item.put("notaPromedio", notaPromedio);

            resultados.add(item);
        }

        return resultados;
    }

    @Transactional
    public Map<String, Object> agregarNota(Integer avistamientoId, Integer valorNota) {
        if (valorNota == null || valorNota < 1 || valorNota > 7) {
            throw new IllegalArgumentException("La nota debe ser un número entero entre 1 y 7.");
        }

        Avistamiento avistamiento = avistamientoRepository.findById(avistamientoId)
                .orElseThrow(() -> new IllegalArgumentException("Avistamiento no encontrado con id: " + avistamientoId));

        Nota nuevaNota = new Nota(avistamiento, valorNota);
        notaRepository.save(nuevaNota);

        Double promedio = notaRepository.obtenerPromedioPorAvistamiento(avistamientoId);
        String promedioStr = (promedio != null) ? String.format(Locale.US, "%.1f", promedio) : "-";

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("avistamientoId", avistamientoId);
        respuesta.put("nuevaNotaPromedio", promedioStr);
        respuesta.put("mensaje", "Nota registrada exitosamente.");
        return respuesta;
    }

    private String calcularNotaPromedioTexto(List<Nota> notas) {
        if (notas == null || notas.isEmpty()) {
            return "-";
        }
        double suma = 0.0;
        for (Nota n : notas) {
            suma += n.getNota();
        }
        double promedio = suma / notas.size();
        return String.format(Locale.US, "%.1f", promedio);
    }
}
