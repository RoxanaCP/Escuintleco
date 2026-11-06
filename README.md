# Las Casas del Escuintleco

[![CI/CD Pipeline](https://github.com/RoxanaCP/Escuintleco/actions/workflows/ci.yml/badge.svg)](https://github.com/RoxanaCP/Escuintleco/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=RoxanaCP_Escuintleco&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=RoxanaCP_Escuintleco)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=RoxanaCP_Escuintleco&metric=coverage)](https://sonarcloud.io/summary/new_code?id=RoxanaCP_Escuintleco)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=RoxanaCP_Escuintleco&metric=bugs)](https://sonarcloud.io/summary/new_code?id=RoxanaCP_Escuintleco)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=RoxanaCP_Escuintleco&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=RoxanaCP_Escuintleco)

Sistema de punto de venta full-stack con un pipeline de Integración Continua /
Entrega Continua (CI/CD) y controles de Aseguramiento de la Calidad del Software (SQA).

---

## Descripción del Proyecto

"Las Casas del Escuintleco" es un sistema de punto de venta para un negocio que
vende productos a colonias residenciales. Permite gestionar el inventario, procesar
ventas, generar facturas con código QR y controlar clientes y proveedores.

Sobre esta aplicación base se implementó un pipeline CI/CD con controles automáticos
de calidad: pruebas automatizadas, cobertura de código con umbrales, análisis estático
con SonarCloud, quality gates y protección de la rama principal.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 + Spring Boot 3.2.5 |
| Frontend | Angular 22 + SCSS |
| Base de datos | MySQL 8 |
| CI/CD | GitHub Actions |
| Análisis estático | SonarCloud + ESLint |
| Pruebas backend | JUnit 5 + Mockito + Spring Boot Test (MockMvc) |
| Pruebas frontend | Jasmine + Karma |
| Pruebas E2E | Postman + Newman |
| Cobertura | JaCoCo (backend) + Istanbul (frontend) |

---

## Instrucciones de Instalación

### Requisitos previos
- Java 21 (JDK)
- Maven 3.9+
- Node.js 22+ y Angular CLI 22
- MySQL 8

### 1. Base de datos
Crear la base de datos ejecutando el script en MySQL:
```
escuintleco/database/escuintleco_db.sql
```

### 2. Backend
```
cd escuintleco/backend
mvn spring-boot:run
```
El backend queda disponible en `http://localhost:8080`.

> Configura tu usuario/contraseña de MySQL mediante las variables de entorno
> `DB_USERNAME` y `DB_PASSWORD` (por defecto `root`/`root`).

### 3. Frontend
```
cd escuintleco/frontend
npm install --legacy-peer-deps
ng serve
```
El frontend queda disponible en `http://localhost:4200`.

### Usuarios de prueba
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | ADMIN |
| cajero1 | cajero123 | CAJERO |

---

## Ejecutar las pruebas

### Backend (con cobertura)
```
cd escuintleco/backend
mvn verify
```

### Frontend (con cobertura, headless)
```
cd escuintleco/frontend
npm run test:ci
```

### Linter del frontend
```
cd escuintleco/frontend
npm run lint
```

---

## Pipeline CI/CD

El pipeline (`.github/workflows/ci.yml`) se ejecuta automáticamente en cada Pull
Request y push a `main`, con 4 etapas:

1. **Build** — compila el backend y construye el frontend
2. **Test** — ejecuta pruebas unitarias, de integración y E2E, con cobertura
3. **Analyze** — análisis estático con SonarCloud y evaluación del Quality Gate
4. **Report** — publica los reportes de cobertura y un resumen del run

La rama `main` está protegida: todo cambio debe entrar por Pull Request y el pipeline
debe aprobar antes de permitir el merge.

Última verificación del pipeline: demostración de flujo de Pull Request.

---

## Documentación

Toda la documentación está en la carpeta [`docs/`](docs/):

- [Plan de Aseguramiento de la Calidad (SQA Plan)](docs/PLAN-SQA.md)
- [Reporte de Métricas (antes/después)](docs/METRICAS.md)
- [Guía Técnica y Manual de Uso](docs/GUIA-TECNICA.md)
