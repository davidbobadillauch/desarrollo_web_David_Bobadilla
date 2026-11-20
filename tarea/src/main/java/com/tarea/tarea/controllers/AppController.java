package com.tarea.tarea.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppController {

    @GetMapping({"/", "/buscador"})
    public String index() {
        return "buscador";
    }
}
