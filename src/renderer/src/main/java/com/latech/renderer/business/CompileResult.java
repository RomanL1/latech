package com.latech.renderer.business;

import java.nio.file.Path;

public record CompileResult(boolean success, Path pdfPath, String output) {}
