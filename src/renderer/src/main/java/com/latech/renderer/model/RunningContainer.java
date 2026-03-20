package com.latech.renderer.model;

import java.nio.file.Path;

public record RunningContainer(String id, Process process, Path folder) {
}
