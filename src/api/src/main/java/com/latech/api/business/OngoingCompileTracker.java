package com.latech.api.business;


import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OngoingCompileTracker {

    private final Set<UUID> ongoingCompileJobs;

    public OngoingCompileTracker () {
        this.ongoingCompileJobs = Collections.newSetFromMap( new ConcurrentHashMap<>() );
    }

    public boolean tryStartJob ( UUID documentId ) {
        return this.ongoingCompileJobs.add( documentId );
    }

    public void jobFinished ( UUID documentId ) {
        this.ongoingCompileJobs.remove( documentId );
    }
}
