package com.latech.api.repository;

import com.latech.api.model.db.RenderHistory;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RenderHistoryRepository extends JpaRepository<RenderHistory, UUID> {
    List<RenderHistory> findByDocumentIdOrderByRenderedAtDesc ( UUID documentId, Limit limit );

    @Modifying
    @Query( value = """
            DELETE FROM render_history
            WHERE document_id = :documentId
            AND id NOT IN (
                SELECT id FROM render_history
                WHERE document_id = :documentId
                ORDER BY rendered_at DESC
                LIMIT 10
            )
            """, nativeQuery = true )
    void deleteOldEntriesForDocument ( @Param( "documentId" ) UUID documentId );
}
