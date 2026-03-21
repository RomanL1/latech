package com.latech.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.latech.api.model.db.Document;
import com.latech.api.model.db.Template;

public interface TemplateRepository extends JpaRepository<Template, UUID>
{
}
