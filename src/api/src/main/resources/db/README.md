# Database Migration Strategy for Oculos

This document outlines the database migration strategy using Flyway for the Oculos application.

## Overview

We use Flyway to manage database schema changes in a version-controlled, predictable manner. Each change to the database
schema is represented by a SQL migration script that is applied in order.

## Migration Naming Convention

Migration scripts follow this naming convention:

```
V{version}__{description}.sql
```

- `{version}` is a version number (e.g., 1, 2, 3.1, 3.2)
- `{description}` is a brief description of the migration using underscores instead of spaces

For example: `V1.0.0__initial_schema.sql`, `V2.0.0__add_user_preferences.sql`

## Creating New Migrations

When you need to make changes to the database schema:

1. Create a new migration script in `src/main/resources/db/migration/`
2. Name it with the next sequential version number
3. Write SQL statements to implement your changes
4. Test the migration locally before committing

## Best Practices

1. **Never modify existing migration scripts** - Once a migration script has been applied to any environment, it should
   never be modified.
2. **Keep migrations small and focused** - Each migration should represent a single logical change.
3. **Include both "up" and "down" logic** - When possible, include comments on how to revert the changes.
4. **Test migrations thoroughly** - Test each migration script locally before committing.
5. **Document complex migrations** - Add comments to explain complex changes.

## Handling Entity Changes

When you modify an entity class:

1. Create a new migration script to update the corresponding database table
2. Update the entity class
3. Ensure that Hibernate validation passes with the updated schema

## Running Migrations

Migrations run automatically when the application starts. To run migrations manually:

```bash
./gradlew flywayMigrate
```

To get information about the migration status:

```bash
./gradlew flywayInfo
```

## Troubleshooting

If you encounter migration issues:

1. Check the Flyway schema history table (`flyway_schema_history`)
2. Ensure that migration scripts are properly formatted
3. Verify that the database user has sufficient privileges
4. Check for syntax errors in your SQL scripts
