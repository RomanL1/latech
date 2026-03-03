package com.latech.renderer.model;

import java.nio.file.Path;
import java.util.Optional;

public record Entry(State state, String message, Optional<Path> pdfPath) {}

