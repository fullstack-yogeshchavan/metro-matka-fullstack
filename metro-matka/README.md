# Metro Matka - Full Stack Lottery System

## Versions (FIXED)
- Java: 17
- Spring Boot: 3.1.8
- jjwt: 0.11.5
- Angular: 17.3.12
- @angular/cli: 17.3.11
- Node: 20+
- PostgreSQL: 16

## Quick Start (Docker)
    docker compose up --build

- Frontend: http://localhost:4200
- Backend:  http://localhost:8080/api
- Swagger:  http://localhost:8080/api/swagger-ui.html

## Manual Setup

### Prerequisites
- JDK 17 (set JAVA_HOME)
- Maven 3.9+
- Node 20+ with npm
- PostgreSQL 16

### IntelliJ IDEA Setup
1. File > Project Structure > Project SDK: 17
2. File > Project Structure > Modules > Sources: Language Level 17
3. Settings > Build > Compiler > Java Compiler: Target bytecode version 17

### Backend
    cd backend
    mvn spring-boot:run

### Frontend
    cd frontend
    npm install
    ng serve

## Default Login
| Role  | Username | Password   |
|-------|----------|------------|
| Admin | admin    | Admin@1234 |

## Version Compatibility Matrix
| Angular CLI | Angular | Node    | TypeScript |
|-------------|---------|---------|------------|
| 17.3.x      | 17.x    | ^18/^20 | >=5.2 <5.5 |
