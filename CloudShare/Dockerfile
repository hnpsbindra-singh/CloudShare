# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy Maven dependency definition and wrapper
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

# Download dependencies offline for faster caching
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Create production JRE 17 runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user execution for container security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy compiled JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Render default port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
