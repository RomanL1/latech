package com.latech.api.repository;

import com.latech.api.model.db.RenderHistory;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RenderHistoryRepository extends JpaRepository<RenderHistory, UUID> {
    List<RenderHistory> findByDocumentIdOrderByRenderedAtDesc ( UUID documentId, Limit limit );
}
