FROM gradle:9.4.0-jdk25-alpine as build

WORKDIR /app

COPY settings.gradle build.gradle gradlew ./
COPY gradle ./gradle
COPY src ./src

RUN gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:25-jre
WORKDIR /app

# Environment variables from application.properties
ENV SPRING_APPLICATION_NAME="latech-renderer"
ENV SPRING_DOCKER_COMPOSE_ENABLED="false"
ENV SPRING_GRPC_SERVER_PORT="9090"
# Easily enable the reflection service for tools like grpcurl
ENV SPRING_GRPC_SERVER_REFLECTION_ENABLED="true"

EXPOSE 8090
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
