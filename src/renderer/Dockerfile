FROM eclipse-temurin:25-jdk-jammy AS build

WORKDIR /app

COPY settings.gradle build.gradle gradlew ./
COPY gradle/ ./gradle/
COPY src/ ./src/

RUN ./gradlew bootJar --no-daemon -x test


FROM eclipse-temurin:25-jre-jammy
WORKDIR /app

# Install Docker CLI (for DooD - Docker out of Docker)
RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
      > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-science \
    lmodern \
    && rm -rf /var/lib/apt/lists/*

# Environment variables from application.properties
ENV SPRING_APPLICATION_NAME="latech-renderer"

# RabbitMQ Configuration
ENV RABBITMQ_HOST="localhost"
ENV RABBITMQ_PORT="5672"
ENV RABBITMQ_USERNAME="admin"
ENV RABBITMQ_PASSWORD="your_secure_password_here"

# SeaweedFS Configuration
ENV SEAWEEDFS_HOST="localhost"
ENV SEAWEEDFS_PORT="8333"
ENV SEAWEEDFS_ACCESS_KEY="changeme"
ENV SEAWEEDFS_SECRET_KEY="changeme"
ENV SEAWEEDFS_BUCKET="renderer"

EXPOSE ${PORT:-8090}
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-Dserver.port=${PORT:-8090}", "-XX:TieredStopAtLevel=1", "-noverify", "-jar", "/app/app.jar"]
