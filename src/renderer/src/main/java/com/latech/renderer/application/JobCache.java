package com.latech.renderer.application;

import com.latech.renderer.model.Entry;
import com.latech.renderer.model.State;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JobCache {
    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    public void queued(String id) { store.put(id, new Entry(State.QUEUED, "", Optional.empty())); }
    public void running(String id) { store.put(id, new Entry(State.RUNNING, "", Optional.empty())); }
    public void done(String id, Path pdfPath) { store.put(id, new Entry(State.DONE, "", Optional.ofNullable(pdfPath))); }
    public void failed(String id, String msg) { store.put(id, new Entry(State.FAILED, msg, Optional.empty())); }
    public Optional<Entry> get(String id) { return Optional.ofNullable(store.get(id)); }
    public void deleteEntry(String id) { store.remove(id); }
}
