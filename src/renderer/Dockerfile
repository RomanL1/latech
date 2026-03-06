FROM gradle:9.4.0-jdk25-alpine as build

WORKDIR /app

COPY settings.gradle build.gradle gradlew ./
COPY gradle ./gradle
COPY src ./src

RUN gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:25-jre
WORKDIR /app

EXPOSE 8090
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
