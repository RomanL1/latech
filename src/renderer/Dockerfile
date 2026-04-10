FROM eclipse-temurin:25-jdk-jammy AS build

WORKDIR /app

COPY settings.gradle build.gradle gradlew ./
COPY gradle/ ./gradle/
COPY src/ ./src/

RUN ./gradlew bootJar --no-daemon -x test


FROM eclipse-temurin:25-jre-jammy
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-science \
    && rm -rf /var/lib/apt/lists/*

# Environment variables from application.properties
ENV SPRING_APPLICATION_NAME="latech-renderer"

# RabbitMQ Configuration
ENV RABBITMQ_HOST="localhost"
ENV RABBITMQ_PORT="5672"
ENV RABBITMQ_USERNAME="admin"
ENV RABBITMQ_PASSWORD="your_secure_password_here"


EXPOSE ${PORT:-8090}
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-Dserver.port=${PORT:-8090} -XX:TieredStopAtLevel=1", "-noverify", "-jar", "/app/app.jar"]
