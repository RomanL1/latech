package com.latech.renderer.application;

import com.latech.renderer.model.Entry;
import com.latech.renderer.model.State;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JobStore {
    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    public void queued(String id) { store.put(id, new Entry(State.QUEUED, "", null)); }
    public void running(String id) { store.put(id, new Entry(State.RUNNING, "", null)); }
    //TODO(marc): probably shouldn't store entire pdf, instead store only a path to the file.
    public void done(String id, byte[] pdf) { store.put(id, new Entry(State.DONE, "", pdf)); }
    public void failed(String id, String msg) { store.put(id, new Entry(State.FAILED, msg, null)); }
    public Optional<Entry> get(String id) { return Optional.ofNullable(store.get(id)); }
    public void deleteEntry(String id) { store.remove(id); }
}
