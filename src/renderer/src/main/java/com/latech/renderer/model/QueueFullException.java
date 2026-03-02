package com.latech.renderer.model;

public class QueueFullException extends RuntimeException {
    public QueueFullException(String msg) { super(msg); }
}
