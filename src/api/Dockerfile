FROM eclipse-temurin:25-jdk-jammy AS build

WORKDIR /app

# Copy wrapper and basic project files
COPY gradle/ ./gradle/
COPY gradlew build.gradle settings.gradle ./

# Make gradlew executable and download gradle distribution to cache it
RUN chmod +x gradlew
RUN ./gradlew --version

# Download dependencies to cache them
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build
COPY src/ ./src/
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:25-jre
WORKDIR /app

ARG FRONTEND_URL

# Environment variables from application.properties
ENV SPRING_APPLICATION_NAME="latech-api"
ENV RENDERER_URL="http://renderer:8090"
ENV FRONTEND_URL=$FRONTEND_URL

# API Documentation (JSON/YAML)
ENV SPRINGDOC_API_DOCS_PATH="/api-docs"
ENV SPRINGDOC_API_DOCS_ENABLED="true"
ENV SPRINGDOC_API_DOCS_VERSION="openapi_3_1"

# Swagger UI Configuration
ENV SPRINGDOC_SWAGGER_UI_PATH="/swagger-ui.html"
ENV SPRINGDOC_SWAGGER_UI_ENABLED="true"
ENV SPRINGDOC_SWAGGER_UI_OPERATIONS_SORTER="alpha"
ENV SPRINGDOC_SWAGGER_UI_TAGS_SORTER="alpha"
ENV SPRINGDOC_SWAGGER_UI_TRY_IT_OUT_ENABLED="true"

# Database Configuration
ENV SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/latech"
ENV SPRING_DATASOURCE_USERNAME="myuser"
ENV SPRING_DATASOURCE_PASSWORD="secret"
ENV SPRING_DATASOURCE_DRIVER_CLASS_NAME="org.postgresql.Driver"
ENV SPRING_JPA_DATABASE_PLATFORM="org.hibernate.dialect.PostgreSQLDialect"
ENV SPRING_JPA_PROPERTIES_HIBERNATE_BOOT_ALLOW_JDBC_METADATA_ACCESS="true"
ENV SPRING_JPA_PROPERTIES_HIBERNATE_JDBC_TIME_ZONE="UTC"
ENV SPRING_SQL_INIT_MODE="never"
ENV SPRING_JPA_HIBERNATE_DDL_AUTO="validate"
ENV LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_BOOT_AUTOCONFIGURE="INFO"
ENV LOGGING_LEVEL_ORG_HIBERNATE_SQL="DEBUG"
ENV LOGGING_LEVEL_ORG_HIBERNATE_TYPE_DESCRIPTOR_SQL_BASICBINDER="TRACE"
ENV SPRING_JPA_SHOW_SQL="true"
ENV SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL="false"

# Multipart uploads
ENV SPRING_SERVLET_MULTIPART_ENABLED="true"
ENV SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE="10MB"
ENV SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE="15MB"

# RabbitMQ Configuration
ENV RABBITMQ_HOST="localhost"
ENV RABBITMQ_PORT="5672"
ENV RABBITMQ_USERNAME="admin"
ENV RABBITMQ_PASSWORD="your_secure_password_here"

EXPOSE ${PORT:-8080}

COPY --from=build /app/build/libs/*.jar app.jar

# Map the dynamically provided PORT environment variable, defaulting to 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -XX:TieredStopAtLevel=1 -noverify -jar /app/app.jar"]
