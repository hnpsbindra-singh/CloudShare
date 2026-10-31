# Stage 1: Build Spring Boot JAR using Maven image
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create lightweight JRE 17 runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user execution for container security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
