FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/skillbridge-ai-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
