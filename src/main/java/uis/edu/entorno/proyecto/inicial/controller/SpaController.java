// src/main/java/uis/edu/entorno/proyecto/inicial/controller/SpaController.java
package uis.edu.entorno.proyecto.inicial.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        // Forward to home page so that route is preserved.
        return "forward:/";
    }
}